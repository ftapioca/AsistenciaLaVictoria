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
  var normalizar = function(valor) { return String(valor == null ? "" : valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase(); };
  var activo = function(valor) { return ["si", "true", "activo", "1"].indexOf(normalizar(valor)) !== -1; };
  var cambios = [];
  var hojas = {};
  var requeridas = {
    Locales: ["id_local", "codigo", "nombre", "estado", "permite_programacion", "permite_asistencia", "usa_horario_base", "fecha_creacion"],
    HorarioLocales: ["Local", "DiaSemana", "HoraApertura", "HoraCierre", "PermiteTrasnoche", "Activo"],
    Usuarios: ["id_usuario", "nombre_completo", "usuario_login", "rol", "local", "activo", "pin"],
    UsuariosLocales: ["id_asignacion", "id_usuario", "usuario_login", "rol", "id_local", "local_nombre", "activo", "fecha_creacion", "observaciones"]
  };
  Object.keys(requeridas).forEach(function(nombre) {
    var datos = tablas[nombre];
    if (!datos || !datos.length) throw new Error("Faltan encabezados en " + nombre);
    var indices = {};
    datos[0].forEach(function(header, i) {
      var key = normalizar(header);
      if (key && indices[key] !== undefined) throw new Error("Encabezado duplicado en " + nombre + ": " + header);
      indices[key] = i;
    });
    requeridas[nombre].forEach(function(header) { if (indices[normalizar(header)] === undefined) throw new Error("Falta encabezado " + header + " en " + nombre); });
    hojas[nombre] = { datos: datos, indices: indices, siguiente: datos.length + 1 };
  });
  function indice(hoja, campo) { return hojas[hoja].indices[normalizar(campo)]; }
  function valor(hoja, fila, campo) { return fila[indice(hoja, campo)]; }
  function buscar(hoja, campo, contenido) {
    return hojas[hoja].datos.map(function(fila, i) { return { fila: fila, numero: i + 1 }; }).filter(function(item) { return item.numero > 1 && normalizar(valor(hoja, item.fila, campo)) === normalizar(contenido); });
  }
  function actualizar(hoja, item, campos) {
    Object.keys(campos).forEach(function(campo) {
      if (String(valor(hoja, item.fila, campo)) !== String(campos[campo])) cambios.push({ hoja: hoja, fila: item.numero, columna: indice(hoja, campo) + 1, valores: [campos[campo]] });
    });
  }
  function agregar(hoja, campos) {
    var fila = hojas[hoja].datos[0].map(function() { return ""; });
    Object.keys(campos).forEach(function(campo) { fila[indice(hoja, campo)] = campos[campo]; });
    cambios.push({ hoja: hoja, fila: hojas[hoja].siguiente++, columna: 1, valores: fila });
  }
  var locales = buscar("Locales", "nombre", "Portal Frances");
  if (locales.length > 1) throw new Error("Portal Frances esta duplicado en Locales.");
  var idLocal = locales.length ? String(valor("Locales", locales[0].fila, "id_local")).trim() : "local_portal_frances";
  if (!idLocal) throw new Error("Portal Frances existe sin id_local.");
  if (buscar("Locales", "id_local", idLocal).some(function(item) { return normalizar(valor("Locales", item.fila, "nombre")) !== "portal frances"; })) throw new Error("id_local ya utilizado por otro local.");
  var flags = { estado: "ACTIVO", permite_programacion: "SI", permite_asistencia: "SI", usa_horario_base: "SI" };
  if (locales.length) actualizar("Locales", locales[0], flags);
  else {
    if (buscar("Locales", "codigo", "PORTAL_FRANCES").length) throw new Error("Codigo PORTAL_FRANCES ya utilizado.");
    agregar("Locales", Object.assign({ id_local: idLocal, codigo: "PORTAL_FRANCES", nombre: "Portal Frances", fecha_creacion: fecha }, flags));
  }
  var dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
  dias.forEach(function(dia, i) {
    var filas = buscar("HorarioLocales", "Local", "Portal Frances").filter(function(item) {
      var actual = valor("HorarioLocales", item.fila, "DiaSemana");
      return normalizar(actual) === normalizar(dia) || Number(actual) === i + 1;
    });
    if (filas.length > 1) throw new Error("Horario duplicado de Portal Frances: " + dia);
    var horario = { HoraApertura: "11:00", HoraCierre: "00:00", PermiteTrasnoche: "SI", Activo: "SI" };
    // Las horas de Sheets pueden ser Date; conservar las que ya representan el horario esperado.
    if (filas.length) {
      ["HoraApertura", "HoraCierre"].forEach(function(campo) {
        var existente = valor("HorarioLocales", filas[0].fila, campo);
        if (existente instanceof Date && Utilities.formatDate(existente, "America/Santiago", "HH:mm") === horario[campo]) delete horario[campo];
      });
      actualizar("HorarioLocales", filas[0], horario);
    } else agregar("HorarioLocales", Object.assign({ Local: "Portal Frances", DiaSemana: dia }, horario));
  });
  var usuarios = [], omitidos = [], nuevasClaves = {};
  ["Jocelyn Morales", "Matias Velasquez", "Evelyn Riffo", "Mateo Montecinos", "Candy Carmona"].forEach(function(nombre) {
    var personas = buscar("Usuarios", "nombre_completo", nombre).filter(function(item) { return activo(valor("Usuarios", item.fila, "activo")); });
    if (!personas.length) {
      if (exigirTodos) throw new Error("No se encontro la cuenta activa de " + nombre + ". No se modificaron datos.");
      omitidos.push(nombre); return;
    }
    var base = personas[0].fila;
    personas.forEach(function(item) {
      ["usuario_login", "rol", "pin"].forEach(function(campo) {
        if (String(valor("Usuarios", item.fila, campo)) !== String(valor("Usuarios", base, campo))) throw new Error("Identidad ambigua para " + nombre + ". Revisar duplicados antes de aplicar.");
      });
    });
    var rol = String(valor("Usuarios", base, "rol")).trim();
    if (["colaborador", "supervisor"].indexOf(normalizar(rol)) === -1) throw new Error("Rol no operativo para " + nombre);
    if (nombre === "Candy Carmona" && normalizar(rol) !== "supervisor") throw new Error("Candy debe figurar como Supervisor antes de aplicar; no se cambiara su rol global automaticamente.");
    var localesActuales = {};
    function sumarLocal(local) { var texto = String(local || "").trim(); if (texto) localesActuales[normalizar(texto)] = texto; }
    personas.forEach(function(item) { String(valor("Usuarios", item.fila, "local") || "").split(/[;,|/]+/).forEach(sumarLocal); });
    var login = String(valor("Usuarios", base, "usuario_login") || "").trim();
    var ids = personas.map(function(item) { return String(valor("Usuarios", item.fila, "id_usuario") || "").trim(); });
    if (ids.some(function(id) { return !id; })) throw new Error("Cuenta sin id_usuario: " + nombre);
    var colisionIdentidad = hojas.Usuarios.datos.slice(1).some(function(fila) {
      return normalizar(valor("Usuarios", fila, "nombre_completo")) !== normalizar(nombre) &&
        (ids.some(function(id) { return normalizar(valor("Usuarios", fila, "id_usuario")) === normalizar(id); }) ||
        (login && normalizar(valor("Usuarios", fila, "usuario_login")) === normalizar(login)));
    });
    if (colisionIdentidad) throw new Error("Identificador compartido con otra persona: " + nombre);
    var asignaciones = hojas.UsuariosLocales.datos.map(function(fila, i) { return { fila: fila, numero: i + 1 }; }).filter(function(item) {
      return item.numero > 1 && (ids.some(function(id) { return normalizar(valor("UsuariosLocales", item.fila, "id_usuario")) === normalizar(id); }) || (login && normalizar(valor("UsuariosLocales", item.fila, "usuario_login")) === normalizar(login)));
    });
    asignaciones.forEach(function(item) { if (activo(valor("UsuariosLocales", item.fila, "activo"))) sumarLocal(valor("UsuariosLocales", item.fila, "local_nombre")); });
    sumarLocal("Portal Frances");
    var lista = Object.keys(localesActuales).map(function(key) { return localesActuales[key]; });
    personas.forEach(function(item, i) {
      actualizar("Usuarios", item, { local: lista.join(", ") });
      var principal = login ? "login:" + normalizar(login) : "id:" + normalizar(ids[i]);
      if (nuevasClaves[principal]) return;
      nuevasClaves[principal] = true;
      var propias = asignaciones.filter(function(a) {
        return (normalizar(valor("UsuariosLocales", a.fila, "id_usuario")) === normalizar(ids[i]) || (login && normalizar(valor("UsuariosLocales", a.fila, "usuario_login")) === normalizar(login))) && normalizar(valor("UsuariosLocales", a.fila, "local_nombre")) === "portal frances";
      });
      if (propias.length > 1) throw new Error("Asignacion de Portal Frances duplicada para " + nombre);
      if (propias.length) actualizar("UsuariosLocales", propias[0], { activo: "SI", rol: rol, id_local: idLocal });
      else {
        if (buscar("UsuariosLocales", "id_asignacion", "portal_frances_" + ids[i]).length) throw new Error("id_asignacion ya utilizado para " + nombre);
        agregar("UsuariosLocales", { id_asignacion: "portal_frances_" + ids[i], id_usuario: ids[i], usuario_login: login, rol: rol, id_local: idLocal, local_nombre: "Portal Frances", activo: "SI", fecha_creacion: fecha, observaciones: "Alta Portal Frances; conserva otros locales." });
      }
    });
    usuarios.push({ nombre: nombre, rol: rol, locales: lista });
  });
  return { cambios: cambios, usuarios: usuarios, omitidos: omitidos };
}
