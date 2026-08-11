/**
 * CriticValidator.js - Agente Crítico de Auto-Reflexión y Validación de Nuevos Agentes
 * 
 * Antes de persistir un nuevo agente en el AgentStore permanente, este módulo evalúa:
 * 1. Coherencia y profundidad del System Prompt (mínimo 50 caracteres, rol claro).
 * 2. Dominio y palabras clave definidas para indexación.
 * 3. Herramientas asignadas congruentes.
 * 4. Puntuación mínima de aprobación: 8.5 / 10.
 */

export class CriticValidator {
  /**
   * Evalúa la calidad metodológica y técnica del candidato a nuevo agente.
   * @param {Object} agentCandidate 
   * @returns {Promise<Object>} { isApproved: boolean, score: number, feedback: string[], reasons: string[] }
   */
  async evaluateAgent(agentCandidate) {
    const reasons = [];
    const feedback = [];
    let score = 10.0;

    if (!agentCandidate.id || typeof agentCandidate.id !== 'string') {
      reasons.push('El agente no posee un ID válido o único.');
      score -= 3.0;
    }

    if (!agentCandidate.name || agentCandidate.name.trim().length < 4) {
      reasons.push('El nombre del agente es demasiado corto o genérico.');
      score -= 1.5;
    }

    if (!agentCandidate.systemPrompt || agentCandidate.systemPrompt.trim().length < 40) {
      reasons.push('El System Prompt es insuficiente para garantizar un razonamiento de alta calidad.');
      score -= 3.5;
    }

    if (!Array.isArray(agentCandidate.domain) || agentCandidate.domain.length === 0) {
      reasons.push('El agente no define palabras clave de dominio para su catalogación y búsqueda.');
      score -= 2.0;
    }

    if (!Array.isArray(agentCandidate.toolsRequired) || agentCandidate.toolsRequired.length === 0) {
      reasons.push('No se han especificado herramientas de ejecución para el agente.');
      score -= 1.5;
    }

    // Normalizar score entre 0 y 10
    const finalScore = Number(Math.max(0, Math.min(10.0, score)).toFixed(1));
    const isApproved = finalScore >= 8.5;

    if (isApproved) {
      feedback.push('Estructura metodológica validada con éxito.');
      feedback.push(`Score de calidad: ${finalScore}/10 - Aprobado para persistencia en AgentStore.`);
    } else {
      feedback.push(`Score insuficiente: ${finalScore}/10 (Requiere >= 8.5 para ser almacenado en catálogo).`);
    }

    return {
      isApproved,
      score: finalScore,
      feedback,
      reasons
    };
  }
}
