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
  { id: 'veterinaria_comunitaria', name: 'Veterinaria Comunitaria "Patitas de Amor"' },
  { id: 'abarrotes_colonia', name: 'Abarrotes "La Esquinita"' },
  { id: 'prestador_servicios', name: 'MantenPro Servicios de Mantenimiento' }
];

function getPdfPagesCount(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'binary');
    const matches = data.match(/\/Type\s*\/Page[^s]/g);
    return matches ? matches.length : 1;
  } catch {
    return 1;
  }
}

async function exportAll() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('  GENERADOR OFICIAL DE PDFs DE ALTA FIDELIDAD (VistaPrevia.jsx)           ');
  console.log('  Open Business Plan v2.6 — Fondo Thoth AC                                ');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--font-render-hinting=none'
    ]
  });

  const summary = [];

  for (const proj of PROJECTS) {
    const jsonPath = path.join(ROOT, 'proyectos', 'negocios', proj.id, `${proj.id}.json`);
    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ Archivo JSON no encontrado: ${jsonPath}`);
      continue;
    }

    const projectData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`▶ Procesando Proyecto: ${proj.name} [${proj.id}]`);

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    // 1. Inicializar sesión y setear datos en localStorage
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.evaluate((d, id) => {
      localStorage.clear();
      localStorage.setItem('openplan_setup', 'true');
      localStorage.setItem('openplan_active_project_id', id);
      localStorage.setItem('openplan_active_project_type', 'negocios');
      localStorage.setItem('openplan_v2_data', JSON.stringify(d));
      localStorage.removeItem('openplan_new_project_flag');
    }, projectData, proj.id);

    // 2. Navegar a /vista-previa
    console.log('   🔗 Renderizando VistaPrevia en motor React...');
    await page.goto('http://localhost:5173/vista-previa', { waitUntil: 'domcontentloaded', timeout: 25000 });

    // 3. Esperar que el contenedor de Vista Previa monte completamente
    await page.waitForSelector('.preview-document', { timeout: 20000 });

    // 4. Estabilizar visualización de gráficos, tablas, SVGs y diagramas Mermaid
    console.log('   ⏳ Estabilizando componentes visuales, BrandKit y balances NIF...');
    await new Promise(resolve => setTimeout(resolve, 4000));

    // 5. Imprimir PDF con reglas oficiales @media print
    const pdfPath = path.join(PDF_DIR, `${proj.id}.pdf`);
    console.log('   🖨️ Generando PDF con renderizado de alta fidelidad...');
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.8cm',
        bottom: '0.8cm',
        left: '0.8cm',
        right: '0.8cm'
      }
    });

    const stats = fs.statSync(pdfPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    const pages = getPdfPagesCount(pdfPath);

    console.log(`   ✅ PDF generado exitosamente: ${pdfPath}`);
    console.log(`   📑 Páginas totales: ${pages}`);
    console.log(`   📊 Peso del archivo: ${sizeKB} KB\n`);

    summary.push({
      id: proj.id,
      name: proj.name,
      pages,
      sizeKB,
      path: pdfPath
    });

    await page.close();
  }

  await browser.close();

  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('  🎉 RESUMEN DE EXPORTACIÓN EJECUTIVA');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  summary.forEach(r => {
    console.log(`  • ${r.name.padEnd(45)} | ${r.pages} págs | ${r.sizeKB} KB`);
  });
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
}

exportAll().catch(err => {
  console.error('Error fatal en exportador de PDFs:', err);
  process.exit(1);
});
