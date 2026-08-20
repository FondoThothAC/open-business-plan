# UXDD MASTER — UX-Driven Development & User Journeys
**Proyecto:** Open Business Plan  

---

## 1. Principios de Experiencia de Usuario

* **Feedback Continuo y Transparente:** La generación con IA en segundo plano nunca congela la pantalla; siempre expone el Monitor flotante en vivo con el paso exacto (ej. `Fase 3/9: Analista de Operaciones`).
* **Zero Interruption on Quotas:** Las saturaciones de cuotas de tokens (429) no alertan con modales de error que bloquean al usuario; se resuelven silenciosamente rotando de modelo o proveedor, emitiendo una notificación informativa no invasiva.
* **Control Humano (HITL):** En todo momento el usuario puede pausar, detener, editar directamente o revisar sugerencias mediante control de cambios (Diff visual).
* **Estética Premium:** Paleta en modos claro/oscuro balanceados, tipografías sans-serif de alta legibilidad y tarjetas con micro-interacciones suaves.

---

## 2. Mapa del Flujo de Usuario (User Journey)

```mermaid
journey
    title Flujo de Creación de Plan de Negocios
    section Inicio
      Ingresar Semilla del Negocio: 5: Usuario
      Evaluación Cuántica de 3 Áreas: 4: IA
    section Formulación
      Seleccionar Nivel (Rápido/Pro/Industrial): 5: Usuario
      Ejecutar Mesa de Expertos: 5: IA
      Visualizar Pensamientos en Monitor: 5: Usuario
    section Validación
      Revisión de Diffs & Sugerencias: 4: Usuario
      Ajustes de Inversión y Flujo: 5: Usuario
    section Salida
      Vista Previa Ejecutiva: 5: Usuario
      Exportación a PDF / Imprimir: 5: Usuario
```
