import React from 'react';
import { Zap, Activity, AlertCircle, CheckCircle2, ShieldCheck, Gauge } from 'lucide-react';

const PROVIDER_METADATA = {
  groq: {
    name: 'Groq Cloud',
    dailyQuota: 100000,
    rateLimit: '30 RPM · 100k TPD',
    contextMax: '128k ctx',
    freeTier: true,
    accentColor: '#f59e0b',
  },
  nvidia: {
    name: 'NVIDIA NIM',
    dailyQuota: 50000,
    rateLimit: '40 RPM · 1k req/mo',
    contextMax: '128k ctx',
    freeTier: true,
    accentColor: '#10b981',
  },
  mistral: {
    name: 'Mistral AI',
    dailyQuota: 50000,
    rateLimit: '1 RPS · Free Tier',
    contextMax: '128k ctx',
    freeTier: true,
    accentColor: '#ec4899',
  },
  ollama_cloud: {
    name: 'Ollama Cloud',
    dailyQuota: 200000,
    rateLimit: 'Ilimitado · Comunitario',
    contextMax: '256k ctx',
    freeTier: true,
    accentColor: '#6366f1',
  },
  openrouter: {
    name: 'OpenRouter',
    dailyQuota: 100000,
    rateLimit: '20 RPM · Free Models',
    contextMax: '1M ctx (Nemotron)',
    freeTier: true,
    accentColor: '#f59e0b',
  },
  opencode: {
    name: 'OpenCode AI',
    dailyQuota: 80000,
    rateLimit: 'Reset cada 5 horas',
    contextMax: '128k ctx',
    freeTier: true,
    accentColor: '#a78bfa',
  },
  orcarouter: {
    name: 'Orca Router',
    dailyQuota: 50000,
    rateLimit: 'BYOK / Requiere Saldo',
    contextMax: '128k ctx',
    freeTier: false,
    accentColor: '#38bdf8',
  },
  gemini: {
    name: 'Google Gemini',
    dailyQuota: 1000000,
    rateLimit: '15 RPM · 1M TPM (Free)',
    contextMax: '1M ctx',
    freeTier: true,
    accentColor: '#38bdf8',
  },
  claude: {
    name: 'Claude 3.5',
    dailyQuota: 50000,
    rateLimit: 'Facturación por Token',
    contextMax: '200k ctx',
    freeTier: false,
    accentColor: '#d97706',
  },
  openai: {
    name: 'OpenAI GPT-4o',
    dailyQuota: 50000,
    rateLimit: 'Facturación por Token',
    contextMax: '128k ctx',
    freeTier: false,
    accentColor: '#10b981',
  },
  ollama: {
    name: 'Ollama Local',
    dailyQuota: 0, // 0 = sin límite (local)
    rateLimit: 'Offline · Hardware Local',
    contextMax: 'Sin límite API',
    freeTier: true,
    accentColor: '#818cf8',
  },
};

export default function ApiQuotaMeter({ providerKey, tokens = 0, isConfigured = false, statusState = 'idle' }) {
  const meta = PROVIDER_METADATA[providerKey] || {
    name: providerKey,
    dailyQuota: 100000,
    rateLimit: 'Estándar',
    contextMax: '32k ctx',
    freeTier: true,
    accentColor: '#6366f1',
  };

  const isLocal = providerKey === 'ollama';
  const quota = meta.dailyQuota;
  const percentage = isLocal ? 0 : Math.min(100, Math.round((tokens / (quota || 100000)) * 100));

  let saturationLevel = 'Óptimo';
  let saturationColor = '#10b981';
  let barGradient = 'linear-gradient(90deg, #10b981, #059669)';

  if (percentage > 85) {
    saturationLevel = 'Saturación Alta';
    saturationColor = '#ef4444';
    barGradient = 'linear-gradient(90deg, #f59e0b, #ef4444)';
  } else if (percentage > 50) {
    saturationLevel = 'Carga Moderada';
    saturationColor = '#f59e0b';
    barGradient = 'linear-gradient(90deg, #10b981, #f59e0b)';
  }

  return (
    <div style={{
      marginTop: '0.6rem',
      padding: '0.55rem 0.75rem',
      borderRadius: '8px',
      background: 'rgba(0, 0, 0, 0.25)',
      border: '1px solid rgba(255, 255, 255, 0.07)',
      fontSize: '0.72rem',
    }}>
      {/* Header del Medidor */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
          <Gauge size={13} style={{ color: meta.accentColor }} />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Medidor de Cuota</span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>({meta.rateLimit})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            padding: '1px 6px',
            borderRadius: '6px',
            background: isLocal ? 'rgba(16, 185, 129, 0.15)' : `${saturationColor}22`,
            color: isLocal ? '#10b981' : saturationColor,
            border: `1px solid ${isLocal ? '#10b981' : saturationColor}44`,
          }}>
            {isLocal ? '⚡ Ilimitado Local' : `${saturationLevel} (${percentage}%)`}
          </span>
        </div>
      </div>

      {/* Barra de Progreso / Saturación */}
      <div style={{
        width: '100%',
        height: '6px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '3px',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '0.4rem',
      }}>
        <div style={{
          width: isLocal ? '100%' : `${Math.max(percentage, isConfigured ? 4 : 0)}%`,
          height: '100%',
          background: isLocal ? 'linear-gradient(90deg, #6366f1, #10b981)' : barGradient,
          borderRadius: '3px',
          transition: 'width 0.4s ease-in-out',
        }} />
      </div>

      {/* Footer con Métricas de Tokens */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
        <div>
          <span>Uso: </span>
          <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            {tokens.toLocaleString()}
          </strong>
          {!isLocal && quota > 0 && (
            <span style={{ color: 'var(--text-muted)' }}> / {(quota / 1000).toFixed(0)}k tks</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Contexto: <strong>{meta.contextMax}</strong></span>
          <span style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: statusState === 'online' ? '#10b981' : isConfigured ? '#f59e0b' : '#6b7280',
          }} title={statusState === 'online' ? 'Servicio Activo' : 'Pendiente de verificación'} />
        </div>
      </div>
    </div>
  );
}
