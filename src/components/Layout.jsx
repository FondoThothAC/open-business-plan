import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileSpreadsheet, LineChart, PieChart, Printer, Settings, Eye, BrainCircuit, ChevronDown, ChevronRight, Save, FilePlus, FolderOpen, Check, Image as ImageIcon, Sun, Moon, Sprout } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { PROJECT_EXAMPLES } from '../lib/projects_db';
import { generateModuleContent } from '../lib/ai';
import { FRAMEWORKS } from '../config/frameworks';
import ActivityFeed from './ActivityFeed';

const PILLAR_ICONS = {
  naturaleza: LayoutDashboard,
  mercado: FileSpreadsheet,
  tecnico: Settings,
  organizacion: PieChart,
  finanzas: LineChart
};

export default function Layout() {
  const { planData, updateConfig, createNewProject, loadProject, saveStatus, updateProjectName, autoFillProject } = usePlan();
  const [isFilling, setIsFilling] = useState(false);
  const [expandedPillars, setExpandedPillars] = useState(['naturaleza', 'mercado', 'tecnico', 'organizacion', 'finanzas']);
  const [planType, setPlanType] = useState('negocios');
  const navigate = useNavigate();

  const togglePillar = (id) => {
    setExpandedPillars(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className={`app-container theme-${planData.config.theme}`}>
      {/* Sidebar Navigation */}
      <aside className="sidebar no-print">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <Sprout size={24} color="var(--accent-color)" />
            </div>
            <div className="logo-text">
              <h1>OpenPlan</h1>
              <span>Business Engine</span>
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
            {FRAMEWORKS[planData.config.projectType].pillars.map(pillar => {
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

          <div className="nav-section" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Estado del Motor IA</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }}></div>
              <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>SIN CONEXIÓN</span>
            </div>
            <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.5rem', lineHeight: '1.4' }}>
              Ejecuta <code style={{ color: 'var(--accent-color)' }}>bash run_mac.sh</code> en tu terminal para activar el cerebro de IA.
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
                    else navigate('/naturaleza/introduccion');
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
                    value={planData.config?.brandKit?.companyName || ''}
                    onChange={(e) => updateProjectName(e.target.value)}
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
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.05)', padding: '0.4rem 0.75rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <button 
                  className={`btn btn-ia ${isFilling ? 'animate-pulse' : ''}`} 
                  style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', height: '32px' }}
                  onClick={async () => {
                    setIsFilling(true);
                    await autoFillProject(generateModuleContent);
                    setIsFilling(false);
                  }}
                  disabled={isFilling}
                >
                  <BrainCircuit className="w-4 h-4" />
                  <span>{isFilling ? 'Generando...' : 'Industrializar'}</span>
                </button>

                <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 0.25rem' }} />

                <button className="icon-btn" title="Nuevo Plan" onClick={createNewProject} style={{ color: 'var(--accent-color)' }}>
                  <FilePlus className="w-5 h-5" />
                </button>
                <button className="icon-btn" title="Abrir Plan">
                  <FolderOpen className="w-5 h-5" />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: saveStatus === 'saved' ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                    {saveStatus === 'saved' ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5 animate-pulse" />}
                    <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>{saveStatus === 'saved' ? 'SINC' : '...'}</span>
                  </div>
                </div>

                <button 
                  className="icon-btn" 
                  title="Cambiar Tema"
                  onClick={() => updateConfig('theme', '', planData.config.theme === 'dark' ? 'light' : 'dark')}
                  style={{ background: 'var(--bg-panel)', padding: '8px', borderRadius: '10px', border: '1px solid var(--border-color)' }}
                >
                  {planData.config.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <div className="user-profile" style={{ padding: '0.3rem 0.6rem' }}>
                  <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.65rem' }}>
                    {planData.config?.brandKit?.companyName?.substring(0, 2).toUpperCase() || 'OP'}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{planData.config?.brandKit?.companyName?.split(' ')[0] || 'Admin'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="view-container">
          <Outlet />
        </div>
      </main>

      <style>{`
        .icon-btn {
          background: var(--input-bg);
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color 0.2s;
          padding: 4px;
        }
        .icon-btn:hover {
          color: var(--accent-color);
        }
      `}</style>
      <ActivityFeed />
    </div>
  );
}
