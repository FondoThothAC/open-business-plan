import { createPending } from './planContracts.js';

const FAILURE_TEXT = /informaci[oó]n no generada correctamente|information not generated correctly|an[aá]lisis estrat[eé]gico estructurado para|^\s*$/i;
const SPANISH_MARKERS = /\b(para|con|del|los|las|una|que|empresa|proyecto|mercado|datos)\b/i;
const FOREIGN_MARKERS = /\b(the|and|with|this|business|market|project|data|therefore)\b/i;

export function validateGenerationResult({ result, projectType, pillar, module, expectedKeys, searched = [] }) {
  const valid = {};
  const pendings = [];
  const source = result && typeof result === 'object' ? result : {};
  expectedKeys.forEach((field) => {
    const value = source[field];
    if (typeof value !== 'string' && typeof value !== 'number' && !Array.isArray(value) && !(value && typeof value === 'object')) {
      pendings.push(createPending({ projectType, pillar, module, field, reason: 'missing_output', searched }));
      return;
    }
    const text = typeof value === 'string' ? value.trim() : JSON.stringify(value);
    if (FAILURE_TEXT.test(text)) {
      pendings.push(createPending({ projectType, pillar, module, field, reason: 'invalid_output', searched }));
      return;
    }
    if (FOREIGN_MARKERS.test(text) && !SPANISH_MARKERS.test(text)) {
      pendings.push(createPending({ projectType, pillar, module, field, reason: 'language_mismatch', searched, message: 'La respuesta no quedó en español y requiere reparación.' }));
      return;
    }
    valid[field] = value;
  });
  return { valid, pendings, isComplete: pendings.length === 0 };
}
