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

- `TurnosAbiertos`
- `ColaboradoresPorLocal`
- `EliminarTurno`
- `HorarioLocal`
- `TurnosSemana`
- `GuardarTurno`
- `CopiarSemana`
- `CopiarSemanaAnterior`
- `PlantillasTurnos`

### Protegidas para colaboradores

- `TurnosSemanaColaborador`

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

## Uso de esta carpeta

Esta carpeta es la fuente de verdad del backend para `clasp`.
Todo cambio de Apps Script debe hacerse sobre `*.js` y `appsscript.json`, y luego sincronizarse con `clasp pull` / `clasp push`.

No se mantienen archivos `*.gs` duplicados para evitar drift entre:

- lo que está versionado en git
- lo que realmente se despliega a staging y producción
