# ATDD MASTER — Acceptance Test-Driven Development
**Proyecto:** Open Business Plan  
**Criterios de Aceptación Funcionales y QA**  

---

## 1. Criterios de Aceptación por Módulo

### Módulo: Motor Agéntico ReAct y Visor DeepSeek Harness
* **AC-01 (Prioridad Minimax-M3):** Al ejecutar la generación o industrialización, el sistema debe consultar en primer lugar `minimax-m3:cloud` (vía Ollama Cloud o API directa) para evitar agotamientos tempranos de cuotas.
* **AC-02 (Ejecución de Herramientas en Vivo):** Los agentes deben invocar herramientas contextuales (`tool_web_search`, `tool_financial_engine`, `tool_quantum_diagnostic`, etc.) devolviendo datos verídicos antes de la redacción ejecutiva.
* **AC-03 (Visor de Trayectorias DeepSeek Harness):** El usuario debe poder hacer clic en "🔍 Trayectoria" en cualquier módulo y visualizar el árbol DAG interactivo con pasos, duraciones, argumentos JSON y métricas.
* **AC-04 (Detección de 429 y Fast Failover):** Cuando cualquier proveedor retorne HTTP 429, el sistema conmuta inmediatamente sin demoras innecesarias hacia el siguiente proveedor de la jerarquía.
* **AC-05 (Exportación de Trazas):** El visor debe permitir copiar y descargar la trayectoria en formato JSON estándar compatible con DeepSeek Harness v1.0.

---

## 2. Criterios de Calidad de Salida Académica
* **AC-06 (JSON Válido y Estructurado):** Todo módulo redactado por IA debe cumplir con el schema JSON de campos específicos definidos en el framework del proyecto, sin texto residual ni etiquetas `<think>`.
* **AC-07 (Diagnóstico Cuántico Obligatorio):** Todo plan debe incorporar el análisis atómico de las 3 áreas del fundador (Finanzas, Operaciones, Administración) conforme a la metodología de Fondo Thoth AC (Regla 13).
* **AC-08 (Cero Alucinaciones en Investigación Externa):** Las herramientas de búsqueda (`tool_web_search`, `tool_machinery_search`, `tool_supplier_search`) deben recopilar fuentes reales verificadas. Queda estrictamente prohibida la inserción de cotizaciones, precios de benchmark o competidores fabricados cuando las APIs externas no devuelvan resultados; en su lugar, deben reportar honestamente `provenance: 'none'` con lista vacía.
* **AC-09 (Gobernanza de Cuotas y Control Reactivo Fila 1/2):** Al alcanzar los límites mensuales de Fila 1 (Brave 2,000 req/mes o Tavily 1,000 req/mes), el motor debe auto-pausar la tarea y presentar en `TerminalDrawer` las opciones para autorizar Fila 2 de pago o conmutar de inmediato a DuckDuckGo sin interrumpir el flujo del usuario.

---

## 3. Criterios de Aceptación: Autenticación, Sesiones y Seguridad
* **AC-10 (Cookie Segura HttpOnly `obp_auth_token`):** Al autenticarse exitosamente, el servidor debe emitir la cookie `obp_auth_token` configurada con `HttpOnly: true`, `SameSite: 'lax'` y `Secure` en producción. La respuesta JSON de login jamás debe exponer el JWT en el cuerpo de respuesta.
* **AC-11 (Comportamiento de Recordarme):**
  * Con `Recordarme` desactivado: la cookie de sesión no debe tener `maxAge` ni fecha de expiración fija, eliminándose al cerrar la ventana o sesión del navegador.
  * Con `Recordarme` activado: la cookie debe configurarse con un `maxAge` estricto de 30 días (`2,592,000,000 ms`).
* **AC-12 (Purga de Tokens Heredados y CSRF):** Al validar sesión, el frontend debe purgar proactivamente cualquier clave de token residual en `localStorage` (`openplan_token`). Toda mutación HTTP hacia endpoints administrativos y de proyectos debe validar origen legítimo para mitigar ataques CSRF.

---

## 4. Criterios de Aceptación: RBAC y Control de Acceso
* **AC-13 (Restricción de Rol Revisor):** Los usuarios con rol `revisor` pueden consultar proyectos, navegar módulos, visualizar diagnósticos y descargar exportaciones (DOCX/PDF). Se les bloquea el guardado de datos, edición de campos, cambios de configuración y aprobación de proyectos.
* **AC-14 (Capacidades de Superadmin sin Suplantación):** El `superadmin` puede acceder a proyectos ajenos para auditoría, edición, exportación y archivado, manteniendo visible en la interfaz un banner superior de supervisión que indica claramente el propietario original sin alterar la auditoría de autoría.
* **AC-15 (Exclusividad de Comercio Cuántico TR):** El acceso al submódulo avanzado de Comercio Cuántico TR permanece estrictamente restringido al rol `superadmin`. Cualquier petición por roles `user` o `revisor` debe responder con HTTP 403 Forbidden.

---

## 5. Criterios de Aceptación: Gobernanza de Proyectos y Ciclo Editorial
* **AC-16 (Estados Editoriales y Avance Independiente):** El porcentaje de avance (0–100%) se calcula en función de los campos y módulos completados, de forma totalmente desacoplada del estado editorial del documento (`Borrador`, `En revisión`, `Aprobado`, `Archivado`).
* **AC-17 (Reversión Automática de Proyectos Aprobados):** Si un proyecto en estado `Aprobado` recibe una modificación en cualquiera de sus módulos, el sistema debe transicionarlo automáticamente a `En revisión`, registrando el evento en el log de auditoría.
* **AC-18 (Continuación Asistida de Incompletos):** La vista de gestión de proyectos debe diagnosticar los módulos incompletos y proveer una acción de "Continuar" que dirija de inmediato al primer módulo pendiente sin requerir navegación manual.

---

## 6. Criterios de Aceptación: Dossier Ejecutivo Canónico y Exportaciones VCV
* **AC-19 (Límite Estricto de 20 a 25 Páginas):** El dossier ejecutivo generado debe tener una extensión objetivo de exactamente 20 páginas (y nunca exceder 25 páginas), en orientación vertical Letter estándar (`612 x 792 pts`), sin saltos de página huérfanos ni páginas en blanco.
* **AC-20 (Diferenciación Financiera VCV):** El tablero de dirección y el resumen financiero deben exhibir de forma separada y explícitamente etiquetada:
  * Inversión Fase 1: `$4,000,000 MXN` (Arranque taller piloto regional).
  * Escenario Total de Expansión / Serie A: `$16,800,000 MXN` (Planta TIF, USDA/FSIS).
* **AC-21 (Cifras Financieras Canónicas VCV):** Las métricas canónicas deben reflejar fielmente:
  * Ventas proyectadas Año 5: `$59,961,600 MXN`.
  * Utilidad Neta Año 5: `$12,711,885 MXN`.
  * Margen Bruto: `31.13%` (separado del Markup de `45.24%`).
  * Punto de Equilibrio: `781.87 kg/mes`.
  * TIR: `38.4%`, VPN: `$6,850,000 MXN`, B/C: `1.45`.
* **AC-22 (Paridad Canónica entre Vista Previa, DOCX y PDF):** Los tres canales de salida deben provenir del mismo modelo canónico de datos, garantizando paridad exacta de cifras, redacción y tablas consolidadas de 5 años (reservando la corrida de 60 meses para el Documento Maestro).

---

## 7. Criterios de Aceptación: Auditoría Persistente
* **AC-23 (Inmutabilidad y Trazabilidad):** Toda acción administrativa (creación de usuario, cambio de rol, cambio de contraseña, modificación de proyecto, exportación) debe ser registrada de forma síncrona en `server/data/audit_log.json` con timestamp ISO, ID de usuario, IP, acción y detalles.
