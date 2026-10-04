import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generatePitchDeckBuffer } from '../src/lib/pptxExportEngine.js';

describe('TDD: Motor de Pitch Decks PowerPoint (.pptx 16:9 - pptxExportEngine)', () => {

  const mockProject = {
    nombre: 'Comercio Cuántico Internacional',
    companyName: 'CCI TR S.A.P.I. de C.V.',
    giro: 'Mantenimiento hidráulico industrial y monitoreo IoT',
    semilla: {
      nombre_proyecto: 'CCI TR S.A.P.I. de C.V.',
      giro: 'Mantenimiento hidráulico industrial minero',
      problema: 'Paros no programados de maquinaria pesada por falla en cilindros de 5,000 PSI.',
      solucion: 'Overhaul mayor y monitoreo predictivo con telemetría en tiempo real.',
      ventaja_injusta: 'Torno de 6 metros único en Sonora y banco de pruebas de alta presión.'
    },
    mercado: {
      tam_sam_som: {
        tam: '$1,200,000,000 MXN',
        sam: '$250,000,000 MXN',
        som: '$20,000,000 MXN'
      }
    },
    _fichaDrivers: {
      drivers: {
        capex_total: { valor: 20000000 },
        costos_fijos_mensuales: { valor: 285000 },
        precio_unitario_o_ticket: { valor: 115000 },
        volumen_mensual_ventas: { valor: 12 }
      }
    },
    rentabilidad: {
      indicadores: 'VPN: $6,986,213 MXN\nTIR: 22.6%\nPayback: 38 meses'
    }
  };

  it('1. Debe generar un buffer PPTX válido con tamaño superior a 10KB', async () => {
    const buffer = await generatePitchDeckBuffer(mockProject);
    assert.ok(buffer, 'Debe devolver un buffer o arraybuffer');
    assert.ok(buffer.length > 5000, `El archivo PPTX debe tener contenido sustancial (> 5KB), tamaño: ${buffer.length} bytes`);
  });

});
