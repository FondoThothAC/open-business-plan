import puppeteer from 'puppeteer';
import path from 'path';

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1050 });

  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('openplan_setup', JSON.stringify({
      mode: 'cloud',
      setupComplete: true
    }));
  });

  console.log('Navegando a http://localhost:5173/modulo/mercado/mapa...');
  await page.goto('http://localhost:5173/modulo/mercado/mapa', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 6000));

  // Hacer clic en "Guardar en el Plan"
  console.log('Haciendo clic en Guardar en el Plan...');
  await page.evaluate(() => {
    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Guardar en el Plan'));
    if (saveBtn) saveBtn.click();
  });

  await new Promise(r => setTimeout(r, 2000));

  const artifactDir = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\2ac4a581-2e21-47fd-a661-8e3ae397b255';
  const outputPath = path.join(artifactDir, 'captura_guardado_persistido.png');

  await page.screenshot({ path: outputPath, fullPage: false });
  console.log(`✅ Captura de guardado persistido en: ${outputPath}`);

  await browser.close();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
