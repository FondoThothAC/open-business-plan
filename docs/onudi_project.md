# Metodología 12: Factibilidad Industrial ONUDI / COMFAR (`onudi_project`)

## 1. Identidad del Método
- **Nombre Oficial:** Metodología ONUDI para la Preparación y Evaluación de Estudios de Viabilidad Industrial (COMFAR - Computer Model for Feasibility Analysis and Reporting).
- **Origen Bibliográfico Principal:**
  - *Manual for the Preparation of Industrial Feasibility Studies* (W. Behrens & P. M. Hawranek, United Nations Industrial Development Organization - UNIDO / ONUDI, Viena).
  - *COMFAR III Expert: Manual del Usuario y Fundamentos de Cálculo Financiero e Industrial*.
  - *The Role of Corporate Sustainability in Asian Development* (Evaluación de Impacto Ambiental Industrial - EIA).
  - *Negotiating South-South Regional Agreements* (Riesgo País y Tipos de Cambio en Proyectos Industriales).
- **Propósito:** Proporcionar un estándar internacional riguroso, neutral y estandarizado para evaluar la viabilidad de mercado, técnica, ambiental y financiera de grandes complejos industriales, garantizando la comparabilidad de resultados para la banca multilateral y organismos de desarrollo.
- **Público Objetivo:** Agencias de desarrollo industrial de las Naciones Unidas, bancos de desarrollo regional (CAF, BCIE, BAD, BEI), ministerios de industria y consultoras de ingeniería internacional.

---

## 2. Estructura de Pilares y Módulos
El framework `onudi_project` consta de **4 Pilares Industriales** y **8 Módulos**:

### Pilar 1: Tecnología, Localización y Medio Ambiente
1. `tecnologia`: Selección y justificación del proceso productivo, procedencia de la tecnología (patentes, licencias), grado de mecanización y automatización.
2. `localizacion_industrial`: Matriz multicriterio de macrolocalización y microlocalización (disponibilidad y costo de energía eléctrica de alta tensión, gasoductos, derechos de agua, proximidad a vías férreas/puertos marítimos, exenciones fiscales de parques industriales).
3. `impacto_ambiental_onudi`: Estudio de Impacto Ambiental (EIA), plan de manejo y tratamiento de residuos industriales peligrosos, control de emisiones atmosféricas y cumplimiento de normas internacionales ISO 14001.

### Pilar 2: Costo de Capital y Riesgo País Internacional
4. `costo_capital`: Cálculo del Costo de Capital Promedio Ponderado Internacional ($WACC_{\text{ONUDI}}$) incorporando la Tasa Libre de Riesgo de EE.UU. (US Treasury 10Y), Beta desapalancada y la Prima de Riesgo País (EMBI+).
5. `riesgo_pais_cambiario`: Evaluación del riesgo macroeconómico y cambiario (depreciación esperada de la moneda local frente al USD, convertibilidad de divisas y mecanismos de cobertura con derivados financieros).

### Pilar 3: Flujo de Caja Libre y Evaluación Financiera
6. `flujo_firma`: Proyección del Flujo de Caja Libre para la Firma (FCFF) y Flujo de Caja para el Accionista (FCFE) según la metodología oficial COMFAR, calculando VAN, TIR, Periodo de Recuperación y Ratio Beneficio/Costo.
7. `riesgo`: Análisis de sensibilidad bidimensional y diagramas de iso-rentabilidad variando simultáneamente el precio del producto terminado y el costo del insumo crítico.

### Pilar 4: Simulación y Decisión de Inversión Multilateral
8. `simulador`: Simulador COMFAR de estrés financiero ante shocks de tipo de cambio, inflación y caídas en la utilización de la capacidad instalada.

---

## 3. Fórmulas y Modelos Cuantitativos Obligatorios

### A. Costo del Capital Propio Internacional con Riesgo País (CAPM Ajustado)
$$K_e = R_f + \beta_L \cdot (R_m - R_f) + CRP + \alpha_{\text{tamaño}}$$
- $R_f$: Tasa libre de riesgo internacional (Bono del Tesoro de EE.UU. a 10 años).
- $\beta_L$: Beta apalancada del sector industrial ($\beta_L = \beta_U \cdot [1 + (1 - T) \cdot (D/E)]$).
- $R_m - R_f$: Prima de riesgo de mercado accionario global ($5.0\% - 6.5\%$).
- $CRP$: Country Risk Premium / Riesgo País soberano (Spread del EMBI de J.P. Morgan, medido en puntos base).
- $\alpha_{\text{tamaño}}$: Prima por tamaño para empresas medianas o no cotizadas.

### B. Matriz Multicriterio de Localización Industrial ONUDI
$$\text{Índice de Localización } L_k = \sum_{j=1}^n w_j \cdot C_{jk}$$
| Factor Crítico de Localización | Ponderación ($w_j$) | Métrica de Evaluación |
|---|---|---|
| Disponibilidad de Agua Industrial y Tratamiento | $20\%$ | Litros por segundo garantizados por concesión |
| Capacidad Eléctrica en Subestación | $20\%$ | KVA disponibles y tarifa industrial por KWh |
| Conectividad Logística (Espuela de tren / Autopista) | $20\%$ | Costo de flete por tonelada/km al puerto o frontera |
| Disponibilidad de Mano de Obra Técnica Calificada | $15\%$ | Población económicamente activa y oferta técnica |
| Incentivos Fiscales Regionales | $15\%$ | Años de exención del impuesto sobre nómina / predial |
| Costo por metro cuadrado de terreno | $10\%$ | USD por $m^2$ urbanizado en parque industrial |

---

## 4. Boxes Visuales e Interactivos Asociados
1. `box_fcff_onudi_model` (FORMULA): Modelo de flujos de caja descontados según el estándar COMFAR.
2. `box_matriz_localizacion_onudi` (MATRIX): Matriz multicriterio de selección de sitio industrial.
3. `box_riesgo_pais_mat` (MATRIX): Cuadro de evaluación de riesgo cambiario y prima soberana.
4. `box_impacto_ambiental_onudi` (CHECKLIST): Lista de control ambiental y mitigación industrial (EIA).

---

## 5. Bibliografía y Citas Clave
- **Behrens, W., & Hawranek, P. M.** *Manual for the Preparation of Industrial Feasibility Studies*. United Nations Industrial Development Organization (UNIDO / ONUDI), Viena, 1991.
- **ONUDI.** *COMFAR III Expert: User's Guide and Mathematical Fundamentals*. Viena, 2005.
- **UNCTAD.** *Negotiating South-South Regional Trade Agreements*. Ginebra, 2011.
- **The Role of Corporate Sustainability in Asian Development.** *Industrial Environmental Impact Assessments*. pp. 120-145.
