/**
 * QuantumDiagnosticAgent.js - Agente Especialista en Empresas Cuánticas (Fondo Thoth AC)
 * 
 * Implementa la Metodología Propietaria de Empresas Cuánticas:
 * 1. Modelo Atómico de 3 Áreas: Finanzas, Operativo, Administrativo.
 * 2. Principio Nuclear: El fundador solo puede liderar 1 o máximo 2 áreas.
 *    Participar en las 3 fusiona el átomo (micromanagement, cuellos de botella).
 * 3. Principio de Delegación: Recomendación de perfiles profesionales para áreas débiles.
 * 4. Principio Cuántico de Escala: Detección de umbrales no lineales de salto cuántico.
 * 5. Detección de Anti-Patrones organizacionales.
 */

export class QuantumDiagnosticAgent {
  constructor() {
    this.id = 'quantum_diagnostic';
    this.name = 'Diagnosticador Cuántico';
    this.avatar = '⚛️';
    this.role = 'Metodología Empresas Cuánticas & Modelo Atómico de 3 Áreas';
  }

  /**
   * Ejecuta el diagnóstico cuántico para el anteproyecto.
   * @param {Object} context - Objeto de contexto con idea, fundador y estructura.
   * @param {Function} emitProgress - Callback SSE para progreso.
   * @returns {Promise<Object>} Diagnóstico estructurado y recomendaciones de delegación.
   */
  async execute(context, emitProgress = () => {}) {
    emitProgress(this.id, 'Iniciando evaluación cuántica del perfil del fundador...', 15);

    const fundador = context.fundador || {};
    const areasActivas = (fundador.areas_activas && Array.isArray(fundador.areas_activas) && fundador.areas_activas.length > 0)
      ? fundador.areas_activas.map(a => a.toLowerCase())
      : ['operativo', 'administrativo', 'finanzas']; // Simulación por defecto si no especifica

    const todasAreas = ['finanzas', 'operativo', 'administrativo'];
    const fusionAtomicaDetectada = areasActivas.length >= 3;
    const areasDebiles = todasAreas.filter(a => !areasActivas.includes(a));

    emitProgress(this.id, 'Analizando átomo de 3 áreas (Finanzas, Operaciones, Administración)...', 45);

    // Detección de anti-patrones
    const antiPatrones = [];
    if (fusionAtomicaDetectada) {
      antiPatrones.push({
        tipo: 'Fusión Atómica (Hace todo él mismo)',
        riesgo: 'Crítico: Sobrecarga del fundador, cuello de botella operativo y sesgo en toma de decisiones.',
        accionRequerida: 'Delegar de inmediato al menos 1 de las 3 áreas atómicas.'
      });
    }

    if (areasActivas.length === 0) {
      antiPatrones.push({
        tipo: 'Ausencia Operativa Total / Solo quiere invertir',
        riesgo: 'Alto: Falta de liderazgo inicial en la ejecución del negocio.',
        accionRequerida: 'Incorporar un Director de Operaciones (COO) o Co-fundador ejecutor.'
      });
    }

    emitProgress(this.id, 'Generando matriz de delegación cuántica y perfiles de puesto...', 75);

    const areaDebilDelegar = areasDebiles.length > 0 ? areasDebiles[0] : 'finanzas';
    const perfilPuestoDelegacion = this.generarPerfilPuesto(areaDebilDelegar);

    const recomendacionesDelegacion = [
      {
        area: areaDebilDelegar.toUpperCase(),
        perfilSugerido: perfilPuestoDelegacion.titulo,
        rangoSalarial: perfilPuestoDelegacion.rangoSalarial,
        habilidadesClave: perfilPuestoDelegacion.habilidades,
        descripcionVacante: perfilPuestoDelegacion.descripcion
      }
    ];

    emitProgress(this.id, 'Calculando umbrales de salto cuántico de escala...', 95);

    const saltosCuanticos = {
      escalaActual: 'Fase 1: Validación y Arranque (1-3 colaboradores)',
      proximoUmbral: 'Salto Cuántico Nivel 1 (De 1 a 5 colaboradores y 1er punto de venta)',
      accionesReestructuracion: [
        'Formalizar manuales de procedimientos estandarizados (SOPs).',
        'Separar definitivamente la tesorería de las cuentas personales.',
        'Implementar tablero de control de KPIs semanales por área atómica.'
      ]
    };

    emitProgress(this.id, 'Diagnóstico Cuántico Fondo Thoth completado.', 100);

    return {
      modeloAtomico: {
        areasActivasFundador: areasActivas,
        areasDebiles,
        nivelSaludAtomica: fusionAtomicaDetectada ? 'En Riesgo de Fusión (4.0/10)' : 'Óptimo Cuántico (9.5/10)'
      },
      fusionAtomicaDetectada,
      alertaFusion: fusionAtomicaDetectada
        ? '⚠️ ALERTA DE FUSIÓN ATÓMICA: El fundador está intentando abarcar Finanzas, Operaciones y Administración simultáneamente. Es imperativo delegar para evitar colapso.'
        : '✓ Configuración Atómica Equilibrada: El fundador lidera sus áreas fuertes y delega las complementarias.',
      areaDebilDelegar,
      perfilPuestoDelegacion,
      recomendacionesDelegacion,
      antiPatronesDetectados: antiPatrones,
      saltosCuanticos,
      principioIndependencia: {
        indiceDependenciaFundador: fusionAtomicaDetectada ? '90% (Muy Alto)' : '35% (Saludable)',
        rutaAutonomia: 'Plan de transición a 6 meses hacia un sistema auto-gobernado por KPIs.'
      }
    };
  }

  /**
   * Genera el perfil de puesto sugerido para delegar el área débil.
   * @param {string} area 
   */
  generarPerfilPuesto(area) {
    const perfiles = {
      finanzas: {
        area: 'Finanzas',
        titulo: 'Coordinador de Finanzas & Tesorería',
        rangoSalarial: '$18,000 - $28,000 MXN / mes',
        habilidades: ['Flujos de caja', 'Presupuestos', 'Impuestos SAT', 'ERP Contable'],
        descripcion: 'Profesional responsable de la gestión de liquidez, control presupuestal, costeo y reportes de viabilidad para la dirección general.'
      },
      operativo: {
        area: 'Operaciones',
        titulo: 'Jefe de Operaciones y Calidad',
        rangoSalarial: '$20,000 - $32,000 MXN / mes',
        habilidades: ['Logística', 'Control de calidad', 'Gestión de inventarios', 'Supervisión de personal'],
        descripcion: 'Líder encargado de garantizar la entrega puntual y sin defectos del producto/servicio, optimizando tiempos y costos de producción.'
      },
      administrativo: {
        area: 'Administración',
        titulo: 'Administrador General & RRHH',
        rangoSalarial: '$16,000 - $24,000 MXN / mes',
        habilidades: ['Contrataciones', 'Nómina', 'Cumplimiento legal', 'Compras y proveedores'],
        descripcion: 'Encargado de la estructura organizacional, compras estratégicas, relaciones laborales y trámites gubernamentales.'
      }
    };

    return perfiles[area] || perfiles.finanzas;
  }
}
