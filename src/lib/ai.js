/**
 * AI Service for OpenPlan V2 - "Mesa de Expertos" Edition
 * Handles multi-agent reasoning loops and cross-provider synthesis with intelligent fallback.
 */

/**
 * Genera contenido para un módulo completo usando la Mesa de Expertos (3 fases).
 * Los campos bloqueados se envían como CONTEXTO pero NO se regeneran.
 */
export async function generateModuleContent(config, currentModule, allPlanData) {
  const { primaryProvider, secondaryProvider, apiKey, groqKey, endpoint, model } = config;
  const t0 = Date.now();

  // Helper: envía log al terminal del servidor (silent fail)
  const termLog = async (type, message, provider = '') => {
    try {
      await fetch('http://localhost:3001/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, module: currentModule.title, message, provider, elapsed: Date.now() - t0 })
      });
    } catch (_) { /* silencioso si backend está caído */ }
  };

  // 1. Preparar contexto global (incluye TODO: semilla + plan + campos bloqueados)
  const semillaContext = allPlanData.semilla 
    ? `\nENTREVISTA CON EL EMPRENDEDOR (Semilla):\n${JSON.stringify(allPlanData.semilla, null, 2)}\n` 
    : '';
  
  const documentsContext = (allPlanData.config?.documents || []).length > 0
    ? `\nDOCUMENTOS DE REFERENCIA PROPORCIONADOS:\n${allPlanData.config.documents.map(d => d.text).join('\n---\n').substring(0, 5000)}\n`
    : '';

  const planContext = JSON.stringify(allPlanData, null, 2);

  // 2. Base Prompts — Los campos bloqueados están en planContext como CONTEXTO, pero solo se piden los desbloqueados
  const systemContext = `
Eres un miembro de una "Mesa de Expertos" en estrategia empresarial.
Tu objetivo es redactar una sección específica de un Plan de Negocios de 100 páginas.
${semillaContext}
${documentsContext}
Estado actual COMPLETO del plan (usa como referencia, NO modifiques campos que no se te pidan):
${planContext}

Módulo a redactar: "${currentModule.title}"
Descripción oficial (según guía académica): ${currentModule.description}
Campos que DEBES generar (solo estos, los demás son contexto): ${(currentModule.fields || []).map(f => f.key).join(', ')}
`;

  const runChain = async (providerConfig) => {
    await termLog('thinking', 'Fase 1/3: Analista redactando borrador...', providerConfig.provider);
    const analystPrompt = `${systemContext}\n\nTAREA: Genera un borrador profesional y detallado SOLO para los campos indicados. Sé exhaustivo, recuerda que el plan final es de casi 100 páginas. Devuelve un JSON con SOLO las claves pedidas.`;
    const draft = await callAiProvider(providerConfig, analystPrompt);
    await termLog('thinking', 'Fase 2/3: Crítico revisando borrador...', providerConfig.provider);
    const reviewerPrompt = `${systemContext}\n\nBorrador del Analista:\n${JSON.stringify(draft)}\n\nTAREA: Actúa como un inversionista crítico. Identifica qué falta o qué es débil en este borrador. Sé breve. No devuelvas JSON, solo tus críticas en español.`;
    const critique = await callAiProvider(providerConfig, reviewerPrompt, false);
    await termLog('thinking', 'Fase 3/3: Redactor final sintetizando...', providerConfig.provider);
    const synthesizerPrompt = `${systemContext}\n\nBorrador Inicial:\n${JSON.stringify(draft)}\n\nCrítica de la Mesa:\n${critique}\n\nTAREA: Genera la versión final del módulo integrando las mejoras sugeridas. Asegura coherencia total con el resto del plan. DEVUELVE SOLO EL JSON FINAL con las claves: ${(currentModule.fields || []).map(f => f.key).join(', ')}`;
    const result = await callAiProvider(providerConfig, synthesizerPrompt);
    await termLog('success', `Módulo completado.`, providerConfig.provider);
    return result;
  };

  // 3. Ejecución con Fallback INTELIGENTE (avisa al usuario antes de saltar a la nube)
  const ollamaConfig = { provider: 'ollama', endpoint, model: model || 'gemma4:e2b' };
  const cloudProviders = [
    { provider: 'groq', apiKey: groqKey, model: 'llama-3.3-70b-versatile' },
    { provider: 'mistral', apiKey, model: 'mistral-large-latest' },
    { provider: 'gemini', apiKey, model: 'gemini-1.5-flash' },
    { provider: 'openai', apiKey, model: 'gpt-4o' }
  ];

  // Paso 1: Intentar Ollama primero (local, privado, gratis)
  try {
    await termLog('start', `Iniciando generación...`, 'ollama');
    const result = await runChain(ollamaConfig);
    return result;
  } catch (ollamaError) {
    await termLog('warning', `Ollama no disponible: ${ollamaError.message.substring(0,60)}`, 'ollama');
    
    // Paso 2: Ollama falló — AVISAR al usuario antes de saltar a la nube
    const userChoice = await showFallbackDialog(ollamaError.message);
    
    if (userChoice === 'retry') {
      try {
        await termLog('stage', 'Reintentando con Ollama...', 'ollama');
        return await runChain(ollamaConfig);
      } catch (retryError) {
        await termLog('warning', `Reintento Ollama falló. Saltando a nube.`, 'ollama');
      }
    } else if (userChoice === 'cancel') {
      await termLog('error', 'Generación cancelada por el usuario.');
      throw new Error('Generación cancelada por el usuario.');
    }
  }

  // Paso 3: Usar proveedores en la nube (con fallback secuencial)
  let lastError = null;
  for (const pConfig of cloudProviders) {
    try {
      await termLog('fallback', `Intentando proveedor nube...`, pConfig.provider);
      return await runChain(pConfig);
    } catch (error) {
      await termLog('error', `Falla en ${pConfig.provider}: ${error.message.substring(0,50)}`, pConfig.provider);
      lastError = error;
    }
  }

  throw new Error("Todos los proveedores de IA fallaron. Verifica tu conexión, Ollama o tus API Keys. " + (lastError?.message || ''));
}

/**
 * Genera contenido para UN SOLO campo usando un prompt específico.
 */
export async function generateSingleField(config, fieldKey, fieldLabel, fieldGuide, allPlanData) {
  const { apiKey, groqKey, endpoint, model } = config;
  
  const semillaContext = allPlanData.semilla 
    ? `Entrevista con el emprendedor:\n${JSON.stringify(allPlanData.semilla, null, 2)}\n` 
    : '';

  const prompt = `
Eres un experto en planes de negocio profesionales.
${semillaContext}
Contexto completo del plan actual:
${JSON.stringify(allPlanData, null, 2)}

TAREA: Genera contenido SOLO para el campo "${fieldLabel}".
Guía de este campo: ${fieldGuide.desc || ''}
Ejemplo de referencia: ${fieldGuide.ejemplo || ''}

Devuelve un JSON con UNA sola clave: "${fieldKey}" y su contenido como texto detallado y profesional.
`;

  // Usar el mismo fallback inteligente
  const providers = [
    { provider: 'ollama', endpoint, model: model || 'gemma4:e2b' },
    { provider: 'groq', apiKey: groqKey, model: 'llama-3.3-70b-versatile' },
    { provider: 'gemini', apiKey, model: 'gemini-1.5-flash' }
  ];

  for (const pConfig of providers) {
    try {
      return await callAiProvider(pConfig, prompt);
    } catch (error) {
      console.warn(`generateSingleField falla en ${pConfig.provider}: ${error.message}`);
    }
  }
  throw new Error("No se pudo generar el campo. Verifica tu conexión.");
}

/**
 * Diálogo de fallback: avisa al usuario que Ollama no responde y ofrece opciones.
 */
function showFallbackDialog(errorMsg) {
  return new Promise((resolve) => {
    const isConnectionError = errorMsg.includes('fetch') || errorMsg.includes('Failed') || errorMsg.includes('ECONNREFUSED') || errorMsg.includes('NetworkError');
    
    const message = isConnectionError
      ? `⚠️ Ollama no detectado (localhost:11434).\n\n¿Deseas usar la INTELIGENCIA EN LA NUBE (Groq/Gemini) para continuar?\n\n• OK = Usar Nube\n• Cancelar = Detener`
      : `⚠️ Error en Ollama: ${errorMsg}\n\n¿Deseas saltar a la NUBE?\n\n• OK = Usar Nube\n• Cancelar = Detener`;

    const useCloud = window.confirm(message);
    resolve(useCloud ? 'cloud' : 'cancel');
  });
}

// --- Provider Adapters ---

async function callAiProvider(config, prompt, expectJson = true) {
  const { provider, apiKey, endpoint, model } = config;

  if (provider === 'gemini') return await callGemini(apiKey, model, prompt, expectJson);
  if (provider === 'groq') return await callGroq(apiKey, model, prompt, expectJson);
  if (provider === 'ollama') return await callOllama(endpoint, model, prompt, expectJson);
  if (provider === 'mistral') return await callMistral(apiKey, model, prompt, expectJson);
  if (provider === 'openai') return await callOpenAI(apiKey, model, prompt, expectJson);
  
  throw new Error(`Proveedor ${provider} no configurado o soportado`);
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
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: expectJson ? { type: "json_object" } : undefined
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.choices[0].message.content;
  return expectJson ? parseAIResponse(text) : text;
}

async function callOllama(endpoint, model, prompt, expectJson) {
  const url = `${endpoint || 'http://localhost:11434'}/api/generate`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'gemma4:e2b',
      prompt: prompt,
      stream: false,
      format: expectJson ? 'json' : undefined
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return expectJson ? parseAIResponse(data.response) : data.response;
}

async function callOpenAI(apiKey, model, prompt, expectJson) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: expectJson ? { type: "json_object" } : undefined
    })
  });
  const data = await response.json();
  const text = data.choices[0].message.content;
  return expectJson ? parseAIResponse(text) : text;
}

async function callMistral(apiKey, model, prompt, expectJson) {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'mistral-large-latest',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  const text = data.choices[0].message.content;
  return expectJson ? parseAIResponse(text) : text;
}

function parseAIResponse(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(text);
  } catch (e) {
    throw new Error("La IA no devolvió un formato JSON válido.");
  }
}
