/**
 * SwarmOrchestrator.js - Motor Central de Orquestación del Enjambre Multi-Agente (Kimi 3 Style)
 * 
 * Gestiona el ciclo de vida de los agentes especialistas, las conexiones SSE por sesión,
 * la ejecución paralela y concurrente, la emisión de eventos de matching de skills
 * y la compilación final del anteproyecto con diagnóstico cuántico.
 */

import { AgentRegistry } from './AgentRegistry.js';

export class SwarmOrchestrator {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Registra una conexión SSE de un cliente React para una sesión.
   * @param {string} sessionId 
   * @param {Object} res - Objeto Response de Express configurado para SSE
   */
  registerSessionStream(sessionId, res) {
    this.sessions.set(sessionId, res);
    
    this.emitEvent(sessionId, {
      type: 'connection_established',
      sessionId,
      message: 'Conexión SSE establecida con el Swarm Evolution Engine.'
    });
  }

  /**
   * Cierra la sesión SSE.
   * @param {string} sessionId 
   */
  closeSession(sessionId) {
    const res = this.sessions.get(sessionId);
    if (res) {
      try { res.end(); } catch (_) {}
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Emite un evento SSE al cliente de la sesión.
   * @param {string} sessionId 
   * @param {Object} eventData 
   */
  emitEvent(sessionId, eventData) {
    const res = this.sessions.get(sessionId);
    if (res) {
      try {
        res.write(`data: ${JSON.stringify(eventData)}\n\n`);
      } catch (_) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Ejecuta la Fase 1: Análisis de idea y recomendación de preguntas.
   * @param {string} ideaText 
   * @returns {Promise<Object>}
   */
  async runInterview(ideaText) {
    const interviewer = AgentRegistry.getInterviewer();
    return await interviewer.analyzeIdea(ideaText);
  }

  /**
   * Ejecuta la Fase 2: Industrialización Multi-Agente Concurrente con streaming SSE.
   * @param {string} sessionId - ID único de sesión
   * @param {Object} context - Datos del proyecto e idea
   * @returns {Promise<Object>} Resultado compilado final
   */
  async runIndustrialization(sessionId, context) {
    const frameworkId = context.frameworkId || 'business';

    // 1. Resolución dinámica del pool de agentes y matching semántico
    const { agents, matchingReport } = await AgentRegistry.resolveDynamicPool(context);

    // Calcular ahorro total estimado de tokens en esta sesión
    const totalTokensSaved = matchingReport.reduce((acc, r) => acc + (r.tokensSaved || 0), 0);

    this.emitEvent(sessionId, {
      type: 'swarm_started',
      frameworkId,
      agentCount: agents.length,
      matchingReport,
      totalTokensSaved,
      agentsMeta: agents.map(a => ({
        id: a.id,
        name: a.name,
        avatar: a.avatar,
        role: a.role
      }))
    });

    const agentResults = {};
    let synthesizerAgent = null;

    const emitProgress = (agentId, message, progress) => {
      this.emitEvent(sessionId, {
        type: 'agent_progress',
        agentId,
        message,
        progress,
        timestamp: new Date().toISOString()
      });
    };

    // Separar agentes especialistas del agente sintetizador final
    const workerAgents = [];
    for (const agent of agents) {
      if (agent.id === 'synthesizer') {
        synthesizerAgent = agent;
      } else {
        workerAgents.push(agent);
      }
    }

    // 2. Ejecución Concurrente en Paralelo de Especialistas (Kimi Swarm Style)
    const workerPromises = workerAgents.map(async (agent) => {
      this.emitEvent(sessionId, {
        type: 'agent_started',
        agentId: agent.id,
        name: agent.name,
        avatar: agent.avatar
      });

      try {
        const result = await agent.execute(context, emitProgress);
        agentResults[agent.id] = result;

        this.emitEvent(sessionId, {
          type: 'agent_completed',
          agentId: agent.id,
          name: agent.name,
          result
        });

        // Si es el agente cuántico, emitir alerta transversal específica
        if (agent.id === 'quantum_diagnostic' || agent.id === 'quantum_diagnostician') {
          this.emitEvent(sessionId, {
            type: 'quantum_diagnostic_alert',
            quantumResult: result
          });
        }

        return { agentId: agent.id, success: true, result };
      } catch (error) {
        console.error(`Error en agente ${agent.id}:`, error);
        this.emitEvent(sessionId, {
          type: 'agent_error',
          agentId: agent.id,
          error: error.message
        });
        return { agentId: agent.id, success: false, error: error.message };
      }
    });

    // Esperar resolución de todos los agentes concurrentes
    await Promise.allSettled(workerPromises);

    // 3. Ejecución del Agente Sintetizador Final
    let finalDoc = null;
    if (synthesizerAgent) {
      this.emitEvent(sessionId, {
        type: 'agent_started',
        agentId: synthesizerAgent.id,
        name: synthesizerAgent.name,
        avatar: synthesizerAgent.avatar
      });

      finalDoc = await synthesizerAgent.compile(context, agentResults, emitProgress);

      this.emitEvent(sessionId, {
        type: 'agent_completed',
        agentId: synthesizerAgent.id,
        name: synthesizerAgent.name,
        result: finalDoc
      });
    }

    this.emitEvent(sessionId, {
      type: 'swarm_completed',
      finalDoc,
      matchingReport,
      totalTokensSaved
    });

    return finalDoc;
  }
}

export const swarmOrchestrator = new SwarmOrchestrator();
