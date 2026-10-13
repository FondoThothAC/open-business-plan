// ═══════════════════════════════════════════════════════════════════════════
import { writeJsonAtomic } from '../src/lib/serverUtils/atomicJson.js';
//  Gestor de Cuotas Persistidas de Búsqueda Web (Fila 1 Freemium / Fila 2)
//  Persistencia mensual en server/data/search_quota.json
// ═══════════════════════════════════════════════════════════════════════════

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QUOTA_FILE = path.join(__dirname, 'data', 'search_quota.json');

// Límites por defecto de cortesía antes de pausar y solicitar autorización
export const DEFAULT_QUOTA_LIMITS = {
  tavily: 950,     // Nivel gratuito permite 1,000/mes; alertar en 950
  brave: 1000,     // Con los $5 de crédito gratuito (~1,000 req)
  serper: 2500,    // 2,500 búsquedas gratuitas de Google
  duckduckgo: 10000 // Sin límite factual de pago, solo salvaguarda local
};

export function getCurrentMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function loadQuotaData() {
  try {
    if (fs.existsSync(QUOTA_FILE)) {
      const content = fs.readFileSync(QUOTA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('[QuotaTracker] Error leyendo archivo de cuotas, rearmando en memoria:', err.message);
  }
  return {};
}

export function saveQuotaData(data) {
  try {
    const dir = path.dirname(QUOTA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(QUOTA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[QuotaTracker] No se pudo guardar archivo de cuotas:', err.message);
  }
}

export function checkSearchQuota(provider = 'duckduckgo', allowPaidTier = false) {
  const normProvider = provider.toLowerCase();
  if (normProvider === 'duckduckgo') {
    return {
      allowed: true,
      quotaExceeded: false,
      requiresAuthorization: false,
      provider: normProvider,
      count: 0,
      limit: DEFAULT_QUOTA_LIMITS.duckduckgo
    };
  }

  const monthKey = getCurrentMonthKey();
  const allData = loadQuotaData();
  const monthData = allData[monthKey] || {};
  const currentCount = monthData[normProvider]?.count || 0;
  const limit = monthData[normProvider]?.limit || DEFAULT_QUOTA_LIMITS[normProvider] || 1000;

  // [B3] Las reservas en vuelo cuentan como usadas: es lo que impide que N requests
  // concurrentes pasen el mismo chequeo antes de que nadie incremente.
  const pendientes = normProvider === 'duckduckgo' ? 0 : pendientesDe(claveReserva(normProvider));
  const usado = currentCount + pendientes;

  const isExceeded = usado >= limit;

  if (isExceeded && !allowPaidTier) {
    return {
      allowed: false,
      quotaExceeded: true,
      requiresAuthorization: true,
      provider: normProvider,
      count: usado,
      limit,
      remaining: 0,
      message: `Cuota mensual de ${limit} consultas para ${normProvider} alcanzada. Requiere autorización para activar Fila 2 de pago.`
    };
  }

  const estado = {
    allowed: true,
    quotaExceeded: isExceeded,
    requiresAuthorization: false,
    paidTierActive: isExceeded && allowPaidTier,
    provider: normProvider,
    count: usado,
    limit,
    // [B3] check-and-reserve: si se autoriza, se aparta el cupo en memoria. Se libera con
    // devolverCuota() al incrementar, o por expiración si la rama no usa este proveedor.
    remaining: Math.max(0, limit - usado - 1)
  };
  agregarReserva(claveReserva(normProvider));
  return estado;
}

// ─────────────────────────────────────────────────────────────────────────────
//  [B3] Reserva de cuota: cierra el TOCTOU real del cascade de búsqueda.
//  En /api/search se hace checkSearchQuota() -> await safeDdgSearch() -> increment, así
//  que N requests concurrentes pasaban el chequeo juntos y sobrepasaban el tope mensual.
//  La reserva vive DENTRO de checkSearchQuota (check-and-reserve en un paso síncrono)
//  para no reescribir los 13 puntos de incremento del cascade. Con instances:1 y código
//  síncrono, el par check→reserve es indivisible dentro del tick, así que el contador en
//  memoria es autoritativo mientras dura la llamada de red.
//  Las reservas expiran a los 5 minutos: si una rama de fallback no termina usando ese
//  proveedor, el cupo se libera solo y no se fuga capacidad de forma permanente.
// ─────────────────────────────────────────────────────────────────────────────
const reservasPendientes = new Map();
const VIDA_RESERVA_MS = 5 * 60 * 1000;

function claveReserva(provider) {
  return `${getCurrentMonthKey()}:${String(provider).toLowerCase()}`;
}

function pendientesDe(key, ahora = Date.now()) {
  const lista = reservasPendientes.get(key);
  if (!lista || lista.length === 0) return 0;
  const vivas = lista.filter(t => ahora - t < VIDA_RESERVA_MS);
  if (vivas.length === 0) reservasPendientes.delete(key);
  else reservasPendientes.set(key, vivas);
  return vivas.length;
}

function agregarReserva(key) {
  if (!reservasPendientes.has(key)) reservasPendientes.set(key, []);
  reservasPendientes.get(key).push(Date.now());
}

/**
 * Libera una reserva al consumir la cuota (o al descartarla explícitamente).
 * @param {string} provider nombre del proveedor
 */
export function devolverCuota(provider = 'duckduckgo') {
  const key = claveReserva(provider);
  const lista = reservasPendientes.get(key);
  if (!lista || lista.length === 0) return;
  lista.shift();
  if (lista.length === 0) reservasPendientes.delete(key);
}

/** Número de reservas vivas de un proveedor (expuesto para pruebas de regresión). */
export function reservasVivas(provider = 'duckduckgo') {
  return pendientesDe(claveReserva(provider));
}

export function incrementSearchQuota(provider = 'duckduckgo') {
  const normProvider = provider.toLowerCase();
  const monthKey = getCurrentMonthKey();
  const allData = loadQuotaData();

  if (!allData[monthKey]) {
    allData[monthKey] = {};
  }

  if (!allData[monthKey][normProvider]) {
    allData[monthKey][normProvider] = {
      count: 0,
      limit: DEFAULT_QUOTA_LIMITS[normProvider] || 1000
    };
  }

  allData[monthKey][normProvider].count += 1;
  saveQuotaData(allData);
  devolverCuota(normProvider);   // [B3] la reserva en vuelo ya se materializó en el conteo
  return allData[monthKey][normProvider].count;
}

export function getSearchQuotaStats() {
  const monthKey = getCurrentMonthKey();
  const allData = loadQuotaData();
  const monthData = allData[monthKey] || {};

  return {
    month: monthKey,
    tavily: {
      count: monthData.tavily?.count || 0,
      limit: monthData.tavily?.limit || DEFAULT_QUOTA_LIMITS.tavily
    },
    brave: {
      count: monthData.brave?.count || 0,
      limit: monthData.brave?.limit || DEFAULT_QUOTA_LIMITS.brave
    },
    serper: {
      count: monthData.serper?.count || 0,
      limit: monthData.serper?.limit || DEFAULT_QUOTA_LIMITS.serper
    },
    duckduckgo: {
      count: monthData.duckduckgo?.count || 0,
      limit: monthData.duckduckgo?.limit || DEFAULT_QUOTA_LIMITS.duckduckgo
    }
  };
}

export function resetSearchQuota(monthKey = getCurrentMonthKey()) {
  const allData = loadQuotaData();
  allData[monthKey] = {
    tavily: { count: 0, limit: DEFAULT_QUOTA_LIMITS.tavily },
    brave: { count: 0, limit: DEFAULT_QUOTA_LIMITS.brave },
    serper: { count: 0, limit: DEFAULT_QUOTA_LIMITS.serper },
    duckduckgo: { count: 0, limit: DEFAULT_QUOTA_LIMITS.duckduckgo }
  };
  saveQuotaData(allData);
  return allData[monthKey];
}
