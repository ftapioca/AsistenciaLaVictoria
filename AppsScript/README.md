# Apps Script

Esta carpeta se usa para mantener una copia local del proyecto de Google Apps Script.

## Archivos actuales

- `appsscript.json`: manifiesto del proyecto Apps Script.
- `SpreadsheetStore.js`: helper central para abrir spreadsheets por ID y resolver hojas por dominio.
- `VentasComisiones.js`: estructura de hojas base y helpers iniciales del módulo de ventas/comisiones.
- `AuthRoles.js`: autenticación, sesiones y control de roles.
- `RegistroAsistencias.js`: router principal `doGet` y `doPost`, registro de asistencia y consultas base.
- `CierreTurnos.js`: lógica de turnos abiertos y cierre de turnos.
- `programadorTurnos.js`: programación semanal y helpers asociados.
- `versionesSistema.js`: versión del sistema.

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
- `TestVentasSheet`

### Protegidas para colaboradores

- `TurnosSemanaColaborador`

## Turnos abiertos

La lógica base vive en `CierreTurnos.js`.

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
- crear `.clasp.prod.json` y `.clasp.staging.json` a partir de las plantillas versionadas
- `npm run gas:staging:pull` o `npm run gas:prod:pull` para bajar el proyecto remoto
- `npm run gas:staging:push` o `npm run gas:prod:push` para subir cambios desde este repo

No se deben versionar:

- `.clasp.json`
- `.clasp.prod.json`
- `.clasp.staging.json`
- `.clasprc.json`

## Estrategia de entornos

Para evitar tocar producción al probar ramas, el proyecto debe usar dos Apps Script separados:

- `staging`: pruebas de ramas y cambios en curso
- `prod`: código publicado que usa el sistema en producción

Cada proyecto Apps Script debe tener sus propios:

- `Script ID`
- deployments web app
- `Script Properties`
- spreadsheets asociados

### Archivos de configuración local

- `.clasp.prod.json`
- `.clasp.staging.json`

Ambos usan `rootDir: "AppsScript"` y cambian solo el `scriptId`.

### Flujo recomendado

Para ramas:

1. trabajar en `feature/...`
2. `npm run gas:staging:push`
3. `npm run gas:staging:version -- "descripcion"`
4. `npm run gas:staging:deploy -- -V <version> -d "descripcion"`
5. probar sobre la web app de staging

Para producción:

1. merge a `main`
2. `npm run gas:prod:push`
3. `npm run gas:prod:version -- "descripcion"`
4. `npm run gas:prod:deploy -- -V <version> -d "descripcion"` o actualizar el deployment activo con `npm run gas:prod:update-deploy -- -i <deploymentId> -V <version> -d "descripcion"`
5. validar la web app productiva

### Comandos útiles

- `npm run gas:staging:deployments`
- `npm run gas:prod:deployments`

Estos listan `deploymentId`, versiones y descripciones, necesarios para actualizar deployments existentes.

### Sintaxis práctica

Crear versión:

- `npm run gas:staging:version -- "staging: cambios en importador"`
- `npm run gas:prod:version -- "prod: release ventas v1"`

Crear deployment versionado:

- `npm run gas:staging:deploy -- -V 1 -d "staging baseline"`
- `npm run gas:prod:deploy -- -V 7 -d "release produccion"`

Actualizar deployment existente:

- `npm run gas:staging:update-deploy -- -i <deploymentId> -V <version> -d "staging actualizado"`
- `npm run gas:prod:update-deploy -- -i <deploymentId> -V <version> -d "release actualizada"`

## Configuración de Script Properties

El proyecto debe configurarse con IDs explícitos de Google Sheets. Ya no debe depender de `getActiveSpreadsheet()`.

Propiedades requeridas:

- `LV_SPREADSHEET_RRHH_ID`
- `LV_SPREADSHEET_VENTAS_ID`

Actualmente:

- asistencia, autenticación, turnos y cierre leen/escriben sobre `LV_SPREADSHEET_RRHH_ID`
- ventas y comisiones deben leer/escribir sobre `LV_SPREADSHEET_VENTAS_ID`

## Estructura base de ventas

El endpoint admin `TestVentasSheet` crea o valida las hojas base del spreadsheet de ventas:

- `ImportacionesVentas`
- `VentasPOS`
- `PropinasPOS`
- `VentasDiarias`
- `ComisionesDiarias`
- `ResumenMensualComisiones`
- `PagosPOS`
- `ProductosPOS`
- `CuadraturaPagos`
- `KPIVentasDiarias`
