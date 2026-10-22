import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUpRight, CornerDownLeft, Terminal, X } from 'lucide-react';
import { aboutParagraphs, contactEmail, experience, githubUrl, linkedinUrl, profileName, resumeUrl } from '../data/profile';
import { projects, type Project } from '../data/projects';
import { toolkit } from '../data/toolkit';
import { commandDescriptions, completeCommand, normalizeCommand, parseCommand, suggestCommand, supportedCommands, terminalHistoryLimit, terminalInputLimit, type PortfolioCommand } from '../data/terminal';
import { Modal } from './Dialogs';

type Entry = { id: number; input: string; command: PortfolioCommand | null };
type Props = { open: boolean; onClose: () => void; onProject: (project: Project) => void };

function Prompt() {
  return <span className="portfolio-terminal-prompt"><span>mahmoud@linux</span>:<span>~/portfolio</span>$</span>;
}

function Output({ entry, onProject, onCommand, onClose }: { entry: Entry; onProject: Props['onProject']; onCommand: (command: string) => void; onClose: () => void }) {
  const command = entry.command;
  if (!command) return <p>Command not found: <span className="portfolio-terminal-error">{entry.input}</span><br />{suggestCommand(entry.input)}</p>;
  if (command === 'help') return <><p>Choose a command below, or type one at the prompt.</p><dl className="portfolio-terminal-help">{supportedCommands.map((item) => <div key={item}><dt><button type="button" onClick={() => onCommand(item)}>{item}</button></dt><dd>{commandDescriptions[item]}</dd></div>)}</dl></>;
  if (command === 'whoami') return <><p><strong>{profileName}</strong><br />{experience[0].role} · {experience[0].company}</p><p>{aboutParagraphs[0]}</p></>;
  if (command === 'pwd') return <p>/home/mahmoud/portfolio <span className="portfolio-terminal-muted">(virtual directory)</span></p>;
  if (command === 'ls') return <div className="portfolio-terminal-files">{[['projects/', 'projects'], ['experience/', 'ls experience'], ['skills/', 'skills'], ['about.md', 'cat about.md'], ['experience.md', 'cat experience.md'], ['toolkit.conf', 'cat toolkit.conf']].map(([label, item]) => <button type="button" key={label} onClick={() => onCommand(item)}>{label}</button>)}</div>;
  if (command === 'projects' || command === 'ls projects') return <><p>{projects.length} engineering projects. Select a project below or type <code>open project</code> followed by its number.</p><ul className="portfolio-terminal-list">{projects.map((project) => <li key={project.id}><button type="button" onClick={() => onProject(project)} aria-label={`Open ${project.title} documentation`}><span>{project.number} / {project.title}</span><ArrowUpRight size={16} aria-hidden="true" /></button><p>{project.summary}</p><p className="portfolio-terminal-muted">{project.tags.join(' · ')}</p></li>)}</ul></>;
  if (command === 'cat about.md') return <>{aboutParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<a href="#about" onClick={onClose}>Go to About <ArrowUpRight size={15} aria-hidden="true" /></a></>;
  if (command === 'ls experience' || command === 'cat experience.md') return <ul className="portfolio-terminal-list">{experience.map((item) => <li key={item.company}><p><strong>{item.role} / {item.company}</strong><br /><span className="portfolio-terminal-muted">{item.period}</span></p>{command === 'cat experience.md' && <p>{item.details}</p>}</li>)}</ul>;
  if (command === 'skills' || command === 'ls skills' || command === 'cat toolkit.conf') return <ul className="portfolio-terminal-list">{toolkit.map((item) => <li key={item.number}><p><strong>{item.title}</strong><br />{item.tools.join(' · ')}</p>{command === 'cat toolkit.conf' && <p className="portfolio-terminal-muted">{item.detail}</p>}</li>)}</ul>;
  if (command === 'contact') return <div className="portfolio-terminal-contact"><a href={`mailto:${contactEmail}`}>{contactEmail}</a><a href={githubUrl} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} aria-hidden="true" /></a><a href={linkedinUrl} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={15} aria-hidden="true" /></a><a href={resumeUrl} download="Mahmoud-Metwally-CV.pdf">Download CV</a><a href="#contact" onClick={onClose}>Go to contact</a></div>;
  if (command.startsWith('open project ')) return <p>Opening the {projects[Number(command.slice('open project '.length)) - 1].title} documentation.</p>;
  return null;
}

function announce(command: PortfolioCommand | null) {
  if (!command) return 'Command not found. Type help for available commands.';
  if (command === 'projects' || command === 'ls projects') return `Listed ${projects.length} engineering projects. Select a listed project or use open project followed by its number.`;
  if (command === 'whoami') return `${profileName}. ${experience[0].role} at ${experience[0].company}.`;
  if (command === 'pwd') return 'Virtual directory: /home/mahmoud/portfolio.';
  if (command === 'help') return `Listed ${supportedCommands.length} commands. Arrow keys recall history. Tab completes a command.`;
  return `${commandDescriptions[command]}. Output is available in the Terminal output region.`;
}

export default function TerminalDialog({ open, onClose, onProject }: Props) {
  // Keep this session local to the mounted app. Closing a dialog does not erase it.
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState({ id: 0, text: '' });
  const field = useRef<HTMLInputElement>(null);
  const output = useRef<HTMLDivElement>(null);
  const sequence = useRef(0);
  const historyPosition = useRef<number | null>(null);
  const draft = useRef('');
  const completion = useRef<{ candidates: PortfolioCommand[]; index: number } | null>(null);

  useEffect(() => {
    if (!open || !output.current) return;
    const latest = output.current.querySelector<HTMLElement>('.portfolio-terminal-entry:last-child');
    output.current.scrollTop = latest?.offsetTop ?? 0;
  }, [entries, open]);

  useEffect(() => {
    if (!open) return;
    if (!window.visualViewport) return;
    const viewport = window.visualViewport;
    const dialog = field.current?.closest('dialog');
    const resize = () => dialog?.style.setProperty('--terminal-viewport-height', `${viewport.height}px`);
    resize();
    viewport.addEventListener('resize', resize);
    return () => viewport.removeEventListener('resize', resize);
  }, [open]);

  function notify(text: string) { setAnnouncement({ id: ++sequence.current, text }); }
  function run(value: string) {
    const raw = value.slice(0, terminalInputLimit);
    const normalized = normalizeCommand(raw);
    if (!normalized) return;
    const command = parseCommand(raw);
    setInput('');
    historyPosition.current = null;
    completion.current = null;
    setHistory((previous) => [...previous, raw].slice(-terminalHistoryLimit));
    if (command === 'exit') { onClose(); return; }
    if (command === 'clear') { setEntries([]); notify('Terminal output cleared. Command history retained.'); }
    else {
      setEntries((previous) => [...previous, { id: ++sequence.current, input: raw, command }].slice(-terminalHistoryLimit));
      notify(announce(command));
      if (command?.startsWith('open project ')) { onProject(projects[Number(command.slice('open project '.length)) - 1]); return; }
    }
    field.current?.focus({ preventScroll: true });
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.nativeEvent.isComposing) return;
    if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && history.length) {
      event.preventDefault();
      completion.current = null;
      if (historyPosition.current === null) {
        if (event.key === 'ArrowDown') return;
        draft.current = input;
        historyPosition.current = history.length;
      }
      const next = Math.max(0, Math.min(history.length, historyPosition.current + (event.key === 'ArrowUp' ? -1 : 1)));
      historyPosition.current = next === history.length ? null : next;
      setInput(next === history.length ? draft.current : history[next]);
    }
    if (event.key === 'Tab') {
      const candidates = completion.current?.candidates ?? completeCommand(input);
      if (!candidates.length) return; // Empty input and Shift+Tab retain normal focus navigation.
      if (candidates.length === 1 && input === candidates[0]) return;
      event.preventDefault();
      const index = completion.current ? (completion.current.index + 1) % candidates.length : 0;
      completion.current = { candidates, index };
      setInput(candidates[index]);
      notify(candidates.length === 1 ? `Completed ${candidates[index]}.` : `${candidates[index]}. ${candidates.length} matches; Tab cycles through them.`);
    }
  }

  if (!open) return null;
  return <Modal label="Portfolio terminal" onClose={onClose} className="portfolio-terminal-modal" fallbackFocusSelector=".open-terminal-button" initialFocusSelector="#portfolio-terminal-input">
    <div className="portfolio-terminal-titlebar"><div><Terminal size={18} aria-hidden="true" /><strong>Portfolio terminal</strong></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close terminal"><X size={20} /></button></div>
    <p className="portfolio-terminal-notice" id="portfolio-terminal-notice">Local portfolio simulation. No commands run on a server.</p>
    <div ref={output} className="portfolio-terminal-output" role="region" aria-label="Terminal output" tabIndex={0}>
      <div className="portfolio-terminal-welcome"><p>Welcome to Mahmoud’s engineering workspace.</p><p>Type <button type="button" onClick={() => run('help')}>help</button> to explore, or start with <button type="button" onClick={() => run('projects')}>projects</button>.</p></div>
      {entries.map((entry) => <section className="portfolio-terminal-entry" key={entry.id}><div className="portfolio-terminal-echo"><Prompt /><span>{entry.input}</span></div><div className="portfolio-terminal-reply"><Output entry={entry} onCommand={run} onProject={onProject} onClose={onClose} /></div></section>)}
    </div>
    <form className="portfolio-terminal-form" onSubmit={(event) => { event.preventDefault(); run(input); }}>
      <label className="portfolio-terminal-input-label" htmlFor="portfolio-terminal-input"><Prompt /><span className="portfolio-terminal-cursor" aria-hidden="true" /></label>
      <div className="portfolio-terminal-input-row"><input ref={field} id="portfolio-terminal-input" aria-label="Terminal command" aria-describedby="portfolio-terminal-keys portfolio-terminal-notice" value={input} maxLength={terminalInputLimit} onChange={(event) => { setInput(event.target.value); historyPosition.current = null; completion.current = null; }} onKeyDown={handleKey} autoFocus autoComplete="off" autoCapitalize="none" spellCheck={false} enterKeyHint="send" placeholder="Type help to begin" /><button type="submit" aria-label="Run command"><CornerDownLeft size={19} aria-hidden="true" /></button></div>
      <p id="portfolio-terminal-keys" className="portfolio-terminal-keys">↑↓ History · Tab Complete · Esc Close</p>
    </form>
    <div className="portfolio-terminal-announcement" role="status" aria-live="polite" aria-atomic="true"><span key={announcement.id}>{announcement.text}</span></div>
  </Modal>;
}
