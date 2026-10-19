import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './dashboard.css';
const ConnectedStudio = React.lazy(() => import('./Studio'));
const configured = /^[a-z0-9]+$/.test(__SANITY_PROJECT_ID__) && /^[a-z0-9_-]+$/.test(__SANITY_DATASET__);
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode>{configured ? <Suspense fallback={<main className="cms-dashboard" aria-busy="true"><p>Opening your authenticated content workspace…</p></main>}><ConnectedStudio /></Suspense> : <main className="cms-dashboard"><p className="cms-eyebrow">PORTFOLIO CONTROL PANEL</p><h1>Connect your workspace.</h1><p>Set SANITY_PROJECT_ID and SANITY_DATASET in the build environment, then rebuild the dashboard. Sign-in and content storage are provided by Sanity.</p><a className="cms-button" href="https://www.sanity.io/manage" target="_blank" rel="noreferrer">Open Sanity project settings ↗</a><a className="cms-link" href="/">Back to portfolio</a></main>}</React.StrictMode>);
