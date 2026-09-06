import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { FRAMEWORKS } from '../src/config/frameworks.js';
import { countPopulatedModules } from '../src/lib/serverUtils/saveVersioning.js';

test('CCI - Suite Integral de 12 Metodologías y Consistencia de Datos RAG', async (t) => {
  const cciJsonPath = path.resolve('proyectos/negocios/comercio_cu_ntico_internacional_tr_sapi_de_cv/comercio_cu_ntico_internacional_tr_sapi_de_cv.json');
  const cciMdPath = path.resolve('proyectos/negocios/comercio_cu_ntico_internacional_tr_sapi_de_cv/comercio_cu_ntico_internacional_tr_sapi_de_cv.md');

  assert.ok(fs.existsSync(cciJsonPath), 'El archivo JSON de CCI debe existir');
  assert.ok(fs.existsSync(cciMdPath), 'El archivo Markdown (.md) sincronizado de CCI debe existir');

  const cci = JSON.parse(fs.readFileSync(cciJsonPath, 'utf8'));

  await t.test('1. Cobertura del 100% de los campos en las 12 metodologías canónicas', () => {
    const allFrameworkKeys = [
      'business', 'social_bid', 'agile_startup', 'technology_id',
      'micro_business', 'investment_project', 'zopp', 'horizon_europe',
      'hoshin_kanri', 'amoeba_management', 'guanxi_plan', 'onudi_project'
    ];

    assert.equal(Object.keys(FRAMEWORKS).length, 12, 'Deben existir exactamente 12 metodologías canónicas');

    for (const fwKey of allFrameworkKeys) {
      const fw = FRAMEWORKS[fwKey];
      assert.ok(fw, `El framework ${fwKey} debe estar definido`);

      for (const pillar of fw.pillars) {
        for (const mod of pillar.modules) {
          for (const field of mod.fields) {
            const val = cci[pillar.key]?.[mod.key]?.[field];
            assert.ok(
              val !== undefined && val !== null && String(val).trim().length >= 3,
              `El campo ${pillar.key}.${mod.key}.${field} del framework ${fwKey} debe estar poblado con datos válidos`
            );
          }
        }
      }
    }
  });

  await t.test('2. Fidelidad y rigor de las cifras financieras del RAG de CCI', () => {
    // CAPEX / Inversión Inicial
    assert.equal(cci.semilla?.inversion_esperada, '20000000');
    assert.equal(cci.organizacion?.estados_financieros?.amortizacion_creditos.includes('Serie B'), true);

    // Indicadores clave
    assert.ok(cci.organizacion?.rentabilidad?.indicadores.includes('15.11%'), 'Debe incluir la TIR del 15.11%');
    assert.ok(cci.organizacion?.rentabilidad?.indicadores.includes('1,836,412.50'), 'Debe incluir el VAN de $1.83M');
    assert.ok(cci.organizacion?.rentabilidad?.punto_equilibrio.includes('641,666'), 'Debe reflejar el punto de equilibrio de $641k/mes');
    assert.ok(cci.organizacion?.rentabilidad?.relacion_bc.includes('1.092'), 'Debe reflejar la relación B/C de 1.092');

    // Matriz de personal y nómina IMSS
    assert.equal(Array.isArray(cci.organizacion?.estructura?.puestos_lista), true);
    assert.equal(cci.organizacion?.estructura?.puestos_lista.length, 14);
    assert.ok(cci.organizacion?.recursos_humanos?.sueldos.includes('32%'), 'Debe incluir la carga patronal del 32%');
  });

  await t.test('3. Metodología Empresas Cuánticas y Modelo Atómico', () => {
    // Validar desconexión de fusión atómica y delegación clara
    const puestos = cci.organizacion?.estructura?.puestos_lista;
    const ceo = puestos.find(p => p.puesto.includes('CEO'));
    const coo = puestos.find(p => p.puesto.includes('Operaciones'));
    const cfo = puestos.find(p => p.puesto.includes('Finanzas'));

    assert.ok(ceo, 'Debe existir Dirección General');
    assert.ok(coo, 'Debe existir Gerencia de Operaciones delegada');
    assert.ok(cfo, 'Debe existir Gerencia de Finanzas delegada');
    assert.notEqual(ceo.sueldoBase, 0);
    assert.notEqual(coo.sueldoBase, 0);
    assert.notEqual(cfo.sueldoBase, 0);
  });

  await t.test('4. Anti-Regresión y Conteo de Módulos Poblados', () => {
    const modulesCount = countPopulatedModules(cci);
    assert.ok(modulesCount >= 40, `El plan debe tener un número robusto de módulos poblados (actual: ${modulesCount})`);
  });

  await t.test('5. Sincronización íntegra del archivo Markdown', () => {
    const mdContent = fs.readFileSync(cciMdPath, 'utf8');
    assert.ok(mdContent.includes('# Plan de Negocios Maestro: Comercio Cuántico Internacional TR SAPI de CV'));
    assert.ok(mdContent.includes('business, social_bid, agile_startup'));
    assert.ok(mdContent.includes('$20,000,000 MXN'));
    assert.ok(mdContent.includes('Pilar: NATURALEZA'));
    assert.ok(mdContent.includes('Pilar: ORGANIZACION'));
    assert.ok(mdContent.includes('Pilar: INNOVACION'));
    assert.ok(mdContent.includes('Pilar: VISION_LARGO_PLAZO'));
    assert.ok(mdContent.includes('Pilar: ESTRUCTURACION_CELULAS'));
  });
});
