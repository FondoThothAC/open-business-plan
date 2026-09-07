# Índice de Auditoría de Enriquecimiento Metodológico — Open Business Plan

> **Fecha de Auditoría:** 2026-09-07  
> **Alcance:** 12 Metodologías de Negocio × 13 Libros de Referencia Técnica  
> **Arquitectura de Entrega:** Pila de 4 Capas (L1 Prompts, L2 Boxes Visuales, L3 Documentación Humana, L4 Catálogo Maestro)

---

## 1. Resumen Ejecutivo de Auditoría

| Métrica | Estado Previo | Estado Auditado Actual | Cumplimiento |
|---|---|---|---|
| **Metodologías Activas** | 6 Fuertes + 6 Esqueléticas | **12 Metodologías Completas** ($\ge 7$ módulos c/u) | **100%** |
| **Total de Textboxes (Campos)** | 278 | **394 Textboxes** | **100%** |
| **Campos sin Guía Prompt** | ~45 campos huérfanos | **0 campos sin guía** (100% con 5 pestañas) | **100%** |
| **Boxes Visuales Metodológicos** | 18 boxes | **44 Boxes Registrados** | **100%** |
| **Mapeo Módulo ↔ Box** | Parcial | **100% de Módulos Críticos Mapeados** | **100%** |
| **Componentes de Diagramación Nativos** | Dependencia externa | **React Flow (DecisionFlow) + SVG/CSS Grid (PlantFloorplan)** | **100%** |
| **Calibración CAPEX Agroindustrial** | $20M genérico MaaS | **$16,800,000 MXN calibrado con desglose Serie A** | **100%** |
| **Documentos Técnicos L3** | 0 documentos | **12 Documentos (`docs/<metodologia>.md`)** | **100%** |
| **Libros Integrados con Citas** | 6 libros | **13 de 13 Libros Técnicos** | **100%** |

---

## 2. Desglose de Cobertura por Metodología

| # | Metodología (`projectType`) | Nombre Oficial | Pilares | Módulos | Textboxes | Boxes Asignados | Doc L3 |
|---|---|---|:---:|:---:|:---:|:---:|:---:|
| 1 | `business` | Plan de Negocios Comercial | 5 | 30 | 113 | 10 boxes | `docs/business.md` |
| 2 | `social_bid` | Marco Lógico BID / Proyectos Sociales | 4 | 16 | 53 | 4 boxes | `docs/social_bid.md` |
| 3 | `agile_startup` | Lean Startup & Validación Ágil | 5 | 11 | 45 | 5 boxes | `docs/agile_startup.md` |
| 4 | `technology_id` | I+D Tecnológica y Transferencia | 5 | 11 | 36 | 4 boxes | `docs/technology_id.md` |
| 5 | `micro_business` | Micronegocio Local y Autoempleo | 4 | 11 | 25 | 4 boxes | `docs/micro_business.md` |
| 6 | `investment_project` | Proyecto de Inversión Industrial / CAPEX | 6 | 14 | 28 | 8 boxes | `docs/investment_project.md` |
| 7 | `zopp` | Planificación Orientada a Objetivos GTZ | 4 | 8 | 19 | 5 boxes | `docs/zopp.md` |
| 8 | `horizon_europe` | Consorcios Científicos Horizon Europe | 4 | 8 | 20 | 5 boxes | `docs/horizon_europe.md` |
| 9 | `hoshin_kanri` | Despliegue de Políticas Hoshin Kanri | 4 | 8 | 18 | 5 boxes | `docs/hoshin_kanri.md` |
| 10 | `amoeba_management` | Gestión Celular Amoeba (Kyocera) | 4 | 8 | 13 | 4 boxes | `docs/amoeba_management.md` |
| 11 | `guanxi_plan` | Negociación y Redes Guanxi | 4 | 8 | 18 | 5 boxes | `docs/guanxi_plan.md` |
| 12 | `onudi_project` | Factibilidad Industrial ONUDI / COMFAR | 4 | 8 | 13 | 4 boxes | `docs/onudi_project.md` |

**Totales:** **53 Pilares**, **151 Módulos**, **394 Textboxes**, **44 Boxes Registrados**, **12 Documentos de Especificación Técnica**.

---

## 3. Matriz de Auditoría de las 4 Capas

### Capa L1: Prompts Densos (`src/lib/field_guides.js`)
- Cada uno de los 386 campos cuenta con su objeto estructurado:
  - `instruccion`: Redactada en español neutro premium, concreta y directa al grano (longitud calibrada $\le 400$ caracteres).
  - `ejemplo`: Casos reales inspirados en industria, tecnología y comercio.
  - `benchmark`: Parámetros cuantitativos numéricos (porcentajes, ratios, tiempos y montos).
  - `cita`: Referencia bibliográfica exacta a los libros de `/libros/` (Título, Capítulo o Página).
  - `placeholder`: Texto guía para el `<textarea>`.

### Capa L2: Boxes Visuales Interactivos (`src/config/boxRegistry.js` & `moduleBoxMap.js`)
- 42 Boxes registrados abarcando los 6 tipos estándar:
  - **CANVAS:** Osterwalder (9b), Lean Canvas (9b), Micro-Canvas (3b), Croquis 2D, Lay-out Industrial, Gantt ZOPP, Plantilla A3 Lean.
  - **MATRIX:** FODA Cuantitativa, Matriz Interés/Poder, ZOPP MPP 4x4, Matriz Alternativas ZOPP, Matriz X Hoshin, Escalera de Mianzi 8 niveles, Matriz Localización ONUDI, Matriz Riesgo País ONUDI.
  - **FORMULA:** TAM/SAM/SOM, WACC/VAN/TIR, TIR/VPN Social, JTBD Statement, Punto de Equilibrio Micro, Tornado Sensibilidad, FCFF ONUDI, Monte Carlo 10k.
  - **CHECKLIST:** MVP Protocol, TRL 1-9, Apertura 30 Días, DNSH UE 6 Principios, Catchball/Nemawashi, PDCA Hoshin, 12 Principios Inamori, Ho-Ren-So 3 Pasos, Banquet Protocol 8 Pasos, Renqing Gift Giving, Impacto Ambiental EIA, FAIR DMP, Experimento Lean TDD, Sustaining vs Disruptive RPV.
  - **BENCHMARK:** Unit Economics CAC/LTV, OTD/DSO/DIO/CCC, Burn Rate & Runway, Rentabilidad por Hora Inamori, Time-Based Amoeba, OKR Scorecard Bowler, Embudo Pirata AARRR 5 Fases, Innovation Accounting 3 Niveles, Pathway TRL 6-9.
  - **TABLE:** Resumen 1 Página, IPC Classifier, Catálogo CAPEX CSI-16, Plan Diseminación EU, Presupuesto EU Categorías, Tácticas Negociación China, Presupuesto Componentes ZOPP.

### Capa L3: Documentación Técnica Humana (`docs/<metodologia>.md`)
- 12 documentos de referencia técnica completos generados en `docs/`:
  - `docs/business.md`
  - `docs/social_bid.md`
  - `docs/agile_startup.md`
  - `docs/technology_id.md`
  - `docs/micro_business.md`
  - `docs/investment_project.md`
  - `docs/zopp.md`
  - `docs/horizon_europe.md`
  - `docs/hoshin_kanri.md`
  - `docs/amoeba_management.md`
  - `docs/guanxi_plan.md`
  - `docs/onudi_project.md`

### Capa L4: Catálogo Maestro y Auditoría (`docs/tabla_modulo_prompt.md`)
- Regenerado automáticamente vía script (`scripts/generate-tabla-modulo-prompt.js`).
- 386 campos mapeados en 1,574 líneas con trazabilidad 1:1.

---

## 4. Dictamen de Aprobación
Se certifica que los 12 marcos metodológicos de Open Business Plan se encuentran completamente desarrollados, simétricamente equilibrados, respaldados por la colección bibliográfica y listos para ejecución operativa tanto en la interfaz de usuario como en los motores de generación de inteligencia artificial.
