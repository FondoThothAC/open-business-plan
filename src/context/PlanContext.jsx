import React, { createContext, useState, useContext, useEffect } from 'react';
import { PROJECT_EXAMPLES } from '../lib/projects_db';
import { FRAMEWORKS } from '../config/frameworks';

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

const KEYS = {
  gemini: 'AIzaSyBaAYi5LzRxxy6NnmAFPqRRXD4bhYNIn4U',
  groq: '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',
  denue: '1b9e230f-2ae0-48db-bd20-8810b1db575e',
  banxico: 'da45f26edb9a72e9d18e0217de25f9d8e5c79e9a5e4c1e8b7a6d5c4b3a2'
};

const createEmptyPlan = (projectType = 'business') => {
  const framework = FRAMEWORKS[projectType];
  const plan = {
    config: {
      projectType,
      locks: {}, theme: 'light',
      visibility: {},
      ai: {
        primaryProvider: 'gemini', secondaryProvider: 'groq',
        apiKey: KEYS.gemini, groqKey: KEYS.groq,
        endpoint: 'http://localhost:11434',
        model: 'gemma4:e4b',   // modelo base (nivel rápido)
        depth: 1,              // 1=Rápido, 2=Pro, 3=Profundo
        contextSize: 65536,    // 64k por defecto (seguro para 8GB VRAM)
        // [DDD] Modelos por rol — sobreescriben DEFAULT_AGENT_CONFIG en ai.js
        agentModels: {
          analista:     { model: 'gemma4:e4b', role: 'Analista Estratégico' },
          critico:      { model: 'gemma4:e4b', role: 'Crítico Financiero' },
          redactor:     { model: 'gemma4:e4b', role: 'Redactor Ejecutivo' },
          estratega:    { model: 'gemma4:e4b', role: 'Estratega de Negocio' },
          abogadoDiablo:{ model: 'gemma4:e4b', role: "Devil's Advocate" },
        }
      },
      brandKit: { primaryColor: '#6366f1', secondaryColor: '#8b5cf6', logoUrl: '', companyName: '' },
      externalApis: { inegiToken: KEYS.denue, banxicoToken: KEYS.banxico },
      anexos: [],
      documents: []
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
}

export const PlanProvider = ({ children }) => {
  const getInitialData = () => {
    const saved = localStorage.getItem('openplan_v2_data');
    if (!saved) {
      const base = createEmptyPlan('business');
      base.config.brandKit.companyName = 'Brújula Financiera MX';
      return deepMerge(base, PROJECT_EXAMPLES.brujula.data);
    }
    try {
      const parsed = JSON.parse(saved);
      const base = createEmptyPlan(parsed.config?.projectType || 'business');
      return deepMerge(base, parsed);
    } catch (e) {
      return createEmptyPlan('business');
    }
  };

  const [planData, setPlanData] = useState(getInitialData);

  useEffect(() => {
    localStorage.setItem('openplan_v2_data', JSON.stringify(planData));
    document.documentElement.setAttribute('data-theme', planData.config?.theme || 'dark');
    if (planData.config?.brandKit) {
      document.documentElement.style.setProperty('--accent-color', planData.config.brandKit.primaryColor);
      document.documentElement.style.setProperty('--accent-hover', planData.config.brandKit.secondaryColor);
    }

    // Auto-save to Local Backend (Markdown & JSON)
    const saveTimer = setTimeout(async () => {
      try {
        await fetch('http://localhost:3001/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(planData)
        });
      } catch (err) {
        // Backend might not be running yet, silent catch
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(saveTimer);
  }, [planData]);

  const loadProject = (id) => {
    const example = PROJECT_EXAMPLES[id];
    if (!example) return;
    const fresh = createEmptyPlan('business');
    fresh.config.brandKit.companyName = example.name;
    fresh.config.ai = planData.config.ai;
    fresh.config.theme = planData.config.theme;
    fresh.config.externalApis = planData.config.externalApis;
    const merged = deepMerge(fresh, example.data);
    setPlanData(merged);
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

  const createNewProject = (projectType = 'business') => {
    if (window.confirm(`¿Estás seguro de crear un nuevo proyecto (${projectType === 'business' ? 'Comercial' : 'Social BID'})? Se perderán los cambios no guardados del actual.`)) {
      localStorage.removeItem('openplan_v2_data');
      window.location.href = '/semilla';
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

  const autoFillProject = async (generateModuleContent) => {
    const pillars = ['naturaleza', 'mercado', 'tecnico', 'organizacion', 'finanzas'];
    const tasks = [];

    for (const pillar of pillars) {
      const modules = Object.keys(planData[pillar] || {});
      for (const modKey of modules) {
        const moduleData = planData[pillar][modKey];
        const emptyFields = Object.keys(moduleData).filter(f => !moduleData[f] || moduleData[f].length < 10);
        
        if (emptyFields.length > 0) {
          tasks.push((async () => {
            try {
              const result = await generateModuleContent(planData.config.ai, { 
                title: modKey, 
                description: `Generación automática de ${modKey}`,
                fields: emptyFields.map(f => ({ key: f })) 
              }, planData);
              
              if (result) {
                setPlanData(prev => ({
                  ...prev,
                  [pillar]: { ...prev[pillar], [modKey]: { ...prev[pillar][modKey], ...result } }
                }));
              }
            } catch (e) {
              console.error(`Error filling ${modKey}:`, e);
            }
          })());
        }
      }
    }
    await Promise.all(tasks);
  };

  return (
    <PlanContext.Provider value={{ planData, updateSection, updateConfig, toggleLock, toggleModuleVisibility, updateStaff, updateProcesses, loadProject, createNewProject, updateProjectName, addAnexo, removeAnexo, updateAnexo, autoFillProject }}>
      {children}
    </PlanContext.Provider>
  );
};
