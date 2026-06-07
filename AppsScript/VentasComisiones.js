const HOJA_IMPORTACIONES_VENTAS = "ImportacionesVentas";
const HOJA_VENTAS_POS = "VentasPOS";
const HOJA_PROPINAS_POS = "PropinasPOS";
const HOJA_VENTAS_DIARIAS = "VentasDiarias";
const HOJA_COMISIONES_DIARIAS = "ComisionesDiarias";
const HOJA_RESUMEN_MENSUAL_COMISIONES = "ResumenMensualComisiones";
const HOJA_PAGOS_POS = "PagosPOS";
const HOJA_PRODUCTOS_POS = "ProductosPOS";
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
      resultado.creadas++;
      resultado.hojas.push({
        hoja: config.name,
        estado: "CREADA",
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
  var importacion = contexto.importacion;
  var importId = importacion.importId;
  var ventasValidas = obtenerVentasValidasPorImportId_(importId);
  var propinasValidas = obtenerPropinasValidasPorImportId_(importId);
  var filasVentasDiarias = construirFilasVentasDiarias_(importacion, ventasValidas, propinasValidas);

  limpiarResultadosCalculoPorImportId_(importId);

  if (filasVentasDiarias.length > 0) {
    var hojaVentasDiarias = getSheet_(HOJA_VENTAS_DIARIAS, SPREADSHEET_KEY_VENTAS);
    hojaVentasDiarias
      .getRange(hojaVentasDiarias.getLastRow() + 1, 1, filasVentasDiarias.length, filasVentasDiarias[0].length)
      .setValues(filasVentasDiarias);
  }

  return responderJSON({
    status: "SUCCESS",
    importId: String(importId || "").trim(),
    local: String(importacion.local || "").trim(),
    periodo: String(importacion.periodo || "").trim(),
    importacionResueltaPor: contexto.resueltoPor,
    diasProcesados: filasVentasDiarias.length,
    resumen: construirResumenRecalculo_(filasVentasDiarias)
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

    validarMetadataImportacion_(metadata);
    validarColeccionesImportacion_(ventas, propinas);

    hojaImportaciones = getSheet_(HOJA_IMPORTACIONES_VENTAS, SPREADSHEET_KEY_VENTAS);
    var hojaVentas = getSheet_(HOJA_VENTAS_POS, SPREADSHEET_KEY_VENTAS);
    var hojaPropinas = getSheet_(HOJA_PROPINAS_POS, SPREADSHEET_KEY_VENTAS);
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

    return {
      status: ESTADO_IMPORTACION_SUCCESS,
      importId: importId,
      local: metadata.local,
      periodo: metadata.periodo,
      importacionReemplazada: idsReemplazados,
      registrosVentas: filasVentas.length,
      registrosPropinas: filasPropinas.length,
      observaciones: observaciones
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

  return {
    local: limpiarTextoImportacion_(objeto.local),
    periodo: limpiarTextoImportacion_(objeto.periodo),
    nombreArchivo: limpiarTextoImportacion_(objeto.nombreArchivo),
    hashArchivo: limpiarTextoImportacion_(objeto.hashArchivo),
    fechaDesde: limpiarTextoImportacion_(objeto.fechaDesde),
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
}

function validarColeccionesImportacion_(ventas, propinas) {
  if (!Array.isArray(ventas) || !Array.isArray(propinas)) {
    throw crearErrorImportacion_(
      "ERROR_DATOS",
      'Los campos "ventas" y "propinas" deben ser arrays.'
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
      periodo: fila[buscarIndiceHeader_(headers, "Periodo")],
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
    periodo: String(importacion.periodo || "").trim(),
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

function sumarMontosPorCampo_(registros, nombreCampo) {
  return (registros || []).reduce(function(total, registro) {
    return total + normalizarMontoImportacion_(registro[nombreCampo]);
  }, 0);
}

function limpiarResultadosCalculoPorImportId_(importId) {
  eliminarFilasPorImportIdEnHoja_(HOJA_VENTAS_DIARIAS, importId);
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
      var calculo = calcularMetricasDiarias_(grupo.ventaBrutaValida);

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

function calcularMetricasDiarias_(ventaBrutaValida) {
  var ventaBruta = normalizarMontoImportacion_(ventaBrutaValida);
  var ventaNeta = redondearMonto_(ventaBruta / 1.19);
  var tramo = ventaNeta < 500000 ? "BAJO" : "ALTO";
  var porcentaje = tramo === "ALTO" ? 0.013 : 0.01;
  var comisionTotalDia = redondearMonto_(ventaNeta * porcentaje);

  return {
    ventaNetaValida: ventaNeta,
    tramoComision: tramo,
    porcentajeComision: porcentaje,
    comisionTotalDia: comisionTotalDia
  };
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
