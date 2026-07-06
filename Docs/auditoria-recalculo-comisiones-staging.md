# Pauta Operativa
# Auditoría y Cierre de `staging` y `prod` para Ventas, Comisiones y Propinas

Estado: validado en `staging`  
Fecha de cierre: 5 de julio de 2026

---

## Resultado

El flujo de `staging` quedó operativo para:

- importar archivos `JSON`, `CSV`, `XLS` y `XLSX` desde `ventasMensuales.html`
- persistir `VentasPOS`, `PropinasPOS` y `PagosPOS`
- recalcular automáticamente al cerrar una importación `SUCCESS`
- reprocesar manualmente con `RecalcularComisiones`
- poblar:
  - `VentasDiarias`
  - `ComisionesDiarias`
  - `ResumenMensualPagos`
  - `DetalleMensualPagos`
  - `CuadraturaPagos`
  - `KPIVentasDiarias`
- resolver presencia diaria desde `RegistroAsistencia`

---

## Reglas validadas en `staging`

### Importación POS

- `VentasPOS` guarda:
  - `TipoVenta`
  - `MedioPago`
  - `Fecha`
  - `Hora`
  - `FechaCierre`
- ventas anuladas/eliminadas no suman en ventas válidas
- propinas inválidas o anuladas no suman en propinas válidas
- `PagosPOS` se alimenta desde los medios de pago detectados en el archivo fuente

### Tramos de comisión

- `TramosComisiones` ya no está hardcodeado
- los tramos se leen desde la hoja `TramosComisiones`
- los tramos se filtran por `Local`
- el backend no sobreescribe manualmente los tramos existentes al recalcular o importar

### Presencia diaria

- la presencia ya no depende del parseo directo de `Fecha/Hora`
- la regla vigente usa:
  - `Fecha Turno`
  - `Validacion`
- criterio:
  - incluir colaborador si `Fecha Turno = día auditado`
  - y `Validacion` contiene `turno cerrado` y `ok`
- endpoint de auditoría:
  - `AuditarPresenciaVentas`

### Pagos base RRHH

- la hoja `RegistroAsistencia` ya contiene columnas monetarias para pago base:
  - `Pago Normal`
  - `Pago Horas Extras`
  - `Pago Feriado`
  - `Pago Feriado Extras`
- el detalle mensual y el resumen mensual de pagos usan esas columnas como fuente
- solo se consideran filas con `Validacion = Turno Cerrado Ok`

### Comisión y propinas por colaborador

- `ComisionTotalDia` no se reparte
- cada colaborador presente recibe el monto completo de comisión diaria
- `PropinasValidas` sí se reparten en partes iguales entre los colaboradores presentes

### Fechas

- `VentasDiarias`, `ComisionesDiarias`, `CuadraturaPagos` y `KPIVentasDiarias` escriben fecha visible en formato `dd/MM/yyyy`
- el cruce interno se normaliza a `yyyy-MM-dd`

---

## Ajustes técnicos realizados en `staging`

### Backend

Archivo principal:

- `AppsScript/VentasComisiones.js`

Cambios relevantes:

- soporte de `PagosPOS`
- uso de `TramosComisiones` por `Local`
- recalculo automático al cerrar `ImportarVentas`
- endpoint `AuditarPresenciaVentas`
- endpoint `AuditarRegistroAsistenciaRaw`
- normalización de fechas de operación antes del cruce con asistencia
- migraciones automáticas de headers compatibles
- migración específica de `VentasDiarias` para insertar `ListaColaboradoresPresentes`
- construcción de `DetalleMensualPagos` desde `RegistroAsistencia + ComisionesDiarias`
- construcción de `ResumenMensualPagos` desde `DetalleMensualPagos`

Archivo complementario:

- `AppsScript/RegistroAsistencias.js`

Cambios relevantes:

- exposición de `AuditarPresenciaVentas`
- exposición de `AuditarRegistroAsistenciaRaw`

### Frontend

Archivos relevantes:

- `app-config.js`
- `app-config.staging.js`
- `src/scripts/ventas-mensuales.js`
- `src/scripts/pagos-mensuales.js`
- `src/pagosMensuales.html`
- `src/scripts/admin-panel-app.js`

Cambios relevantes:

- parser POS actualizado para:
  - ventas
  - propinas
  - pagos
- detección de `TipoVenta`
- detección de `MedioPago`
- lectura de `Cerrada` para `Fecha` + `Hora`
- exclusión visual y técnica de ventas inválidas
- corrección de URL `staging` del Apps Script
- cache busting del frontend publicado
- nuevo módulo `Pagos Mensuales` en `AdminPanel`
- layout del panel ajustado a 4 cards en 2 filas
- nueva vista `pagosMensuales.html?env=staging`
- consulta de locales RRHH desde `HorarioLocales`
- validación de datos exportables por `local + periodo`
- resumen semanal de ventas, propinas y comisiones
- exportación `.zip` por local con un `.xlsx` por colaborador usando `DetalleMensualPagos`
- soporte de descuentos y consumos solo en el archivo exportado

---

## Referencias exactas validadas en `staging`

### Apps Script `staging`

- proyecto `staging` desplegado con versión validada sobre el deployment existente usado por el frontend
- deployment URL correcta validada en frontend:
  - `https://script.google.com/macros/s/AKfycbzcfyIN11hOygphJChfCyPGsj4Th-CfL8ZqFOk7_N-afJZeKZphqFPUrPpBXsvtY-5nFA/exec`
- versión actual de `staging` para módulo de pagos:
  - `@49`

Observación:

- durante la estabilización hubo un error por una URL mal copiada con `...ZqF0k7...`
- la URL correcta usa letra `O`: `...ZqFOk7...`

### Frontend `staging`

- página publicada usada en las pruebas:
  - `https://ftapioca.github.io/AsistenciaLaVictoria/ventasMensuales.html?env=staging`
- nueva página publicada para pagos:
  - `https://ftapioca.github.io/AsistenciaLaVictoria/pagosMensuales.html?env=staging`
- commit de corrección de URL de Apps Script:
  - `5d99ee2` `Fix staging Apps Script deployment URL typo`
- commit de cache busting del frontend:
  - `05ca058` `Bust frontend cache for staging ventas deploy`

---

## Cierre productivo

### Estado final en `prod`

- backend productivo actualizado sobre el deployment existente usado por el frontend
- importaciones de junio ejecutadas correctamente en producción
- cálculo de ventas, comisiones y propinas confirmado para ambos locales
- migración legacy de `VentasDiarias` aplicada correctamente en producción
- `TestVentasSheet` terminó con `inconsistentes = 0`

### Referencias exactas validadas en `prod`

- frontend productivo:
  - `https://ftapioca.github.io/AsistenciaLaVictoria/ventasMensuales.html?env=prod`
- Apps Script productivo usado por frontend:
  - `https://script.google.com/macros/s/AKfycbyqIaw4SLUy1pYl7iAv1QPrgWvHNE51H4dVk-R0qRZ8DppTZNAWRhN0W8bdmG3W23rq/exec`
- versión de Apps Script productiva validada:
  - `@30`

### Commits relevantes del cierre

- `2774cb7` `feat: finalize ventas and comisiones production rollout`
- `89caf7a` `fix: migrate legacy ventas diarias headers in prod`

### Resultado operativo

El módulo queda operativo en producción para:

- importar ventas POS por local y período
- poblar `VentasPOS`, `PropinasPOS` y `PagosPOS`
- recalcular automáticamente al finalizar la importación
- poblar `VentasDiarias`
- poblar `ComisionesDiarias`
- poblar `ResumenMensualComisiones`
- poblar `CuadraturaPagos`
- poblar `KPIVentasDiarias`
- calcular colaboradores presentes y reparto de propinas desde `RegistroAsistencia`

---

## Estructura vigente esperada del spreadsheet de ventas

### `VentasDiarias`

Orden esperado:

1. `ImportId`
2. `Fecha`
3. `Local`
4. `VentaBrutaValida`
5. `VentaNetaValida`
6. `TramoComision`
7. `PorcentajeComision`
8. `ComisionIndividualDiaria`
9. `PropinasValidas`
10. `ListaColaboradoresPresentes`
11. `ColaboradoresPresentes`
12. `PropinaIndividualDiaria`
13. `Observaciones`

### `ComisionesDiarias`

- una fila por `ImportId + Fecha + Local + Colaborador`
- incluso si `ComisionDia = 0`, debe existir fila si hay propina a repartir

### `DetalleMensualPagos`

Orden esperado:

1. `ImportId`
2. `Periodo`
3. `Fecha`
4. `Local`
5. `Colaborador`
6. `PagoHorasNormales`
7. `PagoHorasExtras`
8. `PagoDiasNormales`
9. `PagoHorasFeriado`
10. `PagoHorasExtrasFeriado`
11. `PagoDiasFeriados`
12. `PagoDiaTrabajado`
13. `ComisionDia`
14. `PropinaDia`
15. `TotalPagarDia`
16. `Observaciones`

### `ResumenMensualPagos`

Orden esperado:

1. `ImportId`
2. `Periodo`
3. `Local`
4. `Colaborador`
5. `TotalHorasNormales`
6. `TotalHorasExtras`
7. `TotalDiasNormales`
8. `TotalHorasFeriado`
9. `TotalHorasExtrasFeriado`
10. `TotalDiasFeriados`
11. `TotalDiasTrabajados`
12. `ComisionTotal`
13. `PropinaTotal`
14. `TotalPagar`

---

## Comandos y pruebas usadas en `staging`

### Validar estructura

```js
await window.LVAuth.apiGet({ accion: 'TestVentasSheet' })
```

### Auditar presencia diaria

```js
await window.LVAuth.apiGet({
  accion: 'AuditarPresenciaVentas',
  local: 'Paseo del Lago',
  fecha: '2026-06-20'
})
```

### Auditoría cruda de `RegistroAsistencia`

```js
await (async () => {
  const session = window.LVAuth.getSession();
  const url = new URL(window.APP_CONFIG.WEB_APP_URL);

  url.search = new URLSearchParams({
    accion: 'AuditarRegistroAsistenciaRaw',
    sessionToken: session.sessionToken,
    local: 'Paseo del Lago',
    fecha: '2026-06-20',
  }).toString();

  const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
  return await res.json();
})();
```

### Recalculo manual

```js
await (async () => {
  const session = window.LVAuth.getSession();
  const form = new URLSearchParams({
    accion: 'RecalcularComisiones',
    sessionToken: session.sessionToken,
    importId: 'REEMPLAZAR_IMPORT_ID',
  });

  const res = await fetch(window.APP_CONFIG.WEB_APP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: form,
    redirect: 'follow',
  });

  return await res.json();
})();
```

---

## Observaciones funcionales validadas

- `Paseo del Lago` puede tener comisión diaria `0` según tramo/configuración, pero igual debe:
  - poblar `VentasDiarias`
  - poblar `ComisionesDiarias`
  - repartir propinas
- `Segunda Faja` sí debe calcular comisión cuando existan tramos activos que apliquen
- si el frontend apunta a un deployment viejo de Apps Script, `TestVentasSheet` puede reportar estructuras antiguas aunque el backend nuevo ya esté bien

---

## Pauta de paso a producción

### 1. Backend

Desde el repo:

```bash
npm run gas:prod:push
npx clasp version "Ventas y comisiones validadas en staging" --project .clasp.prod.json
```

Luego actualizar el deployment productivo existente, no crear uno nuevo si el frontend ya usa una URL fija:

```bash
npm run gas:prod:deployments
```

Tomar el `deploymentId` correcto y ejecutar:

```bash
npx clasp deploy --project .clasp.prod.json -i DEPLOYMENT_ID_PROD -V VERSION_GENERADA
```

### 2. Script Properties

Confirmar en `prod`:

- `LV_SPREADSHEET_RRHH_ID`
- `LV_SPREADSHEET_VENTAS_ID`

### 3. Frontend

Si producción ya apunta a una URL fija correcta, no cambiar frontend.

Si hubiese que actualizar URL de `prod`:

- corregir `app-config.js`
- corregir `app-config.prod.js`
- luego:

```bash
npm run build
npm run deploy:pages
git add .
git commit -m "Update prod frontend Apps Script URL"
git push origin main
```

### 4. Verificación mínima en producción

1. `window.APP_CONFIG.WEB_APP_URL`
2. `await window.LVAuth.apiGet({ accion: 'TestVentasSheet' })`
3. hacer una importación controlada
4. verificar:
   - `VentasPOS`
   - `PropinasPOS`
   - `PagosPOS`
   - `VentasDiarias`
   - `ComisionesDiarias`
   - `ResumenMensualComisiones`
   - `CuadraturaPagos`
   - `KPIVentasDiarias`

### 5. Auditoría mínima recomendada en producción

Antes de liberar operativamente:

- auditar un día de `Paseo del Lago`
- auditar un día de `Segunda Faja`
- comparar:
  - cantidad de colaboradores presentes
  - propina individual
  - comisión diaria

---

## Riesgos pendientes

- `horasTotales` hoy no está siendo el dato principal del reparto; la lógica vigente usa presencia cerrada por turno, no pares completos de ingreso/salida
- si cambian nombres de columnas del archivo POS, habrá que extender el parser frontend
- si cambia la estructura de `RegistroAsistencia`, habrá que revisar `Fecha Turno` y `Validacion`

---

## Estado recomendado

El módulo queda en condición de pasar a `prod`, sujeto a:

- deploy del backend productivo
- confirmación de Script Properties
- verificación de una importación controlada en producción
