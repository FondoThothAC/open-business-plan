/**
 * Configuración unificada de URLs base y utilidades de comunicación para el Backend de Open Business Plan.
 * Soporta ejecución local (localhost:3001) y despliegues en producción (/obp/).
 */

export function getApiBase() {
  if (typeof window === 'undefined') return 'http://localhost:3001';
  
  // En producción (ej. fondothoth.com) el backend está enrutado bajo /obp/api o directo /api
  // Nginx se encarga de redirigir /obp/api/ -> http://127.0.0.1:3001/api/
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/obp';
  }
  
  return 'http://localhost:3001';
}

export const API_BASE = getApiBase();

/**
 * Parsea de forma segura respuestas HTTP evitando que páginas de error HTML (como 502 Bad Gateway de Nginx)
 * ensucien o rompan la interfaz de usuario.
 */
export async function safeFetchJson(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return { ok: res.ok, status: res.status, data };
    } catch {
      if (res.status === 502 || text.includes('502 Bad Gateway')) {
        return {
          ok: false,
          status: 502,
          isServerDown: true,
          error: 'Servidor backend desconectado (502 Bad Gateway). Ejecuta "pm2 restart" en el servidor VPS.'
        };
      }
      if (res.status === 504 || text.includes('504 Gateway Time-out')) {
        return { ok: false, status: 504, error: 'Tiempo de espera agotado en servidor (504 Gateway Timeout).' };
      }
      if (res.status === 404) {
        return { ok: false, status: 404, error: 'Ruta no encontrada en el backend (404 Not Found).' };
      }
      const cleanText = text.replace(/<[^>]*>/g, '').trim().slice(0, 120);
      return { ok: false, status: res.status, error: cleanText || `Error de conexión HTTP ${res.status}` };
    }
  } catch (err) {
    return {
      ok: false,
      status: 0,
      isServerDown: true,
      error: `No se pudo contactar al servidor: ${err.message}`
    };
  }
}
