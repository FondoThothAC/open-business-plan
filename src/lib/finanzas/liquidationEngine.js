/**
 * liquidationEngine.js
 * 
 * Motor de Gestión de Riesgo, Fondo de Reserva de Liquidación Intocable (FRLI)
 * y Protocolo Cuántico de Cierre Digno (Kill Switch / Escalamiento de Crisis).
 * Fondo Thoth AC — Metodología Propietaria de Empresas Cuánticas.
 */

export function parseNumericAmount(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const str = String(val).trim();
  
  const millonMatch = str.match(/(\d+(?:\.\d+)?)\s*millon(?:es)?/i);
  if (millonMatch) {
    const num = parseFloat(millonMatch[1]);
    if (!isNaN(num)) return num * 1000000;
  }
  
  const currencyMatch = str.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+)/);
  if (currencyMatch) {
    const num = parseFloat(currencyMatch[1].replace(/,/g, ''));
    if (!isNaN(num)) return num;
  }
  
  const clean = str.replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Calcula el Fondo de Reserva de Liquidación Intocable (FRLI)
 * contemplando el marco normativo de la Ley Federal del Trabajo (LFT México),
 * compromisos contractuales de arrendamiento, pasivos a proveedores y gastos de cierre legal.
 * 
 * @param {Object} planData - Estado global del plan de negocios
 * @param {Array} staff - Plantilla de personal con salarios mensuales
 * @param {Object} options - Parámetros adicionales (renta mensual, deuda corto plazo, etc.)
 * @returns {Object} Desglose detallado del fondo de liquidación
 */
export function calculateLiquidationReserve(planData, staff = [], options = {}) {
  // 1. PASIVO LABORAL CONSTITUCIONAL (LFT)
  // 3 meses de salario integrado + 20 días por año (asumiendo año 1 = proporcional)
  // + 15 días aguinaldo proporcional + 6 días vacaciones + 25% prima vacacional
  let totalNominaMensual = 0;
  let desglosePersonal = [];

  if (Array.isArray(staff) && staff.length > 0) {
    totalNominaMensual = staff.reduce((acc, curr) => acc + (Number(curr.salary || curr.monthlySalary) || 0), 0);
    desglosePersonal = staff.map(emp => {
      const salary = Number(emp.salary || emp.monthlySalary) || 0;
      const indemnizacionConstitucional = salary * 3; // 3 meses
      const primaAntiguedadYFiniquito = salary * 0.5; // Proporcional aguinaldo + vacaciones + prima
      const totalLiquidacionIndividual = indemnizacionConstitucional + primaAntiguedadYFiniquito;
      return {
        puesto: emp.title || emp.puesto || 'Colaborador Operativo',
        salarioMensual: salary,
        indemnizacionConstitucional,
        proporcionalesLey: primaAntiguedadYFiniquito,
        totalLiquidacion: totalLiquidacionIndividual,
      };
    });
  } else {
    // Si no hay desglose específico de plantilla, estimar a partir de costos fijos de nómina
    const fijosTexto = planData?.organizacion?.costos?.fijos || planData?.semilla?.finanzas?.costos_fijos || '';
    const fijosMonto = parseNumericAmount(fijosTexto, 35000);
    totalNominaMensual = Math.round(fijosMonto * 0.65); // 65% de costos fijos promedio asignados a nómina
    const salarioPromedio = Math.max(10000, Math.round(totalNominaMensual / 3));
    const numEstimadoColaboradores = Math.max(1, Math.round(totalNominaMensual / salarioPromedio));
    
    desglosePersonal = Array.from({ length: numEstimadoColaboradores }).map((_, i) => ({
      puesto: `Colaborador Clave #${i + 1}`,
      salarioMensual: salarioPromedio,
      indemnizacionConstitucional: salarioPromedio * 3,
      proporcionalesLey: salarioPromedio * 0.5,
      totalLiquidacion: salarioPromedio * 3.5,
    }));
  }

  const pasivoLaboralTotal = desglosePersonal.reduce((acc, curr) => acc + curr.totalLiquidacion, 0);

  // 2. PENALIZACIONES DE CONTRATO Y ARRENDAMIENTO
  // Penalización estándar de cancelación anticipada (2 meses de renta promedio)
  const rentaMensualEstimada = options.rentaMensual || Math.round(totalNominaMensual * 0.35);
  const penalizacionRenta = rentaMensualEstimada * 2;

  // 3. PASIVOS Y CUENTAS POR PAGAR (Proveedores y Servicios)
  const pasivosProveedores = options.pasivoProveedores || Math.round(rentaMensualEstimada * 1.5);

  // 4. GASTOS NOTARIALES Y CANCELACIÓN FISCAL / SAT / IMSS
  // Trámites de disolución, acta notarial de liquidación y aviso de cancelación ante el SAT
  const gastosCierreLegalFiscal = 25000;

  // TOTAL FRLI
  const totalFRLI = pasivoLaboralTotal + penalizacionRenta + pasivosProveedores + gastosCierreLegalFiscal;

  return {
    totalFRLI: Math.round(totalFRLI),
    pasivoLaboralTotal: Math.round(pasivoLaboralTotal),
    penalizacionRenta: Math.round(penalizacionRenta),
    pasivosProveedores: Math.round(pasivosProveedores),
    gastosCierreLegalFiscal,
    totalNominaMensual: Math.round(totalNominaMensual),
    desglosePersonal,
    mesesIndemnizacionBase: 3,
  };
}

/**
 * Analiza el flujo de caja mensual y determina el estado del semáforo de crisis,
 * diferenciando entre quema planificada de capital (Estrategia Amazon / J-Curve)
 * y pérdidas operativas imprevistas que amenazan la solvencia del negocio.
 * 
 * @param {Array} monthlyFlows - Flujos netos mensuales proyectados o reales
 * @param {Object} config - Configuración de estrategia y reserva
 * @returns {Object} Diagnóstico de quema, semáforo de contingencia y runway
 */
export function analyzeBurnRateAndSurvival(monthlyFlows = [], config = {}) {
  const {
    isPlannedBurnStrategy = false, // True si es quema planeada estilo startup/Amazon
    plannedBurnMonths = 6,         // Meses en los que se tolera flujo negativo previsto
    currentCashBalance = 150000,   // Caja líquida actual disponible
    liquidationReserve = 100000,   // FRLI intocable
    toleranceConsecutiveLossMonths = 3, // Meses continuos fuera de presupuesto para alerta roja
  } = config;

  // Calcular meses consecutivos con pérdida fuera de lo planeado
  let maxConsecutiveUnplannedLosses = 0;
  let currentConsecutiveUnplannedLosses = 0;
  let totalNetBurn = 0;

  monthlyFlows.forEach((flow, index) => {
    const netFlow = typeof flow === 'number' ? flow : (Number(flow?.netCashFlow || flow?.netIncome) || 0);
    const monthNumber = index + 1;
    const isWithinPlannedBurnWindow = isPlannedBurnStrategy && monthNumber <= plannedBurnMonths;

    if (netFlow < 0) {
      totalNetBurn += Math.abs(netFlow);
      if (!isWithinPlannedBurnWindow) {
        currentConsecutiveUnplannedLosses += 1;
        if (currentConsecutiveUnplannedLosses > maxConsecutiveUnplannedLosses) {
          maxConsecutiveUnplannedLosses = currentConsecutiveUnplannedLosses;
        }
      } else {
        // Pérdida dentro del presupuesto planeado
        currentConsecutiveUnplannedLosses = 0;
      }
    } else {
      currentConsecutiveUnplannedLosses = 0;
    }
  });

  // Cálculo de Runways
  const monthlyBurnRateAverage = monthlyFlows.length > 0 ? totalNetBurn / monthlyFlows.length : 15000;
  const safeAvailableCash = Math.max(0, currentCashBalance - liquidationReserve);
  
  // Runway de Supervivencia Libre (meses que puede operar sin tocar la reserva intocable)
  const runwayLibreMeses = monthlyBurnRateAverage > 0 ? Number((safeAvailableCash / monthlyBurnRateAverage).toFixed(1)) : 99;
  
  // Runway Total de Agotamiento Absoluto (hasta caer en quiebra ilegal)
  const runwayTotalMeses = monthlyBurnRateAverage > 0 ? Number((currentCashBalance / monthlyBurnRateAverage).toFixed(1)) : 99;

  // Determinación de la Fase Cuántica de Contingencia
  let phase = 'VERDE'; // Operación Normal / Saludable
  let phaseName = 'Fase Verde: Operación Estable';
  let badgeColor = '#10b981';
  let alertMessage = 'El negocio opera dentro de los márgenes de rentabilidad o quema planeada.';

  if (currentCashBalance <= liquidationReserve || maxConsecutiveUnplannedLosses >= toleranceConsecutiveLossMonths) {
    phase = 'ROJA';
    phaseName = 'Fase Roja: Activación Kill Switch / Protocolo de Cierre Digno';
    badgeColor = '#ef4444';
    alertMessage = `¡ALERTA CRÍTICA! Se han encadenado ${maxConsecutiveUnplannedLosses} meses de pérdida no presupuestada o la caja tocó el Fondo de Reserva (${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(liquidationReserve)}). Es momento de detener operaciones y liquidar ordenadamente para evitar daño patrimonial.`;
  } else if (maxConsecutiveUnplannedLosses === 2 || runwayLibreMeses <= 1.5) {
    phase = 'NARANJA';
    phaseName = 'Fase Naranja: Reestructuración de Choque & Rescate';
    badgeColor = '#f97316';
    alertMessage = 'Se acumulan 2 meses de pérdida consecutiva imprevista. Requiere recorte inmediato de costos no esenciales, ajuste de nómina convenido y llamado de capital de emergencia.';
  } else if (maxConsecutiveUnplannedLosses === 1 || runwayLibreMeses <= 3.0) {
    phase = 'AMARILLA';
    phaseName = 'Fase Amarilla: Alerta Temprana de Fuga de Capital';
    badgeColor = '#eab308';
    alertMessage = 'Primer mes de pérdida fuera de proyección. Se recomienda auditoría de gastos discrecionales y renegociación de compras con proveedores.';
  }

  return {
    phase,
    phaseName,
    badgeColor,
    alertMessage,
    maxConsecutiveUnplannedLosses,
    monthlyBurnRateAverage: Math.round(monthlyBurnRateAverage),
    safeAvailableCash: Math.round(safeAvailableCash),
    runwayLibreMeses,
    runwayTotalMeses,
    isPlannedBurnStrategy,
    plannedBurnMonths,
    liquidationReserve: Math.round(liquidationReserve),
    currentCashBalance: Math.round(currentCashBalance),
  };
}

/**
 * Genera el Protocolo Cuántico de Contingencia y Cierre con el checklist
 * de pasos operativos para salvaguardar el patrimonio del fundador y colaboradores.
 * 
 * @param {string} currentPhase - Fase activa ('VERDE' | 'AMARILLA' | 'NARANJA' | 'ROJA')
 * @param {Object} reserveData - Datos del FRLI
 * @returns {Array} Lista estructurada de fases con checklist y acciones
 */
export function getQuantumExitProtocol(currentPhase = 'VERDE', reserveData = {}) {
  const frliFormatted = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(reserveData.totalFRLI || 100000);

  return [
    {
      phase: 'AMARILLA',
      title: 'Fase 1: Alerta Temprana & Contención de Fugas (Mes 1 con pérdida imprevista)',
      severity: 'warning',
      color: '#eab308',
      isActive: currentPhase === 'AMARILLA',
      acciones: [
        'Congelar de inmediato contrataciones, viajes y gastos discrecionales/marketing no esencial.',
        'Auditoría semanal de cuentas por cobrar para acelerar la cobranza de clientes morosos.',
        'Revisión y renegociación de plazos de pago a 30-45 días con proveedores principales.',
        'Establecer reunión quincenal de seguimiento de caja con el equipo nuclear (Finanzas/Operaciones).'
      ]
    },
    {
      phase: 'NARANJA',
      title: 'Fase 2: Plan de Choque & Reestructuración Operativa (Mes 2 con pérdida imprevista)',
      severity: 'orange',
      color: '#f97316',
      isActive: currentPhase === 'NARANJA',
      acciones: [
        'Reajuste salarial temporal de mandos medios o reducción de jornada convenida ante la autoridad laboral.',
        'Remate y liquidación de inventario de baja rotación o maquinaria secundaria no indispensable.',
        'Llamado de capital a socios o solicitud de línea de crédito puente de rescate con garantía amortizable.',
        'Verificar que el saldo en cuenta bancaria NUNCA perfore el Fondo de Reserva Intocable de ' + frliFormatted + '.'
      ]
    },
    {
      phase: 'ROJA',
      title: 'Fase 3: Activación del Kill Switch / Cierre Digno & Liquidación (Mes 3 o Saldo ≤ FRLI)',
      severity: 'danger',
      color: '#ef4444',
      isActive: currentPhase === 'ROJA',
      acciones: [
        'Ejecución del Fondo de Reserva de ' + frliFormatted + ' para pagar el 100% de indemnizaciones de ley a colaboradores sin disputas legales.',
        'Entrega ordenada del inmueble al arrendador aplicando el depósito en garantía / finiquito negociado.',
        'Liquidación de saldos con proveedores y entrega de inventario restante en dación en pago.',
        'Cierre formal de libros contables, presentación de declaración de liquidación ante el SAT y baja patronal ante el IMSS.'
      ]
    }
  ];
}
