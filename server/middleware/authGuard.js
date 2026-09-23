/**
 * @file authGuard.js
 * @description Middleware de autorización para Express con soporte de cookies HttpOnly y 3 roles.
 * Protege todas las rutas /api/* excepto las públicas.
 * Inyecta req.user con los datos del usuario autenticado.
 * 
 * [SECDD] Autenticación primaria basada en cookie HttpOnly obp_auth_token; fallback retrocompatible con Bearer token.
 * [IDD]  Contrato: req.user = { id, username, role, displayName, email, status }
 */

import { verificarToken, buscarPorId } from '../auth.js';

// ─────────────────────────────────────────────────────────
//  Rutas que NO requieren autenticación
// ─────────────────────────────────────────────────────────
const RUTAS_PUBLICAS = [
  '/auth/login',
  '/auth/register',
  '/health',
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
  '/ai/account-chat',
  '/api/ai/account-chat',
  '/swarm/interview',
  '/swarm/stream',
  '/swarm/industrialize',
  '/api/swarm/interview',
  '/api/swarm/stream',
  '/api/swarm/industrialize'
];

/**
 * Middleware principal de autenticación.
 * Extrae token JWT prioritariamente desde la cookie HttpOnly 'obp_auth_token',
 * o de forma secundaria desde el header 'Authorization: Bearer <token>'.
 * Enriquece req.user con los datos del usuario.
 */
export function authGuard(req, res, next) {
  const rutaRelativa = (req.path || '').replace(/\/$/, '');
  const rutaCompleta = ((req.baseUrl || '') + (req.path || '')).replace(/\/$/, '');
  const rutaOriginal = (req.originalUrl || '').split('?')[0].replace(/\/$/, '');

  const esRutaPublica = RUTAS_PUBLICAS.some(ruta => {
    const rutaNorm = ruta.replace(/\/$/, '');
    return (
      rutaRelativa === rutaNorm || rutaRelativa.startsWith(rutaNorm + '/') ||
      rutaCompleta === rutaNorm || rutaCompleta.startsWith(rutaNorm + '/') ||
      rutaOriginal === rutaNorm || rutaOriginal.startsWith(rutaNorm + '/')
    );
  });

  // 1. Prioridad: Cookie HttpOnly
  let token = req.cookies?.obp_auth_token || null;

  // 2. Fallback: Header Authorization (para migración de clientes y scripts)
  if (!token) {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  // Si no hay token en ruta pública, continuar sin req.user
  if (!token) {
    if (esRutaPublica) {
      return next();
    }
    return res.status(401).json({
      error: 'Acceso denegado. Se requiere autenticación.',
      code: 'AUTH_REQUIRED'
    });
  }

  // Verificar JWT
  const resultado = verificarToken(token);
  if (!resultado.valid) {
    if (esRutaPublica) {
      return next();
    }
    return res.status(401).json({
      error: resultado.error || 'Token inválido o expirado.',
      code: 'TOKEN_INVALID'
    });
  }

  // Cargar usuario completo desde el store
  const usuario = buscarPorId(resultado.payload.sub);
  if (!usuario) {
    if (esRutaPublica) {
      return next();
    }
    return res.status(401).json({
      error: 'Usuario no encontrado. Posiblemente fue eliminado.',
      code: 'USER_NOT_FOUND'
    });
  }

  // Verificar estado de la cuenta
  if (usuario.status !== 'active') {
    if (esRutaPublica) {
      return next();
    }
    return res.status(403).json({
      error: 'Cuenta desactivada o pendiente de aprobación.',
      code: 'ACCOUNT_INACTIVE'
    });
  }
  if (Number(resultado.payload.sessionVersion || 0) !== Number(usuario.sessionVersion || 0)) {
    if (esRutaPublica) {
      return next();
    }
    return res.status(401).json({ error: 'La sesión fue revocada. Inicia sesión nuevamente.', code: 'SESSION_REVOKED' });
  }

  // Inyectar datos del usuario autenticado
  req.user = {
    id: usuario.id,
    username: usuario.username,
    role: usuario.role || 'user',
    displayName: usuario.displayName,
    email: usuario.email,
    status: usuario.status
  };

  req.headers['x-user-id'] = usuario.username;

  next();
}

/**
 * Middleware que restringe acceso exclusivamente al rol superadmin.
 */
export function soloAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({
      error: 'Acceso denegado. Se requieren permisos de superadministrador.',
      code: 'SUPERADMIN_REQUIRED'
    });
  }
  next();
}

/**
 * Middleware que permite acceso a superadmin o revisor (modo lectura y comentarios).
 */
export function soloRevisorOSuperAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'superadmin' && req.user.role !== 'revisor')) {
    return res.status(403).json({
      error: 'Acceso denegado. Se requiere rol de revisor o superadministrador.',
      code: 'REVIEWER_OR_ADMIN_REQUIRED'
    });
  }
  next();
}

/**
 * Middleware que impide que los revisores modifiquen el contenido de los proyectos.
 * Los revisores solo pueden consultar y agregar comentarios.
 */
export function prohibirRevisorMutacion(req, res, next) {
  if (req.user && req.user.role === 'revisor') {
    return res.status(403).json({
      error: 'Acceso denegado. El rol de revisor solo puede consultar proyectos y agregar notas o comentarios; no puede modificar el contenido ni la configuración.',
      code: 'REVISOR_MUTATION_FORBIDDEN'
    });
  }
  next();
}
