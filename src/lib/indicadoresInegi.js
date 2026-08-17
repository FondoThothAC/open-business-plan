/**
 * Servicio cliente para la API de Indicadores del INEGI (Banco de Indicadores v2.0)
 * Permite consultar datos macroeconómicos reales: PIB, empleo, ingreso, inflación, etc.
 * Incluye caché localStorage de 24h para evitar consultas repetitivas.
 */

const API_BASE = 'http://localhost:3001';
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 horas

// ─────────────────────────────────────────────────────────
//  IDs de indicadores macroeconómicos clave del INEGI
// ─────────────────────────────────────────────────────────
export const INDICADORES_CLAVE = {
  // Población y Demografía
  poblacionTotal: '1002000003',
  poblacionMasculina: '1002000002',
  poblacionFemenina: '1002000001',

  // Empleo y Ocupación (ENOE)
  tasaDesocupacion: '6200240365',
  poblacionEconomicamenteActiva: '1002000025',
  tasaInformalidad: '6200240332',

  // Economía
  pibNacional: '6207019014',
  inflacionMensual: '444612',

  // Vivienda y Hogares
  totalViviendas: '1002000023',
  promedioOcupantesPorVivienda: '1002000026',

  // Educación
  gradoPromedioEscolaridad: '1002000024',

  // Tecnología
  hogareConInternet: '6200205345',
  hogaresConCelular: '6200205352',
};

// Presets de consulta agrupados por tipo de análisis
export const PRESETS_ANALISIS = {
  viabilidadMercado: [
    INDICADORES_CLAVE.poblacionTotal,
    INDICADORES_CLAVE.tasaDesocupacion,
    INDICADORES_CLAVE.pibNacional,
    INDICADORES_CLAVE.inflacionMensual,
    INDICADORES_CLAVE.poblacionEconomicamenteActiva,
  ].join(','),

  perfilSocioeconomico: [
    INDICADORES_CLAVE.poblacionTotal,
    INDICADORES_CLAVE.gradoPromedioEscolaridad,
    INDICADORES_CLAVE.hogareConInternet,
    INDICADORES_CLAVE.hogaresConCelular,
    INDICADORES_CLAVE.totalViviendas,
    INDICADORES_CLAVE.promedioOcupantesPorVivienda,
  ].join(','),

  empleoSector: [
    INDICADORES_CLAVE.tasaDesocupacion,
    INDICADORES_CLAVE.poblacionEconomicamenteActiva,
    INDICADORES_CLAVE.tasaInformalidad,
  ].join(','),
};

// Códigos de entidad federativa para la API de Indicadores
export const ENTIDADES_INEGI = {
  '01': 'Aguascalientes', '02': 'Baja California', '03': 'Baja California Sur',
  '04': 'Campeche', '05': 'Coahuila', '06': 'Colima',
  '07': 'Chiapas', '08': 'Chihuahua', '09': 'Ciudad de México',
  '10': 'Durango', '11': 'Guanajuato', '12': 'Guerrero',
  '13': 'Hidalgo', '14': 'Jalisco', '15': 'Estado de México',
  '16': 'Michoacán', '17': 'Morelos', '18': 'Nayarit',
  '19': 'Nuevo León', '20': 'Oaxaca', '21': 'Puebla',
  '22': 'Querétaro', '23': 'Quintana Roo', '24': 'San Luis Potosí',
  '25': 'Sinaloa', '26': 'Sonora', '27': 'Tabasco',
  '28': 'Tamaulipas', '29': 'Tlaxcala', '30': 'Veracruz',
  '31': 'Yucatán', '32': 'Zacatecas',
};

// ─────────────────────────────────────────────────────────
//  Caché localStorage
// ─────────────────────────────────────────────────────────
function getCached(key) {
  try {
    const cached = localStorage.getItem(`inegi_ind_${key}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.ts < CACHE_TTL) {
        return parsed.data;
      }
      localStorage.removeItem(`inegi_ind_${key}`);
    }
  } catch { /* ignorar errores de localStorage */ }
  return null;
}

function setCache(key, data) {
  try {
    localStorage.setItem(`inegi_ind_${key}`, JSON.stringify({ ts: Date.now(), data }));
  } catch { /* ignorar errores de localStorage */ }
}

// ─────────────────────────────────────────────────────────
//  Funciones de consulta
// ─────────────────────────────────────────────────────────

/**
 * Consulta uno o varios indicadores del INEGI por sus IDs.
 * @param {string} token - Token del Banco de Indicadores INEGI
 * @param {string} ids - ID(s) de indicadores separados por coma
 * @param {string} area - Código de área geográfica (ej: '0700' nacional, '26' Sonora)
 * @param {boolean} soloUltimo - Si true, devuelve solo el dato más reciente
 * @returns {Promise<{success: boolean, series?: Array, error?: string}>}
 */
export async function consultarIndicadores(token, ids, area = '0700', soloUltimo = true) {
  if (!token || !ids) {
    return { success: false, error: 'Token e IDs de indicadores requeridos' };
  }

  const cacheKey = `${ids}_${area}_${soloUltimo}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      token,
      ids,
      area,
      ultimo: soloUltimo ? 'true' : 'false',
    });

    const response = await fetch(`${API_BASE}/api/inegi/indicadores?${params.toString()}`);
    const data = await response.json();

    if (data.success) {
      setCache(cacheKey, data);
    }
    return data;
  } catch (error) {
    console.error('[Indicadores INEGI] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene los indicadores de viabilidad de mercado para una entidad federativa.
 * Devuelve: población, desempleo, PIB, inflación, PEA.
 * @param {string} token - Token del Banco de Indicadores INEGI
 * @param {string} claveEntidad - Código de 2 dígitos de la entidad (ej: '26' para Sonora)
 * @returns {Promise<Object>} Objeto con indicadores parseados
 */
export async function getViabilidadMercado(token, claveEntidad = '0700') {
  const result = await consultarIndicadores(token, PRESETS_ANALISIS.viabilidadMercado, claveEntidad);

  if (!result.success || !result.series) {
    return { success: false, error: result.error || 'Sin datos de indicadores' };
  }

  const parsed = {};
  for (const serie of result.series) {
    const ultimaObs = serie.observaciones?.[serie.observaciones.length - 1];
    if (!ultimaObs) continue;

    const valor = parseFloat(ultimaObs.valor);
    const indicadorId = serie.indicador;

    if (indicadorId === INDICADORES_CLAVE.poblacionTotal) {
      parsed.poblacionTotal = { valor, periodo: ultimaObs.periodo, unidad: serie.unidad };
    } else if (indicadorId === INDICADORES_CLAVE.tasaDesocupacion) {
      parsed.tasaDesocupacion = { valor, periodo: ultimaObs.periodo, unidad: serie.unidad };
    } else if (indicadorId === INDICADORES_CLAVE.pibNacional) {
      parsed.pib = { valor, periodo: ultimaObs.periodo, unidad: serie.unidad };
    } else if (indicadorId === INDICADORES_CLAVE.inflacionMensual) {
      parsed.inflacion = { valor, periodo: ultimaObs.periodo, unidad: serie.unidad };
    } else if (indicadorId === INDICADORES_CLAVE.poblacionEconomicamenteActiva) {
      parsed.pea = { valor, periodo: ultimaObs.periodo, unidad: serie.unidad };
    }
  }

  return { success: true, data: parsed, entidad: claveEntidad };
}

/**
 * Obtiene el perfil socioeconómico para una entidad federativa.
 * Devuelve: población, escolaridad, internet, celular, viviendas.
 * @param {string} token - Token del Banco de Indicadores INEGI
 * @param {string} claveEntidad - Código de la entidad federativa
 * @returns {Promise<Object>} Objeto con indicadores parseados
 */
export async function getPerfilSocioeconomico(token, claveEntidad = '0700') {
  const result = await consultarIndicadores(token, PRESETS_ANALISIS.perfilSocioeconomico, claveEntidad);

  if (!result.success || !result.series) {
    return { success: false, error: result.error || 'Sin datos socioeconómicos' };
  }

  const parsed = {};
  for (const serie of result.series) {
    const ultimaObs = serie.observaciones?.[serie.observaciones.length - 1];
    if (!ultimaObs) continue;

    const valor = parseFloat(ultimaObs.valor);
    const indicadorId = serie.indicador;

    if (indicadorId === INDICADORES_CLAVE.poblacionTotal) {
      parsed.poblacionTotal = { valor, periodo: ultimaObs.periodo };
    } else if (indicadorId === INDICADORES_CLAVE.gradoPromedioEscolaridad) {
      parsed.escolaridadPromedio = { valor, periodo: ultimaObs.periodo };
    } else if (indicadorId === INDICADORES_CLAVE.hogareConInternet) {
      parsed.hogaresConInternet = { valor, periodo: ultimaObs.periodo };
    } else if (indicadorId === INDICADORES_CLAVE.hogaresConCelular) {
      parsed.hogaresConCelular = { valor, periodo: ultimaObs.periodo };
    } else if (indicadorId === INDICADORES_CLAVE.totalViviendas) {
      parsed.totalViviendas = { valor, periodo: ultimaObs.periodo };
    } else if (indicadorId === INDICADORES_CLAVE.promedioOcupantesPorVivienda) {
      parsed.promedioOcupantesPorVivienda = { valor, periodo: ultimaObs.periodo };
    }
  }

  return { success: true, data: parsed, entidad: claveEntidad };
}
