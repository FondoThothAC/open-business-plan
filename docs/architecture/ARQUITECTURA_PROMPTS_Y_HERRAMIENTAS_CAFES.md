# Arquitectura de Prompts, Motores y Herramientas: Metodología CAFES UNISON y Método Bob 1 UNISON

Este documento define la arquitectura de inteligencia artificial, los prompts especializados y el ecosistema de herramientas de **Open Business Plan (OBP)** utilizados para generar cada unidad y módulo de la metodología **CAFES UNISON** y del **Método Bob 1 UNISON**, fundamentando la selección técnica de cada componente.

---

## 1. Filosofía de Generación: Determinismo Matemático vs. Inferencia Lingüística

En Open Business Plan, la generación de planes de negocio no delega los cálculos numéricos a la alucinación estocástica de los modelos de lenguaje (LLM). Seguimos el principio de **Backstage-RED**:
- **90% Lógica Determinista:** Motores de cálculo en JavaScript/TypeScript puro (capex, opex, depreciaciones, márgenes, estados proforma, punto de equilibrio y relación B/C).
- **10% Inferencia Quirúrgica de LLM:** Redacción explicativa, contextualización de mercado, narrativa estratégica y alineación pedagógica con el programa de estudios del docente.

---

## 2. Mapa de Herramientas de Open Business Plan: ¿Qué Usamos y Por Qué?

| Herramienta / Módulo OBP | Estado | Función Específica en CAFES | Justificación Técnica ("¿Por qué se usa?") |
| :--- | :--- | :--- | :--- |
| `src/lib/finanzas/calculadoraFinanciera.js` | **Existente (Reutilizada)** | Cálculo de flujos de caja, estados de resultados proforma a 12 meses, balance general y relación Beneficio/Costo (B/C). | Garantiza que las cifras de ventas, costos y utilidades de la Unidad F coincidan exactamente al centavo, eliminando discrepancias matemáticas en la revisión docente. |
| `src/lib/finanzas/driversExtractor.js` | **Existente (Reutilizada)** | Extracción de variables base del proyecto (precio de venta, costo de insumos, capacidad diaria de producción, sueldos). | Permite que si el usuario cambia el precio de un producto en la Unidad B, el cambio se propague de forma reactiva a la Unidad F y a los Anexos sin requerir regenerar manualmente todo el plan. |
| `src/lib/field_guides.js` | **Existente (Enriquecida)** | Inyección de guías de redacción contextuales por campo (`CAFES_UNISON_GUIDES` y `BOB_UNISON_GUIDES`). | Evita que el usuario quede frente a un campo en blanco; cada campo cuenta con instrucciones pedagógicas, ejemplos de microempresas sonorenses, fuentes y citas canónicas. |
| `src/lib/docxExportEngine.js` | **Existente (Adaptada)** | Compilación y renderizado tipográfico a documento formal de Microsoft Word (`.docx`). | Genera la entrega académica final con portada institucional, carta de presentación, tablas financieras formateadas con celdas visibles y expediente de anexos A1 a A22. |
| `data/cafes/inegi/` + Motor RAG de Mercado | **Nueva / Adaptada** | Consulta de microdatos locales (DENUE, Censos Económicos y demografía de Hermosillo y Sonora). | La Unidad B exige cuantificar la demanda en el entorno local. Usar datos de INEGI Sonora grounded evita estimaciones genéricas de otros países o estados. |
| `data/cafes/calculos/` + Parser de Excel | **Nueva (Herramienta Especializada)** | Ingesta directa de la memoria de cálculo en Excel utilizada tradicionalmente en el aula de CAFES. | Los estudiantes y asesores suelen trabajar sus corridas financieras en hojas de cálculo. Este parser permite volcar sus celdas directamente al modelo OBP sin transcripción manual propensa a errores. |
| `data/cafes/entrevistas/` + Ingesta Manual | **Nueva (Flujo Estructurado)** | Formulario interactivo de captura de la entrevista diagnóstica realizada por el asesor de CAFES. | La Unidad A (Módulo 1: Perfil del Emprendedor) no debe ser inventada por la IA; proviene de la entrevista cualitativa directa realizada al emprendedor social. |

---

## 3. Catálogo Canónico de Prompts por Unidad y Módulo (CAFES UNISON)

### Rol Global del Sistema (System Prompt)
```markdown
Eres el Asesor Senior de Emprendimiento Social y Modelación de Negocios del Centro de Asesoría Financiera y Emprendimiento Social (CAFES) del Departamento de Economía de la Universidad de Sonora (UNISON), coordinado con el programa SAETA TAP.
Tu misión es formular y estructurar un Plan de Negocios riguroso, pedagógico, realista y de alta viabilidad para microempresas familiares, oficios y proyectos de autoempleo en el estado de Sonora.
Reglas fundamentales:
1. Respetar estrictamente la nomenclatura, incisos y directrices académicas de las 9 Unidades (Unidad A a Unidad I) y 15 Módulos del índice oficial.
2. Basarte estrictamente en los drivers del proyecto, la memoria de cálculo financiero y las respuestas de la entrevista diagnóstica sin inventar cifras fantasiosas.
3. Utilizar un lenguaje profesional, claro, empático y estructurado en español neutro premium, adecuado tanto para evaluación académica universitaria como para solicitud de capital semilla o microcréditos.
```

---

### Unidad A: Fundamentos del Negocio

#### Módulo 0: Resumen Ejecutivo (Incisos 0.1 al 0.14)
- **Herramientas Utilizadas:** `driversExtractor.js`, `calculadoraFinanciera.js`.
- **Justificación:** Este módulo es una síntesis ejecutiva de todo el plan; debe construirse únicamente después de conocer los costos, la inversión y la demanda para no generar inconsistencias.
- **Prompt del Módulo:**
```markdown
Genera el Módulo 0 (Resumen Ejecutivo) del plan de negocios para {nombre_proyecto}, sintetizando con máxima claridad los 14 incisos requeridos:
0.1 Descripción del negocio y situación actual.
0.2 Problema/oportunidad que atiende en su comunidad.
0.3 Propuesta de valor central (diferenciadores clave).
0.4 Perfil del cliente objetivo.
0.5 Tamaño y validación de la demanda inicial.
0.6 Competencia directa local y ventaja competitiva.
0.7 Modelo de ingresos y política de precios.
0.8 Requerimiento de capital semilla, inversión inicial y desglose esencial.
0.9 Proyección de ventas y utilidad neta esperada en el Año 1 (basado en drivers: {drivers_financieros}).
0.10 Punto de equilibrio en unidades y pesos mensuales.
0.11 Relación Beneficio/Costo (B/C).
0.12 Impacto social y familiar esperado (autoempleo, calidad de vida).
0.13 Principales riesgos detectados y plan de contingencia inmediato.
0.14 Cronograma de implementación general (hoja de ruta de 12 semanas).
```

#### Módulo 1: Perfil del Emprendedor y del Proyecto (Incisos 1.1 al 1.6)
- **Herramientas Utilizadas:** `data/cafes/entrevistas/` (Entrevista diagnóstica del asesor).
- **Justificación:** Los datos de motivación, experiencia y conciliación familiar son datos humanos directos obtenidos en la asesoría presencial; la IA estructura y formaliza la redacción sin alterar los hechos.
- **Prompt del Módulo:**
```markdown
A partir de los datos recabados en la entrevista inicial ({datos_entrevista_emprendedor}), redacta de forma estructurada el Módulo 1 (Perfil del Emprendedor y del Proyecto):
1.1 Datos de identificación del emprendedor y del núcleo familiar participante.
1.2 Historia, motivación personal y nivel de compromiso con la iniciativa.
1.3 Experiencia técnica en el oficio y habilidades laborales previas.
1.4 Horario disponible y esquema de apoyo familiar (dedicación exclusiva o combinada).
1.5 Diagnóstico de necesidades de capacitación técnica y administrativa.
1.6 Situación operativa actual del negocio (clientes activos, ventas históricas y productos comercializados).
```

---

### Unidad B: Mercado y Cliente

#### Módulo 2: Idea de Negocio y Portafolio (Incisos 2.1 al 2.5)
- **Herramientas Utilizadas:** `driversExtractor.js` (BOM / Recetas base).
- **Prompt del Módulo:**
```markdown
Desarrolla el catálogo y portafolio de productos/servicios para {nombre_proyecto}:
2.1 Descripción detallada de los productos/servicios principales.
2.2 Fichas técnicas por producto: lista de insumos (BOM), tiempos estándar de elaboración y porcentaje de merma tolerado.
2.3 Presentaciones comerciales, medidas, gramajes y empaques utilizados.
2.4 Requerimientos normativos y de calidad aplicables al giro (inocuidad alimentaria COFEPRIS, manejo de materias primas o seguridad).
2.5 Alcance y limitaciones iniciales: define con precisión qué productos y volúmenes sí se atenderán en la etapa de arranque y cuáles se reservan para etapas posteriores.
```

#### Módulo 3: Estudio de Mercado Práctico (Incisos 3.1 al 3.8)
- **Herramientas Utilizadas:** Motor RAG con microdatos `data/cafes/inegi/` (DENUE y demografía Sonora).
- **Justificación:** Evita supuestos abstractos de mercado y vincula el análisis con competidores y consumidores reales de la colonia o municipio de operación.
- **Prompt del Módulo:**
```markdown
Elabora el Estudio de Mercado Práctico de {nombre_proyecto} para la plaza de {municipio_plaza}, integrando los datos de mercado disponibles:
3.1 Segmentación psicográfica y sociodemográfica del cliente objetivo, incluyendo capacidad de pago estimada.
3.2 Necesidades prioritarias del cliente y factores decisivos de compra (precio, rapidez, calidad, atención).
3.3 Identificación y mapeo de al menos 3 competidores directos locales, con rangos de precios y ubicación relativa.
3.4 Matriz de diferenciación frente a la competencia (coincidencias y ventajas distintivas).
3.5 Evidencia de validación de demanda (resultados de encuestas exprés, sondeos o pedidos piloto).
3.6 Ubicación del establecimiento o taller, radio de cobertura logística y accesibilidad para clientes.
3.7 Estacionalidad de la demanda y picos comerciales anuales relevantes para el giro.
3.8 Estimación cuantitativa y conservadora de la demanda (volumen diario, semanal y mensual).
```

---

### Unidad C: Propuesta de Valor y Operaciones

#### Módulo 4: Plan de Operaciones y Producción (Incisos 4.1 al 4.10)
- **Herramientas Utilizadas:** `calculadoraFinanciera.js` (Cálculo de capacidad instalada y tiempos estándar).
- **Prompt del Módulo:**
```markdown
Diseña el Plan de Operaciones y Producción de {nombre_proyecto}:
4.1 Diagrama de flujo detallado del proceso de producción o prestación del servicio.
4.2 Determinación de la capacidad instalada teórica, capacidad real y cuello de botella del proceso.
4.3 Programa y metas de producción semanal, mensual y anual.
4.4 Medidas de aseguramiento de calidad, higiene y buenas prácticas de manufactura.
4.5 Padrón de materias primas e insumos clave con cotizaciones comparativas de al menos 2 proveedores locales.
4.6 Inventario de maquinaria, equipo principal y herramientas de trabajo requeridas.
4.7 Croquis o layout del espacio de trabajo (organización de áreas limpias, almacén y despacho).
4.8 Logística de distribución, entrega de pedidos y política de embalaje.
4.9 Política de control de inventarios: stock mínimo de seguridad y rotación de insumos.
4.10 Protocolo de seguridad e higiene laboral y manejo responsable de residuos.
```

---

### Unidad D: Marco Legal y Organización

#### Módulo 5: Aspectos Legales y Regulatorios (Incisos 5.1 al 5.5)
- **Prompt del Módulo:**
```markdown
Estructura el marco legal y regulatorio para {nombre_proyecto} conforme a la legislación municipal y estatal de Sonora:
5.1 Régimen de operación actual y ruta de formalización gradual.
5.2 Trámites, licencias, avisos de funcionamiento (uso de suelo, protección civil, COFEPRIS si aplica).
5.3 Protección de signos distintivos (registro de marca ante IMPI y propiedad intelectual básica).
5.4 Contratos esenciales de operación (arrendamiento, proveeduría, prestación de servicios).
5.5 Estrategia fiscal simplificada (incorporación a RESICO / SAT).
```

#### Módulo 6: Organización y Talento (Incisos 6.1 al 6.5)
- **Prompt del Módulo:**
```markdown
Define la estructura organizativa de {nombre_proyecto}:
6.1 Estructura del equipo de trabajo, asignación de roles y responsabilidades.
6.2 Perfiles de puesto, descripción de tareas estándar y dedicación horaria.
6.3 Esquema de retribución económica, estipendios familiares y plan de desarrollo de competencias.
6.4 Manuales operativos básicos: procedimientos de producción y protocolo de servicio al cliente.
6.5 Esquema de turnos, jornadas y mecanismos de conciliación con la vida familiar.
```

#### Módulo 7: Propuesta de Valor y Modelo de Negocio (Incisos 7.1 al 7.5)
- **Prompt del Módulo:**
```markdown
Sintetiza la propuesta de valor y el modelo de negocio de {nombre_proyecto}:
7.1 Declaración formal de la propuesta de valor y beneficios sustantivos para el consumidor.
7.2 Promesa de marca y diseño de la experiencia del cliente.
7.3 Estructura completa del Lienzo Canvas en sus 9 bloques constitutivos.
7.4 Política de fijación de precios (fórmula de costeo, margen deseado y estrategias promocionales).
7.5 Plan de validación iterativa, pruebas piloto y métricas de aprendizaje continuo.
```

---

### Unidad E: Comercialización

#### Módulo 8: Plan Comercial (Incisos 8.1 al 8.8)
- **Prompt del Módulo:**
```markdown
Elabora el Plan Comercial y de Mercadotecnia para {nombre_proyecto}:
8.1 Identidad de marca, tono comunicacional, logotipo y mensajes persuasivos clave.
8.2 Canales directos y digitales de venta (punto de venta, WhatsApp Business, ferias locales, redes sociales).
8.3 Estrategias de promoción comunitaria de bajo costo (muestras, referidos, dinámicas especiales).
8.4 Estructuración de combos comerciales, paquetes familiares y precios psicológicos.
8.5 Protocolo de atención personalizada y política de devoluciones/garantías.
8.6 Objetivos comerciales cuantitativos (volumen de clientes nuevos, ticket promedio y frecuencia de recompra).
8.7 Red de alianzas estratégicas locales (escuelas, comercios vecinos, parroquias o colectivos).
8.8 Plan de lanzamiento y comercialización intensiva durante los primeros 90 días (acciones semanales).
```

---

### Unidad F: Finanzas y Factibilidad

#### Módulo 9: Plan Financiero (Incisos 9.1 al 9.16)
- **Herramientas Utilizadas:** `calculadoraFinanciera.js` + `data/cafes/calculos/` (Memoria de cálculo Excel).
- **Justificación:** Este módulo es evaluado estrictamente contra fórmulas contables estándar; la IA redacta la memoria técnica basándose en las matrices numéricas calculadas determinísticamente por el motor de finanzas.
- **Prompt del Módulo:**
```markdown
A partir de la corrida financiera generada determinísticamente ({tablas_financieras_calculadas}), redacta la memoria descriptiva del Módulo 9 (Plan Financiero):
9.1 Explicación detallada de los supuestos base de operación (días hábiles, horas productivas, merma).
9.2 Presupuesto de inversión en activos fijos y herramientas.
9.3 Estimación del capital de trabajo necesario para el ciclo operativo inicial.
9.4 Desglose mensual de costos fijos de operación y costos variables unitarios.
9.5 Tabla de costeo unitario y margen de contribución por producto del portafolio.
9.6 Programa de depreciación lineal de maquinaria y equipo.
9.7 Justificación de la política de precios y margen neto meta.
9.8 Análisis del Punto de Equilibrio en volumen de producción y en ingresos monetarios.
9.9 Proyección de ventas: mensualizada para el Año 1 y proyecciones anuales para Años 2 y 3.
9.10 Interpretación del Estado de Resultados Proforma mensual del primer ejercicio.
9.11 Análisis del Estado de Flujo de Efectivo mensual y saldo final de caja.
9.12 Balance General inicial y proyectado al cierre del Año 1.
9.13 Cálculo e interpretación de indicadores de rentabilidad (Margen Bruto, Margen Neto, ROI, Periodo de Recuperación y Relación Beneficio/Costo B/C).
9.14 Análisis de sensibilidad ante variaciones de ±10% en volumen de ventas y costos directos.
9.15 Evaluación de escenarios de desempeño: Conservador/Pesimista, Base y Optimista.
9.16 Análisis de liquidez y capacidad de pago del servicio de deuda (si aplica financiamiento).
```

---

### Unidad G: Impacto y Gestión de Riesgos

#### Módulo 10: Impacto Social, Familiar y Ambiental (Incisos 10.1 al 10.5)
- **Prompt del Módulo:**
```markdown
Documenta el impacto social, familiar y ambiental de {nombre_proyecto}:
10.1 Incremento proyectado en el ingreso disponible del hogar y estabilidad económica familiar.
10.2 Cuantificación de empleos directos generados e indirectos impulsados en la cadena comunitaria.
10.3 Acciones concretas de inclusión de género, empoderamiento y equidad en la gestión del negocio.
10.4 Prácticas de sostenibilidad ambiental, reciclaje de insumos y eficiencia energética.
10.5 Alineación del proyecto con los objetivos de desarrollo social y programas comunitarios de la Universidad de Sonora y SAETA.
```

#### Módulo 11: Matriz de Riesgos (Incisos 11.1 al 11.4)
- **Prompt del Módulo:**
```markdown
Construye la Matriz de Riesgos y Gestión de Contingencias para {nombre_proyecto}:
11.1 Identificación de factores de riesgo en 4 cuadrantes: Mercado, Operativo, Financiero y Legal/Regulatorio.
11.2 Evaluación de severidad: escala de Probabilidad (Baja, Media, Alta) e Impacto económico.
11.3 Medidas preventivas y protocolos de mitigación operativa para cada riesgo identificado.
11.4 Plan de contingencia (Plan B) y definición de gatillos de acción inmediata.
```

---

### Unidad H: Implementación y Solicitud al Financiador

#### Módulo 12: Plan de Implementación (Incisos 12.1 al 12.4)
- **Prompt del Módulo:**
```markdown
Estructura el Plan de Implementación operativa de {nombre_proyecto}:
12.1 Diagrama de ruta crítica y cronograma de actividades desglosado en un horizonte de 12 semanas.
12.2 Definición de hitos clave de avance y entregables verificables por semana.
12.3 Asignación de responsables e indicadores de cumplimiento operativo.
12.4 Plan de ajuste ante retrasos o eventualidades en la habilitación del negocio.
```

#### Módulo 13: Requerimiento de Capital Inicial (Incisos 13.1 al 13.6)
- **Herramientas Utilizadas:** `calculadoraFinanciera.js` + `data/cafes/anexos/` (Cotizaciones de proveedores).
- **Prompt del Módulo:**
```markdown
Formula la solicitud formal de Capital Semilla / Financiamiento para {nombre_proyecto}:
13.1 Monto total de inversión requerida debidamente redondeado y justificado.
13.2 Desglose analítico del destino de los recursos (maquinaria, insumos iniciales, habilitación, capital de trabajo).
13.3 Estructura de coinversión: aportación propia del emprendedor (en efectivo o especie) vs. recurso solicitado.
13.4 Resumen de cotizaciones comerciales de respaldo y fuentes de proveeduría validadas.
13.5 Proyección del impacto del capital semilla: comparativa del negocio 'antes' y 'después' de recibir el recurso.
13.6 Plan transparente de comprobación del gasto, resguardo de facturas y rendición de cuentas al comité evaluador.
```

#### Módulo 14: Conclusiones y Petición Formal (Incisos 14.1 al 14.3)
- **Prompt del Módulo:**
```markdown
Redacta las Conclusiones y la Petición Formal de {nombre_proyecto} dirigida al Comité Dictaminador de CAFES UNISON / Financiador:
14.1 Argumentación integral de viabilidad técnica, comercial y económica del plan de negocios.
14.2 Compromisos formales y éticos que asume el emprendedor en el uso del recurso y cumplimiento de metas.
14.3 Requerimientos específicos de mentoría y acompañamiento que solicita al centro universitario durante el primer año.
```

---

### Unidad I: Expediente de Anexos (A1 a A22)
- **Herramientas Utilizadas:** `docxExportEngine.js` + `data/cafes/anexos/`.
- **Estructura del Checklist y Carátulas:**
  - Carátula de control para cada uno de los 22 anexos (A1 al A22) requeridos en el índice del docente.
  - La herramienta compila los anexos documentales en el Word final garantizando orden numérico y trazabilidad.

---

## 4. Prompts Exclusivos del Método Bob 1 UNISON (`bob_unison`)

En el **Método Bob 1 UNISON**, además de los 15 módulos académicos de CAFES, se activan los siguientes motores y prompts especializados:

1. **Diagnóstico Cuántico Atómico (Modelo de 3 Áreas de Fondo Thoth AC):**
   - Evalúa el perfil del fundador en Finanzas, Operaciones y Administración.
   - Detecta sobrecarga y previene la "fusión atómica".
   - Genera perfil de delegación profesional (perfil para vacante/LinkedIn, rango salarial, responsabilidades).
2. **Ingeniería de Operaciones bajo Teoría de Restricciones (TOC / Eliyahu Goldratt):**
   - Identifica el recurso con capacidad restringida (CCR) y calcula el rendimiento máximo del sistema (*Throughput*).
   - Métricas avanzadas: On-Time Delivery (OTD) y Cash Conversion Cycle (CCC).
3. **Dimensionamiento Cuantitativo de Mercado (TAM, SAM, SOM y Unit Economics):**
   - Cálculo formal de mercado total, disponible y obtenible con microdatos censales de Sonora.
   - Métricas de CAC (Costo de Adquisición de Clientes) y LTV (Valor del Ciclo de Vida del Cliente).
4. **Simulación Financiera Estocástica de Monte Carlo y Reserva de Contingencia:**
   - 1,000 iteraciones sobre variaciones de precios y costos para proyectar la probabilidad de éxito y calcular el Valor Actual Neto (VAN) y la Tasa Interna de Retorno (TIR) estocásticos.
