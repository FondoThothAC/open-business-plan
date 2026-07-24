/**
 * SwarmOrchestrator.js - Motor Central de Orquestación del Enjambre Multi-Agente
 * 
 * Gestiona el ciclo de vida de los agentes especialistas, las conexiones SSE por sesión
 * y la compilación final de anteproyectos.
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
    
    // Notificar conexión exitosa
    this.emitEvent(sessionId, {
      type: 'connection_established',
      sessionId,
      message: 'Conexión SSE establecida con el Swarm Engine.'
    });
  }

  /**
   * Cierra la sesión SSE.
   * @param {string} sessionId 
   */
  closeSession(sessionId) {
    const res = this.sessions.get(sessionId);
    if (res) {
      res.end();
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
      res.write(`data: ${JSON.stringify(eventData)}\n\n`);
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
   * Ejecuta la Fase 2: Industrialización Multi-Agente con streaming SSE.
   * @param {string} sessionId - ID único de sesión
   * @param {Object} context - Datos del proyecto e idea
   * @returns {Promise<Object>} Resultado compilado final
   */
  async runIndustrialization(sessionId, context) {
    const frameworkId = context.frameworkId || 'business';
    const agents = AgentRegistry.getAgentsForFramework(frameworkId);

    this.emitEvent(sessionId, {
      type: 'swarm_started',
      frameworkId,
      agentCount: agents.length,
      agentsMeta: agents.map(a => ({ id: a.id, name: a.name, avatar: a.avatar, role: a.role }))
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

    // Procesar agentes especialistas (excepto sintetizador)
    for (const agent of agents) {
      if (agent.id === 'synthesizer') {
        synthesizerAgent = agent;
        continue;
      }

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
      } catch (error) {
        console.error(`Error en agente ${agent.id}:`, error);
        this.emitEvent(sessionId, {
          type: 'agent_error',
          agentId: agent.id,
          error: error.message
        });
      }
    }

    // Ejecutar agente sintetizador final si existe
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
      finalDoc
    });

    return finalDoc;
  }
}

export const swarmOrchestrator = new SwarmOrchestrator();
