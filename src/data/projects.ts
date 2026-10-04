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
}

export const projects: Project[] = [
  {
    id: 'three-tier',
    number: '01',
    title: '3-Tier User Platform',
    category: 'DEVSECOPS / CLOUD DELIVERY',
    kind: 'END-TO-END DEVSECOPS',
    summary: 'A complete delivery journey: security scanning, container builds, and separate QA and production deployments on AWS EKS.',
    description: 'My end-to-end DevOps implementation for a React, Express, and MySQL user platform. The delivery configuration covers security reports, application quality checks, image publishing, and environment-specific Kubernetes deployment.',
    tags: ['AWS EKS', 'Kubernetes', 'GitHub Actions', 'Docker', 'Trivy', 'SonarQube'],
    repo: 'https://github.com/Mahmoudmetwall2y/3-Tier-User-Platform-Project',
    challenge: 'Connect the application layers to a repeatable delivery process while separating QA from production, making security findings visible, and keeping deployment changes traceable.',
    approach: [
      'Connect the React client, Express API, and MySQL data layer; package the client and server in a Node.js container running as a non-root user.',
      'Configure a QA pipeline with Gitleaks, Checkov, Trivy filesystem scans, application checks, and SonarQube quality reporting.',
      'Build and publish container images, update environment-specific manifests, and deploy into separate QA and production namespaces.',
      'Use GitHub OIDC for AWS credentials, apply EKS manifests, and wait for Kubernetes rollout status in the delivery workflows.',
    ],
    evidence: [
      { label: 'QA delivery and security checks', detail: 'Security reports, quality checks, image builds, and Kubernetes deployment in one workflow.', url: 'https://github.com/Mahmoudmetwall2y/3-Tier-User-Platform-Project/blob/main/.github/workflows/qa-cicd.yml' },
      { label: 'Production delivery', detail: 'Image promotion, manifest updates, AWS OIDC, and a production rollout check.', url: 'https://github.com/Mahmoudmetwall2y/3-Tier-User-Platform-Project/blob/main/.github/workflows/prod-cd.yaml' },
      { label: 'Application packaging', detail: 'Build the React client, install the server, and run as a non-root application user.', url: 'https://github.com/Mahmoudmetwall2y/3-Tier-User-Platform-Project/blob/main/Dockerfile' },
      { label: 'Environment configuration', detail: 'Production namespace, container image, and database values from Kubernetes Secrets.', url: 'https://github.com/Mahmoudmetwall2y/3-Tier-User-Platform-Project/blob/main/k8-manifests/prod/app-deployment.yaml' },
    ],
    architecture: ['React', 'Express API', 'MySQL', 'GitHub Actions', 'AWS EKS'],
    accent: 'orange',
    filters: ['cloud', 'delivery'],
    foundation: { label: '3-Tier User Platform by jaiswaladi246', url: 'https://github.com/jaiswaladi246/3-Tier-User-Platform-Project' },
  },
  {
    id: 'space-cargo',
    number: '02',
    title: 'Space Cargo',
    category: 'CLOUD INFRASTRUCTURE / GITOPS',
    kind: 'CLOUD PLATFORM / DEPI',
    summary: 'Four services on AWS EKS, with infrastructure as code, protected service traffic, and a delivery workflow you can observe.',
    description:
      'A cloud-native cargo simulation on AWS EKS, built to make deployment, service security, failures, and scaling visible. Terraform defines the infrastructure, Helm packages the application, and GitHub Actions with Argo CD connects immutable image builds to GitOps delivery.',
    tags: ['AWS EKS', 'Kubernetes', 'Terraform', 'Helm', 'Argo CD', 'Istio', 'GitHub Actions', 'Prometheus'],
    repo: 'https://github.com/Mahmoudmetwall2y/DEPI-Graduation-Project-',
    challenge:
      'Make a multi-service application repeatable to deploy and useful to operate: controlled cluster access, protected service traffic, clear delivery configuration, and metrics that explain what happens under load.',
    approach: [
      'Define a private EKS endpoint and worker nodes with Terraform, then prepare the administration host and platform components with Ansible.',
      'Package the frontend, two FastAPI services, and Go routing service in Helm, with health probes, resource limits, network policies, and Istio strict mTLS.',
      'Build four container images with GitHub Actions, publish SHA-tagged versions, and update the Helm image tags in Git for Argo CD delivery.',
      'Expose controlled latency, error, and CPU-load simulations; use Prometheus and Grafana to inspect service traffic and autoscaling behavior.',
    ],
    evidence: [
      {
        label: 'Infrastructure as code',
        detail: 'Private EKS endpoint, private worker subnets, and managed node-group configuration.',
        url: 'https://github.com/Mahmoudmetwall2y/DEPI-Graduation-Project-/blob/main/infrastructure/terraform/EKS.tf',
      },
      {
        label: 'Delivery pipeline',
        detail: 'Four image builds, Docker Hub publishing, and SHA image-tag updates in Helm values.',
        url: 'https://github.com/Mahmoudmetwall2y/DEPI-Graduation-Project-/blob/main/.github/workflows/ci.yaml',
      },
      {
        label: 'Platform configuration',
        detail: 'Strict mTLS and telemetry autoscaling configured for two to six replicas.',
        url: 'https://github.com/Mahmoudmetwall2y/DEPI-Graduation-Project-/blob/main/infrastructure/helm/space-cargo/values.yaml',
      },
      {
        label: 'Operational dashboard',
        detail: 'Grafana panels for request rate, latency, errors, mesh traffic, HPA, and node resources.',
        url: 'https://github.com/Mahmoudmetwall2y/DEPI-Graduation-Project-/blob/main/infrastructure/monitoring/monitoring-server/grafana/dashboards/space-cargo/overview.json',
      },
    ],
    architecture: ['AWS ALB', 'Istio gateway', 'EKS services', 'Prometheus', 'Grafana'],
    accent: 'lime',
    filters: ['cloud'],
  },
  {
    id: 'ultimate-devops',
    number: '03',
    title: 'Ultimate DevOps',
    category: 'MICROSERVICES / OBSERVABILITY',
    kind: 'MICROSERVICES & OBSERVABILITY',
    summary: 'An instrumented microservice system with Kubernetes delivery, product-catalog CI, and a full telemetry path from services to dashboards.',
    description: 'My DevOps implementation around the OpenTelemetry Astronomy Shop: a distributed application with containerized services, Kubernetes configuration, and connected metrics and traces. The product-catalog pipeline builds, tests, publishes an image, and updates its deployment manifest.',
    tags: ['Kubernetes', 'Docker', 'OpenTelemetry', 'Grafana', 'GitHub Actions', 'Go'],
    repo: 'https://github.com/Mahmoudmetwall2y/ultimate-devops-project-demo',
    challenge: 'Understand and operate a distributed application across many services: how changes reach the cluster, how services communicate, and how telemetry makes their behavior visible.',
    approach: [
      'Work with the Astronomy Shop service topology, including the frontend, catalog, cart, checkout, payment, and shipping services.',
      'Define Kubernetes deployments and services, with a frontend proxy ingress and OpenTelemetry environment configuration.',
      'Configure a product-catalog workflow that builds and tests Go code, runs lint checks, publishes a Docker image, and updates its Kubernetes image tag.',
      'Connect service telemetry through the OpenTelemetry Collector to a dashboard and trace stack including Grafana, Prometheus, and Jaeger.',
    ],
    evidence: [
      { label: 'Product-catalog CI', detail: 'Go build, tests, lint, Docker publishing, and deployment image-tag updates.', url: 'https://github.com/Mahmoudmetwall2y/ultimate-devops-project-demo/blob/main/.github/workflows/ci.yaml' },
      { label: 'Kubernetes service topology', detail: 'Application services, environment configuration, and telemetry destinations.', url: 'https://github.com/Mahmoudmetwall2y/ultimate-devops-project-demo/blob/main/kubernetes/complete-deploy.yaml' },
      { label: 'Telemetry collection', detail: 'OpenTelemetry Collector receivers, processors, exporters, and signal pipelines.', url: 'https://github.com/Mahmoudmetwall2y/ultimate-devops-project-demo/blob/main/src/otel-collector/otelcol-config.yml' },
      { label: 'Operational dashboards', detail: 'Grafana panels included for the instrumented demo application.', url: 'https://github.com/Mahmoudmetwall2y/ultimate-devops-project-demo/blob/main/src/grafana/provisioning/dashboards/demo/demo-dashboard.json' },
    ],
    architecture: ['Microservices', 'OTel Collector', 'Prometheus', 'Jaeger', 'Grafana'],
    accent: 'blue',
    filters: ['delivery'],
    foundation: { label: 'OpenTelemetry Astronomy Shop and the iam-veeramalla DevOps demo', url: 'https://github.com/iam-veeramalla/ultimate-devops-project-demo' },
  },
]
