/**
 * AI Service — OpenPlan v2.0 "Mesa de Expertos" Multi-Agent Orchestrator
 *
 * [MDD] Arquitectura de agentes definida como modelo canónico.
 * [EDD] Cada fase emite eventos de progreso al ActivityFeed vía termLog.
 * [DDD] Dominio: Agente, Fase, Rol, Profundidad, Swap de Modelo.
 * [HDD] Hipótesis: mayor profundidad → mayor coherencia, a costo de tiempo.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  NIVELES DE PROFUNDIDAD (Mesa de Expertos)
 * ─────────────────────────────────────────────────────────────────────────
 *  Nivel 1 — Rápido   : 2 agentes (Analista → Redactor).           ~30-60s
 *  Nivel 2 — Pro      : 3 agentes (Analista → Crítico → Redactor). ~2-4 min  ← DEFAULT
 *  Nivel 3 — Profundo : 5 agentes + Devil's Advocate.              ~8-15 min
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  SWAP DE MODELOS (cuando no caben todos en VRAM)
 * ─────────────────────────────────────────────────────────────────────────
 *  Ollama descarga automáticamente el modelo anterior de VRAM antes de
 *  cargar el siguiente. El CONTEXTO (texto) vive en RAM, no en VRAM,
 *  por lo que el swap conserva coherencia entre fases.
 *
 *  Mac (Apple Silicon): Metal unifica VRAM y RAM — no hay swap, todos
 *  los modelos corren simultáneamente si caben en memoria unificada.
 *
 *  Windows/Linux (GPU dedicada): El swap toma ~2-4s entre fases.
 *  RTX A2000 12GB puede cargar gemma4:e2b-mlx (8GB) y dejar 4GB para KV-cache.
 */

import { FIELD_GUIDES_MAP } from './field_guides.js';
import { getApiBase } from '../config/apiConfig.js';
import { calculateCost } from '../config/pricing.js';

// Variable a nivel de módulo para capturar el feed de progreso activo
let activeTermLog = null;

// Caché de estado Ollama — evita timeouts repetidos en cada agente del chain
// Se resetea automáticamente tras 30 segundos para detectar reconexiones
let _ollamaOfflineCache = false;
let _ollamaOfflineCacheTs = 0;
const OLLAMA_OFFLINE_CACHE_TTL_MS = 30_000;

function _isOllamaOfflineCached() {
  if (!_ollamaOfflineCache) return false;
  if (Date.now() - _ollamaOfflineCacheTs > OLLAMA_OFFLINE_CACHE_TTL_MS) {
    _ollamaOfflineCache = false; // TTL expirado, permitir reintento
    return false;
  }
  return true;
}
function _markOllamaOffline() {
  _ollamaOfflineCache = true;
  _ollamaOfflineCacheTs = Date.now();
}

// ─────────────────────────────────────────────────────────────────────────
// Configuración de roles por defecto (se sobreescribe desde Configuracion.jsx)
// ─────────────────────────────────────────────────────────────────────────
// Modelos locales de referencia:
// - qwen3.5:2b-mlx (Soportado y operativo)
// - nemotron-3-nano:4b (Nativo GGUF, 100% estable)
// - gemma4:e2b-mlx (No soportado actualmente por el MLX runner debido a arquitectura)

export const DEFAULT_AGENT_CONFIG = {
  // Nivel 1 — Rápido (sin swap, 1 solo modelo)
  fast: {
    analista:  { model: 'qwen3.5:9b', role: 'Analista Estratégico' },
    redactor:  { model: 'qwen3.5:9b', role: 'Redactor Ejecutivo' },
  },
  // Nivel 2 — Pro (swap opcional entre analista y redactor)
  pro: {
    analista:  { model: 'qwen3.5:9b', role: 'Analista Estratégico' },
    critico:   { model: 'qwen3.5:9b', role: 'Crítico Financiero' },
    redactor:  { model: 'qwen3.5:9b', role: 'Redactor Senior' },
  },
  // Nivel 3 — Profundo (swap entre 3 modelos especializados)
  deep: {
    estratega:  { model: 'qwen3.5:9b', role: 'Estratega de Negocio' },
    analista:   { model: 'qwen3.5:9b', role: 'Analista de Datos' },
    abogadoDiablo: { model: 'qwen3.5:9b', role: "Devil's Advocate" },
    critico:    { model: 'qwen3.5:9b', role: 'Crítico Financiero' },
    redactor:   { model: 'qwen3.5:9b', role: 'Redactor Ejecutivo Final' },
  },
  // Nivel 4 — Industrial : 9 agentes. ~20-30 min
  industrial: {
    estratega:      { model: 'qwen3.5:9b', role: 'Estratega Maestro' },
    mercado:        { model: 'qwen3.5:9b', role: 'Especialista en Mercado' },
    operaciones:    { model: 'qwen3.5:9b', role: 'Analista de Operaciones' },
    financiero:     { model: 'qwen3.5:9b', role: 'Especialista Financiero' },
    abogadoDiablo:  { model: 'qwen3.5:9b', role: "Devil's Advocate" },
    coherencia:     { model: 'qwen3.5:9b', role: 'Revisor de Coherencia Global' },
    hallucination:  { model: 'qwen3.5:9b', role: 'Verificador de Hechos/Alucinaciones' },
    redactor:       { model: 'qwen3.5:9b', role: 'Redactor Ejecutivo Final' },
    editor:         { model: 'qwen3.5:9b', role: 'Editor de Estilo Académico' },
  },
};// Helper: get list of installed Ollama models
async function getInstalledOllamaModels(endpoint) {
  try {
    const res = await fetch(`${endpoint || 'http://localhost:11434'}/api/tags`, {
      signal: AbortSignal.timeout(600)
    });
    if (res.ok) {
      const data = await res.json();
      return data && data.models ? data.models.map(m => m.name) : [];
    }
  } catch (e) {
    // Si no hay respuesta o timeout, continuar silenciosamente
  }
  return [];
}

// Helper: map a requested model name to the best installed matching model
function findBestOllamaModel(requestedModel, installedModels) {
  if (!requestedModel) return 'qwen3.5:9b';

  // Si el modelo es explícitamente de la nube, no forzar fallback local
  if (requestedModel.includes('gemini') || 
      requestedModel.includes('gpt') || 
      requestedModel.includes('mistral') || 
      requestedModel.includes('llama-3.3-70b') || 
      requestedModel.includes('nvidia') || 
      requestedModel.endsWith(':cloud')) {
    return requestedModel;
  }

  if (!installedModels || installedModels.length === 0) {
    return 'qwen3.5:9b';
  }
  
  if (installedModels.includes(requestedModel)) {
    return requestedModel;
  }
  
  if (requestedModel === 'nemotron') {
    const match = installedModels.find(m => m.toLowerCase().includes('nemotron'));
    if (match) return match;
  }
  
  const partialMatch = installedModels.find(m => m.toLowerCase() === requestedModel.toLowerCase());
  if (partialMatch) return partialMatch;
  
  const prefixMatch = installedModels.find(m => m.toLowerCase().startsWith(requestedModel.toLowerCase()));
  if (prefixMatch) return prefixMatch;
  
  const includesMatch = installedModels.find(m => m.toLowerCase().includes(requestedModel.toLowerCase()) || requestedModel.toLowerCase().includes(m.toLowerCase()));
  if (includesMatch) return includesMatch;
  
  // Fallback inteligente: si no hay match, elegir el mejor modelo instalado
  // (qwen3.5:9b > gemma4:pro > qwen3-coder > el primero disponible)
  const preferred = ['qwen3.5:9b', 'gemma4:pro', 'gemma4:12b', 'qwen3-coder:latest'];
  for (const p of preferred) {
    if (installedModels.includes(p)) return p;
  }
  return installedModels[0];
}

export const CLOUD_DEFAULT_MODELS = {
  minimax:    'minimax-m3:cloud',
  groq:       'llama-3.3-70b-versatile',
  gemini:     'gemini-3.6-flash',
  nvidia:     'meta/llama-3.1-70b-instruct',
  mistral:    'mistral-large-latest',
  openrouter: 'nvidia/nemotron-3.5-lightning:free',
  orcarouter: 'orcarouter/auto',
  opencode:   'openai/gpt-4.1',
  openai:     'gpt-4o',
};

// Resuelve un par (proveedor, modelo) coherente: nunca envía un modelo local a la nube
function resolveProviderModel({ primaryProvider, model, installedModels = [] }) {
  let prov = primaryProvider || 'groq';
  const resolved = String(model || '').trim();

  // Si el usuario configuró Ollama o LM Studio explícitamente como proveedor primario,
  // respetar su elección (los modelos con sufijo :cloud se consultan a través de Ollama Cloud)
  if (primaryProvider === 'ollama' || primaryProvider === 'lmstudio') {
    return { provider: primaryProvider, model: resolved || 'minimax-m3:cloud' };
  }

  // Detectar proveedor por el nombre del modelo si es explícitamente cloud
  if (resolved.endsWith(':cloud')) prov = 'ollama';
  else if (resolved.includes('minimax') && !resolved.includes(':cloud')) prov = 'minimax';
  else if (resolved.includes('gemini')) prov = 'gemini';
  else if (resolved.includes(':free') || resolved.includes('openrouter')) prov = 'openrouter';
  else if (resolved.includes('orcarouter') || resolved.includes('orca')) prov = 'orcarouter';
  else if (resolved.includes('gpt-oss') || resolved.includes('compound') || resolved.includes('groq') || resolved.includes('qwen/')) prov = 'groq';
  else if (resolved.includes('gpt')) prov = 'openai';
  else if (resolved.includes('mistral-large')) prov = 'mistral';
  else if (resolved.includes('nvidia') || resolved.includes('google/gemma')) prov = 'nvidia';
  else if (resolved.includes('llama-3.3-70b') || resolved.includes('llama-3.1-8b')) prov = 'groq';

  // Proveedores locales: resolver contra los modelos instalados de Ollama
  if (prov === 'ollama' || prov === 'lmstudio') {
    const localModel = findBestOllamaModel(resolved || 'minimax-m3:cloud', installedModels);
    return { provider: prov, model: localModel };
  }

  // Proveedores de nube: si el modelo configurado no es cloud, usar el default del proveedor
  const isCloudModel = /gemini|gpt|mistral|nvidia|llama-3\.3|llama-3\.1|compound|qwen|oss|:free|:cloud/i.test(resolved);
  const finalModel = (isCloudModel && resolved) ? resolved : (CLOUD_DEFAULT_MODELS[prov] || resolved || 'llama-3.3-70b-versatile');
  return { provider: prov, model: finalModel };
}

// Extractor y sanitizador de pool de API keys (soporta múltiples llaves separadas por comas o saltos de línea)
export function parseApiKeys(rawKey) {
  if (!rawKey) return [];
  if (Array.isArray(rawKey)) return rawKey.map(k => String(k).trim()).filter(Boolean);
  return String(rawKey)
    .split(/[\n,;]+/)
    .map(k => k.trim())
    .filter(k => k.length > 0);
}

// Contador global para balanceo Round-Robin de API Keys
const keyRotationCounters = {};

// Obtiene la siguiente API key disponible en rotación circular
export function getRotatedApiKey(rawKey, providerName = 'default') {
  const keys = parseApiKeys(rawKey);
  if (keys.length === 0) return '';
  if (keys.length === 1) return keys[0];
  
  if (keyRotationCounters[providerName] === undefined) {
    keyRotationCounters[providerName] = 0;
  }
  const idx = keyRotationCounters[providerName] % keys.length;
  keyRotationCounters[providerName]++;
  return keys[idx];
}

// Retry automático por límite de tokens (HTTP 429 / rate-limit) con Fast Failover
// Espera el tiempo indicado por Retry-After o backoff exponencial controlado.
export async function fetchWithRetry(url, options = {}, { maxRetries = 2, baseDelay = 1500, fastFailOn429 = false } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        if (fastFailOn429 || attempt >= maxRetries) {
          const err = new Error('HTTP_429_RATE_LIMIT');
          err.status = 429;
          err.response = response;
          throw err;
        }

        const retryAfter = response.headers?.get('retry-after');
        const waitMs = retryAfter ? Math.min(parseInt(retryAfter, 10) * 1000, 4000) : Math.min(baseDelay * Math.pow(1.5, attempt), 4000);
        const provider = url.includes('groq.com') ? 'Groq'
          : url.includes('googleapis') ? 'Gemini'
          : url.includes('nvidia') ? 'NVIDIA'
          : url.includes('openai.com') ? 'OpenAI'
          : url.includes('mistral') ? 'Mistral' : 'Cloud';

        console.warn(`[fetchWithRetry] 429 ${provider}: reintentando en ${waitMs}ms (intento ${attempt + 1}/${maxRetries + 1})...`);
        if (activeTermLog) {
          activeTermLog('thinking', `⏳ Límite temporal de ${provider}: reintento rápido en ${Math.round(waitMs / 1000)}s... (${attempt + 1}/${maxRetries + 1})`, provider.toLowerCase());
        }
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      return response;
    } catch (err) {
      lastError = err;
      if (err.status === 429 || err.message === 'HTTP_429_RATE_LIMIT') {
        throw err;
      }
      if (attempt < maxRetries) {
        const waitMs = Math.min(baseDelay * Math.pow(2, attempt), 6000);
        console.warn(`[fetchWithRetry] Error de red: reintentando en ${waitMs}ms (intento ${attempt + 1}/${maxRetries + 1})...`);
        await new Promise(r => setTimeout(r, waitMs));
      }
    }
  }
  throw lastError || new Error('fetchWithRetry agotó todos los reintentos');
}

// ─────────────────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL: generateModuleContent
// [FDD] Feature F01 + F11: Mesa de Expertos con niveles de profundidad
// ─────────────────────────────────────────────────────────────────────────
// Helper: clean plan data to avoid bloating AI context with large calculated matrices or base64 files
function cleanPlanDataForAi(allPlanData, isLocalProvider = false) {
  if (!allPlanData) return '';
  try {
    const cleanData = JSON.parse(JSON.stringify(allPlanData));
    
    const cleanRecursively = (obj) => {
      if (typeof obj !== 'object' || obj === null) return;
      for (const key in obj) {
        if (key === 'corrida_automatica' || key === 'heatmap_data' || key.endsWith('_json')) {
          delete obj[key];
        } else if (typeof obj[key] === 'string' && obj[key].startsWith('data:image/')) {
          obj[key] = '[IMAGEN BASE64 TRUNCADA PARA EVITAR SOBRECARGA DE CONTEXTO]';
        } else if (typeof obj[key] === 'object') {
          cleanRecursively(obj[key]);
        }
      }
    };
    cleanRecursively(cleanData);
    
    // Delete documents list since it's already provided separately in documentsContext
    if (cleanData.config) {
      delete cleanData.config.documents;
      
      // Clean anexos metadata to strip base64 contents
      if (cleanData.config.anexos && Array.isArray(cleanData.config.anexos)) {
        cleanData.config.anexos = cleanData.config.anexos.map(anexo => ({
          id: anexo.id,
          name: anexo.name,
          type: anexo.type,
          size: anexo.size
        }));
      }
    }

    if (isLocalProvider) {
      const truncateStrings = (obj) => {
        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            if (obj[key].length > 500) {
              obj[key] = obj[key].substring(0, 500) + '... [TRUNCADO POR LÍMITE DE CONTEXTO LOCAL]';
            }
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            if (key !== 'semilla' && key !== 'config') {
              truncateStrings(obj[key]);
            }
          }
        }
      };
      
      for (const key in cleanData) {
        if (key !== 'semilla' && key !== 'config') {
          truncateStrings(cleanData[key]);
        }
      }
    }
    
    return JSON.stringify(cleanData, null, 2);
  } catch (e) {
    console.warn('Error sanitizing plan data for AI:', e);
    return JSON.stringify(allPlanData, null, 2);
  }
}


// ─────────────────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL: generateModuleContent
// [FDD] Feature F01 + F11: Mesa de Expertos con niveles de profundidad
// ─────────────────────────────────────────────────────────────────────────
export async function generateModuleContent(config, currentModule, allPlanData) {
  const {
    primaryProvider, _secondaryProvider,
    apiKey, groqKey, nvidiaKey, orcaRouterKey, lmStudioEndpoint, endpoint, openrouterKey, minimaxKey, mistralKey,
    ollamaKey, bobOllamaKey,
    model, depth = 1,
    agentModels = {},
  } = config;

  const t0 = Date.now();
  const _trace = { tokens: 0, promptTokens: 0, completionTokens: 0, cost: 0, logs: [] };
  if (typeof window !== 'undefined') {
    window.__activeModuleTrace = _trace;
  }

  // [EDD] Logger de eventos al ActivityFeed (silent fail si backend caído)
  // Soporta eventos enriquecidos: {type, message, provider, module, progress, phase, agent, tokens, visual}
  // Compatibilidad: termLog('type','msg','provider') y termLog({type,message,provider,...})
  const termLog = async (...args) => {
    try {
      const rawName = allPlanData.semilla?.negocio?.nombre_marca || allPlanData.config?.brandKit?.companyName || '';
      const projectId = allPlanData.config?.projectId || (rawName ? rawName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : '');
      const projectType = allPlanData.config?.projectType === 'social_bid' ? 'social' : 'negocios';
      const apiBase = getApiBase();

      let payload;
      if (typeof args[0] === 'string') {
        payload = { type: args[0], message: args[1] || '', provider: args[2] || '', module: currentModule.title, elapsed: Date.now() - t0, projectId, projectType };
      } else {
        const event = args[0] || {};
        payload = { ...event, module: event.module || currentModule.title, elapsed: Date.now() - t0, projectId, projectType };
      }

      await fetch(`${apiBase}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {}
  };

  // Registrar el logger actual en el módulo para que callAiProvider pueda emitir pensamientos (thinking)
  activeTermLog = termLog;

  // Contexto global del plan (toda la información disponible)
  const seed = allPlanData.semilla || {};
  const seedName = seed.nombre_proyecto || seed.negocio?.nombre_marca || seed.negocio?.giro || seed.negocio?.nombre || seed.solucion || '';
  const seedLoc = seed.cobertura || seed.negocio?.ubicacion || seed.negocio?.cobertura || '';
  const seedProb = seed.problema || seed.negocio?.descripcion || '';
  const seedSol = seed.solucion || seed.negocio?.que_es || '';
  const seedMarket = seed.mercado_objetivo || seed.clientes?.quienes || '';
  const seedRev = seed.modelo_ingresos || seed.finanzas?.como_gana_dinero || '';
  const seedAdv = seed.ventaja_injusta || seed.negocio?.diferencial || '';

  const locationConstraint = seedLoc ? `\nREGLA ESTRICTA DE UBICACIÓN: El negocio opera o tiene cobertura en "${seedLoc}". NO inventes ciudades ni asumas capitales (ej. no pongas Hermosillo si se te indicó Cananea u otra ciudad). Respeta estrictamente esta ubicación.` : '';

  const semillaContext = Object.keys(seed).length > 0
    ? `\nCONTEXTO NARRATIVO Y SEMILLA DEL PROYECTO:
- Nombre del Proyecto: ${seedName || 'No especificado'}
- Ubicación / Cobertura: ${seedLoc || 'No especificada'}
- Problema / Necesidad: ${seedProb || 'No especificado'}
- Solución / Propuesta de Valor: ${seedSol || 'No especificada'}
- Mercado Objetivo: ${seedMarket || 'No especificado'}
- Modelo de Ingresos: ${seedRev || 'No especificado'}
- Ventaja Competitiva: ${seedAdv || 'No especificada'}
${locationConstraint}
Datos Crudos de la Semilla:
${JSON.stringify(seed, null, 2)}\n`
    : '';

  const documentsContext = (allPlanData.config?.documents || []).length > 0
    ? `\nDOCUMENTOS DE REFERENCIA (RAG):
${allPlanData.config.documents.map(d => d.text).join('\n---\n').substring(0, 5000)}\n`
    : '';

  const isLocalProvider = primaryProvider === 'ollama' || primaryProvider === 'lmstudio';
  const planContext = cleanPlanDataForAi(allPlanData, isLocalProvider);

  const projectType = allPlanData.config?.projectType || 'business';
  const guides = FIELD_GUIDES_MAP[projectType] || FIELD_GUIDES_MAP.business || {};

  const fieldsPromptContext = (currentModule.fields || []).map(f => {
    const guide = guides[f.key] || {};
    return `- Campo "${f.key}":
  Instrucción: ${guide.desc || 'Describir detalladamente.'}
  Ejemplo corporativo/Límite de relleno: ${guide.ejemplo || guide.placeholder || 'Redactar con enfoque analítico y sin relleno.'}`;
  }).join('\n\n');

  const isFinancialModule = currentModule.key === 'estados_financieros' || currentModule.key === 'simulador_financiero';
  const financialConstraint = isFinancialModule ? 
    '\n\nREGLA CRÍTICA FINANCIERA: NO generes tablas numéricas, hojas de cálculo ni proyecciones matemáticas estructuradas. El sistema ya calcula los números automáticamente. Tu tarea es redactar ÚNICAMENTE el ANÁLISIS CUALITATIVO, ESTRATÉGICO Y NARRATIVO de estas perspectivas (qué significa para el negocio, estrategias de liquidez, justificación de gastos, etc.).' : '';

  const verbosityLevel = allPlanData.config?.ai?.verbosity || 'normal';
  let verbosityConstraint = '';
  
  if (currentModule.key === 'canvas') {
    verbosityConstraint = '\n\nREGLA DE EXTENSIÓN PARA CANVAS: Obligatoriamente debes redactar en un formato ultra-conciso. Usa de 3 a 5 viñetas cortas (bullet points) por campo. Sin introducciones ni conclusiones largas.';
  } else if (verbosityLevel === 'conciso') {
    verbosityConstraint = '\n\nREGLA DE EXTENSIÓN: Se te ha configurado en modo "Conciso". Tus respuestas deben ser directas, usando viñetas (bullet points) cuando sea posible, oraciones cortas y yendo directo al grano. Sin relleno innecesario.';
  } else if (verbosityLevel === 'detallado') {
    verbosityConstraint = '\n\nREGLA DE EXTENSIÓN: Se te ha configurado en modo "Extenso". Elabora un análisis muy profundo, justificado, académico y con alto nivel de detalle descriptivo para cada campo.';
  }

  const systemContext = `
Eres un miembro de una "Mesa de Expertos" en estrategia empresarial de alto nivel de Open Business Plan (Fondo Thoth AC).
Tu objetivo es redactar una sección del Plan de Negocios con rigor académico, ejecutivo y directamente alineado a la propuesta de valor y ubicación del proyecto.
${semillaContext}
${documentsContext}
Estado actual COMPLETO del plan (contexto de referencia):
${planContext}
${financialConstraint}
${verbosityConstraint}

Módulo a redactar: "${currentModule.title}"
Descripción: ${currentModule.description}

Instrucciones específicas por campo que debes seguir y emular estrictamente:
${fieldsPromptContext}

  Campos a generar (debes devolver un JSON con exactamente estas claves): ${(currentModule.fields || []).map(f => f.key).join(', ')}
`;

  const expectedKeys = (currentModule.fields || []).map(f => f.key);

  // Fetch installed models to resolve name matches
  const installedModels = await getInstalledOllamaModels(endpoint);

  // Resuelve el modelo de un agente respetando el proveedor activo
  const resolveModel = (role, levelConfig) => {
    const raw = agentModels[role]?.model || levelConfig[role]?.model || model;
    
    // Si estamos en proveedor cloud o el modelo no es local, resolver directamente con resolveProviderModel
    const { model: resolvedCloudModel } = resolveProviderModel({ primaryProvider, model: raw, installedModels });
    if (primaryProvider && primaryProvider !== 'ollama' && primaryProvider !== 'lmstudio') {
      return resolvedCloudModel;
    }
    return findBestOllamaModel(raw || 'nemotron', installedModels);
  };

  // Helper: construye config de proveedor para una fase
  const makeProviderConfig = (agentModel) => {
    const resolved = resolveProviderModel({ primaryProvider, model: agentModel, installedModels });
    let prov = resolved.provider;
    let mod = resolved.model;

    const openrouterKey = allPlanData?.config?.ai?.openrouterKey || '';
    const opencodeKey   = allPlanData?.config?.ai?.opencodeKey   || '';
    const mistralKey    = allPlanData?.config?.ai?.mistralKey    || '';
    const ollamaKeyFromPlan = allPlanData?.config?.ai?.ollamaKey || ollamaKey || '';
    const bobOllamaKeyFromPlan = allPlanData?.config?.ai?.bobOllamaKey || bobOllamaKey || '';

    if (prov === 'lmstudio') {
      return {
        provider: 'lmstudio',
        endpoint: lmStudioEndpoint,
        model: mod,
        apiKey,
        groqKey,
        nvidiaKey,
        openrouterKey,
        opencodeKey,
        mistralKey,
        ollamaKey: ollamaKeyFromPlan,
        bobOllamaKey: bobOllamaKeyFromPlan
      };
    }
    return {
      provider: prov,
      apiKey,
      groqKey,
      nvidiaKey,
      openrouterKey,
      opencodeKey,
      mistralKey,
      ollamaKey: ollamaKeyFromPlan,
      bobOllamaKey: bobOllamaKeyFromPlan,
      orcaRouterKey: config.orcaRouterKey,
      endpoint,
      lmStudioEndpoint,
      model: mod
    };
  };

  // ─── Orquestadores por nivel ───────────────────────────────────────────

  // NIVEL 1: Rápido — 2 fases, 1 modelo, sin swap
  const runFast = async (fallbackProvider) => {
    const agentCfg = DEFAULT_AGENT_CONFIG.fast;
    const analista = resolveModel('analista', agentCfg);
    const redactor = resolveModel('redactor', agentCfg);
    const prov = fallbackProvider?.provider || primaryProvider || 'groq';

    await termLog({ type: 'thinking', message: `⚡ Fase 1/2: Analista generando borrador (${analista})...`, provider: prov, phase: 'fase_1_analista', agent: 'analista', visual: { icon: '🧠', color: '#8b5cf6' } });
    const draft = await callAiProvider(
      fallbackProvider || makeProviderConfig(analista),
      `${systemContext}\n\nTAREA: Genera un borrador profesional y detallado SOLO para los campos indicados. Devuelve JSON con exactamente las claves pedidas.`,
      true,
      expectedKeys
    );

    await termLog({ type: 'thinking', message: `⚡ Fase 2/2: Redactor finalizando (${redactor})...`, provider: prov, phase: 'fase_2_redactor', agent: 'redactor', visual: { icon: '✍️', color: '#6366f1' } });
    const result = await callAiProvider(
      fallbackProvider || makeProviderConfig(redactor),
      `${systemContext}\n\nBorrador:\n${JSON.stringify(draft)}\n\nTAREA: Mejora la calidad y el tono ejecutivo del borrador. Devuelve SOLO el JSON final con las claves: ${(currentModule.fields || []).map(f => f.key).join(', ')}`,
      true,
      expectedKeys
    );

    await termLog({ type: 'success', message: '✓ Módulo completado (nivel rápido).', provider: prov, phase: 'complete', visual: { icon: '✅', color: '#10b981', badge: 'RÁPIDO' } });
    return result;
  };

  // NIVEL 2: Pro — 3 fases, swap entre analista y redactor
  // [TDD] Contrato: retorna JSON con todas las claves de currentModule.fields
  const runPro = async (fallbackProvider) => {
    const agentCfg = DEFAULT_AGENT_CONFIG.pro;
    const analista = resolveModel('analista', agentCfg);
    const critico  = resolveModel('critico',  agentCfg);
    const redactor = resolveModel('redactor', agentCfg);

    await termLog({ type: 'thinking', message: `🧠 Fase 1/3: Analista redactando borrador (${analista})...`, provider: analista, phase: 'fase_1_analista', agent: 'analista', visual: { icon: '🧠', color: '#8b5cf6' } });
    const draft = await callAiProvider(
      fallbackProvider || makeProviderConfig(analista),
      `${systemContext}\n\nTAREA: Genera un borrador profesional y exhaustivo. El plan final es de 100 páginas. Devuelve JSON con SOLO las claves pedidas.`,
      true,
      expectedKeys
    );

    await termLog({ type: 'thinking', message: `🧠 Fase 2/3: Crítico revisando (${critico})...`, provider: critico, phase: 'fase_2_critico', agent: 'critico', visual: { icon: '📉', color: '#ef4444' } });
    const critique = await callAiProvider(
      fallbackProvider || makeProviderConfig(critico),
      `${systemContext}\n\nBorrador:\n${JSON.stringify(draft)}\n\nTAREA: Actúa como inversor crítico. ¿Qué falta? ¿Qué es débil o impreciso? Sé breve y directo. No devuelvas JSON.`,
      false
    );

    await termLog({ type: 'thinking', message: `🧠 Fase 3/3: Redactor sintetizando versión final (${redactor})....`, provider: redactor, phase: 'fase_3_redactor', agent: 'redactor', visual: { icon: '✍️', color: '#6366f1' } });
    const result = await callAiProvider(
      fallbackProvider || makeProviderConfig(redactor),
      `${systemContext}\n\nBorrador:\n${JSON.stringify(draft)}\n\nCrítica:\n${critique}\n\nTAREA: Integra las mejoras. Genera la versión final con tono ejecutivo. DEVUELVE SOLO JSON con claves: ${(currentModule.fields || []).map(f => f.key).join(', ')}`,
      true,
      expectedKeys
    );

    await termLog({ type: 'success', message: '✓ Módulo completado (nivel pro).', provider: redactor, phase: 'complete', visual: { icon: '✅', color: '#10b981', badge: 'PRO' } });
    return result;
  };

  // NIVEL 3: Profundo — 5 agentes, múltiples modelos con swap
  // [HDD] Hipótesis: 5 perspectivas → menor tasa de contradicciones entre módulos
  const runDeep = async (fallbackProvider) => {
    const agentCfg = DEFAULT_AGENT_CONFIG.deep;
    const estratega    = resolveModel('estratega',     agentCfg);
    const analista     = resolveModel('analista',      agentCfg);
    const abogadoDiablo= resolveModel('abogadoDiablo', agentCfg);
    const critico      = resolveModel('critico',       agentCfg);
    const redactor     = resolveModel('redactor',      agentCfg);

    const mkCfg = (m) => fallbackProvider || makeProviderConfig(m);

    await termLog({ type: 'thinking', message: `🔬 Fase 1/5: Estratega definiendo marco (${estratega})...`, provider: estratega, phase: 'fase_1_estratega', agent: 'estratega', visual: { icon: '🎯', color: '#ec4899' } });
    const marco = await callAiProvider(mkCfg(estratega),
      `${systemContext}\n\nTAREA: Define el marco estratégico y los puntos clave que DEBEN aparecer en "${currentModule.title}". No escribas el contenido final, solo la estructura. Responde en texto libre.`,
      false
    );

    await termLog({ type: 'thinking', message: `🔬 Fase 2/5: Analista desarrollando contenido (${analista})...`, provider: analista, phase: 'fase_2_analista', agent: 'analista', visual: { icon: '🧠', color: '#8b5cf6' } });
    const draft = await callAiProvider(mkCfg(analista),
      `${systemContext}\n\nMarco estratégico:\n${marco}\n\nTAREA: Desarrolla el contenido completo basándote en el marco. Sé exhaustivo. Devuelve JSON con las claves pedidas.`,
      true,
      expectedKeys
    );

    await termLog({ type: 'thinking', message: `🔬 Fase 3/5: Devil's Advocate buscando debilidades (${abogadoDiablo})...`, provider: abogadoDiablo, phase: 'fase_3_devil', agent: 'abogadoDiablo', visual: { icon: '😈', color: '#ef4444' } });
    const devilCritique = await callAiProvider(mkCfg(abogadoDiablo),
      `${systemContext}\n\nContenido desarrollado:\n${JSON.stringify(draft)}\n\nTAREA: Eres un escéptico. ¿Cuáles son los 3 argumentos más débiles? ¿Qué suposiciones son peligrosas? Responde en texto libre.`,
      false
    );

    await termLog({ type: 'thinking', message: `🔬 Fase 4/5: Crítico financiero validando (${critico})...`, provider: critico, phase: 'fase_4_critico', agent: 'critico', visual: { icon: '📉', color: '#ef4444' } });
    const financialCritique = await callAiProvider(mkCfg(critico),
      `${systemContext}\n\nContenido:\n${JSON.stringify(draft)}\n\nCrítica previa:\n${devilCritique}\n\nTAREA: Valida la solidez financiera y estratégica. ¿Es viable? ¿Qué datos faltan? Texto libre.`,
      false
    );

    await termLog({ type: 'thinking', message: `🔬 Fase 5/5: Redactor senior sintetizando (${redactor})...`, provider: redactor, phase: 'fase_5_redactor', agent: 'redactor', visual: { icon: '✍️', color: '#6366f1' } });
    const result = await callAiProvider(mkCfg(redactor),
      `${systemContext}\n\nBorrador:\n${JSON.stringify(draft)}\n\nCríticas recibidas:\n${devilCritique}\n\n${financialCritique}\n\nTAREA: Genera la versión FINAL definitiva integrando todas las perspectivas. Tono ejecutivo, académico y riguroso. DEVUELVE SOLO JSON con claves: ${(currentModule.fields || []).map(f => f.key).join(', ')}`,
      true,
      expectedKeys
    );

    await termLog({ type: 'success', message: '✓ Módulo completado (nivel profundo).', provider: redactor, phase: 'complete', visual: { icon: '✅', color: '#10b981', badge: 'PROFUNDO' } });
    return result;
  };

  // NIVEL 4: Industrial — 9 agentes. El "Gold Standard" de la industria.
  const runIndustrial = async (fallbackProvider) => {
    const agentCfg = DEFAULT_AGENT_CONFIG.industrial;
    const mkCfg = (role) => fallbackProvider || makeProviderConfig(resolveModel(role, agentCfg));

    await termLog({ type: 'thinking', message: '🏭 Fase 1/9: Estratega Maestro (Marco)', provider: 'estratega', phase: 'ind_1_estratega', agent: 'estratega', visual: { icon: '🎯', color: '#ec4899' } });
    const marco = await callAiProvider(mkCfg('estratega'), `${systemContext}\n\nDefine el marco estratégico maestro para este módulo.`, false);

    await termLog({ type: 'thinking', message: '🏭 Fase 2/9: Especialista en Mercado', provider: 'mercado', phase: 'ind_2_mercado', agent: 'mercado', visual: { icon: '📊', color: '#3b82f6' } });
    const marketIn = await callAiProvider(mkCfg('mercado'), `${systemContext}\n\nMarco: ${marco}\n\nDesarrolla la perspectiva de mercado para este módulo.`, false);

    await termLog({ type: 'thinking', message: '🏭 Fase 3/9: Analista de Operaciones', provider: 'operaciones', phase: 'ind_3_operaciones', agent: 'operaciones', visual: { icon: '⚙️', color: '#f59e0b' } });
    const opsIn = await callAiProvider(mkCfg('operaciones'), `${systemContext}\n\nMarco: ${marco}\n\nDesarrolla la perspectiva operativa.`, false);

    await termLog({ type: 'thinking', message: '🏭 Fase 4/9: Especialista Financiero', provider: 'financiero', phase: 'ind_4_financiero', agent: 'financiero', visual: { icon: '💰', color: '#10b981' } });
    const finIn = await callAiProvider(mkCfg('financiero'), `${systemContext}\n\nMarco: ${marco}\n\nDesarrolla la perspectiva financiera y de costos.`, false);

    await termLog({ type: 'thinking', message: '🏭 Fase 5/9: Devil\'s Advocate', provider: 'abogadoDiablo', phase: 'ind_5_devil', agent: 'abogadoDiablo', visual: { icon: '😈', color: '#ef4444' } });
    const critique = await callAiProvider(mkCfg('abogadoDiablo'), `${systemContext}\n\nContenido: ${JSON.stringify({marketIn, opsIn, finIn})}\n\nEncuentra debilidades críticas.`, false);

    await termLog({ type: 'thinking', message: '🏭 Fase 6/9: Revisor de Coherencia', provider: 'coherencia', phase: 'ind_6_coherencia', agent: 'coherencia', visual: { icon: '🔗', color: '#06b6d4' } });
    const coherence = await callAiProvider(mkCfg('coherencia'), `${systemContext}\n\nValida la coherencia entre mercado, operaciones and finanzas.`, false);

    await termLog({ type: 'thinking', message: '🏭 Fase 7/9: Verificador de Hechos', provider: 'hallucination', phase: 'ind_7_hallucination', agent: 'hallucination', visual: { icon: '🔍', color: '#8b5cf6' } });
    const check = await callAiProvider(mkCfg('hallucination'), `Valida si hay alucinaciones o datos falsos en esto: ${JSON.stringify({marketIn, opsIn, finIn})}`, false);

    await termLog({ type: 'thinking', message: '🏭 Fase 8/9: Redactor Final', provider: 'redactor', phase: 'ind_8_redactor', agent: 'redactor', visual: { icon: '✍️', color: '#6366f1' } });
    const draft = await callAiProvider(mkCfg('redactor'), `${systemContext}\n\nCríticas: ${critique}\n\nCoherencia: ${coherence}\n\nHechos: ${check}\n\nGenera el borrador final integrado.`, false);

    await termLog({ type: 'thinking', message: '🏭 Fase 9/9: Editor de Estilo', provider: 'editor', phase: 'ind_9_editor', agent: 'editor', visual: { icon: '📝', color: '#a855f7' } });
    const result = await callAiProvider(mkCfg('editor'), `${systemContext}\n\nBorrador: ${JSON.stringify(draft)}\n\nPulido final estilo académico/ejecutivo. DEVUELVE SOLO JSON.`, true, expectedKeys);

    await termLog({ type: 'success', message: '✓ Módulo completado (NIVEL INDUSTRIAL).', provider: 'editor', phase: 'complete', visual: { icon: '🏭', color: '#10b981', badge: 'INDUSTRIAL' } });
    return result;
  };

  // ─── Selección de orquestador por nivel ────────────────────────────────
  const orchestrators = { 1: runFast, 2: runPro, 3: runDeep, 4: runIndustrial };
  const runChain = orchestrators[depth] || runFast;

  // ─── Ejecución con fallback inteligente ───────────────────────────────
  // [EDD] Si el proveedor primario es nube: falla → siguiente proveedor nube.
  // Si el proveedor primario es local (Ollama): falla → pregunta antes de saltar a nube.

  const opencodeKey   = allPlanData?.config?.ai?.opencodeKey   || '';
  const isCloudPrimary = primaryProvider && primaryProvider !== 'ollama' && primaryProvider !== 'lmstudio';

  let fallbackResult;
  // Paso 1: Proveedor principal / modelos configurados
  try {
    await termLog({ type: 'start', message: `Iniciando generación (nivel ${depth === 1 ? '⚡ Rápido' : depth === 2 ? '🧠 Pro' : depth === 3 ? '🔬 Profundo' : '🏭 Industrial'}) usando proveedor: ${primaryProvider}...`, provider: primaryProvider, phase: 'init', visual: { icon: '🚀', color: '#6366f1' } });
    fallbackResult = await runChain(null); // null = usar modelos por rol configurados
  } catch (providerError) {
    await termLog({ type: 'warning', message: `Proveedor primario falló: ${providerError.message.substring(0, 60)}`, provider: primaryProvider, phase: 'fallback_start', visual: { icon: '⚠️', color: '#f59e0b' } });
  }

  // Paso 2: Si el primario es NUBE que falló → saltar directo a OpenRouter y Groq (NO a Ollama local)
  // Si el primario es LOCAL → intentar modelos locales alternativos primero
  if (!fallbackResult) {
    if (isCloudPrimary) {
      // Fallback 2A: OpenRouter (Nemotron 1M ctx — capa gratuita)
      if (openrouterKey) {
        try {
          await termLog({ type: 'warning', message: `Iniciando fallback a OpenRouter (Nemotron 3.5 Lightning 1M ctx)...`, provider: 'openrouter', phase: 'fallback_openrouter', visual: { icon: '☁️', color: '#818cf8' } });
          fallbackResult = await runChain({ provider: 'openrouter', openrouterKey, apiKey: openrouterKey, model: 'nvidia/nemotron-3.5-lightning:free', endpoint });
        } catch (e) {
          await termLog({ type: 'error', message: `Fallback OpenRouter falló: ${e.message.substring(0, 50)}`, provider: 'openrouter', phase: 'fallback_failed', visual: { icon: '❌', color: '#ef4444' } });
        }
      }
      // Fallback 2B: TokenRouter (DeepSeek R1 / Qwen 2.5)
      const tokenrouterKey = allPlanData?.config?.ai?.tokenrouterKey || '';
      if (!fallbackResult && tokenrouterKey && primaryProvider !== 'tokenrouter') {
        try {
          await termLog({ type: 'warning', message: `Iniciando fallback a TokenRouter (DeepSeek / Qwen)...`, provider: 'tokenrouter', phase: 'fallback_tokenrouter', visual: { icon: '🔑', color: '#a78bfa' } });
          fallbackResult = await runChain({ provider: 'tokenrouter', tokenrouterKey, apiKey: tokenrouterKey, model: 'deepseek/deepseek-r1:free', endpoint });
        } catch (e) {
          await termLog({ type: 'error', message: `Fallback TokenRouter falló: ${e.message.substring(0, 50)}`, provider: 'tokenrouter', phase: 'fallback_failed', visual: { icon: '❌', color: '#ef4444' } });
        }
      }
      // Fallback 2C: Orca Router
      if (!fallbackResult && orcaRouterKey && primaryProvider !== 'orcarouter') {
        try {
          await termLog({ type: 'warning', message: `Iniciando fallback a Orca Router (orcarouter/auto)...`, provider: 'orcarouter', phase: 'fallback_orcarouter', visual: { icon: '🐋', color: '#06b6d4' } });
          fallbackResult = await runChain({ provider: 'orcarouter', orcaRouterKey, apiKey, model: 'orcarouter/auto', endpoint });
        } catch (e) {
          await termLog({ type: 'error', message: `Fallback Orca Router falló: ${e.message.substring(0, 50)}`, provider: 'orcarouter', phase: 'fallback_failed', visual: { icon: '❌', color: '#ef4444' } });
        }
      }
      // Fallback 2C: Groq
      if (!fallbackResult && groqKey && primaryProvider !== 'groq') {
        try {
          await termLog({ type: 'warning', message: `Iniciando fallback a Groq (Llama 3.3 70B)...`, provider: 'groq', phase: 'fallback_groq', visual: { icon: '⚡', color: '#f59e0b' } });
          fallbackResult = await runChain({ provider: 'groq', groqKey, apiKey, model: 'llama-3.1-8b-instant', endpoint });
        } catch (e) {
          await termLog({ type: 'error', message: `Fallback Groq falló: ${e.message.substring(0, 50)}`, provider: 'groq', phase: 'fallback_failed', visual: { icon: '❌', color: '#ef4444' } });
        }
      }
    } else {
      // Proveedor primario local — verificar si Ollama está disponible antes de intentar alternativas locales
      const ollamaOnline = installedModels.length > 0;

      if (ollamaOnline) {
        // Ollama responde pero el modelo falló → intentar otros modelos locales instalados
        const defaultFallbackOrder = ['qwen3.5:4b-mlx', 'nemotron-3-nano:4b', 'qwen3.5:2b-mlx', 'gemma4:e2b-mlx'];
        const fallbackLocalModels = defaultFallbackOrder.filter(m => installedModels.includes(m));
        const actualFallbacks = fallbackLocalModels.length > 0 ? fallbackLocalModels : [];

        for (const altModel of actualFallbacks) {
          try {
            await termLog({ type: 'info', message: `Intentando modelo local alternativo: ${altModel}`, provider: 'ollama', phase: 'local_fallback', visual: { icon: '🔄', color: '#6366f1' } });
            // disableAutoFallback:true evita que callAiProvider vuelva a rotar internamente
            const altCfg = { ...makeProviderConfig(altModel), disableAutoFallback: true };
            fallbackResult = await runChain(altCfg);
            if (fallbackResult) break;
          } catch (altError) {
            await termLog({ type: 'error', message: `Modelo alternativo ${altModel} falló: ${altError.message.substring(0, 50)}`, provider: 'ollama', phase: 'local_fallback_failed', visual: { icon: '❌', color: '#ef4444' } });
          }
        }
      } else {
        // Ollama completamente offline (fetch failed) — saltar directo a la nube
        await termLog({ type: 'warning', message: '⚡ Ollama offline detectado. Saltando directo a proveedores de nube...', provider: 'system', phase: 'ollama_offline', visual: { icon: '📴', color: '#ef4444' } });
      }
    }
  }

  // Paso 2.5: Fallback a NVIDIA NIM (Llama 3.1 70B)
  if (!fallbackResult && nvidiaKey && primaryProvider !== 'nvidia') {
    try {
      await termLog({ type: 'warning', message: `Iniciando fallback automático a NVIDIA NIM (Llama 3.1 70B)...`, provider: 'nvidia', phase: 'fallback_nvidia', visual: { icon: '🟢', color: '#76b900' } });
      fallbackResult = await runChain({ provider: 'nvidia', nvidiaKey, apiKey, model: 'meta/llama-3.1-70b-instruct', endpoint });
    } catch (nvidiaError) {
      await termLog({ type: 'error', message: `Fallback a NVIDIA NIM falló: ${nvidiaError.message.substring(0, 50)}`, provider: 'nvidia', phase: 'fallback_failed', visual: { icon: '❌', color: '#ef4444' } });
    }
  }

  // Paso 2.6: Fallback a Mistral AI
  const finalMistralKey = mistralKey || allPlanData.config?.ai?.mistralKey || (apiKey && apiKey.length === 32 ? apiKey : null);
  if (!fallbackResult && finalMistralKey && primaryProvider !== 'mistral') {
    try {
      await termLog({ type: 'warning', message: `Iniciando fallback automático a Mistral AI (Large)...`, provider: 'mistral', phase: 'fallback_mistral', visual: { icon: '🧠', color: '#f59e0b' } });
      fallbackResult = await runChain({ provider: 'mistral', apiKey: finalMistralKey, model: 'mistral-large-latest', endpoint });
    } catch (mistralError) {
      await termLog({ type: 'error', message: `Fallback a Mistral falló: ${mistralError.message.substring(0, 50)}`, provider: 'mistral', phase: 'fallback_failed', visual: { icon: '❌', color: '#ef4444' } });
    }
  }

  // Paso 2.7: Fallback a Groq Llama 3.1 8B (último intento)
  if (!fallbackResult && groqKey && primaryProvider !== 'groq') {
    try {
      await termLog({ type: 'warning', message: `Fallback final a Groq (Llama 3.1 8B)...`, provider: 'groq', phase: 'fallback_groq_final', visual: { icon: '⚡', color: '#f59e0b' } });
      fallbackResult = await runChain({ provider: 'groq', groqKey, apiKey, model: 'llama-3.1-8b-instant', endpoint });
    } catch (groqError) {
      await termLog({ type: 'error', message: `Fallback Groq final falló: ${groqError.message.substring(0, 50)}`, provider: 'groq', phase: 'fallback_failed', visual: { icon: '❌', color: '#ef4444' } });
    }
  }

  // Paso 2.8: Fallback a Google Gemini 3.6 Flash
  if (!fallbackResult && apiKey && primaryProvider !== 'gemini') {
    try {
      await termLog({ type: 'warning', message: `Iniciando fallback automático a Google Gemini (3.6 Flash)...`, provider: 'gemini', phase: 'fallback_gemini', visual: { icon: '💎', color: '#4285f4' } });
      fallbackResult = await runChain({ provider: 'gemini', apiKey, model: 'gemini-3.6-flash', endpoint });
    } catch (geminiError) {
      await termLog({ type: 'error', message: `Fallback a Gemini falló: ${geminiError.message.substring(0, 50)}`, provider: 'gemini', phase: 'fallback_failed', visual: { icon: '❌', color: '#ef4444' } });
    }
  }

  if (typeof window !== 'undefined' && window.__activeModuleTrace && fallbackResult && typeof fallbackResult === 'object') {
    fallbackResult._trace = { ...window.__activeModuleTrace };
    window.__activeModuleTrace = null;
  }

  // Paso 3: Error final
  if (!fallbackResult) {
    await termLog({ type: 'error', message: 'Todos los proveedores configurados fallaron. Revisa tus API Keys.', provider: 'system', phase: 'total_failure', visual: { icon: '💥', color: '#ef4444' } });
    throw new Error('Generación abortada: Todos los proveedores fallaron. Verifica las API Keys en Configuración.');
  }

  return fallbackResult;
}

// ─────────────────────────────────────────────────────────────────────────
// Genera contenido para UN SOLO campo (Expert Panel)
// ─────────────────────────────────────────────────────────────────────────
export async function generateSingleField(config, fieldKey, fieldLabel, fieldGuide, allPlanData) {
  const { primaryProvider, apiKey, groqKey, nvidiaKey, lmStudioEndpoint, endpoint, model } = config;

  const seed = allPlanData.semilla || {};
  const seedName = seed.nombre_proyecto || seed.negocio?.nombre_marca || seed.negocio?.giro || seed.negocio?.nombre || seed.solucion || '';
  const seedLoc = seed.cobertura || seed.negocio?.ubicacion || seed.negocio?.cobertura || '';
  const seedProb = seed.problema || seed.negocio?.descripcion || '';
  const seedSol = seed.solucion || seed.negocio?.que_es || '';
  const seedMarket = seed.mercado_objetivo || seed.clientes?.quienes || '';
  const seedRev = seed.modelo_ingresos || seed.finanzas?.como_gana_dinero || '';
  const seedAdv = seed.ventaja_injusta || seed.negocio?.diferencial || '';

  const locationConstraint = seedLoc ? `\nREGLA ESTRICTA DE UBICACIÓN: El negocio opera o tiene cobertura en "${seedLoc}". NO inventes ciudades ni asumas capitales. Respeta estrictamente esta ubicación.` : '';

  const semillaContext = Object.keys(seed).length > 0
    ? `\nCONTEXTO NARRATIVO Y SEMILLA DEL PROYECTO:
- Nombre del Proyecto: ${seedName || 'No especificado'}
- Ubicación / Cobertura: ${seedLoc || 'No especificada'}
- Problema / Necesidad: ${seedProb || 'No especificado'}
- Solución / Propuesta de Valor: ${seedSol || 'No especificada'}
- Mercado Objetivo: ${seedMarket || 'No especificado'}
- Modelo de Ingresos: ${seedRev || 'No especificado'}
- Ventaja Competitiva: ${seedAdv || 'No especificada'}
${locationConstraint}
Datos Crudos de Semilla:
${JSON.stringify(seed, null, 2)}\n`
    : '';

  const documentsContext = (allPlanData.config?.documents || []).length > 0
    ? `\nDOCUMENTOS DE REFERENCIA (RAG):
${allPlanData.config.documents.map(d => d.text).join('\n---\n').substring(0, 4000)}\n`
    : '';

  const prompt = `
Eres un consultor experto en formulación de planes de negocio de Open Business Plan (Fondo Thoth AC).
${semillaContext}
${documentsContext}
Contexto del plan actual:
${cleanPlanDataForAi(allPlanData, primaryProvider === 'ollama' || primaryProvider === 'lmstudio')}

TAREA: Genera contenido profesional, riguroso y exhaustivo SOLO para el campo "${fieldLabel}".
Guía y Requisitos: ${fieldGuide.desc || ''}
Ejemplo de referencia: ${fieldGuide.ejemplo || ''}

REGLA CRÍTICA: Basa tu respuesta estrictamente en la propuesta de valor, giro y ubicación especificados en la semilla.
Devuelve un JSON con UNA sola clave: "${fieldKey}" y su contenido profesional.
`;

  const installedModels = await getInstalledOllamaModels(endpoint);
  const resolvedModel = findBestOllamaModel(model || 'qwen3.5:4b-mlx', installedModels);

  // Intentar primero el modelo resuelto, luego los otros instalados en orden de estabilidad
  // Configurar proveedor correcto
  let prov = primaryProvider || 'ollama';
  if (resolvedModel.includes('gemini')) prov = 'gemini';
  else if (resolvedModel.includes('gpt')) prov = 'openai';
  else if (resolvedModel.includes('mistral-large')) prov = 'mistral';
  else if (resolvedModel.includes('llama-3.3-70b')) prov = 'groq';
  else if (resolvedModel.includes('nvidia') || resolvedModel.includes('google/gemma')) prov = 'nvidia';

  if (prov !== 'ollama' && prov !== 'lmstudio') {
    return await callAiProvider({ provider: prov, apiKey, groqKey, nvidiaKey, endpoint, model: resolvedModel }, prompt, true, [fieldKey]);
  }

  // Fallback para modelos locales
  const localModels = [
    resolvedModel,
    'qwen3.5:4b-mlx',
    'nemotron-3-nano:4b',
    'qwen3.5:2b-mlx'
  ];

  // Filtrar duplicados y quedarse con los instalados si es posible
  const uniqueModels = [...new Set(localModels)];
  const activeModels = installedModels.length > 0 
    ? uniqueModels.filter(m => installedModels.includes(m))
    : uniqueModels;

  for (const localModel of (activeModels.length > 0 ? activeModels : uniqueModels)) {
    try {
      const pConfig = { provider: prov, endpoint: prov === 'lmstudio' ? lmStudioEndpoint : endpoint, model: localModel };
      return await callAiProvider(pConfig, prompt, true, [fieldKey]);
    } catch (error) {
      console.warn(`generateSingleField falló en ${prov} con modelo ${localModel}: ${error.message}`);
    }
  }
  throw new Error('No se pudo generar el campo. Verifique el runtime MLX y los modelos de Ollama locales.');
}

// ─────────────────────────────────────────────────────────────────────────
// Diálogo de fallback a nube
// ─────────────────────────────────────────────────────────────────────────
function _showFallbackDialog(errorMsg) {
  return new Promise((resolve) => {
    const isConnection = errorMsg.includes('fetch') || errorMsg.includes('Failed') || errorMsg.includes('ECONNREFUSED');
    const message = isConnection
      ? `⚠️ Ollama no detectado (localhost:11434).\n\n¿Usar la NUBE (Groq/Gemini) como respaldo?\n\n• OK = Usar Nube\n• Cancelar = Detener`
      : `⚠️ Error en Ollama: ${errorMsg}\n\n¿Saltar a la NUBE?\n\n• OK = Usar Nube\n• Cancelar = Detener`;
    resolve(window.confirm(message) ? 'cloud' : 'cancel');
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Provider Adapters
// ─────────────────────────────────────────────────────────────────────────
// Provider Adapters
// ─────────────────────────────────────────────────────────────────────────
// ─── Circuit Breaker a nivel de sesión para evitar reintentar proveedores muertos ───
const sessionFailedProviders = new Map(); // provider -> timestamp
const CIRCUIT_BREAKER_TTL_MS = 5 * 60 * 1000; // 5 minutos

function isProviderCircuitOpen(prov) {
  const failedAt = sessionFailedProviders.get(prov);
  if (!failedAt) return false;
  if (Date.now() - failedAt > CIRCUIT_BREAKER_TTL_MS) {
    sessionFailedProviders.delete(prov);
    return false;
  }
  return true;
}

function markProviderFailed(prov) {
  sessionFailedProviders.set(prov, Date.now());
}

export async function callAiProvider(config, prompt, expectJson = true, expectedKeys = [], onThink = null) {
  const {
    provider, apiKey, groqKey, nvidiaKey, openrouterKey, opencodeKey, tokenrouterKey, mistralKey, minimaxKey, orcaRouterKey,
    ollamaKey,
    endpoint, lmStudioEndpoint, model, disableAutoFallback = false
  } = config;

  const invokeSingle = async (prov, mod, key) => {
    if (prov === 'minimax')     return await callMinimax(key || minimaxKey || apiKey, mod, prompt, expectJson);
    if (prov === 'gemini')      return await callGemini(key || apiKey, mod, prompt);
    if (prov === 'groq')        return await callGroq(key || groqKey || apiKey, mod, prompt, expectJson);
    if (prov === 'nvidia')      return await callNvidia(key || nvidiaKey || apiKey, mod, prompt);
    if (prov === 'openrouter')  return await callOpenRouter(key || openrouterKey || apiKey, mod, prompt, expectJson);
    if (prov === 'opencode')    return await callOpenRouter(key || opencodeKey || apiKey, mod, prompt, expectJson);
    if (prov === 'tokenrouter') return await callTokenRouter(key || tokenrouterKey || apiKey, mod, prompt, expectJson);
    if (prov === 'orcarouter')  return await callOrcaRouter(key || orcaRouterKey || apiKey, mod, prompt, expectJson);
    if (prov === 'ollama')      return await callOllama(endpoint, mod, prompt, expectJson, key || ollamaKey || '');
    if (prov === 'lmstudio')    return await callLmStudio(endpoint || lmStudioEndpoint, mod, prompt, expectJson, key || apiKey);
    if (prov === 'mistral')     return await callMistral(key || mistralKey || apiKey, mod, prompt);
    if (prov === 'openai')      return await callOpenAI(key || apiKey, mod, prompt, expectJson);
    throw new Error(`Proveedor ${prov} no soportado`);
  };

  let text;
  let primaryError = null;

  try {
    text = await invokeSingle(provider, model, null);
  } catch (err) {
    primaryError = err;
    if (disableAutoFallback) {
      throw err;
    }

    markProviderFailed(provider);

    // ─── Rotación Automática Multi-Proveedor Ultra Rápida ───
    // ORDEN DE MENOR A MAYOR LATENCIA:
    // 1. Groq (1-2s con Llama 3.1 8B)
    // 2. Gemini (1-3s con Gemini 3.6 Flash / 3.5 Flash Lite)
    // 3. OpenRouter (tier gratuito)
    // 4. Minimax / NVIDIA / Mistral
    const logger = onThink || activeTermLog;
    const fallbackProviders = [];

    // 1° Prioridad: Groq — el más veloz y robusto
    if (provider !== 'groq' && (groqKey || config?.groqKey) && !isProviderCircuitOpen('groq')) {
      fallbackProviders.push({ provider: 'groq', key: groqKey || config?.groqKey, model: 'llama-3.1-8b-instant' });
    }

    // 2° Prioridad: Gemini — Google Flash
    if (provider !== 'gemini' && (apiKey || config?.geminiKey) && !isProviderCircuitOpen('gemini')) {
      fallbackProviders.push({ provider: 'gemini', key: apiKey || config?.geminiKey, model: 'gemini-3.6-flash' });
    }

    // 3° Prioridad: OpenRouter
    if (provider !== 'openrouter' && (openrouterKey || config?.openrouterKey) && !isProviderCircuitOpen('openrouter')) {
      fallbackProviders.push({ provider: 'openrouter', key: openrouterKey || config?.openrouterKey, model: 'nvidia/nemotron-3.5-lightning:free' });
    }

    // 4° Prioridad: Routers inteligentes
    if (provider !== 'tokenrouter' && (tokenrouterKey || config?.tokenrouterKey) && !isProviderCircuitOpen('tokenrouter')) {
      fallbackProviders.push({ provider: 'tokenrouter', key: tokenrouterKey || config?.tokenrouterKey, model: 'deepseek/deepseek-r1:free' });
    }
    if (provider !== 'orcarouter' && (orcaRouterKey || config?.orcaRouterKey) && !isProviderCircuitOpen('orcarouter')) {
      fallbackProviders.push({ provider: 'orcarouter', key: orcaRouterKey || config?.orcaRouterKey, model: 'orcarouter/auto' });
    }

    // 5° Prioridad: Minimax / NVIDIA / Mistral
    if (provider !== 'minimax' && (minimaxKey || config?.minimaxKey) && !isProviderCircuitOpen('minimax')) {
      fallbackProviders.push({ provider: 'minimax', key: minimaxKey || config?.minimaxKey, model: 'minimax-m3:cloud' });
    }
    if (provider !== 'nvidia' && (nvidiaKey || config?.nvidiaKey) && !isProviderCircuitOpen('nvidia')) {
      fallbackProviders.push({ provider: 'nvidia', key: nvidiaKey || config?.nvidiaKey, model: 'meta/llama-3.1-70b-instruct' });
    }
    if (provider !== 'mistral' && (mistralKey || config?.mistralKey) && !isProviderCircuitOpen('mistral')) {
      fallbackProviders.push({ provider: 'mistral', key: mistralKey || config?.mistralKey, model: 'mistral-large-latest' });
    }

    let fallbackSuccess = false;
    let failingProv = provider;

    for (const fb of fallbackProviders) {
      try {
        if (logger) {
          logger('warning', `⚠️ [Rotación IA] ${failingProv} falló. Rotando automáticamente a ${fb.provider} (${fb.model})...`, fb.provider);
        }
        text = await invokeSingle(fb.provider, fb.model, fb.key);
        fallbackSuccess = true;
        break;
      } catch (fbErr) {
        console.warn(`[callAiProvider Fallback] ${fb.provider} falló:`, fbErr.message);
        markProviderFailed(fb.provider);
        failingProv = fb.provider;
      }
    }

    if (!fallbackSuccess) {
      throw primaryError;
    }
  }

  if (typeof text === 'string') {
    const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>/i);
    let reasoning = null;
    if (thinkMatch && thinkMatch[1]) {
      reasoning = thinkMatch[1].trim();
      const logger = onThink || activeTermLog;
      if (logger) {
        logger('thinking', `🧠 [Razonamiento]: ${reasoning}`, provider || 'ollama');
      }
      text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    }
    if (typeof window !== 'undefined') {
      if (window.__activeModuleTrace) {
        window.__activeModuleTrace.logs.push({
          provider: config.provider || provider,
          model: config.model || model,
          prompt,
          response: text,
          reasoning
        });
      }
      window.dispatchEvent(new CustomEvent('openplan_trajectory_updated', {
        detail: {
          provider: config.provider || provider,
          model: config.model || model,
          timestamp: new Date().toISOString()
        }
      }));
    }
  }

  return expectJson ? parseAIResponse(text, expectedKeys) : text;
}

export async function callMinimax(apiKey, model, prompt, _expectJson = true) {
  const rotatedKey = getRotatedApiKey(apiKey, 'minimax');
  if (!rotatedKey) throw new Error('API Key de MiniMax requerida');

  const preferredModel = model || 'minimax-m3:cloud';
  const url = 'https://api.minimax.chat/v1/text/chatcompletion_v2';
  
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${rotatedKey}`
    },
    body: JSON.stringify({
      model: preferredModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6
    })
  }, { fastFailOn429: true });

  const data = await response.json();
  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new Error(data.base_resp.status_msg || 'Error en API de MiniMax');
  }
  return data.choices?.[0]?.message?.content || data.reply || '';
}

async function callOllama(endpoint, model, prompt, expectJson, ollamaKey = '') {
  const targetModel = model || 'minimax-m3:cloud';

  // ─── MODO CLOUD: Si hay ollamaKey → usar API pública de Ollama Cloud ───────
  // https://ollama.com/v1/chat/completions es compatible con OpenAI API.
  // NO requiere Ollama instalado localmente. Funciona perfecto en VPS.
  // Usamos fetchWithProxy para que las peticiones pasen por el backend y evitar CORS.
  if (ollamaKey) {
    // Ollama Cloud usa exactamente el mismo endpoint que OpenAI API
    const cloudUrl = 'https://ollama.com/v1/chat/completions';
    // Timeout 90s para prompts largos agénticos (PESTEL etc) + retry vía fallback
    let cloudResponse;
    try {
      cloudResponse = await fetchWithProxy(cloudUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ollamaKey}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: 'user', content: prompt }],
          ...(expectJson ? { response_format: { type: 'json_object' } } : {})
        }),
        signal: AbortSignal.timeout(90000)
      });
    } catch (e) {
      if (e.name === 'TimeoutError' || e.name === 'AbortError') {
        throw new Error(`Ollama Cloud (${targetModel}) timeout 90s: ${e.message}`);
      }
      throw e;
    }

    if (!cloudResponse.ok) {
      const errText = await cloudResponse.text().catch(() => '');
      throw new Error(`Ollama Cloud (${targetModel}) error ${cloudResponse.status}: ${errText || cloudResponse.statusText}`);
    }

    const cloudData = await cloudResponse.json();
    if (cloudData.error) throw new Error(cloudData.error.message || JSON.stringify(cloudData.error));

    const content = cloudData.choices?.[0]?.message?.content || '';
    const usage = cloudData.usage || {};
    recordTokenTelemetry('ollama_cloud', (usage.total_tokens || 0), targetModel, usage.prompt_tokens || 0, usage.completion_tokens || 0, 0, prompt);
    return content;
  }

  // ─── MODO LOCAL: Sin ollamaKey → intentar localhost:11434 ─────────────────
  // Si ya sabemos que Ollama está offline (caché activo), fallar rápido sin timeout
  if (_isOllamaOfflineCached()) {
    throw new Error(`Ollama local (${targetModel}) error: offline (caché activo, evitando timeout)`);
  }

  const targetEndpoint = endpoint || 'http://localhost:11434';
  const url = `${targetEndpoint}/api/generate`;
  const payload = { model: targetModel, prompt, stream: false, format: expectJson ? 'json' : undefined };

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000)
    });
  } catch (fetchErr) {
    _markOllamaOffline();
    try {
      response = await fetchWithProxy(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      throw fetchErr;
    }
  }

  if (!response || !response.ok) {
    _markOllamaOffline();
    const errText = response ? await response.text().catch(() => '') : 'Sin conexión con Ollama';
    throw new Error(`Ollama (${targetModel}) error: ${errText || response?.statusText || 'Inalcanzable'}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error);

  const promptTokens = data.prompt_eval_count || Math.round(prompt.length / 4);
  const completionTokens = data.eval_count || Math.round((data.response || '').length / 4);
  recordTokenTelemetry('ollama', promptTokens + completionTokens, targetModel, promptTokens, completionTokens, 0, prompt);
  return data.response;
}

async function callLmStudio(endpoint, model, prompt, expectJson, apiKey) {
  const url = `${endpoint || 'http://localhost:1234/v1'}/chat/completions`;
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  const response = await fetchWithProxy(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: model || 'local-model',
      messages: [{ role: 'user', content: prompt }],
      response_format: expectJson ? { type: 'json_object' } : undefined,
      temperature: 0.7
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data.choices[0].message.content;
}

async function callGemini(apiKey, model, prompt) {
  const keys = parseApiKeys(apiKey);
  if (keys.length === 0) throw new Error('No se proporcionó API Key de Google Gemini válida');

  let preferredModel = model || 'gemini-3.6-flash';
  // Normalizar aliases — usar modelos actuales de Gemini API (v1beta)
  if (
    preferredModel.includes('1.5') ||
    preferredModel === 'gemini-2.0-flash'
  ) {
    preferredModel = 'gemini-3.6-flash';
  }

  const geminiCandidates = [
    preferredModel,
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.7-flash'
  ];
  const uniqueModels = [...new Set(geminiCandidates)];

  let lastError = null;

  for (const currentKey of keys) {
    for (const candidate of uniqueModels) {
      try {
        if (candidate !== uniqueModels[0] && activeTermLog) {
          activeTermLog('thinking', `🔄 Rotando a modelo en Gemini: ${candidate}...`, 'gemini');
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent?key=${currentKey}`;
        const response = await fetchWithRetry(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }, { maxRetries: 0, fastFailOn429: true });

        if (response.status === 429) {
          continue;
        }

        const data = await response.json();
        if (!data.error && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          if (data.usageMetadata && data.usageMetadata.totalTokenCount) {
            recordTokenTelemetry('gemini', data.usageMetadata.totalTokenCount, candidate, data.usageMetadata.promptTokenCount, data.usageMetadata.candidatesTokenCount);
          }
          return data.candidates[0].content.parts[0].text;
        }
        if (data.error) {
          lastError = new Error(data.error.message);
          if (data.error.status === 'RESOURCE_EXHAUSTED' || (data.error.message && data.error.message.includes('Quota exceeded'))) {
            continue;
          }
        }
      } catch (err) {
        lastError = err;
        if (err.status === 429 || err.message === 'HTTP_429_RATE_LIMIT') {
          continue;
        }
      }
    }
  }

  throw lastError || new Error('No se pudo obtener respuesta de Google Gemini.');
}

async function fetchWithProxy(url, options = {}) {
  if (typeof window !== 'undefined') {
    const apiBase = getApiBase();
    const proxyUrl = `${apiBase}/api/ai/proxy`;
    const body = {
      url,
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined
    };
    try {
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return response;
    } catch (proxyErr) {
      console.warn('[fetchWithProxy] Proxy falló, intentando fetch directo:', proxyErr.message);
      return fetch(url, options);
    }
  }
  return fetch(url, options);
}

async function callGroq(apiKey, model, prompt, expectJson) {
  const keys = parseApiKeys(apiKey);
  if (keys.length === 0) throw new Error('No se proporcionó API Key de Groq válida');

  let preferredModel = model || 'llama-3.1-8b-instant';
  // Normalizar aliases
  if (preferredModel === 'groq/compound' || preferredModel === 'compound-beta') preferredModel = 'llama-3.1-8b-instant';
  if (preferredModel === 'openai/gpt-oss-120b') preferredModel = 'openai/gpt-oss-120b';
  if (preferredModel === 'openai/gpt-oss-20b') preferredModel = 'openai/gpt-oss-20b';
  if (preferredModel === 'qwen/qwen3.6-27b') preferredModel = 'qwen/qwen3-32b';

  // Modelos oficiales y reales de Groq API (2026)
  const groqCandidateModels = [
    preferredModel,
    'llama-3.1-8b-instant',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3-32b'
  ];
  const uniqueModels = [...new Set(groqCandidateModels.filter(Boolean))];

  let lastError = null;

  for (const currentKey of keys) {
    for (const candidate of uniqueModels) {
      try {
        if (candidate !== uniqueModels[0] && activeTermLog) {
          activeTermLog('thinking', `🔄 Rotando a modelo en Groq: ${candidate}...`, 'groq');
        }

        const response = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentKey}` },
          body: JSON.stringify({
            model: candidate,
            messages: [{ role: 'user', content: prompt }],
            response_format: expectJson ? { type: 'json_object' } : undefined,
            temperature: 0.7
          })
        }, { maxRetries: 0, fastFailOn429: true });

        if (response.status === 429) {
          continue;
        }

        const data = await response.json();
        if (!data.error && data.choices?.[0]?.message?.content !== undefined) {
          if (data.usage && data.usage.total_tokens) {
            recordTokenTelemetry('groq', data.usage.total_tokens, candidate, data.usage.prompt_tokens, data.usage.completion_tokens);
          }
          return data.choices[0].message.content;
        }
        if (data.error) {
          lastError = new Error(data.error.message);
          if (data.error.code === 'rate_limit_exceeded' || (data.error.message && data.error.message.toLowerCase().includes('rate limit'))) {
            continue;
          }
        }
      } catch (err) {
        lastError = err;
        if (err.status === 429 || err.message === 'HTTP_429_RATE_LIMIT') {
          continue;
        }
      }
    }
  }

  throw lastError || new Error('No se pudo obtener respuesta de ningún modelo o llave disponible en Groq.');
}

async function callNvidia(apiKey, model, prompt) {
  const response = await fetchWithRetry('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model && !model.includes('nemotron-70b-instruct') ? model : 'meta/llama-3.1-70b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096
    })
  });
  const data = await response.json();
  if (data.error || data.detail) throw new Error(data.error?.message || data.detail?.[0]?.msg || 'NVIDIA API Error');
  return data.choices[0].message.content;
}

async function callOpenRouter(apiKey, model, prompt, expectJson) {
  const keys = parseApiKeys(apiKey);
  if (keys.length === 0) throw new Error('No se proporcionó API Key de OpenRouter válida');

  const candidateModels = [
    model || 'nvidia/nemotron-3.5-lightning:free',
    'nvidia/nemotron-3.5-lightning:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'deepseek/deepseek-r1:free',
    'google/gemini-2.0-flash-exp:free',
    'qwen/qwen-2.5-72b-instruct:free'
  ];
  const uniqueModels = [...new Set(candidateModels)];
  let lastError = null;

  for (const currentKey of keys) {
    for (const candidate of uniqueModels) {
      try {
        if (candidate !== uniqueModels[0] && activeTermLog) {
          activeTermLog('thinking', `🔄 Rotando a modelo en OpenRouter: ${candidate}...`, 'openrouter');
        }

        const response = await fetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentKey}`,
            'HTTP-Referer': 'https://fondothoth.com/obp',
            'X-Title': 'Open Business Plan'
          },
          body: JSON.stringify({
            model: candidate,
            messages: [{ role: 'user', content: prompt }],
            response_format: expectJson ? { type: 'json_object' } : undefined,
            temperature: 0.7
          })
        }, { maxRetries: 0, fastFailOn429: true });

        if (response.status === 429) continue;

        const data = await response.json();
        if (!data.error && data.choices?.[0]?.message?.content !== undefined) {
          if (data.usage && data.usage.total_tokens) {
            recordTokenTelemetry('openrouter', data.usage.total_tokens, candidate, data.usage.prompt_tokens, data.usage.completion_tokens);
          }
          return data.choices[0].message.content;
        }
        if (data.error) {
          lastError = new Error(data.error.message || 'OpenRouter error');
        }
      } catch (err) {
        lastError = err;
        if (err.status === 429 || err.message === 'HTTP_429_RATE_LIMIT') {
          continue;
        }
      }
    }
  }

  throw lastError || new Error('No se pudo obtener respuesta de ningún modelo disponible en OpenRouter.');
}

async function callOpenAI(apiKey, model, prompt, expectJson) {
  const response = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: expectJson ? { type: 'json_object' } : undefined
    })
  });
  const data = await response.json();
  if (data.usage && data.usage.total_tokens) {
    recordTokenTelemetry('openai', data.usage.total_tokens, targetModel, data.usage.prompt_tokens, data.usage.completion_tokens);
  }
  return data.choices[0].message.content;
}

// ─────────────────────────────────────────────────────────────────────────
// Telemetry Hook
// ─────────────────────────────────────────────────────────────────────────
function recordTokenTelemetry(provider, totalTokens, model = null, promptTokens = 0, completionTokens = 0, latencyMs = 0, promptPreview = '') {
  if (!totalTokens || totalTokens <= 0) return;
  try {
    if (typeof window !== 'undefined' && window.__activeModuleTrace) {
      window.__activeModuleTrace.tokens += totalTokens;
      window.__activeModuleTrace.promptTokens += promptTokens;
      window.__activeModuleTrace.completionTokens += completionTokens;
      if (model) {
        window.__activeModuleTrace.cost += calculateCost(model, promptTokens, completionTokens);
      }
    }

    const apiBase = getApiBase();
    // 1. Contador agregado de tokens por proveedor
    fetch(`${apiBase}/api/telemetry/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, tokens: totalTokens })
    }).catch(() => {});

    // 2. Log detallado de llamadas para la sección de Trazabilidad
    fetch(`${apiBase}/api/telemetry/call-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        model: model || 'unknown',
        promptTokens,
        completionTokens,
        latencyMs,
        promptPreview: typeof promptPreview === 'string' ? promptPreview.slice(0, 200) : '',
        status: 'success'
      })
    }).catch(() => {});
  } catch (e) {}
}

async function callOrcaRouter(apiKey, model, prompt, expectJson) {
  const keys = parseApiKeys(apiKey);
  if (keys.length === 0) throw new Error('No se proporcionó API Key de Orca Router válida');

  let lastError = null;
  const currentKey = keys[0];
  const targetModel = model || 'orcarouter/auto';

  try {
    const response = await fetchWithRetry('https://api.orcarouter.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentKey}` },
      body: JSON.stringify({
        model: targetModel,
        messages: [{ role: 'user', content: prompt }],
        response_format: expectJson ? { type: 'json_object' } : undefined
      })
    });
    
    const data = await response.json();
    
    if (data.usage && data.usage.total_tokens) {
      recordTokenTelemetry('orcarouter', data.usage.total_tokens, targetModel, data.usage.prompt_tokens, data.usage.completion_tokens);
    }
    
    return data.choices[0].message.content;
  } catch (err) {
    throw new Error(`Error en Orca Router: ${err.message}`);
  }
}

async function callTokenRouter(apiKey, model, prompt, expectJson) {
  const keys = parseApiKeys(apiKey);
  if (keys.length === 0) throw new Error('No se proporcionó API Key de TokenRouter válida');

  const candidateModels = [
    model || 'deepseek/deepseek-r1:free',
    'deepseek/deepseek-chat:free',
    'qwen/qwen-2.5-72b-instruct:free',
    'qwen/qwen-2.5-coder-32b-instruct:free',
    'deepseek-r1',
    'deepseek-v3',
    'qwen-2.5-72b'
  ];
  const uniqueModels = [...new Set(candidateModels.filter(Boolean))];
  let lastError = null;

  const endpoints = [
    'https://api.tokenrouter.net/v1/chat/completions',
    'https://api.tokenrouter.io/v1/chat/completions',
    'https://api.tokenrouter.me/v1/chat/completions',
    'https://api.tokenrouter.ai/v1/chat/completions'
  ];

  for (const currentKey of keys) {
    for (const targetModel of uniqueModels) {
      for (const ep of endpoints) {
        try {
          if (activeTermLog) {
            activeTermLog('thinking', `🔄 Invocando TokenRouter (${targetModel})...`, 'tokenrouter');
          }

          const response = await fetchWithRetry(ep, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentKey}`,
              'HTTP-Referer': 'https://fondothoth.com/obp',
              'X-Title': 'Open Business Plan'
            },
            body: JSON.stringify({
              model: targetModel,
              messages: [{ role: 'user', content: prompt }],
              response_format: expectJson ? { type: 'json_object' } : undefined,
              temperature: 0.7
            })
          }, { maxRetries: 0, fastFailOn429: true });

          if (response.status === 429) continue;

          const data = await response.json();
          if (!data.error && data.choices?.[0]?.message?.content !== undefined) {
            if (data.usage && data.usage.total_tokens) {
              recordTokenTelemetry('tokenrouter', data.usage.total_tokens, targetModel, data.usage.prompt_tokens, data.usage.completion_tokens);
            }
            return data.choices[0].message.content;
          }
          if (data.error) {
            lastError = new Error(data.error.message || 'TokenRouter error');
          }
        } catch (err) {
          lastError = err;
          if (err.status === 429 || err.message === 'HTTP_429_RATE_LIMIT') {
            continue;
          }
        }
      }
    }
  }

  throw lastError || new Error('No se pudo completar la llamada con TokenRouter');
}

async function callMistral(apiKey, model, prompt) {
  const response = await fetchWithRetry('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model || 'mistral-large-latest',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  if (data.usage && data.usage.total_tokens) {
    recordTokenTelemetry('mistral', data.usage.total_tokens, targetModel, data.usage.prompt_tokens, data.usage.completion_tokens);
  }
  return data.choices[0].message.content;
}

function parseAIResponse(text, expectedKeys = []) {
  const cleanJsonString = (str) => {
    let inQuote = false;
    let escaped = false;
    let result = '';
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '"' && !escaped) {
        inQuote = !inQuote;
        result += char;
      } else if (char === '\\' && !escaped) {
        escaped = true;
        result += char;
      } else {
        if (inQuote) {
          if (char === '\n') {
            result += '\\n';
          } else if (char === '\r') {
            result += '\\r';
          } else if (char === '\t') {
            result += '\\t';
          } else {
            result += char;
          }
        } else {
          result += char;
        }
        escaped = false;
      }
    }
    // Remove trailing commas before closing braces/brackets
    return result.replace(/,\s*([\]}])/g, '$1');
  };

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        const cleaned = cleanJsonString(jsonMatch[0]);
        return JSON.parse(cleaned);
      }
    }
    try {
      return JSON.parse(text);
    } catch {
      const cleaned = cleanJsonString(text);
      return JSON.parse(cleaned);
    }
  } catch (e) {
    if (expectedKeys.length > 0) {
      console.warn("Fallo el parseo JSON. Intentando extraer datos de texto plano/MD...");
      const recoveredData = {};
      
      if (expectedKeys.length === 1) {
        let cleanedText = text.trim();
        // Remove markdown code fences
        cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
        // Remove leading 'json' keyword if any
        if (cleanedText.toLowerCase().startsWith('json')) {
          cleanedText = cleanedText.substring(4).trim();
        }
        // Try to parse the cleaned text as JSON one more time in case it was just wrapped
        try {
          const jsonMatchClean = cleanedText.match(/\{[\s\S]*\}/);
          if (jsonMatchClean) {
            recoveredData[expectedKeys[0]] = JSON.parse(cleanJsonString(jsonMatchClean[0]));
            return recoveredData;
          }
        } catch {}

        recoveredData[expectedKeys[0]] = cleanedText.replace(/^[`"']+|[`"']+$/g, '');
        return recoveredData;
      }

      expectedKeys.forEach(key => {
        const regex = new RegExp(`(?:\\*\\*|#+ |"|'|^|\\n)\\s*${key}\\s*(?:\\*\\*|"|'|:|\\n)\\s*([\\s\\S]*?)(?=(?:\\*\\*|#+ |"|'|\\n)\\s*(?:${expectedKeys.join('|')})\\s*(?:\\*\\*|"|'|:|\\n)|$)`, 'i');
        const match = text.match(regex);
        if (match && match[1]) {
          recoveredData[key] = match[1].trim();
        }
      });

      if (Object.keys(recoveredData).length > 0) {
        expectedKeys.forEach(key => {
          if (!recoveredData[key]) recoveredData[key] = "Información no generada correctamente.";
        });
        return recoveredData;
      }
    }
    throw new Error('La IA no devolvió un formato JSON válido.', { cause: e });
  }
}


// ─────────────────────────────────────────────────────────────────────────
// Sugerencia tipo "Mesa de Expertos" para mejorar texto (UI ExpertPanel)
// ─────────────────────────────────────────────────────────────────────────
export async function generateExpertSuggestion(config, { expertRole, fieldLabel, currentValue, planData }) {
  const { primaryProvider, apiKey, groqKey, nvidiaKey, lmStudioEndpoint, endpoint, model } = config || {};

  const companyName = planData?.config?.brandKit?.companyName
    ? `Proyecto/Empresa: ${planData.config.brandKit.companyName}\n`
    : '';

  const semillaContext = planData?.semilla
    ? `Contexto del emprendedor (semilla):\n${JSON.stringify(planData.semilla, null, 2)}\n`
    : '';

  const prompt = `
Eres un miembro de una "Mesa de Expertos" en planes de negocio.
Rol: ${expertRole}
${companyName}
${semillaContext}

Campo a mejorar: "${fieldLabel}"

Texto actual:
"""${currentValue || ''}"""

TAREA:
1) Reescribe el texto para que quede profesional, claro y accionable.
2) Mantén el mismo idioma (español).
3) Evita relleno; usa frases concretas y métricas cuando aplique.

Responde SOLO con la versión mejorada, sin introducciones.
`;

  const installedModels = await getInstalledOllamaModels(endpoint);
  const resolvedModel = findBestOllamaModel(model || 'qwen3.5:4b-mlx', installedModels);

  let prov = primaryProvider || 'ollama';
  if (resolvedModel.includes('gemini')) prov = 'gemini';
  else if (resolvedModel.includes('gpt')) prov = 'openai';
  else if (resolvedModel.includes('mistral-large')) prov = 'mistral';
  else if (resolvedModel.includes('llama-3.3-70b')) prov = 'groq';
  else if (resolvedModel.includes('nvidia') || resolvedModel.includes('google/gemma')) prov = 'nvidia';

  if (prov !== 'ollama' && prov !== 'lmstudio') {
    const text = await callAiProvider({ provider: prov, apiKey, groqKey, nvidiaKey, endpoint, model: resolvedModel }, prompt, false);
    return (text || '').trim();
  }

  const localModels = [
    resolvedModel,
    'qwen3.5:4b-mlx',
    'nemotron-3-nano:4b',
    'qwen3.5:2b-mlx'
  ];

  // Filtrar duplicados y quedarse con los instalados si es posible
  const uniqueModels = [...new Set(localModels)];
  const activeModels = installedModels.length > 0 
    ? uniqueModels.filter(m => installedModels.includes(m))
    : uniqueModels;

  let lastError = null;
  for (const localModel of (activeModels.length > 0 ? activeModels : uniqueModels)) {
    try {
      const pConfig = { provider: prov, endpoint: prov === 'lmstudio' ? lmStudioEndpoint : endpoint, model: localModel };
      const text = await callAiProvider(pConfig, prompt, false);
      return (text || '').trim();
    } catch (error) {
      lastError = error;
      console.warn(`generateExpertSuggestion falló en ${prov} con modelo ${localModel}: ${error.message}`);
    }
  }

  throw new Error(lastError?.message || 'No se pudo generar sugerencia. Verifique el runtime MLX y los modelos de Ollama locales.');
}

// ─────────────────────────────────────────────────────────────────────────
// Resumen de texto para UI (ModuleField)
// ─────────────────────────────────────────────────────────────────────────
export async function summarizeText(config, text) {
  const { primaryProvider, apiKey, groqKey, nvidiaKey, lmStudioEndpoint, endpoint, model } = config || {};

  const prompt = `
Eres un editor profesional de planes de negocio.
TAREA: Resume el texto manteniendo la idea central, datos clave and tono ejecutivo.
Reglas:
- Responde SOLO con el resumen (sin prefacios).
- Máximo 3–4 oraciones.
- Conserva números, porcentajes and supuestos importantes.

Texto:
"""${text || ''}"""
`;

  const installedModels = await getInstalledOllamaModels(endpoint);
  const resolvedModel = findBestOllamaModel(model || 'qwen3.5:4b-mlx', installedModels);

  let prov = primaryProvider || 'ollama';
  if (resolvedModel.includes('gemini')) prov = 'gemini';
  else if (resolvedModel.includes('gpt')) prov = 'openai';
  else if (resolvedModel.includes('mistral-large')) prov = 'mistral';
  else if (resolvedModel.includes('llama-3.3-70b')) prov = 'groq';
  else if (resolvedModel.includes('nvidia') || resolvedModel.includes('google/gemma')) prov = 'nvidia';

  if (prov !== 'ollama' && prov !== 'lmstudio') {
    const out = await callAiProvider({ provider: prov, apiKey, groqKey, nvidiaKey, endpoint, model: resolvedModel }, prompt, false);
    return (out || '').trim();
  }

  const localModels = [
    resolvedModel,
    'qwen3.5:4b-mlx',
    'nemotron-3-nano:4b',
    'qwen3.5:2b-mlx'
  ];

  // Filtrar duplicados y quedarse con los instalados si es posible
  const uniqueModels = [...new Set(localModels)];
  const activeModels = installedModels.length > 0 
    ? uniqueModels.filter(m => installedModels.includes(m))
    : uniqueModels;

  let lastError = null;
  for (const localModel of (activeModels.length > 0 ? activeModels : uniqueModels)) {
    try {
      const pConfig = { provider: prov, endpoint: prov === 'lmstudio' ? lmStudioEndpoint : endpoint, model: localModel };
      const out = await callAiProvider(pConfig, prompt, false);
      return (out || '').trim();
    } catch (error) {
      lastError = error;
      console.warn(`summarizeText falló en ${prov} con modelo ${localModel}: ${error.message}`);
    }
  }

  throw new Error(lastError?.message || 'No se pudo resumir el texto. Verifique el runtime MLX y los modelos de Ollama locales.');
}

// ─────────────────────────────────────────────────────────────────────────
// Refactorizar campo con comentarios de retroalimentación
// ─────────────────────────────────────────────────────────────────────────
export async function refactorFieldWithComments(config, { fieldLabel, currentValue, comments, planData }) {
  const { primaryProvider, apiKey, groqKey, nvidiaKey, lmStudioEndpoint, endpoint, model } = config || {};

  const companyName = planData?.config?.brandKit?.companyName
    ? `Proyecto/Empresa: ${planData.config.brandKit.companyName}\n`
    : '';

  const semillaContext = planData?.semilla
    ? `Contexto del emprendedor (semilla):\n${JSON.stringify(planData.semilla, null, 2)}\n`
    : '';

  const commentsList = comments && Array.isArray(comments)
    ? comments.map((c, i) => `${i + 1}. [${c.author || 'Usuario'}]: ${c.text}`).join('\n')
    : 'No hay comentarios especificados.';

  const prompt = `
Eres un consultor de negocios y estratega corporativo senior redactando un Plan de Negocios profesional.
Se te ha pedido corregir y refactorizar el contenido de un campo basándote en comentarios o notas de corrección del usuario.

Contexto del proyecto/empresa:
${companyName}
${semillaContext}

Campo a corregir: "${fieldLabel}"

Texto actual del campo:
"""
${currentValue || '(Vacío)'}
"""

Notas de corrección y comentarios del usuario (SÍGUELOS AL PIE DE LA LETRA):
${commentsList}

TAREA:
Reescribe el texto actual incorporando todas las correcciones, aclaraciones y mejoras solicitadas en las notas anteriores.
Mantén el mismo nivel de detalle técnico, estilo ejecutivo, formal y riguroso.
Devuelve únicamente el texto corregido final en formato Markdown. No incluyas explicaciones, saludos ni comentarios adicionales fuera del texto de reemplazo.
`;

  const installedModels = await getInstalledOllamaModels(endpoint);
  const resolvedModel = findBestOllamaModel(model || 'qwen3.5:4b-mlx', installedModels);

  let prov = primaryProvider || 'ollama';
  if (resolvedModel.includes('gemini')) prov = 'gemini';
  else if (resolvedModel.includes('gpt')) prov = 'openai';
  else if (resolvedModel.includes('mistral-large')) prov = 'mistral';
  else if (resolvedModel.includes('llama-3.3-70b')) prov = 'groq';
  else if (resolvedModel.includes('nvidia') || resolvedModel.includes('google/gemma')) prov = 'nvidia';

  if (prov !== 'ollama' && prov !== 'lmstudio') {
    const text = await callAiProvider({ provider: prov, apiKey, groqKey, nvidiaKey, endpoint, model: resolvedModel }, prompt, false);
    return (text || '').trim();
  }

  const localModels = [
    resolvedModel,
    'qwen3.5:4b-mlx',
    'nemotron-3-nano:4b',
    'qwen3.5:2b-mlx'
  ];

  const uniqueModels = [...new Set(localModels)];
  const activeModels = installedModels.length > 0 
    ? uniqueModels.filter(m => installedModels.includes(m))
    : uniqueModels;

  let lastError = null;
  for (const localModel of (activeModels.length > 0 ? activeModels : uniqueModels)) {
    try {
      const pConfig = { provider: prov, endpoint: prov === 'lmstudio' ? lmStudioEndpoint : endpoint, model: localModel };
      const text = await callAiProvider(pConfig, prompt, false);
      return (text || '').trim();
    } catch (error) {
      lastError = error;
      console.warn(`refactorFieldWithComments falló en ${prov} con modelo ${localModel}: ${error.message}`);
    }
  }

  throw new Error(lastError?.message || 'No se pudo refactorizar el campo con comentarios. Verifique el runtime MLX y los modelos de Ollama locales.');
}


// ─────────────────────────────────────────────────────────────────────────
// Funciones del módulo Anteproyecto (Fase 0)
// ─────────────────────────────────────────────────────────────────────────

export async function extractSeedFromText(config, rawText) {
  const { primaryProvider, apiKey, groqKey, nvidiaKey, lmStudioEndpoint, endpoint, model } = config || {};
  const t0 = Date.now();
  
  const termLog = async (type, message, provider = '') => {
    try {
      const apiBase = getApiBase();
      await fetch(`${apiBase}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          module: 'Semilla',
          message,
          provider,
          elapsed: Date.now() - t0,
          projectId: config?.projectId || ''
        })
      });
    } catch {}
  };

  await termLog({ type: 'start', message: 'Iniciando estructuración de tu idea...', provider: primaryProvider || 'groq', phase: 'seed_init', visual: { icon: '🌱', color: '#10b981' } });

  const prompt = `
Eres un analista de negocios experto. El usuario ha narrado libremente la idea de su negocio (Brain Dump).
Tu tarea es extraer de ese texto la información clave y estructurarla en el siguiente formato JSON.
No inventes información, si algo no se menciona déjalo vacío o infiérelo muy levemente si es obvio.

Texto del usuario:
"""
${rawText}
"""

Extrae y devuelve ÚNICAMENTE un objeto JSON válido con estas claves (sin bloques de código markdown, solo el JSON raw):
{
  "nombre_proyecto": "Nombre del proyecto",
  "problema": "El problema a resolver",
  "solucion": "La propuesta de valor / solución",
  "mercado_objetivo": "Público objetivo",
  "modelo_ingresos": "Cómo se monetiza",
  "ventaja_injusta": "Ventaja competitiva",
  "cobertura": "Ubicación o alcance geográfico, por ejemplo la ciudad de operación o indicar 'Es en la Nube / Digital' si es una plataforma en línea"
}
`;

  const installedModels = await getInstalledOllamaModels(endpoint);
  const { provider: prov, model: finalModel } = resolveProviderModel({ primaryProvider, model, installedModels });
  
  try {
    await termLog({ type: 'thinking', message: `Analizando el texto con la Mesa de Expertos (${finalModel})...`, provider: prov, phase: 'seed_analysis', visual: { icon: '🔬', color: '#8b5cf6' } });
    const text = await callAiProvider({ provider: prov, apiKey, groqKey, nvidiaKey, openrouterKey: config?.openrouterKey, endpoint: prov === 'lmstudio' ? lmStudioEndpoint : endpoint, model: finalModel }, prompt, false);

    // [FDD] Limpieza robusta de la respuesta:
    // 1. Eliminar bloques <think>...</think> que devuelven modelos de razonamiento (compound-mini, deepseek-r1)
    // 2. Eliminar bloques de código markdown
    // 3. Extraer el primer objeto JSON válido con regex
    let cleaned = String(text || '')
      .replace(/<think>[\s\S]*?<\/think>/gi, '')  // eliminar think tags
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    // Intentar JSON.parse directo primero
    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      // Extracción robusta: buscar el primer bloque {...} válido
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
        } catch (innerErr) {
          // Último intento: quitar caracteres de control
          const ultraClean = jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, ' ');
          result = JSON.parse(ultraClean);
        }
      } else {
        throw new Error('No se encontró un JSON válido en la respuesta del modelo');
      }
    }

    await termLog({ type: 'success', message: '✓ Idea estructurada con éxito.', provider: prov, phase: 'complete', visual: { icon: '✅', color: '#10b981' } });
    return result;
  } catch (error) {
    console.error("Error al extraer semilla:", error);

    // Fallback: intentar con OpenRouter si hay key disponible
    const openrouterKey = config?.openrouterKey || '';
    if (openrouterKey && prov !== 'openrouter') {
      try {
        await termLog({ type: 'warning', message: 'Reintentando con OpenRouter (Nemotron 3.5)...', provider: 'openrouter', phase: 'fallback_openrouter', visual: { icon: '☁️', color: '#818cf8' } });
        const textOr = await callAiProvider(
          { provider: 'openrouter', openrouterKey, apiKey: openrouterKey, model: 'nvidia/nemotron-3.5-lightning:free', endpoint },
          prompt, false
        );
        let cleanedOr = String(textOr || '')
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/```json/gi, '').replace(/```/g, '').trim();
        const matchOr = cleanedOr.match(/\{[\s\S]*\}/);
        const resultOr = JSON.parse(matchOr ? matchOr[0] : cleanedOr);
        await termLog({ type: 'success', message: '✓ Idea estructurada (OpenRouter fallback).', provider: 'openrouter', phase: 'complete', visual: { icon: '✅', color: '#10b981' } });
        return resultOr;
      } catch (orErr) {
        await termLog({ type: 'error', message: `Fallback OpenRouter también falló: ${orErr.message}`, provider: 'openrouter', phase: 'fallback_failed', visual: { icon: '❌', color: '#ef4444' } });
      }
    }

    // Fallback con Groq Qwen si no es el proveedor actual
    const gKey = config?.groqKey || groqKey;
    if (gKey && prov !== 'groq') {
      try {
        await termLog({ type: 'warning', message: 'Reintentando con Groq (Qwen 3.6 27B)...', provider: 'groq', phase: 'fallback_groq', visual: { icon: '⚡', color: '#f59e0b' } });
        const textG = await callAiProvider(
          { provider: 'groq', groqKey: gKey, model: 'qwen/qwen3.6-27b', endpoint },
          prompt, false
        );
        let cleanedG = String(textG || '')
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/```json/gi, '').replace(/```/g, '').trim();
        const matchG = cleanedG.match(/\{[\s\S]*\}/);
        const resultG = JSON.parse(matchG ? matchG[0] : cleanedG);
        await termLog({ type: 'success', message: '✓ Idea estructurada (Groq fallback).', provider: 'groq', phase: 'complete', visual: { icon: '✅', color: '#10b981' } });
        return resultG;
      } catch (gErr) {
        await termLog({ type: 'error', message: `Fallback Groq también falló: ${gErr.message}`, provider: 'groq', phase: 'fallback_failed', visual: { icon: '❌', color: '#ef4444' } });
      }
    }

    await termLog({ type: 'error', message: `Error al estructurar el texto: ${error.message}`, provider: prov, phase: 'total_failure', visual: { icon: '💥', color: '#ef4444' } });
    throw new Error(`No se pudo estructurar el texto: ${error.message || 'Intenta de nuevo.'}`, { cause: error });
  }
}


export async function askFieldDoubt(config, fieldName, userText, projectSeed) {
  const { primaryProvider, apiKey, groqKey, nvidiaKey, lmStudioEndpoint, endpoint, model } = config || {};
  
  const seedContext = projectSeed ? JSON.stringify(projectSeed, null, 2) : 'No especificado aún.';
  
  const prompt = `
Eres un amable mentor de negocios. El usuario está llenando el campo "${fieldName}" de su plan de negocios y tiene la siguiente duda o comentario:
"${userText}"

Contexto actual de su proyecto (Semilla):
${seedContext}

Responde de forma clara, directa, pedagógica y alentadora. Usa un tono conversacional y dale ejemplos concretos aplicados a su idea de negocio si es posible.
`;

  const installedModels = await getInstalledOllamaModels(endpoint);
  const { provider: prov, model: finalModel } = resolveProviderModel({ primaryProvider, model, installedModels });
  
  try {
    const text = await callAiProvider({ provider: prov, apiKey, groqKey, nvidiaKey, endpoint: prov === 'lmstudio' ? lmStudioEndpoint : endpoint, model: finalModel }, prompt, false);
    return text.trim();
  } catch (error) {
    console.error("Error en askFieldDoubt:", error);
    return "Lo siento, tuve un problema al procesar tu duda. Por favor intenta de nuevo.";
  }
}
