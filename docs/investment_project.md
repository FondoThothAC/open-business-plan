# Metodología 6: Proyecto de Inversión Industrial y CAPEX (`investment_project`)

## 1. Identidad del Método
- **Nombre Oficial:** Formulación y Evaluación Integral de Proyectos de Inversión de Capital (CAPEX Intensive).
- **Origen Bibliográfico Principal:**
  - *The Nature of Value: Achieving High Performance and Sustainability* (Gogerty & Rocha - Modelos de Descuento y Tornado).
  - *Anatomy of a Business Plan* (Cap. 7 - Engineering & CAPEX Budgeting).
  - *Manual de Proyectos de Inversión Industrial* (ONUDI - Behrens & Hawranek).
  - *MasterFormat 16 Divisions (Construction Specifications Institute - CSI)*.
- **Propósito:** Estructurar la viabilidad técnica, de ingeniería de detalle, presupuestaria y financiera para proyectos con alto requerimiento de activos fijos (plantas industriales, complejos agroindustriales, desarrollos inmobiliarios, naves logísticas, minería, plantas TIF) que requieren financiamiento de Project Finance, sindicatos bancarios o fondos de infraestructura.
- **Público Objetivo:** Directores de operaciones, banqueros de inversión, fondos de capital privado (Private Equity), consultores de ingeniería y estructuradores de proyectos industriales.

---

## 2. Estructura de Pilares y Módulos
El framework `investment_project` consta de **4 Pilares Industriales** y **13 Módulos**:

### Pilar 1: Estudio de Mercado y Balance Oferta-Demanda
1. `demanda`: Estimación econométrica de la demanda nacional e internacional proyectada a 10 años, elasticidad precio e ingreso.
2. `oferta`: Capacidad instalada de la competencia en el país y en el extranjero, cuotas de mercado y brecha de demanda insatisfecha proyectada.

### Pilar 2: Ingeniería de Detalle y Distribución de Planta
3. `ingenieria`: Especificaciones técnicas de procesos, balance de materia y energía, selección de tecnología de punta y hojas de datos de maquinaria.
4. `layout`: Visualizador interactivo de Lay-out de planta industrial (zonas de recepción, proceso primario, cámaras frigoríficas, almacén de producto terminado, oficinas y patio de maniobras).
5. `presupuesto`: Presupuesto consolidado de inversión inicial desglosado en Terreno, Obra Civil, Maquinaria, Montaje y Capital de Trabajo.
6. `capex_csi_16`: Catálogo exhaustivo de conceptos de obra y equipamiento estructurado en las 16 divisiones de la norma CSI MasterFormat.
7. `cronograma`: Diagrama de Gantt de la fase de inversión previa (EPC / Procura, Construcción y Puesta en Marcha) con ruta crítica (CPM).

### Pilar 3: Estructuración Financiera y Fuentes de Fondeo
8. `capital`: Estructuración de fondos propios (Equity) y requerimiento de coinversionistas institucionales.
9. `deuda`: Plan de financiamiento bancario a largo plazo, líneas de crédito FIRA/Bancomext, periodos de gracia, covenants financieros y tasas de interés swaps.

### Pilar 4: Evaluación de Rentabilidad y Gestión de Riesgo Cuántico
10. `sensibilidad`: Análisis de sensibilidad unidimensional variando variables críticas (precios de venta, costo de materia prima, volumen de producción).
11. `tornado_sensibilidad`: Gráfica Tornado de sensibilidad multivariable jerarquizando el impacto relativo en el VAN ante oscilaciones de $\pm 25\%$.
12. `probabilidad`: Simulación estocástica de Monte Carlo (10,000 iteraciones) generando curvas de distribución acumulada de probabilidad para VAN y TIR.
13. `simulador`: Tablero interactivo de modelado de escenarios (Pesimista, Base, Optimista) con cálculo en tiempo real de flujos de caja libre para la firma (FCFF).

---

## 3. Fórmulas y Modelos Cuantitativos Obligatorios

### A. Flujo de Caja Libre para la Firma (FCFF)
$$FCFF = EBIT \cdot (1 - T) + D\&A - CAPEX - \Delta NWC$$
- $EBIT$: Utilidad antes de intereses e impuestos.
- $T$: Tasa impositiva corporativa.
- $D\&A$: Depreciación de activos fijos y amortización de intangibles.
- $CAPEX$: Inversiones en bienes de capital (mantenimiento y expansión).
- $\Delta NWC$: Variación neta en el capital de trabajo operativo ($NWC = \text{Cuentas por Cobrar} + \text{Inventarios} - \text{Cuentas por Pagar}$).

### B. Valor Terminal (Terminal Value - Gordon Shapiro)
$$TV_n = \frac{FCFF_{n+1}}{WACC - g} = \frac{FCFF_n \cdot (1 + g)}{WACC - g}$$
- $g$: Tasa de crecimiento a perpetuidad (típicamente alineada a la inflación o crecimiento del PIB de largo plazo, $2.0\% - 3.5\%$).

### C. Valor Actual Neto del Proyecto (Enterprise Value)
$$EV = \sum_{t=1}^n \frac{FCFF_t}{(1 + WACC)^t} + \frac{TV_n}{(1 + WACC)^n}$$
$$VAN = EV - I_0$$

### D. Ratios de Cobertura de Deuda Bancaria (Covenants de Project Finance)
$$\text{DSCR (Debt Service Coverage Ratio)} = \frac{CFADS_t}{\text{Servicio de la Deuda}_t (\text{Principal} + \text{Intereses})} \ge 1.30\text{x}$$
- Si $\text{DSCR} < 1.20\text{x}$, el proyecto incurre en riesgo de default técnico ante los bancos acreedores.

---

## 4. Boxes Visuales e Interactivos Asociados
1. `box_layout_industrial` (CANVAS): Editor y visor modular de la distribución física de la planta con flujos limpios/sucios.
2. `box_capex_csi_table` (TABLE): Resumen de presupuesto de inversión de obra y maquinaria.
3. `box_capex_csi_table_16div` (TABLE): Catálogo maestro de conceptos desglosado en las 16 divisiones MasterFormat CSI.
4. `box_tornado_sensibilidad` (FORMULA): Evaluador de impacto unidimensional en el VAN.
5. `box_tornado_chart` (FORMULA): Diagrama Tornado jerarquizado multivariable.
6. `box_montecarlo_sim` (FORMULA): Simulador estocástico con 10,000 corridas y percentiles P10, P50 y P90.
7. `box_wacc_van_tir` (FORMULA): Valuación financiera integral.

---

## 5. Bibliografía y Citas Clave
- **Gogerty, N., & Rocha, L.** *The Nature of Value: Achieving High Performance and Sustainability*. Columbia University Press, 2014.
- **Behrens, W., & Hawranek, P. M.** *Manual for the Preparation of Industrial Feasibility Studies*. United Nations Industrial Development Organization (UNIDO / ONUDI), Vienna, 1991.
- **Construction Specifications Institute (CSI).** *MasterFormat 16 Divisions Standard Specification System*. Alexandria, VA.
- **Pinson, Linda.** *Anatomy of a Business Plan: Financial Statements & Capital Budgeting*. 7th Edition, 2008.
