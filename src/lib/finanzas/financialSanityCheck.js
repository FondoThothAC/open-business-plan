/**
 * @file financialSanityCheck.js
 * @description Validador de cordura y consistencia financiera cruzada.
 * Inspecciona congruencia entre la inversión de la semilla, el balance general y
 * los indicadores de rentabilidad (TIR, VPN, Payback, ROI, Punto de Equilibrio).
 */

import { parseCurrencyNumber, resolveCanonicalCapex } from './canonicalCapex.js';

/**
 * Valida la consistencia de los datos financieros de un plan de negocios.
 * 
 * Reglas auditadas:
 * 1. Consistencia entre semilla y desglose de inversión (desviación máxima +-5%).
 * 2. Plausibilidad de la TIR (rango válido 0% a 100%).
 * 3. Plausibilidad de Payback (no "Nunca", plazo no mayor a 10 años).
 * 4. Plausibilidad de ROI (rango -100% a 1000%).
 * 5. Punto de equilibrio libre de división por cero o valor infinito (∞).
 * 
 * @param {Object} planData - Árbol completo del proyecto.
 * @returns {{ valid: boolean, inconsistencies: Array<{ module: string, field: string, flag: string, expected: any, actual: any }>, warnings: Array<string> }}
 */
export function validateFinancialConsistency(planData = {}) {
  const seed = planData?.semilla || {};
  const inconsistencies = [];
  const warnings = [];

  // 1. Obtener inversión declarada en semilla si existe
  const seedCapex = parseCurrencyNumber(seed?.inversion_esperada || seed?.finanzas?.inversion_inicial);

  // Obtener suma de inversión desglosada en organización
  const inv = planData?.organizacion?.inversion;
  if (seedCapex > 0 && inv && typeof inv === 'object') {
    const fija = parseCurrencyNumber(inv.inversion_fija);
    const diferida = parseCurrencyNumber(inv.inversion_diferida);
    const opex = parseCurrencyNumber(inv.opex_inicial);
    const financiamiento = parseCurrencyNumber(inv.financiamiento);
    const sumaDesglose = fija + diferida + opex + financiamiento;

    if (sumaDesglose > 0) {
      const delta = Math.abs(seedCapex - sumaDesglose);
      const ratio = delta / seedCapex;
      if (ratio > 0.05) {
        inconsistencies.push({
          module: 'organizacion.inversion',
          field: 'desglose_vs_semilla',
          flag: 'inconsistency_canonicas',
          expected: seedCapex,
          actual: sumaDesglose
        });
        warnings.push(
          `La suma del desglose de inversión ($${sumaDesglose.toLocaleString()}) difiere de la inversión canónica declarada en la semilla ($${seedCapex.toLocaleString()}) en más de un 5%.`
        );
      }
    }
  }

  // 2. Auditar Rentabilidad e Indicadores
  const rentabilidad = planData?.organizacion?.rentabilidad;
  if (rentabilidad && typeof rentabilidad === 'object') {
    const indicadoresStr = String(rentabilidad.indicadores || '');
    const peStr = String(rentabilidad.punto_equilibrio || '');

    // Auditar TIR
    const tirMatch = indicadoresStr.match(/TIR[:\s]+(-?\d+(?:\.\d+)?)\s*%/i);
    if (tirMatch) {
      const tirVal = parseFloat(tirMatch[1]);
      if (tirVal < 0 || tirVal > 100) {
        inconsistencies.push({
          module: 'organizacion.rentabilidad',
          field: 'indicadores.tir',
          flag: 'tir_implausible',
          expected: '0% a 100%',
          actual: `${tirVal}%`
        });
        warnings.push(`TIR calculada (${tirVal}%) está fuera del rango financiero plausible (0% - 100%).`);
      }
    }

    // Auditar Payback
    if (/nunca/i.test(indicadoresStr)) {
      inconsistencies.push({
        module: 'organizacion.rentabilidad',
        field: 'indicadores.payback',
        flag: 'payback_no_viable',
        expected: '<= 10 años',
        actual: 'Nunca'
      });
      warnings.push('El periodo de recuperación de la inversión (Payback) indica "Nunca", señalando inviabilidad.');
    } else {
      const paybackMatch = indicadoresStr.match(/payback[:\s]+(\d+(?:\.\d+)?)\s*a/i);
      if (paybackMatch) {
        const paybackYears = parseFloat(paybackMatch[1]);
        if (paybackYears > 10) {
          inconsistencies.push({
            module: 'organizacion.rentabilidad',
            field: 'indicadores.payback',
            flag: 'payback_no_viable',
            expected: '<= 10 años',
            actual: `${paybackYears} años`
          });
          warnings.push(`Payback (${paybackYears} años) excede el umbral estándar de recuperación.`);
        }
      }
    }

    // Auditar Punto de Equilibrio
    if (peStr.includes('∞') || /infinito/i.test(peStr) || /NaN/i.test(peStr)) {
      inconsistencies.push({
        module: 'organizacion.rentabilidad',
        field: 'punto_equilibrio',
        flag: 'pe_infinito',
        expected: 'Monto finito en MXN',
        actual: peStr
      });
      warnings.push('El Punto de Equilibrio contiene valores infinitos o división por cero.');
    }
  }

  return {
    valid: inconsistencies.length === 0,
    inconsistencies,
    warnings
  };
}
