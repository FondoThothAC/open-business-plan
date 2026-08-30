import { useState } from 'react';
import { Factory, Grid, Maximize2, Shield, Layers, Plus, Trash2 } from 'lucide-react';

/**
 * BoxLayoutIndustrial - Generador y Visualizador Interactivo de Distribución de Planta (Lay-out)
 * Permite modelar zonas industriales (m², equipos, flujo de materiales y seguridad)
 * Totalmente adaptado al tema claro/oscuro del sistema
 */
export function BoxLayoutIndustrial({ definition = {}, values = {}, onChange = () => {} }) {
  const defaultZones = values.zones || [
    { id: 'almacen_mp', name: 'Almacén de Materia Prima & Mangueras', m2: 250, color: '#3b82f6', tipo: 'Almacenamiento', equipo: 'Racks industriales cantilever, montacargas 3T' },
    { id: 'banco_pruebas', name: 'Área de Ensamble y Banco de Pruebas 40k PSI', m2: 320, color: '#10b981', tipo: 'Producción', equipo: 'Banco de pruebas computarizado, prensas hidráulicas Finn-Power' },
    { id: 'maquinado', name: 'Taller de Maquinado y Torno CNC', m2: 180, color: '#8b5cf6', tipo: 'Producción', equipo: 'Tornos CNC, rectificadoras de cilindros, soldadura TIG' },
    { id: 'calidad', name: 'Laboratorio de Control de Calidad & Metrología', m2: 90, color: '#f59e0b', tipo: 'Calidad', equipo: 'Micrómetros digitales, contador de partículas óptico ISO 4406' },
    { id: 'almacen_pt', name: 'Almacén de Producto Terminado & Despacho', m2: 200, color: '#06b6d4', tipo: 'Logística', equipo: 'Área de embalaje, zona de estiba para despacho a mina' },
    { id: 'oficinas', name: 'Oficinas Técnicas, Ventas & Sala de Juntas', m2: 160, color: '#ec4899', tipo: 'Administración', equipo: 'Estaciones de trabajo CAD/CAM, servidores locales, sala técnica' }
  ];

  const [zones, setZones] = useState(defaultZones);
  const [activeZone, setActiveZone] = useState(null);

  const totalM2 = zones.reduce((acc, z) => acc + (Number(z.m2) || 0), 0);

  const updateZone = (idx, field, val) => {
    const next = zones.map((z, i) => i === idx ? { ...z, [field]: val } : z);
    setZones(next);
    onChange({ zones: next, totalM2 });
  };

  const addZone = () => {
    const newZone = {
      id: `zona_${Date.now()}`,
      name: 'Nueva Área / Zona Operativa',
      m2: 100,
      color: '#6366f1',
      tipo: 'Operativo',
      equipo: 'Equipamiento estándar'
    };
    const next = [...zones, newZone];
    setZones(next);
    onChange({ zones: next });
  };

  const removeZone = (idx) => {
    const next = zones.filter((_, i) => i !== idx);
    setZones(next);
    onChange({ zones: next });
  };

  return (
    <div style={{
      background: 'var(--bg-panel, #ffffff)',
      border: '1px solid var(--border-color, #e4e4e7)',
      borderRadius: '12px',
      padding: '24px',
      margin: '20px 0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.12)', borderRadius: '10px', color: 'var(--accent-color, #6366f1)' }}>
            <Factory size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary, #09090b)', fontWeight: 700 }}>
              {definition.title || 'Generador y Visualizador de Lay-out de Planta (Distribución Física)'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #71717a)' }}>
              Fuente: {definition.source?.book || 'Operations Management (Slack & Johnston)'} ({definition.source?.page || 'Ch. 7 - Plant Layout'})
            </span>
          </div>
        </div>
        <div style={{
          padding: '6px 16px',
          borderRadius: '20px',
          background: 'rgba(99, 102, 241, 0.12)',
          color: 'var(--accent-color, #6366f1)',
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Maximize2 size={16} />
          Superficie Total: {totalM2.toLocaleString()} m²
        </div>
      </div>

      {/* Visual Floor Plan Grid (Croquis Esquematizado de Planta) */}
      <div style={{
        background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))',
        border: '2px dashed var(--border-color, #e4e4e7)',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary, #09090b)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Grid size={15} /> Croquis de Distribución Espacial Proporcional
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #71717a)' }}>
            Haz clic en un área para editarla
          </span>
        </div>

        {/* Diagrama de Bloques Proporcionales */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px'
        }}>
          {zones.map((zone, idx) => {
            const pct = totalM2 > 0 ? ((Number(zone.m2) || 0) / totalM2) * 100 : 0;
            const isSelected = activeZone === idx;

            return (
              <div
                key={zone.id}
                onClick={() => setActiveZone(isSelected ? null : idx)}
                style={{
                  background: isSelected ? `${zone.color}25` : `${zone.color}15`,
                  border: `2px solid ${isSelected ? zone.color : `${zone.color}50`}`,
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: zone.color, textTransform: 'uppercase' }}>
                    {zone.tipo}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary, #09090b)' }}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary, #09090b)', marginBottom: '4px' }}>
                  {zone.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)', marginBottom: '6px' }}>
                  📐 <strong>{zone.m2} m²</strong>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #71717a)', lineHeight: '1.3' }}>
                  ⚙️ {zone.equipo}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla y Editor de Zonas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <h5 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary, #09090b)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} /> Detalle y Especificación de Áreas
          </h5>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addZone}
            style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Plus size={14} /> Añadir Zona
          </button>
        </div>

        {zones.map((zone, idx) => (
          <div
            key={zone.id}
            style={{
              background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))',
              border: '1px solid var(--border-color, #e4e4e7)',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 2fr auto',
              gap: '10px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              className="form-control"
              value={zone.name}
              onChange={(e) => updateZone(idx, 'name', e.target.value)}
              placeholder="Nombre del Área"
              style={{ fontSize: '0.8rem' }}
            />
            <input
              type="number"
              className="form-control"
              value={zone.m2}
              onChange={(e) => updateZone(idx, 'm2', parseFloat(e.target.value) || 0)}
              placeholder="Superficie m²"
              style={{ fontSize: '0.8rem' }}
            />
            <input
              type="text"
              className="form-control"
              value={zone.tipo}
              onChange={(e) => updateZone(idx, 'tipo', e.target.value)}
              placeholder="Tipo"
              style={{ fontSize: '0.8rem' }}
            />
            <input
              type="text"
              className="form-control"
              value={zone.equipo}
              onChange={(e) => updateZone(idx, 'equipo', e.target.value)}
              placeholder="Equipos / Maquinaria"
              style={{ fontSize: '0.8rem' }}
            />
            <button
              type="button"
              className="icon-btn-rounded"
              onClick={() => removeZone(idx)}
              style={{ color: '#ef4444' }}
              title="Eliminar zona"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
