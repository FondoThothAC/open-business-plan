/**
 * @file promptExporter.js
 * Ensamblador de Prompts Enriquecidos con Semilla y RAG para Generación Manual en IA Externa
 * Fondo Thoth AC — Open Business Plan
 */

import { buildVerbosityConstraint, getFieldFormatGuidance, isUltraConciseModule } from './verbosityManager.js';

/**
 * Ensambla un prompt completo, autocontenido y enriquecido con el contexto de la semilla
 * y documentos RAG del proyecto, listo para ser copiado y usado en ChatGPT, Claude, Gemini, etc.
 *
 * @param {object} params
 * @param {string} params.pillar - Nombre del pilar académico.
 * @param {string} params.moduleKey - Identificador del módulo (ej. 'foda', 'canvas', 'pestel').
 * @param {string} params.moduleTitle - Título legible del módulo (ej. 'Análisis FODA').
 * @param {object} params.field - Objeto de definición del campo { key, label, type }.
 * @param {object} params.fieldGuide - Guía metodológica del campo { instruccion, ejemplo, benchmark, cita }.
 * @param {object} params.planData - Estado completo del plan de negocios.
 * @returns {string} Texto formateado en Markdown para copiar al portapapeles.
 */
export function buildExternalPrompt({
  pillar = '',
  moduleKey = '',
  moduleTitle = '',
  field = {},
  fieldGuide = {},
  planData = {}
}) {
  const semilla = planData?.naturaleza?.semilla || planData?.semilla || {};
  const nombreProyecto = semilla.nombre_proyecto || semilla.nombreProyecto || semilla.proyecto || planData?.config?.projectName || 'Proyecto Sin Nombre';
  const industria = semilla.industria || semilla.giro || 'No especificada';
  const ubicacion = planData?.config?.location || semilla.ubicacion || semilla.cobertura || 'No especificada';
  const problema = semilla.problema || semilla.necesidad || 'No especificado';
  const solucion = semilla.solucion || semilla.propuesta_valor || semilla.propuestaValor || 'No especificada';
  const mercado = semilla.mercado || semilla.segmento || semilla.cliente_ideal || 'No especificado';
  const modeloIngresos = semilla.modelo_ingresos || semilla.modeloIngresos || 'No especificado';
  const ventaja = semilla.ventaja_competitiva || semilla.ventajaCompetitiva || 'No especificada';
  const inversion = semilla.monto_inversion || semilla.montoInversion ? `$${Number(semilla.monto_inversion || semilla.montoInversion).toLocaleString()} MXN` : 'No especificada';

  // Contexto de documentos RAG
  const rawDocs = planData?.config?.uploadedDocuments || planData?.documents || [];
  const docsText = Array.isArray(rawDocs) && rawDocs.length > 0
    ? rawDocs.map((doc, idx) => `### Documento ${idx + 1}: ${doc.name || 'Sin título'}\n${(doc.text || '').substring(0, 1500)}`).join('\n\n')
    : '(Sin documentos adicionales cargados)';

  // Regla de extensión y concisión
  const verbosity = planData?.config?.ai?.verbosity || 'normal';
  const isUltra = isUltraConciseModule(moduleKey);
  const fieldGuidance = getFieldFormatGuidance(field, verbosity, moduleKey);

  let directivaFormato = '';
  if (isUltra || verbosity === 'conciso') {
    directivaFormato = `1. Formato Ultra-Conciso Obligatorio: Redacta ÚNICAMENTE de 3 a 5 viñetas (bullet points) concretas.
2. Cada viñeta debe ser una oración corta, directa al grano y de alto impacto (máximo 15 a 25 palabras por viñeta).
3. PROHIBIDO redactar párrafos extensos de fundamentación, introducciones teóricas ("En el ámbito empresarial...", "Es importante destacar...") o conclusiones de relleno. Ve directo a las viñetas.`;
  } else {
    directivaFormato = `1. Redacta de forma ejecutiva, directa y sin relleno innecesario.
2. Prioriza viñetas estructuradas con oraciones concisas (80 a 120 palabras en total).
3. Adapta el contenido fielmente a la escala y ubicación del proyecto.`;
  }

  const promptMarkdown = `# PROMPT DE CONSULTORÍA ESTRATÉGICA — OPEN BUSINESS PLAN (FONDO THOTH AC)

## ROL Y OBJETIVO
Eres un consultor senior en planeación estratégica de negocios y Business Design de Open Business Plan.
Tu objetivo es redactar con rigor profesional, realismo comercial y máxima síntesis el campo especificado para este proyecto.

---

## CONTEXTO DEL NEGOCIO (SEMILLA)
- **Nombre del Proyecto:** ${nombreProyecto}
- **Giro / Industria:** ${industria}
- **Ubicación / Cobertura Operativa:** ${ubicacion}
- **Problema / Necesidad Detectada:** ${problema}
- **Solución / Propuesta de Valor:** ${solucion}
- **Mercado Objetivo / Cliente Ideal:** ${mercado}
- **Modelo de Ingresos / Monetización:** ${modeloIngresos}
- **Diferencial / Ventaja Competitiva:** ${ventaja}
- **Inversión Inicial Estimada:** ${inversion}

---

## EVIDENCIA DOCUMENTAL (RAG)
${docsText}

---

## CAMPO A GENERAR
- **Pilar Metodológico:** ${pillar || 'General'}
- **Módulo:** ${moduleTitle || moduleKey} (${moduleKey})
- **Campo:** ${field.label || field.key} (\`${field.key}\`)
- **Pauta de Formato:** ${fieldGuidance}

### INSTRUCCIÓN METODOLÓGICA:
${fieldGuide.instruccion || fieldGuide.desc || 'Describir detalladamente con enfoque estratégico.'}

${fieldGuide.ejemplo ? `### EJEMPLO DE REFERENCIA:\n${fieldGuide.ejemplo}\n` : ''}
${fieldGuide.benchmark ? `### BENCHMARK / REGLA:\n${fieldGuide.benchmark}\n` : ''}
${fieldGuide.cita ? `### CITA / SUSTENTO TEÓRICO:\n${fieldGuide.cita}\n` : ''}

---

## REGLAS ESTRICTAS DE RESPUESTA:
${directivaFormato}
4. Idioma: Español neutro premium.
5. Devuelve ÚNICAMENTE el texto final generado para el campo, sin introducciones conversacionales ("¡Hola! Aquí tienes...", "Claro, con gusto...") ni despedidas.
`;

  return promptMarkdown;
}

/**
 * Copia un texto al portapapeles con manejo seguro de excepciones.
 * @param {string} text - Contenido a copiar.
 * @returns {Promise<boolean>} True si tuvo éxito, false en caso contrario.
 */
export async function copyPromptToClipboard(text) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback para entornos donde clipboard API esté restringido
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return successful;
  } catch (err) {
    console.error('[copyPromptToClipboard] Error al copiar al portapapeles:', err);
    return false;
  }
}
