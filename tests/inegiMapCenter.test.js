import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CENTER, formatCenter, geocodedCenter, resolveMapCenter } from '../src/lib/mapCenter.js';

test('map coordinates preserve zero and reject invalid pairs', () => {
  assert.deepEqual(geocodedCenter({ success: true, lat: '0', lng: 0 }, 'Origen'), { lat: 0, lng: 0, label: 'Origen' });
  assert.equal(formatCenter({ lat: 0, lng: 0 }, 6), '0.000000, 0.000000');
  for (const lat of [null, undefined, '', ' ', false, NaN, Infinity, 'NaN', 91]) {
    assert.equal(geocodedCenter({ success: true, lat, lng: 0 }, 'Inválido'), null);
  }
  assert.equal(geocodedCenter({ success: true, lat: 0, lng: 181 }, 'Inválido'), null);
});

test('requested location, including Hermosillo, is verified', async () => {
  for (const label of [DEFAULT_CENTER.label, 'Otra ciudad']) {
    const result = await resolveMapCenter(async () => ({ success: true, lat: 0, lng: 0 }), label);
    assert.equal(result.verified, true);
    assert.equal(result.center.label, label);
  }
});

test('failed and malformed geocoding use the real fallback label without verifying the request', async () => {
  for (const geo of [{ success: false }, { success: true, lat: null, lng: 0 }]) {
    const result = await resolveMapCenter(async () => geo, 'Ciudad solicitada');
    assert.deepEqual(result.center, DEFAULT_CENTER);
    assert.equal(result.verified, false);
    assert.match(result.warning, /Hermosillo/);
  }
  const result = await resolveMapCenter(async q => {
    if (q === 'Solicitada') throw new Error('Sin conexión');
    return { success: true, lat: 20, lng: -100 };
  }, 'Solicitada', 'Ciudad de respaldo');
  assert.equal(result.center.label, 'Ciudad de respaldo');
  assert.equal(result.verified, false);
});
