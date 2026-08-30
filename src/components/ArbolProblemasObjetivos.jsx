import { useState } from 'react';
import { Target, AlertTriangle, GitBranch, ArrowUp, ArrowDown } from 'lucide-react';
import MermaidViewer from './MermaidViewer';

/**
 * Widget Visual e Interactivo para Metodologías Social BID y ZOPP:
 * Renderiza el Árbol de Problemas (Causas -> Problema Central -> Efectos)
 * y el Árbol de Objetivos (Medios -> Objetivo Central -> Fines).
 */
export default function ArbolProblemasObjetivos({
  problemaCentral = 'Dificultad de acceso a servicios y baja productividad',
  causas = [
    'Falta de infraestructura tecnológica adecuada',
    'Procesos manuales y poco estandarizados',
    'Capacitación insuficiente del personal'
  ],
  efectos = [
    'Pérdida de competitividad en el mercado',
    'Baja satisfacción de los beneficiarios/clientes',
    'Altos costos operativos'
  ],
  objetivoCentral = 'Modernizar y optimizar la prestación del servicio mediante tecnología',
  medios = [
    'Implementación de infraestructura digital',
    'Estandarización y automatización de procesos',
    'Programa continuo de capacitación'
  ],
  fines = [
    'Incremento significativo de la competitividad',
    'Alta satisfacción y retención de beneficiarios',
    'Sostenibilidad y eficiencia de costos'
  ]
}) {
  const [viewMode, setViewMode] = useState('problemas'); // 'problemas' | 'objetivos'

  const currentCentral = viewMode === 'problemas' ? problemaCentral : objetivoCentral;
  const currentBottom = viewMode === 'problemas' ? causas : medios;
  const currentTop = viewMode === 'problemas' ? efectos : fines;

  const bottomLabel = viewMode === 'problemas' ? 'Causas Raíz (Orígenes)' : 'Medios Fundamentales (Soluciones)';
  const topLabel = viewMode === 'problemas' ? 'Efectos Directos (Consecuencias)' : 'Fines de Impacto (Resultados)';

  // Generar código Mermaid dinámico
  const mermaidCode = `graph TD
  subgraph ${viewMode === 'problemas' ? 'Árbol de Problemas (Causa-Efecto)' : 'Árbol de Objetivos (Medios-Fines)'}
    C["${viewMode === 'problemas' ? '🎯 PROBLEMA CENTRAL' : '🌟 OBJETIVO CENTRAL'}: ${currentCentral.replace(/"/g, "'")}"]
    ${currentBottom.map((b, i) => `B${i}["${viewMode === 'problemas' ? '⚠️ Causa' : '🛠️ Medio'} ${i + 1}: ${b.replace(/"/g, "'")}"] --> C`).join('\n    ')}
    ${currentTop.map((t, i) => `C --> T${i}["${viewMode === 'problemas' ? '💥 Efecto' : '🏆 Fin'} ${i + 1}: ${t.replace(/"/g, "'")}"]`).join('\n    ')}
  end
  classDef central fill:#6366f1,stroke:#4f46e5,color:#fff,font-weight:bold;
  classDef bottom fill:#1e293b,stroke:#0284c7,color:#e2e8f0;
  classDef top fill:#1e293b,stroke:#ec4899,color:#e2e8f0;
  class C central;
  class ${currentBottom.map((_, i) => `B${i}`).join(',')} bottom;
  class ${currentTop.map((_, i) => `T${i}`).join(',')} top;`;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Selector de Modo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GitBranch className="w-5 h-5 text-accent" />
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Estructura Lógica de Causalidad (Social BID / ZOPP)
          </h3>
        </div>

        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setViewMode('problemas')}
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'problemas' ? '#ef4444' : 'transparent',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertTriangle className="w-4 h-4" />
            Árbol de Problemas
          </button>
          <button
            type="button"
            onClick={() => setViewMode('objetivos')}
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'objetivos' ? '#10b981' : 'transparent',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Target className="w-4 h-4" />
            Árbol de Objetivos
          </button>
        </div>
      </div>

      {/* Visualización en Tarjetas Jerárquicas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Nivel Superior: Efectos / Fines */}
        <div style={{ background: 'rgba(236, 72, 153, 0.05)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#f472b6', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <ArrowUp className="w-4 h-4" />
            {topLabel}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {currentTop.map((item, idx) => (
              <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #ec4899', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Nivel Central: Problema u Objetivo Central */}
        <div style={{
          background: viewMode === 'problemas' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.05) 100%)' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)',
          border: viewMode === 'problemas' ? '2px solid rgba(239, 68, 68, 0.4)' : '2px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: viewMode === 'problemas' ? '#f87171' : '#34d399', marginBottom: '0.35rem' }}>
            {viewMode === 'problemas' ? '🎯 Problema Central Focal' : '🌟 Objetivo Estratégico Central'}
          </div>
          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {currentCentral}
          </h4>
        </div>

        {/* Nivel Inferior: Causas / Medios */}
        <div style={{ background: 'rgba(2, 132, 199, 0.05)', border: '1px solid rgba(2, 132, 199, 0.2)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <ArrowDown className="w-4 h-4" />
            {bottomLabel}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {currentBottom.map((item, idx) => (
              <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #0284c7', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Renderizado de Diagrama Mermaid */}
      <div style={{ marginTop: '1rem' }}>
        <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Diagrama de Conexiones Lógicas:
        </h5>
        <MermaidViewer chart={mermaidCode} />
      </div>
    </div>
  );
}
