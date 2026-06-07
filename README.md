# AsistenciaLaVictoria

Registro de asistencia y turnos para La Victoria.

## 🚀 Quick Start

- `index.html`: selector de ingreso por PIN con detección automática de rol.
- `adminPanel.html`: panel administrativo protegido con accesos internos y caja de archivos adjuntos.
- `ventasMensuales.html`: importador técnico de ventas para probar `ImportarVentas` con JSON normalizado.
- `TurnosAbiertos.html`: dashboard administrativo protegido para revisar turnos abiertos por local.
- `programadorTurnos.html`: programador semanal protegido para administradores.
- `misTurnos.html`: vista semanal de solo lectura para colaboradores.
- `Assets/`: archivos adjuntos descargables para administradores y HTML de registro por local.
- `app-config.prod.js`: preset frontend de producción.
- `app-config.staging.js`: preset frontend de staging.
- `app-config.js`: selector de entorno frontend y configuración activa (`WEB_APP_URL`, sesión, entorno).
- `auth.js`: autenticación, validación de sesión y control de acceso en frontend.
- `AppsScriptAuth.gs`: base para integrar login, validación de sesión y control de roles en Google Apps Script.
- `AppsScript/`: copia local del proyecto real de Google Apps Script usada como referencia y documentación viva.

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
- `ventasMensuales.html`: Importador técnico de ventas para probar `ImportarVentas` con JSON normalizado.
- `TurnosAbiertos.html`: Dashboard administrativo protegido para revisar turnos abiertos por local.
- `programadorTurnos.html`: Programador semanal protegido para administradores.
- `misTurnos.html`: Vista semanal de solo lectura para colaboradores.

### Assets y Configuración
- `Assets/`: Archivos adjuntos descargables para administradores y HTML de registro por local.
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

### Backend
- `AppsScript/`: Copia local del proyecto real de Google Apps Script (referencia y documentación)
  - `AuthRoles.js`: Autenticación y validación de roles
  - `RegistroAsistencias.js`: Lógica de registro de asistencias
  - `CierreTurnos.js`: Cierre de turnos
  - `VentasComisiones.js`: Cálculo de ventas y comisiones
  - `SpreadsheetStore.js`: Interfaz de almacenamiento en Google Sheets

---

## 🎯 Admin Panel

`adminPanel.html` concentra la navegación administrativa.

- La información de sesión y las acciones de cerrar sesión y volver al ingreso están integradas en el `hero`.
- Incluye acceso al importador técnico `ventasMensuales.html`.
- La caja `Archivos adjuntos` lista recursos administrativos.
- Actualmente incluye:
  - Un enlace externo a `Reporte y registro de asistencia` en Google Sheets
  - Archivos HTML descargables contenidos en `Assets/`

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

## Importador De Ventas

`ventasMensuales.html` es la primera pantalla operativa del módulo de ventas.

Estado actual:

- protegida por sesión de administrador
- usa el entorno activo (`prod` o `staging`)
- carga `JSON`, `CSV`, `XLS` y `XLSX` desde archivo o textarea
- detecta hojas de ventas y propinas por nombre/headers comunes
- normaliza registros al payload esperado por Apps Script
- calcula `hashArchivo`
- muestra preview técnico
- llama al endpoint `ImportarVentas`
- persiste `periodo` normalizado como `YYYY-MM`
- ya valida correctamente en staging el reemplazo de importaciones activas previas por `Local + Periodo`

Limitación actual:

- la detección de columnas y hojas todavía es heurística; formatos POS muy distintos requerirán reglas adicionales
- todavía faltan hojas de `pagos` y `productos`
- la validación manual de `POST` contra la web app no es confiable con `curl -L`; para staging conviene probar desde UI o desde `fetch` en navegador

## Entornos Frontend

El frontend ahora también distingue `prod` y `staging`.

Archivos:

- `app-config.prod.js`
- `app-config.staging.js`
- `app-config.js`

Resolución del entorno activo:

- `?env=staging` o `?env=prod` en la URL
- si corres en `localhost` o `127.0.0.1`, el frontend fuerza `staging` por defecto para evitar pruebas accidentales contra producción
- valor persistido en `localStorage` bajo `lavictoria.app.env`
- fallback por defecto a `prod`

Reglas prácticas:

- `prod` usa la web app productiva actual
- `staging` usa la web app de staging
- cada entorno usa un `SESSION_KEY` distinto para no mezclar sesiones

Ejemplos:

- `index.html?env=staging`
- `adminPanel.html?env=prod`

Los HTML de `Assets/` también quedaron conectados a la misma estrategia, por lo que pueden probarse contra `staging` agregando `?env=staging`.

Además, todas las pantallas muestran un badge visual fijo del entorno activo:

- `STAGING` en tono cálido
- `PROD` en tono verde

## Spreadsheets Por ID

El proyecto de Apps Script ya no debe depender de `SpreadsheetApp.getActiveSpreadsheet()`.

Ahora el acceso a datos se resuelve por ID usando `Script Properties` y el helper `AppsScript/SpreadsheetStore.js`.

Propiedades esperadas:

- `LV_SPREADSHEET_RRHH_ID`
- `LV_SPREADSHEET_VENTAS_ID`

Estado actual:

- los módulos existentes de asistencia, turnos, sesión y cierre usan `LV_SPREADSHEET_RRHH_ID`
- ventas y comisiones deben usar `LV_SPREADSHEET_VENTAS_ID`

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
