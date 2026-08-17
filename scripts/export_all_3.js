import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const PROJECTS = [
  {
    id: 'veterinaria_comunitaria',
    name: 'Veterinaria Comunitaria "Patitas de Amor"',
    files: ['veterinaria_comunitaria.pdf', 'veterinaria_patitas.pdf']
  },
  {
    id: 'abarrotes_colonia',
    name: 'Abarrotes "La Esquinita"',
    files: ['abarrotes_colonia.pdf', 'abarrotes_esquinita.pdf']
  },
  {
    id: 'prestador_servicios',
    name: 'MantenPro Servicios de Mantenimiento',
    files: ['prestador_servicios.pdf', 'mantenpro_servicios.pdf']
  }
];

async function generateSingle(proj) {
  console.log(`\n======================================================`);
  console.log(`▶ Generando Plan: ${proj.name} [${proj.id}]`);
  console.log(`======================================================`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });

    const jsonPath = `proyectos/negocios/${proj.id}/${proj.id}.json`;
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    await page.evaluate((d, pid) => {
      localStorage.clear();
      localStorage.setItem('openplan_setup', 'true');
      localStorage.setItem('openplan_active_project_id', pid);
      localStorage.setItem('openplan_active_project_type', 'negocios');
      localStorage.setItem('openplan_v2_data', JSON.stringify(d));
    }, data, proj.id);

    await page.goto('http://localhost:5173/vista-previa', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.preview-document');
    await new Promise(r => setTimeout(r, 4500));

    const pageInfo = await page.evaluate(() => {
      const pages = document.querySelectorAll('.print-page');
      const titles = Array.from(document.querySelectorAll('h2, h3')).map(h => h.innerText.trim()).filter(Boolean);
      return {
        printPagesCount: pages.length,
        titlesCount: titles.length
      };
    });

    console.log(`DOM: ${pageInfo.printPagesCount} páginas | ${pageInfo.titlesCount} secciones`);

    const primaryOut = path.resolve(`proyectos/pdfs/${proj.files[0]}`);
    console.log(`Escribiendo PDF oficial en: ${primaryOut}...`);
    
    await page.pdf({
      path: primaryOut,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.8cm', bottom: '0.8cm', left: '0.8cm', right: '0.8cm' }
    });

    const stats = fs.statSync(primaryOut);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`✅ PDF generado: ${sizeKB} KB (${pageInfo.printPagesCount} páginas)`);

    for (let i = 1; i < proj.files.length; i++) {
      const aliasOut = path.resolve(`proyectos/pdfs/${proj.files[i]}`);
      fs.copyFileSync(primaryOut, aliasOut);
      console.log(`↳ Alias sincronizado: ${proj.files[i]}`);
    }

    return { name: proj.name, pages: pageInfo.printPagesCount, sizeKB };
  } finally {
    await browser.close();
  }
}

async function run() {
  console.log('🚀 INICIANDO GENERACIÓN DE PDFs OFICIALES (Open Business Plan v2.6)');
  const results = [];
  for (const p of PROJECTS) {
    const res = await generateSingle(p);
    results.push(res);
  }

  console.log('\n======================================================');
  console.log('🎉 TODOS LOS PDFs FUERON GENERADOS CORRECTAMENTE:');
  console.log('======================================================');
  results.forEach(r => {
    console.log(`• ${r.name.padEnd(42)} | ${r.pages} págs | ${r.sizeKB} KB`);
  });
  console.log('======================================================\n');
}

run().catch(console.error);
