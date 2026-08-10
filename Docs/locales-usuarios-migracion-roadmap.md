# Roadmap de Migracion: Locales y Usuarios

## Objetivo

Este documento define el plan operativo para evolucionar el sistema de La Victoria incorporando:

- un mantenedor formal de `Locales`
- un mantenedor formal de `Usuarios`
- asignacion estructurada de usuarios a uno o varios locales
- eliminacion progresiva de hardcodes y dependencias legacy
- migracion segura usando `staging` antes de promover a `produccion`

La ejecucion completa se realizara en la rama:

- `feature/locales-usuarios-migracion`

La fecha base de este roadmap es:

- `2026-07-21`

## Principios de ejecucion

- Ningun cambio se activa directamente en produccion.
- Cada fase debe quedar validada en `staging` antes de avanzar.
- Se privilegia compatibilidad hacia atras mientras existan consumidores legacy.
- No se eliminan compatibilidades hasta que la fase posterior este validada.
- Toda decision estructural debe quedar documentada en este archivo a medida que avance la implementacion.

## Estado actual resumido

### Locales

Hoy no existe hoja maestra `Locales`.

Los locales viven repartidos entre:

- `HorarioLocales`
- `HorarioEspecialLocales`
- `Usuarios.local`
- hoja legacy `Colaboradores`
- frontend con arrays hardcodeados
- HTML descargables por local

### Usuarios

Hoy el sistema ya usa autenticacion moderna con:

- `Usuarios`
- `RolesPermisos`
- `Sesiones`

Pero la operacion sigue partida:

- autenticacion y permisos: `Usuarios` + `RolesPermisos`
- programacion y asistencia por local: hoja legacy `Colaboradores`
- asignacion local: campo texto `Usuarios.local`
- gestion administrativa: solo edicion parcial de usuarios y roles

## Modelo objetivo

### Hoja `Locales`

Fuente oficial de verdad para todos los locales operativos y administrativos.

Columnas propuestas:

- `id_local`
- `codigo`
- `nombre`
- `estado`
- `permite_programacion`
- `permite_asistencia`
- `usa_horario_base`
- `local_origen_copia_horario`
- `fecha_creacion`
- `fecha_desactivacion`
- `observaciones`

### Hoja `Usuarios`

Se mantiene como entidad principal de identidad y acceso.

Columnas objetivo:

- `id_usuario`
- `nombre_completo`
- `usuario_login`
- `pin`
- `rol`
- `cargo`
- `activo`
- `estado_usuario`
- `email`
- `telefono`
- `fecha_creacion`
- `observaciones`
- `local`

Nota:

- `local` se mantiene solo como compatibilidad temporal mientras exista lectura legacy.

### Hoja `UsuariosLocales`

Relacion formal entre usuario y local.

Columnas propuestas:

- `id_usuario_local`
- `id_usuario`
- `id_local`
- `tipo_asignacion`
- `activo`
- `fecha_desde`
- `fecha_hasta`
- `observaciones`

## Validaciones de negocio objetivo

- `id_local` unico.
- `codigo` de local unico.
- no permitir asignar usuarios a locales inactivos.
- no permitir supervisor o colaborador activos sin local asignado.
- no permitir combinacion activa duplicada `id_usuario + id_local`.
- no permitir baja fisica de local con historial operativo.
- no permitir baja fisica de usuario con historial operativo.
- no permitir crear local operativo sin horario base inicial o decision explicita de dejarlo inactivo.

## Estrategia general

El orden de implementacion sera:

1. introducir maestro `Locales`
2. refactorizar consumidores de catalogo de locales
3. completar mantenedor `Usuarios`
4. normalizar asignaciones `UsuariosLocales`
5. retirar compatibilidades legacy

## Fase 1: Maestro de Locales

### Objetivo

Crear la fuente oficial de locales sin romper el comportamiento actual.

### Cambios de backend

- crear hoja `Locales`
- crear helpers de lectura/escritura para `Locales`
- crear bootstrap administrativo para mantenedor de locales
- crear endpoints admin para:
  - listar locales
  - crear local
  - editar local
  - desactivar local
- mantener por ahora intactos los consumidores legacy

### Cambios de frontend

- agregar nueva vista o nueva seccion administrativa `Locales`
- permitir alta, edicion y desactivacion
- exponer flags operativos y estado

### Cambios en Google Sheets

- crear hoja `Locales`
- poblar datos iniciales usando union de:
  - `HorarioLocales`
  - `HorarioEspecialLocales`
  - `Usuarios.local`
  - `Colaboradores.local`
  - hardcodes actuales

### Compatibilidad temporal

- ningun modulo operativo depende todavia de `Locales`
- `Locales` se introduce primero como catalogo maestro y referencia

### Pruebas en staging

- alta de local nuevo
- edicion de local existente
- desactivacion de local sin borrado fisico
- validacion de duplicados por nombre y codigo
- consistencia del catalogo contra las fuentes actuales

### Riesgos

- duplicacion de locales con diferencias de nombre
- definicion incompleta de metadatos iniciales

### Criterio de salida

- todos los locales operativos actuales existen en `Locales`
- el catalogo puede administrarse desde el sistema
- no hay impacto funcional en produccion ni staging fuera del modulo nuevo

### Checklist de cierre

- [x] hoja `Locales` creada
- [x] endpoints admin de `Locales` disponibles
- [x] UI de mantenedor de `Locales` operativa
- [ ] catalogo inicial migrado
- [ ] validacion manual en staging completada

### Estado contrastado al `2026-07-23`

- la base tecnica de Fase 1 esta implementada en repo y publicada previamente en `staging`
- el seed inicial ya no depende de que la hoja `Locales` este completamente vacia
- desde hoy el bootstrap ejecuta tambien backfill idempotente de locales faltantes detectados en fuentes legacy
- mientras siga la convivencia por nombre visible, no se permite renombrar locales existentes desde el mantenedor
- sigue pendiente validar en `staging` que el catalogo real del entorno coincida con:
  - `HorarioLocales`
  - `HorarioEspecialLocales`
  - `Usuarios.local`
  - `Colaboradores.local`

### Subfase controlada: Normalizacion segura de IDs legados

Esta subfase no forma parte del cierre minimo de Fase 1. Se ejecuta solo cuando exista confirmacion de que ningun consumidor operativo depende todavia del valor historico de `id_local`.

Objetivo:

- separar definitivamente `id_local` de cualquier semantica de nombre visible
- mantener `nombre` y `codigo` como campos editables
- dejar `id_local` como llave tecnica estable

Alcance recomendado:

1. desde esta fecha (`2026-07-21`), toda alta nueva debe generar `id_local` opaco no derivado del nombre
2. los registros legacy mantienen temporalmente su `id_local` actual
3. antes de reescribir IDs legacy, levantar inventario de consumidores:
   - `Locales`
   - futuros cruces con `UsuariosLocales`
   - horarios
   - programador
   - turnos abiertos
   - pagos
   - ventas
4. agregar, si hace falta, columna auxiliar temporal:
   - `id_local_legacy`
5. ejecutar migracion controlada solo en `staging`
6. validar que toda referencia funcional use el nuevo `id_local`
7. recien entonces promover a produccion

Riesgos que evita esta subfase:

- romper joins cuando otros modulos empiecen a depender de `id_local`
- perder trazabilidad de registros ya creados
- mezclar en una sola fase cambio de modelo y cambio de identificadores

## Fase 2: Refactor de consumidores de locales

### Objetivo

Eliminar hardcodes y reemplazar catalogos derivados por el maestro `Locales`.

### Cambios de backend

- crear endpoints comunes:
  - `LocalesAdmin`
  - `LocalesOperativos`
  - `LocalesPorSesion`
- ajustar bootstrap de modulos para devolver locales desde `Locales`
- cambiar `LocalesPagosMensuales` para usar `Locales` y no `HorarioLocales`

### Cambios de frontend

- `programadorTurnos`: reemplazar arrays hardcodeados
- `turnosAbiertos`: reemplazar arrays hardcodeados
- `horariosLocales`: usar `Locales` como select oficial
- `pagosMensuales`: listar desde backend
- `adminPanel`: mostrar navegacion asociada sin supuestos fijos

### Cambios en Google Sheets

- sin nuevas hojas
- revisar que todo local relevante exista y este activo en `Locales`

### Compatibilidad temporal

- los consumidores siguen usando nombres actuales de local
- aun no se toca `Usuarios.local` ni `Colaboradores`

### Pruebas en staging

- un local nuevo aparece en selects sin modificar frontend manualmente
- supervisor solo ve sus locales permitidos
- admin ve todos los locales activos
- `pagosMensuales` lista locales desde catalogo maestro

### Riesgos

- contratos inconsistentes entre endpoints viejos y nuevos
- pantallas vacias si falta bootstrap de locales

### Criterio de salida

- no quedan arrays productivos hardcodeados para locales en vistas principales
- alta de un nuevo local ya no requiere deploy manual por catalogo

### Checklist de cierre

- [x] `programadorTurnos` consume locales desde backend
- [x] `turnosAbiertos` consume locales desde backend
- [x] `horariosLocales` consume `Locales`
- [x] `pagosMensuales` consume `Locales`
- [x] validacion en staging con local nuevo completada

### Avance local registrado el 2026-07-21

- backend:
  - se agrega endpoint `LocalesPorSesion`
  - `horarios` ya recibe locales desde hoja `Locales`
  - `pagosMensuales` ya lista locales desde hoja `Locales`
- frontend:
  - `programadorTurnos` deja de usar arreglo hardcodeado
  - `turnosAbiertos` deja de usar arreglo hardcodeado
  - `horariosLocales` elimina fallback fijo de locales
- pendiente antes de cerrar fase:
  - prueba funcional en `staging`
  - decidir si `ventasMensuales` entra en este mismo cierre o queda como tramo posterior por ser importador tecnico

### Ajuste de criterio operativo al `2026-07-23`

- Fase 2 queda oficialmente cerrada
- aunque los consumidores principales ya leen desde `Locales`, la compatibilidad sigue siendo por nombre visible
- por lo mismo:
  - no se habilita renombre libre de locales existentes
  - el cierre de Fase 2 exigia validar que un catalogo parcial no deje pantallas vacias
  - `horariosLocales` debe mostrar la union entre catalogo maestro y filas legacy ya existentes
- `ventasMensuales` no se considera bloqueante para cerrar Fase 2 por ahora
- el foco de cierre quedo acotado a:
  - `programadorTurnos`
  - `turnosAbiertos`
  - `horariosLocales`
  - `pagosMensuales`
  - validacion manual en `staging` con alta o backfill de un local

### Cierre funcional registrado el `2026-07-23`

- validacion ejecutada en frontend local usando `?env=staging` contra backend `staging`
- administracion confirma acceso al modulo `Locales`
- `Locales` valida:
  - carga del catalogo actual
  - evidencia de `Seed inicial` o `Backfill legacy`
  - alta de nuevo local
  - bloqueo de renombre para locales ya existentes
- `horariosLocales` valida:
  - carga de locales nuevos y legacy
  - alta de horario base mediante rangos con seleccion multiple de dias
  - persistencia correcta tras guardar
  - CTA `Agregar dias` visible mientras la semana siga incompleta
- `programadorTurnos`, `turnosAbiertos` y `pagosMensuales` validan consumo correcto del catalogo sin hardcodes
- se mantiene como deuda posterior, ya fuera del cierre de Fase 2:
  - modelado multi-local de usuarios
  - consolidacion de supervisores repetidos por local en la vista administrativa
- decision operativa:
  - Fase 2 cerrada
  - Fase 3 habilitada para inicio

## Fase 3: Mantenedor de Usuarios

### Objetivo

Pasar de edicion parcial a mantenedor completo de usuarios.

### Cambios de backend

- extender operaciones admin para:
  - crear usuario
  - editar usuario completo
  - desactivar usuario
  - eliminar usuario solo si aplica por reglas
- mantener integracion con `RolesPermisos`
- validar unicidad de `id_usuario` y `usuario_login`

### Cambios de frontend

- evolucionar `usuariosPermisos` a mantenedor completo
- agregar flujos de:
  - alta
  - edicion
  - desactivacion
  - eliminacion controlada
- separar claramente:
  - datos del usuario
  - rol
  - acceso
  - asignacion de locales

### Cambios en Google Sheets

- posible ampliacion de columnas en `Usuarios`
- documentar campos obligatorios finales

### Compatibilidad temporal

- `Usuarios.local` sigue vigente mientras no exista la fase 4 cerrada

### Pruebas en staging

- crear administrador
- crear supervisor
- crear colaborador
- desactivar usuario y validar bloqueo de sesion
- editar usuario sin cambiar PIN
- editar usuario con cambio de PIN

### Riesgos

- inconsistencias entre usuarios existentes y nuevas reglas de validacion
- usuarios creados sin datos minimos para login

### Definicion de eliminacion controlada

- la eliminacion fisica de una fila en `Usuarios` no sera el camino normal
- el camino normal para salida operativa sigue siendo `desactivar usuario`
- la eliminacion controlada solo aplica a registros creados por error administrativo y todavia no consolidados en la operacion
- un usuario solo podra eliminarse si cumple simultaneamente estas reglas:
  - esta `inactivo`
  - no tiene sesion activa vigente en `Sesiones`
  - no participa en un caso legacy repetido que aun se este consolidando por `usuario_login` o `id_usuario`
  - no requiere preservacion por trazabilidad operativa acordada por administracion
- si alguna de esas condiciones no se cumple:
  - no se elimina
  - se mantiene baja logica
- alcance acordado para Fase 3:
  - la politica queda definida
  - la accion UI puede diferirse si no es necesaria para cerrar operacion
  - Fase 4 no depende de tener eliminacion fisica habilitada

### Criterio de salida

- usuarios ya no necesitan alta manual en Google Sheets
- el mantenedor permite operar el ciclo de vida completo

### Checklist de cierre

- [x] alta de usuarios implementada
- [x] baja logica implementada
- [x] eliminacion controlada definida
- [x] validaciones de unicidad activas
- [x] validacion funcional en staging completada

### Inicio preparado al `2026-07-23`

- estado real de la base actual:
  - backend ya expone `bootstrapGestionUsuarios`
  - backend ya permite `ActualizarUsuarioAdmin`
  - backend ya permite `ActualizarRolUsuarioAdmin`
  - frontend ya tiene listado, filtros, edicion parcial y matriz de permisos por rol
- brechas actuales para considerar Fase 3 iniciada:
  - no existe alta formal de usuarios desde UI ni desde endpoint admin dedicado
  - no existe baja logica controlada desde UI
  - no existe eliminacion controlada
  - no hay validacion robusta de unicidad para `usuario_login` e `id_usuario`
  - la asignacion multi-local sigue fuera de alcance hasta Fase 4

### Corte inicial recomendado de Fase 3

- objetivo del primer tramo:
  - convertir `usuariosPermisos` en mantenedor operativo de ciclo de vida basico
- alcance incluido:
  - crear usuario
  - editar usuario completo
  - desactivar usuario
  - cambio opcional de PIN
  - validaciones de unicidad y campos obligatorios
- alcance excluido en este primer corte:
  - hoja `UsuariosLocales`
  - eliminacion fisica de usuarios si afecta trazabilidad
- reglas de negocio sugeridas para arrancar:
  - todo usuario activo debe tener `nombreCompleto`, `usuarioLogin`, `rol` y `pin`
  - `usuarioLogin` no se puede repetir
  - `id_usuario` no se puede repetir cuando venga informado
  - `Supervisor` y `Colaborador` activos deben tener `local`
  - `Administrador` puede quedar sin `local`
- definition of done del primer corte:
  - un admin puede crear desde UI un `Administrador`, `Supervisor` o `Colaborador`
  - un admin puede editar datos sin forzar cambio de PIN
  - un admin puede desactivar usuario y bloquear su acceso
  - la hoja `Usuarios` ya no requiere alta manual para casos nuevos

### Cierre funcional registrado al `2026-07-23`

- validacion ejecutada sobre frontend local con `?env=staging` contra backend `staging`
- `usuariosPermisos` valida:
  - lista unica de usuarios sin duplicacion visual por local
  - filtros por texto, rol y local
  - alta de usuarios desde UI
  - edicion con cambio opcional de PIN
  - desactivacion y reactivacion desde la ficha
  - asignacion multi-local para supervisores
  - asignacion multi-local para colaboradores
  - feedback visual de guardado con blur y mensaje de carga
- se publica backend `staging` para destrabar:
  - limpieza de validacion de datos en `Usuarios.local`
  - soporte de consolidacion sobre usuarios legacy repetidos
- caso validado explicitamente:
  - `Candy Carmona` recibe un tercer local y la persistencia queda correcta
- decision operativa:
  - este tramo de Fase 3 queda validado
  - la eliminacion controlada queda definida como politica conservadora
  - la normalizacion estructurada `UsuariosLocales` permanece en Fase 4

## Fase 4: Normalizacion de asignaciones Usuario-Local

### Objetivo

Reemplazar `Usuarios.local` como campo texto por una relacion estructurada `UsuariosLocales`.

### Inicio preparado al `2026-07-23`

- Fase 3 deja dos hechos ya consolidados:
  - el mantenedor de usuarios ya opera multi-local desde UI
  - la persistencia actual todavia cae en `Usuarios.local` como texto libre
- por lo mismo, Fase 4 ya no busca habilitar la experiencia multi-local
- el objetivo real de Fase 4 es estructurar el dato para que sesion y consumidores operativos dejen de depender de texto libre
- decision de arranque:
  - mantener `usuariosPermisos` como punto de edicion
  - mover la fuente de verdad de asignaciones hacia `UsuariosLocales`
  - dejar `Usuarios.local` como espejo temporal y fallback controlado

### Corte backend implementado localmente al `2026-07-23`

- implementado en `AppsScript/AuthRoles.js`:
  - creacion perezosa de hoja `UsuariosLocales`
  - backfill inicial desde `Usuarios.local`
  - sincronizacion estructurada al crear, editar, cambiar rol o activar/desactivar usuarios
  - login y refresco de sesion leyendo primero `UsuariosLocales`
- implementado en `AppsScript/programadorTurnos.js`:
  - lectura moderna de colaboradores por local desde asignaciones estructuradas
  - fallback a `Usuarios.local` y a hoja legacy `Colaboradores` mientras siga existiendo
- compatibilidad mantenida:
  - `Usuarios.local` sigue escribiendose como espejo
  - `Administrador` conserva alcance global sin expandirse por local

### Corte inicial recomendado

- primer tramo a implementar:
  - crear hoja `UsuariosLocales`
  - definir esquema minimo de asignacion
  - ejecutar migracion inicial desde `Usuarios.local`
  - hacer que la sesion lea primero `UsuariosLocales`
  - conservar fallback a `Usuarios.local`
- consumidores a incluir en este primer tramo:
  - construccion de sesion en `AuthRoles`
  - `LocalesPorSesion`
  - `programadorTurnos`
  - `turnosAbiertos`
- consumidores que pueden quedar para un tramo siguiente de la misma fase:
  - `ColaboradoresPorLocal`
  - cruces legacy con hoja `Colaboradores`
  - espejos o sincronizacion inversa hacia `Usuarios.local`

### Esquema propuesto para `UsuariosLocales`

- columnas minimas:
  - `id_asignacion`
  - `id_usuario`
  - `usuario_login`
  - `rol`
  - `id_local`
  - `local_nombre`
  - `activo`
  - `fecha_creacion`
  - `observaciones`
- criterio operativo:
  - una fila por relacion `usuario-local`
  - `Administrador` no necesita una fila por cada local si se mantiene como alcance global
  - `Supervisor` y `Colaborador` se resuelven desde sus filas activas en `UsuariosLocales`

### Reglas de migracion inicial

- tomar cada fila activa de `Usuarios`
- si `rol = Administrador`:
  - no expandir por local
  - marcar alcance global desde sesion, no desde filas por local
- si `rol = Supervisor` o `Colaborador`:
  - partir `Usuarios.local` por separadores existentes
  - generar una fila activa por cada local detectado
- durante la migracion:
  - consolidar filas legacy repetidas por `usuario_login` o `id_usuario`
  - evitar duplicar la misma relacion `usuario-local`
  - registrar observacion cuando la fila legacy venga sin local valido

### Definition of done del primer corte

- existe hoja `UsuariosLocales` en `staging`
- migracion inicial completada sin duplicar relaciones
- login y refresco de sesion leen primero `UsuariosLocales`
- `programadorTurnos` y `turnosAbiertos` respetan las asignaciones estructuradas
- fallback a `Usuarios.local` sigue activo y validado para casos no migrados

### Cambios de backend

- crear hoja `UsuariosLocales`
- crear helpers de lectura/escritura
- migrar la construccion de sesion para leer primero `UsuariosLocales`
- mantener fallback a `Usuarios.local`
- reemplazar progresivamente lecturas de hoja `Colaboradores`
- adaptar:
  - permisos por local
  - colaboradores por local
  - programador
  - asistencia administrativa

### Cambios de frontend

- selector multiple de locales por usuario
- visualizacion clara de locales asignados
- capacidad de agregar y quitar asignaciones

### Cambios en Google Sheets

- crear `UsuariosLocales`
- poblar desde `Usuarios.local`
- dejar `Usuarios.local` como campo espejo o legado temporal

### Compatibilidad temporal

- lectura dual:
  - primero `UsuariosLocales`
  - fallback a `Usuarios.local`

### Pruebas en staging

- usuario con un local
- usuario con varios locales
- usuario sin local no debe operar
- supervisor con varios locales solo ve los asignados
- colaborador multi-local aparece en vistas que correspondan

### Riesgos

- usuarios sin asignacion efectiva tras migracion inicial
- divergencia entre `Usuarios.local` y `UsuariosLocales`

### Criterio de salida

- la sesion se resuelve desde asignaciones estructuradas
- modulos operativos criticos ya no dependen del campo libre `local`

### Checklist de cierre

- [ ] hoja `UsuariosLocales` creada
- [ ] migracion inicial ejecutada en staging
- [ ] sesiones leyendo `UsuariosLocales`
- [ ] fallback a `Usuarios.local` validado
- [ ] programador y asistencia adaptados

## Fase 5: Cleanup y retiro de compatibilidades

### Objetivo

Cerrar la deuda tecnica y dejar un modelo unico y mantenible.

### Cambios de backend

- retirar fallback a `Usuarios.local`
- retirar lecturas productivas de `Colaboradores` donde ya no correspondan
- unificar endpoints para que usen:
  - `Locales`
  - `Usuarios`
  - `UsuariosLocales`
- redefinir documentacion operativa final

### Cambios de frontend

- eliminar supuestos legacy
- limpiar placeholders y textos antiguos
- dejar solo flujos compatibles con el modelo final

### Cambios en Google Sheets

- decidir si `Usuarios.local` queda como columna de respaldo o se vacia
- congelar o retirar hojas legacy segun impacto real

### Compatibilidad temporal

- no aplica; esta fase cierra el periodo de convivencia

### Pruebas en staging

- smoke test completo:
  - login
  - adminPanel
  - administracion
  - usuariosPermisos
  - horariosLocales
  - programadorTurnos
  - turnosAbiertos
  - pagosMensuales
  - ventasMensuales
  - registro publico por local

### Riesgos

- consumidor residual no detectado
- drift entre staging y produccion si no se congela el cambio al final

### Criterio de salida

- no quedan dependencias activas a hardcodes ni asignaciones por texto libre
- el modelo final queda documentado y validado

### Checklist de cierre

- [ ] fallback legacy retirado
- [ ] dependencias a `Colaboradores` revisadas
- [ ] smoke test integral aprobado en staging
- [ ] documentacion final actualizada

## Politica de pruebas por fase

Cada fase debe cerrar con:

1. validacion tecnica local
2. despliegue a `staging`
3. prueba funcional manual
4. registro de hallazgos en este documento
5. decision explicita de avanzar

## Politica de promocion a produccion

La promocion a produccion solo se realiza cuando:

- las 5 fases esten cerradas
- staging quede estable
- no existan incidencias abiertas bloqueantes
- se complete smoke test final de extremo a extremo

Secuencia recomendada:

1. congelar cambios en rama
2. ejecutar build final
3. promover backend a produccion
4. actualizar deployment Apps Script de produccion
5. publicar frontend
6. validar flujos criticos en produccion

## Bitacora de avance

### 2026-07-21

- se crea la rama `feature/locales-usuarios-migracion`
- se documenta el roadmap inicial de 5 fases
- se implementa la base tecnica de Fase 1:
  - backend Apps Script para `Locales`
  - bootstrap admin con seed inicial desde fuentes legacy
  - CRUD basico de alta, edicion y desactivacion
  - nueva vista administrativa `Locales`
  - acceso desde `Administracion`
- se publica backend en `staging`
  - `clasp push` ejecutado sobre `.clasp.staging.json`
  - version creada: `61`
  - deployment activo de staging actualizado el `2026-07-21`
- pendiente de esta fase:
  - validacion funcional local
  - validacion funcional conectada a `staging`
  - verificacion de seed inicial real sobre datos del entorno

### 2026-07-23

- se contrasta el roadmap con la implementacion efectiva de la rama
- se confirma que la rama ya entro parcialmente en Fase 2
- se identifican tres riesgos de convivencia:
  - renombre de local rompe permisos porque la sesion aun resuelve alcance por nombre
  - catalogos parciales en `Locales` pueden ocultar configuracion legacy en `horariosLocales`
  - seed inicial dependia de hoja vacia y no hacia backfill
- se endurece la implementacion para seguir con Fase 2:
  - `Locales` ahora hace backfill idempotente desde fuentes legacy
  - el mantenedor bloquea renombre de locales existentes mientras siga la convivencia por nombre
  - `horariosLocales` renderiza la union entre catalogo maestro y filas legacy existentes
- se publica backend actualizado en `staging`
  - `clasp push` ejecutado sobre `.clasp.staging.json`
  - version creada: `70`
  - deployment activo de staging actualizado el `2026-07-23`
  - verificacion publica: `accion=Version` responde desde la URL de `staging`
- se regeneran artefactos de frontend para publicacion desde `dist/` hacia el root publicado
- se completa la validacion funcional local con `?env=staging`
  - `Locales`, `horariosLocales`, `programadorTurnos`, `turnosAbiertos` y `pagosMensuales` quedan validados
  - se corrige el flujo de horarios base para crear rangos y asignar varios dias por operacion
  - se ajusta el CTA `Agregar dias` para locales con semana incompleta
  - se corrige el envio `POST` del frontend local para evitar `Failed to fetch` por preflight/CORS
- cierre operativo del dia:
  - Fase 2 cerrada
  - Fase 3 documentada y lista para iniciar sobre mantenedor de usuarios
- se inicia implementacion de Fase 3 sobre `Usuarios`
  - backend agrega `CrearUsuarioAdmin`
  - backend agrega `CambiarEstadoUsuarioAdmin`
  - `ActualizarUsuarioAdmin` suma validaciones de unicidad para `usuario_login` e `id_usuario`
  - `usuariosPermisos` agrega CTA `Nuevo usuario`
  - el modal unifica alta, edicion y desactivacion/reactivacion
  - el alta exige PIN inicial y permite informar `id_usuario` solo al crear
- se corrige la transicion a multi-local en Fase 3:
  - `usuariosPermisos` deja de agrupar por local y pasa a lista unica por usuario
  - se agregan filtros por texto, rol y local dentro de la misma seccion
  - supervisores y colaboradores pueden recibir multiples locales desde el modal
  - el modal incorpora blur y mensaje de carga durante guardado
- se publican iteraciones sucesivas del backend `staging`
  - version `72`: soporte multi-local y limpieza de validacion de `Usuarios.local`
  - version `73`: tolerancia a duplicados legacy de `usuario_login` e `id_usuario` al editar
  - version `74`: consolidacion visual de usuarios legacy repetidos y cierre correcto del modal tras guardar
  - deployment fijo de `staging` actualizado finalmente a `@74`
- se completa la validacion funcional de este tramo en `staging`
  - el caso `Candy Carmona` permite asignar y persistir un tercer local
  - el guardado muestra blur, mensaje de carga, cierre de modal y toast de exito
  - la lista consolidada evita repetir visualmente al mismo usuario por local
- se inicia el backend de Fase 4 manteniendo compatibilidad
  - se agrega hoja logica `UsuariosLocales` con creacion perezosa
  - se implementa backfill inicial desde `Usuarios.local`
  - login, refresh de sesion y asignaciones por local leen primero la relacion estructurada
  - `Usuarios.local` se mantiene como espejo temporal para no romper modulos legacy
- se publica este corte de Fase 4 en `staging`
  - `clasp push` ejecutado sobre `.clasp.staging.json`
  - version creada: `75`
  - deployment fijo de `staging` actualizado a `@75`

### 2026-08-10

- se audita la operacion real de asistencia en produccion sobre el deployment fijo de Apps Script
- se confirma que la base productiva ya esta alineada con `Usuarios` + `UsuariosLocales` para los locales:
  - `Paseo del Lago`
  - `Segunda Faja`
- se valida el usuario `Pruebas / 3164` en produccion y se detectan dos incidencias publicas:
  - timeout en `UltimoRegistro` y parte del flujo publico de asistencia
  - listas de personal por local con nombres repetidos en los HTML descargables
- se aplica hotfix de performance en backend:
  - la resolucion de locales asignados deja de recalcular `UsuariosLocales` por cada usuario dentro del mismo request
  - se agrega indice en memoria por principal para asistencia publica
- se valida nuevamente en produccion:
  - `UltimoRegistro` responde
  - `Ingreso` y `Salida` publicos vuelven a responder `SUCCESS`
- se corrige la lista publica por local:
  - deduplicacion por nombre en `listarUsuariosAsistenciaPorLocal_(local)`
  - normalizacion adicional de espacios y caracteres invisibles
- se corrige experiencia de carga en `descargablesLocales`:
  - cache corto de backend por local con `CacheService` durante 180 segundos
  - cache local en cada HTML descargable usando `localStorage`
- publicaciones productivas realizadas sobre el deployment fijo:
  - `@55` `Hotfix timeout UltimoRegistro produccion`
  - `@56` `Dedup lista publica descargables por local`
  - `@57` `Normaliza nombres descargables por local`
  - `@58` `Mejora latencia lista descargables`
- documento detallado asociado:
  - [Docs/asistencia-descargables-produccion-2026-08-10.md](/Users/ftapioca/Projects/AsistenciaLaVictoria/Docs/asistencia-descargables-produccion-2026-08-10.md:1)
