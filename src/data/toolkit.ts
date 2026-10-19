import { Cloud, Layers3, GitBranch, Radio } from 'lucide-react';

export const toolkit = [
  { number: '01', icon: Cloud, title: 'Cloud & infrastructure', description: 'Put a solid foundation under your application.', tools: ['AWS', 'Terraform', 'Ansible', 'Linux'], detail: 'Cloud resources defined as code, repeatable provisioning, and configurations that can be reviewed.' },
  { number: '02', icon: Layers3, title: 'Containers & orchestration', description: 'Give every service a place to run.', tools: ['Docker', 'Kubernetes / k3s', 'Helm', 'Argo CD', 'Istio'], detail: 'Consistent application packaging, service orchestration, health checks, and controlled rollouts.' },
  { number: '03', icon: GitBranch, title: 'Delivery & automation', description: 'Turn the next release into a routine.', tools: ['GitHub Actions', 'Jenkins', 'Bash', 'Python'], detail: 'Automated build and delivery workflows with checks before deployment and traceable changes.' },
  { number: '04', icon: Radio, title: 'Visibility & reliability', description: 'Know what your system is telling you.', tools: ['OpenTelemetry', 'Prometheus', 'Grafana', 'Jaeger'], detail: 'Useful dashboards, service health signals, and a clearer path from a symptom to its cause.' },
];
