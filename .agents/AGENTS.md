# Reglas de Desarrollo del Proyecto (Open Business Plan)

Para todos los proyectos y tareas en este espacio de trabajo, el agente de IA Antigravity y cualquier colaborador deben adherirse estrictamente a las siguientes metodologías de desarrollo:

## 1. TDD (Test-Driven Development)
- **Regla:** Escribir primero las pruebas unitarias antes de implementar cualquier código de lógica de negocio, módulos de cálculo financiero o utilidades de integración.
- **Acción:** Cada cambio en componentes financieros (`calculadoraFinanciera.js`, simuladores) o lógica central de sincronización debe contar con un test en la carpeta de pruebas correspondiente.

## 2. BDD (Behavior-Driven Development)
- **Regla:** Describir y estructurar los requerimientos en base al comportamiento esperado del usuario mediante escenarios (ej. Dado/Cuando/Entonces).
- **Acción:** Documentar los casos de uso principales en la documentación del anteproyecto antes de redactar código.

## 3. ATDD (Acceptance Test-Driven Development)
- **Regla:** Definir los criterios de aceptación y pruebas de integración antes de declarar terminada una tarea.
- **Acción:** Verificar que las interfaces y flujos de usuario cumplan exactamente con los objetivos de negocio descritos en el anteproyecto.

## 4. SDD (Software Design Document)
- **Regla:** Para cualquier cambio complejo, refactorización o adición de nuevos módulos, se debe generar primero un Documento de Diseño de Software (SDD) y obtener la aprobación del usuario antes de proceder a la ejecución.
- **Acción:** Mantener los documentos de diseño actualizados en la carpeta `docs/architecture/`.

## 5. DDD (Domain-Driven Design)
- **Regla:** Modelar la lógica de negocio basándose en el lenguaje y las entidades del dominio de planes de negocio (Pilar, Módulo, Campo, Semilla, Plantilla).
- **Acción:** Mantener la lógica matemática y de negocio (ej. cálculos de viabilidad, simulador de Montecarlo) desacoplada de los componentes visuales de React.

## 6. MDD (Model-Driven Development)
- **Regla:** Trabajar sobre definiciones y esquemas de datos consistentes (como `FRAMEWORKS` en `src/config/frameworks.js`).
- **Acción:** Cada módulo debe mapear fielmente a los modelos definidos, evitando el uso de campos ad-hoc o propiedades inconsistentes en el estado.

## 7. IDD (Interface-Driven Development)
- **Regla:** Definir primero las interfaces de componentes y los contratos de APIs antes de codificar la lógica del backend o del cliente.
- **Acción:** Validar la compatibilidad de firmas de métodos, contextos de React y llamadas fetch de manera prioritaria.

## 8. ADD (Architecture-Driven Design)
- **Regla:** Seguir el diseño arquitectónico establecido para la sincronización de datos con el servidor y la inyección de IA en la generación de módulos.
- **Acción:** No eludir el flujo centralizado de estado provisto por `PlanContext.jsx`.

## 9. EDD (Event-Driven Development)
- **Regla:** Utilizar comunicación por eventos (como Server-Sent Events / SSE y listeners de cambio) para actualizaciones de tareas de larga duración (ej. Industrialización con IA o web scraping).
- **Acción:** Asegurar que los feeds de progreso muestren logs de ejecución de manera asíncrona y fluida en la consola del cliente.

## 10. CDD (Component-Driven Development)
- **Regla:** Diseñar componentes de interfaz de usuario modulares, reutilizables y atómicos.
- **Acción:** Crear los componentes del sistema de diseño (paneles, sliders, campos de entrada) en aislamiento y usarlos congruentemente en todo el proyecto.

## 11. PDD (Process-Driven Development)
- **Regla:** Guiar los flujos de la aplicación por el progreso estructurado del usuario, respetando los pasos académicos establecidos en la metodología.
- **Acción:** Asegurar que las barras de progreso globales y los indicadores visuales guíen adecuadamente los hitos del anteproyecto a la visualización.

## 12. UXDD (UX-Driven Development)
- **Regla:** Dar prioridad a la fluidez, la estética visual premium (modos oscuros consistentes, transiciones suaves) y el feedback del estado de la aplicación.
- **Acción:** Evitar interfaces congeladas o bloqueadas; mostrar siempre barras de carga, estados de error limpios y paneles de consola informativos cuando haya procesos pesados en background.

## 13. Empresas Cuánticas (Fondo Thoth AC — Metodología Propietaria)
- **Regla:** Todo plan de negocios generado por la aplicación debe evaluar el perfil del emprendedor/fundador a través del Modelo Atómico de 3 Áreas: **Finanzas**, **Operativo** y **Administrativo**.
- **Principio Nuclear:** El fundador solo puede ser experto o participar activamente en 1 o máximo 2 de las 3 áreas. Involucrarse en las 3 simultáneamente "fusiona el átomo" y genera disfunción organizacional (micromanagement, sesgo en decisiones, cuellos de botella operativos).
- **Principio de Delegación:** Las áreas donde el fundador es débil DEBEN ser delegadas a perfiles profesionales complementarios. El sistema debe generar recomendaciones de delegación concretas (perfil de puesto, habilidades requeridas, rango salarial, descripción para vacancy/LinkedIn).
- **Principio Cuántico de Escala:** Los cambios de escala de un negocio no son lineales — son saltos cuánticos (de 1 empleado a 5, de 5 a 20, de local a multi-sucursal). Cada salto requiere reestructuración de las 3 áreas atómicas. El sistema debe alertar sobre los umbrales de cambio cuántico.
- **Principio de Independencia del Fundador:** La meta última de todo plan es que el negocio pueda funcionar SIN el fundador. El plan debe evaluar y documentar la dependencia actual del fundador y proponer una ruta de autonomía operativa.
- **Principio de Medición Continua:** Todo se mide y mejora. KPIs cuánticos deben rastrear la salud de cada área atómica y disparar alertas cuando una métrica cruza un umbral crítico.
- **Anti-patrones a detectar:**
  - El emprendedor "solo quiere ser jefe" (no operará, no delegará correctamente).
  - El emprendedor "solo quiere invertir y no hacer nada" (ausencia operativa total).
  - El emprendedor "quiere dinero rápido" (expectativas de ROI irreales, cortoplacismo).
  - El emprendedor "hace todo él mismo" (fusión atómica — no delega nada).
- **Acción:** Integrar la evaluación cuántica del perfil del fundador en la Semilla (inicio) y generar un Diagnóstico Cuántico como capa transversal durante la generación de módulos, con recomendaciones de delegación inyectadas en los módulos de Organización, Finanzas y Operaciones.
