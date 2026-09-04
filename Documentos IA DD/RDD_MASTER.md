# RDD MASTER — Readme-Driven Development & Guía del Desarrollador
**Proyecto:** Open Business Plan  

---

## 1. Inicio Rápido para Desarrolladores

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar entorno de desarrollo (Frontend + Backend concurrentes)
npm start

# 3. Ejecutar suite completa de pruebas unitarias
npm test

# 4. Compilar para producción
npm run build
```

---

## 2. Variables de Entorno Opcionales (`.env.local`)

* `VITE_GROQ_KEY`: Clave o lista de claves de Groq separadas por comas.
* `VITE_GEMINI_KEY`: Clave o lista de claves de Google Gemini.
* `VITE_OPENROUTER_KEY`: Clave de OpenRouter (capa free/paid).
* `VITE_NVIDIA_KEY`: Clave de NVIDIA NIM.
* `VITE_DENUE_KEY`: Token de consulta a la API de INEGI DENUE.
* `BRAVE_SEARCH_KEY`: Clave de Brave Search API (Fila 1 Freemium, 2,000 req/mes).
* `TAVILY_API_KEY`: Clave de Tavily AI Search (Fila 1 Freemium, 1,000 req/mes).
* `EXA_API_KEY`: Clave de Exa.ai Neural Search (Fila 2 Premium).
* `PERPLEXITY_API_KEY`: Clave de Perplexity Sonar (Fila 2 Premium).
