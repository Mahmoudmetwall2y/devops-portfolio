import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function usePortfolioMotion(root: RefObject<HTMLDivElement | null>, filter: string, introVersion: number) {
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    // Motion starts automatically; Replay restarts only the entrance sequence.
    media.add('all', () => {
      const context = gsap.context(() => {
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from('.hero-letter', { yPercent: 115, rotate: 5, duration: 1.15, stagger: .035 }, .1)
          .from('.hero-portrait-frame', { y: 65, rotate: 5, scale: .92, autoAlpha: 0, duration: 1.25 }, .25)
          .from('.hero-intro', { y: 22, autoAlpha: 0, duration: .8, stagger: .12 }, .75)
          .from('.hero-orbit-label', { y: 15, autoAlpha: 0, duration: .7, stagger: .15 }, 1);
        gsap.to('.hero-portrait-parallax', { y: -65, rotate: 5, ease: 'none', scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: 1 } });
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
          gsap.from(element, { y: 36, autoAlpha: 0, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
        });
        gsap.utils.toArray<HTMLElement>('.project-visual-button .architecture-art').forEach((element) => {
          gsap.fromTo(element, { y: 25 }, { y: -20, ease: 'none', scrollTrigger: { trigger: element.closest('.project-card'), start: 'top bottom', end: 'bottom top', scrub: 1 } });
        });
        gsap.from('.about-portrait-image', { scale: 1.17, ease: 'none', scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'center center', scrub: 1 } });
        gsap.from('.contact-grid h2', { y: 35, ease: 'none', scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'top center', scrub: 1 } });
      }, root);
      return () => context.revert();
    });
    const refresh = () => ScrollTrigger.refresh();
    void document.fonts.ready.then(refresh);
    return () => media.revert();
  }, [root, introVersion]);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(min-width: 901px)', () => {
      const context = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>('.project-card');
        cards.slice(0, -1).forEach((card, index) => {
          gsap.to(card, { scale: .955, ease: 'none', transformOrigin: 'center top', scrollTrigger: { trigger: cards[index + 1], start: 'top 85%', end: 'top 160px', scrub: true } });
        });
      }, root);
      ScrollTrigger.refresh();
      return () => context.revert();
    });
    return () => media.revert();
  }, [root, filter]);
}
