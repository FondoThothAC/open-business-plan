/**
 * LegalComplianceChecker - Validador de Cumplimiento Legal, Constitución y Contratos
 * Fuentes: Anatomy of a Business Plan (Legal Ch.), Plan de Negocios VF (p. 34), Manual Panamá (p. 15).
 */

export class LegalComplianceChecker {
  /**
   * Checklist de constitución y trámites corporativos
   */
  static getConstitutionChecklist(country = 'MX') {
    if (country === 'MX') {
      return [
        { paso: 1, tarea: 'Autorización de denominación o razón social (SE)', tiempo: '24 a 48 horas', estado: 'Completado' },
        { paso: 2, tarea: 'Protocolización de Acta Constitutiva ante Notario/Corredor (S.A.P.I. de C.V.)', tiempo: '3 a 5 días', estado: 'Completado' },
        { paso: 3, tarea: 'Inscripción en Registro Público de la Propiedad y del Comercio (RPPC)', tiempo: '5 a 10 días', estado: 'Completado' },
        { paso: 4, tarea: 'Obtención de RFC y e.firma de Persona Moral ante SAT', tiempo: 'Inmediato (con cita)', estado: 'Completado' },
        { paso: 5, tarea: 'Apertura de Cuenta Bancaria Corporativa y depósito de capital', tiempo: '3 a 5 días', estado: 'Completado' },
        { paso: 6, tarea: 'Alta Patronal e Inscripción en IMSS / INFONAVIT', tiempo: '5 días hábiles', estado: 'En proceso' },
        { paso: 7, tarea: 'Licencia de Funcionamiento y Uso de Suelo Municipal', tiempo: '2 a 3 semanas', estado: 'En proceso' },
        { paso: 8, tarea: 'Aviso de Protección Civil y Manifiesto Ambiental NOM-161', tiempo: '2 semanas', estado: 'En proceso' }
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
        { clausula: '1. Garantía de Calidad y Presión de Trabajo', detalle: 'Certificación de mangueras bajo norma SAE 100R12 / ISO 3862 con factor de seguridad 4:1.' },
        { clausula: '2. Lead Time y Stock de Seguridad Back-to-Back', detalle: 'Compromiso del proveedor de mantener inventario en consignación o entrega <48 horas.' },
        { clausula: '3. Penalización por Retraso Operativo', detalle: 'Descuento del 2% por día de retraso que afecte el SLA de disponibilidad del cliente minero.' },
        { clausula: '4. Confidencialidad y No Competencia (NDA)', detalle: 'Protección estricta de telemetría de fallas y bases de datos de clientes.' }
      ],
      citation: 'Starting a Business QuickStart Guide (Ch. 11): Contratos de Suministro y SLA.'
    };
  }
}
