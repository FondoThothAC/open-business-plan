import React, { createContext, useState, useContext, useEffect } from 'react';
import { PROJECT_EXAMPLES } from '../lib/projects_db';
import { FRAMEWORKS } from '../config/frameworks';
import { getApiBase } from '../config/apiConfig';

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

const PlanContext = createContext();
export const usePlan = () => useContext(PlanContext);

const deepMerge = (target, source) => {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else if (source[key] !== undefined && source[key] !== '') {
      result[key] = source[key];
    }
  }
  return result;
};

// [SDD] Las API keys se leen desde variables de entorno VITE_* (definidas en .env.local)
// .env.local NO se sube a git (ver .gitignore). Para el VPS se configura en el shell del servidor.
const KEYS = {
  gemini:      import.meta.env.VITE_GEMINI_KEY      || '',
  groq:        import.meta.env.VITE_GROQ_KEY        || '',
  mistral:     import.meta.env.VITE_MISTRAL_KEY     || '',
  nvidia:      import.meta.env.VITE_NVIDIA_KEY      || '',
  openrouter:  import.meta.env.VITE_OPENROUTER_KEY  || '',
  ollama:      import.meta.env.VITE_OLLAMA_KEY      || '',
  pollinations:import.meta.env.VITE_POLLINATIONS_KEY|| '',
  denue:       import.meta.env.VITE_DENUE_KEY       || '1b9e230f-2ae0-48db-bd20-8810b1db575e',
  banxico:     import.meta.env.VITE_BANXICO_KEY     || '',
};

const createEmptyPlan = (projectType = 'business') => {
  const framework = FRAMEWORKS[projectType];
  const plan = {
    config: {
      projectType,
      activeMethodologies: [projectType],
      locks: {}, theme: 'light',
      visibility: {},
      comments: {},
      ai: {
        primaryProvider: 'groq', secondaryProvider: 'nvidia',
        apiKey: KEYS.gemini, groqKey: KEYS.groq, 
        nvidiaKey: KEYS.nvidia, mistralKey: KEYS.mistral, ollamaKey: KEYS.ollama,
        pollinationsKey: KEYS.pollinations,
        endpoint: 'http://localhost:11434', lmStudioEndpoint: 'http://localhost:1234/v1',
        model: 'groq/compound-mini',   // Modelo principal activo verificado
        depth: 1,              // 1=Rápido, 2=Pro, 3=Profundo
        contextSize: 65536,    // 64k por defecto
        // [DDD] Modelos por rol
        agentModels: {
          analista:     { model: 'groq/compound-mini', role: 'Analista Estratégico' },
          critico:      { model: 'groq/compound-mini', role: 'Crítico Financiero' },
          redactor:     { model: 'groq/compound-mini', role: 'Redactor Ejecutivo' },
          estratega:    { model: 'groq/compound-mini', role: 'Estratega de Negocio' },
          abogadoDiablo:{ model: 'groq/compound-mini', role: "Devil's Advocate" },
        }
      },
      brandKit: { primaryColor: '#6366f1', secondaryColor: '#8b5cf6', logoUrl: '', companyName: '' },
      externalApis: { inegiToken: KEYS.denue, banxicoToken: KEYS.banxico },
      anexos: [],
      documents: [],
      coverDesign: {
        layout: 'classic', // 'classic', 'modern', 'minimalist', 'sidebar'
        logoSize: 'medium', // 'small', 'medium', 'large'
        logoAlign: 'center', // 'left', 'center', 'right'
        titleSize: 'medium', // 'small', 'medium', 'large'
        creatorName: '',
        subtitle: 'Plan Estratégico Maestro',
        institution: 'Formulación y Evaluación Académica 2026',
        showDate: true,
        customDate: '',
        institutionLogos: [] // [{ id, name, url }]
      },
      globalOrientation: 'portrait', // 'portrait' o 'landscape' — se puede sobreescribir por sección
      pageOrientations: {},
      moduleOrder: [],
      dataSources: [], // [{ id, type: 'auto'|'manual', title, url, description }]
      search: {
        provider: 'tavily',
        tavilyApiKey: '',
        enableDdg: true,          // DuckDuckGo activo por defecto (gratis)
        duckDuckGoEnabled: true,  // Alias usado en Configuracion.jsx
        scraperEngine: 'local'    // Puppeteer Stealth activo por defecto (gratis)
      },
      regionalSettings: {
        country: 'Mexico',
        economicBloc: 'NAFTA',
        classificationSystem: 'SCIAN', // Ej. SCIAN, NAICS, CNAE (Mercosur), NACE (Europa), ISIC
        currency: 'MXN'
      }
    },
    semilla: {}
  };

  if (framework) {
    framework.pillars.forEach(pillar => {
      plan[pillar.key] = {};
      pillar.modules.forEach(mod => {
        plan[pillar.key][mod.key] = {};
        mod.fields.forEach(field => {
          plan[pillar.key][mod.key][field] = '';
        });
      });
    });
  }

  // Organizacion specific defaults for business
  if (projectType === 'business') {
    plan.organizacion.staff = [{ id: '1', role: 'Director General', salary: 0, reportsTo: null }];
    plan.tecnico.processes = [];
  }

  return plan;
};

export const PlanProvider = ({ children }) => {
  const getInitialGenStatus = () => {
    const saved = localStorage.getItem('openplan_gen_status');
    if (saved === 'running') return 'paused'; // Safe fallback on reload
    return saved || 'idle';
  };

  const getInitialGenProgress = () => {
    const saved = localStorage.getItem('openplan_gen_progress');
    try {
      return saved ? JSON.parse(saved) : { completed: 0, total: 0, currentModule: '' };
    } catch {
      return { completed: 0, total: 0, currentModule: '' };
    }
  };

  const getInitialGenQueue = () => {
    const saved = localStorage.getItem('openplan_gen_queue');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const getInitialData = () => {
    const isNew = localStorage.getItem('openplan_new_project_flag') === 'true';
    const saved = localStorage.getItem('openplan_v2_data');
    
    if (isNew) {
      const base = createEmptyPlan('business');
      base.config.brandKit.companyName = 'Proyecto Nuevo';
      return base; // Totalmente limpio para un proyecto nuevo
    }

    if (!saved) {
      const base = createEmptyPlan('business');
      base.config.brandKit.companyName = 'Ferretería y Suministros Kino';
      const merged = deepMerge(base, PROJECT_EXAMPLES.ferreteria_kino.data);
      if (!merged.config.activeMethodologies) {
        merged.config.activeMethodologies = [merged.config.projectType || 'business'];
      }
      return merged;
    }
    try {
      const parsed = JSON.parse(saved);
      const base = createEmptyPlan(parsed.config?.projectType || 'business');
      const merged = deepMerge(base, parsed);

      // Inyectar API Keys predeterminadas si están vacías
      if (merged.config?.ai) {
        if (!merged.config.ai.apiKey) merged.config.ai.apiKey = KEYS.gemini;
        if (!merged.config.ai.groqKey) merged.config.ai.groqKey = KEYS.groq;
        if (!merged.config.ai.nvidiaKey) merged.config.ai.nvidiaKey = KEYS.nvidia;
        if (!merged.config.ai.mistralKey) merged.config.ai.mistralKey = KEYS.mistral;
        if (!merged.config.ai.openrouterKey) merged.config.ai.openrouterKey = KEYS.openrouter;
        if (!merged.config.ai.ollamaKey) merged.config.ai.ollamaKey = KEYS.ollama;
        if (!merged.config.ai.pollinationsKey) merged.config.ai.pollinationsKey = KEYS.pollinations;
      }
      if (merged.config?.externalApis) {
        if (!merged.config.externalApis.inegiToken) merged.config.externalApis.inegiToken = KEYS.denue;
        if (!merged.config.externalApis.banxicoToken) merged.config.externalApis.banxicoToken = KEYS.banxico;
      }

      if (!merged.config.activeMethodologies) {
        merged.config.activeMethodologies = [merged.config.projectType || 'business'];
      }
      return merged;
    } catch {
      return createEmptyPlan('business');
    }
  };

  const [planData, setPlanData] = useState(getInitialData);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'error'
  const [generationStatus, setGenerationStatus] = useState(getInitialGenStatus); // 'idle' | 'running' | 'paused'
  const [generationProgress, setGenerationProgress] = useState(getInitialGenProgress);
  const [generationQueue, setGenerationQueue] = useState(getInitialGenQueue);

  // Refs for tracking synchronous state inside async loop
  const planDataRef = React.useRef(planData);
  useEffect(() => {
    planDataRef.current = planData;
  }, [planData]);

  const statusRef = React.useRef(generationStatus);
  useEffect(() => {
    statusRef.current = generationStatus;
  }, [generationStatus]);

  const queueRef = React.useRef(generationQueue);
  useEffect(() => {
    queueRef.current = generationQueue;
  }, [generationQueue]);

  // Persist generation queue and status
  useEffect(() => {
    localStorage.setItem('openplan_gen_status', generationStatus);
  }, [generationStatus]);

  useEffect(() => {
    localStorage.setItem('openplan_gen_progress', JSON.stringify(generationProgress));
  }, [generationProgress]);

  useEffect(() => {
    localStorage.setItem('openplan_gen_queue', JSON.stringify(generationQueue));
  }, [generationQueue]);

  // Hook de montaje para cargar el proyecto activo directamente del backend local (resuelve bugs de recarga)
  useEffect(() => {
    const syncWithBackend = async () => {
      let activeId = localStorage.getItem('openplan_active_project_id');
      let activeType = localStorage.getItem('openplan_active_project_type') || 'negocios';

      // Si se solicitó explícitamente un proyecto nuevo, no auto-cargamos nada y limpiamos la bandera
      const isNewProject = localStorage.getItem('openplan_new_project_flag') === 'true';
      if (isNewProject) {
        localStorage.removeItem('openplan_new_project_flag');
        return;
      }

      // Si es un proyecto nuevo no guardado aún, respetamos el lienzo limpio y no auto-cargamos nada
      if (localStorage.getItem('openplan_is_unsaved_new') === 'true') {
        console.log('Proyecto nuevo en edición (aún no guardado en backend). Omitiendo auto-carga.');
        return;
      }

      // Si no hay proyecto activo, intentamos auto-cargar el último modificado en el backend
      if (!activeId) {
        try {
          const listRes = await fetch('http://localhost:3001/api/projects');
          if (listRes.ok) {
            const projectsObj = await listRes.json();
            const allProjects = [];
            if (projectsObj.negocios) {
              projectsObj.negocios.forEach(p => allProjects.push({ ...p, type: 'negocios' }));
            }
            if (projectsObj.social) {
              projectsObj.social.forEach(p => allProjects.push({ ...p, type: 'social' }));
            }
            
            if (allProjects.length > 0) {
              // Ordenar por fecha de modificación mtime descendente (el más reciente primero)
              allProjects.sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
              activeId = allProjects[0].id;
              activeType = allProjects[0].type;
              localStorage.setItem('openplan_active_project_id', activeId);
              localStorage.setItem('openplan_active_project_type', activeType);
            }
          }
        } catch (listErr) {
          console.error('Error listing projects for auto-load on mount:', listErr);
        }
      }

      if (activeId) {
        // Para evitar condiciones de carrera donde el backend pise cambios locales de localStorage síncronos
        // que aún no se han guardado con debounce, si el ID coincide con el que ya tenemos en memoria, no hacemos fetch.
        try {
          const backendBase = getApiBase();
          const response = await fetch(`${backendBase}/api/projects/${activeType}/${activeId}`);
          if (response.ok) {
            const data = await response.json();
            const fresh = createEmptyPlan(data.config?.projectType || 'business');
            data.config = { ...data.config, projectId: activeId };
            const merged = deepMerge(fresh, data);
            
            // Garantizar persistencia de API Keys si el JSON remoto o local tenía strings vacíos
            if (!merged.config.ai.apiKey) merged.config.ai.apiKey = KEYS.gemini;
            if (!merged.config.ai.groqKey) merged.config.ai.groqKey = KEYS.groq;
            if (!merged.config.ai.nvidiaKey) merged.config.ai.nvidiaKey = KEYS.nvidia;
            if (!merged.config.ai.mistralKey) merged.config.ai.mistralKey = KEYS.mistral;
            if (!merged.config.ai.pollinationsKey) merged.config.ai.pollinationsKey = KEYS.pollinations;
            if (!merged.config.ai.ollamaKey) merged.config.ai.ollamaKey = KEYS.ollama;

            if (merged.config.externalApis) {
              if (!merged.config.externalApis.inegiToken) merged.config.externalApis.inegiToken = KEYS.denue;
              if (!merged.config.externalApis.banxicoToken) merged.config.externalApis.banxicoToken = KEYS.banxico;
            }

            if (!merged.config.activeMethodologies) {
              merged.config.activeMethodologies = [merged.config.projectType || 'business'];
            }
            setPlanData(merged);
            localStorage.setItem('openplan_v2_data', JSON.stringify(merged));
          }
        } catch (err) {
          console.error('Error syncing project from backend on mount:', err);
        }
      }
    };
    syncWithBackend();
  }, []);

  useEffect(() => {
    localStorage.setItem('openplan_v2_data', JSON.stringify(planData));
    document.documentElement.setAttribute('data-theme', planData.config?.theme || 'dark');
    if (planData.config?.brandKit) {
      document.documentElement.style.setProperty('--accent-color', planData.config.brandKit.primaryColor);
      document.documentElement.style.setProperty('--accent-hover', planData.config.brandKit.secondaryColor);
    }

    if (planData.config?.projectId) {
      localStorage.setItem('openplan_active_project_id', planData.config.projectId);
      const projectTypeRaw = planData.config?.projectType || 'business';
      const projectType = projectTypeRaw === 'social_bid' ? 'social' : 'negocios';
      localStorage.setItem('openplan_active_project_type', projectType);
    }

    // Auto-save to Backend (Local o Remoto en VPS)
    setSaveStatus('saving');
    const saveTimer = setTimeout(async () => {
      try {
        const backendBase = getApiBase();
        const response = await fetch(`${backendBase}/api/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(planData)
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.file && planData.config.projectId !== resData.file) {
            setPlanData(prev => ({
              ...prev,
              config: { ...prev.config, projectId: resData.file }
            }));
            localStorage.setItem('openplan_active_project_id', resData.file);
            localStorage.removeItem('openplan_is_unsaved_new');
          }
          setSaveStatus('saved');
        } else {
          setSaveStatus('error');
        }
      } catch {
        setSaveStatus('error');
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(saveTimer);
  }, [planData]);

  const manualSaveProject = async (customPlanData = planData) => {
    setSaveStatus('saving');
    try {
      const backendBase = getApiBase();
      const response = await fetch(`${backendBase}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customPlanData)
      });
      if (response.ok) {
        const resData = await response.json();
        if (resData.file) {
          localStorage.removeItem('openplan_is_unsaved_new');
          setPlanData(prev => {
            const next = {
              ...prev,
              config: { 
                ...prev.config, 
                projectId: resData.file,
                brandKit: { ...prev.config.brandKit, companyName: customPlanData.config.brandKit.companyName }
              }
            };
            localStorage.setItem('openplan_v2_data', JSON.stringify(next));
            localStorage.setItem('openplan_active_project_id', resData.file);
            const projectTypeRaw = next.config?.projectType || 'business';
            const projectType = projectTypeRaw === 'social_bid' ? 'social' : 'negocios';
            localStorage.setItem('openplan_active_project_type', projectType);
            return next;
          });
        }
        setSaveStatus('saved');
        return resData.file || true;
      } else {
        setSaveStatus('error');
        return false;
      }
    } catch {
      setSaveStatus('error');
      return false;
    }
  };

  const saveProjectAs = async () => {
    const newName = window.prompt('Introduce el nuevo nombre para este proyecto (Guardar como):');
    if (!newName || !newName.trim()) return;

    const newPlanData = {
      ...planData,
      config: {
        ...planData.config,
        projectId: undefined, // Limpiamos para forzar la creación de un nuevo archivo en el backend
        brandKit: {
          ...planData.config.brandKit,
          companyName: newName.trim()
        }
      }
    };

    setSaveStatus('saving');
    const newFileId = await manualSaveProject(newPlanData);
    if (newFileId) {
      alert(`Proyecto guardado exitosamente como: "${newName.trim()}"`);
    } else {
      alert('Error al guardar el proyecto con el nuevo nombre.');
    }
  };

  const loadProject = (id) => {
    const example = PROJECT_EXAMPLES[id];
    if (!example) return;
    const type = example.projectType || example.data?.config?.projectType || EXAMPLE_FRAMEWORK_MAP[id] || 'business';
    const fresh = createEmptyPlan(type);
    fresh.config.brandKit.companyName = example.name;
    fresh.config.projectId = id;
    fresh.config.ai = planData.config.ai;
    fresh.config.theme = planData.config.theme;
    fresh.config.externalApis = planData.config.externalApis;
    const merged = deepMerge(fresh, example.data);
    if (!merged.config.activeMethodologies) {
      merged.config.activeMethodologies = [merged.config.projectType || 'business'];
    }
    setPlanData(merged);
  };

  const loadSavedProject = async (type, id) => {
    try {
      const backendBase = getApiBase();
      const response = await fetch(`${backendBase}/api/projects/${type}/${id}`);
      if (!response.ok) throw new Error('No se pudo cargar el proyecto del servidor');
      const data = await response.json();
      
      const fresh = createEmptyPlan(data.config?.projectType || 'business');
      // Set the projectId so we keep saving to the same file
      data.config = { ...data.config, projectId: id };
      const merged = deepMerge(fresh, data);
      if (!merged.config.activeMethodologies) {
        merged.config.activeMethodologies = [merged.config.projectType || 'business'];
      }
      setPlanData(merged);
      
      localStorage.setItem('openplan_active_project_id', id);
      localStorage.setItem('openplan_active_project_type', type);
      localStorage.removeItem('openplan_is_unsaved_new');
      return true;
    } catch (err) {
      console.error(err);
      alert('No se pudo cargar el proyecto guardado: ' + err.message);
      return false;
    }
  };

  const updateSection = (pillar, module, field, value) => {
    setPlanData(prev => ({
      ...prev,
      [pillar]: { ...prev[pillar], [module]: { ...prev[pillar][module], [field]: value } }
    }));
  };

  const updateConfig = (section, field, value) => {
    setPlanData(prev => {
      if (!field) return { ...prev, config: { ...prev.config, [section]: value } };
      return { ...prev, config: { ...prev.config, [section]: { ...prev.config[section], [field]: value } } };
    });
  };

  const toggleLock = (pillar, module, field) => {
    const key = `${pillar}.${module}.${field}`;
    setPlanData(prev => ({
      ...prev,
      config: { ...prev.config, locks: { ...prev.config.locks, [key]: !prev.config.locks?.[key] } }
    }));
  };

  const toggleModuleVisibility = (pillar, module) => {
    const key = `${pillar}.${module}`;
    setPlanData(prev => ({
      ...prev,
      config: { ...prev.config, visibility: { ...prev.config.visibility, [key]: prev.config.visibility?.[key] === false ? true : false } }
    }));
  };

  const updateStaff = (newStaff) => {
    setPlanData(prev => ({ ...prev, organizacion: { ...prev.organizacion, staff: newStaff } }));
  };

  const updateProcesses = (newProcesses) => {
    setPlanData(prev => ({ ...prev, tecnico: { ...prev.tecnico, processes: newProcesses } }));
  };

  const addAnexo = (anexo) => {
    setPlanData(prev => ({
      ...prev,
      config: { ...prev.config, anexos: [...(prev.config.anexos || []), anexo] }
    }));
  };

  const updateSemilla = (field, value) => {
    setPlanData(prev => {
      const next = {
        ...prev,
        semilla: { ...prev.semilla, [field]: value }
      };
      if (field === 'nombre_proyecto') {
        next.config = {
          ...next.config,
          brandKit: {
            ...next.config.brandKit,
            companyName: value
          }
        };
      }
      return next;
    });
  };

  const createNewProject = () => {
    if (window.confirm(`¿Estás seguro de crear un nuevo proyecto? Se perderán los cambios no guardados del actual.`)) {
      localStorage.removeItem('openplan_v2_data');
      localStorage.removeItem('openplan_active_project_id');
      localStorage.removeItem('openplan_active_project_type');
      localStorage.setItem('openplan_new_project_flag', 'true');
      localStorage.setItem('openplan_is_unsaved_new', 'true'); // Flag to prevent auto-loading of the last edited project
      const basePath = import.meta.env.BASE_URL || '/';
      window.location.href = `${basePath.endsWith('/') ? basePath.slice(0, -1) : basePath}/semilla`;
    }
  };

  const updateProjectName = (name) => {
    setPlanData(prev => {
      const oldName = prev.config.brandKit.companyName;
      const newData = { ...prev };
      
      // Update config
      newData.config = { 
        ...prev.config, 
        brandKit: { ...prev.config.brandKit, companyName: name } 
      };

      // Deep sync: replace old name with new name in ALL text fields if they were generated
      if (oldName && oldName.length > 3) {
        const pillars = ['naturaleza', 'mercado', 'tecnico', 'organizacion', 'finanzas', 'semilla'];
        pillars.forEach(pillar => {
          if (!newData[pillar]) return;
          Object.keys(newData[pillar]).forEach(modKey => {
            if (typeof newData[pillar][modKey] === 'object') {
              Object.keys(newData[pillar][modKey]).forEach(field => {
                const val = newData[pillar][modKey][field];
                if (typeof val === 'string' && val.includes(oldName)) {
                  newData[pillar][modKey][field] = val.replaceAll(oldName, name);
                }
              });
            }
          });
        });
      }

      return newData;
    });
  };

  const removeAnexo = (id) => {
    setPlanData(prev => ({
      ...prev,
      config: { ...prev.config, anexos: prev.config.anexos.filter(a => a.id !== id) }
    }));
  };

  const updateAnexo = (id, updates) => {
    setPlanData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        anexos: prev.config.anexos.map(a => a.id === id ? { ...a, ...updates } : a)
      }
    }));
  };

  const addComment = (pillar, moduleKey, fieldKey, text, author = 'Usuario') => {
    const key = `${pillar}.${moduleKey}.${fieldKey}`;
    const newComment = { id: Date.now().toString(), text, author, date: new Date().toISOString() };
    setPlanData(prev => {
      const currentComments = prev.config.comments || {};
      const fieldComments = currentComments[key] || [];
      return {
        ...prev,
        config: {
          ...prev.config,
          comments: {
            ...currentComments,
            [key]: [...fieldComments, newComment]
          }
        }
      };
    });
  };

  const deleteComment = (pillar, moduleKey, fieldKey, commentId) => {
    const key = `${pillar}.${moduleKey}.${fieldKey}`;
    setPlanData(prev => {
      const currentComments = prev.config.comments || {};
      const fieldComments = currentComments[key] || [];
      return {
        ...prev,
        config: {
          ...prev.config,
          comments: {
            ...currentComments,
            [key]: fieldComments.filter(c => c.id !== commentId)
          }
        }
      };
    });
  };

  const startIndustrialization = (customQueue) => {
    // Resume if paused
    if (statusRef.current === 'paused' && queueRef.current.length > 0) {
      setGenerationStatus('running');
      return;
    }

    if (customQueue && Array.isArray(customQueue)) {
      setGenerationQueue(customQueue);
      setGenerationProgress({ completed: 0, total: customQueue.length, currentModule: '' });
      setGenerationStatus('running');
      return;
    }

    const projectType = planDataRef.current?.config?.projectType || 'business';
    const framework = FRAMEWORKS[projectType] || FRAMEWORKS.business;
    const newQueue = [];

    framework.pillars.forEach(pillar => {
      pillar.modules.forEach(mod => {
        const moduleData = planDataRef.current[pillar.key]?.[mod.key] || {};
        const emptyFields = mod.fields.filter(f => !moduleData[f] || String(moduleData[f]).length < 10);
        
        if (emptyFields.length > 0) {
          newQueue.push({
            pillar: pillar.key,
            modKey: mod.key,
            title: mod.title,
            emptyFields
          });
        }
      });
    });

    if (newQueue.length === 0) {
      alert('¡Todo el proyecto ya está completamente generado!');
      return;
    }

    setGenerationQueue(newQueue);
    setGenerationProgress({ completed: 0, total: newQueue.length, currentModule: '' });
    setGenerationStatus('running');
  };

  const pauseIndustrialization = () => {
    setGenerationStatus('paused');
  };

  const stopIndustrialization = () => {
    setGenerationStatus('idle');
    setGenerationQueue([]);
    setGenerationProgress({ completed: 0, total: 0, currentModule: '' });
  };

  const getProjectCompletion = () => {
    const projectType = planData?.config?.projectType || 'business';
    const framework = FRAMEWORKS[projectType] || FRAMEWORKS.business;
    
    let totalFields = 0;
    let filledFields = 0;

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

    framework.pillars.forEach(pillar => {
      pillar.modules.forEach(mod => {
        const moduleData = planData[pillar.key]?.[mod.key];
        mod.fields.forEach(field => {
          totalFields++;
          let value = moduleData ? moduleData[field] : undefined;
          
          // Soporte y migración de claves obsoletas al calcular completado
          if (moduleData && (value === undefined || value === '')) {
            if (field === 'analisis_espacial') {
              value = moduleData['heatmap_data'];
            } else if (field === 'inventarios') {
              value = moduleData['inventario'];
            }
          }

          if (isFilled(value)) {
            filledFields++;
          }
        });
      });
    });

    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  };

  useEffect(() => {
    if (generationStatus !== 'running') return;
    let isSubscribed = true;

    const runLoop = async () => {
      const { generateModuleContent } = await import('../lib/ai');

      while (queueRef.current.length > 0 && statusRef.current === 'running' && isSubscribed) {
        const currentItem = queueRef.current[0];
        setGenerationProgress(prev => ({ ...prev, currentModule: currentItem.title }));

        try {
          let result;
          const { pillar, modKey } = currentItem;
          
          // Módulos que son matemáticos, no los procesamos por IA sino por nuestra calculadora.
          const isFinancialModule = ['inversion', 'costos', 'estados_financieros', 'rentabilidad', 'simulador'].includes(modKey);
          
          if (isFinancialModule) {
            const { generateAutomatedFinancials } = await import('../lib/finanzas/calculadoraFinanciera');
            // Genera la data calculada exacta de una pasada.
            const allFinancials = await generateAutomatedFinancials(planDataRef.current);
            result = allFinancials[modKey] || {};
            await new Promise(r => setTimeout(r, 1000)); // Delay para visual de progreso
          } else {
            result = await generateModuleContent(
              planDataRef.current.config.ai,
              {
                title: currentItem.modKey,
                description: `Generación automática de ${currentItem.modKey}`,
                fields: currentItem.emptyFields.map(f => ({ key: f }))
              },
              planDataRef.current
            );
          }

          if (result && statusRef.current === 'running' && isSubscribed) {
            setPlanData(prev => ({
              ...prev,
              [pillar]: {
                ...prev[pillar],
                [modKey]: { ...prev[pillar][modKey], ...result }
              }
            }));
            setGenerationQueue(prev => prev.slice(1));
            setGenerationProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
          } else {
            break;
          }
        } catch (e) {
          console.error(`Error in queue item ${currentItem.modKey}:`, e);
          alert(`Error al generar el módulo "${currentItem.title}": ${e.message}`);
          setGenerationStatus('paused');
          break;
        }
      }

      if (queueRef.current.length === 0 && statusRef.current === 'running' && isSubscribed) {
        setGenerationStatus('idle');
      }
    };

    runLoop();
    return () => {
      isSubscribed = false;
    };
  }, [generationStatus]);

  return (
    <PlanContext.Provider value={{ planData, updateSection, updateConfig, toggleLock, toggleModuleVisibility, updateStaff, updateProcesses, loadProject, loadSavedProject, createNewProject, updateProjectName, addAnexo, removeAnexo, updateAnexo, addComment, deleteComment, saveStatus, manualSaveProject, saveProjectAs, generationStatus, generationProgress, startIndustrialization, pauseIndustrialization, stopIndustrialization, getProjectCompletion, autoFillProject: startIndustrialization, updateSemilla }}>
      {children}
    </PlanContext.Provider>
  );
};
