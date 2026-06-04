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

- [ ] Crear endpoint `ImportarVentas`.
- [ ] Validar sesión admin.
- [ ] Validar `metadata` obligatorio:
  - [ ] `local`
  - [ ] `periodo`
  - [ ] `nombreArchivo`
  - [ ] `hashArchivo`
  - [ ] `fechaDesde`
  - [ ] `fechaHasta`
- [ ] Validar arrays `ventas` y `propinas`.
- [ ] Generar `ImportId`.
- [ ] Bloquear duplicado por `HashArchivo`.
- [ ] Detectar importación previa por `Local + Periodo`.
- [ ] Persistir `ImportacionesVentas`.
- [ ] Persistir `VentasPOS`.
- [ ] Persistir `PropinasPOS`.
- [ ] Responder resumen básico de importación.

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
  - [ ] bloquear
  - [ ] reemplazar
  - [ ] versionar
- [ ] Registrar estados:
  - [ ] `SUCCESS`
  - [ ] `ERROR`
  - [ ] `ANULADO`
- [ ] Registrar observaciones de importación.

---

## 5. Frontend V1 - Parser y preview

Objetivo: permitir que admin cargue archivo POS y vea una vista previa robusta antes de importar.

- [ ] Crear `ventasMensuales.html`.
- [ ] Integrar protección por sesión admin.
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
- [ ] Llamar endpoint `ImportarVentas`.

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

- [ ] ¿Bloquear importación si ya existe `Local + Periodo`?
- [ ] ¿Permitir reemplazo explícito?
- [ ] ¿Permitir múltiples versiones del mismo período?
- [ ] ¿Bloquear cálculo si asistencia está incompleta?
- [ ] ¿Recalcular automáticamente tras corrección de asistencia?
- [ ] ¿Redondeo diario o solo mensual?
- [ ] ¿Exportar resumen a Excel/PDF?

---

## 9. Reglas operativas

- El archivo bruto no se envía a Apps Script.
- El parser vive en frontend.
- Apps Script recibe JSON normalizado.
- Las pruebas de ramas deben hacerse sobre `staging`.
- Producción se actualiza solo desde `main`.
- Deploy productivo debe usar deployment versionado, no `@HEAD`.
