import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { build } from 'esbuild';
import puppeteer from 'puppeteer';

// Render the actual component; only external services and persistence are replaced.
test('InegiMap rendered search lifecycle', async t => {
  const bundle = await build({
    stdin: { contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import InegiMap from './src/components/InegiMap.jsx';
      window.saved = [];
      window.marketCalls = [];
      window.geo = async q => ({success:true, lat:29.072967, lng:-110.955919, displayName:q});
      window.market = async p => ({success:true, competidores:[]});
      const root = createRoot(document.getElementById('root'));
      window.renderMap = props => root.render(<InegiMap token="test" mode="location" {...props}/>);
    `, resolveDir: process.cwd(), loader: 'jsx' },
    bundle: true, write: false, format: 'iife', jsx: 'automatic',
    plugins: [{ name: 'test-services', setup(b) {
      b.onResolve({ filter: /context\/PlanContext$|lib\/inegi$|lib\/indicadoresInegi$|lib\/ai$|^react-router-dom$/ }, args => ({ path: args.path, namespace: 'fixture' }));
      b.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({ contents:
        path.includes('PlanContext') ? `export const usePlan = () => ({planData:{config:{}}, updateSection:(...args)=>window.saved.push(args)});` :
        path.includes('indicadoresInegi') ? `export const ENTIDADES_INEGI={}; export const getViabilidadMercado=async()=>({success:false}); export const getPerfilSocioeconomico=async()=>({success:false});` :
        path.endsWith('/inegi') ? `export const geocodeMx=q=>window.geo(q); export const getMarketCompetitors=p=>{window.marketCalls.push(p);return window.market(p)}; export const getInegiMunicipio=async()=>({success:false}); export const getMarketViability=async()=>({success:false});` :
        path.endsWith('/ai') ? `export const callAiProvider=async()=>({});` : `export const useParams=()=>({});`, loader: 'js' }));
    }}],
  });
  const server = createServer((req, res) => {
    if (req.url === '/app.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(bundle.outputFiles[0].text); }
    else res.end('<div id="root"></div><script src="/app.js"></script>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const browser = await puppeteer.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', req => req.url().startsWith('http://127.0.0.1:') ? req.continue() : req.abort());
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const saveVisible = () => page.evaluate(() => [...document.querySelectorAll('button')].some(b => /Guardar en el Plan|¡Guardado/.test(b.textContent)));
  const search = () => page.click('button[title="Buscar competidores"]');
  const waitSave = () => page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent.includes('Guardar en el Plan')));

  await t.test('initial render is safe while geocoding is pending', async () => {
    await page.evaluate(() => { window.geo = () => new Promise(resolve => window.finishGeo = resolve); window.renderMap({location:'Hermosillo, Sonora'}); });
    await page.waitForFunction(() => window.finishGeo);
    assert.match(await page.$eval('#root', el => el.textContent), /Centro: Hermosillo, Sonora/);
    assert.equal(await saveVisible(), false);
  });
  await t.test('Hermosillo completes and can save', async () => {
    await page.evaluate(() => window.finishGeo({success:true,lat:29.072967,lng:-110.955919,displayName:'Hermosillo, Sonora'}));
    await waitSave();
    await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.includes('Guardar en el Plan')).click());
    assert.match(await page.evaluate(() => window.saved[0][3]), /Hermosillo, Sonora/);
  });
  await t.test('new search hides save and preserves zero coordinates', async () => {
    await page.evaluate(() => { window.geo=async()=>({success:true,lat:0,lng:'0',displayName:'Origen'}); window.market=()=>new Promise(resolve=>window.finishMarket=resolve); });
    await search();
    await page.waitForFunction(() => window.finishMarket);
    assert.equal(await saveVisible(), false);
    assert.deepEqual(await page.evaluate(() => {const p=window.marketCalls.at(-1);return [p.lat,p.lng]}), [0,0]);
    await page.evaluate(() => window.finishMarket({success:true,competidores:[]}));
    await waitSave();
  });
  await t.test('failed search after success cannot save prior analysis', async () => {
    await page.evaluate(() => { window.market=async()=>({success:false,error:'Consulta fallida'}); });
    await search();
    await page.waitForFunction(() => document.body.textContent.includes('Consulta fallida'));
    assert.equal(await saveVisible(), false);
  });
  await t.test('failed geocoding labels fallback truthfully and does not search it', async () => {
    const count = await page.evaluate(() => window.marketCalls.length);
    await page.evaluate(() => { window.geo=async()=>({success:false}); window.renderMap({location:'Ciudad desconocida'}); });
    await page.waitForSelector('[role="alert"]');
    assert.match(await page.$eval('[role="alert"]', el=>el.textContent), /Hermosillo, Sonora como referencia/);
    assert.equal(await saveVisible(), false);
    assert.equal(await page.evaluate(() => window.marketCalls.length), count);
  });
  await t.test('read-only mode shows fallback warning and never save controls', async () => {
    await page.evaluate(() => window.renderMap({location:'Ciudad desconocida',readOnly:true}));
    await page.waitForFunction(() => !document.querySelector('button[title="Buscar competidores"]'));
    assert.equal(await saveVisible(), false);
    assert.match(await page.$eval('[role="alert"]', el=>el.textContent), /no se puede guardar/);
  });
  await t.test('older successful response cannot override a newer failure', async () => {
    await page.evaluate(() => {
      window.geo=q=>q==='Antigua' ? new Promise(resolve=>window.finishOld=resolve) : Promise.resolve({success:false});
      window.renderMap({location:'Antigua'});
    });
    await page.waitForFunction(()=>window.finishOld);
    await page.evaluate(()=>window.renderMap({location:'Nueva'}));
    await page.waitForFunction(()=>document.querySelector('[role="alert"]')?.textContent.includes('Nueva'));
    await page.evaluate(()=>window.finishOld({success:true,lat:0,lng:0,displayName:'Antigua'}));
    await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,50)));
    assert.equal(await saveVisible(), false);
    assert.match(await page.$eval('#root', el=>el.textContent), /Centro: Hermosillo, Sonora/);
  });
  await t.test('competition success stays read-only and statewide reset invalidates results', async () => {
    await page.evaluate(() => {
      window.geo=async q=>({success:true,lat:20,lng:-100,displayName:q});
      window.market=async()=>({success:true,competidores:[]});
      window.renderMap({location:'Ciudad válida',mode:'competition'});
    });
    await waitSave();
    await page.evaluate(()=>window.renderMap({location:'Ciudad válida',mode:'competition',readOnly:true}));
    await page.waitForFunction(()=>!document.querySelector('button[title="Buscar competidores"]'));
    assert.equal(await saveVisible(), false);
    await page.evaluate(()=>window.renderMap({location:'Ciudad válida',mode:'competition'}));
    await waitSave();
    await page.click('button[title="Corredor Minero e Industrial de Sonora"]');
    assert.equal(await saveVisible(), false);
  });
  assert.deepEqual(errors, []);
});
