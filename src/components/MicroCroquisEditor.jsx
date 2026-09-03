import { useState, useMemo } from 'react';
import { 
  Maximize2, Grid, Plus, Trash2, RotateCw, Sparkles, Download, 
  Layers, RefreshCw, Check, AlertCircle, Eye
} from 'lucide-react';
import { 
  CROQUIS_STYLES, DEFAULT_EQUIPMENT_BLOCKS, 
  calculateLayoutMetrics, buildArchitecturalPrompt, buildCroquisImageUrl 
} from '../lib/croquisGenerator.js';

export default function MicroCroquisEditor({ data = {}, onUpdateField = () => {}, companyName = 'Mi Microempresa' }) {
  // Estado dimensional del local (metros)
  const initialWidth = Number(data?.layout_vector?.widthMeters) || 4;
  const initialLength = Number(data?.layout_vector?.lengthMeters) || 3;
  const [widthMeters, setWidthMeters] = useState(initialWidth);
  const [lengthMeters, setLengthMeters] = useState(initialLength);

  // Elementos colocados en el croquis
  const initialElements = Array.isArray(data?.layout_vector?.elements) && data.layout_vector.elements.length > 0
    ? data.layout_vector.elements
    : [
        { id: 'el_1', blockId: 'tarja_lavado', name: 'Tarja Doble Sanitaria', x: 0.3, y: 0.3, widthM: 1.4, lengthM: 0.7, rotation: 0, color: '#10b981', icon: '🧼' },
        { id: 'el_2', blockId: 'mesa_inox', name: 'Mesa de Trabajo Acero Inox', x: 1.1, y: 1.2, widthM: 1.8, lengthM: 0.8, rotation: 0, color: '#3b82f6', icon: '🪵' },
        { id: 'el_3', blockId: 'horno_coccion', name: 'Horno / Zona de Calor', x: 2.8, y: 0.3, widthM: 1.0, lengthM: 0.9, rotation: 0, color: '#ef4444', icon: '🔥' },
        { id: 'el_4', blockId: 'refrigerador_frio', name: 'Refrigerador / Vitrina', x: 2.6, y: 1.8, widthM: 1.2, lengthM: 0.8, rotation: 0, color: '#06b6d4', icon: '🧊' }
      ];

  const [elements, setElements] = useState(initialElements);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'ai_render'

  // Estado del generador con IA
  const [selectedStyle, setSelectedStyle] = useState('isometric_3d');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiImageUrl, setAiImageUrl] = useState(data?.layout_vector?.aiRenderUrl || '');
  const [customPrompt, setCustomPrompt] = useState('');
  const [syncStatus, setSyncStatus] = useState('');

  // Métricas espaciales automáticas
  const metrics = useMemo(() => {
    return calculateLayoutMetrics(widthMeters, lengthMeters, elements);
  }, [widthMeters, lengthMeters, elements]);

  // Sincroniza los cambios con el estado global de PlanContext
  const saveLayoutToPlan = (newElements, newW = widthMeters, newL = lengthMeters, newAiUrl = aiImageUrl) => {
    const layoutVector = {
      widthMeters: newW,
      lengthMeters: newL,
      elements: newElements,
      totalM2: newW * newL,
      aiRenderUrl: newAiUrl
    };
    onUpdateField('layout_vector', layoutVector);
  };

  // Agregar un bloque del catálogo
  const handleAddBlock = (blockTemplate) => {
    const newEl = {
      id: `el_${Date.now()}`,
      blockId: blockTemplate.id,
      name: blockTemplate.name,
      x: Math.max(0.2, (widthMeters / 2) - (blockTemplate.widthM / 2)),
      y: Math.max(0.2, (lengthMeters / 2) - (blockTemplate.lengthM / 2)),
      widthM: blockTemplate.widthM,
      lengthM: blockTemplate.lengthM,
      rotation: 0,
      color: blockTemplate.color,
      icon: blockTemplate.icon
    };
    const next = [...elements, newEl];
    setElements(next);
    setSelectedElementId(newEl.id);
    saveLayoutToPlan(next);
  };

  // Rotar el elemento seleccionado
  const handleRotateSelected = () => {
    if (!selectedElementId) return;
    const next = elements.map(el => {
      if (el.id === selectedElementId) {
        const nextRotation = (el.rotation + 90) % 360;
        // Invertir ancho y largo en rotaciones de 90° o 270°
        return {
          ...el,
          rotation: nextRotation,
          widthM: el.lengthM,
          lengthM: el.widthM
        };
      }
      return el;
    });
    setElements(next);
    saveLayoutToPlan(next);
  };

  // Eliminar el elemento seleccionado
  const handleDeleteSelected = () => {
    if (!selectedElementId) return;
    const next = elements.filter(el => el.id !== selectedElementId);
    setElements(next);
    setSelectedElementId(null);
    saveLayoutToPlan(next);
  };

  // Mover elemento en el plano mediante controles o drag simple
  const handleMoveSelected = (dx, dy) => {
    if (!selectedElementId) return;
    const next = elements.map(el => {
      if (el.id === selectedElementId) {
        const newX = Math.max(0, Math.min(widthMeters - el.widthM, el.x + dx));
        const newY = Math.max(0, Math.min(lengthMeters - el.lengthM, el.y + dy));
        return { ...el, x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 };
      }
      return el;
    });
    setElements(next);
    saveLayoutToPlan(next);
  };

  // Sincronizar descripción textual a los campos del formulario
  const handleSyncToTextFields = () => {
    const desc = `Local de ${widthMeters}m x ${lengthMeters}m con una superficie total de ${metrics.totalM2} m² (${metrics.freePercentage}% de área libre de circulación).`;
    const areas = elements.map((e, i) => `Área ${i + 1}: ${e.name} (${e.widthM}m x ${e.lengthM}m).`).join(' ');
    
    onUpdateField('descripcion_espacio', desc);
    onUpdateField('distribucion_areas', areas);
    
    setSyncStatus('¡Sincronizado con éxito a los campos de texto del plan!');
    setTimeout(() => setSyncStatus(''), 3000);
  };

  // Generar Render Visual con IA (Pollinations Flux)
  const handleGenerateAiRender = () => {
    setIsGeneratingAi(true);
    const prompt = customPrompt.trim() || buildArchitecturalPrompt(
      { giro: companyName, widthMeters, lengthMeters },
      elements,
      selectedStyle
    );

    const generatedUrl = buildCroquisImageUrl(prompt, {
      width: 1024,
      height: 768,
      model: 'flux'
    });

    // Simular precarga de imagen para evitar parpadeos
    const img = new Image();
    img.src = generatedUrl;
    img.onload = () => {
      setAiImageUrl(generatedUrl);
      setIsGeneratingAi(false);
      saveLayoutToPlan(elements, widthMeters, lengthMeters, generatedUrl);
    };
    img.onerror = () => {
      // Si falla la precarga, guardar la URL directa igualmente
      setAiImageUrl(generatedUrl);
      setIsGeneratingAi(false);
      saveLayoutToPlan(elements, widthMeters, lengthMeters, generatedUrl);
    };
  };

  // Escala SVG: cuántos píxeles representa 1 metro
  const svgScale = 85; 
  const svgWidth = Math.max(340, widthMeters * svgScale);
  const svgHeight = Math.max(260, lengthMeters * svgScale);

  const selectedElement = elements.find(el => el.id === selectedElementId);

  return (
    <div style={{
      background: 'var(--bg-panel, #ffffff)',
      border: '1px solid var(--border-color, #e4e4e7)',
      borderRadius: '16px',
      padding: '24px',
      margin: '24px 0',
      boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
    }}>
      {/* Encabezado con Métricas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-color, #e4e4e7)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px 12px', background: 'rgba(99, 102, 241, 0.12)', borderRadius: '10px', color: 'var(--accent-color, #6366f1)' }}>
              <Layers size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary, #09090b)', fontFamily: 'var(--font-display)' }}>
                Diseñador de Croquis y Distribución Espacial 2D
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary, #71717a)' }}>
                Modelado arquitectónico interactivo en metros (Estilo HomeByMe) + Renders con IA
              </p>
            </div>
          </div>
        </div>

        {/* Badges de Superficie y Circulación */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-color, #6366f1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Maximize2 size={16} />
            Superficie Total: {metrics.totalM2} m²
          </div>

          <div style={{ padding: '6px 14px', borderRadius: '10px', background: `${metrics.circulationColor}15`, border: `1px solid ${metrics.circulationColor}40`, fontSize: '0.82rem', fontWeight: 700, color: metrics.circulationColor, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Grid size={16} />
            Circulación: {metrics.freePercentage}% ({metrics.circulationStatus})
          </div>
        </div>
      </div>

      {/* Selector de Pestañas: Editor 2D vs Render con IA */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color, #e4e4e7)' }}>
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            borderBottom: activeTab === 'editor' ? '3px solid var(--accent-color, #6366f1)' : '3px solid transparent',
            background: activeTab === 'editor' ? 'rgba(99, 102, 241, 0.06)' : 'transparent',
            color: activeTab === 'editor' ? 'var(--accent-color, #6366f1)' : 'var(--text-secondary, #71717a)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem'
          }}
        >
          <Grid size={16} />
          Editor de Planta 2D (Bloques y Medidas)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai_render')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            borderBottom: activeTab === 'ai_render' ? '3px solid var(--accent-color, #6366f1)' : '3px solid transparent',
            background: activeTab === 'ai_render' ? 'rgba(99, 102, 241, 0.06)' : 'transparent',
            color: activeTab === 'ai_render' ? 'var(--accent-color, #6366f1)' : 'var(--text-secondary, #71717a)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem'
          }}
        >
          <Sparkles size={16} />
          Render Arquitectónico con IA (Google / Flux)
          {aiImageUrl && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />}
        </button>
      </div>

      {activeTab === 'editor' ? (
        <div>
          {/* Barra de Control de Dimensiones */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'var(--bg-panel-hover, #f8fafc)', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-color, #e4e4e7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary, #71717a)' }}>Ancho (m):</label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  step="0.5"
                  value={widthMeters}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 2;
                    setWidthMeters(val);
                    saveLayoutToPlan(elements, val, lengthMeters);
                  }}
                  style={{ width: '70px', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color, #e4e4e7)', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary, #71717a)' }}>Largo (m):</label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  step="0.5"
                  value={lengthMeters}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 2;
                    setLengthMeters(val);
                    saveLayoutToPlan(elements, widthMeters, val);
                  }}
                  style={{ width: '70px', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color, #e4e4e7)', fontWeight: 700 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleSyncToTextFields}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} />
                Sincronizar a textos del plan
              </button>
            </div>
          </div>

          {syncStatus && (
            <div style={{ padding: '8px 14px', background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={16} />
              {syncStatus}
            </div>
          )}

          {/* Catálogo de Bloques Disponibles para Agregar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary, #71717a)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Agregar Estación o Equipo al Plano (+ Clic para colocar):
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {DEFAULT_EQUIPMENT_BLOCKS.map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleAddBlock(b)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-card, #ffffff)',
                    border: '1px solid var(--border-color, #e4e4e7)',
                    cursor: 'pointer',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    color: 'var(--text-primary, #09090b)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-color, #6366f1)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color, #e4e4e7)'}
                >
                  <span>{b.icon}</span>
                  <span>{b.name}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #71717a)' }}>({b.widthM}x{b.lengthM}m)</span>
                </button>
              ))}
            </div>
          </div>

          {/* Controles del Elemento Seleccionado */}
          {selectedElement && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(99, 102, 241, 0.08)', padding: '10px 16px', borderRadius: '10px', marginBottom: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                <span>{selectedElement.icon}</span>
                <span>Seleccionado: <strong>{selectedElement.name}</strong> ({selectedElement.widthM}m x {selectedElement.lengthM}m, Rotación: {selectedElement.rotation}°)</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleRotateSelected}
                  style={{ padding: '6px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RotateCw size={13} />
                  Girar 90°
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  style={{ padding: '6px 12px', borderRadius: '6px', background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={13} />
                  Eliminar
                </button>
              </div>
            </div>
          )}

          {/* Lienzo SVG Interactivo (Plano 2D con Muros y Cotas) */}
          <div style={{
            background: 'var(--bg-canvas, #f8fafc)',
            border: '2px solid var(--border-color, #cbd5e1)',
            borderRadius: '12px',
            padding: '24px',
            overflowX: 'auto',
            display: 'flex',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <svg
              width={svgWidth + 60}
              height={svgHeight + 60}
              viewBox={`-30 -30 ${svgWidth + 60} ${svgHeight + 60}`}
              style={{ background: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
            >
              {/* Patrón de cuadrícula (1 metro por cuadro) */}
              <defs>
                <pattern id="gridPattern" width={svgScale} height={svgScale} patternUnits="userSpaceOnUse">
                  <path d={`M ${svgScale} 0 L 0 0 0 ${svgScale}`} fill="none" stroke="#f1f5f9" strokeWidth="1" />
                  <path d={`M ${svgScale/2} 0 L 0 0 0 ${svgScale/2}`} fill="none" stroke="#f8fafc" strokeWidth="0.5" strokeDasharray="2,2" />
                </pattern>
              </defs>

              {/* Fondo cuadriculado */}
              <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#gridPattern)" />

              {/* Muros perimetrales */}
              <rect
                x="0"
                y="0"
                width={svgWidth}
                height={svgHeight}
                fill="none"
                stroke="#1e293b"
                strokeWidth="6"
                strokeLinejoin="round"
              />

              {/* Cotas de medidas en los bordes */}
              <text x={svgWidth / 2} y="-10" textAnchor="middle" fontSize="12" fontWeight="800" fill="#475569">
                ← {widthMeters} metros →
              </text>
              <text x="-12" y={svgHeight / 2} textAnchor="middle" transform={`rotate(-90 -12 ${svgHeight / 2})`} fontSize="12" fontWeight="800" fill="#475569">
                ← {lengthMeters} metros →
              </text>

              {/* Render de Bloques de Equipamiento */}
              {elements.map((el) => {
                const isSel = el.id === selectedElementId;
                const bx = el.x * svgScale;
                const by = el.y * svgScale;
                const bw = el.widthM * svgScale;
                const bh = el.lengthM * svgScale;

                return (
                  <g
                    key={el.id}
                    onClick={() => setSelectedElementId(el.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Sombra si está seleccionado */}
                    {isSel && (
                      <rect
                        x={bx - 4}
                        y={by - 4}
                        width={bw + 8}
                        height={bh + 8}
                        rx="8"
                        fill="none"
                        stroke="var(--accent-color, #6366f1)"
                        strokeWidth="2.5"
                        strokeDasharray="4,4"
                      />
                    )}

                    {/* Caja del bloque */}
                    <rect
                      x={bx}
                      y={by}
                      width={bw}
                      height={bh}
                      rx="6"
                      fill={el.color || '#3b82f6'}
                      fillOpacity="0.88"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />

                    {/* Texto del bloque */}
                    <text
                      x={bx + bw / 2}
                      y={by + (bh / 2) - 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={Math.min(12, Math.max(9, bw / 12))}
                      fontWeight="700"
                    >
                      {el.icon} {el.name.length > 18 ? el.name.substring(0, 16) + '...' : el.name}
                    </text>

                    <text
                      x={bx + bw / 2}
                      y={by + (bh / 2) + 12}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.85)"
                      fontSize="9"
                    >
                      {el.widthM}m x {el.lengthM}m
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Botones de Desplazamiento fino para el elemento seleccionado */}
          {selectedElement && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)', alignSelf: 'center', marginRight: '8px' }}>Mover posición:</span>
              <button type="button" onClick={() => handleMoveSelected(-0.2, 0)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}>← Izq</button>
              <button type="button" onClick={() => handleMoveSelected(0.2, 0)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}>Der →</button>
              <button type="button" onClick={() => handleMoveSelected(0, -0.2)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}>↑ Arriba</button>
              <button type="button" onClick={() => handleMoveSelected(0, 0.2)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}>Abajo ↓</button>
            </div>
          )}

          {/* Resumen de Recomendaciones de Flujo */}
          <div style={{ marginTop: '20px', padding: '14px 18px', borderRadius: '10px', background: `${metrics.circulationColor}08`, border: `1px solid ${metrics.circulationColor}30`, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} color={metrics.circulationColor} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary, #09090b)', lineHeight: '1.4' }}>
              <strong>Evaluación de Flujo:</strong> {metrics.circulationRecommendation} Superficie libre actual: <strong>{metrics.freeM2} m²</strong> de {metrics.totalM2} m².
            </div>
          </div>
        </div>
      ) : (
        /* Pestaña: Render Asistido por Inteligencia Artificial */
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary, #09090b)' }}>
              Generación de Render y Perspectiva Visual con IA
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary, #71717a)' }}>
              Convierte automáticamente las medidas y estaciones de tu croquis en un plano o render ilustrado para impactar a clientes e inversionistas.
            </p>
          </div>

          {/* Selector de Estilo */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {Object.values(CROQUIS_STYLES).map(st => {
              const isSelected = selectedStyle === st.id;
              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStyle(st.id)}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid var(--accent-color, #6366f1)' : '1px solid var(--border-color, #e4e4e7)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-card, #ffffff)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{st.emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isSelected ? 'var(--accent-color, #6366f1)' : 'var(--text-primary, #09090b)' }}>
                    {st.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary, #71717a)', marginTop: '4px', lineHeight: '1.3' }}>
                    {st.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón de Generación */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={handleGenerateAiRender}
              disabled={isGeneratingAi}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: isGeneratingAi ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)',
                opacity: isGeneratingAi ? 0.7 : 1
              }}
            >
              <Sparkles size={18} />
              {isGeneratingAi ? 'Generando Render con IA...' : '✨ Generar Render Visual Ahora'}
            </button>
          </div>

          {/* Visualización del Render Generado */}
          {aiImageUrl ? (
            <div style={{
              borderRadius: '12px',
              border: '1px solid var(--border-color, #e4e4e7)',
              padding: '16px',
              background: '#09090b',
              textAlign: 'center'
            }}>
              <img
                src={aiImageUrl}
                alt="Render Arquitectónico del Croquis"
                style={{
                  maxWidth: '100%',
                  maxHeight: '480px',
                  borderRadius: '8px',
                  objectFit: 'contain',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '14px' }}>
                <a
                  href={aiImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Eye size={15} />
                  Ver en tamaño completo
                </a>
                <a
                  href={aiImageUrl}
                  download="croquis_render.jpg"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'var(--accent-color, #6366f1)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={15} />
                  Descargar Imagen
                </a>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              border: '2px dashed var(--border-color, #e4e4e7)',
              borderRadius: '12px',
              color: 'var(--text-secondary, #71717a)',
              background: 'rgba(0,0,0,0.01)'
            }}>
              <Sparkles size={32} style={{ opacity: 0.5, marginBottom: '12px' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Aún no has generado ningún render visual</div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                Haz clic en el botón superior para transformar tu distribución en un render arquitectónico con IA.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Widget de previsualización para el Documento Maestro / Vista Previa e impresión en PDF
 */
export function CroquisPreviewWidget({ data = {} }) {
  // Soporte tanto para microempresa (layout_vector) como para planta industrial (zones)
  const isIndustrial = Array.isArray(data?.zones) || Array.isArray(data?.layout_industrial?.zones);
  const zones = isIndustrial ? (data?.zones || data?.layout_industrial?.zones) : null;

  const widthMeters = Number(data?.layout_vector?.widthMeters) || 4;
  const lengthMeters = Number(data?.layout_vector?.lengthMeters) || 3;
  const elements = Array.isArray(data?.layout_vector?.elements) && data.layout_vector.elements.length > 0
    ? data.layout_vector.elements
    : [
        { id: 'el_1', name: 'Tarja Sanitaria Doble', x: 0.3, y: 0.3, widthM: 1.4, lengthM: 0.7, color: '#10b981', icon: '🧼' },
        { id: 'el_2', name: 'Mesa de Trabajo Inox', x: 1.1, y: 1.2, widthM: 1.8, lengthM: 0.8, color: '#3b82f6', icon: '🪵' },
        { id: 'el_3', name: 'Horno / Zona Calor', x: 2.8, y: 0.3, widthM: 1.0, lengthM: 0.9, color: '#ef4444', icon: '🔥' },
        { id: 'el_4', name: 'Refrigerador / Vitrina', x: 2.6, y: 1.8, widthM: 1.2, lengthM: 0.8, color: '#06b6d4', icon: '🧊' }
      ];

  const totalM2 = isIndustrial 
    ? zones.reduce((acc, z) => acc + (Number(z.m2) || 0), 0)
    : Math.round(widthMeters * lengthMeters * 10) / 10;

  const svgScale = 75;
  const svgW = widthMeters * svgScale;
  const svgH = lengthMeters * svgScale;
  const aiUrl = data?.layout_vector?.aiRenderUrl;

  if (isIndustrial) {
    return (
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', margin: '16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
            🏭 Distribución de Planta Industrial (Superficie Total: {totalM2.toLocaleString()} m²)
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
            {zones.length} Zonas Operativas
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {zones.map((z, idx) => (
            <div key={z.id || idx} style={{ borderLeft: `4px solid ${z.color || '#3b82f6'}`, background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{z.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                Superficie: <strong>{z.m2} m²</strong> | Tipo: {z.tipo || 'Operativo'}
              </div>
              {z.equipo && <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '4px', fontStyle: 'italic' }}>{z.equipo}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', margin: '16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
          📐 Distribución Espacial de Planta ({totalM2} m² — {widthMeters}m x {lengthMeters}m)
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', background: '#dcfce7', padding: '4px 8px', borderRadius: '6px' }}>
          {elements.length} Estaciones Operativas Ubicadas
        </span>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* SVG Técnico Vectorial */}
        <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '14px', flexShrink: 0 }}>
          <svg width={svgW + 50} height={svgH + 50} viewBox={`-25 -25 ${svgW + 50} ${svgH + 50}`}>
            <rect x="0" y="0" width={svgW} height={svgH} fill="#fcfcfd" stroke="#0f172a" strokeWidth="4" />
            <text x={svgW / 2} y="-8" textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748b">← {widthMeters} m →</text>
            <text x="-8" y={svgH / 2} textAnchor="middle" transform={`rotate(-90 -8 ${svgH / 2})`} fontSize="10" fontWeight="700" fill="#64748b">← {lengthMeters} m →</text>
            
            {elements.map(el => {
              const bx = el.x * svgScale;
              const by = el.y * svgScale;
              const bw = el.widthM * svgScale;
              const bh = el.lengthM * svgScale;
              return (
                <g key={el.id}>
                  <rect x={bx} y={by} width={bw} height={bh} rx="4" fill={el.color || '#3b82f6'} fillOpacity="0.85" stroke="#0f172a" strokeWidth="1" />
                  <text x={bx + bw/2} y={by + bh/2 - 2} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">
                    {el.icon || '▪'} {el.name}
                  </text>
                  <text x={bx + bw/2} y={by + bh/2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="7.5">
                    {el.widthM}x{el.lengthM}m
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Render con IA si existe */}
        {aiUrl && (
          <div style={{ flex: '1', minWidth: '260px', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Render Asistido por IA (Perspectiva Visual)</div>
            <img src={aiUrl} alt="Render de Planta" style={{ width: '100%', maxHeight: '240px', objectFit: 'contain', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
          </div>
        )}
      </div>
    </div>
  );
}
