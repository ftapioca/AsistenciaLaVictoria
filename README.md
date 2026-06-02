# AsistenciaLaVictoria

Registro de asistencia y turnos para La Victoria.

## Estructura actual

- `index.html`: selector de ingreso por PIN con detección automática de rol.
- `adminPanel.html`: panel administrativo protegido con accesos internos y caja de archivos adjuntos.
- `TurnosAbiertos.html`: dashboard administrativo protegido para revisar turnos abiertos por local.
- `programadorTurnos.html`: programador semanal protegido para administradores.
- `misTurnos.html`: vista semanal de solo lectura para colaboradores.
- `Assets/`: archivos adjuntos descargables para administradores y HTML de registro por local.
- `app-config.js`: configuración compartida del `WEB_APP_URL` y clave de sesión.
- `auth.js`: autenticación, validación de sesión y control de acceso en frontend.
- `AppsScriptAuth.gs`: base para integrar login, validación de sesión y control de roles en Google Apps Script.
- `AppsScript/`: copia local del proyecto real de Google Apps Script usada como referencia y documentación viva.

## Admin Panel

`adminPanel.html` concentra la navegación administrativa.

- La información de sesión y las acciones de cerrar sesión y volver al ingreso están integradas en el `hero`.
- La caja `Archivos adjuntos` lista recursos administrativos.
- Actualmente incluye:
  - un enlace externo a `Reporte y registro de asistencia` en Google Sheets
  - archivos HTML descargables contenidos en `Assets/`

Nota: este proyecto es estático, por lo que el navegador no puede enumerar carpetas automáticamente. La lista de adjuntos del panel se mantiene en el arreglo `attachedResources` dentro de `adminPanel.html`.

## Registro Por Local

Los archivos de `Assets/Registro Asistencia _ Local ...` permiten:

- registrar ingresos y salidas por PIN
- consultar último registro del colaborador
- mostrar turnos abiertos del local

La consulta de turnos abiertos en esos HTML usa la acción pública `TurnosAbiertosPublico` para no exigir sesión.

## Integración Con Apps Script

El `WEB_APP_URL` apunta a un proyecto de Google Apps Script que combina:

- autenticación y sesiones
- registro de asistencia
- cierre y consulta de turnos abiertos
- programación semanal

La copia local de referencia está en `AppsScript/`.

## Acciones Públicas

- `UsuariosPorRol`
- `UltimoRegistro`
- `Ingreso`
- `Salida`
- `Version`
- `TurnosAbiertosPublico`
- consulta de colaboradores por local para registro desde `doGet` sin `accion`

## Acciones Protegidas

Requieren sesión válida y rol `Administrador`:

- `TurnosAbiertos`
- `ColaboradoresPorLocal`
- `TurnosSemana`
- `GuardarTurno`
- `EliminarTurno`
- `CopiarSemana`
- `CopiarSemanaAnterior`
- `PlantillasTurnos`
- `HorarioLocal`

Requieren sesión válida y rol `Colaborador`:

- `TurnosSemanaColaborador`

## Turnos Abiertos

Se separaron dos acciones con la misma lógica base:

- `TurnosAbiertos`: uso administrativo, protegida por `requireAdminSession(...)`
- `TurnosAbiertosPublico`: uso de los HTML de registro local, sin sesión

La acción pública devuelve solo datos básicos:

- `nombre`
- `local`
- `accion`
- `fechaHora`
- `hora`
- `iniciales`

No expone `rut`.
