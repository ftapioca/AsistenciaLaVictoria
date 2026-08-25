# Hotfix usuarios y permisos en produccion - 2026-08-25

Deployment Apps Script productivo afectado: `AKfycbyqIaw4SLUy1pYl7iAv1QPrgWvHNE51H4dVk-R0qRZ8DppTZNAWRhN0W8bdmG3W23rq`

## Incidencia

En produccion, un administrador autenticado no podia abrir `usuariosPermisos.html?env=prod`.

La sesion validaba correctamente como:

- `role: "Administrador"`
- `status: "SUCCESS"` en `ValidarSesion`

Pero el bootstrap del modulo respondia:

```json
{"status":"ERROR","mensaje":"isReservedPseudoLocal_ is not defined"}
```

## Diagnostico

El error estaba acotado al flujo `BootstrapGestionUsuarios`.

Pruebas manuales realizadas en consola de produccion:

- `window.APP_CONFIG.ENVIRONMENT === "prod"`
- `window.LVAuth.validateSession()` responde `Administrador`
- `window.LVAuth.apiGet({ accion: "BootstrapGestionUsuarios" })` falla con `isReservedPseudoLocal_ is not defined`
- `window.LVAuth.apiGet({ accion: "BootstrapAdministracionHorarios" })` responde `SUCCESS`

Conclusion: no era un problema de autenticacion ni de permisos del usuario; era un `ReferenceError` en backend dentro del modulo de usuarios y permisos.

## Causa raiz

En `AppsScript/AuthRoles.js`, `listResolvedLocalScope_(...)` invocaba `isReservedPseudoLocal_(...)`, pero la funcion no estaba definida en la base de codigo productiva.

## Correccion aplicada

Se agrego la funcion faltante:

```js
function isReservedPseudoLocal_(localValue) {
  return isUnrestrictedLocalValue_(localValue);
}
```

Esto mantiene la semantica existente para locales globales como `Todos` / `Todas` y elimina el fallo de referencia al cargar el modulo.

## Verificacion esperada despues del deploy

- `await window.LVAuth.apiGet({ accion: "BootstrapGestionUsuarios" })` responde `SUCCESS`
- `usuariosPermisos.html?env=prod` carga usuarios, roles y matriz de permisos
- `BootstrapAdministracionHorarios` sigue respondiendo `SUCCESS`

## Notas de despliegue

- No requiere cambio de frontend ni de `app-config.prod.js`
- Debe publicarse solo backend Apps Script sobre el deployment fijo de produccion
