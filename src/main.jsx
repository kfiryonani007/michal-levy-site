import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { loadSiteContent } from './lib/loadSiteContent';
import './index.css';

/**
 * Content (site_settings + gallery_items) is fetched from Supabase and
 * mutated into src/data/site.js's exports BEFORE the first render — see
 * src/lib/loadSiteContent.js. That keeps every component's existing
 * `import { hero } from '../data/site'` working unchanged, and means
 * visitors never see a flash of placeholder copy being swapped for the real
 * thing (the seed values in site.js only show if this fetch fails).
 */
loadSiteContent().finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
