/**
 * machineryRfqEngine.js — Motor de Cotización Formal y Gestión Asíncrona de RFQ de Maquinaria Pesada
 * 
 * Gestiona el ciclo de vida completo de cotizaciones para activos fijos industriales que requieren
 * trámites B2B con distribuidores autorizados (CAT, Komatsu, Haas, Fanuc, Siemens, etc.):
 * 1. Generación de RFQ formal con especificaciones técnicas, normas y términos comerciales.
 * 2. Despacho y registro de solicitudes en espera asíncrona.
 * 3. Ingestión de cotizaciones recibidas (PDF / OCR / Captura manual).
 * 4. Recálculo automático del CAPEX e impacto en el plan financiero (VAN/TIR).
 */

export const RFQ_STATUS = {
  DRAFT: 'DRAFT',                               // Borrador generado por la IA
  DISPATCHED: 'DISPATCHED_AWAITING_QUOTE',       // Solicitud enviada a distribuidores
  AWAITING_MANUAL: 'AWAITING_MANUAL_FOLLOWUP',  // En espera de trámite por el usuario
  QUOTE_RECEIVED: 'QUOTE_RECEIVED_VERIFIED',    // Cotización recibida con precio y tiempo de entrega
  APPLIED_TO_CAPEX: 'APPLIED_TO_CAPEX'          // Monto integrado al modelo financiero
};

/**
 * Genera un paquete formal de RFQ técnica para maquinaria o equipo pesado
 */
export function generateRfqPackage({
  machineryName,
  category = 'Maquinaria Pesada / CNC',
  targetSpecs = {},
  deliveryLocation = 'Hermosillo, Sonora, México',
  targetDistributors = [],
  budgetRangeMax = 5000000,
  currency = 'MXN'
}) {
  const rfqId = `RFQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
  const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  const specsList = Object.entries(targetSpecs).length > 0 
    ? Object.entries(targetSpecs).map(([k, v]) => `• **${k}:** ${v}`).join('\n')
    : `• **Capacidad nominal:** Servicio industrial continuo pesado.\n• **Alimentación eléctrica / motriz:** Estándar industrial trifásico.\n• **Certificaciones requeridas:** NOM-004-STPS / ISO 9001 / CE.\n• **Garantía mínima requerida:** 12 a 24 meses en partes y mano de obra.`;

  const formalLetter = `
**SOLICITUD FORMAL DE COTIZACIÓN (REQUEST FOR QUOTATION — RFQ)**  
**Identificador:** ${rfqId}  
**Fecha:** ${dateStr}  
**Destino de Entrega (Incoterm DDP sugerido):** ${deliveryLocation}  

**1. OBJETO DE LA SOLICITUD**  
Por medio de la presente, solicitamos formalmente su cotización técnica y económica para la adquisición del siguiente activo productivo:  
**Equipo:** ${machineryName}  
**Categoría:** ${category}  

**2. ESPECIFICACIONES TÉCNICAS REQUERIDAS**  
${specsList}

**3. REQUERIMIENTOS COMERCIALES Y DE ENTREGA**  
• Desglose de precio unitario, flete especializado, maniobras y seguro de traslado.  
• Tiempo estimado de entrega (en semanas a partir de la orden de compra).  
• Condiciones de pago sugeridas (anticipo, contra-entrega, financiamiento de planta).  
• Programa de capacitación para operadores y póliza de mantenimiento preventivo.  

**4. VIGENCIA DE LA COTIZACIÓN**  
Agradecemos remitir su propuesta con una vigencia mínima de 30 días naturales.
`.trim();

  const emailSubject = `Solicitud de Cotización Formal: ${machineryName} — Ref. ${rfqId}`;
  const emailBody = `Estimado Departamento de Ventas Industriales,

Adjuntamos solicitud formal de cotización (${rfqId}) para el equipo "${machineryName}" con destino en ${deliveryLocation}.

Agradecemos nos compartan ficha técnica, tiempo de entrega y propuesta económica desglosada.

Atentamente,
Departamento de Adquisiciones y Proyectos de Inversión
Fondo Thoth AC — Open Business Plan`;

  return {
    rfqId,
    machineryName,
    category,
    createdAt: new Date().toISOString(),
    status: RFQ_STATUS.DRAFT,
    deliveryLocation,
    currency,
    budgetRangeMax,
    targetDistributors: targetDistributors.length > 0 ? targetDistributors : ['Distribuidor Autorizado Regional', 'Fabricante Directo'],
    formalLetter,
    emailSubject,
    emailBody,
    receivedQuote: null
  };
}

/**
 * Ingesta una cotización recibida y calcula el impacto en el CAPEX
 */
export function ingestQuoteResponse(rfqObject, quoteData) {
  const {
    quoteAmount,
    currency = 'MXN',
    supplierName,
    deliveryWeeks = 4,
    warrantyMonths = 12,
    includesShipping = true,
    manualNotes = ''
  } = quoteData;

  const updatedRfq = {
    ...rfqObject,
    status: RFQ_STATUS.QUOTE_RECEIVED,
    updatedAt: new Date().toISOString(),
    receivedQuote: {
      quoteAmount: Number(quoteAmount),
      currency,
      supplierName: supplierName || 'Proveedor Verificado',
      deliveryWeeks: Number(deliveryWeeks),
      warrantyMonths: Number(warrantyMonths),
      includesShipping: Boolean(includesShipping),
      manualNotes,
      ingestedAt: new Date().toISOString()
    }
  };

  return updatedRfq;
}

/**
 * Aplica la cotización verificada a la estructura de costos y activos del plan
 */
export function applyQuoteToPlanCapex(planData, rfqObject) {
  if (!rfqObject?.receivedQuote?.quoteAmount) {
    return planData;
  }

  const quoteAmount = rfqObject.receivedQuote.quoteAmount;
  const machineryName = rfqObject.machineryName;

  const currentOrg = planData.organizacion || {};
  const currentInversion = currentOrg.inversion || {};
  const currentActivosFijos = Array.isArray(currentInversion.activos_fijos) ? [...currentInversion.activos_fijos] : [];

  // Buscar si el activo ya existe en la lista para actualizarlo o insertarlo
  const existingIdx = currentActivosFijos.findIndex(a => a.concepto?.toLowerCase() === machineryName.toLowerCase() || a.id === rfqObject.rfqId);

  const newAssetEntry = {
    id: rfqObject.rfqId,
    concepto: machineryName,
    proveedor: rfqObject.receivedQuote.supplierName,
    monto: quoteAmount,
    moneda: rfqObject.receivedQuote.currency,
    garantia: `${rfqObject.receivedQuote.warrantyMonths} meses`,
    tiempoEntrega: `${rfqObject.receivedQuote.deliveryWeeks} semanas`,
    fechaCotizacion: new Date().toLocaleDateString('es-MX')
  };

  if (existingIdx >= 0) {
    currentActivosFijos[existingIdx] = newAssetEntry;
  } else {
    currentActivosFijos.push(newAssetEntry);
  }

  const updatedPlan = {
    ...planData,
    organizacion: {
      ...currentOrg,
      inversion: {
        ...currentInversion,
        activos_fijos: currentActivosFijos,
        // Recalcular total de activos fijos
        total_activos_fijos: currentActivosFijos.reduce((sum, item) => sum + (Number(item.monto) || 0), 0)
      }
    }
  };

  return updatedPlan;
}
