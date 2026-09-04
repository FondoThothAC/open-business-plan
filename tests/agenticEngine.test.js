import { describe, it } from 'node:test';
import assert from 'node:assert';
import { executeAgentTool, AGENT_TOOLS_MANIFEST } from '../src/lib/agentTools.js';
import { TrajectoryRecorder } from '../src/lib/agenticEngine.js';

describe('CELIS Agentic Engine & DeepSeek Harness Trajectories - TDD Test Suite', () => {
  it('Debe exponer el manifiesto completo de herramientas agénticas', () => {
    assert.ok(Array.isArray(AGENT_TOOLS_MANIFEST), 'El manifiesto debe ser un array');
    assert.ok(AGENT_TOOLS_MANIFEST.length >= 5, 'Debe incluir al menos 5 herramientas estándar');
    
    const toolNames = AGENT_TOOLS_MANIFEST.map(t => t.name);
    assert.ok(toolNames.includes('tool_web_search'), 'Debe incluir tool_web_search');
    assert.ok(toolNames.includes('tool_inegi_denue'), 'Debe incluir tool_inegi_denue');
    assert.ok(toolNames.includes('tool_financial_engine'), 'Debe incluir tool_financial_engine');
    assert.ok(toolNames.includes('tool_quantum_diagnostic'), 'Debe incluir tool_quantum_diagnostic');
    assert.ok(toolNames.includes('tool_mermaid_generator'), 'Debe incluir tool_mermaid_generator');
    assert.ok(toolNames.includes('tool_critic_validator'), 'Debe incluir tool_critic_validator');
  });

  it('tool_web_search debe retornar competidores y precios de mercado en tiempo real', async () => {
    const result = await executeAgentTool('tool_web_search', {
      query: 'Cafetería de Especialidad',
      location: 'Hermosillo, Sonora',
      limit: 3
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.toolName, 'tool_web_search');
    assert.ok(result.executionTimeMs >= 0);
    assert.ok(result.data.results.length > 0, 'Debe retornar resultados de competidores');
    assert.ok(result.data.marketInsight.includes('Hermosillo'), 'Debe incluir insight contextual');
  });

  it('tool_financial_engine debe calcular TIR, VPN y Punto de Equilibrio exactos', async () => {
    const result = await executeAgentTool('tool_financial_engine', {
      inversionInicial: 200000,
      costosFijosMensuales: 30000,
      ventasMensualesEstimadas: 65000,
      tasaDescuento: 15,
      anios: 5
    });

    assert.strictEqual(result.success, true);
    assert.ok(result.data.vpn > 0, 'VPN debe ser positivo para estos flujos');
    assert.ok(result.data.tirEstimadaPercent > 15, 'TIR debe ser superior a la tasa de descuento');
    assert.ok(result.data.puntoEquilibrioVentasMensual > 0, 'Punto de equilibrio debe ser calculable');
    assert.strictEqual(result.data.viabilidad, 'VIABLE_POSITIVO');
  });

  it('tool_quantum_diagnostic debe evaluar la Regla 13 de Empresas Cuánticas (Fondo Thoth AC)', async () => {
    const resultBalanced = await executeAgentTool('tool_quantum_diagnostic', {
      areasFundador: ['operativo', 'finanzas'],
      tamanoEquipo: 4
    });

    assert.strictEqual(resultBalanced.success, true);
    assert.strictEqual(resultBalanced.data.isBalanced, true);
    assert.strictEqual(resultBalanced.data.hasAtomicFusion, false);

    const resultFused = await executeAgentTool('tool_quantum_diagnostic', {
      areasFundador: ['finanzas', 'operativo', 'administrativo'],
      tamanoEquipo: 4
    });

    assert.strictEqual(resultFused.data.hasAtomicFusion, true);
    assert.ok(resultFused.data.delegationRequired.length > 0);
  });

  it('tool_mermaid_generator debe generar sintaxis Mermaid válida', async () => {
    const result = await executeAgentTool('tool_mermaid_generator', {
      diagramType: 'graph_td',
      nodes: [
        { id: 'A', label: 'Recepción de Materia Prima' },
        { id: 'B', label: 'Procesamiento y Control' },
        { id: 'C', label: 'Empaque y Distribución' }
      ]
    });

    assert.strictEqual(result.success, true);
    assert.ok(result.data.mermaidSyntax.startsWith('graph TD'));
    assert.ok(result.data.mermaidSyntax.includes('Recepción de Materia Prima'));
  });

  it('TrajectoryRecorder debe generar estructura de árbol DAG compatible con DeepSeek Harness', () => {
    const recorder = new TrajectoryRecorder('task_test_123', {
      pillar: 'mercado',
      moduleKey: 'demanda',
      title: 'Análisis de Demanda',
      model: 'minimax-m3:cloud',
      provider: 'ollama'
    });

    recorder.addStep('thought', {
      title: 'Planificación de Búsqueda',
      content: 'El agente analiza competidores en la zona norte.',
      durationMs: 15
    });

    recorder.addStep('tool_call', {
      title: 'Invocando Tool Web Search',
      toolName: 'tool_web_search',
      toolArgs: { query: 'Panadería Artesanal' },
      durationMs: 0
    });

    recorder.addStep('observation', {
      title: 'Datos de Competidores',
      toolName: 'tool_web_search',
      toolResult: { competitors: ['Panadería Central'] },
      durationMs: 120
    });

    recorder.addStep('reflection', {
      title: 'Validación Crítica',
      content: 'Datos coherentes con la demanda local.',
      isApproved: true,
      durationMs: 25
    });

    const harness = recorder.finish({ demanda_historica: 'Crecimiento del 15% anual' }, 'completed');

    assert.strictEqual(harness.harnessVersion, 'dsh-session-v0.1');
    assert.strictEqual(harness.status, 'completed');
    assert.strictEqual(harness.modelUsed, 'minimax-m3:cloud');
    assert.strictEqual(harness.stepsCount, 4);
    assert.strictEqual(harness.metrics.totalToolCalls, 1);
    assert.strictEqual(harness.metrics.successfulToolCalls, 1);
    assert.strictEqual(harness.metrics.criticApprovals, 1);
    assert.ok(harness.trajectoryDAG.length === 4);
    assert.strictEqual(harness.trajectoryDAG[0].parent, null);
    assert.strictEqual(harness.trajectoryDAG[1].parent, 'node_1');
  });
});
