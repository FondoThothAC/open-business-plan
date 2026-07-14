export const safeStr = (val, level = 0) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    let cleanVal = val.trim();
    // Quitar colón inicial que a veces deja la extracción regex fallida
    if (cleanVal.startsWith(':')) {
      cleanVal = cleanVal.substring(1).trim();
    }
    // Intentar parsear JSON si parece un array u objeto codificado como texto
    if ((cleanVal.startsWith('[') && cleanVal.endsWith(']')) || 
        (cleanVal.startsWith('{') && cleanVal.endsWith('}'))) {
      try {
        const parsed = JSON.parse(cleanVal);
        return safeStr(parsed, level);
      } catch (_) {
        // Fallback al valor string original si falla el parseo
      }
    }
    return cleanVal;
  }
  if (Array.isArray(val)) {
    return val.map(v => {
      if (typeof v === 'object' && v !== null) return safeStr(v, level);
      return `${'  '.repeat(level)}- ${v}`;
    }).join('\n');
  }
  if (typeof val === 'object') {
    try {
      return Object.entries(val).map(([k, v]) => {
        const indent = '  '.repeat(level);
        const keyName = k.replace(/_/g, ' ').charAt(0).toUpperCase() + k.replace(/_/g, ' ').slice(1);
        if (typeof v === 'object' && v !== null) {
          return `${indent}**${keyName}**:\n${safeStr(v, level + 1)}`;
        }
        return `${indent}**${keyName}**: ${v}`;
      }).join('\n\n');
    } catch(_) { return String(val); }
  }
  return String(val);
};
