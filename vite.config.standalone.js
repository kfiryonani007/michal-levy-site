import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * A separate build target that inlines everything (JS, CSS) into one
 * index.html with a plain <script> instead of type="module". Regular browser
 * security blocks ES module scripts from running over file:// — that's the
 * "white screen" when someone double-clicks the normal build's index.html
 * without a server. This config exists only to produce that no-server,
 * double-click-and-it-works copy for handoff. Day-to-day dev/build still use
 * the regular vite.config.js.
 */
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: {
    outDir: 'dist-standalone',
    assetsInlineLimit: 100 * 1024 * 1024,
    cssCodeSplit: false,
  },
});
