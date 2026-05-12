import React, { useState } from 'react';
import { usePlan } from '../context/PlanContext';
import { Sparkles, Loader2, Info, Search, Brain, CheckCircle2, Lock, Unlock, BarChart3, Map as MapIcon, Network, Eye, EyeOff, HelpCircle, Edit3, Layout } from 'lucide-react';
import { generateModuleContent } from '../lib/ai';
import { BUSINESS_GUIDES, SOCIAL_GUIDES } from '../lib/field_guides';
import MermaidViewer from './MermaidViewer';
import HeatmapEditor from './HeatmapEditor';
import ExpertPanel from './ExpertPanel';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ModuleWrapper({ pillar, moduleKey, title, description, fields, extraAction }) {
  const { planData, updateSection, toggleLock, toggleModuleVisibility } = usePlan();
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('');
  const [activeExpertField, setActiveExpertField] = useState(null);
  const [editModes, setEditModes] = useState({});
  const [depth, setDepth] = useState(planData.config?.ai?.depth || 1);
  
  const isLocked = (fieldKey) => planData.config.locks?.[`${pillar}.${moduleKey}.${fieldKey}`];
  const isModuleVisible = planData.config?.visibility?.[`${pillar}.${moduleKey}`] !== false;

  const projectType = planData.config?.projectType || 'business';
  const FIELD_GUIDES = projectType === 'social_bid' ? SOCIAL_GUIDES : BUSINESS_GUIDES;

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
    if (!planData.config.ai.apiKey && planData.config.ai.provider !== 'ollama') {
      alert("Por favor, configura tu API Key en la sección de Configuración.");
      return;
    }

    const unlockedFields = fields.filter(f => !isLocked(f.key));
    if (unlockedFields.length === 0) return;

    setLoading(true);
    setStage('Consultando Analista...');
    
    try {
      // Add visual context instructions for IA
      const enrichedFields = unlockedFields.map(f => {
        if (f.type === 'mermaid') return { ...f, label: f.label + " (Genera código Mermaid.js válido)" };
        return f;
      });

      const currentModule = { pillar, moduleKey, title, description, fields: enrichedFields };
      const aiConfig = { ...planData.config.ai, depth };
      
      const timer1 = setTimeout(() => setStage('IA diseñando visuales...'), 3000);
      const timer2 = setTimeout(() => setStage('Sintetizando estructura...'), 6000);

      const result = await generateModuleContent(aiConfig, currentModule, planData);
      
      clearTimeout(timer1);
      clearTimeout(timer2);

      Object.keys(result).forEach(key => {
        if (fields.find(f => f.key === key) && !isLocked(key)) {
          handleChange(key, result[key]);
        }
      });
      setStage('Completado');
      setTimeout(() => setStage(''), 3000);
    } catch (error) {
      alert(error.message);
      setStage('Error');
    } finally {
      setLoading(false);
    }
  };

  const moduleData = planData[pillar]?.[moduleKey] || {};

  return (
    <div className="module-view">
      <div className="view-header">
        <div>
          <h1 className="view-title">{title}</h1>
          <p className="text-secondary mt-1">{description}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <div className="glass-panel" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
            <Brain className="w-3 h-3 text-[#8b5cf6]" />
            <span style={{ color: 'var(--text-secondary)' }}>Mesa de Expertos activa: <strong>Analista + Crítico + Redactor</strong></span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Selector de profundidad — solo si advancedDepth está habilitado en Config */}
            {planData.config?.ai?.advancedDepth && (
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '2px', border: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { level: 1, icon: '⚡', label: 'Rápido',   time: '~1min'  },
                  { level: 2, icon: '🧠', label: 'Pro',      time: '~3min'  },
                  { level: 3, icon: '🔬', label: 'Profundo', time: '~10min' },
                ].map(({ level, icon, label, time }) => (
                  <button key={level}
                    onClick={() => setDepth(level)}
                    title={`${label} — ${time}`}
                    style={{
                      padding: '0.3rem 0.6rem', borderRadius: '8px', border: 'none',
                      background: depth === level ? 'var(--accent-color)' : 'transparent',
                      color: depth === level ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: '0.75rem', fontWeight: depth === level ? 800 : 400,
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.25rem'
                    }}
                  >
                    <span>{icon}</span>
                    <span style={{ display: window.innerWidth > 1200 ? 'inline' : 'none' }}>{label}</span>
                  </button>
                ))}
              </div>
            )}
            <button 
              className={`btn ${isModuleVisible ? 'btn-secondary' : 'btn-danger'}`}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', opacity: isModuleVisible ? 1 : 0.6 }}
              onClick={() => toggleModuleVisibility(pillar, moduleKey)}
              title={isModuleVisible ? "Incluir en Reporte" : "Excluido del Reporte"}
            >
              {isModuleVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{isModuleVisible ? "Visible" : "Oculto"}</span>
            </button>
            {extraAction}
            <button 
              className="btn btn-ia" 
              onClick={handleAiGenerate}
              disabled={loading}
              style={{ 
                background: loading ? 'rgba(99, 102, 241, 0.2)' : 'var(--accent-color)',
                boxShadow: loading ? 'none' : '0 0 15px var(--accent-color)',
                opacity: loading ? 0.7 : 1, 
                cursor: loading ? 'not-allowed' : 'pointer',
                minWidth: '120px'
              }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'IA...' : 'IA'}</span>
            </button>
          </div>
          {stage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-color)' }}>
              {stage.includes('Completado') ? <CheckCircle2 className="w-3 h-3" /> : <Brain className="w-3 h-3 animate-pulse" />}
              <span>{stage}</span>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem'}}>
        {fields.map(field => (
          <div key={field.key} style={{ opacity: isLocked(field.key) ? 0.8 : 1 }}>
            <div className="field-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {field.type === 'mermaid' && <Network className="w-4 h-4 text-[#8b5cf6]" />}
                {field.type === 'heatmap' && <MapIcon className="w-4 h-4 text-emerald-400" />}
                <label className="form-label" style={{ marginBottom: 0, fontWeight: '600', color: 'white' }}>{field.label}</label>
                <div className="tooltip-container" style={{ position: 'relative', cursor: 'help' }}>
                  <HelpCircle className="w-3.5 h-3.5 text-secondary" />
                  <div className="tooltip-text">
                    <strong>¿Qué es este campo?</strong><br/>
                    {getFieldGuide(field.key).desc}
                    {getFieldGuide(field.key).ejemplo && (
                      <div style={{ marginTop: '8px', padding: '6px 8px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '6px', fontSize: '0.7rem', lineHeight: '1.4' }}>
                        {getFieldGuide(field.key).ejemplo}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {field.type !== 'heatmap' && (
                  <div className="view-toggle">
                    <button 
                      className={!editModes[field.key] ? 'active' : ''} 
                      onClick={() => setEditModes(prev => ({ ...prev, [field.key]: false }))}
                    >
                      <Layout className="w-3 h-3" /> Visualizar
                    </button>
                    <button 
                      className={editModes[field.key] ? 'active' : ''} 
                      onClick={() => setEditModes(prev => ({ ...prev, [field.key]: true }))}
                    >
                      <Edit3 className="w-3 h-3" /> Editar
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="tooltip-container" style={{ position: 'relative' }}>
                    <button 
                      onClick={() => setActiveExpertField(field)}
                      className="btn-icon" 
                      style={{ width: '28px', height: '28px', color: 'var(--accent-color)' }}
                    >
                      <Brain className="w-4 h-4" />
                    </button>
                    <div className="tooltip-text" style={{ right: '0', left: 'auto', marginLeft: '0', width: '340px' }}>
                      <strong>Prompt que se envía a la IA:</strong><br/>
                      {getPromptPreview(field.label, field.key, field.type).split('\n').map((line, i) => (
                        <div key={i} style={{ marginBottom: '4px' }}>{line}</div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => toggleLock(pillar, moduleKey, field.key)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isLocked(field.key) ? 'var(--accent-color)' : 'var(--text-secondary)' }}
                  >
                    {isLocked(field.key) ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {field.type === 'heatmap' ? (
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
                    value={moduleData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    style={{ 
                      minHeight: field.type === 'mermaid' ? '300px' : '180px', 
                      fontSize: '0.9rem', 
                      fontFamily: field.type === 'mermaid' ? 'monospace' : 'inherit'
                    }}
                  ></textarea>
                ) : (
                  <div className="preview-box" onClick={() => !isLocked(field.key) && toggleEditMode(field.key)}>
                    <div className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {moduleData[field.key] || '*Sin contenido. Haz clic en "Editar" o usa la IA para generar.*'}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
                {field.type === 'mermaid' && (
                  <MermaidViewer chart={moduleData[field.key] || 'graph TD\n  Start --> End'} />
                )}
              </div>
            )}
          </div>
        ))}
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
    </div>
  );
}
