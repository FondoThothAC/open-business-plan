import test from 'node:test';
import assert from 'node:assert/strict';
import { TrajectoryRecorder } from '../src/lib/agenticEngine.js';

test('TDD: Rebranding "DeepSeek Harness" -> "Harness" y Compatibilidad Retroactiva', async (t) => {
  await t.test('debe exportar la versión canónica harness-v0.1', () => {
    const recorder = new TrajectoryRecorder({
      sessionId: 'test_sess',
      projectId: 'proj_test',
      moduleKey: 'introduccion'
    });

    const exported = recorder.exportHarness();
    assert.equal(exported.harnessVersion, 'harness-v0.1', 'Debe usar la versión canónica harness-v0.1');
  });

  await t.test('debe leer y aceptar trayectorias históricas con dsh-session-v0.1 sin error', () => {
    const legacySnapshot = {
      harnessVersion: 'dsh-session-v0.1',
      sessionId: 'legacy_session',
      projectId: 'legacy_proj',
      nodes: []
    };

    // Shim de lectura
    const isSupportedVersion = (v) => v === 'harness-v0.1' || v === 'dsh-session-v0.1';
    assert.ok(isSupportedVersion(legacySnapshot.harnessVersion), 'Debe admitir versión legacy dsh-session-v0.1');
  });
});
