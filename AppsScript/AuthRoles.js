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
const HOJA_ROLES_PERMISOS = "RolesPermisos";
const HOJA_SESIONES = "Sesiones";
const DURACION_SESION_MINUTOS = 8 * 60;
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
  return "name:" + normalizarTexto(record.nombreCompleto);
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

  return matches;
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

function listManagedUsers_() {
  var context = getUsuariosSheetContext_();
  if (!context) return [];

  var users = [];
  for (var i = 1; i < context.data.length; i++) {
    var record = buildUserRecordFromModernRow_(context.data[i], context.indices);
    if (!record.nombreCompleto) continue;
    users.push(sanitizeManagedUserForAdminView_(record));
  }

  users.sort(function(a, b) {
    if (a.rol === USER_TYPES.ADMINISTRADOR.id && b.rol !== USER_TYPES.ADMINISTRADOR.id) return -1;
    if (a.rol !== USER_TYPES.ADMINISTRADOR.id && b.rol === USER_TYPES.ADMINISTRADOR.id) return 1;
    if (a.local !== b.local) return a.local.localeCompare(b.local, "es");
    return a.nombreCompleto.localeCompare(b.nombreCompleto, "es");
  });

  return users;
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

  return responderJSON({
    status: "SUCCESS",
    meta: {
      permissionKeys: PERMISSION_KEYS.slice()
    },
    roles: listManagedRoles_(),
    users: listManagedUsers_()
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

  match.context.sheet.getRange(match.rowNumber, match.context.indices.rol + 1).setValue(nextRole);
  match.record.rol = nextRole;

  return responderJSON({
    status: "SUCCESS",
    mensaje: "Rol actualizado correctamente.",
    user: match.record
  });
}

function actualizarUsuarioAdmin(params) {
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

  var nextRole = String(params.rol || params.role || "").trim();
  if (!nextRole || !getUserTypeById_(nextRole)) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar un rol válido."
    });
  }

  getRolePermissionsStrict_(nextRole);

  var existingPin = String(match.record.pin || "").trim();
  var requestedPin = String(params.pin || params.newPin || "").trim();
  var nextValues = {
    nombreCompleto: String(params.nombreCompleto || "").trim(),
    usuarioLogin: String(params.usuarioLogin || "").trim(),
    pin: requestedPin || existingPin,
    rol: nextRole,
    local: String(params.local || "").trim(),
    cargo: String(params.cargo || "").trim(),
    activo: parseBooleanCell_(params.activo),
    email: String(params.email || "").trim(),
    telefono: String(params.telefono || "").trim(),
    fechaCreacion: String(params.fechaCreacion || "").trim(),
    observaciones: String(params.observaciones || "").trim()
  };

  if (!nextValues.nombreCompleto || !nextValues.pin) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Nombre completo y PIN son obligatorios."
    });
  }

  var context = match.context;
  var fieldMap = [
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

    var cellValue = valueKey === "activo"
      ? (nextValues[valueKey] ? "SI" : "NO")
      : nextValues[valueKey];

    context.sheet.getRange(match.rowNumber, columnIndex + 1).setValue(cellValue);
  });

  var refreshedRow = context.sheet.getRange(match.rowNumber, 1, 1, context.data[0].length).getValues()[0];

  return responderJSON({
    status: "SUCCESS",
    mensaje: "Usuario actualizado correctamente.",
    user: sanitizeManagedUserForAdminView_(buildUserRecordFromModernRow_(refreshedRow, context.indices))
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
    var assignments = [];

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
        assignments.push(record);
      }
    }

    return buildSessionContextFromAssignments_(role, assignments);
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
