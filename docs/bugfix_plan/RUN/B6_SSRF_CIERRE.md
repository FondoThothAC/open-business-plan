# B6 · SSRF en el scraper, rate limiter y verificación integral — **Medio (cierra el plan)**

> **Antes de tocar nada:** leer [`00_CONTEXTO.md`](00_CONTEXTO.md) (§0.8 aislamiento, §0.11 qué no se toca, §0.13 otra máquina, §0.10 **corrección 3**). Rama `fix/fase-b6` desde `main` (con B1–B5 mergeados). Esta fase queda al final porque su paso 8 es la verificación global del plan.

**Objetivo:** que ninguna URL de usuario llegue a `page.goto()` apuntando a servicios internos, que el browser de Puppeteer siempre se cierre, que las llamadas concurrentes a DuckDuckGo realmente se espacen, y cerrar el plan con verificación integral.

---

## Qué está mal, verificado hoy

| # | Hallazgo | Evidencia |
|---|---|---|
| 1 | En los 5 exports de `server/scraper.js`, `puppeteer.launch()` está **fuera** del `try`, y el `catch` vuelve a cerrar **sin guard** y reconstruye el retorno desde `e.message` → si `browser.close()` falla, la función rechaza y se pierde el error original; si no falla pero el launch se completó, queda Chromium huérfano | launch en L14, L62, L107, L139, L168; close de éxito en L52/97/129/158/186; close sin guard en el catch en L55-56, L100-101, L132-133, L161-162, L189-190 |
| 2 | `POST /api/scrape/social` solo comprueba que `url` sea truthy y la pasa directo a `scrapeSocialFollowers` → `file:///etc/passwd`, `http://169.254.169.254` y `http://127.0.0.1:9229` alcanzan `page.goto` | `server/index.js:2711-2720`; goto en `scraper.js:18, 66, 111` |
| 3 | `/api/market/enrich` filtra los resultados de DuckDuckGo por **substring**, así que `https://127.0.0.1:9229/?x=facebook.com` pasa el filtro y llega a `page.goto` (vía `Promise.all` en L3457). Es exposición indirecta (hay que influir en los resultados de búsqueda), pero el mismo hueco | `index.js:3376-3384` |
| 4 | Rate limiter DDG: **la ficha se equivoca** — el timestamp sí se asigna antes del `await` (L78; el await real es L81). El defecto es de concurrencia: K llamadas leen `ultimaPeticionDdg` (L74), calculan el mismo `tiempoDesdeUltima`, duermen juntas (L76), despiertan juntas y todas estampan → solo espacia llamadas secuenciales | `index.js:69-93`, `INTERVALO_MINIMO_DDG_MS = 1200` |
| 5 | No existe un validador de URLs compartido. Hay dos precedentes **no reutilizados**: `new URL()` + protocolo + regex de IPs privadas en `server/api/perplexitySearchEngine.js:24-25`, y el allowlist de hosts del proxy en `index.js:3523-3531` | — |

`ipaddr.js` está en `node_modules` pero **solo transitivamente** (vía `proxy-addr` ← `express`): importarlo sería una dependencia fantasma. Usar `node:dns`, que es builtin y no instala nada.

---

## Pasos

### 1 · `server/urlSafety.js` (nuevo)

```
export async function assertSafeExternalUrl(raw)   // lanza Error('URL no permitida.')
export function isSafeUrlShapeSync(raw)             // misma validación SIN resolver DNS (para redirects)
```

Exporta **las dos**: el paso 4 necesita una variante síncrona porque el listener de `page.on('request')` de Puppeteer no puede awaitear una resolución de DNS. `isSafeUrlShapeSync` cubre esquema, userinfo, puerto, IP literal privada y nombres `localhost`/`.local`/`.internal`; deja para la versión async el extra de resolver DNS.

Comportamiento, en orden:

1. `new URL(raw)` — si lanza → no permitida.
2. Protocolo ∈ `{http:, https:}` (esto ya mata `file:`).
3. Sin `userinfo` (`url.username`/`password` vacíos) y puerto ∈ `{80, 443}` por defecto; rechazar puertos arbitrarios (el `9229` del DevTools de Chromium es el caso concreto que hay que bloquear).
4. Si el hostname es IP literal: validar contra v4 `0/8, 10/8, 100.64/10, 127/8, 169.254/16, 172.16/12, 192.0.2/24, 192.168/16, 198.18/15, 203.0.113/24, 224/4, 240/4` y v6 `::1, ::, fc00::/7, fe80::/10, ff00::/8`, más las v4-mapeadas. Rechazar `localhost` y cualquier nombre que termine en `.local`/`.internal`.
5. Si es hostname: `dns.lookup(hostname, { all: true, verbatim: true })` (`node:dns`) y **re-validar cada IP devuelta** contra la misma lista. Si cualquier respuesta es privada → rechazar.

Mensaje de error uniforme y 400 en la ruta. No exponer en la respuesta si el fallo fue "es privada" vs "no resuelve" (evita el oráculo de reconocimiento interno).

### 2 · Dónde llamarlo

- **En la entrada de la ruta** `POST /api/scrape/social` (`index.js:2711`) → 400 rápido **sin levantar Chromium**. Esto es lo que hace que los tests de B6 no necesiten navegador.
- **Al inicio de las tres funciones que reciben URL** en `server/scraper.js` (L14, L62, L107) → cuello de botella único para los llamadores futuros (`index.js:3395-3437` también las usa).
- Las otras dos (`scrapeMercadoLibre` L139, `scrapeEcommercePrices` L168) construyen URLs internas con `encodeURIComponent(keyword)`: no son SSRF, pero pasarles el validador igualmente es defensa en profundidad y no cuesta.

### 3 · Ciclo de vida del browser en los 5 exports

```js
let browser;
try {
  browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  …
} catch (e) {
  return { success: false, error: e.message };   // mismo shape que hoy
} finally {
  if (browser) await browser.close().catch(() => {});
}
```

El `catch` **no** cierra el browser (lo hace el `finally`) y el retorno sigue armandose con el error original. Mantener la forma de la respuesta (`{ success, error }`) idéntica: el frontend la consume.

### 4 · Redirects

Puppeteer sigue redirecciones, así que la validación previa no cubre un `https://dominio-publico.com → 302 → http://169.254.169.254`. Agregar en cada página:

```js
await page.setRequestInterception(true);
page.on('request', (req) => {
  if (['main','sub_frame','xhr','fetch'].includes(req.resourceType()) && !isSafeUrlShapeSync(req.url())) req.abort();
  else req.continue();
});
```

Revalidar **síncronamente** no resuelve DNS; para eso hay dos opciones y hay que elegir una y documentarla: (a) revalidar esquema/host/puerto/IP-literal de forma síncrona y aceptar la ventana de DNS rebinding, o (b) fijar `--host-resolver-rules` al launch. **(a) es la que se hace aquí** (~15 líneas, coste irrelevante contra el timeout de 20 s) y la ventana residual se documenta en el código. No prometas lo que no cubres.

### 5 · Arreglar el filtro de `/api/market/enrich`

`index.js:3376-3384`: comparar `new URL(item.url).hostname` contra el dominio exacto (`facebook.com` o sufijo `.facebook.com`) en lugar de `url.includes('facebook.com')`, además del validador del paso 1 antes de encolar el `goto`.

### 6 · Cola serial para DDG

`server/serialQueue.js` (nuevo):

```
export function createThrottledQueue({ intervalMs })  // => { run(fn) }
```

`run(fn)` encadena: `cola = cola.then(() => espera(restante)).then(() => { ultima = Date.now(); return fn(); })`. Reescribir `safeDdgSearch` (`index.js:69-93`) para usar la cola de `server/ddgLimiter.js` **conservando su firma y su contrato de retorno**: hoy devuelve un **arreglo** (`respuesta.results || []` en L82, y `[]` en el camino de error L91), **no** un objeto `{results}` — no cambies la forma o rompes los 10 call sites: L2242, L2283, L2326, L2345, L2385, L2404, L2449, L2464, L2579 y L3358. Conserva también el retry cuando el mensaje contiene `"too quickly"` (L85-89, con su pausa de 2500 ms) y el `console.warn` de fallo (L90).

No se intenta compartir esta cola con B3: B3 eligió permanecér síncrono a propósito (§0.10.1). Y **no** se instala `express-rate-limit` (dependencia nueva de producción); queda como follow-up acotado a `/api/auth/login`.

### 7 · Tests nuevos — `tests/urlSafetyAndRateLimit.test.js`

Sin Chromium y sin red real. **Ojo: el repo no tiene framework de mocks y en ESM no se puede parchar un namespace importado** (`node:test` tiene `mock`/`t.mock` para funciones propias, pero no para `import puppeteer from 'puppeteer'`), así que estos tests se escriben contra las unidades, no interceptando imports:

- `assertSafeExternalUrl('file:///etc/passwd')` → rechaza (protocolo).
- `'http://127.0.0.1:9229/'`, `'http://192.168.1.10/'`, `'http://169.254.169.254/latest/meta-data/'`, `'http://[::1]/'` → rechazan (IP literal, sin tocar DNS).
- `'http://ejemplo.internal/'` y `'http://localhost:3001/'` → rechazan por nombre.
- Un host que resuelve a IP privada: exporta el chequeo de rango como función propia (`esIpPrivada(ip)`) y pruébala directo con las IPs de una lista fija — no hace falta mock de `dns.lookup`.
- `createThrottledQueue({ intervalMs: 1200 })` con `run()` invoked 3 veces sobre una función stub propia (`async () => marca.push(Date.now())`) → las tres marcas salen separadas ≥1200 ms. **Este test prueba la cola, no `safeDdgSearch`**, y no requiere red.
- `POST /api/scrape/social` con `url: 'file:///etc/passwd'` → **400**. Como la validación va en la entrada de la ruta (paso 2), `puppeteer.launch()` nunca se alcanza: el test es verde sin navegador y sin mock. Verifica además que la respuesta llega en <1 s (evidencia de que no se lanzó Chromium).
- `isSafeUrlShapeSync('https://169.254.169.254/…')` → false (el guardia de redirects).
- El filtro de dominios del paso 5, probado como función pura: `extraerPerfil(item)` con `https://127.0.0.1:9229/?x=facebook.com` → no produce perfil `facebook`.

### 8 · Verificación integral del plan B1–B6

```bash
cp -a server/data /tmp/obp-data-bak-final          # 00_CONTEXTO.md §0.8
npm test                                           # suite completo, original + regresiones de B1–B6
npx eslint src server tests                        # objetivo: 0 errores
git diff --stat main...                            # ¿qué tocaron realmente las 6 ramas?
```

Review de solo lectura sobre el diff **completo** (`git diff main...` antes del último merge), con instrucciones explícitas de no editar, buscando: rutas que aún construyan paths con input crudo, cambios de contrato de respuesta, 401/403/404 nuevos para usuarios autenticados, y escrituras fuera de `proyectos/`.

Smoke manual en **local** (nunca contra producción) con navegador: login → guardar proyecto → guardar logo → abrir módulo financiero (incluido el `postMessage` incompleto de B4) → Monte Carlo arrastrando sliders → entrevista swarm → `POST /api/scrape/social` con una URL pública real y con `file://`. Esperado: cero errores en consola del navegador y cero errores en la salida del server.

Restaurar datos al terminar: `rm -rf server/data && cp -a /tmp/obp-data-bak-final server/data`.

---

## Criterio de aceptación

- [ ] `page.goto` inalcanzable con esquemas no-http(s) o hosts internos (tests en verde).
- [ ] El browser de Puppeteer siempre se cierra en `finally` y el error original no se traga.
- [ ] El limiter serializa: 3 llamadas concurrentes salen a ≥1200 ms entre sí.
- [ ] Suite completo verde, `eslint` 0 errores, review del diff completo sin hallazgos críticos.
- [ ] Smoke local sin errores de consola, con la evidencia (texto de consola o captura) en la respuesta.
- [ ] **Tabla final bug → fase → commit** entregada en la respuesta, con SHA corto por fase.
- [ ] En la misma tabla: qué quedó **sin verificar** porque requiere el VPS — los valores reales de `DENUE_KEY`/`INEGI_KEY` y que el enriquecimiento INEGI vuelva a responder contra la API de INEGI. Eso es trabajo del dueño (§0.14).

**Mensaje de commit:** `B6: validador de URL para el scraper, cola serial DDG y verificacion integral` — cuerpo: la corrección factual del limiter (el bug era concurrencia, no el orden del `await`), la ventana de DNS rebinding aceptada y por qué, y la tabla de verificación global.
