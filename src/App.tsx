import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUp, ArrowUpRight, Check, Code2, Copy, GitBranch, Menu, Radio, RotateCcw, Terminal, X } from 'lucide-react';
import { projects, projectPath, type Project } from './data/projects';
import { profile, aboutParagraphs, contactEmail, githubUrl, linkedinUrl, resumeUrl } from './data/profile';
import { toolkit } from './data/toolkit';
import TerminalDialog from './components/TerminalDialog';
import Experience from './components/Experience';
import { BrandMark, GithubIcon, LinkedInIcon } from './components/Icons';
import ReleaseLab from './components/ReleaseLab';
import ProjectGraphic from './components/ArchitectureGraphic';
import { CommandDialog, ProjectDialog } from './components/Dialogs';
import { MagneticLink, MotionCursor, NameLine, OrbitBadge, ShellCommand, TechMarquee, TerminalChrome } from './components/MotionElements';
import { usePortfolioMotion } from './hooks/usePortfolioMotion';
import { useReducedMotion } from './hooks/useReducedMotion';

const navigation = [{ label: 'Work', id: 'work' }, { label: 'About', id: 'about' }, { label: 'Experience', id: 'experience' }, { label: 'Toolkit', id: 'toolkit' }];


function ProjectCard({ project, index, onOpen }: { project: Project; index: number; onOpen: () => void }) {
  return (
    <article className={`project-card project-${project.accent}`} style={{ zIndex: index + 1 }}>
      <button type="button" className="project-visual-button" onClick={onOpen} aria-label={`Read ${project.title} case study`}>{project.image ? <img className="project-cover-image" src={project.image.url} alt={project.image.alt} loading="lazy" /> : <ProjectGraphic id={project.graphic ?? project.id} />}<span className="visual-open"><ArrowUpRight size={20} /><span>EXPLORE</span></span></button>
      <div className="project-copy">
        <div className="project-meta"><span>/{project.number}</span><span>{project.kind}</span></div>
        <a className="project-title-button" href={projectPath(project)}><h3>{project.title}</h3><ArrowUpRight size={30} strokeWidth={1.4} /></a>
        <p>{project.summary}</p>
        <div className="tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <div className="project-actions"><a className="project-documentation-link" href={projectPath(project)}>Read documentation <ArrowRight size={17} /></a><a href={project.repo} target="_blank" rel="noreferrer" aria-label={`${project.title} on GitHub`}><GithubIcon width={18} height={18} /><span>Source</span><ArrowUpRight size={14} /></a></div>
        <span className="project-watermark" aria-hidden="true">{project.number}</span>
      </div>
    </article>
  );
}

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const terminalProject = useRef(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [introVersion, setIntroVersion] = useState(0);
  const reducedMotion = useReducedMotion();
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  usePortfolioMotion(root, filter, introVersion);

  useEffect(() => {
    const header = root.current?.querySelector<HTMLElement>('.site-header');
    if (!header) return;
    const documentStyle = document.documentElement.style;
    const previousHeight = documentStyle.getPropertyValue('--header-height');
    const observer = new ResizeObserver(([entry]) => {
      const height = entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height;
      documentStyle.setProperty('--header-height', `${Math.ceil(height)}px`);
    });
    observer.observe(header);
    return () => {
      observer.disconnect();
      if (previousHeight) documentStyle.setProperty('--header-height', previousHeight);
      else documentStyle.removeProperty('--header-height');
    };
  }, []);

  useEffect(() => {
    const grid = root.current?.querySelector<HTMLElement>('.projects-grid');
    const header = root.current?.querySelector<HTMLElement>('.site-header');
    if (!grid || !header) return;
    const heights = new Map<Element, number>();
    let headerHeight = 91;
    const update = () => {
      // A card taller than the usable viewport must scroll without covering its neighbors.
      const availableHeight = window.innerHeight - Math.max(158, headerHeight + 20) - 40;
      grid.classList.toggle('projects-flow', Math.max(0, ...heights.values()) > availableHeight);
    };
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const height = entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height;
        if (entry.target === header) headerHeight = height;
        else heights.set(entry.target, height);
      });
      update();
    });
    observer.observe(header);
    grid.querySelectorAll('.project-card').forEach((card) => observer.observe(card));
    window.addEventListener('resize', update);
    return () => { observer.disconnect(); window.removeEventListener('resize', update); grid.classList.remove('projects-flow'); };
  }, [filter]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (!selectedProject) { setTerminalOpen(false); setCommandOpen((open) => !open); }
      }
      if (event.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); }); }, { rootMargin: '-15% 0px -60% 0px' });
    document.querySelectorAll('main > section[id]').forEach((section) => observer.observe(section));
    return () => { window.removeEventListener('keydown', handleKey); observer.disconnect(); };
  }, [selectedProject]);

  useEffect(() => () => { if (copyTimeout.current) clearTimeout(copyTimeout.current); }, []);
  function replayIntro() {
    if (reducedMotion) return;
    setIntroVersion((version) => version + 1);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopied(true); setCopyError(false);
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), 2600);
    } catch { setCopyError(true); }
  }

  const filteredProjects = projects.filter((project) => filter === 'all' || project.filters.includes(filter as 'cloud' | 'delivery'));
  const lightHeader = ['about', 'experience', 'toolkit', 'lab', 'contact'].includes(activeSection);

  return (
    <div ref={root} className={`portfolio-root ${reducedMotion ? 'motion-reduced' : 'motion-enabled'}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className={`site-header ${lightHeader ? 'header-light' : 'header-dark'}`}>
        <div className="header-inner">
          <a className="brand" href="#top" aria-label={`${profile.displayName} home`}><span className="brand-symbol"><BrandMark width={35} height={35} /></span><span className="brand-wordmark">{profile.brandName}<span className="brand-period">.</span><small>devops@linux:~$</small></span></a>
          <nav id="mobile-navigation" className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">{navigation.map((item) => <a key={item.id} className={activeSection === item.id ? 'nav-active' : ''} href={`#${item.id}`} onClick={() => setMenuOpen(false)}><span className="nav-number" aria-hidden="true">./</span>{item.label}</a>)}<a className="nav-contact" href="#contact" onClick={() => setMenuOpen(false)}>Let’s talk <ArrowUpRight size={16} /></a></nav>
          <div className="header-controls"><button type="button" className="search-button" onClick={() => setCommandOpen(true)} aria-label="Search portfolio (Control or Command K)"><Terminal size={16} /><span>⌘ K</span></button><button type="button" className="mobile-menu-button icon-button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
        </div>
      </header>

      <main id="main">
        <section className="hero-stage" id="top">
          <div className="hero-stage-grid" aria-hidden="true" /><div className="hero-atmosphere" aria-hidden="true"><i /><i /></div>
          <div className="hero-stage-inner page-width"><TerminalChrome onOpen={() => { setMenuOpen(false); setTerminalOpen(true); }} />
            <div className="hero-topline hero-intro"><p className="eyebrow"><span className="live-dot" /> {profile.hero.role}</p><span className="eyebrow">{profile.hero.location}</span></div>
            <div className="hero-main">
              <div className="hero-identity"><div className="identity-command hero-intro"><span>mahmoud@linux</span><span>:~$</span><span>whoami</span><i aria-hidden="true" /></div><h1 className="hero-name" aria-label={profile.displayName}><NameLine text={profile.nameLines[0]} /><NameLine text={profile.nameLines[1]} outlined /></h1><div className="hero-intro"><h2 className="hero-promise">{profile.hero.headline[0]}<br /><span>{profile.hero.headline[1]}</span></h2><p className="hero-description">{profile.hero.description}</p><div className="hero-actions"><MagneticLink href="#work" className="button button-accent">Explore my work <ArrowDown size={18} /></MagneticLink><MagneticLink className="text-link" href={githubUrl} target="_blank" rel="noreferrer"><GithubIcon width={19} height={19} /> GitHub <ArrowUpRight size={15} /></MagneticLink><a className="hero-cv text-link" href={resumeUrl} download="Mahmoud-Metwally-CV.pdf">Download CV <ArrowDownRight size={16} /></a></div><div className="hero-proof" aria-label={profile.hero.proofLabel}>{profile.hero.proof.map(item => <span key={item.label}><strong>{item.value}</strong> {item.label}</span>)}</div></div></div>
              <div className="hero-portrait-scene"><svg className="hero-signal-ring" viewBox="0 0 500 500" aria-hidden="true"><circle className="signal-ring-track" cx="250" cy="250" r="226" /><g className="signal-ring-orbit"><circle className="signal-ring-dashes" cx="250" cy="250" r="226" /><circle className="signal-ring-dot" cx="250" cy="24" r="7" /></g><g className="signal-ring-orbit orbit-reverse"><circle className="signal-ring-track" cx="250" cy="250" r="195" /><circle className="signal-ring-dot secondary-dot" cx="250" cy="445" r="5" /></g></svg><div className="portrait-halo" aria-hidden="true" /><div className="hero-portrait-parallax"><div className="hero-portrait-frame"><img src={profile.photo.url} alt={profile.photo.alt} width={460} height={460} fetchPriority="high" /></div></div><OrbitBadge /><span className="hero-orbit-label orbit-label-one"><span>01</span> CLOUD / AWS</span><span className="hero-orbit-label orbit-label-two"><span>02</span> AUTOMATE / SHIP</span><span className="hero-orbit-label orbit-label-three"><span>03</span> OBSERVE / IMPROVE</span><span className="hero-portrait-caption hero-intro">A SYSTEMS THINKER.<br />A HANDS-ON BUILDER.</span></div>
            </div>
            <div className="hero-bottom hero-intro"><div className="hero-socials"><a href={linkedinUrl} target="_blank" rel="noreferrer" aria-label="Mahmoud on LinkedIn"><LinkedInIcon width={17} height={17} /></a><a href={githubUrl} target="_blank" rel="noreferrer" aria-label="Mahmoud on GitHub"><GithubIcon width={18} height={18} /></a><span>LET’S MAKE THE NEXT RELEASE A GOOD ONE.</span></div><div className="hero-motion-actions"><button className="replay-intro" type="button" disabled={reducedMotion} onClick={replayIntro}><RotateCcw size={14} />Replay intro</button><a href="#work" className="scroll-cue" aria-label="Scroll to selected work"><span>SCROLL TO DISCOVER</span><span className="scroll-mouse"><i /></span></a></div></div>
          </div>
        </section>
        <TechMarquee />

        <section className="work-section dark-section" id="work"><div className="page-width">
          <div className="section-topline" data-reveal><span className="eyebrow">01 / SELECTED WORK</span><ShellCommand command="ls ./projects" /></div>
          <div className="section-heading work-heading" data-reveal><h2>Under the hood.<br /><span>Beyond the deploy.</span></h2><div><p>The platforms, pipelines, and moving parts.<br />Explore the thinking behind each implementation.</p><div className="project-filters" role="group" aria-label="Filter projects">{[{ value: 'all', label: 'All work', count: projects.length }, { value: 'cloud', label: 'Cloud', count: projects.filter(item => item.filters.includes('cloud')).length }, { value: 'delivery', label: 'Delivery', count: projects.filter(item => item.filters.includes('delivery')).length }].map((item) => <button key={item.value} type="button" aria-pressed={filter === item.value} className={filter === item.value ? 'filter-active' : ''} onClick={() => setFilter(item.value)}>{item.label}<sup>{String(item.count).padStart(2, '0')}</sup></button>)}</div></div></div>
          <div className="projects-grid" aria-live="polite">{filteredProjects.length === 0 && <p className="projects-empty">No projects to show here yet.</p>}{filteredProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} onOpen={() => setSelectedProject(project)} />)}</div>
          <div className="work-bottom"><span><GitBranch size={15} /> THE DETAILS ARE IN THE CODE.</span><a className="text-link" href={`${githubUrl}?tab=repositories`} target="_blank" rel="noreferrer">More on GitHub <ArrowUpRight size={17} /></a></div>
        </div></section>

        <section className="about-section page-width" id="about">
          <div className="section-topline" data-reveal><span className="eyebrow">02 / THE PERSON BEHIND THE PIPELINES</span><ShellCommand command="cat ./about.md" /></div>
          <div className="about-grid"><div className="portrait-frame" data-reveal><div className="portrait-top"><span>MEET MAHMOUD</span><span>↘</span></div><div className="about-image-mask"><img className="about-portrait-image" src={profile.photo.url} alt={profile.photo.alt} loading="lazy" width={460} height={460} /></div><div className="portrait-bottom"><span>CAIRO, EGYPT</span><span>ENGINEER. BUILDER. HUMAN.</span></div><span className="portrait-sticker">Curiosity<br />is part of<br /><strong>the stack.</strong><span>✳</span></span></div><div className="about-copy" data-reveal><h2>Complex systems.<br /><span>A human approach.</span></h2><p className="about-intro">{aboutParagraphs[0]}</p>{aboutParagraphs.slice(1).map(paragraph => <p key={paragraph}>{paragraph}</p>)}<div className="principles"><div><span>01</span><p>Automate the repeatable.</p><Code2 size={17} /></div><div><span>02</span><p>Make behavior visible.</p><Radio size={17} /></div><div><span>03</span><p>Leave the next engineer a map.</p><GitBranch size={17} /></div></div><a className="text-link about-link" href={linkedinUrl} target="_blank" rel="noreferrer">The professional side of me <ArrowUpRight size={18} /></a></div></div>
        </section>

        <Experience />

        <section className="toolkit-section" id="toolkit"><div className="page-width"><div className="section-topline" data-reveal><span className="eyebrow">04 / TOOLS WITH A PURPOSE</span><ShellCommand command="cat ./toolkit.conf" /></div><div className="section-heading toolkit-heading" data-reveal><h2>From the first commit<br />to what comes next.</h2><p>A practical toolkit for the whole journey.<br />Pick a layer to look a little closer.</p></div><div className="toolkit-list">{toolkit.map((item) => { const Icon = item.icon; const expanded = expandedTool === item.number; return <div key={item.number} className={`toolkit-row ${expanded ? 'toolkit-expanded' : ''}`}><button type="button" className="toolkit-row-button" aria-expanded={expanded} aria-controls={`tool-${item.number}`} onClick={() => setExpandedTool(expanded ? null : item.number)}><span className="toolkit-number">/{item.number}</span><span className="toolkit-icon"><Icon size={25} strokeWidth={1.4} /></span><span className="toolkit-title"><strong>{item.title}</strong><small>{item.description}</small></span><span className="toolkit-tools">{item.tools.join(' / ')}</span><span className="toolkit-toggle">{expanded ? '−' : '+'}</span></button><div className="toolkit-detail" id={`tool-${item.number}`} hidden={!expanded}><p>{item.detail}</p><div className="tags">{item.tools.map((tool) => <span key={tool}>{tool}</span>)}</div></div></div>; })}</div><div className="toolkit-note"><Terminal size={16} /><p>Tools change. The goal stays the same: systems people can trust.</p></div></div></section>

        <section className="playground-section" id="lab"><div className="page-width playground-grid"><div className="playground-copy" data-reveal><span className="eyebrow">05 / THE RELEASE LAB</span><h2>A small change.<br /><span>A smooth release.</span></h2><p>A little glimpse into a good day in DevOps. Follow a change through source control, build, deployment, and observability.</p><span className="playground-note"><ArrowRight size={17} /> TRY THE INTERACTIVE DEMO</span></div><ReleaseLab /></div></section>

        <section className="contact-section" id="contact"><div className="page-width"><div className="section-topline"><span className="eyebrow">06 / THE NEXT CHAPTER</span><ShellCommand command="./contact.sh" /></div><div className="contact-grid"><div><h2>Your next chapter.<br /><span>Let’s build it.</span><ArrowDownRight className="contact-arrow" size={76} strokeWidth={1.25} /></h2><p>A team to join. A platform to build. A pipeline to untangle.<br />If that sounds like your next move, I’d like to hear about it.</p></div><div className="contact-actions"><a href={`mailto:${contactEmail}`} className="contact-email"><span className="eyebrow">DROP ME A LINE</span><span>{contactEmail}<ArrowUpRight size={27} /></span></a><div className="contact-links"><a href={linkedinUrl} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={17} /></a><a href={githubUrl} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={17} /></a><button type="button" onClick={copyEmail}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Email copied' : 'Copy email'}</button></div><p className="copy-feedback" aria-live="polite">{copyError ? `Copy unavailable. Email me at ${contactEmail}.` : copied ? 'Ready to paste wherever you like.' : ''}</p></div></div></div></section>
      </main>

      <footer className="site-footer page-width"><a className="footer-brand" href="#top"><BrandMark width={28} height={28} /><span>MAHMOUD METWALLY</span></a><span className="footer-note">BUILT WITH INTENTION. © {new Date().getFullYear()}</span><a className="back-to-top" href="#top">BACK TO TOP <ArrowUp size={14} /></a></footer>
      {selectedProject && <ProjectDialog project={selectedProject} fallbackFocusSelector={terminalProject.current ? '.open-terminal-button' : undefined} onClose={() => { terminalProject.current = false; setSelectedProject(null); }} />}
      {commandOpen && <CommandDialog onClose={() => setCommandOpen(false)} onProject={(project) => { setCommandOpen(false); setSelectedProject(project); }} />}
      <TerminalDialog open={terminalOpen} onClose={() => setTerminalOpen(false)} onProject={(project) => { terminalProject.current = true; setTerminalOpen(false); setSelectedProject(project); }} />
      <MotionCursor />
    </div>
  );
}
