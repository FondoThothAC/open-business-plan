import React from 'react';
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
  Sparkles
} from 'lucide-react';

/**
 * Componente de Resumen Ejecutivo y Dictamen de Viabilidad Real.
 * Aplica estándares de Linda Pinson (Anatomy of a Business Plan) y metodología de Fondo Thoth AC.
 * Presenta un veredicto honesto y técnico en dos fases para comités de inversión.
 */
export default function ExecutiveSummarySection({ planData }) {
  const resumen = planData?.resumen_ejecutivo || {};
  const dictamen = resumen?.dictamen_viabilidad || {};
  const fase1 = dictamen?.fase1 || {};
  const fase2 = dictamen?.fase2 || {};
  const permisos = resumen?.permisos_regulatorios || [];
  const competidores = resumen?.muestra_competencia_inegi || [];

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

      {/* ELEVATOR PITCH (30 SEGUNDOS) */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(79, 70, 229, 0.02) 100%)',
        border: '1px solid #c7d2fe',
        borderRadius: '10px',
        padding: '1.1rem 1.25rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <Sparkles size={18} color="#4f46e5" />
          <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#312e81', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Elevator Pitch (30 Segundos)
          </h4>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.6, color: '#1e293b', fontStyle: 'italic' }}>
          "{resumen?.elevator_pitch || 'VCV Cortes Finos produce cortes de carne premium previamente cocinados al carbón con tecnología patentada en horno continuo ASADHOR y pasteurizados a -20°C. Entregamos a restaurantes (HORECA) un producto libre de mermas, que reduce el tiempo de servicio de 4 horas a 3 minutos con 90 días de vida de anaquel. Solicitamos $4,000,000 MXN para consolidar la Fase 1 regional, con un modelo de escalamiento cuántico hacia exportación.'}"
        </p>
      </div>

      {/* DICTAMEN DE VIABILIDAD PARA INVERSIONISTAS (TARJETA MAESTRA) */}
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid #e2e8f0', 
        borderRadius: '12px', 
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
        padding: '1.25rem',
        marginBottom: '1.75rem',
        pageBreakInside: 'avoid'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Scale size={22} color="#059669" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Dictamen Oficial de Viabilidad Técnico-Financiera
            </h3>
          </div>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            background: '#ecfdf5', 
            border: '1px solid #a7f3d0', 
            color: '#065f46', 
            fontWeight: 800, 
            fontSize: '0.78rem', 
            padding: '0.35rem 0.75rem', 
            borderRadius: '9999px',
            letterSpacing: '0.03em'
          }}>
            <ShieldCheck size={16} />
            {dictamen?.veredicto || 'VIABLE CONDICIONADO A ESTRATEGIA EN DOS FASES'}
          </div>
        </div>

        <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.55, margin: '0 0 1.25rem 0' }}>
          {dictamen?.conclusion_ejecutiva || 'El proyecto es altamente viable, rentable y escalable en su mercado regional y nacional B2B bajo normativa COFEPRIS / NOM-251 con el capital solicitado de $4,000,000 MXN. Sin embargo, se dictamina INVIABLE pretender exportar directamente a EE.UU. con este monto inicial, dado que las regulaciones federales (SENASICA TIF, USDA/FSIS, FDA) exigen una infraestructura con CAPEX de $18M a $25M MXN. Se recomienda formalmente a los inversionistas autorizar la Fase 1 como prueba de tracción y financiar la Fase 2 tras alcanzar el punto de equilibrio operativo.'}
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

          {/* FASE 2: EXPORTACIÓN */}
          <div style={{ 
            background: '#fffbeb', 
            border: '1px solid #fde68a', 
            borderRadius: '8px', 
            padding: '1rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
                Fase 2: Exportación EE.UU.
              </span>
              <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                REQUIERE SERIE A
              </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#78350f', marginBottom: '0.5rem' }}>
              $20,000,000 MXN
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#92400e', lineHeight: 1.5 }}>
              <li><strong>Capacidad:</strong> 25.5 toneladas/mes (Línea continua de 5 hornos ASADHOR).</li>
              <li><strong>Mercado:</strong> Cadenas de distribución en Arizona y California.</li>
              <li><strong>Normativa:</strong> Planta Tipo Inspección Federal (TIF), auditoría USDA/FSIS y registro FDA.</li>
              <li><strong>Brecha detectada:</strong> Inviable exportar con solo $4M MXN; requiere levantar capital institucional tras validar tracción.</li>
              <li><strong>Estrategia:</strong> Postular a fondos FIRA-Bancomext y Venture Capital en mes 14.</li>
            </ul>
          </div>
        </div>
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

      {/* ANÁLISIS DE COMPETENCIA REAL CON DATOS DE INEGI DENUE */}
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
              Validación de Competencia Real (INEGI DENUE — Hermosillo)
            </h4>
          </div>
          <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
            API Oficial INEGI • 198 registros censados
          </span>
        </div>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.82rem', color: '#64748b' }}>
          Muestra de competidores mayoristas y minoristas registrados en el Directorio Estadístico Nacional de Unidades Económicas (DENUE). Se constata que la oferta existente comercializa carne cruda tradicional, existiendo un <strong>océano azul</strong> para cortes precocinados y pasteurizados para restaurantes.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem' }}>
          {competidores.slice(0, 6).map((comp, idx) => (
            <div key={idx} style={{ 
              background: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              padding: '0.75rem 0.9rem',
              fontSize: '0.8rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>{comp.nombre}</span>
                <span style={{ fontSize: '0.68rem', background: '#e2e8f0', color: '#475569', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>
                  Folio {comp.id_denue}
                </span>
              </div>
              <div style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                <strong>Giro:</strong> {comp.actividad_scian} • <strong>Estrato:</strong> {comp.estrato_personal}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.72rem', marginBottom: '0.45rem' }}>
                <MapPin size={12} />
                <span>{comp.direccion}</span>
              </div>
              <div style={{ 
                background: '#ffffff', 
                borderLeft: '3px solid var(--accent-color, #6366f1)', 
                padding: '0.35rem 0.5rem', 
                fontSize: '0.74rem', 
                color: '#1e293b' 
              }}>
                <strong>Diferenciador VCV:</strong> {comp.posicionamiento_vcv}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
