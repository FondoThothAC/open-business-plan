/**
 * Catálogo de Benchmarks de Industria para Open Business Plan v2.0
 * 
 * Datos precargados y métricas de referencia para micronegocios, comercios y modelos habituales.
 * Permite el "Modo Check" rápido en la Semilla para reducir las preguntas al emprendedor.
 */

export const INDUSTRY_BENCHMARKS = {
  tortilleria: {
    id: 'tortilleria',
    name: 'Tortillería de Maíz / Harina',
    scian: '311830',
    keywords: ['tortilleria', 'tortillería', 'masa', 'nixtamal', 'tortillas'],
    frameworkDefault: 'micro_business',
    defaults: {
      produccion: {
        proceso: '1) Recepción de insumos (harina/maíz) 2) Nixtamalización / Amasado 3) Molienda y prensado 4) Cocción en comal giratorio 5) Enfriamiento y pesado 6) Despacho al cliente.',
        capacidad_diaria: '150 a 300 kg/día',
        personal_minimo: 2,
        merma_promedio: '2% a 4%'
      },
      finanzas: {
        inversion_inicial: '$250,000 MXN (Maquinaria básica + instalación de gas)',
        margen_bruto_estimado: '40% - 48%',
        costos_fijos_mensuales: {
          renta: 8000,
          luz: 6000,
          gas: 8000,
          sueldos: 16000,
          mantenimiento: 2000
        }
      },
      equipo: ['Molino de nixtamal (10-15 HP)', 'Máquina tortillera cabezal sencillo', 'Báscula digital certificada Profeco', 'Tanque estacionario de gas LP (500L)', 'Mesa de trabajo de acero inoxidable'],
      preguntas_check: [
        { key: 'escala_diaria', label: '¿Tu producción estimada estará entre 150 y 300 kg diarios?', defaultVal: '150 - 300 kg/día' },
        { key: 'tipo_local', label: '¿El espacio será propio o rentado?', defaultVal: 'Rentado ($8,000 MXN/mes est.)' },
        { key: 'insumo_principal', label: '¿Insumo base principal?', defaultVal: 'Harina de maíz nixtamalizado / Maíz en grano' }
      ]
    },
    kpis_referencia: {
      margen_operativo: 0.22,
      punto_equilibrio_diario_kg: 110,
      retorno_inversion_meses: 18
    }
  },

  cafeteria: {
    id: 'cafeteria',
    name: 'Cafetería de Especialidad / Snack Bar',
    scian: '722515',
    keywords: ['cafeteria', 'cafetería', 'café', 'coffee', 'espresso', 'barista', 'bakery'],
    frameworkDefault: 'micro_business',
    defaults: {
      produccion: {
        proceso: '1) Selección de grano 2) Molienda al momento 3) Extracción de espresso / preparado de bebidas 4) Ensamble de repostería 5) Servicio en barra o mesa.',
        capacidad_diaria: '80 a 180 tazas/día',
        personal_minimo: 3,
        merma_promedio: '3% a 5%'
      },
      finanzas: {
        inversion_inicial: '$350,000 MXN (Máquina espresso profesional + adecuación de barra)',
        margen_bruto_estimado: '65% - 75%',
        costos_fijos_mensuales: {
          renta: 15000,
          luz: 5000,
          agua: 1200,
          sueldos: 24000,
          insumos_cafe: 8000
        }
      },
      equipo: ['Máquina de espresso de 2 grupos', 'Molino de café On-Demand', 'Licuadora industrial de alta potencia', 'Refrigerador vertical exhibidor', 'Punto de venta POS con punto de cobro'],
      preguntas_check: [
        { key: 'ticket_promedio', label: '¿Ticket promedio estimado por cliente?', defaultVal: '$85 - $130 MXN' },
        { key: 'concepto_servicio', label: '¿Modalidad principal?', defaultVal: 'Barra express + Drive-thru + Mesas' },
        { key: 'reposteria_propia', label: '¿Repostería propia o proveeduría externa?', defaultVal: 'Proveedores locales artesanales' }
      ]
    },
    kpis_referencia: {
      margen_operativo: 0.28,
      punto_equilibrio_diario_tazas: 55,
      retorno_inversion_meses: 14
    }
  },

  lavanderia: {
    id: 'lavanderia',
    name: 'Lavandería y Tintorería Local',
    scian: '812310',
    keywords: ['lavanderia', 'lavandería', 'lavado', 'planchado', 'tintoreria', 'tintorería'],
    frameworkDefault: 'micro_business',
    defaults: {
      produccion: {
        proceso: '1) Recepción y pesado de prendas 2) Clasificación por tipo de tela y color 3) Lavado en ciclos automáticos 4) Secado 5) Doblado y empaque.',
        capacidad_diaria: '120 a 250 kg/día',
        personal_minimo: 2,
        merma_promedio: '1%'
      },
      finanzas: {
        inversion_inicial: '$380,000 MXN (4 Lavadoras + 4 Secadoras industriales gas)',
        margen_bruto_estimado: '55% - 65%',
        costos_fijos_mensuales: {
          renta: 12000,
          luz: 7000,
          gas: 9000,
          agua: 4500,
          sueldos: 16000
        }
      },
      equipo: ['4 Lavadoras industriales de 15 kg', '4 Secadoras industriales a gas', 'Mesa de doblado amplia', 'Sistema de suavización de agua', 'Báscula comercial'],
      preguntas_check: [
        { key: 'precio_por_kilo', label: '¿Precio de cobro por kilo de ropa?', defaultVal: '$22 - $28 MXN/kg' },
        { key: 'modalidad_autoservicio', label: '¿Servicio encargado o autoservicio?', defaultVal: 'Servicio encargado con entrega en 24h' }
      ]
    },
    kpis_referencia: {
      margen_operativo: 0.32,
      punto_equilibrio_diario_kg: 85,
      retorno_inversion_meses: 16
    }
  },

  papeleria: {
    id: 'papeleria',
    name: 'Papelería y Centro de Coplado',
    scian: '453210',
    keywords: ['papeleria', 'papelería', 'copias', 'impresiones', 'útiles', 'engargolado'],
    frameworkDefault: 'micro_business',
    defaults: {
      produccion: {
        proceso: '1) Atención en mostrador 2) Venta de mercadería / Impresión y fotocopiado 3) Servicios adicionales (engargolado, enmicado) 4) Cobro.',
        capacidad_diaria: '50 a 120 atendidos/día',
        personal_minimo: 2,
        merma_promedio: '2%'
      },
      finanzas: {
        inversion_inicial: '$180,000 MXN (Impresoras multifuncionales + inventario de arranque)',
        margen_bruto_estimado: '40% - 50%',
        costos_fijos_mensuales: {
          renta: 7500,
          luz: 3500,
          internet: 800,
          sueldos: 12000
        }
      },
      equipo: ['Multifuncional blanco y negro de alto volumen', 'Multifuncional a color tabloide', 'Engargoladora y enmicadora', 'Guillotina de uso rudo', 'Mostradores y vitrinas'],
      preguntas_check: [
        { key: 'ubicacion_escuela', label: '¿Cercanía con planteles educativos?', defaultVal: '< 300 metros de escuela o gobierno' }
      ]
    },
    kpis_referencia: {
      margen_operativo: 0.25,
      punto_equilibrio_diario_ventas: '$1,800 MXN',
      retorno_inversion_meses: 15
    }
  },

  restaurante: {
    id: 'restaurante',
    name: 'Restaurante / Cocina Económica',
    scian: '722511',
    keywords: ['restaurante', 'cocina', 'comida', 'fondita', 'buffet', 'platillos', 'chef'],
    frameworkDefault: 'business',
    defaults: {
      produccion: {
        proceso: '1) Requisición de insumos frescos 2) Mise en place (picado/marinado) 3) Cocción por comanda 4) Emplatado 5) Servicio al cliente o envío a domicilio.',
        capacidad_diaria: '50 a 120 platillos/día',
        personal_minimo: 4,
        merma_promedio: '5% a 8%'
      },
      finanzas: {
        inversion_inicial: '$450,000 MXN (Cocina industrial + mobiliario de salón)',
        margen_bruto_estimado: '60% - 70%',
        costos_fijos_mensuales: {
          renta: 18000,
          luz: 8000,
          gas: 7000,
          sueldos: 35000
        }
      },
      equipo: ['Estufa industrial de 6 quemadores con horno', 'Plancha y freidora doble', 'Refrigerador y congelador comercial', 'Mesas y sillas para 40 comensales', 'Campana de extracción con trampa de grasa'],
      preguntas_check: [
        { key: 'ticket_platillo', label: '¿Precio medio del platillo/comida corrida?', defaultVal: '$95 - $140 MXN' }
      ]
    },
    kpis_referencia: {
      margen_operativo: 0.18,
      punto_equilibrio_diario_platillos: 40,
      retorno_inversion_meses: 20
    }
  },

  peluqueria: {
    id: 'peluqueria',
    name: 'Barbería / Estética Canina o Humana',
    scian: '812111',
    keywords: ['barberia', 'barbería', 'estética', 'estetica', 'corte', 'cabello', 'peluqueria', 'peluquería'],
    frameworkDefault: 'micro_business',
    defaults: {
      produccion: {
        proceso: '1) Recepción y diagnóstico del cliente 2) Lavado de cabello 3) Corte/Estilizado/Afeitado 4) Aplicación de tratamientos 5) Cobro.',
        capacidad_diaria: '20 a 40 cortes/día',
        personal_minimo: 2,
        merma_promedio: '1%'
      },
      finanzas: {
        inversion_inicial: '$160,000 MXN (Sillones hidráulicos + espejos iluminados + decoración)',
        margen_bruto_estimado: '75% - 85%',
        costos_fijos_mensuales: {
          renta: 10000,
          luz: 3000,
          sueldos_comision: 16000
        }
      },
      equipo: ['Sillones hidráulicos de barbería', 'Espejos con iluminación LED', 'Máquinas de corte profesionales Clipper/Trimmer', 'Esterilizador UV de herramientas', 'Lavacabezas cómodo'],
      preguntas_check: [
        { key: 'precio_corte', label: '¿Precio del corte base?', defaultVal: '$150 - $250 MXN' }
      ]
    },
    kpis_referencia: {
      margen_operativo: 0.35,
      punto_equilibrio_diario_cortes: 8,
      retorno_inversion_meses: 12
    }
  },

  taller_mecanico: {
    id: 'taller_mecanico',
    name: 'Taller Mecánico y Automotriz',
    scian: '811111',
    keywords: ['taller', 'mecanico', 'mecánico', 'automotriz', 'frenos', 'afanacion', 'afinación', 'autos'],
    frameworkDefault: 'business',
    defaults: {
      produccion: {
        proceso: '1) Recepción y escaneo computarizado 2) Presupuesto y autorización del cliente 3) Reparación/Cambio de refacciones 4) Pruebas de manejo 5) Entrega.',
        capacidad_diaria: '4 a 10 vehículos/día',
        personal_minimo: 3,
        merma_promedio: '2%'
      },
      finanzas: {
        inversion_inicial: '$320,000 MXN (Rampas hidráulicas + escáner + herramental)',
        margen_bruto_estimado: '45% - 55%',
        costos_fijos_mensuales: {
          renta: 16000,
          luz: 4000,
          sueldos: 28000
        }
      },
      equipo: ['2 Rampas automotrices de 2 postes', 'Escáner diagnóstico multimarca OBD2', 'Compresor de aire de 100L', 'Caja de herramientas de acero con 300+ piezas', 'Gato hidráulico de patín 3T'],
      preguntas_check: [
        { key: 'rampas_instaladas', label: '¿Número de rampas iniciales?', defaultVal: '2 rampas de servicio' }
      ]
    },
    kpis_referencia: {
      margen_operativo: 0.26,
      punto_equilibrio_diario_servicios: 2,
      retorno_inversion_meses: 15
    }
  },

  tienda_abarrotes: {
    id: 'tienda_abarrotes',
    name: 'Tienda de Abarrotes y Minisúper',
    scian: '461110',
    keywords: ['abarrotes', 'minisuper', 'minisúper', 'tiendita', 'miscelánea', 'miscelanea'],
    frameworkDefault: 'micro_business',
    defaults: {
      produccion: {
        proceso: '1) Recepción y acomodo de mercancía en anaqueles 2) Cobro en punto de venta 3) Control de inventarios y fechas de caducidad.',
        capacidad_diaria: '150 a 300 transacciones/día',
        personal_minimo: 2,
        merma_promedio: '3%'
      },
      finanzas: {
        inversion_inicial: '$220,000 MXN (Inventario inicial + refrigeradores + estantería)',
        margen_bruto_estimado: '20% - 28%',
        costos_fijos_mensuales: {
          renta: 9000,
          luz: 6500,
          sueldos: 14000
        }
      },
      equipo: ['Refrigeradores comerciales vertical/horizontal', 'Sistema de punto de venta con lector de código de barras', 'Anaqueles metálicos reforzados', 'Cámara de seguridad CCTV'],
      preguntas_check: [
        { key: 'superficie_local', label: '¿Superficie estimada del local?', defaultVal: '40 - 70 m²' }
      ]
    },
    kpis_referencia: {
      margen_operativo: 0.12,
      punto_equilibrio_diario_ventas: '$4,500 MXN',
      retorno_inversion_meses: 18
    }
  },

  desarrollo_software: {
    id: 'desarrollo_software',
    name: 'Agencia de Software / App / SaaS',
    scian: '541510',
    keywords: ['software', 'app', 'saas', 'desarrollo', 'programacion', 'programación', 'startup', 'tech', 'plataforma'],
    frameworkDefault: 'agile_startup',
    defaults: {
      produccion: {
        proceso: '1) Descubrimiento y arquitectura de software 2) Sprint de diseño UI/UX 3) Desarrollo Frontend/Backend 4) Pruebas QA 5) Despliegue en la nube CI/CD 6) Mantenimiento.',
        capacidad_diaria: 'Proyectos concurrentes o usuarios activos',
        personal_minimo: 3,
        merma_promedio: '0%'
      },
      finanzas: {
        inversion_inicial: '$120,000 MXN (Equipos de cómputo de alto rendimiento + servidores iniciales + legal)',
        margen_bruto_estimado: '70% - 85%',
        costos_fijos_mensuales: {
          renta: 0, // Remoto por defecto
          servidores_cloud: 4000,
          software_licencias: 3000,
          sueldos: 45000
        }
      },
      equipo: ['Laptops MacBook Pro / Workstations de desarrollo', 'Licencias de software (GitHub, AWS, Figma, Vercel)', 'Monitores 4K de trabajo con soporte ergonómico'],
      preguntas_check: [
        { key: 'modelo_monetizacion', label: '¿Modelo de negocio principal?', defaultVal: 'Suscripción SaaS / Venta por proyecto B2B' }
      ]
    },
    kpis_referencia: {
      margen_operativo: 0.40,
      cac_estimado: '$800 MXN',
      ltv_estimado: '$12,000 MXN'
    }
  }
};

/**
 * Busca un benchmark relevante dentro del catálogo local basado en el texto del emprendedor.
 * @param {string} rawText 
 * @returns {Object|null} Benchmark encontrado o null
 */
export function findBenchmarkByText(rawText) {
  if (!rawText) return null;
  const textLower = rawText.toLowerCase();

  for (const benchmark of Object.values(INDUSTRY_BENCHMARKS)) {
    if (benchmark.keywords.some(keyword => textLower.includes(keyword))) {
      return benchmark;
    }
  }

  return null;
}
