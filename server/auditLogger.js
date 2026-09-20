import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * @file auditLogger.js
 * @description Módulo de registro y consulta de bitácora de auditoría para Open Business Plan.
 * Registra acciones administrativas, cambios de roles, aprobaciones de proyectos,
 * exportaciones, restablecimiento de contraseñas y accesos del superadmin a proyectos ajenos.
 *
 * [SECDD] Trazabilidad obligatoria de acciones administrativas y mutaciones privilegiadas.
 * [DDD] Entidad AuditEntry: { id, timestamp, actorId, actorUsername, actorRole, action, targetType, targetId, details, ip }
 */

const AUDIT_FILE = path.resolve('server', 'data', 'audit_log.json');
const MAX_AUDIT_ENTRIES = 5000;

/**
 * Carga las entradas de auditoría desde el almacenamiento persistente.
 * @returns {Array<Object>} Lista de eventos de auditoría
 */
export function cargarAuditoria() {
  try {
    if (!fs.existsSync(AUDIT_FILE)) {
      const dirPath = path.dirname(AUDIT_FILE);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(AUDIT_FILE, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const raw = fs.readFileSync(AUDIT_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('[Audit] Error al cargar la bitácora de auditoría:', error.message);
    return [];
  }
}

/**
 * Guarda las entradas de auditoría en disco de forma atómica.
 * @param {Array<Object>} entradas
 */
export function guardarAuditoria(entradas) {
  try {
    const dirPath = path.dirname(AUDIT_FILE);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const tempFile = `${AUDIT_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(entradas, null, 2), 'utf8');
    fs.renameSync(tempFile, AUDIT_FILE);
  } catch (error) {
    console.error('[Audit] Error al guardar la bitácora de auditoría:', error.message);
  }
}

/**
 * Registra un evento de auditoría en el sistema.
 * @param {{
 *   actorId: string,
 *   actorUsername: string,
 *   actorRole: string,
 *   action: string,
 *   targetType?: string,
 *   targetId?: string,
 *   details?: Object|string,
 *   ip?: string
 * }} evento
 * @returns {Object} El registro de auditoría creado
 */
export function registrarAuditoria(evento) {
  const registro = {
    id: `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    timestamp: new Date().toISOString(),
    actorId: evento.actorId || 'anon',
    actorUsername: evento.actorUsername || 'anon',
    actorRole: evento.actorRole || 'user',
    action: evento.action || 'GENERIC_ACTION',
    targetType: evento.targetType || 'system',
    targetId: evento.targetId || null,
    details: evento.details || {},
    ip: evento.ip || '127.0.0.1'
  };

  try {
    const bitacora = cargarAuditoria();
    bitacora.unshift(registro);

    // Limitar tamaño máximo para evitar crecimiento desmedido en disco
    if (bitacora.length > MAX_AUDIT_ENTRIES) {
      bitacora.length = MAX_AUDIT_ENTRIES;
    }

    guardarAuditoria(bitacora);
    console.log(`[Audit] 🛡️ [${registro.actorRole}] ${registro.actorUsername} -> ${registro.action} (${registro.targetType}:${registro.targetId || 'N/A'})`);
  } catch (error) {
    console.error('[Audit] Error registrando evento:', error.message);
  }

  return registro;
}

/**
 * Consulta la bitácora de auditoría con filtros opcionales.
 * @param {{ limit?: number, action?: string, actorId?: string, targetId?: string }} filtros
 * @returns {Array<Object>} Lista filtrada de eventos de auditoría
 */
export function obtenerAuditoria(filtros = {}) {
  const bitacora = cargarAuditoria();
  let resultado = bitacora;

  if (filtros.action) {
    resultado = resultado.filter(r => r.action === filtros.action);
  }
  if (filtros.actorId) {
    resultado = resultado.filter(r => r.actorId === filtros.actorId);
  }
  if (filtros.targetId) {
    resultado = resultado.filter(r => r.targetId === filtros.targetId);
  }

  const limit = Math.max(1, Math.min(1000, Number(filtros.limit) || 100));
  return resultado.slice(0, limit);
}
