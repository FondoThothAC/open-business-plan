/**
 * @file AutonomousPuppetBanner.jsx
 * @description Banner visual interactivo que indica cuando el Copiloto Autónomo de IA
 * está en control del sistema (Efecto Puppet estilo GPT Work).
 * Permite visualizar el progreso módulo por módulo, pausar, reanudar o detener la generación.
 */

import React from 'react';
import { usePlan } from '../context/PlanContext';
import { Play, Pause, Square, Sparkles, BrainCircuit } from 'lucide-react';

export default function AutonomousPuppetBanner() {
  const {
    generationStatus,
    generationProgress,
    startIndustrialization,
    pauseIndustrialization,
    stopIndustrialization
  } = usePlan();

  if (generationStatus === 'idle') return null;

  const isRunning = generationStatus === 'running';
  const total = generationProgress?.total || 1;
  const completed = generationProgress?.completed || 0;
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const currentTitle = generationProgress?.currentModule || 'Módulo activo';

  return (
    <div
      style={{
        background: isRunning
          ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.18) 50%, rgba(99, 102, 241, 0.12) 100%)'
          : 'rgba(245, 158, 11, 0.1)',
        borderBottom: isRunning ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)',
        padding: '0.65rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.2rem',
        zIndex: 90,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0
      }}
    >
      {/* Indicador de Estado y Título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: isRunning ? '#10b981' : '#f59e0b',
              boxShadow: isRunning ? '0 0 10px #10b981' : 'none'
            }}
          />
          {isRunning && (
            <span
              style={{
                position: 'absolute',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '2px solid rgba(16, 185, 129, 0.5)',
                animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
              }}
            />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
              {isRunning ? '🤖 Copiloto Autónomo en Control' : '⏸️ Copiloto en Pausa'}
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '1px 6px',
                borderRadius: '4px',
                background: isRunning ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isRunning ? '#10b981' : '#f59e0b',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}
            >
              Modo Puppet
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isRunning ? (
              <span>Redactando automáticamente: <strong style={{ color: 'var(--text-primary)' }}>{currentTitle}</strong> ({completed} de {total} módulos — {percent}%)</span>
            ) : (
              <span>Pausado en: <strong style={{ color: 'var(--text-primary)' }}>{currentTitle}</strong>. Pulsa reanudar para continuar o edita libremente.</span>
            )}
          </div>
        </div>
      </div>

      {/* Barra de Progreso Compacta */}
      <div style={{ width: '160px', display: 'none', mdDisplay: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${percent}%`,
              background: isRunning ? 'linear-gradient(90deg, #6366f1, #10b981)' : '#f59e0b',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      {/* Botones de Control de Generación */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {isRunning ? (
          <button
            type="button"
            onClick={pauseIndustrialization}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#f59e0b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
          >
            <Pause size={13} fill="#f59e0b" />
            <span>Pausar</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => startIndustrialization()}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              background: 'var(--success-color)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Play size={13} fill="white" />
            <span>Reanudar</span>
          </button>
        )}

        <button
          type="button"
          onClick={stopIndustrialization}
          style={{
            padding: '0.4rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.08)',
            color: 'var(--danger-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s'
          }}
        >
          <Square size={12} fill="var(--danger-color)" />
          <span>Detener</span>
        </button>
      </div>
    </div>
  );
}
