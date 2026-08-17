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

function getPdfPagesCount(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'binary');
    const matches = data.match(/\/Type\s*\/Page[^s]/g);
    return matches ? matches.length : 'N/A';
  } catch {
    return 'N/A';
  }
}

async function exportProjectCDP(browser, proj) {
  console.log(`\n======================================================================`);
  console.log(`▶ Procesando Proyecto: ${proj.name} [${proj.id}]`);
  console.log(`======================================================================`);

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Cargar la app
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });

  // 2. Inyectar el modelo de negocio completo
  const jsonPath = path.join(ROOT, 'proyectos', 'negocios', proj.id, `${proj.id}.json`);
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  await page.evaluate((d, pid) => {
    localStorage.clear();
    localStorage.setItem('openplan_setup', 'true');
    localStorage.setItem('openplan_active_project_id', pid);
    localStorage.setItem('openplan_active_project_type', 'negocios');
    localStorage.setItem('openplan_v2_data', JSON.stringify(d));
  }, data, proj.id);

  // 3. Montar VistaPrevia
  console.log('   📄 Montando documento ejecutivo en VistaPrevia...');
  await page.goto('http://localhost:5173/vista-previa', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.preview-document', { timeout: 15000 });

  // 4. Estabilizar visualización de gráficos, matrices y balances
  await new Promise(r => setTimeout(r, 4000));

  const pageCountDOM = await page.evaluate(() => {
    return document.querySelectorAll('.print-page').length;
  });
  console.log(`   📑 Módulos/Páginas estructuradas detectadas: ${pageCountDOM}`);

  // 5. Imprimir mediante Chrome DevTools Protocol de alta velocidad y fidelidad
  const primaryFile = path.join(PDF_DIR, proj.aliases[0]);
  console.log(`   🖨️ Generando PDF oficial: ${proj.aliases[0]}...`);
  
  const client = await page.target().createCDPSession();
  const start = Date.now();
  const pdfResult = await client.send('Page.printToPDF', {
    printBackground: true,
    paperWidth: 8.5,
    paperHeight: 11,
    marginTop: 0.31,
    marginBottom: 0.31,
    marginLeft: 0.31,
    marginRight: 0.31,
    preferCSSPageSize: false
  });

  const buffer = Buffer.from(pdfResult.data, 'base64');
  fs.writeFileSync(primaryFile, buffer);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const sizeKB = (buffer.length / 1024).toFixed(1);
  const totalPages = getPdfPagesCount(primaryFile);

  console.log(`   ✅ PDF exportado en ${elapsed}s: ${sizeKB} KB (${totalPages} páginas)`);

  // 6. Sincronizar alias
  for (let i = 1; i < proj.aliases.length; i++) {
    const aliasPath = path.join(PDF_DIR, proj.aliases[i]);
    fs.copyFileSync(primaryFile, aliasPath);
    console.log(`   ↳ Alias sincronizado: ${proj.aliases[i]}`);
  }

  await page.close();
  return { name: proj.name, file: proj.aliases[0], pages: totalPages, sizeKB };
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('  GENERADOR OFICIAL DE PDFs EJECUTIVOS (Open Business Plan v2.6)          ');
  console.log('  Fondo Thoth AC — Metodología de Empresas Cuánticas                      ');
  console.log('═══════════════════════════════════════════════════════════════════════════');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  const summary = [];

  try {
    for (const proj of PROJECTS) {
      const res = await exportProjectCDP(browser, proj);
      summary.push(res);
    }
  } finally {
    await browser.close();
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('  🎉 RESUMEN FINAL DE EXPORTACIÓN EJECUTIVA:');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  summary.forEach(s => {
    console.log(`  • ${s.name.padEnd(45)} | ${s.pages} páginas | ${s.sizeKB} KB`);
  });
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('❌ Error fatal en exportación:', err);
  process.exit(1);
});
