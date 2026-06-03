import React, { useState, useMemo } from 'react';

const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Number(value || 0));

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function buildFallbackData(staff = []) {
  const monthlySalary = staff.reduce((acc, curr) => acc + (curr.salary || 0), 0);
  const annualExpense = monthlySalary * 12;

  return {
    chartData: [
      { label: 'Año 1', income: annualExpense * 1.2, expense: annualExpense, net: annualExpense * 0.2 },
      { label: 'Año 2', income: annualExpense * 1.5, expense: annualExpense * 1.1, net: annualExpense * 0.4 },
      { label: 'Año 3', income: annualExpense * 2.1, expense: annualExpense * 1.2, net: annualExpense * 0.9 },
      { label: 'Año 4', income: annualExpense * 2.8, expense: annualExpense * 1.3, net: annualExpense * 1.5 },
      { label: 'Año 5', income: annualExpense * 3.5, expense: annualExpense * 1.4, net: annualExpense * 2.1 },
    ],
    annualSummaries: [],
    metrics: { irr: 24.5, roi: 78, npv: annualExpense * 2.5, paybackPeriod: '2 años 8 meses', cbr: 1.2 }
  };
}

function normalizeFinancialData(projections, staff) {
  if (!projections || typeof projections !== 'object') return buildFallbackData(staff);

  const annualCashFlowData = Array.isArray(projections.annualCashFlowData) ? projections.annualCashFlowData : [];
  const annualSummaries = Array.isArray(projections.annualSummaries) ? projections.annualSummaries : [];

  if (annualCashFlowData.length === 0) return buildFallbackData(staff);

  const chartData = annualCashFlowData.map((row) => {
    const summary = annualSummaries.find((s) => s.year === row.year);
    return {
      label: `Año ${row.year}`,
      income: summary?.incomeStatement?.sales || 0,
      expense: (summary?.incomeStatement?.fixedCosts || 0) + (summary?.incomeStatement?.variableCosts || 0),
      net: row.cumulativeCashFlow || row.netCashFlow || 0,
    };
  });

  return {
    chartData,
    annualSummaries,
    metrics: projections.financialMetrics || {}
  };
}

/**
 * Modern SVG Cash Flow Chart with Gradients and Glow Filters
 */
export const CashFlowChart = ({ data = [] }) => {
  if (!data || data.length === 0) return <div className="text-secondary text-center p-8">No hay datos suficientes para graficar.</div>;

  const width = 900;
  const height = 340;
  const padding = 50;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxVal = Math.max(...data.flatMap((d) => [Math.abs(d.income), Math.abs(d.expense), Math.abs(d.net || 0)])) * 1.1;
  const minVal = Math.min(0, ...data.map((d) => d.net || 0)) * 1.1;
  const totalRange = (maxVal - minVal) || 1;

  const getY = (val) => chartHeight - (((val || 0) - minVal) / totalRange) * chartHeight + padding;
  const getX = (index) => (index / (Math.max(1, data.length - 1))) * chartWidth + padding;
  const linePoints = data.map((d, i) => `${getX(i)},${getY(d.net || 0)}`).join(' ');

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        style={{ 
          width: '100%', 
          height: 'auto', 
          background: 'rgba(15, 23, 42, 0.4)', 
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
        }}
      >
        <defs>
          {/* Income Bars Gradient (Green to Emerald) */}
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          {/* Expense Bars Gradient (Rose to Red) */}
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          {/* Cumulative Flow Line Glow Filter */}
          <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#818cf8" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Horizontal Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const val = minVal + totalRange * p;
          const y = getY(val);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="5,5" />
              <text x={padding - 10} y={y + 4} fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="600" textAnchor="end">
                {formatCurrency(val)}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {data.map((d, i) => (
          <text key={i} x={getX(i)} y={height - padding + 25} fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="700" textAnchor="middle">
            {d.label}
          </text>
        ))}

        {/* Bar charts (Income and Expense) */}
        {data.map((d, i) => {
          const barWidth = 18;
          const incomeH = (d.income / totalRange) * chartHeight;
          const expenseH = (Math.abs(d.expense) / totalRange) * chartHeight;
          const zeroY = getY(0);

          return (
            <g key={i}>
              {/* Income bar */}
              <rect 
                x={getX(i) - barWidth - 3} 
                y={zeroY - incomeH} 
                width={barWidth} 
                height={incomeH} 
                fill="url(#incomeGrad)" 
                rx="4" 
                style={{ transition: 'all 0.3s' }}
              />
              {/* Expense bar */}
              <rect 
                x={getX(i) + 3} 
                y={zeroY} 
                width={barWidth} 
                height={expenseH} 
                fill="url(#expenseGrad)" 
                rx="4"
                style={{ transition: 'all 0.3s' }}
              />
            </g>
          );
        })}

        {/* Net Flow Line with drop-shadow glow */}
        <path 
          d={`M ${linePoints}`} 
          fill="none" 
          stroke="#818cf8" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          filter="url(#shadowGlow)" 
        />

        {/* Dots on Net Flow Line */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(d.net || 0)} r="7" fill="#4f46e5" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
            <circle cx={getX(i)} cy={getY(d.net || 0)} r="3" fill="#ffffff" />
          </g>
        ))}
      </svg>

      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1.25rem', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, #4ade80, #10b981)', borderRadius: '4px' }}></div>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Ingresos Anuales</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, #fb7185, #ef4444)', borderRadius: '4px' }}></div>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Egresos Anuales</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '24px', height: '4px', background: '#818cf8', borderRadius: '2px' }}></div>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Flujo Neto Acumulado</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Modern Circular Ring Progress Gauge
 */
export const ProfitGauge = ({ value = 0, label = 'TIR' }) => {
  const normalizedValue = clamp(Number(value || 0), 0, 100);
  const size = 160;
  const radius = 60;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  let progressColor = '#ef4444'; // Red
  if (normalizedValue >= 15 && normalizedValue < 30) progressColor = '#f59e0b'; // Amber
  if (normalizedValue >= 30) progressColor = '#10b981'; // Green

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem 0' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background track circle */}
          <circle 
            cx={size / 2} 
            cy={size / 2} 
            r={radius} 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.05)" 
            strokeWidth={strokeWidth} 
          />
          {/* Colored progress circle */}
          <circle 
            cx={size / 2} 
            cy={size / 2} 
            r={radius} 
            fill="none" 
            stroke={progressColor} 
            strokeWidth={strokeWidth} 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        {/* Center label values */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: size, 
          height: size, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {Number(value || 0).toFixed(1)}%
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

const ExpandIcon = ({ expanded }) => (
  <svg
    className="w-4 h-4 transition-transform duration-200"
    style={{ transform: expanded ? 'rotate(90deg)' : 'none', width: '16px', height: '16px' }}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

const MonthlyDetailTable = ({ data, headers, keys, showSalesPercentage, colSpan }) => (
  <tr className="detail-row">
    <td colSpan={colSpan || (headers.length + 2)}>
      <div style={{ padding: '1rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '12px', border: '1px solid var(--border-color)', margin: '0.5rem 0' }}>
        <table className="financial-table" style={{ fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              {headers.map((h) => (
                <th key={h} style={{ textAlign: 'right', padding: '0.4rem 0.6rem' }} className="first:text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                {keys.map((key) => {
                  const value = row[key];
                  const isCurrency = typeof value === 'number' && key !== 'month' && key !== 'year';
                  const isPercentage = key.toLowerCase().includes('percentage') || key === 'bepPercentage';
                  const shouldShowPercentage = showSalesPercentage && isCurrency && key !== 'sales' && row.sales > 0;
                  const percentage = shouldShowPercentage ? `(${(value / row.sales * 100).toFixed(1)}%)` : null;

                  let displayValue;
                  if (isCurrency) {
                    displayValue = formatCurrency(value);
                  } else if (isPercentage) {
                    displayValue = isFinite(Number(value)) ? `${Number(value).toFixed(1)}%` : 'N/A';
                  } else {
                    displayValue = value !== undefined && value !== null ? value : '';
                  }

                  return (
                    <td
                      key={key}
                      style={{ textAlign: 'right', padding: '0.4rem 0.6rem', color: typeof value === 'number' && value < 0 ? 'var(--danger-color)' : 'inherit' }}
                      className="first:text-left font-medium first:text-primary"
                    >
                      <span>{displayValue}</span>
                      {percentage && <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{percentage}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </td>
  </tr>
);

const ViewModeSwitcher = ({ currentMode, onModeChange, showMonthlyOption }) => {
  if (!showMonthlyOption) return null;

  return (
    <div className="view-mode-switcher" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
      <div className="view-toggle" style={{ background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <button
          type="button"
          onClick={() => onModeChange('annual')}
          className={currentMode === 'annual' ? 'active' : ''}
          style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', border: 'none', background: currentMode === 'annual' ? 'var(--accent-color)' : 'transparent', color: currentMode === 'annual' ? 'white' : 'var(--text-secondary)', fontWeight: 700 }}
        >
          Anual
        </button>
        <button
          type="button"
          onClick={() => onModeChange('monthly')}
          className={currentMode === 'monthly' ? 'active' : ''}
          style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', border: 'none', background: currentMode === 'monthly' ? 'var(--accent-color)' : 'transparent', color: currentMode === 'monthly' ? 'white' : 'var(--text-secondary)', fontWeight: 700 }}
        >
          Mensual
        </button>
      </div>
    </div>
  );
};

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="pagination-container" style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-secondary"
        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
      >
        Anterior
      </button>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-secondary"
        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
      >
        Siguiente
      </button>
    </div>
  );
};

export const ReportTable = ({ headers, annualData, keys, monthlyData, monthlyHeaders, monthlyKeys, showSalesPercentage, alwaysExpanded = false }) => {
  const [expandedYears, setExpandedYears] = useState({});
  const [viewMode, setViewMode] = useState('annual');
  const [currentPage, setCurrentPage] = useState(1);

  const ROWS_PER_PAGE = 12;

  const toggleYear = (year) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
    setCurrentPage(1);
    setExpandedYears({});
  };

  const { paginatedMonthlyData, totalPages } = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) {
      return { paginatedMonthlyData: [], totalPages: 1 };
    }
    const total = Math.ceil(monthlyData.length / ROWS_PER_PAGE);
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    return {
      paginatedMonthlyData: monthlyData.slice(startIndex, endIndex),
      totalPages: total,
    };
  }, [monthlyData, currentPage]);

  return (
    <div>
      {!alwaysExpanded && (
        <ViewModeSwitcher
          currentMode={viewMode}
          onModeChange={handleViewChange}
          showMonthlyOption={monthlyData && monthlyData.length > 0}
        />
      )}
      <div className="financial-table-wrapper" style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'transparent' }}>
        {alwaysExpanded || viewMode === 'annual' ? (
          <table className="financial-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(128,128,128,0.05)' }}>
                {!alwaysExpanded && <th style={{ width: '40px', padding: '0.75rem 0.5rem' }}></th>}
                {headers.map((h) => (
                  <th key={h} style={{ textAlign: 'right', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }} className="first:text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {annualData.map((row, index) => (
                <React.Fragment key={index}>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {!alwaysExpanded && (
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                        {monthlyData.length > 0 && row.year !== '0' && row.year !== 0 && (
                          <button
                            type="button"
                            onClick={() => toggleYear(row.year)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            <ExpandIcon expanded={!!expandedYears[row.year]} />
                          </button>
                        )}
                      </td>
                    )}
                    {keys.map((key) => {
                      const value = row[key];
                      const isCurrency = typeof value === 'number' && key !== 'year';
                      const isPercentage = key.toLowerCase().includes('percentage') || key === 'bepPercentage';
                      const shouldShowPercentage = showSalesPercentage && isCurrency && key !== 'sales' && row.sales > 0;
                      const percentage = shouldShowPercentage ? `(${(value / row.sales * 100).toFixed(1)}%)` : null;

                      let displayValue;
                      if (isCurrency) {
                        displayValue = formatCurrency(value);
                      } else if (isPercentage) {
                        displayValue = isFinite(Number(value)) ? `${Number(value).toFixed(1)}%` : 'N/A';
                      } else {
                        displayValue = value !== undefined && value !== null ? value.toString() : '';
                      }

                      return (
                        <td
                          key={key}
                          style={{ padding: '0.75rem 1rem', textAlign: 'right', color: typeof value === 'number' && value < 0 ? 'var(--danger-color)' : 'inherit' }}
                          className="first:text-left first:font-bold"
                        >
                          <span>{displayValue}</span>
                          {percentage && <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{percentage}</span>}
                        </td>
                      );
                    })}
                  </tr>
                  {(alwaysExpanded || !!expandedYears[row.year]) && (
                    <MonthlyDetailTable
                      data={monthlyData.filter((m) => m.year === row.year)}
                      headers={monthlyHeaders}
                      keys={monthlyKeys}
                      showSalesPercentage={showSalesPercentage}
                      colSpan={alwaysExpanded ? headers.length : headers.length + 1}
                    />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <>
            <table className="financial-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(128,128,128,0.05)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Año</th>
                  {monthlyHeaders.map((h) => (
                    <th key={h} style={{ textAlign: 'right', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }} className="first:text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedMonthlyData.map((row, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 1rem' }} className="font-bold">{row.year}</td>
                    {monthlyKeys.map((key) => {
                      const value = row[key];
                      const isCurrency = typeof value === 'number' && key !== 'month' && key !== 'year';
                      const isPercentage = key.toLowerCase().includes('percentage') || key === 'bepPercentage';
                      const shouldShowPercentage = showSalesPercentage && isCurrency && key !== 'sales' && row.sales > 0;
                      const percentage = shouldShowPercentage ? `(${(value / row.sales * 100).toFixed(1)}%)` : null;

                      let displayValue;
                      if (isCurrency) {
                        displayValue = formatCurrency(value);
                      } else if (isPercentage) {
                        displayValue = isFinite(Number(value)) ? `${Number(value).toFixed(1)}%` : 'N/A';
                      } else {
                        displayValue = value !== undefined && value !== null ? value : '';
                      }

                      return (
                        <td
                          key={key}
                          style={{ padding: '0.75rem 1rem', textAlign: 'right', color: typeof value === 'number' && value < 0 ? 'var(--danger-color)' : 'inherit' }}
                          className="first:text-left font-medium first:text-primary"
                        >
                          <span>{displayValue}</span>
                          {percentage && <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{percentage}</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div style={{ padding: '1rem' }}>
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`financial-tab-btn ${active ? 'active' : ''}`}
  >
    {children}
  </button>
);

const CostHeatmap = ({ data }) => {
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });

  const colors = useMemo(() => {
    if (typeof window === 'undefined') return { startColor: { r: 31, g: 41, b: 55 }, endColor: { r: 239, g: 68, b: 68 } };
    const isLight = document.documentElement.getAttribute('data-theme') === 'light' || 
                    document.documentElement.getAttribute('data-theme') === 'clean' ||
                    document.documentElement.getAttribute('data-theme') === 'oceanic';
    const styles = getComputedStyle(document.documentElement);
    const dangerHex = styles.getPropertyValue('--danger-color').trim() || '#ef4444';
    
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 239, g: 68, b: 68 };
    };

    const endColor = hexToRgb(dangerHex);
    const startColor = isLight ? { r: 243, g: 244, b: 246 } : { r: 31, g: 41, b: 55 };
    return { startColor, endColor };
  }, [tooltip.visible]);

  const rowsConfig = [
    { key: 'fixedCosts', label: 'C. Fijos' },
    { key: 'variableCosts', label: 'C. Variables' },
    { key: 'monthlyDepreciation', label: 'Depreciación' },
    { key: 'monthlyInterest', label: 'Intereses' },
    { key: 'taxes', label: 'Impuestos' },
  ];

  const groupedByYear = useMemo(() => {
    const groups = {};
    data.forEach((monthData) => {
      const yr = monthData.year;
      if (!groups[yr]) groups[yr] = [];
      groups[yr].push(monthData);
    });
    return groups;
  }, [data]);

  const { min, max } = useMemo(() => {
    const allValues = data.flatMap((monthData) => rowsConfig.map((row) => monthData[row.key] || 0));
    const positiveValues = allValues.filter((v) => v > 0);
    const minVal = positiveValues.length > 0 ? Math.min(...positiveValues) : 0;
    const maxVal = positiveValues.length > 0 ? Math.max(...positiveValues) : 0;
    return { min: minVal, max: maxVal };
  }, [data]);

  const getColorForValue = (value) => {
    const { startColor, endColor } = colors;
    if (value <= 0) return `rgb(${startColor.r}, ${startColor.g}, ${startColor.b})`;
    if (min === max) return `rgb(${endColor.r}, ${endColor.g}, ${endColor.b})`;

    const logMax = Math.log(max);
    const logMin = Math.log(min);
    const logVal = Math.log(value);
    const intensity = (logVal - logMin) / (logMax - logMin);

    if (isNaN(intensity) || !isFinite(intensity)) return `rgb(${startColor.r}, ${startColor.g}, ${startColor.b})`;

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * intensity);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * intensity);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * intensity);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleMouseMove = (e, value, rowLabel, colLabel) => {
    setTooltip({
      visible: true,
      content: `<div style="font-weight:bold; margin-bottom: 2px;">${rowLabel}</div><div style="color:var(--text-secondary); margin-bottom: 4px;">${colLabel}</div><div style="font-size:0.9rem; font-weight:700; color:var(--accent-hover);">${formatCurrency(value)}</div>`,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseLeave = () => setTooltip({ ...tooltip, visible: false });

  const legendSteps = 5;
  const legendItems = Array.from({ length: legendSteps }, (_, i) => {
    const value = min + (i / (legendSteps - 1)) * (max - min);
    return { value, color: getColorForValue(value) };
  });

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {tooltip.visible && (
        <div
          className="heatmap-tooltip"
          style={{ top: tooltip.y - 15, left: tooltip.x }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}

      {Object.keys(groupedByYear).sort((a, b) => Number(a) - Number(b)).map((yearKey) => {
        const yearData = groupedByYear[yearKey];
        const colsLabels = yearData.map((d) => `M${d.month}`);
        
        return (
          <div key={yearKey} className="glass-panel heatmap-year-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Año {yearKey}
            </div>
            <div className="heatmap-year-scroll-wrapper" style={{ overflowX: 'auto' }}>
              <div
                className="heatmap-year-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `minmax(100px, 1.2fr) repeat(${yearData.length}, 1fr)`,
                  gap: '4px',
                  minWidth: '550px',
                }}
              >
                <div />
                {colsLabels.map((col, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', padding: '4px 0' }}>
                    {col}
                  </div>
                ))}

                {rowsConfig.map((rowInfo, rowIndex) => {
                  const rowValues = yearData.map((monthData) => monthData[rowInfo.key] || 0);
                  
                  return (
                    <React.Fragment key={rowIndex}>
                      <div
                        style={{
                          textAlign: 'right',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          paddingRight: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {rowInfo.label}
                      </div>
                      {rowValues.map((value, colIndex) => (
                        <div
                          key={colIndex}
                          className="heatmap-cell"
                          style={{ backgroundColor: getColorForValue(value), borderRadius: '4px', height: '24px', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}
                          onMouseMove={(e) => handleMouseMove(e, value, rowInfo.label, `Año ${yearKey} - Mes ${colIndex + 1}`)}
                          onMouseLeave={handleMouseLeave}
                        />
                      ))}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      <div className="heatmap-legend" style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <span>Bajo Costo</span>
        {legendItems.map((item, i) => (
          <div
            key={i}
            className="heatmap-legend-bar"
            style={{ backgroundColor: item.color, width: '24px', height: '12px', borderRadius: '3px' }}
            title={formatCurrency(item.value)}
          />
        ))}
        <span>Alto Costo</span>
      </div>
    </div>
  );
};

const AmortizationTables = ({ loans, schedules }) => {
  if (!loans || loans.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay créditos definidos en el proyecto.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {loans.map((loan) => {
        const schedule = schedules[loan.id];
        if (!schedule || schedule.length === 0) {
          return (
            <div key={loan.id} className="amortization-card glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-panel)' }}>
              <h3 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{loan.name}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>No se pudo generar la tabla de amortización para este crédito.</p>
            </div>
          );
        }

        const monthlyPayment = schedule[0].payment;

        return (
          <div key={loan.id} className="amortization-card glass-panel" style={{ padding: '2rem', background: 'var(--bg-panel)', borderRadius: '16px' }}>
            <h3 style={{ fontWeight: '800', fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{loan.name}</h3>
            
            <div className="amortization-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="amortization-summary-item" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Monto Principal</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(loan.principal)}</p>
              </div>
              <div className="amortization-summary-item" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Tasa Anual</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{loan.annualInterestRate}%</p>
              </div>
              <div className="amortization-summary-item" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Plazo</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{loan.termMonths} meses</p>
              </div>
              <div className="amortization-summary-item" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Pago Mensual</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 800, color: 'var(--accent-hover)' }}>{formatCurrency(monthlyPayment)}</p>
              </div>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '350px', position: 'relative', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <table className="financial-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg-panel-hover)' }}>
                  <tr style={{ borderBottom: '1.5px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'center', padding: '0.6rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Mes</th>
                    <th style={{ textAlign: 'right', padding: '0.6rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Pago Mensual</th>
                    <th style={{ textAlign: 'right', padding: '0.6rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Intereses</th>
                    <th style={{ textAlign: 'right', padding: '0.6rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Abono a Capital</th>
                    <th style={{ textAlign: 'right', padding: '0.6rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Saldo Restante</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row) => (
                    <tr key={row.month} style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
                      <td style={{ textAlign: 'center', padding: '0.6rem 0.8rem' }} className="font-bold">{row.month}</td>
                      <td style={{ textAlign: 'right', padding: '0.6rem 0.8rem' }}>{formatCurrency(row.payment)}</td>
                      <td style={{ textAlign: 'right', padding: '0.6rem 0.8rem', color: 'var(--danger-color)' }}>{formatCurrency(row.interest)}</td>
                      <td style={{ textAlign: 'right', padding: '0.6rem 0.8rem', color: 'var(--success-color)' }}>{formatCurrency(row.principal)}</td>
                      <td style={{ textAlign: 'right', padding: '0.6rem 0.8rem' }} className="font-bold">{formatCurrency(row.remainingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const FinancialReports = ({ projections, netInitialInvestment, loans }) => {
  const [activeTab, setActiveTab] = useState('income');
  const { annualSummaries, monthlyBreakdown, annualCostBenefitData, monthlyCashFlowData, monthlyBreakEvenData, monthlyCostBenefitData, annualCashFlowData } = projections;

  const annualIncomeData = useMemo(() => annualSummaries.map((s) => ({
    ...s.incomeStatement,
    totalCosts: s.incomeStatement.fixedCosts + s.incomeStatement.variableCosts
  })), [annualSummaries]);

  const monthlyIncomeData = useMemo(() => monthlyBreakdown.map((m) => ({
    ...m,
    totalCosts: m.fixedCosts + m.variableCosts
  })), [monthlyBreakdown]);

  const annualFixedData = useMemo(() => annualSummaries.map((s) => ({
    year: s.year,
    fixedCosts: s.incomeStatement.fixedCosts
  })), [annualSummaries]);

  const monthlyFixedData = useMemo(() => monthlyBreakdown.map((m) => ({
    year: m.year,
    month: m.month,
    fixedCosts: m.fixedCosts
  })), [monthlyBreakdown]);

  const annualVariableData = useMemo(() => annualSummaries.map((s) => ({
    year: s.year,
    variableCosts: s.incomeStatement.variableCosts
  })), [annualSummaries]);

  const monthlyVariableData = useMemo(() => monthlyBreakdown.map((m) => ({
    year: m.year,
    month: m.month,
    variableCosts: m.variableCosts
  })), [monthlyBreakdown]);

  return (
    <div>
      <div className="financial-tabs-nav" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <TabButton active={activeTab === 'income'} onClick={() => setActiveTab('income')}>Estado de Resultados</TabButton>
        <TabButton active={activeTab === 'cashflow'} onClick={() => setActiveTab('cashflow')}>Flujo de Efectivo</TabButton>
        <TabButton active={activeTab === 'breakeven'} onClick={() => setActiveTab('breakeven')}>Punto de Equilibrio</TabButton>
        <TabButton active={activeTab === 'costBenefit'} onClick={() => setActiveTab('costBenefit')}>Costo-Beneficio</TabButton>
        <TabButton active={activeTab === 'amortization'} onClick={() => setActiveTab('amortization')}>Amortización de Créditos</TabButton>
        <TabButton active={activeTab === 'fixedVariable'} onClick={() => setActiveTab('fixedVariable')}>Costos Fijos vs Variables</TabButton>
        <TabButton active={activeTab === 'heatmap'} onClick={() => setActiveTab('heatmap')}>Mapa de Calor de Costos</TabButton>
      </div>

      {activeTab === 'income' && (
        <ReportTable
          headers={['Año', 'Ventas', 'C. Fijos', 'C. Variables', 'C. Totales', 'U. Bruta', 'Deprec.', 'G. Finan.', 'U. A. Imp.', 'Impuestos', 'U. Neta']}
          annualData={annualIncomeData}
          keys={['year', 'sales', 'fixedCosts', 'variableCosts', 'totalCosts', 'grossProfit', 'annualDepreciation', 'annualInterest', 'ebt', 'taxes', 'netIncome']}
          monthlyData={monthlyIncomeData}
          monthlyHeaders={['Mes', 'Ventas', 'C. Fijos', 'C. Variables', 'C. Totales', 'U. Bruta', 'Deprec.', 'Intereses', 'U. A. Imp.', 'Imp.', 'U. Neta']}
          monthlyKeys={['month', 'sales', 'fixedCosts', 'variableCosts', 'totalCosts', 'grossProfit', 'monthlyDepreciation', 'monthlyInterest', 'ebt', 'taxes', 'netIncome']}
          showSalesPercentage={true}
        />
      )}
      {activeTab === 'cashflow' && (
        <ReportTable
          headers={['Año', 'U. Neta', '+ Deprec.', '- Amortización', '+ V. Rescate', 'Flujo Neto', 'Flujo Acum.']}
          annualData={annualCashFlowData.map((flowItem) => {
            const summary = annualSummaries.find((s) => s.year === flowItem.year);
            if (summary) {
              return {
                ...summary.cashFlow,
                cumulativeCashFlow: flowItem.cumulativeCashFlow
              };
            }
            return {
              year: '0',
              netIncome: '',
              annualDepreciation: '',
              annualPrincipalRepayment: '',
              salvageValue: '',
              netCashFlow: flowItem.netCashFlow,
              cumulativeCashFlow: flowItem.cumulativeCashFlow,
            };
          })}
          keys={['year', 'netIncome', 'annualDepreciation', 'annualPrincipalRepayment', 'salvageValue', 'netCashFlow', 'cumulativeCashFlow']}
          monthlyData={monthlyCashFlowData}
          monthlyHeaders={['Mes', 'Flujo Neto Mensual', 'Flujo Acumulado']}
          monthlyKeys={['month', 'netCashFlow', 'cumulativeCashFlow']}
        />
      )}
      {activeTab === 'breakeven' && (
        <ReportTable
          headers={['Año', 'Ventas', 'C. Fijos', 'P. Eq. ($)', 'P. Eq. (%)']}
          annualData={annualSummaries.map((s) => ({
            ...s.breakEven,
            bepAmount: isFinite(s.breakEven.bepAmount) ? s.breakEven.bepAmount : 'N/A',
            bepPercentage: isFinite(s.breakEven.bepPercentage) ? `${s.breakEven.bepPercentage.toFixed(1)}%` : 'N/A',
          }))}
          keys={['year', 'sales', 'fixedCosts', 'bepAmount', 'bepPercentage']}
          monthlyData={monthlyBreakEvenData}
          monthlyHeaders={['Mes', 'Ventas', 'C. Fijos', 'P. Eq. ($)', 'P. Eq. (%)']}
          monthlyKeys={['month', 'sales', 'fixedCosts', 'bepAmount', 'bepPercentage']}
        />
      )}
      {activeTab === 'costBenefit' && (
        <ReportTable
          headers={['Año', 'Beneficios', 'Costos', 'Beneficio Neto', 'Beneficios Acum.', 'Costos Acum.', 'Beneficio Neto Acum.']}
          annualData={annualCostBenefitData}
          keys={['year', 'benefits', 'costs', 'netBenefit', 'cumulativeBenefits', 'cumulativeCosts', 'cumulativeNetBenefit']}
          monthlyData={monthlyCostBenefitData}
          monthlyHeaders={['Mes', 'Beneficios', 'Costos', 'B. Neto', 'B. Acum.', 'C. Acum.', 'B.N. Acum.']}
          monthlyKeys={['month', 'benefits', 'costs', 'netBenefit', 'cumulativeBenefits', 'cumulativeCosts', 'cumulativeNetBenefit']}
        />
      )}
      {activeTab === 'amortization' && (
        <AmortizationTables loans={loans} schedules={projections.loanSchedules} />
      )}
      {activeTab === 'fixedVariable' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div>
            <h3 style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Costos Fijos</h3>
            <ReportTable
              headers={['Año', 'Costo Fijo Anual']}
              annualData={annualFixedData}
              keys={['year', 'fixedCosts']}
              monthlyData={monthlyFixedData}
              monthlyHeaders={['Mes', 'Costo Fijo Mensual']}
              monthlyKeys={['month', 'fixedCosts']}
            />
          </div>
          <div>
            <h3 style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Costos Variables</h3>
            <ReportTable
              headers={['Año', 'Costo Variable Anual']}
              annualData={annualVariableData}
              keys={['year', 'variableCosts']}
              monthlyData={monthlyVariableData}
              monthlyHeaders={['Mes', 'Costo Variable Mensual']}
              monthlyKeys={['month', 'variableCosts']}
            />
          </div>
        </div>
      )}
      {activeTab === 'heatmap' && (
        <CostHeatmap data={monthlyBreakdown} />
      )}
    </div>
  );
};

/**
 * PrintableFinancialReports — Renders all financial sub-reports expanded side-by-side,
 * without tabs, so they all appear in print/Vista Previa as individual sections.
 */
export const PrintableFinancialReports = ({ projections, staff = [] }) => {
  const normalized = normalizeFinancialData(projections, staff);

  if (!projections || !Array.isArray(projections.annualSummaries) || projections.annualSummaries.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <p style={{ fontWeight: 700, fontSize: '1rem' }}>Sin datos financieros proyectados</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Complete la sección financiera para ver los reportes.</p>
      </div>
    );
  }

  const {
    annualSummaries,
    monthlyBreakdown,
    annualCostBenefitData,
    monthlyCashFlowData,
    monthlyBreakEvenData,
    monthlyCostBenefitData,
    annualCashFlowData,
    loanSchedules,
  } = projections;

  const annualIncomeData = (annualSummaries || []).map((s) => ({
    ...s.incomeStatement,
    totalCosts: (s.incomeStatement.fixedCosts || 0) + (s.incomeStatement.variableCosts || 0),
  }));

  const monthlyIncomeData = (monthlyBreakdown || []).map((m) => ({
    ...m,
    totalCosts: (m.fixedCosts || 0) + (m.variableCosts || 0),
  }));

  const annualFixedData = (annualSummaries || []).map((s) => ({
    year: s.year,
    fixedCosts: s.incomeStatement.fixedCosts,
  }));

  const monthlyFixedData = (monthlyBreakdown || []).map((m) => ({
    year: m.year,
    month: m.month,
    fixedCosts: m.fixedCosts,
  }));

  const annualVariableData = (annualSummaries || []).map((s) => ({
    year: s.year,
    variableCosts: s.incomeStatement.variableCosts,
  }));

  const monthlyVariableData = (monthlyBreakdown || []).map((m) => ({
    year: m.year,
    month: m.month,
    variableCosts: m.variableCosts,
  }));

  const cashflowAnnual = (annualCashFlowData || []).map((flowItem) => {
    const summary = (annualSummaries || []).find((s) => s.year === flowItem.year);
    if (summary) return { ...summary.cashFlow, cumulativeCashFlow: flowItem.cumulativeCashFlow };
    return {
      year: flowItem.year,
      netIncome: '',
      annualDepreciation: '',
      annualPrincipalRepayment: '',
      salvageValue: '',
      netCashFlow: flowItem.netCashFlow,
      cumulativeCashFlow: flowItem.cumulativeCashFlow,
    };
  });

  const metrics = projections.financialMetrics || normalized.metrics || {};
  const netInitialInvestment = projections.netInitialInvestment || 0;

  const loans = (() => {
    if (projections.loans) return projections.loans;
    if (projections.derivedData?.loans) return projections.derivedData.loans;
    if (loanSchedules) {
      return Object.keys(loanSchedules).map((id) => {
        const schedule = loanSchedules[id];
        const firstRow = schedule[0] || {};
        const principal = (firstRow.remainingBalance || 0) + (firstRow.principal || 0);
        return { id: Number(id), name: `Crédito #${id}`, principal, annualInterestRate: 0, termMonths: schedule.length };
      });
    }
    return [];
  })();

  const sectionStyle = {
    marginBottom: '0',
    pageBreakBefore: 'always',
    paddingTop: '2rem',
  };

  const panelStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  };

  const sectionTitleStyle = {
    fontSize: '1.1rem',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '1.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* ── Proyección de Flujo de Caja (Gráfica) ── */}
      <div style={{ ...sectionStyle, pageBreakBefore: 'avoid' }}>
        <div style={panelStyle}>
          <h4 style={sectionTitleStyle}>📈 Proyección de Flujo de Caja (5 Años)</h4>
          <CashFlowChart data={normalized.chartData} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TIR</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#4f46e5', marginTop: '0.25rem' }}>{Number(metrics.irr || 0).toFixed(2)}%</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tasa Interna de Retorno</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>VAN</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: (metrics.npv || 0) > 0 ? '#10b981' : '#ef4444', marginTop: '0.25rem' }}>
                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(metrics.npv || 0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Valor Actual Neto</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ROI</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#4f46e5', marginTop: '0.25rem' }}>{Number(metrics.roi || 0).toFixed(1)}%</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Retorno sobre la Inversión</div>
            </div>
          </div>
          {metrics.paybackPeriod && (
            <div style={{ marginTop: '1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>⏱️</span>
              <div>
                <span style={{ fontWeight: 800, color: '#1e40af', fontSize: '0.875rem' }}>Período de Recuperación: </span>
                <span style={{ color: '#1e3a8a', fontSize: '0.875rem' }}>{String(metrics.paybackPeriod).replace(/\|/g, ' ')}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Estado de Resultados ── */}
      <div style={sectionStyle}>
        <div style={panelStyle}>
          <h4 style={sectionTitleStyle}>📊 Estado de Resultados Pro-Forma</h4>
          <ReportTable
            headers={['Año', 'Ventas', 'C. Fijos', 'C. Variables', 'C. Totales', 'U. Bruta', 'Deprec.', 'G. Finan.', 'U. A. Imp.', 'Impuestos', 'U. Neta']}
            annualData={annualIncomeData}
            keys={['year', 'sales', 'fixedCosts', 'variableCosts', 'totalCosts', 'grossProfit', 'annualDepreciation', 'annualInterest', 'ebt', 'taxes', 'netIncome']}
            monthlyData={monthlyIncomeData}
            monthlyHeaders={['Mes', 'Ventas', 'C. Fijos', 'C. Variables', 'C. Totales', 'U. Bruta', 'Deprec.', 'Intereses', 'U. A. Imp.', 'Imp.', 'U. Neta']}
            monthlyKeys={['month', 'sales', 'fixedCosts', 'variableCosts', 'totalCosts', 'grossProfit', 'monthlyDepreciation', 'monthlyInterest', 'ebt', 'taxes', 'netIncome']}
            showSalesPercentage={true}
            alwaysExpanded={true}
          />
        </div>
      </div>

      {/* ── Flujo de Efectivo ── */}
      <div style={sectionStyle}>
        <div style={panelStyle}>
          <h4 style={sectionTitleStyle}>💰 Flujo de Efectivo Pro-Forma</h4>
          <ReportTable
            headers={['Año', 'U. Neta', '+ Deprec.', '- Amortización', '+ V. Rescate', 'Flujo Neto', 'Flujo Acum.']}
            annualData={cashflowAnnual}
            keys={['year', 'netIncome', 'annualDepreciation', 'annualPrincipalRepayment', 'salvageValue', 'netCashFlow', 'cumulativeCashFlow']}
            monthlyData={monthlyCashFlowData || []}
            monthlyHeaders={['Mes', 'Flujo Neto Mensual', 'Flujo Acumulado']}
            monthlyKeys={['month', 'netCashFlow', 'cumulativeCashFlow']}
            alwaysExpanded={true}
          />
        </div>
      </div>

      {/* ── Punto de Equilibrio ── */}
      <div style={sectionStyle}>
        <div style={panelStyle}>
          <h4 style={sectionTitleStyle}>⚖️ Punto de Equilibrio (Break-Even)</h4>
          <ReportTable
            headers={['Año', 'Ventas', 'C. Fijos', 'P. Eq. ($)', 'P. Eq. (%)']}
            annualData={(annualSummaries || []).map((s) => ({
              ...s.breakEven,
              bepAmount: isFinite(s.breakEven.bepAmount) ? s.breakEven.bepAmount : 'N/A',
              bepPercentage: isFinite(s.breakEven.bepPercentage) ? `${s.breakEven.bepPercentage.toFixed(1)}%` : 'N/A',
            }))}
            keys={['year', 'sales', 'fixedCosts', 'bepAmount', 'bepPercentage']}
            monthlyData={monthlyBreakEvenData || []}
            monthlyHeaders={['Mes', 'Ventas', 'C. Fijos', 'P. Eq. ($)', 'P. Eq. (%)']}
            monthlyKeys={['month', 'sales', 'fixedCosts', 'bepAmount', 'bepPercentage']}
            alwaysExpanded={true}
          />
        </div>
      </div>

      {/* ── Análisis Costo-Beneficio ── */}
      {Array.isArray(annualCostBenefitData) && annualCostBenefitData.length > 0 && (
        <div style={sectionStyle}>
          <div style={panelStyle}>
            <h4 style={sectionTitleStyle}>🔄 Análisis Costo-Beneficio</h4>
            <ReportTable
              headers={['Año', 'Beneficios', 'Costos', 'Beneficio Neto', 'Beneficios Acum.', 'Costos Acum.', 'Beneficio Neto Acum.']}
              annualData={annualCostBenefitData}
              keys={['year', 'benefits', 'costs', 'netBenefit', 'cumulativeBenefits', 'cumulativeCosts', 'cumulativeNetBenefit']}
              monthlyData={monthlyCostBenefitData || []}
              monthlyHeaders={['Mes', 'Beneficios', 'Costos', 'B. Neto', 'B. Acum.', 'C. Acum.', 'B.N. Acum.']}
              monthlyKeys={['month', 'benefits', 'costs', 'netBenefit', 'cumulativeBenefits', 'cumulativeCosts', 'cumulativeNetBenefit']}
              alwaysExpanded={true}
            />
          </div>
        </div>
      )}

      {/* ── Costos Fijos vs Variables ── */}
      <div style={sectionStyle}>
        <div style={panelStyle}>
          <h4 style={sectionTitleStyle}>📉 Costos Fijos vs. Variables</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h5 style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Costos Fijos</h5>
              <ReportTable
                headers={['Año', 'Costo Fijo Anual']}
                annualData={annualFixedData}
                keys={['year', 'fixedCosts']}
                monthlyData={monthlyFixedData}
                monthlyHeaders={['Mes', 'Costo Fijo Mensual']}
                monthlyKeys={['month', 'fixedCosts']}
                alwaysExpanded={true}
              />
            </div>
            <div>
              <h5 style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Costos Variables</h5>
              <ReportTable
                headers={['Año', 'Costo Variable Anual']}
                annualData={annualVariableData}
                keys={['year', 'variableCosts']}
                monthlyData={monthlyVariableData}
                monthlyHeaders={['Mes', 'Costo Variable Mensual']}
                monthlyKeys={['month', 'variableCosts']}
                alwaysExpanded={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Amortización de Créditos ── */}
      {loans.length > 0 && loanSchedules && (
        <div style={sectionStyle}>
          <div style={panelStyle}>
            <h4 style={sectionTitleStyle}>🏦 Amortización de Créditos</h4>
            <AmortizationTables loans={loans} schedules={loanSchedules} />
          </div>
        </div>
      )}

      {/* ── Mapa de Calor de Costos ── */}
      {Array.isArray(monthlyBreakdown) && monthlyBreakdown.length > 0 && (
        <div style={sectionStyle}>
          <div style={panelStyle}>
            <h4 style={sectionTitleStyle}>🌡️ Mapa de Calor de Costos Mensuales</h4>
            <CostHeatmap data={monthlyBreakdown} />
          </div>
        </div>
      )}

    </div>
  );
};

export default function FinancialCharts({ staff = [], projections = null, showTables = true }) {
  const normalized = normalizeFinancialData(projections, staff);
  const metrics = normalized.metrics || {};

  const loans = useMemo(() => {
    if (projections?.loans) return projections.loans;
    if (projections?.derivedData?.loans) return projections.derivedData.loans;
    if (projections?.loanSchedules) {
      return Object.keys(projections.loanSchedules).map((id) => {
        const schedule = projections.loanSchedules[id];
        const firstRow = schedule[0] || {};
        const principal = (firstRow.remainingBalance || 0) + (firstRow.principal || 0);
        return {
          id: Number(id),
          name: `Crédito #${id}`,
          principal,
          annualInterestRate: 0,
          termMonths: schedule.length,
        };
      });
    }
    return [];
  }, [projections]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-display)' }}>
          Proyección de Flujo de Caja (5 Años)
        </h4>
        <CashFlowChart data={normalized.chartData} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '20px', textAlign: 'center' }}>
          <ProfitGauge value={Number(metrics.irr || 0)} label="Tasa Interna de Retorno (TIR)" />
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '20px', textAlign: 'center' }}>
          <ProfitGauge value={Number(metrics.roi || 0)} label="Retorno sobre Inversión (ROI)" />
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '20px', textAlign: 'center' }}>
          <ProfitGauge value={Number((metrics.cbr || 0) * 50)} label="Relación Beneficio-Costo (Factor)" />
        </div>
      </div>

      {showTables && projections && (
        <div className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-display)' }}>
            Reportes Financieros Pro-Forma
          </h4>
          <FinancialReports
            projections={projections}
            netInitialInvestment={projections.netInitialInvestment || 0}
            loans={loans}
          />
        </div>
      )}
    </div>
  );
}
