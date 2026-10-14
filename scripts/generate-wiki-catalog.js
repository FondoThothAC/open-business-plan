#!/usr/bin/env node
/**
 * generate-wiki-catalog.js — Genera el catálogo del Wiki de Software OBP.
 *
 * Fuente de verdad: el código. No escribe ningún texto a mano que pueda duplicar
 * docs/ o src/: todo título, descripción, campo, prompt, caja y dirección canónica
 * se lee de los módulos del proyecto. Para regenerar: `npm run wiki:build`.
 *
 * Salida: server/wiki/catalog/index.json + server/wiki/catalog/pages/<pageId>.json
 * Cada sección de una página lleva `audience`: 'cliente' (todo usuario con sesión)
 * o 'tecnico' (solo superadmin; el servidor filtra antes de responder).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FRAMEWORKS } from '../src/config/frameworks.js';
import { FIELD_GUIDES_MAP } from '../src/lib/field_guides.js';
import { BOX_REGISTRY } from '../src/config/boxRegistry.js';
import { getBoxIdsForModule } from '../src/config/moduleBoxMap.js';
import { fieldAddress, getFieldContract } from '../src/lib/planContracts.js';
import { FRAMEWORK_SLUG_MAP, REVERSE_FRAMEWORK_SLUG_MAP } from '../src/config/urlRouting.js';
import { WIKI_ARTICLES, WIKI_CATEGORIES } from '../src/data/wikiArticles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');
export const OUT_DIR = 'server/wiki/catalog';
export const SCHEMA_VERSION = 'wiki-catalog-v1';
export const GENERATOR = 'scripts/generate-wiki-catalog.js';

/** docs/<metodologia>.md por clave de framework: sustenta el "por qué existe". */
export const METHODOLOGY_DOCS = {
  business: 'docs/business.md',
  social_bid: 'docs/social_bid.md',
  agile_startup: 'docs/agile_startup.md',
  technology_id: 'docs/technology_id.md',
  micro_business: 'docs/micro_business.md',
  investment_project: 'docs/investment_project.md',
  zopp: 'docs/zopp.md',
  horizon_europe: 'docs/horizon_europe.md',
  hoshin_kanri: 'docs/hoshin_kanri.md',
  amoeba_management: 'docs/amoeba_management.md',
  guanxi_plan: 'docs/guanxi_plan.md',
  onudi_project: 'docs/onudi_project.md'
};

const readSource = (rel) => {
  try {
    return fs.readFileSync(path.join(ROOT, rel), 'utf8');
  } catch {
    return '';
  }
};

/** Slug de página: estable, derivado de claves reales, sin contadores. */
export const pageIdOf = (...parts) => parts.filter(Boolean).join('.').replace(/[^a-z0-9._-]/gi, '-');

/**
 * Convierte las pocas fórmulas LaTeX del corpus a unicode legible.
 * No se instala KaTeX (restricción de disco del VPS), así que el renderizado
 * plano debe resolverse aquí, en generación, no en el navegador.
 */
export function latexToUnicode(text = '') {
  const map = {
    '\\text{': '', '}': '', '\\cdot': '·', '\\times': '×', '\\frac{1}{1+r}': '1/(1+r)',
    '\\sum': 'Σ', '\\Delta': 'Δ', '\\approx': '≈', '\\leq': '≤', '\\geq': '≥',
    '\\%': '%', '\\$': '$', ' _{': '_', '\\_{': '_'
  };
  return String(text)
    .replace(/\$\$([\s\S]*?)\$\$/g, (_m, body) => {
      let out = body.trim();
      for (const [from, to] of Object.entries(map)) out = out.split(from).join(to);
      return out.replace(/\\[a-zA-Z]+/g, '');
    })
    .replace(/\\\[([\s\S]*?)\\\]/g, (_m, body) => body.trim());
}

const oneLine = (s, max = 260) => {
  const clean = String(s || '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
};

/** Quita el H1 del doc de metodología: la wiki ya pone su propio título. */
function stripH1(md = '') {
  return md.replace(/^\uFEFF/, '').replace(/^\s*#\s[^\n]*\n/, '').trim();

}

function listJsFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listJsFiles(full, acc);
    else if (/\.(js|mjs|cjs)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

/** Rutas Express reales: método, ruta, archivo y línea. */
export function extractRoutes() {
  const files = listJsFiles(path.join(ROOT, 'server'));
  const routes = [];
  const mountRe = /app\.use\(\s*'([^']+)'/g;
  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const src = fs.readFileSync(file, 'utf8');
    src.split('\n').forEach((lineText, i) => {
      const m = lineText.match(/app\.(get|post|put|patch|delete)\(\s*'([^']+)'/);
      if (m) routes.push({ method: m[1].toUpperCase(), path: m[2], file: rel, line: i + 1 });
    });
    for (const mount of src.matchAll(mountRe)) {
      if (mount[1].startsWith('/api')) routes.push({ method: 'USE', path: mount[1], file: rel, line: 0 });
    }
  }
  return routes.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method) || a.file.localeCompare(b.file));
}

/** Nombres de variables de entorno (nunca valores). */
export function extractEnvVars() {
  const serverVars = new Set();
  for (const file of listJsFiles(path.join(ROOT, 'server'))) {
    for (const m of fs.readFileSync(file, 'utf8').matchAll(/process\.env\.([A-Z][A-Z0-9_]{2,})/g)) serverVars.add(m[1]);
  }
  const clientVars = new Set();
  for (const file of listJsFiles(path.join(ROOT, 'src'))) {
    for (const m of fs.readFileSync(file, 'utf8').matchAll(/VITE_([A-Z0-9_]{2,})/g)) clientVars.add(`VITE_${m[1]}`);
  }
  return { server: [...serverVars].sort(), client: [...clientVars].sort() };
}

/** Hosts de proveedores de IA permitidos (allowlist anti-SSRF, que es un Set congelado). */
export function extractProviderHosts() {
  const src = readSource('server/aiEndpointAllowlist.js');
  const block = src.match(/AI_PROVIDER_HOSTS\s*=\s*Object\.freeze\(\s*new Set\(\s*\[([\s\S]*?)\]\s*\)/);
  if (!block) return [];
  return [...block[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]).sort();
}

export function fieldEntriesFor(projectType, pillarKey, moduleKey, fields = []) {
  return fields.map((raw) => {
    const key = typeof raw === 'object' ? raw.key : raw;
    const contract = getFieldContract(projectType, pillarKey, moduleKey, key);
    const guide = FIELD_GUIDES_MAP[projectType]?.[key] || FIELD_GUIDES_MAP.business?.[key] || {};
    return {
      key,
      type: contract.type || 'text',
      address: fieldAddress(projectType, pillarKey, moduleKey, key),
      prompt: oneLine(contract.prompt, 1200),
      ejemplo: oneLine(guide.ejemplo || guide.example || '', 600),
      benchmark: oneLine(guide.benchmark || '', 400),
      cita: oneLine(typeof guide.cita === 'string' ? guide.cita : '', 200),
      placeholder: oneLine(guide.placeholder || '', 300)
    };
  });
}

/**
 * Cajas que la UI realmente muestra en el módulo. `getBoxIdsForModule` es la única
 * que consumen ModuleWrapper.jsx y VistaPrevia.jsx; getCombinedBoxesForModule además
 * mezcla ids con objetos de BOX_REGISTRY, así que documentarla aquí mentiría.
 */
function moduleBoxes(projectType, moduleKey) {
  const registry = BOX_REGISTRY[projectType] || [];
  return getBoxIdsForModule(moduleKey, projectType).map((box) => {
    const id = typeof box === 'string' ? box : box?.id;
    const found = registry.find((b) => b.id === id);
    return {
      id,
      title: found?.title || id,
      type: found?.type || 'desconocido',
      description: oneLine(found?.description || '', 300),
      source: found?.source ? `${found.source.book || ''}${found.source.page ? ` — ${found.source.page}` : ''}` : ''
    };
  });
}

function modulePage(projectType, fwSlug, pillar, mod) {
  const fields = fieldEntriesFor(projectType, pillar.key, mod.key, mod.fields || []);
  const boxes = moduleBoxes(projectType, mod.key);
  const id = pageIdOf('modulo', projectType, mod.key);
  const url = `/${fwSlug}/${mod.key}`;

  const uso = [
    mod.description ? `**Qué es.** ${mod.description}` : '',
    `**Cómo se usa.** Está en el pilar **${pillar.title}** del modelo *${FRAMEWORKS[projectType].name}*. Se abre en \`${url}\`, y dentro de la página cada campo es un editor con su propio botón de generación.`,
    fields.length
      ? `**Se rellena con** ${fields.length} campo${fields.length === 1 ? '' : 's'}: ${fields.map((f) => `\`${f.key}\``).join(', ')}.`
      : `**Sin campos de texto**: este módulo se trabaja con sus herramientas visuales o con los campos de módulos vecinos.`,
    boxes.length
      ? `**Herramientas del módulo.** ${boxes.length} caja(s): ${boxes.map((b) => `\`${b.id}\``).join(', ')}.`
      : `**Herramientas del módulo.** Ninguna específica: se apoya en los campos de texto.`
  ].filter(Boolean).join('\n\n');

  const campos = fields.length
    ? fields.map((f) => [
        `### \`${f.key}\``,
        `**El prompt que usa:** ${f.prompt}`,
        f.ejemplo ? `**Ejemplo que muestra la guía:** ${f.ejemplo}` : '',
        f.benchmark ? `**Benchmark / criterio de calidad:** ${f.benchmark}` : '',
        f.cita ? `**De dónde viene la guía:** ${f.cita}` : ''
      ].filter(Boolean).join('\n\n')).join('\n\n')
    : 'Este módulo no declara campos.';

  const tecnico = [
    `**Direcciones canónicas** (\`src/lib/planContracts.js\`, función \`fieldAddress\`):`,
    fields.map((f) => `- \`${f.address}\` → tipo \`${f.type}\`` ).join('\n'),
    `**Cómo se arma el prompt en runtime:** \`src/lib/ai.js\`, función \`generateModuleContent()\`. Combina la instrucción de \`src/lib/field_guides.js\` con el contexto de la semilla, las restricciones financieras y el nivel de verbosidad; si el proyecto tiene un prompt propio en \`planData.config.customPrompts\`, ese gana.`,
    `**Cómo personalizarlo:** el botón de edición de cada campo abre \`src/components/PromptEditor.jsx\`, que guarda la sobrescritura por proyecto sin tocar el código base.`,
    boxes.length
      ? `**Cajas declaradas para este módulo** (\`src/config/moduleBoxMap.js\`, clave \`${projectType}:${mod.key}\`): ${boxes.map((b) => `\`${b.id}\``).join(', ')}.`
      : `**Cajas:** \`src/config/moduleBoxMap.js\` no declara cajas para \`${projectType}:${mod.key}\`; la pantalla muestra solo los campos de texto.`,
    `**Fuentes:** \`src/config/frameworks.js\` · \`src/lib/field_guides.js\` · \`src/config/moduleBoxMap.js\` · \`src/config/boxRegistry.js\``
  ].filter(Boolean).join('\n\n');

  return {
    id,
    title: mod.title,
    summary: oneLine(mod.description || mod.title, 180),
    kind: 'modulo',
    /** Rol mínimo para ABRIR la página; las secciones 'tecnico' se ocultan aparte. */
    audience: 'cliente',
    model: projectType,
    moduleKey: mod.key,
    pillarKey: pillar.key,
    openUrl: url,
    fields,
    boxes,
    sections: [
      { id: 'uso', title: 'Cómo se usa en el plan', audience: 'cliente', markdown: uso },
      { id: 'campos', title: 'Campos y el prompt de cada uno', audience: 'cliente', markdown: campos },
      {
        id: 'cajas',
        title: 'Herramientas del módulo',
        audience: 'cliente',
        markdown: boxes.length
          ? boxes.map((b) => `### ${b.title}\n\n\`${b.id}\` · tipo **${b.type}**${b.source ? ` · fuente: ${b.source}` : ''}\n\n${b.description}`).join('\n\n')
          : 'Sin cajas asociadas.'
      },
      {
        id: 'porque',
        title: 'Por qué existe',
        audience: 'cliente',
        markdown: `Forma parte del pilar **${pillar.title}** de *${FRAMEWORKS[projectType].name}*. La justificación metodológica completa está en la página del modelo y en \`${METHODOLOGY_DOCS[projectType] || 'docs/'}\`.`
      },
      { id: 'tecnico', title: 'Detalles técnicos', audience: 'tecnico', markdown: tecnico }
    ]
  };
}

function modelPage(projectType) {
  const fw = FRAMEWORKS[projectType];
  const fwSlug = FRAMEWORK_SLUG_MAP[projectType] || projectType.replace(/_/g, '-');
  const pillars = fw.pillars || [];
  const modules = pillars.flatMap((p) => p.modules || []);
  const fieldsCount = modules.reduce((a, m) => a + (m.fields?.length || 0), 0);
  const docRel = METHODOLOGY_DOCS[projectType];
  const docBody = docRel ? stripH1(readSource(docRel)) : '';

  const id = pageIdOf('modelo', projectType);
  const pages = modules.map((mod) => {
    const pillar = pillars.find((p) => (p.modules || []).includes(mod));
    return modulePage(projectType, fwSlug, pillar, mod);
  });

  const overview = [
    `**${fw.name}** (\`${projectType}\`) organiza el plan en ${pillars.length} pilar(es) y ${modules.length} módulo(s), con ${fieldsCount} campo(s) de texto editables.`,
    modules.slice(0, 400).map((m) => {
      const pillar = pillars.find((p) => (p.modules || []).includes(m));
      return `- **${m.title}** (_${pillar.title}_) — ${oneLine(m.description || '', 150)}`;
    }).join('\n')
  ].join('\n\n');

  const methodology = docBody
    ? `Documento de la metodología que sustenta este modelo: \`${docRel}\`.\n\n${docBody}`
    : `No hay \`${docRel || 'doc de metodología'}\` en el repo para este modelo. Falta escribirlo o enlazar la fuente correcta.`;

  const page = {
    id,
    title: fw.name,
    summary: oneLine(`Modelo de plan con ${modules.length} módulos y ${fieldsCount} campos.`, 180),
    kind: 'modelo',
    audience: 'cliente',
    model: projectType,
    slug: fwSlug,
    stats: { pillars: pillars.length, modules: modules.length, fields: fieldsCount },
    sections: [
      { id: 'resumen', title: 'Resumen', audience: 'cliente', markdown: overview },
      {
        id: 'metodologia',
        title: 'Metodología que lo sustenta',
        audience: 'cliente',
        markdown: methodology
      }
    ]
  };

  return { page, pages, fwSlug };
};

function buildReferencePages(routes, envVars, providerHosts) {
  const routesByGroup = new Map();
  for (const r of routes) {
    const group = (r.path.split('/')[2] || r.path.replace(/^\//, '')).split('/')[0] || 'root';
    if (!routesByGroup.has(group)) routesByGroup.set(group, []);
    routesByGroup.get(group).push(r);
  }

  const apis = {
    id: 'referencia-apis',
    title: 'APIs e integraciones',
    summary: 'Qué endpoint sirve qué, con qué proveedor y qué variable de entorno necesita.',
    kind: 'referencia',
    audience: 'tecnico',
    sections: [
      {
        id: 'rutas',
        title: `Rutas registradas (${routes.length})`,
        audience: 'tecnico',
        markdown: [...routesByGroup.entries()]
          .sort((a, b) => b[1].length - a[1].length)
          .map(([group, list]) => `### \`/${group}\` (${list.length})\n\n${list.map((r) => `- \`${r.method} ${r.path}\`${r.line ? ` — \`${r.file}:${r.line}\`` : ` — \`${r.file}\``}`).join('\n')}`)
          .join('\n\n')
      },
      {
        id: 'hosts',
        title: 'Hosts de proveedores permitidos',
        audience: 'tecnico',
        markdown: providerHosts.length
          ? `Allowlist anti-SSRF de \`server/aiEndpointAllowlist.js\`: un endpoint fuera de esta lista se rechaza aunque la llave sea válida.\n\n${providerHosts.map((h) => `- \`${h}\``).join('\n')}`
          : 'No se encontró `AI_PROVIDER_HOSTS` en `server/aiEndpointAllowlist.js`.'
      },
      {
        id: 'env',
        title: 'Variables de entorno (solo nombres)',
        audience: 'tecnico',
        markdown: [
          '**Server-only** (`process.env` — nunca viajan al navegador):',
          envVars.server.map((v) => `- \`${v}\``).join('\n') || '_ninguna detectada_',
          '**Cliente Vite** (`VITE_*` — quedan visibles en el bundle, por eso no deben contener secretos):',
          envVars.client.map((v) => `- \`${v}\``).join('\n') || '_ninguna detectada_'
        ].join('\n\n')
      }
    ]
  };

  const altaApi = {
    id: 'referencia-alta-api',
    title: 'Alta de API de investigación o datos',
    summary: 'Guía técnica para integrar y homologar nuevos proveedores de datos externos en el backend.',
    kind: 'referencia',
    audience: 'tecnico',
    sections: [
      {
        id: 'protocolo',
        title: 'Protocolo de consulta y estados normalizados',
        audience: 'tecnico',
        markdown: [
          'Toda integración de datos o investigación externa en OBP debe registrar proveedor, timestamp, parámetros y estado de respuesta.',
          '**Estados normalizados de consulta:**',
          '- `ok`: La consulta se completó y devolvió datos verificados.',
          '- `missing_key`: El usuario o el entorno no tienen configurada la credencial requerida.',
          '- `quota_exceeded`: La cuota del proveedor se agotó para el periodo actual.',
          '- `unavailable`: El endpoint remoto devolvió 5xx o timeout de conexión.',
          '- `rejected`: La API key fue rechazada por autenticación inválida (HTTP 401/403).',
          '- `no_results`: La búsqueda fue exitosa pero no arrojó registros para los parámetros solicitados.',
          '**Regla de no alucinación:** Nunca inventar cifras ni inferir datos censales o fiscales si la API devuelve error.'
        ].join('\n\n')
      },
      {
        id: 'seguridad',
        title: 'Almacenamiento seguro de credenciales',
        audience: 'tecnico',
        markdown: [
          'Las credenciales de servicios externos **NUNCA** se almacenan en el navegador (`localStorage` o cookies) ni viajan en respuestas hacia clientes.',
          'En el servidor se gestionan mediante:',
          '1. **Variables de entorno del sistema (`process.env`)**: Para servicios compartidos de la plataforma.',
          '2. **Perfil cifrado de usuario (`server/auth.js`)**: Las llaves personales de usuarios se cifran con **AES-256-GCM** antes de persistirse en disco.'
        ].join('\n\n')
      },
      {
        id: 'pasos',
        title: 'Pasos para dar de alta un endpoint',
        audience: 'tecnico',
        markdown: [
          '1. Declarar el servicio en `docs/api-guides.md` con su URL de documentación oficial y alcance.',
          '2. Si es un servicio de IA, incluir su host en la allowlist `AI_PROVIDER_HOSTS` de `server/aiEndpointAllowlist.js`.',
          '3. Implementar la función de llamada en `server/` con control de timeout (máximo 15-30s) y manejo de estados.',
          '4. Registrar la ruta bajo `authGuard` en `server/index.js` o en el router correspondiente.',
          '5. Ejecutar `npm run wiki:build` para que la nueva ruta quede catalogada automáticamente en la documentación.'
        ].join('\n\n')
      }
    ]
  };

  const proveedorLlm = {
    id: 'referencia-proveedor-llm',
    title: 'Conexión de nuevos proveedores de LLM',
    summary: 'Protocolo de seguridad anti-SSRF y orquestación para integrar nuevos modelos de lenguaje.',
    kind: 'referencia',
    audience: 'tecnico',
    sections: [
      {
        id: 'allowlist',
        title: 'Allowlist Anti-SSRF (server/aiEndpointAllowlist.js)',
        audience: 'tecnico',
        markdown: [
          'Por directiva de seguridad **[B2]**, el servidor no permite llamadas de inferencia a direcciones arbitrarias proporcionadas por clientes.',
          'Cualquier nuevo host de API debe estar explícitamente registrado en `AI_PROVIDER_HOSTS`:',
          '```javascript\nexport const AI_PROVIDER_HOSTS = Object.freeze(new Set([\n  "api.groq.com", "generativelanguage.googleapis.com", "api.openai.com",\n  "api.mistral.ai", "integrate.api.nvidia.com", "openrouter.ai", ...\n]));\n```',
          'Peticiones hacia URLs con protocolos inseguros o hosts no reconocidos son interceptadas y rechazadas con error de seguridad.'
        ].join('\n\n')
      },
      {
        id: 'adaptacion',
        title: 'Adaptación del contrato de inferencia',
        audience: 'tecnico',
        markdown: [
          'La orquestación central se ubica en `server/index.js:callPersonalAi()` y `server/swarm/LlmExecutionEngine.js`.',
          'Al agregar un proveedor:',
          '- Formatear el payload respetando el endpoint `/chat/completions` para proveedores compatibles con OpenAI o el formato REST correspondiente de Google Gemini / Anthropic.',
          '- Aplicar el límite de tokens de respuesta (`maxTokens`, por defecto 2048 o 4096).',
          '- Controlar la temperatura del modelo (0.2 para cálculos estructurados y consistencia analítica, 0.7 para redacción creativa).'
        ].join('\n\n')
      }
    ]
  };

  const extensionModulos = {
    id: 'referencia-extension-modulos',
    title: 'Extensión de modelos, pilares y módulos',
    summary: 'Guía paso a paso para añadir o modificar módulos en la arquitectura de Open Business Plan.',
    kind: 'referencia',
    audience: 'tecnico',
    sections: [
      {
        id: 'frameworks',
        title: '1. Registro en src/config/frameworks.js',
        audience: 'tecnico',
        markdown: [
          'Cada modelo de negocio se declara en el objeto `FRAMEWORKS`.',
          'Para agregar un módulo a un pilar existente:',
          '```javascript\n{\n  key: "nuevo_modulo",\n  title: "Nuevo Módulo de Análisis",\n  description: "Propósito del módulo...",\n  fields: ["campo_uno", "campo_dos"]\n}\n```',
          'Si se crea un nuevo modelo completo, se debe registrar también su slug en `src/config/urlRouting.js` (`FRAMEWORK_SLUG_MAP` y `REVERSE_FRAMEWORK_SLUG_MAP`).'
        ].join('\n\n')
      },
      {
        id: 'fieldguides',
        title: '2. Asignación de prompts en src/lib/field_guides.js',
        audience: 'tecnico',
        markdown: [
          'Todo campo declarado en `fields` debe contar con su contrato y guía en `FIELD_GUIDES_MAP`:',
          '- `prompt`: Instrucción fundamental que recibe el motor de IA al pulsar "Generar".',
          '- `ejemplo`: Texto de muestra que guía al usuario sobre la calidad esperada.',
          '- `benchmark`: Métrica o estándar de aceptación que valida la respuesta.',
          '- `cita`: Fuente bibliográfica o metodológica que fundamenta el criterio.'
        ].join('\n\n')
      },
      {
        id: 'cajas',
        title: '3. Asignación de cajas y sincronización',
        audience: 'tecnico',
        markdown: [
          'Para asociar herramientas visuales interactivas (cajas financieras, matrices FODA, organigramas):',
          '- Registrar la caja en `src/config/boxRegistry.js` si es un componente nuevo.',
          '- Mapear la caja al módulo en `src/config/moduleBoxMap.js` usando la clave `projectType:moduleKey`.',
          '- Ejecutar `npm run wiki:build` para que el catálogo de la Wiki regenere automáticamente la ficha del módulo, actualice el total de campos y verifique la integridad con `npm test`.'
        ].join('\n\n')
      }
    ]
  };

  return [apis, altaApi, proveedorLlm, extensionModulos];
}

/** Construye páginas independientes para los artículos de negocio preexistentes. */
export function buildArchivedPages() {
  return WIKI_ARTICLES.map((art) => {
    const id = pageIdOf('archivado', art.id);
    const categoryObj = WIKI_CATEGORIES.find((c) => c.key === art.category);
    const catName = categoryObj ? categoryObj.name : art.category;
    const contenidoLimpio = latexToUnicode(art.content);

    return {
      id,
      title: art.title,
      summary: oneLine(art.excerpt || art.title, 180),
      kind: 'archivado',
      audience: 'cliente',
      category: art.category,
      readTime: art.readTime || '5 min',
      author: art.author || 'Fondo Thoth AC',
      sections: [
        {
          id: 'resumen',
          title: 'Ficha y Metadatos',
          audience: 'cliente',
          markdown: [
            `**Categoría de origen:** ${catName}`,
            `**Autor:** ${art.author || 'Fondo Thoth AC'} · **Tiempo estimado de lectura:** ${art.readTime || '5 min'}`,
            art.tags && art.tags.length ? `**Etiquetas temáticas:** ${art.tags.map((t) => `\`${t}\``).join(', ')}` : '',
            `**Resumen:** ${art.excerpt || 'Artículo canónico de metodología y fundamentos empresariales.'}`
          ].filter(Boolean).join('\n\n')
        },
        {
          id: 'contenido',
          title: 'Contenido Completo',
          audience: 'cliente',
          markdown: contenidoLimpio
        },
        {
          id: 'fuentes',
          title: 'Fuentes y Documentación Relacionada',
          audience: 'cliente',
          markdown: [
            'Este artículo forma parte del acervo canónico de Fondo Thoth AC.',
            'Documentos metodológicos complementarios en el repositorio:',
            '- `docs/zopp.md` (ZOPP y Marco Lógico)',
            '- `docs/hoshin_kanri.md` (Dirección Hoshin)',
            '- `docs/amoeba_management.md` (Gestión Amoeba Kyocera)',
            '- `docs/MATRIZ_MODULOS.md` (Matriz integral de módulos)'
          ].join('\n\n')
        }
      ]
    };
  });
}

/** Árbol navegable: grupos de un solo nivel, hojas con pageId. */
function buildTree(modelResults, referencePages, archivedPages = []) {
  const modelsGroup = {
    id: 'modelos',
    title: `Modelos de plan (${Object.keys(FRAMEWORKS).length})`,
    children: Object.keys(FRAMEWORKS).map((projectType, i) => {
      const { page, pages, fwSlug } = modelResults[i];
      const pillars = FRAMEWORKS[projectType].pillars || [];
      return {
        id: `modelo.${projectType}`,
        title: page.title,
        pageId: page.id,
        children: pillars.map((pillar) => ({
          id: `pilar.${projectType}.${pillar.key}`,
          title: pillar.title,
          children: (pillar.modules || []).map((mod) => {
            const leaf = pages.find((p) => p.model === projectType && p.moduleKey === mod.key);
            return { id: `modulo.${projectType}.${mod.key}`, title: mod.title, pageId: leaf.id, openUrl: `/${fwSlug}/${mod.key}` };
          })
        }))
      };
    })
  };

  const referenceGroup = {
    id: 'referencia',
    title: `Referencia técnica (${referencePages.length})`,
    children: referencePages.map((p) => ({ id: p.id, title: p.title, pageId: p.id }))
  };

  const archivedGroup = {
    id: 'archivados',
    title: `Archivados (por rescatar) (${archivedPages.length})`,
    children: archivedPages.map((p) => ({ id: p.id, title: p.title, pageId: p.id }))
  };

  return [modelsGroup, referenceGroup, archivedGroup];
}

/** Todo el artefacto: índice + páginas. Puro y determinista (sin timestamps). */
export function build() {
  const modelResults = Object.keys(FRAMEWORKS).map((projectType) => modelPage(projectType));
  const routes = extractRoutes();
  const envVars = extractEnvVars();
  const providerHosts = extractProviderHosts();
  const referencePages = buildReferencePages(routes, envVars, providerHosts);
  const archivedPages = buildArchivedPages();

  const modulePages = modelResults.flatMap((r) => r.pages);
  const pages = [...modelResults.map((r) => r.page), ...modulePages, ...referencePages, ...archivedPages];

  const totals = {
    models: Object.keys(FRAMEWORKS).length,
    pillars: Object.values(FRAMEWORKS).reduce((a, fw) => a + (fw.pillars?.length || 0), 0),
    modules: modulePages.length,
    fields: modulePages.reduce((a, p) => a + p.fields.length, 0),
    guideTypes: Object.keys(FIELD_GUIDES_MAP).length,
    boxes: Object.values(BOX_REGISTRY).reduce((a, list) => a + list.length, 0),
    routes: routes.length,
    envServerVars: envVars.server.length,
    envClientVars: envVars.client.length,
    providerHosts: providerHosts.length,
    referencePages: referencePages.length,
    archivedPages: archivedPages.length,
    pages: pages.length,
    slugs: Object.keys(REVERSE_FRAMEWORK_SLUG_MAP).length
  };

  const catalog = {
    schemaVersion: SCHEMA_VERSION,
    generator: GENERATOR,
    totals,
    tree: buildTree(modelResults, referencePages, archivedPages),
    pages: pages.reduce((acc, p) => {
      acc[p.id] = {
        file: `pages/${p.id}.json`,
        title: p.title,
        summary: p.summary,
        kind: p.kind,
        audience: p.audience,
        ...(p.openUrl ? { openUrl: p.openUrl } : {})
      };
      return acc;
    }, {})
  };

  return { catalog, pages };
}

export const buildCatalog = () => build().catalog;

function writeAll() {
  const { catalog, pages } = build();
  const dir = path.join(ROOT, OUT_DIR);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, 'pages'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.json'), `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  for (const p of pages) {
    fs.writeFileSync(path.join(dir, `pages/${p.id}.json`), `${JSON.stringify(p, null, 2)}\n`, 'utf8');
  }
  const missingDocs = Object.entries(METHODOLOGY_DOCS).filter(([, rel]) => !readSource(rel));
  console.log(`✅ Wiki catalog: ${catalog.totals.models} modelos · ${catalog.totals.pillars} pilares · ${catalog.totals.modules} módulos · ${catalog.totals.fields} campos · ${catalog.totals.pages} páginas`);
  console.log(`   ${catalog.totals.routes} rutas /api detectadas · ${catalog.totals.envServerVars} env server · ${catalog.totals.providerHosts} hosts de IA`);
  if (missingDocs.length) console.warn(`   ⚠️  docs de metodología sin contenido: ${missingDocs.map(([k]) => k).join(', ')}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) writeAll();
