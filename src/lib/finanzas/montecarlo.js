/**
 * Motor Estocástico de Monte Carlo para Evaluación de Riesgos Financieros
 * Utiliza la transformación Box-Muller para generar distribuciones normales
 * y ejecuta miles de iteraciones para determinar la viabilidad de un proyecto.
 */

// Genera un número aleatorio bajo distribución normal estándar (media 0, varianza 1)
function gaussianRandom() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Escala el número aleatorio a nuestra media y desviación estándar
function generateNormal(mean, stdDev) {
  return mean + gaussianRandom() * stdDev;
}

/**
 * Corre una simulación de Monte Carlo en base a las métricas base del proyecto.
 * @param {number} baseRevenue - Ingreso esperado anual
 * @param {number} baseCost - Costo operativo anual esperado
 * @param {number} wacc - Costo Promedio Ponderado de Capital
 * @param {number} initialInvestment - CAPEX total
 * @param {number} years - Horizonte del proyecto
 * @param {number} iterations - Cantidad de simulaciones a correr
 * @param {number} revenueVol - Incertidumbre o volatilidad de ingresos (%)
 * @param {number} costVol - Incertidumbre o volatilidad de costos (%)
 * @returns {Object} Resultados estadísticos, histograma y trayectorias de percentiles
 */
export function runMonteCarloSimulation(
  baseRevenue,
  baseCost,
  wacc,
  initialInvestment,
  years = 5,
  iterations = 10000,
  revenueVol = 15,
  costVol = 15
) {
  let successfulIterations = 0;
  let totalNPV = 0;
  const allNPVs = [];
  const allTrajectories = [];

  // Volatilidades relativas en monto monetario
  const revenueStdDev = baseRevenue * (revenueVol / 100);
  const costStdDev = baseCost * (costVol / 100);

  for (let i = 0; i < iterations; i++) {
    let simulatedNPV = -initialInvestment;
    const trajectory = [simulatedNPV]; // Año 0 es la inversión inicial negativa
    let currentFlowAccumulated = -initialInvestment;

    for (let year = 1; year <= years; year++) {
      // Ingreso simulado (no puede ser negativo en la práctica)
      const simulatedRevenue = Math.max(0, generateNormal(baseRevenue, revenueStdDev));
      // Costo simulado
      const simulatedCost = Math.max(0, generateNormal(baseCost, costStdDev));

      // Flujo de caja neto para ese año (FCF)
      const fcf = simulatedRevenue - simulatedCost;

      // Descontamos al WACC
      const discountedFCF = fcf / Math.pow(1 + (wacc / 100), year);
      simulatedNPV += discountedFCF;
      currentFlowAccumulated += discountedFCF;

      trajectory.push(currentFlowAccumulated);
    }

    allNPVs.push(simulatedNPV);
    allTrajectories.push(trajectory);
    totalNPV += simulatedNPV;

    if (simulatedNPV > 0) {
      successfulIterations++;
    }
  }

  // Ordenar los NPVs para extraer percentiles y histograma
  allNPVs.sort((a, b) => a - b);

  const minNPV = allNPVs[0];
  const maxNPV = allNPVs[allNPVs.length - 1];
  const successProbability = (successfulIterations / iterations) * 100;
  const averageNPV = totalNPV / iterations;

  // Desviación Estándar
  const variance = allNPVs.reduce((sum, val) => sum + Math.pow(val - averageNPV, 2), 0) / iterations;
  const stdDevNPV = Math.sqrt(variance);

  // Percentiles finales
  const p10 = allNPVs[Math.floor(0.10 * (iterations - 1))];
  const p50 = allNPVs[Math.floor(0.50 * (iterations - 1))];
  const p90 = allNPVs[Math.floor(0.90 * (iterations - 1))];

  // Calcular trayectorias anuales por percentiles (P10, P50, P90)
  const trajectories = [];
  for (let year = 0; year <= years; year++) {
    const valuesAtYear = allTrajectories.map(t => t[year]);
    valuesAtYear.sort((a, b) => a - b);

    const yearP10 = valuesAtYear[Math.floor(0.10 * (iterations - 1))];
    const yearP50 = valuesAtYear[Math.floor(0.50 * (iterations - 1))];
    const yearP90 = valuesAtYear[Math.floor(0.90 * (iterations - 1))];

    trajectories.push({
      year,
      label: year === 0 ? 'Inicio' : `Año ${year}`,
      p10: yearP10,
      p50: yearP50,
      p90: yearP90
    });
  }

  // Construcción del histograma de frecuencias (20 bins)
  const binCount = 20;
  const binWidth = (maxNPV - minNPV) / binCount || 1;
  const histogram = [];

  for (let b = 0; b < binCount; b++) {
    const binMin = minNPV + b * binWidth;
    const binMax = binMin + binWidth;
    const midPoint = binMin + binWidth / 2;

    // Filtramos las iteraciones que entran en el rango de este bin
    let count = allNPVs.filter(v => v >= binMin && v < binMax).length;
    if (b === binCount - 1) {
      // Incluir el valor máximo en el último contenedor
      count += allNPVs.filter(v => v === maxNPV).length;
    }

    histogram.push({
      midPoint,
      count,
      isPositive: midPoint > 0
    });
  }

  return {
    iterationsRun: iterations,
    successProbability: Number(successProbability.toFixed(2)),
    lossProbability: Number((100 - successProbability).toFixed(2)),
    averageNPV: Number(averageNPV.toFixed(2)),
    minNPV: Number(minNPV.toFixed(2)),
    maxNPV: Number(maxNPV.toFixed(2)),
    stdDevNPV: Number(stdDevNPV.toFixed(2)),
    percentiles: {
      p10: Number(p10.toFixed(2)),
      p50: Number(p50.toFixed(2)),
      p90: Number(p90.toFixed(2))
    },
    trajectories,
    histogram,
    conclusion: successProbability > 75 
      ? `Alta viabilidad. ${successProbability.toFixed(1)}% de las iteraciones generaron valor positivo (VAN > 0). El VAN esperado es de ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(averageNPV)}.`
      : successProbability > 50 
      ? `Viabilidad moderada (${successProbability.toFixed(1)}%). Existe un riesgo de pérdida del ${(100 - successProbability).toFixed(1)}%. Se aconseja optimizar costos o diversificar fuentes.`
      : `Alto riesgo de pérdida. Solo el ${successProbability.toFixed(1)}% de los escenarios superan el WACC del ${wacc.toFixed(1)}%. Se recomienda replantear el modelo de ingresos o reducir significativamente el CAPEX.`
  };
}
