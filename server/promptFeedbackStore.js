import fs from 'fs';
import path from 'path';

/**
 * @file promptFeedbackStore.js
 * @description Almacén de telemetría y retroalimentación de calibración para Prompts,
 * Model Harness y algoritmos de IA en Open Business Plan (Fondo Thoth AC).
 * 
 * Captura las razones por las cuales los estudiantes o profesores ajustan o regeneran
 * contenido generado por IA (ej: "No calculó bien el CAC", "Población mal definida",
 * "Texto demasiado largo", etc.) y consolida un historial auditable para fine-tuning.
 * 
 * [SDD] Arquitectura de retroalimentación activa y telemetría de IA.
 * [DDD] Entidades: PromptFeedbackEntry, ModuleLock, ModuleVersionSnapshot.
 */

const DATA_DIR = path.resolve('server', 'data');
const FEEDBACK_FILE = path.join(DATA_DIR, 'prompt_tuning_feedback.json');
const JOIN_REQUESTS_FILE = path.join(DATA_DIR, 'team_join_requests.json');

/**
 * Garantiza que la carpeta y el archivo de retroalimentación existan.
 */
function ensureDataStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FEEDBACK_FILE)) {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify([], null, 2), 'utf8');
  }
  if (!fs.existsSync(JOIN_REQUESTS_FILE)) {
    fs.writeFileSync(JOIN_REQUESTS_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

/**
 * Registra una señal de retroalimentación sobre la IA para calibración de prompts y algoritmos.
 * @param {Object} feedbackData
 * @param {string} feedbackData.projectId - ID del proyecto
 * @param {string} feedbackData.moduleKey - Módulo afectado (mercado, finanzas, etc.)
 * @param {string} feedbackData.reasonTag - Etiqueta categórica del motivo (ej. 'cac_incorrecto', 'poblacion_mal_definida')
 * @param {string} feedbackData.userComment - Explicación detallada del usuario o profesor
 * @param {string} feedbackData.username - Usuario que reporta el ajuste
 * @param {string} [feedbackData.userRole='user'] - Rol del usuario
 * @param {Object} [feedbackData.metadata={}] - Información contextual adicional (modelo IA usado, tokens, etc.)
 * @returns {Object} El registro almacenado con ID y marca de tiempo.
 */
export function recordPromptFeedback({
  projectId,
  moduleKey,
  reasonTag,
  userComment = '',
  username = 'anon',
  userRole = 'user',
  metadata = {}
}) {
  ensureDataStore();
  const entry = {
    id: `fbk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    projectId: String(projectId || ''),
    moduleKey: String(moduleKey || ''),
    reasonTag: String(reasonTag || 'modificacion_manual'),
    userComment: String(userComment || '').trim(),
    username: String(username || 'anon'),
    userRole: String(userRole || 'user'),
    metadata: metadata || {}
  };

  try {
    const raw = fs.readFileSync(FEEDBACK_FILE, 'utf8');
    const list = JSON.parse(raw);
    list.unshift(entry);
    // Limitar histórico a los últimos 2000 eventos para conservar rendimiento
    if (list.length > 2000) {
      list.length = 2000;
    }
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(list, null, 2), 'utf8');
    return entry;
  } catch (error) {
    console.error('[PromptFeedback] Error al guardar señal de retroalimentación:', error);
    return entry;
  }
}

/**
 * Obtiene la lista de señales de retroalimentación acumuladas.
 * @param {Object} [filter={}] - Filtros opcionales por projectId o moduleKey
 * @returns {Array<Object>}
 */
export function getPromptFeedback(filter = {}) {
  ensureDataStore();
  try {
    const raw = fs.readFileSync(FEEDBACK_FILE, 'utf8');
    let list = JSON.parse(raw);
    if (filter.projectId) {
      list = list.filter(item => item.projectId === filter.projectId);
    }
    if (filter.moduleKey) {
      list = list.filter(item => item.moduleKey === filter.moduleKey);
    }
    return list;
  } catch (error) {
    console.error('[PromptFeedback] Error al leer señales de retroalimentación:', error);
    return [];
  }
}

/**
 * Registra una solicitud de un alumno para unirse a un proyecto de equipo.
 * @param {Object} requestData
 * @param {string} requestData.projectId
 * @param {string} requestData.projectType
 * @param {string} requestData.projectOwner
 * @param {string} requestData.requesterUsername
 * @param {string} requestData.requesterDisplayName
 * @param {string} [requestData.note='']
 * @returns {Object} Solicitud creada
 */
export function createTeamJoinRequest({
  projectId,
  projectType = 'negocios',
  projectOwner,
  requesterUsername,
  requesterDisplayName = '',
  note = ''
}) {
  ensureDataStore();
  const newReq = {
    id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    projectId: String(projectId),
    projectType: String(projectType),
    projectOwner: String(projectOwner),
    requesterUsername: String(requesterUsername),
    requesterDisplayName: String(requesterDisplayName || requesterUsername),
    note: String(note || '').trim(),
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedBy: null
  };

  try {
    const raw = fs.readFileSync(JOIN_REQUESTS_FILE, 'utf8');
    const requests = JSON.parse(raw);

    // Evitar solicitudes duplicadas pendientes para el mismo proyecto y solicitante
    const existing = requests.find(r => 
      r.projectId === projectId && 
      r.requesterUsername.toLowerCase() === requesterUsername.toLowerCase() && 
      r.status === 'pending'
    );
    if (existing) {
      return existing;
    }

    requests.unshift(newReq);
    fs.writeFileSync(JOIN_REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf8');
    return newReq;
  } catch (error) {
    console.error('[TeamJoinRequests] Error al crear solicitud de unión:', error);
    throw error;
  }
}

/**
 * Consulta solicitudes de unión para un proyecto o para un propietario.
 * @param {Object} query
 * @returns {Array<Object>}
 */
export function getTeamJoinRequests({ projectId, ownerUsername, status }) {
  ensureDataStore();
  try {
    const raw = fs.readFileSync(JOIN_REQUESTS_FILE, 'utf8');
    let requests = JSON.parse(raw);

    if (projectId) {
      requests = requests.filter(r => r.projectId === projectId);
    }
    if (ownerUsername) {
      const norm = String(ownerUsername).toLowerCase();
      requests = requests.filter(r => r.projectOwner.toLowerCase() === norm);
    }
    if (status) {
      requests = requests.filter(r => r.status === status);
    }
    return requests;
  } catch (error) {
    console.error('[TeamJoinRequests] Error al consultar solicitudes:', error);
    return [];
  }
}

/**
 * Resuelve (aprueba o rechaza) una solicitud de unión.
 * @param {string} requestId
 * @param {'approved'|'rejected'} status
 * @param {string} resolvedBy
 * @returns {Object|null}
 */
export function resolveTeamJoinRequest(requestId, status, resolvedBy) {
  ensureDataStore();
  try {
    const raw = fs.readFileSync(JOIN_REQUESTS_FILE, 'utf8');
    const requests = JSON.parse(raw);
    const target = requests.find(r => r.id === requestId);
    if (!target) return null;

    target.status = status;
    target.resolvedAt = new Date().toISOString();
    target.resolvedBy = resolvedBy;

    fs.writeFileSync(JOIN_REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf8');
    return target;
  } catch (error) {
    console.error('[TeamJoinRequests] Error al resolver solicitud de unión:', error);
    throw error;
  }
}
