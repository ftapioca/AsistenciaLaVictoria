# Apps Script

Esta carpeta se usa para mantener una copia local del proyecto de Google Apps Script.

## Archivos actuales

- `AuthRoles.js`: autenticación, sesiones y control de roles.
- `RegistroAsistencias.js`: router principal `doGet` y `doPost`, registro de asistencia y consultas base.
- `CierreTurnos.js`: lógica de turnos abiertos y cierre de turnos.
- `SpreadsheetStore.js`: helpers para acceso a hojas por spreadsheet ID.
- `VentasComisiones.js`: importación y cálculo de ventas/comisiones.
- `programadorTurnos.js`: programación semanal y helpers asociados.
- `versionesSistema.js`: versión del sistema.
- `appsscript.json`: manifest del proyecto sincronizado con Google Apps Script.

## Acciones y permisos

### Públicas

- `UsuariosPorRol`
- `UltimoRegistro`
- `Ingreso`
- `Salida`
- `Version`
- `TurnosAbiertosPublico`
- consulta de colaboradores por local desde `doGet` sin `accion`

### Protegidas para administradores

- `BootstrapProgramadorTurnos`
- `TurnosAbiertos`
- `ColaboradoresPorLocal`
- `EliminarTurno`
- `HorarioLocal`
- `TurnosSemana`
- `GuardarTurno`
- `CopiarSemana`
- `CopiarSemanaAnterior`
- `PlantillasTurnos`
- `TestVentasSheet`
- `ConsultarImportacionesVentas`
- `ConsultarImportacionActivaVentas`
- `ImportarVentas`
- `RecalcularComisiones`

### Protegidas para colaboradores

- `TurnosSemanaColaborador`

## Programador de turnos

La carga administrativa principal del programador semanal ya no depende de tres requests seriales separadas para:

- `PlantillasTurnos`
- `ColaboradoresPorLocal`
- `TurnosSemana`

Desde junio de 2026, el flujo principal usa el endpoint agregado:

- `BootstrapProgramadorTurnos`

Contrato funcional actual del bootstrap:

- valida sesión admin
- recibe `local`, `fechaInicio` y `fechaFin`
- devuelve:
  - `session`
  - `context`
  - `data.plantillas`
  - `data.colaboradores`
  - `data.turnos`
  - `meta.counts`

Estado:

- activo en `prod`
- activo en `staging`
- consumido por `src/scripts/programador-turnos.js`

Próximo paso planificado:

- agregar `horariosSemana` dentro de `BootstrapProgramadorTurnos` para eliminar consultas repetidas a `HorarioLocal` al abrir modales o validar guardados por fecha

## Turnos abiertos

La lógica base vive en `CierreTurnos.js`.

- `obtenerTurnosAbiertos(params)`: respuesta administrativa protegida.
- `obtenerTurnosAbiertosPublico(params)`: respuesta pública para los HTML de `descargablesLocales`.
- `construirRespuestaTurnosAbiertos_(params)`: función compartida para evitar duplicar lógica.

La respuesta pública expone solo:

- `nombre`
- `local`
- `accion`
- `fechaHora`
- `hora`
- `iniciales`

No expone `rut`.

## Ventas, comisiones y propinas

La base operativa del módulo ya está presente en `main`.

Estado actual:

- `ImportarVentas` persiste importaciones normalizadas en el spreadsheet de ventas.
- `ConsultarImportacionesVentas` lista historial por `Local + Periodo`.
- `ConsultarImportacionActivaVentas` resuelve la importación activa y su resumen base.
- `RecalcularComisiones` recompone `VentasDiarias` para una importación activa o resuelta por `importId`.

Siguiente paso operativo:

- auditar `RecalcularComisiones` en `staging` con datos reales para confirmar que el cálculo diario soporta correctamente el cálculo de comisiones

## Uso de esta carpeta

Esta carpeta es la fuente de verdad del backend para `clasp`.
Todo cambio de Apps Script debe hacerse sobre `*.js` y `appsscript.json`, y luego sincronizarse con `clasp pull` / `clasp push`.

No se mantienen archivos `*.gs` duplicados para evitar drift entre:

- lo que está versionado en git
- lo que realmente se despliega a staging y producción
