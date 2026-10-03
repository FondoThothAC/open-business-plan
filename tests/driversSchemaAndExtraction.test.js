import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  validateDriversFicha, 
  createEmptyDriversFicha,
  FINANCIAL_DRIVER_KEYS 
} from '../src/lib/finanzas/driversSchema.js';
import { extractDriversFromPlan } from '../src/lib/finanzas/driversExtractor.js';
import { crossValidateSources } from '../src/lib/finanzas/crossValidation.js';

describe('TDD: Ficha de Drivers Financieros y Validación Cruzada', () => {

  it('debe definir las claves de drivers obligatorios en driversSchema', () => {
    assert.ok(Array.isArray(FINANCIAL_DRIVER_KEYS), 'FINANCIAL_DRIVER_KEYS debe ser un array');
    assert.ok(FINANCIAL_DRIVER_KEYS.includes('capex_total'), 'Debe incluir capex_total');
    assert.ok(FINANCIAL_DRIVER_KEYS.includes('costos_fijos_mensuales'), 'Debe incluir costos_fijos_mensuales');
    assert.ok(FINANCIAL_DRIVER_KEYS.includes('precio_unitario_o_ticket'), 'Debe incluir precio_unitario_o_ticket');
    assert.ok(FINANCIAL_DRIVER_KEYS.includes('volumen_mensual_ventas'), 'Debe incluir volumen_mensual_ventas');
  });

  it('debe crear una Ficha vacía en estado pendiente', () => {
    const ficha = createEmptyDriversFicha();
    assert.equal(ficha.estado, 'pendiente');
    assert.ok(typeof ficha.drivers === 'object');
    assert.equal(ficha.drivers.capex_total.estado, 'pendiente');
    assert.equal(ficha.drivers.capex_total.valor, 0);
  });

  it('debe validar la coherencia de una Ficha aprobada', () => {
    const ficha = createEmptyDriversFicha();
    ficha.drivers.concepto_producto = { valor: 'Servicios de Carpintería', unidad: 'texto', procedencia: 'user_provided', confianza: 'alta', fuentes: [], estado: 'aprobado' };
    ficha.drivers.capex_total = { valor: 50000, unidad: 'MXN', procedencia: 'user_provided', confianza: 'alta', fuentes: [], estado: 'aprobado' };
    ficha.drivers.costos_fijos_mensuales = { valor: 6000, unidad: 'MXN/mes', procedencia: 'user_provided', confianza: 'alta', fuentes: [], estado: 'aprobado' };
    ficha.drivers.precio_unitario_o_ticket = { valor: 250, unidad: 'MXN', procedencia: 'user_provided', confianza: 'alta', fuentes: [], estado: 'aprobado' };
    ficha.drivers.volumen_mensual_ventas = { valor: 80, unidad: 'unidades/mes', procedencia: 'user_provided', confianza: 'alta', fuentes: [], estado: 'aprobado' };
    ficha.drivers.costo_variable_unitario = { valor: 100, unidad: 'MXN/unidad', procedencia: 'user_provided', confianza: 'alta', fuentes: [], estado: 'aprobado' };

    const val = validateDriversFicha(ficha);
    assert.equal(val.esValida, true);
    assert.equal(val.faltantes.length, 0);
  });

  it('debe detectar faltantes si algún driver obligatorio está en 0 o pendiente', () => {
    const ficha = createEmptyDriversFicha();
    const val = validateDriversFicha(ficha);
    assert.equal(val.esValida, false);
    assert.ok(val.faltantes.includes('capex_total'));
    assert.ok(val.faltantes.includes('volumen_mensual_ventas'));
  });

  it('crossValidateSources debe promediar y validar fuentes dentro del rango del 30%', () => {
    const fuentes = [
      { entidad: 'INEGI DENUE', valor: 240, url: 'https://inegi.org.mx' },
      { entidad: 'Estudio Mercado Local', valor: 260, url: 'https://tavily.com' }
    ];

    const res = crossValidateSources(fuentes);
    assert.equal(res.esValido, true);
    assert.equal(res.confianza, 'alta');
    assert.equal(res.valorConsolidado, 250);
  });

  it('crossValidateSources debe marcar discrepancia si dos fuentes difieren en más del 30%', () => {
    const fuentesDispersas = [
      { entidad: 'Fuente A', valor: 100 },
      { entidad: 'Fuente B', valor: 300 }
    ];

    const res = crossValidateSources(fuentesDispersas);
    assert.equal(res.esValido, false);
    assert.equal(res.confianza, 'pendiente');
    assert.ok(res.motivo.toLowerCase().includes('dispersión'));
  });

  it('extractDriversFromPlan debe extraer drivers de la semilla sin inventar galletas', () => {
    const planPrueba = {
      semilla: {
        nombre_proyecto: 'Barbería Vintage Don Pedro',
        giro: 'Peluquería y barbería clásica',
        inversion_esperada: '65,000 MXN',
        finanzas: {
          costos_fijos: '8,500 MXN',
          meta_ingresos: '25,000 MXN'
        }
      },
      mercado: {
        ventas: {
          tacticas_precio: 'Corte de cabello $180 pesos, afeitado $120 pesos',
          proyeccion_volumen: '150 servicios al mes'
        }
      }
    };

    const ficha = extractDriversFromPlan(planPrueba);
    assert.equal(ficha.drivers.capex_total.valor, 65000);
    assert.equal(ficha.drivers.costos_fijos_mensuales.valor, 8500);
    assert.equal(ficha.drivers.volumen_mensual_ventas.valor, 150);
    assert.ok(ficha.drivers.precio_unitario_o_ticket.valor > 0);
    assert.equal(ficha.drivers.concepto_producto.valor, 'Servicios de Peluquería y barbería clásica');
  });

});
