/**
 * MachineryRfqModal.jsx — Modal de Gestión Asíncrona de RFQs y Cotizaciones de Maquinaria Pesada
 * 
 * Permite al usuario generar solicitudes formales de cotización para maquinaria industrial,
 * exportar la carta y correos para distribuidores, registrar respuestas recibidas y aplicar
 * el costo verificado directamente a la estructura de CAPEX del plan de negocios.
 */

import React, { useState } from 'react';
import { 
  FileText, Send, CheckCircle2, Clock, DollarSign, 
  Copy, X, Sparkles, Building2, ShieldCheck, ArrowRight, Upload
} from 'lucide-react';
import { 
  generateRfqPackage, 
  ingestQuoteResponse, 
  applyQuoteToPlanCapex, 
  RFQ_STATUS 
} from '../lib/tools/machineryRfqEngine';
import { usePlan } from '../context/PlanContext';

export default function MachineryRfqModal({ 
  isOpen, 
  onClose, 
  machineryItem = { name: 'Torno CNC Haas ST-20', category: 'Maquinaria Pesada / Maquinado' } 
}) {
  const { planData, setPlanData } = usePlan();

  const [rfq, setRfq] = useState(() => 
    generateRfqPackage({
      machineryName: machineryItem.name || 'Equipo Industrial Especializado',
      category: machineryItem.category || 'Activo Fijo Pesado',
      deliveryLocation: planData?.semilla?.cliente?.cliente_ubicacion || 'Hermosillo, Sonora'
    })
  );

  const [copiedText, setCopiedText] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    quoteAmount: '',
    supplierName: '',
    deliveryWeeks: '4',
    warrantyMonths: '12',
    currency: 'MXN',
    manualNotes: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleMarkDispatched = () => {
    setRfq(prev => ({
      ...prev,
      status: RFQ_STATUS.DISPATCHED
    }));
  };

  const handleApplyQuote = () => {
    if (!quoteForm.quoteAmount || isNaN(Number(quoteForm.quoteAmount))) {
      alert('Por favor ingresa un monto numérico válido para la cotización.');
      return;
    }

    const updatedRfq = ingestQuoteResponse(rfq, quoteForm);
    setRfq(updatedRfq);

    // Aplicar al CAPEX global
    const updatedPlan = applyQuoteToPlanCapex(planData, updatedRfq);
    setPlanData(updatedPlan);

    setSuccessMessage(`¡Cotización de $${Number(quoteForm.quoteAmount).toLocaleString()} ${quoteForm.currency} aplicada al CAPEX con éxito!`);
    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      padding: '1rem'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
        color: '#f8fafc'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.8)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              padding: '8px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff'
            }}>
              <Building2 size={20} />
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  Gestor de RFQ B2B: {rfq.machineryName}
                </h3>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: rfq.status === RFQ_STATUS.QUOTE_RECEIVED ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: rfq.status === RFQ_STATUS.QUOTE_RECEIVED ? '#10b981' : '#f59e0b',
                  border: `1px solid ${rfq.status === RFQ_STATUS.QUOTE_RECEIVED ? '#10b98144' : '#f59e0b44'}`
                }}>
                  {rfq.status}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Ref. {rfq.rfqId} · Solicitud formal de cotización industrial con recálculo de CAPEX
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Mensaje de Éxito */}
          {successMessage && (
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Estado de la Solicitud */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)', paddingRight: '0.75rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>1. Ficha Técnica</span>
              <strong style={{ fontSize: '0.82rem', color: '#10b981' }}>Generada por IA</strong>
            </div>
            <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)', paddingRight: '0.75rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>2. Solicitud a Distribuidores</span>
              <strong style={{ fontSize: '0.82rem', color: rfq.status !== RFQ_STATUS.DRAFT ? '#10b981' : '#f59e0b' }}>
                {rfq.status !== RFQ_STATUS.DRAFT ? 'Enviada / En Trámite' : 'Lista para Envío'}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>3. Impacto en CAPEX</span>
              <strong style={{ fontSize: '0.82rem', color: rfq.receivedQuote ? '#10b981' : '#94a3b8' }}>
                {rfq.receivedQuote ? `$${rfq.receivedQuote.quoteAmount.toLocaleString()} ${rfq.receivedQuote.currency}` : 'Pendiente de Cifra'}
              </strong>
            </div>
          </div>

          {/* Carta Formal y Plantilla de Correo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
            {/* Vista Previa de Carta RFQ */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} color="#f59e0b" /> Carta Formal RFQ
                </span>
                <button
                  onClick={() => handleCopy(rfq.formalLetter)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: copiedText ? '#10b981' : '#cbd5e1',
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={12} /> {copiedText ? 'Copiado' : 'Copiar Carta'}
                </button>
              </div>
              <pre style={{
                fontSize: '0.72rem',
                color: '#cbd5e1',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                maxHeight: '220px',
                overflowY: 'auto',
                lineHeight: '1.4',
                margin: 0
              }}>
                {rfq.formalLetter}
              </pre>
            </div>

            {/* Ingestión de Cotización Recibida */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '12px',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={14} color="#10b981" /> Registrar Cotización Recibida
              </span>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
                  Proveedor / Distribuidor:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Haas Automation México / CAT Maquinaria"
                  value={quoteForm.supplierName}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, supplierName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '0.78rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
                    Monto Cotizado (Sin IVA):
                  </label>
                  <input
                    type="number"
                    placeholder="Ej. 1850000"
                    value={quoteForm.quoteAmount}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, quoteAmount: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.78rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
                    Moneda:
                  </label>
                  <select
                    value={quoteForm.currency}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, currency: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '6px 4px',
                      borderRadius: '6px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.78rem'
                    }}
                  >
                    <option value="MXN">MXN</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
                    Entrega (semanas):
                  </label>
                  <input
                    type="number"
                    value={quoteForm.deliveryWeeks}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, deliveryWeeks: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.78rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
                    Garantía (meses):
                  </label>
                  <input
                    type="number"
                    value={quoteForm.warrantyMonths}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, warrantyMonths: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.78rem'
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleApplyQuote}
                style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <CheckCircle2 size={15} /> Aplicar al Plan (CAPEX)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.8)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={handleMarkDispatched}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#f59e0b',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Clock size={14} /> Marcar como Enviado a Distribuidores
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
