import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { registrarUsuario, loginUsuario, listarUsuarios, activarUsuario, desactivarUsuario, eliminarUsuario, actualizarApiKeys, obtenerApiKeys, cambiarPassword, buscarPorId } from '../server/auth.js';

describe('Sistema Multiusuario y Roles (TDD)', () => {
  const testUser = `testuser_${Date.now()}`;
  let createdUserId = null;

  it('Registra un nuevo usuario con estado pending', () => {
    const res = registrarUsuario({
      username: testUser,
      email: `${testUser}@test.com`,
      password: 'password123',
      displayName: 'Usuario Prueba'
    });

    assert.equal(res.success, true);
    assert.equal(res.user.username, testUser);
    assert.equal(res.user.status, 'pending');
    assert.equal(res.user.role, 'user');
    createdUserId = res.user.id;
  });

  it('Rechaza el login si la cuenta está en estado pending', () => {
    const loginRes = loginUsuario({
      username: testUser,
      password: 'password123'
    });

    assert.equal(loginRes.success, false);
    assert.match(loginRes.error, /pendiente de aprobación/i);
  });

  it('Permite al admin activar la cuenta', () => {
    const activateRes = activarUsuario(createdUserId);
    assert.equal(activateRes.success, true);
    assert.equal(activateRes.user.status, 'active');
  });

  it('Permite el login exitoso tras ser activado y genera JWT', () => {
    const loginRes = loginUsuario({
      username: testUser,
      password: 'password123'
    });

    assert.equal(loginRes.success, true);
    assert.ok(loginRes.token);
    assert.equal(loginRes.user.username, testUser);
  });

  it('Guarda y actualiza API keys privadas asociadas al usuario', () => {
    const keysRes = actualizarApiKeys(createdUserId, {
      openrouter: 'sk-or-test-12345',
      groq: 'gsk-test-67890'
    });

    assert.equal(keysRes.success, true);
    assert.equal(keysRes.apiKeys.openrouter.configured, true);
    assert.equal(keysRes.apiKeys.groq.configured, true);

    const fetchedKeys = obtenerApiKeys(createdUserId);
    assert.equal(fetchedKeys.openrouter.configured, true);
    assert.match(buscarPorId(createdUserId).apiKeys.openrouter, /^enc:v1:/);
  });

  it('Permite cambiar la contraseña verificando la actual', () => {
    const passFail = cambiarPassword(createdUserId, 'wrongpass', 'newpass123');
    assert.equal(passFail.success, false);

    const passOk = cambiarPassword(createdUserId, 'password123', 'newpass123');
    assert.equal(passOk.success, true);

    const loginWithNew = loginUsuario({
      username: testUser,
      password: 'newpass123'
    });
    assert.equal(loginWithNew.success, true);
  });

  it('Permite desactivar la cuenta impidiendo nuevos logins', () => {
    const disableRes = desactivarUsuario(createdUserId);
    assert.equal(disableRes.success, true);

    const loginAttempt = loginUsuario({
      username: testUser,
      password: 'newpass123'
    });
    assert.equal(loginAttempt.success, false);
    assert.match(loginAttempt.error, /desactivada/i);
  });

  it('Permite eliminar el usuario de prueba', () => {
    const delRes = eliminarUsuario(createdUserId);
    assert.equal(delRes.success, true);
  });
});
