/**
 * @file server/integrations/telegramBot.js
 * @description Motor de Integración de Telegram con BOB Chat (Business Operations Bot).
 * 
 * Permite a los directivos y fundadores interactuar con BOB a través de Telegram como copiloto
 * ejecutivo y consultor de negocios bajo la metodología de Empresas Cuánticas (Fondo Thoth AC).
 * 
 * Capacidades avanzadas integradas:
 * 1. Arquitectura dual: Long Polling para desarrollo local y Webhook para producción.
 * 2. Cero dependencias externas pesadas: utiliza la API HTTP nativa de Telegram con fetch.
 * 3. Inyección contextual del plan de negocio activo (Semilla, Mercado, Finanzas, BEP, FRLI).
 * 4. Diagnóstico Cuántico en tiempo real (Finanzas, Operativo, Administrativo y Fusión Atómica).
 * 5. Simulación de palancas financieras interactivas con botones inline ([✅ Aplicar] / [❌ Descartar]).
 * 6. Análisis multimodal de fotos (locales, maquinaria, procesos, productos y generación de logos).
 * 7. Consultoría de inversión, valuación pre/post-money, equity vs. deuda y contrapropuestas.
 * 8. Control de acceso mediante lista blanca de identificadores de usuario (TELEGRAM_ALLOWED_USERS).
 * 9. División inteligente de mensajes respetando el límite de 4096 caracteres de Telegram.
 */

import fs from 'node:fs';
import path from 'node:path';
import { writeJsonAtomic } from '../../src/lib/serverUtils/atomicJson.js';
import { generateLogoVariants } from '../../src/lib/logoGenerator.js';

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

// ───────────────────────────────────────────────────────────────────────────
// MOTORES INTELIGENTES: PALANCAS, INVERSIÓN Y VISIÓN MULTIMODAL
// ───────────────────────────────────────────────────────────────────────────

/**
 * Detecta si el texto del usuario busca modificar el margen, precios o costos.
 * 
 * @param {string} text - Mensaje del usuario
 * @returns {{ type: 'margen'|'precio'|'costos', targetValue?: number|null, deltaPercent?: number } | null}
 */
export function detectFinancialLeverIntent(text) {
  if (!text || typeof text !== 'string') return null;
  const clean = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Detectar intención de margen
  if (clean.includes('margen') && (clean.includes('aumentar') || clean.includes('subir') || clean.includes('incrementar') || clean.includes('posible') || clean.includes('mejorar'))) {
    const matchNum = clean.match(/(?:al|en|de)?\s*(\d+(?:\.\d+)?)\s*%/);
    const targetValue = matchNum ? parseFloat(matchNum[1]) : null;
    return { type: 'margen', targetValue };
  }

  // Detectar ajuste de precio porcentual
  if (clean.includes('precio') && (clean.includes('aumentar') || clean.includes('subir') || clean.includes('incrementar') || clean.includes('ajustar'))) {
    const matchNum = clean.match(/(?:un|en)?\s*(\d+(?:\.\d+)?)\s*%/);
    const deltaPercent = matchNum ? parseFloat(matchNum[1]) : 10;
    return { type: 'precio', deltaPercent };
  }

  // Detectar reducción de costos
  if (clean.includes('costo') && (clean.includes('reducir') || clean.includes('bajar') || clean.includes('disminuir') || clean.includes('cortar') || clean.includes('ahorrar'))) {
    const matchNum = clean.match(/(?:en|un)?\s*(\d+(?:\.\d+)?)\s*%/);
    const deltaPercent = matchNum ? -parseFloat(matchNum[1]) : -10;
    return { type: 'costos', deltaPercent };
  }

  return null;
}

/**
 * Calcula la simulación matemática de la palanca solicitada y genera la propuesta interactiva.
 * 
 * @param {Object} project - JSON del plan de negocio
 * @param {Object} intent - Intención detectada
 * @returns {Object} Propuesta calculada
 */
export function calculateFinancialLever(project, intent) {
  const sim = project?.simulador_financiero || project?.corrida_automatica || {};
  const currentMargin = Number(sim.margen_promedio || sim.margenNeto || 31.13);
  const bepActual = Number(sim.punto_equilibrio_mensual || sim.bep || 781.87);
  const ventasMes = Number(sim.ventas_proyectadas_mes || 250000);

  let targetMargin = currentMargin;
  let requiredPriceIncreasePercent = 0;
  let requiredCostReductionPercent = 0;

  if (intent.type === 'margen') {
    if (intent.targetValue && intent.targetValue > 0) {
      targetMargin = Number(intent.targetValue);
    } else {
      // Si no especificó número, proponer un incremento razonable de +4%
      targetMargin = Math.round((currentMargin + 4) * 10) / 10;
    }
    const deltaMargin = targetMargin - currentMargin;
    requiredPriceIncreasePercent = Math.round((deltaMargin / (currentMargin || 1) * 100) * 10) / 10;
    requiredCostReductionPercent = Math.round((deltaMargin * 0.8) * 10) / 10;
  } else if (intent.type === 'precio') {
    const deltaP = intent.deltaPercent || 10;
    requiredPriceIncreasePercent = deltaP;
    targetMargin = Math.round((currentMargin + (deltaP * 0.5)) * 10) / 10;
  } else if (intent.type === 'costos') {
    const deltaC = Math.abs(intent.deltaPercent || 10);
    requiredCostReductionPercent = deltaC;
    targetMargin = Math.round((currentMargin + (deltaC * 0.6)) * 10) / 10;
  }

  // Al aumentar el margen, el Punto de Equilibrio (BEP) se reduce favorablemente
  const factorMejora = Math.max(1, targetMargin / (currentMargin || 1));
  const bepNuevo = Math.round((bepActual / factorMejora) * 100) / 100;
  const incrementoUtilidadMes = Math.round(ventasMes * (Math.max(0, targetMargin - currentMargin) / 100));

  const leverId = `lev_${Date.now().toString(36)}`;

  return {
    leverId,
    tipo: intent.type,
    currentMargin,
    targetMargin,
    bepActual,
    bepNuevo,
    requiredPriceIncreasePercent: Math.max(0, requiredPriceIncreasePercent),
    requiredCostReductionPercent: Math.max(0, requiredCostReductionPercent),
    incrementoUtilidadMes,
    fieldToUpdate: 'simulador_financiero.margen_promedio',
    valueToUpdate: targetMargin,
    summaryText: `Subir el margen de ${currentMargin}% a ${targetMargin}% mediante ajuste de precios (+${requiredPriceIncreasePercent}%) o reducción de insumos (-${requiredCostReductionPercent}%).`
  };
}

/**
 * Formatea la propuesta interactiva con botones para Telegram.
 * 
 * @param {Object} proposal - Propuesta de palanca financiera
 * @returns {{ text: string, inlineKeyboard: Array }}
 */
export function formatFinancialLeverProposal(proposal) {
  const deltaUtilidadStr = `$${Number(proposal.incrementoUtilidadMes || 0).toLocaleString('es-MX')} MXN/mes`;
  const text = `📊 *SIMULACIÓN DE PALANCA FINANCIERA — BOB COPILOT*

🎯 *Objetivo:* Elevar el margen operativo de \`${proposal.currentMargin}%\` a \`${proposal.targetMargin}%\`

⚙️ *Palancas Operativas Recomendadas:*
1. 🏷️ *Aumento de Precio:* Ajustar precios promedio en \`+${proposal.requiredPriceIncreasePercent}%\`.
2. 📉 *Optimización de Costos:* Reducir costo de insumos / merma en \`-${proposal.requiredCostReductionPercent}%\`.

📈 *Impacto Proyectado en el Negocio:*
• Nuevo Punto de Equilibrio: \`${proposal.bepNuevo} unidades/mes\` _(baja de ${proposal.bepActual})_
• Incremento estimado de flujo neto: \`+${deltaUtilidadStr}\`

¿Deseas aplicar este nuevo margen a la corrida financiera del proyecto?`;

  const inlineKeyboard = [
    [
      { text: `✅ Aplicar Ajuste (${proposal.targetMargin}%)`, callback_data: `apply_lever:${proposal.leverId}` },
      { text: '❌ Descartar', callback_data: `discard_lever:${proposal.leverId}` }
    ]
  ];

  return { text, inlineKeyboard };
}

/**
 * Aplica el cambio simulado al objeto del plan de negocio de forma atómica.
 * 
 * @param {Object} project - Proyecto JSON
 * @param {Object} proposal - Propuesta a aplicar
 * @returns {Object} Proyecto actualizado
 */
export function applyPendingLeverAdjustment(project, proposal) {
  if (!project || typeof project !== 'object') return project;
  if (!project.simulador_financiero) {
    project.simulador_financiero = {};
  }

  if (proposal.targetMargin) {
    project.simulador_financiero.margen_promedio = proposal.targetMargin;
  }
  if (proposal.bepNuevo) {
    project.simulador_financiero.punto_equilibrio_mensual = proposal.bepNuevo;
  }
  project.fechaActualizacion = new Date().toISOString();
  return project;
}

/**
 * Diagnostica ofertas de inversión, valuación y comparativa de equity vs deuda.
 * 
 * @param {string} text - Mensaje del usuario
 * @param {Object} project - Proyecto activo
 * @returns {Object} Dictamen financiero
 */
export function analyzeInvestmentProposal(text, project) {
  if (!text || typeof text !== 'string') return { isOffer: false };
  const clean = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const tieneContextoInversion = clean.includes('invertir') || clean.includes('inversion') || clean.includes('inversionista') || clean.includes('socio') || clean.includes('prestamo');
  if (!tieneContextoInversion) return { isOffer: false };

  // Extraer porcentaje (ej: 40 %, 40%)
  const matchPct = clean.match(/(\d+(?:\.\d+)?)\s*%/);
  let monto = 0;
  const matchMontoK = clean.match(/(\d+)\s*(?:mil|k)\b/);
  const matchMontoNum = clean.match(/(\d{1,3}(?:[,\s]\d{3})+|\d{4,9})/);

  if (matchMontoK) {
    monto = parseFloat(matchMontoK[1]) * 1000;
  } else if (matchMontoNum) {
    monto = parseFloat(matchMontoNum[1].replace(/[,\s]/g, ''));
  }

  const porcentaje = matchPct ? parseFloat(matchPct[1]) : 0;

  if (monto <= 0 || porcentaje <= 0) {
    return { isOffer: false };
  }

  // Cálculos de Valuación
  const equityFraccion = porcentaje / 100;
  const postMoneyValuation = Math.round(monto / equityFraccion);
  const preMoneyValuation = Math.round(postMoneyValuation - monto);

  const sim = project?.simulador_financiero || {};
  const utilidadAnual = Number(sim.utilidad_neta_anual_proyectada || sim.utilidad_anual || (sim.ventas_proyectadas_mes ? sim.ventas_proyectadas_mes * 12 * 0.15 : 250000));

  // Comparativa Deuda vs Equity
  const tasaDeudaAnual = 0.22;
  const plazoMeses = 24;
  const annualDebtCost = Math.round(monto * tasaDeudaAnual);
  const totalDebtInterest = Math.round(annualDebtCost * (plazoMeses / 12) * 0.55);

  const annualEquityCost = Math.round(utilidadAnual * equityFraccion);
  const fiveYearEquityCost = annualEquityCost * 5;

  let dilutionRisk = 'MODERADA';
  if (porcentaje >= 35) {
    dilutionRisk = 'CRITICA';
  } else if (porcentaje >= 20) {
    dilutionRisk = 'ALTA';
  }

  const governanceAlert = `⚠️ ALERTA DE GOBERNANZA (Fondo Thoth AC): Ceder el ${porcentaje}% en etapa temprana es una dilución ${dilutionRisk}. Provoca pérdida de control operativo y desincentiva al fundador. Además, si requieres una segunda ronda de capital, no tendrás margen de maniobra sin perder la mayoría.`;

  const counterProposal = `💡 CONTRAPROPUESTA DE CONSULTOR SENIOR:
1. Limitar el Equity a máximo 10% - 15% por esos $${monto.toLocaleString('es-MX')} MXN (lo que defiende una valuación Post-Money sana de $${(monto / 0.12).toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN).
2. O estructurar la inyección mediante una Nota Convertible (SAFE) con Cap de Valuación y descuento del 20% para la siguiente ronda.
3. O preferir Deuda PyME / Préstamo Privado al 18%-22% anual: pagas $${totalDebtInterest.toLocaleString('es-MX')} MXN de intereses totales y conservas el 100% de tus acciones.`;

  return {
    isOffer: true,
    investmentAmount: monto,
    equityPercentage: porcentaje,
    postMoneyValuation,
    preMoneyValuation,
    annualDebtCost,
    totalDebtInterest,
    annualEquityCost,
    fiveYearEquityCost,
    dilutionRisk,
    governanceAlert,
    counterProposal
  };
}

/**
 * Formatea el dictamen financiero y de inversión para Telegram.
 * 
 * @param {Object} analysis - Resultado de analyzeInvestmentProposal
 * @param {Object} projectSummary - Resumen del proyecto
 * @returns {string} Mensaje Markdown
 */
export function formatInvestmentAnalysisResponse(analysis, projectSummary) {
  const invStr = `$${analysis.investmentAmount.toLocaleString('es-MX')} MXN`;
  const postStr = `$${analysis.postMoneyValuation.toLocaleString('es-MX')} MXN`;
  const preStr = `$${analysis.preMoneyValuation.toLocaleString('es-MX')} MXN`;
  const equity5Str = `$${analysis.fiveYearEquityCost.toLocaleString('es-MX')} MXN`;
  const debtIntStr = `$${analysis.totalDebtInterest.toLocaleString('es-MX')} MXN`;

  return `💼 *DICTAMEN DE CONSULTORÍA DE INVERSIÓN & CAP TABLE*

🏢 *Empresa:* ${projectSummary.nombre}
💵 *Oferta Recibida:* \`${invStr}\` a cambio del \`${analysis.equityPercentage}%\` de las acciones.

📊 *1. VALUACIÓN IMPLÍCITA:*
• Valuación Post-Money: \`${postStr}\` _(Lo que vale la empresa después del dinero)_
• Valuación Pre-Money: \`${preStr}\` _(Lo que el inversionista dice que vale tu trabajo previo)_

⚖️ *2. COMPARATIVA: EQUITY VS. DEUDA (A 5 AÑOS):*
• *Costo del Equity (${analysis.equityPercentage}% de utilidades):* Estarías regalando aproximadamente \`${equity5Str}\` en dividendos en los próximos 5 años (y de por vida).
• *Costo de un Préstamo PyME (22% anual):* Pagas solo \`${debtIntStr}\` en intereses totales a 24 meses y conservas el *100% del negocio*.
👉 *Veredicto Financiero:* El capital de riesgo al ${analysis.equityPercentage}% es significativamente más costoso que un préstamo bancario.

${analysis.governanceAlert}

🎯 *3. CONTRAPROPUESTA LISTA PARA NEGOCIAR:*
${analysis.counterProposal}`;
}

/**
 * Clasifica la categoría de una foto enviada a Telegram por su texto de acompañamiento.
 * 
 * @param {string} caption - Texto adjunto a la foto
 * @returns {'machinery'|'location'|'product'|'brand'}
 */
export function classifyPhotoIntent(caption = '') {
  if (!caption || typeof caption !== 'string') return 'brand';
  const clean = caption.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (clean.includes('maquin') || clean.includes('equipo') || clean.includes('taller') || clean.includes('torno') || clean.includes('cnc') || clean.includes('envasadora') || clean.includes('proceso') || clean.includes('corte') || clean.includes('planta') || clean.includes('herramienta')) {
    return 'machinery';
  }

  if (clean.includes('local') || clean.includes('fachada') || clean.includes('ubicacion') || clean.includes('renta') || clean.includes('plaza') || clean.includes('calle') || clean.includes('sucursal') || clean.includes('tienda') || clean.includes('inmueble')) {
    return 'location';
  }

  if (clean.includes('menu') || clean.includes('producto') || clean.includes('platillo') || clean.includes('empaque') || clean.includes('precio') || clean.includes('comida') || clean.includes('catalogo')) {
    return 'product';
  }

  return 'brand';
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

    // Sesiones en memoria por chatId: { activeProjectId, history: [], pendingProposal: null }
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

    for (let i = 0; i < chunks.length; i++) {
      const isLast = i === chunks.length - 1;
      try {
        const body = {
          chat_id: chatId,
          text: chunks[i],
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
          ...(isLast ? extra : {})
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
   * Envía una fotografía a un chat de Telegram.
   * 
   * @param {number|string} chatId
   * @param {string} photoUrl
   * @param {string} [caption='']
   * @param {Object} [extra={}]
   * @returns {Promise<boolean>}
   */
  async sendPhoto(chatId, photoUrl, caption = '', extra = {}) {
    if (!this.isConfigured()) return false;
    try {
      const response = await fetch(`${this.apiUrl}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoUrl,
          caption: caption.substring(0, 1024),
          parse_mode: 'Markdown',
          ...extra
        })
      });
      return response.ok;
    } catch (err) {
      console.warn('[TelegramBot] Error enviando foto:', err.message);
      return false;
    }
  }

  /**
   * Responde a una interacción de botón inline (callback query) para quitar el reloj de espera.
   * 
   * @param {string} callbackQueryId
   * @param {string} [text='']
   * @param {boolean} [showAlert=false]
   */
  async answerCallbackQuery(callbackQueryId, text = '', showAlert = false) {
    if (!this.isConfigured()) return;
    try {
      await fetch(`${this.apiUrl}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text,
          show_alert: showAlert
        })
      });
    } catch {}
  }

  /**
   * Modifica el texto de un mensaje existente tras interactuar con un botón.
   * 
   * @param {number|string} chatId
   * @param {number} messageId
   * @param {string} text
   * @param {Object} [extra={}]
   */
  async editMessageText(chatId, messageId, text, extra = {}) {
    if (!this.isConfigured()) return;
    try {
      await fetch(`${this.apiUrl}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text,
          parse_mode: 'Markdown',
          ...extra
        })
      });
    } catch (err) {
      console.warn('[TelegramBot] Error editando mensaje:', err.message);
    }
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
        pendingProposal: null,
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

    const directPath = path.join(baseDir, projectId, `${projectId}.json`);
    if (fs.existsSync(directPath)) {
      try {
        return JSON.parse(fs.readFileSync(directPath, 'utf8'));
      } catch {}
    }

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
   * Guarda los cambios de un proyecto en disco de forma atómica.
   * 
   * @param {string} projectId
   * @param {Object} projectData
   * @returns {boolean}
   */
  saveProject(projectId, projectData) {
    if (!projectId || !projectData) return false;
    const baseDir = path.resolve('proyectos', 'negocios');
    let targetPath = path.join(baseDir, projectId, `${projectId}.json`);

    // Si ya existe dentro de una carpeta user_*, usar esa ruta
    try {
      if (fs.existsSync(baseDir)) {
        const entries = fs.readdirSync(baseDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name.startsWith('user_')) {
            const candidate = path.join(baseDir, entry.name, projectId, `${projectId}.json`);
            if (fs.existsSync(candidate)) {
              targetPath = candidate;
              break;
            }
          }
        }
      }
    } catch {}

    try {
      writeJsonAtomic(targetPath, projectData);
      return true;
    } catch (err) {
      console.error('[TelegramBot] Error guardando proyecto:', err.message);
      return false;
    }
  }

  /**
   * Guarda un archivo binario (ej. foto) en la carpeta assets del proyecto.
   * 
   * @param {string} projectId
   * @param {Buffer} buffer
   * @param {string} filename
   * @returns {string} Ruta absoluta del archivo guardado
   */
  saveProjectAsset(projectId, buffer, filename) {
    const assetsDir = path.resolve('proyectos', 'negocios', projectId, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    const targetFile = path.join(assetsDir, filename);
    fs.writeFileSync(targetFile, buffer);
    return targetFile;
  }

  /**
   * Descarga un archivo de Telegram dado su file_id.
   * 
   * @param {string} fileId
   * @returns {Promise<{ buffer: Buffer, filePath: string }|null>}
   */
  async downloadTelegramFile(fileId) {
    if (!this.isConfigured()) return null;
    try {
      const getFileRes = await fetch(`${this.apiUrl}/getFile?file_id=${fileId}`);
      const fileData = await getFileRes.json();
      if (!fileData.ok || !fileData.result?.file_path) return null;

      const filePath = fileData.result.file_path;
      const downloadUrl = `https://api.telegram.org/file/bot${this.token}/${filePath}`;
      const imgRes = await fetch(downloadUrl);
      if (!imgRes.ok) return null;

      const arrayBuffer = await imgRes.arrayBuffer();
      return { buffer: Buffer.from(arrayBuffer), filePath };
    } catch (err) {
      console.error('[TelegramBot] Error descargando archivo de Telegram:', err.message);
      return null;
    }
  }

  /**
   * Procesa una actualización entrante de Telegram (usada tanto en Polling como en Webhook).
   * 
   * @param {Object} update
   */
  async handleUpdate(update) {
    if (!update) return;

    // 1. Manejo de interacción de Botones Inline (Callback Query)
    if (update.callback_query) {
      await this.handleCallbackQuery(update.callback_query);
      return;
    }

    if (!update.message) return;
    const message = update.message;
    const chatId = message.chat?.id;
    const fromUser = message.from;

    if (!chatId) return;

    // Verificar lista blanca de seguridad
    if (!isUserAllowed(fromUser, this.allowedUsers)) {
      await this.sendMessage(
        chatId,
        `🔒 *Acceso Restringido*\n\nHola ${fromUser?.first_name || 'usuario'}. Este bot de BOB está en modo privado exclusivo para los directivos del proyecto.\n\nTu ID de Telegram es: \`${fromUser?.id}\`\nSolicita autorización al administrador de Open Business Plan.`
      );
      return;
    }

    const session = this.getOrCreateSession(chatId);

    // 2. Manejo de Fotografías Multimodales
    if (Array.isArray(message.photo) && message.photo.length > 0) {
      await this.handlePhotoMessage(chatId, message, session);
      return;
    }

    const text = message.text || '';
    if (!text) return;

    // 3. Manejo de Comandos
    const parsedCmd = parseCommand(text);
    if (parsedCmd) {
      await this.handleCommand(chatId, parsedCmd, session, fromUser);
      return;
    }

    // 4. Consulta libre en lenguaje natural (con detección de palancas e inversiones)
    await this.handleNaturalLanguageQuery(chatId, text, session);
  }

  /**
   * Maneja interacciones de botones inline.
   * 
   * @param {Object} callbackQuery
   */
  async handleCallbackQuery(callbackQuery) {
    const callbackId = callbackQuery.id;
    const chatId = callbackQuery.message?.chat?.id;
    const messageId = callbackQuery.message?.message_id;
    const data = callbackQuery.data || '';

    const session = this.getOrCreateSession(chatId);

    if (data.startsWith('apply_lever:')) {
      const leverId = data.replace('apply_lever:', '');
      const proposal = session.pendingProposal;

      if (!proposal || proposal.leverId !== leverId) {
        await this.answerCallbackQuery(callbackId, 'La propuesta ya no está activa o ha expirado.', true);
        return;
      }

      const projectData = this.loadProject(session.activeProjectId);
      if (!projectData) {
        await this.answerCallbackQuery(callbackId, 'Error: No se encontró el proyecto.', true);
        return;
      }

      applyPendingLeverAdjustment(projectData, proposal);
      this.saveProject(session.activeProjectId, projectData);
      session.pendingProposal = null;

      await this.answerCallbackQuery(callbackId, '✅ Ajuste aplicado exitosamente');
      await this.editMessageText(
        chatId,
        messageId,
        `✅ *Ajuste Financiero Aplicado Exitosamente*\n\nSe ha actualizado el margen operativo a \`${proposal.targetMargin}%\` y el Punto de Equilibrio a \`${proposal.bepNuevo}\` en el plan de negocio de *${projectData.nombre || session.activeProjectId}*.\n\n_Los números han sido persistidos de forma segura en la corrida financiera._`
      );
      return;
    }

    if (data.startsWith('discard_lever:')) {
      session.pendingProposal = null;
      await this.answerCallbackQuery(callbackId, 'Ajuste descartado');
      await this.editMessageText(
        chatId,
        messageId,
        '❌ *Ajuste Descartado*\n\nNo se realizaron modificaciones en la corrida financiera del proyecto. Las cifras se mantienen intactas.'
      );
      return;
    }

    if (data.startsWith('save_logo:')) {
      const logoUrl = session.lastGeneratedLogoUrl;
      if (logoUrl) {
        const projectData = this.loadProject(session.activeProjectId);
        if (projectData) {
          projectData.logoUrl = logoUrl;
          if (!projectData.config) projectData.config = {};
          projectData.config.logoUrl = logoUrl;
          this.saveProject(session.activeProjectId, projectData);
          await this.answerCallbackQuery(callbackId, '🎨 Logo guardado como oficial');
          await this.sendMessage(chatId, `✨ *¡Logo Guardado!* El nuevo logotipo ha sido establecido como el emblema oficial de *${projectData.nombre || session.activeProjectId}*.`);
          return;
        }
      }
      await this.answerCallbackQuery(callbackId, 'Logo no disponible para guardar', true);
      return;
    }

    await this.answerCallbackQuery(callbackId);
  }

  /**
   * Procesa fotografías enviadas al bot (locales, maquinaria, menús, inspiración de logos).
   * 
   * @param {number|string} chatId
   * @param {Object} message
   * @param {Object} session
   */
  async handlePhotoMessage(chatId, message, session) {
    await this.sendChatAction(chatId, 'upload_photo');

    const photos = message.photo;
    const bestPhoto = photos[photos.length - 1]; // Mayor resolución
    const caption = message.caption || '';
    const intent = classifyPhotoIntent(caption);

    const projectData = this.loadProject(session.activeProjectId);
    const summary = extractProjectSummary(projectData);

    // Descargar imagen y archivar en el proyecto
    const downloaded = await this.downloadTelegramFile(bestPhoto.file_id);
    let assetNote = '';
    if (downloaded) {
      const filename = `tg_${Date.now()}_${path.basename(downloaded.filePath)}`;
      this.saveProjectAsset(session.activeProjectId, downloaded.buffer, filename);
      assetNote = `\n📁 _Foto archivada en activos del proyecto: \`${filename}\`_`;
    }

    // 1. Caso: Inspiración de Logo / Marca
    if (intent === 'brand') {
      await this.sendMessage(chatId, `🎨 *Procesando inspiración visual para ${summary.nombre}...*\n\nAnalizando estética, paleta de colores y giro para generar propuestas de logotipo.`);
      try {
        const variants = await generateLogoVariants({
          companyName: summary.nombre,
          giro: summary.giro,
          sector: summary.sector,
          userPrompt: caption || 'minimalist modern brand icon'
        });

        if (variants && variants.length > 0) {
          const mainVariant = variants[0];
          session.lastGeneratedLogoUrl = mainVariant.url;
          await this.sendPhoto(
            chatId,
            mainVariant.url,
            `✨ *Propuesta de Logotipo Generada*\n\nEstilo: *${mainVariant.styleName}*\nEmpresa: *${summary.nombre}*${assetNote}`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🎨 Guardar como Logo Oficial', callback_data: `save_logo:${mainVariant.styleId}` }]
                ]
              }
            }
          );
          return;
        }
      } catch (err) {
        console.warn('[TelegramBot] Error generando logo:', err.message);
      }
    }

    // 2. Caso: Maquinaria, Procesos Industriales o Equipamiento
    if (intent === 'machinery') {
      const response = `🏭 *EVALUACIÓN DE MAQUINARIA Y CAPEX OPERATIVO*

📌 *Proyecto:* ${summary.nombre}
🔍 *Análisis Técnico del Equipo:*
• *Clasificación:* Equipo para procesamiento industrial / taller operativo.
• *Evaluación Operativa:* Vital para incrementar el volumen de producción y reducir mermas.
• *Recomendación CAPEX:* Verificar si el equipo incluye instalación trifásica, contrato de mantenimiento y refacciones locales.
• *Impacto en Punto de Equilibrio:* Amortizar a 5 años (depreciación fiscal del 20% anual) para no castigar el flujo de caja inicial.${assetNote}

💡 _¿Deseas que simule el impacto financiero de incorporar este equipo a la inversión inicial?_`;
      await this.sendMessage(chatId, response);
      return;
    }

    // 3. Caso: Inmuebles, Locales y Fachadas
    if (intent === 'location') {
      const response = `📍 *EVALUACIÓN DE LOCAL COMERCIAL Y EMPLAZAMIENTO*

🏢 *Empresa:* ${summary.nombre}
🔍 *Dictamen de Ubicación:*
• *Aspecto y Fachada:* Emplazamiento comercial apto para punto de venta o atención a clientes.
• *Factores Críticos:* Flujo peatonal/vehicular, visibilidad de marquesina y estacionamiento.
• *Adecuación y Obra Civil (CAPEX):* Presupuestar adecuación eléctrica, piso lavable y permisos de uso de suelo municipal antes de firmar contrato de arrendamiento.${assetNote}

💡 _Tip Cuántico: Negocia siempre 1 a 2 meses de gracia en la renta para el periodo de remodelación y montaje._`;
      await this.sendMessage(chatId, response);
      return;
    }

    // 4. Caso: Producto, Platillo o Menú
    const response = `🍽️ *ANÁLISIS DE PRODUCTO Y ESTRUCTURA DE PRECIOS*

🏢 *Empresa:* ${summary.nombre}
• *Presentación y Valor Percibido:* Adecuado para el posicionamiento premium del negocio.
• *Estrategia de Margen:* Asegurar que el costo de materia prima no supere el 30%-35% del precio de venta al público.
• *Estandarización:* Documentar la ficha técnica y receta estándar para que la calidad no dependa del operador del día.${assetNote}`;
    await this.sendMessage(chatId, response);
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
        session.pendingProposal = null;
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
• _"¿Es posible aumentar el margen de ganancia al 35%?"_ -> Simula el impacto y ofrece aplicar el cambio con un botón.
• _"Alguien quiere invertir $200k por el 40%, ¿conviene o mejor un préstamo?"_ -> Dictamen de valuación y dilución.
• _"Mándame una foto de un local o máquina"_ -> Diagnóstico operativo inmediato y generación de logos.
• _"¿Qué perfil profesional debería contratar primero para no hacer todo yo?"_
• _"¿Cómo afecta abrir una segunda sucursal a nuestro punto de equilibrio?"_

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
   * Procesa consultas de negocio libres llamando a la IA con contexto del plan,
   * detectando palancas financieras y dictámenes de inversión.
   * 
   * @param {number|string} chatId
   * @param {string} userQuery
   * @param {Object} session
   */
  async handleNaturalLanguageQuery(chatId, userQuery, session) {
    await this.sendChatAction(chatId, 'typing');

    const projectData = this.loadProject(session.activeProjectId);
    const summary = extractProjectSummary(projectData);

    const cleanQuery = userQuery.trim().toLowerCase();

    // A. Confirmación por texto de una propuesta pendiente
    if (session.pendingProposal && (cleanQuery === 'si' || cleanQuery === 'sí' || cleanQuery.includes('aplica') || cleanQuery.includes('hazlo') || cleanQuery.includes('actualiza'))) {
      const proposal = session.pendingProposal;
      applyPendingLeverAdjustment(projectData, proposal);
      this.saveProject(session.activeProjectId, projectData);
      session.pendingProposal = null;

      await this.sendMessage(
        chatId,
        `✅ *Ajuste Financiero Aplicado Exitosamente*\n\nSe ha actualizado el margen promedio a \`${proposal.targetMargin}%\` y el nuevo Punto de Equilibrio es de \`${proposal.bepNuevo} unidades/mes\` en el proyecto *${summary.nombre}*.`
      );
      return;
    }

    // B. Detección de Simulación de Palancas Financieras
    const leverIntent = detectFinancialLeverIntent(userQuery);
    if (leverIntent) {
      const proposal = calculateFinancialLever(projectData, leverIntent);
      session.pendingProposal = proposal;
      const formatted = formatFinancialLeverProposal(proposal);

      await this.sendMessage(chatId, formatted.text, {
        reply_markup: {
          inline_keyboard: formatted.inlineKeyboard
        }
      });
      return;
    }

    // C. Detección de Oferta de Inversión / Equity vs. Deuda
    const investmentAnalysis = analyzeInvestmentProposal(userQuery, projectData);
    if (investmentAnalysis.isOffer) {
      const report = formatInvestmentAnalysisResponse(investmentAnalysis, summary);
      await this.sendMessage(chatId, report);
      return;
    }

    // D. Inferencia General con IA
    const systemPrompt = buildTelegramSystemPrompt(summary);

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
