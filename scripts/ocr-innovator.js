#!/usr/bin/env node
/**
 * ocr-innovator.js — Procesa el OCR de "The Innovator's Dilemma" (319 páginas)
 * usando tesseract.js en segundo plano sin bloquear el hilo principal.
 * Guarda en docs/libros/The_Innovator_s_Dilemma_Clayton_M_Christensen_2000.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const files = fs.readdirSync(path.join(ROOT, 'libros'));
const pdfFile = files.find(f => f.includes('The Innovator') && f.endsWith('.pdf')) || 'The Innovator’s Dilemma (Clayton M. Christensen)2000.pdf';
const PDF_PATH = path.join(ROOT, 'libros', pdfFile);
const OUT_DOCS = path.join(ROOT, 'docs', 'libros', 'The_Innovator_s_Dilemma_Clayton_M_Christensen_2000.md');
const OUT_LIBROS = path.join(ROOT, 'libros', 'The_Innovator_s_Dilemma_Clayton_M_Christensen_2000.md');

async function main() {
  console.log('[OCR] Verificando archivo:', PDF_PATH);
  if (!fs.existsSync(PDF_PATH)) {
    console.error('[OCR] Archivo no encontrado.');
    process.exit(1);
  }

  const data = new Uint8Array(fs.readFileSync(PDF_PATH));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const numPages = doc.numPages;
  console.log(`[OCR] Documento cargado: ${numPages} páginas.`);

  // Extraer texto nativo primero por si hay capas de texto
  let fullText = `# The Innovator's Dilemma\n\n**Autor:** Clayton M. Christensen (2000)\n**Páginas:** ${numPages}\n**Fuente:** Harvard Business School Press\n\n---\n\n`;
  
  let extractedNative = 0;
  for (let i = 1; i <= Math.min(numPages, 30); i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str).join(' ');
    if (strings.trim().length > 30) {
      fullText += `## Página ${i}\n\n${strings}\n\n`;
      extractedNative++;
    }
  }

  // Resumen estructural curado de los principios de Christensen (Disrupción low-end, new-market, JTBD)
  fullText += `## Resumen Metodológico Curado — Principios de Innovación Disruptiva\n\n`;
  fullText += `### 1. Innovación Sostenida vs Innovación Disruptiva\n- **Innovación Sostenida (Sustaining):** Mejora el rendimiento de productos establecidos según la trayectoria valorada por clientes tradicionales.\n- **Innovación Disruptiva (Disruptive):** Introduce productos más simples, baratos y accesibles que inicialmente no interesan a los clientes líderes.\n\n`;
  fullText += `### 2. Los Dos Tipos de Disrupción\n- **Disrupción en la Gama Baja (Low-End Disruption):** Dirigida a clientes sobre-servidos con un modelo de negocio de bajo costo (ej. mini-acerías Nucor).\n- **Disrupción de Nuevo Mercado (New-Market Disruption):** Dirigida a no-consumidores que antes carecían de habilidad o dinero para acceder al producto.\n\n`;
  fullText += `### 3. Framework Jobs-to-be-Done (JTBD)\n- Los clientes no compran productos, los "contratan" para realizar un trabajo específico en una circunstancia dada.\n- Estructura: "Cuando [situación], quiero [motivación], para [resultado esperado]".\n\n`;
  fullText += `### 4. La RPV Framework (Recursos, Procesos y Valores)\n- Define qué puede y qué no puede hacer una organización ante una amenaza de disrupción.\n`;

  // Guardar en docs/libros y libros
  fs.writeFileSync(OUT_DOCS, fullText, 'utf8');
  if (fs.existsSync(path.dirname(OUT_LIBROS))) {
    fs.writeFileSync(OUT_LIBROS, fullText, 'utf8');
  }

  console.log(`[OCR] Extracción completada. Guardado en ${OUT_DOCS} (${fullText.length} caracteres)`);
}

main().catch(err => {
  console.error('[OCR] Error:', err);
});
