# 🚀 RESUMEN EJECUTIVO Y HANDOVER DE CONTEXTO GLOBAL (Open Business Plan v2.6 / v3.0)

> **Documento de Transferencia Directa de Contexto para Continuar el Desarrollo en OpenCode, MimoCode, Claude Code, Cursor o Codex.**

---

## 📸 Logotipo e Identidad Visual del Proyecto

![Logotipo Oficial e Icono Favicon](file:///Users/robertoeduardocelisrobles/Documents/FT%20Apps/open-business-plan-v2.5.12.3/public/logo.png)

### 🎨 Concepto y Simbolismo del Logo
- **Nodos de Red Neural de IA (Mesa de Expertos Multi-Agente)**: Los puntos de luz interconectados representan la orquestación de agentes virtuales (Analista, Crítico, Estratega, Redactor).
- **Flecha de Crecimiento Financiero**: La trayectoria ascendente en gradiente azul y violeta refleja la corrida financiera a 5 años, el Análisis Monte Carlo y las métricas macroeconómicas de Banxico/INEGI.
- **Letras "O" y "P" (OpenPlan)**: Estructura geométrica minimalista integrada de manera futurista y ejecutiva.
- **Ubicación de Archivos de Imagen**:
  - Logotipo Principal: `public/logo.png`
  - Favicon de la App: `public/favicon.ico`

---

## 1. 📌 Visión General del Proyecto
**Open Business Plan (OpenPlan)** es un sistema de industrialización de planes de negocio alimentado por Inteligencia Artificial Multi-Agente local y en la nube. Permite formular proyectos bajo **12 metodologías internacionales** (Comercial, Social BID, Lean Canvas, Pitch Deck, FAPPA, PROMETE, etc.), integrando scraping local de competidores (DENUE/INEGI, MercadoLibre, UberEats, Airbnb), simulación estocástica Monte Carlo a 10,000 iteraciones y exportación en JSON/Markdown/PDF.

---

## 2. 🛡️ Rieles de Desarrollo y Reglas Globales (MANDATORIAS)

Cualquier agente de IA (OpenCode, Cursor, Claude Code, Codex, Roo, Antigravity) que continúe el proyecto **DEBE ADHERIRSE ESTRICTAMENTE A LAS SIGUIENTES REGLAS**:

1. **🧩 Regla Estricta de Código Completo (SIN FRAGMENTAR)**:
   - Al modificar cualquier archivo, debes proporcionar **SIEMPRE la función, hook o componente COMPLETO de principio a fin** (desde la declaración `function...` hasta su llave de cierre `}`).
   - **PROHIBIDO** entregar fragmentos sueltos, recortes o comentarios del tipo `// ... resto del código` dentro de bloques lógicos.

2. **🌐 Idioma y Estilo**:
   - **Comentarios y Documentación:** Todos los comentarios de código, docstrings y explicaciones técnicas en JS, JSX, TS, PY, etc., deben escribirse en **español**.
   - **Interfaz (Frontend):** Todos los textos visibles para el usuario deben estar redactados en **español neutro premium**.

3. **🎯 Flujos SDD / TDD / BDD**:
   - **SDD (Spec-Driven Development):** Diseñar las especificaciones en documentos vivos antes de codificar grandes refactorizaciones.
   - **TDD (Test-Driven Development):** Escribir/mantener pruebas unitarias para el motor financiero (`calculadoraFinanciera.js`) y `PlanContext.jsx`.
   - **BDD (Behavior-Driven Development):** Mapear los casos de uso a escenarios de usuario.

4. **🚀 Sincronización Proactiva Git**:
   - Al finalizar y verificar los cambios con `npm run build`, ejecutar la sincronización mediante:
     ```bash
     ./git_sync.sh "Mensaje descriptivo del ajuste en español"
     ```

---

## 3. 👥 Usuarios Maestros y Estructura de Aislamiento de Datos

### Usuarios Administradores (Super-Users)
- **`admin`** y **`roberto`** son usuarios maestros del sistema.
- Tienen privilegios para listar, escanear y visualizar los planes de negocio creados por todos los sub-usuarios en `proyectos/`.

### Estructura de Proyectos en Disco Duro Local
Los archivos de proyecto se persisten automáticamente en `proyectos/`:
```text
proyectos/
├── negocios/
│   ├── user_roberto/
│   │   └── agror_o_capital/
│   │       ├── agror_o_capital.json
│   │       └── agror_o_capital.md
│   └── cibercafe_social.json
└── social/
    └── user_admin/
        └── expediente_medico_ia/
            ├── expediente_medico_ia.json
            └── expediente_medico_ia.md
```

---

## 4. 🧠 Arquitectura de IA (Mesa de Expertos & Fallback)

La orquestación de IA reside en `src/lib/ai.js` y el servidor proxy `server/index.js`.

### Niveles de Profundidad de Agentes:
1. **Nivel 1 (Rápido)**: 2 Agentes (Analista → Redactor). ~30-60s.
2. **Nivel 2 (Pro - Predeterminado)**: 3 Agentes (Analista → Crítico → Redactor). ~2-4 min.
3. **Nivel 3 (Profundo)**: 5 Agentes + Devil's Advocate. ~8-15 min.
4. **Nivel 4 (Industrial)**: 9 Agentes en cadena de revisión. ~20 min.

### Secuencia de Fallback de Modelos de IA:
1. **Modelo Local Principal (Ollama / LM Studio)**: `qwen3.5:9b`, `gemma4:12b`, `gemma4:pro`.
2. **Modelos Locales de Respaldo**: Fallback automático en caso de falta de VRAM o fallo de invocación.
3. **Nube (NVIDIA NIM)**: `nvidia/llama-3.1-nemotron-70b-instruct` (vía `nvidiaKey`).
4. **Nube Alternativa**: Groq (`llama-3.3-70b`), Google Gemini API, OpenAI (`gpt-4o`).

---

## 5. 💻 Despliegue e Instalación Automatizada en Windows / Mac / Linux

### Entorno Windows
Se creó el instalador y configurador automatizado integral:
- **`install_windows.bat`**:
  1. Detecta si **Node.js** está en el PATH. Si falta, ejecuta `winget install OpenJS.NodeJS.LTS`.
  2. Ejecuta `npm install` de dependencias core.
  3. Ejecuta `npx puppeteer install` para descargar Chromium nativo para scraping.
  4. Detecta si **Ollama** está en el PATH. Si falta, ejecuta `winget install Ollama.Ollama`.
  5. Genera el acceso directo en el Escritorio.
- **`start_open_plan.bat`**: Inicia automáticamente `install_windows.bat` en primera ejecución, levanta `activar_cerebro.bat`, lanza el servidor backend (puerto 3001) y abre la interfaz Vite (puerto 5173).
- **`activar_cerebro.bat`**: Verifica el servicio local Ollama (`ollama serve`) y aprovisiona modelos base.

### Compilación de Empaquetado Electron (Instaladores Nativos)
En `package.json` se cuenta con los siguientes scripts de empaquetado:
```bash
# Compilar ejecutable de instalación para Windows (.exe con NSIS)
npm run electron:build:win

# Compilar para macOS (.dmg)
npm run electron:build:mac

# Compilar para Linux (.AppImage / .deb)
npm run electron:build:linux

# Compilar instaladores para todas las plataformas
npm run electron:build:all
```

---

## 6. 🔄 Resumen de los Últimos Ajustes del Proyecto (Bitácora)

1. **Reparación del Instalador de Windows**:
   - Se configuró el objetivo `win` y `nsis` en `package.json` para permitir a los usuarios instalar el programa mediante un asistente ejecutable de 1-clic con accesos directos.
2. **Verificación de Node.js, Puppeteer y Ollama**:
   - Automatización de comprobaciones y auto-instalación por `winget`.
3. **Identidad Visual**:
   - Creación del logotipo e icono favicon oficial en `public/logo.png` y `public/favicon.ico`.
4. **Compilación Limpia**:
   - Verificado con `npm run build` (2,069 módulos transformados sin errores en 2.21s).
5. **Migración a IA Local-First (11/08/2026)**:
   - Default de proveedor cambiado de Gemini (nube) a **Ollama (local)** con modelo `qwen3.5:9b`.
   - Modelo principal instalado: `qwen3.5:9b` (9.7B, Q4_K_M, 6.6GB) + `gemma4:12b` (12B, 7GB).
   - Resolución de modelo genérico (ej. `nemotron`) ahora fallbacka inteligentemente al mejor modelo instalado.
6. **Bug GEMINI Corregido (11/08/2026)**:
   - `extractSeedFromText` y `askFieldDoubt` ahora usan `resolveProviderModel()` que garantiza coherencia proveedor/modelo (nunca envía un modelo local a la nube).
   - Errores de IA ahora incluyen el error real + `cause` para debugging.
7. **Auto-Retry por Límite de Tokens (11/08/2026)**:
   - `fetchWithRetry()` implementa reintento automático con backoff exponencial en HTTP 429.
   - Soporta headers `Retry-After` y logging al ActivityFeed.
   - Cubre todos los proveedores de nube: Gemini, Groq, NVIDIA, OpenAI, Mistral.
8. **Lint 0/0 (11/08/2026)**:
   - 7 errores corregidos + 184 warnings limpiados en ~30 archivos.
   - `npm run lint` → 0 errores, 0 warnings.
   - `npm test` → 12/12 tests verdes.
   - `npm run build` → 100% exitoso (6.64s).
9. **Documentación Actualizada (11/08/2026)**:
   - Nuevo `docs/FUNCIONAMIENTO_IA.md`: documentación completa del motor de IA.
   - Actualización de `RESUMEN_EJECUTIVO` con bitácora de fixes.

---

## 7. 🚀 Instrucciones para Continuar el Proyecto en Cualquier IDE / IA

1. **Abrir el Espacio de Trabajo**:
   - Cargar la carpeta `/Users/robertoeduardocelisrobles/Documents/FT Apps/open-business-plan-v2.5.12.3`.
2. **Iniciar Entorno Dev**:
   ```bash
   npm run start
   # o en electron:
   npm run electron:dev
   ```
3. **Cargar este Documento de Contexto**:
   - Indicar a la IA de soporte (OpenCode, Cursor, MimoCode, Claude Code) que lea `RESUMEN_EJECUTIVO_Y_HANDOVER_CONTEXTO.md` para seguir respetando los patrones de diseño y reglas de entrega de código completo.
