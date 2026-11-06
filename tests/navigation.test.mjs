import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withCurrentEnvironment } from '../src/utils/navigation.js';
import { waitNextFrame } from '../src/utils/async.js';

test('navegacion conserva entorno, parametros y fragmento al cambiar de pagina', () => {
  const previous = globalThis.window;
  try {
    for (const env of ['prod', 'staging']) {
      globalThis.window = { location: { href: 'https://example.test/AsistenciaLaVictoria/adminPanel.html?env=prod' }, APP_CONFIG: { ENVIRONMENT: env } };
      const url = new URL(withCurrentEnvironment('programadorTurnos.html?fecha=2026-11-02&env=otro#agenda'));
      assert.equal(url.pathname, '/AsistenciaLaVictoria/programadorTurnos.html');
      assert.equal(url.searchParams.get('env'), env);
      assert.equal(url.searchParams.get('fecha'), '2026-11-02');
      assert.equal(url.hash, '#agenda');
    }
    window.APP_CONFIG = undefined;
    assert.equal(new URL(withCurrentEnvironment('index.html?env=staging')).searchParams.get('env'), 'staging');
    assert.equal(new URL(withCurrentEnvironment('index.html')).searchParams.has('env'), false);
  } finally { if (previous === undefined) delete globalThis.window; else globalThis.window = previous; }
});

test('espera de pantalla mantiene el trabajo diferido hasta el siguiente frame', async () => {
  const previous = globalThis.requestAnimationFrame;
  let nextFrame, completed = false;
  globalThis.requestAnimationFrame = (callback) => { nextFrame = callback; };
  try {
    const work = waitNextFrame().then(() => { completed = true; });
    await Promise.resolve();
    assert.equal(completed, false);
    nextFrame(123);
    await work;
    assert.equal(completed, true);
  } finally { if (previous === undefined) delete globalThis.requestAnimationFrame; else globalThis.requestAnimationFrame = previous; }
});
