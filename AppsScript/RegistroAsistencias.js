// ==========================================
// CONFIGURACIÓN GENERAL
// ==========================================
// Hoja Colaboradores:
// A = Nombre | B = RUT | C = PIN | D = Local
//
// Hoja RegistroAsistencia:
// A = Fecha/Hora | B = Nombre | C = RUT | D = Local | E = Acción
// ==========================================

const HOJA_ASISTENCIA_PUBLICA_CACHE = "AsistenciaPublicaCache";
const ASISTENCIA_PUBLICA_CACHE_HEADERS = [
  "tipo",
  "local",
  "payload_json",
  "updated_at"
];
const ASISTENCIA_PUBLICA_TTL_SEGUNDOS = 180;


function doGet(e) {
  var params = e.parameter || {};
  var accion = params.accion;

  function responderErrorAccion_(error, fallbackMessage) {
    var status = String((error && error.code) || "").trim() || "ERROR";
    return responderJSON({
      status: status,
      mensaje: (error && error.message) || fallbackMessage || "No se pudo completar la solicitud."
    });
  }

  if (accion === "UsuariosPorRol") {
    return obtenerUsuariosPorRol(params);
  }

  if (accion === "UltimoRegistro") {
    return consultarUltimoRegistro(params);
  }

  if (accion === "TurnosAbiertos") {
    try {
      requireTurnosAbiertosSession(params);
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
      requireEliminarTurnosSession(params);
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
      requireColaboradoresLocalSession(params);
      return obtenerColaboradoresPorLocalTurnos(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "BootstrapProgramadorTurnos") {
    try {
      return bootstrapProgramadorTurnos(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "HorarioLocal") {
    try {
      requireProgramadorSession(params);
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
      requireProgramadorSession(params);
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
      requireCopiarSemanasSession(params);
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

  if (accion === "LocalesPorSesion") {
    try {
      return obtenerLocalesPorSesion(params);
    } catch (error) {
      return responderErrorAccion_(error, "No se pudieron cargar los locales disponibles.");
    }
  }

  if (accion === "PlantillasTurnos") {
    try {
      requirePlantillasTurnosSession(params);
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

  if (accion === "ConsultarImportacionesVentas") {
    try {
      return consultarImportacionesVentas(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "ConsultarImportacionActivaVentas") {
    try {
      return consultarImportacionActivaVentas(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "LocalesPagosMensuales") {
    try {
      requireAdminSession(params);
      return obtenerLocalesPagosMensuales(params);
    } catch (error) {
      return responderErrorAccion_(error, "No se pudieron cargar los locales exportables.");
    }
  }

  if (accion === "ConsultarPagosMensuales") {
    try {
      requireAdminSession(params);
      return consultarPagosMensuales(params);
    } catch (error) {
      return responderErrorAccion_(error, "No se pudo consultar el detalle mensual exportable.");
    }
  }

  if (accion === "AuditarPresenciaVentas") {
    try {
      return auditarPresenciaVentas(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "AuditarRegistroAsistenciaRaw") {
    try {
      return auditarRegistroAsistenciaRaw(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "BootstrapGestionUsuarios") {
    try {
      return bootstrapGestionUsuarios(params);
    } catch (error) {
      return responderErrorAccion_(error, "No se pudo cargar la gestión de usuarios.");
    }
  }

  if (accion === "AuditarDuplicadosUsuariosAdmin") {
    try {
      return auditarDuplicadosUsuariosAdmin(params);
    } catch (error) {
      return responderErrorAccion_(error, "No se pudieron revisar los duplicados.");
    }
  }

  if (accion === "BootstrapAdministracionLocales") {
    try {
      return bootstrapAdministracionLocales(params);
    } catch (error) {
      return responderErrorAccion_(error, "No se pudo cargar la administracion de locales.");
    }
  }

  if (accion === "BootstrapAdministracionHorarios") {
    try {
      return bootstrapAdministracionHorarios(params);
    } catch (error) {
      return responderErrorAccion_(error, "No se pudo cargar la administración de horarios.");
    }
  }

  return obtenerColaboradoresPorLocal(params);
}

function doPost(e) {
  var params;

  try {
    params = obtenerParametrosPost_(e);
  } catch (error) {
    return responderJSON({
      status: "ERROR_JSON",
      mensaje: error.message || "No se pudo interpretar el body JSON."
    });
  }

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
      requireProgramadorSession(params);
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
      requireCopiarSemanasSession(params);
      return copiarSemanaAnterior(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "ImportarVentas") {
    try {
      return importarVentas(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "ERROR_IMPORTACION",
        mensaje: error.message || "No se pudo importar ventas."
      });
    }
  }

  if (accion === "RecalcularComisiones") {
    try {
      return recalcularComisiones(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "ERROR_RECALCULO",
        mensaje: error.message || "No se pudo recalcular comisiones."
      });
    }
  }

  if (accion === "RegistrarAsistenciaAdmin") {
    try {
      requireAdminSession(params);
      return registrarAsistenciaAdmin(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "Acceso no autorizado."
      });
    }
  }

  if (accion === "ActualizarRolUsuarioAdmin") {
    try {
      return actualizarRolUsuarioAdmin(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "No se pudo actualizar el rol del usuario."
      });
    }
  }

  if (accion === "ActualizarUsuarioAdmin") {
    try {
      return actualizarUsuarioAdmin(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "No se pudo actualizar el usuario."
      });
    }
  }

  if (accion === "CrearUsuarioAdmin") {
    try {
      return crearUsuarioAdmin(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "No se pudo crear el usuario."
      });
    }
  }

  if (accion === "CambiarEstadoUsuarioAdmin") {
    try {
      return cambiarEstadoUsuarioAdmin(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "No se pudo cambiar el estado del usuario."
      });
    }
  }

  if (accion === "EliminarUsuarioAdmin") {
    try {
      return eliminarUsuarioAdmin(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "No se pudo eliminar el usuario."
      });
    }
  }

  if (accion === "MigrarUsuariosUnicosAdmin") {
    try {
      return migrarUsuariosUnicosAdmin(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "No se pudo migrar a usuarios unicos."
      });
    }
  }

  if (accion === "AuditarDuplicadosUsuariosAdmin") {
    try {
      return auditarDuplicadosUsuariosAdmin(params);
    } catch (error) {
      return responderJSON({ status: error.code || "FORBIDDEN", mensaje: error.message || "No se pudo auditar duplicados." });
    }
  }

  if (accion === "ConsolidarDuplicadosUsuariosAdmin") {
    try {
      return consolidarDuplicadosUsuariosAdmin(params);
    } catch (error) {
      return responderJSON({ status: error.code || "FORBIDDEN", mensaje: error.message || "No se pudo consolidar el grupo." });
    }
  }

  if (accion === "ActualizarPermisosRolAdmin") {
    try {
      return actualizarPermisosRolAdmin(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "No se pudieron actualizar los permisos del rol."
      });
    }
  }

  if (accion === "GuardarLocalAdmin") {
    try {
      return guardarLocalAdmin(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "No se pudo guardar el local."
      });
    }
  }

  if (accion === "DesactivarLocalAdmin") {
    try {
      return desactivarLocalAdmin(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "No se pudo desactivar el local."
      });
    }
  }

  if (accion === "GuardarHorarioLocalAdmin") {
    try {
      return guardarHorarioLocalAdmin(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "No se pudo guardar el horario local."
      });
    }
  }

  if (accion === "EliminarHorarioLocalAdmin") {
    try {
      return eliminarHorarioLocalAdmin(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "No se pudo eliminar el horario local."
      });
    }
  }

  if (accion === "GuardarHorarioEspecialLocalAdmin") {
    try {
      return guardarHorarioEspecialLocalAdmin(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "No se pudo guardar el horario especial."
      });
    }
  }

  if (accion === "EliminarHorarioEspecialLocalAdmin") {
    try {
      return eliminarHorarioEspecialLocalAdmin(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "No se pudo eliminar el horario especial."
      });
    }
  }

  if (accion === "GuardarFeriadoAdmin") {
    try {
      return guardarFeriadoAdmin(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "No se pudo guardar el feriado."
      });
    }
  }

  if (accion === "EliminarFeriadoAdmin") {
    try {
      return eliminarFeriadoAdmin(params);
    } catch (error) {
      return responderJSON({
        status: error.code || "FORBIDDEN",
        mensaje: error.message || "No se pudo eliminar el feriado."
      });
    }
  }

  return responderJSON({
    status: "ERROR_ACCION",
    mensaje: "Acción no reconocida."
  });
}

function obtenerParametrosPost_(e) {
  var params = {};
  var parameter = (e && e.parameter) || {};

  Object.keys(parameter).forEach(function(key) {
    params[key] = parameter[key];
  });

  var postData = e && e.postData;
  var contents = postData && typeof postData.contents === "string"
    ? postData.contents.trim()
    : "";

  if (!contents) {
    return params;
  }

  var mimeType = String((postData && postData.type) || "").toLowerCase();
  var pareceJson = mimeType.indexOf("json") !== -1 || contents[0] === "{";

  if (!pareceJson) {
    return params;
  }

  var body = JSON.parse(contents);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("El body JSON debe ser un objeto.");
  }

  Object.keys(body).forEach(function(key) {
    params[key] = body[key];
  });

  return params;
}

function getAsistenciaPublicaCacheSheet_() {
  return getOrCreateSheet_(
    HOJA_ASISTENCIA_PUBLICA_CACHE,
    SPREADSHEET_KEY_RRHH,
    ASISTENCIA_PUBLICA_CACHE_HEADERS
  );
}

function buildAsistenciaPublicaSheetCacheKey_(type, local) {
  return [
    String(type || "").trim(),
    normalizarTexto(local)
  ].join("::");
}

function buildAsistenciaPublicaScriptCacheKey_(type, localNormalizado) {
  return "lv:asistencia:public:" + String(type || "").trim() + ":" + String(localNormalizado || "").trim();
}

function readAsistenciaPublicaMaterialized_(type, local) {
  var localNormalizado = normalizarTexto(local);
  if (!localNormalizado) return null;

  var sheet = getAsistenciaPublicaCacheSheet_();
  var data = sheet.getDataRange().getValues();
  var targetKey = buildAsistenciaPublicaSheetCacheKey_(type, local);

  for (var i = 1; i < data.length; i++) {
    var rowType = String(data[i][0] || "").trim();
    var rowLocal = String(data[i][1] || "").trim();
    if (buildAsistenciaPublicaSheetCacheKey_(rowType, rowLocal) !== targetKey) continue;

    try {
      var payload = JSON.parse(String(data[i][2] || "").trim() || "null");
      return payload && typeof payload === "object" ? payload : null;
    } catch (error) {
      return null;
    }
  }

  return null;
}

function writeAsistenciaPublicaMaterialized_(type, local, payload) {
  var localNormalizado = normalizarTexto(local);
  if (!localNormalizado) return;

  var sheet = getAsistenciaPublicaCacheSheet_();
  var data = sheet.getDataRange().getValues();
  var targetKey = buildAsistenciaPublicaSheetCacheKey_(type, local);
  var rowNumber = 0;

  for (var i = 1; i < data.length; i++) {
    var rowType = String(data[i][0] || "").trim();
    var rowLocal = String(data[i][1] || "").trim();
    if (buildAsistenciaPublicaSheetCacheKey_(rowType, rowLocal) === targetKey) {
      rowNumber = i + 1;
      break;
    }
  }

  var values = [[
    String(type || "").trim(),
    String(local || "").trim(),
    JSON.stringify(payload || {}),
    new Date()
  ]];

  if (rowNumber) {
    sheet.getRange(rowNumber, 1, 1, ASISTENCIA_PUBLICA_CACHE_HEADERS.length).setValues(values);
    return;
  }

  sheet.getRange(sheet.getLastRow() + 1, 1, 1, ASISTENCIA_PUBLICA_CACHE_HEADERS.length).setValues(values);
}

function readAsistenciaPublicaCachedPayload_(type, local) {
  var localNormalizado = normalizarTexto(local);
  if (!localNormalizado) return null;

  var scriptCache = null;
  var scriptCacheKey = buildAsistenciaPublicaScriptCacheKey_(type, localNormalizado);

  try {
    scriptCache = CacheService.getScriptCache();
    var cachedPayload = scriptCache.get(scriptCacheKey);
    if (cachedPayload) {
      var parsedCached = JSON.parse(cachedPayload);
      if (parsedCached && typeof parsedCached === "object") {
        return parsedCached;
      }
    }
  } catch (error) {}

  var materializedPayload = null;
  try {
    materializedPayload = readAsistenciaPublicaMaterialized_(type, local);
  } catch (error) {
    materializedPayload = null;
  }

  if (!materializedPayload) return null;

  try {
    if (scriptCache) {
      scriptCache.put(
        scriptCacheKey,
        JSON.stringify(materializedPayload),
        ASISTENCIA_PUBLICA_TTL_SEGUNDOS
      );
    }
  } catch (error) {}

  return materializedPayload;
}

function writeAsistenciaPublicaCachedPayload_(type, local, payload) {
  var localNormalizado = normalizarTexto(local);
  if (!localNormalizado) return;

  try {
    writeAsistenciaPublicaMaterialized_(type, local, payload);
  } catch (error) {}

  try {
    CacheService
      .getScriptCache()
      .put(
        buildAsistenciaPublicaScriptCacheKey_(type, localNormalizado),
        JSON.stringify(payload || {}),
        ASISTENCIA_PUBLICA_TTL_SEGUNDOS
      );
  } catch (error) {}
}

function collectAttendanceLocalNamesFromRecord_(record) {
  if (!record || isRole_(record.rol, USER_TYPES.ADMINISTRADOR.id)) return [];

  var dedupe = {};
  var locals = [];

  function addLocal(localName) {
    var localNormalizado = normalizarTexto(localName);
    if (!localNormalizado || dedupe[localNormalizado]) return;
    dedupe[localNormalizado] = true;
    locals.push(String(localName || "").trim());
  }

  parseLocalScope_(record.local).forEach(addLocal);

  try {
    resolveAssignedLocalsForUserRecord_(record).forEach(addLocal);
  } catch (error) {}

  return locals;
}

function refreshAttendancePublicEmployeesForLocals_(locals) {
  var dedupe = {};

  (locals || []).forEach(function(localName) {
    var localNormalizado = normalizarTexto(localName);
    if (!localNormalizado || dedupe[localNormalizado]) return;
    dedupe[localNormalizado] = true;

    writeAsistenciaPublicaCachedPayload_(
      "empleados",
      localName,
      buildAttendancePublicEmployeesPayload_(localName)
    );
  });
}

function refreshAttendancePublicEmployeesForRecords_(records) {
  var locals = [];
  (records || []).forEach(function(record) {
    collectAttendanceLocalNamesFromRecord_(record).forEach(function(localName) {
      locals.push(localName);
    });
  });
  refreshAttendancePublicEmployeesForLocals_(locals);
}

function refreshOpenShiftsPublicForLocal_(local) {
  if (!normalizarTexto(local)) return;
  writeAsistenciaPublicaCachedPayload_(
    "turnos_abiertos",
    local,
    construirRespuestaTurnosAbiertosRaw_(local)
  );
}

function buildAttendancePublicEmployeesPayload_(local) {
  return {
    empleados: listarUsuariosAsistenciaPorLocal_(local)
  };
}


// Obtener lista de trabajadores por local
function obtenerColaboradoresPorLocal(params) {
  var localSolicitado = params.local;
  var localNormalizado = normalizarTexto(localSolicitado);

  if (!localNormalizado) {
    return responderJSON({
      empleados: []
    });
  }

  var payload = readAsistenciaPublicaCachedPayload_("empleados", localSolicitado);
  if (!payload || !Array.isArray(payload.empleados)) {
    payload = buildAttendancePublicEmployeesPayload_(localSolicitado);
    writeAsistenciaPublicaCachedPayload_("empleados", localSolicitado, payload);
  }

  return responderJSON(payload);
}

function isAttendanceEligibleRole_(role) {
  return isRole_(role, USER_TYPES.COLABORADOR.id) || isRole_(role, USER_TYPES.SUPERVISOR.id);
}

function listStructuredAssignmentsForAttendanceUser_(record) {
  var context = null;

  try {
    ensureUsuariosLocalesSheetReady_();
    context = getUsuariosLocalesSheetContext_();
  } catch (error) {
    context = null;
  }

  if (!context || !context.data || !context.data.length) {
    return [];
  }

  var principalKey = buildSessionPrincipalKey_(record, record.rol);
  var assignments = [];

  for (var i = 1; i < context.data.length; i++) {
    var assignment = buildUserLocalRecordFromSheetRow_(context.data[i], context.headerMap, i + 1);
    if (!assignment.activo || !assignment.localNombre) continue;

    var sameUserById = assignment.idUsuario && record.idUsuario
      && normalizarTexto(assignment.idUsuario) === normalizarTexto(record.idUsuario);
    var sameUserByLogin = assignment.usuarioLogin && record.usuarioLogin
      && normalizarTexto(assignment.usuarioLogin) === normalizarTexto(record.usuarioLogin);
    var samePrincipal = buildSessionPrincipalKey_(assignment, assignment.rol) === principalKey;

    if (!sameUserById && !sameUserByLogin && !samePrincipal) continue;
    assignments.push(assignment);
  }

  assignments.sort(function(a, b) {
    return String(a.localNombre || "").localeCompare(String(b.localNombre || ""), "es");
  });

  return assignments;
}

function listAttendanceAssignedLocalsForUser_(record) {
  return resolveAssignedLocalsForUserRecord_(record);
}

function listModernAttendanceUsers_() {
  var context = getUsuariosSheetContext_();
  if (!context) {
    throw new Error('No se encontró la hoja "Usuarios" para resolver asistencia.');
  }

  var assignmentIndex = null;
  try {
    ensureUsuariosLocalesSheetReady_();
    assignmentIndex = buildActiveAssignmentIndexByPrincipal_(getUsuariosLocalesSheetContext_());
  } catch (error) {
    assignmentIndex = null;
  }

  var users = [];
  var dedupe = {};

  for (var i = 1; i < context.data.length; i++) {
    var record = buildUserRecordFromModernRow_(context.data[i], context.indices);
    if (!record.activo || !record.nombreCompleto || !isAttendanceEligibleRole_(record.rol)) continue;

    var principalKey = buildSessionPrincipalKey_(record, record.rol);
    if (!principalKey || dedupe[principalKey]) continue;
    dedupe[principalKey] = true;

    users.push({
      idUsuario: record.idUsuario,
      principalKey: principalKey,
      nombre: record.nombreCompleto,
      usuarioLogin: record.usuarioLogin,
      pin: record.pin,
      rol: record.rol,
      locales: resolveAssignedLocalsForUserRecord_(record, assignmentIndex)
    });
  }

  return users;
}

function listarUsuariosAsistenciaPorLocal_(local) {
  var localNormalizado = normalizarTexto(local);
  if (!localNormalizado) return [];

  var nombres = [];
  var dedupe = {};

  function buildAttendanceNameKey_(value) {
    return normalizarTexto(
      String(value || "")
        .replace(/\s+/g, " ")
        .replace(/\u00A0/g, " ")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
    );
  }

  listModernAttendanceUsers_().forEach(function(user) {
    var tieneLocal = user.locales.some(function(localAsignado) {
      return normalizarTexto(localAsignado) === localNormalizado;
    });

    if (tieneLocal) {
      var nombreKey = buildAttendanceNameKey_(user.nombre);
      if (!nombreKey || dedupe[nombreKey]) return;
      dedupe[nombreKey] = true;
      nombres.push(String(user.nombre || "").replace(/\s+/g, " ").trim());
    }
  });

  nombres.sort(function(a, b) {
    return a.localeCompare(b, "es");
  });

  return nombres;
}

function buscarUsuarioAsistenciaPorNombrePinYLocal_(nombreOUsuario, pin, local) {
  var identidad = normalizarTexto(nombreOUsuario);
  var localNormalizado = normalizarTexto(local);
  var pinNormalizado = String(pin || "").trim();

  if (!identidad || !pinNormalizado || !localNormalizado) return null;

  var users = listModernAttendanceUsers_();
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    if (String(user.pin || "").trim() !== pinNormalizado) continue;

    var matchesIdentity =
      normalizarTexto(user.nombre) === identidad ||
      normalizarTexto(user.usuarioLogin) === identidad;
    if (!matchesIdentity) continue;

    var matchesLocal = user.locales.some(function(localAsignado) {
      return normalizarTexto(localAsignado) === localNormalizado;
    });
    if (!matchesLocal) continue;

    return {
      idUsuario: user.idUsuario,
      principalKey: user.principalKey,
      nombre: user.nombre,
      rut: "",
      local: local,
      rol: user.rol
    };
  }

  return null;
}

function buscarUsuarioAsistenciaPorNombreYLocal_(nombreOUsuario, local) {
  var identidad = normalizarTexto(nombreOUsuario);
  var localNormalizado = normalizarTexto(local);

  if (!identidad || !localNormalizado) return null;

  var users = listModernAttendanceUsers_();
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    var matchesIdentity =
      normalizarTexto(user.nombre) === identidad ||
      normalizarTexto(user.usuarioLogin) === identidad;
    if (!matchesIdentity) continue;

    var matchesLocal = user.locales.some(function(localAsignado) {
      return normalizarTexto(localAsignado) === localNormalizado;
    });
    if (!matchesLocal) continue;

    return {
      idUsuario: user.idUsuario,
      principalKey: user.principalKey,
      nombre: user.nombre,
      rut: "",
      local: local,
      rol: user.rol
    };
  }

  return null;
}

function validarSecuenciaAsistencia_(accion, localSolicitado, ultimoRegistro) {
  var accionNormalizada = normalizarTexto(accion);
  var localNormalizado = normalizarTexto(localSolicitado);
  var ultimoLocalNormalizado = normalizarTexto(ultimoRegistro && ultimoRegistro.local);

  if (!ultimoRegistro || !ultimoRegistro.encontrado) {
    if (accionNormalizada === "salida") {
      return {
        ok: false,
        payload: {
          status: "ERROR_SECUENCIA",
          mensaje: "No puedes marcar salida sin un ingreso previo."
        }
      };
    }

    return { ok: true };
  }

  var ultimaAccionNormalizada = normalizarTexto(ultimoRegistro.accion);

  if (accionNormalizada === "ingreso" && ultimaAccionNormalizada === "ingreso") {
    var mensajeIngreso = ultimoLocalNormalizado && ultimoLocalNormalizado !== localNormalizado
      ? 'Tienes un turno abierto en "' + ultimoRegistro.local + '". Debes cerrarlo antes de marcar ingreso en otro local.'
      : "Ya tienes registrada una marca de Ingreso. Debes marcar salida antes de volver a ingresar.";

    return {
      ok: false,
      payload: {
        status: "ERROR_SECUENCIA",
        mensaje: mensajeIngreso,
        ultimaAccion: ultimoRegistro.accion,
        ultimaFechaHora: formatearFechaHora(ultimoRegistro.fechaHora),
        ultimoLocal: ultimoRegistro.local
      }
    };
  }

  if (accionNormalizada === "salida") {
    if (ultimaAccionNormalizada === "salida") {
      return {
        ok: false,
        payload: {
          status: "ERROR_SECUENCIA",
          mensaje: "Ya tienes registrada una marca de Salida. Debes marcar Ingreso antes de volver a salir.",
          ultimaAccion: ultimoRegistro.accion,
          ultimaFechaHora: formatearFechaHora(ultimoRegistro.fechaHora),
          ultimoLocal: ultimoRegistro.local
        }
      };
    }

    if (ultimoLocalNormalizado && ultimoLocalNormalizado !== localNormalizado) {
      return {
        ok: false,
        payload: {
          status: "ERROR_LOCAL_ABIERTO",
          mensaje: 'Tu turno abierto pertenece a "' + ultimoRegistro.local + '". Debes cerrarlo en ese mismo local.',
          ultimaAccion: ultimoRegistro.accion,
          ultimaFechaHora: formatearFechaHora(ultimoRegistro.fechaHora),
          ultimoLocal: ultimoRegistro.local
        }
      };
    }
  }

  return { ok: true };
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

  var validacion = verificarColaborador(nombre, pinIngresado, local);

  if (!validacion.valido) {
    return responderJSON({
      status: "ERROR_PIN",
      mensaje: "Código PIN incorrecto."
    });
  }

  var ultimoRegistro = obtenerUltimoRegistroPorNombre(validacion.nombre);
  var validacionSecuencia = validarSecuenciaAsistencia_(accion, local, ultimoRegistro);

  if (!validacionSecuencia.ok) {
    return responderJSON(validacionSecuencia.payload);
  }

  var sheetRegistroAsistencia = getSheet_("RegistroAsistencia", SPREADSHEET_KEY_RRHH);

  sheetRegistroAsistencia.appendRow([
    fechaHora,
    validacion.nombre,
    validacion.rut,
    validacion.local,
    accion
  ]);

  refreshOpenShiftsPublicForLocal_(validacion.local);

  return responderJSON({
    status: "SUCCESS",
    mensaje: accion + " registrado correctamente.",
    nombre: validacion.nombre,
    rut: validacion.rut,
    local: validacion.local,
    accion: accion,
    fechaHora: formatearFechaHora(fechaHora)
  });
}

function registrarAsistenciaAdmin(params) {
  var nombre = String(params.nombre || "").trim();
  var local = String(params.local || "").trim();
  var accionTexto = String(params.tipoAccion || params.accionRegistro || params.accion || "").trim();
  var fechaHora = new Date();

  if (!nombre || !local || !accionTexto) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Faltan datos para registrar asistencia."
    });
  }

  var accionNormalizada = normalizarTexto(accionTexto);
  if (accionNormalizada !== "ingreso" && accionNormalizada !== "salida") {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "La acción debe ser Ingreso o Salida."
    });
  }

  var colaborador = buscarColaboradorPorNombreYLocal_(nombre, local);

  if (!colaborador) {
    return responderJSON({
      status: "ERROR_COLABORADOR",
      mensaje: "No se encontró un colaborador con ese nombre en el local indicado."
    });
  }

  var accion = accionNormalizada === "ingreso" ? "Ingreso" : "Salida";
  var ultimoRegistro = obtenerUltimoRegistroPorNombre(colaborador.nombre);
  var validacionSecuencia = validarSecuenciaAsistencia_(accion, colaborador.local, ultimoRegistro);

  if (!validacionSecuencia.ok) {
    return responderJSON(validacionSecuencia.payload);
  }

  var sheetRegistroAsistencia = getSheet_("RegistroAsistencia", SPREADSHEET_KEY_RRHH);

  sheetRegistroAsistencia.appendRow([
    fechaHora,
    colaborador.nombre,
    colaborador.rut,
    colaborador.local,
    accion
  ]);

  refreshOpenShiftsPublicForLocal_(colaborador.local);

  return responderJSON({
    status: "SUCCESS",
    mensaje: accion + " registrado correctamente por administración.",
    nombre: colaborador.nombre,
    rut: colaborador.rut,
    local: colaborador.local,
    accion: accion,
    fechaHora: formatearFechaHora(fechaHora)
  });
}


// Consultar último registro
function consultarUltimoRegistro(params) {
  var nombre = params.nombre;
  var pinIngresado = params.pin;
  var local = String(params.local || "").trim();

  if (!nombre || !pinIngresado || !local) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes seleccionar tu nombre, indicar tu local e ingresar tu PIN."
    });
  }

  // Primero valida identidad con nombre + PIN
  var validacion = verificarColaborador(nombre, pinIngresado, local);

  if (!validacion.valido) {
    return responderJSON({
      status: "ERROR_PIN",
      mensaje: "Código PIN incorrecto."
    });
  }

  // Luego busca el último registro SOLO por nombre
  var nombreBuscado = normalizarTexto(validacion.nombre || nombre);

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
    nombre: validacion.nombre || nombre,
    mensaje: "No se encontraron registros anteriores para este trabajador."
  });
}


// Validar trabajador con nombre + PIN
function verificarColaborador(nombre, pin) {
  var local = arguments.length > 2 ? arguments[2] : "";
  var usuario = buscarUsuarioAsistenciaPorNombrePinYLocal_(nombre, pin, local);

  if (usuario) {
    return {
      valido: true,
      nombre: usuario.nombre,
      rut: usuario.rut,
      local: usuario.local,
      rol: usuario.rol
    };
  }

  return {
    valido: false,
    nombre: "",
    rut: "",
    local: ""
  };
}

function buscarColaboradorPorNombreYLocal_(nombre, local) {
  return buscarUsuarioAsistenciaPorNombreYLocal_(nombre, local);
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
