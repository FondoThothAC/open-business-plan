/**
 * Tipos y definiciones de Boxes metodológicos para Open Business Plan.
 * Fuentes: 13 Libros de referencia (INDICE_PROMPTS_BOXES.md)
 */

export const BOX_TYPES = {
  CANVAS: 'canvas',       // Lienzo de 9 o 3 bloques (Lean / Osterwalder / Micro)
  MATRIX: 'matrix',       // Matriz bidimensional (FODA, Porter 5F, Matriz X, ZOPP 4x4)
  FORMULA: 'formula',     // Modelo cuantitativo (WACC, VAN/TIR, TAM/SAM/SOM, Unit Economics)
  CHECKLIST: 'checklist', // Lista de verificación y cumplimiento (TRL 1-9, DNSH, Legal)
  BENCHMARK: 'benchmark', // Medidor de KPI con bandas de tolerancia y semáforo
  TABLE: 'table'          // Tabla estructurada (Catálogo CSI, Cronograma de Obra)
};

/**
 * Validador básico de estructura de Box
 */
export function isValidBoxDefinition(box) {
  if (!box || typeof box !== 'object') return false;
  if (!box.id || !box.type || !box.title) return false;
  return Object.values(BOX_TYPES).includes(box.type);
}
