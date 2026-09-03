import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { usePlan } from '../context/PlanContext';
import { FRAMEWORKS } from '../config/frameworks';
import { FRAMEWORK_SLUG_MAP, resolvePillarFromModule } from '../config/urlRouting';
import ModuleWrapper from './ModuleWrapper';
import ModuloFinanciero from './ModuloFinanciero';
import StaffTable from './StaffTable';
import InegiMap from './InegiMap';
import ModuloOperaciones from './ModuloOperaciones';
import ProcessTable from './ProcessTable';
import OrganizationFinanceToolkit from './OrganizationFinanceToolkit';
import TamSamSom from './TamSamSom';
import BusinessModelCanvas from './BusinessModelCanvas';
import HubspotBuyerPersona from './HubspotBuyerPersona';
import MacroDashboard from './MacroDashboard';
import OrganigramaInteractivo from './OrganigramaInteractivo';
import ArbolProblemasObjetivos from './ArbolProblemasObjetivos';
import XMatrixHoshinKanri from './XMatrixHoshinKanri';
import AmoebaStructureViewer from './AmoebaStructureViewer';
import MicroCroquisEditor from './MicroCroquisEditor';

const BusinessModelSelector = ({ value, onChange }) => {
  const models = [
    { key: 'B2C', label: 'B2C (Empresa a Consumidor)', desc: 'Venta de productos o servicios directamente a clientes finales.', icon: '🛍️' },
    { key: 'B2B', label: 'B2B (Empresa a Empresa)', desc: 'Venta de productos o servicios a otras empresas u organizaciones.', icon: '🏢' },
    { key: 'Suscripcion', label: 'Suscripción / Membresía', desc: 'Cobro recurrente a cambio de acceso continuo al servicio o producto.', icon: '🔄' },
    { key: 'Marketplace', label: 'Marketplace / Plataforma', desc: 'Conectar oferta y demanda, cobrando comisión por transacción.', icon: '🌐' },
    { key: 'Distribuidor', label: 'Ferretería / Distribución', desc: 'Compra de stock a mayoristas y reventa con margen comercial al detalle.', icon: '📦' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(99, 102, 241, 0.02)' }}>
      <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Selección del Tipo de Modelo de Negocio (HubSpot Sales Guide)
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        {models.map(m => {
          const isSelected = value?.startsWith(m.label) || value?.includes(m.desc);
          return (
            <div
              key={m.key}
              onClick={() => onChange(`${m.label}: ${m.desc}\n\n[Especifica aquí cómo aplica este modelo a tu negocio...]`)}
              style={{
                padding: '1rem',
                border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                borderRadius: '10px',
                background: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>{m.icon}</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.82rem', color: isSelected ? 'var(--accent-color)' : 'inherit' }}>{m.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{m.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function DynamicModule() {
  const { pillarId: paramPillarId, moduleId: paramModuleId, tipoDoc, slug } = useParams();
  const { planData, updateStaff, updateProcesses, updateSection, loadProjectBySlug } = usePlan();

  useEffect(() => {
    if (slug && loadProjectBySlug) {
      loadProjectBySlug(slug);
    }
  }, [slug, loadProjectBySlug]);

  const effectiveFrameworkKey = FRAMEWORK_SLUG_MAP[tipoDoc] || planData?.config?.projectType || 'business';
  const moduleId = paramModuleId;
  let pillarId = paramPillarId;

  if (!pillarId && moduleId) {
    pillarId = resolvePillarFromModule(effectiveFrameworkKey, moduleId);
  }

  if (!pillarId && moduleId) {
    for (const fw of Object.values(FRAMEWORKS)) {
      const found = fw.pillars?.find(p => p.modules?.some(m => m.key === moduleId));
      if (found) {
        pillarId = found.key;
        break;
      }
    }
  }

  const activeFramework = FRAMEWORKS[effectiveFrameworkKey] || FRAMEWORKS.business;
  let pillar = activeFramework?.pillars?.find(p => p.key === pillarId);

  if (!pillar) {
    for (const fwKey of Object.keys(FRAMEWORKS)) {
      const foundPillar = FRAMEWORKS[fwKey]?.pillars?.find(p => p.key === pillarId);
      if (foundPillar) {
        pillar = foundPillar;
        break;
      }
    }
  }

  if (!pillar) return <Navigate to="/semilla" replace />;

  const moduleDef = pillar.modules?.find(m => m.key === moduleId);
  if (!moduleDef) return <Navigate to="/semilla" replace />;

  useEffect(() => {
    if (pillarId === 'organizacion' && moduleId === 'estructura' && planData?.organizacion?.staff) {
      const staff = planData.organizacion.staff || [];
      let mermaidText = "graph TD\n";
      staff.forEach(emp => {
        if (emp.reportsTo) {
          const boss = staff.find(s => s.id === emp.reportsTo);
          if (boss) mermaidText += `  ${boss.id}["${boss.role}"] --> ${emp.id}["${emp.role}"]\n`;
        } else {
          mermaidText += `  ${emp.id}["${emp.role}"]\n`;
        }
      });
      updateSection('organizacion', 'estructura', 'organigrama_visual', mermaidText);
    }
  }, [planData?.organizacion?.staff, pillarId, moduleId]);

  useEffect(() => {
    if (pillarId === 'tecnico' && moduleId === 'operacion' && planData?.tecnico?.processes) {
      const processes = planData.tecnico.processes || [];
      if (processes.length > 0) {
        let mermaidText = "graph TD\n";
        processes.forEach((p, index) => {
          const next = processes[index + 1];
          if (next) {
            mermaidText += `  P${p.step}["${p.task}"] --> P${next.step}["${next.task}"]\n`;
          } else {
            mermaidText += `  P${p.step}["${p.task}"]\n`;
          }
        });
        updateSection('tecnico', 'operacion', 'diagrama', mermaidText);
      }
    }
  }, [planData?.tecnico?.processes, pillarId, moduleId]);

  let fieldsFormatted = (moduleDef.fields || []).map(f => {
    if (typeof f === 'string') {
      return {
        key: f,
        label: f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: f.includes('visual') || f === 'diagrama' ? 'mermaid' : (f === 'heatmap_data' ? 'heatmap' : 'text')
      };
    }
    return f;
  });

  if (pillarId === 'organizacion' && moduleId === 'costos') {
    const payroll = planData?.organizacion?.staff?.reduce((acc, curr) => acc + (curr.salary || 0), 0) || 0;
    fieldsFormatted = fieldsFormatted.map(f => 
      f.key === 'fijos' ? { ...f, label: `Costos Fijos Mensuales (Nómina: $${payroll.toLocaleString()})` } : f
    );
  }

  let locationHint =
    planData?.semilla?.cobertura ||
    planData?.semilla?.ubicacion ||
    planData?.semilla?.cliente_ubicacion ||
    planData?.semilla?.negocio?.ubicacion ||
    planData?.tecnico?.ubicacion?.micro ||
    planData?.tecnico?.ubicacion?.macro ||
    'Hermosillo, Sonora';

  if (locationHint.trim().toLowerCase() === 'sonora') {
    locationHint = 'Hermosillo, Sonora';
  }

  const projectContext = planData?.semilla?.negocio?.giro || planData?.semilla?.negocio?.nombre || 'servicios profesionales';
  
  let defaultScian = '0';
  const contextLower = projectContext.toLowerCase();
  if (contextLower.includes('miner') || contextLower.includes('hidráulic') || contextLower.includes('cuántico')) {
    defaultScian = '213';
  } else if (contextLower.includes('alimento') || contextLower.includes('restaurante')) {
    defaultScian = '722';
  }

  const isMapModule = (
    (pillarId === 'mercado' && moduleId === 'competencia') ||
    (pillarId === 'mercado' && moduleId === 'mapa') ||
    (pillarId === 'tecnico' && moduleId === 'ubicacion') ||
    (pillarId === 'organizacion' && moduleId === 'estructura')
  );

  const isPESTELModule = pillarId === 'naturaleza' && moduleId === 'pestel';

  const extraAction = isMapModule ? (
    <InegiMap
      token={planData?.config?.externalApis?.inegiToken}
      location={locationHint}
      mode={pillarId === 'tecnico' && moduleId === 'ubicacion' ? 'location' : 'competition'}
      title={
        pillarId === 'tecnico'
          ? 'Mapa de Localización Estratégica'
          : (moduleId === 'mapa' ? 'Mapa de Calor (Densidad y Mercado)' : 'Mapa de Competencia (Giro/SCIAN · DENUE)')
      }
      initialKeywords={projectContext}
      defaultHeatmap={moduleId === 'mapa'}
      defaultScian={defaultScian}
    />
  ) : isPESTELModule ? (
    <MacroDashboard token={planData?.config?.externalApis?.banxicoToken} />
  ) : null;

  const isFinancialModule = pillarId === 'finanzas' || moduleId === 'estados_financieros' || moduleId === 'rentabilidad';

  if (pillarId === 'simulador_financiero' && moduleId === 'simulador') {
    const rawBase = import.meta.env.BASE_URL || '/';
    const basePath = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
    const iframeSrc = `${basePath}simulador/index.html`;
    const projectTitle = planData?.semilla?.negocio?.nombre || 'Comercio Cuántico Internacional';
    const projectGiro = planData?.semilla?.negocio?.giro || 'MaaS IoT / Inversión Minera';

    return (
      <div className="module-view" style={{ padding: 0, height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#f8fafc' }}>
          <iframe 
            src={iframeSrc} 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            title="Simulador Financiero"
            onLoad={(e) => {
              try {
                e.target.contentWindow?.postMessage({
                  type: 'OBP_SET_PROJECT',
                  title: projectTitle,
                  badge: projectGiro
                }, '*');
              } catch (err) {
                console.warn('Could not postMessage to simulator iframe', err);
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (isFinancialModule && effectiveFrameworkKey === 'business') {
    return (
      <ModuloFinanciero 
        moduleKey={moduleId}
        pillarId={pillarId}
        title={moduleDef.title}
        description={moduleDef.description}
      />
    );
  }

  if (pillarId === 'tecnico' && moduleId === 'operativa') {
    return (
      <ModuloOperaciones 
        moduleKey={moduleId}
        pillarId={pillarId}
        title={moduleDef.title}
        description={moduleDef.description}
      />
    );
  }

  if (pillarId === 'naturaleza' && moduleId === 'canvas') {
    return (
      <div className="module-view">
        <div className="view-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className="view-title">{moduleDef.title}</h1>
            <p className="text-secondary mt-1">{moduleDef.description}</p>
          </div>
        </div>
        <BusinessModelCanvas />
      </div>
    );
  }

  const isZopp = effectiveFrameworkKey === 'zopp' || activeFramework?.id === 'zopp';
  const isArbolLogico = isZopp && (moduleId === 'problemas' || moduleId === 'objetivos' || moduleId === 'arbol_logico' || moduleId === 'arbol_problemas');
  const isHoshinKanri = effectiveFrameworkKey === 'hoshin_kanri' || activeFramework?.id === 'hoshin_kanri' || moduleId === 'matriz_x' || moduleId === 'alineacion_estrategica';
  const isAmoeba = effectiveFrameworkKey === 'amoeba_management' || activeFramework?.id === 'amoeba_management' || (moduleId === 'celulas_autonomas' || moduleId === 'rentabilidad' || moduleId === 'estructura');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {pillarId === 'naturaleza' && moduleId === 'introduccion' && (
        <BusinessModelSelector 
          value={planData?.naturaleza?.introduccion?.modelo_negocio} 
          onChange={(val) => updateSection('naturaleza', 'introduccion', 'modelo_negocio', val)}
        />
      )}

      {isArbolLogico && (
        <ArbolProblemasObjetivos />
      )}

      {isHoshinKanri && moduleId === 'matriz_x' && (
        <XMatrixHoshinKanri />
      )}

      {isAmoeba && (
        <AmoebaStructureViewer />
      )}

      <ModuleWrapper 
        pillar={pillarId}
        moduleKey={moduleId}
        title={moduleDef.title}
        description={moduleDef.description}
        fields={fieldsFormatted}
        extraAction={extraAction}
      />

      {(moduleId === 'layout' || moduleId === 'instalaciones') && (
        <MicroCroquisEditor 
          data={planData?.[pillarId]?.[moduleId] || planData?.tecnico?.croquis || planData?.ingenieria?.layout} 
          onUpdateField={(field, val) => updateSection(pillarId, moduleId, { [field]: val })}
          companyName={planData?.config?.brandKit?.companyName || planData?.semilla?.nombre_proyecto || planData?.semilla?.negocio?.nombre || 'Mi Empresa'}
        />
      )}

      {pillarId === 'organizacion' && moduleId === 'estructura' && (
        <>
          <OrganigramaInteractivo staff={planData?.organizacion?.staff || []} onChange={updateStaff} />
          <StaffTable staff={planData?.organizacion?.staff || []} onChange={updateStaff} />
        </>
      )}

      {pillarId === 'tecnico' && moduleId === 'operacion' && (
        <ProcessTable 
          processes={planData?.tecnico?.processes || []} 
          onChange={updateProcesses} 
        />
      )}

      {pillarId === 'organizacion' && ['inversion', 'costos', 'recursos_humanos'].includes(moduleId) && (
        <OrganizationFinanceToolkit moduleKey={moduleId} />
      )}

      {pillarId === 'mercado' && moduleId === 'segmentacion' && (
        <>
          <TamSamSom data={planData?.mercado?.segmentacion} />
          <HubspotBuyerPersona value={planData?.mercado?.segmentacion?.perfil} />
        </>
      )}
    </div>
  );
}
