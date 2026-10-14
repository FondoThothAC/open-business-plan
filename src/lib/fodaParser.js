/**
 * @file fodaParser.js
 * @description Motor de parseo, serialización, detección pedagógica de fronteras PESTEL
 * y Ley de Conversión a Fortalezas para el módulo FODA en Open Business Plan.
 * Fondo Thoth AC — Metodología de Empresas Cuánticas.
 */

/**
 * Términos y expresiones que indican regulación, leyes o reformas macroambientales
 * que metodológicamente pertenecen a PESTEL (Dimensión Legal / Política).
 */
export const PESTEL_LEGAL_TERMS = Object.freeze([
  'reforma fiscal',
  'reforma laboral',
  'código fiscal',
  'código de comercio',
  'ley del mercado de valores',
  'ley federal del trabajo',
  'ley general de sociedades mercantiles',
  'lft',
  'lisr',
  'iva',
  'sat',
  'cofepris',
  'semarnat',
  'nom-',
  'norma oficial mexicana',
  'normativa obligatoria',
  'marco regulatorio',
  'marco legal',
  'decreto presidencial',
  'arancel de importación',
  'aranceles',
  'permiso sanitario',
  'permisos sanitarios',
  'inspección sanitaria',
  'licencia gubernamental',
  'licencias gubernamentales'
]);

/**
 * Regex compilada para detección eficiente de términos legales en texto FODA.
 */
const LEGAL_REGEX = new RegExp(
  `\\b(${PESTEL_LEGAL_TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
  'i'
);

/**
 * Limpia y normaliza una línea de viñeta FODA.
 * @param {string} line - Texto crudo de la línea.
 * @returns {string} Texto limpio sin marcadores de viñeta.
 */
function cleanBulletLine(line = '') {
  return String(line || '')
    .trim()
    .replace(/^[-*•]\s+/, '')
    .replace(/^\d+[\.\)]\s+/, '')
    .trim();
}

/**
 * Parsea un texto Markdown en una lista estructurada de factores individuales.
 * Soporta viñetas de guion (-), asterisco (*), números o saltos de línea.
 *
 * @param {string} text - Contenido Markdown o texto del cuadrante FODA.
 * @param {string} [category='fortalezas'] - Cuadrante de origen ('fortalezas', 'oportunidades', 'debilidades', 'amenazas').
 * @returns {Array<{ id: string, text: string, category: string, isLegalWarning: boolean, matchedTerm: string|null }>}
 */
export function parseFodaText(text = '', category = 'fortalezas') {
  if (!text || typeof text !== 'string') return [];

  const rawLines = text.split(/\r?\n/);
  const items = [];

  for (let i = 0; i < rawLines.length; i++) {
    const cleaned = cleanBulletLine(rawLines[i]);
    if (!cleaned) continue;

    const legalCheck = detectLegalInFoda(cleaned);

    items.push({
      id: `foda_${category}_${i}_${Math.random().toString(36).substring(2, 7)}`,
      text: cleaned,
      category,
      isLegalWarning: legalCheck.isLegal,
      matchedTerm: legalCheck.matchedTerm
    });
  }

  return items;
}

/**
 * Serializa un conjunto de elementos o textos hacia formato Markdown canónico.
 * Cada elemento se precede por un guion '-' estándar.
 *
 * @param {Array<{ text: string } | string>} items - Lista de ítems o cadenas de texto.
 * @returns {string} Texto Markdown formateado con viñetas.
 */
export function serializeFodaItems(items = []) {
  if (!Array.isArray(items)) return '';

  return items
    .map((item) => {
      const val = typeof item === 'object' && item !== null ? item.text : item;
      const clean = cleanBulletLine(val);
      return clean ? `- ${clean}` : null;
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Evalúa si un factor descrito corresponde a una regulación macroambiental que
 * debe ubicarse en PESTEL (Legal) en lugar del FODA operativo.
 *
 * @param {string} text - Texto del factor a evaluar.
 * @returns {{ isLegal: boolean, matchedTerm: string|null, advice: string|null }}
 */
export function detectLegalInFoda(text = '') {
  const str = String(text || '').trim();
  if (!str) return { isLegal: false, matchedTerm: null, advice: null };

  const match = str.match(LEGAL_REGEX);
  if (match) {
    return {
      isLegal: true,
      matchedTerm: match[0],
      advice: `💡 Sugerencia Pedagógica: Este punto menciona "${match[0]}", un factor regulatorio del macroentorno. Las leyes y normas gubernamentales se analizan en PESTEL (Dimensión Legal). En FODA enfócate en las capacidades operativas directas de la empresa.`
    };
  }

  return {
    isLegal: false,
    matchedTerm: null,
    advice: null
  };
}

/**
 * Ley de Conversión a Fortalezas (Fondo Thoth AC / TOWS Action Plan).
 * Transforma un factor de Debilidad, Oportunidad o Amenaza en una nueva Fortaleza
 * construida a partir de una acción, inversión, blindaje o delegación cuántica.
 *
 * @param {{ text: string } | string} item - Elemento original de FODA.
 * @param {'debilidades' | 'oportunidades' | 'amenazas'} category - Cuadrante origen.
 * @param {string} actionPlan - Acción concreta o capacidad instalada que opera la conversión.
 * @returns {string} Texto de la nueva Fortaleza generada.
 */
export function transformToFortaleza(item, category, actionPlan = '') {
  const itemText = cleanBulletLine(typeof item === 'object' && item !== null ? item.text : item);
  const plan = String(actionPlan || '').trim();

  if (category === 'debilidades') {
    return `Fortaleza construida superando debilidad ("${itemText}"): ${plan}`;
  }

  if (category === 'oportunidades') {
    return `Capacidad instalada para capturar oportunidad ("${itemText}"): ${plan}`;
  }

  if (category === 'amenazas') {
    return `Blindaje operativo ante amenaza ("${itemText}"): ${plan}`;
  }

  return plan || itemText;
}
