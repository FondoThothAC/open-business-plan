import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Suite TDD de regresión para el layout de impresión.
 * Verifica que los 4 problemas reportados queden resueltos:
 * 1. La barra de terminal no se imprime (no-print en TerminalDrawer)
 * 2. El CSS global oculta .no-print dentro de @media print
 * 3. El CSS usa print-color-adjust: economy (no exact) para reducir saturación
 * 4. VistaPrevia expone los selectores de orientación, paginación y margen
 */
test('Print Layout - TDD Regression Suite', async (t) => {
  const terminalDrawerPath = path.resolve('src/components/TerminalDrawer.jsx');
  const indexCssPath = path.resolve('src/index.css');
  const vistaPreviaPath = path.resolve('src/modules/VistaPrevia.jsx');

  await t.test('1. TerminalDrawer incluye clase no-print en sus contenedores raíz', () => {
    const src = fs.readFileSync(terminalDrawerPath, 'utf8');
    const occurrences = (src.match(/className="no-print"/g) || []).length;
    assert.ok(
      occurrences >= 2,
      `TerminalDrawer debe incluir className="no-print" al menos 2 veces (estado cerrado y abierto). Encontradas: ${occurrences}`
    );
  });

  await t.test('2. index.css oculta .no-print dentro de @media print', () => {
    const css = fs.readFileSync(indexCssPath, 'utf8');
    const printBlocks = css.match(/@media print\s*\{[\s\S]*?\n\}/g) || [];
    assert.ok(printBlocks.length > 0, 'index.css debe contener al menos un bloque @media print');

    const cssHasNoPrintClass = /\.no-print\b/.test(css);
    assert.ok(cssHasNoPrintClass, 'index.css debe tener la clase .no-print declarada en algún selector');

    const printBlockHasDisplayNone = printBlocks.some(block => /display\s*:\s*none\s*!important/.test(block));
    assert.ok(
      printBlockHasDisplayNone,
      'Al menos un bloque @media print debe contener una regla con display:none !important'
    );
  });

  await t.test('3. print-color-adjust usa economy (no exact) para reducir saturación', () => {
    const css = fs.readFileSync(indexCssPath, 'utf8');
    const usesExact = /print-color-adjust\s*:\s*exact/i.test(css);
    const usesEconomy = /print-color-adjust\s*:\s*economy/i.test(css);

    assert.ok(
      !usesExact,
      'index.css NO debe usar print-color-adjust: exact (causa saturación al imprimir)'
    );
    assert.ok(
      usesEconomy,
      'index.css debe usar print-color-adjust: economy para reducir saturación'
    );
  });

  await t.test('4. VistaPrevia expone selectores de orientación, paginación y margen', () => {
    const src = fs.readFileSync(vistaPreviaPath, 'utf8');
    assert.ok(src.includes('globalOrientation'), 'VistaPrevia debe declarar globalOrientation');
    assert.ok(src.includes('paginationMode'), 'VistaPrevia debe declarar paginationMode');
    assert.ok(src.includes('printMargin'), 'VistaPrevia debe declarar printMargin');
  });
});
