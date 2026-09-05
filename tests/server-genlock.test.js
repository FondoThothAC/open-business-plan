import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  acquireGenerationLock, 
  releaseGenerationLock, 
  getGenerationLockStatus,
  clearAllLocks 
} from '../src/lib/serverUtils/generationLock.js';

test('TDD: Mutex Lock de Generación Concurrente por ProjectId', async (t) => {
  t.beforeEach(() => {
    clearAllLocks();
  });

  await t.test('debe permitir adquirir el lock cuando está libre', () => {
    const res = acquireGenerationLock('proyecto_alfa', 'session_1');
    assert.equal(res.success, true);
    assert.equal(res.sessionId, 'session_1');

    const status = getGenerationLockStatus('proyecto_alfa');
    assert.equal(status.isLocked, true);
    assert.equal(status.sessionId, 'session_1');
  });

  await t.test('debe rechazar adquisición concurrente de otra sesión mientras esté activo', () => {
    acquireGenerationLock('proyecto_alfa', 'session_1');
    
    // Intento con session_2
    const res2 = acquireGenerationLock('proyecto_alfa', 'session_2');
    assert.equal(res2.success, false);
    assert.equal(res2.reason, 'busy');
    assert.equal(res2.currentSessionId, 'session_1');
  });

  await t.test('debe permitir reingreso de la misma sesión', () => {
    acquireGenerationLock('proyecto_alfa', 'session_1');
    const resReentry = acquireGenerationLock('proyecto_alfa', 'session_1');
    assert.equal(resReentry.success, true);
  });

  await t.test('debe liberar el lock exitosamente y permitir nueva adquisición', () => {
    acquireGenerationLock('proyecto_alfa', 'session_1');
    const rel = releaseGenerationLock('proyecto_alfa', 'session_1');
    assert.equal(rel.success, true);

    const status = getGenerationLockStatus('proyecto_alfa');
    assert.equal(status.isLocked, false);

    // Ahora session_2 puede adquirirlo
    const res2 = acquireGenerationLock('proyecto_alfa', 'session_2');
    assert.equal(res2.success, true);
  });

  await t.test('no debe permitir que una sesión diferente libere el lock sin force', () => {
    acquireGenerationLock('proyecto_alfa', 'session_1');
    const relInvalid = releaseGenerationLock('proyecto_alfa', 'session_2');
    assert.equal(relInvalid.success, false);

    const status = getGenerationLockStatus('proyecto_alfa');
    assert.equal(status.isLocked, true);
  });

  await t.test('debe considerar expirado un lock antiguo de más de 30 minutos', () => {
    // Simulamos un lock con timestamp de hace 35 minutos
    acquireGenerationLock('proyecto_alfa', 'session_1', { startedAt: Date.now() - (35 * 60 * 1000) });

    // Otra sesión debe poder tomar el lock automáticamente porque expiró
    const res2 = acquireGenerationLock('proyecto_alfa', 'session_2');
    assert.equal(res2.success, true);
    assert.equal(res2.sessionId, 'session_2');
  });
});
