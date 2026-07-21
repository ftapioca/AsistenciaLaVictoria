import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = resolve(rootDir, 'dist');

if (!existsSync(distDir)) {
  console.error('No existe dist/. Ejecuta `npm run build` antes de `npm run deploy:pages`.');
  process.exit(1);
}

const rootFileCopies = [
  'index.html',
  'adminPanel.html',
  'adminPanel-preview.html',
  'administracion.html',
  'misTurnos.html',
  'misTurnos-design-system.html',
  'misTurnos-preview.html',
  'TurnosAbiertos.html',
  'horariosLocales.html',
  'programadorTurnos.html',
  'usuariosPermisos.html',
  'ventasMensuales.html',
  'pagosMensuales.html',
  'design-system.html',
  'app-config.js',
  'app-config.prod.js',
  'app-config.staging.js',
  'auth.js',
  'env-badge.js',
];

const directoryCopies = [
  'assets',
  'descargablesLocales',
];

rootFileCopies.forEach((file) => {
  const sourcePath = resolve(distDir, file);
  const destinationPath = resolve(rootDir, file);

  if (!existsSync(sourcePath)) {
    console.warn(`Omitido: ${file} no existe en dist/.`);
    return;
  }

  mkdirSync(dirname(destinationPath), { recursive: true });
  cpSync(sourcePath, destinationPath);
});

directoryCopies.forEach((directory) => {
  const sourcePath = resolve(distDir, directory);
  const destinationPath = resolve(rootDir, directory);

  if (!existsSync(sourcePath)) {
    console.warn(`Omitido: ${directory}/ no existe en dist/.`);
    return;
  }

  rmSync(destinationPath, { recursive: true, force: true });
  mkdirSync(dirname(destinationPath), { recursive: true });
  cpSync(sourcePath, destinationPath, { recursive: true });
});

console.log('GitHub Pages actualizado desde dist/ hacia el root publicado.');
