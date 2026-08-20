# DDD MASTER — Domain-Driven Design
**Proyecto:** Open Business Plan (Fondo Thoth AC)  

---

## 1. Lenguaje Ubicuo (Ubiquitous Language)

* **Plan de Negocios (Agregado Raíz):** Estructura viva que consolida la Semilla, la Configuración, los Pilares Académicos y los Módulos de Formulación.
* **Semilla (Entity):** Núcleo inicial de la idea de negocio estructurado en problema, solución, propuesta de valor, mercado objetivo y perfil del fundador.
* **Pilar (Bounded Context):** Agrupación conceptual de alto nivel (Estudio de Mercado, Ingeniería de Proyecto, Presupuesto CAPEX, Estructura de Capital, Riesgo Matemático).
* **Módulo (Entity):** Unidad atómica de redacción y cálculo (ej. Demanda, FODA, Balance General, TIR, Flujo de Efectivo).
* **Mesa de Expertos (Domain Service):** Orquestador multi-agente que ejecuta roles especializados (Estratega, Crítico, Financiero, Operaciones, Redactor).
* **Átomo de 3 Áreas (Value Object - Metodología Cuántica):** Tríada fundamental compuesta por Finanzas, Operaciones y Administración.
* **Fusión Atómica (Anti-patrón):** Anomalía donde el fundador concentra las 3 áreas simultáneamente, exigiendo plan de delegación obligatorio.

---

## 2. Modelo de Agregados y Bounded Contexts

```mermaid
classDiagram
    class PlanNegocios {
        +String id
        +Semilla semilla
        +Configuracion config
        +Map modulos
        +calcularViabilidad()
        +generarConMesaExpertos()
    }
    class Semilla {
        +Negocio negocio
        +Fundador fundador
        +PerfilCuantico perfil
    }
    class Modulo {
        +String key
        +String title
        +Map fields
        +Boolean locked
    }
    class KeyPool {
        +List keys
        +getRotatedKey()
    }
    class AIProviderCascade {
        +callWithFallback()
    }

    PlanNegocios *-- Semilla
    PlanNegocios *-- Modulo
    PlanNegocios --> AIProviderCascade
    AIProviderCascade --> KeyPool
```
