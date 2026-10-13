import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveAdaptiveTemperature } from '../src/lib/ai.js';

describe('Calibración Adaptativa de Temperatura de IA (resolveAdaptiveTemperature)', () => {
  it('respeta la temperatura explícita si se provee en la configuración', () => {
    assert.equal(resolveAdaptiveTemperature({ temperature: 0.1 }, '', true), 0.1);
    assert.equal(resolveAdaptiveTemperature({ temperature: 0.85 }, 'financiero', true), 0.85);
    assert.equal(resolveAdaptiveTemperature({ temperature: 0 }, 'creativo', false), 0);
  });

  it('asigna 0.2 para respuestas estrictas JSON o tareas analíticas/financieras', () => {
    // expectJson true
    assert.equal(resolveAdaptiveTemperature({}, 'redacción libre', true), 0.2);

    // Prompt con temática financiera o analítica (incluso si expectJson es false)
    assert.equal(resolveAdaptiveTemperature({}, 'Calcula el flujo de caja y costos fijos de la empresa', false), 0.2);
    assert.equal(resolveAdaptiveTemperature({}, 'Simulación Montecarlo de rentabilidad y TIR', false), 0.2);
    assert.equal(resolveAdaptiveTemperature({ role: 'analista financiero' }, 'Resumen', false), 0.2);
    assert.equal(resolveAdaptiveTemperature({ task: 'analisis_sensibilidad' }, 'Datos', false), 0.2);
  });

  it('asigna 0.35 para tareas estratégicas estructuradas (FODA, PESTEL, Porter, riesgos)', () => {
    assert.equal(resolveAdaptiveTemperature({}, 'Elabora la matriz FODA y análisis PESTEL del sector', false), 0.35);
    assert.equal(resolveAdaptiveTemperature({}, 'Evaluación de las 5 fuerzas de Porter y mitigación de riesgos', false), 0.35);
    assert.equal(resolveAdaptiveTemperature({ role: 'estratega' }, 'Plan de contingencia', false), 0.35);
  });

  it('asigna 0.7 para redacción creativa o tareas abiertas no numéricas', () => {
    assert.equal(resolveAdaptiveTemperature({}, 'Escribe un eslogan y narrativa de marca inspiradora', false), 0.7);
    assert.equal(resolveAdaptiveTemperature({}, 'Genera una introducción persuasiva para el pitch deck', false), 0.7);
    assert.equal(resolveAdaptiveTemperature({}, '', false), 0.7);
  });

  it('ignora valores no numéricos o fuera de rango en config.temperature y aplica la heurística adaptativa', () => {
    assert.equal(resolveAdaptiveTemperature({ temperature: 'alto' }, '', true), 0.2);
    assert.equal(resolveAdaptiveTemperature({ temperature: 5 }, '', true), 0.2);
    assert.equal(resolveAdaptiveTemperature({ temperature: -0.5 }, '', true), 0.2);
  });
});
