#!/usr/bin/env node
/**
 * extract-libros.js — Extrae los 13 libros (PDF/EPUB) de /libros a Markdown en /libros/*.md
 * Usa pdfjs-dist (ya en deps) y jszip/adm-zip para EPUB. No toca nada fuera de libros/.
 * Output por libro: libros/<slug>.md con frontmatter + cuerpo por páginas/capítulos
 * + INDICE crudo de prompts/boxes detectados.
 *
 * Ejecutar: node scripts/extract-libros.js [--force]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LIBROS_DIR = path.join(ROOT, 'libros');
const FORCE = process.argv.includes('--force');

// Mapa de metadatos curados (prioridad ALTA/MEDIA/BAJA)
const META = {
  "Anatomy of a Business Plan": { author: "Linda Pinson", edition: "7th ed.", year: "2008", publisher: "Out Of Your Mind", priority: "ALTA", type: "Guía paso a paso clásica", isbn: "9780944205358" },
  "Burn the Business Plan": { author: "Carl J. Schramm", year: "", priority: "ALTA", type: "Enfoque ágil/lean" },
  "Creating_a_Business_Plan_For_Dummies": { author: "Veechi Curtis / For Dummies", priority: "ALTA", type: "Estructura estándar Dummies" },
  "Emerging_from_an_Entrenched_Colonial_Economy": { author: "—", priority: "BAJA", type: "Historia económica NZ (contexto)" },
  "Negotiating_South-South_Regional_Trade_Agreements": { author: "—", priority: "BAJA", type: "Comercio regional Sur-Sur (África)" },
  "PS_ MANUAL_Panama": { author: "PS Panamá", priority: "BAJA", type: "Manual plan de negocios 25p" },
  "Plan de NegociosVF": { author: "— (VF)", priority: "ALTA", type: "Metodología hispanohablante" },
  "Starting a Business QuickStart Guide": { author: "Ken Colwell PhD MBA", priority: "ALTA", type: "Guía práctica quickstart", isbn: "Anna's Archive" },
  "The Innovator": { author: "Clayton M. Christensen (2000)", priority: "ALTA", type: "Innovación disruptiva" },
  "The_Nature_of_Value": { author: "— (Adaptive Economy)", priority: "MEDIA", type: "Valor/inversión adaptativa" },
  "The_Role_of_Corporate_Sustainability": { author: "— (Asian Development)", priority: "MEDIA", type: "RSE auto/ICT casos" },
  "Diferenc": { author: "Marino et al.", priority: "MEDIA", type: "Paper plan de negocio vs MVP (18p, pt/es)" },
  "libros-461-el-metodo-lean-startup": { author: "Eric Ries (Lean Startup, ES)", priority: "ALTA", type: "Lean Canvas, MVP, pivot" },
};

function slugify(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9\u00C0-\u024F]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80);
}
function findMeta(filename) {
  for (const [k, v] of Object.entries(META)) {
    if (filename.includes(k.split('_')[0]) || filename.toLowerCase().includes(k.toLowerCase().slice(0, 12))) return v;
    if (filename.includes(k)) return v;
  }
  // fallback por coincidencia parcial
  if (filename.includes('Anatomy')) return META["Anatomy of a Business Plan"];
  if (filename.includes('Burn')) return META["Burn the Business Plan"];
  if (filename.includes('Dummies')) return META["Creating_a_Business_Plan_For_Dummies"];
  if (filename.includes('Innovator')) return META["The Innovator"];
  if (filename.includes('Nature_of_Value')) return META["The_Nature_of_Value"];
  if (filename.includes('Sustainability')) return META["The_Role_of_Corporate_Sustainability"];
  if (filename.includes('lean-startup') || filename.includes('metodo-lean')) return META["libros-461-el-metodo-lean-startup"];
  if (filename.includes('QuickStart')) return META["Starting a Business QuickStart Guide"];
  if (filename.includes('Plan de NegociosVF')) return META["Plan de NegociosVF"];
  if (filename.includes('MANUAL_Panama')) return META["PS_ MANUAL_Panama"];
  if (filename.includes('Diferenc')) return META["Diferenc"];
  if (filename.includes('Emerging')) return META["Emerging_from_an_Entrenched_Colonial_Economy"];
  if (filename.includes('Negotiating') || filename.includes('South-South')) return META["Negotiating_South-South_Regional_Trade_Agreements"];
  return { priority: "MEDIA", type: "—" };
}

// ——— PDF extraction via pdfjs-dist ———
async function extractPdfToText(filePath) {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync(filePath));
  const loadingTask = getDocument({ data, verbosity: 0, useSystemFonts: true });
  const doc = await loadingTask.promise;
  const numPages = doc.numPages;
  const pages = [];
  let fullText = '';
  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // Reconstruir líneas por Y, luego ordenar por X
    const items = content.items.map(it => ({
      str: it.str,
      x: it.transform[4],
      y: it.transform[5],
      width: it.width,
      height: it.height,
    }));
    // Agrupar por Y con tolerancia
    items.sort((a, b) => b.y - a.y || a.x - b.x);
    let pageText = '';
    let lastY = null;
    for (const it of items) {
      if (lastY !== null && Math.abs(it.y - lastY) > 3) pageText += '\n';
      else if (pageText && !pageText.endsWith('\n') && !pageText.endsWith(' ')) pageText += ' ';
      pageText += it.str;
      lastY = it.y;
    }
    pageText = pageText.replace(/\s+\n/g, '\n').replace(/[ \t]{2,}/g, ' ').trim();
    pages.push({ num: i, text: pageText });
    fullText += `\n\n<!-- PAGE ${i} -->\n${pageText}`;
    // cleanup
    page.cleanup();
  }
  await doc.destroy();
  return { numPages, pages, fullText };
}

// ——— EPUB extraction (EPUB = ZIP) ———
async function extractEpubToText(filePath) {
  // Intento con jszip si está, si no fallback a adm-zip / unzip via node:zlib manual
  let zipEntries = null;
  try {
    const { default: JSZip } = await import('jszip');
    const data = fs.readFileSync(filePath);
    const zip = await JSZip.loadAsync(data);
    zipEntries = zip;
    let fullText = '';
    const pages = [];
    // Ordenar: OEBPS/content.opf → manifest, luego html/xhtml
    const fileNames = Object.keys(zip.files).sort();
    const htmlFiles = fileNames.filter(n => n.endsWith('.html') || n.endsWith('.xhtml') || n.endsWith('.htm'));
    // Si no hay html, tomar todo
    const targets = htmlFiles.length ? htmlFiles : fileNames.filter(n => !n.endsWith('/') && !n.includes('META-INF'));
    let idx = 0;
    for (const name of targets) {
      const file = zip.file(name);
      if (!file) continue;
      const content = await file.async('string');
      // Strip HTML tags → texto
      const text = content
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
      if (text.length < 30) continue;
      idx++;
      pages.push({ num: idx, name, text });
      fullText += `\n\n<!-- EPUB:${name} -->\n${text}`;
    }
    return { numPages: pages.length, pages, fullText };
  } catch (e) {
    return { numPages: 0, pages: [], fullText: `<!-- EPUB extraction fallback failed: ${e.message} -->\n(Sin jszip, instala: npm i jszip)` };
  }
}

function detectBoxes(text) {
  const boxes = [];
  const add = (id, tipo, desc, pattern) => {
    const m = text.match(pattern);
    if (m) boxes.push({ id, tipo, desc, evidencia: m[0].slice(0, 180).replace(/\n/g, ' ') + '…' });
  };
  add('box_canvas_osterwalder', 'canvas', 'Business Model Canvas 9 bloques', /Business\s*Model\s*Canvas|Canvas\s*de\s*Modelo\s*de\s*Negocio/gi);
  add('box_lean_canvas', 'canvas', 'Lean Canvas Maurya', /Lean\s*Canvas/gi);
  add('box_pestel', 'checklist', 'PESTEL 6 factores', /PESTEL|PEST\s*analysis/gi);
  add('box_swot_foda', 'matrix', 'FODA/SWOT 4 cuadrantes', /SWOT|FODA/gi);
  add('box_porter_5f', 'matrix', '5 Fuerzas Porter', /Five\s*Forces|5\s*Fuerzas.*Porter/gi);
  add('box_tam_sam_som', 'formula', 'TAM/SAM/SOM', /TAM|SAM|SOM.*mercado/gi);
  add('box_unit_economics', 'formula', 'CAC/LTV/Margen/Payback', /CAC|LTV|Unit\s*Economics|Economía\s*Unitaria/gi);
  add('box_burn_runway', 'formula', 'Burn rate / Runway', /Burn\s*Rate|Runway/gi);
  add('box_mvp', 'checklist', 'MVP / Producto Mínimo Viable', /\bMVP\b|Producto\s*Mínimo\s*Viable/gi);
  add('box_pivot', 'checklist', 'Pivot / Perseverar', /\bPivot\b/gi);
  add('box_trl', 'checklist', 'TRL 1-9', /\bTRL\b|Technology\s*Readiness/gi);
  add('box_wacc_van_tir', 'formula', 'WACC/VAN/TIR/FCFF', /WACC|VAN|NPV|TIR|IRR|FCFF/gi);
  add('box_montecarlo', 'formula', 'Monte Carlo / Sensibilidad', /Monte\s*Carlo|Sensibilidad|Tornado/gi);
  add('box_okr_hoshin', 'matrix', 'OKR / Hoshin Kanri / Matriz X', /Hoshin|Matriz\s*X|X-Matrix|OKR/gi);
  add('box_amoeba', 'matrix', 'Amoeba Management', /Amoeba|Ameba/gi);
  add('box_dnsh', 'checklist', 'DNSH UE', /DNSH/gi);
  add('box_guanxi', 'checklist', 'Guanxi / Mapa relaciones', /Guanxi/gi);
  add('box_sostenibilidad', 'checklist', 'RSE / Economía circular / Ciclo de vida', /Sostenibilidad|ESG|Economía\s*Circular|Ciclo\s*de\s*Vida|Life\s*Cycle/gi);
  return boxes;
}

function buildMarkdown(filename, filePath, extraction) {
  const stat = fs.statSync(filePath);
  const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex').slice(0, 12);
  const meta = findMeta(filename);
  const slug = slugify(filename);
  const boxes = detectBoxes(extraction.fullText);
  const isEpub = filename.toLowerCase().endsWith('.epub');
  const pages = extraction.numPages;

  // Estimar prompts = secciones con headings y listas con ":" o "?"
  const headings = (extraction.fullText.match(/^#{1,6}\s+.+/gm) || []).length;
  const promptCandidates = (extraction.fullText.match(/\n[^\n]{10,120}\?\s*(\n|$)/g) || []).length;

  const frontmatter = `---
source: "${filename.replace(/"/g, "'")}"
slug: "${slug}"
author: "${meta.author || ''}"
publisher: "${meta.publisher || ''}"
edition: "${meta.edition || ''}"
year: "${meta.year || ''}"
isbn: "${meta.isbn || ''}"
priority: "${meta.priority}"
type: "${meta.type}"
pages: ${pages}
file_size_kb: ${Math.round(stat.size / 1024)}
sha256_12: "${hash}"
extracted_at: "${new Date().toISOString()}"
extractor: "pdfjs-dist/${isEpub ? 'epub-jszip' : 'pdfjs-legacy'}"
headings_detected: ${headings}
prompt_candidates: ${promptCandidates}
boxes_detected: ${boxes.length}
---`;

  // Construir índice de prompts/boxes detectados
  const boxesMd = boxes.length
    ? boxes.map(b => `- **${b.id}** (\`${b.tipo}\`) — ${b.desc}. Evidencia: \`${b.evidencia}\``).join('\n')
    : '- (no se detectaron boxes con heurística simple; revisar manual)';

  // TOC por páginas
  const toc = extraction.pages.slice(0, 60).map(p => {
    const preview = p.text.slice(0, 160).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    return `- **P${p.num}** ${preview ? `— ${preview}…` : '(vacía)'}`;
  }).join('\n');

  // Cuerpo: paginado, limitado a ~800k chars para no explotar repo
  const MAX_CHARS = 850_000;
  let body = extraction.fullText;
  let truncated = false;
  if (body.length > MAX_CHARS) {
    body = body.slice(0, MAX_CHARS) + `\n\n> **[TRUNCADO]** — texto excede ${MAX_CHARS} chars. Ver PDF original para resto. Páginas totales: ${pages}.`;
    truncated = true;
  }

  return `${frontmatter}

# ${filename.replace(/\.[^.]+$/, '')}

> **Nota:** Markdown generado automáticamente desde PDF/EPUB. Revisar manualmente tablas (\`| --- |\`), fórmulas (\`$...$\`), diagramas (\`[DIAGRAMA]\`) y OCR. Fuente: \`libros/${filename}\`.

## Ficha

- **Autor:** ${meta.author || '—'} — **Prioridad:** ${meta.priority} — **Tipo:** ${meta.type}
- **Páginas:** ${pages} — **Tamaño:** ${Math.round(stat.size/1024)} KB — **SHA12:** \`${hash}\` — **Truncado:** ${truncated ? 'sí' : 'no'}

## Boxes detectados (heurística)

${boxesMd}

## TOC rápido (primeras 60 páginas/bloques)

${toc}

---

## Contenido extraído (por páginas/bloques)

${body}

---

## Checklist revisión manual

- [ ] Tablas → convertir a \`| A | B |\` + \`|---|---|\`
- [ ] Fórmulas → \`$...$\` o \`$$...$$\`
- [ ] Diagramas/imágenes → \`[DIAGRAMA: descripción]\`
- [ ] OCR páginas escaneadas (tesseract.js si hace falta)
- [ ] Prompts/boxes completados en INDICE_PROMPTS_BOXES.md
`;
}

async function main() {
  if (!fs.existsSync(LIBROS_DIR)) {
    console.error(`No existe ${LIBROS_DIR}`);
    process.exit(1);
  }
  const files = fs.readdirSync(LIBROS_DIR).filter(f => /\.(pdf|epub)$/i.test(f)).sort();
  console.log(`Encontrados ${files.length} libros en libros/`);
  for (const filename of files) {
    const filePath = path.join(LIBROS_DIR, filename);
    const slug = slugify(filename);
    const outPath = path.join(LIBROS_DIR, `${slug}.md`);
    if (fs.existsSync(outPath) && !FORCE) {
      console.log(`⏭️  existe ${path.basename(outPath)} (usa --force para sobrescribir)`);
      continue;
    }
    console.log(`\n📖 ${filename}`);
    console.log(`   → ${path.basename(outPath)} (${fs.statSync(filePath).size} bytes, ${filename.toLowerCase().endsWith('.epub') ? 'EPUB' : 'PDF'})`);
    const t0 = Date.now();
    try {
      const extraction = filename.toLowerCase().endsWith('.pdf')
        ? await extractPdfToText(filePath)
        : await extractEpubToText(filePath);
      console.log(`   ✓ extraído: ${extraction.numPages} páginas/bloques, ${extraction.fullText.length} chars en ${Date.now()-t0}ms`);
      const md = buildMarkdown(filename, filePath, extraction);
      fs.writeFileSync(outPath, md, 'utf8');
      console.log(`   ✓ escrito: ${outPath} (${Math.round(md.length/1024)} KB)`);
    } catch (e) {
      console.error(`   ✗ error: ${e.message}`);
      console.error(e.stack?.slice(0, 1200));
      const fallbackMd = `---\nsource: "${filename}"\nerror: "${String(e.message).replace(/"/g, "'")}"\n---\n\n# ${filename}\n\n> Error de extracción: ${e.message}\n`;
      try { fs.writeFileSync(outPath, fallbackMd, 'utf8'); } catch {}
    }
  }
  console.log(`\n✅ Extracción completada. Revisa libros/*.md`);
}

main().catch(e => { console.error(e); process.exit(1); });
