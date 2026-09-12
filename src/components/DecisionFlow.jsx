import { useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

/**
 * Nodo personalizado para etapas del Roadmap Cuántico
 */
const RoadmapNode = ({ data }) => {
  const isGate = data.type === 'gate';
  const isPhase1 = data.type === 'phase1';
  const isPhase2 = data.type === 'phase2';

  let borderColor = '#94a3b8';
  let bgColor = '#ffffff';
  let textColor = '#1e293b';
  let badgeColor = '#64748b';
  let badgeBg = '#f1f5f9';

  if (isPhase1) {
    borderColor = '#10b981';
    bgColor = '#ecfdf5';
    textColor = '#065f46';
    badgeColor = '#047857';
    badgeBg = '#d1fae5';
  } else if (isGate) {
    borderColor = '#3b82f6';
    bgColor = '#eff6ff';
    textColor = '#1e3a8a';
    badgeColor = '#1d4ed8';
    badgeBg = '#dbeafe';
  } else if (isPhase2) {
    borderColor = '#f59e0b';
    bgColor = '#fffbeb';
    textColor = '#78350f';
    badgeColor = '#b45309';
    badgeBg = '#fef3c7';
  } else if (data.isNegative) {
    borderColor = '#ef4444';
    bgColor = '#fef2f2';
    textColor = '#991b1b';
    badgeColor = '#b91c1c';
    badgeBg = '#fee2e2';
  }

  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '10px',
      background: bgColor,
      border: `2px solid ${borderColor}`,
      color: textColor,
      minWidth: '220px',
      maxWidth: '280px',
      fontSize: '0.82rem',
      fontFamily: 'var(--font-body, system-ui, sans-serif)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
      position: 'relative',
      textAlign: 'left'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: borderColor, width: 8, height: 8 }} />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          padding: '2px 6px',
          borderRadius: '4px',
          background: badgeBg,
          color: badgeColor
        }}>
          {data.badge || 'Etapa'}
        </span>
        {data.amount && (
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: textColor }}>
            {data.amount}
          </span>
        )}
      </div>

      <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px', lineHeight: 1.3 }}>
        {data.title}
      </div>

      {data.description && (
        <div style={{ fontSize: '0.75rem', opacity: 0.88, lineHeight: 1.4 }}>
          {data.description}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: borderColor, width: 8, height: 8 }} />
    </div>
  );
};

const nodeTypes = {
  roadmapNode: RoadmapNode
};

export default function DecisionFlow({ phases = [] }) {
  const nodes = useMemo(() => phases.map((phase, index) => ({
    id: `phase-${index}`,
    type: 'roadmapNode',
    position: { x: 260, y: index * 180 },
    data: {
      type: index === 0 ? 'phase1' : 'phase2',
      badge: phase.nombre || `Fase ${index + 1}`,
      amount: phase.monto_requerido ?? phase.monto_requerido_serie_a ?? phase.monto
        ? `$${Number(phase.monto_requerido ?? phase.monto_requerido_serie_a ?? phase.monto).toLocaleString('es-MX')} MXN`
        : '',
      title: phase.titulo || phase.nombre || `Fase ${index + 1}`,
      description: phase.requerimientos || phase.normatividad || phase.mercado || ''
    }
  })), [phases]);

  const edges = useMemo(() => nodes.slice(1).map((node, index) => ({
    id: `phase-edge-${index}`,
    source: `phase-${index}`,
    target: node.id,
    animated: true,
    style: { stroke: index === 0 ? '#10b981' : '#f59e0b', strokeWidth: 2 }
  })), [nodes]);

  return (
    <div style={{
      width: '100%',
      height: '520px',
      background: '#f8fafc',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      position: 'relative'
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-right"
        style={{ width: '100%', height: '100%' }}
      >
        <MiniMap 
          nodeColor={n => n.data?.type === 'phase1' ? '#10b981' : n.data?.type === 'phase2' ? '#f59e0b' : '#3b82f6'} 
          style={{ height: 90, width: 130, borderRadius: 6, border: '1px solid #cbd5e1' }} 
        />
        <Controls showInteractive={false} />
        <Background color="#cbd5e1" gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}
