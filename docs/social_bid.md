# Metodología 2: Marco Lógico BID / Inversión Social (`social_bid`)

## 1. Identidad del Método
- **Nombre Oficial:** Metodología de Marco Lógico (MML) y Gestión de Proyectos para Resultados (PM4R - BID).
- **Origen Bibliográfico Principal:**
  - *Manual de Metodología del Marco Lógico para la Planificación, el Seguimiento y la Evaluación de Proyectos y Programas* (ILPES/CEPAL & Banco Interamericano de Desarrollo - BID).
  - *The Nature of Value: Achieving High Performance and Sustainability* (Ch. 5 - Social Discount Rate).
  - *Plan de Negocios y Evaluación Social* (Manual de Panamá, p. 18).
- **Propósito:** Diseñar, planificar, ejecutar y evaluar proyectos de desarrollo social, sostenibilidad ambiental y cooperación internacional con rigurosidad cuantitativa de impacto y trazabilidad causa-efecto.
- **Público Objetivo:** Organizaciones no gubernamentales (ONGs), organismos multilaterales (BID, Banco Mundial, CAF, PNUD), fundaciones filantrópicas y dependencias públicas.

---

## 2. Estructura de Pilares y Módulos
El framework `social_bid` consta de **4 Pilares de Desarrollo** y **16 Módulos**:

### Pilar 1: Análisis de Situación e Involucrados
1. `involucrados`: Matriz de partes interesadas clasificadas por Poder vs. Interés (Aliados, Oponentes, Neutros, Beneficiarios directos/indirectos).
2. `arbol_problemas`: Diagrama jerárquico causa-efecto identificando el problema central, causas directas/indirectas y efectos terminales.
3. `arbol_objetivos`: Conversión del árbol de problemas a estados positivos (medios-fines), definiendo el propósito central y fines de desarrollo.
4. `alternativas`: Matriz de selección de alternativas de intervención social evaluando viabilidad financiera, política, técnica y ambiental.

### Pilar 2: Matriz de Marco Lógico (MML 4×4)
5. `fin_proposito`: Definición del Fin (impacto de largo plazo al que contribuye el proyecto) y Propósito (resultado directo y cambio conductual logrado).
6. `componentes`: Bienes y servicios tangibles entregados por el proyecto (obras, capacitaciones, infraestructuras, subsidios).
7. `actividades`: Tareas operativas indispensables para producir cada componente, con asignación de recursos y tiempos.
8. `monitoreo`: Indicadores Objetivamente Verificables (IOV) a nivel de Fin, Propósito, Componentes y Actividades, bajo criterio SMART.

### Pilar 3: Plan de Ejecución y Gestión de Riesgos
9. `gobernanza`: Estructura del comité directivo, roles institucionales y mecanismos de rendición de cuentas (accountability).
10. `edt`: Estructura de Desglose de Trabajo (WBS / EDT) de 3 niveles con paquetes de trabajo verificables.
11. `riesgos`: Matriz de supuestos críticos y riesgos operacionales, climáticos y políticos con planes de mitigación.
12. `comunicaciones`: Matriz de comunicación institucional, socialización comunitaria y canales de consulta libre e informada.

### Pilar 4: Presupuesto y Evaluación Socioeconómica
13. `presupuesto_detallado`: Presupuesto plurianual desglosado por componente, actividad e insumo (fuente BID vs. contrapartida local).
14. `evaluacion_exante`: Análisis costo-beneficio social y costo-efectividad para justificar la rentabilidad social frente al escenario contrafactual.
15. `evaluacion_social_cuantitativa`: Determinación cuantitativa de la Tasa Interna de Retorno Social (TIRS) y Valor Presente Neto Social (VPNS).
16. `sostenibilidad`: Plan de financiamiento post-proyecto, apropiación comunitaria y transferencia operativa a largo plazo.

---

## 3. Fórmulas y Modelos Cuantitativos Obligatorios

### A. Tasa de Descuento Social y VPN Social
$$VPNS = \sum_{t=0}^n \frac{B_t - C_t}{(1 + r_s)^t}$$
- $B_t$: Beneficios sociales monetizados en el año $t$ (ahorro en salud pública, reducción de mortalidad, incremento en ingresos netos de familias beneficiadas, valor del tiempo ahorrado).
- $C_t$: Costos económicos y sociales totales de inversión y operación (corregidos mediante Factores de Corrección de Precios Sombra / Precios Cuenta).
- $r_s$: Tasa de Descuento Social oficial dictada por el organismo convocante (BID: $8.0\% - 12.0\%$; SHCP México: $10.0\%$).
- Regla de Aprobación: $VPNS > 0$ y $TIRS \ge r_s$.

### B. Ratio Costo-Efectividad (RCE)
$$\text{RCE} = \frac{\text{Costo Social Total Actualizado (CSTA)}}{\text{Unidades de Impacto Físico No Monetizable}}$$
- Ejemplo: Costo en USD por niño desnutrido recuperado, o costo en USD por hectárea de manglar restaurada con éxito.

### C. Factor de Conversión a Precios Sombra (Mano de Obra No Calificada)
$$W_{\text{sombra}} = W_{\text{mercado}} \cdot \alpha_L$$
- $\alpha_L$: Factor de ajuste por desempleo o subempleo regional (típicamente $0.60 - 0.75$ en zonas rurales de América Latina).

---

## 4. Boxes Visuales e Interactivos Asociados
1. `box_arbol_problemas_mml` (MATRIX): Diagrama visual interactivo de jerarquías de problemas y fines.
2. `box_matriz_interes_poder` (MATRIX): Mapa de actores estratégicos en cuadrantes 2x2.
3. `box_tir_vpn_social_bid` (FORMULA): Calculadora interactiva de viabilidad socioeconómica con tasa de descuento social.
4. `box_zopp_mpp_4x4` (MATRIX): Matriz de Marco Lógico con columnas de Indicadores, Medios y Supuestos.

---

## 5. Bibliografía y Citas Clave
- **Ortegón, E., Pacheco, J. F., & Prieto, A.** *Metodología del marco lógico para la planificación, el seguimiento y la evaluación de proyectos y programas*. Serie Manuales N° 42, CEPAL / ILPES, 2005.
- **Banco Interamericano de Desarrollo (BID).** *Gestión de proyectos para resultados (PM4R): Guía de aprendizaje*. BID, Washington D.C., 2018.
- **The Nature of Value.** *Quantifying Externalities and the Social Cost of Capital*. Ch. 5, p. 92.
- **Manual de Plan de Negocios de Panamá.** *Evaluación Social y Comunitaria de Emprendimientos*. p. 18.
