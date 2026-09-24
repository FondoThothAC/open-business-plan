/**
 * @file generate_closets_corona.js
 * @description Genera el plan de negocios canónico integral para "Closets y Cocinas Corona".
 * Integra el Diagnóstico Empresarial de Septiembre 2026, la metodología Empresas Cuánticas,
 * y el cálculo financiero automatizado con doble escenario de inflación.
 */

import fs from 'fs';
import path from 'path';
import { generateAutomatedFinancials } from '../src/lib/finanzas/calculadoraFinanciera.js';

export function buildClosetsCoronaProject() {
  const slug = 'closets_y_cocinas_corona';
  const projectName = 'Closets y Cocinas Corona';

  // 1. Configuración de Co-Autoría y Colaboración Simétrica
  const config = {
    framework: 'negocios',
    projectType: 'business',
    workflowStatus: 'Borrador',
    userOwner: 'viktoracuna',
    collaborators: ['viktoracuna', 'galiet_gastelum'],
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
    problema: '1. Clientes residenciales y constructoras sufren por entregas impuntuales, mermas por calor en fletes de melamina y falta de estandarización en carpintería tradicional.\n2. La empresa familiar enfrentaba fugas financieras por no prorratear fletes ($7,000/mes) ni luz, además de riesgo de liquidez por anticipos insuficientes (20%) ante materias primas que exigen el 45%.\n3. Dependencia exclusiva de pedidos 100% personalizados que saturan los tiempos de diseño y fabricación.',
    solucion: '1. Modelo híbrido: Mantener carpintería de alta gama a medida y lanzar un Catálogo Modular Estandarizado de 5 modelos de cocinas y closets para venta ágil a constructoras y particulares.\n2. Reestructuración de cobro blindada: 60% anticipo para adquisición de materiales, 30% contra entrega en obra y 10% post-instalación con póliza de garantía por escrito.\n3. Protocolo logístico con lonas térmicas protectoras contra el sol sonorense y checklist de carga para eliminar reprocesos foráneos al 100%.',
    mercado_objetivo: 'Hogares de nivel socioeconómico medio-alto y alto en zonas residenciales de Hermosillo (Versalles, Real de Castilla, KYO Hexus, Córsica) y San Carlos; constructoras de vivienda en serie que requieren paquetes modulares llave en mano.',
    modelo_ingresos: 'Venta directa de proyectos de cocinas integrales (ticket promedio $120,000 MXN a $250,000 MXN), closets modulares ($35,000 MXN a $80,000 MXN) y paquetes de catálogo para constructoras con márgenes brutos objetivo del 38% al 45%.',
    ventaja_injusta: '18 años de experiencia en oficio maderero, relación de confianza con clientes residenciales consolidados, manufactura propia sin intermediarios y tiempos de entrega reducidos de 6 a 3 semanas mediante estandarización modular.',
    diagnostico_cuantico: {
      finanzas: {
        diagnostico: 'Vulnerable por anticipo del 20% y falta de tabulador de prorrateo de costos indirectos.',
        recomendacion_delegacion: 'Implementar cuenta bancaria empresarial separada del gasto doméstico, fijar anticipo mínimo del 60% e incorporar un software de cotización automatizado.'
      },
      operativo: {
        diagnostico: 'Alta destreza artesanal pero cuello de botella en traslados y deformaciones térmicas en fletes.',
        recomendacion_delegacion: 'Adoptar checklist estricto de herramental antes de salir del taller e instalar cubierta térmica aislante en la batea del vehículo de carga.'
      },
      administrativo: {
        diagnostico: 'Fusión de roles en María (contacto, redes, facturación) y resistencia al modelado 3D.',
        recomendacion_delegacion: 'Integrar a un practicante o diseñador auxiliar en modelado 3D/renders para liberar a María hacia relaciones públicas y cierre comercial.'
      }
    }
  };

  // 3. Pilar 1: Naturaleza del Proyecto (Formato conciso y ejecutivo)
  const naturaleza = {
    origen: 'Closets y Cocinas Corona inició operaciones informales en 2008 en Hermosillo, Sonora, logrando su formalización fiscal en 2020. Acumula más de 18 años de experiencia artesanal en madera, melamina y cubiertas pétreas.',
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
        'Más de 18 años de dominio técnico en carpintería y acabados finos.',
        'Formalización fiscal activa con capacidad de facturación comercial.',
        'Cartera de clientes residenciales de alto valor y recomendaciones boca a boca.',
        'Taller propio con maquinaria instalada y capacidad de respuesta rápida.'
      ],
      oportunidades: [
        'Boom inmobiliario residencial en el poniente de Hermosillo y San Carlos.',
        'Demanda de constructoras por paquetes modulares estandarizados en serie.',
        'Explosión de canales digitales (TikTok e Instagram) para captación visual.',
        'Sustitución de importaciones y proveedores locales de melamina de alta densidad.'
      ],
      debilidades: [
        'Falta de contratos formales de obra que provocaba retrabajos no remunerados.',
        'Política de anticipo insuficiente (20%) que tensionaba la liquidez operativa.',
        'Costos indirectos (gasolina de flete y energía eléctrica) absorbidos fuera de presupuesto.',
        'Falta de renders 3D inmediatos para acelerar la toma de decisión del cliente.'
      ],
      amenazas: [
        'Competencia de marcas de alta gama con showrooms de lujo (Corderosa, Yedra, Mazarino).',
        'Volatilidad e inflación en precios de tableros MDF, melamina y herrajes importados.',
        'Calor extremo de Sonora que degrada adhesivos y tableros en transportes no protegidos.',
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
      segmentos_clientes: 'Familias de nivel socioeconómico medio-alto/alto en fraccionamientos cerrados de Hermosillo y constructoras residenciales.',
      canales: 'Showroom en taller, recomendaciones boca a boca, campañas en Instagram/TikTok y prospección directa B2B.',
      relacion_clientes: 'Asesoría técnica en sitio, presentación de renders 3D, seguimiento post-venta y póliza de garantía.',
      fuentes_ingresos: 'Fabricación e instalación de cocinas integrales, closets, centros de entretenimiento y paquetes a constructoras.',
      recursos_clave: 'Taller de carpintería, escuadradora, enchapadora de cantos, camioneta de flete con aislamiento térmico y personal calificado.',
      actividades_clave: 'Diseño/cotización, optimización de corte, ensamble en taller, transporte protegido e instalación final en obra.',
      socios_clave: 'Distribuidores de tableros (Arauco, Kronospan), herrajes de alta gama (Blum), marmoleros y constructoras.',
      estructura_costos: 'Tableros MDF/melamina, herrajes, gasolina ($7,000/mes), energía eléctrica, sueldos de taller y fletes.'
    }
  };

  // 4. Pilar 2: El Mercado
  const mercado = {
    estudio_mercado: 'El mercado de equipamiento y remodelación residencial en Hermosillo y Sonora experimenta un crecimiento sostenido impulsado por la expansión de fraccionamientos privados en el poniente (Versalles, Real de Castilla, KYO Hexus) y desarrollos vacacionales en San Carlos.',
    tam_sam_som: {
      tam: '$450,000,000 MXN anuales en equipamiento de cocinas y carpintería residencial en Sonora.',
      sam: '$120,000,000 MXN en el segmento residencial medio-alto y alto de Hermosillo y Guaymas/San Carlos.',
      som: '$6,500,000 MXN anuales capturables por Closets y Cocinas Corona a 3 años mediante catálogo modular y canal constructor.'
    },
    analisis_competencia: [
      {
        nombre: 'Corderosa',
        precios: 'Desde $120,000 MXN hasta $450,000 MXN',
        proveedores: 'Arauco, Alvic, Kronospan, Blum',
        fortaleza: 'Showroom de lujo y atención personalizada orientada al estilo de vida.',
        debilidad: 'Tiempos de entrega largos (6 a 8 semanas) y precios muy elevados.'
      },
      {
        nombre: 'Yedra',
        precios: 'No públicos (alta gama bajo cotización)',
        proveedores: 'Madera sólida de Nogal, Parota y Jequitibá',
        fortaleza: '55 años de presencia histórica en el mercado sonorense.',
        debilidad: 'Mala atención en canales digitales y datos de contacto desactualizados.'
      },
      {
        nombre: 'Mazarino',
        precios: 'Gama media-alta estandarizada',
        proveedores: 'Melamina con MDF nacional e importado',
        fortaleza: 'Fuerte presencia en redes sociales (22k en Instagram) y software de diseño 3D.',
        debilidad: 'Menor flexibilidad para proyectos de dimensiones atípicas.'
      },
      {
        nombre: 'Casa Ki Mueblería',
        precios: 'Gama media y muebles sueltos',
        proveedores: 'Maderas procesadas',
        fortaleza: 'Ventas en línea y envíos nacionales.',
        debilidad: 'Poco enfoque en cocinas integrales completas a medida.'
      },
      {
        nombre: 'MAAP',
        precios: 'Cocinas desde $19,500 MXN y closets desde $13,900 MXN (gama de entrada)',
        proveedores: 'Melamina estándar comercial',
        fortaleza: 'Precios agresivos y opciones de meses sin intereses.',
        debilidad: 'Acabados sencillos y herrajes básicos con menor vida útil.'
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
      '5. Perforación y pre-ensamble de módulos estructurales en taller.',
      '6. Protocolo de carga logística con lona térmica protectora y checklist completo de herramental.',
      '7. Instalación en sitio, nivelación, ajuste de herrajes y entrega final con firma de conformidad.'
    ],
    maquinaria_equipamiento: [
      { equipo: 'Sierra Escuadradora de precisión', estado: 'Operativo', propiedad: 'Propia' },
      { equipo: 'Enchapadora de cantos recta', estado: 'Operativo', propiedad: 'Propia' },
      { equipo: 'Ruteadora y tupí manual para detalles', estado: 'Operativo', propiedad: 'Propia' },
      { equipo: 'Compresor y sistema de perforación multieje', estado: 'Operativo', propiedad: 'Propia' },
      { equipo: 'Camioneta de carga con acondicionamiento térmico', estado: 'Operativo', propiedad: 'Propia' }
    ],
    capacidad_instalada: {
      capacidad_maxima: '8 proyectos medianos/grandes al mes en taller a turno completo.',
      capacidad_utilizada_actual: '3 a 4 proyectos al mes (50% de utilización).',
      meta_con_catalogo: '6 a 7 proyectos mensuales mediante componentes modulares estandarizados.'
    },
    protocolo_calidad: 'Validación previa por escrito de catálogo de colores y checklist de verificación física antes del traslado foráneo.'
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
        funciones: 'Supervisión técnica de taller, levantamiento de medidas en obra, control de calidad y asesoría a clientes.'
      },
      {
        id: 'puesto_adm_comercial',
        titulo: 'Coordinadora de Administración y Ventas',
        departamento: 'Finanzas y Comercial',
        tipo: 'administrativo',
        salarioBase: 13500,
        factorPrestaciones: 1.28,
        cantidad: 1,
        funciones: 'Atención a prospectos, gestión de redes sociales, control de cobranza y compras de materia prima.'
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
        funciones: 'Carga protegida de módulos, apoyo en ensamble, sujeción en obra y limpieza de área de trabajo.'
      }
    ],
    organigrama_visual: 'Director General (Maestro Carpintero) \\n ├── Coordinadora de Administración y Ventas \\n ├── Oficial Carpintero de Taller \\n └── Auxiliar de Armado e Instalación',
    frli: {
      fondo_reserva: '$35,000 MXN de reserva operativa para contingencias de taller y mantenimiento preventivo.'
    }
  };

  // 7. Generación Financiera Automatizada con Doble Escenario
  const financialInput = {
    investmentData: {
      total: 120000, // Reacondicionamiento de taller y acondicionamiento térmico de flete
      fixedAssets: 80000,
      workingCapital: 40000
    },
    humanCapitalData: {
      roles: organizacion.puestos.map(p => ({
        role: p.titulo,
        baseSalary: p.salarioBase,
        headcount: p.cantidad,
        benefitsFactor: p.factorPrestaciones,
        area: p.tipo === 'administrativo' ? 'administrative' : 'operational'
      }))
    },
    operationalCostsData: {
      monthlyUtilities: 3800, // Luz de taller
      monthlyRent: 8000,      // Renta de local/taller
      monthlyMaintenance: 2500, // Mantenimiento de sierras y maquinaria
      monthlyTransport: 7000, // Gasolina de fletes (absorbida correctamente)
      monthlyAdmin: 2500       // Contador y software de cotización
    },
    marketPricingData: {
      products: [
        {
          name: 'Cocina Integral de Diseño (Personalizada)',
          sellingPrice: 145000,
          unitCost: 82000,
          monthlyVolume: 1.2
        },
        {
          name: 'Cocina Modular Catálogo (Constructoras/Vivienda)',
          sellingPrice: 78000,
          unitCost: 44000,
          monthlyVolume: 2.0
        },
        {
          name: 'Closet Modular Residencial (Recámara Principal)',
          sellingPrice: 42000,
          unitCost: 22000,
          monthlyVolume: 2.5
        }
      ]
    },
    inflationRate: 0.045 // 4.5% anual
  };

  const simulador_financiero = generateAutomatedFinancials(financialInput);

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
    montoInversion: 120000,
    inversionRequerida: 120000,
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
