/**
 * @file keys.js
 * @description Centralización estricta de API keys y credenciales del entorno.
 * Prohíbe cualquier literal de clave en código fuente (SECDD).
 * Lee de forma desacoplada desde import.meta.env (cliente Vite) o process.env (Node/Tests).
 */

const getEnvVar = (viteKey, nodeKey) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    return import.meta.env[viteKey];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[nodeKey || viteKey] || process.env[viteKey] || '';
  }
  return '';
};

// Credenciales de datos e investigación compartidas: únicamente servidor.
// Nunca deben convertirse en variables VITE_* porque Vite las incrusta en el navegador.
const getServerEnvVar = (nodeKey) => {
  if (typeof process !== 'undefined' && process.env) return process.env[nodeKey] || '';
  return '';
};

export const KEYS = {
  gemini:       getEnvVar('VITE_GEMINI_KEY', 'GEMINI_KEY'),
  groq:         getEnvVar('VITE_GROQ_KEY', 'GROQ_KEY'),
  mistral:      getEnvVar('VITE_MISTRAL_KEY', 'MISTRAL_KEY'),
  nvidia:       getEnvVar('VITE_NVIDIA_KEY', 'NVIDIA_KEY'),
  openrouter:   getEnvVar('VITE_OPENROUTER_KEY', 'OPENROUTER_KEY'),
  opencode:     getEnvVar('VITE_OPENCODE_KEY', 'OPENCODE_KEY'),
  tokenrouter:  getEnvVar('VITE_TOKENROUTER_KEY', 'TOKENROUTER_KEY'),
  ollama:       getEnvVar('VITE_OLLAMA_KEY', 'OLLAMA_KEY'),
  bobOllama:    getEnvVar('VITE_BOB_OLLAMA_KEY', 'BOB_OLLAMA_KEY'),
  pollinations: getEnvVar('VITE_POLLINATIONS_KEY', 'POLLINATIONS_KEY'),
  bai:          getEnvVar('VITE_BAI_KEY', 'BAI_KEY'),
  denue:        getServerEnvVar('DENUE_KEY'),
  banxico:      getServerEnvVar('BANXICO_KEY'),
  alphaVantage: getEnvVar('VITE_ALPHAVANTAGE_KEY', 'ALPHAVANTAGE_KEY'),
  tavily:       getServerEnvVar('TAVILY_API_KEY'),
  brave:        getServerEnvVar('BRAVE_SEARCH_KEY'),
  serper:       getEnvVar('VITE_SERPER_KEY', 'SERPER_API_KEY')
};
