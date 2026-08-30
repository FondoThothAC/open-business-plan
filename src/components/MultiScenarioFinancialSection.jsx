import { useState } from 'react';
import { BarChart3 } from 'lucide-react';

export default function MultiScenarioFinancialSection({ planData }) {
  const [selectedScenario, setSelectedScenario] = useState('base');

  // Helper seguro para extraer montos del planData o aplicar el modelo base
  const parseAmount = (val, fallback) => {
    if (!val) return fallback;
    if (typeof val === 'number') return Number.isFinite(val) && val > 0 ? val : fallback;
    const clean = String(val).replace(/[^0-9.-]+/g, '');
    const num = parseFloat(clean);
    return Number.isFinite(num) && num > 0 ? num : fallback;
  };

  // Obtener cifras base del plan o fallback corporativo ($20M MXN / MaaS Minero)
  const inversionBase = parseAmount(
    planData?.organizacion?.inversion?.monto_total ||
    planData?.organizacion?.inversion?.capex ||
    planData?.semilla?.finanzas?.inversion_total,
    20000000
  );

  const factorEscala = inversionBase / 20000000;

  const scenarios = {
    base: {
      nombre: 'Escenario Base (Modelo Maestro / RAG)',
      descripcion: 'Caso maestro con contratos mineros Tier 1/2 en Sonora, 65% de costos operativos y reserva líquida de tesorería con yield del 6.5%.',
      color: '#4f46e5',
      wacc: 12.0,
      tir: 15.11,
      van: 1836412.50 * factorEscala,
      roi: 24.2,
      payback: '4.1 Años',
      puntoEquilibrioMensual: Math.round(641666 * factorEscala),
      ventas: [16000000, 19200000, 23040000, 27648000, 33177600].map(v => Math.round(v * factorEscala)),
      costos: [10400000, 12480000, 14976000, 17971200, 21565440].map(c => Math.round(c * factorEscala)),
      rendimientoTesoreria: Math.round(455000 * factorEscala),
      flujoLibre: [3935750, 4663750, 5537350, 6585670, 7843654].map(f => Math.round(f * factorEscala)),
      reembolsoReservaA5: Math.round(7000000 * factorEscala)
    },
    optimista: {
      nombre: 'Escenario Optimista (+15% Volumen y +5% Tarifas)',
      descripcion: 'Mayor penetración en distritos mineros de Cananea/Nacozari y expansión acelerada de telemetría IoT.',
      color: '#10b981',
      wacc: 12.0,
      tir: 22.45,
      van: 4520800.00 * factorEscala,
      roi: 38.5,
      payback: '3.4 Años',
      puntoEquilibrioMensual: Math.round(590000 * factorEscala),
      ventas: [19200000, 23040000, 27648000, 33177600, 39813120].map(v => Math.round(v * factorEscala)),
      costos: [11520000, 13824000, 16588800, 19906560, 23887872].map(c => Math.round(c * factorEscala)),
      rendimientoTesoreria: Math.round(455000 * factorEscala),
      flujoLibre: [5287750, 6288750, 7489950, 8931390, 10661118].map(f => Math.round(f * factorEscala)),
      reembolsoReservaA5: Math.round(7000000 * factorEscala)
    },
    pesimista: {
      nombre: 'Escenario Pesimista (-25% Ventas y +10% Inflación en Insumos)',
      descripcion: 'Desaceleración temporal en licitaciones y retraso en cobranza de grandes corporativos.',
      color: '#ef4444',
      wacc: 12.0,
      tir: 8.92,
      van: -1120500.00 * factorEscala,
      roi: 9.8,
      payback: '5.2 Años',
      puntoEquilibrioMensual: Math.round(720000 * factorEscala),
      ventas: [12000000, 14400000, 17280000, 20736000, 24883200].map(v => Math.round(v * factorEscala)),
      costos: [8640000, 10368000, 12441600, 14929920, 17915904].map(c => Math.round(c * factorEscala)),
      rendimientoTesoreria: Math.round(455000 * factorEscala),
      flujoLibre: [2479750, 2907750, 3421350, 4037670, 4777254].map(f => Math.round(f * factorEscala)),
      reembolsoReservaA5: Math.round(7000000 * factorEscala)
    }
  };

  const current = scenarios[selectedScenario] || scenarios.base;

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
            Proyección a 5 años basada en capital de $20,000,000 MXN y rendimiento de tesorería colateralizada
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
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>MXN/mes (~22 pistones/mes)</span>
        </div>

        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Periodo de Recuperación</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
            {current.payback}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Con Recompra Serie B Año 5</span>
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
              <td style={{ padding: '0.65rem 0.75rem', textAlign: 'left', fontWeight: 600, color: '#0f172a' }}>Inversión Inicial Emitida (Serie B)</td>
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
              <td style={{ padding: '0.65rem 0.75rem', textAlign: 'left', color: '#64748b' }}>(-) Costos y Gastos de Operación (65%)</td>
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
