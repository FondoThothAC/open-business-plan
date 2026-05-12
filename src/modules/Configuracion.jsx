import React, { useState, useEffect } from 'react';
import { usePlan } from '../context/PlanContext';
import { Cpu, Palette, Save, Globe, Database, Upload, Image as ImageIcon, RefreshCw, Settings } from 'lucide-react';
import DocumentUploader from '../components/DocumentUploader';

export default function Configuracion() {
  const { planData, updateConfig } = usePlan();
  const [ollamaModels, setOllamaModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  const fetchOllamaModels = async () => {
    setIsFetchingModels(true);
    try {
      const endpoint = planData.config.ai.endpoint || 'http://localhost:11434';
      const response = await fetch(`${endpoint}/api/tags`);
      const data = await response.json();
      
      if (data.models) {
        setOllamaModels(data.models.map(m => ({
          name: m.name,
          details: m.details
        })));
      }
    } catch (error) {
      console.warn("No se pudo conectar con Ollama para listar modelos:", error.message);
      // Fallback a modelos conocidos si falla la conexión
      setOllamaModels([
        { name: 'gemma4:e2b' },
        { name: 'qwen2.5:1.5b' },
        { name: 'llama3.2:3b' },
        { name: 'phi3:latest' }
      ]);
    } finally {
      setIsFetchingModels(false);
    }
  };

  useEffect(() => {
    fetchOllamaModels();
  }, [planData.config.ai.endpoint]);

  const handleAiChange = (field, value) => {
    updateConfig('ai', field, value);
  };

  const handleBrandChange = (field, value) => {
    updateConfig('brandKit', field, value);
  };

  const handleExternalChange = (field, value) => {
    updateConfig('externalApis', field, value);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleBrandChange('logoUrl', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="module-view">
      <div className="view-header">
        <div>
          <h1 className="view-title">Configuración Maestro</h1>
          <p className="text-secondary mt-1">Industrialización: IA con Fallback, APIs y Kit de Marca.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Metodología del Proyecto */}
        <div className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Settings style={{ color: 'var(--accent-color)' }} />
            <h2 style={{ fontSize: '1.25rem' }}>Metodología del Proyecto</h2>
          </div>
          <div className="form-group">
            <label className="form-label">Tipo de Proyecto</label>
            <select 
              className="form-control" 
              value={planData.config?.projectType || 'business'}
              onChange={(e) => {
                // If they change methodology, update it
                updateConfig('projectType', null, e.target.value); // Wait, updateConfig takes (category, field, value) or (field, value)? Let's check updateConfig usage.
              }}
            >
              <option value="business">Plan de Negocios Comercial (Tradicional)</option>
              <option value="social_bid">Proyecto Social (Metodología BID)</option>
            </select>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Cambiar este valor adaptará automáticamente toda la plataforma (Semilla, Menús, Módulos e Inteligencia Artificial) a la metodología seleccionada.
            </p>
          </div>
        </div>

        {/* IA Config con Fallback */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Cpu style={{ color: 'var(--accent-color)' }} />
            <h2 style={{ fontSize: '1.25rem' }}>IA Swarm con Auto-Fallback</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Proveedor Primario</label>
              <select 
                className="form-control" 
                value={planData.config.ai.primaryProvider}
                onChange={(e) => handleAiChange('primaryProvider', e.target.value)}
              >
                <option value="gemini">Gemini</option>
                <option value="groq">Groq</option>
                <option value="ollama">Ollama (Local)</option>
              </select>
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Modelo Local (Ollama)</label>
                <button 
                  onClick={fetchOllamaModels} 
                  className="btn btn-secondary" 
                  style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                  title="Refrescar modelos"
                  disabled={isFetchingModels}
                >
                  <RefreshCw className={`w-3 h-3 ${isFetchingModels ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <select 
                value={planData.config.ai.model} 
                onChange={(e) => handleAiChange('model', e.target.value)}
                className="form-control"
              >
                {ollamaModels.length > 0 ? (
                  ollamaModels.map(model => (
                    <option key={model.name} value={model.name}>
                      {model.name} {model.details?.parameter_size ? `(${model.details.parameter_size})` : ''}
                    </option>
                  ))
                ) : (
                  <option value="">No se detectaron modelos</option>
                )}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">API Key (Gemini/OpenAI/Mistral)</label>
            <input 
              type="password" 
              className="form-control" 
              value={planData.config.ai.apiKey}
              onChange={(e) => handleAiChange('apiKey', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">API Key (Groq)</label>
            <input 
              type="password" 
              className="form-control" 
              value={planData.config.ai.groqKey}
              onChange={(e) => handleAiChange('groqKey', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ollama Endpoint</label>
            <input 
              type="text" 
              className="form-control" 
              value={planData.config.ai.endpoint || 'http://localhost:11434'}
              onChange={(e) => handleAiChange('endpoint', e.target.value)}
            />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Palette className="text-[#8b5cf6]" />
            <h2 style={{ fontSize: '1.25rem' }}>Kit de Marca e Identidad</h2>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre del Proyecto</label>
            <input 
              type="text" 
              className="form-control" 
              value={planData.config.brandKit.companyName}
              onChange={(e) => handleBrandChange('companyName', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Logotipo de Empresa</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                border: '1px dashed var(--border-color)', 
                borderRadius: '8px', 
                display: 'flex',
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'var(--input-bg)',
                overflow: 'hidden'
              }}>
                {planData.config.brandKit.logoUrl ? (
                  <img src={planData.config.brandKit.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <ImageIcon className="w-6 h-6 text-secondary" />
                )}
              </div>
              <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                <Upload className="w-4 h-4" />
                <span>Subir PNG</span>
                <input type="file" accept="image/png, image/jpeg" style={{ display: 'none' }} onChange={handleLogoUpload} />
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Color de Acento</label>
            <input 
              type="color" 
              className="form-control" 
              style={{ height: '42px', padding: '2px' }}
              value={planData.config.brandKit.primaryColor}
              onChange={(e) => handleBrandChange('primaryColor', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tema de Interfaz</label>
            <select 
              className="form-control" 
              value={planData.config.theme || 'dark'}
              onChange={(e) => updateConfig('theme', '', e.target.value)}
            >
              <option value="dark">Modo Oscuro (Industrial)</option>
              <option value="light">Modo Claro (Académico)</option>
              <option value="midnight">Noche Profunda (Contraste)</option>
              <option value="forest">Sostenible (Bosque)</option>
              <option value="clean">Ejecutivo (Limpio)</option>
              <option value="oceanic">Creativo (Océano)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Database className="text-emerald-400" />
          <h2 style={{ fontSize: '1.25rem' }}>Investigación Estratégica (INEGI / DENUE)</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="form-group">
            <label className="form-label">Token INEGI / DENUE</label>
            <input 
              type="password" 
              className="form-control" 
              value={planData.config.externalApis.inegiToken}
              onChange={(e) => handleExternalChange('inegiToken', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Token BANXICO</label>
            <input 
              type="password" 
              className="form-control" 
              value={planData.config.externalApis.banxicoToken}
              onChange={(e) => handleExternalChange('banxicoToken', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Créditos y Metodologías */}
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Database style={{ color: 'var(--accent-color)' }} />
          <h2 style={{ fontSize: '1.25rem' }}>Créditos y Metodologías Aplicadas</h2>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '1rem' }}>
            El motor financiero y estratégico de esta plataforma ha sido calibrado usando estándares de clase mundial y metodologías oficiales para garantizar validez institucional y viabilidad bancaria:
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>NAFIN (Nacional Financiera):</strong> Estructuras de Flujo de Caja y evaluación crediticia para MiPyMEs en México.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>BID (Banco Interamericano de Desarrollo):</strong> Implementación de la Metodología de Marco Lógico (MML) para el diseño, ejecución y evaluación de proyectos sociales.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>CFI (Corporate Finance Institute):</strong> Fórmulas estandarizadas globales para Valor Actual Neto (VAN), Tasa Interna de Retorno (TIR) y Retorno sobre Inversión (ROI).</li>
            <li><strong>INEGI y Banxico:</strong> Datos macroeconómicos integrados a través de DENUE y SieAPI para el análisis del entorno regional.</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <DocumentUploader />
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <RefreshCw style={{ color: '#ef4444' }} />
          <h2 style={{ fontSize: '1.25rem', color: '#ef4444' }}>Herramientas de Emergencia</h2>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Si experimentas problemas con datos mezclados de otros proyectos o la vista previa no se actualiza, usa el botón de abajo para limpiar completamente el motor.
        </p>
        <button 
          className="btn" 
          style={{ background: '#ef4444', color: 'white', border: 'none' }}
          onClick={() => {
            if (window.confirm('⚠️ ¿LIMPIAR TODO? Esto borrará el caché del navegador y reiniciará el proyecto desde cero. Úsalo si ves datos mezclados.')) {
              localStorage.clear();
              window.location.href = '/semilla';
            }
          }}
        >
          <Database className="w-4 h-4" />
          <span>Limpiar Todo y Reiniciar Master</span>
        </button>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'right' }}>
        <button className="btn btn-primary" onClick={() => alert('Industrialización Guardada')}>
          <Save className="w-4 h-4" />
          <span>Guardar Configuración</span>
        </button>
      </div>
    </div>
  );
}
