# Apps Script

Esta carpeta se usa para mantener una copia local del proyecto de Google Apps Script.

## Archivos actuales

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
