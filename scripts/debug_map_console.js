import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('openplan_setup', JSON.stringify({
      mode: 'cloud',
      setupComplete: true
    }));
  });

  await page.goto('http://localhost:5173/modulo/mercado/competencia', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 6000));

  // Inspeccionar estado de openlayers y mapInstance
  const mapDebug = await page.evaluate(() => {
    const mapDiv = document.querySelector('div[style*="340px"]');
    return {
      hasWindowOl: !!window.ol,
      mapDivFound: !!mapDiv,
      mapDivChildren: mapDiv ? mapDiv.innerHTML.length : 0,
      classes: mapDiv ? mapDiv.className : ''
    };
  });

  console.log('Map Debug Info:', mapDebug);
  await browser.close();
}

run();
