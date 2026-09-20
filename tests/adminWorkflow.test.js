import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { 
  crearUsuarioAdmin, 
  actualizarUsuarioAdmin, 
  resetearPasswordAdmin, 
  loginUsuario, 
  buscarPorUsername,
  eliminarUsuario 
} from '../server/auth.js';
import { registrarAuditoria, obtenerAuditoria } from '../server/auditLogger.js';

describe('Suite de Pruebas: Administración, Roles y Sesiones (TDD / ATDD)', () => {
  const timestamp = Date.now();
  const testAdminUser = `admin_test_${timestamp}`;
  const testRevisorUser = `revisor_test_${timestamp}`;
  const testStandardUser = `user_test_${timestamp}`;
  let adminId, revisorId, standardId;

  it('Crea usuario con rol superadmin desde la API administrativa', () => {
    const res = crearUsuarioAdmin({
      username: testAdminUser,
      email: `${testAdminUser}@example.com`,
      displayName: 'Super Administrador Test',
      role: 'superadmin',
      status: 'active',
      password: 'passwordAdmin123'
    }, 'system-test');

    assert.equal(res.success, true);
    assert.equal(res.user.role, 'superadmin');
    assert.equal(res.user.status, 'active');
    adminId = res.user.id;
  });

  it('Crea usuario con rol revisor desde la API administrativa', () => {
    const res = crearUsuarioAdmin({
      username: testRevisorUser,
      email: `${testRevisorUser}@example.com`,
      displayName: 'Revisor Test',
      role: 'revisor',
      status: 'active',
      password: 'passwordRevisor123'
    }, 'system-test');

    assert.equal(res.success, true);
    assert.equal(res.user.role, 'revisor');
    assert.equal(res.user.status, 'active');
    revisorId = res.user.id;
  });

  it('Crea usuario con rol user estándar desde la API administrativa', () => {
    const res = crearUsuarioAdmin({
      username: testStandardUser,
      email: `${testStandardUser}@example.com`,
      displayName: 'Usuario Regular Test',
      role: 'user',
      status: 'active',
      password: 'passwordUser123'
    }, 'system-test');

    assert.equal(res.success, true);
    assert.equal(res.user.role, 'user');
    standardId = res.user.id;
  });

  it('Actualiza rol y estado de un usuario (PATCH /api/admin/users/:id)', () => {
    const updateRes = actualizarUsuarioAdmin(standardId, {
      role: 'revisor',
      displayName: 'Usuario Promovido a Revisor'
    }, 'system-test');

    assert.equal(updateRes.success, true);
    assert.equal(updateRes.user.role, 'revisor');
    assert.equal(updateRes.user.displayName, 'Usuario Promovido a Revisor');

    // Revertir a user
    const revertRes = actualizarUsuarioAdmin(standardId, { role: 'user' }, 'system-test');
    assert.equal(revertRes.user.role, 'user');
  });

  it('Emite restablecimiento de contraseña administrativo con contraseña temporal', () => {
    const resetRes = resetearPasswordAdmin(standardId, null, 'system-test');
    assert.equal(resetRes.success, true);
    assert.ok(resetRes.temporaryPassword);

    // Login con contraseña temporal
    const loginTemp = loginUsuario({
      username: testStandardUser,
      password: resetRes.temporaryPassword
    });
    assert.equal(loginTemp.success, true);
    assert.ok(loginTemp.token);
  });

  it('Soporta inicio de sesión con recordarme = true (30 días de expiración de token)', () => {
    const loginRemember = loginUsuario({
      username: testAdminUser,
      password: 'passwordAdmin123',
      rememberMe: true
    });

    assert.equal(loginRemember.success, true);
    assert.equal(loginRemember.rememberMe, true);
    assert.ok(loginRemember.token);

    // Decodificar payload para verificar duración (aprox 30 días)
    const payloadBase64 = loginRemember.token.split('.')[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
    const durationDays = (payload.exp - payload.iat) / (60 * 60 * 24);
    assert.equal(Math.round(durationDays), 30);
  });

  it('Soporta inicio de sesión con recordarme = false (sesión corta)', () => {
    const loginSession = loginUsuario({
      username: testAdminUser,
      password: 'passwordAdmin123',
      rememberMe: false
    });

    assert.equal(loginSession.success, true);
    assert.equal(loginSession.rememberMe, false);
    assert.ok(loginSession.token);

    const payloadBase64 = loginSession.token.split('.')[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
    const durationDays = (payload.exp - payload.iat) / (60 * 60 * 24);
    assert.equal(Math.round(durationDays), 1);
  });

  it('Registra y persiste eventos de auditoría inmutable', () => {
    const eventoId = `audit_test_${timestamp}`;
    registrarAuditoria({
      action: 'TEST_AUDIT_ACTION',
      actorUsername: 'superadmin',
      actorRole: 'superadmin',
      targetType: 'project',
      targetId: 'project_vcv',
      details: { testField: 'verificado' }
    });

    const entries = obtenerAuditoria({ limit: 10 });
    assert.ok(entries.length > 0);
    const lastEntry = entries[0];
    assert.equal(lastEntry.action, 'TEST_AUDIT_ACTION');
    assert.equal(lastEntry.actorUsername, 'superadmin');
  });

  // Limpieza de usuarios de prueba
  it('Limpia usuarios de prueba creados', () => {
    if (adminId) eliminarUsuario(adminId);
    if (revisorId) eliminarUsuario(revisorId);
    if (standardId) eliminarUsuario(standardId);
  });
});
