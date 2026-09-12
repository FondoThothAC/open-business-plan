const PRIVATE_CONFIG_KEYS = new Set([
  'apiKey', 'groqKey', 'nvidiaKey', 'mistralKey', 'ollamaKey', 'bobOllamaKey',
  'openrouterKey', 'opencodeKey', 'tokenrouterKey', 'pollinationsKey', 'baiKey',
  'inegiToken', 'banxicoToken', 'braveApiKey', 'serperApiKey'
]);

export function sanitizePlanContext(planData = {}) {
  const copy = structuredClone(planData);
  const walk = (value) => {
    if (!value || typeof value !== 'object') return;
    Object.keys(value).forEach((key) => {
      if (PRIVATE_CONFIG_KEYS.has(key) || key === 'aiMemory' || key === 'messages') delete value[key];
      else walk(value[key]);
    });
  };
  walk(copy);
  return copy;
}

export function normalizeDocument(document = {}, ownerProjectId = '') {
  const classification = ['project_evidence', 'method_reference', 'other_project_example'].includes(document.classification)
    ? document.classification
    : 'method_reference';
  return {
    id: document.id || `${document.name || 'documento'}:${Date.now()}`,
    name: document.name || 'Documento sin nombre',
    text: String(document.text || ''),
    classification,
    ownerProjectId: document.ownerProjectId || ownerProjectId,
    source: document.source || null,
    retrievedAt: document.retrievedAt || new Date().toISOString()
  };
}

export function buildEvidenceContext(planData = {}, query = '', limit = 6000) {
  const projectId = planData.config?.projectId || '';
  const words = String(query).toLocaleLowerCase('es-MX').split(/\W+/).filter((word) => word.length > 3);
  const docs = (planData.config?.documents || []).map((doc) => normalizeDocument(doc, projectId));
  return docs
    .filter((doc) => doc.classification === 'project_evidence' && (!doc.ownerProjectId || doc.ownerProjectId === projectId))
    .map((doc) => {
      const paragraphs = doc.text.split(/\n{2,}/).filter(Boolean);
      const selected = paragraphs.filter((paragraph) => words.length === 0 || words.some((word) => paragraph.toLocaleLowerCase('es-MX').includes(word))).join('\n\n') || paragraphs.slice(0, 2).join('\n\n');
      return `EVIDENCIA DEL PROYECTO: ${doc.name}${doc.source ? ` (${doc.source})` : ''}\n${selected}`;
    })
    .join('\n\n')
    .slice(0, limit);
}
