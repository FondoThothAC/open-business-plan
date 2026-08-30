import { useEffect, useState } from 'react';
import { Activity, Cpu, RotateCcw, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { getApiBase, safeFetchJson } from '../config/apiConfig';

export default function GlobalTokenMonitor() {
  const [stats, setStats] = useState({
    todayTokens: 0,
    weekTokens: 0,
    monthTokens: 0,
    totalTokens: 0,
    totalRegens: 0,
    projectCount: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    setLoading(true);
    try {
      const apiBase = getApiBase();
      const res = await safeFetchJson(`${apiBase}/api/projects`);
      if (res.ok && res.data) {
        const data = res.data;
        const all = [...(data.negocios || []), ...(data.social || [])];
        
        let total = 0;
        let regens = 0;
        let today = 0;
        let week = 0;
        let month = 0;
        
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfWeek = startOfDay - (now.getDay() * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        all.forEach(p => {
          if (p.telemetry) {
            const tk = p.telemetry.totalTokens || 0;
            total += tk;
            regens += (p.telemetry.regenerations || 0);
            
            const pTime = p.mtime ? new Date(p.mtime).getTime() : startOfDay;
            if (pTime >= startOfDay) today += tk;
            if (pTime >= startOfWeek) week += tk;
            if (pTime >= startOfMonth) month += tk;
          }
        });

        setStats({
          todayTokens: today,
          weekTokens: week,
          monthTokens: month,
          totalTokens: total,
          totalRegens: regens,
          projectCount: all.length
        });
      }
    } catch (e) {
      console.warn("GlobalTokenMonitor Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const formatK = (num) => (num > 0 ? (num / 1000).toFixed(1) + 'k' : '0k');

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity size={24} color="#8b5cf6" />
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Monitor Global de Cuotas y Consumo IA</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Telemetría agregada de inferencia en todos los proyectos locales y en la nube
            </span>
          </div>
        </div>

        <button
          onClick={fetchGlobalStats}
          disabled={loading}
          style={{
            background: 'var(--bg-panel-hover)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '0.4rem 0.8rem',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Actualizando...' : 'Refrescar'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        {/* Total Histórico */}
        <div style={{ background: 'var(--bg-panel-hover)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <Cpu size={24} color="#3b82f6" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6', lineHeight: 1.2 }}>
            {formatK(stats.totalTokens)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
            Tokens Históricos ({stats.projectCount} Planes)
          </div>
        </div>

        {/* Uso Hoy */}
        <div style={{ background: 'var(--bg-panel-hover)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <TrendingUp size={24} color="#10b981" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', lineHeight: 1.2 }}>
            {formatK(stats.todayTokens)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
            Consumo de Hoy (24h)
          </div>
        </div>

        {/* Uso Esta Semana */}
        <div style={{ background: 'var(--bg-panel-hover)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <Calendar size={24} color="#a855f7" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a855f7', lineHeight: 1.2 }}>
            {formatK(stats.weekTokens)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
            Esta Semana (7 días)
          </div>
        </div>

        {/* Uso del Mes */}
        <div style={{ background: 'var(--bg-panel-hover)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <Calendar size={24} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1.2 }}>
            {formatK(stats.monthTokens)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
            Este Mes (Facturación)
          </div>
        </div>

        {/* Regeneraciones */}
        <div style={{ background: 'var(--bg-panel-hover)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <RotateCcw size={24} color="#ef4444" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444', lineHeight: 1.2 }}>
            {stats.totalRegens}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
            Reintentos y Fallbacks
          </div>
        </div>

      </div>
    </div>
  );
}
