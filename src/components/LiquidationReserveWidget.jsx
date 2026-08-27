import React, { useState, useMemo } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Flame, DollarSign, Users, Building, FileText, ChevronDown, ChevronUp, Info, HelpCircle } from 'lucide-react';
import { calculateLiquidationReserve, analyzeBurnRateAndSurvival, getQuantumExitProtocol } from '../lib/finanzas/liquidationEngine';

export default function LiquidationReserveWidget({ planData, projections, staff = [] }) {
  // Estado para la estrategia de quema planeada (Modelo Amazon vs Flujo Inmediato)
  const [isPlannedBurn, setIsPlannedBurn] = useState(false);
  const [plannedMonths, setPlannedMonths] = useState(6);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState('ROJA');

  const formatCurrency = (val) => new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(Number(val || 0));

  // 1. Extraer flujos netos mensuales proyectados
  const monthlyFlows = useMemo(() => {
    if (projections?.monthlyCashFlowData && Array.isArray(projections.monthlyCashFlowData)) {
      return projections.monthlyCashFlowData.map(m => m.netCashFlow);
    }
    if (projections?.monthlyBreakdown && Array.isArray(projections.monthlyBreakdown)) {
      return projections.monthlyBreakdown.map(m => m.netIncome || (m.sales - m.totalCosts));
    }
    // Fallback estándar
    return [-15000, -20000, 5000, 12000, 18000, 25000, 30000, 35000, 40000, 45000, 50000, 55000];
  }, [projections]);

  // 2. Extraer caja inicial o inversión neta
  const currentCash = useMemo(() => {
    const capex = projections?.netInitialInvestment || 250000;
    return Math.max(100000, capex * 0.7); // Estimación de capital de trabajo disponible inicial
  }, [projections]);

  // 3. Calcular FRLI
  const reserveData = useMemo(() => {
    return calculateLiquidationReserve(planData, staff);
  }, [planData, staff]);

  // 4. Analizar quema y supervivencia
  const analysis = useMemo(() => {
    return analyzeBurnRateAndSurvival(monthlyFlows, {
      isPlannedBurnStrategy: isPlannedBurn,
      plannedBurnMonths: plannedMonths,
      currentCashBalance: currentCash,
      liquidationReserve: reserveData.totalFRLI,
      toleranceConsecutiveLossMonths: 3,
    });
  }, [monthlyFlows, isPlannedBurn, plannedMonths, currentCash, reserveData]);

  // 5. Protocolo de Contingencia en 3 Fases
  const protocolPhases = useMemo(() => {
    return getQuantumExitProtocol(analysis.phase, reserveData);
  }, [analysis.phase, reserveData]);

  return (
    <div style={{
      background: 'var(--bg-panel, #ffffff)',
      borderRadius: '16px',
      border: '1px solid var(--border-color, #e2e8f0)',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
    }}>
      {/* Header del Widget */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.4rem', borderRadius: '8px', color: '#ef4444' }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                Fondo de Reserva de Liquidación Intocable (FRLI) & Kill Switch
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)' }}>
                Metodología Cuántica: Prevención de quiebras desordenadas y protocolo de cierre digno al 100% de ley
              </span>
            </div>
          </div>
        </div>

        {/* Badge de Estado Cuántico Activo */}
        <div style={{
          background: `${analysis.badgeColor}15`,
          border: `1px solid ${analysis.badgeColor}40`,
          borderRadius: '20px',
          padding: '0.35rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: analysis.badgeColor }}></div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: analysis.badgeColor, textTransform: 'uppercase' }}>
            {analysis.phaseName.split(':')[0]}
          </span>
        </div>
      </div>

      {/* Grid Principal de Métricas Clave */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Tarjeta FRLI */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.04)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ef4444', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
            <span>Reserva de Cierre (FRLI)</span>
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.7rem', padding: 0 }}
            >
              <span>{showBreakdown ? 'Ocultar' : 'Ver desglose'}</span>
              {showBreakdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ef4444', marginTop: '0.4rem' }}>
            {formatCurrency(reserveData.totalFRLI)}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #64748b)', display: 'block', marginTop: '2px' }}>
            Fondo intocable para liquidación al 100% (LFT + Pasivos)
          </span>
        </div>

        {/* Tarjeta Runway de Supervivencia Libre */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.04)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
          padding: '1rem'
        }}>
          <div style={{ color: '#3b82f6', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
            <span>Runway Seguro Libre</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#3b82f6', marginTop: '0.4rem' }}>
            {analysis.runwayLibreMeses >= 99 ? '∞ Meses' : `${analysis.runwayLibreMeses} Meses`}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #64748b)', display: 'block', marginTop: '2px' }}>
            Meses de operación antes de tocar la reserva intocable
          </span>
        </div>

        {/* Tarjeta Caja Líquida Disponible */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.04)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '12px',
          padding: '1rem'
        }}>
          <div style={{ color: '#10b981', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
            <span>Caja Operativa Segura</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', marginTop: '0.4rem' }}>
            {formatCurrency(analysis.safeAvailableCash)}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #64748b)', display: 'block', marginTop: '2px' }}>
            Excedente sobre el piso de liquidación obligatoria
          </span>
        </div>
      </div>

      {/* Desglose Detallado del FRLI (Modal / Dropdown) */}
      {showBreakdown && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.03)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          fontSize: '0.8rem'
        }}>
          <div style={{ fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={16} className="text-danger" />
            <span>Composición Jurídica y Operativa del Fondo de Reserva ({formatCurrency(reserveData.totalFRLI)})</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-panel, #ffffff)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>👥 Pasivo Laboral (LFT México)</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ef4444', marginTop: '0.2rem' }}>{formatCurrency(reserveData.pasivoLaboralTotal)}</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>3 meses de indemnización + partes proporcionales</div>
            </div>
            <div style={{ background: 'var(--bg-panel, #ffffff)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>🏢 Penalización Arrendamiento</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f97316', marginTop: '0.2rem' }}>{formatCurrency(reserveData.penalizacionRenta)}</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>2 meses estimados de cancelación anticipada</div>
            </div>
            <div style={{ background: 'var(--bg-panel, #ffffff)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>📦 Pasivos con Proveedores</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#eab308', marginTop: '0.2rem' }}>{formatCurrency(reserveData.pasivosProveedores)}</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>Cuentas por pagar a corto plazo indispensables</div>
            </div>
            <div style={{ background: 'var(--bg-panel, #ffffff)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>⚖️ Cierre Notarial & Fiscal (SAT)</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#6366f1', marginTop: '0.2rem' }}>{formatCurrency(reserveData.gastosCierreLegalFiscal)}</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>Acta de disolución y cancelación de RFC/IMSS</div>
            </div>
          </div>
        </div>
      )}

      {/* Selector de Estrategia: Quema Planeada (Amazon) vs Flujo Orgánico */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.05)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Flame size={18} style={{ color: '#6366f1' }} />
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                Estrategia de Quema de Capital (Burn Rate)
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #64748b)', display: 'block' }}>
                ¿El plan contempla operar en pérdida deliberada para ganar mercado antes de monetizar?
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsPlannedBurn(false)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: !isPlannedBurn ? '#6366f1' : 'transparent',
                color: !isPlannedBurn ? '#ffffff' : 'var(--text-secondary, #64748b)',
                transition: 'all 0.2s'
              }}
            >
              Orgánico (Flujo Inmediato)
            </button>
            <button
              type="button"
              onClick={() => setIsPlannedBurn(true)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: isPlannedBurn ? '#6366f1' : 'transparent',
                color: isPlannedBurn ? '#ffffff' : 'var(--text-secondary, #64748b)',
                transition: 'all 0.2s'
              }}
            >
              🚀 Quema Planeada (Estilo Amazon / J-Curve)
            </button>
          </div>
        </div>

        {isPlannedBurn && (
          <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
              Horizonte de Quema Tolerada: <strong>{plannedMonths} meses</strong>
            </span>
            <input
              type="range"
              min="1"
              max="24"
              value={plannedMonths}
              onChange={(e) => setPlannedMonths(Number(e.target.value))}
              style={{ flex: 1, minWidth: '180px', accentColor: '#6366f1' }}
            />
            <span style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 700 }}>
              El sistema no disparará alertas rojas hasta después del mes {plannedMonths}.
            </span>
          </div>
        )}
      </div>

      {/* Banner de Diagnóstico del Semáforo Cuántico */}
      <div style={{
        background: `${analysis.badgeColor}10`,
        borderLeft: `4px solid ${analysis.badgeColor}`,
        borderRadius: '8px',
        padding: '0.85rem 1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        {analysis.phase === 'VERDE' ? (
          <CheckCircle2 size={20} style={{ color: analysis.badgeColor, flexShrink: 0 }} />
        ) : (
          <AlertTriangle size={20} style={{ color: analysis.badgeColor, flexShrink: 0 }} />
        )}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary, #0f172a)', lineHeight: '1.4' }}>
          <strong>{analysis.phaseName}: </strong>
          {analysis.alertMessage}
        </div>
      </div>

      {/* Acordeón del Protocolo de Cierre en 3 Fases */}
      <div>
        <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Protocolo Cuántico de Escalamiento y Cierre Digno (Checklist Operativo)
        </h5>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {protocolPhases.map((proto) => {
            const isExpanded = expandedPhase === proto.phase;
            return (
              <div
                key={proto.phase}
                style={{
                  border: `1px solid ${proto.isActive ? proto.color : 'var(--border-color, #e2e8f0)'}`,
                  background: proto.isActive ? `${proto.color}08` : 'transparent',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  transition: 'all 0.2s'
                }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedPhase(isExpanded ? null : proto.phase)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: proto.color }}></div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                      {proto.title}
                    </span>
                    {proto.isActive && (
                      <span style={{ fontSize: '0.65rem', background: proto.color, color: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                        FASE ACTUAL
                      </span>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isExpanded && (
                  <div style={{ padding: '0.75rem 1rem 1rem 1.5rem', borderTop: '1px solid rgba(128,128,128,0.1)', fontSize: '0.78rem' }}>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary, #64748b)', lineHeight: '1.6' }}>
                      {proto.acciones.map((acc, idx) => (
                        <li key={idx} style={{ marginBottom: '0.35rem' }}>
                          {acc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
