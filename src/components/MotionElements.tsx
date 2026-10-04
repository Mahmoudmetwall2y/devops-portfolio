import { useEffect, useRef, type ReactNode, type PointerEvent } from 'react';
import { ArrowDownRight } from 'lucide-react';

export function ShellCommand({ command }: { command: string }) {
  return <span className="shell-command" aria-hidden="true"><span>$</span> {command}</span>;
}

export function TerminalChrome() {
  return <div className="terminal-chrome hero-intro"><span className="terminal-window-dots" aria-hidden="true"><i /><i /><i /></span><span>mahmoud@linux: ~/portfolio</span><span className="terminal-shell">bash</span></div>;
}

export function NameLine({ text, outlined = false }: { text: string; outlined?: boolean }) {
  return <span className={`hero-name-line ${outlined ? 'name-outline' : ''}`} aria-hidden="true">{Array.from(text).map((letter, index) => <span className="hero-letter-mask" key={index}><span className="hero-letter">{letter}</span></span>)}</span>;
}

export function MagneticLink({ children, className = '', ...props }: { children: ReactNode; className?: string; href: string; target?: string; rel?: string; 'aria-label'?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  function move(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== 'mouse' || !event.currentTarget.closest('.motion-enabled')) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    ref.current?.style.setProperty('--magnet-x', `${(event.clientX - bounds.left - bounds.width / 2) * .12}px`);
    ref.current?.style.setProperty('--magnet-y', `${(event.clientY - bounds.top - bounds.height / 2) * .16}px`);
  }
  return <a ref={ref} {...props} className={`magnetic-link ${className}`} onPointerMove={move} onPointerLeave={() => { ref.current?.style.setProperty('--magnet-x', '0px'); ref.current?.style.setProperty('--magnet-y', '0px'); }}>{children}</a>;
}

export function OrbitBadge() {
  return <a href="#work" className="orbit-badge" aria-label="Explore selected work"><svg viewBox="0 0 140 140" className="orbit-type" aria-hidden="true"><defs><path id="orbit-text-circle" d="M70,70 m-51,0 a51,51 0 1,1 102,0 a51,51 0 1,1 -102,0" /></defs><text><textPath href="#orbit-text-circle">CLOUD · AUTOMATION · RELIABILITY · </textPath></text></svg><ArrowDownRight size={33} strokeWidth={1.4} /></a>;
}

export function MotionCursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(pointer: fine)');
    if (!media.matches) return;
    let frame = 0;
    let targetX = -100, targetY = -100, currentX = -100, currentY = -100;
    function move(event: globalThis.PointerEvent) {
      targetX = event.clientX; targetY = event.clientY;
      ref.current?.classList.toggle('cursor-hover', Boolean((event.target as Element)?.closest('a, button')));
      ref.current?.classList.add('cursor-visible');
    }
    function tick() {
      currentX += (targetX - currentX) * .18; currentY += (targetY - currentY) * .18;
      if (ref.current) ref.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      frame = requestAnimationFrame(tick);
    }
    const hide = () => ref.current?.classList.remove('cursor-visible');
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerleave', hide);
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', hide); };
  }, []);
  return <div ref={ref} className="motion-cursor" aria-hidden="true"><span /></div>;
}

export function TechMarquee() {
  const tools = ['CLOUD INFRASTRUCTURE', 'KUBERNETES', 'AUTOMATION', 'TERRAFORM', 'OBSERVABILITY'];
  return <div className="tech-marquee" role="img" aria-label="Cloud infrastructure, Kubernetes, automation, Terraform, observability"><div className="marquee-track" aria-hidden="true">{[0, 1].map((copy) => <div className="marquee-copy" key={copy}>{tools.map((tool) => <span key={tool}>{tool}<i>✳</i></span>)}</div>)}</div></div>;
}
