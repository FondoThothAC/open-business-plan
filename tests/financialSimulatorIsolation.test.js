import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { parseToProjectData } from '../src/lib/finanzas/calculadoraFinanciera.js';
import { extractDriversFromPlan } from '../src/lib/finanzas/driversExtractor.js';

describe('TDD: Aislamiento del Simulador Financiero y RAG por Proyecto', () => {

  it('1. VCV Cortes Finos debe alimentar el simulador con conceptos cárnicos y sin datos de cibercafé ni minería', () => {
    const vcvPath = path.resolve('proyectos/negocios/vcv_cortes_finos_sa_de_cv/vcv_cortes_finos_sa_de_cv.json');
    assert.ok(fs.existsSync(vcvPath), 'El archivo de VCV debe existir');
    const vcvData = JSON.parse(fs.readFileSync(vcvPath, 'utf8'));

    const projectData = parseToProjectData(vcvData);
    const driversFicha = extractDriversFromPlan(vcvData);
    const drivers = driversFicha?.drivers || {};

    const concepto = drivers.concepto_producto?.valor || '';
    assert.ok(
      /carne|corte|ganad/i.test(concepto),
      `El concepto debe ser cárnico, obtenido: "${concepto}"`
    );

    // Verificación de inversión
    assert.ok(drivers.capex_total?.valor > 0, 'Debe contar con CAPEX en drivers');
    const totalCapex = drivers.capex_total.valor;
    assert.ok(
      totalCapex >= 3000000 && totalCapex <= 5000000,
      `El CAPEX de VCV debe estar en torno a $4,000,000 MXN, actual: ${totalCapex}`
    );

    // Simulación del payload generado para el simulador iframe
    const investments = (projectData?.investmentItems || []).map((item, idx) => ({
      id: `inv_${idx + 1}`,
      concept: item.name,
      totalCost: item.amount
    }));

    const serializedInvestments = JSON.stringify(investments).toLowerCase();
    assert.ok(!serializedInvestments.includes('usb'), 'No debe contener USB');
    assert.ok(!serializedInvestments.includes('ciber'), 'No debe contener Ciber');
    assert.ok(!serializedInvestments.includes('minero'), 'No debe contener Minero');
    assert.ok(!serializedInvestments.includes('sonora'), 'No debe contener Sonora');
  });

  it('2. Proyecto genérico de servicios no debe heredar pistones ni contratos mineros', () => {
    const planDummy = {
      semilla: {
        nombre_proyecto: 'Consultoría Estratégica Alpha',
        negocio: {
          nombre: 'Consultoría Alpha',
          giro: 'Servicios de Consultoría de Negocios y Estrategia Empresarial'
        }
      },
      config: {
        fichaDrivers: {
          capexTotal: 500000,
          ticketPromedio: 15000,
          costosFijosMensuales: 40000
        }
      }
    };

    const projectData = parseToProjectData(planDummy);
    const driversFicha = extractDriversFromPlan(planDummy);

    assert.equal(driversFicha.drivers.capex_total?.valor, 500000);
    assert.equal(driversFicha.drivers.precio_unitario_o_ticket?.valor, 15000);

    const serialized = JSON.stringify(projectData).toLowerCase();
    assert.ok(!serialized.includes('piston'), 'No debe incluir pistones');
    assert.ok(!serialized.includes('cananea'), 'No debe incluir Cananea');
    assert.ok(!serialized.includes('fappa'), 'No debe incluir FAPPA');
  });

});
