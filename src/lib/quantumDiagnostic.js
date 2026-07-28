import { callAiProvider } from './ai';

/**
 * Módulo de Evaluación de Empresas Cuánticas (Fondo Thoth AC)
 * 
 * Evalúa el perfil del emprendedor en las 3 áreas atómicas:
 * - ⚡ Finanzas
 * - ⚙️ Operativo
 * - 📋 Administrativo
 * 
 * Regla de Oro: El fundador solo puede dominar 1-2 áreas. Fusionar las 3 áreas
 * en el fundador genera disfunción y cuellos de botella. Las áreas débiles DEBEN delegarse.
 */

export async function evaluateQuantumProfile(aiConfig, semillaData, rawText = '') {
  const context = {
    emprendedor: semillaData?.emprendedor || {},
    negocio: semillaData?.negocio || {},
    finanzas: semillaData?.finanzas || {},
    rawText
  };

  const prompt = `
Eres un Consultor Máster de la Metodología "Empresas Cuánticas" de Fondo Thoth AC.
Tu función es evaluar el perfil del fundador a través del Modelo Atómico de 3 Áreas:
1. Finanzas (capital, costos, contabilidad, evaluaciones)
2. Operativo (producción, entrega, tecnología, calidad, insumos)
3. Administrativo (ventas, RRHH, legal, liderazgo, gestión)

Información del proyecto y fundador:
"""
${JSON.stringify(context, null, 2)}
"""

Analiza objetivamente y devuelve ÚNICAMENTE un objeto JSON válido con esta estructura (sin formato Markdown):

{
  "scores": {
    "finanzas": {
      "score": 0.35,
      "nivel": "débil",
      "evidencia": "Breve explicación de por qué es débil o fuerte en finanzas."
    },
    "operativo": {
      "score": 0.85,
      "nivel": "fuerte",
      "evidencia": "Breve explicación de su fortaleza u operatividad."
    },
    "administrativo": {
      "score": 0.60,
      "nivel": "moderado",
      "evidencia": "Breve explicación de sus habilidades de liderazgo o admin."
    }
  },
  "antipatrones": [
    {
      "codigo": "hace_todo_el_mismo",
      "nombre": "Fusión Atómica (Hace todo él mismo)",
      "detectado": true,
      "riesgo": "Riesgo de colapso operativo y quemado por micromanagement.",
      "recomendacion": "Delegar inmediatamente el área financiera a un externo."
    }
  ],
  "plan_delegacion": [
    {
      "area": "finanzas",
      "puesto": "CFO Externo / Asesor Financiero",
      "salario_estimado": "$12,000 - $18,000 MXN/mes (o por honorarios)",
      "habilidades_clave": ["Contabilidad fiscal", "Proyección de flujo de caja", "Gestión de créditos"],
      "descripcion_vacante": "Se busca asesor financiero para supervisar tesorería, impuestos y presupuesto mensual de..."
    }
  ],
  "nivel_cuantico_actual": 0,
  "salto_cuantico_siguiente": {
    "nivel_meta": 1,
    "nombre_salto": "Primer Salto Cuántico (1 a 5 empleados)",
    "requisitos": [
      "Contratar responsable para el área débil detectada",
      "Documentar el proceso operativo diario en manual de 1 página"
    ]
  },
  "independencia_fundador": 0.20,
  "resumen_ejecutivo_cuantico": "Resumen sintético de 2 oraciones del diagnóstico del fundador."
}
`;

  try {
    const { primaryProvider, apiKey, groqKey, nvidiaKey, lmStudioEndpoint, endpoint, model } = aiConfig || {};
    const prov = primaryProvider || 'ollama';
    const responseText = await callAiProvider(
      { provider: prov, apiKey, groqKey, nvidiaKey, endpoint: prov === 'lmstudio' ? lmStudioEndpoint : endpoint, model: model || 'nemotron-3-nano:4b' },
      prompt,
      false
    );

    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.warn("Error evaluando perfil cuántico con IA, usando fallback heurístico:", error);

    // Fallback heurístico inteligente
    const expText = ((semillaData?.emprendedor?.experiencia || '') + ' ' + rawText).toLowerCase();
    
    const hasFin = expText.includes('financ') || expText.includes('conta') || expText.includes('banca') || expText.includes('mba');
    const hasOp = expText.includes('técnic') || expText.includes('tecnic') || expText.includes('ingenier') || expText.includes('producc') || expText.includes('cocin') || expText.includes('corte');
    const hasAdmin = expText.includes('ventas') || expText.includes('lider') || expText.includes('geren') || expText.includes('equipo') || expText.includes('rrhh');

    return {
      scores: {
        finanzas: {
          score: hasFin ? 0.8 : 0.3,
          nivel: hasFin ? 'fuerte' : 'débil',
          evidencia: hasFin ? 'Experiencia previa en finanzas o contabilidad.' : 'No se detecta background financiero sólido. Requiere apoyo externo.'
        },
        operativo: {
          score: hasOp ? 0.85 : 0.4,
          nivel: hasOp ? 'fuerte' : 'moderado',
          evidencia: hasOp ? 'Conocimiento técnico y operativo directo del producto/servicio.' : 'Experiencia operativa básica o en desarrollo.'
        },
        administrativo: {
          score: hasAdmin ? 0.75 : 0.45,
          nivel: hasAdmin ? 'fuerte' : 'moderado',
          evidencia: hasAdmin ? 'Experiencia en gestión de ventas y liderazgo.' : 'Habilidades administrativas en desarrollo.'
        }
      },
      antipatrones: [
        {
          codigo: 'hace_todo_el_mismo',
          nombre: 'Fusión Atómica (Hace todo él mismo)',
          detectado: (!hasFin && !hasOp && !hasAdmin) || (hasFin && hasOp && hasAdmin),
          riesgo: 'Querer abarcar las 3 áreas atómicas genera cuellos de botella y estancamiento.',
          recomendacion: 'Establecer plan de delegación prioritario en el área de menor dominio.'
        }
      ],
      plan_delegacion: [
        {
          area: hasFin ? 'operativo' : 'finanzas',
          puesto: hasFin ? 'Encargado de Operaciones / Jefe de Planta' : 'Contador / CFO Externo',
          salario_estimado: '$12,000 - $18,000 MXN/mes',
          habilidades_clave: hasFin ? ['Control de calidad', 'Procesos'] : ['Flujo de caja', 'Impuestos'],
          descripcion_vacante: `Se busca profesional responsable para fortalecer el área de ${hasFin ? 'Operaciones' : 'Finanzas'}...`
        }
      ],
      nivel_cuantico_actual: 0,
      salto_cuantico_siguiente: {
        nivel_meta: 1,
        nombre_salto: 'Primer Salto Cuántico (1 a 5 empleados)',
        requisitos: [
          'Delegar la gestión del área débil',
          'Asegurar autonomía operativa inicial'
        ]
      },
      independencia_fundador: 0.25,
      resumen_ejecutivo_cuantico: 'Diagnóstico preliminar: El fundador muestra un perfil operativo enfocado. Se recomienda delegar el control financiero y administrativo para asegurar escalabilidad.'
    };
  }
}
