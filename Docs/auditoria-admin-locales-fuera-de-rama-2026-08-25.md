# Auditoria de AdminLocales fuera de rama - 2026-08-25

## Resumen

Durante la investigacion del fallo de `usuariosPermisos.html?env=prod`, se confirmo que el problema no era solo un deploy desalineado de produccion.

La rama activa `feature/locales-usuarios-migracion` contenia referencias a funciones del catalogo de locales que no existian en el arbol versionado actual:

- `listarLocalesCatalogo_`
- `mapLocalRecordToOption_`
- `ensureLocalesCatalogReady_`
- `obtenerLocalesPorSesion`

## Evidencia

- `AppsScript/AuthRoles.js` invocaba `listarLocalesCatalogo_({ onlyActive: false })`
- `AppsScript/RegistroAsistencias.js` ya exponia rutas que dependian de la administracion de locales:
  - `BootstrapAdministracionLocales`
  - `GuardarLocalAdmin`
  - `DesactivarLocalAdmin`
  - `LocalesPorSesion`
- el archivo que definia ese bloque no estaba presente en la rama ni en `main`

La implementacion se encontro en un objeto de stash local:

- `stash@{0}`: `pre-merge-feature-locales-usuarios-migracion-2026-08-13`
- blob recuperado: `626f87044934876f835ffe06538425f62be7fcea:AppsScript/AdminLocales.js`

## Conclusion

El modulo de usuarios/locales quedo publicado desde un corte incompleto:

- frontend y backend ya referenciaban la administracion de locales
- pero `AppsScript/AdminLocales.js` nunca se integro al arbol trackeado de la rama
- por eso el backend productivo fue resolviendo `ReferenceError` encadenados al intentar cargar `BootstrapGestionUsuarios`

## Accion correctiva

El archivo `AppsScript/AdminLocales.js` se reincorpora a la rama desde el stash auditado y se vuelve a publicar el backend productivo sobre el deployment fijo existente.

## Riesgo evitado

Sin esta reincorporacion, seguir parchando funciones aisladas en `AuthRoles.js` habria dejado el sistema operativo solo por casualidad y no por integracion real del modulo.
