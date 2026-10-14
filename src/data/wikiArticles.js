/**
 * @file wikiArticles.js
 * @description Base de conocimiento canónica de Open Business Plan (Fondo Thoth AC).
 * Contiene categorías, artículos, guías metodológicas, fórmulas financieras y glosario.
 */

export const WIKI_CATEGORIES = [
  {
    key: 'empresas_cuanticas',
    name: 'Empresas Cuánticas',
    icon: 'Atom',
    color: '#8b5cf6',
    description: 'Metodología propietaria de Fondo Thoth AC: Modelo Atómico de 3 Áreas, delegación y saltos cuánticos de escala.'
  },
  {
    key: 'metodologias',
    name: 'Metodologías de Negocio',
    icon: 'Layers',
    color: '#3b82f6',
    description: 'Los 12 marcos metodológicos integrados en OBP: Plan Maestro, ZOPP, Lean Startup, Hoshin Kanri, Amoeba, etc.'
  },
  {
    key: 'finanzas',
    name: 'Finanzas y SAGARPA',
    icon: 'TrendingUp',
    color: '#10b981',
    description: 'Fórmulas maestras (WACC, VAN, TIR, Payback), simulador multi-escenario y normas de formulación gubernamental.'
  },
  {
    key: 'rag_drivers',
    name: 'RAG y Ficha de Drivers',
    icon: 'Database',
    color: '#f59e0b',
    description: 'Arquitectura anti-alucinaciones, ingesta multimodal (Word/PDF/Audio) y trazabilidad matemática de drivers.'
  },
  {
    key: 'glosario',
    name: 'Glosario y Acrónimos',
    icon: 'BookOpen',
    color: '#ec4899',
    description: 'Definiciones técnicas y acrónimos clave: CAPEX, OPEX, TRL, DNSH, SCIAN, DENUE, EBITDA, WACC.'
  }
];

export const WIKI_ARTICLES = [
  // ==========================================
  // EMPRESAS CUÁNTICAS (FONDO THOTH AC)
  // ==========================================
  {
    id: 'empresas-cuanticas-modelo-atomico',
    title: 'Metodología Empresas Cuánticas: Modelo Atómico de 3 Áreas',
    category: 'empresas_cuanticas',
    tags: ['Fondo Thoth', 'Empresas Cuánticas', 'Modelo Atómico', 'Organización', 'Fundador'],
    readTime: '6 min',
    author: 'Fondo Thoth AC',
    updatedAt: '2026-10-13',
    excerpt: 'Fundamentos del modelo atómico empresarial: separación innegociable de Finanzas, Operaciones y Administración.',
    content: `
# Metodología Empresas Cuánticas: El Modelo Atómico de 3 Áreas

La metodología **Empresas Cuánticas**, desarrollada por **Fondo Thoth AC**, postula que toda organización productiva funciona como una estructura atómica conformada por tres órbitas fundamentales:

1. **Área Financiera:** Tesorería, asignación de capital, márgenes de contribución, proyecciones de flujo de caja y rentabilidad de activos.
2. **Área Operativa:** Creación y entrega del producto o servicio, ingeniería, control de calidad, cadena de suministro y satisfacción del cliente.
3. **Área Administrativa:** Cumplimiento legal, fiscal, gestión del talento humano, sistemas, compras y procesos normativos.

\`\`\`mermaid
graph TD
  Fundador[Fundador / Emprendedor] --> Orbita1[Órbita Finanzas]
  Fundador --> Orbita2[Órbita Operaciones]
  Delegacion([Delegación Estricta]) --> Orbita3[Órbita Administración]
  
  style Orbita1 fill:#4f46e5,stroke:#312e81,color:#fff
  style Orbita2 fill:#10b981,stroke:#065f46,color:#fff
  style Orbita3 fill:#f59e0b,stroke:#b45309,color:#fff
\`\`\`

---

## El Principio Nuclear: Límite de 2 Áreas

> [!IMPORTANT]
> **Regla de Oro Cuántica:** El fundador **solo puede ser experto o participar activamente en 1 o máximo 2 de las 3 áreas**. 
> Intentar involucrarse en las 3 áreas de forma simultánea genera el fenómeno de **"fusión del átomo"**: colapso por micromanagement, sesgo en toma de decisiones críticas y paralización operativa.

### Anti-Patrones Cuánticos Detectados por el Sistema:
- **"El Todólogo" (Fusión Atómica):** El fundador programa, cobra, atiende clientes y lleva la contabilidad. Resultado: la empresa no escala más allá de su resistencia biológica.
- **"Solo Quiero Ser Jefe":** Ausencia de destreza técnica o financiera; pretende coordinar sin comprender las dinámicas operativas nucleares.
- **"Inversor Ausente Prematuro":** Quien busca retornos rápidos sin involucrarse en consolidar el núcleo de la empresa en su fase de gestación.

---

## Umbrales de Cambio Cuántico de Escala

El crecimiento empresarial **no es lineal, es cuántico**. Ocurre mediante saltos discretos que exigen reestructuración atómica:

| Salto Cuántico | Umbral Típico | Reestructuración Requerida |
| :--- | :--- | :--- |
| **Salto 0 → 1** | 1 a 3 colaboradores | Formalización del rol del fundador; delegación de la tercera área. |
| **Salto 1 → 2** | 5 a 15 colaboradores | Creación de mandos medios; desvinculación operativa del fundador. |
| **Salto 2 → 3** | Multi-sucursal / $10M+ MXN | Dirección general corporativa, comités de auditoría y ERP integral. |

> [!TIP]
> **Meta Suprema del Plan:** La meta última de todo plan de negocios formulado en OBP es que la empresa alcance **autonomía operativa plena**, funcionando de manera eficiente y rentable **sin la presencia diaria del fundador**.
`
  },
  {
    id: 'principio-delegacion-cuantica',
    title: 'Principio de Delegación y Reclutamiento Complementario',
    category: 'empresas_cuanticas',
    tags: ['Delegación', 'Recursos Humanos', 'Perfiles', 'Vacantes'],
    readTime: '4 min',
    author: 'Fondo Thoth AC',
    updatedAt: '2026-10-13',
    excerpt: 'Cómo transformar las áreas de debilidad del fundador en perfiles de puesto y vacantes de contratación específicas.',
    content: `
# Principio de Delegación y Reclutamiento Complementario

En la metodología de **Empresas Cuánticas**, admitir debilidades en una de las 3 áreas atómicas no es un fallo, sino el **primer paso hacia la resiliencia organizacional**.

---

## La Matriz de Complementariedad

Cuando el evaluador de Semilla detecta que el fundador es dominante en **Operaciones** y **Finanzas**, el sistema genera automáticamente una recomendación de delegación prioritaria en **Administración y Capital Humano**.

\`\`\`mermaid
flowchart LR
  F[Perfil del Fundador] --> Eval[Evaluación Atómica]
  Eval -->|Fuerte en Ops + Finanzas| V1[Generar Vacante: Coordinador Administrativo]
  Eval -->|Fuerte en Ops + Admin| V2[Generar Vacante: Controller / Asesor Financiero]
  Eval -->|Fuerte en Finanzas + Admin| V3[Generar Vacante: Director de Operaciones / Planta]
\`\`\`

---

## Contenido Estructurado de la Recomendación de Puesto

Toda vacante generada por Open Business Plan incluye:
1. **Título del Puesto:** Alineado al giro del negocio (ej. *Jefe de Aseguramiento de Calidad y Planta Cárnica*).
2. **Objetivo del Rol:** Qué cuello de botella resuelve y qué libertad le otorga al fundador.
3. **Perfil Requerido:** Experiencia comprobable, formación académica y competencias duras.
4. **Rango Salarial de Mercado:** Ajustado a tabuladores de la región y tamaño de la empresa.
5. **Redacción para Publicación:** Texto listo para publicar en LinkedIn, Indeed o bolsas de empleo locales.
`
  },
  {
    id: 'foda-dinamico-conversion-fortalezas',
    title: 'Metodología Fondo Thoth AC: Formulación Estratégica, FODA Dinámico y Desacoplamiento PESTEL',
    category: 'empresas_cuanticas',
    tags: ['Fondo Thoth', 'FODA Dinámico', 'PESTEL', 'Estrategia', 'Fortalezas', 'TOWS'],
    readTime: '5 min',
    author: 'Fondo Thoth AC',
    updatedAt: '2026-10-13',
    excerpt: 'La razón de ser pedagógica y operativa del plan de negocios: por qué las leyes van en PESTEL y cómo todo factor del FODA evoluciona hacia Fortalezas.',
    content: `
# Metodología Fondo Thoth AC: Formulación Estratégica, FODA Dinámico y Desacoplamiento PESTEL

En la enseñanza y ejecución de planes de negocio según **Fondo Thoth AC**, el plan no es un ejercicio burocrático ni un compendio de intenciones; es un **mapa de navegación para la autonomía operativa del fundador**.

Para lograr que una empresa funcione sin depender biológicamente de su creador, el análisis estratégico debe resolver dos problemas pedagógicos críticos: **la confusión entre macroentorno y microentorno**, y **el estatismo del FODA tradicional**.

---

## 1. La Arquitectura de Formulación de Fondo Thoth AC

El proceso de formulación sigue un encadenamiento lógico riguroso que transforma la intuición del fundador en una máquina empresarial autónoma:

\`\`\`mermaid
flowchart TD
  A["Semilla del Proyecto (Visión y ADN)"] --> B["Diagnóstico Atómico (3 Áreas: Ops, Fin, Admin)"]
  B --> C["Análisis Macroentorno PESTEL (Variables Exógenas No Controlables)"]
  C --> D["FODA Dinámico (Capacidades Internas y Factores Micro Operables)"]
  D --> E["Estructura de Capital Humano & Delegación Cuántica"]
  E --> F["Ingeniería Financiera (WACC, VAN, TIR, Runway y BEP)"]
  F --> G["Autonomía Operativa: Empresa Funciona SIN el Fundador"]

  style A fill:#4f46e5,stroke:#312e81,color:#fff
  style C fill:#0ea5e9,stroke:#0369a1,color:#fff
  style D fill:#10b981,stroke:#065f46,color:#fff
  style G fill:#8b5cf6,stroke:#5b21b6,color:#fff
\`\`\`

---

## 2. El Desacoplamiento Estricto: ¿Por qué las Leyes van en PESTEL y NO en FODA?

Un error recurrente de los emprendedores y estudiantes es listar reformas fiscales, normativas sanitarias (COFEPRIS), leyes laborales o aranceles dentro de las debilidades o amenazas del FODA. 

En **Fondo Thoth AC** este error se corrige mediante el principio de **Capacidad de Acción**:

\`\`\`mermaid
graph LR
  subgraph Macroentorno ["PESTEL (Entorno Macro Exógeno)"]
    L1["Leyes, Reformas y Decretos"]
    L2["Normas Oficiales (NOM, STPS, SAT)"]
    L3["Aranceles y Tratados Internacionales"]
    R1["Acción: Monitoreo, Cumplimiento y Adaptación"]
  end

  subgraph Microentorno ["FODA (Capacidades Internas Operables)"]
    F1["Procesos de Calidad y Producción"]
    F2["Talento Humano y Delegación"]
    F3["Tecnología Propia y Software"]
    R2["Acción: Modificación Inmediata por el Fundador"]
  end

  style Macroentorno fill:#fef2f2,stroke:#ef4444,color:#991b1b
  style Microentorno fill:#f0fdf4,stroke:#10b981,color:#166534
\`\`\`

- **PESTEL Legal:** La empresa **no puede cambiar una ley**. Por tanto, habita en el macroentorno y el objetivo del plan es diseñar el blindaje de cumplimiento normativo.
- **FODA:** Alberga exclusivamente lo que el equipo directivo **sí puede intervenir, mejorar o delegar hoy mismo**.

---

## 3. La Ley de Conversión a Fortalezas: Todo Factor Debe Evolucionar

El FODA tradicional falla porque se concibe como una fotografía estática. En la metodología de **Empresas Cuánticas**, el FODA es un **vector de transformación activa**:

\`\`\`mermaid
flowchart TD
  subgraph Origen ["Factores Operativos Iniciales"]
    D["Debilidad Interna (Falta de control, dependencia del fundador)"]
    O["Oportunidad de Mercado (Nichos insatisfechos, demanda alta)"]
    A["Amenaza Competitiva (Guerra de precios, competidores locales)"]
  end

  subgraph Accion ["Vectores de Acción Cuántica"]
    T1["⚡ Plan de Delegación Cuántica o Capacitación"]
    T2["⚡ Inversión en Capacidad Instalada / Activos"]
    T3["⚡ Blindaje Contractual / Innovación Defensiva"]
  end

  subgraph Destino ["Resultado Final Innegociable"]
    FORT["FORTALEZA INSTITUCIONAL CONSOLIDADA"]
  end

  D --> T1 --> FORT
  O --> T2 --> FORT
  A --> T3 --> FORT

  style FORT fill:#10b981,stroke:#047857,color:#fff,stroke-width:3px
\`\`\`

### Las 3 Reglas de Conversión:
1. **Debilidades a Fortalezas:** Si el fundador es débil en finanzas o inventarios, no se queda lamentándose: aplica la **Delegación Cuántica**, contrata o asocia a un perfil complementario, implementa software y la debilidad se transforma en una fortaleza operativa.
2. **Oportunidades a Fortalezas:** Una oportunidad en el mercado que no se captura se pierde. Al invertir en equipo, maquinaria o canales digitales, la oportunidad se internaliza como una competencia central (*core competency*).
3. **Amenazas a Fortalezas:** Ante la amenaza de un nuevo competidor, la empresa genera contratos de exclusividad, pólizas de garantía o patentes de procesos. La amenaza cataliza un **blindaje estratégico** que protege permanentemente el negocio.

---

## 4. El Vínculo con el Modelo Atómico

Este dinamismo alimenta directamente la estructura de puestos en el módulo de Capital Humano y el presupuesto financiero:

> [!TIP]
> Cada debilidad convertida en fortaleza mediante **Delegación Cuántica** genera una vacante real de trabajo con perfil, objetivo de puesto y tabulador salarial, asegurando que el negocio avance paso a paso hacia la **independencia total del fundador**.
`
  },

  // ==========================================
  // METODOLOGÍAS DE NEGOCIO (12 FRAMEWORKS)
  // ==========================================
  {
    id: 'guia-12-metodologias',
    title: 'Guía de los 12 Marcos Metodológicos en Open Business Plan',
    category: 'metodologias',
    tags: ['Metodologías', 'Frameworks', 'Linda Pinson', 'ZOPP', 'Lean Startup', 'Hoshin Kanri'],
    readTime: '8 min',
    author: 'Equipo OBP',
    updatedAt: '2026-10-13',
    excerpt: 'Compendio de las 12 metodologías canónicas soportadas en el sistema para proyectos privados, sociales y de inversión.',
    content: `
# Guía de los 12 Marcos Metodológicos en Open Business Plan

Open Business Plan es la única plataforma que integra **12 metodologías internacionales** de formulación de proyectos en una misma arquitectura de datos:

## 1. Plan Maestro Tradicional (\`business\`)
- **Autor de Referencia:** Linda Pinson (*Anatomy of a Business Plan*).
- **Enfoque:** Estructura clásica en 5 pilares: Naturaleza, Mercado, Técnico/Operativo, Organización y Finanzas.
- **Ideal para:** PyMEs, empresas comerciales, industrias de manufactura y solicitudes bancarias estándar.

## 2. Proyecto Social BID (\`social_bid\`)
- **Enfoque:** Matriz de Impacto Social, stakeholders comunitarios y retorno social de la inversión (SROI).
- **Ideal para:** Cooperativas, asociaciones civiles, proyectos de desarrollo comunitario y fondos no reembolsables.

## 3. Lean Startup (\`agile_startup\`)
- **Autores:** Eric Ries y Alexander Osterwalder.
- **Enfoque:** Ciclo Construir-Medir-Aprender, Producto Mínimo Viable (MVP), validación de hipótesis tempranas y Business Model Canvas.
- **Ideal para:** Startups de tecnología, modelos disruptivos y productos digitales.

## 4. Innovación I+D (\`technology_id\`)
- **Enfoque:** Escalamiento de madurez tecnológica (TRL 1 a 9), protección de propiedad intelectual (IMPI/PCT) y roadmaps de desarrollo.
- **Ideal para:** Centros de investigación, patentes y biotecnología.

## 5. Microempresa y Autoempleo (\`micro_business\`)
- **Enfoque:** Modelo ágil de baja fricción enfocado en flujo de caja de supervivencia, croquis 2D de taller y formalización inicial.
- **Ideal para:** Talleres familiares, carpinterías, pastelerías y comercios al detalle.

## 6. Proyecto de Inversión y Finanzas Cuantitativas (\`investment_project\`)
- **Enfoque:** Valuación rigurosa mediante flujos descontados (DCF), CAPM, WACC, simulación Monte Carlo estocástica (10,000 iteraciones) y análisis de Tornado.
- **Ideal para:** Proyectos de gran escala (CAPEX > $10M MXN), fondos de capital privado y banca corporativa.

## 7. ZOPP y Marco Lógico (\`zopp\`)
- **Origen:** Agencia Alemana de Cooperación GTZ / Banco Mundial.
- **Enfoque:** Árbol de problemas (causas-efectos), árbol de objetivos (medios-fines) y Matriz de Marco Lógico 4x4.
- **Ideal para:** Licitaciones gubernamentales, organismos multilaterales y proyectos de cooperación internacional.

## 8. Horizon Europe (\`horizon_europe\`)
- **Origen:** Comisión Europea.
- **Enfoque:** Criterios de impacto transnacional, ciencia abierta, paridad de género y principio ambiental DNSH (*Do No Significant Harm*).
- **Ideal para:** Subvenciones de la Unión Europea y consorcios internacionales de investigación.

## 9. Hoshin Kanri (\`hoshin_kanri\`)
- **Enfoque:** Despliegue de políticas mediante la **Matriz X** (X-Matrix), catchball y alineación de objetivos estratégicos con KPIs de piso.
- **Ideal para:** Corporativos medianos y grandes que requieren alineación estratégica total entre directores y operaciones.

## 10. Amoeba Management (\`amoeba_management\`)
- **Autor:** Kazuo Inamori (Kyocera).
- **Enfoque:** División de la empresa en micro-células autónomas ("Amoebas") con estado de resultados independiente por hora-hombre trabajada.
- **Ideal para:** Empresas de manufactura y servicios con equipos descentralizados.

## 11. Metodología Guanxi (\`guanxi_plan\`)
- **Enfoque:** Comercio internacional y alianzas estratégicas fundamentadas en redes de confianza mutua, reciprocidad y contratos de largo plazo.
- **Ideal para:** Importación, exportación y distribución regional cross-border.

## 12. Estudio de Factibilidad ONUDI (\`onudi_project\`)
- **Origen:** Organización de las Naciones Unidas para el Desarrollo Industrial.
- **Enfoque:** Manual de preparación de estudios de viabilidad industrial con evaluación exhaustiva de materias primas, energía, localización y balance de masa.
- **Ideal para:** Plantas químicas, parques industriales y agroindustria a gran escala.
`
  },
  {
    id: 'zopp-marco-logico-explicado',
    title: 'Metodología ZOPP: Árbol de Problemas y Matriz de Marco Lógico',
    category: 'metodologias',
    tags: ['ZOPP', 'Marco Lógico', 'Árbol de Problemas', 'GTZ', 'BID'],
    readTime: '5 min',
    author: 'Equipo OBP',
    updatedAt: '2026-10-13',
    excerpt: 'Cómo transformar un diagnóstico de causas y efectos en una matriz de marco lógico verificable de 4x4.',
    content: `
# Metodología ZOPP y Matriz de Marco Lógico

**ZOPP** (*Zielorientierte Projektplanung* o Planificación de Proyectos Orientada a Objetivos) es el estándar de oro para proyectos sociales, gubernamentales y multilaterales.

---

## 1. El Árbol de Problemas (Diagnóstico)
El árbol de problemas permite identificar la **causa raíz** de una situación insatisfactoria en lugar de atacar únicamente los síntomas superficiales:

\`\`\`mermaid
graph TD
  E1[Efecto 1: Pérdida económica] --- Efectos[EFECTOS / IMPACTO NEGATIVO]
  E2[Efecto 2: Abandono comunitario] --- Efectos
  Efectos --> PC[PROBLEMA CENTRAL]
  PC --> C1[Causa 1: Falta de tecnología adecuada]
  PC --> C2[Causa 2: Desorganización operativa]
  C1 --- CausaRaiz[CAUSAS RAÍZ]
  C2 --- CausaRaiz
\`\`\`

---

## 2. El Árbol de Objetivos (Solución)
Por inversión lógica positiva, cada problema se convierte en un objetivo deseado:
- *Causas* → se convierten en **Medios o Actividades**.
- *Problema Central* → se convierte en el **Propósito del Proyecto**.
- *Efectos* → se convierten en los **Fines o Beneficios Esperados**.

---

## 3. La Matriz de Marco Lógico (4x4)
Estructura la lógica de intervención en 4 niveles jerárquicos:

1. **Fin:** Contribución al desarrollo general a largo plazo.
2. **Propósito:** El impacto directo logrado al finalizar el proyecto.
3. **Componentes / Resultados:** Los entregables tangibles completados.
4. **Actividades:** Las acciones presupuestadas para generar cada componente.

Cada nivel cuenta con **Indicadores Objetivamente Verificables (IOV)**, **Fuentes de Verificación** y **Supuestos Críticos**.
`
  },

  // ==========================================
  // FINANZAS Y SAGARPA
  // ==========================================
  {
    id: 'matematicas-financieras-wacc-van-tir',
    title: 'Matemáticas Financieras: Fórmulas de WACC, VAN, TIR y Payback',
    category: 'finanzas',
    tags: ['WACC', 'VAN', 'VPN', 'TIR', 'Payback', 'Finanzas'],
    readTime: '7 min',
    author: 'Dirección Financiera OBP',
    updatedAt: '2026-10-13',
    excerpt: 'Fórmulas matemáticas formales y criterios de viabilidad aplicados en el motor financiero de Open Business Plan.',
    content: `
# Matemáticas Financieras: Fórmulas de WACC, VAN, TIR y Payback

Open Business Plan utiliza fórmulas financieras de grado bancario para garantizar la viabilidad cuantitativa de cada proyecto formulado.

---

## 1. WACC (Weighted Average Cost of Capital)
El Costo Promedio Ponderado de Capital representa la tasa mínima de retorno requerida por los aportantes de recursos (deuda y capital propio):

$$\\text{WACC} = \\left( \\frac{E}{V} \\times K_e \\right) + \\left( \\frac{D}{V} \\times K_d \\times (1 - T) \\right)$$

Donde:
- $E$: Capital propio aportado por socios.
- $D$: Deuda financiera contratada.
- $V = E + D$: Valor total de la estructura de financiamiento.
- $K_e$: Costo del capital propio (calculado habitualmente vía CAPM: $R_f + \\beta(R_m - R_f)$).
- $K_d$: Tasa de interés pactada de la deuda.
- $T$: Tasa impositiva corporativa (ISR en México: 30%).

---

## 2. VAN (Valor Actual Neto) / NPV
Representa el valor presente de los flujos de caja futuros generados por el proyecto, descontados a la tasa WACC, menos la inversión inicial:

$$\\text{VAN} = -I_0 + \\sum_{t=1}^{n} \\frac{FC_t}{(1 + r)^t}$$

- **Criterio de Aceptación:**
  - $\\text{VAN} > 0$: El proyecto genera riqueza por encima del costo de capital. **Viable**.
  - $\\text{VAN} = 0$: El proyecto rinde exactamente el costo de oportunidad. Indiferente.
  - $\\text{VAN} < 0$: El proyecto destruye valor económico. **No viable**.

---

## 3. TIR (Tasa Interna de Retorno) / IRR
Es la tasa de descuento $r$ que hace que el Valor Actual Neto sea exactamente igual a cero:

$$\\text{VAN} = -I_0 + \\sum_{t=1}^{n} \\frac{FC_t}{(1 + \\text{TIR})^t} = 0$$

- **Criterio de Aceptación:**
  - $\\text{TIR} > \\text{WACC}$: El retorno supera el costo de fondeo. Proyecto aprobado.
  - $\\text{TIR} < \\text{WACC}$: Retorno inferior al costo de capital. Rechazado.

---

## 4. Periodo de Recuperación (Payback Descontado)
Calcula el número de años o meses necesarios para que la suma acumulada de flujos de caja descontados iguale la inversión inicial $I_0$.

> [!TIP]
> En proyectos PyME en México, el Payback promedio saludable oscila entre **2.5 y 4.2 años**.
`
  },
  {
    id: 'punto-equilibrio-analisis-sensibilidad',
    title: 'Punto de Equilibrio, Diagrama Tornado y Matriz de Estrés',
    category: 'finanzas',
    tags: ['Punto de Equilibrio', 'Sensibilidad', 'Tornado', 'Stress Testing'],
    readTime: '5 min',
    author: 'Dirección Financiera OBP',
    updatedAt: '2026-10-13',
    excerpt: 'Cómo interpretar el punto de equilibrio operativo y las herramientas de análisis de riesgo de mercado.',
    content: `
# Punto de Equilibrio y Análisis de Sensibilidad

El punto de equilibrio y el análisis de estrés son las herramientas esenciales para convencer a comités de inversión de la resiliencia del modelo comercial.

---

## 1. Punto de Equilibrio Operativo (BEP)
Determina el volumen de ventas en el que los ingresos totales cubren exactamente los costos fijos y variables, arrojando utilidad operativa cero:

$$\\text{BEP}_{\\text{pesos}} = \\frac{\\text{Costos Fijos Mensuales}}{1 - \\frac{\\text{Costo Variable Unitario}}{\\text{Precio Unitario}}}$$

$$\\text{BEP}_{\\text{unidades}} = \\frac{\\text{Costos Fijos Mensuales}}{\\text{Precio Unitario} - \\text{Costo Variable Unitario}}$$

---

## 2. Diagrama de Tornado (Sensibilidad Unidimensional)
Mide el impacto de una volatilidad del **±15%** en cada variable de manera independiente, ordenándolas jerárquicamente de mayor a menor impacto en el VAN:

1. **Volumen de Ventas:** Habitualmente el factor con mayor letalidad en el flujo libre.
2. **Precios y Tarifas:** Afecta directamente el margen sin incrementar el costo variable.
3. **Costos de Insumos (Variables):** Inflación de materia prima.
4. **Costos Fijos (Nómina/Rentas):** Gastos estructurales.
5. **Inversión Inicial (CAPEX):** Desviación en compras de maquinaria o adecuaciones.

---

## 3. Matriz de Estrés Cruzada (Doble Entrada)
Cruza simultáneamente caídas de volumen de clientes (X) contra reducciones de tarifa de servicio (Y) para definir la frontera geométrica donde el proyecto deja de ser viable.
`
  },

  // ==========================================
  // RAG Y FICHA DE DRIVERS
  // ==========================================
  {
    id: 'ficha-drivers-anti-alucinaciones',
    title: 'Ficha de Drivers Canónicos: Erradicación de Números Huérfanos',
    category: 'rag_drivers',
    tags: ['RAG', 'Drivers', 'Anti-alucinaciones', 'Auditoría', 'Trazabilidad'],
    readTime: '6 min',
    author: 'Arquitectura de Datos OBP',
    updatedAt: '2026-10-13',
    excerpt: 'El estándar de cero números huérfanos: cómo OBP blinda las narrativas para que nunca contradigan las corridas financieras.',
    content: `
# Ficha de Drivers Canónicos y Cero Números Huérfanos

Uno de los problemas más graves de los planes de negocios generados por modelos de lenguaje genéricos es la **inconsistencia numérica** (ej. la narrativa menciona una inversión de $500,000 pero la tabla financiera dice $4,000,000, o se inventan conceptos de repostería en una empresa ganadera).

---

## El Principio de Cero Números Huérfanos

> [!IMPORTANT]
> En Open Business Plan, **ningún módulo de texto puede inventar una cifra económica**. Toda mención monetaria debe proceder de la **Ficha de Drivers Canónicos** o de una fuente documental RAG aprobada por el usuario.

\`\`\`mermaid
flowchart TD
  RAG[Documentos RAG: Word/PDF/Cotizaciones] --> Extractor[driversExtractor.js]
  Seed[Semilla del Proyecto] --> Extractor
  Extractor --> Ficha[Ficha de Drivers Canónica]
  
  Ficha --> Calc[calculadoraFinanciera.js]
  Ficha --> Dynamic[DynamicModule.jsx]
  Ficha --> Multi[MultiScenarioFinancialSection.jsx]
  Ficha --> Sim[Simulador Financiero Iframe]
  
  Auditor[auditorCifras.js] -.->|Verifica consistencia| Dynamic
  Auditor -.->|Alerta contradicciones| Multi
\`\`\`

---

## Los 6 Drivers Primarios
1. **\`capex_total\`:** Inversión total requerida para arrancar o expandir.
2. **\`concepto_producto\`:** Denominación formal del bien o servicio principal.
3. **\`precio_unitario_o_ticket\`:** Precio de venta promedio por unidad o servicio.
4. **\`volumen_mensual_ventas\`:** Unidades proyectadas al mes en régimen normal.
5. **\`costos_fijos_mensuales\`:** Nómina, renta, servicios y seguros mensuales.
6. **\`costo_variable_unitario\`:** Insumos y mano de obra directa por unidad producida.
`
  },

  // ==========================================
  // GLOSARIO Y ACRÓNIMOS
  // ==========================================
  {
    id: 'glosario-acronimos-empresariales',
    title: 'Glosario Maestro de Acrónimos y Métricas Empresariales',
    category: 'glosario',
    tags: ['Glosario', 'Acrónimos', 'CAPEX', 'OPEX', 'TRL', 'DNSH', 'EBITDA'],
    readTime: '5 min',
    author: 'Equipo OBP',
    updatedAt: '2026-10-13',
    excerpt: 'Diccionario exhaustivo de siglas, métricas y términos técnicos utilizados en la plataforma.',
    content: `
# Glosario Maestro de Acrónimos y Métricas

- **CAPEX (Capital Expenditure):** Inversiones de capital en activos fijos tangibles e intangibles de largo plazo (maquinaria, equipo, construcciones, licencias pre-operativas).
- **OPEX (Operational Expenditure):** Gastos corrientes recurrentes para la operación cotidiana (sueldos, rentas, insumos, suministros, marketing).
- **TRL (Technology Readiness Level):** Escala del 1 al 9 inventada por la NASA para medir la madurez tecnológica de un desarrollo (TRL 1: Principios básicos observados; TRL 9: Sistema probado en entorno operativo real).
- **DNSH (Do No Significant Harm):** Principio rector de la Unión Europea y Horizon Europe que exige demostrar que una inversión no perjudica los objetivos de mitigación climática, agua, economía circular, prevención de contaminación o biodiversidad.
- **EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization):** Utilidad operativa antes de intereses, impuestos, depreciaciones y amortizaciones; métrica clave de generación de caja pura del negocio.
- **CAGR (Compound Annual Growth Rate):** Tasa de crecimiento anual compuesto; mide la tasa constante de crecimiento anual durante un periodo de varios años.
- **SCIAN (Sistema de Clasificación Industrial de América del Norte):** Catálogo oficial de actividades económicas homologado entre México, Estados Unidos y Canadá.
- **DENUE (Directorio Estadístico Nacional de Unidades Económicas):** Censo en tiempo real de establecimientos económicos en México gestionado por el INEGI.
- **TAM / SAM / SOM:**
  - **TAM (Total Addressable Market):** Mercado total disponible si existiera 100% de cuota.
  - **SAM (Serviceable Addressable Market):** Mercado que tu modelo de negocio puede atender geográficamente y tecnológicamente.
  - **SOM (Serviceable Obtainable Market):** Cuota real y alcanzable que capturarás a corto y mediano plazo.
`
  }
];
