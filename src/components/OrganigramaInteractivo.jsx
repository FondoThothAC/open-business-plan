import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Handle,
  Position,
  Panel
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import { User, Briefcase, Award, Crown, UserCheck } from 'lucide-react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 220;
const nodeHeight = 80;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const targetPosition = isHorizontal ? Position.Left : Position.Top;
    const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // Shift to top-left to match React Flow's default positioning
    return {
      ...node,
      targetPosition,
      sourcePosition,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

// Custom Node Component
const CustomNode = ({ data, isConnectable }) => {
  const getIcon = (role) => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('director') || roleLower.includes('ceo')) return <Crown size={18} className="text-yellow-500" />;
    if (roleLower.includes('gerente') || roleLower.includes('jefe')) return <Briefcase size={18} className="text-blue-400" />;
    if (roleLower.includes('líder') || roleLower.includes('coordinador')) return <Award size={18} className="text-purple-400" />;
    return <User size={18} className="text-green-400" />;
  };

  return (
    <div className="glass-panel" style={{ 
      padding: '10px 15px', 
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      background: 'var(--bg-panel)',
      minWidth: '200px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ background: '#6366f1' }}
      />
      
      <div style={{ 
        width: '36px', 
        height: '36px', 
        borderRadius: '50%', 
        background: 'rgba(99, 102, 241, 0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        {getIcon(data.role)}
      </div>
      
      <div>
        <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{data.role}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          ${(data.salary || 0).toLocaleString()} / {data.type || 'permanente'}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ background: '#6366f1' }}
      />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export default function OrganigramaInteractivo({ staff, onChange }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Transform staff to nodes/edges
  useEffect(() => {
    if (!staff || staff.length === 0) return;

    const initialNodes = staff.map((emp) => ({
      id: emp.id,
      type: 'custom',
      data: { role: emp.role, salary: emp.salary, type: emp.type },
      position: { x: 0, y: 0 }, // Will be calculated by dagre
    }));

    const initialEdges = staff
      .filter((emp) => emp.reportsTo)
      .map((emp) => ({
        id: `e-${emp.reportsTo}-${emp.id}`,
        source: emp.reportsTo,
        target: emp.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'var(--accent-color)', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'var(--accent-color)',
        },
      }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [staff]);

  const onConnect = useCallback(
    (params) => {
      // Allow only one incoming connection per node (one boss)
      const existingIncoming = edges.find((e) => e.target === params.target);
      if (existingIncoming) {
        // Remove existing incoming edge if trying to connect a new one
        setEdges((eds) => addEdge(params, eds.filter((e) => e.target !== params.target)));
      } else {
        setEdges((eds) => addEdge(params, eds));
      }

      // Sync back to StaffTable
      const updatedStaff = staff.map(emp => {
        if (emp.id === params.target) {
          return { ...emp, reportsTo: params.source };
        }
        return emp;
      });
      onChange(updatedStaff);
    },
    [edges, staff, onChange, setEdges]
  );

  const onLayout = useCallback(
    (direction) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges]
  );

  return (
    <div className="glass-panel" style={{ height: '600px', width: '100%', marginTop: '1rem', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        style={{ background: 'var(--bg-dark)' }}
      >
        <MiniMap 
          nodeColor={(n) => {
            return 'var(--accent-color)';
          }}
          maskColor="var(--bg-panel)"
          style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)' }}
        />
        <Controls style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)' }} />
        <Background color="var(--border-color)" gap={16} size={1} />
        
        <Panel position="top-right" style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => onLayout('TB')}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
          >
            Vertical Layout
          </button>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => onLayout('LR')}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
          >
            Horizontal Layout
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
