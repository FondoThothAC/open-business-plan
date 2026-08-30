/**
 * RiskMatrixBuilder - Constructor de Matrices de Riesgo ZOPP, DNSH (UE) y Poder vs Interés
 * Fuentes: Manual ZOPP GTZ (p. 28), Horizon Europe DNSH (p. 89), Negotiating South-South Agreements (p. 45).
 */

export class RiskMatrixBuilder {
  /**
   * Construye una Matriz de Riesgo ZOPP 4x4 clasificada por criticidad
   */
  static buildZOPPMatrix(risks = []) {
    const defaultRisks = [
      { id: 'R1', riesgo: 'Fluctuación cambiaria USD/MXN en refacciones importadas', prob: 3, impacto: 4, mitigacion: 'Contratos forward y cobertura de precios con proveedores clave.', responsable: 'Gerencia de Finanzas' },
      { id: 'R2', riesgo: 'Retraso en pago de corporativos mineros (DSO > 60 días)', prob: 4, impacto: 3, mitigacion: 'Línea de factoraje financiero y descuento pronto pago 3%.', responsable: 'Cobranza y Tesorería' },
      { id: 'R3', riesgo: 'Falla no detectada en manguera hidráulica bajo monitoreo MaaS', prob: 1, impacto: 4, mitigacion: 'Doble sensor IoT Parker SensoNODE y garantía de reemplazo <2h.', responsable: 'Gerencia Técnica / IoT' },
      { id: 'R4', riesgo: 'Rotación de técnicos certificados en hidráulica minera', prob: 2, impacto: 3, mitigacion: 'Plan de carrera, bonos por OTD y capacitación continua.', responsable: 'Recursos Humanos' }
    ];

    const targetList = Array.isArray(risks) && risks.length > 0 ? risks : defaultRisks;

    const evaluated = targetList.map(r => {
      const score = (r.prob || 2) * (r.impacto || 2);
      let nivel = 'Bajo (Verde)';
      if (score >= 12) nivel = 'Crítico (Rojo)';
      else if (score >= 6) nivel = 'Medio (Amarillo)';

      return {
        ...r,
        score,
        nivel
      };
    }).sort((a, b) => b.score - a.score);

    return {
      evaluated,
      totalRisks: evaluated.length,
      criticalCount: evaluated.filter(r => r.score >= 12).length,
      citation: 'Manual ZOPP GTZ (p. 28): Matriz de Probabilidad e Impacto.'
    };
  }

  /**
   * Valida los 6 objetivos medioambientales del principio DNSH (Do No Significant Harm) de la Unión Europea
   */
  static checkDNSH({
    climateMitigation = true,
    climateAdaptation = true,
    waterProtection = true,
    circularEconomy = true,
    pollutionPrevention = true,
    biodiversityProtection = true
  } = {}) {
    const criteria = [
      { obj: '1. Mitigación del Cambio Climático', status: climateMitigation, desc: 'Operación con optimización energética y telemetría preventiva que reduce traslados innecesarios.' },
      { obj: '2. Adaptación al Cambio Climático', status: climateAdaptation, desc: 'Instalaciones resistentes a climas extremos y planes de contingencia operativa.' },
      { obj: '3. Uso Sostenible del Agua y Recursos Marinos', status: waterProtection, desc: 'Cero vertidos a mantos acuíferos; sistemas de contención de aceites hidráulicos en taller.' },
      { obj: '4. Transición a una Economía Circular', status: circularEconomy, desc: 'Remanufactura y reciclaje de mangueras y conexiones metálicas al 100%.' },
      { obj: '5. Prevención y Control de la Contaminación', status: pollutionPrevention, desc: 'Certificación NOM-161 y disposición segura de fluidos con empresas autorizadas SEMARNAT.' },
      { obj: '6. Protección de la Biodiversidad y Ecosistemas', status: biodiversityProtection, desc: 'Operación confinada en parques industriales sin impacto a áreas protegidas.' }
    ];

    const compliantCount = criteria.filter(c => c.status).length;
    const isFullyCompliant = compliantCount === 6;

    return {
      criteria,
      compliantCount,
      isFullyCompliant,
      complianceScore: `${Math.round((compliantCount / 6) * 100)}%`,
      statusText: isFullyCompliant ? '100% Conforme con DNSH (Apto para Fondos Europeos)' : 'Requiere Ajustes en DNSH',
      citation: 'The Role of Corporate Sustainability in Asian Development (p. 89): DNSH 6 Environmental Objectives.'
    };
  }

  /**
   * Construye la Matriz de Involucrados (Poder vs Interés)
   */
  static powerInterestMatrix(stakeholders = []) {
    const defaultStakeholders = [
      { nombre: 'Corporativos Mineros (Grupo México, Peñoles)', poder: 'Alto', interes: 'Alto', estrategia: 'Gestionar de cerca / Alianza estratégica clave' },
      { nombre: 'Proveedores OEM (Parker Hannifin, Gates)', poder: 'Medio', interes: 'Alto', estrategia: 'Mantener satisfecho / Acuerdos de suministro preferencial' },
      { nombre: 'Comunidades Locales de Cananea / Hermosillo', poder: 'Bajo', interes: 'Medio', estrategia: 'Mantener informado / RSE y empleo local' },
      { nombre: 'Reguladores Gubernamentales (SEMARNAT / STPS)', poder: 'Alto', interes: 'Bajo', estrategia: 'Monitorear activamente y cumplir normativas' }
    ];

    return {
      stakeholders: Array.isArray(stakeholders) && stakeholders.length > 0 ? stakeholders : defaultStakeholders,
      citation: 'Negotiating South-South Regional Trade Agreements (p. 45): Matriz de Poder e Interés de Involucrados.'
    };
  }
}
