import React from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { usePlan } from '../context/PlanContext';

export default function GenerationControls() {
  const {
    generationStatus,
    generationProgress,
    startIndustrialization,
    pauseIndustrialization,
    stopIndustrialization
  } = usePlan();

  if (generationStatus === 'idle') return null;

  return (
    <div className="generation-controls-bubble">
      <div className="status-label">
        {generationStatus === 'running' ? (
          <span className="pulse-text">🧠 Redactando: {generationProgress?.currentModule}...</span>
        ) : (
          <span className="paused-text">⏸️ Pausado en: {generationProgress?.currentModule}</span>
        )}
      </div>
      <div className="control-bar-progress">
        <div 
          className="progress-fill" 
          style={{ width: `${generationProgress?.total > 0 ? (generationProgress.completed / generationProgress.total) * 100 : 0}%` }} 
        />
        <span className="progress-step-text">
          {generationProgress?.completed} / {generationProgress?.total}
        </span>
      </div>
      <div className="button-group" style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
        {generationStatus === 'running' ? (
          <button 
            className="control-action-btn pause-btn" 
            title="Pausar Generación" 
            onClick={pauseIndustrialization}
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              color: '#f59e0b',
              padding: '6px 10px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Pause size={12} fill="#f59e0b" />
            <span>Pausar</span>
          </button>
        ) : (
          <button 
            className="control-action-btn resume-btn" 
            title="Continuar Generación" 
            onClick={() => startIndustrialization()}
            style={{
              background: 'var(--success-color)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
              animation: 'pulse-glow 2s infinite'
            }}
          >
            <Play size={12} fill="white" />
            <span>Continuar</span>
          </button>
        )}
        <button 
          className="control-action-btn stop-btn" 
          title="Detener y Limpiar Cola" 
          onClick={stopIndustrialization}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '6px 10px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Square size={10} fill="#ef4444" />
          <span>Detener</span>
        </button>
      </div>
    </div>
  );
}
