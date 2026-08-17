import puppeteer from 'puppeteer';
import path from 'path';

async function run() {
  console.log('Iniciando navegador Puppeteer para captura...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1050 });

  // Preconfigurar localStorage
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('openplan_setup', JSON.stringify({
      mode: 'cloud',
      model: 'gemini-1.5-flash',
      contextSize: 32768,
      setupComplete: true
    }));
  });

  console.log('Navegando a http://localhost:5173/modulo/mercado/competencia...');
  await page.goto('http://localhost:5173/modulo/mercado/competencia', { waitUntil: 'networkidle2', timeout: 30000 });

  // Esperar a que el mapa cargue y se ejecute la búsqueda
  console.log('Esperando 7 segundos para que el mapa y competidores carguen...');
  await new Promise(r => setTimeout(r, 7000));

  // Opcional: hacer scroll para ver el mapa completo
  await page.evaluate(() => {
    window.scrollBy(0, 350);
  });
  await new Promise(r => setTimeout(r, 1000));

  const artifactDir = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\2ac4a581-2e21-47fd-a661-8e3ae397b255';
  const outputPath = path.join(artifactDir, 'captura_mapa_competencia.png');

  await page.screenshot({ path: outputPath, fullPage: false });
  console.log(`✅ Captura de competencia guardada en: ${outputPath}`);

  // Capturar vista del mapa de calor
  console.log('Navegando a http://localhost:5173/modulo/mercado/mapa...');
  await page.goto('http://localhost:5173/modulo/mercado/mapa', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 7000));
  await page.evaluate(() => {
    window.scrollBy(0, 350);
  });
  await new Promise(r => setTimeout(r, 1000));

  const outputHeatmap = path.join(artifactDir, 'captura_mapa_calor.png');
  await page.screenshot({ path: outputHeatmap, fullPage: false }).catch(() => {});
  console.log(`✅ Captura de mapa de calor guardada en: ${outputHeatmap}`);

  await browser.close();
}

run().catch(err => {
  console.error('Error capturando pantalla:', err);
  process.exit(1);
});
