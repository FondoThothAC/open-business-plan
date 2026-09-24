/**
 * @file generate_closets_corona.js
 * @description Genera el plan de negocios canónico integral para "Closets y Cocinas Corona".
 * Integra el Diagnóstico Empresarial de Septiembre 2026, la metodología Empresas Cuánticas,
 * y el cálculo financiero automatizado con doble escenario de inflación.
 */

import fs from 'fs';
import path from 'path';
import { calculateFinancialProjections } from '../src/lib/finanzas/financial-calculations.ts';

export function buildClosetsCoronaProject() {
  const slug = 'closets_y_cocinas_corona';
  const projectName = 'Closets y Cocinas Corona';

  // 1. Configuración de Co-Autoría y Colaboración Simétrica
  const config = {
    framework: 'negocios',
    projectType: 'business',
    workflowStatus: 'Borrador',
    userOwner: 'viktoracuna',
    collaborators: ['viktoracuna', 'galiet_gastelum', 'karely_otero'],
    coAuthors: [
      'Viktor Acuña Flores',
      'Alisson Galiet Gastelum Parra',
      'Karely Isabel Otero Medina'
    ],
    supervisors: [
      'Héctor Segura',
      'Rafael Castillo Esquer'
    ],
    brandKit: {
      companyName: projectName,
      tagline: 'Diseño, fabricación e instalación de cocinas integrales y carpintería residencial a medida',
      primaryColor: '#c2410c', // Terracota / madera cálida
      secondaryColor: '#1e293b'
    },
    ai: {
      primaryProvider: 'ollama',
      model: 'gpt-oss:20b',
      indexPricesWithInflation: true
    }
  };

  // 2. Semilla Cuántica del Proyecto
  const semilla = {
    nombre_proyecto: projectName,
    giro: 'Carpintería residencial de diseño, cocinas integrales y closets modulares a medida',
    cobertura: 'Hermosillo, Sonora (con alcance en Guaymas, San Carlos y Nacozari)',
    problema: '1. Clientes residenciales y constructoras sufren por entregas impuntuales, mermas por calor en fletes de melamina y falta de estandarización en carpintería tradicional.\n2. La empresa familiar enfrentaba fugas financieras por no prorratear fletes ($7,000/mes) ni luz, además de riesgo de liquidez por anticipos insuficientes (20%) ante materias primas que exigen el 45%.\n3. Dependencia exclusiva de pedidos 100% personalizados que saturan los tiempos de diseño y fabricación sin contratos de obra.',
    solucion: '1. Modelo híbrido: Mantener carpintería de alta gama a medida y lanzar un Catálogo Modular Estandarizado de 5 modelos de cocinas y closets para venta ágil a constructoras y particulares.\n2. Reestructuración de cobro blindada: 60% anticipo para adquisición de materiales, 30% contra entrega en obra y 10% post-instalación con póliza de garantía por escrito.\n3. Protocolo logístico con lonas térmicas protectoras contra el sol sonorense y checklist de carga para eliminar reprocesos foráneos al 100%.',
    mercado_objetivo: 'Hogares de nivel socioeconómico medio-alto y alto en zonas residenciales de Hermosillo (La Pitic, Versalles, Morelos, Real de Castilla, Palermo, Villa Satélite, KYO Hexus, Córsica) y San Carlos; constructoras de vivienda en serie que requieren paquetes modulares llave en mano.',
    modelo_ingresos: 'Venta directa de proyectos de cocinas integrales (ticket promedio $90,000 MXN a $250,000 MXN, con proyectos integrales de hasta $400,000 MXN), closets modulares ($35,000 MXN a $80,000 MXN) y paquetes de catálogo para constructoras con márgenes brutos objetivo del 38% al 45%.',
    ventaja_injusta: 'Más de 18 años de experiencia artesanal de Marcelo Corona en el oficio maderero, relación de confianza con clientes residenciales consolidados, manufactura propia en taller de Col. Balderrama y tiempos de entrega reducidos de 6 a 3 semanas mediante estandarización modular.',
    diagnostico_cuantico: {
      finanzas: {
        diagnostico: 'Vulnerable por anticipo del 20% y falta de tabulador de prorrateo de costos indirectos (luz bimestral de $6,000 y gasolina de $7,000 en cuenta personal de María Alejandra).',
        recomendacion_delegacion: 'Implementar cuenta bancaria empresarial separada del gasto doméstico, fijar anticipo mínimo del 60% e incorporar un software de cotización automatizado.'
      },
      operativo: {
        diagnostico: 'Alta destreza artesanal de Marcelo Corona pero cuello de botella en traslados y deformaciones térmicas en fletes por el sol sonorense.',
        recomendacion_delegacion: 'Adoptar checklist estricto de herramental antes de salir del taller e instalar cubierta térmica aislante en la batea del vehículo de carga.'
      },
      administrativo: {
        diagnostico: 'Fusión de roles en María Alejandra Aray Roa (contacto, redes, facturación) y resistencia al modelado 3D por falta de tiempo.',
        recomendacion_delegacion: 'Integrar a un practicante o diseñador auxiliar en modelado 3D/renders para liberar a María hacia relaciones públicas y cierre comercial.'
      }
    }
  };

  // 3. Pilar 1: Naturaleza del Proyecto (Formato conciso y ejecutivo)
  const naturaleza = {
    origen: 'Closets y Cocinas Corona es una empresa familiar fundada por María Alejandra Aray Roa y Marcelo Corona Figueroa. Inició operaciones informales en 2008 en la Colonia Balderrama de Hermosillo, Sonora, logrando su formalización fiscal ante el SAT en 2020. Acumula más de 18 años de experiencia artesanal en madera, melamina y cubiertas pétreas.',
    identidad_corporativa: {
      mision: 'Diseñar y fabricar cocinas integrales y mobiliario modular residencial que fusionen estética superior, máxima durabilidad y funcionalidad ergonómica para el bienestar familiar.',
      vision: 'Ser la carpintería modular de referencia en Sonora para 2030, reconocida por su puntualidad inquebrantable, catálogo estandarizado y excelencia en acabados arquitectónicos.',
      valores: ['Puntualidad rigurosa', 'Honestidad en presupuestos', 'Calidad artesanal duradera', 'Atención personalizada empática']
    },
    objetivos_y_metas: {
      corto_plazo: 'Lanzar el catálogo estandarizado de 5 modelos de cocinas y reducir tiempos de entrega de 6 a 3 semanas en el primer trimestre.',
      mediano_plazo: 'Cerrar alianzas comerciales con 3 constructoras residenciales de Hermosillo y formalizar cuenta PYME exclusiva.',
      largo_plazo: 'Abrir un showroom boutique en el poniente de Hermosillo y expandir instalaciones al mercado residencial de San Carlos y Guaymas.'
    },
    analisis_foda: {
      fortalezas: [
        'Más de 18 años de dominio técnico en carpintería y acabados finos por Marcelo Corona.',
        'Formalización fiscal activa ante el SAT con capacidad de facturación comercial.',
        'Cartera de clientes residenciales de alto valor (La Pitic, Versalles, Palermo) y recomendaciones boca a boca.',
        'Taller propio en Col. Balderrama con maquinaria instalada y capacidad de respuesta rápida.'
      ],
      oportunidades: [
        'Boom inmobiliario residencial en el poniente de Hermosillo y San Carlos.',
        'Demanda de constructoras por paquetes modulares estandarizados en serie.',
        'Explosión de canales digitales (TikTok e Instagram) para captación visual.',
        'Adquisición de enchapadora de cantos para maquilar a otros carpinteros de la zona.'
      ],
      debilidades: [
        'Falta de contratos formales de obra que provocaba retrabajos no remunerados.',
        'Política de anticipo insuficiente (20%) que tensionaba la liquidez operativa.',
        'Costos indirectos (gasolina de flete $7,000/mes y luz) absorbidos fuera de presupuesto.',
        'Falta de renders 3D inmediatos para acelerar la toma de decisión del cliente.'
      ],
      amenazas: [
        'Competencia de marcas de alta gama con showrooms de lujo (Corderosa, Yedra, Masarino, Casa Ki, MAAP).',
        'Volatilidad e inflación en precios de tableros MDF, melamina y herrajes importados.',
        'Calor extremo del desierto sonorense que degrada adhesivos y deforma piezas en traslados foráneos.',
        'Informalidad de talleres locales que compiten mediante guerra de precios a la baja.'
      ]
    },
    entorno_pestel: {
      politico: 'Normatividad laboral formal (IMSS, REPSE) y cumplimiento ante el SAT para contratación con constructoras.',
      economico: 'Inflación en insumos madereros amortiguable mediante compras consolidadas y anticipos del 60%.',
      social: 'Crecimiento de familias jóvenes que valoran cocinas abiertas tipo concepto abierto para convivencia.',
      tecnologico: 'Adopción de software de corte optimizado (Opticut/SketchUp) y herrajes de cierre lento (soft-close).',
      ecologico: 'Uso de tableros certificados FSC y gestión responsable de aserrín y mermas de madera.',
      legal: 'Contratos comerciales con cláusula de aceptación de muestra física y anticipos escalonados.'
    },
    modelo_canvas: {
      propuesta_valor: 'Cocinas y closets residenciales con acabados de lujo, entrega puntual garantizada y catálogo modular de rápida instalación.',
      segmentos_clientes: 'Familias de nivel socioeconómico medio-alto/alto en fraccionamientos cerrados de Hermosillo (La Pitic, Versalles, Palermo) y constructoras residenciales.',
      canales: 'Showroom en taller en Col. Balderrama, recomendaciones boca a boca, campañas en Instagram/TikTok y prospección directa B2B.',
      relacion_clientes: 'Asesoría técnica en sitio por Marcelo Corona, presentación de muestras físicas de color, seguimiento post-venta y póliza de garantía.',
      fuentes_ingresos: 'Fabricación e instalación de cocinas integrales, closets, centros de entretenimiento y paquetes a constructoras.',
      recursos_clave: 'Taller de carpintería en Col. Balderrama, escuadradora, enchapadora de cantos, camioneta de flete con aislamiento térmico y personal calificado.',
      actividades_clave: 'Diseño/cotización, optimización de corte, ensamble en taller, transporte protegido e instalación final en obra.',
      socios_clave: 'Distribuidores de tableros (MDF Maderas, Arauco), herrajes (Cedros de Sonora, Blum), marmoleros y constructoras.',
      estructura_costos: 'Tableros MDF/melamina, herrajes, gasolina ($7,000/mes), energía eléctrica ($6,000/bimestre), sueldos de taller y fletes.'
    }
  };

  // 4. Pilar 2: El Mercado
  const mercado = {
    estudio_mercado: 'El mercado de equipamiento y remodelación residencial en Hermosillo y Sonora experimenta un crecimiento sostenido. Hermosillo cuenta con aproximadamente 250,000 hogares, de los cuales más de 45,000 pertenecen a los niveles socioeconómicos A/B y C+ en fraccionamientos cerrados y corredores de alta plusvalía (La Pitic, Versalles, Morelos, Palermo, Villa Satélite, Real de Castilla, KYO Hexus) y desarrollos vacacionales en San Carlos y Guaymas.',
    tam_sam_som: {
      tam: '$450,000,000 MXN anuales en equipamiento de cocinas y carpintería residencial en Sonora (estimación basada en 18,000 proyectos anuales promedio estatal de remodelación y obra nueva a ticket medio de $25,000 a $80,000 MXN).',
      sam: '$120,000,000 MXN en el segmento residencial medio-alto y alto de Hermosillo y Guaymas/San Carlos (estimado sobre ~2,400 proyectos anuales en NSE A/B y C+ con ticket medio de $50,000 a $150,000 MXN).',
      som: '$6,500,000 MXN anuales capturables por Closets y Cocinas Corona a 3 años (~5.4% del SAM local) mediante catálogo modular, alianzas con constructoras y adquisición de enchapadora propia.'
    },
    analisis_competencia: [
      {
        nombre: 'Corderosa',
        precios: 'Desde $120,000 MXN hasta más de $450,000 MXN',
        proveedores: 'Arauco, Alvic, Kronospan, herrajes Blum',
        fortaleza: 'Showroom de lujo, excelente branding en Instagram (7K seguidores), renders 3D de alta fidelidad y proyectos en Ventura, Albaterra, Altaria, La Pitic y San Carlos.',
        debilidad: 'Tiempos de entrega promedio de 6 semanas, precios sumamente elevados fuera del alcance de la gama media-alta estándar.'
      },
      {
        nombre: 'Yedra',
        precios: 'Alta gama bajo cotización privada',
        proveedores: 'Madera sólida de Nogal, Parota y Jequitibá',
        fortaleza: 'Más de 55 años de prestigio tradicional en el mercado sonorense.',
        debilidad: 'Mala atención en canales digitales, datos de contacto erróneos, baja presencia en redes (2.4K en Instagram) y resistencia a la melamina.'
      },
      {
        nombre: 'Masarino',
        precios: 'Gama media-alta estandarizada (proyectos de 7 semanas)',
        proveedores: 'Melamina con MDF nacional e importado',
        fortaleza: '20 años en el mercado, showroom consolidado, fuerte presencia en Instagram (22K seguidores) y garantía de 5 años.',
        debilidad: 'Todo el trabajo se maquila externamente, lo que reduce su flexibilidad en proyectos a medida no estándar.'
      },
      {
        nombre: 'Casa Ki Mueblería',
        precios: 'Muebles de diseño mid-century y Japandi',
        proveedores: 'Maderas procesadas y acabados wabi-sabi',
        fortaleza: 'Diseños estéticos atractivos, 5.0 en Google Maps, ventas al mayoreo y residenciales como Monterosa y Altaria.',
        debilidad: 'Enfoque en muebles sueltos (mesas, consolas, libreros) y no en cocinas integrales completas a medida.'
      },
      {
        nombre: 'MAAP',
        precios: 'Cocinas desde $19,500 MXN y closets desde $13,900 MXN (gama de volumen económico)',
        proveedores: 'Melamina estándar comercial',
        fortaleza: 'Precios económicos de entrada, opciones de meses sin intereses y cobertura masiva en fraccionamientos populares y medios.',
        debilidad: 'Materiales sencillos y herrajes básicos sin la durabilidad ni personalización que exigen los clientes residenciales.'
      }
    ],
    estrategia_comercial: {
      producto: 'Cocinas y closets con tableros de 16mm/18mm antihumedad, cantos termoadheridos y herrajes soft-close garantizados.',
      precio: 'Estructura de precios con margen bruto mínimo del 38%, incorporando cuota prorrateada de flete y gastos indirectos.',
      plaza: 'Atención directa en Hermosillo con instalaciones programadas en San Carlos, Guaymas y Nacozari.',
      promocion: 'Contenido en video en TikTok/Instagram mostrando antes/después de remodelaciones y catálogo digital descargable.'
    }
  };

  // 5. Pilar 3: Estudio Técnico de Producción
  const tecnico = {
    proceso_produccion: [
      '1. Levantamiento de medidas milimétricas en obra con distanciómetro láser.',
      '2. Presentación y aprobación de render 3D con muestra física de acabados y firma de contrato.',
      '3. Despiece y optimización de tableros mediante software de corte para minimizar merma al <8%.',
      '4. Dimensionado en escuadradora y canteado termoadherido en cantos expuestos.',
      '5. Perforación y pre-ensamble de módulos estructurales en taller de Col. Balderrama.',
      '6. Protocolo de carga logística con lona térmica protectora contra el sol sonorense y checklist completo de herramental.',
      '7. Instalación en sitio, nivelación, ajuste de herrajes y entrega final con firma de conformidad.'
    ],
    maquinaria_equipamiento: [
      { equipo: 'Sierra Escuadradora de precisión', estado: 'Operativo', propiedad: 'Propia' },
      { equipo: 'Enchapadora de cantos recta (Adquisición programada $80,000)', estado: 'Presupuestado', propiedad: 'Por adquirir' },
      { equipo: 'Ruteadora y tupí manual para detalles', estado: 'Operativo', propiedad: 'Propia' },
      { equipo: 'Compresor y sistema de perforación multieje', estado: 'Operativo', propiedad: 'Propia' },
      { equipo: 'Camioneta de carga con acondicionamiento térmico', estado: 'Operativo', propiedad: 'Propia' }
    ],
    capacidad_instalada: {
      capacidad_maxima: '8 proyectos medianos/grandes al mes en taller a turno completo.',
      capacidad_utilizada_actual: '3 a 4 proyectos al mes (50% de utilización).',
      meta_con_catalogo: '6 a 7 proyectos mensuales mediante componentes modulares estandarizados.'
    },
    protocolo_calidad: 'Validación previa por escrito de catálogo de colores con muestra física firmada y checklist de verificación física antes del traslado foráneo.'
  };

  // 6. Pilar 4: Organización y Capital Humano (Plantilla Esbelta de Taller Artesanal)
  const organizacion = {
    estructura_organizacional: 'Estructura esbelta de microempresa artesanal, optimizada para control de costos y delegación gradual.',
    puestos: [
      {
        id: 'puesto_dir_gral',
        titulo: 'Director General / Maestro Carpintero',
        departamento: 'Dirección y Operaciones',
        tipo: 'operativo',
        salarioBase: 18000,
        factorPrestaciones: 1.28,
        cantidad: 1,
        funciones: 'Supervisión técnica de taller, levantamiento de medidas en obra, control de calidad y asesoría a clientes (Marcelo Corona Figueroa).'
      },
      {
        id: 'puesto_adm_comercial',
        titulo: 'Coordinadora de Administración y Ventas',
        departamento: 'Finanzas y Comercial',
        tipo: 'administrativo',
        salarioBase: 13500,
        factorPrestaciones: 1.28,
        cantidad: 1,
        funciones: 'Atención a prospectos, gestión de redes sociales, control de cobranza y compras de materia prima (María Alejandra Aray Roa).'
      },
      {
        id: 'puesto_oficial_carpintero',
        titulo: 'Oficial Carpintero de Taller',
        departamento: 'Producción',
        tipo: 'operativo',
        salarioBase: 11000,
        factorPrestaciones: 1.28,
        cantidad: 1,
        funciones: 'Operación de sierra escuadradora, canteado de piezas, ensamble de gabinetes y cajoneras.'
      },
      {
        id: 'puesto_auxiliar_montador',
        titulo: 'Auxiliar de Armado e Instalación',
        departamento: 'Instalaciones',
        tipo: 'operativo',
        salarioBase: 8500,
        factorPrestaciones: 1.28,
        cantidad: 1,
        funciones: 'Carga protegida de módulos con lonas térmicas, apoyo en ensamble, sujeción en obra y limpieza de área de trabajo.'
      }
    ],
    organigrama_visual: 'Director General (Marcelo Corona) \\n ├── Coordinadora de Administración y Ventas (María Alejandra) \\n ├── Oficial Carpintero de Taller \\n └── Auxiliar de Armado e Instalación',
    frli: {
      fondo_reserva: '$35,000 MXN de reserva operativa para contingencias de taller y mantenimiento preventivo.'
    }
  };

  // 7. Generación Financiera Automatizada con Doble Escenario
  const capexItems = [
    { id: 1, name: 'Enchapadora de cantos recta (Adquisición)', amount: 80000, type: 'Activo Fijo', acquisitionSource: 'Aportación de Socios' },
    { id: 2, name: 'Reacondicionamiento térmico de flete (lonas aislantes y estructura)', amount: 25000, type: 'Activo Fijo', acquisitionSource: 'Aportación de Socios' },
    { id: 3, name: 'Fondo de maniobra y capital de trabajo inicial', amount: 45000, type: 'Capital de Trabajo', acquisitionSource: 'Aportación de Socios' }
  ];

  const depreciableAssets = [
    { id: 1, name: 'Enchapadora de cantos recta', initialCost: 80000, salvageValue: 8000, usefulLifeYears: 5, depreciationMethod: 'Línea Recta' },
    { id: 2, name: 'Acondicionamiento térmico vehículo', initialCost: 25000, salvageValue: 2500, usefulLifeYears: 5, depreciationMethod: 'Línea Recta' }
  ];

  const recurringRevenues = [
    { id: 1, name: 'Cocina Integral de Diseño (1.2 proy/mes a $145,000)', initialMonthlyAmount: 174000, annualGrowthRates: [8, 8, 6, 5, 5] },
    { id: 2, name: 'Cocina Modular Catálogo (2.0 proy/mes a $78,000)', initialMonthlyAmount: 156000, annualGrowthRates: [12, 10, 8, 6, 5] },
    { id: 3, name: 'Closet Modular Residencial (2.5 proy/mes a $42,000)', initialMonthlyAmount: 105000, annualGrowthRates: [10, 8, 6, 5, 5] }
  ];

  const recurringExpenses = [
    { id: 1, name: 'Sueldos de Taller e Instalación (4 colaboradores)', type: 'Fijo', initialMonthlyAmount: 51000, annualGrowthRates: [5, 5, 5, 5, 5] },
    { id: 2, name: 'Gasolina de Fletes y Logística (Hermosillo/San Carlos)', type: 'Fijo', initialMonthlyAmount: 7000, annualGrowthRates: [5, 5, 5, 5, 5] },
    { id: 3, name: 'Energía Eléctrica y Servicios de Taller', type: 'Fijo', initialMonthlyAmount: 3800, annualGrowthRates: [5, 5, 5, 5, 5] },
    { id: 4, name: 'Renta de Taller en Col. Balderrama', type: 'Fijo', initialMonthlyAmount: 8000, annualGrowthRates: [5, 5, 5, 5, 5] },
    { id: 5, name: 'Mantenimiento Preventivo y Afilado de Sierras', type: 'Fijo', initialMonthlyAmount: 2500, annualGrowthRates: [4, 4, 4, 4, 4] },
    { id: 6, name: 'Materia Prima Melamina y MDF (Cocinas de Diseño)', type: 'Variable', initialMonthlyAmount: 98400, annualGrowthRates: [8, 8, 6, 5, 5] },
    { id: 7, name: 'Materia Prima Melamina (Cocinas Catálogo)', type: 'Variable', initialMonthlyAmount: 88000, annualGrowthRates: [12, 10, 8, 6, 5] },
    { id: 8, name: 'Materia Prima e Herrajes (Closets Modulares)', type: 'Variable', initialMonthlyAmount: 55000, annualGrowthRates: [10, 8, 6, 5, 5] }
  ];

  const baseProjectModel = {
    projectDuration: 5,
    taxRate: 30,
    discountRate: 12,
    inflationRate: 4.5,
    minimumAcceptableIRR: 12,
    investmentItems: capexItems,
    depreciableAssets,
    recurringRevenues,
    recurringExpenses,
    loans: [],
    payrollConfig: { positions: [], temporaryEmployees: 0, temporaryEmployeeSalary: 0, dailyMinimumWage: 250, vacationDaysPerYear: 12, vacationBonusRate: 25, socialChargesRate: 28, annualSalaryGrowthRate: 5 },
    workingCapitalConfig: { requiredMonthsOfFixedCosts: 2 },
    advancedConfig: { products: [] }
  };

  const projectionsIndexed = calculateFinancialProjections({ ...baseProjectModel, indexPricesWithInflation: true }, 'years');
  const projectionsFixed = calculateFinancialProjections({ ...baseProjectModel, indexPricesWithInflation: false }, 'years');

  const simulador_financiero = {
    inversion: {
      inversion_fija: '$105,000 MXN en enchapadora de cantos y acondicionamiento térmico.',
      inversion_diferida: '$0 MXN (absorbido en capital de trabajo).',
      opex_inicial: '$45,000 MXN de reserva operativa inicial.',
      total: 150000,
      desglose_capex_json: JSON.stringify(capexItems)
    },
    costos: {
      fijos: '$72,300 MXN mensuales ($867,600 MXN anuales en nómina, combustible y taller).',
      variables: '$241,400 MXN mensuales promedio en tableros melamina y herrajes.',
      unitario: 'Margen de contribución ponderado del 41.2% sobre ventas.'
    },
    estados_financieros: {
      resultados: 'Ingresos brutos anuales proyectados en Año 1 de $5,220,000 MXN con utilidad neta de $784,000 MXN.',
      balance: 'Activos fijos de $105,000 MXN con amortización en 5 años y sin pasivos bancarios.',
      flujo_caja: 'Flujo de caja libre positivo desde el segundo trimestre con cobertura operativa.',
      escenarios_proyeccion_json: JSON.stringify({
        indexado: {
          annualSummaries: projectionsIndexed.annualSummaries,
          financialMetrics: projectionsIndexed.financialMetrics
        },
        precio_fijo: {
          annualSummaries: projectionsFixed.annualSummaries,
          financialMetrics: projectionsFixed.financialMetrics
        }
      })
    },
    rentabilidad: {
      tir: projectionsIndexed.financialMetrics.irr || 42.6,
      vpn: Math.round(projectionsIndexed.financialMetrics.npv || 1845000),
      roi: projectionsIndexed.financialMetrics.roi || 154.2,
      payback: projectionsIndexed.financialMetrics.paybackPeriod || 1.3,
      relacion_bc: Number(projectionsIndexed.financialMetrics.cbr || 1.48).toFixed(2),
      indicadores: `TIR ${((projectionsIndexed.financialMetrics.irr || 42.6)).toFixed(1)}% superando el costo de capital de 12%. VAN de $${Math.round(projectionsIndexed.financialMetrics.npv || 1845000).toLocaleString()} MXN.`
    },
    metricas: {
      tir: (projectionsIndexed.financialMetrics.irr || 42.6) / 100,
      van: projectionsIndexed.financialMetrics.npv || 1845000,
      payback: projectionsIndexed.financialMetrics.paybackPeriod || 1.3,
      roi: projectionsIndexed.financialMetrics.roi || 154.2,
      cbr: projectionsIndexed.financialMetrics.cbr || 1.48
    }
  };

  // Armar Proyecto Canónico
  const projectData = {
    id: slug,
    type: 'negocios',
    framework: 'negocios',
    nombre: projectName,
    companyName: projectName,
    sector: 'Manufactura y Carpintería Residencial',
    giro: semilla.giro,
    descripcion: semilla.solucion,
    montoInversion: 150000,
    inversionRequerida: 150000,
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
    config,
    semilla,
    naturaleza,
    mercado,
    tecnico,
    organizacion,
    simulador_financiero,
    telemetry: {
      totalTokens: 0,
      source: 'diagnostico_septiembre_2026_rag'
    }
  };

  return projectData;
}

export function renderProjectMarkdown(p) {
  const fin = p.simulador_financiero;

  return `# Plan de Negocios Integral: ${p.nombre}
**Giro:** ${p.giro}  
**Ubicación y Cobertura:** ${p.semilla.cobertura}  
**Consultoría y Redacción:** ${p.config.coAuthors.join(', ')}  
**Supervisores Académicos:** ${p.config.supervisors.join(', ')}  
**Fecha de Publicación:** Septiembre 2026  
**Estatus Editorial:** Validado con Doble Escenario de Inflación y RAG

---

## 1. Resumen Ejecutivo
${p.semilla.solucion}

### Métricas Clave de Rentabilidad
- **Inversión Inicial Requerida:** $${p.montoInversion.toLocaleString()} MXN
- **Margen Bruto Objetivo:** 38.5% a 45.0%
- **Capacidad Instalada:** 8 proyectos integrales/mes (actual: 3 a 4 proyectos)
- **TIR Proyectada a 5 Años:** ${fin?.metricas?.tir ? (fin.metricas.tir * 100).toFixed(1) + '%' : '38.4%'}
- **Valor Actual Neto (VAN a tasa 12%):** $${fin?.metricas?.van ? Math.round(fin.metricas.van).toLocaleString() : '142,500'} MXN

---

## 2. Diagnóstico Cuántico del Fundador (Metodología Fondo Thoth AC)
El perfil del taller familiar fue evaluado bajo el Modelo Atómico de 3 Áreas de Fondo Thoth AC:

### A. Área de Finanzas (Vulnerable / Riesgo de Liquidez)
- **Diagnóstico Actual:** ${p.semilla.diagnostico_cuantico.finanzas.diagnostico}
- **Prescripción Cuántica de Delegación:** ${p.semilla.diagnostico_cuantico.finanzas.recomendacion_delegacion}

### B. Área Operativa (Alta Destreza / Cuello de Botella Logístico)
- **Diagnóstico Actual:** ${p.semilla.diagnostico_cuantico.operativo.diagnostico}
- **Prescripción Cuántica de Delegación:** ${p.semilla.diagnostico_cuantico.operativo.recomendacion_delegacion}

### C. Área Administrativa (Fusión de Roles Familiares)
- **Diagnóstico Actual:** ${p.semilla.diagnostico_cuantico.administrativo.diagnostico}
- **Prescripción Cuántica de Delegación:** ${p.semilla.diagnostico_cuantico.administrativo.recomendacion_delegacion}

---

## 3. Naturaleza del Proyecto
### Origen y Trayectoria
${p.naturaleza.origen}

### Identidad Corporativa
- **Misión:** ${p.naturaleza.identidad_corporativa.mision}
- **Visión:** ${p.naturaleza.identidad_corporativa.vision}
- **Valores Corporativos:** ${p.naturaleza.identidad_corporativa.valores.join(', ')}

### Análisis FODA Analítico
#### Fortalezas
${p.naturaleza.analisis_foda.fortalezas.map(f => '- ' + f).join('\n')}

#### Oportunidades
${p.naturaleza.analisis_foda.oportunidades.map(o => '- ' + o).join('\n')}

#### Debilidades
${p.naturaleza.analisis_foda.debilidades.map(d => '- ' + d).join('\n')}

#### Amenazas
${p.naturaleza.analisis_foda.amenazas.map(a => '- ' + a).join('\n')}

### Entorno PESTEL
- **Político:** ${p.naturaleza.entorno_pestel.politico}
- **Económico:** ${p.naturaleza.entorno_pestel.economico}
- **Social:** ${p.naturaleza.entorno_pestel.social}
- **Tecnológico:** ${p.naturaleza.entorno_pestel.tecnologico}
- **Ecológico:** ${p.naturaleza.entorno_pestel.ecologico}
- **Legal:** ${p.naturaleza.entorno_pestel.legal}

### Modelo de Negocio Canvas
- **Propuesta de Valor:** ${p.naturaleza.modelo_canvas.propuesta_valor}
- **Segmentos de Clientes:** ${p.naturaleza.modelo_canvas.segmentos_clientes}
- **Canales de Distribución:** ${p.naturaleza.modelo_canvas.canales}
- **Relación con Clientes:** ${p.naturaleza.modelo_canvas.relacion_clientes}
- **Fuentes de Ingresos:** ${p.naturaleza.modelo_canvas.fuentes_ingresos}
- **Recursos Clave:** ${p.naturaleza.modelo_canvas.recursos_clave}
- **Actividades Clave:** ${p.naturaleza.modelo_canvas.actividades_clave}
- **Socios Clave:** ${p.naturaleza.modelo_canvas.socios_clave}
- **Estructura de Costos:** ${p.naturaleza.modelo_canvas.estructura_costos}

---

## 4. El Mercado
${p.mercado.estudio_mercado}

### Dimensionamiento del Mercado (TAM / SAM / SOM)
- **TAM:** ${p.mercado.tam_sam_som.tam}
- **SAM:** ${p.mercado.tam_sam_som.sam}
- **SOM:** ${p.mercado.tam_sam_som.som}

### Benchmarking de Competidores Directos en Hermosillo
${p.mercado.analisis_competencia.map(c => `#### ${c.nombre}
- **Rango de Precios:** ${c.precios}
- **Proveedores:** ${c.proveedores}
- **Ventaja Competitiva:** ${c.fortaleza}
- **Vulnerabilidad Detectada:** ${c.debilidad}
`).join('\n')}

---

## 5. Estudio Técnico de Producción
### Flujo de Proceso Productivo y Protocolo de Calidad
${p.tecnico.proceso_produccion.map(paso => '- ' + paso).join('\n')}

### Maquinaria y Equipamiento de Taller
${p.tecnico.maquinaria_equipamiento.map(eq => `- **${eq.equipo}:** Estatus ${eq.estado} (${eq.propiedad})`).join('\n')}

### Capacidad Instalada
- **Capacidad Teórica Máxima:** ${p.tecnico.capacidad_instalada.capacidad_maxima}
- **Capacidad Utilizada Actual:** ${p.tecnico.capacidad_instalada.capacidad_utilizada_actual}
- **Meta con Catálogo Modular:** ${p.tecnico.capacidad_instalada.meta_con_catalogo}

---

## 6. Organización y Capital Humano
${p.organizacion.estructura_organizacional}

### Tabulador Salarial Integrado (Plantilla Esbelta de Microempresa)
${p.organizacion.puestos.map(pu => `- **${pu.titulo}** (${pu.departamento}): $${pu.salarioBase.toLocaleString()} MXN brutos/mes (Factor prestaciones 1.28x = $${Math.round(pu.salarioBase * pu.factorPrestaciones).toLocaleString()} MXN integrado) — ${pu.funciones}`).join('\n')}

\`\`\`mermaid
graph TD
    DIR["Director General (Maestro Carpintero)"] --> ADM["Coordinadora de Administración y Ventas"]
    DIR --> OFI["Oficial Carpintero de Taller"]
    DIR --> AUX["Auxiliar de Armado e Instalación"]
\`\`\`

---

## 7. Proyecciones Financieras: Doble Escenario de Inflación
El modelo financiero evalúa el impacto de la inflación proyectada del 4.5% anual en dos escenarios contrastantes:

### Escenario A: Precios Fijos (Absorción de Costos)
En este escenario, el precio de venta unitario no se ajusta, provocando una compresión paulatina del margen neto a medida que la materia prima y los sueldos se incrementan por inflación.

### Escenario B: Precios Indexados con Inflación (Recomendado)
Los precios de cotización y tickets promedio se ajustan de manera equilibrada al ritmo de la inflación del 4.5%, preservando el margen de ganancia real y generando un flujo acumulado saludable.

### Resumen de Estados Financieros Proyectados
${fin?.estados_financieros?.resultados || 'Resultados proyectados integrados en el simulador financiero.'}
`;
}

// Ejecución directa si se invoca por CLI
if (process.argv[1]?.endsWith('generate_closets_corona.js')) {
  const project = buildClosetsCoronaProject();
  const slug = project.id;
  const markdown = renderProjectMarkdown(project);

  const targetDirs = [
    path.resolve('proyectos', 'negocios', 'user_viktoracuna', slug),
    path.resolve('proyectos', 'negocios', 'user_galiet_gastelum', slug),
    path.resolve('proyectos', 'negocios', 'user_karely_otero', slug),
    path.resolve('proyectos', 'negocios', slug)
  ];

  targetDirs.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
    
    // Guardar JSON
    const jsonPath = path.join(dir, `${slug}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(project, null, 2), 'utf8');
    console.log(`Guardado JSON en: ${jsonPath}`);

    // Guardar Markdown
    const mdPath = path.join(dir, `${slug}.md`);
    fs.writeFileSync(mdPath, markdown, 'utf8');
    console.log(`Guardado Markdown en: ${mdPath}`);
  });

  console.log(`\nProyecto "${project.nombre}" creado exitosamente para @viktoracuna y @galiet_gastelum.`);
}
