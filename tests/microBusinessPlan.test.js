import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FRAMEWORKS } from '../src/config/frameworks.js';
import { MICRO_BUSINESS_GUIDES } from '../src/lib/field_guides.js';
import { PROJECT_EXAMPLES } from '../src/lib/projects_db.js';
import { FRAMEWORK_SLUG_MAP, KNOWN_PROJECT_SLUGS, resolvePillarFromModule } from '../src/config/urlRouting.js';
import { CanvasBuilder } from '../src/lib/tools/canvas/CanvasBuilder.js';

describe('Microempresa y Autoempleo (micro_business) - TDD Test Suite', () => {
  const fw = FRAMEWORKS.micro_business;

  it('Debe tener configurados los 4 pilares y 10 módulos del modelo de microempresa', () => {
    assert.ok(fw, 'El framework micro_business debe existir en FRAMEWORKS');
    assert.strictEqual(fw.id, 'micro_business');
    assert.strictEqual(fw.pillars.length, 4, 'Debe contar con exactamente 4 pilares');

    const totalModules = fw.pillars.reduce((acc, p) => acc + p.modules.length, 0);
    assert.strictEqual(totalModules, 10, 'Debe contar con exactamente 10 módulos');
  });

  it('Debe contener las guías de campo completas para todos los campos de micro_business', () => {
    const allFields = fw.pillars.flatMap(p => p.modules.flatMap(m => m.fields));
    assert.strictEqual(allFields.length, 20, 'Debe sumar exactamente 20 campos');

    for (const field of allFields) {
      const guide = MICRO_BUSINESS_GUIDES[field];
      assert.ok(guide, `El campo ${field} debe tener su guía en MICRO_BUSINESS_GUIDES`);
      assert.ok(guide.instruccion?.length > 10, `El campo ${field} debe tener una instrucción descriptiva`);
      assert.ok(guide.ejemplo?.length > 10, `El campo ${field} debe tener un ejemplo práctico`);
      assert.ok(guide.benchmark?.length > 5, `El campo ${field} debe tener un benchmark cuantitativo`);
      assert.ok(guide.cita?.length > 5, `El campo ${field} debe citar una fuente metodológica`);
      assert.ok(guide.placeholder?.length > 5, `El campo ${field} debe tener un placeholder informativo`);
    }
  });

  it('PROJECT_EXAMPLES.sove debe tener el 100% de los 19 campos llenos con datos coherentes', () => {
    const sove = PROJECT_EXAMPLES.sove;
    assert.ok(sove, 'El proyecto demo sove debe existir en PROJECT_EXAMPLES');
    assert.strictEqual(sove.projectType, 'micro_business');

    // Verificar cada módulo y sus campos
    for (const pillar of fw.pillars) {
      for (const mod of pillar.modules) {
        const modData = sove.data?.[pillar.key]?.[mod.key];
        assert.ok(modData, `El módulo ${pillar.key}.${mod.key} debe existir en sove.data`);
        for (const field of mod.fields) {
          const val = modData[field];
          assert.ok(val && String(val).trim().length > 10, `El campo ${pillar.key}.${mod.key}.${field} debe estar lleno en sove`);
        }
      }
    }
  });

  it('PROJECT_EXAMPLES.mixroom debe tener los campos de micro_business definidos', () => {
    const mixroom = PROJECT_EXAMPLES.mixroom;
    assert.ok(mixroom, 'El proyecto demo mixroom debe existir');
    assert.strictEqual(mixroom.projectType, 'micro_business');

    assert.ok(mixroom.data.naturaleza.introduccion.idea_negocio);
    assert.ok(mixroom.data.mercado.clientes.perfil_cliente);
    assert.ok(mixroom.data.tecnico.operacion.paso_a_paso_diario);
    assert.ok(mixroom.data.organizacion.costos.costos_por_producto);
  });

  it('Debe resolver correctamente los slugs y pilares de microempresa', () => {
    assert.strictEqual(FRAMEWORK_SLUG_MAP['microempresa'], 'micro_business');
    assert.strictEqual(KNOWN_PROJECT_SLUGS['sove'], 'sove');
    assert.strictEqual(KNOWN_PROJECT_SLUGS['sove-postres-para-eventos'], 'sove');

    const pillarIntro = resolvePillarFromModule('micro_business', 'introduccion');
    assert.strictEqual(pillarIntro, 'naturaleza');

    const pillarClientes = resolvePillarFromModule('micro_business', 'clientes');
    assert.strictEqual(pillarClientes, 'mercado');

    const pillarCostos = resolvePillarFromModule('micro_business', 'costos');
    assert.strictEqual(pillarCostos, 'organizacion');
  });

  it('CanvasBuilder debe activar el modo MICRO (3 bloques) para micro_business', () => {
    const mode = CanvasBuilder.resolveModeForDocType('micro_business');
    assert.strictEqual(mode, CanvasBuilder.MODES.MICRO, 'micro_business debe usar el canvas simplificado de 3 bloques');
  });
});
