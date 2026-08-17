import { Plus, Trash2, Users } from 'lucide-react';

const RISK_CLASSES = [
  { value: 1, label: 'Clase I (0.54% - Oficina/Bajo)', rate: 0.0054355 },
  { value: 2, label: 'Clase II (1.13% - Comercio)', rate: 0.0113065 },
  { value: 3, label: 'Clase III (2.60% - Taller/Procesos)', rate: 0.0259840 },
  { value: 4, label: 'Clase IV (4.65% - Transporte)', rate: 0.0465325 },
  { value: 5, label: 'Clase V (7.59% - Construcción/Químicos)', rate: 0.0758875 }
];

export default function StaffTable({ staff, onChange }) {
  const addEmployee = () => {
    const newEmployee = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'Nuevo Puesto',
      salary: 0,
      type: 'permanente', // permanente, temporal, proyecto
      riskClass: 1, // 1 a 5
      reportsTo: staff.length > 0 ? staff[0].id : null
    };
    onChange([...staff, newEmployee]);
  };

  const removeEmployee = (id) => {
    if (staff.length <= 1) return;
    onChange(staff.filter(e => e.id !== id));
  };

  const updateEmployee = (id, field, value) => {
    onChange(staff.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const getIntegratedSalary = (salary, riskClassVal = 1) => {
    const base = Number(salary || 0);
    const riskClassObj = RISK_CLASSES.find(r => r.value === Number(riskClassVal)) || RISK_CLASSES[0];
    // Aportación Social IMSS General (15%), INFONAVIT (5%), ISN (3%), Carga Provisión Aguinaldo/Vacaciones (~5%)
    const socialCharges = 0.23 + riskClassObj.rate;
    return base * (1 + socialCharges);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Users className="w-5 h-5 text-[#8b5cf6]" />
          Gestión de Personal y Carga Social (NIF/IMSS)
        </h3>
        <button className="btn btn-secondary btn-sm" onClick={addEmployee}>
          <Plus className="w-4 h-4" />
          <span>Añadir Puesto</span>
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '780px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <th style={{ textAlign: 'left', padding: '1rem' }}>Puesto / Rol</th>
              <th style={{ textAlign: 'left', padding: '1rem' }}>Tipo</th>
              <th style={{ textAlign: 'left', padding: '1rem' }}>Clase Riesgo (IMSS)</th>
              <th style={{ textAlign: 'right', padding: '1rem' }}>Salario Base</th>
              <th style={{ textAlign: 'right', padding: '1rem' }}>Sueldo Integrado</th>
              <th style={{ textAlign: 'left', padding: '1rem' }}>Reporta a</th>
              <th style={{ textAlign: 'center', padding: '1rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(staff) && staff.map((emp) => {
              const riskClassVal = emp.riskClass || 1;
              const empType = emp.type || 'permanente';
              return (
                <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {/* Puesto */}
                  <td style={{ padding: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={emp.role} 
                      onChange={(e) => updateEmployee(emp.id, 'role', e.target.value)}
                      style={{ background: 'transparent', border: 'none', padding: '0.5rem', width: '100%' }}
                    />
                  </td>
                  {/* Tipo */}
                  <td style={{ padding: '0.5rem' }}>
                    <select
                      className="form-control"
                      value={empType}
                      onChange={(e) => updateEmployee(emp.id, 'type', e.target.value)}
                      style={{ background: 'transparent', border: 'none', padding: '0.5rem', width: '100%', fontSize: '0.85rem' }}
                    >
                      <option value="permanente" style={{ background: '#0f111a' }}>Permanente</option>
                      <option value="temporal" style={{ background: '#0f111a' }}>Temporal</option>
                      <option value="proyecto" style={{ background: '#0f111a' }}>Proyecto</option>
                    </select>
                  </td>
                  {/* Clase Riesgo */}
                  <td style={{ padding: '0.5rem' }}>
                    <select
                      className="form-control"
                      value={riskClassVal}
                      onChange={(e) => updateEmployee(emp.id, 'riskClass', Number(e.target.value))}
                      style={{ background: 'transparent', border: 'none', padding: '0.5rem', width: '100%', fontSize: '0.85rem' }}
                    >
                      {RISK_CLASSES.map(rc => (
                        <option key={rc.value} value={rc.value} style={{ background: '#0f111a' }}>
                          {rc.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  {/* Salario Base */}
                  <td style={{ padding: '0.5rem' }}>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={emp.salary} 
                      onChange={(e) => updateEmployee(emp.id, 'salary', parseFloat(e.target.value) || 0)}
                      style={{ background: 'transparent', border: 'none', padding: '0.5rem', width: '110px', textAlign: 'right' }}
                    />
                  </td>
                  {/* Sueldo Integrado */}
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.88rem', fontWeight: '600', color: '#10b981' }}>
                    ${Math.round(getIntegratedSalary(emp.salary, riskClassVal)).toLocaleString()}
                  </td>
                  {/* Reporta a */}
                  <td style={{ padding: '0.5rem' }}>
                    <select 
                      className="form-control"
                      value={emp.reportsTo || ''}
                      onChange={(e) => updateEmployee(emp.id, 'reportsTo', e.target.value || null)}
                      style={{ background: 'transparent', border: 'none', padding: '0.5rem', fontSize: '0.85rem' }}
                    >
                      <option value="">(Nadie / Director)</option>
                      {staff.filter(e => e.id !== emp.id).map(s => (
                        <option key={s.id} value={s.id} style={{ background: '#0f111a' }}>{s.role}</option>
                      ))}
                    </select>
                  </td>
                  {/* Acciones */}
                  <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => removeEmployee(emp.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          * El <strong>Sueldo Integrado</strong> estima la cuota patronal IMSS básica, INFONAVIT (5%), ISN (3%) y las provisiones de aguinaldo/vacaciones.
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nómina Integrada Mensual: </span>
          <strong style={{ fontSize: '1.25rem', color: 'var(--accent-color)' }}>
            ${Math.round(
              Array.isArray(staff) 
                ? staff.reduce((acc, curr) => acc + getIntegratedSalary(curr.salary, curr.riskClass), 0) 
                : 0
            ).toLocaleString()}
          </strong>
        </div>
      </div>
    </div>
  );
}
