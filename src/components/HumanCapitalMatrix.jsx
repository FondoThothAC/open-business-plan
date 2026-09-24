import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, Briefcase, Network, Code2 } from 'lucide-react';
import MermaidViewer from './MermaidViewer';

// Estructura esbelta por defecto para Microempresas y Emprendimientos Locales
const DEFAULT_MICRO_PUESTOS = [
  { 
    id: "1", 
    puesto: "Director General / Emprendedor Operador", 
    area: "Dirección", 
    nivel: "Directivo", 
    sueldoBase: 14000, 
    cargaSocialPct: 32, 
    funciones: "Gestión estratégica, compras de insumos, control financiero y comercialización en puntos de venta.", 
    perfil: "Emprendedor con liderazgo comercial y gestión operativa básica." 
  },
  { 
    id: "2", 
    puesto: "Encargado de Producción y Horneado", 
    area: "Operaciones", 
    nivel: "Operativo", 
    sueldoBase: 9500, 
    cargaSocialPct: 32, 
    funciones: "Preparación de masa, formulación de recetas, horneado, control de mermas y empaque primario.", 
    perfil: "Técnico o auxiliar con experiencia en panadería/repostería artesanal y normas sanitarias." 
  },
  { 
    id: "3", 
    puesto: "Auxiliar de Ventas, Mostrador y Reparto", 
    area: "Ventas", 
    nivel: "Operativo", 
    sueldoBase: 8000, 
    cargaSocialPct: 32, 
    funciones: "Atención a clientes, despacho de pedidos, entregas locales y cobranza en mostrador.", 
    perfil: "Auxiliar de ventas y atención al cliente con orientación a servicio." 
  }
];

// Estructura industrial por defecto para Empresas Grandes / Medianas
const DEFAULT_INDUSTRIAL_PUESTOS = [
  { id: "1", puesto: "Director General (CEO / Socio Operativo)", area: "Dirección", nivel: "Directivo", sueldoBase: 75000, cargaSocialPct: 32, funciones: "Estrategia macro, relaciones institucionales, alianzas B2B y gobernanza corporativa.", perfil: "Ing. Industrial / MBA con experiencia directiva." },
  { id: "2", puesto: "Gerente de Operaciones y Calidad", area: "Operaciones", nivel: "Gerencia", sueldoBase: 50000, cargaSocialPct: 32, funciones: "Gestión técnica de la planta/taller, SLAs y control de calidad.", perfil: "Ing. Mecánico/Industrial con 8+ años en gestión de operaciones." },
  { id: "3", puesto: "Gerente Comercial y Desarrollo B2B", area: "Ventas", nivel: "Gerencia", sueldoBase: 45000, cargaSocialPct: 32, funciones: "Prospección de contratos corporativos y convenios.", perfil: "Lic. Comercial / Ingeniero con cartera en el sector." },
  { id: "4", puesto: "Gerente de Administración y Finanzas (CFO)", area: "Finanzas", nivel: "Gerencia", sueldoBase: 45000, cargaSocialPct: 32, funciones: "Tesorería, control presupuestal y cumplimiento fiscal.", perfil: "C.P. / Maestría en Finanzas." },
  { id: "5", puesto: "Supervisor de Operaciones y Mantenimiento", area: "Operaciones", nivel: "Mando Medio", sueldoBase: 30000, cargaSocialPct: 32, funciones: "Supervisión diaria de línea productiva y mantenimiento preventivo.", perfil: "Ing. Técnico con especialidad en planta." },
  { id: "6", puesto: "Técnico Especialista de Producción", area: "Operaciones", nivel: "Técnico", sueldoBase: 22000, cargaSocialPct: 32, funciones: "Operación de maquinaria de precisión y pruebas de calidad.", perfil: "Técnico especialista certificado." },
  { id: "7", puesto: "Auxiliar Administrativo y Logística", area: "Finanzas", nivel: "Operativo", sueldoBase: 16000, cargaSocialPct: 32, funciones: "Facturación, inventarios y atención a proveedores.", perfil: "Técnico en administración." }
];

function generateMermaidFromPuestos(list) {
  if (!Array.isArray(list) || list.length === 0) return 'graph TD\n  Inicio["Sin puestos definidos"]';
  let mermaid = 'graph TD\n';
  const directivos = list.filter(p => p.nivel === 'Directivo' || p.area === 'Dirección');
  const gerencias = list.filter(p => p.nivel === 'Gerencia');
  const mandos = list.filter(p => p.nivel === 'Mando Medio');
  const operativos = list.filter(p => !['Directivo', 'Gerencia', 'Mando Medio'].includes(p.nivel) && p.area !== 'Dirección');

  const rootId = directivos[0]?.id || list[0]?.id || '1';

  list.forEach(p => {
    const sueldo = (Number(p.sueldoBase) || 0).toLocaleString('es-MX');
    mermaid += `  N_${p.id}["<b>${p.puesto}</b><br/><small>${p.area} • $${sueldo} MXN</small>"]\n`;
  });

  if (gerencias.length > 0) {
    gerencias.forEach(g => {
      mermaid += `  N_${rootId} --> N_${g.id}\n`;
    });
    if (mandos.length > 0) {
      mandos.forEach((m, idx) => {
        const parentGer = gerencias[idx % gerencias.length];
        mermaid += `  N_${parentGer.id} --> N_${m.id}\n`;
      });
      operativos.forEach((o, idx) => {
        const parent = mandos[idx % mandos.length];
        mermaid += `  N_${parent.id} --> N_${o.id}\n`;
      });
    } else {
      operativos.forEach((o, idx) => {
        const parent = gerencias[idx % gerencias.length];
        mermaid += `  N_${parent.id} --> N_${o.id}\n`;
      });
    }
  } else if (mandos.length > 0) {
    mandos.forEach(m => {
      mermaid += `  N_${rootId} --> N_${m.id}\n`;
    });
    operativos.forEach((o, idx) => {
      const parent = mandos[idx % mandos.length];
      mermaid += `  N_${parent.id} --> N_${o.id}\n`;
    });
  } else {
    // Estructura plana de microempresa: del Director a los operativos
    operativos.forEach(o => {
      if (o.id !== rootId) {
        mermaid += `  N_${rootId} --> N_${o.id}\n`;
      }
    });
  }

  return mermaid;
}

export default function HumanCapitalMatrix({ data, onChange, readOnly = false }) {
  // Detección de escala para seleccionar plantilla de arranque adecuada
  const detectIsMicro = () => {
    const fullText = JSON.stringify(data || '').toLowerCase();
    const isExplicitLarge = /minería|hidráulic|tier-1|tornero|clean room|sapi de cv|parque industrial/i.test(fullText);
    if (isExplicitLarge) return false;
    return true; // Predeterminado a estructura esbelta microempresa
  };

  const initialFallback = detectIsMicro() ? DEFAULT_MICRO_PUESTOS : DEFAULT_INDUSTRIAL_PUESTOS;

  // Obtener lista estructurada o inicializar desde fallback
  const puestosList = Array.isArray(data?.puestos_lista) && data.puestos_lista.length > 0 
    ? data.puestos_lista 
    : initialFallback;

  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState("cards");
  const [newPuesto, setNewPuesto] = useState({
    puesto: '',
    area: 'Operaciones',
    nivel: 'Operativo',
    sueldoBase: 20000,
    cargaSocialPct: 32,
    funciones: '',
    perfil: ''
  });

  const handleUpdate = (newList) => {
    if (onChange) {
      onChange('puestos_lista', newList);
    }
  };

  const handleAdd = () => {
    if (!newPuesto.puesto.trim()) return;
    const item = {
      ...newPuesto,
      id: Date.now().toString(),
      sueldoBase: Number(newPuesto.sueldoBase) || 0,
      cargaSocialPct: Number(newPuesto.cargaSocialPct) || 32
    };
    const updated = [...puestosList, item];
    handleUpdate(updated);
    setNewPuesto({
      puesto: '',
      area: 'Operaciones',
      nivel: 'Operativo',
      sueldoBase: 20000,
      cargaSocialPct: 32,
      funciones: '',
      perfil: ''
    });
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    const updated = puestosList.filter(p => p.id !== id);
    handleUpdate(updated);
  };

  const handleFieldChange = (id, field, value) => {
    const updated = puestosList.map(p => {
      if (p.id === id) {
        return {
          ...p,
          [field]: field === 'sueldoBase' || field === 'cargaSocialPct' ? Number(value) : value
        };
      }
      return p;
    });
    handleUpdate(updated);
  };

  // Cálculos agregados
  const totalSueldoBase = puestosList.reduce((acc, p) => acc + (Number(p.sueldoBase) || 0), 0);
  const totalCargaSocial = puestosList.reduce((acc, p) => {
    const base = Number(p.sueldoBase) || 0;
    const pct = (Number(p.cargaSocialPct) || 32) / 100;
    return acc + (base * pct);
  }, 0);
  const totalMensualIntegrado = totalSueldoBase + totalCargaSocial;
  const totalAnualIntegrado = totalMensualIntegrado * 12;

  // Agrupación por nivel para organigrama
  const directivos = puestosList.filter(p => p.nivel === 'Directivo');
  const gerencias = puestosList.filter(p => p.nivel === 'Gerencia');
  const mandosMedios = puestosList.filter(p => p.nivel === 'Mando Medio');
  const operativos = puestosList.filter(p => !['Directivo', 'Gerencia', 'Mando Medio'].includes(p.nivel));

  return (
    <div className="human-capital-matrix" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header con métricas ejecutivas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        padding: '1.25rem',
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '16px'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Puestos Totales</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6366f1', marginTop: '0.25rem' }}>{puestosList.length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>roles clave</span></div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nómina Base Mensual</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>${totalSueldoBase.toLocaleString('es-MX')} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MXN</span></div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Carga Social IMSS/Infonavit</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>${Math.round(totalCargaSocial).toLocaleString('es-MX')} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MXN/mes</span></div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Costo Total Anual Integrado</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>${Math.round(totalAnualIntegrado).toLocaleString('es-MX')} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MXN/año</span></div>
        </div>
      </div>

      {/* Controles de vista */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            type="button"
            className={`btn ${viewMode === 'cards' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('cards')}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span>📇</span> Fichas de Puesto ({puestosList.length})
          </button>
          <button 
            type="button"
            className={`btn ${viewMode === 'organigram' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('organigram')}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Network style={{ width: '14px', height: '14px' }} /> Organigrama Jerárquico
          </button>
          <button 
            type="button"
            className={`btn ${viewMode === 'mermaid' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('mermaid')}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Code2 style={{ width: '14px', height: '14px' }} /> Diagrama Mermaid
          </button>
          <button 
            type="button"
            className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('table')}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Briefcase style={{ width: '14px', height: '14px' }} /> Tabla y Nómina
          </button>
        </div>

        {!readOnly && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus style={{ width: '14px', height: '14px' }} /> {showAddForm ? 'Cerrar Formulario' : 'Agregar Puesto'}
          </button>
        )}
      </div>

      {/* Formulario para agregar nuevo puesto */}
      {showAddForm && !readOnly && (
        <div style={{
          padding: '1.25rem',
          background: 'var(--bg-dark)',
          border: '1px solid var(--accent-color)',
          borderRadius: '12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nombre del Puesto *</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ej: Tornero Especialista"
              value={newPuesto.puesto}
              onChange={(e) => setNewPuesto({ ...newPuesto, puesto: e.target.value })}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Área / Departamento</label>
            <select 
              className="form-control" 
              value={newPuesto.area}
              onChange={(e) => setNewPuesto({ ...newPuesto, area: e.target.value })}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="Dirección">Dirección</option>
              <option value="Operaciones">Operaciones / Taller</option>
              <option value="Ventas">Comercial / Ventas B2B</option>
              <option value="Finanzas">Administración y Finanzas</option>
              <option value="Calidad">Calidad e Ingeniería</option>
              <option value="Campo">Servicio en Campo</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nivel Jerárquico</label>
            <select 
              className="form-control" 
              value={newPuesto.nivel}
              onChange={(e) => setNewPuesto({ ...newPuesto, nivel: e.target.value })}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="Directivo">Directivo</option>
              <option value="Gerencia">Gerencia</option>
              <option value="Mando Medio">Mando Medio / Supervisor</option>
              <option value="Técnico">Técnico Especialista</option>
              <option value="Operativo">Operativo</option>
              <option value="Administrativo">Administrativo</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Sueldo Base Mensual (MXN)</label>
            <input 
              type="number" 
              className="form-control" 
              value={newPuesto.sueldoBase}
              onChange={(e) => setNewPuesto({ ...newPuesto, sueldoBase: e.target.value })}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Carga Social (%)</label>
            <input 
              type="number" 
              className="form-control" 
              value={newPuesto.cargaSocialPct}
              onChange={(e) => setNewPuesto({ ...newPuesto, cargaSocialPct: e.target.value })}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Funciones Principales</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Descripción breve de responsabilidades clave"
              value={newPuesto.funciones}
              onChange={(e) => setNewPuesto({ ...newPuesto, funciones: e.target.value })}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Perfil y Requisitos</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Escolaridad, certificaciones y años de experiencia requeridos"
              value={newPuesto.perfil}
              onChange={(e) => setNewPuesto({ ...newPuesto, perfil: e.target.value })}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowAddForm(false)}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={handleAdd}>Guardar Puesto</button>
          </div>
        </div>
      )}

      {/* Vista de Organigrama Visual */}
      {viewMode === 'cards' ? (
        /* Vista 1: Fichas de Puesto Premium */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {puestosList.map((p, idx) => {
            const areaColors = {
              'Dirección': { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: '👔' },
              'Operaciones': { bg: '#f8fafc', border: '#64748b', text: '#334155', icon: '⚙️' },
              'Ventas': { bg: '#ecfdf5', border: '#10b981', text: '#065f46', icon: '🤝' },
              'Finanzas': { bg: '#fefce8', border: '#eab308', text: '#854d0e', icon: '💰' },
              'Calidad': { bg: '#f5f3ff', border: '#8b5cf6', text: '#5b21b6', icon: '✨' },
              'Campo': { bg: '#fff7ed', border: '#f97316', text: '#9a3412', icon: '🚛' }
            };
            const col = areaColors[p.area] || { bg: '#f8fafc', border: '#cbd5e1', text: '#475569', icon: '🛠️' };

            return (
              <div 
                key={p.id || idx}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: col.border }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{col.icon}</span>
                    <div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: col.text }}>
                        {p.area} • {p.nivel}
                      </span>
                      <h5 style={{ margin: '2px 0 0 0', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                        {p.puesto}
                      </h5>
                    </div>
                  </div>
                </div>

                <div style={{ background: col.bg, padding: '0.6rem 0.85rem', borderRadius: '8px', border: `1px solid ${col.border}33` }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>COMPENSACIÓN INTEGRADA</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      ${(Number(p.sueldoBase) || 0).toLocaleString('es-MX')} <span style={{ fontSize: '0.7rem', color: '#64748b' }}>base/mes</span>
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
                      +${Math.round((Number(p.sueldoBase) || 0) * ((Number(p.cargaSocialPct) || 32)/100)).toLocaleString('es-MX')} IMSS
                    </span>
                  </div>
                </div>

                {p.funciones && (
                  <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Funciones Principales:</span>
                    <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: '1.45' }}>
                      {p.funciones}
                    </p>
                  </div>
                )}

                {p.perfil && (
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Perfil Requerido:</span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                      {p.perfil}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : viewMode === 'organigram' ? (
        /* Vista 2: Organigrama Jerárquico Visual */
        <div style={{
          padding: '1.75rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          overflowX: 'auto'
        }}>
          {/* Nivel 1: Dirección */}
          {directivos.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {directivos.map(p => (
                <div key={p.id} style={{
                  padding: '0.85rem 1.25rem',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                  minWidth: '220px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.area} • Directivo</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '2px' }}>{p.puesto}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '4px' }}>${(Number(p.sueldoBase) || 0).toLocaleString('es-MX')} MXN/mes</div>
                </div>
              ))}
            </div>
          )}

          {/* Conector si hay niveles inferiores */}
          {(gerencias.length > 0 || mandosMedios.length > 0 || operativos.length > 0) && (
            <div style={{ width: '2px', height: '20px', background: 'var(--border-color)' }} />
          )}

          {/* Nivel 2: Gerencias */}
          {gerencias.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {gerencias.map(p => (
                  <div key={p.id} style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-dark)',
                    color: 'var(--text-primary)',
                    borderRadius: '10px',
                    textAlign: 'center',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    minWidth: '180px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ fontSize: '0.65rem', color: '#818cf8', fontWeight: 600, textTransform: 'uppercase' }}>{p.area}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>{p.puesto}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>${(Number(p.sueldoBase) || 0).toLocaleString('es-MX')} MXN</div>
                  </div>
                ))}
              </div>
              {(mandosMedios.length > 0 || operativos.length > 0) && (
                <div style={{ width: '2px', height: '20px', background: 'var(--border-color)' }} />
              )}
            </>
          )}

          {/* Nivel 3: Mandos Medios */}
          {mandosMedios.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {mandosMedios.map(p => (
                  <div key={p.id} style={{
                    padding: '0.6rem 0.85rem',
                    background: 'rgba(245, 158, 11, 0.08)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    minWidth: '160px'
                  }}>
                    <div style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 600 }}>{p.area}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.puesto}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>${(Number(p.sueldoBase) || 0).toLocaleString('es-MX')} MXN</div>
                  </div>
                ))}
              </div>
              {operativos.length > 0 && (
                <div style={{ width: '2px', height: '20px', background: 'var(--border-color)' }} />
              )}
            </>
          )}

          {/* Nivel 4: Técnicos y Operativos */}
          {operativos.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', maxWidth: '1000px' }}>
              {operativos.map(p => (
                <div key={p.id} style={{
                  padding: '0.65rem 0.95rem',
                  background: 'var(--bg-dark)',
                  color: 'var(--text-secondary)',
                  borderRadius: '10px',
                  textAlign: 'center',
                  border: '1px solid var(--border-color)',
                  minWidth: '160px',
                  fontSize: '0.75rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{p.puesto}</div>
                  <div style={{ fontSize: '0.68rem', marginTop: '2px', color: '#10b981' }}>{p.area} • ${(Number(p.sueldoBase) || 0).toLocaleString('es-MX')} MXN</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : viewMode === 'mermaid' ? (
        /* Vista 3: Diagrama Mermaid Renderizado */
        <div style={{
          padding: '1.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Organigrama Funcional en Formato Mermaid.js
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'var(--bg-panel-hover)', padding: '2px 8px', borderRadius: '8px' }}>
              Sintaxis graph TD
            </span>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)' }}>
            <MermaidViewer chart={mermaidChartSource} theme="light" />
          </div>
        </div>
      ) : (
        /* Vista 4: Tabla Detallada */
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>#</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Puesto</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Área</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Nivel</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Sueldo Base</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Carga Social (IMSS)</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Costo Integrado</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Funciones</th>
                {!readOnly && <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {puestosList.map((p, idx) => {
                const base = Number(p.sueldoBase) || 0;
                const carga = base * ((Number(p.cargaSocialPct) || 32) / 100);
                const total = base + carga;
                const isEditing = editingId === p.id;

                return (
                  <tr key={p.id || idx} style={{ borderBottom: '1px solid var(--border-color)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)' }}>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={p.puesto} 
                          onChange={(e) => handleFieldChange(p.id, 'puesto', e.target.value)} 
                          className="form-control" 
                          style={{ fontSize: '0.75rem', padding: '2px 6px' }}
                        />
                      ) : p.puesto}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{p.area}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: p.nivel === 'Directivo' ? 'rgba(79, 70, 229, 0.15)' : p.nivel === 'Gerencia' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                        color: p.nivel === 'Directivo' ? '#818cf8' : p.nivel === 'Gerencia' ? '#60a5fa' : 'var(--text-secondary)'
                      }}>
                        {p.nivel}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={p.sueldoBase} 
                          onChange={(e) => handleFieldChange(p.id, 'sueldoBase', e.target.value)} 
                          className="form-control" 
                          style={{ fontSize: '0.75rem', padding: '2px 6px', textAlign: 'right', width: '90px' }}
                        />
                      ) : `$${Math.round(base).toLocaleString('es-MX')}`}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#f59e0b' }}>
                      ${Math.round(carga).toLocaleString('es-MX')} <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>({p.cargaSocialPct || 32}%)</span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                      ${Math.round(total).toLocaleString('es-MX')}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', maxWidth: '280px', fontSize: '0.75rem' }}>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={p.funciones} 
                          onChange={(e) => handleFieldChange(p.id, 'funciones', e.target.value)} 
                          className="form-control" 
                          style={{ fontSize: '0.75rem', padding: '2px 6px' }}
                        />
                      ) : (p.funciones || '-')}
                    </td>
                    {!readOnly && (
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setEditingId(isEditing ? null : p.id)}
                            style={{ background: 'transparent', border: 'none', color: isEditing ? '#10b981' : '#6366f1', cursor: 'pointer', padding: '4px' }}
                            title={isEditing ? 'Listo' : 'Editar'}
                          >
                            {isEditing ? <Check style={{ width: '14px', height: '14px' }} /> : <Edit2 style={{ width: '14px', height: '14px' }} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            title="Eliminar"
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--bg-dark)', borderTop: '2px solid var(--border-color)', fontWeight: 800 }}>
                <td colSpan={4} style={{ padding: '0.85rem', color: 'var(--text-primary)' }}>
                  TOTALES NÓMINA INTEGRADA ({puestosList.length} PUESTOS)
                </td>
                <td style={{ padding: '0.85rem', textAlign: 'right', color: 'var(--text-primary)' }}>
                  ${Math.round(totalSueldoBase).toLocaleString('es-MX')}
                </td>
                <td style={{ padding: '0.85rem', textAlign: 'right', color: '#f59e0b' }}>
                  ${Math.round(totalCargaSocial).toLocaleString('es-MX')}
                </td>
                <td style={{ padding: '0.85rem', textAlign: 'right', color: '#10b981', fontSize: '0.9rem' }}>
                  ${Math.round(totalMensualIntegrado).toLocaleString('es-MX')}
                </td>
                <td colSpan={readOnly ? 1 : 2} style={{ padding: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  Anual: ${Math.round(totalAnualIntegrado).toLocaleString('es-MX')} MXN
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
