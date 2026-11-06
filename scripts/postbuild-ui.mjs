import { uiEntries, staticFiles, staticDirectories } from './ui-entries.mjs';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = resolve(rootDir, 'dist');

const copyTargets = [...staticDirectories, ...staticFiles];
const builtEntryCopies = uiEntries.map(({ source, target }) => ({ from: source, to: target }));

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
