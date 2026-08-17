import { usePlan } from '../context/PlanContext';
import { Sparkles, TrendingUp, DollarSign, Activity } from 'lucide-react';

export default function Finanzas() {
  const { planData, updateSection } = usePlan();
  
  const handleChange = (field, e) => {
    updateSection('finanzas', 'estructuraCostos', field, e.target.value);
  };

  return (
    <div className="module-view print-page">
      <div className="view-header">
        <div>
          <h1 className="view-title">Plan Financiero</h1>
          <p className="text-secondary mt-1">Proyecciones, métricas y viabilidad del proyecto.</p>
        </div>
        <button className="btn btn-ia">
          <Sparkles className="w-4 h-4" />
          <span>Analizar con IA</span>
        </button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem'}}>
        <div className="glass-panel" style={{padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <div style={{background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '50%'}}>
            <DollarSign className="text-[#10b981]" />
          </div>
          <div>
            <h4 className="text-secondary text-sm">Ingresos Proyectados (Año 1)</h4>
            <h2 style={{fontSize: '1.5rem'}}>$0.00</h2>
          </div>
        </div>
        
        <div className="glass-panel" style={{padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <div style={{background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '50%'}}>
            <TrendingUp className="text-[#ef4444]" style={{transform: 'scaleY(-1)'}} />
          </div>
          <div>
            <h4 className="text-secondary text-sm">Costes Fijos (Mes)</h4>
            <h2 style={{fontSize: '1.5rem'}}>$0.00</h2>
          </div>
        </div>
        
        <div className="glass-panel" style={{padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <div style={{background: 'rgba(99, 102, 241, 0.2)', padding: '1rem', borderRadius: '50%'}}>
            <Activity className="text-[#6366f1]" />
          </div>
          <div>
            <h4 className="text-secondary text-sm">Punto de Equilibrio</h4>
            <h2 style={{fontSize: '1.5rem'}}>Mes 0</h2>
          </div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem'}}>
        <div className="glass-panel" style={{padding: '1.5rem'}}>
          <h3 className="mb-4">Estructura de Costes e Ingresos</h3>
          <textarea 
            className="form-control mb-4" 
            placeholder="Detalle de Costos Fijos (Suscripciones, Nómina, etc.)"
            value={planData.finanzas.estructuraCostos.fijos || ''}
            onChange={(e) => handleChange('fijos', e)}
          ></textarea>
          <textarea 
            className="form-control" 
            placeholder="Detalle de Costos Variables (Comisiones, AWS, etc.)"
            value={planData.finanzas.estructuraCostos.variables || ''}
            onChange={(e) => handleChange('variables', e)}
          ></textarea>
        </div>
        
        <div className="glass-panel" style={{padding: '1.5rem'}}>
          <h3 className="mb-4">Gráficos de Proyección</h3>
          <div style={{
            height: '200px', 
            background: 'linear-gradient(to top right, transparent 49%, var(--border-color) 50%, transparent 51%)',
            borderLeft: '2px solid var(--text-secondary)',
            borderBottom: '2px solid var(--text-secondary)',
            position: 'relative',
            marginBottom: '1rem'
          }}>
            <div style={{position: 'absolute', bottom: '20%', left: '0', width: '100%', borderTop: '2px dashed #ef4444'}}></div>
            <div style={{position: 'absolute', bottom: '0', left: '0', width: '100%', height: '100%', overflow: 'hidden'}}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,100 Q30,80 50,50 T100,10" fill="none" stroke="#10b981" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-secondary text-center">ROI y Crecimiento (Referencial)</p>
        </div>
      </div>
    </div>
  );
}
