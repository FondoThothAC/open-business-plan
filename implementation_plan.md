# 🚀 Plan de Implementación — Evolución de Configuración Maestro, BOB Chat e Integraciones

> **9 áreas de mejora · 3 fases · ~35 archivos impactados**

---

## Contexto del Problema

El sistema actual de Open Business Plan tiene varios puntos de fricción identificados en la página de Configuración Maestro:

1. **BOB Chat "brinca" entre modelos** — Usa una cascada de 8 proveedores en lugar de un modelo dedicado fijo
2. **Fila 2 mal etiquetada** — Las tarjetas muestran nombres estáticos en lugar de modelos dinámicos reales
3. **Telemetría falla** — El endpoint `GET /api/telemetry/tokens` devuelve datos pero el frontend no los consume correctamente; falta sección de trazabilidad detallada
4. **Alpha Vantage sin integrar** — Key disponible (`38CEHMYW5CGOHUX1`) pero sin conexión real
5. **TouchBar no funciona en todos los navegadores**
6. **Medidores de cuota** — Datos parciales, falta reflejar HOT flags de routers
7. **APIs de datos incompletas** — Solo INEGI/BANXICO activas
8. **BOB sin modo MCP** — No puede controlar la UI ni llenar campos
9. **Pricing.js** — Solo 18 modelos hardcoded, sin metadata dinámica

---

## User Review Required

> [!IMPORTANT]
> **API Key de Alpha Vantage** — La key `38CEHMYW5CGOHUX1` será integrada en el código. ¿Confirmas que esta key es la correcta y que deseas almacenarla como default en el `.env.local`?

> [!WARNING]
> **BOB con segunda cuenta Ollama Cloud** — Se creará un campo `bobOllamaKey` en la configuración. Necesitarás generar una segunda API key en [Ollama Cloud Settings](https://ollama.com/settings/keys) exclusiva para BOB.

> [!IMPORTANT]
> **APIs Nuevas** — Varias APIs gratuitas requieren registro para obtener keys (CoinGecko, NewsAPI, etc.). El sistema las dejará como opcionales con campos de configuración visibles.

---

## Open Questions

> [!IMPORTANT]
> 1. **¿La segunda cuenta de Ollama Cloud para BOB ya la tienes creada?** Si no, necesitamos la key antes de probar en producción.
> 2. **¿El backend (`server/index.js`) corre en el VPS o solo localmente?** Algunos endpoints nuevos (modelo registry, cron) necesitan persistir estado en disco.
> 3. **¿Quieres que las APIs nuevas (CoinGecko, World Bank, etc.) se muestren inmediatamente en Configuración aunque aún no tengas keys?** Recomiendo que sí, como campos opcionales.

---

## Proposed Changes

Las 3 fases están organizadas por prioridad e impacto:

---

## 📦 FASE 1 — Crítica (Impacto Alto)

> BOB IA Dedicada + Registro Dinámico de Modelos + Etiquetado Fila 2 + Telemetría Fix

---

### Componente: BOB Chat — IA Dedicada

#### [MODIFY] [BobChatModal.jsx](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/components/BobChatModal.jsx)

**Cambios:**
- Eliminar la cascada de proveedores (líneas 92-134) que causa el "brinco" entre modelos
- Implementar lógica directa: BOB **siempre** usa `minimax-m3:cloud` vía Ollama Cloud con la key dedicada `bobOllamaKey`
- Agregar fallback silencioso: si `bobOllamaKey` no está configurada, usar la `ollamaKey` principal
- Mostrar en el header del chat qué modelo está usando BOB (badge dinámico)
- Agregar manejo de errores más descriptivo cuando la key de BOB no está configurada

```diff
-// PRIORIDAD PARA EL CHAT:
-// 1. Enrutadores Inteligentes (TokenRouter / OpenRouter / OrcaRouter)
-// 2. Groq (Llama 3.3 70B Versatile — 800+ tks/seg)
-// 3. Ollama Cloud / Minimax (minimax-m3:cloud)
-// 4. Gemini 3.6 Flash / 1.5 Flash
-let selectedProvider = 'tokenrouter';
-let selectedModel = 'deepseek/deepseek-r1:free';
-let selectedKey = rawAi.tokenrouterKey;
+// BOB usa exclusivamente Ollama Cloud minimax-m3:cloud con key dedicada
+const selectedProvider = 'ollama';
+const selectedModel = 'minimax-m3:cloud';
+const selectedKey = rawAi.bobOllamaKey || rawAi.ollamaKey;
```

---

### Componente: Configuración — Campo `bobOllamaKey`

#### [MODIFY] [Configuracion.jsx](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/modules/Configuracion.jsx)

**Cambios:**
- Agregar campo de input para `bobOllamaKey` dentro de la tarjeta de Ollama Cloud (Fila 1 o sección dedicada de BOB)
- Agregar botón "Probar Conexión" específico para la key de BOB
- Label: "🤖 API Key de BOB (Ollama Cloud Exclusiva)"
- Tooltip explicando que esta key se usa solo para el chatbot y no afecta la generación de planes

---

### Componente: Registro Dinámico de Modelos

#### [MODIFY] [pricing.js](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/config/pricing.js)

**Cambios:**
- Expandir `API_COSTS` para incluir **todos** los modelos actuales del sistema (incluyendo los de routers y cloud gratuitos)
- Agregar metadata rica por modelo:
  - `provider`: nombre del proveedor real
  - `tier`: `'free'` | `'paid'` | `'freemium'`
  - `isHot`: flag dinámico (actualizado por el backend)
  - `lastVerified`: timestamp de última verificación
  - `contextWindow`: tamaño de ventana de contexto
  - `capabilities`: array de capacidades (`['chat', 'tools', 'multimodal', 'json_mode']`)
- Agregar función `getModelRegistry()` que consulta `GET /api/models/registry` del backend y merge con los defaults locales
- Agregar función `isModelHot(modelId)` para verificar si un modelo tiene flag HOT activo

Modelos a agregar al registro:
| Modelo | Proveedor | Tier | Ctx |
|--------|-----------|------|-----|
| `minimax-m3:cloud` | Ollama Cloud | free | 1M |
| `kimi-k2.6:cloud` | Ollama Cloud | free | 128k |
| `qwen3.5:cloud` | Ollama Cloud | free | 128k |
| `nemotron-3-super:cloud` | Ollama Cloud | free | 128k |
| `gemma4:31b-cloud` | Ollama Cloud | free | 128k |
| `glm-5.1:cloud` | Ollama Cloud | free | 128k |
| `nvidia/nemotron-3.5-lightning:free` | OpenRouter | free | 1M |
| `openai/gpt-oss-20b:free` | OpenRouter | free | 131k |
| `deepseek/deepseek-r1:free` | TokenRouter | free | 128k |
| `llama-3.3-70b-versatile` | Groq | freemium | 128k |
| `qwen/qwen3.6-27b` | Groq | freemium | 128k |
| Todos los existentes en `API_COSTS` | Varios | paid | Var |

---

### Componente: Backend — Endpoint de Registro de Modelos

#### [MODIFY] [server/index.js](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/server/index.js)

**Cambios:**
- Crear endpoint `GET /api/models/registry` que devuelve el registro de modelos con estados actuales
- Crear endpoint `POST /api/models/verify` que ejecuta verificación manual de un proveedor
- Crear cron interno (usando `setInterval` cada 24h) que:
  1. Pinga cada proveedor configurado para verificar disponibilidad
  2. Actualiza flags de `isHot` basado en modelos `:free` disponibles en routers
  3. Persiste el estado en `proyectos/telemetry/model_registry.json`
- Extender el endpoint `POST /api/telemetry/tokens` para almacenar metadata adicional:
  - `promptTokens`, `completionTokens` (separados)
  - `model` usado
  - `latencyMs`
  - `promptPreview` (primeros 200 chars del prompt truncado)
  - `timestamp`

---

### Componente: Etiquetado Dinámico de Tarjetas Fila 2

#### [MODIFY] [Configuracion.jsx](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/modules/Configuracion.jsx) (continuación)

**Cambios en Fila 2:**
- Cada tarjeta de proveedor (Gemini, Claude, OpenAI, Ollama Local, Ollama Cloud, GLM) consultará el registro dinámico para:
  - Mostrar **lista de modelos disponibles** del proveedor (no solo el nombre estático)
  - Mostrar badge de estado: `🟢 En línea` / `🔴 Offline` / `⚡ Gratuito`
  - Si un modelo del proveedor aparece como `:free` en los routers de Fila 1, mostrar badge **🔥 HOT** pulsante con glow animation
  - Tooltip con última verificación y tiempo restante de cuota
- Actualizar la etiqueta del encabezado de Fila 2: en lugar de `GEMINI, CLAUDE, GPT, DEEPSEEK, GROK, OLLAMA LOCAL` hardcoded, generarlo dinámicamente desde los proveedores activos

---

### Componente: Telemetría — Fix y Expansión

#### [MODIFY] [TokenTelemetryDashboard.jsx](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/components/TokenTelemetryDashboard.jsx)

**Cambios:**
- Arreglar la conexión con `GET /api/telemetry/tokens` — el endpoint existe y funciona pero el frontend puede fallar si el backend no está corriendo
- Agregar fallback a localStorage: si el backend falla, mostrar datos cacheados localmente
- Expandir la visualización para mostrar desglose por modelo (no solo por proveedor)

#### [MODIFY] [ApiQuotaMeter.jsx](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/components/ApiQuotaMeter.jsx)

**Cambios:**
- Actualizar `PROVIDER_METADATA` para reflejar datos reales del registro dinámico
- Agregar badge HOT visual con animación de pulso cuando `isHot=true`
- Mostrar cuota restante real basada en los datos de telemetría del backend
- Agregar nuevo proveedor al metadata: `deepseek`, `grok`, `tokenrouter` (ya existe), `opencode` (ya existe)

---

## 📦 FASE 2 — Media (Impacto Medio)

> Alpha Vantage + APIs Nuevas + Sección de Trazabilidad + TouchBar Fix

---

### Componente: Integración Alpha Vantage

#### [MODIFY] [digitalTwinAdapters.js](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/lib/digitalTwinAdapters.js)

**Cambios:**
- Implementar llamadas reales a la API de Alpha Vantage usando la key `38CEHMYW5CGOHUX1`
- Agregar funciones de fetch para:
  - `OVERVIEW` — Perfil fundamental (Beta, P/E, EPS, Sector) → Usado en módulo **Finanzas** (WACC, Análisis de Riesgo)
  - `TIME_SERIES_DAILY` — Precios históricos → Usado en módulo **Mercado** (volatilidad, tendencias)
  - `INCOME_STATEMENT` — Estado de resultados → Usado en módulo **Finanzas** (benchmarks de industria)
  - `BALANCE_SHEET` — Balance general → Usado en módulo **Finanzas** (comparación de ratios)
  - `CASH_FLOW` — Flujo de efectivo → Usado en módulo **Finanzas** (proyecciones)
- Crear función `fetchAlphaVantageData(symbol, function, apiKey)` que envuelve las llamadas con manejo de rate limit (5 calls/min en free tier)
- Integrar los datos normalizados en el prompt de la Mesa de Expertos vía `injectDigitalTwinEvidence()`

**Mapeo de APIs a Módulos del Plan:**

| API / Fuente | Módulos que la Usan | Tipo de Dato |
|---|---|---|
| **Alpha Vantage** | Finanzas, Mercado, PESTEL (Factor Económico) | JSON Financiero |
| **FRED** | Finanzas (WACC, Tasa Libre de Riesgo) | Series Temporales |
| **BANXICO** | Finanzas (CETES, Tipo de Cambio), PESTEL | Series Temporales |
| **INEGI/DENUE** | Mercado (TAM/SAM/SOM), Operaciones (Ubicación) | Geoespacial |
| **Yahoo Finance** | Finanzas (Precios, Dividendos), Mercado | Series Temporales |
| **Google Trends** | Mercado (Sentimiento), Operaciones | Tendencias |
| **Copernicus** | PESTEL (Factor Ambiental) | Climático |
| **CoinGecko** | Finanzas (Cripto si aplica), PESTEL (Tecnológico) | JSON |
| **World Bank** | PESTEL (Económico, Social), Mercado Internacional | Series Temporales |
| **NewsAPI** | PESTEL (Político, Social), Mercado (Competencia) | Texto |
| **Exchangerate.host** | Finanzas (Tipo de Cambio), Mercado Internacional | JSON |
| **SEC EDGAR / BMV** | Finanzas (Benchmarks), Organización (Gobierno Corporativo) | JSON |

---

### Componente: APIs Nuevas — Adaptadores y UI

#### [NEW] `src/lib/adapters/coinGeckoAdapter.js`
- Adaptador para CoinGecko API (gratuito, sin key requerida para básico)
- Endpoints: `/simple/price`, `/coins/{id}/market_chart`

#### [NEW] `src/lib/adapters/worldBankAdapter.js`
- Adaptador para World Bank Open Data API (gratuito, sin key)
- Endpoints: indicadores por país (`NY.GDP.MKTP.CD`, `FP.CPI.TOTL.ZG`)

#### [NEW] `src/lib/adapters/newsApiAdapter.js`
- Adaptador para NewsAPI/GNews (free tier: 100 req/día)
- Endpoint: `/everything?q={sector}&language=es`

#### [NEW] `src/lib/adapters/exchangeRateAdapter.js`
- Adaptador para Exchangerate.host (gratuito)
- Endpoint: `/latest?base=MXN`

#### [NEW] `src/lib/adapters/openExchangeAdapter.js`
- Adaptador para Open Exchange Rates (free tier: 1000 req/mes)

#### [NEW] `src/lib/adapters/secEdgarAdapter.js`
- Adaptador para SEC EDGAR (gratuito, public API)
- Endpoint: Company Facts, Filings

#### [MODIFY] [Configuracion.jsx](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/modules/Configuracion.jsx)

**Cambios en sección "Conexiones de Datos en Tiempo Real (Gemelo Digital)":**
- Agregar campos de configuración para cada nueva API:
  - `coinGeckoEnabled` (toggle, no requiere key)
  - `worldBankEnabled` (toggle, no requiere key)
  - `newsApiKey` (input)
  - `exchangeRateEnabled` (toggle, no requiere key)
  - `openExchangeKey` (input)
  - `secEdgarEnabled` (toggle, no requiere key)
- Cada campo muestra a qué módulos del plan alimenta (con iconos de módulo)
- Badge indicando si la API es gratuita o de pago

---

### Componente: Sección de Trazabilidad de IA

#### [NEW] `src/components/AiTraceabilityPanel.jsx`

**Nueva sección dedicada en Configuración Maestro:**
- **Historial de llamadas** — Tabla scrollable con:
  - Timestamp
  - Proveedor + Modelo usado
  - Tokens de entrada / salida
  - Latencia (ms)
  - Costo estimado (USD)
  - Preview del prompt (truncado, expandible)
  - Status (éxito/error/timeout)
- **Gráficas de consumo temporal** — Chart de barras agrupadas por proveedor y por día
- **Métricas agregadas** — Total de tokens, costo acumulado, proveedor más usado, modelo más eficiente (menor latencia/token)
- **Filtros** — Por proveedor, rango de fechas, módulo del plan
- **Exportar** — Botón para descargar el log completo como CSV/JSON
- **Purgar** — Botón para limpiar historial con confirmación

**Fuente de datos:**
- `GET /api/telemetry/trajectories` (ya existe) — Para el historial detallado
- `GET /api/telemetry/tokens` (ya existe) — Para los agregados por proveedor
- Backend `POST /api/telemetry/log` (ya existe) — Para persistir cada llamada

---

### Componente: TouchBar Fix Multi-Navegador

#### [MODIFY] [touchBarManager.js](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/lib/touchbar/touchBarManager.js)

**Cambios:**
- Agregar detección de capacidades: `if ('mediaSession' in navigator)`
- Normalizar la API para Chrome, Safari y Firefox:
  - Chrome: `navigator.mediaSession` funciona completo
  - Safari: Soporta MediaSession pero requiere `<audio>` tag activo para activar el control
  - Firefox: Soporte parcial — usar fallback a `document.title` para indicar progreso
- Crear un `<audio>` silencioso (silent audio hack) para Safari que active MediaSession
- Agregar try/catch en cada operación de MediaSession para evitar que un error en un navegador bloquee toda la funcionalidad
- Log de diagnóstico: `console.info('[TouchBar] Navegador:', browserName, '| MediaSession:', supported)`

#### [MODIFY] [TouchBarBridge.jsx](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/components/TouchBarBridge.jsx)

**Cambios:**
- Montar el `<audio>` silencioso dentro del componente para Safari
- Agregar detector de navegador para adaptar la estrategia
- Agregar estado visual de conexión de TouchBar en la tarjeta de Configuración

---

## 📦 FASE 3 — Estratégica (Futuro)

> BOB Modo MCP Completo + Gemelos Digitales Expandidos

---

### Componente: BOB Agente MCP (Control de UI)

#### [MODIFY] [BobChatModal.jsx](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/components/BobChatModal.jsx)

**Evolución mayor — BOB se convierte en un agente MCP completo:**

1. **Modo GrillMe** — BOB analiza la sección activa del plan:
   - Detecta campos vacíos o débiles en el módulo actual
   - Genera preguntas secuenciales estilo GrillMe usando la IA
   - Con cada respuesta del usuario, BOB rellena automáticamente los campos vía `onExecuteCommand`
   - Mantiene un árbol de decisiones por módulo

2. **Control de UI** — BOB puede:
   - Navegar entre módulos: `navigateToModule('finanzas')`
   - Abrir/cerrar paneles: `togglePanel('montecarlo')`
   - Invocar la Mesa de Expertos: `triggerExpertPanel('mercado')`
   - Actualizar campos de formulario: `updateField('semilla.nombre_proyecto', 'Nuevo Nombre')`
   - Leer el estado actual de la pantalla: `getCurrentModuleState()`

3. **Acceso a archivos** — BOB puede:
   - Listar documentos cargados: `listUploadedDocs()`
   - Consultar contenido de un documento: `readDoc(docId)`
   - Sugerir secciones del plan basadas en documentos cargados

4. **Herramientas (Tools)** — Similar a Hermes/OpenClaw:
   - `navigate(module)` — Navegar a un módulo
   - `fill(path, value)` — Llenar un campo
   - `read(path)` — Leer un campo
   - `analyze(section)` — Analizar una sección
   - `suggest(context)` — Generar sugerencias
   - `search(query)` — Buscar información en el plan
   - `generate(module)` — Disparar generación de un módulo

#### [NEW] `src/lib/bobAgent.js`

**Motor del agente BOB:**
- Definir las tools disponibles como esquemas JSON (compatible con function calling de minimax-m3)
- Implementar el loop de agente: `prompt → IA → tool_call → execute → response`
- Mantener contexto de conversación y estado del plan
- Integrar con `PlanContext.jsx` para leer/escribir estado

---

### Componente: Gemelos Digitales Expandidos

#### [MODIFY] [digitalTwinAdapters.js](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/lib/digitalTwinAdapters.js)

**Cambios:**
- Agregar sistema de "Gemelo Digital Activo" que corre en background:
  - Cada vez que se genera un módulo, el sistema consulta automáticamente las APIs relevantes
  - Los datos se inyectan en el prompt de la Mesa de Expertos como "contexto del mundo real"
  - El usuario ve un indicador de cuántas fuentes externas alimentaron cada sección

#### [NEW] `src/components/DigitalTwinDashboard.jsx`

**Panel visual de Gemelo Digital:**
- Mapa de fuentes de datos con estado de conexión
- Última sincronización por fuente
- Datos clave resumidos (tipo de cambio actual, inflación, tasa de referencia, etc.)
- Botón de "Sincronizar Todo" que actualiza todas las fuentes

---

## Verification Plan

### Automated Tests

```bash
# Fase 1 - Verificar que pricing.js exporta el registro expandido
node -e "const {API_COSTS} = require('./src/config/pricing.js'); console.log(Object.keys(API_COSTS).length, 'modelos registrados')"

# Fase 1 - Build de verificación
npm run build

# Fase 1 - Verificar endpoints del backend
curl -s http://localhost:3001/api/models/registry | jq '.models | length'
curl -s http://localhost:3001/api/telemetry/tokens | jq '.'

# Fase 2 - Verificar Alpha Vantage
curl -s "https://www.alphavantage.co/query?function=OVERVIEW&symbol=AAPL&apikey=38CEHMYW5CGOHUX1" | jq '.Symbol'
```

### Manual Verification

- [ ] Abrir BOB Chat y verificar que siempre use `minimax-m3:cloud` (visible en header del chat)
- [ ] En Fila 2, verificar que cada tarjeta muestre modelos dinámicos y badges correctos
- [ ] Verificar que el badge 🔥 HOT aparezca cuando un modelo `:free` está disponible en routers
- [ ] Abrir Configuración → Trazabilidad de IA y verificar que muestre historial de llamadas
- [ ] Probar la integración Alpha Vantage: buscar un ticker y verificar que aparezcan datos reales
- [ ] Verificar TouchBar en Chrome, Safari y Firefox (macOS)
- [ ] Verificar que `./git_sync.sh` se ejecute exitosamente tras cada fase

---

## Resumen de Archivos Impactados

### Fase 1 (8 archivos)
| Archivo | Acción |
|---------|--------|
| `src/components/BobChatModal.jsx` | MODIFY — IA dedicada |
| `src/config/pricing.js` | MODIFY — Registro dinámico |
| `src/modules/Configuracion.jsx` | MODIFY — Campo bobOllamaKey + Fila 2 dinámica |
| `server/index.js` | MODIFY — Endpoint registry + cron 24h |
| `src/components/TokenTelemetryDashboard.jsx` | MODIFY — Fix conexión + fallback |
| `src/components/ApiQuotaMeter.jsx` | MODIFY — HOT badges + datos reales |
| `src/components/GlobalTokenMonitor.jsx` | MODIFY — Sincronizar con registro |
| `src/lib/ai.js` | MODIFY — Asegurar que BOB no entre en cascada |

### Fase 2 (12 archivos)
| Archivo | Acción |
|---------|--------|
| `src/lib/digitalTwinAdapters.js` | MODIFY — Alpha Vantage real |
| `src/lib/adapters/coinGeckoAdapter.js` | NEW |
| `src/lib/adapters/worldBankAdapter.js` | NEW |
| `src/lib/adapters/newsApiAdapter.js` | NEW |
| `src/lib/adapters/exchangeRateAdapter.js` | NEW |
| `src/lib/adapters/openExchangeAdapter.js` | NEW |
| `src/lib/adapters/secEdgarAdapter.js` | NEW |
| `src/components/AiTraceabilityPanel.jsx` | NEW — Sección completa |
| `src/modules/Configuracion.jsx` | MODIFY — Campos APIs + Trazabilidad |
| `src/lib/touchbar/touchBarManager.js` | MODIFY — Multi-browser |
| `src/components/TouchBarBridge.jsx` | MODIFY — Audio silencioso Safari |
| `server/index.js` | MODIFY — Endpoints de datos |

### Fase 3 (4 archivos)
| Archivo | Acción |
|---------|--------|
| `src/components/BobChatModal.jsx` | MODIFY — Agente MCP |
| `src/lib/bobAgent.js` | NEW — Motor del agente |
| `src/lib/digitalTwinAdapters.js` | MODIFY — Gemelo activo |
| `src/components/DigitalTwinDashboard.jsx` | NEW — Panel visual |

---

> **Total: ~24 archivos · 8 nuevos · 16 modificados**
