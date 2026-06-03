import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileSpreadsheet, LineChart, PieChart, Printer, Settings, Eye, BrainCircuit, ChevronDown, ChevronRight, Save, FilePlus, FolderOpen, Check, Image as ImageIcon, Sun, Moon, Sprout, Copy } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { PROJECT_EXAMPLES } from '../lib/projects_db';
import { FRAMEWORKS } from '../config/frameworks';
import ActivityFeed from './ActivityFeed';
import GenerationControls from './GenerationControls';


const PILLAR_ICONS = {
  naturaleza: LayoutDashboard,
  mercado: FileSpreadsheet,
  tecnico: Settings,
  organizacion: PieChart,
  finanzas: LineChart
};

export default function Layout() {
  const { 
    planData, updateConfig, createNewProject, loadProject, loadSavedProject, saveStatus, updateProjectName,
    manualSaveProject, saveProjectAs,
    generationStatus, generationProgress, startIndustrialization, pauseIndustrialization, stopIndustrialization, getProjectCompletion
  } = usePlan();
  
  const [expandedPillars, setExpandedPillars] = useState(['naturaleza']); // Collapse others by default
  const [planType, setPlanType] = useState('negocios');
  const [aiStatus, setAiStatus] = useState('offline');
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedProjects, setSavedProjects] = useState({ negocios: [], social: [] });
  const navigate = useNavigate();

  // State for Custom Industrialization Modal
  const [showIndustrializeModal, setShowIndustrializeModal] = useState(false);
  const [industrializeQueueCandidates, setIndustrializeQueueCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState({}); // { [moduleKey]: boolean }

  useEffect(() => {
    const checkAi = async () => {
      try {
        const res = await fetch(planData?.config?.ai?.endpoint || 'http://localhost:11434/api/tags');
        if (res.ok) setAiStatus('online');
        else setAiStatus('offline');
      } catch (e) {
        setAiStatus('offline');
      }
    };
    checkAi();
    const timer = setInterval(checkAi, 10000);
    return () => clearInterval(timer);
  }, [planData?.config?.ai?.endpoint]);

  useEffect(() => {
    if (showLoadModal) {
      fetch('http://localhost:3001/api/projects')
        .then(res => res.json())
        .then(data => setSavedProjects(data))
        .catch(err => console.error('Error fetching saved projects:', err));
    }
  }, [showLoadModal]);

  const togglePillar = (id) => {
    setExpandedPillars(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const openIndustrializeConfig = () => {
    const projectType = planData?.config?.projectType || 'business';
    const framework = FRAMEWORKS[projectType] || FRAMEWORKS.business;
    const candidates = [];
    const initialSelected = {};

    framework.pillars.forEach(pillar => {
      pillar.modules.forEach(mod => {
        const moduleData = planData[pillar.key]?.[mod.key] || {};
        const emptyFields = mod.fields.filter(f => !moduleData[f] || String(moduleData[f]).length < 10);
        
        if (emptyFields.length > 0) {
          const candidate = {
            pillar: pillar.key,
            pillarTitle: pillar.title,
            modKey: mod.key,
            title: mod.title,
            emptyFields,
            totalFields: mod.fields.length
          };
          candidates.push(candidate);
          initialSelected[`${pillar.key}.${mod.key}`] = true; // Selected by default
        }
      });
    });

    if (candidates.length === 0) {
      alert('¡Todo el proyecto ya está completamente generado!');
      return;
    }

    setIndustrializeQueueCandidates(candidates);
    setSelectedCandidates(initialSelected);
    setShowIndustrializeModal(true);
  };

  const handleStartIndustrialization = () => {
    const customQueue = industrializeQueueCandidates.filter(
      c => selectedCandidates[`${c.pillar}.${c.modKey}`]
    );

    if (customQueue.length === 0) {
      alert('Por favor selecciona al menos un módulo para generar.');
      return;
    }

    setShowIndustrializeModal(false);
    startIndustrialization(customQueue);
  };

  return (
    <div className={`app-container theme-${planData?.config?.theme || 'light'}`}>
      {/* Sidebar Navigation */}
      <aside className="sidebar no-print">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <Sprout size={24} color="var(--accent-color)" />
            </div>
            <div className="logo-text">
              <h1>Open Business Plan</h1>
              <span>Business Engine</span>
            </div>
          </div>

          <div className="global-progress-box">
            <div className="progress-labels">
              <span>Progreso Global</span>
              <span>{getProjectCompletion ? getProjectCompletion() : 0}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${getProjectCompletion ? getProjectCompletion() : 0}%` }} />
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Paso 0</span>
            <NavLink to="/semilla" className="nav-item">
              <div className="nav-icon-box"><Sprout size={18} /></div>
              <span>🌱 Semilla del Proyecto</span>
            </NavLink>
          </div>

          <div className="nav-section">
            <span className="nav-section-title">Pilares Académicos</span>
            {(FRAMEWORKS[planData?.config?.projectType || 'business'] || FRAMEWORKS.business).pillars.map(pillar => {
              const Icon = PILLAR_ICONS[pillar.key] || LayoutDashboard;
              const isExpanded = expandedPillars.includes(pillar.key);

              return (
                <div key={pillar.key} className="pillar-group">
                  <div className={`pillar-header ${isExpanded ? 'active' : ''}`} onClick={() => togglePillar(pillar.key)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="nav-icon-box"><Icon size={18} /></div>
                      <span>{pillar.title}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                  
                  {isExpanded && (
                    <div className="pillar-modules">
                      {pillar.modules.map(module => (
                        <NavLink 
                           key={module.key} 
                           to={`/modulo/${pillar.key}/${module.key}`} 
                           className="module-item"
                        >
                          {module.title}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="nav-section" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <span className="nav-section-title">Exportación y Ajustes</span>
            <NavLink to="/preview" className="nav-item">
              <div className="nav-icon-box"><Eye size={18} /></div>
              <span>Vista Previa del Plan</span>
            </NavLink>
            <NavLink to="/anexos" className="nav-item">
              <div className="nav-icon-box"><ImageIcon size={18} /></div>
              <span>Anexos y Evidencia</span>
            </NavLink>
            <NavLink to="/configuracion" className="nav-item">
              <div className="nav-icon-box"><Settings size={18} /></div>
              <span>Configuración</span>
            </NavLink>
          </div>

          <div className="nav-section" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Estado del Motor IA</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '8px', height: '8px', borderRadius: '50%', 
                background: aiStatus === 'online' ? 'var(--success-color)' : 'var(--danger-color)', 
                boxShadow: `0 0 8px ${aiStatus === 'online' ? 'var(--success-color)' : 'var(--danger-color)'}` 
              }}></div>
              <span style={{ 
                fontSize: '0.75rem', 
                color: aiStatus === 'online' ? 'var(--success-color)' : 'var(--danger-color)', 
                fontWeight: 'bold' 
              }}>
                {aiStatus === 'online' ? 'CEREBRO ACTIVO' : 'SIN CONEXIÓN'}
              </span>
            </div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.4' }}>
              {aiStatus === 'online' 
                ? 'El cerebro de IA está listo para procesar tu plan.' 
                : <span>Ejecuta <code style={{ color: 'var(--accent-color)' }}>activar_cerebro.bat</code> para iniciar la IA.</span>}
            </p>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header no-print" style={{ height: 'auto', minHeight: '70px', padding: '0.5rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
            
            {/* Left: Project Identity & Type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 auto', minWidth: '300px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <select 
                  value={planType} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setPlanType(val);
                    if (val === 'lean') navigate('/lean-canvas');
                    else if (val === 'pitch') navigate('/pitch-deck');
                    else navigate('/modulo/naturaleza/introduccion');
                  }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', outline: 'none', padding: 0 }}
                >
                  <option value="negocios">Plan Maestro</option>
                  <option value="lean">Lean Startup</option>
                  <option value="pitch">Pitch Deck</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Proyecto:</span>
                  <input 
                    type="text"
                    value={planData?.config?.brandKit?.companyName || ''}
                    onChange={(e) => updateProjectName && updateProjectName(e.target.value)}
                    placeholder="Nombre del negocio..."
                    style={{ 
                      background: 'transparent', border: 'none', color: 'var(--accent-color)', 
                      fontWeight: '700', fontSize: '0.85rem', outline: 'none', width: '150px'
                    }}
                  />
                </div>
              </div>

              <div style={{ borderLeft: '1px solid var(--border-color)', height: '30px', margin: '0 0.5rem' }} />

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>CARGAR EJEMPLO</span>
                <select 
                  onChange={(e) => loadProject && loadProject(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', outline: 'none', padding: 0 }}
                  defaultValue=""
                >
                  <option value="" disabled>Seleccionar...</option>
                  {Object.entries(PROJECT_EXAMPLES).map(([id, project]) => (
                    <option key={id} value={id}>{project.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right: Actions & Tools */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                {generationStatus === 'idle' ? (
                  <button 
                    className="btn btn-ia" 
                    style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', height: '36px' }}
                    onClick={openIndustrializeConfig}
                  >
                    <BrainCircuit className="w-4 h-4" />
                    <span>Industrializar</span>
                  </button>
                ) : (
                  <GenerationControls />
                )}

                <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }} />

                <div style={{ display: 'flex', gap: '2px' }}>
                  <button className="icon-btn-rounded" title="Nuevo Plan" onClick={createNewProject}>
                    <FilePlus className="w-4 h-4" />
                  </button>
                  <button className="icon-btn-rounded" title="Abrir Plan" onClick={() => setShowLoadModal(true)}>
                    <FolderOpen className="w-4 h-4" />
                  </button>
                  <button className="icon-btn-rounded" title="Guardar Plan (Manual)" onClick={() => manualSaveProject && manualSaveProject()}>
                    <Save className="w-4 h-4" />
                  </button>
                  <button className="icon-btn-rounded" title="Guardar Como..." onClick={() => saveProjectAs && saveProjectAs()}>
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: saveStatus === 'saved' ? 'var(--success-color)' : (saveStatus === 'saving' ? '#6366f1' : 'var(--danger-color)') }}>
                    {saveStatus === 'saved' ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5 animate-pulse" />}
                    <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>
                      {saveStatus === 'saved' ? 'SINC' : (saveStatus === 'saving' ? 'GUARDANDO...' : 'ERROR')}
                    </span>
                   </div>
                </div>

                <button 
                  className="icon-btn" 
                  title="Cambiar Tema"
                  onClick={() => updateConfig && updateConfig('theme', '', (planData?.config?.theme || 'light') === 'dark' ? 'light' : 'dark')}
                  style={{ background: 'var(--bg-panel)', padding: '8px', borderRadius: '10px', border: '1px solid var(--border-color)' }}
                >
                  {(planData?.config?.theme || 'light') === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <div className="user-profile" style={{ padding: '0.3rem 0.6rem' }}>
                  <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.65rem' }}>
                    {planData?.config?.brandKit?.companyName?.substring(0, 2).toUpperCase() || 'OP'}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{planData?.config?.brandKit?.companyName?.split(' ')[0] || 'Admin'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="view-container">
          <Outlet />
        </div>
      </main>

      {/* Modal Cargar Proyecto */}
      {showLoadModal && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(10px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setShowLoadModal(false)}
        >
          <div 
            className="glass-panel"
            style={{
              width: '650px', maxHeight: '85vh', overflowY: 'auto',
              padding: '2.5rem', background: 'var(--bg-panel)',
              borderRadius: '24px', border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              display: 'flex', flexDirection: 'column', gap: '1.5rem',
              animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Abrir Proyecto Guardado</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Selecciona un plan de negocios guardado localmente en tu disco duro.</p>
              </div>
              <button 
                onClick={() => setShowLoadModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer', outline: 'none' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Categorías */}
              {['negocios', 'social'].map(type => {
                const projects = savedProjects[type] || [];
                if (projects.length === 0) return null;
                return (
                  <div key={type}>
                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-color)', fontWeight: 800, marginBottom: '0.75rem' }}>
                      {type === 'negocios' ? '💼 Planes de Negocios Comerciales' : '🌱 Proyectos Sociales (Metodología BID)'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {projects.map(p => (
                        <div 
                          key={p.id}
                          className="glass-panel"
                          style={{
                            padding: '1rem 1.25rem',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '14px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                              {p.name}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                              <span>📁 {p.file}</span>
                              <span>💾 {(p.size / 1024).toFixed(1)} KB</span>
                              <span>🕒 {p.mtime ? new Date(p.mtime).toLocaleString() : 'N/A'}</span>
                            </div>
                          </div>
                          <button 
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                            onClick={async () => {
                              const success = await loadSavedProject(type, p.id);
                              if (success) {
                                setShowLoadModal(false);
                              }
                            }}
                          >
                            Cargar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {(!savedProjects.negocios || savedProjects.negocios.length === 0) && 
               (!savedProjects.social || savedProjects.social.length === 0) && (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No se encontraron proyectos guardados en la carpeta <code style={{ color: 'var(--accent-color)' }}>/proyectos</code>.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowLoadModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Configurar Industrialización */}
      {showIndustrializeModal && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(10px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setShowIndustrializeModal(false)}
        >
          <div 
            className="glass-panel"
            style={{
              width: '680px', maxHeight: '85vh', overflowY: 'auto',
              padding: '2.5rem', background: 'var(--bg-panel)',
              borderRadius: '24px', border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              display: 'flex', flexDirection: 'column', gap: '1.5rem',
              animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BrainCircuit style={{ color: 'var(--accent-color)' }} />
                  Configurar Generación en Lote
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Selecciona qué módulos quieres enviar a redactar con la Mesa de Expertos de IA.
                </p>
              </div>
              <button 
                onClick={() => setShowIndustrializeModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer', outline: 'none' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem' }}
                onClick={() => {
                  const allChecked = {};
                  industrializeQueueCandidates.forEach(c => {
                    allChecked[`${c.pillar}.${c.modKey}`] = true;
                  });
                  setSelectedCandidates(allChecked);
                }}
              >
                Seleccionar Todos
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem' }}
                onClick={() => {
                  setSelectedCandidates({});
                }}
              >
                Deseleccionar Todos
              </button>
            </div>

            {/* List of candidate modules grouped by Pillar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '50vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {Object.entries(
                industrializeQueueCandidates.reduce((acc, candidate) => {
                  if (!acc[candidate.pillarTitle]) acc[candidate.pillarTitle] = [];
                  acc[candidate.pillarTitle].push(candidate);
                  return acc;
                }, {})
              ).map(([pillarTitle, modules]) => (
                <div key={pillarTitle} style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <h3 style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                    {pillarTitle}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {modules.map(mod => {
                      const key = `${mod.pillar}.${mod.modKey}`;
                      const isSelected = !!selectedCandidates[key];
                      const total = mod.totalFields;
                      const empty = mod.emptyFields.length;
                      const completed = total - empty;

                      return (
                        <label 
                          key={key} 
                          style={{ 
                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem', 
                            padding: '0.5rem 0.75rem', borderRadius: '8px', 
                            background: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                            border: `1px solid ${isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent'}`,
                            cursor: 'pointer', transition: 'all 0.15s ease'
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            style={{ marginTop: '3px', width: '15px', height: '15px', accentColor: 'var(--accent-color)' }}
                            onChange={(e) => {
                              setSelectedCandidates(prev => ({
                                ...prev,
                                [key]: e.target.checked
                              }));
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {mod.title}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: completed === total ? 'var(--success-color)' : 'var(--text-secondary)', fontWeight: 650 }}>
                                {completed} / {total} campos escritos
                              </span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                              Campos a generar: <span style={{ color: '#ef4444' }}>{mod.emptyFields.join(', ')}</span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowIndustrializeModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-ia" 
                style={{ padding: '0.5rem 1.5rem' }}
                onClick={handleStartIndustrialization}
              >
                <BrainCircuit size={16} />
                Iniciar Generación ({Object.values(selectedCandidates).filter(Boolean).length} módulos)
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .icon-btn-rounded {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-btn-rounded:hover {
          color: var(--accent-color);
          background: rgba(255, 255, 255, 0.05);
        }
        .icon-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color 0.2s;
          padding: 4px;
        }
        .icon-btn:hover {
          color: var(--accent-color);
        }
        .global-progress-box {
          margin: 1rem 0;
          padding: 0.75rem;
          background: var(--bg-panel-hover);
          border-radius: 10px;
          border: 1px solid var(--border-color);
        }
        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 0.35rem;
          text-transform: uppercase;
        }
        .progress-bar-bg {
          height: 6px;
          background: var(--border-color);
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-color) 0%, #8b5cf6 100%);
          border-radius: 3px;
          transition: width 0.4s ease;
        }
        .generation-controls-bubble {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-panel);
          border: 1px solid var(--border-color);
          padding: 4px 12px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .status-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
          max-width: 180px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pulse-text {
          animation: pulse-soft 1.5s infinite;
        }
        .paused-text {
          color: var(--text-secondary);
        }
        .control-bar-progress {
          position: relative;
          width: 80px;
          height: 16px;
          background: var(--border-color);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .control-bar-progress .progress-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: rgba(79, 70, 229, 0.2);
          transition: width 0.3s ease;
        }
        .progress-step-text {
          position: relative;
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .control-action-btn {
          background: transparent;
          border: none;
          font-size: 0.95rem;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        .control-action-btn:hover {
          background-color: var(--bg-panel-hover);
        }
        .control-action-btn.stop:hover {
          background-color: rgba(239, 68, 68, 0.1);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-glow {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
      `}</style>
      <ActivityFeed />
    </div>
  );
}

