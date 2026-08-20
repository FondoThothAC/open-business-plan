# BDD MASTER — Behavior-Driven Development (Gherkin Scenarios)
**Proyecto:** Open Business Plan  

---

## Escenario 1: Prioridad de Minimax-M3 Cloud y Ejecución ReAct con Tools
```gherkin
Dado que el usuario inicia la generación con IA de un módulo de negocio
Y tiene configurado el proveedor "Ollama Cloud" o la API de Minimax
Cuando el motor agéntico inicia el razonamiento
Entonces selecciona prioritariamente el modelo "minimax-m3:cloud"
Y ejecuta llamadas a herramientas en vivo (tool_web_search, tool_financial_engine)
Y registra cada paso (Pensamiento ➔ Tool Call ➔ Observación ➔ Crítica ➔ Síntesis).
```

## Escenario 2: Inspección de Trayectoria estilo DeepSeek Harness
```gherkin
Dado que un módulo ha finalizado su generación agéntica
Cuando el usuario hace clic en el botón "🔍 Trayectoria" en la cabecera del módulo o en el Monitor de IA
Entonces se despliega el modal interactivo "Agent Trajectory Viewer (DeepSeek Harness)"
Y muestra la línea de tiempo completa del árbol DAG con badges de color por tipo de paso
Y permite inspeccionar argumentos, outputs JSON estructurados, duración en ms y métricas globales
Y ofrece botones para copiar o descargar la traza en formato JSON estándar.
```

## Escenario 3: Rotación transparente de modelo ante Rate Limit (429) en Groq
```gherkin
Dado que el usuario tiene seleccionado el proveedor "Groq" y el nivel "Industrial (9 agentes)"
Y se encuentra generando el módulo "Análisis de Demanda"
Cuando el modelo "qwen/qwen3.6-27b" alcanza el límite de tokens por minuto (HTTP 429) en la Fase 3
Entonces el sistema detecta inmediatamente el error sin demoras
Y conmuta la consulta al siguiente modelo en el catálogo ("openai/gpt-oss-120b")
Y el Monitor de IA muestra el evento "🔄 Rotando a modelo en Groq: openai/gpt-oss-120b..."
Y la Fase 3 se completa exitosamente sin reiniciar las Fases 1 y 2.
```

## Escenario 4: Cascade Fallback a Google Gemini al agotarse Groq
```gherkin
Dado que todos los modelos de Groq configurados han agotado su cuota diaria
Y el usuario tiene configurada su clave de "Google Gemini"
Cuando se ejecuta la Fase 4 de la Mesa de Expertos
Entonces el orquestador activa la conmutación multi-proveedor
Y emite el mensaje "⚠️ [Rotación IA] Groq saturado o con error. Rotando automáticamente a Gemini (gemini-3.6-flash)..."
Y la consulta se resuelve con Gemini Flash
Y el plan continúa fluidamente hasta la Fase 9.
```
