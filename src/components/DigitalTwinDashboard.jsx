import React, { useState } from 'react';
import { 
  Activity, RefreshCw, CheckCircle, AlertTriangle, ExternalLink, 
  TrendingUp, Globe, DollarSign, Shield, Database, Zap 
} from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { 
  fetchAlphaVantageData, 
  fetchCoinGeckoPrice, 
  fetchWorldBankIndicator, 
  fetchExchangeRates,
  fetchSecCompanyFacts,
  injectDigitalTwinEvidence 
} from '../lib/digitalTwinAdapters';

export default function DigitalTwinDashboard() {
  const { planData, setPlanData } = usePlan();
  const [syncing, setSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState([]);

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
              Live Macro & Financial Feeds
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Monitoreo activo de datos del mundo real inyectados en la formulación del plan de negocio.
          </p>
        </div>

        <button 
          onClick={handleSyncAll} 
          disabled={syncing}
          className="btn btn-primary"
          style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Sincronizando...' : 'Sincronizar Todo Ahora'}
        </button>
      </div>

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
            Aún no se han sincronizado evidencias. Haz clic en "Sincronizar Todo Ahora" para obtener datos en vivo.
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
