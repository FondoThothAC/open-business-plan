import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { FRAMEWORKS } from '../src/config/frameworks.js';
import { FIELD_GUIDES_MAP } from '../src/lib/field_guides.js';
import { BOX_REGISTRY, getBoxesForDocType } from '../src/config/boxRegistry.js';
import { BOX_TYPES } from '../src/config/boxes.js';
import { MODULE_BOX_MAP, getBoxIdsForModule } from '../src/config/moduleBoxMap.js';

test('Enriquecimiento Integral de las 12 Metodologías con los 13 Libros Técnicos - TDD Suite', async (t) => {
  const allFrameworkKeys = [
    'business', 'social_bid', 'agile_startup', 'technology_id',
    'micro_business', 'investment_project', 'zopp', 'horizon_europe',
    'hoshin_kanri', 'amoeba_management', 'guanxi_plan', 'onudi_project'
  ];

  await t.test('1. Las 12 metodologías canónicas están definidas y superan el estado de stub (>= 7 módulos c/u)', () => {
    assert.equal(Object.keys(FRAMEWORKS).length, 12, 'Deben existir exactamente 12 metodologías canónicas');

    for (const key of allFrameworkKeys) {
      const fw = FRAMEWORKS[key];
      assert.ok(fw, `El framework ${key} debe estar definido`);
      assert.ok(fw.name, `El framework ${key} debe tener un nombre legible`);
      assert.ok(Array.isArray(fw.pillars) && fw.pillars.length >= 3, `El framework ${key} debe contar con al menos 3 pilares`);

      const totalModules = fw.pillars.reduce((acc, p) => acc + p.modules.length, 0);
      assert.ok(
        totalModules >= 7,
        `El framework ${key} debe tener al menos 7 módulos (actual: ${totalModules}) para no ser un stub esquelético`
      );

      const totalFields = fw.pillars.reduce((acc, p) => acc + p.modules.reduce((a, m) => a + m.fields.length, 0), 0);
      assert.ok(
        totalFields >= 13,
        `El framework ${key} debe tener al menos 13 campos de entrada (actual: ${totalFields})`
      );
    }
  });

  await t.test('2. Cobertura del 100% en field_guides.js para todos los campos de todos los frameworks (Capa L1)', () => {
    let totalCheckedFields = 0;

    for (const key of allFrameworkKeys) {
      const fw = FRAMEWORKS[key];
      const guides = FIELD_GUIDES_MAP[key] || FIELD_GUIDES_MAP.business || {};

      for (const pillar of fw.pillars) {
        for (const mod of pillar.modules) {
          for (const field of mod.fields) {
            totalCheckedFields++;
            const guide = guides[field] || FIELD_GUIDES_MAP.business[field];
            assert.ok(
              guide,
              `El campo ${field} en ${key}:${mod.key} debe tener una guía definida en FIELD_GUIDES_MAP`
            );
            assert.ok(
              guide.instruccion && guide.instruccion.length >= 15,
              `El campo ${field} debe tener una instrucción sustantiva (>= 15 chars)`
            );
            assert.ok(
              guide.cita && guide.cita.length >= 4,
              `El campo ${field} debe incluir una cita bibliográfica a los libros técnicos`
            );
          }
        }
      }
    }

    assert.ok(totalCheckedFields >= 380, `Deben auditarse al menos 380 campos en total (auditados: ${totalCheckedFields})`);
  });

  await t.test('3. Registro de Boxes metodológicos y mapeo interactivo válido (Capa L2)', () => {
    const validBoxTypes = Object.values(BOX_TYPES);

    for (const key of allFrameworkKeys) {
      const boxes = BOX_REGISTRY[key];
      assert.ok(
        Array.isArray(boxes) && boxes.length >= 4,
        `El framework ${key} debe tener registrados al menos 4 boxes visuales en BOX_REGISTRY (actual: ${boxes?.length || 0})`
      );

      for (const b of boxes) {
        assert.ok(b.id, `El box debe tener un id único`);
        assert.ok(validBoxTypes.includes(b.type), `El box ${b.id} tiene un tipo inválido: ${b.type}`);
        assert.ok(b.title && b.title.length > 5, `El box ${b.id} debe tener un título descriptivo`);
        assert.ok(b.source && b.source.book, `El box ${b.id} debe citar el libro fuente`);
      }
    }

    // Comprobar que los nuevos módulos críticos tienen boxes asociados en MODULE_BOX_MAP
    assert.ok(MODULE_BOX_MAP['business:metricas_aarrr']?.includes('box_aarrr_pirata_5metricas'));
    assert.ok(MODULE_BOX_MAP['social_bid:evaluacion_social_cuantitativa']?.includes('box_tir_vpn_social_bid'));
    assert.ok(MODULE_BOX_MAP['agile_startup:innovation_accounting']?.includes('box_innovation_accounting_3metrics'));
    assert.ok(MODULE_BOX_MAP['technology_id:jobs_to_be_done']?.includes('box_jtbd_job_statement'));
    assert.ok(MODULE_BOX_MAP['micro_business:punto_equilibrio_micro']?.includes('box_punto_equilibrio_micro'));
    assert.ok(MODULE_BOX_MAP['investment_project:tornado_sensibilidad']?.includes('box_tornado_chart'));
    assert.ok(MODULE_BOX_MAP['zopp:analisis_alternativas_zopp']?.includes('box_matriz_alternativas_zopp'));
    assert.ok(MODULE_BOX_MAP['horizon_europe:impacto_pathway_trl']?.includes('box_impacto_pathway_trl6_9'));
    assert.ok(MODULE_BOX_MAP['hoshin_kanri:catchball_nemawashi']?.includes('box_catchball_nemawashi'));
    assert.ok(MODULE_BOX_MAP['amoeba_management:principios_inamori_12']?.includes('box_12_principios_inamori'));
    assert.ok(MODULE_BOX_MAP['guanxi_plan:banquet_protocol_ritual']?.includes('box_banquet_protocol_8pasos'));
    assert.ok(MODULE_BOX_MAP['onudi_project:localizacion_industrial']?.includes('box_matriz_localizacion_onudi'));
  });

  await t.test('4. Existencia y rigor de los 12 documentos de referencia técnica L3 en docs/', () => {
    for (const key of allFrameworkKeys) {
      const docPath = path.resolve(`docs/${key}.md`);
      assert.ok(fs.existsSync(docPath), `El documento docs/${key}.md debe existir`);

      const content = fs.readFileSync(docPath, 'utf8');
      assert.ok(content.includes('## 1. Identidad del Método'), `docs/${key}.md debe contener Sección 1: Identidad`);
      assert.ok(content.includes('## 2. Estructura de Pilares y Módulos'), `docs/${key}.md debe contener Sección 2: Estructura`);
      assert.ok(content.includes('## 3. Fórmulas y Modelos Cuantitativos'), `docs/${key}.md debe contener Sección 3: Fórmulas`);
      assert.ok(content.includes('## 4. Boxes Visuales'), `docs/${key}.md debe contener Sección 4: Boxes`);
      assert.ok(content.includes('## 5. Bibliografía y Citas Clave'), `docs/${key}.md debe contener Sección 5: Bibliografía`);
      assert.ok(content.length >= 1500, `docs/${key}.md debe ser un documento técnico detallado (>= 1,500 chars)`);
    }
  });

  await t.test('5. Integridad del Catálogo Maestro L4 y Auditoría de Cobertura', () => {
    const tablaPath = path.resolve('docs/tabla_modulo_prompt.md');
    const auditoriaPath = path.resolve('docs/INDICE_AUDITORIA.md');
    const tablasPorMetodoPath = path.resolve('libros/TABLAS_POR_METODO.md');

    assert.ok(fs.existsSync(tablaPath), 'docs/tabla_modulo_prompt.md debe existir');
    assert.ok(fs.existsSync(auditoriaPath), 'docs/INDICE_AUDITORIA.md debe existir');
    assert.ok(fs.existsSync(tablasPorMetodoPath), 'libros/TABLAS_POR_METODO.md debe existir');

    const tablaContent = fs.readFileSync(tablaPath, 'utf8');
    assert.ok(tablaContent.includes('TOTAL TEXTBOXES:'), 'Debe incluir el total de textboxes');
    assert.ok(tablaContent.length > 50000, 'docs/tabla_modulo_prompt.md debe ser exhaustivo (> 50KB)');
  });
});
