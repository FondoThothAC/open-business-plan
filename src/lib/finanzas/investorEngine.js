/**
 * @file investorEngine.js
 * @description Motor de estructuración de capital e inversión para Open Business Plan (OBP).
 * Modela tres escenarios de financiamiento:
 *   E1: Arrendamiento de maquinaria y activos (LGSM arts. 85/123, LISR art. 140/28).
 *   E2: Riesgo compartido (Equity) con múltiplos de salida EBITDA (3.7x - 5.5x) y derechos de minoría (LMV art. 16).
 *   E3: Financiamiento por tramos escalonados condicionados a hitos contractuales.
 * Valida cumplimiento estricto con la Ley del Mercado de Valores (LMV art. 8 fracc. II: < 100 personas).
 */

/**
 * Valida si la estructura de levantamiento cumple con las normas de oferta privada de la LMV.
 * @param {Object} params - Parámetros del levantamiento
 * @param {number} params.totalRaise - Monto total a levantar en MXN
 * @param {number} params.investorCount - Número de inversionistas previstos
 * @param {number} params.minTicket - Boleto mínimo de inversión
 * @returns {Object} Diagnóstico de cumplimiento y alertas
 */
export function validateLMVCompliance({ totalRaise = 0, investorCount = 1, minTicket = 0 }) {
  const alerts = [];
  const MAX_PRIVATE_INVESTORS = 99; // LMV art. 8 fracc. II (< 100 personas)
  const UDI_VALUE_2026 = 8.84;
  const QUALIFIED_THRESHOLD_MXN = Math.round(1500000 * UDI_VALUE_2026); // ~13.3 MDP

  let isCompliant = true;

  if (investorCount > MAX_PRIVATE_INVESTORS) {
    isCompliant = false;
    alerts.push(
      `Infracción a LMV art. 8 fracc. II: La colocación privada no puede superar 99 personas (tope legal: menos de 100 personas; propuesta actual: ${investorCount} inversionistas). Superar 100 personas requiere autorización previa de la CNBV bajo pena de delito federal (LMV arts. 6, 7 y 385).`
    );
  }

  const effectiveTicket = minTicket > 0 ? minTicket : (investorCount > 0 ? Math.round(totalRaise / investorCount) : totalRaise);
  if (effectiveTicket < 200000 && investorCount > 50) {
    alerts.push(
      `Alerta de gobernanza: Un boleto de $${effectiveTicket.toLocaleString()} MXN atomiza la mesa directiva. Los inversionistas acumulan derechos de minoría (10% designa consejero, 15% acción de responsabilidad, LMV art. 16) sin ser calificados.`
    );
  }

  const recommendedMinTicket = Math.max(250000, Math.round(totalRaise / Math.min(20, MAX_PRIVATE_INVESTORS)));

  return {
    isCompliant,
    investorCount,
    maxAllowedInvestors: MAX_PRIVATE_INVESTORS,
    effectiveTicket,
    recommendedMinTicket,
    qualifiedInvestorThresholdMxn: QUALIFIED_THRESHOLD_MXN,
    alerts
  };
}

/**
 * Calcula los tres escenarios formales de levantamiento de capital para el proyecto.
 * @param {Object} financials - Indicadores financieros base del proyecto
 * @param {Object} config - Configuración específica de la ronda
 * @returns {Object} Escenarios detallados E1, E2, E3 y análisis de sensibilidad
 */
export function calculateInvestorScenarios(financials = {}, config = {}) {
  const capex = Number(financials.capexTotal || financials.netInitialInvestment || 20000000);
  const ebitdaY1 = Number(financials.annualEbitdaYear1 || 3400000);
  const ebitdaY5 = Number(financials.annualEbitdaYear5 || (ebitdaY1 * 2));
  const fcf5Years = Number(financials.freeCashFlow5YearsCumulative || (ebitdaY1 * 3.5));
  const taxRate = 0.30; // ISR México

  // ==========================================
  // ESCENARIO E1: Arrendamiento de Maquinaria / Activos
  // ==========================================
  const leaseTermMonths = config.leaseTermMonths || 60;
  const interestRateAnnual = config.interestRateAnnual || 12; // 12% anual
  const r = (interestRateAnnual / 100) / 12;
  
  // Renta mensual nivelada por amortización francesa
  const rentaMensual = Math.round(capex * (r * Math.pow(1 + r, leaseTermMonths)) / (Math.pow(1 + r, leaseTermMonths) - 1));
  const rentaAnual = rentaMensual * 12;
  const pagoTotalLease = rentaMensual * leaseTermMonths;
  const ahorroFiscalTotal = Math.round(pagoTotalLease * taxRate);
  const costoNetoArrendamiento = pagoTotalLease - ahorroFiscalTotal;

  const e1_arrendamiento = {
    nombre: 'E1 · Arrendamiento de Maquinaria y Equipos (Renta Deducible)',
    marcoLegal: 'LGSM arts. 85/123 y LISR arts. 28 fracc. XXVI y 140 (gasto 100% operativo deducible)',
    plazoMeses: leaseTermMonths,
    tasaAnualPct: interestRateAnnual,
    rentaMensual,
    rentaAnual,
    pagoTotalLease,
    ahorroFiscalTotal,
    costoNetoArrendamiento,
    tirArrendador: interestRateAnnual,
    ventajaPrincipal: 'No diluye capital ni otorga derechos políticos a terceros. Pago deducible de impuestos.'
  };

  // ==========================================
  // ESCENARIO E2: Riesgo Compartido (Equity con Múltiplos)
  // ==========================================
  const equityPct = config.equityPercentageOffered || 60; // 60% participación
  const exitMultiple = config.exitMultiple || 4.5;
  const valuacionPostMoney = Math.round(capex / (equityPct / 100));
  const valuacionPreMoney = valuacionPostMoney - capex;

  const multiplosSensibilidad = {};
  const bandas = [3.7, 4.5, 5.5, 6.0];

  for (const m of bandas) {
    const valExit = Math.round(ebitdaY5 * m);
    const retornoInversionista = Math.round(valExit * (equityPct / 100));
    const moic = Number((retornoInversionista / capex).toFixed(2));
    const tirExit = Number(((Math.pow(Math.max(0.1, retornoInversionista / capex), 1 / 5) - 1) * 100).toFixed(1));
    const dataEntry = {
      multiploEbitda: m,
      valorCompaniaSalida: valExit,
      retornoInversionista,
      moic,
      tirInversionistaPct: tirExit
    };
    multiplosSensibilidad[`${m}x`] = dataEntry;
    multiplosSensibilidad[`${m.toFixed(1)}x`] = dataEntry;
  }

  const baseMultipleData = multiplosSensibilidad[`${exitMultiple}x`] || multiplosSensibilidad['4.5x'] || multiplosSensibilidad['4.5x'];

  const e2_equity = {
    nombre: 'E2 · Riesgo Compartido (Equity Preferente Serie B)',
    marcoLegal: 'LMV arts. 12-17 (S.A.P.I. de C.V.) con drag-along, tag-along y liquidación preferente',
    participacionOfrecidaPct: equityPct,
    valuacionPreMoney,
    valuacionPostMoney,
    ebitdaProyectadoAnio5: ebitdaY5,
    multiploSalidaBase: exitMultiple,
    valorEstimadoSalida: baseMultipleData.valorCompaniaSalida,
    retornoInversionistaEstimado: baseMultipleData.retornoInversionista,
    moic: baseMultipleData.moic,
    tirInversionistaPct: baseMultipleData.tirInversionistaPct,
    multiplosSensibilidad,
    ventajaPrincipal: 'Alineación de riesgo al 100%; sin presión de deuda fija en meses de menor flujo.'
  };

  // ==========================================
  // ESCENARIO E3: Financiamiento en Tramos Escalonados
  // ==========================================
  let tramos = config.tranches;
  if (!Array.isArray(tramos) || tramos.length === 0) {
    tramos = [
      {
        id: 1,
        name: 'Tramo 1: Habilitación de Nave e Infraestructura Crítica',
        amount: Math.round(capex * 0.50),
        milestone: 'Puesta en marcha de taller, banco de pruebas y primeros 5 contratos marco'
      },
      {
        id: 2,
        name: 'Tramo 2: Maquinaria Mayor y Expansión',
        amount: Math.round(capex * 0.50),
        milestone: 'Contratos vigentes superiores al punto de equilibrio operativo'
      }
    ];
  }

  const e3_tramos = {
    nombre: 'E3 · Financiamiento Escalonado por Hitos Contractuales',
    marcoLegal: 'Aportaciones de capital en tramos condicionadas a resolución de Consejo (LMV art. 14)',
    montoTotal: capex,
    tramos,
    ventajaPrincipal: 'Reduce el costo de capital inicial y protege al inversionista liberando fondos contra tracción real.'
  };

  // Validador de Cumplimiento LMV
  const complianceLMV = validateLMVCompliance({
    totalRaise: capex,
    investorCount: config.investorCount || 20,
    minTicket: config.minTicket || (capex / 20)
  });

  return {
    capexTotal: capex,
    complianceLMV,
    escenarios: {
      E1_arrendamiento: e1_arrendamiento,
      E2_equity: e2_equity,
      E3_tramos: e3_tramos
    },
    resumenEjecutivo: `Estructura de financiamiento para ${capex.toLocaleString()} MXN: E1 Arrendamiento ($${rentaMensual.toLocaleString()}/mes, deducible), E2 Equity (${equityPct}% al ${exitMultiple}x EBITDA, TIR ${baseMultipleData.tirInversionistaPct}%), E3 Tramos en 2 fases.`
  };
}
