import { useState, useMemo, useEffect } from 'react';
import { runMonteCarloSimulation } from '../lib/finanzas/montecarlo';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Coins, 
  HelpCircle, 
  Sliders, 
  BarChart4, 
  Download 
} from 'lucide-react';

const formatCurrency = (value) => 
  new Intl.NumberFormat('es-MX', { 
    style: 'currency', 
    currency: 'MXN', 
    maximumFractionDigits: 0 
  }).format(Number(value || 0));

export default function MonteCarloSimulator({ 
  initialInvestment = 150000, 
  baseRevenue = 500000, 
  baseCost = 350000, 
  wacc = 12,
  onExport 
}) {
  // Parámetros de simulación controlados por sliders
  const [simCapex, setSimCapex] = useState(initialInvestment);
  const [simRevenue, setSimRevenue] = useState(baseRevenue);
  const [simCost, setSimCost] = useState(baseCost);
  const [simWacc, setSimWacc] = useState(wacc);
  const [revenueVol, setRevenueVol] = useState(15); // Volatilidad % de ventas
  const [costVol, setCostVol] = useState(15);       // Volatilidad % de costos
  const [iterations, setIterations] = useState(5000);
  const [years, setYears] = useState(5);

  // Efecto para sincronizar cuando cambian las props iniciales
  useEffect(() => {
    setSimCapex(initialInvestment);
    setSimRevenue(baseRevenue);
    setSimCost(baseCost);
    setSimWacc(wacc);
  }, [initialInvestment, baseRevenue, baseCost, wacc]);

  // Ejecutamos la simulación reactivamente cada vez que cambian los parámetros
  const simulationResults = useMemo(() => {
    return runMonteCarloSimulation(
      simRevenue,
      simCost,
      simWacc,
      simCapex,
      years,
      iterations,
      revenueVol,
      costVol
    );
  }, [simRevenue, simCost, simWacc, simCapex, years, iterations, revenueVol, costVol]);

  const [hoveredBin, setHoveredBin] = useState(null);
  const [hoveredTrajectoryYear, setHoveredTrajectoryYear] = useState(null);

  // Manejo de exportación
  const handleExport = () => {
    if (onExport && simulationResults) {
      onExport(simulationResults);
    }
  };

  // Dimensiones de Gráfica 1 (Histograma)
  const histWidth = 600;
  const histHeight = 250;
  const histPadding = 40;
  const plotWidth = histWidth - histPadding * 2;
  const plotHeight = histHeight - histPadding * 2;

  const histogramData = simulationResults?.histogram || [];
  const maxBinCount = Math.max(...histogramData.map(b => b.count), 1);

  // Encontrar el bin más cercano al $0.00
  const _zeroIndex = useMemo(() => {
    let closestIndex = 0;
    let minDiff = Infinity;
    histogramData.forEach((b, idx) => {
      const diff = Math.abs(b.midPoint);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
    return closestIndex;
  }, [histogramData]);

  // Coordenada X del cero en el histograma
  const zeroX = useMemo(() => {
    if (histogramData.length === 0) return histPadding;
    const minVal = simulationResults?.minNPV || 0;
    const maxVal = simulationResults?.maxNPV || 0;
    const totalRange = maxVal - minVal || 1;
    const fraction = (0 - minVal) / totalRange;
    return histPadding + Math.max(0, Math.min(1, fraction)) * plotWidth;
  }, [simulationResults, histogramData, plotWidth]);

  // Coordenada X del Promedio
  const avgX = useMemo(() => {
    if (histogramData.length === 0) return histPadding;
    const minVal = simulationResults?.minNPV || 0;
    const maxVal = simulationResults?.maxNPV || 0;
    const avgVal = simulationResults?.averageNPV || 0;
    const totalRange = maxVal - minVal || 1;
    const fraction = (avgVal - minVal) / totalRange;
    return histPadding + Math.max(0, Math.min(1, fraction)) * plotWidth;
  }, [simulationResults, histogramData, plotWidth]);

  // Dimensiones de Gráfica 2 (Curvas)
  const trWidth = 600;
  const trHeight = 250;
  const trPadding = 45;
  const trPlotWidth = trWidth - trPadding * 2;
  const trPlotHeight = trHeight - trPadding * 2;

  const trajectories = simulationResults?.trajectories || [];

  // Mínimo y Máximo de los flujos de trayectoria para la escala Y
  const { trMinVal, trMaxVal } = useMemo(() => {
    if (trajectories.length === 0) return { trMinVal: -50000, trMaxVal: 100000 };
    const allVals = trajectories.flatMap(t => [t.p10, t.p50, t.p90]);
    const minV = Math.min(...allVals, -simCapex) * 1.15;
    const maxV = Math.max(...allVals, 0) * 1.15;
    return { trMinVal: minV, trMaxVal: maxV };
  }, [trajectories, simCapex]);

  const trRangeY = trMaxVal - trMinVal || 1;

  const getTrX = (idx) => {
    if (trajectories.length <= 1) return trPadding;
    return trPadding + (idx / (trajectories.length - 1)) * trPlotWidth;
  };

  const getTrY = (val) => {
    return trHeight - trPadding - ((val - trMinVal) / trRangeY) * trPlotHeight;
  };

  // Path del área rellena (Cono de Incertidumbre entre P10 y P90)
  const conePath = useMemo(() => {
    if (trajectories.length === 0) return '';
    const topPoints = trajectories.map((t, idx) => `${getTrX(idx)},${getTrY(t.p90)}`);
    const bottomPoints = [...trajectories].reverse().map((t, idx) => {
      const origIdx = trajectories.length - 1 - idx;
      return `${getTrX(origIdx)},${getTrY(t.p10)}`;
    });
    return `M ${topPoints.join(' L ')} L ${bottomPoints.join(' L ')} Z`;
  }, [trajectories, trMinVal, trMaxVal]);

  const p90Line = trajectories.map((t, idx) => `${getTrX(idx)},${getTrY(t.p90)}`).join(' ');
  const p50Line = trajectories.map((t, idx) => `${getTrX(idx)},${getTrY(t.p50)}`).join(' ');
  const p10Line = trajectories.map((t, idx) => `${getTrX(idx)},${getTrY(t.p10)}`).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Sección de KPI e Introducción */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', margin: '0 0 0.35rem 0' }}>
              <TrendingUp className="w-5 h-5 text-accent" />
              Simulador Estocástico y Análisis de Riesgo Monte Carlo
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Modela el riesgo de tu plan financiero variando la volatilidad esperada. Ejecuta miles de escenarios de forma aleatoria para medir la probabilidad real de rentabilidad.
            </p>
          </div>
          <button 
            onClick={handleExport} 
            className="btn btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 1rem', 
              fontSize: '0.8rem',
              fontWeight: 700
            }}
          >
            <Download size={14} />
            Exportar Resultados al Plan
          </button>
        </div>
      </div>

      {/* Grid de Sliders y Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Panel de Controles / Sliders */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', margin: '0 0 1.5rem 0', fontWeight: '800' }}>
            <Sliders size={18} className="text-accent" />
            Parámetros del Escenario de Incertidumbre
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {/* CAPEX */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 600 }}>Inversión Inicial (CAPEX)</span>
                <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{formatCurrency(simCapex)}</span>
              </div>
              <input 
                type="range" 
                min={Math.max(10000, Math.round(initialInvestment * 0.4))}
                max={Math.round(initialInvestment * 2)}
                step="5000"
                value={simCapex} 
                onChange={(e) => setSimCapex(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Ingresos Año 1 */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 600 }}>Ingresos Anuales Base</span>
                <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{formatCurrency(simRevenue)}</span>
              </div>
              <input 
                type="range" 
                min={Math.max(20000, Math.round(baseRevenue * 0.4))}
                max={Math.round(baseRevenue * 2)}
                step="10000"
                value={simRevenue} 
                onChange={(e) => setSimRevenue(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Costos Año 1 */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 600 }}>Costos Anuales Base</span>
                <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{formatCurrency(simCost)}</span>
              </div>
              <input 
                type="range" 
                min={Math.max(10000, Math.round(baseCost * 0.4))}
                max={Math.round(baseCost * 2)}
                step="10000"
                value={simCost} 
                onChange={(e) => setSimCost(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* WACC */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 600 }}>Tasa de Descuento (WACC)</span>
                <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{simWacc.toFixed(1)}%</span>
              </div>
              <input 
                type="range" 
                min="3" 
                max="25" 
                step="0.5"
                value={simWacc} 
                onChange={(e) => setSimWacc(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Volatilidad Ingresos */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  Incertidumbre en Ventas
                  <HelpCircle size={12} title="Porcentaje de variación de las ventas reales respecto al pronóstico" style={{ cursor: 'help', color: 'var(--text-secondary)' }} />
                </span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>{revenueVol}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50" 
                step="1"
                value={revenueVol} 
                onChange={(e) => setRevenueVol(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Volatilidad Costos */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  Incertidumbre en Costos
                  <HelpCircle size={12} title="Porcentaje de variación de los costos operativos mensuales" style={{ cursor: 'help', color: 'var(--text-secondary)' }} />
                </span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>{costVol}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50" 
                step="1"
                value={costVol} 
                onChange={(e) => setCostVol(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Configuración de Iteraciones */}
          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '4px' }}>Horizonte temporal</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[3, 5, 7, 10].map(y => (
                    <button 
                      key={y}
                      onClick={() => setYears(y)}
                      className={`btn ${years === y ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', minWidth: '40px' }}
                    >
                      {y} Años
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '4px' }}>Iteraciones aleatorias</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1000, 5000, 10000].map(iter => (
                    <button 
                      key={iter}
                      onClick={() => setIterations(iter)}
                      className={`btn ${iterations === iter ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', minWidth: '60px' }}
                    >
                      {iter.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Ejecuciones estocásticas en tiempo real utilizando la transformación Gaussiana de Box-Muller.
            </div>
          </div>
        </div>

        {/* Panel de Estadísticas del Escenario */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          
          {/* Tarjeta 1: Probabilidad Éxito */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: `4px solid ${simulationResults?.successProbability >= 75 ? 'var(--success-color)' : (simulationResults?.successProbability >= 50 ? '#f59e0b' : '#ef4444')}` }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Probabilidad de Viabilidad (VAN &gt; 0)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '0.35rem', color: simulationResults?.successProbability >= 75 ? 'var(--success-color)' : (simulationResults?.successProbability >= 50 ? '#fbbf24' : '#ef4444') }}>
              {simulationResults?.successProbability}%
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              De {iterations.toLocaleString()} escenarios simulados, {Math.round(iterations * (simulationResults?.successProbability / 100)).toLocaleString()} tuvieron rendimiento positivo.
            </div>
          </div>

          {/* Tarjeta 2: VAN Promedio */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>VAN Promedio Esperado</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.35rem', color: (simulationResults?.averageNPV || 0) >= 0 ? 'var(--success-color)' : '#ef4444' }}>
              {formatCurrency(simulationResults?.averageNPV)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              El Valor Actual Neto promedio descontando los flujos a una tasa del {simWacc}%.
            </div>
          </div>

          {/* Tarjeta 3: Escenarios de VAN */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Escenario P10 vs P90 (VAN)</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Optimista (P90):</span>
                <span style={{ color: 'var(--success-color)' }}>{formatCurrency(simulationResults?.percentiles?.p90)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Pesimista (P10):</span>
                <span style={{ color: '#ef4444' }}>{formatCurrency(simulationResults?.percentiles?.p10)}</span>
              </div>
            </div>
          </div>

          {/* Tarjeta 4: Desviación Estándar */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Volatilidad del VAN / Riesgo</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.35rem' }}>
              {formatCurrency(simulationResults?.stdDevNPV)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Desviación estándar del VAN. A menor valor, mayor certidumbre de los resultados.
            </div>
          </div>
        </div>

        {/* Panel de Conclusiones IA */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-color)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(99, 102, 241, 0.03)' }}>
          {simulationResults?.successProbability >= 75 ? (
            <CheckCircle className="w-8 h-8 text-success" style={{ flexShrink: 0 }} />
          ) : (
            <AlertTriangle className="w-8 h-8" style={{ color: simulationResults?.successProbability >= 50 ? '#f59e0b' : '#ef4444', flexShrink: 0 }} />
          )}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-color)', marginBottom: '2px' }}>Análisis Técnico de Viabilidad</div>
            <div style={{ fontSize: '0.85rem', lineHeight: '1.4', fontWeight: 500 }}>
              {simulationResults?.conclusion}
            </div>
          </div>
        </div>

        {/* Sección de los 2 Gráficos SVG */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          {/* Gráfico 1: Histograma */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', margin: '0 0 1rem 0', fontWeight: '800' }}>
              <BarChart4 size={16} className="text-accent" />
              Distribución de Frecuencia del VAN
            </h4>
            
            <div style={{ position: 'relative', width: '100%', height: histHeight, flexGrow: 1 }}>
              <svg 
                viewBox={`0 0 ${histWidth} ${histHeight}`} 
                style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid var(--border-color)' }}
              >
                <defs>
                  {/* Gradientes para barras */}
                  <linearGradient id="positiveBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="negativeBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#e11d48" />
                  </linearGradient>
                  {/* Sombra para línea de Promedio */}
                  <filter id="glowAvg" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#818cf8" floodOpacity="0.8" />
                  </filter>
                </defs>

                {/* Gridlines Horizontales */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                  const y = histPadding + plotHeight * (1 - p);
                  const countLabel = Math.round(maxBinCount * p);
                  return (
                    <g key={i}>
                      <line x1={histPadding} y1={y} x2={histWidth - histPadding} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                      <text x={histPadding - 8} y={y + 4} fill="rgba(255,255,255,0.35)" fontSize="9" fontWeight="600" textAnchor="end">
                        {countLabel}
                      </text>
                    </g>
                  );
                })}

                {/* Renderizar Barras del Histograma */}
                {histogramData.map((bin, index) => {
                  const binWidthPct = plotWidth / histogramData.length;
                  const barX = histPadding + index * binWidthPct + 1;
                  const barW = Math.max(1, binWidthPct - 2);
                  const barH = (bin.count / maxBinCount) * plotHeight;
                  const barY = histPadding + plotHeight - barH;
                  const isHovered = hoveredBin === index;

                  return (
                    <g 
                      key={index} 
                      onMouseEnter={() => setHoveredBin(index)}
                      onMouseLeave={() => setHoveredBin(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect 
                        x={barX}
                        y={barY}
                        width={barW}
                        height={barH}
                        fill={bin.isPositive ? 'url(#positiveBar)' : 'url(#negativeBar)'}
                        opacity={isHovered ? 1 : 0.75}
                        rx="2"
                        style={{ transition: 'all 0.15s' }}
                      />
                    </g>
                  );
                })}

                {/* Línea de VAN $0 */}
                <line 
                  x1={zeroX} 
                  y1={histPadding} 
                  x2={zeroX} 
                  y2={histHeight - histPadding} 
                  stroke="#ef4444" 
                  strokeWidth="2.5" 
                  strokeDasharray="4,4" 
                  opacity="0.8" 
                />
                <text x={zeroX + 5} y={histPadding + 15} fill="#ef4444" fontSize="9" fontWeight="700">
                  Umbral $0
                </text>

                {/* Línea de Promedio */}
                <line 
                  x1={avgX} 
                  y1={histPadding} 
                  x2={avgX} 
                  y2={histHeight - histPadding} 
                  stroke="#818cf8" 
                  strokeWidth="3.5" 
                  filter="url(#glowAvg)"
                />
                <circle cx={avgX} cy={histPadding} r="5" fill="#818cf8" />
                <text x={avgX - 5} y={histHeight - histPadding + 14} fill="#818cf8" fontSize="9" fontWeight="800" textAnchor="middle">
                  VAN Prom: {formatCurrency(simulationResults?.averageNPV)}
                </text>
              </svg>

              {/* Tooltip flotante para el histograma */}
              {hoveredBin !== null && histogramData[hoveredBin] && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    pointerEvents: 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    zIndex: 10
                  }}
                >
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: 600 }}>Rango Central de VAN:</div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.88rem', color: histogramData[hoveredBin].isPositive ? 'var(--success-color)' : '#ef4444' }}>
                    {formatCurrency(histogramData[hoveredBin].midPoint)}
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '0.72rem' }}>
                    Frecuencia: <span style={{ fontWeight: 'bold' }}>{histogramData[hoveredBin].count.toLocaleString()}</span> iteraciones ({((histogramData[hoveredBin].count / iterations) * 100).toFixed(1)}%)
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.72rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '10px', height: '10px', background: 'linear-gradient(180deg, #34d399, #059669)', borderRadius: '2px' }}></div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Escenarios Viables (VAN &gt; 0)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '10px', height: '10px', background: 'linear-gradient(180deg, #f43f5e, #e11d48)', borderRadius: '2px' }}></div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Escenarios No Viables (VAN &lt; 0)</span>
              </div>
            </div>
          </div>

          {/* Gráfico 2: Trayectorias Temporales */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', margin: '0 0 1rem 0', fontWeight: '800' }}>
              <Coins size={16} className="text-accent" />
              Evolución Temporal y Cono de Incertidumbre
            </h4>

            <div style={{ position: 'relative', width: '100%', height: trHeight, flexGrow: 1 }}>
              <svg 
                viewBox={`0 0 ${trWidth} ${trHeight}`}
                style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid var(--border-color)' }}
              >
                <defs>
                  {/* Gradiente para el área del cono de incertidumbre */}
                  <linearGradient id="coneGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.03" />
                  </linearGradient>
                  {/* Sombra para la trayectoria mediana (P50) */}
                  <filter id="glowP50" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.5" />
                  </filter>
                </defs>

                {/* Gridlines Horizontales */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                  const val = trMinVal + trRangeY * p;
                  const y = getTrY(val);
                  return (
                    <g key={i}>
                      <line x1={trPadding} y1={y} x2={trWidth - trPadding} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                      <text x={trPadding - 8} y={y + 4} fill="rgba(255,255,255,0.35)" fontSize="9" fontWeight="600" textAnchor="end">
                        {formatCurrency(val)}
                      </text>
                    </g>
                  );
                })}

                {/* Etiquetas de Eje X (Años) */}
                {trajectories.map((t, idx) => (
                  <text key={idx} x={getTrX(idx)} y={trHeight - trPadding + 18} fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="700" textAnchor="middle">
                    {t.label}
                  </text>
                ))}

                {/* Cono de Incertidumbre Relleno */}
                <path d={conePath} fill="url(#coneGrad)" />

                {/* Línea P90 (Optimista) */}
                <path d={`M ${p90Line}`} fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="2,2" strokeLinecap="round" />

                {/* Línea P10 (Pesimista) */}
                <path d={`M ${p10Line}`} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="2,2" strokeLinecap="round" />

                {/* Línea P50 (Mediana/Moderada) */}
                <path d={`M ${p50Line}`} fill="none" stroke="#6366f1" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glowP50)" />

                {/* Puntos Interactivos */}
                {trajectories.map((t, idx) => (
                  <g 
                    key={idx}
                    onMouseEnter={() => setHoveredTrajectoryYear(idx)}
                    onMouseLeave={() => setHoveredTrajectoryYear(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Punto de apoyo invisible más grande para fácil hover */}
                    <circle cx={getTrX(idx)} cy={getTrY(t.p50)} r="12" fill="transparent" />
                    {/* Círculo visual real */}
                    <circle cx={getTrX(idx)} cy={getTrY(t.p50)} r="6" fill="#4f46e5" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
                    <circle cx={getTrX(idx)} cy={getTrY(t.p50)} r="2.5" fill="#ffffff" />
                  </g>
                ))}
              </svg>

              {/* Tooltip flotante para la trayectoria temporal */}
              {hoveredTrajectoryYear !== null && trajectories[hoveredTrajectoryYear] && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    pointerEvents: 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    zIndex: 10
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '3px' }}>
                    {trajectories[hoveredTrajectoryYear].label} (VAN Descontado Acum.)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>P90 (Optimista):</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--success-color)' }}>{formatCurrency(trajectories[hoveredTrajectoryYear].p90)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>P50 (Moderado):</span>
                      <span style={{ fontWeight: 'bold', color: '#818cf8' }}>{formatCurrency(trajectories[hoveredTrajectoryYear].p50)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>P10 (Pesimista):</span>
                      <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{formatCurrency(trajectories[hoveredTrajectoryYear].p10)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.72rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '20px', height: '2px', borderTop: '2px dashed #10b981' }}></div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Optimista (P90)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '20px', height: '4px', background: '#6366f1', borderRadius: '2px' }}></div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Moderado/Esperado (P50)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '20px', height: '2px', borderTop: '2px dashed #ef4444' }}></div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Pesimista (P10)</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
