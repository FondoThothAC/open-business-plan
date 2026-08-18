/**
 * Configuración unificada de URLs base para el Backend de Open Business Plan
 * Soporta ejecución local (localhost:3001) y despliegues en producción (/obp/)
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
