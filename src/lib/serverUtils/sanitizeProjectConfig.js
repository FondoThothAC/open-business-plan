const SECRET_CONFIG_KEYS = new Set([
  'apiKey', 'apiKeys', 'ollamaKey', 'bobOllamaKey', 'groqKey', 'nvidiaKey',
  'mistralKey', 'openaiKey', 'geminiKey', 'openrouterKey', 'opencodeKey',
  'tokenrouterKey', 'orcaRouterKey', 'baiKey', 'tavilyKey', 'braveKey',
  'braveApiKey', 'serperApiKey', 'inegiToken', 'banxicoToken'
]);

export function sanitizeProjectConfig(config = {}) {
  const clean = structuredClone(config || {});
  delete clean.externalApis;
  delete clean.apiKeys;

  if (clean.ai && typeof clean.ai === 'object') {
    for (const key of Object.keys(clean.ai)) {
      if (SECRET_CONFIG_KEYS.has(key) || /(?:api)?key$/i.test(key) || /token$/i.test(key)) {
        delete clean.ai[key];
      }
    }
  }

  return clean;
}

