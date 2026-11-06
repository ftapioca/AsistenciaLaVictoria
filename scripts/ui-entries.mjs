// Entradas Vite y rutas publicadas. Las rutas existentes se conservan.
export const siteBase = '/AsistenciaLaVictoria/';
export const uiEntries = [
  { name: 'index', source: 'src/index.html', target: 'index.html' },
  { name: 'designSystem', source: 'src/designSystem.html', target: 'design-system.html' },
  { name: 'adminPanel', source: 'src/adminPanel.html', target: 'adminPanel.html' },
  { name: 'administracion', source: 'src/administracion.html', target: 'administracion.html' },
  { name: 'locales', source: 'src/locales.html', target: 'locales.html' },
  { name: 'adminPanelPreview', source: 'src/adminPanel-preview.html', target: 'adminPanel-preview.html' },
  { name: 'misTurnos', source: 'src/misTurnos.html', target: 'misTurnos-design-system.html' },
  { name: 'misTurnosPreview', source: 'src/misTurnos-preview.html', target: 'misTurnos-preview.html' },
  { name: 'programadorTurnos', source: 'src/programadorTurnos.html', target: 'programadorTurnos.html' },
  { name: 'horariosLocales', source: 'src/horariosLocales.html', target: 'horariosLocales.html' },
  { name: 'usuariosPermisos', source: 'src/usuariosPermisos.html', target: 'usuariosPermisos.html' },
  { name: 'turnosAbiertos', source: 'src/TurnosAbiertos.html', target: 'TurnosAbiertos.html' },
  { name: 'ventasMensuales', source: 'src/ventasMensuales.html', target: 'ventasMensuales.html' },
  { name: 'pagosMensuales', source: 'src/pagosMensuales.html', target: 'pagosMensuales.html' },
];

export const staticFiles = [
  // Calendario publicado actualmente; su sustitucion requiere una validacion aparte.
  'misTurnos.html',
  'app-config.js',
  'app-config.prod.js',
  'app-config.staging.js',
  'auth.js',
  'env-badge.js',
];

export const staticDirectories = ['descargablesLocales'];
