/**
 * AgentRegistry.js - Registro Dinámico de Agentes Reutilizables
 * 
 * Mapea los 12 frameworks de Open Business Plan con su pool dinámico
 * de agentes especialistas asignados, incluyendo el QuantumDiagnosticAgent.
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

export class AgentRegistry {
  /**
   * Retorna una instancia del Agente Entrevistador para la Fase 1.
   * @returns {InterviewerAgent}
   */
  static getInterviewer() {
    return new InterviewerAgent();
  }

  /**
   * Retorna el conjunto de agentes especialistas para un framework dado.
   * @param {string} frameworkId - Identificador del framework (ej: 'business', 'social_bid', 'technology_id')
   * @returns {Array<Object>} Lista de instancias de agentes especialistas.
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
}
