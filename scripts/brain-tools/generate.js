import fs from 'fs';
import path from 'path';

import { FRAMEWORKS } from '/Users/robertoeduardocelisrobles/Documents/FT Apps/open-business-plan-v2.5.12.3/src/config/frameworks.js';
import * as GUIDES from '/Users/robertoeduardocelisrobles/Documents/FT Apps/open-business-plan-v2.5.12.3/src/lib/field_guides.js';

const allGuides = {
  ...GUIDES.BUSINESS_GUIDES,
  ...GUIDES.SOCIAL_GUIDES,
  ...GUIDES.AGILE_GUIDES,
  ...GUIDES.MICRO_BUSINESS_GUIDES,
  ...GUIDES.TECH_GUIDES,
  ...GUIDES.INVESTMENT_GUIDES,
  ...GUIDES.ZOPP_GUIDES,
  ...GUIDES.HORIZON_EUROPE_GUIDES,
  ...GUIDES.HOSHIN_KANRI_GUIDES,
  ...GUIDES.AMOEBA_GUIDES,
  ...GUIDES.GUANXI_GUIDES,
  ...GUIDES.ONUDI_GUIDES,
};

function generateMatrizModulos() {
  const fwKeys = Object.keys(FRAMEWORKS);
  let md = `## Desglose Exacto 1 a 1 de Módulos (12 Metodologías)\n\n`;
  
  // Headers
  md += `| Identificador del Módulo | Descripción Breve | ` + fwKeys.map(k => `**${k.substring(0,3).toUpperCase()}**`).join(' | ') + ` |\n`;
  md += `| :--- | :--- | ` + fwKeys.map(() => `:---:`).join(' | ') + ` |\n`;

  // Collect all modules
  const allModulesMap = new Map(); // key -> { title, frameworks: Set }
  
  for (const fwId of fwKeys) {
    const fw = FRAMEWORKS[fwId];
    for (const pillar of fw.pillars) {
      for (const mod of pillar.modules) {
        if (!allModulesMap.has(mod.key)) {
          allModulesMap.set(mod.key, {
            title: mod.title,
            desc: mod.description,
            frameworks: new Set()
          });
        }
        allModulesMap.get(mod.key).frameworks.add(fwId);
      }
    }
  }

  // Rows
  for (const [modKey, data] of allModulesMap.entries()) {
    let row = `| \`${modKey}\` | ${data.title} |`;
    for (const fwId of fwKeys) {
      row += data.frameworks.has(fwId) ? ` ✓ |` : ` |`;
    }
    md += row + `\n`;
  }

  return md;
}

function generatePromptsTable() {
  let md = `# Matriz Extendida de Prompts y Campos (Field Guides)\n\n`;
  md += `Esta tabla contiene TODOS los campos del sistema, cruzados con la Instrucción base y el Prompt/Ejemplo exacto que la Inteligencia Artificial utiliza para guiarse y redactar su contenido, limitando la paja e imitando estándares corporativos globales.\n\n`;
  md += `| Módulo/Campo | Descripción (Instrucción Interna) | Prompt o Ejemplo Corporativo |\n`;
  md += `| :--- | :--- | :--- |\n`;

  for (const [key, val] of Object.entries(allGuides)) {
    const desc = val.desc ? val.desc.replace(/\n/g, ' ') : '';
    const ej = val.ejemplo ? val.ejemplo.replace(/\n/g, ' ') : (val.placeholder ? val.placeholder.replace(/\n/g, ' ') : '');
    md += `| \`${key}\` | ${desc} | *${ej}* |\n`;
  }

  return md;
}

fs.writeFileSync('output_matriz.md', generateMatrizModulos());
fs.writeFileSync('output_prompts.md', generatePromptsTable());
console.log('Done!');
