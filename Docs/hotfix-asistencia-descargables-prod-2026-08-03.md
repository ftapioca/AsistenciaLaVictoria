# Hotfix Asistencia Descargables Prod 2026-08-03

Fecha:

- 2026-08-03

Rama:

- `hotfix/asistencia-descargables-prod-2026-08-03`

Objetivo:

- corregir los HTML descargables de asistencia para que operen con la lógica moderna de `Usuarios` + `UsuariosLocales`
- eliminar la dependencia operativa de la hoja legacy `Colaboradores`
- habilitar marcación para roles `Colaborador` y `Supervisor`
- impedir más de un turno abierto simultáneo por persona entre distintos locales

Archivos incluidos en este hotfix:

- `AppsScript/RegistroAsistencias.js`
- `descargablesLocales/Registro Asistencia _ Local Paseo del Lago.html`
- `descargablesLocales/Registro Asistencia _ Local Segunda Faja.html`

Cambios funcionales:

- la lista pública por local ahora se resuelve desde `Usuarios` + `UsuariosLocales`
- si existe la hoja `UsuariosLocales`, asistencia ya no cae a `Usuarios.local`
- la validación de PIN para `Ingreso`, `Salida` y `UltimoRegistro` usa usuarios modernos
- la marcación administrativa reutiliza la misma resolución moderna por local
- si una persona ya tiene un `Ingreso` abierto en otro local, el sistema bloquea un nuevo ingreso y devuelve alerta explícita
- la `Salida` se fuerza al mismo local del turno abierto
- los HTML descargables fueron actualizados para exponer mejor los mensajes de validación durante operación y prueba

Validación esperada en producción:

- usuarios activos de cada local coinciden con `UsuariosLocales`
- usuarios inactivos o sin asignación activa no aparecen en la lista
- un supervisor activo con local asignado puede marcar
- un colaborador no puede abrir un segundo turno en otro local sin cerrar el anterior
- el cierre incorrecto por local muestra mensaje de error y no registra marca
