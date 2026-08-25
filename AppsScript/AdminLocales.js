const HOJA_LOCALES = "Locales";

const LOCALES_HEADERS = [
  "id_local",
  "codigo",
  "nombre",
  "estado",
  "permite_programacion",
  "permite_asistencia",
  "usa_horario_base",
  "local_origen_copia_horario",
  "fecha_creacion",
  "fecha_desactivacion",
  "observaciones"
];

const LOCALES_ESTADOS = {
  ACTIVO: "ACTIVO",
  INACTIVO: "INACTIVO"
};

const LEGACY_LOCALES_DEFAULT = [
  "Paseo del Lago",
  "Segunda Faja"
];

function bootstrapAdministracionLocales(params) {
  requireAdminSession(params);

  var seedResult = ensureLocalesCatalogReady_();
  var locales = listManagedLocales_();

  return responderJSON({
    status: "SUCCESS",
    meta: {
      seeded: seedResult.seeded,
      seededCount: seedResult.seededCount,
      backfilled: seedResult.backfilled,
      backfilledCount: seedResult.backfilledCount
    },
    locales: locales
  });
}

function guardarLocalAdmin(params) {
  requireAdminSession(params);
  ensureLocalesCatalogReady_();

  var rowNumber = Number(params.rowNumber || 0);
  var existingRecord = rowNumber ? findLocalByRowNumber_(rowNumber) : null;
  if (rowNumber && !existingRecord) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "No se encontro el local indicado."
    });
  }

  var nombre = String(params.nombre || "").trim();
  var requestedCode = String(params.codigo || "").trim();
  var estado = normalizeLocalState_(params.estado);
  var existingId = existingRecord ? existingRecord.idLocal : "";
  var idLocal = String(params.idLocal || params.id_local || existingId || "").trim();

  if (!nombre) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar el nombre del local."
    });
  }

  if (isUnrestrictedLocalValue_(nombre)) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: 'El nombre indicado corresponde a un alcance global de permisos y no puede registrarse como local.'
    });
  }

  if (existingRecord && normalizarTexto(existingRecord.nombre) !== normalizarTexto(nombre)) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "No se puede renombrar un local existente mientras los modulos operativos sigan resolviendo permisos por nombre."
    });
  }

  if (!idLocal) {
    idLocal = generateOpaqueLocalId_();
  }

  var localCode = requestedCode || generateLocalCode_(nombre);
  localCode = sanitizeLocalCode_(localCode);
  if (!localCode) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "No se pudo generar un codigo valido para el local."
    });
  }

  var duplicateById = findLocalByField_("id_local", idLocal, rowNumber);
  if (duplicateById) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Ya existe un local con ese id_local."
    });
  }

  var duplicateByCode = findLocalByField_("codigo", localCode, rowNumber);
  if (duplicateByCode) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Ya existe un local con ese codigo."
    });
  }

  var duplicateByName = findLocalByField_("nombre", nombre, rowNumber);
  if (duplicateByName) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Ya existe un local con ese nombre."
    });
  }

  var fechaCreacion = existingRecord && existingRecord.fechaCreacion
    ? existingRecord.fechaCreacion
    : todaySheetDate_();

  var fechaDesactivacion = estado === LOCALES_ESTADOS.INACTIVO
    ? String(params.fechaDesactivacion || params.fecha_desactivacion || (existingRecord && existingRecord.fechaDesactivacion) || todaySheetDate_()).trim()
    : "";

  var values = {
    idLocal: idLocal,
    codigo: localCode,
    nombre: nombre,
    estado: estado,
    permiteProgramacion: parseBooleanCell_(params.permiteProgramacion || params.permite_programacion || (existingRecord && existingRecord.permiteProgramacion ? "SI" : "")) ? "SI" : "NO",
    permiteAsistencia: parseBooleanCell_(params.permiteAsistencia || params.permite_asistencia || (existingRecord && existingRecord.permiteAsistencia ? "SI" : "")) ? "SI" : "NO",
    usaHorarioBase: parseBooleanCell_(params.usaHorarioBase || params.usa_horario_base || (existingRecord && existingRecord.usaHorarioBase ? "SI" : "")) ? "SI" : "NO",
    localOrigenCopiaHorario: String(params.localOrigenCopiaHorario || params.local_origen_copia_horario || "").trim(),
    fechaCreacion: fechaCreacion,
    fechaDesactivacion: fechaDesactivacion,
    observaciones: String(params.observaciones || "").trim()
  };

  if (values.localOrigenCopiaHorario && normalizarTexto(values.localOrigenCopiaHorario) === normalizarTexto(values.nombre)) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "El local origen para copiar horario no puede ser el mismo local."
    });
  }

  var result = upsertSheetRecordByRowNumber_(
    HOJA_LOCALES,
    LOCALES_HEADERS,
    {
      idLocal: ["id_local"],
      codigo: ["codigo"],
      nombre: ["nombre"],
      estado: ["estado"],
      permiteProgramacion: ["permite_programacion"],
      permiteAsistencia: ["permite_asistencia"],
      usaHorarioBase: ["usa_horario_base"],
      localOrigenCopiaHorario: ["local_origen_copia_horario"],
      fechaCreacion: ["fecha_creacion"],
      fechaDesactivacion: ["fecha_desactivacion"],
      observaciones: ["observaciones"]
    },
    rowNumber,
    values
  );

  return responderJSON({
    status: "SUCCESS",
    mensaje: rowNumber ? "Local actualizado correctamente." : "Local creado correctamente.",
    item: result
  });
}

function desactivarLocalAdmin(params) {
  requireAdminSession(params);
  ensureLocalesCatalogReady_();

  var rowNumber = Number(params.rowNumber || 0);
  var match = findLocalByRowNumber_(rowNumber);

  if (!match) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar una fila valida."
    });
  }

  var result = upsertSheetRecordByRowNumber_(
    HOJA_LOCALES,
    LOCALES_HEADERS,
    {
      estado: ["estado"],
      fechaDesactivacion: ["fecha_desactivacion"]
    },
    rowNumber,
    {
      estado: LOCALES_ESTADOS.INACTIVO,
      fechaDesactivacion: todaySheetDate_()
    }
  );

  return responderJSON({
    status: "SUCCESS",
    mensaje: "Local desactivado correctamente.",
    item: result
  });
}

function listManagedLocales_() {
  ensureLocalesCatalogReady_();
  var context = getAdminSheetContext_(HOJA_LOCALES, LOCALES_HEADERS);
  var items = [];

  for (var i = 1; i < context.data.length; i++) {
    var row = context.data[i];
    var nombre = String(getCellFromSheetMap_(row, context.headerMap, ["nombre"]) || "").trim();
    if (!nombre) continue;
    if (isReservedPseudoLocal_(nombre)) continue;
    items.push(buildLocalRecordFromSheetRow_(row, context.headerMap, i + 1));
  }

  items.sort(function(a, b) {
    if (a.estado !== b.estado) {
      return a.estado === LOCALES_ESTADOS.ACTIVO ? -1 : 1;
    }
    return a.nombre.localeCompare(b.nombre, "es");
  });

  return items;
}

function listarLocalesCatalogo_(options) {
  var config = options || {};
  return listManagedLocales_().filter(function(record) {
    if (config.onlyActive && !record.activo) return false;
    if (config.requireProgramacion && !record.permiteProgramacion) return false;
    if (config.requireAsistencia && !record.permiteAsistencia) return false;
    return true;
  });
}

function mapLocalRecordToOption_(record) {
  return {
    id: String(record.idLocal || "").trim() || generateStableLocalIdForSeed_(record.nombre || "local"),
    nombre: String(record.nombre || "").trim(),
    codigo: String(record.codigo || "").trim(),
    estado: String(record.estado || "").trim(),
    activo: Boolean(record.activo),
    permiteProgramacion: Boolean(record.permiteProgramacion),
    permiteAsistencia: Boolean(record.permiteAsistencia),
    usaHorarioBase: Boolean(record.usaHorarioBase)
  };
}

function filtrarLocalesPorSesion_(records, sesion) {
  if (!sesion || sesion.unrestrictedLocals) {
    return records.slice();
  }

  var allowedLocals = Array.isArray(sesion.allowedLocals) ? sesion.allowedLocals : [];
  if (!allowedLocals.length) return [];

  return records.filter(function(record) {
    return allowedLocals.some(function(localName) {
      return normalizarTexto(localName) === normalizarTexto(record.nombre);
    });
  });
}

function obtenerLocalesPorSesion(params) {
  var modulo = normalizarTexto(params.modulo || "");
  var sesion;
  var records;

  if (modulo === "programador") {
    sesion = requireProgramadorSession(params);
    records = filtrarLocalesPorSesion_(
      listarLocalesCatalogo_({ onlyActive: true, requireProgramacion: true }),
      sesion
    );
  } else if (modulo === "turnos_abiertos" || modulo === "turnosabiertos") {
    sesion = requireTurnosAbiertosSession(params);
    records = filtrarLocalesPorSesion_(
      listarLocalesCatalogo_({ onlyActive: true, requireAsistencia: true }),
      sesion
    );
  } else if (modulo === "horarios") {
    sesion = requireAdminSession(params);
    records = listarLocalesCatalogo_({ onlyActive: false });
  } else if (modulo === "pagos") {
    sesion = requireAdminSession(params);
    records = listarLocalesCatalogo_({ onlyActive: true, requireProgramacion: true });
  } else {
    sesion = requireSession(params);
    records = filtrarLocalesPorSesion_(
      listarLocalesCatalogo_({ onlyActive: true }),
      sesion
    );
  }

  return responderJSON({
    status: "SUCCESS",
    modulo: modulo || "general",
    locales: records.map(mapLocalRecordToOption_)
  });
}

function ensureLocalesCatalogReady_() {
  var context = getAdminSheetContext_(HOJA_LOCALES, LOCALES_HEADERS);
  var existingByName = {};
  var hasRecords = false;

  for (var i = 1; i < context.data.length; i++) {
    var currentName = String(getCellFromSheetMap_(context.data[i], context.headerMap, ["nombre"]) || "").trim();
    if (!currentName) continue;
    hasRecords = true;
    existingByName[normalizarTexto(currentName)] = true;
  }

  var catalog = collectLegacyLocalCatalog_();
  var insertedCount = 0;
  catalog.forEach(function(localName) {
    if (existingByName[normalizarTexto(localName)]) {
      return;
    }

    var idLocal = generateStableLocalIdForSeed_(localName);
    var localCode = sanitizeLocalCode_(generateLocalCode_(localName));
    upsertSheetRecordByRowNumber_(
      HOJA_LOCALES,
      LOCALES_HEADERS,
      {
        idLocal: ["id_local"],
        codigo: ["codigo"],
        nombre: ["nombre"],
        estado: ["estado"],
        permiteProgramacion: ["permite_programacion"],
        permiteAsistencia: ["permite_asistencia"],
        usaHorarioBase: ["usa_horario_base"],
        localOrigenCopiaHorario: ["local_origen_copia_horario"],
        fechaCreacion: ["fecha_creacion"],
        fechaDesactivacion: ["fecha_desactivacion"],
        observaciones: ["observaciones"]
      },
      0,
      {
        idLocal: idLocal,
        codigo: localCode,
        nombre: localName,
        estado: LOCALES_ESTADOS.ACTIVO,
        permiteProgramacion: "SI",
        permiteAsistencia: "SI",
        usaHorarioBase: "SI",
        localOrigenCopiaHorario: "",
        fechaCreacion: todaySheetDate_(),
        fechaDesactivacion: "",
        observaciones: "Registro inicial autogenerado para migracion controlada."
      }
    );
    insertedCount += 1;
  });

  return {
    seeded: !hasRecords && insertedCount > 0,
    seededCount: !hasRecords ? insertedCount : 0,
    backfilled: hasRecords && insertedCount > 0,
    backfilledCount: hasRecords ? insertedCount : 0
  };
}

function collectLegacyLocalCatalog_() {
  var map = {};

  function addLocal(localName) {
    var value = String(localName || "").trim();
    if (!value) return;
    if (isReservedPseudoLocal_(value)) return;
    map[normalizarTexto(value)] = value;
  }

  try {
    listarHorarioLocalesAdmin_().forEach(function(item) { addLocal(item.local); });
  } catch (error) {}

  try {
    listarHorariosEspecialesAdmin_().forEach(function(item) { addLocal(item.local); });
  } catch (error) {}

  try {
    var usuariosContext = getUsuariosSheetContext_();
    if (usuariosContext) {
      for (var i = 1; i < usuariosContext.data.length; i++) {
        var localValue = usuariosContext.indices.local === -1
          ? ""
          : usuariosContext.data[i][usuariosContext.indices.local];
        parseLocalScope_(localValue).forEach(addLocal);
      }
    }
  } catch (error) {}

  try {
    var colaboradoresSheet = findSheet_("Colaboradores", SPREADSHEET_KEY_RRHH);
    if (colaboradoresSheet) {
      var colaboradoresData = colaboradoresSheet.getDataRange().getValues();
      for (var j = 1; j < colaboradoresData.length; j++) {
        addLocal(colaboradoresData[j][3]);
      }
    }
  } catch (error) {}

  if (!Object.keys(map).length) {
    LEGACY_LOCALES_DEFAULT.forEach(addLocal);
  }

  return Object.keys(map).map(function(key) {
    return map[key];
  }).sort(function(a, b) {
    return a.localeCompare(b, "es");
  });
}

function buildLocalRecordFromSheetRow_(row, headerMap, rowNumber) {
  var estado = normalizeLocalState_(getCellFromSheetMap_(row, headerMap, ["estado"]));
  return {
    rowNumber: rowNumber,
    idLocal: String(getCellFromSheetMap_(row, headerMap, ["id_local"]) || "").trim(),
    codigo: String(getCellFromSheetMap_(row, headerMap, ["codigo"]) || "").trim(),
    nombre: String(getCellFromSheetMap_(row, headerMap, ["nombre"]) || "").trim(),
    estado: estado,
    activo: estado === LOCALES_ESTADOS.ACTIVO,
    permiteProgramacion: parseBooleanCell_(getCellFromSheetMap_(row, headerMap, ["permite_programacion"])),
    permiteAsistencia: parseBooleanCell_(getCellFromSheetMap_(row, headerMap, ["permite_asistencia"])),
    usaHorarioBase: parseBooleanCell_(getCellFromSheetMap_(row, headerMap, ["usa_horario_base"])),
    localOrigenCopiaHorario: String(getCellFromSheetMap_(row, headerMap, ["local_origen_copia_horario"]) || "").trim(),
    fechaCreacion: String(getCellFromSheetMap_(row, headerMap, ["fecha_creacion"]) || "").trim(),
    fechaDesactivacion: String(getCellFromSheetMap_(row, headerMap, ["fecha_desactivacion"]) || "").trim(),
    observaciones: String(getCellFromSheetMap_(row, headerMap, ["observaciones"]) || "").trim()
  };
}

function isReservedPseudoLocal_(value) {
  var normalized = String(value || "").trim();
  if (!normalized) return true;
  return isUnrestrictedLocalValue_(normalized);
}

function findLocalByRowNumber_(rowNumber) {
  if (!rowNumber || rowNumber < 2) return null;
  var context = getAdminSheetContext_(HOJA_LOCALES, LOCALES_HEADERS);
  if (rowNumber > context.sheet.getLastRow()) return null;
  var row = context.sheet.getRange(rowNumber, 1, 1, context.sheet.getLastColumn()).getValues()[0];
  var nombre = String(getCellFromSheetMap_(row, context.headerMap, ["nombre"]) || "").trim();
  if (!nombre) return null;
  return buildLocalRecordFromSheetRow_(row, context.headerMap, rowNumber);
}

function findLocalByField_(fieldName, value, excludedRowNumber) {
  var wanted = normalizarTexto(value);
  if (!wanted) return null;

  var context = getAdminSheetContext_(HOJA_LOCALES, LOCALES_HEADERS);
  for (var i = 1; i < context.data.length; i++) {
    var rowNumber = i + 1;
    if (excludedRowNumber && rowNumber === excludedRowNumber) continue;
    var row = context.data[i];
    var fieldValue = String(getCellFromSheetMap_(row, context.headerMap, [fieldName]) || "").trim();
    if (!fieldValue) continue;
    if (normalizarTexto(fieldValue) === wanted) {
      return buildLocalRecordFromSheetRow_(row, context.headerMap, rowNumber);
    }
  }

  return null;
}

function normalizeLocalState_(value) {
  return normalizarTexto(value) === "inactivo"
    ? LOCALES_ESTADOS.INACTIVO
    : LOCALES_ESTADOS.ACTIVO;
}

function generateStableLocalIdForSeed_(name) {
  return "local_" + slugLocalToken_(name, "_");
}

function generateOpaqueLocalId_() {
  var uuid = Utilities.getUuid().replace(/-/g, "").slice(0, 12);
  return "local_" + uuid.toLowerCase();
}

function generateLocalCode_(name) {
  return slugLocalToken_(name, "_").toUpperCase().slice(0, 24);
}

function sanitizeLocalCode_(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")
    .slice(0, 24);
}

function slugLocalToken_(value, separator) {
  var normalized = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, separator || "_")
    .replace(new RegExp("^" + (separator || "_") + "+|" + (separator || "_") + "+$", "g"), "")
    .replace(new RegExp((separator || "_") + "+", "g"), separator || "_");

  return normalized || "local";
}

function todaySheetDate_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
}
