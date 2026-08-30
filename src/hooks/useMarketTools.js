import { useState, useCallback } from 'react';

export function useCompetitorIntelligence(_planData) {
  const [_, _setResult] = useState(null);
  const [__, setLoading] = useState(false);

  const buildPorter = useCallback(async (data) => {
    if (!data) return null;
    setLoading(true);
    try {
      const { CompetitorIntelligence } = await import('../lib/tools/market/CompetitorIntelligence.js');
      const result = CompetitorIntelligence.buildPorterFiveForces(data);
      return result;
    } catch (e) {
      console.error('[useCompetitorIntelligence] Porter Error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const comparisonMatrix = useCallback(async (data) => {
    if (!data) return null;
    try {
      const { CompetitorIntelligence } = await import('../lib/tools/market/CompetitorIntelligence.js');
      const brand = data.semilla?.negocio?.nombre_marca || data.config?.brandKit?.companyName || 'Nuestra Empresa';
      return CompetitorIntelligence.buildComparisonMatrix(brand, data);
    } catch (e) {
      console.error('[useCompetitorIntelligence] Comparison Error:', e);
    }
  }, []);

  const positioningMap = useCallback(async (data) => {
    if (!data) return null;
    try {
      const { CompetitorIntelligence } = await import('../lib/tools/market/CompetitorIntelligence.js');
      return CompetitorIntelligence.buildPositioningMap(data);
    } catch (e) {
      console.error('[useCompetitorIntelligence] Positioning Error:', e);
    }
  }, []);

  return { buildPorter, comparisonMatrix, positioningMap, loading: false };
}