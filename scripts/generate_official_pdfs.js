import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const PDF_DIR = path.join(ROOT, 'proyectos', 'pdfs');
if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });

const PROJECTS = [
  {
    id: 'veterinaria_comunitaria',
    name: 'Veterinaria Comunitaria "Patitas de Amor"',
    aliases: ['veterinaria_comunitaria.pdf', 'veterinaria_patitas.pdf']
  },
  {
    id: 'abarrotes_colonia',
    name: 'Abarrotes "La Esquinita"',
    aliases: ['abarrotes_colonia.pdf', 'abarrotes_esquinita.pdf']
  },
  {
    id: 'prestador_servicios',
    name: 'MantenPro Servicios de Mantenimiento',
    aliases: ['prestador_servicios.pdf', 'mantenpro_servicios.pdf']
  }
];

async function exportProject(proj) {
  console.log(`\n======================================================================`);
  console.log(`▶ Procesando Proyecto: ${proj.name} [${proj.id}]`);
  console.log(`======================================================================`);

  const jsonPath = path.join(ROOT, 'proyectos', 'negocios', proj.id, `${proj.id}.json`);
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. Inicializar sesión y setear datos
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.evaluate((d, id) => {
      localStorage.clear();
      localStorage.setItem('openplan_setup', 'true');
      localStorage.setItem('openplan_active_project_id', id);
      localStorage.setItem('openplan_active_project_type', 'negocios');
      localStorage.setItem('openplan_v2_data', JSON.stringify(d));
    }, data, proj.id);

    // 2. Navegar a /vista-previa
    await page.goto('http://localhost:5173/vista-previa', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.preview-document', { timeout: 15000 });

    // 3. Estabilizar visualización
    await new Promise(r => setTimeout(r, 4000));

    // 4. Medir páginas detectadas
    const pageCount = await page.evaluate(() => {
      return document.querySelectorAll('.print-page').length;
    });

    console.log(`   📑 Páginas detectadas en el DOM: ${pageCount}`);

    // 5. Imprimir PDF
    const targetFile = path.join(PDF_DIR, proj.aliases[0]);
    const start = Date.now();
    await page.pdf({
      path: targetFile,
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.8cm',
        bottom: '0.8cm',
        left: '0.8cm',
        right: '0.8cm'
      }
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const stat = fs.statSync(targetFile);
    const sizeKB = (stat.size / 1024).toFixed(1);
    console.log(`   ✅ PDF exportado en ${elapsed}s: ${sizeKB} KB (${pageCount} págs) -> ${proj.aliases[0]}`);

    // 6. Copiar a aliases
    for (let i = 1; i < proj.aliases.length; i++) {
      const aliasPath = path.join(PDF_DIR, proj.aliases[i]);
      fs.copyFileSync(targetFile, aliasPath);
      console.log(`   ↳ Alias sincronizado: ${proj.aliases[i]}`);
    }

    return { name: proj.name, file: proj.aliases[0], pages: pageCount, sizeKB };
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🚀 GENERADOR OFICIAL DE PDFs (Open Business Plan v2.6)');
  const summary = [];

  for (const proj of PROJECTS) {
    const res = await exportProject(proj);
    summary.push(res);
  }

  console.log('\n======================================================================');
  console.log('🎉 RESUMEN FINAL DE EXPORTACIÓN EJECUTIVA:');
  console.log('======================================================================');
  summary.forEach(s => {
    console.log(`  • ${s.name.padEnd(45)} | ${s.pages} páginas | ${s.sizeKB} KB`);
  });
  console.log('======================================================================\n');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
