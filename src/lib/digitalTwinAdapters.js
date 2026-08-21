/**
 * Capa de Adaptadores Unificados para Gemelos Digitales (Datos Económicos y Financieros).
 * 
 * Transforma respuestas heterogéneas (JSON, Series Temporales, Texto) provenientes de
 * AlphaVantage, FRED, INEGI, BANXICO, Yahoo Finance y Google en un esquema estandarizado
 * que alimenta directamente el análisis PESTEL, el cálculo de WACC y la base de datos de trazabilidad.
 */

/**
 * Esquema Normalizado de Datos de Gemelo Digital:
 * @typedef {Object} DigitalTwinRecord
 * @property {string} indicator - Nombre técnico y descriptivo del indicador (ej. 'Tasa de Interés Libre de Riesgo').
 * @property {number|string} value - Valor numérico principal o síntesis.
 * @property {string} unit - Unidad de medida ('%', 'USD', 'MXN', 'Índice', 'Puntos').
 * @property {Array<{date: string, val: number}>} timeseries - Serie histórica cronológica (si aplica).
 * @property {string} source - Nombre oficial de la fuente ('FRED', 'AlphaVantage', 'INEGI', 'BANXICO').
 * @property {string} timestamp - Fecha y hora ISO de adquisición de datos.
 * @property {'json'|'timeseries'|'text'|'tabular'} rawType - Formato de origen de los datos.
 * @property {Object} metadata - Información contextual adicional (periodicidad, sector, ticker).
 */

/**
 * Adaptador para AlphaVantage (Balances, Ratios, Precios y Métricas Financieras).
 * @param {Object} rawData - Respuesta cruda en JSON de la API de AlphaVantage.
 * @param {string} symbol - Ticker o símbolo analizado.
 * @returns {DigitalTwinRecord} Registro estandarizado.
 */
export function adaptAlphaVantage(rawData, symbol = 'MERCADO') {
  if (!rawData) {
    return {
      indicator: `Métricas Financieras (${symbol})`,
      value: 'Sin datos',
      unit: 'N/A',
      timeseries: [],
      source: 'AlphaVantage',
      timestamp: new Date().toISOString(),
      rawType: 'json',
      metadata: { error: 'Respuesta vacía de AlphaVantage' }
    };
  }

  // Si es un Overview / Resumen Fundamental
  if (rawData.Symbol || rawData.PERatio || rawData.Beta) {
    return {
      indicator: `Perfil Financiero y Riesgo (${rawData.Symbol || symbol})`,
      value: parseFloat(rawData.Beta) || 1.0,
      unit: 'Beta',
      timeseries: [],
      source: 'AlphaVantage',
      timestamp: new Date().toISOString(),
      rawType: 'json',
      metadata: {
        per: parseFloat(rawData.PERatio) || null,
        eps: parseFloat(rawData.EPS) || null,
        sector: rawData.Sector || 'General',
        industry: rawData.Industry || 'General',
        waccReferenceBeta: parseFloat(rawData.Beta) || 1.0
      }
    };
  }

  // Si es una Serie de Tiempo (Time Series Daily / Monthly)
  const timeSeriesKey = Object.keys(rawData).find(k => k.includes('Time Series'));
  if (timeSeriesKey && rawData[timeSeriesKey]) {
    const seriesObj = rawData[timeSeriesKey];
    const points = Object.entries(seriesObj).slice(0, 30).map(([date, vals]) => ({
      date,
      val: parseFloat(vals['4. close'] || vals['close'] || 0)
    }));

    const latestVal = points.length > 0 ? points[0].val : 0;

    return {
      indicator: `Evolución de Precios y Volatilidad (${symbol})`,
      value: latestVal,
      unit: 'USD',
      timeseries: points,
      source: 'AlphaVantage',
      timestamp: new Date().toISOString(),
      rawType: 'timeseries',
      metadata: { symbol, totalPoints: points.length }
    };
  }

  return {
    indicator: `Datos Generales AlphaVantage (${symbol})`,
    value: 'Procesado',
    unit: 'JSON',
    timeseries: [],
    source: 'AlphaVantage',
    timestamp: new Date().toISOString(),
    rawType: 'json',
    metadata: rawData
  };
}

/**
 * Adaptador para FRED (Federal Reserve Economic Data).
 * @param {Object} rawData - Respuesta cruda JSON de FRED.
 * @param {string} seriesId - ID de la serie (ej. 'DGS10' para bonos a 10 años, 'CPIAUCSL' para inflación).
 * @returns {DigitalTwinRecord} Registro estandarizado.
 */
export function adaptFred(rawData, seriesId = 'DGS10') {
  if (!rawData || !rawData.observations || !Array.isArray(rawData.observations)) {
    return {
      indicator: `Indicador Macroeconómico FRED (${seriesId})`,
      value: 0,
      unit: '%',
      timeseries: [],
      source: 'FRED (Federal Reserve)',
      timestamp: new Date().toISOString(),
      rawType: 'timeseries',
      metadata: { error: 'Sin observaciones válidas' }
    };
  }

  const validObs = rawData.observations
    .filter(obs => obs.value && obs.value !== '.')
    .map(obs => ({
      date: obs.date,
      val: parseFloat(obs.value)
    }));

  const latest = validObs.length > 0 ? validObs[validObs.length - 1] : { val: 0, date: '' };

  const indicatorMap = {
    'DGS10': { name: 'Tasa Libre de Riesgo (Bonos Tesoro EE.UU. 10Y)', unit: '%' },
    'CPIAUCSL': { name: 'Índice de Precios al Consumidor (Inflación USA)', unit: 'Índice' },
    'FEDFUNDS': { name: 'Tasa de Fondos Federales', unit: '%' }
  };

  const info = indicatorMap[seriesId] || { name: `Serie FRED ${seriesId}`, unit: 'Puntos' };

  return {
    indicator: info.name,
    value: latest.val,
    unit: info.unit,
    timeseries: validObs.slice(-24), // Últimos 24 periodos
    source: 'FRED (Federal Reserve)',
    timestamp: new Date().toISOString(),
    rawType: 'timeseries',
    metadata: { seriesId, latestDate: latest.date }
  };
}

/**
 * Adaptador para INEGI / BANXICO.
 * @param {Object} rawData - Respuesta de la API oficial.
 * @param {string} indicatorType - 'inflacion', 'cetes28', 'tipo_cambio', 'denue'.
 * @returns {DigitalTwinRecord} Registro estandarizado.
 */
export function adaptMexicanMacro(rawData, indicatorType = 'inflacion') {
  const now = new Date().toISOString();
  
  if (indicatorType === 'tipo_cambio') {
    const val = typeof rawData === 'number' ? rawData : (parseFloat(rawData?.dato) || 18.5);
    return {
      indicator: 'Tipo de Cambio FIX (USD/MXN)',
      value: val,
      unit: 'MXN/USD',
      timeseries: [],
      source: 'BANXICO (SieAPI)',
      timestamp: now,
      rawType: 'tabular',
      metadata: { indicador: indicatorType }
    };
  }

  if (indicatorType === 'cetes28') {
    const val = typeof rawData === 'number' ? rawData : (parseFloat(rawData?.dato) || 11.0);
    return {
      indicator: 'Tasa de Rendimiento CETES 28 días',
      value: val,
      unit: '%',
      timeseries: [],
      source: 'BANXICO (SieAPI)',
      timestamp: now,
      rawType: 'tabular',
      metadata: { indicador: indicatorType }
    };
  }

  return {
    indicator: `Indicador INEGI / BANXICO (${indicatorType})`,
    value: rawData?.valor || rawData || 'Activo',
    unit: 'General',
    timeseries: [],
    source: 'INEGI / BANXICO',
    timestamp: now,
    rawType: 'json',
    metadata: { indicatorType }
  };
}

/**
 * Agrega y persiste un registro normalizado de Gemelo Digital en el estado del plan.
 * @param {Object} currentPlanData - Estado actual del plan de negocios.
 * @param {DigitalTwinRecord} adaptedRecord - Registro normalizado.
 * @returns {Object} planData actualizado con la evidencia almacenada en trazabilidad.
 */
export function injectDigitalTwinEvidence(currentPlanData, adaptedRecord) {
  if (!currentPlanData) return currentPlanData;
  
  const existingRecords = currentPlanData.digitalTwinEvidence || [];
  const updatedRecords = [
    ...existingRecords.filter(r => r.indicator !== adaptedRecord.indicator),
    adaptedRecord
  ];

  return {
    ...currentPlanData,
    digitalTwinEvidence: updatedRecords,
    lastDigitalTwinSync: new Date().toISOString()
  };
}
