import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { QuantumDiagnosticAgent } from '../../server/swarm/agents/QuantumDiagnosticAgent.js';

describe('QuantumDiagnosticAgent - Regla 13 de Empresas Cuánticas (Fondo Thoth AC)', () => {
  const agent = new QuantumDiagnosticAgent();

  it('Debe detectar "Fusión Atómica" si el fundador intenta involucrarse en las 3 áreas simultáneamente', async () => {
    const context = {
      fundador: {
        areas_activas: ['finanzas', 'operativo', 'administrativo'],
        tiempo_semanal_horas: 70
      },
      semilla: {
        negocio: { nombre_marca: 'Empresa Todo Terreno' }
      }
    };

    const emitProgress = () => {};
    const result = await agent.execute(context, emitProgress);

    assert.equal(result.fusionAtomicaDetectada, true);
    assert.ok(result.alertaFusion.includes('FUSIÓN ATÓMICA'));
    assert.ok(result.recomendacionesDelegacion.length >= 1, 'Debe sugerir delegar al menos 1 o 2 áreas');
  });

  it('Debe validar perfil cuántico saludable si el fundador participa en 1 o máximo 2 áreas', async () => {
    const context = {
      fundador: {
        areas_activas: ['operativo', 'administrativo'],
        tiempo_semanal_horas: 45
      },
      semilla: {
        negocio: { nombre_marca: 'Restaurante Eficiente' }
      }
    };

    const emitProgress = () => {};
    const result = await agent.execute(context, emitProgress);

    assert.equal(result.fusionAtomicaDetectada, false);
    assert.equal(result.areaDebilDelegar, 'finanzas');
    assert.ok(result.perfilPuestoDelegacion);
    assert.equal(result.perfilPuestoDelegacion.area, 'Finanzas');
  });

  it('Debe calcular umbrales de cambio cuántico de escala no lineales', async () => {
    const context = {
      fundador: { areas_activas: ['operativo'] },
      personalActual: 3,
      sucursalesActuales: 1
    };

    const emitProgress = () => {};
    const result = await agent.execute(context, emitProgress);

    assert.ok(result.saltosCuanticos);
    assert.ok(result.saltosCuanticos.proximoUmbral);
    assert.ok(result.saltosCuanticos.accionesReestructuracion.length > 0);
  });
});
