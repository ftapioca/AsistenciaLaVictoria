# AsistenciaLaVictoria

Registro de asistencia y turnos para La Victoria.

## Estructura actual

- `index.html`: selector de ingreso por PIN con detección automática de rol.
- `TurnosAbiertos.html`: dashboard administrativo protegido.
- `programadorTurnos.html`: programador semanal protegido para administradores.
- `misTurnos.html`: vista semanal de solo lectura para colaboradores.
- `app-config.js`: configuración compartida del `WEB_APP_URL` y clave de sesión.
- `auth.js`: autenticación, validación de sesión y control de acceso en frontend.
- `AppsScriptAuth.gs`: base para integrar login, validación de sesión y control de roles en Google Apps Script.

## Integración requerida en Apps Script

El archivo `AppsScriptAuth.gs` debe incorporarse al proyecto de Google Apps Script que hoy atiende el `WEB_APP_URL`.

Endpoints esperados:

- `LoginPorPin`
- `ValidarSesion`
- `Logout`
- `TurnosSemanaColaborador`

Endpoints administrativos que deben validar rol `Administrador`:

- `TurnosAbiertos`
- `ColaboradoresPorLocal`
- `TurnosSemana`
- `GuardarTurno`
- `EliminarTurno`
- `CopiarSemana`
- `PlantillasTurnos`
- `HorarioLocal`
