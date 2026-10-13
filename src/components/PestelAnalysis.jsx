import React from 'react';
import { Building, DollarSign, Users, Cpu, Leaf, Scale, TrendingUp, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { safeStr } from '../utils/formatters';
import { getProvenanceBadgeConfig } from '../lib/tools/provenance';
import { selloProcedencia } from '../lib/pestelResearch';
import PestelResearchPanel from './PestelResearchPanel';
import {
  hasMatrix,
  groupByDimension,
  rankByImpact,
  summarize,
  classifyImpact,
  impactColor,
  PESTEL_SEMAFORO,
  PESTEL_UMBRALES
} from '../lib/pestelMatrix';

const DIMENSIONES = [
  { key: 'politico', label: 'Político', icon: Building, color: '#4f46e5' },
  { key: 'economico', label: 'Económico', icon: DollarSign, color: '#10b981' },
  { key: 'social', label: 'Social', icon: Users, color: '#8b5cf6' },
  { key: 'tecnologico', label: 'Tecnológico', icon: Cpu, color: '#06b6d4' },
  { key: 'ecologico', label: 'Ecológico', icon: Leaf, color: '#84cc16' },
  { key: 'legal', label: 'Legal', icon: Scale, color: '#ef4444' }
];

const hexToRgba = (hex, alpha) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

const ImpactBadge = ({ valor }) => (
  <span
    className="pestel-impact-badge"
    style={{
      background: impactColor(valor),
      color: '#ffffff',
      fontWeight: 900,
      fontSize: '0.82rem',
      padding: '0.18rem 0.5rem',
      borderRadius: '8px',
      whiteSpace: 'nowrap',
      fontVariantNumeric: 'tabular-nums'
    }}
    title={`Impacto ${Number(valor).toFixed(2)} · ${classifyImpact(valor)}`}
  >
    {Number(valor).toFixed(2)}
  </span>
);

const TipoChip = ({ oa }) => {
  const Icon = oa === 'A' ? AlertTriangle : TrendingUp;
  const color = oa === 'A' ? '#b91c1c' : '#047857';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      <Icon style={{ width: 13, height: 13 }} />
      {oa === 'A' ? 'amenaza' : 'oportunidad'}
    </span>
  );
};

/** Sello de procedencia con el mismo vocabulario visual que usa el resto de la app. */
const ProcedenciaChip = ({ factor }) => {
  // El sello puede venir guardado en el dato o calcularse aquí: la UI no debe depender
  // de que alguien haya ejecutado el inyector con --write.
  const conSello = factor.provenance ? factor : selloProcedencia(factor);
  if (!conSello.provenance) return null;
  const cfg = getProvenanceBadgeConfig({
    provenance: conSello.provenance,
    provider: conSello.provider || conSello.tipoFuente,
    warning: conSello.warning
  });
  const Icon = conSello.provenance === 'real' ? ShieldCheck : ShieldAlert;
  return (
    <span
      className="pestel-procedencia"
      title={cfg.title}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: cfg.bg, color: cfg.color, fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '999px', whiteSpace: 'nowrap' }}
    >
      <Icon style={{ width: 11, height: 11 }} />
      {conSello.tipoFuente || cfg.label}
      {Number.isFinite(conSello.confidenceScore) ? ` · ${Math.round(conSello.confidenceScore * 100)}%` : ''}
    </span>
  );
};

function PestelMatrixView({ data, onActualizar, config, empresa, giro }) {
  const matriz = data.matriz || [];
  const resumen = summarize(matriz);
  const ordenados = rankByImpact(matriz);
  const top3 = (data.priorizacion && data.priorizacion.length ? data.priorizacion : ordenados.slice(0, 3)).slice(0, 3);
  const porNumero = Object.fromEntries(matriz.map((f) => [f.n, f]));
  const fuentes = Array.isArray(data.fuentes) ? data.fuentes : [];

  return (
    <div className="pestel-matrix-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Contexto y balance del análisis */}
      <div className="pestel-matrix-head glass-panel" style={{ padding: '1.1rem 1.35rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1.25rem', alignItems: 'baseline', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <span><strong style={{ color: 'var(--text-primary)' }}>{resumen.factores} factores</strong> calificados</span>
          {data.horizonte ? <span>horizonte <strong style={{ color: 'var(--text-primary)' }}>{data.horizonte}</strong></span> : null}
          <span>{resumen.amenazas} amenazas ({resumen.impactoAmenazas.toFixed(2)}) · {resumen.oportunidades} oportunidades ({resumen.impactoOportunidades.toFixed(2)})</span>
          <span>impacto total <strong style={{ color: 'var(--text-primary)' }}>{resumen.total.toFixed(2)}</strong></span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.7rem', alignItems: 'center' }}>
          {['alto', 'medio', 'bajo'].map((nivel) => (
            <span key={nivel} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: PESTEL_SEMAFORO[nivel], display: 'inline-block' }} />
              {nivel} {nivel === 'alto' ? `≥ ${PESTEL_UMBRALES.alto.toFixed(2)}` : nivel === 'medio' ? `${PESTEL_UMBRALES.medio.toFixed(2)}-${(PESTEL_UMBRALES.alto - 0.01).toFixed(2)}` : `< ${PESTEL_UMBRALES.medio.toFixed(2)}`}
              <strong style={{ color: 'var(--text-primary)' }}>· {resumen[nivel + 's']}</strong>
            </span>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.76rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            {safeStr(data.formula) || 'Impacto = [(IP + Ir) / 2] × p(x)'}
          </span>
        </div>
      </div>

      {/* Tarjetas por dimensión */}
      <div className="pestel-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', width: '100%', alignItems: 'stretch' }}>
        {groupByDimension(matriz).map((dim) => {
          const meta = DIMENSIONES.find((d) => d.key === dim.key) || { label: dim.key, icon: Building, color: '#64748b' };
          const Icon = meta.icon;
          return (
            <div key={dim.key} className="pestel-card glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: '14px', border: `1.5px solid ${hexToRgba(meta.color, 0.25)}`, background: hexToRgba(meta.color, 0.05), display: 'flex', flexDirection: 'column', gap: '0.85rem', minWidth: 0, wordWrap: 'break-word' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: `1px solid ${hexToRgba(meta.color, 0.25)}`, paddingBottom: '0.65rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${meta.color}15`, border: `1px solid ${meta.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 20, height: 20, color: meta.color }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: meta.color, lineHeight: 1 }}>{meta.label[0]}</span>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{meta.label}</h4>
                </div>
              </div>

              {dim.factores.length === 0 ? (
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Sin factores calificados para esta dimensión.</p>
              ) : (
                dim.factores.map((f) => (
                  <div key={f.n} className="pestel-factor" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                      <ImpactBadge valor={f.impacto} />
                      <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-primary)', flex: 1 }}>{safeStr(f.factor)}</p>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', paddingLeft: '0.1rem' }}>
                      <TipoChip oa={f.oa} />
                      <ProcedenciaChip factor={f} />
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        IP {f.ip} · Ir {f.ir} · p(x) {Number(f.px).toFixed(2)}
                      </span>
                    </div>
                    {f.justificacion_px ? (
                      <p style={{ margin: 0, fontSize: '0.76rem', lineHeight: 1.45, color: 'var(--text-secondary)' }}>{safeStr(f.justificacion_px)}</p>
                    ) : null}
                    <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      {safeStr(f.fuente)}{f.fecha ? ` · ${String(f.fecha).slice(0, 10)}` : ''}
                    </p>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>

      {/* Tabla de la matriz, para lectura numérica e impresión */}
      <section className="pestel-tabla-calificacion" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Matriz calificada</h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="pestel-matrix-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr>
                {['Dim.', 'Factor y fuente', 'IP', 'T', 'Ir', 'p(x)', 'Impacto', 'O/A'].map((h) => (
                  <th key={h} style={{ textAlign: h === 'Factor y fuente' ? 'left' : 'center', padding: '0.45rem 0.5rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ordenados.map((f) => (
                <tr key={f.n} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.45rem 0.5rem', textAlign: 'center', fontWeight: 800, color: (DIMENSIONES.find((d) => d.key === f.dim) || {}).color }}>{(DIMENSIONES.find((d) => d.key === f.dim) || { label: f.dim }).label}</td>
                  <td style={{ padding: '0.45rem 0.5rem' }}>
                    {safeStr(f.factor)}
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{safeStr(f.fuente)}{f.fecha ? ` (${String(f.fecha).slice(0, 4)})` : ''}</span>
                  </td>
                  <td style={{ padding: '0.45rem 0.5rem', textAlign: 'center' }}>{f.ip}</td>
                  <td style={{ padding: '0.45rem 0.5rem', textAlign: 'center' }}>{f.tendencia}</td>
                  <td style={{ padding: '0.45rem 0.5rem', textAlign: 'center' }}>{f.ir}</td>
                  <td style={{ padding: '0.45rem 0.5rem', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{Number(f.px).toFixed(2)}</td>
                  <td style={{ padding: '0.45rem 0.5rem', textAlign: 'center' }}><span style={{ color: impactColor(f.impacto), fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{Number(f.impacto).toFixed(2)}</span></td>
                  <td style={{ padding: '0.45rem 0.5rem', textAlign: 'center', fontWeight: 800, color: f.oa === 'A' ? '#b91c1c' : '#047857' }}>{f.oa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Priorización */}
      <section className="pestel-priorizacion" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Top-3 y decisiones</h4>
        {top3.map((d, i) => {
          const factor = porNumero[d.factor_n] || {};
          return (
            <div key={d.orden ?? i} style={{ padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-secondary)' }}>#{d.orden ?? i + 1}</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', flex: 1, minWidth: '220px' }}>{safeStr(factor.factor || d.factor) }</strong>
                <ImpactBadge valor={d.impacto ?? factor.impacto} />
              </div>
              {d.que ? <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-primary)' }}><strong>Qué:</strong> {safeStr(d.que)}</p> : null}
              {d.como ? <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}><strong>Cómo:</strong> {safeStr(d.como)}</p> : null}
              {d.cuando ? <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}><strong>Cuándo:</strong> {safeStr(d.cuando)}</p> : null}
              {d.decision ? <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-primary)' }}>{safeStr(d.decision)}</p> : null}
            </div>
          );
        })}
      </section>

      {/* Conclusión */}
      {data.conclusion ? (
        <section className="pestel-conclusion" style={{ padding: '1.15rem 1.35rem', borderRadius: '14px', borderLeft: `4px solid ${PESTEL_SEMAFORO.alto}`, background: hexToRgba(PESTEL_SEMAFORO.alto, 0.06) }}>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Conclusión</h4>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>{safeStr(data.conclusion)}</p>
          {data.conclusion_palabras ? <p style={{ margin: '0.5rem 0 0', fontSize: '0.74rem', color: 'var(--text-secondary)', textAlign: 'right' }}>{data.conclusion_palabras} palabras</p> : null}
        </section>
      ) : null}

      {/* Investigación de candidatos: solo cuando el contenedor puede escribir */}
      {onActualizar ? (
        <PestelResearchPanel
          matriz={matriz}
          ventana={data.ventanaFuentes || data.ventana_fuentes}
          horizonte={data.horizonte}
          empresa={empresa || data.empresa || ''}
          giro={giro || ''}
          config={config || {}}
          onAprobar={onActualizar}
        />
      ) : null}

      {/* Fuentes */}
      {fuentes.length ? (
        <details className="pestel-fuentes" open style={{ fontSize: '0.82rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.85rem' }}>
            Fuentes ({fuentes.length})
          </summary>
          <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            {fuentes.map((f, i) => <li key={i}>{safeStr(f)}</li>)}
          </ul>
        </details>
      ) : null}

      <style>{`
        @media (max-width: 900px) {
          .pestel-matrix-view .pestel-grid-container { grid-template-columns: 1fr !important; gap: 1rem !important; }
        }
        @media print {
          .pestel-matrix-view { page-break-inside: auto !important; }
          .pestel-matrix-view .pestel-grid-container { grid-template-columns: repeat(2, 1fr) !important; gap: 0.5cm !important; }
          .pestel-matrix-view .pestel-card { background: #ffffff !important; border: 1.5px solid #cbd5e1 !important; box-shadow: none !important; page-break-inside: avoid !important; break-inside: avoid !important; padding: 0.8rem 1rem !important; min-height: auto !important; }
          .pestel-matrix-view .pestel-factor { page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 0.5rem !important; }
          .pestel-matrix-view .pestel-impact-badge { color: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .pestel-matrix-view .pestel-matrix-table { font-size: 0.66rem !important; }
          .pestel-matrix-view .pestel-matrix-table tr { page-break-inside: avoid !important; break-inside: avoid !important; }
          .pestel-matrix-view .pestel-matrix-table thead { display: table-header-group !important; }
          .pestel-matrix-view details { display: block !important; }
          .pestel-matrix-view details > summary { list-style: none !important; }
          .pestel-matrix-view .pestel-fuentes li { page-break-inside: avoid !important; break-inside: avoid !important; }
        }
      `}</style>
    </div>
  );
}

function PestelCardsView({ data }) {
  const pestelItems = DIMENSIONES.map((dim) => ({
    ...dim,
    bgColor: hexToRgba(dim.color, 0.05),
    borderColor: hexToRgba(dim.color, 0.25),
    content: data[dim.key] ? safeStr(data[dim.key]) : '*Sin factores redactados para esta dimensión.*'
  }));

  return (
    <div
      className="pestel-grid-container"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginTop: '1.25rem', marginBottom: '1.5rem', width: '100%', alignItems: 'stretch' }}
    >
      {pestelItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.key}
            className="pestel-card glass-panel"
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: '14px',
              border: `1.5px solid ${item.borderColor}`,
              background: item.bgColor,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              transition: 'all 0.25s ease',
              textAlign: 'left',
              position: 'relative',
              minWidth: 0,
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: `1px solid ${item.borderColor}`, paddingBottom: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${item.color}30`, flexShrink: 0 }}>
                <Icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: item.color, lineHeight: 1 }}>{item.label[0]}</span>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</h4>
              </div>
            </div>
            <div className="markdown-content pestel-text-container" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', textAlign: 'left', flex: 1 }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
            </div>
          </div>
        );
      })}

      <style>{`
        @media (max-width: 900px) {
          .pestel-grid-container { grid-template-columns: 1fr !important; gap: 1rem !important; }
        }
        @media print {
          .pestel-grid-container { grid-template-columns: repeat(2, 1fr) !important; gap: 0.5cm !important; display: grid !important; width: 100% !important; max-width: 100% !important; margin: 0.5rem 0 !important; page-break-inside: avoid !important; break-inside: avoid !important; }
          .pestel-card { background: #ffffff !important; color: #1e293b !important; border: 1.5px solid #cbd5e1 !important; box-shadow: none !important; page-break-inside: avoid !important; break-inside: avoid !important; border-radius: 8px !important; padding: 0.8rem 1rem !important; min-height: auto !important; gap: 0.4rem !important; }
          .pestel-card svg { width: 15px !important; height: 15px !important; }
          .pestel-card .markdown-content { font-size: 0.8rem !important; line-height: 1.45 !important; color: #334155 !important; }
          .pestel-card h4 { color: #0f172a !important; font-size: 0.88rem !important; }
        }
      `}</style>
    </div>
  );
}

export default function PestelAnalysis({ data, onActualizar, config, empresa, giro }) {
  if (!data) return null;
  if (hasMatrix(data)) return <PestelMatrixView data={data} onActualizar={onActualizar} config={config} empresa={empresa} giro={giro} />;
  return <PestelCardsView data={data} />;
}
