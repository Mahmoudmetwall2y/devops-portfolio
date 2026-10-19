# Project diagram prompts for Gemini or another diagram tool

Use the shared style block followed by one project prompt. Each architecture prompt stands alone as a diagram specification. The optional companion prompts explain delivery or telemetry in more detail. These describe the reviewed source revisions linked from the documentation, not a verified live deployment.

Ask for editable SVG when the tool supports it; otherwise use a high-resolution PNG or WebP. For a tool that produces diagram code, SVG or Mermaid is easier to correct than flattened text. Keep the portfolio's existing accessible HTML architecture descriptions even when adding generated artwork.

## Shared style block

```text
Create a precise, flat technical diagram for a premium Linux engineering portfolio.
Canvas: 2560 × 1600, landscape 16:10. Background #0e141b, component surfaces
#141c25, borders #303b47, primary text #e6edf3, secondary text #a3afbd.
Use #88e5a2 terminal green for delivery/control relationships and #8dbbfa
infrastructure blue for application/telemetry relationships.

Use a restrained IBM Plex Mono-like typeface for labels and a clear sans-serif
for explanations. Keep all essential labels large enough to read when the
image is displayed at roughly 1000px wide. Use generous spacing, a clear
reading order, and thin orthogonal arrows with arrowheads and protocol labels.
Use simple line icons sparingly. Include a compact legend. Solid arrows mean
configured relationships; dashed outlines mean an external dependency that
must be supplied. Do not use color alone to express meaning.

No gradients, 3D/perspective, glowing effects, decorative circuits, stock photos,
watermarks, invented dashboards, AWS accounts, IP addresses, credentials,
uptime numbers, performance metrics, production badges, or green success ticks.
Keep the exact component names and architectural boundaries in the specification.
Do not add an industry-standard component just because it would be desirable.

Include the caption: “Simplified configuration view — runtime verification is separate.”
Return an editable SVG if supported, otherwise a crisp high-resolution image.
Also provide a short plain-text description of the diagram for accessibility.
```

## 1. 3-Tier User Platform — application architecture

```text
Title: “3-Tier User Platform — Application and Delivery Boundaries”.
Use two clearly separated panels, application traffic above and delivery below.

APPLICATION PANEL:
1. Browser / React interface.
2. One application image, enclosed by one container boundary. Inside it show
   “Built React assets” served by “Express API / Node.js :5000”. Do not draw
   React and Express as two separately deployed application containers.
3. Express exposes CRUD at /api/users and connects to an external MySQL database.
4. Draw MySQL in a dashed dependency boundary labeled “Database / mysql Service
   must be provided separately”. Show the users table as the logical data store.
5. Connect “mysql-secret” to database environment configuration with a dashed
   control line. Label it “Secret definition must be supplied”.

DELIVERY PANEL:
Draw “GitHub repository” → “QA GitHub Actions” → “Application image / registry”.
Within QA, group Gitleaks, Checkov, Trivy and SonarQube as “Configured checks;
several are advisory”. Show “React build”, “Image/SBOM steps”, “QA manifest update”.
Show QA and production Kubernetes application manifests as two distinct lanes.
Production reads mutable latest, retags the image and updates its manifest.
Do not imply approved digest promotion from QA to production.
Show GitHub OIDC → AWS role → EKS apply / rollout commands as configured access,
with the explicit label “Configured commands; fork execution not verified”.

Footer notes: “Logical tiers: React / Express / MySQL”.
“Hands-on course reproduction; upstream application foundation credited”.
“Reviewed source: 8cf00a4”.
Do not add Terraform, database provisioning, probes, resource budgets, an installed
monitoring stack, enforced quality gates, automatic rollback, or production proof.
```

## 2. Space Cargo — network, platform, and metrics architecture

```text
Title: “Space Cargo — Application, Management, and Metrics”.
Use three labeled lanes. Make private and public boundaries explicit.

LANE A — APPLICATION TRAFFIC:
Internet/browser → “Internet-facing ALB / HTTP :80” → “Internal Istio gateway”
→ four ClusterIP services in private EKS worker subnets:
“Frontend / Nginx”, “Cargo / FastAPI”, “Telemetry / FastAPI”, “Routing / Go”.
The gateway has routes /, /api/cargo, /api/telemetry, /api/routing.
Show Cargo making HTTP service calls to Telemetry and Routing as well.
Within the mesh, label “STRICT mTLS / service-account authorization configured”.
Do not show TLS termination at the public ALB; this ingress config is HTTP.
Mark Cargo's state “In-memory; shared persistence not implemented”.
Mark Telemetry “CPU HPA configured: 2–6 replicas / 65% target”. This is a
configuration annotation, not a measured scaling result.

LANE B — PRIVATE MANAGEMENT:
Terraform → VPC / private EKS API and workers.
Administration host in VPC → private EKS API / HTTPS :443.
Ansible → platform components and Helm release commands.
Helm chart → workloads, resource budgets, probes, disruption budgets,
network policies and Istio resources.
GitHub Actions → four image builds/pushes → source-SHA tags in Helm values.
Label this “CI publication and Git update verified; cluster reconciliation separate”.
Do not add an Argo CD controller or Application: neither is supplied in this source.

LANE C — METRICS:
Application/Istio merged endpoints + Kubernetes/node metrics
→ in-cluster Prometheus / monitoring-agent namespace
→ remote_write over private VPC → central Prometheus → Grafana dashboards.
Do not add Jaeger, Loki, OpenSearch, distributed traces, or centralized logs here.

Put a small configuration-prerequisites note below the lanes:
“Additional eligible ALB subnet placement and kubectl/EKS alignment require review.”
Do not silently draw a complete two-public-subnet deployment when the reviewed
Terraform supplies only one public subnet.
Footer: “Reviewed source: efa13ec. CI run 29333854603 verifies image publishing
and Helm-tag updates, not Terraform apply, policy enforcement or a live cluster.”
```

## 3. Ultimate DevOps — separate Kubernetes and Compose views

```text
Title: “Ultimate DevOps — Application Delivery and Observability”.
Use two clearly separated panels, never one merged deployment boundary.

LEFT PANEL — KUBERNETES APPLICATION CONFIGURATION:
Show the Astronomy Shop frontend proxy / frontend, representative application
services, and product catalog as application Deployments and Services.
Label the frontend proxy “Service / Deployment; not a Kubernetes Ingress resource”.
Show application OTLP environment configuration pointing toward
“opentelemetry-demo-otelcol — referenced destination”. Put that destination in a
dashed boundary labeled “Collector/backend resources not supplied by this bundle”.
Do not draw Collector, Prometheus, Jaeger, Grafana or OpenSearch as workloads
installed by kubernetes/complete-deploy.yaml.

RIGHT PANEL — DOCKER COMPOSE TELEMETRY CONFIGURATION:
Application signals → OpenTelemetry Collector via OTLP gRPC / HTTP.
Inside the Collector show receivers → processors → distinct signal pipelines:
  Traces → transform / batch → Jaeger; debug output; spanmetrics connector.
  Metrics, including spanmetrics and configured host/container/service metrics
    → OTLP HTTP → Prometheus; debug output.
  Logs → OpenSearch; debug output.
Show Grafana querying three separate data sources: Prometheus, Jaeger, OpenSearch.
Do not show Prometheus as the log store or Jaeger as the metrics store.
Keep this entire signal path inside a boundary labeled “Docker Compose configuration”.

Small delivery strip:
Catalog pull request → Go build/test commands and independent lint job
→ multi-stage image build/publish → run-ID image tag
→ update kubernetes/productcatalog/deploy.yaml → forced main push.
Stop at Git. Label “No cluster apply/reconciliation step in this workflow”.
Add “The complete application bundle has a separate catalog image reference”.

Footer: “Hands-on course reproduction. Application foundation: creator repository
and OpenTelemetry Astronomy Shop. Reviewed source: c9f81ed.”
“Configuration reviewed; fork workflow execution and live telemetry not verified.”
No independently-authored-services claim, production badge, measured reliability
improvement, complete Kubernetes monitoring installation, or invented traffic data.
```

## Optional companion A — 3-Tier delivery detail

```text
Using the shared visual style, draw a two-lane QA / production delivery flow.
QA: qualifying qa branch push → configured checks/reports → client build dependency
→ image build/load, scan/SBOM steps → SHA/latest publication → QA manifest commit
→ OIDC / EKS apply and rollout commands. Mark the check group advisory where
exit-code zero or continue-on-error is configured. SonarQube is not a blocking
dependency of image publication. Distinguish Docker Buildx default Git context
from the filesystem source-SBOM step that requires a populated workspace.
Production: qualifying main push → pull latest → retag image → production manifest
commit → OIDC / EKS apply and rollout commands. Do not connect the lanes with
an approval gate or immutable digest promotion that is absent from the source.
Caption: “Configured workflow graph; no recorded Actions runs in this fork”.
```

## Optional companion B — Space Cargo delivery evidence

```text
Using the shared visual style, show four boundaries:
1. Terraform foundation and Ansible platform bootstrap — configured, execution unverified.
2. GitHub push CI — dependency/Go commands, four Docker image builds/pushes,
   source-SHA Helm-values commit — verified by run 29333854603 at d4d187a.
3. Helm desired state → application release — deployment execution separate.
4. Prometheus scrape → remote_write → central Prometheus → Grafana — configured,
   live samples and policy enforcement not demonstrated.
Use labels, not success icons, to distinguish verified CI from other stages.
Do not insert Argo CD into the implemented path. If mentioned at all, put it in
a detached “Future reconciliation work” note with no solid deployment arrow.
```

## Optional companion C — Ultimate signal routing detail

```text
Using the shared visual style, draw only the Docker Compose telemetry path:
OTLP gRPC/HTTP and additional metric receivers → Collector pipelines.
Traces → transform/batch → Jaeger + debug + spanmetrics connector.
spanmetrics connector → metrics pipeline.
Metrics → OTLP HTTP exporter → Prometheus OTLP receiver + debug.
Logs → OpenSearch exporter + debug.
Grafana → distinct Prometheus, Jaeger and OpenSearch data sources, with arrows
labeled “query”; distinguish query arrows from telemetry export arrows.
Caption: “Compose configuration — not a verified Kubernetes backend deployment”.
Include a small note that demo root/host mounts and insecure transport need
separate hardening. Do not invent live spans, chart values, latency gains or SLOs.
```

## Review before adding an image

Compare every arrow, protocol, label, and boundary with the page's source links. Regenerate or edit incorrect text; do not trust a visually polished output as architecture evidence. Check at desktop and mobile widths. Keep a readable HTML/text equivalent and descriptive alt text. Suggested asset names: `three-tier-architecture.webp`, `space-cargo-architecture.webp`, and `ultimate-devops-signals.webp`. Generated art should replace or supplement the intended figure only after review; none is required for the documentation pages to work.
