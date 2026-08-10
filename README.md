# AsistenciaLaVictoria

Registro de asistencia y turnos para La Victoria.

## 🚀 Quick Start

- `index.html`: selector de ingreso por PIN con detección automática de rol.
- `adminPanel.html`: panel administrativo protegido con accesos internos y caja de archivos adjuntos.
- `TurnosAbiertos.html`: dashboard administrativo protegido para revisar turnos abiertos por local.
- `programadorTurnos.html`: programador semanal protegido para administradores.
- `misTurnos.html`: vista semanal de solo lectura para colaboradores.
- `descargablesLocales/`: archivos adjuntos descargables para administradores y HTML de registro por local.
- `app-config.js`: configuración compartida del `WEB_APP_URL` y clave de sesión.
- `auth.js`: autenticación, validación de sesión y control de acceso en frontend.
- `AppsScript/`: copia local del proyecto real de Google Apps Script usada como referencia operativa y documentación viva.

### Desarrollo
```bash
npm install
npm run dev
```
Se abrirá en `http://localhost:3000`

### Build para Producción
```bash
npm run build
```
Los archivos compilados estarán en `dist/`

Artefactos principales:
- `dist/design-system.html`
- `dist/adminPanel.html`

---

## 🎨 Design System

Este proyecto utiliza un **Design System centralizado** basado en **Tailwind CSS**.

### Características Principales
- ✅ **Design Tokens**: Colores, tipografías, espaciados, sombras definidos centralmente
- ✅ **Tailwind CSS**: Framework de utilidades para construcción rápida y consistente
- ✅ **Componentes Reutilizables**: Librería de componentes JS agnósticos
- ✅ **Escalable**: Estructura preparada para crecer sin complejidad

### Documentación
- 📚 [**Design System Completo**](Docs/DESIGN_SYSTEM.md) - Guía definitiva
- 📂 [**Estructura de Carpetas**](src/README.md) - Cómo organizar el código
- 🎯 [**Página de Demostración**](src/designSystem.html) - Ejemplos visuales

### Tech Stack
- **Tailwind CSS**: Framework de utilidades para estilos
- **Vite**: Build tool rápido y moderno
- **PostCSS**: Procesamiento de CSS
- **Node.js**: Runtime

---

## 📁 Estructura actual

### Frontend Principal
- `index.html`: Selector de ingreso por PIN con detección automática de rol.
- `adminPanel.html`: Panel administrativo protegido con accesos internos y caja de archivos adjuntos.
- `usuariosPermisos.html`: Gestión administrativa de usuarios, roles y permisos desde Google Sheets.
- `ventasMensuales.html`: Importador técnico de ventas para probar `ImportarVentas` con JSON normalizado.
- `TurnosAbiertos.html`: Dashboard administrativo protegido para revisar turnos abiertos por local.
- `programadorTurnos.html`: Programador semanal protegido para administradores y supervisores según local.
- `misTurnos.html`: Vista mensual de solo lectura para colaboradores y supervisores.

### Assets y Configuración
- `descargablesLocales/`: Archivos adjuntos descargables para administradores y HTML de registro por local.
- `app-config.prod.js`: Preset frontend de producción.
- `app-config.staging.js`: Preset frontend de staging.
- `app-config.js`: Selector de entorno frontend y configuración activa (`WEB_APP_URL`, sesión, entorno).
- `auth.js`: Autenticación, validación de sesión y control de acceso en frontend.

### Design System (Nuevo)
- `src/`: Carpeta principal del Design System y componentes
  - `styles/`: CSS global con Tailwind
  - `components/`: Componentes reutilizables
  - `utils/`: Funciones auxiliares
  - `scripts/`: Scripts principales
- `src/adminPanel.html`: Piloto migrado del panel administrativo
- `tailwind.config.js`: Configuración de Tailwind con Design Tokens
- `postcss.config.js`: Configuración de PostCSS
- `vite.config.js`: Configuración de Vite
- `Docs/DESIGN_SYSTEM.md`: Documentación completa del sistema
- `Docs/ventas-comisiones-roadmap.md`: Estado funcional y siguientes pasos del módulo de ventas, comisiones y propinas

### Backend
- `AppsScript/`: Copia local del proyecto real de Google Apps Script (referencia y documentación)
  - `AuthRoles.js`: Autenticación y validación de roles
  - `RegistroAsistencias.js`: Lógica de registro de asistencias
  - `CierreTurnos.js`: Cierre de turnos
  - `VentasComisiones.js`: Cálculo de ventas y comisiones
  - `SpreadsheetStore.js`: Interfaz de almacenamiento en Google Sheets
  - `programadorTurnos.js`: Programación semanal y helpers asociados
  - `versionesSistema.js`: Versión del sistema
  - `appsscript.json`: Manifest del proyecto Apps Script usado por `clasp`

### Ventas y Comisiones
- La base operativa del módulo ya está presente en `main`.
- El roadmap técnico consolidado está en `Docs/ventas-comisiones-roadmap.md`.
- Estado documental actual:
  - `ImportarVentas`, `ConsultarImportacionesVentas`, `ConsultarImportacionActivaVentas` y `RecalcularComisiones` ya existen en `main`.
  - El parser POS V1 ya está bastante formalizado en frontend; no es el mayor vacío actual.
  - El siguiente tramo recomendado es auditar operativamente `RecalcularComisiones` en `staging` con datos reales para confirmar el cálculo de comisiones sobre ventas diarias.

---

## 🎯 Admin Panel

`adminPanel.html` concentra la navegación administrativa.

- La información de sesión y las acciones de cerrar sesión y volver al ingreso están integradas en el `hero`.
- La caja `Archivos adjuntos` lista recursos administrativos solo para administradores.
- Los módulos principales se renderizan como tabla operativa con CTA homogéneos según el design system.
- La carga inicial ahora usa `skeleton loading` + `blur` + contexto textual antes de mostrar la UI real.
- Actualmente incluye:
  - Un enlace externo a `Reporte y registro de asistencia` en Google Sheets
  - Archivos HTML descargables contenidos en `descargablesLocales/`

Nota: este proyecto es estático, por lo que el navegador no puede enumerar carpetas automáticamente. La lista de adjuntos del panel se mantiene en el arreglo `attachedResources` dentro de `adminPanel.html`.

## Patrón de carga protegida

Las vistas protegidas del frontend siguen ahora el mismo flujo:

1. renderizar un `skeleton` específico de página
2. superponer `LoadingOverlay` con contexto de carga
3. validar sesión y permisos con `protectPage(...)`
4. reemplazar el skeleton por la UI real solo cuando la sesión queda aprobada

Componentes base:

- `src/components/PageSkeletons.js`: variantes reutilizables de skeleton para panel, tabla, calendario, dashboard y workspace
- `src/components/LoadingOverlay.js`: overlay contextual con título y texto auxiliar

Vistas cubiertas actualmente:

- `adminPanel.html`
- `misTurnos.html`
- `TurnosAbiertos.html`
- `programadorTurnos.html`
- `usuariosPermisos.html`
- `ventasMensuales.html`
- `pagosMensuales.html`

## Registro Por Local

Los archivos de `descargablesLocales/Registro Asistencia _ Local ...` permiten:

- registrar ingresos y salidas por PIN
- consultar último registro del colaborador
- mostrar turnos abiertos del local
- cargar en tiempo real la lista de personal habilitado por local

Notas operativas:

- la lista de personal no está hardcodeada en el HTML; se consulta al backend público al abrir el archivo
- los HTML más nuevos guardan la última lista válida en `localStorage` para mostrarla más rápido en aperturas siguientes
- el backend público mantiene un cache corto por local para reducir latencia de la primera carga

La consulta de turnos abiertos en esos HTML usa la acción pública `TurnosAbiertosPublico` para no exigir sesión.

## Integración Con Apps Script

El `WEB_APP_URL` apunta a un proyecto de Google Apps Script que combina:

- autenticación y sesiones
- registro de asistencia
- cierre y consulta de turnos abiertos
- programación semanal

La copia local de referencia está en `AppsScript/`.

La fuente de verdad del backend en este repositorio es `AppsScript/*.js` junto con `AppsScript/appsscript.json`.
Los archivos `*.gs` dejaron de usarse para evitar drift entre el código trackeado y el código que realmente sincroniza `clasp`.

### Checklist de contribución para Apps Script

- Edita backend solo en `AppsScript/*.js`.
- Si cambias manifest o permisos del proyecto, actualiza también `AppsScript/appsscript.json`.
- No agregues archivos `*.gs` nuevos al repositorio.
- Antes de abrir PR o mergear, valida con `npm run gas:staging:push`.
- Si haces `clasp pull`, revisa que no reaparezcan archivos fuera de la estructura `AppsScript/*.js` + `appsscript.json`.

## Acciones Públicas

- `UsuariosPorRol`
- `UltimoRegistro`
- `Ingreso`
- `Salida`
- `Version`
- `TurnosAbiertosPublico`
- consulta de colaboradores por local para registro desde `doGet` sin `accion`

## Acciones Protegidas

Requieren sesión válida y permiso asociado por rol:

- `BootstrapProgramadorTurnos`
- `TurnosAbiertos`
- `ColaboradoresPorLocal`
- `TurnosSemana`
- `GuardarTurno`
- `EliminarTurno`
- `CopiarSemana`
- `CopiarSemanaAnterior`
- `PlantillasTurnos`
- `HorarioLocal`

Requieren sesión válida y rol `Colaborador` o `Supervisor` según corresponda:

- `TurnosSemanaColaborador`

El backend moderno usa `AppsScript/AuthRoles.js` para resolver:

- permisos por rol desde `RolesPermisos`
- usuarios desde `Usuarios`
- alcance por local para `Supervisor`
- validación `fail closed` cuando una sesión no trae locales habilitados

## Programador de turnos

Desde junio de 2026, la carga principal del programador administrativo usa el endpoint agregado `BootstrapProgramadorTurnos`.

Su objetivo es reducir la latencia del arranque y de los cambios de contexto concentrando en una sola request:

- validación de sesión de administrador
- `plantillas` del local activo
- `colaboradores` del local activo
- `turnos` de la semana visible

Esto reemplaza, para la carga principal del frontend, la secuencia serial anterior basada en:

- `PlantillasTurnos`
- `ColaboradoresPorLocal`
- `TurnosSemana`

Estado actual:

- el cambio quedó activo en código
- fue validado en `staging`
- fue promovido a `prod`
- el frontend público ya consume `BootstrapProgramadorTurnos`

Próximo paso documentado:

- extender `BootstrapProgramadorTurnos` para incluir `horariosSemana`, de modo que la apertura de modales no dependa de nuevas consultas a `HorarioLocal`

Referencia de desarrollo:

- [Docs/programador-turnos-roadmap.md](/Users/ftapioca/Projects/AsistenciaLaVictoria/Docs/programador-turnos-roadmap.md:1)

## Paso a producción

Flujo recomendado para promover cambios ya validados en `staging`:

1. validar frontend local con `npm run build`
2. sincronizar backend productivo con `npm run gas:prod:push`
3. revisar deployments productivos con `npm run gas:prod:deployments`
4. actualizar el deployment productivo existente con `npx clasp deploy --project .clasp.prod.json --deploymentId DEPLOYMENT_ID_PROD --description "mensaje"`
5. publicar frontend con `npm run deploy:pages`
6. verificar en producción login, navegación y al menos un flujo crítico del módulo afectado

Regla operativa:

- no crear una nueva URL de Apps Script si el frontend ya depende de un `deploymentId` fijo
- actualizar el deployment productivo existente
- publicar frontend solo después de confirmar que el backend productivo quedó actualizado

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
