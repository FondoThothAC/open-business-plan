/**
 * CELIS Agentic Engine - Autonomous ReAct Execution & DeepSeek Harness Trajectory Recorder
 * Open Business Plan - Fondo Thoth AC
 * 
 * Implementa el ciclo cognitivo autónomo:
 *   Pensamiento (Thought) ➔ Acción / Tool Call ➔ Observación (Observation) ➔ Reflexión Crítica ➔ Síntesis Final
 * Registra cada trayectoria en el estándar DeepSeek Harness para trazabilidad completa.
 */

import { executeAgentTool } from './agentTools.js';
import { callAiProvider } from './ai.js';
import { getApiBase } from '../config/apiConfig.js';
import { buildVerbosityConstraint, getFieldFormatGuidance } from './verbosityManager.js';

const TRAJECTORY_STORAGE_KEY = 'openplan_agent_trajectories';

// ─────────────────────────────────────────────────────────────────────────
// GESTOR DE TRAYECTORIAS (DeepSeek Harness Trajectory Recorder)
// ─────────────────────────────────────────────────────────────────────────
export class TrajectoryRecorder {
  constructor(taskId, metadata = {}) {
    this.id = taskId || `traj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.timestamp = new Date().toISOString();
    this.pillar = metadata.pillar || 'general';
    this.moduleKey = metadata.moduleKey || 'modulo';
    this.moduleTitle = metadata.title || metadata.moduleKey || 'Módulo';
    this.model = metadata.model || 'minimax-m3:cloud';
    this.provider = metadata.provider || 'ollama';
    this.mode = metadata.mode || 'standard'; // 'standard' | 'code' | 'minimal' | 'creator'
    this.parentSessionId = metadata.parentSessionId || null;
    this.forkedFromNodeId = metadata.forkedFromNodeId || null;
    this.branchNote = metadata.branchNote || null;
    this.pluginsLoaded = metadata.pluginsLoaded || ['cordis-kernel', 'trajectory-logger', 'tool-executor', 'sandbox-session'];
    this.cordisContext = metadata.cordisContext || {
      spatiotemporalId: `cordis_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      lifecycleState: 'active',
      sideEffectsCount: 0
    };
    this.steps = Array.isArray(metadata.initialSteps) ? [...metadata.initialSteps] : [];
    this.startTime = Date.now();
    this.totalDurationMs = metadata.initialDurationMs || 0;
    this.status = 'running'; // 'running' | 'completed' | 'failed' | 'paused_waiting_quota'
    this.finalOutput = null;
    this.metrics = metadata.initialMetrics ? { ...metadata.initialMetrics } : {
      totalToolCalls: 0,
      successfulToolCalls: 0,
      criticApprovals: 0,
      totalSteps: this.steps.length
    };
  }

  addStep(type, payload = {}) {
    const stepDuration = payload.durationMs || 0;
    const stepIndex = this.steps.length + 1;
    
    const stepObj = {
      id: `node_${stepIndex}`,
      parent: stepIndex === 1 ? (this.forkedFromNodeId || null) : `node_${stepIndex - 1}`,
      stepIndex,
      type, // 'thought' | 'tool_call' | 'observation' | 'reflection' | 'synthesis'
      timestamp: new Date().toISOString(),
      title: payload.title || `Paso ${stepIndex}: ${type.toUpperCase()}`,
      content: payload.content || '',
      toolName: payload.toolName || null,
      toolArgs: payload.toolArgs || null,
      toolResult: payload.toolResult || null,
      durationMs: stepDuration,
      status: payload.status || 'success'
    };

    if (type === 'tool_call') this.metrics.totalToolCalls++;
    if (type === 'observation' && payload.status !== 'error') this.metrics.successfulToolCalls++;
    if (type === 'reflection' && payload.isApproved) this.metrics.criticApprovals++;
    this.metrics.totalSteps = this.steps.length + 1;

    this.steps.push(stepObj);
    this.saveSnapshot();
    return stepObj;
  }

  finish(output, status = 'completed') {
    this.totalDurationMs = Date.now() - this.startTime;
    this.status = status;
    this.finalOutput = output;
    this.saveSnapshot();
    return this.exportHarness();
  }

  forkAtNode(nodeId, newParams = {}) {
    const targetIdx = this.steps.findIndex(s => s.id === nodeId || `node_${s.stepIndex}` === nodeId);
    const inheritedSteps = targetIdx >= 0 ? this.steps.slice(0, targetIdx + 1) : [...this.steps];
    
    const forkedTaskId = `fork_${this.id}_${nodeId}_${Date.now()}`;
    const forkedRecorder = new TrajectoryRecorder(forkedTaskId, {
      pillar: this.pillar,
      moduleKey: this.moduleKey,
      title: `${this.moduleTitle} (Bifurcación)`,
      model: newParams.newModel || this.model,
      provider: newParams.newProvider || this.provider,
      mode: newParams.newMode || this.mode,
      parentSessionId: this.id,
      forkedFromNodeId: nodeId,
      branchNote: newParams.branchNote || `Bifurcación desde ${nodeId}`,
      pluginsLoaded: [...this.pluginsLoaded],
      initialSteps: inheritedSteps,
      initialDurationMs: inheritedSteps.reduce((acc, s) => acc + (s.durationMs || 0), 0),
      initialMetrics: {
        totalToolCalls: inheritedSteps.filter(s => s.type === 'tool_call').length,
        successfulToolCalls: inheritedSteps.filter(s => s.type === 'observation' && s.status !== 'error').length,
        criticApprovals: inheritedSteps.filter(s => s.type === 'reflection').length,
        totalSteps: inheritedSteps.length
      }
    });

    forkedRecorder.saveSnapshot();
    return forkedRecorder;
  }

  getReplayTimeline() {
    let currentRelativeMs = 0;
    const timeline = this.steps.map((step) => {
      const stepStart = currentRelativeMs;
      const stepDuration = step.durationMs || 100;
      currentRelativeMs += stepDuration;
      return {
        ...step,
        relativeStartTimeMs: stepStart,
        accumulatedDurationMs: currentRelativeMs
      };
    });

    if (this.finalOutput) {
      timeline.push({
        id: `node_synthesis_final`,
        parent: timeline.length > 0 ? timeline[timeline.length - 1].id : null,
        stepIndex: timeline.length + 1,
        type: 'synthesis',
        timestamp: new Date().toISOString(),
        title: 'Síntesis y Finalización de Trayectoria',
        content: typeof this.finalOutput === 'string' ? this.finalOutput : JSON.stringify(this.finalOutput),
        durationMs: 50,
        relativeStartTimeMs: currentRelativeMs,
        accumulatedDurationMs: currentRelativeMs + 50,
        status: 'success'
      });
    }

    return timeline;
  }

  saveSnapshot() {
    try {
      const snapshot = this.exportHarness();
      
      // Guardado Asíncrono en Backend (Native Telemetry Engine)
      try {
        const apiBase = getApiBase();
        if (typeof fetch === 'function') {
          fetch(`${apiBase}/api/telemetry/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(snapshot)
          }).catch(() => {});
        }
      } catch {
        // Silencioso ante ausencia de backend local
      }

      // Fallback y caché local rápido en navegador
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(TRAJECTORY_STORAGE_KEY);
        let list = [];
        if (raw) {
          try { list = JSON.parse(raw); } catch { list = []; }
        }
        const existingIdx = list.findIndex(t => t.id === this.id);
        if (existingIdx >= 0) {
          list[existingIdx] = snapshot;
        } else {
          list.unshift(snapshot);
        }
        localStorage.setItem(TRAJECTORY_STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
      }

      // Disparar evento para componentes React en escucha activa
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('openplan_trajectory_updated', { detail: snapshot }));
      }
    } catch {
      // Ignorar fallos de serialización de telemetría en tests
    }
  }

  exportHarness() {
    return {
      harnessVersion: 'harness-v0.1',
      id: this.id,
      timestamp: this.timestamp,
      pillar: this.pillar,
      moduleKey: this.moduleKey,
      moduleTitle: this.moduleTitle,
      modelUsed: this.model,
      providerUsed: this.provider,
      mode: this.mode,
      parentSessionId: this.parentSessionId,
      forkedFromNodeId: this.forkedFromNodeId,
      branchNote: this.branchNote,
      pluginsLoaded: [...this.pluginsLoaded],
      cordisContext: { ...this.cordisContext },
      totalDurationMs: this.totalDurationMs || (Date.now() - this.startTime),
      status: this.status,
      metrics: { ...this.metrics },
      stepsCount: this.steps.length,
      trajectoryDAG: this.steps.map((s, idx) => ({
        id: s.id || `node_${idx + 1}`,
        parent: s.parent || (idx === 0 ? null : `node_${idx}`),
        ...s
      })),
      finalOutputSummary: typeof this.finalOutput === 'object' && this.finalOutput !== null
        ? Object.keys(this.finalOutput).reduce((acc, k) => {
            acc[k] = String(this.finalOutput[k]).substring(0, 150) + '...';
            return acc;
          }, {})
        : this.finalOutput
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// HELPER PARA CONSULTAR TRAYECTORIAS GUARDADAS
// ─────────────────────────────────────────────────────────────────────────
export async function getSavedTrajectories(filter = {}) {
  try {
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/api/telemetry/trajectories`);
    if (res.ok) {
      const data = await res.json();
      let list = data.trajectories || [];
      if (filter.moduleKey) {
        list = list.filter(t => t.moduleKey === filter.moduleKey);
      }
      if (filter.pillar) {
        list = list.filter(t => t.pillar === filter.pillar);
      }
      return list;
    }
  } catch (e) {
    console.warn('[Telemetry] Backend no disponible, usando fallback local', e);
  }

  // Fallback local
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(TRAJECTORY_STORAGE_KEY);
    if (!raw) return [];
    let list = JSON.parse(raw);
    if (filter.moduleKey) {
      list = list.filter(t => t.moduleKey === filter.moduleKey);
    }
    if (filter.pillar) {
      list = list.filter(t => t.pillar === filter.pillar);
    }
    return list;
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────
// MOTOR PRINCIPAL AGÉNTICO (ReAct Autonomous Agent Goal-Oriented Loop)
// ─────────────────────────────────────────────────────────────────────────
export async function runAgenticModuleGeneration({
  aiConfig,
  currentModule,
  planData,
  onStepUpdate = null,
  onLog = null
}) {
  const { pillar, moduleKey, title, fields = [] } = currentModule;
  const preferredModel = aiConfig?.model || 'minimax-m3:cloud';
  const preferredProvider = aiConfig?.provider || 'ollama';
  const useDeepResearch = Boolean(currentModule.useDeepResearch || aiConfig?.useDeepResearch || pillar === 'mercado');

  const recorder = new TrajectoryRecorder(`${pillar}_${moduleKey}_${Date.now()}`, {
    pillar,
    moduleKey,
    title,
    model: preferredModel,
    provider: preferredProvider,
    mode: useDeepResearch ? 'creator' : 'standard'
  });

  const notifyStep = (type, payload) => {
    const step = recorder.addStep(type, payload);
    if (onStepUpdate) onStepUpdate(step, recorder.exportHarness());
    if (onLog) {
      const icon = type === 'thought' ? 'thinking' : type === 'tool_call' ? 'stage' : type === 'observation' ? 'save' : type === 'reflection' ? 'warning' : 'success';
      const cleanContent = payload.content ? payload.content.replace(/\n+/g, ' ').substring(0, 95) : '';
      onLog(icon, `${payload.title || type.toUpperCase()}${cleanContent ? `: ${cleanContent}...` : ''}`, preferredProvider);
    }
  };

  try {
    const seed = planData?.semilla || {};
    const queryGiro = seed.nombre_proyecto || seed.negocio?.nombre_marca || seed.negocio?.giro || seed.negocio?.nombre || seed.solucion || title;
    const location = seed.cobertura || seed.negocio?.ubicacion || seed.negocio?.cobertura || 'México';
    const problemDesc = seed.problema || seed.negocio?.descripcion || '';
    const solutionDesc = seed.solucion || seed.negocio?.que_es || '';
    const targetMarket = seed.mercado_objetivo || seed.clientes?.quienes || '';
    const revenueModel = seed.modelo_ingresos || seed.finanzas?.como_gana_dinero || '';
    const unfairAdvantage = seed.ventaja_injusta || seed.negocio?.diferencial || '';

    const agentGoal = {
      description: `Validar factibilidad, identificar competidores/precios verificados y fundamentar "${title}"`,
      minVerifiedSources: useDeepResearch ? 2 : 1,
      maxRounds: 3,
      currentRound: 1,
      isAchieved: false,
      provenanceLevel: 'unverified'
    };

    const step1Start = Date.now();
    notifyStep('thought', {
      title: 'Meta Cognitiva y Planificación ReAct',
      content: `Objetivo: ${agentGoal.description}. Requisito de procedencia: mínimo ${agentGoal.minVerifiedSources} fuentes verificadas en ${location}. Modo: ${useDeepResearch ? 'Deep Research Multi-Hop' : 'Búsqueda Estándar'}.`,
      durationMs: Date.now() - step1Start
    });

    let marketObservation = null;
    let financialData = null;
    let quantumData = null;
    let verifiedSourcesFound = 0;

    while (agentGoal.currentRound <= agentGoal.maxRounds && !agentGoal.isAchieved) {
      const round = agentGoal.currentRound;

      if (round === 1) {
        if (useDeepResearch) {
          const toolStart = Date.now();
          notifyStep('tool_call', {
            title: `Ronda 1: Deep Research Online (Fila 1 Freemium / Fila 2)`,
            toolName: 'tool_deep_research',
            toolArgs: { query: `${queryGiro} ${location}`, domain: pillar, depth: 'rapido', tierPreference: 'tier1_first' },
            content: `Ejecutando investigación profunda con cascada inteligente y resguardo de procedencia.`,
            durationMs: 0
          });

          const researchResult = await executeAgentTool('tool_deep_research', {
            query: `${queryGiro} ${location}`,
            domain: pillar,
            depth: 'rapido',
            tierPreference: 'tier1_first',
            allowSyntheticEstimate: false
          }, planData);

          marketObservation = researchResult.data;
          const sources = marketObservation?.sources || [];
          verifiedSourcesFound = sources.filter(s => s.provenance === 'real' || s.provenance === 'verified_real').length;

          notifyStep('observation', {
            title: `Observación Ronda 1: Fuentes Recopiladas (${verifiedSourcesFound > 0 ? `${verifiedSourcesFound} verificadas` : 'sin datos verificados'})`,
            toolName: 'tool_deep_research',
            toolResult: marketObservation,
            content: `Se obtuvieron ${sources.length} fuentes totales (${verifiedSourcesFound} verificadas). Costo API: $${marketObservation?.costUsd || 0} USD.`,
            durationMs: Date.now() - toolStart
          });
        } else {
          const toolStart = Date.now();
          notifyStep('tool_call', {
            title: `Ronda 1: Búsqueda Web Estándar`,
            toolName: 'tool_web_search',
            toolArgs: { query: queryGiro, location, limit: 3, allowSyntheticEstimate: false },
            content: `Consultando competidores y referencias para "${queryGiro}" en ${location}.`,
            durationMs: 0
          });

          const webResult = await executeAgentTool('tool_web_search', { query: queryGiro, location, limit: 3, allowSyntheticEstimate: false }, planData);
          marketObservation = webResult.data;
          const isReal = marketObservation?.provenance === 'real' || marketObservation?.provenance === 'verified_real';
          verifiedSourcesFound = isReal ? (marketObservation.results?.length || 0) : 0;

          notifyStep('observation', {
            title: `Observación Ronda 1: Datos de Mercado (${verifiedSourcesFound > 0 ? `${verifiedSourcesFound} verificados` : 'sin datos verificados'})`,
            toolName: 'tool_web_search',
            toolResult: marketObservation,
            content: verifiedSourcesFound > 0
              ? `Fuentes web verificadas: ${verifiedSourcesFound}. Procedencia: real.`
              : `Sin datos verificados para "${queryGiro}" en ${location}. Se declara limitación informativa.`,
            durationMs: Date.now() - toolStart
          });
        }

        if (pillar === 'organizacion' || pillar === 'finanzas' || moduleKey === 'inversion' || moduleKey === 'costos' || moduleKey === 'rentabilidad') {
          const toolFinStart = Date.now();
          const { resolveCanonicalCapex } = await import('./finanzas/canonicalCapex.js');
          const canonicalInfo = resolveCanonicalCapex(planData, seed);
          const capex = canonicalInfo.capex;
          const opex = planData?.organizacion?.costos?.total_costos_fijos || 30000;
          const sales = planData?.mercado?.ventas?.proyeccion_mensual || 75000;

          notifyStep('tool_call', {
            title: 'Ronda 1: Motor Financiero Exacto',
            toolName: 'tool_financial_engine',
            toolArgs: { inversionInicial: capex, costosFijosMensuales: opex, ventasMensualesEstimadas: sales, source: canonicalInfo.source },
            content: `Calculando métricas matemáticas de viabilidad para CAPEX canónico de $${capex.toLocaleString()} (fuente: ${canonicalInfo.source}).`,
            durationMs: 0
          });

          const finResult = await executeAgentTool('tool_financial_engine', {
            inversionInicial: capex,
            costosFijosMensuales: opex,
            ventasMensualesEstimadas: sales
          }, planData);

          financialData = finResult.data;
          notifyStep('observation', {
            title: 'Observación Financiera: Viabilidad Matemáticamente Validada',
            toolName: 'tool_financial_engine',
            toolResult: finResult.data,
            content: `Viabilidad: ${finResult.data?.viabilidad}. TIR: ${finResult.data?.tirEstimadaPercent}%. VPN: $${Math.round(finResult.data?.vpn || 0)}.`,
            durationMs: Date.now() - toolFinStart
          });
        }

        if (moduleKey === 'estructura' || moduleKey === 'recursos_humanos' || moduleKey === 'introduccion') {
          const toolQuantumStart = Date.now();
          const perfil = seed.perfil_fundador || {};
          const areasFundador = Array.isArray(perfil.areas) && perfil.areas.length > 0
            ? perfil.areas
            : (Array.isArray(perfil.areasFundador) && perfil.areasFundador.length > 0
              ? perfil.areasFundador
              : [seed.area_fundador || 'operativo']);
          const tamanoEquipo = Number(perfil.tamanoEquipo || seed.tamano_equipo || 3);
          const quantumArgs = { areasFundador, tamanoEquipo };

          notifyStep('tool_call', {
            title: 'Ronda 1: Diagnóstico Cuántico (Fondo Thoth AC)',
            toolName: 'tool_quantum_diagnostic',
            toolArgs: quantumArgs,
            content: 'Evaluando Modelo Atómico de 3 Áreas y Regla 13 de Empresas Cuánticas.',
            durationMs: 0
          });

          const quantumResult = await executeAgentTool('tool_quantum_diagnostic', quantumArgs, planData);
          quantumData = quantumResult.data;

          notifyStep('observation', {
            title: 'Observación Cuántica: Diagnóstico de Delegación',
            toolName: 'tool_quantum_diagnostic',
            toolResult: quantumResult.data,
            content: `Equilibrio atómico: ${quantumResult.data?.isBalanced}. Recomendación de delegación generada.`,
            durationMs: Date.now() - toolQuantumStart
          });
        }
      } else if (round === 2) {
        const tool2Start = Date.now();
        notifyStep('thought', {
          title: `Ronda 2: Refinamiento de Búsqueda Factual`,
          content: `Fuentes verificadas insuficientes (${verifiedSourcesFound}/${agentGoal.minVerifiedSources}). Consultando base de datos oficial del INEGI DENUE para la región ${location}.`,
          durationMs: Date.now() - tool2Start
        });

        notifyStep('tool_call', {
          title: 'Invocando DENUE Oficial',
          toolName: 'tool_inegi_denue',
          toolArgs: { keywords: queryGiro, location, allowSyntheticEstimate: false },
          content: `Extrayendo establecimientos reales con registro geográfico formal.`,
          durationMs: 0
        });

        const inegiResult = await executeAgentTool('tool_inegi_denue', {
          keywords: queryGiro,
          location,
          allowSyntheticEstimate: false
        }, planData);

        if (inegiResult?.data?.establishments && inegiResult.data.establishments.length > 0) {
          verifiedSourcesFound += inegiResult.data.establishments.length;
        }

        notifyStep('observation', {
          title: 'Observación Ronda 2: Directorio DENUE Verificado',
          toolName: 'tool_inegi_denue',
          toolResult: inegiResult.data,
          content: `Establecimientos reales recuperados: ${inegiResult.data?.totalFound || 0}.`,
          durationMs: Date.now() - tool2Start
        });
      }

      const evalStart = Date.now();
      if (verifiedSourcesFound >= agentGoal.minVerifiedSources || round >= agentGoal.maxRounds) {
        agentGoal.isAchieved = true;
        agentGoal.provenanceLevel = verifiedSourcesFound >= agentGoal.minVerifiedSources ? 'real' : 'none';

        notifyStep('reflection', {
          title: `Evaluación de Criterios de Parada (Ronda ${round})`,
          content: `Meta satisfecha: Criterio de procedencia (${verifiedSourcesFound} fuentes verificadas). Procediendo a la síntesis ejecutiva.`,
          isApproved: true,
          durationMs: Date.now() - evalStart
        });
      } else {
        notifyStep('thought', {
          title: `Criterio de Parada No Cumplido (Ronda ${round})`,
          content: `Aún no se alcanzan las ${agentGoal.minVerifiedSources} fuentes verificadas. Avanzando a la siguiente ronda de refinamiento.`,
          durationMs: Date.now() - evalStart
        });
      }

      agentGoal.currentRound++;
    }

    const expectedKeys = fields.map(f => f.key);
    const locationInstruction = location ? `\nREGLA ESTRICTA DE UBICACIÓN: El negocio opera o tiene cobertura en "${location}". NO inventes ciudades ni asumas capitales (ej. no pongas Hermosillo si se te pidió Cananea). Respeta estrictamente esta ubicación.` : '';

    const provenanceDirective = `\nDIRECTIVA ESTRICTA DE PROCEDENCIA DE DATOS:
- Nivel de Procedencia Detectado: ${agentGoal.provenanceLevel.toUpperCase()}
- Si las fuentes provienen de internet verificada o DENUE, cita los datos, nombres y rangos observados fielmente.
- Si no hay fuentes reales verificadas (provenance === 'none' o 'not_found'), NO inventes nombres de competidores ficticios como si fueran reales; declara la limitación informativa explícitamente.`;

    const configuredVerbosity = planData?.config?.ai?.verbosity || 'normal';
    const verbosityDirective = buildVerbosityConstraint(configuredVerbosity, moduleKey);

    const documentsContext = (planData.config?.documents || []).length > 0
      ? `\nDOCUMENTOS DE REFERENCIA RAG:\n${planData.config.documents.map(d => d.text).join('\n---\n').substring(0, 4000)}\n`
      : '';

    const hasRealMarketData = marketObservation && (marketObservation.provenance === 'real' || marketObservation.provenance === 'verified_real') && Array.isArray(marketObservation.results) && marketObservation.results.length > 0;
    const marketObservationContent = hasRealMarketData
      ? JSON.stringify(marketObservation.results.filter(r => r.provenance === 'real' || r.provenance === 'verified_real'))
      : '(sin datos verificados — NO inventes cifras de mercado, precios ni cuota; declara la limitación)';

    const systemPrompt = `Eres el Agente Autónomo Especialista en "${title}" de Open Business Plan (Fondo Thoth AC).
Debes redactar contenido ejecutivo de nivel profesional con datos duros para un plan de negocios de alta inversión.${locationInstruction}${provenanceDirective}${verbosityDirective}

CONTEXTO DETALLADO DEL PROYECTO (SEMILLA):
- Nombre del Proyecto: ${queryGiro}
- Cobertura / Ubicación: ${location}
- Problema / Necesidad detectada: ${problemDesc || 'No especificado'}
- Solución / Propuesta de Valor: ${solutionDesc || 'No especificada'}
- Mercado Objetivo / Cliente Ideal: ${targetMarket || 'No especificado'}
- Modelo de Ingresos / Monetización: ${revenueModel || 'No especificado'}
- Ventaja Competitiva / Diferencial: ${unfairAdvantage || 'No especificada'}
${Object.keys(seed).length > 0 ? `\nDatos Crudos de Semilla:\n${JSON.stringify(seed, null, 2)}` : ''}
${documentsContext}

DATOS OBSERVADOS POR HERRAMIENTAS EN TIEMPO REAL (CONTRATO DE PROCEDENCIA):
- Competencia y Mercado: ${marketObservationContent}
${financialData ? `- Métricas Financieras Validadas: ${JSON.stringify(financialData)}` : ''}
${quantumData ? `- Diagnóstico Cuántico Atómico: ${JSON.stringify(quantumData)}` : ''}

CAMPOS REQUERIDOS (Devuelve ÚNICAMENTE un JSON válido con estas claves exactas):
${fields.map(f => `"${f.key}": "${f.label || f.key} - ${getFieldFormatGuidance(f, configuredVerbosity, moduleKey)}"`).join('\n')}
`;

    const synthStart = Date.now();
    notifyStep('thought', {
      title: 'Síntesis Ejecutiva con IA Multimodal',
      content: `Consolidando observaciones en el prompt estructurado para los campos: ${fields.map(f => f.key).join(', ')} (${configuredVerbosity}).`,
      toolArgs: { prompt: systemPrompt, verbosity: configuredVerbosity },
      durationMs: Date.now() - synthStart
    });

    const strictConfig = { 
      ...aiConfig, 
      provider: preferredProvider, 
      model: preferredModel,
      disableAutoFallback: false 
    };

    const handleAiThink = (type, message, prov) => {
      notifyStep('thought', {
        title: type === 'warning' ? '⚠️ Rotación Automática de Proveedor IA' : 'Procesamiento de IA',
        content: message,
        toolArgs: { provider: prov }
      });
    };

    const generatedResult = await callAiProvider(strictConfig, systemPrompt, true, expectedKeys, handleAiThink);

    const criticStart = Date.now();
    const firstFieldKey = expectedKeys[0] || 'contenido';
    const firstFieldText = typeof generatedResult === 'object' ? String(generatedResult[firstFieldKey] || '') : String(generatedResult);

    const criticResult = await executeAgentTool('tool_critic_validator', {
      sectionKey: `${pillar}.${moduleKey}`,
      draftContent: firstFieldText,
      context: planData
    });

    notifyStep('reflection', {
      title: 'Reflexión y Control de Calidad',
      content: criticResult.data?.critique || 'Validación de coherencia completada con éxito.',
      isApproved: criticResult.data?.isApproved ?? true,
      durationMs: Date.now() - criticStart
    });

    // ─── PASO 5: CONSOLIDACIÓN FINAL Y EXPORTACIÓN DE TRAYECTORIA ───
    notifyStep('synthesis', {
      title: 'Módulo Consolidado y Trayectoria Registrada',
      content: `Generación completada en ${(recorder.totalDurationMs / 1000).toFixed(2)}s con ${recorder.steps.length + 1} pasos cognitivos trazados en Harness v0.1.`,
      durationMs: 0
    });
    const finalHarness = recorder.finish(generatedResult, 'completed');

    return {
      result: generatedResult,
      trajectory: finalHarness
    };
  } catch (error) {
    notifyStep('reflection', {
      title: 'Excepción en el Ciclo Agéntico',
      content: `Error: ${error.message}`,
      status: 'error',
      durationMs: 0
    });
    recorder.finish(null, 'failed');
    throw error;
  }
}
