/**
 * Procedencia e investigación para el módulo PESTEL calificado.
 *
 * Dos responsabilidades, ambas funciones puras sobre datos:
 *
 * 1. Sello de procedencia. Un factor de la matriz solo vale lo que vale su fuente, así que
 *    se etiqueta con el mismo vocabulario que ya usa el resto de la app
 *    (`tagReal` de tools/provenance.js): provenance, provider, sourceUrl y confianza.
 *    La confianza depende del tipo de medio —oficial, sectorial o prensa— y no del contenido.
 *
 * 2. Investigación de candidatos. Construye las consultas por dimensión, normaliza lo que
 *    devuelve la cascada de búsqueda (Tavily / Brave / Serper / DuckDuckGo vía /api/search)
 *    y separa los candidatos en tres cajones honestos: dentro de la ventana de fechas,
 *    sin fecha verificable y fuera de ventana. Nada de esto escribe en el plan: quien
 *    aprueba una fila eres tú, con IP, Ir y p(x) a la vista.
 */
import { tagReal } from './tools/provenance.js';
import { computeImpact, classifyImpact, PESTEL_DIMENSIONS } from './pestelMatrix.js';

const DOMINIOS_OFICIALES = [
  'dof.gob.mx', 'www.dof.gob.mx', 'sidof.segob.gob.mx', 'inegi.org.mx', 'www.inegi.org.mx',
  'banxico.org.mx', 'www.banxico.org.mx', 'senasica.gob.mx', 'www.senasica.gob.mx',
  'gob.mx', 'unfccc.int', 'cambioclimatico.gob.mx', 'oecd.org', 'worldbank.org'
];
const DOMINIOS_SECTORIALES = [
  'comecarne.org', 'amvo.org.mx', 'anetif', 'sian.gob.mx', 'gob.mx/siap', 'conasami'
];

/** oficial > sectorial > prensa > desconocida, decidido por el dominio de la URL. */
export function clasificarFuente(url = '') {
  const dominio = String(url || '').toLowerCase();
  if (!dominio) return { tipo: 'desconocida', confianza: 0.5 };
  if (DOMINIOS_SECTORIALES.some((d) => dominio.includes(d))) return { tipo: 'sectorial', confianza: 0.9 };
  if (DOMINIOS_OFICIALES.some((d) => dominio.includes(d))) return { tipo: 'oficial', confianza: 0.98 };
  if (/gob\.mx/.test(dominio)) return { tipo: 'oficial', confianza: 0.98 };
  if (/\.(com|mx|org|es|net)/.test(dominio)) return { tipo: 'prensa', confianza: 0.8 };
  return { tipo: 'desconocida', confianza: 0.5 };
}

/**
 * Sello de procedencia de un factor ya calificado.
 * Sin URL no hay 'real': se marca como pendiente en vez de inflar la confianza.
 */
export function selloProcedencia(factor = {}) {
  const url = factor.url || factor.sourceUrl || null;
  if (!url) {
    return {
      provenance: 'none',
      provider: null,
      sourceUrl: null,
      confidenceScore: 0,
      warning: 'FUENTE-PENDIENTE: el factor no tiene URL verificable'
    };
  }
  const { tipo, confianza } = clasificarFuente(url);
  const sello = tagReal(factor.fuente || tipo, url, confianza);
  return {
    ...sello,
    tipoFuente: tipo,
    retrievedAt: factor.recuperadaEn || sello.retrievedAt,
    warning: factor.fecha ? null : 'FUENTE-PENDIENTE: la fuente no tiene fecha de publicación'
  };
}

/** Aplica el sello a toda la matriz y reporta qué filas quedaron pendientes. */
export function enriquecerMatriz(matriz = []) {
  const pendientes = [];
  const enriquecida = matriz.map((factor) => {
    const sello = selloProcedencia(factor);
    if (sello.provenance !== 'real' || sello.warning) pendientes.push(factor.n ?? factor.factor);
    return { ...factor, ...sello };
  });
  return { matriz: enriquecida, pendientes };
}

/** Una consulta por dimensión, apuntando a fuentes mexicanas con año explícito. */
export function construirConsultas({ empresa = '', giro = 'cárnico', anios = ['2025', '2026'] } = {}) {
  const ENFOQUES = {
    politico: 'política pública gobierno apoyo microempresa pequeña',
    economico: 'inflación tipo de cambio salario mínimo precio',
    social: 'consumo hogares demografía población tendencia',
    tecnologico: 'tecnología comercio electrónico digitalización adopción',
    ecologico: 'sequía agua medio ambiente sostenibilidad impacto',
    legal: 'reforma ley norma oficial NOM cumplimiento vigente'
  };
  const contexto = [giro, empresa].filter(Boolean).join(' ');
  return PESTEL_DIMENSIONS.map((dim) => ({
    dim: dim.key,
    label: dim.label,
    query: `${ENFOQUES[dim.key]} ${contexto} Sonora México (${anios.join(' ')}) site:gob.mx OR informe sectorial`.replace(/\s+/g, ' ').trim()
  }));
}

/** Normaliza los resultados crudos de /api/search a candidatos de una dimensión. */
export function normalizarCandidatos(resultados = [], dim = '') {
  return (Array.isArray(resultados) ? resultados : []).map((r) => ({
    dim,
    titulo: r.title || r.titulo || '',
    url: r.url || null,
    resumen: r.snippet || r.resumen || '',
    fecha: r.publishedDate || r.fecha || null,
    provider: r.provider || 'busqueda',
    provenance: r.provenance || 'real'
  })).filter((c) => c.url);
}

/** true / false sobre ISO o timestamp; null cuando no hay fecha o no hay ventana configurada. */
export function dentroDeVentana(fecha, ventana = {}) {
  if (!fecha) return null;
  if (!ventana?.desde || !ventana?.hasta) return null;
  const iso = /^\d+$/.test(String(fecha))
    ? new Date(Number(fecha) * 1000).toISOString().slice(0, 10)
    : String(fecha).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  if (ventana.desde && iso < ventana.desde) return false;
  if (ventana.hasta && iso > `${ventana.hasta}-31`) return false;
  return true;
}

const normalizarTexto = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 80);

/**
 * Reparte los candidatos en cajones honestos. `sinFecha` no es un error de la búsqueda:
 * es la respuesta correcta cuando el proveedor no devolvió fecha de publicación.
 */
export function clasificarCandidatos(candidatos = [], { ventana, matrizActual = [] } = {}) {
  const existentes = new Set(matrizActual.map((f) => normalizarTexto(f.factor)));
  const vistos = new Set();
  const salida = { aptos: [], sinFecha: [], fueraDeVentana: [], duplicados: [] };
  for (const c of candidatos) {
    // La misma URL puede aparecer en las seis consultas: se queda la primera dimensión.
    if (vistos.has(c.url)) { salida.duplicados.push(c); continue; }
    vistos.add(c.url);
    const enVentana = dentroDeVentana(c.fecha, ventana);
    if (existentes.has(normalizarTexto(c.titulo))) salida.duplicados.push(c);
    else if (enVentana === false) salida.fueraDeVentana.push(c);
    else if (enVentana === null) salida.sinFecha.push(c);
    else salida.aptos.push(c);
  }
  return salida;
}

/**
 * Convierte un candidato aprobado en fila de matriz. Exige fecha y calificación humana:
 * sin IP, Ir o p(x) no se fabrica el impacto, se devuelve el motivo.
 */
export function candidatoAFactor(candidato = {}, { ip, ir, px, oa, n } = {}) {
  const valores = [ip, ir, px].map(Number);
  if (valores.some((v) => !Number.isFinite(v))) return { error: 'Faltan IP, Ir o p(x): la calificación es humana.' };
  if (ip < 1 || ip > 3 || ir < 1 || ir > 3) return { error: 'IP e Ir van de 1 a 3.' };
  if (px < 0 || px > 1) return { error: 'p(x) va de 0 a 1.' };
  if (!['A', 'O'].includes(oa)) return { error: 'Indica si es amenaza (A) u oportunidad (O).' };
  if (!candidato.fecha) return { error: 'La fuente no tiene fecha de publicación verificable.' };
  if (!candidato.url) return { error: 'La fuente no tiene URL.' };

  const impacto = computeImpact(ip, ir, px);
  const factor = {
    n,
    dim: candidato.dim,
    oa,
    factor: candidato.titulo,
    fuente: candidato.provider,
    fecha: String(candidato.fecha).slice(0, 10),
    url: candidato.url,
    ip: Number(ip),
    tendencia: oa === 'A' ? '-' : '+',
    ir: Number(ir),
    px: Number(px),
    impacto,
    clasificacion: classifyImpact(impacto),
    justificacion_px: candidato.resumen ? `${candidato.resumen.slice(0, 220)}…` : ''
  };
  return { factor, sello: selloProcedencia(factor) };
}
