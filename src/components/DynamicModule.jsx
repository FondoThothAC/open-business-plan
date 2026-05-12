import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { usePlan } from '../context/PlanContext';
import { FRAMEWORKS } from '../config/frameworks';
import ModuleWrapper from './ModuleWrapper';
import ModuloFinanciero from './ModuloFinanciero';
import StaffTable from './StaffTable';
import InegiMap from './InegiMap';
import ModuloOperaciones from './ModuloOperaciones';
import ProcessTable from './ProcessTable';

export default function DynamicModule() {
  const { pillarId, moduleId } = useParams();
  const { planData, updateStaff, updateProcesses, updateSection } = usePlan();
  
  const projectType = planData.config?.projectType || 'business';
  const framework = FRAMEWORKS[projectType];

  if (!framework) return <Navigate to="/" replace />;

  const pillar = framework.pillars.find(p => p.key === pillarId);
  if (!pillar) return <Navigate to="/semilla" replace />;

  const moduleDef = pillar.modules.find(m => m.key === moduleId);
  if (!moduleDef) return <Navigate to="/semilla" replace />;

  // Special Case: OrgEstructura (Organigrama + Staff Table)
  useEffect(() => {
    if (pillarId === 'organizacion' && moduleId === 'estructura' && planData.organizacion?.staff) {
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
  }, [planData.organizacion?.staff, pillarId, moduleId]);

  // Special Case: TecnicoOperacion (Auto-generate Mermaid from Process Table)
  useEffect(() => {
    if (pillarId === 'tecnico' && moduleId === 'operacion' && planData.tecnico?.processes) {
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
  }, [planData.tecnico?.processes, pillarId, moduleId]);

  // Transform fields
  let fieldsFormatted = moduleDef.fields.map(f => {
    if (typeof f === 'string') {
      return {
        key: f,
        label: f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: f.includes('visual') || f === 'diagrama' ? 'mermaid' : (f === 'heatmap_data' ? 'heatmap' : 'text')
      };
    }
    return f;
  });

  // Special Case: OrgCostos (Dynamic Payroll label)
  if (pillarId === 'organizacion' && moduleId === 'costos') {
    const payroll = planData.organizacion?.staff?.reduce((acc, curr) => acc + (curr.salary || 0), 0) || 0;
    fieldsFormatted = fieldsFormatted.map(f => 
      f.key === 'fijos' ? { ...f, label: `Costos Fijos Mensuales (Nómina: $${payroll.toLocaleString()})` } : f
    );
  }

  // Special Case: MercCompetencia (Extra Action: InegiMap)
  const extraAction = (pillarId === 'mercado' && moduleId === 'competencia') 
    ? <InegiMap token={planData.config?.externalApis?.inegiToken} /> 
    : null;

  const isFinancialModule = pillarId === 'finanzas' || moduleId === 'estados_financieros' || moduleId === 'rentabilidad';

  if (isFinancialModule) {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <ModuleWrapper 
        pillar={pillarId}
        moduleKey={moduleId}
        title={moduleDef.title}
        description={moduleDef.description}
        fields={fieldsFormatted}
        extraAction={extraAction}
      />
      {pillarId === 'organizacion' && moduleId === 'estructura' && (
        <StaffTable staff={planData.organizacion?.staff || []} onChange={updateStaff} />
      )}
      {pillarId === 'tecnico' && moduleId === 'operacion' && (
        <ProcessTable 
          processes={planData.tecnico?.processes || []} 
          onChange={updateProcesses} 
        />
      )}
    </div>
  );
}
