import mammoth from 'mammoth';
import TurndownService from 'turndown';

// Inicializar servicio Turndown para convertir HTML a Markdown limpio
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

/**
 * Limpia y normaliza texto eliminando saltos de línea excesivos y espacios redundantes.
 * @param {string} text 
 * @returns {string}
 */
export function cleanExtractedText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Lee un archivo tipo Blob/File como ArrayBuffer en el navegador
 * @param {File|Blob} file 
 * @returns {Promise<ArrayBuffer>}
 */
export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Lee un archivo tipo Blob/File como texto
 * @param {File|Blob} file 
 * @returns {Promise<string>}
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Extrae texto y lo formatea como Markdown desde un archivo DOCX.
 * @param {File|Blob|ArrayBuffer} fileOrBuffer 
 * @param {Function} [customExtractor]
 * @returns {Promise<string>}
 */
export async function parseDocxToMarkdown(fileOrBuffer, customExtractor) {
  let arrayBuffer;
  if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else if (fileOrBuffer && typeof fileOrBuffer.arrayBuffer === 'function') {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else if (fileOrBuffer && typeof readFileAsArrayBuffer === 'function') {
    arrayBuffer = await readFileAsArrayBuffer(fileOrBuffer);
  }

  let htmlResult = '';
  if (customExtractor) {
    const res = await customExtractor(arrayBuffer);
    htmlResult = res.value || '';
  } else {
    const res = await mammoth.convertToHtml({ arrayBuffer });
    htmlResult = res.value || '';
  }

  const markdown = turndownService.turndown(htmlResult);
  return cleanExtractedText(markdown);
}

/**
 * Extrae texto plano de un archivo PDF usando pdfjs-dist si está disponible.
 * @param {File|Blob|ArrayBuffer} fileOrBuffer 
 * @returns {Promise<string>}
 */
export async function parsePdfToText(fileOrBuffer) {
  let arrayBuffer;
  if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else if (fileOrBuffer && typeof fileOrBuffer.arrayBuffer === 'function') {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    arrayBuffer = await readFileAsArrayBuffer(fileOrBuffer);
  }

  const pdfjsLib = await import('pdfjs-dist');
  // Configurar worker si estamos en navegador
  if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '5.7.284'}/pdf.worker.min.mjs`;
  }

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    fullText += `\n\n### Página ${pageNum}\n` + strings.join(' ');
  }

  return cleanExtractedText(fullText);
}

/**
 * Parsea y convierte cualquier archivo compatible a Markdown / Texto para RAG.
 * Soporta: .docx, .doc, .pdf, .md, .txt, .csv, .json
 * @param {File} file 
 * @param {Object} [options] Inyección de dependencias para testing
 * @returns {Promise<{ id: string|number, name: string, size: number, format: string, text: string, addedAt: string }>}
 */
export async function parseDocumentFile(file, options = {}) {
  const fileName = file.name || 'documento';
  const ext = fileName.split('.').pop().toLowerCase();
  let text = '';
  let format = 'text';

  if (ext === 'docx' || ext === 'doc') {
    format = 'docx';
    if (options.mammothExtractor) {
      const buffer = options.readAsArrayBuffer ? await options.readAsArrayBuffer(file) : await file.arrayBuffer();
      const res = await options.mammothExtractor(buffer);
      text = turndownService.turndown(res.value || '');
    } else {
      text = await parseDocxToMarkdown(file);
    }
  } else if (ext === 'pdf') {
    format = 'pdf';
    text = await parsePdfToText(file);
  } else {
    // Archivos de texto plano (.md, .txt, .csv, .json)
    format = ext === 'md' ? 'markdown' : (ext === 'csv' ? 'csv' : 'text');
    if (options.readAsText) {
      text = await options.readAsText(file);
    } else {
      text = await readFileAsText(file);
    }
  }

  const cleaned = cleanExtractedText(text);

  return {
    id: Date.now() + Math.random(),
    name: fileName,
    size: file.size || cleaned.length,
    format,
    text: cleaned.substring(0, 50000), // Ampliado a 50K caracteres para documentos completos
    addedAt: new Date().toISOString()
  };
}
