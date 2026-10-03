/**
 * @file reajusteSolver.js
 * @description Solver matemático de bisección para el Plan de Reajuste Financiero.
 * Calcula las palancas operativas (precio, volumen, costos) para alcanzar viabilidad (VPN >= 0 y payback <= meta).
 */

/**
 * Evalúa el VPN y payback en meses para un conjunto dado de parámetros operativos.
 * @param {Object} params
 * @returns {{ vpn: number, paybackMeses: number, flujoMensual: number, esViable: boolean }}
 */
function evaluateProjectViability(params) {
  const {
    capexTotal,
    costosFijosMensuales,
    costoVariableUnitario,
    precioUnitario,
    volumenMensual,
    tasaDescuento = 12,
    duracionAnios = 5,
    metaPaybackMeses = 36
  } = params;

  const ventasMensuales = precioUnitario * volumenMensual;
  const costosVarMensuales = costoVariableUnitario * volumenMensual;
  const margenBrutoMensual = ventasMensuales - costosVarMensuales;

  const depMensual = (capexTotal / duracionAnios) / 12;
  const ebitMensual = margenBrutoMensual - costosFijosMensuales - depMensual;
  const impuestosMensuales = ebitMensual > 0 ? ebitMensual * 0.30 : 0;
  const utilidadNetaMensual = ebitMensual - impuestosMensuales;
  const flujoEfectivoMensual = utilidadNetaMensual + depMensual;

  const flujoAnual = flujoEfectivoMensual * 12;

  let vpn = -capexTotal;
  const r = tasaDescuento / 100;
  for (let t = 1; t <= duracionAnios; t++) {
    vpn += flujoAnual / Math.pow(1 + r, t);
  }

  let paybackMeses = Infinity;
  if (flujoEfectivoMensual > 0) {
    paybackMeses = Math.round((capexTotal / flujoEfectivoMensual) * 10) / 10;
  }

  const esViable = vpn >= 0 && paybackMeses <= metaPaybackMeses;

  return {
    vpn: Math.round(vpn),
    paybackMeses,
    flujoMensual: Math.round(flujoEfectivoMensual),
    esViable
  };
}

/**
 * Resuelve el valor objetivo usando búsqueda por bisección.
 * @param {Function} evalFn - Función que evalúa si un valor X cumple la condición
 * @param {number} minBound - Límite inferior
 * @param {number} maxBound - Límite superior
 * @param {number} iteraciones - Número máximo de iteraciones
 * @returns {number} Valor que cumple la meta
 */
function bisectionSearch(evalFn, minBound, maxBound, iteraciones = 50) {
  let low = minBound;
  let high = maxBound;
  let best = maxBound;

  for (let i = 0; i < iteraciones; i++) {
    const mid = (low + high) / 2;
    if (evalFn(mid)) {
      best = mid;
      high = mid; // Intentar buscar un valor más ajustado
    } else {
      low = mid;
    }
  }

  return Math.round(best * 100) / 100;
}

/**
 * Calcula el Plan de Reajuste identificando las palancas operativas necesarias.
 * @param {Object} input - Parámetros del proyecto
 * @returns {Object} Diagnóstico y palancas recomendadas
 */
export function solveFinancialReajuste(input) {
  const {
    capexTotal = 50000,
    costosFijosMensuales = 5000,
    costoVariableUnitario = 0,
    precioUnitario = 100,
    volumenMensual = 100,
    tasaDescuento = 12,
    duracionAnios = 5,
    metaPaybackMeses = 36
  } = input;

  const actual = evaluateProjectViability({
    capexTotal,
    costosFijosMensuales,
    costoVariableUnitario,
    precioUnitario,
    volumenMensual,
    tasaDescuento,
    duracionAnios,
    metaPaybackMeses
  });

  if (actual.esViable) {
    return {
      requiereReajuste: false,
      diagnostico: 'VIABLE_CONFORME_A_METAS',
      metricasActuales: actual,
      mensaje: `El proyecto es viable con los supuestos actuales (VPN: $${actual.vpn.toLocaleString()} MXN, Recuperación: ${actual.paybackMeses} meses vs meta de ${metaPaybackMeses} meses).`
    };
  }

  // 1. Palanca Precio Mínimo: manteniendo volumen y costos actuales
  const precioMinimo = bisectionSearch((p) => {
    return evaluateProjectViability({
      capexTotal,
      costosFijosMensuales,
      costoVariableUnitario,
      precioUnitario: p,
      volumenMensual,
      tasaDescuento,
      duracionAnios,
      metaPaybackMeses
    }).esViable;
  }, precioUnitario, Math.max(precioUnitario * 10, costoVariableUnitario * 15, 1000));

  // 2. Palanca Volumen Mínimo: manteniendo precio y costos actuales
  const volumenMinimo = bisectionSearch((v) => {
    return evaluateProjectViability({
      capexTotal,
      costosFijosMensuales,
      costoVariableUnitario,
      precioUnitario,
      volumenMensual: v,
      tasaDescuento,
      duracionAnios,
      metaPaybackMeses
    }).esViable;
  }, volumenMensual, Math.max(volumenMensual * 30, 5000));

  // 3. Palanca Costo Fijo Máximo Tolerable: manteniendo precio y volumen actuales
  let lowFijos = 0;
  let highFijos = costosFijosMensuales;
  let costoFijoMaximo = 0;
  for (let i = 0; i < 40; i++) {
    const mid = (lowFijos + highFijos) / 2;
    if (evaluateProjectViability({
      capexTotal,
      costosFijosMensuales: mid,
      costoVariableUnitario,
      precioUnitario,
      volumenMensual,
      tasaDescuento,
      duracionAnios,
      metaPaybackMeses
    }).esViable) {
      costoFijoMaximo = mid;
      lowFijos = mid; // Intentar permitir un costo fijo más alto
    } else {
      highFijos = mid;
    }
  }
  costoFijoMaximo = Math.round(costoFijoMaximo);

  // 4. Escenario Combinado Equilibrado: +12% precio, +18% volumen, optimización de costos
  const precioComb = Math.round(precioUnitario * 1.15 * 100) / 100;
  const volComb = Math.round(volumenMensual * 1.25);
  const fijosComb = Math.max(0, Math.round(costosFijosMensuales * 0.90));
  const viabComb = evaluateProjectViability({
    capexTotal,
    costosFijosMensuales: fijosComb,
    costoVariableUnitario,
    precioUnitario: precioComb,
    volumenMensual: volComb,
    tasaDescuento,
    duracionAnios,
    metaPaybackMeses
  });

  return {
    requiereReajuste: true,
    diagnostico: 'REQUIERE_REAJUSTE_OPERATIVO',
    metricasActuales: actual,
    metaPaybackMeses,
    palancas: {
      precioMinimo: Math.ceil(precioMinimo),
      incrementoPrecioPct: Math.round(((precioMinimo - precioUnitario) / precioUnitario) * 100),
      volumenMinimo: Math.ceil(volumenMinimo),
      incrementoVolumenPct: Math.round(((volumenMinimo - volumenMensual) / volumenMensual) * 100),
      costoFijoMaximo: Math.max(0, costoFijoMaximo),
      reduccionCostosFijosPct: Math.round(((costosFijosMensuales - costoFijoMaximo) / costosFijosMensuales) * 100),
      escenarioCombinado: {
        precioPropuesto: precioComb,
        volumenPropuesto: volComb,
        costosFijosPropuestos: fijosComb,
        vpnEstimado: viabComb.vpn,
        paybackEstimadoMeses: viabComb.paybackMeses,
        esViable: viabComb.esViable
      }
    },
    resumenEstrategico: `Para recuperar la inversión de $${capexTotal.toLocaleString()} en un máximo de ${metaPaybackMeses} meses, el negocio requiere ajustar su precio a $${Math.ceil(precioMinimo).toLocaleString()} MXN o incrementar su volumen mensual a ${Math.ceil(volumenMinimo).toLocaleString()} unidades.`
  };
}
