import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { search } from 'duck-duck-scrape';

const router = express.Router();
const CACHE_DIR = path.resolve('server/data/market_cache');
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const emptyLayer = (nivel, message) => ({
  nivel,
  status: 'no_data',
  message,
  establecimientos: [],
  evidencias: []
});

function getCacheKey(params) {
  return crypto.createHash('md5').update(JSON.stringify(params, Object.keys(params).sort())).digest('hex');
}

function readFromCache(cacheKey) {
  try {
    const filePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    if (!fs.existsSync(filePath)) return null;
    const entry = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const age = Date.now() - entry.timestamp;
    return age < CACHE_TTL_MS
      ? { ...entry.data, _fromCache: true, _cacheAgeHours: (age / 3600000).toFixed(1) }
      : null;
  } catch {
    return null;
  }
}

function writeToCache(cacheKey, data) {
  try {
    fs.writeFileSync(
      path.join(CACHE_DIR, `${cacheKey}.json`),
      JSON.stringify({ timestamp: Date.now(), ttlHours: 24, data }, null, 2),
      'utf8'
    );
  } catch (error) {
    console.error('[MarketCascade] Error al escribir en caché:', error.message);
  }
}

export function createMissingContextResult() {
  return {
    success: false,
    status: 'missing_context',
    error: 'projectId, query, sector y ubicacion son requeridos para investigar el mercado.',
    capaLocal: emptyLayer('Local (Territorial)', 'Completa el contexto del proyecto para consultar el mercado local.'),
    capaNacional: emptyLayer('Nacional (Web)', 'Completa el contexto del proyecto para consultar fuentes nacionales.'),
    capaInternacional: emptyLayer('Internacional (Comercio Exterior)', 'Completa el contexto del proyecto para consultar comercio exterior.')
  };
}

export async function ejecutarCascadaMercado({ projectId, query, sector, ubicacion, fraccionArancelaria = '' } = {}) {
  const params = {
    projectId: String(projectId || '').trim(),
    query: String(query || '').trim(),
    sector: String(sector || '').trim(),
    ubicacion: String(ubicacion || '').trim(),
    fraccionArancelaria: String(fraccionArancelaria || '').trim()
  };

  if (!params.projectId || !params.query || !params.sector || !params.ubicacion) {
    return createMissingContextResult();
  }

  const cacheKey = getCacheKey(params);
  const cached = readFromCache(cacheKey);
  if (cached) return cached;

  let evidenciasWeb = [];
  try {
    const result = await search(`${params.query} ${params.ubicacion}`, { safeSearch: 0 });
    evidenciasWeb = (result?.results || []).slice(0, 5).map((item) => ({
      titulo: item.title,
      url: item.url,
      snippet: item.description,
      provenance: 'real'
    }));
  } catch {
    // La ausencia de conectividad se representa como ausencia de evidencia, no como datos sintéticos.
  }

  const payload = {
    success: true,
    status: 'completed',
    parametros: params,
    capaLocal: emptyLayer('Local (Territorial)', 'Sin conector territorial configurado para este proyecto.'),
    capaNacional: {
      ...emptyLayer('Nacional (Web)', 'No se encontraron evidencias web verificables.'),
      status: evidenciasWeb.length ? 'verified' : 'no_data',
      evidencias: evidenciasWeb
    },
    capaInternacional: params.fraccionArancelaria
      ? {
          ...emptyLayer('Internacional (Comercio Exterior)', 'Sin conector de comercio exterior configurado para este proyecto.'),
          fraccionArancelaria: params.fraccionArancelaria
        }
      : emptyLayer('Internacional (Comercio Exterior)', 'Agrega una fracción arancelaria para investigar comercio exterior.'),
    timestamp: Date.now()
  };

  writeToCache(cacheKey, payload);
  return payload;
}

router.post('/cascada', async (req, res) => {
  try {
    const result = await ejecutarCascadaMercado(req.body || {});
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('[MarketCascade] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/cache/status', (_req, res) => {
  try {
    const files = fs.readdirSync(CACHE_DIR).filter((file) => file.endsWith('.json'));
    return res.json({ total_archivos_cache: files.length, ttl_horas: 24, directorio: CACHE_DIR });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
