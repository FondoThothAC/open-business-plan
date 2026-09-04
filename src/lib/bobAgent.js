/**
 * BOB Agent MCP Engine — Open Business Plan
 * 
 * Motor de agente con Tool Calling (Function Calling) compatible con minimax-m3:cloud
 * Permite a BOB:
 * 1. Controlar la UI y navegar entre módulos
 * 2. Llenar y actualizar campos automáticamente
 * 3. Ejecutar diagnósticos cuánticos y auditorías de balance
 * 4. Invocar la Mesa de Expertos en segundo plano
 * 5. Ejecutar sesiones interactivas de 'GrillMe' para completar el anteproyecto
 */

import { callAiProvider } from './ai.js';

// Definición canónica de herramientas (Tools / MCP capabilities)
export const BOB_TOOLS_SCHEMA = [
  {
    name: 'navigate_to_module',
    description: 'Navega la interfaz de usuario al módulo especificado del plan de negocios.',
    parameters: {
      type: 'object',
      properties: {
        moduleKey: {
          type: 'string',
          description: 'Identificador del módulo (ej. semilla, resumen, problema_solucion, mercado, operaciones, equipo, finanzas, configuracion)'
        }
      },
      required: ['moduleKey']
    }
  },
  {
    name: 'update_plan_field',
    description: 'Rellena o actualiza el contenido de un campo específico del plan de negocios.',
    parameters: {
      type: 'object',
      properties: {
        moduleKey: {
          type: 'string',
          description: 'Módulo destino (ej. semilla, finanzas, mercado, operaciones)'
        },
        fieldKey: {
          type: 'string',
          description: 'Campo a actualizar (ej. nombre_proyecto, propuesta_valor, modelo_ingresos, wacc)'
        },
        value: {
          type: 'string',
          description: 'El nuevo valor estructurado o texto para el campo'
        }
      },
      required: ['moduleKey', 'fieldKey', 'value']
    }
  },
  {
    name: 'run_quantum_diagnostic',
    description: 'Ejecuta el diagnóstico cuántico de Fondo Thoth AC para evaluar el perfil del fundador (Finanzas, Operativo, Administrativo) y detectar fusión atómica.',
    parameters: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Motivo o contexto del diagnóstico'
        }
      }
    }
  },
  {
    name: 'trigger_expert_panel',
    description: 'Dispara la Mesa de Expertos multi-agente para generar o profundizar un módulo completo con IA.',
    parameters: {
      type: 'object',
      properties: {
        moduleKey: {
          type: 'string',
          description: 'Módulo a generar (ej. mercado, operaciones, finanzas)'
        },
        depth: {
          type: 'number',
          description: 'Profundidad de análisis: 1 (Rápido), 2 (Pro - Default), 3 (Profundo)'
        }
      },
      required: ['moduleKey']
    }
  },
  {
    name: 'grill_me_interview',
    description: 'Inicia o continúa una sesión de entrevista interactiva GrillMe para extraer requerimientos clave del usuario y completar el plan paso a paso.',
    parameters: {
      type: 'object',
      properties: {
        currentTopic: {
          type: 'string',
          description: 'Tema o sección en cuestión (ej. Modelo de Negocio, Estructura de Costos, Clientes Target)'
        },
        nextQuestion: {
          type: 'string',
          description: 'Pregunta estratégica que se le formulará al usuario'
        }
      },
      required: ['currentTopic', 'nextQuestion']
    }
  },
  {
    name: 'configure_multibranch_expansion',
    description: 'Configura la estrategia y ciudades de expansión multi-sucursal (Modelo Hub-and-Spoke, Saltos Cuánticos de Escala y fases de apertura).',
    parameters: {
      type: 'object',
      properties: {
        hubCity: { type: 'string', description: 'Ciudad Matriz / Hub Central (ej. Cananea, Sonora)' },
        branches: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Lista de ciudades satélite para sucursales (ej. ["Nacozari", "Caborca", "Nogales"])' 
        },
        rolloutStrategy: { 
          type: 'string', 
          enum: ['escalonada', 'simultanea', 'hitos_roi'],
          description: 'Estrategia de apertura: escalonada (fases por flujo), simultanea (capital conjunto), hitos_roi (al superar punto de equilibrio +20%)'
        },
        capexPerBranch: { type: 'number', description: 'Inversión inicial promedio por sucursal en MXN' },
        quantumScaleLevel: { type: 'number', description: 'Nivel del salto cuántico (1: Piloto 1-5 emp, 2: Red inicial 5-20 emp, 3: Departamental 20-50 emp, 4: Gobierno Corporativo 50+ emp)' }
      },
      required: ['hubCity', 'branches', 'rolloutStrategy']
    }
  },
  {
    name: 'analyze_liquidation_runway',
    description: 'Calcula el Fondo de Reserva de Liquidación Intocable (FRLI) y diagnostica el estado del semáforo de contingencia (Runway y Protocolo de Cierre en 3 fases).',
    parameters: {
      type: 'object',
      properties: {
        isPlannedBurn: { type: 'boolean', description: 'Si el proyecto opera bajo estrategia de quema planificada de inversión (estilo Amazon / J-Curve)' },
        plannedMonths: { type: 'number', description: 'Meses de tolerancia para quema planeada' },
        estimatedStaffCount: { type: 'number', description: 'Número estimado de colaboradores para cálculo de liquidación LFT' }
      }
    }
  },
  {
    name: 'trigger_industrialization',
    description: 'Dispara la regeneración e industrialización automática de todos los módulos del plan de negocio con IA y RAG.',
    parameters: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Razón de la re-industrialización (ej. cambio de sector a Mantenimiento Hidráulico, actualización de inversión a 20 MDP)' }
      }
    }
  }
];

/**
 * Prompt del Sistema Maestro para BOB en Modo Agente MCP
 */
export function buildBobSystemPrompt(planData, currentModule = 'semilla') {
  const seed = planData?.semilla || {};
  const projectName = seed.nombre_proyecto || 'Nuevo Plan';
  const sector = seed.sector || 'General';
  const founderProfile = seed.perfil_fundador || 'No especificado';
  const multiBranchConfig = planData?.config?.multiBranch || null;

  return `Eres BOB (Business Operations Bot), el copiloto ejecutivo de IA e inteligencia de negocios de Open Business Plan (Fondo Thoth AC).
Estás impulsado exclusivamente por el modelo minimax-m3:cloud de 1 Millón de tokens de contexto.

CONTEXTO DEL PLAN ACTUAL:
- Proyecto: "${projectName}"
- Sector: ${sector}
- Módulo Activo en Pantalla: ${currentModule}
- Perfil Fundador (Modelo Atómico Cuántico): ${JSON.stringify(founderProfile)}
- Configuración Multi-Sucursal Activa: ${multiBranchConfig ? JSON.stringify(multiBranchConfig) : 'Monolocal / En definición'}

TUS CAPACIDADES COMO AGENTE MCP:
1. Puedes ejecutar comandos en la UI del usuario llamando herramientas estructuradas (JSON tools).
2. Si el usuario te pide ir a un módulo, cambiar de pantalla, o ver finanzas, usa "navigate_to_module".
3. Si el usuario te da información clave (ej. "nuestro precio es $500", "el sector es mantenimiento industrial hidráulico", "la inversión es de 20 millones"), usa "update_plan_field" para guardarlo directamente.
4. PRINCIPIO DE CERO FRICCIÓN Y AUTO-INVESTIGACIÓN:
   - Si el usuario te pide "ejecuta los módulos para reajustar", "investiga la competencia", "ajusta todo":
     * ¡NO le pidas al usuario que escriba manualmente los 3 competidores, su zona geográfica ni sus diferenciadores!
     * El sistema ya cuenta con el **RAG de documentos cargados**, el **Censo Económico INEGI DENUE** y **Búsqueda Web Automática**.
     * Ejecuta inmediatamente la herramienta "trigger_industrialization" o "trigger_expert_panel" e infórmale que el motor agéntico está investigando y regenerando el plan en automático con los datos del RAG y el sector.
5. Si el usuario te pide /grill-me o entrevistas para profundizar el plan, usa "grill_me_interview" formulando una pregunta filosa a la vez.
6. Si el usuario plantea abrir varias sucursales o expandirse a múltiples ciudades (ej. Cananea, Nacozari, Caborca):
   - Usa "configure_multibranch_expansion" para estructurar la red.
7. Si el usuario consulta sobre quiebra, pérdidas consecutivas, flujo negativo o cuándo cerrar el negocio:
   - Explica el **Fondo de Reserva de Liquidación Intocable (FRLI)** según la Ley Federal del Trabajo y ejecuta "analyze_liquidation_runway".
8. Si detectas que el fundador hace todo él mismo, advierte sobre la "fusión atómica" y sugiere delegación según la metodología de Fondo Thoth AC.

FORMATO DE RESPUESTA:
- Responde siempre en español premium, empático, conciso y profesional.
- Si vas a ejecutar una herramienta, incluye el bloque JSON de la herramienta en tu respuesta con la siguiente estructura exacta:
\`\`\`tool_call
{
  "tool": "nombre_de_la_herramienta",
  "parameters": { ... }
}
\`\`\`
- Si no requieres ejecutar una herramienta, responde directamente en texto claro.`;
}

/**
 * Procesa la respuesta de la IA para extraer y ejecutar herramientas MCP
 */
export function extractToolCalls(aiResponseText) {
  if (!aiResponseText || typeof aiResponseText !== 'string') {
    return { cleanText: aiResponseText || '', toolCalls: [] };
  }

  const toolCalls = [];
  const regex = /```tool_call\s*([\s\S]*?)\s*```/g;
  let match;
  let cleanText = aiResponseText;

  while ((match = regex.exec(aiResponseText)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.tool) {
        toolCalls.push(parsed);
      }
    } catch (e) {
      console.warn('[BobAgent] Error parseando tool_call:', e.message);
    }
  }

  // Remover los bloques de tool_call del texto visible si se desea mostrar limpio
  cleanText = cleanText.replace(/```tool_call[\s\S]*?```/g, '').trim();

  return { cleanText, toolCalls };
}

/**
 * Ejecuta una conversación completa con BOB usando el motor de agente
 */
export async function sendBobMessage({
  userMessage,
  history = [],
  planData = {},
  currentModule = 'semilla',
  onToolExecute = null
}) {
  const rawAi = planData?.config?.ai || {};
  const bobKey = rawAi.bobOllamaKey || rawAi.ollamaKey || '';

  const systemPrompt = buildBobSystemPrompt(planData, currentModule);
  
  // Construir historial en formato conversacional
  const fullPrompt = `${systemPrompt}\n\n` + 
    history.slice(-8).map(m => `${m.sender === 'user' ? 'Usuario' : 'BOB'}: ${m.text}`).join('\n') +
    `\nUsuario: ${userMessage}\nBOB:`;

  // Construir configuración inteligente de IA con fallback multi-proveedor
  const primaryProv = rawAi.primaryProvider || 'groq';
  const aiConfig = {
    ...rawAi,
    provider: primaryProv,
    model: rawAi.model || 'llama-3.3-70b-versatile',
    apiKey: rawAi.apiKey,
    groqKey: rawAi.groqKey,
    geminiKey: rawAi.apiKey || rawAi.geminiKey,
    nvidiaKey: rawAi.nvidiaKey,
    openrouterKey: rawAi.openrouterKey,
    ollamaKey: rawAi.ollamaKey || bobKey,
    minimaxKey: rawAi.minimaxKey,
    baiKey: rawAi.baiKey,
    endpoint: rawAi.endpoint,
    disableAutoFallback: false
  };

  const rawResponse = await callAiProvider(aiConfig, fullPrompt, false);
  const { cleanText, toolCalls } = extractToolCalls(rawResponse);

  // Ejecutar tool calls si hay handler registrado
  if (toolCalls.length > 0 && typeof onToolExecute === 'function') {
    for (const call of toolCalls) {
      try {
        await onToolExecute(call.tool, call.parameters);
      } catch (err) {
        console.error(`[BobAgent] Error ejecutando ${call.tool}:`, err);
      }
    }
  }

  return {
    reply: cleanText || rawResponse,
    toolCalls,
    rawResponse
  };
}
