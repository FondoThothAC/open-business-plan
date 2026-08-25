// [MDD] Registro Dinámico de Modelos de IA — Open Business Plan
// Evoluciona de un mapa simple de precios a un registro completo con metadata rica.
// El backend actualiza estados y flags HOT cada 24h vía cron /api/models/registry.

import { getApiBase } from './apiConfig.js';

// ─────────────────────────────────────────────────────────────────────────
// REGISTRO MAESTRO DE MODELOS (precios USD por 1M tokens + metadata)
// ─────────────────────────────────────────────────────────────────────────
export const MODEL_REGISTRY = {
  // ─── OLLAMA CLOUD (GRATUITOS vía Ollama Cloud Key) ───
  'minimax-m3:cloud': {
    input: 0, output: 0,
    name: 'MiniMax M3 (Cloud)', provider: 'ollama_cloud', tier: 'free',
    contextWindow: 1048576, capabilities: ['chat', 'tools', 'multimodal', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'kimi-k2.6:cloud': {
    input: 0, output: 0,
    name: 'Kimi K2.6 (Cloud)', provider: 'ollama_cloud', tier: 'free',
    contextWindow: 131072, capabilities: ['chat', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'qwen3.5:cloud': {
    input: 0, output: 0,
    name: 'Qwen 3.5 (Cloud)', provider: 'ollama_cloud', tier: 'free',
    contextWindow: 131072, capabilities: ['chat', 'tools', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'nemotron-3-super:cloud': {
    input: 0, output: 0,
    name: 'Nemotron 3 Super (Cloud)', provider: 'ollama_cloud', tier: 'free',
    contextWindow: 131072, capabilities: ['chat', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'gemma4:31b-cloud': {
    input: 0, output: 0,
    name: 'Gemma4 31B (Cloud)', provider: 'ollama_cloud', tier: 'free',
    contextWindow: 131072, capabilities: ['chat', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'glm-5.1:cloud': {
    input: 0, output: 0,
    name: 'GLM 5.1 (Cloud)', provider: 'ollama_cloud', tier: 'free',
    contextWindow: 131072, capabilities: ['chat', 'json_mode'],
    isHot: false, lastVerified: null
  },

  // ─── OPENROUTER (GRATUITOS vía OpenRouter Key) ───
  'nvidia/nemotron-3.5-lightning:free': {
    input: 0, output: 0,
    name: 'Nemotron 3.5 Lightning', provider: 'openrouter', tier: 'free',
    contextWindow: 1048576, capabilities: ['chat', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'openai/gpt-oss-20b:free': {
    input: 0, output: 0,
    name: 'GPT-OSS 20B', provider: 'openrouter', tier: 'free',
    contextWindow: 131072, capabilities: ['chat', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'nvidia/nemotron-3-nano-30b-a3b:free': {
    input: 0, output: 0,
    name: 'Nemotron Nano 30B', provider: 'openrouter', tier: 'free',
    contextWindow: 262144, capabilities: ['chat', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'z-ai/glm-5.2:free': {
    input: 0, output: 0,
    name: 'GLM 5.2', provider: 'openrouter', tier: 'free',
    contextWindow: 262144, capabilities: ['chat', 'json_mode'],
    isHot: false, lastVerified: null
  },

  // ─── TOKENROUTER (GRATUITOS con rotación multi-modelo) ───
  'deepseek/deepseek-r1:free': {
    input: 0, output: 0,
    name: 'DeepSeek R1', provider: 'tokenrouter', tier: 'free',
    contextWindow: 131072, capabilities: ['chat', 'json_mode'],
    isHot: false, lastVerified: null
  },

  // ─── GROQ (FREEMIUM — capa gratuita con límites diarios) ───
  'llama-3.3-70b-versatile': {
    input: 0.59, output: 0.79,
    name: 'Llama 3.3 70B', provider: 'groq', tier: 'freemium',
    contextWindow: 131072, capabilities: ['chat', 'tools', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'qwen/qwen3.6-27b': {
    input: 0, output: 0,
    name: 'Qwen 3.6 27B', provider: 'groq', tier: 'freemium',
    contextWindow: 131072, capabilities: ['chat', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'openai/gpt-oss-120b': {
    input: 0, output: 0,
    name: 'GPT-OSS 120B', provider: 'groq', tier: 'freemium',
    contextWindow: 131072, capabilities: ['chat', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'groq/compound-mini': {
    input: 0, output: 0,
    name: 'Compound Mini', provider: 'groq', tier: 'freemium',
    contextWindow: 32768, capabilities: ['chat'],
    isHot: false, lastVerified: null
  },

  // ─── GOOGLE GEMINI (FREEMIUM — 1M TPM en capa gratuita) ───
  'gemini-1.5-flash': {
    input: 0.075, output: 0.30,
    name: 'Gemini 1.5 Flash', provider: 'gemini', tier: 'freemium',
    contextWindow: 1048576, capabilities: ['chat', 'tools', 'multimodal', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'gemini-1.5-pro': {
    input: 1.25, output: 5.00,
    name: 'Gemini 1.5 Pro', provider: 'gemini', tier: 'paid',
    contextWindow: 2097152, capabilities: ['chat', 'tools', 'multimodal', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'gemini-3.6-flash': {
    input: 0.10, output: 0.40,
    name: 'Gemini 3.6 Flash', provider: 'gemini', tier: 'freemium',
    contextWindow: 1048576, capabilities: ['chat', 'tools', 'multimodal', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'gemini-3.5-flash-lite': {
    input: 0.05, output: 0.20,
    name: 'Gemini 3.5 Flash Lite', provider: 'gemini', tier: 'freemium',
    contextWindow: 1048576, capabilities: ['chat', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'gemini-3.7-flash': {
    input: 0.15, output: 0.60,
    name: 'Gemini 3.7 Flash', provider: 'gemini', tier: 'freemium',
    contextWindow: 1048576, capabilities: ['chat', 'tools', 'multimodal', 'json_mode'],
    isHot: false, lastVerified: null
  },

  // ─── OPENAI (PAGADOS — Facturación por token) ───
  'gpt-4o': {
    input: 2.50, output: 10.00,
    name: 'GPT-4o', provider: 'openai', tier: 'paid',
    contextWindow: 131072, capabilities: ['chat', 'tools', 'multimodal', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'gpt-4o-mini': {
    input: 0.15, output: 0.60,
    name: 'GPT-4o Mini', provider: 'openai', tier: 'paid',
    contextWindow: 131072, capabilities: ['chat', 'tools', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'gpt-4.5': {
    input: 5.00, output: 15.00,
    name: 'GPT-4.5', provider: 'openai', tier: 'paid',
    contextWindow: 131072, capabilities: ['chat', 'tools', 'multimodal', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'gpt-5': {
    input: 10.00, output: 30.00,
    name: 'GPT-5', provider: 'openai', tier: 'paid',
    contextWindow: 131072, capabilities: ['chat', 'tools', 'multimodal', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'gpt-5.6-luna': {
    input: 1.00, output: 3.00,
    name: 'GPT-5.6 Luna', provider: 'openai', tier: 'paid',
    contextWindow: 131072, capabilities: ['chat', 'tools', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'gpt-5.6-terra': {
    input: 5.00, output: 15.00,
    name: 'GPT-5.6 Terra', provider: 'openai', tier: 'paid',
    contextWindow: 262144, capabilities: ['chat', 'tools', 'multimodal', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'gpt-5.6-sol': {
    input: 15.00, output: 45.00,
    name: 'GPT-5.6 Sol', provider: 'openai', tier: 'paid',
    contextWindow: 524288, capabilities: ['chat', 'tools', 'multimodal', 'json_mode'],
    isHot: false, lastVerified: null
  },

  // ─── ANTHROPIC (PAGADOS — Facturación por token) ───
  'claude-3.5-sonnet': {
    input: 3.00, output: 15.00,
    name: 'Claude 3.5 Sonnet', provider: 'claude', tier: 'paid',
    contextWindow: 204800, capabilities: ['chat', 'tools', 'multimodal', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'claude-5-sonnet': {
    input: 4.00, output: 18.00,
    name: 'Claude 5 Sonnet', provider: 'claude', tier: 'paid',
    contextWindow: 204800, capabilities: ['chat', 'tools', 'multimodal', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'claude-5-opus': {
    input: 15.00, output: 75.00,
    name: 'Claude 5 Opus', provider: 'claude', tier: 'paid',
    contextWindow: 204800, capabilities: ['chat', 'tools', 'multimodal', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'claude-fable-5': {
    input: 12.00, output: 60.00,
    name: 'Claude Fable 5', provider: 'claude', tier: 'paid',
    contextWindow: 204800, capabilities: ['chat', 'tools', 'multimodal', 'json_mode'],
    isHot: false, lastVerified: null
  },

  // ─── MISTRAL (FREEMIUM) ───
  'mistral-large-latest': {
    input: 2.00, output: 6.00,
    name: 'Mistral Large', provider: 'mistral', tier: 'freemium',
    contextWindow: 131072, capabilities: ['chat', 'tools', 'json_mode'],
    isHot: false, lastVerified: null
  },

  // ─── NVIDIA NIM (FREEMIUM) ───
  'nvidia/llama-3.1-nemotron-70b-instruct': {
    input: 0, output: 0,
    name: 'Nemotron 70B', provider: 'nvidia', tier: 'freemium',
    contextWindow: 131072, capabilities: ['chat', 'json_mode'],
    isHot: false, lastVerified: null
  },
  'google/gemma-2-27b-it': {
    input: 0, output: 0,
    name: 'Gemma 2 27B', provider: 'nvidia', tier: 'freemium',
    contextWindow: 131072, capabilities: ['chat'],
    isHot: false, lastVerified: null
  },

  // ─── MINIMAX DIRECTO (con API Key propia) ───
  'abab6.5-chat': {
    input: 0.50, output: 1.50,
    name: 'MiniMax abab 6.5', provider: 'minimax', tier: 'freemium',
    contextWindow: 131072, capabilities: ['chat', 'tools'],
    isHot: false, lastVerified: null
  },
};

// ─────────────────────────────────────────────────────────────────────────
// COMPATIBILIDAD — Export legacy API_COSTS para código existente que lo usa
// ─────────────────────────────────────────────────────────────────────────
export const API_COSTS = Object.fromEntries(
  Object.entries(MODEL_REGISTRY).map(([key, model]) => [
    key,
    { input: model.input, output: model.output, name: model.name }
  ])
);

// ─────────────────────────────────────────────────────────────────────────
// CACHE DEL REGISTRO DINÁMICO (actualizado por el backend cada 24h)
// ─────────────────────────────────────────────────────────────────────────
let _cachedDynamicRegistry = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de cache en frontend

/**
 * Consulta el registro dinámico de modelos desde el backend.
 * El backend ejecuta un cron cada 24h que pinga proveedores, actualiza estados,
 * flags HOT, y precios verificados.
 * @returns {Promise<Object>} Registro de modelos con estados actualizados
 */
export async function fetchModelRegistry() {
  const now = Date.now();
  if (_cachedDynamicRegistry && (now - _cacheTimestamp) < CACHE_TTL_MS) {
    return _cachedDynamicRegistry;
  }

  try {
    const base = getApiBase();
    const res = await fetch(`${base}/api/models/registry`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    // Fusionar datos dinámicos del backend con el registro local
    if (data && data.models) {
      const merged = { ...MODEL_REGISTRY };
      for (const [modelId, dynamicData] of Object.entries(data.models)) {
        if (merged[modelId]) {
          merged[modelId] = { ...merged[modelId], ...dynamicData };
        } else {
          // Modelo nuevo descubierto por el backend que no está en el registro local
          merged[modelId] = dynamicData;
        }
      }
      _cachedDynamicRegistry = merged;
      _cacheTimestamp = now;
      return merged;
    }
  } catch (err) {
    console.warn('[ModelRegistry] Error consultando registro dinámico, usando fallback local:', err.message);
  }

  // Fallback: devolver el registro local estático
  return MODEL_REGISTRY;
}

/**
 * Verifica si un modelo tiene flag HOT activo (disponible gratis desde routers).
 * @param {string} modelId Identificador del modelo
 * @returns {boolean} true si el modelo está marcado como HOT
 */
export function isModelHot(modelId) {
  if (_cachedDynamicRegistry && _cachedDynamicRegistry[modelId]) {
    return !!_cachedDynamicRegistry[modelId].isHot;
  }
  return false;
}

/**
 * Obtiene los modelos disponibles de un proveedor específico.
 * @param {string} providerKey Clave del proveedor (ej. 'gemini', 'openai', 'ollama_cloud')
 * @returns {Array<{id: string, name: string, tier: string, isHot: boolean}>}
 */
export function getModelsByProvider(providerKey) {
  const registry = _cachedDynamicRegistry || MODEL_REGISTRY;
  return Object.entries(registry)
    .filter(([, model]) => model.provider === providerKey)
    .map(([id, model]) => ({
      id,
      name: model.name,
      tier: model.tier,
      isHot: model.isHot || false,
      contextWindow: model.contextWindow,
      capabilities: model.capabilities || [],
    }));
}

/**
 * Obtiene la lista de proveedores únicos activos con sus modelos.
 * @returns {Array<{provider: string, models: Array, hasFreeTier: boolean, hasFreeModels: boolean}>}
 */
export function getActiveProviders() {
  const registry = _cachedDynamicRegistry || MODEL_REGISTRY;
  const providerMap = {};

  for (const [modelId, model] of Object.entries(registry)) {
    if (!providerMap[model.provider]) {
      providerMap[model.provider] = {
        provider: model.provider,
        models: [],
        hasFreeTier: false,
        hasHotModels: false,
      };
    }
    providerMap[model.provider].models.push({ id: modelId, ...model });
    if (model.tier === 'free' || model.tier === 'freemium') providerMap[model.provider].hasFreeTier = true;
    if (model.isHot) providerMap[model.provider].hasHotModels = true;
  }

  return Object.values(providerMap);
}

/**
 * Calcula el costo estimado en base al uso de tokens
 * @param {string} model El modelo utilizado
 * @param {number} promptTokens Cantidad de tokens de entrada
 * @param {number} completionTokens Cantidad de tokens de salida
 * @returns {number} Costo en USD
 */
export function calculateCost(model, promptTokens, completionTokens) {
  if (!model) return 0;
  
  const registry = _cachedDynamicRegistry || MODEL_REGISTRY;
  
  // Buscar coincidencia exacta primero
  let pricingData = registry[model];
  
  // Si no hay exacta, buscar coincidencia parcial
  if (!pricingData) {
    const partialKey = Object.keys(registry).find(k => model.includes(k)) || 
                       Object.keys(registry).find(k => k.includes(model));
    pricingData = partialKey ? registry[partialKey] : null;
  }
                     
  if (!pricingData) return 0;

  const inputCost = (promptTokens / 1_000_000) * pricingData.input;
  const outputCost = (completionTokens / 1_000_000) * pricingData.output;

  return inputCost + outputCost;
}
