# Metodología 1: Plan de Negocios Tradicional y Comercial (`business`)

## 1. Identidad del Método
- **Nombre Oficial:** Plan de Negocios Integral y Comercial (Anatomy & Corporate Standard).
- **Origen Bibliográfico Principal:** 
  - *Anatomy of a Business Plan* (Linda Pinson, 7ma Edición).
  - *Creating a Business Plan For Dummies* (Paul Tiffany & Steven D. Peterson, 2da Edición).
  - *Starting a Business QuickStart Guide* (Ken Colwell, PhD, MBA).
- **Propósito:** Estructurar planes de negocio bancables y ejecutivos para pequeñas, medianas y grandes empresas que buscan financiamiento bancario comercial, crédito gubernamental o estructuración formal.
- **Público Objetivo:** Emprendedores consolidados, directores generales, comités de crédito bancario y evaluadores de inversión privada.

---

## 2. Estructura de Pilares y Módulos
El framework `business` consta de **4 Pilares Estratégicos** y **22 Módulos**:

### Pilar 1: Naturaleza del Negocio (Estrategia y Filosofía)
1. `introduccion`: Resumen ejecutivo de 1 página, síntesis de la propuesta de valor y ask financiero.
2. `identidad`: Misión, visión, principios corporativos y posicionamiento en el mercado.
3. `objetivos`: Objetivos estratégicos a corto (1 año), mediano (3 años) y largo plazo (5 años) bajo estándar SMART.
4. `foda`: Matriz FODA cruzada cuantitativa (Fortalezas, Oportunidades, Debilidades, Amenazas).
5. `pestel`: Análisis del entorno macroeconómico (Político, Económico, Social, Tecnológico, Ecológico, Legal).
6. `legal`: Marco jurídico, constitución mercantil (S.A. de C.V., S.A.P.I.), licencias, marcas IMPI y permisos.
7. `canvas`: Business Model Canvas clásico de Alexander Osterwalder (9 bloques interconectados).

### Pilar 2: Estudio de Mercado y Estrategia Comercial
8. `analisis`: Dimensionamiento de mercado mediante cascada TAM (Total), SAM (Alcanzable) y SOM (Objetivo).
9. `segmentacion`: Definición de perfiles sociodemográficos, psicográficos y segmentación conductual B2B/B2C.
10. `mapa`: Mapeo de posicionamiento competitivo en cuadrantes precio vs. calidad/servicio.
11. `competencia`: Inteligencia competitiva, benchmarking de competidores directos, indirectos y sustitutos.
12. `benchmarking`: Comparativa de factores críticos de éxito contra el líder del mercado.
13. `comercializacion`: Mezcla de mercadotecnia (4P / 7P) y canales de distribución física y digital.
14. `ventas`: Embudo comercial, pronóstico de ventas y métricas unitarias (CAC, LTV, Churn).
15. `metricas_aarrr`: Embudo pirata de 5 fases (Adquisición, Activación, Retención, Referencia, Ingresos).

### Pilar 3: Estudio Técnico y Operaciones
16. `ubicacion`: Macrolocalización y microlocalización de instalaciones con matriz de factores ponderados.
17. `operacion`: Flujo de operaciones, diagrama de procesos (BPMN) y métricas SCM (OTD, DSO, DPO, CCC).
18. `recursos`: Inventario de maquinaria, equipo técnico, mobiliario e infraestructura física.
19. `insumos`: Cadena de suministro, proveedores estratégicos, materias primas y políticas de inventario.
20. `capacidad`: Capacidad instalada vs. capacidad utilizada y cuellos de botella operativos.
21. `operativa`: Políticas de control de calidad, mantenimiento preventivo y seguridad laboral.
22. `ambiental`: Cumplimiento normativo ecológico, huella de carbono y disposición de residuos.

### Pilar 4: Organización y Evaluación Financiera
23. `estructura`: Organigrama funcional, manual de perfiles de puesto y gobierno corporativo.
24. `recursos_humanos`: Política salarial, prestaciones de ley, plan de incentivos y capacitación.
25. `inversion`: Presupuesto de inversión inicial (Activo Fijo, Activo Diferido, Capital de Trabajo).
26. `costos`: Estructura de costos fijos mensuales y costos variables unitarios.
27. `estados_financieros`: Estados proforma a 5 años (Estado de Resultados, Balance General, Flujo de Efectivo).
28. `rentabilidad`: Evaluación financiera descontada: WACC, VAN, TIR, Periodo de Recuperación (Payback).
29. `simulador`: Simulación probabilística de Monte Carlo (10,000 iteraciones) y análisis de escenarios.

---

## 3. Fórmulas y Modelos Cuantitativos Obligatorios

### A. Costo Promedio Ponderado de Capital (WACC / CPPC)
$$WACC = K_e \cdot \frac{E}{V} + K_d \cdot (1 - T) \cdot \frac{D}{V}$$
- $K_e$: Costo del capital propio (calculado vía CAPM: $R_f + \beta(R_m - R_f)$).
- $K_d$: Costo nominal de la deuda financiera bancaria.
- $T$: Tasa impositiva corporativa efectiva (ISR + PTU = 30-35% en México).
- $E/V$: Proporción de fondos propios sobre el capital total.
- $D/V$: Proporción de deuda con costo sobre el capital total.

### B. Valor Actual Neto (VAN) y Tasa Interna de Retorno (TIR)
$$VAN = -I_0 + \sum_{t=1}^n \frac{FCF_t}{(1 + WACC)^t} + \frac{VR_n}{(1 + WACC)^n}$$
- Criterio de aceptación: $VAN > 0$ y $TIR > WACC$.

### C. Unit Economics: Eficiencia Comercial
$$\text{LTV} = \frac{\text{Margen de Contribución Promedio por Cliente}}{\text{Tasa de Cancelación (Churn Rate)}}$$
$$\text{Ratio de Viabilidad} = \frac{\text{LTV}}{\text{CAC}} \ge 3.0\text{x}$$
- Si $\text{LTV} / \text{CAC} < 3.0$, el modelo destruye valor comercial al escalar.

### D. Métricas Pirata AARRR
1. **Adquisición (CAC):** Costo total de ventas y marketing / Nuevos clientes adquiridos.
2. **Activación:** % de leads que experimentan el momento "Aha!" dentro de las primeras 48 horas.
3. **Retención:** % de clientes recurrentes mes sobre mes (Cohort Retention $\ge 60\%$).
4. **Referencia:** Coeficiente viral $K = i \cdot c$ (donde $i$ = invitaciones enviadas y $c$ = tasa de conversión).
5. **Ingresos (ARPU / LTV):** Ingreso promedio por usuario activo y margen bruto unitario $\ge 40\%$.

---

## 4. Boxes Visuales e Interactivos Asociados
1. `box_resumen_ejecutivo_1p` (TABLE): Resumen bancario de una página.
2. `box_tam_sam_som` (FORMULA): Cascada de dimensionamiento de mercado.
3. `box_swot_foda` (MATRIX): Cuadrantes FODA interactivos.
4. `box_unit_economics` (BENCHMARK): Ratios CAC, LTV y Payback de Adquisición.
5. `box_wacc_van_tir` (FORMULA): Valuación dinámica con flujos descontados.
6. `box_canvas_osterwalder` (CANVAS): Lienzo interactivo de 9 bloques.
7. `box_benchmark_cac_ltv` (BENCHMARK): Semáforo sectorial de eficiencia comercial.
8. `box_kpi_otd_dso_dio_ccc` (BENCHMARK): Monitoreo de capital de trabajo y SCM.
9. `box_aarrr_pirata_5metricas` (BENCHMARK): Embudo de crecimiento de 5 etapas.

---

## 5. Bibliografía y Citas Clave
- **Pinson, Linda.** *Anatomy of a Business Plan: The Step-by-Step Guide to Building a Business and Securing Your Company's Future*. 7th Edition, Out of Your Mind... and Into the Marketplace, 2008.
- **Tiffany, Paul & Peterson, Steven D.** *Creating a Business Plan For Dummies*. 2nd Edition, Wiley Publishing, Inc., 2005.
- **Colwell, Ken.** *Starting a Business QuickStart Guide: The Simplified Beginner's Guide to Launching a Successful Small Business, Turning Your Vision into Reality, and Achieving Financial Freedom*. ClydeBank Media LLC, 2019.
- **Ries, Eric.** *The Lean Startup: How Today's Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses*. Crown Business, 2011.
