import React, { useEffect, useState } from 'react';
import { Activity, Cpu, RotateCcw, Calendar, TrendingUp } from 'lucide-react';
import { getApiBase } from '../config/apiConfig';

export default function GlobalTokenMonitor() {
  const [stats, setStats] = useState({
    todayTokens: 0,
    weekTokens: 0,
    monthTokens: 0,
    totalTokens: 0,
    totalRegens: 0,
    projectCount: 0
  });

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/projects`);
      if (res.ok) {
        const data = await res.json();
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
            
            const pTime = new Date(p.mtime).getTime();
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
    }
  };

  const formatK = (num) => (num > 0 ? (num / 1000).toFixed(1) + 'k' : '0k');

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Activity size={24} color="#8b5cf6" />
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Monitor Global de Cuotas IA</h2>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Uso agregado de inferencia IA en todos los proyectos locales. Útil para estimar facturación en APIs de pago.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        {/* Total Histórico */}
        <div style={{ background: 'var(--bg-panel-hover)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <Cpu size={24} color="#3b82f6" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6', lineHeight: 1.2 }}>
            {formatK(stats.totalTokens)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>Total Histórico</div>
        </div>

        {/* Uso Hoy */}
        <div style={{ background: 'var(--bg-panel-hover)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <TrendingUp size={24} color="#10b981" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', lineHeight: 1.2 }}>
            {formatK(stats.todayTokens)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>Uso de Hoy</div>
        </div>

        {/* Uso del Mes */}
        <div style={{ background: 'var(--bg-panel-hover)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <Calendar size={24} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1.2 }}>
            {formatK(stats.monthTokens)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>Este Mes</div>
        </div>

        {/* Regeneraciones */}
        <div style={{ background: 'var(--bg-panel-hover)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <RotateCcw size={24} color="#a855f7" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a855f7', lineHeight: 1.2 }}>
            {stats.totalRegens}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>Reintentos / Fallos</div>
        </div>

      </div>
    </div>
  );
}
