/**
 * Box ID Manager & Versioning Audit Trail — Open Business Plan
 * 
 * Gestiona:
 * 1. Asignación unívoca y bidireccional de IDs numéricos (ej. #BOX-512) y semánticos a cada Box.
 * 2. Resolución elástica de comandos desde el chat ("box 512", "#BOX-512", "layout industrial").
 * 3. Historial de versiones y auditoría de cambios por Box (quién lo hizo, si fue IA o manual, diff y prompt).
 * 4. Registro de correcciones como hechos inmutables ("Correction-as-Evidence") en el RAG.
 */

// Mapeo canónico de números de Box a claves técnicas
const CANONICAL_NUMERIC_MAP = {
  // Operaciones & Layout
  'box_layout_industrial': 512,
  'box_kpi_otd_dso_dio_ccc': 501,
  'box_dnsh_ambiental': 502,
  'box_onudi_industrial': 503,

  // Mercado & Clientes
  'box_tam_sam_som': 101,
  'box_cascada_mercado_3niveles': 102,
  'box_aarrr_pirata_5metricas': 103,
  'box_benchmark_cac_ltv': 104,
  'box_unit_economics': 105,

  // Estrategia & Matrices
  'box_resumen_ejecutivo_1p': 201,
  'box_canvas_osterwalder': 202,
  'box_lean_canvas': 203,
  'box_swot_foda': 204,
  'box_matriz_x': 205,
  'box_arbol_problemas_mml': 206,
  'box_guanxi': 207,
  'box_amoeba': 208,

  // Finanzas & Evaluación
  'box_wacc_van_tir': 301,
  'box_burn_runway': 302,
  'box_sensibilidad_tornado': 303,
  'box_frli_liquidacion': 304,

  // Validación & Protocolos
  'box_mvp_protocol': 401,
  'box_trl_nasa': 402,
  'box_due_diligence': 403
};

// Generador de fallback determinista para cajas adicionales
function hashBoxKeyToNumber(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash) + key.charCodeAt(i);
    hash |= 0;
  }
  return 600 + (Math.abs(hash) % 399); // Rango 600-999
}

/**
 * Retorna el número de Box asignado (ej. 512)
 */
export function getBoxNumber(boxKey) {
  if (!boxKey) return 999;
  return CANONICAL_NUMERIC_MAP[boxKey] || hashBoxKeyToNumber(boxKey);
}

/**
 * Retorna la etiqueta visual corta (ej. "#BOX-512")
 */
export function getBoxBadgeLabel(boxKey) {
  const num = getBoxNumber(boxKey);
  return `#BOX-${num}`;
}

/**
 * Resuelve una entrada libre del usuario (ej. "512", "box 512", "#BOX-512", "layout industrial", "foda")
 * a la clave técnica canónica del Box (`box_layout_industrial`).
 */
export function resolveBoxKey(input) {
  if (!input) return null;
  const str = String(input).trim().toLowerCase();

  // 1. Detección directa de número de box (ej. "512", "box 512", "#box-512")
  const numMatch = str.match(/(?:box[\s-_#]*)?(\d{3})/i);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    const entry = Object.entries(CANONICAL_NUMERIC_MAP).find(([, val]) => val === num);
    if (entry) return entry[0];
  }

  // 2. Coincidencia exacta de clave canónica
  if (CANONICAL_NUMERIC_MAP[str]) return str;

  // 3. Coincidencias semánticas frecuentes
  if (str.includes('layout') || str.includes('planta') || str.includes('distribucion')) return 'box_layout_industrial';
  if (str.includes('foda') || str.includes('swot')) return 'box_swot_foda';
  if (str.includes('tam') || str.includes('mercado total') || str.includes('sam')) return 'box_tam_sam_som';
  if (str.includes('unit economics') || str.includes('cac') || str.includes('ltv')) return 'box_unit_economics';
  if (str.includes('canvas')) return str.includes('lean') ? 'box_lean_canvas' : 'box_canvas_osterwalder';
  if (str.includes('van') || str.includes('tir') || str.includes('wacc')) return 'box_wacc_van_tir';
  if (str.includes('arbol') || str.includes('mml') || str.includes('zopp')) return 'box_arbol_problemas_mml';
  if (str.includes('matriz x') || str.includes('hoshin')) return 'box_matriz_x';
  if (str.includes('amoeba') || str.includes('inamori')) return 'box_amoeba';
  if (str.includes('guanxi')) return 'box_guanxi';
  if (str.includes('otd') || str.includes('ccc') || str.includes('ciclo')) return 'box_kpi_otd_dso_dio_ccc';
  if (str.includes('dnsh')) return 'box_dnsh_ambiental';

  return null;
}

/**
 * Obtiene el historial de versiones de un Box específico
 */
export function getBoxHistory(planData, boxKey) {
  if (!planData?.config?.boxHistory) return [];
  return planData.config.boxHistory[boxKey] || [];
}

/**
 * Registra una nueva versión de cambio en el historial del Box
 */
export function appendBoxVersion(planData, {
  boxKey,
  previousValue = null,
  newValue = null,
  author = 'consultor',
  isAi = false,
  promptUsed = null,
  ragContextSnippet = null,
  changeReason = 'Actualización de contenido'
}) {
  if (!planData.config) planData.config = {};
  if (!planData.config.boxHistory) planData.config.boxHistory = {};
  if (!Array.isArray(planData.config.boxHistory[boxKey])) {
    planData.config.boxHistory[boxKey] = [];
  }

  const history = planData.config.boxHistory[boxKey];
  const nextVersion = history.length + 1;

  const versionEntry = {
    version: nextVersion,
    timestamp: new Date().toISOString(),
    author,
    isAi: Boolean(isAi),
    promptUsed: promptUsed || (isAi ? 'Regeneración asistida con DeepSeek Harness' : 'Edición manual directa'),
    ragContextSnippet: ragContextSnippet || null,
    changeReason,
    previousValue,
    newValue
  };

  history.push(versionEntry);
  return versionEntry;
}

/**
 * Feedback Loop "Correction-as-Evidence":
 * Registra una corrección del usuario como un hecho inmutable en el almacén de RAG del proyecto.
 */
export function recordValidatedFactAsEvidence(planData, { fact, boxKey, author = 'usuario' }) {
  if (!planData.config) planData.config = {};
  if (!Array.isArray(planData.config.documents)) planData.config.documents = [];

  const docName = 'Hechos y Restricciones Validadas del Proyecto';
  let factDoc = planData.config.documents.find(d => d.name === docName);

  const boxBadge = boxKey ? getBoxBadgeLabel(boxKey) : '#GENERAL';
  const timestamp = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const newFactLine = `- [${boxBadge}][${timestamp}] (Por: ${author}): ${fact}`;

  if (!factDoc) {
    factDoc = {
      name: docName,
      path: 'internal/validated_facts.md',
      size: 0,
      classification: 'project_evidence',
      isImmutableConstraint: true,
      status: 'processed',
      summary: 'Hechos inmutables y correcciones directas validadas por los consultores/dueños del proyecto.',
      content: `# Hechos y Restricciones Inviolables Validadas por el Usuario\n\n> **IMPORTANTE PARA EL MOTOR DE IA (SYSTEM PROMPT):** Las siguientes directivas son hechos y restricciones validadas por los directores del proyecto. NINGÚN módulo o cálculo debe contradecir estos hechos.\n\n${newFactLine}\n`,
      updatedAt: new Date().toISOString()
    };
    factDoc.size = factDoc.content.length;
    planData.config.documents.unshift(factDoc);
  } else {
    // Evitar duplicados exactos
    if (!factDoc.content.includes(fact)) {
      factDoc.content += `\n${newFactLine}`;
      factDoc.size = factDoc.content.length;
      factDoc.updatedAt = new Date().toISOString();
      factDoc.isImmutableConstraint = true;
      factDoc.classification = 'project_evidence';
    }
  }

  return factDoc;
}
