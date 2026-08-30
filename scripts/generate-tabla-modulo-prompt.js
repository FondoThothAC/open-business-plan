#!/usr/bin/env node
/**
 * generate-tabla-modulo-prompt.js — Genera docs/tabla_modulo_prompt.md
 * Mapea FRAMEWORKS (12 tipos) × field_guides → tabla Módulo | Textbox | Prompt
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const fwPath = path.join(ROOT, 'src/config/frameworks.js');
const fgPath = path.join(ROOT, 'src/lib/field_guides.js');
const boxPath = path.join(ROOT, 'src/config/moduleBoxMap.js');

// dynamic import ESM
const { FRAMEWORKS } = await import(fwPath);
const { FIELD_GUIDES_MAP } = await import(fgPath);

let MODULE_BOX_MAP = {};
try {
  const m = await import(boxPath);
  MODULE_BOX_MAP = m.MODULE_BOX_MAP || {};
} catch {}

function esc(s) {
  if (!s) return '—';
  return String(s).replace(/\|/g, '\\|').replace(/\n/g, '<br>').replace(/\r/g, '').slice(0, 900);
}

function guideFor(projectType, fieldKey) {
  const map = FIELD_GUIDES_MAP[projectType] || FIELD_GUIDES_MAP.business || {};
  const g = map[fieldKey] || {};
  // Soporta tanto desc como instruccion
  return {
    instruccion: g.instruccion || g.desc || 'Describir detalladamente.',
    ejemplo: g.ejemplo || g.example || '',
    benchmark: g.benchmark || '',
    cita: g.cita || (g.source ? `${g.source.book || ''} ${g.source.page || ''}`.trim() : ''),
    placeholder: g.placeholder || '',
  };
}

let totalFields = 0;
let md = `# Tabla Módulo → Textbox → Prompt — 12 Modelos

> **Generado:** ${new Date().toISOString()} — **Fuente:** \`src/config/frameworks.js\` + \`src/lib/field_guides.js\` + \`src/config/moduleBoxMap.js\`
> **Textboxes totales:** se calculan abajo · Cada campo ya está **dividido en 5 textboxes** en \`PromptEditor.jsx\` (Instrucción / Ejemplo / Benchmark / Cita / Placeholder) — no es un solo textbox.

`;

md += `
## Resumen por modelo

| # | Modelo (\`projectType\`) | Nombre | Pilares | Módulos | Textboxes |\n|---|-------------------------|--------|---------|---------|------------|\n`;

Object.entries(FRAMEWORKS).forEach(([type, fw], idx) => {
  const pillars = fw.pillars.length;
  const mods = fw.pillars.reduce((a,p)=>a+p.modules.length,0);
  const fields = fw.pillars.reduce((a,p)=>a+p.modules.reduce((aa,m)=>aa+(m.fields?.length||0),0),0);
  totalFields += fields;
  md += `| ${idx+1} | \`${type}\` | ${fw.name} | ${pillars} | ${mods} | ${fields} |\n`;
});
md += `\n**TOTAL TEXTBOXES:** **${totalFields}**\n`;

md += `\n---\n\n## Leyenda\n\n- **Textbox** = \`field key\` (un \`<textarea>\` o editor). En \`PromptEditor.jsx:91\` se abre como Drawer con 5 pestañas.\n- **Prompt** = \`instruccion\` (antes \`desc\`) de \`field_guides.js\`. Cita/benchmark vienen de los 13 libros (ver \`libros/INDICE_PROMPTS_BOXES.md\`).\n- **Box** = herramienta metodológica (\`boxRegistry\`/\`moduleBoxMap\`) que aparece **dentro** del módulo, no como módulo. Filtrado por \`getBoxIdsForModule(moduleKey, projectType)\`.\n\n`;

for (const [type, fw] of Object.entries(FRAMEWORKS)) {
  md += `\n---\n\n## ${fw.name} — \`${type}\`\n\n`;
  for (const pillar of fw.pillars) {
    md += `### Pilar: ${pillar.title} — \`${pillar.key}\`\n\n`;
    for (const mod of pillar.modules) {
      const boxes = MODULE_BOX_MAP[`${type}:${mod.key}`] || MODULE_BOX_MAP[mod.key] || [];
      const boxStr = boxes.length ? boxes.map(b=>`\`${b}\``).join(', ') : '—';
      md += `#### Módulo: ${mod.title} — \`${mod.key}\` · _${esc(mod.description)}_\n\n`;
      md += `**Boxes asociados:** ${boxStr}\n\n`;
      md += `| Textbox (\`field key\`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |\n`;
      md += `|---|---|---|---|\n`;
      for (const fieldKey of (mod.fields || [])) {
        const g = guideFor(type, fieldKey);
        // Heurística tipo box por campo
        const t = fieldKey.includes('visual') || fieldKey === 'diagrama' ? 'mermaid' : 
                  fieldKey.includes('heatmap') ? 'heatmap' : 'texto';
        md += `| \`${fieldKey}\` | ${t} | ${esc(g.instruccion)} | ${esc(g.ejemplo || g.placeholder)} |\n`;
      }
      md += `\n`;
      if ((mod.fields || []).length === 0) {
        md += `| *(sin campos — solo visual/box)* | — | — | — |\n\n`;
      }
    }
  }
}

md += `\n---\n\n## Anexo — Diccionario de field_guides por tipo\n\nCada tipo usa su guía: \`FIELD_GUIDES_MAP[projectType]\`. Si un campo no tiene guía propia, cae a \`BUSINESS_GUIDES\` (fallback en \`src/lib/ai.js:431\`).\n\n`;

for (const [type, guides] of Object.entries(FIELD_GUIDES_MAP)) {
  const keys = Object.keys(guides);
  md += `- \`${type}\`: **${keys.length}** campos con guía (\` ${keys.slice(0, 8).join(', ')}${keys.length>8 ? ', …' : ''}\`)\n`;
}

md += `\n---\n\n*Generado por \`scripts/generate-tabla-modulo-prompt.js\`. Para regenerar: \`node scripts/generate-tabla-modulo-prompt.js\`*\n`;

const out = path.join(ROOT, 'docs/tabla_modulo_prompt.md');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, md, 'utf8');
console.log(`✅ ${out} — ${totalFields} textboxes en ${Object.keys(FRAMEWORKS).length} modelos`);
console.log(`   ${md.length} chars, ${md.split('\n').length} líneas`);
