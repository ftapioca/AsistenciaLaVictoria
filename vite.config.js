import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: '/src/index.html',
    port: 3000,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        designSystem: 'src/index.html',
        adminPanel: 'src/adminPanel.html',
        adminPanelPreview: 'src/adminPanel-preview.html',
        misTurnos: 'src/misTurnos.html',
        misTurnosPreview: 'src/misTurnos-preview.html',
      },
      output: {
        manualChunks: undefined,
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
});
