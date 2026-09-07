import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Building2, 
  Award, 
  MapPin, 
  Layers, 
  FileCheck, 
  DollarSign, 
  Scale,
  Sparkles,
  GitCommit,
  ExternalLink,
  Target,
  Code
} from 'lucide-react';
import DecisionFlow from './DecisionFlow';
import PlantFloorplan from './PlantFloorplan';
import MermaidViewer from './MermaidViewer';

/**
 * Componente de Resumen Ejecutivo, Dictamen de Viabilidad Real y Flowchart de Escalamiento Cuántico.
 * Aplica estándares de Linda Pinson (Anatomy of a Business Plan) y metodología de Fondo Thoth AC.
 * Presenta un veredicto honesto y técnico en dos fases para comités de inversión con KPIs Gate.
 */
export default function ExecutiveSummarySection({ planData }) {
  const [showRawMermaid, setShowRawMermaid] = useState(false);
  const resumen = planData?.resumen_ejecutivo || {};
  const dictamen = resumen?.dictamen_viabilidad || {};
  const fase1 = dictamen?.fase1 || {};
  const fase2 = dictamen?.fase2 || {};
  const permisos = resumen?.permisos_regulatorios || [];
  const competidores = resumen?.competidores_multinivel || resumen?.muestra_competencia_inegi || [];
  const kpisGate = resumen?.kpis_gate_transicion || [];

  const defaultFlowchart = `flowchart TD
  classDef fase1 fill:#ecfdf5,stroke:#10b981,stroke-width:2px,color:#065f46;
  classDef gate fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,color:#1e3a8a;
  classDef fase2 fill:#fffbeb,stroke:#f59e0b,stroke-width:2px,color:#78350f;
  classDef accion fill:#f8fafc,stroke:#94a3b8,stroke-width:1px,color:#1e293b;

  Inicio(["🚀 Inicio: ${planData?.companyName || 'VCV Cortes Finos'}"]) --> F1_Arranque["Fase 1: Taller Piloto Regional<br/><b>Presupuesto: $4,000,000 MXN</b>"]:::fase1
  
  subgraph SUB_FASE1 ["FASE 1: CONSOLIDACIÓN Y TRACCIÓN REGIONAL"]
    F1_Arranque --> F1_Ops["1 Horno ASADHOR (5.1 ton/mes)<br/>Aviso COFEPRIS & NOM-251"]:::accion
    F1_Ops --> F1_Comercial["Validación HORECA<br/>Sonora y Sinaloa"]:::accion
    F1_Comercial --> F1_Metricas["Métricas Mes 1-12:<br/>EBITDA $1.55M/mes • OTD &ge; 98%"]:::accion
  end

  F1_Metricas --> GateDecision{"🚦 COMPUERTA DE DECISIÓN<br/>¿Se alcanzaron los KPIs Gate?"}:::gate

  GateDecision -- "❌ No alcanzado" --> F1_Optimizar["Optimización de Costos y<br/>Retención B2B en Sonora"]:::accion
  F1_Optimizar --> F1_Comercial

  GateDecision -- "✅ Metas Cumplidas<br/>(EBITDA + HACCP + LOI)" --> F2_Levantamiento["Fase 2: Desbloqueo Ronda Serie A<br/><b>$16,800,000 MXN</b> (FIRA / Bancomext / VC)"]:::gate

  subgraph SUB_FASE2 ["FASE 2: ESCALAMIENTO CUÁNTICO A EXPORTACIÓN"]
    F2_Levantamiento --> F2_Construccion["Nave Industrial Certificada TIF<br/>SENASICA (NOM-008-ZOO / NOM-009-ZOO)"]:::fase2
    F2_Construccion --> F2_USDA["Auditoría Bilateral USDA / FSIS<br/>& Registro FDA de Alimentos"]:::fase2
    F2_USDA --> F2_Maquinaria["Línea Continua 5 Hornos ASADHOR<br/>+ Túnel Criogénico IQF (-40°C)"]:::fase2
    F2_Maquinaria --> F2_Export["Despacho Binacional vía VUCEM<br/>Arizona y California"]:::fase2
  end

  F2_Export --> MetaGlobal(["⭐ Consolidación como Proveedor Internacional"]):::fase2`;

  const flowchartMermaid = resumen?.flowchart_escalamiento_cuantico || defaultFlowchart;

  return (
    <div style={{ width: '100%', color: '#1e293b', fontFamily: 'var(--font-body, system-ui, sans-serif)' }}>
      {/* TÍTULO Y PRESENTACIÓN EJECUTIVA */}
      <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 800, 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em', 
            color: 'var(--accent-color, #6366f1)',
            background: 'rgba(99, 102, 241, 0.08)',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px'
          }}>
            Alta Dirección & Comités de Inversión
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            Metodología: Linda Pinson & Empresas Cuánticas
          </span>
        </div>
        <h2 style={{ 
          fontSize: '1.65rem', 
          fontWeight: 900, 
          color: '#0f172a', 
          margin: '0.5rem 0 0.25rem 0',
          fontFamily: 'var(--font-display, inherit)',
          letterSpacing: '-0.02em'
        }}>
          Resumen Ejecutivo & Dictamen de Viabilidad Real
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
          Evaluación técnica, regulatoria y financiera independiente. Análisis de factibilidad comercial basado en datos censales de <strong>INEGI DENUE</strong> y normativas oficiales de exportación cárnica (<strong>SENASICA / USDA</strong>).
        </p>
      </div>

      {/* ELEVATOR PITCH EJECUTIVO */}
      {resumen?.elevator_pitch && (
        <div style={{ 
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', 
          color: '#ffffff', 
          borderRadius: '12px', 
          padding: '1.25rem 1.5rem', 
          marginBottom: '1.75rem',
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Sparkles size={18} color="#a5b4fc" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c7d2fe' }}>
              Elevator Pitch (30 Segundos — Carl Schramm)
            </span>
          </div>
          <p style={{ fontSize: '1.02rem', fontStyle: 'italic', lineHeight: 1.6, margin: 0, color: '#f8fafc' }}>
            &ldquo;{resumen.elevator_pitch}&rdquo;
          </p>
        </div>
      )}

      {/* DICTAMEN DE VIABILIDAD HONESTO */}
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid #e2e8f0', 
        borderRadius: '12px', 
        padding: '1.25rem',
        marginBottom: '1.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={20} color="#b45309" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Dictamen de Factibilidad y Estrategia en Dos Fases
            </h3>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            padding: '0.3rem 0.75rem', 
            background: '#fef3c7', 
            border: '1px solid #fde68a',
            borderRadius: '9999px',
            color: '#92400e',
            fontWeight: 800,
            fontSize: '0.75rem',
            letterSpacing: '0.03em'
          }}>
            <ShieldCheck size={16} />
            {dictamen?.veredicto || 'VIABLE CONDICIONADO A ESTRATEGIA EN DOS FASES'}
          </div>
        </div>

        <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.55, margin: '0 0 1.25rem 0' }}>
          {dictamen?.conclusion_ejecutiva || 'El proyecto es altamente viable, rentable y escalable en su mercado regional y nacional B2B bajo normativa COFEPRIS / NOM-251 con el capital solicitado de $4,000,000 MXN. Sin embargo, se dictamina INVIABLE pretender exportar directamente a EE.UU. con este monto inicial, dado que las regulaciones federales (SENASICA TIF, USDA/FSIS, FDA) exigen una infraestructura con CAPEX de $16.8M MXN calibrado. Se recomienda formalmente a los inversionistas autorizar la Fase 1 como prueba de tracción y financiar la Fase 2 tras alcanzar el punto de equilibrio operativo.'}
        </p>

        {/* COMPARATIVA DE DOS FASES: LOCAL VS EXPORTACIÓN */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* FASE 1: REGIONAL */}
          <div style={{ 
            background: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: '8px', 
            padding: '1rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                Fase 1: Mercado Regional B2B
              </span>
              <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                100% VIABLE
              </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#14532d', marginBottom: '0.5rem' }}>
              $4,000,000 MXN
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#166534', lineHeight: 1.5 }}>
              <li><strong>Capacidad:</strong> 5.1 toneladas/mes (1 horno ASADHOR).</li>
              <li><strong>Mercado:</strong> Restaurantes y hoteles (HORECA) en Sonora y Sinaloa.</li>
              <li><strong>Normativa:</strong> Aviso COFEPRIS y NOM-251-SSA1-2009 (Coste de licencias &lt; $50k MXN).</li>
              <li><strong>Rendimiento:</strong> EBITDA mes 12 de $1,553,952 MXN mensuales (Margen 31.1%).</li>
              <li><strong>Riesgo:</strong> Bajo / Validación inmediata de producto en mercado gastronómico local.</li>
            </ul>
          </div>

          {/* FASE 2: EXPORTACIÓN CALIBRADA A $16.8M */}
          <div style={{ 
            background: '#fffbeb', 
            border: '1px solid #fde68a', 
            borderRadius: '8px', 
            padding: '1rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
                Fase 2: Exportación EE.UU. (Serie A)
              </span>
              <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                REQUIERE SERIE A
              </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#78350f', marginBottom: '0.5rem' }}>
              $16,800,000 MXN
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#92400e', lineHeight: 1.5 }}>
              <li><strong>Capacidad:</strong> 25.5 toneladas/mes (Línea continua de 5 hornos ASADHOR).</li>
              <li><strong>Mercado:</strong> Cadenas de distribución en Arizona y California.</li>
              <li><strong>Normativa:</strong> Planta Tipo Inspección Federal (TIF), auditoría USDA/FSIS y registro FDA.</li>
              <li><strong>Desglose de Inversión Calibrado ($16.8M):</strong></li>
              <ul style={{ margin: '3px 0', paddingLeft: '1rem', fontSize: '0.76rem', color: '#78350f', lineHeight: 1.4 }}>
                <li>• <strong>$6,500,000</strong> — Nave TIF (obra civil y áreas sanitarias NOM-008-ZOO / SENASICA)</li>
                <li>• <strong>$3,750,000</strong> — 5 hornos industriales continuos ASADHOR</li>
                <li>• <strong>$2,800,000</strong> — Túnel criogénico de congelación ultrarrápida IQF (-40°C)</li>
                <li>• <strong>$1,450,000</strong> — Cuartos fríos (-20°C) y líneas de empaque al alto vacío</li>
                <li>• <strong>$2,300,000</strong> — Capital de trabajo operativo inicial Serie A</li>
              </ul>
              <li><strong>Estrategia:</strong> Postular a fondos FIRA-Bancomext y Venture Capital en mes 14 tras validar tracción.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ROADMAP DE ESCALAMIENTO CUÁNTICO & COMPUERTAS DE DECISIÓN (REACT FLOW NATIVO) */}
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid #e2e8f0', 
        borderRadius: '12px', 
        padding: '1.25rem',
        marginBottom: '1.75rem',
        pageBreakInside: 'avoid'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitCommit size={20} color="var(--accent-color, #6366f1)" />
            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Roadmap de Escalamiento Cuántico: Fase 1 &rarr; Gate KPIs &rarr; Fase 2
            </h4>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowRawMermaid(!showRawMermaid)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.72rem',
                background: showRawMermaid ? '#e2e8f0' : '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#475569',
                fontWeight: 600
              }}
            >
              <Code size={13} />
              {showRawMermaid ? 'Ocultar Mermaid' : 'Ver Código Mermaid'}
            </button>
            <span style={{ fontSize: '0.74rem', background: '#eff6ff', color: '#1e40af', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 700 }}>
              React Flow Interactivo
            </span>
          </div>
        </div>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.83rem', color: '#64748b' }}>
          Ruta crítica de avance técnico y financiero con compuertas auditables. Para desbloquear la Ronda Serie A de exportación (<strong>$16,800,000 MXN</strong>), el proyecto debe superar obligatoriamente los hitos de tracción y validación sanitaria en Fase 1.
        </p>

        {/* MOTOR REACT FLOW NATIVO */}
        <div style={{ marginBottom: '1.25rem' }}>
          <DecisionFlow companyName={planData?.companyName} />
        </div>

        {/* VISTA MERMAID ALTERNATIVA / ACCORDION */}
        {showRawMermaid && (
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', overflowX: 'auto' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>
              Representación en sintaxis Mermaid Markdown:
            </div>
            <MermaidViewer chart={flowchartMermaid} />
          </div>
        )}

        {/* TABLA DE COMPUERTAS DE DECISIÓN (KPIS GATE) */}
        {kpisGate.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Target size={16} color="#4338ca" />
              <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#1e1b4b', textTransform: 'uppercase' }}>
                Matriz de Validación Cuantitativa (Compuertas de Desbloqueo Serie A)
              </h5>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Métrica Clave</th>
                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Umbral Mínimo Requerido</th>
                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Periodo de Evaluación</th>
                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Justificación para Inversionistas</th>
                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'center', fontWeight: 700, color: '#334155' }}>Condición</th>
                  </tr>
                </thead>
                <tbody>
                  {kpisGate.map((kg, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.5rem 0.65rem', fontWeight: 600, color: '#0f172a' }}>{kg.kpi || kg.metrica}</td>
                      <td style={{ padding: '0.5rem 0.65rem', color: '#166534', fontWeight: 700 }}>{kg.umbral || kg.umbral_minimo}</td>
                      <td style={{ padding: '0.5rem 0.65rem', color: '#475569' }}>{kg.periodo || kg.periodo_evaluacion}</td>
                      <td style={{ padding: '0.5rem 0.65rem', color: '#64748b', fontSize: '0.74rem' }}>{kg.justificacion}</td>
                      <td style={{ padding: '0.5rem 0.65rem', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '0.68rem', 
                          fontWeight: 800, 
                          padding: '0.15rem 0.4rem', 
                          borderRadius: '3px',
                          background: kg.bloqueante ? '#fee2e2' : '#fef3c7',
                          color: kg.bloqueante ? '#991b1b' : '#92400e'
                        }}>
                          {kg.bloqueante ? 'BLOQUEANTE' : 'AUDITABLE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* PLANO Y METROLOGÍA DE PLANTA TIF (SVG NATIVO + CSS GRID) */}
      <div style={{ marginBottom: '1.75rem', pageBreakInside: 'avoid' }}>
        <PlantFloorplan 
          plantName={`Distribución de Planta TIF — ${planData?.companyName || 'VCV Cortes Finos'} (1,200 m²)`}
          totalAreaM2={1200}
          dimensions="40.0 m × 30.0 m"
        />
      </div>

      {/* MATRIZ DE PERMISOS REGULATORIOS Y COSTOS OFICIALES */}
      <div style={{ 
        background: '#f8fafc', 
        border: '1px solid #e2e8f0', 
        borderRadius: '10px', 
        padding: '1.25rem',
        marginBottom: '1.75rem',
        pageBreakInside: 'avoid'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <FileCheck size={18} color="var(--accent-color, #6366f1)" />
          <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Ruta Crítica de Permisos y Regulaciones Sanitarias
          </h4>
        </div>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.82rem', color: '#64748b' }}>
          Costeo y cronograma regulatorio oficial para transitar de la operación local (COFEPRIS) a la exportación binacional (SENASICA / USDA).
        </p>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', background: '#ffffff', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '0.55rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Trámite / Permiso</th>
                <th style={{ padding: '0.55rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Autoridad</th>
                <th style={{ padding: '0.55rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Marco Normativo</th>
                <th style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Costo Aprox.</th>
                <th style={{ padding: '0.55rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#334155' }}>Tiempo</th>
                <th style={{ padding: '0.55rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#334155' }}>Etapa</th>
              </tr>
            </thead>
            <tbody>
              {permisos.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>{p.permiso}</td>
                  <td style={{ padding: '0.55rem 0.75rem', color: '#475569' }}>{p.autoridad}</td>
                  <td style={{ padding: '0.55rem 0.75rem', color: '#64748b', fontSize: '0.75rem' }}>{p.norma}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                    ${Number(p.costo_aprox_mxn).toLocaleString('es-MX')} MXN
                  </td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', color: '#475569' }}>{p.tiempo_estimado}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center' }}>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 700, 
                      padding: '0.15rem 0.45rem', 
                      borderRadius: '4px',
                      background: p.fase.includes('Fase 1') ? '#dcfce7' : '#fef3c7',
                      color: p.fase.includes('Fase 1') ? '#15803d' : '#b45309'
                    }}>
                      {p.fase}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ANÁLISIS DE COMPETENCIA MULTINIVEL & CLASIFICACIÓN ESTRATÉGICA */}
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid #e2e8f0', 
        borderRadius: '10px', 
        padding: '1.25rem',
        marginBottom: '1rem',
        pageBreakInside: 'avoid'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} color="var(--accent-color, #6366f1)" />
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Inteligencia Competitiva Multinivel (Local INEGI • Nacional • Internacional)
            </h4>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.68rem', background: '#fee2e2', color: '#991b1b', padding: '0.15rem 0.45rem', borderRadius: '3px', fontWeight: 700 }}>
              🔴 Amenaza Directa
            </span>
            <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#166534', padding: '0.15rem 0.45rem', borderRadius: '3px', fontWeight: 700 }}>
              🟢 Oportunidad / Alianza
            </span>
            <span style={{ fontSize: '0.68rem', background: '#fef3c7', color: '#92400e', padding: '0.15rem 0.45rem', borderRadius: '3px', fontWeight: 700 }}>
              🟡 Sustituto Indirecto
            </span>
          </div>
        </div>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.82rem', color: '#64748b' }}>
          Censo de competidores locales (DENUE), líderes nacionales y operadores binacionales en EE.UU., clasificados estratégicamente para identificar riesgos comerciales y oportunidades de maquila o alianza.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem' }}>
          {competidores.slice(0, 8).map((comp, idx) => {
            const esAmenaza = comp.categoria_estrategica === 'AMENAZA_DIRECTA';
            const esOportunidad = comp.categoria_estrategica === 'OPORTUNIDAD_ALIANZA';
            const badgeBg = esAmenaza ? '#fee2e2' : (esOportunidad ? '#dcfce7' : '#fef3c7');
            const badgeColor = esAmenaza ? '#991b1b' : (esOportunidad ? '#166534' : '#92400e');
            const badgeText = esAmenaza ? 'Amenaza Directa' : (esOportunidad ? 'Oportunidad / Alianza' : 'Sustituto Indirecto');

            return (
              <div key={idx} style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                padding: '0.85rem',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>{comp.nombre}</span>
                  <span style={{ fontSize: '0.66rem', background: badgeBg, color: badgeColor, padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 800 }}>
                    {badgeText}
                  </span>
                </div>
                <div style={{ color: '#475569', fontSize: '0.74rem', marginBottom: '0.35rem' }}>
                  <strong>Alcance:</strong> {comp.municipio || 'Hermosillo, Sonora'} • <strong>Giro:</strong> {comp.actividad || comp.actividad_scian}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.71rem', marginBottom: '0.45rem' }}>
                  <MapPin size={12} />
                  <span>{comp.direccion}</span>
                </div>
                <div style={{ 
                  background: '#ffffff', 
                  borderLeft: `3px solid ${comp.color || 'var(--accent-color, #6366f1)'}`, 
                  padding: '0.4rem 0.55rem', 
                  fontSize: '0.73rem', 
                  color: '#1e293b',
                  borderRadius: '0 4px 4px 0'
                }}>
                  <strong>Estrategia VCV:</strong> {comp.estrategia_frente_a_competidor || comp.posicionamiento_vcv || 'Competidor tradicional de mostrador.'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
