/**
 * Renombrado Seguro y Consolidación de Proyectos
 * Fondo Thoth AC — Open Business Plan
 * 
 * Gestiona el cambio de nombre / identificador de proyectos, asegurando que:
 * 1. El proyecto de origen exista.
 * 2. No se sobreescriba accidentalmente otro proyecto existente.
 * 3. Se actualicen las propiedades de identidad del plan.
 * 4. Se genere el JSON versionado (.json) y el Markdown canónico (.md).
 * 5. El directorio anterior se archive de manera segura en .archive/.
 */

import fs from 'fs';
import path from 'path';
import { saveWithVersioning } from './saveVersioning.js';

/**
 * Convierte un objeto planData en representación Markdown legible.
 * @param {Object} planData
 * @returns {string}
 */
export function planToMarkdown(planData) {
  let md = `# Proyecto: ${planData.semilla?.negocio?.nombre_marca || planData.semilla?.nombre_proyecto || 'Proyecto Sin Nombre'}\n`;
  md += `**Tipo de Metodología:** ${planData.config?.projectType === 'social_bid' ? 'Proyecto Social BID' : 'Plan Comercial'}\n`;
  md += `**Última Actualización:** ${new Date().toLocaleString()}\n\n`;

  if (planData.semilla) {
    md += `## SEMILLA\n\n`;
    for (const [moduleKey, moduleData] of Object.entries(planData.semilla)) {
      md += `### Módulo: ${moduleKey}\n\n`;
      if (moduleData && typeof moduleData === 'object') {
        for (const [fieldKey, fieldValue] of Object.entries(moduleData)) {
          if (typeof fieldValue === 'string') {
            md += `**${fieldKey}:**\n${fieldValue}\n\n`;
          } else if (typeof fieldValue === 'object' && fieldValue !== null) {
            md += `**${fieldKey}:**\n\`\`\`json\n${JSON.stringify(fieldValue, null, 2)}\n\`\`\`\n\n`;
          }
        }
      }
    }
  }

  const sections = ['naturaleza', 'mercado', 'tecnico', 'organizacion', 'finanzas'];
  for (const section of sections) {
    if (planData[section]) {
      md += `## ${section.toUpperCase()}\n\n`;
      for (const [moduleKey, moduleData] of Object.entries(planData[section])) {
        md += `### Módulo: ${moduleKey}\n\n`;
        if (moduleData && typeof moduleData === 'object') {
          for (const [fieldKey, fieldValue] of Object.entries(moduleData)) {
            if (typeof fieldValue === 'string') {
              md += `**${fieldKey}:**\n${fieldValue}\n\n`;
            } else if (typeof fieldValue === 'object' && fieldValue !== null) {
              md += `**${fieldKey}:**\n\`\`\`json\n${JSON.stringify(fieldValue, null, 2)}\n\`\`\`\n\n`;
            }
          }
        }
      }
    }
  }

  return md;
}

/**
 * Renombra un proyecto existente y consolida sus archivos.
 * @param {Object} options
 * @param {string} options.baseDir Directorio base (ej. 'proyectos' o ruta absoluta)
 * @param {string} options.type Tipo de proyecto ('negocios' o 'social')
 * @param {string} options.currentId ID actual del proyecto
 * @param {string} options.newId Nuevo ID o nombre a asignar
 * @param {string} [options.newCompanyName] Nuevo nombre comercial opcional
 * @param {string} [options.userFolder] Subdirectorio de usuario (ej. 'user_123')
 * @param {boolean} [options.allowOverwrite=false] Si permite sobreescribir destino
 * @returns {{ success: boolean, oldId: string, newId: string, archivePath: string }}
 */
export function renameProject({
  baseDir = path.resolve('proyectos'),
  type = 'negocios',
  currentId,
  newId,
  newCompanyName = null,
  userFolder = '',
  allowOverwrite = false
}) {
  if (!currentId || !newId) {
    throw new Error('PROJECT_ID_REQUIRED: Se requieren currentId y newId');
  }

  const safeOldId = currentId.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const safeNewId = newId.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  // Construir rutas
  const typeDir = userFolder ? path.join(baseDir, type, userFolder) : path.join(baseDir, type);
  const oldProjDir = path.join(typeDir, safeOldId);
  const oldJsonPath = path.join(oldProjDir, `${safeOldId}.json`);

  // 1. Validar que el proyecto de origen exista
  if (!fs.existsSync(oldJsonPath)) {
    throw new Error(`PROJECT_NOT_FOUND: El proyecto ${currentId} no existe en ${oldProjDir}`);
  }

  // 2. Validar que el destino no exista previamente
  const newProjDir = path.join(typeDir, safeNewId);
  if (fs.existsSync(newProjDir) && !allowOverwrite) {
    throw new Error(`PROJECT_ALREADY_EXISTS: Ya existe un proyecto con el identificador ${safeNewId}`);
  }

  // 3. Leer y consolidar planData
  const rawData = fs.readFileSync(oldJsonPath, 'utf8');
  let planData;
  try {
    planData = JSON.parse(rawData);
  } catch (err) {
    throw new Error(`PROJECT_CORRUPTED: El archivo ${oldJsonPath} no contiene JSON válido (${err.message})`, { cause: err });
  }

  // Actualizar metadatos de identidad
  if (!planData.config) planData.config = {};
  planData.config.projectId = safeNewId;

  if (newCompanyName) {
    if (!planData.config.brandKit) planData.config.brandKit = {};
    planData.config.brandKit.companyName = newCompanyName;
    if (!planData.semilla) planData.semilla = {};
    planData.semilla.nombre_proyecto = newCompanyName;
    if (planData.semilla.negocio) {
      planData.semilla.negocio.nombre_marca = newCompanyName;
    }
  }

  // 4. Crear nuevo directorio y guardar
  if (!fs.existsSync(newProjDir)) {
    fs.mkdirSync(newProjDir, { recursive: true });
  }

  const docsDir = path.join(newProjDir, 'documentos');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Si había subdirectorio de documentos en el origen, copiar archivos de soporte
  const oldDocsDir = path.join(oldProjDir, 'documentos');
  if (fs.existsSync(oldDocsDir)) {
    const docFiles = fs.readdirSync(oldDocsDir);
    for (const df of docFiles) {
      const srcDoc = path.join(oldDocsDir, df);
      const dstDoc = path.join(docsDir, df);
      if (fs.statSync(srcDoc).isFile() && !fs.existsSync(dstDoc)) {
        fs.copyFileSync(srcDoc, dstDoc);
      }
    }
  }

  // Guardado con versionado inmutable
  saveWithVersioning({
    dirPath: newProjDir,
    safeName: safeNewId,
    planData,
    allowRegression: true
  });

  // Generar y guardar Markdown canónico
  const mdContent = planToMarkdown(planData);
  fs.writeFileSync(path.join(newProjDir, `${safeNewId}.md`), mdContent, 'utf8');

  // 5. Archivar el directorio viejo
  const archiveBase = path.join(typeDir, '.archive');
  if (!fs.existsSync(archiveBase)) {
    fs.mkdirSync(archiveBase, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archivePath = path.join(archiveBase, `${safeOldId}_archived_${timestamp}`);

  // Mover directorio viejo a archive
  fs.renameSync(oldProjDir, archivePath);

  return {
    success: true,
    oldId: safeOldId,
    newId: safeNewId,
    archivePath
  };
}
