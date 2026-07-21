const HOJA_FERIADOS = "Feriados";

const HORARIO_LOCALES_HEADERS = [
  "Local",
  "DiaSemana",
  "HoraApertura",
  "HoraCierre",
  "PermiteTrasnoche",
  "Activo"
];

const HORARIO_ESPECIAL_HEADERS = [
  "Fecha",
  "Local",
  "NombreEvento",
  "HoraApertura",
  "HoraCierre",
  "PermiteTrasnoche",
  "TipoEspecial",
  "Activo",
  "Observaciones"
];

const FERIADOS_HEADERS = [
  "Fecha",
  "Festividad",
  "Tipo de Feriado"
];

function getRowValueByHeaderOrder_(row, headers, headerName) {
  var index = headers.indexOf(headerName);
  if (index === -1) return "";
  return row[index];
}

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

  if (values.activo === "NO") {
    values.horaApertura = "";
    values.horaCierre = "";
    values.permiteTrasnoche = "NO";
  }

  if (!values.local || !values.diaSemana || (values.activo !== "NO" && (!values.horaApertura || !values.horaCierre))) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar local, día y, si el día está abierto, hora de apertura y hora de cierre."
    });
  }

  var result = upsertSheetRecordByRowNumber_(
    HOJA_HORARIO_LOCALES,
    HORARIO_LOCALES_HEADERS,
    {
      local: ["Local"],
      diaSemana: ["DiaSemana"],
      horaApertura: ["HoraApertura"],
      horaCierre: ["HoraCierre"],
      permiteTrasnoche: ["PermiteTrasnoche"],
      activo: ["Activo"]
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

  if (values.tipoEspecial === "Cerrado") {
    values.horaApertura = "";
    values.horaCierre = "";
    values.permiteTrasnoche = "NO";
  }

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
      fecha: ["Fecha"],
      local: ["Local"],
      nombreEvento: ["NombreEvento"],
      horaApertura: ["HoraApertura"],
      horaCierre: ["HoraCierre"],
      permiteTrasnoche: ["PermiteTrasnoche"],
      tipoEspecial: ["TipoEspecial"],
      activo: ["Activo"],
      observaciones: ["Observaciones"]
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
    festividad: String(params.festividad || params.nombre || "").trim(),
    tipoFeriado: String(params.tipoFeriado || params.tipo_de_feriado || "").trim()
  };

  if (!values.fecha || !values.festividad || !values.tipoFeriado) {
    return responderJSON({
      status: "ERROR_DATOS",
      mensaje: "Debes indicar fecha, festividad y tipo de feriado."
    });
  }

  var result = upsertSheetRecordByRowNumber_(
    HOJA_FERIADOS,
    FERIADOS_HEADERS,
    {
      fecha: ["Fecha"],
      festividad: ["Festividad"],
      tipoFeriado: ["Tipo de Feriado"]
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
    var local = getCellFromSheetMap_(row, context.headerMap, ["Local"]);
    if (!String(local || "").trim()) continue;

    items.push({
      rowNumber: i + 1,
      local: String(local || "").trim(),
      diaSemana: String(getCellFromSheetMap_(row, context.headerMap, ["DiaSemana"]) || "").trim(),
      horaApertura: formatearHoraTurnos(getCellFromSheetMap_(row, context.headerMap, ["HoraApertura"])),
      horaCierre: formatearHoraTurnos(getCellFromSheetMap_(row, context.headerMap, ["HoraCierre"])),
      permiteTrasnoche: parseBooleanCell_(getCellFromSheetMap_(row, context.headerMap, ["PermiteTrasnoche"])),
      activo: parseBooleanCell_(getCellFromSheetMap_(row, context.headerMap, ["Activo"]))
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
    var fecha = getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "Fecha");
    var local = getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "Local");
    if (!fecha || !String(local || "").trim()) continue;

    items.push({
      rowNumber: i + 1,
      fecha: normalizarFechaSheetAdmin_(fecha),
      local: String(local || "").trim(),
      nombreEvento: String(getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "NombreEvento") || "").trim(),
      horaApertura: formatearHoraTurnos(getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "HoraApertura")),
      horaCierre: formatearHoraTurnos(getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "HoraCierre")),
      permiteTrasnoche: parseBooleanCell_(getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "PermiteTrasnoche")),
      tipoEspecial: String(getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "TipoEspecial") || "").trim(),
      activo: parseBooleanCell_(getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "Activo")),
      observaciones: String(getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "Observaciones") || "").trim()
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
    var fecha = getRowValueByHeaderOrder_(row, FERIADOS_HEADERS, "Fecha");
    var festividad = getRowValueByHeaderOrder_(row, FERIADOS_HEADERS, "Festividad");
    if (!fecha || !String(festividad || "").trim()) continue;

    items.push({
      rowNumber: i + 1,
      fecha: normalizarFechaSheetAdmin_(fecha),
      festividad: String(festividad || "").trim(),
      tipoFeriado: String(getRowValueByHeaderOrder_(row, FERIADOS_HEADERS, "Tipo de Feriado") || "").trim()
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
      local: String(getCellFromSheetMap_(row, headerMap, ["Local"]) || "").trim(),
      diaSemana: String(getCellFromSheetMap_(row, headerMap, ["DiaSemana"]) || "").trim(),
      horaApertura: formatearHoraTurnos(getCellFromSheetMap_(row, headerMap, ["HoraApertura"])),
      horaCierre: formatearHoraTurnos(getCellFromSheetMap_(row, headerMap, ["HoraCierre"])),
      permiteTrasnoche: parseBooleanCell_(getCellFromSheetMap_(row, headerMap, ["PermiteTrasnoche"])),
      activo: parseBooleanCell_(getCellFromSheetMap_(row, headerMap, ["Activo"]))
    };
  }

  if (sheetName === HOJA_HORARIO_ESPECIAL_LOCALES) {
    return {
      rowNumber: rowNumber,
      fecha: normalizarFechaSheetAdmin_(getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "Fecha")),
      local: String(getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "Local") || "").trim(),
      nombreEvento: String(getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "NombreEvento") || "").trim(),
      horaApertura: formatearHoraTurnos(getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "HoraApertura")),
      horaCierre: formatearHoraTurnos(getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "HoraCierre")),
      permiteTrasnoche: parseBooleanCell_(getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "PermiteTrasnoche")),
      tipoEspecial: String(getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "TipoEspecial") || "").trim(),
      activo: parseBooleanCell_(getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "Activo")),
      observaciones: String(getRowValueByHeaderOrder_(row, HORARIO_ESPECIAL_HEADERS, "Observaciones") || "").trim()
    };
  }

  return {
    rowNumber: rowNumber,
    fecha: normalizarFechaSheetAdmin_(getRowValueByHeaderOrder_(row, FERIADOS_HEADERS, "Fecha")),
    festividad: String(getRowValueByHeaderOrder_(row, FERIADOS_HEADERS, "Festividad") || "").trim(),
    tipoFeriado: String(getRowValueByHeaderOrder_(row, FERIADOS_HEADERS, "Tipo de Feriado") || "").trim()
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
