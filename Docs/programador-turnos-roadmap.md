# Roadmap Técnico
# Programador de Turnos

Estado documental: actualizado desde `main` el 9 de junio de 2026  
Estado del trabajo: cambio principal implementado y promovido a `prod`  
Entorno recomendado para validaciones futuras: `staging`

---

## Resumen ejecutivo

El módulo administrativo `programadorTurnos` ya incorporó una mejora estructural de rendimiento:

- el frontend principal dejó de cargar en secuencia:
  - `PlantillasTurnos`
  - `ColaboradoresPorLocal`
  - `TurnosSemana`
- ahora usa un endpoint agregado:
  - `BootstrapProgramadorTurnos`

El cambio quedó:

- implementado en backend
- implementado en frontend
- validado funcionalmente en `staging`
- validado funcionalmente en `prod`

Conclusión:

- el cuello principal del arranque no estaba en el volumen de datos
- estaba en el overhead de múltiples requests Apps Script más la validación repetida de sesión
- el endpoint agregado resolvió correctamente esa parte del problema

---

## Implementado

### Backend

- Nuevo endpoint protegido `BootstrapProgramadorTurnos`.
- Reuso de helpers internos para:
  - plantillas por local
  - colaboradores por local
  - turnos por semana y local
- Contrato consolidado con:
  - `session`
  - `context`
  - `data.plantillas`
  - `data.colaboradores`
  - `data.turnos`
  - `meta.counts`

### Frontend

- `src/scripts/programador-turnos.js` usa `BootstrapProgramadorTurnos` para:
  - carga inicial
  - cambio de local
  - cambio de semana
- Se removió la secuencia serial anterior para la carga principal.

---

## Validación ya realizada

Flujos verificados en `staging` y luego en `prod`:

- carga inicial del programador
- cambio de local
- cambio de semana
- apertura y edición de modal
- guardado de turno
- eliminación de turno
- refresh posterior a mutaciones

Resultado general:

- la mejora funcional quedó estable
- el tiempo útil de respuesta del bootstrap quedó sustancialmente mejor que el flujo anterior basado en múltiples requests

---

## Pendiente real

El cuello restante más visible del módulo no está en `BootstrapProgramadorTurnos`, sino en las consultas adicionales a:

- `HorarioLocal`

Actualmente se sigue consultando `HorarioLocal` cuando:

- se abre un modal por celda
- se abre un modal masivo
- se validan guardados para fechas adicionales

Esto agrega overhead repetido aunque la semana visible ya esté cargada.

---

## Siguiente paso acordado

La siguiente mejora planificada para este módulo es:

### Agregar `horariosSemana` dentro de `BootstrapProgramadorTurnos`

Objetivo:

- precargar los horarios aplicables de la semana visible por `local + fecha`
- evitar consultas repetidas a `HorarioLocal` al abrir modales
- reutilizar esos datos también al guardar varios días o validar turnos

Contrato esperado a futuro:

- `BootstrapProgramadorTurnos` seguirá devolviendo:
  - `session`
  - `context`
  - `data.plantillas`
  - `data.colaboradores`
  - `data.turnos`
- y se extenderá con:
  - `data.horariosSemana`

Forma sugerida:

```json
{
  "data": {
    "horariosSemana": {
      "2026-06-08": {
        "origen": "Normal",
        "horaApertura": "12:00",
        "horaCierre": "00:00",
        "permiteTrasnoche": "SI"
      }
    }
  }
}
```

Uso previsto en frontend:

- abrir modal sin nueva request para fechas ya visibles
- validar guardado contra horario precargado
- reducir dependencia de `HorarioLocal` a casos fuera de la semana cargada

---

## No hacer todavía

Hasta implementar `horariosSemana`, no se recomienda:

- eliminar completamente `HorarioLocal`
- rehacer la lógica de validación del modal
- agregar nuevas optimizaciones sobre hojas sin volver a medir primero

---

## Nota de mantenimiento

Si `BootstrapProgramadorTurnos` cambia su contrato, este documento debe actualizarse junto con:

- `README.md`
- `AppsScript/README.md`
- el comportamiento del frontend de `programadorTurnos`
