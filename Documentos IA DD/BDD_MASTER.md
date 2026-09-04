# BDD MASTER — Behavior-Driven Development (Gherkin Scenarios)
**Proyecto:** Open Business Plan (Fondo Thoth AC)  
**Versión:** 3.1.0  

---

## Escenario 1: Onboarding Express Dual (Chat + Wizard Sincronizado)
```gherkin
Escenario: El usuario inicia un nuevo plan usando el Onboarding Express con Swarm
  Dado que el usuario ingresa a la plataforma por primera vez
  Cuando responde a las 3 preguntas clave o sube una nota de voz
  Entonces el Swarm de agentes procesa la información en paralelo
  Y la Semilla se autocompleta en tiempo real en la vista Wizard
  Y el usuario puede alternar entre el Chat y el Wizard viendo los mismos datos sincronizados.
```

## Escenario 2: Deep Research Híbrido con Control de Presupuesto
```gherkin
Escenario: Búsqueda profunda de mercado con fallback automático de costos
  Dado que el proyecto requiere un análisis competitivo de alta precisión
  Cuando el usuario activa el modo Deep Research
  Y existe presupuesto disponible en la API de pago
  Entonces el sistema ejecuta la búsqueda profunda vía Tavily/Serper y sintetiza con Gemini 2.5 Pro
  Pero si la API de pago no está configurada o se agota la cuota
  Entonces el sistema realiza la búsqueda gratuita vía DuckDuckGo y scraping local sin arrojar error.
```

## Escenario 3: Flujo Asíncrono de Cotización de Maquinaria Pesada (RFQ)
```gherkin
Escenario: Cotización formal y recepción diferida de maquinaria industrial
  Dado que el plan requiere una maquinaria pesada que no tiene precio público en internet
  Cuando el agente genera el paquete formal de RFQ técnica
  Y se envían las solicitudes a los distribuidores autorizados
  Entonces el módulo de maquinaria marca el ítem como "En espera de cotización B2B"
  Y cuando se recibe la cotización por correo o subida manual de PDF
  Entonces el sistema extrae el precio y recalcula automáticamente el CAPEX, VAN y TIR del proyecto.
```

## Escenario 4: Creación de Fork Temporal en el Gemelo Digital
```gherkin
Escenario: Recalibración periódica de factores macroeconómicos y costos
  Dado un proyecto activo con corrida financiera establecida
  Cuando transcurren 30 días o se detecta un cambio sustancial en la tasa de interés de Banxico
  Entonces el motor del Gemelo Digital genera automáticamente una versión ramificada "Gemelo Digital [Fecha]"
  Y muestra un panel Diff visual con la comparativa de viabilidad y semáforo de impacto.
```

## Escenario 5: Formulación con B.AI (GPT-5.2 / Qwen 3.8) y Fallback de Cuota
```gherkin
Escenario: Generación de módulos de negocio usando B.AI con extracción de razonamiento y resiliencia
  Dado que el usuario configura su API Key de B.AI (`sk-ot...`) en Configuración
  Y selecciona el modelo `gpt-5.2` o `qwen3.8-flash`
  Cuando solicita la redacción o industrialización de un módulo con la Mesa de Expertos
  Entonces el motor envía la solicitud a `https://api.b.ai/v1/chat/completions` con streaming activo
  Y extrae los tokens de razonamiento (`reasoning_content`) mostrándolos en un acordeón interactivo de pensamiento
  Pero si B.AI reporta falta de balance o rate limit (HTTP 429/402)
  Entonces el orquestador conmuta automáticamente al siguiente proveedor en cascada (Groq, Gemini, Ollama Cloud) sin perder el progreso del usuario.
```

## Escenario 6: Deep Research Online Resiliente, Replay Interactivo y Forking en DeepSeek Harness
```gherkin
Escenario: Lanzamiento de Deep Research con autorización de presupuesto, auto-pausa por cuota y Replay/Forking
  Dado que el usuario abre la consola Terminal Drawer o un agente invoca tool_deep_research
  Cuando el usuario valida la consulta, autoriza el presupuesto máximo en USD e inicia la tarea
  Entonces el backend ejecuta la investigación asíncrona registrando la trayectoria bajo el estándar dsh-session-v0.1 del meta-kernel Cordis
  Y si los proveedores de búsqueda agotan su cuota o sufren rate-limiting estricto
  Entonces la tarea se resguarda en estado "paused_waiting_quota", programa auto-reintentos y emite una alerta en la campana de notificaciones del encabezado
  Y cuando la tarea finaliza, el usuario puede inspeccionar el grafo causal DAG, ejecutar Replay interactivo (play/pause/scrub) o bifurcar (Fork) la sesión desde cualquier nodo para probar otro enfoque o modelo.
```

## Escenario 7: Contrato de Procedencia de Datos (Cero Alucinación) y Bucle ReAct Autónomo
```gherkin
Escenario: Investigación web sin fabricación de datos y con priorización de Fila 1 gratuita
  Dado que el motor agéntico o el usuario solicita una búsqueda de mercado o competidores
  Cuando el sistema ejecuta la investigación
  Entonces prioriza la Fila 1 (Brave Search freemium, DuckDuckGo, Scraping Local, INEGI DENUE, Banxico)
  Y solo recurre a la Fila 2 (Exa.ai, Perplexity Sonar) si la Fila 1 se agota o se configura explícitamente
  Y si no se localizan registros reales en internet
  Entonces las herramientas devuelven provenance: "not_found" sin inventar nombres ni métricas falsas
  Pero si el usuario activa deliberadamente la estimación heurística
  Entonces el sistema genera la proyección advirtiendo claramente con badge "synthetic_estimate"
  Y el bucle ReAct autónomo evalúa hasta 3 rondas y se detiene automáticamente al cumplir la meta o agotar las rondas.
```

## Escenario 8: Control Reactivo de Cuotas y Visualización de Procedencia en TerminalDrawer
```gherkin
Escenario: Pausa por cuota en Fila 1 y autorización inmediata desde la interfaz
  Dado que una investigación en ejecución alcanza el límite mensual gratuito de Brave Search (2,000 req) o Tavily (1,000 req)
  Y el usuario no ha autorizado la Fila 2 de pago (allowPaidTier = false)
  Cuando el servidor detecta el agotamiento de la cuota
  Entonces la tarea se transfiere a estado "paused_waiting_quota" sin fallar
  Y la consola TerminalDrawer despliega una tarjeta de alerta con dos opciones de resolución
  Y si el usuario presiona "💎 Autorizar Fila 2 (Pago)", el sistema activa allowPaidTier y reanuda la tarea en Exa/Perplexity
  Y si el usuario presiona "🦆 Usar DuckDuckGo (Gratis)", el sistema conmuta a DuckDuckGo y reanuda la tarea sin costo
  Y todas las fuentes recopiladas se muestran con su ProvenanceBadge (Factual Verificado / Hardware Local / Estimación / Sin Datos).
```

