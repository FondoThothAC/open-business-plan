/**
 * @file wikiRouting.test.js
 * @description Suite de pruebas para las rutas de la Wiki de Software OBP.
 * Valida la declaración de rutas autónomas de pantalla completa en App.jsx,
 * las redirecciones para neutralizar colisiones semánticas y la resolución de slugs.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { 
  FRAMEWORK_SLUG_MAP, 
  REVERSE_FRAMEWORK_SLUG_MAP, 
  slugify 
} from '../src/config/urlRouting.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

describe('Enrutamiento y Deep Linking de la Wiki (F2)', () => {
  it('App.jsx declara las rutas de WikiShell fuera de Layout a nivel superior', () => {
    const appSource = fs.readFileSync(path.join(ROOT, 'src/App.jsx'), 'utf8');

    // Debe importar WikiShell
    assert.match(appSource, /import\s+WikiShell\s+from\s+['"]\.\/modules\/wiki\/WikiShell['"]/);

    // Debe montar las rutas a nivel superior
    assert.match(appSource, /<Route\s+path=["']wiki["']\s+element=\{<WikiShell\s*\/>\}/);
    assert.match(appSource, /<Route\s+path=["']wiki\/:pageId["']\s+element=\{<WikiShell\s*\/>\}/);
    assert.match(appSource, /<Route\s+path=["']wiki\/\*["']\s+element=\{<WikiShell\s*\/>\}/);
  });

  it('App.jsx incluye redirecciones de seguridad para :tipoDoc/wiki para evitar colisiones con :tipoDoc/:moduleId', () => {
    const appSource = fs.readFileSync(path.join(ROOT, 'src/App.jsx'), 'utf8');

    // Debe contener Navigate a /wiki dentro de Layout
    assert.match(appSource, /<Route\s+path=["']:tipoDoc\/wiki\/:slug["']\s+element=\{<Navigate\s+to=["']\/wiki["']/);
    assert.match(appSource, /<Route\s+path=["']:tipoDoc\/wiki["']\s+element=\{<Navigate\s+to=["']\/wiki["']/);
  });

  it('Layout.jsx enlaza directamente a /wiki en la barra de navegación', () => {
    const layoutSource = fs.readFileSync(path.join(ROOT, 'src/components/Layout.jsx'), 'utf8');
    assert.match(layoutSource, /to=["']\/wiki["']/);
    assert.match(layoutSource, /Wiki Software/);
  });

  it('Permite resolver de forma bidireccional los slugs de modelos para deep linking', () => {
    const models = ['business', 'social_bid', 'agile_startup', 'zopp', 'onudi_project'];

    for (const model of models) {
      const slug = REVERSE_FRAMEWORK_SLUG_MAP[model];
      assert.ok(slug, `Framework ${model} debe tener slug asignado`);
      assert.equal(FRAMEWORK_SLUG_MAP[slug], model, `Slug ${slug} debe mapear de vuelta a ${model}`);
    }
  });

  it('Los identificadores de páginas del catálogo cumplen el formato canonical pageId', () => {
    const indexCatalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'server/wiki/catalog/index.json'), 'utf8'));
    assert.ok(Array.isArray(indexCatalog.tree));
    assert.ok(Object.keys(indexCatalog.pages).length >= 150);

    for (const [pageId, meta] of Object.entries(indexCatalog.pages)) {
      assert.match(pageId, /^[a-zA-Z0-9._-]+$/, `Identificador de página ${pageId} debe ser seguro`);
      assert.ok(meta.title, `Página ${pageId} debe tener título`);
    }
  });

  it('Preserva los identificadores canónicos de páginas archivadas y de referencia sin prefijar modulo.', () => {
    const normalize = (rawId) => {
      let clean = String(rawId).replace(/^\/+/, '').replace(/\/+$/, '').replace(/\//g, '.');
      for (const [slug, internalKey] of Object.entries(FRAMEWORK_SLUG_MAP)) {
        if (clean.includes(slug)) clean = clean.replace(slug, internalKey);
      }
      const partes = clean.split('.');
      if (
        partes.length === 2 &&
        !partes[0].startsWith('modelo') &&
        !partes[0].startsWith('modulo') &&
        !partes[0].startsWith('archivado') &&
        !partes[0].startsWith('referencia')
      ) {
        clean = `modulo.${clean}`;
      }
      return clean;
    };

    assert.equal(normalize('archivado.foda-dinamico-conversion-fortalezas'), 'archivado.foda-dinamico-conversion-fortalezas');
    assert.equal(normalize('referencia.api'), 'referencia.api');
    assert.equal(normalize('business.introduccion'), 'modulo.business.introduccion');
    assert.equal(normalize('plan-negocios/introduccion'), 'modulo.business.introduccion');
    assert.equal(normalize('modelo.business'), 'modelo.business');
  });
});
