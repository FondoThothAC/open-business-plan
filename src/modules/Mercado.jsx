import React from 'react';
import { usePlan } from '../context/PlanContext';

export default function Mercado() {
  const { planData, updateSection } = usePlan();
  
  const handleChange = (field, e) => {
    updateSection('mercado', 'tamano', field, e.target.value);
  };

  return (
    <div className="module-view print-page">
      <div className="view-header">
        <div>
          <h1 className="view-title">Análisis de Mercado</h1>
          <p className="text-secondary mt-1">Define a tu cliente ideal y el tamaño de tu mercado.</p>
        </div>
      </div>

      <div className="mercado-grid">
        <div className="glass-panel" style={{padding: '1.5rem'}}>
          <h3 className="mb-4">Embudo de Ventas / Mercado</h3>
          <div style={{
            clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)', 
            background: 'linear-gradient(180deg, #6366f1 0%, #3b82f6 100%)', 
            height: '250px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem'
          }}>
            <input type="text" className="form-control" placeholder="TAM" value={planData.mercado.tamano.tam || ''} onChange={(e) => handleChange('tam', e)} style={{background:'rgba(255,255,255,0.2)', border:'none', textAlign:'center', color:'white', marginBottom:'10px', width:'90%'}} />
            <input type="text" className="form-control" placeholder="SAM" value={planData.mercado.tamano.sam || ''} onChange={(e) => handleChange('sam', e)} style={{background:'rgba(255,255,255,0.2)', border:'none', textAlign:'center', color:'white', marginBottom:'10px', width:'70%'}} />
            <input type="text" className="form-control" placeholder="SOM" value={planData.mercado.tamano.som || ''} onChange={(e) => handleChange('som', e)} style={{background:'rgba(255,255,255,0.2)', border:'none', textAlign:'center', color:'white', width:'50%'}} />
          </div>
        </div>

        <div className="flex flex-col gap-4" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div className="glass-panel" style={{padding: '1.5rem'}}>
            <h3 className="mb-4">Perfil del Cliente</h3>
            <textarea 
              className="form-control" 
              placeholder="Describe detalladamente tu Mercado y los clientes objetivo..."
              value={planData.mercado.tamano.perfil || ''}
              onChange={(e) => handleChange('perfil', e)}
              style={{minHeight: '120px'}}
            ></textarea>
          </div>

          <div className="glass-panel" style={{padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
            <div>
              <h3 className="mb-4">Data Science</h3>
              <textarea 
                className="form-control" 
                placeholder="Datos del tamaño de mercado..."
                value={planData.mercado.tamano.dataScience || ''}
                onChange={(e) => handleChange('dataScience', e)}
              ></textarea>
            </div>
            <div>
              <h3 className="mb-4">Heat Map / Zonas</h3>
              <div style={{background: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80") center/cover', height: '100px', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: 0.7}}></div>
              <p className="text-xs text-secondary mt-2">Mapa referencial de impacto de mercado.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
