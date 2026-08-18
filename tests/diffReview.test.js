import test from 'node:test';
import assert from 'node:assert/strict';
import * as diff from 'diff';

/**
 * Funciones puras de lógica para el flujo de Diff y Control de Cambios
 */
export function calculateTextDiff(oldText = '', newText = '') {
  const parts = diff.diffWordsWithSpace(oldText, newText);
  let additionsCount = 0;
  let deletionsCount = 0;

  parts.forEach(part => {
    if (part.added) additionsCount++;
    if (part.removed) deletionsCount++;
  });

  return {
    parts,
    additionsCount,
    deletionsCount,
    hasChanges: additionsCount > 0 || deletionsCount > 0
  };
}

export function cleanMarkdownResponse(text = '') {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/^```markdown\s*/i, '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

export function applyDiffChange(planData, { pillar, moduleKey, fieldKey, newValue, commentKeyToClear }) {
  const updatedPlan = JSON.parse(JSON.stringify(planData));
  
  if (!updatedPlan[pillar]) updatedPlan[pillar] = {};
  if (!updatedPlan[pillar][moduleKey]) updatedPlan[pillar][moduleKey] = {};
  
  updatedPlan[pillar][moduleKey][fieldKey] = newValue;

  // Si hay comentarios asociados a este campo que fueron atendidos, los limpiamos
  if (commentKeyToClear && updatedPlan.config?.comments?.[commentKeyToClear]) {
    delete updatedPlan.config.comments[commentKeyToClear];
  }

  return updatedPlan;
}

test('Diff Review & Control de Cambios - TDD Test Suite', async (t) => {
  await t.test('Debe calcular diferencias precisas identificando palabras agregadas y eliminadas', () => {
    const original = 'Nuestro mercado objetivo son jóvenes de 18 a 25 años en México.';
    const propuesto = 'Nuestro mercado objetivo son profesionales jóvenes de 22 a 35 años en México y Latinoamérica.';

    const diffResult = calculateTextDiff(original, propuesto);

    assert.equal(diffResult.hasChanges, true, 'Debe detectar cambios');
    assert.ok(diffResult.additionsCount > 0, 'Debe registrar inserciones');
    assert.ok(diffResult.deletionsCount > 0, 'Debe registrar eliminaciones');

    const addedParts = diffResult.parts.filter(p => p.added).map(p => p.value);
    assert.ok(addedParts.some(val => val.includes('profesionales')), 'Debe contener la palabra agregada profesionales');
  });

  await t.test('Debe limpiar bloques de código markdown devueltos por LLMs', () => {
    const rawFromLlm = '```markdown\n# Propuesta de Valor\nSolución integral automatizada.\n```';
    const cleaned = cleanMarkdownResponse(rawFromLlm);

    assert.equal(cleaned, '# Propuesta de Valor\nSolución integral automatizada.');
  });

  await t.test('Debe aplicar el cambio al plan y limpiar comentarios atendidos al aceptar', () => {
    const initialPlan = {
      naturaleza: {
        introduccion: {
          propuesta_valor: 'Texto inicial'
        }
      },
      config: {
        comments: {
          'naturaleza.introduccion.propuesta_valor': [
            { id: 1, author: 'Roberto', text: 'Hacer énfasis en B2B' }
          ]
        }
      }
    };

    const updated = applyDiffChange(initialPlan, {
      pillar: 'naturaleza',
      moduleKey: 'introduccion',
      fieldKey: 'propuesta_valor',
      newValue: 'Texto refinado enfocado en B2B',
      commentKeyToClear: 'naturaleza.introduccion.propuesta_valor'
    });

    assert.equal(updated.naturaleza.introduccion.propuesta_valor, 'Texto refinado enfocado en B2B');
    assert.equal(updated.config.comments['naturaleza.introduccion.propuesta_valor'], undefined, 'El comentario atendido debe eliminarse');
  });
});
