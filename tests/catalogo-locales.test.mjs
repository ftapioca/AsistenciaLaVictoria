import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
function entorno() {
  const c = vm.createContext({});
  for (const name of ['SpreadsheetStore.js', 'AuthRoles.js', 'RegistroAsistencias.js', 'AdminLocales.js']) {
    vm.runInContext(readFileSync(new URL('../AppsScript/' + name, import.meta.url), 'utf8'), c);
  }
  c.listarHorarioLocalesAdmin_ = () => [];
  c.listarHorariosEspecialesAdmin_ = () => [];
  c.getUsuariosSheetContext_ = () => null;
  c.findSheet_ = () => null;
  return c;
}
test('catalogo vacio no inventa los dos locales historicos', () => {
  const c = entorno();
  assert.deepEqual(Array.from(c.collectLegacyLocalCatalog_()), []);
});
test('conserva el backfill de fuentes reales y omite duplicados y alcances globales', () => {
  const c = entorno();
  c.listarHorarioLocalesAdmin_ = () => [{ local: 'Local Norte' }];
  c.listarHorariosEspecialesAdmin_ = () => [{ local: 'Local Sur' }];
  c.getUsuariosSheetContext_ = () => ({ indices: { local: 0 }, data: [['local'], ['Local Norte, Local Centro'], ['Todos']] });
  c.findSheet_ = () => ({ getDataRange: () => ({ getValues: () => [[], ['Persona', '', '', 'Local Oeste']] }) });
  assert.deepEqual(Array.from(c.collectLegacyLocalCatalog_()), ['Local Centro', 'Local Norte', 'Local Oeste', 'Local Sur']);
});
