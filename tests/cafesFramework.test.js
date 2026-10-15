import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { FRAMEWORKS } from '../src/config/frameworks.js';
import { FIELD_GUIDES_MAP, CAFES_UNISON_GUIDES } from '../src/lib/field_guides.js';
import { BOX_REGISTRY } from '../src/config/boxRegistry.js';
import { MODULE_BOX_MAP, getBoxIdsForModule } from '../src/config/moduleBoxMap.js';
import { FRAMEWORK_SLUG_MAP, REVERSE_FRAMEWORK_SLUG_MAP, buildSemanticUrl } from '../src/config/urlRouting.js';
import { classifyProject } from '../src/lib/classifyProject.js';
import { buildDocxDocument } from '../src/lib/docxExportEngine.js';

test('Plan de Negocios CAFES UNISON (Metodología Oficial a Secas) - TDD & ATDD Suite', async (t) => {
  const cafes = FRAMEWORKS.cafes_unison;

  await t.test('1. Definición Canónica e Identidad del Framework CAFES UNISON (9 Pilares A a I)', () => {
    assert.ok(cafes, 'El framework cafes_unison debe estar registrado en FRAMEWORKS');
    assert.equal(cafes.id, 'cafes_unison');
    assert.ok(cafes.name.includes('CAFES UNISON'), 'El nombre debe ser Plan de Negocios CAFES UNISON');
    assert.equal(cafes.pillars.length, 9, 'Debe contener exactamente 9 pilares (Unidades A a I, sin pilar extra de simulador OBP)');

    // Verificar retrocompatibilidad con el alias FRAMEWORKS.cafes
    assert.ok(FRAMEWORKS.cafes, 'FRAMEWORKS.cafes debe resolver transparentemente');
    assert.equal(FRAMEWORKS.cafes.id, 'cafes_unison');
  });

  await t.test('2. Fidelidad Estricta al Índice Docente: 9 Unidades, 15 Módulos y 22 Anexos', () => {
    const expectedPillars = [
      'unidad_a', 'unidad_b', 'unidad_c', 'unidad_d', 'unidad_e',
      'unidad_f', 'unidad_g', 'unidad_h', 'unidad_i'
    ];
    const actualPillarKeys = cafes.pillars.map(p => p.key);
    assert.deepEqual(actualPillarKeys, expectedPillars, 'Las 9 unidades académicas deben coincidir con la rúbrica docente');

    const academicModules = cafes.pillars
      .filter(p => p.key !== 'unidad_i')
      .reduce((acc, p) => acc + p.modules.length, 0);
    assert.equal(academicModules, 15, 'Debe haber exactamente 15 módulos académicos (0 al 14)');

    const totalModules = cafes.pillars.reduce((acc, p) => acc + p.modules.length, 0);
    assert.equal(totalModules, 16, 'Debe haber 16 módulos en total (15 académicos + Expediente de Anexos)');

    // Verificar módulos específicos del docente (0 a 14)
    const moduleKeys = cafes.pillars.flatMap(p => p.modules.map(m => m.key));
    assert.ok(moduleKeys.includes('resumen_ejecutivo'), 'Debe incluir 0. Resumen Ejecutivo');
    assert.ok(moduleKeys.includes('perfil_emprendedor'), 'Debe incluir 1. Perfil del Emprendedor y del Proyecto');
    assert.ok(moduleKeys.includes('idea_portafolio'), 'Debe incluir 2. Idea de Negocio y Portafolio');
    assert.ok(moduleKeys.includes('estudio_mercado'), 'Debe incluir 3. Estudio de Mercado Práctico');
    assert.ok(moduleKeys.includes('plan_operaciones'), 'Debe incluir 4. Plan de Operaciones y Producción');
    assert.ok(moduleKeys.includes('aspectos_legales'), 'Debe incluir 5. Aspectos Legales y Regulatorios');
    assert.ok(moduleKeys.includes('organizacion_talento'), 'Debe incluir 6. Organización y Talento');
    assert.ok(moduleKeys.includes('propuesta_valor_canvas'), 'Debe incluir 7. Propuesta de Valor y Modelo de Negocio');
    assert.ok(moduleKeys.includes('plan_comercial'), 'Debe incluir 8. Plan Comercial');
    assert.ok(moduleKeys.includes('plan_financiero'), 'Debe incluir 9. Plan Financiero');
    assert.ok(moduleKeys.includes('impacto_social_ambiental'), 'Debe incluir 10. Impacto Social, Familiar y Ambiental');
    assert.ok(moduleKeys.includes('matriz_riesgos'), 'Debe incluir 11. Matriz de Riesgos');
    assert.ok(moduleKeys.includes('plan_implementacion'), 'Debe incluir 12. Plan de Implementación');
    assert.ok(moduleKeys.includes('requerimiento_capital'), 'Debe incluir 13. Requerimiento de Capital Inicial');
    assert.ok(moduleKeys.includes('conclusiones_peticion'), 'Debe incluir 14. Conclusiones y Petición Formal');
    assert.ok(moduleKeys.includes('expediente_anexos'), 'Debe incluir Unidad I: Expediente de Anexos A1 a A22');
  });

  await t.test('3. Campos del Modelo Docente en Unidad A, B, C, F e I', () => {
    // Entrevista diagnóstica en Unidad A (sin modelos cuánticos forzados)
    const perfilFields = cafes.pillars.find(p => p.key === 'unidad_a')
      .modules.find(m => m.key === 'perfil_emprendedor').fields;
    assert.equal(perfilFields.length, 6, 'El perfil debe contar con exactamente los 6 incisos de la entrevista');
    assert.ok(perfilFields.includes('datos_identificacion'));
    assert.ok(perfilFields.includes('historia_motivacion'));
    assert.ok(perfilFields.includes('experiencia_habilidades'));
    assert.ok(perfilFields.includes('horario_apoyo_familiar'));
    assert.ok(perfilFields.includes('diagnostico_capacitacion'));
    assert.ok(perfilFields.includes('situacion_actual_negocio'));

    // Estimación conservadora en Unidad B
    const mercadoFields = cafes.pillars.find(p => p.key === 'unidad_b')
      .modules.find(m => m.key === 'estudio_mercado').fields;
    assert.ok(mercadoFields.includes('estimacion_demanda_conservadora'));

    // Cuello de botella y layout en Unidad C
    const operacionesFields = cafes.pillars.find(p => p.key === 'unidad_c')
      .modules.find(m => m.key === 'plan_operaciones').fields;
    assert.ok(operacionesFields.includes('capacidad_cuello_botella'));
    assert.ok(operacionesFields.includes('layout_espacio_trabajo'));

    // Plan financiero en Unidad F con B/C y Punto de Equilibrio
    const finanzasFields = cafes.pillars.find(p => p.key === 'unidad_f')
      .modules.find(m => m.key === 'plan_financiero').fields;
    assert.ok(finanzasFields.includes('indicadores_rentabilidad_bc_roi'));
    assert.ok(finanzasFields.includes('punto_equilibrio_unidades_pesos'));
    assert.ok(finanzasFields.includes('analisis_sensibilidad_escenarios'));

    // Checklist de Anexos A1 a A22 en Unidad I
    const anexosFields = cafes.pillars.find(p => p.key === 'unidad_i')
      .modules.find(m => m.key === 'expediente_anexos').fields;
    assert.equal(anexosFields.length, 23, 'Debe incluir checklist maestro + 22 anexos oficiales');
  });

  await t.test('4. Cobertura del 100% en FIELD_GUIDES_MAP para campos de CAFES UNISON', () => {
    const allFields = cafes.pillars.flatMap(p => p.modules.flatMap(m => m.fields));
    const guides = FIELD_GUIDES_MAP.cafes_unison;
    assert.ok(guides, 'FIELD_GUIDES_MAP.cafes_unison debe estar definido');

    for (const field of allFields) {
      const g = guides[field];
      assert.ok(g, `El campo ${field} de cafes_unison debe contar con guía de redacción`);
      assert.ok(g.instruccion, `El campo ${field} debe tener instrucción`);
      assert.ok(g.ejemplo, `El campo ${field} debe tener ejemplo`);
      assert.ok(g.benchmark, `El campo ${field} debe tener benchmark`);
      assert.ok(g.cita, `El campo ${field} debe tener cita`);
      assert.ok(g.placeholder, `El campo ${field} debe tener placeholder`);
    }
  });

  await t.test('5. Enrutamiento de URLs Semánticas para Plan CAFES UNISON', () => {
    assert.equal(FRAMEWORK_SLUG_MAP['plan-cafes'], 'cafes_unison');
    assert.equal(FRAMEWORK_SLUG_MAP['cafes-unison'], 'cafes_unison');
    assert.equal(FRAMEWORK_SLUG_MAP['cafes'], 'cafes_unison');
    assert.equal(REVERSE_FRAMEWORK_SLUG_MAP.cafes_unison, 'plan-cafes');

    const url = buildSemanticUrl({
      slug: 'Taller de Piñatas Doña Rosa',
      projectType: 'cafes_unison',
      moduleId: 'estudio_mercado'
    });
    assert.equal(url, '/plan-cafes/estudio_mercado/taller-de-pinatas-dona-rosa');
  });

  await t.test('6. Registro y Mapeo de Boxes Metodológicos para cafes_unison', () => {
    const boxes = BOX_REGISTRY.cafes_unison;
    assert.ok(Array.isArray(boxes) && boxes.length >= 5, 'Debe contar con al menos 5 boxes registrados');

    const boxIds = boxes.map(b => b.id);
    assert.ok(boxIds.includes('box_resumen_ejecutivo_1p'));
    assert.ok(boxIds.includes('box_canvas_osterwalder'));
    assert.ok(boxIds.includes('box_micro_croquis_2d'));
    assert.ok(boxIds.includes('box_punto_equilibrio_micro'));
    assert.ok(boxIds.includes('box_relacion_bc_payback'));

    const finanzasBoxes = getBoxIdsForModule('plan_financiero', 'cafes_unison');
    assert.ok(finanzasBoxes.includes('box_punto_equilibrio_micro'));
    assert.ok(finanzasBoxes.includes('box_relacion_bc_payback'));
  });

  await t.test('7. Clasificación Inteligente Heurística hacia cafes_unison', async () => {
    const res = await classifyProject({}, 'Queremos abrir un taller familiar de piñatas artesanales y repostería en Hermosillo con el programa cafes unison y saeta');
    assert.equal(res.frameworkId, 'cafes_unison');
    assert.ok(res.reasoning.includes('CAFES UNISON'));
  });

  await t.test('8. Rigor de Documentación Arquitectónica y Técnica (SDD y Guía L3)', () => {
    const sddPath = path.resolve('docs/architecture/SDD_METODOLOGIA_CAFES.md');
    assert.ok(fs.existsSync(sddPath));
    const sddContent = fs.readFileSync(sddPath, 'utf8');
    assert.ok(sddContent.includes('cafes_unison'));

    const l3Path = path.resolve('docs/cafes.md');
    assert.ok(fs.existsSync(l3Path));
    const l3Content = fs.readFileSync(l3Path, 'utf8');
    assert.ok(l3Content.includes('## 1. Identidad del Método'));
    assert.ok(l3Content.includes('## 2. Estructura de Pilares y Módulos'));
    assert.ok(l3Content.includes('## 3. Fórmulas y Modelos Cuantitativos'));
    assert.ok(l3Content.includes('## 4. Boxes Visuales'));
    assert.ok(l3Content.includes('## 5. Bibliografía y Citas Clave'));
  });

  await t.test('9. Motor de Exportación a Microsoft Word (.docx) para Proyecto CAFES UNISON', async () => {
    const mockCafesProject = {
      config: {
        nombre_proyecto: 'Piñata Popular Hermosillo',
        tipoDoc: 'cafes_unison',
        tipo_proyecto: 'Artesanías y Oficios'
      },
      semilla: {
        nombre_proyecto: 'Piñata Popular Hermosillo',
        inversion_esperada: '25000'
      },
      unidad_a: {
        resumen_ejecutivo: {
          descripcion_situacion_actual: 'Taller familiar de piñatas en el patio trasero de la colonia San Benito.',
          capital_semilla_resumen: '$25,000 MXN para mesa de corte, secador y materias primas.'
        },
        perfil_emprendedor: {
          datos_identificacion: 'Familia Morales, Hermosillo, Sonora.',
          historia_motivacion: 'Tradición familiar de elaboración de piñatas de 5 picos.'
        }
      },
      unidad_f: {
        plan_financiero: {
          punto_equilibrio_unidades_pesos: '45 piñatas mensuales ($13,500 MXN).',
          indicadores_rentabilidad_bc_roi: 'B/C de 1.25 y retorno en 10 meses.'
        }
      }
    };

    const doc = buildDocxDocument(mockCafesProject);
    assert.ok(doc, 'Debe generar una instancia válida de docx.Document');
  });
});
