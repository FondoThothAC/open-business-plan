import React from 'react';
import { Zap, Activity, AlertCircle, CheckCircle2, ShieldCheck, Gauge, Clock, DollarSign, Flame } from 'lucide-react';

const PROVIDER_METADATA = {
  groq: {
    name: 'Groq Cloud',
    dailyQuota: 100000,
    rateLimit: '30 RPM · 100k TPD',
    renewalText: 'Resetea cada 24 hrs',
    contextMax: '128k ctx',
    freeTier: true,
    accentColor: '#f59e0b',
  },
  nvidia: {
    name: 'NVIDIA NIM',
    dailyQuota: 50000,
    rateLimit: '40 RPM · 1k req/mes',
    renewalText: 'Resetea cada 1ro de mes',
    contextMax: '128k ctx',
    freeTier: true,
    accentColor: '#10b981',
  },
  mistral: {
    name: 'Mistral AI',
    dailyQuota: 50000,
    rateLimit: '1 RPS · Free Tier',
    renewalText: 'Resetea cada 24 hrs',
    contextMax: '128k ctx',
    freeTier: true,
    accentColor: '#ec4899',
  },
  ollama_cloud: {
    name: 'Ollama Cloud',
    dailyQuota: 200000,
    rateLimit: 'Ilimitado · Comunitario',
    renewalText: 'Sin límite de cuota fija',
    contextMax: '256k ctx',
    freeTier: true,
    accentColor: '#6366f1',
  },
  openrouter: {
    name: 'OpenRouter',
    dailyQuota: 100000,
    rateLimit: '20 RPM · Modelos Gratuitos',
    renewalText: 'Modelos :free sin costo',
    contextMax: '1M ctx (Nemotron)',
    freeTier: true,
    accentColor: '#f59e0b',
  },
  opencode: {
    name: 'OpenCode AI',
    dailyQuota: 80000,
    rateLimit: 'Ventana de 5 Horas',
    renewalText: 'Renueva cada 5 horas',
    contextMax: '128k ctx',
    freeTier: true,
    accentColor: '#a78bfa',
  },
  tokenrouter: {
    name: 'TokenRouter',
    dailyQuota: 120000,
    rateLimit: 'Auto-Rotación Multi-Modelo',
    renewalText: 'Resetea diario por modelo',
    contextMax: '128k ctx',
    freeTier: true,
    accentColor: '#10b981',
  },
  gemini: {
    name: 'Google Gemini',
    dailyQuota: 1000000,
    rateLimit: '15 RPM · 1M TPM (Free)',
    renewalText: 'Resetea cada 24 hrs',
    contextMax: '1M ctx',
    freeTier: true,
    accentColor: '#38bdf8',
  },
  claude: {
    name: 'Anthropic Claude',
    dailyQuota: 50000,
    rateLimit: 'Facturación por Token (Prepaid)',
    renewalText: 'Sujeto a saldo en cuenta',
    contextMax: '200k ctx',
    freeTier: false,
    accentColor: '#d97706',
  },
  openai: {
    name: 'OpenAI (GPT)',
    dailyQuota: 50000,
    rateLimit: 'Facturación por Token (Prepaid)',
    renewalText: 'Sujeto a saldo en cuenta',
    contextMax: '128k ctx',
    freeTier: false,
    accentColor: '#10b981',
  },
  ollama: {
    name: 'Ollama Local',
    dailyQuota: 0, // 0 = sin límite (local)
    rateLimit: 'Offline · Hardware Local',
    renewalText: 'Sin límite de servidor',
    contextMax: 'Sin límite API',
    freeTier: true,
    accentColor: '#818cf8',
  },
  deepseek: {
    name: 'DeepSeek',
    dailyQuota: 100000,
    rateLimit: 'Freemium · R1 vía Routers',
    renewalText: 'Sin límite en capa :free',
    contextMax: '128k ctx',
    freeTier: true,
    accentColor: '#3b82f6',
  },
  grok: {
    name: 'xAI Grok',
    dailyQuota: 50000,
    rateLimit: 'Facturación por Token',
    renewalText: 'Sujeto a saldo en cuenta',
    contextMax: '128k ctx',
    freeTier: false,
    accentColor: '#6366f1',
  },
  orcarouter: {
    name: 'Orca Router',
    dailyQuota: 80000,
    rateLimit: 'Auto-Selección Inteligente',
    renewalText: 'Resetea diario',
    contextMax: '128k ctx',
    freeTier: true,
    accentColor: '#f97316',
  },
  minimax: {
    name: 'MiniMax (Directo)',
    dailyQuota: 100000,
    rateLimit: 'API Key Directa',
    renewalText: 'Cuota mensual de plan',
    contextMax: '1M ctx (M3)',
    freeTier: true,
    accentColor: '#fbbf24',
  },
};

export default function ApiQuotaMeter({ 
  providerKey, 
  tokens = 0, 
  isConfigured = false, 
  statusState = 'idle',
  isHot = false,
  liveBalance = null
}) {
  const meta = PROVIDER_METADATA[providerKey] || {
    name: providerKey,
    dailyQuota: 100000,
    rateLimit: 'Estándar',
    renewalText: 'Reseteo diario',
    contextMax: '32k ctx',
    freeTier: true,
    accentColor: '#6366f1',
  };

  const isLocal = providerKey === 'ollama';
  const quota = meta.dailyQuota;
  const percentage = isLocal ? 0 : Math.min(100, Math.round((tokens / (quota || 100000)) * 100));
  const remainingTokens = Math.max(0, quota - tokens);

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
      padding: '0.65rem 0.85rem',
      borderRadius: '10px',
      background: isHot ? 'rgba(239, 68, 68, 0.08)' : 'rgba(0, 0, 0, 0.25)',
      border: isHot ? '1.5px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.07)',
      fontSize: '0.72rem',
      boxShadow: isHot ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none',
      transition: 'all 0.3s ease'
    }}>
      {/* Header del Medidor */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
          {isHot ? (
            <Flame size={14} color="#ef4444" style={{ animation: 'pulse 1s infinite' }} />
          ) : (
            <Gauge size={13} style={{ color: meta.accentColor }} />
          )}
          <span style={{ fontWeight: 700, color: isHot ? '#ef4444' : 'var(--text-primary)' }}>
            {isHot ? '🔥 Modelo Activo (HOT)' : 'Medidor de Cuota'}
          </span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>({meta.rateLimit})</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {liveBalance && (
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              Saldo: {liveBalance}
            </span>
          )}
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

      {/* Footer con Métricas de Tokens y Ventana de Renovación */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '0.25rem' }}>
        <div>
          <span>Uso: </span>
          <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            {tokens.toLocaleString()}
          </strong>
          {!isLocal && quota > 0 && (
            <>
              <span style={{ color: 'var(--text-muted)' }}> / {(quota / 1000).toFixed(0)}k</span>
              <span style={{ marginLeft: '4px', color: '#10b981', fontWeight: 600 }}>
                (Quedan: {(remainingTokens / 1000).toFixed(0)}k)
              </span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-muted)' }}>
            <Clock size={11} />
            <span>{meta.renewalText}</span>
          </div>
          <span style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: statusState === 'online' ? '#10b981' : isConfigured ? '#f59e0b' : '#6b7280',
          }} title={statusState === 'online' ? 'Servicio Activo y Verificado' : 'Pendiente de verificación'} />
        </div>
      </div>
    </div>
  );
}
