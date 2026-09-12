import { FRAMEWORKS } from '../config/frameworks.js';
import { FIELD_GUIDES_MAP } from './field_guides.js';

export const PROMPT_CONTRACT_VERSION = '2026-09-reliable-generation-v1';

export const FIELD_PROVENANCE = Object.freeze({
  USER: 'user_provided',
  VERIFIED: 'verified_source',
  CALCULATED: 'calculated',
  ESTIMATE: 'approved_estimate',
  NOT_FOUND: 'not_found',
  LEGACY: 'legacy_unverified'
});

export const fieldAddress = (projectType, pillar, module, field) =>
  `${projectType || 'business'}.${pillar}.${module}.${field}`;

export function getModuleDefinition(projectType, pillarKey, moduleKey) {
  const framework = FRAMEWORKS[projectType] || FRAMEWORKS.business;
  const pillar = framework.pillars.find((item) => item.key === pillarKey);
  return pillar?.modules.find((item) => item.key === moduleKey) || null;
}

export function getFieldContract(projectType, pillar, module, field) {
  const definition = getModuleDefinition(projectType, pillar, module);
  const guide = FIELD_GUIDES_MAP[projectType]?.[field] || FIELD_GUIDES_MAP.business?.[field] || {};
  const declared = definition?.fields.find((item) => (typeof item === 'string' ? item : item.key) === field);
  const type = typeof declared === 'object' ? (declared.type || 'text') : 'text';
  return {
    address: fieldAddress(projectType, pillar, module, field),
    key: field,
    type,
    guide,
    prompt: guide.instruccion || guide.desc || `Completa ${field} exclusivamente con datos del proyecto.`,
    output: type === 'number' ? 'number' : 'text'
  };
}

export function listFrameworkContracts(projectType) {
  const framework = FRAMEWORKS[projectType] || FRAMEWORKS.business;
  return framework.pillars.flatMap((pillar) => pillar.modules.flatMap((module) =>
    module.fields.map((item) => getFieldContract(projectType, pillar.key, module.key, typeof item === 'string' ? item : item.key))
  ));
}

export function createPending({ projectType, pillar, module, field, reason, searched = [], message }) {
  return {
    id: `${fieldAddress(projectType, pillar, module, field)}:${Date.now()}`,
    address: fieldAddress(projectType, pillar, module, field),
    pillar,
    module,
    field,
    status: 'open',
    reason,
    message: message || 'Dato no encontrado. Puedes buscarlo, introducirlo o ignorarlo temporalmente.',
    searched,
    createdAt: new Date().toISOString()
  };
}

export function buildReliableGenerationContract({ projectId, projectType, expectedKeys, evidenceContext = '' }) {
  return `\nCONTRATO DE GENERACIÓN ${PROMPT_CONTRACT_VERSION}\n` +
    `Proyecto activo: ${projectId || 'sin identificar'}\nMetodología: ${projectType || 'business'}\n` +
    'Redacta en español. Usa solamente hechos del proyecto activo, datos calculados o evidencia con fuente identificable. ' +
    'Los documentos de referencia y ejemplos sirven para estructura; nunca copies sus nombres, cifras, ubicaciones, equipos ni certificaciones. ' +
    'No inventes fuentes, empresas, precios, cuotas, permisos o números. Si un dato factual es necesario y no está respaldado, devuelve una cadena vacía para ese campo. ' +
    `Devuelve únicamente JSON válido con estas claves exactas: ${expectedKeys.join(', ')}.\n${evidenceContext}`;
}
