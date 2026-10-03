/**
 * @file crossValidation.js
 * @description Motor de validación estadística cruzada para fuentes de datos financieros.
 * Exige un mínimo de 2 fuentes independientes con dispersión máxima del 30% (Decisión D2 del grill-me).
 */

/**
 * Normaliza valores monetarios o numéricos expresados en periodos temporales a base mensual.
 * @param {number} val - Monto original
 * @param {'diario' | 'semanal' | 'mensual' | 'anual'} periodicidad - Periodicidad del dato
 * @returns {number} Monto mensual normalizado
 */
export function normalizeToMonthly(val, periodicidad = 'mensual') {
  const num = Number(val || 0);
  if (isNaN(num) || num <= 0) return 0;

  switch (periodicidad) {
    case 'diario':
      return Math.round(num * 26); // 26 días productivos mensuales
    case 'semanal':
      return Math.round(num * 4.33); // 4.33 semanas por mes promedio
    case 'anual':
      return Math.round(num / 12);
    case 'mensual':
    default:
      return Math.round(num);
  }
}

/**
 * Realiza el cruce estadístico entre múltiples fuentes de estimación de mercado.
 * @param {Array<{ entidad?: string, valor: number, url?: string, fecha?: string }>} fuentes - Lista de fuentes
 * @param {number} toleranciaDispersion - Tolerancia máxima permitida (por defecto 0.30 o 30%)
 * @returns {{ esValido: boolean, confianza: 'alta' | 'media' | 'pendiente', valorConsolidado: number, motivo?: string, fuentesUsadas: number }}
 */
export function crossValidateSources(fuentes = [], toleranciaDispersion = 0.30) {
  if (!Array.isArray(fuentes) || fuentes.length === 0) {
    return {
      esValido: false,
      confianza: 'pendiente',
      valorConsolidado: 0,
      motivo: 'No se encontraron fuentes de datos registradas.',
      fuentesUsadas: 0
    };
  }

  const validas = fuentes
    .map(f => ({ ...f, valorNumerico: Number(f.valor) }))
    .filter(f => !isNaN(f.valorNumerico) && f.valorNumerico > 0);

  if (validas.length === 0) {
    return {
      esValido: false,
      confianza: 'pendiente',
      valorConsolidado: 0,
      motivo: 'Las fuentes provistas no contienen valores numéricos válidos mayores a cero.',
      fuentesUsadas: 0
    };
  }

  // Regla estricta D2 acordada en el grill-me: Mínimo 2 fuentes requeridas para inferencias automáticas
  if (validas.length < 2) {
    return {
      esValido: false,
      confianza: 'pendiente',
      valorConsolidado: validas[0].valorNumerico,
      motivo: 'Se requiere un mínimo de 2 fuentes reales cruzadas para validar automáticamente el supuesto sin aprobación manual.',
      fuentesUsadas: 1
    };
  }

  const valores = validas.map(f => f.valorNumerico).sort((a, b) => a - b);
  const min = valores[0];
  const max = valores[valores.length - 1];

  // Cálculo de mediana
  const mitad = Math.floor(valores.length / 2);
  const mediana = valores.length % 2 !== 0
    ? valores[mitad]
    : (valores[mitad - 1] + valores[mitad]) / 2;

  const dispersion = (max - min) / (mediana || 1);

  if (dispersion > toleranciaDispersion) {
    return {
      esValido: false,
      confianza: 'pendiente',
      valorConsolidado: Math.round(mediana),
      motivo: `dispersión excesiva entre fuentes (${Math.round(dispersion * 100)}% excede la tolerancia permitida del ${Math.round(toleranciaDispersion * 100)}%). Requiere captura o confirmación manual del emprendedor.`,
      fuentesUsadas: validas.length
    };
  }

  const promedio = valores.reduce((acc, v) => acc + v, 0) / valores.length;

  return {
    esValido: true,
    confianza: 'alta',
    valorConsolidado: Math.round(promedio),
    motivo: `Validado con éxito a partir de ${validas.length} fuentes coincidentes (dispersión: ${Math.round(dispersion * 100)}%).`,
    fuentesUsadas: validas.length
  };
}
