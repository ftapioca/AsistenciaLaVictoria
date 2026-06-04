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

Objetivo: transformar ventas/propinas importadas en resultados diarios utilizables.

- [ ] Crear endpoint `RecalcularComisiones`.
- [ ] Limpiar resultados previos por `ImportId`:
  - [ ] `VentasDiarias`
  - [ ] `ComisionesDiarias`
  - [ ] `ResumenMensualComisiones`
- [ ] Obtener ventas válidas por `ImportId`.
- [ ] Obtener propinas válidas por `ImportId`.
- [ ] Agrupar por `Fecha + Local`.
- [ ] Calcular `VentaBrutaValida`.
- [ ] Calcular `VentaNetaValida`.
- [ ] Determinar tramo:
  - [ ] `BAJO` si neta < 500000
  - [ ] `ALTO` si neta >= 500000
- [ ] Calcular comisión individual diaria.
- [ ] Buscar colaboradores presentes desde RRHH.
- [ ] Calcular propina individual diaria.
- [ ] Persistir `VentasDiarias`.
- [ ] Persistir `ComisionesDiarias`.

---

## 3. Backend V1.2 - Resumen mensual

Objetivo: generar resumen pagable por colaborador.

- [ ] Crear lógica de `ResumenMensualComisiones`.
- [ ] Calcular `DiasTrabajados`.
- [ ] Calcular `ComisionTotal`.
- [ ] Calcular `PropinaTotal`.
- [ ] Calcular `TotalPagar`.
- [ ] Redondeo final a peso chileno.
- [ ] Crear endpoint `ConsultarResumenComisiones`.

---

## 4. Backend V1.3 - Auditoría y mantenimiento

Objetivo: dejar el módulo recalculable y auditable.

- [ ] Crear endpoint `ConsultarImportacionesVentas`.
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
- [ ] Selector de:
  - [ ] local
  - [ ] período
  - [ ] archivo
- [ ] Integrar parser XLS/XLSX/CSV.
- [ ] Detectar hojas:
  - [ ] ventas
  - [ ] propinas
  - [ ] pagos
  - [ ] productos
- [ ] Normalizar datos en navegador.
- [ ] Calcular hash del archivo o contenido normalizado.
- [ ] Mostrar preview:
  - [ ] resumen
  - [ ] ventas válidas
  - [ ] ventas excluidas
  - [ ] propinas válidas
  - [ ] propinas excluidas
- [ ] Confirmar importación.
- [x] Llamar endpoint `ImportarVentas`.

---

## 6. Frontend V1.1 - Resumen y auditoría

Objetivo: que el admin vea resultados y pueda recalcular o revisar historial.

- [ ] Vista de importaciones por período/local.
- [ ] Vista de resumen mensual por colaborador.
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

---

## 8. Decisiones abiertas

- [x] Si ya existe `Local + Periodo`, se reemplaza con auditoría mínima.
- [x] No se implementa versionado múltiple en esta etapa.
- [x] Asistencia incompleta no bloquea cálculo; deja observaciones.
- [ ] ¿Recalcular automáticamente tras corrección de asistencia?
- [x] Redondeo solo mensual.
- [ ] ¿Exportar resumen a Excel/PDF?

---

## 9. Reglas operativas

- El archivo bruto no se envía a Apps Script.
- El parser vive en frontend.
- Apps Script recibe JSON normalizado.
- Frontend y backend deben poder apuntar explícitamente a `staging` o `prod`.
- Solo puede existir una importación activa por `Local + Periodo`.
- Si entra una nueva importación para el mismo `Local + Periodo`, la anterior deja de ser activa.
- La importación reemplazada debe conservarse en `ImportacionesVentas` para trazabilidad.
- Los cálculos y consultas operativas deben usar solo importaciones activas.
- Asistencia incompleta no bloquea cálculo; solo agrega observaciones.
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
- `ventasMensuales.html` quedó creada como importador técnico basado en JSON normalizado para probar el endpoint antes del parser POS final.

Pendiente importante para retomar:

- validar end-to-end `ImportarVentas` contra la web app correcta de `staging`
- decidir si `staging` seguirá probándose contra `@HEAD` o contra un deployment web app versionado específico
- reemplazar el harness JSON por parser POS real `XLS/XLSX/CSV`

Actualización:

- se creó un deployment web app versionado funcional para `staging`
- `ImportarVentas` ya fue validado end-to-end contra ese deployment
- el frontend debe usar esa URL versionada mientras se mantenga vigente

Siguiente paso recomendado:

- construir `ventasMensuales.html` con parser local, hash y preview
- probar importación real contra `staging`
- luego avanzar a `RecalcularComisiones`
