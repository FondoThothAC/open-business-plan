import { useState } from 'react';
import { TrendingUp } from 'lucide-react';

/**
 * BoxAmoeba - Calculadora de Rentabilidad por Hora de Amoeba Management (Kyocera / Kazuo Inamori)
 * Fórmula: Valor Agregado por Hora = (Ingresos Totales - Gastos Operativos Directos) / Horas Totales Trabajadas
 * Totalmente adaptado al tema claro/oscuro del sistema
 */
export function BoxAmoeba({ definition = {}, values = {}, onChange = () => {} }) {
  const [inputs, setInputs] = useState({
    nombreAmoeba: values.nombreAmoeba || 'Célula de Diagnóstico y Mantenimiento Hidráulico',
    ingresosMes: values.ingresosMes ?? 850000,
    costosDirectos: values.costosDirectos ?? 320000,
    miembros: values.miembros ?? 6,
    horasPorMiembroMes: values.horasPorMiembroMes ?? 160
  });

  const updateField = (field, val) => {
    const next = { ...inputs, [field]: val };
    setInputs(next);
    onChange(next);
  };

  const totalHoras = (inputs.miembros || 1) * (inputs.horasPorMiembroMes || 1);
  const valorAgregadoBruto = (inputs.ingresosMes || 0) - (inputs.costosDirectos || 0);
  const valorAgregadoPorHora = totalHoras > 0 ? valorAgregadoBruto / totalHoras : 0;
  const margenAmoeba = inputs.ingresosMes > 0 ? (valorAgregadoBruto / inputs.ingresosMes) * 100 : 0;

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
          <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.12)', borderRadius: '10px', color: '#3b82f6' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary, #09090b)', fontWeight: 700 }}>
              {definition.title || 'Rentabilidad por Hora Amoeba (Kyocera / Kazuo Inamori)'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #71717a)' }}>
              Fuente: {definition.source?.book || 'Amoeba Management: The Dynamic Management System for Rapid Market Response'} ({definition.source?.page || 'Ch. 4'})
            </span>
          </div>
        </div>
        <div style={{
          padding: '6px 14px',
          borderRadius: '20px',
          background: valorAgregadoPorHora >= 500 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          color: valorAgregadoPorHora >= 500 ? '#10b981' : '#f59e0b',
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          ${Math.round(valorAgregadoPorHora).toLocaleString()} MXN / hora-hombre
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Nombre de la Micro-Célula
          </label>
          <input
            type="text"
            className="form-control"
            value={inputs.nombreAmoeba}
            onChange={(e) => updateField('nombreAmoeba', e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Ingresos Brutos Mensuales ($)
          </label>
          <input
            type="number"
            className="form-control"
            value={inputs.ingresosMes}
            onChange={(e) => updateField('ingresosMes', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Costos Operativos Directos ($)
          </label>
          <input
            type="number"
            className="form-control"
            value={inputs.costosDirectos}
            onChange={(e) => updateField('costosDirectos', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Miembros en la Célula
          </label>
          <input
            type="number"
            className="form-control"
            value={inputs.miembros}
            onChange={(e) => updateField('miembros', parseInt(e.target.value, 10) || 1)}
          />
        </div>
      </div>

      {/* Resultados de Micro-P&L */}
      <div style={{
        background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))',
        border: '1px solid var(--border-color, #e4e4e7)',
        borderRadius: '8px',
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        textAlign: 'center'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)' }}>Valor Agregado Bruto</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-color, #6366f1)' }}>
            ${valorAgregadoBruto.toLocaleString()} MXN
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)' }}>Horas Totales / Mes</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary, #09090b)' }}>
            {totalHoras.toLocaleString()} hrs
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)' }}>Margen de Célula</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
            {margenAmoeba.toFixed(1)}%
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)' }}>Eficiencia por Hora</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#8b5cf6' }}>
            ${Math.round(valorAgregadoPorHora).toLocaleString()}/hr
          </div>
        </div>
      </div>
    </div>
  );
}
