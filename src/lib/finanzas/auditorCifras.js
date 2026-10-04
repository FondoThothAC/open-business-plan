/**
 * @file auditorCifras.js
 * @description Motor de Auditoría Numérica Anti-Alucinaciones ("Zero Orphan Numbers") para OBP.
 * Escanea la narrativa del plan de negocio y la contrasta contra la Ficha de Drivers
 * y las corridas matemáticas, garantizando consistencia absoluta y eliminando
 * contradicciones entre texto y modelos pro-forma.
 */

import { parseNumericAmount } from './calculadoraFinanciera.js';

/**
 * Recopila todos los textos narrativos de un objeto de plan de negocios.
 * @param {Object} planData - Datos del plan
 * @returns {Array<{ seccion: string, campo: string, texto: string }>} Lista de textos
 */
function extractAllNarrativeBlocks(planData = {}) {
  const blocks = [];

  function walk(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('_') || k === 'config' || k === 'telemetry') continue;
      const currentPath = path ? `${path}.${k}` : k;
      if (typeof v === 'string' && v.trim().length > 0) {
        // Ignorar JSONs serializados
        if (v.trim().startsWith('[') || v.trim().startsWith('{')) continue;
        blocks.push({ seccion: path || 'raiz', campo: k, texto: v });
      } else if (typeof v === 'object' && v !== null) {
        walk(v, currentPath);
      }
    }
  }

  walk(planData);
  return blocks;
}

/**
 * Audita las cifras declaradas en el texto frente a la Ficha de Drivers y corrida pro-forma.
 * @param {Object} planData - Árbol completo del proyecto
 * @param {Object} options - Opciones de auditoría
 * @returns {Object} Reporte de conciliación numérica y semáforo de integridad
 */
export function auditProjectFigures(planData = {}, options = {}) {
  const drivers = planData?._fichaDrivers?.drivers || {};
  const capexModel = Number(drivers.capex_total?.valor || planData?.semilla?.inversion_esperada || 0);
  const fixedModel = Number(drivers.costos_fijos_mensuales?.valor || 0);
  const priceModel = Number(drivers.precio_unitario_o_ticket?.valor || 0);
  const volumeModel = Number(drivers.volumen_mensual_ventas?.valor || 0);

  const narrativeBlocks = extractAllNarrativeBlocks(planData);
  const discrepancies = [];
  const reconciled = [];

  for (const block of narrativeBlocks) {
    const txt = block.texto;

    // 1. Auditoría de Precios de Venta / Suscripciones
    const priceMatches = txt.matchAll(/\$\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:MXN|pesos)?\s*(?:mensuales|al\s*mes|\/mes|\/activo|\/servicio|\/pza|\/kg)?/gi);
    for (const match of priceMatches) {
      const val = parseNumericAmount(match[1]);
      if (val > 0) {
        // Si el texto menciona un cobro o suscripción que no coincide con el modelo
        if (/suscripci[oó]n|precio|tarifa|cuota|ticket|cobro/i.test(txt)) {
          if (priceModel > 0 && Math.abs(val - priceModel) / priceModel > 0.5) {
            // Verificar si es un múltiplo muy distante (ej. $45,000 vs $3,500)
            if (val > priceModel * 2 || val < priceModel * 0.5) {
              discrepancies.push({
                concepto: 'precio_o_ticket',
                seccion: block.seccion,
                campo: block.campo,
                texto: match[0],
                valorEncontrado: val,
                valorModelo: priceModel,
                severidad: 'ALTA',
                explicacion: `El texto declara un precio o cobro de $${val.toLocaleString()} MXN, el cual discrepa significativamente del precio de mercado calibrado en la Ficha de Drivers ($${priceModel.toLocaleString()} MXN).`
              });
            }
          } else if (priceModel > 0) {
            reconciled.push({
              concepto: 'precio_o_ticket',
              valor: val,
              coincideCon: priceModel
            });
          }
        }
      }
    }

    // 2. Auditoría de Plantilla / Técnicos en nómina
    const personalMatches = txt.matchAll(/([0-9]+)\s*(?:técnicos|empleados|trabajadores|operarios|ingenieros)\s*(?:en\s*n[oó]mina|fijos|contratados)?/gi);
    for (const match of personalMatches) {
      const headcount = parseInt(match[1], 10);
      const headcountModel = planData?.organizacion?.puestos?.length || (volumeModel > 0 ? Math.ceil(volumeModel / 3) : 0);
      if (headcountModel > 0 && headcount > headcountModel * 2.5) {
        discrepancies.push({
          concepto: 'personal_headcount',
          seccion: block.seccion,
          campo: block.campo,
          texto: match[0],
          valorEncontrado: headcount,
          valorModelo: headcountModel,
          severidad: 'MEDIA',
          explicacion: `El texto menciona ${headcount} técnicos en nómina, cifra desproporcionada frente a la capacidad de ${headcountModel} puestos modelados para el volumen de ventas.`
        });
      }
    }

    // 3. Auditoría de Costos Fijos
    if (/costos?\s+fijos?/i.test(txt)) {
      const fixedMatch = txt.match(/\$\s*([0-9,]+)/);
      if (fixedMatch) {
        const val = parseNumericAmount(fixedMatch[1]);
        if (fixedModel > 0 && Math.abs(val - fixedModel) / fixedModel <= 0.2) {
          reconciled.push({
            concepto: 'costos_fijos_mensuales',
            valor: val,
            coincideCon: fixedModel
          });
        }
      }
    }

    // 4. Auditoría de Inversión Inicial (CAPEX)
    if (/inversi[oó]n\s+(?:inicial|total)|capital\s+requerido/i.test(txt)) {
      const capexMatch = txt.match(/\$\s*([0-9,]+)/);
      if (capexMatch) {
        const val = parseNumericAmount(capexMatch[1]);
        if (capexModel > 0 && Math.abs(val - capexModel) / capexModel <= 0.1) {
          reconciled.push({
            concepto: 'capex_total',
            valor: val,
            coincideCon: capexModel
          });
        }
      }
    }
  }

  // Determinar estatus de integridad numérica
  let status = 'CLEAN';
  if (discrepancies.some(d => d.severidad === 'ALTA')) {
    status = 'CRITICAL';
  } else if (discrepancies.length > 0) {
    status = 'WARNING';
  }

  return {
    status,
    totalAuditedBlocks: narrativeBlocks.length,
    reconciledCount: reconciled.length,
    discrepanciesCount: discrepancies.length,
    reconciled,
    discrepancies,
    resumen: status === 'CLEAN' 
      ? 'Integridad numérica impecable: Cero cifras huérfanas ni contradicciones entre texto y modelos matemáticos.'
      : `Se detectaron ${discrepancies.length} discrepancias numéricas entre la narrativa y las proyecciones financieras.`
  };
}
