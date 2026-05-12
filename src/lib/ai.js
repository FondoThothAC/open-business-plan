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
 *  RTX A2000 12GB puede cargar gemma4:e4b (8GB) y dejar 4GB para KV-cache.
 */

// ─────────────────────────────────────────────────────────────────────────
// Configuración de roles por defecto (se sobreescribe desde Configuracion.jsx)
// ─────────────────────────────────────────────────────────────────────────
export const DEFAULT_AGENT_CONFIG = {
  // Nivel 1 — Rápido (sin swap, 1 solo modelo)
  fast: {
    analista:  { model: 'gemma4:e4b', role: 'Analista Estratégico' },
    redactor:  { model: 'gemma4:e4b', role: 'Redactor Ejecutivo' },
  },
  // Nivel 2 — Pro (swap opcional entre analista y redactor)
  pro: {
    analista:  { model: 'gemma4:e4b', role: 'Analista Estratégico' },
    critico:   { model: 'gemma4:e4b', role: 'Crítico Financiero' },
    redactor:  { model: 'gemma4:pro', role: 'Redactor Senior' },
  },
  // Nivel 3 — Profundo (swap entre 3 modelos especializados)
  deep: {
    estratega:  { model: 'gemma4:e4b', role: 'Estratega de Negocio' },
    analista:   { model: 'qwen2.5:7b', role: 'Analista de Datos' },
    abogadoDiablo: { model: 'gemma4:e4b', role: "Devil's Advocate" },
    critico:    { model: 'gemma4:e4b', role: 'Crítico Financiero' },
    redactor:   { model: 'gemma4:pro', role: 'Redactor Ejecutivo Final' },
  },
  // Nivel 4 — Industrial : 9 agentes. ~20-30 min
  industrial: {
    estratega:      { model: 'gemma4:e4b', role: 'Estratega Maestro' },
    mercado:        { model: 'qwen2.5:7b', role: 'Especialista en Mercado' },
    operaciones:    { model: 'gemma4:e4b', role: 'Analista de Operaciones' },
    financiero:     { model: 'phi4:14b',   role: 'Especialista Financiero' },
    abogadoDiablo:  { model: 'gemma4:e4b', role: "Devil's Advocate" },
    coherencia:     { model: 'gemma4:e4b', role: 'Revisor de Coherencia Global' },
    hallucination:  { model: 'gemma4:e4b', role: 'Verificador de Hechos/Alucinaciones' },
    redactor:       { model: 'gemma4:pro', role: 'Redactor Ejecutivo Final' },
    editor:         { model: 'gemma4:pro', role: 'Editor de Estilo Académico' },
  },
};

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
      await fetch('http://localhost:3001/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type, module: currentModule.title,
          message, provider, elapsed: Date.now() - t0
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

  const planContext = JSON.stringify(allPlanData, null, 2);

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

  // Resuelve el modelo de un agente (config usuario > default nivel)
  const resolveModel = (role, levelConfig) => {
    return agentModels[role]?.model || levelConfig[role]?.model || model || 'gemma4:e4b';
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

    await termLog('thinking', '⚡ Fase 1/2: Analista generando borrador...', 'ollama');
    const draft = await callAiProvider(
      fallbackProvider || makeProviderConfig(analista),
      `${systemContext}\n\nTAREA: Genera un borrador profesional y detallado SOLO para los campos indicados. Devuelve JSON con exactamente las claves pedidas.`
    );

    await termLog('thinking', '⚡ Fase 2/2: Redactor finalizando...', 'ollama');
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

    await termLog('thinking', '🧠 Fase 1/3: Analista redactando borrador...', analista);
    const draft = await callAiProvider(
      fallbackProvider || makeProviderConfig(analista),
      `${systemContext}\n\nTAREA: Genera un borrador profesional y exhaustivo. El plan final es de 100 páginas. Devuelve JSON con SOLO las claves pedidas.`
    );

    await termLog('thinking', '🧠 Fase 2/3: Crítico revisando...', critico);
    const critique = await callAiProvider(
      fallbackProvider || makeProviderConfig(critico),
      `${systemContext}\n\nBorrador:\n${JSON.stringify(draft)}\n\nTAREA: Actúa como inversor crítico. ¿Qué falta? ¿Qué es débil o impreciso? Sé breve y directo. No devuelvas JSON.`,
      false
    );

    await termLog('thinking', '🧠 Fase 3/3: Redactor sintetizando versión final...', redactor);
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

    await termLog('thinking', '🔬 Fase 1/5: Estratega definiendo marco...', estratega);
    const marco = await callAiProvider(mkCfg(estratega),
      `${systemContext}\n\nTAREA: Define el marco estratégico y los puntos clave que DEBEN aparecer en "${currentModule.title}". No escribas el contenido final, solo la estructura. Responde en texto libre.`,
      false
    );

    await termLog('thinking', '🔬 Fase 2/5: Analista desarrollando contenido...', analista);
    const draft = await callAiProvider(mkCfg(analista),
      `${systemContext}\n\nMarco estratégico:\n${marco}\n\nTAREA: Desarrolla el contenido completo basándote en el marco. Sé exhaustivo. Devuelve JSON con las claves pedidas.`
    );

    await termLog('thinking', "🔬 Fase 3/5: Devil's Advocate buscando debilidades...", abogadoDiablo);
    const devilCritique = await callAiProvider(mkCfg(abogadoDiablo),
      `${systemContext}\n\nContenido desarrollado:\n${JSON.stringify(draft)}\n\nTAREA: Eres un escéptico. ¿Cuáles son los 3 argumentos más débiles? ¿Qué suposiciones son peligrosas? Responde en texto libre.`,
      false
    );

    await termLog('thinking', '🔬 Fase 4/5: Crítico financiero validando...', critico);
    const financialCritique = await callAiProvider(mkCfg(critico),
      `${systemContext}\n\nContenido:\n${JSON.stringify(draft)}\n\nCrítica previa:\n${devilCritique}\n\nTAREA: Valida la solidez financiera y estratégica. ¿Es viable? ¿Qué datos faltan? Texto libre.`,
      false
    );

    await termLog('thinking', '🔬 Fase 5/5: Redactor senior sintetizando...', redactor);
    const result = await callAiProvider(mkCfg(redactor),
      `${systemContext}\n\nBorrador:\n${JSON.stringify(draft)}\n\nCríticas recibidas:\n${devilCritique}\n\n${financialCritique}\n\nTAREA: Genera la versión FINAL definitiva integrando todas las perspectivas. Tono ejecutivo, académico y riguroso. DEVUELVE SOLO JSON con claves: ${(currentModule.fields || []).map(f => f.key).join(', ')}`
    );

    await termLog('success', '✓ Módulo completado (nivel profundo).', redactor);
    return result;
  };

  // NIVEL 4: Industrial — 9 agentes. El "Gold Standard" de la industria.
  const runIndustrial = async (fallbackProvider) => {
    const agentCfg = DEFAULT_AGENT_CONFIG.industrial;
    const mkCfg = (m) => fallbackProvider || makeProviderConfig(resolveModel(m, agentCfg));

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
    const coherence = await callAiProvider(mkCfg('coherencia'), `${systemContext}\n\nValida la coherencia entre mercado, operaciones y finanzas.`, false);

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

  // Paso 1: Ollama local (privado, sin costo)
  try {
    await termLog('start', `Iniciando generación (nivel ${depth === 1 ? '⚡ Rápido' : depth === 2 ? '🧠 Pro' : '🔬 Profundo'})...`, 'ollama');
    return await runChain(null); // null = usar modelos por rol configurados
  } catch (ollamaError) {
    await termLog('warning', `Ollama: ${ollamaError.message.substring(0, 60)}`, 'ollama');

    // Paso 2: Avisar al usuario antes de usar nube
    const userChoice = await showFallbackDialog(ollamaError.message);
    if (userChoice === 'cancel') {
      await termLog('error', 'Generación cancelada por el usuario.');
      throw new Error('Generación cancelada por el usuario.');
    }
  }

  // Paso 3: Nube con fallback secuencial (1 proveedor = 1 modelo, sin swap)
  const cloudProviders = [
    { provider: 'groq',    apiKey: groqKey, model: 'llama-3.3-70b-versatile' },
    { provider: 'gemini',  apiKey,          model: 'gemini-1.5-flash' },
    { provider: 'mistral', apiKey,          model: 'mistral-large-latest' },
    { provider: 'openai',  apiKey,          model: 'gpt-4o' },
  ];

  let lastError = null;
  for (const pConfig of cloudProviders) {
    try {
      await termLog('fallback', `Intentando nube: ${pConfig.provider}...`, pConfig.provider);
      return await runChain(pConfig); // Usa el mismo orquestador pero con proveedor nube
    } catch (error) {
      await termLog('error', `${pConfig.provider}: ${error.message.substring(0, 50)}`, pConfig.provider);
      lastError = error;
    }
  }

  throw new Error('Todos los proveedores fallaron. ' + (lastError?.message || ''));
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
${JSON.stringify(allPlanData, null, 2)}

TAREA: Genera contenido SOLO para el campo "${fieldLabel}".
Guía: ${fieldGuide.desc || ''}
Ejemplo: ${fieldGuide.ejemplo || ''}

Devuelve un JSON con UNA sola clave: "${fieldKey}" y su contenido profesional.
`;

  const providers = [
    { provider: 'ollama', endpoint, model: model || 'gemma4:e4b' },
    { provider: 'groq',   apiKey: groqKey, model: 'llama-3.3-70b-versatile' },
    { provider: 'gemini', apiKey,          model: 'gemini-1.5-flash' },
  ];

  for (const pConfig of providers) {
    try {
      return await callAiProvider(pConfig, prompt);
    } catch (error) {
      console.warn(`generateSingleField falla en ${pConfig.provider}: ${error.message}`);
    }
  }
  throw new Error('No se pudo generar el campo. Verifica tu conexión.');
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
      model: model || 'gemma4:e4b',
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
