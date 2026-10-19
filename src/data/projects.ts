import content from 'virtual:portfolio-projects';
export type CaseStudy = {
  revision: string
  status: string
  learningContext?: string
  contribution: string
  contributionEvidence?: { label: string; url: string }[]
  architecture: { description: string; lanes: { title: string; nodes: { title: string; detail: string; via?: string }[] }[] }
  decisions: { choice: string; tradeoff: string }[]
  delivery: string[]
  security: string[]
  observability?: string[]
  verification: { summary: string; execution?: { label: string; url: string }; limitations: string[] }
  lessons: string[]
  next: string[]
}

export type Project = {
  id: string
  number: string
  title: string
  category: string
  kind: string
  summary: string
  description: string
  tags: string[]
  repo: string
  challenge: string
  approach: string[]
  evidence: { label: string; detail: string; url: string }[]
  architecture: string[]
  accent: 'lime' | 'blue' | 'orange'
  filters: ('cloud' | 'delivery')[]
  foundation?: { label: string; url: string }
  graphic?: 'three-tier' | 'space-cargo' | 'ultimate-devops'
  image?: { url: string; alt: string }
  diagram?: { url: string; alt: string }
  caseStudy: CaseStudy
}

export const projectPath = (project: Pick<Project, 'id'>) => `/projects/${project.id}`;
export const sourcePath = (project: Project, path: string) => `${project.repo}/${path.endsWith('/') ? 'tree' : 'blob'}/${project.caseStudy.revision}/${path}`;


export const projects = content as Project[];
