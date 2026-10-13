/**
 * Núcleo del módulo PESTEL calificado.
 *
 * El proyecto guarda en `naturaleza.pestel` seis campos de texto libre (politico…legal).
 * Cuando además existe `pestel.matriz`, el módulo deja de ser prosa y pasa a ser una
 * matriz calificada: cada factor trae importancia (IP), tendencia (T), incidencia (Ir),
 * probabilidad p(x) y el impacto resultante de la fórmula de la unidad. Los seis textos
 * legacy se regeneran a partir de la matriz para que siga habiendo una sola fuente de verdad.
 */

export const PESTEL_DIMENSIONS = [
  { key: 'politico', label: 'Político', letra: 'P' },
  { key: 'economico', label: 'Económico', letra: 'E' },
  { key: 'social', label: 'Social', letra: 'S' },
  { key: 'tecnologico', label: 'Tecnológico', letra: 'T' },
  { key: 'ecologico', label: 'Ecológico', letra: 'E' },
  { key: 'legal', label: 'Legal', letra: 'L' }
];

export const PESTEL_UMBRALES = { alto: 2.5, medio: 1.5 };

export const PESTEL_SEMAFORO = {
  alto: '#dc2626',
  medio: '#d97706',
  bajo: '#059669'
};

const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

/** Impacto = [(IP + Ir) / 2] × p(x), con dos decimales. */
export function computeImpact(ip, ir, px) {
  const importancia = Number(ip);
  const incidencia = Number(ir);
  const probabilidad = Number(px);
  if ([importancia, incidencia, probabilidad].some((n) => !Number.isFinite(n))) return null;
  return round2(((importancia + incidencia) / 2) * probabilidad);
}

/** alto ≥ 2.50 · medio 1.50-2.49 · bajo < 1.50 */
export function classifyImpact(impacto, umbrales = PESTEL_UMBRALES) {
  const valor = Number(impacto);
  if (!Number.isFinite(valor)) return 'bajo';
  if (valor >= umbrales.alto) return 'alto';
  if (valor >= umbrales.medio) return 'medio';
  return 'bajo';
}

export function impactColor(impacto, umbrales = PESTEL_UMBRALES) {
  return PESTEL_SEMAFORO[classifyImpact(impacto, umbrales)];
}

export function hasMatrix(pestel) {
  return Boolean(pestel && Array.isArray(pestel.matriz) && pestel.matriz.length > 0);
}

export function groupByDimension(matriz = []) {
  return PESTEL_DIMENSIONS.map((dim) => ({
    ...dim,
    factores: matriz.filter((f) => f.dim === dim.key)
  }));
}

export function rankByImpact(matriz = []) {
  return [...matriz].sort((a, b) => Number(b.impacto) - Number(a.impacto));
}

/** Total de impacto y balance amenazas/oportunidades de toda la matriz. */
export function summarize(matriz = []) {
  const amenazas = matriz.filter((f) => f.oa === 'A');
  const oportunidades = matriz.filter((f) => f.oa === 'O');
  const sum = (rows) => round2(rows.reduce((acc, f) => acc + Number(f.impacto || 0), 0));
  return {
    factores: matriz.length,
    total: sum(matriz),
    amenazas: amenazas.length,
    oportunidades: oportunidades.length,
    impactoAmenazas: sum(amenazas),
    impactoOportunidades: sum(oportunidades),
    altos: matriz.filter((f) => classifyImpact(f.impacto) === 'alto').length,
    medios: matriz.filter((f) => classifyImpact(f.impacto) === 'medio').length,
    bajos: matriz.filter((f) => classifyImpact(f.impacto) === 'bajo').length
  };
}

/** Una línea por factor, en el formato que consumen las tarjetas de texto libre. */
export function factorToBullet(factor) {
  const anio = factor.fecha ? String(factor.fecha).slice(0, 4) : '';
  const fuente = [factor.fuente, anio].filter(Boolean).join(', ');
  const tipo = factor.oa === 'A' ? 'amenaza' : 'oportunidad';
  return `• ${factor.factor}${fuente ? ` (${fuente})` : ''} — impacto ${Number(factor.impacto).toFixed(2)} · ${tipo}`;
}

/**
 * Reconstruye los seis campos legacy a partir de la matriz, de modo que las vistas
 * que solo conocen texto (exportadores y prompts de IA) sigan funcionando.
 */
export function deriveDimensionTexts(matriz = []) {
  return groupByDimension(matriz).reduce((acc, dim) => {
    acc[dim.key] = dim.factores.length
      ? dim.factores.map(factorToBullet).join('\n')
      : '';
    return acc;
  }, {});
}

/**
 * Auditoría interna de la matriz: aritmética, clasificación, cobertura por dimensión
 * y ventana de fuentes. Devuelve la lista de inconsistencias (vacía = matriz sana).
 */
export function validateMatriz(matriz = [], opciones = {}) {
  const problemas = [];
  const { ventana } = opciones;

  for (const f of matriz) {
    const esperado = computeImpact(f.ip, f.ir, f.px);
    if (esperado === null) {
      problemas.push(`factor ${f.n ?? '?'}: IP/Ir/p(x) no numéricos`);
    } else if (esperado !== round2(f.impacto)) {
      problemas.push(`factor ${f.n ?? '?'}: impacto declarado ${f.impacto} ≠ calculado ${esperado}`);
    }
    const clase = classifyImpact(f.impacto);
    if (f.clasificacion && f.clasificacion !== clase) {
      problemas.push(`factor ${f.n ?? '?'}: clasificación declarada ${f.clasificacion} ≠ ${clase}`);
    }
    if (!['A', 'O'].includes(f.oa)) problemas.push(`factor ${f.n ?? '?'}: O/A ausente`);
    if (!PESTEL_DIMENSIONS.some((d) => d.key === f.dim)) problemas.push(`factor ${f.n ?? '?'}: dimensión desconocida`);
    if (ventana && f.fecha) {
      if (String(f.fecha) < ventana.desde || String(f.fecha) > `${ventana.hasta}-31`) {
        problemas.push(`factor ${f.n ?? '?'}: fuente ${f.fecha} fuera de la ventana ${ventana.desde} → ${ventana.hasta}`);
      }
    }
  }

  for (const dim of groupByDimension(matriz)) {
    if (dim.factores.length === 0) problemas.push(`dimensión ${dim.key}: sin factores`);
  }
  return problemas;
}
