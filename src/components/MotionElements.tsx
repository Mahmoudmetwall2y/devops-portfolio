import { useEffect, useLayoutEffect, useRef, type ReactNode, type PointerEvent } from 'react';
import { ArrowDownRight, Terminal } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function ShellCommand({ command }: { command: string }) {
  return <span className="shell-command" aria-hidden="true"><span>$</span> {command}</span>;
}

export function TerminalChrome({ onOpen }: { onOpen: () => void }) {
  return <div className="terminal-chrome hero-intro"><span className="terminal-window-dots" aria-hidden="true"><i /><i /><i /></span><span>mahmoud@linux: ~/portfolio</span><button type="button" className="open-terminal-button" onClick={onOpen} aria-haspopup="dialog"><Terminal size={16} aria-hidden="true" />Open Terminal</button></div>;
}

export function NameLine({ text, outlined = false }: { text: string; outlined?: boolean }) {
  return <span className={`hero-name-line ${outlined ? 'name-outline' : ''}`} aria-hidden="true">{Array.from(text).map((letter, index) => <span className="hero-letter-mask" key={index}><span className="hero-letter">{letter}</span></span>)}</span>;
}

export function MagneticLink({ children, className = '', ...props }: { children: ReactNode; className?: string; href: string; target?: string; rel?: string; 'aria-label'?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reducedMotion = useReducedMotion();
  const bounds = useRef<DOMRect | null>(null);
  const frame = useRef(0);
  const offset = useRef({ x: 0, y: 0 });
  function reset() {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    bounds.current = null;
    ref.current?.style.removeProperty('--magnet-x');
    ref.current?.style.removeProperty('--magnet-y');
  }
  useLayoutEffect(() => { reset(); return reset; }, [reducedMotion]);
  function enter(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType === 'mouse' && !reducedMotion) bounds.current = event.currentTarget.getBoundingClientRect();
  }
  function move(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== 'mouse' || reducedMotion || !bounds.current) return;
    const rect = bounds.current;
    offset.current = { x: (event.clientX - rect.left - rect.width / 2) * .12, y: (event.clientY - rect.top - rect.height / 2) * .16 };
    if (!frame.current) frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      ref.current?.style.setProperty('--magnet-x', `${offset.current.x}px`);
      ref.current?.style.setProperty('--magnet-y', `${offset.current.y}px`);
    });
  }
  return <a ref={ref} {...props} className={`magnetic-link ${className}`} onPointerEnter={enter} onPointerMove={move} onPointerLeave={reset} onBlur={reset}>{children}</a>;
}

export function OrbitBadge() {
  return <a href="#work" className="orbit-badge" aria-label="Explore selected work"><svg viewBox="0 0 140 140" className="orbit-type" aria-hidden="true"><defs><path id="orbit-text-circle" d="M70,70 m-51,0 a51,51 0 1,1 102,0 a51,51 0 1,1 -102,0" /></defs><text><textPath href="#orbit-text-circle">CLOUD · AUTOMATION · RELIABILITY · </textPath></text></svg><ArrowDownRight size={33} strokeWidth={1.4} /></a>;
}

export function MotionCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const cursor = ref.current;
    if (!cursor || reducedMotion) return;
    const media = window.matchMedia('(pointer: fine)');
    let frame = 0;
    let targetX = -100, targetY = -100, currentX = -100, currentY = -100;
    let previousTime = 0;
    function hide() {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      cursor!.classList.remove('cursor-visible', 'cursor-hover');
    }
    function move(event: globalThis.PointerEvent) {
      if (!media.matches || event.pointerType !== 'mouse' || document.hidden) return;
      targetX = event.clientX; targetY = event.clientY;
      if (!cursor!.classList.contains('cursor-visible')) { currentX = targetX; currentY = targetY; }
      cursor!.classList.toggle('cursor-hover', Boolean((event.target as Element)?.closest('a, button')));
      cursor!.classList.add('cursor-visible');
      if (!frame) frame = requestAnimationFrame(tick);
    }
    function tick(time: number) {
      const delta = previousTime ? Math.min(time - previousTime, 64) : 1000 / 60;
      previousTime = time;
      const ease = 1 - Math.pow(.82, delta / (1000 / 60));
      currentX += (targetX - currentX) * ease; currentY += (targetY - currentY) * ease;
      const settled = Math.abs(targetX - currentX) < .1 && Math.abs(targetY - currentY) < .1;
      if (settled) { currentX = targetX; currentY = targetY; }
      cursor!.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      frame = settled ? 0 : requestAnimationFrame(tick);
      if (settled) previousTime = 0;
    }
    const visibility = () => { if (document.hidden) hide(); };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerleave', hide);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', hide);
    media.addEventListener('change', hide);
    return () => {
      hide();
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', hide);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', hide);
      media.removeEventListener('change', hide);
    };
  }, [reducedMotion]);
  return <div ref={ref} className="motion-cursor" aria-hidden="true"><span /></div>;
}

export function TechMarquee() {
  const tools = ['CLOUD INFRASTRUCTURE', 'KUBERNETES', 'AUTOMATION', 'TERRAFORM', 'OBSERVABILITY'];
  return <div className="tech-marquee" role="img" aria-label="Cloud infrastructure, Kubernetes, automation, Terraform, observability"><div className="marquee-track" aria-hidden="true">{[0, 1].map((copy) => <div className="marquee-copy" key={copy}>{tools.map((tool) => <span key={tool}>{tool}<i>✳</i></span>)}</div>)}</div></div>;
}
