import { defineConfig } from 'vite';

export default defineConfig({
  base: '/AsistenciaLaVictoria/',
  server: {
    open: '/src/index.html',
    port: 3000,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: 'src/index.html',
        designSystem: 'src/designSystem.html',
        adminPanel: 'src/adminPanel.html',
        adminPanelPreview: 'src/adminPanel-preview.html',
        misTurnos: 'src/misTurnos.html',
        misTurnosPreview: 'src/misTurnos-preview.html',
        programadorTurnos: 'src/programadorTurnos.html',
        turnosAbiertos: 'src/TurnosAbiertos.html',
        ventasMensuales: 'src/ventasMensuales.html',
        pagosMensuales: 'src/pagosMensuales.html',
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
