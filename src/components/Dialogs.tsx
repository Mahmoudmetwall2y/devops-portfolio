import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, Terminal, X } from 'lucide-react';
import { projects, projectPath, type Project } from '../data/projects';
import { ProjectCaseContent } from './ProjectCaseContent';
import { GithubIcon } from './Icons';

export function Modal({ label, onClose, children, className = '', fallbackFocusSelector = '.search-button', initialFocusSelector }: { label: string; onClose: () => void; children: ReactNode; className?: string; fallbackFocusSelector?: string; initialFocusSelector?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null);
  useEffect(() => {
    const dialog = ref.current;
    const previousOverflow = document.body.style.overflow;
    if (dialog && !dialog.open) dialog.showModal();
    if (initialFocusSelector) dialog?.querySelector<HTMLElement>(initialFocusSelector)?.focus({ preventScroll: true });
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog?.open) dialog.close();
      const target = returnFocus.current?.isConnected ? returnFocus.current : document.querySelector<HTMLElement>(fallbackFocusSelector);
      // A live motion-preference change can briefly hide the intro's trigger.
      // Retry only during that transition; never steal focus from another modal.
      const deadline = performance.now() + 2000;
      function restoreFocus() {
        if (!target?.isConnected || document.querySelector('dialog[open]') || performance.now() > deadline) return;
        target.focus({ preventScroll: true });
        if (document.activeElement !== target) requestAnimationFrame(restoreFocus);
      }
      restoreFocus();
    };
  }, []);
  return <dialog ref={ref} aria-label={label} className={`modal ${className}`} onCancel={(event) => { event.preventDefault(); onClose(); }} onClose={(event) => { if (!event.currentTarget.open) onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal-inner">{children}</div></dialog>;
}

export function ProjectDialog({ project, onClose, fallbackFocusSelector }: { project: Project; onClose: () => void; fallbackFocusSelector?: string }) {
  const study = project.caseStudy;
  const toolbar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = toolbar.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const height = entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height;
      element.closest('dialog')?.style.setProperty('--case-toolbar-height', `${Math.ceil(height)}px`);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const sectionId = (section: string) => `case-${project.id}-${section}`;
  return (
    <Modal label={`${project.title} case study`} onClose={onClose} className="project-modal" fallbackFocusSelector={fallbackFocusSelector}>
      <div className="modal-top" ref={toolbar}><span className="eyebrow">PROJECT {project.number} / {project.kind}</span><button type="button" className="icon-button" onClick={onClose} aria-label="Close case study" autoFocus><X size={21} /></button></div>
      <h2>{project.title}</h2>
      <p className="case-review-status"><span>{study.status}</span><a href={`${project.repo}/commit/${study.revision}`} target="_blank" rel="noreferrer">Reviewed revision {study.revision.slice(0, 7)} <ArrowUpRight size={14} aria-hidden="true" /></a></p>
      {study.learningContext && <p className="case-learning-context">{study.learningContext} · application foundation credited below</p>}
      <p className="modal-description">{project.description}</p>
      <a className="text-link case-documentation-link" href={projectPath(project)}>Read full project documentation <ArrowUpRight size={17} aria-hidden="true" /></a>
      <div className="tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      <nav className="case-navigation" aria-label={`${project.title} case study sections`}>{[['architecture', 'Architecture'], ['implementation', 'Implementation'], ['decisions', 'Decisions'], ['delivery', 'Delivery'], ['evidence', 'Evidence']].map(([id, label]) => <a key={id} href={`#${sectionId(id)}`} onClick={(event) => { event.preventDefault(); const target = document.getElementById(sectionId(id)); target?.focus({ preventScroll: true }); target?.scrollIntoView({ block: 'start', behavior: 'instant' }); }}>{label}</a>)}</nav>
      <ProjectCaseContent project={project} />
      <a className="button button-dark modal-repo" href={project.repo} target="_blank" rel="noreferrer"><GithubIcon width={18} height={18} /> View full repository <ArrowUpRight size={17} /></a>
      {project.foundation && <p className="project-foundation">Application foundation: <a href={project.foundation.url} target="_blank" rel="noreferrer">{project.foundation.label} <ArrowUpRight size={12} /></a></p>}
      <a href="#work" className="case-back-button text-link" onClick={onClose}>Back to projects <ArrowDown size={16} aria-hidden="true" /></a>
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
      <div className="command-search"><Terminal size={20} /><input aria-label="Search sections, projects, or tools" placeholder="Search portfolio…" value={query} onChange={(event) => setQuery(event.target.value)} autoFocus /><button type="button" className="key-button" onClick={onClose} aria-label="Close search">ESC</button></div>
      <div className="command-results">{filteredNavigation.length > 0 && <><span className="eyebrow">JUMP TO</span>{filteredNavigation.map((item) => <a key={item.href} href={item.href} onClick={onClose}><span>{item.name}</span><ArrowDown size={16} /></a>)}</>}{filteredProjects.length > 0 && <><span className="eyebrow">PROJECTS</span>{filteredProjects.map((project) => <button type="button" key={project.id} onClick={() => onProject(project)}><div><strong>{project.title}</strong><small>{project.tags.slice(0, 3).join(' / ')}</small></div><ArrowUpRight size={17} /></button>)}</>}{filteredNavigation.length + filteredProjects.length === 0 && <p className="no-results">No matches for “{query}”. Try Kubernetes, Docker, or contact.</p>}</div>
      <div className="command-footer"><span>LESS SEARCHING. MORE FINDING.</span><span>ESC TO CLOSE</span></div>
    </Modal>
  );
}
