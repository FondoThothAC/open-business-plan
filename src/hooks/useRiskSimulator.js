import { useState, useCallback } from 'react';

export function useRiskSimulator(_planData) {
  const [_, __] = useState(null);
  const [___, setLoading] = useState(false);

  const runMonteCarlo = useCallback(async (data, options = {}) => {
    if (!data) return null;
    setLoading(true);
    try {
      const { RiskSimulator } = await import('../lib/tools/risk/RiskSimulator.js');
      
      const input = extractFinancialInput(data);
      if (!input) return null;

      const result = RiskSimulator.runMonteCarlo({
        ...input,
        ...options
      });
      return result;
    } catch (e) {
      console.error('[useRiskSimulator] Error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const spiderAnalysis = useCallback(async (data) => {
    if (!data) return null;
    try {
      const { RiskSimulator } = await import('../lib/tools/risk/RiskSimulator.js');
      
      const input = extractFinancialInput(data);
      if (!input) return null;

      return RiskSimulator.spiderAnalysis({
        ...input
      });
    } catch (e) {
      console.error('[useRiskSimulator] Spider Error:', e);
    }
  }, []);

  const scenarios = useCallback(async (data) => {
    if (!data) return null;
    try {
      const { FinancialAnalyzer } = await import('../lib/tools/financial/FinancialAnalyzer.js');
      const input = extractFinancialInput(data);
      if (!input) return null;

      const baseResult = FinancialAnalyzer.analyze(input);
      return baseResult.scenarios;
    } catch (e) {
      console.error('[useRiskSimulator] Scenarios Error:', e);
    }
  }, []);

  function extractFinancialInput(data) {
    if (!data) return null;
    const estados = data.organizacion?.estados_financieros || {};
    const _inversion = data.organizacion?.inversion || {};
    const semilla = data.semilla || {};

    const cashFlows = estados.flujo_caja?.valores || [
      Number(semilla.flujo_año_1) || 5000000,
      Number(semilla.flujo_año_2) || 6500000,
      Number(semilla.flujo_año_3) || 8000000,
      Number(semilla.flujo_año_4) || 9500000,
      Number(semilla.flujo_año_5) || 11000000
    ];

    const initialInvestment = Number(semilla.inversion_total) || 20000000;
    const wacc = Number(semilla.wacc) || 0.12;

    return { initialInvestment, cashFlows, wacc, baseCashFlows: cashFlows };
  }

  return { runMonteCarlo, spiderAnalysis, scenarios, loading: false };
}

export function useRiskMatrixBuilder(_planData) {
  const [_, __] = useState(null);
  const [___, setLoading] = useState(false);

  const buildZOPP = useCallback(async (data) => {
    if (!data) return null;
    setLoading(true);
    try {
      const { RiskMatrixBuilder } = await import('../lib/tools/risk/RiskMatrixBuilder.js');
      const risks = data.organizacion?.riesgos?.riesgos_identificados || [];
      const result = RiskMatrixBuilder.buildZOPPMatrix(risks);
      return result;
    } catch (e) {
      console.error('[useRiskMatrixBuilder] Error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkDNSH = useCallback(async (data) => {
    if (!data) return null;
    try {
      const { RiskMatrixBuilder } = await import('../lib/tools/risk/RiskMatrixBuilder.js');
      return RiskMatrixBuilder.checkDNSH(data);
    } catch (e) {
      console.error('[useRiskMatrixBuilder] DNSH Error:', e);
    }
  }, []);

  const powerInterest = useCallback(async (data) => {
    if (!data) return null;
    try {
      const { RiskMatrixBuilder } = await import('../lib/tools/risk/RiskMatrixBuilder.js');
      return RiskMatrixBuilder.powerInterestMatrix(data);
    } catch (e) {
      console.error('[useRiskMatrixBuilder] Power/Interest Error:', e);
    }
  }, []);

  return { buildZOPP, checkDNSH, powerInterest, loading: false };
}