/**
 * [C1] Limitador de intentos en memoria con ventana fija.
 *
 * Por qué en memoria: PM2 corre con `instances: 1` (ecosystem.config.cjs), así que un solo
 * proceso ve todo el tráfico y no hace falta Redis. Si algún día se escala a varias
 * instancias, este contador deja de ser global y habrá que externalizarlo.
 *
 * Contrato:
 *  - check(key): consulta SIN contar → { allowed, retryAfterSec, remaining }
 *  - hit(key):   cuenta un intento → mismo contrato
 *  - reset(key): borra el contador (p. ej. tras un login exitoso)
 *  - size():     claves vivas (para pruebas y diagnóstico)
 */
export function createRateLimiter({ windowMs, max, now = Date.now, maxKeys = 10000 }) {
  /** @type {Map<string, { count: number, resetAt: number }>} */
  const entradas = new Map();

  function purgar(ahora) {
    for (const [clave, entrada] of entradas) {
      if (entrada.resetAt <= ahora) entradas.delete(clave);
    }
    // Si tras purgar sigue lleno (ataque con muchas IPs distintas) se descartan las más
    // antiguas: Map conserva el orden de inserción, así que basta borrar desde el inicio.
    while (entradas.size >= maxKeys) {
      const primera = entradas.keys().next().value;
      if (primera === undefined) break;
      entradas.delete(primera);
    }
  }

  function estado(entrada, ahora) {
    if (!entrada || entrada.resetAt <= ahora) {
      return { allowed: true, retryAfterSec: 0, remaining: max };
    }
    const restante = Math.max(0, max - entrada.count);
    return {
      allowed: entrada.count < max,
      retryAfterSec: entrada.count < max ? 0 : Math.max(1, Math.ceil((entrada.resetAt - ahora) / 1000)),
      remaining: restante
    };
  }

  return {
    check(clave) {
      return estado(entradas.get(clave), now());
    },
    hit(clave) {
      const ahora = now();
      let entrada = entradas.get(clave);
      if (!entrada || entrada.resetAt <= ahora) {
        if (entradas.size >= maxKeys) purgar(ahora);
        entrada = { count: 0, resetAt: ahora + windowMs };
        entradas.set(clave, entrada);
      }
      entrada.count += 1;
      return estado(entrada, ahora);
    },
    reset(clave) {
      entradas.delete(clave);
    },
    size() {
      return entradas.size;
    }
  };
}
