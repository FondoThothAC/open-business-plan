import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  computeImpact,
  classifyImpact,
  impactColor,
  hasMatrix,
  groupByDimension,
  rankByImpact,
  summarize,
  deriveDimensionTexts,
  validateMatriz,
  factorToBullet,
  PESTEL_SEMAFORO
} from '../src/lib/pestelMatrix.js';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FUENTE = JSON.parse(fs.readFileSync(path.join(RAIZ, 'docs/pestel_plan/pestel_vcv_matrix.json'), 'utf8'));
const PROYECTO = JSON.parse(fs.readFileSync(path.join(RAIZ, 'proyectos/negocios/vcv_cortes_finos_sa_de_cv/vcv_cortes_finos_sa_de_cv.json'), 'utf8'));

test('PESTEL-1: la fórmula de la unidad reproduce el cálculo académico', async (t) => {
  await t.test('fila desglosada de la rúbrica: [(3 + 3) / 2] × 0.9 = 2.70', () => {
    assert.equal(computeImpact(3, 3, 0.9), 2.7);
  });
  await t.test('redondea a dos decimales', () => {
    assert.equal(computeImpact(2, 3, 0.65), 1.63);
    assert.equal(computeImpact(2, 1, 0.75), 1.13);
    assert.equal(computeImpact(2, 1, 0.55), 0.83);
  });
  await t.test('devuelve null con entradas no numéricas', () => {
    assert.equal(computeImpact('a', 3, 0.9), null);
  });
});

test('PESTEL-2: umbrales de clasificación en los bordes exactos', () => {
  assert.equal(classifyImpact(2.5), 'alto');
  assert.equal(classifyImpact(2.49), 'medio');
  assert.equal(classifyImpact(1.5), 'medio');
  assert.equal(classifyImpact(1.49), 'bajo');
  assert.equal(impactColor(2.76), PESTEL_SEMAFORO.alto);
  assert.equal(impactColor(2.25), PESTEL_SEMAFORO.medio);
  assert.equal(impactColor(0.9), PESTEL_SEMAFORO.bajo);
});

test('PESTEL-3: la matriz de VCV es aritméticamente sana', () => {
  assert.deepEqual(validateMatriz(FUENTE.matriz, { ventana: FUENTE.ventana_fuentes }), []);
  assert.equal(FUENTE.matriz.length, 12);
  for (const dim of groupByDimension(FUENTE.matriz)) {
    assert.equal(dim.factores.length, 2, `${dim.key} debe tener exactamente 2 factores`);
  }
});

test('PESTEL-4: balance de impactos del análisis VCV', () => {
  const r = summarize(FUENTE.matriz);
  assert.equal(r.factores, 12);
  assert.equal(r.total, 21.57);
  assert.equal(r.impactoAmenazas, 12.71);
  assert.equal(r.impactoOportunidades, 8.86);
  assert.deepEqual([r.altos, r.medios, r.bajos], [2, 7, 3]);
  assert.deepEqual([r.amenazas, r.oportunidades], [6, 6]);
});

test('PESTEL-5: top-3 coherente con el orden por impacto', () => {
  const ordenados = rankByImpact(FUENTE.matriz).slice(0, 3).map((f) => f.n);
  assert.deepEqual(FUENTE.priorizacion.map((d) => d.factor_n), ordenados);
  assert.deepEqual(ordenados, [11, 3, 9]);
});

test('PESTEL-6: anti-copia, ninguna fila es la del ejemplo de la rúbrica', () => {
  const clon = FUENTE.matriz.find((f) => f.ip === 3 && f.ir === 3 && f.px === 0.9 && f.impacto === 2.7);
  assert.equal(clon, undefined, 'ninguna fila debe coincidir con [(3+3)/2]×0.9 = 2.70');
  const px = new Set(FUENTE.matriz.map((f) => f.px));
  assert.ok(px.size >= 8, 'p(x) debe variar entre factores');
  const enBandaMedia = FUENTE.matriz.filter((f) => f.px >= 0.7 && f.px <= 0.8).length;
  assert.ok(enBandaMedia <= 5, 'no se admite el patrón de concentrar p(x) en 0.7-0.8');
});

test('PESTEL-7: los textos legacy se derivan de la matriz, con fuente y O/A', () => {
  const textos = deriveDimensionTexts(FUENTE.matriz);
  assert.deepEqual(Object.keys(textos).sort(), ['ecologico', 'economico', 'legal', 'politico', 'social', 'tecnologico']);
  for (const clave of Object.keys(textos)) {
    const lineas = textos[clave].split('\n');
    assert.equal(lineas.length, 2, `${clave} debe aportar dos viñetas`);
    for (const linea of lineas) {
      assert.match(linea, /^• /);
      assert.match(linea, /— impacto \d\.\d{2} · (amenaza|oportunidad)$/);
      assert.match(linea, /, \d{4}\)/, 'cada viñeta debe incluir el año de su fuente');
    }
  }
  assert.match(factorToBullet(FUENTE.matriz[10]), /jornada/i);
});

test('PESTEL-8: el proyecto VCV en disco ya trae la matriz integrada', () => {
  const pestel = PROYECTO.naturaleza.pestel;
  assert.equal(hasMatrix(pestel), true);
  assert.equal(pestel.matriz.length, 12);
  assert.deepEqual(validateMatriz(pestel.matriz, { ventana: pestel.ventanaFuentes }), []);
  assert.equal(pestel.horizonte, '2027-2028');
  assert.equal(pestel.priorizacion.length, 3);
  assert.equal(pestel.fuentes.length, 16);
  assert.equal(pestel.conclusion_palabras, pestel.conclusion.split(/\s+/).length);
  assert.ok(pestel.conclusion_palabras <= 150, 'la conclusión debe caber en 150 palabras');
});

test('PESTEL-9: compatibilidad hacia atrás con proyectos sin matriz', () => {
  assert.equal(hasMatrix({ politico: 'texto', economico: 'texto' }), false);
  assert.equal(hasMatrix(undefined), false);
  assert.equal(hasMatrix({ matriz: [] }), false);
  assert.equal(hasMatrix({ matriz: [{ n: 1 }] }), true);
});

test('PESTEL-10: validateMatriz detecta filas corruptas', () => {
  const rota = [{ ...FUENTE.matriz[0], impacto: 9.99 }];
  const problemas = validateMatriz(rota);
  assert.ok(problemas.some((p) => p.includes('impacto declarado')));
  const huerfana = validateMatriz([{ ...FUENTE.matriz[0], dim: 'religioso' }]);
  assert.ok(huerfana.some((p) => p.includes('dimensión desconocida')));
  const vieja = validateMatriz([{ ...FUENTE.matriz[0], fecha: '2023-01-01' }], { ventana: FUENTE.ventana_fuentes });
  assert.ok(vieja.some((p) => p.includes('fuera de la ventana')));
});
