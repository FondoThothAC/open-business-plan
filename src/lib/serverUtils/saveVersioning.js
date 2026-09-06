/**
 * @file saveVersioning.js
 * @description Utilidades de backend para el guardado inmutable, versionado SHA-1
 * y protección contra regresión de módulos (Anti-Duplicación y Anti-Corrupción).
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { parseCurrencyNumber } from '../finanzas/canonicalCapex.js';

/**
 * Cuenta la cantidad de módulos canónicos que contienen datos válidos en un plan.
 * @param {Object} planData
 * @returns {number}
 */
export function countPopulatedModules(planData = {}) {
  let count = 0;
  // Conjunto exhaustivo de pilares de las 12 metodologías canónicas
  const knownPillars = [
    'naturaleza', 'mercado', 'tecnico', 'organizacion', 'simulador_financiero',
    'identificacion', 'diseno', 'ejecucion', 'presupuesto', 'validacion',
    'experimento', 'aprendizaje', 'finanzas_agiles', 'innovacion', 'viabilidad_tecnica',
    'mercado_tecnologico', 'responsabilidad_social', 'mercado_cuantitativo',
    'ingenieria_tecnica', 'presupuesto_obra', 'estructura_capital', 'riesgo_matematico',
    'analisis_situacion', 'planificacion_mpp', 'excelencia_cientifica',
    'impacto_sostenibilidad', 'vision_largo_plazo', 'alineacion_ejecucion',
    'estructuracion_celulas', 'economia_interna', 'redes_estado', 'manejo_conflictos',
    'ingenieria_industrial', 'financiamiento_global'
  ];

  // Identificar todas las claves candidatas que no sean metadatos del sistema
  const nonPillarKeys = new Set(['config', 'semilla', 'anexos', 'brandKit', 'canvas', 'history', 'telemetry', 'multiBranch', 'aiMemory']);
  const allCandidateKeys = new Set([...knownPillars, ...Object.keys(planData).filter(k => !nonPillarKeys.has(k))]);

  allCandidateKeys.forEach(pKey => {
    const pillarObj = planData[pKey];
    if (pillarObj && typeof pillarObj === 'object' && !Array.isArray(pillarObj)) {
      Object.keys(pillarObj).forEach(modKey => {
        const modContent = pillarObj[modKey];
        if (modContent && typeof modContent === 'object' && !Array.isArray(modContent)) {
          const hasContent = Object.values(modContent).some(val => {
            if (val === null || val === undefined) return false;
            if (typeof val === 'number') return true;
            if (typeof val === 'string' && val.trim().length >= 3) return true;
            if (Array.isArray(val) && val.length > 0) return true;
            if (typeof val === 'object' && Object.keys(val).length > 0) return true;
            return false;
          });
          if (hasContent) {
            count++;
          }
        }
      });
    }
  });

  return count;
}

/**
 * Guarda un plan de negocios aplicando versionado histórico inmutable en .versions/
 * y validando que no ocurra pérdida accidental de módulos poblados.
 * 
 * @param {Object} params
 * @param {string} params.dirPath - Ruta física del directorio del proyecto.
 * @param {string} params.safeName - Slug o identificador seguro del archivo.
 * @param {Object} params.planData - Contenido del plan a guardar.
 * @param {boolean} [params.allowRegression=false] - Forzar guardado incluso si disminuyen módulos.
 * @returns {{ success: boolean, versionSaved: boolean, versionHash: string, modulesCount: number }}
 */
export function saveWithVersioning({ dirPath, safeName, planData, allowRegression = false }) {
  if (!dirPath || !safeName || !planData) {
    throw new Error('Parámetros requeridos faltantes para saveWithVersioning.');
  }

  const versionsDir = path.join(dirPath, '.versions');
  if (!fs.existsSync(versionsDir)) {
    fs.mkdirSync(versionsDir, { recursive: true });
  }

  const manifestPath = path.join(versionsDir, 'index.json');
  let manifest = { versions: [] };
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
      manifest = { versions: [] };
    }
  }

  const currentModulesCount = countPopulatedModules(planData);
  const rawString = JSON.stringify(planData, null, 2);
  const hash = crypto.createHash('sha1').update(rawString).digest('hex');
  const shortHash = hash.substring(0, 8);

  // Anti-regresión: comprobar si la versión previa estable tenía significativamente más módulos
  if (manifest.versions.length > 0 && !allowRegression) {
    const lastStable = manifest.versions[manifest.versions.length - 1];
    if (lastStable && lastStable.modulesCount > currentModulesCount) {
      throw new Error(
        `MODULE_COUNT_REGRESSION_DETECTED: El plan entrante contiene ${currentModulesCount} módulos, menor a los ${lastStable.modulesCount} módulos previamente guardados. Confirma para forzar.`
      );
    }
  }

  // Guardar archivo de versión inmutable
  const isoDate = new Date().toISOString().replace(/[:.]/g, '-');
  const versionFileName = `${isoDate}-${shortHash}.json`;
  const versionFilePath = path.join(versionsDir, versionFileName);
  fs.writeFileSync(versionFilePath, rawString);

  // Extraer inversión canónica de referencia
  const invTotal = parseCurrencyNumber(
    planData.semilla?.inversion_esperada ||
    planData.semilla?.finanzas?.inversion_inicial ||
    planData.organizacion?.inversion?.monto_inversion
  );

  // Actualizar manifiesto
  manifest.versions.push({
    ts: new Date().toISOString(),
    file: versionFileName,
    hash: shortHash,
    modulesCount: currentModulesCount,
    inversionTotal: invTotal
  });

  // Política FIFO: máximo 20 versiones
  if (manifest.versions.length > 20) {
    const toRemove = manifest.versions.splice(0, manifest.versions.length - 20);
    toRemove.forEach(v => {
      const oldFile = path.join(versionsDir, v.file);
      if (fs.existsSync(oldFile)) {
        try {
          fs.unlinkSync(oldFile);
        } catch {}
      }
    });
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // Escribir el archivo principal
  const mainJsonPath = path.join(dirPath, `${safeName}.json`);
  fs.writeFileSync(mainJsonPath, rawString);

  return {
    success: true,
    versionSaved: true,
    versionHash: shortHash,
    modulesCount: currentModulesCount
  };
}
