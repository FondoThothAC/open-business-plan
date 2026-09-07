import React, { useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GitCommit, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * Nodo personalizado para etapas del Roadmap Cuántico
 */
const RoadmapNode = ({ data }) => {
  const isGate = data.type === 'gate';
  const isPhase1 = data.type === 'phase1';
  const isPhase2 = data.type === 'phase2';
  const isAction = data.type === 'action';

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

export default function DecisionFlow({ companyName = 'VCV Cortes Finos, S.A. de C.V.' }) {
  const nodes = useMemo(() => [
    {
      id: 'n1',
      type: 'roadmapNode',
      position: { x: 300, y: 0 },
      data: {
        type: 'phase1',
        badge: 'Fase 1: Arranque',
        amount: '$4,000,000 MXN',
        title: 'Taller Piloto Regional',
        description: '1 Horno ASADHOR (5.1 ton/mes) • Aviso COFEPRIS & NOM-251'
      }
    },
    {
      id: 'n2',
      type: 'roadmapNode',
      position: { x: 300, y: 130 },
      data: {
        type: 'action',
        badge: 'Tracción B2B',
        title: 'Validación Comercial HORECA',
        description: 'Ventas en Sonora y Sinaloa con margen bruto del 45.2%'
      }
    },
    {
      id: 'n3',
      type: 'roadmapNode',
      position: { x: 300, y: 250 },
      data: {
        type: 'gate',
        badge: 'Compuerta de Decisión',
        title: '🚦 Auditoría KPIs Gate',
        description: 'EBITDA ≥ $1.5M/mes • OTD ≥ 95% • Validación HACCP'
      }
    },
    {
      id: 'n4_fail',
      type: 'roadmapNode',
      position: { x: 50, y: 390 },
      data: {
        isNegative: true,
        badge: 'Contramedida',
        title: 'Optimización de Costos',
        description: 'Retención de cuentas HORECA y mejora de rendimiento en cocción'
      }
    },
    {
      id: 'n4_pass',
      type: 'roadmapNode',
      position: { x: 450, y: 390 },
      data: {
        type: 'phase2',
        badge: 'Fase 2: Desbloqueo Serie A',
        amount: '$16,800,000 MXN',
        title: 'Fondo FIRA / Bancomext / VC',
        description: 'Nave TIF $6.5M + 5 Hornos $3.75M + Túnel IQF $2.8M + Capital $2.3M'
      }
    },
    {
      id: 'n5',
      type: 'roadmapNode',
      position: { x: 450, y: 530 },
      data: {
        type: 'phase2',
        badge: 'Certificación TIF / USDA',
        title: 'Infraestructura Exportadora',
        description: 'NOM-008-ZOO SENASICA • Auditoría Bilateral USDA/FSIS • FDA'
      }
    },
    {
      id: 'n6',
      type: 'roadmapNode',
      position: { x: 450, y: 660 },
      data: {
        type: 'phase2',
        badge: 'Mercado Binacional',
        title: '⭐ Exportación a EE.UU.',
        description: 'Despacho aduanero VUCEM hacia cadenas en Arizona y California'
      }
    }
  ], [companyName]);

  const edges = useMemo(() => [
    { id: 'e1-2', source: 'n1', target: 'n2', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
    { id: 'e2-3', source: 'n2', target: 'n3', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
    { id: 'e3-4f', source: 'n3', target: 'n4_fail', label: '❌ No alcanzado', style: { stroke: '#ef4444', strokeWidth: 2 } },
    { id: 'e3-4p', source: 'n3', target: 'n4_pass', label: '✅ Metas Cumplidas', animated: true, style: { stroke: '#10b981', strokeWidth: 2.5 } },
    { id: 'e4p-5', source: 'n4_pass', target: 'n5', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
    { id: 'e5-6', source: 'n5', target: 'n6', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2.5 } }
  ], []);

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
