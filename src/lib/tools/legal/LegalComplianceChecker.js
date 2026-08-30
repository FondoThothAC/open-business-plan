/**
 * LegalComplianceChecker - Validador de Cumplimiento Legal, Constitución y Contratos
 * Fuentes: Anatomy of a Business Plan (Legal Ch.), Plan de Negocios VF (p. 34), Manual Panamá (p. 15).
 */

export const MEXICAN_TAX_RATES = {
  isrCorporativo: 0.30,
  ivaGeneral: 0.16,
  ivaFronteraNorte: 0.08,
  ptuUtilidades: 0.10,
  retencionDividendos: 0.10,
  imssPatronalPromedio: 0.22,
  infonavit: 0.05,
  isnEstatalPromedio: 0.03,
  factorSalarioRealMinimo: 1.30
};

export class LegalComplianceChecker {
  /**
   * Constantes fiscales de México
   */
  static getTaxRates() {
    return MEXICAN_TAX_RATES;
  }

  /**
   * Marco regulatorio y leyes aplicables de México
   */
  static getMexicanRegulatoryFramework() {
    return [
      { ley: 'LISR (Ley del Impuesto sobre la Renta)', articulos: 'Art. 9 (Tasa 30%), Art. 25, 27 (Deducciones), Art. 34-35 (Depreciación CAPEX)', materia: 'Fiscal / Impuestos' },
      { ley: 'LIVA & CFF (IVA y Código Fiscal)', articulos: 'LIVA Art. 1 (Tasa 16%), CFF Art. 29 (CFDI 4.0), Art. 32-D (Opinión Positiva)', materia: 'Facturación y Cumplimiento' },
      { ley: 'LFT (Ley Federal del Trabajo)', articulos: 'Art. 76 (Vacaciones 12d+), Art. 87 (Aguinaldo 15d), Art. 117 (PTU 10%), Art. 15 (REPSE)', materia: 'Laboral / Nómina' },
      { ley: 'LMV & LGSM (Sociedades y Mercado de Valores)', articulos: 'LMV Art. 12-19 (Régimen S.A.P.I. de C.V., Tag-Along, Drag-Along, Pactos Parasociales), LGSM Art. 6', materia: 'Corporativo / Inversión' },
      { ley: 'NOM-STPS (Seguridad Minera e Industrial)', articulos: 'NOM-023-STPS (Minas), NOM-004-STPS (Maquinaria/Presión 40k PSI), NOM-017-STPS (EPP)', materia: 'Seguridad Operativa' },
      { ley: 'LFPPI & LFDA (Propiedad Intelectual)', articulos: 'LFPPI Art. 170 (Marcas Clases 37/42), Art. 45 (Modelos Utilidad), LFDA Art. 101 (Software IoT)', materia: 'Propiedad Intelectual' },
      { ley: 'LGPGIR & LGEEPA (Medio Ambiente)', articulos: 'LGPGIR Art. 42 (Residuos Peligrosos/Aceites usados), LGEEPA Art. 28 (MIA), Principio DNSH', materia: 'Ambiental / ESG' },
      { ley: 'LIGIE (Ley de Impuestos de Importación y Exportación)', articulos: 'Cap. 40 (Mangueras 4009.22), Cap. 84/90 (Bancos de prueba, Sensores IoT), Reglas T-MEC, DTA', materia: 'Comercio Exterior / Aduanas' },
      { ley: 'CCom (Código de Comercio)', articulos: 'Art. 75, 78 (Actos de comercio y libertad contractual), Art. 362 (Mora comercial), Art. 89 (Firma electrónica)', materia: 'Mercantil / Contratos' },
      { ley: 'Ley Minera y Reglamento R103', articulos: 'Ley Minera Art. 6-19, R103 (Talleres móviles en bocamina/tajo, credencialización e inducción)', materia: 'Operación Minera' },
      { ley: 'Reforma STPS REPSE (DOF 24/05/2021)', articulos: 'Art. 15 LFT, Padrón REPSE, Requisitos de Especialización, Prohibición de Outsourcing simulado', materia: 'Servicios Especializados' }
    ];
  }

  /**
   * Checklist de constitución y trámites corporativos
   */
  static getConstitutionChecklist(country = 'MX') {
    if (country === 'MX') {
      return [
        { paso: 1, tarea: 'Autorización de denominación o razón social (Secretaría de Economía)', tiempo: '24 a 48 horas', estado: 'Completado' },
        { paso: 2, tarea: 'Protocolización de Acta Constitutiva ante Notario/Corredor (S.A.P.I. de C.V.)', tiempo: '3 a 5 días', estado: 'Completado' },
        { paso: 3, tarea: 'Inscripción en Registro Público de la Propiedad y del Comercio (RPPC)', tiempo: '5 a 10 días', estado: 'Completado' },
        { paso: 4, tarea: 'Obtención de RFC y e.firma de Persona Moral ante SAT (CFF Art. 27)', tiempo: 'Inmediato (con cita)', estado: 'Completado' },
        { paso: 5, tarea: 'Apertura de Cuenta Bancaria Corporativa y depósito de capital', tiempo: '3 a 5 días', estado: 'Completado' },
        { paso: 6, tarea: 'Alta Patronal e Inscripción en IMSS / INFONAVIT (LSS Art. 15)', tiempo: '5 días hábiles', estado: 'En proceso' },
        { paso: 7, tarea: 'Registro en el Padrón Público REPSE (STPS Art. 15 LFT para servicios mineros)', tiempo: '2 a 3 semanas', estado: 'En proceso' },
        { paso: 8, tarea: 'Registro como Generador de Residuos Peligrosos ante SEMARNAT (LGPGIR Art. 42)', tiempo: '2 semanas', estado: 'En proceso' }
      ];
    }

    return [
      { paso: 1, tarea: 'Reserva de Nombre Comercial y Pacto Social', tiempo: '3 días', estado: 'Completado' },
      { paso: 2, tarea: 'Registro Único de Contribuyente (RUC)', tiempo: '2 días', estado: 'Completado' },
      { paso: 3, tarea: 'Aviso de Operación Municipal', tiempo: '1 semana', estado: 'En proceso' }
    ];
  }

  /**
   * Clausulado maestro para contratos de proveedores y SLA de servicio
   */
  static getProviderContractTemplate() {
    return {
      clausulasClave: [
        { clausula: '1. Garantía de Calidad y Presión de Trabajo', detalle: 'Certificación de mangueras bajo norma SAE 100R12 / ISO 3862 con factor de seguridad 4:1 y NOM-004-STPS.' },
        { clausula: '2. Lead Time y Stock de Seguridad Back-to-Back', detalle: 'Compromiso del proveedor de mantener inventario en consignación o entrega <48 horas.' },
        { clausula: '3. Cumplimiento Fiscal y Laboral Estricto', detalle: 'Opinión positiva del SAT 32-D mensual y registro REPSE vigente ante STPS sin responsabilidad solidaria para el cliente.' },
        { clausula: '4. Penalización por Retraso Operativo', detalle: 'Descuento del 2% por día de retraso que afecte el SLA de disponibilidad del cliente minero.' },
        { clausula: '5. Confidencialidad y Propiedad Intelectual (NDA)', detalle: 'Protección estricta bajo LFPPI de telemetría de fallas, algoritmos IoT y bases de datos.' }
      ],
      citation: 'Starting a Business QuickStart Guide (Ch. 11) & LMV Art. 16: Contratos de Suministro, SLA y Pactos Parasociales.'
    };
  }
}
