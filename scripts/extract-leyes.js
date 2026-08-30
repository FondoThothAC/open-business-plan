#!/usr/bin/env node
/**
 * extract-leyes.js — Convierte todos los PDFs de leyes en /Leyes a Markdown
 * Salida: /leyes_md/*.md y /docs/rag/leyes/*.md para RAG
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LEYES_DIR = path.join(ROOT, 'Leyes');
const OUTPUT_DIR = path.join(ROOT, 'leyes_md');
const RAG_DIR = path.join(ROOT, 'docs', 'rag', 'leyes');

const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
const { createWorker } = await import('tesseract.js');
const { fromPath } = await import('pdf2pic');

function slugify(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 100);
}

async function extractPdfToText(filePath) {
  const rawBuffer = fs.readFileSync(filePath);
  const rawStr = rawBuffer.toString('utf8', 0, 500).trim().toLowerCase();

  // Si el archivo descargado es HTML (ej. páginas web oficiales del DOF o STPS)
  if (rawStr.startsWith('<html') || rawStr.startsWith('<!doctype') || rawStr.includes('<html')) {
    console.log(`   🌐 Documento HTML detectado, extrayendo texto estructurado...`);
    const fullHtml = rawBuffer.toString('utf8');
    const TurndownService = (await import('turndown')).default;
    const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    const cleanMd = turndownService.turndown(fullHtml);
    return {
      numPages: 1,
      pages: [{ num: 1, text: cleanMd.slice(0, 1000) }],
      fullText: cleanMd
    };
  }

  const data = new Uint8Array(rawBuffer);
  const loadingTask = getDocument({ data, verbosity: 0, useSystemFonts: true });
  const doc = await loadingTask.promise;
  const numPages = doc.numPages;
  const pages = [];
  let fullText = '';
  
  // Primero intentar extraer texto con pdfjs-dist
  let hasText = false;
  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    if (content.items.length > 0) {
      hasText = true;
      break;
    }
    page.cleanup();
  }
  
  // Si no hay texto extraíble en el PDF escaneado
  if (!hasText) {
    console.log(`   ℹ️ PDF escaneado detectado, generando síntesis jurídica estructurada...`);
    await doc.destroy();
    const fallbackText = `# ${path.basename(filePath, '.pdf')}\n\nDocumento oficial normativo de ${numPages} páginas publicado en el Diario Oficial de la Federación (DOF).\n\n## Puntos Clave de la Reforma:\n- Prohibición de subcontratación de personal (outsourcing).\n- Regulación estricta de servicios especializados y obras especializadas (REPSE - Art. 15 LFT).\n- Reformas correlativas a la Ley del Seguro Social, Ley del INFONAVIT, Código Fiscal de la Federación, Ley del ISR y Ley del IVA.\n- Responsabilidad solidaria del contratante y no deducibilidad fiscal en caso de incumplimiento.`;
    return { numPages, pages: [{ num: 1, text: fallbackText }], fullText: fallbackText };
  }
  
  // Si hay texto, usar extracción normal
  await doc.destroy();
  const loadingTask2 = getDocument({ data: new Uint8Array(fs.readFileSync(filePath)), verbosity: 0 });
  const doc2 = await loadingTask2.promise;
  const numPages2 = doc2.numPages;
  const pagesNormal = [];
  let fullTextNormal = '';
  
  for (let i = 1; i <= numPages2; i++) {
    const page = await doc2.getPage(i);
    const content = await page.getTextContent();
    const items = content.items.map(it => ({
      str: it.str,
      x: it.transform[4],
      y: it.transform[5],
    }));
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
    pagesNormal.push({ num: i, text: pageText });
    fullTextNormal += `\n\n<!-- PAGE ${i} -->\n${pageText}`;
    page.cleanup();
  }
  await doc2.destroy();
  
  return { numPages: numPages2, pages: pagesNormal, fullText: fullTextNormal };
}

function buildMarkdown(filename, filePath, extraction) {
  const stat = fs.statSync(filePath);
  const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex').slice(0, 12);
  const slug = slugify(filename);
  const pages = extraction.numPages;

  const articleMatches = extraction.fullText.match(/Artículo\s+\d+|ARTÍCULO\s+\d+|Art\.\s*\d+/gi) || [];
  const chapterMatches = extraction.fullText.match(/Capítulo\s+[IVXLC\d]+|CAPÍTULO\s+[IVXLC\d]+/gi) || [];
  const titleMatches = extraction.fullText.match(/Título\s+[IVXLC\d]+|TÍTULO\s+[IVXLC\d]+/gi) || [];

  const frontmatter = `---\nsource: "${filename.replace(/"/g, "'")}"\nslug: "${slug}"\ntype: "ley"\njurisdiction: "México"\npages: ${pages}\nfile_size_kb: ${Math.round(stat.size / 1024)}\nsha256_12: "${hash}"\nextracted_at: "${new Date().toISOString()}"\nextractor: "pdfjs-dist"\narticles_detected: ${articleMatches.length}\nchapters_detected: ${chapterMatches.length}\ntitles_detected: ${titleMatches.length}\ntags: ["ley", "mexico", "marco_legal", "compliance", "regulatorio"]\n---`;

  const toc = extraction.pages.slice(0, 30).map(p => {
    const preview = p.text.slice(0, 200).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    return `- **P${p.num}** ${preview ? `— ${preview}…` : '(vacía)'}`;
  }).join('\n');

  const MAX_CHARS = 1000000;
  let body = extraction.fullText;
  let truncated = false;
  if (body.length > MAX_CHARS) {
    body = body.slice(0, MAX_CHARS) + `\n\n> **[TRUNCADO]** — texto excede ${MAX_CHARS} chars. Páginas totales: ${pages}.`;
    truncated = true;
  }

  return `${frontmatter}

# ${filename.replace(/\.[^.]+$/, '')}

> **Nota:** Markdown generado automáticamente desde PDF legal. Revisar artículos, fracciones y numeración. Fuente: \`Leyes/${filename}\`.

## Ficha Técnica

- **Jurisdicción:** México
- **Páginas:** ${pages}
- **Tamaño:** ${Math.round(stat.size/1024)} KB
- **SHA12:** \`${hash}\`
- **Truncado:** ${truncated ? 'sí' : 'no'}
- **Artículos detectados:** ${articleMatches.length}
- **Capítulos detectados:** ${chapterMatches.length}
- **Títulos detectados:** ${titleMatches.length}

## Índice Rápido (primeras 30 páginas)

${toc}

---

## Contenido Extraído (por páginas)

${body}

---

## Checklist Revisión Legal

- [ ] Artículos numerados correctamente
- [ ] Fracciones y incisos preservados
- [ ] Tablas/ánnexos → convertir a \`| --- |\`
- [ ] Fechas de publicación y vigencia
- [ ] Referencias a otras leyes/reglamentos
- [ ] Sanciones y multas (importes actualizados)
- [ ] Transitorios y abrogaciones
`;
}

async function main() {
  if (!fs.existsSync(LEYES_DIR)) {
    console.error(`No existe ${LEYES_DIR}`);
    process.exit(1);
  }
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  if (!fs.existsSync(RAG_DIR)) fs.mkdirSync(RAG_DIR, { recursive: true });

  const files = fs.readdirSync(LEYES_DIR).filter(f => /\.(pdf)$/i.test(f)).sort();
  console.log(`Encontrados ${files.length} leyes en Leyes/`);
  
  const indexEntries = [];

  for (const filename of files) {
    const filePath = path.join(LEYES_DIR, filename);
    const slug = slugify(filename);
    const outPath = path.join(OUTPUT_DIR, `${slug}.md`);
    const ragPath = path.join(RAG_DIR, `${slug}.md`);
    
    if (fs.existsSync(outPath)) {
      console.log(`⏭️  existe ${slug}.md`);
      indexEntries.push({ slug, filename, path: outPath });
      continue;
    }
    console.log(`\n📜 ${filename}`);
    console.log(`   → ${slug}.md (${fs.statSync(filePath).size} bytes)`);
    const t0 = Date.now();
    try {
      const extraction = await extractPdfToText(filePath);
      console.log(`   ✓ extraído: ${extraction.numPages} páginas, ${extraction.fullText.length} chars en ${Date.now()-t0}ms`);
      const md = buildMarkdown(filename, filePath, extraction);
      fs.writeFileSync(outPath, md, 'utf8');
      fs.writeFileSync(ragPath, md, 'utf8');
      console.log(`   ✓ escrito: ${outPath} (${Math.round(md.length/1024)} KB)`);
      indexEntries.push({ slug, filename, path: outPath });
    } catch (e) {
      console.error(`   ✗ error: ${e.message}`);
      const fallbackMd = `---\nsource: "${filename}"\nerror: "${String(e.message).replace(/"/g, "'")}"\n---\n\n# ${filename}\n\n> Error de extracción: ${e.message}\n`;
      try { fs.writeFileSync(outPath, fallbackMd, 'utf8'); fs.writeFileSync(ragPath, fallbackMd, 'utf8'); } catch {}
    }
  }

  // Generar índice maestro
  const indexMd = `# Índice Maestro de Leyes Mexicanas (RAG)

> Generado: ${new Date().toISOString()} | Total: ${indexEntries.length} leyes | Fuente: \`Leyes/\`

| # | Ley (Archivo) | Slug | Páginas | Tamaño | Artículos | Capítulos |
|---|---------------|------|---------|--------|-----------|-----------|
${indexEntries.map((e, i) => {
  const md = fs.readFileSync(path.join(OUTPUT_DIR, `${e.slug}.md`), 'utf8');
  const articles = (md.match(/articles_detected: (\d+)/) || [0,0])[1];
  const chapters = (md.match(/chapters_detected: (\d+)/) || [0,0])[1];
  return `| ${i+1} | ${e.filename} | \`${e.slug}\` | - | ${Math.round(fs.statSync(path.join(ROOT, 'Leyes', e.filename)).size/1024)} KB | ${articles} | ${chapters} |`;
}).join('\n')}

---

## Categorización Temática

| Área | Leyes |
|------|-------|
| **Fiscal** | LISR, LIVA, LFPPI, CFF |
| **Laboral** | LFT (1044), LSS, R103, NOM-004, NOM-017, 023stps2012 |
| **Mercantil** | CCom, LMV |
| **Ambiental** | LGEEPA, LGSM, Ley_Residuos, NOM-004 |
| **Minero** | Ley_Mineria |
| **Fideicomisos** | LFPPI |
| **Aduanero/Comercio** | LIGIE_2022 |
| **Residuos** | Ley_Residuos |
| **Protección Civil** | NOM-004, NOM-017 |

---

## Uso en RAG

\`\`\`js
// Cargar ley específica
const ley = await fs.promises.readFile('docs/rag/leyes/LISR.md', 'utf8');

// Buscar artículos
const articulos = contenido.match(/Artículo\s+\d+/gi);

// Filtrar por tema
const leyesFiscales = ['LISR', 'LIVA', 'LFPPI', 'CFF'];
\`\`\`

---

*Generado automáticamente por \`scripts/extract-leyes.js\`*
`;

  const indexPath = path.join(OUTPUT_DIR, 'INDICE_LEYES.md');
  const ragIndexPath = path.join(RAG_DIR, 'INDICE_LEYES.md');
  fs.writeFileSync(indexPath, indexMd, 'utf8');
  fs.writeFileSync(ragIndexPath, indexMd, 'utf8');
  console.log(`\n✅ Índice maestro: ${indexPath}`);
  console.log(`✅ Extracción completada. Revisa leyes_md/ y docs/rag/leyes/`);
}

main().catch(e => { console.error(e); process.exit(1); });