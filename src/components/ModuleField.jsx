import React, { useState } from 'react';
import { Lock, Unlock, BrainCircuit, Minimize2 } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import ExpertPanel from './ExpertPanel';
import { summarizeText } from '../lib/ai';

export default function ModuleField({ pillar, module, field, label, placeholder, type = 'textarea' }) {
  const { planData, updateSection, toggleLock } = usePlan();
  const [isExpertOpen, setIsExpertOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  const value = planData[pillar]?.[module]?.[field] || '';
  const isLocked = planData.config?.locks?.[`${pillar}.${module}.${field}`];

  const handleApply = (newText) => {
    updateSection(pillar, module, field, newText);
    setIsExpertOpen(false);
  };

  const handleSummarize = async () => {
    if (!value || value.trim().length < 30 || isSummarizing) return;
    
    setIsSummarizing(true);
    try {
      const aiConfig = planData.config?.ai;
      if (!aiConfig) return;
      const result = await summarizeText(aiConfig, value);
      if (result) updateSection(pillar, module, field, result);
    } catch (err) {
      console.error('Error resumiendo:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="field-container" style={{ marginBottom: '1.5rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          {label}
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Botón Resumir — solo visible si hay texto largo */}
          {value && value.trim().length > 80 && (
            <button 
              onClick={handleSummarize}
              className={`btn-summarize ${isSummarizing ? 'loading' : ''}`}
              disabled={isSummarizing || isLocked}
              title="Resumir con IA"
            >
              <Minimize2 size={12} />
              <span>{isSummarizing ? 'Resumiendo...' : 'Resumir'}</span>
            </button>
          )}
          <button 
            onClick={() => setIsExpertOpen(true)}
            className="btn-icon" 
            style={{ width: '28px', height: '28px', color: 'var(--accent-color)' }}
            title="Mesa de Expertos (IA)"
          >
            <BrainCircuit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => toggleLock(pillar, module, field)}
            className="btn-icon"
            style={{ width: '28px', height: '28px', color: isLocked ? '#ef4444' : 'var(--text-secondary)' }}
            title={isLocked ? 'Desbloquear campo' : 'Bloquear contra IA'}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        {type === 'textarea' ? (
          <textarea
            className="form-control"
            style={{ 
              minHeight: '120px', 
              resize: 'vertical',
              background: isLocked ? 'rgba(0,0,0,0.1)' : 'var(--input-bg)',
              borderColor: isLocked ? 'rgba(255,255,255,0.05)' : 'var(--border-color)',
              color: isLocked ? 'var(--text-secondary)' : 'var(--text-primary)',
              pointerEvents: isLocked ? 'none' : 'auto',
              opacity: isLocked ? 0.6 : 1
            }}
            placeholder={placeholder}
            value={value}
            onChange={(e) => updateSection(pillar, module, field, e.target.value)}
          />
        ) : (
          <input
            type="text"
            className="form-control"
            style={{ 
              background: isLocked ? 'rgba(0,0,0,0.1)' : 'var(--input-bg)',
              pointerEvents: isLocked ? 'none' : 'auto',
              opacity: isLocked ? 0.6 : 1
            }}
            placeholder={placeholder}
            value={value}
            onChange={(e) => updateSection(pillar, module, field, e.target.value)}
          />
        )}
        
        {isLocked && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.3 }}>
            <Lock className="w-4 h-4" />
          </div>
        )}
      </div>

      <ExpertPanel 
        fieldName={label}
        currentValue={value}
        isOpen={isExpertOpen}
        onClose={() => setIsExpertOpen(false)}
        onApply={handleApply}
        aiConfig={planData.config?.ai}
        planData={planData}
      />
    </div>
  );
}
