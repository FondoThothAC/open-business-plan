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
    const res = await fetch(`${endpoint || 'http://localhost:11434'}/api/tags`);
    if (res.ok) {
      const data = await res.json();
      return data && data.models ? data.models.map(m => m.name) : [];
    }
  } catch (e) {
    console.warn('No se pudieron obtener los modelos de Ollama:', e);
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

// Modelos por defecto de la nube por proveedor (para resolver configs incoherentes)
const CLOUD_DEFAULT_MODELS = {
  gemini: 'gemini-1.5-flash',
  openai: 'gpt-4o',
  groq: 'llama-3.3-70b-versatile',
  mistral: 'mistral-large-latest',
  nvidia: 'nvidia/llama-3.1-nemotron-70b-instruct',
};

// Resuelve un par (proveedor, modelo) coherente: nunca envía un modelo local a la nube
function resolveProviderModel({ primaryProvider, model, installedModels = [] }) {
  let prov = primaryProvider || 'ollama';
  const resolved = String(model || '').trim();

  // Detectar proveedor por el nombre del modelo si es explícitamente cloud
  if (resolved.includes('gemini')) prov = 'gemini';
  else if (resolved.includes('gpt')) prov = 'openai';
  else if (resolved.includes('mistral-large')) prov = 'mistral';
  else if (resolved.includes('nvidia') || resolved.includes('google/gemma')) prov = 'nvidia';
  else if (resolved.includes('llama-3.3-70b')) prov = 'groq';

  // Proveedores locales: resolver contra los modelos instalados de Ollama
  if (prov === 'ollama' || prov === 'lmstudio') {
    const localModel = findBestOllamaModel(model || 'nemotron', installedModels);
    return { provider: prov, model: localModel };
  }

  // Proveedores de nube: si el modelo configurado no es cloud, usar el default del proveedor
  const isCloudModel = /gemini|gpt|mistral|nvidia|llama-3\.3|:cloud/i.test(resolved);
  const finalModel = (isCloudModel && resolved) ? resolved : (CLOUD_DEFAULT_MODELS[prov] || resolved || 'gemini-1.5-flash');
  return { provider: prov, model: finalModel };
}

// Retry automático por límite de tokens (HTTP 429 / rate-limit)
// Espera el tiempo indicado por Retry-After o backoff exponencial.
async function fetchWithRetry(url, options = {}, { maxRetries = 8, baseDelay = 2000 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        const retryAfter = response.headers?.get('retry-after');
        const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.min(baseDelay * Math.pow(2, attempt), 60000);
        const provider = options.headers?.authorization?.includes('groq') ? 'Groq'
          : url.includes('googleapis') ? 'Gemini'
          : url.includes('nvidia') ? 'NVIDIA'
          : url.includes('openai') ? 'OpenAI'
          : url.includes('mistral') ? 'Mistral' : 'Cloud';
        console.warn(`[fetchWithRetry] 429 ${provider}: esperando ${waitMs}ms (intento ${attempt + 1}/${maxRetries + 1})...`);
        if (activeTermLog) {
          activeTermLog('thinking', `⏳ Límite de tokens de ${provider}: esperando ${Math.round(waitMs / 1000)}s para reintentar... (${attempt + 1}/${maxRetries + 1})`, provider.toLowerCase());
        }
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      return response;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const waitMs = Math.min(baseDelay * Math.pow(2, attempt), 60000);
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

// Variable a nivel de módulo para capturar el feed de progreso activo
let activeTermLog = null;

// ─────────────────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL: generateModuleContent
// [FDD] Feature F01 + F11: Mesa de Expertos con niveles de profundidad
// ─────────────────────────────────────────────────────────────────────────
export async function generateModuleContent(config, currentModule, allPlanData) {
  const {
    primaryProvider, _secondaryProvider,
    apiKey, groqKey, nvidiaKey, lmStudioEndpoint, endpoint,
    model, depth = 1,           // depth: 1=rápido, 2=pro, 3=profundo
    agentModels = {},           // sobreescritura de modelos por rol desde config
  } = config;

  const t0 = Date.now();

  // [EDD] Logger de eventos al ActivityFeed (silent fail si backend caído)
  const termLog = async (type, message, provider = '') => {
    try {
      const rawName = allPlanData.semilla?.negocio?.nombre_marca || allPlanData.config?.brandKit?.companyName || '';
      const projectId = allPlanData.config?.projectId || (rawName ? rawName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : '');
      const projectType = allPlanData.config?.projectType === 'social_bid' ? 'social' : 'negocios';

      await fetch('http://localhost:3001/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type, module: currentModule.title,
          message, provider, elapsed: Date.now() - t0,
          projectId, projectType
        })
      });
    } catch {}
  };

  // Registrar el logger actual en el módulo para que callAiProvider pueda emitir pensamientos (thinking)
  activeTermLog = termLog;

  // Contexto global del plan (toda la información disponible)
  const semillaContext = allPlanData.semilla
    ? `\nENTREVISTA CON EL EMPRENDEDOR:\n${JSON.stringify(allPlanData.semilla, null, 2)}\n`
    : '';

  const documentsContext = (allPlanData.config?.documents || []).length > 0
    ? `\nDOCUMENTOS DE REFERENCIA:\n${allPlanData.config.documents.map(d => d.text).join('\n---\n').substring(0, 5000)}\n`
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
Eres un miembro de una "Mesa de Expertos" en estrategia empresarial de alto nivel.
Tu objetivo es redactar una sección del Plan de Negocios con rigor académico y ejecutivo.
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

  // Resuelve el modelo de un agente (config usuario > default nivel)
  const resolveModel = (role, levelConfig) => {
    const raw = agentModels[role]?.model || levelConfig[role]?.model || model || 'qwen3.5:4b-mlx';
    return findBestOllamaModel(raw, installedModels);
  };

  // Helper: construye config de proveedor para una fase
  const makeProviderConfig = (agentModel) => {
    let prov = primaryProvider || 'ollama';
    // Auto-detect provider based on model name if it's explicitly a cloud model
    if (agentModel.includes('gemini')) prov = 'gemini';
    else if (agentModel.includes('gpt')) prov = 'openai';
    else if (agentModel.includes('mistral-large')) prov = 'mistral';
    else if (agentModel.includes('llama-3.3-70b')) prov = 'groq';
    else if (agentModel.includes('nvidia') || agentModel.includes('google/gemma')) prov = 'nvidia';

    if (prov === 'lmstudio') return { provider: 'lmstudio', endpoint: lmStudioEndpoint, model: agentModel };
    return { provider: prov, apiKey, groqKey, nvidiaKey, endpoint, model: agentModel };
  };

  // ─── Orquestadores por nivel ───────────────────────────────────────────

  // NIVEL 1: Rápido — 2 fases, 1 modelo, sin swap
  const runFast = async (fallbackProvider) => {
    const agentCfg = DEFAULT_AGENT_CONFIG.fast;
    const analista = resolveModel('analista', agentCfg);
    const redactor = resolveModel('redactor', agentCfg);

    await termLog('thinking', `⚡ Fase 1/2: Analista generando borrador (${analista})...`, 'ollama');
    const draft = await callAiProvider(
      fallbackProvider || makeProviderConfig(analista),
      `${systemContext}\n\nTAREA: Genera un borrador profesional y detallado SOLO para los campos indicados. Devuelve JSON con exactamente las claves pedidas.`,
      true,
      expectedKeys
    );

    await termLog('thinking', `⚡ Fase 2/2: Redactor finalizando (${redactor})...`, 'ollama');
    const result = await callAiProvider(
      fallbackProvider || makeProviderConfig(redactor),
      `${systemContext}\n\nBorrador:\n${JSON.stringify(draft)}\n\nTAREA: Mejora la calidad y el tono ejecutivo del borrador. Devuelve SOLO el JSON final con las claves: ${(currentModule.fields || []).map(f => f.key).join(', ')}`,
      true,
      expectedKeys
    );

    await termLog('success', '✓ Módulo completado (nivel rápido).', 'ollama');
    return result;
  };

  // NIVEL 2: Pro — 3 fases, swap entre analista y redactor
  // [TDD] Contrato: retorna JSON con todas las claves de currentModule.fields
  const runPro = async (fallbackProvider) => {
    const agentCfg = DEFAULT_AGENT_CONFIG.pro;
    const analista = resolveModel('analista', agentCfg);
    const critico  = resolveModel('critico',  agentCfg);
    const redactor = resolveModel('redactor', agentCfg);

    await termLog('thinking', `🧠 Fase 1/3: Analista redactando borrador (${analista})...`, analista);
    const draft = await callAiProvider(
      fallbackProvider || makeProviderConfig(analista),
      `${systemContext}\n\nTAREA: Genera un borrador profesional y exhaustivo. El plan final es de 100 páginas. Devuelve JSON con SOLO las claves pedidas.`,
      true,
      expectedKeys
    );

    await termLog('thinking', `🧠 Fase 2/3: Crítico revisando (${critico})...`, critico);
    const critique = await callAiProvider(
      fallbackProvider || makeProviderConfig(critico),
      `${systemContext}\n\nBorrador:\n${JSON.stringify(draft)}\n\nTAREA: Actúa como inversor crítico. ¿Qué falta? ¿Qué es débil o impreciso? Sé breve y directo. No devuelvas JSON.`,
      false
    );

    await termLog('thinking', `🧠 Fase 3/3: Redactor sintetizando versión final (${redactor})...`, redactor);
    const result = await callAiProvider(
      fallbackProvider || makeProviderConfig(redactor),
      `${systemContext}\n\nBorrador:\n${JSON.stringify(draft)}\n\nCrítica:\n${critique}\n\nTAREA: Integra las mejoras. Genera la versión final con tono ejecutivo. DEVUELVE SOLO JSON con claves: ${(currentModule.fields || []).map(f => f.key).join(', ')}`,
      true,
      expectedKeys
    );

    await termLog('success', '✓ Módulo completado (nivel pro).', redactor);
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

    await termLog('thinking', `🔬 Fase 1/5: Estratega definiendo marco (${estratega})...`, estratega);
    const marco = await callAiProvider(mkCfg(estratega),
      `${systemContext}\n\nTAREA: Define el marco estratégico y los puntos clave que DEBEN aparecer en "${currentModule.title}". No escribas el contenido final, solo la estructura. Responde en texto libre.`,
      false
    );

    await termLog('thinking', `🔬 Fase 2/5: Analista desarrollando contenido (${analista})...`, analista);
    const draft = await callAiProvider(mkCfg(analista),
      `${systemContext}\n\nMarco estratégico:\n${marco}\n\nTAREA: Desarrolla el contenido completo basándote en el marco. Sé exhaustivo. Devuelve JSON con las claves pedidas.`,
      true,
      expectedKeys
    );

    await termLog('thinking', `🔬 Fase 3/5: Devil's Advocate buscando debilidades (${abogadoDiablo})...`, abogadoDiablo);
    const devilCritique = await callAiProvider(mkCfg(abogadoDiablo),
      `${systemContext}\n\nContenido desarrollado:\n${JSON.stringify(draft)}\n\nTAREA: Eres un escéptico. ¿Cuáles son los 3 argumentos más débiles? ¿Qué suposiciones son peligrosas? Responde en texto libre.`,
      false
    );

    await termLog('thinking', `🔬 Fase 4/5: Crítico financiero validando (${critico})...`, critico);
    const financialCritique = await callAiProvider(mkCfg(critico),
      `${systemContext}\n\nContenido:\n${JSON.stringify(draft)}\n\nCrítica previa:\n${devilCritique}\n\nTAREA: Valida la solidez financiera y estratégica. ¿Es viable? ¿Qué datos faltan? Texto libre.`,
      false
    );

    await termLog('thinking', `🔬 Fase 5/5: Redactor senior sintetizando (${redactor})...`, redactor);
    const result = await callAiProvider(mkCfg(redactor),
      `${systemContext}\n\nBorrador:\n${JSON.stringify(draft)}\n\nCríticas recibidas:\n${devilCritique}\n\n${financialCritique}\n\nTAREA: Genera la versión FINAL definitiva integrando todas las perspectivas. Tono ejecutivo, académico y riguroso. DEVUELVE SOLO JSON con claves: ${(currentModule.fields || []).map(f => f.key).join(', ')}`,
      true,
      expectedKeys
    );

    await termLog('success', '✓ Módulo completado (nivel profundo).', redactor);
    return result;
  };

  // NIVEL 4: Industrial — 9 agentes. El "Gold Standard" de la industria.
  const runIndustrial = async (fallbackProvider) => {
    const agentCfg = DEFAULT_AGENT_CONFIG.industrial;
    const mkCfg = (role) => fallbackProvider || makeProviderConfig(resolveModel(role, agentCfg));

    await termLog('thinking', '🏭 Fase 1/9: Estratega Maestro (Marco)', 'estratega');
    const marco = await callAiProvider(mkCfg('estratega'), `${systemContext}\n\nDefine el marco estratégico maestro para este módulo.`, false);

    await termLog('thinking', '🏭 Fase 2/9: Especialista en Mercado', 'mercado');
    const marketIn = await callAiProvider(mkCfg('mercado'), `${systemContext}\n\nMarco: ${marco}\n\nDesarrolla la perspectiva de mercado para este módulo.`, false);

    await termLog('thinking', '🏭 Fase 3/9: Analista de Operaciones', 'operaciones');
    const opsIn = await callAiProvider(mkCfg('operaciones'), `${systemContext}\n\nMarco: ${marco}\n\nDesarrolla la perspectiva operativa.`, false);

    await termLog('thinking', '🏭 Fase 4/9: Especialista Financiero', 'financiero');
    const finIn = await callAiProvider(mkCfg('financiero'), `${systemContext}\n\nMarco: ${marco}\n\nDesarrolla la perspectiva financiera y de costos.`, false);

    await termLog('thinking', '🏭 Fase 5/9: Devil\'s Advocate', 'abogadoDiablo');
    const critique = await callAiProvider(mkCfg('abogadoDiablo'), `${systemContext}\n\nContenido: ${JSON.stringify({marketIn, opsIn, finIn})}\n\nEncuentra debilidades críticas.`, false);

    await termLog('thinking', '🏭 Fase 6/9: Revisor de Coherencia', 'coherencia');
    const coherence = await callAiProvider(mkCfg('coherencia'), `${systemContext}\n\nValida la coherencia entre mercado, operaciones and finanzas.`, false);

    await termLog('thinking', '🏭 Fase 7/9: Verificador de Hechos', 'hallucination');
    const check = await callAiProvider(mkCfg('hallucination'), `Valida si hay alucinaciones o datos falsos en esto: ${JSON.stringify({marketIn, opsIn, finIn})}`, false);

    await termLog('thinking', '🏭 Fase 8/9: Redactor Final', 'redactor');
    const draft = await callAiProvider(mkCfg('redactor'), `${systemContext}\n\nCríticas: ${critique}\n\nCoherencia: ${coherence}\n\nHechos: ${check}\n\nGenera el borrador final integrado.`, false);

    await termLog('thinking', '🏭 Fase 9/9: Editor de Estilo', 'editor');
    const result = await callAiProvider(mkCfg('editor'), `${systemContext}\n\nBorrador: ${JSON.stringify(draft)}\n\nPulido final estilo académico/ejecutivo. DEVUELVE SOLO JSON.`, true, expectedKeys);

    await termLog('success', '✓ Módulo completado (NIVEL INDUSTRIAL).', 'editor');
    return result;
  };

  // ─── Selección de orquestador por nivel ────────────────────────────────
  const orchestrators = { 1: runFast, 2: runPro, 3: runDeep, 4: runIndustrial };
  const runChain = orchestrators[depth] || runFast;

  // ─── Ejecución con fallback inteligente ───────────────────────────────
  // [EDD] Primero intenta local (Ollama), luego pregunta antes de saltar a nube

  // Paso 1: Proveedor principal / modelos configurados
  try {
    const _resolvedPrimary = (primaryProvider === 'ollama' || primaryProvider === 'lmstudio') ? findBestOllamaModel(model || 'nemotron', installedModels) : model;
    await termLog('start', `Iniciando generación (nivel ${depth === 1 ? '⚡ Rápido' : depth === 2 ? '🧠 Pro' : depth === 3 ? '🔬 Profundo' : '🏭 Industrial'}) usando proveedor: ${primaryProvider}...`, primaryProvider);
    return await runChain(null); // null = usar modelos por rol configurados
  } catch (providerError) {
    await termLog('warning', `Proveedor primario falló: ${providerError.message.substring(0, 60)}`, primaryProvider);
  }

  // Paso 2: Probar modelos locales alternativos (filtrados por los instalados para no colgarse con los no instalados)
  // Priorizar MLX ('qwen3.5:4b-mlx') sobre GGUF en Mac
  const defaultFallbackOrder = ['qwen3.5:4b-mlx', 'nemotron-3-nano:4b', 'qwen3.5:2b-mlx', 'gemma4:e2b-mlx'];
  const fallbackLocalModels = defaultFallbackOrder.filter(m => installedModels.includes(m));
  
  // Si no hay modelos detectados pero tenemos los fallbacks, usar la lista predeterminada como último recurso
  const actualFallbacks = fallbackLocalModels.length > 0 ? fallbackLocalModels : defaultFallbackOrder;

  for (const altModel of actualFallbacks) {
    try {
      await termLog('info', `Intentando modelo local alternativo: ${altModel}`, 'ollama');
      const altConfig = makeProviderConfig(altModel);
      return await runChain(altConfig);
    } catch (altError) {
      await termLog('error', `Modelo alternativo ${altModel} falló: ${altError.message.substring(0, 50)}`, 'ollama');
    }
  }

  // Paso 2.5: Si local falló pero tenemos nvidiaKey, cambiar a NVIDIA NIM con Nemotron en la nube
  if (nvidiaKey) {
    try {
      await termLog('warning', `Modelos locales no disponibles. Iniciando fallback automático a NVIDIA NIM (Nemotron 70B)...`, 'nvidia');
      const nvidiaFallbackConfig = {
        provider: 'nvidia',
        nvidiaKey,
        apiKey,
        model: 'nvidia/llama-3.1-nemotron-70b-instruct',
        endpoint
      };
      return await runChain(nvidiaFallbackConfig);
    } catch (nvidiaError) {
      await termLog('error', `Fallback a NVIDIA NIM falló: ${nvidiaError.message.substring(0, 50)}`, 'nvidia');
    }
  }

  // Paso 2.6: Si tenemos groqKey, cambiar a Groq Llama 3.3 70B
  if (groqKey) {
    try {
      await termLog('warning', `Iniciando fallback automático a la nube con Groq (Llama 3.3 70B)...`, 'groq');
      const groqFallbackConfig = {
        provider: 'groq',
        groqKey,
        apiKey,
        model: 'llama-3.3-70b-versatile',
        endpoint
      };
      return await runChain(groqFallbackConfig);
    } catch (groqError) {
      await termLog('error', `Fallback a Groq falló: ${groqError.message.substring(0, 50)}`, 'groq');
    }
  }

  // Paso 2.7: Si tenemos apiKey (Google Gemini / OpenAI)
  if (apiKey) {
    try {
      await termLog('warning', `Iniciando fallback automático a Google Gemini Cloud (1.5 Flash)...`, 'gemini');
      const geminiFallbackConfig = {
        provider: 'gemini',
        apiKey,
        model: 'gemini-1.5-flash',
        endpoint
      };
      return await runChain(geminiFallbackConfig);
    } catch (geminiError) {
      await termLog('error', `Fallback a Gemini falló: ${geminiError.message.substring(0, 50)}`, 'gemini');
    }
  }

  // Paso 3: Si todos los locales y la nube fallan, indicar necesidad de iniciar Ollama o configurar una API key
  await termLog('error', 'Todos los modelos locales (Ollama) y fallbacks de nube configurados fallaron o no están disponibles.', 'system');
  throw new Error('Generación abortada: Modelos locales y de respaldo no disponibles. Inicia Ollama o configura una API Key de respaldo (Gemini, Groq o NVIDIA).');
}

// ─────────────────────────────────────────────────────────────────────────
// Genera contenido para UN SOLO campo (Expert Panel)
// ─────────────────────────────────────────────────────────────────────────
export async function generateSingleField(config, fieldKey, fieldLabel, fieldGuide, allPlanData) {
  const { primaryProvider, apiKey, groqKey, nvidiaKey, lmStudioEndpoint, endpoint, model } = config;

  const semillaContext = allPlanData.semilla
    ? `Entrevista con el emprendedor:\n${JSON.stringify(allPlanData.semilla, null, 2)}\n`
    : '';

  const prompt = `
Eres un experto en planes de negocio profesionales.
${semillaContext}
Contexto del plan actual:
${cleanPlanDataForAi(allPlanData, primaryProvider === 'ollama' || primaryProvider === 'lmstudio')}

TAREA: Genera contenido SOLO para el campo "${fieldLabel}".
Guía: ${fieldGuide.desc || ''}
Ejemplo: ${fieldGuide.ejemplo || ''}

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
export async function callAiProvider(config, prompt, expectJson = true, expectedKeys = [], onThink = null) {
  const { provider, apiKey, groqKey, nvidiaKey, endpoint, model } = config;
  let text;

  if (provider === 'gemini')  text = await callGemini(apiKey, model, prompt);
  else if (provider === 'groq')    text = await callGroq(groqKey || apiKey, model, prompt, expectJson);
  else if (provider === 'nvidia')  text = await callNvidia(nvidiaKey || apiKey, model, prompt);
  else if (provider === 'ollama')  text = await callOllama(endpoint, model, prompt, expectJson);
  else if (provider === 'lmstudio')text = await callLmStudio(endpoint, model, prompt, expectJson, apiKey);
  else if (provider === 'mistral') text = await callMistral(apiKey, model, prompt);
  else if (provider === 'openai')  text = await callOpenAI(apiKey, model, prompt, expectJson);
  else throw new Error(`Proveedor ${provider} no soportado`);

  if (typeof text === 'string') {
    const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>/i);
    if (thinkMatch && thinkMatch[1]) {
      const thinkingText = thinkMatch[1].trim();
      const logger = onThink || activeTermLog;
      if (logger) {
        logger('thinking', `🧠 [Razonamiento]: ${thinkingText}`, provider || 'ollama');
      }
      text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    }
  }

  return expectJson ? parseAIResponse(text, expectedKeys) : text;
}

async function callOllama(endpoint, model, prompt, expectJson) {
  // [SDD] Ver docs/Operations_Integration_SDD.md — Ollama hace swap automático en VRAM
  // Mac: Metal unifica RAM/VRAM, sin swap. Windows/Linux: swap ~2-4s entre modelos.
  const url = `${endpoint || 'http://localhost:11434'}/api/generate`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'qwen3.5:4b-mlx',
      prompt,
      stream: false,
      format: expectJson ? 'json' : undefined,
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates[0].content.parts[0].text;
}

async function fetchWithProxy(url, options = {}) {
  if (typeof window !== 'undefined') {
    const proxyUrl = 'http://localhost:3001/api/ai/proxy';
    const body = {
      url,
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body ? JSON.parse(options.body) : undefined
    };
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return response;
  }
  return fetch(url, options);
}

async function callGroq(apiKey, model, prompt, expectJson) {
  const response = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model || 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: expectJson ? { type: 'json_object' } : undefined
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}

async function callNvidia(apiKey, model, prompt) {
  const response = await fetchWithRetry('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model || 'nvidia/llama-3.1-nemotron-70b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096
    })
  });
  const data = await response.json();
  if (data.error || data.detail) throw new Error(data.error?.message || data.detail?.[0]?.msg || 'NVIDIA API Error');
  return data.choices[0].message.content;
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
  return data.choices[0].message.content;
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
      await fetch('http://localhost:3001/api/log', {
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

  await termLog('start', 'Iniciando estructuración de tu idea...', primaryProvider || 'ollama');

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
    await termLog('thinking', `Analizando el texto con la Mesa de Expertos (${finalModel})...`, prov);
    const text = await callAiProvider({ provider: prov, apiKey, groqKey, nvidiaKey, endpoint: prov === 'lmstudio' ? lmStudioEndpoint : endpoint, model: finalModel }, prompt, false);
    
    // Attempt to parse JSON safely
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned);
    await termLog('success', '✓ Idea estructurada con éxito.', prov);
    return result;
  } catch (error) {
    console.error("Error al extraer semilla:", error);
    await termLog('error', `Error al estructurar el texto: ${error.message}`, prov);
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
