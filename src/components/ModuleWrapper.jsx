import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '../context/PlanContext';
import { Sparkles, Loader2, Brain, CheckCircle2, Lock, Unlock, Map as MapIcon, Network, Eye, EyeOff, HelpCircle, Edit3, Layout, ArrowRight, MessageSquare, Check, X, Activity, BadgeDollarSign } from 'lucide-react';
import { generateModuleContent } from '../lib/ai';
import { runAgenticModuleGeneration, getSavedTrajectories } from '../lib/agenticEngine';
import AgentTrajectoryViewer from './AgentTrajectoryViewer';
import { FIELD_GUIDES_MAP } from '../lib/field_guides';
import { FRAMEWORKS } from '../config/frameworks';
import MermaidViewer from './MermaidViewer';
import HeatmapEditor from './HeatmapEditor';
import ExpertPanel from './ExpertPanel';
import FodaMatrix from './FodaMatrix';
import PestelAnalysis from './PestelAnalysis';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DiffViewer from './DiffViewer';
import FieldComments from './FieldComments';
import { safeStr } from '../utils/formatters';

export default function ModuleWrapper({ pillar, moduleKey, title, description, fields, extraAction }) {
  const { planData, updateSection, toggleLock, toggleModuleVisibility, addComment, deleteComment } = usePlan();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('');
  const [activeExpertField, setActiveExpertField] = useState(null);
  const [editModes, setEditModes] = useState({});
  const [depth, setDepth] = useState(planData.config?.ai?.depth || 1);
  const [fodaEditMode, setFodaEditMode] = useState(false);
  const [pestelEditMode, setPestelEditMode] = useState(false);
  const [isAiCompleted, setIsAiCompleted] = useState(false);
  const [draftValues, setDraftValues] = useState({});
  const [showComments, setShowComments] = useState({});
  const [activeTrajectory, setActiveTrajectory] = useState(null);
  const [currentTrajectory, setCurrentTrajectory] = useState(null);
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);
  
  const isLocked = (fieldKey) => planData.config.locks?.[`${pillar}.${moduleKey}.${fieldKey}`];
  const isModuleVisible = planData.config?.visibility?.[`${pillar}.${moduleKey}`] !== false;

  const projectType = planData.config?.projectType || 'business';
  const FIELD_GUIDES = FIELD_GUIDES_MAP[projectType] || FIELD_GUIDES_MAP.business;

  const toggleEditMode = (fieldKey) => {
    setEditModes(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const getFieldGuide = (fieldKey) => {
    const guide = FIELD_GUIDES[fieldKey];
    if (guide) return guide;
    return { desc: `Completa este campo con información relevante para ${fieldKey}.`, ejemplo: '' };
  };

  const getPromptPreview = (fieldLabel, fieldKey, fieldType) => {
    const guide = FIELD_GUIDES[fieldKey];
    const isVisual = fieldType === 'mermaid' || fieldType === 'heatmap';
    return `PROMPT QUE SE ENVÍA A LA IA:\n\n` +
           `"Eres un experto en planes de negocio. Redacta ${fieldLabel}${isVisual ? ' en formato visual Mermaid.js' : ''}."\n\n` +
           `CONTEXTO: Se inyecta TODO el plan actual como JSON para coherencia.\n\n` +
           `FASE 1 – ANALISTA:\n"Genera un borrador profesional para ${fieldLabel}. ${guide ? guide.desc : ''}"\n\n` +
           `FASE 2 – CRÍTICO:\n"Actúa como inversor. ¿Qué falta en el borrador de ${fieldLabel}? ¿Hay datos débiles?"\n\n` +
           `FASE 3 – REDACTOR:\n"Integra la crítica y genera la versión final con tono ejecutivo para un plan de 100 páginas."`;
   };

  const handleChange = (fieldKey, value) => {
    if (isLocked(fieldKey)) return;
    updateSection(pillar, moduleKey, fieldKey, value);
  };


  const handleAiGenerate = async () => {
    const rawAi = planData?.config?.ai || {};
    const hasAnyKey = rawAi.apiKey || rawAi.groqKey || rawAi.openrouterKey || rawAi.nvidiaKey || rawAi.mistralKey || rawAi.minimaxKey;
    const isLocalProvider = rawAi.provider === 'ollama' || rawAi.primaryProvider === 'ollama' || rawAi.primaryProvider === 'lmstudio';

    if (!hasAnyKey && !isLocalProvider) {
      alert("Por favor, configura al menos una API Key (Minimax, Groq, Gemini, OpenRouter, Mistral, NVIDIA) o proveedor local en la sección de Configuración.");
      return;
    }

    const unlockedFields = fields.filter(f => !isLocked(f.key));
    if (unlockedFields.length === 0) return;

    setLoading(true);
    setStage('Agente Autónomo ReAct: Iniciando razonamiento...');
    
    try {
      const enrichedFields = unlockedFields.map(f => {
        if (f.type === 'mermaid') return { ...f, label: f.label + " (Genera código Mermaid.js válido)" };
        return f;
      });

      const currentModule = { pillar, moduleKey, title, description, fields: enrichedFields };
      const aiConfig = { ...planData.config.ai, depth };

      // Ejecutar motor agéntico autónomo ReAct con registro de trayectoria DeepSeek Harness
      let result;
      try {
        const agenticResp = await runAgenticModuleGeneration({
          aiConfig,
          currentModule,
          planData,
          onStepUpdate: (_step, harness) => {
            setCurrentTrajectory(harness);
          },
          onLog: (_type, msg) => {
            setStage(msg);
          }
        });
        result = agenticResp.result;
        setCurrentTrajectory(agenticResp.trajectory);
      } catch {
        // Fallback al generador estándar si el motor agéntico encuentra algún fallo
        result = await generateModuleContent(aiConfig, currentModule, planData);
      }

      const newDrafts = { ...draftValues };
      Object.keys(result || {}).forEach(key => {
        if (fields.find(f => f.key === key) && !isLocked(key)) {
          newDrafts[key] = result[key];
        }
      });
      
      if (result && result._trace) {
        updateSection(pillar, moduleKey, '_trace', result._trace);
      }
      
      // Efecto Typewriter para simular la escritura en tiempo real de la IA
      setStage('Aplicando escritura en vivo...');
      let currentLength = 0;
      const maxLength = Math.max(0, ...Object.values(newDrafts).map(v => typeof v === 'string' ? v.length : 0));
      
      if (maxLength > 0) {
        const typeInterval = setInterval(() => {
          currentLength += 45; // Velocidad de tipeo en vivo por frame
          let isFinished = true;
          
          setDraftValues(prev => {
            const temp = { ...prev };
            Object.keys(newDrafts).forEach(key => {
              if (typeof newDrafts[key] === 'string') {
                if (currentLength < newDrafts[key].length) isFinished = false;
                temp[key] = newDrafts[key].slice(0, currentLength);
              } else {
                temp[key] = newDrafts[key];
              }
            });
            return temp;
          });

          if (isFinished) {
            clearInterval(typeInterval);
            setIsAiCompleted(true);
            setLoading(false);
            setStage('Borrador generado con trazabilidad. Revisa y acepta los cambios.');
            setTimeout(() => setStage(''), 6000);
          }
        }, 35);
      } else {
        setDraftValues(newDrafts);
        setIsAiCompleted(true);
        setLoading(false);
        setStage('Borrador generado con trazabilidad. Revisa y acepta los cambios.');
        setTimeout(() => setStage(''), 6000);
      }
    } catch (error) {
      alert(error.message);
      setStage('Error en generación');
      setLoading(false);
    }
  };

  const handleNextModule = () => {
    const fw = FRAMEWORKS[projectType] || FRAMEWORKS.business;
    const currentPillarIdx = fw.pillars.findIndex(p => p.key === pillar);
    if (currentPillarIdx === -1) return;
    
    const currentModuleIdx = fw.pillars[currentPillarIdx].modules.findIndex(m => m.key === moduleKey);
    
    if (currentModuleIdx < fw.pillars[currentPillarIdx].modules.length - 1) {
      const nextMod = fw.pillars[currentPillarIdx].modules[currentModuleIdx + 1];
      navigate(`/modulo/${pillar}/${nextMod.key}`);
    } else if (currentPillarIdx < fw.pillars.length - 1) {
      const nextPill = fw.pillars[currentPillarIdx + 1];
      const nextMod = nextPill.modules[0];
      navigate(`/modulo/${nextPill.key}/${nextMod.key}`);
    } else {
      navigate('/preview');
    }
    
    setIsAiCompleted(false);
  };

  const moduleData = planData[pillar]?.[moduleKey] || {};

  return (
    <div className="module-view" style={{ animation: 'slideUp 0.4s ease-out' }}>
      <div className="view-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="view-title" style={{ fontSize: '2.25rem', fontWeight: 800 }}>{title}</h1>
          <p className="text-secondary mt-1" style={{ fontSize: '1rem' }}>{description}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
          <div 
            className="glass-panel" 
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '0.75rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: 'rgba(99, 102, 241, 0.08)', 
              borderColor: 'rgba(99, 102, 241, 0.15)',
              borderRadius: '20px',
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.05)'
            }}
          >
            <Brain className="w-3.5 h-3.5 text-[#8b5cf6] animate-pulse" />
            <span style={{ color: 'var(--text-secondary)' }}>Mesa de Expertos activa: <strong style={{ color: 'var(--text-primary)' }}>Analista + Crítico + Redactor</strong></span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {planData.config?.ai?.advancedDepth && (
              <div 
                style={{ 
                  display: 'flex', 
                  background: 'rgba(0, 0, 0, 0.25)', 
                  borderRadius: '12px', 
                  padding: '3px', 
                  border: '1px solid var(--border-color)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {[
                  { level: 1, icon: '⚡', label: 'Rápido',   time: '~1min'  },
                  { level: 2, icon: '🧠', label: 'Pro',      time: '~3min'  },
                  { level: 3, icon: '🔬', label: 'Profundo', time: '~10min' },
                ].map(({ level, icon, label, time }) => (
                  <button 
                    key={level}
                    onClick={() => setDepth(level)}
                    title={`${label} — ${time}`}
                    style={{
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '9px', 
                      border: 'none',
                      background: depth === level ? 'var(--accent-color)' : 'transparent',
                      color: depth === level ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer', 
                      fontSize: '0.75rem', 
                      fontWeight: depth === level ? 700 : 500,
                      transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.35rem',
                      boxShadow: depth === level ? '0 2px 8px rgba(99, 102, 241, 0.4)' : 'none'
                    }}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
            
            <button 
              className={`btn ${isModuleVisible ? 'btn-secondary' : 'btn-danger'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              onClick={() => toggleModuleVisibility(pillar, moduleKey)}
              title={isModuleVisible ? "Incluir en Reporte" : "Excluido del Reporte"}
            >
              {isModuleVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{isModuleVisible ? "Visible" : "Oculto"}</span>
            </button>

            {moduleData._trace && (
              <button 
                className="btn btn-secondary"
                onClick={() => setShowTelemetryModal(true)}
                title="Ver trazabilidad de tokens y costos asociados"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--accent-color)', color: 'var(--accent-color)' }}
              >
                <BadgeDollarSign className="w-4 h-4" />
                <span>Costos IA</span>
              </button>
            )}

            <button 
              className="btn btn-secondary"
              onClick={() => {
                const traj = currentTrajectory || getSavedTrajectories({ pillar, moduleKey })[0];
                if (traj) {
                  setActiveTrajectory(traj);
                } else {
                  alert('Aún no hay una trayectoria registrada para este módulo. Pulsa "Generar con IA" para trazarla.');
                }
              }}
              title="Ver árbol de razonamiento y herramientas estilo DeepSeek Harness"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Trayectoria</span>
            </button>

            <button 
              className="btn btn-ia" 
              onClick={handleAiGenerate}
              disabled={loading}
              style={{ 
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                opacity: loading ? 0.7 : 1, 
                cursor: loading ? 'not-allowed' : 'pointer',
                minWidth: '130px'
              }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'IA Generando...' : 'Generar con IA'}</span>
            </button>
            
            {isAiCompleted && (
              <button 
                className="btn btn-primary"
                onClick={handleNextModule}
                style={{ 
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.85rem',
                  background: 'var(--success-color)',
                  animation: 'pulse 2s infinite',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          {stage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: stage.includes('Error') ? '#ef4444' : 'var(--accent-color)', fontWeight: 600 }}>
              {stage.includes('Completado') ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : stage.includes('Error') ? null : <Brain className="w-3.5 h-3.5 animate-pulse" />}
              <span>{stage}</span>
            </div>
          )}
        </div>
      </div>

      {moduleKey === 'foda' && !fodaEditMode ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <div className="view-toggle">
            <button className={!fodaEditMode ? 'active' : ''} onClick={() => setFodaEditMode(false)}>
              <Layout className="w-3.5 h-3.5" /> Matriz Colorida
            </button>
            <button className={fodaEditMode ? 'active' : ''} onClick={() => setFodaEditMode(true)}>
              <Edit3 className="w-3.5 h-3.5" /> Editar Campos
            </button>
          </div>
        </div>
      ) : null}

      {moduleKey === 'pestel' && !pestelEditMode ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <div className="view-toggle">
            <button className={!pestelEditMode ? 'active' : ''} onClick={() => setPestelEditMode(false)}>
              <Layout className="w-3.5 h-3.5" /> Vista Infografía
            </button>
            <button className={pestelEditMode ? 'active' : ''} onClick={() => setPestelEditMode(true)}>
              <Edit3 className="w-3.5 h-3.5" /> Editar Campos
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: extraAction ? 'repeat(auto-fit, minmax(450px, 1fr))' : '1fr', 
        gap: '2rem', 
        alignItems: 'start',
        width: '100%'
      }}>
        <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '3rem', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
          {moduleKey === 'foda' && !fodaEditMode ? (
            <FodaMatrix data={moduleData} />
          ) : moduleKey === 'pestel' && !pestelEditMode ? (
            <PestelAnalysis data={moduleData} />
          ) : (
            fields.map(field => (
              <div key={field.key} style={{ opacity: isLocked(field.key) ? 0.75 : 1, transition: 'opacity 0.2s' }}>
                <div className="field-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {field.type === 'mermaid' && <Network className="w-4 h-4 text-[#8b5cf6]" />}
                    {field.type === 'heatmap' && <MapIcon className="w-4 h-4 text-emerald-400" />}
                    <label className="form-label" style={{ marginBottom: 0, fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{field.label}</label>
                    <div className="tooltip-container" style={{ position: 'relative', cursor: 'help' }}>
                      <HelpCircle className="w-4 h-4 text-secondary" style={{ opacity: 0.7 }} />
                      <div className="tooltip-text">
                        <strong>¿Qué es este campo?</strong><br/>
                        {getFieldGuide(field.key).desc}
                        {getFieldGuide(field.key).ejemplo && (
                          <div style={{ marginTop: '8px', padding: '8px 10px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '8px', fontSize: '0.7rem', lineHeight: '1.4', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            <strong>Ejemplo:</strong> {getFieldGuide(field.key).ejemplo}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                      onClick={() => setShowComments(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                      className="icon-btn-rounded"
                      title="Comentarios"
                      style={{ 
                        padding: '4px', position: 'relative', background: showComments[field.key] ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        color: showComments[field.key] ? 'var(--accent-color)' : 'var(--text-secondary)',
                        border: 'none', cursor: 'pointer'
                      }}
                    >
                      <MessageSquare className="w-4 h-4" />
                      {planData.config?.comments?.[`${pillar}.${moduleKey}.${field.key}`]?.length > 0 && (
                        <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--accent-color)', color: 'white', fontSize: '0.5rem', width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {planData.config.comments[`${pillar}.${moduleKey}.${field.key}`].length}
                        </span>
                      )}
                    </button>

                    {field.type !== 'heatmap' && (
                      <div className="view-toggle">
                        <button 
                          className={!editModes[field.key] ? 'active' : ''} 
                          onClick={() => setEditModes(prev => ({ ...prev, [field.key]: false }))}
                        >
                          <Layout className="w-3.5 h-3.5" /> Visualizar
                        </button>
                        <button 
                          className={editModes[field.key] ? 'active' : ''} 
                          onClick={() => setEditModes(prev => ({ ...prev, [field.key]: true }))}
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Editar
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div className="tooltip-container" style={{ position: 'relative' }}>
                        <button 
                          onClick={() => setActiveExpertField(field)}
                          className="btn-icon" 
                          style={{ width: '30px', height: '30px', color: 'var(--accent-color)' }}
                        >
                          <Brain className="w-4 h-4" />
                        </button>
                        <div className="tooltip-text" style={{ right: '0', left: 'auto', marginLeft: '0', width: '340px' }}>
                          <strong>Prompt de IA mesa de expertos:</strong><br/>
                          {getPromptPreview(field.label, field.key, field.type).split('\n').map((line, i) => (
                            <div key={i} style={{ marginBottom: '4px' }}>{line}</div>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={() => toggleLock(pillar, moduleKey, field.key)}
                        className="btn-icon"
                        style={{ 
                          width: '30px', 
                          height: '30px', 
                          border: '1px solid transparent', 
                          background: 'transparent',
                          color: isLocked(field.key) ? 'var(--accent-color)' : 'var(--text-secondary)'
                        }}
                        title={isLocked(field.key) ? "Desbloquear edición de IA" : "Bloquear edición de IA"}
                      >
                        {isLocked(field.key) ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {draftValues[field.key] !== undefined ? (
                  <div className="draft-preview" style={{ animation: 'slideDown 0.3s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-color)' }}>Vista Previa de Regeneración (Control de Cambios)</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'var(--success-color)' }} onClick={() => { handleChange(field.key, draftValues[field.key]); setDraftValues(prev => { const n = {...prev}; delete n[field.key]; return n; }); }}>
                          <Check className="w-3.5 h-3.5" /> Aceptar Cambios
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => { setDraftValues(prev => { const n = {...prev}; delete n[field.key]; return n; }); }}>
                          <X className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      </div>
                    </div>
                    <DiffViewer oldText={safeStr(moduleData[field.key])} newText={safeStr(draftValues[field.key])} />
                  </div>
                ) : field.type === 'heatmap' ? (
                  <HeatmapEditor 
                    value={moduleData[field.key]} 
                    onChange={(val) => handleChange(field.key, val)} 
                  />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: field.type === 'mermaid' ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
                    {editModes[field.key] ? (
                      <textarea 
                        className="form-control" 
                        disabled={isLocked(field.key)}
                        placeholder={field.type === 'mermaid' ? "graph TD\n  A[Inicio] --> B(Proceso)" : "Escribe aquí..."}
                        value={safeStr(moduleData[field.key])}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        style={{ 
                          minHeight: field.type === 'mermaid' ? '350px' : '220px', 
                          fontSize: '0.9rem', 
                          lineHeight: '1.6',
                          fontFamily: field.type === 'mermaid' ? 'monospace' : 'inherit'
                        }}
                      ></textarea>
                    ) : (
                      <div 
                        className="preview-box glass-panel" 
                        onClick={() => !isLocked(field.key) && toggleEditMode(field.key)}
                        style={{
                          background: 'rgba(0,0,0,0.15)',
                          padding: '1.5rem',
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)',
                          transition: 'all 0.25s ease',
                          cursor: 'text',
                          minHeight: field.type === 'mermaid' ? '350px' : '220px'
                        }}
                      >
                        <div className="markdown-content">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {safeStr(moduleData[field.key]) || '*Sin contenido. Haz clic en "Editar" o usa la IA para generar.*'}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {field.type === 'mermaid' && (
                      <MermaidViewer 
                        chart={moduleData[field.key] || 'graph TD\n  Start --> End'} 
                        onChange={(val) => handleChange(field.key, val)}
                        theme={planData.config?.theme}
                      />
                    )}
                  </div>
                )}
                {showComments[field.key] && (
                  <FieldComments 
                    comments={planData.config?.comments?.[`${pillar}.${moduleKey}.${field.key}`] || []}
                    onAddComment={(text) => addComment(pillar, moduleKey, field.key, text)}
                    onDeleteComment={(id) => deleteComment(pillar, moduleKey, field.key, id)}
                  />
                )}
              </div>
            ))
          )}
        </div>

        {extraAction && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {extraAction}
          </div>
        )}
      </div>

      <ExpertPanel 
        fieldName={activeExpertField?.label}
        currentValue={moduleData[activeExpertField?.key] || ''}
        isOpen={!!activeExpertField}
        onClose={() => setActiveExpertField(null)}
        onApply={(newText) => {
          handleChange(activeExpertField.key, newText);
          setActiveExpertField(null);
        }}
      />

      {activeTrajectory && (
        <AgentTrajectoryViewer 
          trajectory={activeTrajectory}
          onClose={() => setActiveTrajectory(null)}
        />
      )}

      {showTelemetryModal && moduleData._trace && (
        <div className="modal-backdrop" onClick={() => setShowTelemetryModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BadgeDollarSign className="w-5 h-5 text-green-400" />
                Trazabilidad y Costos (Estimados)
              </h2>
              <button className="close-btn" onClick={() => setShowTelemetryModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                  <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Tokens Totales Invertidos</h4>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-color)' }}>
                    {moduleData._trace.tokens?.toLocaleString() || 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Prompt: {moduleData._trace.promptTokens?.toLocaleString() || 0} | Completion: {moduleData._trace.completionTokens?.toLocaleString() || 0}
                  </div>
                </div>
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Ahorro / Costo Equivalente</h4>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4ade80' }}>
                    ${moduleData._trace.cost ? moduleData._trace.cost.toFixed(4) : '0.0000'} USD
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Calculado usando tarifas comerciales API (2026)
                  </div>
                </div>
              </div>

              {moduleData._trace.logs && moduleData._trace.logs.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Detalle de Peticiones</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {moduleData._trace.logs.map((log, idx) => (
                      <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{log.provider} - {log.model}</span>
                        </div>
                        {log.reasoning && (
                          <div style={{ marginTop: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderLeft: '3px solid #8b5cf6', padding: '0.75rem', borderRadius: '0 8px 8px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8b5cf6', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                              <Brain className="w-3.5 h-3.5" /> Razonamiento Interno
                            </div>
                            <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto' }}>
                              {log.reasoning}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
