import { useState } from 'react';
import { Building2, FileCheck, GitCommit, MapPin, Scale, Sparkles, Target } from 'lucide-react';
import DecisionFlow from './DecisionFlow';
import PlantFloorplan from './PlantFloorplan';
import MermaidViewer from './MermaidViewer';
import { isVcvProject } from '../lib/projectIsolation';

const formatCurrency = (value) => Number(value || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

function EmptyState({ message, href }) {
  return (
    <div style={{ padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '10px', background: '#f8fafc', color: '#64748b', fontSize: '0.85rem' }}>
      {message} {href && <a href={href} style={{ color: 'var(--accent-color, #4f46e5)', fontWeight: 700 }}>Completar módulo</a>}
    </div>
  );
}

function PhaseCard({ phase, fallbackTitle }) {
  if (!phase || Object.keys(phase).length === 0) return null;
  const amount = phase.monto_requerido ?? phase.monto_requerido_serie_a ?? phase.monto;
  const details = [
    phase.capacidad_mensual_kg && `Capacidad: ${Number(phase.capacidad_mensual_kg).toLocaleString('es-MX')} kg/mes`,
    phase.mercado && `Mercado: ${phase.mercado}`,
    phase.normatividad && `Normatividad: ${phase.normatividad}`,
    phase.requerimientos && `Requerimientos: ${phase.requerimientos}`,
    phase.horizonte_meses && `Horizonte: ${phase.horizonte_meses} meses`
  ].filter(Boolean);

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem' }}>
      <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{phase.nombre || phase.titulo || fallbackTitle}</strong>
      {amount !== undefined && <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e3a8a', margin: '0.35rem 0' }}>{formatCurrency(amount)}</div>}
      {details.length > 0 && <ul style={{ margin: 0, paddingLeft: '1rem', color: '#475569', fontSize: '0.78rem', lineHeight: 1.45 }}>{details.map((detail) => <li key={detail}>{detail}</li>)}</ul>}
    </div>
  );
}

export default function ExecutiveSummarySection({ planData, scope = 'executive' }) {
  const [showRawMermaid, setShowRawMermaid] = useState(false);
  const resumen = planData?.resumen_ejecutivo || {};
  const dictamen = resumen.dictamen_viabilidad || {};
  const permisos = Array.isArray(resumen.permisos_regulatorios) ? resumen.permisos_regulatorios : [];
  const competidores = Array.isArray(resumen.competidores_multinivel) ? resumen.competidores_multinivel : (Array.isArray(resumen.muestra_competencia_inegi) ? resumen.muestra_competencia_inegi : []);
  const kpis = Array.isArray(resumen.kpis_gate_transicion) ? resumen.kpis_gate_transicion : [];
  const hasRoadmap = Boolean(resumen.flowchart_escalamiento_cuantico || dictamen.fase1 || dictamen.fase2);
  const showPlant = Boolean((resumen.planta || isVcvProject(planData)) && scope !== 'executive');
  const hasContent = Boolean(resumen.elevator_pitch || dictamen.conclusion_ejecutiva || dictamen.veredicto || permisos.length || competidores.length || kpis.length || hasRoadmap);

  if (!hasContent) {
    return <EmptyState message="Todavía no hay datos ejecutivos para este proyecto." href="#seccion-resumen-ejecutivo" />;
  }

  const isExecutive = scope === 'executive';

  return (
    <div style={{ width: '100%', color: '#1e293b', fontFamily: 'var(--font-body, system-ui, sans-serif)' }}>
      <div style={{ marginBottom: isExecutive ? '0.5rem' : '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.35rem' }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--accent-color, #4f46e5)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resumen de dirección</span>
        <h2 style={{ margin: '0.15rem 0', fontSize: isExecutive ? '1.2rem' : '1.4rem', color: '#0f172a' }}>Viabilidad y prioridades</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.78rem' }}>Información consolidada exclusivamente desde los datos canónicos de este proyecto.</p>
      </div>

      {resumen.elevator_pitch && (
        <section style={{ background: '#1e1b4b', color: '#fff', borderRadius: '10px', padding: isExecutive ? '0.65rem 0.85rem' : '1rem', marginBottom: isExecutive ? '0.5rem' : '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c7d2fe', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}><Sparkles size={13} /> Elevator pitch</div>
          {typeof resumen.elevator_pitch === 'string' ? <p style={{ margin: '0.25rem 0 0', lineHeight: 1.4, fontSize: '0.8rem' }}>&ldquo;{resumen.elevator_pitch}&rdquo;</p> : (
            <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1rem', lineHeight: 1.38, fontSize: '0.78rem' }}>
              {Object.entries(resumen.elevator_pitch).map(([key, value]) => value ? <li key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {String(value)}</li> : null)}
            </ul>
          )}
        </section>
      )}

      {(dictamen.conclusion_ejecutiva || dictamen.veredicto || dictamen.fase1 || dictamen.fase2) && (
        <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: isExecutive ? '0.65rem 0.85rem' : '1rem', marginBottom: isExecutive ? '0.5rem' : '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}><Scale size={15} color="#b45309" /><h3 style={{ margin: 0, fontSize: '0.88rem' }}>Dictamen de viabilidad</h3></div>
          {dictamen.veredicto && <span style={{ display: 'inline-block', marginTop: '0.25rem', padding: '0.12rem 0.4rem', borderRadius: '999px', background: '#fef3c7', color: '#92400e', fontSize: '0.65rem', fontWeight: 800 }}>{dictamen.veredicto}</span>}
          {dictamen.conclusion_ejecutiva && <p style={{ color: '#475569', lineHeight: 1.4, fontSize: '0.78rem', margin: '0.25rem 0' }}>{dictamen.conclusion_ejecutiva}</p>}
          {!isExecutive && (dictamen.fase1 || dictamen.fase2) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
              <PhaseCard phase={dictamen.fase1} fallbackTitle="Fase 1" />
              <PhaseCard phase={dictamen.fase2} fallbackTitle="Fase 2" />
            </div>
          )}
        </section>
      )}

      {hasRoadmap && (
        <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: isExecutive ? '0.65rem 0.85rem' : '1rem', marginBottom: isExecutive ? '0.5rem' : '0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.88rem' }}><GitCommit size={15} style={{ verticalAlign: 'text-bottom' }} /> Roadmap de fases y compuertas de decisión</h3>
            {!isExecutive && resumen.flowchart_escalamiento_cuantico && (
              <button type="button" onClick={() => setShowRawMermaid((value) => !value)} style={{ fontSize: '0.75rem', cursor: 'pointer' }}>
                {showRawMermaid ? 'Ocultar diagrama' : 'Ver diagrama'}
              </button>
            )}
          </div>
          <DecisionFlow phases={[dictamen.fase1, dictamen.fase2].filter(Boolean)} isCompact={isExecutive} />
          {!isExecutive && showRawMermaid && <div style={{ marginTop: '1rem' }}><MermaidViewer chart={resumen.flowchart_escalamiento_cuantico} /></div>}
          {kpis.length > 0 && (
            <div style={{ marginTop: '0.4rem' }}>
              <strong style={{ fontSize: '0.74rem', color: '#0f172a' }}><Target size={13} style={{ verticalAlign: 'text-bottom' }} /> Indicadores clave de transición (Gates)</strong>
              <ul style={{ margin: '0.2rem 0 0', paddingLeft: '1rem', color: '#475569', fontSize: '0.73rem', lineHeight: 1.35 }}>
                {kpis.map((kpi, index) => <li key={index}><strong>{kpi.kpi || kpi.metrica}:</strong> {kpi.meta || kpi.umbral || kpi.umbral_minimo || 'Sin umbral'}</li>)}
              </ul>
            </div>
          )}
        </section>
      )}

      {showPlant && <section style={{ marginBottom: '1rem' }}><PlantFloorplan plantName={resumen.planta?.nombre} totalAreaM2={resumen.planta?.area_m2} dimensions={resumen.planta?.dimensiones} /></section>}

      {!isExecutive && permisos.length > 0 && (
        <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '0.85rem' }}>
          <h3 style={{ marginTop: 0, fontSize: '0.95rem' }}><FileCheck size={16} style={{ verticalAlign: 'text-bottom' }} /> Permisos</h3>
          <ul style={{ margin: 0, paddingLeft: '1rem', color: '#475569', fontSize: '0.8rem' }}>{permisos.map((item, index) => <li key={index}>{item.tramite || item.permiso} {item.autoridad && `— ${item.autoridad}`}</li>)}</ul>
        </section>
      )}

      {!isExecutive && competidores.length > 0 && (
        <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
          <h3 style={{ marginTop: 0, fontSize: '0.95rem' }}><Building2 size={16} style={{ verticalAlign: 'text-bottom' }} /> Competencia analizada</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
            {competidores.slice(0, 8).map((item, index) => (
              <div key={index} style={{ background: '#f8fafc', borderRadius: '6px', padding: '0.65rem', fontSize: '0.78rem' }}>
                <strong>{item.nombre}</strong>
                <div style={{ color: '#64748b', marginTop: '0.2rem' }}>{item.actividad || item.actividad_scian}</div>
                {item.municipio && <div style={{ color: '#64748b', marginTop: '0.2rem' }}><MapPin size={12} /> {item.municipio}</div>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
