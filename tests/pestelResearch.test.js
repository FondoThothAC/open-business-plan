import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  clasificarFuente,
  selloProcedencia,
  enriquecerMatriz,
  construirConsultas,
  normalizarCandidatos,
  dentroDeVentana,
  clasificarCandidatos,
  candidatoAFactor
} from '../src/lib/pestelResearch.js';
import { validateMatriz } from '../src/lib/pestelMatrix.js';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VCV = JSON.parse(fs.readFileSync(path.join(RAIZ, 'docs/pestel_plan/pestel_vcv_matrix.json'), 'utf8'));
const VENTANA = VCV.ventana_fuentes;

test('PESTEL-R1: la confianza la define el tipo de medio, no el discurso', () => {
  assert.equal(clasificarFuente('https://dof.gob.mx/nota_detalle.php?codigo=5786537').tipo, 'oficial');
  assert.equal(clasificarFuente('https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/ei/EIC2025-def_RR.pdf').tipo, 'oficial');
  assert.equal(clasificarFuente('https://comecarne.org/compendio26').tipo, 'sectorial');
  assert.equal(clasificarFuente('https://www.eleconomista.com.mx/empresas/x').tipo, 'prensa');
  assert.equal(clasificarFuente('').tipo, 'desconocida');
  assert.ok(clasificarFuente('https://dof.gob.mx').confianza > clasificarFuente('https://blog-azaroso.mx').confianza);
});

test('PESTEL-R2: un factor sin URL no se disfraza de verificado', () => {
  const sinUrl = selloProcedencia({ factor: 'algo', fuente: 'Recuerdo del socio' });
  assert.equal(sinUrl.provenance, 'none');
  assert.match(sinUrl.warning, /FUENTE-PENDIENTE/);

  const sinFecha = selloProcedencia({ factor: 'algo', url: 'https://dof.gob.mx/x' });
  assert.equal(sinFecha.provenance, 'real');
  assert.match(sinFecha.warning, /no tiene fecha/);

  const completo = selloProcedencia({ factor: 'algo', url: 'https://dof.gob.mx/x', fecha: '2026-05-01', fuente: 'DOF' });
  assert.equal(completo.provenance, 'real');
  assert.equal(completo.tipoFuente, 'oficial');
  assert.equal(completo.confidenceScore, 0.98);
  assert.equal(completo.warning, null);
});

test('PESTEL-R3: las 12 fuentes de VCV salen con sello real y sin pendientes', () => {
  const { matriz, pendientes } = enriquecerMatriz(VCV.matriz);
  assert.deepEqual(pendientes, [], 'ningún factor de VCV debe quedar sin fuente o sin fecha');
  assert.equal(matriz.length, 12);
  for (const f of matriz) {
    assert.equal(f.provenance, 'real');
    assert.ok(f.sourceUrl.startsWith('http'));
    assert.ok(['oficial', 'sectorial', 'prensa'].includes(f.tipoFuente), f.fuente);
  }
  const oficial = matriz.find((f) => f.n === 11);
  assert.equal(oficial.tipoFuente, 'oficial');
  assert.equal(oficial.confidenceScore, 0.98);
});

test('PESTEL-R4: enriquecer la matriz no rompe su auditoría aritmética', () => {
  const { matriz } = enriquecerMatriz(VCV.matriz);
  assert.deepEqual(validateMatriz(matriz, { ventana: VENTANA }), []);
});

test('PESTEL-R5: las consultas cubren las seis dimensiones con año explícito', () => {
  const consultas = construirConsultas({ empresa: 'VCV Cortes Finos', giro: 'cárnico premium', horizonte: '2027-2028' });
  assert.equal(consultas.length, 6);
  assert.deepEqual(consultas.map((c) => c.dim).sort(), ['ecologico', 'economico', 'legal', 'politico', 'social', 'tecnologico']);
  for (const c of consultas) {
    assert.match(c.query, /2025|2026/);
    assert.match(c.query, /México/);
    assert.ok(c.query.length > 20);
  }
});

test('PESTEL-R6: la ventana de fechas responde null cuando no hay fecha', () => {
  assert.equal(dentroDeVentana('2026-01-23', VENTANA), true);
  assert.equal(dentroDeVentana('2023-05-01', VENTANA), false);
  assert.equal(dentroDeVentana('2026-12-31', VENTANA), false, 'diciembre de 2026 ya cae fuera de una ventana que cierra en octubre');
  assert.equal(dentroDeVentana(null, VENTANA), null);
  assert.equal(dentroDeVentana('1767139200', VENTANA), true, 'acepta timestamp unix de Brave');
  assert.equal(dentroDeVentana('ayer por la tarde', VENTANA), null);
});

test('PESTEL-R7: los candidatos se reparten en cajones honestos', () => {
  const crudos = [
    { title: 'Reforma laboral 40 horas', url: 'https://dof.gob.mx/a', snippet: 'x', publishedDate: '2026-05-01', provider: 'tavily' },
    { title: 'Arancel de 2019', url: 'https://gob.mx/b', publishedDate: '2019-01-01', provider: 'tavily' },
    { title: 'Precio del maíz', url: 'https://inegi.org.mx/c', provider: 'tavily' },
    { title: 'Consumo de carne en México 2025', url: 'https://comecarne.org/d', publishedDate: '2026-02-02' },
    { title: 'sin url', url: '', publishedDate: '2026-02-02' }
  ];
  const candidatos = normalizarCandidatos(crudos, 'legal');
  assert.equal(candidatos.length, 4, 'un resultado sin URL no es un candidato');
  const cajones = clasificarCandidatos(candidatos, {
    ventana: VENTANA,
    matrizActual: [{ factor: 'Consumo de carne en México 2025' }]
  });
  assert.equal(cajones.aptos.length, 1);
  assert.equal(cajones.fueraDeVentana.length, 1);
  assert.equal(cajones.sinFecha.length, 1);
  assert.equal(cajones.duplicados.length, 1);
});

test('PESTEL-R8: aprobar un candidato exige calificación humana completa', () => {
  const bueno = { dim: 'legal', titulo: 'Norma X', url: 'https://dof.gob.mx/x', fecha: '2026-03-03', resumen: 'Texto' };
  const sinCalificar = candidatoAFactor(bueno, { n: 13 });
  assert.match(sinCalificar.error, /calificación es humana/);

  const pxFuera = candidatoAFactor(bueno, { ip: 2, ir: 2, px: 1.4, oa: 'A', n: 13 });
  assert.match(pxFuera.error, /p\(x\) va de 0 a 1/);

  const sinFecha = candidatoAFactor({ ...bueno, fecha: null }, { ip: 2, ir: 2, px: 0.5, oa: 'A', n: 13 });
  assert.match(sinFecha.error, /fecha de publicación/);

  const ok = candidatoAFactor(bueno, { ip: 3, ir: 2, px: 0.6, oa: 'A', n: 13 });
  assert.equal(ok.factor.impacto, 1.5);
  assert.equal(ok.factor.clasificacion, 'medio');
  assert.equal(ok.factor.tendencia, '-');
  assert.equal(ok.sello.provenance, 'real');
  // validateMatriz sobre una matriz de una fila también avisa de las dimensiones vacías,
  // así que aquí solo interesa que ESTA fila no tenga objeciones.
  const objecionesDeFila = validateMatriz([ok.factor], { ventana: VENTANA }).filter((p) => p.includes('factor 13'));
  assert.deepEqual(objecionesDeFila, []);
});
