/**
 * @file canonicalCapex.js
 * @description Motor de resolución unificada y canónica de inversión inicial (CAPEX)
 * Garantiza que todas las proyecciones financieras, TIR, VPN y estados financieros
 * se anclen estrictamente a la inversión declarada en la semilla del proyecto.
 */

/**
 * Limpia y convierte cadenas monetarias complejas a valor numérico puro.
 * Ej: "$20,000,000 MXN" -> 20000000
 * @param {string|number} val - Valor numérico o string con formato monetario.
 * @returns {number}
 */
export function parseCurrencyNumber(val) {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }
  if (!val || typeof val !== 'string') {
    return 0;
  }
  
  // Buscar primero un patrón monetario explícito: $10,000,000 o 10,000,000 o $10M
  const moneyMatch = val.match(/\$?\s*([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]+)?)/);
  if (moneyMatch) {
    const cleanStr = moneyMatch[1].replace(/,/g, '');
    const parsed = parseFloat(cleanStr);
    if (!isNaN(parsed)) return parsed;
  }

  // Soporte para sufijos M (Millones) o K (Miles): ej "$20M" o "$20 M"
  const suffixMatch = val.match(/\$?\s*([0-9]+(?:\.[0-9]+)?)\s*([mMkK])/);
  if (suffixMatch) {
    const base = parseFloat(suffixMatch[1]);
    const mult = suffixMatch[2].toLowerCase() === 'm' ? 1000000 : 1000;
    if (!isNaN(base)) return base * mult;
  }

  // Fallback a primer número secuencial
  const firstNumMatch = val.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (firstNumMatch) {
    const parsed = parseFloat(firstNumMatch[1]);
    if (!isNaN(parsed)) return parsed;
  }

  return 0;
}

/**
 * Resuelve el CAPEX canónico de un proyecto respetando la jerarquía de fuentes.
 * 
 * Jerarquía de resolución:
 * 1. seed.inversion_esperada
 * 2. seed.finanzas?.inversion_inicial
 * 3. Suma de planData.organizacion.inversion (fija + diferida + opex_inicial)
 * 4. planData.organizacion.inversion.monto_inversion
 * 5. Modo Strict (OBP_STRICT_FINANCIALS=1): Lanza Error
 *    Modo Permisivo: Warning formal + fallback seguro (150,000 MXN)
 * 
 * @param {Object} planData - Árbol completo del proyecto.
 * @param {Object} seed - Datos de la semilla del proyecto.
 * @returns {{ capex: number, source: string, status: string, requiresReview?: boolean }}
 */
export function resolveCanonicalCapex(planData = {}, seed = {}) {
  const isStrict = typeof process !== 'undefined' && process.env?.OBP_STRICT_FINANCIALS === '1';

  // 1. seed.inversion_esperada
  if (seed?.inversion_esperada !== undefined && seed?.inversion_esperada !== null && seed?.inversion_esperada !== '') {
    const parsed = parseCurrencyNumber(seed.inversion_esperada);
    if (parsed > 0) {
      return {
        capex: parsed,
        source: 'seed.inversion_esperada',
        status: 'resolved'
      };
    }
  }

  // 2. seed.finanzas?.inversion_inicial
  if (seed?.finanzas?.inversion_inicial !== undefined && seed?.finanzas?.inversion_inicial !== null && seed?.finanzas?.inversion_inicial !== '') {
    const parsed = parseCurrencyNumber(seed.finanzas.inversion_inicial);
    if (parsed > 0) {
      return {
        capex: parsed,
        source: 'seed.finanzas.inversion_inicial',
        status: 'resolved'
      };
    }
  }

  // 3. Suma de desgloses de inversión en planData.organizacion.inversion
  const inv = planData?.organizacion?.inversion;
  if (inv && typeof inv === 'object') {
    const fija = parseCurrencyNumber(inv.inversion_fija);
    const diferida = parseCurrencyNumber(inv.inversion_diferida);
    const opex = parseCurrencyNumber(inv.opex_inicial);
    const suma = fija + diferida + opex;

    if (suma > 0) {
      return {
        capex: suma,
        source: 'planData.organizacion.inversion.desglose',
        status: 'resolved'
      };
    }

    // 4. planData.organizacion.inversion.monto_inversion
    if (inv.monto_inversion !== undefined && inv.monto_inversion !== null && inv.monto_inversion !== '') {
      const parsedMonto = parseCurrencyNumber(inv.monto_inversion);
      if (parsedMonto > 0) {
        return {
          capex: parsedMonto,
          source: 'planData.organizacion.inversion.monto_inversion',
          status: 'resolved'
        };
      }
    }
  }

  // 5. Fallback o Error en Modo Strict
  if (isStrict) {
    throw new Error(
      'INVERSION_CANONICA_NO_ENCONTRADA: El proyecto no cuenta con una cifra de inversión inicial declarada en la semilla ni en el desglose de inversión.'
    );
  }

  return {
    capex: 150000,
    source: 'fallback_default',
    status: 'warning_fallback',
    requiresReview: true
  };
}
