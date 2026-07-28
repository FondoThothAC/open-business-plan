import { findBenchmarkByText } from '../config/industry_benchmarks.js';
import { callAiProvider } from './ai.js';

/**
 * Matcher e Inferencia Dinámica de Benchmarks de Industria
 * 
 * 1. Busca coincidencia rápida en el catálogo de benchmarks locales.
 * 2. Si no hay coincidencia directa, consulta a la IA para generar una ficha
 *    técnica de benchmark sintético basada en el sector detectado.
 */

export async function matchIndustry(rawText, semillaData, aiConfig) {
  // 1. Coincidencia directa en catálogo local
  const localMatch = findBenchmarkByText(rawText) || (semillaData?.negocio?.que_es ? findBenchmarkByText(semillaData.negocio.que_es) : null);

  if (localMatch) {
    return {
      matched: true,
      source: 'local_catalog',
      benchmark: localMatch
    };
  }

  // 2. Si no hay coincidencia local, generar benchmark sintético con la IA
  if (!aiConfig) {
    return {
      matched: false,
      source: 'none',
      benchmark: null
    };
  }

  const { primaryProvider, apiKey, groqKey, nvidiaKey, lmStudioEndpoint, endpoint, model } = aiConfig || {};

  const prompt = `
Eres un analista de inteligencia de mercados y economista industrial.
El emprendedor ha descrito el siguiente proyecto:

"""
${rawText}
"""

Genera una ficha de benchmark industrial sintético para este tipo de negocio.
Devuelve ÚNICAMENTE un objeto JSON válido con este formato (sin markdown ni explicaciones adicionales):

{
  "id": "slug_del_negocio",
  "name": "Nombre descriptivo de la industria",
  "keywords": ["palabra1", "palabra2"],
  "frameworkDefault": "business",
  "defaults": {
    "produccion": {
      "proceso": "Paso a paso técnico resumido de producción o entrega del servicio.",
      "capacidad_diaria": "Capacidad diaria referencial",
      "personal_minimo": 2,
      "merma_promedio": "2% - 5%"
    },
    "finanzas": {
      "inversion_inicial": "$XXX,XXX MXN estimado",
      "margen_bruto_estimado": "40% - 60%",
      "costos_fijos_mensuales": {
        "renta": 10000,
        "luz": 4000,
        "sueldos": 20000
      }
    },
    "equipo": ["Equipo 1", "Equipo 2", "Equipo 3"],
    "preguntas_check": [
      { "key": "escala", "label": "¿Tu escala inicial coincide con este estándar?", "defaultVal": "Estándar medio" },
      { "key": "modalidad", "label": "¿Modalidad de atención?", "defaultVal": "Local comercial + servicio digital" }
    ]
  },
  "kpis_referencia": {
    "margen_operativo": 0.25,
    "retorno_inversion_meses": 18
  }
}
`;

  try {
    const prov = primaryProvider || 'ollama';
    const responseText = await callAiProvider(
      { provider: prov, apiKey, groqKey, nvidiaKey, endpoint: prov === 'lmstudio' ? lmStudioEndpoint : endpoint, model: model || 'nemotron-3-nano:4b' },
      prompt,
      false
    );

    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const dynamicBenchmark = JSON.parse(cleanedText);

    return {
      matched: true,
      source: 'ai_generated',
      benchmark: dynamicBenchmark
    };
  } catch (err) {
    console.warn("No se pudo generar el benchmark dinámico con IA:", err);
    return {
      matched: false,
      source: 'none',
      benchmark: null
    };
  }
}
