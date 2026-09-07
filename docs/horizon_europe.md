# Metodología 8: Consorcios Científicos Horizon Europe (`horizon_europe`)

## 1. Identidad del Método
- **Nombre Oficial:** Marco de Propuestas de Investigación e Innovación Horizon Europe (Pilar II: Desafíos Globales y Competitividad Industrial).
- **Origen Bibliográfico Principal:**
  - *The Role of Corporate Sustainability in Asian and European Development* (Cap. 4 - EU Innovation Frameworks & DNSH).
  - *European Commission: Horizon Europe Programme Guide & Proposal Templates (RIA / IA)*.
  - *The FAIR Data Principles: Findable, Accessible, Interoperable, Reusable* (Wilkinson et al.).
- **Propósito:** Estructurar propuestas científicas y consorcios transnacionales altamente competitivos para convocatorias de la Comisión Europea (Research and Innovation Actions - RIA e Innovation Actions - IA), cumpliendo con los tres criterios oficiales de evaluación: **Excelencia**, **Impacto** y **Calidad y Eficiencia de la Implementación**, así como con las directivas transversales de Ciencia Abierta y Sostenibilidad Ambiental.
- **Público Objetivo:** Universidades, centros de investigación europeos e internacionales, PYMEs innovadoras, corporaciones multinacionales y gestores de proyectos de I+D comunitarios.

---

## 2. Estructura de Pilares y Módulos
El framework `horizon_europe` consta de **4 Pilares Comunitarios** y **8 Módulos**:

### Pilar 1: Consorcio Transnacional y Gobernanza
1. `consorcio`: Composición del consorcio paneuropeo (mínimo 3 entidades legales independientes de 3 Estados Miembros o Países Asociados de la UE), roles (Coordinador, Socios Académicos, PYMEs, Industria), complementariedad y estructura de gobernanza (General Assembly, Steering Committee, WPLs).
2. `ciencia_abierta`: Estrategia obligatoria de Open Science (acceso abierto inmediato a publicaciones científicas revisadas por pares bajo licencias CC-BY, ciencia ciudadana y prácticas de reproducibilidad).

### Pilar 2: Principio DNSH y Sostenibilidad Ambiental
3. `dnsh_principle`: Evaluación estricta de cumplimiento del principio "Do No Significant Harm" (DNSH) frente a los 6 objetivos medioambientales del Reglamento de Taxonomía de la UE (Mitigación del cambio climático, Adaptación al cambio climático, Uso sostenible del agua, Transición a la economía circular, Prevención de la contaminación y Protección de la biodiversidad).

### Pilar 3: Vías de Impacto (Impact Pathway) y Escalamiento TRL
4. `impacto`: Resultados esperados a corto plazo (Outputs), efectos a medio plazo (Outcomes) e impactos socioeconómicos y científicos a largo plazo (Impacts), alineados al Programa de Trabajo de la UE y a las Políticas de la Comisión (Green Deal / Digital Decade).
5. `impacto_pathway_trl`: Hoja de ruta de escalamiento tecnológico desde TRL 6 (demostración en entorno relevante) hasta TRL 8-9 (cualificación en sistema real y lanzamiento comercial), definiendo KPIs de maduración industrial.
6. `gestion_datos_fair_dmp`: Plan de Gestión de Datos (Data Management Plan - DMP) conforme a los principios FAIR (Encontrables, Accesibles, Interoperables y Reutilizables) con curaduría en repositorios certificados (ej. Zenodo).

### Pilar 4: Explotación, Diseminación y Presupuesto Comunitario
7. `diseminacion_explotacion`: Matriz de medidas de difusión científica, planes de explotación comercial de los resultados generados (Foreground IP, patentes conjuntas, licencias) y comunicación pública.
8. `presupuesto_eu_microsoft`: Desglose financiero según las categorías oficiales de coste elegible de la UE (Costes de personal en meses-persona / PMs, subcontratación, costes directos de compra, costes indirectos con tarifa plana del 25% y tasa de cofinanciación al 100% o 70%).

---

## 3. Fórmulas y Modelos Cuantitativos Obligatorios

### A. Cálculo del Presupuesto Horizon Europe
$$\text{Costes Directos Elegibles (CDE)} = \text{Personal (PMs} \cdot \text{Tarifa Horaria)} + \text{Subcontratación} + \text{Compras (Viajes, Equipos, Fungibles)}$$
$$\text{Costes Indirectos (Overheads 25\%)} = 0.25 \cdot (\text{CDE} - \text{Subcontratación} - \text{Costes Internamente Facturados})$$
$$\text{Coste Total Elegible} = \text{CDE} + \text{Costes Indirectos}$$
$$\text{Contribución Financiera Máxima de la UE} = \text{Coste Total Elegible} \cdot \text{Tasa de Financiación (100\% en RIA; 70\% en IA para empresas con fines de lucro)}$$

### B. Matriz de Cumplimiento DNSH (Do No Significant Harm)
| Objetivo Medioambiental de la Taxonomía UE | Evaluación de Impacto del Proyecto | Medida Obligatoria de Mitigación / Cumplimiento |
|---|---|---|
| **1. Mitigación del Cambio Climático** | Emisiones de GEI directas e indirectas | Empleo de energías 100% renovables y diseño de procesos de baja huella de carbono |
| **2. Adaptación al Cambio Climático** | Resiliencia física ante eventos climáticos extremos | Análisis de riesgos climáticos según proyecciones IPCC |
| **3. Uso Sostenible de Recursos Hídricos** | Consumo y calidad del agua en procesos | Circuitos cerrados de recirculación y tratamiento biológico de efluentes |
| **4. Economía Circular y Residuos** | Generación de residuos y uso de materias primas | Ecodiseño, tasa de reciclabilidad de subproductos $\ge 85\%$ |
| **5. Prevención de la Contaminación** | Emisión de contaminantes a aire, agua o suelo | Cero emisiones de sustancias químicas peligrosas (cumplimiento REACH) |
| **6. Protección de la Biodiversidad** | Impacto en ecosistemas y hábitats sensibles | Prohibición de actividades en zonas protegidas Red Natura 2000 |

---

## 4. Boxes Visuales e Interactivos Asociados
1. `box_dnsh_ue_6` (CHECKLIST): Lista de verificación oficial de los 6 principios ambientales DNSH.
2. `box_impacto_pathway_trl6_9` (CHECKLIST): Hoja de ruta de escalamiento y madurez tecnológica TRL 6 a 9.
3. `box_dmp_fair_checklist` (CHECKLIST): Auditoría del Plan de Gestión de Datos bajo principios FAIR.
4. `box_plan_diseminacion_eu` (TABLE): Matriz estructurada de difusión y explotación por grupo de interés.
5. `box_presupuesto_eu_categorias` (TABLE): Desglose presupuestario por partidas y cálculo de la subvención comunitaria.

---

## 5. Bibliografía y Citas Clave
- **European Commission.** *Horizon Europe (HORIZON): Work Programme 2023-2024 / General Annexes*. Bruselas, 2023.
- **European Commission.** *Commission Notice: Technical guidance on the application of "do no significant harm" under the Recovery and Resilience Facility Regulation*. 2021/C 58/01.
- **The Role of Corporate Sustainability in Asian Development.** *EU Horizon & Transnational Research Compliance*. pp. 76-118.
- **Wilkinson, M. D., et al.** *The FAIR Guiding Principles for scientific data management and stewardship*. Scientific Data 3, 160018, 2016.
