import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, Terminal, X } from 'lucide-react';
import { projects, type Project } from '../data/projects';
import ProjectGraphic from './ArchitectureGraphic';
import { GithubIcon } from './Icons';

function Modal({ label, onClose, children, className = '' }: { label: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null);
  useEffect(() => {
    const dialog = ref.current;
    const previousOverflow = document.body.style.overflow;
    if (dialog && !dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog?.open) dialog.close();
      const target = returnFocus.current?.isConnected ? returnFocus.current : document.querySelector<HTMLButtonElement>('.search-button');
      target?.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={ref} aria-label={label} className={`modal ${className}`} onClose={(event) => { if (!event.currentTarget.open) onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal-inner">{children}</div></dialog>;
}

export function ProjectDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <Modal label={`${project.title} case study`} onClose={onClose} className="project-modal">
      <div className="modal-top"><span className="eyebrow">PROJECT {project.number} / {project.kind}</span><button type="button" className="icon-button" onClick={onClose} aria-label="Close case study" autoFocus><X size={21} /></button></div>
      <h2>{project.title}</h2>
      <p className="modal-description">{project.description}</p>
      <div className="tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      <ProjectGraphic id={project.id} compact />
      <div className="case-content"><section><span className="eyebrow">THE CHALLENGE</span><p>{project.challenge}</p></section><section><span className="eyebrow">THE APPROACH</span><ul>{project.approach.map((item) => <li key={item}>{item}</li>)}</ul></section><section><span className="eyebrow">EXPLORE THE IMPLEMENTATION</span><div className="evidence-list">{project.evidence.map((item) => <a key={item.label} href={item.url} target="_blank" rel="noreferrer"><div><strong>{item.label}</strong><p>{item.detail}</p></div><ArrowUpRight size={18} /></a>)}</div></section></div>
      <a className="button button-dark modal-repo" href={project.repo} target="_blank" rel="noreferrer"><GithubIcon width={18} height={18} /> View full repository <ArrowUpRight size={17} /></a>
      {project.foundation && <p className="project-foundation">Application foundation: <a href={project.foundation.url} target="_blank" rel="noreferrer">{project.foundation.label} <ArrowUpRight size={12} /></a></p>}
    </Modal>
  );
}

export function CommandDialog({ onClose, onProject }: { onClose: () => void; onProject: (project: Project) => void }) {
  const [query, setQuery] = useState('');
  const navigation = [{ name: 'Selected work', href: '#work' }, { name: 'About Mahmoud', href: '#about' }, { name: 'Experience & education', href: '#experience' }, { name: 'Tools & capabilities', href: '#toolkit' }, { name: 'Get in touch', href: '#contact' }];
  const search = query.trim().toLowerCase();
  const filteredNavigation = navigation.filter((item) => `${item.name} ${item.href}`.toLowerCase().includes(search));
  const filteredProjects = projects.filter((project) => `${project.title} ${project.tags.join(' ')} ${project.summary}`.toLowerCase().includes(search));
  return (
    <Modal label="Search this portfolio" onClose={onClose} className="command-modal">
      <div className="command-search"><Terminal size={20} /><input aria-label="Search sections, projects, or tools" placeholder="Find a project, tool, or section…" value={query} onChange={(event) => setQuery(event.target.value)} autoFocus /><button type="button" className="key-button" onClick={onClose} aria-label="Close search">ESC</button></div>
      <div className="command-results">{filteredNavigation.length > 0 && <><span className="eyebrow">JUMP TO</span>{filteredNavigation.map((item) => <a key={item.href} href={item.href} onClick={onClose}><span>{item.name}</span><ArrowDown size={16} /></a>)}</>}{filteredProjects.length > 0 && <><span className="eyebrow">PROJECTS</span>{filteredProjects.map((project) => <button type="button" key={project.id} onClick={() => onProject(project)}><div><strong>{project.title}</strong><small>{project.tags.slice(0, 3).join(' / ')}</small></div><ArrowUpRight size={17} /></button>)}</>}{filteredNavigation.length + filteredProjects.length === 0 && <p className="no-results">No matches for “{query}”. Try Kubernetes, Docker, or contact.</p>}</div>
      <div className="command-footer"><span>LESS SEARCHING. MORE FINDING.</span><span>ESC TO CLOSE</span></div>
    </Modal>
  );
}
