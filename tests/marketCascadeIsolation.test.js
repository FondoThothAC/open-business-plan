import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ejecutarCascadaMercado } from '../server/routes/marketCascade.js';

describe('Cascada de mercado aislada por proyecto', () => {
  it('devuelve estado vacío honesto si falta contexto del proyecto', async () => {
    const result = await ejecutarCascadaMercado({});

    assert.equal(result.success, false);
    assert.equal(result.status, 'missing_context');
    assert.deepEqual(result.capaLocal.establecimientos, []);
  });

  it('mantiene la caché separada por projectId', async () => {
    const base = {
      query: 'refacciones hidráulicas',
      sector: 'industrial',
      ubicacion: 'Hermosillo, Sonora',
      fraccionArancelaria: '8412.21'
    };

    const first = await ejecutarCascadaMercado({ ...base, projectId: 'proyecto_a' });
    const second = await ejecutarCascadaMercado({ ...base, projectId: 'proyecto_b' });

    assert.equal(first.parametros.projectId, 'proyecto_a');
    assert.equal(second.parametros.projectId, 'proyecto_b');
  });
});
