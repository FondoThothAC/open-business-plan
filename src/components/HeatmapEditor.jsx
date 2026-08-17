

export default function HeatmapEditor({ value, onChange }) {
  // value puede ser un JSON string o un array/objeto directo
  let grid;
  if (!value) {
    grid = Array(10).fill(0).map(() => Array(10).fill(0));
  } else if (Array.isArray(value)) {
    grid = value;
  } else if (typeof value === 'string') {
    try { grid = JSON.parse(value); } catch { grid = Array(10).fill(0).map(() => Array(10).fill(0)); }
  } else {
    grid = Array(10).fill(0).map(() => Array(10).fill(0));
  }

  const handleClick = (y, x) => {
    const newGrid = [...grid];
    newGrid[y][x] = (newGrid[y][x] + 1) % 5; // 0 to 4 intensity levels
    onChange(JSON.stringify(newGrid));
  };

  const colors = [
    'rgba(255,255,255,0.05)',
    'rgba(99, 102, 241, 0.3)',
    'rgba(99, 102, 241, 0.6)',
    'rgba(239, 68, 68, 0.6)',
    'rgba(239, 68, 68, 0.9)'
  ];

  return (
    <div className="heatmap-editor glass-panel" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Mapa de Calor de Clientes Potenciales (Grilla 10x10)</h4>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
          <span>Menos</span>
          {colors.map((c, i) => <div key={i} style={{ width: '12px', height: '12px', background: c, borderRadius: '2px' }}></div>)}
          <span>Más</span>
        </div>
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(10, 1fr)', 
        gap: '4px',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        {grid.map((row, y) => row.map((cell, x) => (
          <div 
            key={`${y}-${x}`}
            onClick={() => handleClick(y, x)}
            style={{ 
              aspectRatio: '1',
              background: colors[cell],
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          ></div>
        )))}
      </div>
      <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        Haz clic en las celdas para simular la densidad de clientes en una zona geográfica o digital.
      </p>
    </div>
  );
}
