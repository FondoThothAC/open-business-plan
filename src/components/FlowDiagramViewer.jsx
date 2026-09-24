import { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Handle,
  Position
} from 'reactflow';
import dagre from 'dagre';
import { Plus, HelpCircle, X } from 'lucide-react';
import 'reactflow/dist/style.css';

// Custom Node component with custom handles, glassmorphism styling, and delete button
const CustomNode = ({ id, data }) => {
  const isLR = data.direction === 'LR';
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      className="glass-panel" 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '12px 24px 12px 18px',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: '600',
        textAlign: 'center',
        background: 'var(--bg-panel)',
        border: '1.5px solid var(--accent-color)',
        color: 'var(--text-primary)',
        minWidth: '150px',
        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.15)',
        position: 'relative',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Botón visual para eliminar nodo sin requerir presionar Delete */}
      <button
        type="button"
        title="Quitar nodo"
        aria-label="Quitar nodo"
        onClick={(e) => {
          e.stopPropagation();
          if (data.onDeleteNode) {
            data.onDeleteNode(id);
          }
        }}
        style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#ef4444',
          color: '#ffffff',
          border: '2px solid var(--bg-panel, #0f172a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
          opacity: hovered ? 1 : 0.7,
          transition: 'transform 0.15s, opacity 0.15s',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          zIndex: 10
        }}
      >
        <X style={{ width: '11px', height: '11px', strokeWidth: 3 }} />
      </button>

      <Handle 
        type="target" 
        position={isLR ? Position.Left : Position.Top} 
        style={{ background: 'var(--accent-hover)', border: 'none', width: '8px', height: '8px' }} 
      />
      <div>{data.label}</div>
      <Handle 
        type="source" 
        position={isLR ? Position.Right : Position.Bottom} 
        style={{ background: 'var(--accent-hover)', border: 'none', width: '8px', height: '8px' }} 
      />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Helper to layout elements using dagre
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 170, height: 60 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    node.position = {
      x: nodeWithPosition.x - 85,
      y: nodeWithPosition.y - 30,
    };
  });

  return { nodes, edges };
};

// Parser to convert Mermaid syntax to React Flow Nodes/Edges
function parseMermaid(chartText, onDeleteNode) {
  const safeChart = typeof chartText === 'string' ? chartText : (chartText && typeof chartText === 'object' ? JSON.stringify(chartText) : String(chartText || ''));
  
  // Normalize arrows and spacing
  let normalizedChart = safeChart.replace(/\r\n/g, '\n');
  normalizedChart = normalizedChart
    .replace(/(?:-\s*)+>\s*/g, ' --> ')
    .replace(/(?:-\s*)+→\s*/g, ' --> ')
    .replace(/→/g, ' --> ')
    .replace(/—>/g, ' --> ')
    .replace(/=>/g, ' --> ');

  const lines = normalizedChart.split('\n');
  const nodes = [];
  const edges = [];
  const nodeMap = new Map();
  
  let direction = 'TB';
  const dirMatch = normalizedChart.match(/^(?:graph|flowchart)\s+(TD|LR|TB|BT|RL)/i);
  if (dirMatch) {
    direction = dirMatch[1].toUpperCase();
    if (direction === 'TD') direction = 'TB';
  }
  
  lines.forEach(line => {
    let cleanLine = line.replace(/%%.*/, '').trim(); // ignore comments
    if (!cleanLine || cleanLine.toLowerCase().startsWith('graph') || cleanLine.toLowerCase().startsWith('flowchart')) {
      return;
    }
    
    // 1. Match explicit node definitions (e.g. A[Label Text])
    const nodeDefRegex = /([A-Za-z0-9_-]+)\s*(?:\[(.*?)\]|\((.*?)\)|\{(.*?)\}|\(\((.*?)\)\))/g;
    let match;
    while ((match = nodeDefRegex.exec(cleanLine)) !== null) {
      const id = match[1];
      let label = match[2] || match[3] || match[4] || match[5] || id;
      // Clean up surrounding quotes from the label
      label = label.replace(/^["']|["']$/g, '').trim();
      nodeMap.set(id, { id, label });
    }
    
    // Normalize line to just IDs and connections for parsing connections easily
    const cleanLineForEdges = cleanLine.replace(/(?:\[.*?\]|\(.*?\)|\{.*?\}|\(\(.*?\)\))/g, '').trim();
    
    // 2. Iteratively parse all connections on this line
    let tempLine = cleanLineForEdges;
    while (true) {
      const edgeRegex = /([A-Za-z0-9_-]+)\s*(?:--\s*\|?([^|]*?)\|?\s*-->|-->)\s*([A-Za-z0-9_-]+)/;
      const edgeMatch = tempLine.match(edgeRegex);
      if (!edgeMatch) break;
      
      const source = edgeMatch[1];
      const label = (edgeMatch[2] || '').replace(/^["']|["']$/g, '').trim();
      const target = edgeMatch[3];
      
      const edgeId = `e-${source}-${target}-${Math.random().toString(36).substr(2, 4)}`;
      edges.push({
        id: edgeId,
        source,
        target,
        label,
        animated: true,
        style: { stroke: 'var(--accent-color)', strokeWidth: 2 },
        labelStyle: { fill: 'var(--text-secondary)', fontSize: '10px', fontWeight: 600 }
      });
      
      if (!nodeMap.has(source)) nodeMap.set(source, { id: source, label: source });
      if (!nodeMap.has(target)) nodeMap.set(target, { id: target, label: target });
      
      // Advance by replacing the transition with just the target node ID
      tempLine = tempLine.substring(edgeMatch.index + edgeMatch[0].length - target.length);
    }
  });
  
  nodeMap.forEach((val) => {
    nodes.push({
      id: val.id,
      type: 'custom',
      data: { label: val.label, direction, onDeleteNode },
      position: { x: 0, y: 0 }
    });
  });
  
  return { nodes, edges, direction };
}

export default function FlowDiagramViewer({ chart, onChange, theme = 'light' }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  
  const skipNextParseRef = useRef(false);
  const directionRef = useRef('TB');

  // Trigger sync of nodes and edges state back to parent as a Mermaid code string
  const syncToParent = (currentNodes, currentEdges) => {
    const nodeDefs = currentNodes.map(n => `  ${n.id}[${n.data.label}]`).join('\n');
    const edgeDefs = currentEdges.map(e => {
      const labelPart = e.label ? `--|${e.label}|` : '';
      return `  ${e.source} ${labelPart} --> ${e.target}`;
    }).join('\n');
    
    const newMermaid = `flowchart ${directionRef.current || 'TB'}\n${nodeDefs}\n${edgeDefs}`;
    skipNextParseRef.current = true;
    if (onChange) {
      onChange(newMermaid);
    }
  };

  // Callback para eliminar un nodo directamente desde el botón en la tarjeta
  const handleDeleteNode = useCallback((nodeIdToDelete) => {
    setNodes((prevNodes) => {
      const updatedNodes = prevNodes.filter((n) => n.id !== nodeIdToDelete);
      setEdges((prevEdges) => {
        const updatedEdges = prevEdges.filter(
          (e) => e.source !== nodeIdToDelete && e.target !== nodeIdToDelete
        );
        syncToParent(updatedNodes, updatedEdges);
        return updatedEdges;
      });
      return updatedNodes;
    });
  }, [setNodes, setEdges]);

  // Re-parse chart when it changes externally
  useEffect(() => {
    if (skipNextParseRef.current) {
      skipNextParseRef.current = false;
      return;
    }
    
    if (chart) {
      const parsed = parseMermaid(chart, handleDeleteNode);
      directionRef.current = parsed.direction;
      const layouted = getLayoutedElements(parsed.nodes, parsed.edges, parsed.direction);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
    }
  }, [chart, handleDeleteNode, setNodes, setEdges]);

  // Connect two nodes
  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      id: `e-${params.source}-${params.target}-${Math.random().toString(36).substr(2, 4)}`,
      animated: true,
      style: { stroke: 'var(--accent-color)', strokeWidth: 2 },
    };
    
    setEdges((eds) => {
      const updated = addEdge(newEdge, eds);
      syncToParent(nodes, updated);
      return updated;
    });
  }, [nodes, setEdges]);

  // Handle deletion of edges
  const onEdgesDelete = useCallback((edgesToDelete) => {
    setEdges((eds) => {
      const updated = eds.filter(e => !edgesToDelete.some(td => td.id === e.id));
      syncToParent(nodes, updated);
      return updated;
    });
  }, [nodes, setEdges]);

  // Handle deletion of nodes via keyboard (Delete/Backspace)
  const onNodesDelete = useCallback((nodesToDelete) => {
    setNodes((currentNodes) => {
      const remainingNodes = currentNodes.filter(
        (n) => !nodesToDelete.some((del) => del.id === n.id)
      );
      setEdges((currentEdges) => {
        const remainingEdges = currentEdges.filter(
          (e) => !nodesToDelete.some((del) => del.id === e.source || del.id === e.target)
        );
        syncToParent(remainingNodes, remainingEdges);
        return remainingEdges;
      });
      return remainingNodes;
    });
  }, [setNodes, setEdges]);

  // Handle addition of a new node
  const addNode = () => {
    if (!newNodeLabel.trim()) return;
    const id = `node_${Math.random().toString(36).substr(2, 5)}`;
    const n = {
      id,
      type: 'custom',
      data: { label: newNodeLabel, direction: directionRef.current, onDeleteNode: handleDeleteNode },
      position: { x: 150, y: 150 }
    };
    
    setNodes(prev => {
      const updated = [...prev, n];
      syncToParent(updated, edges);
      return updated;
    });
    setNewNodeLabel('');
  };

  return (
    <div 
      className="glass-panel" 
      style={{ 
        height: '420px', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        background: theme === 'dark' ? 'rgba(15,23,42,0.4)' : '#ffffff'
      }}
    >
      {/* Node creation controls */}
      <div 
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(0, 0, 0, 0.1)',
          zIndex: 5
        }}
      >
        <input 
          type="text" 
          value={newNodeLabel} 
          onChange={(e) => setNewNodeLabel(e.target.value)} 
          placeholder="Etiqueta del nuevo nodo..."
          className="form-control"
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', flex: 1 }}
          onKeyDown={(e) => e.key === 'Enter' && addNode()}
        />
        <button 
          onClick={addNode}
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}
        >
          <Plus className="w-4 h-4" />
          <span>Agregar</span>
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={["Backspace", "Delete"]}
        >
          <Controls showInteractive={false} />
          <MiniMap 
            nodeColor={() => 'var(--accent-color)'}
            maskColor="rgba(0, 0, 0, 0.2)"
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px'
            }}
          />
          <Background color="var(--text-secondary)" gap={16} opacity={0.15} />
        </ReactFlow>

        {/* Tip pill */}
        <div 
          className="no-print"
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '0.75rem',
            background: 'rgba(0,0,0,0.6)',
            color: 'var(--text-secondary)',
            fontSize: '0.7rem',
            padding: '4px 8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            pointerEvents: 'none',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <HelpCircle className="w-3 h-3 text-indigo-400" />
          <span>Haz clic en la ✕ roja o presiona Supr/Delete para quitar nodos</span>
        </div>
      </div>
    </div>
  );
}
