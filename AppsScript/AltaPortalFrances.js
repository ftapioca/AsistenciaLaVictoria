// Ejecutar desde el editor de Apps Script. No se expone ninguna ruta web nueva.
// Las revisiones no escriben. Las aplicaciones solo agregan el local a cuentas existentes.
function revisarPortalFrancesStaging() { return ejecutarAltaPortalFrances_("staging", false); }
function aplicarPortalFrancesStaging() { return ejecutarAltaPortalFrances_("staging", true); }
function revisarPortalFrancesProduccion() { return ejecutarAltaPortalFrances_("prod", false); }
function aplicarPortalFrancesProduccion() { return ejecutarAltaPortalFrances_("prod", true); }

function ejecutarAltaPortalFrances_(entorno, aplicar) {
  var destinos = {
    staging: { script: "15nZiXRV6dyibRDArTPMw-RSvvUrDBY-EkxQsgsFbzf-oBxu2xu4x2JtD", sheet: "1tA0FXwYGWUtYzA-t6uswin4Gwdj-JoOycEXEF09AqHQ" },
    prod: { script: "1uG6sezttQj-OVnWF63Lo4K8demlLKRd8sfVwtFEyr-U0UAcog-y-A2UJ", sheet: "1gVYjLSWMK7kkTJycXfOGkysvc4zyBBk8U9Jp4HK9V74" }
  };
  var destino = destinos[entorno];
  if (!destino || ScriptApp.getScriptId() !== destino.script) throw new Error("El entorno no corresponde a este proyecto Apps Script.");
  var spreadsheet = getSpreadsheetByKey_(SPREADSHEET_KEY_RRHH);
  if (spreadsheet.getId() !== destino.sheet) throw new Error("La base RRHH no corresponde al entorno esperado.");
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var tablas = {};
    ["Locales", "HorarioLocales", "Usuarios", "UsuariosLocales"].forEach(function(nombre) {
      var hoja = spreadsheet.getSheetByName(nombre);
      if (!hoja) throw new Error("Falta la hoja " + nombre + ". No se modificaron datos.");
      tablas[nombre] = hoja.getDataRange().getValues();
    });
    var plan = planificarAltaPortalFrances_(tablas, entorno === "prod", Utilities.formatDate(new Date(), "America/Santiago", "yyyy-MM-dd"));
    var resumen = { entorno: entorno, modo: aplicar ? "APLICAR" : "REVISION_SIN_ESCRITURA", local: "Portal Frances", cambios: plan.cambios.length, usuarios: plan.usuarios, omitidos: plan.omitidos };
    if (aplicar) {
      plan.cambios.forEach(function(cambio) {
        var rango = spreadsheet.getSheetByName(cambio.hoja).getRange(cambio.fila, cambio.columna, 1, cambio.valores.length);
        // La validacion legacy de local unico no admite el espejo multi-local.
        if (cambio.hoja === "Usuarios") rango.clearDataValidations();
        rango.setValues([cambio.valores]);
      });
      SpreadsheetApp.flush();
      // Verificar lo persistido; una segunda ejecucion no debe generar cambios.
      Object.keys(tablas).forEach(function(nombre) { tablas[nombre] = spreadsheet.getSheetByName(nombre).getDataRange().getValues(); });
      var pendiente = planificarAltaPortalFrances_(tablas, entorno === "prod", Utilities.formatDate(new Date(), "America/Santiago", "yyyy-MM-dd"));
      if (pendiente.cambios.length) throw new Error("La verificacion detecto cambios pendientes. Revisar y volver a ejecutar la revision; no crea usuarios nuevos.");
      resumen.verificado = true;
      if (typeof refreshAttendancePublicEmployeesForLocals_ === "function") {
        try { refreshAttendancePublicEmployeesForLocals_(["Portal Frances"]); }
        catch (error) { resumen.avisoCache = "Datos guardados; no se pudo refrescar el cache publico. " + error.message; }
      }
    }
    // Nunca registrar filas de Usuarios, PIN ni tokens.
    console.log(JSON.stringify(resumen));
    return resumen;
  } finally { lock.releaseLock(); }
}

function planificarAltaPortalFrances_(tablas, exigirTodos, fecha) {
  return planificarAltaLocal_(tablas, {
    nombre: "Portal Frances", codigo: "PORTAL_FRANCES", idLocal: "local_portal_frances",
    horarios: [1, 2, 3, 4, 5, 6, 7].map(function() { return { HoraApertura: "11:00", HoraCierre: "00:00", PermiteTrasnoche: "SI", Activo: "SI" }; }),
    usuarios: ["Jocelyn Morales", "Matias Velasquez", "Evelyn Riffo", "Mateo Montecinos", "Candy Carmona"],
    rolesRequeridos: { "Candy Carmona": "Supervisor" }
  }, exigirTodos, fecha);
}
