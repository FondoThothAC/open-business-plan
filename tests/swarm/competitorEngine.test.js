import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  generarCompetidoresSinteticos,
  analizarViabilidad,
  COLORES_FUENTE,
  FUENTE
} from '../../server/competitorEngine.js';

describe('Competitor & Heatmap Engine - TDD Test Suite', () => {
  it('should define source colors and identifiers', () => {
    assert.ok(COLORES_FUENTE[FUENTE.DENUE], 'DENUE color must be defined');
    assert.ok(COLORES_FUENTE[FUENTE.OSM], 'OSM color must be defined');
    assert.ok(COLORES_FUENTE.ia_synthetic || COLORES_FUENTE[FUENTE.DDG], 'Synthetic or DDG color must be defined');
  });

  it('should generate realistic synthetic competitors when external APIs return 0 results', () => {
    const lat = 29.072967;
    const lng = -110.955919;
    const query = 'veterinaria mascotas';
    const cityName = 'Hermosillo, Sonora';

    const list = generarCompetidoresSinteticos(lat, lng, query, cityName, 15);

    assert.ok(Array.isArray(list), 'Must return an array of competitors');
    assert.strictEqual(list.length, 15, 'Must generate requested count of competitors');

    const first = list[0];
    assert.ok(first.nombre && first.nombre.length > 3, 'Competitor must have a valid name');
    assert.ok(typeof first.lat === 'number' && typeof first.lng === 'number', 'Coordinates must be numbers');
    assert.ok(first.lat !== lat || first.lng !== lng, 'Competitors should be geographically dispersed');
    assert.ok(first.rating >= 3.0 && first.rating <= 5.0, 'Rating must be realistic');
    assert.ok(first.precioRango, 'Price range must be defined');
    assert.strictEqual(first.confianza, 'baja', 'Synthetic competitor must have low confidence');
    assert.strictEqual(first.provenance, 'synthetic', 'Synthetic competitor must have synthetic provenance');
  });

  it('should calculate market viability accurately based on competitor density', () => {
    const mockCompetidores = [
      { id: '1', rating: 4.5, posibleZombie: false },
      { id: '2', rating: 4.2, posibleZombie: false },
      { id: '3', rating: 3.8, posibleZombie: false }
    ];

    const mockIndicadores = {
      ingresoMensualPromedio: 22000
    };

    const viability = analizarViabilidad({
      competidores: mockCompetidores,
      indicadores: mockIndicadores,
      precioProducto: 850,
      radioKm: 3
    });

    assert.ok(typeof viability.viabilidadScore === 'number', 'Viability score must be a number');
    assert.ok(viability.viabilidadScore >= 0 && viability.viabilidadScore <= 100, 'Score must be 0-100');
    assert.ok(viability.competencia.total === 3, 'Total competitors must match');
    assert.ok(viability.asequibilidad && viability.asequibilidad.nivel === 'muy accesible', 'Product price of 850 with 22k income should be accessible');
    assert.ok(Array.isArray(viability.recomendaciones), 'Must provide recommendations');
  });
});
