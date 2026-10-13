import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { build } from 'esbuild';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'node:url';

// Render real del componente: solo se reemplazan servicios externos, no el componente.
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MATRIZ_VCV = JSON.parse(fs.readFileSync(path.join(RAIZ, 'docs/pestel_plan/pestel_vcv_matrix.json'), 'utf8'));

const montar = async () => {
  const bundle = await build({
    stdin: {
      contents: `
        import React from 'react';
        import { createRoot } from 'react-dom/client';
        import PestelAnalysis from './src/components/PestelAnalysis.jsx';
        const root = createRoot(document.getElementById('root'));
        window.renderPestel = (props) => root.render(<PestelAnalysis {...props} />);
      `,
      resolveDir: RAIZ,
      loader: 'jsx'
    },
    bundle: true,
    write: false,
    format: 'iife',
    jsx: 'automatic'
  });
  const server = createServer((req, res) => {
    if (req.url === '/app.js') {
      res.setHeader('Content-Type', 'text/javascript');
      res.end(bundle.outputFiles[0].text);
    } else {
      res.end('<!doctype html><html><body style="margin:0"><div id="root"></div><script src="/app.js"></script></body></html>');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}/` };
};

test('PESTEL-UI: la vista de matriz calificada reemplaza a la infografía de texto', async (t) => {
  const { server, url } = await montar();
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const browser = await puppeteer.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle0' });

  await page.evaluate((data) => window.renderPestel({ data }), MATRIZ_VCV);
  await page.waitForSelector('.pestel-matrix-view');

  const dom = await page.evaluate(() => ({
    tarjetas: document.querySelectorAll('.pestel-matrix-view .pestel-card').length,
    factores: document.querySelectorAll('.pestel-matrix-view .pestel-factor').length,
    filasTabla: document.querySelectorAll('.pestel-matrix-view .pestel-matrix-table tbody tr').length,
    celdasPrimeraFila: document.querySelectorAll('.pestel-matrix-view .pestel-matrix-table tbody tr:first-child td').length,
    badges: [...document.querySelectorAll('.pestel-impact-badge')].map((el) => ({
      texto: el.textContent.trim(),
      fondo: getComputedStyle(el).backgroundColor
    })),
    priorizacion: document.querySelectorAll('.pestel-priorizacion section, .pestel-priorizacion > div').length,
    conclusion: document.querySelector('.pestel-conclusion')?.innerText || '',
    fuentes: document.querySelectorAll('.pestel-fuentes li').length,
    desbordeHorizontal: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }));

  assert.equal(dom.tarjetas, 6, 'las seis dimensiones siguen presentes');
  assert.equal(dom.factores, 12, 'cada factor calificado debe verse');
  assert.equal(dom.filasTabla, 12);
  assert.equal(dom.celdasPrimeraFila, 8, 'la tabla conserva las 8 columnas de la rúbrica');
  assert.equal(dom.fuentes, 16);
  assert.ok(dom.conclusion.includes('desfavorable'), 'la conclusión debe renderizar');
  assert.equal(dom.desbordeHorizontal, false, 'nada debe salirse del ancho de la ventana');
  assert.deepEqual(errores, [], 'el render no debe lanzar errores de JS');

  await t.test('el semáforo coincide con la clasificación numérica', () => {
    const porValor = Object.fromEntries(dom.badges.map((b) => [b.texto, b.fondo]));
    assert.equal(porValor['2.76'], 'rgb(220, 38, 38)', 'alto = rojo');
    assert.equal(porValor['2.64'], 'rgb(220, 38, 38)', 'alto = rojo');
    assert.equal(porValor['2.25'], 'rgb(217, 119, 6)', 'medio = ámbar');
    assert.equal(porValor['1.13'], 'rgb(5, 150, 105)', 'bajo = verde');
    assert.equal(porValor['0.83'], 'rgb(5, 150, 105)', 'bajo = verde');
  });

  await page.screenshot({ path: '/tmp/pestel_vista_matriz.png', fullPage: true });
});

test('PESTEL-UI: la impresión conserva semáforo y no parte factores a la mitad', async (t) => {
  const { server, url } = await montar();
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const browser = await puppeteer.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 }); // A4 a 96 dpi
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.evaluate((data) => window.renderPestel({ data }), MATRIZ_VCV);
  await page.waitForSelector('.pestel-matrix-view');
  await page.emulateMediaType('print');

  const impreso = await page.evaluate(() => {
    const badge = document.querySelector('.pestel-impact-badge');
    const tarjeta = document.querySelector('.pestel-matrix-view .pestel-card');
    return {
      fondoBadge: badge ? getComputedStyle(badge).backgroundColor : null,
      ajusteColor: badge ? getComputedStyle(badge).printColorAdjust || getComputedStyle(badge).webkitPrintColorAdjust : null,
      fondoTarjeta: tarjeta ? getComputedStyle(tarjeta).backgroundColor : null,
      saltoEvitado: tarjeta ? getComputedStyle(tarjeta).breakInside : null,
      fuentesVisibles: [...document.querySelectorAll('.pestel-fuentes li')].filter((li) => li.offsetHeight > 0).length,
      columnas: document.querySelector('.pestel-matrix-view .pestel-grid-container')
        ? getComputedStyle(document.querySelector('.pestel-matrix-view .pestel-grid-container')).gridTemplateColumns.split(' ').length
        : 0
    };
  });

  assert.equal(impreso.fondoBadge, 'rgb(5, 150, 105)', 'el verde del primer factor (0.90) debe imprimirse');
  assert.equal(impreso.ajusteColor, 'exact', 'los colores del semáforo no pueden desaparecer al imprimir');
  assert.equal(impreso.fondoTarjeta, 'rgb(255, 255, 255)', 'las tarjetas pasan a fondo blanco en impresión');
  assert.equal(impreso.saltoEvitado, 'avoid', 'una dimensión no debe partirse entre páginas');
  assert.equal(impreso.fuentesVisibles, 16, 'las fuentes deben imprimirse, no quedar colapsadas');
  assert.equal(impreso.columnas, 2, 'la retícula de dos columnas se conserva al imprimir');

  await page.pdf({ path: '/tmp/pestel_impresion.pdf', format: 'A4', printBackground: true });
});

test('PESTEL-UI: el panel de investigación exige fecha y calificación antes de escribir', async (t) => {
  const { server, url } = await montar();
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const browser = await puppeteer.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1200 });
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Búsqueda simulada: un candidato apto, uno sin fecha y uno fuera de ventana.
  await page.evaluate(() => {
    window.llamadas = [];
    window.fetch = async (u, opts) => {
      const cuerpo = JSON.parse(opts.body);
      window.llamadas.push(cuerpo.query);
      return {
        json: async () => ({
          success: true,
          provider: 'tavily',
          results: [
            { title: 'Prohibición de bolsas plásticas para comercio en Sonora', url: 'https://www.gob.mx/semarnat/a', snippet: 'Restricción a partir de 2027.', publishedDate: '2026-04-15', provider: 'tavily', provenance: 'real' },
            { title: 'Tendencia de consumo de proteína premium', url: 'https://blog-sin-fecha.mx/x', snippet: 'Sin data.', provider: 'tavily', provenance: 'real' },
            { title: 'Reforma fiscal de 2019', url: 'https://dof.gob.mx/viejo', snippet: 'Vieja.', publishedDate: '2019-01-01', provider: 'tavily', provenance: 'real' }
          ]
        })
      };
    };
  });

  await page.evaluate((data) => {
    window.aprobada = null;
    window.renderPestel({
      data,
      config: { search: { provider: 'tavily', apiKey: 'k-de-prueba' } },
      empresa: 'VCV Cortes Finos',
      giro: 'cárnico premium',
      onActualizar: (nueva) => { window.aprobada = nueva; }
    });
  }, MATRIZ_VCV);
  await page.waitForSelector('.pestel-investigacion');

  assert.equal(await page.$$eval('.pestel-procedencia', (n) => n.length), 12, 'los 12 factores deben mostrar su sello de procedencia');

  await page.click('.pestel-investigacion button');
  await page.waitForFunction(() => document.querySelectorAll('.pestel-candidato').length > 0, { timeout: 5000 });

  const conteo = await page.evaluate(() => document.querySelector('.pestel-investigacion').innerText);
  assert.match(conteo, /1 aptos/);
  assert.match(conteo, /1 sin fecha o sin ventana/);
  assert.match(conteo, /1 fuera de ventana/);
  assert.equal(await page.$$eval('.pestel-investigacion input[type=number]', (i) => i.length), 3, 'solo el candidato apto trae campos de calificación');

  // Aprobar sin calificar debe rechazarse, con el motivo a la vista.
  await page.click('.pestel-candidato button');
  await page.waitForFunction(() => /calificación es humana/.test(document.body.innerText), { timeout: 3000 });
  assert.equal(await page.evaluate(() => window.aprobada), null, 'nada se escribe sin calificación');

  const campos = await page.$$('.pestel-investigacion input[type=number]');
  await campos[0].type('3');
  await campos[1].type('2');
  await campos[2].type('0.8');
  await page.select('.pestel-investigacion select', 'A');
  await page.click('.pestel-candidato button');
  await page.waitForFunction(() => Boolean(window.aprobada), { timeout: 4000 });

  const escrita = await page.evaluate(() => window.aprobada);
  assert.equal(escrita.length, 13, 'la matriz crece exactamente una fila');
  const nueva = escrita[12];
  assert.equal(nueva.n, 13);
  assert.equal(nueva.impacto, 2, '[(3 + 2) / 2] × 0.8 = 2.00');
  assert.equal(nueva.clasificacion, 'medio');
  assert.equal(nueva.provenance, 'real');
  assert.equal(nueva.fecha, '2026-04-15');
  assert.deepEqual(errores, []);
  await page.screenshot({ path: '/tmp/pestel_panel_investigacion.png', fullPage: true });
});

test('PESTEL-UI: los proyectos sin matriz siguen con la infografía de texto libre', async (t) => {
  const { server, url } = await montar();
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const browser = await puppeteer.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle0' });

  await page.evaluate(() => window.renderPestel({
    data: { politico: '• Estabilidad normativa.', economico: '• Inflación.', social: '', tecnologico: '', ecologico: '', legal: '' }
  }), null);
  await page.waitForSelector('.pestel-grid-container');

  const legacy = await page.evaluate(() => ({
    vistaMatriz: Boolean(document.querySelector('.pestel-matrix-view')),
    tarjetas: document.querySelectorAll('.pestel-card').length,
    markdown: document.querySelectorAll('.pestel-card .markdown-content').length,
    placeholder: document.body.innerText.includes('Sin factores redactados')
  }));

  assert.equal(legacy.vistaMatriz, false, 'sin matriz no se fuerza la vista nueva');
  assert.equal(legacy.tarjetas, 6);
  assert.equal(legacy.markdown, 6, 'el texto libre sigue saliendo por ReactMarkdown');
  assert.equal(legacy.placeholder, true, 'las dimensiones vacías conservan su aviso');
  assert.deepEqual(errores, []);
});
