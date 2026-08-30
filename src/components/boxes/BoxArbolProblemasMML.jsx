import { useState } from 'react';
import { GitFork, AlertCircle, CheckCircle, ArrowDown, ArrowUp } from 'lucide-react';

/**
 * BoxArbolProblemasMML - Árbol de Problemas y Transformación a Objetivos (BID / ZOPP / MML)
 * Estructura: Causas Raíz → Problema Central → Efectos Directos (Causa-Efecto a Medios-Fines)
 * Totalmente adaptado al tema claro/oscuro del sistema
 */
export function BoxArbolProblemasMML({ definition = {}, values = {}, onChange = () => {} }) {
  const [mode, setMode] = useState('problemas'); // 'problemas' | 'objetivos'

  const defaultData = {
    efectos: values.efectos || [
      'Pérdidas económicas por más de $15M MXN anuales en la región',
      'Riesgo elevado de accidentes laborales por rotura de mangueras',
      'Insatisfacción y rotación de clientes en faenas mineras'
    ],
    problemaCentral: values.problemaCentral || 'Alta frecuencia de fallas no programadas y paros en sistemas oleohidráulicos mineros',
    causas: values.causas || [
      'Falta de sensores y monitoreo de temperatura/presión en tiempo real',
      'Uso de refacciones y sellos de baja calidad o no certificados',
      'Personal técnico sin capacitación especializada en hidráulica pesada'
    ],
    fines: values.fines || [
      'Ahorro operativo y retorno de inversión comprobado del 35%',
      'Cero incidentes de seguridad y cumplimiento NOM-004-STPS',
      'Relaciones contractuales plurianuales de alta retención (>95%)'
    ],
    propositoCentral: values.propositoCentral || 'Garantizar la disponibilidad operativa y confiabilidad de sistemas hidráulicos al 99.2%',
    medios: values.medios || [
      'Instalación de telemetría IoT LoRaWAN para diagnóstico predictivo',
      'Convenio de distribución directa con sellos y componentes Parker/Rexroth',
      'Programa permanente de certificación IFPS para ingenieros y técnicos'
    ]
  };

  const [tree, setTree] = useState(defaultData);

  const updateItem = (category, index, val) => {
    const list = [...tree[category]];
    list[index] = val;
    const next = { ...tree, [category]: list };
    setTree(next);
    onChange(next);
  };

  const updateCentral = (field, val) => {
    const next = { ...tree, [field]: val };
    setTree(next);
    onChange(next);
  };

  return (
    <div style={{
      background: 'var(--bg-panel, #ffffff)',
      border: '1px solid var(--border-color, #e4e4e7)',
      borderRadius: '12px',
      padding: '24px',
      margin: '20px 0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.12)', borderRadius: '10px', color: '#f59e0b' }}>
            <GitFork size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary, #09090b)', fontWeight: 700 }}>
              {definition.title || 'Árbol de Problemas y Objetivos (Metodología Marco Lógico BID/ZOPP)'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #71717a)' }}>
              Fuente: {definition.source?.book || 'Manual de Formulación y Evaluación de Proyectos (BID / CEPAL)'} ({definition.source?.page || 'Ch. 2'})
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setMode('problemas')}
            style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
              border: '1px solid #ef4444',
              background: mode === 'problemas' ? '#ef4444' : 'transparent',
              color: mode === 'problemas' ? '#fff' : '#ef4444'
            }}
          >
            🔥 Árbol de Problemas
          </button>
          <button
            type="button"
            onClick={() => setMode('objetivos')}
            style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
              border: '1px solid #10b981',
              background: mode === 'objetivos' ? '#10b981' : 'transparent',
              color: mode === 'objetivos' ? '#fff' : '#10b981'
            }}
          >
            🌱 Árbol de Objetivos
          </button>
        </div>
      </div>

      {mode === 'problemas' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Nivel Superior: Efectos */}
          <div style={{ background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '16px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#ef4444', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUp size={14} /> EFECTOS NEGATIVOS DIRECTOS E INDIRECTOS
            </h5>
            {tree.efectos.map((efecto, i) => (
              <input
                key={i}
                type="text"
                className="form-control"
                style={{ fontSize: '0.8rem', marginBottom: '6px' }}
                value={efecto}
                onChange={(e) => updateItem('efectos', i, e.target.value)}
              />
            ))}
          </div>

          {/* Nivel Medio: Problema Central */}
          <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '2px solid #ef4444', borderRadius: '8px', padding: '16px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#b91c1c', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} /> PROBLEMA CENTRAL IDENTIFICADO
            </h5>
            <textarea
              rows={2}
              className="form-control"
              style={{ fontSize: '0.85rem', fontWeight: 600 }}
              value={tree.problemaCentral}
              onChange={(e) => updateCentral('problemaCentral', e.target.value)}
            />
          </div>

          {/* Nivel Inferior: Causas Raíz */}
          <div style={{ background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '16px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#ef4444', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowDown size={14} /> CAUSAS RAÍZ SUBYACENTES
            </h5>
            {tree.causas.map((causa, i) => (
              <input
                key={i}
                type="text"
                className="form-control"
                style={{ fontSize: '0.8rem', marginBottom: '6px' }}
                value={causa}
                onChange={(e) => updateItem('causas', i, e.target.value)}
              />
            ))}
          </div>

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Nivel Superior: Fines */}
          <div style={{ background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '16px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#10b981', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUp size={14} /> FINES Y RESULTADOS ESPERADOS
            </h5>
            {tree.fines.map((fin, i) => (
              <input
                key={i}
                type="text"
                className="form-control"
                style={{ fontSize: '0.8rem', marginBottom: '6px' }}
                value={fin}
                onChange={(e) => updateItem('fines', i, e.target.value)}
              />
            ))}
          </div>

          {/* Nivel Medio: Propósito Central */}
          <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '2px solid #10b981', borderRadius: '8px', padding: '16px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#047857', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} /> PROPÓSITO CENTRAL DEL PROYECTO
            </h5>
            <textarea
              rows={2}
              className="form-control"
              style={{ fontSize: '0.85rem', fontWeight: 600 }}
              value={tree.propositoCentral}
              onChange={(e) => updateCentral('propositoCentral', e.target.value)}
            />
          </div>

          {/* Nivel Inferior: Medios / Actividades */}
          <div style={{ background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '16px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#10b981', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowDown size={14} /> MEDIOS Y COMPONENTES DE SOLUCIÓN
            </h5>
            {tree.medios.map((medio, i) => (
              <input
                key={i}
                type="text"
                className="form-control"
                style={{ fontSize: '0.8rem', marginBottom: '6px' }}
                value={medio}
                onChange={(e) => updateItem('medios', i, e.target.value)}
              />
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
