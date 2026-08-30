/**
 * CanvasBuilder - Generador y Unificador de Modelos Canvas (Lean, Classic Osterwalder, Micro)
 * Fuentes: The Lean Startup (Maurya 9 bloques), Anatomy of a Business Plan (Osterwalder), Starting a Business QuickStart Guide (Micro).
 */

export class CanvasBuilder {
  static MODES = {
    LEAN: 'lean',
    CLASSIC: 'classic',
    MICRO: 'micro'
  };

  /**
   * Obtiene la estructura de bloques según el modo
   */
  static getBlockDefinitions(mode = 'classic') {
    if (mode === this.MODES.LEAN) {
      return [
        { key: 'problema', title: '1. Problema', desc: 'Los 3 problemas principales del cliente.', col: '1/3', row: '1/2' },
        { key: 'solucion', title: '4. Solución', desc: 'Las 3 características clave del MVP.', col: '3/5', row: '1/2' },
        { key: 'propuesta_valor', title: '3. Propuesta de Valor Única', desc: 'Mensaje claro y convincente de diferenciación.', col: '5/7', row: '1/3' },
        { key: 'ventaja_especial', title: '9. Ventaja Injusta', desc: 'Lo que no se puede copiar fácilmente.', col: '7/9', row: '1/2' },
        { key: 'segmentos_clientes', title: '2. Segmentos de Clientes', desc: 'Mercado meta y early adopters.', col: '9/11', row: '1/3' },
        { key: 'metricas_clave', title: '8. Métricas Clave', desc: 'Números esenciales que indican éxito (AARRR).', col: '1/5', row: '2/3' },
        { key: 'canales', title: '5. Canales', desc: 'Camino hacia los clientes.', col: '7/11', row: '2/3' },
        { key: 'estructura_costos', title: '7. Estructura de Costos', desc: 'Costos de adquisición, nómina y operación.', col: '1/6', row: '3/4' },
        { key: 'flujos_ingresos', title: '6. Fuentes de Ingresos', desc: 'Modelo de ingresos, pricing y margen.', col: '6/11', row: '3/4' }
      ];
    }

    if (mode === this.MODES.MICRO) {
      return [
        { key: 'clientes_mercado', title: '1. Clientes y Mercado', desc: 'A quién le vendes en tu localidad.', col: '1/4', row: '1/2' },
        { key: 'oferta_valor', title: '2. Oferta de Productos / Servicios', desc: 'Qué ofreces y por qué te prefieren.', col: '4/7', row: '1/2' },
        { key: 'dinero_finanzas', title: '3. Finanzas Básicas', desc: 'Precios, costos fijos y ganancias esperadas.', col: '7/10', row: '1/2' }
      ];
    }

    // Classic Osterwalder (Default)
    return [
      { key: 'socios_clave', title: '1. Socios Clave', desc: 'Alianzas estratégicas y proveedores esenciales.', col: '1/3', row: '1/3' },
      { key: 'actividades_clave', title: '2. Actividades Clave', desc: 'Acciones críticas para entregar la propuesta de valor.', col: '3/5', row: '1/2' },
      { key: 'recursos_clave', title: '6. Recursos Clave', desc: 'Activos físicos, tecnológicos y humanos indispensables.', col: '3/5', row: '2/3' },
      { key: 'propuestas_valor', title: '3. Propuestas de Valor', desc: 'Beneficios cuantitativos y cualitativos para el cliente.', col: '5/7', row: '1/3' },
      { key: 'relaciones_clientes', title: '4. Relaciones con Clientes', desc: 'Tipo de vínculo y retención.', col: '7/9', row: '1/2' },
      { key: 'canales', title: '5. Canales', desc: 'Distribución, venta y comunicación.', col: '7/9', row: '2/3' },
      { key: 'segmentos_clientes', title: '7. Segmentos de Clientes', desc: 'Grupos de personas o empresas a los que servimos.', col: '9/11', row: '1/3' },
      { key: 'estructura_costos', title: '8. Estructura de Costos', desc: 'Principales costos derivados del modelo.', col: '1/6', row: '3/4' },
      { key: 'fuentes_ingresos', title: '9. Fuentes de Ingresos', desc: 'Mecanismos de monetización y flujo de caja.', col: '6/11', row: '3/4' }
    ];
  }

  /**
   * Determina el modo de Canvas adecuado según el tipo de proyecto
   */
  static resolveModeForDocType(docType = 'business') {
    if (docType === 'agile_startup') return this.MODES.LEAN;
    if (docType === 'micro_business') return this.MODES.MICRO;
    return this.MODES.CLASSIC;
  }
}
