/**
 * Mutex Lock de Generación Concurrente por ProjectId
 * Fondo Thoth AC — Open Business Plan
 * 
 * Previene ejecuciones simultáneas desincronizadas sobre el mismo proyecto,
 * evitando sobreescrituras descontroladas y duplicación de módulos.
 */

const DEFAULT_LOCK_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos de vida máxima para un lock activo

// Mapa en memoria: projectId -> { sessionId, startedAt, meta }
const activeLocks = new Map();

/**
 * Intenta adquirir el lock de generación para un proyecto.
 * @param {string} projectId ID del proyecto
 * @param {string} sessionId ID de la sesión que solicita el lock
 * @param {Object} [meta] Metadata adicional (timestamp, etc.)
 * @returns {{ success: boolean, reason?: string, currentSessionId?: string, startedAt?: number, sessionId?: string }}
 */
export function acquireGenerationLock(projectId, sessionId, meta = {}) {
  if (!projectId || !sessionId) {
    return { success: false, reason: 'invalid_arguments' };
  }

  const now = Date.now();
  const existing = activeLocks.get(projectId);

  if (existing) {
    const elapsed = now - existing.startedAt;
    const isExpired = elapsed > DEFAULT_LOCK_TIMEOUT_MS;

    // Si es la misma sesión, re-autorizar y refrescar
    if (existing.sessionId === sessionId) {
      existing.lastPing = now;
      return { success: true, sessionId, startedAt: existing.startedAt };
    }

    // Si aún está activo y no ha expirado, rechazar por concurrencia
    if (!isExpired) {
      return {
        success: false,
        reason: 'busy',
        currentSessionId: existing.sessionId,
        startedAt: existing.startedAt,
        elapsedMs: elapsed
      };
    }

    // Si expiró (> 30 min), se libera automáticamente el lock huérfano
  }

  const startedAt = meta.startedAt || now;
  activeLocks.set(projectId, {
    sessionId,
    startedAt,
    lastPing: now,
    ...meta
  });

  return {
    success: true,
    sessionId,
    startedAt
  };
}

/**
 * Libera el lock de generación de un proyecto.
 * @param {string} projectId ID del proyecto
 * @param {string} sessionId ID de la sesión que libera
 * @param {boolean} [force=false] Si es true, libera sin validar coincidencia de sesión
 * @returns {{ success: boolean, message?: string }}
 */
export function releaseGenerationLock(projectId, sessionId, force = false) {
  if (!projectId) return { success: false, message: 'projectId requerido' };

  const existing = activeLocks.get(projectId);
  if (!existing) {
    return { success: true, message: 'No había lock activo' };
  }

  if (existing.sessionId !== sessionId && !force) {
    return { success: false, message: 'Sesión no coincide con el dueño del lock' };
  }

  activeLocks.delete(projectId);
  return { success: true };
}

/**
 * Obtiene el estado actual del lock para un projectId.
 * @param {string} projectId ID del proyecto
 * @returns {{ isLocked: boolean, sessionId?: string, startedAt?: number, elapsedMs?: number }}
 */
export function getGenerationLockStatus(projectId) {
  const existing = activeLocks.get(projectId);
  if (!existing) {
    return { isLocked: false };
  }

  const elapsed = Date.now() - existing.startedAt;
  if (elapsed > DEFAULT_LOCK_TIMEOUT_MS) {
    activeLocks.delete(projectId);
    return { isLocked: false };
  }

  return {
    isLocked: true,
    sessionId: existing.sessionId,
    startedAt: existing.startedAt,
    elapsedMs: elapsed
  };
}

/**
 * Limpia todos los locks en memoria (utilizado para tests y reseteo).
 */
export function clearAllLocks() {
  activeLocks.clear();
}
