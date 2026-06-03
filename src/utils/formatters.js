export const safeStr = (val, level = 0) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    return val.map(v => {
      if (typeof v === 'object') return safeStr(v, level);
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
