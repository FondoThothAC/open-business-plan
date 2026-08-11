/**
 * SkillMatcher.js - Algoritmo de Coincidencia Semántica y de Dominio de Agentes
 * 
 * Evalúa la similitud entre los requerimientos de la tarea/proyecto y el catálogo
 * de agentes registrados en el AgentStore:
 * - Score >= 0.80: Acción 'reuse' (Reutilización 100% de tokens de definición).
 * - Score 0.40 - 0.79: Acción 'specialize' (Adaptación/Especialización de agente base).
 * - Score < 0.40: Acción 'create_new' (Auto-generación de un nuevo agente especialista).
 */

export class SkillMatcher {
  /**
   * @param {Array<Object>} catalog - Lista de definiciones de agentes registrados.
   */
  constructor(catalog = []) {
    this.catalog = catalog;
  }

  /**
   * Actualiza el catálogo interno de agentes disponibles.
   * @param {Array<Object>} catalog 
   */
  setCatalog(catalog) {
    this.catalog = catalog;
  }

  /**
   * Normaliza y extrae tokens clave de un texto o arreglo de términos.
   * @param {string|Array<string>} input 
   * @returns {Set<string>}
   */
  tokenize(input) {
    if (!input) return new Set();
    const text = Array.isArray(input) ? input.join(' ') : String(input);
    const stopWords = new Set([
      'de', 'la', 'el', 'en', 'y', 'a', 'los', 'del', 'las', 'un', 'por', 'con', 'no', 'una',
      'su', 'para', 'es', 'al', 'lo', 'como', 'mas', 'o', 'pero', 'sus', 'le', 'ha', 'me', 'si',
      'sin', 'sobre', 'este', 'ya', 'entre', 'cuando', 'todo', 'esta', 'ser', 'son', 'dos', 'tambien',
      'era', 'muy', 'hasta', 'desde', 'mi', 'porque', 'cada', 'fin', 'hacer', 'the', 'and', 'for', 'with'
    ]);

    const words = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar tildes
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    return new Set(words);
  }

  /**
   * Determina si dos palabras comparten una raíz común significativa (mínimo 4 caracteres).
   * @param {string} wordA 
   * @param {string} wordB 
   * @returns {boolean}
   */
  sharesRoot(wordA, wordB) {
    if (!wordA || !wordB) return false;
    if (wordA === wordB || wordA.includes(wordB) || wordB.includes(wordA)) return true;
    const minLen = Math.min(wordA.length, wordB.length);
    if (minLen < 4) return false;
    const prefixLen = Math.min(4, minLen);
    return wordA.slice(0, prefixLen) === wordB.slice(0, prefixLen);
  }

  /**
   * Calcula el score de cobertura de palabras clave y similitud semántica.
   * @param {Set<string>} taskKeywords 
   * @param {Object} agent 
   * @returns {number} Score entre 0.0 y 1.0
   */
  calculateScore(taskKeywords, agent) {
    if (taskKeywords.size === 0) return 0;

    const agentDomainTokens = this.tokenize(agent.domain || []);
    const agentRoleTokens = this.tokenize([agent.name || '', agent.role || '', agent.systemPrompt || '']);
    const allAgentTokens = new Set([...agentDomainTokens, ...agentRoleTokens]);

    let matchedKeywords = 0;
    let roleBonus = 0;

    for (const kw of taskKeywords) {
      let foundInDomain = false;
      for (const token of allAgentTokens) {
        if (this.sharesRoot(kw, token)) {
          matchedKeywords += (token === kw ? 1.0 : 0.85);
          foundInDomain = true;
          break;
        }
      }

      if (foundInDomain) {
        for (const rToken of agentRoleTokens) {
          if (this.sharesRoot(kw, rToken)) {
            roleBonus += 0.15;
            break;
          }
        }
      }
    }

    const keywordCoverage = matchedKeywords / taskKeywords.size;
    roleBonus = Math.min(0.25, roleBonus);

    return Math.min(1.0, (keywordCoverage * 0.80) + roleBonus);
  }

  /**
   * Encuentra el agente con mayor coincidencia para una tarea o contexto dado.
   * @param {Object} task - { description: string, domainKeywords?: Array<string>, frameworkId?: string }
   * @returns {Object} { matchedAgentId, matchedAgent, score, action: 'reuse' | 'specialize' | 'create_new' }
   */
  findBestMatch(task) {
    if (!this.catalog || this.catalog.length === 0) {
      return {
        matchedAgentId: null,
        matchedAgent: null,
        score: 0,
        action: 'create_new'
      };
    }

    const taskTokens = new Set([
      ...this.tokenize(task.domainKeywords || []),
      ...(task.domainKeywords && task.domainKeywords.length > 0 ? [] : this.tokenize(task.description || ''))
    ]);

    let bestScore = -1;
    let bestAgent = null;

    for (const agent of this.catalog) {
      const score = this.calculateScore(taskTokens, agent);

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    const normalizedScore = Number(Math.max(0, Math.min(1.0, bestScore)).toFixed(3));

    let action = 'create_new';
    if (normalizedScore >= 0.80) {
      action = 'reuse';
    } else if (normalizedScore >= 0.40) {
      action = 'specialize';
    }

    return {
      matchedAgentId: bestAgent ? bestAgent.id : null,
      matchedAgent: bestAgent,
      score: normalizedScore,
      action
    };
  }
}
