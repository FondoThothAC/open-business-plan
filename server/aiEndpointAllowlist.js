/**
 * [B2] Allowlist única de destinos para los proxies y callbacks de IA del servidor.
 *
 * Nace de la lista que estaba inline en /api/ai/proxy (server/index.js) y se aplica
 * también al endpoint de Ollama que el enjambre recibía del body del request
 * (src/components/Anteproyecto.jsx -> aiConfig -> server/swarm/LlmExecutionEngine.js),
 * que era SSRF-adyacente mientras la ruta fuera pública.
 */

/** Proveedores de inferencia compatibles con OpenAI admitidos por el proxy. */
export const AI_PROVIDER_HOSTS = Object.freeze(new Set([
  'api.b.ai', 'api.groq.com', 'generativelanguage.googleapis.com', 'api.openai.com',
  'api.mistral.ai', 'integrate.api.nvidia.com', 'openrouter.ai', 'api.together.xyz',
  'api.perplexity.ai', 'api.ollama.com', 'ollama.com'
]));

const PUERTOS_OLLAMA_LOCAL = new Set(['11434']);
const HOSTS_OLLAMA_LOCAL = new Set(['localhost', '127.0.0.1', '::1']);

/**
 * ¿Se puede navegar a este endpoint con la credencial del servidor?
 * Reglas: hosts de proveedor con https exacto; la URL del túnel de Ollama si está
 * definida en el entorno; y la instancia LOCAL de Ollama que el propio motor usa por
 * defecto (http://localhost:11434). A propósito NO se aplica aquí el bloqueador de
 * IPs privadas de B6: el loopback de Ollama es un destino intencional y legitimo.
 * @param {string} rawEndpoint
 * @returns {boolean}
 */
export function esEndpointDeProveedorPermitido(rawEndpoint) {
  const bruto = String(rawEndpoint || '').trim();
  if (!bruto) return false;

  let url;
  try {
    url = new URL(bruto);
  } catch {
    return false;
  }

  if (url.protocol === 'https:' && AI_PROVIDER_HOSTS.has(url.hostname)) return true;

  const tunel = process.env.OLLAMA_TUNNEL_URL ? String(process.env.OLLAMA_TUNNEL_URL).trim() : '';
  if (tunel) {
    try {
      const urlTunel = new URL(tunel);
      if (url.origin === urlTunel.origin && url.pathname === '/' ) return true;
      if (bruto === tunel) return true;
    } catch { /* tunel mal formado: se ignora */ }
  }

  if (url.protocol === 'http:' && HOSTS_OLLAMA_LOCAL.has(url.hostname)) {
    const puerto = url.port || (url.protocol === 'http:' ? '80' : '443');
    return PUERTOS_OLLAMA_LOCAL.has(puerto);
  }

  return false;
}
