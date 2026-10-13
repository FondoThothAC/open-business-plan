/**
 * [B6] Buscador seguro con espaciamiento serial y reintento.
 *
 * nace de la correccion del deadlock que introdujo la primera version de safeDdgSearch:
 * el reintento volv a llamar a safeDdgSearch DESDE ADENTRO del turno de la cola, y la cola
 * encadena el siguiente eslabon sobre una promesa que aun no haba resuelto, as que ese
 * reintento nunca poda empezar. Cualquier respuesta "too quickly" de DuckDuckGo colgaba
 * /api/search y /api/market/enrich de forma permanente hasta reiniciar PM2.
 *
 * Aq el reintento es un bucle DENTRO del mismo turno: no se re-entra en la cola. Se
 * fabrica as para poder probarse con un buscador inyectado, sin red real y sin importar
 * server/index.js (que arrancara el servidor al importarlo).
 */
import { createThrottledQueue } from './serialQueue.js';

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {{
 *   buscar: (query: string) => Promise<{results?: Array<any>}>,
 *   intervalMs?: number,
 *   reintentosPorDefecto?: number,
 *   esperaReintentoMs?: number,
 *   etiqueta?: string
 * }} opciones
 * @returns {(query: string, reintentos?: number) => Promise<Array<any>>}
 */
export function crearBuscadorSeguro({ buscar, intervalMs = 1200, reintentosPorDefecto = 2, esperaReintentoMs = 2500, etiqueta = 'DDG Seguro' }) {
  const cola = createThrottledQueue({ intervalMs });

  return async function buscarSeguro(query, reintentos = reintentosPorDefecto) {
    return cola.run(async () => {
      let restantes = reintentos;
      for (;;) {
        try {
          const respuesta = await buscar(query);
          return respuesta?.results || [];
        } catch (error) {
          const esLimite = String(error?.message || '').includes('too quickly');
          if (esLimite && restantes > 0) {
            restantes -= 1;
            console.warn(`[${etiqueta}] L\u00edmite de tasa detectado para "${query}". Pausando ${esperaReintentoMs}ms... (${restantes} reintentos restantes)`);
            await esperar(esperaReintentoMs);
            continue;
          }
          console.warn(`[${etiqueta}] B\u00fasqueda no disponible para "${query}":`, error?.message);
          return [];
        }
      }
    });
  };
}
