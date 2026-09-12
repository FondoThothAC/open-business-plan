import test from 'node:test';
import assert from 'node:assert/strict';
import { listFrameworkContracts, buildReliableGenerationContract } from '../src/lib/planContracts.js';
import { buildEvidenceContext } from '../src/lib/evidenceContext.js';
import { validateGenerationResult } from '../src/lib/generationValidation.js';
import fs from 'fs';
import path from 'path';

test('las doce metodologías mantienen contratos para todos sus campos', () => {
  const types = ['business', 'social_bid', 'agile_startup', 'technology_id', 'micro_business', 'investment_project', 'zopp', 'horizon_europe', 'hoshin_kanri', 'amoeba_management', 'guanxi_plan', 'onudi_project'];
  const total = types.reduce((count, type) => count + listFrameworkContracts(type).length, 0);
  assert.equal(total, 394);
  assert.match(buildReliableGenerationContract({ projectId: 'p1', projectType: 'business', expectedKeys: ['mision'] }), /No inventes fuentes/);
});

test('solo evidencia del proyecto entra al contexto de IA', () => {
  const context = buildEvidenceContext({ config: { projectId: 'p1', documents: [
    { id: 'a', name: 'Evidencia', ownerProjectId: 'p1', classification: 'project_evidence', text: 'La ferretería opera en Kino.' },
    { id: 'b', name: 'Ejemplo ajeno', ownerProjectId: 'p1', classification: 'other_project_example', text: 'Planta TIF y hornos ASADHOR.' }
  ] } }, 'ferretería Kino');
  assert.match(context, /ferretería/i);
  assert.doesNotMatch(context, /ASADHOR/i);
});

test('salidas inválidas se convierten en pendientes sin contaminar campos válidos', () => {
  const result = validateGenerationResult({ result: { mision: 'Crear valor para clientes locales.', vision: 'Information not generated correctly.' }, projectType: 'business', pillar: 'naturaleza', module: 'identidad', expectedKeys: ['mision', 'vision'] });
  assert.equal(result.valid.mision, 'Crear valor para clientes locales.');
  assert.equal(result.pendings.length, 1);
  assert.equal(result.pendings[0].field, 'vision');
});

test('finanzas declara entradas faltantes antes de calcular', () => {
  const source = fs.readFileSync(path.resolve('src/lib/finanzas/calculadoraFinanciera.js'), 'utf8');
  assert.match(source, /No calculable: falta/);
  assert.doesNotMatch(source, /inversion_total, 150000/);
  assert.doesNotMatch(source, /costos_fijos, 35000/);
  assert.doesNotMatch(source, /resultados, 120000/);
});
