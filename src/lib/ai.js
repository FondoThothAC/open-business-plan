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
    analista:  { model: 'nemotron', role: 'Analista Estratégico' },
    redactor:  { model: 'nemotron', role: 'Redactor Ejecutivo' },
  },
  // Nivel 2 — Pro (swap opcional entre analista y redactor)
  pro: {
    analista:  { model: 'nemotron', role: 'Analista Estratégico' },
    critico:   { model: 'nemotron', role: 'Crítico Financiero' },
    redactor:  { model: 'nemotron', role: 'Redactor Senior' },
  },
  // Nivel 3 — Profundo (swap entre 3 modelos especializados)
  deep: {
    estratega:  { model: 'nemotron', role: 'Estratega de Negocio' },
    analista:   { model: 'nemotron', role: 'Analista de Datos' },
    abogadoDiablo: { model: 'nemotron', role: "Devil's Advocate" },
    critico:    { model: 'nemotron', role: 'Crítico Financiero' },
    redactor:   { model: 'nemotron', role: 'Redactor Ejecutivo Final' },
  },
  // Nivel 4 — Industrial : 9 agentes. ~20-30 min
  industrial: {
    estratega:      { model: 'nemotron', role: 'Estratega Maestro' },
    mercado:        { model: 'nemotron', role: 'Especialista en Mercado' },
    operaciones:    { model: 'nemotron', role: 'Analista de Operaciones' },
    financiero:     { model: 'nemotron',   role: 'Especialista Financiero' },
    abogadoDiablo:  { model: 'nemotron', role: "Devil's Advocate" },
    coherencia:     { model: 'nemotron', role: 'Revisor de Coherencia Global' },
    hallucination:  { model: 'nemotron', role: 'Verificador de Hechos/Alucinaciones' },
    redactor:       { model: 'nemotron', role: 'Redactor Ejecutivo Final' },
    editor:         { model: 'nemotron', role: 'Editor de Estilo Académico' },
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
  if (!installedModels || installedModels.length === 0) {
    if (requestedModel === 'nemotron') return 'nemotron-3-nano:4b';
    return requestedModel;
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
  
  return requestedModel;
}

// ─────────────────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL: generateModuleContent
// [FDD] Feature F01 + F11: Mesa de Expertos con niveles de profundidad
// ─────────────────────────────────────────────────────────────────────────
// Helper: clean plan data to avoid bloating AI context with large calculated matrices or base64 files
function cleanPlanDataForAi(allPlanData) {
  if (!allPlanData) return '';
  try {
    const cleanData = JSON.parse(JSON.stringify(allPlanData));
    
    // Delete huge calculated corridas if present
    if (cleanData.organizacion) {
      if (cleanData.organizacion.estados_financieros) {
        delete cleanData.organizacion.estados_financieros.corrida_automatica;
      }
      if (cleanData.organizacion.rentabilidad) {
        delete cleanData.organizacion.rentabilidad.corrida_automatica;
      }
    }
    
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
    primaryProvider, secondaryProvider,
    apiKey, groqKey, endpoint,
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
    } catch (_) {}
  };

  // Contexto global del plan (toda la información disponible)
  const semillaContext = allPlanData.semilla
    ? `\nENTREVISTA CON EL EMPRENDEDOR:\n${JSON.stringify(allPlanData.semilla, null, 2)}\n`
    : '';

  const documentsContext = (allPlanData.config?.documents || []).length > 0
    ? `\nDOCUMENTOS DE REFERENCIA:\n${allPlanData.config.documents.map(d => d.text).join('\n---\n').substring(0, 5000)}\n`
    : '';

  const planContext = cleanPlanDataForAi(allPlanData);

  const systemContext = `
Eres un miembro de una "Mesa de Expertos" en estrategia empresarial de alto nivel.
Tu objetivo es redactar una sección del Plan de Negocios con rigor académico y ejecutivo.
${semillaContext}
${documentsContext}
Estado actual COMPLETO del plan (contexto de referencia):
${planContext}

Módulo a redactar: "${currentModule.title}"
Descripción: ${currentModule.description}
Campos a generar (SOLO estos): ${(currentModule.fields || []).map(f => f.key).join(', ')}
`;

  // Fetch installed models to resolve name matches
  const installedModels = await getInstalledOllamaModels(endpoint);

  // Resuelve el modelo de un agente (config usuario > default nivel)
  const resolveModel = (role, levelConfig) => {
    const raw = agentModels[role]?.model || levelConfig[role]?.model || model || 'gemma4:e2b-mlx';
    return findBestOllamaModel(raw, installedModels);
  };

  // Helper: construye config de proveedor para una fase
  const makeProviderConfig = (agentModel) => ({
    provider: 'ollama', endpoint, model: agentModel
  });

  // ─── Orquestadores por nivel ───────────────────────────────────────────

  // NIVEL 1: Rápido — 2 fases, 1 modelo, sin swap
  const runFast = async (fallbackProvider) => {
    const agentCfg = DEFAULT_AGENT_CONFIG.fast;
    const analista = resolveModel('analista', agentCfg);
    const redactor = resolveModel('redactor', agentCfg);

    await termLog('thinking', `⚡ Fase 1/2: Analista generando borrador (${analista})...`, 'ollama');
    const draft = await callAiProvider(
      fallbackProvider || makeProviderConfig(analista),
      `${systemContext}\n\nTAREA: Genera un borrador profesional y detallado SOLO para los campos indicados. Devuelve JSON con exactamente las claves pedidas.`
    );

    await termLog('thinking', `⚡ Fase 2/2: Redactor finalizando (${redactor})...`, 'ollama');
    const result = await callAiProvider(
      fallbackProvider || makeProviderConfig(redactor),
      `${systemContext}\n\nBorrador:\n${JSON.stringify(draft)}\n\nTAREA: Mejora la calidad y el tono ejecutivo del borrador. Devuelve SOLO el JSON final con las claves: ${(currentModule.fields || []).map(f => f.key).join(', ')}`
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
      `${systemContext}\n\nTAREA: Genera un borrador profesional y exhaustivo. El plan final es de 100 páginas. Devuelve JSON con SOLO las claves pedidas.`
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
      `${systemContext}\n\nBorrador:\n${JSON.stringify(draft)}\n\nCrítica:\n${critique}\n\nTAREA: Integra las mejoras. Genera la versión final con tono ejecutivo. DEVUELVE SOLO JSON con claves: ${(currentModule.fields || []).map(f => f.key).join(', ')}`
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
      `${systemContext}\n\nMarco estratégico:\n${marco}\n\nTAREA: Desarrolla el contenido completo basándote en el marco. Sé exhaustivo. Devuelve JSON con las claves pedidas.`
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
      `${systemContext}\n\nBorrador:\n${JSON.stringify(draft)}\n\nCríticas recibidas:\n${devilCritique}\n\n${financialCritique}\n\nTAREA: Genera la versión FINAL definitiva integrando todas las perspectivas. Tono ejecutivo, académico y riguroso. DEVUELVE SOLO JSON con claves: ${(currentModule.fields || []).map(f => f.key).join(', ')}`
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
    const marketIn = await callAiProvider(mkCfg('mercado'), `${systemContext}\n\nMarco: ${marco}\n\nDesarrolla la perspectiva de mercado para este módulo.`);

    await termLog('thinking', '🏭 Fase 3/9: Analista de Operaciones', 'operaciones');
    const opsIn = await callAiProvider(mkCfg('operaciones'), `${systemContext}\n\nMarco: ${marco}\n\nDesarrolla la perspectiva operativa.`);

    await termLog('thinking', '🏭 Fase 4/9: Especialista Financiero', 'financiero');
    const finIn = await callAiProvider(mkCfg('financiero'), `${systemContext}\n\nMarco: ${marco}\n\nDesarrolla la perspectiva financiera y de costos.`);

    await termLog('thinking', '🏭 Fase 5/9: Devil\'s Advocate', 'abogadoDiablo');
    const critique = await callAiProvider(mkCfg('abogadoDiablo'), `${systemContext}\n\nContenido: ${JSON.stringify({marketIn, opsIn, finIn})}\n\nEncuentra debilidades críticas.`, false);

    await termLog('thinking', '🏭 Fase 6/9: Revisor de Coherencia', 'coherencia');
    const coherence = await callAiProvider(mkCfg('coherencia'), `${systemContext}\n\nValida la coherencia entre mercado, operaciones and finanzas.`, false);

    await termLog('thinking', '🏭 Fase 7/9: Verificador de Hechos', 'hallucination');
    const check = await callAiProvider(mkCfg('hallucination'), `Valida si hay alucinaciones o datos falsos en esto: ${JSON.stringify({marketIn, opsIn, finIn})}`, false);

    await termLog('thinking', '🏭 Fase 8/9: Redactor Final', 'redactor');
    const draft = await callAiProvider(mkCfg('redactor'), `${systemContext}\n\nCríticas: ${critique}\n\nCoherencia: ${coherence}\n\nHechos: ${check}\n\nGenera el borrador final integrado.`);

    await termLog('thinking', '🏭 Fase 9/9: Editor de Estilo', 'editor');
    const result = await callAiProvider(mkCfg('editor'), `${systemContext}\n\nBorrador: ${JSON.stringify(draft)}\n\nPulido final estilo académico/ejecutivo. DEVUELVE SOLO JSON.`);

    await termLog('success', '✓ Módulo completado (NIVEL INDUSTRIAL).', 'editor');
    return result;
  };

  // ─── Selección de orquestador por nivel ────────────────────────────────
  const orchestrators = { 1: runFast, 2: runPro, 3: runDeep, 4: runIndustrial };
  const runChain = orchestrators[depth] || runFast;

  // ─── Ejecución con fallback inteligente ───────────────────────────────
  // [EDD] Primero intenta local (Ollama), luego pregunta antes de saltar a nube

  // Paso 1: Ollama local (primera opción)
  try {
    const resolvedPrimary = findBestOllamaModel(model || 'nemotron', installedModels);
    await termLog('start', `Iniciando generación (nivel ${depth === 1 ? '⚡ Rápido' : depth === 2 ? '🧠 Pro' : '🔬 Profundo'}) usando Ollama con modelo primario: ${resolvedPrimary}...`, 'ollama');
    return await runChain(null); // null = usar modelos por rol configurados
  } catch (ollamaError) {
    await termLog('warning', `Ollama primario falló: ${ollamaError.message.substring(0, 60)}`, 'ollama');
  }

  // Paso 2: Probar modelos locales alternativos (filtrados por los instalados para no colgarse con los no instalados)
  // Priorizar GGUF ('nemotron-3-nano:4b') sobre MLX que puede colgarse
  const defaultFallbackOrder = ['nemotron-3-nano:4b', 'qwen3.5:2b-mlx', 'gemma4:e2b-mlx'];
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

  // Paso 3: Si todos los locales fallan, indicar necesidad de reinstalar el runtime MLX o descargar un modelo GGUF estable
  await termLog('error', 'Todos los modelos locales fallaron. Por favor, descargue un modelo estable como nemotron-3-nano:4b.', 'system');
  throw new Error('Generación abortada: Modelos locales no disponibles. Por favor instale/verifique el runtime MLX o descargue nemotron-3-nano:4b.');
}

// ─────────────────────────────────────────────────────────────────────────
// Genera contenido para UN SOLO campo (Expert Panel)
// ─────────────────────────────────────────────────────────────────────────
export async function generateSingleField(config, fieldKey, fieldLabel, fieldGuide, allPlanData) {
  const { apiKey, groqKey, endpoint, model } = config;

  const semillaContext = allPlanData.semilla
    ? `Entrevista con el emprendedor:\n${JSON.stringify(allPlanData.semilla, null, 2)}\n`
    : '';

  const prompt = `
Eres un experto en planes de negocio profesionales.
${semillaContext}
Contexto del plan actual:
${cleanPlanDataForAi(allPlanData)}

TAREA: Genera contenido SOLO para el campo "${fieldLabel}".
Guía: ${fieldGuide.desc || ''}
Ejemplo: ${fieldGuide.ejemplo || ''}

Devuelve un JSON con UNA sola clave: "${fieldKey}" y su contenido profesional.
`;

  const installedModels = await getInstalledOllamaModels(endpoint);
  const resolvedModel = findBestOllamaModel(model || 'gemma4:e2b-mlx', installedModels);

  // Intentar primero el modelo resuelto, luego los otros instalados en orden de estabilidad
  const localModels = [
    resolvedModel,
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
      const pConfig = { provider: 'ollama', endpoint, model: localModel };
      return await callAiProvider(pConfig, prompt);
    } catch (error) {
      console.warn(`generateSingleField falló en ollama con modelo ${localModel}: ${error.message}`);
    }
  }
  throw new Error('No se pudo generar el campo. Verifique el runtime MLX y los modelos de Ollama locales.');
}

// ─────────────────────────────────────────────────────────────────────────
// Diálogo de fallback a nube
// ─────────────────────────────────────────────────────────────────────────
function showFallbackDialog(errorMsg) {
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
async function callAiProvider(config, prompt, expectJson = true) {
  const { provider, apiKey, endpoint, model } = config;
  if (provider === 'gemini')  return callGemini(apiKey, model, prompt, expectJson);
  if (provider === 'groq')    return callGroq(apiKey, model, prompt, expectJson);
  if (provider === 'ollama')  return callOllama(endpoint, model, prompt, expectJson);
  if (provider === 'mistral') return callMistral(apiKey, model, prompt, expectJson);
  if (provider === 'openai')  return callOpenAI(apiKey, model, prompt, expectJson);
  throw new Error(`Proveedor ${provider} no soportado`);
}

async function callOllama(endpoint, model, prompt, expectJson) {
  // [SDD] Ver docs/Operations_Integration_SDD.md — Ollama hace swap automático en VRAM
  // Mac: Metal unifica RAM/VRAM, sin swap. Windows/Linux: swap ~2-4s entre modelos.
  const url = `${endpoint || 'http://localhost:11434'}/api/generate`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'gemma4:e2b-mlx',
      prompt,
      stream: false,
      format: expectJson ? 'json' : undefined,
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return expectJson ? parseAIResponse(data.response) : data.response;
}

async function callGemini(apiKey, model, prompt, expectJson) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.candidates[0].content.parts[0].text;
  return expectJson ? parseAIResponse(text) : text;
}

async function callGroq(apiKey, model, prompt, expectJson) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
  const text = data.choices[0].message.content;
  return expectJson ? parseAIResponse(text) : text;
}

async function callOpenAI(apiKey, model, prompt, expectJson) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: expectJson ? { type: 'json_object' } : undefined
    })
  });
  const data = await response.json();
  return expectJson ? parseAIResponse(data.choices[0].message.content) : data.choices[0].message.content;
}

async function callMistral(apiKey, model, prompt, expectJson) {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model || 'mistral-large-latest',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  return expectJson ? parseAIResponse(data.choices[0].message.content) : data.choices[0].message.content;
}

function parseAIResponse(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(text);
  } catch (e) {
    throw new Error('La IA no devolvió un formato JSON válido.');
  }
}


// ─────────────────────────────────────────────────────────────────────────
// Sugerencia tipo "Mesa de Expertos" para mejorar texto (UI ExpertPanel)
// ─────────────────────────────────────────────────────────────────────────
export async function generateExpertSuggestion(config, { expertRole, fieldLabel, currentValue, planData }) {
  const { apiKey, groqKey, endpoint, model } = config || {};

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
  const resolvedModel = findBestOllamaModel(model || 'gemma4:e2b-mlx', installedModels);

  const localModels = [
    resolvedModel,
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
      const pConfig = { provider: 'ollama', endpoint, model: localModel };
      const text = await callAiProvider(pConfig, prompt, false);
      return (text || '').trim();
    } catch (error) {
      lastError = error;
      console.warn(`generateExpertSuggestion falló en ollama con modelo ${localModel}: ${error.message}`);
    }
  }

  throw new Error(lastError?.message || 'No se pudo generar sugerencia. Verifique el runtime MLX y los modelos de Ollama locales.');
}

// ─────────────────────────────────────────────────────────────────────────
// Resumen de texto para UI (ModuleField)
// ─────────────────────────────────────────────────────────────────────────
export async function summarizeText(config, text) {
  const { apiKey, groqKey, endpoint, model } = config || {};

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
  const resolvedModel = findBestOllamaModel(model || 'gemma4:e2b-mlx', installedModels);

  const localModels = [
    resolvedModel,
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
      const pConfig = { provider: 'ollama', endpoint, model: localModel };
      const out = await callAiProvider(pConfig, prompt, false);
      return (out || '').trim();
    } catch (error) {
      lastError = error;
      console.warn(`summarizeText falló en ollama con modelo ${localModel}: ${error.message}`);
    }
  }

  throw new Error(lastError?.message || 'No se pudo resumir el texto. Verifique el runtime MLX y los modelos de Ollama locales.');
}
