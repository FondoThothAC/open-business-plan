import { useState } from 'react';
import { FinancialAnalyzer } from '../../lib/tools/financial/FinancialAnalyzer.js';
import { Calculator, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';

/**
 * Componente BoxFormula - Renderiza fórmulas financieras y cuantitativas reactivas
 * Totalmente adaptado al tema claro/oscuro del sistema
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
      background: 'var(--bg-panel, #ffffff)',
      border: '1px solid var(--border-color, #e4e4e7)',
      borderRadius: '12px',
      padding: '20px',
      margin: '20px 0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'rgba(16,185,129,0.12)', borderRadius: '8px', color: '#10b981' }}>
            <Calculator size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary, #09090b)', fontWeight: 700 }}>
              {definition.title || 'Evaluación Cuantitativa y Fórmulas'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #71717a)' }}>
              Fuente: {definition.source?.book || 'Metodología Financiera'} ({definition.source?.page || ''})
            </span>
          </div>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          background: analysis.isViable ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          color: analysis.isViable ? '#10b981' : '#ef4444',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 700
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
        <div style={{ background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #e4e4e7)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)' }}>Valor Actual Neto (VAN)</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: analysis.npv >= 0 ? '#10b981' : '#ef4444' }}>
            {analysis.npvFormatted}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #71717a)' }}>Tasa descuento: {(wacc * 100).toFixed(1)}%</span>
        </div>

        <div style={{ background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #e4e4e7)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)' }}>Tasa Interna Retorno (TIR)</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-color, #6366f1)' }}>
            {analysis.irrPct}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #71717a)' }}>Spread vs WACC: +{((analysis.irr - wacc) * 100).toFixed(1)}%</span>
        </div>

        <div style={{ background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #e4e4e7)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)' }}>Periodo de Recuperación</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>
            {analysis.paybackFormatted}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #71717a)' }}>Horizonte: 5 años</span>
        </div>

        <div style={{ background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #e4e4e7)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)' }}>Relación Beneficio / Costo</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0ea5e9' }}>
            {analysis.bcRatio}x
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #71717a)' }}>B/C &gt; 1.0 = Viable</span>
        </div>
      </div>

      {/* Editor de Entradas Rápidas */}
      <div style={{ background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color, #e4e4e7)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Inversión Inicial CAPEX ($ MXN)</label>
            <input
              type="number"
              className="form-control"
              value={capex}
              onChange={(e) => {
                const c = Number(e.target.value) || 0;
                setCapex(c);
                onChange({ capex: c, wacc, flows, analysis });
              }}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Tasa de Descuento WACC (Decimal: ej. 0.12)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              value={wacc}
              onChange={(e) => {
                const w = Number(e.target.value) || 0.12;
                setWacc(w);
                onChange({ capex, wacc: w, flows, analysis });
              }}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary, #09090b)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <TrendingUp size={14} /> Flujos Anuales Proyectados (Años 1 al 5)
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {flows.map((f, idx) => (
            <div key={idx}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #71717a)', display: 'block', marginBottom: '4px' }}>Año {idx + 1}</label>
              <input
                type="number"
                className="form-control"
                value={f}
                onChange={(e) => handleFlowChange(idx, e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
