/**
 * tests/deepSeekHarnessAndResearch.test.js
 * Suite TDD: DeepSeek Harness dsh v0.1 (Cordis Meta-Kernel), Replay, Forking y Deep Research Resiliente
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { TrajectoryRecorder } from '../src/lib/agenticEngine.js';
import { runDeepResearch } from '../src/lib/tools/deepResearchEngine.js';
import { AGENT_TOOLS_MANIFEST, executeAgentTool } from '../src/lib/agentTools.js';

test('DeepSeek Harness dsh v0.1 - TrajectoryRecorder & Cordis Spec', async (t) => {
  await t.test('Debe inicializar sesión con especificación dsh v0.1 y metadatos Cordis', () => {
    const recorder = new TrajectoryRecorder('task_dsh_001', {
      pillar: 'mercado',
      moduleKey: 'demanda',
      title: 'Estudio de Demanda',
      model: 'gpt-5.2',
      provider: 'bai',
      mode: 'code'
    });

    const harness = recorder.exportHarness();
    assert.ok(harness.harnessVersion === 'harness-v0.1' || harness.harnessVersion === 'dsh-session-v0.1');
    assert.equal(harness.id, 'task_dsh_001');
    assert.equal(harness.mode, 'code');
    assert.ok(Array.isArray(harness.pluginsLoaded), 'Debe incluir lista de plugins Cordis cargados');
    assert.ok(harness.cordisContext, 'Debe incluir contexto de ejecución Cordis');
  });

  await t.test('Debe permitir bifurcar (Fork) una trayectoria desde un nodo específico conservando el linaje', () => {
    const recorder = new TrajectoryRecorder('task_fork_base', {
      pillar: 'finanzas',
      moduleKey: 'capex',
      title: 'Inversión Inicial'
    });

    recorder.addStep('thought', { title: 'Paso 1: Análisis Inicial', content: 'Evaluando requerimientos' });
    recorder.addStep('tool_call', { title: 'Paso 2: Cotización', toolName: 'tool_machinery_search' });
    recorder.addStep('observation', { title: 'Paso 3: Datos Recibidos', content: 'Cotizaciones listas' });

    // Bifurcar desde el nodo 2
    const forkedRecorder = recorder.forkAtNode('node_2', {
      newModel: 'qwen3.8-flash',
      newProvider: 'bai',
      branchNote: 'Bifurcación para simular maquinaria alternativa'
    });

    const forkedHarness = forkedRecorder.exportHarness();
    assert.equal(forkedHarness.parentSessionId, 'task_fork_base');
    assert.equal(forkedHarness.forkedFromNodeId, 'node_2');
    assert.equal(forkedHarness.stepsCount, 2, 'Debe heredar exactamente los primeros 2 pasos');
    assert.equal(forkedHarness.modelUsed, 'qwen3.8-flash');
  });

  await t.test('Debe generar timeline cronológico ordenado para Replay paso a paso', () => {
    const recorder = new TrajectoryRecorder('task_replay_test');
    recorder.addStep('thought', { title: 'T1', durationMs: 100 });
    recorder.addStep('tool_call', { title: 'TC1', durationMs: 250 });
    recorder.addStep('observation', { title: 'OB1', durationMs: 150 });
    recorder.finish({ resultado: 'ok' }, 'completed');

    const timeline = recorder.getReplayTimeline();
    assert.equal(timeline.length, 4, '3 pasos + 1 síntesis de finalización');
    assert.equal(timeline[0].type, 'thought');
    assert.equal(timeline[1].type, 'tool_call');
    assert.equal(timeline[3].type, 'synthesis');
    assert.ok(timeline[0].relativeStartTimeMs >= 0);
  });
});

test('Deep Research Online Resiliente & Tool Registration', async (t) => {
  await t.test('tool_deep_research debe estar debidamente registrada en AGENT_TOOLS_MANIFEST', () => {
    const manifest = AGENT_TOOLS_MANIFEST.find(t => t.name === 'tool_deep_research');
    assert.ok(manifest, 'tool_deep_research debe existir en el manifiesto');
    assert.ok(manifest.parameters.properties.query, 'Debe requerir parámetro query');
    assert.ok(manifest.parameters.properties.depth, 'Debe soportar parámetro depth');
  });

  await t.test('runDeepResearch debe ejecutar con capa gratuita si no hay keys premium y retornar estructura completa', async () => {
    const res = await runDeepResearch({
      query: 'Mercado de cafeterías artesanales en Monterrey',
      domain: 'mercado',
      depth: 'rapido',
      forcePaidTier: false,
      apiKeys: {}
    });

    assert.equal(res.success, true);
    assert.ok(res.data, 'Debe contener datos estructurados');
    assert.ok(Array.isArray(res.data.sources), 'Debe incluir lista de fuentes');
    assert.ok(res.data.summary, 'Debe incluir resumen sintético');
    assert.equal(res.data.status, 'completed');
  });

  await t.test('runDeepResearch debe detectar pausas por cuota y emitir estado paused_waiting_quota', async () => {
    // Simular investigación con cuota agotada
    const res = await runDeepResearch({
      query: 'Precios de excavadoras CAT 320 en México',
      domain: 'maquinaria',
      depth: 'profundo',
      forcePaidTier: true,
      simulateQuotaExhausted: true,
      apiKeys: { tavilyKey: 'fake_exhausted_key' }
    });

    assert.equal(res.success, true);
    assert.equal(res.data.status, 'paused_waiting_quota');
    assert.ok(res.data.resumeAfterMs > 0, 'Debe calcular tiempo estimado de espera para reanudación');
  });

  await t.test('executeAgentTool debe invocar tool_deep_research exitosamente', async () => {
    const toolResult = await executeAgentTool('tool_deep_research', {
      query: 'Proveedores de empaques biodegradables',
      domain: 'mercado',
      depth: 'rapido'
    });

    assert.equal(toolResult.success, true);
    assert.equal(toolResult.toolName, 'tool_deep_research');
    assert.ok(toolResult.data);
  });
});
