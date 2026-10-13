/**
 * [B5] Pruebas de valor conocido de la lógica financiera de src/lib/finanzas.
 *
 * Antes de este archivo NINGUN test del repo importaba calculateIRR ni
 * runMonteCarloSimulation: lo que cubria tests/toolsSuite.test.js son otras
 * implementaciones (FinancialAnalyzer.calculateIRR y RiskSimulator.runMonteCarlo,
 * este ultimo de 10 bins). Los valores de referencia se calcularon por separado con
 * Newton-Raphson sobre la misma definicion de NPV, no copiando la salida del codigo.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { calculateIRR } = await import(path.join(REPO, 'src/lib/finanzas/financial-calculations.js'));
const { runMonteCarloSimulation } = await import(path.join(REPO, 'src/lib/finanzas/montecarlo.js'));

// ── referencia independiente: Newton-Raphson ────────────────────────────────
function irrNewton(cashflows, tol = 1e-12) {
  const npv = (r) => cashflows.reduce((a, v, i) => a + v / Math.pow(1 + r, i), 0);
  const dnpv = (r) => cashflows.reduce((a, v, i) => (i === 0 ? a : a - (i * v) / Math.pow(1 + r, i + 1)), 0);
  let r = 0.1;
  for (let i = 0; i < 400; i++) {
    const f = npv(r), df = dnpv(r);
    if (!Number.isFinite(f) || !Number.isFinite(df) || df === 0) return null;
    const siguiente = r - f / df;
    if (!Number.isFinite(siguiente)) return null;
    if (Math.abs(siguiente - r) < tol) r = siguiente; else r = siguiente;
    if (r <= -0.99) r = -0.5;   // reanclar si Newton se sale del dominio
  }
  return r * 100;
}

test('[B5] calculateIRR coincide con la raiz de NPV=0 en flujos convencionales', () => {
  const casos = [
    [-100, 60, 60],
    [-100, 10, 10, 10, 200],
    [-1000, 300, 300, 300],
    [-250000, 60000, 72000, 85000, 90000, 95000],
    [-500000, 120000, 120000, 120000, 120000, 400000]
  ];

  for (const cf of casos) {
    const obtenido = calculateIRR(cf);
    const referencia = irrNewton(cf);
    assert.ok(obtenido !== null, `debe converger en ${JSON.stringify(cf)}`);
    assert.ok(Number.isFinite(obtenido));
    assert.ok(
      Math.abs(obtenido - referencia) < 1e-3,
      `${JSON.stringify(cf)}: obtenido ${obtenido} vs Newton ${referencia}`
    );
    // invariante algebraico: el NPV en la TIR devuelta debe ser ~0
    const npvEnTir = cf.reduce((a, v, i) => a + v / Math.pow(1 + obtenido / 100, i), 0);
    assert.ok(Math.abs(npvEnTir) < Math.max(1e-4, Math.abs(cf[0]) * 1e-6), `NPV(TIR) != 0 en ${JSON.stringify(cf)}: ${npvEnTir}`);
  }

  // valores de referencia calculados aparte (Newton sobre la misma NPV)
  assert.ok(Math.abs(calculateIRR([-100, 60, 60]) - 13.066239) < 1e-4, 'TIR de [-100,60,60] ~ 13.066%');
  assert.ok(Math.abs(calculateIRR([-100, 10, 10, 10, 200]) - 25.499497) < 1e-4, 'TIR de [-100,10,10,10,200] ~ 25.499%');
});

test('[B5] calculateIRR conserva la semantica de null en los bordes', () => {
  assert.equal(calculateIRR([]), null, 'sin flujos');
  assert.equal(calculateIRR([100, 60]), null, 'inversion no negativa no tiene TIR');
  assert.equal(calculateIRR([-100, -50]), null, 'sin cambio de signo no hay raiz');
  assert.equal(calculateIRR([-100, 0, 0]), null, 'recuperacion nula');
  // nota: se conserva el contrato existente (null), no se devolvio el ultimo midRate
});

test('[B5] el gemelo .ts no diverge del .js en la TIR', async (t) => {
  // El .ts solo lo consume scripts/generate_closets_corona.js (Vite resuelve .js), y
  // requiere Node con type-stripping. Si el runtime no puede importarlo, se omite en vez
  // de fallar, para no romper el suite en maquinas con Node mas viejo.
  let ts;
  try {
    ts = await import(path.join(REPO, 'src/lib/finanzas/financial-calculations.ts'));
  } catch (error) {
    t.skip(`este runtime no puede importar el .ts (${error.code || error.message})`);
    return;
  }
  if (typeof ts.calculateIRR !== 'function') {
    t.skip('el .ts no exporta calculateIRR');
    return;
  }
  for (const cf of [[-100, 60, 60], [-100, 10, 10, 10, 200], [-250000, 60000, 72000, 85000, 90000, 95000]]) {
    const js = calculateIRR(cf);
    const tsv = ts.calculateIRR(cf);
    assert.ok(Math.abs(js - tsv) < 1e-6, `.js y .ts divergen en ${JSON.stringify(cf)}: ${js} vs ${tsv}`);
  }
});

test('[B5] el histograma Monte Carlo suma exactamente las iteraciones', () => {
  const parametrizaciones = [
    { it: 1000 }, { it: 5000 }, { it: 10000 }
  ];

  for (const { it } of parametrizaciones) {
    for (let corrida = 0; corrida < 12; corrida++) {
      const semilla = (corrida + 1) * 137.5;
      const r = runMonteCarloSimulation(
        1_000_000 + semilla * 1000,
        600_000 + semilla * 300,
        0.12,
        500_000 + semilla * 200,
        5,
        it,
        15 + (corrida % 5),
        12 + (corrida % 7)
      );
      const bins = r.histogram;
      assert.equal(bins.length, 20, 'el histograma es de 20 bins');
      const suma = bins.reduce((a, b) => a + b.count, 0);
      assert.equal(suma, it, `suma de bins != iteraciones (${it}) en corrida ${corrida}: ${suma}`);
      assert.ok(bins.every(b => Number.isInteger(b.count) && b.count >= 0), 'los conteos deben enteros no negativos');
    }
  }
});

test('[B5] el maximo de NPV queda contado una sola vez (regresion del parche)', () => {
  // El bug era el parche `count += filter(v => v === maxNPV)` del ultimo bin: con
  // minNPV/maxNPV cercanos, el ancho reconstruido por flotante dejaba el maximo dentro del
  // rango del ultimo bin y se duplicaba. Se reproduce con una distribucion apretada.
  for (let intento = 0; intento < 40; intento++) {
    const r = runMonteCarloSimulation(900_000, 450_000, 0.1, 200_000, 5, 5000, 2, 2);
    const suma = r.histogram.reduce((a, b) => a + b.count, 0);
    assert.equal(suma, 5000, `bins duplicados/perdidos en el intento ${intento}: ${suma}`);
    assert.equal(r.histogram[r.histogram.length - 1].count >= 1, true, 'el ultimo bin debe contener el maximo');
  }
});
