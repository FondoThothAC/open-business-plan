import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Check, X, Palette, Image as ImageIcon, Download } from 'lucide-react';
import { LOGO_STYLES, buildLogoPrompt, generateLogoVariants } from '../lib/logoGenerator';

export default function LogoGeneratorModal({
  isOpen,
  onClose,
  onSelectLogo,
  initialBrandData = {},
  projectId = '',
  projectType = 'negocios',
  pollinationsKey = ''
}) {
  const [selectedStyle, setSelectedStyle] = useState('flat_vector');
  const [companyName, setCompanyName] = useState(initialBrandData.companyName || '');
  const [giro, setGiro] = useState(initialBrandData.giro || '');
  const [isotipoDesc, setIsotipoDesc] = useState(initialBrandData.isotipoDesc || '');
  const [primaryColor, setPrimaryColor] = useState(initialBrandData.primaryColor || '#6366f1');
  const [secondaryColor, setSecondaryColor] = useState(initialBrandData.secondaryColor || '#10b981');
  
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [savingStatus, setSavingStatus] = useState('');

  // Sincronizar datos iniciales al abrir
  useEffect(() => {
    if (isOpen) {
      setCompanyName(initialBrandData.companyName || '');
      setGiro(initialBrandData.giro || '');
      setIsotipoDesc(initialBrandData.isotipoDesc || '');
      setPrimaryColor(initialBrandData.primaryColor || '#6366f1');
      setSecondaryColor(initialBrandData.secondaryColor || '#10b981');
      
      const p = buildLogoPrompt({
        companyName: initialBrandData.companyName,
        giro: initialBrandData.giro,
        isotipoDesc: initialBrandData.isotipoDesc,
        primaryColor: initialBrandData.primaryColor,
        secondaryColor: initialBrandData.secondaryColor
      }, selectedStyle);
      setCustomPrompt(p);
      
      if (variants.length === 0) {
        handleGenerate(selectedStyle);
      }
    }
  }, [isOpen]);

  // Actualizar prompt sugerido al cambiar de estilo
  const handleStyleChange = (styleKey) => {
    setSelectedStyle(styleKey);
    const p = buildLogoPrompt({
      companyName,
      giro,
      isotipoDesc,
      primaryColor,
      secondaryColor
    }, styleKey);
    setCustomPrompt(p);
  };

  const handleGenerate = async (styleToUse = selectedStyle) => {
    setIsGenerating(true);
    setSavingStatus('');
    setSelectedVariantId(null);

    const brandData = {
      companyName,
      giro,
      isotipoDesc,
      primaryColor,
      secondaryColor
    };

    try {
      // 1. Intentar llamar al backend para generar y persistir si es necesario
      const response = await fetch('http://localhost:3001/api/logo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...brandData,
          style: styleToUse,
          customPrompt,
          variantsCount: 4,
          apiKey: pollinationsKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.variants && data.variants.length > 0) {
          setVariants(data.variants);
          setSelectedVariantId(data.variants[0].id);
          return;
        }
      }
      
      // Fallback directo en cliente
      const clientResult = await generateLogoVariants(brandData, {
        style: styleToUse,
        customPrompt,
        variantsCount: 4,
        apiKey: pollinationsKey
      });
      setVariants(clientResult.variants);
      if (clientResult.variants.length > 0) {
        setSelectedVariantId(clientResult.variants[0].id);
      }
    } catch (err) {
      console.warn('Error generando en backend, usando fallback local:', err);
      const clientResult = await generateLogoVariants(brandData, {
        style: styleToUse,
        customPrompt,
        variantsCount: 4,
        apiKey: pollinationsKey
      });
      setVariants(clientResult.variants);
      if (clientResult.variants.length > 0) {
        setSelectedVariantId(clientResult.variants[0].id);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyLogo = async () => {
    const chosen = variants.find(v => v.id === selectedVariantId);
    if (!chosen) return;

    setSavingStatus('Guardando logotipo en el proyecto...');
    
    // Guardar en el servidor si hay proyecto activo
    if (projectId) {
      try {
        await fetch('http://localhost:3001/api/logo/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            projectType,
            dataUrl: chosen.dataUrl
          })
        });
      } catch (e) {
        console.warn('No se pudo guardar archivo en disco:', e);
      }
    }

    if (onSelectLogo) {
      onSelectLogo(chosen.dataUrl, {
        primaryColor,
        secondaryColor,
        style: selectedStyle,
        prompt: customPrompt
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div style={{
        background: 'var(--bg-dark, #0f172a)',
        border: '1px solid var(--border-color, #334155)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '860px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        color: 'var(--text-primary, #f8fafc)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-color, #334155)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '10px', color: '#6366f1' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Generador de Logotipos con IA</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                Isotipos vectoriales profesionales generados con Pollinations Flux / SDXL y motores nativos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Selector de Estilo */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>
              1. Selecciona el Estilo Visual
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {Object.values(LOGO_STYLES).map(st => {
                const isActive = selectedStyle === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleStyleChange(st.id)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: `1.5px solid ${isActive ? 'var(--accent-color, #6366f1)' : 'var(--border-color, #334155)'}`,
                      background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-panel-hover, rgba(255,255,255,0.03))',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{st.emoji}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{st.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.3 }}>{st.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parámetros de Marca */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>
                Nombre de la Marca
              </label>
              <input
                type="text"
                className="form-control"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Ej. Veterinaria Patitas"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>
                Descripción del Isotipo / Símbolo
              </label>
              <input
                type="text"
                className="form-control"
                value={isotipoDesc}
                onChange={e => setIsotipoDesc(e.target.value)}
                placeholder="Ej. Huella con corazón tierno"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
              />
            </div>
          </div>

          {/* Paleta de Colores del Logo */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Color Primario:</label>
              <input
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                style={{ width: '36px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
              />
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{primaryColor}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Color Secundario:</label>
              <input
                type="color"
                value={secondaryColor}
                onChange={e => setSecondaryColor(e.target.value)}
                style={{ width: '36px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
              />
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{secondaryColor}</span>
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="btn btn-primary"
              style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '10px'
              }}
            >
              <RefreshCw size={15} className={isGenerating ? 'animate-spin' : ''} />
              <span>{isGenerating ? 'Generando Variantes...' : 'Regenerar Variantes'}</span>
            </button>
          </div>

          {/* Prompt en vivo editable */}
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>
              Prompt en Inglés Optimizado para IA (Editable):
            </label>
            <input
              type="text"
              className="form-control"
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)' }}
            />
          </div>

          {/* Galería de 4 Variantes */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'block' }}>
              2. Elige tu Logotipo Favorito
            </label>

            {isGenerating ? (
              <div style={{
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '16px',
                border: '1px dashed var(--border-color)'
              }}>
                <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--accent-color)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Generando 4 variantes vectoriales en alta resolución...
                </span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {variants.map((v, i) => {
                  const isSelected = selectedVariantId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      style={{
                        position: 'relative',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: `2px solid ${isSelected ? 'var(--accent-color, #6366f1)' : 'var(--border-color, #334155)'}`,
                        background: '#ffffff',
                        aspectRatio: '1',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 0 0 3px rgba(99, 102, 241, 0.35)' : 'none'
                      }}
                    >
                      <img
                        src={v.dataUrl}
                        alt={`Variante ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />

                      {/* Badge selector */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: isSelected ? '#4f46e5' : 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}>
                        {isSelected ? <Check size={14} /> : <span style={{ fontSize: '11px', fontWeight: 800 }}>{i + 1}</span>}
                      </div>

                      {/* Badge proveedor */}
                      <span style={{
                        position: 'absolute',
                        bottom: '6px',
                        left: '6px',
                        fontSize: '9px',
                        fontWeight: 700,
                        background: 'rgba(15, 23, 42, 0.75)',
                        color: '#ffffff',
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}>
                        {v.provider === 'pollinations_turbo' ? '⚡ Flux Turbo' : '📐 SVG Pro'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderTop: '1px solid var(--border-color, #334155)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {savingStatus || (selectedVariantId ? 'Variante lista para aplicar al plan' : 'Selecciona una variante')}
          </span>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleApplyLogo}
              disabled={!selectedVariantId || isGenerating}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.5rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '10px'
              }}
            >
              <Check size={16} />
              <span>Aplicar Logotipo al Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
