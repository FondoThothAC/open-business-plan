# Metodología 3: Lean Startup y Validación Ágil (`agile_startup`)

## 1. Identidad del Método
- **Nombre Oficial:** Metodología Lean Startup & Validación Ágil de Hipótesis.
- **Origen Bibliográfico Principal:**
  - *The Lean Startup: How Today's Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses* (Eric Ries).
  - *Burn the Business Plan: What Great Entrepreneurs Really Do* (Carl J. Schramm).
  - *Diferenças entre MVP e Protótipo: Um Estudo Prático de Validação* (Referencia técnica de experimentación).
- **Propósito:** Reducir radicalmente el desperdicio de capital y tiempo mediante ciclos acelerados de Crear-Medir-Aprender (Build-Measure-Learn), validando sistemáticamente las hipótesis de valor y crecimiento con clientes reales antes de escalar.
- **Público Objetivo:** Startups tecnológicas, spin-offs corporativas, aceleradoras e incubadoras de empresas innovadoras.

---

## 2. Estructura de Pilares y Módulos
El framework `agile_startup` consta de **4 Pilares Ágiles** y **11 Módulos**:

### Pilar 1: Validación Temprana del Problema-Solución
1. `canvas`: Lean Canvas interactivo de Ash Maurya (9 bloques centrados en problema, early adopters, propuesta de valor única, solución y canales).
2. `buyer_persona`: Definición arquetípica del cliente ideal (dolores profundos, motivaciones, trabajos a realizar y alternativas existentes).

### Pilar 2: Experimento y Diseño de MVP
3. `mvp_design`: Tipología de Producto Mínimo Viable (Concierge, Wizard of Oz, Landing Page con humo / Fake Door, Prototipo de baja fidelidad) y arquitectura de funcionalidades esenciales.
4. `critical_hypotheses`: Formulación rigurosa de las dos hipótesis nucleares: Hipótesis de Valor (¿el cliente experimenta valor?) e Hipótesis de Crecimiento (¿cómo descubren el producto nuevos usuarios?).
5. `experimentos_tdd`: Protocolo científico de experimentación Lean TDD (Hipótesis H1, Hipótesis nula H0, criterio cuantitativo de falsación, tamaño muestral mínimo y duración del test en días).

### Pilar 3: Aprendizaje Validado y Contabilidad de la Innovación
6. `pilot_results`: Métricas del piloto con usuarios reales (tasas de conversión, retención de cohortes, tiempo de permanencia, retroalimentación cualitativa).
7. `pivot_persevere`: Junta de decisión formal basada en evidencia empírica: Pivotar (Zoom-in, Zoom-out, Segmento de clientes, Canal, Modelo de ingresos) o Perseverar en la trayectoria actual.
8. `innovation_accounting`: Sistema de tres niveles de Contabilidad de Innovación: Definición de métricas de referencia (Baseline), optimización de motor de crecimiento y cálculo de punto de inflexión.

### Pilar 4: Finanzas Ágiles y Supervivencia
9. `unit_economics`: Ecuación unitaria de escalabilidad: CAC, LTV, Margen de Contribución por usuario, Payback Period (meses para recuperar el CAC $\le 12$ meses).
10. `burn_rate`: Consumo neto mensual de efectivo (Net Burn Rate), flujo de ingresos incipientes y Runway disponible en meses.
11. `simulador`: Simulador dinámico de supervivencia de pista financiera con escenarios de financiamiento y activación de Kill Switch.

---

## 3. Fórmulas y Modelos Cuantitativos Obligatorios

### A. Runway de Supervivencia y Burn Rate
$$\text{Net Burn Rate} = \text{Gastos Operativos Mensuales (OPEX)} - \text{Cobranza de Ingresos Netos}$$
$$\text{Runway (Meses de Pista)} = \frac{\text{Efectivo Disponible en Banco}}{\text{Net Burn Rate}}$$
- **Umbral de Alerta Temprana:** Si $\text{Runway} \le 6 \text{ meses}$, debe iniciarse inmediatamente la ronda de financiamiento o ejecutarse el recorte operativo de emergencia.
- **Kill Switch:** Si $\text{Runway} \le 2 \text{ meses}$ sin compromiso vinculante de inversión, se activa el cierre ordenado para liquidar pasivos.

### B. Protocolo de Experimento Científico (Test-Driven Development Lean)
$$\text{Condición de Falsación (Reject } H_1): \text{ Conversión Observada } < \text{ Umbral Mínimo Ex-Ante } (\alpha = 0.05)$$
- Ejemplo: $H_1$: "Al menos el $12\%$ de los 500 visitantes de la landing page pre-ordenarán el servicio pagando un depósito de \$500 MXN en un plazo de 14 días". Si la conversión observada es $< 12\%$, la hipótesis queda oficialmente falsada y se rechaza la construcción del software.

### C. Motores de Crecimiento (Engines of Growth)
1. **Motor Pegajoso (Sticky Engine):** $\text{Tasa de Pérdida (Churn)} < \text{Tasa de Nuevos Clientes (Compounding)}$. Meta: Churn mensual $\le 2\%$.
2. **Motor Viral:** Coeficiente Viral $K = i \cdot c > 1.0$, donde $i$ es el número de invitaciones enviadas por usuario activo y $c$ es la tasa de conversión de cada invitación.
3. **Motor Pagado:** $\text{LTV} - \text{CAC} > 0$ con Payback $\le 12 \text{ meses}$.

---

## 4. Boxes Visuales e Interactivos Asociados
1. `box_lean_canvas` (CANVAS): Lienzo Lean Canvas de Ash Maurya.
2. `box_mvp_protocol` (CHECKLIST): Protocolo de validación de MVP.
3. `box_burn_runway` (BENCHMARK): Tablero de control de Burn Rate y meses de pista.
4. `box_innovation_accounting_3metrics` (BENCHMARK): Panel de cohortes y métricas de contabilidad de innovación.
5. `box_experimento_lean_tdd` (CHECKLIST): Matriz de diseño de experimentos con falsación cuantitativa.

---

## 5. Bibliografía y Citas Clave
- **Ries, Eric.** *The Lean Startup: How Today's Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses*. Crown Business, 2011.
- **Schramm, Carl J.** *Burn the Business Plan: What Great Entrepreneurs Really Do*. Simon & Schuster, 2018.
- **Maurya, Ash.** *Running Lean: Iterate from Plan A to a Plan That Works*. O'Reilly Media, 2012.
- **Diferenças entre MVP e Protótipo.** *Guia Prático de Engenharia de Requisitos Ágeis*. 2021.
