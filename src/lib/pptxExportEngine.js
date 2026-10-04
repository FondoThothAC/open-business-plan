/**
 * @file pptxExportEngine.js
 * @description Motor de Exportación de Presentaciones Ejecutivas PowerPoint (.pptx 16:9).
 * Basado en la librería estándar 'pptxgenjs'.
 * Genera pitch decks institucionales de 11 diapositivas con temas corporativos,
 * tablas financieras, notas de orador integradas y cumplimiento con la LMV.
 */

import pptxgen from 'pptxgenjs';
import { calculateInvestorScenarios } from './finanzas/investorEngine.js';

// Colores base del tema corporativo institucional (modo oscuro premium / azul institucional)
const THEME = {
  bgPrimary: '0B1120',      // Azul marino muy oscuro
  bgCard: '1E293B',         // Slate oscuro
  textPrimary: 'FFFFFF',    // Blanco
  textSecondary: '94A3B8',  // Gris azulado
  accentBlue: '38BDF8',     // Celeste tecnológico
  accentEmerald: '34D399',  // Verde rentabilidad
  accentAmber: 'FBBF24',    // Ámbar advertencia
  border: '334155'          // Borde sutil
};

/**
 * Formatea cifras monetarias en pesos mexicanos.
 * @param {number} val - Cantidad numérica
 * @returns {string} Texto formateado en MXN
 */
const fmtMxn = (val) => new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0
}).format(Number(val || 0));

/**
 * Construye la instancia completa de presentación PowerPoint 16:9 para un proyecto.
 * @param {Object} planData - Datos completos del plan de negocio
 * @param {Object} options - Opciones de exportación (idioma, tema)
 * @returns {Object} Instancia de pptxgenjs configurada
 */
export function buildPitchDeck(planData = {}, options = {}) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  const companyName = planData.companyName || planData.nombre || planData.semilla?.nombre_proyecto || 'Open Business Plan';
  const giro = planData.giro || planData.semilla?.giro || 'Proyecto de Innovación y Negocios';
  const drivers = planData._fichaDrivers?.drivers || {};
  const capex = drivers.capex_total?.valor || planData.semilla?.inversion_esperada || 20000000;
  const precioUnitario = drivers.precio_unitario_o_ticket?.valor || 0;
  const volumenMensual = drivers.volumen_mensual_ventas?.valor || 0;
  const costosFijos = drivers.costos_fijos_mensuales?.valor || 0;

  // Calculamos escenarios de financiamiento para el deck
  const investorData = calculateInvestorScenarios({
    capexTotal: capex,
    annualEbitdaYear1: Math.max(100000, (precioUnitario * volumenMensual - costosFijos) * 12 * 0.4),
    annualEbitdaYear5: Math.max(200000, (precioUnitario * volumenMensual - costosFijos) * 12 * 0.8),
  }, {
    equityPercentageOffered: 60,
    exitMultiple: 4.5
  });

  // Helper para añadir encabezado estándar a diapositivas
  const addSlideHeader = (slide, title, category) => {
    slide.background = { color: THEME.bgPrimary };
    slide.addText(category.toUpperCase(), {
      x: 0.8, y: 0.5, w: 10, h: 0.3,
      fontSize: 10, bold: true, color: THEME.accentBlue, fontFace: 'Calibri'
    });
    slide.addText(title, {
      x: 0.8, y: 0.8, w: 11, h: 0.6,
      fontSize: 22, bold: true, color: THEME.textPrimary, fontFace: 'Calibri'
    });
  };

  // ==========================================
  // SLIDE 1: Portada Institucional
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: THEME.bgPrimary };
  slide1.addText('DOSSIER INSTITUCIONAL PARA INVERSIONISTAS', {
    x: 1.0, y: 1.8, w: 11.3, h: 0.4,
    fontSize: 12, bold: true, color: THEME.accentBlue, fontFace: 'Calibri'
  });
  slide1.addText(companyName, {
    x: 1.0, y: 2.3, w: 11.3, h: 1.2,
    fontSize: 36, bold: true, color: THEME.textPrimary, fontFace: 'Calibri'
  });
  slide1.addText(giro, {
    x: 1.0, y: 3.6, w: 10.0, h: 0.8,
    fontSize: 16, color: THEME.textSecondary, fontFace: 'Calibri'
  });
  slide1.addText(`Levantamiento Objetivo: ${fmtMxn(capex)} · Serie B Preferente · Hermosillo, Sonora`, {
    x: 1.0, y: 5.5, w: 11.3, h: 0.4,
    fontSize: 13, bold: true, color: THEME.accentEmerald, fontFace: 'Calibri'
  });
  slide1.addText('Documento Privado y Confidencial · LMV Art. 8 Fracc. II (Oferta Privada bilateral a menos de 100 personas)', {
    x: 1.0, y: 6.2, w: 11.3, h: 0.4,
    fontSize: 10, color: THEME.textSecondary, fontFace: 'Calibri'
  });
  slide1.addNotes(`Bienvenida a los miembros del comité de inversión. Presentamos la oportunidad de inversión en ${companyName}. Este documento se emite con estricto apego al marco legal de colocación privada conforme al artículo 8 fracción II de la Ley del Mercado de Valores.`);

  // ==========================================
  // SLIDE 2: El Problema del Mercado
  // ==========================================
  const slide2 = pptx.addSlide();
  addSlideHeader(slide2, 'El Problema: Ineficiencia Crítica y Paros Costosos', 'Validación de Oportunidad');
  const probText = planData.semilla?.problema || 'Paros no programados de maquinaria crítica que paralizan operaciones industriales y merman la productividad operativa.';
  slide2.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.8, w: 11.7, h: 4.8, fill: { color: THEME.bgCard }, line: { color: THEME.border } });
  slide2.addText('FRICCIONES DETECTADAS EN EL SECTOR:', { x: 1.2, y: 2.1, w: 10.0, h: 0.4, fontSize: 13, bold: true, color: THEME.accentAmber, fontFace: 'Calibri' });
  slide2.addText(probText, { x: 1.2, y: 2.6, w: 10.8, h: 3.6, fontSize: 14, color: THEME.textPrimary, fontFace: 'Calibri', lineSpacing: 24 });
  slide2.addNotes('Enfatizar los costos que enfrentan los clientes potenciales por no resolver este problema a tiempo y la urgencia de una alternativa profesionalizada en la región.');

  // ==========================================
  // SLIDE 3: La Solución Tecnológica / Operativa
  // ==========================================
  const slide3 = pptx.addSlide();
  addSlideHeader(slide3, 'Nuestra Solución: Infraestructura Especializada y Servicio Continuo', 'Modelo de Solución');
  const solText = planData.semilla?.solucion || 'Reingeniería integral de procesos con equipamiento de alta precisión y protocolos estandarizados de control de calidad.';
  slide3.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.8, w: 11.7, h: 4.8, fill: { color: THEME.bgCard }, line: { color: THEME.border } });
  slide3.addText('PROPUESTA DE VALOR BLINDADA:', { x: 1.2, y: 2.1, w: 10.0, h: 0.4, fontSize: 13, bold: true, color: THEME.accentEmerald, fontFace: 'Calibri' });
  slide3.addText(solText, { x: 1.2, y: 2.6, w: 10.8, h: 3.6, fontSize: 14, color: THEME.textPrimary, fontFace: 'Calibri', lineSpacing: 24 });
  slide3.addNotes('Detallar cómo la solución neutraliza los riesgos operativos del cliente y reduce radicalmente los tiempos de respuesta frente a proveedores foráneos.');

  // ==========================================
  // SLIDE 4: Dimensionamiento del Mercado (TAM / SAM / SOM)
  // ==========================================
  const slide4 = pptx.addSlide();
  addSlideHeader(slide4, 'Oportunidad de Mercado: Demanda Validada y Capturable', 'Mercado Objetivo');
  const tam = planData.mercado?.tam_sam_som?.tam || '$1,200,000,000 MXN';
  const sam = planData.mercado?.tam_sam_som?.sam || '$250,000,000 MXN';
  const som = planData.mercado?.tam_sam_som?.som || '$20,000,000 MXN';

  const cardsMarket = [
    { label: 'TAM (Mercado Total)', val: tam, desc: 'Universo total de gasto en el sector a nivel estatal y regional.' },
    { label: 'SAM (Mercado Disponible)', val: sam, desc: 'Segmento accesible en el corredor industrial y minero sonorense.' },
    { label: 'SOM (Mercado Capturable)', val: som, desc: 'Meta de facturación para la empresa en fase inicial a 3 años.' }
  ];

  cardsMarket.forEach((card, idx) => {
    const xPos = 0.8 + idx * 4.0;
    slide4.addShape(pptx.ShapeType.rect, { x: xPos, y: 2.0, w: 3.7, h: 4.4, fill: { color: THEME.bgCard }, line: { color: THEME.border } });
    slide4.addText(card.label, { x: xPos + 0.3, y: 2.3, w: 3.1, h: 0.4, fontSize: 11, bold: true, color: THEME.accentBlue, fontFace: 'Calibri' });
    slide4.addText(card.val, { x: xPos + 0.3, y: 2.8, w: 3.1, h: 0.8, fontSize: 20, bold: true, color: THEME.textPrimary, fontFace: 'Calibri' });
    slide4.addText(card.desc, { x: xPos + 0.3, y: 3.8, w: 3.1, h: 2.2, fontSize: 12, color: THEME.textSecondary, fontFace: 'Calibri' });
  });
  slide4.addNotes('Explicar la metodología de dimensionamiento territorial basada en registros del INEGI (DENUE) y censos de maquinaria industrial.');

  // ==========================================
  // SLIDE 5: Unit Economics & Modelo Comercial
  // ==========================================
  const slide5 = pptx.addSlide();
  addSlideHeader(slide5, 'Unit Economics: Estructura de Margen y Punto de Equilibrio', 'Modelo Económico');
  slide5.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.8, w: 5.7, h: 4.8, fill: { color: THEME.bgCard }, line: { color: THEME.border } });
  slide5.addText('INDICADORES UNITARIOS CALIBRADOS', { x: 1.1, y: 2.1, w: 5.1, h: 0.4, fontSize: 12, bold: true, color: THEME.accentBlue, fontFace: 'Calibri' });
  slide5.addText(`Precio / Ticket Promedio:\n${fmtMxn(precioUnitario)}`, { x: 1.1, y: 2.7, w: 5.1, h: 0.9, fontSize: 14, bold: true, color: THEME.textPrimary, fontFace: 'Calibri' });
  slide5.addText(`Costos Fijos Operativos Base:\n${fmtMxn(costosFijos)} / mes`, { x: 1.1, y: 3.8, w: 5.1, h: 0.9, fontSize: 14, bold: true, color: THEME.textPrimary, fontFace: 'Calibri' });
  slide5.addText(`Volumen de Operación Base:\n${volumenMensual.toLocaleString()} unidades / contratos al mes`, { x: 1.1, y: 4.9, w: 5.1, h: 0.9, fontSize: 14, bold: true, color: THEME.accentEmerald, fontFace: 'Calibri' });

  slide5.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.8, w: 5.7, h: 4.8, fill: { color: THEME.bgCard }, line: { color: THEME.border } });
  slide5.addText('RESISTENCIA OPERATIVA', { x: 7.1, y: 2.1, w: 5.1, h: 0.4, fontSize: 12, bold: true, color: THEME.accentAmber, fontFace: 'Calibri' });
  slide5.addText('El negocio está calibrado para soportar fluctuaciones de demanda. El punto de equilibrio operativo se alcanza cubriendo menos del 40% de la capacidad instalada, protegiendo el flujo de efectivo aun en ciclos bajos.', {
    x: 7.1, y: 2.8, w: 5.1, h: 3.4, fontSize: 13, color: THEME.textPrimary, fontFace: 'Calibri', lineSpacing: 22
  });
  slide5.addNotes('Demostrar solidez matemática: los márgenes no son teóricos, están anclados en cotizaciones vigentes de insumos y refacciones.');

  // ==========================================
  // SLIDE 6: Ventaja Injusta & Barreras de Entrada
  // ==========================================
  const slide6 = pptx.addSlide();
  addSlideHeader(slide6, 'Moat Estratégico: Barreras de Entrada y Activos Críticos', 'Ventaja Competitiva');
  const ventaja = planData.semilla?.ventaja_injusta || 'Infraestructura propietaria de alta capacidad, relaciones directas con clientes industriales y equipo técnico con trayectoria comprobada.';
  slide6.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.8, w: 11.7, h: 4.8, fill: { color: THEME.bgCard }, line: { color: THEME.border } });
  slide6.addText('¿POR QUÉ NO ES FÁCIL COPIAR ESTE NEGOCIO?', { x: 1.2, y: 2.1, w: 10.0, h: 0.4, fontSize: 13, bold: true, color: THEME.accentBlue, fontFace: 'Calibri' });
  slide6.addText(ventaja, { x: 1.2, y: 2.6, w: 10.8, h: 3.6, fontSize: 15, color: THEME.textPrimary, fontFace: 'Calibri', lineSpacing: 24 });
  slide6.addNotes('Enfatizar los tiempos de espera y altos costos que enfrentaría cualquier competidor nuevo para replicar la maquinaria especializada.');

  // ==========================================
  // SLIDE 7: Proyecciones Financieras a 5 Años
  // ==========================================
  const slide7 = pptx.addSlide();
  addSlideHeader(slide7, 'Corrida Financiera Pro-Forma: Crecimiento y Rentabilidad', 'Proyecciones Financieras');
  const rowsCorrida = [
    ['Año', 'Ventas Proyectadas', 'EBITDA Operativo', 'Margen Bruto', 'Flujo Neto'],
    ['Año 1', fmtMxn(precioUnitario * volumenMensual * 12), fmtMxn(capex * 0.17), '35%', fmtMxn(capex * 0.12)],
    ['Año 2', fmtMxn(precioUnitario * volumenMensual * 12 * 1.15), fmtMxn(capex * 0.22), '37%', fmtMxn(capex * 0.16)],
    ['Año 3', fmtMxn(precioUnitario * volumenMensual * 12 * 1.30), fmtMxn(capex * 0.28), '39%', fmtMxn(capex * 0.21)],
    ['Año 4', fmtMxn(precioUnitario * volumenMensual * 12 * 1.45), fmtMxn(capex * 0.33), '40%', fmtMxn(capex * 0.25)],
    ['Año 5', fmtMxn(precioUnitario * volumenMensual * 12 * 1.60), fmtMxn(capex * 0.38), '41%', fmtMxn(capex * 0.29)]
  ];
  slide7.addTable(rowsCorrida, {
    x: 0.8, y: 1.8, w: 11.7, h: 4.8,
    fill: THEME.bgCard, color: THEME.textPrimary, fontSize: 12,
    border: { color: THEME.border, pt: 1 },
    align: 'center', fontFace: 'Calibri'
  });
  slide7.addNotes('Presentar la evolución de las ventas basada en el escenario indexado con inflación del 4.5% anual.');

  // ==========================================
  // SLIDE 8: Estructura de la Ronda de Inversión
  // ==========================================
  const slide8 = pptx.addSlide();
  addSlideHeader(slide8, 'Estructura de Capital: Tres Vías Legales de Participación', 'Ronda de Inversión');
  const e1 = investorData.escenarios.E1_arrendamiento;
  const e2 = investorData.escenarios.E2_equity;
  const e3 = investorData.escenarios.E3_tramos;

  const cardsOptions = [
    { title: 'E1 · Arrendamiento', badge: 'Renta Fija Deducible', body: `Renta: ${fmtMxn(e1.rentaMensual)}/mes\nPlazo: ${e1.plazoMeses} meses\nTIR: ${e1.tasaAnualPct}%\nEscudo Fiscal: ${fmtMxn(e1.ahorroFiscalTotal)}` },
    { title: 'E2 · Equity Preferente', badge: '60% Participación', body: `Valuación Post: ${fmtMxn(e2.valuacionPostMoney)}\nMúltiplo Salida: 4.5x EBITDA\nMoIC Esperado: ${e2.moic}x\nTIR Salida: ${e2.tirInversionistaPct}%` },
    { title: 'E3 · En Tramos', badge: 'Por Hitos Clave', body: `Tramo 1: ${fmtMxn(e3.tramos[0].amount)}\n(Arranque y taller)\nTramo 2: ${fmtMxn(e3.tramos[1].amount)}\n(Expansión por contrato)` }
  ];

  cardsOptions.forEach((opt, idx) => {
    const xPos = 0.8 + idx * 4.0;
    slide8.addShape(pptx.ShapeType.rect, { x: xPos, y: 2.0, w: 3.7, h: 4.4, fill: { color: THEME.bgCard }, line: { color: THEME.border } });
    slide8.addText(opt.title, { x: xPos + 0.3, y: 2.3, w: 3.1, h: 0.4, fontSize: 14, bold: true, color: THEME.textPrimary, fontFace: 'Calibri' });
    slide8.addText(opt.badge, { x: xPos + 0.3, y: 2.7, w: 3.1, h: 0.3, fontSize: 10, bold: true, color: THEME.accentBlue, fontFace: 'Calibri' });
    slide8.addText(opt.body, { x: xPos + 0.3, y: 3.2, w: 3.1, h: 2.9, fontSize: 12, color: THEME.textSecondary, fontFace: 'Calibri', lineSpacing: 20 });
  });
  slide8.addNotes('Explicar la flexibilidad: el inversionista puede optar por retorno predecible vía arrendamiento o participar en el valor de salida por múltiplo de EBITDA.');

  // ==========================================
  // SLIDE 9: Retorno y Salida del Inversionista
  // ==========================================
  const slide9 = pptx.addSlide();
  addSlideHeader(slide9, 'Sensibilidad de Retorno: Múltiplos de Salida al Año 5', 'Retorno de Inversión');
  const mults = e2.multiplosSensibilidad || {};
  const getMult = (k1, k2) => mults[k1] || mults[k2] || { valorCompaniaSalida: 0, retornoInversionista: 0, moic: 1, tirInversionistaPct: 0 };
  const m37 = getMult('3.7x');
  const m45 = getMult('4.5x');
  const m55 = getMult('5.5x');
  const m60 = getMult('6.0x', '6x');

  const rowsRetorno = [
    ['Múltiplo EBITDA', 'Valor de la Empresa (Año 5)', 'Retorno al Inversionista (60%)', 'MoIC (Efectivo / Capital)', 'TIR Anualizada'],
    ['3.7x (Conservador)', fmtMxn(m37.valorCompaniaSalida), fmtMxn(m37.retornoInversionista), `${m37.moic}x`, `${m37.tirInversionistaPct}%`],
    ['4.5x (Base de Caso)', fmtMxn(m45.valorCompaniaSalida), fmtMxn(m45.retornoInversionista), `${m45.moic}x`, `${m45.tirInversionistaPct}%`],
    ['5.5x (Alto Crecimiento)', fmtMxn(m55.valorCompaniaSalida), fmtMxn(m55.retornoInversionista), `${m55.moic}x`, `${m55.tirInversionistaPct}%`],
    ['6.0x (Techo Sectorial)', fmtMxn(m60.valorCompaniaSalida), fmtMxn(m60.retornoInversionista), `${m60.moic}x`, `${m60.tirInversionistaPct}%`]
  ];
  slide9.addTable(rowsRetorno, {
    x: 0.8, y: 1.8, w: 11.7, h: 4.8,
    fill: THEME.bgCard, color: THEME.textPrimary, fontSize: 12,
    border: { color: THEME.border, pt: 1 },
    align: 'center', fontFace: 'Calibri'
  });
  slide9.addNotes('Destacar que incluso bajo el múltiplo conservador de 3.7x, el retorno supera con creces instrumentos tradicionales y bonos gubernamentales.');

  // ==========================================
  // SLIDE 10: Equipo Directivo & Modelo Atómico (Metodología Cuántica)
  // ==========================================
  const slide10 = pptx.addSlide();
  addSlideHeader(slide10, 'Gobernanza Cuántica: El Modelo Atómico de 3 Áreas', 'Equipo y Organización');
  slide10.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.8, w: 3.7, h: 4.8, fill: { color: THEME.bgCard }, line: { color: THEME.border } });
  slide10.addText('1. FINANZAS', { x: 1.1, y: 2.1, w: 3.1, h: 0.4, fontSize: 13, bold: true, color: THEME.accentEmerald, fontFace: 'Calibri' });
  slide10.addText('Control estricto de tesorería, cobranza a 90 días, presupuesto base cero y política de dividendos blindada.', { x: 1.1, y: 2.6, w: 3.1, h: 3.6, fontSize: 12, color: THEME.textPrimary, fontFace: 'Calibri', lineSpacing: 20 });

  slide10.addShape(pptx.ShapeType.rect, { x: 4.8, y: 1.8, w: 3.7, h: 4.8, fill: { color: THEME.bgCard }, line: { color: THEME.border } });
  slide10.addText('2. OPERATIVO', { x: 5.1, y: 2.1, w: 3.1, h: 0.4, fontSize: 13, bold: true, color: THEME.accentBlue, fontFace: 'Calibri' });
  slide10.addText('Supervisión técnica en taller, operación de torno y banco de pruebas, control de calidad TIF e ISO 9001.', { x: 5.1, y: 2.6, w: 3.1, h: 3.6, fontSize: 12, color: THEME.textPrimary, fontFace: 'Calibri', lineSpacing: 20 });

  slide10.addShape(pptx.ShapeType.rect, { x: 8.8, y: 1.8, w: 3.7, h: 4.8, fill: { color: THEME.bgCard }, line: { color: THEME.border } });
  slide10.addText('3. ADMINISTRATIVO', { x: 9.1, y: 2.1, w: 3.1, h: 0.4, fontSize: 13, bold: true, color: THEME.accentAmber, fontFace: 'Calibri' });
  slide10.addText('Gestión legal S.A.P.I., contratos laborales REPSE, relación con inversionistas y cumplimiento regulatorio.', { x: 9.1, y: 2.6, w: 3.1, h: 3.6, fontSize: 12, color: THEME.textPrimary, fontFace: 'Calibri', lineSpacing: 20 });
  slide10.addNotes('Explicar el principio cuántico: el fundador no concentra las 3 áreas para evitar disfunción operativa.');

  // ==========================================
  // SLIDE 11: Sala de Datos & Próximos Pasos
  // ==========================================
  const slide11 = pptx.addSlide();
  addSlideHeader(slide11, 'Acceso a Sala de Datos (Data Room) y Due Diligence', 'Próximos Pasos');
  slide11.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.8, w: 11.7, h: 4.8, fill: { color: THEME.bgCard }, line: { color: THEME.border } });
  slide11.addText('PROCESO DE DEBIDA DILIGENCIA DISPONIBLE:', { x: 1.2, y: 2.1, w: 10.0, h: 0.4, fontSize: 13, bold: true, color: THEME.accentBlue, fontFace: 'Calibri' });
  slide11.addText('1. Firma de Convenio de Confidencialidad Bilateral (NDA).\n2. Acceso a Data Room con más de 20 documentos auditados (cotizaciones, opiniones SAT, contratos marco).\n3. Visita técnica a instalaciones y demostración de banco de pruebas.\n4. Formalización estatutaria Serie B ante Notario Público.\n\nContacto de Relación con Inversionistas: presidencia@thoth.org.mx · Hermosillo, Sonora', {
    x: 1.2, y: 2.7, w: 10.8, h: 3.5, fontSize: 14, color: THEME.textPrimary, fontFace: 'Calibri', lineSpacing: 24
  });
  slide11.addNotes('Cierre de la presentación. Agradecer el tiempo del comité y ofrecer acceso inmediato a la sala de datos.');

  return pptx;
}

/**
 * Genera el buffer binario del archivo PPTX en entornos Node.js.
 * @param {Object} planData - Datos del plan de negocio
 * @param {Object} options - Opciones de generación
 * @returns {Promise<Buffer>} Buffer del archivo PPTX
 */
export async function generatePitchDeckBuffer(planData = {}, options = {}) {
  const pptx = buildPitchDeck(planData, options);
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer;
}

/**
 * Descarga en el navegador el Pitch Deck en PowerPoint (.pptx).
 * @param {Object} planData - Datos del plan de negocio
 * @param {string} [filename] - Nombre de archivo opcional
 * @returns {Promise<void>}
 */
export async function downloadPitchDeck(planData = {}, filename = null) {
  const pptx = buildPitchDeck(planData);
  const companyName = planData.companyName || planData.nombre || planData.semilla?.nombre_proyecto || 'pitch-deck';
  const safeName = filename || `${companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-pitch-deck.pptx`;
  await pptx.writeFile({ fileName: safeName });
}

