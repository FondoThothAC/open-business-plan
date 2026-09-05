/**
 * @file verbosityManager.js
 * Gestor Centralizado de Verbosidad, Longitud y Formato de Generación con IA
 * Fondo Thoth AC — Open Business Plan
 *
 * Calibra de forma adaptativa la extensión de las respuestas de los agentes
 * según la configuración seleccionada ('conciso', 'normal', 'detallado') y
 * la naturaleza del módulo (por ejemplo, reglas ultra-concisas para Canvas).
 */

/**
 * Normaliza el nivel de verbosidad asegurando un valor válido.
 * @param {string} verbosity - Nivel de verbosidad entrante.
 * @returns {'conciso' | 'normal' | 'detallado'}
 */
export function normalizeVerbosity(verbosity = 'normal') {
  if (!verbosity || typeof verbosity !== 'string') return 'normal';
  const v = verbosity.toLowerCase().trim();
  if (v === 'conciso' || v === 'short' || v === 'breve') return 'conciso';
  if (v === 'detallado' || v === 'extenso' || v === 'long' || v === 'profundo') return 'detallado';
  return 'normal';
}

/**
 * Construye la directiva de extensión a inyectar en el System Prompt.
 * @param {string} verbosity - Nivel de detalle configurado.
 * @param {string} moduleKey - Clave del módulo en ejecución (ej. 'canvas', 'pestel').
 * @returns {string} Restricción textual clara para el LLM.
 */
export function buildVerbosityConstraint(verbosity = 'normal', moduleKey = '') {
  const normVerbosity = normalizeVerbosity(verbosity);
  const mod = (moduleKey || '').toLowerCase();

  // Regla especial prioritaria para Business Model Canvas (9 bloques concisos)
  if (mod === 'canvas') {
    return `\n\nREGLA ESTRICTA DE EXTENSIÓN PARA CANVAS: Formato ultra-conciso obligatorio. Redacta de 3 a 5 viñetas cortas (bullet points) de máxima síntesis por campo. Sin introducciones, conclusiones ni párrafos largos.`;
  }

  if (normVerbosity === 'conciso') {
    return `\n\nREGLA ESTRICTA DE EXTENSIÓN (Modo Conciso): Redacta de forma directa y sintética, utilizando viñetas (bullet points) breves de 50 a 80 palabras por campo. Ve directo al grano, sin explicaciones redundantes ni relleno.`;
  }

  if (normVerbosity === 'detallado') {
    return `\n\nREGLA ESTRICTA DE EXTENSIÓN (Modo Extenso / Detallado): Elabora un análisis muy profundo, exhaustivo, académico y justificado con alto nivel de detalle descriptivo y analítico para cada campo.`;
  }

  // Nivel normal equilibrado
  return `\n\nREGLA DE EXTENSIÓN (MODO NORMAL EQUILIBRADO): Redacta en un formato profesional y equilibrado, combinando 1 párrafo conciso de fundamentación con viñetas estructuradas (120 a 180 palabras por campo).`;
}

/**
 * Devuelve la instrucción de formato para cada campo individual del JSON esperado.
 * @param {object} field - Objeto de campo { key, label, type }.
 * @param {string} verbosity - Nivel de verbosidad.
 * @param {string} moduleKey - Clave del módulo.
 * @returns {string} Instrucción adaptada al nivel de detalle.
 */
export function getFieldFormatGuidance(field = {}, verbosity = 'normal', moduleKey = '') {
  if (field.type === 'mermaid') {
    return 'Código Mermaid.js válido';
  }

  const mod = (moduleKey || '').toLowerCase();
  if (mod === 'canvas') {
    return '3 a 5 viñetas concisas y directas (ultra-conciso)';
  }

  const normVerbosity = normalizeVerbosity(verbosity);
  if (normVerbosity === 'conciso') {
    return 'Texto conciso en viñetas directas (máximo 60-80 palabras)';
  }

  if (normVerbosity === 'detallado') {
    return 'Texto detallado y ejecutivo directamente vinculado a la propuesta de valor y ubicación del proyecto';
  }

  return 'Texto profesional equilibrado (1 párrafo + viñetas, 120-180 palabras)';
}
