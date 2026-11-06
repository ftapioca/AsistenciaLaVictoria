function planificarAltaLocal_(tablas, config, exigirTodos, fecha) {
  var normalizar = function(valor) { return String(valor == null ? "" : valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase(); };
  var activo = function(valor) { return ["si", "true", "activo", "1"].indexOf(normalizar(valor)) !== -1; };
  var cambios = [];
  var hojas = Object.create(null);
  var requeridas = {
    Locales: ["id_local", "codigo", "nombre", "estado", "permite_programacion", "permite_asistencia", "usa_horario_base", "fecha_creacion"],
    HorarioLocales: ["Local", "DiaSemana", "HoraApertura", "HoraCierre", "PermiteTrasnoche", "Activo"],
    Usuarios: ["id_usuario", "nombre_completo", "usuario_login", "rol", "local", "activo", "pin"],
    UsuariosLocales: ["id_asignacion", "id_usuario", "usuario_login", "rol", "id_local", "local_nombre", "activo", "fecha_creacion", "observaciones"]
  };
  Object.keys(requeridas).forEach(function(nombre) {
    var datos = tablas[nombre];
    if (!datos || !datos.length) throw new Error("Faltan encabezados en " + nombre);
    var indices = Object.create(null);
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
  var locales = buscar("Locales", "nombre", config.nombre);
  if (locales.length && config.soloNuevo) throw new Error("Ya existe un local con ese nombre. Revisa el catalogo antes de crear otro.");
  if (locales.length > 1) throw new Error("El local esta duplicado en Locales.");
  var idLocal = locales.length ? String(valor("Locales", locales[0].fila, "id_local")).trim() : config.idLocal;
  if (!idLocal) throw new Error("El local existe sin id_local.");
  if (buscar("Locales", "id_local", idLocal).some(function(item) { return normalizar(valor("Locales", item.fila, "nombre")) !== normalizar(config.nombre); })) throw new Error("id_local ya utilizado por otro local.");
  var flags = { estado: "ACTIVO", permite_programacion: "SI", permite_asistencia: "SI", usa_horario_base: "SI" };
  if (locales.length) actualizar("Locales", locales[0], flags);
  else {
    if (buscar("Locales", "codigo", config.codigo).length) throw new Error("El codigo de local ya esta utilizado.");
    agregar("Locales", Object.assign({ id_local: idLocal, codigo: config.codigo, nombre: config.nombre, fecha_creacion: fecha }, flags));
  }
  var dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
  dias.forEach(function(dia, i) {
    var filas = buscar("HorarioLocales", "Local", config.nombre).filter(function(item) {
      var actual = valor("HorarioLocales", item.fila, "DiaSemana");
      return normalizar(actual) === normalizar(dia) || Number(actual) === i + 1;
    });
    if (filas.length > 1) throw new Error("Horario duplicado del local: " + dia);
    var horario = Object.assign({}, config.horarios[i]);
    // Las horas de Sheets pueden ser Date; conservar las que ya representan el horario esperado.
    if (filas.length) {
      ["HoraApertura", "HoraCierre"].forEach(function(campo) {
        var existente = valor("HorarioLocales", filas[0].fila, campo);
        if (existente instanceof Date && Utilities.formatDate(existente, "America/Santiago", "HH:mm") === horario[campo]) delete horario[campo];
      });
      actualizar("HorarioLocales", filas[0], horario);
    } else agregar("HorarioLocales", Object.assign({ Local: config.nombre, DiaSemana: dia }, horario));
  });
  var usuarios = [], omitidos = [], nuevasClaves = Object.create(null);
  config.usuarios.forEach(function(nombre) {
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
    if (config.rolesRequeridos && config.rolesRequeridos[nombre] && normalizar(rol) !== normalizar(config.rolesRequeridos[nombre])) throw new Error("El rol actual debe ser " + config.rolesRequeridos[nombre] + " para " + nombre + ". No se modifican roles globales en el alta de local.");
    var localesActuales = Object.create(null);
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
    sumarLocal(config.nombre);
    var lista = Object.keys(localesActuales).map(function(key) { return localesActuales[key]; });
    personas.forEach(function(item, i) {
      actualizar("Usuarios", item, { local: lista.join(", ") });
      var principal = login ? "login:" + normalizar(login) : "id:" + normalizar(ids[i]);
      if (nuevasClaves[principal]) return;
      nuevasClaves[principal] = true;
      var propias = asignaciones.filter(function(a) {
        return (normalizar(valor("UsuariosLocales", a.fila, "id_usuario")) === normalizar(ids[i]) || (login && normalizar(valor("UsuariosLocales", a.fila, "usuario_login")) === normalizar(login))) && normalizar(valor("UsuariosLocales", a.fila, "local_nombre")) === normalizar(config.nombre);
      });
      if (propias.length > 1) throw new Error("Asignacion del local duplicada para " + nombre);
      if (propias.length) actualizar("UsuariosLocales", propias[0], { activo: "SI", rol: rol, id_local: idLocal });
      else {
        if (buscar("UsuariosLocales", "id_asignacion", idLocal + "_" + ids[i]).length) throw new Error("id_asignacion ya utilizado para " + nombre);
        agregar("UsuariosLocales", { id_asignacion: idLocal + "_" + ids[i], id_usuario: ids[i], usuario_login: login, rol: rol, id_local: idLocal, local_nombre: config.nombre, activo: "SI", fecha_creacion: fecha, observaciones: "Alta de local desde administracion; conserva otros locales." });
      }
    });
    usuarios.push({ nombre: nombre, rol: rol, locales: lista });
  });
  return { cambios: cambios, usuarios: usuarios, omitidos: omitidos };
}

function validarSolicitudAltaLocal_(payload, tablas) {
  var nombre = String(payload.nombre || "").replace(/\s+/g, " ").trim();
  if (!nombre || nombre.length > 80 || /[\x00-\x1f]/.test(nombre) || /^(todos|todas)$/i.test(nombre)) throw new Error("Indica un nombre de local valido, de hasta 80 caracteres.");
  var codigo = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);
  if (!codigo) throw new Error("El nombre debe contener letras o numeros.");
  if (!Array.isArray(payload.horarios) || payload.horarios.length !== 7) throw new Error("Debes configurar los siete dias de la semana.");
  var horarios = payload.horarios.map(function(horario) {
    if (!horario || typeof horario !== "object") throw new Error("La configuracion diaria no es valida.");
    if (typeof horario.abierto !== "boolean") throw new Error("Indica si cada dia estara abierto o cerrado.");
    if (!horario.abierto) return { HoraApertura: "", HoraCierre: "", PermiteTrasnoche: "NO", Activo: "NO" };
    var apertura = String(horario.apertura || "");
    var cierre = String(horario.cierre || "");
    var patron = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!patron.test(apertura) || !patron.test(cierre) || apertura === cierre) throw new Error("Revisa apertura y cierre de los dias abiertos. Para medianoche utiliza 00:00.");
    return { HoraApertura: apertura, HoraCierre: cierre, PermiteTrasnoche: cierre < apertura ? "SI" : "NO", Activo: "SI" };
  });
  if (!Array.isArray(payload.usuarios) || payload.usuarios.length > 500) throw new Error("La seleccion de usuarios no es valida.");
  var headers = tablas.Usuarios[0];
  var idIndex = headers.indexOf("id_usuario"), nombreIndex = headers.indexOf("nombre_completo");
  if (idIndex === -1 || nombreIndex === -1) throw new Error("Revisa los encabezados de Usuarios.");
  var nombres = [], ids = Object.create(null);
  payload.usuarios.forEach(function(id) {
    id = String(id || "").trim();
    if (!id || ids[id]) throw new Error("La seleccion contiene identificadores vacios o repetidos.");
    ids[id] = true;
    var matches = tablas.Usuarios.slice(1).filter(function(row) { return String(row[idIndex] || "").trim() === id; });
    if (matches.length !== 1) throw new Error("No se pudo identificar una cuenta existente. Actualiza la lista de usuarios.");
    var rolIndex = headers.indexOf("rol"), activoIndex = headers.indexOf("activo");
    if (rolIndex === -1 || activoIndex === -1 || !parseBooleanCell_(matches[0][activoIndex]) || ["Colaborador", "Supervisor"].indexOf(String(matches[0][rolIndex]).trim()) === -1) throw new Error("Solo se pueden asignar colaboradores o supervisores activos.");
    var nombreUsuario = String(matches[0][nombreIndex] || "").trim();
    if (!nombreUsuario || nombres.indexOf(nombreUsuario) !== -1) throw new Error("Selecciona una sola cuenta por persona.");
    nombres.push(nombreUsuario);
  });
  return { nombre: nombre, codigo: codigo, idLocal: "local_" + codigo.toLowerCase(), horarios: horarios, usuarios: nombres, soloNuevo: true };
}

function revisarAltaLocalAdmin(params) { return ejecutarAltaLocalAdmin_(params, false); }
function crearLocalOperativoAdmin(params) { return ejecutarAltaLocalAdmin_(params, true); }

function ejecutarAltaLocalAdmin_(params, aplicar) {
  requireAdminSession(params);
  var raw = String(params.payload || "");
  if (raw.length > 100000) throw new Error("La solicitud es demasiado grande.");
  var payload;
  try { payload = JSON.parse(raw); } catch (error) { throw new Error("No se pudo leer la configuracion del local."); }
  if (!payload || typeof payload !== "object") throw new Error("La configuracion no es valida.");
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var spreadsheet = getSpreadsheetByKey_(SPREADSHEET_KEY_RRHH);
    var tablas = {}, hojas = {};
    ["Locales", "HorarioLocales", "Usuarios", "UsuariosLocales"].forEach(function(nombre) {
      var hoja = spreadsheet.getSheetByName(nombre);
      if (!hoja) throw new Error("Falta la hoja " + nombre + ". No se modificaron datos.");
      hojas[nombre] = hoja;
      tablas[nombre] = hoja.getDataRange().getValues();
    });
    var config = validarSolicitudAltaLocal_(payload, tablas);
    var fecha = Utilities.formatDate(new Date(), "America/Santiago", "yyyy-MM-dd");
    var plan = planificarAltaLocal_(tablas, config, true, fecha);
    var respuesta = { status: "SUCCESS", local: config.nombre, codigo: config.codigo, horarios: payload.horarios, usuarios: plan.usuarios, cambios: plan.cambios.length, aplicado: aplicar };
    if (!aplicar) return responderJSON(respuesta);
    var escritos = [];
    try {
      plan.cambios.forEach(function(cambio) {
        var rango = hojas[cambio.hoja].getRange(cambio.fila, cambio.columna, 1, cambio.valores.length);
        var anterior = { rango: rango, valores: rango.getValues(), validaciones: rango.getDataValidations() };
        escritos.push(anterior);
        if (cambio.hoja === "Usuarios") rango.clearDataValidations();
        rango.setValues([cambio.valores]);
      });
      SpreadsheetApp.flush();
      Object.keys(hojas).forEach(function(nombre) { tablas[nombre] = hojas[nombre].getDataRange().getValues(); });
      var verificacion = planificarAltaLocal_(tablas, Object.assign({}, config, { soloNuevo: false }), true, fecha);
      if (verificacion.cambios.length) throw new Error("La verificacion del alta no coincide con los datos guardados.");
    } catch (error) {
      var incompleta = false;
      escritos.reverse().forEach(function(anterior) {
        try { anterior.rango.clearDataValidations(); anterior.rango.setValues(anterior.valores); anterior.rango.setDataValidations(anterior.validaciones); }
        catch (rollbackError) { incompleta = true; }
      });
      SpreadsheetApp.flush();
      if (incompleta) throw new Error("No se pudo completar ni restaurar toda el alta. Revisa Locales y Usuarios antes de reintentar.");
      throw new Error("No se guardo el alta; se restauraron los valores anteriores. " + error.message);
    }
    respuesta.verificado = true;
    try { refreshAttendancePublicEmployeesForLocals_([config.nombre]); }
    catch (error) { respuesta.aviso = "Local creado. La lista publica puede tardar unos minutos en actualizarse."; }
    return responderJSON(respuesta);
  } finally { lock.releaseLock(); }
}
