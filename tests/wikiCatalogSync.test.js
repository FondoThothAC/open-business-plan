/**
 * @file wikiCatalogSync.test.js
 * @description El JSON commiteado en server/wiki/catalog debe ser idéntico al que
 * producen hoy las fuentes del proyecto. Si alguien añade un módulo a frameworks.js,
 * edita un prompt en field_guides.js o toca el JSON a mano, esto rompe hasta que se
 * ejecute `npm run wiki:build`. Es la garantía de que la wiki no miente.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { build, OUT_DIR, SCHEMA_VERSION, ROOT } from '../scripts/generate-wiki-catalog.js';

const dir = path.join(ROOT, OUT_DIR);
const serialize = (obj) => `${JSON.stringify(obj, null, 2)}\n`;

describe('Wiki de software — catálogo commiteado sincronizado con el código', () => {
  it('existe el catálogo generado (ejecuta `npm run wiki:build` si falta)', () => {
    assert.ok(fs.existsSync(path.join(dir, 'index.json')),
      'Falta server/wiki/catalog/index.json: corre `npm run wiki:build`');
  });

  it('index.json coincide byte a byte con lo que producen las fuentes', () => {
    const { catalog } = build();
    const enDisco = fs.readFileSync(path.join(dir, 'index.json'), 'utf8');
    assert.equal(enDisco, serialize(catalog),
      'server/wiki/catalog/index.json está desincronizado: corre `npm run wiki:build`');
    assert.equal(JSON.parse(enDisco).schemaVersion, SCHEMA_VERSION);
  });

  it('cada página commiteada coincide con la generada, y no sobran ficheros', () => {
    const { catalog, pages } = build();
    const esperido = new Set(pages.map((p) => `pages/${p.id}.json`));

    const enDisco = new Set();
    const walk = (sub = '') => {
      for (const entry of fs.readdirSync(path.join(dir, sub), { withFileTypes: true })) {
        if (entry.isDirectory()) walk(path.join(sub, entry.name));
        else if (entry.name.endsWith('.json') && sub) enDisco.add(path.join(sub, entry.name).split(path.sep).join('/'));
      }
    };
    walk();

    assert.deepEqual(
      [...enDisco].filter((f) => !esperido.has(f)).sort(),
      [],
      'Hay páginas en disco que el generador ya no produce (¿editadas a mano?)'
    );

    const distintos = [];
    for (const page of pages) {
      const rel = `pages/${page.id}.json`;
      const enDiscoRuta = path.join(dir, rel);
      if (!fs.existsSync(enDiscoRuta)) { distintos.push(`${rel} (ausente)`); continue; }
      if (fs.readFileSync(enDiscoRuta, 'utf8') !== serialize(page)) distintos.push(rel);
      assert.equal(catalog.pages[page.id].file, rel, `El índice apunta a otro archivo para ${page.id}`);
    }
    assert.deepEqual(distintos, [], 'Páginas desincronizadas: corre `npm run wiki:build`');
  });

  it('el artefacto es determinista: nada de marcas de tiempo que inflen el diff', () => {
    const crudo = fs.readFileSync(path.join(dir, 'index.json'), 'utf8');
    assert.doesNotMatch(crudo, /"generatedAt"|"timestamp"/, 'El catálogo no debe llevar timestamps');
    assert.deepEqual(build().catalog, build().catalog);
  });
});
