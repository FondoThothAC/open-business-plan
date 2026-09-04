# Decisiones Arquitectónicas — Saneamiento y Endurecimiento de Open Business Plan (Fase 0)

Este documento formaliza las decisiones tomadas durante la fase de alineación arquitectónica y la sesión `/grill-me` para el saneamiento, consistencia financiera y endurecimiento de Open Business Plan.

---

## 1. Identificador de Proyecto Canónico Único
- **Decisión:** El `projectId` oficial y canónico para el proyecto es `comercio_cu_ntico_internacional_tr_sapi_de_cv`.
- **Justificación:** Corresponde a la versión moderna y activa de la plataforma. La variante antigua con caracteres alternos permanece archivada en entornos legados sin afectación en el desarrollo activo.

---

## 2. Unificación del Diagnóstico Cuántico
- **Decisión:** Se consolida una única función exportada `runQuantumDiagnostic` en `src/lib/quantumDiagnostic.js`.
- **Implementación:** 
  - Se elimina la función heurística redundante e incompleta de `src/lib/agentTools.js` (líneas 11-49).
  - La función unificada acepta `{ aiConfig, semillaData, rawText, areas, teamSize }` y orquesta de forma inteligente el diagnóstico profundo vía IA (`callAiProvider`), con fallback automático a la evaluación heurística determinista si el proveedor de IA no está disponible o falla.
  - El manifiesto de herramientas agénticas (`tool_quantum_diagnostic`) apunta a esta implementación única y consolidada.

---

## 3. Rebranding Técnico: Harness
- **Decisión:** Se completa la transición técnica de `DeepSeek Harness` a `Harness`.
- **Especificación de Versión:**
  - `harnessVersion` oficial pasa a ser `'harness-v0.1'`.
  - Se implementa un shim de compatibilidad en lectura para procesar sin errores trayectorias históricas registradas bajo la versión `'dsh-session-v0.1'`.
  - La denominación en la interfaz de usuario se estandariza a "Harness / Trajectory", preservando intactas las referencias a modelos como DeepSeek V3/R1.

---

## 4. Resolución de CAPEX e Inversión Canónica (`resolveCanonicalCapex`)
- **Decisión:** Implementar la resolución canónica de inversión priorizando estrictamente la semilla del proyecto.
- **Jerarquía de Búsqueda:**
  1. `seed.inversion_esperada` (formato numérico o string monetario canónico).
  2. `seed.finanzas?.inversion_inicial`.
  3. Suma monetaria desglosada en `planData.organizacion.inversion` (`inversion_fija + inversion_diferida + opex_inicial`).
  4. `planData.organizacion.inversion.monto_inversion`.
- **Modos de Operación:**
  - **Modo Estricto (`OBP_STRICT_FINANCIALS=1`):** Lanza una excepción de tipo `INVERSION_CANONICA_NO_ENCONTRADA` para detener la propagación de datos corruptos si no existe inversión declarada.
  - **Modo Permisivo / Desarrollo:** Emite una advertencia formal de auditoría y registra una bandera de revisión requerida sin colapsar la interfaz.

---

## 5. Prevención de Corrupción por Concurrencia y Versionado
- **Decisión:** El guardado en `server/index.js` implementa versionado inmutable y control de concurrencia.
- **Mecanismos:**
  - Guardado con hash SHA-1 en `proyectos/<type>/<id>/.versions/<timestamp>-<hash>.json` bajo política FIFO de 20 versiones.
  - Bloqueo de concurrencia (Mutex) en memoria por `projectId` durante la ejecución del orquestador ReAct para evitar colisiones entre sesiones paralelas.
  - Validación de integridad: Si una petición entrante reduce drásticamente el número de módulos poblados respecto a la versión previa, el servidor responde con HTTP 409 requiriendo confirmación forzada.
