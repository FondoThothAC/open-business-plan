import React, { useMemo, useState } from 'react';
import { 
  Briefcase, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  FolderCheck, 
  Presentation, 
  ChevronDown, 
  ChevronUp, 
  Coins, 
  Scale 
} from 'lucide-react';
import { 
  calculateInvestorScenarios, 
  validateLMVCompliance 
} from '../lib/finanzas/investorEngine';
import { auditProjectFigures } from '../lib/finanzas/auditorCifras';
import { DATA_ROOM_SECTIONS, generateProjectDataRoom } from '../lib/finanzas/dataRoomSchema';
import { downloadPitchDeck } from '../lib/pptxExportEngine';

/**
 * Formatea un número como moneda en pesos mexicanos (MXN).
 * @param {number} val - Monto a formatear
 * @returns {string} Cadena formateada
 */
function formatearMoneda(val) {
  const num = Number(val);
  if (!Number.isFinite(num)) return '$0 MXN';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Formatea un número como porcentaje con un decimal.
 * @param {number} val - Valor porcentual
 * @returns {string} Cadena formateada
 */
function formatearPorcentaje(val) {
  const num = Number(val);
  if (!Number.isFinite(num)) return '0.0%';
  return `${num.toFixed(1)}%`;
}

/**
 * Panel interactivo para visualización del Dossier de Inversionistas,
 * auditoría numérica de narrativa vs pro-forma, y exportación a PowerPoint.
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.planData - Datos completos del plan de negocio
 * @param {Object} props.financialData - Datos financieros calculados
 */
export default function InvestorDossierPanel({ planData = {}, financialData = null }) {
  const [activeTab, setActiveTab] = useState('modelos');
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [showAuditDetails, setShowAuditDetails] = useState(false);

  // 1. Extraer variables financieras base
  const capex = useMemo(() => {
    return Number(
      planData?.config?.fichaDrivers?.capexTotal ||
      financialData?.capex ||
      financialData?.inversionInicial ||
      20000000
    );
  }, [planData, financialData]);

  const ebitdaY1 = useMemo(() => {
    return Number(
      financialData?.projections?.ebitda?.[0] ||
      financialData?.ebitda ||
      3400000
    );
  }, [financialData]);

  const ebitdaY5 = useMemo(() => {
    return Number(
      financialData?.projections?.ebitda?.[4] ||
      ebitdaY1 * 2
    );
  }, [financialData, ebitdaY1]);

  // 2. Ejecutar motor de escenarios de inversión
  const investorData = useMemo(() => {
    const customTramos = planData?.config?.fichaDrivers?.capexTramos?.map(t => ({
      id: t.tramo,
      name: `Tramo ${t.tramo}: ${t.concepto}`,
      amount: t.monto,
      milestone: t.concepto
    }));

    return calculateInvestorScenarios(
      {
        capexTotal: capex,
        annualEbitdaYear1: ebitdaY1,
        annualEbitdaYear5: ebitdaY5
      },
      {
        leaseTermMonths: 60,
        interestRateAnnual: 12,
        equityPercentageOffered: 60,
        exitMultiple: 4.5,
        investorCount: planData?.config?.fichaDrivers?.numeroInversionistas || 20,
        minTicket: planData?.config?.fichaDrivers?.ticketMinimo || 1000000,
        tranches: customTramos
      }
    );
  }, [capex, ebitdaY1, ebitdaY5, planData]);

  const e1 = investorData.escenarios.E1_arrendamiento;
  const e2 = investorData.escenarios.E2_equity;
  const e3 = investorData.escenarios.E3_tramos;
  const lmvData = investorData.complianceLMV;

  // 3. Auditoría Numérica de Coherencia
  const auditoria = useMemo(() => {
    return auditProjectFigures(planData, {});
  }, [planData]);

  // 4. Progreso de Sala de Datos
  const dataRoomSections = useMemo(() => {
    return generateProjectDataRoom(planData);
  }, [planData]);

  const dataRoomStats = useMemo(() => {
    let total = 0;
    let obligatorios = 0;
    DATA_ROOM_SECTIONS.forEach(s => {
      s.items.forEach(i => {
        total++;
        if (i.obligatorio) obligatorios++;
      });
    });
    return { total, obligatorios };
  }, []);

  // Manejador de descarga de PPTX
  const handleDownloadPptx = async () => {
    try {
      setIsExportingPptx(true);
      await downloadPitchDeck(planData);
    } catch (err) {
      console.error('[InvestorDossierPanel] Error al generar PowerPoint:', err);
      alert('Ocurrió un error al generar el Pitch Deck PPTX. Revise la consola del navegador.');
    } finally {
      setIsExportingPptx(false);
    }
  };

  return (
    <div 
      className="investor-dossier-panel no-print"
      style={{
        marginTop: '2.5rem',
        marginBottom: '2.5rem',
        borderRadius: '16px',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid #334155',
        color: '#f8fafc',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}
    >
      {/* Cabecera del Panel */}
      <div 
        style={{
          padding: '1.75rem 2rem',
          borderBottom: '1px solid #334155',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          background: 'rgba(15, 23, 42, 0.7)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div 
            style={{
              padding: '0.65rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
            }}
          >
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Dossier de Inversionistas & Auditoría Numérica LMV
              </h3>
              <span 
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: 'rgba(14, 165, 233, 0.2)',
                  color: '#38bdf8',
                  border: '1px solid rgba(14, 165, 233, 0.4)'
                }}
              >
                Grado Institucional
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Estructuración de capital, deducción fiscal de arrendamiento, salida por múltiplos y debida diligencia.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadPptx}
          disabled={isExportingPptx}
          style={{
            height: '42px',
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0 1.25rem',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            cursor: isExportingPptx ? 'wait' : 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Descargar presentación comercial completa en formato PowerPoint editable 16:9"
        >
          <Presentation className="w-4 h-4" />
          <span>{isExportingPptx ? 'Generando PowerPoint...' : 'Descargar Pitch Deck (.pptx)'}</span>
        </button>
      </div>

      {/* Franja de Semáforos: LMV y Cero Cifras Huérfanas */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          padding: '1.25rem 2rem',
          background: 'rgba(30, 41, 59, 0.5)',
          borderBottom: '1px solid #334155'
        }}
      >
        {/* Semáforo LMV */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: lmvData.isCompliant ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${lmvData.isCompliant ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}
        >
          {lmvData.isCompliant ? (
            <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: lmvData.isCompliant ? '#34d399' : '#f87171' }}>
                Cumplimiento LMV Art. 8 Fracc. II
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {lmvData.investorCount} inversionistas (Boleto: {formatearMoneda(lmvData.effectiveTicket)})
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#e2e8f0', margin: '2px 0 0 0', lineHeight: 1.3 }}>
              {lmvData.isCompliant 
                ? 'Colocación privada válida (< 100 personas). No requiere autorización previa de la CNBV.' 
                : lmvData.alerts[0] || 'Se superó el tope legal de inversionistas para colocación privada.'}
            </p>
          </div>
        </div>

        {/* Semáforo Auditoría Numérica */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: auditoria.status === 'CLEAN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${auditoria.status === 'CLEAN' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
          }}
        >
          {auditoria.status === 'CLEAN' ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: auditoria.status === 'CLEAN' ? '#34d399' : '#fbbf24' }}>
                Auditoría "Cero Cifras Huérfanas"
              </span>
              <button
                onClick={() => setShowAuditDetails(!showAuditDetails)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <span>{showAuditDetails ? 'Ocultar' : 'Ver detalle'}</span>
                {showAuditDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#e2e8f0', margin: '2px 0 0 0', lineHeight: 1.3 }}>
              {auditoria.resumen}
            </p>
          </div>
        </div>
      </div>

      {/* Detalle Desplegable de Auditoría */}
      {showAuditDetails && (
        <div style={{ padding: '1rem 2rem', background: '#0b1120', borderBottom: '1px solid #334155' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
            Desglose de Hallazgos de la Auditoría Numérica ({auditoria.discrepanciesCount} hallazgos):
          </h4>
          {auditoria.discrepanciesCount === 0 ? (
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              No se detectaron discrepancias entre las memorias de cálculo, nómina y los textos explicativos.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {auditoria.discrepancies.map((disc, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    borderLeft: '3px solid #f59e0b',
                    fontSize: '0.8rem'
                  }}
                >
                  <strong style={{ color: '#fbbf24' }}>{disc.tipo} ({disc.severidad}): </strong>
                  <span style={{ color: '#e2e8f0' }}>{disc.mensaje}</span>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                    Texto detectado: <code>{disc.valorNarrativa}</code> | Modelo: <code>{disc.valorModelo}</code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pestañas de Navegación del Dossier */}
      <div 
        style={{
          display: 'flex',
          borderBottom: '1px solid #334155',
          background: 'rgba(15, 23, 42, 0.4)',
          padding: '0 2rem'
        }}
      >
        <button
          onClick={() => setActiveTab('modelos')}
          style={{
            padding: '0.85rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'modelos' ? '2px solid #38bdf8' : '2px solid transparent',
            color: activeTab === 'modelos' ? '#38bdf8' : '#94a3b8',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Coins className="w-4 h-4" />
          <span>Estructuras de Capital (E1, E2, E3)</span>
        </button>

        <button
          onClick={() => setActiveTab('dataroom')}
          style={{
            padding: '0.85rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'dataroom' ? '2px solid #38bdf8' : '2px solid transparent',
            color: activeTab === 'dataroom' ? '#38bdf8' : '#94a3b8',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FolderCheck className="w-4 h-4" />
          <span>Sala de Datos ({dataRoomStats.total} Documentos)</span>
        </button>
      </div>

      {/* Contenido de la Pestaña Activa */}
      <div style={{ padding: '2rem' }}>
        {activeTab === 'modelos' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Tarjeta E1: Arrendamiento Financiero Deducible */}
            <div 
              style={{
                borderRadius: '12px',
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid #475569',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                      Esquema E1
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: '4px 0 0 0' }}>
                      Arrendamiento Puro (Leaseback)
                    </h4>
                  </div>
                  <Scale className="w-5 h-5 text-sky-400" />
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                  {e1.marcoLegal}
                </p>

                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#94a3b8' }}>Renta Mensual Estimada:</span>
                    <strong style={{ color: '#ffffff' }}>{formatearMoneda(e1.rentaMensual)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#94a3b8' }}>Ahorro Fiscal en ISR (30%):</span>
                    <strong style={{ color: '#34d399' }}>{formatearMoneda(e1.ahorroFiscalTotal)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#94a3b8' }}>Costo Neto Deducible:</span>
                    <strong style={{ color: '#e2e8f0' }}>{formatearMoneda(e1.costoNetoArrendamiento)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#94a3b8' }}>Plazo y Tasa Anual:</span>
                    <strong style={{ color: '#94a3b8' }}>{e1.plazoMeses} meses al {e1.tasaAnualPct}%</strong>
                  </div>
                </div>
              </div>

              <div 
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(2, 132, 199, 0.1)',
                  border: '1px solid rgba(2, 132, 199, 0.25)',
                  fontSize: '0.75rem',
                  color: '#bae6fd'
                }}
              >
                💡 {e1.ventajaPrincipal}
              </div>
            </div>

            {/* Tarjeta E2: Equity con Múltiplos EBITDA */}
            <div 
              style={{
                borderRadius: '12px',
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid #475569',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase' }}>
                      Esquema E2
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: '4px 0 0 0' }}>
                      Equity Serie B (Salida Año 5)
                    </h4>
                  </div>
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                  {e2.marcoLegal}
                </p>

                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#94a3b8' }}>Caso Base ({e2.multiploSalidaBase}x EBITDA):</span>
                    <strong style={{ color: '#ffffff' }}>{formatearMoneda(e2.valorEstimadoSalida)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#94a3b8' }}>MoIC Inversionista (Base):</span>
                    <strong style={{ color: '#a855f7' }}>{e2.moic}x</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#94a3b8' }}>TIR Inversionista (Base):</span>
                    <strong style={{ color: '#34d399' }}>{formatearPorcentaje(e2.tirInversionistaPct)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#94a3b8' }}>Escenario Optimista (5.5x):</span>
                    <strong style={{ color: '#38bdf8' }}>{e2.multiplosSensibilidad['5.5x']?.moic || '2.0'}x MoIC</strong>
                  </div>
                </div>
              </div>

              <div 
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  fontSize: '0.75rem',
                  color: '#e9d5ff'
                }}
              >
                📈 {e2.ventajaPrincipal}
              </div>
            </div>

            {/* Tarjeta E3: Despliegue por Tramos Escalonados */}
            <div 
              style={{
                borderRadius: '12px',
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid #475569',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                      Esquema E3
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: '4px 0 0 0' }}>
                      Financiamiento por Tramos (Milestones)
                    </h4>
                  </div>
                  <Layers className="w-5 h-5 text-amber-400" />
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                  {e3.marcoLegal}
                </p>

                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {e3.tramos.map((tranche, idx) => (
                    <div key={idx} style={{ padding: '0.5rem 0.65rem', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.5)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <strong style={{ color: '#f8fafc' }}>{tranche.name || `Tramo ${tranche.id}`}:</strong>
                        <span style={{ color: '#f59e0b' }}>{formatearMoneda(tranche.amount)}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                        {tranche.milestone}
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '4px' }}>
                    <span style={{ color: '#94a3b8' }}>Monto Global Requerido:</span>
                    <strong style={{ color: '#fbbf24' }}>{formatearMoneda(e3.montoTotal)}</strong>
                  </div>
                </div>
              </div>

              <div 
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  fontSize: '0.75rem',
                  color: '#fef3c7'
                }}
              >
                🛡️ {e3.ventajaPrincipal}
              </div>
            </div>
          </div>
        ) : (
          /* Pestaña: Sala de Datos (Data Room Due Diligence) */
          <div>
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Índice Maestro de Debida Diligencia (Due Diligence Checklist)
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Documentación formal para comités de inversión organizada en 5 pilares institucionales.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Total Documentos Requeridos:</span>
                <span 
                  style={{
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: '1px solid rgba(56, 189, 248, 0.4)'
                  }}
                >
                  {dataRoomStats.total} Documentos ({dataRoomStats.obligatorios} Obligatorios)
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {DATA_ROOM_SECTIONS.map((sec) => (
                <div 
                  key={sec.id}
                  style={{
                    borderRadius: '10px',
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid #475569',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <FolderCheck className="w-4 h-4 text-sky-400" />
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                      {sec.nombre}
                    </h5>
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {sec.items.map((item) => (
                      <li 
                        key={item.id}
                        style={{
                          fontSize: '0.78rem',
                          color: '#cbd5e1',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                          lineHeight: 1.3
                        }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div>{item.nombre}</div>
                          {item.obligatorio && (
                            <span style={{ fontSize: '0.68rem', color: '#f59e0b' }}>* Requerido</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
