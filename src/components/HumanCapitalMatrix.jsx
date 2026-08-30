import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, Briefcase, Network } from 'lucide-react';

export default function HumanCapitalMatrix({ data, onChange, readOnly = false }) {
  // Obtener lista estructurada o inicializar desde fallback
  const puestosList = Array.isArray(data?.puestos_lista) && data.puestos_lista.length > 0 
    ? data.puestos_lista 
    : [
        { id: "1", puesto: "Director General (CEO)", area: "Dirección", nivel: "Directivo", sueldoBase: 75000, cargaSocialPct: 32, funciones: "Estrategia macro, alianzas corporativas y gobernanza.", perfil: "Ing. Industrial / MBA con 10+ años de experiencia." },
        { id: "2", puesto: "Gerente de Operaciones", area: "Operaciones", nivel: "Gerencia", sueldoBase: 50000, cargaSocialPct: 32, funciones: "Gestión técnica del taller, calidad ISO 9001/4406 y SLAs.", perfil: "Ing. Mecánico/Mecatrónico." },
        { id: "3", puesto: "Gerente Comercial B2B", area: "Ventas", nivel: "Gerencia", sueldoBase: 45000, cargaSocialPct: 32, funciones: "Licitaciones, prospección de contratos y convenios marco.", perfil: "Lic. Comercial/Ingeniero." },
        { id: "4", puesto: "Gerente de Finanzas", area: "Finanzas", nivel: "Gerencia", sueldoBase: 45000, cargaSocialPct: 32, funciones: "Tesorería, control de cobranza a 90 días y contabilidad.", perfil: "C.P. / Finanzas." }
      ];

  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showOrganigramView, setShowOrganigramView] = useState(true);
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            type="button"
            className={`btn ${!showOrganigramView ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowOrganigramView(false)}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Briefcase style={{ width: '14px', height: '14px' }} /> Matriz de Puestos y Nómina
          </button>
          <button 
            type="button"
            className={`btn ${showOrganigramView ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowOrganigramView(true)}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Network style={{ width: '14px', height: '14px' }} /> Organigrama Jerárquico
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
      {showOrganigramView ? (
        <div style={{
          padding: '1.75rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.75rem',
          overflowX: 'auto'
        }}>
          {/* Nivel 1: Dirección */}
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

          <div style={{ width: '2px', height: '20px', background: 'var(--border-color)' }} />

          {/* Nivel 2: Gerencias */}
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

          <div style={{ width: '2px', height: '20px', background: 'var(--border-color)' }} />

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
              <div style={{ width: '2px', height: '20px', background: 'var(--border-color)' }} />
            </>
          )}

          {/* Nivel 4: Técnicos y Operativos */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', maxWidth: '1000px' }}>
            {operativos.map(p => (
              <div key={p.id} style={{
                padding: '0.5rem 0.75rem',
                background: 'var(--bg-dark)',
                color: 'var(--text-secondary)',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid var(--border-color)',
                minWidth: '140px',
                fontSize: '0.75rem'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.puesto}</div>
                <div style={{ fontSize: '0.65rem', marginTop: '2px' }}>{p.area} • ${(Number(p.sueldoBase) || 0).toLocaleString('es-MX')}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Vista de Tabla Detallada */
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
                      ) : `$${base.toLocaleString('es-MX')}`}
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
                <td colSpan={4} style={{ padding: '0.85rem', color: 'var(--text-primary)' }}>TOTALES NÓMINA INTEGRADA (14 PUESTOS)</td>
                <td style={{ padding: '0.85rem', textAlign: 'right', color: 'var(--text-primary)' }}>${totalSueldoBase.toLocaleString('es-MX')}</td>
                <td style={{ padding: '0.85rem', textAlign: 'right', color: '#f59e0b' }}>${Math.round(totalCargaSocial).toLocaleString('es-MX')}</td>
                <td style={{ padding: '0.85rem', textAlign: 'right', color: '#10b981', fontSize: '0.9rem' }}>${Math.round(totalMensualIntegrado).toLocaleString('es-MX')}</td>
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
