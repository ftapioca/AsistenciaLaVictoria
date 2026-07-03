const HOJA_IMPORTACIONES_VENTAS = "ImportacionesVentas";
const HOJA_VENTAS_POS = "VentasPOS";
const HOJA_PROPINAS_POS = "PropinasPOS";
const HOJA_VENTAS_DIARIAS = "VentasDiarias";
const HOJA_COMISIONES_DIARIAS = "ComisionesDiarias";
const HOJA_RESUMEN_MENSUAL_COMISIONES = "ResumenMensualComisiones";
const HOJA_PAGOS_POS = "PagosPOS";
const HOJA_PRODUCTOS_POS = "ProductosPOS";
const HOJA_TRAMOS_COMISIONES = "TramosComisiones";
const HOJA_CUADRATURA_PAGOS = "CuadraturaPagos";
const HOJA_KPI_VENTAS_DIARIAS = "KPIVentasDiarias";
const ESTADO_IMPORTACION_SUCCESS = "SUCCESS";
const ESTADO_IMPORTACION_PENDING = "PENDING";
const ESTADO_IMPORTACION_ERROR = "ERROR";
const ESTADO_IMPORTACION_ANULADO = "ANULADO";
const ESTADO_IMPORTACION_REEMPLAZADO = "REEMPLAZADO";

const VENTAS_SHEETS_CONFIG = [
  {
    name: HOJA_IMPORTACIONES_VENTAS,
    headers: [
      "ImportId",
      "FechaImportacion",
      "Usuario",
      "Local",
      "Periodo",
      "NombreArchivo",
      "HashArchivo",
      "Estado",
      "RegistrosVentas",
      "RegistrosPropinas",
      "VentaBrutaValida",
      "PropinasValidas",
      "Observaciones"
    ]
  },
  {
    name: HOJA_VENTAS_POS,
    headers: [
      "ImportId",
      "VentaId",
      "Fecha",
      "Hora",
      "FechaCierre",
      "Local",
      "Estado",
      "Origen",
      "TipoVenta",
      "MedioPago",
      "TotalBruto",
      "EsDelivery",
      "EsCancelada",
      "EsValidaComision",
      "MotivoExclusion"
    ]
  },
  {
    name: HOJA_PROPINAS_POS,
    headers: [
      "ImportId",
      "VentaId",
      "Fecha",
      "Hora",
      "Local",
      "MontoPropina",
      "Cancelada",
      "EsDelivery",
      "EsValidaPropina",
      "MotivoExclusion"
    ]
  },
  {
    name: HOJA_VENTAS_DIARIAS,
    headers: [
      "ImportId",
      "Fecha",
      "Local",
      "VentaBrutaValida",
      "VentaNetaValida",
      "TramoComision",
      "PorcentajeComision",
      "ComisionIndividualDiaria",
      "PropinasValidas",
      "ColaboradoresPresentes",
      "PropinaIndividualDiaria",
      "Observaciones"
    ]
  },
  {
    name: HOJA_COMISIONES_DIARIAS,
    headers: [
      "ImportId",
      "Fecha",
      "Local",
      "Colaborador",
      "ComisionDia",
      "PropinaDia",
      "TotalDia",
      "FuentePresencia",
      "Observaciones"
    ]
  },
  {
    name: HOJA_RESUMEN_MENSUAL_COMISIONES,
    headers: [
      "ImportId",
      "Periodo",
      "Local",
      "Colaborador",
      "DiasTrabajados",
      "ComisionTotal",
      "PropinaTotal",
      "TotalPagar",
      "Observaciones"
    ]
  },
  {
    name: HOJA_PAGOS_POS,
    headers: [
      "ImportId",
      "VentaId",
      "Fecha",
      "Hora",
      "Local",
      "MedioPago",
      "Monto",
      "Cancelado",
      "EsValidoCuadratura"
    ]
  },
  {
    name: HOJA_PRODUCTOS_POS,
    headers: [
      "ImportId",
      "Fecha",
      "Local",
      "Producto",
      "Categoria",
      "Cantidad",
      "TotalVendido"
    ]
  },
  {
    name: HOJA_TRAMOS_COMISIONES,
    headers: [
      "Local",
      "Tramo",
      "VentaNetaMin",
      "VentaNetaMax",
      "PorcentajeComision",
      "Activo",
      "Observaciones"
    ]
  },
  {
    name: HOJA_CUADRATURA_PAGOS,
    headers: [
      "ImportId",
      "Fecha",
      "Local",
      "Efectivo",
      "Debito",
      "Credito",
      "Voucher",
      "Transferencia",
      "Delivery",
      "TotalPagos",
      "Diferencia",
      "Observaciones"
    ]
  },
  {
    name: HOJA_KPI_VENTAS_DIARIAS,
    headers: [
      "ImportId",
      "Fecha",
      "Local",
      "VentaBruta",
      "VentaNeta",
      "CantidadVentas",
      "TicketPromedio",
      "Propinas",
      "ComisionIndividual",
      "ColaboradoresPresentes",
      "VentaPorColaborador",
      "VentaPorHoraTrabajada"
    ]
  }
];

function testVentasSheet(params) {
  requireAdminSession(params);

  var resultado = asegurarEstructuraVentasSheets_();

  return responderJSON({
    status: "SUCCESS",
    spreadsheetKey: SPREADSHEET_KEY_VENTAS,
    spreadsheetId: PropertiesService.getScriptProperties().getProperty("LV_SPREADSHEET_VENTAS_ID"),
    totalHojas: resultado.totalHojas,
    creadas: resultado.creadas,
    existentes: resultado.existentes,
    inconsistentes: resultado.inconsistentes,
    hojas: resultado.hojas
  });
}

function asegurarEstructuraVentasSheets_() {
  var resultado = {
    totalHojas: VENTAS_SHEETS_CONFIG.length,
    creadas: 0,
    existentes: 0,
    inconsistentes: 0,
    hojas: []
  };

  VENTAS_SHEETS_CONFIG.forEach(function(config) {
    var hoja = findSheet_(config.name, SPREADSHEET_KEY_VENTAS);

    if (!hoja) {
      hoja = getOrCreateSheet_(config.name, SPREADSHEET_KEY_VENTAS, config.headers);
      hoja.setFrozenRows(1);
      if (config.name === HOJA_TRAMOS_COMISIONES) {
        asegurarHojaTramosComisiones_(hoja, config.headers);
      }
      resultado.creadas++;
      resultado.hojas.push({
        hoja: config.name,
        estado: "CREADA",
        columnas: config.headers.length
      });
      return;
    }

    if (config.name === HOJA_TRAMOS_COMISIONES) {
      asegurarHojaTramosComisiones_(hoja, config.headers);
      resultado.existentes++;
      resultado.hojas.push({
        hoja: config.name,
        estado: "OK",
        columnas: config.headers.length
      });
      return;
    }

    var ultimaColumna = Math.max(hoja.getLastColumn(), config.headers.length);
    var headersActuales = ultimaColumna
      ? hoja.getRange(1, 1, 1, ultimaColumna).getValues()[0]
      : [];
    var comparacion = compararHeadersVentas_(headersActuales, config.headers);

    if (comparacion.coincide) {
      hoja.setFrozenRows(1);
      if (config.name === HOJA_TRAMOS_COMISIONES) {
        inicializarHojaTramosComisiones_(hoja);
      }
      resultado.existentes++;
      resultado.hojas.push({
        hoja: config.name,
        estado: "OK",
        columnas: config.headers.length
      });
      return;
    }

    if (!hoja.getLastRow()) {
      hoja.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
      hoja.setFrozenRows(1);
      if (config.name === HOJA_TRAMOS_COMISIONES) {
        inicializarHojaTramosComisiones_(hoja);
      }
      resultado.existentes++;
      resultado.hojas.push({
        hoja: config.name,
        estado: "INICIALIZADA",
        columnas: config.headers.length
      });
      return;
    }

    resultado.inconsistentes++;
    resultado.hojas.push({
      hoja: config.name,
      estado: "HEADER_MISMATCH",
      columnasEsperadas: config.headers.length,
      columnasActuales: headersActuales.filter(function(valor) { return String(valor || "").trim(); }).length,
      faltantes: comparacion.faltantes,
      extras: comparacion.extras
    });
  });

  return resultado;
}

function inicializarHojaTramosComisiones_(hoja) {
  if (hoja.getLastRow() > 1) {
    return;
  }

  hoja.getRange(2, 1, 4, 7).setValues([
    ["Paseo del Lago", "BAJO", 0, 499999.99, 0.01, true, "Tramo inicial por defecto."],
    ["Paseo del Lago", "ALTO", 500000, "", 0.013, true, "Tramo inicial por defecto."],
    ["Segunda Faja", "BAJO", 0, 499999.99, 0.01, true, "Tramo inicial por defecto."],
    ["Segunda Faja", "ALTO", 500000, "", 0.013, true, "Tramo inicial por defecto."]
  ]);
}

function asegurarHojaTramosComisiones_(hoja, headers) {
  var ultimaColumna = headers.length;
  var headersActuales = hoja.getLastColumn()
    ? hoja.getRange(1, 1, 1, Math.max(hoja.getLastColumn(), ultimaColumna)).getValues()[0]
    : [];
  var comparacion = compararHeadersVentas_(headersActuales, headers);

  if (!comparacion.coincide) {
    hoja.clearContents();
    hoja.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  hoja.setFrozenRows(1);
  inicializarHojaTramosComisiones_(hoja);
}

function compararHeadersVentas_(actuales, esperados) {
  var actualesNormalizados = actuales
    .map(function(valor) { return String(valor || "").trim(); })
    .filter(function(valor) { return valor !== ""; });
  var esperadosNormalizados = esperados
    .map(function(valor) { return String(valor || "").trim(); });

  var coincide = actualesNormalizados.length === esperadosNormalizados.length &&
    esperadosNormalizados.every(function(valor, indice) {
      return actualesNormalizados[indice] === valor;
    });

  var faltantes = esperadosNormalizados.filter(function(valor) {
    return actualesNormalizados.indexOf(valor) === -1;
  });

  var extras = actualesNormalizados.filter(function(valor) {
    return esperadosNormalizados.indexOf(valor) === -1;
  });

  return {
    coincide: coincide,
    faltantes: faltantes,
    extras: extras
  };
}

function importarVentas(params) {
  return responderJSON(importarVentasInterno_(params));
}

function consultarImportacionesVentas(params) {
  requireAdminSession(params);

  var hojaImportaciones = getSheet_(HOJA_IMPORTACIONES_VENTAS, SPREADSHEET_KEY_VENTAS);
  var importaciones = obtenerRegistrosImportacionesVentas_(hojaImportaciones);
  var localFiltro = normalizarTexto(params.local);
  var periodoFiltro = normalizarTexto(params.periodo);

  var filtradas = importaciones.filter(function(importacion) {
    if (localFiltro && normalizarTexto(importacion.local) !== localFiltro) {
      return false;
    }

    if (periodoFiltro && normalizarTexto(importacion.periodo) !== periodoFiltro) {
      return false;
    }

    return true;
  }).sort(function(a, b) {
    return String(b.fechaImportacion || "").localeCompare(String(a.fechaImportacion || ""));
  });

  return responderJSON({
    status: "SUCCESS",
    total: filtradas.length,
    hayImportacionActiva: filtradas.some(function(importacion) {
      return normalizarTexto(importacion.estado) === normalizarTexto(ESTADO_IMPORTACION_SUCCESS);
    }),
    importaciones: filtradas.map(function(importacion) {
      return {
        importId: String(importacion.importId || "").trim(),
        fechaImportacion: String(importacion.fechaImportacion || "").trim(),
        usuario: String(importacion.usuario || "").trim(),
        local: String(importacion.local || "").trim(),
        periodo: String(importacion.periodo || "").trim(),
        nombreArchivo: String(importacion.nombreArchivo || "").trim(),
        hashArchivo: String(importacion.hashArchivo || "").trim(),
        estado: String(importacion.estado || "").trim(),
        observaciones: String(importacion.observaciones || "").trim()
      };
    })
  });
}

function consultarImportacionActivaVentas(params) {
  requireAdminSession(params);

  var local = limpiarTextoImportacion_(params.local);
  var periodo = limpiarTextoImportacion_(params.periodo);

  if (!local || !periodo) {
    throw crearErrorImportacion_(
      "ERROR_DATOS",
      'Debes indicar "local" y "periodo" para consultar la importación activa.'
    );
  }

  var importacion = obtenerImportacionActivaVentasPorLocalPeriodo_(local, periodo);

  if (!importacion) {
    return responderJSON({
      status: "SUCCESS",
      encontrado: false,
      local: local,
      periodo: periodo,
      importacionActiva: null
    });
  }

  var ventasValidas = obtenerVentasValidasPorImportId_(importacion.importId);
  var propinasValidas = obtenerPropinasValidasPorImportId_(importacion.importId);

  return responderJSON({
    status: "SUCCESS",
    encontrado: true,
    local: local,
    periodo: periodo,
    importacionActiva: serializarImportacionVentas_(importacion),
    resumen: {
      registrosVentasValidos: ventasValidas.length,
      registrosPropinasValidas: propinasValidas.length,
      ventaBrutaValida: sumarMontosPorCampo_(ventasValidas, "TotalBruto"),
      propinasValidas: sumarMontosPorCampo_(propinasValidas, "MontoPropina")
    }
  });
}

function recalcularComisiones(params) {
  requireAdminSession(params);

  var contexto = resolverImportacionParaCalculo_(params);
  var resultado = recalcularComisionesPorImportacion_(contexto.importacion);

  return responderJSON({
    status: "SUCCESS",
    importId: String(resultado.importId || "").trim(),
    local: String(resultado.local || "").trim(),
    periodo: String(resultado.periodo || "").trim(),
    importacionResueltaPor: contexto.resueltoPor,
    diasProcesados: resultado.diasProcesados,
    resumen: resultado.resumen
  });
}

function importarVentasInterno_(params) {
  var sesion = requireAdminSession(params);
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  var hojaImportaciones = null;
  var importRowNumber = null;
  var importId = null;
  var fechaImportacion = null;
  var metadata = null;

  try {
    var estructura = asegurarEstructuraVentasSheets_();
    if (estructura.inconsistentes > 0) {
      throw crearErrorImportacion_(
        "ERROR_CONFIG",
        "La estructura del spreadsheet de ventas tiene hojas con headers inconsistentes."
      );
    }

    metadata = normalizarMetadataImportacion_(params.metadata);
    var ventas = normalizarArrayImportacion_(params.ventas, "ventas");
    var propinas = normalizarArrayImportacion_(params.propinas, "propinas");
    var pagos = normalizarArrayImportacion_(params.pagos, "pagos");

    validarMetadataImportacion_(metadata);
    validarColeccionesImportacion_(ventas, propinas, pagos);

    hojaImportaciones = getSheet_(HOJA_IMPORTACIONES_VENTAS, SPREADSHEET_KEY_VENTAS);
    var hojaVentas = getSheet_(HOJA_VENTAS_POS, SPREADSHEET_KEY_VENTAS);
    var hojaPropinas = getSheet_(HOJA_PROPINAS_POS, SPREADSHEET_KEY_VENTAS);
    var hojaPagos = getSheet_(HOJA_PAGOS_POS, SPREADSHEET_KEY_VENTAS);
    var importaciones = obtenerRegistrosImportacionesVentas_(hojaImportaciones);

    var importacionDuplicada = buscarImportacionActivaPorHash_(importaciones, metadata.hashArchivo);
    if (importacionDuplicada) {
      throw crearErrorImportacion_(
        "ERROR_DUPLICADO",
        "Ya existe una importación activa con el mismo hash de archivo."
      );
    }

    var importacionesActivasMismoPeriodo = buscarImportacionesActivasPorLocalPeriodo_(
      importaciones,
      metadata.local,
      metadata.periodo
    );

    importId = Utilities.getUuid();
    fechaImportacion = new Date();

    var filasVentas = construirFilasVentasPOS_(importId, metadata, ventas);
    var filasPropinas = construirFilasPropinasPOS_(importId, metadata, propinas);
    var filasPagos = construirFilasPagosPOS_(importId, metadata, pagos);
    var resumen = construirResumenImportacion_(ventas, propinas);
    var observacionBase = construirObservacionImportacion_(
      metadata.observaciones,
      [],
      fechaImportacion,
      sesion.displayName
    );

    hojaImportaciones.appendRow([
      importId,
      fechaImportacion.toISOString(),
      sesion.displayName,
      metadata.local,
      metadata.periodo,
      metadata.nombreArchivo,
      metadata.hashArchivo,
      ESTADO_IMPORTACION_PENDING,
      0,
      0,
      0,
      0,
      agregarObservacionImportacion_(
        observacionBase,
        "Importación en curso; aún no reemplaza la carga activa hasta completar escrituras."
      )
    ]);
    importRowNumber = hojaImportaciones.getLastRow();

    if (filasVentas.length > 0) {
      hojaVentas
        .getRange(hojaVentas.getLastRow() + 1, 1, filasVentas.length, filasVentas[0].length)
        .setValues(filasVentas);
    }

    if (filasPropinas.length > 0) {
      hojaPropinas
        .getRange(hojaPropinas.getLastRow() + 1, 1, filasPropinas.length, filasPropinas[0].length)
        .setValues(filasPropinas);
    }

    if (filasPagos.length > 0) {
      hojaPagos
        .getRange(hojaPagos.getLastRow() + 1, 1, filasPagos.length, filasPagos[0].length)
        .setValues(filasPagos);
    }

    var idsReemplazados = marcarImportacionesComoReemplazadas_(
      hojaImportaciones,
      importacionesActivasMismoPeriodo,
      importId,
      fechaImportacion,
      sesion.displayName
    );

    var observaciones = construirObservacionImportacion_(
      metadata.observaciones,
      idsReemplazados,
      fechaImportacion,
      sesion.displayName
    );

    actualizarFilaImportacion_(
      hojaImportaciones,
      importRowNumber,
      {
        Estado: ESTADO_IMPORTACION_SUCCESS,
        RegistrosVentas: filasVentas.length,
        RegistrosPropinas: filasPropinas.length,
        VentaBrutaValida: resumen.ventaBrutaValida,
        PropinasValidas: resumen.propinasValidas,
        Observaciones: observaciones
      }
    );

    var resultadoRecalculo = recalcularComisionesPorImportacion_({
      importId: importId,
      local: metadata.local,
      periodo: metadata.periodo,
      estado: ESTADO_IMPORTACION_SUCCESS
    });

    return {
      status: ESTADO_IMPORTACION_SUCCESS,
      importId: importId,
      local: metadata.local,
      periodo: metadata.periodo,
      importacionReemplazada: idsReemplazados,
      registrosVentas: filasVentas.length,
      registrosPropinas: filasPropinas.length,
      registrosPagos: filasPagos.length,
      observaciones: observaciones,
      recalculoAutomatico: {
        status: "SUCCESS",
        diasProcesados: resultadoRecalculo.diasProcesados,
        resumen: resultadoRecalculo.resumen
      }
    };
  } catch (error) {
    if (hojaImportaciones && importRowNumber) {
      var mensajeError = error && error.message
        ? error.message
        : "La importación falló antes de completarse.";
      var observacionError = agregarObservacionImportacion_(
        metadata && metadata.observaciones ? metadata.observaciones : "",
        "Importación fallida el " + new Date().toISOString() + ": " + mensajeError
      );

      try {
        actualizarFilaImportacion_(
          hojaImportaciones,
          importRowNumber,
          {
            Estado: ESTADO_IMPORTACION_ERROR,
            Observaciones: observacionError
          }
        );
      } catch (updateError) {
        // Si incluso el registro de error falla, dejamos propagar el error original.
      }
    }
    throw error;
  } finally {
    lock.releaseLock();
  }
}

function normalizarMetadataImportacion_(metadata) {
  var objeto = normalizarObjetoImportacion_(metadata, "metadata");
  var fechaDesde = limpiarTextoImportacion_(objeto.fechaDesde);

  return {
    local: limpiarTextoImportacion_(objeto.local),
    periodo: normalizarPeriodoImportacion_(objeto.periodo, fechaDesde),
    nombreArchivo: limpiarTextoImportacion_(objeto.nombreArchivo),
    hashArchivo: limpiarTextoImportacion_(objeto.hashArchivo),
    fechaDesde: fechaDesde,
    fechaHasta: limpiarTextoImportacion_(objeto.fechaHasta),
    observaciones: limpiarTextoImportacion_(objeto.observaciones)
  };
}

function validarMetadataImportacion_(metadata) {
  var camposObligatorios = [
    "local",
    "periodo",
    "nombreArchivo",
    "hashArchivo",
    "fechaDesde",
    "fechaHasta"
  ];

  camposObligatorios.forEach(function(campo) {
    if (!metadata[campo]) {
      throw crearErrorImportacion_(
        "ERROR_DATOS",
        'Falta el campo obligatorio "' + campo + '" en metadata.'
      );
    }
  });

  if (!/^\d{4}-\d{2}$/.test(metadata.periodo)) {
    throw crearErrorImportacion_(
      "ERROR_DATOS",
      'El campo "periodo" debe quedar normalizado como "YYYY-MM".'
    );
  }
}

function validarColeccionesImportacion_(ventas, propinas, pagos) {
  if (!Array.isArray(ventas) || !Array.isArray(propinas) || !Array.isArray(pagos)) {
    throw crearErrorImportacion_(
      "ERROR_DATOS",
      'Los campos "ventas", "propinas" y "pagos" deben ser arrays.'
    );
  }
}

function normalizarArrayImportacion_(valor, campo) {
  if (Array.isArray(valor)) {
    return valor;
  }

  if (valor === null || valor === undefined || valor === "") {
    return [];
  }

  if (typeof valor === "string") {
    var texto = valor.trim();
    if (!texto) return [];

    var parsed = JSON.parse(texto);
    if (!Array.isArray(parsed)) {
      throw crearErrorImportacion_(
        "ERROR_DATOS",
        'El campo "' + campo + '" debe contener un array.'
      );
    }
    return parsed;
  }

  throw crearErrorImportacion_(
    "ERROR_DATOS",
    'El campo "' + campo + '" debe contener un array.'
  );
}

function normalizarObjetoImportacion_(valor, campo) {
  if (valor && typeof valor === "object" && !Array.isArray(valor)) {
    return valor;
  }

  if (typeof valor === "string") {
    var texto = valor.trim();
    if (!texto) {
      throw crearErrorImportacion_(
        "ERROR_DATOS",
        'El campo "' + campo + '" es obligatorio.'
      );
    }

    var parsed = JSON.parse(texto);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw crearErrorImportacion_(
        "ERROR_DATOS",
        'El campo "' + campo + '" debe ser un objeto.'
      );
    }
    return parsed;
  }

  throw crearErrorImportacion_(
    "ERROR_DATOS",
    'El campo "' + campo + '" debe ser un objeto.'
  );
}

function obtenerRegistrosImportacionesVentas_(hoja) {
  var ultimaFila = hoja.getLastRow();
  var ultimaColumna = hoja.getLastColumn();

  if (ultimaFila < 2 || ultimaColumna < 1) {
    return [];
  }

  var headers = hoja.getRange(1, 1, 1, ultimaColumna).getValues()[0];
  var valores = hoja.getRange(2, 1, ultimaFila - 1, ultimaColumna).getValues();

  return valores.map(function(fila, indice) {
    return {
      rowNumber: indice + 2,
      importId: fila[buscarIndiceHeader_(headers, "ImportId")],
      fechaImportacion: fila[buscarIndiceHeader_(headers, "FechaImportacion")],
      usuario: fila[buscarIndiceHeader_(headers, "Usuario")],
      local: fila[buscarIndiceHeader_(headers, "Local")],
      periodo: normalizarPeriodoImportacion_(
        fila[buscarIndiceHeader_(headers, "Periodo")]
      ),
      nombreArchivo: fila[buscarIndiceHeader_(headers, "NombreArchivo")],
      hashArchivo: fila[buscarIndiceHeader_(headers, "HashArchivo")],
      estado: fila[buscarIndiceHeader_(headers, "Estado")],
      observaciones: fila[buscarIndiceHeader_(headers, "Observaciones")]
    };
  });
}

function resolverImportacionParaCalculo_(params) {
  var importId = limpiarTextoImportacion_(params.importId);
  var local = limpiarTextoImportacion_(params.local);
  var periodo = limpiarTextoImportacion_(params.periodo);
  var hojaImportaciones = getSheet_(HOJA_IMPORTACIONES_VENTAS, SPREADSHEET_KEY_VENTAS);
  var importaciones = obtenerRegistrosImportacionesVentas_(hojaImportaciones);
  var importacion = null;
  var resueltoPor = "";

  if (importId) {
    importacion = buscarImportacionPorId_(importaciones, importId);
    resueltoPor = "importId";
  } else if (local && periodo) {
    importacion = buscarImportacionActivaPorLocalPeriodo_(importaciones, local, periodo);
    resueltoPor = "localPeriodoActivo";
  } else {
    throw crearErrorImportacion_(
      "ERROR_DATOS",
      'Debes indicar "importId" o bien "local" + "periodo" para recalcular.'
    );
  }

  if (!importacion) {
    throw crearErrorImportacion_(
      "ERROR_DATOS",
      "No se encontró una importación válida para recalcular."
    );
  }

  if (normalizarTexto(importacion.estado) !== normalizarTexto(ESTADO_IMPORTACION_SUCCESS)) {
    throw crearErrorImportacion_(
      "ERROR_DATOS",
      "Solo se puede recalcular una importación activa en estado SUCCESS."
    );
  }

  return {
    importacion: importacion,
    resueltoPor: resueltoPor
  };
}

function leerHojaComoObjetos_(hoja) {
  var ultimaFila = hoja.getLastRow();
  var ultimaColumna = hoja.getLastColumn();

  if (ultimaFila < 2 || ultimaColumna < 1) {
    return [];
  }

  var headers = hoja.getRange(1, 1, 1, ultimaColumna).getValues()[0];
  var valores = hoja.getRange(2, 1, ultimaFila - 1, ultimaColumna).getValues();

  return valores.map(function(fila, indice) {
    var objeto = {
      rowNumber: indice + 2
    };

    headers.forEach(function(header, headerIndex) {
      objeto[String(header || "").trim()] = fila[headerIndex];
    });

    return objeto;
  });
}

function actualizarFilaImportacion_(hoja, rowNumber, cambios) {
  if (!rowNumber || !cambios) {
    return;
  }

  var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  Object.keys(cambios).forEach(function(nombreHeader) {
    var columna = buscarIndiceHeader_(headers, nombreHeader) + 1;
    hoja.getRange(rowNumber, columna).setValue(cambios[nombreHeader]);
  });
}

function buscarImportacionActivaPorHash_(importaciones, hashArchivo) {
  var hashBuscado = normalizarTexto(hashArchivo);

  for (var i = 0; i < importaciones.length; i++) {
    var importacion = importaciones[i];
    if (normalizarTexto(importacion.estado) !== normalizarTexto(ESTADO_IMPORTACION_SUCCESS)) {
      continue;
    }

    if (normalizarTexto(importacion.hashArchivo) === hashBuscado) {
      return importacion;
    }
  }

  return null;
}

function buscarImportacionesActivasPorLocalPeriodo_(importaciones, local, periodo) {
  var localBuscado = normalizarTexto(local);
  var periodoBuscado = normalizarTexto(periodo);

  return importaciones.filter(function(importacion) {
    return normalizarTexto(importacion.estado) === normalizarTexto(ESTADO_IMPORTACION_SUCCESS) &&
      normalizarTexto(importacion.local) === localBuscado &&
      normalizarTexto(importacion.periodo) === periodoBuscado;
  });
}

function buscarImportacionActivaPorLocalPeriodo_(importaciones, local, periodo) {
  var activas = buscarImportacionesActivasPorLocalPeriodo_(importaciones, local, periodo)
    .sort(function(a, b) {
      return String(b.fechaImportacion || "").localeCompare(String(a.fechaImportacion || ""));
    });

  return activas.length ? activas[0] : null;
}

function buscarImportacionPorId_(importaciones, importId) {
  var importIdBuscado = limpiarTextoImportacion_(importId);

  for (var i = 0; i < importaciones.length; i++) {
    if (limpiarTextoImportacion_(importaciones[i].importId) === importIdBuscado) {
      return importaciones[i];
    }
  }

  return null;
}

function obtenerImportacionActivaVentasPorLocalPeriodo_(local, periodo) {
  var hojaImportaciones = getSheet_(HOJA_IMPORTACIONES_VENTAS, SPREADSHEET_KEY_VENTAS);
  var importaciones = obtenerRegistrosImportacionesVentas_(hojaImportaciones);
  return buscarImportacionActivaPorLocalPeriodo_(importaciones, local, periodo);
}

function serializarImportacionVentas_(importacion) {
  if (!importacion) {
    return null;
  }

  return {
    importId: String(importacion.importId || "").trim(),
    fechaImportacion: String(importacion.fechaImportacion || "").trim(),
    usuario: String(importacion.usuario || "").trim(),
    local: String(importacion.local || "").trim(),
    periodo: normalizarPeriodoImportacion_(importacion.periodo),
    nombreArchivo: String(importacion.nombreArchivo || "").trim(),
    hashArchivo: String(importacion.hashArchivo || "").trim(),
    estado: String(importacion.estado || "").trim(),
    observaciones: String(importacion.observaciones || "").trim()
  };
}

function marcarImportacionesComoReemplazadas_(hoja, importaciones, nuevoImportId, fecha, usuario) {
  if (!importaciones.length) {
    return [];
  }

  var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var indiceEstado = buscarIndiceHeader_(headers, "Estado") + 1;
  var indiceObservaciones = buscarIndiceHeader_(headers, "Observaciones") + 1;
  var marcaTiempo = fecha.toISOString();

  importaciones.forEach(function(importacion) {
    var observacionesActuales = limpiarTextoImportacion_(importacion.observaciones);
    var nuevaObservacion = agregarObservacionImportacion_(
      observacionesActuales,
      "Reemplazada por " + nuevoImportId + " el " + marcaTiempo + " por " + usuario + "."
    );

    hoja.getRange(importacion.rowNumber, indiceEstado).setValue(ESTADO_IMPORTACION_REEMPLAZADO);
    hoja.getRange(importacion.rowNumber, indiceObservaciones).setValue(nuevaObservacion);
  });

  return importaciones.map(function(importacion) {
    return String(importacion.importId || "").trim();
  }).filter(function(importId) {
    return importId !== "";
  });
}

function obtenerRegistrosPorImportId_(sheetName, importId) {
  var hoja = getSheet_(sheetName, SPREADSHEET_KEY_VENTAS);
  var registros = leerHojaComoObjetos_(hoja);
  var importIdBuscado = limpiarTextoImportacion_(importId);

  return registros.filter(function(registro) {
    return limpiarTextoImportacion_(registro.ImportId) === importIdBuscado;
  });
}

function obtenerVentasPorImportId_(importId) {
  return obtenerRegistrosPorImportId_(HOJA_VENTAS_POS, importId);
}

function obtenerPropinasPorImportId_(importId) {
  return obtenerRegistrosPorImportId_(HOJA_PROPINAS_POS, importId);
}

function obtenerPagosPorImportId_(importId) {
  return obtenerRegistrosPorImportId_(HOJA_PAGOS_POS, importId);
}

function obtenerVentasValidasPorImportId_(importId) {
  return obtenerVentasPorImportId_(importId).filter(function(venta) {
    return normalizarBooleanImportacion_(venta.EsValidaComision);
  });
}

function obtenerPropinasValidasPorImportId_(importId) {
  return obtenerPropinasPorImportId_(importId).filter(function(propina) {
    return normalizarBooleanImportacion_(propina.EsValidaPropina);
  });
}

function obtenerPagosValidosPorImportId_(importId) {
  return obtenerPagosPorImportId_(importId).filter(function(pago) {
    return normalizarBooleanImportacion_(pago.EsValidoCuadratura);
  });
}

function sumarMontosPorCampo_(registros, nombreCampo) {
  return (registros || []).reduce(function(total, registro) {
    return total + normalizarMontoImportacion_(registro[nombreCampo]);
  }, 0);
}

function limpiarResultadosCalculoPorImportId_(importId) {
  eliminarFilasPorImportIdEnHoja_(HOJA_VENTAS_DIARIAS, importId);
  eliminarFilasPorImportIdEnHoja_(HOJA_COMISIONES_DIARIAS, importId);
  eliminarFilasPorImportIdEnHoja_(HOJA_RESUMEN_MENSUAL_COMISIONES, importId);
  eliminarFilasPorImportIdEnHoja_(HOJA_CUADRATURA_PAGOS, importId);
  eliminarFilasPorImportIdEnHoja_(HOJA_KPI_VENTAS_DIARIAS, importId);
}

function recalcularComisionesPorImportacion_(importacion) {
  var importId = String(importacion && importacion.importId || "").trim();
  if (!importId) {
    throw crearErrorImportacion_(
      "ERROR_DATOS",
      "No se puede recalcular sin importId."
    );
  }

  var ventasValidas = obtenerVentasValidasPorImportId_(importId);
  var propinasValidas = obtenerPropinasValidasPorImportId_(importId);
  var pagosValidos = obtenerPagosValidosPorImportId_(importId);
  var contextoDiario = construirContextoDiarioImportacion_(importacion, ventasValidas, propinasValidas, pagosValidos);

  limpiarResultadosCalculoPorImportId_(importId);

  if (contextoDiario.filasVentasDiarias.length > 0) {
    var hojaVentasDiarias = getSheet_(HOJA_VENTAS_DIARIAS, SPREADSHEET_KEY_VENTAS);
    hojaVentasDiarias
      .getRange(hojaVentasDiarias.getLastRow() + 1, 1, contextoDiario.filasVentasDiarias.length, contextoDiario.filasVentasDiarias[0].length)
      .setValues(contextoDiario.filasVentasDiarias);
  }

  if (contextoDiario.filasComisionesDiarias.length > 0) {
    var hojaComisionesDiarias = getSheet_(HOJA_COMISIONES_DIARIAS, SPREADSHEET_KEY_VENTAS);
    hojaComisionesDiarias
      .getRange(hojaComisionesDiarias.getLastRow() + 1, 1, contextoDiario.filasComisionesDiarias.length, contextoDiario.filasComisionesDiarias[0].length)
      .setValues(contextoDiario.filasComisionesDiarias);
  }

  if (contextoDiario.filasResumenMensual.length > 0) {
    var hojaResumenMensual = getSheet_(HOJA_RESUMEN_MENSUAL_COMISIONES, SPREADSHEET_KEY_VENTAS);
    hojaResumenMensual
      .getRange(hojaResumenMensual.getLastRow() + 1, 1, contextoDiario.filasResumenMensual.length, contextoDiario.filasResumenMensual[0].length)
      .setValues(contextoDiario.filasResumenMensual);
  }

  if (contextoDiario.filasCuadraturaPagos.length > 0) {
    var hojaCuadraturaPagos = getSheet_(HOJA_CUADRATURA_PAGOS, SPREADSHEET_KEY_VENTAS);
    hojaCuadraturaPagos
      .getRange(hojaCuadraturaPagos.getLastRow() + 1, 1, contextoDiario.filasCuadraturaPagos.length, contextoDiario.filasCuadraturaPagos[0].length)
      .setValues(contextoDiario.filasCuadraturaPagos);
  }

  if (contextoDiario.filasKpiVentasDiarias.length > 0) {
    var hojaKpiVentasDiarias = getSheet_(HOJA_KPI_VENTAS_DIARIAS, SPREADSHEET_KEY_VENTAS);
    hojaKpiVentasDiarias
      .getRange(hojaKpiVentasDiarias.getLastRow() + 1, 1, contextoDiario.filasKpiVentasDiarias.length, contextoDiario.filasKpiVentasDiarias[0].length)
      .setValues(contextoDiario.filasKpiVentasDiarias);
  }

  return {
    importId: importId,
    local: String(importacion.local || "").trim(),
    periodo: String(importacion.periodo || "").trim(),
    diasProcesados: contextoDiario.filasVentasDiarias.length,
    resumen: construirResumenRecalculo_(contextoDiario.filasVentasDiarias)
  };
}

function eliminarFilasPorImportIdEnHoja_(sheetName, importId) {
  var hoja = getSheet_(sheetName, SPREADSHEET_KEY_VENTAS);
  var registros = leerHojaComoObjetos_(hoja);
  var filas = registros
    .filter(function(registro) {
      return limpiarTextoImportacion_(registro.ImportId) === limpiarTextoImportacion_(importId);
    })
    .map(function(registro) {
      return registro.rowNumber;
    })
    .sort(function(a, b) {
      return b - a;
    });

  filas.forEach(function(rowNumber) {
    hoja.deleteRow(rowNumber);
  });
}

function construirContextoDiarioImportacion_(importacion, ventasValidas, propinasValidas, pagosValidos) {
  var grupos = agruparMetricasDiarias_(importacion, ventasValidas, propinasValidas, pagosValidos);
  var filasVentasDiarias = [];
  var filasComisionesDiarias = [];
  var filasCuadraturaPagos = [];
  var filasKpiVentasDiarias = [];

  Object.keys(grupos)
    .sort()
    .forEach(function(key) {
      var grupo = grupos[key];
      var calculo = calcularMetricasDiarias_(grupo.ventaBrutaValida, grupo.local);
      var cantidadColaboradores = grupo.colaboradoresPresentes.length;
      var comisionIndividual = calculo.comisionTotalDia;
      var propinaIndividual = cantidadColaboradores
        ? redondearMonto_(grupo.propinasValidas / cantidadColaboradores)
        : 0;
      var horasTrabajadas = redondearMonto_(grupo.horasTrabajadasTotales);
      var cantidadVentas = grupo.cantidadVentas;
      var ticketPromedio = cantidadVentas
        ? redondearMonto_(grupo.ventaBrutaValida / cantidadVentas)
        : 0;
      var ventaPorColaborador = cantidadColaboradores
        ? redondearMonto_(grupo.ventaBrutaValida / cantidadColaboradores)
        : 0;
      var ventaPorHoraTrabajada = horasTrabajadas > 0
        ? redondearMonto_(grupo.ventaBrutaValida / horasTrabajadas)
        : 0;

      filasVentasDiarias.push([
        importacion.importId,
        grupo.fecha,
        grupo.local,
        grupo.ventaBrutaValida,
        calculo.ventaNetaValida,
        calculo.tramoComision,
        calculo.porcentajeComision,
        comisionIndividual,
        grupo.propinasValidas,
        cantidadColaboradores,
        propinaIndividual,
        grupo.observacionesPresencia
      ]);

      grupo.colaboradoresPresentes.forEach(function(colaborador) {
        filasComisionesDiarias.push([
          importacion.importId,
          grupo.fecha,
          grupo.local,
          colaborador.nombre,
          comisionIndividual,
          propinaIndividual,
          redondearMonto_(comisionIndividual + propinaIndividual),
          colaborador.fuentePresencia,
          colaborador.horasTrabajadas > 0
            ? "Horas registradas: " + redondearMonto_(colaborador.horasTrabajadas)
            : "Sin horas pareadas; presencia por marca diaria."
        ]);
      });

      filasCuadraturaPagos.push([
        importacion.importId,
        grupo.fecha,
        grupo.local,
        grupo.pagosPorMedio.efectivo,
        grupo.pagosPorMedio.debito,
        grupo.pagosPorMedio.credito,
        grupo.pagosPorMedio.voucher,
        grupo.pagosPorMedio.transferencia,
        grupo.pagosPorMedio.delivery,
        grupo.totalPagosValidos,
        redondearMonto_(grupo.ventaBrutaValida - grupo.totalPagosValidos),
        "Cuadratura diaria generada desde PagosPOS válidos."
      ]);

      filasKpiVentasDiarias.push([
        importacion.importId,
        grupo.fecha,
        grupo.local,
        grupo.ventaBrutaValida,
        calculo.ventaNetaValida,
        cantidadVentas,
        ticketPromedio,
        grupo.propinasValidas,
        comisionIndividual,
        cantidadColaboradores,
        ventaPorColaborador,
        ventaPorHoraTrabajada
      ]);
    });

  return {
    filasVentasDiarias: filasVentasDiarias,
    filasComisionesDiarias: filasComisionesDiarias,
    filasResumenMensual: construirFilasResumenMensualComisiones_(importacion, filasComisionesDiarias),
    filasCuadraturaPagos: filasCuadraturaPagos,
    filasKpiVentasDiarias: filasKpiVentasDiarias
  };
}

function agruparMetricasDiarias_(importacion, ventasValidas, propinasValidas, pagosValidos) {
  var grupos = {};
  var localDefault = limpiarTextoImportacion_(importacion.local);
  var importId = limpiarTextoImportacion_(importacion.importId);

  ventasValidas.forEach(function(venta) {
    var fecha = limpiarTextoImportacion_(venta.Fecha);
    var local = limpiarTextoImportacion_(venta.Local) || localDefault;
    if (!fecha || !local) return;

    var grupo = obtenerGrupoDiario_(grupos, fecha, local);
    grupo.ventaBrutaValida += normalizarMontoImportacion_(venta.TotalBruto);
    grupo.cantidadVentas += 1;

    if (esVentaDelivery_(venta)) {
      grupo.pagosPorMedio.delivery += normalizarMontoImportacion_(venta.TotalBruto);
    }
  });

  propinasValidas.forEach(function(propina) {
    var fecha = limpiarTextoImportacion_(propina.Fecha);
    var local = limpiarTextoImportacion_(propina.Local) || localDefault;
    if (!fecha || !local) return;

    var grupo = obtenerGrupoDiario_(grupos, fecha, local);
    grupo.propinasValidas += normalizarMontoImportacion_(propina.MontoPropina);
  });

  pagosValidos.forEach(function(pago) {
    var fecha = limpiarTextoImportacion_(pago.Fecha);
    var local = limpiarTextoImportacion_(pago.Local) || localDefault;
    if (!fecha || !local) return;

    var grupo = obtenerGrupoDiario_(grupos, fecha, local);
    var monto = normalizarMontoImportacion_(pago.Monto);
    grupo.totalPagosValidos += monto;
    acumularPagoPorMedio_(grupo.pagosPorMedio, limpiarTextoImportacion_(pago.MedioPago), monto);
  });

  Object.keys(grupos).forEach(function(key) {
    var grupo = grupos[key];
    var asistencia = obtenerPresenciaDiariaPorLocalFecha_(grupo.local, grupo.fecha, importId);
    grupo.colaboradoresPresentes = asistencia.colaboradores;
    grupo.horasTrabajadasTotales = asistencia.horasTotales;
    grupo.observacionesPresencia = asistencia.observaciones;
  });

  return grupos;
}

function obtenerGrupoDiario_(grupos, fecha, local) {
  var key = fecha + "|" + local;
  if (!grupos[key]) {
    grupos[key] = {
      fecha: fecha,
      local: local,
      ventaBrutaValida: 0,
      propinasValidas: 0,
      cantidadVentas: 0,
      totalPagosValidos: 0,
      pagosPorMedio: {
        efectivo: 0,
        debito: 0,
        credito: 0,
        voucher: 0,
        transferencia: 0,
        delivery: 0
      },
      colaboradoresPresentes: [],
      horasTrabajadasTotales: 0,
      observacionesPresencia: ""
    };
  }

  return grupos[key];
}

function construirFilasVentasDiarias_(importacion, ventasValidas, propinasValidas) {
  var grupos = {};
  var localDefault = limpiarTextoImportacion_(importacion.local);

  ventasValidas.forEach(function(venta) {
    var fecha = limpiarTextoImportacion_(venta.Fecha);
    var local = limpiarTextoImportacion_(venta.Local) || localDefault;
    if (!fecha || !local) {
      return;
    }

    var key = fecha + "|" + local;
    if (!grupos[key]) {
      grupos[key] = crearGrupoVentaDiaria_(fecha, local);
    }

    grupos[key].ventaBrutaValida += normalizarMontoImportacion_(venta.TotalBruto);
  });

  propinasValidas.forEach(function(propina) {
    var fecha = limpiarTextoImportacion_(propina.Fecha);
    var local = limpiarTextoImportacion_(propina.Local) || localDefault;
    if (!fecha || !local) {
      return;
    }

    var key = fecha + "|" + local;
    if (!grupos[key]) {
      grupos[key] = crearGrupoVentaDiaria_(fecha, local);
    }

    grupos[key].propinasValidas += normalizarMontoImportacion_(propina.MontoPropina);
  });

  return Object.keys(grupos)
    .sort()
    .map(function(key) {
      var grupo = grupos[key];
      var calculo = calcularMetricasDiarias_(grupo.ventaBrutaValida, grupo.local);

      return [
        importacion.importId,
        grupo.fecha,
        grupo.local,
        grupo.ventaBrutaValida,
        calculo.ventaNetaValida,
        calculo.tramoComision,
        calculo.porcentajeComision,
        calculo.comisionTotalDia,
        grupo.propinasValidas,
        0,
        0,
        "Calculo operativo agregado. Distribucion individual pendiente en modulo pagosColaboradores."
      ];
    });
}

function crearGrupoVentaDiaria_(fecha, local) {
  return {
    fecha: fecha,
    local: local,
    ventaBrutaValida: 0,
    propinasValidas: 0
  };
}

function calcularMetricasDiarias_(ventaBrutaValida, local) {
  var ventaBruta = normalizarMontoImportacion_(ventaBrutaValida);
  var ventaNeta = redondearMonto_(ventaBruta / 1.19);
  var tramoConfig = resolverTramoComision_(ventaNeta, local);
  var tramo = tramoConfig.tramo;
  var porcentaje = tramoConfig.porcentajeComision;
  var comisionTotalDia = redondearMonto_(ventaNeta * porcentaje);

  return {
    ventaNetaValida: ventaNeta,
    tramoComision: tramo,
    porcentajeComision: porcentaje,
    comisionTotalDia: comisionTotalDia
  };
}

function resolverTramoComision_(ventaNetaValida, local) {
  var ventaNeta = normalizarMontoImportacion_(ventaNetaValida);
  var tramos = obtenerTramosComisionActivos_(local);

  for (var i = 0; i < tramos.length; i++) {
    var tramo = tramos[i];
    var minimo = normalizarMontoImportacion_(tramo.ventaNetaMin);
    var maximo = tramo.ventaNetaMax === "" ? null : normalizarMontoImportacion_(tramo.ventaNetaMax);
    var cumpleMinimo = ventaNeta >= minimo;
    var cumpleMaximo = maximo === null || ventaNeta <= maximo;

    if (cumpleMinimo && cumpleMaximo) {
      return {
        tramo: tramo.tramo,
        porcentajeComision: normalizarMontoImportacion_(tramo.porcentajeComision)
      };
    }
  }

  throw crearErrorImportacion_(
    "ERROR_CONFIG",
    "No existe un tramo activo que cubra la venta neta calculada."
  );
}

function obtenerTramosComisionActivos_(local) {
  var hoja = getSheet_(HOJA_TRAMOS_COMISIONES, SPREADSHEET_KEY_VENTAS);
  asegurarHojaTramosComisiones_(hoja, VENTAS_SHEETS_CONFIG.filter(function(config) {
    return config.name === HOJA_TRAMOS_COMISIONES;
  })[0].headers);
  var localNormalizado = normalizarTexto(local);

  var tramos = leerHojaComoObjetos_(hoja)
    .map(function(registro) {
      return {
        local: limpiarTextoImportacion_(registro.Local),
        tramo: limpiarTextoImportacion_(registro.Tramo),
        ventaNetaMin: registro.VentaNetaMin,
        ventaNetaMax: registro.VentaNetaMax,
        porcentajeComision: registro.PorcentajeComision,
        activo: normalizarBooleanImportacion_(registro.Activo, false),
        observaciones: limpiarTextoImportacion_(registro.Observaciones)
      };
    })
    .filter(function(registro) {
      return registro.activo &&
        registro.tramo &&
        registro.porcentajeComision !== "" &&
        normalizarTexto(registro.local) === localNormalizado;
    })
    .sort(function(a, b) {
      return normalizarMontoImportacion_(a.ventaNetaMin) - normalizarMontoImportacion_(b.ventaNetaMin);
    });

  if (!tramos.length) {
    throw crearErrorImportacion_(
      "ERROR_CONFIG",
      "La hoja TramosComisiones no tiene tramos activos configurados."
    );
  }

  return tramos;
}

function redondearMonto_(valor) {
  return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
}

function construirResumenRecalculo_(filasVentasDiarias) {
  return filasVentasDiarias.reduce(function(acumulado, fila) {
    acumulado.ventaBrutaValida += normalizarMontoImportacion_(fila[3]);
    acumulado.ventaNetaValida += normalizarMontoImportacion_(fila[4]);
    acumulado.comisionTotal += normalizarMontoImportacion_(fila[7]);
    acumulado.propinasValidas += normalizarMontoImportacion_(fila[8]);
    return acumulado;
  }, {
    ventaBrutaValida: 0,
    ventaNetaValida: 0,
    comisionTotal: 0,
    propinasValidas: 0
  });
}

function construirFilasResumenMensualComisiones_(importacion, filasComisionesDiarias) {
  var grupos = {};

  filasComisionesDiarias.forEach(function(fila) {
    var key = [fila[2], fila[3]].join("|");
    if (!grupos[key]) {
      grupos[key] = {
        local: fila[2],
        colaborador: fila[3],
        dias: {},
        comisionTotal: 0,
        propinaTotal: 0
      };
    }

    grupos[key].dias[fila[1]] = true;
    grupos[key].comisionTotal += normalizarMontoImportacion_(fila[4]);
    grupos[key].propinaTotal += normalizarMontoImportacion_(fila[5]);
  });

  return Object.keys(grupos)
    .sort()
    .map(function(key) {
      var grupo = grupos[key];
      var diasTrabajados = Object.keys(grupo.dias).length;
      var totalPagar = redondearMonto_(grupo.comisionTotal + grupo.propinaTotal);

      return [
        importacion.importId,
        limpiarTextoImportacion_(importacion.periodo),
        grupo.local,
        grupo.colaborador,
        diasTrabajados,
        redondearMonto_(grupo.comisionTotal),
        redondearMonto_(grupo.propinaTotal),
        totalPagar,
        "Resumen mensual generado desde ComisionesDiarias."
      ];
    });
}

function obtenerPresenciaDiariaPorLocalFecha_(local, fechaIso, importId) {
  var hoja = getSheet_("RegistroAsistencia", SPREADSHEET_KEY_RRHH);
  var datos = leerHojaComoObjetos_(hoja);
  var localNormalizado = normalizarTexto(local);
  var fechaBuscada = limpiarTextoImportacion_(fechaIso);
  var porColaborador = {};
  var marcasCrudas = [];

  datos.forEach(function(registro) {
    if (normalizarTexto(registro.Local) !== localNormalizado) {
      return;
    }

    var fechaRegistro = convertirFechaAsistenciaAIso_(registro["Fecha/Hora"]);
    if (fechaRegistro !== fechaBuscada) {
      return;
    }

    var nombre = limpiarTextoImportacion_(registro.Nombre);
    if (!nombre) {
      return;
    }

    var accionRegistro = limpiarTextoImportacion_(registro["Acción"] || registro.Accion);
    marcasCrudas.push({
      fechaIso: fechaRegistro,
      fechaHora: formatearFechaHora(registro["Fecha/Hora"]),
      nombre: nombre,
      rut: limpiarTextoImportacion_(registro.RUT || registro.Rut),
      local: limpiarTextoImportacion_(registro.Local),
      accion: accionRegistro
    });

    var key = normalizarTexto(nombre);
    if (!porColaborador[key]) {
      porColaborador[key] = {
        nombre: nombre,
        marcas: [],
        fuentePresencia: "RegistroAsistencia",
        horasTrabajadas: 0
      };
    }

    porColaborador[key].marcas.push({
      fechaHora: new Date(registro["Fecha/Hora"]),
      accion: accionRegistro
    });
  });

  var colaboradores = Object.keys(porColaborador)
    .sort()
    .map(function(key) {
      var colaborador = porColaborador[key];
      colaborador.horasTrabajadas = calcularHorasTrabajadasDesdeMarcas_(colaborador.marcas);
      return colaborador;
    });

  var horasTotales = colaboradores.reduce(function(total, colaborador) {
    return total + normalizarMontoImportacion_(colaborador.horasTrabajadas);
  }, 0);

  return {
    colaboradores: colaboradores,
    horasTotales: horasTotales,
    marcasCrudas: marcasCrudas,
    observaciones: colaboradores.length
      ? "Presencia diaria derivada desde RegistroAsistencia."
      : "Sin marcas de asistencia para Fecha + Local."
  };
}

function auditarPresenciaVentas(params) {
  requireAdminSession(params);

  var importId = limpiarTextoImportacion_(params.importId);
  var fecha = limpiarTextoImportacion_(params.fecha);
  var local = limpiarTextoImportacion_(params.local);

  if (importId) {
    var contexto = resolverImportacionParaCalculo_({ importId: importId });
    local = local || limpiarTextoImportacion_(contexto.importacion.local);

    if (!fecha) {
      var ventasValidas = obtenerVentasValidasPorImportId_(importId);
      var fechas = {};
      ventasValidas.forEach(function(venta) {
        var fechaVenta = limpiarTextoImportacion_(venta.Fecha);
        if (fechaVenta) {
          fechas[fechaVenta] = true;
        }
      });

      return responderJSON({
        status: "SUCCESS",
        importId: importId,
        local: local,
        fechasDisponibles: Object.keys(fechas).sort(),
        mensaje: "Indica fecha para auditar presencia de un dia especifico."
      });
    }
  }

  if (!fecha || !local) {
    throw crearErrorImportacion_(
      "ERROR_DATOS",
      'Debes indicar "local" y "fecha", o bien "importId" + "fecha".'
    );
  }

  var presencia = obtenerPresenciaDiariaPorLocalFecha_(local, fecha, importId);

  return responderJSON({
    status: "SUCCESS",
    importId: importId,
    local: local,
    fecha: fecha,
    totalColaboradoresPresentes: presencia.colaboradores.length,
    horasTotales: redondearMonto_(presencia.horasTotales),
    observaciones: presencia.observaciones,
    colaboradores: presencia.colaboradores.map(function(colaborador) {
      return {
        nombre: colaborador.nombre,
        fuentePresencia: colaborador.fuentePresencia,
        horasTrabajadas: redondearMonto_(colaborador.horasTrabajadas),
        marcas: colaborador.marcas.map(function(marca) {
          return {
            fechaHora: formatearFechaHora(marca.fechaHora),
            accion: marca.accion
          };
        })
      };
    }),
    marcasCrudas: presencia.marcasCrudas
  });
}

function convertirFechaAsistenciaAIso_(valor) {
  var fecha = new Date(valor);
  if (isNaN(fecha.getTime())) {
    return "";
  }

  return Utilities.formatDate(
    fecha,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );
}

function calcularHorasTrabajadasDesdeMarcas_(marcas) {
  if (!marcas || !marcas.length) {
    return 0;
  }

  var ordenadas = marcas.slice().sort(function(a, b) {
    return new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime();
  });

  var ingresoAbierto = null;
  var totalMs = 0;

  ordenadas.forEach(function(marca) {
    var accion = normalizarTexto(marca.accion);
    var fechaHora = new Date(marca.fechaHora).getTime();

    if (accion === "ingreso") {
      ingresoAbierto = fechaHora;
      return;
    }

    if (accion === "salida" && ingresoAbierto !== null && fechaHora >= ingresoAbierto) {
      totalMs += (fechaHora - ingresoAbierto);
      ingresoAbierto = null;
    }
  });

  return redondearMonto_(totalMs / (1000 * 60 * 60));
}

function acumularPagoPorMedio_(acumulado, medioPago, monto) {
  var medio = normalizarTexto(medioPago);

  if (medio.indexOf("efectivo") !== -1) {
    acumulado.efectivo += monto;
    return;
  }

  if (medio.indexOf("debito") !== -1) {
    acumulado.debito += monto;
    return;
  }

  if (medio.indexOf("credito") !== -1) {
    acumulado.credito += monto;
    return;
  }

  if (medio.indexOf("voucher") !== -1) {
    acumulado.voucher += monto;
    return;
  }

  if (medio.indexOf("transfer") !== -1) {
    acumulado.transferencia += monto;
    return;
  }
}

function esVentaDelivery_(venta) {
  if (normalizarBooleanImportacion_(venta.EsDelivery)) {
    return true;
  }

  var tipoVenta = normalizarTexto(venta.TipoVenta);
  return tipoVenta.indexOf("delivery") !== -1;
}

function construirFilasVentasPOS_(importId, metadata, ventas) {
  return ventas.map(function(venta, indice) {
    var fila = venta && typeof venta === "object" ? venta : {};
    return [
      importId,
      obtenerCampoImportacion_(fila, ["ventaId", "id", "folio"], importId + "-venta-" + (indice + 1)),
      obtenerCampoImportacion_(fila, ["fecha"], metadata.fechaDesde),
      obtenerCampoImportacion_(fila, ["hora"], ""),
      obtenerCampoImportacion_(fila, ["fechaCierre"], ""),
      obtenerCampoImportacion_(fila, ["local"], metadata.local),
      obtenerCampoImportacion_(fila, ["estado"], ""),
      obtenerCampoImportacion_(fila, ["origen"], ""),
      obtenerCampoImportacion_(fila, ["tipoVenta"], ""),
      obtenerCampoImportacion_(fila, ["medioPago"], ""),
      normalizarMontoImportacion_(obtenerCampoImportacion_(fila, ["totalBruto", "monto", "total"], 0)),
      normalizarBooleanImportacion_(obtenerCampoImportacion_(fila, ["esDelivery", "delivery"], false)),
      normalizarBooleanImportacion_(obtenerCampoImportacion_(fila, ["esCancelada", "cancelada"], false)),
      normalizarBooleanImportacion_(obtenerCampoImportacion_(fila, ["esValidaComision", "validaComision"], true)),
      obtenerCampoImportacion_(fila, ["motivoExclusion"], "")
    ];
  });
}

function construirFilasPropinasPOS_(importId, metadata, propinas) {
  return propinas.map(function(propina, indice) {
    var fila = propina && typeof propina === "object" ? propina : {};
    return [
      importId,
      obtenerCampoImportacion_(fila, ["ventaId", "id", "folio"], importId + "-propina-" + (indice + 1)),
      obtenerCampoImportacion_(fila, ["fecha"], metadata.fechaDesde),
      obtenerCampoImportacion_(fila, ["hora"], ""),
      obtenerCampoImportacion_(fila, ["local"], metadata.local),
      normalizarMontoImportacion_(obtenerCampoImportacion_(fila, ["montoPropina", "monto", "propina"], 0)),
      normalizarBooleanImportacion_(obtenerCampoImportacion_(fila, ["cancelada", "esCancelada"], false)),
      normalizarBooleanImportacion_(obtenerCampoImportacion_(fila, ["esDelivery", "delivery"], false)),
      normalizarBooleanImportacion_(obtenerCampoImportacion_(fila, ["esValidaPropina", "validaPropina"], true)),
      obtenerCampoImportacion_(fila, ["motivoExclusion"], "")
    ];
  });
}

function construirFilasPagosPOS_(importId, metadata, pagos) {
  return pagos.map(function(pago, indice) {
    var fila = pago && typeof pago === "object" ? pago : {};
    var cancelado = normalizarBooleanImportacion_(obtenerCampoImportacion_(fila, ["cancelado", "cancelada"], false));

    return [
      importId,
      obtenerCampoImportacion_(fila, ["ventaId", "id", "folio"], importId + "-pago-" + (indice + 1)),
      obtenerCampoImportacion_(fila, ["fecha"], metadata.fechaDesde),
      obtenerCampoImportacion_(fila, ["hora"], ""),
      obtenerCampoImportacion_(fila, ["local"], metadata.local),
      obtenerCampoImportacion_(fila, ["medioPago", "medio de pago", "medio pago", "pago"], ""),
      normalizarMontoImportacion_(obtenerCampoImportacion_(fila, ["monto", "total", "valor"], 0)),
      cancelado,
      !cancelado
    ];
  });
}

function construirResumenImportacion_(ventas, propinas) {
  var ventaBrutaValida = ventas.reduce(function(total, venta) {
    var fila = venta && typeof venta === "object" ? venta : {};
    var esValida = normalizarBooleanImportacion_(
      obtenerCampoImportacion_(fila, ["esValidaComision", "validaComision"], true)
    );

    if (!esValida) {
      return total;
    }

    return total + normalizarMontoImportacion_(
      obtenerCampoImportacion_(fila, ["totalBruto", "monto", "total"], 0)
    );
  }, 0);

  var propinasValidas = propinas.reduce(function(total, propina) {
    var fila = propina && typeof propina === "object" ? propina : {};
    var esValida = normalizarBooleanImportacion_(
      obtenerCampoImportacion_(fila, ["esValidaPropina", "validaPropina"], true)
    );

    if (!esValida) {
      return total;
    }

    return total + normalizarMontoImportacion_(
      obtenerCampoImportacion_(fila, ["montoPropina", "monto", "propina"], 0)
    );
  }, 0);

  return {
    ventaBrutaValida: ventaBrutaValida,
    propinasValidas: propinasValidas
  };
}

function construirObservacionImportacion_(observacionMetadata, idsReemplazados, fecha, usuario) {
  var observaciones = [];

  if (observacionMetadata) {
    observaciones.push(observacionMetadata);
  }

  if (idsReemplazados.length) {
    observaciones.push(
      "Reemplaza importaciones activas previas: " + idsReemplazados.join(", ") + "."
    );
  }

  observaciones.push(
    "Importada por " + usuario + " el " + fecha.toISOString() + "."
  );

  return observaciones.join(" ");
}

function obtenerCampoImportacion_(objeto, aliases, valorDefault) {
  for (var i = 0; i < aliases.length; i++) {
    var alias = aliases[i];
    if (objeto[alias] !== undefined && objeto[alias] !== null && objeto[alias] !== "") {
      return objeto[alias];
    }
  }

  return valorDefault;
}

function normalizarBooleanImportacion_(valor) {
  if (typeof valor === "boolean") return valor;
  if (typeof valor === "number") return valor !== 0;

  var texto = normalizarTexto(valor);
  return texto === "true" || texto === "1" || texto === "si" || texto === "sí" || texto === "x";
}

function normalizarMontoImportacion_(valor) {
  if (typeof valor === "number") {
    return isFinite(valor) ? valor : 0;
  }

  var texto = limpiarTextoImportacion_(valor);
  if (!texto) return 0;

  texto = texto.replace(/\$/g, "").replace(/\s+/g, "");

  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(texto)) {
    texto = texto.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(texto)) {
    texto = texto.replace(/,/g, "");
  } else if (texto.indexOf(",") !== -1 && texto.indexOf(".") === -1) {
    texto = texto.replace(",", ".");
  }

  var numero = Number(texto);
  return isFinite(numero) ? numero : 0;
}

function limpiarTextoImportacion_(valor) {
  return valor === null || valor === undefined ? "" : String(valor).trim();
}

function normalizarPeriodoImportacion_(valor, fechaDesdeFallback) {
  var texto = limpiarTextoImportacion_(valor);

  if (!texto && /^\d{4}-\d{2}-\d{2}$/.test(String(fechaDesdeFallback || "").trim())) {
    return String(fechaDesdeFallback).trim().slice(0, 7);
  }

  if (!texto) {
    return "";
  }

  if (/^\d{4}-\d{2}$/.test(texto)) {
    return texto;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return texto.slice(0, 7);
  }

  var textoSinZona = texto.replace(/\s+\([^)]*\)$/, "");
  var fecha = new Date(textoSinZona);

  if (!isNaN(fecha.getTime())) {
    return fecha.getFullYear() + "-" + String(fecha.getMonth() + 1).padStart(2, "0");
  }

  return texto;
}

function agregarObservacionImportacion_(actual, nueva) {
  var previo = limpiarTextoImportacion_(actual);
  return previo ? previo + " " + nueva : nueva;
}

function buscarIndiceHeader_(headers, nombreHeader) {
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i] || "").trim() === nombreHeader) {
      return i;
    }
  }

  throw crearErrorImportacion_(
    "ERROR_CONFIG",
    'No se encontró la columna "' + nombreHeader + '" en la hoja de importaciones.'
  );
}

function crearErrorImportacion_(code, message) {
  var error = new Error(message);
  error.code = code;
  return error;
}
