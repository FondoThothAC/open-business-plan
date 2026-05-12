import React from 'react';
import { usePlan } from '../context/PlanContext';
import { Sparkles } from 'lucide-react';

export default function Foda() {
  const { planData, updateSection } = usePlan();
  
  const handleChange = (field, e) => {
    updateSection('estrategia', 'foda', field, e.target.value);
  };

  return (
    <div className="module-view print-page">
      <div className="view-header">
        <div>
          <h1 className="view-title">Análisis FODA</h1>
          <p className="text-secondary mt-1">Identifica las fortalezas, debilidades, oportunidades y amenazas de tu proyecto.</p>
        </div>
        <button className="btn btn-ia">
          <Sparkles className="w-4 h-4" />
          <span>Generar con IA</span>
        </button>
      </div>

      <div className="foda-grid">
        <div className="glass-panel foda-cell">
          <h3 className="text-[#10b981]">Fortalezas</h3>
          <textarea 
            className="form-control flex-1" 
            placeholder="¿En qué destaca tu proyecto?"
            value={planData.estrategia.foda.fortalezas || ''}
            onChange={(e) => handleChange('fortalezas', e)}
          ></textarea>
        </div>
        
        <div className="glass-panel foda-cell">
          <h3 className="text-[#ef4444]">Debilidades</h3>
          <textarea 
            className="form-control flex-1" 
            placeholder="¿Qué áreas necesitan mejora?"
            value={planData.estrategia.foda.debilidades || ''}
            onChange={(e) => handleChange('debilidades', e)}
          ></textarea>
        </div>
        
        <div className="glass-panel foda-cell">
          <h3 className="text-[#3b82f6]">Oportunidades</h3>
          <textarea 
            className="form-control flex-1" 
            placeholder="¿Qué tendencias del mercado puedes aprovechar?"
            value={planData.estrategia.foda.oportunidades || ''}
            onChange={(e) => handleChange('oportunidades', e)}
          ></textarea>
        </div>
        
        <div className="glass-panel foda-cell">
          <h3 className="text-[#f59e0b]">Amenazas</h3>
          <textarea 
            className="form-control flex-1" 
            placeholder="¿Qué factores externos ponen en riesgo tu plan?"
            value={planData.estrategia.foda.amenazas || ''}
            onChange={(e) => handleChange('amenazas', e)}
          ></textarea>
        </div>
      </div>
    </div>
  );
}
