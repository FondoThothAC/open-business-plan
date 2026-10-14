# Metodología: Plan de Negocios CAFES (UNISON / SAETA)

## 1. Identidad del Método
- **Nombre Oficial:** Plan de Negocios CAFES: Metodología Integral para Emprendimiento Social, Microempresas y Oficios Familiares.
- **Origen Institucional y Bibliográfico Principal:**
  - *Coordinación / Centro de Asesoría Financiera y Emprendimiento Social (CAFES-UNISON)* — Universidad de Sonora.
  - *Convenio SAETA TAP* — Capacitación Técnica y Formación para el Trabajo y Autoempleo.
  - *Metodología Empresas Cuánticas* — Fondo Thoth AC (Modelo Atómico de 3 Áreas: Finanzas, Operaciones, Administración).
  - *Starting a Business QuickStart Guide* (Ken Colwell, PhD, MBA).
  - *Anatomy of a Business Plan* (Linda Pinson).
  - *Manual de Formulación y Evaluación de Proyectos SAGARPA / INAES*.
- **Propósito:** Brindar una estructura rigurosa pero accesible y empática para personas y familias en situación de vulnerabilidad económica que buscan crear o formalizar micronegocios, talleres de oficios (repostería, piñatas, alimentos, confección, servicios locales) y acceder a fondos de capital semilla, comités de crédito y programas universitarios o de gobierno.
- **Público Objetivo:** Microemprendedores familiares, estudiantes de programas de oficios, autoempleados en transición a la formalidad (RESICO en México), cooperativas comunitarias y solicitantes de capital semilla.

---

## 2. Estructura de Pilares y Módulos
El framework `cafes` consta de **10 Pilares** (9 Unidades académicas idénticas a la rúbrica del docente más el Simulador Financiero) y **15 Módulos**:

### Pilar 1: Unidad A · Resumen y Perfil del Emprendimiento
1. `resumen_ejecutivo`: Síntesis ejecutiva de oportunidad, propuesta de valor, demanda, inversión y viabilidad económica.
2. `perfil_emprendedor`: Datos de identificación, historia de vida, horario familiar, Diagnóstico Cuántico (Modelo Atómico de 3 Áreas) y ruta de independencia operativa.

### Pilar 2: Unidad B · Mercado, Portafolio y Cliente
3. `idea_portafolio`: Descripción de productos/servicios, fichas técnicas (BOM), presentaciones, empaques, inocuidad y límites iniciales.
4. `estudio_mercado`: Segmento, necesidades de compra, matriz de competidores locales (al menos 3), validación de demanda piloto, estacionalidad y dimensionamiento TAM/SAM/SOM.

### Pilar 3: Unidad C · Operaciones, Capacidad y Producción
5. `plan_operaciones`: Flujo del proceso, análisis de cuello de botella (Teoría de Restricciones - TOC), metas productivas, cotizaciones de insumos y equipos, croquis/lay-out del taller y logística.

### Pilar 4: Unidad D · Legal, Organización y Modelo Canvas
6. `aspectos_legales`: Transición a la formalidad, permisos de salud (COFEPRIS), uso de suelo, marca comercial, contratos y régimen fiscal RESICO.
7. `organizacion_talento`: Estructura del equipo, roles estándar, política de sueldos con carga patronal (32%), manuales de operación y turnos compatibles con la familia.
8. `propuesta_valor_canvas`: Beneficios clave, promesa de servicio al cliente, Lienzo Canvas de 9 bloques, política de precios y pruebas piloto.

### Pilar 5: Unidad E · Marketing y Plan Comercial
9. `plan_comercial`: Identidad de marca, canales de venta (WhatsApp Business, ferias, entregas), tácticas de bajo costo, combos familiares, alianzas comunitarias y plan de lanzamiento de 90 días.

### Pilar 6: Unidad F · Finanzas, Factibilidad y Corridas
10. `plan_financiero`: Inversión inicial CAPEX, capital de trabajo, costos fijos y variables, costeo unitario (BOM), depreciación, punto de equilibrio en unidades y pesos, proyecciones a 12 meses y 3 años, rentabilidad (B/C, ROI, VAN, TIR), sensibilidad y capacidad de pago.

### Pilar 7: Unidad G · Impacto Social, Familiar y Gestión de Riesgos
11. `impacto_social_ambiental`: Aumento del ingreso familiar neto, empleos directos e indirectos, inclusión y equidad de género, prácticas verdes y alineación a metas comunitarias.
12. `matriz_riesgos`: Identificación de riesgos en 4 cuadrantes (mercado, operativo, financiero, legal), probabilidad e impacto, medidas preventivas y gatillos de acción (Plan B).

### Pilar 8: Unidad H · Implementación y Solicitud al Financiador
13. `plan_implementacion`: Ruta crítica Gantt de 12 semanas, hitos semanales, responsables e indicadores de avance.
14. `requerimiento_capital`: Monto solicitado total, desglose por rubro, aportación propia en especie/efectivo, cotizaciones formales, impacto marginal antes/después y plan de comprobación fiscal.
15. `conclusiones_peticion`: Argumento integral de factibilidad, compromisos formales del emprendedor y mentorías requeridas.

### Pilar 9: Unidad I · Anexos y Expediente de Verificación
16. `expediente_anexos`: Lista de control firmada y recopilación digital de los 22 documentos anexos (A1 a A22: identificaciones, cotizaciones, fotos, tablas y contratos).

### Pilar 10: Simulador Financiero y Corridas Cuánticas
17. `simulador`: Simulador interactivo con estados de resultados automáticos, punto de equilibrio y pruebas de estrés de Monte Carlo.

---

## 3. Fórmulas y Modelos Cuantitativos Obligatorios

### A. Relación Beneficio / Costo (B/C)
$$\text{Relación } B/C = \frac{\sum_{t=1}^n \frac{B_t}{(1 + r)^t}}{I_0 + \sum_{t=1}^n \frac{C_t}{(1 + r)^t}}$$
Donde $B_t$ son los beneficios brutos en el periodo $t$, $C_t$ los costos operativos, $I_0$ la inversión inicial y $r$ la tasa de descuento de oportunidad (típicamente 10% - 12% para microemprendimiento social). Un proyecto es viable si $B/C > 1.15$.

### B. Punto de Equilibrio en Microempresas
$$PE_{\text{unidades}} = \frac{\text{Costos Fijos Mensuales (CF)}}{\text{Precio de Venta Unitario (PVU)} - \text{Costo Variable Unitario (CVU)}}$$
$$PE_{\text{pesos}} = PE_{\text{unidades}} \times PVU$$

### C. Valor Actual Neto (VAN) y Tasa Interna de Retorno (TIR)
$$VAN = -I_0 + \sum_{t=1}^n \frac{FNE_t}{(1 + r)^t} \quad ; \quad 0 = -I_0 + \sum_{t=1}^n \frac{FNE_t}{(1 + TIR)^t}$$
Donde $FNE_t$ es el Flujo Neto de Efectivo del año $t$.

### D. Salto Cuántico y Regla Atómica (Fondo Thoth AC)
- **Regla Nuclear:** Si el fundador participa directamente en las 3 áreas nucleares simultaneously ($\text{Área}_F \land \text{Área}_O \land \text{Área}_A$), se activa la alerta de fusión atómica con riesgo crítico de saturación operativa. El sistema obliga a planear la delegación de al menos una de las áreas débiles.
- **Salto Cuántico de Escala:** El paso de autoempleo individual (1 persona) a equipo de trabajo (2 a 5 personas) requiere reestructurar costos con carga patronal ($32\%$) y formalización en RESICO.

---

## 4. Boxes Visuales e Interactivos Asociados
1. `box_resumen_ejecutivo_1p` (TABLE): Resumen de 1 página para comités de evaluación y evaluadores de capital semilla.
2. `box_tam_sam_som` (FORMULA): Cálculo estructurado de mercado total, disponible y objetivo.
3. `box_canvas_osterwalder` (CANVAS): Lienzo de modelo de negocio de 9 bloques interactivo.
4. `box_micro_croquis_2d` (CANVAS): Diseñador de croquis 2D y distribución física del taller o local con inteligencia artificial.
5. `box_kpi_otd_dso_dio_ccc` (BENCHMARK): Indicadores de entrega a tiempo (OTD) y ciclo de efectivo.
6. `box_punto_equilibrio_micro` (FORMULA): Calculadora directa de tickets y unidades mínimas diarias.
7. `box_wacc_van_tir` (FORMULA): Evaluación formal de rentabilidad con VAN, TIR y relación B/C.
8. `box_montecarlo_sim` (FORMULA): Simulación estocástica de Monte Carlo para análisis de estrés.

---

## 5. Bibliografía y Citas Clave
- **Colwell, Ken.** *Starting a Business QuickStart Guide: The Simplified Beginner's Guide to Launching a Successful Small Business*. ClydeBank Media LLC, 2019.
- **Pinson, Linda.** *Anatomy of a Business Plan: The Step-by-Step Guide to Building a Business and Securing Your Company's Future*. Out of Your Mind...and Into the Marketplace, 2014.
- **Osterwalder, Alexander & Pigneur, Yves.** *Business Model Generation: A Handbook for Visionaries, Game Changers, and Challengers*. John Wiley & Sons, 2010.
- **Goldratt, Eliyahu M.** *The Goal: A Process of Ongoing Improvement*. North River Press, 1984.
- **Slack, Nigel, Brandon-Jones, Alistair & Johnston, Robert.** *Operations Management*. Pearson Education, 2016.
- **Fondo Thoth AC.** *Metodología Empresas Cuánticas: Modelo Atómico de Negocios y Saltos Cuánticos de Escala*. Manual de Operaciones, 2024.
- **Universidad de Sonora & SAETA TAP.** *Manual y Guía de Convocatorias CAFES-UNISON para el Emprendimiento Social y Familiar*. Hermosillo, Sonora, 2026.
