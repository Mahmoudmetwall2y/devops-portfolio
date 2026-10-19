# Featured project evidence audit

This audit separates repository configuration, recorded automated execution, owner-described learning, and deployment/production evidence. Only public project sources were inspected. No project scripts, workflows, Terraform, Ansible, or infrastructure commands were executed. The source repositories were not modified.

The owner clarified that the forked course projects were recreated hands-on after watching Udemy lessons, with forks retained for organization. That is the learning context shown in the portfolio. A fork matching upstream does not disprove personal practice; it does mean that its contents alone cannot independently prove that practice or original code authorship.

## 1. 3-Tier User Platform

Reviewed source: [8cf00a4](https://github.com/Mahmoudmetwall2y/3-Tier-User-Platform-Project/tree/8cf00a4166acb21ef791f48234e77951eb43cb37). GitHub's cross-fork comparison reported **identical** to `jaiswaladi246/main`. The minimal README provides no deployment demonstration. The Actions API returned **zero runs** for this fork at inspection.

Supported configuration:

- [Server](https://github.com/Mahmoudmetwall2y/3-Tier-User-Platform-Project/blob/8cf00a4166acb21ef791f48234e77951eb43cb37/server/server.js) exposes user CRUD operations, serves the static client, and connects to MySQL. React, Express, and MySQL are logical tiers; UI and API are packaged in one application image.
- [Dockerfile](https://github.com/Mahmoudmetwall2y/3-Tier-User-Platform-Project/blob/8cf00a4166acb21ef791f48234e77951eb43cb37/Dockerfile) builds the client, copies `client/public` into the server, and declares a non-root runtime. The Webpack output configuration was inspected to verify that path.
- [QA workflow](https://github.com/Mahmoudmetwall2y/3-Tier-User-Platform-Project/blob/8cf00a4166acb21ef791f48234e77951eb43cb37/.github/workflows/qa-cicd.yml) defines Gitleaks, Checkov, Trivy, SonarQube, SBOM steps, image publication, QA manifest updates, OIDC credentials, apply commands, and a rollout check.
- Scan findings are advisory: Gitleaks/Trivy use exit-code zero, Checkov errors are ignored, and lint/test/quality-gate steps can continue on error. Neither application package defines lint/test scripts. The image job depends on client build, not SonarQube. There are no Terraform files to substantiate Terraform scan coverage.
- Docker Buildx's default Git context supplies source without checkout. The separate filesystem source-SBOM step uses `path: .` without a job-local checkout; its source coverage requires validation. Absence of checkout alone is **not** proof that the Docker build fails. [Docker's action documentation](https://github.com/docker/build-push-action#git-context) confirms that distinction.
- [Production workflow](https://github.com/Mahmoudmetwall2y/3-Tier-User-Platform-Project/blob/8cf00a4166acb21ef791f48234e77951eb43cb37/.github/workflows/prod-cd.yaml) pulls mutable `latest`, retags it with the workflow SHA, writes a production manifest, then requests an EKS deployment. This is not verified digest promotion or evidence of an approval boundary.
- QA/prod Deployment, Service, and Ingress files exist; their database connection values reference a Secret. MySQL provisioning, Secret definitions, namespace creation, probes, resource budgets, network isolation, and IAM least-privilege policy are not supplied by those files.

Not established: successful scans/tests/publishing, actual QA/prod deployment, supplied database/bootstrap resources, monitoring outcomes, independently recorded personal execution, or production operation. Attribution to the creator applies to the application and inherited delivery configuration.

## 2. Space Cargo

Reviewed source: [efa13ec](https://github.com/Mahmoudmetwall2y/DEPI-Graduation-Project-/tree/efa13ecd127257130c6aca4d5410ae750e164d5a). The history includes multiple contributors. Account-linked changes specifically support Mahmoud's [per-pod metrics work](https://github.com/Mahmoudmetwall2y/DEPI-Graduation-Project-/commit/200332203abe8f94ca283d44e420cb4f1365e392) and [Grafana dashboard work](https://github.com/Mahmoudmetwall2y/DEPI-Graduation-Project-/commit/61680c3ffabe4985b4216729db6ef4b772fbc9df); these commit file lists were checked.

Supported configuration and execution:

- [Terraform EKS](https://github.com/Mahmoudmetwall2y/DEPI-Graduation-Project-/blob/efa13ecd127257130c6aca4d5410ae750e164d5a/infrastructure/terraform/EKS.tf) defines a private-only API, private worker subnets, and managed nodes. [VPC configuration](https://github.com/Mahmoudmetwall2y/DEPI-Graduation-Project-/blob/efa13ecd127257130c6aca4d5410ae750e164d5a/infrastructure/terraform/vpc.tf) defines public/private routes, NAT, and manager security-group API access. This is platform configuration, not proof of Terraform application.
- [Ansible](https://github.com/Mahmoudmetwall2y/DEPI-Graduation-Project-/blob/efa13ecd127257130c6aca4d5410ae750e164d5a/infrastructure/ansible/playbooks/deploy-eks.yml) configures the load-balancer controller, metrics-server, Istio/CNI, application namespace policy, and Helm deployment commands. No Argo CD installation or Application resource was found. Git updates are implemented; Argo CD reconciliation remains a documented direction.
- [ALB ingress](https://github.com/Mahmoudmetwall2y/DEPI-Graduation-Project-/blob/efa13ecd127257130c6aca4d5410ae750e164d5a/infrastructure/istio/aws-alb-ingress.yaml) is internet-facing HTTP on port 80 and forwards to an internal gateway. Private cluster administration does not imply a private or TLS-protected public application.
- The supplied Terraform defines one public subnet. An Availability Zone ALB needs subnets in at least two zones; additional public subnet placement must be established. This is an inferred provisioning prerequisite, not an observed deployment failure. [AWS ALB requirements](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/application-load-balancers.html#subnets-load-balancer) support that requirement.
- Helm defines Nginx frontend, FastAPI cargo/telemetry, and Go routing workloads, with non-root/read-only runtimes, dropped capabilities, seccomp, probes, resource budgets, rolling updates, and selected PDBs. Cargo keeps in-memory state. Values configure a telemetry CPU HPA with 2–6 replicas; no observed scaling is inferred.
- Istio templates request STRICT mTLS, service-account allow rules, destination rules, and outlier controls. NetworkPolicy resources define permitted paths. Actual enforcement requires an applied compatible CNI/mesh, which was not verified.
- [Run 29333854603](https://github.com/Mahmoudmetwall2y/DEPI-Graduation-Project-/actions/runs/29333854603), a successful push run at `d4d187afe7d74a370da3c241ecfe6f503471c893`, records successful dependency/Go-command, Docker login, four image build/push, and Helm-tag commit steps. Both job records and step conclusions were checked. The Python step installs dependencies; no Python test execution is defined. No routing `_test.go` files were found, so command success is not substantive test coverage.
- CI writes source-SHA image tags into all four Helm values. Traceable tags are not enforced immutable digests. The successful run predates the reviewed HEAD and does not establish later infrastructure execution.
- [In-cluster Prometheus](https://github.com/Mahmoudmetwall2y/DEPI-Graduation-Project-/blob/efa13ecd127257130c6aca4d5410ae750e164d5a/infrastructure/monitoring/prometheus-server/prometheus-server.yaml) scrapes merged application/Istio, Kubernetes, and node metrics, then remote-writes to central Prometheus. Systemd listener overrides, a Grafana data source, and dashboard queries exist. No private host addresses or credentials are reproduced in portfolio copy.
- SSH is open to all IPv4 sources in the manager Terraform group, and monitoring docs describe unauthenticated public demo UI access. Ansible defaults use kubectl 1.35 against Terraform's EKS 1.31, outside the documented one-minor client skew. [Kubernetes version policy](https://kubernetes.io/releases/version-skew-policy/#kubectl) supports the version-alignment concern. Some guides describe an older monitoring state; current code and monitoring README were preferred over those statements.

Not established: successful Terraform/Ansible application, deployed ALB/Helm/Argo CD, enforced network/mTLS policies, measured load/latency/error experiments, actual HPA movement, collected live dashboard signals, centralized tracing/logs, sole authorship, or production operation.

## 3. Ultimate DevOps

Reviewed source: [c9f81ed](https://github.com/Mahmoudmetwall2y/ultimate-devops-project-demo/tree/c9f81edab0792575062681e6f4895536bba492d2). GitHub's comparison reported **identical** to `iam-veeramalla/main`. README explicitly credits the OpenTelemetry demo. Upstream README badges are not execution evidence for this fork. The Actions API returned **zero runs** for this fork at inspection.

Supported configuration:

- [Catalog CI](https://github.com/Mahmoudmetwall2y/ultimate-devops-project-demo/blob/c9f81edab0792575062681e6f4895536bba492d2/.github/workflows/ci.yaml) triggers on pull requests, defines Go build/test commands, a separate lint job, run-ID image publication, and a forced main push updating `kubernetes/productcatalog/deploy.yaml`. Lint is not a prerequisite for the Docker job. No catalog `_test.go` files were found, and the workflow has no deployment command.
- [Catalog packaging](https://github.com/Mahmoudmetwall2y/ultimate-devops-project-demo/blob/c9f81edab0792575062681e6f4895536bba492d2/src/product-catalog/Dockerfile) is a multi-stage Go/Alpine build; it does not declare a non-root release user.
- [Kubernetes bundle](https://github.com/Mahmoudmetwall2y/ultimate-devops-project-demo/blob/c9f81edab0792575062681e6f4895536bba492d2/kubernetes/complete-deploy.yaml) defines application services/deployments and OTLP destination variables. Its frontend proxy is not an Ingress resource. It does not include the referenced Collector/backend deployments and retains an upstream catalog image, separate from the workflow-updated manifest.
- [Docker Compose](https://github.com/Mahmoudmetwall2y/ultimate-devops-project-demo/blob/c9f81edab0792575062681e6f4895536bba492d2/docker-compose.yml) supplies the telemetry stack. The [Collector](https://github.com/Mahmoudmetwall2y/ultimate-devops-project-demo/blob/c9f81edab0792575062681e6f4895536bba492d2/src/otel-collector/otelcol-config.yml) receives OTLP and metrics, transforms/batches traces, sends traces to Jaeger/debug/spanmetrics, sends metrics through OTLP HTTP to Prometheus/debug, and sends logs to OpenSearch/debug. `spanmetrics` feeds the metrics pipeline.
- Grafana provisions separate Prometheus, Jaeger, and OpenSearch data sources. Dashboard files are inherited demo artifacts. The extra Collector config was inspected and contains commented examples rather than active overrides.
- Compose runs the Collector as root with host filesystem and Docker socket mounts. Backend transport uses demo HTTP/insecure settings. Those are not hardened production controls.

Not established: independent application authorship, successful catalog CI/publication, Kubernetes rollout or backend provisioning, collected live telemetry, measured reliability gains, personally recorded execution, or production operation.

## Evidence that would strengthen the personal implementation story

Useful additions are personal reproduction notes/course references, a recording or screenshots tied to a source revision, owned workflow runs with step logs/artifacts, sanitized Terraform/Ansible outputs, rollout and health-check outputs, and demonstrated policy/telemetry/HPA checks. For Space Cargo, distinguish the already verified CI run from deployment verification. Any production claim needs separate proof of the environment and actual operating responsibility; no featured project is currently presented as production operation.

These are proof requests, not instructions to run infrastructure or publish sensitive information. No employer details, CV facts, or contact information were changed.
