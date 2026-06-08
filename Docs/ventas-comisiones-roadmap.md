# Roadmap Técnico
# Módulo Ventas, Comisiones y Propinas

Estado documental: actualizado desde `feature/spreadsheet-by-id`  
Estado del trabajo: en desarrollo, no mergeado a `main`  
Entorno recomendado para pruebas: `staging`  
Rama funcional de referencia: `feature/spreadsheet-by-id`

---

## Resumen ejecutivo

La rama `feature/spreadsheet-by-id` ya contiene una implementación sustancial del módulo.
No está solo en etapa de ideas o documentación.

Estado observado al revisar esa rama:

- `ImportarVentas` implementado.
- `ConsultarImportacionesVentas` implementado.
- `ConsultarImportacionActivaVentas` implementado.
- `RecalcularComisiones` implementado.
- Normalización de `periodo` a `YYYY-MM` implementada, con compatibilidad legacy al leer.
- Frontend `ventasMensuales.html` implementado como importador técnico.
- Parser POS V1 bastante formalizado en frontend.

Conclusión:

- El mayor vacío ya no parece ser el parser.
- El siguiente tramo corto recomendado es auditar operativamente `RecalcularComisiones` en `staging` y luego exponer una UI mínima para dispararlo y revisar su resumen.

---

## Implementado en la rama de referencia

### Backend

- Migración de Apps Script a acceso por Google Sheets ID.
- Separación de persistencia `RRHH` / `Ventas`.
- Estructura `AppsScript/*.js` consolidada para `clasp`.
- Bootstrap de hojas base en spreadsheet de ventas.
- Endpoint `TestVentasSheet`.
- Endpoint `ImportarVentas`.
- Endpoint `ConsultarImportacionesVentas`.
- Endpoint `ConsultarImportacionActivaVentas`.
- Endpoint `RecalcularComisiones`.
- Reemplazo de importación activa por `Local + Periodo`.
- Detección de duplicado por `hashArchivo`.
- Normalización de `periodo` a formato `YYYY-MM`.
- Compatibilidad de lectura para importaciones legacy con `periodo` persistido en formato no canónico.

### Frontend

- Configuración explícita por entorno `staging` / `prod`.
- Badge visual del entorno activo.
- Vista `ventasMensuales.html`.
- Protección por sesión admin.
- Preview técnico para carga de ventas/propinas.
- Consulta de importaciones existentes por `Local + Periodo`.
- Parser POS V1 con validaciones de estructura.
- Derivación de `periodo`, `fechaDesde` y `fechaHasta` desde la hoja `Ventas`.

---

## Estado funcional interpretado

### Ya materializado

- El parser POS V1 no está solo “pendiente”; ya existe una primera implementación bastante específica.
- El backend de recálculo tampoco está pendiente como idea; ya existe y persiste en `VentasDiarias`.

### Pendiente real

- Auditoría operativa de `RecalcularComisiones` en `staging`.
- Confirmar idempotencia del recálculo.
- Confirmar contenido real de `VentasDiarias` por `Fecha + Local + ImportId`.
- Revisar placeholders de columnas como `ColaboradoresPresentes` y `PropinaIndividualDiaria` mientras no exista `pagosColaboradores`.
- Endpoint `AnularImportacionVentas`.
- Endpoint `ConsultarResumenComisiones`.
- Resumen mensual operativo.
- UI administrativa mínima para recalcular y revisar resultados desde frontend.

---

## Siguiente tramo recomendado

Orden recomendado para retomar el desarrollo:

1. Auditar `RecalcularComisiones` en `staging`.
2. Ajustar el contrato funcional documentado según esa auditoría.
3. Exponer una UI mínima para:
   - detectar importación activa por `Local + Periodo`
   - ejecutar `RecalcularComisiones`
   - mostrar resumen del resultado

No se recomienda partir por:

- `pagosColaboradores`
- resumen mensual por colaborador
- nuevas extensiones de parser

Motivo:

- primero conviene cerrar la base operativa agregada ya implementada.

---

## Reglas operativas vigentes

- Las pruebas de esta línea de trabajo deben hacerse sobre `staging`.
- Producción se actualiza solo desde `main`.
- El deploy productivo debe usar deployment versionado, no `@HEAD`.
- El archivo bruto no se envía a Apps Script.
- El parser vive en frontend.
- Apps Script recibe JSON normalizado.

---

## Nota de mantenimiento

Este roadmap refleja la revisión documental realizada sobre `feature/spreadsheet-by-id`.
Si esa rama cambia, este archivo debe actualizarse para mantener sincronía entre:

- estado real del código
- estado declarado en roadmap
- próximo tramo recomendado
