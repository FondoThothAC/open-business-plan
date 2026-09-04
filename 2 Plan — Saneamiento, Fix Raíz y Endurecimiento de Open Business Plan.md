# Plan — Saneamiento, Fix Raíz y Endurecimiento de Open Business Plan

## Contexto

El documento PDF generado para el proyecto `comercio_cu_ntico_internacional_tr_sapi_de_cv` (publicado en `fondothoth.com/obp/plan-negocios/vista-previa/...`) presenta **duplicación masiva de módulos** (FODA × 2, Benchmarking × 2, Estructura/RRHH idénticos, Rentabilidad/Simulador 100% idénticos) y **contradicciones financieras graves** (CAPEX $20M vs $150K vs $100K; TIR 0% vs 15% vs 24% vs 360%; VPN -$906M vs +$1.66M; Payback "Nunca" vs 4.1 años; ROI -1,283,730%; Punto de Equilibrio "$∞"; tabla de sueldos toda en $0). El propio PDF activa "Fase Roja / Kill Switch" recomendando cerrar el negocio.

**Causa raíz verificada** (lectura del JSON + logs + código):
1. **No es bug del motor financiero.** `src/lib/agenticEngine.js:394` lee `capex = planData?.organizacion?.inversion?.monto_inversion || seed.finanzas?.inversion_inicial || 150000`. El JSON del proyecto tiene `semilla.inversion_esperada = "20000000"` pero no tiene `monto_inversion` ni `inversion_inicial` → fallback silencioso a $150,000 → propagación de cifras erróneas a TIR/VPN/Payback en todos los módulos downstream.
2. **Los prompts en `src/lib/field_guides.js` (líneas 463-630, 16 campos financieros) nunca dicen a la LLM "toma la inversión inicial declarada en la semilla"** → la IA inventa cifras o cae al fallback.
3. **El endpoint `POST /api/save` (server/index.js:155-198) sobre-escribe sin consolidar** → 5+ sesiones independientes (12:27, 4:20, 5:24, 7:58, 8:02, 8:18) con esquemas de 17, 28, 10, 9 y 7 módulos se apilaron sobre el mismo `projectId`, generando las secciones Pro-Forma fantasma (`mercado_cuantitativo`, `ingenieria_tecnica`, `presupuesto_obra`, `estructura_capital`, `riesgo_matematico`, `simulador_financiero`) que NO existen en `src/config/frameworks.js` pero duplican contenido canónico.
4. **Inconsistencias técnicas colaterales:** dos implementaciones de Diagnóstico Cuántico, confusión `minimax` modelo/proveedor, 5 API keys hardcodeadas en `PlanContext.jsx`, rebranding "DeepSeek Harness" → "Harness" incompleto, 5 versiones obsoletas de `gen_master_*.py`, 4 scripts de export duplicados, conteo de prompts documentado como 266 cuando son 287.

**Restricción crítica del usuario:** `Open-Business-Plan-VPS_OLD_no_tocar/` es la versión desplegada en el VPS de Oracle (1 GB RAM, Hermosillo) y NO se modifica localmente. Todos los cambios se replican después vía `deploy_vps.sh` tras validación local. La fusión de `projectId` es solo dentro de `Open-Business-Plan/`.

**Outcome esperado:** documento del proyecto CC-TR-SAPI con los 28 módulos canónicos sin duplicar, cifras financieras internamente consistentes y ancladas a la semilla, y un sistema que no permita que estos problemas se repitan.

---

## Archivos críticos (rutas absolutas)

| Archivo | Rol | Líneas relevantes |
|---|---|---|
| `Open-Business-Plan/proyectos/negocios/comercio_cu_ntico_internacional_tr_sapi_de_cv/comercio_cu_ntico_internacional_tr_sapi_de_cv.json` | Documento afectado (253 KB) | 1-428 |
| `Open-Business-Plan/proyectos/negocios/comercio_cu_ntico_internacional_tr_sapi_de_cv/comercio_cu_ntico_internacional_tr_sapi_de_cv.md` | Versión MD a regenerar | 1-1507 |
| `Open-Business-Plan/src/config/frameworks.js` | Modelo canónico de los 28 módulos del framework `business` | 2-65 (pilar business) |
| `Open-Business-Plan/src/lib/field_guides.js` | **287 prompts** en `BUSINESS_GUIDES` (líneas 7-806) — 16 prompts financieros a modificar | 463, 470, 477, 484, 491, 498, 505, 512, 519, 526, 533, 589, 596, 603, 610, 617, 624 + síntesis ejecutiva |
| `Open-Business-Plan/src/lib/agenticEngine.js` | Orquestador ReAct; `harnessVersion: 'dsh-session-v0.1'`; fallback capex=150000 | 195, 392-419, 486-490 |
| `Open-Business-Plan/src/lib/agentTools.js` | Herramientas agénticas; Quantum heurístico | 11-49 (heurístico) |
| `Open-Business-Plan/src/lib/quantumDiagnostic.js` | Quantum con IA — implementación canónica a conservar | 15-157 |
| `Open-Business-Plan/server/index.js` | `POST /api/save` sin versionado ni lock | 155-198 |
| `Open-Business-Plan/src/context/PlanContext.jsx` | 5 API keys hardcodeadas como fallback | 46-64 |
| `Open-Business-Plan/src/config/pricing.js` | Confusión `minimax` modelo vs proveedor | 12, 262 |
| `Open-Business-Plan/src/lib/ai.js` | Enrutamiento de modelos y proveedores | 159, 178, 184, 960, 1031, 1099-1103 |
| `Open-Business-Plan/src/hooks/useRiskSimulator.js` | Parseo actual de `semilla.inversion_total` | 72 |
| `Open-Business-Plan/src/components/DualInputSyncHub.jsx` | Input de `inversion_total` desde semilla | 46 |
| `Open-Business-Plan/tests/agenticEngine.test.js` | Test del manifiesto de herramientas | 6 |
| `Open-Business-Plan/.agents/AGENTS.md` | Regla #1 TDD obligatoria | sección 1 |

**NO TOCAR:** `Open-Business-Plan-VPS_OLD_no_tocar/` (es la versión desplegada en producción).

---

## Fases de implementación

### FASE 0 — Decisiones documentadas (sin código)

Crear `Open-Business-Plan/docs/architecture/OBP_SANITATION_DECISIONS.md` con:
- ProjectId canónico único: `comercio_cu_ntico_internacional_tr_sapi_de_cv` (el slug nuevo es el oficial; el slug `comercio_cuantico_internacional_` queda solo en VPS_OLD como referencia histórica).
- Quantum Diagnostic unificado: se conserva `evaluateQuantumProfile` (con IA, en uso real en `Anteproyecto.jsx:147`); el heurístico de `agentTools.js:11-49` se borra y se delega a la versión IA.
- Rebranding "DeepSeek Harness" → "Harness" se completa (no se revierte). `harnessVersion` pasa de `'dsh-session-v0.1'` a `'harness-v0.1'` con shim que acepta ambos en lectura durante 1 release.
- Modo strict para financieros: `resolveCanonicalCapex` lanza error si no hay inversión canónica; opt-in por `OBP_STRICT_FINANCIALS=1`. Por defecto, en modo permisivo, solo warning durante 1 release.

### FASE 1 — Saneamiento del documento CC-TR-SAPI

**Auditoría (read-only):** ejecutar script que cargue el JSON y reporte:
- `n_modulos_canonicos_poblados` (esperado: 28, actual: 14)
- `n_secciones_proforma` (esperado: 0, actual: 6 con `mercado_cuantitativo`, `ingenieria_tecnica`, `presupuesto_obra`, `estructura_capital`, `riesgo_matematico`, `simulador_financiero`)
- `n_duplicados_efectivos` (overlap SHA-1 de las primeras 200 chars entre Pro-Forma y módulos canónicos)
- Snapshot `.bak.json` antes de tocar.

**Migración de Pro-Forma → canónico o descarte (por sección):**
- `mercado_cuantitativo.demanda.demanda_historica` (282 chars, datos sonorenses) → fusionar en `mercado.analisis.demanda` o `mercado.segmentacion.sensibilidad_demanda`.
- `mercado_cuantitativo.demanda.elasticidad` (172 chars) → fusionar en `mercado.analisis.ciclo_vida` o `mercado.segmentacion.sensibilidad_demanda`.
- `mercado_cuantitativo.oferta.proyeccion_oferta` (225 chars) → fusionar en `mercado.competencia` (campo nuevo a crear si no existe en el JSON).
- `presupuesto_obra`, `estructura_capital`, `riesgo_matematico`, `simulador_financiero` (todos con strings vacíos) → **descartar las secciones completas**.
- `ingenieria_tecnica` (3 sub-claves vacías) → descartar.

**Resolver contradicciones:**
- **Geográficas:** canónico "Hermosillo, Sonora — corredor industrial del Noroeste (Grupo México, Fresnillo PLC, Agnico Eagle)". Reescribir Módulos 15 y 19 (que dicen CDMX/Monterrey/Guadalajara) y reescribir el Escenario Base (que dice Sonora pero con texto confuso).
- **Colores corporativos:** canónico = `naturaleza.identidad.imagen` (paleta "azul índigo y dorado"). Módulo 13 debe citar exactamente esa paleta; si no, reescribir.
- **Normas regulatorias:** aplicar regla de `tool_legal_compliance` (agentTools.js:158). Reemplazar NOM-001-SEMARNAT-1996 (derogada) por la vigente según giro; auditar Módulos 16, 18, 21.
- **Fecha de portada "4 de septiembre de 2026":** sobrescribir con fecha del día del saneo en el JSON y corregir el generador de fecha para usar `new Date().toLocaleDateString('es-MX', ...)`.

**Eliminar duplicados detectados en el PDF:**
- FODA duplicado → dejar solo `naturaleza.foda` (canónico del framework).
- Benchmarking duplicado → consolidar en `mercado.benchmarking`.
- Estructura/RRHH idénticos → fusionar `organizacion.estructura` y `organizacion.recursos_humanos`.
- Rentabilidad/Simulador 100% idénticos → eliminar el duplicado, dejar `organizacion.rentabilidad` como canónico.

**Regenerar el `.md**` con la misma función `jsonToMarkdown(planData)` (server/index.js:191) que se invoca al guardar.

**Patrones a reutilizar:** `jsonToMarkdown(planData)` en `server/index.js:191`; el orden de módulos lo define `frameworks.js` (no el JSON).

### FASE 2 — Fix raíz del sistema anti-duplicación

**Versionar guardados** en `server/index.js:155-198`:
- Antes de escribir el JSON final, calcular SHA-1 y guardar en `proyectos/<type>/<id>/.versions/<ISO_DATE>-<hash8>.json`.
- Manifiesto `.versions/index.json` con `{ ts, hash, modules, inversion_total }`.
- Política: si el JSON entrante tiene **menos módulos poblados** que el último guardado estable → HTTP 409 con diff.
- FIFO: máximo 20 versiones por proyecto.

**Detección de arranques abortados:**
- Al iniciar el servidor, escanear `proyectos/<type>/<id>/.partial/`. Si hay `.partial/<sessionId>.json` con `status === 'running'` y timestamp > 30 min → marcar `aborted` y mover a `.versions/aborted-<sessionId>.json`.
- Al reanudar, comparar `lastSuccessfulSave` con `lastModuleUpdate` y ofrecer "Continuar desde módulo X" o "Re-generar módulos faltantes".

**Endpoint `POST /api/projects/:type/:id/rename`** que consolida antes de renombrar: lee el JSON actual, valida que el `projectId` nuevo no exista, hace merge field-by-field manteniendo la versión con mayor longitud de texto (proxy de "más completo") y los timestamps más recientes, mueve el directorio viejo a `proyectos/<type>/.archive/<oldId>-<ISO>/`.

**Lock de generación** por `projectId` en `agenticEngine.js`: mutex en memoria del servidor. Si ya hay una generación activa, devolver `{ success: false, reason: 'busy', currentSessionId }` para que el cliente se enganche al SSE existente.

**Tests TDD primero (regla #1 de AGENTS.md):** `tests/server-save-versioning.test.js`, `tests/server-rename.test.js`, `tests/server-genlock.test.js`.

### FASE 3 — Arreglo de prompts financieros (causa raíz de TIR/VPN)

**Auditar los 16 prompts financieros** en `field_guides.js` (líneas 463-630 + síntesis ejecutiva). Anotar para cada uno si menciona "toma la inversión inicial declarada en la semilla". El agente de exploración confirmó que **ninguno** lo menciona.

**Patrón de reescritura** a aplicar a los 16 campos:
```
"instruccion": "[ANCLAJE A SEMILLA OBLIGATORIO] La inversión inicial canónica es la declarada en `semilla.inversion_esperada` (campo numérico en MXN). NO la inventes. Si el campo no existe, ABSTENERSE y marcar 'requiere revisión'. [resto de la instrucción original]"
"ejemplo": "Ej: 'semilla.inversion_esperada = 20000000 → CAPEX desglosado: $10M fija + $1M diferida + $2M OPEX inicial + $7M financiamiento = $20M total.'"
```

**Crear `src/lib/finanzas/canonicalCapex.js`** (TDD primero, test en `tests/canonicalCapex.test.js`):
```js
export function resolveCanonicalCapex(planData, seed) {
  // 1. seed.inversion_esperada (canónico)
  // 2. seed.finanzas?.inversion_inicial
  // 3. planData.organizacion.inversion.inversion_fija + inversion_diferida + opex_inicial (suma de strings monetarios parseados)
  // 4. planData.organizacion.inversion.monto_inversion
  // 5. Si todo falla → throw new Error('INVERSION_CANONICA_NO_ENCONTRADA') en modo strict
  //    o warning + null en modo permisivo (1 release)
}
```

**Modificar `agenticEngine.js:392-419`** para llamar a `resolveCanonicalCapex` y registrar el capex resuelto con `notifyStep('tool_call', { capex: resolvedCapex, source: 'semilla.inversion_esperada' })`.

**Reforzar el prompt de Síntesis Ejecutiva** para que cite explícitamente: `CAPEX canónico: $<valor de semilla.inversion_esperada>`, `TIR canónica: <valor de tool_financial_engine.tirEstimadaPercent>`, `VAN canónico: $<valor de tool_financial_engine.vpn>`. Si el campo no existe, agregarlo como `naturaleza.introduccion.resumen_ejecutivo` y registrarlo en `BUSINESS_GUIDES` (regla MDD: `frameworks.js` es la fuente de verdad).

**Crear `src/lib/finanzas/financialSanityCheck.js`** (TDD primero, test en `tests/financialSanityCheck.test.js`):
```js
export function validateFinancialConsistency(planData) {
  // Lee semilla.inversion_esperada (A) y organizacion.inversion.inversion_fija+inversion_diferida+opex_inicial sumado (B)
  // Lee organizacion.rentabilidad.indicadores: TIR, VPN, Payback, ROI
  // Lee organizacion.estados_financieros.balance: Activo Total
  // Flags:
  //   A ≠ B dentro de ±5% → 'inconsistency_canonicas'
  //   TIR > 100% o TIR < 0% → 'tir_implausible'
  //   Payback > 10 años o === 'Nunca' → 'payback_no_viable'
  //   ROI > 1000% o < -100% → 'roi_implausible'
  //   Punto de Equilibrio contiene '∞' o división por cero → 'pe_infinito'
  // Devuelve { inconsistencies: [{module, field, flag, expected, actual}], warnings: [...] }
  // Máximo 5 inconsistencias, truncadas a 200 chars cada una
}
```
Inyectar resultado en el contexto del prompt final como `inconsistencias_pendientes: [...]` para que la IA las mencione con "Este valor requiere revisión: el cálculo interno dio X pero la semilla dice Y".

### FASE 4 — Endurecimiento técnico

**4.1 Un solo Diagnóstico Cuántico:**
- Renombrar `evaluateQuantumProfile` en `quantumDiagnostic.js` a `runQuantumDiagnostic` (export único).
- Borrar la función heurística de `agentTools.js:11-49` y hacer que el import en `agenticEngine.js:486-490` use la nueva función.
- La función unificada acepta `{ aiConfig, semillaData, rawText, areas, teamSize }` y decide entre IA (`callAiProvider`) o heurístico fallback (que ya existe en `quantumDiagnostic.js:101-156`).
- Actualizar test `tests/agenticEngine.test.js:6` que valida `tool_quantum_diagnostic` en el manifiesto.

**4.2 Resolver confusión `minimax` (modelo vs proveedor):**
- En `pricing.js:12` renombrar `'minimax-m3:cloud'` → `'m3-cloud'` (sufijo `:cloud` indica Ollama Cloud gratis).
- En `pricing.js:262` renombrar proveedor `minimax` → `minimax-api`.
- Actualizar `ai.js:159, 184, 1031, 1099-1103` con los nuevos nombres.
- En `Configuracion.jsx:42` crear dos entradas separadas: `M3 Cloud (Ollama, gratis)` y `MiniMax abab 6.5 (API)`.
- Test en `tests/aiRotation.test.js`.

**4.3 Mover API keys hardcodeadas a `process.env` (riesgo de seguridad):**
- Crear `src/config/keys.js` que centralice: `KEYS.bai = import.meta.env.VITE_BAI_KEY || process.env.BAI_KEY || ''`. Orden: Vite (cliente) → Node (server) → string vacío. **Nunca** literal hardcodeado.
- Reemplazar las 5 keys en `PlanContext.jsx:55-60` (B.AI, DENUE, Banxico, BOB Ollama, AlphaVantage) para que lean de `keys.js`.
- Verificar `.gitignore` excluye `.env.local`.
- Test `tests/security/noHardcodedKeys.test.js` que ejecute `grep -rn "sk-[a-zA-Z0-9_-]\{20,\}" src/ scripts/ server/` y verifique 0 resultados.

**4.4 Completar rebranding "DeepSeek Harness" → "Harness":**
- En `agenticEngine.js:195` cambiar `harnessVersion: 'dsh-session-v0.1'` → `harnessVersion: 'harness-v0.1'`.
- Mantener `TrajectoryRecorder.exportHarness()` con shim que acepta ambos valores en lectura para no romper trayectorias guardadas de antes.
- Reemplazar sistemáticamente "DeepSeek Harness" por "Harness" en 8+ archivos: `agenticEngine.js`, `ActivityFeed.jsx`, `AgentTrajectoryViewer.jsx`, `ModuleWrapper.jsx`, `Layout.jsx`, `TerminalDrawer.jsx`, `WordDocumentCenterModal.jsx`, `tests/agenticEngine.test.js`. Mantener "DeepSeek V3/R1" intacto (es nombre de modelo).
- Crear/actualizar `CHANGELOG.md`.

**4.5 Eliminar versiones obsoletas:**
- Borrar (con `git rm` y snapshot en `scripts/DEPRECATED.md`): `gen_master_v4.py`, `gen_master_v5.py`, `gen_master_v5_ultimate.py`, `gen_master_diagram.py` (verificar primero si está referenciado), `scripts/export_all_3.js`, `scripts/export_all_official_plans.js`, `scripts/export_all_plans.js`, `scripts/export_final.js`.
- Vigentes: `gen_master_v6.py` y `scripts/export_high_res_pdfs.js`.

**4.6 Actualizar conteo de prompts (266 → 287):**
- Reemplazar menciones en `README.md` (líneas 41, 60, 90, 279, 395, 398, 400, 480) y `docs/MATRIZ_MODULOS.md`, `docs/COMPARATIVA_METODOS.md`, `.agents/AGENTS.md`.

**4.7 Resolver prompts duplicados en `field_guides.js`:**
- Auditar `BUSINESS_GUIDES` para detectar pares casi-idénticos (`cliente` vs `clientes`, `descripcion` vs `descripciones`).
- Si dos campos son semánticamente el mismo, consolidar y actualizar el `fields: [...]` del módulo afectado en `frameworks.js` (MDD: los modelos son la fuente de verdad).
- Si la duplicación es intencional, documentar con comentario.

### FASE 5 — Verificación end-to-end

**5.1 Anti-duplicación** (`tests/integration/singleProjectRegeneration.test.js`): 3 generaciones consecutivas del mismo proyecto → el conteo de módulos poblados no decrece nunca.

**5.2 Coherencia financiera** (`tests/integration/financialConsistency.test.js`): regenerar CC-TR-SAPI y verificar que el MD contiene `$20,000,000` (o `20M MXN`) como total de inversión; TIR ∈ [10%, 50%], VPN > 0, Payback < 7 años, ROI ∈ [-50%, 200%]; Activo Total en balance = $20,000,000; TIR mencionada en objetivos = TIR en rentabilidad. **Falla si:** TIR = 360%, VPN = -906,419,084, Payback = "Nunca", ROI = -1,283,730, Punto de Equilibrio = "$∞".

**5.3 Rebranding** (`tests/rebranding.test.js`): UI muestra "Harness / Research" (no "DeepSeek Harness"); `TrajectoryRecorder.exportHarness().harnessVersion === 'harness-v0.1'`; trayectorias con `harnessVersion: 'dsh-session-v0.1'` se siguen leyendo.

**5.4 API keys no hardcodeadas** (`tests/security/noHardcodedKeys.test.js`): `grep -rn "sk-[a-zA-Z0-9_-]\{20,\}" src/ scripts/ server/` da 0 resultados.

**5.5 Quantum Diagnostic unificado**: actualizar `tests/agenticEngine.test.js` (línea 6) para verificar una sola implementación de `tool_quantum_diagnostic`.

**5.6 Suite completa:** `npm test` pasa todos los tests existentes + los nuevos.

**5.7 Smoke test manual:**
- Abrir CC-TR-SAPI en la UI; portada con fecha actual (no "4 de septiembre de 2026").
- 28 módulos poblados, 0 duplicados.
- Identidad corporativa coherente ("azul índigo y dorado") en todos los módulos.
- Ubicación canónica "Hermosillo, Sonora" en todos los módulos geográficos.
- Exportar a PDF: 1 sola instancia de cada módulo, 0 secciones Pro-Forma.

---

## Patrones y funciones a reutilizar

| Función | Archivo | Para qué se reutiliza |
|---|---|---|
| `jsonToMarkdown(planData)` | `server/index.js:191` | Regenerar el MD tras la limpieza (Fase 1) |
| `getApiBase()`, `KEYS.*` | `src/context/PlanContext.jsx:46-64` | Punto único de mutación de keys (Fase 4.3) |
| `executeAgentTool('tool_financial_engine', args, planData)` | `src/lib/agentTools.js:453` | Orquestador de cálculo financiero (Fase 3) |
| `notifyStep('tool_call', ...)` | `src/lib/agenticEngine.js:398` | Loggear capex resuelto (Fase 3) |
| `TrajectoryRecorder` con `parentSessionId`, `forkedFromNodeId` | `src/lib/agenticEngine.js:19, 29-30` | Detectar reanudar (Fase 2) |
| `path.resolve('proyectos', type, id, ...)` | `server/index.js:329` | Versionado de guardados (Fase 2) |
| `callAiProvider` | `src/lib/ai.js` | Quantum Diagnostic con IA (Fase 4.1) |
| `Number(semilla.inversion_total)` | `src/hooks/useRiskSimulator.js:72` | Patrón de parsing de inversión (Fase 3) |
| `tool_legal_compliance` | `src/lib/agentTools.js:158` | Resolver normas regulatorias (Fase 1) |
| Estructura de prompt `{instruccion, ejemplo, benchmark, cita, placeholder}` | `src/lib/field_guides.js` | Patrón de reescritura de prompts (Fase 3) |

---

## Orden de ejecución y estimación

1. **Fase 0** — documento de decisiones (1 h, sin código).
2. **Fase 1** — saneamiento CC-TR-SAPI (4-6 h, lectura + edición JSON).
3. **Fase 3** — prompts financieros + `resolveCanonicalCapex` + `validateFinancialConsistency` (8-12 h, TDD primero, 16 prompts).
4. **Fase 2** — versionado de guardados + rename + lock (6-8 h, TDD).
5. **Fase 4** — endurecimiento técnico (8-10 h, todas las sub-tareas).
6. **Fase 5** — suite de verificación end-to-end (4-6 h).
7. **Deploy** — replicar en `Open-Business-Plan-VPS_OLD_no_tocar/` solo cuando todo verde local, vía `deploy_vps.sh`.

**Total estimado:** 32-44 horas de desarrollo + revisión.

---

## Riesgos transversales y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Pérdida de contenido único al limpiar Pro-Forma | Snapshot `.bak.json` antes de Fase 1; diff antes/después con umbral < 5% de bytes únicos perdidos. |
| Throw en `resolveCanonicalCapex` rompe proyectos viejos | Modo strict opt-in por flag `OBP_STRICT_FINANCIALS=1`; warning en modo permisivo durante 1 release. |
| Versionado inunda el disco | Política FIFO 20 versiones en `.versions/`. |
| Rebranding rompe UI en cache | Shim de `harnessVersion` acepta ambos valores; `?v=2.6.27` para CDN-busting. |
| Consolidación de scripts borra dependencia oculta | `grep -rn` antes de borrar; consultar `walkthrough.md` y `start_open_plan.sh`. |
| Violación de regla TDD (AGENTS.md #1) | Cada cambio en `field_guides.js`, `agenticEngine.js`, `server/index.js` debe tener su test en `tests/` ANTES del cambio. |
| VPS_OLD queda desincronizado | Documentar el plan de deploy en `deploy_vps.sh` y `SDD.md` para aplicar en VPS después de validar local. **No tocar localmente.** |