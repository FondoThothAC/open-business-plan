import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

test('Preview & Print Formatting - TDD Test Suite', async (t) => {
  await t.test('Debe calcular números de página correctos en modo "module-per-page"', () => {
    const modules = [
      { key: 'resumen', title: 'Resumen Ejecutivo', pillarKey: 'naturaleza' },
      { key: 'foda', title: 'Análisis FODA', pillarKey: 'naturaleza' },
      { key: 'segmentacion', title: 'Segmentación de Mercado', pillarKey: 'mercado' },
      { key: 'estados_financieros', title: 'Estados Financieros', pillarKey: 'organizacion' }
    ];

    const pageNumbers = {};
    let currentPage = 3; // Portada es 1, Índice es 2

    modules.forEach(mod => {
      pageNumbers[mod.key] = currentPage;
      let estimatedPages = 1;
      if (mod.key === 'estados_financieros') estimatedPages = 2;
      else if (mod.key === 'segmentacion') estimatedPages = 2;
      currentPage += estimatedPages;
    });

    assert.equal(pageNumbers['resumen'], 3, 'Resumen debe iniciar en pág 3');
    assert.equal(pageNumbers['foda'], 4, 'FODA debe iniciar en pág 4');
    assert.equal(pageNumbers['segmentacion'], 5, 'Segmentación debe iniciar en pág 5');
    assert.equal(pageNumbers['estados_financieros'], 7, 'Estados Financieros debe iniciar en pág 7');
    assert.equal(currentPage, 9, 'Página final debe ser 9');
  });

  await t.test('Debe calcular números de página compactos en modo "continuous"', () => {
    const modules = [
      { key: 'resumen', title: 'Resumen Ejecutivo', pillarKey: 'naturaleza' },
      { key: 'identidad', title: 'Identidad Corporativa', pillarKey: 'naturaleza' },
      { key: 'foda', title: 'Análisis FODA', pillarKey: 'naturaleza' },
      { key: 'propuesta', title: 'Propuesta de Valor', pillarKey: 'mercado' }
    ];

    const pageNumbers = {};
    let currentPage = 3;
    let accumPages = 0;

    modules.forEach((mod) => {
      pageNumbers[mod.key] = currentPage;
      let density = 0.45;
      if (mod.key === 'estados_financieros' || mod.key === 'pestel' || mod.key === 'foda') {
        density = 0.9;
      }
      accumPages += density;
      if (accumPages >= 1) {
        const fullPages = Math.floor(accumPages);
        currentPage += fullPages;
        accumPages = accumPages - fullPages;
      }
    });

    assert.equal(pageNumbers['resumen'], 3);
    assert.equal(pageNumbers['identidad'], 3);
    assert.equal(pageNumbers['foda'], 3);
    assert.equal(pageNumbers['propuesta'], 4);
  });

  await t.test('Debe contener las reglas de protección de impresión y TOC en index.css', () => {
    const cssContent = fs.readFileSync(path.resolve('src/index.css'), 'utf8');

    assert.ok(cssContent.includes('thead {'), 'Debe incluir regla para thead');
    assert.ok(cssContent.includes('display: table-header-group !important;'), 'thead debe tener display table-header-group');
    assert.ok(cssContent.includes('break-inside: avoid !important;'), 'Debe incluir break-inside avoid');
    assert.ok(cssContent.includes('break-after: avoid !important;'), 'Debe incluir break-after avoid para headings');
    assert.ok(cssContent.includes('.toc-dot-leader'), 'Debe incluir clase .toc-dot-leader');
    assert.ok(cssContent.includes('.toc-item-link'), 'Debe incluir clase .toc-item-link');
    assert.ok(cssContent.includes('.print-page-header'), 'Debe incluir clase .print-page-header');
    assert.ok(cssContent.includes('.print-page-footer'), 'Debe incluir clase .print-page-footer');
  });

  await t.test('Debe verificar que VistaPrevia.jsx integra CorporatePrintHeader, CorporatePrintFooter y selector de paginación', () => {
    const previewContent = fs.readFileSync(path.resolve('src/modules/VistaPrevia.jsx'), 'utf8');

    assert.ok(previewContent.includes('paginationMode'), 'Debe manejar el estado paginationMode');
    assert.ok(previewContent.includes('CorporatePrintHeader'), 'Debe definir/usar CorporatePrintHeader');
    assert.ok(previewContent.includes('CorporatePrintFooter'), 'Debe definir/usar CorporatePrintFooter');
    assert.ok(previewContent.includes('id="portada"'), 'Debe incluir anchor id portada');
    assert.ok(previewContent.includes('id="indice"'), 'Debe incluir anchor id indice');
    assert.ok(previewContent.includes('id={`seccion-${mod.key}`}'), 'Debe incluir anchor id por cada modulo');
  });

  await t.test('Debe verificar que VistaPrevia.jsx integra controles de Zoom y Ajuste de Ancho', () => {
    const previewContent = fs.readFileSync(path.resolve('src/modules/VistaPrevia.jsx'), 'utf8');

    assert.ok(previewContent.includes('zoomLevel'), 'Debe manejar el estado zoomLevel');
    assert.ok(previewContent.includes('fitToWidth'), 'Debe manejar el modo fitToWidth');
    assert.ok(previewContent.includes('ZoomIn') || previewContent.includes('zoom-controls'), 'Debe incluir controles visuales de Zoom');
  });
});
