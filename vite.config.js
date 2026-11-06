import { uiEntries, siteBase } from './scripts/ui-entries.mjs';
import { defineConfig } from 'vite';

export default defineConfig({
  base: siteBase,
  server: {
    open: '/src/index.html',
    port: 3000,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(uiEntries.map(({ name, source }) => [name, source])),
      output: {
        manualChunks: undefined,
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
});
