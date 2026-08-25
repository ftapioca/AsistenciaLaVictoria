const USER_TYPES = {
  ADMINISTRADOR: {
    id: "Administrador",
    exposesUserList: false,
    credentialMode: "username",
    legacySheetName: "Administradores",
    legacyCredentialColumnIndex: 1,
    legacyPinColumnIndex: 2
  },
  SUPERVISOR: {
    id: "Supervisor",
    exposesUserList: false,
    credentialMode: "username"
  },
  COLABORADOR: {
    id: "Colaborador",
    exposesUserList: true,
    credentialMode: "directory",
    legacySheetName: "Colaboradores",
    legacyCredentialColumnIndex: 0,
    legacyPinColumnIndex: 2
  }
};

const ROLE_PERMISSIONS_FALLBACK = {
  Administrador: {
    puede_ingresar_panel_admin: true,
    puede_ver_mis_turnos: true,
    puede_programar_turnos: true,
    puede_ver_turnos_abiertos: true,
    puede_registrar_asistencia_admin: true,
    puede_ver_colaboradores_local: true,
    puede_importar_ventas: true,
    puede_ver_pagos: true,
    puede_gestionar_plantillas_turnos: true,
    puede_copiar_semanas: true,
    puede_eliminar_turnos: true
  },
  Supervisor: {
    puede_ingresar_panel_admin: false,
    puede_ver_mis_turnos: true,
    puede_programar_turnos: true,
    puede_ver_turnos_abiertos: true,
    puede_registrar_asistencia_admin: false,
    puede_ver_colaboradores_local: true,
    puede_importar_ventas: false,
    puede_ver_pagos: false,
    puede_gestionar_plantillas_turnos: true,
    puede_copiar_semanas: true,
    puede_eliminar_turnos: false
  },
  Colaborador: {
    puede_ingresar_panel_admin: false,
    puede_ver_mis_turnos: true,
    puede_programar_turnos: false,
    puede_ver_turnos_abiertos: false,
    puede_registrar_asistencia_admin: false,
    puede_ver_colaboradores_local: false,
    puede_importar_ventas: false,
    puede_ver_pagos: false,
    puede_gestionar_plantillas_turnos: false,
    puede_copiar_semanas: false,
    puede_eliminar_turnos: false
  }
};

const HOJA_USUARIOS = "Usuarios";
const HOJA_USUARIOS_LOCALES = "UsuariosLocales";
const HOJA_ROLES_PERMISOS = "RolesPermisos";
const HOJA_SESIONES = "Sesiones";
const DURACION_SESION_MINUTOS = 8 * 60;
const USUARIOS_LOCALES_HEADERS = [
  "id_asignacion",
  "id_usuario",
  "usuario_login",
  "rol",
  "id_local",
  "local_nombre",
  "activo",
  "fecha_creacion",
  "observaciones"
];
const PERMISSION_KEYS = [
  "puede_ingresar_panel_admin",
  "puede_ver_mis_turnos",
  "puede_programar_turnos",
  "puede_ver_turnos_abiertos",
  "puede_registrar_asistencia_admin",
  "puede_ver_colaboradores_local",
  "puede_importar_ventas",
  "puede_ver_pagos",
  "puede_gestionar_plantillas_turnos",
  "puede_copiar_semanas",
  "puede_eliminar_turnos"
];

function getTraceId_(params) {
  return String((params && params.traceId) || (params && params.trace_id) || "").trim();
}

function withTraceResponse_(payload, params) {
  var nextPayload = {};
  Object.keys(payload || {}).forEach(function(key) {
    nextPayload[key] = payload[key];
  });

  var traceId = getTraceId_(params);
  if (traceId) {
    nextPayload.traceId = traceId;
  }

  return nextPayload;
}

function logManagedUserTrace_(traceId, step, details) {
  if (!traceId) return;
  try {
    Logger.log("[UsuariosTrace][" + traceId + "][" + step + "] " + JSON.stringify(details || {}));
  } catch (error) {
    Logger.log("[UsuariosTrace][" + traceId + "][" + step + "] No se pudo serializar detalle.");
  }
}

function getUserTypeById_(role) {
  var normalizedRole = String(role || "").trim();
  var userTypes = Object.keys(USER_TYPES).map(function(key) {
    return USER_TYPES[key];
  });

  for (var i = 0; i < userTypes.length; i++) {
    if (userTypes[i].id === normalizedRole) {
      return userTypes[i];
    }
  }

  return null;
}

function isRole_(role, expectedRole) {
  return String(role || "").trim() === String(expectedRole || "").trim();
}

function normalizeHeaderKey_(value) {
  return normalizarTexto(String(value || "").trim()).replace(/\s+/g, "_");
}

function buildHeaderIndexMap_(headers) {
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    map[normalizeHeaderKey_(headers[i])] = i;
  }
  return map;
}

function getHeaderIndex_(headerMap, candidates) {
  for (var i = 0; i < candidates.length; i++) {
    var key = normalizeHeaderKey_(candidates[i]);
    if (Object.prototype.hasOwnProperty.call(headerMap, key)) {
      return headerMap[key];
    }
  }
  return -1;
}

function parseBooleanCell_(value) {
  var normalized = normalizarTexto(value);
  return normalized === "si" || normalized === "true" || normalized === "1" || normalized === "x";
}

function parseLocalScope_(localValue) {
  return String(localValue || "")
    .split(/[;,|/]+/)
    .map(function(item) { return String(item || "").trim(); })
    .filter(function(item) { return item; });
}

function isUnrestrictedLocalValue_(localValue) {
  var normalized = normalizarTexto(localValue);
  return !normalized || normalized === "todos" || normalized === "todas";
}

function isReservedPseudoLocal_(localValue) {
  return isUnrestrictedLocalValue_(localValue);
}

function generateStableLocalIdForSeed_(localValue) {
  var normalized = normalizarTexto(localValue).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return "LOC-" + (normalized || "sin_local");
}

function getUsuariosSheetContext_() {
  var sheet = findSheet_(HOJA_USUARIOS, SPREADSHEET_KEY_RRHH);
  if (!sheet) return null;

  var data = sheet.getDataRange().getValues();
  if (!data.length) return null;

  var headerMap = buildHeaderIndexMap_(data[0]);
  var indices = {
    idUsuario: getHeaderIndex_(headerMap, ["id_usuario"]),
    nombreCompleto: getHeaderIndex_(headerMap, ["nombre_completo", "nombre"]),
    usuarioLogin: getHeaderIndex_(headerMap, ["usuario_login", "usuario"]),
    pin: getHeaderIndex_(headerMap, ["pin"]),
    rol: getHeaderIndex_(headerMap, ["rol"]),
    local: getHeaderIndex_(headerMap, ["local"]),
    cargo: getHeaderIndex_(headerMap, ["cargo"]),
    activo: getHeaderIndex_(headerMap, ["activo"]),
    email: getHeaderIndex_(headerMap, ["email"]),
    telefono: getHeaderIndex_(headerMap, ["telefono"]),
    fechaCreacion: getHeaderIndex_(headerMap, ["fecha_creacion"]),
    observaciones: getHeaderIndex_(headerMap, ["observaciones"])
  };

  if (
    indices.nombreCompleto === -1 ||
    indices.usuarioLogin === -1 ||
    indices.pin === -1 ||
    indices.rol === -1 ||
    indices.activo === -1
  ) {
    return null;
  }

  return {
    sheet: sheet,
    data: data,
    indices: indices
  };
}

function getRolesPermisosSheetContext_() {
  var sheet = findSheet_(HOJA_ROLES_PERMISOS, SPREADSHEET_KEY_RRHH);
  if (!sheet) return null;

  var data = sheet.getDataRange().getValues();
  if (!data.length) return null;

  var headers = data[0];
  var headerMap = buildHeaderIndexMap_(headers);
  var roleIndex = getHeaderIndex_(headerMap, ["rol"]);
  var activeIndex = getHeaderIndex_(headerMap, ["activo"]);

  if (roleIndex === -1 || activeIndex === -1) {
    return null;
  }

  return {
    sheet: sheet,
    data: data,
    headers: headers,
    roleIndex: roleIndex,
    activeIndex: activeIndex,
    headerMap: headerMap
  };
}

function getUsuariosLocalesSheetContext_() {
  var context = getAdminSheetContext_(HOJA_USUARIOS_LOCALES, USUARIOS_LOCALES_HEADERS);
  return {
    sheet: context.sheet,
    data: context.data,
    headerMap: context.headerMap
  };
}

function isModernAuthEnabled_() {
  return !!getUsuariosSheetContext_() && !!getRolesPermisosSheetContext_();
}

function getRolePermissions_(role) {
  var roleName = String(role || "").trim();
  var rolesContext = getRolesPermisosSheetContext_();

  if (rolesContext) {
    for (var i = 1; i < rolesContext.data.length; i++) {
      var row = rolesContext.data[i];
      if (!isRole_(row[rolesContext.roleIndex], roleName)) continue;
      if (!parseBooleanCell_(row[rolesContext.activeIndex])) return null;

      var permissions = {};
      for (var c = 0; c < rolesContext.headers.length; c++) {
        if (c === rolesContext.roleIndex || c === rolesContext.activeIndex) continue;
        permissions[normalizeHeaderKey_(rolesContext.headers[c])] = parseBooleanCell_(row[c]);
      }
      permissions.activo = true;
      return permissions;
    }

    return null;
  }

  return ROLE_PERMISSIONS_FALLBACK[roleName] || null;
}

function getRolePermissionsStrict_(role) {
  var permissions = getRolePermissions_(role);
  if (!permissions) {
    throw crearErrorAuth("ERROR_DATOS", 'No existe configuración de permisos para el rol "' + role + '".');
  }
  return permissions;
}

function buildRoleSummary_(role) {
  return {
    role: role,
    permissions: getRolePermissionsStrict_(role)
  };
}

function buildUserRecordFromModernRow_(row, indices) {
  return {
    idUsuario: indices.idUsuario === -1 ? "" : String(row[indices.idUsuario] || "").trim(),
    nombreCompleto: String(row[indices.nombreCompleto] || "").trim(),
    usuarioLogin: String(row[indices.usuarioLogin] || "").trim(),
    pin: indices.pin === -1 ? "" : String(row[indices.pin] || "").trim(),
    rol: String(row[indices.rol] || "").trim(),
    local: indices.local === -1 ? "" : String(row[indices.local] || "").trim(),
    cargo: indices.cargo === -1 ? "" : String(row[indices.cargo] || "").trim(),
    activo: parseBooleanCell_(row[indices.activo]),
    email: indices.email === -1 ? "" : String(row[indices.email] || "").trim(),
    telefono: indices.telefono === -1 ? "" : String(row[indices.telefono] || "").trim(),
    fechaCreacion: indices.fechaCreacion === -1 ? "" : String(row[indices.fechaCreacion] || "").trim(),
    observaciones: indices.observaciones === -1 ? "" : String(row[indices.observaciones] || "").trim()
  };
}

function sanitizeManagedUserForAdminView_(record) {
  var nextRecord = {};
  Object.keys(record || {}).forEach(function(key) {
    nextRecord[key] = record[key];
  });

  if (nextRecord.pin) {
    nextRecord.pin = "";
  }

  return nextRecord;
}

function findModernUserRecordByIdentity_(identity) {
  var context = getUsuariosSheetContext_();
  if (!context) return null;

  var normalizedIdentity = normalizarTexto(identity);

  for (var i = 1; i < context.data.length; i++) {
    var row = context.data[i];
    var record = buildUserRecordFromModernRow_(row, context.indices);
    if (
      normalizarTexto(record.nombreCompleto) === normalizedIdentity ||
      normalizarTexto(record.usuarioLogin) === normalizedIdentity ||
      (record.idUsuario && normalizarTexto(record.idUsuario) === normalizedIdentity)
    ) {
      return {
        rowNumber: i + 1,
        row: row,
        record: record,
        context: context
      };
    }
  }

  return null;
}

function buildSessionPrincipalKey_(record, role) {
  var userType = getUserTypeById_(role);
  if (userType && userType.credentialMode === "username" && record.usuarioLogin) {
    return "login:" + normalizarTexto(record.usuarioLogin);
  }
  if (record.usuarioLogin) {
    return "login:" + normalizarTexto(record.usuarioLogin);
  }
  if (record.idUsuario) {
    return "id:" + normalizarTexto(record.idUsuario);
  }
  return "name:" + normalizarTexto(record.nombreCompleto);
}

function buildStructuredAssignmentKey_(role, principalKey, localName) {
  return [
    normalizarTexto(role),
    normalizarTexto(principalKey),
    normalizarTexto(localName)
  ].join("|");
}

function buildUserLocalRecordFromSheetRow_(row, headerMap, rowNumber) {
  return {
    rowNumber: rowNumber,
    idAsignacion: String(getCellFromSheetMap_(row, headerMap, ["id_asignacion"]) || "").trim(),
    idUsuario: String(getCellFromSheetMap_(row, headerMap, ["id_usuario"]) || "").trim(),
    usuarioLogin: String(getCellFromSheetMap_(row, headerMap, ["usuario_login"]) || "").trim(),
    rol: String(getCellFromSheetMap_(row, headerMap, ["rol"]) || "").trim(),
    idLocal: String(getCellFromSheetMap_(row, headerMap, ["id_local"]) || "").trim(),
    localNombre: String(getCellFromSheetMap_(row, headerMap, ["local_nombre"]) || "").trim(),
    activo: parseBooleanCell_(getCellFromSheetMap_(row, headerMap, ["activo"])),
    fechaCreacion: String(getCellFromSheetMap_(row, headerMap, ["fecha_creacion"]) || "").trim(),
    observaciones: String(getCellFromSheetMap_(row, headerMap, ["observaciones"]) || "").trim()
  };
}

function listResolvedLocalScope_(localValue) {
  var requestedLocals = parseLocalScope_(localValue);
  var dedupe = {};
  var sorted = [];
  var catalog = [];

  try {
    catalog = listarLocalesCatalogo_({ onlyActive: false });
  } catch (error) {}

  var catalogByName = {};
  catalog.forEach(function(record) {
    if (!record || !record.nombre) return;
    catalogByName[normalizarTexto(record.nombre)] = record;
  });

  requestedLocals.forEach(function(localName) {
    var normalizedName = normalizarTexto(localName);
    if (!normalizedName || dedupe[normalizedName] || isReservedPseudoLocal_(localName)) return;
    dedupe[normalizedName] = true;
    var catalogRecord = catalogByName[normalizedName];
    sorted.push({
      idLocal: catalogRecord
        ? String(catalogRecord.idLocal || "").trim()
        : generateStableLocalIdForSeed_(localName),
      nombre: catalogRecord
        ? String(catalogRecord.nombre || "").trim()
        : String(localName || "").trim()
    });
  });

  sorted.sort(function(a, b) {
    return a.nombre.localeCompare(b.nombre, "es");
  });

  return sorted;
}

function serializeManagedLocalScope_(role, localValue) {
  if (isRole_(role, USER_TYPES.ADMINISTRADOR.id)) {
    return "Todos";
  }

  return listResolvedLocalScope_(localValue).map(function(record) {
    return record.nombre;
  }).join(", ");
}

function ensureUsuariosLocalesSheetReady_() {
  var usuariosContext = getUsuariosSheetContext_();
  if (!usuariosContext) return;

  var assignmentsContext = getUsuariosLocalesSheetContext_();
  var existingMap = {};

  for (var i = 1; i < assignmentsContext.data.length; i++) {
    var currentRecord = buildUserLocalRecordFromSheetRow_(assignmentsContext.data[i], assignmentsContext.headerMap, i + 1);
    if (!currentRecord.localNombre) continue;
    var currentPrincipalKey = buildSessionPrincipalKey_(currentRecord, currentRecord.rol);
    existingMap[buildStructuredAssignmentKey_(currentRecord.rol, currentPrincipalKey, currentRecord.localNombre)] = currentRecord;
  }

  for (var j = 1; j < usuariosContext.data.length; j++) {
    var userRecord = buildUserRecordFromModernRow_(usuariosContext.data[j], usuariosContext.indices);
    if (!userRecord.nombreCompleto || !userRecord.activo) continue;
    if (isRole_(userRecord.rol, USER_TYPES.ADMINISTRADOR.id)) continue;
    if (isUnrestrictedLocalValue_(userRecord.local)) continue;

    var principalKey = buildSessionPrincipalKey_(userRecord, userRecord.rol);
    var localRecords = listResolvedLocalScope_(userRecord.local);

    localRecords.forEach(function(localRecord) {
      var assignmentKey = buildStructuredAssignmentKey_(userRecord.rol, principalKey, localRecord.nombre);
      if (existingMap[assignmentKey]) return;

      upsertSheetRecordByRowNumber_(
        HOJA_USUARIOS_LOCALES,
        USUARIOS_LOCALES_HEADERS,
        {
          idAsignacion: ["id_asignacion"],
          idUsuario: ["id_usuario"],
          usuarioLogin: ["usuario_login"],
          rol: ["rol"],
          idLocal: ["id_local"],
          localNombre: ["local_nombre"],
          activo: ["activo"],
          fechaCreacion: ["fecha_creacion"],
          observaciones: ["observaciones"]
        },
        0,
        {
          idAsignacion: Utilities.getUuid(),
          idUsuario: userRecord.idUsuario,
          usuarioLogin: userRecord.usuarioLogin,
          rol: userRecord.rol,
          idLocal: localRecord.idLocal,
          localNombre: localRecord.nombre,
          activo: "SI",
          fechaCreacion: userRecord.fechaCreacion || formatTodayDateForSheet_(),
          observaciones: "Backfill legacy desde Usuarios.local"
        }
      );

      existingMap[assignmentKey] = true;
    });
  }
}

function listStructuredAssignmentsByPrincipal_(role, principalKey) {
  ensureUsuariosLocalesSheetReady_();
  var context = getUsuariosLocalesSheetContext_();
  var assignments = [];

  for (var i = 1; i < context.data.length; i++) {
    var record = buildUserLocalRecordFromSheetRow_(context.data[i], context.headerMap, i + 1);
    if (!record.activo || !record.localNombre) continue;
    if (!isRole_(record.rol, role)) continue;
    if (buildSessionPrincipalKey_(record, role) !== principalKey) continue;
    assignments.push(record);
  }

  assignments.sort(function(a, b) {
    return a.localNombre.localeCompare(b.localNombre, "es");
  });

  return assignments;
}

function buildActiveAssignmentIndexByPrincipal_(context) {
  var index = {};
  if (!context || !context.data || !context.data.length) return index;

  for (var i = 1; i < context.data.length; i++) {
    var record = buildUserLocalRecordFromSheetRow_(context.data[i], context.headerMap, i + 1);
    if (!record.activo || !record.localNombre) continue;

    var principalKey = buildSessionPrincipalKey_(record, record.rol);
    if (!principalKey) continue;

    var bucketKey = normalizarTexto(record.rol) + "::" + principalKey;
    if (!index[bucketKey]) {
      index[bucketKey] = [];
    }

    index[bucketKey].push(record.localNombre);
  }

  return index;
}

function syncStructuredAssignmentsForManagedUser_(userRecord) {
  if (!userRecord || !userRecord.nombreCompleto || !userRecord.rol) return;

  ensureUsuariosLocalesSheetReady_();

  var principalKey = buildSessionPrincipalKey_(userRecord, userRecord.rol);
  var context = getUsuariosLocalesSheetContext_();
  var desiredLocals = (
    userRecord.activo &&
    !isRole_(userRecord.rol, USER_TYPES.ADMINISTRADOR.id) &&
    !isUnrestrictedLocalValue_(userRecord.local)
  )
    ? listResolvedLocalScope_(userRecord.local)
    : [];
  var desiredByLocal = {};

  desiredLocals.forEach(function(localRecord) {
    desiredByLocal[normalizarTexto(localRecord.nombre)] = localRecord;
  });

  for (var i = 1; i < context.data.length; i++) {
    var currentRecord = buildUserLocalRecordFromSheetRow_(context.data[i], context.headerMap, i + 1);
    var sameUserById = currentRecord.idUsuario && userRecord.idUsuario
      && normalizarTexto(currentRecord.idUsuario) === normalizarTexto(userRecord.idUsuario);
    var sameUserByLogin = currentRecord.usuarioLogin && userRecord.usuarioLogin
      && normalizarTexto(currentRecord.usuarioLogin) === normalizarTexto(userRecord.usuarioLogin);
    var samePrincipal = buildSessionPrincipalKey_(currentRecord, currentRecord.rol) === principalKey;
    if (!sameUserById && !sameUserByLogin && !samePrincipal) continue;

    var normalizedLocal = normalizarTexto(currentRecord.localNombre);
    var desiredLocal = desiredByLocal[normalizedLocal];

    if (desiredLocal && isRole_(currentRecord.rol, userRecord.rol)) {
      upsertSheetRecordByRowNumber_(
        HOJA_USUARIOS_LOCALES,
        USUARIOS_LOCALES_HEADERS,
        {
          idAsignacion: ["id_asignacion"],
          idUsuario: ["id_usuario"],
          usuarioLogin: ["usuario_login"],
          rol: ["rol"],
          idLocal: ["id_local"],
          localNombre: ["local_nombre"],
          activo: ["activo"],
          fechaCreacion: ["fecha_creacion"],
          observaciones: ["observaciones"]
        },
        currentRecord.rowNumber,
        {
          idAsignacion: currentRecord.idAsignacion || Utilities.getUuid(),
          idUsuario: userRecord.idUsuario,
          usuarioLogin: userRecord.usuarioLogin,
          rol: userRecord.rol,
          idLocal: desiredLocal.idLocal,
          localNombre: desiredLocal.nombre,
          activo: "SI",
          fechaCreacion: currentRecord.fechaCreacion || userRecord.fechaCreacion || formatTodayDateForSheet_(),
          observaciones: currentRecord.observaciones || "Sincronizado desde mantenedor de usuarios"
        }
      );
      delete desiredByLocal[normalizedLocal];
      continue;
    }

    upsertSheetRecordByRowNumber_(
      HOJA_USUARIOS_LOCALES,
      USUARIOS_LOCALES_HEADERS,
      {
        activo: ["activo"],
        observaciones: ["observaciones"]
      },
      currentRecord.rowNumber,
      {
        activo: "NO",
        observaciones: "Asignacion desactivada por sincronizacion del mantenedor de usuarios"
      }
    );
  }

  Object.keys(desiredByLocal).forEach(function(localKey) {
    var desiredLocal = desiredByLocal[localKey];
    upsertSheetRecordByRowNumber_(
      HOJA_USUARIOS_LOCALES,
      USUARIOS_LOCALES_HEADERS,
      {
        idAsignacion: ["id_asignacion"],
        idUsuario: ["id_usuario"],
        usuarioLogin: ["usuario_login"],
        rol: ["rol"],
        idLocal: ["id_local"],
        localNombre: ["local_nombre"],
        activo: ["activo"],
        fechaCreacion: ["fecha_creacion"],
        observaciones: ["observaciones"]
      },
      0,
      {
        idAsignacion: Utilities.getUuid(),
        idUsuario: userRecord.idUsuario,
        usuarioLogin: userRecord.usuarioLogin,
        rol: userRecord.rol,
        idLocal: desiredLocal.idLocal,
        localNombre: desiredLocal.nombre,
        activo: "SI",
        fechaCreacion: userRecord.fechaCreacion || formatTodayDateForSheet_(),
        observaciones: "Asignacion creada desde mantenedor de usuarios"
      }
    );
  });
}

function collectAssignmentsByRolePrincipal_(role, principalKey) {
  var context = getUsuariosSheetContext_();
  if (!context) return [];

  var matches = [];
  for (var i = 1; i < context.data.length; i++) {
    var record = buildUserRecordFromModernRow_(context.data[i], context.indices);
    if (!record.nombreCompleto || !record.activo) continue;
    if (!isRole_(record.rol, role)) continue;
    if (buildSessionPrincipalKey_(record, role) !== principalKey) continue;
    matches.push(record);
  }

  if (!matches.length || isRole_(role, USER_TYPES.ADMINISTRADOR.id)) {
    return matches;
  }

  var baseRecord = matches[0];
  var resolvedLocals = resolveAssignedLocalsForUserRecord_(baseRecord);
  if (!resolvedLocals.length) {
    return matches;
  }

  return resolvedLocals.map(function(localName) {
    var scopedRecord = {};
    Object.keys(baseRecord).forEach(function(key) {
      scopedRecord[key] = baseRecord[key];
    });
    scopedRecord.local = localName;
    return scopedRecord;
  });
}

function buildSessionContextFromAssignments_(role, assignments) {
  if (!assignments.length) return null;

  var permissions = getRolePermissions_(role);
  if (!permissions) return null;

  var unrestricted = role === USER_TYPES.ADMINISTRADOR.id;
  var localsMap = {};

  assignments.forEach(function(record) {
    if (unrestricted) return;
    var locals = parseLocalScope_(record.local);
    if (!locals.length || isUnrestrictedLocalValue_(record.local)) {
      unrestricted = true;
      return;
    }

    locals.forEach(function(local) {
      localsMap[normalizarTexto(local)] = local;
    });
  });

  return {
    role: role,
    displayName: assignments[0].nombreCompleto,
    userKey: assignments[0].nombreCompleto,
    principalKey: buildSessionPrincipalKey_(assignments[0], role),
    permissions: permissions,
    unrestrictedLocals: unrestricted,
    allowedLocals: unrestricted
      ? []
      : Object.keys(localsMap).map(function(key) { return localsMap[key]; }).sort()
  };
}

function resolveAssignedLocalsForUserRecord_(record, prebuiltAssignmentIndex) {
  if (!record || !record.activo || !record.rol) return [];
  if (isRole_(record.rol, USER_TYPES.ADMINISTRADOR.id)) return [];

  var dedupe = {};
  var resolvedLocals = [];

  function addLocal(localName) {
    var normalizedLocal = normalizarTexto(localName);
    if (!normalizedLocal || dedupe[normalizedLocal]) return;
    dedupe[normalizedLocal] = true;
    resolvedLocals.push(String(localName || "").trim());
  }

  var principalKey = buildSessionPrincipalKey_(record, record.rol);
  var bucketKey = normalizarTexto(record.rol) + "::" + principalKey;
  var assignmentIndex = prebuiltAssignmentIndex || null;

  if (!assignmentIndex) {
    try {
      ensureUsuariosLocalesSheetReady_();
      assignmentIndex = buildActiveAssignmentIndexByPrincipal_(getUsuariosLocalesSheetContext_());
    } catch (error) {
      assignmentIndex = null;
    }
  }

  if (assignmentIndex && assignmentIndex[bucketKey]) {
    assignmentIndex[bucketKey].forEach(addLocal);
  }

  if (resolvedLocals.length) {
    return resolvedLocals.sort(function(a, b) {
      return a.localeCompare(b, "es");
    });
  }

  if (isUnrestrictedLocalValue_(record.local)) {
    return [];
  }

  parseLocalScope_(record.local).forEach(addLocal);
  return resolvedLocals.sort(function(a, b) {
    return a.localeCompare(b, "es");
  });
}


function listManagedUsers_() {
  var context = getUsuariosSheetContext_();
  if (!context) return [];

  var users = [];
  var mergedUsers = {};
  for (var i = 1; i < context.data.length; i++) {
    var record = buildUserRecordFromModernRow_(context.data[i], context.indices);
    if (!record.nombreCompleto) continue;
    var safeRecord = sanitizeManagedUserForAdminView_(record);
    if (isRole_(record.rol, USER_TYPES.ADMINISTRADOR.id)) {
      users.push(safeRecord);
      continue;
    }

    var mergeKey = buildManagedUserMergeKey_(record);
    if (!mergedUsers[mergeKey]) {
      mergedUsers[mergeKey] = safeRecord;
      mergedUsers[mergeKey].local = serializeManagedLocalScope_(record.rol, resolveAssignedLocalsForUserRecord_(record).join(", "));
      continue;
    }

    var mergedRecord = mergedUsers[mergeKey];
    var mergedLocals = parseLocalScope_(mergedRecord.local);
    resolveAssignedLocalsForUserRecord_(record).forEach(function(localName) {
      if (mergedLocals.map(normalizarTexto).indexOf(normalizarTexto(localName)) === -1) {
        mergedLocals.push(localName);
      }
    });
    mergedRecord.local = serializeManagedLocalScope_(record.rol, mergedLocals.join(", "));
    if (!mergedRecord.idUsuario && safeRecord.idUsuario) mergedRecord.idUsuario = safeRecord.idUsuario;
    if (!mergedRecord.usuarioLogin && safeRecord.usuarioLogin) mergedRecord.usuarioLogin = safeRecord.usuarioLogin;
    if (!mergedRecord.email && safeRecord.email) mergedRecord.email = safeRecord.email;
    if (!mergedRecord.telefono && safeRecord.telefono) mergedRecord.telefono = safeRecord.telefono;
    if (!mergedRecord.cargo && safeRecord.cargo) mergedRecord.cargo = safeRecord.cargo;
  }

  Object.keys(mergedUsers).forEach(function(key) {
    users.push(mergedUsers[key]);
  });

  users.sort(function(a, b) {
    if (a.rol === USER_TYPES.ADMINISTRADOR.id && b.rol !== USER_TYPES.ADMINISTRADOR.id) return -1;
    if (a.rol !== USER_TYPES.ADMINISTRADOR.id && b.rol === USER_TYPES.ADMINISTRADOR.id) return 1;
    if (a.local !== b.local) return a.local.localeCompare(b.local, "es");
    return a.nombreCompleto.localeCompare(b.nombreCompleto, "es");
  });

  return users;
}

function buildManagedUserMergeKey_(record) {
  if (!record) return "";
  if (record.idUsuario) {
    return "id:" + normalizarTexto(record.idUsuario);
  }
  if (record.usuarioLogin) {
    return [
      "login",
      normalizarTexto(record.rol),
      normalizarTexto(record.usuarioLogin)
    ].join(":");
  }
  return [
    "namepin",
    normalizarTexto(record.rol),
    normalizarTexto(record.nombreCompleto),
    normalizarTexto(record.pin)
  ].join(":");
}

function buildManagedUserConsolidationGroupKey_(record) {
  if (!record) return "";
  if (record.usuarioLogin) {
    return [
      "login",
      normalizarTexto(record.rol),
      normalizarTexto(record.usuarioLogin)
    ].join(":");
  }
  return [
    "name",
    normalizarTexto(record.rol),
    normalizarTexto(record.nombreCompleto)
  ].join(":");
}

function listManagedRoles_() {
  var roles = [];
  var seen = {};
  var rolesContext = getRolesPermisosSheetContext_();

  if (rolesContext) {
    for (var i = 1; i < rolesContext.data.length; i++) {
      var roleName = String(rolesContext.data[i][rolesContext.roleIndex] || "").trim();
      if (!roleName || seen[roleName]) continue;
      if (!getRolePermissions_(roleName)) continue;
      seen[roleName] = true;
      roles.push(buildRoleSummary_(roleName));
    }
  } else {
    Object.keys(ROLE_PERMISSIONS_FALLBACK).forEach(function(roleName) {
      if (seen[roleName]) return;
      seen[roleName] = true;
      roles.push(buildRoleSummary_(roleName));
    });
  }

  roles.sort(function(a, b) {
    return a.role.localeCompare(b.role, "es");
  });
  return roles;
}

function formatTodayDateForSheet_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function generateManagedUserId_() {
  var context = getUsuariosSheetContext_();
  if (!context) {
    return "USR-001";
  }

  var maxValue = 0;
  for (var i = 1; i < context.data.length; i++) {
    var record = buildUserRecordFromModernRow_(context.data[i], context.indices);
    var match = String(record.idUsuario || "").trim().match(/^USR-(\d+)$/i);
    if (!match) continue;
    maxValue = Math.max(maxValue, Number(match[1]) || 0);
  }

  return "USR-" + String(maxValue + 1).padStart(3, "0");
}

function findManagedUserDuplicates_(context, candidate, excludeRowNumber) {
  var duplicateId = null;
  var duplicateLogin = null;
  var normalizedId = normalizarTexto(candidate.idUsuario);
  var normalizedLogin = normalizarTexto(candidate.usuarioLogin);

  for (var i = 1; i < context.data.length; i++) {
    var rowNumber = i + 1;
    if (excludeRowNumber && rowNumber === excludeRowNumber) continue;

    var record = buildUserRecordFromModernRow_(context.data[i], context.indices);
    if (!record.nombreCompleto) continue;

    if (!duplicateId && normalizedId && record.idUsuario && normalizarTexto(record.idUsuario) === normalizedId) {
      duplicateId = record;
    }

    if (!duplicateLogin && normalizedLogin && record.usuarioLogin && normalizarTexto(record.usuarioLogin) === normalizedLogin) {
      duplicateLogin = record;
    }

    if (duplicateId && duplicateLogin) break;
  }

  return {
    duplicateId: duplicateId,
    duplicateLogin: duplicateLogin
  };
}

function validateManagedUserPayload_(context, candidate, excludeRowNumber, currentRecord) {
  var nextRole = String(candidate.rol || candidate.role || "").trim();
  var nombreCompleto = String(candidate.nombreCompleto || "").trim();
  var usuarioLogin = String(candidate.usuarioLogin || "").trim();
  var pin = String(candidate.pin || "").trim();
  var local = String(candidate.local || "").trim();
  var activo = Boolean(candidate.activo);
  var existingRecord = currentRecord || null;
  var nextUserType = getUserTypeById_(nextRole);

  if (!nextRole || !nextUserType) {
    return "Debes indicar un rol válido.";
  }

  getRolePermissionsStrict_(nextRole);

  if (activo) {
    if (!nombreCompleto || !pin) {
      return "Nombre completo y PIN son obligatorios para usuarios activos.";
    }

    if (nextUserType.credentialMode === "username" && !usuarioLogin) {
      return 'El usuario login es obligatorio para el rol "' + nextRole + '".';
    }

    if (
      (isRole_(nextRole, USER_TYPES.SUPERVISOR.id) || isRole_(nextRole, USER_TYPES.COLABORADOR.id))
      && !local
    ) {
      return 'Los usuarios con rol "' + nextRole + '" deben tener al menos un local asignado.';
    }
  }

  var duplicates = findManagedUserDuplicates_(context, candidate, excludeRowNumber);
  if (duplicates.duplicateLogin) {
    var sameLegacyPrincipal = existingRecord
      && normalizarTexto(existingRecord.usuarioLogin) === normalizarTexto(usuarioLogin)
      && normalizarTexto(duplicates.duplicateLogin.usuarioLogin) === normalizarTexto(usuarioLogin);

    if (!sameLegacyPrincipal) {
      return 'El usuario login "' + usuarioLogin + '" ya existe.';
    }
  }

  if (String(candidate.idUsuario || "").trim() && duplicates.duplicateId) {
    var sameLegacyIdentity = existingRecord
      && normalizarTexto(existingRecord.idUsuario) === normalizarTexto(candidate.idUsuario)
      && normalizarTexto(duplicates.duplicateId.idUsuario) === normalizarTexto(candidate.idUsuario);

    if (!sameLegacyIdentity) {
      return 'El id_usuario "' + candidate.idUsuario + '" ya existe.';
    }
  }

  return "";
}

function buildManagedUserValues_(context, params, currentRecord) {
  var existingRecord = currentRecord || {};
  var existingPin = String(existingRecord.pin || "").trim();
  var requestedPin = String(params.pin || params.newPin || "").trim();
  var nextRole = String(params.rol || params.role || existingRecord.rol || "").trim();
  var requestedId = String(params.idUsuario || existingRecord.idUsuario || "").trim();
  var requestedLocalValue = Object.prototype.hasOwnProperty.call(params || {}, "local")
    ? params.local
    : existingRecord.local;
  var serializedLocal = serializeManagedLocalScope_(nextRole, requestedLocalValue);

  return {
    idUsuario: requestedId || generateManagedUserId_(),
    nombreCompleto: String(params.nombreCompleto || "").trim(),
    usuarioLogin: String(params.usuarioLogin || "").trim(),
    pin: requestedPin || existingPin,
    rol: nextRole,
    local: serializedLocal,
    cargo: String(params.cargo || "").trim(),
    activo: parseBooleanCell_(params.activo),
    email: String(params.email || "").trim(),
    telefono: String(params.telefono || "").trim(),
    fechaCreacion: String(params.fechaCreacion || existingRecord.fechaCreacion || "").trim() || formatTodayDateForSheet_(),
    observaciones: String(params.observaciones || "").trim()
  };
}

function writeManagedUserToSheet_(context, rowNumber, values) {
  var fieldMap = [
    ["idUsuario", "idUsuario"],
    ["nombreCompleto", "nombreCompleto"],
    ["usuarioLogin", "usuarioLogin"],
    ["pin", "pin"],
    ["rol", "rol"],
    ["local", "local"],
    ["cargo", "cargo"],
    ["activo", "activo"],
    ["email", "email"],
    ["telefono", "telefono"],
    ["fechaCreacion", "fechaCreacion"],
    ["observaciones", "observaciones"]
  ];

  fieldMap.forEach(function(entry) {
    var valueKey = entry[0];
    var indexKey = entry[1];
    var columnIndex = context.indices[indexKey];
    if (columnIndex === -1) return;
    var range = context.sheet.getRange(rowNumber, columnIndex + 1);

    var cellValue = valueKey === "activo"
      ? (values[valueKey] ? "SI" : "NO")
      : values[valueKey];

    if (indexKey === "local") {
      range.clearDataValidations();
    }

    range.setValue(cellValue);
  });
}

function refreshSessionFromUsersSheet_(sheetSesiones, sessionRowNumber, sessionData) {
  if (!isModernAuthEnabled_()) {
    sessionData.permissions = getRolePermissions_(sessionData.role);
    sessionData.allowedLocals = [];
    sessionData.unrestrictedLocals = true;
    return sessionData;
  }

  var principalKey = String(sessionData.principalKey || "").trim();

  if (!principalKey) {
    var fallbackMatch = findModernUserRecordByIdentity_(sessionData.userKey || sessionData.displayName);
    if (!fallbackMatch || !fallbackMatch.record.activo) {
      sheetSesiones.deleteRow(sessionRowNumber);
      throw crearErrorAuth("UNAUTHORIZED", "Tu usuario ya no está habilitado.");
    }
    principalKey = buildSessionPrincipalKey_(fallbackMatch.record, sessionData.role);
  }

  var assignments = collectAssignmentsByRolePrincipal_(sessionData.role, principalKey);
  var refreshed = buildSessionContextFromAssignments_(sessionData.role, assignments);

  if (!refreshed) {
    sheetSesiones.deleteRow(sessionRowNumber);
    throw crearErrorAuth("UNAUTHORIZED", "Tu usuario ya no está habilitado.");
  }

  if (
    refreshed.displayName !== sessionData.displayName ||
    refreshed.userKey !== sessionData.userKey ||
    refreshed.principalKey !== principalKey
  ) {
    sheetSesiones.getRange(sessionRowNumber, 2, 1, 3).setValues([[
      refreshed.role,
      refreshed.displayName,
      refreshed.userKey
    ]]);
    if (sheetSesiones.getLastColumn() >= 6) {
      sheetSesiones.getRange(sessionRowNumber, 6).setValue(refreshed.principalKey);
    }
  }

  refreshed.sessionToken = sessionData.sessionToken;
  return refreshed;
}

function bootstrapGestionUsuarios(params) {
  requireAdminSession(params);

  if (!isModernAuthEnabled_()) {
    return responderJSON({
      status: "ERROR_HOJA",
      mensaje: "La gestión moderna de usuarios requiere las hojas Usuarios y RolesPermisos."
    });
  }

  ensureUsuariosLocalesSheetReady_();

  return responderJSON({
    status: "SUCCESS",
    meta: {
      permissionKeys: PERMISSION_KEYS.slice()
    },
    roles: listManagedRoles_(),
    users: listManagedUsers_(),
    locales: listarLocalesCatalogo_({ onlyActive: false }).map(mapLocalRecordToOption_)
  });
}

function actualizarRolUsuarioAdmin(params) {
  requireAdminSession(params);

  if (!isModernAuthEnabled_()) {
    return responderJSON({
      status: "ERROR_HOJA",
      mensaje: "La hoja Usuarios no está disponible en este entorno."
    });
  }

  var idUsuario = String(params.idUsuario || "").trim();
  var nextRole = String(params.role || "").trim();

  if (!idUsuario || !nextRole) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar idUsuario y role."
    });
  }

  if (!getUserTypeById_(nextRole)) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Rol no válido."
    });
  }

  getRolePermissionsStrict_(nextRole);

  var match = findModernUserRecordByIdentity_(idUsuario);
  if (!match) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "No se encontró el usuario indicado."
    });
  }

  var previousRecord = {};
  Object.keys(match.record || {}).forEach(function(key) {
    previousRecord[key] = match.record[key];
  });

  match.context.sheet.getRange(match.rowNumber, match.context.indices.rol + 1).setValue(nextRole);
  match.record.rol = nextRole;
  match.record.local = serializeManagedLocalScope_(nextRole, match.record.local);
  if (match.context.indices.local !== -1) {
    match.context.sheet.getRange(match.rowNumber, match.context.indices.local + 1).setValue(match.record.local);
  }
  syncStructuredAssignmentsForManagedUser_(match.record);
  refreshAttendancePublicEmployeesForRecords_([previousRecord, match.record]);

  return responderJSON({
    status: "SUCCESS",
    mensaje: "Rol actualizado correctamente.",
    user: match.record
  });
}

function actualizarUsuarioAdmin(params) {
  requireAdminSession(params);
  var traceId = getTraceId_(params);

  if (!isModernAuthEnabled_()) {
    return responderJSON(withTraceResponse_({
      status: "ERROR_HOJA",
      mensaje: "La hoja Usuarios no está disponible en este entorno."
    }, params));
  }

  var idUsuario = String(params.idUsuario || "").trim();
  if (!idUsuario) {
    return responderJSON(withTraceResponse_({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar idUsuario."
    }, params));
  }

  var match = findModernUserRecordByIdentity_(idUsuario);
  if (!match) {
    return responderJSON(withTraceResponse_({
      status: "ERROR_DATOS",
      mensaje: "No se encontró el usuario indicado."
    }, params));
  }

  var nextValues = buildManagedUserValues_(match.context, params, match.record);
  logManagedUserTrace_(traceId, "ActualizarUsuarioAdmin:payload", {
    accion: "ActualizarUsuarioAdmin",
    idUsuario: idUsuario,
    role: nextValues.rol,
    local: nextValues.local,
    activo: nextValues.activo,
    usuarioLogin: nextValues.usuarioLogin,
    hasPin: Boolean(String(nextValues.pin || "").trim())
  });
  var validationError = validateManagedUserPayload_(match.context, nextValues, match.rowNumber, match.record);
  if (validationError) {
    logManagedUserTrace_(traceId, "ActualizarUsuarioAdmin:validation_error", {
      mensaje: validationError,
      currentRecord: {
        idUsuario: match.record.idUsuario,
        nombreCompleto: match.record.nombreCompleto,
        usuarioLogin: match.record.usuarioLogin,
        rol: match.record.rol,
        local: match.record.local,
        activo: match.record.activo,
        hasPin: Boolean(String(match.record.pin || "").trim())
      },
      nextValues: {
        idUsuario: nextValues.idUsuario,
        nombreCompleto: nextValues.nombreCompleto,
        usuarioLogin: nextValues.usuarioLogin,
        rol: nextValues.rol,
        local: nextValues.local,
        activo: nextValues.activo,
        hasPin: Boolean(String(nextValues.pin || "").trim())
      }
    });
    return responderJSON(withTraceResponse_({
      status: "ERROR_DATOS",
      mensaje: validationError
    }, params));
  }

  var context = match.context;
  var previousRecord = {};
  Object.keys(match.record || {}).forEach(function(key) {
    previousRecord[key] = match.record[key];
  });
  writeManagedUserToSheet_(context, match.rowNumber, nextValues);
  syncStructuredAssignmentsForManagedUser_(nextValues);
  refreshAttendancePublicEmployeesForRecords_([previousRecord, nextValues]);

  var refreshedRow = context.sheet.getRange(match.rowNumber, 1, 1, context.data[0].length).getValues()[0];

  logManagedUserTrace_(traceId, "ActualizarUsuarioAdmin:success", {
    idUsuario: nextValues.idUsuario,
    usuarioLogin: nextValues.usuarioLogin,
    rol: nextValues.rol,
    local: nextValues.local
  });
  return responderJSON(withTraceResponse_({
    status: "SUCCESS",
    mensaje: "Usuario actualizado correctamente.",
    user: sanitizeManagedUserForAdminView_(buildUserRecordFromModernRow_(refreshedRow, context.indices))
  }, params));
}

function crearUsuarioAdmin(params) {
  requireAdminSession(params);
  var traceId = getTraceId_(params);

  if (!isModernAuthEnabled_()) {
    return responderJSON(withTraceResponse_({
      status: "ERROR_HOJA",
      mensaje: "La hoja Usuarios no está disponible en este entorno."
    }, params));
  }

  var context = getUsuariosSheetContext_();
  if (!context) {
    return responderJSON(withTraceResponse_({
      status: "ERROR_HOJA",
      mensaje: "No se pudo acceder a la hoja Usuarios."
    }, params));
  }

  var nextValues = buildManagedUserValues_(context, params, null);
  logManagedUserTrace_(traceId, "CrearUsuarioAdmin:payload", {
    accion: "CrearUsuarioAdmin",
    idUsuario: nextValues.idUsuario,
    role: nextValues.rol,
    local: nextValues.local,
    activo: nextValues.activo,
    usuarioLogin: nextValues.usuarioLogin,
    hasPin: Boolean(String(nextValues.pin || "").trim())
  });
  var validationError = validateManagedUserPayload_(context, nextValues, 0);
  if (validationError) {
    logManagedUserTrace_(traceId, "CrearUsuarioAdmin:validation_error", {
      mensaje: validationError,
      nextValues: {
        idUsuario: nextValues.idUsuario,
        nombreCompleto: nextValues.nombreCompleto,
        usuarioLogin: nextValues.usuarioLogin,
        rol: nextValues.rol,
        local: nextValues.local,
        activo: nextValues.activo,
        hasPin: Boolean(String(nextValues.pin || "").trim())
      }
    });
    return responderJSON(withTraceResponse_({
      status: "ERROR_DATOS",
      mensaje: validationError
    }, params));
  }

  var rowNumber = context.sheet.getLastRow() + 1;
  writeManagedUserToSheet_(context, rowNumber, nextValues);
  syncStructuredAssignmentsForManagedUser_(nextValues);
  refreshAttendancePublicEmployeesForRecords_([nextValues]);

  var refreshedRow = context.sheet.getRange(rowNumber, 1, 1, context.data[0].length).getValues()[0];
  logManagedUserTrace_(traceId, "CrearUsuarioAdmin:success", {
    idUsuario: nextValues.idUsuario,
    usuarioLogin: nextValues.usuarioLogin,
    rol: nextValues.rol,
    local: nextValues.local
  });
  return responderJSON(withTraceResponse_({
    status: "SUCCESS",
    mensaje: "Usuario creado correctamente.",
    user: sanitizeManagedUserForAdminView_(buildUserRecordFromModernRow_(refreshedRow, context.indices))
  }, params));
}

function cambiarEstadoUsuarioAdmin(params) {
  requireAdminSession(params);

  if (!isModernAuthEnabled_()) {
    return responderJSON({
      status: "ERROR_HOJA",
      mensaje: "La hoja Usuarios no está disponible en este entorno."
    });
  }

  var idUsuario = String(params.idUsuario || "").trim();
  if (!idUsuario) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar idUsuario."
    });
  }

  var match = findModernUserRecordByIdentity_(idUsuario);
  if (!match) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "No se encontró el usuario indicado."
    });
  }

  var nextActive = parseBooleanCell_(params.activo);
  var nextValues = buildManagedUserValues_(match.context, {
    idUsuario: match.record.idUsuario,
    nombreCompleto: match.record.nombreCompleto,
    usuarioLogin: match.record.usuarioLogin,
    pin: match.record.pin,
    rol: match.record.rol,
    local: match.record.local,
    cargo: match.record.cargo,
    activo: nextActive ? "SI" : "NO",
    email: match.record.email,
    telefono: match.record.telefono,
    fechaCreacion: match.record.fechaCreacion,
    observaciones: match.record.observaciones
  }, match.record);

  var validationError = validateManagedUserPayload_(match.context, nextValues, match.rowNumber, match.record);
  if (validationError) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: validationError
    });
  }

  var previousRecord = {};
  Object.keys(match.record || {}).forEach(function(key) {
    previousRecord[key] = match.record[key];
  });
  writeManagedUserToSheet_(match.context, match.rowNumber, nextValues);
  syncStructuredAssignmentsForManagedUser_(nextValues);
  refreshAttendancePublicEmployeesForRecords_([previousRecord, nextValues]);

  var refreshedRow = match.context.sheet.getRange(match.rowNumber, 1, 1, match.context.data[0].length).getValues()[0];
  return responderJSON({
    status: "SUCCESS",
    mensaje: nextActive ? "Usuario reactivado correctamente." : "Usuario desactivado correctamente.",
    user: sanitizeManagedUserForAdminView_(buildUserRecordFromModernRow_(refreshedRow, match.context.indices))
  });
}

function ejecutarMigracionUsuariosUnicos_() {
  if (!isModernAuthEnabled_()) {
    throw crearErrorAuth("ERROR_HOJA", "La hoja Usuarios no está disponible en este entorno.");
  }

  var context = getUsuariosSheetContext_();
  ensureUsuariosLocalesSheetReady_();
  var usuariosLocalesContext = getUsuariosLocalesSheetContext_();
  var groups = {};

  for (var i = 1; i < context.data.length; i++) {
    var record = buildUserRecordFromModernRow_(context.data[i], context.indices);
    if (!record.nombreCompleto) continue;
    if (isRole_(record.rol, USER_TYPES.ADMINISTRADOR.id)) continue;

    var groupKey = buildManagedUserConsolidationGroupKey_(record);
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push({
      rowNumber: i + 1,
      record: record
    });
  }

  var resumen = {
    groupsProcessed: 0,
    usersConsolidated: 0,
    rowsDisabled: 0,
    assignmentsRebound: 0
  };
  var touchedRecords = [];

  Object.keys(groups).forEach(function(groupKey) {
    var entries = groups[groupKey];
    if (!entries || entries.length <= 1) return;

    entries.sort(function(a, b) {
      return a.rowNumber - b.rowNumber;
    });

    resumen.groupsProcessed += 1;
    resumen.usersConsolidated += entries.length;

    var canonical = entries[0];
    var mergedLocalsMap = {};
    var canonicalValues = canonical.record;

    entries.forEach(function(entry) {
      touchedRecords.push(entry.record);
      parseLocalScope_(entry.record.local).forEach(function(localName) {
        if (!localName) return;
        mergedLocalsMap[normalizarTexto(localName)] = localName;
      });

      resolveAssignedLocalsForUserRecord_(entry.record).forEach(function(localName) {
        if (!localName) return;
        mergedLocalsMap[normalizarTexto(localName)] = localName;
      });

      if (!canonicalValues.usuarioLogin && entry.record.usuarioLogin) canonicalValues.usuarioLogin = entry.record.usuarioLogin;
      if (!canonicalValues.email && entry.record.email) canonicalValues.email = entry.record.email;
      if (!canonicalValues.telefono && entry.record.telefono) canonicalValues.telefono = entry.record.telefono;
      if (!canonicalValues.cargo && entry.record.cargo) canonicalValues.cargo = entry.record.cargo;
      if (!canonicalValues.observaciones && entry.record.observaciones) canonicalValues.observaciones = entry.record.observaciones;
    });

    canonicalValues.local = Object.keys(mergedLocalsMap).map(function(key) {
      return mergedLocalsMap[key];
    }).sort(function(a, b) {
      return a.localeCompare(b, "es");
    }).join(", ");

    writeManagedUserToSheet_(context, canonical.rowNumber, canonicalValues);
    syncStructuredAssignmentsForManagedUser_(canonicalValues);
    touchedRecords.push(canonicalValues);

    for (var j = 1; j < usuariosLocalesContext.data.length; j++) {
      var assignment = buildUserLocalRecordFromSheetRow_(usuariosLocalesContext.data[j], usuariosLocalesContext.headerMap, j + 1);
      if (!assignment.localNombre) continue;

      var isFromGroup = entries.some(function(entry) {
        return (
          (assignment.idUsuario && entry.record.idUsuario && normalizarTexto(assignment.idUsuario) === normalizarTexto(entry.record.idUsuario)) ||
          (assignment.usuarioLogin && entry.record.usuarioLogin && normalizarTexto(assignment.usuarioLogin) === normalizarTexto(entry.record.usuarioLogin))
        );
      });
      if (!isFromGroup) continue;

      upsertSheetRecordByRowNumber_(
        HOJA_USUARIOS_LOCALES,
        USUARIOS_LOCALES_HEADERS,
        {
          idAsignacion: ["id_asignacion"],
          idUsuario: ["id_usuario"],
          usuarioLogin: ["usuario_login"],
          rol: ["rol"],
          idLocal: ["id_local"],
          localNombre: ["local_nombre"],
          activo: ["activo"],
          fechaCreacion: ["fecha_creacion"],
          observaciones: ["observaciones"]
        },
        assignment.rowNumber,
        {
          idAsignacion: assignment.idAsignacion || Utilities.getUuid(),
          idUsuario: canonicalValues.idUsuario,
          usuarioLogin: canonicalValues.usuarioLogin,
          rol: canonicalValues.rol,
          idLocal: assignment.idLocal,
          localNombre: assignment.localNombre,
          activo: assignment.activo ? "SI" : "NO",
          fechaCreacion: assignment.fechaCreacion || canonicalValues.fechaCreacion || formatTodayDateForSheet_(),
          observaciones: assignment.observaciones || "Asignacion consolidada a usuario canonico"
        }
      );
      resumen.assignmentsRebound += 1;
    }

    entries.slice(1).forEach(function(entry) {
      var duplicateValues = buildManagedUserValues_(context, {
        idUsuario: entry.record.idUsuario,
        nombreCompleto: entry.record.nombreCompleto,
        usuarioLogin: entry.record.usuarioLogin,
        pin: entry.record.pin,
        rol: entry.record.rol,
        local: "",
        cargo: entry.record.cargo,
        activo: "NO",
        email: entry.record.email,
        telefono: entry.record.telefono,
        fechaCreacion: entry.record.fechaCreacion,
        observaciones: "Consolidado en " + canonicalValues.idUsuario + " el 2026-08-10"
      }, entry.record);
      writeManagedUserToSheet_(context, entry.rowNumber, duplicateValues);
      resumen.rowsDisabled += 1;
    });
  });

  refreshAttendancePublicEmployeesForRecords_(touchedRecords);

  return resumen;
}

function migrarUsuariosUnicosAdmin(params) {
  requireAdminSession(params);
  return responderJSON({
    status: "SUCCESS",
    mensaje: "Migracion de usuarios unicos completada.",
    resumen: ejecutarMigracionUsuariosUnicos_()
  });
}

function actualizarPermisosRolAdmin(params) {
  requireAdminSession(params);

  var roleName = String(params.role || "").trim();
  if (!roleName) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar el rol a actualizar."
    });
  }

  var rolesContext = getRolesPermisosSheetContext_();
  if (!rolesContext) {
    return responderJSON({
      status: "ERROR_HOJA",
      mensaje: "La hoja RolesPermisos no está disponible."
    });
  }

  var targetRowNumber = 0;
  for (var i = 1; i < rolesContext.data.length; i++) {
    if (isRole_(rolesContext.data[i][rolesContext.roleIndex], roleName)) {
      targetRowNumber = i + 1;
      break;
    }
  }

  if (!targetRowNumber) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "No se encontró el rol indicado."
    });
  }

  PERMISSION_KEYS.forEach(function(permissionKey) {
    var columnIndex = getHeaderIndex_(rolesContext.headerMap, [permissionKey]);
    if (columnIndex === -1) return;
    var nextValue = parseBooleanCell_(params[permissionKey]) ? "SI" : "NO";
    rolesContext.sheet.getRange(targetRowNumber, columnIndex + 1).setValue(nextValue);
  });

  return responderJSON({
    status: "SUCCESS",
    mensaje: "Permisos actualizados correctamente.",
    role: buildRoleSummary_(roleName)
  });
}

function obtenerUsuariosPorRol(params) {
  var role = (params.role || "").trim();
  var userType = getUserTypeById_(role);

  if (!userType) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Rol no válido."
    });
  }

  if (isModernAuthEnabled_()) {
    var permissions = getRolePermissions_(role);
    if (!permissions) {
      return responderJSON({
        status: "ERROR_DATOS",
        mensaje: "Rol no habilitado."
      });
    }

    if (!userType.exposesUserList) {
      return responderJSON({
        status: "SUCCESS",
        role: userType.id,
        usuarios: []
      });
    }

    var context = getUsuariosSheetContext_();
    var usuariosMap = {};

    for (var i = 1; i < context.data.length; i++) {
      var record = buildUserRecordFromModernRow_(context.data[i], context.indices);
      if (!record.activo || !isRole_(record.rol, role) || !record.nombreCompleto) continue;

      var key = normalizarTexto(record.nombreCompleto);
      if (!usuariosMap[key]) {
        usuariosMap[key] = record.nombreCompleto;
      }
    }

    return responderJSON({
      status: "SUCCESS",
      role: userType.id,
      usuarios: Object.keys(usuariosMap).map(function(key) { return usuariosMap[key]; }).sort()
    });
  }

  if (!userType.legacySheetName) {
    return responderJSON({
      status: "ERROR_HOJA",
      mensaje: "No existe una configuración legacy para este rol."
    });
  }

  if (!userType.exposesUserList) {
    return responderJSON({
      status: "SUCCESS",
      role: userType.id,
      usuarios: []
    });
  }

  var hoja = findSheet_(userType.legacySheetName, SPREADSHEET_KEY_RRHH);
  if (!hoja) {
    return responderJSON({
      status: "ERROR_HOJA",
      mensaje: "No se encontró la hoja legacy de usuarios."
    });
  }

  var datos = hoja.getDataRange().getValues();
  var legacyUsuariosMap = {};
  for (var j = 1; j < datos.length; j++) {
    var nombre = String(datos[j][0] || "").trim();
    if (!nombre) continue;
    var key = normalizarTexto(nombre);
    if (!legacyUsuariosMap[key]) {
      legacyUsuariosMap[key] = nombre;
    }
  }

  return responderJSON({
    status: "SUCCESS",
    role: userType.id,
    usuarios: Object.keys(legacyUsuariosMap).map(function(key) { return legacyUsuariosMap[key]; }).sort()
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
    sessionToken: sessionToken,
    permissions: usuario.permissions || getRolePermissions_(usuario.role),
    allowedLocals: usuario.allowedLocals || [],
    unrestrictedLocals: Boolean(usuario.unrestrictedLocals)
  });
}

function validarSesion(params) {
  try {
    var sesion = requireSession(params);
    return responderJSON({
      status: "SUCCESS",
      role: sesion.role,
      displayName: sesion.displayName,
      userKey: sesion.userKey,
      permissions: sesion.permissions || getRolePermissions_(sesion.role),
      allowedLocals: sesion.allowedLocals || [],
      unrestrictedLocals: Boolean(sesion.unrestrictedLocals)
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
  var userType = getUserTypeById_(role);
  if (!userType) return null;

  if (isModernAuthEnabled_()) {
    var context = getUsuariosSheetContext_();
    var loginCandidate = normalizarTexto(nombreOUsuario);
    var matchedRecord = null;

    for (var i = 1; i < context.data.length; i++) {
      var record = buildUserRecordFromModernRow_(context.data[i], context.indices);
      if (!record.activo || !isRole_(record.rol, role)) continue;
      if (record.pin !== pin) continue;

      var matchesCredential = userType.credentialMode === "username"
        ? (
          normalizarTexto(record.usuarioLogin) === loginCandidate ||
          normalizarTexto(record.nombreCompleto) === loginCandidate
        )
        : (
          normalizarTexto(record.nombreCompleto) === loginCandidate ||
          normalizarTexto(record.usuarioLogin) === loginCandidate
        );

      if (matchesCredential) {
        matchedRecord = record;
        break;
      }
    }

    if (!matchedRecord) return null;

    var principalKey = buildSessionPrincipalKey_(matchedRecord, role);
    return buildSessionContextFromAssignments_(role, collectAssignmentsByRolePrincipal_(role, principalKey));
  }

  if (!userType.legacySheetName) return null;

  var hoja = findSheet_(userType.legacySheetName, SPREADSHEET_KEY_RRHH);
  if (!hoja) return null;

  var datos = hoja.getDataRange().getValues();
  for (var j = 1; j < datos.length; j++) {
    var nombreFila = String(datos[j][0] || "").trim();
    var credencial = String(datos[j][userType.legacyCredentialColumnIndex] || "").trim();
    var pinFila = String(datos[j][userType.legacyPinColumnIndex] || "").trim();

    if (
      normalizarTexto(credencial) === normalizarTexto(nombreOUsuario) &&
      pinFila === pin
    ) {
      return {
        role: userType.id,
        displayName: nombreFila,
        userKey: nombreFila,
        principalKey: userType.credentialMode === "username"
          ? "login:" + normalizarTexto(credencial)
          : "name:" + normalizarTexto(nombreFila),
        permissions: getRolePermissions_(userType.id),
        allowedLocals: [],
        unrestrictedLocals: true
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

  var hoja = getSheet_(HOJA_SESIONES, SPREADSHEET_KEY_RRHH);
  var datos = hoja.getDataRange().getValues();

  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][0] || "").trim() !== token) continue;

    var expiresAt = new Date(datos[i][4]);
    if (expiresAt.getTime() <= Date.now()) {
      hoja.deleteRow(i + 1);
      throw crearErrorAuth("UNAUTHORIZED", "La sesión expiró.");
    }

    var sessionData = {
      sessionToken: token,
      role: String(datos[i][1] || "").trim(),
      displayName: String(datos[i][2] || "").trim(),
      userKey: String(datos[i][3] || "").trim(),
      principalKey: String(datos[i][5] || "").trim()
    };

    return refreshSessionFromUsersSheet_(hoja, i + 1, sessionData);
  }

  throw crearErrorAuth("UNAUTHORIZED", "La sesión no existe.");
}

function requireAdminSession(params) {
  var sesion = requireSession(params);
  if (!isRole_(sesion.role, USER_TYPES.ADMINISTRADOR.id)) {
    throw crearErrorAuth("FORBIDDEN", "No tienes permisos para esta acción.");
  }
  return sesion;
}

function requirePermissionSession(params, permissionName) {
  var sesion = requireSession(params);
  var permissions = sesion.permissions || getRolePermissions_(sesion.role);
  var local = String(params.local || "").trim();
  var hasScopedLocalRestriction = !sesion.unrestrictedLocals && local;
  var hasAllowedLocals = Array.isArray(sesion.allowedLocals) && sesion.allowedLocals.length > 0;

  if (!permissions || !permissions[permissionName]) {
    throw crearErrorAuth("FORBIDDEN", "No tienes permisos para esta acción.");
  }

  if (hasScopedLocalRestriction && !hasAllowedLocals) {
    throw crearErrorAuth("FORBIDDEN", "Tu sesión no tiene locales habilitados para esta acción.");
  }

  if (
    hasScopedLocalRestriction &&
    !sesion.allowedLocals.some(function(item) {
      return normalizarTexto(item) === normalizarTexto(local);
    })
  ) {
    throw crearErrorAuth("FORBIDDEN", "No tienes permisos para operar en ese local.");
  }

  sesion.permissions = permissions;
  return sesion;
}

function requireProgramadorSession(params) {
  return requirePermissionSession(params, "puede_programar_turnos");
}

function requireTurnosAbiertosSession(params) {
  return requirePermissionSession(params, "puede_ver_turnos_abiertos");
}

function requireColaboradoresLocalSession(params) {
  return requirePermissionSession(params, "puede_ver_colaboradores_local");
}

function requirePlantillasTurnosSession(params) {
  return requirePermissionSession(params, "puede_gestionar_plantillas_turnos");
}

function requireCopiarSemanasSession(params) {
  return requirePermissionSession(params, "puede_copiar_semanas");
}

function requireEliminarTurnosSession(params) {
  return requirePermissionSession(params, "puede_eliminar_turnos");
}

function requireColaboradorSession(params) {
  return requirePermissionSession(params, "puede_ver_mis_turnos");
}

function guardarSesion(token, usuario) {
  var hoja = getOrCreateSheetSesiones();
  hoja.appendRow([
    token,
    usuario.role,
    usuario.displayName,
    usuario.userKey,
    new Date(Date.now() + DURACION_SESION_MINUTOS * 60 * 1000).toISOString(),
    usuario.principalKey || ""
  ]);
}

function eliminarSesion(token) {
  var hoja = findSheet_(HOJA_SESIONES, SPREADSHEET_KEY_RRHH);
  if (!hoja) return;

  var datos = hoja.getDataRange().getValues();
  for (var i = datos.length - 1; i >= 1; i--) {
    if (String(datos[i][0] || "").trim() === token) {
      hoja.deleteRow(i + 1);
    }
  }
}

function getOrCreateSheetSesiones() {
  return getOrCreateSheet_(HOJA_SESIONES, SPREADSHEET_KEY_RRHH, [
    "sessionToken",
    "role",
    "displayName",
    "userKey",
    "expiresAt",
    "principalKey"
  ]);
}

function crearErrorAuth(code, message) {
  var error = new Error(message);
  error.code = code;
  return error;
}
