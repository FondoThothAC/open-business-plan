# Funcionamiento del Motor de IA — Mesa de Expertos Multi-Agente

## Arquitectura General

El motor de IA de OpenPlan (`src/lib/ai.js`) implementa una **Mesa de Expertos** que genera contenido de planes de negocio mediante una cadena de agentes con roles especializados, soportando tanto modelos locales (Ollama/LM Studio) como proveedores de nube.

## Proveedores Soportados

| Proveedor | Tipo | Modelos | Configuración |
|---|---|---|---|
| **Ollama** | Local | qwen3.5:9b, gemma4:12b, gemma4:pro, qwen3-coder | Endpoint: localhost:11434 |
| **LM Studio** | Local | Cualquier modelo compatible | Endpoint: localhost:1234/v1 |
| **Gemini** | Nube | gemini-1.5-flash (default) | API Key de Google AI |
| **Groq** | Nube | llama-3.3-70b-versatile | API Key de Groq |
| **NVIDIA NIM** | Nube | nvidia/llama-3.1-nemotron-70b-instruct | API Key de NVIDIA |
| **OpenAI** | Nube | gpt-4o | API Key de OpenAI |
| **Mistral** | Nube | mistral-large-latest | API Key de Mistral |

## Resolución de Proveedor/Modelo

La función `resolveProviderModel()` garantiza **coherencia** entre el proveedor y el modelo seleccionado:

1. **Modelos cloud explícitos**: Si el modelo contiene `gemini`, `gpt`, `mistral-large`, `nvidia`, `llama-3.3-70b` → se fuerza el proveedor correspondiente y se usa el modelo cloud configurado.
2. **Proveedores locales (ollama/lmstudio)**: Se resuelve el modelo contra los modelos instalados en Ollama mediante `findBestOllamaModel()`.
3. **Proveedores de nube**: Si el modelo configurado no es un modelo cloud válido, se usa el default del proveedor (ej. gemini → gemini-1.5-flash).
4. **Fallback inteligente**: Si el modelo pedido no existe (ej. `nemotron`), se selecciona automáticamente el mejor modelo instalado (preferencia: qwen3.5:9b > gemma4:pro > gemma4:12b > qwen3-coder).

## Niveles de Profundidad

| Nivel | Nombre | Agentes | Tiempo Estimado | Uso |
|---|---|---|---|---|
| 1 | Rápido | Analista → Redactor | ~30-60s | Borrador rápido |
| 2 | Pro | Analista → Crítico → Redactor | ~2-4 min | **Predeterminado** |
| 3 | Profundo | Estratega → Analista → Abogado del Diablo → Crítico → Redactor | ~8-15 min | Análisis completo |
| 4 | Industrial | 9 agentes en cadena | ~20-30 min | Máxima calidad |

## Cadena de Fallback

Cuando un modelo falla, el sistema intenta automáticamente otros modelos en orden de preferencia:

1. Modelo configurado por el usuario
2. Modelo del agente específico (agentModels)
3. Modelo del nivel de profundidad (DEFAULT_AGENT_CONFIG)
4. Modelo principal de configuración
5. Fallback automático entre proveedores (local → nube)

## Auto-Retry por Límite de Tokens

La función `fetchWithRetry()` implementa reintento automático cuando un proveedor de nube devuelve HTTP 429 (rate limit):

- **Detección**: HTTP 429 o mensajes de error que contengan `rate_limit`, `too many requests`, `quota`, `limit exceeded`
- **Espera**: Usa el header `Retry-After` si está disponible, o backoff exponencial (2s → 4s → 8s → ... hasta 60s)
- **Reintentos**: Hasta 8 intentos automáticos
- **Logging**: Cada reintento se muestra en el ActivityFeed del usuario con el tiempo de espera

Esto permite que la generación de planes ** continúe automáticamente ** cuando se agotan los tokens por hora del proveedor, sin intervención del usuario.

## Investigación de Mercado

El motor de investigación (`server/competitorEngine.js`) consulta múltiples fuentes:

- **DENUE/INEGI**: Datos oficiales de negocios registrados en México
- **OpenStreetMap/Overpass**: Negocios por geolocalización
- **DuckDuckGo**: Scraping web conservador (gratuito, sin API key)
- **Google Places**: Detalles de negocios (requiere API key)
- **Bing Maps**: Datos complementarios

La búsqueda web se realiza vía `/api/search` con soporte para Tavily (mejor para LLMs) o DuckDuckGo (gratuito).

## Configuración por Defecto

- **Proveedor primario**: Ollama (local)
- **Modelo principal**: qwen3.5:9b (9.7B parámetros, Q4_K_M)
- **Secundario**: Groq (nube, fallback)
- **Profundidad**: Nivel 2 (Pro)
- **Contexto**: 64k tokens (seguro para 8GB VRAM)

## Modelos Instalados (Referencia)

| Modelo | Tamaño | Parámetros | Uso Recomendado |
|---|---|---|---|
| qwen3.5:9b | 6.6GB | 9.7B | Modelo principal, general |
| gemma4:12b | 7GB | 12B | Alternativa de calidad |
| gemma4:pro | 8.9GB | 8B | Alternativa estable |
| qwen3-coder | 17.3GB | 30.5B | Código/programación |

---

*Documento generado automáticamente — OpenPlan v2.6.26.8.11*
