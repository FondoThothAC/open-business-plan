import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getBoxNumber,
  getBoxBadgeLabel,
  resolveBoxKey,
  appendBoxVersion,
  getBoxHistory,
  recordValidatedFactAsEvidence
} from '../src/lib/boxIdManager.js';
import { buildEvidenceContext, normalizeDocument } from '../src/lib/evidenceContext.js';

test('TDD: boxIdManager resuelve Box 512 a box_layout_industrial', () => {
  assert.equal(getBoxNumber('box_layout_industrial'), 512);
  assert.equal(getBoxBadgeLabel('box_layout_industrial'), '#BOX-512');
  
  assert.equal(resolveBoxKey('512'), 'box_layout_industrial');
  assert.equal(resolveBoxKey('box 512'), 'box_layout_industrial');
  assert.equal(resolveBoxKey('#BOX-512'), 'box_layout_industrial');
  assert.equal(resolveBoxKey('layout industrial'), 'box_layout_industrial');
  assert.equal(resolveBoxKey('distribucion de planta'), 'box_layout_industrial');
});

test('TDD: boxIdManager gestiona el historial de versiones con autor y diff', () => {
  const planData = { config: { boxHistory: {} } };

  const v1 = appendBoxVersion(planData, {
    boxKey: 'box_layout_industrial',
    author: 'viktoracuna',
    isAi: true,
    promptUsed: 'Generar distribución preliminar',
    changeReason: 'Generación inicial'
  });

  assert.equal(v1.version, 1);
  assert.equal(v1.author, 'viktoracuna');
  assert.equal(v1.isAi, true);

  const v2 = appendBoxVersion(planData, {
    boxKey: 'box_layout_industrial',
    author: 'karely_otero',
    isAi: false,
    changeReason: 'Corrección: residencia arriba y taller abajo'
  });

  assert.equal(v2.version, 2);
  assert.equal(v2.author, 'karely_otero');
  assert.equal(v2.isAi, false);

  const history = getBoxHistory(planData, 'box_layout_industrial');
  assert.equal(history.length, 2);
  assert.equal(history[0].version, 1);
  assert.equal(history[1].version, 2);
});

test('TDD: Correction-as-Evidence inyecta hechos validados en documents RAG con prioridad', () => {
  const planData = {
    config: {
      projectId: 'closets_y_cocinas_corona',
      documents: []
    }
  };

  const factDoc = recordValidatedFactAsEvidence(planData, {
    fact: 'La residencia familiar está en planta alta y la carpintería en planta baja; consumo CFE conjunto de $6,000 MXN sin medidor comercial',
    boxKey: 'box_layout_industrial',
    author: 'viktoracuna'
  });

  assert.ok(factDoc);
  assert.equal(factDoc.classification, 'project_evidence');
  assert.equal(factDoc.isImmutableConstraint, true);
  assert.ok(factDoc.content.includes('#BOX-512'));
  assert.ok(factDoc.content.includes('residencia familiar está en planta alta'));

  // Verificar que buildEvidenceContext prioriza esta restricción inmutable
  const evidenceContext = buildEvidenceContext(planData, 'distribución planta cfe');
  assert.ok(evidenceContext.includes('RESTRICCIÓN Y HECHO INVIOLABLE VALIDADO'));
  assert.ok(evidenceContext.includes('#BOX-512'));
});

test('TDD: normalizeDocument maneja document.content y clasifica audio/entrevista como project_evidence', () => {
  const doc = {
    name: 'entrevista_estructurada_rag.md',
    content: 'Contenido estructurado en 6 núcleos temáticos con María Alejandra Aray',
    isImmutableConstraint: true
  };

  const normalized = normalizeDocument(doc, 'closets_y_cocinas_corona');
  assert.equal(normalized.classification, 'project_evidence');
  assert.equal(normalized.isImmutableConstraint, true);
  assert.equal(normalized.text, 'Contenido estructurado en 6 núcleos temáticos con María Alejandra Aray');
});
