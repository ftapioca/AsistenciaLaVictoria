const SPREADSHEET_KEY_RRHH = "rrhh";
const SPREADSHEET_KEY_VENTAS = "ventas";
const SPREADSHEET_KEY_COMISIONES = "comisiones";
const SPREADSHEET_KEY_CUADRATURAS = "cuadraturas";

const SPREADSHEET_PROPERTY_BY_KEY = {
  rrhh: "LV_SPREADSHEET_RRHH_ID",
  ventas: "LV_SPREADSHEET_VENTAS_ID",
  comisiones: "LV_SPREADSHEET_COMISIONES_ID",
  cuadraturas: "LV_SPREADSHEET_CUADRATURAS_ID"
};

var SPREADSHEET_CACHE = {};

function getSpreadsheetByKey_(key) {
  var spreadsheetKey = String(key || SPREADSHEET_KEY_RRHH).trim().toLowerCase();
  var propertyName = SPREADSHEET_PROPERTY_BY_KEY[spreadsheetKey];

  if (!propertyName) {
    throw new Error('No existe configuración de spreadsheet para la clave "' + spreadsheetKey + '".');
  }

  if (SPREADSHEET_CACHE[spreadsheetKey]) {
    return SPREADSHEET_CACHE[spreadsheetKey];
  }

  var spreadsheetId = PropertiesService
    .getScriptProperties()
    .getProperty(propertyName);

  if (!spreadsheetId) {
    throw new Error('Falta configurar la Script Property "' + propertyName + '".');
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  SPREADSHEET_CACHE[spreadsheetKey] = spreadsheet;
  return spreadsheet;
}

function getSheet_(sheetName, spreadsheetKey) {
  var hoja = findSheet_(sheetName, spreadsheetKey);

  if (!hoja) {
    throw new Error('No se encontró la hoja "' + sheetName + '" en el spreadsheet "' + spreadsheetKey + '".');
  }

  return hoja;
}

function findSheet_(sheetName, spreadsheetKey) {
  return getSpreadsheetByKey_(spreadsheetKey).getSheetByName(sheetName);
}

function getOrCreateSheet_(sheetName, spreadsheetKey, headers) {
  var spreadsheet = getSpreadsheetByKey_(spreadsheetKey);
  var hoja = spreadsheet.getSheetByName(sheetName);
  if (hoja) return hoja;

  hoja = spreadsheet.insertSheet(sheetName);

  if (headers && headers.length) {
    hoja.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  return hoja;
}
