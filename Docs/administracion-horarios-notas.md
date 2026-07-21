# Administración de Horarios

Fecha: 2026-07-21

## Encabezados rígidos vigentes

`HorarioLocales`

- `Local`
- `DiaSemana`
- `HoraApertura`
- `HoraCierre`
- `PermiteTrasnoche`
- `Activo`

`HorarioEspecialLocales`

- `Fecha`
- `Local`
- `NombreEvento`
- `HoraApertura`
- `HoraCierre`
- `PermiteTrasnoche`
- `TipoEspecial`
- `Activo`
- `Observaciones`

`Feriados`

- `Fecha`
- `Festividad`
- `Tipo de Feriado`

## Ajustes implementados

- La lectura administrativa de `HorarioEspecialLocales` y `Feriados` quedó rígida y se resuelve por orden exacto de columnas según los encabezados oficiales.
- La vista `Horarios Locales` mantiene el bloque `Horario base por local` agrupado por `Local`, con `Días` ordenados de `Lunes` a `Domingo`.
- `HorarioEspecialLocales` y `Feriados` usan modales batch para crear múltiples registros en una sola acción.
- `Feriados` usa una lista cerrada para `Tipo de feriado`: `Irrenunciable`, `Civil`, `Religioso`.
- El primer registro de los modales batch no muestra la acción `Quitar`; desde el segundo en adelante sí.

## UX y sesión

- Los guardados y eliminaciones dentro de modales muestran estado de carga contextual con blur de fondo y tarjeta de mensaje nítida.
- La validación de sesión del frontend ahora reutiliza la sesión validada durante una ventana corta (`120000 ms`) para reducir latencia al navegar entre vistas internas.

## Publicación

- Staging Apps Script quedó publicado sobre el deployment fijo usado por `app-config.staging.js`.
- Antes de promover a producción, se debe:
  - sincronizar Apps Script productivo
  - versionar y actualizar el deployment fijo de producción
  - publicar frontend con `GitHub Pages`
