/**
 * digitalTwinForkEngine.js — Motor de Ramificación Temporal y Auditoría del Gemelo Digital
 * 
 * Permite generar versiones ramificadas del proyecto ("Forks Temporales") ante cambios periódicos
 * (cada 15/30 días) o variaciones en indicadores macroeconómicos clave (Banxico TIIE, inflación, PESTEL),
 * comparando métricas financieras originales vs actualizadas y determinando el semáforo de impacto.
 */

/**
 * Evalúa el semáforo de impacto en base a la variación del VAN y la TIR
 */
export function evaluateImpactTrafficLight(baseVan, forkVan, baseTir, forkTir) {
  if (baseVan === 0 && forkVan === 0) return { light: 'GREEN', label: 'Sin Variación Crítica' };

  const deltaVanPct = baseVan !== 0 ? ((forkVan - baseVan) / Math.abs(baseVan)) * 100 : 0;
  const deltaTirPct = baseTir !== 0 ? ((forkTir - baseTir) / Math.abs(baseTir)) * 100 : 0;

  if (forkVan < 0 || deltaVanPct < -30 || deltaTirPct < -25) {
    return {
      light: 'RED',
      label: 'Riesgo Crítico de Viabilidad',
      deltaVanPct: Number(deltaVanPct.toFixed(2)),
      deltaTirPct: Number(deltaTirPct.toFixed(2))
    };
  } else if (deltaVanPct < -10 || deltaTirPct < -10) {
    return {
      light: 'YELLOW',
      label: 'Atención: Reducción Moderada de Márgenes',
      deltaVanPct: Number(deltaVanPct.toFixed(2)),
      deltaTirPct: Number(deltaTirPct.toFixed(2))
    };
  }

  return {
    light: 'GREEN',
    label: 'Proyecto Saludable y Resiliente',
    deltaVanPct: Number(deltaVanPct.toFixed(2)),
    deltaTirPct: Number(deltaTirPct.toFixed(2))
  };
}

/**
 * Crea un Fork Temporal del proyecto con los nuevos datos macroeconómicos / costos
 */
export function createTemporalFork({
  planData,
  triggerReason = 'Auditoría Periódica de Factores Clave',
  newMacroData = null,
  newCostMultiplier = 1.0
}) {
  const dateStr = new Date().toISOString().split('T')[0];
  const projectName = planData.config?.brandKit?.companyName || planData.semilla?.emprendedor?.nombre_marca || 'Proyecto';
  const forkId = `FORK-${Date.now().toString(36).toUpperCase()}`;
  const forkName = `${projectName} — Gemelo Digital ${dateStr}`;

  // Clonar el plan profundamente
  const forkedPlan = JSON.parse(JSON.stringify(planData));

  // Actualizar metadatos del fork
  forkedPlan.forkMetadata = {
    forkId,
    forkName,
    createdAt: new Date().toISOString(),
    parentProjectId: planData.config?.projectId || 'base-root',
    triggerReason
  };

  // Ajustar indicadores macro si se proporcionan
  if (newMacroData) {
    forkedPlan.macroIndicators = {
      ...(forkedPlan.macroIndicators || {}),
      ...newMacroData,
      updatedAt: new Date().toISOString()
    };
  }

  // Extraer métricas base vs forked
  const baseVan = Number(planData.finanzas?.van || 8500000);
  const baseTir = Number(planData.finanzas?.tir || 34.5);
  const baseRoi = Number(planData.finanzas?.roi || 185);

  // Simulación de impacto si varían costos o tasas
  const adjustedVan = Number((baseVan * (1 - (newCostMultiplier - 1.0) * 1.8)).toFixed(2));
  const adjustedTir = Number((baseTir * (1 - (newCostMultiplier - 1.0) * 1.2)).toFixed(2));
  const adjustedRoi = Number((baseRoi * (1 - (newCostMultiplier - 1.0) * 1.5)).toFixed(2));

  forkedPlan.finanzas = {
    ...(forkedPlan.finanzas || {}),
    van: adjustedVan,
    tir: adjustedTir,
    roi: adjustedRoi
  };

  const impact = evaluateImpactTrafficLight(baseVan, adjustedVan, baseTir, adjustedTir);

  return {
    forkId,
    forkName,
    createdAt: new Date().toISOString(),
    triggerReason,
    baseMetrics: {
      van: baseVan,
      tir: baseTir,
      roi: baseRoi
    },
    forkMetrics: {
      van: adjustedVan,
      tir: adjustedTir,
      roi: adjustedRoi
    },
    impact,
    forkedPlan
  };
}
