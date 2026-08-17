import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

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

async function exportOne(proj) {
  console.log(`\n======================================================`);
  console.log(`▶ Procesando Proyecto: ${proj.name} [${proj.id}]`);
  console.log(`======================================================`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });

    const jsonPath = path.resolve(`proyectos/negocios/${proj.id}/${proj.id}.json`);
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
    await new Promise(r => setTimeout(r, 4000));

    const pageInfo = await page.evaluate(() => {
      const pages = document.querySelectorAll('.print-page');
      return {
        printPagesCount: pages.length
      };
    });

    const primaryPath = path.resolve(`proyectos/pdfs/${proj.aliases[0]}`);
    console.log(`Imprimiendo ${pageInfo.printPagesCount} páginas oficiales en ${primaryPath}...`);

    const start = Date.now();
    await page.pdf({
      path: primaryPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.8cm', bottom: '0.8cm', left: '0.8cm', right: '0.8cm' },
      timeout: 120000
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const stat = fs.statSync(primaryPath);
    const sizeKB = (stat.size / 1024).toFixed(1);
    console.log(`✅ PDF generado en ${elapsed}s: ${sizeKB} KB (${pageInfo.printPagesCount} páginas)`);

    for (let i = 1; i < proj.aliases.length; i++) {
      const aliasPath = path.resolve(`proyectos/pdfs/${proj.aliases[i]}`);
      fs.copyFileSync(primaryPath, aliasPath);
      console.log(`↳ Alias sincronizado: ${proj.aliases[i]}`);
    }

    return { name: proj.name, pages: pageInfo.printPagesCount, sizeKB };
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🚀 INICIANDO EXPORTACIÓN FINAL DE PDFs DE ALTA FIDELIDAD');
  const summary = [];
  for (const p of PROJECTS) {
    const res = await exportOne(p);
    summary.push(res);
  }

  console.log('\n======================================================');
  console.log('🎉 RESUMEN DE PDFs GENERADOS:');
  console.log('======================================================');
  summary.forEach(s => {
    console.log(`• ${s.name.padEnd(45)} | ${s.pages} páginas | ${s.sizeKB} KB`);
  });
  console.log('======================================================\n');
}

main().catch(console.error);
