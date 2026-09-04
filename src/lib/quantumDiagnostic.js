import { callAiProvider } from './ai.js';

/**
 * Módulo Unificado de Diagnóstico de Empresas Cuánticas (Fondo Thoth AC)
 * Evalúa el perfil del emprendedor en el Modelo Atómico de 3 Áreas:
 * - ⚡ Finanzas
 * - ⚙️ Operativo
 * - 📋 Administrativo
 * 
 * Regla de Oro (Regla 13 AGENTS.md):
 * El fundador solo puede liderar 1 o máximo 2 áreas.
 * Si concentra las 3, ocurre "Fusión Atómica", provocando disfunción y cuellos de botella.
 * Las áreas débiles DEBEN delegarse obligatoriamente a perfiles profesionales.
 */

/**
 * Función central unificada para el diagnóstico cuántico.
 * Soporta invocación directa con IA y fallback heurístico determinista.
 *
 * @param {Object} options
 * @param {Object} [options.aiConfig] - Configuración de IA opcional para análisis semántico profundo.
 * @param {Object} [options.semillaData] - Datos estructurados de la semilla.
 * @param {string} [options.rawText] - Texto libre o experiencia del fundador.
 * @param {Array<string>} [options.areas] - Áreas declaradas por el fundador (['operativo', 'finanzas', etc.]).
 * @param {number} [options.teamSize=3] - Tamaño inicial o proyectado del equipo.
 * @returns {Promise<Object>|Object}
 */
export async function runQuantumDiagnostic({
  aiConfig = null,
  semillaData = {},
  rawText = '',
  areas = null,
  teamSize = 3
} = {}) {
  // 1. Detección normalizada de áreas
  const rawAreas = areas || semillaData?.perfil_fundador?.areas || [];
  const normalizedAreas = rawAreas.map(a => String(a).toLowerCase().trim());

  let hasFinanzas = normalizedAreas.some(a => a.includes('finan') || a.includes('conta'));
  let hasOperativo = normalizedAreas.some(a => a.includes('operat') || a.includes('prod') || a.includes('tec'));
  let hasAdministrativo = normalizedAreas.some(a => a.includes('admin') || a.includes('vent') || a.includes('lider'));

  // Si no se pasaron áreas explícitas, deducir de texto libre o experiencia
  const combinedText = ((semillaData?.emprendedor?.experiencia || '') + ' ' + rawText).toLowerCase();
  if (normalizedAreas.length === 0 && combinedText.trim()) {
    hasFinanzas = combinedText.includes('financ') || combinedText.includes('conta') || combinedText.includes('banca') || combinedText.includes('mba');
    hasOperativo = combinedText.includes('técnic') || combinedText.includes('tecnic') || combinedText.includes('ingenier') || combinedText.includes('producc') || combinedText.includes('taller');
    hasAdministrativo = combinedText.includes('ventas') || combinedText.includes('lider') || combinedText.includes('geren') || combinedText.includes('equipo') || combinedText.includes('rrhh');
  }

  // Si aún no hay ninguna área asignada, por defecto operativo
  if (!hasFinanzas && !hasOperativo && !hasAdministrativo) {
    hasOperativo = true;
  }

  const activeCount = [hasFinanzas, hasOperativo, hasAdministrativo].filter(Boolean).length;
  const hasAtomicFusion = activeCount >= 3;
  const isBalanced = activeCount >= 1 && activeCount <= 2;

  const delegationRequired = [];
  if (hasAtomicFusion) {
    delegationRequired.push('Delegación obligatoria: El fundador debe elegir al menos 1 área (Finanzas, Operativo o Administrativo) para transferir a un especialista.');
  }
  if (!hasFinanzas) delegationRequired.push('Director de Finanzas / Contador Estratégico');
  if (!hasOperativo) delegationRequired.push('Jefe de Operaciones / Producción');
  if (!hasAdministrativo) delegationRequired.push('Administrador General / Gerente de Ventas');

  const recommendations = [];
  if (hasAtomicFusion) {
    recommendations.push('⚠️ ALERTA CUÁNTICA: Fusión Atómica detectada. El fundador concentra Finanzas, Operaciones y Administración. Debe delegar de inmediato al menos 1 área.');
  } else {
    recommendations.push('✓ Perfil cuántico saludable y enfocado. Las áreas débiles se delegan a perfiles complementarios.');
  }

  const quantumScaleThresholds = [
    { scale: 'Etapa 1 (1-5 colaboradores)', rule: 'Fundador lidera su área core, delega soporte contable externo.' },
    { scale: 'Etapa 2 (6-20 colaboradores)', rule: 'Salto cuántico: Mandos medios y delegación operativa estricta.' },
    { scale: 'Etapa 3 (21+ colaboradores)', rule: 'Autonomía cuántica total: Negocio funciona de forma autónoma sin el fundador.' }
  ];

  // Estructura base heurística garantizada
  const baseResult = {
    hasAtomicFusion,
    isBalanced,
    delegationRequired,
    recommendations,
    quantumScaleThresholds,
    scores: {
      finanzas: {
        score: hasFinanzas ? 0.8 : 0.3,
        nivel: hasFinanzas ? 'fuerte' : 'débil',
        evidencia: hasFinanzas ? 'Experiencia o dominio declarado en finanzas/costos.' : 'Requiere apoyo financiero externo.'
      },
      operativo: {
        score: hasOperativo ? 0.85 : 0.4,
        nivel: hasOperativo ? 'fuerte' : 'moderado',
        evidencia: hasOperativo ? 'Dominio operativo y técnico directo.' : 'Experiencia operativa básica o en delegación.'
      },
      administrativo: {
        score: hasAdministrativo ? 0.75 : 0.45,
        nivel: hasAdministrativo ? 'fuerte' : 'moderado',
        evidencia: hasAdministrativo ? 'Habilidades de liderazgo y gestión comercial.' : 'Gestión administrativa en desarrollo.'
      }
    },
    plan_delegacion: [
      {
        area: !hasFinanzas ? 'finanzas' : (!hasOperativo ? 'operativo' : 'administrativo'),
        puesto: !hasFinanzas ? 'Contador / CFO Externo' : (!hasOperativo ? 'Jefe de Taller / Operaciones' : 'Gerente Comercial / Operativo'),
        salario_estimado: '$15,000 - $25,000 MXN/mes',
        habilidades_clave: ['Control de procesos', 'Reportes gerenciales'],
        descripcion_vacante: 'Puesto estratégico para resolver cuellos de botella de delegación.'
      }
    ],
    nivel_cuantico_actual: teamSize > 20 ? 2 : (teamSize > 5 ? 1 : 0),
    independencia_fundador: hasAtomicFusion ? 0.1 : 0.4,
    resumen_ejecutivo_cuantico: hasAtomicFusion
      ? 'Alerta: Fusión Atómica detectada. El fundador concentra todas las responsabilidades directivas.'
      : 'Diagnóstico balanceado: Estructura atómica con áreas core identificadas y plan de delegación.'
  };

  // Si se provee configuración de IA activa, intentar enriquecimiento semántico con IA
  if (aiConfig && aiConfig.primaryProvider) {
    try {
      const context = {
        emprendedor: semillaData?.emprendedor || {},
        negocio: semillaData?.negocio || {},
        finanzas: semillaData?.finanzas || {},
        rawText,
        heuristicBase: baseResult
      };

      const prompt = `
Eres un Consultor Máster de la Metodología "Empresas Cuánticas" de Fondo Thoth AC.
Evalúa el perfil del fundador a través del Modelo Atómico de 3 Áreas (Finanzas, Operativo, Administrativo).
Contexto:
${JSON.stringify(context, null, 2)}

Devuelve ÚNICAMENTE un objeto JSON válido con los scores, antipatrones detectados y plan_delegacion específico.
`;

      const { primaryProvider, apiKey, groqKey, nvidiaKey, lmStudioEndpoint, endpoint, model } = aiConfig;
      const prov = primaryProvider || 'groq';
      const responseText = await callAiProvider(
        { provider: prov, apiKey, groqKey, nvidiaKey, endpoint: prov === 'lmstudio' ? lmStudioEndpoint : endpoint, model: model || 'groq/compound-mini' },
        prompt,
        false
      );

      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const aiData = JSON.parse(cleaned);

      return {
        ...baseResult,
        ...aiData,
        hasAtomicFusion: aiData.antipatrones?.some(ap => ap.codigo === 'hace_todo_el_mismo') ?? baseResult.hasAtomicFusion,
        isBalanced: !aiData.antipatrones?.some(ap => ap.codigo === 'hace_todo_el_mismo')
      };
    } catch (err) {
      console.warn('Fallback a diagnóstico heurístico cuántico:', err.message);
    }
  }

  return baseResult;
}

// Alias de retrocompatibilidad para Anteproyecto.jsx y vistas anteriores
export const evaluateQuantumProfile = async (aiConfig, semillaData, rawText = '') => {
  return runQuantumDiagnostic({ aiConfig, semillaData, rawText });
};
