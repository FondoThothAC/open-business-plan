import React, { useState } from 'react';
import { BrainCircuit, Sparkles, TrendingUp, ShieldCheck, Cpu, Zap, X } from 'lucide-react';

export default function ExpertPanel({ fieldName, currentValue, onApply, isOpen, onClose }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const experts = [
    { id: 'marketing', name: 'Experto en Marketing', icon: TrendingUp, color: '#ec4899', prompt: `Como experto en marketing, mejora este texto para que sea más comercial y persuasivo: "${currentValue}"` },
    { id: 'finance', name: 'Experto Financiero', icon: ShieldCheck, color: '#10b981', prompt: `Como experto financiero, mejora este texto para que sea más técnico, preciso y profesional: "${currentValue}"` },
    { id: 'tech', name: 'Experto Técnico', icon: Cpu, color: '#6366f1', prompt: `Como experto en tecnología y procesos, mejora este texto para que sea más eficiente y detallado: "${currentValue}"` }
  ];

  const getSuggestion = async (expert) => {
    setLoading(true);
    // Simulation of AI call (in real it would use PlanContext's AI engine)
    setTimeout(() => {
      const mockResult = `Sugerencia de ${expert.name}: Basado en el campo ${fieldName}, recomiendo enfocar el discurso en la escalabilidad y el retorno de inversión, asegurando que los términos técnicos sean claros pero robustos.`;
      setSuggestions(prev => [{ ...expert, text: mockResult }, ...prev]);
      setLoading(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="expert-panel-overlay no-print" style={{ 
      position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, 
      background: 'rgba(0,0,0,0.5)', zIndex: 1000, 
      display: 'flex', justifyContent: 'flex-end' 
    }}>
      <div className="expert-panel glass-panel" style={{ 
        width: '400px', height: '100%', borderRadius: 0, 
        padding: '2rem', display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.3s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BrainCircuit className="w-6 h-6 text-accent" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Mesa de Expertos</h2>
          </div>
          <button onClick={onClose} className="btn-icon"><X /></button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Selecciona una perspectiva para mejorar: <br/><strong>{fieldName}</strong>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {experts.map(expert => (
              <button 
                key={expert.id}
                onClick={() => getSuggestion(expert)}
                className="expert-button"
                style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', 
                  gap: '0.5rem', padding: '0.75rem', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)', border: `1px solid ${expert.color}44`,
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}
              >
                <expert.icon className="w-5 h-5" style={{ color: expert.color }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 'bold', textAlign: 'center' }}>{expert.name.split(' ')[1]}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Zap className="w-8 h-8 text-accent animate-pulse" style={{ margin: '0 auto' }} />
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Consultando expertos...</p>
            </div>
          )}
          
          {suggestions.map((s, i) => (
            <div key={i} className="suggestion-card" style={{ 
              padding: '1rem', borderRadius: '12px', 
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: s.color }}>{s.name}</span>
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>{s.text}</p>
              <button 
                onClick={() => onApply(s.text)}
                className="btn btn-sm btn-accent" 
                style={{ marginTop: '0.75rem', width: '100%', fontSize: '0.75rem' }}
              >
                Aplicar esta mejora
              </button>
            </div>
          ))}

          {suggestions.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', opacity: 0.5 }}>
              <Sparkles className="w-12 h-12" style={{ margin: '0 auto', marginBottom: '1rem' }} />
              <p>Solicita una sugerencia a los expertos para mejorar tu plan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
