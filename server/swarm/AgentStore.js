/**
 * AgentStore.js - Almacén Persistente y Gestor del Ciclo de Vida de Agentes
 * 
 * Gestiona el catálogo permanente de agentes en disco (`server/swarm/agent_store/`),
 * rastrea métricas de efectividad y ahorro de tokens, y genera paquetes de exportación
 * mensuales para sincronización con Fondo Thoth AC.
 */

import fs from 'fs';
import path from 'path';

export class AgentStore {
  /**
   * @param {string} storageDir - Ruta absoluta o relativa al directorio de almacenamiento.
   */
  constructor(storageDir = path.resolve('server/swarm/agent_store')) {
    this.storageDir = storageDir;
    this.agentsMap = new Map();
  }

  /**
   * Inicializa el almacenamiento en disco y carga todos los agentes registrados.
   */
  async initialize() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }

    // Cargar archivos JSON existentes
    const files = fs.readdirSync(this.storageDir).filter(f => f.endsWith('.json'));
    
    if (files.length === 0) {
      await this.seedBaseAgents();
    } else {
      for (const file of files) {
        try {
          const filePath = path.join(this.storageDir, file);
          const raw = fs.readFileSync(filePath, 'utf-8');
          const agentData = JSON.parse(raw);
          if (agentData && agentData.id) {
            this.agentsMap.set(agentData.id, agentData);
          }
        } catch (err) {
          console.error(`Error al cargar agente desde ${file}:`, err.message);
        }
      }
    }
  }

  /**
   * Inicializa los agentes base del sistema si el almacén está vacío.
   */
  async seedBaseAgents() {
    const baseAgents = [
      {
        id: 'market_researcher',
        version: '1.0.0',
        name: 'Investigador de Mercado & SCIAN',
        avatar: '🕵️',
        role: 'Análisis de Competencia, Segmentación TAM/SAM/SOM y Códigos SCIAN',
        domain: ['mercado', 'competencia', 'scian', 'tam', 'sam', 'som', 'clientes', 'demanda', 'precios', 'denue'],
        systemPrompt: 'Eres un investigador principal de mercado experto en segmentación demográfica, análisis de oferta y demanda y clasificación industrial SCIAN/INEGI.',
        toolsRequired: ['denue_search', 'web_scraper', 'competitor_matrix'],
        evaluationScore: 9.8,
        metrics: { usageCount: 0, tokensSaved: 0, averageRating: 9.8 },
        createdAt: new Date().toISOString()
      },
      {
        id: 'financial_analyst',
        version: '1.0.0',
        name: 'Analista Financiero & Viabilidad',
        avatar: '📊',
        role: 'Modelación Financiera, VAN, TIR, Flujo de Caja y Punto de Equilibrio',
        domain: ['finanzas', 'van', 'tir', 'flujo de caja', 'capex', 'opex', 'costos', 'precios', 'retorno', 'inversion'],
        systemPrompt: 'Eres un analista financiero sénior especializado en evaluación de proyectos de inversión, cálculo de WACC, estados de resultados proforma y sensibilidad.',
        toolsRequired: ['calculadora_financiera', 'simulador_montecarlo'],
        evaluationScore: 9.9,
        metrics: { usageCount: 0, tokensSaved: 0, averageRating: 9.9 },
        createdAt: new Date().toISOString()
      },
      {
        id: 'quantum_diagnostician',
        version: '1.0.0',
        name: 'Diagnosticador Cuántico (Fondo Thoth AC)',
        avatar: '⚛️',
        role: 'Modelo Atómico de 3 Áreas, Detección de Fusión Atómica y Recomendación de Delegación',
        domain: ['cuantico', 'delegacion', 'fundador', 'areas atomicas', 'escalamiento', 'antipatrones', 'perfil fundador'],
        systemPrompt: 'Eres el auditor de la metodología propietaria Empresas Cuánticas de Fondo Thoth AC. Evalúas el perfil del emprendedor en el átomo de Finanzas, Operaciones y Administración.',
        toolsRequired: ['quantum_evaluator', 'delegation_profiler'],
        evaluationScore: 10.0,
        metrics: { usageCount: 0, tokensSaved: 0, averageRating: 10.0 },
        createdAt: new Date().toISOString()
      },
      {
        id: 'strategy_consultant',
        version: '1.0.0',
        name: 'Estratega de Negocios & Modelo Canvas',
        avatar: '🧭',
        role: 'Estrategia Competitiva, Propuesta de Valor y Modelo de Negocio',
        domain: ['estrategia', 'canvas', 'propuesta de valor', 'foda', 'diferenciacion', 'vision', 'mision'],
        systemPrompt: 'Eres un consultor de estrategia empresarial de alto nivel. Creas matrices FODA cruzadas, estrategias del Océano Azul y planes de mitigación de riesgos.',
        toolsRequired: ['strategy_matrix', 'foda_generator'],
        evaluationScore: 9.6,
        metrics: { usageCount: 0, tokensSaved: 0, averageRating: 9.6 },
        createdAt: new Date().toISOString()
      },
      {
        id: 'tech_id_specialist',
        version: '1.0.0',
        name: 'Especialista en I+D & Transferencia Tecnológica',
        avatar: '🔬',
        role: 'Niveles TRL, Propiedad Intelectual y Vigilancia Tecnológica',
        domain: ['tecnologia', 'trl', 'patentes', 'i+d', 'prototipos', 'software', 'hardware', 'innovacion'],
        systemPrompt: 'Eres un experto en gestión de la innovación tecnológica, evaluación de Technology Readiness Levels (TRL) y análisis de patentabilidad.',
        toolsRequired: ['tech_indexer', 'patent_search'],
        evaluationScore: 9.5,
        metrics: { usageCount: 0, tokensSaved: 0, averageRating: 9.5 },
        createdAt: new Date().toISOString()
      },
      {
        id: 'social_mml_specialist',
        version: '1.0.0',
        name: 'Especialista en Marco Lógico Social (BID / ZOPP)',
        avatar: '🤝',
        role: 'Árbol de Problemas, Matriz de Marco Lógico e Indicadores de Impacto',
        domain: ['social', 'bid', 'zopp', 'marco logico', 'arbol problemas', 'impacto social', 'comunidad'],
        systemPrompt: 'Eres un consultor en formulación de proyectos sociales bajo estándares de organismos multilaterales (BID, CEPAL, Banco Mundial).',
        toolsRequired: ['mml_builder', 'social_impact_calc'],
        evaluationScore: 9.7,
        metrics: { usageCount: 0, tokensSaved: 0, averageRating: 9.7 },
        createdAt: new Date().toISOString()
      }
    ];

    for (const agent of baseAgents) {
      await this.saveAgent(agent);
    }
  }

  /**
   * Guarda o actualiza un agente en memoria y en disco.
   * @param {Object} agentData 
   * @returns {Promise<Object>} Agente guardado
   */
  async saveAgent(agentData) {
    if (!agentData || !agentData.id) {
      throw new Error('No se puede guardar un agente sin ID.');
    }

    const agentToPersist = {
      version: '1.0.0',
      metrics: { usageCount: 0, tokensSaved: 0, averageRating: 9.0 },
      createdAt: new Date().toISOString(),
      ...agentData,
      updatedAt: new Date().toISOString()
    };

    this.agentsMap.set(agentToPersist.id, agentToPersist);

    const filePath = path.join(this.storageDir, `${agentToPersist.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(agentToPersist, null, 2), 'utf-8');

    return agentToPersist;
  }

  /**
   * Obtiene todos los agentes almacenados.
   * @returns {Array<Object>}
   */
  getAllAgents() {
    return Array.from(this.agentsMap.values());
  }

  /**
   * Obtiene un agente por su identificador único.
   * @param {string} id 
   * @returns {Object|null}
   */
  getAgentById(id) {
    return this.agentsMap.get(id) || null;
  }

  /**
   * Registra el uso de un agente, acumulando métricas de ahorro de tokens y efectividad.
   * @param {string} id 
   * @param {Object} usageData - { tokensSaved?: number, rating?: number }
   */
  async recordAgentUsage(id, usageData = {}) {
    const agent = this.getAgentById(id);
    if (!agent) return;

    agent.metrics = agent.metrics || { usageCount: 0, tokensSaved: 0, averageRating: 9.0 };
    agent.metrics.usageCount = (agent.metrics.usageCount || 0) + 1;
    agent.metrics.tokensSaved = (agent.metrics.tokensSaved || 0) + (usageData.tokensSaved || 3500);

    if (usageData.rating && typeof usageData.rating === 'number') {
      const currentAvg = agent.metrics.averageRating || 9.0;
      const count = agent.metrics.usageCount;
      agent.metrics.averageRating = Number(((currentAvg * (count - 1) + usageData.rating) / count).toFixed(2));
    }

    await this.saveAgent(agent);
  }

  /**
   * Genera el paquete completo de exportación de agentes para revisión mensual de Fondo Thoth AC.
   * @returns {Promise<Object>}
   */
  async generateExportBundle() {
    const agents = this.getAllAgents();
    const totalTokensSaved = agents.reduce((acc, a) => acc + (a.metrics?.tokensSaved || 0), 0);
    const totalUses = agents.reduce((acc, a) => acc + (a.metrics?.usageCount || 0), 0);

    return {
      formatVersion: '3.0.0',
      exportedAt: new Date().toISOString(),
      organization: 'Fondo Thoth AC',
      totalAgents: agents.length,
      globalMetrics: {
        totalTokensSaved,
        totalUses,
        estimatedCostSavedUsd: (totalTokensSaved / 1000) * 0.003
      },
      agents
    };
  }
}

export const agentStore = new AgentStore();
