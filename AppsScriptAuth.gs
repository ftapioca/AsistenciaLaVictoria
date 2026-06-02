var HOJA_ADMINISTRADORES = "Administradores";
var HOJA_COLABORADORES = "Colaboradores";
var HOJA_SESIONES = "Sesiones";
var DURACION_SESION_MINUTOS = 8 * 60;

function doGet(e) {
  return routeRequest_(e, "GET");
}

function doPost(e) {
  return routeRequest_(e, "POST");
}

function routeRequest_(e, method) {
  try {
    var accion = getParam_(e, "accion");

    switch (accion) {
      case "LoginPorPin":
        return jsonOutput_(loginPorPin_(e));
      case "ValidarSesion":
        return jsonOutput_(validarSesionResponse_(e));
      case "Logout":
        return jsonOutput_(logout_(e));
      case "TurnosSemanaColaborador":
        return jsonOutput_(turnosSemanaColaborador_(e));
      case "TurnosAbiertos":
      case "ColaboradoresPorLocal":
      case "TurnosSemana":
      case "GuardarTurno":
      case "EliminarTurno":
      case "CopiarSemana":
      case "PlantillasTurnos":
      case "HorarioLocal":
        requireAdminSession_(e);
        return routeProtectedAction_(accion, e, method);
      default:
        return routeProtectedAction_(accion, e, method);
    }
  } catch (error) {
    return jsonOutput_({
      status: error.code || "ERROR",
      mensaje: error.message || "Error inesperado."
    });
  }
}

function loginPorPin_(e) {
  var pin = String(getParam_(e, "pin") || "").trim();
  if (!pin) {
    return {
      status: "ERROR",
      mensaje: "Debes ingresar un PIN."
    };
  }

  var admin = buscarUsuarioPorPin_(HOJA_ADMINISTRADORES, pin, "Administrador");
  var colaborador = buscarUsuarioPorPin_(HOJA_COLABORADORES, pin, "Colaborador");
  var usuario = admin || colaborador;

  if (!usuario) {
    return {
      status: "ERROR",
      mensaje: "PIN no válido."
    };
  }

  var sessionToken = Utilities.getUuid();
  guardarSesion_(sessionToken, usuario);

  return {
    status: "SUCCESS",
    role: usuario.role,
    displayName: usuario.displayName,
    userKey: usuario.userKey,
    sessionToken: sessionToken
  };
}

function validarSesionResponse_(e) {
  var session = requireSession_(e);
  return {
    status: "SUCCESS",
    role: session.role,
    displayName: session.displayName,
    userKey: session.userKey
  };
}

function logout_(e) {
  var token = getParam_(e, "sessionToken");
  if (token) {
    eliminarSesion_(token);
  }
  return { status: "SUCCESS" };
}

function turnosSemanaColaborador_(e) {
  var session = requireRoleSession_(e, ["Colaborador"]);
  var fechaInicio = getParam_(e, "fechaInicio");
  var fechaFin = getParam_(e, "fechaFin");

  // Reemplazar esta llamada por la lectura real desde tu hoja de turnos.
  var turnos = obtenerTurnosSemanaPorColaborador_(session.userKey, fechaInicio, fechaFin);

  return {
    status: "SUCCESS",
    displayName: session.displayName,
    userKey: session.userKey,
    turnos: turnos
  };
}

function routeProtectedAction_(accion, e, method) {
  // Integrar aquí tu router existente del proyecto.
  // Si ya tienes un switch/case actual, inserta las validaciones de sesión
  // antes de cada acción protegida y conserva la implementación original.
  throw createError_("NOT_IMPLEMENTED", "Debes conectar la acción '" + accion + "' con tu router actual del Apps Script.");
}

function buscarUsuarioPorPin_(nombreHoja, pin, role) {
  var hoja = SpreadsheetApp.getActive().getSheetByName(nombreHoja);
  if (!hoja) return null;

  var rows = hoja.getDataRange().getValues();
  if (rows.length < 2) return null;

  var headers = rows[0].map(function (value) {
    return normalizeKey_(value);
  });
  var idxPin = headers.indexOf("pin");
  var idxNombre = headers.indexOf("nombre");
  var idxClave = headers.indexOf("userkey") >= 0 ? headers.indexOf("userkey") : idxNombre;

  if (idxPin === -1 || idxNombre === -1 || idxClave === -1) {
    throw createError_("ERROR", "La hoja '" + nombreHoja + "' debe incluir encabezados 'Nombre' y 'PIN'.");
  }

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (String(row[idxPin] || "").trim() === pin) {
      return {
        role: role,
        displayName: String(row[idxNombre] || "").trim(),
        userKey: String(row[idxClave] || row[idxNombre] || "").trim()
      };
    }
  }

  return null;
}

function buscarUsuarioPorSeleccion_(role, nombreOUsuario, pin) {
  var nombreHoja = role === "Administrador" ? HOJA_ADMINISTRADORES : HOJA_COLABORADORES;
  var hoja = SpreadsheetApp.getActive().getSheetByName(nombreHoja);
  if (!hoja) return null;

  var rows = hoja.getDataRange().getValues();
  if (rows.length < 2) return null;

  var headers = rows[0].map(function (value) {
    return normalizeKey_(value);
  });
  var idxNombre = headers.indexOf("nombre");
  var idxPin = headers.indexOf("pin");
  var idxUsuarioAdmin = headers.indexOf("otro");

  if (idxNombre === -1 || idxPin === -1) {
    throw createError_("ERROR", "La hoja '" + nombreHoja + "' debe incluir encabezados 'Nombre' y 'PIN'.");
  }

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var nombre = String(row[idxNombre] || "").trim();
    var pinFila = String(row[idxPin] || "").trim();
    var credencial = role === "Administrador"
      ? String((idxUsuarioAdmin >= 0 ? row[idxUsuarioAdmin] : "") || "").trim()
      : nombre;

    if (!credencial || pinFila !== pin) continue;

    if (normalizarTexto(credencial) === normalizarTexto(nombreOUsuario)) {
      return {
        role: role,
        displayName: nombre,
        userKey: nombre
      };
    }
  }

  return null;
}

function guardarSesion_(token, usuario) {
  var hoja = getOrCreateSheet_(HOJA_SESIONES, ["sessionToken", "role", "displayName", "userKey", "expiresAt"]);
  eliminarSesion_(token);
  hoja.appendRow([
    token,
    usuario.role,
    usuario.displayName,
    usuario.userKey,
    new Date(Date.now() + DURACION_SESION_MINUTOS * 60 * 1000).toISOString()
  ]);
}

function requireAdminSession_(e) {
  return requireRoleSession_(e, ["Administrador"]);
}

function requireRoleSession_(e, roles) {
  var session = requireSession_(e);
  if (roles.indexOf(session.role) === -1) {
    throw createError_("FORBIDDEN", "Tu sesión no tiene permisos para esta acción.");
  }
  return session;
}

function requireSession_(e) {
  var token = String(getParam_(e, "sessionToken") || "").trim();
  if (!token) {
    throw createError_("UNAUTHORIZED", "Debes iniciar sesión.");
  }

  var hoja = SpreadsheetApp.getActive().getSheetByName(HOJA_SESIONES);
  if (!hoja) {
    throw createError_("UNAUTHORIZED", "Sesión no válida.");
  }

  var rows = hoja.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0] || "").trim() !== token) continue;

    var expiresAt = new Date(rows[i][4]);
    if (expiresAt.getTime() <= Date.now()) {
      hoja.deleteRow(i + 1);
      break;
    }

    return {
      sessionToken: token,
      role: String(rows[i][1] || "").trim(),
      displayName: String(rows[i][2] || "").trim(),
      userKey: String(rows[i][3] || "").trim()
    };
  }

  throw createError_("UNAUTHORIZED", "La sesión expiró o ya no existe.");
}

function eliminarSesion_(token) {
  var hoja = SpreadsheetApp.getActive().getSheetByName(HOJA_SESIONES);
  if (!hoja) return;

  var rows = hoja.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][0] || "").trim() === token) {
      hoja.deleteRow(i + 1);
    }
  }
}

function getOrCreateSheet_(name, headers) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (sheet) return sheet;

  sheet = SpreadsheetApp.getActive().insertSheet(name);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return sheet;
}

function getParam_(e, key) {
  return e && e.parameter ? e.parameter[key] : "";
}

function normalizeKey_(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function createError_(code, message) {
  var error = new Error(message);
  error.code = code;
  return error;
}

function jsonOutput_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function obtenerTurnosSemanaPorColaborador_(userKey, fechaInicio, fechaFin) {
  // Reemplazar por la lectura real de tu hoja de turnos.
  // El filtro debe basarse en userKey/nombre proveniente de sesión, no del cliente.
  return [];
}
