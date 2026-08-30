import { useState } from 'react';
import { Factory } from 'lucide-react';

/**
 * BoxONUDI - Flujo de Caja Libre para la Firma (FCFF) con WACC (Estándar ONUDI Industrial)
 * Fórmula: FCFF = EBIT x (1 - T) + Depreciación - CAPEX - Δ Capital de Trabajo
 * Totalmente adaptado al tema claro/oscuro del sistema
 */
export function BoxONUDI({ definition = {}, values = {}, onChange = () => {} }) {
  const [inputs, setInputs] = useState({
    ebit: values.ebit ?? 3500000,
    tasaImpuestos: values.tasaImpuestos ?? 30, // 30% ISR
    depreciacion: values.depreciacion ?? 600000,
    capex: values.capex ?? 800000,
    deltaNWC: values.deltaNWC ?? 250000,
    wacc: values.wacc ?? 11.5 // 11.5%
  });

  const updateInput = (field, val) => {
    const next = { ...inputs, [field]: val };
    setInputs(next);
    onChange(next);
  };

  const taxRate = (inputs.tasaImpuestos || 0) / 100;
  const nopat = (inputs.ebit || 0) * (1 - taxRate); // EBIT x (1 - T)
  const fcff = nopat + (inputs.depreciacion || 0) - (inputs.capex || 0) - (inputs.deltaNWC || 0);
  const discountFactor = 1 / (1 + (inputs.wacc || 10) / 100);
  const valorPresente = fcff * discountFactor;

  return (
    <div style={{
      background: 'var(--bg-panel, #ffffff)',
      border: '1px solid var(--border-color, #e4e4e7)',
      borderRadius: '12px',
      padding: '24px',
      margin: '20px 0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(14, 165, 233, 0.12)', borderRadius: '10px', color: '#0ea5e9' }}>
            <Factory size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary, #09090b)', fontWeight: 700 }}>
              {definition.title || 'Modelo FCFF y Factibilidad Industrial (Metodología ONUDI)'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #71717a)' }}>
              Fuente: {definition.source?.book || 'Manual for the Preparation of Industrial Feasibility Studies (UNIDO)'} ({definition.source?.page || 'Part II'})
            </span>
          </div>
        </div>
        <div style={{
          padding: '6px 14px',
          borderRadius: '20px',
          background: fcff > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: fcff > 0 ? '#10b981' : '#ef4444',
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          FCFF: ${Math.round(fcff).toLocaleString()} MXN
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            EBIT Operativo ($)
          </label>
          <input
            type="number"
            className="form-control"
            value={inputs.ebit}
            onChange={(e) => updateInput('ebit', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Tasa Fiscal / ISR (%)
          </label>
          <input
            type="number"
            className="form-control"
            value={inputs.tasaImpuestos}
            onChange={(e) => updateInput('tasaImpuestos', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Depreciación Anual ($)
          </label>
          <input
            type="number"
            className="form-control"
            value={inputs.depreciacion}
            onChange={(e) => updateInput('depreciacion', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            CAPEX Requerido ($)
          </label>
          <input
            type="number"
            className="form-control"
            value={inputs.capex}
            onChange={(e) => updateInput('capex', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Δ Capital Trabajo ($)
          </label>
          <input
            type="number"
            className="form-control"
            value={inputs.deltaNWC}
            onChange={(e) => updateInput('deltaNWC', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            WACC Descuento (%)
          </label>
          <input
            type="number"
            className="form-control"
            value={inputs.wacc}
            onChange={(e) => updateInput('wacc', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div style={{
        background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))',
        border: '1px solid var(--border-color, #e4e4e7)',
        borderRadius: '8px',
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        textAlign: 'center'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)' }}>NOPAT (EBIT x [1-T])</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-color, #6366f1)' }}>
            ${Math.round(nopat).toLocaleString()} MXN
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)' }}>Flujo Libre a la Firma (FCFF)</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
            ${Math.round(fcff).toLocaleString()} MXN
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)' }}>Valor Presente Año 1 (VP)</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#8b5cf6' }}>
            ${Math.round(valorPresente).toLocaleString()} MXN
          </div>
        </div>
      </div>
    </div>
  );
}
