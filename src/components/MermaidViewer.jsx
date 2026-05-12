import React, { useEffect, useRef } from 'react';

export default function MermaidViewer({ chart }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // We use window.mermaid from the CDN in index.html
    const mermaid = window.mermaid;
    
    if (mermaid && chart && containerRef.current) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: 'Inter'
      });

      containerRef.current.removeAttribute('data-processed');
      try {
        const id = 'mermaid-svg-' + Math.random().toString(36).substr(2, 9);
        mermaid.render(id, chart).then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        });
      } catch (e) {
        console.error("Mermaid Render Error", e);
      }
    }
  }, [chart]);

  return (
    <div 
      ref={containerRef} 
      className="mermaid-container glass-panel" 
      style={{ 
        padding: '2rem', 
        background: 'rgba(0,0,0,0.4)', 
        minHeight: '300px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'auto'
      }}
    >
      <div className="mermaid">{chart}</div>
    </div>
  );
}
