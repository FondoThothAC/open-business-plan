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
  formatQuantumDiagnosticResponse
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

});
