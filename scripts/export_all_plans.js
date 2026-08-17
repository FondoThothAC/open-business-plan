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
    aliases: ['veterinaria_comunitaria.pdf', 'veterinaria_patitas.pdf'],
    name: 'Veterinaria Comunitaria "Patitas de Amor"'
  },
  {
    id: 'abarrotes_colonia',
    aliases: ['abarrotes_colonia.pdf', 'abarrotes_esquinita.pdf'],
    name: 'Abarrotes "La Esquinita"'
  },
  {
    id: 'prestador_servicios',
    aliases: ['prestador_servicios.pdf', 'mantenpro_servicios.pdf'],
    name: 'MantenPro Servicios de Mantenimiento'
  }
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

async function exportSingleProject(proj) {
  console.log(`\n======================================================================`);
  console.log(`▶ Procesando Plan: ${proj.name} [${proj.id}]`);
  console.log(`======================================================================`);

  const jsonPath = path.join(ROOT, 'proyectos', 'negocios', proj.id, `${proj.id}.json`);
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`JSON no encontrado en: ${jsonPath}`);
  }

  const projectData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. Inicializar sesión y setear localStorage
    console.log('1. Inicializando entorno de VistaPrevia...');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.evaluate((d, id) => {
      localStorage.clear();
      localStorage.setItem('openplan_setup', 'true');
      localStorage.setItem('openplan_active_project_id', id);
      localStorage.setItem('openplan_active_project_type', 'negocios');
      localStorage.setItem('openplan_v2_data', JSON.stringify(d));
      localStorage.removeItem('openplan_new_project_flag');
    }, projectData, proj.id);

    // 2. Navegar a /vista-previa
    console.log('2. Renderizando componentes ejecutivos...');
    await page.goto('http://localhost:5173/vista-previa', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.preview-document', { timeout: 15000 });

    // 3. Estabilizar layout
    console.log('3. Estabilizando fuentes, BrandKit, matrices FODA/PESTEL y corridas NIF...');
    await new Promise(r => setTimeout(r, 3500));

    // 4. Medir páginas en DOM
    const printPagesCount = await page.evaluate(() => {
      return document.querySelectorAll('.print-page').length;
    });
    console.log(`4. Páginas detectadas en el DOM: ${printPagesCount}`);

    // 5. Imprimir PDF oficial
    const targetFile = path.join(PDF_DIR, proj.aliases[0]);
    console.log(`5. Generando PDF oficial: ${targetFile}...`);
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
    const totalPages = getPdfPagesCount(targetFile);
    console.log(`6. ✅ PDF completado en ${elapsed}s: ${sizeKB} KB (${totalPages} págs)`);

    // 6. Sincronizar copias a los aliases correspondientes
    for (let i = 1; i < proj.aliases.length; i++) {
      const aliasPath = path.join(PDF_DIR, proj.aliases[i]);
      fs.copyFileSync(targetFile, aliasPath);
      console.log(`   ↳ Alias sincronizado: ${aliasPath}`);
    }

    return { id: proj.id, name: proj.name, pages: totalPages, sizeKB };
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🚀 EXPORTADOR OFICIAL DE PDFs (Open Business Plan v2.6)');
  const results = [];

  for (const proj of PROJECTS) {
    try {
      const res = await exportSingleProject(proj);
      results.push(res);
    } catch (err) {
      console.error(`❌ Error exportando ${proj.id}:`, err);
    }
  }

  console.log('\n======================================================================');
  console.log('🎉 RESUMEN FINAL DE EXPORTACIÓN EJECUTIVA:');
  console.log('======================================================================');
  results.forEach(r => {
    console.log(`• ${r.name.padEnd(45)} | ${r.pages} págs | ${r.sizeKB} KB`);
  });
  console.log('======================================================================\n');
}

main().catch(console.error);
