import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMarketReport, classifyEstablishment } from '../server/api/marketResearchService.js';

test('DENUE establishments are not turned into household income or an invented population', () => {
  const report = buildMarketReport({
    context: { product: 'corte de res preparado', marketLocation: 'Hermosillo', channel: 'B2B' },
    denue: { establishments: [{ name: 'Carnicería Centro', activity: 'Comercio al por menor de carnes', source: 'INEGI DENUE' }], provenance: [{ source: 'INEGI DENUE', status: 'observed' }] }
  });
  assert.equal(report.indicators[0].kind, 'pending');
  assert.equal(report.indicators[1].kind, 'pending');
  assert.equal(report.competitors[0].classification, 'substitute_or_indirect');
  assert.match(report.markdown, /Pendientes de validación/);
});

test('spend is shown as an explicit scenario with its formula', () => {
  const report = buildMarketReport({ context: {}, denue: {}, enigh: { households: 12, spendPerHousehold: 100, source: 'ENIGH 2024', period: 'trimestral' } });
  assert.equal(report.indicators[1].value, 1200);
  assert.equal(report.indicators[1].kind, 'scenario');
  assert.equal(report.indicators[1].formula, 'hogares × gasto promedio por hogar');
});

test('classification requires evidence beyond sharing a broad activity', () => {
  const result = classifyEstablishment({ name: 'Restaurante Norte', activity: 'Restaurantes', source: 'INEGI DENUE' }, { product: 'carne preparada', channel: 'B2B' });
  assert.equal(result.classification, 'potential_customer');
});
