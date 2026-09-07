# Metodología 9: Despliegue de Políticas Hoshin Kanri (`hoshin_kanri`)

## 1. Identidad del Método
- **Nombre Oficial:** Metodología Hoshin Kanri (Despliegue de Directrices y Brújula de Gestión) & Matriz X.
- **Origen Bibliográfico Principal:**
  - *Hoshin Kanri: Policy Deployment for Successful TQM* (Yoji Akao).
  - *Toyota Way Fieldbook* (Jeffrey Liker & David Meier - Despliegue Estratégico y Nemawashi).
  - *Creating a Business Plan For Dummies* (Hoshin Kanri & Policy Alignment Edition).
  - *The Lean Startup* (Eric Ries - Ch. 9: Resolución Estructurada de Problemas A3).
- **Propósito:** Alinear verticalmente la visión estratégica de la alta dirección ("Norte Verdadero") con la ejecución operativa de todos los equipos en el piso de trabajo (Gemba), mediante la negociación bidireccional continua (Catchball), la resolución científica de problemas (Plantilla A3) y el control de mejora continua (PDCA / Bowler).
- **Público Objetivo:** Organizaciones industriales de manufactura esbelta (Lean Manufacturing), corporativos en transformación ágil, empresas de servicios de alta calidad y directores de mejora continua.

---

## 2. Estructura de Pilares y Módulos
El framework `hoshin_kanri` consta de **4 Pilares de Despliegue** y **8 Módulos**:

### Pilar 1: Filosofía y Norte Verdadero (True North)
1. `norte_verdadero`: Definición del Norte Verdadero (True North), propósito superior trascendente, visión a largo plazo (3-5 años) e imperativos éticos incuestionables.
2. `disrupcion`: Diagnóstico de brechas estratégicas de supervivencia frente a cambios tecnológicos o del mercado (análisis de la realidad actual vs. estado ideal).

### Pilar 2: Matriz X Hoshin y Negociación Catchball
3. `matriz_x`: Construcción interactiva de la Matriz X de 4 cuadrantes interconectados:
   - **Sur:** Objetivos Estratégicos a 3-5 años.
   - **Oeste:** Objetivos Anuales Tácticos (1 año).
   - **Norte:** Prioridades / Proyectos de Mejora Clave (Hoshins).
   - **Este:** Métricas e Indicadores de Rendimiento (KPIs con semáforo).
   - **Esquinas:** Matriz de Correlaciones y Responsabilidad (Dueños de Proyecto).
4. `catchball_nemawashi`: Protocolo formal de negociación bidireccional (Catchball) y rondas de consulta previa para generar consenso orgánico (Nemawashi) entre directores y líderes operativos.

### Pilar 3: Despliegue Operativo A3 y Ciclo PDCA
5. `a3_deployment`: Elaboración de informes de gestión estratégica A3 en 7 secciones estandarizadas (Título/Tema, Contexto, Condición Actual, Meta Cuantitativa, Análisis Causa-Raíz 5 Porqués, Plan de Acción y Contramedidas, Estandarización y Seguimiento).
6. `pdca_hoshin`: Monitoreo del ciclo Plan-Do-Check-Act (Planificar, Ejecutar, Verificar, Actuar) con reuniones mensuales y trimestrales de revisión en el Gemba.

### Pilar 4: Alineación de OKRs y Tablero Bowler
7. `okrs_alineados`: Cascada de Objetivos y Resultados Clave (OKRs) desplegados por departamento, garantizando que cada resultado clave responda a una prioridad de la Matriz X.
8. `seguimiento`: Cuadro de mando tipo "Bowler" mensual con código de colores semafórico (Verde, Amarillo, Rojo) y plan inmediato de contramedidas cuando se desvía una meta.

---

## 3. Fórmulas y Modelos Cuantitativos Obligatorios

### A. Correlaciones en la Matriz X
La Matriz X vincula los 4 cuadrantes mediante símbolos de correlación ponderada:
- $\bullet$ **Correlación Fuerte (Puntuación 9):** El proyecto impacta de manera directa y determinante en el objetivo anual o métrica.
- $\circ$ **Correlación Moderada (Puntuación 3):** El proyecto contribuye de forma indirecta o secundaria.
- $\triangle$ **Correlación Débil (Puntuación 1):** Impacto circunstancial o condicionado.
$$\text{Índice de Alineación del Proyecto } k = \sum_{j} C_{jk} \cdot W_j$$

### B. Protocolo de Negociación Catchball
1. **Lanzamiento de la Pelota:** La dirección propone el borrador de metas anuales con fundamentación estratégica.
2. **Recepción y Análisis:** Los líderes de equipo examinan la viabilidad operativa y la capacidad real de recursos instalados.
3. **Devolución de la Pelota:** Los líderes devuelven contrapropuestas sustentadas, solicitando ajustes de alcance o asignación de recursos específicos.
4. **Pacto Vinculante:** Ambas partes firman la meta acordada con compromiso incondicional de apoyo y seguimiento mensual.

---

## 4. Boxes Visuales e Interactivos Asociados
1. `box_matriz_x_hoshin` (MATRIX): Matriz X de 4 cuadrantes con selector interactivo de correlaciones y responsables.
2. `box_catchball_nemawashi` (CHECKLIST): Protocolo de verificación de rondas de consenso y negociación Catchball.
3. `box_a3_template_lean` (CANVAS): Lienzo interactivo estructurado de reporte estratégico A3.
4. `box_pdca_ciclo_hoshin` (CHECKLIST): Auditoría de cierre de contramedidas en el ciclo PDCA.
5. `box_okr_scorecard` (BENCHMARK): Tablero mensual Bowler con semáforo para OKRs departamentales.

---

## 5. Bibliografía y Citas Clave
- **Akao, Yoji.** *Hoshin Kanri: Policy Deployment for Successful TQM*. Productivity Press, Cambridge, MA, 1991.
- **Liker, Jeffrey K., & Meier, David.** *The Toyota Way Fieldbook: A Practical Guide for Implementing Toyota's 4Ps*. McGraw-Hill, 2006.
- **Ries, Eric.** *The Lean Startup*. Crown Business, 2011 (Ch. 9: A3 Problem Solving).
- **Colwell, Ken.** *Starting a Business QuickStart Guide*. 2019 (Ch. 7: OKRs & Performance Bowlers).
