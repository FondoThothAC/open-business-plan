import test from 'node:test';
import assert from 'node:assert/strict';
import { recordPresence, getActivePresence, clearPresence } from '../server/presenceTracker.js';

test('TDD: Gestor de Presencia y Bloqueo Suave de Colaboradores', () => {
  const projectId = 'test_pizzeria_collab';
  const user1 = { username: 'roberto', displayName: 'Roberto Celis', role: 'superadmin' };
  const user2 = { username: 'yocine', displayName: 'Edwin Dominguez', role: 'user' };

  // 1. Registrar presencia de usuario 1 en el módulo de 'mercado'
  const active1 = recordPresence(projectId, user1, { moduleKey: 'mercado' });
  assert.equal(active1.length, 1);
  assert.equal(active1[0].username, 'roberto');
  assert.equal(active1[0].moduleKey, 'mercado');

  // 2. Registrar presencia de usuario 2 en el módulo de 'finanzas'
  const active2 = recordPresence(projectId, user2, { moduleKey: 'finanzas' });
  assert.equal(active2.length, 2);

  // 3. Consultar presencia activa
  const current = getActivePresence(projectId);
  assert.equal(current.length, 2);
  const robertoSession = current.find(s => s.username === 'roberto');
  const yocineSession = current.find(s => s.username === 'yocine');
  assert.ok(robertoSession);
  assert.ok(yocineSession);
  assert.equal(robertoSession.moduleKey, 'mercado');
  assert.equal(yocineSession.moduleKey, 'finanzas');

  // 4. Liberar presencia de usuario 1
  clearPresence(projectId, 'roberto');
  const remaining = getActivePresence(projectId);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].username, 'yocine');

  // 5. Limpieza total
  clearPresence(projectId, 'yocine');
  assert.equal(getActivePresence(projectId).length, 0);
});
