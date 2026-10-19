import { useId, useLayoutEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { ArrowDown } from 'lucide-react';
import type { Project } from '../data/projects';

export function CaseArchitecture({ project }: { project: Project }) {
  const captionId = useId();
  const architecture = project.caseStudy.architecture;
  return <figure className="case-architecture" aria-labelledby={captionId}>
    <figcaption id={captionId}><span className="eyebrow">FIG. {project.number} / SIMPLIFIED CONFIGURATION VIEW</span><p>{architecture.description}</p></figcaption>
    {project.diagram && <img className="case-architecture-image" src={project.diagram.url} alt={project.diagram.alt} loading="lazy" />}
    <div className={`case-architecture-lanes ${architecture.lanes.length === 3 ? 'lanes-three' : ''}`}>{architecture.lanes.map((lane) => <div className="case-architecture-lane" key={lane.title}>
      <h4>{lane.title}</h4><ol>{lane.nodes.map((node, index) => <li key={node.title}>
        {index > 0 && <div className="case-architecture-edge"><ArrowDown size={22} aria-hidden="true" />{node.via && <span>{node.via}</span>}</div>}
        <div className="case-architecture-node"><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><strong>{node.title}</strong><p>{node.detail}</p></div></div>
      </li>)}</ol>
    </div>)}</div>
  </figure>;
}

function Tier({ x, y, name, detail, number }: { x: number; y: number; name: string; detail: string; number: string }) {
  return <g className={`iso-tier iso-tier-${number}`} transform={`translate(${x} ${y})`}><path className="tier-top" d="M0 0L210 -36L280 0L70 36Z" /><path className="tier-front" d="M70 36L280 0V61L70 97Z" /><path className="tier-side" d="M0 0L70 36V97L0 61Z" /><path className="tier-line" d="M70 36L280 0M70 36V97" /><text className="tier-number" x="20" y="44">{number}</text><text className="tier-name" x="91" y="61" transform="rotate(-9 91 61)">{name}</text><text className="tier-detail" x="91" y="80" transform="rotate(-9 91 80)">{detail}</text><circle className="tier-led" cx="248" cy="23" r="3" /></g>;
}

export default function ProjectGraphic({ id, compact = false }: { id: string; compact?: boolean }) {
  const gridId = `grid-${useId().replaceAll(':', '')}`;
  const art = useRef<SVGSVGElement>(null);
  const reducedMotion = useReducedMotion();
  useLayoutEffect(() => {
    // SVG animateMotion has its own clock; CSS animation rules cannot stop it.
    if (reducedMotion) art.current?.pauseAnimations();
    else art.current?.unpauseAnimations();
  }, [reducedMotion]);
  const nodes = [{ x: 100, y: 130, label: 'FRONTEND' }, { x: 350, y: 110, label: 'CATALOG' }, { x: 430, y: 250, label: 'CHECKOUT' }, { x: 355, y: 375, label: 'PAYMENT' }, { x: 115, y: 365, label: 'CART' }, { x: 50, y: 255, label: 'SHIPPING' }];
  return <div className={`project-graphic architecture-graphic architecture-${id} ${compact ? 'compact-graphic' : ''}`} aria-hidden="true"><div className="architecture-top"><span>{id === 'three-tier' ? 'SECURE DELIVERY / THREE TIERS' : id === 'space-cargo' ? 'CLOUD PLATFORM / FOUR SERVICES' : 'DISTRIBUTED SYSTEM / CONNECTED SIGNALS'}</span><span>FIG. {id === 'three-tier' ? '01' : id === 'space-cargo' ? '02' : '03'}</span></div><svg ref={art} className="architecture-art" viewBox="0 0 520 470" fill="none"><defs><pattern id={gridId} width="35" height="35" patternUnits="userSpaceOnUse"><path d="M35 0H0V35" stroke="currentColor" strokeOpacity=".07" /></pattern></defs><rect width="520" height="470" fill={`url(#${gridId})`} />
    {id === 'three-tier' ? <><path className="architecture-wire" d="M45 110H83V160M417 200H475V330H400M140 400H430" /><Tier x={128} y={75} name="WEB" detail="REACT / USER INTERFACE" number="01" /><Tier x={128} y={199} name="API" detail="EXPRESS / APPLICATION" number="02" /><Tier x={128} y={323} name="DATA" detail="MYSQL / PERSISTENCE" number="03" /><g className="architecture-label"><text x="30" y="90">GIT PUSH</text><text x="403" y="174">QA / PROD</text></g><path className="tier-connect" d="M252 173V186M252 297V310" /><circle className="diagram-signal" cx="475" cy="270" r="4" /><text className="architecture-caption" x="260" y="456" textAnchor="middle">SCAN → BUILD → PROMOTE → DEPLOY</text></> : id === 'space-cargo' ? <><rect className="cluster-outline" x="55" y="112" width="410" height="264" rx="22" /><text className="cluster-title" x="260" y="99" textAnchor="middle">AWS EKS / PRIVATE CLUSTER</text><path className="architecture-wire" d="M260 47V112M260 376V422M153 229H366M153 293H366" /><g className="cloud-icon"><path d="M242 50H280A14 14 0 0 0 280 22A22 22 0 0 0 239 17A17 17 0 0 0 242 50Z" /><text x="260" y="75" textAnchor="middle">TERRAFORM</text></g>{[{x:96,y:152,label:'FRONTEND',code:'NGINX'},{x:284,y:152,label:'CARGO',code:'FASTAPI'},{x:96,y:272,label:'TELEMETRY',code:'FASTAPI'},{x:284,y:272,label:'ROUTING',code:'GO'}].map((service,index)=><g key={service.label} className="service-pod" transform={`translate(${service.x} ${service.y})`}><rect width="141" height="74" rx="8" /><path d="M18 21L27 16L36 21V31L27 36L18 31Z M27 26V36M18 21L27 26L36 21" /><text className="pod-label" x="52" y="31">{service.label}</text><text className="pod-code" x="52" y="49">{service.code}</text><circle className={`pod-status pod-status-${index}`} cx="121" cy="14" r="3" /></g>)}<text className="mesh-label" x="260" y="251" textAnchor="middle">ISTIO / STRICT mTLS</text><rect className="observability-node" x="138" y="403" width="244" height="40" rx="6" /><text className="observability-text" x="260" y="428" textAnchor="middle">PROMETHEUS + GRAFANA</text></> : <>{nodes.map((node)=><path key={node.label} className="constellation-wire" d={`M260 245L${node.x} ${node.y}`} />)}<circle className="collector-orbit" cx="260" cy="245" r="75" /><circle className="collector-core" cx="260" cy="245" r="52" /><text className="collector-label" x="260" y="241" textAnchor="middle">OTEL</text><text className="collector-detail" x="260" y="260" textAnchor="middle">COLLECTOR</text>{nodes.map((node,index)=><g key={node.label} className={`constellation-node constellation-node-${index}`}><circle cx={node.x} cy={node.y} r="20" /><path d={`M${node.x-6} ${node.y-3}L${node.x} ${node.y-7}L${node.x+6} ${node.y-3}V${node.y+4}L${node.x} ${node.y+8}L${node.x-6} ${node.y+4}Z`} /><text x={node.x} y={node.y+40} textAnchor="middle">{node.label}</text></g>)}<text className="architecture-caption" x="260" y="458" textAnchor="middle">METRICS / TRACES / LOGS (COMPOSE)</text><circle className="telemetry-signal" r="4"><animateMotion dur="3s" repeatCount="indefinite" path="M100 130L260 245" /></circle><circle className="telemetry-signal" r="4"><animateMotion dur="3.7s" repeatCount="indefinite" path="M430 250L260 245" /></circle></>}
  </svg><div className="architecture-bottom"><span><i /> {id === 'three-tier' ? 'ENVIRONMENTS, CONFIGURED.' : id === 'space-cargo' ? 'BUILT TO BE OBSERVED.' : 'EVERY SIGNAL TELLS A STORY.'}</span><span>+</span></div></div>;
}
