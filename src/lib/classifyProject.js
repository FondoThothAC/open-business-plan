import { FRAMEWORKS } from '../config/frameworks.js';
import { callAiProvider } from './ai.js';

/**
 * Motor de Inferencia de Frameworks para Open Business Plan v2.0
 * 
 * Analiza el texto libre (brain dump) o dictado del emprendedor
 * e infiere el framework óptimo de entre los 12 disponibles con su % de confianza.
 */

export async function classifyProject(aiConfig, rawText) {
  const { primaryProvider, apiKey, groqKey, nvidiaKey, lmStudioEndpoint, endpoint, model } = aiConfig || {};

  if (!rawText || rawText.trim().length < 10) {
    return {
      frameworkId: 'business',
      confidence: 0.5,
      reasoning: 'Texto demasiado corto para inferencia. Se asignó Plan Comercial por defecto.',
      alternativeFrameworks: []
    };
  }

  // Resumen sintético de los 12 frameworks para el prompt
  const frameworksSummary = Object.entries(FRAMEWORKS).map(([id, fw]) => {
    return `- ID: "${id}" | Nombre: "${fw.name}" | Pilares: ${fw.pillars.map(p => p.title).join(', ')}`;
  }).join('\n');

  const prompt = `
Eres un Director Estratégico de Negocios y Metodologías de Emprendimiento.
Un emprendedor ha narrado la idea de su proyecto en texto libre (o dictado por voz):

"""
${rawText}
"""

Tu tarea es analizar la naturaleza de la idea y clasificarla en el framework estratégico MÁS ADECUADO de entre los siguientes 12 disponibles:

${frameworksSummary}

Criterios de clasificación:
- Si menciona impacto social, comunidad, ONGs, pobreza, educación pública o fondos BID → "social_bid" o "zopp".
- Si es una app, SaaS, tecnología de punta, IA, patente, laboratorio o I+D → "technology_id" o "agile_startup".
- Si es un negocio tradicional pequeño, local, de autoempleo (tortillería, barbería, papelería, fonda) → "micro_business".
- Si requiere alta ingeniería, naves industriales, CAPEX elevado, infraestructura u obra → "investment_project" u "onudi_project".
- Si busca inversión privada, venture capital o franquicias → "business" o "agile_startup".
- Si habla de internacionalización en Asia/China, alianzas de estado → "guanxi_plan".
- Si habla de gestión por células, micro-ganancias, Kyocera → "amoeba_management".
- Si menciona visión japonesa, Hoshin Kanri, matriz X → "hoshin_kanri".
- Si busca subvenciones europeas Horizon → "horizon_europe".

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura (sin formato Markdown, sin explicaciones fuera del JSON):

{
  "frameworkId": "ID_DEL_FRAMEWORK_SELECCIONADO",
  "confidence": 0.95,
  "reasoning": "Explicación breve de 1 o 2 oraciones en español de por qué este es el framework idóneo.",
  "alternativeFrameworks": [
    { "frameworkId": "SEGUNDO_ID_PROBABLE", "confidence": 0.60 },
    { "frameworkId": "TERCER_ID_PROBABLE", "confidence": 0.40 }
  ]
}
`;

  try {
    const prov = primaryProvider || 'groq';
    const responseText = await callAiProvider(
      { provider: prov, apiKey, groqKey, nvidiaKey, endpoint: prov === 'lmstudio' ? lmStudioEndpoint : endpoint, model: model || 'groq/compound-mini' },
      prompt,
      false
    );

    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanedText);

    // Asegurar que el framework exista
    if (!FRAMEWORKS[result.frameworkId]) {
      result.frameworkId = 'business';
    }

    return {
      frameworkId: result.frameworkId || 'business',
      confidence: Math.min(Math.max(result.confidence || 0.8, 0.1), 1.0),
      reasoning: result.reasoning || 'Clasificación basada en la descripción inicial del proyecto.',
      alternativeFrameworks: Array.isArray(result.alternativeFrameworks) ? result.alternativeFrameworks : []
    };
  } catch (error) {
    console.warn("Error en classifyProject, usando fallback heurístico:", error);
    
    // Fallback heurístico simple por expresiones clave
    const textLower = rawText.toLowerCase();
    let inferredId = 'business';
    let reasoning = 'Inferencia rápida basada en palabras clave del proyecto.';

    if (textLower.includes('social') || textLower.includes('comunidad') || textLower.includes('ong') || textLower.includes('bid')) {
      inferredId = 'social_bid';
      reasoning = 'Detectada orientación hacia desarrollo social e impacto comunitario.';
    } else if (textLower.includes('tortilleria') || textLower.includes('tortillería') || textLower.includes('abarrotes') || textLower.includes('taller') || textLower.includes('autoempleo') || textLower.includes('local')) {
      inferredId = 'micro_business';
      reasoning = 'Detectada iniciativa de micronegocio local o autoempleo.';
    } else if (textLower.includes('app') || textLower.includes('saas') || textLower.includes('software') || textLower.includes('inteligencia artificial') || textLower.includes('startup')) {
      inferredId = 'agile_startup';
      reasoning = 'Detectado modelo ágil de startup tecnológica o software.';
    } else if (textLower.includes('patente') || textLower.includes('investigación') || textLower.includes('laboratorio') || textLower.includes('biotecnología')) {
      inferredId = 'technology_id';
      reasoning = 'Detectada innovación de base tecnológica e I+D.';
    } else if (textLower.includes('planta') || textLower.includes('fábrica') || textLower.includes('nave industrial') || textLower.includes('obra')) {
      inferredId = 'investment_project';
      reasoning = 'Detectado proyecto de alta inversión de capital e ingeniería.';
    }

    return {
      frameworkId: inferredId,
      confidence: 0.82,
      reasoning,
      alternativeFrameworks: [
        { frameworkId: 'business', confidence: 0.50 }
      ]
    };
  }
}
