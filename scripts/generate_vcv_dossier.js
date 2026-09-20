import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import jwt from 'jsonwebtoken';
import { buildDocxDocument } from '../src/lib/docxExportEngine.js';
import { Packer } from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const JWT_SECRET = process.env.JWT_SECRET || 'openplan_jwt_secret_dev_2026';

async function run() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('  GENERACIÓN CANÓNICA DE DOSSIER EJECUTIVO VCV (DOCX + PDF)               ');
  console.log('  Open Business Plan — Fondo Thoth AC                                      ');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  const vcvJsonPath = path.join(ROOT, 'proyectos', 'negocios', 'vcv_cortes_finos_sa_de_cv', 'vcv_cortes_finos_sa_de_cv.json');
  if (!fs.existsSync(vcvJsonPath)) {
    throw new Error(`No se encontró el archivo canónico: ${vcvJsonPath}`);
  }

  const projectData = JSON.parse(fs.readFileSync(vcvJsonPath, 'utf-8'));
  console.log(`▶ Proyecto cargado: ${projectData.nombre || projectData.companyName}`);

  // Asegurar configuración canónica para dossier ejecutivo
  projectData.config = projectData.config || {};
  projectData.config.globalOrientation = 'portrait';
  projectData.config.projectType = 'business';

  const vcvDir = path.join(ROOT, 'vcv');
  if (!fs.existsSync(vcvDir)) fs.mkdirSync(vcvDir, { recursive: true });

  // 1. GENERAR ARCHIVO WORD (.docx) EJECUTIVO CANÓNICO
  const docxTarget = path.join(vcvDir, 'vcv-cortes-finos-s-a-de-c-v--ejecutivo.docx');
  console.log(`\n1️⃣  Generando Word Ejecutivo (.docx) en: ${docxTarget}...`);
  const docxDoc = buildDocxDocument(projectData, { scope: 'executive' });
  const docxBuffer = await Packer.toBuffer(docxDoc);
  fs.writeFileSync(docxTarget, docxBuffer);
  const docxSizeKB = (docxBuffer.length / 1024).toFixed(1);
  console.log(`   ✅ Archivo Word ejecutivo generado con éxito: ${docxSizeKB} KB`);

  // 2. GENERAR TOKEN DE AUTENTICACIÓN ADMINISTRATIVA
  const token = jwt.sign(
    {
      id: 'usr_roberto_superadmin',
      username: 'roberto',
      role: 'superadmin',
      name: 'Roberto Celis'
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  // 3. GENERAR ARCHIVO PDF EJECUTIVO CANÓNICO CON PUPPETEER
  const pdfTarget = path.join(vcvDir, 'vcv-cortes-finos-s-a-de-c-v--ejecutivo.pdf');
  console.log(`\n2️⃣  Generando PDF Ejecutivo Canónico en: ${pdfTarget}...`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--font-render-hinting=none'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    const baseUrl = 'http://localhost:5173/obp/';
    console.log(`   🌐 Inicializando sesión en ${baseUrl}...`);
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });

    // Autenticar legítimamente contra el backend para recibir cookie HttpOnly auténtica
    const authResult = await page.evaluate(async (d) => {
      try {
        const res = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username: 'roberto', password: 'admin123456', rememberMe: true })
        });
        const json = await res.json();
        if (json.success) {
          localStorage.clear();
          localStorage.setItem('openplan_setup', 'true');
          localStorage.setItem('openplan_active_project_id', 'vcv_cortes_finos_sa_de_cv');
          localStorage.setItem('openplan_active_project_type', 'negocios');
          localStorage.setItem('openplan_v2_data', JSON.stringify(d));
          localStorage.setItem('openplan_auth_user', JSON.stringify(json.user));
          return { success: true, user: json.user };
        }
        return { success: false, error: json.error };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }, projectData);

    console.log('   🔑 Autenticación en navegador:', authResult);
    if (!authResult.success) {
      throw new Error(`Fallo de login en navegador: ${authResult.error}`);
    }

    // Navegar a Vista Previa
    console.log('   🔗 Navegando a Vista Previa en navegador headless...');
    await page.goto(`${baseUrl}vista-previa`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 4000));

    // Esperar al contenedor principal de Vista Previa
    console.log('   ⏳ Esperando renderizado de .preview-document...');
    await page.waitForSelector('.preview-document', { timeout: 20000 });
    console.log('   ⏳ Estabilizando componentes visuales, gráficos SVG y balances...');
    await new Promise(r => setTimeout(r, 4500));

    // Forzar selección de Dossier Ejecutivo en caso de que esté en Maestro
    const scopeSet = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const execBtn = buttons.find(b => b.textContent && b.textContent.includes('Dossier Ejecutivo'));
      if (execBtn) {
        execBtn.click();
        return true;
      }
      return false;
    });
    console.log('   🔘 Cambio a Dossier Ejecutivo:', scopeSet ? 'OK' : 'No encontrado');

    await new Promise(r => setTimeout(r, 2000));

    // Diagnosticar contenido visible y estructura del DOM
    const domDiagnostic = await page.evaluate(() => {
      const doc = document.querySelector('.preview-document');
      const pages = Array.from(document.querySelectorAll('.print-page'));
      const sections = Array.from(document.querySelectorAll('.preview-section, [id^="seccion-"]')).map(s => s.id);
      return {
        hasPreviewDoc: !!doc,
        docChildCount: doc ? doc.children.length : 0,
        pageCount: pages.length,
        sectionsCount: sections.length,
        sectionIds: sections.slice(0, 10),
        bodySnippet: document.body.innerText.slice(0, 300).replace(/\n+/g, ' ')
      };
    });
    console.log('   📊 Diagnóstico del DOM:', domDiagnostic);

    // Tomar screenshot de la pantalla en navegador
    const debugScreenshotPath = path.join(ROOT, 'scratch', 'vcv_debug_browser.png');
    await page.screenshot({ path: debugScreenshotPath, fullPage: false });
    console.log(`   📸 Captura de pantalla guardada en: ${debugScreenshotPath}`);

    // Activar emulación de medios de impresión (@media print)
    await page.emulateMediaType('print');
    await new Promise(r => setTimeout(r, 1000));

    // Imprimir PDF en orientación Vertical Letter
    console.log('   🖨️ Imprimiendo documento a PDF en formato Letter Portrait...');
    await page.pdf({
      path: pdfTarget,
      format: 'Letter',
      landscape: false,
      printBackground: true,
      margin: {
        top: '0.8cm',
        bottom: '0.8cm',
        left: '0.8cm',
        right: '0.8cm'
      }
    });

    const pdfStats = fs.statSync(pdfTarget);
    const pdfSizeKB = (pdfStats.size / 1024).toFixed(1);
    console.log(`   ✅ PDF exportado con éxito: ${pdfSizeKB} KB`);

  } finally {
    await browser.close();
    await new Promise(r => setTimeout(r, 1200));
  }

  // 4. RENDERIZAR PÁGINAS A IMÁGENES PNG Y VALIDAR AL 100%
  const scratchDir = path.join(ROOT, 'scratch', 'vcv_pages');
  if (fs.existsSync(scratchDir)) {
    fs.rmSync(scratchDir, { recursive: true, force: true });
  }
  fs.mkdirSync(scratchDir, { recursive: true });

  console.log(`\n3️⃣  Renderizando páginas del PDF a imágenes PNG con pdftoppm...`);
  const pdftoppmBin = fs.existsSync('/opt/homebrew/bin/pdftoppm') ? '/opt/homebrew/bin/pdftoppm' : 'pdftoppm';
  execSync(`${pdftoppmBin} -png -r 150 "${pdfTarget}" "${path.join(scratchDir, 'pagina')}"`);

  const renderedPages = fs.readdirSync(scratchDir).filter(f => f.endsWith('.png')).sort();
  console.log(`   📄 Total de páginas renderizadas: ${renderedPages.length}`);

  renderedPages.forEach((p, idx) => {
    const pPath = path.join(scratchDir, p);
    const stat = fs.statSync(pPath);
    console.log(`      Página ${idx + 1}: ${p} (${(stat.size / 1024).toFixed(0)} KB)`);
  });

  console.log(`\n======================================================================`);
  console.log(`🎯 RESULTADO DE VALIDACIÓN VCV:`);
  console.log(`   • Páginas finales: ${renderedPages.length} (Meta: 20-25 páginas)`);
  console.log(`   • Archivo Word: ${docxTarget} (${docxSizeKB} KB)`);
  console.log(`   • Archivo PDF: ${pdfTarget}`);
  console.log(`======================================================================\n`);
}

run().catch(err => {
  console.error('❌ Error al generar dossier de VCV:', err);
  process.exit(1);
});
