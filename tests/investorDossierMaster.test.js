import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { calculateInvestorScenarios, validateLMVCompliance } from '../src/lib/finanzas/investorEngine.js';
import { auditProjectFigures } from '../src/lib/finanzas/auditorCifras.js';
import { DATA_ROOM_SECTIONS, generateProjectDataRoom } from '../src/lib/finanzas/dataRoomSchema.js';
import { generatePitchDeckBuffer } from '../src/lib/pptxExportEngine.js';
import { FRAMEWORKS } from '../src/config/frameworks.js';

describe('TDD: Subsistema Integral de Inversionistas, Auditoría Numérica y Data Room', () => {

  it('1. FRAMEWORKS y el subsistema de finanzas deben estructurar pilares de capital e inversión consistentes', () => {
    const businessPillar = FRAMEWORKS.business.pillars.find(p => p.key === 'organizacion');
    assert.ok(businessPillar, 'Pilar organizacion debe existir en business');
    assert.ok(businessPillar.modules.some(m => m.key === 'inversion'), 'Debe incluir módulo inversion');

    const invProjPillar = FRAMEWORKS.investment_project.pillars.find(p => p.key === 'estructura_capital');
    assert.ok(invProjPillar, 'Pilar estructura_capital debe existir en investment_project');
    assert.ok(invProjPillar.modules.some(m => m.key === 'capital'), 'Debe incluir módulo capital');
  });

  it('2. El archivo de CCI debe contener la Ficha de Drivers y estar calibrado con cifras de golden model', () => {
    const cciPath = path.resolve('proyectos/negocios/comercio_cu_ntico_internacional_tr_sapi_de_cv/comercio_cu_ntico_internacional_tr_sapi_de_cv.json');
    const cciData = JSON.parse(fs.readFileSync(cciPath, 'utf8'));

    assert.ok(cciData.config?.fichaDrivers, 'CCI debe tener fichaDrivers definida en config');
    assert.equal(cciData.config.fichaDrivers.capexTotal, 16000000, 'CAPEX total en fichaDrivers debe ser $16M');
    assert.equal(cciData.config.fichaDrivers.wacc, 0.1574, 'WACC debe ser 15.74%');
    assert.equal(cciData.config.fichaDrivers.precioTelemetriaIoT, 3500, 'Telemetría IoT debe ser $3,500/mes');
    assert.ok(cciData.semilla.esquema_accionistas.includes('LMV art. 8 fracc. II'), 'Semilla debe citar cumplimiento LMV');
    assert.ok(cciData.organizacion.recursos_humanos.sueldos.includes('4 a 6 técnicos'), 'Nómina debe estar calibrada para 4 a 6 técnicos');
  });

  it('3. calculateInvestorScenarios debe calcular E1 (arrendamiento), E2 (equity) y E3 (tramos) con precisión matemática', () => {
    const result = calculateInvestorScenarios(
      {
        capexTotal: 16000000,
        annualEbitdaYear1: 3400000,
        annualEbitdaYear5: 6800000
      },
      {
        leaseTermMonths: 60,
        interestRateAnnual: 12,
        equityPercentageOffered: 40,
        exitMultiple: 4.5
      }
    );

    assert.ok(result.escenarios.E1_arrendamiento, 'Debe incluir escenario E1');
    assert.ok(result.escenarios.E1_arrendamiento.rentaMensual > 0, 'Renta mensual debe ser positiva');
    assert.equal(result.escenarios.E1_arrendamiento.ahorroFiscalTotal, Math.round(result.escenarios.E1_arrendamiento.pagoTotalLease * 0.30), 'Ahorro fiscal debe ser 30% LISR');

    assert.ok(result.escenarios.E2_equity, 'Debe incluir escenario E2');
    assert.equal(result.escenarios.E2_equity.multiploSalidaBase, 4.5);
    assert.ok(result.escenarios.E2_equity.multiplosSensibilidad['4.5x'], 'Debe tener banda 4.5x calculada');
    assert.ok(result.escenarios.E2_equity.multiplosSensibilidad['5.5x'], 'Debe tener banda 5.5x calculada');
    assert.ok(result.escenarios.E2_equity.moic > 0, 'MoIC debe ser positivo');

    assert.ok(result.escenarios.E3_tramos, 'Debe incluir escenario E3');
    assert.ok(result.escenarios.E3_tramos.tramos.length >= 2, 'Debe tener al menos 2 tramos');
  });

  it('4. validateLMVCompliance debe emitir semáforo rojo cuando se superan 99 inversionistas', () => {
    const nonCompliant = validateLMVCompliance({
      totalRaise: 20000000,
      investorCount: 200,
      minTicket: 100000
    });
    assert.equal(nonCompliant.isCompliant, false, '200 inversionistas debe ser no conforme con LMV art. 8 fracc. II');
    assert.ok(nonCompliant.alerts.some(a => a.includes('Infracción a LMV art. 8 fracc. II')));

    const compliant = validateLMVCompliance({
      totalRaise: 20000000,
      investorCount: 49,
      minTicket: 500000
    });
    assert.equal(compliant.isCompliant, true, '49 inversionistas debe ser conforme con LMV');
    assert.equal(compliant.alerts.length, 0, 'No debe haber alertas de infracción para colocación privada válida');
  });

  it('5. DATA_ROOM_SECTIONS debe estructurar los 5 pilares institucionales con items obligatorios', () => {
    assert.equal(DATA_ROOM_SECTIONS.length, 5, 'Deben existir exactamente 5 pilares de debida diligencia');
    const ids = DATA_ROOM_SECTIONS.map(s => s.id);
    assert.deepEqual(ids, ['corporativo', 'financiero', 'operativo_tecnico', 'comercial', 'legal_laboral']);

    const room = generateProjectDataRoom({});
    assert.equal(room.length, 5);
    assert.ok(room[0].items.every(i => i.completado === false), 'Todos los items arrancan en estado pendiente');
  });

  it('6. generatePitchDeckBuffer debe exportar un PowerPoint (.pptx) binario institucional válido de > 15 KB', async () => {
    const cciPath = path.resolve('proyectos/negocios/comercio_cu_ntico_internacional_tr_sapi_de_cv/comercio_cu_ntico_internacional_tr_sapi_de_cv.json');
    const cciData = JSON.parse(fs.readFileSync(cciPath, 'utf8'));

    const buffer = await generatePitchDeckBuffer(cciData);
    assert.ok(Buffer.isBuffer(buffer), 'Debe retornar un Buffer de Node.js');
    assert.ok(buffer.length > 15000, `El archivo PPTX debe tener tamaño sustancial (>15KB), generado: ${buffer.length} bytes`);
  });

});
