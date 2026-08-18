import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build also works when index.html is opened
  // directly via file:// (double-click), not only when served over http.
  base: './',
  server: {
    port: 5173,
    open: false,
  },
  preview: {
    port: 4173,
    // `vite preview` rejects requests whose Host header it doesn't recognize
    // (e.g. a tunnel's random subdomain) unless every host is allowed here.
    // Only affects `npm run preview`, a local static server for checking a
    // production build — never the actual production deployment.
    allowedHosts: true,
  },
  build: {
    // Photos and videos dropped into src/media are imported through
    // import.meta.glob, so they are emitted as hashed assets. Raise the inline
    // limit to 0 so nothing ever gets base64'd into the JS bundle.
    assetsInlineLimit: 0,
  },
});
