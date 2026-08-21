import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTouchBarTitle,
  formatTouchBarArtist,
  createTouchBarCoverSvg,
  createTouchBarStatusPayload
} from '../src/lib/touchbar/touchBarManager.js';

describe('TouchBarManager - MacBook Pro Touch Bar & Chrome Integration - TDD Suite', () => {

  it('Debe formatear el título para la Touch Bar con progreso y estado de la IA', () => {
    const title = formatTouchBarTitle({
      progressPercent: 75,
      aiState: 'pensando',
      currentModuleTitle: 'Estudio Financiero'
    });

    assert.ok(title.includes('75%'));
    assert.ok(title.includes('🧠'));
    assert.ok(title.includes('Estudio Financiero'));
  });

  it('Debe formatear el subtítulo (artista/álbum) con el último log y modelo activo', () => {
    const artist = formatTouchBarArtist({
      lastLog: 'Calculando corrida financiera y viabilidad...',
      activeModel: 'minimax-m3:cloud',
      projectName: 'Hidráulica Minera Cananea'
    });

    assert.ok(artist.includes('minimax-m3:cloud'));
    assert.ok(artist.includes('Calculando corrida financiera'));
    assert.ok(artist.includes('Hidráulica Minera Cananea'));
  });

  it('Debe truncar textos largos para evitar saturar la barra OLED de macOS', () => {
    const longLog = 'Este es un log sumamente largo generado por un agente que sobrepasa con creces el límite de visualización en la pantalla OLED de la Touch Bar de una MacBook Pro';
    const artist = formatTouchBarArtist({
      lastLog: longLog,
      activeModel: 'minimax-m3:cloud',
      projectName: 'Hidráulica Minera Cananea'
    });

    assert.ok(artist.length <= 110);
    assert.ok(artist.includes('...'));
  });

  it('Debe generar un SVG estructurado con gradientes y métricas para la carátula OLED', () => {
    const svg = createTouchBarCoverSvg({
      progressPercent: 85,
      aiState: 'web_search',
      currentModuleTitle: 'Estudio de Mercado',
      lastLog: 'Consultando DENUE en Cananea, Sonora',
      activeModel: 'minimax-m3:cloud'
    });

    assert.ok(svg.includes('<svg'));
    assert.ok(svg.includes('85%'));
    assert.ok(svg.includes('Estudio de Mercado'));
    assert.ok(svg.includes('DENUE en Cananea'));
    assert.ok(svg.includes('</svg>'));
  });

  it('Debe construir un payload de estado válido para BetterTouchTool y Raycast', () => {
    const payload = createTouchBarStatusPayload({
      planData: {
        semilla: { nombre_proyecto: 'Minera del Cobre', cobertura: 'Cananea, Sonora' }
      },
      currentModule: 'tecnico',
      currentModuleTitle: 'Ingeniería y Operaciones',
      progressPercent: 60,
      aiState: 'listo',
      lastLog: 'Proceso completado exitosamente',
      activeModel: 'minimax-m3:cloud'
    });

    assert.equal(payload.projectName, 'Minera del Cobre');
    assert.equal(payload.location, 'Cananea, Sonora');
    assert.equal(payload.progressPercent, 60);
    assert.equal(payload.aiState, 'listo');
    assert.equal(payload.activeModel, 'minimax-m3:cloud');
  });

});
