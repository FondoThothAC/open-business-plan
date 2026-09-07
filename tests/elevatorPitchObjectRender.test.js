import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

describe('Bugfix: React error #31 en VistaPrevia (elevator_pitch objeto vs string)', () => {
  const filePath = path.resolve('src/components/ExecutiveSummarySection.jsx');
  const source = fs.readFileSync(filePath, 'utf8');

  it('ExecutiveSummarySection.jsx debe manejar elevator_pitch tanto como string como objeto', () => {
    // El error #31 de React ("Objects are not valid as a React child") ocurre
    // cuando se renderiza un objeto plano como hijo. Para el proyecto VCV,
    // resumen_ejecutivo.elevator_pitch es un objeto con claves
    // {problema, solucion, mercado, ventaja_injusta, traccion, modelo_ingresos, ask}.
    assert.ok(
      source.includes('typeof resumen.elevator_pitch'),
      'El componente debe discriminar string vs objeto antes de renderizar elevator_pitch'
    );
  });

  it('no debe renderizar elevator_pitch como hijo directo sin coerción cuando es objeto', () => {
    // El patrón buggy era: <p>{resumen.elevator_pitch}</p>
    // El fix correcto es: o usar String(val) / coerción, o iterar Object.entries()
    const usesObjectEntries = /Object\.entries\(\s*resumen\.elevator_pitch\s*\)/.test(source);
    const hasStringCoercionInList = /String\(\s*val\s*\)/.test(source);
    assert.ok(
      usesObjectEntries || hasStringCoercionInList,
      'Debe iterar Object.entries(resumen.elevator_pitch) o coercionar valores a String() para evitar React #31'
    );
  });

  it('el JSON de VCV debe contener elevator_pitch como objeto estructurado (no string)', () => {
    const jsonPath = path.resolve('proyectos/negocios/vcv_cortes_finos_sa_de_cv/vcv_cortes_finos_sa_de_cv.json');
    if (!fs.existsSync(jsonPath)) return; // Skip si el proyecto no se ha generado localmente
    const project = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const pitch = project?.resumen_ejecutivo?.elevator_pitch;
    assert.ok(pitch && typeof pitch === 'object' && !Array.isArray(pitch),
      'elevator_pitch de VCV debe ser un objeto (no string) para soportar renderizado estructurado');
    assert.ok(pitch.problema, 'Debe contener campo problema');
    assert.ok(pitch.solucion, 'Debe contener campo solucion');
    assert.ok(pitch.mercado, 'Debe contener campo mercado');
    assert.ok(pitch.ventaja_injusta, 'Debe contener campo ventaja_injusta');
    assert.ok(pitch.traccion, 'Debe contener campo traccion');
    assert.ok(pitch.modelo_ingresos, 'Debe contener campo modelo_ingresos');
  });
});
