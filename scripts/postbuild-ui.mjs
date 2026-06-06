import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = resolve(rootDir, 'dist');

const copyTargets = [
  'descargablesLocales',
  'TurnosAbiertos.html',
  'programadorTurnos.html',
  'ventasMensuales.html',
  'misTurnos.html',
  'app-config.js',
  'app-config.prod.js',
  'app-config.staging.js',
  'auth.js',
  'env-badge.js',
];

const builtEntryCopies = [
  { from: 'src/index.html', to: 'index.html' },
  { from: 'src/adminPanel.html', to: 'adminPanel.html' },
  { from: 'src/adminPanel-preview.html', to: 'adminPanel-preview.html' },
  { from: 'src/misTurnos.html', to: 'misTurnos-design-system.html' },
  { from: 'src/misTurnos-preview.html', to: 'misTurnos-preview.html' },
  { from: 'src/programadorTurnos.html', to: 'programadorTurnos.html' },
  { from: 'src/TurnosAbiertos.html', to: 'TurnosAbiertos.html' },
  { from: 'src/ventasMensuales.html', to: 'ventasMensuales.html' },
  { from: 'src/designSystem.html', to: 'design-system.html' },
];

if (!existsSync(distDir)) {
  process.exit(0);
}

copyTargets.forEach((target) => {
  const sourcePath = resolve(rootDir, target);
  const destinationPath = resolve(distDir, target);

  if (!existsSync(sourcePath)) {
    return;
  }

  mkdirSync(dirname(destinationPath), { recursive: true });
  cpSync(sourcePath, destinationPath, { recursive: true });
});

builtEntryCopies.forEach(({ from, to }) => {
  const sourcePath = resolve(distDir, from);
  const destinationPath = resolve(distDir, to);

  if (!existsSync(sourcePath)) {
    return;
  }

  mkdirSync(dirname(destinationPath), { recursive: true });
  cpSync(sourcePath, destinationPath);
});
