import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../AppsScript/VentasComisiones.js', import.meta.url), 'utf8');
const context = vm.createContext({});
vm.runInContext(source, context);
vm.runInContext(`
  normalizarTexto = (valor) => String(valor || '').trim().toLowerCase();
  limpiarTextoImportacion_ = (valor) => String(valor || '').trim();
  normalizarMontoImportacion_ = (valor) => Number(valor || 0);
  redondearMonto_ = (valor) => Math.round(valor * 100) / 100;
  crearErrorImportacion_ = (codigo, mensaje) => new Error(mensaje);
  parsearFechaAsistencia_ = () => new Date(NaN);
  obtenerTramosComisionActivos_ = () => [
    { tramo: 'BAJO', ventaNetaMin: 0, ventaNetaMax: 499999.99, porcentajeComision: 0.01 },
    { tramo: 'ALTO', ventaNetaMin: 500000, ventaNetaMax: '', porcentajeComision: 0.013 }
  ];
`, context);

test('Segunda Faja conserva ambos tramos hasta el 31 de octubre', () => {
  const bajo = context.calcularMetricasDiarias_(119000, 'Segunda Faja', '2026-10-31');
  assert.equal(bajo.comisionTotalDia, 1000);
  assert.equal(bajo.tramoComision, 'BAJO');
  const alto = context.calcularMetricasDiarias_(1190000, 'Segunda Faja', '31/10/2026');
  assert.equal(alto.comisionTotalDia, 13000);
  assert.equal(alto.tramoComision, 'ALTO');
});

test('Segunda Faja no genera comisión desde el 1 de noviembre, aun con tramos activos', () => {
  for (const fecha of ['2026-11-01', '01/11/2026', '2027-01-01']) {
    const resultado = context.calcularMetricasDiarias_(1190000, 'Segunda Faja', fecha);
    assert.equal(resultado.comisionTotalDia, 0);
    assert.equal(resultado.ventaNetaValida, 1000000);
    assert.equal(resultado.tramoComision, 'SIN_COMISION');
  }
});

test('Portal Frances nunca genera comisión, aun con tramos activos', () => {
  for (const fecha of ['2026-10-31', '2026-11-01', '2027-01-01']) {
    assert.equal(context.calcularMetricasDiarias_(1190000, 'Portal Frances', fecha).comisionTotalDia, 0);
  }
});

test('el corte no modifica otros locales ni permite recalcular Segunda Faja sin fecha', () => {
  assert.equal(context.calcularMetricasDiarias_(119000, 'Otro local', '2026-11-01').comisionTotalDia, 1000);
  assert.throws(() => context.calcularMetricasDiarias_(119000, 'Segunda Faja', ''), /fecha valida/);
});
