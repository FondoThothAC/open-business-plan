import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

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
    const rawName = planData.semilla?.negocio?.nombre_marca || `Proyecto_${Date.now()}`;
    const safeName = rawName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    const dirPath = path.resolve(`proyectos/${projectType}`);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
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
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
      results[type] = files.map(f => ({
        id: f.replace('.json', ''),
        name: f.replace('.json', '').replace(/_/g, ' '),
        file: f
      }));
    }
  });

  res.json(results);
});

app.get('/api/projects/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const filePath = path.resolve('proyectos', type, `${id}.json`);
  
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } else {
    res.status(404).json({ error: 'Proyecto no encontrado' });
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
  const { type = 'stage', module, message, provider, elapsed } = req.body;
  const icon = ICONS[type] || '·';
  const time = new Date().toLocaleTimeString('es-MX');
  const elapsedStr = elapsed ? ` [${(elapsed / 1000).toFixed(1)}s]` : '';
  const providerStr = provider ? ` (${provider.toUpperCase()})` : '';
  const moduleStr   = module   ? ` [${module}]` : '';

  console.log(`${time} ${icon}${moduleStr}${providerStr}${elapsedStr} → ${message}`);
  
  broadcast({ type, module, message, provider, elapsed, time });
  
  res.json({ ok: true });
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
