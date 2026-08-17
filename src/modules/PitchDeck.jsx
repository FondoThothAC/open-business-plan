import React, { useState, useRef } from 'react';
import { usePlan } from '../context/PlanContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Edit3, 
  FileText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PitchDeck() {
  const { planData, updateSection } = usePlan();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const deckRef = useRef(null);
  const projectType = planData.config?.projectType || 'business';

  // Dynamic slide content generation based on the planData context
  const getSlidesData = () => {
    if (projectType === 'social_bid') {
      return [
        {
          title: planData.config.brandKit?.companyName || "Proyecto Social BID",
          subtitle: "Proyecto de Desarrollo Social",
          category: "Presentación",
          link: "/semilla",
          content: `### Resumen del Proyecto\n${planData.semilla?.resumen || '*Por favor, completa el resumen en la sección Semilla.*'}\n\n**Metodología:** Marco Lógico del BID`
        },
        {
          title: "Análisis de Involucrados",
          subtitle: "Stakeholders y Beneficiarios",
          category: "Público Objetivo",
          link: "/modulo/identificacion/involucrados",
          content: `#### Beneficiarios del Proyecto\n${planData.identificacion?.involucrados?.beneficiarios || '*No especificado.*'}\n\n#### Aliados Estratégicos\n${planData.identificacion?.involucrados?.aliados || '*No especificado.*'}`
        },
        {
          title: "El Problema Central",
          subtitle: "Causas y Diagnóstico",
          category: "Diagnóstico",
          link: "/modulo/identificacion/arbol_problemas",
          content: `#### Problema Detectado\n${planData.identificacion?.arbol_problemas?.problema_central || '*No especificado.*'}\n\n#### Causas Principales\n${planData.identificacion?.arbol_problemas?.causas_directas || '*No especificado.*'}`
        },
        {
          title: "Objetivo del Proyecto",
          subtitle: "Resultados Esperados",
          category: "Estrategia",
          link: "/modulo/identificacion/arbol_objetivos",
          content: `#### Fin del Proyecto\n${planData.identificacion?.arbol_objetivos?.objetivo_central || '*No especificado.*'}\n\n#### Medios y Fines\n${planData.identificacion?.arbol_objetivos?.medios || '*No especificado.*'}`
        },
        {
          title: "Componentes y Productos",
          subtitle: "Bienes y servicios entregables",
          category: "MML",
          link: "/modulo/diseno/componentes",
          content: `${planData.diseno?.componentes?.lista_componentes || '*Agrega los entregables clave del proyecto en la sección de Componentes.*'}`
        },
        {
          title: "Gobernanza y EDT",
          subtitle: "Estructura del Trabajo",
          category: "Ejecución",
          link: "/modulo/ejecucion/gobernanza",
          content: `#### Unidad Ejecutora\n${planData.ejecucion?.gobernanza?.unidad_ejecutora || '*No especificado.*'}\n\n#### Paquetes de Trabajo (EDT)\n${planData.ejecucion?.edt?.paquetes_trabajo || '*No especificado.*'}`
        },
        {
          title: "Presupuesto BID",
          subtitle: "Costos e Inversiones Sociales",
          category: "Finanzas",
          link: "/modulo/presupuesto/presupuesto_detallado",
          content: `#### Costos Directos del Proyecto\n${planData.presupuesto?.presupuesto_detallado?.costos_directos || '*No especificado.*'}\n\n#### Evaluación Socioeconómica\n${planData.presupuesto?.evaluacion_exante?.beneficios_sociales || '*No especificado.*'}`
        },
        {
          title: "Sostenibilidad",
          subtitle: "Permanencia del Impacto",
          category: "Sostenibilidad",
          link: "/modulo/presupuesto/sostenibilidad",
          content: `${planData.presupuesto?.sostenibilidad?.sostenibilidad_financiera || '*Define la estrategia de continuidad del proyecto.*'}`
        }
      ];
    } else {
      return [
        {
          title: planData.config.brandKit?.companyName || "Mi Negocio",
          subtitle: "Plan de Negocios Maestro",
          category: "Portada",
          link: "/semilla",
          content: `### Propuesta de Valor\n${planData.naturaleza?.introduccion?.propuesta_valor || '*Define tu propuesta de valor en Justificación y Origen.*'}\n\n**Misión:** ${planData.naturaleza?.identidad?.mision || '*No configurada.*'}`
        },
        {
          title: "El Problema en el Mercado",
          subtitle: "Necesidad no satisfecha",
          category: "Problema",
          link: "/modulo/naturaleza/introduccion",
          content: `${planData.naturaleza?.introduccion?.necesidad || '*Describe el problema o necesidad del mercado aquí.*'}`
        },
        {
          title: "La Solución / Producto",
          subtitle: "Descripción y Beneficios",
          category: "Solución",
          link: "/modulo/mercado/analisis",
          content: `#### El Producto / Servicio\n${planData.mercado?.analisis?.producto || '*Describe tu solución.*'}\n\n#### Valor Agregado\n${planData.mercado?.analisis?.valor || '*No especificado.*'}`
        },
        {
          title: "Tamaño de Mercado (TAM/SAM/SOM)",
          subtitle: "Segmentación y Buyer Persona",
          category: "Mercado",
          link: "/modulo/mercado/segmentacion",
          content: `#### Proyecciones de Mercado\n* **TAM (Mercado Total):** ${planData.mercado?.segmentacion?.tam || 'No calculado'}\n* **SAM (Mercado Disponible):** ${planData.mercado?.segmentacion?.sam || 'No calculado'}\n* **SOM (Mercado Objetivo):** ${planData.mercado?.segmentacion?.som || 'No calculado'}\n\n#### Perfil del Cliente\n${planData.mercado?.segmentacion?.perfil || 'No especificado'}`
        },
        {
          title: "Ventaja Competitiva",
          subtitle: "Competidores directos e indirectos",
          category: "Competencia",
          link: "/modulo/mercado/competencia",
          content: `#### Competencia Detectada\n${planData.mercado?.competencia?.competidores || '*No especificado.*'}\n\n#### Ventajas del Negocio\n${planData.mercado?.competencia?.ventajas || '*Describe por qué ganarás en el mercado.*'}`
        },
        {
          title: "Estrategia de Ventas y Canales",
          subtitle: "Estrategia Go-To-Market",
          category: "Marketing",
          link: "/modulo/mercado/comercializacion",
          content: `#### Canales de Distribución\n${planData.mercado?.comercializacion?.distribucion || '*No especificado.*'}\n\n#### Estrategia de Precios\n${planData.mercado?.ventas?.estrategia || '*No especificado.*'}`
        },
        {
          title: "Operaciones y Procesos",
          subtitle: "Producción y Eficiencia",
          category: "Operaciones",
          link: "/modulo/tecnico/operacion",
          content: `#### Proceso Operativo\n${planData.tecnico?.operacion?.proceso || '*Define el flujo de operaciones.*'}\n\n#### Tecnología Requerida\n${planData.tecnico?.operacion?.tecnologia || '*No especificada.*'}`
        },
        {
          title: "Proyecciones Financieras",
          subtitle: "CAPEX, OPEX y Rentabilidad",
          category: "Finanzas",
          link: "/modulo/organizacion/inversion",
          content: `#### Requerimiento de Inversión Inicial (CAPEX)\n${planData.organizacion?.inversion?.inversion_fija || 'No calculado.'}\n\n#### Rentabilidad\n* **Punto de Equilibrio:** ${planData.organizacion?.rentabilidad?.punto_equilibrio || 'No especificado.'}\n* **Indicadores Financieros:** ${planData.organizacion?.rentabilidad?.indicadores || 'No especificados.'}`
        }
      ];
    }
  };

  const slides = getSlidesData();

  // Fullscreen controls using the standard Fullscreen API
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      deckRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        alert(`Error al activar pantalla completa: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Synchronise full document resize listener for escape key on fullscreen
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleTextChange = (e) => {
    // If the user chooses to edit the slide manually, we save it locally to the planData context
    const currentSlideData = slides[currentSlide];
    const linkParts = currentSlideData.link.split('/');
    if (linkParts.length === 4) {
      const [, , pillar, module] = linkParts;
      // We parse the markdown back (simplistic approach - editable for fine-tuning)
      const fieldKey = Object.keys(planData[pillar]?.[module] || {})[0]; // Guess first field
      if (fieldKey) {
        updateSection(pillar, module, fieldKey, e.target.value);
      }
    } else if (linkParts.length === 2 && linkParts[1] === 'semilla') {
      updateSection('semilla', 'resumen', e.target.value);
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="module-view" style={{ animation: 'slideUp 0.4s ease-out' }}>
      <div className="view-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="view-title">Pitch Deck de Inversión</h1>
          <p className="text-secondary mt-1">
            Diapositivas dinámicas listas para presentar generadas a partir de tu plan de negocio.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={toggleFullscreen}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isFullscreen ? "Salir" : "Presentar"}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Slide Outline/Navigation Sidebar */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1rem', 
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            maxHeight: '520px',
            overflowY: 'auto'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', padding: '0.25rem 0.5rem 0.5rem 0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
            Contenido del Deck
          </div>
          {slides.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentSlide(idx);
                setIsEditing(false);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                padding: '0.65rem 0.8rem',
                border: 'none',
                borderRadius: '8px',
                background: currentSlide === idx ? 'var(--accent-color)' : 'transparent',
                color: currentSlide === idx ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%'
              }}
              className="slide-selector-btn"
            >
              <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>
                Diapositiva {idx + 1} • {slide.category}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: currentSlide === idx ? 'white' : 'var(--text-primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                {slide.title}
              </span>
            </button>
          ))}
        </div>

        {/* Main Presentation Screen */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div 
            ref={deckRef}
            className="glass-panel"
            style={{
              aspectRatio: '16/9',
              width: '100%',
              borderRadius: '20px',
              padding: isFullscreen ? '4rem' : '3rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: theme => theme === 'light' 
                ? 'linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)' 
                : 'linear-gradient(135deg, #090a0f 0%, #151928 100%)',
              border: '1.5px solid var(--border-color)',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
          >
            {/* Background design elements */}
            <div 
              style={{
                position: 'absolute',
                top: '-30%',
                right: '-20%',
                width: '60%',
                height: '80%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />
            <div 
              style={{
                position: 'absolute',
                bottom: '-20%',
                left: '-10%',
                width: '50%',
                height: '70%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />

            {/* Slide Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', zIndex: 2 }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-color)', letterSpacing: '0.05em' }}>
                  {currentSlideData.category}
                </span>
                <h2 style={{ fontSize: isFullscreen ? '2.5rem' : '1.8rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  {currentSlideData.title}
                </h2>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {currentSlideData.subtitle}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, padding: '0.25rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: '20px', background: 'rgba(0,0,0,0.2)' }}>
                {currentSlide + 1} / {slides.length}
              </div>
            </div>

            {/* Slide Content Body */}
            <div style={{ flex: 1, margin: '2rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 2 }}>
              {isEditing ? (
                <textarea
                  value={currentSlideData.content}
                  onChange={handleTextChange}
                  className="form-control"
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '180px',
                    fontSize: '1rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    color: 'white',
                    border: '1px solid var(--accent-color)',
                    fontFamily: 'monospace'
                  }}
                />
              ) : (
                <div className="markdown-content" style={{ fontSize: isFullscreen ? '1.25rem' : '1.05rem', color: 'var(--text-primary)', lineHeight: '1.7' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentSlideData.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Slide Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', zIndex: 2 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {planData.config.brandKit?.companyName || "Plan Maestro"} • {projectType === 'social_bid' ? "BID Social" : "Plan Comercial"}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Open Business Plan v2
              </span>
            </div>
          </div>

          {/* Slider controls bar */}
          <div 
            className="glass-panel" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '0.75rem 1.5rem',
              borderRadius: '14px' 
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={handlePrev}
                disabled={currentSlide === 0}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', opacity: currentSlide === 0 ? 0.4 : 1 }}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
              <button 
                onClick={handleNext}
                disabled={currentSlide === slides.length - 1}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', opacity: currentSlide === slides.length - 1 ? 0.4 : 1 }}
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setIsEditing(prev => !prev)}
                className={`btn ${isEditing ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                title="Editar borrador del plan para esta slide"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? "Ver Vista Previa" : "Editar Texto"}</span>
              </button>

              <a 
                href={currentSlideData.link}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', textDecoration: 'none' }}
              >
                <FileText className="w-4 h-4" />
                <span>Ir al Módulo</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
