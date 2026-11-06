import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const nombres=['Candy Carmona','Evelyn Riffo','Jocelyn Morales','Mateo Montecinos','Matias Velasquez'];
function entorno() {
 const c=vm.createContext({});
 for(const file of ['SpreadsheetStore.js','AuthRoles.js','AdminHorarios.js','RegistroAsistencias.js','programadorTurnos.js']) vm.runInContext(readFileSync(new URL('../AppsScript/'+file,import.meta.url),'utf8'),c);
 const users=[['id_usuario','nombre_completo','usuario_login','pin','rol','local','activo'],...nombres.map((nombre,i)=>['u'+i,nombre,i===0?'candy':'','test',i===0?'Supervisor':'Colaborador','Paseo del Lago','SI']),['inactive','Inactiva','','test','Colaborador','Portal Frances','NO'],['admin','Administracion','admin','test','Administrador','Portal Frances','SI'],['duplicado','Evelyn Riffo','','test','Colaborador','Portal Frances','SI']];
 const assignments=[['id_asignacion','id_usuario','usuario_login','rol','id_local','local_nombre','activo','fecha_creacion','observaciones'],...users.slice(1).map((u,i)=>['a'+i,u[0],u[2],u[4],'portal','Portal Frances','SI','',''])];
 c.findSheet_=(name)=>{assert.equal(name,'Usuarios','el programador no debe consultar la hoja legacy');return {getDataRange:()=>({getValues:()=>users})};};
 c.ensureUsuariosLocalesSheetReady_=()=>{};
 c.getUsuariosLocalesSheetContext_=()=>({data:assignments,headerMap:c.buildHeaderIndexMap_(assignments[0])});
 c.getSheet_=(name)=>{assert.ok(['PlantillasTurnos','TurnosProgramados'].includes(name));return {getDataRange:()=>({getValues:()=>[[]]})};};
 c.responderJSON=data=>data;
 c.requireProgramadorSession=params=>{if(params.sessionToken!=='valid-test-session')throw new Error('FORBIDDEN');return{role:'Administrador',displayName:'Prueba',userKey:'admin'};};
 return c;
}
test('programador usa asignaciones modernas aun con espejo antiguo; incluye supervisora y excluye inactivos/admin',()=>{
 const c=entorno();assert.deepEqual(Array.from(c.listarColaboradoresPorLocalTurnos_('Portal Frances')),nombres);
 assert.deepEqual(Array.from(c.listarColaboradoresPorLocalTurnos_('Local sin asignaciones')),[]);
});
test('bootstrap semanal y endpoint individual devuelven las mismas cinco personas',()=>{
 const c=entorno();const params={local:'Portal Frances',fechaInicio:'2026-11-02',fechaFin:'2026-11-08',sessionToken:'valid-test-session'};
 const data=c.bootstrapProgramadorTurnos(params);assert.deepEqual(Array.from(data.data.colaboradores),nombres);assert.equal(data.meta.counts.colaboradores,5);
 assert.deepEqual(Array.from(c.obtenerColaboradoresPorLocalTurnos(params).colaboradores),nombres);
 assert.throws(()=>c.bootstrapProgramadorTurnos({...params,sessionToken:''}),/FORBIDDEN/);
});
test('falla explicitamente si falta Usuarios; no cae silenciosamente en Colaboradores legacy',()=>{
 const c=entorno();c.findSheet_=()=>null;assert.throws(()=>c.listarColaboradoresPorLocalTurnos_('Portal Frances'),/Usuarios/);
});
