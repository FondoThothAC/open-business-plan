import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { FRAMEWORKS } from '../src/config/frameworks.js';
import { FIELD_GUIDES_MAP, BOB_UNISON_GUIDES } from '../src/lib/field_guides.js';
import { BOX_REGISTRY } from '../src/config/boxRegistry.js';
import { MODULE_BOX_MAP, getBoxIdsForModule } from '../src/config/moduleBoxMap.js';
import { FRAMEWORK_SLUG_MAP, REVERSE_FRAMEWORK_SLUG_MAP, buildSemanticUrl } from '../src/config/urlRouting.js';
import { classifyProject } from '../src/lib/classifyProject.js';
import { buildDocxDocument } from '../src/lib/docxExportEngine.js';

test('Método Bob 1 UNISON (OBP + Empresas Cuánticas) - TDD & ATDD Test Suite', async (t) => {
  const bob = FRAMEWORKS.bob_unison;

  await t.test('1. Definición Canónica e Identidad del Framework Método Bob 1 UNISON', () => {
    assert.ok(bob, 'El framework bob_unison debe estar registrado en FRAMEWORKS');
    assert.equal(bob.id, 'bob_unison');
    assert.ok(bob.name.includes('Bob 1 UNISON'), 'El nombre debe hacer referencia a Método Bob 1 UNISON');
    assert.ok(bob.name.includes('Empresas Cuánticas'), 'Debe incluir Empresas Cuánticas');
    assert.equal(bob.pillars.length, 10, 'Debe contener 10 pilares (9 Unidades A a I + Simulador Financiero)');
  });

  await t.test('2. Fidelidad a las 9 Unidades Enriquecidas y Simulador Cuántico', () => {
    const expectedPillars = [
      'unidad_a', 'unidad_b', 'unidad_c', 'unidad_d', 'unidad_e',
      'unidad_f', 'unidad_g', 'unidad_h', 'unidad_i', 'simulador_financiero'
    ];
    const actualPillarKeys = bob.pillars.map(p => p.key);
    assert.deepEqual(actualPillarKeys, expectedPillars, 'Las claves de los pilares deben coincidir exactamente');

    const totalModules = bob.pillars.reduce((acc, p) => acc + p.modules.length, 0);
    assert.equal(totalModules, 17, 'Debe haber 17 módulos en total');

    const moduleKeys = bob.pillars.flatMap(p => p.modules.map(m => m.key));
    assert.ok(moduleKeys.includes('resumen_ejecutivo'));
    assert.ok(moduleKeys.includes('perfil_emprendedor'));
    assert.ok(moduleKeys.includes('idea_portafolio'));
    assert.ok(moduleKeys.includes('estudio_mercado'));
    assert.ok(moduleKeys.includes('plan_operaciones'));
    assert.ok(moduleKeys.includes('aspectos_legales'));
    assert.ok(moduleKeys.includes('organizacion_talento'));
    assert.ok(moduleKeys.includes('propuesta_valor_canvas'));
    assert.ok(moduleKeys.includes('plan_comercial'));
    assert.ok(moduleKeys.includes('plan_financiero'));
    assert.ok(moduleKeys.includes('impacto_social_ambiental'));
    assert.ok(moduleKeys.includes('matriz_riesgos'));
    assert.ok(moduleKeys.includes('plan_implementacion'));
    assert.ok(moduleKeys.includes('requerimiento_capital'));
    assert.ok(moduleKeys.includes('conclusiones_peticion'));
    assert.ok(moduleKeys.includes('expediente_anexos'));
    assert.ok(moduleKeys.includes('simulador'));
  });

  await t.test('3. Integración de Brechas Críticas (Modelo Atómico, TAM/SAM/SOM, VAN/TIR, TOC)', () => {
    // Modelo Atómico y Ruta de Independencia en Unidad A
    const perfilFields = bob.pillars.find(p => p.key === 'unidad_a')
      .modules.find(m => m.key === 'perfil_emprendedor').fields;
    assert.ok(perfilFields.includes('modelo_atomico_evaluacion'), 'Debe evaluar las 3 áreas del Modelo Atómico');
    assert.ok(perfilFields.includes('plan_delegacion_cuantica'), 'Debe incluir plan de delegación cuántica');
    assert.ok(perfilFields.includes('ruta_independencia_fundador'), 'Debe incluir ruta de independencia del fundador');

    // TAM/SAM/SOM en Unidad B
    const mercadoFields = bob.pillars.find(p => p.key === 'unidad_b')
      .modules.find(m => m.key === 'estudio_mercado').fields;
    assert.ok(mercadoFields.includes('estimacion_demanda_tam_sam_som'), 'Debe incluir TAM/SAM/SOM formal');

    // TOC / Cuello de botella en Unidad C
    const operacionesFields = bob.pillars.find(p => p.key === 'unidad_c')
      .modules.find(m => m.key === 'plan_operaciones').fields;
    assert.ok(operacionesFields.includes('capacidad_cuello_botella_toc'), 'Debe incluir cuello de botella bajo TOC');

    // VAN/TIR en Unidad F
    const finanzasFields = bob.pillars.find(p => p.key === 'unidad_f')
      .modules.find(m => m.key === 'plan_financiero').fields;
    assert.ok(finanzasFields.includes('indicadores_rentabilidad_bc_roi_van_tir'), 'Debe incluir VAN/TIR en Unidad F');

    // Módulo de simulación
    const simuladorFields = bob.pillars.find(p => p.key === 'simulador_financiero')
      .modules.find(m => m.key === 'simulador').fields;
    assert.ok(simuladorFields.includes('iframe_simulador'), 'Debe incluir iframe del simulador financiero');
  });

  await t.test('4. Cobertura del 100% en FIELD_GUIDES_MAP para bob_unison', () => {
    const allFields = bob.pillars.flatMap(p => p.modules.flatMap(m => m.fields));
    assert.ok(allFields.length > 100, 'Debe haber más de 100 campos');

    const bobGuides = FIELD_GUIDES_MAP.bob_unison;
    assert.ok(bobGuides, 'Debe existir BOB_UNISON_GUIDES en FIELD_GUIDES_MAP');

    for (const field of allFields) {
      const guide = bobGuides[field];
      assert.ok(guide, `El campo ${field} de bob_unison debe tener guía de redacción`);
      assert.ok(guide.instruccion, `El campo ${field} debe tener instrucción`);
      assert.ok(guide.ejemplo, `El campo ${field} debe tener ejemplo`);
      assert.ok(guide.benchmark, `El campo ${field} debe tener benchmark`);
      assert.ok(guide.cita, `El campo ${field} debe tener cita`);
      assert.ok(guide.placeholder, `El campo ${field} debe tener placeholder`);
    }
  });

  await t.test('5. Enrutamiento de URLs Semánticas para Método Bob 1 UNISON', () => {
    assert.equal(FRAMEWORK_SLUG_MAP['metodo-bob'], 'bob_unison');
    assert.equal(FRAMEWORK_SLUG_MAP['bob-unison'], 'bob_unison');
    assert.equal(FRAMEWORK_SLUG_MAP['bob1-unison'], 'bob_unison');
    assert.equal(REVERSE_FRAMEWORK_SLUG_MAP.bob_unison, 'metodo-bob');

    const url = buildSemanticUrl({
      slug: 'Taller Cuántico Viktor Acuña',
      projectType: 'bob_unison',
      moduleId: 'plan_operaciones'
    });
    assert.equal(url, '/metodo-bob/plan_operaciones/taller-cuantico-viktor-acuna');
  });

  await t.test('6. Registro y Mapeo de Boxes Metodológicos Interactivos para bob_unison', () => {
    const boxes = BOX_REGISTRY.bob_unison;
    assert.ok(Array.isArray(boxes) && boxes.length >= 8, 'bob_unison debe contar con al menos 8 boxes registrados');

    const boxIds = boxes.map(b => b.id);
    assert.ok(boxIds.includes('box_resumen_ejecutivo_1p'));
    assert.ok(boxIds.includes('box_tam_sam_som'));
    assert.ok(boxIds.includes('box_canvas_osterwalder'));
    assert.ok(boxIds.includes('box_micro_croquis_2d'));
    assert.ok(boxIds.includes('box_kpi_otd_dso_dio_ccc'));
    assert.ok(boxIds.includes('box_punto_equilibrio_micro'));
    assert.ok(boxIds.includes('box_wacc_van_tir'));
    assert.ok(boxIds.includes('box_montecarlo_sim'));

    const finanzasBoxes = getBoxIdsForModule('plan_financiero', 'bob_unison');
    assert.ok(finanzasBoxes.includes('box_punto_equilibrio_micro'));
    assert.ok(finanzasBoxes.includes('box_wacc_van_tir'));
    assert.ok(finanzasBoxes.includes('box_montecarlo_sim'));
  });

  await t.test('7. Clasificación Inteligente Heurística hacia bob_unison', async () => {
    const res = await classifyProject({}, 'Quiero desarrollar un proyecto con el metodo bob y el modelo atomico cuántico de 3 áreas');
    assert.equal(res.frameworkId, 'bob_unison');
    assert.ok(res.reasoning.includes('Método Bob 1 UNISON'));
  });

  await t.test('8. Rigor de Documentación Arquitectónica y Técnica (SDD y Guía L3)', () => {
    const sddPath = path.resolve('docs/architecture/SDD_METODOLOGIA_CAFES.md');
    assert.ok(fs.existsSync(sddPath));
    const sddContent = fs.readFileSync(sddPath, 'utf8');
    assert.ok(sddContent.includes('bob_unison'));

    const l3Path = path.resolve('docs/bob_unison.md');
    assert.ok(fs.existsSync(l3Path));
    const l3Content = fs.readFileSync(l3Path, 'utf8');
    assert.ok(l3Content.includes('## 1. Identidad del Método'));
    assert.ok(l3Content.includes('## 2. Estructura de Pilares y Módulos'));
    assert.ok(l3Content.includes('## 3. Fórmulas y Modelos Cuantitativos'));
    assert.ok(l3Content.includes('## 4. Boxes Visuales'));
    assert.ok(l3Content.includes('## 5. Bibliografía y Citas Clave'));
  });

  await t.test('9. Motor de Exportación a Microsoft Word (.docx) para Proyecto bob_unison', async () => {
    const mockBobProject = {
      config: {
        nombre_proyecto: 'Closets y Cocinas Corona Cuántico',
        tipoDoc: 'bob_unison',
        tipo_proyecto: 'Manufactura y Carpintería'
      },
      semilla: {
        nombre_proyecto: 'Closets y Cocinas Corona Cuántico',
        inversion_esperada: '150000'
      },
      unidad_a: {
        resumen_ejecutivo: {
          descripcion_situacion_actual: 'Taller de fabricación de muebles sobre diseño en Hermosillo.',
          capital_semilla_resumen: '$150,000 MXN para sierra escuadradora y canteadora.'
        },
        perfil_emprendedor: {
          datos_identificacion: 'Viktor Acuña, Hermosillo, Sonora.',
          modelo_atomico_evaluacion: 'Experto en Operaciones, delegación en Finanzas y Ventas.',
          ruta_independencia_fundador: 'Meta de 12 meses para autonomía operativa.'
        }
      },
      unidad_f: {
        plan_financiero: {
          punto_equilibrio_unidades_pesos: '$45,000 MXN mensuales.',
          indicadores_rentabilidad_bc_roi_van_tir: 'B/C de 1.45, TIR de 38% y VAN positivo.'
        }
      }
    };

    const doc = buildDocxDocument(mockBobProject);
    assert.ok(doc, 'Debe generar una instancia válida de docx.Document');
  });
});
