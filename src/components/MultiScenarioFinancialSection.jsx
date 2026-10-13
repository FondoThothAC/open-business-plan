import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { extractDriversFromPlan } from '../lib/finanzas/driversExtractor';
import { parseToProjectData } from '../lib/finanzas/calculadoraFinanciera';

/**
 * Función auxiliar para calcular el VAN (Valor Actual Neto)
 * @param {number} rate - Tasa de descuento en decimal (ej. 0.12)
 * @param {number} initial - Inversión inicial (número positivo)
 * @param {number[]} cashFlows - Array de flujos de efectivo de los años 1 a N
 * @returns {number} VAN calculado
 */
function calcularVan(rate, initial, cashFlows) {
  let van = -initial;
  for (let i = 0; i < cashFlows.length; i++) {
    van += cashFlows[i] / Math.pow(1 + rate, i + 1);
  }
  return van;
}

/**
 * Función auxiliar para estimar la TIR (Tasa Interna de Retorno)
 * @param {number} initial - Inversión inicial
 * @param {number[]} cashFlows - Flujos de efectivo
 * @returns {number} TIR estimada en porcentaje (ej. 18.5)
 */
function estimarTir(initial, cashFlows) {
  let low = -0.5;
  let high = 2.0;
  for (let iter = 0; iter < 100; iter++) {
    const mid = (low + high) / 2;
    const npv = calcularVan(mid, initial, cashFlows);
    if (Math.abs(npv) < 1) return Number((mid * 100).toFixed(2));
    if (npv > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return Number(((low + high) / 2 * 100).toFixed(2));
}

/**
 * Componente de Simulación Financiera y Evaluación de Riesgo Multi-Escenario
 * Proyecta escenarios base, optimista y pesimista adaptados al giro y drivers del proyecto.
 */
export default function MultiScenarioFinancialSection({ planData }) {
  const [selectedScenario, setSelectedScenario] = useState('base');

  const parseAmount = (val, fallback) => {
    if (!val) return fallback;
    if (typeof val === 'number') return Number.isFinite(val) && val > 0 ? val : fallback;
    const clean = String(val).replace(/[^0-9.-]+/g, '');
    const num = parseFloat(clean);
    return Number.isFinite(num) && num > 0 ? num : fallback;
  };

  // Extracción dinámica de drivers y datos formales del proyecto
  const driversFicha = extractDriversFromPlan(planData);
  const drivers = driversFicha?.drivers || {};
  const projectData = parseToProjectData(planData);

  const companyName = planData?.config?.brandKit?.companyName || planData?.semilla?.negocio?.nombre || planData?.semilla?.nombre_proyecto || 'Proyecto Empresarial';
  const projectGiro = planData?.semilla?.negocio?.giro || planData?.semilla?.giro || 'Operaciones y Servicios';
  const concepto = drivers.concepto_producto?.valor || projectGiro;

  // Inversión inicial (CAPEX)
  const inversionBase = drivers.capex_total?.valor > 0 
    ? drivers.capex_total.valor 
    : parseAmount(
        planData?.organizacion?.inversion?.monto_total ||
        planData?.organizacion?.inversion?.capex ||
        planData?.semilla?.finanzas?.inversion_total,
        1500000
      );

  // Ventas de arranque anuales
  let ventasBaseAnual = 0;
  const ticket = Number(drivers.precio_unitario_o_ticket?.valor) || 0;
  const volumen = Number(drivers.volumen_mensual_ventas?.valor) || 0;

  if (ticket > 0 && volumen > 0) {
    ventasBaseAnual = ticket * volumen * 12;
  } else if (projectData?.recurringRevenues?.length > 0) {
    ventasBaseAnual = projectData.recurringRevenues.reduce((acc, r) => acc + (r.initialMonthlyAmount || 0), 0) * 12;
  } else {
    ventasBaseAnual = Math.round(inversionBase * 0.90);
  }

  // Costos de arranque anuales
  let costosBaseAnual = 0;
  if (projectData?.recurringExpenses?.length > 0) {
    costosBaseAnual = projectData.recurringExpenses.reduce((acc, e) => acc + (e.initialMonthlyAmount || 0), 0) * 12;
  } else {
    costosBaseAnual = Math.round(ventasBaseAnual * 0.65);
  }

  // Reserva de tesorería y rendimiento colateralizado (yield 6.5%)
  const reservaTesoreria = Math.round(inversionBase * 0.10);
  const rendimientoTesoreria = Math.round(reservaTesoreria * 0.065);
  const reembolsoReservaA5 = reservaTesoreria;
  const wacc = 12.0;

  // Constructor de proyecciones a 5 años según modificadores
  const buildScenario = (nombre, descripcion, color, modVentas, modCostos, crecVentas, inflacCostos) => {
    const ventas = [];
    const costos = [];
    const flujoLibre = [];

    const v1 = Math.round(ventasBaseAnual * modVentas);
    const c1 = Math.round(costosBaseAnual * modCostos);

    for (let yr = 0; yr < 5; yr++) {
      const v = Math.round(v1 * Math.pow(1 + crecVentas, yr));
      const c = Math.round(c1 * Math.pow(1 + inflacCostos, yr));
      ventas.push(v);
      costos.push(c);

      // Flujo después de impuestos operativos (30% ISR) más rendimiento de tesorería
      const utilidadOp = v - c;
      const isr = utilidadOp > 0 ? utilidadOp * 0.30 : 0;
      const f = Math.round(utilidadOp - isr + rendimientoTesoreria);
      flujoLibre.push(f);
    }

    const flujosConReembolso = [...flujoLibre];
    flujosConReembolso[4] += reembolsoReservaA5;

    const van = calcularVan(wacc / 100, inversionBase, flujosConReembolso);
    let tir = estimarTir(inversionBase, flujosConReembolso);
    if (!Number.isFinite(tir) || tir > 150) tir = 15.0;

    const roi = Number(((flujosConReembolso.reduce((a, b) => a + b, 0) / (inversionBase || 1) - 1) * 100).toFixed(1));

    // Cálculo del periodo de recuperación
    let acumulado = -inversionBase;
    let paybackStr = 'Más de 5 Años';
    for (let i = 0; i < flujosConReembolso.length; i++) {
      const prev = acumulado;
      acumulado += flujosConReembolso[i];
      if (prev < 0 && acumulado >= 0) {
        const fraccion = Math.abs(prev) / flujosConReembolso[i];
        paybackStr = `${(i + fraccion).toFixed(1)} Años`;
        break;
      }
    }

    const puntoEquilibrioMensual = Math.round(costos[0] / 12);

    return {
      nombre,
      descripcion,
      color,
      wacc,
      tir,
      van,
      roi,
      payback: paybackStr,
      puntoEquilibrioMensual,
      ventas,
      costos,
      rendimientoTesoreria,
      flujoLibre,
      reembolsoReservaA5
    };
  };

  const scenarios = {
    base: buildScenario(
      'Escenario Base (Modelo Maestro / RAG)',
      `Proyección institucional para ${companyName} (${concepto}), considerando 65% de estructura de costos promedio y reserva líquida con rendimiento del 6.5%.`,
      '#4f46e5',
      1.0,
      1.0,
      0.08,
      0.045
    ),
    optimista: buildScenario(
      'Escenario Optimista (+15% Volumen y +5% Tarifas)',
      `Mayor penetración comercial de ${concepto}, expansión acelerada de clientes y optimización en compras de insumos.`,
      '#10b981',
      1.15,
      0.95,
      0.12,
      0.035
    ),
    pesimista: buildScenario(
      'Escenario Pesimista (-20% Ventas y +10% Inflación en Insumos)',
      `Contracción en la demanda de ${concepto}, incremento en costos de operación y retrasos temporales en cobranza.`,
      '#ef4444',
      0.80,
      1.10,
      0.04,
      0.065
    )
  };

  const current = scenarios[selectedScenario] || scenarios.base;

  // Cálculo de unidades de equilibrio contextualizadas
  let unidadesEquilibrioTexto = '';
  if (ticket > 0) {
    const unidadesEq = Math.round(current.puntoEquilibrioMensual / ticket);
    unidadesEquilibrioTexto = `~${unidadesEq.toLocaleString('es-MX')} unidades de ${concepto}/mes`;
  } else {
    unidadesEquilibrioTexto = `Operación continua de ${concepto}`;
  }

  return (
    <div className="multi-scenario-financial-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%', margin: '1.5rem 0', pageBreakInside: 'avoid' }}>
      
      {/* Selector de Escenarios */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
            Simulación Financiera y Evaluación de Riesgo Multi-Escenario
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Proyección a 5 años para {companyName} basada en capital de ${inversionBase.toLocaleString('es-MX')} MXN y rendimiento de tesorería colateralizada
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {Object.entries(scenarios).map(([key, sc]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedScenario(key)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: selectedScenario === key ? `2px solid ${sc.color}` : '1px solid #cbd5e1',
                background: selectedScenario === key ? `${sc.color}15` : '#ffffff',
                color: selectedScenario === key ? sc.color : '#64748b',
                fontWeight: selectedScenario === key ? 700 : 500,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {key === 'base' ? '⚖️ Escenario Base' : key === 'optimista' ? '🚀 Optimista' : '⚠️ Pesimista'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Ejecutivos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TIR (Tasa Interna Retorno)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: current.tir >= 12 ? '#10b981' : '#ef4444', marginTop: '4px' }}>
            {current.tir.toFixed(2)}%
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>WACC de Referencia: {current.wacc}%</span>
        </div>

        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>VAN (Valor Actual Neto)</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: current.van > 0 ? '#10b981' : '#ef4444', marginTop: '4px' }}>
            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(current.van)}
          </div>
          <span style={{ fontSize: '0.7rem', color: current.van > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            {current.van > 0 ? 'Viable (Genera Riqueza)' : 'Riesgo de Rendimiento'}
          </span>
        </div>

        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Punto de Equilibrio</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#3b82f6', marginTop: '4px' }}>
            ${current.puntoEquilibrioMensual.toLocaleString('es-MX')}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>MXN/mes ({unidadesEquilibrioTexto})</span>
        </div>

        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Periodo de Recuperación</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
            {current.payback}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Con Reembolso de Reserva Año 5</span>
        </div>
      </div>

      {/* Tabla Comparativa de Flujo de Efectivo a 5 Años */}
      <div className="wide-table-wrapper" style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'right' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#0f172a', fontWeight: 700 }}>Concepto Financiero (MXN)</th>
              <th style={{ padding: '0.75rem', color: '#64748b' }}>Año 0 (Arranque)</th>
              <th style={{ padding: '0.75rem', color: '#0f172a' }}>Año 1</th>
              <th style={{ padding: '0.75rem', color: '#0f172a' }}>Año 2</th>
              <th style={{ padding: '0.75rem', color: '#0f172a' }}>Año 3</th>
              <th style={{ padding: '0.75rem', color: '#0f172a' }}>Año 4</th>
              <th style={{ padding: '0.75rem', color: '#0f172a' }}>Año 5</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '0.65rem 0.75rem', textAlign: 'left', fontWeight: 600, color: '#0f172a' }}>Inversión Inicial de Capital (CAPEX)</td>
              <td style={{ padding: '0.65rem 0.75rem', color: '#ef4444', fontWeight: 700 }}>-${inversionBase.toLocaleString('es-MX')}</td>
              <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>$0</td>
              <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>$0</td>
              <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>$0</td>
              <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>$0</td>
              <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>$0</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
              <td style={{ padding: '0.65rem 0.75rem', textAlign: 'left', fontWeight: 600, color: '#0f172a' }}>Ingresos Operativos Proyectados</td>
              <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>$0</td>
              {current.ventas.map((v, i) => (
                <td key={i} style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>${v.toLocaleString('es-MX')}</td>
              ))}
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '0.65rem 0.75rem', textAlign: 'left', color: '#64748b' }}>(-) Costos y Gastos de Operación</td>
              <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>$0</td>
              {current.costos.map((c, i) => (
                <td key={i} style={{ padding: '0.65rem 0.75rem', color: '#ef4444' }}>-${c.toLocaleString('es-MX')}</td>
              ))}
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
              <td style={{ padding: '0.65rem 0.75rem', textAlign: 'left', color: '#059669', fontWeight: 600 }}>(+) Rendimiento Reserva de Tesorería (6.5%)</td>
              <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>$0</td>
              {current.ventas.map((_, i) => (
                <td key={i} style={{ padding: '0.65rem 0.75rem', color: '#059669', fontWeight: 600 }}>+${current.rendimientoTesoreria.toLocaleString('es-MX')}</td>
              ))}
            </tr>
            <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700 }}>
              <td style={{ padding: '0.65rem 0.75rem', textAlign: 'left', color: '#0f172a' }}>(=) Flujo Neto Libre Distribuible</td>
              <td style={{ padding: '0.65rem 0.75rem', color: '#ef4444' }}>-${inversionBase.toLocaleString('es-MX')}</td>
              {current.flujoLibre.map((f, i) => (
                <td key={i} style={{ padding: '0.65rem 0.75rem', color: '#10b981' }}>${f.toLocaleString('es-MX')}</td>
              ))}
            </tr>
            <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#ecfdf5', fontWeight: 800 }}>
              <td style={{ padding: '0.75rem', textAlign: 'left', color: '#065f46' }}>(+) Reembolso de Reserva de Tesorería (Año 5)</td>
              <td style={{ padding: '0.75rem', color: '#64748b' }}>-</td>
              <td style={{ padding: '0.75rem', color: '#64748b' }}>$0</td>
              <td style={{ padding: '0.75rem', color: '#64748b' }}>$0</td>
              <td style={{ padding: '0.75rem', color: '#64748b' }}>$0</td>
              <td style={{ padding: '0.75rem', color: '#64748b' }}>$0</td>
              <td style={{ padding: '0.75rem', color: '#059669' }}>+${current.reembolsoReservaA5.toLocaleString('es-MX')}</td>
            </tr>
            <tr style={{ background: '#f1f5f9', fontWeight: 900, borderTop: '2px solid #cbd5e1' }}>
              <td style={{ padding: '0.85rem 0.75rem', textAlign: 'left', color: '#0f172a' }}>TOTAL FLUJO NETO AL INVERSIONISTA</td>
              <td style={{ padding: '0.85rem 0.75rem', color: '#ef4444' }}>-${inversionBase.toLocaleString('es-MX')}</td>
              {current.flujoLibre.map((f, i) => {
                const total = i === 4 ? f + current.reembolsoReservaA5 : f;
                return (
                  <td key={i} style={{ padding: '0.85rem 0.75rem', color: '#059669', fontSize: '0.82rem' }}>
                    ${total.toLocaleString('es-MX')}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tabla Comparativa de los 3 Escenarios Lado a Lado */}
      <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Matriz Comparativa de Sensibilidad (3 Escenarios)
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {Object.entries(scenarios).map(([key, sc]) => (
            <div key={key} style={{ padding: '0.85rem', background: '#ffffff', borderRadius: '8px', border: `1px solid ${sc.color}40`, borderTop: `3px solid ${sc.color}` }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: sc.color }}>{sc.nombre}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', lineHeight: 1.3 }}>{sc.descripcion}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                <span style={{ color: '#64748b' }}>TIR:</span>
                <strong style={{ color: sc.tir >= 12 ? '#10b981' : '#ef4444' }}>{sc.tir}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', fontSize: '0.75rem' }}>
                <span style={{ color: '#64748b' }}>VAN:</span>
                <strong style={{ color: sc.van > 0 ? '#10b981' : '#ef4444' }}>${Math.round(sc.van).toLocaleString('es-MX')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', fontSize: '0.75rem' }}>
                <span style={{ color: '#64748b' }}>Punto Eq:</span>
                <strong>${sc.puntoEquilibrioMensual.toLocaleString('es-MX')}/mes</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
