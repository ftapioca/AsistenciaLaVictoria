# Pauta Operativa
# Auditoría de `RecalcularComisiones` en `staging`

Estado: vigente para el backend actual en `main`  
Entorno objetivo: `staging`  
Fecha de referencia: 2 de julio de 2026

---

## Objetivo

Validar con datos reales que el endpoint `RecalcularComisiones`:

- resuelve correctamente la importación activa
- agrega ventas y propinas válidas por `Fecha + Local`
- calcula correctamente `ventaNetaValida`
- asigna correctamente `tramoComision`
- aplica correctamente `porcentajeComision`
- calcula correctamente `comisionTotalDia`
- deja trazabilidad suficiente para continuar luego con distribución por colaborador

Esta auditoría no valida todavía reparto individual por asistencia.
En el estado actual del backend, `ColaboradoresPresentes` y `PropinaIndividualDiaria` siguen en `0`.

---

## Fórmulas vigentes

Las fórmulas actuales del backend están implementadas en `AppsScript/VentasComisiones.js`.

### Agrupación

- Unidad de cálculo: `Fecha + Local`
- Fuente de ventas: `VentasPOS`
- Fuente de propinas: `PropinasPOS`
- Filtro:
  - ventas con `EsValidaComision = true`
  - propinas con `EsValidaPropina = true`

### Cálculo diario

- `ventaBrutaValida` = suma de `TotalBruto` de ventas válidas del día/local
- `propinasValidas` = suma de `MontoPropina` de propinas válidas del día/local
- `ventaNetaValida` = `ventaBrutaValida / 1.19`
- `tramoComision`:
  - `BAJO` si `ventaNetaValida < 500000`
  - `ALTO` si `ventaNetaValida >= 500000`
- `porcentajeComision`:
  - `0.01` para tramo `BAJO`
  - `0.013` para tramo `ALTO`
- `comisionTotalDia` = `ventaNetaValida * porcentajeComision`

### Redondeo actual

- `ventaNetaValida` se redondea a 2 decimales
- `comisionTotalDia` se redondea a 2 decimales

Implementación de referencia:

- `calcularMetricasDiarias_`
- `construirFilasVentasDiarias_`

---

## Precondiciones

Antes de auditar:

1. La importación debe existir en `staging` con estado `SUCCESS`.
2. Debe haber al menos 3 días con ventas válidas reales para el local auditado.
3. Idealmente debe existir también al menos un día con:
   - ventas anuladas o excluidas
   - propinas anuladas o excluidas
   - mezcla de medios de pago
4. El usuario de prueba debe tener sesión administrativa válida en `staging`.

---

## Dataset recomendado

Elegir un caso real que cumpla:

- un solo `Local`
- un solo `Periodo`
- entre 3 y 7 días auditables
- al menos un día cerca del umbral de `500000` netos para revisar el cambio de tramo

Si hay varias importaciones posibles, preferir una reciente que no haya sido reemplazada.

---

## Paso 1: identificar la importación activa

En `ventasMensuales.html` apuntando a `staging`, ejecutar:

```js
await window.LVAuth.apiGet({
  accion: 'ConsultarImportacionesVentas',
  local: 'Segunda Faja',
  periodo: '2026-07'
})
```

Reemplazar:

- `local`
- `periodo`

Resultado esperado:

- `status = "SUCCESS"`
- `hayImportacionActiva = true`
- al menos una importación con `estado = "SUCCESS"`

Guardar:

- `importId`
- `local`
- `periodo`
- `nombreArchivo`

Si no hay activa, no seguir con la auditoría.

---

## Paso 2: capturar el estado previo de `VentasDiarias`

Antes de recalcular:

1. Abrir la hoja `VentasDiarias` del spreadsheet de ventas de `staging`.
2. Filtrar por `ImportId`.
3. Guardar:
   - cantidad de filas existentes para ese `ImportId`
   - capturas o export de esas filas

Objetivo:

- comprobar luego idempotencia
- comprobar que el recálculo limpia y reescribe el resultado de esa importación

---

## Paso 3: verificar recálculo automático y reproceso manual

`ImportarVentas` debe dejar `VentasDiarias` listas automáticamente al cerrar la importación con estado `SUCCESS`.

Antes de correr el endpoint manual, validar:

1. que la importación recién creada ya tenga filas en `VentasDiarias`
2. que la cantidad de filas coincida con los días/locales esperados del payload

Luego usar `RecalcularComisiones` como reproceso explícito para auditar idempotencia y consistencia.

En consola, con sesión admin en `staging`:

```js
await window.LVAuth.apiPost({
  accion: 'RecalcularComisiones',
  importId: 'REEMPLAZAR_IMPORT_ID'
})
```

Alternativa por `local + periodo`:

```js
await window.LVAuth.apiPost({
  accion: 'RecalcularComisiones',
  local: 'Segunda Faja',
  periodo: '2026-07'
})
```

Guardar la respuesta completa.

Resultado esperado:

- `status = "SUCCESS"`
- `diasProcesados > 0`
- `resumen.ventaBrutaValida > 0`

---

## Paso 4: validar idempotencia básica

Ejecutar exactamente el mismo `RecalcularComisiones` una segunda vez.

Validaciones esperadas:

1. La cantidad de filas en `VentasDiarias` para ese `ImportId` no debe duplicarse.
2. Las filas finales deben seguir siendo una por `Fecha + Local`.
3. Los totales devueltos por la segunda ejecución deben coincidir con la primera.

Si aparecen filas duplicadas, la auditoría falla.

---

## Paso 5: validación manual por día

Para cada día auditado, construir esta tabla manual:

| Fecha | Local | Venta Bruta Válida Esperada | Propinas Válidas Esperadas | Venta Neta Esperada | Tramo Esperado | % Esperado | Comisión Esperada |
|------|------|------------------------------|----------------------------|---------------------|----------------|------------|-------------------|

### Fuente para `Venta Bruta Válida Esperada`

Hoja `VentasPOS`, filtrando por:

- `ImportId = importId auditado`
- `Fecha = día auditado`
- `Local = local auditado`
- `EsValidaComision = true`

Luego sumar `TotalBruto`.

### Fuente para `Propinas Válidas Esperadas`

Hoja `PropinasPOS`, filtrando por:

- `ImportId = importId auditado`
- `Fecha = día auditado`
- `Local = local auditado`
- `EsValidaPropina = true`

Luego sumar `MontoPropina`.

### Cálculo esperado

Usar:

```text
ventaNetaEsperada = redondear(ventaBrutaValida / 1.19, 2)
```

```text
si ventaNetaEsperada < 500000 => tramo = BAJO, porcentaje = 0.01
si ventaNetaEsperada >= 500000 => tramo = ALTO, porcentaje = 0.013
```

```text
comisionEsperada = redondear(ventaNetaEsperada * porcentaje, 2)
```

### Cruce contra `VentasDiarias`

Comparar cada día con la fila generada en `VentasDiarias`:

- `VentaBrutaValida`
- `VentaNetaValida`
- `TramoComision`
- `PorcentajeComision`
- `ComisionIndividualDiaria`
- `PropinasValidas`

Nota:

- aunque el nombre de columna sea `ComisionIndividualDiaria`, hoy el backend la usa como monto agregado diario del local

---

## Paso 6: validar casos borde

La auditoría debe incluir, si existen en el dataset:

1. Día con ventas anuladas
   - confirmar que no suman en `VentaBrutaValida`

2. Día con propinas anuladas
   - confirmar que no suman en `PropinasValidas`

3. Día sin propinas
   - confirmar que `PropinasValidas = 0`

4. Día cerca del umbral
   - confirmar que el paso de `BAJO` a `ALTO` ocurre exactamente en `500000` netos

5. Día sin ventas válidas
   - confirmar si no genera fila o genera fila en cero
   - documentar el comportamiento observado

---

## Paso 7: validar el alcance de asistencia

En esta auditoría, no se busca aprobar distribución individual todavía.

Solo hay que confirmar y dejar documentado que:

- `ColaboradoresPresentes = 0`
- `PropinaIndividualDiaria = 0`
- no se escriben aún filas en `ComisionesDiarias`
- no se escribe aún `ResumenMensualComisiones`

Esto es comportamiento esperado del estado actual.

---

## Criterios de aprobación

La auditoría pasa solo si se cumplen todos:

1. `RecalcularComisiones` encuentra la importación correcta.
2. El recálculo es idempotente.
3. No duplica filas en `VentasDiarias`.
4. Cada fila diaria coincide con la suma real de `VentasPOS` válidas.
5. Cada fila diaria coincide con la suma real de `PropinasPOS` válidas.
6. `ventaNetaValida` coincide con `ventaBrutaValida / 1.19`.
7. `tramoComision` y `%` coinciden con la regla vigente.
8. `comisionTotalDia` coincide con la fórmula vigente.
9. Queda explícito que la distribución individual por asistencia sigue pendiente.

---

## Entregable mínimo de la auditoría

Al cerrar la validación, dejar registrado:

1. `local`
2. `periodo`
3. `importId`
4. cantidad de días procesados
5. tabla manual de contraste para al menos 3 días
6. resultado de idempotencia
7. hallazgos o desviaciones
8. decisión:
   - `APROBADO PARA PASAR A PRODUCCION`
   - `REQUIERE AJUSTES ANTES DE PRODUCCION`

---

## Siguiente paso después de aprobar

Solo después de aprobar esta auditoría:

1. definir la regla de presencia diaria por colaborador usando `RegistroAsistencia`
2. calcular `ColaboradoresPresentes`
3. distribuir `comisionTotalDia` y propinas por colaborador
4. poblar `ComisionesDiarias`
5. poblar `ResumenMensualComisiones`
