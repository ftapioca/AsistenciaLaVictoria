# Roadmap Técnico
# Módulo Ventas, Comisiones y Propinas

Estado actual: en construcción  
Entorno activo de desarrollo: `staging` Apps Script  
Rama base actual: `feature/spreadsheet-by-id`

---

## 0. Base ya completada

- [x] Migración de Apps Script a acceso por Google Sheets ID.
- [x] Separación de persistencia `RRHH` / `Ventas`.
- [x] Conexión local VS Code <-> Apps Script vía `clasp`.
- [x] Consolidación de fuentes Apps Script a archivos `AppsScript/*.js`.
- [x] Estrategia de entornos `staging` / `prod`.
- [x] Bootstrap de hojas base en spreadsheet de ventas.
- [x] Endpoint `TestVentasSheet` validado sobre staging.

---

## 1. Backend V1 - Importación base

Objetivo: recibir JSON normalizado desde frontend y persistir importación + ventas + propinas.

- [x] Crear endpoint `ImportarVentas`.
- [x] Validar sesión admin.
- [x] Validar `metadata` obligatorio:
  - [x] `local`
  - [x] `periodo`
  - [x] `nombreArchivo`
  - [x] `hashArchivo`
  - [x] `fechaDesde`
  - [x] `fechaHasta`
- [x] Validar arrays `ventas` y `propinas`.
- [x] Generar `ImportId`.
- [x] Bloquear duplicado por `HashArchivo`.
- [x] Detectar importación previa por `Local + Periodo`.
- [x] Persistir `ImportacionesVentas`.
- [x] Persistir `VentasPOS`.
- [x] Persistir `PropinasPOS`.
- [x] Responder resumen básico de importación.

---

## 2. Backend V1.1 - Cálculo diario

Objetivo: transformar ventas/propinas importadas en resultados diarios utilizables a nivel agregado por `Fecha + Local + ImportId`.

- [x] Crear endpoint `RecalcularComisiones`.
- [x] Limpiar resultados previos por `ImportId`:
  - [x] `VentasDiarias`
- [x] Obtener ventas válidas por `ImportId`.
- [x] Obtener propinas válidas por `ImportId`.
- [x] Agrupar por `Fecha + Local`.
- [x] Calcular `VentaBrutaValida`.
- [x] Definir `VentaNetaValida = VentaBrutaValida - IVA`.
- [x] Definir `IVA = 19%`.
- [x] Calcular `VentaNetaValida`.
- [x] Determinar tramo:
  - [x] `BAJO` si neta < 500000
  - [x] `ALTO` si neta >= 500000
- [x] Definir porcentaje de comisión por tramo:
  - [x] `BAJO = 1%`
  - [x] `ALTO = 1,3%`
- [x] Calcular `ComisionTotalDia`.
- [x] Persistir `VentasDiarias`.

---

## 3. Backend V1.2 - Resumen mensual

Objetivo: generar resumen mensual operativo por `Local + ImportId`.

- [ ] Crear lógica de `ResumenMensualComisiones` a nivel agregado.
- [ ] Calcular `ComisionTotal`.
- [ ] Calcular `PropinaTotal`.
- [ ] Calcular `TotalComisionable`.
- [ ] Redondeo final a peso chileno.
- [ ] Crear endpoint `ConsultarResumenComisiones`.

---

## 3.1 Módulo futuro - pagosColaboradores

Objetivo: distribuir comisiones y propinas a personas una vez que exista contrato explícito de reparto.

- [ ] Crear módulo `pagosColaboradores`.
- [ ] Definir regla de presencia o elegibilidad por colaborador.
- [ ] Definir regla de reparto de comisión por colaborador.
- [ ] Definir regla de reparto de propina por colaborador.
- [ ] Generar resumen mensual pagable por colaborador.
- [ ] Integrar con asistencia y/o otras fuentes operativas si corresponde.

---

## 4. Backend V1.3 - Auditoría y mantenimiento

Objetivo: dejar el módulo recalculable y auditable.

- [x] Crear endpoint `ConsultarImportacionesVentas`.
- [x] Crear endpoint `ConsultarImportacionActivaVentas`.
- [ ] Crear endpoint `AnularImportacionVentas`.
- [ ] Definir estrategia final para `Local + Periodo`:
  - [x] reemplazar con auditoría mínima
- [ ] Registrar estados:
  - [ ] `SUCCESS`
  - [ ] `ERROR`
  - [ ] `ANULADO`
  - [ ] `REEMPLAZADO`
- [ ] Registrar observaciones de importación.

---

## 5. Frontend V1 - Parser y preview

Objetivo: permitir que admin cargue archivo POS y vea una vista previa robusta antes de importar.

- [x] Separar configuración frontend por entorno `staging` / `prod`.
- [x] Mostrar badge visual del entorno activo.
- [x] Crear `ventasMensuales.html`.
- [x] Integrar protección por sesión admin.
- [x] Selector de:
  - [x] local
  - [x] período
  - [x] archivo
- [x] Integrar parser XLS/XLSX/CSV.
- [x] Detectar hojas base en implementación heurística transitoria:
  - [x] ventas
  - [x] propinas
  - [ ] pagos
  - [ ] productos
- [x] Normalizar datos en navegador.
- [x] Calcular hash del archivo o contenido normalizado.
- [x] Mostrar preview:
  - [x] resumen
  - [x] ventas válidas
  - [ ] ventas excluidas
  - [x] propinas válidas
  - [ ] propinas excluidas
- [ ] Confirmar importación.
- [x] Llamar endpoint `ImportarVentas`.

### Criterio de parser para producción

- [x] El parser definitivo no dependerá de heurística genérica como contrato principal.
- [x] El parser objetivo debe operar por formato conocido:
  - [x] hoja esperada
  - [x] fila de encabezado esperada
  - [x] columnas/celdas esperadas
  - [x] reglas explícitas de extracción y normalización
- [ ] Levantar inventario de formatos POS reales que usa operación.
- [ ] Definir contrato por formato:
  - [ ] nombre interno del formato
  - [ ] hojas obligatorias
  - [ ] rango o fila de inicio
  - [ ] mapeo exacto de columnas
  - [ ] validaciones mínimas antes de importar
- [ ] Implementar parser determinístico para el primer formato POS real.
- [ ] Dejar la heurística actual solo como fallback temporal o herramienta de diagnóstico.
- [ ] Definir criterio de retiro del fallback heurístico una vez estabilizados los formatos soportados.

### Contrato inicial confirmado para formato POS V1

- [x] Primer formato soportado identificado a partir de export real de mayo 2026 para:
  - [x] Paseo del Lago
  - [x] Segunda Faja
- [x] La persistencia principal V1 se construye solo desde:
  - [x] hoja `Ventas`
  - [x] hoja `Propinas`
- [x] La hoja `Pagos` no participa todavía en la persistencia principal.
- [x] `Pagos` se revisará más adelante cuando estén confirmados todos los tipos y reglas de medios de pago.
- [x] El `local` no se infiere desde el archivo; lo define el selector del frontend.
- [x] El `periodo` se deriva desde el bloque superior de la hoja `Ventas`:
  - [x] `Desde 01/05/2026`
  - [x] `Hasta 01/06/2026`
  - [x] se traduce a `periodo = 2026-05`
  - [x] `fechaDesde = 2026-05-01`
  - [x] `fechaHasta = 2026-05-31`
- [x] Filtro de filas para `ventas[]`:
  - [x] usar solo filas con `Estado = Cerrada`
- [x] Filtro de filas para `propinas[]`:
  - [x] usar solo filas con `Cancelada != Si`
- [x] Los valores de propina se redondean de inmediato a peso entero durante la normalización.
- [x] En este tramo se ignoran completamente:
  - [x] `Productos`
  - [x] `Adiciones`
  - [x] `Adiciones de Modificadores`
  - [x] `Descuentos`
  - [x] `Costos de Envío`

---

## 6. Frontend V1.1 - Resumen y auditoría

Objetivo: que el admin vea resultados y pueda recalcular o revisar historial.

- [ ] Vista de importaciones por período/local.
- [ ] Vista de resumen mensual operativo.
- [ ] Acción de recalcular.
- [ ] Acción de anular importación.

---

## 7. Extensiones futuras

- [ ] Persistencia completa de `PagosPOS`.
- [ ] Persistencia completa de `ProductosPOS`.
- [ ] Cuadratura diaria por medio de pago.
- [ ] KPIs operacionales diarios.
- [ ] Exportación de resumen.
- [ ] Reglas avanzadas de comisión por local/cargo/categoría.
- [ ] Módulo `pagosColaboradores` para distribución individual.

---

## 8. Decisiones abiertas

- [x] Si ya existe `Local + Periodo`, se reemplaza con auditoría mínima.
- [x] No se implementa versionado múltiple en esta etapa.
- [x] Asistencia incompleta no bloquea cálculo; deja observaciones.
- [x] El parsing objetivo para producción será determinístico por formato conocido, no heurístico genérico.
- [x] La comisión operativa inicial se calculará a nivel agregado por día/local, no por colaborador.
- [x] La distribución individual se posterga al módulo futuro `pagosColaboradores`.
- [x] Redondeo solo mensual.
- [ ] ¿Exportar resumen a Excel/PDF?

---

## 9. Reglas operativas

- El archivo bruto no se envía a Apps Script.
- El parser vive en frontend.
- Apps Script recibe JSON normalizado.
- La heurística actual de hojas/columnas comunes no define el contrato final del módulo; solo cubre una etapa transitoria.
- El contrato objetivo de parsing debe definirse por formato POS conocido y validado.
- Cada formato soportado debe declarar explícitamente:
  - hoja(s) esperada(s)
  - fila de encabezado
  - columnas o celdas fuente
  - reglas de validación previas a la importación
- Para el primer formato POS soportado:
  - `ventas[]` se construye exclusivamente desde hoja `Ventas`
  - `propinas[]` se construye exclusivamente desde hoja `Propinas`
  - `Pagos` no entra todavía al payload persistente principal
  - el `local` proviene del selector y no del archivo
  - el período mensual se deriva desde `Desde` y `Hasta` de la hoja `Ventas`
- `VentaNetaValida` se calcula como `VentaBrutaValida - IVA`, usando `IVA = 19%`.
  - para este módulo se asume IVA incluido en la venta bruta, por lo que la base neta se obtiene como `VentaBrutaValida / 1.19`
- El cálculo de comisión operativa usa tramos:
  - `BAJO`: neta < 500000 => `1%`
  - `ALTO`: neta >= 500000 => `1,3%`
- La distribución por colaborador no forma parte de este módulo en la etapa actual.
- Si un archivo no calza con un formato soportado, debe rechazarse o quedar en modo diagnóstico; no debe inferirse silenciosamente en producción.
- Frontend y backend deben poder apuntar explícitamente a `staging` o `prod`.
- Solo puede existir una importación activa por `Local + Periodo`.
- Si entra una nueva importación para el mismo `Local + Periodo`, la anterior deja de ser activa.
- La importación reemplazada debe conservarse en `ImportacionesVentas` para trazabilidad.
- Los cálculos y consultas operativas deben usar solo importaciones activas.
- En esta etapa, las lecturas operativas de ventas/propinas deben resolverse por `ImportId` activo.
- La asistencia no participa todavía en el cálculo de comisiones, porque el reparto individual se posterga al módulo `pagosColaboradores`.
- El redondeo monetario final se realiza a nivel mensual.
- Las pruebas de ramas deben hacerse sobre `staging`.
- Producción se actualiza solo desde `main`.
- Deploy productivo debe usar deployment versionado, no `@HEAD`.

---

## 10. Contratos operativos preliminares

### `ImportarVentas`

Propósito: registrar una nueva importación normalizada y, si corresponde, reemplazar la importación activa previa del mismo `Local + Periodo`.

Reglas:

- Requiere sesión admin válida.
- Recibe `metadata`, `ventas` y `propinas`.
- `metadata` debe incluir:
  - `local`
  - `periodo`
  - `nombreArchivo`
  - `hashArchivo`
  - `fechaDesde`
  - `fechaHasta`
- Si ya existe una importación con el mismo `hashArchivo` y estado activo, debe rechazarse como duplicado.
- Si ya existe una importación activa para el mismo `Local + Periodo`, la nueva importación la reemplaza.
- La importación anterior no se elimina:
  - pasa a estado `REEMPLAZADO`
  - conserva sus filas históricas
  - deja observación indicando `ImportId` reemplazante y fecha de reemplazo
- La nueva importación se registra como activa y en estado `SUCCESS`.
- Los registros `VentasPOS` y `PropinasPOS` de importaciones reemplazadas no se borran en esta etapa; quedan fuera de uso porque las consultas deben filtrar por importación activa.

Respuesta mínima esperada:

- `status`
- `importId`
- `local`
- `periodo`
- `importacionReemplazada`
- `registrosVentas`
- `registrosPropinas`
- `observaciones`

### `AnularImportacionVentas`

Propósito: desactivar una importación previamente cargada sin borrar su historial.

Reglas:

- Requiere sesión admin válida.
- Recibe al menos `importId` y `motivo`.
- No elimina filas históricas de `ImportacionesVentas`, `VentasPOS` ni `PropinasPOS`.
- La importación anulada cambia a estado `ANULADO`.
- Debe registrar observación con motivo, usuario y fecha de anulación.
- Si la importación anulada era la activa para ese `Local + Periodo`, ese par queda sin importación activa hasta una nueva carga.
- Los cálculos y consultas posteriores no deben considerar importaciones con estado `ANULADO` ni `REEMPLAZADO`.

Respuesta mínima esperada:

- `status`
- `importId`
- `estadoFinal`
- `local`
- `periodo`
- `afectaImportacionActiva`
- `observaciones`

---

## 11. Estado técnico al cierre de este tramo

- `ImportarVentas` quedó implementado en Apps Script y subido a `staging`.
- La validación y persistencia del endpoint ya soportan:
  - sesión admin
  - `POST` con payload JSON
  - duplicado por `hashArchivo`
  - reemplazo automático de importación activa previa del mismo `Local + Periodo`
- El frontend quedó separado por entorno:
  - `app-config.prod.js`
  - `app-config.staging.js`
  - `app-config.js`
- Todas las vistas principales y los HTML de `Assets/` muestran badge visual del entorno activo.
- `ventasMensuales.html` ya soporta carga de `JSON`, `CSV`, `XLS` y `XLSX` con normalización inicial en navegador.

Pendiente importante para retomar:

- implementar parser determinístico para el formato POS V1 ya confirmado
- fijar encabezados exactos y mapeo de columnas para:
  - hoja `Ventas`
  - hoja `Propinas`
- validar conversión de fechas Excel y normalización final de propinas a entero
- mantener `Pagos` fuera de persistencia principal hasta cerrar catálogo y reglas de medios de pago
- luego detectar también hojas de `pagos` y `productos` dentro del mismo esquema explícito

Actualización:

- se creó un deployment web app versionado funcional para `staging`
- `ImportarVentas` ya fue validado end-to-end contra ese deployment
- el frontend debe usar esa URL versionada mientras se mantenga vigente

Siguiente paso recomendado:

- implementar el parser determinístico del formato POS V1 ya validado
- probar importación real contra `staging` usando ese contrato explícito
- luego avanzar a `RecalcularComisiones`
