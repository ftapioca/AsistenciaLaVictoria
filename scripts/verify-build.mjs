import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { uiEntries, staticFiles, siteBase } from './ui-entries.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = resolve(root, 'dist');
const origin = 'https://build.local';
const base = siteBase;
const targets = [...uiEntries.map(({ target }) => target), ...staticFiles];
const checked = new Set();
for (const file of targets) {
  const path = resolve(dist, file);
  if (!existsSync(path)) throw new Error(`Falta el archivo publicado: ${file}`);
  if (!file.endsWith('.html')) continue;
  const html = readFileSync(path, 'utf8');
  for (const match of html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)=["']([^"']+)["']/g)) {
    const url = new URL(match[1], `${origin}${base}${file}`);
    if (url.origin !== origin) continue;
    if (!url.pathname.startsWith(base)) throw new Error(`Ruta fuera del sitio en ${file}: ${url.pathname}`);
    const asset = decodeURIComponent(url.pathname.slice(base.length));
    const assetPath = resolve(dist, asset);
    if (relative(dist, assetPath).startsWith('..') || !existsSync(assetPath)) throw new Error(`Recurso ausente en ${file}: ${asset}`);
    checked.add(asset);
  }
}
// La ruta antigua del calendario sigue sirviendo su contenido actual.
if (readFileSync(resolve(root, 'misTurnos.html'), 'utf8') !== readFileSync(resolve(dist, 'misTurnos.html'), 'utf8')) {
  throw new Error('El empaquetado altero la ruta existente misTurnos.html.');
}
console.log(`Build verificado: ${uiEntries.length} paginas y ${checked.size} recursos locales; calendario existente conservado.`);
