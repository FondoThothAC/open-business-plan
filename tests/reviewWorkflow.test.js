import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createReviewInvite,
  getReviewInvite,
  addReviewComment,
  listReviewComments,
  revokeReviewInvite
} from '../server/reviewStore.js';

describe('Suite de Pruebas: Enlaces de Revisión y Feedback Colaborativo (TDD / ATDD)', () => {
  const dummyProject = {
    type: 'negocios',
    id: 'test_project_review',
    path: 'proyectos/negocios/test_project_review.json'
  };
  const ownerId = 'u_owner_test_123';
  let generatedToken = null;
  let inviteId = null;

  it('Crea un enlace temporal de revisión con token criptográfico y expiración', () => {
    const result = createReviewInvite({
      project: dummyProject,
      ownerId,
      email: 'cliente@ejemplo.com',
      scope: 'executive',
      days: 7
    });

    assert.ok(result.token, 'Debe generar un token en texto plano para el cliente');
    assert.ok(result.invite, 'Debe retornar los metadatos de la invitación');
    assert.equal(result.invite.projectId, dummyProject.id);
    assert.equal(result.invite.email, 'cliente@ejemplo.com');
    assert.equal(result.invite.scope, 'executive');
    assert.equal(result.invite.tokenHash, undefined, 'No debe exponer el hash en el objeto de retorno');

    generatedToken = result.token;
    inviteId = result.invite.id;
  });

  it('Resuelve la invitación activa a partir del token en texto plano', () => {
    const invite = getReviewInvite(generatedToken);
    assert.ok(invite, 'Debe encontrar la invitación por token');
    assert.equal(invite.id, inviteId);
    assert.equal(invite.projectId, dummyProject.id);
    assert.equal(invite.revokedAt, null);
  });

  it('Permite al revisor agregar un comentario anclado a un bloque o módulo', () => {
    const comment = addReviewComment(generatedToken, {
      text: 'Favor de validar los costos operativos en el Año 2.',
      anchor: { moduleId: 'finanzas', fieldKey: 'costos_operativos' },
      revision: 'v1.0'
    });

    assert.ok(comment, 'Debe retornar el comentario creado');
    assert.equal(comment.authorEmail, 'cliente@ejemplo.com');
    assert.equal(comment.status, 'open');
    assert.equal(comment.text, 'Favor de validar los costos operativos en el Año 2.');
    assert.deepEqual(comment.anchor, { moduleId: 'finanzas', fieldKey: 'costos_operativos' });
  });

  it('Lista los comentarios registrados para la revisión', () => {
    const comments = listReviewComments(generatedToken);
    assert.ok(Array.isArray(comments));
    assert.equal(comments.length, 1);
    assert.equal(comments[0].text, 'Favor de validar los costos operativos en el Año 2.');
  });

  it('Revoca el enlace de revisión exitosamente y bloquea accesos posteriores', () => {
    const revoked = revokeReviewInvite(inviteId, ownerId);
    assert.equal(revoked, true, 'Debe revocar con éxito');

    const inviteAfterRevoke = getReviewInvite(generatedToken);
    assert.equal(inviteAfterRevoke, null, 'No debe permitir acceso con enlace revocado');

    const commentAttempt = addReviewComment(generatedToken, { text: 'Intento en revocado' });
    assert.equal(commentAttempt, null, 'No debe permitir comentar en enlace revocado');
  });

  it('Rechaza tokens inexistentes o inválidos', () => {
    const invalid = getReviewInvite('token_completamente_falso');
    assert.equal(invalid, null);
  });
});
