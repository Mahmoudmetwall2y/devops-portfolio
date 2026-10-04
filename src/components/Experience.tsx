import { ArrowUpRight, Download, GraduationCap } from 'lucide-react';
import { experience, resumeUrl } from '../data/profile';
import { ShellCommand } from './MotionElements';

export default function Experience() {
  return <section className="experience-section" id="experience"><div className="page-width">
    <div className="section-topline" data-reveal><span className="eyebrow">03 / IN THE FIELD</span><ShellCommand command="cat ./experience.log" /></div>
    <div className="section-heading experience-heading" data-reveal><h2>Beyond the projects.<br /><span>Inside production.</span></h2><a className="text-link" href={resumeUrl} download="Mahmoud-Metwally-CV.pdf">Download my CV <Download size={18} /></a></div>
    <div className="experience-list">{experience.map((item, index) => <article className="experience-row" key={item.company} data-reveal>
      <div className="experience-when"><span className="eyebrow">{item.period}</span>{item.current && <span className="current-role"><i /> CURRENT ROLE</span>}<span className="experience-index" aria-hidden="true">0{index + 1}</span></div>
      <div className="experience-body"><p className="eyebrow experience-role">{item.role}</p><h3>{item.company}<ArrowUpRight size={26} aria-hidden="true" /></h3><p className="experience-summary">{item.summary}</p><p>{item.details}</p><div className="tags">{item.tools.map((tool) => <span key={tool}>{tool}</span>)}</div></div>
    </article>)}</div>
    <div className="career-notes" data-reveal><article><GraduationCap size={26} strokeWidth={1.4} /><span className="eyebrow">ENGINEERING FOUNDATION / 2026</span><h3>Communication & Electronics</h3><p>Bachelor’s degree · BNS University, Bani Suef</p><span className="career-languages">ARABIC / NATIVE · ENGLISH / PROFICIENT</span></article><article><span className="leadership-number" aria-hidden="true">08</span><span className="eyebrow">TECHNICAL LEAD / ASCULTICOR</span><h3>Connecting devices, AI, and people.</h3><p>Led an eight-member team delivering an IoT and AI cardiac monitoring platform, with containerized services, secure device onboarding, and cloud infrastructure.</p><a className="text-link" href={resumeUrl} target="_blank" rel="noreferrer">More in my CV <ArrowUpRight size={16} /></a></article></div>
  </div></section>;
}
