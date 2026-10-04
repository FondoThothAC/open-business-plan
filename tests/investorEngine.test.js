import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateInvestorScenarios, 
  validateLMVCompliance 
} from '../src/lib/finanzas/investorEngine.js';

describe('TDD: Motor de Inversionistas y Estructuración de Capital (investorEngine)', () => {

  const mockFinancials = {
    capexTotal: 20000000,
    annualEbitdaYear1: 3400000,
    annualEbitdaYear5: 6800000,
    annualNetIncomeYear1: 2200000,
    freeCashFlow5YearsCumulative: 10766530,
    projectDurationYears: 5,
    discountRate: 15.74,
  };

  it('1. Debe validar cumplimiento regulatorio LMV art. 8 fracc. II (< 100 inversionistas)', () => {
    // Caso inválido: 200 inversionistas de $100k
    const checkInvalido = validateLMVCompliance({
      totalRaise: 20000000,
      investorCount: 200,
      minTicket: 100000
    });
    assert.equal(checkInvalido.isCompliant, false, '200 inversionistas debe infringir LMV art. 8 fracc. II');
    assert.ok(checkInvalido.alerts.some(a => a.includes('100 personas')), 'Debe alertar sobre el tope de 100 personas');

    // Caso válido: 20 inversionistas de $1,000,000
    const checkValido = validateLMVCompliance({
      totalRaise: 20000000,
      investorCount: 20,
      minTicket: 1000000
    });
    assert.equal(checkValido.isCompliant, true, '20 inversionistas cumple colocación privada');
    assert.equal(checkValido.alerts.length, 0);
  });

  it('2. Debe estructurar Escenario E1: Arrendamiento de maquinaria legalmente deducible', () => {
    const res = calculateInvestorScenarios(mockFinancials, {
      leaseTermMonths: 60,
      interestRateAnnual: 12,
      buyoutPercentage: 5
    });

    assert.ok(res.escenarios.E1_arrendamiento, 'Debe incluir escenario E1 de arrendamiento');
    const e1 = res.escenarios.E1_arrendamiento;
    assert.ok(e1.rentaMensual > 0, 'La renta mensual debe ser mayor a cero');
    assert.ok(e1.rentaAnual > 0, 'La renta anual debe ser mayor a cero');
    assert.ok(e1.ahorroFiscalTotal > 0, 'Debe cuantificar el escudo fiscal del arrendamiento (LISR)');
    assert.ok(e1.tirArrendador > 0, 'Debe calcular la TIR para el arrendador');
  });

  it('3. Debe estructurar Escenario E2: Equity con múltiplos de EBITDA (3.7x, 4.5x, 5.5x)', () => {
    const res = calculateInvestorScenarios(mockFinancials, {
      equityPercentageOffered: 60,
      exitMultiple: 4.5
    });

    assert.ok(res.escenarios.E2_equity, 'Debe incluir escenario E2 de equity');
    const e2 = res.escenarios.E2_equity;
    assert.ok(e2.valuacionPreMoney > 0, 'Debe calcular valuación pre-money');
    assert.ok(e2.valuacionPostMoney > e2.valuacionPreMoney, 'Post-money debe ser mayor que pre-money');
    assert.ok(e2.multiplosSensibilidad['3.7x'], 'Debe incluir sensibilidad a 3.7x');
    assert.ok(e2.multiplosSensibilidad['4.5x'], 'Debe incluir sensibilidad a 4.5x');
    assert.ok(e2.multiplosSensibilidad['5.5x'], 'Debe incluir sensibilidad a 5.5x');
    assert.ok(e2.moic > 0, 'Debe calcular múltiplo de capital (MoIC)');
  });

  it('4. Debe estructurar Escenario E3: Financiamiento en Tramos Escalonados por Hitos', () => {
    const res = calculateInvestorScenarios(mockFinancials, {
      tranches: [
        { name: 'Tramo 1 (Validación e Infraestructura Base)', amount: 10000000, milestone: 'Puesta en marcha de taller y primeros 10 clientes' },
        { name: 'Tramo 2 (Expansión y Línea Completa)', amount: 10000000, milestone: 'Contratos firmados > $12M MXN anuales' }
      ]
    });

    assert.ok(res.escenarios.E3_tramos, 'Debe incluir escenario E3 de tramos');
    const e3 = res.escenarios.E3_tramos;
    assert.equal(e3.tramos.length, 2, 'Debe contar con 2 tramos');
    assert.equal(e3.tramos[0].amount, 10000000);
    assert.equal(e3.tramos[1].amount, 10000000);
  });

});
