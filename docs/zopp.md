# Metodología 7: Planificación de Proyectos Orientada a Objetivos (`zopp`)

## 1. Identidad del Método
- **Nombre Oficial:** Zielorientierte Projektplanung (ZOPP) — Planificación de Proyectos Orientada a Objetivos.
- **Origen Bibliográfico Principal:**
  - *Manual ZOPP: Una Introducción al Método de Planificación de Proyectos Orientada a Objetivos* (Deutsche Gesellschaft für Technische Zusammenarbeit - GTZ GmbH, Eschborn).
  - *Metodología del Marco Lógico y Planificación Participativa* (CEPAL / GTZ).
- **Propósito:** Proporcionar un procedimiento participativo, visual y sistemático para consensuar, formular y monitorear proyectos de desarrollo mediante talleres colaborativos de múltiples partes interesadas, asegurando congruencia lógica entre problemas detectados y actividades financiadas.
- **Público Objetivo:** Agencias de cooperación técnica bilateral (GIZ, KfW, AECID, JICA), ministerios de planificación del desarrollo, gobiernos subnacionales y consorcios público-privados.

---

## 2. Estructura de Pilares y Módulos
El framework `zopp` consta de **4 Pilares Metodológicos** y **8 Módulos**:

### Pilar 1: Análisis de la Situación y Consenso Participativo
1. `participacion`: Matriz de análisis de grupos de interés, beneficiarios, oponentes y aliados, detallando intereses, motivos y recursos de poder.
2. `problemas`: Árbol de problemas participativo (técnica de tarjetas de moderación metaplan) ordenado en causas directas/indirectas y efectos colaterales.
3. `objetivos`: Árbol de objetivos construido como imagen positiva del árbol de problemas, estableciendo medios y fines terminales.
4. `analisis_alternativas_zopp`: Matriz multicriterio de evaluación de alternativas de proyecto para decidir la estrategia de intervención más viable y de mayor impacto costo-beneficio.

### Pilar 2: La Matriz de Planificación del Proyecto (MPP 4×4)
5. `matriz_logica`: Matriz central de Planificación del Proyecto (MPP) de 16 cuadrantes: Objetivos Superiores, Objetivo del Proyecto, Resultados esperados y Actividades, cruzados con Indicadores Objetivamente Verificables (IOV), Fuentes de Verificación e Hipótesis/Supuestos Críticos.

### Pilar 3: Planificación de Actividades y Recursos
6. `planificacion_actividades_cronograma`: Estructura de Desglose de Trabajo (EDT) y cronograma de Gantt de actividades con asignación de personal responsable e hitos de control.
7. `presupuesto_componentes`: Presupuesto matricial desglosado por componentes, actividades y rubros de gasto (personal local/internacional, equipamiento, operación y contingencias).

### Pilar 4: Seguimiento, Evaluación Ex-Post y Sostenibilidad
8. `evaluacion_expost`: Criterios de evaluación ex-post bajo los 5 estándares de la OCDE/CAD: Pertinencia, Eficacia, Eficiencia, Impacto y Sostenibilidad técnica/institucional a largo plazo.

---

## 3. Fórmulas y Modelos Cuantitativos Obligatorios

### A. Matriz de Planificación del Proyecto (MPP ZOPP 4×4)
| Nivel de Intervención | Resumen Narrativo | Indicadores (IOV) | Fuentes de Verificación | Supuestos Importantes |
|---|---|---|---|---|
| **Objetivo Superior** | Contribución del proyecto al desarrollo sectorial | Indicadores de impacto sectorial a largo plazo | Censos, estadísticas oficiales, reportes sectoriales | Sostenibilidad de políticas macroeconómicas |
| **Objetivo del Proyecto** | Efecto directo logrado por la utilización de los resultados | Indicadores de efecto directo (tiempo, cantidad, calidad) | Encuestas a beneficiarios, auditorías de campo | Mantenimiento de la demanda y cooperación interinstitucional |
| **Resultados / Componentes** | Bienes y servicios tangibles producidos por el proyecto | Metas físicas terminadas por hito | Actas de entrega-recepción, certificados técnicos | Disponibilidad oportuna de fondos de contrapartida |
| **Actividades** | Acciones necesarias para lograr cada resultado | Presupuesto y cronograma financiero por actividad | Registros contables, facturas, contratos de obra | Estabilidad de precios e insumos |

### B. Matriz de Ponderación Multicriterio de Alternativas
$$\text{Puntuación de Alternativa } j = \sum_{i=1}^m w_i \cdot s_{ij}$$
- $w_i$: Ponderación relativa del criterio $i$ ($\sum w_i = 1.0$). Criterios estándar: Costo total ($25\%$), Viabilidad técnica ($20\%$), Impacto ambiental ($20\%$), Aceptación social comunitaria ($20\%$), Tiempo de implementación ($15\%$).
- $s_{ij}$: Calificación de la alternativa $j$ en el criterio $i$ (escala 1 a 5).

---

## 4. Boxes Visuales e Interactivos Asociados
1. `box_zopp_mpp_4x4` (MATRIX): Matriz oficial ZOPP interactiva de 4x4.
2. `box_matriz_alternativas_zopp` (MATRIX): Matriz de selección de alternativas con ponderación multicriterio.
3. `box_gantt_actividades_zopp` (CANVAS): Cronograma interactivo de actividades y ruta de hitos.
4. `box_presupuesto_componentes` (TABLE): Tabla presupuestaria por componentes y rubros operativos.
5. `box_evaluacion_expost_lista` (CHECKLIST): Auditoría de sostenibilidad según los 5 criterios CAD/OCDE.

---

## 5. Bibliografía y Citas Clave
- **Deutsche Gesellschaft für Technische Zusammenarbeit (GTZ) GmbH.** *ZOPP: An Introduction to the Method*. Eschborn, Alemania, 1991.
- **GTZ.** *Project Cycle Management and the Objectives-Oriented Project Planning (ZOPP) Method: Guidelines for Project Officers*. Eschborn, 1997.
- **OCDE / CAD.** *Criterios de Evaluación para la Asistencia al Desarrollo: Pertinencia, Eficacia, Eficiencia, Impacto y Sostenibilidad*. París, 2002.
