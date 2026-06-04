// ==========================================
// CONFIGURACIÓN GENERAL
// ==========================================
// Hoja Colaboradores:
// A = Nombre | B = RUT | C = PIN | D = Local
//
// Hoja RegistroAsistencia:
// A = Fecha/Hora | B = Nombre | C = RUT | D = Local | E = Acción
// ==========================================


function doGet(e) {
  var params = e.parameter || {};
  var accion = params.accion;

  if (accion === "UsuariosPorRol") {
    return obtenerUsuariosPorRol(params);
  }

  if (accion === "UltimoRegistro") {
    return consultarUltimoRegistro(params);
  }

  if (accion === "TurnosAbiertos") {
    try {
      requireAdminSession(params);
      return obtenerTurnosAbiertos(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "TurnosAbiertosPublico") {
    return obtenerTurnosAbiertosPublico(params);
  }

  if (accion === "EliminarTurno") {
    try {
      requireAdminSession(params);
      return eliminarTurnoProgramado(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "ColaboradoresPorLocal") {
    try {
      requireAdminSession(params);
      return obtenerColaboradoresPorLocalTurnos(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "HorarioLocal") {
    try {
      requireAdminSession(params);
      return obtenerHorarioAplicable(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "TurnosSemana") {
    try {
      requireAdminSession(params);
      return obtenerTurnosSemana(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "TurnosSemanaColaborador") {
    try {
      requireColaboradorSession(params);
      return obtenerTurnosSemanaColaborador(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "CopiarSemana") {
    try {
      requireAdminSession(params);
      return copiarSemanaAnterior(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "Version") {
    return versionSistema();
  }

  if (accion === "PlantillasTurnos") {
    try {
      requireAdminSession(params);
      return obtenerPlantillasTurnos(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "TestVentasSheet") {
    try {
      return testVentasSheet(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  return obtenerColaboradoresPorLocal(params);
}

function doPost(e) {
  var params = e.parameter || {};
  var accion = params.accion;

  if (accion === "LoginPorSeleccion") {
    return loginPorSeleccion(params);
  }

  if (accion === "ValidarSesion") {
    return validarSesion(params);
  }

  if (accion === "Logout") {
    return logoutSesion(params);
  }

  if (accion === "UltimoRegistro") {
    return consultarUltimoRegistro(params);
  }

  if (accion === "Ingreso" || accion === "Salida") {
    return registrarAsistencia(params);
  }

  if (accion === "GuardarTurno") {
    try {
      requireAdminSession(params);
      return guardarTurnoProgramado(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "CopiarSemanaAnterior") {
    try {
      requireAdminSession(params);
      return copiarSemanaAnterior(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  return responderJSON({
    status: "ERROR_ACCION",
    mensaje: "Acción no reconocida."
  });
}


// Obtener lista de trabajadores por local
function obtenerColaboradoresPorLocal(params) {
  var localSolicitado = params.local;
  var sheetColab = getSheet_("Colaboradores", SPREADSHEET_KEY_RRHH);
  var datos = sheetColab.getDataRange().getValues();
  var colaboradoresFiltrados = [];

  for (var i = 1; i < datos.length; i++) {
    var nombre = datos[i][0];
    var localTrabajador = datos[i][3];

    if (normalizarTexto(localTrabajador) === normalizarTexto(localSolicitado)) {
      colaboradoresFiltrados.push(nombre);
    }
  }

  return responderJSON({
    empleados: colaboradoresFiltrados.sort()
  });
}


// Detección anti doble-marcación
function obtenerUltimoRegistroPorNombre(nombre) {
  var sheetRegistroAsistencia = getSheet_("RegistroAsistencia", SPREADSHEET_KEY_RRHH);

  var datos = sheetRegistroAsistencia.getDataRange().getValues();
  var nombreBuscado = normalizarTexto(nombre);

  for (var i = datos.length - 1; i >= 1; i--) {
    var fechaHora = datos[i][0];
    var nombreRegistro = datos[i][1];
    var rutRegistro = datos[i][2];
    var localRegistro = datos[i][3];
    var accionRegistro = datos[i][4];

    if (normalizarTexto(nombreRegistro) === nombreBuscado) {
      return {
        encontrado: true,
        fechaHora: fechaHora,
        nombre: nombreRegistro,
        rut: rutRegistro,
        local: localRegistro,
        accion: accionRegistro
      };
    }
  }

  return {
    encontrado: false
  };
}


// Registrar ingreso o salida
function registrarAsistencia(params) {
  var nombre = params.nombre;
  var pinIngresado = params.pin;
  var local = params.local;
  var accion = params.accion;
  var fechaHora = new Date();

  if (!nombre || !pinIngresado || !local || !accion) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Faltan datos para registrar asistencia."
    });
  }

  var validacion = verificarColaborador(nombre, pinIngresado);

  if (!validacion.valido) {
    return responderJSON({
      status: "ERROR_PIN",
      mensaje: "Código PIN incorrecto."
    });
  }

  var ultimoRegistro = obtenerUltimoRegistroPorNombre(nombre);

  if (!ultimoRegistro.encontrado && accion === "Salida") {
    return responderJSON({
      status: "ERROR_SECUENCIA",
      mensaje: "No puedes marcar salida sin un ingreso previo."
    });
  }

  if (ultimoRegistro.encontrado && ultimoRegistro.accion === accion) {
    return responderJSON({
      status: "ERROR_SECUENCIA",
      mensaje: "Ya tienes registrada una marca de " + accion + ". Debes marcar la acción contraria antes de volver a marcar " + accion + ".",
      ultimaAccion: ultimoRegistro.accion,
      ultimaFechaHora: formatearFechaHora(ultimoRegistro.fechaHora),
      ultimoLocal: ultimoRegistro.local
    });
  }

  var sheetRegistroAsistencia = getSheet_("RegistroAsistencia", SPREADSHEET_KEY_RRHH);

  sheetRegistroAsistencia.appendRow([
    fechaHora,
    nombre,
    validacion.rut,
    local,
    accion
  ]);

  return responderJSON({
    status: "SUCCESS",
    mensaje: accion + " registrado correctamente.",
    nombre: nombre,
    rut: validacion.rut,
    local: local,
    accion: accion,
    fechaHora: formatearFechaHora(fechaHora)
  });
}


// Consultar último registro
function consultarUltimoRegistro(params) {
  var nombre = params.nombre;
  var pinIngresado = params.pin;

  if (!nombre || !pinIngresado) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes seleccionar tu nombre e ingresar tu PIN."
    });
  }

  // Primero valida identidad con nombre + PIN
  var validacion = verificarColaborador(nombre, pinIngresado);

  if (!validacion.valido) {
    return responderJSON({
      status: "ERROR_PIN",
      mensaje: "Código PIN incorrecto."
    });
  }

  // Luego busca el último registro SOLO por nombre
  var nombreBuscado = normalizarTexto(nombre);

  var sheetRegistroAsistencia = getSheet_("RegistroAsistencia", SPREADSHEET_KEY_RRHH);

  var datos = sheetRegistroAsistencia.getDataRange().getValues();

  for (var i = datos.length - 1; i >= 1; i--) {
    var fechaHora = datos[i][0];       // Columna A
    var nombreRegistro = datos[i][1];  // Columna B
    var rutRegistro = datos[i][2];     // Columna C
    var localRegistro = datos[i][3];   // Columna D
    var accionRegistro = datos[i][4];  // Columna E

    if (normalizarTexto(nombreRegistro) === nombreBuscado) {
      return responderJSON({
        status: "SUCCESS",
        encontrado: true,
        nombre: nombreRegistro,
        rut: rutRegistro,
        local: localRegistro,
        accion: accionRegistro,
        fechaHora: formatearFechaHora(fechaHora),
        mensaje: "Último registro encontrado."
      });
    }
  }

  return responderJSON({
    status: "SUCCESS",
    encontrado: false,
    nombre: nombre,
    mensaje: "No se encontraron registros anteriores para este trabajador."
  });
}


// Validar trabajador con nombre + PIN
function verificarColaborador(nombre, pin) {
  var sheetColab = getSheet_("Colaboradores", SPREADSHEET_KEY_RRHH);

  var datos = sheetColab.getDataRange().getValues();
  var nombreNormalizado = normalizarTexto(nombre);
  var pinNormalizado = pin.toString().trim();

  for (var i = 1; i < datos.length; i++) {
    var nombreColaborador = normalizarTexto(datos[i][0]);
    var rutColaborador = datos[i][1];
    var pinColaborador = datos[i][2].toString().trim();

    if (nombreColaborador === nombreNormalizado) {
      if (pinColaborador === pinNormalizado) {
        return {
          valido: true,
          rut: rutColaborador
        };
      }

      return {
        valido: false,
        rut: ""
      };
    }
  }

  return {
    valido: false,
    rut: ""
  };
}


// Formatear fecha y hora
function formatearFechaHora(fecha) {
  return Utilities.formatDate(
    new Date(fecha),
    Session.getScriptTimeZone(),
    "dd-MM-yyyy HH:mm:ss"
  );
}


// Respuesta JSON estándar
function responderJSON(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}


// Normalizar textos para evitar errores por espacios, tildes o mayúsculas
function normalizarTexto(valor) {
  if (valor === null || valor === undefined) return "";

  return valor
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
