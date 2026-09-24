/**
 * Gestor de Presencia y Bloqueo Suave en Tiempo Real para Colaboradores
 * Fondo Thoth AC — Open Business Plan
 * 
 * Registra quién está editando qué módulo/campo en cada proyecto,
 * proveyendo un mecanismo de heartbeats y detección de concurrencia suave.
 */

const PRESENCE_TTL_MS = 60 * 1000; // 60 segundos de inactividad liberan la presencia

// Mapa en memoria: projectId -> Map(userId -> { username, displayName, moduleKey, fieldKey, lastPing, color })
const projectPresenceMap = new Map();

const AVATAR_COLORS = [
  '#38bdf8', '#818cf8', '#34d399', '#f472b6', 
  '#fbbf24', '#a78bfa', '#f87171', '#4ade80'
];

function getDeterministicColor(username = '') {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Actualiza o registra el heartbeat de presencia de un usuario en un proyecto.
 * @param {string} projectId ID del proyecto
 * @param {Object} user Objeto de usuario autenticado
 * @param {Object} location Ubicación del cursor/foco { moduleKey, fieldKey }
 * @returns {Array<Object>} Lista de colaboradores activos en el proyecto
 */
export function recordPresence(projectId, user, location = {}) {
  if (!projectId || !user?.username) return [];

  const now = Date.now();
  if (!projectPresenceMap.has(projectId)) {
    projectPresenceMap.set(projectId, new Map());
  }

  const userMap = projectPresenceMap.get(projectId);
  const color = getDeterministicColor(user.username);

  userMap.set(user.username, {
    username: user.username,
    displayName: user.displayName || user.username,
    role: user.role || 'user',
    moduleKey: location.moduleKey || null,
    fieldKey: location.fieldKey || null,
    color,
    lastPing: now
  });

  // Limpieza de usuarios expirados (> PRESENCE_TTL_MS)
  for (const [uname, session] of userMap.entries()) {
    if (now - session.lastPing > PRESENCE_TTL_MS) {
      userMap.delete(uname);
    }
  }

  return Array.from(userMap.values());
}

/**
 * Obtiene los colaboradores actualmente activos en un proyecto.
 * @param {string} projectId ID del proyecto
 * @returns {Array<Object>} Lista de colaboradores activos
 */
export function getActivePresence(projectId) {
  if (!projectId || !projectPresenceMap.has(projectId)) return [];
  const userMap = projectPresenceMap.get(projectId);
  const now = Date.now();

  for (const [uname, session] of userMap.entries()) {
    if (now - session.lastPing > PRESENCE_TTL_MS) {
      userMap.delete(uname);
    }
  }

  return Array.from(userMap.values());
}

/**
 * Libera la presencia de un usuario al salir explícitamente o cerrar la sesión.
 * @param {string} projectId ID del proyecto
 * @param {string} username Nombre de usuario
 */
export function clearPresence(projectId, username) {
  if (!projectId || !username || !projectPresenceMap.has(projectId)) return;
  const userMap = projectPresenceMap.get(projectId);
  userMap.delete(username);
}
