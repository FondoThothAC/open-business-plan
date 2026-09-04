/**
 * Servicio cliente para la API DENUE del INEGI + Geocodificación + Banxico
 * Incluye todos los métodos del DENUE: Buscar, Ficha, Nombre, BuscarEntidad, BuscarAreaAct, Cuantificar
 */

import { getApiBase } from '../config/apiConfig';

const API_BASE = getApiBase();

// ─────────────────────────────────────────────────────────
//  Geocodificación (Nominatim/OSM)
// ─────────────────────────────────────────────────────────
export async function geocodeMx(query) {
  if (!query || !query.trim()) return { success: false, error: 'Ubicación vacía' };

  try {
    const response = await fetch(`${API_BASE}/api/geo/geocode?q=${encodeURIComponent(query.trim())}`);
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────
//  DENUE — Buscar (por coordenadas + radio + actividad/keywords)
// ─────────────────────────────────────────────────────────
export async function searchCompetenciaDENUE(token, lat, lng, radius = 2000, keywords = 'todos', scian = '0') {
  try {
    const params = new URLSearchParams({
      token: token || '',
      lat: String(lat),
      lng: String(lng),
      radius: String(radius),
      keywords,
      scian,
    });

    const response = await fetch(`${API_BASE}/api/inegi/denue?${params.toString()}`);
    const data = await response.json();
    if (!data?.success) return { success: false, error: data?.error || 'Error en consulta DENUE' };

    return data;
  } catch (error) {
    console.error('[DENUE Buscar] Error:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────
//  DENUE — Ficha (detalle completo de un establecimiento)
// ─────────────────────────────────────────────────────────
/**
 * Obtiene la ficha completa de un establecimiento del DENUE.
 * @param {string} token - Token DENUE del INEGI
 * @param {string} id - ID del establecimiento (campo 'id' de los resultados de búsqueda)
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function fichaEstablecimiento(token, id) {
  if (!token) return { success: false, error: 'Token DENUE requerido' };
  if (!id) return { success: false, error: 'ID de establecimiento requerido' };

  try {
    const response = await fetch(`${API_BASE}/api/inegi/denue/ficha/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`);
    return await response.json();
  } catch (error) {
    console.error('[DENUE Ficha] Error:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────
//  DENUE — Nombre (buscar por nombre/razón social a nivel nacional)
// ─────────────────────────────────────────────────────────
/**
 * Busca establecimientos por nombre o razón social.
 * @param {string} token - Token DENUE del INEGI
 * @param {string} nombre - Nombre o razón social a buscar
 * @param {string} entidad - Código de entidad federativa ('00' = todas, '26' = Sonora, etc.)
 * @param {number} inicio - Registro de inicio (paginación)
 * @param {number} fin - Registro final (paginación)
 * @returns {Promise<{success: boolean, total?: number, businesses?: Array, error?: string}>}
 */
export async function buscarPorNombre(token, nombre, entidad = '00', inicio = 1, fin = 20) {
  if (!token) return { success: false, error: 'Token DENUE requerido' };
  if (!nombre) return { success: false, error: 'Nombre de establecimiento requerido' };

  try {
    const params = new URLSearchParams({
      token,
      nombre,
      entidad,
      inicio: String(inicio),
      fin: String(fin),
    });

    const response = await fetch(`${API_BASE}/api/inegi/denue/nombre?${params.toString()}`);
    return await response.json();
  } catch (error) {
    console.error('[DENUE Nombre] Error:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────
//  DENUE — BuscarEntidad (por entidad federativa + condición)
// ─────────────────────────────────────────────────────────
/**
 * Busca establecimientos por entidad federativa.
 * @param {string} token - Token DENUE del INEGI
 * @param {string} condicion - Palabra clave o 'todos'
 * @param {string} entidad - Código de entidad ('00' = todas)
 * @param {number} inicio - Registro de inicio
 * @param {number} fin - Registro final
 * @returns {Promise<{success: boolean, total?: number, businesses?: Array, error?: string}>}
 */
export async function buscarPorEntidad(token, condicion = 'todos', entidad = '00', inicio = 1, fin = 20) {
  if (!token) return { success: false, error: 'Token DENUE requerido' };

  try {
    const params = new URLSearchParams({
      token,
      condicion,
      entidad,
      inicio: String(inicio),
      fin: String(fin),
    });

    const response = await fetch(`${API_BASE}/api/inegi/denue/entidad?${params.toString()}`);
    return await response.json();
  } catch (error) {
    console.error('[DENUE Entidad] Error:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────
//  DENUE — BuscarAreaAct (por área geográfica + actividad SCIAN)
// ─────────────────────────────────────────────────────────
/**
 * Busca establecimientos por área geográfica y actividad económica del SCIAN.
 * @param {string} token - Token DENUE del INEGI
 * @param {Object} opciones - Opciones de búsqueda
 * @param {string} opciones.entidad - Código de entidad ('00' = todas)
 * @param {string} opciones.municipio - Código de municipio ('0' = todos)
 * @param {string} opciones.sector - Código de sector SCIAN ('0' = todos)
 * @param {string} opciones.subsector - Código de subsector ('0' = todos)
 * @param {string} opciones.rama - Código de rama ('0' = todos)
 * @param {string} opciones.clase - Código de clase ('0' = todos)
 * @param {string} opciones.nombre - Filtro por nombre ('0' = sin filtro)
 * @param {number} opciones.inicio - Paginación inicio
 * @param {number} opciones.fin - Paginación fin
 * @returns {Promise<{success: boolean, total?: number, businesses?: Array, error?: string}>}
 */
export async function buscarPorArea(token, opciones = {}) {
  if (!token) return { success: false, error: 'Token DENUE requerido' };

  const {
    entidad = '00', municipio = '0', localidad = '0',
    ageb = '0', manzana = '0',
    sector = '0', subsector = '0', rama = '0', clase = '0',
    nombre = '0', inicio = 1, fin = 50, id = '0'
  } = opciones;

  try {
    const params = new URLSearchParams({
      token, entidad, municipio, localidad, ageb, manzana,
      sector, subsector, rama, clase, nombre,
      inicio: String(inicio), fin: String(fin), id,
    });

    const response = await fetch(`${API_BASE}/api/inegi/denue/area?${params.toString()}`);
    return await response.json();
  } catch (error) {
    console.error('[DENUE AreaAct] Error:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────
//  DENUE — Cuantificar (conteo de establecimientos)
// ─────────────────────────────────────────────────────────
/**
 * Cuenta establecimientos por actividad, área geográfica y estrato.
 * @param {string} token - Token DENUE del INEGI
 * @param {string} actividad - Código de actividad SCIAN ('0' = todas)
 * @param {string} area - Código de área geográfica ('0' = todo el país)
 * @param {string} estrato - Código de estrato por personal ('0' = todos)
 *   Estratos: 1=0-5, 2=6-10, 3=11-30, 4=31-50, 5=51-100, 6=101-250, 7=251+
 * @returns {Promise<{success: boolean, total?: number, error?: string}>}
 */
export async function cuantificarDENUE(token, actividad = '0', area = '0', estrato = '0') {
  if (!token) return { success: false, error: 'Token DENUE requerido' };

  try {
    const params = new URLSearchParams({ token, actividad, area, estrato });
    const response = await fetch(`${API_BASE}/api/inegi/denue/cuantificar?${params.toString()}`);
    return await response.json();
  } catch (error) {
    console.error('[DENUE Cuantificar] Error:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────
//  Banxico — Inflación (tasa de referencia)
// ─────────────────────────────────────────────────────────
export async function getInflacionBanxico(token) {
  if (!token) return { success: false, error: 'Token Banxico no configurado' };

  const url = 'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SP74625/datos/oportuno';

  try {
    const response = await fetch(url, {
      headers: { 'Bmx-Token': token }
    });
    const data = await response.json();
    const dato = data?.bmx?.series?.[0]?.datos?.[0];
    if (!dato) return { success: false, error: 'Sin datos de inflación' };

    return {
      success: true,
      valor: dato.dato,
      fecha: dato.fecha
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────
//  INEGI — Datos municipales (base local)
// ─────────────────────────────────────────────────────────
export async function getInegiMunicipio(municipioName) {
  if (!municipioName || !municipioName.trim()) return { success: false, error: 'Nombre de municipio vacío' };

  try {
    const response = await fetch(`${API_BASE}/api/inegi/municipio/${encodeURIComponent(municipioName.trim())}`);
    return await response.json();
  } catch (error) {
    console.error('[INEGI Municipio] Error:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────
//  Motor de Mercado — Búsqueda Multi-Fuente & Viabilidad
// ─────────────────────────────────────────────────────────
/**
 * Consulta el motor multi-fuente para obtener competidores unificados.
 * @param {Object} params
 * @param {number} params.lat - Latitud
 * @param {number} params.lng - Longitud
 * @param {string} params.query - Término de búsqueda / palabras clave
 * @param {number} params.radius - Radio en metros
 * @param {string} params.denueToken - Token INEGI/DENUE
 * @param {string} params.googleApiKey - API Key de Google Places (opcional)
 * @param {string} params.bingApiKey - API Key de Bing Maps (opcional)
 * @returns {Promise<Object>}
 */
export async function getMarketCompetitors({ lat, lng, query, radius, denueToken, googleApiKey, bingApiKey, allowSynthetic = false }) {
  try {
    const response = await fetch(`${API_BASE}/api/market/competitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat, lng, query, radius, denueToken, googleApiKey, bingApiKey, allowSynthetic }),
    });
    return await response.json();
  } catch (error) {
    console.error('[Market Competitors API] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Consulta la viabilidad de mercado combinando competidores e indicadores.
 * @param {Object} params
 * @param {Array} params.competidores - Listado de competidores
 * @param {Object} params.indicadores - Datos demográficos/indicadores económicos
 * @param {number} params.precioProducto - Precio estimado
 * @param {number} params.radioKm - Radio en Km
 * @returns {Promise<Object>}
 */
export async function getMarketViability({ competidores, indicadores, precioProducto, radioKm }) {
  try {
    const response = await fetch(`${API_BASE}/api/market/viability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ competidores, indicadores, precioProducto, radioKm }),
    });
    return await response.json();
  } catch (error) {
    console.error('[Market Viability API] Error:', error);
    return { success: false, error: error.message };
  }
}
