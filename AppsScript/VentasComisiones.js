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
