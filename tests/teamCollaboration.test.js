import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  recordPromptFeedback, 
  getPromptFeedback, 
  createTeamJoinRequest, 
  getTeamJoinRequests, 
  resolveTeamJoinRequest 
} from '../server/promptFeedbackStore.js';

test('TDD: Almacén de Retroalimentación de Prompts para Calibración de IA y Harness', () => {
  const projectId = 'test_pizzeria_harness';
  const moduleKey = 'finanzas';

  // 1. Registrar señal de retroalimentación sobre cálculo erróneo de CAC
  const entry1 = recordPromptFeedback({
    projectId,
    moduleKey,
    reasonTag: 'cac_incorrecto',
    userComment: 'El modelo calculó un CAC de $150 MXN cuando el benchmark de restaurantes marca $45 MXN.',
    username: 'carlos_alumno',
    userRole: 'user',
    metadata: { provider: 'groq', model: 'llama-3.3-70b' }
  });

  assert.ok(entry1.id);
  assert.equal(entry1.reasonTag, 'cac_incorrecto');
  assert.equal(entry1.username, 'carlos_alumno');

  // 2. Registrar señal de población mal definida en módulo de mercado
  const entry2 = recordPromptFeedback({
    projectId,
    moduleKey: 'mercado',
    reasonTag: 'poblacion_mal_definida',
    userComment: 'La segmentación demográfica omitió a la población flotante universitaria de Hermosillo.',
    username: 'ana_alumna',
    userRole: 'user'
  });

  assert.ok(entry2.id);
  assert.equal(entry2.moduleKey, 'mercado');

  // 3. Consultar señales filtradas por proyecto
  const feedbackList = getPromptFeedback({ projectId });
  assert.ok(feedbackList.length >= 2);
  const foundCac = feedbackList.find(f => f.reasonTag === 'cac_incorrecto');
  assert.ok(foundCac);
  assert.ok(foundCac.userComment.includes('$150 MXN'));

  // 4. Consultar señales filtradas por módulo
  const mercadoFeedback = getPromptFeedback({ projectId, moduleKey: 'mercado' });
  assert.ok(mercadoFeedback.some(f => f.reasonTag === 'poblacion_mal_definida'));
});

test('TDD: Flujo de Solicitud y Aprobación de Colaboración entre Alumnos', () => {
  const projectId = 'test_ecopack_project';
  const projectOwner = 'ana_alumna';
  const requester = 'carlos_alumno';

  // 1. Crear solicitud de unión al equipo
  const request = createTeamJoinRequest({
    projectId,
    projectType: 'negocios',
    projectOwner,
    requesterUsername: requester,
    requesterDisplayName: 'Carlos Robledo',
    note: 'Hola Ana, soy Carlos de Finanzas, me gustaría colaborar en el pilar financiero del plan.'
  });

  assert.ok(request.id);
  assert.equal(request.status, 'pending');
  assert.equal(request.requesterUsername, requester);

  // 2. Comprobar que no se duplica una solicitud pendiente idéntica
  const dup = createTeamJoinRequest({
    projectId,
    projectOwner,
    requesterUsername: requester,
    note: 'Intento duplicado'
  });
  assert.equal(dup.id, request.id);

  // 3. Consultar solicitudes pendientes para el dueño
  const pendingRequests = getTeamJoinRequests({ projectId, ownerUsername: projectOwner, status: 'pending' });
  assert.ok(pendingRequests.some(r => r.id === request.id));

  // 4. El dueño o admin aprueba la solicitud
  const approved = resolveTeamJoinRequest(request.id, 'approved', projectOwner);
  assert.equal(approved.status, 'approved');
  assert.equal(approved.resolvedBy, projectOwner);
  assert.ok(approved.resolvedAt);

  // 5. Verificar que ya no está pendiente
  const pendingAfter = getTeamJoinRequests({ projectId, status: 'pending' });
  assert.ok(!pendingAfter.some(r => r.id === request.id));
});

test('TDD: Reasignación y Transferencia de Titularidad de Proyectos por Admin', async () => {
  const fs = await import('fs');
  const path = await import('path');
  const { transferProjectOwnership } = await import('../server/projectAccess.js');

  const testType = 'negocios';
  const testId = `proj_transfer_${Date.now()}`;
  const userA = { username: 'alumno_a', role: 'user' };
  const userB = { username: 'alumno_b', role: 'user' };
  const admin = { username: 'profesor_admin', role: 'superadmin' };

  // Crear proyecto temporal para alumno A
  const root = path.resolve('proyectos', testType, 'user_alumno_a', testId);
  fs.mkdirSync(root, { recursive: true });
  const jsonPath = path.join(root, `${testId}.json`);
  const initialData = {
    config: {
      projectId: testId,
      userOwner: 'alumno_a',
      brandKit: { companyName: 'Proyecto Reasignable' },
      collaborators: []
    }
  };
  fs.writeFileSync(jsonPath, JSON.stringify(initialData, null, 2), 'utf8');

  try {
    // Intentar transferir con un usuario no admin debe fallar
    assert.throws(() => {
      transferProjectOwnership({
        type: testType,
        id: testId,
        targetUser: userB,
        currentUser: userA
      });
    }, /Solo un administrador o profesor/);

    // Transferir con admin
    const result = transferProjectOwnership({
      type: testType,
      id: testId,
      targetUser: userB,
      currentUser: admin
    });

    assert.equal(result.success, true);
    assert.equal(result.previousOwner, 'alumno_a');
    assert.equal(result.newOwner, 'alumno_b');

    // Verificar que el archivo ahora está en la carpeta de alumno B
    const newJson = JSON.parse(fs.readFileSync(result.newPath, 'utf8'));
    assert.equal(newJson.config.userOwner, 'alumno_b');
    // Verificar que el alumno A ahora quedó como colaborador
    assert.ok(newJson.config.collaborators.includes('alumno_a'));
    assert.ok(!newJson.config.collaborators.includes('alumno_b'));
    // Verificar que el directorio viejo ya no existe
    assert.equal(fs.existsSync(jsonPath), false);
  } finally {
    // Limpieza de directorios creados en prueba
    try {
      const dirB = path.resolve('proyectos', testType, 'user_alumno_b', testId);
      if (fs.existsSync(dirB)) fs.rmSync(dirB, { recursive: true, force: true });
      if (fs.existsSync(root)) fs.rmSync(root, { recursive: true, force: true });
    } catch {}
  }
});

