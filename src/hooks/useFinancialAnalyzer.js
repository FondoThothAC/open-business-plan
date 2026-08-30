import { useState, useEffect, useCallback } from 'react';
import { FinancialAnalyzer } from '../lib/tools/financial/FinancialAnalyzer.js';

export function useFinancialAnalyzer(planData) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractFinancialInput = useCallback((data) => {
    if (!data) return null;

    const estados = data.organizacion?.estados_financieros || {};
    const inversion = data.organizacion?.inversion || {};
    const _costos = data.organizacion?.costos || {};
    const semilla = data.semilla || {};

    const cashFlows = estados.flujo_caja?.valores || [
      Number(semilla.flujo_año_1) || 5000000,
      Number(semilla.flujo_año_2) || 6500000,
      Number(semilla.flujo_año_3) || 8000000,
      Number(semilla.flujo_año_4) || 9500000,
      Number(semilla.flujo_año_5) || 11000000
    ];

    const initialInvestment = Number(inversion.capex_total) || 
                              Number(inversion.inversion_fija) + Number(inversion.inversion_diferida) + Number(inversion.opex_inicial) || 
                              20000000;

    const equity = Number(inversion.capital_proprio) || initialInvestment;
    const debt = Number(inversion.deuda_bancaria) || 0;
    const costOfEquity = Number(inversion.costo_capital) || 0.15;
    const costOfDebt = Number(inversion.tasa_deuda) || 0.08;
    const taxRate = Number(inversion.tasa_impuestos) || 0.30;

    return { initialInvestment, cashFlows, equity, debt, costOfEquity, costOfDebt, taxRate };
  }, []);

  const analyze = useCallback(async (data) => {
    const input = extractFinancialInput(data);
    if (!input) return null;

    setLoading(true);
    setError(null);

    try {
      const result = FinancialAnalyzer.analyze(input);
      setResult(result);
      return result;
    } catch (e) {
      setError(e.message);
      console.error('[useFinancialAnalyzer] Error:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [extractFinancialInput]);

  useEffect(() => {
    if (planData) {
      analyze(planData);
    }
  }, [planData, analyze]);

  return { result, loading, error, analyze, reanalyze: () => analyze(planData) };
}

export function useMarketSizer(planData) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = useCallback(async (data) => {
    if (!data) return null;
    setLoading(true);
    try {
      const { MarketSizer } = await import('../lib/tools/financial/MarketSizer.js');
      const sizing = MarketSizer.fromTerritorialData(data.inegiAnalysis);
      setResult(sizing);
      return sizing;
    } catch (e) {
      console.error('[useMarketSizer] Error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (planData) analyze(planData);
  }, [planData, analyze]);

  return { result, loading, analyze };
}

export function useKPIDashboard(planData) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = useCallback(async (data) => {
    if (!data) return null;
    setLoading(true);
    try {
      const { KPIDashboard } = await import('../lib/tools/financial/KPIDashboard.js');
      const financial = KPIDashboard.evaluateFinancialKPIs(data);
      const operational = KPIDashboard.evaluateOperationalKPIs(data);
      const esg = KPIDashboard.evaluateESGScore(data);
      const result = { financial, operational, esg };
      setResult(result);
      return result;
    } catch (e) {
      console.error('[useKPIDashboard] Error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (planData) analyze(planData);
  }, [planData, analyze]);

  return { result, loading, analyze };
}