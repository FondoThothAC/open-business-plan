/**
 * [B6] Validador de URLs para todo lo que el servidor navega por cuenta del usuario.
 *
 * Motivo: /api/scrape/social pasaba req.body.url directo a puppeteer page.goto(), y
 * /api/market/enrich tomaba URLs de resultados de búsqueda filtradas por substring, así
 * que https://127.0.0.1:9229/?x=facebook.com llegaba al navegador. Un servidor puede ser
 * usado para leer metadata de nubes (169.254.169.254), el propio panel (127.0.0.1:3001)
 * o el DevTools de Chromium (9229), o para abrir file:///etc/passwd.
 *
 * Nota de dependencia: ipaddr.js existe en node_modules pero solo como dependencia
 * TRANSITIVA de express (vía proxy-addr); importarla sería una dependencia fantasma.
 * Los rangos se evalúan aquí con node:dns (builtin) y aritmética de bytes.
 */
import dns from 'node:dns';

const PROMESA_DNS = dns.promises;

export class UrlNoPermitida extends Error {
  constructor(motivo = 'URL no permitida.') {
    super(motivo);
    this.name = 'UrlNoPermitida';
    this.code = 'URL_NOT_ALLOWED';
  }
}

const HOSTS_BLOQUEADOS = ['localhost', 'metadata.google.internal', 'metadata'];
const SUFIJOS_BLOQUEADOS = ['.local', '.internal', '.home.arpa', '.localhost'];

function parsearIpv4(texto) {
  const partes = String(texto).split('.');
  if (partes.length !== 4) return null;
  const bytes = [];
  for (const p of partes) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const n = Number(p);
    if (n > 255) return null;
    bytes.push(n);
  }
  return bytes;
}

/**
 * ¿La IP está en un rango no enrutable desde el scraper?
 * @param {string} ip v4 o v6 (sin corchetes)
 */
/** Rangos IPv4 que el scraper nunca debe alcanzar. */
function rangoV4Prohibido(bytes) {
  const [a, b, c] = bytes;
  if (a === 0) return true;                                  // 0.0.0.0/8
  if (a === 10) return true;                                 // 10/8
  if (a === 100 && b >= 64 && b <= 127) return true;         // 100.64/10 CGNAT
  if (a === 127) return true;                                // loopback
  if (a === 169 && b === 254) return true;                   // link-local / metadata de nube
  if (a === 172 && b >= 16 && b <= 31) return true;          // 172.16/12
  if (a === 192 && b === 0 && c === 2) return true;          // 192.0.2/24 TEST-NET-1
  if (a === 192 && b === 168) return true;                   // 192.168/16
  if (a === 198 && b >= 18 && b <= 19) return true;          // 198.18/15 benchmarking
  if (a === 203 && b === 0 && c === 113) return true;        // 203.0.113/24 TEST-NET-3
  if (a >= 224) return true;                                 // multicast y reservada
  return false;
}

export function esIpPrivada(ip) {
  const texto = String(ip || '').trim().replace(/^\[|\]$/g, '').toLowerCase();
  if (!texto) return true;

  const v4 = parsearIpv4(texto);
  if (v4) return rangoV4Prohibido(v4);

  if (texto.includes(':')) {
    // IPv6. Si lleva un IPv4 incrustado (::ffff:127.0.0.1 o la forma mixta de doble punto)
    // se evala ESE v4, y solo si es un v4 valido: si no lo es, se rechaza por seguridad.
    const mixta = texto.match(/((?:\d{1,3}\.){3}\d{1,3})$/);
    if (mixta) {
      const interna = parsearIpv4(mixta[1]);
      return interna ? rangoV4Prohibido(interna) : true;
    }
    if (texto === '::' || texto === '::1') return true;
    if (/^f[cd][0-9a-f]{2}:/.test(texto)) return true;   // fc00::/7 ULA
    if (/^fe[89ab][0-9a-f]:/.test(texto)) return true;   // fe80::/10 link-local
    if (/^ff/.test(texto)) return true;                  // ff00::/8 multicast
    if (/^2001:db8:/.test(texto)) return true;           // documentacion
    // Túneles y formas de IPv6 que pueden acabar apuntando a una red interna. Un scraper
    // no tiene ningún motivo legítimo para alcanzarlos, así que se rechazan en bloque
    // (fallo cerrado) en lugar de intentar decodificar la v4 encapsulada:
    //   2002::/16 6to4, 2001::/32 Teredo, 64:ff9b::/96 NAT64, 100::/64 discard-only,
    //   2001:10::/28 ORCHID e interfaces de enlace.
    if (/^(2002:|2001:0|2001::|64:ff9b:|100:|2001:20|2620:108)/.test(texto)) return true;
    return false;
  }

  // No es ni un v4 ni un v6 parseable: fallo cerrado.
  return true;
}

/**
 * Chequeo SIN resolver DNS: esquema, userinfo, puerto, IP literal y nombres internos.
 * Se usa también para revalidar las redirecciones que el navegador sigue por su cuenta
 * (page.on('request')), donde no se puede aguardar una resolución.
 * @param {string} raw
 * @returns {boolean}
 */
export function isSafeUrlShapeSync(raw) {
  let url;
  try {
    url = new URL(String(raw));
  } catch {
    return false;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  if (url.username || url.password) return false;
  if (url.port && url.port !== '80' && url.port !== '443') return false;

  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!host) return false;
  if (HOSTS_BLOQUEADOS.includes(host)) return false;
  if (SUFIJOS_BLOQUEADOS.some((s) => host.endsWith(s))) return false;

  // Si es IP literal, se decide por rango. Si es nombre, la validación de rango espera al DNS.
  const esLiteral = parsearIpv4(host) !== null || host.includes(':');
  if (esLiteral) return !esIpPrivada(host);

  return true;
}

/**
 * Validación completa, resolviendo DNS y revalidando cada respuesta.
 * @param {string} raw
 * @returns {Promise<{ url: URL, ips: string[] }>}
 */
export async function assertSafeExternalUrl(raw, { resolver = PROMESA_DNS.lookup } = {}) {
  if (!isSafeUrlShapeSync(raw)) throw new UrlNoPermitida();
  const url = new URL(String(raw));
  const host = url.hostname.replace(/^\[|\]$/g, '');

  const esLiteral = parsearIpv4(host) !== null || host.includes(':');
  if (esLiteral) return { url, ips: [host] };

  let registros;
  try {
    // El resolvedor se puede inyectar para probar la revalidacion de DNS sin red real:
    // el suite no puede depender de que google.com resuelva ni de que un .invalid no.
    registros = await resolver(host, { all: true, verbatim: true });
  } catch {
    throw new UrlNoPermitida();   // no se revela si el fallo fue "no existe" o "es privado"
  }
  const ips = registros.map((r) => r.address);
  if (ips.length === 0) throw new UrlNoPermitida();
  if (ips.some(esIpPrivada)) throw new UrlNoPermitida();
  return { url, ips };
}

/**
 * Extrae el dominio registrable comparable de una URL, para sustituir los filtros por
 * substring (que dejaban pasar https://127.0.0.1:9229/?x=facebook.com).
 * @param {string} raw
 * @returns {string|null} hostname en minúsculas, o null si la URL no es parseable
 */
export function hostnameDe(raw) {
  try {
    return new URL(String(raw)).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * ¿El hostname es exactamente el dominio o un subdominio suyo?
 * @param {string} hostname
 * @param {string} dominio ej. 'facebook.com'
 */
export function perteneceADominio(hostname, dominio) {
  const h = String(hostname || '').toLowerCase();
  const d = String(dominio || '').toLowerCase();
  if (!h || !d) return false;
  return h === d || h.endsWith(`.${d}`);
}
