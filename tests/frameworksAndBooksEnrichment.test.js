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

  await t.test('6. Caps de longitud en prompts (instruccion <= 400, placeholder <= 80)', () => {
    for (const [fwKey, guides] of Object.entries(FIELD_GUIDES_MAP)) {
      for (const [fieldKey, guide] of Object.entries(guides)) {
        assert.ok(
          guide.instruccion.length <= 400,
          `La instrucción en ${fwKey}:${fieldKey} excede los 400 caracteres (${guide.instruccion.length})`
        );
        if (guide.placeholder) {
          assert.ok(
            guide.placeholder.length <= 80,
            `El placeholder en ${fwKey}:${fieldKey} excede los 80 caracteres (${guide.placeholder.length})`
          );
        }
      }
    }
  });

  await t.test('7. Cada campo nuevo tiene ejemplo resuelto con datos concretos', () => {
    for (const [fwKey, guides] of Object.entries(FIELD_GUIDES_MAP)) {
      for (const [fieldKey, guide] of Object.entries(guides)) {
        assert.ok(
          guide.ejemplo && guide.ejemplo.length >= 10,
          `El campo ${fwKey}:${fieldKey} debe incluir un ejemplo resuelto concreto`
        );
      }
    }
  });

  await t.test('8. Cada campo cuantitativo tiene benchmark numérico (>= 1 dígito)', () => {
    const quantitativeModules = [
      'metricas_aarrr', 'evaluacion_social_cuantitativa', 'innovation_accounting',
      'punto_equilibrio_micro', 'capex_csi_16', 'tornado_sensibilidad',
      'presupuesto_componentes', 'presupuesto_eu_microsoft', 'time_based_management',
      'riesgo_pais_cambiario', 'rentabilidad', 'estados_financieros'
    ];
    for (const [fwKey, fw] of Object.entries(FRAMEWORKS)) {
      const guides = FIELD_GUIDES_MAP[fwKey] || {};
      for (const pillar of fw.pillars) {
        for (const mod of pillar.modules) {
          if (quantitativeModules.includes(mod.key)) {
            for (const f of mod.fields) {
              const guide = guides[f] || FIELD_GUIDES_MAP.business[f];
              if (guide && guide.benchmark) {
                assert.ok(
                  /\d/.test(guide.benchmark),
                  `El benchmark cuantitativo ${fwKey}:${mod.key}:${f} debe incluir al menos un dígito numérico`
                );
              }
            }
          }
        }
      }
    }
  });

  await t.test('9. Cita apunta a libro existente en /libros/ o fuente canónica autorizada', () => {
    const validSources = [
      'Anatomy', 'Dummies', 'Lean Startup', 'Burn', 'Nature of Value',
      'QuickStart', 'Innovator', 'Panamá', 'Panama', 'Corporate Sustainability',
      'Entrenched', 'South-South', 'Diferenças', 'ZOPP', 'Hoshin',
      'Amoeba', 'ONUDI', 'INEGI', 'Trade Map', 'UN Comtrade', 'Christensen',
      'Inamori', 'Akao', 'Pinson', 'Osterwalder', 'Porter', 'Plan de Negocios VF',
      'Ries', 'Colwell', 'Schramm', 'Gogerty', 'Marino', 'GTZ', 'COMFAR',
      'Behrens', 'NOM', 'SENASICA', 'USDA', 'Horizon', 'UE', 'Guanxi',
      'Keller', 'Business Model Generation', 'Slack', 'Marco Lógico', 'BID',
      'CEPAL', 'PM4R', 'EIC', 'Toyota', 'Liker', 'Shook', 'Deming', 'Doerr',
      'Imai', 'Ho-Ren-So'
    ];
    for (const [fwKey, guides] of Object.entries(FIELD_GUIDES_MAP)) {
      for (const [fieldKey, guide] of Object.entries(guides)) {
        const hasValidSource = validSources.some(src => guide.cita.toLowerCase().includes(src.toLowerCase()));
        assert.ok(
          hasValidSource,
          `La cita "${guide.cita}" en ${fwKey}:${fieldKey} debe referenciar una obra del catálogo de libros técnicos`
        );
      }
    }
  });

  await t.test('10. CAPEX VCV agroindustrial = $16,800,000 MXN desglosado en sus 5 conceptos', () => {
    const vcvJsonPath = path.resolve('proyectos/negocios/vcv_cortes_finos_sa_de_cv/vcv_cortes_finos_sa_de_cv.json');
    assert.ok(fs.existsSync(vcvJsonPath), 'El JSON canónico de VCV debe existir');
    const vcv = JSON.parse(fs.readFileSync(vcvJsonPath, 'utf8'));

    const capex = vcv.presupuesto_obra?.capex_csi_16;
    assert.ok(capex, 'El módulo capex_csi_16 debe estar poblado en presupuesto_obra');
    assert.ok(capex.total_inversion_csi.includes('16,800,000'), 'El total de inversión debe ser $16,800,000 MXN');
    assert.ok(capex.division_csi_codigo.includes('6,500,000'), 'Debe incluir Nave TIF por $6,500,000 MXN');
    assert.ok(capex.division_csi_codigo.includes('3,750,000'), 'Debe incluir 5 Hornos ASADHOR por $3,750,000 MXN');
    assert.ok(capex.division_csi_codigo.includes('2,800,000'), 'Debe incluir Túnel IQF por $2,800,000 MXN');
    assert.ok(capex.division_csi_codigo.includes('1,450,000'), 'Debe incluir Cuartos Fríos por $1,450,000 MXN');
    assert.ok(capex.division_csi_codigo.includes('2,300,000'), 'Debe incluir Capital de Trabajo por $2,300,000 MXN');
  });

  await t.test('11. PlantFloorplan.jsx renderiza con viewBox calibrado a m² reales sin dependencias externas pesadas', () => {
    const floorplanPath = path.resolve('src/components/PlantFloorplan.jsx');
    assert.ok(fs.existsSync(floorplanPath), 'PlantFloorplan.jsx debe existir');
    const code = fs.readFileSync(floorplanPath, 'utf8');

    assert.ok(code.includes('viewBox'), 'Debe contener viewBox SVG');
    assert.ok(code.includes('1,200') || code.includes('1200'), 'Debe referenciar superficie de 1,200 m²');
    assert.ok(code.includes('40') && code.includes('30'), 'Debe calibrar dimensiones de 40m x 30m');
    assert.ok(!code.includes("from 'mermaid'") && !code.includes("from 'three'"), 'No debe importar mermaid ni three.js');
  });

  await t.test('12. DecisionFlow.jsx usa React Flow nativo sin dependencias externas extra', () => {
    const flowPath = path.resolve('src/components/DecisionFlow.jsx');
    assert.ok(fs.existsSync(flowPath), 'DecisionFlow.jsx debe existir');
    const code = fs.readFileSync(flowPath, 'utf8');

    assert.ok(code.includes("from 'reactflow'"), 'Debe importar reactflow');
    assert.ok(code.includes('RoadmapNode'), 'Debe implementar nodos personalizados');
    assert.ok(!code.includes("from 'mermaid'") && !code.includes("from 'three'"), 'No debe depender de mermaid ni three');
  });

  await t.test('13. Cascada de mercado: INEGI → Web Scraping → Comercio Exterior con TTL 24h', async () => {
    assert.ok(FRAMEWORKS.business.pillars.some(p => p.modules.some(m => m.key === 'inteligencia_mercado_cascada')), 'business debe tener inteligencia_mercado_cascada');
    assert.ok(FRAMEWORKS.investment_project.pillars.some(p => p.modules.some(m => m.key === 'inteligencia_mercado_cascada')), 'investment_project debe tener inteligencia_mercado_cascada');
    assert.ok(BOX_REGISTRY.business.some(b => b.id === 'box_cascada_mercado_3niveles'), 'box_cascada_mercado_3niveles debe estar registrado');

    const cascadeModule = await import('../server/routes/marketCascade.js');
    assert.ok(cascadeModule.ejecutarCascadaMercado, 'Debe exportar la función ejecutarCascadaMercado');
    const res = await cascadeModule.ejecutarCascadaMercado({
      projectId: 'test_cascade',
      query: 'test mercado',
      sector: 'servicios',
      ubicacion: 'Hermosillo, Sonora'
    });
    assert.ok(res.success, 'La cascada debe ejecutarse exitosamente');
    assert.ok(res.capaLocal, 'Debe contener Capa Local');
    assert.ok(res.capaNacional, 'Debe contener Capa Nacional');
    assert.ok(res.capaInternacional, 'Debe contener Capa Internacional');
  });

  await t.test('14. Motor de Exportación a Word (.docx) genera documento ejecutable y estructurado', async () => {
    const docxModule = await import('../src/lib/docxExportEngine.js');
    assert.ok(docxModule.buildDocxDocument, 'Debe exportar buildDocxDocument');
    assert.ok(docxModule.downloadProjectAsDocx, 'Debe exportar downloadProjectAsDocx');

    const vcvJsonPath = path.resolve('proyectos/negocios/vcv_cortes_finos_sa_de_cv/vcv_cortes_finos_sa_de_cv.json');
    const vcv = JSON.parse(fs.readFileSync(vcvJsonPath, 'utf8'));
    const doc = docxModule.buildDocxDocument(vcv);
    assert.ok(doc, 'Debe generar la instancia del documento docx');
  });
});
