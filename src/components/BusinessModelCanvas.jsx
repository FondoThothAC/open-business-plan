import React, { useState } from 'react';
import { usePlan } from '../context/PlanContext';
import { Users, CheckSquare, Layers, Gift, Heart, Truck, UserCheck, DollarSign, Percent, Edit3, X, Save } from 'lucide-react';
import { safeStr } from '../utils/formatters';

const CANVAS_BLOCKS = {
  socios_clave: {
    title: 'Socios Clave',
    icon: Users,
    desc: '¿Quiénes son nuestros socios clave y proveedores? ¿Qué recursos clave adquirimos de ellos?',
    border: '#3b82f6'
  },
  actividades_clave: {
    title: 'Actividades Clave',
    icon: CheckSquare,
    desc: '¿Qué actividades clave requieren nuestras propuestas de valor, canales, relaciones y flujos de ingresos?',
    border: '#22c55e'
  },
  recursos_clave: {
    title: 'Recursos Clave',
    icon: Layers,
    desc: '¿Qué recursos clave requieren nuestras propuestas de valor, canales, relaciones y flujos de ingresos?',
    border: '#d97706'
  },
  propuestas_valor: {
    title: 'Propuesta de Valor',
    icon: Gift,
    desc: '¿Qué valor entregamos al cliente? ¿Qué problemas ayudamos a resolver? ¿Qué necesidades satisfacemos?',
    border: '#ec4899'
  },
  relaciones_clientes: {
    title: 'Relaciones con Clientes',
    icon: Heart,
    desc: '¿Qué tipo de relación espera cada uno de nuestros segmentos de clientes que establezcamos?',
    border: '#a855f7'
  },
  canales: {
    title: 'Canales',
    icon: Truck,
    desc: '¿A través de qué canales quieren ser contactados nuestros segmentos de clientes?',
    border: '#14b8a6'
  },
  segmentos_clientes: {
    title: 'Segmentos de Clientes',
    icon: UserCheck,
    desc: '¿Para quién estamos creando valor? ¿Quiénes son nuestros clientes más importantes?',
    border: '#f43f5e'
  },
  estructura_costos: {
    title: 'Estructura de Costos',
    icon: Percent,
    desc: '¿Cuáles son los costos más importantes inherentes a nuestro modelo de negocio?',
    border: '#64748b'
  },
  fuentes_ingresos: {
    title: 'Fuentes de Ingresos',
    icon: DollarSign,
    desc: '¿Por qué valor están dispuestos a pagar nuestros clientes? ¿Cómo y cuánto pagan actualmente?',
    border: '#16a34a'
  }
};

export default function BusinessModelCanvas({ readOnly = false }) {
  const { planData, updateSection } = usePlan();
  const [editingBlock, setEditingBlock] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleBlockClick = (key) => {
    if (readOnly) return;
    setEditingBlock(key);
    const rawVal = planData.naturaleza?.canvas?.[key];
    setEditValue(!rawVal ? '' : safeStr(rawVal));
  };

  const handleSave = () => {
    if (editingBlock) {
      updateSection('naturaleza', 'canvas', editingBlock, editValue);
      setEditingBlock(null);
    }
  };

  const renderBlock = (key, gridArea) => {
    const block = CANVAS_BLOCKS[key];
    const rawValue = planData.naturaleza?.canvas?.[key];
    const value = !rawValue ? '' : safeStr(rawValue);
    const Icon = block.icon;

    // Descomponer gridArea en filas y columnas explícitas para evitar fallos de renderizado
    const parts = gridArea.split('/').map(s => s.trim());
    const gridRow = `${parts[0]} / ${parts[2]}`;
    const gridColumn = `${parts[1]} / ${parts[3]}`;

    return (
      <div
        onClick={() => handleBlockClick(key)}
        style={{
          gridRow,
          gridColumn,
          cursor: readOnly ? 'default' : 'pointer',
          position: 'relative'
        }}
        className={`canvas-block ${key}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }} className="canvas-block-header">
          <div style={{ padding: '0.4rem', borderRadius: '8px', background: `${block.border}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="canvas-icon-wrapper">
            <Icon size={16} style={{ color: block.border }} className="canvas-icon" />
          </div>
          <span style={{ fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="canvas-block-title">{block.title}</span>
          {!readOnly && (
            <Edit3 size={13} style={{ marginLeft: 'auto', opacity: 0.4, color: 'var(--text-secondary)' }} className="edit-indicator" />
          )}
        </div>
        
        <div style={{ fontSize: '0.82rem', lineHeight: '1.5', overflowY: 'auto', flex: 1, whiteSpace: 'pre-wrap' }} className="canvas-block-content">
          {value ? value : (
            <span style={{ color: 'var(--text-secondary)', opacity: 0.6, fontStyle: 'italic', fontSize: '0.76rem' }}>
              {readOnly ? 'Sin redactar' : `Haz click para agregar ${block.title.toLowerCase()}...`}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', maxWidth: '1020px', margin: '0 auto' }} className="business-model-canvas-container">
      <style>{`
        @media print {
          .business-model-canvas-container {
            margin: 0 auto !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .business-model-canvas-grid {
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr !important;
            grid-template-rows: minmax(130px, auto) minmax(130px, auto) minmax(90px, auto) !important;
            gap: 6px !important;
            min-width: 100% !important;
            width: 100% !important;
          }
          .canvas-block {
            padding: 0.65rem !important;
            border-radius: 8px !important;
            min-height: auto !important;
            border: 1.5px solid #cbd5e1 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .canvas-block-header {
            margin-bottom: 0.4rem !important;
          }
          .canvas-icon-wrapper {
            padding: 0.25rem !important;
            border-radius: 4px !important;
          }
          .canvas-icon {
            width: 12px !important;
            height: 12px !important;
          }
          .canvas-block-title {
            font-size: 0.72rem !important;
            letter-spacing: 0.02em !important;
          }
          .canvas-block-content {
            font-size: 0.7rem !important;
            line-height: 1.3 !important;
          }
        }
      `}</style>

      {!readOnly && (
        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(99, 102, 241, 0.05)' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            💡 <strong>Lienzo interactivo:</strong> Haz clic sobre cualquiera de los 9 bloques del Canvas de Osterwalder a continuación para completar, refinar o redactar sus puntos estratégicos. Todo se guardará al instante.
          </p>
        </div>
      )}

      {/* Grid del Canvas */}
      <div 
        className="business-model-canvas-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
          gridTemplateRows: 'minmax(190px, auto) minmax(190px, auto) minmax(135px, auto)',
          gap: '1rem',
          width: '100%',
          overflowX: 'auto'
        }}
      >
        {renderBlock('socios_clave', '1 / 1 / 3 / 2')}
        {renderBlock('actividades_clave', '1 / 2 / 2 / 3')}
        {renderBlock('recursos_clave', '2 / 2 / 3 / 3')}
        {renderBlock('propuestas_valor', '1 / 3 / 3 / 4')}
        {renderBlock('relaciones_clientes', '1 / 4 / 2 / 5')}
        {renderBlock('canales', '2 / 4 / 3 / 5')}
        {renderBlock('segmentos_clientes', '1 / 5 / 3 / 6')}
        {renderBlock('estructura_costos', '3 / 1 / 4 / 3')}
        {renderBlock('fuentes_ingresos', '3 / 3 / 4 / 6')}
      </div>

      {/* Modal de edición */}
      {editingBlock && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div 
            className="glass-panel" 
            style={{
              width: '100%',
              maxWidth: '560px',
              background: 'var(--bg-panel)',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              borderColor: 'var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ padding: '0.4rem', borderRadius: '6px', background: `${CANVAS_BLOCKS[editingBlock].border}15` }}>
                {React.createElement(CANVAS_BLOCKS[editingBlock].icon, { size: 16, style: { color: CANVAS_BLOCKS[editingBlock].border } })}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Editar {CANVAS_BLOCKS[editingBlock].title}
              </h3>
              <button 
                onClick={() => setEditingBlock(null)}
                style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                {CANVAS_BLOCKS[editingBlock].desc}
              </p>
              <textarea
                className="form-control"
                style={{ minHeight: '180px', fontSize: '0.9rem', width: '100%', resize: 'vertical' }}
                placeholder={`Redacta la información correspondiente a ${CANVAS_BLOCKS[editingBlock].title.toLowerCase()}...`}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1rem 1.5rem', background: 'var(--bg-panel-hover)', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-secondary" onClick={() => setEditingBlock(null)} style={{ padding: '0.4rem 1rem' }}>Cancelar</button>
              <button 
                className="btn" 
                style={{ background: CANVAS_BLOCKS[editingBlock].border, color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 1rem' }}
                onClick={handleSave}
              >
                <Save size={14} />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
