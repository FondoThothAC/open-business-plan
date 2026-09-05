import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTier1PriorityOrder, runDeepResearch } from '../src/lib/tools/deepResearchEngine.js';

test('TDD: Cascada Configurable de Búsqueda Fila 1 y Prioridad de DuckDuckGo', async (t) => {
  await t.test('debe devolver el orden por defecto si no hay configuración', () => {
    const order = resolveTier1PriorityOrder({});
    assert.deepEqual(order, ['duckduckgo', 'tavily', 'brave', 'serper']);
  });

  await t.test('debe respetar el array explícito de prioridades en tier1Priority', () => {
    const customOrder = ['brave', 'serper', 'tavily', 'duckduckgo'];
    const order = resolveTier1PriorityOrder({ tier1Priority: customOrder });
    assert.deepEqual(order, ['brave', 'serper', 'tavily', 'duckduckgo']);
  });

  await t.test('debe colocar el provider primario en la primera posición si se especifica provider único', () => {
    const orderSerper = resolveTier1PriorityOrder({ provider: 'serper' });
    assert.equal(orderSerper[0], 'serper');
    assert.ok(orderSerper.includes('duckduckgo'), 'Debe incluir duckduckgo como respaldo');

    const orderBrave = resolveTier1PriorityOrder({ provider: 'brave' });
    assert.equal(orderBrave[0], 'brave');
    assert.ok(orderBrave.includes('duckduckgo'));
  });

  await t.test('debe normalizar nombres de proveedores con alias comunes', () => {
    const order = resolveTier1PriorityOrder({ 
      tier1Priority: ['google_serper', 'ddg', 'tavily_free', 'brave_search'] 
    });
    assert.deepEqual(order, ['serper', 'duckduckgo', 'tavily', 'brave']);
  });

  await t.test('debe ejecutar la investigación consultando en el orden exacto configurado', async () => {
    const logs = [];
    const fakeApiKeys = {
      serperKey: 'test_serper_key',
      braveKey: 'test_brave_key',
      tavilyKey: 'test_tavily_key'
    };

    // Configurando Serper como primero, luego DuckDuckGo
    const searchConfig = {
      tier1Priority: ['serper', 'duckduckgo', 'tavily', 'brave']
    };

    // Interceptamos la llamada para verificar logs de orden
    const res = await runDeepResearch({
      query: 'Maquinaria hidráulica Hermosillo',
      apiKeys: fakeApiKeys,
      searchConfig,
      onLog: (msg) => logs.push(msg)
    });

    assert.ok(res, 'Debe retornar resultado');
    const serperIndex = logs.findIndex(l => l.includes('Google Serper API'));
    const ddgIndex = logs.findIndex(l => l.includes('DuckDuckGo'));
    
    // Si Serper está de primero, debe ser consultado antes de DuckDuckGo en los logs
    if (serperIndex !== -1 && ddgIndex !== -1) {
      assert.ok(serperIndex < ddgIndex, 'Google Serper debió consultarse antes que DuckDuckGo');
    }
  });
});
