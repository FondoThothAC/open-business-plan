import React, { useEffect } from 'react';
import { usePlan } from '../context/PlanContext';
import { Printer, Download, FileText, Table } from 'lucide-react';
import FinancialCharts from '../components/FinancialCharts';
import MermaidViewer from '../components/MermaidViewer';

export default function VistaPrevia() {
  const { planData } = usePlan();

  useEffect(() => {
    const timer = setTimeout(() => {
      const mermaid = window.mermaid;
      if (mermaid) {
        mermaid.initialize({ 
          startOnLoad: false, 
          theme: 'neutral',
          securityLevel: 'loose',
        });
        mermaid.run();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [planData]);

  // Verifica si un módulo tiene contenido real
  const hasContent = (data) => {
    if (!data) return false;
    return Object.values(data).some(v => v && typeof v === 'string' && v.trim().length > 0);
  };

  // Verifica si un módulo es visible según el toggle
  const isVisible = (pillar, module) => {
    return planData.config?.visibility?.[`${pillar}.${module}`] !== false;
  };

  // Mostrar siempre en vista previa si existe el módulo, pero marcar si está vacío
  const shouldShow = (pillar, module) => {
    return true; // Mostrar todo para evitar "nolo veo"
  };

  // Componente de Sección con numeración recibida dinámicamente
  const Section = ({ number, title, data }) => {
    if (!data) return null;
    
    // Filtrar solo campos con contenido
    const filledFields = Object.entries(data).filter(([key, value]) => {
      if (key === 'heatmap_data') return false;
      return value && typeof value === 'string' && value.trim() !== '';
    });

    return (
      <div className={`preview-section ${filledFields.length === 0 ? 'empty-section' : ''}`} style={{ 
        marginBottom: '2.5rem',
        opacity: filledFields.length === 0 ? 0.4 : 1,
        border: filledFields.length === 0 ? '1px dashed #e2e8f0' : 'none',
        padding: filledFields.length === 0 ? '1rem' : '0'
      }}>
        <h3 style={{ color: '#1e293b', fontSize: '1.25rem', borderLeft: '4px solid var(--accent-color)', paddingLeft: '1rem', marginBottom: '1rem' }}>
          {number} {title} {filledFields.length === 0 && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>(Sin contenido)</span>}
        </h3>
        {filledFields.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', paddingLeft: '1.25rem' }}>
            Este módulo aún no ha sido redactado por la IA o manualmente.
          </p>
        ) : (
          <div style={{ paddingLeft: '1.25rem' }}>
            {filledFields.map(([key, value]) => {
            if (key.includes('visual') || key === 'diagrama') {
              return (
                <div key={key} style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
                  <MermaidViewer chart={value} />
                </div>
              );
            }
            
            return (
              <div key={key} style={{ marginBottom: '1rem' }}>
                <strong style={{ display: 'block', color: '#64748b', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {key.replace(/_/g, ' ')}
                </strong>
                <div style={{ whiteSpace: 'pre-wrap', marginTop: '0.25rem', color: '#334155', lineHeight: '1.6' }}>
                  {value}
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    );
  };

  const PayrollTable = () => {
    const staff = planData.organizacion?.staff || [];
    if (staff.length === 0) return null;
    return (
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ fontSize: '1rem', color: '#475569', marginBottom: '1rem', textTransform: 'uppercase' }}>Resumen de Plantilla y Nómina</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Puesto</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Salario Mensual</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(emp => (
              <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem' }}>{emp.role}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>${(emp.salary || 0).toLocaleString()}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: '700', background: '#f8fafc' }}>
              <td style={{ padding: '0.75rem' }}>TOTAL MENSUAL</td>
              <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                ${staff.reduce((acc, curr) => acc + (curr.salary || 0), 0).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // --- Definir los 4 pilares con sus módulos ---
  const pillars = [
    {
      key: 'naturaleza',
      title: 'Naturaleza del Proyecto',
      modules: [
        { key: 'introduccion', title: 'Justificación y Origen' },
        { key: 'identidad', title: 'Identidad Corporativa' },
        { key: 'objetivos', title: 'Objetivos y Metas' },
        { key: 'foda', title: 'Análisis FODA' },
        { key: 'pestel', title: 'Entorno (PESTEL)' },
        { key: 'legal', title: 'Marco Legal y Socios' },
      ]
    },
    {
      key: 'mercado',
      title: 'El Mercado',
      modules: [
        { key: 'analisis', title: 'Análisis de Producto y Valor' },
        { key: 'segmentacion', title: 'Segmentación y Tamaño' },
        { key: 'competencia', title: 'Análisis de Competencia' },
        { key: 'benchmarking', title: 'Benchmarking' },
        { key: 'comercializacion', title: 'Estrategia de Comercialización' },
        { key: 'ventas', title: 'Plan de Ventas y Precios' },
      ]
    },
    {
      key: 'tecnico',
      title: 'Estudio Técnico de Producción',
      modules: [
        { key: 'ubicacion', title: 'Localización y Ubicación' },
        { key: 'operacion', title: 'Operación y Procesos' },
        { key: 'recursos', title: 'Maquinaria y Tecnología' },
        { key: 'insumos', title: 'Insumos y Proveedores' },
        { key: 'capacidad', title: 'Capacidad e Inventarios' },
        { key: 'ambiental', title: 'Impacto Ambiental' },
      ]
    },
    {
      key: 'organizacion',
      title: 'Organización y Finanzas',
      modules: [
        { key: 'estructura', title: 'Estructura Organizativa' },
        { key: 'recursos_humanos', title: 'Gestión de Recursos Humanos' },
        { key: 'inversion', title: 'Inversión Inicial (CAPEX)' },
        { key: 'costos', title: 'Costos y Gastos (OPEX)' },
        { key: 'estados_financieros', title: 'Estados Financieros' },
        { key: 'rentabilidad', title: 'Rentabilidad y Análisis Financiero' },
      ]
    }
  ];

  // Contador global de pilares visibles
  let pillarCounter = 0;

  return (
    <div className="module-view">
      <div className="view-header no-print">
        <div>
          <h1 className="view-title">Vista Previa Maestro</h1>
          <p className="text-secondary mt-1">Solo se muestran secciones con contenido y marcadas como visibles.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      <div className="preview-document glass-panel" style={{ 
        padding: '4rem', 
        background: 'white', 
        color: '#1e293b', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
        maxWidth: '900px',
        margin: '0 auto',
        borderRadius: '0'
      }}>
        
        {/* Portada */}
        <div className="print-page" style={{ textAlign: 'center', minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem' }}>
          {planData.config?.brandKit?.logoUrl && (
            <img src={planData.config.brandKit.logoUrl} alt="Logo" style={{ maxHeight: '120px', marginBottom: '2rem', margin: '0 auto' }} />
          )}
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', color: '#0f172a' }}>
            {planData.config?.brandKit?.companyName || 'Plan de Negocios'}
          </h1>
          <div style={{ width: '80px', height: '4px', background: 'var(--accent-color)', margin: '2rem auto' }}></div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '400', color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Plan Estratégico Maestro
          </h2>
          <p style={{ marginTop: '3rem', fontSize: '1.125rem', color: '#94a3b8' }}>
            Formulación y Evaluación Académica 2026
          </p>
          
          <div style={{ marginTop: 'auto', paddingTop: '4rem' }}>
            <div style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: '700' }}>Elaborado por: Roberto Eduardo Celis Robles</div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>{new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        {/* Renderizar cada pilar con numeración dinámica */}
        {pillars.map(pillar => {
          // Filtrar solo módulos que tienen contenido Y son visibles
          const visibleModules = pillar.modules.filter(m => shouldShow(pillar.key, m.key));
          
          // Si el pilar no tiene ningún módulo visible, no lo mostramos
          if (visibleModules.length === 0) return null;

          pillarCounter++;
          let moduleCounter = 0;

          return (
            <React.Fragment key={pillar.key}>
              <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
              <div className="print-page" style={{ marginTop: '4rem' }}>
                <h2 style={{ fontSize: '2rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '3rem' }}>
                  {pillarCounter}. {pillar.title}
                </h2>
                
                {visibleModules.map(mod => {
                  moduleCounter++;
                  const sectionNumber = `${pillarCounter}.${moduleCounter}`;
                  
                  return (
                    <React.Fragment key={mod.key}>
                      <Section 
                        number={sectionNumber}
                        title={mod.title} 
                        data={planData[pillar.key]?.[mod.key]} 
                      />
                      {/* Insertar tabla de nómina después de estructura organizativa */}
                      {pillar.key === 'organizacion' && mod.key === 'estructura' && <PayrollTable />}
                    </React.Fragment>
                  );
                })}

                {/* Gráficas financieras al final de Organización */}
                {pillar.key === 'organizacion' && (
                  <div className="section-content">
                    <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '1.5rem', marginTop: '2rem' }}>
                      {pillarCounter}.{moduleCounter + 1} Análisis Financiero Visual
                    </h3>
                    <FinancialCharts staff={planData.organizacion?.staff} />
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}

        {/* Anexos */}
        {planData.config?.anexos?.length > 0 && (
          <>
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <div className="print-page" style={{ marginTop: '4rem' }}>
              <h2 style={{ fontSize: '2rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '3rem' }}>
                {pillarCounter + 1}. Anexos y Evidencia
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {planData.config.anexos.map((anexo) => (
                  <div key={anexo.id} style={{ marginBottom: '2rem' }}>
                    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '0.5rem' }}>
                      <img src={anexo.url} alt={anexo.name} style={{ width: '100%', display: 'block' }} />
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#1e293b', textAlign: 'center', fontWeight: '500' }}>
                      {anexo.caption || anexo.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <footer style={{ marginTop: '5rem', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>
          <p>Documento generado por OpenPlan V2 - Sistema de Inteligencia Empresarial</p>
          <p>© 2026 {planData.config?.brandKit?.companyName}</p>
        </footer>
      </div>
    </div>
  );
}
