import puppeteer from 'puppeteer';
import path from 'node:path';

const ARTIFACT_DIR = '/Users/robertoeduardocelisrobles/.gemini/antigravity/brain/de25a746-b7d4-474b-a5ca-686bf14fd627';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1X3N1cGVyYWRtaW5fcm9iZXJ0byIsInVzZXJuYW1lIjoicm9iZXJ0byIsInJvbGUiOiJzdXBlcmFkbWluIiwiZGlzcGxheU5hbWUiOiJSb2JlcnRvIENlbGlzIiwicmVtZW1iZXJNZSI6dHJ1ZSwic2Vzc2lvblZlcnNpb24iOjAsImlhdCI6MTc5MTk1MTExMCwiZXhwIjoxNzk0NTQzMTEwfQ.bLiFalNiV8tz-7wSQ0B82uQDN1S19qYhFgzK36o0SNE';

async function runVisualAudit() {
  console.log('🚀 Iniciando auditoría visual quirúrgica con Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,960']
  });

  const page = await browser.newPage();
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
    console.log('📸 [Paso 1] Navegando a FODA (https://fondothoth.com/obp/business/foda)...');
    await page.goto('https://fondothoth.com/obp/business/foda', { waitUntil: 'networkidle2', timeout: 35000 });
    await new Promise(r => setTimeout(r, 2500));

    // Si aún aparece algún modal o wizard, cerrarlo
    await page.evaluate(() => {
      const closeBtns = document.querySelectorAll('button');
      for (const btn of closeBtns) {
        if (btn.textContent.includes('Comenzar Configuración') || btn.textContent.includes('Saltar') || btn.textContent.includes('Omitir')) {
          btn.click();
        }
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    // Captura completa del tablero FODA
    const fodaImgPath = path.join(ARTIFACT_DIR, 'verificacion_ui_foda.png');
    await page.screenshot({ path: fodaImgPath, fullPage: false });
    console.log('   ✓ Captura de FODA guardada en:', fodaImgPath);

    // 4. Abrir modal de conversión en FODA (Opción A con IA)
    console.log('📸 [Paso 2] Abriendo modal de Ley de Conversión a Fortaleza...');
    const convertBtn = await page.$('button[title*="Convertir"], button[title*="Fortaleza"], .foda-card-debilidades button');
    if (convertBtn) {
      await convertBtn.click();
      await new Promise(r => setTimeout(r, 1200));

      const modalImgPath = path.join(ARTIFACT_DIR, 'verificacion_ui_modal_conversion.png');
      await page.screenshot({ path: modalImgPath, fullPage: false });
      console.log('   ✓ Captura del Modal de Conversión con IA guardada en:', modalImgPath);

      // Cerrar modal
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }

    // 5. Navegar al Wiki
    console.log('📸 [Paso 3] Navegando al Wiki de Software OBP (https://fondothoth.com/obp/wiki)...');
    await page.goto('https://fondothoth.com/obp/wiki', { waitUntil: 'networkidle2', timeout: 35000 });
    await new Promise(r => setTimeout(r, 2500));

    const wikiImgPath = path.join(ARTIFACT_DIR, 'verificacion_ui_wiki.png');
    await page.screenshot({ path: wikiImgPath, fullPage: false });
    console.log('   ✓ Captura de Wiki guardada en:', wikiImgPath);

    // 6. En el Wiki, buscar y seleccionar el artículo de Fondo Thoth AC
    console.log('📸 [Paso 4] Seleccionando artículo con diagramas en el árbol...');
    const clickedArticle = await page.evaluate(() => {
      // Buscar elementos del árbol que contengan "FODA Dinámico" o "Archivados"
      const nodes = Array.from(document.querySelectorAll('.wiki-tree-item, .wiki-tree-branch-header, button, div'));
      for (const el of nodes) {
        if (el.textContent.includes('Archivados (por rescatar)')) {
          el.click();
        }
      }
      return true;
    });

    await new Promise(r => setTimeout(r, 1000));

    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.wiki-tree-item, a, button, span'));
      for (const item of items) {
        if (item.textContent.includes('FODA Dinámico') || item.textContent.includes('Formulación Estratégica')) {
          item.click();
          return true;
        }
      }
      return false;
    });

    await new Promise(r => setTimeout(r, 3000));

    const diagramasImgPath = path.join(ARTIFACT_DIR, 'verificacion_ui_wiki_diagramas.png');
    await page.screenshot({ path: diagramasImgPath, fullPage: false });
    console.log('   ✓ Captura de los Diagramas Metodológicos guardada en:', diagramasImgPath);

    console.log('🎉 Auditoría visual finalizada exitosamente.');
  } catch (error) {
    console.error('❌ Error durante la auditoría visual:', error.message);
  } finally {
    await browser.close();
  }
}

runVisualAudit();
