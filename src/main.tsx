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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
