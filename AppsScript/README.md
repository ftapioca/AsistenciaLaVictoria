# Apps Script

Esta carpeta se usa para mantener una copia local del proyecto de Google Apps Script.

## Archivos actuales

- `SpreadsheetStore.gs`: helper central para abrir spreadsheets por ID y resolver hojas por dominio.
- `AuthRoles.gs`: autenticación, sesiones y control de roles.
- `RegistroAsistencias.gs`: router principal `doGet` y `doPost`, registro de asistencia y consultas base.
- `CierreTurnos.gs`: lógica de turnos abiertos y cierre de turnos.
- `programadorTurnos.gs`: programación semanal y helpers asociados.
- `versionesSistema.gs`: versión del sistema.

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

La lógica base vive en `CierreTurnos.gs`.

- `obtenerTurnosAbiertos(params)`: respuesta administrativa protegida.
- `obtenerTurnosAbiertosPublico(params)`: respuesta pública para los HTML de `Assets`.
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

Esta carpeta debe mantenerse alineada con el proyecto desplegado en Google Apps Script para poder revisar cambios con contexto completo desde este repositorio.

## Trabajo local con VS Code

La forma recomendada para conectar este repo con el proyecto real de Google Apps Script es usar `clasp`.

Setup local esperado:

- `npm install`
- `npm run gas:login`
- crear `.clasp.json` con el `scriptId` del proyecto y `rootDir: "AppsScript"`
- `npm run gas:pull` para bajar el proyecto remoto
- `npm run gas:push` para subir cambios desde este repo

No se deben versionar:

- `.clasp.json`
- `.clasprc.json`

## Configuración de Script Properties

El proyecto debe configurarse con IDs explícitos de Google Sheets. Ya no debe depender de `getActiveSpreadsheet()`.

Propiedades requeridas:

- `LV_SPREADSHEET_RRHH_ID`
- `LV_SPREADSHEET_VENTAS_ID`

Actualmente:

- asistencia, autenticación, turnos y cierre leen/escriben sobre `LV_SPREADSHEET_RRHH_ID`
- ventas y comisiones deben leer/escribir sobre `LV_SPREADSHEET_VENTAS_ID`
