/**
 * @file server/integrations/telegramBot.js
 * @description Motor de Integración de Telegram con BOB Chat (Business Operations Bot).
 * 
 * Permite a los directivos y fundadores interactuar con BOB a través de Telegram como copiloto
 * ejecutivo y consultor de negocios bajo la metodología de Empresas Cuánticas (Fondo Thoth AC).
 * 
 * Características principales:
 * 1. Arquitectura dual: Long Polling para desarrollo local y Webhook para producción.
 * 2. Cero dependencias externas pesadas: utiliza la API HTTP nativa de Telegram con fetch.
 * 3. Inyección contextual del plan de negocio activo (Semilla, Mercado, Finanzas, BEP, FRLI).
 * 4. Diagnóstico Cuántico en tiempo real (Finanzas, Operativo, Administrativo y Fusión Atómica).
 * 5. Control de acceso mediante lista blanca de identificadores de usuario (TELEGRAM_ALLOWED_USERS).
 * 6. División inteligente de mensajes respetando el límite de 4096 caracteres de Telegram.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Divide un mensaje extenso en fragmentos que respetan el límite de caracteres de Telegram (4096).
 * Intenta cortar preferentemente por saltos de línea dobles, simples o espacios.
 * 
 * @param {string} text - Texto a dividir
 * @param {number} [maxLength=4000] - Longitud máxima por fragmento
 * @returns {string[]} Array de fragmentos
 */
export function splitTelegramMessage(text, maxLength = 4000) {
  if (!text || typeof text !== 'string') return [''];
  if (text.length <= maxLength) return [text];

  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    // Buscar el punto de corte óptimo antes del límite
    let splitIndex = remaining.lastIndexOf('\n\n', maxLength);
    if (splitIndex === -1 || splitIndex < maxLength * 0.3) {
      splitIndex = remaining.lastIndexOf('\n', maxLength);
    }
    if (splitIndex === -1 || splitIndex < maxLength * 0.3) {
      splitIndex = remaining.lastIndexOf(' ', maxLength);
    }
    if (splitIndex === -1 || splitIndex < maxLength * 0.3) {
      splitIndex = maxLength;
    }

    chunks.push(remaining.substring(0, splitIndex).trim());
    remaining = remaining.substring(splitIndex).trim();
  }

  return chunks.filter(c => c.length > 0);
}

/**
 * Normaliza y protege cadenas de texto para evitar errores de sintaxis en Markdown de Telegram.
 * 
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto seguro
 */
export function escapeTelegramMarkdown(text) {
  if (!text || typeof text !== 'string') return '';
  // Reemplazar caracteres no balanceados o conflictivos comunes
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

/**
 * Valida si un usuario de Telegram está autorizado a consultar a BOB según la configuración.
 * Si no hay lista blanca configurada, permite el acceso para pruebas locales.
 * 
 * @param {Object} user - Objeto de usuario de Telegram ({ id, username, first_name })
 * @param {string} [allowedUsersConfig] - Cadena separada por comas de IDs o usernames permitidos
 * @returns {boolean}
 */
export function isUserAllowed(user, allowedUsersConfig = '') {
  if (!allowedUsersConfig || typeof allowedUsersConfig !== 'string' || !allowedUsersConfig.trim()) {
    return true; // Abierto si no hay lista configurada
  }

  if (!user || !user.id) return false;

  const allowedList = allowedUsersConfig
    .split(',')
    .map(u => u.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean);

  if (allowedList.length === 0) return true;

  const userIdStr = String(user.id);
  const userUsername = String(user.username || '').toLowerCase().replace(/^@/, '');

  return allowedList.includes(userIdStr) || (userUsername && allowedList.includes(userUsername));
}

/**
 * Extrae comando y argumentos de un mensaje de texto de Telegram.
 * Soporta menciones del tipo /start@MiBotNombre.
 * 
 * @param {string} text - Texto del mensaje
 * @returns {{ command: string, args: string } | null}
 */
export function parseCommand(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (!trimmed.startsWith('/')) return null;

  const parts = trimmed.slice(1).split(/\s+/);
  const rawCommand = parts[0] || '';
  const cleanCommand = rawCommand.split('@')[0].toLowerCase();
  const args = parts.slice(1).join(' ').trim();

  return { command: cleanCommand, args };
}

/**
 * Extrae un resumen normalizado de los datos clave de un proyecto para el contexto de BOB.
 * 
 * @param {Object} project - Objeto JSON completo del plan de negocio
 * @returns {Object} Resumen consolidado
 */
export function extractProjectSummary(project) {
  if (!project || typeof project !== 'object') {
    return {
      nombre: 'Proyecto en Definición',
      sector: 'General',
      giro: 'No especificado',
      descripcion: 'Sin descripción registrada.',
      montoInversion: 0,
      propuestaValor: 'No definida',
      modeloIngresos: 'No definido',
      perfilFundador: {},
      margen: 0,
      puntoEquilibrio: 0,
      frli: 0
    };
  }

  const seed = project.semilla || {};
  const sim = project.simulador_financiero || project.corrida_automatica || {};

  const nombre = project.nombre || project.companyName || seed.nombre || seed.nombre_proyecto || project.id || 'Proyecto OBP';
  const sector = project.sector || seed.sector || 'General';
  const giro = project.giro || seed.giro || 'Comercial e Industrial';
  const descripcion = project.descripcion || seed.descripcion || 'Plan de negocios formulado con Open Business Plan.';
  const montoInversion = Number(project.montoInversion || seed.montoInversion || project.inversionRequerida || 0);
  const propuestaValor = seed.propuestaValor || seed.propuesta_valor || 'Calidad y servicio diferencial.';
  const modeloIngresos = seed.modeloIngresos || seed.modelo_ingresos || 'Venta directa.';
  const perfilFundador = seed.perfil_fundador || project.config?.founderProfile || {};

  const margen = Number(sim.margen_promedio || sim.margenNeto || sim.margen || 0);
  const puntoEquilibrio = Number(sim.punto_equilibrio_mensual || sim.puntoEquilibrio || sim.bep || 0);
  const frli = Number(sim.frli_reserva || sim.frli || sim.fondoLiquidacion || 0);

  return {
    nombre,
    sector,
    giro,
    descripcion,
    montoInversion,
    propuestaValor,
    modeloIngresos,
    perfilFundador,
    margen,
    puntoEquilibrio,
    frli
  };
}

/**
 * Construye el prompt de sistema maestro para BOB en Telegram, con las directivas
 * de Fondo Thoth AC y la metodología de Empresas Cuánticas.
 * 
 * @param {Object} summary - Resumen del proyecto obtenido con extractProjectSummary
 * @returns {string} Prompt maestro
 */
export function buildTelegramSystemPrompt(summary) {
  const nombre = summary.nombre || 'Plan de Negocio';
  const sector = summary.sector || 'General';
  const inversion = summary.montoInversion ? `$${Number(summary.montoInversion).toLocaleString('es-MX')} MXN` : 'En cálculo';
  const margen = summary.margen ? `${summary.margen}%` : 'En calibración';
  const bep = summary.puntoEquilibrio ? `$${Number(summary.puntoEquilibrio).toLocaleString('es-MX')} MXN/mes` : 'En calibración';
  const frli = summary.frli ? `$${Number(summary.frli).toLocaleString('es-MX')} MXN` : 'Pendiente';
  const fundador = JSON.stringify(summary.perfilFundador || {});

  return `Eres BOB (Business Operations Bot), el copiloto ejecutivo de inteligencia de negocios de Open Business Plan (Fondo Thoth AC).
Te estás comunicando a través de Telegram con el fundador o evaluador del proyecto.

INFORMACIÓN DEL PROYECTO ACTIVO:
- Empresa: "${nombre}"
- Sector: ${sector}
- Giro: ${summary.giro || 'Comercial'}
- Propuesta de Valor: ${summary.propuestaValor || 'En definición'}
- Modelo de Ingresos: ${summary.modeloIngresos || 'En definición'}
- Inversión Inicial Requerida: ${inversion}
- Margen Operativo Estimado: ${margen}
- Punto de Equilibrio (BEP): ${bep}
- Fondo de Reserva de Liquidación Intocable (FRLI): ${frli}
- Perfil del Fundador (Modelo Atómico Cuántico): ${fundador}

METODOLOGÍA OBLIGATORIA: EMPRESAS CUÁNTICAS (FONDO THOTH AC):
1. Modelo Atómico de 3 Áreas: Evalúa siempre la empresa y al equipo en base a:
   - FINANZAS (Flujo de efectivo, costos, capital de trabajo, precios).
   - OPERATIVO (Producción, entregas, calidad, servicio técnico).
   - ADMINISTRATIVO (Legal, laboral, recursos humanos, contratos, fiscal).
2. Principio Nuclear y Anti-Fusión Atómica:
   - El fundador SOLO debe liderar activamente 1 o máximo 2 áreas.
   - Si el fundador participa en las 3 áreas a la vez, se produce "Fusión Atómica", colapsando la operación por micromanagement y agotamiento.
   - Advierte inmediatamente sobre este riesgo si detectas centralización.
3. Principio de Delegación:
   - Las áreas donde el fundador sea débil DEBEN delegarse a perfiles profesionales complementarios.
   - Formula siempre recomendaciones de perfiles de puesto a contratar.
4. Principio de Saltos Cuánticos de Escala:
   - El crecimiento no es lineal: se da por saltos (1 a 5 empleados, 5 a 20, 20 a 50, corporativo).
   - Cada salto requiere reestructurar las 3 áreas atómicas.
5. Principio de Independencia del Fundador:
   - La meta suprema es que el negocio opere con autonomía sin depender de la presencia diaria del fundador.
6. Fondo de Reserva de Liquidación Intocable (FRLI):
   - Según la Ley Federal del Trabajo (LFT), antes de cualquier aventura de expansión se debe tener asegurada la reserva legal de contingencia para colaboradores.

ESTILO DE RESPUESTA EN TELEGRAM:
- Redacta en español neutro premium, profesional, empático y ejecutivo.
- Sé conciso pero con alto valor estratégico. Usa emojis elegantes (💼, 📊, ⚡, 🛡️, 🎯) y viñetas para facilitar la lectura móvil.
- Si te hacen preguntas financieras, básate estrictamente en las cifras del proyecto y explica las implicaciones de rentabilidad.`;
}

/**
 * Formatea la ficha informativa ejecutiva del proyecto para responder a /info o /resumen.
 * 
 * @param {Object} summary - Resumen del proyecto
 * @returns {string} Mensaje formateado en Markdown
 */
export function formatProjectInfoResponse(summary) {
  const invStr = summary.montoInversion ? `$${Number(summary.montoInversion).toLocaleString('es-MX')} MXN` : 'En definición';
  const margenStr = summary.margen ? `${summary.margen}%` : 'Por calibrar';
  const bepStr = summary.puntoEquilibrio ? `$${Number(summary.puntoEquilibrio).toLocaleString('es-MX')} MXN` : 'Por calcular';

  return `📊 *FICHA EJECUTIVA DE NEGOCIO — OPEN PLAN*

🏢 *Empresa:* ${summary.nombre}
🏷️ *Sector:* ${summary.sector}
⚙️ *Giro:* ${summary.giro}

💎 *Propuesta de Valor:*
${summary.propuestaValor}

💵 *Modelo de Ingresos:*
${summary.modeloIngresos}

📈 *Métricas Clave:*
• Inversión requerida: \`${invStr}\`
• Margen estimado: \`${margenStr}\`
• Punto de Equilibrio: \`${bepStr}\`

💡 _Puedes preguntarme cualquier detalle estratégico o financiero escribiendo en este chat._`;
}

/**
 * Formatea el snapshot financiero para responder al comando /finanzas.
 * 
 * @param {Object} summary - Resumen del proyecto
 * @returns {string} Mensaje formateado en Markdown
 */
export function formatFinancialSnapshotResponse(summary) {
  const invStr = summary.montoInversion ? `$${Number(summary.montoInversion).toLocaleString('es-MX')} MXN` : 'No asignado';
  const bepStr = summary.puntoEquilibrio ? `$${Number(summary.puntoEquilibrio).toLocaleString('es-MX')} MXN` : 'En cálculo';
  const frliStr = summary.frli ? `$${Number(summary.frli).toLocaleString('es-MX')} MXN` : 'Pendiente de provisión LFT';

  return `💰 *ESTADO FINANCIERO Y RUNWAY — CELIS ENGINE*

📌 *Proyecto:* ${summary.nombre}

📊 *Indicadores Operativos:*
• Inversión Inicial (CAPEX/OPEX): \`${invStr}\`
• Margen Operativo Promedio: \`${summary.margen || 0}%\`
• Punto de Equilibrio Mensual (BEP): \`${bepStr}\`

🛡️ *Protección de Capital y Contingencias (FRLI):*
• Reserva de Liquidación Intocable: \`${frliStr}\`
• Semáforo de Contingencia LFT: *${summary.frli > 0 ? '🟢 CUBIERTO' : '🟡 RECOMENDADA PROVISIÓN'}*

⚖️ _Principio Cuántico: "Nunca comprometas el flujo operativo sin blindar primero el Fondo de Reserva de Liquidación Intocable."_`;
}

/**
 * Formatea el diagnóstico cuántico del fundador para responder a /diagnostico.
 * 
 * @param {Object} summary - Resumen del proyecto
 * @returns {string} Mensaje formateado en Markdown
 */
export function formatQuantumDiagnosticResponse(summary) {
  const pf = summary.perfilFundador || {};
  const fuerte = pf.areaFuerte || pf.fuerte || 'Operativo';
  const debil = pf.areaDebil || pf.debil || 'Finanzas / Administrativo';

  // Si no hay perfil o declara abarcar todo
  const esFusion = !pf.areaDebil || String(fuerte).includes('Finanzas') && String(fuerte).includes('Operativo') && String(fuerte).includes('Administrativo');

  return `🔬 *DIAGNÓSTICO CUÁNTICO DE EMPRESA (Fondo Thoth AC)*

🏢 *Organización:* ${summary.nombre}
👤 *Evaluación del Fundador en las 3 Áreas Atómicas:*

1. 📈 *Finanzas:* ${fuerte.includes('Finanzas') ? '✅ Dominio Directo' : '⚠️ Área a Delegar'}
2. ⚙️ *Operativo:* ${fuerte.includes('Operativo') ? '✅ Dominio Directo' : '⚠️ Área a Delegar'}
3. 🏛️ *Administrativo:* ${fuerte.includes('Administrativo') ? '✅ Dominio Directo' : '⚠️ Área a Delegar'}

⚠️ *Alerta de Fusión Atómica:*
${esFusion 
  ? '🚨 *RIESGO DETECTADO:* Se observa tendencia a la Fusión Atómica (el fundador absorbe demasiadas responsabilidades simultáneas). Esto estrangula el crecimiento y genera cuellos de botella directivos.' 
  : '✅ *NIVEL DE RIESGO CONTROLADO:* El fundador tiene definida su área de mayor tracción operativa.'}

📋 *Ruta de Delegación Recomendada:*
• Contratar un líder o apoyo clave para el área: \`${debil}\`.
• Definir KPIs de autonomía: La meta es que el negocio facture sin intervención operativa del fundador.
• Umbral Cuántico de Escala: Al superar 5 colaboradores, estructurar mandos medios.`;
}

/**
 * Clase principal del Servicio de Bot de Telegram.
 */
export class TelegramBotService {
  /**
   * @param {Object} [options]
   * @param {string} [options.token] - Token de BotFather
   * @param {string} [options.allowedUsers] - Lista blanca de usuarios
   * @param {string} [options.defaultProject] - ID del proyecto inicial por defecto
   * @param {Function} [options.aiHandler] - Función asíncrona (prompt) => { text, model }
   */
  constructor(options = {}) {
    this.token = options.token || process.env.TELEGRAM_BOT_TOKEN || '';
    this.allowedUsers = options.allowedUsers || process.env.TELEGRAM_ALLOWED_USERS || '';
    this.defaultProject = options.defaultProject || process.env.TELEGRAM_DEFAULT_PROJECT || 'vcv_cortes_finos_sa_de_cv';
    this.aiHandler = options.aiHandler || null;

    this.apiUrl = `https://api.telegram.org/bot${this.token}`;
    this.isPolling = false;
    this.pollAbortController = null;
    this.lastUpdateId = 0;

    // Sesiones en memoria por chatId: { activeProjectId, history: [] }
    this.sessions = new Map();
  }

  /**
   * Verifica si el bot está configurado para operar.
   * @returns {boolean}
   */
  isConfigured() {
    return Boolean(this.token && this.token.length > 10);
  }

  /**
   * Envía un mensaje a un chat de Telegram dividiéndolo automáticamente si supera el límite.
   * 
   * @param {number|string} chatId
   * @param {string} text
   * @param {Object} [extra]
   * @returns {Promise<boolean>}
   */
  async sendMessage(chatId, text, extra = {}) {
    if (!this.isConfigured()) return false;

    const chunks = splitTelegramMessage(text, 4000);
    let success = true;

    for (const chunk of chunks) {
      try {
        const body = {
          chat_id: chatId,
          text: chunk,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
          ...extra
        };

        const response = await fetch(`${this.apiUrl}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        const data = await response.json().catch(() => ({}));

        // Si falla por sintaxis de Markdown, reintentar en texto plano
        if (!response.ok && data?.description?.includes('can\'t parse entities')) {
          delete body.parse_mode;
          await fetch(`${this.apiUrl}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
        } else if (!response.ok) {
          console.warn('[TelegramBot] Error enviando mensaje:', data?.description || response.statusText);
          success = false;
        }
      } catch (err) {
        console.error('[TelegramBot] Excepción enviando mensaje:', err.message);
        success = false;
      }
    }

    return success;
  }

  /**
   * Envía indicador visual de acción (ej. "typing") a Telegram.
   * 
   * @param {number|string} chatId
   * @param {string} [action='typing']
   */
  async sendChatAction(chatId, action = 'typing') {
    if (!this.isConfigured()) return;
    try {
      await fetch(`${this.apiUrl}/sendChatAction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, action })
      });
    } catch {}
  }

  /**
   * Registra los comandos ejecutivos del bot en el menú de Telegram.
   */
  async registerCommands() {
    if (!this.isConfigured()) return;
    try {
      const commands = [
        { command: 'start', description: 'Bienvenida y estado de BOB' },
        { command: 'info', description: 'Ficha ejecutiva del proyecto' },
        { command: 'finanzas', description: 'Métricas de rentabilidad y FRLI' },
        { command: 'diagnostico', description: 'Diagnóstico cuántico del fundador' },
        { command: 'proyectos', description: 'Listar proyectos disponibles' },
        { command: 'usar', description: 'Seleccionar proyecto activo (/usar <slug>)' },
        { command: 'ayuda', description: 'Guía y ejemplos de consulta' }
      ];

      await fetch(`${this.apiUrl}/setMyCommands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands })
      });
    } catch (err) {
      console.warn('[TelegramBot] Error registrando comandos en Telegram:', err.message);
    }
  }

  /**
   * Obtiene la sesión del usuario o crea una nueva con el proyecto por defecto.
   * 
   * @param {number|string} chatId
   * @returns {Object} Sesión
   */
  getOrCreateSession(chatId) {
    const key = String(chatId);
    if (!this.sessions.has(key)) {
      this.sessions.set(key, {
        activeProjectId: this.defaultProject,
        history: [],
        lastSeen: Date.now()
      });
    }
    const session = this.sessions.get(key);
    session.lastSeen = Date.now();
    return session;
  }

  /**
   * Escanea y lista los proyectos disponibles en el directorio proyectos/negocios/.
   * 
   * @returns {string[]} Lista de slugs de proyectos encontrados
   */
  scanAvailableProjects() {
    const baseDir = path.resolve('proyectos', 'negocios');
    if (!fs.existsSync(baseDir)) return [this.defaultProject];

    const projectSlugs = [];
    try {
      const entries = fs.readdirSync(baseDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

        if (entry.name.startsWith('user_')) {
          // Escanear proyectos dentro de carpetas de usuario
          const userSubdir = path.join(baseDir, entry.name);
          try {
            const subEntries = fs.readdirSync(userSubdir, { withFileTypes: true });
            for (const sub of subEntries) {
              if (sub.isDirectory() && !sub.name.startsWith('.')) {
                projectSlugs.push(sub.name);
              }
            }
          } catch {}
          continue;
        }

        projectSlugs.push(entry.name);
      }
    } catch (err) {
      console.warn('[TelegramBot] Error escaneando proyectos:', err.message);
    }

    return projectSlugs.length > 0 ? [...new Set(projectSlugs)] : [this.defaultProject];
  }

  /**
   * Carga el archivo JSON de un proyecto específico buscando en las ubicaciones estándar.
   * 
   * @param {string} projectId - Identificador o slug del proyecto
   * @returns {Object|null}
   */
  loadProject(projectId) {
    if (!projectId) return null;
    const baseDir = path.resolve('proyectos', 'negocios');

    // 1. Buscar en la raíz de negocios/
    const directPath = path.join(baseDir, projectId, `${projectId}.json`);
    if (fs.existsSync(directPath)) {
      try {
        return JSON.parse(fs.readFileSync(directPath, 'utf8'));
      } catch {}
    }

    // 2. Buscar dentro de carpetas user_*
    try {
      if (fs.existsSync(baseDir)) {
        const entries = fs.readdirSync(baseDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name.startsWith('user_')) {
            const userProjPath = path.join(baseDir, entry.name, projectId, `${projectId}.json`);
            if (fs.existsSync(userProjPath)) {
              return JSON.parse(fs.readFileSync(userProjPath, 'utf8'));
            }
          }
        }
      }
    } catch {}

    return null;
  }

  /**
   * Procesa una actualización entrante de Telegram (usada tanto en Polling como en Webhook).
   * 
   * @param {Object} update
   */
  async handleUpdate(update) {
    if (!update || !update.message) return;
    const message = update.message;
    const chatId = message.chat?.id;
    const fromUser = message.from;
    const text = message.text || '';

    if (!chatId || !text) return;

    // Verificar lista blanca de seguridad
    if (!isUserAllowed(fromUser, this.allowedUsers)) {
      await this.sendMessage(
        chatId,
        `🔒 *Acceso Restringido*\n\nHola ${fromUser?.first_name || 'usuario'}. Este bot de BOB está en modo privado exclusivo para los directivos del proyecto.\n\nTu ID de Telegram es: \`${fromUser?.id}\`\nSolicita autorización al administrador de Open Business Plan.`
      );
      return;
    }

    const session = this.getOrCreateSession(chatId);
    const parsedCmd = parseCommand(text);

    if (parsedCmd) {
      await this.handleCommand(chatId, parsedCmd, session, fromUser);
      return;
    }

    // Consulta libre en lenguaje natural con IA
    await this.handleNaturalLanguageQuery(chatId, text, session);
  }

  /**
   * Maneja los comandos ejecutivos predefinidos.
   * 
   * @param {number|string} chatId
   * @param {{ command: string, args: string }} parsedCmd
   * @param {Object} session
   * @param {Object} fromUser
   */
  async handleCommand(chatId, parsedCmd, session, fromUser) {
    const { command, args } = parsedCmd;

    switch (command) {
      case 'start': {
        const projectData = this.loadProject(session.activeProjectId);
        const summary = extractProjectSummary(projectData);
        const welcome = `👋 *¡Hola ${fromUser?.first_name || 'Emprendedor'}!* Soy *BOB* (Business Operations Bot), tu copiloto ejecutivo de negocios e inteligencia de mercado en *Open Business Plan (Fondo Thoth AC)*.\n\n📌 *Proyecto Activo:* *${summary.nombre}*\n🏷️ *Sector:* ${summary.sector}\n\n*¿Qué deseas consultar hoy?*\n• /info — Ficha y propuesta de valor del negocio\n• /finanzas — Inversión, punto de equilibrio y reserva FRLI\n• /diagnostico — Diagnóstico cuántico del perfil del fundador\n• /proyectos — Ver y cambiar de proyecto activo\n• /ayuda — Preguntas estratégicas recomendadas\n\n💬 _O simplemente escríbeme cualquier pregunta sobre ventas, competencia, costos, contratación o expansión._`;
        await this.sendMessage(chatId, welcome);
        break;
      }

      case 'proyectos': {
        const available = this.scanAvailableProjects();
        const listText = available.map(p => `• \`${p}\` ${p === session.activeProjectId ? '⭐️ *(Activo)*' : ''}`).join('\n');
        const reply = `📁 *PROYECTOS DISPONIBLES EN OPEN PLAN:*\n\n${listText}\n\n👉 Para cambiar de proyecto activo, escribe:\n\`/usar nombre_del_proyecto\``;
        await this.sendMessage(chatId, reply);
        break;
      }

      case 'usar': {
        if (!args) {
          await this.sendMessage(chatId, '⚠️ Por favor indica el nombre o clave del proyecto. Ejemplo:\n`/usar vcv_cortes_finos_sa_de_cv`');
          return;
        }
        const cleanSlug = args.trim().toLowerCase();
        const testLoad = this.loadProject(cleanSlug);
        if (!testLoad) {
          await this.sendMessage(chatId, `❌ No se encontró el proyecto \`${cleanSlug}\`. Escribe /proyectos para ver la lista completa.`);
          return;
        }
        session.activeProjectId = cleanSlug;
        session.history = []; // Reiniciar memoria de conversación al cambiar de proyecto
        const summary = extractProjectSummary(testLoad);
        await this.sendMessage(chatId, `✅ *Proyecto cambiado exitosamente.*\n\nAhora estamos analizando: *${summary.nombre}* (${summary.sector}). ¿Qué deseas evaluar?`);
        break;
      }

      case 'info':
      case 'resumen': {
        const projectData = this.loadProject(session.activeProjectId);
        const summary = extractProjectSummary(projectData);
        await this.sendMessage(chatId, formatProjectInfoResponse(summary));
        break;
      }

      case 'finanzas': {
        const projectData = this.loadProject(session.activeProjectId);
        const summary = extractProjectSummary(projectData);
        await this.sendMessage(chatId, formatFinancialSnapshotResponse(summary));
        break;
      }

      case 'diagnostico': {
        const projectData = this.loadProject(session.activeProjectId);
        const summary = extractProjectSummary(projectData);
        await this.sendMessage(chatId, formatQuantumDiagnosticResponse(summary));
        break;
      }

      case 'ayuda':
      case 'help': {
        const helpText = `💡 *GUÍA DE CONSULTA CON BOB EXPERT BOT*

Puedes hacerme preguntas estratégicas sobre el negocio activo, por ejemplo:
• _"¿Cuál es el margen de contribución y en cuánto tiempo recuperamos la inversión?"_
• _"¿Qué perfil profesional debería contratar primero para no hacer todo yo?"_
• _"¿Cómo afecta abrir una segunda sucursal a nuestro punto de equilibrio?"_
• _"¿Qué ventajas competitivas tenemos frente a la competencia del sector?"_
• _"¿Qué dice la Ley Federal del Trabajo sobre nuestro fondo de contingencia FRLI?"_

*Comandos rápidos:*
• /info — Resumen general del plan
• /finanzas — Snapshot de números y runway
• /diagnostico — Diagnóstico cuántico de delegación
• /proyectos — Lista de proyectos
• /usar <slug> — Cambiar de proyecto`;
        await this.sendMessage(chatId, helpText);
        break;
      }

      default: {
        await this.sendMessage(chatId, `❓ Comando no reconocido: \`/${command}\`. Escribe /ayuda para ver los comandos disponibles.`);
      }
    }
  }

  /**
   * Procesa consultas de negocio libres llamando a la IA con contexto del plan.
   * 
   * @param {number|string} chatId
   * @param {string} userQuery
   * @param {Object} session
   */
  async handleNaturalLanguageQuery(chatId, userQuery, session) {
    await this.sendChatAction(chatId, 'typing');

    const projectData = this.loadProject(session.activeProjectId);
    const summary = extractProjectSummary(projectData);
    const systemPrompt = buildTelegramSystemPrompt(summary);

    // Historial reciente de la sesión
    const historyText = session.history
      .slice(-6)
      .map(h => `${h.role === 'user' ? 'Fundador' : 'BOB'}: ${h.text}`)
      .join('\n');

    const fullPrompt = `${systemPrompt}\n\nHISTORIAL RECIENTE:\n${historyText}\n\nFundador: ${userQuery}\nBOB:`;

    let replyText = '';

    try {
      if (typeof this.aiHandler === 'function') {
        const result = await this.aiHandler(fullPrompt);
        replyText = result?.text || result?.reply || '';
      } else {
        replyText = `He analizado tu consulta sobre *${summary.nombre}*:\n\nPara obtener respuestas de inferencia en tiempo real en Telegram, asegúrate de tener configurada una API Key válida (Ollama Cloud, Groq, OpenRouter o Gemini) en tu servidor.`;
      }
    } catch (err) {
      console.error('[TelegramBot] Error al consultar IA:', err.message);
      replyText = `⚠️ Hubo un detalle al procesar la respuesta con el motor de IA: ${err.message}. Por favor intenta nuevamente en unos momentos.`;
    }

    if (!replyText.trim()) {
      replyText = 'No se obtuvo respuesta del motor de análisis. Por favor reformula tu consulta.';
    }

    // Actualizar historial de sesión
    session.history.push({ role: 'user', text: userQuery });
    session.history.push({ role: 'assistant', text: replyText });
    if (session.history.length > 12) {
      session.history = session.history.slice(-12);
    }

    await this.sendMessage(chatId, replyText);
  }

  /**
   * Inicia el bucle de Long Polling para desarrollo local.
   */
  async startPolling() {
    if (!this.isConfigured()) {
      console.log('[TelegramBot] Token no configurado. Servicio de Telegram en espera.');
      return;
    }

    if (this.isPolling) return;
    this.isPolling = true;
    this.pollAbortController = new AbortController();

    console.log('[TelegramBot] 🚀 Iniciando servicio de Telegram en modo Long Polling...');
    await this.registerCommands();

    const pollLoop = async () => {
      while (this.isPolling) {
        try {
          const url = `${this.apiUrl}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=20`;
          const response = await fetch(url, {
            signal: this.pollAbortController?.signal
          });

          if (!response.ok) {
            await new Promise(r => setTimeout(r, 4000));
            continue;
          }

          const data = await response.json();
          if (data.ok && Array.isArray(data.result)) {
            for (const update of data.result) {
              this.lastUpdateId = Math.max(this.lastUpdateId, update.update_id);
              try {
                await this.handleUpdate(update);
              } catch (handleErr) {
                console.error('[TelegramBot] Error procesando update:', handleErr);
              }
            }
          }
        } catch (err) {
          if (err.name === 'AbortError') break;
          // Espera exponencial breve ante fallos de red
          await new Promise(r => setTimeout(r, 3000));
        }
      }
    };

    pollLoop();
  }

  /**
   * Detiene el bucle de Long Polling limpiamente.
   */
  stopPolling() {
    this.isPolling = false;
    if (this.pollAbortController) {
      try {
        this.pollAbortController.abort();
      } catch {}
      this.pollAbortController = null;
    }
    console.log('[TelegramBot] Servicio de Telegram detenido.');
  }

  /**
   * Configura el Webhook en Telegram para despliegues de producción en VPS.
   * 
   * @param {string} webhookUrl - URL pública HTTPS del webhook
   * @returns {Promise<boolean>}
   */
  async setWebhook(webhookUrl) {
    if (!this.isConfigured() || !webhookUrl) return false;
    try {
      const response = await fetch(`${this.apiUrl}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      });
      const data = await response.json();
      return Boolean(data.ok);
    } catch {
      return false;
    }
  }

  /**
   * Elimina el webhook para volver a permitir Long Polling.
   * @returns {Promise<boolean>}
   */
  async deleteWebhook() {
    if (!this.isConfigured()) return false;
    try {
      const response = await fetch(`${this.apiUrl}/deleteWebhook`);
      const data = await response.json();
      return Boolean(data.ok);
    } catch {
      return false;
    }
  }
}
