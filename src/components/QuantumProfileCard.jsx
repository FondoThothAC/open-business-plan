import { useState } from 'react';
import { Zap, Cog, ClipboardList, UserPlus, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function QuantumProfileCard({ diagnosticData }) {
  const [showVacancies, setShowVacancies] = useState(false);

  if (!diagnosticData || !diagnosticData.scores) {
    return null;
  }

  const { scores, antipatrones, plan_delegacion, salto_cuantico_siguiente, independencia_fundador, resumen_ejecutivo_cuantico } = diagnosticData;

  const getScoreColor = (score) => {
    if (score >= 0.7) return '#10b981'; // Verde
    if (score >= 0.45) return '#f59e0b'; // Amarillo
    return '#ef4444'; // Rojo
  };

  const getScoreBg = (score) => {
    if (score >= 0.7) return 'rgba(16, 185, 129, 0.1)';
    if (score >= 0.45) return 'rgba(245, 158, 11, 0.1)';
    return 'rgba(239, 68, 68, 0.1)';
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)',
      borderRadius: '16px',
      border: '1px solid rgba(148, 163, 184, 0.15)',
      padding: '1.75rem',
      marginBottom: '2rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
      color: '#f8fafc'
    }}>
      {/* Header del Diagnóstico Cuántico */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>⚛️</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Diagnóstico Cuántico del Fundador
            </h3>
            <span style={{
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              fontSize: '0.75rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              fontWeight: 600,
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              Fondo Thoth AC
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.4rem', margin: 0 }}>
            {resumen_ejecutivo_cuantico || 'Modelo Atómico de 3 Áreas: Evaluación de fortalezas y autonomía del fundador.'}
          </p>
        </div>

        {/* Nivel de Independencia */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '0.6rem 1rem',
          borderRadius: '12px',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', tracking: '0.05em' }}>
            Independencia del Fundador
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>
            {Math.round((independencia_fundador || 0.2) * 100)}%
          </div>
        </div>
      </div>

      {/* Átomo de 3 Áreas: Finanzas, Operativo, Administrativo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        
        {/* Finanzas */}
        <div style={{
          background: getScoreBg(scores.finanzas?.score || 0.3),
          border: `1px solid ${getScoreColor(scores.finanzas?.score || 0.3)}40`,
          borderRadius: '12px',
          padding: '1.2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
              <Zap size={18} style={{ color: '#f59e0b' }} /> Finanzas
            </div>
            <span style={{
              background: getScoreColor(scores.finanzas?.score || 0.3),
              color: '#000', fontWeight: 700, fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '8px'
            }}>
              {(scores.finanzas?.nivel || 'débil').toUpperCase()}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
            {scores.finanzas?.evidencia || 'Sin información financiera sólida declarada.'}
          </p>
        </div>

        {/* Operativo */}
        <div style={{
          background: getScoreBg(scores.operativo?.score || 0.8),
          border: `1px solid ${getScoreColor(scores.operativo?.score || 0.8)}40`,
          borderRadius: '12px',
          padding: '1.2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
              <Cog size={18} style={{ color: '#38bdf8' }} /> Operativo
            </div>
            <span style={{
              background: getScoreColor(scores.operativo?.score || 0.8),
              color: '#000', fontWeight: 700, fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '8px'
            }}>
              {(scores.operativo?.nivel || 'fuerte').toUpperCase()}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
            {scores.operativo?.evidencia || 'Dominio directo del proceso de producción/servicio.'}
          </p>
        </div>

        {/* Administrativo */}
        <div style={{
          background: getScoreBg(scores.administrativo?.score || 0.5),
          border: `1px solid ${getScoreColor(scores.administrativo?.score || 0.5)}40`,
          borderRadius: '12px',
          padding: '1.2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
              <ClipboardList size={18} style={{ color: '#a855f7' }} /> Administrativo
            </div>
            <span style={{
              background: getScoreColor(scores.administrativo?.score || 0.5),
              color: '#000', fontWeight: 700, fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '8px'
            }}>
              {(scores.administrativo?.nivel || 'moderado').toUpperCase()}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
            {scores.administrativo?.evidencia || 'Experiencia moderada en gestión y liderazgo.'}
          </p>
        </div>

      </div>

      {/* Alertas de Anti-patrones */}
      {antipatrones && antipatrones.filter(a => a.detectado).length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fca5a5', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            <ShieldAlert size={18} /> Anti-Patrones Organizacionales Detectados
          </div>
          {antipatrones.filter(a => a.detectado).map((ap, idx) => (
            <div key={idx} style={{ fontSize: '0.85rem', color: '#fecdd3', lineHeight: 1.4 }}>
              • <strong>{ap.nombre}:</strong> {ap.riesgo} <span style={{ color: '#38bdf8' }}>→ {ap.recomendacion}</span>
            </div>
          ))}
        </div>
      )}

      {/* Siguiente Salto Cuántico */}
      {salto_cuantico_siguiente && (
        <div style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.2rem',
          display: 'flex',
          justifySubstring: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.8rem'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#7dd3fc', fontWeight: 700, textTransform: 'uppercase' }}>
              🚀 Siguiente Escalón de Crecimiento
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>
              {salto_cuantico_siguiente.nombre_salto}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {salto_cuantico_siguiente.requisitos?.map((req, i) => (
              <span key={i} style={{
                background: 'rgba(15, 23, 42, 0.6)',
                color: '#e2e8f0',
                fontSize: '0.8rem',
                padding: '0.3rem 0.7rem',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <CheckCircle2 size={14} style={{ color: '#38bdf8' }} /> {req}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Botón para expandir Vacantes / Plan de Delegación */}
      {plan_delegacion && plan_delegacion.length > 0 && (
        <div>
          <button
            onClick={() => setShowVacancies(!showVacancies)}
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#a5b4fc',
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <UserPlus size={16} />
            {showVacancies ? 'Ocultar Plan de Delegación y Vacantes' : `Ver Recomendaciones de Delegación (${plan_delegacion.length} puestos)`}
            {showVacancies ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showVacancies && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
              {plan_delegacion.map((puesto, i) => (
                <div key={i} style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                  borderRadius: '12px',
                  padding: '1.2rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#38bdf8' }}>
                      👤 Puesto Sugerido: {puesto.puesto}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                      {puesto.salario_estimado}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.8rem' }}>
                    <strong>Habilidades requeridas:</strong> {puesto.habilidades_clave?.join(', ')}
                  </p>
                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                    {puesto.descripcion_vacante}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
