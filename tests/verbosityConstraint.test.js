import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVerbosityConstraint, getFieldFormatGuidance } from '../src/lib/verbosityManager.js';

test('TDD-28: Verbosity Manager & Adaptive Length Constraints', async (t) => {
  await t.test('debe generar directivas concisas para modo conciso', () => {
    const constraint = buildVerbosityConstraint('conciso', 'resumen');
    assert.ok(constraint.includes('Conciso') || constraint.includes('conciso'));
    assert.ok(constraint.includes('viñetas') || constraint.includes('bullet'));
    assert.ok(constraint.includes('60') || constraint.includes('80') || constraint.includes('palabras'));
  });

  await t.test('debe forzar formato ultra-conciso para Canvas sin importar el nivel global', () => {
    const constraintCanvas = buildVerbosityConstraint('detallado', 'canvas');
    assert.ok(constraintCanvas.includes('CANVAS') || constraintCanvas.includes('Canvas'));
    assert.ok(constraintCanvas.includes('viñetas') || constraintCanvas.includes('bullet'));
    assert.ok(constraintCanvas.includes('3 a 5') || constraintCanvas.includes('ultra-conciso'));
  });

  await t.test('debe generar directivas equilibradas para modo normal', () => {
    const constraintNormal = buildVerbosityConstraint('normal', 'organizacion');
    assert.ok(constraintNormal.includes('Normal') || constraintNormal.includes('Equilibrado') || constraintNormal.includes('párrafo'));
    assert.ok(constraintNormal.includes('120') || constraintNormal.includes('180') || constraintNormal.includes('palabras'));
  });

  await t.test('debe generar directivas profundas para modo detallado/extenso', () => {
    const constraintExtenso = buildVerbosityConstraint('detallado', 'mercado');
    assert.ok(constraintExtenso.includes('Extenso') || constraintExtenso.includes('profundo') || constraintExtenso.includes('académico'));
  });

  await t.test('getFieldFormatGuidance debe devolver instrucciones específicas por campo y módulo', () => {
    const guidanceConciso = getFieldFormatGuidance({ key: 'mision', type: 'text' }, 'conciso', 'naturaleza');
    assert.ok(guidanceConciso.includes('conciso') || guidanceConciso.includes('viñetas'));

    const guidanceCanvas = getFieldFormatGuidance({ key: 'socios_clave', type: 'text' }, 'normal', 'canvas');
    assert.ok(guidanceCanvas.includes('viñetas') || guidanceCanvas.includes('3 a 5'));

    const guidanceMermaid = getFieldFormatGuidance({ key: 'organigrama', type: 'mermaid' }, 'conciso', 'organizacion');
    assert.ok(guidanceMermaid.includes('Mermaid.js'));
  });
});
