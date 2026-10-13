/**
 * [B6] Cola serial con intervalo mínimo.
 *
 * Motivo: el limiter de DuckDuckGo (server/index.js safeDdgSearch) comparaba
 * Date.now() - ultimaPeticion y dormia la diferencia, pero K llamadas concurrentes leian
 * el mismo timestamp, dormian lo mismo, despertaban juntas y las K estampaban la hora a la
 * vez: solo espaciaba llamadas secuenciales. Aqui el turno se reserva encadenando la
 * promesa de la cola, de modo que la salida real de cada ejecucion queda separada al menos
 * intervalMs.
 */
export function createThrottledQueue({ intervalMs = 0 } = {}) {
  let cola = Promise.resolve();
  let ultimaEjecucion = 0;
  let enCola = 0;

  const esperaMinima = () => {
    const restante = intervalMs - (Date.now() - ultimaEjecucion);
    return restante > 0 ? new Promise((resolve) => setTimeout(resolve, restante)) : Promise.resolve();
  };

  return {
    /**
     * Encola `fn` y resuelve con su resultado. Los errores se propagan al llamador sin
     * romper la cola.
     */
    run(fn) {
      enCola += 1;
      const turno = cola.then(async () => {
        try {
          await esperaMinima();
          ultimaEjecucion = Date.now();
          return await fn();
        } finally {
          enCola -= 1;
        }
      });
      // La cola no debe absorber rechazos: se encadena con catch para el proximo turno.
      cola = turno.then(() => {}, () => {});
      return turno;
    },
    pendientes() {
      return enCola;
    }
  };
}
