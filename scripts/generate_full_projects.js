import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const PROJECTS = [
  {
    id: 'veterinaria_comunitaria',
    name: 'Veterinaria Comunitaria Patitas de Amor',
    primaryColor: '#059669', // Emerald
    secondaryColor: '#10b981',
    creator: 'Dra. Sofía Morales Ruiz & Grupo Social Comunitario',
    subtitle: 'Plan Estratégico de Salud Animal y Bienestar Comunitario',
    institution: 'Programa de Inclusión y Salud Pública Municipal 2026',
    data: {
      config: {
        projectType: 'business',
        activeMethodologies: ['business'],
        locks: {},
        theme: 'light',
        visibility: {},
        comments: {},
        brandKit: {
          primaryColor: '#059669',
          secondaryColor: '#10b981',
          logoUrl: '',
          companyName: 'Veterinaria Comunitaria "Patitas de Amor"'
        },
        coverDesign: {
          layout: 'modern',
          logoSize: 'medium',
          logoAlign: 'center',
          titleSize: 'medium',
          creatorName: 'Dra. Sofía Morales Ruiz & MVZ Asociados',
          subtitle: 'Plan de Negocios y Salud Animal Comunitaria',
          institution: 'Modelo de Atención Veterinaria Accesible 2026',
          showDate: true,
          customDate: '12 de Agosto de 2026',
          institutionLogos: []
        },
        globalOrientation: 'portrait',
        pageOrientations: {
          canvas: 'landscape',
          estados_financieros: 'landscape',
          pestel: 'landscape'
        },
        moduleOrder: [],
        dataSources: [
          { id: '1', type: 'auto', title: 'Censo Canino y Felino Municipal de Salud', url: 'https://salud.sonora.gob.mx', description: 'Registro de densidad de animales de compañía en colonias de nivel socioeconómico C y D.' },
          { id: '2', type: 'auto', title: 'Colegio de Médicos Veterinarios Zootecnistas', url: 'https://cmv.org.mx', description: 'Tabulador de aranceles y costos de medicamentos veterinarios esenciales.' }
        ],
        search: { provider: 'tavily', tavilyApiKey: '', enableDdg: false },
        regionalSettings: { country: 'Mexico', economicBloc: 'NAFTA', classificationSystem: 'SCIAN', currency: 'MXN' },
        projectId: 'veterinaria_comunitaria'
      },
      semilla: {
        negocio: {
          nombre_marca: 'Veterinaria Comunitaria Patitas de Amor',
          sector: 'Servicios Veterinarios y Salud Animal',
          ubicacion: 'Colonia La Esperanza, Hermosillo, Sonora'
        },
        finanzas: {
          inversion_total: '380000',
          costos_fijos: '32000',
          meta_ingresos: '750000'
        },
        perfil_fundador: {
          area_fuerte: 'Operativo',
          area_secundaria: 'Finanzas',
          area_a_delegar: 'Administrativo',
          diagnostico_cuantico: 'Perfil saludable de 2 áreas. Delegación estructurada de administración de compras y gestión de citas.'
        }
      },
      naturaleza: {
        introduccion: {
          justificacion: 'En la colonia La Esperanza y sectores circundantes habitan más de 5,000 familias con una población estimada de 6,500 perros y gatos. Las clínicas veterinarias comerciales del centro cobran entre $500 y $900 MXN por consulta básica, haciendo prohibitiva la atención para familias con ingresos medios y bajos. Esto deriva en abandono, sobrepoblación callejera y riesgos zoonóticos (rabia, rickettsia, parásitos). Patitas de Amor establece un modelo de clínica veterinaria comunitaria de alta calidad con tarifas escalonadas y programas preventivos.',
          origen: 'Iniciativa promovida por médicas veterinarias zootecnistas y líderes vecinales para proveer atención médica, vacunación y esterilización accesible con sostenibilidad económica.',
          nombre: 'Veterinaria Comunitaria Patitas de Amor S.A.S. de C.V.',
          descripcion: 'Centro veterinario integral comunitario con servicios de consulta médica general, quirófano de esterilización, farmacia veterinaria genérica, laboratorio de diagnóstico rápido, estética canina higiénica y campañas mensuales de desparasitación.'
        },
        identidad: {
          mision: 'Proveer servicios médicos veterinarios profesionales, éticos y compasivos a costos accesibles para todas las familias de la comunidad, fomentando la tenencia responsable y erradicando el sufrimiento animal prevenible.',
          vision: 'Ser el centro de salud animal comunitario modelo en Sonora para 2028, reconocido por su excelencia clínica, impacto social medible y autosostenibilidad financiera.',
          valores: '1. Compasión y Respeto a la Vida Animal.\n2. Ética Profesional y Transparencia en Precios.\n3. Accesibilidad e Inclusión Social.\n4. Higiene y Bioseguridad Hospitalaria.\n5. Compromiso Comunitario y Educación Preventiva.',
          imagen: 'Verde esmeralda (salud, vida) y blanco puro (higiene y calidez). Isotipo: Silueta estilizada de perro y gato abrazados por una mano protectora en forma de corazón.'
        },
        objetivos: {
          general: 'Establecer y operar una clínica veterinaria comunitaria financieramente autosustentable con capacidad para realizar 400 consultas y 80 esterilizaciones mensuales en su primer año.',
          especificos: '• Acondicionar quirófano estéril y 2 consultorios equipados con ecógrafo y rayos X digital portátil.\n• Alcanzar una tasa de recuperación del 95% en consultas ambulatorias y cirugías menores.\n• Realizar 12 campañas masivas de esterilización y vacunación comunitaria al año.\n• Lograr el punto de equilibrio financiero antes del mes 5 de operación.',
          metas: 'Facturar $750,000 MXN en el primer año con un margen neto del 22%, reinvirtiendo el 30% de utilidades en fondos de esterilización gratuita para animales en situación de calle.'
        },
        foda: {
          fortalezas: 'Equipo médico titulado con cédula profesional y alta vocación social. Ubicación estratégica en el corazón de la colonia. Tarifas entre 40% y 60% por debajo de clínicas de lujo. Alianzas con proveedores mayoristas de biológicos y fármacos.',
          oportunidades: 'Alta densidad de mascotas por hogar en la zona sur. Programas de salud pública municipal que buscan convenios para control de rickettsia. Creciente sensibilización comunitaria sobre adopción y esterilización.',
          debilidades: 'Capacidad de hospitalización intensiva limitada en etapa inicial (máximo 6 jaulas de recuperación). Presupuesto de marketing tradicional reducido.',
          amenazas: 'Campañas esporádicas de vacunación gratuita del gobierno que reducen temporalmente la demanda de biológicos. Incremento en precios de anestésicos e insumos médicos de importación.'
        },
        pestel: {
          politico: 'Leyes estatales de protección y bienestar animal que sancionan el maltrato e impulsan la esterilización obligatoria.',
          economico: 'Inflación en el costo de alimentos para mascotas que incrementa la búsqueda de clínicas con precios accesibles.',
          social: 'Humanización de las mascotas y cambio cultural: los animales de compañía son considerados miembros de la familia.',
          tecnologico: 'Adopción de expedientes clínicos digitales y recordatorios de vacunas automáticos vía WhatsApp Business.',
          ecologico: 'Manejo estricto de Residuos Peligrosos Biológico-Infecciosos (RPBI) conforme a la NOM-087-SEMARNAT-SSA1.',
          legal: 'Regulación de COFEPRIS para manejo de psicotrópicos veterinarios (ketamina, xilacina) y registro ante SENASICA.'
        },
        legal: {
          constitucion: 'Sociedad por Acciones Simplificada de Capital Variable (S.A.S. de C.V.) con cláusula social.',
          socios: 'Dra. Sofía Morales Ruiz (60%), MVZ Juan Pablo Encinas (40%).',
          permisos: 'RFC ante SAT, Licencia Sanitaria Municipal, Permiso de Manejo de Biológicos SENASICA, Registro Generador RPBI SEMARNAT.'
        },
        canvas: {
          socios_clave: 'Distribuidores farmacéuticos veterinarios (Virbac, Boehringer, Lapisa), Refugios de rescate animal locales, Notaría y Ayuntamiento de Hermosillo.',
          actividades_clave: 'Consulta clínica general, Cirugías menores y esterilizaciones, Vacunación y desparasitación, Venta de fármacos y alimento por kilo.',
          recursos_clave: 'Quirófano esterilizado, Lámpara quirúrgica LED, Autoclave, Concentrador de oxígeno, Mesa de exploración de acero inoxidable.',
          propuestas_valor: 'Atención médica veterinaria profesional, cálida y de alta calidad a precios justos de alcance comunitario, con facilidades de pago y enfoque preventivo.',
          relaciones_clientes: 'Trato personalizado y empático, seguimiento post-operatorio vía WhatsApp, carnet de vacunación digital.',
          canales: 'Clínica física a pie de calle, canal de WhatsApp para citas y urgencias, página de Facebook con consejos veterinarios.',
          segmentos_clientes: 'Familias de colonias populares con perros o gatos, rescatistas independientes, dueños primerizos de mascotas.',
          estructura_costos: 'Nómina médica y técnica, adquisición de fármacos y material de curación, renta de local, servicio de recolección RPBI, servicios públicos.',
          fuentes_ingresos: 'Cobro de consultas ($150 MXN), Esterilizaciones ($450-$700 MXN), Vacunación ($180-$250 MXN), Venta de farmacia y accesorios.'
        }
      },
      mercado: {
        analisis: {
          producto: 'Paquete de Consulta Médica General, Desparasitación interna y externa, Cuadro completo de vacunación (Quíntuple, Rabia, Felina), Cirugía de esterilización ovariohisterectomía y orquiectomía, Curaciones y urgencias menores.',
          valor: 'Atención sin esperas excesivas, diagnósticos honestos sin pruebas innecesarias para inflar la cuenta, y tarifas justas que permiten al dueño completar los tratamientos.',
          demanda: 'Estimada en 450 pacientes mensuales en el radio de 3 km, con pico en fines de semana y temporadas de calor por parásitos.',
          cliente: 'Madres y padres de familia, jóvenes profesionistas y adultos mayores que aman a sus mascotas pero cuentan con presupuestos moderados.',
          ciclo_vida: 'Servicio de demanda constante a lo largo de toda la vida de la mascota (8 a 15 años de relación con el cliente).'
        },
        segmentacion: {
          tam: 'Mercado de servicios veterinarios en Hermosillo (~$180M MXN anuales en 220,000 mascotas registradas).',
          sam: 'Mercado de colonias populares y zonas sur/poniente (~$35M MXN anuales).',
          som: 'Mercado meta inicial de $900,000 MXN anuales en los primeros 2 años (captura del 2.5% del SAM local).',
          perfil: 'Hombres y mujeres de 20 a 65 años, dueños de 1 a 3 mascotas mestizas o de raza mediana, con ingresos familiares de $10,000 a $28,000 MXN mensuales.',
          sensibilidad_demanda: 'Alta elasticidad ante promociones de esterilización y vacunación en paquete.'
        },
        mapa: {
          analisis_espacial: 'La colonia La Esperanza cuenta con un déficit de 3 clínicas veterinarias formales en un radio de 2.5 km a la redonda.'
        },
        competencia: {
          competidores: 'Clínicas veterinarias de alta gama en Blvd. Colosio (distantes y caras), forrajeras informales que venden antibióticos sin receta, campañas gubernamentales ocasionales.',
          ventajas: 'Presencia fija en la colonia, médicos titulados, quirófano formal con monitoreo anestésico y precios al 50% de las clínicas de centros comerciales.'
        },
        benchmarking: {
          comparativa: 'A diferencia de las forrajeras que no tienen médicos o las clínicas de lujo con costos prohibitivos, Patitas de Amor ofrece el estándar hospitalario a precio solidario.',
          matriz: {
            metricas_operativas: [
              { criterio: 'Costo Consulta General', nuestro_modelo: '$150 MXN (Accesible)', comparador: '$450 - $650 MXN (Tradicional)', grandes_cadenas: '$700 - $900 MXN (Cadenas)' },
              { criterio: 'Esterilización Canina', nuestro_modelo: '$500 MXN (Incluye analgesia)', comparador: '$1,200 - $1,800 MXN', grandes_cadenas: '$2,500 - $4,000 MXN' },
              { criterio: 'Quirófano Equipado', nuestro_modelo: 'Autoclave + Monitor de Signos', comparador: 'Básico', grandes_cadenas: 'Hospitalario' },
              { criterio: 'Tiempo de Espera', nuestro_modelo: '< 20 minutos con cita WhatsApp', comparador: 'Variable (Fila)', grandes_cadenas: 'Previa Cita' }
            ]
          }
        },
        comercializacion: {
          distribucion: 'Consultorio físico céntrico con área de espera techada y servicio de entrega a domicilio para medicamentos en la colonia.',
          promocion: 'Campañas en redes sociales (Facebook y TikTok comunitario), carteles informativos en escuelas y tienditas de abarrotes, jornadas sabatinas de desparasitación gratuita.',
          identidad: 'Verde esmeralda y blanco. Imagen médica, confiable, cariñosa y pulcra.',
          canales_intermediarios: 'Alianzas con refugios y rescatistas independientes que canalizan casos comunitarios.'
        },
        ventas: {
          precios: 'Consulta: $150 MXN. Vacuna Séxtuple: $220 MXN. Esterilización: $500 MXN. Desparasitación: $60 MXN. Paquete Cachorro: $480 MXN.',
          estrategia: 'Paquetes preventivos anuales con descuento y carnet digital de seguimiento.',
          proyeccion_volumen: 'Año 1: 4,800 consultas y 960 cirugías. Año 2: Crecimiento proyectado del 25% por recomendación de boca en boca.',
          tacticas_precio: 'Descuento del 15% para dueños con más de 2 mascotas esterilizadas en el centro.'
        }
      },
      tecnico: {
        ubicacion: {
          macro: 'Sonora, México (Municipio de Hermosillo)',
          micro: 'Colonia La Esperanza, Zona Sur',
          local: 'Local comercial de 95m² equipado con sala de espera, 2 consultorios, quirófano estéril, área de recuperación/hospitalización, farmacia y baño.'
        },
        operacion: {
          proceso: '1. Recepción y triaje de signos vitales. 2. Consulta diagnóstica y exploración física. 3. Prescripción de tratamiento o programación quirúrgica. 4. Cirugía con anestesia inhalatoria y monitoreo. 5. Recuperación asistida y entrega con carnet digital.',
          diagrama: 'graph TD\nA[Llegada del Paciente] --> B[Triaje y Peso]\nB --> C[Consulta Médica]\nC -->|Tratamiento Simple| D[Farmacia e Inyecciones]\nC -->|Cirugía| E[Pre-operatorio y Quirófano]\nE --> F[Recuperación en Jaula]\nF --> G[Alta y Carnet Digital]',
          tecnologia: 'Software veterinario en la nube para expedientes clínicos, ecógrafo doppler portátil, máquina de anestesia inhalatoria y monitor multiparámetro.',
          economias_escala: 'Compra por volumen de vacunas y antibióticos directo de laboratorio con 35% de descuento.',
          tipo_proceso: 'Servicio médico ambulatorio y quirúrgico estandarizado con guías clínicas veterinarias.'
        },
        recursos: {
          maquinaria: 'Máquina de anestesia inhalatoria con vaporizador de isoflurano ($45,000), Monitor multiparámetros veterinario ($22,000), Autoclave de vapor de 18L ($18,000).',
          equipo: 'Mesa quirúrgica hidráulica de acero inoxidable ($16,000), Lámpara de chicote LED ($6,500), Concentrador de oxígeno grado médico ($14,000), 2 Mesas de exploración ($12,000).',
          herramientas: 'Juego de instrumental quirúrgico de cirugía general (2 sets completos), Fonendoscopios Littmann veterinarios, Otoscopio y Oftalmoscopio Welch Allyn, Termómetros digitales infrarrojos.'
        },
        insumos: {
          materia_prima: 'Biológicos y vacunas (Parvovirus, Moquillo, Rabia, Triple Felina), Antibióticos y analgésicos inyectables, Suturas absorbibles (Ácido Poliglicólico), Gasas estériles, Guantes quirúrgicos, Antisépticos (Clorhexidina, Yodopovidona).',
          proveedores: 'Distribuidora Veterinaria del Noroeste (Hermosillo), Boehringer Ingelheim, Virbac México, Proveedora Médica Quirúrgica de Sonora.',
          compras: 'Reabastecimiento quincenal programado con stock de seguridad de 30 días para fármacos de alta rotación.'
        },
        capacidad: {
          instalada: 'Capacidad máxima de 25 consultas diarias y 6 procedimientos quirúrgicos diarios (hasta 750 pacientes/mes).',
          inventarios: 'Manejo estricto por método PEPS (Primeras Entradas, Primeras Salidas) con semaforización de caducidades a 90 días.',
          mano_obra: '2 Médicos Veterinarios Zootecnistas titulados y 1 Auxiliar Técnico Veterinario.',
          punto_reorden: 'Alerta automática al llegar al 20% del stock mínimo en biológicos y anestésicos.'
        },
        operativa: {
          otd: '98% de citas iniciadas en menos de 10 minutos de la hora programada.',
          rotacion: 'Rotación de inventario farmacéutico cada 21 días.',
          dso: '0 días (cobro de contado inmediato en efectivo o terminal bancaria).',
          dpo: '21 días de crédito con distribuidores farmacéuticos.',
          ccc: 'Ciclo de conversión de efectivo negativo de 10 días.'
        },
        ambiental: {
          impacto: 'Generación controlada de residuos biológico-infecciosos (jeringas, agujas, gasas con sangre, tejidos orgánicos).',
          mitigacion: 'Contenedores rígidos rojos para punzocortantes y bolsas amarillas selladas para biológicos; recolección quincenal por empresa certificada por SEMARNAT.',
          normatividad: 'NOM-087-SEMARNAT-SSA1-2002 (Manejo de RPBI), NOM-012-ZOO-1993 (Regulación de productos químicos y farmacéuticos veterinarios), Reglamento Municipal de Ecología y Protección Civil.'
        }
      },
      organizacion: {
        estructura: {
          organigrama_visual: 'graph TD\nA[Directora Médica / Dra. Sofía Morales] --> B[Médico Veterinario de Turno]\nA --> C[Auxiliar Técnico y Quirófano]\nA --> D[Recepción y Gestión Administrativa]',
          puestos: 'Directora Médica General, Médico Veterinario Clínico, Auxiliar Técnico Veterinario, Recepcionista y Control de Citas.',
          funciones: 'Directora: Cirugías complejas, compras y dirección clínica. Médico: Consultas generales y medicina preventiva. Auxiliar: Esterilización de instrumental, sujeción y asistencia en quirófano. Recepción: Cobro, expedientes y atención al público.'
        },
        recursos_humanos: {
          reclutamiento: 'Convocatoria a egresados de Medicina Veterinaria de la Universidad de Sonora (UNISON) con vocación comunitaria.',
          contratacion: 'Contrato por tiempo indeterminado con todas las prestaciones de ley (IMSS, Infonavit, aguinaldo 15 días, vacaciones según LFT).',
          sueldos: 'Nómina mensual total de $44,000 MXN para el equipo de 4 personas, con capacitación continua pagada.'
        },
        inversion: {
          inversion_fija: 'Inversión fija en equipamiento médico y quirófano: $240,000 MXN (Autoclave, máquina de anestesia, mesas quirúrgicas, lámparas, instrumental).',
          inversion_diferida: 'Acondicionamiento de local, permisos de salubridad y software médico: $60,000 MXN.',
          opex_inicial: 'Capital de trabajo para 3 meses e inventario farmacéutico inicial: $80,000 MXN.',
          financiamiento: 'Aportación de socias fundadoras: $190,000 MXN (50%); Crédito productivo blando: $190,000 MXN (50%).',
          monto_total: '$380,000 MXN',
          desglose_capex_json: JSON.stringify([
            { concepto: 'Máquina de Anestesia Inhalatoria e Isoflurano', tipo: 'Activo Fijo', monto: 45000 },
            { concepto: 'Monitor Multiparámetros Quirúrgico', tipo: 'Activo Fijo', monto: 22000 },
            { concepto: 'Autoclave de Vapor Grado Médico 18L', tipo: 'Activo Fijo', monto: 18000 },
            { concepto: 'Mesa Quirúrgica Hidráulica Acero Inox', tipo: 'Activo Fijo', monto: 16000 },
            { concepto: 'Concentrador de Oxígeno 10L', tipo: 'Activo Fijo', monto: 14000 },
            { concepto: '2 Mesas de Exploración Veterinaria', tipo: 'Activo Fijo', monto: 12000 },
            { concepto: 'Ecógrafo Portátil de Diagnóstico', tipo: 'Activo Fijo', monto: 48000 },
            { concepto: 'Lámparas Quirúrgicas LED e Instrumental', tipo: 'Activo Fijo', monto: 25000 },
            { concepto: 'Equipo de Cómputo y TPV', tipo: 'Activo Fijo', monto: 20000 },
            { concepto: 'Acondicionamiento y Pintura Epóxica', tipo: 'Activo Diferido', monto: 35000 },
            { concepto: 'Permisos, Licencias y Registro RPBI', tipo: 'Activo Diferido', monto: 25000 },
            { concepto: 'Stock Farmacéutico y Biológicos Inicial', tipo: 'Capital de Trabajo', monto: 50000 },
            { concepto: 'Fondo de Maniobra Operativo (3 Meses)', tipo: 'Capital de Trabajo', monto: 50000 }
          ])
        },
        costos: {
          fijos: 'Costos fijos mensuales de $32,000 MXN (Renta local $9,000, Servicios $4,500, Recolección RPBI $1,500, Nómina administrativa base $17,000).',
          variables: 'Costos variables de $65 MXN promedio por consulta y $180 MXN por cirugía (biológicos, gasas, fármacos, suturas).',
          unitario: 'Costo unitario promedio ponderado de atención clínica de $85 MXN.',
          desglose_opex_json: JSON.stringify([
            { categoria: 'Renta', tipo: 'Fijo', concepto: 'Renta local comercial 95m²', mensual: 9000 },
            { categoria: 'Servicios', tipo: 'Fijo', concepto: 'Electricidad, agua e internet simétrico', mensual: 4500 },
            { categoria: 'Ecológico', tipo: 'Fijo', concepto: 'Servicio mensual recolección RPBI', mensual: 1500 },
            { categoria: 'Software', tipo: 'Fijo', concepto: 'Licencia sistema expedientes veterinarios', mensual: 1200 },
            { categoria: 'Nómina Fija', tipo: 'Fijo', concepto: 'Sueldos fijos administrativos y aux', mensual: 15800 },
            { categoria: 'Insumos Médicos', tipo: 'Variable', concepto: 'Fármacos, jeringas y suturas por paciente', mensual: 14000 },
            { categoria: 'Biológicos', tipo: 'Variable', concepto: 'Vacunas quíntuples y antirrábicas', mensual: 9000 },
            { categoria: 'Comercial', tipo: 'Variable', concepto: 'Material impreso y difusión local', mensual: 2000 }
          ])
        },
        estados_financieros: {
          resultados: 'Proyección anual: Ventas estimadas de $750,000 MXN en Año 1, creciendo a $980,000 en Año 2 y $1,250,000 en Año 3. Utilidad neta Año 1 de $168,000 MXN (Margen Neto 22.4%).',
          balance: 'Estructura financiera sólida con 0 pasivos bancarios de largo plazo al año 3 y activos totales superiores a $620,000 MXN.',
          flujo_caja: 'Flujo de efectivo operativo positivo acumulado de $195,000 MXN al cierre del primer año.',
          amortizacion_creditos: 'Crédito blando de $190,000 amortizable a 36 meses con tasa preferencial del 12% anual.',
          memorias_calculo: 'Memoria de cálculo basada en 24 días laborables por mes con 18 pacientes diarios promedio.',
          ingresos_json: JSON.stringify([
            { concepto: 'Consultas Médicas Generales', mensual: 28000, anual: 336000, crecimiento: 12 },
            { concepto: 'Cirugías de Esterilización y Menores', mensual: 18000, anual: 216000, crecimiento: 15 },
            { concepto: 'Vacunación y Medicina Preventiva', mensual: 11500, anual: 138000, crecimiento: 10 },
            { concepto: 'Venta de Farmacia y Antiparasitarios', mensual: 5000, anual: 60000, crecimiento: 8 }
          ])
        },
        rentabilidad: {
          punto_equilibrio: 'Punto de equilibrio operativo mensual: $48,500 MXN de facturación (equivalente a 160 consultas y 25 esterilizaciones al mes).',
          indicadores: 'Indicadores Financieros Pro-Forma:\n- TIR: 38.6%\n- VAN (Tasa 12%): $215,400 MXN\n- Relación B/C: 1.54\n- Payback (Retorno de Inversión): 2.1 años.',
          relacion_bc: '1.54 (Por cada peso invertido, el proyecto genera 1.54 pesos de beneficio económico y social).'
        },
        staff: [
          { id: '1', role: 'Directora Médica General / Cirujana', department: 'Médico', salary: 18000, riskClass: 2, type: 'permanente', reportsTo: null },
          { id: '2', role: 'Médico Veterinario Zootecnista', department: 'Médico', salary: 14000, riskClass: 2, type: 'permanente', reportsTo: '1' },
          { id: '3', role: 'Auxiliar Técnico Veterinario', department: 'Operativo', salary: 8000, riskClass: 2, type: 'permanente', reportsTo: '1' },
          { id: '4', role: 'Recepcionista y Control de Citas', department: 'Administrativo', salary: 7000, riskClass: 1, type: 'permanente', reportsTo: '1' }
        ]
      }
    }
  },
  {
    id: 'abarrotes_colonia',
    name: 'Abarrotes La Esquinita',
    primaryColor: '#d97706', // Amber / Gold
    secondaryColor: '#f59e0b',
    creator: 'Don Rogelio Méndez & Familia',
    subtitle: 'Plan de Negocios de Comercio Minorista y Abasto Familiar',
    institution: 'Programa de Desarrollo Comercial y Emprendimiento Familiar 2026',
    data: {
      config: {
        projectType: 'business',
        activeMethodologies: ['business'],
        locks: {},
        theme: 'light',
        visibility: {},
        comments: {},
        brandKit: {
          primaryColor: '#d97706',
          secondaryColor: '#f59e0b',
          logoUrl: '',
          companyName: 'Abarrotes "La Esquinita"'
        },
        coverDesign: {
          layout: 'classic',
          logoSize: 'medium',
          logoAlign: 'center',
          titleSize: 'medium',
          creatorName: 'Rogelio Méndez Valenzuela',
          subtitle: 'Plan Comercial Maestro de Tienda de Conveniencia Local',
          institution: 'Modelo de Autoservicio y Comercio Comunitario 2026',
          showDate: true,
          customDate: '12 de Agosto de 2026',
          institutionLogos: []
        },
        globalOrientation: 'portrait',
        pageOrientations: {
          canvas: 'landscape',
          estados_financieros: 'landscape',
          pestel: 'landscape'
        },
        moduleOrder: [],
        dataSources: [
          { id: '1', type: 'auto', title: 'INEGI DENUE Comercio al por menor', url: 'https://www.inegi.org.mx', description: 'Directorio de abarrotes y misceláneas en sector Hermosillo Sur.' },
          { id: '2', type: 'auto', title: 'Central de Abastos de Hermosillo', url: 'https://abastoshermosillo.com', description: 'Lista de precios mayoristas de granos, lácteos y perecederos.' }
        ],
        search: { provider: 'tavily', tavilyApiKey: '', enableDdg: false },
        regionalSettings: { country: 'Mexico', economicBloc: 'NAFTA', classificationSystem: 'SCIAN', currency: 'MXN' },
        projectId: 'abarrotes_colonia'
      },
      semilla: {
        negocio: {
          nombre_marca: 'Abarrotes La Esquinita',
          sector: 'Comercio al por menor de abarrotes y alimentos',
          ubicacion: 'Colonia San Juan, Hermosillo, Sonora'
        },
        finanzas: {
          inversion_total: '290000',
          costos_fijos: '24000',
          meta_ingresos: '920000'
        },
        perfil_fundador: {
          area_fuerte: 'Operativo',
          area_secundaria: 'Administrativo',
          area_a_delegar: 'Finanzas',
          diagnostico_cuantico: 'Perfil equilibrado de atención y logística. Delegación de contabilidad y control fiscal.'
        }
      },
      naturaleza: {
        introduccion: {
          justificacion: 'En la Colonia San Juan residen más de 3,200 habitantes (750 hogares). La tienda de autoservicio más cercana se encuentra a más de 1.8 km de distancia, lo que obliga a las familias y adultos mayores a caminar más de 25 minutos o pagar transporte colectivo solo para adquirir productos básicos de la canasta alimentaria (tortillas, leche, huevos, frijol, verduras frescas). Abarrotes La Esquinita resuelve este desabasto con un punto de venta moderno, limpio, surtido y con servicio de entrega a domicilio para personas de la tercera edad y familias.',
          origen: 'Proyecto familiar fundamentado en 15 años de experiencia en ventas al por menor y logística de abasto en mercados populares.',
          nombre: 'Abarrotes La Esquinita S.A.S. de C.V.',
          descripcion: 'Tienda de abarrotes moderna y autoservicio comunitario que ofrece productos de la canasta básica, lácteos, salchichonería, frutas y verduras frescas de mercado de abastos, panadería diaria, recargas telefónicas y pago de servicios.'
        },
        identidad: {
          mision: 'Abastecer a las familias de la colonia con productos frescos, de primera calidad y a precios justos, brindando una atención cálida, rápida y cercana que facilite la vida cotidiana de nuestros vecinos.',
          vision: 'Ser la tienda de abarrotes preferida y referente de confianza en la colonia San Juan, destacando por nuestro surtido completo, frescura diaria y servicio a domicilio de excelencia.',
          valores: '1. Honestidad y Precios Justos.\n2. Frescura y Calidad Garantizada.\n3. Calidez y Cercanía con el Vecino.\n4. Higiene Rigurosa y Orden.\n5. Puntualidad y Compromiso de Abasto.',
          imagen: 'Amarillo mostaza (energía, calidez comercial) y verde oliva (frescura, naturaleza). Isotipo: Una casita esquinada acogedora con un carrito de mandado sonriente.'
        },
        objetivos: {
          general: 'Consolidar una tienda de abarrotes moderna y altamente rentable que atienda un promedio de 160 transacciones diarias en su primer año de operación en la Colonia San Juan.',
          especificos: '• Acondicionar un local de 80m² con anaqueles modulares, cámara refrigerada de 3 puertas y sistema TPV.\n• Mantener un catálogo activo de más de 1,200 códigos SKU de alta rotación.\n• Desarrollar una ruta de reparto a domicilio que atienda a 30 hogares diarios.\n• Lograr el punto de equilibrio operativo antes del mes 4.',
          metas: 'Alcanzar una facturación anual de $920,000 MXN en el año 1 con un margen bruto comercial del 24% y un crecimiento del 15% anual.'
        },
        foda: {
          fortalezas: 'Ubicación privilegiada en la esquina con mayor flujo peatonal y vehicular de la colonia. Relación directa y descuentos por volumen con la Central de Abastos. Sistema TPV con control de inventario y cobro con tarjeta.',
          oportunidades: 'Alta densidad poblacional sin tienda de autoservicio de conveniencia en un radio de 15 cuadras. Incorporación de servicios de cobro digital (CFE, Telmex, recargas) que atraen tráfico diario.',
          debilidades: 'Capital de trabajo inicial limitado para compras masivas de mayoreo en abarrotes secos. Espacio de exhibición limitado a 80m².',
          amenazas: 'Posible apertura futura de una tienda de cadena de conveniencia nacional (Oxxo). Inflación en precios de productos básicos que reduzca el margen comercial.'
        },
        pestel: {
          politico: 'Programas estatales de apoyo al pequeño comercio y digitalización de tienditas.',
          economico: 'Preferencia de los consumidores por compras de proximidad y tickets menores diarios para administrar el presupuesto familiar.',
          social: 'Comunidad vecinal sólida con alto valor por el trato personal y la confianza barrial.',
          tecnologico: 'Integración de terminales Clip/MercadoPago para cobro con tarjeta y transferencias SPEI.',
          ecologico: 'Eliminación progresiva de bolsas plásticas de un solo uso mediante incentivo a bolsas de tela reutilizables.',
          legal: 'Cumplimiento con normas de salubridad para venta de alimentos empaquetados y lácteos (NOM-251-SSA1).'
        },
        legal: {
          constitucion: 'Sociedad por Acciones Simplificada de Capital Variable (S.A.S. de C.V.) o RESICO.',
          socios: 'Rogelio Méndez Valenzuela (70%), Carmen Salinas Ochoa (30%).',
          permisos: 'RFC SAT, Licencia de Funcionamiento Mercantil del Ayuntamiento, Dictamen de Protección Civil Municipal.'
        },
        canvas: {
          socios_clave: 'Central de Abastos de Hermosillo, Grupo Bimbo, Coca-Cola FEMSA, Lala, Sigma Alimentos, Proveedores de frutas del Valle del Yaqui.',
          actividades_clave: 'Compra matutina de perecederos frescos, exhibición ordenada y rotación de anaqueles, atención al cliente en mostrador, servicio de reparto a domicilio.',
          recursos_clave: 'Local comercial esquinero, Vitrina refrigerada de carnes frías, Enfriador vertical de lácteos, Sistema POS con lector de código de barras.',
          propuestas_valor: 'Todo el mandado del hogar a pasos de su casa, con frescura diaria, precios competitivos y entrega a domicilio sin costo para adultos mayores.',
          relaciones_clientes: 'Trato personalizado por nombre, libreta de apartados especiales y canal de pedidos rápidos por WhatsApp.',
          canales: 'Tienda física de mostrador y autoservicio, pedidos telefónicos y WhatsApp.',
          segmentos_clientes: 'Amas de casa, jefes de familia, adultos mayores y trabajadores de la Colonia San Juan.',
          estructura_costos: 'Compra de mercancía e inventario, renta de local, energía eléctrica para refrigeración, sueldos de empleados, comisiones TPV.',
          fuentes_ingresos: 'Venta de productos de abarrotes (margen 18-28%), Venta de verduras/frutas (margen 35%), Comisiones por recargas y servicios.'
        }
      },
      mercado: {
        analisis: {
          producto: 'Abarrotes secos (arroz, frijol, azúcar, harinas, aceites, pastas), Lácteos y embutidos, Frutas y verduras frescas seleccionadas, Panadería y tortillería caliente diaria, Bebidas y botanas, Artículos de limpieza del hogar e higiene personal.',
          valor: 'Ahorro de tiempo y dinero en pasajes para los vecinos, garantizando productos siempre frescos y con fechas de caducidad vigentes.',
          demanda: 'Estimada en 160 a 220 visitas diarias por cliente con un ticket promedio de $55 a $140 MXN.',
          cliente: 'Familias de la colonia que realizan compras diarias para el menú del día y compras de fin de semana.',
          ciclo_vida: 'Demanda diaria esencial y no cíclica (resiliente ante crisis económicas).'
        },
        segmentacion: {
          tam: 'Mercado de comercio al por menor en Hermosillo (~$1,800M MXN anuales).',
          sam: 'Mercado de abasto en colonias populares del sector sur (~$120M MXN anuales).',
          som: 'Mercado objetivo de $1.1M MXN anuales en la zona de influencia de la Colonia San Juan.',
          perfil: 'Familias con 3 a 5 integrantes que preparan alimentos en casa diariamente.',
          sensibilidad_demanda: 'Moderada en productos de marca líder; alta lealtad ante buen trato y frescura en perecederos.'
        },
        mapa: {
          analisis_espacial: 'Punto estratégico en esquina con flujo natural de peatones que se dirigen a las paradas de autobús escolar y laboral.'
        },
        competencia: {
          competidores: 'Misceláneas pequeñas con surtido incompleto y precios altos, supermercados distantes a más de 1.8 km.',
          ventajas: 'Mayor variedad y orden visual, productos de salchichonería rebanados al momento, terminal bancaria y servicio a domicilio.'
        },
        benchmarking: {
          comparativa: 'A diferencia de las misceláneas tradicionales oscuras y con poca variedad, La Esquinita implementa layout de minisúper moderno y luminoso.',
          matriz: {
            metricas_operativas: [
              { criterio: 'Variedad de Códigos SKU', nuestro_modelo: '> 1,200 códigos activos', comparador: '300 - 450 códigos', grandes_cadenas: '> 2,500 códigos' },
              { criterio: 'Cobro con Tarjeta', nuestro_modelo: 'Sin comisión extra', comparador: 'Solo efectivo / Con recargo', grandes_cadenas: 'Todas las tarjetas' },
              { criterio: 'Frescura en Verduras', nuestro_modelo: 'Abasto 3 veces por semana', comparador: 'Semanal / Merma visible', grandes_cadenas: 'Cámaras frías' },
              { criterio: 'Servicio a Domicilio', nuestro_modelo: 'Reparto en bicicleta en 15 min', comparador: 'No disponible', grandes_cadenas: 'Apps con costo alto' }
            ]
          }
        },
        comercializacion: {
          distribucion: 'Venta directa en tienda física y entrega en moto/bicicleta de carga para pedidos de la colonia.',
          promocion: 'Pizarrón exterior con ofertas del día en frutas y verduras, volantes casa por casa en la inauguración, grupo de WhatsApp de avisos y promociones.',
          identidad: 'Colores cálidos, rotulación profesional, uniforme limpio para el personal con mandil corporativo.',
          canales_intermediarios: 'Venta directa al consumidor final.'
        },
        ventas: {
          precios: 'Precios alineados a la Central de Abastos + margen de conveniencia moderado (18% en abarrotes empaquetados, 35% en frutas y verduras).',
          estrategia: 'Estrategia de precios gancho en tortilla, huevo y leche para generar tráfico diario y venta cruzada de otros productos.',
          proyeccion_volumen: 'Año 1: 58,000 transacciones anuales con ticket promedio de $68 MXN. Año 2: Crecimiento del 15% en ticket promedio.',
          tacticas_precio: 'Miércoles de tianguis con 10% de descuento en frutas y verduras seleccionadas.'
        }
      },
      tecnico: {
        ubicacion: {
          macro: 'Sonora, México (Hermosillo)',
          micro: 'Colonia San Juan, Calle Principal y 3ra',
          local: 'Local comercial en esquina de 80m² con cortinas metálicas, piso cerámico de alto tráfico y bodega posterior de 20m².'
        },
        operacion: {
          proceso: '1. Recepción matutina de mercancía y pesaje. 2. Acomodo cronológico en anaquel (PEPS). 3. Apertura de tienda (6:30 am). 4. Registro y cobro de productos en escáner TPV. 5. Despacho y entrega a domicilio. 6. Cuadre de caja y cierre (10:00 pm).',
          diagrama: 'graph TD\nA[Recepción de Proveedores] --> B[Etiquetado y Registro TPV]\nB --> C[Acomodo PEPS en Anaquel]\nC --> D[Atención y Cobro al Cliente]\nD --> E[Entrega en Tienda o Domicilio]\nE --> F[Corte de Caja Diario]',
          tecnologia: 'Punto de Venta con pantalla táctil, lector láser omnidireccional, báscula digital conectada a caja e impresora térmica de tickets.',
          economias_escala: 'Compras consolidadas de bultos de azúcar, frijol y arroz para empaque con marca propia y mayor margen.',
          tipo_proceso: 'Comercio minorista con abastecimiento ágil y reposición continua.'
        },
        recursos: {
          maquinaria: 'Cámara enfriadora vertical de 3 puertas Torrey ($38,000), Vitrina refrigerada cremera/carnicera de 2m ($32,000), Congelador horizontal de paletas y hielo ($16,000).',
          equipo: 'Lote de 12 estanterías modulares metálicas reforzadas ($24,000), Mostrador principal de cobro con vitrina ($9,500), Báscula electrónica digital Torrey 30kg ($5,500), Bicicleta de carga de reparto ($6,000).',
          herramientas: 'Computadora TPV con cajón de dinero y escáner ($18,000), Rebanadora de carnes frías de acero inoxidable ($12,000), Extintores y señalética de protección civil.'
        },
        insumos: {
          materia_prima: 'Inventario inicial de abarrotes, abasto de granos y semillas, canasta de frutas y verduras, productos lácteos, embutidos y bebidas embotelladas.',
          proveedores: 'Distribuidora Mayorista El Trébol, Central de Abastos Hermosillo, Sigma Alimentos, Cervecería y Refresqueras locales.',
          compras: 'Compras de frutas y verduras lunes, miércoles y viernes a las 5:00 am en la Central de Abastos; abarrotes secos quincenal.'
        },
        capacidad: {
          instalada: 'Capacidad para atender hasta 350 clientes diarios y almacenar 8 toneladas de productos no perecederos.',
          inventarios: 'Sistema PEPS (Primeras Entradas, Primeras Salidas) con rotación máxima de 15 días para abarrotes y 3 días para verduras.',
          mano_obra: '1 Encargado de turno matutino, 1 Encargado de turno vespertino y 1 Auxiliar de piso/repartidor.',
          punto_reorden: 'Alertas automáticas en el software TPV cuando el inventario baja de 5 piezas en abarrotes clave.'
        },
        operativa: {
          otd: '99% de pedidos a domicilio entregados en menos de 20 minutos.',
          rotacion: 'Rotación del inventario completo cada 16 días.',
          dso: '0 días (100% cobro de contado o tarjeta).',
          dpo: '14 días promedio con proveedores mayoristas de abarrotes.',
          ccc: 'Ciclo de conversión de efectivo positivo de 2 días.'
        },
        ambiental: {
          impacto: 'Generación de residuos de cartón de embalaje, plástico termoencogible y mermas orgánicas vegetales.',
          mitigacion: 'Separación y venta de cartón y plástico a recicladoras locales; compostaje de mermas vegetales no aptas para venta.',
          normatividad: 'NOM-251-SSA1-2009 (Prácticas de higiene para proceso de alimentos), NOM-051-SCFI/SSA1 (Etiquetado general de alimentos).'
        }
      },
      organizacion: {
        estructura: {
          organigrama_visual: 'graph TD\nA[Gerente General / Don Rogelio] --> B[Encargado Turno Matutino]\nA --> C[Encargada Turno Vespertino / Doña Carmen]\nA --> D[Auxiliar de Piso y Reparto]',
          puestos: 'Gerente General y Compras, Encargado de Turno y Caja, Auxiliar de Acomodo y Reparto a Domicilio.',
          funciones: 'Gerente: Compras en central de abastos, finanzas y negociaciones. Encargados: Cobro en caja, atención y corte diario. Auxiliar: Limpieza, pesaje, acomodo en anaqueles y entregas a domicilio.'
        },
        recursos_humanos: {
          reclutamiento: 'Integración del núcleo familiar con apoyo de 1 trabajador local contratado formalmente de la colonia.',
          contratacion: 'Contrato por tiempo indeterminado con prestaciones de ley y bonos por puntualidad y cero merma.',
          sueldos: 'Nómina mensual total de $31,000 MXN para el equipo de 3 personas operativas.'
        },
        inversion: {
          inversion_fija: 'Inversión fija en equipamiento y refrigeración: $155,000 MXN (Refrigeradores, vitrina, estantes, rebanadora, TPV).',
          inversion_diferida: 'Acondicionamiento de local comercial, instalación eléctrica para refrigeración y permisos: $35,000 MXN.',
          opex_inicial: 'Inventario inicial de abarrotes y fondo de caja: $100,000 MXN.',
          financiamiento: 'Aportación familiar en efectivo: $180,000 MXN (62%); Crédito de equipamiento a tasa fija: $110,000 MXN (38%).',
          monto_total: '$290,000 MXN',
          desglose_capex_json: JSON.stringify([
            { concepto: 'Cámara Enfriadora Vertical 3 Puertas Torrey', tipo: 'Activo Fijo', monto: 38000 },
            { concepto: 'Vitrina Refrigerada Carnicera 2 Metros', tipo: 'Activo Fijo', monto: 32000 },
            { concepto: 'Lote de 12 Estanterías Modulares Metálicas', tipo: 'Activo Fijo', monto: 24000 },
            { concepto: 'Sistema Punto de Venta TPV con Escáner y Báscula', tipo: 'Activo Fijo', monto: 23500 },
            { concepto: 'Congelador Horizontal para Hielo y Helados', tipo: 'Activo Fijo', monto: 16000 },
            { concepto: 'Rebanadora Industrial de Carnes Frías', tipo: 'Activo Fijo', monto: 12000 },
            { concepto: 'Mostrador Principal y Muebles de Caja', tipo: 'Activo Fijo', monto: 9500 },
            { concepto: 'Bicicleta de Carga Adaptada para Reparto', tipo: 'Activo Fijo', monto: 6000 },
            { concepto: 'Adecuación Eléctrica 220V e Iluminación LED', tipo: 'Activo Diferido', monto: 22000 },
            { concepto: 'Licencias, Permisos y Anuncio Exterior', tipo: 'Activo Diferido', monto: 13000 },
            { concepto: 'Inventario Inicial de Abarrotes y Perecederos', tipo: 'Capital de Trabajo', monto: 75000 },
            { concepto: 'Fondo de Caja y Capital de Maniobra', tipo: 'Capital de Trabajo', monto: 25000 }
          ])
        },
        costos: {
          fijos: 'Costos fijos mensuales de $24,000 MXN (Renta $8,000, Electricidad comercial $5,500, Agua e internet $1,200, Nómina fija base $9,300).',
          variables: 'Costos variables de adquisición de mercancía promedio del 76% del precio de venta (Costo de ventas).',
          unitario: 'Margen promedio de contribución comercial del 24% sobre ventas brutas.',
          desglose_opex_json: JSON.stringify([
            { categoria: 'Renta', tipo: 'Fijo', concepto: 'Renta de local comercial esquinero 80m²', mensual: 8000 },
            { categoria: 'Servicios', tipo: 'Fijo', concepto: 'Electricidad comercial CFE (refrigeración)', mensual: 5500 },
            { categoria: 'Comunicaciones', tipo: 'Fijo', concepto: 'Internet comercial, teléfono y terminal bancaria', mensual: 1200 },
            { categoria: 'Mantenimiento', tipo: 'Fijo', concepto: 'Mantenimiento de refrigeradores e iluminación', mensual: 1000 },
            { categoria: 'Nómina Fija', tipo: 'Fijo', concepto: 'Sueldos fijos administrativos', mensual: 8300 },
            { categoria: 'Costo Mercancía', tipo: 'Variable', concepto: 'Adquisición de abarrotes secos mayorista', mensual: 38000 },
            { categoria: 'Perecederos', tipo: 'Variable', concepto: 'Frutas, verduras, lácteos y embutidos', mensual: 22000 },
            { categoria: 'Empaques', tipo: 'Variable', concepto: 'Bolsas de papel, insumos de limpieza y tickets', mensual: 1500 }
          ])
        },
        estados_financieros: {
          resultados: 'Proyección anual: Ventas estimadas de $920,000 MXN en Año 1, creciendo a $1,080,000 en Año 2 y $1,260,000 en Año 3. Utilidad neta Año 1 de $142,000 MXN (Margen Neto 15.4%).',
          balance: 'Cero pasivos bancarios de largo plazo al finalizar el año 3 con patrimonio neto consolidado superior a $480,000 MXN.',
          flujo_caja: 'Flujo de efectivo operativo neto positivo de $165,000 MXN al primer año.',
          amortizacion_creditos: 'Crédito de equipamiento de $110,000 liquidable en 24 mensualidades fijas de $5,250 MXN.',
          memorias_calculo: 'Basado en ticket promedio de $68 MXN con 38 visitas promedio diarias por turno.',
          ingresos_json: JSON.stringify([
            { concepto: 'Abarrotes Secos y Enlatados', mensual: 34000, anual: 408000, crecimiento: 8 },
            { concepto: 'Lácteos, Embutidos y Quesos', mensual: 21000, anual: 252000, crecimiento: 10 },
            { concepto: 'Frutas y Verduras Frescas', mensual: 14500, anual: 174000, crecimiento: 12 },
            { concepto: 'Bebidas, Botanas y Golosinas', mensual: 7200, anual: 86400, crecimiento: 5 }
          ])
        },
        rentabilidad: {
          punto_equilibrio: 'Punto de equilibrio operativo mensual: $45,000 MXN de facturación (equivalente a $1,500 MXN diarios de venta mínima para no tener pérdidas).',
          indicadores: 'Indicadores Financieros Pro-Forma:\n- TIR: 44.8%\n- VAN (Tasa 12%): $248,600 MXN\n- Relación B/C: 1.62\n- Payback (Retorno de Inversión): 1.8 años.',
          relacion_bc: '1.62 (Proyecto con alta rotación de inventarios y flujo de caja diario inmediato).'
        },
        staff: [
          { id: '1', role: 'Gerente Administrador / Don Rogelio', department: 'Administrativo', salary: 12000, riskClass: 1, type: 'permanente', reportsTo: null },
          { id: '2', role: 'Encargada de Turno y Cobro / Doña Carmen', department: 'Ventas', salary: 10000, riskClass: 1, type: 'permanente', reportsTo: '1' },
          { id: '3', role: 'Auxiliar de Acomodo y Reparto', department: 'Operativo', salary: 9000, riskClass: 1, type: 'permanente', reportsTo: '1' }
        ]
      }
    }
  },
  {
    id: 'prestador_servicios',
    name: 'MantenPro Servicios de Mantenimiento',
    primaryColor: '#2563eb', // Blue
    secondaryColor: '#3b82f6',
    creator: 'Ing. Carlos Mendoza Estrada & Técnicos Asociados',
    subtitle: 'Plan Estratégico de Servicios Técnicos Integrales de Mantenimiento',
    institution: 'Programa de Desarrollo de Empresas de Servicios Especializados 2026',
    data: {
      config: {
        projectType: 'business',
        activeMethodologies: ['business'],
        locks: {},
        theme: 'light',
        visibility: {},
        comments: {},
        brandKit: {
          primaryColor: '#2563eb',
          secondaryColor: '#3b82f6',
          logoUrl: '',
          companyName: 'MantenPro Servicios'
        },
        coverDesign: {
          layout: 'sidebar',
          logoSize: 'medium',
          logoAlign: 'left',
          titleSize: 'medium',
          creatorName: 'Ing. Carlos Mendoza Estrada',
          subtitle: 'Plan de Negocios de Mantenimiento Residencial y Comercial',
          institution: 'Modelo de Servicios Técnicos Certificados 2026',
          showDate: true,
          customDate: '12 de Agosto de 2026',
          institutionLogos: []
        },
        globalOrientation: 'portrait',
        pageOrientations: {
          canvas: 'landscape',
          estados_financieros: 'landscape',
          pestel: 'landscape'
        },
        moduleOrder: [],
        dataSources: [
          { id: '1', type: 'auto', title: 'Cámara Mexicana de la Industria de la Construcción (CMIC)', url: 'https://cmic.org', description: 'Costos horarios de mano de obra y mantenimiento de instalaciones.' },
          { id: '2', type: 'auto', title: 'INEGI Directorio de Vivienda y Servicios', url: 'https://inegi.org.mx', description: 'Parque habitacional y comercial en la zona metropolitana de Hermosillo.' }
        ],
        search: { provider: 'tavily', tavilyApiKey: '', enableDdg: false },
        regionalSettings: { country: 'Mexico', economicBloc: 'NAFTA', classificationSystem: 'SCIAN', currency: 'MXN' },
        projectId: 'prestador_servicios'
      },
      semilla: {
        negocio: {
          nombre_marca: 'MantenPro Servicios',
          sector: 'Servicios de Mantenimiento a Instalaciones y Hogar',
          ubicacion: 'Hermosillo, Sonora (Cobertura toda la ciudad)'
        },
        finanzas: {
          inversion_total: '340000',
          costos_fijos: '28000',
          meta_ingresos: '840000'
        },
        perfil_fundador: {
          area_fuerte: 'Operativo',
          area_secundaria: 'Finanzas',
          area_a_delegar: 'Administrativo',
          diagnostico_cuantico: 'Perfil técnico-financiero sólido. Delegación de marketing digital y atención telefónica de clientes.'
        }
      },
      naturaleza: {
        introduccion: {
          justificacion: 'En Hermosillo y su zona metropolitana existen más de 250,000 viviendas y 25,000 locales comerciales que requieren reparaciones constantes de plomería, electricidad, aire acondicionado (HVAC), pintura e impermeabilización debido a las condiciones climáticas extremas (temperaturas superiores a 45°C en verano y alta salinidad ambiental). Actualmente, los usuarios enfrentan informalidad, técnicos que no cumplen horarios, cobros abusivos sin factura y trabajos sin garantía. MantenPro formaliza y profesionaliza los servicios con técnicos certificados, cotizaciones transparentes, agendamiento digital y garantía por escrito de 30 días.',
          origen: 'Proyecto impulsado por ingenieros mecánicos y electricistas para estructurar una empresa moderna de mantenimiento integral.',
          nombre: 'MantenPro Soluciones Técnicas S.A. de C.V.',
          descripcion: 'Empresa especializada en servicios técnicos de mantenimiento preventivo y correctivo residencial, comercial e institucional: refrigeración/climas, electricidad industrial y residencial, plomería de alta presión, pintura epóxica e impermeabilización certificada.'
        },
        identidad: {
          mision: 'Brindar soluciones técnicas de mantenimiento seguras, confiables y con garantía por escrito a hogares y empresas, garantizando puntualidad, técnicos calificados y tarifas transparentes.',
          vision: 'Ser la empresa de servicios de mantenimiento residencial y comercial líder en Sonora para 2028, reconocida por su estándar de servicio profesional y plataforma digital de atención.',
          valores: '1. Puntualidad y Respeto al Tiempo del Cliente.\n2. Honestidad y Presupuestos Transparentes.\n3. Calidad Técnica y Seguridad Laboral.\n4. Garantía Total por Escrito.\n5. Limpieza y Orden en cada Trabajo.',
          imagen: 'Azul cobalto (confianza, ingeniería, tecnología) y gris plata (solidez, precisión). Isotipo: Un engrane geométrico integrado con una casa estilizada y un check de verificación de calidad.'
        },
        objetivos: {
          general: 'Consolidar una empresa de servicios de mantenimiento profesional con capacidad para atender 120 órdenes de servicio mensuales en su primer año de operación en Hermosillo.',
          especificos: '• Equipar 2 unidades móviles (camionetas utilitarias) con herramientas profesionales especializadas.\n• Implementar plataforma digital de agendamiento y cotizaciones automatizadas por WhatsApp y web.\n• Mantener un índice de satisfacción del cliente superior al 95% y una tasa de reclamos por garantía menor al 2%.\n• Lograr el punto de equilibrio operativo en el mes 4.',
          metas: 'Alcanzar ingresos por servicios de $840,000 MXN en el primer año, cerrando convenios de mantenimiento preventivo con 15 empresas locales.'
        },
        foda: {
          fortalezas: 'Personal técnico evaluado con carta de no antecedentes y capacitación certificada. Garantía por escrito de 30 días en mano de obra. Facturación electrónica inmediata y cobro con tarjeta en sitio. Camionetas rotuladas y equipadas.',
          oportunidades: 'Gran demanda de mantenimiento de aires acondicionados y minisplits de marzo a octubre en Sonora. Crecimiento de fraccionamientos cerrados donde se valoran técnicos confiables y uniformados.',
          debilidades: 'Marca nueva frente a recomendaciones tradicionales de boca en boca. Disponibilidad de personal calificado en temporada alta de verano.',
          amenazas: 'Competencia informal que evade impuestos y cobra tarifas por debajo de costos operativos formales. Alza en precios de refrigerantes y tubería de cobre.'
        },
        pestel: {
          politico: 'Regulaciones de la STPS sobre seguridad en trabajos en alturas y riesgos eléctricos (NOM-009-STPS y NOM-029-STPS).',
          economico: 'Aumento del gasto familiar en mantenimiento preventivo para evitar el reemplazo de equipos costosos como minisplits.',
          social: 'Mayor exigencia de seguridad en el hogar: las familias prefieren técnicos identificados y con respaldo corporativo formal.',
          tecnologico: 'Uso de manómetros digitales, cámaras termográficas para detección de fugas y software de órdenes de trabajo en el celular.',
          ecologico: 'Normativa ambiental para la recuperación y reciclaje de gases refrigerantes (R410A, R32) sin emisión a la atmósfera.',
          legal: 'Contratos de adhesión registrados ante PROFECO y cumplimiento con la Ley Federal del Trabajo.'
        },
        legal: {
          constitucion: 'Sociedad Anónima de Capital Variable (S.A. de C.V.) o RESICO.',
          socios: 'Ing. Carlos Mendoza Estrada (65%), Téc. Roberto Valenzuela (35%).',
          permisos: 'RFC SAT, Registro en Padrón de Proveedores, Registro ante Protección Civil, Licencia Ambiental de Manejo de Refrigerantes.'
        },
        canvas: {
          socios_clave: 'Distribuidores de minisplits y refacciones (Trane, York, Mirage), Casas de plomería y electricidad (Iusa, Helvex, Truper), Aseguradoras y administradoras de condominios.',
          actividades_clave: 'Mantenimiento preventivo y correctivo de minisplits, instalaciones eléctricas, reparación de fugas y bombas hidroneumáticas, impermeabilización y cotización empresarial.',
          recursos_clave: '2 Camionetas utilitarias equipadas, Bombas de vacío y manómetros digitales, Escaleras de extensión dieléctricas, Técnicos certificados.',
          propuestas_valor: 'Mantenimiento técnico profesional con llegada puntual, presupuesto transparente antes de iniciar, técnicos uniformados y garantía de 30 días por escrito.',
          relaciones_clientes: 'Garantía documentada, seguimiento post-servicio a las 48 horas, expediente digital de mantenimiento de cada equipo.',
          canales: 'Sitio web con agendamiento en línea, WhatsApp Business, convenios directos con administraciones de condominios y redes sociales.',
          segmentos_clientes: 'Hogares residenciales de nivel socioeconómico C+, B y A; pequeñas y medianas empresas, consultorios médicos y locales comerciales.',
          estructura_costos: 'Nómina técnica y sueldos integrados con IMSS, combustible y mantenimiento de unidades móviles, refacciones y consumibles, seguros y marketing.',
          fuentes_ingresos: 'Cobro por servicios residenciales (ticket promedio $850-$2,500 MXN), Pólizas de mantenimiento preventivo mensual a empresas ($3,500-$12,000 MXN/mes).'
        }
      },
      mercado: {
        analisis: {
          producto: 'Mantenimiento preventivo y lavado de minisplits con hidrolavadora y químicos no corrosivos, Detección y reparación de fugas eléctricas y cortocircuitos, Instalación y mantenimiento de bombas y tinacos, Impermeabilización térmica elastomérica a 5 y 10 años, Pólizas de mantenimiento corporativo para oficinas.',
          valor: 'Seguridad de ingresar a casa personal verificado, sin costos sorpresa, con comprobante fiscal y respaldo formal de garantía.',
          demanda: 'Estimada en más de 80,000 servicios de mantenimiento anuales en Hermosillo, con altísima demanda entre abril y septiembre por el calor extremo.',
          cliente: 'Familias profesionistas ocupadas, dueños de negocios comerciales y administradores de plazas que buscan soluciones rápidas y formales.',
          ciclo_vida: 'Servicio recurrente anual o semestral por cada equipo de climatización e instalación hidrosanitaria.'
        },
        segmentacion: {
          tam: 'Mercado de mantenimiento residencial y comercial en Sonora (~$450M MXN anuales).',
          sam: 'Zona metropolitana de Hermosillo (~$180M MXN anuales).',
          som: 'Mercado objetivo de $1.2M MXN en los primeros 2 años.',
          perfil: 'Hogares con 2 a 5 minisplits instalados y empresas con oficinas que requieren climatización continua 24/7.',
          sensibilidad_demanda: 'Baja en temporada de calor extremo (servicio de urgencia indispensable).'
        },
        mapa: {
          analisis_espacial: 'Base operativa en zona céntrica con acceso rápido a vías principales (Blvd. Kino, Blvd. Morelos y Blvd. Solidaridad) para respuesta en menos de 45 minutos.'
        },
        competencia: {
          competidores: 'Técnicos informales de colonia (baratos pero sin garantía ni factura), franquicias nacionales de mantenimiento (costos muy altos).',
          ventajas: 'Balance óptimo entre costo accesible, seriedad corporativa, facturación electrónica y garantía por escrito.'
        },
        benchmarking: {
          comparativa: 'MantenPro supera al técnico independiente en confiabilidad y formalidad, y a las franquicias en rapidez de respuesta y cercanía de precios.',
          matriz: {
            metricas_operativas: [
              { criterio: 'Garantía por Escrito', nuestro_modelo: '30 días documentada', comparador: 'De palabra (Sin respaldo)', grandes_cadenas: '15 días con trámites' },
              { criterio: 'Puntualidad en Citas', nuestro_modelo: 'Ventana de 30 min exacta', comparador: 'Variable ("Llego en la tarde")', grandes_cadenas: 'Ventana de 4 horas' },
              { criterio: 'Facturación y Tarjeta', nuestro_modelo: 'Cobro TPV en sitio + CFDI', comparador: 'Solo efectivo', grandes_cadenas: 'Previa cotización' },
              { criterio: 'Técnicos Identificados', nuestro_modelo: 'Uniforme + Gafete + Carta No Antecedentes', comparador: 'Informal', grandes_cadenas: 'Uniformados' }
            ]
          }
        },
        comercializacion: {
          distribucion: 'Servicio 100% a domicilio mediante unidades móviles equipadas con stock de refacciones de alta rotación.',
          promocion: 'Google Ads local por búsqueda de urgencias ("reparación de minisplit hermosillo"), convenios con administradores de privadas residenciales, volantes en zonas residenciales.',
          identidad: 'Azul cobalto y gris. Unidades rotuladas profesionalmente, técnicos con polo azul y equipo de protección personal.',
          canales_intermediarios: 'Pólizas canalizadas a través de despachos inmobiliarios y administradoras de propiedades en renta.'
        },
        ventas: {
          precios: 'Mantenimiento Minisplit: $650 MXN. Reparación eléctrica básica: $500 MXN. Instalación de bomba presurizadora: $1,200 MXN. Póliza PyME Básica (4 equipos): $2,400 MXN/mes.',
          estrategia: 'Servicio de mantenimiento inicial con descuento del 20% para captar clientes hacia pólizas semestrales y anuales.',
          proyeccion_volumen: 'Año 1: 1,440 servicios residenciales y 18 pólizas empresariales activas. Año 2: Crecimiento del 30% con tercera unidad móvil.',
          tacticas_precio: 'Paquete residencial: Lavado de 3 minisplits por $1,650 MXN (ahorro de $300).'
        }
      },
      tecnico: {
        ubicacion: {
          macro: 'Sonora, México (Hermosillo)',
          micro: 'Zona Centro-Norte, Blvd. Luis Encinas',
          local: 'Taller y oficina logística de 110m² con área de almacenamiento de refacciones, banco de pruebas de compresores y estacionamiento para unidades móviles.'
        },
        operacion: {
          proceso: '1. Solicitud y registro de orden de trabajo en app. 2. Asignación a cuadrilla técnica más cercana. 3. Arribo puntual, diagnóstico y validación de cotización con cliente. 4. Ejecución técnica con equipo de protección. 5. Pruebas de funcionamiento, cobro TPV y emisión de garantía digital.',
          diagrama: 'graph TD\nA[Solicitud WhatsApp/Web] --> B[Asignación de Cuadrilla]\nB --> C[Llegada y Diagnóstico]\nC --> D[Aprobación de Cotización]\nD --> E[Ejecución de Mantenimiento]\nE --> F[Pruebas y Cobro TPV]\nF --> G[Garantía Digital por 30 Días]',
          tecnologia: 'Manómetros digitales Fieldpiece con Bluetooth, Cámaras termográficas FLIR, Hidrolavadoras portátiles a batería y bombas de vacío de doble etapa.',
          economias_escala: 'Convenios de mayoreo con distribuidores de gas refrigerante y refacciones originales con crédito comercial a 30 días.',
          tipo_proceso: 'Servicio técnico especializado en campo con protocolos estandarizados de mantenimiento.'
        },
        recursos: {
          maquinaria: '2 Bombas de vacío de 6 CFM doble etapa ($16,000), 2 Hidrolavadoras de alta presión portátiles para minisplits ($14,000), 2 Recuperadoras de gas refrigerante ecológicas ($26,000).',
          equipo: '2 Camionetas utilitarias Nissan NP300 rotuladas ($180,000 inversión/enganche y adaptación), 2 Escaleras de tijera y extensión dieléctricas de fibra de vidrio ($18,000), 2 Manómetros digitales y vacuómetros ($15,000).',
          herramientas: 'Juegos completos de herramientas manuales aisladas 1000V (desarmadores, pinzas, dados), Multímetros digitales True-RMS Klein Tools, Taladros rotomartillos inalámbricos DeWalt, Abocardadores excéntricos.'
        },
        insumos: {
          materia_prima: 'Gas refrigerante R410A y R32 (cilindros 11.3 kg), Tubería de cobre flexible, Capacitores de arranque, Contactores magnéticos, Cinta térmica y aislante, Líquido desengrasante biodegradable para serpentines.',
          proveedores: 'Climas y Refacciones del Noroeste, Totaline Hermosillo, Truper Mayorista, Distribuidora Eléctrica de Sonora.',
          compras: 'Stock semanal fijo de refacciones críticas en cada camioneta utilitaria para resolver el 85% de las fallas en la primera visita.'
        },
        capacidad: {
          instalada: 'Capacidad operativa de 10 servicios diarios con 2 cuadrillas (hasta 260 servicios mensuales).',
          inventarios: 'Control estricto de refacciones en almacén y stock rodante en camionetas con inventario cíclico semanal.',
          mano_obra: '1 Ingeniero Director de Operaciones, 2 Técnicos Especialistas en Climatización y Electricidad, 1 Auxiliar Técnico.',
          punto_reorden: 'Reposición automática cuando el stock de refrigerantes y capacitores baja de 4 unidades por camioneta.'
        },
        operativa: {
          otd: '96% de servicios completados en el tiempo cotizado sin retrasos.',
          rotacion: 'Rotación de refacciones cada 14 días en temporada alta.',
          dso: '3 días promedio (pólizas comerciales a 15 días, residencial contado).',
          dpo: '28 días con distribuidores de mayoreo.',
          ccc: 'Ciclo de conversión de efectivo controlado de 8 días.'
        },
        ambiental: {
          impacto: 'Manejo de gases refrigerantes fluorados y residuos de aceites de compresores.',
          mitigacion: 'Recuperación del 100% de gases refrigerantes con máquina extractora; entrega de aceites usados a centro de acopio autorizado de SEMARNAT.',
          normatividad: 'NOM-009-STPS-2011 (Seguridad en trabajos en altura), NOM-029-STPS-2011 (Mantenimiento de instalaciones eléctricas), Protocolo de Montreal (Cero venteo de refrigerantes).'
        }
      },
      organizacion: {
        estructura: {
          organigrama_visual: 'graph TD\nA[Director General / Ing. Carlos Mendoza] --> B[Técnico Líder Cuadrilla 1]\nA --> C[Técnico Líder Cuadrilla 2]\nB --> D[Auxiliar Técnico]\nA --> E[Coordinadora de Citas y Atención]',
          puestos: 'Director General y Jefe de Operaciones, Técnico Especialista HVAC/Eléctrico (2), Auxiliar Técnico de Campo, Coordinadora Administrativa y Atención a Clientes.',
          funciones: 'Director: Diagnósticos complejos, cotización a empresas y supervisión de calidad. Técnicos: Ejecución de mantenimientos e instalaciones en campo. Auxiliar: Apoyo en herramientas y limpieza. Coordinadora: Agendamiento, facturación y cobranza.'
        },
        recursos_humanos: {
          reclutamiento: 'Técnicos egresados de CONALEP o ITH con especialidad en Refrigeración y Electricidad con experiencia comprobable.',
          contratacion: 'Contrato por tiempo indeterminado con prestaciones superiores de ley, seguro de vida para trabajos en altura y bono por productividad.',
          sueldos: 'Nómina mensual total de $42,000 MXN para el equipo de 5 personas.'
        },
        inversion: {
          inversion_fija: 'Inversión fija en unidades móviles y equipo técnico especializado: $215,000 MXN (Camionetas, bombas de vacío, manómetros, escaleras, hidrolavadoras).',
          inversion_diferida: 'Acondicionamiento de taller base, plataforma digital de agendamiento y certificaciones: $45,000 MXN.',
          opex_inicial: 'Stock inicial de refacciones y capital de trabajo para 3 meses: $80,000 MXN.',
          financiamiento: 'Aportación de socios: $170,000 MXN (50%); Crédito automotriz y bancario: $170,000 MXN (50%).',
          monto_total: '$340,000 MXN',
          desglose_capex_json: JSON.stringify([
            { concepto: '2 Camionetas Utilitarias Rotuladas (Enganche/Adap)', tipo: 'Activo Fijo', monto: 95000 },
            { concepto: '2 Recuperadoras Ecológicas de Refrigerante', tipo: 'Activo Fijo', monto: 26000 },
            { concepto: '2 Manómetros Digitales y Vacuómetros Fieldpiece', tipo: 'Activo Fijo', monto: 18000 },
            { concepto: '2 Escaleras de Fibra de Vidrio Dieléctricas', tipo: 'Activo Fijo', monto: 18000 },
            { concepto: '2 Bombas de Vacío Doble Etapa 6 CFM', tipo: 'Activo Fijo', monto: 16000 },
            { concepto: '2 Hidrolavadoras Portátiles a Batería', tipo: 'Activo Fijo', monto: 14000 },
            { concepto: '2 Juegos Completos de Herramientas Aisladas 1000V', tipo: 'Activo Fijo', monto: 16000 },
            { concepto: 'Equipo de Diagnóstico Termográfico y Multímetros', tipo: 'Activo Fijo', monto: 12000 },
            { concepto: 'Acondicionamiento de Taller Base y Racks', tipo: 'Activo Diferido', monto: 25000 },
            { concepto: 'Software de Gestión, Web y Agendamiento', tipo: 'Activo Diferido', monto: 20000 },
            { concepto: 'Inventario Inicial de Refacciones y Refrigerantes', tipo: 'Capital de Trabajo', monto: 50000 },
            { concepto: 'Capital de Maniobra Operativo (3 Meses)', tipo: 'Capital de Trabajo', monto: 30000 }
          ])
        },
        costos: {
          fijos: 'Costos fijos mensuales de $28,000 MXN (Renta taller $8,500, Servicios y telefonía $3,500, Seguros de vehículos y RC $4,000, Nómina fija base $12,000).',
          variables: 'Costos variables de combustible ($120/servicio) y refacciones/consumibles (promedio 25% del valor de la orden).',
          unitario: 'Costo unitario promedio de ejecución de servicio de $320 MXN (mano de obra directa, fletes e insumos).',
          desglose_opex_json: JSON.stringify([
            { categoria: 'Renta', tipo: 'Fijo', concepto: 'Renta de taller y base operativa 110m²', mensual: 8500 },
            { categoria: 'Servicios', tipo: 'Fijo', concepto: 'Electricidad, agua e internet para monitoreo', mensual: 3500 },
            { categoria: 'Seguros', tipo: 'Fijo', concepto: 'Seguros de cobertura amplia y Responsabilidad Civil', mensual: 4000 },
            { categoria: 'Software', tipo: 'Fijo', concepto: 'Licencia plataforma CRM y órdenes móviles', mensual: 1800 },
            { categoria: 'Nómina Fija', tipo: 'Fijo', concepto: 'Sueldo fijo administración y coordinación', mensual: 10200 },
            { categoria: 'Combustible', tipo: 'Variable', concepto: 'Gasolina para 2 unidades móviles en ruta', mensual: 14000 },
            { categoria: 'Refacciones', tipo: 'Variable', concepto: 'Gases refrigerantes, capacitores y tubería', mensual: 18000 },
            { categoria: 'Publicidad', tipo: 'Variable', concepto: 'Google Ads local y redes sociales', mensual: 4000 }
          ])
        },
        estados_financieros: {
          resultados: 'Proyección anual: Ingresos por servicios de $840,000 MXN en Año 1, creciendo a $1,150,000 en Año 2 y $1,520,000 en Año 3. Utilidad neta Año 1 de $188,000 MXN (Margen Neto 22.4%).',
          balance: 'Activos totales de $495,000 MXN al término del primer año con índice de solvencia de 2.4 veces el pasivo circulante.',
          flujo_caja: 'Flujo de efectivo acumulado de $210,000 MXN al cierre del año 1.',
          amortizacion_creditos: 'Crédito productivo de $170,000 MXN amortizable a 36 meses con pagos de $6,100 MXN.',
          memorias_calculo: 'Basado en 120 órdenes residenciales mensuales + 18 pólizas empresariales fijas.',
          ingresos_json: JSON.stringify([
            { concepto: 'Mantenimiento Preventivo Climas/Minisplits', mensual: 32000, anual: 384000, crecimiento: 15 },
            { concepto: 'Reparaciones Eléctricas e Hidrosanitarias', mensual: 18000, anual: 216000, crecimiento: 10 },
            { concepto: 'Pólizas Comerciales de Mantenimiento', mensual: 14000, anual: 168000, crecimiento: 20 },
            { concepto: 'Impermeabilizaciones y Trabajos Especiales', mensual: 6000, anual: 72000, crecimiento: 12 }
          ])
        },
        rentabilidad: {
          punto_equilibrio: 'Punto de equilibrio operativo mensual: $42,000 MXN de facturación (equivalente a 48 servicios residenciales y 6 pólizas al mes).',
          indicadores: 'Indicadores Financieros Pro-Forma:\n- TIR: 41.5%\n- VAN (Tasa 12%): $238,900 MXN\n- Relación B/C: 1.58\n- Payback (Retorno de Inversión): 2.0 años.',
          relacion_bc: '1.58 (Alta rentabilidad por bajo costo de inventario inmovilizado y servicios de valor agregado).'
        },
        staff: [
          { id: '1', role: 'Director General y Jefe Técnico / Ing. Carlos Mendoza', department: 'Dirección', salary: 18000, riskClass: 3, type: 'permanente', reportsTo: null },
          { id: '2', role: 'Técnico Especialista HVAC y Electricidad', department: 'Operativo', salary: 13000, riskClass: 3, type: 'permanente', reportsTo: '1' },
          { id: '3', role: 'Técnico en Plomería e Instalaciones', department: 'Operativo', salary: 11000, riskClass: 3, type: 'permanente', reportsTo: '1' },
          { id: '4', role: 'Coordinadora de Operaciones y Atención', department: 'Administrativo', salary: 8500, riskClass: 1, type: 'permanente', reportsTo: '1' }
        ]
      }
    }
  }
];

function generateDetailedMarkdown(plan) {
  const p = plan.data;
  const cfg = p.config;
  const nat = p.naturaleza;
  const mer = p.mercado;
  const tec = p.tecnico;
  const org = p.organizacion;

  return `# ${cfg.brandKit.companyName}
**Tipo de Plan:** Plan de Negocios Comercial (Metodología OpenPlan v2.6)
**Fecha:** ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
**Elaborado por:** ${cfg.coverDesign.creatorName}
**Institución / Contexto:** ${cfg.coverDesign.institution}

---

## 1. RESUMEN EJECUTIVO Y ANTEPROYECTO

### 1.1 Justificación y Origen
${nat.introduccion.justificacion}

**Origen del Proyecto:**
${nat.introduccion.origen}

**Descripción General:**
${nat.introduccion.descripcion}

---

## 2. NATURALEZA DEL PROYECTO E IDENTIDAD CORPORATIVA

### 2.1 Misión, Visión y Valores
- **Misión:** ${nat.identidad.mision}
- **Visión:** ${nat.identidad.vision}
- **Valores:**
${nat.identidad.valores}

### 2.2 Objetivos Estratégicos (SMART)
- **Objetivo General:** ${nat.objetivos.general}
- **Objetivos Específicos:**
${nat.objetivos.especificos}
- **Metas Financieras y Operativas:** ${nat.objetivos.metas}

### 2.3 Matriz FODA
- **Fortalezas:** ${nat.foda.fortalezas}
- **Oportunidades:** ${nat.foda.oportunidades}
- **Debilidades:** ${nat.foda.debilidades}
- **Amenazas:** ${nat.foda.amenazas}

### 2.4 Análisis del Entorno PESTEL
- **Político:** ${nat.pestel.politico}
- **Económico:** ${nat.pestel.economico}
- **Social:** ${nat.pestel.social}
- **Tecnológico:** ${nat.pestel.tecnologico}
- **Ecológico:** ${nat.pestel.ecologico}
- **Legal:** ${nat.pestel.legal}

### 2.5 Marco Legal y Constitución
- **Figura Jurídica:** ${nat.legal.constitucion}
- **Socios y Participación:** ${nat.legal.socios}
- **Permisos y Licencias:** ${nat.legal.permisos}

---

## 3. ESTUDIO DE MERCADO Y COMERCIALIZACIÓN

### 3.1 Análisis de Producto y Propuesta de Valor
- **Producto / Servicio:** ${mer.analisis.producto}
- **Propuesta de Valor:** ${mer.analisis.valor}
- **Demanda Estimada:** ${mer.analisis.demanda}
- **Perfil del Cliente:** ${mer.analisis.cliente}

### 3.2 Segmentación de Mercado (TAM / SAM / SOM)
- **TAM (Total Addressable Market):** ${mer.segmentacion.tam}
- **SAM (Serviceable Available Market):** ${mer.segmentacion.sam}
- **SOM (Serviceable Obtainable Market):** ${mer.segmentacion.som}
- **Buyer Persona:** ${mer.segmentacion.perfil}

### 3.3 Estrategia de Comercialización y Precios
- **Canales de Distribución:** ${mer.comercializacion.distribucion}
- **Estrategia de Promoción y Difusión:** ${mer.comercializacion.promocion}
- **Estructura de Precios:** ${mer.ventas.precios}
- **Estrategia de Ventas:** ${mer.ventas.estrategia}

---

## 4. ESTUDIO TÉCNICO Y OPERATIVO

### 4.1 Localización y Distribución Física
- **Macro-Localización:** ${tec.ubicacion.macro}
- **Micro-Localización:** ${tec.ubicacion.micro}
- **Descripción del Local / Taller:** ${tec.ubicacion.local}

### 4.2 Proceso Operativo y Diagrama de Flujo
${tec.operacion.proceso}

\`\`\`mermaid
${tec.operacion.diagrama}
\`\`\`

### 4.3 Equipamiento, Maquinaria e Insumos
- **Maquinaria y Equipos:** ${tec.recursos.maquinaria}
- **Mobiliario y Herramientas:** ${tec.recursos.equipo}
- **Materias Primas y Proveedores:** ${tec.insumos.materia_prima}

### 4.4 Capacidad Operativa y Control de Inventarios
- **Capacidad Instalada:** ${tec.capacidad.instalada}
- **Método de Inventarios:** ${tec.capacidad.inventarios}
- **Impacto Ambiental y Normatividad:** ${tec.ambiental.impacto}. ${tec.ambiental.normatividad}

---

## 5. ESTRUCTURA ORGANIZACIONAL Y RECURSOS HUMANOS

### 5.1 Organigrama y Puestos Clave
${org.estructura.puestos}

### 5.2 Estructura Salarial y Nómina Mensual
| Puesto | Salario Base Mensual |
| --- | --- |
${org.staff.map(s => `| ${s.role} | $${s.salary.toLocaleString()} MXN |`).join('\n')}

---

## 6. ESTUDIO FINANCIERO Y RENTABILIDAD PRO-FORMA

### 6.1 Inversión Inicial (CAPEX)
- **Monto Total Requerido:** ${org.inversion.monto_total}
- **Estructura de Inversión:** ${org.inversion.inversion_fija}
- **Estructura de Financiamiento:** ${org.inversion.financiamiento}

### 6.2 Costos Operativos Mensuales (OPEX)
- **Costos Fijos Mensuales:** ${org.costos.fijos}
- **Costos Variables:** ${org.costos.variables}

### 6.3 Proyecciones Financieras y Métricas de Rentabilidad
- **Punto de Equilibrio:** ${org.rentabilidad.punto_equilibrio}
- **Indicadores Clave:**
${org.rentabilidad.indicadores}

---

*Documento estructurado conforme a la Metodología OpenPlan v2.6 y Estándares NIF.*
`;
}

async function main() {
  console.log('📦 Generando archivos de proyecto JSON y Markdown en proyectos/negocios/...\n');

  for (const proj of PROJECTS) {
    const dir = path.join(ROOT, 'proyectos', 'negocios', proj.id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const docsDir = path.join(dir, 'documentos');
    if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

    const jsonPath = path.join(dir, `${proj.id}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(proj.data, null, 2), 'utf8');

    const mdPath = path.join(dir, `${proj.id}.md`);
    const mdContent = generateDetailedMarkdown(proj);
    fs.writeFileSync(mdPath, mdContent, 'utf8');

    console.log(`✅ Proyecto: ${proj.name}`);
    console.log(`   📄 JSON: ${jsonPath}`);
    console.log(`   📝 Markdown: ${mdPath}`);
  }

  console.log('\n🎉 ¡Los 3 proyectos fueron generados y persistidos con estructura completa!');
}

main().catch(console.error);
