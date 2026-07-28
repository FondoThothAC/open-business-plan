import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Sparkles, Building2, HelpCircle, ArrowRight } from 'lucide-react';

export default function AdaptiveSeedForm({
  seedData,
  benchmarkMatch,
  frameworkInference,
  onUpdateField,
  onConfirmSeed
}) {
  const isCheckMode = benchmarkMatch && benchmarkMatch.matched && benchmarkMatch.benchmark;
  const benchmark = isCheckMode ? benchmarkMatch.benchmark : null;

  // Estados del Modo Check
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (key) => {
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="adaptive-seed-form" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Banner del Modo de Cuestionario Detectado */}
      <div style={{
        background: isCheckMode 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)' 
          : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
        border: `1px solid ${isCheckMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '12px',
          background: isCheckMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isCheckMode ? '#10b981' : '#6366f1', flexShrink: 0
        }}>
          {isCheckMode ? <Building2 size={24} /> : <Sparkles size={24} />}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {isCheckMode 
              ? `⚡ Modo Check Rápido Activado: ${benchmark.name}`
              : `📝 Entrevista Adaptativa Inteligente`}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
            {isCheckMode 
              ? `Detectamos que tu proyecto pertenece a un sector estandarizado. Hemos precargado la estructura técnica, precios y márgenes habituales de la industria.`
              : `La IA ha estructurado las preguntas clave adaptadas a la naturaleza de tu proyecto para no hacerte perder tiempo.`}
          </p>
        </div>
      </div>

      {/* RENDERIZADO MODO CHECK RÁPIDO (Industria conocida) */}
      {isCheckMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} style={{ color: 'var(--success-color)' }} /> Estándares Industriales Precargados (Valida o ajusta)
            </h4>

            {/* Insumos / Proceso precargado */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-panel-hover)', padding: '1rem', borderRadius: '8px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--accent-color)', display: 'block', marginBottom: '0.3rem' }}>
                  Proceso de Producción Típico:
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                  {benchmark.defaults.produccion.proceso}
                </p>
              </div>

              <div style={{ background: 'var(--bg-panel-hover)', padding: '1rem', borderRadius: '8px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--accent-color)', display: 'block', marginBottom: '0.3rem' }}>
                  Finanzas e Inversión Estándar:
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                  Inversión Inicial: {benchmark.defaults.finanzas.inversion_inicial}<br/>
                  Margen Bruto: {benchmark.defaults.finanzas.margen_bruto_estimado}
                </p>
              </div>
            </div>

            {/* Preguntas de Validación "Check" */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Preguntas Rápidas de Confirmación:</strong>
              {benchmark.defaults.preguntas_check?.map((q, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--bg-panel)', padding: '0.8rem 1rem', borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{q.label}</span>
                  <input
                    type="text"
                    className="form-control"
                    style={{ width: '220px', fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                    defaultValue={q.defaultVal}
                    onChange={(e) => onUpdateField(q.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Campos Específicos del Negocio que no están en el benchmark */}
          <div style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Detalles Específicos de Tu Proyecto
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  Nombre Comercial / Marca
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Tortillería La Purísima"
                  value={seedData?.nombre_proyecto || seedData?.negocio?.nombre_marca || ''}
                  onChange={(e) => onUpdateField('nombre_proyecto', e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  Ubicación Exacta o Zona
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Col. Sahuaro, Hermosillo, Sonora"
                  value={seedData?.cobertura || seedData?.negocio?.ubicacion || ''}
                  onChange={(e) => onUpdateField('cobertura', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (

        /* RENDERIZADO MODO ENTREVISTA ADAPTATIVA (Proyecto Nuevo / Tech / Complejo) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Cuestionario Adaptativo del Anteproyecto
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  1. Nombre o Nombre Tentativo del Proyecto
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Jubilus Consultoría Patrimonial"
                  value={seedData?.nombre_proyecto || ''}
                  onChange={(e) => onUpdateField('nombre_proyecto', e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  2. Ubicación o Alcance del Servicio
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Cobertura regional noroeste / Plataforma en la nube"
                  value={seedData?.cobertura || ''}
                  onChange={(e) => onUpdateField('cobertura', e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  3. Problema o Necesidad Central
                </label>
                <textarea
                  className="form-control"
                  style={{ minHeight: '80px' }}
                  placeholder="Describa la necesidad puntual que resuelve..."
                  value={seedData?.problema || ''}
                  onChange={(e) => onUpdateField('problema', e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  4. Producto, Servicio o Propuesta de Valor
                </label>
                <textarea
                  className="form-control"
                  style={{ minHeight: '80px' }}
                  placeholder="Describa el producto o servicio..."
                  value={seedData?.solucion || ''}
                  onChange={(e) => onUpdateField('solucion', e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  5. Cliente Objetivo y Modelo de Monetización
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Profesionistas de 30-50 años / Suscripción mensual $800 MXN"
                  value={seedData?.mercado_objetivo || ''}
                  onChange={(e) => onUpdateField('mercado_objetivo', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón de Confirmación */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          className="btn btn-ia"
          onClick={onConfirmSeed}
          style={{ padding: '0.9rem 2.5rem', fontSize: '1.05rem', borderRadius: '30px', fontWeight: 700 }}
        >
          Confirmar Semilla Adaptativa <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
}
