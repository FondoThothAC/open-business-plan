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
  const rawText = String(document.text || document.content || '');
  const classification = ['project_evidence', 'method_reference', 'other_project_example'].includes(document.classification)
    ? document.classification
    : (document.isImmutableConstraint || document.name?.toLowerCase().includes('entrevista') || document.name?.toLowerCase().includes('audio') || document.name?.toLowerCase().includes('correcion') ? 'project_evidence' : 'project_evidence');
  return {
    id: document.id || `${document.name || 'documento'}:${Date.now()}`,
    name: document.name || 'Documento sin nombre',
    text: rawText,
    classification,
    ownerProjectId: document.ownerProjectId || ownerProjectId,
    source: document.source || null,
    isImmutableConstraint: Boolean(document.isImmutableConstraint),
    retrievedAt: document.retrievedAt || new Date().toISOString()
  };
}

export function buildEvidenceContext(planData = {}, query = '', limit = 8000) {
  const projectId = planData.config?.projectId || '';
  const words = String(query).toLocaleLowerCase('es-MX').split(/\W+/).filter((word) => word.length > 3);
  const rawDocs = planData.config?.documents || [];
  const docs = rawDocs.map((doc) => normalizeDocument(doc, projectId));

  // Ordenar priorizando documentos con restricciones inmutables o hechos validados por el usuario
  const sortedDocs = [...docs].sort((a, b) => {
    if (a.isImmutableConstraint && !b.isImmutableConstraint) return -1;
    if (!a.isImmutableConstraint && b.isImmutableConstraint) return 1;
    return 0;
  });

  return sortedDocs
    .filter((doc) => doc.classification === 'project_evidence' && (!doc.ownerProjectId || doc.ownerProjectId === projectId))
    .map((doc) => {
      const paragraphs = doc.text.split(/\n{2,}/).filter(Boolean);
      const selected = paragraphs.filter((paragraph) => words.length === 0 || words.some((word) => paragraph.toLocaleLowerCase('es-MX').includes(word))).join('\n\n') || paragraphs.slice(0, 4).join('\n\n');
      const badge = doc.isImmutableConstraint ? '⚠️ RESTRICCIÓN Y HECHO INVIOLABLE VALIDADO' : 'EVIDENCIA DEL PROYECTO';
      return `${badge}: ${doc.name}${doc.source ? ` (${doc.source})` : ''}\n${selected}`;
    })
    .join('\n\n---\n\n')
    .slice(0, limit);
}
