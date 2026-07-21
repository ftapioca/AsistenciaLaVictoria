const HOJA_FERIADOS = "Feriados";

const HORARIO_LOCALES_HEADERS = [
  "local",
  "dia_semana",
  "hora_apertura",
  "hora_cierre",
  "permite_trasnoche",
  "activo"
];

const HORARIO_ESPECIAL_HEADERS = [
  "fecha",
  "local",
  "nombre_evento",
  "hora_apertura",
  "hora_cierre",
  "permite_trasnoche",
  "tipo_especial",
  "activo",
  "observaciones"
];

const FERIADOS_HEADERS = [
  "fecha",
  "nombre",
  "local",
  "activo",
  "observaciones"
];

function bootstrapAdministracionHorarios(params) {
  requireAdminSession(params);

  var horarioLocales = listarHorarioLocalesAdmin_();
  var horariosEspeciales = listarHorariosEspecialesAdmin_();
  var feriados = listarFeriadosAdmin_();

  return responderJSON({
    status: "SUCCESS",
    meta: {
      locals: listarLocalesDisponiblesHorarios_(horarioLocales, horariosEspeciales, feriados)
    },
    horarioLocales: horarioLocales,
    horariosEspeciales: horariosEspeciales,
    feriados: feriados
  });
}

function guardarHorarioLocalAdmin(params) {
  requireAdminSession(params);

  var rowNumber = Number(params.rowNumber || 0);
  var values = {
    local: String(params.local || "").trim(),
    diaSemana: String(params.diaSemana || params.dia_semana || "").trim(),
    horaApertura: String(params.horaApertura || params.hora_apertura || "").trim(),
    horaCierre: String(params.horaCierre || params.hora_cierre || "").trim(),
    permiteTrasnoche: parseBooleanCell_(params.permiteTrasnoche || params.permite_trasnoche) ? "SI" : "NO",
    activo: parseBooleanCell_(params.activo) ? "SI" : "NO"
  };

  if (!values.local || !values.diaSemana || !values.horaApertura || !values.horaCierre) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar local, día, hora de apertura y hora de cierre."
    });
  }

  var result = upsertSheetRecordByRowNumber_(
    HOJA_HORARIO_LOCALES,
    HORARIO_LOCALES_HEADERS,
    {
      local: ["local"],
      diaSemana: ["dia_semana", "dia", "diasemana"],
      horaApertura: ["hora_apertura", "apertura"],
      horaCierre: ["hora_cierre", "cierre"],
      permiteTrasnoche: ["permite_trasnoche", "trasnoche"],
      activo: ["activo"]
    },
    rowNumber,
    values
  );

  return responderJSON({
    status: "SUCCESS",
    mensaje: rowNumber ? "Horario local actualizado." : "Horario local creado.",
    item: result
  });
}

function eliminarHorarioLocalAdmin(params) {
  requireAdminSession(params);
  return eliminarFilaAdministrable_(HOJA_HORARIO_LOCALES, Number(params.rowNumber || 0), "Horario local eliminado.");
}

function guardarHorarioEspecialLocalAdmin(params) {
  requireAdminSession(params);

  var rowNumber = Number(params.rowNumber || 0);
  var values = {
    fecha: normalizarFechaSheetAdmin_(params.fecha),
    local: String(params.local || "").trim(),
    nombreEvento: String(params.nombreEvento || params.nombre_evento || "").trim(),
    horaApertura: String(params.horaApertura || params.hora_apertura || "").trim(),
    horaCierre: String(params.horaCierre || params.hora_cierre || "").trim(),
    permiteTrasnoche: parseBooleanCell_(params.permiteTrasnoche || params.permite_trasnoche) ? "SI" : "NO",
    tipoEspecial: String(params.tipoEspecial || params.tipo_especial || "").trim(),
    activo: parseBooleanCell_(params.activo) ? "SI" : "NO",
    observaciones: String(params.observaciones || "").trim()
  };

  if (!values.fecha || !values.local || !values.nombreEvento) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar fecha, local y nombre del evento."
    });
  }

  var result = upsertSheetRecordByRowNumber_(
    HOJA_HORARIO_ESPECIAL_LOCALES,
    HORARIO_ESPECIAL_HEADERS,
    {
      fecha: ["fecha"],
      local: ["local"],
      nombreEvento: ["nombre_evento", "evento", "nombre"],
      horaApertura: ["hora_apertura", "apertura"],
      horaCierre: ["hora_cierre", "cierre"],
      permiteTrasnoche: ["permite_trasnoche", "trasnoche"],
      tipoEspecial: ["tipo_especial", "tipo"],
      activo: ["activo"],
      observaciones: ["observaciones", "observacion"]
    },
    rowNumber,
    values
  );

  return responderJSON({
    status: "SUCCESS",
    mensaje: rowNumber ? "Horario especial actualizado." : "Horario especial creado.",
    item: result
  });
}

function eliminarHorarioEspecialLocalAdmin(params) {
  requireAdminSession(params);
  return eliminarFilaAdministrable_(HOJA_HORARIO_ESPECIAL_LOCALES, Number(params.rowNumber || 0), "Horario especial eliminado.");
}

function guardarFeriadoAdmin(params) {
  requireAdminSession(params);

  var rowNumber = Number(params.rowNumber || 0);
  var values = {
    fecha: normalizarFechaSheetAdmin_(params.fecha),
    nombre: String(params.nombre || "").trim(),
    local: String(params.local || "").trim(),
    activo: parseBooleanCell_(params.activo) ? "SI" : "NO",
    observaciones: String(params.observaciones || "").trim()
  };

  if (!values.fecha || !values.nombre) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar fecha y nombre del feriado."
    });
  }

  var result = upsertSheetRecordByRowNumber_(
    HOJA_FERIADOS,
    FERIADOS_HEADERS,
    {
      fecha: ["fecha"],
      nombre: ["nombre", "feriado", "nombre_feriado"],
      local: ["local"],
      activo: ["activo"],
      observaciones: ["observaciones", "observacion"]
    },
    rowNumber,
    values
  );

  return responderJSON({
    status: "SUCCESS",
    mensaje: rowNumber ? "Feriado actualizado." : "Feriado creado.",
    item: result
  });
}

function eliminarFeriadoAdmin(params) {
  requireAdminSession(params);
  return eliminarFilaAdministrable_(HOJA_FERIADOS, Number(params.rowNumber || 0), "Feriado eliminado.");
}

function listarHorarioLocalesAdmin_() {
  var context = getAdminSheetContext_(HOJA_HORARIO_LOCALES, HORARIO_LOCALES_HEADERS);
  var items = [];

  for (var i = 1; i < context.data.length; i++) {
    var row = context.data[i];
    var local = getCellFromSheetMap_(row, context.headerMap, ["local"]);
    if (!String(local || "").trim()) continue;

    items.push({
      rowNumber: i + 1,
      local: String(local || "").trim(),
      diaSemana: String(getCellFromSheetMap_(row, context.headerMap, ["dia_semana", "dia", "diasemana"]) || "").trim(),
      horaApertura: formatearHoraTurnos(getCellFromSheetMap_(row, context.headerMap, ["hora_apertura", "apertura"])),
      horaCierre: formatearHoraTurnos(getCellFromSheetMap_(row, context.headerMap, ["hora_cierre", "cierre"])),
      permiteTrasnoche: parseBooleanCell_(getCellFromSheetMap_(row, context.headerMap, ["permite_trasnoche", "trasnoche"])),
      activo: parseBooleanCell_(getCellFromSheetMap_(row, context.headerMap, ["activo"]))
    });
  }

  items.sort(function(a, b) {
    if (a.local !== b.local) return a.local.localeCompare(b.local, "es");
    return String(a.diaSemana || "").localeCompare(String(b.diaSemana || ""), "es");
  });

  return items;
}

function listarHorariosEspecialesAdmin_() {
  var context = getAdminSheetContext_(HOJA_HORARIO_ESPECIAL_LOCALES, HORARIO_ESPECIAL_HEADERS);
  var items = [];

  for (var i = 1; i < context.data.length; i++) {
    var row = context.data[i];
    var fecha = getCellFromSheetMap_(row, context.headerMap, ["fecha"]);
    var local = getCellFromSheetMap_(row, context.headerMap, ["local"]);
    if (!fecha || !String(local || "").trim()) continue;

    items.push({
      rowNumber: i + 1,
      fecha: normalizarFechaSheetAdmin_(fecha),
      local: String(local || "").trim(),
      nombreEvento: String(getCellFromSheetMap_(row, context.headerMap, ["nombre_evento", "evento", "nombre"]) || "").trim(),
      horaApertura: formatearHoraTurnos(getCellFromSheetMap_(row, context.headerMap, ["hora_apertura", "apertura"])),
      horaCierre: formatearHoraTurnos(getCellFromSheetMap_(row, context.headerMap, ["hora_cierre", "cierre"])),
      permiteTrasnoche: parseBooleanCell_(getCellFromSheetMap_(row, context.headerMap, ["permite_trasnoche", "trasnoche"])),
      tipoEspecial: String(getCellFromSheetMap_(row, context.headerMap, ["tipo_especial", "tipo"]) || "").trim(),
      activo: parseBooleanCell_(getCellFromSheetMap_(row, context.headerMap, ["activo"])),
      observaciones: String(getCellFromSheetMap_(row, context.headerMap, ["observaciones", "observacion"]) || "").trim()
    });
  }

  items.sort(function(a, b) {
    if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha, "es");
    return a.local.localeCompare(b.local, "es");
  });

  return items;
}

function listarFeriadosAdmin_() {
  var context = getAdminSheetContext_(HOJA_FERIADOS, FERIADOS_HEADERS);
  var items = [];

  for (var i = 1; i < context.data.length; i++) {
    var row = context.data[i];
    var fecha = getCellFromSheetMap_(row, context.headerMap, ["fecha"]);
    var nombre = getCellFromSheetMap_(row, context.headerMap, ["nombre", "feriado", "nombre_feriado"]);
    if (!fecha || !String(nombre || "").trim()) continue;

    items.push({
      rowNumber: i + 1,
      fecha: normalizarFechaSheetAdmin_(fecha),
      nombre: String(nombre || "").trim(),
      local: String(getCellFromSheetMap_(row, context.headerMap, ["local"]) || "").trim(),
      activo: parseBooleanCell_(getCellFromSheetMap_(row, context.headerMap, ["activo"])),
      observaciones: String(getCellFromSheetMap_(row, context.headerMap, ["observaciones", "observacion"]) || "").trim()
    });
  }

  items.sort(function(a, b) {
    return a.fecha.localeCompare(b.fecha, "es");
  });

  return items;
}

function listarLocalesDisponiblesHorarios_(horarioLocales, horariosEspeciales, feriados) {
  var map = {};

  function addLocal(local) {
    var value = String(local || "").trim();
    if (!value) return;
    map[normalizarTexto(value)] = value;
  }

  horarioLocales.forEach(function(item) { addLocal(item.local); });
  horariosEspeciales.forEach(function(item) { addLocal(item.local); });
  feriados.forEach(function(item) { addLocal(item.local); });

  return Object.keys(map).map(function(key) { return map[key]; }).sort(function(a, b) {
    return a.localeCompare(b, "es");
  });
}

function eliminarFilaAdministrable_(sheetName, rowNumber, successMessage) {
  if (!rowNumber || rowNumber < 2) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar una fila válida."
    });
  }

  var sheet = getOrCreateSheet_(sheetName, SPREADSHEET_KEY_RRHH, []);
  if (rowNumber > sheet.getLastRow()) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "La fila indicada ya no existe."
    });
  }

  sheet.deleteRow(rowNumber);

  return responderJSON({
    status: "SUCCESS",
    mensaje: successMessage
  });
}

function getAdminSheetContext_(sheetName, headers) {
  var sheet = getOrCreateSheet_(sheetName, SPREADSHEET_KEY_RRHH, headers);
  var data = sheet.getDataRange().getValues();

  if (!data.length) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    data = [headers.slice()];
  }

  return {
    sheet: sheet,
    data: data,
    headerMap: buildHeaderIndexMap_(data[0])
  };
}

function getCellFromSheetMap_(row, headerMap, aliases) {
  for (var i = 0; i < aliases.length; i++) {
    var index = getHeaderIndex_(headerMap, [aliases[i]]);
    if (index !== -1) {
      return row[index];
    }
  }
  return "";
}

function upsertSheetRecordByRowNumber_(sheetName, headers, aliasesByField, rowNumber, values) {
  var context = getAdminSheetContext_(sheetName, headers);
  var targetRow = rowNumber && rowNumber >= 2 ? rowNumber : context.sheet.getLastRow() + 1;

  if (targetRow === 1) {
    targetRow = 2;
  }

  Object.keys(values).forEach(function(fieldKey) {
    var aliases = aliasesByField[fieldKey] || [fieldKey];
    var columnIndex = getHeaderIndex_(context.headerMap, aliases);
    if (columnIndex === -1) return;
    context.sheet.getRange(targetRow, columnIndex + 1).setValue(values[fieldKey]);
  });

  var refreshedContext = getAdminSheetContext_(sheetName, headers);
  var refreshedRow = refreshedContext.sheet.getRange(targetRow, 1, 1, refreshedContext.sheet.getLastColumn()).getValues()[0];
  return buildAdminRecordFromSheetRow_(sheetName, refreshedRow, refreshedContext.headerMap, targetRow);
}

function buildAdminRecordFromSheetRow_(sheetName, row, headerMap, rowNumber) {
  if (sheetName === HOJA_HORARIO_LOCALES) {
    return {
      rowNumber: rowNumber,
      local: String(getCellFromSheetMap_(row, headerMap, ["local"]) || "").trim(),
      diaSemana: String(getCellFromSheetMap_(row, headerMap, ["dia_semana", "dia", "diasemana"]) || "").trim(),
      horaApertura: formatearHoraTurnos(getCellFromSheetMap_(row, headerMap, ["hora_apertura", "apertura"])),
      horaCierre: formatearHoraTurnos(getCellFromSheetMap_(row, headerMap, ["hora_cierre", "cierre"])),
      permiteTrasnoche: parseBooleanCell_(getCellFromSheetMap_(row, headerMap, ["permite_trasnoche", "trasnoche"])),
      activo: parseBooleanCell_(getCellFromSheetMap_(row, headerMap, ["activo"]))
    };
  }

  if (sheetName === HOJA_HORARIO_ESPECIAL_LOCALES) {
    return {
      rowNumber: rowNumber,
      fecha: normalizarFechaSheetAdmin_(getCellFromSheetMap_(row, headerMap, ["fecha"])),
      local: String(getCellFromSheetMap_(row, headerMap, ["local"]) || "").trim(),
      nombreEvento: String(getCellFromSheetMap_(row, headerMap, ["nombre_evento", "evento", "nombre"]) || "").trim(),
      horaApertura: formatearHoraTurnos(getCellFromSheetMap_(row, headerMap, ["hora_apertura", "apertura"])),
      horaCierre: formatearHoraTurnos(getCellFromSheetMap_(row, headerMap, ["hora_cierre", "cierre"])),
      permiteTrasnoche: parseBooleanCell_(getCellFromSheetMap_(row, headerMap, ["permite_trasnoche", "trasnoche"])),
      tipoEspecial: String(getCellFromSheetMap_(row, headerMap, ["tipo_especial", "tipo"]) || "").trim(),
      activo: parseBooleanCell_(getCellFromSheetMap_(row, headerMap, ["activo"])),
      observaciones: String(getCellFromSheetMap_(row, headerMap, ["observaciones", "observacion"]) || "").trim()
    };
  }

  return {
    rowNumber: rowNumber,
    fecha: normalizarFechaSheetAdmin_(getCellFromSheetMap_(row, headerMap, ["fecha"])),
    nombre: String(getCellFromSheetMap_(row, headerMap, ["nombre", "feriado", "nombre_feriado"]) || "").trim(),
    local: String(getCellFromSheetMap_(row, headerMap, ["local"]) || "").trim(),
    activo: parseBooleanCell_(getCellFromSheetMap_(row, headerMap, ["activo"])),
    observaciones: String(getCellFromSheetMap_(row, headerMap, ["observaciones", "observacion"]) || "").trim()
  };
}

function normalizarFechaSheetAdmin_(value) {
  if (!value) return "";

  if (Object.prototype.toString.call(value) === "[object Date]") {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }

  var text = String(value || "").trim();
  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  var parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }

  return text;
}
