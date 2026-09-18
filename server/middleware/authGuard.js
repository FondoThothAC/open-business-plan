/**
 * @file authGuard.js
 * @description Middleware de autorización para Express.
 * Protege todas las rutas /api/* excepto las públicas.
 * Inyecta req.user con los datos del usuario autenticado.
 * 
 * [SECDD] Ninguna ruta protegida es accesible sin JWT válido.
 * [IDD]  Contrato: req.user = { id, username, role, displayName, apiKeys }
 */

import { verificarToken, buscarPorId } from '../auth.js';

// ─────────────────────────────────────────────────────────
//  Rutas que NO requieren autenticación
// ─────────────────────────────────────────────────────────
const RUTAS_PUBLICAS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/health'
];

/**
 * Middleware principal de autenticación.
 * Verifica el token JWT y enriquece req.user con datos del usuario.
 * 
 * Flujo:
 *  1. Verificar si la ruta es pública → skip
 *  2. Extraer token del header Authorization: Bearer <token>
 *  3. Verificar y decodificar JWT
 *  4. Cargar usuario completo desde el store
 *  5. Inyectar req.user y continuar
 */
export function authGuard(req, res, next) {
  // Permitir rutas públicas sin autenticación
  const rutaLimpia = req.path.replace(/\/$/, '');
  if (RUTAS_PUBLICAS.some(ruta => rutaLimpia === ruta || rutaLimpia.startsWith(ruta + '/'))) {
    return next();
  }

  // Extraer token del header Authorization
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      error: 'Acceso denegado. Se requiere autenticación.',
      code: 'AUTH_REQUIRED'
    });
  }

  // Verificar JWT
  const resultado = verificarToken(token);
  if (!resultado.valid) {
    return res.status(401).json({
      error: resultado.error || 'Token inválido.',
      code: 'TOKEN_INVALID'
    });
  }

  // Cargar usuario completo desde el store
  const usuario = buscarPorId(resultado.payload.sub);
  if (!usuario) {
    return res.status(401).json({
      error: 'Usuario no encontrado. Posiblemente fue eliminado.',
      code: 'USER_NOT_FOUND'
    });
  }

  // Verificar que la cuenta sigue activa
  if (usuario.status !== 'active') {
    return res.status(403).json({
      error: 'Cuenta desactivada o pendiente de aprobación.',
      code: 'ACCOUNT_INACTIVE'
    });
  }

  // Inyectar datos del usuario en el request
  req.user = {
    id: usuario.id,
    username: usuario.username,
    role: usuario.role,
    displayName: usuario.displayName,
    email: usuario.email,
    apiKeys: usuario.apiKeys || {},
    status: usuario.status
  };

  // También setear x-user-id para compatibilidad con el sistema existente
  req.headers['x-user-id'] = usuario.username;

  next();
}

/**
 * Middleware que restringe acceso solo a superadmin.
 * Debe usarse DESPUÉS de authGuard.
 */
export function soloAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({
      error: 'Acceso denegado. Se requieren permisos de administrador.',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
}
