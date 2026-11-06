import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { cargarLocalesPorSesion } from '../src/utils/locales.js';

test('los selectores usan los locales autorizados que devuelve el backend', async () => {
  const locales = [{ nombre: 'Portal Frances', id: 'portal-frances' }];
  globalThis.window = { LVAuth: { apiGet: async (params) => {
    assert.equal(params.accion, 'LocalesPorSesion');
    assert.equal(params.modulo, 'programador');
    return { status: 'SUCCESS', locales };
  } } };
  try {
    assert.deepEqual(await cargarLocalesPorSesion('programador'), locales);
    window.LVAuth.apiGet = async () => ({ status: 'SUCCESS', locales: [] });
    assert.deepEqual(await cargarLocalesPorSesion('programador'), []);
    window.LVAuth.apiGet = async () => ({ status: 'ERROR', mensaje: 'Sin acceso' });
    await assert.rejects(cargarLocalesPorSesion('programador'), /Sin acceso/);
  } finally {
    delete globalThis.window;
  }
});

test('el horario de Portal Frances permite cerrar a medianoche y rechaza salir fuera de horario', () => {
  const source = readFileSync(new URL('../src/scripts/programador-turnos.js', import.meta.url), 'utf8');
  const context = vm.createContext({ normalizar: (valor) => String(valor).toLowerCase() });
  vm.runInContext(source.slice(source.indexOf('function timeToMin('), source.indexOf('function validarTurnoContraHorario(')), context);
  const config = JSON.parse(readFileSync(new URL('../config/portal-frances.json', import.meta.url), 'utf8'));
  assert.equal(config.horarios.length, 7);
  for (const horario of config.horarios) {
    assert.equal(context.validarTramoEnHorario('11:00', '00:00', horario, 'turno').ok, true);
    assert.equal(context.validarTramoEnHorario('18:00', '00:00', horario, 'turno').ok, true);
    assert.equal(context.validarTramoEnHorario('10:30', '18:00', horario, 'turno').ok, false);
    assert.equal(context.validarTramoEnHorario('18:00', '00:30', horario, 'turno').ok, false);
  }
});
