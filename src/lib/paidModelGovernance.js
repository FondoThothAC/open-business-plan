/**
 * Gobernanza de Costos y Human-in-the-Loop para APIs de Inteligencia Artificial
 * Fondo Thoth AC — Open Business Plan
 * 
 * Controla y previene rotaciones involuntarias hacia APIs de pago (OpenAI, Claude, Grok,
 * modelos comerciales de OpenRouter), calculando la estimación de costos en tiempo real
 * y exigiendo autorización explícita antes de incurrir en consumos monetarios.
 */

import { MODEL_REGISTRY, calculateCost } from '../config/pricing.js';

// Proveedores que cobran por token (prepagados/postpago sin capa gratuita total de generación)
const STRICT_PAID_PROVIDERS = new Set(['openai', 'claude', 'grok']);

/**
 * Determina si un proveedor o modelo específico es de pago.
 * @param {string} provider Nombre o alias del proveedor
 * @param {string} model Identificador del modelo
 * @returns {boolean} true si el modelo o proveedor requiere saldo/pago
 */
export function isPaidProviderOrModel(provider, model = '') {
  if (!provider) return false;
  const p = String(provider).toLowerCase();
  const m = String(model || '').toLowerCase();

  // 1. Proveedores estrictamente de pago
  if (STRICT_PAID_PROVIDERS.has(p)) {
    return true;
  }

  // 2. OpenRouter: si termina en :free o su tier es free/freemium, es capa gratuita
  if (p === 'openrouter') {
    if (m.endsWith(':free')) return false;
    const entry = MODEL_REGISTRY[model];
    if (entry && (entry.tier === 'free' || entry.tier === 'freemium')) return false;
    return true;
  }

  // 3. Consulta en el registro de precios
  const entry = MODEL_REGISTRY[model];
  if (entry) {
    if (entry.tier === 'free' || entry.tier === 'freemium') return false;
    return entry.tier === 'paid' || (entry.input > 0 || entry.output > 0);
  }

  return false;
}

/**
 * Estima el costo en USD de una invocación de inferencia.
 * @param {string} provider Proveedor de IA
 * @param {string} model Modelo a invocar
 * @param {number} promptTokens Cantidad estimada de tokens de entrada
 * @param {number} completionTokens Cantidad estimada de tokens de salida
 * @returns {number} Costo estimado en dólares americanos (USD)
 */
export function estimateCallCostUSD(provider, model = '', promptTokens = 1500, completionTokens = 2000) {
  if (!isPaidProviderOrModel(provider, model)) {
    return 0;
  }

  const cost = calculateCost(model, promptTokens, completionTokens);
  if (cost > 0) return cost;

  // Si no está registrado en pricing pero es de pago, usar tarifa de referencia conservadora ($2.50 / $10.00 por 1M)
  const fallbackCost = (promptTokens / 1_000_000 * 2.5) + (completionTokens / 1_000_000 * 10.0);
  return fallbackCost;
}

/**
 * Evalúa si se debe permitir el fallback automático hacia un proveedor/modelo.
 * Si el proveedor es de pago, requiere que config.allowPaidTier sea explícitamente true.
 * @param {string} provider Proveedor objetivo
 * @param {string} model Modelo objetivo
 * @param {Object} config Configuración de IA o del plan
 * @returns {boolean} true si está autorizado para invocación
 */
export function shouldAllowPaidFallback(provider, model = '', config = {}) {
  const isPaid = isPaidProviderOrModel(provider, model);
  if (!isPaid) {
    return true;
  }

  // Si es de pago, solo se autoriza si allowPaidTier o allowPaidAi es verdadero
  const authorized = Boolean(config.allowPaidTier || config.allowPaidAi || config?.ai?.allowPaidAi);
  return authorized;
}

/**
 * Emite una alerta de advertencia y solicita autorización para conmutación a API de pago.
 * @param {Object} params Parámetros de la conmutación
 */
export function notifyPaidFallbackAttempt({ provider, model, estimatedCostUSD, onLog }) {
  const costFormatted = `$${estimatedCostUSD.toFixed(4)} USD`;
  const message = `⚠️ [Gobernanza de Costos] Rotación pausada: El proveedor ${provider} (${model}) requiere saldo de pago (Costo estimado: ${costFormatted}). Requiere autorización previa del usuario.`;

  if (typeof onLog === 'function') {
    onLog('warning', message, provider);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('openplan_paid_model_warning', {
      detail: {
        provider,
        model,
        estimatedCostUSD,
        message,
        timestamp: new Date().toISOString()
      }
    }));
  }
}
