# Metodologías de Desarrollo — Open Business Plan v2.5.12.x
> Guía de referencia en español para el equipo de desarrollo.  
> Cada metodología se explica con su aplicación **concreta** dentro de este proyecto.

---

## 🧠 Mesa de Expertos — Arquitectura Multi-Agente

El motor de IA de Open Business Plan no usa un solo modelo: usa **múltiples agentes especializados** que debaten y sintetizan en cadena, similar a cómo trabaja un equipo de consultores de negocio.

### Niveles de Profundidad

| Nivel | Nombre | Agentes | Tiempo estimado | Uso |
|---|---|---|---|---|
| ⚡ **1** | Rápido | Analista → Redactor | ~30-60s | Borradores iniciales |
| 🧠 **2** | Pro | Analista → Crítico → Redactor | ~2-4 min | **DEFAULT** |
| 🔬 **3** | Profundo | Estratega → Analista → Devil's Advocate → Crítico → Redactor | ~8-15 min | Secciones críticas |

### Roles de Agentes

```
Estratega      → Define el marco y los ejes estratégicos clave
Analista       → Desarrolla contenido basado en datos del plan
Devil's Advocate → Detecta supuestos débiles y contraargumenta
Crítico Financiero → Valida viabilidad económica y coherencia
Redactor Senior → Sintetiza todo con tono ejecutivo y académico
```

### Swap de Modelos (Model Hot-Swap)

Cuando los modelos no caben todos en VRAM al mismo tiempo, Ollama hace **swap automático**:

```
[Fase 1: Analista con qwen2.5:7b]
  → genera borrador → texto guardado en RAM (128GB disponible)
  → Ollama descarga qwen2.5 de VRAM
  → Ollama carga gemma4:e4b en VRAM (~2-4s de swap)
[Fase 2: Crítico con gemma4:e4b]
  → recibe borrador de RAM → genera crítica
  → swap a gemma4:pro para redactor final
[Fase 3: Redactor con gemma4:pro]
  → sintetiza borrador + crítica → resultado final
```

El contexto (texto) **siempre vive en RAM**, no en VRAM. El swap solo mueve los pesos del modelo.

### Capacidad de VRAM — Guía de Selección de Modelos

| Modelo | VRAM aprox. | Fortaleza | Recomendado para |
|---|---|---|---|
| `gemma4:e4b` | ~4.5-8GB | Balance general | DEFAULT: todos los roles |
| `gemma4:pro` | ~8GB | Síntesis y redacción | Redactor Final (nivel 2+) |
| `qwen2.5:7b` | ~4.5GB | Razonamiento numérico | Analista de Datos |
| `phi4:14b` | ~8GB | Matemáticas, finanzas | Crítico Financiero |
| `llama3.1:8b` | ~5GB | Coherencia estructural | Revisor Académico |
| `mistral:7b` | ~4.5GB | Multilingüe | Redactor en varios idiomas |

### Diferencias de Plataforma

**Windows / Linux (GPU dedicada — ej. RTX A2000 12GB):**
- VRAM separada de RAM → swap entre modelos tarda ~2-4s por fase
- Con 128GB RAM: el contexto de 256k no es problema
- Variable de entorno: `OLLAMA_FLASH_ATTENTION=1` activa atención eficiente

**Mac (Apple Silicon — M1/M2/M3/M4):**
- Memoria **unificada** entre CPU y GPU (Metal) → sin swap real
- Un M2 Pro con 32GB puede cargar 2-3 modelos simultáneamente
- Ollama en Mac usa Metal automáticamente, sin configuración extra
- Recomendado: modelos de 3-7B para generación fluida en Mac con 16GB

### Configuración de Modelos por Rol

En **Configuración > Mesa de Expertos** puedes asignar un modelo diferente a cada rol. El sistema respeta tu asignación y hace swap automáticamente entre fases.

---

## TDD — Test-Driven Development (Desarrollo Guiado por Pruebas)

**Concepto**: Escribes la prueba *antes* del código. El ciclo es: 🔴 Rojo → 🟢 Verde → 🔵 Refactorizar.

**En Open Business Plan**: Antes de implementar `estimateMesaCost()`, definimos qué debe devolver con entradas conocidas:
```js
// [TDD] test: estimateMesaCost(32768, 'gemini-1.5-flash') debe retornar costUSD < 0.01
```
**Archivos marcados**: `src/lib/ai.js`, `src/modules/Configuracion.jsx`

---

## BDD — Behavior-Driven Development (Desarrollo Guiado por Comportamiento)

**Concepto**: Se definen *escenarios de usuario* en lenguaje natural (Gherkin) antes de codificar.

**En Open Business Plan**:
```
Escenario: Wizard detecta hardware y recomienda contexto
  Dado que el usuario abre Open Business Plan por primera vez
  Cuando el wizard consulta Ollama en localhost:11434
  Entonces recomienda 128k si la GPU tiene ≥12GB VRAM
  Y guarda la configuración en localStorage
```
**Archivos marcados**: `src/components/SetupWizard.jsx`

---

## SDD — Solution-Driven Development (Desarrollo Guiado por la Solución)

**Concepto**: Se documenta la solución técnica completa *antes* de implementar. El documento de diseño guía el código.

**En Open Business Plan**: El archivo `docs/Operations_Integration_SDD.md` es el artefacto SDD del módulo de operaciones. Define las fórmulas (OTD, CCC, DSO) antes de escribir `ModuloOperaciones.jsx`.

**Archivos marcados**: `docs/Operations_Integration_SDD.md`

---

## DDD — Domain-Driven Design (Diseño Guiado por el Dominio)

**Concepto**: El código refleja el lenguaje del negocio. Los objetos del sistema modelan conceptos reales del dominio.

**En Open Business Plan**, el dominio es:
- **Plan** → objeto raíz (`planData`)
- **Módulo** → unidad de contenido (`{ pillar, moduleKey, fields }`)
- **Semilla** → entrevista fundacional del emprendedor
- **Mesa de Expertos** → proceso de 3 agentes (Analista, Crítico, Redactor)
- **Contexto IA** → ventana de memoria del modelo

**Archivos marcados**: `src/context/PlanContext.jsx`, `src/config/frameworks.js`

---

## FDD — Feature-Driven Development (Desarrollo Guiado por Features)

**Concepto**: El proyecto se organiza en una lista de *features* que se implementan iterativamente.

**En Open Business Plan** — Lista de Features v2.0:
- [x] F01: Mesa de Expertos (3 fases de IA)
- [x] F02: Fallback Inteligente (Ollama → Nube)
- [x] F03: Setup Wizard con detección de hardware
- [x] F04: Monitor de costos por proveedor
- [x] F05: Control de contexto (8k–256k)
- [x] F06: Renderizado Markdown en campos
- [ ] F07: Exportación PDF con branding
- [ ] F08: Integración DENUE/INEGI en vivo
- [ ] F09: Colaboración multi-usuario

---

## ATDD — Acceptance Test-Driven Development

**Concepto**: Los criterios de aceptación del cliente se definen *antes* de codificar. El código pasa cuando cumple esos criterios.

**En Open Business Plan** — Criterios para el módulo de Operaciones:
- ✅ Los KPIs (OTD, DSO, CCC) se recalculan en tiempo real al cambiar inputs
- ✅ El análisis IA se renderiza con Markdown (negritas, listas)  
- ✅ Los valores NaN nunca se muestran al usuario
- ✅ El gauge de Salud Operativa anima suavemente al cargar

---

## EDD — Event-Driven Development (Desarrollo Guiado por Eventos)

**Concepto**: El sistema reacciona a *eventos*, no a llamadas directas. Los componentes son desacoplados.

**En Open Business Plan** — Flujo de eventos React:
```
updateSection(pillar, moduleKey, field, value)
  → PlanContext actualiza planData
    → useEffect en ModuloOperaciones recalcula KPIs
      → Auto-save debounce envía al backend local
```
**Archivos marcados**: `src/context/PlanContext.jsx` (dispatcher central de eventos)

---

## MDD/MDA — Model-Driven Development / Architecture

**Concepto**: Un *modelo* canónico define la estructura del sistema. Todo el código se genera o guía por ese modelo.

**En Open Business Plan**, el modelo maestro es `src/config/frameworks.js`:
```js
// [MDD] Este archivo es el modelo canónico. 
// Cambiar aquí afecta: sidebar, rutas, prompts de IA, estructura del plan.
{ key: 'operativa', title: 'Eficiencia Operativa', fields: [...] }
```
Si agregas un campo aquí, aparece automáticamente en el módulo, en la IA y en la vista previa.

---

## HDD — Hypothesis-Driven Development (Desarrollo Guiado por Hipótesis)

**Concepto**: Cada feature es una *hipótesis* que se valida con datos. Si no mejora la métrica objetivo, se descarta.

**En Open Business Plan** — Hipótesis activas:
| Hipótesis | Métrica | Estado |
|---|---|---|
| Mesa de Expertos genera mejor contenido que 1 sola llamada | Calidad percibida (encuesta) | 🔬 Testing |
| 128k contexto mejora coherencia entre módulos | # de contradicciones entre secciones | 🔬 Testing |
| El wizard reduce el tiempo de configuración inicial | Tiempo hasta primera generación | ✅ Validado |

---

## RDD — README-Driven Development (Desarrollo Guiado por README)

**Concepto**: Documentas el componente en su README *antes* de implementarlo. El README es el contrato de la feature.

**En Open Business Plan** — Ejemplo para `SetupWizard.jsx`:
```markdown
## SetupWizard
Wizard de primera ejecución que detecta hardware y configura el motor de IA.

### Props
- `onComplete(config)` — callback con la configuración elegida

### Comportamiento
1. Si `localStorage.openplan_setup` existe → no aparece
2. Detecta Ollama en localhost:11434
3. Recomienda contexto según VRAM + RAM
4. Guarda en localStorage al completar
```

---

## Convenciones de Comentarios en Código

Los archivos `.jsx` y `.js` del proyecto usan etiquetas de metodología:

```js
// [TDD] Función pura: se puede probar unitariamente sin dependencias
// [BDD] Escenario: Dado X, Cuando Y, Entonces Z
// [DDD] Entidad del dominio: representa un concepto de negocio real
// [FDD] Feature F03: Setup Wizard con detección de hardware
// [EDD] Evento: se dispara cuando el usuario actualiza un campo
// [MDD] Modelo canónico: cambios aquí afectan todo el sistema
// [HDD] Hipótesis: validar que X mejora la métrica Y
// [RDD] Documentado en README antes de implementar
// [SDD] Ver docs/Operations_Integration_SDD.md para diseño completo
```
