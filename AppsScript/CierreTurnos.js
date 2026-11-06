// ==========================================
// CIERRE DE TURNOS ABIERTOS
// Archivo: CierreTurnos.js
// Lee RegistroAsistencia y devuelve quienes
// tienen como última marca un "Ingreso".
// ==========================================

function obtenerTurnosAbiertos(params) {
  var resultado = construirRespuestaTurnosAbiertos_(params);
  if (resultado.status !== "SUCCESS") {
    return responderJSON(resultado);
  }

  return responderJSON(resultado);
}

function obtenerTurnosAbiertosPublico(params) {
  var resultado = construirRespuestaTurnosAbiertos_(params);
  if (resultado.status !== "SUCCESS") {
    return responderJSON(resultado);
  }

  resultado.turnosAbiertos = resultado.turnosAbiertos.map(function(turno) {
    return {
      nombre: turno.nombre,
      local: turno.local,
      accion: turno.accion,
      fechaHora: turno.fechaHora,
      hora: turno.hora,
      iniciales: turno.iniciales
    };
  });

  return responderJSON(resultado);
}

function construirRespuestaTurnosAbiertos_(params) {
  var localSolicitado = params.local;

  if (!localSolicitado) {
    return {
      status: "ERROR_DATOS",
      mensaje: "Falta indicar el local."
    };
  }

  var payload = readAsistenciaPublicaCachedPayload_("turnos_abiertos", localSolicitado);
  if (payload && payload.status === "SUCCESS") {
    return payload;
  }

  payload = construirRespuestaTurnosAbiertosRaw_(localSolicitado);
  writeAsistenciaPublicaCachedPayload_("turnos_abiertos", localSolicitado, payload);
  return payload;
}

function construirRespuestaTurnosAbiertosRaw_(localSolicitado) {
  var sheetRegistroAsistencia = getSheet_("RegistroAsistencia", SPREADSHEET_KEY_RRHH);

  var datos = sheetRegistroAsistencia.getDataRange().getValues();
  var ultimosPorColaborador = {};

  for (var i = 1; i < datos.length; i++) {
    var fechaHora = datos[i][0];
    var nombre = datos[i][1];
    var rut = datos[i][2];
    var local = datos[i][3];
    var accion = datos[i][4];

    if (normalizarTexto(local) !== normalizarTexto(localSolicitado)) {
      continue;
    }

    if (!nombre || !accion) {
      continue;
    }

    ultimosPorColaborador[normalizarTexto(nombre)] = {
      nombre: nombre,
      rut: rut,
      local: local,
      accion: accion,
      fechaHora: fechaHora
    };
  }

  var turnosAbiertos = [];

  Object.keys(ultimosPorColaborador).forEach(function(key) {
    var registro = ultimosPorColaborador[key];

    if (normalizarTexto(registro.accion) === "ingreso") {
      turnosAbiertos.push({
        nombre: registro.nombre,
        rut: registro.rut,
        local: registro.local,
        accion: registro.accion,
        fechaHora: formatearFechaHora(registro.fechaHora),
        hora: formatearHoraCierreTurnos(registro.fechaHora),
        iniciales: obtenerInicialesCierreTurnos(registro.nombre)
      });
    }
  });

  turnosAbiertos.sort(function(a, b) {
    return a.nombre.localeCompare(b.nombre);
  });

  return {
    status: "SUCCESS",
    local: localSolicitado,
    total: turnosAbiertos.length,
    turnosAbiertos: turnosAbiertos
  };
}


// ==========================================
// Helpers específicos para CierreTurnos
// ==========================================

function formatearHoraCierreTurnos(fecha) {
  return Utilities.formatDate(
    new Date(fecha),
    Session.getScriptTimeZone(),
    "HH:mm"
  );
}

function obtenerInicialesCierreTurnos(nombre) {
  if (!nombre) return "";

  var partes = nombre
    .toString()
    .trim()
    .split(/\s+/);

  if (partes.length === 1) {
    return partes[0].substring(0, 2).toUpperCase();
  }

  return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
}
