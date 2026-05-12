import React from 'react';
import { usePlan } from '../context/PlanContext';
import { Sparkles } from 'lucide-react';

export default function Canvas() {
  const { planData, updateSection } = usePlan();
  
  const handleChange = (field, e) => {
    updateSection('modelo', 'canvas', field, e.target.value);
  };

  return (
    <div className="module-view print-page">
      <div className="view-header">
        <div>
          <h1 className="view-title">Business Model Canvas</h1>
          <p className="text-secondary mt-1">Estructura tu modelo de negocio de forma visual y rápida.</p>
        </div>
        <button className="btn btn-ia">
          <Sparkles className="w-4 h-4" />
          <span>Generar con IA</span>
        </button>
      </div>

      <div className="canvas-grid">
        <div className="glass-panel canvas-box partners">
          <label className="form-label text-white">Socios Clave</label>
          <textarea className="form-control flex-1" value={planData.modelo.canvas.partners || ''} onChange={(e) => handleChange('partners', e)}></textarea>
        </div>
        <div className="glass-panel canvas-box activities">
          <label className="form-label text-white">Actividades Clave</label>
          <textarea className="form-control flex-1" value={planData.modelo.canvas.activities || ''} onChange={(e) => handleChange('activities', e)}></textarea>
        </div>
        <div className="glass-panel canvas-box resources">
          <label className="form-label text-white">Recursos Clave</label>
          <textarea className="form-control flex-1" value={planData.modelo.canvas.resources || ''} onChange={(e) => handleChange('resources', e)}></textarea>
        </div>
        <div className="glass-panel canvas-box value">
          <label className="form-label text-[#6366f1] font-semibold">Propuesta de Valor</label>
          <textarea className="form-control flex-1" value={planData.modelo.canvas.value || ''} onChange={(e) => handleChange('value', e)}></textarea>
        </div>
        <div className="glass-panel canvas-box relations">
          <label className="form-label text-white">Relación con Clientes</label>
          <textarea className="form-control flex-1" value={planData.modelo.canvas.relations || ''} onChange={(e) => handleChange('relations', e)}></textarea>
        </div>
        <div className="glass-panel canvas-box channels">
          <label className="form-label text-white">Canales</label>
          <textarea className="form-control flex-1" value={planData.modelo.canvas.channels || ''} onChange={(e) => handleChange('channels', e)}></textarea>
        </div>
        <div className="glass-panel canvas-box segments">
          <label className="form-label text-white">Segmentos de Clientes</label>
          <textarea className="form-control flex-1" value={planData.modelo.canvas.segments || ''} onChange={(e) => handleChange('segments', e)}></textarea>
        </div>
      </div>
      
      <div className="canvas-bottom">
        <div className="glass-panel canvas-box" style={{height: '150px'}}>
          <label className="form-label text-white">Estructura de Costes</label>
          <textarea className="form-control flex-1" value={planData.modelo.canvas.costs || ''} onChange={(e) => handleChange('costs', e)}></textarea>
        </div>
        <div className="glass-panel canvas-box" style={{height: '150px'}}>
          <label className="form-label text-white">Fuentes de Ingresos</label>
          <textarea className="form-control flex-1" value={planData.modelo.canvas.revenue || ''} onChange={(e) => handleChange('revenue', e)}></textarea>
        </div>
      </div>
    </div>
  );
}
