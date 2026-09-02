/**
 * DigitalTwinDashboard.jsx — Dashboard de Gemelos Digitales & Forking Temporal Automático
 * 
 * Permite sincronizar feeds macroeconómicos del mundo real y generar versiones ramificadas (Forks Temporales)
 * para evaluar el impacto de variaciones en tasas de Banxico, inflación y costos sobre el VAN y la TIR.
 */

import { useState } from 'react';
import { RefreshCw, CheckCircle, Globe, GitFork, AlertTriangle, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { 
  fetchAlphaVantageData, 
  fetchCoinGeckoPrice, 
  fetchWorldBankIndicator, 
  fetchExchangeRates, 
  fetchSecCompanyFacts, 
  injectDigitalTwinEvidence 
} from '../lib/digitalTwinAdapters';
import { createTemporalFork } from '../lib/digitalTwinForkEngine';

export default function DigitalTwinDashboard() {
  const { planData, setPlanData } = usePlan();
  const [syncing, setSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState([]);
  
  // Estado para Forks Temporales
  const [temporalForks, setTemporalForks] = useState([]);
  const [activeForkComparison, setActiveForkComparison] = useState(null);
  const [isForking, setIsForking] = useState(false);

  const externalApis = planData?.config?.externalApis || {};
  const evidenceList = planData?.digitalTwinEvidence || [];

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncLogs([]);
    const addLog = (msg) => setSyncLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    let updatedPlan = { ...planData };

    try {
      // 1. Alpha Vantage
      addLog('Consultando Alpha Vantage (Perfil bursátil / WACC)...');
      const avData = await fetchAlphaVantageData('IBM', 'OVERVIEW', externalApis.alphaVantageKey);
      updatedPlan = injectDigitalTwinEvidence(updatedPlan, avData);
      addLog(`Alpha Vantage: ${avData.indicator} obtenido.`);

      // 2. CoinGecko
      if (externalApis.coinGeckoEnabled !== false) {
        addLog('Consultando CoinGecko (Cotizaciones Cripto / DeFi)...');
        const cgData = await fetchCoinGeckoPrice('bitcoin', 'usd');
        updatedPlan = injectDigitalTwinEvidence(updatedPlan, cgData);
        addLog(`CoinGecko: ${cgData.indicator} obtenido.`);
      }

      // 3. Banco Mundial
      if (externalApis.worldBankEnabled !== false) {
        addLog('Consultando Banco Mundial (PIB e Indicadores Macro)...');
        const wbData = await fetchWorldBankIndicator('MX', 'NY.GDP.MKTP.CD');
        updatedPlan = injectDigitalTwinEvidence(updatedPlan, wbData);
        addLog(`Banco Mundial: ${wbData.indicator} obtenido.`);
      }

      // 4. ExchangeRate
      if (externalApis.exchangeRateEnabled !== false) {
        addLog('Consultando ExchangeRate API (Paridad Cambiaria)...');
        const fxData = await fetchExchangeRates('USD');
        updatedPlan = injectDigitalTwinEvidence(updatedPlan, fxData);
        addLog(`ExchangeRate: ${fxData.indicator} obtenido.`);
      }

      // 5. SEC EDGAR
      if (externalApis.secEdgarEnabled !== false) {
        addLog('Consultando SEC EDGAR (Benchmarks Corporativos)...');
        const secData = await fetchSecCompanyFacts('0000320193');
        updatedPlan = injectDigitalTwinEvidence(updatedPlan, secData);
        addLog(`SEC EDGAR: ${secData.indicator} obtenido.`);
      }

      setPlanData(updatedPlan);
      addLog('✅ Sincronización completa de Gemelos Digitales finalizada con éxito.');
    } catch (err) {
      addLog(`❌ Error en sincronización: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleGenerateTemporalFork = () => {
    setIsForking(true);
    setTimeout(() => {
      // Simular auditoría de 15/30 días con ajuste de +3.5% en costos por inflación
      const forkResult = createTemporalFork({
        planData,
        triggerReason: 'Auditoría Periódica de 30 Días (Variación TIIE + Inflación)',
        newMacroData: {
          tiie28: 10.25,
          inflacionAnual: 4.85,
          usdMxn: 19.80
        },
        newCostMultiplier: 1.04
      });

      setTemporalForks(prev => [forkResult, ...prev]);
      setActiveForkComparison(forkResult);
      setIsForking(false);
    }, 600);
  };

  const sources = [
    { name: 'Alpha Vantage', type: 'Financiero JSON', status: externalApis.alphaVantageKey ? 'Configurado' : 'Key por defecto', color: '#3b82f6' },
    { name: 'BANXICO SieAPI', type: 'Tasas CETES / FIX', status: externalApis.banxicoToken ? 'Conectado' : 'Sin Token', color: '#f59e0b' },
    { name: 'INEGI DENUE', type: 'Censo Empresarial', status: externalApis.inegiToken ? 'Conectado' : 'Sin Token', color: '#6366f1' },
    { name: 'CoinGecko', type: 'Cripto / DeFi', status: externalApis.coinGeckoEnabled !== false ? 'Activo' : 'Inactivo', color: '#8b5cf6' },
    { name: 'Banco Mundial', type: 'Macro Global', status: externalApis.worldBankEnabled !== false ? 'Activo' : 'Inactivo', color: '#0ea5e9' },
    { name: 'ExchangeRate', type: 'FX / Divisas', status: externalApis.exchangeRateEnabled !== false ? 'Activo' : 'Inactivo', color: '#14b8a6' },
    { name: 'SEC EDGAR', type: 'XBRL 10-K / 10-Q', status: externalApis.secEdgarEnabled !== false ? 'Activo' : 'Inactivo', color: '#a855f7' },
  ];

  return (
    <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Dashboard de Gemelos Digitales</h3>
            <span style={{ fontSize: '0.65rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
              Live Macro & Forking Temporal
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Monitoreo activo de datos del mundo real y control de versiones ramificadas para evaluación de viabilidad.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleGenerateTemporalFork} 
            disabled={isForking}
            style={{
              fontSize: '0.78rem',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818cf8',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <GitFork size={14} className={isForking ? 'animate-spin' : ''} />
            {isForking ? 'Generando Fork...' : 'Crear Fork Temporal (30 Días)'}
          </button>

          <button 
            onClick={handleSyncAll} 
            disabled={syncing}
            className="btn btn-primary"
            style={{ fontSize: '0.78rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Feeds'}
          </button>
        </div>
      </div>

      {/* Panel Diff de Fork Temporal Activo */}
      {activeForkComparison && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1.25rem',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))',
          border: `1.5px solid ${activeForkComparison.impact.light === 'GREEN' ? '#10b981' : activeForkComparison.impact.light === 'YELLOW' ? '#f59e0b' : '#ef4444'}`,
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GitFork size={18} color="#818cf8" />
              <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>
                Comparativa de Fork Temporal: {activeForkComparison.forkName}
              </strong>
            </div>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '20px',
              background: activeForkComparison.impact.light === 'GREEN' ? 'rgba(16, 185, 129, 0.2)' : activeForkComparison.impact.light === 'YELLOW' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: activeForkComparison.impact.light === 'GREEN' ? '#10b981' : activeForkComparison.impact.light === 'YELLOW' ? '#f59e0b' : '#ef4444',
              border: '1px solid currentColor'
            }}>
              Semáforo: {activeForkComparison.impact.label}
            </span>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
            Motivo de activación: {activeForkComparison.triggerReason}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Valor Actual Neto (VAN)</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '3px' }}>
                <strong style={{ fontSize: '0.95rem', color: '#fff' }}>${activeForkComparison.forkMetrics.van.toLocaleString()}</strong>
                <span style={{ fontSize: '0.7rem', color: activeForkComparison.impact.deltaVanPct >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                  ({activeForkComparison.impact.deltaVanPct >= 0 ? '+' : ''}{activeForkComparison.impact.deltaVanPct}%)
                </span>
              </div>
              <span style={{ fontSize: '0.62rem', color: '#64748b' }}>Base: ${activeForkComparison.baseMetrics.van.toLocaleString()}</span>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Tasa Interna de Retorno (TIR)</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '3px' }}>
                <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{activeForkComparison.forkMetrics.tir}%</strong>
                <span style={{ fontSize: '0.7rem', color: activeForkComparison.impact.deltaTirPct >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                  ({activeForkComparison.impact.deltaTirPct >= 0 ? '+' : ''}{activeForkComparison.impact.deltaTirPct}%)
                </span>
              </div>
              <span style={{ fontSize: '0.62rem', color: '#64748b' }}>Base: {activeForkComparison.baseMetrics.tir}%</span>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Retorno de Inversión (ROI)</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '3px' }}>
                <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{activeForkComparison.forkMetrics.roi}%</strong>
              </div>
              <span style={{ fontSize: '0.62rem', color: '#64748b' }}>Base: {activeForkComparison.baseMetrics.roi}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Fuentes Conectadas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {sources.map((s, idx) => (
          <div key={idx} style={{ padding: '0.75rem', borderRadius: '10px', background: 'var(--bg-panel-hover)', border: `1px solid ${s.color}33` }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: s.color, marginBottom: '2px' }}>{s.name}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>{s.type}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={10} color="#10b981" /> {s.status}
            </div>
          </div>
        ))}
      </div>

      {/* Consola de logs de sincronización */}
      {syncLogs.length > 0 && (
        <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: '#090d16', borderRadius: '8px', border: '1px solid #1e293b', fontFamily: 'monospace', fontSize: '0.7rem', maxHeight: '100px', overflowY: 'auto', color: '#a5b4fc' }}>
          {syncLogs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      )}

      {/* Evidencia Almacenada */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Evidencia Activa Inyectada ({evidenceList.length} registros)
        </div>
        {evidenceList.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', background: 'var(--bg-panel-hover)', borderRadius: '8px' }}>
            Aún no se han sincronizado evidencias. Haz clic en "Sincronizar Feeds" para obtener datos en vivo.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.6rem' }}>
            {evidenceList.map((ev, i) => (
              <div key={i} style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'var(--bg-panel-hover)', border: '1px solid var(--border-color)', fontSize: '0.72rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--accent-color)' }}>{ev.indicator}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: '2px' }}>
                  {typeof ev.value === 'number' ? ev.value.toLocaleString() : String(ev.value)} <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-secondary)' }}>{ev.unit}</span>
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Fuente: {ev.source} · {new Date(ev.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
