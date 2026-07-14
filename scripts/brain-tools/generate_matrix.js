import fs from 'fs';
import path from 'path';

import { FRAMEWORKS } from '/Users/robertoeduardocelisrobles/Documents/FT Apps/open-business-plan-v2.5.12.3/src/config/frameworks.js';
import * as GUIDES from '/Users/robertoeduardocelisrobles/Documents/FT Apps/open-business-plan-v2.5.12.3/src/lib/field_guides.js';

const allGuidesMap = GUIDES.FIELD_GUIDES_MAP;

// We want a list of all unique fields.
// For each unique field, we want to know:
// 1. Its key
// 2. Its description and example (from the guide dictionaries)
// 3. Which module it belongs to (optional, or we can just list the field)
// 4. Which frameworks use it (out of the 12 frameworks)

const fwKeys = Object.keys(FRAMEWORKS);
const fwNamesShort = {
  business: 'BUS',
  social_bid: 'SOC',
  agile_startup: 'AGI',
  technology_id: 'TEC',
  micro_business: 'MIC',
  investment_project: 'INV',
  zopp: 'ZOP',
  horizon_europe: 'HOR',
  hoshin_kanri: 'HOS',
  amoeba_management: 'AMO',
  guanxi_plan: 'GUA',
  onudi_project: 'ONU'
};

// Map to track all fields: fieldKey -> { desc, ejemplo, fws: Set, modules: Set }
const fieldsData = new Map();

for (const fwId of fwKeys) {
  const fw = FRAMEWORKS[fwId];
  const guideDict = allGuidesMap[fwId] || {};
  
  for (const pillar of fw.pillars) {
    for (const mod of pillar.modules) {
      for (const fieldKey of mod.fields) {
        if (!fieldsData.has(fieldKey)) {
          // Find description and example
          let desc = '';
          let ejemplo = '';
          
          // Try to look it up in this framework's guide
          if (guideDict[fieldKey]) {
            desc = guideDict[fieldKey].desc || '';
            ejemplo = guideDict[fieldKey].ejemplo || guideDict[fieldKey].placeholder || '';
          }
          
          // Fallback to searching other guides if not found
          if (!desc) {
            for (const otherFwId of fwKeys) {
              const otherGuideDict = allGuidesMap[otherFwId] || {};
              if (otherGuideDict[fieldKey]) {
                desc = otherGuideDict[fieldKey].desc || '';
                ejemplo = otherGuideDict[fieldKey].ejemplo || otherGuideDict[fieldKey].placeholder || '';
                if (desc) break;
              }
            }
          }
          
          fieldsData.set(fieldKey, {
            desc,
            ejemplo,
            fws: new Set(),
            modules: new Set()
          });
        }
        
        const data = fieldsData.get(fieldKey);
        data.fws.add(fwId);
        data.modules.add(mod.title);
      }
    }
  }
}

// Now build the markdown table
let md = `# Matriz de Campos, Prompts y Frameworks (Completa)\n\n`;
md += `Esta matriz cruzada muestra los **${fieldsData.size} campos únicos** del sistema, su instrucción interna, su ejemplo corporativo y en qué metodologías de las 12 se utiliza cada uno.\n\n`;

// Headers
md += `| Campo / ID | Descripción (Instrucción) | Prompt / Ejemplo | ` + fwKeys.map(k => fwNamesShort[k] || k).join(' | ') + ` |\n`;
md += `| :--- | :--- | :--- | ` + fwKeys.map(() => `:---:`).join(' | ') + ` |\n`;

for (const [fieldKey, data] of fieldsData.entries()) {
  const desc = data.desc.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const ejemplo = data.ejemplo.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  
  let row = `| \`${fieldKey}\` | ${desc} | *${ejemplo}* |`;
  for (const fwId of fwKeys) {
    row += data.fws.has(fwId) ? ` ✓ |` : ` |`;
  }
  md += row + `\n`;
}

fs.writeFileSync('/Users/robertoeduardocelisrobles/.gemini/antigravity-ide/brain/ff826763-aada-4db4-9b15-69c269d162a1/matriz_prompts_extendida.md', md);
console.log(`Successfully generated matrix for ${fieldsData.size} fields!`);
