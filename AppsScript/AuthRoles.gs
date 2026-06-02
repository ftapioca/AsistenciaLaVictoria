const HOJA_ADMINISTRADORES = "Administradores";
const HOJA_COLABORADORES = "Colaboradores";
const HOJA_SESIONES = "Sesiones";
const DURACION_SESION_MINUTOS = 8 * 60;

function obtenerUsuariosPorRol(params) {
  var role = (params.role || "").trim();

  if (role !== "Administrador" && role !== "Colaborador") {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Rol no válido."
    });
  }

  // No exponer lista de administradores
  if (role === "Administrador") {
    return responderJSON({
      status: "SUCCESS",
      role: role,
      usuarios: []
    });
  }

  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_COLABORADORES);

  if (!hoja) {
    return responderJSON({
      status: "ERROR_HOJA",
      mensaje: "No se encontró la hoja de colaboradores."
    });
  }

  var datos = hoja.getDataRange().getValues();
  var usuariosMap = {};

  for (var i = 1; i < datos.length; i++) {
    var nombre = String(datos[i][0] || "").trim();
    if (!nombre) continue;

    var clave = normalizarTexto(nombre);
    if (!usuariosMap[clave]) {
      usuariosMap[clave] = nombre;
    }
  }

  var usuarios = Object.keys(usuariosMap)
    .map(function(key) { return usuariosMap[key]; })
    .sort();

  return responderJSON({
    status: "SUCCESS",
    role: role,
    usuarios: usuarios
  });
}

function loginPorSeleccion(params) {
  var role = (params.role || "").trim();
  var nombre = (params.nombre || "").trim();
  var pin = String(params.pin || "").trim();

  if (!role || !nombre || !pin) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar rol, usuario/nombre y PIN."
    });
  }

  var usuario = buscarUsuarioPorRolNombrePin(role, nombre, pin);

  if (!usuario) {
    return responderJSON({
      status: "ERROR_PIN",
      mensaje: "Credenciales incorrectas."
    });
  }

  var sessionToken = Utilities.getUuid();
  guardarSesion(sessionToken, usuario);

  return responderJSON({
    status: "SUCCESS",
    role: usuario.role,
    displayName: usuario.displayName,
    userKey: usuario.userKey,
    sessionToken: sessionToken
  });
}

function validarSesion(params) {
  try {
    var sesion = requireSession(params);
    return responderJSON({
      status: "SUCCESS",
      role: sesion.role,
      displayName: sesion.displayName,
      userKey: sesion.userKey
    });
  } catch (error) {
    return responderJSON({
      status: error.code || "UNAUTHORIZED",
      mensaje: error.message || "Sesión no válida."
    });
  }
}

function logoutSesion(params) {
  var token = String(params.sessionToken || "").trim();
  if (token) {
    eliminarSesion(token);
  }

  return responderJSON({
    status: "SUCCESS"
  });
}

function buscarUsuarioPorRolNombrePin(role, nombreOUsuario, pin) {
  var nombreHoja = role === "Administrador" ? HOJA_ADMINISTRADORES : HOJA_COLABORADORES;
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombreHoja);

  if (!hoja) return null;

  var datos = hoja.getDataRange().getValues();

  for (var i = 1; i < datos.length; i++) {
    var nombreFila = String(datos[i][0] || "").trim();
    var credencial = "";
    var pinFila = "";

    if (role === "Administrador") {
      credencial = String(datos[i][1] || "").trim(); // columna "Otro"
      pinFila = String(datos[i][2] || "").trim();    // columna "PIN"
    } else {
      credencial = nombreFila;                       // columna "Nombre"
      pinFila = String(datos[i][2] || "").trim();   // columna "PIN"
    }

    if (
      normalizarTexto(credencial) === normalizarTexto(nombreOUsuario) &&
      pinFila === pin
    ) {
      return {
        role: role,
        displayName: nombreFila,
        userKey: nombreFila
      };
    }
  }

  return null;
}

function requireSession(params) {
  var token = String(params.sessionToken || "").trim();

  if (!token) {
    throw crearErrorAuth("UNAUTHORIZED", "Debes iniciar sesión.");
  }

  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_SESIONES);
  if (!hoja) {
    throw crearErrorAuth("UNAUTHORIZED", "Sesión no válida.");
  }

  var datos = hoja.getDataRange().getValues();

  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][0] || "").trim() !== token) continue;

    var expiresAt = new Date(datos[i][4]);
    if (expiresAt.getTime() <= Date.now()) {
      hoja.deleteRow(i + 1);
      throw crearErrorAuth("UNAUTHORIZED", "La sesión expiró.");
    }

    return {
      sessionToken: token,
      role: String(datos[i][1] || "").trim(),
      displayName: String(datos[i][2] || "").trim(),
      userKey: String(datos[i][3] || "").trim()
    };
  }

  throw crearErrorAuth("UNAUTHORIZED", "La sesión no existe.");
}

function requireAdminSession(params) {
  var sesion = requireSession(params);
  if (sesion.role !== "Administrador") {
    throw crearErrorAuth("FORBIDDEN", "No tienes permisos para esta acción.");
  }
  return sesion;
}

function requireColaboradorSession(params) {
  var sesion = requireSession(params);
  if (sesion.role !== "Colaborador") {
    throw crearErrorAuth("FORBIDDEN", "No tienes permisos para esta acción.");
  }
  return sesion;
}

function guardarSesion(token, usuario) {
  var hoja = getOrCreateSheetSesiones();
  hoja.appendRow([
    token,
    usuario.role,
    usuario.displayName,
    usuario.userKey,
    new Date(Date.now() + DURACION_SESION_MINUTOS * 60 * 1000).toISOString()
  ]);
}

function eliminarSesion(token) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_SESIONES);
  if (!hoja) return;

  var datos = hoja.getDataRange().getValues();
  for (var i = datos.length - 1; i >= 1; i--) {
    if (String(datos[i][0] || "").trim() === token) {
      hoja.deleteRow(i + 1);
    }
  }
}

function getOrCreateSheetSesiones() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_SESIONES);
  if (hoja) return hoja;

  hoja = SpreadsheetApp.getActiveSpreadsheet().insertSheet(HOJA_SESIONES);
  hoja.getRange(1, 1, 1, 5).setValues([[
    "sessionToken",
    "role",
    "displayName",
    "userKey",
    "expiresAt"
  ]]);

  return hoja;
}

function crearErrorAuth(code, message) {
  var error = new Error(message);
  error.code = code;
  return error;
}