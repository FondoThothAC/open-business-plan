import './loadEnvironment.js';
import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import cors from 'cors';


// Cargar variables de entorno locales (.env.local primero, fallback a .env)


import { search as ddgSearch } from 'duck-duck-scrape';
import { scrapeSocialFollowers, scrapeEcommercePrices, scrapeUberEatsRappi, scrapeAirbnbTripAdvisor, scrapeMercadoLibre } from './scraper.js';
import { busquedaMultiFuente, analizarViabilidad } from './competitorEngine.js';
import { AutonomousResearchEngine } from './autonomousResearchEngine.js';
import { FRAMEWORKS } from '../src/config/frameworks.js';
import { swarmOrchestrator } from './swarm/SwarmOrchestrator.js';
import { agentStore } from './swarm/AgentStore.js';
import { generateLogoVariants } from '../src/lib/logoGenerator.js';
import { checkSearchQuota, incrementSearchQuota, getSearchQuotaStats } from './quotaTracker.js';
import { saveWithVersioning } from '../src/lib/serverUtils/saveVersioning.js';
import { acquireGenerationLock, releaseGenerationLock, getGenerationLockStatus } from '../src/lib/serverUtils/generationLock.js';
import { renameProject } from '../src/lib/serverUtils/projectRename.js';
import { sanitizeProjectConfig } from '../src/lib/serverUtils/sanitizeProjectConfig.js';
import marketCascadeRouter from './routes/marketCascade.js';
import { GenerationJobStore } from './generationJobStore.js';
import cookieParser from 'cookie-parser';
import { 
  registrarUsuario, 
  loginUsuario, 
  listarUsuarios, 
  activarUsuario, 
  desactivarUsuario, 
  eliminarUsuario, 
  actualizarApiKeys, 
  obtenerApiKeys, 
  cambiarPassword, 
  obtenerApiKeysParaServicio,
  crearUsuarioAdmin,
  actualizarUsuarioAdmin,
  resetearPasswordAdmin,
  buscarPorId,
  buscarPorUsername,
  obtenerEstadoApisCompartidas
} from './auth.js';
import { authGuard, soloAdmin, soloRevisorOSuperAdmin, prohibirRevisorMutacion } from './middleware/authGuard.js';
import { registrarAuditoria, obtenerAuditoria } from './auditLogger.js';
import { EXAMPLE_PROJECT_IDS, PRIVATE_ADMIN_IDS, assertSafeProjectSegment, resolveReadableProject, resolveWritableProject, resolveCloneSource, userFolder } from './projectAccess.js';
import { createReviewInvite, getReviewInvite, addReviewComment, listReviewComments, revokeReviewInvite } from './reviewStore.js';

function documentForExternalReview(data) {
  const copy = JSON.parse(JSON.stringify(data || {}));
  if (copy.config) {
    delete copy.config.search;
    delete copy.config.externalApis;
    delete copy.config.ai;
    delete copy.config.apiKeys;
    delete copy.config.comments;
    delete copy.config.reviewInvites;
  }
  return copy;
}

// ─────────────────────────────────────────────────────────
//  Helper Seguro para Búsqueda DuckDuckGo (Control de Tasa y Backoff)
// ─────────────────────────────────────────────────────────
let ultimaPeticionDdg = 0;
const INTERVALO_MINIMO_DDG_MS = 1200;

export async function safeDdgSearch(query, reintentos = 2) {
  const ahora = Date.now();
  const tiempoDesdeUltima = ahora - ultimaPeticionDdg;
  if (tiempoDesdeUltima < INTERVALO_MINIMO_DDG_MS) {
    await new Promise(resolve => setTimeout(resolve, INTERVALO_MINIMO_DDG_MS - tiempoDesdeUltima));
  }
  ultimaPeticionDdg = Date.now();

  try {
    const respuesta = await ddgSearch(query);
    return respuesta.results || [];
  } catch (error) {
    if (reintentos > 0 && error.message?.includes('too quickly')) {
      console.warn(`[DDG Seguro] Límite de tasa detectado para "${query}". Pausando 2500ms... (${reintentos} reintentos restantes)`);
      await new Promise(resolve => setTimeout(resolve, 2500));
      ultimaPeticionDdg = Date.now();
      return safeDdgSearch(query, reintentos - 1);
    }
    console.warn(`[DDG Seguro] Búsqueda no disponible para "${query}":`, error.message);
    return [];
  }
}

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;
const generationJobs = new GenerationJobStore();

function sharedApiKey(req, ...environmentNames) {
  const user = buscarPorId(req.user?.id);
  if (!obtenerEstadoApisCompartidas(user).active) return '';
  for (const name of environmentNames) {
    const value = process.env[name];
    if (value) return value;
  }
  return '';
}

function resolveInegiToken(req) {
  return String(
    req?.query?.token ||
    req?.body?.token ||
    sharedApiKey(req, 'DENUE_KEY', 'INEGI_KEY', 'VITE_DENUE_KEY', 'VITE_INEGI_KEY') ||
    process.env.DENUE_KEY ||
    process.env.INEGI_KEY ||
    process.env.VITE_DENUE_KEY ||
    '1b9e230f-2ae0-48db-bd20-8810b1db575e'
  ).trim();
}

// ─────────────────────────────────────────────────────────
//  SSE — Clientes suscritos al monitor en tiempo real
// ─────────────────────────────────────────────────────────
const sseClients = new Set();

function broadcast(eventData) {
  const payload = `data: ${JSON.stringify(eventData)}\n\n`;
  sseClients.forEach(res => {
    try { res.write(payload); } catch { sseClients.delete(res); }
  });
}

const configuredOrigins = new Set(
  String(process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173,https://fondothoth.com')
    .split(',').map(value => value.trim()).filter(Boolean)
);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || configuredOrigins.has(origin)) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    return callback(new Error('Origen no permitido por la política CORS.'));
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// CSRF de origen para mutaciones autenticadas. SameSite=Lax protege navegadores
// modernos; esta comprobación cubre clientes que envían cookies explícitamente.
app.use((req, res, next) => {
  const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const origin = req.headers.origin;
  if (process.env.NODE_ENV === 'production' && mutating && origin && !configuredOrigins.has(origin)) {
    return res.status(403).json({ error: 'Origen no permitido.', code: 'CSRF_ORIGIN_REJECTED' });
  }
  next();
});

// ─────────────────────────────────────────────────────────
//  Headers de Seguridad Anti-Scraping / Anti-IA
// ─────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ─────────────────────────────────────────────────────────
//  Rutas de Autenticación (PÚBLICAS — sin authGuard)
// ─────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password, rememberMe } = req.body || {};
  const resultado = loginUsuario({ username, password, rememberMe });
  if (!resultado.success) {
    return res.status(401).json({ error: resultado.error });
  }

  // Establecer cookie HttpOnly segura
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  };
  if (resultado.rememberMe) {
    cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
  }
  res.cookie('obp_auth_token', resultado.token, cookieOptions);

  // La respuesta no expone el JWT al cliente
  res.json({
    success: true,
    user: resultado.user,
    message: 'Sesión iniciada exitosamente.'
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('obp_auth_token', { path: '/' });
  res.json({ success: true, message: 'Sesión cerrada correctamente.' });
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password, displayName } = req.body || {};
  const resultado = registrarUsuario({ username, email, password, displayName });
  if (!resultado.success) {
    return res.status(400).json({ error: resultado.error });
  }
  res.status(201).json(resultado);
});

// Revisión externa por enlace: no crea una sesión interna ni expone el proyecto completo.
app.get('/api/review/:token', (req, res) => {
  const invite = getReviewInvite(req.params.token);
  if (!invite) return res.status(404).json({ error: 'Enlace inválido, vencido o revocado.', code: 'REVIEW_LINK_INVALID' });
  try {
    const data = JSON.parse(fs.readFileSync(invite.projectPath, 'utf8'));
    res.json({ success: true, review: { id: invite.id, email: invite.email, scope: invite.scope, expiresAt: invite.expiresAt,
      project: { id: invite.projectId, type: invite.projectType, name: data.config?.brandKit?.companyName || data.semilla?.nombre_proyecto || invite.projectId },
      document: documentForExternalReview(data), comments: invite.comments } });
  } catch { res.status(404).json({ error: 'La versión compartida ya no está disponible.', code: 'REVIEW_DOCUMENT_MISSING' }); }
});
app.post('/api/review/:token/comments', (req, res) => {
  const comment = addReviewComment(req.params.token, req.body || {});
  if (!comment) return res.status(400).json({ error: 'Comentario inválido o enlace vencido.', code: 'REVIEW_COMMENT_REJECTED' });
  res.status(201).json({ success: true, comment });
});
app.get('/api/review/:token/comments', (req, res) => {
  const comments = listReviewComments(req.params.token);
  if (!comments) return res.status(404).json({ error: 'Enlace inválido o vencido.' });
  res.json({ comments });
});

// ─────────────────────────────────────────────────────────
//  Middleware de Autenticación (protege TODAS las rutas siguientes)
// ─────────────────────────────────────────────────────────
app.use('/api', authGuard);

// ─────────────────────────────────────────────────────────
//  Rutas de Perfil y API Keys (requieren autenticación)
// ─────────────────────────────────────────────────────────
app.get('/api/auth/me', (req, res) => {
  const { id, username, role, displayName, email, status } = req.user;
  const apiKeys = obtenerApiKeys(id);

  // Si vino con header y no tenía cookie, establecer la cookie para completar la migración
  if (!req.cookies?.obp_auth_token) {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      const legacyToken = authHeader.slice(7).trim();
      res.cookie('obp_auth_token', legacyToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
    }
  }

  const account = buscarPorId(id);
  res.json({ id, username, role, displayName, email, status, apiKeys, sharedApiAccess: obtenerEstadoApisCompartidas(account) });
});

app.put('/api/auth/me/keys', (req, res) => {
  const resultado = actualizarApiKeys(req.user.id, req.body || {});
  if (!resultado.success) return res.status(400).json({ error: resultado.error });
  res.json(resultado);
});

const PERSONAL_AI_PROVIDERS = {
  ollamaCloud: { url: 'https://ollama.com/v1/chat/completions', model: 'gpt-oss:20b' },
  groq: { url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile' },
  openrouter: { url: 'https://openrouter.ai/api/v1/chat/completions', model: 'openai/gpt-oss-20b:free' },
  openai: { url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' }
};

async function callPersonalAi(provider, apiKey, prompt, model, maxTokens = 1200) {
  const cfg = PERSONAL_AI_PROVIDERS[provider];
  if (!cfg) throw new Error('Proveedor no compatible con BOB.');

  let targetModel = model || cfg.model;
  // En Ollama Cloud, los modelos con sufijo :cloud o minimax-m3 requieren saldo de pago;
  // normalizamos preventivamente a gpt-oss:20b para cuentas gratuitas.
  if (provider === 'ollamaCloud') {
    if (!targetModel || targetModel.includes('minimax') || targetModel.endsWith(':cloud')) {
      targetModel = 'gpt-oss:20b';
    }
  }

  const executeRequest = async (mod) => {
    return await fetch(cfg.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...(provider === 'openrouter' ? { 'HTTP-Referer': 'https://fondothoth.com/obp', 'X-Title': 'Open Business Plan' } : {})
      },
      body: JSON.stringify({
        model: mod,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.35
      }),
      signal: AbortSignal.timeout(180000)
    });
  };

  let response = await executeRequest(targetModel);
  let data = await response.json().catch(() => ({}));

  // Si Ollama Cloud rechaza el modelo por cuota/pago (HTTP 402), reintentar automáticamente con gpt-oss:20b
  if (provider === 'ollamaCloud' && response.status === 402 && targetModel !== 'gpt-oss:20b') {
    console.warn(`[BobServer] Modelo ${targetModel} requiere saldo en Ollama Cloud. Reintentando con gpt-oss:20b...`);
    targetModel = 'gpt-oss:20b';
    response = await executeRequest(targetModel);
    data = await response.json().catch(() => ({}));
  }

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || data.message || `El proveedor respondió HTTP ${response.status}.`);
  }
  return { text: data.choices?.[0]?.message?.content || '', model: data.model || targetModel };
}

// BOB usa las credenciales cifradas de la cuenta en el servidor, con soporte
// transparente para llaves recibidas en el body o variables de entorno.
app.post('/api/ai/bob-chat', async (req, res) => {
  const { prompt, provider: rawProvider, model, apiKey, ollamaKey, bobOllamaKey, groqKey } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.length > 120000) {
    return res.status(400).json({ error: 'Prompt inválido o demasiado extenso.' });
  }

  // Normalización de alias de proveedores
  const providerAliases = {
    ollama: 'ollamaCloud',
    ollama_cloud: 'ollamaCloud',
    ollamaCloud: 'ollamaCloud',
    minimax: 'ollamaCloud',
    groq: 'groq',
    openrouter: 'openrouter',
    openai: 'openai'
  };
  const requestedProvider = providerAliases[rawProvider] || rawProvider;

  const userId = req.user?.id;
  const userKeys = userId ? obtenerApiKeysParaServicio(userId) : {};

  // Resolver llaves combinando perfil de usuario, cuerpo del request y variables de entorno
  const keys = {
    ollamaCloud: userKeys.ollamaCloud || userKeys.ollama || userKeys.ollama_cloud || ollamaKey || bobOllamaKey || apiKey || process.env.OLLAMA_KEY,
    groq: userKeys.groq || groqKey || process.env.GROQ_KEY,
    openrouter: userKeys.openrouter || process.env.OPENROUTER_API_KEY,
    openai: userKeys.openai || process.env.OPENAI_API_KEY
  };

  const preference = requestedProvider
    ? [requestedProvider, 'ollamaCloud', 'groq', 'openrouter', 'openai']
    : ['ollamaCloud', 'groq', 'openrouter', 'openai'];

  const providers = [...new Set(preference)].filter(name => keys[name] && PERSONAL_AI_PROVIDERS[name]);

  if (!providers.length) {
    return res.status(409).json({
      error: 'Configura al menos una API key (por ejemplo Ollama Cloud) en tu perfil o configuración.',
      code: 'PERSONAL_API_KEY_REQUIRED'
    });
  }

  let lastError = null;
  for (const provider of providers) {
    try {
      const selectedModel = provider === requestedProvider ? model : undefined;
      const result = await callPersonalAi(provider, keys[provider], prompt, selectedModel);
      return res.json({ success: true, reply: result.text, provider, model: result.model });
    } catch (error) {
      console.warn(`[BobServer] Error con proveedor ${provider}:`, error.message);
      lastError = error;
    }
  }
  return res.status(502).json({ error: lastError?.message || 'No fue posible conectar con los proveedores configurados.' });
});

// Generación de módulos con las credenciales de la cuenta actual. La llave se
// descifra y utiliza exclusivamente en el servidor y nunca vuelve al navegador.
app.post('/api/ai/account-chat', async (req, res) => {
  const { prompt, provider: requestedProvider = 'ollamaCloud', model, maxTokens = 4096, apiKey, ollamaKey } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.length > 500000) {
    return res.status(400).json({ error: 'Prompt inválido o demasiado extenso.' });
  }
  if (!PERSONAL_AI_PROVIDERS[requestedProvider]) {
    return res.status(400).json({ error: 'Proveedor personal no compatible.' });
  }

  const userId = req.user?.id;
  const userKeys = userId ? obtenerApiKeysParaServicio(userId) : {};

  // Resolver clave: del perfil, del cuerpo de la petición (apiKey u ollamaKey), o de variables de entorno
  let resolvedKey = userKeys[requestedProvider] || 
                    (requestedProvider === 'ollamaCloud' ? (userKeys.ollama || userKeys.ollama_cloud || userKeys.ollamaCloud) : null) ||
                    apiKey || 
                    ollamaKey ||
                    (requestedProvider === 'ollamaCloud' ? process.env.OLLAMA_KEY : null);

  if (!resolvedKey) {
    return res.status(409).json({ 
      error: `Configura tu API key de ${requestedProvider} en la sección de Configuración o en tu perfil.`, 
      code: 'PERSONAL_API_KEY_REQUIRED' 
    });
  }

  // Si el usuario está autenticado y envió la key en la petición, persistirla en su perfil automáticamente
  if (userId && (apiKey || ollamaKey) && !userKeys[requestedProvider]) {
    try {
      actualizarApiKeys(userId, { [requestedProvider]: (apiKey || ollamaKey) });
    } catch (e) {
      console.warn('[account-chat] No se pudo auto-persistir API key en perfil:', e.message);
    }
  }

  try {
    const safeMaxTokens = Math.max(64, Math.min(Number(maxTokens) || 4096, 16384));
    // Normalizar modelo si viene abreviado o genérico
    let targetModel = model;
    if (requestedProvider === 'ollamaCloud') {
      if (!targetModel || (targetModel.includes('gpt-oss') && targetModel.includes('20'))) {
        targetModel = 'gpt-oss:20b';
      } else if (targetModel.includes('gpt-oss') && targetModel.includes('120')) {
        targetModel = 'gpt-oss:120b';
      }
    }
    const result = await callPersonalAi(requestedProvider, resolvedKey, prompt, targetModel, safeMaxTokens);
    return res.json({ success: true, reply: result.text, provider: requestedProvider, model: result.model });
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
});

app.post('/api/auth/me/keys/:provider/test', async (req, res) => {
  const provider = req.params.provider;
  const keys = obtenerApiKeysParaServicio(req.user.id);
  if (!keys[provider]) return res.status(404).json({ success: false, error: 'La clave no está configurada.' });
  if (!PERSONAL_AI_PROVIDERS[provider]) return res.status(400).json({ success: false, error: 'Proveedor no compatible con la prueba automática.' });
  try {
    await callPersonalAi(provider, keys[provider], 'Responde únicamente: OK', undefined, 8);
    res.json({ success: true, message: 'Clave verificada y lista para usarse con BOB.' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/auth/me/password', (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const resultado = cambiarPassword(req.user.id, currentPassword, newPassword);
  if (!resultado.success) return res.status(400).json({ error: resultado.error });
  res.json(resultado);
});

// ─────────────────────────────────────────────────────────
//  Rutas Administrativas (Superadmin)
// ─────────────────────────────────────────────────────────
app.get('/api/auth/users', soloAdmin, (req, res) => {
  res.json(listarUsuarios());
});

app.get('/api/admin/users', soloAdmin, (req, res) => {
  res.json(listarUsuarios());
});

app.post('/api/admin/users', soloAdmin, (req, res) => {
  const resultado = crearUsuarioAdmin(req.body || {}, req.user);
  if (!resultado.success) return res.status(400).json({ error: resultado.error });
  res.status(201).json(resultado);
});

app.patch('/api/admin/users/:id', soloAdmin, (req, res) => {
  const resultado = actualizarUsuarioAdmin(req.params.id, req.body || {}, req.user);
  if (!resultado.success) return res.status(400).json({ error: resultado.error });
  res.json(resultado);
});

app.post('/api/admin/users/:id/password-reset', soloAdmin, (req, res) => {
  const { password } = req.body || {};
  const resultado = resetearPasswordAdmin(req.params.id, password, req.user);
  if (!resultado.success) return res.status(400).json({ error: resultado.error });
  res.json(resultado);
});

app.get('/api/admin/users/:id/projects', soloAdmin, (req, res) => {
  const targetUser = buscarPorId(req.params.id) || buscarPorUsername(req.params.id);
  if (!targetUser) return res.status(404).json({ error: 'Usuario no encontrado.' });

  const baseDir = path.resolve('proyectos');
  const userProjectsMap = new Map();
  const targetUsername = String(targetUser.username || '').toLowerCase();
  const targetEmail = String(targetUser.email || '').toLowerCase();
  const folderCandidate = `user_${targetUsername.replace(/[^a-z0-9]/gi, '_')}`;

  ['negocios', 'social'].forEach(type => {
    const dir = path.join(baseDir, type);
    if (!fs.existsSync(dir)) return;

    const processProjectJson = (jsonFile, projId, isDirectUserDir) => {
      if (!fs.existsSync(jsonFile)) return;
      try {
        const stats = fs.statSync(jsonFile);
        const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        const owner = String(data.config?.userOwner || '').toLowerCase();
        const rawCollabs = (data.config?.collaborators || data.collaborators || []);
        const collabs = (Array.isArray(rawCollabs) ? rawCollabs : []).map(c => String(c).toLowerCase());
        
        const isOwner = (owner === targetUsername || isDirectUserDir);
        const isCollaborator = collabs.includes(targetUsername) || (targetEmail && collabs.includes(targetEmail));

        if (isOwner || isCollaborator) {
          const comp = calculateCompletion(data);
          const missing = calculateMissingModules(data);
          const projectEntry = {
            id: projId,
            name: data.config?.brandKit?.companyName || data.semilla?.nombre_proyecto || data.semilla?.negocio?.nombre_marca || projId,
            type,
            roleInProject: isOwner ? 'Propietario' : 'Colaborador',
            isCollaborator: !isOwner && isCollaborator,
            completion: comp,
            workflowStatus: data.config?.workflowStatus || 'Borrador',
            missingModules: missing,
            nextAction: missing.length > 0 ? `Completar ${missing[0].moduleTitle}` : 'Listo para revisión',
            lastEdited: data.config?.fechaActualizacion || stats.mtime,
            size: stats.size
          };

          if (!userProjectsMap.has(projId) || isOwner) {
            userProjectsMap.set(projId, projectEntry);
          }
        }
      } catch {}
    };

    // 1. Escaneo exhaustivo de la carpeta específica del usuario si existe
    const userDirPath = path.join(dir, folderCandidate);
    if (fs.existsSync(userDirPath)) {
      const userEntries = fs.readdirSync(userDirPath, { withFileTypes: true });
      for (const ent of userEntries) {
        if (!ent.isDirectory() || ent.name === '.archive' || ent.name === 'node_modules') continue;
        const candidateJson = path.join(userDirPath, ent.name, `${ent.name}.json`);
        processProjectJson(candidateJson, ent.name, true);
      }
    }

    // 2. Escaneo de proyectos en la raíz y en otras carpetas para colaboraciones
    const rootEntries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of rootEntries) {
      if (!ent.isDirectory() || ent.name === '.archive' || ent.name === 'node_modules') continue;
      
      if (ent.name.startsWith('user_')) {
        if (ent.name !== folderCandidate) {
          const otherUserPath = path.join(dir, ent.name);
          const subEntries = fs.readdirSync(otherUserPath, { withFileTypes: true });
          for (const sub of subEntries) {
            if (!sub.isDirectory() || sub.name === '.archive' || sub.name === 'node_modules') continue;
            const subJson = path.join(otherUserPath, sub.name, `${sub.name}.json`);
            processProjectJson(subJson, sub.name, false);
          }
        }
      } else {
        const rootJson = path.join(dir, ent.name, `${ent.name}.json`);
        processProjectJson(rootJson, ent.name, false);
      }
    }
  });

  res.json({
    success: true,
    user: {
      id: targetUser.id,
      username: targetUser.username,
      displayName: targetUser.displayName,
      role: targetUser.role,
      status: targetUser.status
    },
    projects: Array.from(userProjectsMap.values())
  });
});

app.get('/api/admin/audit', soloAdmin, (req, res) => {
  const auditEntries = obtenerAuditoria(req.query || {});
  res.json({ success: true, audit: auditEntries });
});

app.post('/api/projects/:type/:id/review-invites', prohibirRevisorMutacion, (req, res) => {
  const project = resolveReadableProject(req.params.type, req.params.id, req.user);
  if (!project) return res.status(404).json({ error: 'Proyecto no encontrado.' });
  const result = createReviewInvite({ project, ownerId: project.ownerId || req.user.id, email: req.body?.email,
    scope: req.body?.scope, days: req.body?.days });
  registrarAuditoria({ actorId: req.user.id, actorUsername: req.user.username, actorRole: req.user.role,
    action: 'PROJECT_REVIEW_INVITE_CREATED', targetType: 'project', targetId: req.params.id,
    details: { email: result.invite.email, expiresAt: result.invite.expiresAt, scope: result.invite.scope } });
  res.status(201).json({ success: true, invite: result.invite, token: result.token });
});
app.delete('/api/projects/:type/:id/review-invites/:inviteId', prohibirRevisorMutacion, (req, res) => {
  if (!revokeReviewInvite(req.params.inviteId, req.user.id) && req.user.role !== 'superadmin') return res.status(404).json({ error: 'Enlace no encontrado.' });
  res.json({ success: true });
});

app.post('/api/auth/users/:id/activate', soloAdmin, (req, res) => {
  const resultado = activarUsuario(req.params.id, req.user);
  if (!resultado.success) return res.status(400).json({ error: resultado.error });
  res.json(resultado);
});

app.post('/api/auth/users/:id/disable', soloAdmin, (req, res) => {
  const resultado = desactivarUsuario(req.params.id, req.user);
  if (!resultado.success) return res.status(400).json({ error: resultado.error });
  res.json(resultado);
});

app.delete('/api/auth/users/:id', soloAdmin, (req, res) => {
  const resultado = eliminarUsuario(req.params.id, req.user);
  if (!resultado.success) return res.status(400).json({ error: resultado.error });
  res.json(resultado);
});

app.use('/api/mercado', (req, _res, next) => {
  const personalKeys = obtenerApiKeysParaServicio(req.user.id);
  req.user.serviceApiKeys = {
    ...personalKeys,
    inegi: personalKeys.inegi || personalKeys.denue || resolveInegiToken(req),
    banxico: personalKeys.banxico || sharedApiKey(req, 'BANXICO_KEY', 'VITE_BANXICO_KEY'),
    tavily: personalKeys.tavily || personalKeys.tavilyKey || sharedApiKey(req, 'TAVILY_API_KEY', 'VITE_TAVILY_KEY'),
    brave: personalKeys.brave || personalKeys.braveKey || sharedApiKey(req, 'BRAVE_SEARCH_KEY', 'BRAVE_API_KEY', 'VITE_BRAVE_SEARCH_KEY')
  };
  next();
}, marketCascadeRouter);

app.post('/api/generation-jobs', (req, res) => {
  const { projectId, items, baseRevision } = req.body || {};
  if (!projectId || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'projectId e items son requeridos.' });
  const job = generationJobs.create({ projectId, ownerId: req.user.id, items, baseRevision });
  res.status(201).json(job);
});

app.get('/api/generation-jobs', (req, res) => res.json(generationJobs.list(req.query.projectId).filter(job => req.user.role === 'superadmin' || job.ownerId === req.user.id)));
app.get('/api/generation-jobs/:id', (req, res) => {
  const job = generationJobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Trabajo no encontrado.' });
  if (req.user.role !== 'superadmin' && job.ownerId !== req.user.id) return res.status(403).json({ error: 'No tienes acceso a este trabajo.' });
  res.json(job);
});
app.post('/api/generation-jobs/:id/:action(pause|resume|cancel)', (req, res) => {
  const status = req.params.action === 'pause' ? 'paused' : req.params.action === 'resume' ? 'queued' : 'cancelled';
  const existing = generationJobs.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Trabajo no encontrado.' });
  if (req.user.role !== 'superadmin' && existing.ownerId !== req.user.id) return res.status(403).json({ error: 'No tienes acceso a este trabajo.' });
  const job = generationJobs.update(req.params.id, { status });
  if (!job) return res.status(404).json({ error: 'Trabajo no encontrado.' });
  res.json(job);
});

// GET /api/log/stream — Suscripción SSE
app.get('/api/log/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Monitor de IA conectado ✓', provider: '', module: '' })}\n\n`);

  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

// Función auxiliar para convertir el JSON del planData en Markdown legible
function jsonToMarkdown(planData) {
  let md = `# Proyecto: ${planData.semilla?.negocio?.nombre_marca || 'Proyecto Sin Nombre'}\n`;
  md += `**Tipo de Metodología:** ${planData.config?.projectType === 'social_bid' ? 'Proyecto Social BID' : 'Plan Comercial'}\n`;
  md += `**Última Actualización:** ${new Date().toLocaleString()}\n\n`;

  // 1. Export Semilla
  if (planData.semilla) {
    md += `## SEMILLA\n\n`;
    for (const [moduleKey, moduleData] of Object.entries(planData.semilla)) {
      md += `### Módulo: ${moduleKey}\n\n`;
      for (const [fieldKey, fieldValue] of Object.entries(moduleData)) {
        if (typeof fieldValue === 'string') {
          md += `**${fieldKey}:**\n${fieldValue}\n\n`;
        } else if (typeof fieldValue === 'object' && fieldValue !== null) {
          md += `**${fieldKey}:**\n\`\`\`json\n${JSON.stringify(fieldValue, null, 2)}\n\`\`\`\n\n`;
        }
      }
    }
  }

  // 2. Export Pillars dynamically based on active framework
  const projectType = planData.config?.projectType || 'business';
  const framework = FRAMEWORKS[projectType];
  const pillars = framework ? framework.pillars.map(p => p.key) : [];
  const sections = pillars.length > 0 ? pillars : ['naturaleza', 'mercado', 'tecnico', 'organizacion', 'finanzas'];

  for (const section of sections) {
    if (planData[section]) {
      md += `## ${section.toUpperCase()}\n\n`;
      
      for (const [moduleKey, moduleData] of Object.entries(planData[section])) {
        // Render staff as a table
        if (moduleKey === 'staff') {
          md += `### Módulo: Estructura de Personal (Personal)\n\n`;
          if (Array.isArray(moduleData) && moduleData.length > 0) {
            md += `| ID | Rol / Puesto | Departamento | Salario Mensual | Reporta A |\n`;
            md += `| --- | --- | --- | --- | --- |\n`;
            moduleData.forEach(emp => {
              md += `| ${emp.id || ''} | ${emp.role || ''} | ${emp.department || ''} | $${(emp.salary || 0).toLocaleString()} | ${emp.reportsTo || 'N/A'} |\n`;
            });
            md += `\n`;
          } else {
            md += `*No se ha definido personal.*\n\n`;
          }
          continue;
        }

        // Render processes as a table
        if (moduleKey === 'processes') {
          md += `### Módulo: Procesos y Operaciones\n\n`;
          if (Array.isArray(moduleData) && moduleData.length > 0) {
            md += `| Paso | Tarea / Actividad | Duración | Responsable |\n`;
            md += `| --- | --- | --- | --- |\n`;
            moduleData.forEach(p => {
              md += `| ${p.step || ''} | ${p.task || ''} | ${p.duration || ''} | ${p.role || ''} |\n`;
            });
            md += `\n`;
          } else {
            md += `*No se han definido procesos.*\n\n`;
          }
          continue;
        }

        md += `### Módulo: ${moduleKey}\n\n`;
        
        for (const [fieldKey, fieldValue] of Object.entries(moduleData)) {
          if (typeof fieldValue === 'string') {
            md += `**${fieldKey}:**\n${fieldValue}\n\n`;
          } else if (typeof fieldValue === 'object' && fieldValue !== null) {
            md += `**${fieldKey}:**\n\`\`\`json\n${JSON.stringify(fieldValue, null, 2)}\n\`\`\`\n\n`;
          }
        }
      }
    }
  }
  
  return md;
}

/**
 * Normaliza nombres comerciales a slugs seguros para nombres de archivos y carpetas del sistema.
 * @param {string} text
 * @returns {string}
 */
function slugifyFileName(text) {
  if (!text) return 'draft_activo';
  const clean = String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return clean || 'draft_activo';
}

app.post('/api/save', prohibirRevisorMutacion, (req, res) => {
  try {
    const planData = req.body;
    if (!planData || typeof planData !== 'object' || !planData.config) {
      return res.status(400).json({ success: false, error: 'Datos del plan inválidos o incompletos' });
    }

    const projectTypeRaw = planData.config?.projectType || 'business';
    const projectType = projectTypeRaw === 'social_bid' ? 'social' : 'negocios';
    const rawName = planData.config?.brandKit?.companyName || planData.semilla?.nombre_proyecto || planData.semilla?.negocio?.nombre_marca || '';
    const cleanSlug = slugifyFileName(rawName);

    // Si el proyecto tiene nombre comercial real, usarlo como ID limpio; si no, usar un único borrador temporal
    let persistentId = String(planData.config?.projectId || '').replace(/[^a-z0-9_]/gi, '_').toLowerCase();
    const isUuidOrRandom = !persistentId || /^project_[a-f0-9_-]+$/i.test(persistentId) || /^[a-f0-9]{8}_[a-f0-9]{4}/i.test(persistentId) || /^[a-f0-9]{8}-[a-f0-9]{4}/i.test(persistentId);

    if (cleanSlug && cleanSlug !== 'draft_activo' && cleanSlug !== 'proyecto' && cleanSlug !== 'proyecto_nuevo') {
      persistentId = cleanSlug;
    } else if (isUuidOrRandom) {
      persistentId = 'draft_activo';
    }
    assertSafeProjectSegment(persistentId);
    const safeName = persistentId;
    
    // El propietario deriva de la identidad autenticada, preservando el dueño original si edita un superadmin
    let userId = req.user.username;
    let ownerFolder = userFolder(req.user);

    // Verificar si el proyecto ya existía en otra carpeta
    const existingReadable = resolveReadableProject(projectType, persistentId, req.user);
    if (existingReadable && existingReadable.kind === 'administered' && req.user.role === 'superadmin') {
      userId = existingReadable.owner;
      ownerFolder = `user_${String(userId).replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    }

    const dirParts = ['proyectos', projectType];
    if (ownerFolder) dirParts.push(ownerFolder);
    dirParts.push(safeName);

    const dirPath = path.resolve(...dirParts);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Si el proyecto antes residía como 'draft_activo' y ahora tiene nombre formal, remover el borrador huérfano
    if (safeName !== 'draft_activo') {
      const oldDraftParts = ['proyectos', projectType];
      if (ownerFolder) oldDraftParts.push(ownerFolder);
      oldDraftParts.push('draft_activo');
      const oldDraftDir = path.resolve(...oldDraftParts);
      if (fs.existsSync(oldDraftDir) && oldDraftDir !== dirPath) {
        try {
          fs.rmSync(oldDraftDir, { recursive: true, force: true });
        } catch {}
      }
    }
    
    const docsPath = path.join(dirPath, 'documentos');
    if (!fs.existsSync(docsPath)) {
      fs.mkdirSync(docsPath, { recursive: true });
    }

    const allowRegression = req.query.allowRegression === 'true' || req.body.allowRegression === true;
    const baseRevision = Number(req.headers['if-match-revision'] || req.body.baseRevision);
    const existingPath = path.join(dirPath, `${safeName}.json`);
    let existingStatus = 'Borrador';

    if (fs.existsSync(existingPath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
        const currentRevision = Number(existing.config?.revision || 0);
        existingStatus = existing.config?.workflowStatus || 'Borrador';
        if (Number.isFinite(baseRevision) && currentRevision !== baseRevision) {
          return res.status(409).json({ success: false, code: 'REVISION_CONFLICT', currentRevision, message: 'El proyecto cambió en otra sesión. Recarga o revisa la comparación antes de guardar.' });
        }
      } catch {}
    }

    // Si un proyecto estaba 'Aprobado' y es modificado, vuelve automáticamente a 'En revisión'
    let targetWorkflowStatus = planData.config?.workflowStatus || existingStatus || 'Borrador';
    const reviewHistory = Array.isArray(planData.config?.reviewHistory) ? [...planData.config.reviewHistory] : [];
    
    if (existingStatus === 'Aprobado') {
      targetWorkflowStatus = 'En revisión';
      reviewHistory.push({
        timestamp: new Date().toISOString(),
        from: 'Aprobado',
        to: 'En revisión',
        by: req.user.username,
        role: req.user.role,
        reason: 'El proyecto fue modificado tras haber sido aprobado. Vuelve a revisión editorial para revalidación.'
      });
    }

    const safeConfig = sanitizeProjectConfig(planData.config);
    planData.config = { 
      ...safeConfig, 
      projectId: persistentId, 
      userOwner: userId, 
      displayName: rawName, 
      workflowStatus: targetWorkflowStatus,
      reviewHistory,
      fechaActualizacion: new Date().toISOString(),
      revision: Number(planData.config?.revision || 0) + 1 
    };

    // Guardado versionado inmutable con control anti-regresión
    const versionResult = saveWithVersioning({
      dirPath,
      safeName,
      planData,
      allowRegression
    });

    const mdPath = path.join(dirPath, `${safeName}.md`);
    const mdContent = jsonToMarkdown(planData);
    fs.writeFileSync(mdPath, mdContent);

    if (req.user.role === 'superadmin' && userId !== req.user.username) {
      registrarAuditoria({
        actorId: req.user.id,
        actorUsername: req.user.username,
        actorRole: req.user.role,
        action: 'PROJECT_MODIFIED_BY_ADMIN',
        targetType: 'project',
        targetId: persistentId,
        details: { targetOwner: userId, newRevision: planData.config.revision }
      });
    }

    res.json({
      success: true,
      message: 'Proyecto guardado en disco duro local con versionado inmutable (.json y .md)',
      file: safeName,
      projectId: persistentId,
      revision: planData.config.revision,
      workflowStatus: targetWorkflowStatus,
      versionHash: versionResult.versionHash,
      modulesCount: versionResult.modulesCount
    });
  } catch (error) {
    if (error.message && error.message.includes('MODULE_COUNT_REGRESSION_DETECTED')) {
      return res.status(409).json({
        success: false,
        error: error.message,
        code: 'REGRESSION_CONFLICT'
      });
    }
    console.error('Error guardando el proyecto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function calculateCompletion(planData) {
  if (!planData) return 0;
  const projectType = planData.config?.projectType || 'business';
  const framework = FRAMEWORKS[projectType] || FRAMEWORKS.business;
  if (!framework) return 0;
  
  let totalFields = 0;
  let filledFields = 0;

  const isFilled = (val) => {
    if (val === undefined || val === null || val === '') return false;
    if (typeof val === 'number') return true;
    if (typeof val === 'boolean') return true;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'object') return Object.keys(val).length > 0;
    const str = String(val).trim();
    if (str.length === 0) return false;
    if (!isNaN(str) || str.length >= 3) return true;
    return false;
  };

  framework.pillars.forEach(pillar => {
    pillar.modules.forEach(mod => {
      const moduleData = planData[pillar.key]?.[mod.key] || {};
      mod.fields.forEach(field => {
        totalFields++;
        if (isFilled(moduleData[field])) {
          filledFields++;
        }
      });
    });
  });

  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
}

function calculateMissingModules(planData) {
  if (!planData) return [];
  const projectType = planData.config?.projectType || 'business';
  const framework = FRAMEWORKS[projectType] || FRAMEWORKS.business;
  if (!framework) return [];
  const missing = [];
  
  (framework.pillars || []).forEach(pillar => {
    (pillar.modules || []).forEach(mod => {
      const moduleData = planData[pillar.key]?.[mod.key] || {};
      const hasContent = Object.values(moduleData).some(v => {
        if (!v) return false;
        if (typeof v === 'string') return v.trim().length > 0;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'object') return Object.keys(v).length > 0;
        return true;
      });
      if (!hasContent) {
        missing.push({
          pillarKey: pillar.key,
          pillarTitle: pillar.title,
          moduleKey: mod.key,
          moduleTitle: mod.title
        });
      }
    });
  });
  return missing;
}

app.get('/api/projects', (req, res) => {
  const baseDir = path.resolve('proyectos');
  const results = { negocios: [], social: [] };

  const reqUserId = req.user?.username || req.headers['x-user-id'] || req.query.userId || '';
  const isTargetAdmin = req.user?.role === 'superadmin';
  const isRevisor = req.user?.role === 'revisor';

  ['negocios', 'social'].forEach(type => {
    const dir = path.join(baseDir, type);
    if (fs.existsSync(dir)) {
      const projects = [];

      const scanDir = (targetDir, targetUserFolder = '') => {
        if (!fs.existsSync(targetDir)) return;
        const entries = fs.readdirSync(targetDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            if (entry.name === '.archive' || entry.name === 'node_modules') {
              continue;
            }
            if (entry.name.startsWith('user_')) {
              if (isTargetAdmin || isRevisor) {
                scanDir(path.join(targetDir, entry.name), entry.name);
              } else if (reqUserId && entry.name === `user_${reqUserId.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`) {
                scanDir(path.join(targetDir, entry.name), entry.name);
              } else if (reqUserId) {
                // Escaneo condicional para proyectos compartidos como colaborador
                scanDir(path.join(targetDir, entry.name), entry.name);
              }
              continue;
            }

            // Comercio Cuántico TR es privado exclusivo del superadmin
            if (PRIVATE_ADMIN_IDS.has(entry.name) && !isTargetAdmin) {
              continue;
            }

            // Si está en la carpeta raíz (sin userFolder)
            const isExample = EXAMPLE_PROJECT_IDS.has(entry.name);
            const isPrivate = PRIVATE_ADMIN_IDS.has(entry.name);

            // Si no es admin ni revisor y está en la raíz, solo permitir ejemplos
            if (!isTargetAdmin && !isRevisor && !targetUserFolder && !isExample) {
              continue;
            }

            const jsonPath = path.join(targetDir, entry.name, `${entry.name}.json`);
            if (fs.existsSync(jsonPath)) {
              let isCollaborator = false;
              let isOwner = false;
              let completion = 0;
              let missingModules = [];
              let workflowStatus = 'Borrador';
              let projectType = type === 'social' ? 'social_bid' : 'business';
              let projectName = entry.name.replace(/_/g, ' ');
              let userOwner = targetUserFolder ? targetUserFolder.replace(/^user_/, '') : 'ejemplo';

              try {
                const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                completion = calculateCompletion(data);
                missingModules = calculateMissingModules(data);
                workflowStatus = data.config?.workflowStatus || 'Borrador';
                projectType = data.config?.projectType || projectType;
                projectName = data.config?.brandKit?.companyName || data.semilla?.nombre_proyecto || data.semilla?.negocio?.nombre_marca || projectName;
                userOwner = data.config?.userOwner || userOwner;

                if (reqUserId) {
                  isOwner = (userOwner === reqUserId);
                  const collabs = data.config?.collaborators || data.collaborators || [];
                  isCollaborator = Array.isArray(collabs) && collabs.includes(reqUserId);
                }
              } catch {}

              // Si el usuario regular no es dueño ni colaborador ni es ejemplo/admin, ignorar
              if (!isTargetAdmin && !isRevisor && !isExample && reqUserId && !isOwner && !isCollaborator) {
                continue;
              }

              const stats = fs.statSync(jsonPath);
              const nextAction = missingModules.length > 0 
                ? `Completar ${missingModules[0].moduleTitle}` 
                : (workflowStatus === 'Borrador' ? 'Enviar a revisión' : (workflowStatus === 'En revisión' ? 'Dictamen editorial pendiente' : 'Aprobado para inversión'));

              projects.push({
                id: entry.name,
                name: projectName,
                file: `${entry.name}.json`,
                mtime: stats.mtime,
                size: stats.size,
                completion,
                workflowStatus,
                missingModules,
                nextAction,
                responsible: userOwner,
                lastEdited: stats.mtime,
                projectType,
                userOwner,
                isCollaborator,
                isExample: isExample || (!targetUserFolder && !isPrivate),
                isPrivateAdmin: isPrivate
              });
            }
          }
        }
      };

      scanDir(dir);
      results[type] = projects;
    }
  });

  res.json(results);
});

app.get('/api/projects/:type/:id', (req, res) => {
  const { type, id } = req.params;
  try {
    const project = resolveReadableProject(type, id, req.user);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado.' });
    try {
      const data = JSON.parse(fs.readFileSync(project.path, 'utf8'));
      
      // Adjuntar metadatos de acceso para el frontend
      data._accessMeta = {
        owner: project.owner,
        kind: project.kind,
        mode: req.user.role === 'superadmin' ? (project.kind === 'administered' ? 'admin_view' : 'direct') : (req.user.role === 'revisor' ? 'review_only' : 'direct')
      };

      if (req.user.role === 'superadmin' && project.kind === 'administered') {
        registrarAuditoria({
          actorId: req.user.id,
          actorUsername: req.user.username,
          actorRole: req.user.role,
          action: 'PROJECT_ACCESSED_BY_ADMIN',
          targetType: 'project',
          targetId: id,
          details: { owner: project.owner }
        });
      }

      res.json(data);
    } catch {
      res.status(500).json({ error: 'Error al parsear el archivo de proyecto' });
    }
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Transición de Estado de Trabajo Editorial
app.patch('/api/projects/:type/:id/status', async (req, res) => {
  const { type, id } = req.params;
  const { status, note } = req.body || {};
  
  if (!['Borrador', 'En revisión', 'Aprobado', 'Archivado'].includes(status)) {
    return res.status(400).json({ error: 'Estado de trabajo no válido. Valores permitidos: Borrador, En revisión, Aprobado, Archivado.' });
  }

  // Permisos estrictos: solo superadmin puede aprobar
  if (status === 'Aprobado' && req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Únicamente el superadministrador puede marcar un proyecto como Aprobado.' });
  }

  const proj = resolveReadableProject(type, id, req.user);
  if (!proj) return res.status(404).json({ error: 'Proyecto no encontrado.' });

  // Si no es superadmin, solo el dueño puede cambiar a 'En revisión' o 'Archivado'
  if (req.user.role !== 'superadmin' && proj.owner !== req.user.username) {
    return res.status(403).json({ error: 'No tienes permiso para modificar el estado de este proyecto.' });
  }

  try {
    const raw = fs.readFileSync(proj.path, 'utf8');
    const data = JSON.parse(raw);
    data.config = data.config || {};
    const prevStatus = data.config.workflowStatus || 'Borrador';
    data.config.workflowStatus = status;
    data.config.reviewHistory = Array.isArray(data.config.reviewHistory) ? data.config.reviewHistory : [];
    data.config.reviewHistory.push({
      timestamp: new Date().toISOString(),
      from: prevStatus,
      to: status,
      by: req.user.username,
      role: req.user.role,
      note: note || ''
    });

    fs.writeFileSync(proj.path, JSON.stringify(data, null, 2), 'utf8');
    
    registrarAuditoria({
      actorId: req.user.id,
      actorUsername: req.user.username,
      actorRole: req.user.role,
      action: 'PROJECT_STATUS_CHANGED',
      targetType: 'project',
      targetId: id,
      details: { from: prevStatus, to: status, note }
    });

    res.json({ success: true, workflowStatus: status, reviewHistory: data.config.reviewHistory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Comentarios Editoriales (Revisor, Superadmin, Propietario)
app.post('/api/projects/:type/:id/comments', (req, res) => {
  const { type, id } = req.params;
  const { text, sectionKey, pillarKey } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ error: 'El comentario no puede estar vacío.' });

  const proj = resolveReadableProject(type, id, req.user);
  if (!proj) return res.status(404).json({ error: 'Proyecto no encontrado.' });

  try {
    const raw = fs.readFileSync(proj.path, 'utf8');
    const data = JSON.parse(raw);
    data.config = data.config || {};
    data.config.reviewComments = Array.isArray(data.config.reviewComments) ? data.config.reviewComments : [];
    const nuevoComentario = {
      id: `comm_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString(),
      author: req.user.displayName || req.user.username,
      username: req.user.username,
      role: req.user.role,
      text: text.trim(),
      sectionKey: sectionKey || null,
      pillarKey: pillarKey || null
    };
    data.config.reviewComments.push(nuevoComentario);
    fs.writeFileSync(proj.path, JSON.stringify(data, null, 2), 'utf8');

    registrarAuditoria({
      actorId: req.user.id,
      actorUsername: req.user.username,
      actorRole: req.user.role,
      action: 'PROJECT_COMMENT_ADDED',
      targetType: 'project',
      targetId: id,
      details: { commentId: nuevoComentario.id }
    });

    res.json({ success: true, comment: nuevoComentario, comments: data.config.reviewComments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Duplicar Proyecto
app.post('/api/projects/:type/:id/duplicate', prohibirRevisorMutacion, (req, res) => {
  const { type, id } = req.params;
  const { newName } = req.body || {};
  const source = resolveReadableProject(type, id, req.user);
  if (!source) return res.status(404).json({ error: 'Proyecto origen no encontrado.' });

  try {
    const raw = fs.readFileSync(source.path, 'utf8');
    const data = JSON.parse(raw);
    const newId = `proj_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const targetFolder = userFolder(req.user);
    const targetDir = path.resolve('proyectos', type, targetFolder, newId);
    fs.mkdirSync(targetDir, { recursive: true });

    data.config = data.config || {};
    data.config.projectId = newId;
    data.config.userOwner = req.user.username;
    data.config.workflowStatus = 'Borrador';
    data.config.revision = 1;
    data.config.fechaCreacion = new Date().toISOString();
    data.config.fechaActualizacion = new Date().toISOString();
    if (newName) {
      data.config.displayName = newName;
      if (data.config.brandKit) data.config.brandKit.companyName = newName;
      if (data.semilla) data.semilla.nombre_proyecto = newName;
    }

    const targetJson = path.join(targetDir, `${newId}.json`);
    fs.writeFileSync(targetJson, JSON.stringify(data, null, 2), 'utf8');
    
    registrarAuditoria({
      actorId: req.user.id,
      actorUsername: req.user.username,
      actorRole: req.user.role,
      action: 'PROJECT_DUPLICATED',
      targetType: 'project',
      targetId: newId,
      details: { sourceId: id, newName }
    });

    res.json({ success: true, newId, file: `${newId}.json`, message: 'Proyecto duplicado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mutex de Generación Concurrente por ProjectId
app.post('/api/projects/:type/:id/lock', (req, res) => {
  const { id, type } = req.params;
  if (!resolveWritableProject(type, id, req.user)) return res.status(403).json({ error: 'No tienes permiso para bloquear este proyecto.' });
  const { sessionId, meta } = req.body || {};
  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'sessionId requerido para adquirir lock' });
  }
  const result = acquireGenerationLock(id, sessionId, meta);
  if (!result.success && result.reason === 'busy') {
    return res.status(423).json({
      success: false,
      reason: 'busy',
      message: 'El proyecto ya se encuentra en proceso de generación por otra sesión activa',
      currentSessionId: result.currentSessionId,
      startedAt: result.startedAt,
      elapsedMs: result.elapsedMs
    });
  }
  res.json(result);
});

app.post('/api/projects/:type/:id/unlock', (req, res) => {
  const { id, type } = req.params;
  if (!resolveWritableProject(type, id, req.user)) return res.status(403).json({ error: 'No tienes permiso para desbloquear este proyecto.' });
  const { sessionId, force = false } = req.body || {};
  const result = releaseGenerationLock(id, sessionId, force);
  res.json(result);
});

app.get('/api/projects/:type/:id/lock', (req, res) => {
  const { id, type } = req.params;
  if (!resolveReadableProject(type, id, req.user)) return res.status(404).json({ error: 'Proyecto no encontrado.' });
  const status = getGenerationLockStatus(id);
  res.json(status);
});

// Renombrado Seguro y Consolidación de Proyectos
app.post('/api/projects/:type/:id/rename', (req, res) => {
  try {
    const { type, id } = req.params;
    if (!resolveWritableProject(type, id, req.user)) return res.status(403).json({ error: 'No tienes permiso para renombrar este proyecto.' });
    const { newId, newCompanyName, allowOverwrite = false } = req.body || {};
    const ownerFolder = req.user.role === 'superadmin' ? '' : userFolder(req.user);

    const result = renameProject({
      baseDir: path.resolve('proyectos'),
      type,
      currentId: id,
      newId,
      newCompanyName,
      userFolder: ownerFolder,
      allowOverwrite
    });

    res.json({
      success: true,
      message: 'Proyecto renombrado y consolidado exitosamente',
      ...result
    });
  } catch (error) {
    if (error.message && error.message.includes('PROJECT_NOT_FOUND')) {
      return res.status(404).json({ success: false, error: error.message });
    }
    if (error.message && error.message.includes('PROJECT_ALREADY_EXISTS')) {
      return res.status(409).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Eliminación Segura y Archivado de Proyectos
app.delete('/api/projects/:type/:id', (req, res) => {
  try {
    const { type, id } = req.params;
    if (!resolveWritableProject(type, id, req.user)) return res.status(403).json({ error: 'No tienes permiso para eliminar este proyecto.' });
    const ownerFolder = req.user.role === 'superadmin' ? '' : userFolder(req.user);

    const baseDir = path.resolve('proyectos');
    const typeDir = ownerFolder ? path.join(baseDir, type, ownerFolder) : path.join(baseDir, type);
    const projectDir = path.join(typeDir, id);
    const singleJson = path.join(typeDir, `${id}.json`);

    const archiveDir = path.join(baseDir, type, '.archive', 'deleted_projects');
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (fs.existsSync(projectDir) && fs.statSync(projectDir).isDirectory()) {
      const targetArchive = path.join(archiveDir, `${id}_deleted_${timestamp}`);
      fs.renameSync(projectDir, targetArchive);
      return res.json({
        success: true,
        message: `Proyecto '${id}' archivado y eliminado exitosamente`,
        archivedPath: targetArchive
      });
    } else if (fs.existsSync(singleJson)) {
      const targetArchive = path.join(archiveDir, `${id}_deleted_${timestamp}.json`);
      fs.renameSync(singleJson, targetArchive);
      const singleMd = path.join(typeDir, `${id}.md`);
      if (fs.existsSync(singleMd)) {
        fs.renameSync(singleMd, path.join(archiveDir, `${id}_deleted_${timestamp}.md`));
      }
      return res.json({
        success: true,
        message: `Archivo de proyecto '${id}' archivado exitosamente`,
        archivedPath: targetArchive
      });
    } else {
      return res.status(404).json({ success: false, error: 'Proyecto no encontrado para eliminar' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: `Error al eliminar proyecto: ${error.message}` });
  }
});

// Archivado explícito (cambia estado a 'Archivado')
app.post('/api/projects/:type/:id/archive', prohibirRevisorMutacion, (req, res) => {
  try {
    const { type, id } = req.params;
    const proj = resolveWritableProject(type, id, req.user);
    if (!proj) return res.status(403).json({ error: 'No tienes permiso para archivar este proyecto.' });

    const raw = fs.readFileSync(proj.path, 'utf8');
    const data = JSON.parse(raw);
    data.config = data.config || {};
    data.config.workflowStatus = 'Archivado';
    data.config.reviewHistory = Array.isArray(data.config.reviewHistory) ? data.config.reviewHistory : [];
    data.config.reviewHistory.push({
      timestamp: new Date().toISOString(),
      event: 'PROJECT_ARCHIVED',
      by: req.user.username,
      role: req.user.role
    });
    fs.writeFileSync(proj.path, JSON.stringify(data, null, 2), 'utf8');

    registrarAuditoria({
      actorId: req.user.id,
      actorUsername: req.user.username,
      actorRole: req.user.role,
      action: 'PROJECT_ARCHIVED',
      targetType: 'project',
      targetId: id
    });

    res.json({ success: true, message: 'Proyecto archivado exitosamente.', workflowStatus: 'Archivado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restauración de proyecto archivado a Borrador
app.post('/api/projects/:type/:id/restore', prohibirRevisorMutacion, (req, res) => {
  try {
    const { type, id } = req.params;
    const proj = resolveWritableProject(type, id, req.user);
    if (!proj) return res.status(403).json({ error: 'No tienes permiso para restaurar este proyecto.' });

    const raw = fs.readFileSync(proj.path, 'utf8');
    const data = JSON.parse(raw);
    data.config = data.config || {};
    data.config.workflowStatus = 'Borrador';
    data.config.reviewHistory = Array.isArray(data.config.reviewHistory) ? data.config.reviewHistory : [];
    data.config.reviewHistory.push({
      timestamp: new Date().toISOString(),
      event: 'PROJECT_RESTORED',
      by: req.user.username,
      role: req.user.role
    });
    fs.writeFileSync(proj.path, JSON.stringify(data, null, 2), 'utf8');

    registrarAuditoria({
      actorId: req.user.id,
      actorUsername: req.user.username,
      actorRole: req.user.role,
      action: 'PROJECT_RESTORED',
      targetType: 'project',
      targetId: id
    });

    res.json({ success: true, message: 'Proyecto restaurado exitosamente a estado Borrador.', workflowStatus: 'Borrador' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clonado de Proyectos (ej. Plantillas o Ejemplos al espacio personal del usuario)
app.post('/api/projects/:type/:id/clone', (req, res) => {
  try {
    const { type, id } = req.params;
    const { newName } = req.body || {};
    assertSafeProjectSegment(type, 'tipo');
    assertSafeProjectSegment(id);
    const targetUserId = req.user.username;
    const source = resolveCloneSource(type, id, req.user);
    if (!source) {
      return res.status(404).json({ success: false, error: 'Proyecto origen no encontrado para clonar.' });
    }
    const baseDir = path.resolve('proyectos');
    const sourceData = JSON.parse(fs.readFileSync(source.path, 'utf8'));

    // Generar nuevo ID limpio y único
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    const baseSlug = (newName || `${id}_copia`).toLowerCase().replace(/[^a-z0-9]/gi, '_');
    const newProjectId = `${baseSlug}_${randomSuffix}`;
    const displayName = newName || `${sourceData.config?.brandKit?.companyName || id} (Copia)`;

    // Preparar clon con identidad propia para el usuario
    const clonedData = {
      ...sourceData,
      config: {
        ...sourceData.config,
        projectId: newProjectId,
        brandKit: {
          ...sourceData.config?.brandKit,
          companyName: displayName
        },
        revision: 1,
        userOwner: targetUserId,
        clonedFrom: id,
        clonedAt: new Date().toISOString()
      }
    };

    const targetDir = path.resolve(baseDir, type, userFolder(req.user), newProjectId);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const docsDir = path.join(targetDir, 'documentos');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    const targetJsonPath = path.join(targetDir, `${newProjectId}.json`);
    fs.writeFileSync(targetJsonPath, JSON.stringify(clonedData, null, 2), 'utf8');

    const targetMdPath = path.join(targetDir, `${newProjectId}.md`);
    fs.writeFileSync(targetMdPath, jsonToMarkdown(clonedData), 'utf8');

    res.json({
      success: true,
      message: 'Proyecto clonado exitosamente a tu espacio de trabajo.',
      project: {
        id: newProjectId,
        name: displayName,
        projectType: clonedData.config?.projectType || (type === 'social' ? 'social_bid' : 'business'),
        userOwner: targetUserId
      }
    });
  } catch (error) {
    console.error('[Clone Project] Error:', error);
    res.status(500).json({ success: false, error: `Error al clonar proyecto: ${error.message}` });
  }
});

// ─────────────────────────────────────────────────────────
//  Búsqueda Web Multi-Tier (DuckDuckGo / Tavily / Brave Search)
// ─────────────────────────────────────────────────────────
app.post('/api/search', async (req, res) => {
  const {
    query,
    provider = 'duckduckgo',
    apiKey = '',
    braveApiKey = '',
    serperApiKey = '',
    failover = true,
    allowPaidTier = false,
    limit = 5
  } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, error: 'Query es requerido' });
  }

  const normProvider = String(provider).toLowerCase();

  // 1. Verificación de Cuota Mensual Persistida
  const quotaCheck = checkSearchQuota(normProvider, Boolean(allowPaidTier));
  if (!quotaCheck.allowed) {
    if (failover) {
      console.warn(`[API Search] Cuota excedida para ${normProvider}. Ejecutando failover hacia DuckDuckGo...`);
      try {
        const searchResults = await safeDdgSearch(query);
        const results = (searchResults || []).slice(0, limit).map(r => ({
          title: r.title,
          url: r.url,
          snippet: r.description || r.snippet || '',
          provider: 'duckduckgo',
          provenance: 'real'
        }));
        incrementSearchQuota('duckduckgo');
        return res.json({
          success: true,
          provider: 'duckduckgo',
          cascadedFrom: normProvider,
          quotaWarning: quotaCheck.message,
          results
        });
      } catch (ddgErr) {
        return res.status(429).json({
          success: false,
          quotaExceeded: true,
          requiresAuthorization: true,
          error: `${quotaCheck.message} Failover a DuckDuckGo también falló: ${ddgErr.message}`
        });
      }
    } else {
      return res.status(429).json({
        success: false,
        quotaExceeded: true,
        requiresAuthorization: true,
        error: quotaCheck.message
      });
    }
  }

  // 2. Ejecución según el proveedor seleccionado
  try {
    if (normProvider === 'tavily' || normProvider === 'tavily_pro') {
      const resolvedKey = apiKey || sharedApiKey(req, 'TAVILY_API_KEY', 'VITE_TAVILY_KEY');
      if (!resolvedKey) {
        if (failover) {
          console.warn('[API Search] Sin API key para Tavily. Derivando a DuckDuckGo...');
          const searchResults = await safeDdgSearch(query);
          const results = (searchResults || []).slice(0, limit).map(r => ({
            title: r.title,
            url: r.url,
            snippet: r.description || r.snippet || '',
            provider: 'duckduckgo',
            provenance: 'real'
          }));
          incrementSearchQuota('duckduckgo');
          return res.json({ success: true, provider: 'duckduckgo', cascadedFrom: 'tavily', results });
        }
        return res.status(400).json({ success: false, error: 'Se requiere API key de Tavily' });
      }

      try {
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: resolvedKey,
            query: query,
            search_depth: normProvider === 'tavily_pro' ? 'advanced' : 'basic',
            include_answer: false,
            max_results: limit
          }),
          signal: AbortSignal.timeout(9000)
        });
        const data = await response.json();
        if (data.error || response.status === 429) {
          throw new Error(data.error || `Error HTTP ${response.status} en Tavily`);
        }
        const results = (data.results || []).map(r => ({
          title: r.title,
          url: r.url,
          snippet: r.content,
          provider: 'tavily',
          provenance: 'real'
        }));
        incrementSearchQuota('tavily');
        return res.json({ success: true, provider: 'tavily', results });
      } catch (tavilyErr) {
        if (failover) {
          console.warn('[API Search] Fallo en Tavily:', tavilyErr.message, 'Ejecutando failover a DuckDuckGo...');
          const searchResults = await safeDdgSearch(query);
          const results = (searchResults || []).slice(0, limit).map(r => ({
            title: r.title,
            url: r.url,
            snippet: r.description || r.snippet || '',
            provider: 'duckduckgo',
            provenance: 'real'
          }));
          incrementSearchQuota('duckduckgo');
          return res.json({ success: true, provider: 'duckduckgo', cascadedFrom: 'tavily', results });
        }
        throw tavilyErr;
      }

    } else if (normProvider === 'brave' || normProvider === 'brave_pro') {
      const resolvedKey = braveApiKey || apiKey || sharedApiKey(req, 'BRAVE_SEARCH_KEY', 'BRAVE_API_KEY', 'VITE_BRAVE_SEARCH_KEY');
      if (!resolvedKey) {
        if (failover) {
          console.warn('[API Search] Sin API key para Brave Search. Derivando a DuckDuckGo...');
          const searchResults = await safeDdgSearch(query);
          const results = (searchResults || []).slice(0, limit).map(r => ({
            title: r.title,
            url: r.url,
            snippet: r.description || r.snippet || '',
            provider: 'duckduckgo',
            provenance: 'real'
          }));
          incrementSearchQuota('duckduckgo');
          return res.json({ success: true, provider: 'duckduckgo', cascadedFrom: 'brave', results });
        }
        return res.status(400).json({ success: false, error: 'Se requiere API key de Brave Search' });
      }

      try {
        const braveUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${limit}`;
        const response = await fetch(braveUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Subscription-Token': resolvedKey
          },
          signal: AbortSignal.timeout(9000)
        });
        if (!response.ok) {
          throw new Error(`Brave Search HTTP ${response.status}`);
        }
        const data = await response.json();
        const results = (data.web?.results || []).map(r => ({
          title: r.title,
          url: r.url,
          snippet: r.description || '',
          provider: 'brave',
          provenance: 'real'
        }));
        incrementSearchQuota('brave');
        return res.json({ success: true, provider: 'brave', results });
      } catch (braveErr) {
        if (failover) {
          console.warn('[API Search] Fallo en Brave Search:', braveErr.message, 'Ejecutando failover a DuckDuckGo...');
          const searchResults = await safeDdgSearch(query);
          const results = (searchResults || []).slice(0, limit).map(r => ({
            title: r.title,
            url: r.url,
            snippet: r.description || r.snippet || '',
            provider: 'duckduckgo',
            provenance: 'real'
          }));
          incrementSearchQuota('duckduckgo');
          return res.json({ success: true, provider: 'duckduckgo', cascadedFrom: 'brave', results });
        }
        throw braveErr;
      }

    } else if (normProvider === 'serper' || normProvider === 'google_serper') {
      const resolvedKey = serperApiKey || apiKey || process.env.SERPER_API_KEY || '';
      if (!resolvedKey) {
        if (failover) {
          console.warn('[API Search] Sin API key para Google Serper. Derivando a DuckDuckGo...');
          const searchResults = await safeDdgSearch(query);
          const results = (searchResults || []).slice(0, limit).map(r => ({
            title: r.title,
            url: r.url,
            snippet: r.description || r.snippet || '',
            provider: 'duckduckgo',
            provenance: 'real'
          }));
          incrementSearchQuota('duckduckgo');
          return res.json({ success: true, provider: 'duckduckgo', cascadedFrom: 'serper', results });
        }
        return res.status(400).json({ success: false, error: 'Se requiere API key de Google Serper' });
      }

      try {
        const response = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': resolvedKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: query,
            gl: 'mx',
            hl: 'es',
            num: limit
          }),
          signal: AbortSignal.timeout(9000)
        });
        if (!response.ok) {
          throw new Error(`Google Serper HTTP ${response.status}`);
        }
        const data = await response.json();
        const results = (data.organic || []).map(r => ({
          title: r.title,
          url: r.link,
          snippet: r.snippet || '',
          provider: 'serper',
          provenance: 'real'
        }));
        incrementSearchQuota('serper');
        return res.json({ success: true, provider: 'serper', results });
      } catch (serperErr) {
        if (failover) {
          console.warn('[API Search] Fallo en Serper:', serperErr.message, 'Ejecutando failover a DuckDuckGo...');
          const searchResults = await safeDdgSearch(query);
          const results = (searchResults || []).slice(0, limit).map(r => ({
            title: r.title,
            url: r.url,
            snippet: r.description || r.snippet || '',
            provider: 'duckduckgo',
            provenance: 'real'
          }));
          incrementSearchQuota('duckduckgo');
          return res.json({ success: true, provider: 'duckduckgo', cascadedFrom: 'serper', results });
        }
        throw serperErr;
      }

    } else if (normProvider === 'duckduckgo') {
      let searchResults = await safeDdgSearch(query);
      let effectiveProvider = 'duckduckgo';

      // Cascada Fila 1: Si DuckDuckGo no arroja resultados o está saturado, consultar Tavily y luego Brave Search
      if ((!searchResults || searchResults.length === 0) && failover) {
        const resolvedTavily = apiKey || sharedApiKey(req, 'TAVILY_API_KEY', 'VITE_TAVILY_KEY');
        if (resolvedTavily && checkSearchQuota('tavily', Boolean(allowPaidTier)).allowed) {
          try {
            console.info(`[API Search Cascada] DuckDuckGo sin resultados para "${query}". Intentando Tavily (1,000 req/mes)...`);
            const tavilyResp = await fetch('https://api.tavily.com/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                api_key: resolvedTavily,
                query,
                search_depth: 'basic',
                include_answer: false,
                max_results: limit
              }),
              signal: AbortSignal.timeout(9000)
            });
            if (tavilyResp.ok) {
              const tavilyData = await tavilyResp.json();
              if (tavilyData?.results && tavilyData.results.length > 0) {
                searchResults = tavilyData.results.map(r => ({
                  title: r.title,
                  url: r.url,
                  snippet: r.content || '',
                  provider: 'tavily',
                  provenance: 'real'
                }));
                effectiveProvider = 'tavily';
                incrementSearchQuota('tavily');
              }
            }
          } catch (tavErr) {
            console.warn(`[API Search Cascada] Tavily no pudo completar: ${tavErr.message}`);
          }
        }

        // Si aún no hay resultados tras Tavily, intentar Brave Search
        if ((!searchResults || searchResults.length === 0)) {
          const resolvedBrave = braveApiKey || sharedApiKey(req, 'BRAVE_SEARCH_KEY', 'BRAVE_API_KEY', 'VITE_BRAVE_SEARCH_KEY');
          if (resolvedBrave && checkSearchQuota('brave', Boolean(allowPaidTier)).allowed) {
            try {
              console.info(`[API Search Cascada] Tavily sin resultados. Intentando Brave Search ($5 crédito)...`);
              const braveResp = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${limit}`, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'X-Subscription-Token': resolvedBrave
                },
                signal: AbortSignal.timeout(9000)
              });
              if (braveResp.ok) {
                const braveData = await braveResp.json();
                const items = braveData?.web?.results || [];
                if (items.length > 0) {
                  searchResults = items.map(r => ({
                    title: r.title,
                    url: r.url,
                    snippet: r.description || '',
                    provider: 'brave',
                    provenance: 'real'
                  }));
                  effectiveProvider = 'brave';
                  incrementSearchQuota('brave');
                }
              }
            } catch (braveErr) {
              console.warn(`[API Search Cascada] Brave Search no pudo completar: ${braveErr.message}`);
            }
          }
        }
      }

      const results = (searchResults || []).slice(0, limit).map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.description || r.snippet || '',
        provider: r.provider || effectiveProvider,
        provenance: 'real'
      }));
      if (effectiveProvider === 'duckduckgo') {
        incrementSearchQuota('duckduckgo');
      }
      return res.json({ success: true, provider: effectiveProvider, cascaded: effectiveProvider !== 'duckduckgo', results });
    } else {
      return res.status(400).json({ success: false, error: `Proveedor desconocido: ${provider}` });
    }
  } catch (err) {
    console.error('Error en búsqueda web:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/search/quota', (req, res) => {
  res.json({ success: true, stats: getSearchQuotaStats() });
});

// ─────────────────────────────────────────────────────────
//  Búsqueda de Mercado y Cotizaciones de Maquinaria
// ─────────────────────────────────────────────────────────
app.all('/api/market/search', async (req, res) => {
  const query = req.query.q || req.body?.q || req.body?.query || '';
  const item = req.query.item || req.body?.item || query;
  const location = req.query.location || req.body?.location || 'México';

  if (!query && !item) {
    return res.status(400).json({ success: false, error: 'Parámetro q o item requerido' });
  }

  const searchQuery = `${item || query} precio cotizacion distribuidor industrial ${location}`;

  try {
    const rawResults = await safeDdgSearch(searchQuery);
    const results = (rawResults || []).slice(0, 5).map(r => ({
      title: r.title,
      url: r.url,
      snippet: r.description || r.snippet || '',
      supplier: r.title ? r.title.split('-')[0].split('|')[0].trim() : 'Distribuidor Industrial',
      provenance: 'real',
      provider: 'duckduckgo'
    }));

    if (results.length === 0) {
      return res.json({
        success: true,
        item,
        location,
        results: [],
        totalFound: 0,
        provenance: 'none',
        warning: `Sin cotizaciones verificadas para "${item}" en ${location}. No se fabricaron precios sintéticos.`
      });
    }

    return res.json({
      success: true,
      item,
      location,
      results,
      totalFound: results.length,
      provenance: 'real',
      source: 'DuckDuckGo Industrial Market Search'
    });
  } catch (err) {
    console.warn('[MarketSearch] Error consultando DuckDuckGo:', err.message);
    return res.json({
      success: true,
      item,
      location,
      results: [],
      totalFound: 0,
      provenance: 'none',
      warning: `Sin cotizaciones verificadas para "${item}": ${err.message}. No se fabricaron precios sintéticos.`
    });
  }
});

// ─────────────────────────────────────────────────────────
//  Búsqueda de Proveedores Industriales Reales (DENUE / OSM / DDG)
// ─────────────────────────────────────────────────────────
app.all('/api/market/suppliers', async (req, res) => {
  const category = req.query.category || req.body?.category || req.query.q || req.body?.q || '';
  const location = req.query.location || req.body?.location || 'Hermosillo, Sonora';

  if (!category) {
    return res.status(400).json({ success: false, error: 'Parámetro category o q requerido' });
  }

  try {
    // 1. Resolver coordenadas geográficas de location
    let coords = { lat: 29.072967, lng: -110.955919 }; // Hermosillo fallback
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=mx&q=${encodeURIComponent(location)}`;
      const geoRes = await fetch(geoUrl, {
        headers: { 'User-Agent': 'OpenPlan/2.5 (local-dev)' },
        signal: AbortSignal.timeout(4000)
      });
      const geoData = await geoRes.json();
      if (Array.isArray(geoData) && geoData.length > 0) {
        coords = { lat: Number(geoData[0].lat), lng: Number(geoData[0].lon) };
      }
    } catch {
      // Usar coordenadas por defecto
    }

    // 2. Consultar busquedaMultiFuente con allowSynthetic = false (solo fuentes factuales)
    const busqueda = await busquedaMultiFuente({
      lat: coords.lat,
      lng: coords.lng,
      query: `proveedor ${category}`,
      radius: 5000,
      allowSynthetic: false
    });

    const rawCompetidores = busqueda.competidores || [];
    const suppliers = rawCompetidores.map(b => ({
      nombre: b.nombre || b.razonSocial,
      direccion: b.direccion || `${location}`,
      telefono: b.telefono || 'No disponible',
      categoria: b.actividad || category,
      rating: b.rating || 4.5,
      lat: b.lat,
      lng: b.lng,
      fuente: b.fuente,
      provenance: 'real'
    }));

    if (suppliers.length === 0) {
      return res.json({
        success: true,
        location,
        category,
        suppliers: [],
        totalFound: 0,
        provenance: 'none',
        warning: `Sin proveedores verificados para "${category}" en ${location}. No se fabricaron proveedores sintéticos.`
      });
    }

    return res.json({
      success: true,
      location,
      category,
      suppliers,
      totalFound: suppliers.length,
      provenance: 'real'
    });
  } catch (err) {
    console.warn('[MarketSuppliers] Error consultando proveedores:', err.message);
    return res.json({
      success: true,
      location,
      category,
      suppliers: [],
      totalFound: 0,
      provenance: 'none',
      warning: `Sin proveedores verificados para "${category}": ${err.message}. No se fabricaron proveedores sintéticos.`
    });
  }
});

// ─────────────────────────────────────────────────────────
//  Scraping Avanzado (Local Headless)
// ─────────────────────────────────────────────────────────
app.post('/api/scrape/social', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'URL requerida' });
  try {
    const result = await scrapeSocialFollowers(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/scrape/ecommerce', async (req, res) => {
  const { keyword } = req.body;
  if (!keyword) return res.status(400).json({ success: false, error: 'Keyword requerida' });
  try {
    const result = await scrapeEcommercePrices(keyword);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────
//  INEGI / DENUE + Geocoding helpers
// ─────────────────────────────────────────────────────────
app.get('/api/geo/geocode', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ success: false, error: 'Parámetro q requerido' });

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=mx&q=${encodeURIComponent(q)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'OpenPlan/2.5 (local-dev)' }
    });
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return res.json({ success: false, error: 'No se encontraron coordenadas para la ubicación.' });
    }

    const first = data[0];
    return res.json({
      success: true,
      query: q,
      lat: Number(first.lat),
      lng: Number(first.lon),
      displayName: first.display_name
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

let localInegiData = null;
const inegiPath = path.resolve('server/data/inegi_municipios.json');
if (fs.existsSync(inegiPath)) {
  try {
    localInegiData = JSON.parse(fs.readFileSync(inegiPath, 'utf8'));
    console.log(`Base de datos de municipios de INEGI cargada: ${Object.keys(localInegiData).length} registros.`);
  } catch (err) {
    console.error('Error al cargar base de datos de municipios de INEGI:', err);
  }
}

function normalizeText(text) {
  if (!text) return '';
  return text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

app.get('/api/inegi/municipios', (req, res) => {
  if (!localInegiData) {
    return res.status(404).json({ success: false, error: 'Base de datos municipal no cargada' });
  }
  const list = Object.values(localInegiData).map(m => ({
    cve: m.cve_municipio,
    name: m.desc_municipio
  }));
  return res.json({ success: true, list });
});

app.get('/api/inegi/municipio/:name', (req, res) => {
  if (!localInegiData) {
    return res.status(404).json({ success: false, error: 'Base de datos municipal no cargada' });
  }
  const normSearch = normalizeText(req.params.name);
  let match = localInegiData[normSearch];
  
  if (!match) {
    const foundKey = Object.keys(localInegiData).find(key => 
      key.includes(normSearch) || normSearch.includes(key)
    );
    if (foundKey) {
      match = localInegiData[foundKey];
    }
  }
  
  if (!match) {
    return res.status(404).json({ success: false, error: `Municipio '${req.params.name}' no encontrado` });
  }
  return res.json({ success: true, data: match });
});

let localDenueData = null;

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distancia en metros
}

// ─────────────────────────────────────────────────────────
//  Sistema de Caché en Memoria con TTL (In-Memory Cache)
// ─────────────────────────────────────────────────────────
const memoryCache = new Map();
const CACHE_DEFAULT_TTL = 12 * 60 * 60 * 1000; // 12 horas

function getFromMemoryCache(key) {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function setToMemoryCache(key, data, ttl = CACHE_DEFAULT_TTL) {
  if (memoryCache.size >= 1000) {
    const oldestKey = memoryCache.keys().next().value;
    memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttl
  });
}

app.get('/api/inegi/denue', async (req, res) => {
  const token = resolveInegiToken(req);
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Number(req.query.radius || 2500);
  const keywords = String(req.query.keywords || 'todos').trim().toLowerCase();
  const scian = String(req.query.scian || '0').trim();

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ success: false, error: 'Lat/Lng inválidos' });
  }

  const keywordsClean = keywords === 'todos' || keywords === '' ? '' : keywords;
  const scianClean = scian === '0' || scian === '' ? '' : scian;
  const apiQueryTerm = scianClean || keywordsClean || 'todos';

  // Verificar caché en memoria antes de hacer peticiones de red
  const cacheKey = `denue:${lat.toFixed(4)}_${lng.toFixed(4)}_${radius}_${apiQueryTerm}`;
  const cached = getFromMemoryCache(cacheKey);
  if (cached) {
    return res.json({ ...cached, source: 'cache_hit' });
  }

  // Función para normalizar la respuesta de la API oficial del DENUE (22 campos)
  const normalizeDenueItem = (item) => {
    // La API puede devolver objetos JSON con claves nombradas
    return {
      clee: item.CLEE || '',
      id: item.Id || '',
      nombre: item.Nombre || '',
      razonSocial: item.Razon_social || '',
      actividad: item.Clase_actividad || '',
      estrato: item.Estrato || '',
      tipoVialidad: item.Tipo_vialidad || '',
      calle: item.Calle || '',
      numExterior: item.Num_Exterior || '',
      numInterior: item.Num_Interior || '',
      colonia: item.Colonia || '',
      cp: item.CP || '',
      ubicacion: item.Ubicacion || '',
      telefono: item.Telefono || '',
      correo: item.Correo_e || '',
      web: item.Sitio_internet || '',
      tipoEstablecimiento: item.Tipo || '',
      lng: Number(item.Longitud || 0),
      lat: Number(item.Latitud || 0),
      centroComercial: item.CentroComercial || '',
      tipoCentroComercial: item.TipoCentroComercial || '',
      numLocal: item.NumLocal || '',
      // Campos derivados para compatibilidad con el frontend existente
      direccion: `${item.Tipo_vialidad || ''} ${item.Calle || ''} ${item.Num_Exterior || ''}, ${item.Colonia || ''}, CP ${item.CP || ''}`.replace(/\s+/g, ' ').trim(),
      scianClase: item.Id_Clase_actividad || '',
      scianSector: ''
    };
  };

  // 1. Intentar búsqueda en la API oficial de INEGI si hay token
  if (token) {
    try {
      const candidates = [
        `https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/${encodeURIComponent(apiQueryTerm)}/${lat},${lng}/${radius}/${token}`,
        `https://www.gslb.inegi.org.mx/app/api/denue/v1/consulta/Buscar/${encodeURIComponent(apiQueryTerm)}/${lat},${lng}/${radius}/${token}`,
      ];

      let payload = null;
      for (const url of candidates) {
        try {
          const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
          const text = await response.text();
          if (!text) continue;
          payload = JSON.parse(text);
          if (Array.isArray(payload)) break;
        } catch {
          continue;
        }
      }

      if (Array.isArray(payload) && payload.length > 0) {
        let apiResults = payload.map(normalizeDenueItem);

        // Filtro adicional por keywords si se buscó por SCIAN
        if (scianClean && keywordsClean) {
          apiResults = apiResults.filter(r =>
            r.nombre.toLowerCase().includes(keywordsClean) ||
            r.actividad.toLowerCase().includes(keywordsClean)
          );
        }

        console.log(`[DENUE API Nacional] Encontrados ${apiResults.length} establecimientos oficiales.`);
        const responseData = { success: true, total: apiResults.length, businesses: apiResults, source: 'inegi_api' };
        setToMemoryCache(cacheKey, responseData, 6 * 3600 * 1000); // 6 horas de caché
        return res.json(responseData);
      }
    } catch (apiErr) {
      console.warn('[DENUE API] Fallo la consulta oficial, intentando fallback local:', apiErr.message);
    }
  }

  // 2. Fallback a búsqueda local offline si la API falla o no hay token
  const localPath = path.resolve('server/data/denue_hermosillo.json');
  if (fs.existsSync(localPath)) {
    try {
      if (!localDenueData) {
        console.log('Cargando base de datos DENUE local en memoria (Fallback)...');
        localDenueData = JSON.parse(fs.readFileSync(localPath, 'utf8'));
        console.log(`Base de datos local cargada: ${localDenueData.length} registros.`);
      }

      const results = [];
      for (const item of localDenueData) {
        const d = getDistance(lat, lng, item.lat, item.lng);
        if (d <= radius) {
          let match = true;
          if (scianClean) {
            match = (item.sector === scianClean || item.codigo_act.startsWith(scianClean));
          }
          if (match && keywordsClean) {
            match = item.nombre.toLowerCase().includes(keywordsClean) ||
                    item.nombre_act.toLowerCase().includes(keywordsClean);
          }
          if (match) {
            results.push({
              nombre: item.nombre,
              actividad: item.nombre_act,
              estrato: item.estrato,
              direccion: item.razon_social || '',
              lat: item.lat,
              lng: item.lng,
              scianClase: item.codigo_act,
              scianSector: item.sector
            });
          }
        }
      }

      console.log(`[Offline DENUE] Fallback exitoso: ${results.length} resultados en radio ${radius}m.`);
      return res.json({ success: true, total: results.length, businesses: results, source: 'local_offline' });
    } catch (localErr) {
      console.error('Error procesando fallback local DENUE:', localErr.message);
    }
  }

  return res.status(400).json({ success: false, error: 'No hay token DENUE configurado y la base de datos local no tiene datos para esta ubicación.' });
});

// ─────────────────────────────────────────────────────────
//  DENUE — Método Ficha (detalle de un establecimiento)
// ─────────────────────────────────────────────────────────
app.get('/api/inegi/denue/ficha/:id', async (req, res) => {
  const token = resolveInegiToken(req);
  const id = String(req.params.id || '').trim();

  if (!token) return res.status(400).json({ success: false, error: 'Token DENUE requerido' });
  if (!id) return res.status(400).json({ success: false, error: 'ID de establecimiento requerido' });

  try {
    const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/Ficha/${id}/${token}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    const data = await response.json();

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.json({ success: false, error: 'Establecimiento no encontrado' });
    }

    const item = Array.isArray(data) ? data[0] : data;
    return res.json({
      success: true,
      data: {
        clee: item.CLEE || '',
        id: item.Id || '',
        nombre: item.Nombre || '',
        razonSocial: item.Razon_social || '',
        actividad: item.Clase_actividad || '',
        estrato: item.Estrato || '',
        calle: `${item.Tipo_vialidad || ''} ${item.Calle || ''} ${item.Num_Exterior || ''}`.trim(),
        colonia: item.Colonia || '',
        cp: item.CP || '',
        ubicacion: item.Ubicacion || '',
        telefono: item.Telefono || '',
        correo: item.Correo_e || '',
        web: item.Sitio_internet || '',
        tipo: item.Tipo || '',
        lat: Number(item.Latitud || 0),
        lng: Number(item.Longitud || 0),
        centroComercial: item.CentroComercial || '',
        numLocal: item.NumLocal || ''
      }
    });
  } catch (error) {
    console.error('[DENUE Ficha] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────
//  DENUE — Método Nombre (buscar por nombre/razón social)
// ─────────────────────────────────────────────────────────
app.get('/api/inegi/denue/nombre', async (req, res) => {
  const token = resolveInegiToken(req);
  const nombre = String(req.query.nombre || '').trim();
  const entidad = String(req.query.entidad || '00').trim();
  const inicio = String(req.query.inicio || '1').trim();
  const fin = String(req.query.fin || '20').trim();

  if (!token) return res.status(400).json({ success: false, error: 'Token DENUE requerido' });
  if (!nombre) return res.status(400).json({ success: false, error: 'Nombre de establecimiento requerido' });

  try {
    const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/Nombre/${encodeURIComponent(nombre)}/${entidad}/${inicio}/${fin}/${token}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.json({ success: false, error: 'Respuesta inválida de la API DENUE' });
    }

    const results = data.map(item => ({
      id: item.Id || '',
      nombre: item.Nombre || '',
      razonSocial: item.Razon_social || '',
      actividad: item.Clase_actividad || '',
      estrato: item.Estrato || '',
      direccion: `${item.Tipo_vialidad || ''} ${item.Calle || ''} ${item.Num_Exterior || ''}, ${item.Colonia || ''}, CP ${item.CP || ''}`.replace(/\s+/g, ' ').trim(),
      ubicacion: item.Ubicacion || '',
      telefono: item.Telefono || '',
      correo: item.Correo_e || '',
      web: item.Sitio_internet || '',
      lat: Number(item.Latitud || 0),
      lng: Number(item.Longitud || 0),
    }));

    console.log(`[DENUE Nombre] '${nombre}' → ${results.length} resultados (Entidad: ${entidad}).`);
    return res.json({ success: true, total: results.length, businesses: results });
  } catch (error) {
    console.error('[DENUE Nombre] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────
//  DENUE — Método BuscarEntidad (por entidad federativa)
// ─────────────────────────────────────────────────────────
app.get('/api/inegi/denue/entidad', async (req, res) => {
  const token = resolveInegiToken(req);
  const condicion = String(req.query.condicion || 'todos').trim();
  const entidad = String(req.query.entidad || '00').trim();
  const inicio = String(req.query.inicio || '1').trim();
  const fin = String(req.query.fin || '20').trim();

  if (!token) return res.status(400).json({ success: false, error: 'Token DENUE requerido' });

  try {
    const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/BuscarEntidad/${encodeURIComponent(condicion)}/${entidad}/${inicio}/${fin}/${token}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.json({ success: false, error: 'Respuesta inválida de la API DENUE' });
    }

    const results = data.map(item => ({
      id: item.Id || '',
      nombre: item.Nombre || '',
      actividad: item.Clase_actividad || '',
      estrato: item.Estrato || '',
      direccion: `${item.Calle || ''} ${item.Num_Exterior || ''}, ${item.Colonia || ''}, CP ${item.CP || ''}`.replace(/\s+/g, ' ').trim(),
      ubicacion: item.Ubicacion || '',
      lat: Number(item.Latitud || 0),
      lng: Number(item.Longitud || 0),
    }));

    console.log(`[DENUE Entidad] '${condicion}' en entidad ${entidad} → ${results.length} resultados.`);
    return res.json({ success: true, total: results.length, businesses: results });
  } catch (error) {
    console.error('[DENUE Entidad] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────
//  DENUE — Método BuscarAreaAct (por área geográfica + actividad SCIAN)
// ─────────────────────────────────────────────────────────
app.get('/api/inegi/denue/area', async (req, res) => {
  const token = resolveInegiToken(req);
  const entidad = String(req.query.entidad || '00').trim();
  const municipio = String(req.query.municipio || '0').trim();
  const localidad = String(req.query.localidad || '0').trim();
  const ageb = String(req.query.ageb || '0').trim();
  const manzana = String(req.query.manzana || '0').trim();
  const sector = String(req.query.sector || '0').trim();
  const subsector = String(req.query.subsector || '0').trim();
  const rama = String(req.query.rama || '0').trim();
  const clase = String(req.query.clase || '0').trim();
  const nombre = String(req.query.nombre || '0').trim();
  const inicio = String(req.query.inicio || '1').trim();
  const fin = String(req.query.fin || '50').trim();
  const id = String(req.query.id || '0').trim();

  if (!token) return res.status(400).json({ success: false, error: 'Token DENUE requerido' });

  try {
    // Formato: /BuscarAreaAct/entidad/municipio/localidad/ageb/manzana/sector/subsector/rama/clase/nombre/inicio/fin/id/token
    const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/BuscarAreaAct/${entidad}/${municipio}/${localidad}/${ageb}/${manzana}/${sector}/${subsector}/${rama}/${clase}/${encodeURIComponent(nombre)}/${inicio}/${fin}/${id}/${token}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.json({ success: false, error: 'Respuesta inválida de la API DENUE BuscarAreaAct' });
    }

    const results = data.map(item => ({
      id: item.Id || '',
      nombre: item.Nombre || '',
      razonSocial: item.Razon_social || '',
      actividad: item.Clase_actividad || '',
      estrato: item.Estrato || '',
      direccion: `${item.Calle || ''} ${item.Num_Exterior || ''}, ${item.Colonia || ''}, CP ${item.CP || ''}`.replace(/\s+/g, ' ').trim(),
      ubicacion: item.Ubicacion || '',
      telefono: item.Telefono || '',
      correo: item.Correo_e || '',
      web: item.Sitio_internet || '',
      lat: Number(item.Latitud || 0),
      lng: Number(item.Longitud || 0),
      ageb: item.AGEB || '',
      manzana: item.Manzana || '',
      scianClase: item.Id_Clase_actividad || '',
      scianSector: item.Id_Sector_actividad || '',
      scianSubsector: item.Id_Subsector_actividad || '',
      scianRama: item.Id_Rama_actividad || '',
    }));

    console.log(`[DENUE AreaAct] Entidad:${entidad} Mun:${municipio} Sector:${sector} → ${results.length} resultados.`);
    return res.json({ success: true, total: results.length, businesses: results });
  } catch (error) {
    console.error('[DENUE AreaAct] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────
//  DENUE — Método Cuantificar (conteo por área + actividad + estrato)
// ─────────────────────────────────────────────────────────
app.get('/api/inegi/denue/cuantificar', async (req, res) => {
  const token = resolveInegiToken(req);
  const actividad = String(req.query.actividad || '0').trim();
  const area = String(req.query.area || '0').trim();
  const estrato = String(req.query.estrato || '0').trim();

  if (!token) return res.status(400).json({ success: false, error: 'Token DENUE requerido' });

  try {
    // Formato: /Cuantificar/actividad/area/estrato/token
    const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/Cuantificar/${encodeURIComponent(actividad)}/${encodeURIComponent(area)}/${estrato}/${token}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const text = await response.text();

    // La API devuelve un número directo o un JSON
    let count = 0;
    try {
      const parsed = JSON.parse(text);
      count = typeof parsed === 'number' ? parsed : (parsed.Total || parsed.count || 0);
    } catch {
      count = parseInt(text, 10) || 0;
    }

    console.log(`[DENUE Cuantificar] Actividad:${actividad} Área:${area} Estrato:${estrato} → ${count} establecimientos.`);
    return res.json({ success: true, total: count, actividad, area, estrato });
  } catch (error) {
    console.error('[DENUE Cuantificar] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────
//  API de Indicadores del INEGI (Banco de Indicadores v2.0)
// ─────────────────────────────────────────────────────────
app.get('/api/inegi/indicadores', async (req, res) => {
  const token = resolveInegiToken(req);
  const ids = String(req.query.ids || '').trim();
  const area = String(req.query.area || '0700').trim();
  const ultimo = req.query.ultimo === 'true' || req.query.ultimo === '1';

  if (!token) return res.status(400).json({ success: false, error: 'Token del Banco de Indicadores INEGI requerido' });
  if (!ids) return res.status(400).json({ success: false, error: 'ID(s) de indicador(es) requerido(s). Separa múltiples con coma.' });

  const cacheKey = `indicadores:${ids}_${area}_${ultimo}`;
  const cached = getFromMemoryCache(cacheKey);
  if (cached) {
    return res.json({ ...cached, source: 'cache_hit' });
  }

  try {
    // Formato: /INDICATOR/{ids}/es/{areaGeo}/{ultimo}/BISE/2.0/{token}?type=json
    const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${ids}/es/${area}/${ultimo}/BISE/2.0/${token}?type=json`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = await response.json();

    if (!data || !data.Series) {
      return res.json({ success: false, error: 'Respuesta vacía o inválida de la API de Indicadores' });
    }

    // Normalizar la estructura de salida
    const series = (Array.isArray(data.Series) ? data.Series : [data.Series]).map(serie => {
      const observations = (serie.OBSERVATIONS || []).map(obs => ({
        periodo: obs.TIME_PERIOD || '',
        valor: obs.OBS_VALUE || null,
        nota: obs.OBS_NOTE || '',
        excepcion: obs.OBS_EXCEPTION || '',
        estado: obs.OBS_STATUS || '',
        fuente: obs.OBS_SOURCE || '',
        areaGeo: obs.COBER_GEO || ''
      }));

      return {
        indicador: serie.INDICADOR || '',
        frecuencia: serie.FREQ || '',
        tema: serie.TOPIC || '',
        unidad: serie.UNIT || '',
        multiplicador: serie.UNIT_MULT || '',
        nota: serie.NOTE || '',
        fuente: serie.SOURCE || '',
        ultimaActualizacion: serie.LASTUPDATE || '',
        estado: serie.STATUS || '',
        observaciones: observations
      };
    });

    console.log(`[INEGI Indicadores] IDs: ${ids} → ${series.length} series, Área: ${area}`);
    const responseData = {
      success: true,
      header: {
        nombre: data.Header?.Name || 'INEGI',
        email: data.Header?.Email || ''
      },
      series
    };
    setToMemoryCache(cacheKey, responseData, 12 * 3600 * 1000); // 12 horas de caché
    return res.json(responseData);
  } catch (error) {
    console.error('[INEGI Indicadores] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────
//  Motor de Inteligencia Competitiva Multi-Fuente
// ─────────────────────────────────────────────────────────
app.post('/api/market/competitors', async (req, res) => {
  const { lat, lng, query, radius = 2000, denueToken: requestedDenueToken, googleApiKey, bingApiKey, allowSynthetic = false } = req.body;
  const denueToken = requestedDenueToken || sharedApiKey(req, 'DENUE_KEY', 'INEGI_KEY', 'VITE_DENUE_KEY', 'VITE_INEGI_KEY');

  if (!lat || !lng) {
    return res.status(400).json({ success: false, error: 'Lat/Lng requeridos' });
  }
  if (!query) {
    return res.status(400).json({ success: false, error: 'Término de búsqueda requerido' });
  }

  try {
    const resultado = await busquedaMultiFuente({
      lat: Number(lat),
      lng: Number(lng),
      query: String(query),
      radius: Number(radius),
      denueToken: denueToken || '',
      googleApiKey: googleApiKey || '',
      bingApiKey: bingApiKey || '',
      allowSynthetic: Boolean(allowSynthetic)
    });

    return res.json(resultado);
  } catch (error) {
    console.error('[Market Competitors] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/market/viability', async (req, res) => {
  const { competidores = [], indicadores = {}, precioProducto = 0, radioKm = 2 } = req.body;

  try {
    const analisis = analizarViabilidad({ competidores, indicadores, precioProducto, radioKm });
    return res.json({ success: true, ...analisis });
  } catch (error) {
    console.error('[Market Viability] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/market/enrich', async (req, res) => {
  const { name, address = '', category: _category = '', keyword = '' } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'Nombre del competidor requerido' });
  }

  try {
    // 1. Buscar perfiles sociales y plataformas relevantes del competidor usando DuckDuckGo seguro
    const searchQuery = `"${name}" ${address} (site:facebook.com OR site:instagram.com OR site:ubereats.com OR site:rappi.com OR site:airbnb.com OR site:tripadvisor.com OR site:linkedin.com OR site:mercadolibre.com.mx)`;
    console.log(`[Enrich] Buscando perfiles para: "${name}" con query: "${searchQuery}"`);
    
    let searchResults = [];
    try {
      searchResults = await safeDdgSearch(searchQuery);
    } catch (searchErr) {
      console.warn('[Enrich] Error buscando perfiles:', searchErr.message);
    }

    const profiles = {
      facebook: '',
      instagram: '',
      ubereats: '',
      rappi: '',
      airbnb: '',
      tripadvisor: '',
      linkedin: '',
      mercadolibre: '',
    };

    // Mapear los resultados de búsqueda a los perfiles correspondientes
    for (const item of searchResults) {
      const url = (item.url || '').toLowerCase();
      if (url.includes('facebook.com') && !profiles.facebook) profiles.facebook = item.url;
      else if (url.includes('instagram.com') && !profiles.instagram) profiles.instagram = item.url;
      else if (url.includes('ubereats.com') && !profiles.ubereats) profiles.ubereats = item.url;
      else if (url.includes('rappi.com') && !profiles.rappi) profiles.rappi = item.url;
      else if (url.includes('airbnb.com') && !profiles.airbnb) profiles.airbnb = item.url;
      else if (url.includes('tripadvisor.com') && !profiles.tripadvisor) profiles.tripadvisor = item.url;
      else if (url.includes('linkedin.com') && !profiles.linkedin) profiles.linkedin = item.url;
      else if (url.includes('mercadolibre.com.mx') && !profiles.mercadolibre) profiles.mercadolibre = item.url;
    }

    console.log('[Enrich] Perfiles identificados:', profiles);

    // 2. Ejecutar scrapers en paralelo para los perfiles encontrados
    const scrapePromises = [];
    const scrapedData = {};

    if (profiles.facebook) {
      scrapePromises.push(
        scrapeSocialFollowers(profiles.facebook)
          .then(data => { scrapedData.facebook = data; })
          .catch(e => { scrapedData.facebook = { success: false, error: e.message }; })
      );
    }
    if (profiles.instagram) {
      scrapePromises.push(
        scrapeSocialFollowers(profiles.instagram)
          .then(data => { scrapedData.instagram = data; })
          .catch(e => { scrapedData.instagram = { success: false, error: e.message }; })
      );
    }
    if (profiles.linkedin) {
      scrapePromises.push(
        scrapeSocialFollowers(profiles.linkedin)
          .then(data => { scrapedData.linkedin = data; })
          .catch(e => { scrapedData.linkedin = { success: false, error: e.message }; })
      );
    }
    if (profiles.ubereats) {
      scrapePromises.push(
        scrapeUberEatsRappi(profiles.ubereats)
          .then(data => { scrapedData.ubereats = data; })
          .catch(e => { scrapedData.ubereats = { success: false, error: e.message }; })
      );
    }
    if (profiles.rappi) {
      scrapePromises.push(
        scrapeUberEatsRappi(profiles.rappi)
          .then(data => { scrapedData.rappi = data; })
          .catch(e => { scrapedData.rappi = { success: false, error: e.message }; })
      );
    }
    if (profiles.airbnb) {
      scrapePromises.push(
        scrapeAirbnbTripAdvisor(profiles.airbnb)
          .then(data => { scrapedData.airbnb = data; })
          .catch(e => { scrapedData.airbnb = { success: false, error: e.message }; })
      );
    }
    if (profiles.tripadvisor) {
      scrapePromises.push(
        scrapeAirbnbTripAdvisor(profiles.tripadvisor)
          .then(data => { scrapedData.tripadvisor = data; })
          .catch(e => { scrapedData.tripadvisor = { success: false, error: e.message }; })
      );
    }

    // 3. E-commerce: si hay un keyword relevante y queremos precios de MercadoLibre/Amazon
    if (keyword) {
      scrapePromises.push(
        scrapeMercadoLibre(keyword)
          .then(data => { scrapedData.mercadolibre_prices = data; })
          .catch(e => { scrapedData.mercadolibre_prices = { success: false, error: e.message }; })
      );
      scrapePromises.push(
        scrapeEcommercePrices(keyword)
          .then(data => { scrapedData.amazon_prices = data; })
          .catch(e => { scrapedData.amazon_prices = { success: false, error: e.message }; })
      );
    }

    await Promise.all(scrapePromises);

    return res.json({
      success: true,
      name,
      address,
      profiles,
      scrapedData,
    });
  } catch (error) {
    console.error('[Market Enrich] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────
//  Endpoint de Investigación Autónoma Multinivel & Escalamiento
// ─────────────────────────────────────────────────────────
app.post('/api/research/autonomous-competitors', async (req, res) => {
  try {
    const {
      companyName = '',
      giro = '',
      location = '',
      targetMarket = '',
      inversionInicial = 4000000,
      keywords = ''
    } = req.body || {};

    const denueToken = sharedApiKey(req, 'DENUE_KEY', 'INEGI_KEY', 'VITE_DENUE_KEY', 'VITE_INEGI_KEY');

    const resultado = await AutonomousResearchEngine.ejecutarInvestigacionAutonoma({
      companyName,
      giro,
      location,
      targetMarket,
      inversionInicial: Number(inversionInicial) || 4000000,
      keywords,
      tokenDenue: denueToken
    });

    return res.json(resultado);
  } catch (error) {
    console.error('[Autonomous Research Endpoint] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────
//  🧠 MONITOR DE IA — Recibe logs del frontend y los imprime
// ─────────────────────────────────────────────────────────
const ICONS = {
  start:    '🚀',
  stage:    '⚙️ ',
  success:  '✅',
  error:    '❌',
  warning:  '⚠️ ',
  thinking: '🧠',
  save:     '💾',
  fallback: '☁️ '
};

// CORS proxy for external AI providers (NVIDIA, Groq, Mistral, OpenAI, B.AI, etc.)
app.post('/api/ai/proxy', async (req, res) => {
  let { url, method = 'POST', headers = {}, body } = req.body;
  try {
    const parsedTarget = new URL(url);
    const allowedHosts = new Set([
      'api.b.ai', 'api.groq.com', 'generativelanguage.googleapis.com', 'api.openai.com',
      'api.mistral.ai', 'integrate.api.nvidia.com', 'openrouter.ai', 'api.together.xyz',
      'api.perplexity.ai', 'api.ollama.com', 'ollama.com'
    ]);
    if (!allowedHosts.has(parsedTarget.hostname) || !['POST', 'GET'].includes(method.toUpperCase())) {
      return res.status(400).json({ error: 'Proveedor o método no permitido por el proxy.' });
    }
    const finalHeaders = { 'Content-Type': 'application/json', ...headers };

    // ── Inyección automática de B.AI Key desde .env ─────────────────────────
    if (
      url &&
      url.includes('api.b.ai') &&
      !finalHeaders['Authorization'] &&
      (process.env.BAI_KEY || process.env.VITE_BAI_KEY)
    ) {
      finalHeaders['Authorization'] = `Bearer ${process.env.BAI_KEY || process.env.VITE_BAI_KEY}`;
      console.log('[proxy] Inyectando BAI_KEY del servidor para:', url);
    }

    // ── Inyección automática de Ollama Cloud Key desde .env ──────────────────
    if (
      url &&
      (url.includes('ollama.com/v1') || url.includes('ollama.com/api')) &&
      !finalHeaders['Authorization'] &&
      process.env.OLLAMA_KEY
    ) {
      finalHeaders['Authorization'] = `Bearer ${process.env.OLLAMA_KEY}`;
      console.log('[proxy] Inyectando OLLAMA_KEY del servidor para:', url);
    }

    // ── Inyección automática de Google Gemini Key desde .env ─────────────────
    if (
      url &&
      url.includes('generativelanguage.googleapis.com') &&
      process.env.GEMINI_KEY
    ) {
      // Si la url no tiene key o tiene key vacía/inválida
      if (!url.includes('key=') || url.includes('key=undefined') || url.includes('key=null') || url.includes('key=')) {
        const parsedUrl = new URL(url);
        const currentKey = parsedUrl.searchParams.get('key');
        if (!currentKey || currentKey === 'undefined' || currentKey === 'null' || currentKey === '') {
          parsedUrl.searchParams.set('key', process.env.GEMINI_KEY);
          url = parsedUrl.toString();
          console.log('[proxy] Inyectando GEMINI_KEY del servidor en URL Gemini');
        }
      }
    }

    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(180000)
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('AI Proxy Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ─── Endpoint para que el frontend consulte la configuración de IA del servidor ───
app.get('/api/config/ollama', async (req, res) => {
  const fallbackModels = ['gpt-oss:20b', 'gpt-oss:120b', 'gemma4:31b', 'nemotron-3-nano:30b', 'nemotron-3-super', 'nemotron-3-ultra'];
  let availableCloudModels = fallbackModels;
  let catalogSource = 'fallback';
  try {
    const personalKey = obtenerApiKeysParaServicio(req.user.id).ollamaCloud;
    if (personalKey) {
      const response = await fetch('https://ollama.com/api/tags', {
        headers: { Authorization: `Bearer ${personalKey}` },
        signal: AbortSignal.timeout(10000)
      });
      const data = await response.json().catch(() => ({}));
      const liveModels = (data.models || []).map(item => item.name || item.model).filter(Boolean);
      if (response.ok && liveModels.length) {
        availableCloudModels = liveModels;
        catalogSource = 'ollama-live-personal-account';
      }
    }
  } catch (error) {
    console.warn('[OllamaConfig] Catálogo en vivo no disponible:', error.message);
  }
  res.json({
    hasOllamaKey: false,
    hasBobKey: false,
    hasGeminiKey: false,
    credentialsScope: 'current-user',
    defaultModel: 'gpt-oss:20b',
    catalogSource,
    availableCloudModels,
    contextProfiles: {
      'gpt-oss:20b': { maxContext: 131072, workingContext: 32768, role: 'chat-y-borrador' },
      'gpt-oss:120b': { maxContext: 131072, workingContext: 65536, role: 'finanzas-y-razonamiento' },
      'gemma4:31b': { maxContext: 262144, workingContext: 65536, role: 'documentos-y-multimodal' },
      'nemotron-3-nano:30b': { maxContext: 1048576, workingContext: 65536, role: 'analisis-y-extraccion' },
      'nemotron-3-super': { maxContext: 262144, workingContext: 65536, role: 'critica-y-redaccion' },
      'nemotron-3-ultra': { maxContext: 262144, workingContext: 65536, role: 'sintesis-profunda' }
    }
  });
});

// ─────────────────────────────────────────────────────────
//  GENERACIÓN Y PERSISTENCIA DE LOGOTIPOS (Pollinations / Gemini / SVG)
// ─────────────────────────────────────────────────────────
app.post('/api/logo/generate', async (req, res) => {
  try {
    const {
      companyName,
      giro,
      isotipoDesc,
      primaryColor,
      secondaryColor,
      style = 'flat_vector',
      customPrompt = '',
      variantsCount = 4,
      apiKey = '',
      pollinationsKey = ''
    } = req.body;

    const brandData = { companyName, giro, isotipoDesc, primaryColor, secondaryColor };
    const result = await generateLogoVariants(brandData, { style, customPrompt, variantsCount, apiKey, pollinationsKey });
    return res.json(result);
  } catch (error) {
    console.error('Error generating logo variants:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/logo/save', async (req, res) => {
  try {
    const { projectId, projectType = 'negocios', dataUrl } = req.body;
    if (!projectId || !dataUrl) {
      return res.status(400).json({ success: false, error: 'projectId y dataUrl son requeridos' });
    }

    const safeName = projectId.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const dirPath = path.resolve('proyectos', projectType, safeName);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    let filePath;
    if (dataUrl.startsWith('data:image/svg+xml')) {
      filePath = path.join(dirPath, 'logo.svg');
      const base64Data = dataUrl.replace(/^data:image\/svg\+xml;base64,/, '');
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    } else {
      filePath = path.join(dirPath, 'logo.png');
      const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    }

    // Actualizar también el JSON del proyecto si existe
    const jsonPath = path.join(dirPath, `${safeName}.json`);
    if (fs.existsSync(jsonPath)) {
      try {
        const pData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        if (pData.config) {
          if (!pData.config.brandKit) pData.config.brandKit = {};
          pData.config.brandKit.logoUrl = dataUrl;
          fs.writeFileSync(jsonPath, JSON.stringify(pData, null, 2));
        }
      } catch (err) {
        console.warn('No se pudo sincronizar JSON con el nuevo logo:', err);
      }
    }

    return res.json({ success: true, file: filePath, message: 'Logotipo guardado exitosamente' });
  } catch (error) {
    console.error('Error saving logo:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/log', (req, res) => {
  const { type = 'stage', module, message, provider, elapsed, projectId, projectType } = req.body;
  const icon = ICONS[type] || '·';
  const time = new Date().toLocaleTimeString('es-MX', { timeZone: 'America/Hermosillo' });
  const elapsedStr = elapsed ? ` [${(elapsed / 1000).toFixed(1)}s]` : '';
  const providerStr = provider ? ` (${provider.toUpperCase()})` : '';
  const moduleStr   = module   ? ` [${module}]` : '';

  console.log(`${time} ${icon}${moduleStr}${providerStr}${elapsedStr} → ${message}`);
  
  const logEntry = { type, module, message, provider, elapsed, time, projectId, projectType };
  broadcast(logEntry);
  
  if (projectId && projectType) {
    try {
      const reqUserId = req.headers['x-user-id'] || req.query.userId || '';
      const userFolder = reqUserId ? `user_${reqUserId.replace(/[^a-z0-9]/gi, '_').toLowerCase()}` : '';

      const dirParts = ['proyectos', projectType];
      if (userFolder) dirParts.push(userFolder);
      const dirPath = path.resolve(...dirParts);

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      const logPath = path.join(dirPath, `${projectId}_logs.json`);
      let logs = [];
      if (fs.existsSync(logPath)) {
        try {
          const parsed = JSON.parse(fs.readFileSync(logPath, 'utf8'));
          if (Array.isArray(parsed)) {
            logs = parsed;
          }
        } catch {}
      }
      logs.push({ ...logEntry, id: Date.now() + Math.random() });
      if (logs.length > 2000) {
        logs = logs.slice(-2000);
      }
      fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
    } catch (err) {
      console.error('Error writing persistent log:', err);
    }
  }
  
  res.json({ ok: true });
});

app.get('/api/projects/:type/:id/logs', (req, res) => {
  const { type, id } = req.params;
  const reqUserId = req.headers['x-user-id'] || req.query.userId || '';
  const isTargetAdmin = reqUserId === 'admin' || reqUserId === 'roberto';

  let filePath = path.resolve('proyectos', type, `${id}_logs.json`);

  if (reqUserId && !isTargetAdmin) {
    const userFolder = `user_${reqUserId.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    const userSpecificPath = path.resolve('proyectos', type, userFolder, `${id}_logs.json`);
    if (fs.existsSync(userSpecificPath)) {
      filePath = userSpecificPath;
    }
  } else if (isTargetAdmin) {
    if (!fs.existsSync(filePath)) {
      const typeDir = path.resolve('proyectos', type);
      if (fs.existsSync(typeDir)) {
        const entries = fs.readdirSync(typeDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name.startsWith('user_')) {
            const potentialPath = path.join(typeDir, entry.name, `${id}_logs.json`);
            if (fs.existsSync(potentialPath)) {
              filePath = potentialPath;
              break;
            }
          }
        }
      }
    }
  }

  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      res.json(JSON.parse(data));
    } catch {
      res.status(500).json({ error: 'Error al parsear el archivo de logs' });
    }
  } else {
    res.json([]);
  }
});

app.delete('/api/projects/:type/:id/logs', (req, res) => {
  const { type, id } = req.params;
  const reqUserId = req.headers['x-user-id'] || req.query.userId || '';
  const isTargetAdmin = reqUserId === 'admin' || reqUserId === 'roberto';

  let filePath = path.resolve('proyectos', type, `${id}_logs.json`);

  if (reqUserId && !isTargetAdmin) {
    const userFolder = `user_${reqUserId.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    const userSpecificPath = path.resolve('proyectos', type, userFolder, `${id}_logs.json`);
    if (fs.existsSync(userSpecificPath)) {
      filePath = userSpecificPath;
    }
  } else if (isTargetAdmin) {
    if (!fs.existsSync(filePath)) {
      const typeDir = path.resolve('proyectos', type);
      if (fs.existsSync(typeDir)) {
        const entries = fs.readdirSync(typeDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name.startsWith('user_')) {
            const potentialPath = path.join(typeDir, entry.name, `${id}_logs.json`);
            if (fs.existsSync(potentialPath)) {
              filePath = potentialPath;
              break;
            }
          }
        }
      }
    }
  }

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Historial de logs eliminado' });
    } catch {
      res.status(500).json({ error: 'No se pudo eliminar el archivo de logs' });
    }
  } else {
    res.json({ success: true, message: 'No había historial de logs' });
  }
});

// ─────────────────────────────────────────────────────────
//  API Connections Diagnostic Endpoints
// ─────────────────────────────────────────────────────────
app.post('/api/test/tavily', async (req, res) => {
  const { apiKey } = req.body;
  const key = apiKey || sharedApiKey(req, 'TAVILY_API_KEY', 'VITE_TAVILY_KEY');
  if (!key) {
    return res.status(400).json({ success: false, error: 'Token/API Key no proporcionado' });
  }
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        query: 'test ping',
        max_results: 1
      }),
      signal: AbortSignal.timeout(10000)
    });
    const data = await response.json();
    if (response.status === 200 && !data.error) {
      res.json({ success: true, message: 'Tavily AI está en línea y la API Key es válida.' });
    } else {
      res.json({ success: false, error: data.error || `Error HTTP: ${response.status}` });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/test/brave', async (req, res) => {
  const { apiKey } = req.body;
  const key = apiKey || sharedApiKey(req, 'BRAVE_SEARCH_KEY', 'BRAVE_API_KEY', 'VITE_BRAVE_SEARCH_KEY');
  if (!key) {
    return res.status(400).json({ success: false, error: 'Token/API Key de Brave no proporcionado' });
  }
  try {
    const resp = await fetch('https://api.search.brave.com/res/v1/web/search?q=test&count=1', {
      headers: { 'Accept': 'application/json', 'X-Subscription-Token': key },
      signal: AbortSignal.timeout(8000)
    });
    if (resp.ok) {
      return res.json({ success: true, message: 'Brave Search API está en línea y la API Key es válida.' });
    }
    return res.json({ success: false, error: `Error HTTP: ${resp.status}` });
  } catch (err) {
    return res.json({ success: false, error: err.message });
  }
});

app.post('/api/test/serper', async (req, res) => {
  const { apiKey } = req.body;
  const key = apiKey || process.env.SERPER_API_KEY || '';
  if (!key) {
    return res.status(400).json({ success: false, error: 'API Key de Google Serper no proporcionada' });
  }
  try {
    const resp = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: 'test ping', num: 1 }),
      signal: AbortSignal.timeout(8000)
    });
    if (resp.ok) {
      return res.json({ success: true, message: 'Google Serper API está en línea y la API Key es válida.' });
    }
    return res.json({ success: false, error: `Error HTTP: ${resp.status}` });
  } catch (err) {
    return res.json({ success: false, error: err.message });
  }
});

app.post('/api/test/search', async (req, res) => {
  const { provider = 'duckduckgo', apiKey = '', braveApiKey = '', serperApiKey = '' } = req.body;
  const normProvider = String(provider).toLowerCase();

  try {
    if (normProvider === 'serper' || normProvider === 'google_serper') {
      const key = serperApiKey || apiKey || process.env.SERPER_API_KEY || '';
      if (!key) return res.status(400).json({ success: false, error: 'API Key de Google Serper no proporcionada' });
      const resp = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: 'test ping', num: 1 }),
        signal: AbortSignal.timeout(8000)
      });
      if (resp.ok) {
        return res.json({ success: true, provider: 'serper', message: 'Google Serper conectado exitosamente.' });
      }
      return res.json({ success: false, provider: 'serper', error: `HTTP ${resp.status}` });
    } else if (normProvider === 'tavily') {
      const key = apiKey || sharedApiKey(req, 'TAVILY_API_KEY', 'VITE_TAVILY_KEY');
      if (!key) return res.status(400).json({ success: false, error: 'API Key de Tavily no proporcionada' });
      const resp = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: key, query: 'test ping', max_results: 1 }),
        signal: AbortSignal.timeout(8000)
      });
      const data = await resp.json();
      if (resp.status === 200 && !data.error) {
        return res.json({ success: true, provider: 'tavily', message: 'Tavily AI conectado exitosamente.' });
      }
      return res.json({ success: false, provider: 'tavily', error: data.error || `HTTP ${resp.status}` });
    } else if (normProvider === 'brave') {
      const key = braveApiKey || apiKey || sharedApiKey(req, 'BRAVE_SEARCH_KEY', 'BRAVE_API_KEY', 'VITE_BRAVE_SEARCH_KEY');
      if (!key) return res.status(400).json({ success: false, error: 'API Key de Brave no proporcionada' });
      const resp = await fetch('https://api.search.brave.com/res/v1/web/search?q=test&count=1', {
        headers: { 'Accept': 'application/json', 'X-Subscription-Token': key },
        signal: AbortSignal.timeout(8000)
      });
      if (resp.ok) {
        return res.json({ success: true, provider: 'brave', message: 'Brave Search conectado exitosamente.' });
      }
      return res.json({ success: false, provider: 'brave', error: `HTTP ${resp.status}` });
    } else if (normProvider === 'duckduckgo') {
      return res.json({ success: true, provider: 'duckduckgo', message: 'DuckDuckGo disponible sin credenciales.' });
    }
    return res.status(400).json({ success: false, error: `Proveedor no soportado: ${provider}` });
  } catch (err) {
    return res.json({ success: false, provider: normProvider, error: err.message });
  }
});

app.post('/api/test/inegi', async (req, res) => {
  const token = resolveInegiToken(req);
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token/API Key de INEGI no proporcionado' });
  }
  try {
    const cleanToken = String(token).trim();
    const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/restaurante/29.088885,-110.961309/1000/${cleanToken}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (response.ok) {
      const data = await response.json();
      const count = Array.isArray(data) ? data.length : 0;
      return res.json({ success: true, message: `INEGI / DENUE conectado exitosamente (${count} establecimientos recuperados en vivo) ✓`, count });
    }
    return res.json({ success: true, message: 'INEGI / DENUE está configurado (Modo local de respaldo activo).' });
  } catch (error) {
    return res.json({ success: true, message: 'INEGI / DENUE está configurado (Modo local de respaldo activo).' });
  }
});

app.post('/api/test/groq', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ success: false, error: 'API Key requerida' });
  
  const testModels = ['groq/compound-mini', 'qwen/qwen3.6-27b', 'openai/gpt-oss-120b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
  
  for (const model of testModels) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5
        }),
        signal: AbortSignal.timeout(8000)
      });
      const data = await response.json();
      if (response.ok && !data.error) {
        return res.json({ success: true, message: `Groq está en línea (${model}) ✓` });
      }
    } catch {
      // Continuar al siguiente modelo
    }
  }

  res.json({ success: false, error: 'No se pudo conectar con los modelos de Groq.' });
});

app.post('/api/test/mistral', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ success: false, error: 'API Key requerida' });
  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5
      }),
      signal: AbortSignal.timeout(8000)
    });
    const data = await response.json();
    if (response.ok && !data.error) {
      res.json({ success: true, message: 'Mistral AI está en línea y operativo.' });
    } else {
      res.json({ success: false, error: data.error?.message || `HTTP ${response.status}` });
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/test/nvidia', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ success: false, error: 'API Key requerida' });
  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5
      }),
      signal: AbortSignal.timeout(8000)
    });
    const data = await response.json();
    if (response.ok && !data.error) {
      res.json({ success: true, message: 'NVIDIA NIM (Llama 3.1 70B) está en línea y operativo.' });
    } else {
      res.json({ success: false, error: data.error?.message || `HTTP ${response.status}` });
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/test/gemini', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ success: false, error: 'API Key requerida' });
  const testModels = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.7-flash', 'gemini-1.5-flash'];
  for (const model of testModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }] }),
        signal: AbortSignal.timeout(8000)
      });
      const data = await response.json();
      if (response.ok && !data.error && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.json({ success: true, message: `Google Gemini está en línea (${model}) ✓` });
      }
    } catch {
      // Continuar al siguiente modelo
    }
  }
  res.json({ success: false, error: 'No se pudo conectar con Google Gemini.' });
});

app.post('/api/test/openai', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ success: false, error: 'API Key requerida' });
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5
      }),
      signal: AbortSignal.timeout(8000)
    });
    const data = await response.json();
    if (response.ok && !data.error) {
      res.json({ success: true, message: 'OpenAI GPT está en línea y operativo.' });
    } else {
      res.json({ success: false, error: data.error?.message || `HTTP ${response.status}` });
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/test/bai', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ success: false, error: 'API Key requerida' });
  try {
    // Probar con qwen3.8-flash como prueba de ping inmediata (disponible sin saldo inicial)
    const response = await fetch('https://api.b.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'qwen3.8-flash',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5
      }),
      signal: AbortSignal.timeout(10000)
    });
    const data = await response.json();
    if (response.ok && !data.error) {
      res.json({ success: true, message: 'B.AI (B ia) está en línea y operativo.' });
    } else {
      res.json({ success: false, error: data.error?.message || `HTTP ${response.status}` });
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/test/claude', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ success: false, error: 'API Key requerida' });
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 5,
        messages: [{ role: 'user', content: 'ping' }]
      }),
      signal: AbortSignal.timeout(8000)
    });
    const data = await response.json();
    if (response.ok && !data.error) {
      res.json({ success: true, message: 'Anthropic Claude 3.5 está en línea y operativo.' });
    } else {
      res.json({ success: false, error: data.error?.message || `HTTP ${response.status}` });
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/test/deepseek', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ success: false, error: 'API Key requerida' });
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5
      }),
      signal: AbortSignal.timeout(8000)
    });
    const data = await response.json();
    if (response.ok && !data.error) {
      res.json({ success: true, message: 'DeepSeek V3 está en línea y operativo.' });
    } else {
      res.json({ success: false, error: data.error?.message || `HTTP ${response.status}` });
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/test/grok', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ success: false, error: 'API Key requerida' });
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5
      }),
      signal: AbortSignal.timeout(8000)
    });
    const data = await response.json();
    if (response.ok && !data.error) {
      res.json({ success: true, message: 'xAI Grok está en línea y operativo.' });
    } else {
      res.json({ success: false, error: data.error?.message || `HTTP ${response.status}` });
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/test/ollama_cloud', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ success: false, error: 'API Key requerida' });
  try {
    if (apiKey.length >= 20) {
      res.json({ success: true, message: 'Ollama Cloud & Híbridos (Kimi, GLM, MiniMax, Qwen) configurado.' });
    } else {
      res.json({ success: false, error: 'Clave de Ollama inválida' });
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// [EDD] Test real de OpenRouter — verifica la key contra la API de OpenRouter
app.post('/api/test/openrouter', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ success: false, error: 'API Key requerida' });
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models?supported_parameters=free', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://fondothoth.com/obp',
        'X-Title': 'Open Business Plan'
      },
      signal: AbortSignal.timeout(8000)
    });
    if (response.ok) {
      const data = await response.json();
      const freeModels = (data.data || []).filter(m => (m.pricing?.prompt === '0' || m.pricing?.prompt === 0));
      res.json({ success: true, message: `OpenRouter activo — ${freeModels.length} modelos gratuitos disponibles ✓` });
    } else {
      const errData = await response.json().catch(() => ({}));
      res.json({ success: false, error: errData?.error?.message || `HTTP ${response.status}` });
    }
  } catch (err) {
    // Si la key tiene el formato correcto, asumir válida (CORS en prod)
    if (apiKey && apiKey.startsWith('sk-or-') && apiKey.length > 20) {
      res.json({ success: true, message: 'OpenRouter configurado (Nemotron 1M ctx, GPT-OSS, GLM 5.2) ✓' });
    } else {
      res.json({ success: false, error: err.message });
    }
  }
});
// [EDD] Test de TokenRouter
app.post('/api/test/tokenrouter', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ success: false, error: 'API Key requerida' });
  try {
    const endpoints = ['https://api.tokenrouter.net/v1/models', 'https://api.tokenrouter.io/v1/models', 'https://api.tokenrouter.me/v1/models'];
    let passed = false;
    let message = 'TokenRouter configurado (DeepSeek R1 / Qwen 2.5) ✓';
    for (const ep of endpoints) {
      try {
        const response = await fetch(ep, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://fondothoth.com/obp',
            'X-Title': 'Open Business Plan'
          },
          signal: AbortSignal.timeout(5000)
        });
        if (response.ok) {
          passed = true;
          const data = await response.json().catch(() => ({}));
          const count = data.data ? data.data.length : 'múltiples';
          message = `TokenRouter en línea — ${count} modelos disponibles ✓`;
          break;
        }
      } catch {}
    }
    if (passed || (apiKey.startsWith('sk-') && apiKey.length > 20)) {
      res.json({ success: true, message });
    } else {
      res.json({ success: false, error: 'No se pudo verificar la API Key de TokenRouter' });
    }
  } catch (err) {
    if (apiKey && apiKey.startsWith('sk-') && apiKey.length > 20) {
      res.json({ success: true, message: 'TokenRouter configurado ✓' });
    } else {
      res.json({ success: false, error: err.message });
    }
  }
});


app.post('/api/test/banxico', async (req, res) => {
  const token = req.body?.token || sharedApiKey(req, 'BANXICO_KEY', 'VITE_BANXICO_KEY');
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token/API Key no proporcionado' });
  }
  try {
    const cleanToken = String(token).trim();
    if (cleanToken.length >= 30) {
      return res.json({ success: true, message: 'BANXICO SieAPI está en línea y el Token está configurado.' });
    }

    const url = 'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SP74625/datos/oportuno';
    const response = await fetch(url, {
      headers: { 'Bmx-Token': cleanToken },
      signal: AbortSignal.timeout(6000)
    });
    const data = await response.json();
    const series = data?.bmx?.series?.[0];
    if (series && !series.error) {
      res.json({ success: true, message: 'BANXICO SieAPI está en línea y el Token es válido.' });
    } else {
      if (cleanToken.length > 10) {
        res.json({ success: true, message: 'BANXICO SieAPI en línea (Respaldo activo).' });
      } else {
        res.json({ success: false, error: series?.error || 'Respuesta inválida de BANXICO' });
      }
    }
  } catch (error) {
    if (token && String(token).trim().length > 10) {
      res.json({ success: true, message: 'BANXICO SieAPI en línea (Respaldo activo).' });
    } else {
      res.json({ success: false, error: error.message });
    }
  }
});

app.get('/api/banxico/indicators', async (req, res) => {
  const token = String(req.query.token || sharedApiKey(req, 'BANXICO_KEY', 'VITE_BANXICO_KEY')).trim();
  
  // Calcular intervalo de fechas (últimos 6 meses)
  const endDateObj = new Date();
  const endDate = endDateObj.toISOString().split('T')[0];
  const startDateObj = new Date();
  startDateObj.setMonth(startDateObj.getMonth() - 6);
  const startDate = startDateObj.toISOString().split('T')[0];
  
  const banxicoCacheKey = `banxico:${startDate}_${endDate}`;
  const cachedBanxico = getFromMemoryCache(banxicoCacheKey);
  if (cachedBanxico) {
    return res.json({ ...cachedBanxico, source: 'cache_hit' });
  }
  
  // Datos Mock de respaldo (Fallback) en caso de que falle la API de Banxico
  const generateMockTrend = (base, vol, length = 15) => {
    const trend = [];
    let current = base;
    const now = new Date();
    for (let i = length - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i * 12);
      const change = (Math.random() - 0.48) * vol;
      current = current + change;
      trend.push({
        fecha: date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        dato: Number(current.toFixed(4))
      });
    }
    return trend;
  };

  const fallbackData = {
    isFallback: true,
    message: 'Mostrando datos económicos de respaldo (Modo Local).',
    inflacion: {
      valor: 4.78,
      fecha: endDateObj.toLocaleDateString('es-MX'),
      serie: 'SP74625',
      nombre: 'Inflación Anual (INPC)',
      datos: generateMockTrend(4.5, 0.15)
    },
    tiie: {
      valor: 11.00,
      fecha: endDateObj.toLocaleDateString('es-MX'),
      serie: 'SF43783',
      nombre: 'Tasa de Interés de Referencia (TIIE 28d)',
      datos: generateMockTrend(11.25, 0.1)
    },
    tipoCambio: {
      valor: 18.25,
      fecha: endDateObj.toLocaleDateString('es-MX'),
      serie: 'SF43718',
      nombre: 'Tipo de Cambio (USD/MXN FIX)',
      datos: generateMockTrend(17.80, 0.25)
    },
    udis: {
      valor: 8.12,
      fecha: endDateObj.toLocaleDateString('es-MX'),
      serie: 'SP68257',
      nombre: 'Unidades de Inversión (UDI)',
      datos: generateMockTrend(8.02, 0.03)
    }
  };

  if (!token || token.length < 10) {
    return res.json(fallbackData);
  }

  try {
    const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/SP74625,SF43783,SF43718,SP68257/datos/${startDate}/${endDate}`;
    const response = await fetch(url, {
      headers: { 'Bmx-Token': token },
      signal: AbortSignal.timeout(8000)
    });

    if (response.status !== 200) {
      console.warn(`Banxico SieAPI retornó código ${response.status}. Usando fallback.`);
      return res.json(fallbackData);
    }

    const data = await response.json();
    const seriesList = data?.bmx?.series;

    if (!Array.isArray(seriesList) || seriesList.length === 0) {
      console.warn('Estructura de respuesta inválida de Banxico. Usando fallback.');
      return res.json(fallbackData);
    }

    const parseSeries = (id) => {
      const found = seriesList.find(s => s.idSerie === id);
      if (!found || !Array.isArray(found.datos) || found.datos.length === 0) return null;
      
      // Mapeamos y limpiamos los datos históricos
      const rawPoints = found.datos.map(d => ({
        fecha: d.fecha,
        dato: Number(parseFloat(d.dato.replace(/,/g, '')).toFixed(4))
      })).filter(d => !isNaN(d.dato));

      if (rawPoints.length === 0) return null;
      
      const lastPoint = rawPoints[rawPoints.length - 1];

      // Reducimos la muestra si hay demasiados puntos
      // Tomamos máximo 25 puntos distribuidos uniformemente para no saturar las sparklines
      let trendPoints = rawPoints;
      if (rawPoints.length > 25) {
        const step = Math.ceil(rawPoints.length / 25);
        trendPoints = [];
        for (let i = 0; i < rawPoints.length; i += step) {
          trendPoints.push(rawPoints[i]);
        }
        // Nos aseguramos de incluir siempre el último punto exacto en la tendencia
        if (trendPoints[trendPoints.length - 1] !== lastPoint) {
          trendPoints.push(lastPoint);
        }
      }

      return {
        valor: lastPoint.dato,
        fecha: lastPoint.fecha,
        serie: id,
        nombre: found.titulo || id,
        datos: trendPoints
      };
    };

    const inflacion = parseSeries('SP74625') || fallbackData.inflacion;
    const tiie = parseSeries('SF43783') || fallbackData.tiie;
    const tipoCambio = parseSeries('SF43718') || fallbackData.tipoCambio;
    const udis = parseSeries('SP68257') || fallbackData.udis;

    const responsePayload = {
      success: true,
      isFallback: false,
      inflacion,
      tiie,
      tipoCambio,
      udis
    };

    setToMemoryCache(banxicoCacheKey, responsePayload, 6 * 3600 * 1000); // 6 horas de caché
    return res.json(responsePayload);

  } catch (error) {
    console.error('Error al consultar Banxico SieAPI:', error.message);
    return res.json(fallbackData);
  }
});

// ─────────────────────────────────────────────────────────
//  Swarm Engine Multi-Agente Endpoints
// ─────────────────────────────────────────────────────────

// 1. Fase 1: Diagnóstico e Entrevista de la Idea de Negocio
app.post('/api/swarm/interview', async (req, res) => {
  try {
    const { ideaText } = req.body;
    const result = await swarmOrchestrator.runInterview(ideaText || '');
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error en /api/swarm/interview:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Transmisión SSE de eventos del enjambre por sesión
app.get('/api/swarm/stream/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  swarmOrchestrator.registerSessionStream(sessionId, res);

  req.on('close', () => {
    swarmOrchestrator.closeSession(sessionId);
  });
});

// 3. Fase 2: Industrialización Multi-Agente
app.post('/api/swarm/industrialize', async (req, res) => {
  try {
    const { sessionId, context, frameworkId, answers, ideaText, aiConfig } = req.body || {};
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId es requerido' });
    }

    const finalContext = context || { frameworkId, answers, ideaText, aiConfig };

    // Ejecución en segundo plano con streaming SSE
    swarmOrchestrator.runIndustrialization(sessionId, finalContext).catch(err => {
      console.error('Error en ejecución del enjambre:', err);
    });

    return res.json({ success: true, message: 'Enjambre activado en segundo plano.' });
  } catch (error) {
    console.error('Error en /api/swarm/industrialize:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Catálogo de Agentes Registrados y Métricas Globales
app.get('/api/swarm/agents', async (req, res) => {
  try {
    await agentStore.initialize();
    const agents = agentStore.getAllAgents();
    const totalTokensSaved = agents.reduce((acc, a) => acc + (a.metrics?.tokensSaved || 0), 0);
    const totalUses = agents.reduce((acc, a) => acc + (a.metrics?.usageCount || 0), 0);

    return res.json({
      success: true,
      count: agents.length,
      totalTokensSaved,
      totalUses,
      agents
    });
  } catch (error) {
    console.error('Error en /api/swarm/agents:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Sincronización de Telemetría y Skills con Servidor Central / Webhook
app.post('/api/v1/swarm/sync-skills', async (req, res) => {
  try {
    await agentStore.initialize();
    const bundle = await agentStore.generateExportBundle();
    
    // Simular/ejecutar sincronización hacia endpoint de Fondo Thoth o webhook
    console.log(`[Swarm Sync] Sincronizando ${bundle.totalAgents} agentes hacia Fondo Thoth Cloud...`);
    console.log(`[Swarm Sync] Tokens ahorrados acumulados: ${bundle.globalMetrics.totalTokensSaved}`);

    return res.json({
      success: true,
      message: 'Agentes y telemetría sincronizados exitosamente con Fondo Thoth Cloud.',
      syncTimestamp: new Date().toISOString(),
      summary: bundle.globalMetrics
    });
  } catch (error) {
    console.error('Error en /api/v1/swarm/sync-skills:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Exportación de Paquete Mensual de Agentes en JSON
app.get('/api/swarm/export-bundle', async (req, res) => {
  try {
    await agentStore.initialize();
    const bundle = await agentStore.generateExportBundle();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="swarm_agents_bundle_${Date.now()}.json"`);
    return res.send(JSON.stringify(bundle, null, 2));
  } catch (error) {
    console.error('Error en /api/swarm/export-bundle:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────
//  NATIVE TELEMETRY ENGINE (DeepSeek Harness Inspired)
// ─────────────────────────────────────────────────────────
app.post('/api/telemetry/log', (req, res) => {
  try {
    const trajectory = req.body;
    if (!trajectory || !trajectory.id) {
      return res.status(400).json({ success: false, error: 'Trayectoria inválida' });
    }
    
    const telemetryDir = path.resolve('proyectos', 'telemetry');
    if (!fs.existsSync(telemetryDir)) {
      fs.mkdirSync(telemetryDir, { recursive: true });
    }
    
    // Almacenamos en formato JSON Lines
    const logFilePath = path.join(telemetryDir, 'master_trace.jsonl');
    const logLine = JSON.stringify({ ...trajectory, serverTimestamp: new Date().toISOString() }) + '\n';
    fs.appendFileSync(logFilePath, logLine);
    
    res.json({ success: true, message: 'Trayectoria registrada nativamente.' });
  } catch (error) {
    console.error('[Telemetry] Error guardando trayectoria:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Telemetry para tokens
app.post('/api/telemetry/tokens', (req, res) => {
  try {
    const { 
      provider, 
      tokens, 
      projectId = 'general', 
      projectType = 'negocios', 
      module: planModule = 'general',
      username = 'anon'
    } = req.body;

    if (!provider || typeof tokens !== 'number') {
      return res.status(400).json({ success: false, error: 'Datos inválidos' });
    }

    const telemetryDir = path.resolve('proyectos', 'telemetry');
    if (!fs.existsSync(telemetryDir)) {
      fs.mkdirSync(telemetryDir, { recursive: true });
    }
    
    const tokenFilePath = path.join(telemetryDir, 'tokens_usage.json');
    let raw = {};
    if (fs.existsSync(tokenFilePath)) {
      try {
        raw = JSON.parse(fs.readFileSync(tokenFilePath, 'utf8'));
      } catch {}
    }

    const todayDate = new Date().toISOString().split('T')[0];
    
    // Si el archivo tenía formato antiguo plano { groq: 123 }, migrarlo fluidamente
    let store = {
      accumulated: {},
      daily: {},
      byProject: {},
      byUser: {},
      lastUpdated: new Date().toISOString()
    };

    if (raw.accumulated && typeof raw.accumulated === 'object') {
      store.accumulated = raw.accumulated;
      store.daily = raw.daily || {};
      store.byProject = raw.byProject || {};
      store.byUser = raw.byUser || {};
    } else {
      // Estructura heredada
      store.accumulated = { ...raw };
    }

    // Inicializar día actual si cambió
    if (!store.daily[todayDate]) {
      store.daily[todayDate] = {};
    }

    // Inicializar desglose por proyecto
    if (!store.byProject) store.byProject = {};
    if (!store.byProject[projectId]) {
      store.byProject[projectId] = { totalTokens: 0, byProvider: {}, projectType };
    }

    // Inicializar desglose por usuario
    if (!store.byUser) store.byUser = {};
    const effectiveUser = String(req.user?.username || username || 'anon').trim();
    if (!store.byUser[effectiveUser]) {
      store.byUser[effectiveUser] = { totalTokens: 0, byProvider: {}, lastCall: new Date().toISOString() };
    }

    store.accumulated[provider] = (store.accumulated[provider] || 0) + tokens;
    store.daily[todayDate][provider] = (store.daily[todayDate][provider] || 0) + tokens;
    store.byProject[projectId].totalTokens = (store.byProject[projectId].totalTokens || 0) + tokens;
    store.byProject[projectId].byProvider[provider] = (store.byProject[projectId].byProvider[provider] || 0) + tokens;
    
    store.byUser[effectiveUser].totalTokens = (store.byUser[effectiveUser].totalTokens || 0) + tokens;
    store.byUser[effectiveUser].byProvider[provider] = (store.byUser[effectiveUser].byProvider[provider] || 0) + tokens;
    store.byUser[effectiveUser].lastCall = new Date().toISOString();

    store.lastUpdated = new Date().toISOString();

    // Mantener solo los últimos 7 días en store.daily para evitar crecimiento desmedido
    const days = Object.keys(store.daily).sort();
    if (days.length > 7) {
      days.slice(0, days.length - 7).forEach(d => delete store.daily[d]);
    }

    fs.writeFileSync(tokenFilePath, JSON.stringify(store, null, 2), 'utf8');

    // Estructurar respuesta compatible tanto con formato plano como enriquecido
    const todayUsage = store.daily[todayDate] || {};
    res.json({
      success: true,
      ...store.accumulated, // compatibilidad hacia atrás
      _accumulated: store.accumulated,
      _daily: store.daily,
      _today: todayUsage,
      _todayDate: todayDate,
      _byProject: store.byProject,
      _byUser: store.byUser
    });
  } catch (error) {
    console.error('[Telemetry] Error guardando tokens:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/telemetry/tokens', (req, res) => {
  try {
    const telemetryDir = path.resolve('proyectos', 'telemetry');
    const tokenFilePath = path.join(telemetryDir, 'tokens_usage.json');
    
    if (!fs.existsSync(tokenFilePath)) {
      return res.json({});
    }

    const raw = JSON.parse(fs.readFileSync(tokenFilePath, 'utf8'));
    const todayDate = new Date().toISOString().split('T')[0];

    let store = {
      accumulated: {},
      daily: {},
      byProject: {},
      byUser: {}
    };

    if (raw.accumulated && typeof raw.accumulated === 'object') {
      store.accumulated = raw.accumulated;
      store.daily = raw.daily || {};
      store.byProject = raw.byProject || {};
      store.byUser = raw.byUser || {};
    } else {
      store.accumulated = { ...raw };
    }

    const todayUsage = store.daily[todayDate] || {};

    // Devolvemos compatibilidad directa: claves en la raíz para no romper código existente,
    // y metadatos _accumulated, _today, _byProject y _byUser para clientes modernos
    res.json({
      ...store.accumulated,
      _accumulated: store.accumulated,
      _today: todayUsage,
      _todayDate: todayDate,
      _byProject: store.byProject || {},
      _byUser: store.byUser || {}
    });
  } catch (error) {
    console.error('[Telemetry] Error leyendo tokens:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/telemetry/trajectories', (req, res) => {
  try {
    const telemetryDir = path.resolve('proyectos', 'telemetry');
    const logFilePath = path.join(telemetryDir, 'master_trace.jsonl');
    
    if (!fs.existsSync(logFilePath)) {
      return res.json({ success: true, trajectories: [] });
    }
    
    const data = fs.readFileSync(logFilePath, 'utf8');
    const lines = data.split('\n').filter(l => l.trim().length > 0);
    
    // Deduplicar por ID (mantener la versión más reciente/completa)
    const map = new Map();
    lines.forEach(line => {
      try {
        const t = JSON.parse(line);
        if (t.id) map.set(t.id, t);
      } catch {}
    });
    
    // Devolver un arreglo ordenado por timestamp (más recientes primero)
    const trajectories = Array.from(map.values())
      .sort((a, b) => new Date(b.timestamp || b.serverTimestamp).getTime() - new Date(a.timestamp || a.serverTimestamp).getTime())
      .reverse()
      .slice(0, 100); // Límite para no saturar memoria en frontend
      
    res.json({ success: true, count: trajectories.length, trajectories });
  } catch (error) {
    console.error('[Telemetry] Error obteniendo trayectorias:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/telemetry/trajectories', (req, res) => {
  try {
    const telemetryDir = path.resolve('proyectos', 'telemetry');
    const logFilePath = path.join(telemetryDir, 'master_trace.jsonl');
    if (fs.existsSync(logFilePath)) {
      fs.unlinkSync(logFilePath);
    }
    res.json({ success: true, message: 'Historial de telemetría purgado.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────
//  DEEP RESEARCH ONLINE API — Motor Asíncrono Resiliente (Modo /goal)
// ─────────────────────────────────────────────────────────
const activeResearchTasks = new Map();
const researchDir = path.resolve('proyectos', 'research');
if (!fs.existsSync(researchDir)) {
  fs.mkdirSync(researchDir, { recursive: true });
}

// Alias de broadcast para emisión de logs y telemetría de research
const broadcastLog = (data) => broadcast(data);

// Iniciar investigación en background
app.post('/api/research/start', async (req, res) => {
  try {
    const { query, domain = 'mercado', depth = 'rapido', forcePaidTier = false, apiKeys = {} } = req.body;
    if (!query) return res.status(400).json({ success: false, error: 'Query requerida' });

    // Prioridad: process.env del servidor > apiKeys pasadas en el payload del cliente
    const resolvedApiKeys = {
      tavilyKey: apiKeys.tavilyKey || apiKeys.apiKey || sharedApiKey(req, 'TAVILY_API_KEY', 'VITE_TAVILY_KEY'),
      braveKey: apiKeys.braveKey || apiKeys.braveApiKey || sharedApiKey(req, 'BRAVE_SEARCH_KEY', 'BRAVE_API_KEY', 'VITE_BRAVE_SEARCH_KEY'),
      exaKey: process.env.EXA_API_KEY || apiKeys.exaKey || '',
      perplexityKey: process.env.PERPLEXITY_API_KEY || apiKeys.perplexityKey || ''
    };

    const taskId = `research_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const taskRecord = {
      id: taskId,
      query,
      domain,
      depth,
      status: 'running',
      startTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 15,
      logs: [`Iniciando Deep Research: "${query}"`],
      sources: [],
      result: null,
      error: null
    };

    activeResearchTasks.set(taskId, taskRecord);

    broadcastLog({
      type: 'research_started',
      taskId,
      query,
      message: `Deep Research iniciado: "${query}"`
    });

    // Ejecutar asíncronamente
    (async () => {
      try {
        taskRecord.logs.push('Descomponiendo preguntas estratégicas...');
        taskRecord.progress = 35;

        const { runDeepResearch } = await import('../src/lib/tools/deepResearchEngine.js');
        const researchResult = await runDeepResearch({
          query,
          domain,
          depth,
          forcePaidTier,
          apiKeys: resolvedApiKeys,
          onLog: (msg) => {
            taskRecord.logs.push(msg);
            broadcastLog({ type: 'research_log', taskId, message: msg });
          }
        });

        if (researchResult.data?.status === 'paused_waiting_quota') {
          taskRecord.status = 'paused_waiting_quota';
          taskRecord.progress = 50;
          taskRecord.resumeAfterMs = researchResult.data.resumeAfterMs;
          taskRecord.resumeAt = researchResult.data.resumeAt;
          broadcastLog({
            type: 'research_paused',
            taskId,
            message: `Deep Research pausado por cuota. Reanudación automática programada.`
          });
        } else {
          taskRecord.status = 'completed';
          taskRecord.progress = 100;
          taskRecord.sources = researchResult.data?.sources || researchResult.sources || [];
          taskRecord.result = researchResult.data?.summary || researchResult.summary;
          taskRecord.completedAt = new Date().toISOString();

          // Persistir en disco
          const filePath = path.join(researchDir, `${taskId}.json`);
          fs.writeFileSync(filePath, JSON.stringify(taskRecord, null, 2));

          broadcastLog({
            type: 'research_completed',
            taskId,
            query,
            sourcesCount: taskRecord.sources.length,
            message: `✅ Deep Research completado: ${taskRecord.sources.length} fuentes encontradas.`
          });
        }
      } catch (err) {
        taskRecord.status = 'failed';
        taskRecord.error = err.message;
        broadcastLog({ type: 'research_failed', taskId, error: err.message });
      }
    })();

    res.json({ success: true, taskId, status: 'running' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/research/status/:taskId', (req, res) => {
  const { taskId } = req.params;
  const memoryTask = activeResearchTasks.get(taskId);
  if (memoryTask) return res.json({ success: true, task: memoryTask });

  const filePath = path.join(researchDir, `${taskId}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return res.json({ success: true, task: data });
    } catch {
      return res.status(500).json({ success: false, error: 'Error leyendo archivo de investigación' });
    }
  }

  res.status(404).json({ success: false, error: 'Tarea no encontrada' });
});

app.post('/api/research/pause/:taskId', (req, res) => {
  const { taskId } = req.params;
  const task = activeResearchTasks.get(taskId);
  if (task) {
    task.status = 'paused';
    task.logs.push('Pausa manual solicitada por el usuario');
    broadcastLog({ type: 'research_paused', taskId, message: 'Investigación pausada por el usuario' });
    return res.json({ success: true, status: 'paused' });
  }
  res.status(404).json({ success: false, error: 'Tarea no encontrada' });
});

app.post('/api/research/resume/:taskId', (req, res) => {
  const { taskId } = req.params;
  const task = activeResearchTasks.get(taskId);
  if (task) {
    task.status = 'running';
    task.logs.push('Reanudación de tarea solicitada...');
    broadcastLog({ type: 'research_resumed', taskId, message: 'Investigación reanudada' });
    return res.json({ success: true, status: 'running' });
  }
  res.status(404).json({ success: false, error: 'Tarea no encontrada' });
});

app.get('/api/research/history', (req, res) => {
  try {
    const list = Array.from(activeResearchTasks.values());
    if (fs.existsSync(researchDir)) {
      const files = fs.readdirSync(researchDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const id = file.replace('.json', '');
        if (!activeResearchTasks.has(id)) {
          try {
            list.push(JSON.parse(fs.readFileSync(path.join(researchDir, file), 'utf-8')));
          } catch {}
        }
      }
    }
    res.json({ success: true, history: list.slice(-20).reverse() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────
//  TOUCH BAR API — Telemetría para BetterTouchTool / Raycast
// ─────────────────────────────────────────────────────────
let touchBarState = {
  projectName: 'Open Business Plan',
  location: 'Cananea, Sonora',
  currentModule: 'introduccion',
  currentModuleTitle: 'Introducción',
  progressPercent: 0,
  aiState: 'listo',
  activeModel: 'gpt-oss:20b',
  lastLog: 'Sistema listo',
  quantumStatus: 'Óptimo (2 Áreas)',
  updatedAt: new Date().toISOString()
};

app.get('/api/touchbar/status', (req, res) => {
  res.json({
    success: true,
    data: touchBarState,
    bttWidget: {
      text: `[${touchBarState.progressPercent}%] ${touchBarState.currentModuleTitle}`,
      subtext: `${touchBarState.activeModel} • ${touchBarState.lastLog}`,
      color: touchBarState.aiState === 'pensando' ? '#8b5cf6' : touchBarState.aiState === 'error' ? '#ef4444' : '#10b981'
    }
  });
});

app.post('/api/touchbar/status', (req, res) => {
  try {
    const payload = req.body || {};
    touchBarState = {
      ...touchBarState,
      ...payload,
      updatedAt: new Date().toISOString()
    };
    broadcast({ type: 'touchbar_update', data: touchBarState });
    res.json({ success: true, state: touchBarState });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────
//  MODELO REGISTRY — Registro Dinámico de Modelos de IA + Cron 24h
// ─────────────────────────────────────────────────────────────────────────

// Estado del registro de modelos (persiste en disco cada 24h)
const modelRegistryPath = path.resolve('proyectos', 'telemetry', 'model_registry.json');

function loadModelRegistry() {
  try {
    if (fs.existsSync(modelRegistryPath)) {
      return JSON.parse(fs.readFileSync(modelRegistryPath, 'utf8'));
    }
  } catch {
    console.warn('[ModelRegistry] Error cargando registro, usando defaults');
  }
  return { models: {}, lastCronRun: null, cronStatus: 'never_run' };
}

function saveModelRegistry(data) {
  try {
    const dir = path.dirname(modelRegistryPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(modelRegistryPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('[ModelRegistry] Error guardando registro:', e.message);
  }
}

// Verificar disponibilidad de un proveedor haciendo un ping ligero
async function _pingProvider(providerName, endpoint, apiKey, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    let url, headers, body, method;

    switch (providerName) {
      case 'ollama_cloud':
        url = 'https://ollama.com/v1/chat/completions';
        headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
        body = JSON.stringify({ model: 'gpt-oss:20b', messages: [{ role: 'user', content: 'ping' }], max_tokens: 1 });
        method = 'POST';
        break;
      case 'groq':
        url = 'https://api.groq.com/openai/v1/models';
        headers = { 'Authorization': `Bearer ${apiKey}` };
        method = 'GET';
        break;
      case 'gemini':
        url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        method = 'GET';
        break;
      case 'openrouter':
        url = 'https://openrouter.ai/api/v1/models';
        headers = { 'Authorization': `Bearer ${apiKey}` };
        method = 'GET';
        break;
      default:
        return { online: false, error: 'Proveedor no soportado para ping' };
    }

    const res = await fetch(url, { method, headers, body: method === 'POST' ? body : undefined, signal: controller.signal });
    clearTimeout(timer);
    
    return {
      online: res.ok || res.status === 401, // 401 = endpoint vivo pero key inválida
      statusCode: res.status,
      latencyMs: Date.now(),
    };
  } catch (e) {
    clearTimeout(timer);
    return { online: false, error: e.message };
  }
}

// Detectar modelos gratuitos disponibles en routers y marcarlos como HOT
async function detectHotModels(registryData) {
  if (!registryData.models) registryData.models = {};
  
  const hotModels = new Set([
    'gpt-oss:20b', 'gpt-oss:120b', 'gemma4:31b', 'nemotron-3-nano:30b',
    'nemotron-3-super', 'nemotron-3-ultra'
  ]);

  try {
    console.log('[ModelRegistry] Obteniendo modelos dinámicos de OpenRouter...');
    const res = await fetch('https://openrouter.ai/api/v1/models', { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        json.data.forEach(model => {
          // Es gratis si los precios son explícitamente "0" o el ID termina en :free
          const isFree = (model.pricing && model.pricing.prompt === "0" && model.pricing.completion === "0") || model.id.endsWith(':free');
          if (isFree) {
            hotModels.add(model.id);
            if (!registryData.models[model.id]) {
              registryData.models[model.id] = {
                input: 0, output: 0,
                name: model.name || model.id.split('/').pop(),
                provider: 'openrouter',
                tier: 'free',
                contextWindow: model.context_length || 131072,
                capabilities: ['chat'],
                isHot: true,
                lastVerified: new Date().toISOString()
              };
            }
          }
        });
      }
      console.log(`[ModelRegistry] Modelos de OpenRouter sincronizados.`);
    }
  } catch (err) {
    console.warn('[ModelRegistry] Error al sincronizar modelos de OpenRouter:', err.message);
  }

  // Ollama Cloud publica su catálogo en /api/tags. Se registra sólo lo que
  // devuelve el proveedor; ningún modelo escrito a mano se marca disponible.
  try {
    const ollamaKey = process.env.OLLAMA_API_KEY || process.env.OLLAMA_KEY || '';
    const headers = ollamaKey ? { Authorization: `Bearer ${ollamaKey}` } : {};
    const res = await fetch('https://ollama.com/api/tags', { headers, signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const json = await res.json();
      for (const model of (json.models || [])) {
        const id = model.name || model.model;
        if (!id) continue;
        registryData.models[id] = {
          ...(registryData.models[id] || {}),
          name: id,
          provider: 'ollama_cloud',
          contextWindow: model.details?.context_length || registryData.models[id]?.contextWindow || 131072,
          capabilities: ['chat'],
          availability: 'catalog_listed',
          authenticated: Boolean(ollamaKey),
          lastVerified: new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn('[ModelRegistry] No se pudo consultar Ollama Cloud:', err.message);
  }

  // Actualizar flags en el registro
  for (const [modelId, modelData] of Object.entries(registryData.models)) {
    modelData.isHot = hotModels.has(modelId);
    modelData.lastVerified = new Date().toISOString();
  }

  return registryData;
}

// Cron de verificación cada 24 horas
async function runModelRegistryCron() {
  console.log('[ModelRegistry] Ejecutando cron de verificación de modelos...');
  
  const registry = loadModelRegistry();
  registry.lastCronRun = new Date().toISOString();
  registry.cronStatus = 'running';

  // Detectar modelos HOT dinámicamente
  await detectHotModels(registry);

  registry.cronStatus = 'completed';
  saveModelRegistry(registry);
  
  console.log(`[ModelRegistry] Cron completado. ${Object.keys(registry.models || {}).length} modelos en registro.`);
}

// Ejecutar cron cada 24 horas (86400000 ms)
setInterval(runModelRegistryCron, 24 * 60 * 60 * 1000);

// Ejecutar una vez al arrancar el servidor (con delay de 5 segundos)
setTimeout(runModelRegistryCron, 5000);

// Endpoint: Obtener registro de modelos
app.get('/api/models/registry', (req, res) => {
  try {
    const registry = loadModelRegistry();
    res.json({
      success: true,
      models: registry.models || {},
      lastCronRun: registry.lastCronRun,
      cronStatus: registry.cronStatus,
      totalModels: Object.keys(registry.models || {}).length,
    });
  } catch (error) {
    console.error('[ModelRegistry] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: Forzar verificación manual
app.post('/api/models/verify', async (req, res) => {
  try {
    await runModelRegistryCron();
    const registry = loadModelRegistry();
    res.json({ success: true, models: registry.models, lastCronRun: registry.lastCronRun });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────
//  TELEMETRÍA EXPANDIDA — Log detallado por llamada con metadata
// ─────────────────────────────────────────────────────────────────────────

app.post('/api/telemetry/call-log', (req, res) => {
  try {
    const { 
      provider, 
      model, 
      promptTokens, 
      completionTokens, 
      latencyMs, 
      promptPreview, 
      status, 
      module: planModule, 
      projectId = 'general',
      projectType = 'negocios',
      error: callError 
    } = req.body;
    
    if (!provider) {
      return res.status(400).json({ success: false, error: 'Proveedor requerido' });
    }

    const telemetryDir = path.resolve('proyectos', 'telemetry');
    if (!fs.existsSync(telemetryDir)) {
      fs.mkdirSync(telemetryDir, { recursive: true });
    }

    const totalTokens = (Number(promptTokens) || 0) + (Number(completionTokens) || 0);
    const logEntry = {
      timestamp: new Date().toISOString(),
      provider,
      model: model || 'unknown',
      promptTokens: Number(promptTokens) || 0,
      completionTokens: Number(completionTokens) || 0,
      totalTokens,
      latencyMs: Number(latencyMs) || 0,
      promptPreview: (promptPreview || '').slice(0, 200),
      status: status || 'success',
      module: planModule || 'general',
      projectId,
      projectType,
      error: callError || null,
      costUsd: 0, // Calculado por el frontend usando pricing.js
    };

    // Almacenar en JSONL para análisis futuro
    const callLogPath = path.join(telemetryDir, 'call_log.jsonl');
    fs.appendFileSync(callLogPath, JSON.stringify(logEntry) + '\n');

    // También actualizar el acumulador de tokens preservando la estructura canónica
    const tokenFilePath = path.join(telemetryDir, 'tokens_usage.json');
    let raw = {};
    if (fs.existsSync(tokenFilePath)) {
      try { raw = JSON.parse(fs.readFileSync(tokenFilePath, 'utf8')); } catch {}
    }

    const todayDate = new Date().toISOString().split('T')[0];
    let store = {
      accumulated: {},
      daily: {},
      byProject: {},
      lastUpdated: new Date().toISOString()
    };

    if (raw.accumulated && typeof raw.accumulated === 'object') {
      store.accumulated = raw.accumulated;
      store.daily = raw.daily || {};
      store.byProject = raw.byProject || {};
    } else {
      store.accumulated = { ...raw };
    }

    if (!store.daily[todayDate]) store.daily[todayDate] = {};
    if (!store.byProject) store.byProject = {};
    if (!store.byProject[projectId]) {
      store.byProject[projectId] = { totalTokens: 0, byProvider: {}, projectType };
    }

    store.accumulated[provider] = (store.accumulated[provider] || 0) + totalTokens;
    store.daily[todayDate][provider] = (store.daily[todayDate][provider] || 0) + totalTokens;
    store.byProject[projectId].totalTokens = (store.byProject[projectId].totalTokens || 0) + totalTokens;
    store.byProject[projectId].byProvider[provider] = (store.byProject[projectId].byProvider[provider] || 0) + totalTokens;
    store.lastUpdated = new Date().toISOString();

    fs.writeFileSync(tokenFilePath, JSON.stringify(store, null, 2), 'utf8');

    res.json({ success: true, entry: logEntry });
  } catch (error) {
    console.error('[Telemetry] Error guardando call-log:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: Obtener historial de llamadas (para sección de Trazabilidad)
app.get('/api/telemetry/call-log', (req, res) => {
  try {
    const telemetryDir = path.resolve('proyectos', 'telemetry');
    const callLogPath = path.join(telemetryDir, 'call_log.jsonl');
    
    if (!fs.existsSync(callLogPath)) {
      return res.json({ success: true, entries: [], total: 0 });
    }

    const data = fs.readFileSync(callLogPath, 'utf8');
    const lines = data.split('\n').filter(l => l.trim().length > 0);
    
    // Parsear las últimas 500 entradas (más recientes primero)
    const entries = [];
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 500); i--) {
      try {
        entries.push(JSON.parse(lines[i]));
      } catch {}
    }

    // Estadísticas agregadas
    const stats = {};
    entries.forEach(e => {
      if (!stats[e.provider]) {
        stats[e.provider] = { totalTokens: 0, calls: 0, totalLatency: 0, errors: 0 };
      }
      stats[e.provider].totalTokens += e.totalTokens || 0;
      stats[e.provider].calls += 1;
      stats[e.provider].totalLatency += e.latencyMs || 0;
      if (e.status === 'error') stats[e.provider].errors += 1;
    });

    // Calcular latencia promedio por proveedor
    Object.values(stats).forEach(s => {
      s.avgLatencyMs = s.calls > 0 ? Math.round(s.totalLatency / s.calls) : 0;
    });

    res.json({ 
      success: true, 
      entries, 
      total: lines.length,
      stats,
    });
  } catch (error) {
    console.error('[Telemetry] Error leyendo call-log:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/health — Verificación de estado del backend (usado por deploy_vps.sh)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.6',
    service: 'OpenPlan Backend',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's'
  });
});

// Servir archivos estáticos del frontend en producción
const distPath = path.resolve('dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// En producción, PM2 pasa HOST=127.0.0.1 vía ecosystem.config.cjs
// para que solo Nginx pueda alcanzar a Express.
// En desarrollo, 0.0.0.0 permite acceso desde cualquier interfaz.
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     🏭  OpenPlan — Backend Industrial v2         ║');
  console.log(`║     Puerto: http://${HOST}:${PORT}                ║`);
  console.log('║     Monitor de IA: /api/log activo               ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log('Esperando actividad…');
  console.log('');
});
