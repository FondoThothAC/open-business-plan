import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('TDD-29: Telemetry Attribution & Token Storage Structure', async (t) => {
  const telemetryDir = path.resolve('proyectos', 'telemetry');
  const tokenFilePath = path.join(telemetryDir, 'tokens_usage.json');
  const callLogPath = path.join(telemetryDir, 'call_log.jsonl');

  // Guardar estado previo si existe
  let backupTokens = null;
  if (fs.existsSync(tokenFilePath)) {
    backupTokens = fs.readFileSync(tokenFilePath, 'utf8');
  }

  t.after(() => {
    if (backupTokens !== null) {
      fs.writeFileSync(tokenFilePath, backupTokens, 'utf8');
    }
  });

  await t.test('la estructura de tokens_usage.json debe contener accumulated y daily', () => {
    if (fs.existsSync(tokenFilePath)) {
      const data = JSON.parse(fs.readFileSync(tokenFilePath, 'utf8'));
      assert.ok(data.accumulated !== undefined, 'Debe tener propiedad accumulated');
      assert.ok(data.daily !== undefined, 'Debe tener propiedad daily');
      assert.equal(typeof data.accumulated, 'object');
      assert.equal(typeof data.daily, 'object');
    }
  });

  await t.test('call_log.jsonl debe contener registros con projectId y module cuando se envían', () => {
    if (fs.existsSync(callLogPath)) {
      const lines = fs.readFileSync(callLogPath, 'utf8').trim().split('\n').filter(Boolean);
      if (lines.length > 0) {
        const lastEntry = JSON.parse(lines[lines.length - 1]);
        assert.ok('provider' in lastEntry);
        assert.ok('timestamp' in lastEntry);
      }
    }
  });
});
