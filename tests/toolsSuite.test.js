import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  FinancialAnalyzer,
  MarketSizer,
  KPIDashboard,
  RiskSimulator,
  RiskMatrixBuilder,
  CompetitorIntelligence,
  CanvasBuilder,
  TechReadinessChecker,
  LegalComplianceChecker,
  ExecutiveSummaryGenerator
} from '../src/lib/tools/index.js';
import { BENCHMARKS, FINANCIAL_FORMULAS } from '../src/config/benchmarks.js';
import { BOX_REGISTRY, getBoxesForDocType } from '../src/config/boxRegistry.js';

describe('Suite Completa de 10 Herramientas Analíticas y Boxes (13 Libros) - TDD', () => {

  describe('1. FinancialAnalyzer & Fórmulas Maestras', () => {
    it('Debe calcular WACC correctamente mediante CAPM', () => {
      const wacc = FinancialAnalyzer.calculateWACC({
        equity: 20000000,
        debt: 0,
        costOfEquity: 0.15,
        taxRate: 0.30
      });
      assert.strictEqual(wacc, 0.15);

      const waccMixed = FinancialAnalyzer.calculateWACC({
        equity: 10000000,
        debt: 10000000,
        costOfEquity: 0.16,
        costOfDebt: 0.10,
        taxRate: 0.30
      });
      // we = 0.5 * 0.16 = 0.08, wd = 0.5 * 0.10 * 0.7 = 0.035 => total 0.115
      assert.strictEqual(waccMixed, 0.115);
    });

    it('Debe calcular VAN y TIR para el caso base de $20M MXN / MaaS', () => {
      const capex = 20000000;
      const flows = [5000000, 6500000, 8000000, 9500000, 11000000];
      const npv = FinancialAnalyzer.calculateNPV(capex, flows, 0.12);
      const irr = FinancialAnalyzer.calculateIRR(capex, flows);
      const payback = FinancialAnalyzer.calculatePayback(capex, flows);
      const bcRatio = FinancialAnalyzer.calculateBCRatio(capex, flows, 0.12);

      assert.ok(npv > 1500000, 'El VAN debe ser positivo y superior a $1.5M MXN');
      assert.ok(irr > 0.12, 'La TIR debe ser superior al costo de capital WACC (12%)');
      assert.ok(payback >= 3.0 && payback <= 4.5, 'El payback debe estar entre 3 y 4.5 años');
      assert.ok(bcRatio > 1.0, 'La relación B/C debe ser mayor a 1.0');
    });

    it('Debe generar el análisis Tornado de sensibilidad', () => {
      const tornado = FinancialAnalyzer.sensitivityTornado({
        initialInvestment: 20000000,
        baseCashFlows: [5000000, 6500000, 8000000, 9500000, 11000000],
        wacc: 0.12
      });

      assert.strictEqual(tornado.length, 3);
      assert.ok(tornado[0].impacto > 0);
    });
  });

  describe('2. MarketSizer & TAM/SAM/SOM', () => {
    it('Debe calcular dimensionamiento Top-Down, Bottom-Up y Value-Theory', () => {
      const td = MarketSizer.topDown({ totalUniverse: 500000, annualSpendPerCustomer: 10000 });
      assert.ok(td.tam === 5000000000);
      assert.ok(td.sam > td.som);

      const bu = MarketSizer.bottomUp({ identifiedClients: 50, averageTicket: 68000 });
      assert.ok(bu.sam > 0);
      assert.ok(bu.som <= bu.sam);

      const vt = MarketSizer.valueTheory({ industryEconomicLoss: 300000000 });
      assert.ok(vt.tam > 0);
    });

    it('Debe calcular dimensionamiento desde datos territoriales DENUE', () => {
      const fromDenue = MarketSizer.fromTerritorialData({ clientsWithinRadius: 15, totalNearbyRevenue: 100000000 });
      assert.ok(fromDenue.tam > fromDenue.sam);
      assert.ok(fromDenue.sam > fromDenue.som);
      assert.ok(fromDenue.benchmarkQuote.includes('Linda Pinson'));
    });
  });

  describe('3. KPIDashboard & SCM / ESG', () => {
    it('Debe evaluar Unit Economics y margen bruto contra benchmarks', () => {
      const fin = KPIDashboard.evaluateFinancialKPIs({
        cac: 15000,
        ltv: 75000,
        monthlyRevenue: 1500000,
        monthlyCostOfSales: 600000,
        monthlyOperatingExpenses: 400000,
        cashReserve: 5000000,
        industry: 'industrial'
      });

      assert.strictEqual(fin.cacLtvRatio, 5.0);
      assert.strictEqual(fin.grossMarginPct, '60.0%');
      assert.strictEqual(fin.cacLtvStatus, 'Óptimo (>=3x)');
    });

    it('Debe evaluar indicadores operativos SCM (OTD, DSO, CCC)', () => {
      const scm = KPIDashboard.evaluateOperationalKPIs({
        onTimeDeliveries: 99,
        totalDeliveries: 100,
        annualCostOfGoodsSold: 6000000,
        averageInventory: 1000000,
        annualCreditSales: 18000000,
        accountsReceivable: 2000000,
        accountsPayable: 1000000
      });

      assert.strictEqual(scm.otdPct, '99.0%');
      assert.strictEqual(scm.inventoryTurnover, 6.0);
      assert.ok(scm.dioDays > 0);
      assert.ok(scm.cccDays > 0);
    });

    it('Debe calcular el score ESG y DNSH', () => {
      const esg = KPIDashboard.evaluateESGScore({ renewableEnergyPct: 50, recycledMaterialsPct: 80, formalJobsCreated: 14 });
      assert.ok(esg.compositeScore >= 70);
      assert.ok(esg.rating.includes('Líder ESG') || esg.rating.includes('Cumplimiento'));
    });
  });

  describe('4. RiskSimulator & Monte Carlo Estocástico', () => {
    it('Debe ejecutar 10,000 iteraciones de Monte Carlo en milisegundos', () => {
      const startTime = Date.now();
      const sim = RiskSimulator.runMonteCarlo({
        initialInvestment: 20000000,
        baseCashFlows: [5000000, 6500000, 8000000, 9500000, 11000000],
        iterations: 10000
      });
      const durationMs = Date.now() - startTime;

      assert.strictEqual(sim.iterations, 10000);
      assert.ok(durationMs < 500, `La simulación debe completarse en <500ms (tardó ${durationMs}ms)`);
      assert.ok(sim.winProbability >= 70, 'La probabilidad de éxito debe ser alta para el caso base');
      assert.ok(sim.p90 > sim.p10, 'P90 debe ser mayor que P10');
      assert.strictEqual(sim.histogram.length, 10);
    });

    it('Debe generar el análisis Spider de 2 variables', () => {
      const spider = RiskSimulator.spiderAnalysis({ initialInvestment: 20000000 });
      assert.strictEqual(spider.length, 5);
      assert.ok(spider[4].npvByPrice > spider[0].npvByPrice);
    });
  });

  describe('5. RiskMatrixBuilder (ZOPP & DNSH)', () => {
    it('Debe generar la matriz ZOPP 4x4 clasificada por criticidad', () => {
      const zopp = RiskMatrixBuilder.buildZOPPMatrix();
      assert.strictEqual(zopp.totalRisks, 4);
      assert.ok(zopp.evaluated[0].score >= zopp.evaluated[3].score);
    });

    it('Debe evaluar los 6 objetivos medioambientales DNSH de la UE', () => {
      const dnsh = RiskMatrixBuilder.checkDNSH({ climateMitigation: true, circularEconomy: true });
      assert.strictEqual(dnsh.criteria.length, 6);
      assert.strictEqual(dnsh.isFullyCompliant, true);
    });
  });

  describe('6. CompetitorIntelligence & Porter 5 Fuerzas', () => {
    it('Debe generar las 5 Fuerzas de Porter con mitigaciones', () => {
      const porter = CompetitorIntelligence.buildPorterFiveForces();
      assert.strictEqual(porter.fuerzas.length, 5);
      assert.ok(porter.atractivoMercado.length > 0);
    });

    it('Debe construir la matriz de benchmarking y mapa Océano Azul', () => {
      const matrix = CompetitorIntelligence.buildComparisonMatrix('Comercio Cuántico TR SAPI de CV');
      assert.ok(matrix.ourProfile.calificacion >= 4.5);

      const map = CompetitorIntelligence.buildPositioningMap();
      assert.ok(map.posiciones.length >= 3);
    });
  });

  describe('7. CanvasBuilder (Lean, Classic, Micro)', () => {
    it('Debe entregar 9 bloques para Lean Canvas y Osterwalder, y 3 para Micro', () => {
      const leanBlocks = CanvasBuilder.getBlockDefinitions(CanvasBuilder.MODES.LEAN);
      const classicBlocks = CanvasBuilder.getBlockDefinitions(CanvasBuilder.MODES.CLASSIC);
      const microBlocks = CanvasBuilder.getBlockDefinitions(CanvasBuilder.MODES.MICRO);

      assert.strictEqual(leanBlocks.length, 9);
      assert.strictEqual(classicBlocks.length, 9);
      assert.strictEqual(microBlocks.length, 3);
    });

    it('Debe resolver el modo correcto según el tipo de documento', () => {
      assert.strictEqual(CanvasBuilder.resolveModeForDocType('agile_startup'), CanvasBuilder.MODES.LEAN);
      assert.strictEqual(CanvasBuilder.resolveModeForDocType('micro_business'), CanvasBuilder.MODES.MICRO);
      assert.strictEqual(CanvasBuilder.resolveModeForDocType('business'), CanvasBuilder.MODES.CLASSIC);
    });
  });

  describe('8. TechReadinessChecker (TRL, IPC, JTBD)', () => {
    it('Debe evaluar el nivel TRL 7 para despliegue minero operativo', () => {
      const trl = TechReadinessChecker.evaluateTRL(7);
      assert.strictEqual(trl.currentTRL, 7);
      assert.strictEqual(trl.isCommercialReady, true);
    });

    it('Debe sugerir códigos IPC para hidráulica y minería', () => {
      const ipc = TechReadinessChecker.suggestIPC('mangueras hidraulicas mineria IoT');
      assert.ok(ipc.suggestions.some(s => s.code === 'F15B' || s.code === 'E21C'));
    });

    it('Debe construir la declaración Jobs-to-be-Done de Christensen', () => {
      const jtbd = TechReadinessChecker.buildJTBD();
      assert.ok(jtbd.declaracionJTBD.includes('necesita'));
    });
  });

  describe('9. LegalComplianceChecker & SLAs', () => {
    it('Debe entregar el checklist de constitución para México (SAPI de CV)', () => {
      const checklist = LegalComplianceChecker.getConstitutionChecklist('MX');
      assert.strictEqual(checklist.length, 8);
    });

    it('Debe entregar cláusulas maestras para contratos de proveedores y REPSE', () => {
      const contract = LegalComplianceChecker.getProviderContractTemplate();
      assert.strictEqual(contract.clausulasClave.length, 5);
      assert.ok(contract.clausulasClave.some(c => c.detalle.includes('REPSE')));
    });

    it('Debe exponer las tasas fiscales y marco regulatorio de México', () => {
      const taxes = LegalComplianceChecker.getTaxRates();
      assert.strictEqual(taxes.isrCorporativo, 0.30);
      assert.strictEqual(taxes.ivaGeneral, 0.16);
      assert.strictEqual(taxes.ptuUtilidades, 0.10);

      const framework = LegalComplianceChecker.getMexicanRegulatoryFramework();
      assert.strictEqual(framework.length, 11);
      assert.ok(framework.some(f => f.ley.includes('LISR')));
      assert.ok(framework.some(f => f.ley.includes('NOM-STPS')));
      assert.ok(framework.some(f => f.ley.includes('LIGIE')));
      assert.ok(framework.some(f => f.ley.includes('CCom')));
      assert.ok(framework.some(f => f.ley.includes('REPSE')));
    });
  });

  describe('10. ExecutiveSummaryGenerator & Elevator Pitch', () => {
    it('Debe generar el resumen de 1 página de Linda Pinson con 7 secciones', () => {
      const summary = ExecutiveSummaryGenerator.generateOnePage();
      assert.strictEqual(summary.sections.length, 7);
    });

    it('Debe generar el Elevator Pitch de 30 segundos de Burn the Business Plan', () => {
      const pitch = ExecutiveSummaryGenerator.generateElevatorPitch();
      assert.strictEqual(pitch.durationSeconds, 30);
      assert.ok(pitch.pitchText.includes('Comercio Cuántico'));
    });
  });

  describe('11. BoxRegistry & Benchmarks Config', () => {
    it('Debe tener registrados boxes para los 12 tipos de documentos', () => {
      assert.ok(Object.keys(BOX_REGISTRY).length >= 12);
      const businessBoxes = getBoxesForDocType('business');
      assert.ok(businessBoxes.length >= 4);
    });

    it('Debe exponer benchmarks y fórmulas financieras con citas', () => {
      assert.ok(BENCHMARKS.industrial.grossMargin[0] === 0.25);
      assert.ok(FINANCIAL_FORMULAS.wacc.fuente.includes('Nature of Value'));
    });
  });

});
