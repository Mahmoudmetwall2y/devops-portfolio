import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/manrope';
import '@fontsource/ibm-plex-mono/latin-400.css';
import App from './App';
import './styles.css';
import './redesign.css';
import './refinement.css';
import './palette.css';
import './terminal.css';
import './case-study.css';

const ProjectPage = React.lazy(() => import('./ProjectPage'));
const isProjectPage = window.location.pathname.startsWith('/projects/');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense fallback={<main className="page-width" aria-busy="true"><p>Opening project documentation…</p></main>}>
      {isProjectPage ? <ProjectPage /> : <App />}
    </React.Suspense>
  </React.StrictMode>,
);
