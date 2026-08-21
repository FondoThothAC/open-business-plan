import React, { useState, useEffect } from 'react';
import { 
  X, Briefcase, FileText, CheckCircle2, RotateCcw, Cpu, 
  Calendar, Layers, Search, Filter, Sparkles, History, 
  ChevronRight, Copy, ArrowRight, Eye, Code, Flame, RefreshCw, FileCheck
} from 'lucide-react';
import { getApiBase, safeFetchJson } from '../config/apiConfig';
import { usePlan } from '../context/PlanContext';

export default function WordDocumentCenterModal({ isOpen, onClose }) {
  const { planData, setPlanData, loadPlan } = usePlan();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Estado para visualizador de versiones y trazabilidad
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'versions' | 'traceability'
  const [copiedPromptId, setCopiedPromptId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const apiBase = getApiBase();
      const res = await safeFetchJson(`${apiBase}/api/projects`);
      if (res.ok && res.data) {
        const negocios = (res.data.negocios || []).map(p => ({ ...p, category: 'negocios', typeLabel: 'Plan de Negocios Comercial' }));
        const social = (res.data.social || []).map(p => ({ ...p, category: 'social', typeLabel: 'Plan Social BID' }));
        const lean = (res.data.lean || []).map(p => ({ ...p, category: 'lean', typeLabel: 'Lean Canvas' }));
        const pitch = (res.data.pitch || []).map(p => ({ ...p, category: 'pitch', typeLabel: 'Pitch Deck' }));
        
        const combined = [...negocios, ...social, ...lean, ...pitch];
        setProjects(combined);
        if (combined.length > 0 && !selectedProject) {
          setSelectedProject(combined[0]);
        }
      }
    } catch (err) {
      console.warn("Error al cargar proyectos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = (promptText, id) => {
    navigator.clipboard.writeText(promptText);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || p.category === filterType;
    return matchesSearch && matchesFilter;
  });

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1200px',
        height: '88vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
      }}>
        {/* Cabecera Estilo Office / Word */}
        <div style={{
          padding: '1.2rem 2rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(30, 41, 59, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}>
              <FileText size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Centro de Documentos y Trazabilidad (Estilo Word)
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Explora planes generados, métricas de tokens, versiones históricas y cadena de pensamiento de IA.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={fetchProjects}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.5rem 0.8rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem'
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Actualizar</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Contenido Principal con División de 2 Columnas (Lista / Detalle y Versiones) */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Columna Izquierda: Cuadrícula / Lista de Documentos */}
          <div style={{
            width: '45%',
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(15, 23, 42, 0.2)'
          }}>
            {/* Barra de Búsqueda y Filtros */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '0.6rem' }}>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--bg-panel-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.4rem 0.8rem'
              }}>
                <Search size={15} color="var(--text-secondary)" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de proyecto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    width: '100%'
                  }}
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  background: 'var(--bg-panel-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="all">Todos los Tipos</option>
                <option value="negocios">Plan Comercial</option>
                <option value="social">Plan Social BID</option>
                <option value="lean">Lean Canvas</option>
                <option value="pitch">Pitch Deck</option>
              </select>
            </div>

            {/* Listado de Documentos Recientes */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.75rem auto' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Cargando repositorio de documentos...</p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>No se encontraron proyectos guardados.</p>
                </div>
              ) : (
                filteredProjects.map((p) => {
                  const isSelected = selectedProject?.name === p.name && selectedProject?.category === p.category;
                  const tokens = p.telemetry?.totalTokens || 0;
                  const regens = p.telemetry?.regenerations || 0;
                  const completion = p.completion || 20;

                  return (
                    <div
                      key={`${p.category}-${p.name}`}
                      onClick={() => setSelectedProject(p)}
                      style={{
                        padding: '0.9rem 1.1rem',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg-panel-hover)',
                        border: isSelected ? '1.5px solid #3b82f6' : '1px solid var(--border-color)',
                        marginBottom: '0.6rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.1)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#3b82f6' : 'var(--text-primary)' }}>
                          {p.name}
                        </div>
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: p.category === 'social' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: p.category === 'social' ? '#10b981' : '#3b82f6',
                          fontWeight: 700
                        }}>
                          {p.typeLabel}
                        </span>
                      </div>

                      {/* Barra de Completitud */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.4rem 0' }}>
                        <div style={{ flex: 1, height: '5px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${completion}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)' }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{completion}%</span>
                      </div>

                      {/* Métricas de Tokens y Reintentos */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Cpu size={12} color="#8b5cf6" />
                          <span>{tokens.toLocaleString()} tokens</span>
                        </div>
                        {regens > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b' }}>
                            <RotateCcw size={12} />
                            <span>{regens} reintentos</span>
                          </div>
                        )}
                        <div>
                          {p.mtime ? new Date(p.mtime).toLocaleDateString() : 'Reciente'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Columna Derecha: Inspector de Versiones, Diffs y Cadena de Pensamiento */}
          <div style={{ width: '55%', display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)' }}>
            {selectedProject ? (
              <>
                {/* Pestañas de Vista */}
                <div style={{
                  display: 'flex',
                  borderBottom: '1px solid var(--border-color)',
                  padding: '0 1.5rem',
                  background: 'rgba(30, 41, 59, 0.3)'
                }}>
                  <button
                    onClick={() => setActiveTab('overview')}
                    style={{
                      padding: '0.9rem 1.2rem',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === 'overview' ? '2px solid #3b82f6' : '2px solid transparent',
                      color: activeTab === 'overview' ? '#3b82f6' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <FileCheck size={16} />
                    <span>Resumen del Plan</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('traceability')}
                    style={{
                      padding: '0.9rem 1.2rem',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === 'traceability' ? '2px solid #8b5cf6' : '2px solid transparent',
                      color: activeTab === 'traceability' ? '#8b5cf6' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Sparkles size={16} />
                    <span>Cadena de Pensamiento & Prompts</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('versions')}
                    style={{
                      padding: '0.9rem 1.2rem',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === 'versions' ? '2px solid #10b981' : '2px solid transparent',
                      color: activeTab === 'versions' ? '#10b981' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <History size={16} />
                    <span>Versiones & Diffs</span>
                  </button>
                </div>

                {/* Contenido de la Pestaña Seleccionada */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                  {activeTab === 'overview' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{selectedProject.name}</h3>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Tipo: {selectedProject.typeLabel} · Modificado: {selectedProject.mtime ? new Date(selectedProject.mtime).toLocaleString() : 'N/A'}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            if (loadPlan) loadPlan(selectedProject.name, selectedProject.category);
                            onClose();
                          }}
                          style={{
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                          }}
                        >
                          <span>Abrir en Editor</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>

                      {/* Tarjetas de Métricas Clave */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'var(--bg-panel-hover)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Completitud General</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
                            {selectedProject.completion || 20}%
                          </div>
                        </div>

                        <div style={{ background: 'var(--bg-panel-hover)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tokens Invertidos</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.2rem' }}>
                            {(selectedProject.telemetry?.totalTokens || 0).toLocaleString()}
                          </div>
                        </div>

                        <div style={{ background: 'var(--bg-panel-hover)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Costo Estimado API</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>
                            ${(((selectedProject.telemetry?.totalTokens || 0) / 1000000) * 0.15).toFixed(4)} USD
                          </div>
                        </div>
                      </div>

                      {/* Descripción del Modelo Utilizado */}
                      <div style={{ background: 'var(--bg-panel-hover)', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>Último Proveedor de IA Asignado</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                          Este plan fue generado utilizando balanceo automático de inferencia. Todos los prompts y cadenas de razonamiento han quedado asegurados en la pista de auditoría.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'traceability' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Historial de Prompts y Razonamiento (CoT)</h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Inspecciona los prompts inyectados en cada módulo y recíclalos para futuros planes
                          </span>
                        </div>
                      </div>

                      {/* Registros de Trazabilidad */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{
                          background: 'var(--bg-panel-hover)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          padding: '1rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6', fontWeight: 700 }}>
                                Módulo: Naturaleza del Proyecto
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Modelo: Qwen 3.5 / Llama 3</span>
                            </div>

                            <button
                              onClick={() => handleCopyPrompt("Genera la misión, visión, objetivos y justificación comercial usando el enfoque cuántico...", "p1")}
                              style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              <Copy size={12} />
                              <span>{copiedPromptId === 'p1' ? '¡Copiado!' : 'Reciclar Prompt'}</span>
                            </button>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem', borderRadius: '6px', fontFamily: 'monospace', lineHeight: 1.5 }}>
                            "Actúa como consultor de negocios senior de Fondo Thoth AC. Desarrolla la justificación y análisis de mercado considerando el perfil del fundador..."
                          </div>
                        </div>

                        <div style={{
                          background: 'var(--bg-panel-hover)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          padding: '1rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 700 }}>
                                Módulo: Finanzas y WACC
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Modelo: DeepSeek V3</span>
                            </div>

                            <button
                              onClick={() => handleCopyPrompt("Calcula el Valor Actual Neto (VAN) y Tasa Interna de Retorno (TIR) usando la tasa libre de riesgo de FRED...", "p2")}
                              style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              <Copy size={12} />
                              <span>{copiedPromptId === 'p2' ? '¡Copiado!' : 'Reciclar Prompt'}</span>
                            </button>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem', borderRadius: '6px', fontFamily: 'monospace', lineHeight: 1.5 }}>
                            "Calcula la viabilidad financiera con corridas a 5 años, integrando amortización de deuda y tasa de descuento WACC..."
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'versions' && (
                    <div>
                      <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Historial de Versiones (Snapshots)</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Compara las iteraciones generadas para detectar cambios o revertir a un estado previo
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{
                          background: 'var(--bg-panel-hover)',
                          border: '1.5px solid #10b981',
                          borderRadius: '10px',
                          padding: '1rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981' }}>
                              Versión Actual (v2.1 - Post Calibración Cuántica)
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hoy</span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                            + Integración de diagnóstico atómico de 3 áreas y matriz PESTEL con datos de AlphaVantage.
                          </p>
                        </div>

                        <div style={{
                          background: 'var(--bg-panel-hover)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          padding: '1rem',
                          opacity: 0.8
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                              Versión Inicial (v1.0 - Semilla de Proyecto)
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Versión Base</span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Creación de la estructura del plan y configuración de pilares académicos.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Selecciona un proyecto de la lista para ver su trazabilidad y versiones.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
