import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { AgentStore } from '../../server/swarm/AgentStore.js';

describe('AgentStore - Persistencia, Métricas y Exportación de Agentes', () => {
  const testStoreDir = path.resolve('tests/swarm/test_store');

  before(() => {
    if (!fs.existsSync(testStoreDir)) {
      fs.mkdirSync(testStoreDir, { recursive: true });
    }
  });

  after(() => {
    if (fs.existsSync(testStoreDir)) {
      fs.rmSync(testStoreDir, { recursive: true, force: true });
    }
  });

  it('Debe inicializar y cargar agentes base en el store', async () => {
    const store = new AgentStore(testStoreDir);
    await store.initialize();
    
    const allAgents = store.getAllAgents();
    assert.ok(Array.isArray(allAgents));
    assert.ok(allAgents.length >= 0);
  });

  it('Debe guardar un nuevo agente especialista y persistirlo en disco', async () => {
    const store = new AgentStore(testStoreDir);
    await store.initialize();

    const sampleAgent = {
      id: 'hydroponics_specialist',
      version: '1.0.0',
      name: 'Especialista en Hidroponía Vertical',
      avatar: '🌱',
      role: 'Consultoría en Invernaderos y Nutrientes Hidropónicos',
      domain: ['hidroponia', 'agricultura', 'nutrientes', 'invernaderos'],
      systemPrompt: 'Eres un agrónomo experto en hidroponía urbana...',
      toolsRequired: ['market_search', 'calculadora_costos'],
      evaluationScore: 9.4,
      metrics: {
        usageCount: 0,
        tokensSaved: 0,
        averageRating: 9.4
      },
      createdAt: new Date().toISOString()
    };

    const saved = await store.saveAgent(sampleAgent);
    assert.equal(saved.id, 'hydroponics_specialist');

    const retrieved = store.getAgentById('hydroponics_specialist');
    assert.ok(retrieved);
    assert.equal(retrieved.name, 'Especialista en Hidroponía Vertical');

    const filePath = path.join(testStoreDir, 'hydroponics_specialist.json');
    assert.ok(fs.existsSync(filePath));
  });

  it('Debe registrar métricas de uso y ahorro de tokens', async () => {
    const store = new AgentStore(testStoreDir);
    await store.initialize();

    await store.recordAgentUsage('hydroponics_specialist', {
      tokensSaved: 4200,
      rating: 9.5
    });

    const updated = store.getAgentById('hydroponics_specialist');
    assert.equal(updated.metrics.usageCount, 1);
    assert.equal(updated.metrics.tokensSaved, 4200);
  });

  it('Debe generar el paquete de exportación mensual de agentes', async () => {
    const store = new AgentStore(testStoreDir);
    await store.initialize();

    const bundle = await store.generateExportBundle();
    assert.ok(bundle.exportedAt);
    assert.ok(Array.isArray(bundle.agents));
    assert.ok(bundle.agents.length >= 1);
    assert.equal(bundle.formatVersion, '3.0.0');
  });
});
