// ═══════════════════════════════════════════════════════════════════════════
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

  const isExceeded = currentCount >= limit;

  if (isExceeded && !allowPaidTier) {
    return {
      allowed: false,
      quotaExceeded: true,
      requiresAuthorization: true,
      provider: normProvider,
      count: currentCount,
      limit,
      remaining: 0,
      message: `Cuota mensual de ${limit} consultas para ${normProvider} alcanzada. Requiere autorización para activar Fila 2 de pago.`
    };
  }

  return {
    allowed: true,
    quotaExceeded: isExceeded,
    requiresAuthorization: false,
    paidTierActive: isExceeded && allowPaidTier,
    provider: normProvider,
    count: currentCount,
    limit,
    remaining: Math.max(0, limit - currentCount)
  };
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
    duckduckgo: { count: 0, limit: DEFAULT_QUOTA_LIMITS.duckduckgo }
  };
  saveQuotaData(allData);
  return allData[monthKey];
}
