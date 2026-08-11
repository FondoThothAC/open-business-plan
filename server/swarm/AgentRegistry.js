/**
 * AgentRegistry.js - Registro Dinámico y Gestor Evolutivo de Agentes
 * 
 * Conecta el catálogo de frameworks con el AgentStore persistente, el SkillMatcher
 * semántico y el AgentGenerator para proporcionar un pool de agentes especialistas
 * optimizado para cada anteproyecto.
 */

import { InterviewerAgent } from './agents/InterviewerAgent.js';
import { MarketAgent } from './agents/MarketAgent.js';
import { FinancialAgent } from './agents/FinancialAgent.js';
import { CapexAgent } from './agents/CapexAgent.js';
import { TechIdAgent } from './agents/TechIdAgent.js';
import { SocialMmlAgent } from './agents/SocialMmlAgent.js';
import { LeanMvpAgent } from './agents/LeanMvpAgent.js';
import { StrategyAgent } from './agents/StrategyAgent.js';
import { QuantumDiagnosticAgent } from './agents/QuantumDiagnosticAgent.js';
import { SynthesizerAgent } from './agents/SynthesizerAgent.js';
import { agentStore } from './AgentStore.js';
import { SkillMatcher } from './SkillMatcher.js';
import { AgentGenerator } from './AgentGenerator.js';

export class AgentRegistry {
  /**
   * Retorna una instancia del Agente Entrevistador para la Fase 1.
   * @returns {InterviewerAgent}
   */
  static getInterviewer() {
    return new InterviewerAgent();
  }

  /**
   * Retorna el conjunto base de agentes especialistas para un framework dado.
   * @param {string} frameworkId 
   * @returns {Array<Object>}
   */
  static getAgentsForFramework(frameworkId) {
    const agentsMap = {
      business: [
        new MarketAgent(),
        new FinancialAgent(),
        new StrategyAgent(),
        new QuantumDiagnosticAgent(),
        new SynthesizerAgent()
      ],
      social_bid: [
        new SocialMmlAgent(),
        new StrategyAgent(),
        new QuantumDiagnosticAgent(),
        new SynthesizerAgent()
      ],
      agile_startup: [
        new LeanMvpAgent(),
        new MarketAgent(),
        new FinancialAgent(),
        new QuantumDiagnosticAgent(),
        new SynthesizerAgent()
      ],
      technology_id: [
        new TechIdAgent(),
        new MarketAgent(),
        new FinancialAgent(),
        new QuantumDiagnosticAgent(),
        new SynthesizerAgent()
      ],
      investment_project: [
        new CapexAgent(),
        new MarketAgent(),
        new FinancialAgent(),
        new QuantumDiagnosticAgent(),
        new SynthesizerAgent()
      ],
      micro_business: [
        new MarketAgent(),
        new FinancialAgent(),
        new StrategyAgent(),
        new QuantumDiagnosticAgent(),
        new SynthesizerAgent()
      ],
      zopp: [
        new SocialMmlAgent(),
        new StrategyAgent(),
        new QuantumDiagnosticAgent(),
        new SynthesizerAgent()
      ],
      horizon_europe: [
        new TechIdAgent(),
        new StrategyAgent(),
        new QuantumDiagnosticAgent(),
        new SynthesizerAgent()
      ],
      hoshin_kanri: [
        new StrategyAgent(),
        new FinancialAgent(),
        new QuantumDiagnosticAgent(),
        new SynthesizerAgent()
      ],
      amoeba_management: [
        new StrategyAgent(),
        new FinancialAgent(),
        new QuantumDiagnosticAgent(),
        new SynthesizerAgent()
      ],
      guanxi_plan: [
        new StrategyAgent(),
        new MarketAgent(),
        new QuantumDiagnosticAgent(),
        new SynthesizerAgent()
      ],
      onudi_project: [
        new CapexAgent(),
        new MarketAgent(),
        new StrategyAgent(),
        new QuantumDiagnosticAgent(),
        new SynthesizerAgent()
      ]
    };

    return agentsMap[frameworkId] || agentsMap.business;
  }

  /**
   * Resuelve dinámicamente el pool de agentes evaluando coincidencias semánticas,
   * reutilizando agentes del store o auto-generando especialistas con auto-reflexión.
   * @param {Object} context - Contexto del anteproyecto e idea
   * @returns {Promise<Object>} { agents: Array, matchingReport: Array }
   */
  static async resolveDynamicPool(context) {
    await agentStore.initialize();
    const catalog = agentStore.getAllAgents();
    const matcher = new SkillMatcher(catalog);
    const generator = new AgentGenerator(agentStore);

    const baseAgents = this.getAgentsForFramework(context.frameworkId || 'business');
    const matchingReport = [];
    const dynamicAgents = [];

    for (const baseAgent of baseAgents) {
      if (baseAgent.id === 'synthesizer') {
        dynamicAgents.push(baseAgent);
        continue;
      }

      const matchResult = matcher.findBestMatch({
        description: `${context.ideaText || ''} ${context.sector || ''}`,
        domainKeywords: [baseAgent.id, context.sector || '']
      });

      if (matchResult.action === 'reuse') {
        // Reutilizar agente del store
        matchingReport.push({
          agentId: baseAgent.id,
          name: baseAgent.name,
          status: 'reused',
          badgeText: '⚡ Reutilizado (0 Tokens)',
          tokensSaved: 4500,
          matchScore: matchResult.score
        });
        await agentStore.recordAgentUsage(baseAgent.id, { tokensSaved: 4500 });
        dynamicAgents.push(baseAgent);
      } else if (matchResult.action === 'specialize') {
        // Especializar agente base
        const specResult = await generator.specializeAgent(baseAgent, {
          sector: context.sector || 'Especializado',
          description: context.ideaText
        });
        matchingReport.push({
          agentId: specResult.agent.id,
          name: specResult.agent.name,
          status: 'specialized',
          badgeText: '🧬 Especializado (~30% Ahorro)',
          tokensSaved: 2000,
          matchScore: matchResult.score
        });
        dynamicAgents.push(baseAgent);
      } else {
        // Auto-generar nuevo agente especialista
        const newSpecResult = await generator.generateNewSpecialist({
          sector: context.sector || 'Nuevo Sector',
          description: context.ideaText
        });
        matchingReport.push({
          agentId: newSpecResult.agent.id,
          name: newSpecResult.agent.name,
          status: 'generated_new',
          badgeText: '✨ Nuevo Agente Creado',
          tokensSaved: 0,
          matchScore: matchResult.score
        });
        dynamicAgents.push(baseAgent);
      }
    }

    return {
      agents: dynamicAgents,
      matchingReport
    };
  }
}
