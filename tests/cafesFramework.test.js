import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { FRAMEWORKS } from '../src/config/frameworks.js';
import { FIELD_GUIDES_MAP, CAFES_GUIDES } from '../src/lib/field_guides.js';
import { BOX_REGISTRY } from '../src/config/boxRegistry.js';
import { MODULE_BOX_MAP, getBoxIdsForModule } from '../src/config/moduleBoxMap.js';
import { FRAMEWORK_SLUG_MAP, REVERSE_FRAMEWORK_SLUG_MAP, buildSemanticUrl } from '../src/config/urlRouting.js';
import { classifyProject } from '../src/lib/classifyProject.js';
import { buildDocxDocument } from '../src/lib/docxExportEngine.js';

test('Plan de Negocios CAFES (UNISON / SAETA) - TDD & ATDD Test Suite', async (t) => {
  const cafes = FRAMEWORKS.cafes;

  await t.test('1. Definición Canónica e Identidad del Framework CAFES', () => {
    assert.ok(cafes, 'El framework cafes debe estar registrado en FRAMEWORKS');
    assert.equal(cafes.id, 'cafes');
    assert.ok(cafes.name.includes('CAFES'), 'El nombre debe hacer referencia a CAFES');
    assert.ok(cafes.name.includes('Emprendimiento Social y Familiar'));
    assert.equal(cafes.pillars.length, 10, 'Debe contener 10 pilares (9 Unidades A a I + Simulador)');
  });

  await t.test('2. Fidelidad a las 9 Unidades del Docente y 15 Módulos Académicos', () => {
    const expectedPillars = [
      'unidad_a', 'unidad_b', 'unidad_c', 'unidad_d', 'unidad_e',
      'unidad_f', 'unidad_g', 'unidad_h', 'unidad_i', 'simulador_financiero'
    ];
    const actualPillarKeys = cafes.pillars.map(p => p.key);
    assert.deepEqual(actualPillarKeys, expectedPillars, 'Las claves de los pilares deben coincidir exactamente');

    const academicModules = cafes.pillars
      .filter(p => p.key !== 'unidad_i' && p.key !== 'simulador_financiero')
      .reduce((acc, p) => acc + p.modules.length, 0);
    assert.equal(academicModules, 15, 'Debe haber exactamente 15 módulos académicos (0 al 14)');

    const totalModules = cafes.pillars.reduce((acc, p) => acc + p.modules.length, 0);
    assert.equal(totalModules, 17, 'Debe haber 17 módulos en total incluyendo Expediente de Anexos y Simulador');

    // Verificar módulos específicos del docente (0 a 14)
    const moduleKeys = cafes.pillars.flatMap(p => p.modules.map(m => m.key));
    assert.ok(moduleKeys.includes('resumen_ejecutivo'), 'Debe incluir 0. Resumen Ejecutivo');
    assert.ok(moduleKeys.includes('perfil_emprendedor'), 'Debe incluir 1. Perfil del Emprendedor');
    assert.ok(moduleKeys.includes('idea_portafolio'), 'Debe incluir 2. Idea de Negocio y Portafolio');
    assert.ok(moduleKeys.includes('estudio_mercado'), 'Debe incluir 3. Estudio de Mercado');
    assert.ok(moduleKeys.includes('plan_operaciones'), 'Debe incluir 4. Plan de Operaciones');
    assert.ok(moduleKeys.includes('aspectos_legales'), 'Debe incluir 5. Aspectos Legales');
    assert.ok(moduleKeys.includes('organizacion_talento'), 'Debe incluir 6. Organización y Talento');
    assert.ok(moduleKeys.includes('propuesta_valor_canvas'), 'Debe incluir 7. Propuesta de Valor y Canvas');
    assert.ok(moduleKeys.includes('plan_comercial'), 'Debe incluir 8. Plan Comercial');
    assert.ok(moduleKeys.includes('plan_financiero'), 'Debe incluir 9. Plan Financiero');
    assert.ok(moduleKeys.includes('impacto_social_ambiental'), 'Debe incluir 10. Impacto Social y Ambiental');
    assert.ok(moduleKeys.includes('matriz_riesgos'), 'Debe incluir 11. Matriz de Riesgos');
    assert.ok(moduleKeys.includes('plan_implementacion'), 'Debe incluir 12. Plan de Implementación');
    assert.ok(moduleKeys.includes('requerimiento_capital'), 'Debe incluir 13. Requerimiento de Capital Semilla');
    assert.ok(moduleKeys.includes('conclusiones_peticion'), 'Debe incluir 14. Conclusiones y Petición Formal');
    assert.ok(moduleKeys.includes('expediente_anexos'), 'Debe incluir Unidad I: Expediente de Anexos A1 a A22');
    assert.ok(moduleKeys.includes('simulador'), 'Debe incluir Módulo de Simulador Financiero');
  });

  await t.test('3. Integración de Brechas Críticas (Modelo Atómico, TAM/SAM/SOM, VAN/TIR, TOC)', () => {
    // Modelo Atómico y Ruta de Independencia en Unidad A
    const perfilFields = cafes.pillars.find(p => p.key === 'unidad_a')
      .modules.find(m => m.key === 'perfil_emprendedor').fields;
    assert.ok(perfilFields.includes('modelo_atomico_evaluacion'), 'Debe evaluar las 3 áreas del Modelo Atómico');
    assert.ok(perfilFields.includes('plan_delegacion_cuantica'), 'Debe incluir plan de delegación cuántica');
    assert.ok(perfilFields.includes('ruta_independencia_fundador'), 'Debe incluir ruta de independencia del fundador');

    // TAM/SAM/SOM en Unidad B
    const mercadoFields = cafes.pillars.find(p => p.key === 'unidad_b')
      .modules.find(m => m.key === 'estudio_mercado').fields;
    assert.ok(mercadoFields.includes('estimacion_demanda_tam_sam_som'), 'Debe incluir cálculo cuantitativo TAM/SAM/SOM');

    // Teoría de Restricciones (TOC) y Layout en Unidad C
    const operacionesFields = cafes.pillars.find(p => p.key === 'unidad_c')
      .modules.find(m => m.key === 'plan_operaciones').fields;
    assert.ok(operacionesFields.includes('capacidad_cuello_botella_toc'), 'Debe gestionar cuello de botella bajo TOC');
    assert.ok(operacionesFields.includes('layout_espacio_trabajo'), 'Debe incluir layout de espacio de trabajo');

    // Rentabilidad (B/C, TIR, VAN, Sensibilidad) en Unidad F
    const finanzasFields = cafes.pillars.find(p => p.key === 'unidad_f')
      .modules.find(m => m.key === 'plan_financiero').fields;
    assert.ok(finanzasFields.includes('indicadores_rentabilidad_bc_roi_van_tir'), 'Debe calcular B/C, ROI, VAN y TIR');
    assert.ok(finanzasFields.includes('punto_equilibrio_unidades_pesos'), 'Debe calcular Punto de Equilibrio');
    assert.ok(finanzasFields.includes('analisis_sensibilidad_escenarios'), 'Debe incluir análisis de sensibilidad');

    // Checklist de Anexos A1 a A22 en Unidad I
    const anexosFields = cafes.pillars.find(p => p.key === 'unidad_i')
      .modules.find(m => m.key === 'expediente_anexos').fields;
    assert.equal(anexosFields.length, 23, 'Debe incluir checklist maestro + los 22 anexos documentales (A1 a A22)');
    assert.ok(anexosFields.includes('checklist_expediente_completo'));
    assert.ok(anexosFields.includes('identificaciones_comprobantes_a1'));
    assert.ok(anexosFields.includes('constancias_capacitacion_a22'));
  });

  await t.test('4. Cobertura del 100% en FIELD_GUIDES_MAP para los 131 campos de CAFES', () => {
    const cafesGuides = FIELD_GUIDES_MAP.cafes;
    assert.ok(cafesGuides, 'FIELD_GUIDES_MAP.cafes debe existir');
    assert.ok(CAFES_GUIDES, 'CAFES_GUIDES exportado debe existir');

    let totalFields = 0;
    for (const pillar of cafes.pillars) {
      for (const mod of pillar.modules) {
        for (const field of mod.fields) {
          totalFields++;
          const guide = cafesGuides[field];
          assert.ok(guide, `El campo ${pillar.key}.${mod.key}.${field} debe tener una guía definida`);
          assert.ok(guide.instruccion && guide.instruccion.length >= 15, `Instrucción sustantiva en ${field}`);
          assert.ok(guide.ejemplo && guide.ejemplo.length >= 10, `Ejemplo concreto en ${field}`);
          assert.ok(guide.benchmark && guide.benchmark.length >= 5, `Benchmark medible en ${field}`);
          assert.ok(guide.cita && guide.cita.length >= 3, `Cita bibliográfica en ${field}`);
          assert.ok(guide.placeholder && guide.placeholder.length >= 5, `Placeholder en ${field}`);
        }
      }
    }
    assert.equal(totalFields, 131, 'Debe auditar exactamente 131 campos en total');
  });

  await t.test('5. Enrutamiento de URLs Semánticas Institucionales', () => {
    assert.equal(FRAMEWORK_SLUG_MAP['cafes'], 'cafes');
    assert.equal(FRAMEWORK_SLUG_MAP['plan-cafes'], 'cafes');
    assert.equal(FRAMEWORK_SLUG_MAP['metodo-cafes'], 'cafes');
    assert.equal(REVERSE_FRAMEWORK_SLUG_MAP['cafes'], 'plan-cafes');

    const semanticUrl = buildSemanticUrl({
      projectType: 'cafes',
      moduleId: 'estudio_mercado',
      slug: 'pasteleria-dulce-hogar'
    });
    assert.equal(semanticUrl, '/plan-cafes/estudio_mercado/pasteleria-dulce-hogar');
  });

  await t.test('6. Registro y Mapeo de Boxes Metodológicos Interactivos', () => {
    const boxes = BOX_REGISTRY.cafes;
    assert.ok(Array.isArray(boxes) && boxes.length >= 6, 'Debe tener al menos 6 boxes en BOX_REGISTRY.cafes');

    // Verificar mapeo en MODULE_BOX_MAP
    assert.ok(MODULE_BOX_MAP['cafes:resumen_ejecutivo']?.includes('box_resumen_ejecutivo_1p'));
    assert.ok(MODULE_BOX_MAP['cafes:estudio_mercado']?.includes('box_tam_sam_som'));
    assert.ok(MODULE_BOX_MAP['cafes:plan_operaciones']?.includes('box_kpi_otd_dso_dio_ccc'));
    assert.ok(MODULE_BOX_MAP['cafes:plan_operaciones']?.includes('box_micro_croquis_2d'));
    assert.ok(MODULE_BOX_MAP['cafes:propuesta_valor_canvas']?.includes('box_canvas_osterwalder'));
    assert.ok(MODULE_BOX_MAP['cafes:plan_financiero']?.includes('box_wacc_van_tir'));
    assert.ok(MODULE_BOX_MAP['cafes:plan_financiero']?.includes('box_punto_equilibrio_micro'));
    assert.ok(MODULE_BOX_MAP['cafes:plan_financiero']?.includes('box_montecarlo_sim'));
    assert.ok(MODULE_BOX_MAP['cafes:simulador']?.includes('box_montecarlo_sim'));

    const financialBoxes = getBoxIdsForModule('plan_financiero', 'cafes');
    assert.ok(financialBoxes.includes('box_wacc_van_tir'), 'Debe resolver boxes mediante getBoxIdsForModule');
  });

  await t.test('7. Clasificación Inteligente Heurística del Proyecto', async () => {
    const testCases = [
      'Taller familiar de piñatas artesanales y coronas de muertos para apoyo en la colonia.',
      'Queremos poner una repostería casera con apoyo de la asesoría de CAFES UNISON y SAETA.',
      'Emprendimiento familiar de cocina económica para generar autoempleo en Hermosillo.'
    ];

    for (const text of testCases) {
      const res = await classifyProject({}, text);
      assert.equal(res.frameworkId, 'cafes', `El texto "${text}" debe ser clasificado en el framework cafes`);
      assert.ok(res.confidence >= 0.8, 'Confianza mínima de clasificación >= 0.8');
    }
  });

  await t.test('8. Rigor de Documentación Arquitectónica y Técnica (SDD y Guía L3)', () => {
    const sddPath = path.resolve('docs/architecture/SDD_METODOLOGIA_CAFES.md');
    const docPath = path.resolve('docs/cafes.md');

    assert.ok(fs.existsSync(sddPath), 'docs/architecture/SDD_METODOLOGIA_CAFES.md debe existir');
    assert.ok(fs.existsSync(docPath), 'docs/cafes.md debe existir');

    const sddContent = fs.readFileSync(sddPath, 'utf8');
    assert.ok(sddContent.includes('## 1. Identificación y Propósito del Sistema'));
    assert.ok(sddContent.includes('## 2. Metodologías de Desarrollo Aplicadas'));
    assert.ok(sddContent.includes('SLI-1: Latencia de Renderizado'));

    const docContent = fs.readFileSync(docPath, 'utf8');
    assert.ok(docContent.includes('## 1. Identidad del Método'));
    assert.ok(docContent.includes('## 2. Estructura de Pilares y Módulos'));
    assert.ok(docContent.includes('## 3. Fórmulas y Modelos Cuantitativos'));
    assert.ok(docContent.includes('## 4. Boxes Visuales'));
    assert.ok(docContent.includes('## 5. Bibliografía y Citas Clave'));
    assert.ok(docContent.length >= 2000, 'docs/cafes.md debe ser exhaustivo (>= 2,000 chars)');
  });

  await t.test('9. Motor de Exportación a Microsoft Word (.docx) para Proyecto CAFES', async () => {
    const mockCafesProject = {
      config: {
        nombre_proyecto: 'Repostería Artesanal Dulce Hogar',
        tipoDoc: 'cafes',
        tipo_proyecto: 'Alimentos y Bebidas'
      },
      semilla: {
        nombre_proyecto: 'Repostería Artesanal Dulce Hogar',
        inversion_esperada: '35000'
      },
      unidad_a: {
        resumen_ejecutivo: {
          descripcion_situacion_actual: 'Taller familiar de repostería operando desde casa con 20 clientes fijos.',
          capital_semilla_resumen: '$35,000 MXN para horno industrial y mesa de acero.'
        },
        perfil_emprendedor: {
          datos_identificacion: 'María Elena Morales Ruiz, Hermosillo, Sonora.',
          modelo_atomico_evaluacion: 'Fuerte en Operativo, delegación en Finanzas y Ventas.'
        }
      },
      unidad_f: {
        plan_financiero: {
          punto_equilibrio_unidades_pesos: '105 pasteles al mes ($26,250 MXN).',
          indicadores_rentabilidad_bc_roi_van_tir: 'B/C de 1.34, TIR de 34.8% y VAN de $42,850 MXN.'
        }
      }
    };

    const doc = buildDocxDocument(mockCafesProject);
    assert.ok(doc, 'Debe generar una instancia válida de docx.Document');
  });
});
