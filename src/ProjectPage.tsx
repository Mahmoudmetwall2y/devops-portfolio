import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, FileCode2, List, Terminal } from 'lucide-react';
import { projects, projectPath, sourcePath, type Project } from './data/projects';
import { documentation, type Documentation } from './data/projectDocumentation';
import { ProjectCaseContent, caseStudySections } from './components/ProjectCaseContent';
import { BrandMark, GithubIcon } from './components/Icons';
import { profile } from './data/profile';
import { useReducedMotion } from './hooks/useReducedMotion';
import './project-page.css';

const outline = [
  ['overview', 'Project overview'], ...caseStudySections.slice(0, 7),
  ['repository', 'Repository guide'], ['prerequisites', 'Environment and prerequisites'],
  ['walkthrough', 'Implementation walkthrough'], ['validation', 'Validation commands'],
  ['troubleshooting', 'Troubleshooting'], ...caseStudySections.slice(7),
] as const;

function CodeSample({ title, detail, code, source, project }: Documentation['commands'][number] & { project: Project }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  async function copy() {
    try { await navigator.clipboard.writeText(code); setState('copied'); }
    catch { setState('failed'); }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2500);
  }
  return <div className="doc-command"><h3>{title}</h3><p>{detail}</p><div className="doc-code-toolbar"><span>Shell / inspection example</span><button type="button" onClick={copy} aria-label={`Copy ${title} commands`}>{state === 'copied' ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />} {state === 'copied' ? 'Copied' : 'Copy'}</button></div><pre tabIndex={0} aria-label={`${title} commands`}><code>{code}</code></pre><p className="doc-copy-status" role="status">{state === 'failed' ? 'Copy unavailable. Select and copy the commands above.' : state === 'copied' ? 'Commands copied to clipboard.' : ''}</p>{source && <a className="doc-source" href={sourcePath(project, source)} target="_blank" rel="noreferrer">Inspect source <ArrowUpRight size={14} aria-hidden="true" /></a>}</div>;
}

function ProjectArticle({ project }: { project: Project }) {
  const guide = documentation[project.id];
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState('overview');
  const [contentsOpen, setContentsOpen] = useState(() => window.matchMedia('(min-width: 1100px)').matches);
  const header = useRef<HTMLElement>(null);
  const prefix = `doc-${project.id}`;
  const id = (section: string) => `${prefix}-${section}`;
  const next = projects[(projects.findIndex(item => item.id === project.id) + 1) % projects.length];
  const words = JSON.stringify({ project, guide }).split(/\s+/).length;

  useEffect(() => {
    document.title = `${project.title} — Engineering documentation | ${profile.displayName}`;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', project.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${profile.siteUrl}${projectPath(project)}`);
    const observer = new ResizeObserver(([entry]) => document.documentElement.style.setProperty('--documentation-header-height', `${Math.ceil(entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height)}px`));
    if (header.current) observer.observe(header.current);
    const intersection = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id.replace(`${prefix}-`, ''));
    }, { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('article h2[id]').forEach(element => intersection.observe(element));
    const frame = requestAnimationFrame(() => {
      const hash = window.location.hash.slice(1);
      if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: 'instant' });
    });
    const media = window.matchMedia('(min-width: 1100px)');
    const resize = () => setContentsOpen(media.matches);
    media.addEventListener('change', resize);
    return () => { observer.disconnect(); intersection.disconnect(); cancelAnimationFrame(frame); media.removeEventListener('change', resize); document.documentElement.style.removeProperty('--documentation-header-height'); };
  }, [project, prefix]);

  function jump(event: MouseEvent<HTMLAnchorElement>, section: string) {
    // Preserve native new-tab and modified-click behavior for article anchors.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const target = document.getElementById(id(section));
    if (!target) return;
    history.pushState(null, '', `#${id(section)}`);
    setActive(section);
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
  }

  return <div className={`project-documentation ${reducedMotion ? 'motion-reduced' : 'motion-enabled'}`}>
    <a className="skip-link" href="#project-article">Skip to documentation</a>
    <header className="doc-header" ref={header}><div className="doc-width doc-header-inner"><a href="/" className="doc-brand" aria-label={`${profile.displayName} home`}><span><BrandMark width={28} height={28} /></span><strong>{profile.brandName}<span>.</span></strong></a><nav aria-label="Project navigation"><a href="/#work"><ArrowLeft size={16} aria-hidden="true" /> All projects</a><a href={project.repo} aria-label="View project source on GitHub" target="_blank" rel="noreferrer"><GithubIcon width={17} height={17} aria-hidden="true" /><span>Source code</span><ArrowUpRight size={15} aria-hidden="true" /></a></nav></div></header>
    <main className="doc-width" id="project-article" tabIndex={-1}>
      <div className="doc-breadcrumb"><a href="/">Portfolio</a><span aria-hidden="true">/</span><a href="/#work">Projects</a><span aria-hidden="true">/</span><span>{project.title}</span></div>
      <div className="doc-masthead"><p className="doc-kicker"><span><i /> ENGINEERING NOTES / {project.number}</span><span>~{Math.max(5, Math.ceil(words / 200))} MIN READ</span></p><h1>{project.title}</h1><p className="doc-subtitle">{guide.subtitle}</p><p className="doc-deck">{project.description}</p><div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="doc-meta"><span>By {profile.displayName}</span><span>{project.caseStudy.status}</span><a href={`${project.repo}/commit/${project.caseStudy.revision}`} target="_blank" rel="noreferrer">Reviewed revision {project.caseStudy.revision.slice(0, 7)} <ArrowUpRight size={14} aria-hidden="true" /></a></div></div>
      <div className="doc-filebar"><span className="terminal-window-dots" aria-hidden="true"><i /><i /><i /></span><span><FileCode2 size={16} aria-hidden="true" /> docs/{project.id}.md</span><span>TECHNICAL WALKTHROUGH</span></div>
      <div className="doc-layout">
        <aside className="doc-sidebar"><details className="doc-contents" open={contentsOpen} onToggle={event => setContentsOpen(event.currentTarget.open)}><summary><List size={17} aria-hidden="true" /> On this page <span aria-hidden="true">{contentsOpen ? '−' : '+'}</span></summary><nav aria-label="Documentation contents"><ol>{outline.map(([section, label], index) => <li key={section}><a href={`#${id(section)}`} onClick={event => jump(event, section)} aria-current={active === section ? 'location' : undefined}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{label}</a></li>)}</ol></nav></details><p className="doc-side-note"><Terminal size={16} aria-hidden="true" /> {guide.focus}</p></aside>
        <article aria-label={`${project.title} documentation`}>
          <section className="doc-overview" aria-labelledby={id('overview')}><span className="eyebrow">01 / THE SYSTEM AT A GLANCE</span><h2 id={id('overview')} tabIndex={-1}>Project overview</h2><p>{project.summary}</p><dl className="doc-facts"><div><dt>Engineering focus</dt><dd>{guide.focus}</dd></div><div><dt>Evidence boundary</dt><dd>{project.caseStudy.verification.summary}</dd></div>{project.caseStudy.learningContext && <div><dt>Learning context</dt><dd>{project.caseStudy.learningContext}</dd></div>}</dl></section>
          <ProjectCaseContent project={project} level={2} prefix={prefix} only={['architecture', 'challenge', 'implementation', 'decisions', 'delivery', 'security', 'observability']} />
          <section aria-labelledby={id('repository')}><h2 id={id('repository')} tabIndex={-1}>Repository guide</h2><p>Start with these files and directories. Links point to the reviewed revision so the explanation remains tied to its source.</p><dl className="doc-repository">{guide.repository.map(item => <div key={item.path}><dt><a href={sourcePath(project, item.path)} target="_blank" rel="noreferrer">{item.path}<ArrowUpRight size={14} aria-hidden="true" /></a></dt><dd>{item.purpose}</dd></div>)}</dl></section>
          <section aria-labelledby={id('prerequisites')}><h2 id={id('prerequisites')} tabIndex={-1}>Environment and prerequisites</h2>{guide.prerequisites.map(item => <div className="doc-explanation" key={item.title}><h3>{item.title}</h3><p>{item.detail}</p></div>)}</section>
          <section aria-labelledby={id('walkthrough')}><h2 id={id('walkthrough')} tabIndex={-1}>Implementation walkthrough</h2><ol className="doc-walkthrough">{guide.walkthrough.map((item, index) => <li key={item.title}><span className="doc-step" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h3>{item.title}</h3><p>{item.detail}</p><a className="doc-source" href={sourcePath(project, item.source)} target="_blank" rel="noreferrer">Inspect source <ArrowUpRight size={14} aria-hidden="true" /></a></div></li>)}</ol></section>
          <section aria-labelledby={id('validation')}><h2 id={id('validation')} tabIndex={-1}>Validation commands</h2><p>Examples for a separately prepared environment. These commands have not been executed as part of this documentation review; they are not recorded test results.</p>{guide.commands.map(command => <CodeSample key={command.title} {...command} project={project} />)}</section>
          <section aria-labelledby={id('troubleshooting')}><h2 id={id('troubleshooting')} tabIndex={-1}>Troubleshooting</h2><p>Diagnostic paths inferred from the configuration, rather than claims about incidents that occurred.</p><dl className="doc-troubleshooting">{guide.troubleshooting.map(item => <div key={item.symptom}><dt>{item.symptom}</dt><dd>{item.checks}</dd></div>)}</dl></section>
          <ProjectCaseContent project={project} level={2} prefix={prefix} only={['evidence', 'lessons', 'next']} />
          {project.foundation && <p className="doc-attribution">Application foundation: <a href={project.foundation.url} target="_blank" rel="noreferrer">{project.foundation.label} <ArrowUpRight size={14} aria-hidden="true" /></a>{project.id === 'ultimate-devops' && <> · <a href="https://github.com/open-telemetry/opentelemetry-demo" target="_blank" rel="noreferrer">OpenTelemetry Astronomy Shop</a></>}</p>}
          <nav className="doc-end-nav" aria-label="Continue reading"><a href="/#work"><ArrowLeft size={17} aria-hidden="true" /> Back to projects</a><a href={projectPath(next)}><span>Next project<strong>{next.title}</strong></span><ArrowRight size={20} aria-hidden="true" /></a></nav>
        </article>
      </div>
    </main>
    <footer className="doc-footer doc-width"><span>{profile.displayName.toUpperCase()} / ENGINEERING NOTES</span><a href="/#contact">Let’s talk <ArrowUpRight size={16} aria-hidden="true" /></a></footer>
  </div>;
}

export default function ProjectPage() {
  const match = window.location.pathname.match(/^\/projects\/([^/]+)\/?$/);
  const project = projects.find(item => item.id === match?.[1]);
  useEffect(() => { if (!project) { document.title = `Project not found | ${profile.displayName}`; const tag = document.createElement('meta'); tag.name = 'robots'; tag.content = 'noindex'; document.head.append(tag); return () => tag.remove(); } }, [project]);
  if (!project) return <main className="doc-width doc-not-found"><p className="eyebrow">404 / PROJECT NOT FOUND</p><h1>This project isn’t here.</h1><p>Explore the documented projects from the portfolio.</p><a className="text-link" href="/#work"><ArrowLeft size={18} /> Back to projects</a></main>;
  return <ProjectArticle project={project} />;
}
