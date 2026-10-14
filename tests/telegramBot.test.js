/**
 * @file tests/telegramBot.test.js
 * @description Suite de pruebas TDD para el servicio de integración de Telegram con BOB Chat.
 * Valida parsing de comandos, escape de texto, división de mensajes largos,
 * control de acceso de usuarios y generación de contexto empresarial cuántico.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  splitTelegramMessage,
  escapeTelegramMarkdown,
  isUserAllowed,
  parseCommand,
  extractProjectSummary,
  buildTelegramSystemPrompt,
  formatProjectInfoResponse,
  formatFinancialSnapshotResponse,
  formatQuantumDiagnosticResponse,
  detectFinancialLeverIntent,
  calculateFinancialLever,
  formatFinancialLeverProposal,
  applyPendingLeverAdjustment,
  analyzeInvestmentProposal,
  formatInvestmentAnalysisResponse,
  classifyPhotoIntent
} from '../server/integrations/telegramBot.js';

test('Telegram Bot TDD Suite', async (t) => {

  await t.test('splitTelegramMessage divide mensajes que exceden el límite de 4096 caracteres', () => {
    const shortText = 'Hola, soy BOB tu copiloto.';
    const shortChunks = splitTelegramMessage(shortText, 4000);
    assert.equal(shortChunks.length, 1);
    assert.equal(shortChunks[0], shortText);

    // Texto largo de 9000 caracteres
    const paragraph = 'Este es un análisis financiero detallado para evaluar la viabilidad de la empresa.\n';
    const longText = paragraph.repeat(110);
    assert.ok(longText.length > 8000);

    const chunks = splitTelegramMessage(longText, 4000);
    assert.ok(chunks.length >= 3);
    for (const chunk of chunks) {
      assert.ok(chunk.length <= 4000, `El chunk mide ${chunk.length}, superando el límite`);
    }
    // La unión de los fragmentos debe contener la misma información sin pérdidas
    const joined = chunks.join('\n');
    assert.equal(joined.replace(/\s+/g, ' ').trim(), longText.replace(/\s+/g, ' ').trim());
  });

  await t.test('escapeTelegramMarkdown limpia o protege caracteres especiales', () => {
    const raw = 'Prueba de *negrita* e _cursiva_ con [enlace](http://test.com) y `código`.';
    const sanitized = escapeTelegramMarkdown(raw);
    assert.ok(typeof sanitized === 'string');
    assert.ok(sanitized.length > 0);

    // Texto con caracteres desbalanceados no debe romper
    const unbalanced = 'Atención [Sin cerrar llave ni corchete *desbalanceado';
    const safeResult = escapeTelegramMarkdown(unbalanced);
    assert.ok(typeof safeResult === 'string');
  });

  await t.test('isUserAllowed verifica correctamente la lista blanca de usuarios', () => {
    // Si la lista está vacía, permite acceso abierto para pruebas
    assert.equal(isUserAllowed({ id: 12345, username: 'fundador' }, ''), true);
    assert.equal(isUserAllowed({ id: 12345, username: 'fundador' }, null), true);

    // Con lista blanca definida
    const allowedConfig = '111222, 333444, @roberto_celis, carlos_obp';

    // Permitido por ID numérico
    assert.equal(isUserAllowed({ id: 111222, username: 'desconocido' }, allowedConfig), true);
    // Permitido por username con @
    assert.equal(isUserAllowed({ id: 999999, username: 'roberto_celis' }, allowedConfig), true);
    assert.equal(isUserAllowed({ id: 999999, username: '@roberto_celis' }, allowedConfig), true);
    // Permitido por username sin @
    assert.equal(isUserAllowed({ id: 999999, username: 'carlos_obp' }, allowedConfig), true);

    // Denegado: no coincide ni id ni username
    assert.equal(isUserAllowed({ id: 999999, username: 'hacker_externo' }, allowedConfig), false);
  });

  await t.test('parseCommand extrae comandos y argumentos con o sin mención de bot', () => {
    assert.deepEqual(parseCommand('/start'), { command: 'start', args: '' });
    assert.deepEqual(parseCommand('/start@BobChatBot'), { command: 'start', args: '' });
    assert.deepEqual(parseCommand('/usar vcv_cortes_finos_sa_de_cv'), { command: 'usar', args: 'vcv_cortes_finos_sa_de_cv' });
    assert.deepEqual(parseCommand('/usar@BobChatBot vcv_cortes_finos'), { command: 'usar', args: 'vcv_cortes_finos' });
    assert.deepEqual(parseCommand('/diagnostico'), { command: 'diagnostico', args: '' });
    assert.deepEqual(parseCommand('/finanzas'), { command: 'finanzas', args: '' });
    assert.deepEqual(parseCommand('¿Cuál es nuestro margen de ganancia?'), null);
  });

  await t.test('extractProjectSummary extrae datos clave de un proyecto JSON', () => {
    const mockProject = {
      id: 'vcv_cortes_finos',
      nombre: 'VCV Cortes Finos SA de CV',
      sector: 'Alimentos y Cárnicos',
      giro: 'Procesamiento y Comercialización',
      descripcion: 'Cortes de carne premium empacados al vacío.',
      montoInversion: 1500000,
      semilla: {
        problema: 'Falta de carne de alta calidad con trazabilidad en la región.',
        solucion: 'Centro de corte, maduración y empaque certificado.',
        propuestaValor: 'Cortes Sonora Certified con entrega refrigerada en 24h.',
        modeloIngresos: 'Venta B2B a restaurantes y B2C boutique.',
        perfil_fundador: {
          areaFuerte: 'Operativo',
          areaMedia: 'Finanzas',
          areaDebil: 'Administrativo',
          tamanoEquipo: 4
        }
      },
      simulador_financiero: {
        margen_promedio: 31.13,
        punto_equilibrio_mensual: 781.87,
        ventas_proyectadas_mes: 250000,
        frli_reserva: 120000
      }
    };

    const summary = extractProjectSummary(mockProject);
    assert.equal(summary.nombre, 'VCV Cortes Finos SA de CV');
    assert.equal(summary.sector, 'Alimentos y Cárnicos');
    assert.equal(summary.montoInversion, 1500000);
    assert.equal(summary.propuestaValor, 'Cortes Sonora Certified con entrega refrigerada en 24h.');
    assert.equal(summary.margen, 31.13);
    assert.equal(summary.puntoEquilibrio, 781.87);
    assert.equal(summary.perfilFundador.areaFuerte, 'Operativo');
  });

  await t.test('buildTelegramSystemPrompt contiene directivas de Empresas Cuánticas y datos del proyecto', () => {
    const summary = {
      nombre: 'Taller Mecánico Cuántico',
      sector: 'Automotriz',
      montoInversion: 500000,
      propuestaValor: 'Mantenimiento predictivo para flotillas.',
      perfilFundador: { areaFuerte: 'Operativo', areaDebil: 'Finanzas' },
      margen: 28.5,
      puntoEquilibrio: 150000,
      frli: 45000
    };

    const prompt = buildTelegramSystemPrompt(summary);
    assert.ok(prompt.includes('BOB (Business Operations Bot)'));
    assert.ok(prompt.includes('Taller Mecánico Cuántico'));
    assert.ok(prompt.includes('Automotriz'));
    assert.ok(prompt.includes('Fondo Thoth AC'));
    assert.ok(prompt.includes('Modelo Atómico'));
    assert.ok(prompt.includes('Fusión Atómica'));
    assert.ok(prompt.includes('FRLI'));
  });

  await t.test('formatProjectInfoResponse formatea ficha ejecutiva correctamente', () => {
    const summary = {
      nombre: 'Pizzería Siglo 21',
      sector: 'Restaurantes',
      giro: 'Alimentos preparados',
      montoInversion: 350000,
      propuestaValor: 'Pizza artesanal en horno de piedra con masa madre.',
      modeloIngresos: 'Consumo en local y delivery propio.',
      perfilFundador: { areaFuerte: 'Operativo' }
    };

    const res = formatProjectInfoResponse(summary);
    assert.ok(res.includes('Pizzería Siglo 21'));
    assert.ok(res.includes('Restaurantes'));
    assert.ok(res.includes('Pizza artesanal'));
    assert.ok(res.includes('350,000'));
  });

  await t.test('formatFinancialSnapshotResponse muestra métricas y semáforo FRLI', () => {
    const summary = {
      nombre: 'Pizzería Siglo 21',
      montoInversion: 350000,
      margen: 32.5,
      puntoEquilibrio: 65000,
      frli: 25000
    };

    const res = formatFinancialSnapshotResponse(summary);
    assert.ok(res.includes('Pizzería Siglo 21'));
    assert.ok(res.includes('32.5%'));
    assert.ok(res.includes('65,000'));
    assert.ok(res.includes('FRLI'));
  });

  await t.test('formatQuantumDiagnosticResponse evalúa las 3 áreas y alerta sobre fusión atómica', () => {
    const summary = {
      nombre: 'Startup Todo-Yo',
      perfilFundador: {
        areaFuerte: 'Operativo, Finanzas, Administrativo',
        descripcion: 'El fundador hace la contabilidad, diseña, vende y atiende el soporte.'
      }
    };

    const res = formatQuantumDiagnosticResponse(summary);
    assert.ok(res.includes('DIAGNÓSTICO CUÁNTICO'));
    assert.ok(res.includes('Fondo Thoth AC'));
    assert.ok(res.includes('Fusión Atómica') || res.includes('fusión atómica') || res.includes('FUSIÓN ATÓMICA'));
    assert.ok(res.includes('Delegación') || res.includes('delegación'));
  });

  // ════════════════════════════════════════════════════════════════════════
  // NUEVAS PRUEBAS: PALANCAS, CONSULTORÍA DE INVERSIÓN Y VISIÓN MULTIMODAL
  // ════════════════════════════════════════════════════════════════════════

  await t.test('detectFinancialLeverIntent detecta intenciones de margen, precio y costos', () => {
    const intent1 = detectFinancialLeverIntent('¿Es posible aumentar el margen de ganancia?');
    assert.ok(intent1);
    assert.equal(intent1.type, 'margen');
    assert.equal(intent1.targetValue, null);

    const intent2 = detectFinancialLeverIntent('Quiero subir el margen de ganancia al 36%');
    assert.ok(intent2);
    assert.equal(intent2.type, 'margen');
    assert.equal(intent2.targetValue, 36);

    const intent3 = detectFinancialLeverIntent('Podemos aumentar el precio un 10%');
    assert.ok(intent3);
    assert.equal(intent3.type, 'precio');
    assert.equal(intent3.deltaPercent, 10);

    const intent4 = detectFinancialLeverIntent('Reducir costos de producción en 8%');
    assert.ok(intent4);
    assert.equal(intent4.type, 'costos');
    assert.equal(intent4.deltaPercent, -8);

    const intentNone = detectFinancialLeverIntent('¿Qué opinas del clima y la lluvia hoy?');
    assert.equal(intentNone, null);
  });

  await t.test('calculateFinancialLever calcula la simulación y genera botones interactivos', () => {
    const mockProject = {
      nombre: 'VCV Cortes Finos SA de CV',
      simulador_financiero: {
        margen_promedio: 31.13,
        punto_equilibrio_mensual: 781.87,
        ventas_proyectadas_mes: 250000
      }
    };

    const intent = { type: 'margen', targetValue: 35 };
    const proposal = calculateFinancialLever(mockProject, intent);

    assert.ok(proposal);
    assert.ok(proposal.leverId.startsWith('lev_'));
    assert.equal(proposal.currentMargin, 31.13);
    assert.equal(proposal.targetMargin, 35);
    assert.ok(proposal.requiredPriceIncreasePercent > 0);
    assert.ok(proposal.bepNuevo < proposal.bepActual);
    assert.ok(proposal.summaryText.includes('35%'));

    const formatted = formatFinancialLeverProposal(proposal);
    assert.ok(formatted.text.includes('SIMULACIÓN DE PALANCA FINANCIERA'));
    assert.ok(Array.isArray(formatted.inlineKeyboard));
    assert.equal(formatted.inlineKeyboard[0].length, 2);
    assert.ok(formatted.inlineKeyboard[0][0].callback_data.includes(proposal.leverId));
    assert.ok(formatted.inlineKeyboard[0][1].callback_data.includes(proposal.leverId));
  });

  await t.test('applyPendingLeverAdjustment aplica el cambio en el proyecto JSON', () => {
    const mockProject = {
      nombre: 'VCV Cortes Finos SA de CV',
      simulador_financiero: {
        margen_promedio: 31.13,
        punto_equilibrio_mensual: 781.87
      }
    };

    const proposal = {
      leverId: 'lev_test123',
      targetMargin: 35.0,
      bepNuevo: 720.5
    };

    const updated = applyPendingLeverAdjustment(mockProject, proposal);
    assert.equal(updated.simulador_financiero.margen_promedio, 35.0);
    assert.equal(updated.simulador_financiero.punto_equilibrio_mensual, 720.5);
    assert.ok(updated.fechaActualizacion);
  });

  await t.test('analyzeInvestmentProposal desglosa valuación pre/post-money, deuda vs equity y alerta cuántica', () => {
    const query = 'oye nueva info el emprendedor me dijo que alguien le quiere invertir 200 000 pesos por el 40 % del proyecto como afecta eso nos ayuda o mejor un prestamo';
    const mockProject = {
      nombre: 'Empresa Demo',
      montoInversion: 500000,
      simulador_financiero: {
        margen_promedio: 30,
        utilidad_neta_anual_proyectada: 250000
      }
    };

    const analysis = analyzeInvestmentProposal(query, mockProject);
    assert.ok(analysis.isOffer);
    assert.equal(analysis.investmentAmount, 200000);
    assert.equal(analysis.equityPercentage, 40);

    assert.equal(analysis.postMoneyValuation, 500000);
    assert.equal(analysis.preMoneyValuation, 300000);

    assert.equal(analysis.dilutionRisk, 'CRITICA');
    assert.ok(analysis.annualEquityCost > analysis.annualDebtCost);
    assert.ok(analysis.governanceAlert.includes('Fondo Thoth AC') || analysis.governanceAlert.includes('Gobernanza'));
    assert.ok(analysis.counterProposal.includes('10%') || analysis.counterProposal.includes('15%') || analysis.counterProposal.includes('SAFE'));

    const formatted = formatInvestmentAnalysisResponse(analysis, { nombre: 'Empresa Demo' });
    assert.ok(formatted.includes('VALUACIÓN IMPLÍCITA'));
    assert.ok(formatted.includes('500,000'));
    assert.ok(formatted.includes('300,000'));
    assert.ok(formatted.includes('EQUITY VS. DEUDA'));
    assert.ok(formatted.includes('CONTRAPROPUESTA'));
  });

  await t.test('classifyPhotoIntent clasifica fotos por su pie de foto o contexto', () => {
    assert.equal(classifyPhotoIntent('foto de este torno mecánico para el taller'), 'machinery');
    assert.equal(classifyPhotoIntent('línea de corte y envasadora al vacío industrial'), 'machinery');
    assert.equal(classifyPhotoIntent('fachada del local en plaza comercial para sucursal'), 'location');
    assert.equal(classifyPhotoIntent('mira este local en renta'), 'location');
    assert.equal(classifyPhotoIntent('menú y platillo con precios del competidor'), 'product');
    assert.equal(classifyPhotoIntent('inspiración para logo y paleta de colores'), 'brand');
    assert.equal(classifyPhotoIntent(''), 'brand');
  });

});
