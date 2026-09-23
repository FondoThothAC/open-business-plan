/**
 * @file verbosityManager.js
 * Gestor Centralizado de Verbosidad, Longitud y Formato de Generación con IA
 * Fondo Thoth AC — Open Business Plan
 *
 * Calibra de forma adaptativa la extensión de las respuestas de los agentes
 * según la configuración seleccionada ('conciso', 'normal', 'detallado') y
 * la naturaleza del módulo (reglas ultra-concisas obligatorias para FODA, Canvas, PESTEL, etc.).
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
 * Determina si un módulo requiere formato de viñetas ultra-concisas por su naturaleza matricial.
 * @param {string} moduleKey - Clave del módulo analizado.
 * @returns {boolean}
 */
export function isUltraConciseModule(moduleKey = '') {
  const mod = (moduleKey || '').toLowerCase();
  return mod === 'foda' || mod === 'canvas' || mod === 'pestel' || mod === 'porter' || mod === 'cinco_fuerzas';
}

/**
 * Construye la directiva de extensión a inyectar en el System Prompt.
 * @param {string} verbosity - Nivel de detalle configurado.
 * @param {string} moduleKey - Clave del módulo en ejecución (ej. 'foda', 'canvas', 'pestel').
 * @returns {string} Restricción textual clara para el LLM.
 */
export function buildVerbosityConstraint(verbosity = 'normal', moduleKey = '') {
  const normVerbosity = normalizeVerbosity(verbosity);
  const mod = (moduleKey || '').toLowerCase();

  // Regla especial prioritaria para Análisis FODA (Fortalezas, Oportunidades, Debilidades, Amenazas)
  if (mod === 'foda') {
    return `\n\nREGLA ESTRICTA DE EXTENSIÓN PARA FODA: Formato ultra-conciso obligatorio. Redacta únicamente de 3 a 5 viñetas (bullet points) concretas por cuadrante, compuestas por oraciones cortas y directas al grano (máximo 15 a 25 palabras por viñeta). PROHIBIDO escribir párrafos extensos de fundamentación, introducciones teóricas o relleno narrativo redundante.`;
  }

  // Regla especial prioritaria para Business Model Canvas (9 bloques concisos)
  if (mod === 'canvas') {
    return `\n\nREGLA ESTRICTA DE EXTENSIÓN PARA CANVAS: Formato ultra-conciso obligatorio. Redacta únicamente de 3 a 5 viñetas (bullet points) breves, compuestas por oraciones cortas y directas de máxima síntesis (máximo 15 a 25 palabras por viñeta). PROHIBIDO escribir párrafos extensos, introducciones o explicaciones teóricas redundantes.`;
  }

  // Regla especial para PESTEL (factores claros en viñetas sin lore excesivo)
  if (mod === 'pestel') {
    return `\n\nREGLA ESTRICTA DE EXTENSIÓN PARA PESTEL: Formato ultra-conciso obligatorio. Redacta únicamente de 3 a 4 viñetas (bullet points) concretas, claras y directas por dimensión. Cada viñeta debe ser una oración puntual sin rodeos ni relleno narrativo (máximo 15 a 25 palabras por viñeta). PROHIBIDO redactar párrafos introductorios.`;
  }

  // Regla especial para Porter / Cinco Fuerzas
  if (mod === 'porter' || mod === 'cinco_fuerzas') {
    return `\n\nREGLA ESTRICTA DE EXTENSIÓN PARA 5 FUERZAS DE PORTER: Formato ultra-conciso obligatorio. Redacta de 3 a 4 viñetas (bullet points) cortas y directas por fuerza de la industria (máximo 15 a 25 palabras por viñeta). Sin párrafos introductorios.`;
  }

  if (normVerbosity === 'conciso') {
    return `\n\nREGLA ESTRICTA DE EXTENSIÓN (Modo Conciso): Redacta de forma directa y sintética, utilizando viñetas (bullet points) breves compuestas por oraciones cortas (máximo 15 a 25 palabras por viñeta, total de 40 a 70 palabras por campo). Ve directo al grano, sin introducciones ni explicaciones de relleno.`;
  }

  if (normVerbosity === 'detallado') {
    return `\n\nREGLA ESTRICTA DE EXTENSIÓN (Modo Extenso / Detallado): Elabora un análisis muy profundo, exhaustivo, académico y justificado con alto nivel de detalle descriptivo y analítico para cada campo.`;
  }

  // Nivel normal equilibrado
  return `\n\nREGLA DE EXTENSIÓN (MODO NORMAL EQUILIBRADO): Redacta en un formato profesional y equilibrado, priorizando viñetas estructuradas con oraciones concisas y directas (máximo 80 a 120 palabras por campo), evitando párrafos largos de relleno.`;
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
  if (mod === 'foda') {
    return '3 a 5 viñetas cortas, concisas y directas en oraciones breves (máximo 20 palabras por viñeta, sin párrafo introductorio)';
  }

  if (mod === 'canvas') {
    return '3 a 5 viñetas cortas, concisas y directas (máximo 20 palabras por viñeta, sin explicaciones largas)';
  }

  if (mod === 'pestel') {
    return '3 a 4 viñetas directas y concretas de alto impacto en oraciones cortas';
  }

  if (mod === 'porter' || mod === 'cinco_fuerzas') {
    return '3 a 4 viñetas cortas y concisas analizando la fuerza competitiva';
  }

  const normVerbosity = normalizeVerbosity(verbosity);
  if (normVerbosity === 'conciso') {
    return 'Texto conciso en viñetas directas de oraciones cortas (máximo 50-70 palabras)';
  }

  if (normVerbosity === 'detallado') {
    return 'Texto detallado y ejecutivo directamente vinculado a la propuesta de valor y ubicación del proyecto';
  }

  return 'Texto profesional y conciso en viñetas claras (80-120 palabras)';
}
