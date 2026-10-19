import { useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { IntentLink } from 'sanity/router';
import './dashboard.css';

export function Dashboard() {
  const client = useClient({ apiVersion: '2025-02-19' });
  const [data, setData] = useState<{ projects: number; drafts: number; profile: boolean } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let disposed = false;
    const query = '*[_type in ["portfolioSettings", "portfolioProject"]]{_id,_type}';
    const update = async () => {
      try {
        const rows = await client.withConfig({ perspective: 'raw', useCdn: false }).fetch<{ _id: string; _type: string }[]>(query);
        if (!disposed) { setData({ projects: new Set(rows.filter(row => row._type === 'portfolioProject').map(row => row._id.replace(/^drafts\./, ''))).size, drafts: rows.filter(row => row._id.startsWith('drafts.')).length, profile: rows.some(row => row._type === 'portfolioSettings') }); setError(false); }
      } catch { if (!disposed) setError(true); }
    };
    void update();
    const subscription = client.listen(query, {}, { includeResult: false }).subscribe({ next: () => { void update(); }, error: () => { if (!disposed) setError(true); } });
    return () => { disposed = true; subscription.unsubscribe(); };
  }, [client]);
  return <main className="cms-dashboard"><div className="cms-titlebar"><span className="cms-dots" aria-hidden="true"><i /><i /><i /></span><span>mahmoud@linux: ~/portfolio/admin</span><span>AUTHENTICATED WORKSPACE</span></div><p className="cms-eyebrow">PORTFOLIO CONTROL PANEL</p><h1>Your work.<br /><span>Your next update.</span></h1><p className="cms-intro">Update your profile, publish engineering projects, and keep the details behind the diagrams in one place.</p><div className="cms-stats" aria-live="polite"><div><strong>{data?.projects ?? '—'}</strong><span>Projects</span></div><div><strong>{data?.drafts ?? '—'}</strong><span>Unpublished drafts</span></div><div><strong>{data ? data.profile ? 'Ready' : 'Not imported' : '—'}</strong><span>Profile content</span></div></div>{error && <p role="alert" className="cms-error">Content status could not be loaded. Check your Sanity access and network connection.</p>}<section className="cms-actions" aria-label="Manage portfolio"><article><span className="cms-eyebrow">01 / THE PERSON</span><h2>Profile & media</h2><p>Change your photo, biography, CV, contact links, professional experience, and website URL.</p><IntentLink intent="edit" params={{ id: 'portfolio-settings', type: 'portfolioSettings' }} className="cms-button">Edit profile <span aria-hidden="true">↗</span></IntentLink></article><article><span className="cms-eyebrow">02 / THE ENGINEERING</span><h2>Projects & documentation</h2><p>Add a project, choose its display order, upload diagrams, and edit its complete engineering documentation.</p><IntentLink intent="create" params={{ type: 'portfolioProject' }} className="cms-button">Add a project <span aria-hidden="true">＋</span></IntentLink></article></section><section className="cms-publishing"><span className="cms-eyebrow">PUBLISHING WORKFLOW</span><h2>Draft → preview → publish → rebuild</h2><p>Use the project or profile editor to save drafts, open the Preview draft tab, and publish when ready. A configured Sanity webhook then starts a Netlify build. Unpublishing or deleting a project removes it on the next successful build.</p><p>Published content is public website content. Keep passwords, tokens, private infrastructure details, and deployment hook URLs out of these fields.</p><a href="/" target="_blank" rel="noreferrer">Open public portfolio ↗</a></section></main>;
}
