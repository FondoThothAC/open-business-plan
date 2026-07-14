# Documento de Diseño de Software (SDD)
## Refinamiento de Campos por IA & Multi-Metodología por Proyecto

Este documento describe la arquitectura (SDD), los escenarios de comportamiento (BDD) y el plan de pruebas (TDD) para la implementación de las siguientes características:
1. **Multi-metodología por Proyecto:** Permitir la co-existencia de múltiples metodologías activas en el mismo proyecto y poder alternar entre ellas desde un selector en la barra lateral.
2. **Refinamiento de Secciones en Vista Previa con IA:** Agregar una interfaz interactiva de comentarios en cada módulo de la Vista Previa para regenerar o refactorizar campos específicos mediante IA con feedback directo.

---

## 1. SDD (Software Design Document)

### 1.1 Estructura del Estado (`planData.config`)
Se introduce la propiedad `activeMethodologies` en el objeto de configuración del plan para almacenar un arreglo de metodologías (frameworks) activas:
```json
{
  "config": {
    "projectType": "business",
    "activeMethodologies": ["business", "agile_startup"],
    ...
  }
}
```

### 1.2 Flujo de Datos para la Barra Lateral (`Layout.jsx`)
* Al cargar un proyecto, si `activeMethodologies` no existe o está vacío, se inicializa por defecto como `[projectType]`.
* Si `activeMethodologies.length > 1`, se muestra un selector desplegable premium arriba de "Pilares Académicos" en la barra lateral.
* Al cambiar la selección en el desplegable, se actualiza el `projectType` del proyecto activo. Esto actualiza de forma reactiva la navegación lateral, los módulos mostrados y los cálculos financieros correspondientes sin alterar los datos ya guardados de otros frameworks.

### 1.3 Selector en Configuración (`Configuracion.jsx`)
* Se reemplaza el control de selección única de metodología por un grupo de selección múltiple (Checkboxes/Chips interactivos).
* Al activar o desactivar una metodología en el listado, se actualiza el arreglo `activeMethodologies`.
* El `projectType` activo actual siempre se mantendrá dentro de la lista de metodologías activas. Si se desmarca la actual, se auto-selecciona la primera de la lista restante.

### 1.4 Refinamiento de Secciones en Vista Previa (`VistaPrevia.jsx`)
* En cada tarjeta de módulo de la vista previa, se añade un panel colapsable o inline `"no-print"` (oculto al exportar a PDF).
* El usuario podrá:
  1. Seleccionar qué campo específico del módulo desea refinar (o "Generar completo").
  2. Escribir un comentario de retroalimentación (instrucciones para la IA).
  3. Hacer clic en "Regenerar Sección".
* **Lógica del Cliente:**
  - Invoca la función `refactorFieldWithComments(config, { fieldLabel, currentValue, comments: [{ text: userFeedback }], planData })` de `src/lib/ai.js`.
  - Actualiza el estado mediante `updateSection(pillarKey, moduleKey, fieldKey, newValue)`.
  - Invoca `manualSaveProject()` para persistir el cambio en disco inmediatamente.

---

## 2. BDD (Behavior-Driven Development)

### Escenario 1: Alternar entre metodologías activas
* **Dado** que tengo un proyecto con metodologías "Plan de Negocios Comercial" y "Agile Startup" activadas.
* **Cuando** selecciono "Agile Startup" en el selector de la barra lateral.
* **Entonces** la barra lateral se actualiza para mostrar los pilares "Validación y Lienzo", "Diseño de Experimentos", "Tracción y Aprendizaje" y "Finanzas Ágiles".
* **Y** los datos de mi modelo de negocio comercial siguen seguros e intactos.

### Escenario 2: Refinar un campo vacío en la Vista Previa
* **Dado** que el campo "Tecnológico" de la sección PESTEL no tiene contenido redactado.
* **Cuando** abro el panel de refinamiento en PESTEL, elijo el campo "Tecnológico", escribo: *"Redacta normativas de IA para el sector de salud"* y hago clic en "Regenerar Sección".
* **Entonces** el sistema muestra un indicador de carga.
* **Y** la IA genera el texto alineado con el contexto de la Semilla y la solicitud.
* **Entonces** el campo "Tecnológico" se actualiza con el nuevo contenido en la vista previa y se guarda automáticamente en el proyecto.

---

## 3. TDD (Test-Driven Development)

### 3.1 Pruebas Unitarias del Estado (`PlanContext.test.js`)
* **Test 1:** `createEmptyPlan` debe definir `activeMethodologies` inicializado con el `projectType` por defecto.
* **Test 2:** Cambiar `activeMethodologies` no debe alterar las llaves de datos preexistentes del plan.

### 3.2 Pruebas de Integración de IA (`ai_refinement.test.js`)
* **Test 3:** Verificar que al llamar a `refactorFieldWithComments` con una retroalimentación específica, la respuesta contenga los términos solicitados en formato Markdown válido.
