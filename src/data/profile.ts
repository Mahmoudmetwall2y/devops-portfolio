// Professional details supplied in Mahmoud's CV (October 2026).
export const resumeUrl = `${import.meta.env.BASE_URL}assets/mahmoud-metwally-cv.pdf`;

export const experience = [
  {
    company: 'Easytravel',
    role: 'DevOps Engineer',
    period: 'Apr 2026 — Present',
    current: true,
    summary: 'Operating the infrastructure behind a real travel platform.',
    details: 'Seven Ubuntu servers and a self-managed k3s cluster supporting approximately ten C# microservices, SQL Server, Redis, and a Flutter application. GitHub Actions and Docker automate delivery; Terraform provisions infrastructure; Prometheus and Grafana keep services visible.',
    tools: ['Ubuntu', 'k3s', 'GitHub Actions', 'Terraform', 'Prometheus', 'Grafana'],
  },
  {
    company: 'Digital Egypt Pioneers Initiative',
    role: 'DevOps Intern',
    period: 'Nov 2025 — Jul 2026',
    current: false,
    summary: 'From hands-on training to a cloud-native capstone.',
    details: 'Built pipelines and cloud environments through the DEPI program, working across Linux, AWS, Jenkins, Docker, Kubernetes, Terraform, Ansible, Helm, and GitOps. The Space Cargo capstone brings those layers together on AWS EKS.',
    tools: ['AWS', 'Jenkins', 'Kubernetes', 'Ansible', 'Helm', 'Argo CD'],
  },
  {
    company: 'Water Company',
    role: 'IT Specialist',
    period: 'Dec 2020 — Apr 2024',
    current: false,
    summary: 'The operations foundation: systems, networks, and people.',
    details: 'Supported more than 100 users across Windows and Linux systems, LAN/WAN networks, and Cisco routers and switches. Handled connectivity incidents, patching, backups, and user access—experience that informs how I operate infrastructure today.',
    tools: ['Linux', 'Windows', 'Cisco', 'Networking', 'Backups'],
  },
];
