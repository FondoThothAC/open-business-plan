/**
 * @file driversSchema.js
 * @description Esquema de dominio para la Ficha de Drivers Financieros (DDD / MDD).
 * Define las variables indispensables para proyecciones financieras sin fallbacks inventados.
 */

export const FINANCIAL_DRIVER_KEYS = Object.freeze([
  'capex_total',
  'costos_fijos_mensuales',
  'precio_unitario_o_ticket',
  'volumen_mensual_ventas',
  'costo_variable_unitario',
  'concepto_producto',
  'tasa_descuento_anual',
  'horizonte_anios',
  'tasa_impuestos'
]);

export const DRIVER_METADATA = Object.freeze({
  capex_total: {
    nombre: 'Inversión Inicial Total (CAPEX)',
    unidad: 'MXN',
    esObligatorio: true,
    minimo: 1000
  },
  costos_fijos_mensuales: {
    nombre: 'Costos Fijos Operativos Mensuales (OPEX Fijo)',
    unidad: 'MXN/mes',
    esObligatorio: true,
    minimo: 500
  },
  precio_unitario_o_ticket: {
    nombre: 'Precio de Venta Promedio o Ticket Unitario',
    unidad: 'MXN',
    esObligatorio: true,
    minimo: 1
  },
  volumen_mensual_ventas: {
    nombre: 'Volumen Mensual de Unidades / Servicios',
    unidad: 'unidades/mes',
    esObligatorio: true,
    minimo: 1
  },
  costo_variable_unitario: {
    nombre: 'Costo Variable Unitario (Insumos Directos)',
    unidad: 'MXN/unidad',
    esObligatorio: false,
    minimo: 0
  },
  concepto_producto: {
    nombre: 'Línea de Producto o Servicio Principal',
    unidad: 'texto',
    esObligatorio: true
  },
  tasa_descuento_anual: {
    nombre: 'Tasa de Descuento (WACC / Tasa de Exigencia)',
    unidad: 'porcentaje',
    esObligatorio: false,
    defecto: 12
  },
  horizonte_anios: {
    nombre: 'Horizonte de Proyección',
    unidad: 'años',
    esObligatorio: false,
    defecto: 5
  },
  tasa_impuestos: {
    nombre: 'Tasa Impositiva Estimada (ISR)',
    unidad: 'porcentaje',
    esObligatorio: false,
    defecto: 30
  }
});

/**
 * Crea una Ficha de Drivers vacía con estado pendiente y valores iniciales.
 * @returns {Object} Ficha de Drivers en blanco
 */
export function createEmptyDriversFicha() {
  const drivers = {};
  for (const key of FINANCIAL_DRIVER_KEYS) {
    const meta = DRIVER_METADATA[key] || {};
    drivers[key] = {
      clave: key,
      nombre: meta.nombre || key,
      valor: key === 'concepto_producto' ? '' : (meta.defecto || 0),
      unidad: meta.unidad || 'MXN',
      procedencia: 'not_found',
      confianza: 'pendiente',
      fuentes: [],
      estado: 'pendiente'
    };
  }

  return {
    version: '2.5',
    estado: 'pendiente',
    fechaCreacion: new Date().toISOString(),
    aprobadaEn: null,
    drivers
  };
}

/**
 * Valida la consistencia e integridad de una Ficha de Drivers.
 * @param {Object} ficha - Estructura de la Ficha de Drivers
 * @returns {{ esValida: boolean, faltantes: string[], advertencias: string[] }}
 */
export function validateDriversFicha(ficha) {
  const faltantes = [];
  const advertencias = [];

  if (!ficha || typeof ficha !== 'object' || !ficha.drivers) {
    return {
      esValida: false,
      faltantes: [...FINANCIAL_DRIVER_KEYS],
      advertencias: ['La estructura de la ficha de drivers es inválida o no existe.']
    };
  }

  for (const key of FINANCIAL_DRIVER_KEYS) {
    const meta = DRIVER_METADATA[key];
    const driver = ficha.drivers[key];

    if (!driver) {
      if (meta.esObligatorio) faltantes.push(key);
      continue;
    }

    if (key === 'concepto_producto') {
      if (!driver.valor || String(driver.valor).trim() === '') {
        faltantes.push(key);
      }
      continue;
    }

    const numVal = Number(driver.valor);
    if (meta.esObligatorio) {
      if (isNaN(numVal) || numVal <= 0 || driver.estado === 'pendiente') {
        faltantes.push(key);
      }
    }

    if (meta.minimo !== undefined && numVal < meta.minimo && numVal > 0) {
      advertencias.push(`El driver ${meta.nombre} ($${numVal}) está por debajo del umbral mínimo de referencia ($${meta.minimo}).`);
    }
  }

  // Validación de coherencia de margen
  const precio = Number(ficha.drivers.precio_unitario_o_ticket?.valor || 0);
  const costoVar = Number(ficha.drivers.costo_variable_unitario?.valor || 0);
  if (precio > 0 && costoVar >= precio) {
    advertencias.push(`El costo variable unitario ($${costoVar}) es mayor o igual al precio de venta ($${precio}), generando margen de contribución negativo.`);
  }

  return {
    esValida: faltantes.length === 0,
    faltantes,
    advertencias
  };
}
