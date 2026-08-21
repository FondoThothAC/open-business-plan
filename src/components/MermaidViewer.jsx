import { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Copy, Download, Check, Network, Eye } from 'lucide-react';
import FlowDiagramViewer from './FlowDiagramViewer';

function normalizeMermaid(rawChart) {
  if (!rawChart || typeof rawChart !== 'string') return '';

  let normalized = rawChart.replace(/\r\n/g, '\n').trim();

  // Asegurar que la declaración del tipo de gráfico esté en su propia línea
  normalized = normalized.replace(/^(graph|flowchart)\s+(TD|LR|TB|BT|RL)\s+/i, '$1 $2\n');

  // Insertar saltos de línea donde se encadenen nodos en una sola línea sin separador (ej: ] B →)
  normalized = normalized.replace(/(\]|\))\s+(?=[A-Za-z0-9_]+\s*(?:-+>|→|->|--\s*>|—>|-[-\s]*→))/g, '$1\n');

  // Normalizar cualquier variación de flecha/conector a " --> "
  normalized = normalized
    .replace(/(?:-\s*)+>\s*/g, ' --> ')
    .replace(/(?:-\s*)+→\s*/g, ' --> ')
    .replace(/→/g, ' --> ')
    .replace(/—>/g, ' --> ')
    .replace(/=>/g, ' --> ')
    .replace(/\s*\+\s*/g, ' + ');

  if (!/^graph\s+/m.test(normalized) && !/^flowchart\s+/m.test(normalized)) {
    normalized = `flowchart TD\n${normalized}`;
  }

  return normalized;
}

export default function MermaidViewer({ chart, onChange, theme = 'light' }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('interactive'); // 'interactive' | 'classic'

  useEffect(() => {
    if (viewMode !== 'classic') return;

    const mermaid = window.mermaid;
    const mermaidChart = normalizeMermaid(chart);
    setError(null);
    
    if (mermaid && mermaidChart && containerRef.current) {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'base',
        securityLevel: 'loose',
        flowchart: { curve: 'basis', htmlLabels: true, nodeSpacing: 60, rankSpacing: 70, padding: 25 },
        themeVariables: theme === 'dark' ? {
          primaryColor: '#1f2937',
          primaryTextColor: '#f8fafc',
          primaryBorderColor: '#60a5fa',
          lineColor: '#cbd5e1',
          secondaryColor: '#111827',
          tertiaryColor: '#0b1220',
          fontFamily: 'Outfit, Inter, sans-serif',
        } : {
          primaryColor: '#f8fafc',
          primaryTextColor: '#0f172a',
          primaryBorderColor: '#6366f1',
          lineColor: '#475569',
          secondaryColor: '#e2e8f0',
          tertiaryColor: '#eef2ff',
          fontFamily: 'Outfit, Inter, sans-serif',
        }
      });

      const wrapper = containerRef.current.querySelector('.mermaid-render-target');
      if (wrapper) {
        wrapper.removeAttribute('data-processed');
        wrapper.innerHTML = `<div class="mermaid">${mermaidChart}</div>`;
        
        try {
          const id = 'mermaid-svg-' + Math.random().toString(36).substr(2, 9);
          mermaid.render(id, mermaidChart).then(({ svg }) => {
            if (wrapper) {
              wrapper.innerHTML = svg;
              const svgElement = wrapper.querySelector('svg');
              if (svgElement) {
                svgElement.style.width = '100%';
                svgElement.style.height = '100%';
                svgElement.style.maxWidth = 'none';
              }
            }
          }).catch(err => {
            console.error("Mermaid Render Error Promise", err);
            setError("Error al renderizar el diagrama.");
          });
        } catch (e) {
          console.error("Mermaid Render Error Catch", e);
          setError("Código de diagrama no válido.");
        }
      }
    }
  }, [chart, theme, viewMode]);

  const handleMouseDown = (e) => {
    if (viewMode !== 'classic') return;
    if (e.target.closest('.mermaid-controls') || e.target.closest('.mode-controls')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (viewMode !== 'classic' || !isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    if (viewMode !== 'classic') return;
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    if (viewMode !== 'classic') return;
    e.preventDefault();
    const zoomFactor = 0.1;
    const newScale = e.deltaY < 0 ? Math.min(scale + zoomFactor, 3) : Math.max(scale - zoomFactor, 0.5);
    setScale(newScale);
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPNG = () => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);
    
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const bbox = svgElement.getBBox();
      canvas.width = bbox.width * 2;
      canvas.height = bbox.height * 2;
      const context = canvas.getContext('2d');
      
      context.fillStyle = theme === 'dark' ? '#0f172a' : '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      const pngURL = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngURL;
      downloadLink.download = 'diagrama-plan.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    image.src = blobURL;
  };

  if (viewMode === 'interactive') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div className="view-toggle" style={{ background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button 
              className="active"
              style={{ background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <Network className="w-3.5 h-3.5" /> Lienzo Interactivo
            </button>
            <button 
              onClick={() => setViewMode('classic')}
              style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <Eye className="w-3.5 h-3.5" /> Esquema Estático
            </button>
          </div>
        </div>
        <FlowDiagramViewer chart={chart} onChange={onChange} theme={theme} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <div className="view-toggle" style={{ background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setViewMode('interactive')}
            style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Network className="w-3.5 h-3.5" /> Lienzo Interactivo
          </button>
          <button 
            className="active"
            style={{ background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Eye className="w-3.5 h-3.5" /> Esquema Estático
          </button>
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        className="mermaid-container glass-panel" 
        style={{ 
          position: 'relative',
          minHeight: '350px',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          background: theme === 'dark' ? 'rgba(15,23,42,0.65)' : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          border: theme === 'dark' ? '1px solid rgba(148,163,184,0.25)' : '1px solid #e2e8f0',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Action Menu */}
        <div 
          className="mermaid-controls"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            display: 'flex',
            gap: '0.5rem',
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '4px',
            borderRadius: '10px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <button 
            onClick={() => setScale(prev => Math.min(prev + 0.2, 3))}
            className="btn-icon" 
            style={{ width: '28px', height: '28px', border: 'none', background: 'transparent' }}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
          <button 
            onClick={() => setScale(prev => Math.max(prev - 0.2, 0.5))}
            className="btn-icon" 
            style={{ width: '28px', height: '28px', border: 'none', background: 'transparent' }}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-white" />
          </button>
          <button 
            onClick={resetView}
            className="btn-icon" 
            style={{ width: '28px', height: '28px', border: 'none', background: 'transparent' }}
            title="Centrar vista"
          >
            <RotateCcw className="w-4 h-4 text-white" />
          </button>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '4px 2px' }} />
          <button 
            onClick={copyToClipboard}
            className="btn-icon" 
            style={{ width: '28px', height: '28px', border: 'none', background: 'transparent' }}
            title="Copiar código"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white" />}
          </button>
          <button 
            onClick={downloadPNG}
            className="btn-icon" 
            style={{ width: '28px', height: '28px', border: 'none', background: 'transparent' }}
            title="Descargar PNG"
          >
            <Download className="w-4 h-4 text-white" />
          </button>
        </div>

        {error ? (
          <div style={{ margin: 'auto', textAlign: 'center', padding: '2rem', color: 'var(--danger-color)' }}>
            <p style={{ fontWeight: 'bold' }}>{error}</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Haz clic en Editar para corregir la sintaxis de Mermaid.</p>
          </div>
        ) : (
          <div 
            className="mermaid-render-target"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              padding: '2rem',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
    </div>
  );
}
