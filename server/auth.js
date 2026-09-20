import './loadEnvironment.js';
/**
 * @file auth.js
 * @description Sistema de autenticación para Open Business Plan.
 * Implementa registro con aprobación manual, login con JWT,
 * gestión de usuarios y API keys por usuario.
 * 
 * Almacenamiento: JSON en disco (server/data/users.json).
 * Hashing: bcryptjs (puro JS, sin compilación nativa).
 * Tokens: JWT con expiración configurable.
 * 
 * [SECDD] Las contraseñas NUNCA se almacenan en texto plano.
 * [SECDD] Las API keys se almacenan encriptadas en el perfil.
 * [DDD]  Entidades: User { id, username, email, role, apiKeys, status }
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// ─────────────────────────────────────────────────────────
//  Configuración
// ─────────────────────────────────────────────────────────

// Secreto JWT: desde .env o genera uno aleatorio persistente
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || !process.env.API_KEYS_ENCRYPTION_KEY || process.env.JWT_SECRET === process.env.API_KEYS_ENCRYPTION_KEY)) {
  throw new Error('Production requires persistent, independent JWT_SECRET and API_KEYS_ENCRYPTION_KEY.');
}
const JWT_SECRET = process.env.JWT_SECRET || generarSecretoInicial();
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const BCRYPT_ROUNDS = 12;
const USERS_FILE = path.resolve('server', 'data', 'users.json');
const API_KEYS_ENCRYPTION_KEY = process.env.API_KEYS_ENCRYPTION_KEY || JWT_SECRET;
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

/**
 * Genera un secreto JWT aleatorio y lo guarda en .env.local si no existe.
 * Solo se ejecuta una vez en el primer arranque.
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
 * Crea el archivo con el admin por defecto si no existe.
 * @returns {{ users: Array<Object> }}
 */
function cargarUsuarios() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      const dirPath = path.dirname(USERS_FILE);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      // Nunca crear una cuenta administradora con una contraseña conocida.
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
        }]
      };
      fs.writeFileSync(USERS_FILE, JSON.stringify(adminDefault, null, 2), 'utf8');
      console.log('[Auth] Archivo de usuarios inicializado.');
      if (!bootstrapPassword) console.warn('[Auth] Configura BOOTSTRAP_SUPERADMIN_PASSWORD y activa al superadmin antes de usar producción.');
      return adminDefault;
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
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
  // Escritura atómica: escribir a temp y renombrar
  const tempFile = USERS_FILE + '.tmp';
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
function buscarPorUsername(username) {
  const data = cargarUsuarios();
  if (migrateApiKeys(data)) guardarUsuarios(data);
  return data.users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

/**
 * Busca un usuario por ID.
 * @param {string} id
 * @returns {Object|null}
 */
function buscarPorId(id) {
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
 * @returns {{ success: boolean, user?: Object, error?: string }}
 */
export function registrarUsuario({ username, email, password, displayName }) {
  // Validaciones
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

  // Verificar duplicados
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
    status: 'pending', // Requiere aprobación del admin
    apiKeys: {},
    createdAt: new Date().toISOString(),
    lastLogin: null
  };

  data.users.push(nuevoUsuario);
  guardarUsuarios(data);

  console.log(`[Auth] 📝 Nuevo registro pendiente: ${username} (${email})`);

  return {
    success: true,
    user: sanitizarUsuario(nuevoUsuario),
    message: 'Cuenta creada. Espera la aprobación del administrador para poder iniciar sesión.'
  };
}

/**
 * Autentica un usuario y retorna un JWT.
 * @param {{ username: string, password: string }} credenciales
 * @returns {{ success: boolean, token?: string, user?: Object, error?: string }}
 */
export function loginUsuario({ username, password }) {
  if (!username || !password) {
    return { success: false, error: 'Usuario y contraseña son obligatorios.' };
  }

  const usuario = buscarPorUsername(username);
  if (!usuario) {
    return { success: false, error: 'Credenciales inválidas.' };
  }

  // Verificar contraseña
  const passwordValida = bcrypt.compareSync(password, usuario.passwordHash);
  if (!passwordValida) {
    return { success: false, error: 'Credenciales inválidas.' };
  }

  // Verificar estado de la cuenta
  if (usuario.status === 'pending') {
    return { success: false, error: 'Tu cuenta está pendiente de aprobación. Contacta al administrador.' };
  }
  if (usuario.status === 'disabled') {
    return { success: false, error: 'Tu cuenta ha sido desactivada. Contacta al administrador.' };
  }

  // Actualizar último login
  const data = cargarUsuarios();
  const idx = data.users.findIndex(u => u.id === usuario.id);
  if (idx !== -1) {
    data.users[idx].lastLogin = new Date().toISOString();
    guardarUsuarios(data);
  }

  // Generar JWT
  const payload = {
    sub: usuario.id,
    username: usuario.username,
    role: usuario.role,
    displayName: usuario.displayName
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

  console.log(`[Auth] ✅ Login exitoso: ${username} (${usuario.role})`);

  return {
    success: true,
    token,
    user: sanitizarUsuario(usuario)
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
//  Gestión de Usuarios (Admin)
// ─────────────────────────────────────────────────────────

/**
 * Lista todos los usuarios (solo para superadmin).
 * @returns {Array<Object>} Usuarios sanitizados (sin passwordHash)
 */
export function listarUsuarios() {
  const data = cargarUsuarios();
  return data.users.map(sanitizarUsuario);
}

/**
 * Activa una cuenta pendiente.
 * @param {string} userId
 * @returns {{ success: boolean, error?: string }}
 */
export function activarUsuario(userId) {
  const data = cargarUsuarios();
  const idx = data.users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false, error: 'Usuario no encontrado.' };
  
  data.users[idx].status = 'active';
  guardarUsuarios(data);
  console.log(`[Auth] ✅ Usuario activado: ${data.users[idx].username}`);
  return { success: true, user: sanitizarUsuario(data.users[idx]) };
}

/**
 * Desactiva una cuenta de usuario.
 * @param {string} userId
 * @returns {{ success: boolean, error?: string }}
 */
export function desactivarUsuario(userId) {
  const data = cargarUsuarios();
  const idx = data.users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false, error: 'Usuario no encontrado.' };
  if (data.users[idx].role === 'superadmin') {
    return { success: false, error: 'No se puede desactivar al superadmin.' };
  }
  
  data.users[idx].status = 'disabled';
  guardarUsuarios(data);
  console.log(`[Auth] 🚫 Usuario desactivado: ${data.users[idx].username}`);
  return { success: true };
}

/**
 * Elimina un usuario permanentemente.
 * @param {string} userId
 * @returns {{ success: boolean, error?: string }}
 */
export function eliminarUsuario(userId) {
  const data = cargarUsuarios();
  const idx = data.users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false, error: 'Usuario no encontrado.' };
  if (data.users[idx].role === 'superadmin') {
    return { success: false, error: 'No se puede eliminar al superadmin.' };
  }

  const [eliminado] = data.users.splice(idx, 1);
  guardarUsuarios(data);
  console.log(`[Auth] 🗑️ Usuario eliminado: ${eliminado.username}`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────
//  API Keys por Usuario
// ─────────────────────────────────────────────────────────

/**
 * Actualiza las API keys de un usuario.
 * @param {string} userId
 * @param {Object} keys — Objeto con las claves { openrouter: 'sk-...', groq: 'gsk-...' }
 * @returns {{ success: boolean, error?: string }}
 */
export function actualizarApiKeys(userId, keys) {
  const data = cargarUsuarios();
  const idx = data.users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false, error: 'Usuario no encontrado.' };

  // Merge: mantiene keys existentes, actualiza las proporcionadas
  migrateApiKeys(data);
  for (const [name, value] of Object.entries(keys || {})) {
    if (value === undefined || value === null || String(value).startsWith('•••')) continue;
    if (String(value).trim() === '') continue;
    else data.users[idx].apiKeys[name] = encryptApiKey(String(value).trim());
  }

  // Limpiar keys vacías
  for (const [key, value] of Object.entries(data.users[idx].apiKeys)) {
    if (!value || value.trim() === '') {
      delete data.users[idx].apiKeys[key];
    }
  }

  guardarUsuarios(data);
  return { success: true, apiKeys: Object.fromEntries(Object.entries(data.users[idx].apiKeys).map(([name, value]) => [name, maskApiKey(value)])) };
}

/**
 * Obtiene las API keys de un usuario.
 * @param {string} userId
 * @returns {Object} Claves API del usuario
 */
export function obtenerApiKeys(userId) {
  const usuario = buscarPorId(userId);
  return Object.fromEntries(Object.entries(usuario?.apiKeys || {}).map(([name, value]) => [name, maskApiKey(value)]));
}

/** Uso exclusivo del backend: nunca enviar las claves descifradas al cliente. */
export function obtenerApiKeysParaServicio(userId) {
  const usuario = buscarPorId(userId);
  return Object.fromEntries(Object.entries(usuario?.apiKeys || {}).map(([name, value]) => [name, decryptApiKey(value)]));
}

/**
 * Cambia la contraseña de un usuario.
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
  guardarUsuarios(data);
  console.log(`[Auth] 🔑 Contraseña cambiada: ${usuario.username}`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────
//  Utilidades
// ─────────────────────────────────────────────────────────

/**
 * Remueve campos sensibles del objeto de usuario para enviar al frontend.
 * @param {Object} usuario
 * @returns {Object} Usuario sin passwordHash
 */
function sanitizarUsuario(usuario) {
  const { passwordHash: _passwordHash, apiKeys, ...limpio } = usuario;
  return { ...limpio, apiKeys: Object.fromEntries(Object.entries(apiKeys || {}).map(([name, value]) => [name, maskApiKey(value)])) };
}

export { JWT_SECRET, buscarPorId };
