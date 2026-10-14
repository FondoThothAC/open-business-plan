/**
 * @file wikiCatalog.test.js
 * @description Contrato del catálogo generado del Wiki de Software OBP.
 * El catálogo NO se escribe a mano: se deriva de frameworks.js, field_guides.js,
 * boxRegistry.js, moduleBoxMap.js y docs/. Estas pruebas fallan si esas fuentes
 * cambian y la wiki deja de decir la verdad.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { build, METHODOLOGY_DOCS, latexToUnicode, ROOT } from '../scripts/generate-wiki-catalog.js';
import { FRAMEWORKS } from '../src/config/frameworks.js';
import { FIELD_GUIDES_MAP } from '../src/lib/field_guides.js';
import { BOX_REGISTRY } from '../src/config/boxRegistry.js';

const { catalog, pages } = build();

const modulePages = pages.filter((p) => p.kind === 'modulo');
const modelPages = pages.filter((p) => p.kind === 'modelo');

/** Todos los pageId enlazados por el árbol, a cualquier profundidad. */
function leafPageIds(nodes, acc = []) {
  for (const node of nodes) {
    if (node.pageId) acc.push(node.pageId);
    if (node.children) leafPageIds(node.children, acc);
  }
  return acc;
}

describe('Wiki de software — catálogo generado desde el código', () => {
  it('cuenta exactamente lo que declaran las fuentes, sin cifras escritas a mano', () => {
    const pilaresReales = Object.values(FRAMEWORKS).reduce((a, fw) => a + fw.pillars.length, 0);
    const modulosReales = Object.values(FRAMEWORKS).reduce(
      (a, fw) => a + fw.pillars.reduce((p, i) => p + i.modules.length, 0), 0);
    const camposReales = Object.values(FRAMEWORKS).reduce(
      (a, fw) => a + fw.pillars.reduce((p, i) => p + i.modules.reduce((m, mod) => m + mod.fields.length, 0), 0), 0);
    const cajasReales = Object.values(BOX_REGISTRY).reduce((a, list) => a + list.length, 0);

    assert.equal(catalog.totals.models, Object.keys(FRAMEWORKS).length);
    assert.equal(catalog.totals.pillars, pilaresReales);
    assert.equal(catalog.totals.modules, modulosReales);
    assert.equal(catalog.totals.fields, camposReales);
    assert.equal(catalog.totals.boxes, cajasReales);
    assert.equal(catalog.totals.guideTypes, Object.keys(FIELD_GUIDES_MAP).length);
    assert.equal(modulePages.length, modulosReales, 'Debe haber una página por módulo');
    assert.equal(modelPages.length, Object.keys(FRAMEWORKS).length, 'Una página por modelo');
  });

  it('todo módulo documentado muestra al menos un prompt real y no vacío', () => {
    const sinPrompt = [];
    for (const page of modulePages) {
      if (page.fields.length === 0) continue; // módulos visuales: legítimo, se explica en la página
      for (const field of page.fields) {
        if (!field.prompt || field.prompt.trim().length < 12) sinPrompt.push(`${page.id}#${field.key}`);
      }
    }
    assert.deepEqual(sinPrompt, [], `Campos sin prompt aprovechable: ${sinPrompt.join(', ')}`);
  });

  it('cada campo lleva su dirección canónica con el formato de planContracts', () => {
    for (const page of modulePages) {
      for (const field of page.fields) {
        assert.equal(
          field.address,
          `${page.model}.${page.pillarKey}.${page.moduleKey}.${field.key}`,
          `Dirección canónica incorrecta en ${page.id}#${field.key}`
        );
      }
    }
  });

  it('las secciones técnicas están marcadas y el resto es visible para clientes', () => {
    const permitidas = new Set(['cliente', 'tecnico']);
    for (const page of pages) {
      assert.ok(permitidas.has(page.audience), `Página ${page.id} con audience inválida: ${page.audience}`);
      for (const section of page.sections) {
        assert.ok(permitidas.has(section.audience), `Sección ${page.id}/${section.id} con audience inválida`);
        assert.ok(section.markdown.trim().length > 0, `Sección vacía: ${page.id}/${section.id}`);
      }
    }
    const tecnicas = pages.filter((p) => p.audience === 'tecnico');
    assert.ok(tecnicas.length >= 1, 'Debe existir al menos una página solo-técnica (referencia de APIs)');
  });

  it('el árbol enlaza páginas existentes y ninguna se queda huérfana', () => {
    const enlazadas = new Set(leafPageIds(catalog.tree));
    const declaradas = new Set(Object.keys(catalog.pages));
    for (const id of enlazadas) {
      assert.ok(declaradas.has(id), `Nodo del árbol apunta a página inexistente: ${id}`);
      assert.ok(fs.existsSync(path.join(ROOT, 'server/wiki/catalog', catalog.pages[id].file)),
        `Falta el archivo de la página ${id}`);
    }
    assert.equal(enlazadas.size, declaradas.size, 'Cada página del índice debe ser alcanzable desde el árbol');
  });

  it('cada modelo enlaza un doc de metodología que existe y tiene contenido', () => {
    for (const [model, rel] of Object.entries(METHODOLOGY_DOCS)) {
      assert.ok(FRAMEWORKS[model], `METHODOLOGY_DOCS referencia un modelo inexistente: ${model}`);
      const abs = path.join(ROOT, rel);
      assert.ok(fs.existsSync(abs), `${model} apunta a un doc que no existe: ${rel}`);
      assert.ok(fs.readFileSync(abs, 'utf8').trim().length > 200, `Doc demasiado delgado para sustentar el modelo: ${rel}`);
    }
  });

  it('la referencia de APIs sale del código: rutas reales y env sin valores', () => {
    const reference = pages.find((p) => p.id === 'referencia-apis');
    assert.ok(reference, 'Falta la página de referencia de APIs');
    assert.ok(catalog.totals.routes > 100, `Se esperaban >100 rutas y se detectaron ${catalog.totals.routes}`);
    assert.ok(catalog.totals.providerHosts >= 10, 'La allowlist de proveedores de IA debe verse reflejada');
    assert.ok(reference.sections.some((s) => /\/api\//.test(s.markdown)), 'La referencia debe listar rutas /api reales');

    // Names only: ninguna variable de entorno puede arrastrar un valor.
    const env = reference.sections.find((s) => s.id === 'env').markdown;
    assert.doesNotMatch(env, /(?:KEY|TOKEN|SECRET)\s*[:=]\s*['"`]?[A-Za-z0-9]{12,}/, 'Se filtró un valor de credencial');
  });

  it('latexToUnicode deja las fórmulas legibles sin necesidad de KaTeX', () => {
    const out = latexToUnicode('$$\\text{WACC} = \\frac{E}{V} \\cdot r_e + \\frac{D}{V} \\cdot r_d \\times (1 - t)$$');
    assert.ok(!out.includes('$$'), `Quedan delimitadores LaTeX: ${out}`);
    assert.ok(!out.includes('\\text'), `Quedan comandos LaTeX: ${out}`);
    assert.match(out, /WACC/);
  });

  it('el esquema del catálogo es estable para el front', () => {
    assert.equal(catalog.schemaVersion, 'wiki-catalog-v1');
    assert.equal(typeof catalog.tree, 'object');
    for (const page of pages) {
      assert.ok(page.id && page.title && Array.isArray(page.sections), `Página mal formada: ${page.id}`);
    }
  });

  it('integra los artículos archivados de negocio sin pérdida de fórmulas ni contenido', () => {
    const archivadas = pages.filter((p) => p.kind === 'archivado');
    assert.ok(archivadas.length >= 8, 'Debe haber al menos 8 páginas archivadas');
    assert.equal(catalog.totals.archivedPages, archivadas.length);

    const artWacc = archivadas.find((p) => p.id === 'archivado.matematicas-financieras-wacc-van-tir');
    assert.ok(artWacc, 'Falta la página archivada de matemáticas financieras');
    const secContenido = artWacc.sections.find((s) => s.id === 'contenido');
    assert.ok(secContenido, 'Falta la sección de contenido en el artículo de WACC');
    assert.ok(!secContenido.markdown.includes('$$'), 'El artículo de WACC no debe contener bloques $$ sin procesar');
    assert.match(secContenido.markdown, /WACC/);

    const artCuanticas = archivadas.find((p) => p.id === 'archivado.empresas-cuanticas-modelo-atomico');
    assert.ok(artCuanticas, 'Falta la página de Empresas Cuánticas');

    const artFoda = archivadas.find((p) => p.id === 'archivado.foda-dinamico-conversion-fortalezas');
    assert.ok(artFoda, 'Falta la página archivada de FODA Dinámico');
  });

  it('declara las guías de arquitectura para superadmin en el catálogo de referencia', () => {
    const idsEsperados = ['referencia-apis', 'referencia-alta-api', 'referencia-proveedor-llm', 'referencia-extension-modulos'];
    for (const id of idsEsperados) {
      const page = pages.find((p) => p.id === id);
      assert.ok(page, `Falta la página de referencia ${id}`);
      assert.equal(page.audience, 'tecnico', `La página ${id} debe tener audience técnico`);
      assert.ok(page.sections.length >= 2, `La página ${id} debe tener al menos 2 secciones`);
    }
  });
});
