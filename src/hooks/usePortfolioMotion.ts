import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { normalMotionQuery } from './useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

export function usePortfolioMotion(root: RefObject<HTMLDivElement | null>, filter: string, introVersion: number) {
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    // Replay owns only the entrance timeline, never the persistent scroll effects.
    media.add(normalMotionQuery, () => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-letter', { yPercent: 115, rotate: 5, duration: 1.15, stagger: .035 }, .1)
        .from('.hero-portrait-frame', { y: 65, rotate: 5, scale: .92, autoAlpha: 0, duration: 1.25 }, .25)
        .from('.hero-intro', { y: 22, autoAlpha: 0, duration: .8, stagger: .12 }, .75)
        .from('.hero-orbit-label', { y: 15, autoAlpha: 0, duration: .7, stagger: .15 }, 1);
    }, root);
    return () => media.revert();
  }, [root, introVersion]);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add(normalMotionQuery, () => {
      gsap.to('.hero-portrait-parallax', { y: -65, rotate: 5, ease: 'none', scrollTrigger: { id: 'portfolio-portrait', trigger: '#top', start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element, index) => {
        gsap.from(element, { y: 36, autoAlpha: 0, duration: .85, ease: 'power3.out', scrollTrigger: { id: `portfolio-reveal-${index}`, trigger: element, start: 'top 92%', once: true } });
      });
      gsap.from('.about-portrait-image', { scale: 1.17, ease: 'none', scrollTrigger: { id: 'portfolio-about', trigger: '#about', start: 'top bottom', end: 'center center', scrub: 1 } });
      gsap.from('.contact-grid h2', { y: 35, ease: 'none', scrollTrigger: { id: 'portfolio-contact', trigger: '#contact', start: 'top bottom', end: 'top center', scrub: 1 } });
    }, root);
    // Font completion can arrive after StrictMode cleanup or unmount.
    let disposed = false;
    let frame = 0;
    void document.fonts.ready.then(() => {
      if (!disposed && window.matchMedia(normalMotionQuery).matches) {
        frame = requestAnimationFrame(() => ScrollTrigger.refresh());
      }
    });
    return () => { disposed = true; cancelAnimationFrame(frame); media.revert(); };
  }, [root]);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    // Filter changes remove cards. Rebind their parallax and stacking together.
    media.add(normalMotionQuery, () => {
      gsap.utils.toArray<SVGSVGElement>('.project-visual-button .architecture-art').forEach((element, index) => {
        gsap.fromTo(element, { y: 25 }, { y: -20, ease: 'none', scrollTrigger: { id: `portfolio-art-${index}`, trigger: element.closest('.project-card'), start: 'top bottom', end: 'bottom top', scrub: 1 } });
      });
    }, root);
    media.add(`(min-width: 901px) and ${normalMotionQuery}`, () => {
      const cards = gsap.utils.toArray<HTMLElement>('.project-card');
      cards.slice(0, -1).forEach((card, index) => {
        gsap.to(card, { scale: .955, ease: 'none', transformOrigin: 'center top', scrollTrigger: { id: `portfolio-card-${index}`, trigger: cards[index + 1], start: 'top 85%', end: 'top 160px', scrub: true } });
      });
    }, root);
    if (window.matchMedia(normalMotionQuery).matches) ScrollTrigger.refresh();
    // matchMedia owns its contexts, animations, and ScrollTriggers.
    return () => media.revert();
  }, [root, filter]);
}
