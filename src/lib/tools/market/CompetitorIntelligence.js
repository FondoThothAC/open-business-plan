/**
 * CompetitorIntelligence - Motor de Análisis de Competencia y Posicionamiento Estratégico
 * Fuentes: Starting a Business QuickStart Guide (Five Forces), Creating a Business Plan For Dummies (Ch. 5), The Lean Startup (p. 89).
 */

export class CompetitorIntelligence {
  /**
   * Genera el análisis de las 5 Fuerzas de Porter
   */
  static buildPorterFiveForces({
    rivalidadActual = 'Media',
    amenazaNuevos = 'Baja',
    poderProveedores = 'Medio',
    poderCompradores = 'Alto',
    amenazaSustitutos = 'Baja'
  } = {}) {
    return {
      fuerzas: [
        {
          nombre: '1. Rivalidad entre Competidores Existentes',
          nivel: rivalidadActual,
          descripcion: 'Presencia de talleres convencionales de mangueras sin tecnología IoT predictiva.',
          estrategiaMitigacion: 'Diferenciación por modelo MaaS con tiempo de respuesta <2h garantizado.'
        },
        {
          nombre: '2. Amenaza de Nuevos Entrantes',
          nivel: amenazaNuevos,
          descripcion: 'Barreras de entrada altas por inversión en banco de pruebas de 40,000 PSI y certificaciones.',
          estrategiaMitigacion: 'Consolidar contratos multi-anuales con mineras clave.'
        },
        {
          nombre: '3. Poder de Negociación de los Proveedores',
          nivel: poderProveedores,
          descripcion: 'Fabricantes OEM globales de mangueras (Parker, Gates, Manuli).',
          estrategiaMitigacion: 'Alianzas directas de distribución autorizada y compras por volumen.'
        },
        {
          nombre: '4. Poder de Negociación de los Clientes',
          nivel: poderCompradores,
          descripcion: 'Grandes corporativos mineros con altos estándares y comités de compras formales.',
          estrategiaMitigacion: 'Demostración cuantificable de reducción de paros no programados ($15k USD/hora).'
        },
        {
          nombre: '5. Amenaza de Productos o Servicios Sustitutos',
          nivel: amenazaSustitutos,
          descripcion: 'Mantenimiento reactivo interno realizado por las propias cuadrillas de la mina.',
          estrategiaMitigacion: 'Externalización más económica y confiable con telemetría en tiempo real.'
        }
      ],
      atractivoMercado: 'Alto (Sector Industrial Especializado con Barreras de Entrada)',
      citation: 'Starting a Business QuickStart Guide (Ch. 5): Michael Porter 5 Forces Framework.'
    };
  }

  /**
   * Genera la matriz comparativa de competencia (Benchmarking)
   */
  static buildComparisonMatrix(ourBrand = 'Comercio Cuántico (CCI)', competitors = []) {
    const defaultCompetitors = [
      {
        nombre: 'Talleres Hidráulicos Tradicionales',
        tipo: 'Competidor Directo Local',
        precio: 'Medio',
        tecnologiaIoT: 'Nula (Reactivo)',
        tiempoRespuesta: '24 a 48 horas',
        garantiaCeroParos: 'No',
        calificacion: 3.2
      },
      {
        nombre: 'Distribuidores de Mostrador OEM',
        tipo: 'Competidor Indirecto',
        precio: 'Alto',
        tecnologiaIoT: 'Básica',
        tiempoRespuesta: '12 a 24 horas',
        garantiaCeroParos: 'No',
        calificacion: 3.8
      }
    ];

    const compList = Array.isArray(competitors) && competitors.length > 0 ? competitors : defaultCompetitors;

    const ourProfile = {
      nombre: ourBrand,
      tipo: 'Nuestra Propuesta de Valor',
      precio: 'Competitivo (MaaS Mensual)',
      tecnologiaIoT: 'Avanzada (Parker SensoNODE)',
      tiempoRespuesta: '< 2 horas en mina',
      garantiaCeroParos: 'Sí (Blindaje Operativo)',
      calificacion: 4.9
    };

    return {
      ourProfile,
      competitors: compList,
      ventajaEstrategicaPrincipal: 'Modelo MaaS Predictivo con banco de pruebas propio y SLA garantizado.',
      citation: 'Creating a Business Plan For Dummies (Ch. 5): Matriz de Benchmarking Competitivo.'
    };
  }

  /**
   * Genera las coordenadas del mapa de posicionamiento (Océano Azul)
   */
  static buildPositioningMap(competitors = []) {
    // Eje X: Modelo de Cobro (0 = Venta Reactiva de Piezas, 100 = MaaS / Servicio Integral)
    // Eje Y: Nivel Tecnológico e IoT (0 = Taller Manual, 100 = Telemetría Predictiva)
    return {
      ejeX: 'Modelo de Valor (Transaccional vs MaaS Integral)',
      ejeY: 'Tecnología Predictiva & IoT (Básica vs SensoNODE 4.0)',
      posiciones: [
        { nombre: 'Nuestra Empresa', x: 90, y: 92, cuadrante: 'Líder Océano Azul (MaaS + IoT)' },
        { nombre: 'Talleres Locales', x: 25, y: 20, cuadrante: 'Transaccional Tradicional' },
        { nombre: 'Distribuidores OEM', x: 45, y: 55, cuadrante: 'Venta Mayorista' },
        ...(competitors.map((c, i) => ({
          nombre: c.nombre || `Competidor ${i + 1}`,
          x: c.x || 30,
          y: c.y || 30,
          cuadrante: 'Competencia Convencional'
        })))
      ],
      citation: 'The Lean Startup (p. 89): Posicionamiento y Océano Azul.'
    };
  }
}
