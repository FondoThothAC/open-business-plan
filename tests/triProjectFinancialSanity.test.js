import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { generateAutomatedFinancials } from '../src/lib/finanzas/calculadoraFinanciera.js';

describe('TDD: Casos de Oro y Aislamiento Financiero (CCI, VCV, Closets Corona, Galletas, FAPPA, Servicios)', () => {

  it('1. CCI (Comercio Cuántico Internacional) debe respetar CAPEX de $20M sin topes ni galletas', async () => {
    const cciPath = path.resolve('proyectos/negocios/comercio_cu_ntico_internacional_tr_sapi_de_cv/comercio_cu_ntico_internacional_tr_sapi_de_cv.json');
    assert.ok(fs.existsSync(cciPath), 'El archivo de CCI debe existir');
    const cciData = JSON.parse(fs.readFileSync(cciPath, 'utf8'));

    const res = await generateAutomatedFinancials(cciData);

    // Verificación de aislamiento estricto: Cero menciones de galletas u hornos
    const serialized = JSON.stringify(res).toLowerCase();
    assert.ok(!serialized.includes('galleta'), 'CCI no debe contener referencias a galletas');
    assert.ok(!serialized.includes('horno de convección'), 'CCI no debe contener referencias a hornos');

    // Verificación de escala de inversión: No debe estar topada a $1,000,000
    assert.ok(res.inversion?.desglose_capex_json, 'Debe incluir desglose de CAPEX');
    const capexRows = JSON.parse(res.inversion.desglose_capex_json);
    const totalCapex = capexRows.reduce((sum, item) => sum + Number(item.monto || 0), 0);
    assert.ok(totalCapex >= 10000000, `El CAPEX de CCI debe ser de escala industrial (>= $10M), valor actual: ${totalCapex}`);
    
    // Verificación de texto descriptivo
    assert.ok(res.inversion?.inversion_fija?.includes('20,000,000') || res.inversion?.inversion_fija?.includes('16,000,000') || res.inversion?.inversion_fija?.includes('10,000,000'), 
      'La narrativa de inversión debe reflejar la inversión canónica');
  });

  it('2. VCV Carnes debe reflejar escala cárnica de $4M y costos sin contaminación', async () => {
    const vcvPath = path.resolve('proyectos/negocios/vcv_cortes_finos_sa_de_cv/vcv_cortes_finos_sa_de_cv.json');
    assert.ok(fs.existsSync(vcvPath), 'El archivo de VCV debe existir');
    const vcvData = JSON.parse(fs.readFileSync(vcvPath, 'utf8'));

    const res = await generateAutomatedFinancials(vcvData);

    // Aislamiento
    const serialized = JSON.stringify(res).toLowerCase();
    assert.ok(!serialized.includes('galleta'), 'VCV no debe contener referencias a galletas');

    // Escala
    const capexRows = JSON.parse(res.inversion.desglose_capex_json);
    const totalCapex = capexRows.reduce((sum, item) => sum + Number(item.monto || 0), 0);
    assert.ok(totalCapex >= 3000000, `El CAPEX de VCV debe ser de orden de millones (>= $3M), actual: ${totalCapex}`);
  });

  it('3. Closets y Cocinas Corona debe respetar CAPEX de $150k y costos reales de taller sin galletas', async () => {
    const closetsPath = path.resolve('proyectos/negocios/closets_y_cocinas_corona/closets_y_cocinas_corona.json');
    assert.ok(fs.existsSync(closetsPath), 'El archivo de Closets Corona debe existir');
    const closetsData = JSON.parse(fs.readFileSync(closetsPath, 'utf8'));

    const res = await generateAutomatedFinancials(closetsData);

    // Aislamiento
    const serialized = JSON.stringify(res).toLowerCase();
    assert.ok(!serialized.includes('galleta'), 'Closets Corona no debe contener referencias a galletas');
    assert.ok(!serialized.includes('horno de convección'), 'Closets Corona no debe contener referencias a hornos');

    // CAPEX real de $150,000
    const capexRows = JSON.parse(res.inversion.desglose_capex_json);
    const totalCapex = capexRows.reduce((sum, item) => sum + Number(item.monto || 0), 0);
    assert.ok(totalCapex === 150000 || (totalCapex >= 120000 && totalCapex <= 180000), 
      `El CAPEX de Closets Corona debe ser de ~$150,000 MXN, actual: ${totalCapex}`);
  });

  it('4. Galletas de Semillas Saludables mantiene su lógica de repostería legítima', async () => {
    const galletasPath = path.resolve('proyectos/negocios/user_ragv/galletas_de_semillas_saludables/galletas_de_semillas_saludables.json');
    assert.ok(fs.existsSync(galletasPath), 'El archivo de Galletas debe existir');
    const galletasData = JSON.parse(fs.readFileSync(galletasPath, 'utf8'));

    const res = await generateAutomatedFinancials(galletasData);
    assert.ok(res.inversion?.inversion_fija, 'Debe generar inversión para galletas');
    assert.ok(res.estados_financieros?.resultados, 'Debe generar estados financieros para galletas');
  });

  it('5. Proyecto de Servicios nuevo sin datos obligatorios declara falta de drivers en vez de inventar', async () => {
    const proyectoVacio = {
      semilla: {
        nombre_proyecto: 'Consultoría Estratégica Phoenix',
        giro: 'Servicios de consultoría empresarial'
      },
      organizacion: {}
    };

    const res = await generateAutomatedFinancials(proyectoVacio);
    assert.ok(res._pendingFinancialInputs || res.inversion.inversion_fija.includes('No calculable'), 
      'Debe marcar como No calculable o pendiente cuando faltan drivers');
    const serialized = JSON.stringify(res).toLowerCase();
    assert.ok(!serialized.includes('galleta'), 'No debe inventar galletas en consultoría');
  });

});
