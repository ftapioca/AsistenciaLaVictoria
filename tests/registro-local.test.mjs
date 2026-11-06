import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {crearHtmlRegistroLocal} from '../src/utils/registro-local.js';
const template=readFileSync(new URL('../src/templates/registro-asistencia.html',import.meta.url),'utf8');
const url='https://script.google.com/macros/s/test/exec';
test('genera un archivo independiente para cualquier local sin nombres fijos ni marcadores',()=>{
 const nombre='Local Nuevo';const html=crearHtmlRegistroLocal(template,nombre,url);assert.ok(html.includes('const LOCAL_ACTUAL = "Local Nuevo";'));assert.ok(html.includes(`const WEB_APP_URL = "${url}";`));assert.equal(html.includes('__LV_'),false);assert.equal(html.includes('Portal Frances'),false);
 for(const script of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
});
test('escapa HTML y cierres de script sin alterar el nombre que consulta al backend',()=>{
 const nombre='Local </script><script>alert(1)</script> & "Norte"';const html=crearHtmlRegistroLocal(template,nombre,url);assert.equal(html.includes('Local </script><script>'),false);assert.ok(html.includes('&lt;/script&gt;'));
 const json=html.match(/const LOCAL_ACTUAL = (.*);/)[1];assert.equal(JSON.parse(json),nombre);
});
test('rechaza URLs ajenas al backend y nombres vacios',()=>{
 assert.throws(()=>crearHtmlRegistroLocal(template,'Local','https://example.com/exec'),/dirección/);assert.throws(()=>crearHtmlRegistroLocal(template,'',url),/nombre/);
});
