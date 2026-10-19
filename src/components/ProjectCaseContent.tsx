import type { Project } from '../data/projects';
import { ArrowUpRight } from 'lucide-react';
import { CaseArchitecture } from './ArchitectureGraphic';

export const caseStudySections = [["architecture","Architecture"],["challenge","Engineering challenge"],["implementation","My implementation"],["decisions","Engineering decisions"],["delivery","Delivery workflow"],["security","Security and reliability"],["observability","Observability"],["evidence","Verification and evidence"],["lessons","Engineering lessons"],["next","Next improvements"]] as const;
export type CaseSection = typeof caseStudySections[number][0];

export function ProjectCaseContent({ project, level = 3, prefix, only }: { project: Project; level?: 2 | 3; prefix?: string; only?: CaseSection[] }) {
  const study = project.caseStudy;
  const Heading = level === 2 ? 'h2' : 'h3';
  const sectionId = (section: string) => `${prefix ?? `case-${project.id}`}-${section}`;
  return <div className="case-content">
      {(!only || only.includes('architecture')) && <section aria-labelledby={sectionId('architecture')}><Heading tabIndex={-1} id={sectionId('architecture')}>Architecture</Heading><CaseArchitecture project={project} /></section>}
      {(!only || only.includes('challenge')) && <section aria-labelledby={sectionId('challenge')}><span className="eyebrow">THE CHALLENGE</span><Heading tabIndex={-1} id={sectionId('challenge')}>Engineering challenge</Heading><p>{project.challenge}</p></section>}
      {(!only || only.includes('implementation')) && <section aria-labelledby={sectionId('implementation')}><span className="eyebrow">THE APPROACH</span><Heading tabIndex={-1} id={sectionId('implementation')}>My implementation</Heading><p>{study.contribution}</p><ul>{project.approach.map((item) => <li key={item}>{item}</li>)}</ul>{study.contributionEvidence && <div className="case-contribution-links">{study.contributionEvidence.map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer">{item.label} <ArrowUpRight size={15} aria-hidden="true" /></a>)}</div>}</section>}
      {(!only || only.includes('decisions')) && <section aria-labelledby={sectionId('decisions')}><Heading tabIndex={-1} id={sectionId('decisions')}>Engineering decisions</Heading><dl className="case-decisions">{study.decisions.map((item) => <div key={item.choice}><dt>{item.choice}</dt><dd>{item.tradeoff}</dd></div>)}</dl></section>}
      {(!only || only.includes('delivery')) && <section aria-labelledby={sectionId('delivery')}><Heading tabIndex={-1} id={sectionId('delivery')}>Delivery workflow</Heading><ol className="case-delivery">{study.delivery.map((item) => <li key={item}>{item}</li>)}</ol></section>}
      {(!only || only.includes('security')) && <section aria-labelledby={sectionId('security')}><Heading tabIndex={-1} id={sectionId('security')}>Security and reliability</Heading><ul>{study.security.map((item) => <li key={item}>{item}</li>)}</ul></section>}
      {(!only || only.includes('observability')) && study.observability && <section aria-labelledby={sectionId('observability')}><Heading tabIndex={-1} id={sectionId('observability')}>Observability</Heading>{study.observability.map((item) => <p key={item}>{item}</p>)}</section>}
      {(!only || only.includes('evidence')) && <section aria-labelledby={sectionId('evidence')}><Heading tabIndex={-1} id={sectionId('evidence')}>Verification and evidence</Heading><p>{study.verification.summary}</p>{study.verification.execution && <a className="case-execution-link" href={study.verification.execution.url} target="_blank" rel="noreferrer">{study.verification.execution.label} <ArrowUpRight size={17} aria-hidden="true" /></a>}<details className="case-limits" open><summary>Evidence limits and implementation gaps</summary><ul>{study.verification.limitations.map((item) => <li key={item}>{item}</li>)}</ul></details><div className="evidence-list">{project.evidence.map((item) => <a key={item.label} href={item.url} target="_blank" rel="noreferrer"><div><strong>{item.label}</strong><p>{item.detail}</p></div><ArrowUpRight size={18} aria-hidden="true" /></a>)}</div></section>}
      {(!only || only.includes('lessons')) && <section aria-labelledby={sectionId('lessons')}><Heading tabIndex={-1} id={sectionId('lessons')}>Engineering lessons</Heading><ul>{study.lessons.map((item) => <li key={item}>{item}</li>)}</ul></section>}
      {(!only || only.includes('next')) && <section aria-labelledby={sectionId('next')}><Heading tabIndex={-1} id={sectionId('next')}>Next improvements</Heading><p className="case-future-note">Proposed work — not verified as implemented.</p><ul>{study.next.map((item) => <li key={item}>{item}</li>)}</ul></section>}
  </div>;
}
