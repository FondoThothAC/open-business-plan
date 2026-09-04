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
      harnessVersion: 'dsh-session-v0.1',
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
// MOTOR PRINCIPAL AGÉNTICO (ReAct Autonomous Agent Loop)
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

  const recorder = new TrajectoryRecorder(`${pillar}_${moduleKey}_${Date.now()}`, {
    pillar,
    moduleKey,
    title,
    model: preferredModel,
    provider: preferredProvider
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
    // ─── PASO 1: PENSAMIENTO Y PLANIFICACIÓN AGÉNTICA (Thought / CoT) ───
    const step1Start = Date.now();
    notifyStep('thought', {
      title: 'Razonamiento Estratégico',
      content: `Estructurando módulo "${title}" (${pillar}/${moduleKey}) con herramientas de validación de mercado y cálculo.`,
      durationMs: Date.now() - step1Start
    });

    // ─── RESOLUCIÓN ROBUSTA DEL CONTEXTO DE LA SEMILLA (Soporte Dual: Plano y Anidado) ───
    const seed = planData?.semilla || {};
    const queryGiro = seed.nombre_proyecto || seed.negocio?.nombre_marca || seed.negocio?.giro || seed.negocio?.nombre || seed.solucion || title;
    const location = seed.cobertura || seed.negocio?.ubicacion || seed.negocio?.cobertura || 'México';
    const problemDesc = seed.problema || seed.negocio?.descripcion || '';
    const solutionDesc = seed.solucion || seed.negocio?.que_es || '';
    const targetMarket = seed.mercado_objetivo || seed.clientes?.quienes || '';
    const revenueModel = seed.modelo_ingresos || seed.finanzas?.como_gana_dinero || '';
    const unfairAdvantage = seed.ventaja_injusta || seed.negocio?.diferencial || '';

    // ─── PASO 2: SELECCIÓN E INVOCACIÓN DE HERRAMIENTAS EN VIVO (Tool Execution) ───
    // Invocación 1: Búsqueda de Mercado Web
    const tool1Start = Date.now();
    notifyStep('tool_call', {
      title: 'Búsqueda Web en Vivo',
      toolName: 'tool_web_search',
      toolArgs: { query: queryGiro, location, limit: 3 },
      content: `Consultando competidores y precios para "${queryGiro}" en ${location}.`,
      durationMs: 0
    });

    const webResult = await executeAgentTool('tool_web_search', { query: queryGiro, location, limit: 3 }, planData);
    
    notifyStep('observation', {
      title: 'Observación: Datos de Mercado en Tiempo Real',
      toolName: 'tool_web_search',
      toolResult: webResult.data,
      content: `Se obtuvieron ${webResult.data?.competitorsFound || 0} competidores clave. Precios promedio identificados.`,
      durationMs: Date.now() - tool1Start
    });

    // Invocación 2: Si el módulo es financiero o de inversión, invocar motor financiero
    let financialData = null;
    if (pillar === 'organizacion' || pillar === 'finanzas' || moduleKey === 'inversion' || moduleKey === 'costos' || moduleKey === 'rentabilidad') {
      const tool2Start = Date.now();
      const capex = planData?.organizacion?.inversion?.monto_inversion || seed.finanzas?.inversion_inicial || 150000;
      const opex = planData?.organizacion?.costos?.total_costos_fijos || 30000;
      const sales = planData?.mercado?.ventas?.proyeccion_mensual || 75000;

      notifyStep('tool_call', {
        title: 'Invocando Herramienta: Motor Financiero Exacto',
        toolName: 'tool_financial_engine',
        toolArgs: { inversionInicial: capex, costosFijosMensuales: opex, ventasMensualesEstimadas: sales },
        content: `Calculando métricas matemáticas de viabilidad (TIR, VPN, Punto de Equilibrio) para CAPEX de $${capex}.`,
        durationMs: 0
      });

      const finResult = await executeAgentTool('tool_financial_engine', {
        inversionInicial: capex,
        costosFijosMensuales: opex,
        ventasMensualesEstimadas: sales
      }, planData);

      financialData = finResult.data;
      notifyStep('observation', {
        title: 'Observación: Resultados del Motor Financiero',
        toolName: 'tool_financial_engine',
        toolResult: finResult.data,
        content: `Viabilidad: ${finResult.data?.viabilidad}. TIR estimada: ${finResult.data?.tirEstimadaPercent}%. Punto de equilibrio: $${finResult.data?.puntoEquilibrioVentasMensual} MXN/mes.`,
        durationMs: Date.now() - tool2Start
      });
    }

    // Invocación 3: Diagnóstico Cuántico si aplica al fundador o estructura
    if (moduleKey === 'estructura' || moduleKey === 'recursos_humanos' || moduleKey === 'introduccion') {
      const tool3Start = Date.now();
      notifyStep('tool_call', {
        title: 'Invocando Herramienta: Diagnóstico Cuántico (Fondo Thoth AC)',
        toolName: 'tool_quantum_diagnostic',
        toolArgs: { areasFundador: ['operativo'], tamanoEquipo: 3 },
        content: 'Verificando Regla 13 de Empresas Cuánticas (Modelo Atómico de 3 Áreas y Delegación).',
        durationMs: 0
      });

      const quantumResult = await executeAgentTool('tool_quantum_diagnostic', { areasFundador: ['operativo'], tamanoEquipo: 3 }, planData);

      notifyStep('observation', {
        title: 'Observación: Diagnóstico Cuántico de Delegación',
        toolName: 'tool_quantum_diagnostic',
        toolResult: quantumResult.data,
        content: `Áreas balanceadas: ${quantumResult.data?.isBalanced}. Recomendación de delegación generada.`,
        durationMs: Date.now() - tool3Start
      });
    }

    // ─── PASO 3: SÍNTESIS Y GENERACIÓN CON MODELO PRIORITARIO (Minimax-M3 / Groq) ───
    const expectedKeys = fields.map(f => f.key);
    const locationInstruction = location ? `\nREGLA ESTRICTA DE UBICACIÓN: El negocio opera o tiene cobertura en "${location}". NO inventes ciudades ni asumas capitales (ej. no pongas Hermosillo si se te pidió Cananea). Respeta estrictamente esta ubicación.` : '';

    const documentsContext = (planData.config?.documents || []).length > 0
      ? `\nDOCUMENTOS DE REFERENCIA RAG:\n${planData.config.documents.map(d => d.text).join('\n---\n').substring(0, 4000)}\n`
      : '';

    const systemPrompt = `Eres el Agente Autónomo Especialista en "${title}" de Open Business Plan (Fondo Thoth AC).
Debes redactar contenido ejecutivo de nivel profesional con datos duros para un plan de negocios de alta inversión.${locationInstruction}

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

DATOS OBSERVADOS POR HERRAMIENTAS EN TIEMPO REAL:
- Competencia y Mercado: ${JSON.stringify(webResult?.data || {})}
${financialData ? `- Métricas Financieras Validadas: ${JSON.stringify(financialData)}` : ''}

CAMPOS REQUERIDOS (Devuelve ÚNICAMENTE un JSON válido con estas claves exactas):
${fields.map(f => `"${f.key}": "${f.label || f.key} - ${f.type === 'mermaid' ? 'Código Mermaid.js válido' : 'Texto detallado y ejecutivo directamente vinculado a la propuesta de valor y ubicación del proyecto'}"`).join('\n')}
`;

    const synthStart = Date.now();
    notifyStep('thought', {
      title: 'Síntesis Ejecutiva con IA Multimodal',
      content: `Consolidando observaciones de herramientas en el prompt estructurado para los campos: ${fields.map(f => f.key).join(', ')}.`,
      toolArgs: { prompt: systemPrompt },
      durationMs: Date.now() - synthStart
    });

    // Priorizar el modelo configurado pero permitir fallback en timeout/500 para industrialización
    const strictConfig = { 
      ...aiConfig, 
      provider: preferredProvider, 
      model: preferredModel,
      disableAutoFallback: false 
    };
    const generatedResult = await callAiProvider(strictConfig, systemPrompt, true, expectedKeys);

    // ─── PASO 4: REFLEXIÓN Y VALIDACIÓN CRÍTICA (Critic-in-the-Loop) ───
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
    const finalHarness = recorder.finish(generatedResult, 'completed');
    notifyStep('synthesis', {
      title: 'Módulo Consolidado y Trayectoria Registrada',
      content: `Generación completada en ${(recorder.totalDurationMs / 1000).toFixed(2)}s con ${recorder.steps.length} pasos cognitivos trazados en DeepSeek Harness.`,
      durationMs: 0
    });

    return {
      result: generatedResult,
      trajectory: finalHarness
    };
  } catch (error) {
    recorder.finish(null, 'failed');
    notifyStep('reflection', {
      title: 'Excepción en el Ciclo Agéntico',
      content: `Error: ${error.message}`,
      status: 'error',
      durationMs: 0
    });
    throw error;
  }
}
