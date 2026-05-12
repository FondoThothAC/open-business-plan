import React from 'react';
import { Plus, Trash2, Clock, Wrench, FileText } from 'lucide-react';

export default function ProcessTable({ processes = [], onChange }) {
  const addProcess = () => {
    const newProcess = {
      id: Date.now().toString(),
      step: processes.length + 1,
      task: '',
      description: '',
      equipment: '',
      time: ''
    };
    onChange([...processes, newProcess]);
  };

  const updateProcess = (id, field, value) => {
    const updated = processes.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    );
    onChange(updated);
  };

  const removeProcess = (id) => {
    const updated = processes.filter(p => p.id !== id).map((p, index) => ({
      ...p,
      step: index + 1
    }));
    onChange(updated);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--accent-color)', padding: '0.5rem', borderRadius: '8px' }}>
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white' }}>Diagrama de Procesos y Operación</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Define paso a paso cómo se produce tu producto o servicio.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={addProcess}>
          <Plus className="w-4 h-4" />
          <span>Añadir Paso</span>
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', width: '60px' }}>#</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Tarea / Actividad</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Descripción Detallada</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Equipo / Insumos</th>
              <th style={{ padding: '1rem', textAlign: 'left', width: '120px' }}>Tiempo Est.</th>
              <th style={{ padding: '1rem', textAlign: 'center', width: '80px' }}></th>
            </tr>
          </thead>
          <tbody>
            {processes.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay procesos definidos. Haz clic en "Añadir Paso" para comenzar.
                </td>
              </tr>
            ) : (
              processes.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="hover:bg-white/5">
                  <td style={{ padding: '1rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>{p.step}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Ej: Mezclado" 
                      value={p.task} 
                      onChange={(e) => updateProcess(p.id, 'task', e.target.value)}
                      style={{ background: 'transparent', border: '1px solid transparent', borderBottom: '1px solid var(--border-color)' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <textarea 
                      className="form-control" 
                      placeholder="Describe la acción..." 
                      value={p.description} 
                      onChange={(e) => updateProcess(p.id, 'description', e.target.value)}
                      style={{ background: 'transparent', border: 'none', resize: 'none', minHeight: '40px' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Herramientas..." 
                      value={p.equipment} 
                      onChange={(e) => updateProcess(p.id, 'equipment', e.target.value)}
                      style={{ background: 'transparent', border: 'none' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock className="w-3.5 h-3.5 text-secondary" />
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="15 min" 
                        value={p.time} 
                        onChange={(e) => updateProcess(p.id, 'time', e.target.value)}
                        style={{ background: 'transparent', border: 'none' }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button className="btn-icon text-danger" onClick={() => removeProcess(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {processes.length > 0 && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '3px solid var(--accent-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <FileText className="w-4 h-4 text-[#8b5cf6]" />
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Resumen Operativo:</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Se han definido {processes.length} pasos operativos críticos. Esta secuencia será utilizada por la IA para redactar la narrativa técnica del proyecto.
          </p>
        </div>
      )}
    </div>
  );
}
