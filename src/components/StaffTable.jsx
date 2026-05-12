import React from 'react';
import { Plus, Trash2, Users } from 'lucide-react';

export default function StaffTable({ staff, onChange }) {
  const addEmployee = () => {
    const newEmployee = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'Nuevo Puesto',
      salary: 0,
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

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users className="w-5 h-5 text-[#8b5cf6]" />
          Gestión de Personal y Salarios
        </h3>
        <button className="btn btn-secondary btn-sm" onClick={addEmployee}>
          <Plus className="w-4 h-4" />
          <span>Añadir Puesto</span>
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <th style={{ textAlign: 'left', padding: '1rem' }}>Puesto / Nombre</th>
            <th style={{ textAlign: 'left', padding: '1rem' }}>Salario Mensual</th>
            <th style={{ textAlign: 'left', padding: '1rem' }}>Reporta a</th>
            <th style={{ textAlign: 'center', padding: '1rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(staff) && staff.map((emp) => (
            <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '0.75rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  value={emp.role} 
                  onChange={(e) => updateEmployee(emp.id, 'role', e.target.value)}
                  style={{ background: 'transparent', border: 'none', padding: '0.5rem' }}
                />
              </td>
              <td style={{ padding: '0.75rem' }}>
                <input 
                  type="number" 
                  className="form-control" 
                  value={emp.salary} 
                  onChange={(e) => updateEmployee(emp.id, 'salary', parseFloat(e.target.value))}
                  style={{ background: 'transparent', border: 'none', padding: '0.5rem', width: '120px' }}
                />
              </td>
              <td style={{ padding: '0.75rem' }}>
                <select 
                  className="form-control"
                  value={emp.reportsTo || ''}
                  onChange={(e) => updateEmployee(emp.id, 'reportsTo', e.target.value || null)}
                  style={{ background: 'transparent', border: 'none', padding: '0.5rem' }}
                >
                  <option value="">(Nadie / Director)</option>
                  {staff.filter(e => e.id !== emp.id).map(s => (
                    <option key={s.id} value={s.id} style={{ background: '#0f111a' }}>{s.role}</option>
                  ))}
                </select>
              </td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <button 
                  onClick={() => removeEmployee(emp.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', textAlign: 'right' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Nómina Mensual Total: </span>
        <strong style={{ fontSize: '1.25rem', color: 'var(--accent-color)' }}>
          ${(Array.isArray(staff) ? staff.reduce((acc, curr) => acc + (curr.salary || 0), 0) : 0).toLocaleString()}
        </strong>
      </div>
    </div>
  );
}
