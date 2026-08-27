import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileSpreadsheet, LineChart, PieChart, Settings, Eye, BrainCircuit, ChevronDown, ChevronRight, ChevronLeft, Save, FilePlus, FolderOpen, Check, Image as ImageIcon, Sprout, Copy, Star, Briefcase, Zap, Globe, Cpu, ShoppingBag, Landmark, ListChecks, Compass, Target, Layers, Share2, Factory, Files, UploadCloud } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { PROJECT_EXAMPLES } from '../lib/projects_db';
import { FRAMEWORKS } from '../config/frameworks';
import { getApiBase } from '../config/apiConfig';
import ActivityFeed from './ActivityFeed';
import GenerationControls from './GenerationControls';
import BobChatModal from './BobChatModal';
import GrillMePromptModal from './GrillMePromptModal';
import TouchBarBridge from './TouchBarBridge';
import ServerHealthBanner from './ServerHealthBanner';
import WordDocumentCenterModal from './WordDocumentCenterModal';
import DocumentUploader from './DocumentUploader';


const METHODOLOGY_CONFIG = {
  business: { name: 'Plan Maestro', icon: Briefcase, color: '#3b82f6' },
  social_bid: { name: 'Proyecto Social (BID)', icon: Globe, color: '#10b981' },
  agile_startup: { name: 'Lean Startup', icon: Zap, color: '#f59e0b' },
  technology_id: { name: 'Innovación (I+D)', icon: Cpu, color: '#8b5cf6' },
  micro_business: { name: 'Microempresa', icon: ShoppingBag, color: '#ec4899' },
  investment_project: { name: 'Proyecto de Inversión', icon: Landmark, color: '#6366f1' },
  zopp: { name: 'ZOPP / Marco Lógico', icon: ListChecks, color: '#14b8a6' },
  horizon_europe: { name: 'Horizon Europe', icon: Compass, color: '#06b6d4' },
  hoshin_kanri: { name: 'Hoshin Kanri', icon: Target, color: '#ef4444' },
  amoeba_management: { name: 'Amoeba Management', icon: Layers, color: '#f97316' },
  guanxi_plan: { name: 'Metodología Guanxi', icon: Share2, color: '#a855f7' },
  onudi_project: { name: 'Estudio ONUDI', icon: Factory, color: '#6b7280' },
};

const EXAMPLE_FRAMEWORK_MAP = {
  brujula: 'business',
  agrorio: 'investment_project',
  assetmanager: 'technology_id',
  sove: 'micro_business',
  mixroom: 'micro_business',
  gtcapital: 'business',
  juvicred: 'investment_project',
  jubilus: 'business',
  patriplan: 'business',
  mexitaco: 'agile_startup',
  hipocredito: 'business',
  impulsa: 'business',
  edufin: 'business',
  fincontrol: 'technology_id',
  cibercafe: 'social_bid',
  ferreteria: 'business',
};

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
    generationStatus, _generationProgress, startIndustrialization, _pauseIndustrialization, _stopIndustrialization, getProjectCompletion
  } = usePlan();
  
  const [forceActivityOpen, setForceActivityOpen] = useState(false);
  
  // Auto-abrir monitor durante industrialización
  useEffect(() => {
    setForceActivityOpen(generationStatus === 'running');
  }, [generationStatus]);
  
  const [expandedPillars, setExpandedPillars] = useState(['naturaleza']); // Collapse others by default
  const [planType, setPlanType] = useState('negocios');
  const [_aiStatus, _setAiStatus] = useState('offline');
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedProjects, setSavedProjects] = useState({ negocios: [], social: [] });
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBobOpen, setIsBobOpen] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showRagModal, setShowRagModal] = useState(false);
  const [activeGrillMePrompt, setActiveGrillMePrompt] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('openplan_sidebar_collapsed') === 'true';
  });
  
  const [lastAiInfo, setLastAiInfo] = useState({ provider: 'Local/Auto', model: 'En Espera' });
  const [isAiHot, setIsAiHot] = useState(false);

  useEffect(() => {
    const handleTrajectory = (e) => {
      const detail = e.detail || {};
      const provider = detail.provider || detail.providerUsed;
      const model = detail.model || detail.modelUsed;
      if (provider || model) {
        setLastAiInfo({ provider: provider || 'IA', model: model || 'Automático' });
        setIsAiHot(true);
        setTimeout(() => setIsAiHot(false), 5000); // 5 segundos de brillo HOT
      }
    };
    
    const handleNavigate = (e) => {
      if (e.detail) {
        navigate(e.detail);
      }
    };

    window.addEventListener('openplan_trajectory_updated', handleTrajectory);
    window.addEventListener('openplan_new_trajectory', handleTrajectory); // También escuchar la de agenticEngine
    window.addEventListener('openplan_navigate', handleNavigate);
    
    return () => {
      window.removeEventListener('openplan_trajectory_updated', handleTrajectory);
      window.removeEventListener('openplan_new_trajectory', handleTrajectory);
      window.removeEventListener('openplan_navigate', handleNavigate);
    };
  }, [navigate]);

  // Sincronizar reactivamente el tipo de plan del header según la ruta activa
  useEffect(() => {
    if (location.pathname.includes('/lean-canvas')) {
      setPlanType('lean');
    } else if (location.pathname.includes('/pitch-deck')) {
      setPlanType('pitch');
    } else {
      setPlanType('negocios');
    }
  }, [location.pathname]);

  const calculateExampleCompletion = (data) => {
    if (!data) return 0;
    let total = 0;
    let filled = 0;
    const isFilled = (val) => {
      if (val === undefined || val === null || val === '') return false;
      if (typeof val === 'number') return true;
      if (typeof val === 'boolean') return true;
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === 'object') return Object.keys(val).length > 0;
      const str = String(val).trim();
      if (str.length === 0) return false;
      if (!isNaN(str) || str.length >= 3) return true;
      return false;
    };
    const modulesKeys = ['naturaleza', 'mercado', 'tecnico', 'organizacion', 'finanzas'];
    modulesKeys.forEach(modKey => {
      if (data[modKey]) {
        Object.keys(data[modKey]).forEach(secKey => {
          const sec = data[modKey][secKey];
          if (typeof sec === 'object' && sec !== null) {
            Object.keys(sec).forEach(fieldKey => {
              total++;
              if (isFilled(sec[fieldKey])) {
                filled++;
              }
            });
          }
        });
      }
    });
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  };

  const renderStars = (percent) => {
    const filledCount = Math.round((percent / 100) * 5);
    return (
      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }} title={`Completado: ${percent}%`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={10} 
            fill={star <= filledCount ? "var(--accent-color)" : "none"} 
            color={star <= filledCount ? "var(--accent-color)" : "rgba(255, 255, 255, 0.25)"}
            style={{ strokeWidth: star <= filledCount ? 0 : 1.5 }}
          />
        ))}
        {!isSidebarCollapsed && (
          <span style={{ fontSize: '0.6rem', marginLeft: '4px', opacity: 0.8, color: 'var(--text-secondary)' }}>
            {percent}%
          </span>
        )}
      </div>
    );
  };

  const getActiveProjectDetails = () => {
    const projId = planData?.config?.projectId;
    const projType = planData?.config?.projectType || 'business';
    const compName = planData?.config?.brandKit?.companyName || planData?.semilla?.nombre_proyecto || planData?.semilla?.negocio?.nombre_marca || 'Proyecto Nuevo';
    
    // Solo mostrar como plantilla si el nombre actual coincide con el de la plantilla
    if (projId && PROJECT_EXAMPLES[projId] && (!compName || compName === 'Proyecto Nuevo' || compName === PROJECT_EXAMPLES[projId].name)) {
      const ex = PROJECT_EXAMPLES[projId];
      return {
        id: projId,
        name: ex.name,
        type: EXAMPLE_FRAMEWORK_MAP[projId] || 'business',
        completion: getProjectCompletion ? getProjectCompletion() : 0,
        isTemplate: true
      };
    }
    
    const savedNeg = savedProjects.negocios?.find(p => p.id === projId);
    if (savedNeg) {
      return {
        id: projId,
        name: savedNeg.name,
        type: savedNeg.projectType || 'business',
        completion: getProjectCompletion ? getProjectCompletion() : 0,
        isTemplate: false
      };
    }
    
    const savedSoc = savedProjects.social?.find(p => p.id === projId);
    if (savedSoc) {
      return {
        id: projId,
        name: savedSoc.name,
        type: savedSoc.projectType || 'social_bid',
        completion: getProjectCompletion ? getProjectCompletion() : 0,
        isTemplate: false
      };
    }
    
    return {
      id: projId || '',
      name: compName,
      type: projType,
      completion: getProjectCompletion ? getProjectCompletion() : 0,
      isTemplate: false
    };
  };

  const activeProj = getActiveProjectDetails();
  const ActiveIcon = METHODOLOGY_CONFIG[activeProj.type]?.icon || Briefcase;
  const activeColor = METHODOLOGY_CONFIG[activeProj.type]?.color || 'var(--accent-color)';

  // State for Custom Industrialization Modal
  const [showIndustrializeModal, setShowIndustrializeModal] = useState(false);
  const [industrializeQueueCandidates, setIndustrializeQueueCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState({}); // { [moduleKey]: boolean }

  useEffect(() => {
    const checkAi = async () => {
      try {
        const res = await fetch(planData?.config?.ai?.endpoint || 'http://localhost:11434/api/tags');
        if (res.ok) _setAiStatus('online');
        else _setAiStatus('offline');
      } catch {
        _setAiStatus('offline');
      }
    };
    checkAi();
    const timer = setInterval(checkAi, 10000);
    return () => clearInterval(timer);
  }, [planData?.config?.ai?.endpoint]);

  useEffect(() => {
    const fetchProjects = () => {
      const apiBase = getApiBase();
      fetch(`${apiBase}/api/projects`)
        .then(res => res.json())
        .then(data => {
          if (data && typeof data === 'object') {
            setSavedProjects(data);
          }
        })
        .catch(err => console.error('Error fetching saved projects:', err));
    };
    fetchProjects();
  }, [showLoadModal, saveStatus, isDropdownOpen, planData?.config?.projectId]);

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
        const isComplete = emptyFields.length === 0;

        const candidate = {
          pillar: pillar.key,
          pillarTitle: pillar.title,
          modKey: mod.key,
          title: mod.title,
          emptyFields: isComplete ? mod.fields : emptyFields,
          totalFields: mod.fields.length,
          isComplete
        };
        candidates.push(candidate);
        initialSelected[`${pillar.key}.${mod.key}`] = !isComplete; // Selected by default only if incomplete
      });
    });

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
      <aside className={`sidebar no-print ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container" style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
            <div className="logo-icon">
              <Sprout size={24} color="var(--accent-color)" />
            </div>
            {!isSidebarCollapsed && (
              <div className="logo-text">
                <h1>Open Business Plan</h1>
                <span>Business Engine</span>
              </div>
            )}
            <button
              onClick={() => {
                const ns = !isSidebarCollapsed;
                setIsSidebarCollapsed(ns);
                localStorage.setItem('openplan_sidebar_collapsed', String(ns));
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                marginLeft: isSidebarCollapsed ? '0' : 'auto',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
              title={isSidebarCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
            >
              {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {!isSidebarCollapsed && (
            <div className="global-progress-box">
              <div className="progress-labels">
                <span>Progreso Global</span>
                <span>{getProjectCompletion ? getProjectCompletion() : 0}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${getProjectCompletion ? getProjectCompletion() : 0}%` }} />
              </div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {!isSidebarCollapsed && <span className="nav-section-title">Paso 0</span>}
            <NavLink to="/semilla" className="nav-item" title="Semilla del Proyecto" style={isSidebarCollapsed ? { justifyContent: 'center' } : {}}>
              <div className="nav-icon-box"><Sprout size={18} /></div>
              {!isSidebarCollapsed && <span>🌱 Semilla del Proyecto</span>}
            </NavLink>

            {/* [RAG] Botón de Carga de Documentos justo debajo de Semilla */}
            <div 
              onClick={() => setShowRagModal(true)}
              className="nav-item"
              title="Cargar Documentos RAG (Word, PDF, OCR, Audio)"
              style={{
                cursor: 'pointer',
                marginTop: '0.35rem',
                background: (planData?.config?.documents?.length > 0) ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                border: (planData?.config?.documents?.length > 0) ? '1px solid rgba(99, 102, 241, 0.25)' : '1px dashed var(--border-color)',
                borderRadius: '8px',
                padding: isSidebarCollapsed ? '0.5rem 0' : '0.55rem 0.75rem',
                justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="nav-icon-box" style={{ color: '#818cf8' }}>
                  <UploadCloud size={18} />
                </div>
                {!isSidebarCollapsed && (
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    📂 Cargar Documentos
                  </span>
                )}
              </div>
              {!isSidebarCollapsed && (
                <span style={{
                  fontSize: '0.68rem',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  background: (planData?.config?.documents?.length > 0) ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-panel)',
                  color: (planData?.config?.documents?.length > 0) ? '#818cf8' : 'var(--text-secondary)',
                  fontWeight: '700'
                }}>
                  {planData?.config?.documents?.length || 0}
                </span>
              )}
            </div>
          </div>

          {planData?.config?.activeMethodologies?.length > 1 && !isSidebarCollapsed && (
            <div className="nav-section" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <span className="nav-section-title" style={{ display: 'block', marginBottom: '0.5rem' }}>Metodología Activa</span>
              <select
                value={planData?.config?.projectType || 'business'}
                onChange={(e) => updateConfig('projectType', null, e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-panel)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  fontSize: '0.8rem',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {planData.config.activeMethodologies.map(mKey => (
                  <option key={mKey} value={mKey}>{FRAMEWORKS[mKey]?.name || mKey}</option>
                ))}
              </select>
            </div>
          )}

          <div className="nav-section">
            {!isSidebarCollapsed && <span className="nav-section-title">Pilares Académicos</span>}
            {(FRAMEWORKS[planData?.config?.projectType || 'business'] || FRAMEWORKS.business).pillars.map(pillar => {
              const Icon = PILLAR_ICONS[pillar.key] || LayoutDashboard;
              const isExpanded = expandedPillars.includes(pillar.key);

              if (isSidebarCollapsed) {
                const firstModule = pillar.modules[0];
                const destPath = `/modulo/${pillar.key}/${firstModule.key}`;
                return (
                  <NavLink 
                    key={pillar.key} 
                    to={destPath} 
                    className="nav-item" 
                    title={pillar.title}
                    style={{ justifyContent: 'center' }}
                  >
                    <div className="nav-icon-box"><Icon size={18} /></div>
                  </NavLink>
                );
              }

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
            {!isSidebarCollapsed && <span className="nav-section-title">Exportación y Ajustes</span>}
            <NavLink to="/preview" className="nav-item" title="Vista Previa del Plan" style={isSidebarCollapsed ? { justifyContent: 'center' } : {}}>
              <div className="nav-icon-box"><Eye size={18} /></div>
              {!isSidebarCollapsed && <span>Vista Previa del Plan</span>}
            </NavLink>
            <NavLink to="/anexos" className="nav-item" title="Anexos y Evidencia" style={isSidebarCollapsed ? { justifyContent: 'center' } : {}}>
              <div className="nav-icon-box"><ImageIcon size={18} /></div>
              {!isSidebarCollapsed && <span>Anexos y Evidencia</span>}
            </NavLink>
            <NavLink to="/configuracion" className="nav-item" title="Configuración" style={isSidebarCollapsed ? { justifyContent: 'center' } : {}}>
              <div className="nav-icon-box"><Settings size={18} /></div>
              {!isSidebarCollapsed && <span>Configuración</span>}
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <ServerHealthBanner />
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
                    else {
                      // Redirigir al primer módulo de la metodología activa actual
                      const activeKey = planData?.config?.projectType || 'business';
                      const activeFramework = FRAMEWORKS[activeKey] || FRAMEWORKS.business;
                      const firstPillar = activeFramework.pillars?.[0];
                      const firstMod = firstPillar?.modules?.[0];
                      if (firstPillar && firstMod) {
                        navigate(`/modulo/${firstPillar.key}/${firstMod.key}`);
                      } else {
                        navigate('/modulo/naturaleza/introduccion');
                      }
                    }
                  }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', outline: 'none', padding: 0 }}
                >
                  <option value="negocios">{FRAMEWORKS[planData?.config?.projectType || 'business']?.name || 'Plan Maestro'}</option>
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

              {/* Etiqueta dinámica de modelo AI Hot */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.8rem',
                background: isAiHot ? 'rgba(239, 68, 68, 0.15)' : 'rgba(100, 116, 139, 0.1)',
                border: `1px solid ${isAiHot ? 'rgba(239, 68, 68, 0.3)' : 'rgba(100, 116, 139, 0.2)'}`,
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                boxShadow: isAiHot ? '0 0 12px rgba(239, 68, 68, 0.2)' : 'none'
              }}>
                <div style={{ 
                  width: '8px', height: '8px', borderRadius: '50%', 
                  background: isAiHot ? '#ef4444' : '#64748b',
                  boxShadow: isAiHot ? '0 0 8px #ef4444' : 'none',
                  animation: isAiHot ? 'pulse 1s infinite' : 'none'
                }}></div>
                <div>
                  <div style={{ fontSize: '0.6rem', color: isAiHot ? '#ef4444' : '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {isAiHot ? '🔥 ACTIVO AHORA' : 'Última IA'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {lastAiInfo.model}
                  </div>
                </div>
              </div>

              <div style={{ borderLeft: '1px solid var(--border-color)', height: '30px', margin: '0 0.5rem' }} />

              {/* Selector de Proyecto Unificado y Personalizado */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setShowWorkspaceModal(true)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(59, 130, 246, 0.25))',
                    color: '#3b82f6',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)'
                  }}
                  title="Centro de Documentos estilo Word con Versiones y Trazabilidad"
                >
                  <Briefcase size={16} /> <span>Documentos (Word)</span>
                </button>

                <div style={{ position: 'relative' }}>
                  {isDropdownOpen && (
                    <div 
                      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998, background: 'transparent' }} 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                  )}
                  
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="glass-panel"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.4rem 0.8rem',
                      background: 'var(--bg-panel)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      minWidth: '220px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      position: 'relative',
                      zIndex: 999
                    }}
                  >
                    <div style={{
                      width: '28px', height: '28px',
                      borderRadius: '6px',
                      background: `rgba(${activeProj.type === 'social_bid' ? '16, 185, 129' : '99, 102, 241'}, 0.1)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <ActiveIcon size={14} color={activeColor} />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1.1 }}>
                        Proyecto Activo
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px', lineHeight: 1.2 }}>
                        {activeProj.name}
                      </div>
                      <div style={{ marginTop: '1px' }}>
                        {renderStars(activeProj.completion)}
                      </div>
                    </div>
                    
                    <ChevronDown size={14} color="var(--text-secondary)" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', marginLeft: '4px' }} />
                  </button>

                  {isDropdownOpen && (
                    <div 
                      className="glass-panel"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        width: '360px',
                        maxHeight: '380px',
                        overflowY: 'auto',
                        background: 'var(--bg-panel)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
                        zIndex: 999,
                        padding: '0.4rem',
                        animation: 'fadeIn 0.15s ease'
                      }}
                    >
                      {/* Category: Predeterminados */}
                      <div style={{ padding: '0.4rem 0.5rem 0.3rem', fontSize: '0.62rem', fontWeight: 800, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: '0.2rem' }}>
                        ⭐ Plantillas Predeterminadas (Ejemplos)
                      </div>
                      {Object.entries(PROJECT_EXAMPLES).map(([id, project]) => {
                        const type = EXAMPLE_FRAMEWORK_MAP[id] || 'business';
                        const IconComp = METHODOLOGY_CONFIG[type]?.icon || Briefcase;
                        const color = METHODOLOGY_CONFIG[type]?.color || 'var(--accent-color)';
                        const comp = calculateExampleCompletion(project.data);
                        const isSelected = id === activeProj.id;
                        
                        return (
                          <button
                            key={`example-${id}`}
                            onClick={() => {
                              loadProject(id);
                              setIsDropdownOpen(false);
                            }}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              padding: '0.45rem 0.6rem',
                              background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'var(--bg-panel-hover)';
                              e.currentTarget.style.transform = 'translateX(3px)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent';
                              e.currentTarget.style.transform = 'none';
                            }}
                          >
                            <div style={{
                              width: '24px', height: '24px', borderRadius: '5px',
                              background: `rgba(${type === 'social_bid' ? '16, 185, 129' : '99, 102, 241'}, 0.08)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              <IconComp size={12} color={color} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'space-between' }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</span>
                                <span style={{ fontSize: '0.58rem', padding: '1px 4px', borderRadius: '3px', background: `${color}15`, color: color, fontWeight: 700, flexShrink: 0 }}>
                                  {METHODOLOGY_CONFIG[type]?.name}
                                </span>
                              </div>
                              <div style={{ marginTop: '1px' }}>
                                {renderStars(comp)}
                              </div>
                            </div>
                          </button>
                        );
                      })}

                      {/* Category: Guardados */}
                      {((savedProjects.negocios && savedProjects.negocios.length > 0) || (savedProjects.social && savedProjects.social.length > 0)) && (
                        <>
                          <div style={{ padding: '0.6rem 0.5rem 0.3rem', fontSize: '0.62rem', fontWeight: 800, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.04)', marginTop: '0.4rem', marginBottom: '0.2rem' }}>
                            📁 Mis Proyectos Guardados
                          </div>
                          
                          {savedProjects.negocios?.map(p => {
                            const type = p.projectType || 'business';
                            const IconComp = METHODOLOGY_CONFIG[type]?.icon || Briefcase;
                            const color = METHODOLOGY_CONFIG[type]?.color || 'var(--accent-color)';
                            const isSelected = p.id === activeProj.id;
                            
                            return (
                              <button
                                key={`saved-neg-${p.id}`}
                                onClick={async () => {
                                  const success = await loadSavedProject('negocios', p.id);
                                  if (success) setIsDropdownOpen(false);
                                }}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.6rem',
                                  padding: '0.45rem 0.6rem',
                                  background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = 'var(--bg-panel-hover)';
                                  e.currentTarget.style.transform = 'translateX(3px)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent';
                                  e.currentTarget.style.transform = 'none';
                                }}
                              >
                                <div style={{
                                  width: '24px', height: '24px', borderRadius: '5px',
                                  background: `rgba(${type === 'social_bid' ? '16, 185, 129' : '99, 102, 241'}, 0.08)`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                  <IconComp size={12} color={color} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 500, fontSize: '0.78rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'space-between' }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                                    <span style={{ fontSize: '0.58rem', padding: '1px 4px', borderRadius: '3px', background: `${color}15`, color: color, fontWeight: 700, flexShrink: 0 }}>
                                      {METHODOLOGY_CONFIG[type]?.name}
                                    </span>
                                  </div>
                                  <div style={{ marginTop: '1px' }}>
                                    {renderStars(p.completion || 0)}
                                  </div>
                                </div>
                              </button>
                            );
                          })}

                          {savedProjects.social?.map(p => {
                            const type = p.projectType || 'social_bid';
                            const IconComp = METHODOLOGY_CONFIG[type]?.icon || Globe;
                            const color = METHODOLOGY_CONFIG[type]?.color || 'var(--accent-color)';
                            const isSelected = p.id === activeProj.id;
                            
                            return (
                              <button
                                key={`saved-soc-${p.id}`}
                                onClick={async () => {
                                  const success = await loadSavedProject('social', p.id);
                                  if (success) setIsDropdownOpen(false);
                                }}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.6rem',
                                  padding: '0.45rem 0.6rem',
                                  background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = 'var(--bg-panel-hover)';
                                  e.currentTarget.style.transform = 'translateX(3px)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent';
                                  e.currentTarget.style.transform = 'none';
                                }}
                              >
                                <div style={{
                                  width: '24px', height: '24px', borderRadius: '5px',
                                  background: `rgba(${type === 'social_bid' ? '16, 185, 129' : '99, 102, 241'}, 0.08)`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                  <IconComp size={12} color={color} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 500, fontSize: '0.78rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'space-between' }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                                    <span style={{ fontSize: '0.58rem', padding: '1px 4px', borderRadius: '3px', background: `${color}15`, color: color, fontWeight: 700, flexShrink: 0 }}>
                                      {METHODOLOGY_CONFIG[type]?.name}
                                    </span>
                                  </div>
                                  <div style={{ marginTop: '1px' }}>
                                    {renderStars(p.completion || 0)}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions & Tools */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
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
              borderRadius: '12px', border: '1px solid var(--border-color)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
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
            </div>
          </div>
        </div>
      )}

      {/* Modal Configurar Generación en Lote */}
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
              borderRadius: '12px', border: '1px solid var(--border-color)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
                  const incompleteChecked = {};
                  industrializeQueueCandidates.forEach(c => {
                    if (!c.isComplete) {
                      incompleteChecked[`${c.pillar}.${c.modKey}`] = true;
                    }
                  });
                  setSelectedCandidates(incompleteChecked);
                }}
              >
                Seleccionar Incompletos
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
                <div key={pillarTitle} style={{ background: 'transparent', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                    {pillarTitle}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {modules.map(mod => {
                      const key = `${mod.pillar}.${mod.modKey}`;
                      const isSelected = !!selectedCandidates[key];
                      const total = mod.totalFields;
                      const empty = mod.isComplete ? 0 : mod.emptyFields.length;
                      const completed = total - empty;

                      return (
                        <label 
                          key={key} 
                          style={{ 
                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem', 
                            padding: '0.5rem 0.75rem', borderRadius: '6px', 
                            background: isSelected ? 'var(--bg-panel-hover)' : 'transparent',
                            border: `1px solid ${isSelected ? 'var(--border-color)' : 'transparent'}`,
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
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {mod.title}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: mod.isComplete ? 'var(--success-color)' : 'var(--text-secondary)', fontWeight: 650 }}>
                                {mod.isComplete ? '✅ Completo' : `${completed} / ${total} campos`}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                              {mod.isComplete ? (
                                <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                  Módulo completo. Activa la casilla para volver a redactarlo con IA.
                                </span>
                              ) : (
                                <>
                                  Campos a generar: <span style={{ color: '#ef4444' }}>{mod.emptyFields.join(', ')}</span>
                                </>
                              )}
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
          background: transparent;
          border-radius: 8px;
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
          background: var(--text-primary);
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
          border-radius: 6px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <ActivityFeed onOpenBob={() => setIsBobOpen(true)} forceOpen={forceActivityOpen} />
      <TouchBarBridge />
      
      {/* Asistente BOB Flotante (CELIS Engine & Voice) */}
      <BobChatModal 
        isOpen={isBobOpen} 
        onClose={() => setIsBobOpen(false)}
        planData={planData}
        onExecuteCommand={(cmd) => {
          if (cmd.action === 'UPDATE_CAPEX') {
            updateConfig('organizacion', 'inversion', {
              ...planData.organizacion?.inversion,
              monto_inversion: cmd.amount
            });
          } else if (cmd.action === 'CONFIGURE_MULTIBRANCH' || cmd.tool === 'configure_multibranch_expansion') {
            const params = cmd.parameters || cmd.data || cmd;
            updateConfig('multiBranch', null, {
              hubCity: params.hubCity,
              branches: params.branches || [],
              rolloutStrategy: params.rolloutStrategy || 'escalonada',
              capexPerBranch: params.capexPerBranch || 350000,
              quantumScaleLevel: params.quantumScaleLevel || 2,
              configuredAt: new Date().toISOString()
            });
          }
        }}
      />

      {/* Centro de Documentos Estilo Word y Trazabilidad */}
      <WordDocumentCenterModal
        isOpen={showWorkspaceModal}
        onClose={() => setShowWorkspaceModal(false)}
      />

      {/* Modal RAG Multimodal accesible globalmente desde la Barra Lateral */}
      {showRagModal && (
        <DocumentUploader
          compact={true}
          onClose={() => setShowRagModal(false)}
        />
      )}

      {/* Modal Human-in-the-Loop (Grill-Me) si hay preguntas activas de agentes */}
      {activeGrillMePrompt && (
        <GrillMePromptModal
          promptData={activeGrillMePrompt}
          onSubmitResponse={(resp) => {
            if (typeof handleGrillMeResponse === 'function') {
              handleGrillMeResponse(resp);
            }
            setActiveGrillMePrompt(null);
          }}
          onCancel={() => setActiveGrillMePrompt(null)}
        />
      )}
    </div>
  );
}
