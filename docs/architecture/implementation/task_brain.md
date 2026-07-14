# Tareas Pendientes — Open Business Plan v3.0

> Última actualización: 2026-06-15 22:40 CST

---

## 🔴 Pruebas de Frontend Pendientes

- `[ ]` **Botón Bloqueo de Módulo (Lock)** — Verificar que al hacer clic en el candado de un campo, el campo se bloquee y no se sobreescriba durante la industrialización IA.
- `[ ]` **Botón "Redactar con IA"** — Confirmar que el botón de generación individual por campo funciona correctamente en cada tipo de módulo (texto, FODA, PESTEL, Canvas).
- `[ ]` **Botón "Re-escribir con instrucciones"** — Probar que el usuario pueda dar instrucciones específicas para re-generar un campo ya lleno.
- `[ ]` **Bloque de Módulo completo** — Verificar que el sistema pueda generar un módulo entero (todos sus campos) con un solo clic desde el sidebar.
- `[ ]` **Botón "Industrializar Plan Completo"** — Probar la cola de generación secuencial de todos los módulos del framework seleccionado.
- `[ ]` **Pausar / Reanudar Industrialización** — Validar los controles de pausa y reanudación durante el proceso de generación masiva.
- `[ ]` **Vista Previa / Exportación PDF** — Verificar que `VistaPrevia.jsx` renderice correctamente todos los módulos llenos y permita exportar.

---

## 🟡 Verificación de Componentes Nuevos (v3.0)

- `[x]` **MonteCarloSimulator.jsx** — Histograma bicolor + cono de incertidumbre ✅ Funciona
- `[x]` **MacroDashboard.jsx** — Sparklines SVG + datos Banxico ✅ Funciona
- `[x]` **Sincronizar Finanzas (Banxico → WACC)** — ✅ Funciona
- `[x]` **Redactar Factor Económico PESTEL** — ✅ Funciona
- `[x]` **OrganigramaInteractivo.jsx** — Drag-and-drop ReactFlow ✅ Funciona
- `[ ]` **Anteproyecto.jsx** — Verificar flujo completo de vaciado de cerebro → semilla
- `[ ]` **Cambio de Framework** — Probar que al cambiar de "Comercial" a otro framework, el sidebar y módulos se actualicen correctamente sin pérdida de datos.
- `[ ]` **12 Frameworks renderizando** — Navegar por cada uno de los 12 frameworks y verificar que todos los módulos se cargan sin errores de consola.

---

## 🟢 Verificación de Infraestructura

- `[x]` **Servidor Backend v2** — Express arranca en puerto 3001 ✅
- `[x]` **Proxy Banxico SieAPI** — Endpoint `/api/banxico/indicators` responde ✅
- `[ ]` **Ruta de test INEGI** — Verificar `/api/test/inegi` devuelve `success: true`
- `[ ]` **Ruta de test Banxico** — Verificar `/api/test/banxico` devuelve `success: true`
- `[ ]` **Ruta de test Tavily** — Verificar `/api/test/tavily` devuelve `success: true`
- `[ ]` **Fallback de APIs** — Desconectar internet y verificar que los mocks de respaldo responden correctamente con `isFallback: true`.

---

## 🔵 Tareas de Documentación Completadas (v3.0)

- `[x]` **README.md** — Reescrito completo para v3.0 con diagramas Mermaid, inventario de componentes y tablas de pruebas.
- `[x]` **package.json** — Versión actualizada a `3.0.0`.
- `[x]` **docs/DIAGRAMA_FLUJO_METODOS.md** — Copiado al proyecto (diagrama del embudo de industrialización de 12 métodos).
- `[x]` **docs/MATRIZ_MODULOS.md** — Copiado al proyecto (matriz cruzada de módulos × frameworks con expectativa de longitud).
- `[x]` **docs/COMPARATIVA_METODOS.md** — Copiado al proyecto (comparativa detallada de los 5 primeros métodos).
- `[x]` **docs/METODOLOGIAS_DESARROLLO.md** — Ya existía, documenta las 9 metodologías de desarrollo.
- `[x]` **docs/Operations_Integration_SDD.md** — Ya existía, SDD del módulo de operaciones.
- `[x]` **docs/SDD.md** — Ya existía, arquitectura general.
- `[x]` **docs/TDD.md** — Ya existía, estrategia de pruebas.
- `[x]` **docs/BDD.md** — Ya existía, escenarios de usuario.

---

## 📝 Prompts para Próximas Sesiones

### Prompt 1: Pruebas de Frontend E2E
```
Levanta el servidor con `npm start` y usa el browser subagent para:
1. Navegar a cada módulo del framework "Comercial" y verificar que renderiza sin errores.
2. Probar el botón de bloqueo (candado) en 3 campos diferentes.
3. Probar el botón "Redactar con IA" en un campo vacío.
4. Anotar ✅ o ❌ para cada prueba en la tabla del README.
```

### Prompt 2: Pruebas de Industrialización
```
Carga el proyecto ejemplo "MexiTaco Europe" y ejecuta la industrialización completa.
Verifica:
1. Que la cola de generación arranca y procesa todos los módulos en secuencia.
2. Que el botón "Pausar" detiene la generación sin corromper datos.
3. Que "Reanudar" continúa desde donde se quedó.
4. Que los campos bloqueados NO se sobreescriben.
```

### Prompt 3: Pruebas de los 12 Frameworks
```
Cambia el framework activo de "Comercial" a cada uno de los 12 disponibles.
Para cada framework:
1. Verifica que el sidebar se actualiza con los pilares y módulos correctos.
2. Navega al primer módulo y confirma que renderiza campos vacíos.
3. Verifica que no hay errores en la consola del navegador.
Tabla de resultados: Framework | Sidebar ✅/❌ | Módulos ✅/❌ | Errores ✅/❌
```

### Prompt 4: Exportación y Vista Previa
```
Con un plan parcialmente lleno (al menos 5 módulos con contenido):
1. Navega a "Vista Previa" y verifica que renderiza todas las secciones.
2. Prueba la exportación a PDF si está implementada.
3. Verifica que los gráficos (Monte Carlo, FinancialCharts) se renderizan en la vista previa.
```

### Prompt 5: Validación de APIs
```
Desde el panel de Configuración, prueba cada API externa:
1. INEGI/DENUE → Buscar establecimientos en Hermosillo
2. Banxico → Cargar indicadores macroeconómicos
3. Ollama → Verificar conexión con modelos locales
4. Tavily → Ejecutar búsqueda web de prueba
Anotar resultados en la tabla de APIs del README.
```

---

## 🏗 Próximos Hitos (Roadmap v3.1)

- `[ ]` Exportación PDF con branding corporativo (F07)
- `[ ]` Integración DENUE/INEGI en producción (F08)
- `[ ]` Colaboración multi-usuario (F09)
- `[ ]` Suite de pruebas E2E con Playwright
- `[ ]` Internacionalización (i18n)
- `[ ]` WACC automatizado con Yahoo Finance API
- `[ ]` Tablas de amortización dinámicas

---

*Generado para FondoThothAC — Open Business Plan v3.0*
