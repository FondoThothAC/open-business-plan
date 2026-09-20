import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { FRAMEWORKS } from '../src/config/frameworks.js';

describe('VCV Cortes Finos SA de CV - Consolidación y Calibración Financiera', () => {
  const jsonPath = path.resolve('proyectos/negocios/vcv_cortes_finos_sa_de_cv/vcv_cortes_finos_sa_de_cv.json');
  const mdPath = path.resolve('proyectos/negocios/vcv_cortes_finos_sa_de_cv/vcv_cortes_finos_sa_de_cv.md');
  const docxPath = path.resolve('vcv/vcv-cortes-finos-s-a-de-c-v--ejecutivo.docx');

  it('debe existir el archivo JSON canónico, Markdown maestro y Word ejecutivo', () => {
    assert.ok(fs.existsSync(jsonPath), 'El archivo JSON de VCV debe existir');
    assert.ok(fs.existsSync(mdPath), 'El archivo MD maestro de VCV debe existir');
    assert.ok(fs.existsSync(docxPath), 'El archivo .docx ejecutivo de VCV debe existir');
  });

  it('debe tener poblados los campos para todas las 12 metodologías canónicas', () => {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const project = JSON.parse(raw);

    assert.equal(project.companyName, 'VCV Cortes Finos, S.A. de C.V.');
    assert.equal(project.config.activeMethodologies.length, 12);

    for (const [fwId, fwConfig] of Object.entries(FRAMEWORKS)) {
      if (!fwConfig.pillars) continue;
      for (const pillar of fwConfig.pillars) {
        assert.ok(project[pillar.key], `Pilar ${pillar.key} debe existir en el proyecto`);
        for (const mod of pillar.modules) {
          assert.ok(project[pillar.key][mod.key], `Módulo ${pillar.key}.${mod.key} debe existir`);
          for (const field of mod.fields) {
            const val = project[pillar.key][mod.key][field];
            assert.ok(val && val.length > 5, `El campo ${pillar.key}.${mod.key}.${field} debe contener información sustantiva`);
          }
        }
      }
    }
  });

  it('debe contener los datos financieros calibrados de VCV Cortes Finos (Margen 31.13% y BEP 781.87 kg/mes)', () => {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const project = JSON.parse(raw);

    const inversionStr = project.organizacion?.inversion?.inversion_fija || '';
    assert.ok(inversionStr.includes('4,000,000') || inversionStr.includes('3,438,240'), 'Debe incluir capital de trabajo de $4,000,000 o costos mensuales');

    const resultadosStr = project.organizacion?.estados_financieros?.resultados || '';
    assert.ok(resultadosStr.includes('4,992,192'), 'Debe reflejar ventas mensuales de $4,992,192 MXN');
    assert.ok(resultadosStr.includes('31.13%'), 'Debe reflejar margen bruto real de 31.13%');
    assert.ok(resultadosStr.includes('45.24%'), 'Debe reflejar nota de markup del 45.24%');

    const indicadoresStr = project.organizacion?.rentabilidad?.punto_equilibrio || '';
    assert.ok(indicadoresStr.includes('781.87') || indicadoresStr.includes('752,940'), 'Debe reflejar punto de equilibrio calibrado en 781.87 kg/mes');

    const operacionStr = project.tecnico?.operacion?.proceso || '';
    assert.ok(operacionStr.includes('ASADHOR'), 'Debe referenciar el equipo ASADHOR');
    assert.ok(operacionStr.includes('-20°C') || operacionStr.includes('pasteuriz'), 'Debe referenciar pasteurización a -20°C');
  });

  it('no debe contener contaminación cruzada en quienes_somos ni reclutamiento', () => {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const project = JSON.parse(raw);

    // quienes_somos no debe tener ingresos SOM ($59,906,304)
    const quienesSomos = project.naturaleza?.identidad?.quienes_somos || '';
    assert.ok(!quienesSomos.includes('59,906,304'), 'quienes_somos no debe contener cifras de SOM');
    assert.ok(quienesSomos.includes('Rodolfo') || quienesSomos.includes('fundada'), 'quienes_somos debe hablar del equipo fundador');

    // reclutamiento no debe tener TAM ($18.5B)
    const reclutamiento = project.organizacion?.recursos_humanos?.reclutamiento || '';
    assert.ok(!reclutamiento.includes('18,500,000,000'), 'reclutamiento no debe contener cifras de TAM');
    assert.ok(reclutamiento.includes('Obreros') || reclutamiento.includes('NOM-251'), 'reclutamiento debe hablar de perfiles de contratación');
  });

  it('debe tener estructurada la corrida_automatica en estados_financieros con 5 años proyectados', () => {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const project = JSON.parse(raw);

    const corrida = project.organizacion?.estados_financieros?.corrida_automatica;
    assert.ok(corrida, 'corrida_automatica debe existir');
    assert.ok(Array.isArray(corrida.incomeStatement), 'incomeStatement debe ser un arreglo');
    assert.equal(corrida.incomeStatement.length, 5, 'Debe proyectar exactamente 5 años');
    assert.equal(corrida.incomeStatement[0].revenue, 59906304, 'Año 1 debe tener ingresos de $59,906,304 MXN');
    assert.equal(corrida.kpis?.grossMarginPct, 31.13, 'KPI de margen bruto debe ser 31.13%');
    assert.equal(corrida.kpis?.breakEvenKgMonthly, 781.87, 'KPI de punto de equilibrio debe ser 781.87 kg/mes');
  });
});
