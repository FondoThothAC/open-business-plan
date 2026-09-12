const VCV_SIGNATURE = /\b(?:vcv\s*cortes\s*finos|asadhor|planta\s+(?:tipo\s+)?tif|nom-008-zoo|senasica|usda\s*\/?\s*fsis|túnel\s+criogénico|cortes\s+prime\s+asados)\b|\$?\s*16[,.]?8\s*(?:m|millones?|000[,.]?000)/i;

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

export function isVcvProject(planData = {}) {
  const projectId = planData.config?.projectId || '';
  const companyName = planData.config?.brandKit?.companyName || planData.companyName || '';
  return /vcv|cortes\s*finos/i.test(`${projectId} ${companyName}`);
}

export function findProjectContamination(planData = {}) {
  if (isVcvProject(planData)) return [];
  const findings = [];

  const visit = (value, path = []) => {
    if (typeof value === 'string' && VCV_SIGNATURE.test(value)) {
      findings.push({ path: path.join('.'), preview: value.slice(0, 160) });
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, [...path, index]));
      return;
    }
    if (isObject(value)) {
      Object.entries(value).forEach(([key, item]) => visit(item, [...path, key]));
    }
  };

  visit(planData);
  return findings;
}

function sanitizeValue(value) {
  if (typeof value === 'string') return VCV_SIGNATURE.test(value) ? '' : value;
  if (Array.isArray(value)) {
    return value
      .filter((item) => !findProjectContamination({ value: item }).length)
      .map(sanitizeValue);
  }
  if (!isObject(value)) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, sanitizeValue(item)])
  );
}

export function sanitizeProjectContamination(planData = {}) {
  if (isVcvProject(planData)) return planData;
  return sanitizeValue(planData);
}
