# Revisión y limpieza del código — 6 de noviembre de 2026

Estado: limpieza validada e integrada para publicación. No se modificaron registros de asistencia ni asignaciones de usuarios.

Base revisada: `main` en `1e34b4f`, después del alta de locales desde el panel. Se revisaron fuentes de Apps Script, entradas de frontend, componentes, helpers, HTML publicados y scripts de build. Se rastrearon llamadas, imports, acciones del router y rutas publicadas antes de retirar código.

## Código retirado sin consumidores activos

| Archivo | Funciones retiradas | Motivo |
| --- | --- | --- |
| `AppsScript/AuthRoles.js` | `listStructuredAssignmentsByPrincipal_`, `ejecutarMigracionUsuariosUnicos_`, `buildManagedUserConsolidationGroupKey_` | La resolución activa usa índices de asignaciones. La migración masiva ya estaba deshabilitada; la consolidación por grupo sigue disponible. |
| `AppsScript/RegistroAsistencias.js` | `listStructuredAssignmentsForAttendanceUser_`, `listAttendanceAssignedLocalsForUser_` | Sustituidas por la resolución compartida de usuarios y asignaciones. |
| `AppsScript/programadorTurnos.js` | `listarColaboradoresPorLocalDesdeDatos_` | El programador ya consulta Usuarios y UsuariosLocales. |
| `AppsScript/VentasComisiones.js` | `construirFilasVentasDiarias_`, `crearGrupoVentaDiaria_` | Construcción antigua sin llamadas. El recálculo usa el contexto diario vigente. |
| `src/scripts/mis-turnos.js` | `primerNombre` | Sin consumidores en esa vista. La variante publicada que sí lo usa no se modificó. |
| `src/scripts/pagos-mensuales.js` | `numberInput` | Los campos actuales usan los inputs monetarios activos. |
| `src/scripts/usuarios-permisos.js` | `createAccordionSection` | El listado actual usa una tabla. |

Se retiraron además las constantes no utilizadas `ESTADO_IMPORTACION_ANULADO` y `SPREADSHEET_KEY_COMISIONES`, y el componente `ActionCard.js`, sin imports activos. Se mantiene el alias de almacenamiento `comisiones` para no alterar la compatibilidad del almacén.

El alta puntual de Portal Frances se trasladó desde `AppsScript/AltaPortalFrances.js` a `scripts/archive/alta-portal-frances.js`. Conserva su historial y las pruebas del caso real, pero deja de formar parte del backend sincronizado por clasp. Las altas operativas usan `AltaLocales.js` y el panel.

## Duplicación consolidada

- `src/utils/navigation.js`: única implementación de navegación que conserva el entorno activo, los parámetros y los fragmentos de URL.
- `src/utils/async.js`: espera compartida del siguiente frame, utilizada por los estados de carga.
- `scripts/ui-entries.mjs`: catálogo único de entradas, rutas publicadas y archivos estáticos, compartido por Vite, postbuild y publicación. Conserva las rutas existentes.
- Se eliminaron copias intermedias de páginas que eran sobrescritas inmediatamente por el build.

## Locales sin valores ficticios

Horarios Locales usa el catálogo devuelto por el backend. Si está vacío, no ofrece Paseo del Lago y Segunda Faja como alternativas inventadas y muestra cómo dar de alta un local.

El backfill del catálogo conserva la lectura de datos reales de horarios, usuarios y la hoja legacy de colaboradores. Cuando todas esas fuentes están vacías, deja el catálogo vacío; ya no crea automáticamente los dos locales históricos.

## Compatibilidades activas conservadas

- `misTurnos.html` sigue siendo la vista publicada; `src/misTurnos.html` es otra variante compilada como `misTurnos-design-system.html`. Unificarlas requiere validar por separado interfaz, calendario y experiencia del colaborador.
- Los HTML históricos de asistencia y los assets publicados conservan enlaces que pueden estar guardados o abiertos. No se eliminaron archivos por antigüedad o por no tener imports desde las fuentes actuales.
- Las lecturas legacy de autenticación y `Usuarios.local` todavía tienen consumidores y sirven a entornos no migrados. No se retiraron sus fallbacks activos.
- Los presets de respaldo de `app-config.js` permiten consumidores que no cargan los archivos de preset separados. Su unificación queda pendiente de comprobar esos consumidores.
- Los nombres de locales en ejemplos, textos orientativos y reglas de comisiones históricas no equivalen a un selector operativo hardcodeado. Se conservaron las reglas de Segunda Faja anteriores al 01/11/2026 y la ausencia de comisión de Portal Frances.
- El endpoint de migración masiva sigue devolviendo `ERROR_DEPRECATED`; no se rehabilitó ni eliminó esa respuesta de compatibilidad.

## Validación

- Base anterior: 26 pruebas aprobadas y build correcto.
- Después de la limpieza: `npm test`, 30 pruebas aprobadas, incluidas altas, restauración tras fallos, usuarios existentes, comisiones por fecha, programador, descargables, navegación y catálogo vacío.
- `npm run build`: compilación y verificación de 14 páginas y 32 recursos locales. Se comprueba también que el calendario publicado conserva su contenido.
- `npm test` reemplaza el script anterior que siempre devolvía error.
- `npm run verify:build` permite repetir la comprobación del empaquetado; también se ejecuta al terminar el build.
- El análisis de referencias no encontró funciones privadas de Apps Script sin referencias en las fuentes activas después de esta limpieza. Esa comprobación es estática; no sustituye una prueba funcional completa ni permite inferir dependencias externas desconocidas.

No se promete haber agotado toda la deuda técnica. El código sin consumidores se retiró; las duplicaciones que siguen atendiendo rutas o compatibilidades se documentaron para migrarlas con validación específica.

## Promoción del 6 de noviembre de 2026

- Fusión de `feature/locales-usuarios-migracion` con `main`, resolviendo las diferencias de historial con las fuentes auditadas.
- Regeneración del frontend y conservación de los recursos publicados previamente para sesiones y enlaces existentes.
- Validación sobre el resultado combinado: 30 pruebas aprobadas y build de 14 páginas y 32 recursos verificado.
- Backend de staging actualizado a `@80`; versión, listado de personal y rechazo de solicitudes sin sesión comprobados.
- Backend productivo actualizado a `@76`, manteniendo el deployment y la URL existentes.
