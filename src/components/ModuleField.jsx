import React, { useState } from 'react';
import { Lock, Unlock, Sparkles, BrainCircuit, Minimize2 } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import ExpertPanel from './ExpertPanel';

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
      // Usar la configuración de IA del plan
      const config = planData.config;
      const provider = config.aiProvider || 'ollama';
      const ollamaModel = config.ollamaModel || 'gemma4:e2b';
      const groqKey = config.groqApiKey;
      const geminiKey = config.geminiApiKey;
      
      const systemPrompt = 'Eres un editor profesional de planes de negocios. Tu trabajo es resumir texto manteniendo la idea central, datos clave y tono profesional. Responde SOLO con el resumen, sin introducciones ni explicaciones. Máximo 3-4 oraciones claras y directas.';
      const userPrompt = `Resume el siguiente texto de manera concisa y profesional:\n\n"${value}"`;

      let result = null;

      // Intento 1: Ollama local
      if (provider === 'ollama' || !groqKey) {
        try {
          const ollamaEndpoint = config.ollamaEndpoint || 'http://localhost:11434';
          const resp = await fetch(`${ollamaEndpoint}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: ollamaModel,
              prompt: `${systemPrompt}\n\nUsuario: ${userPrompt}`,
              stream: false,
              options: { temperature: 0.3, num_predict: 300 }
            })
          });
          if (resp.ok) {
            const data = await resp.json();
            result = data.response?.trim();
          }
        } catch (_) { /* fallback */ }
      }

      // Intento 2: Groq
      if (!result && groqKey) {
        try {
          const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.3, max_tokens: 300
            })
          });
          if (resp.ok) {
            const data = await resp.json();
            result = data.choices?.[0]?.message?.content?.trim();
          }
        } catch (_) { /* fallback */ }
      }

      // Intento 3: Gemini
      if (!result && geminiKey) {
        try {
          const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 300 }
            })
          });
          if (resp.ok) {
            const data = await resp.json();
            result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          }
        } catch (_) { /* fallback */ }
      }

      if (result) {
        updateSection(pillar, module, field, result);
      }
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
      />
    </div>
  );
}
