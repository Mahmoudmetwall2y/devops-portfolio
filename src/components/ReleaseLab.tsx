import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Code2, Container, GitBranch, Layers3, LoaderCircle, Play, Radio, RotateCcw } from 'lucide-react';

const stages = [
  { title: 'Commit', detail: 'Source controlled', icon: GitBranch, log: 'Source checked out. Every change starts here.' },
  { title: 'Build', detail: 'Test & package', icon: Container, log: 'Checks passed. Container image packaged.' },
  { title: 'Deploy', detail: 'Ship to cluster', icon: Layers3, log: 'Deployment rolled out. Health checks passed.' },
  { title: 'Observe', detail: 'Close the loop', icon: Radio, log: 'Metrics connected. Ready for the next change.' },
];

export default function ReleaseLab() {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (interval.current) clearInterval(interval.current); }, []);

  function run() {
    if (running) return;
    setRunning(true);
    setStep(0);
    setLogs(['Starting a new release…']);
    let current = 0;
    interval.current = setInterval(() => {
      const completedLog = stages[current].log;
      setLogs((previous) => [...previous.slice(-2), completedLog]);
      current += 1;
      setStep(current);
      if (current === stages.length) {
        if (interval.current) clearInterval(interval.current);
        interval.current = null;
        setRunning(false);
      }
    }, 1000);
  }

  return (
    <div className="release-lab">
      <div className="lab-topline"><span><span className="live-dot" /> THE RELEASE LAB</span><span>release.sh / bash</span></div>
      <div className="lab-title"><h2>A good day in DevOps.</h2><ArrowUpRight size={21} strokeWidth={1.5} /></div>
      <p className="lab-caption">Portfolio simulation: follow a change through source control, build, deployment, and observability.</p>
      <div className="pipeline" aria-label="Example pipeline: commit, build, deploy, observe">
        <svg className="pipeline-paths" viewBox="0 0 440 270" aria-hidden="true" preserveAspectRatio="none">
          <path className={step > 0 ? 'route route-active' : 'route'} d="M126 65H314" />
          <path className={step > 1 ? 'route route-active' : 'route'} d="M360 98V132Q360 145 345 145H95Q80 145 80 160V177" />
          <path className={step > 2 ? 'route route-active' : 'route'} d="M126 210H314" />
          <path className="feedback-route" d="M395 215H430V30H12V215H35" />
        </svg>
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const complete = step > index;
          const active = running && step === index;
          return (
            <div key={stage.title} className={`pipeline-node node-${index} ${complete ? 'is-complete' : ''} ${active ? 'is-active' : ''}`}>
              <span className="node-number">0{index + 1}</span>
              <div className="node-icon">{complete ? <Check size={24} /> : <Icon size={24} strokeWidth={1.5} />}</div>
              <strong>{stage.title}</strong><small>{stage.detail}</small>
              {active && <span className="node-pulse" />}
            </div>
          );
        })}
        <span className="route-label route-label-top">CI / AUTOMATION</span>
        <span className="route-label route-label-bottom">CD / RELIABILITY</span>
        <span className="feedback-label">CONTINUOUS FEEDBACK</span>
      </div>
      <div className="lab-terminal">
        <div className="terminal-heading"><span><Code2 size={13} /> release.log</span><span className="demo-label">SIMULATION / NO LIVE INFRASTRUCTURE</span></div>
        <div className="terminal-lines" aria-live="polite" aria-atomic="true">
          {logs.length ? logs.map((log, index) => <p key={`${index}-${log}`}><span>›</span> {log}</p>) : <><p><span>$</span> ./make-it-repeatable.sh</p><p className="terminal-hint">A little automation goes a long way.</p></>}
        </div>
      </div>
      <div className="lab-bottomline"><span><span className={`status-dot ${running ? 'status-running' : ''}`} /> {running ? 'RELEASE IN PROGRESS' : step === 4 ? 'RELEASE COMPLETE' : 'READY WHEN YOU ARE'}</span><button type="button" onClick={run} disabled={running}>{running ? <LoaderCircle size={13} className="spin" /> : step === 4 ? <RotateCcw size={13} /> : <Play size={13} />} {running ? 'Running' : step === 4 ? 'Run again' : 'Run pipeline'}</button></div>
    </div>
  );
}
