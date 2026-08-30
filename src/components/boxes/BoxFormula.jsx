import { useState } from 'react';
import { FinancialAnalyzer } from '../../lib/tools/financial/FinancialAnalyzer.js';
import { Calculator, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';

/**
 * Componente BoxFormula - Renderiza fórmulas financieras y cuantitativas reactivas
 */
export function BoxFormula({ definition = {}, values = {}, onChange = () => {} }) {
  const [capex, setCapex] = useState(values.capex || 20000000);
  const [wacc, setWacc] = useState(values.wacc || 0.12);
  const [flows, setFlows] = useState(values.flows || [5000000, 6500000, 8000000, 9500000, 11000000]);

  const analysis = FinancialAnalyzer.analyze({
    initialInvestment: Number(capex) || 20000000,
    cashFlows: flows,
    equity: Number(capex) || 20000000,
    debt: 0
  });

  const handleFlowChange = (index, val) => {
    const nextFlows = [...flows];
    nextFlows[index] = Number(val) || 0;
    setFlows(nextFlows);
    onChange({ capex, wacc, flows: nextFlows, analysis });
  };

  return (
    <div style={{
      background: 'var(--card-bg, #1e293b)',
      border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
      borderRadius: '12px',
      padding: '20px',
      margin: '20px 0',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'rgba(16,185,129,0.15)', borderRadius: '8px', color: '#34d399' }}>
            <Calculator size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary, #f8fafc)', fontWeight: 600 }}>
              {definition.title || 'Evaluación Cuantitativa y Fórmulas'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
              Fuente: {definition.source?.book || 'Metodología Financiera'} ({definition.source?.page || ''})
            </span>
          </div>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: analysis.isViable ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          color: analysis.isViable ? '#34d399' : '#f87171',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          {analysis.isViable ? <CheckCircle size={14} /> : <RefreshCw size={14} />}
          {analysis.isViable ? 'Proyecto Viable' : 'Revisar Retorno'}
        </div>
      </div>

      {/* Grid de Métricas Clave */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Valor Actual Neto (VAN)</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: analysis.npv >= 0 ? '#34d399' : '#f87171' }}>
            {analysis.npvFormatted}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Tasa descuento: {(wacc * 100).toFixed(1)}%</span>
        </div>

        <div style={{ background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tasa Interna Retorno (TIR)</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#818cf8' }}>
            {analysis.irrPct}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Spread vs WACC: +{((analysis.irr - wacc) * 100).toFixed(1)}%</span>
        </div>

        <div style={{ background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Periodo de Recuperación</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>
            {analysis.paybackFormatted}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Horizonte: 5 años</span>
        </div>

        <div style={{ background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Relación Beneficio / Costo</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>
            {analysis.bcRatio}x
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>B/C &gt; 1.0 = Viable</span>
        </div>
      </div>

      {/* Editor de Entradas Rápidas */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Inversión Inicial CAPEX ($ MXN)</label>
            <input
              type="number"
              value={capex}
              onChange={(e) => {
                const c = Number(e.target.value) || 0;
                setCapex(c);
                onChange({ capex: c, wacc, flows, analysis });
              }}
              style={{
                width: '100%',
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                color: '#f8fafc',
                fontSize: '0.8rem',
                padding: '6px'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tasa de Descuento WACC (Decimal: ej. 0.12)</label>
            <input
              type="number"
              step="0.01"
              value={wacc}
              onChange={(e) => {
                const w = Number(e.target.value) || 0.12;
                setWacc(w);
                onChange({ capex, wacc: w, flows, analysis });
              }}
              style={{
                width: '100%',
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                color: '#f8fafc',
                fontSize: '0.8rem',
                padding: '6px'
              }}
            />
          </div>
        </div>

        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <TrendingUp size={14} /> Flujos Anuales Proyectados (Años 1 al 5)
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {flows.map((f, idx) => (
            <div key={idx}>
              <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Año {idx + 1}</label>
              <input
                type="number"
                value={f}
                onChange={(e) => handleFlowChange(idx, e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15,23,42,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  color: '#f8fafc',
                  fontSize: '0.8rem',
                  padding: '6px'
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
