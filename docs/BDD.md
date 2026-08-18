# Behavior-Driven Development (BDD) - Open Business Plan v2.7

## 1. Introducción
Este documento define las historias de usuario y criterios de aceptación en formato Gherkin (Dado / Cuando / Entonces) para las funcionalidades clave del sistema.

---

## 2. Escenarios de Comportamiento

### Característica 1: Control de Cambios y Diff Interactivo en Vista Previa

#### Escenario 1.1: Revisión y Aprobación de Sugerencia de IA
- **Dado** que el usuario se encuentra en la Vista Previa de un plan de negocio
- **Y** tiene comentarios redactados en el campo "Propuesta de Valor"
- **Cuando** presiona el botón "Re-escribir con IA"
- **Entonces** el sistema genera una nueva propuesta basada en sus comentarios
- **Y** despliega el modal de control de cambios (`DiffReviewModal`) mostrando el texto original y las diferencias resaltadas
- **Cuando** el usuario hace clic en "Aceptar y Aplicar Cambio"
- **Entonces** el plan se actualiza con la nueva versión y los comentarios atendidos se archivan automáticamente.

#### Escenario 1.2: Descarte de Sugerencia no deseada
- **Dado** que la IA generó una versión en el `DiffReviewModal`
- **Cuando** el usuario presiona "Descartar Sugerencia"
- **Entonces** el modal se cierra sin modificar el contenido original del plan y los comentarios permanecen disponibles para futuras revisiones.

#### Escenario 1.3: Iteración y Ajuste de Instrucciones
- **Dado** que el usuario observa el diff en el `DiffReviewModal` pero desea ajustar el tono
- **Cuando** escribe una instrucción adicional (ej. "Hacerlo más formal y para inversionistas B2B") y pulsa "Re-generar"
- **Entonces** el agente de IA recalibra la respuesta y actualiza la vista diff en tiempo real.

---

### Característica 2: Visualización de Metodologías Especializadas

#### Escenario 2.1: Renderizado de Árbol de Problemas (Social BID / ZOPP)
- **Dado** un proyecto configurado bajo la metodología `social_bid` o `zopp`
- **Cuando** el usuario navega al módulo de "Árbol de Problemas"
- **Entonces** el sistema renderiza el componente `ArbolProblemasObjetivos` dividiendo claramente las causas raíz, el problema central y los efectos finales tanto en tarjetas interactivas como en diagrama gráfico.

#### Escenario 2.2: Visualización de Matriz X (Hoshin Kanri)
- **Dado** un proyecto configurado bajo la metodología `hoshin_kanri`
- **Cuando** el usuario visualiza el plan estratégico
- **Entonces** el componente `XMatrixHoshinKanri` presenta los 4 cuadrantes alineados (Largo Plazo, Metas Anuales, Proyectos de Mejora, Métricas/Responsables) con sus matrices de correlación.

#### Escenario 2.3: Visualización de Estructura de Células (Amoeba Management)
- **Dado** un proyecto con metodología `amoeba_management`
- **Cuando** se accede a la estructura organizativa
- **Entonces** el componente `AmoebaStructureViewer` muestra las células autónomas, sus precios de transferencia internos y el indicador de valor añadido por hora de trabajo.
