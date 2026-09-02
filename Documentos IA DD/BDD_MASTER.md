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
