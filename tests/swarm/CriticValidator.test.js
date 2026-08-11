import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CriticValidator } from '../../server/swarm/CriticValidator.js';

describe('CriticValidator - Auto-Reflexión y Control de Calidad de Agentes', () => {
  const validator = new CriticValidator();

  it('Debe APROBAR un agente con estructura completa, prompt robusto y herramientas válidas (Score >= 8.5)', async () => {
    const validAgentCandidate = {
      id: 'iot_automation_expert',
      name: 'Experto en Automatización IoT Industrial',
      avatar: '🤖',
      role: 'Diseño de Arquitecturas IoT y Sensores Industriales',
      domain: ['iot', 'sensores', 'automatizacion', 'industria 4.0', 'telemetria'],
      systemPrompt: 'Eres un ingeniero principal en IoT industrial con más de 15 años de experiencia. Tu objetivo es estructurar la arquitectura técnica de hardware, protocolos MQTT/OPC-UA y costos de mantenimiento.',
      toolsRequired: ['market_search', 'calculadora_costos'],
      quantumAwareness: true
    };

    const review = await validator.evaluateAgent(validAgentCandidate);
    assert.equal(review.isApproved, true);
    assert.ok(review.score >= 8.5, `Score esperado >= 8.5, obtenido: ${review.score}`);
    assert.ok(review.feedback.length >= 0);
  });

  it('Debe RECHAZAR un agente con prompt pobre, sin dominio o sin herramientas definidas (Score < 8.5)', async () => {
    const invalidAgentCandidate = {
      id: 'lazy_agent',
      name: 'Agente Incompleto',
      avatar: '❓',
      role: 'Hace cosas',
      domain: [],
      systemPrompt: 'Responde preguntas.',
      toolsRequired: []
    };

    const review = await validator.evaluateAgent(invalidAgentCandidate);
    assert.equal(review.isApproved, false);
    assert.ok(review.score < 8.5, `Score esperado < 8.5, obtenido: ${review.score}`);
    assert.ok(review.reasons.length > 0);
  });
});
