/**
 * @file dataRoomSchema.js
 * @description Esquema de Sala de Datos (Data Room Checklist) para rondas de inversión en OBP.
 * Provee la lista estructurada de debida diligencia legal, financiera y técnica
 * conforme a los estándares de comités de inversión y fondos de capital privado.
 */

export const DATA_ROOM_SECTIONS = [
  {
    id: 'corporativo',
    nombre: '1. Corporativo y Societario',
    descripcion: 'Documentos constitutivos, estatutos y estructura accionaria.',
    items: [
      { id: 'corp_01', nombre: 'Acta Constitutiva y Estatutos Sociales vigentes (S.A.P.I. de C.V.)', obligatorio: true },
      { id: 'corp_02', nombre: 'Inscripción en el Registro Público de Comercio (RPC / Folio Mercantil)', obligatorio: true },
      { id: 'corp_03', nombre: 'Libro de Registro de Acciones y Libro de Actas de Asamblea', obligatorio: true },
      { id: 'corp_04', nombre: 'Tabla de Capitalización (Cap Table) auditada y sin dilución oculta', obligatorio: true },
      { id: 'corp_05', nombre: 'Convenio de Accionistas (SHA) con cláusulas Drag-Along / Tag-Along (LMV art. 16)', obligatorio: false }
    ]
  },
  {
    id: 'financiero',
    nombre: '2. Financiero y Fiscal',
    descripcion: 'Corridas pro-forma, estados financieros y cumplimiento tributario.',
    items: [
      { id: 'fin_01', nombre: 'Modelo Financiero Pro-Forma a 5 Años con Ficha de Drivers y Sensibilidades', obligatorio: true },
      { id: 'fin_02', nombre: 'Opinión de Cumplimiento de Obligaciones Fiscales positiva (SAT 32-D)', obligatorio: true },
      { id: 'fin_03', nombre: 'Constancia de Situación Fiscal (CSF) actualizada', obligatorio: true },
      { id: 'fin_04', nombre: 'Estados Financieros auditados o reportes contables preliminares', obligatorio: true },
      { id: 'fin_05', nombre: 'Conciliación de Cifras y Auditoría Numérica anti-alucinaciones', obligatorio: true }
    ]
  },
  {
    id: 'operativo_tecnico',
    nombre: '3. Técnico, Activos y Operaciones',
    descripcion: 'Relación de maquinaria, especificaciones técnicas y capacidad.',
    items: [
      { id: 'op_01', nombre: 'Lista de Maquinaria y Equipos (CAPEX) con cotizaciones o facturas de adquisición', obligatorio: true },
      { id: 'op_02', nombre: 'Contrato de arrendamiento o escrituras de nave industrial / taller', obligatorio: true },
      { id: 'op_03', nombre: 'Manuales de operación, hojas de procesos y diagramas de flujo de taller', obligatorio: false },
      { id: 'op_04', nombre: 'Especificaciones técnicas de telemetría / IoT y arquitectura de datos', obligatorio: false }
    ]
  },
  {
    id: 'comercial',
    nombre: '4. Comercial y Clientes',
    descripcion: 'Validación de demanda, contratos marco y cartas de intención.',
    items: [
      { id: 'com_01', nombre: 'Cartas de Intención (LOI) o contratos marco de prestación de servicios', obligatorio: true },
      { id: 'com_02', nombre: 'Tabulador oficial de precios de venta y servicios unitarios', obligatorio: true },
      { id: 'com_03', nombre: 'Estudio de mercado territorial y benchmarking de competidores directos', obligatorio: true },
      { id: 'com_04', nombre: 'Pitch Deck Ejecutivo (.pptx 16:9) actualizado con notas de orador', obligatorio: true }
    ]
  },
  {
    id: 'legal_laboral',
    nombre: '5. Regulatorio, Laboral y Seguridad',
    descripcion: 'Cumplimiento con LFT, IMSS, REPSE y Normas Oficiales Mexicanas.',
    items: [
      { id: 'leg_01', nombre: 'Registro Patronal ante el IMSS y comprobante de pago de cuotas obrero-patronales', obligatorio: true },
      { id: 'leg_02', nombre: 'Registro en el Padrón de Servicios Especializados (REPSE) si aplica', obligatorio: false },
      { id: 'leg_03', nombre: 'Contratos individuales de trabajo con cláusulas de confidencialidad e IP', obligatorio: true },
      { id: 'leg_04', nombre: 'Cumplimiento de NOMs de seguridad laboral (ej. NOM-017-STPS-2024, NOM-004-STPS)', obligatorio: true }
    ]
  }
];

/**
 * Genera el estado inicial del Data Room para un proyecto.
 * @param {Object} planData - Datos del plan
 * @returns {Array<Object>} Lista de secciones con estados de avance
 */
export function generateProjectDataRoom(planData = {}) {
  return DATA_ROOM_SECTIONS.map(sec => ({
    ...sec,
    items: sec.items.map(item => ({
      ...item,
      completado: false,
      documentoAdjunto: null,
      fechaActualizacion: null
    }))
  }));
}
