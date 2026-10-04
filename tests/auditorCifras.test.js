import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { auditProjectFigures } from '../src/lib/finanzas/auditorCifras.js';

describe('TDD: Auditoría Numérica Anti-Alucinaciones (auditorCifras - Zero Orphan Numbers)', () => {

  it('1. Debe detectar contradicciones flagrantes entre narrativa y Ficha de Drivers', () => {
    const proyectoConIncongruencia = {
      semilla: {
        nombre_proyecto: 'CCI TR SAPI',
        inversion_esperada: 20000000
      },
      mercado: {
        ventas: {
          precios: 'Cobro de suscripción premium de $45,000 MXN mensuales por monitoreo de activo.'
        }
      },
      organizacion: {
        recursos_humanos: {
          sueldos: 'Se cuenta con 18 técnicos mecánicos certificados en nómina fija.'
        }
      },
      _fichaDrivers: {
        drivers: {
          capex_total: { valor: 20000000 },
          precio_unitario_o_ticket: { valor: 3500 }, // Mercado real es 3,500, texto dice 45,000
          volumen_mensual_ventas: { valor: 12 },
          costos_fijos_mensuales: { valor: 285000 }
        }
      }
    };

    const audit = auditProjectFigures(proyectoConIncongruencia);
    assert.ok(audit.discrepancies.length > 0, 'Debe detectar discrepancias numéricas');
    
    // Verificar que detectó la discrepancia del precio IoT ($45,000 vs $3,500)
    const iotDiscrepancy = audit.discrepancies.find(d => d.concepto.includes('precio') || d.texto.includes('45,000'));
    assert.ok(iotDiscrepancy, 'Debe marcar la discrepancia del precio IoT');
  });

  it('2. Debe validar como CLEAN un proyecto totalmente reconciliado', () => {
    const proyectoLimpio = {
      semilla: {
        nombre_proyecto: 'Taller Corona',
        inversion_esperada: 150000
      },
      organizacion: {
        costos: {
          fijos: 'Costos fijos mensuales de $13,000 MXN (Luz $6,000 y Gasolina $7,000).'
        }
      },
      _fichaDrivers: {
        drivers: {
          capex_total: { valor: 150000 },
          costos_fijos_mensuales: { valor: 13000 },
          precio_unitario_o_ticket: { valor: 170000 },
          volumen_mensual_ventas: { valor: 1 }
        }
      }
    };

    const audit = auditProjectFigures(proyectoLimpio);
    assert.equal(audit.status, 'CLEAN', 'Un proyecto reconciliado debe tener estado CLEAN');
    assert.equal(audit.discrepancies.length, 0, 'Cero discrepancias en proyecto reconciliado');
  });

});
