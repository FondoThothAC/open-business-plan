import puppeteer from 'puppeteer';
import path from 'node:path';

const ARTIFACT_DIR = '/Users/robertoeduardocelisrobles/.gemini/antigravity/brain/de25a746-b7d4-474b-a5ca-686bf14fd627';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1X3N1cGVyYWRtaW5fcm9iZXJ0byIsInVzZXJuYW1lIjoicm9iZXJ0byIsInJvbGUiOiJzdXBlcmFkbWluIiwiZGlzcGxheU5hbWUiOiJSb2JlcnRvIENlbGlzIiwicmVtZW1iZXJNZSI6dHJ1ZSwic2Vzc2lvblZlcnNpb24iOjAsImlhdCI6MTc5MTk1MTExMCwiZXhwIjoxNzk0NTQzMTEwfQ.bLiFalNiV8tz-7wSQ0B82uQDN1S19qYhFgzK36o0SNE';

async function runVisualAudit() {
  console.log('🚀 Iniciando auditoría visual quirúrgica con Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    protocolTimeout: 120000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,960']
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  page.setDefaultTimeout(60000);
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });

  // 1. Inyectar Cookie de Autenticación en fondothoth.com
  await page.setCookie({
    name: 'obp_auth_token',
    value: TOKEN,
    domain: 'fondothoth.com',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax'
  });

  // 2. Pre-inyectar en localStorage antes de que cualquier script se ejecute
  await page.evaluateOnNewDocument((tok) => {
    localStorage.setItem('obp_auth_token', tok);
    localStorage.setItem('openplan_setup', JSON.stringify({
      completed: true,
      model: 'minimax-m3:cloud',
      contextSize: 32768,
      endpoint: 'http://localhost:11434'
    }));
    localStorage.setItem('obp_auth_user', JSON.stringify({
      id: 'u_superadmin_roberto',
      username: 'roberto',
      role: 'superadmin',
      displayName: 'Roberto Celis'
    }));
  }, TOKEN);

  try {
    // 3. Navegar a FODA en fondothoth.com/obp/business/foda
    console.log('📸 Navegando a FODA...');
    await page.goto('https://fondothoth.com/obp/business/foda', { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise(r => setTimeout(r, 2000));

    // Si aparece algún modal o wizard de bienvenida, cerrarlo
    await page.evaluate(() => {
      const closeBtns = document.querySelectorAll('button');
      for (const btn of closeBtns) {
        if (btn.textContent.includes('Comenzar Configuración') || btn.textContent.includes('Saltar') || btn.textContent.includes('Omitir')) {
          btn.click();
        }
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    // Buscar y hacer clic específicamente en el botón "Convertir en Fortaleza"
    const clickedConvert = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => b.textContent.includes('Convertir en Fortaleza'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });

    if (clickedConvert) {
      console.log('   ✓ Clic en "Convertir en Fortaleza" realizado.');
      await new Promise(r => setTimeout(r, 1500));

      const modalImgPath = path.join(ARTIFACT_DIR, 'verificacion_ui_modal_conversion.png');
      await page.screenshot({ path: modalImgPath, fullPage: false });
      console.log('   ✓ Captura del Modal de Conversión con IA guardada en:', modalImgPath);
    }

    console.log('🎉 Auditoría visual finalizada exitosamente.');
  } catch (error) {
    console.error('❌ Error durante la auditoría visual:', error.message);
  } finally {
    await browser.close();
  }
}

runVisualAudit();
