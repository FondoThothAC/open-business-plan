/**
 * [B2] Única fuente del token DENUE/INEGI, solo desde el entorno del servidor.
 *
 * Antes el literal de la credencial estaba embebido como último fallback en
 * server/index.js, server/api/inegiAgebEngine.js, server/competitorEngine.js y
 * server/autonomousResearchEngine.js. La clave queda comprometida por su presencia en
 * el historial de git: hay que ROTARLA en el portal INEGI y cargar el valor nuevo en
 * .env.local del VPS (DENUE_KEY / INEGI_KEY).
 *
 * Devuelve '' cuando no hay configuración: los llamadores deben responder
 * 503 INEGI_TOKEN_NOT_CONFIGURED (rutas HTTP) u omitir la fuente (motores), en lugar de
 * pedir en silencio con una credencial del repositorio.
 */
export function inegiToken() {
  const names = ['INEGI_KEY', 'DENUE_KEY', 'VITE_INEGI_KEY', 'VITE_DENUE_KEY'];
  for (const name of names) {
    const value = process.env[name];
    if (value && String(value).trim()) return String(value).trim();
  }
  return '';
}

export const INEGI_TOKEN_NOT_CONFIGURED = 'INEGI_TOKEN_NOT_CONFIGURED';

/**
 * Guard para rutas HTTP: si no hay token configurable, responde 503 y devuelve null.
 * @param {import('express').Response} res
 * @param {string} token
 */
export function respondeSiSinToken(res, token) {
  if (token) return false;
  res.status(503).json({
    error: 'Falta la credencial de INEGI/DENUE en el servidor. Define DENUE_KEY o INEGI_KEY en .env.local y reinicia el proceso.',
    code: INEGI_TOKEN_NOT_CONFIGURED,
    fuente: 'INEGI'
  });
  return true;
}
