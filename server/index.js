import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { search as ddgSearch } from 'duck-duck-scrape';

const app = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────────────────────
//  SSE — Clientes suscritos al monitor en tiempo real
// ─────────────────────────────────────────────────────────
const sseClients = new Set();

function broadcast(eventData) {
  const payload = `data: ${JSON.stringify(eventData)}\n\n`;
  sseClients.forEach(res => {
    try { res.write(payload); } catch (_) { sseClients.delete(res); }
  });
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));

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

  const sections = ['semilla', 'naturaleza', 'mercado', 'tecnico', 'organizacion', 'finanzas'];
  
  for (const section of sections) {
    if (planData[section]) {
      md += `## ${section.toUpperCase()}\n\n`;
      
      for (const [moduleKey, moduleData] of Object.entries(planData[section])) {
        if (moduleKey === 'staff') continue;
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

app.post('/api/save', (req, res) => {
  try {
    const planData = req.body;
    const projectTypeRaw = planData.config?.projectType || 'business';
    const projectType = projectTypeRaw === 'social_bid' ? 'social' : 'negocios';
    const rawName = planData.config?.projectId || planData.semilla?.negocio?.nombre_marca || planData.config?.brandKit?.companyName || `Proyecto_${Date.now()}`;
    const safeName = rawName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Create new structure: proyectos/{type}/{safeName}/
    const dirPath = path.resolve(`proyectos/${projectType}/${safeName}`);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Create documentos subfolder
    const docsPath = path.join(dirPath, 'documentos');
    if (!fs.existsSync(docsPath)) {
      fs.mkdirSync(docsPath, { recursive: true });
    }

    const jsonPath = path.join(dirPath, `${safeName}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(planData, null, 2));

    const mdPath = path.join(dirPath, `${safeName}.md`);
    const mdContent = jsonToMarkdown(planData);
    fs.writeFileSync(mdPath, mdContent);

    res.json({ success: true, message: 'Proyecto guardado en disco duro local (.json y .md)', file: safeName });
  } catch (error) {
    console.error('Error guardando el proyecto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/projects', (req, res) => {
  const baseDir = path.resolve('proyectos');
  const results = { negocios: [], social: [] };

  ['negocios', 'social'].forEach(type => {
    const dir = path.join(baseDir, type);
    if (fs.existsSync(dir)) {
      const projects = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
         if (entry.isDirectory()) {
            const jsonPath = path.join(dir, entry.name, `${entry.name}.json`);
            if (fs.existsSync(jsonPath)) {
               const stats = fs.statSync(jsonPath);
               projects.push({
                 id: entry.name,
                 name: entry.name.replace(/_/g, ' '),
                 file: `${entry.name}.json`,
                 mtime: stats.mtime,
                 size: stats.size
               });
            }
         } else if (entry.name.endsWith('.json') && !entry.name.includes('_logs')) {
            // Legacy support
            const stats = fs.statSync(path.join(dir, entry.name));
            projects.push({
                 id: entry.name.replace('.json', ''),
                 name: entry.name.replace('.json', '').replace(/_/g, ' '),
                 file: entry.name,
                 mtime: stats.mtime,
                 size: stats.size
            });
         }
      }
      results[type] = projects;
    }
  });

  res.json(results);
});

app.get('/api/projects/:type/:id', (req, res) => {
  const { type, id } = req.params;
  let filePath = path.resolve('proyectos', type, id, `${id}.json`);
  
  if (!fs.existsSync(filePath)) {
     // Legacy check
     filePath = path.resolve('proyectos', type, `${id}.json`);
  }
  
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } else {
    res.status(404).json({ error: 'Proyecto no encontrado' });
  }
});

// ─────────────────────────────────────────────────────────
//  Búsqueda Web (Tavily / DuckDuckGo)
// ─────────────────────────────────────────────────────────
app.post('/api/search', async (req, res) => {
  const { query, provider = 'tavily', apiKey = '' } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, error: 'Query is requerido' });
  }

  try {
    if (provider === 'tavily') {
      if (!apiKey) {
        return res.status(400).json({ success: false, error: 'Se requiere API key de Tavily' });
      }
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey,
          query: query,
          search_depth: "basic",
          include_answer: false,
          max_results: 5
        }),
      });
      const data = await response.json();
      if (data.error) {
        return res.status(400).json({ success: false, error: data.error });
      }
      const results = (data.results || []).map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.content
      }));
      return res.json({ success: true, provider: 'tavily', results });
    } else if (provider === 'duckduckgo') {
      const response = await ddgSearch(query);
      const results = (response.results || []).slice(0, 5).map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.description
      }));
      return res.json({ success: true, provider: 'duckduckgo', results });
    } else {
      return res.status(400).json({ success: false, error: 'Proveedor desconocido' });
    }
  } catch (err) {
    console.error('Error en búsqueda web:', err);
    return res.status(500).json({ success: false, error: err.message });
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

app.get('/api/inegi/denue', async (req, res) => {
  const token = String(req.query.token || '').trim();
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Number(req.query.radius || 2500);
  const keywords = String(req.query.keywords || 'todos').trim().toLowerCase();

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ success: false, error: 'Lat/Lng inválidos' });
  }

  // 1. Intentar búsqueda local offline si existe el archivo
  const localPath = path.resolve('server/data/denue_hermosillo.json');
  if (fs.existsSync(localPath)) {
    try {
      if (!localDenueData) {
        console.log('Cargando base de datos DENUE local en memoria...');
        localDenueData = JSON.parse(fs.readFileSync(localPath, 'utf8'));
        console.log(`Base de datos local cargada: ${localDenueData.length} registros.`);
      }

      // Filtrar localmente por distancia y por actividad/sector
      const results = [];
      const keywordsClean = keywords === 'todos' || keywords === '0' ? '' : keywords;

      for (const item of localDenueData) {
        // Filtro por coordenadas y distancia
        const d = getDistance(lat, lng, item.lat, item.lng);
        if (d <= radius) {
          // Filtro por sector/palabras clave
          let match = true;
          if (keywordsClean) {
            // Si la keyword es un sector numérico (ej: "54", "52")
            if (/^\d+$/.test(keywordsClean)) {
              match = (item.sector === keywordsClean || item.codigo_act.startsWith(keywordsClean));
            } else {
              match = item.nombre.toLowerCase().includes(keywordsClean) ||
                      item.nombre_act.toLowerCase().includes(keywordsClean);
            }
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

      console.log(`[Offline DENUE] Encontrados ${results.length} negocios locales para sector: ${keywords} en radio ${radius}m.`);
      return res.json({
        success: true,
        total: results.length,
        businesses: results
      });

    } catch (localErr) {
      console.error('Error procesando búsqueda local DENUE:', localErr);
    }
  }

  // 2. Fallback a la API de INEGI si no hay datos locales
  if (!token) return res.status(400).json({ success: false, error: 'Token DENUE no configurado y base de datos local no disponible' });

  try {
    const candidates = [
      `https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/${encodeURIComponent(keywords)}/${lat},${lng}/${radius}/${token}`,
      `https://www.gslb.inegi.org.mx/app/api/denue/v1/consulta/Buscar/${encodeURIComponent(keywords)}/${lat},${lng}/${radius}/${token}`,
      `http://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/${encodeURIComponent(keywords)}/${lat},${lng}/${radius}/${token}`,
    ];

    let payload = null;
    let lastError = null;

    for (const url of candidates) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
        const text = await response.text();
        if (!text) continue;
        payload = JSON.parse(text);
        if (Array.isArray(payload)) break;
      } catch (e) {
        lastError = e;
      }
    }

    if (!Array.isArray(payload)) {
      return res.json({ success: false, error: `Respuesta inválida o no disponible de INEGI (${lastError?.message || 'sin detalle'})` });
    }

    const normalizeRow = (item) => {
      if (Array.isArray(item)) {
        return {
          nombre: item[2] || 'Sin nombre',
          actividad: item[4] || 'N/D',
          estrato: item[5] || 'N/D',
          direccion: `${item[6] || ''} ${item[7] || ''} ${item[8] || ''}`.trim(),
          lat: Number(item[18] || 0),
          lng: Number(item[17] || 0),
          scianClase: item[25] || '',
          scianSector: item[26] || '',
        };
      }

      return {
        nombre: item.Nombre || 'Sin nombre',
        actividad: item.Clase_actividad || 'N/D',
        estrato: item.Estrato || 'N/D',
        direccion: `${item.Tipo_vialidad || ''} ${item.Calle || ''} ${item.Num_Exterior || ''}`.trim(),
        lat: Number(item.Latitud || 0),
        lng: Number(item.Longitud || 0),
        scianClase: item.Codigo_act || item.Id_Clase || '',
        scianSector: item.Id_Sector || '',
      };
    };

    return res.json({
      success: true,
      total: payload.length,
      businesses: payload.map(normalizeRow),
    });
  } catch (error) {
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

app.post('/api/log', (req, res) => {
  const { type = 'stage', module, message, provider, elapsed, projectId, projectType } = req.body;
  const icon = ICONS[type] || '·';
  const time = new Date().toLocaleTimeString('es-MX');
  const elapsedStr = elapsed ? ` [${(elapsed / 1000).toFixed(1)}s]` : '';
  const providerStr = provider ? ` (${provider.toUpperCase()})` : '';
  const moduleStr   = module   ? ` [${module}]` : '';

  console.log(`${time} ${icon}${moduleStr}${providerStr}${elapsedStr} → ${message}`);
  
  const logEntry = { type, module, message, provider, elapsed, time, projectId, projectType };
  broadcast(logEntry);
  
  if (projectId && projectType) {
    try {
      const dirPath = path.resolve(`proyectos/${projectType}`);
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
        } catch (_) {}
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
  const filePath = path.resolve('proyectos', type, `${id}_logs.json`);
  
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      res.json(JSON.parse(data));
    } catch (e) {
      res.status(500).json({ error: 'Error al parsear el archivo de logs' });
    }
  } else {
    res.json([]);
  }
});

app.delete('/api/projects/:type/:id/logs', (req, res) => {
  const { type, id } = req.params;
  const filePath = path.resolve('proyectos', type, `${id}_logs.json`);
  
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Historial de logs eliminado' });
    } catch (err) {
      res.status(500).json({ error: 'No se pudo eliminar el archivo de logs' });
    }
  } else {
    res.json({ success: true, message: 'No había historial de logs' });
  }
});

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     🏭  OpenPlan — Backend Industrial v2         ║');
  console.log(`║     Puerto: http://localhost:${PORT}                ║`);
  console.log('║     Monitor de IA: /api/log activo               ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log('Esperando actividad…');
  console.log('');
});
