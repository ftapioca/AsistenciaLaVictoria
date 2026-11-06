import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
function entorno() {
 const datos={Locales:[['id_local','codigo','nombre','estado','permite_programacion','permite_asistencia','usa_horario_base','fecha_creacion']],HorarioLocales:[['Local','DiaSemana','HoraApertura','HoraCierre','PermiteTrasnoche','Activo']],Usuarios:[['id_usuario','nombre_completo','usuario_login','rol','local','activo','pin'],['u1','Ana','','Colaborador','Paseo del Lago','SI','test-only'],['u2','Bea','bea','Supervisor','Segunda Faja','SI','test-only']],UsuariosLocales:[['id_asignacion','id_usuario','usuario_login','rol','id_local','local_nombre','activo','fecha_creacion','observaciones']]};
 let writes=0, failAt=0, released=0;
 const sheets={};for(const [nombre,data] of Object.entries(datos)) sheets[nombre]={
   getDataRange:()=>({getValues:()=>{const rows=structuredClone(data);while(rows.length>1&&rows.at(-1).every(x=>x===''))rows.pop();return rows;}}),
   getRange:(r,c,h,w)=>({
     getValues:()=>Array.from({length:h},(_,i)=>Array.from({length:w},(_,j)=>data[r-1+i]?.[c-1+j]??'')),
     getDataValidations:()=>Array.from({length:h},()=>Array(w).fill('validation')),
     clearDataValidations:()=>{},setDataValidations:()=>{},
     setValues:rows=>{writes++;if(writes===failAt)throw new Error('Fallo de almacenamiento simulado');for(let i=0;i<h;i++){data[r-1+i]||=data[0].map(()=>'');for(let j=0;j<w;j++)data[r-1+i][c-1+j]=rows[i][j];}}
   })
 };
 const c=vm.createContext({});for(const name of ['AuthRoles.js','RegistroAsistencias.js','AltaLocales.js'])vm.runInContext(readFileSync(new URL('../AppsScript/'+name,import.meta.url),'utf8'),c);
 vm.runInContext('const SPREADSHEET_KEY_RRHH="rrhh";',c);
 c.requireAdminSession=params=>{if(params.sessionToken!=='admin-test')throw Object.assign(new Error('FORBIDDEN'), {code:'FORBIDDEN'});};
 c.LockService={getScriptLock:()=>({waitLock:()=>{},releaseLock:()=>{released++;}})};
 c.Utilities={formatDate:()=> '2026-11-05'};c.SpreadsheetApp={flush:()=>{}};
 c.getSpreadsheetByKey_=()=>({getSheetByName:n=>sheets[n]});c.responderJSON=x=>x;c.refreshAttendancePublicEmployeesForLocals_=()=>{};
 const payload={nombre:'Local Nuevo',horarios:Array.from({length:7},(_,i)=>({abierto:i!==6,apertura:'11:00',cierre:'00:00'})),usuarios:['u1','u2']};
 const params=()=>({sessionToken:'admin-test',payload:JSON.stringify(payload)});
 return {c,datos,sheets,payload,params,failAt:n=>{failAt=n;},writes:()=>writes,released:()=>released};
}
test('revision sin escrituras; alta completa mantiene cuentas y roles e incorpora siete dias',()=>{
 const e=entorno();const before=structuredClone(e.datos.Usuarios);const revision=e.c.revisarAltaLocalAdmin(e.params());assert.equal(revision.aplicado,false);assert.equal(e.writes(),0);
 const result=e.c.crearLocalOperativoAdmin(e.params());assert.equal(result.verificado,true);assert.equal(e.datos.Locales[1][2],'Local Nuevo');assert.equal(e.datos.HorarioLocales.length,8);assert.equal(e.datos.HorarioLocales[1][4],'SI');assert.equal(e.datos.HorarioLocales[7][5],'NO');assert.equal(e.datos.HorarioLocales[7][2],'');
 assert.equal(e.datos.Usuarios.length,before.length);assert.equal(e.datos.Usuarios[1][4],'Paseo del Lago, Local Nuevo');assert.equal(e.datos.Usuarios[2][3],'Supervisor');assert.equal(e.datos.UsuariosLocales.length,3);
 assert.equal(JSON.stringify(result).includes('test-only'),false);assert.equal(e.released(),2);
 const writes=e.writes();assert.throws(()=>e.c.crearLocalOperativoAdmin(e.params()),/Ya existe/);assert.equal(e.writes(),writes);
});
test('deniega a una sesion sin permisos antes de acceder a datos',()=>{
 const e=entorno();assert.throws(()=>e.c.crearLocalOperativoAdmin({payload:'{}'}),/FORBIDDEN/);assert.equal(e.writes(),0);
});
test('valida toda la solicitud antes de escribir; no acepta cuentas nuevas ni inactivas',()=>{
 for(const invalidar of [e=>{e.payload.usuarios=['no-existe'];},e=>{e.payload.horarios[0].cierre='25:00';},e=>{e.payload.horarios.pop();},e=>{e.payload.nombre='Todos';},e=>{e.datos.Usuarios[1][5]='NO';},e=>{e.payload.usuarios=['u1','u1'];},e=>{e.payload.horarios[0]=null;}]){
  const e=entorno();invalidar(e);assert.throws(()=>e.c.crearLocalOperativoAdmin(e.params()));assert.equal(e.writes(),0);assert.equal(e.released(),1);
 }
});
test('si falla una escritura restaura los valores anteriores y permite reintentar',()=>{
 const e=entorno();const original=structuredClone(e.datos);e.failAt(10);assert.throws(()=>e.c.crearLocalOperativoAdmin(e.params()),/restauraron/);
 for(const name of Object.keys(original))assert.deepEqual(e.sheets[name].getDataRange().getValues(),original[name]);
 assert.equal(e.c.crearLocalOperativoAdmin(e.params()).verificado,true);
});
test('rechaza colision de codigo y permite alta sin usuarios; cache fallido no revierte datos validos',()=>{
 const e=entorno();e.payload.usuarios=[];e.c.refreshAttendancePublicEmployeesForLocals_=()=>{throw new Error('cache');};const r=e.c.crearLocalOperativoAdmin(e.params());assert.equal(r.verificado,true);assert.ok(r.aviso);assert.equal(e.datos.UsuariosLocales.length,1);
 e.payload.nombre='Local-Nuevo';assert.throws(()=>e.c.crearLocalOperativoAdmin(e.params()),/utilizado/);
});

test('router POST expone revision y alta solo con sesion administrativa',()=>{
 const e=entorno();const revision=e.c.doPost({parameter:{...e.params(),accion:'RevisarAltaLocalAdmin'}});assert.equal(revision.status,'SUCCESS');assert.equal(e.writes(),0);
 const denied=e.c.doPost({parameter:{...e.params(),accion:'CrearLocalOperativoAdmin',sessionToken:''}});assert.equal(denied.status,'FORBIDDEN');assert.equal(e.writes(),0);
 const result=e.c.doPost({parameter:{...e.params(),accion:'CrearLocalOperativoAdmin'}});assert.equal(result.verificado,true);
});
