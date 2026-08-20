# BDD MASTER — Behavior-Driven Development (Gherkin Scenarios)
**Proyecto:** Open Business Plan  

---

## Escenario 1: Rotación transparente de modelo ante Rate Limit (429) en Groq
```gherkin
Dado que el usuario tiene seleccionado el proveedor "Groq" y el nivel "Industrial (9 agentes)"
Y se encuentra generando el módulo "Análisis de Demanda"
Cuando el modelo "qwen/qwen3.6-27b" alcanza el límite de tokens por minuto (HTTP 429) en la Fase 3
Entonces el sistema detecta inmediatamente el error sin demoras
Y conmuta la consulta al siguiente modelo en el catálogo ("openai/gpt-oss-120b")
Y el Monitor de IA muestra el evento "🔄 Rotando a modelo en Groq: openai/gpt-oss-120b..."
Y la Fase 3 se completa exitosamente sin reiniciar las Fases 1 y 2.
```

## Escenario 2: Cascade Fallback a Google Gemini al agotarse Groq
```gherkin
Dado que todos los modelos de Groq configurados han agotado su cuota diaria
Y el usuario tiene configurada su clave de "Google Gemini"
Cuando se ejecuta la Fase 4 de la Mesa de Expertos
Entonces el orquestador activa la conmutación multi-proveedor
Y emite el mensaje "⚠️ [Rotación IA] Groq saturado o con error. Rotando automáticamente a Gemini (gemini-3.6-flash)..."
Y la consulta se resuelve con Gemini Flash
Y el plan continúa fluidamente hasta la Fase 9.
```

## Escenario 3: Uso de Pool de Múltiples API Keys
```gherkin
Dado que el usuario configuró "gsk_key1, gsk_key2" en el campo de API Key de Groq
Cuando la primera llave "gsk_key1" recibe una respuesta 429
Entonces el motor selecciona la llave "gsk_key2" para el siguiente intento
Y la solicitud se completa con éxito sin intervención manual del usuario.
```
