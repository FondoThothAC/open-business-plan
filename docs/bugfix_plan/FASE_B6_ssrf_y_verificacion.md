# FASE B6 — SSRF en scraper, rate limiter y verificación final (Medio)

> Goal autocontenido. Proyecto: OBP. Antes de empezar: rama `fix/fase-b6` y `npm test` en verde. Esta fase cierra el plan: al final, verificación global.

## Objetivo
Cerrar el SSRF del scraper, arreglar el rate limiter y ejecutar la verificación integral del plan completo (B1–B6).

## Bugs a corregir (auditoría 12-oct-2026)

**1. SSRF en scraper** — `server/scraper.js` ~14-57 (y las demás funciones del archivo): `puppeteer.launch()` fuera del try (si `browser.close()` del try lanza, el catch reintenta cerrar y puede tragar el error original dejando Chromium huérfano); y las rutas `/api/scrape/social` y `/api/market/enrich` (`server/index.js` ~2711, ~3395) pasan URLs de usuario directo a `page.goto()` sin restricción de esquema/host → SSRF a servicios internos y `file://`.

**2. Rate limiter DDG inútil bajo concurrencia** — `server/index.js` ~69-78: `ultimaPeticionDdg` se comprueba y se asigna DESPUÉS del `await`; N llamadas concurrentes pasan juntas el check y disparan N peticiones simultáneas a DuckDuckGo.

## Instrucciones
1. **Scraper:** (a) mover `puppeteer.launch()` dentro del try; en `finally`, cerrar el browser con guard (`if (browser && browser.isConnected?.()) await browser.close().catch(()=>{})`) sin enmascarar el error original; (b) crear un validador de URL usado antes de todo `page.goto`: solo `http:`/`https:`, y resolver el host rechazando IPs privadas/loopback/link-local (127.0.0.0/8, 10/8, 172.16/12, 192.168/16, 169.254/16, ::1, fc00::/7) y `localhost` — tanto si el host YA es una IP como resolviendo DNS y re-validando las IPs resultantes antes de navegar.
2. **Rate limiter:** asignar el timestamp ANTES del `await` (reservar el turno), o serializar las llamadas con la misma cola single-flight de la Fase B3. Con N requests simultáneas, deben salir espaciadas al intervalo mínimo exigido.
3. Tests de regresión: `goto` con `file:///etc/passwd` → rechazado; URL con host `127.0.0.1`/`192.168.x` → rechazada; (rate limiter: 3 llamadas concurrentes → la 2ª y 3ª esperan, verificable con timers o mock).
4. **Verificación integral final del plan B1–B6:**
   - `npm test` completo en verde (suite original + todos los tests de regresión añadidos en B1–B6).
   - `npx eslint src server` → 0 errores (quedaron 6 `no-useless-assignment` al inicio del plan; los de B5 resueltos, revisar los demás).
   - `/ultra-review` sobre el diff completo de las ramas (`git diff main...`) → sin hallazgos críticos abiertos.
   - Smoke manual: levantar server (`npm run dev` o el script usado), login, guardar proyecto, guardar logo, abrir módulo financiero y el simulador Monte Carlo — sin errores en consola del navegador ni del server.
   - Resumen final: tabla de bugs corregidos por fase con su commit.

## Criterio de aceptación (goal completado cuando…)
- [ ] `page.goto` inalcanzable con esquemas no http(s) o hosts internos (tests en verde).
- [ ] Browser de Puppeteer siempre cerrado en `finally` sin tragar errores.
- [ ] Rate limiter serializa peticiones concurrentes.
- [ ] Suite completo verde + eslint sin errores + ultra-review limpio + smoke manual sin errores.
- [ ] Tabla final bug → fase → commit entregada en la respuesta del goal.
