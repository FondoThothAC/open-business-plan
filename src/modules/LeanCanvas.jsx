import React from 'react';
import { usePlan } from '../context/PlanContext';
import { Brain, Sparkles, HelpCircle } from 'lucide-react';
import { generateModuleContent } from '../lib/ai';

const CanvasBox = ({ title, description, content, onAiFill, loading }) => (
  <div className="canvas-box glass-panel" style={{ 
    padding: '1.25rem', 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    border: '1px solid rgba(255,255,255,0.05)',
    position: 'relative'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
      <h3 style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-color)', letterSpacing: '0.05em' }}>
        {title}
      </h3>
      <button 
        onClick={onAiFill}
        disabled={loading}
        className="icon-btn" 
        title="Generar con IA"
        style={{ color: 'var(--text-secondary)', padding: '2px' }}
      >
        {loading ? <div className="animate-spin">🌀</div> : <Sparkles className="w-3.5 h-3.5" />}
      </button>
    </div>
    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: '1.3' }}>
      {description}
    </div>
    <div style={{ 
      flex: 1, 
      fontSize: '0.85rem', 
      color: 'var(--text-primary)', 
      whiteSpace: 'pre-wrap',
      overflowY: 'auto'
    }}>
      {content || <em style={{ opacity: 0.3 }}>Sin completar...</em>}
    </div>
  </div>
);

export default function LeanCanvas() {
  const { planData, updateSection, autoFillProject } = usePlan();
  const [loadingBox, setLoadingBox] = React.useState(null);

  const canvasData = planData.lean_canvas || {};

  const handleAiFill = async (boxKey, title) => {
    setLoadingBox(boxKey);
    try {
      const result = await generateModuleContent(planData.config.ai, {
        title: `Lean Canvas: ${title}`,
        description: `Generación estratégica para el bloque ${title} del Lean Startup Canvas.`,
        fields: [{ key: boxKey }]
      }, planData);
      
      if (result && result[boxKey]) {
        updateSection('lean_canvas', boxKey, '', result[boxKey]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingBox(null);
    }
  };

  return (
    <div className="module-view" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="view-header">
        <div>
          <h1 className="view-title">Lean Startup Canvas</h1>
          <p className="text-secondary mt-1">Valida tu modelo de negocio en una sola página visual.</p>
        </div>
        <button 
          className="btn btn-ia"
          onClick={() => autoFillProject(generateModuleContent, 'lean_canvas')}
        >
          <Brain className="w-4 h-4" />
          <span>Industrializar Canvas</span>
        </button>
      </div>

      <div className="canvas-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridTemplateRows: 'repeat(2, 350px) 200px',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        {/* Row 1 & 2 Span */}
        <div style={{ gridColumn: '1', gridRow: '1 / 3' }}>
          <CanvasBox 
            title="1. Problema" 
            description="Enumera los 3 problemas principales de tus clientes." 
            content={canvasData.problem}
            loading={loadingBox === 'problem'}
            onAiFill={() => handleAiFill('problem', 'Problema')}
          />
        </div>

        <div style={{ gridColumn: '2', gridRow: '1' }}>
          <CanvasBox 
            title="4. Solución" 
            description="Define las características clave para resolver el problema." 
            content={canvasData.solution}
            loading={loadingBox === 'solution'}
            onAiFill={() => handleAiFill('solution', 'Solución')}
          />
        </div>

        <div style={{ gridColumn: '3', gridRow: '1 / 3' }}>
          <CanvasBox 
            title="3. Propuesta de Valor" 
            description="Mensaje único y claro que explica por qué eres diferente." 
            content={canvasData.value_prop}
            loading={loadingBox === 'value_prop'}
            onAiFill={() => handleAiFill('value_prop', 'Propuesta de Valor')}
          />
        </div>

        <div style={{ gridColumn: '4', gridRow: '1' }}>
          <CanvasBox 
            title="9. Ventaja Injusta" 
            description="Algo que no se puede comprar o copiar fácilmente." 
            content={canvasData.unfair_advantage}
            loading={loadingBox === 'unfair_advantage'}
            onAiFill={() => handleAiFill('unfair_advantage', 'Ventaja Injusta')}
          />
        </div>

        <div style={{ gridColumn: '5', gridRow: '1 / 3' }}>
          <CanvasBox 
            title="2. Segmentos de Clientes" 
            description="Tus clientes objetivos y los 'early adopters'." 
            content={canvasData.segments}
            loading={loadingBox === 'segments'}
            onAiFill={() => handleAiFill('segments', 'Segmentos de Clientes')}
          />
        </div>

        {/* Row 2 items */}
        <div style={{ gridColumn: '2', gridRow: '2' }}>
          <CanvasBox 
            title="8. Métricas Clave" 
            description="Actividades clave que mides." 
            content={canvasData.metrics}
            loading={loadingBox === 'metrics'}
            onAiFill={() => handleAiFill('metrics', 'Métricas Clave')}
          />
        </div>

        <div style={{ gridColumn: '4', gridRow: '2' }}>
          <CanvasBox 
            title="5. Canales" 
            description="Tu camino hacia los clientes." 
            content={canvasData.channels}
            loading={loadingBox === 'channels'}
            onAiFill={() => handleAiFill('channels', 'Canales')}
          />
        </div>

        {/* Row 3 (Bottom) */}
        <div style={{ gridColumn: '1 / 3', gridRow: '3' }}>
          <CanvasBox 
            title="7. Estructura de Costos" 
            description="Costos fijos y variables clave." 
            content={canvasData.costs}
            loading={loadingBox === 'costs'}
            onAiFill={() => handleAiFill('costs', 'Estructura de Costos')}
          />
        </div>

        <div style={{ gridColumn: '3 / 6', gridRow: '3' }}>
          <CanvasBox 
            title="6. Flujo de Ingresos" 
            description="Fuentes de ingresos y márgenes." 
            content={canvasData.revenue}
            loading={loadingBox === 'revenue'}
            onAiFill={() => handleAiFill('revenue', 'Flujo de Ingresos')}
          />
        </div>
      </div>
    </div>
  );
}
