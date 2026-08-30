import { useState, useCallback } from 'react';

export function useCanvasBuilder(_planData) {
  const [_, _setResult] = useState(null);

  const buildCanvas = useCallback(async (docType, customData = {}) => {
    if (!customData) return null;
    try {
      const { CanvasBuilder } = await import('../lib/tools/canvas/CanvasBuilder.js');
      const mode = CanvasBuilder.resolveModeForDocType(docType);
      const blocks = CanvasBuilder.getBlockDefinitions(mode);
      
      const data = customData;
      const canvasData = CanvasBuilder.fromPlanData(data || {});
      
      const result = {
        mode,
        blocks,
        data: canvasData,
        validation: CanvasBuilder.validate(canvasData)
      };
      return result;
    } catch (e) {
      console.error('[useCanvasBuilder] Error:', e);
      return null;
    }
  }, []);

  const validateCanvas = useCallback(async (canvasData) => {
    try {
      const { CanvasBuilder } = await import('../lib/tools/canvas/CanvasBuilder.js');
      return CanvasBuilder.validate(canvasData);
    } catch (e) {
      console.error('[useCanvasBuilder] Validate Error:', e);
      return { valid: false, errors: [e.message] };
    }
  }, []);

  return { buildCanvas, validateCanvas };
}

export function useTechReadinessChecker(_planData) {
  const evaluateTRL = useCallback(async (level) => {
    try {
      const { TechReadinessChecker } = await import('../lib/tools/tech/TechReadinessChecker.js');
      return TechReadinessChecker.evaluateTRL(level);
    } catch (e) {
      console.error('[useTechReadinessChecker] TRL Error:', e);
      return null;
    }
  }, []);

  const suggestIPC = useCallback(async (keywords) => {
    try {
      const { TechReadinessChecker } = await import('../lib/tools/tech/TechReadinessChecker.js');
      return TechReadinessChecker.suggestIPC(keywords);
    } catch (e) {
      console.error('[useTechReadinessChecker] IPC Error:', e);
      return null;
    }
  }, []);

  const buildJTBD = useCallback(async (data) => {
    try {
      const { TechReadinessChecker } = await import('../lib/tools/tech/TechReadinessChecker.js');
      return TechReadinessChecker.buildJTBD(data);
    } catch (e) {
      console.error('[useTechReadinessChecker] JTBD Error:', e);
      return null;
    }
  }, []);

  return { evaluateTRL, suggestIPC, buildJTBD };
}

export function useLegalComplianceChecker(_planData) {
  const getConstitutionChecklist = useCallback(async (country = 'MX') => {
    try {
      const { LegalComplianceChecker } = await import('../lib/tools/legal/LegalComplianceChecker.js');
      return LegalComplianceChecker.getConstitutionChecklist(country);
    } catch (e) {
      console.error('[useLegalComplianceChecker] Error:', e);
      return null;
    }
  }, []);

  const getProviderContract = useCallback(async () => {
    try {
      const { LegalComplianceChecker } = await import('../lib/tools/legal/LegalComplianceChecker.js');
      return LegalComplianceChecker.getProviderContractTemplate();
    } catch (e) {
      console.error('[useLegalComplianceChecker] Contract Error:', e);
      return null;
    }
  }, []);

  return { getConstitutionChecklist, getProviderContract };
}

export function useExecutiveSummaryGenerator(planData) {
  // planData is used in the callbacks
  const generateOnePage = useCallback(async (customData = {}) => {
    try {
      const { ExecutiveSummaryGenerator } = await import('../lib/tools/communication/ExecutiveSummaryGenerator.js');
      const data = { ...planData, ...customData };
      return ExecutiveSummaryGenerator.generateOnePage(data);
    } catch (e) {
      console.error('[useExecutiveSummaryGenerator] OnePage Error:', e);
      return null;
    }
  }, [planData]);

  const generateElevatorPitch = useCallback(async (customData = {}) => {
    try {
      const { ExecutiveSummaryGenerator } = await import('../lib/tools/communication/ExecutiveSummaryGenerator.js');
      const data = { ...planData, ...customData };
      return ExecutiveSummaryGenerator.generateElevatorPitch(data);
    } catch (e) {
      console.error('[useExecutiveSummaryGenerator] Pitch Error:', e);
      return null;
    }
  }, [planData]);

  return { generateOnePage, generateElevatorPitch };
}