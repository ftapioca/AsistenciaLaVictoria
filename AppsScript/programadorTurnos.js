// ==========================================
// PROGRAMADOR DE TURNOS
// Archivo sugerido: programadorTurnos.js
// No incluye doGet ni doPost.
// Usa responderJSON() y normalizarTexto() del script principal.
// ==========================================

const HOJA_TURNOS_PROGRAMADOS = "TurnosProgramados";
const HOJA_HORARIO_LOCALES = "HorarioLocales";
const HOJA_HORARIO_ESPECIAL_LOCALES = "HorarioEspecialLocales";
const HOJA_PLANTILLAS_TURNOS = "PlantillasTurnos";

function listarPlantillasTurnos_(local) {
  var sheet = getSheet_(HOJA_PLANTILLAS_TURNOS, SPREADSHEET_KEY_RRHH);
  var datos = sheet.getDataRange().getValues();
  return listarPlantillasTurnosDesdeDatos_(datos, local);
}

function listarPlantillasTurnosDesdeDatos_(datos, local) {
  var plantillas = [];

  for (var i = 1; i < datos.length; i++) {
    var localRegistro = datos[i][0];
    var nombrePlantilla = datos[i][1];
    var tipoTurno = datos[i][2];
    var inicio1 = datos[i][3];
    var fin1 = datos[i][4];
    var inicio2 = datos[i][5];
    var fin2 = datos[i][6];
    var activo = datos[i][7];

    if (
      normalizarTexto(localRegistro) === normalizarTexto(local) &&
      normalizarTexto(activo) === "si"
    ) {
      plantillas.push({
        local: localRegistro,
        nombrePlantilla: nombrePlantilla,
        tipoTurno: tipoTurno,
        inicio1: formatearHoraTurnos(inicio1),
        fin1: formatearHoraTurnos(fin1),
        inicio2: formatearHoraTurnos(inicio2),
        fin2: formatearHoraTurnos(fin2)
      });
    }
  }

  return plantillas;
}

function listarColaboradoresPorLocalTurnos_(local) {
  var sheet = getSheet_("Colaboradores", SPREADSHEET_KEY_RRHH);
  var datos = sheet.getDataRange().getValues();
  return listarColaboradoresPorLocalDesdeDatos_(datos, local);
}

function listarColaboradoresPorLocalDesdeDatos_(datos, local) {
  var colaboradores = [];

  for (var i = 1; i < datos.length; i++) {
    var nombre = datos[i][0];
    var localColaborador = datos[i][3];

    if (normalizarTexto(localColaborador) === normalizarTexto(local)) {
      colaboradores.push(nombre);
    }
  }

  colaboradores.sort();
  return colaboradores;
}

function listarTurnosSemana_(local, fechaInicio, fechaFin) {
  var sheet = getSheet_(HOJA_TURNOS_PROGRAMADOS, SPREADSHEET_KEY_RRHH);
  var datos = sheet.getDataRange().getValues();
  return listarTurnosSemanaDesdeDatos_(datos, local, fechaInicio, fechaFin);
}

function listarTurnosSemanaDesdeDatos_(datos, local, fechaInicio, fechaFin) {
  var turnos = [];

  for (var i = 1; i < datos.length; i++) {
    var fecha = datos[i][0];
    var colaborador = datos[i][1];
    var localRegistro = datos[i][2];

    if (
      normalizarTexto(localRegistro) === normalizarTexto(local) &&
      new Date(fecha) >= fechaInicio &&
      new Date(fecha) <= fechaFin
    ) {
      turnos.push({
        fecha: formatearFechaBaseTurnos(fecha),
        colaborador: colaborador,
        local: localRegistro,
        inicio1: formatearHoraTurnos(datos[i][3]),
        fin1: formatearHoraTurnos(datos[i][4]),
        inicio2: formatearHoraTurnos(datos[i][5]),
        fin2: formatearHoraTurnos(datos[i][6]),
        tipoTurno: datos[i][7],
        estado: datos[i][8],
        esTrasnoche: datos[i][9],
        horasProgramadas: datos[i][10],
        origenHorario: datos[i][11],
        observaciones: datos[i][12],
        plantillaAplicada: datos[i][13]
      });
    }
  }

  return turnos;
}

function obtenerPlantillasTurnos(params) {
  var local = params.local;

  if (!local) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar un local."
    });
  }

  var sheet = getSheet_(HOJA_PLANTILLAS_TURNOS, SPREADSHEET_KEY_RRHH);
  var datos = sheet.getDataRange().getValues();
  var plantillas = listarPlantillasTurnosDesdeDatos_(datos, local);

  return responderJSON({
    status: "SUCCESS",
    local: local,
    plantillas: plantillas
  });
}

function obtenerColaboradoresPorLocalTurnos(params) {
  var local = params.local;

  if (!local) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar un local."
    });
  }

  var sheet = getSheet_("Colaboradores", SPREADSHEET_KEY_RRHH);
  var datos = sheet.getDataRange().getValues();
  var colaboradores = listarColaboradoresPorLocalDesdeDatos_(datos, local);

  return responderJSON({
    status: "SUCCESS",
    local: local,
    colaboradores: colaboradores
  });
}

function obtenerHorarioAplicable(params) {
  var local = params.local;
  var fechaTexto = params.fecha;

  if (!local || !fechaTexto) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar local y fecha."
    });
  }

  var fecha = convertirFechaTurnos(fechaTexto);
  var resultado = obtenerHorarioAplicableInternoTurnos(local, fecha);

  if (!resultado.horario) {
    return responderJSON({
      status: "ERROR_HORARIO",
      mensaje: "No se encontró horario configurado para ese local y fecha.",
      origen: resultado.origen
    });
  }

  return responderJSON({
    status: "SUCCESS",
    origen: resultado.origen,
    horario: resultado.horario
  });
}

function guardarTurnoProgramado(params) {
  var fechaTexto = params.fecha;
  var colaborador = params.colaborador;
  var local = params.local;
  var inicio1 = params.inicio1 || "";
  var fin1 = params.fin1 || "";
  var inicio2 = params.inicio2 || "";
  var fin2 = params.fin2 || "";
  var tipoTurno = params.tipoTurno || "Simple";
  var estado = params.estado || "Programado";
  var observaciones = params.observaciones || "";
  var plantillaAplicada = params.plantillaAplicada || "";

  if (!fechaTexto || !colaborador || !local) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Faltan datos obligatorios: fecha, colaborador o local."
    });
  }

  if (estado === "Programado" && tipoTurno !== "Libre" && (!inicio1 || !fin1)) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Para un turno programado debes indicar hora de inicio y hora de fin."
    });
  }

  if (tipoTurno === "Partido" && (!inicio2 || !fin2)) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Para un turno partido debes indicar el segundo tramo completo."
    });
  }

  if (tipoTurno === "Libre" || estado === "Libre") {
    estado = "Libre";
    tipoTurno = "Libre";
    inicio1 = "";
    fin1 = "";
    inicio2 = "";
    fin2 = "";
  }

  var fecha = convertirFechaTurnos(fechaTexto);
  var horarioAplicable = obtenerHorarioAplicableInternoTurnos(local, fecha);
  var origenHorario = horarioAplicable.origen;

  var calculo = calcularTurnoProgramado(tipoTurno, estado, inicio1, fin1, inicio2, fin2);

  var sheet = getSheet_(HOJA_TURNOS_PROGRAMADOS, SPREADSHEET_KEY_RRHH);
  var datos = sheet.getDataRange().getValues();

  var filaExistente = buscarFilaTurnoProgramado(datos, fecha, colaborador, local);
  var ahora = new Date();

  var creadoEn = ahora;

  if (filaExistente) {
    creadoEn = datos[filaExistente - 1][14] || ahora;
  }

  var fila = [
    fecha,
    colaborador,
    local,
    inicio1,
    fin1,
    inicio2,
    fin2,
    tipoTurno,
    estado,
    calculo.esTrasnoche,
    calculo.horasProgramadas,
    origenHorario,
    observaciones,
    plantillaAplicada,
    creadoEn,
    ahora
  ];

  if (filaExistente) {
    sheet.getRange(filaExistente, 1, 1, fila.length).setValues([fila]);

    return responderJSON({
      status: "SUCCESS",
      accion: "ACTUALIZADO",
      mensaje: "Turno actualizado correctamente.",
      esTrasnoche: calculo.esTrasnoche,
      horasProgramadas: calculo.horasProgramadas,
      origenHorario: origenHorario
    });
  }

  sheet.appendRow(fila);

  return responderJSON({
    status: "SUCCESS",
    accion: "CREADO",
    mensaje: "Turno creado correctamente.",
    esTrasnoche: calculo.esTrasnoche,
    horasProgramadas: calculo.horasProgramadas,
    origenHorario: origenHorario
  });
}

function obtenerTurnosSemana(params) {
  var local = params.local;
  var fechaInicioTexto = params.fechaInicio;
  var fechaFinTexto = params.fechaFin;

  if (!local || !fechaInicioTexto || !fechaFinTexto) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar local, fechaInicio y fechaFin."
    });
  }

  var fechaInicio = convertirFechaTurnos(fechaInicioTexto);
  var fechaFin = convertirFechaTurnos(fechaFinTexto);

  var sheet = getSheet_(HOJA_TURNOS_PROGRAMADOS, SPREADSHEET_KEY_RRHH);
  var datos = sheet.getDataRange().getValues();
  var turnos = listarTurnosSemanaDesdeDatos_(datos, local, fechaInicio, fechaFin);

  return responderJSON({
    status: "SUCCESS",
    local: local,
    turnos: turnos
  });
}

function bootstrapProgramadorTurnos(params) {
  var local = params.local;
  var fechaInicioTexto = params.fechaInicio;
  var fechaFinTexto = params.fechaFin;

  if (!local || !fechaInicioTexto || !fechaFinTexto) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar local, fechaInicio y fechaFin."
    });
  }

  var sesion = requireAdminSession(params);

  var fechaInicio = convertirFechaTurnos(fechaInicioTexto);
  var fechaFin = convertirFechaTurnos(fechaFinTexto);

  var plantillas = listarPlantillasTurnos_(local);
  var colaboradores = listarColaboradoresPorLocalTurnos_(local);
  var turnos = listarTurnosSemana_(local, fechaInicio, fechaFin);

  return responderJSON({
    status: "SUCCESS",
    session: {
      role: sesion.role,
      displayName: sesion.displayName,
      userKey: sesion.userKey
    },
    context: {
      local: local,
      fechaInicio: fechaInicioTexto,
      fechaFin: fechaFinTexto
    },
    data: {
      plantillas: plantillas,
      colaboradores: colaboradores,
      turnos: turnos
    },
    meta: {
      counts: {
        plantillas: plantillas.length,
        colaboradores: colaboradores.length,
        turnos: turnos.length
      }
    }
  });
}

function obtenerTurnosSemanaColaborador(params) {
  var sesion = requireColaboradorSession(params);
  var fechaInicioTexto = params.fechaInicio;
  var fechaFinTexto = params.fechaFin;

  if (!fechaInicioTexto || !fechaFinTexto) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar fechaInicio y fechaFin."
    });
  }

  var fechaInicio = convertirFechaTurnos(fechaInicioTexto);
  var fechaFin = convertirFechaTurnos(fechaFinTexto);

  var sheet = getSheet_(HOJA_TURNOS_PROGRAMADOS, SPREADSHEET_KEY_RRHH);
  var datos = sheet.getDataRange().getValues();
  var turnos = [];

  for (var i = 1; i < datos.length; i++) {
    var fecha = datos[i][0];
    var colaborador = datos[i][1];
    var localRegistro = datos[i][2];

    if (
      normalizarTexto(colaborador) === normalizarTexto(sesion.userKey) &&
      new Date(fecha) >= fechaInicio &&
      new Date(fecha) <= fechaFin
    ) {
      turnos.push({
        fecha: formatearFechaBaseTurnos(fecha),
        colaborador: colaborador,
        local: localRegistro,
        inicio1: formatearHoraTurnos(datos[i][3]),
        fin1: formatearHoraTurnos(datos[i][4]),
        inicio2: formatearHoraTurnos(datos[i][5]),
        fin2: formatearHoraTurnos(datos[i][6]),
        tipoTurno: datos[i][7],
        estado: datos[i][8],
        esTrasnoche: datos[i][9],
        horasProgramadas: datos[i][10],
        origenHorario: datos[i][11],
        observaciones: datos[i][12],
        plantillaAplicada: datos[i][13]
      });
    }
  }

  return responderJSON({
    status: "SUCCESS",
    displayName: sesion.displayName,
    userKey: sesion.userKey,
    turnos: turnos
  });
}

function buscarFilaTurnoProgramado(datos, fecha, colaborador, local) {
  var fechaBuscada = formatearFechaBaseTurnos(fecha);

  for (var i = 1; i < datos.length; i++) {
    var fechaRegistro = datos[i][0];
    var colaboradorRegistro = datos[i][1];
    var localRegistro = datos[i][2];

    if (
      formatearFechaBaseTurnos(fechaRegistro) === fechaBuscada &&
      normalizarTexto(colaboradorRegistro) === normalizarTexto(colaborador) &&
      normalizarTexto(localRegistro) === normalizarTexto(local)
    ) {
      return i + 1;
    }
  }

  return null;
}

function obtenerHorarioAplicableInternoTurnos(local, fecha) {
  var especial = buscarHorarioEspecialLocal(local, fecha);

  if (especial.encontrado) {
    return {
      origen: "Especial",
      horario: especial.horario
    };
  }

  var normal = buscarHorarioNormalLocal(local, fecha);

  if (normal.encontrado) {
    return {
      origen: "Normal",
      horario: normal.horario
    };
  }

  return {
    origen: "No configurado",
    horario: null
  };
}

function buscarHorarioEspecialLocal(local, fecha) {
  var sheet = getSheet_(HOJA_HORARIO_ESPECIAL_LOCALES, SPREADSHEET_KEY_RRHH);
  var datos = sheet.getDataRange().getValues();
  var fechaBuscada = formatearFechaBaseTurnos(fecha);

  for (var i = 1; i < datos.length; i++) {
    var fechaRegistro = datos[i][0];
    var localRegistro = datos[i][1];
    var nombreEvento = datos[i][2];
    var horaApertura = datos[i][3];
    var horaCierre = datos[i][4];
    var permiteTrasnoche = datos[i][5];
    var tipoEspecial = datos[i][6];
    var activo = datos[i][7];
    var observaciones = datos[i][8];

    if (
      formatearFechaBaseTurnos(fechaRegistro) === fechaBuscada &&
      normalizarTexto(localRegistro) === normalizarTexto(local) &&
      normalizarTexto(activo) === "si"
    ) {
      return {
        encontrado: true,
        horario: {
          fecha: fechaBuscada,
          local: localRegistro,
          nombreEvento: nombreEvento,
          horaApertura: formatearHoraTurnos(horaApertura),
          horaCierre: formatearHoraTurnos(horaCierre),
          permiteTrasnoche: permiteTrasnoche,
          tipoEspecial: tipoEspecial,
          observaciones: observaciones
        }
      };
    }
  }

  return { encontrado: false };
}

function buscarHorarioNormalLocal(local, fecha) {
  var sheet = getSheet_(HOJA_HORARIO_LOCALES, SPREADSHEET_KEY_RRHH);
  var datos = sheet.getDataRange().getValues();

  var diaSemanaNumero = obtenerNumeroDiaSemanaTurnos(fecha);
  var diaSemanaNombre = obtenerNombreDiaSemanaTurnos(diaSemanaNumero);

  for (var i = 1; i < datos.length; i++) {
    var localRegistro = datos[i][0];
    var diaRegistro = datos[i][1];
    var horaApertura = datos[i][2];
    var horaCierre = datos[i][3];
    var permiteTrasnoche = datos[i][4];
    var activo = datos[i][5];

    var diaRegistroNormalizado = normalizarTexto(diaRegistro);
    var coincideDia =
      Number(diaRegistro) === diaSemanaNumero ||
      diaRegistroNormalizado === normalizarTexto(diaSemanaNombre);

    if (
      normalizarTexto(localRegistro) === normalizarTexto(local) &&
      coincideDia &&
      normalizarTexto(activo) === "si"
    ) {
      return {
        encontrado: true,
        horario: {
          local: localRegistro,
          diaSemana: diaRegistro,
          horaApertura: formatearHoraTurnos(horaApertura),
          horaCierre: formatearHoraTurnos(horaCierre),
          permiteTrasnoche: permiteTrasnoche
        }
      };
    }
  }

  return { encontrado: false };
}

function obtenerNombreDiaSemanaTurnos(numeroDia) {
  var nombres = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    7: "Domingo"
  };

  return nombres[numeroDia] || "";
}

function calcularTurnoProgramado(tipoTurno, estado, inicio1, fin1, inicio2, fin2) {
  if (estado !== "Programado" || tipoTurno === "Libre") {
    return {
      esTrasnoche: "NO",
      horasProgramadas: 0
    };
  }

  var horas1 = calcularHorasEntreTurnos(inicio1, fin1);
  var horas2 = 0;

  if (tipoTurno === "Partido") {
    horas2 = calcularHorasEntreTurnos(inicio2, fin2);
  }

  var esTrasnoche =
    horaEsTrasnocheTurnos(inicio1, fin1) ||
    (tipoTurno === "Partido" && horaEsTrasnocheTurnos(inicio2, fin2));

  return {
    esTrasnoche: esTrasnoche ? "SI" : "NO",
    horasProgramadas: horas1 + horas2
  };
}

function calcularHorasEntreTurnos(inicio, fin) {
  var minutosInicio = horaAMinutosTurnos(inicio);
  var minutosFin = horaAMinutosTurnos(fin);

  if (minutosFin <= minutosInicio) {
    minutosFin += 24 * 60;
  }

  return Math.round(((minutosFin - minutosInicio) / 60) * 100) / 100;
}

function horaEsTrasnocheTurnos(inicio, fin) {
  return horaAMinutosTurnos(fin) <= horaAMinutosTurnos(inicio);
}

function horaAMinutosTurnos(hora) {
  if (!hora) return 0;

  if (Object.prototype.toString.call(hora) === "[object Date]") {
    return hora.getHours() * 60 + hora.getMinutes();
  }

  var partes = hora.toString().split(":");
  return Number(partes[0]) * 60 + Number(partes[1]);
}

function convertirFechaTurnos(valor) {
  if (Object.prototype.toString.call(valor) === "[object Date]") {
    return valor;
  }

  var partes = valor.toString().split("-");
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

function formatearFechaBaseTurnos(fecha) {
  return Utilities.formatDate(
    new Date(fecha),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );
}

function formatearHoraTurnos(valor) {
  if (!valor) return "";

  if (Object.prototype.toString.call(valor) === "[object Date]") {
    return Utilities.formatDate(
      valor,
      Session.getScriptTimeZone(),
      "HH:mm"
    );
  }

  return valor.toString();
}

function obtenerNumeroDiaSemanaTurnos(fecha) {
  var dia = new Date(fecha).getDay();

  if (dia === 0) return 7;

  return dia;
}

function copiarSemanaAnterior(params) {
  var local = params.local;
  var fechaInicioDestinoTexto = params.fechaInicio;

  if (!local || !fechaInicioDestinoTexto) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar local y fechaInicio."
    });
  }

  var fechaInicioDestino = convertirFechaTurnos(fechaInicioDestinoTexto);
  var fechaFinDestino = sumarDiasTurnos(fechaInicioDestino, 6);

  var fechaInicioOrigen = sumarDiasTurnos(fechaInicioDestino, -7);
  var fechaFinOrigen = sumarDiasTurnos(fechaInicioDestino, -1);

  var sheet = getSheet_(HOJA_TURNOS_PROGRAMADOS, SPREADSHEET_KEY_RRHH);
  var datos = sheet.getDataRange().getValues();

  var turnosOrigen = [];

  for (var i = 1; i < datos.length; i++) {
    var fecha = datos[i][0];
    var colaborador = datos[i][1];
    var localRegistro = datos[i][2];

    if (
      normalizarTexto(localRegistro) === normalizarTexto(local) &&
      new Date(fecha) >= fechaInicioOrigen &&
      new Date(fecha) <= fechaFinOrigen
    ) {
      turnosOrigen.push({
        fecha: new Date(fecha),
        colaborador: colaborador,
        local: localRegistro,
        inicio1: datos[i][3],
        fin1: datos[i][4],
        inicio2: datos[i][5],
        fin2: datos[i][6],
        tipoTurno: datos[i][7],
        estado: datos[i][8],
        esTrasnoche: datos[i][9],
        horasProgramadas: datos[i][10],
        origenHorario: datos[i][11],
        observaciones: datos[i][12],
        plantillaAplicada: datos[i][13]
      });
    }
  }

  if (turnosOrigen.length === 0) {
    return responderJSON({
      status: "ERROR_SIN_TURNOS",
      mensaje: "No hay turnos en la semana anterior para copiar."
    });
  }

  var creados = 0;
  var actualizados = 0;
  var ahora = new Date();

  turnosOrigen.forEach(function(turno) {
    var diferenciaDias = diasEntreTurnos(fechaInicioOrigen, turno.fecha);
    var nuevaFecha = sumarDiasTurnos(fechaInicioDestino, diferenciaDias);

    var filaExistente = buscarFilaTurnoProgramado(datos, nuevaFecha, turno.colaborador, local);

    var calculo = calcularTurnoProgramado(
      turno.tipoTurno,
      turno.estado,
      turno.inicio1,
      turno.fin1,
      turno.inicio2,
      turno.fin2
    );

    var horarioAplicable = obtenerHorarioAplicableInternoTurnos(local, nuevaFecha);

    var fila = [
      nuevaFecha,
      turno.colaborador,
      local,
      turno.inicio1,
      turno.fin1,
      turno.inicio2,
      turno.fin2,
      turno.tipoTurno,
      turno.estado,
      calculo.esTrasnoche,
      calculo.horasProgramadas,
      horarioAplicable.origen,
      turno.observaciones,
      turno.plantillaAplicada,
      ahora,
      ahora
    ];

    if (filaExistente) {
      sheet.getRange(filaExistente, 1, 1, fila.length).setValues([fila]);
      actualizados++;
    } else {
      sheet.appendRow(fila);
      creados++;
    }
  });

  return responderJSON({
    status: "SUCCESS",
    mensaje: "Semana anterior copiada correctamente.",
    local: local,
    origen: {
      desde: formatearFechaBaseTurnos(fechaInicioOrigen),
      hasta: formatearFechaBaseTurnos(fechaFinOrigen)
    },
    destino: {
      desde: formatearFechaBaseTurnos(fechaInicioDestino),
      hasta: formatearFechaBaseTurnos(fechaFinDestino)
    },
    turnosCopiados: turnosOrigen.length,
    creados: creados,
    actualizados: actualizados
  });
}

function sumarDiasTurnos(fecha, dias) {
  var nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + dias);
  nueva.setHours(0, 0, 0, 0);
  return nueva;
}

function diasEntreTurnos(fechaInicio, fechaObjetivo) {
  var inicio = new Date(fechaInicio);
  var objetivo = new Date(fechaObjetivo);

  inicio.setHours(0, 0, 0, 0);
  objetivo.setHours(0, 0, 0, 0);

  return Math.round((objetivo - inicio) / (1000 * 60 * 60 * 24));
}

function eliminarTurnoProgramado(params) {
  var fechaTexto = params.fecha;
  var colaborador = params.colaborador;
  var local = params.local;

  if (!fechaTexto || !colaborador || !local) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Faltan datos obligatorios: fecha, colaborador o local."
    });
  }

  var fecha = convertirFechaTurnos(fechaTexto);
  var sheet = getSheet_(HOJA_TURNOS_PROGRAMADOS, SPREADSHEET_KEY_RRHH);
  var datos = sheet.getDataRange().getValues();

  var filaExistente = buscarFilaTurnoProgramado(datos, fecha, colaborador, local);

  if (!filaExistente) {
    return responderJSON({
      status: "ERROR_NO_EXISTE",
      mensaje: "No existe un turno para eliminar."
    });
  }

  sheet.deleteRow(filaExistente);

  return responderJSON({
    status: "SUCCESS",
    mensaje: "Turno eliminado correctamente."
  });
}
