/**
 * Service for INEGI / DENUE API Integration
 */

const API_BASE = 'http://localhost:3001';

export async function geocodeMx(query) {
  if (!query || !query.trim()) return { success: false, error: 'Ubicación vacía' };

  try {
    const response = await fetch(`${API_BASE}/api/geo/geocode?q=${encodeURIComponent(query.trim())}`);
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function searchCompetenciaDENUE(token, lat, lng, radius = 2000, keywords = 'todos') {
  try {
    const params = new URLSearchParams({
      token: token || '',
      lat: String(lat),
      lng: String(lng),
      radius: String(radius),
      keywords,
    });

    const response = await fetch(`${API_BASE}/api/inegi/denue?${params.toString()}`);
    const data = await response.json();
    if (!data?.success) return { success: false, error: data?.error || 'Error en consulta DENUE' };

    return data;
  } catch (error) {
    console.error('DENUE Error:', error);
    return { success: false, error: error.message };
  }
}

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

export async function getInegiMunicipio(municipioName) {
  if (!municipioName || !municipioName.trim()) return { success: false, error: 'Nombre de municipio vacío' };

  try {
    const response = await fetch(`${API_BASE}/api/inegi/municipio/${encodeURIComponent(municipioName.trim())}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching municipal data:', error);
    return { success: false, error: error.message };
  }
}
