import React, { useState, useEffect, useMemo } from 'react';
import { usePlan } from '../context/PlanContext';
import { useParams } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  RefreshCw, 
  Database, 
  Check, 
  AlertCircle, 
  FileText, 
  Sparkles,
  Zap
} from 'lucide-react';

const formatMXN = (value) => 
  new Intl.NumberFormat('es-MX', { 
    style: 'currency', 
    currency: 'MXN', 
    minimumFractionDigits: 2 
  }).format(Number(value || 0));

export default function MacroDashboard({ token }) {
  const { planData, updateSection } = usePlan();
  const { pillarId, moduleId } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [syncStatus, setSyncStatus] = useState({ state: 'idle', message: '' });

  const fetchIndicators = async (activeToken = token) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:3001/api/banxico/indicators?token=${encodeURIComponent(activeToken || '')}`);
      const result = await response.json();
      
      if (result.success || result.isFallback) {
        setData(result);
      } else {
        throw new Error(result.error || 'Error al obtener indicadores macroeconómicos');
      }
    } catch (err) {
      console.error('Error fetching macro indicators:', err);
      setError(err.message || 'Error de conexión con el servidor local.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators(token);
  }, [token]);

  // Sincronizar Inflación y Tasas Financieras con el Plan
  const handleSyncFinancials = () => {
    if (!data) return;
    setSyncStatus({ state: 'loading', message: 'Sincronizando...' });
    
    try {
      const inflacionVal = Number(data.inflacion?.valor || 4.5);
      const tiieVal = Number(data.tiie?.valor || 11.0);
      
      // Actualizar tasa de descuento aproximada (WACC = TIIE + Prima de Riesgo típica del 5%)
      const calculatedWacc = Math.round(tiieVal + 5);
      
      // Persistir en el plan
      updateSection('organizacion', 'costos', 'inflacion_sincronizada', `${inflacionVal}%`);
      updateSection('organizacion', 'estados_financieros', 'inflationRate', inflacionVal);
      updateSection('organizacion', 'estados_financieros', 'discountRate', calculatedWacc);
      
      setSyncStatus({ 
        state: 'success', 
        message: `¡Sincronizado! Inflación del ${inflacionVal}% e interés TIIE ajustado en costos.` 
      });
      
      setTimeout(() => {
        setSyncStatus({ state: 'idle', message: '' });
      }, 4000);
    } catch (err) {
      setSyncStatus({ state: 'error', message: `Fallo al sincronizar: ${err.message}` });
    }
  };

  // Escribir Análisis de Entorno Económico en PESTEL
  const handleWritePestel = () => {
    if (!data) return;
    
    const giro = planData.semilla?.negocio?.giro || 'servicios generales';
    const marca = planData.semilla?.negocio?.nombre_marca || 'nuestro negocio';
    
    const inflacionVal = data.inflacion?.valor;
    const tiieVal = data.tiie?.valor;
    const usdVal = data.tipoCambio?.valor;
    const udisVal = data.udis?.valor;
    
    let analysisText = `### Análisis Macroeconómico del Entorno (Enlace en Vivo SieAPI BANXICO)\n\n`;
    analysisText += `*Análisis del impacto económico actual sobre el modelo de negocio de **${marca}** (${giro}). Actualizado en tiempo real a las condiciones oportunas de mercado.*\n\n`;
    analysisText += `#### 1. Variables Macroeconómicas Clave (Banco de México):\n`;
    analysisText += `- **Inflación Anual (INPC):** **${inflacionVal}%** (Registrada al ${data.inflacion?.fecha})\n`;
    analysisText += `- **Costo del Dinero / Tasa de Interés (TIIE 28d):** **${tiieVal}%** (Registrada al ${data.tiie?.fecha})\n`;
    analysisText += `- **Tipo de Cambio Oficial (USD/MXN FIX):** **$${usdVal} MXN/USD** (Registrado al ${data.tipoCambio?.fecha})\n`;
    analysisText += `- **Unidades de Inversión (UDI):** **$${udisVal} MXN** (Registrado al ${data.udis?.fecha})\n\n`;
    
    analysisText += `#### 2. Evaluación de Impacto y Sensibilidad en el Negocio:\n`;
    
    // Inflación
    if (inflacionVal > 6) {
      analysisText += `- **Riesgo Inflacionario (Alto):** Con una inflación de ${inflacionVal}%, existe presión inflacionaria elevada. El proyecto enfrentará un incremento acelerado en costos de materias primas y nómina. Se requiere aplicar estrategias de indexación de precios de venta o compras consolidadas con proveedores.\n`;
    } else if (inflacionVal > 4.5) {
      analysisText += `- **Presión Inflacionaria (Moderada):** La inflación del ${inflacionVal}% se mantiene ligeramente arriba del rango objetivo. Requiere vigilancia del margen bruto anual ajustando precios de venta en línea con el INPC.\n`;
    } else {
      analysisText += `- **Estabilidad Inflacionaria (Baja/Estable):** La inflación de ${inflacionVal}% favorece la planeación a mediano plazo, reduciendo la volatilidad del costo de adquisición.\n`;
    }
    
    // Tasa de Interés / TIIE
    if (tiieVal > 10) {
      analysisText += `- **Costo del Financiamiento (Elevado):** La tasa TIIE en ${tiieVal}% incrementa significativamente el costo de adquirir deuda o préstamos comerciales. Para **${marca}**, se recomienda priorizar el capital propio de los socios, buscar subsidios o estructurar esquemas de financiamiento a tasa fija y evitar apalancamiento variable en etapas tempranas.\n`;
    } else {
      analysisText += `- **Entorno Financiero Estable:** Las tasas de interés de referencia en un ${tiieVal}% representan un costo crediticio moderado que permite estructurar líneas de financiamiento amortizables de arranque.\n`;
    }
    
    // Tipo de Cambio
    analysisText += `- **Sensibilidad Cambiaria:** La cotización de $${usdVal} MXN por dólar incide en la adquisición de equipamiento especializado, servidores en la nube y licencias tecnológicas indexadas en USD. Un tipo de cambio fuerte abarata la inversión en activo fijo tecnológico del proyecto, mientras que una depreciación presionaría el CAPEX inicial.\n`;
    
    analysisText += `\n*Nota: Este análisis fue estructurado e inyectado automáticamente basándose en los datos macroeconómicos en vivo provistos por la API de Banxico.*`;

    // Actualizar sección de la naturaleza PESTEL
    updateSection('naturaleza', 'pestel', 'economico', analysisText);
    
    alert('¡El análisis macroeconómico ha sido redactado y guardado con éxito en el factor Económico de PESTEL!');
  };

  // Dibujar Sparklines en SVG puro
  const renderSparkline = (pointsData = [], color = '#6366f1') => {
    if (!Array.isArray(pointsData) || pointsData.length < 2) {
      return (
        <svg width="100%" height="45" style={{ overflow: 'visible' }}>
          <line x1="0" y1="22" x2="100" y2="22" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        </svg>
      );
    }

    const width = 120;
    const height = 40;
    const padding = 4;
    const plotW = width - padding * 2;
    const plotH = height - padding * 2;

    const values = pointsData.map(p => p.dato);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = (maxVal - minVal) || 1;

    const getX = (idx) => padding + (idx / (pointsData.length - 1)) * plotW;
    const getY = (val) => height - padding - ((val - minVal) / range) * plotH;

    const pathPoints = pointsData.map((p, idx) => `${getX(idx)},${getY(p.dato)}`).join(' L ');
    const areaPoints = `${getX(0)},${height} L ${pathPoints} L ${getX(pointsData.length - 1)},${height} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '120px', height: '40px', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.00" />
          </linearGradient>
        </defs>
        {/* Relleno inferior */}
        <path d={`M ${areaPoints}`} fill={`url(#grad-${color})`} />
        {/* Línea principal */}
        <path d={`M ${pathPoints}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  // Calcular la variación porcentual de la tendencia
  const getTrendDirection = (pointsData = []) => {
    if (!Array.isArray(pointsData) || pointsData.length < 2) return { text: '', isUp: false };
    const first = pointsData[0].dato;
    const last = pointsData[pointsData.length - 1].dato;
    const diff = last - first;
    const diffPct = (diff / (first || 1)) * 100;

    return {
      text: `${diff >= 0 ? '+' : ''}${diffPct.toFixed(1)}%`,
      isUp: diff >= 0
    };
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', marginTop: '1.5rem', border: '1px dashed var(--border-color)', background: 'rgba(99, 102, 241, 0.01)', borderRadius: '20px' }}>
      
      {/* Cabecera del Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} className="text-accent" />
            Dashboard de Factores Económicos (API Banxico en Vivo)
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '4px 0 0 0' }}>
            Indicadores financieros y monetarios clave actualizados para Sonora y el territorio nacional.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          {data?.isFallback && (
            <div style={{ fontSize: '0.72rem', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={12} />
              Datos Locales de Respaldo
            </div>
          )}
          <button 
            className="icon-btn-rounded" 
            onClick={() => fetchIndicators(token)}
            disabled={loading}
            title="Refrescar indicadores"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        /* Shimmer Loader */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', minHeight: '110px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shimmer" style={{ height: '110px', borderRadius: '12px' }}></div>
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', background: 'rgba(239,68,68,0.05)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.15)' }}>
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>No se pudieron sincronizar los datos de Banxico</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{error}</div>
        </div>
      ) : data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Fila de Tarjetas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
            
            {/* Tarjeta 1: Inflación */}
            <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.015)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Inflación Anual (INPC)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '4px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  {data.inflacion?.valor}%
                  <span style={{ fontSize: '0.65rem', color: data.inflacion?.valor > 5.5 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                    {data.inflacion?.valor > 5.5 ? 'Alta' : 'Bajo control'}
                  </span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Banxico · Al {data.inflacion?.fecha}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                {renderSparkline(data.inflacion?.datos, '#818cf8')}
                {(() => {
                  const trend = getTrendDirection(data.inflacion?.datos);
                  return (
                    <div style={{ fontSize: '0.65rem', color: trend.isUp ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                      {trend.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      <span>{trend.text} (6m)</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Tarjeta 2: Tasa TIIE */}
            <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.015)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Costo del Dinero (TIIE 28d)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '4px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  {data.tiie?.valor}%
                  <span style={{ fontSize: '0.65rem', color: data.tiie?.valor > 10 ? '#f59e0b' : '#10b981', fontWeight: 700 }}>
                    {data.tiie?.valor > 10 ? 'Alto' : 'Accesible'}
                  </span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Tasa Interbancaria · {data.tiie?.fecha}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                {renderSparkline(data.tiie?.datos, '#34d399')}
                {(() => {
                  const trend = getTrendDirection(data.tiie?.datos);
                  return (
                    <div style={{ fontSize: '0.65rem', color: trend.isUp ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                      {trend.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      <span>{trend.text} (6m)</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Tarjeta 3: USD / MXN */}
            <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.015)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Paridad Dólar (USD/MXN FIX)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '4px' }}>
                  ${data.tipoCambio?.valor?.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Cierre FIX · {data.tipoCambio?.fecha}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                {renderSparkline(data.tipoCambio?.datos, '#fb7185')}
                {(() => {
                  const trend = getTrendDirection(data.tipoCambio?.datos);
                  return (
                    <div style={{ fontSize: '0.65rem', color: trend.isUp ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                      {trend.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      <span>{trend.isUp ? 'Depreciación' : 'Apreciación'} ({trend.text})</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Tarjeta 4: UDI */}
            <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.015)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Valor de la UDI (Pesos)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '4px' }}>
                  ${data.udis?.valor?.toFixed(4)}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Unidades de Inversión · {data.udis?.fecha}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                {renderSparkline(data.udis?.datos, '#06b6d4')}
                {(() => {
                  const trend = getTrendDirection(data.udis?.datos);
                  return (
                    <div style={{ fontSize: '0.65rem', color: trend.isUp ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                      <TrendingUp size={10} />
                      <span>{trend.text} (6m)</span>
                    </div>
                  );
                })()}
              </div>
            </div>

          </div>

          {/* Fila de Botones de Impacto */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            
            {/* Botón 1: Redactar Análisis PESTEL */}
            <button 
              className="btn btn-secondary" 
              onClick={handleWritePestel}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.45rem 1rem' }}
            >
              <FileText size={14} />
              Redactar Análisis Económico en PESTEL
            </button>

            {/* Botón 2: Sincronizar con Proyecciones del Plan */}
            <button 
              className="btn btn-ia" 
              onClick={handleSyncFinancials}
              disabled={syncStatus.state === 'loading'}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontSize: '0.8rem', 
                padding: '0.45rem 1rem',
                minWidth: '150px',
                justifyContent: 'center'
              }}
            >
              {syncStatus.state === 'loading' ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : syncStatus.state === 'success' ? (
                <Check size={14} />
              ) : (
                <Zap size={14} />
              )}
              <span>Sincronizar Finanzas del Plan</span>
            </button>

          </div>

          {/* Mensaje de feedback de sincronización */}
          {syncStatus.message && (
            <div style={{ 
              fontSize: '0.78rem', 
              color: syncStatus.state === 'success' ? 'var(--success-color)' : (syncStatus.state === 'error' ? '#ef4444' : 'var(--text-secondary)'), 
              textAlign: 'right', 
              fontWeight: 600,
              marginTop: '-0.5rem'
            }}>
              {syncStatus.message}
            </div>
          )}

        </div>
      ) : null}

    </div>
  );
}
