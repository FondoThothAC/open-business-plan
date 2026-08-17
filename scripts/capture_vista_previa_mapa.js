import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('openplan_setup', JSON.stringify({
      mode: 'cloud',
      setupComplete: true
    }));
  });

  console.log('Navegando a http://localhost:5173/vista-previa...');
  await page.goto('http://localhost:5173/vista-previa', { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 7000));

  // Scroll dentro de main-content
  await page.evaluate(() => {
    const mapH4 = Array.from(document.querySelectorAll('h4')).find(h => h.innerText.includes('Mapa de Calor') || h.innerText.includes('Densidad'));
    if (mapH4) {
      mapH4.scrollIntoView();
    } else {
      window.scrollBy(0, 4500);
    }
  });

  await new Promise(r => setTimeout(r, 2000));

  const outputPath = 'C:/Users/HP/.gemini/antigravity/brain/2ac4a581-2e21-47fd-a661-8e3ae397b255/captura_vista_previa_mapa_final.png';
  await page.screenshot({ path: outputPath, fullPage: false });
  console.log(`✅ Captura guardada en: ${outputPath}`);

  await browser.close();
}

run();
