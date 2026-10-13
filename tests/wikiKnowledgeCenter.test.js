/**
 * @file wikiKnowledgeCenter.test.js
 * @description Suite de pruebas automatizadas para el Centro de Conocimiento Wiki de OBP.
 * Valida categorías canónicas, integridad de artículos, cobertura metodológica
 * (Empresas Cuánticas, 12 Marcos Canónicos, Finanzas/SAGARPA, RAG) y lógica de búsqueda/filtrado.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WIKI_CATEGORIES, WIKI_ARTICLES } from '../src/data/wikiArticles.js';

describe('Wiki Knowledge Center - Catálogo Canónico y Artículos', () => {
  it('define exactamente las 5 categorías canónicas con sus propiedades obligatorias', () => {
    assert.equal(Array.isArray(WIKI_CATEGORIES), true);
    assert.equal(WIKI_CATEGORIES.length, 5);

    const keysEsperadas = ['empresas_cuanticas', 'metodologias', 'finanzas', 'rag_drivers', 'glosario'];
    const keysPresentes = WIKI_CATEGORIES.map(c => c.key);
    assert.deepEqual(keysPresentes, keysEsperadas);

    for (const cat of WIKI_CATEGORIES) {
      assert.ok(cat.key && typeof cat.key === 'string', `Categoría debe tener key string`);
      assert.ok(cat.name && typeof cat.name === 'string', `Categoría ${cat.key} debe tener name`);
      assert.ok(cat.icon && typeof cat.icon === 'string', `Categoría ${cat.key} debe tener icon`);
      assert.ok(cat.color && typeof cat.color === 'string', `Categoría ${cat.key} debe tener color`);
      assert.ok(cat.description && typeof cat.description === 'string', `Categoría ${cat.key} debe tener description`);
    }
  });

  it('valida que todos los artículos tengan estructura completa y no existan IDs duplicados', () => {
    assert.equal(Array.isArray(WIKI_ARTICLES), true);
    assert.ok(WIKI_ARTICLES.length >= 7, 'Debe haber al menos 7 artículos canónicos documentados');

    const idSet = new Set();
    const categoriasValidas = new Set(WIKI_CATEGORIES.map(c => c.key));

    for (const art of WIKI_ARTICLES) {
      assert.ok(art.id && typeof art.id === 'string', 'Artículo debe tener ID string');
      assert.ok(!idSet.has(art.id), `ID de artículo duplicado: ${art.id}`);
      idSet.add(art.id);

      assert.ok(art.title && typeof art.title === 'string', `Artículo ${art.id} debe tener title`);
      assert.ok(categoriasValidas.has(art.category), `Artículo ${art.id} tiene categoría inválida: ${art.category}`);
      assert.ok(Array.isArray(art.tags) && art.tags.length > 0, `Artículo ${art.id} debe tener tags`);
      assert.ok(art.readTime && typeof art.readTime === 'string', `Artículo ${art.id} debe tener readTime`);
      assert.ok(art.author && typeof art.author === 'string', `Artículo ${art.id} debe tener author`);
      assert.ok(art.excerpt && typeof art.excerpt === 'string', `Artículo ${art.id} debe tener excerpt`);
      assert.ok(art.content && typeof art.content === 'string' && art.content.length > 200, `Artículo ${art.id} debe tener contenido sustantivo (>200 caracteres)`);
    }
  });

  it('contiene los artículos obligatorios de la metodología Empresas Cuánticas (Fondo Thoth AC)', () => {
    const artAtomico = WIKI_ARTICLES.find(a => a.id === 'empresas-cuanticas-modelo-atomico');
    assert.ok(artAtomico, 'Debe existir el artículo sobre el Modelo Atómico de 3 Áreas');
    assert.equal(artAtomico.category, 'empresas_cuanticas');
    assert.ok(artAtomico.content.includes('Modelo Atómico de 3 Áreas'));
    assert.ok(artAtomico.content.includes('Finanzas'));
    assert.ok(artAtomico.content.includes('Operaciones'));
    assert.ok(artAtomico.content.includes('Administración'));
    assert.ok(artAtomico.content.includes('Fondo Thoth AC'));

    const artDelegacion = WIKI_ARTICLES.find(a => a.id === 'principio-delegacion-cuantica');
    assert.ok(artDelegacion, 'Debe existir el artículo sobre delegación cuántica');
    assert.equal(artDelegacion.category, 'empresas_cuanticas');
    assert.ok(artDelegacion.content.includes('Principio de Delegación'));
    assert.ok(artDelegacion.content.includes('Matriz de Complementariedad'));
    assert.ok(artDelegacion.content.includes('Empresas Cuánticas'));
  });

  it('contiene la documentación de las 12 metodologías canónicas y sus marcos de trabajo', () => {
    const artMetodologias = WIKI_ARTICLES.find(a => a.id === 'guia-12-metodologias');
    assert.ok(artMetodologias, 'Debe existir el artículo guía sobre las 12 metodologías canónicas');
    assert.equal(artMetodologias.category, 'metodologias');
    
    // Verificar que documenta los marcos canónicos esenciales
    const marcosEsperados = ['Plan Maestro', 'ZOPP', 'Lean Startup', 'Hoshin Kanri', 'Amoeba Management', 'Horizon Europe'];
    for (const marco of marcosEsperados) {
      assert.ok(artMetodologias.content.includes(marco), `El artículo debe documentar el marco ${marco}`);
    }

    const artZopp = WIKI_ARTICLES.find(a => a.id === 'zopp-marco-logico-explicado');
    assert.ok(artZopp, 'Debe existir el artículo especializado sobre ZOPP y Marco Lógico');
    assert.equal(artZopp.category, 'metodologias');
    assert.ok(artZopp.content.includes('Árbol de Problemas'));
    assert.ok(artZopp.content.includes('Marco Lógico'));
  });

  it('contiene la guía matemática de Finanzas y Formulación SAGARPA', () => {
    const artFinanzas = WIKI_ARTICLES.find(a => a.id === 'matematicas-financieras-wacc-van-tir');
    assert.ok(artFinanzas, 'Debe existir el artículo de fórmulas financieras maestras');
    assert.equal(artFinanzas.category, 'finanzas');
    assert.ok(artFinanzas.content.includes('WACC'));
    assert.ok(artFinanzas.content.includes('VAN'));
    assert.ok(artFinanzas.content.includes('TIR'));
    assert.ok(artFinanzas.content.includes('Payback'));

    const artPuntoEq = WIKI_ARTICLES.find(a => a.id === 'punto-equilibrio-analisis-sensibilidad');
    assert.ok(artPuntoEq, 'Debe existir el artículo de punto de equilibrio y sensibilidad');
    assert.equal(artPuntoEq.category, 'finanzas');
    assert.ok(artPuntoEq.content.includes('Punto de Equilibrio'));
    assert.ok(artPuntoEq.content.includes('Tornado'));
  });

  it('contiene el artículo de RAG y Ficha de Drivers con trazabilidad matemática', () => {
    const artRag = WIKI_ARTICLES.find(a => a.id === 'ficha-drivers-anti-alucinaciones');
    assert.ok(artRag, 'Debe existir el artículo de RAG y drivers');
    assert.equal(artRag.category, 'rag_drivers');
    assert.ok(artRag.tags.includes('Anti-alucinaciones') || artRag.tags.includes('RAG'));
    assert.ok(artRag.content.includes('Ficha de Drivers Canónicos'));
    assert.ok(artRag.content.includes('Cero Números Huérfanos'));
  });

  it('contiene el glosario canónico con términos y acrónimos fundamentales', () => {
    const artGlosario = WIKI_ARTICLES.find(a => a.id === 'glosario-acronimos-empresariales');
    assert.ok(artGlosario, 'Debe existir el artículo de glosario y acrónimos');
    assert.equal(artGlosario.category, 'glosario');
    const terminosClave = ['CAPEX', 'OPEX', 'TRL', 'DNSH', 'SCIAN', 'DENUE', 'EBITDA'];
    for (const termino of terminosClave) {
      assert.ok(artGlosario.content.includes(termino), `El glosario debe contener el término ${termino}`);
    }
  });

  it('permite el filtrado correcto de artículos por categoría', () => {
    const filtrarPorCategoria = (catKey) => {
      if (!catKey || catKey === 'all') return WIKI_ARTICLES;
      return WIKI_ARTICLES.filter(a => a.category === catKey);
    };

    const artsCuanticas = filtrarPorCategoria('empresas_cuanticas');
    assert.ok(artsCuanticas.length >= 2);
    assert.ok(artsCuanticas.every(a => a.category === 'empresas_cuanticas'));

    const artsFinanzas = filtrarPorCategoria('finanzas');
    assert.ok(artsFinanzas.length >= 2);
    assert.ok(artsFinanzas.every(a => a.category === 'finanzas'));

    const todos = filtrarPorCategoria('all');
    assert.equal(todos.length, WIKI_ARTICLES.length);
  });

  it('permite la búsqueda reactiva por término en título, tags, excerpt y contenido', () => {
    const buscarArticulos = (termino) => {
      const q = (termino || '').toLowerCase().trim();
      if (!q) return WIKI_ARTICLES;
      return WIKI_ARTICLES.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q)) ||
        a.content.toLowerCase().includes(q)
      );
    };

    const resWacc = buscarArticulos('WACC');
    assert.ok(resWacc.length >= 1, 'Debe encontrar artículos al buscar WACC');
    assert.ok(resWacc.some(a => a.id === 'matematicas-financieras-wacc-van-tir'));

    const resZopp = buscarArticulos('ZOPP');
    assert.ok(resZopp.length >= 1, 'Debe encontrar artículos al buscar ZOPP');
    assert.ok(resZopp.some(a => a.id === 'zopp-marco-logico-explicado'));

    const resInexistente = buscarArticulos('palabra_imposible_xyz_12345');
    assert.equal(resInexistente.length, 0, 'No debe arrojar resultados para términos inexistentes');
  });
});
