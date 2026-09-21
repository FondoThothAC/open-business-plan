import './loadEnvironment.js';
/**
 * @file auth.js
 * @description Sistema de autenticación para Open Business Plan.
 * Implementa gestión de sesiones seguras mediante cookies HttpOnly, Recordarme (30 días),
 * roles (superadmin, revisor, user), auditoría administrativa y API keys encriptadas.
 * 
 * Almacenamiento: JSON en disco (server/data/users.json).
 * Hashing: bcryptjs (puro JS, sin compilación nativa).
 * Tokens: JWT con expiración dinámica ('30d' con Recordarme, '1d' de sesión).
 * 
 * [SECDD] Las contraseñas NUNCA se almacenan en texto plano.
 * [SECDD] Las API keys se almacenan encriptadas en el perfil.
 * [DDD]  Entidades: User { id, username, email, role, status, apiKeys, createdAt, lastLogin }
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { registrarAuditoria } from './auditLogger.js';

// ─────────────────────────────────────────────────────────
//  Configuración
// ─────────────────────────────────────────────────────────

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || !process.env.API_KEYS_ENCRYPTION_KEY || process.env.JWT_SECRET === process.env.API_KEYS_ENCRYPTION_KEY)) {
  throw new Error('Production requires persistent, independent JWT_SECRET and API_KEYS_ENCRYPTION_KEY.');
}
const JWT_SECRET = process.env.JWT_SECRET || generarSecretoInicial();
const JWT_EXPIRY_REMEMBER = '30d';
const JWT_EXPIRY_SESSION = '1d';
const BCRYPT_ROUNDS = 12;
const USERS_FILE = path.resolve('server', 'data', 'users.json');
const API_KEYS_ENCRYPTION_KEY = process.env.API_KEYS_ENCRYPTION_KEY || JWT_SECRET;
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const SHARED_API_TRIAL_DAYS = 30;

export const ROLES_VALIDOS = new Set(['superadmin', 'revisor', 'user']);
export const ESTADOS_VALIDOS = new Set(['active', 'pending', 'disabled']);

function crearAccesoApisCompartidas(startNow = false) {
  if (!startNow) return { enabled: true, startsAt: null, expiresAt: null, revokedAt: null };
  const startsAt = new Date();
  const expiresAt = new Date(startsAt.getTime() + SHARED_API_TRIAL_DAYS * 86400000);
  return { enabled: true, startsAt: startsAt.toISOString(), expiresAt: expiresAt.toISOString(), revokedAt: null };
}

export function obtenerEstadoApisCompartidas(usuario) {
  const grant = usuario?.sharedApiAccess;
  const enabled = grant?.enabled !== false;
  const expiresAt = grant?.expiresAt || null;
  const active = Boolean(enabled && expiresAt && Date.parse(expiresAt) > Date.now());
  return { enabled, active, startsAt: grant?.startsAt || null, expiresAt, revokedAt: grant?.revokedAt || null };
}

/**
 * Genera un secreto JWT aleatorio y lo advierte en consola si no existe en variables de entorno.
 */
function generarSecretoInicial() {
  const secreto = crypto.randomBytes(64).toString('hex');
  console.warn('[Auth] ⚠️  JWT_SECRET no configurado. Generando secreto temporal.');
  console.warn('[Auth]    Para producción, agrega JWT_SECRET a tu .env.local');
  return secreto;
}

// ─────────────────────────────────────────────────────────
//  Store de Usuarios (JSON en disco)
// ─────────────────────────────────────────────────────────

/**
 * Carga los usuarios desde el archivo JSON.
 * Crea el archivo con el superadmin por defecto si no existe.
 * @returns {{ users: Array<Object> }}
 */
function cargarUsuarios() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      const dirPath = path.dirname(USERS_FILE);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      const bootstrapPassword = process.env.BOOTSTRAP_SUPERADMIN_PASSWORD || '';
      const adminDefault = {
        users: [{
          id: 'u_superadmin_roberto',
          username: 'roberto',
          email: 'roberto@fondothoth.com',
          passwordHash: bootstrapPassword ? bcrypt.hashSync(bootstrapPassword, BCRYPT_ROUNDS) : '',
          role: 'superadmin',
          displayName: 'Roberto Celis',
          status: bootstrapPassword ? 'active' : 'pending_bootstrap',
          apiKeys: {},
          createdAt: new Date().toISOString(),
          lastLogin: null
          ,sessionVersion: 0
        }]
      };
      fs.writeFileSync(USERS_FILE, JSON.stringify(adminDefault, null, 2), 'utf8');
      console.log('[Auth] Archivo de usuarios inicializado con superadmin.');
      if (!bootstrapPassword) console.warn('[Auth] Configura BOOTSTRAP_SUPERADMIN_PASSWORD y activa al superadmin antes de usar producción.');
      return adminDefault;
    }
    const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    let changed = false;
    for (const user of data.users || []) {
      if (!user.sharedApiAccess) {
        user.sharedApiAccess = user.status === 'active'
          ? crearAccesoApisCompartidas(true)
          : crearAccesoApisCompartidas(false);
        changed = true;
      }
    }
    if (changed) guardarUsuarios(data);
    return data;
  } catch (error) {
    console.error('[Auth] Error cargando usuarios:', error.message);
    return { users: [] };
  }
}

/**
 * Guarda los usuarios al archivo JSON de forma atómica.
 * @param {{ users: Array<Object> }} data
 */
function guardarUsuarios(data) {
  const dirPath = path.dirname(USERS_FILE);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  const tempFile = USERS_FILE + '.tmp.' + Date.now();
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempFile, USERS_FILE);
}

function encryptionKey() {
  if (!API_KEYS_ENCRYPTION_KEY) return null;
  return crypto.createHash('sha256').update(API_KEYS_ENCRYPTION_KEY).digest();
}

function encryptApiKey(value) {
  const key = encryptionKey();
  if (!key || !value) return value;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:v1:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

function decryptApiKey(value) {
  if (!value || !value.startsWith('enc:v1:')) return value || '';
  const key = encryptionKey();
  if (!key) return '';
  try {
    const [, , ivRaw, tagRaw, ciphertext] = value.split(':');
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, Buffer.from(ivRaw, 'base64'));
    decipher.setAuthTag(Buffer.from(tagRaw, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]).toString('utf8');
  } catch { return ''; }
}

function maskApiKey(value) {
  const plain = decryptApiKey(value);
  if (!plain) return { configured: false, masked: '', status: value ? 'requires_reentry' : 'missing_key' };
  return { configured: true, masked: `${plain.slice(0, 3)}${'•'.repeat(Math.max(4, Math.min(8, plain.length - 5)))}${plain.slice(-2)}` };
}

function migrateApiKeys(data) {
  if (!encryptionKey()) return false;
  let changed = false;
  for (const user of data.users || []) {
    for (const [name, value] of Object.entries(user.apiKeys || {})) {
      if (value && !String(value).startsWith('enc:v1:')) {
        user.apiKeys[name] = encryptApiKey(String(value));
        changed = true;
      }
    }
  }
  return changed;
}

/**
 * Busca un usuario por username (case-insensitive).
 * @param {string} username
 * @returns {Object|null}
 */
export function buscarPorUsername(username) {
  const data = cargarUsuarios();
  if (migrateApiKeys(data)) guardarUsuarios(data);
  return data.users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

/**
 * Busca un usuario por ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function buscarPorId(id) {
  const data = cargarUsuarios();
  if (migrateApiKeys(data)) guardarUsuarios(data);
  return data.users.find(u => u.id === id) || null;
}

// ─────────────────────────────────────────────────────────
//  Funciones de Autenticación
// ─────────────────────────────────────────────────────────

/**
 * Registra un nuevo usuario con estado 'pending' (requiere aprobación del admin).
 * @param {{ username: string, email: string, password: string, displayName: string }} datos
 * @returns {{ success: boolean, user?: Object, message?: string, error?: string }}
 */
export function registrarUsuario({ username, email, password, displayName }) {
  if (!username || !password) {
    return { success: false, error: 'Usuario y contraseña son obligatorios.' };
  }
  if (username.length < 3 || username.length > 30) {
    return { success: false, error: 'El nombre de usuario debe tener entre 3 y 30 caracteres.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { success: false, error: 'El nombre de usuario solo puede contener letras, números y guión bajo.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  const existente = buscarPorUsername(username);
  if (existente) {
    return { success: false, error: 'Ese nombre de usuario ya está registrado.' };
  }

  const data = cargarUsuarios();
  const nuevoUsuario = {
    id: `u_${username.toLowerCase()}_${crypto.randomBytes(4).toString('hex')}`,
    username: username.toLowerCase(),
    email: email || '',
    passwordHash: bcrypt.hashSync(password, BCRYPT_ROUNDS),
    role: 'user',
    displayName: displayName || username,
    status: 'pending',
    apiKeys: {},
    sharedApiAccess: crearAccesoApisCompartidas(false),
    createdAt: new Date().toISOString(),
    lastLogin: null
    ,sessionVersion: 0
  };

  data.users.push(nuevoUsuario);
  guardarUsuarios(data);

  registrarAuditoria({
    actorId: nuevoUsuario.id,
    actorUsername: nuevoUsuario.username,
    actorRole: 'anon',
    action: 'USER_REGISTERED',
    targetType: 'user',
    targetId: nuevoUsuario.id,
    details: { email: nuevoUsuario.email, status: 'pending' }
  });

  console.log(`[Auth] 📝 Nuevo registro pendiente: ${username} (${email})`);

  return {
    success: true,
    user: sanitizarUsuario(nuevoUsuario),
    message: 'Cuenta creada. Espera la aprobación del administrador para poder iniciar sesión.'
  };
}

/**
 * Autentica un usuario y retorna JWT y configuración de sesión.
 * @param {{ username: string, password: string, rememberMe?: boolean }} credenciales
 * @returns {{ success: boolean, token?: string, user?: Object, expiresInSeconds?: number, rememberMe?: boolean, error?: string }}
 */
export function loginUsuario({ username, password, rememberMe = false }) {
  if (!username || !password) {
    return { success: false, error: 'Usuario y contraseña son obligatorios.' };
  }

  const usuario = buscarPorUsername(username);
  if (!usuario) {
    return { success: false, error: 'Credenciales inválidas.' };
  }

  const passwordValida = bcrypt.compareSync(password, usuario.passwordHash);
  if (!passwordValida) {
    return { success: false, error: 'Credenciales inválidas.' };
  }

  if (usuario.status === 'pending') {
    return { success: false, error: 'Tu cuenta está pendiente de aprobación. Contacta al administrador.' };
  }
  if (usuario.status === 'disabled') {
    return { success: false, error: 'Tu cuenta ha sido desactivada. Contacta al administrador.' };
  }

  const data = cargarUsuarios();
  const idx = data.users.findIndex(u => u.id === usuario.id);
  if (idx !== -1) {
    data.users[idx].lastLogin = new Date().toISOString();
    guardarUsuarios(data);
  }

  const durationStr = rememberMe ? JWT_EXPIRY_REMEMBER : JWT_EXPIRY_SESSION;
  const expiresInSeconds = rememberMe ? (30 * 24 * 3600) : (24 * 3600);

  const payload = {
    sub: usuario.id,
    username: usuario.username,
    role: usuario.role || 'user',
    displayName: usuario.displayName,
    rememberMe: Boolean(rememberMe)
    ,sessionVersion: usuario.sessionVersion || 0
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: durationStr });

  registrarAuditoria({
    actorId: usuario.id,
    actorUsername: usuario.username,
    actorRole: usuario.role || 'user',
    action: 'USER_LOGIN',
    targetType: 'session',
    targetId: usuario.id,
    details: { rememberMe: Boolean(rememberMe), durationStr }
  });

  console.log(`[Auth] ✅ Login exitoso: ${username} (${usuario.role}) - Recordarme: ${rememberMe}`);

  return {
    success: true,
    token,
    user: sanitizarUsuario(usuario),
    expiresInSeconds,
    rememberMe: Boolean(rememberMe)
  };
}

/**
 * Verifica y decodifica un JWT.
 * @param {string} token
 * @returns {{ valid: boolean, payload?: Object, error?: string }}
 */
export function verificarToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { valid: true, payload };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Sesión expirada. Inicia sesión nuevamente.' };
    }
    return { valid: false, error: 'Token inválido.' };
  }
}

// ─────────────────────────────────────────────────────────
//  Gestión Administrativa de Usuarios (Superadmin)
// ─────────────────────────────────────────────────────────

/**
 * Lista todos los usuarios registrados.
 * @returns {Array<Object>} Usuarios sanitizados
 */
export function listarUsuarios() {
  const data = cargarUsuarios();
  return data.users.map(sanitizarUsuario);
}

/**
 * Crea un usuario directamente desde el panel de administración.
 * @param {{ username: string, email?: string, password: string, displayName?: string, role?: string, status?: string }} datos
 * @param {Object} [actorAdmin] Superadmin que realiza la acción
 * @returns {{ success: boolean, user?: Object, error?: string }}
 */
export function crearUsuarioAdmin({ username, email, password, displayName, role = 'user', status = 'active' }, actorAdmin = null) {
  if (!username || !password) {
    return { success: false, error: 'Usuario y contraseña son requeridos.' };
  }
  if (!ROLES_VALIDOS.has(role)) {
    return { success: false, error: `Rol inválido. Roles permitidos: ${Array.from(ROLES_VALIDOS).join(', ')}` };
  }
  if (!ESTADOS_VALIDOS.has(status)) {
    return { success: false, error: `Estado inválido. Estados permitidos: ${Array.from(ESTADOS_VALIDOS).join(', ')}` };
  }
  if (buscarPorUsername(username)) {
    return { success: false, error: 'El nombre de usuario ya está registrado.' };
  }

  const data = cargarUsuarios();
  const nuevo = {
    id: `u_${username.toLowerCase()}_${crypto.randomBytes(4).toString('hex')}`,
    username: username.toLowerCase(),
    email: email || '',
    passwordHash: bcrypt.hashSync(password, BCRYPT_ROUNDS),
    role,
    displayName: displayName || username,
    status,
    apiKeys: {},
    sharedApiAccess: crearAccesoApisCompartidas(status === 'active'),
    createdAt: new Date().toISOString(),
    lastLogin: null
  };

  data.users.push(nuevo);
  guardarUsuarios(data);

  registrarAuditoria({
    actorId: actorAdmin?.id || 'admin',
    actorUsername: actorAdmin?.username || 'admin',
    actorRole: actorAdmin?.role || 'superadmin',
    action: 'ADMIN_CREATE_USER',
    targetType: 'user',
    targetId: nuevo.id,
    details: { username: nuevo.username, role: nuevo.role, status: nuevo.status }
  });

  return { success: true, user: sanitizarUsuario(nuevo) };
}

/**
 * Actualiza rol, nombre o estado de un usuario.
 * @param {string} userId
 * @param {{ displayName?: string, email?: string, role?: string, status?: string }} cambios
 * @param {Object} [actorAdmin]
 * @returns {{ success: boolean, user?: Object, error?: string }}
 */
export function actualizarUsuarioAdmin(userId, cambios = {}, actorAdmin = null) {
  const data = cargarUsuarios();
  const idx = data.users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false, error: 'Usuario no encontrado.' };

  const actual = data.users[idx];
  const previousRole = actual.role;
  const previousStatus = actual.status;

  // Proteger al superadmin principal para que no sea degradado ni deshabilitado accidentalmente
  if (actual.role === 'superadmin' && cambios.role && cambios.role !== 'superadmin') {
    const superadminsRestantes = data.users.filter(u => u.role === 'superadmin' && u.id !== userId);
    if (superadminsRestantes.length === 0) {
      return { success: false, error: 'No se puede degradar al único superadministrador del sistema.' };
    }
  }

  if (cambios.role) {
    if (!ROLES_VALIDOS.has(cambios.role)) {
      return { success: false, error: 'Rol no admitido.' };
    }
    actual.role = cambios.role;
  }

  if (cambios.status) {
    if (!ESTADOS_VALIDOS.has(cambios.status)) {
      return { success: false, error: 'Estado no admitido.' };
    }
    if (actual.role === 'superadmin' && cambios.status !== 'active') {
      return { success: false, error: 'No se puede desactivar al superadministrador.' };
    }
    actual.status = cambios.status;
    if (cambios.status === 'active' && !actual.sharedApiAccess?.startsAt) {
      actual.sharedApiAccess = crearAccesoApisCompartidas(true);
    }
  }

  if (typeof cambios.sharedApiAccessEnabled === 'boolean') {
    const previous = actual.sharedApiAccess || crearAccesoApisCompartidas(false);
    if (cambios.sharedApiAccessEnabled) {
      actual.sharedApiAccess = previous.expiresAt && Date.parse(previous.expiresAt) > Date.now()
        ? { ...previous, enabled: true, revokedAt: null }
        : crearAccesoApisCompartidas(true);
    } else {
      actual.sharedApiAccess = { ...previous, enabled: false, revokedAt: new Date().toISOString() };
    }
  }

  if (typeof cambios.displayName === 'string' && cambios.displayName.trim()) {
    actual.displayName = cambios.displayName.trim();
  }

  if (typeof cambios.email === 'string') {
    actual.email = cambios.email.trim();
  }

  if (actual.role !== previousRole || actual.status !== previousStatus) {
    actual.sessionVersion = (actual.sessionVersion || 0) + 1;
  }

  guardarUsuarios(data);

  registrarAuditoria({
    actorId: actorAdmin?.id || 'admin',
    actorUsername: actorAdmin?.username || 'admin',
    actorRole: actorAdmin?.role || 'superadmin',
    action: 'ADMIN_UPDATE_USER',
    targetType: 'user',
    targetId: userId,
    details: cambios
  });

  return { success: true, user: sanitizarUsuario(actual) };
}

/**
 * Restablece la contraseña de un usuario por parte de un superadmin.
 * Si no se proporciona una contraseña, autogenera una contraseña temporal segura.
 * @param {string} userId
 * @param {string} [nuevaPassword]
 * @param {Object} [actorAdmin]
 * @returns {{ success: boolean, temporaryPassword?: string, message?: string, error?: string }}
 */
export function resetearPasswordAdmin(userId, nuevaPassword = null, actorAdmin = null) {
  let passwordFinal = nuevaPassword;
  if (!passwordFinal || typeof passwordFinal !== 'string' || passwordFinal.trim().length === 0) {
    passwordFinal = `Temp_${crypto.randomBytes(4).toString('hex')}!`;
  } else if (passwordFinal.length < 6) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
  }

  const data = cargarUsuarios();
  const idx = data.users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false, error: 'Usuario no encontrado.' };

  data.users[idx].passwordHash = bcrypt.hashSync(passwordFinal, BCRYPT_ROUNDS);
  data.users[idx].sessionVersion = (data.users[idx].sessionVersion || 0) + 1;
  guardarUsuarios(data);

  registrarAuditoria({
    actorId: actorAdmin?.id || 'admin',
    actorUsername: actorAdmin?.username || 'admin',
    actorRole: actorAdmin?.role || 'superadmin',
    action: 'ADMIN_PASSWORD_RESET',
    targetType: 'user',
    targetId: userId,
    details: { username: data.users[idx].username }
  });

  return { success: true, temporaryPassword: passwordFinal, message: 'Contraseña restablecida exitosamente.' };
}

/**
 * Activa una cuenta pendiente.
 * @param {string} userId
 * @param {Object} [actorAdmin]
 * @returns {{ success: boolean, user?: Object, error?: string }}
 */
export function activarUsuario(userId, actorAdmin = null) {
  return actualizarUsuarioAdmin(userId, { status: 'active' }, actorAdmin);
}

/**
 * Desactiva una cuenta de usuario.
 * @param {string} userId
 * @param {Object} [actorAdmin]
 * @returns {{ success: boolean, error?: string }}
 */
export function desactivarUsuario(userId, actorAdmin = null) {
  return actualizarUsuarioAdmin(userId, { status: 'disabled' }, actorAdmin);
}

/**
 * Elimina un usuario permanentemente.
 * @param {string} userId
 * @param {Object} [actorAdmin]
 * @returns {{ success: boolean, error?: string }}
 */
export function eliminarUsuario(userId, actorAdmin = null) {
  const data = cargarUsuarios();
  const idx = data.users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false, error: 'Usuario no encontrado.' };
  if (data.users[idx].role === 'superadmin') {
    return { success: false, error: 'No se puede eliminar al superadmin.' };
  }

  const [eliminado] = data.users.splice(idx, 1);
  guardarUsuarios(data);

  registrarAuditoria({
    actorId: actorAdmin?.id || 'admin',
    actorUsername: actorAdmin?.username || 'admin',
    actorRole: actorAdmin?.role || 'superadmin',
    action: 'ADMIN_DELETE_USER',
    targetType: 'user',
    targetId: userId,
    details: { username: eliminado.username }
  });

  console.log(`[Auth] 🗑️ Usuario eliminado: ${eliminado.username}`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────
//  API Keys por Usuario
// ─────────────────────────────────────────────────────────

/**
 * Actualiza las API keys de un usuario.
 * @param {string} userId
 * @param {Object} keys
 * @returns {{ success: boolean, apiKeys?: Object, error?: string }}
 */
export function actualizarApiKeys(userId, keys) {
  const data = cargarUsuarios();
  const idx = data.users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false, error: 'Usuario no encontrado.' };

  migrateApiKeys(data);
  for (const [name, value] of Object.entries(keys || {})) {
    if (value === undefined || value === null || String(value).startsWith('•••')) continue;
    if (String(value).trim() === '') continue;
    else data.users[idx].apiKeys[name] = encryptApiKey(String(value).trim());
  }

  for (const [key, value] of Object.entries(data.users[idx].apiKeys)) {
    if (!value || value.trim() === '') {
      delete data.users[idx].apiKeys[key];
    }
  }

  guardarUsuarios(data);
  return { success: true, apiKeys: Object.fromEntries(Object.entries(data.users[idx].apiKeys).map(([name, value]) => [name, maskApiKey(value)])) };
}

/**
 * Obtiene las API keys enmascaradas de un usuario.
 * @param {string} userId
 * @returns {Object}
 */
export function obtenerApiKeys(userId) {
  const usuario = buscarPorId(userId);
  return Object.fromEntries(Object.entries(usuario?.apiKeys || {}).map(([name, value]) => [name, maskApiKey(value)]));
}

/**
 * Obtiene las API keys descifradas para uso exclusivo de llamadas backend a LLMs.
 * @param {string} userId
 * @returns {Object}
 */
export function obtenerApiKeysParaServicio(userId) {
  const usuario = buscarPorId(userId);
  return Object.fromEntries(Object.entries(usuario?.apiKeys || {}).map(([name, value]) => [name, decryptApiKey(value)]));
}

/**
 * Cambia la contraseña de un usuario verificando la contraseña actual.
 * @param {string} userId
 * @param {string} passwordActual
 * @param {string} passwordNueva
 * @returns {{ success: boolean, error?: string }}
 */
export function cambiarPassword(userId, passwordActual, passwordNueva) {
  const data = cargarUsuarios();
  const idx = data.users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false, error: 'Usuario no encontrado.' };

  const usuario = data.users[idx];
  if (!bcrypt.compareSync(passwordActual, usuario.passwordHash)) {
    return { success: false, error: 'La contraseña actual es incorrecta.' };
  }
  if (passwordNueva.length < 6) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
  }

  data.users[idx].passwordHash = bcrypt.hashSync(passwordNueva, BCRYPT_ROUNDS);
  data.users[idx].sessionVersion = (data.users[idx].sessionVersion || 0) + 1;
  guardarUsuarios(data);

  registrarAuditoria({
    actorId: usuario.id,
    actorUsername: usuario.username,
    actorRole: usuario.role || 'user',
    action: 'USER_CHANGE_PASSWORD',
    targetType: 'user',
    targetId: usuario.id
  });

  console.log(`[Auth] 🔑 Contraseña cambiada: ${usuario.username}`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────
//  Utilidades
// ─────────────────────────────────────────────────────────

/**
 * Remueve campos sensibles del objeto de usuario para enviar al cliente.
 * @param {Object} usuario
 * @returns {Object} Usuario sanitizado
 */
export function sanitizarUsuario(usuario) {
  const { passwordHash: _passwordHash, apiKeys, ...limpio } = usuario;
  return {
    ...limpio,
    role: limpio.role || 'user',
    status: limpio.status || 'active',
    sharedApiAccess: obtenerEstadoApisCompartidas(usuario),
    apiKeys: Object.fromEntries(Object.entries(apiKeys || {}).map(([name, value]) => [name, maskApiKey(value)]))
  };
}

export { JWT_SECRET };
