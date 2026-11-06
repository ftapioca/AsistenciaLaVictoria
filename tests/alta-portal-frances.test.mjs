import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const c = vm.createContext({});
vm.runInContext(readFileSync(new URL('../AppsScript/AltaLocales.js', import.meta.url), 'utf8'), c);
vm.runInContext(readFileSync(new URL('../scripts/archive/alta-portal-frances.js', import.meta.url), 'utf8'), c);
const personas = ['Jocelyn Morales', 'Matias Velasquez', 'Evelyn Riffo', 'Mateo Montecinos', 'Candy Carmona'];
function datos(nombres = personas) {
  return {
    Locales: [['id_local','codigo','nombre','estado','permite_programacion','permite_asistencia','usa_horario_base','fecha_creacion'],['pdl','PDL','Paseo del Lago','ACTIVO','SI','SI','SI','2026-01-01']],
    HorarioLocales: [['Local','DiaSemana','HoraApertura','HoraCierre','PermiteTrasnoche','Activo'],['Paseo del Lago','Lunes','09:00','23:00','NO','SI']],
    Usuarios: [['id_usuario','nombre_completo','usuario_login','rol','local','activo','pin'], ...nombres.map((nombre,i) => ['u'+i,nombre,nombre.startsWith('Candy')?'candy':'',nombre.startsWith('Candy')?'Supervisor':'Colaborador','Paseo del Lago','SI','test-only'])],
    UsuariosLocales: [['id_asignacion','id_usuario','usuario_login','rol','id_local','local_nombre','activo','fecha_creacion','observaciones']]
  };
}
function aplicar(tablas, plan) {
  for (const x of plan.cambios) {
    tablas[x.hoja][x.fila-1] ||= tablas[x.hoja][0].map(()=>'');
    x.valores.forEach((valor,i) => { tablas[x.hoja][x.fila-1][x.columna-1+i] = valor; });
  }
}
test('revision no escribe; alta conserva cuentas y es idempotente', () => {
  const d=datos();const original=structuredClone(d);const p=c.planificarAltaPortalFrances_(d,true,'2026-11-05');
  assert.deepEqual(d,original);assert.equal(p.usuarios.length,5);aplicar(d,p);
  assert.equal(d.Usuarios.length,original.Usuarios.length);
  assert.equal(d.Locales.length,3);assert.equal(d.HorarioLocales.length,9);assert.equal(d.UsuariosLocales.length,6);
  assert.equal(c.planificarAltaPortalFrances_(d,true,'2026-11-06').cambios.length,0);
  assert.deepEqual(d.HorarioLocales[1],original.HorarioLocales[1]);
  for(let i=1;i<d.Usuarios.length;i++){
    assert.equal(d.Usuarios[i][4],'Paseo del Lago, Portal Frances');
    for(const col of [0,1,2,3,5,6]) assert.equal(d.Usuarios[i][col],original.Usuarios[i][col]);
  }
});
test('staging omite ausentes y produccion exige las cinco cuentas sin escribir', () => {
  const d=datos(personas.filter(x=>!['Jocelyn Morales','Mateo Montecinos'].includes(x)));const original=structuredClone(d);
  const p=c.planificarAltaPortalFrances_(d,false,'2026-11-05');assert.equal(p.usuarios.length,3);assert.equal(p.omitidos.length,2);
  assert.throws(()=>c.planificarAltaPortalFrances_(d,true,'2026-11-05'),/Jocelyn/);assert.deepEqual(d,original);
});
test('conserva asignaciones estructuradas que no aparecen en el espejo Usuarios.local', () => {
  const d=datos();d.UsuariosLocales.push(['prev','u1','','Colaborador','sf','Segunda Faja','SI','2026-01-01','']);
  const original=structuredClone(d.UsuariosLocales[1]);const p=c.planificarAltaPortalFrances_(d,true,'2026-11-05');aplicar(d,p);
  assert.deepEqual(d.UsuariosLocales[1],original);assert.equal(d.Usuarios[2][4],'Paseo del Lago, Segunda Faja, Portal Frances');
});
test('tolera filas legacy de la misma cuenta y no duplica asignacion por login', () => {
  const d=datos();d.Usuarios.push(['candy-legacy','Candy Carmona','candy','Supervisor','Segunda Faja','SI','test-only']);
  const p=c.planificarAltaPortalFrances_(d,true,'2026-11-05');aplicar(d,p);
  assert.equal(d.UsuariosLocales.filter(r=>r[2]==='candy').length,1);
  assert.equal(d.Usuarios[5][4],d.Usuarios[6][4]);
  assert.equal(c.planificarAltaPortalFrances_(d,true,'2026-11-05').cambios.length,0);
});
test('identidad ambigua, encabezado roto y Candy sin rol supervisor bloquean la aplicacion', () => {
  const d=datos();d.Usuarios.push(['otro','Candy Carmona','candy','Supervisor','Segunda Faja','SI','different-test']);
  assert.throws(()=>c.planificarAltaPortalFrances_(d,true,'2026-11-05'),/ambigua/);
  const h=datos();h.Locales[0][0]='A8';assert.throws(()=>c.planificarAltaPortalFrances_(h,true,'2026-11-05'),/id_local/);
  const r=datos();r.Usuarios[5][3]='Colaborador';assert.throws(()=>c.planificarAltaPortalFrances_(r,true,'2026-11-05'),/Supervisor/);
});
test('no utiliza cuentas inactivas y rechaza ids compartidos entre personas', () => {
  const d=datos();d.Usuarios[1][5]='NO';assert.throws(()=>c.planificarAltaPortalFrances_(d,true,'2026-11-05'),/Jocelyn/);
  const r=datos();r.Usuarios[2][0]='u0';assert.throws(()=>c.planificarAltaPortalFrances_(r,true,'2026-11-05'),/compartido/);
});
test('rechaza locales y horarios duplicados; no registra secretos en el resumen', () => {
  const d=datos();aplicar(d,c.planificarAltaPortalFrances_(d,true,'2026-11-05'));
  d.Locales.push([...d.Locales[2]]);assert.throws(()=>c.planificarAltaPortalFrances_(d,true,'2026-11-05'),/duplicado/);
  d.Locales.pop();d.HorarioLocales.push([...d.HorarioLocales[2]]);assert.throws(()=>c.planificarAltaPortalFrances_(d,true,'2026-11-05'),/duplicado/);
  const p=c.planificarAltaPortalFrances_(datos(),true,'2026-11-05');assert.equal(JSON.stringify(p.usuarios).includes('test-only'),false);
});
test('funciones de entorno rechazan ejecutarse en otro proyecto antes de acceder a datos',()=>{
  c.ScriptApp={getScriptId:()=> 'otro-proyecto'};
  assert.throws(()=>c.revisarPortalFrancesProduccion(),/entorno/);
  assert.throws(()=>c.aplicarPortalFrancesStaging(),/entorno/);
});
