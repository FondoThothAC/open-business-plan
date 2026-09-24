import test from 'node:test';
import assert from 'node:assert/strict';

test('TDD: Cálculo y asociación de proyectos por usuario y colaboración', () => {
  const targetUsername = 'yocine';
  const targetEmail = 'a219212538@unison.mx';

  const mockProject1 = {
    config: {
      projectId: 'pizzeria_siglo_21',
      userOwner: 'yocine',
      collaborators: ['yocine', 'roberto']
    },
    semilla: {
      nombre_proyecto: 'Pizzería Siglo XXI'
    }
  };

  const mockProject2 = {
    config: {
      projectId: 'closets_y_cocinas_corona',
      userOwner: 'viktoracuna',
      collaborators: ['viktoracuna', 'galiet_gastelum', 'karely_otero', 'yocine']
    },
    semilla: {
      nombre_proyecto: 'Closets y Cocinas Corona'
    }
  };

  const isOwner1 = mockProject1.config.userOwner === targetUsername;
  const isCollab1 = mockProject1.config.collaborators.includes(targetUsername);
  assert.equal(isOwner1, true, 'yocine debe ser propietario de Pizzería Siglo XXI');
  assert.equal(isCollab1, true, 'yocine debe ser colaborador de su proyecto');

  const isOwner2 = mockProject2.config.userOwner === targetUsername;
  const isCollab2 = mockProject2.config.collaborators.includes(targetUsername);
  assert.equal(isOwner2, false, 'yocine no es propietario de Closets Corona');
  assert.equal(isCollab2, true, 'yocine es colaborador en Closets Corona');
});
