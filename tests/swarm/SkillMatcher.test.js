import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SkillMatcher } from '../../server/swarm/SkillMatcher.js';

describe('SkillMatcher - Algoritmo de Coincidencia Semántica de Agentes', () => {
  const mockCatalog = [
    {
      id: 'market_researcher',
      name: 'Investigador de Mercado',
      domain: ['mercado', 'competencia', 'scian', 'tam', 'sam', 'som', 'clientes', 'demanda'],
      role: 'Análisis de Competencia y Segmentación'
    },
    {
      id: 'financial_analyst',
      name: 'Analista Financiero',
      domain: ['finanzas', 'van', 'tir', 'flujo de caja', 'capex', 'opex', 'costos', 'precios'],
      role: 'Modelación Financiera y Viabilidad'
    },
    {
      id: 'quantum_diagnostician',
      name: 'Diagnosticador Cuántico',
      domain: ['cuantico', 'delegacion', 'fundador', 'areas atomicas', 'escalamiento', 'antipatrones'],
      role: 'Diagnóstico Atómico de 3 Áreas'
    }
  ];

  it('Debe identificar coincidencia EXACTA / ALTA (>= 90%) para tareas del dominio establecido', () => {
    const matcher = new SkillMatcher(mockCatalog);
    const task = {
      description: 'Investigación profunda de mercado, competidores directos en la zona, segmentación TAM SAM SOM y código SCIAN.',
      domainKeywords: ['mercado', 'competencia', 'scian', 'tam', 'sam', 'som']
    };

    const matchResult = matcher.findBestMatch(task);
    assert.equal(matchResult.matchedAgentId, 'market_researcher');
    assert.ok(matchResult.score >= 0.85, `Score esperado >= 0.85, obtenido: ${matchResult.score}`);
    assert.equal(matchResult.action, 'reuse');
  });

  it('Debe identificar coincidencia PARCIAL (50% - 89%) para especializar/adaptar un agente base', () => {
    const matcher = new SkillMatcher(mockCatalog);
    const task = {
      description: 'Análisis de costos para importación de insumos médicos de alta gama con impuestos aduanales y cotizaciones en divisas.',
      domainKeywords: ['finanzas', 'costos', 'aduanas', 'divisas', 'aranceles']
    };

    const matchResult = matcher.findBestMatch(task);
    assert.equal(matchResult.matchedAgentId, 'financial_analyst');
    assert.ok(matchResult.score >= 0.45 && matchResult.score < 0.90, `Score esperado entre 0.45 y 0.90, obtenido: ${matchResult.score}`);
    assert.equal(matchResult.action, 'specialize');
  });

  it('Debe identificar coincidencia BAJA (< 50%) para auto-generar un nuevo agente especialista', () => {
    const matcher = new SkillMatcher(mockCatalog);
    const task = {
      description: 'Diseño de protocolos de bioseguridad para laboratorio de genómica CRISPR y cultivo de microalgas marinas.',
      domainKeywords: ['crispr', 'bioseguridad', 'microalgas', 'genomica', 'biorreactores']
    };

    const matchResult = matcher.findBestMatch(task);
    assert.ok(matchResult.score < 0.50, `Score esperado < 0.50, obtenido: ${matchResult.score}`);
    assert.equal(matchResult.action, 'create_new');
  });
});
