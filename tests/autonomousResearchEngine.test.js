import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  AutonomousResearchEngine,
  CATEGORIAS_ESTRATEGICAS 
} from '../server/autonomousResearchEngine.js';

describe('AutonomousResearchEngine - Motor Autónomo de Investigación y Escalamiento Cuántico', () => {
  it('debe definir las categorías estratégicas de competidores', () => {
    assert.ok(CATEGORIAS_ESTRATEGICAS.AMENAZA_DIRECTA, 'Debe existir categoría amenaza directa');
    assert.ok(CATEGORIAS_ESTRATEGICAS.OPORTUNIDAD_ALIANZA, 'Debe existir categoría oportunidad de alianza');
    assert.ok(CATEGORIAS_ESTRATEGICAS.SUSTITUTO_INDIRECTO, 'Debe existir categoría sustituto indirecto');
  });

  it('debe generar un Flowchart Mermaid de Escalamiento Cuántico válido con KPIs Gate', () => {
    const flowchart = AutonomousResearchEngine.generarFlowchartEscalamiento({
      companyName: 'VCV Cortes Finos, S.A. de C.V.',
      fase1Presupuesto: '$4,000,000 MXN',
      fase2Presupuesto: '$16,800,000 MXN',
      mercadoFase1: 'Mercado Regional B2B HORECA (Sonora y Sinaloa)',
      mercadoFase2: 'Exportación Binacional (Arizona y California)'
    });

    assert.ok(flowchart, 'Debe generar el diagrama Mermaid');
    assert.ok(flowchart.includes('graph TD') || flowchart.includes('flowchart TD'), 'Debe ser sintaxis Mermaid TD válida');
    assert.ok(flowchart.includes('Fase 1'), 'Debe referenciar la Fase 1');
    assert.ok(flowchart.includes('Fase 2'), 'Debe referenciar la Fase 2');
    assert.ok(flowchart.includes('Gate') || flowchart.includes('Hito') || flowchart.includes('Compuerta'), 'Debe incluir compuerta de decisión o KPIs Gate');
  });

  it('debe generar la matriz cuantitativa de KPIs Gate de transición entre fases', () => {
    const kpis = AutonomousResearchEngine.generarKpisGateTransicion({
      inversionFase1: 4000000,
      inversionFase2: 16800000
    });

    assert.ok(Array.isArray(kpis), 'Los KPIs Gate deben ser un arreglo');
    assert.ok(kpis.length >= 4, 'Debe incluir al menos 4 KPIs de compuerta');

    const kpiEbitda = kpis.find(k => k.metrica.toLowerCase().includes('ebitda'));
    assert.ok(kpiEbitda, 'Debe incluir KPI de EBITDA mínimo');
    assert.ok(kpiEbitda.umbral_minimo, 'Debe especificar umbral cuantitativo para desbloquear la Fase 2');

    const kpiCalidad = kpis.find(k => k.metrica.toLowerCase().includes('otd') || k.metrica.toLowerCase().includes('haccp') || k.metrica.toLowerCase().includes('inocuidad'));
    assert.ok(kpiCalidad, 'Debe incluir KPI operativo o sanitario');
  });

  it('debe clasificar y enriquecer competidores multinivel con etiquetas estratégicas', () => {
    const rawCompetitors = [
      { nombre: 'Empacadora Sonora TIF', actividad: 'Corte y empacado de carne de res con certificación TIF', web: 'www.empacadorasonora.mx' },
      { nombre: 'Carnicería El Choyero', actividad: 'Venta de cortes crudos tradicionales al mostrador', web: '' },
      { nombre: 'Tyson Foods Foodservice USA', actividad: 'Precooked sliced beef for restaurant chains in Arizona', web: 'www.tysonfoodservice.com' }
    ];

    const enriquecidos = AutonomousResearchEngine.clasificarCompetidores(rawCompetitors);

    assert.equal(enriquecidos.length, 3);
    assert.ok(enriquecidos[0].categoria_estrategica, 'Debe asignar categoría estratégica');
    assert.ok(enriquecidos[0].color, 'Debe asignar color distintivo para visualización');
  });
});
