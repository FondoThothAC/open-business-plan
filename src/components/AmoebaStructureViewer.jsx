import { useState } from 'react';
import { Network, ArrowRightLeft } from 'lucide-react';

/**
 * Widget Visual e Interactivo para Amoeba Management (Gestión por Amebas - Kyocera / Kazuo Inamori):
 * Visualiza la subdivisión de la empresa en micro-unidades de negocio autónomas,
 * calculando el valor añadido por hora de trabajo y precios de transferencia entre células.
 */
export default function AmoebaStructureViewer({
  amebas = [
    { id: '1', nombre: 'Ameba de Ventas y Cuentas Clave', lider: 'Líder Comercial', miembros: 4, ingresos: 350000, gastosExternos: 80000, horasHombre: 640 },
    { id: '2', nombre: 'Ameba de Producción y Ensamble', lider: 'Líder Técnico', miembros: 6, ingresos: 220000, gastosExternos: 75000, horasHombre: 960 },
    { id: '3', nombre: 'Ameba de Innovación y Soporte TI', lider: 'Líder de Desarrollo', miembros: 3, ingresos: 180000, gastosExternos: 35000, horasHombre: 480 }
  ],
  transferencias = [
    { de: 'Ameba de Producción', a: 'Ameba de Ventas', concepto: 'Costo de fabricación por lote', precio: 120000 },
    { de: 'Ameba de TI', a: 'Ameba de Ventas', concepto: 'Mantenimiento de plataforma e-commerce', precio: 30000 }
  ]
}) {
  const [selectedAmeba, setSelectedAmeba] = useState(amebas[0]?.id || null);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff'
        }}>
          <Network className="w-4 h-4" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Estructura Celular y Valor Añadido por Hora (Amoeba Management)
          </h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Filosofía Kazuo Inamori: Cada micro-célula opera como un centro de beneficio autónomo y transparente.
          </p>
        </div>
      </div>

      {/* Grid de Células / Amebas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {amebas.map((a) => {
          const valorAnadidoNeto = Math.max(0, a.ingresos - a.gastosExternos);
          const valorPorHora = a.horasHombre > 0 ? valorAnadidoNeto / a.horasHombre : 0;
          const isSelected = selectedAmeba === a.id;

          return (
            <div
              key={a.id}
              onClick={() => setSelectedAmeba(a.id)}
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'rgba(0,0,0,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {a.nombre}
                </h4>
                <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 700 }}>
                  Autónoma
                </span>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Líder: <strong style={{ color: 'var(--text-primary)' }}>{a.lider}</strong> ({a.miembros} integrantes)
              </div>

              {/* Indicador Estrella: Valor Añadido por Hora */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #06b6d4' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 700 }}>
                  Valor Añadido por Hora
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  {formatMoney(valorPorHora)} <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/ hora-hombre</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Ingresos: </span>
                  <strong style={{ color: '#34d399' }}>{formatMoney(a.ingresos)}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Gastos Ext: </span>
                  <strong style={{ color: '#f87171' }}>{formatMoney(a.gastosExternos)}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla de Precios de Transferencia Internos */}
      {transferencias && transferencias.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700 }}>
            <ArrowRightLeft className="w-4 h-4 text-accent" />
            Tabla de Precios de Transferencia Interna entre Células
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.5rem' }}>De (Proveedor Interno)</th>
                <th style={{ padding: '0.5rem' }}>A (Cliente Interno)</th>
                <th style={{ padding: '0.5rem' }}>Concepto / Servicio</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Precio de Transferencia</th>
              </tr>
            </thead>
            <tbody>
              {transferencias.map((t, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.de}</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{t.a}</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{t.concepto}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>{formatMoney(t.precio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
