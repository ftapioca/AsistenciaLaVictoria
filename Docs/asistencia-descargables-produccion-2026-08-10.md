# Asistencia y Descargables en Produccion

Fecha: 2026-08-10
Rama de trabajo: `feature/locales-usuarios-migracion`
Deployment Apps Script productivo: `AKfycbyqIaw4SLUy1pYl7iAv1QPrgWvHNE51H4dVk-R0qRZ8DppTZNAWRhN0W8bdmG3W23rq`

## Contexto

Durante la validacion operativa de asistencia en produccion aparecieron dos incidencias:

- `UltimoRegistro` y algunas marcas publicas desde los HTML descargables quedaban en timeout.
- la lista de personal por local en `descargablesLocales/Registro Asistencia _ Local ...` mostraba usuarios repetidos.

Adicionalmente, aunque el flujo quedo funcional, la carga inicial de la lista publica seguia siendo lenta para uso diario.

## Cambios backend aplicados

### 1. Hotfix de timeout en asistencia publica

Archivos principales:

- `AppsScript/AuthRoles.js`
- `AppsScript/RegistroAsistencias.js`

Cambios:

- la resolucion de locales asignados por usuario dejo de recalcular y resincronizar `UsuariosLocales` repetidamente dentro del mismo request.
- se agrego indexacion por principal activo para resolver locales una sola vez por request:
  - `buildActiveAssignmentIndexByPrincipal_()`
  - `resolveAssignedLocalsForUserRecord_(record, prebuiltAssignmentIndex)`
- `listModernAttendanceUsers_()` ahora:
  - sincroniza `UsuariosLocales` solo una vez
  - construye un indice en memoria una sola vez
  - reutiliza ese indice para cada usuario evaluado

Impacto:

- desaparecio el timeout general observado en `UltimoRegistro`
- el flujo real de `POST` para `Ingreso` / `Salida` volvio a responder desde produccion

### 2. Correccion de duplicados en lista publica por local

Archivo principal:

- `AppsScript/RegistroAsistencias.js`

Cambios:

- `listarUsuariosAsistenciaPorLocal_(local)` ahora deduplica por nombre antes de responder.
- se endurecio la clave de deduplicacion para tolerar:
  - espacios repetidos
  - espacio no separable (`NBSP`)
  - caracteres invisibles tipo zero-width

Impacto:

- `Paseo del Lago` dejo de repetir `Pruebas`
- `Segunda Faja` dejo de repetir `Matias Velasquez`

### 3. Cache corto en lista publica

Archivo principal:

- `AppsScript/RegistroAsistencias.js`

Cambios:

- `obtenerColaboradoresPorLocal(params)` ahora usa `CacheService.getScriptCache()`
- se cachea la respuesta publica por local durante 180 segundos
- clave usada:
  - `lv:asistencia:public-local:<local_normalizado>`

Impacto:

- la primera carga baja costo de backend
- aperturas consecutivas durante la ventana de cache evitan recomputar la lista completa

## Cambios en descargables HTML

Archivos:

- `descargablesLocales/Registro Asistencia _ Local Paseo del Lago.html`
- `descargablesLocales/Registro Asistencia _ Local Segunda Faja.html`

Cambios:

- la lista del selector ahora usa cache local por navegador con `localStorage`
- funciones agregadas:
  - `getEmployeeCacheKey()`
  - `renderEmployeeOptions(empleados)`
  - `loadCachedEmployees()`
  - `storeCachedEmployees(empleados)`
- comportamiento nuevo:
  - si existe cache local, la lista se muestra de inmediato
  - en paralelo se refresca contra backend
  - si no hay cache local, se muestra estado de carga y luego se reemplaza con la respuesta online

Clave local usada:

- `lv-asistencia-empleados-<local_actual_en_minusculas>`

Impacto:

- segunda apertura del mismo HTML en el mismo navegador se siente practicamente instantanea
- la mejora de `localStorage` requiere usar una copia actualizada del HTML descargable

## Validacion realizada en produccion

### Asistencia

Se valido contra produccion con usuario:

- `Pruebas`
- `PIN 3164`

Resultados:

- `UltimoRegistro` responde nuevamente desde produccion
- `POST Ingreso` en `Paseo del Lago` respondio `SUCCESS`
- `POST Salida` en `Paseo del Lago` respondio `SUCCESS`
- el turno de prueba fue cerrado para no dejar datos abiertos artificiales

### Lista publica por local

Respuesta esperada validada:

- `Paseo del Lago`
  - `Candy Carmona`
  - `Evelyn Riffo`
  - `Ignacio Cardenas`
  - `Mateo Montecinos`
  - `Matias Velasquez`
  - `Maximiliano Marin`
  - `Pruebas`
- `Segunda Faja`
  - `Antonia Silva`
  - `Candy Carmona`
  - `Daniel Gonzalez`
  - `Evelyn Riffo`
  - `Matias Velasquez`
  - `Maximiliano Marin`
  - `Pruebas`
  - `Rocio Toledo`

## Versiones y deployments

Bitacora de despliegue productivo aplicada el 2026-08-10:

- `@55`
  - descripcion: `Hotfix timeout UltimoRegistro produccion`
- `@56`
  - descripcion: `Dedup lista publica descargables por local`
- `@57`
  - descripcion: `Normaliza nombres descargables por local`
- `@58`
  - descripcion: `Mejora latencia lista descargables`

Notas:

- el backend productivo se actualizo siempre sobre el deployment fijo ya consumido por frontend y descargables
- no se genero una URL nueva de Apps Script

## Consideraciones operativas

- los HTML descargables no tienen la lista hardcodeada; consultan online al backend
- un colaborador nuevo debe aparecer sin regenerar HTML si:
  - fue creado correctamente en la base
  - quedo asignado al local correcto
  - paso la ventana de cache de backend de hasta 3 minutos
- para aprovechar la mejora de `localStorage`, conviene redistribuir la copia nueva del HTML descargable
- si se abre un HTML viejo, seguira usando el backend nuevo, pero no tendra la mejora visual de cache local dentro del archivo

## Siguiente trabajo pendiente

- seguir con la consolidacion fisica de `Usuarios` desde modelo "duplicado por local" a modelo "usuario unico con multiples asignaciones"
- exponer el flujo de consolidacion desde UI administrativa de forma segura
- si la latencia inicial de primera carga sigue siendo alta en horas punta, evaluar una hoja indice o materializacion de lista publica por local
