# FASE B2 — Credencial embebida y endpoints públicos que gastan cuota (Crítico)

> Goal autocontenido. Proyecto: OBP. Antes de empezar: rama `fix/fase-b2` y `npm test` en verde.

## Objetivo
Quitar la API key hardcodeada y cerrar los endpoints públicos que permiten usar (y agotar) las credenciales del servidor sin autenticación.

## Bugs a corregir (auditoría 12-oct-2026)

**1. API key DENUE/INEGI embebida** — `server/index.js` ~línea 118: `resolveInegiToken` devuelve como último fallback la key literal `'1b9e230f-...'` en el código fuente. Fuga de credencial para cualquiera con acceso al repo.

**2. `/api/ai/account-chat` pública** — `server/middleware/authGuard.js` ~líneas 23-24 la marca pública, y en `server/index.js` ~402-406 el handler cae a `process.env.OLLAMA_KEY` si el request no trae key: un atacante sin cuenta invoca el LLM con `maxTokens` hasta 16384 y quema la cuota del servidor. `/api/swarm/interview` y `/api/swarm/industrialize` están igual de públicas y disparan orquestaciones multi-agente de costo alto.

**3. `express.json({ limit: '100mb' })`** — `server/index.js` ~línea 147: aceptar bodies de 100 MB en todas las rutas habilita agotamiento de memoria (DoS) trivial.

## Instrucciones
1. **Key embebida:** eliminar la key literal de `resolveInegiToken`; leerla solo de `process.env` (p. ej. `DENUE_TOKEN` o `INEGI_TOKEN`, conservar el nombre de variable que ya use si existe). Si no hay variable y no hay key del usuario → devolver error explícito de configuración (no fallback silencioso). Documentar la variable en el README de deploy (`deploy/`, `deploy_vps.sh` o `.env.example` si existe). La key ya expuesta debe considerarse comprometida: anotar en el commit que hay que rotarla en el portal INEGI.
2. **Endpoints de IA:** sacar `/api/ai/account-chat` de la lista pública de `authGuard.js` (requiere sesión). Para swarm: requerir sesión en `/api/swarm/interview` e `/api/swarm/industrialize`. El fallback a `process.env.OLLAMA_KEY` debe aplicarse solo a usuarios autenticados con permiso (o eliminarse si la política es BYO-key — decidir lo conservador: solo autenticados).
3. **Body limit:** bajar el global a `1mb` y poner límites específicos mayores SOLO en las rutas que lo necesiten de verdad (p. ej. `/api/logo/save` con dataUrl, y guarda de proyectos con documentos embebidos: medir el payload máximo real y poner ese valor + margen, p. ej. `25mb` en esas rutas con `express.json({limit})` por ruta). Verificar con un guardado real de proyecto que nada se rompe.
4. Tests de regresión: request sin sesión a `/api/ai/account-chat` → 401; body de >1mb a una ruta genérica → 413; logo save con dataUrl grande sigue funcionando.

## Criterio de aceptación (goal completado cuando…)
- [ ] `grep -rn "1b9e230f" server/ src/` no devuelve nada.
- [ ] Sin sesión: `/api/ai/account-chat` y swarm → 401 (test en verde).
- [ ] Body >1mb en ruta genérica → 413; las rutas con payload grande documentadas con su límite.
- [ ] Guardar proyecto y logo funciona end-to-end después del cambio.
- [ ] `npm test` en verde y `/ultra-review` limpio en los cambios. El commit menciona rotar la key INEGI.
