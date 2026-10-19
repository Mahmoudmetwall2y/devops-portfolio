import content from 'virtual:portfolio-documentation';
export type Documentation = {
  subtitle: string;
  focus: string;
  repository: { path: string; purpose: string }[];
  prerequisites: { title: string; detail: string }[];
  walkthrough: { title: string; detail: string; source: string }[];
  commands: { title: string; detail: string; code: string; source?: string }[];
  troubleshooting: { symptom: string; checks: string }[];
};


export const documentation = content as Record<string, Documentation>;
