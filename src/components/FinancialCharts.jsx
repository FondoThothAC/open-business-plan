import React from 'react';

/**
 * Gráfico de Barras y Líneas Industrial (SVG Puro)
 * @param {Array} data - Array de objetos { label: string, income: number, expense: number, net: number }
 */
export const CashFlowChart = ({ data = [] }) => {
  if (!data || data.length === 0) return <div className="text-secondary text-center p-8">No hay datos suficientes para graficar.</div>;

  const width = 800;
  const height = 300;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Encontrar el máximo valor para escalar
  const maxVal = Math.max(...data.flatMap(d => [Math.abs(d.income), Math.abs(d.expense), Math.abs(d.net || 0)])) * 1.1;
  const minVal = Math.min(0, ...data.map(d => d.net || 0)) * 1.1;
  const totalRange = (maxVal - minVal) || 1;

  const getY = (val) => chartHeight - (((val || 0) - minVal) / totalRange) * chartHeight + padding;
  const getX = (index) => (index / (Math.max(1, data.length - 1))) * chartWidth + padding;

  // Generar puntos para la línea de Flujo Neto
  const linePoints = data.map((d, i) => `${getX(i)},${getY(d.net || 0)}`).join(' ');

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
        {/* Guías Horizontales */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const val = minVal + totalRange * p;
          const y = getY(val);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
              <text x={padding - 5} y={y + 4} fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end">
                {Math.round(val / 1000)}k
              </text>
            </g>
          );
        })}

        {/* Eje X Etiquetas */}
        {data.map((d, i) => (
          <text key={i} x={getX(i)} y={height - padding + 20} fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="middle">
            {d.label}
          </text>
        ))}

        {/* Barras de Ingresos (Verdes) y Egresos (Rojas) */}
        {data.map((d, i) => {
          const barWidth = 15;
          const incomeH = (d.income / totalRange) * chartHeight;
          const expenseH = (Math.abs(d.expense) / totalRange) * chartHeight;
          const zeroY = getY(0);

          return (
            <g key={i}>
              {/* Ingresos */}
              <rect 
                x={getX(i) - barWidth - 2} 
                y={zeroY - incomeH} 
                width={barWidth} 
                height={incomeH} 
                fill="var(--success-color)" 
                fillOpacity="0.6" 
                rx="2"
              />
              {/* Egresos */}
              <rect 
                x={getX(i) + 2} 
                y={zeroY} 
                width={barWidth} 
                height={expenseH} 
                fill="#ef4444" 
                fillOpacity="0.6" 
                rx="2"
              />
            </g>
          );
        })}

        {/* Línea de Flujo Neto Acumulado */}
        <path 
          d={`M ${linePoints}`} 
          fill="none" 
          stroke="var(--accent-color)" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          style={{ filter: 'drop-shadow(0 0 8px var(--accent-color))' }}
        />
        
        {/* Puntos de la línea */}
        {data.map((d, i) => (
          <circle 
            key={i} 
            cx={getX(i)} 
            cy={getY(d.net || 0)} 
            r="4" 
            fill="var(--accent-color)" 
            stroke="white" 
            strokeWidth="2" 
          />
        ))}
      </svg>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', background: 'var(--success-color)', borderRadius: '2px' }}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Ingresos Anuales</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Egresos Anuales</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '20px', height: '3px', background: 'var(--accent-color)' }}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Flujo Neto Acumulado</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Velocímetro de Rentabilidad (Punto de Equilibrio)
 */
export const ProfitGauge = ({ value = 0, label = "TIR" }) => {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const angle = (normalizedValue / 100) * 180 - 180;
  
  const gradientId = `gauge-gradient-${label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
  const radius = 80;
  const circumference = Math.PI * radius; // Semicírculo
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minHeight: '140px' }}>
      <svg width="180" height="110" viewBox="0 0 200 120">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="var(--success-color)" />
          </linearGradient>
        </defs>
        {/* Fondo del arco */}
        <path 
          d="M 20 110 A 80 80 0 0 1 180 110" 
          fill="none" 
          stroke="rgba(0,0,0,0.1)" 
          strokeWidth="12" 
          strokeLinecap="round" 
        />
        {/* Progreso del arco */}
        <path 
          d="M 20 110 A 80 80 0 0 1 180 110" 
          fill="none" 
          stroke={`url(#${gradientId})`} 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeDasharray={circumference} 
          strokeDashoffset={circumference * (1 - normalizedValue / 100)} 
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
        {/* Aguja */}
        <g transform={`rotate(${angle} 100 110)`} style={{ transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <line x1="100" y1="110" x2="100" y2="40" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="110" x2="100" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="100" cy="110" r="6" fill="#1e293b" />
          <circle cx="100" cy="110" r="3" fill="white" />
        </g>
        <text x="100" y="90" textAnchor="middle" fill="#1e293b" fontSize="24" fontWeight="900">
          {Number(value || 0).toFixed(1)}%
        </text>
        <text x="100" y="115" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </text>
      </svg>
    </div>
  );
};

// Componente principal que agrupa los gráficos para el dashboard/preview
export default function FinancialCharts({ staff = [] }) {
  // Datos simulados basados en la nómina para el demo
  const monthlySalary = staff.reduce((acc, curr) => acc + (curr.salary || 0), 0);
  const annualExpense = monthlySalary * 12;
  
  const dummyData = [
    { label: 'Año 1', income: annualExpense * 1.2, expense: annualExpense, net: annualExpense * 0.2 },
    { label: 'Año 2', income: annualExpense * 1.5, expense: annualExpense * 1.1, net: annualExpense * 0.4 },
    { label: 'Año 3', income: annualExpense * 2.1, expense: annualExpense * 1.2, net: annualExpense * 0.9 },
    { label: 'Año 4', income: annualExpense * 2.8, expense: annualExpense * 1.3, net: annualExpense * 1.5 },
    { label: 'Año 5', income: annualExpense * 3.5, expense: annualExpense * 1.4, net: annualExpense * 2.1 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
        <h4 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Proyección de Flujo de Caja (5 Años)
        </h4>
        <CashFlowChart data={dummyData} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
          <ProfitGauge value={24.5} label="TIR Estimada" />
        </div>
        <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
          <ProfitGauge value={78} label="Índice Rendimiento" />
        </div>
        <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
          <ProfitGauge value={12} label="Punto Equilibrio (Mes)" />
        </div>
      </div>
    </div>
  );
}
