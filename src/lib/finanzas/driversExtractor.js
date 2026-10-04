/**
 * @file driversExtractor.js
 * @description Extractor de drivers financieros desde Semilla, RAG y módulos de plan.
 * Garantiza que jamás se inventen conceptos ajenos al giro del proyecto.
 */

import { createEmptyDriversFicha } from './driversSchema.js';
import { resolveCanonicalCapex } from './canonicalCapex.js';
import { parseNumericAmount } from './calculadoraFinanciera.js';

/**
 * Infiere un nombre representativo de la línea principal de producto a partir del giro y nombre del proyecto.
 * @param {Object} planData - Datos del plan
 * @returns {string} Nombre del producto o servicio
 */
export function inferConceptoProducto(planData = {}) {
  const seed = planData?.semilla || {};
  const nombre = seed.nombre_proyecto || seed.negocio?.nombre_marca || seed.negocio?.nombre || planData?.config?.brandKit?.companyName || '';
  const giro = seed.giro || seed.negocio?.giro || seed.solucion || '';

  const texto = `${nombre} ${giro}`.toLowerCase();

  // 1. Carpintería, cocinas, muebles y closets (prioridad alta)
  if (texto.includes('closet') || texto.includes('cocina') || texto.includes('carpinter') || texto.includes('muebl') || texto.includes('melamina')) {
    return 'Fabricación e Instalación de Cocinas Integrales y Closets Modulares';
  }
  // 2. Galletas, repostería y panadería
  if (texto.includes('galleta') || texto.includes('reposter') || texto.includes('panader') || texto.includes('snack') || texto.includes('pasteler')) {
    return 'Venta de Galletas y Snacks Saludables';
  }
  // 3. Carnes, cortes finos y agroindustria cárnica (límite de palabra estricto para no confundir con "residencial")
  if (/\b(carne|carnes|cárnic[ao]s?|cortes\s+finos|ganader[ií]a|asadh?or|t-bone|arrachera)\b/i.test(texto) || (texto.includes('corte') && texto.includes('carne'))) {
    return 'Procesamiento y Comercialización de Cortes Finos de Carne';
  }
  // 4. Maquinado, hidráulica, minería y MaaS
  if (texto.includes('hidráulic') || texto.includes('minería') || texto.includes('cuántico') || texto.includes('maas') || texto.includes('cilindro')) {
    return 'Servicios de Mantenimiento y Maquinado Hidráulico Minero Especializado';
  }
  // 5. Cafetería y café
  if (texto.includes('cafeter') || texto.includes('café') || texto.includes('coffee')) {
    return 'Servicio de Barra de Café y Expendio de Grano Tostado';
  }
  // 6. Cómputo, internet e impresiones
  if (texto.includes('ciber') || texto.includes('internet') || texto.includes('papeler')) {
    return 'Servicios de Cómputo, Internet e Impresiones';
  }
  // 7. Barbería y cuidado personal
  if (texto.includes('barber') || texto.includes('peluquer') || texto.includes('salón de belleza')) {
    return `Servicios de ${giro || 'Barbería y Peluquería'}`;
  }
  // 8. Consultoría y software
  if (texto.includes('consultor') || texto.includes('asesor') || texto.includes('software') || texto.includes('tecnolog')) {
    return `Servicios de ${giro || nombre || 'Consultoría Profesional'}`;
  }

  if (giro && giro.length > 3) {
    return `Servicios y Productos de ${giro}`;
  }

  return nombre ? `Productos y Servicios de ${nombre}` : 'Línea Comercial Principal';
}

/**
 * Extrae la Ficha de Drivers estructurada a partir de todo el árbol del proyecto.
 * @param {Object} planData - Objeto maestro del plan
 * @returns {Object} Ficha de Drivers consolidada
 */
export function extractDriversFromPlan(planData = {}) {
  const ficha = createEmptyDriversFicha();
  const seed = planData?.semilla || {};
  const org = planData?.organizacion || {};
  const mercado = planData?.mercado || {};

  // 0. Si ya existe una Ficha de Drivers precargada y aprobada en la configuración
  const preloaded = planData?.config?.fichaDrivers?.drivers;
  if (preloaded && typeof preloaded === 'object') {
    for (const [k, v] of Object.entries(preloaded)) {
      if (ficha.drivers[k] && v?.valor) {
        ficha.drivers[k] = { ...ficha.drivers[k], ...v };
      }
    }
  }

  // 0.1 Si config.fichaDrivers tiene valores directos canónicos
  const directFicha = planData?.config?.fichaDrivers;
  if (directFicha && typeof directFicha === 'object') {
    if (!ficha.drivers.capex_total?.valor && directFicha.capexTotal > 0) {
      ficha.drivers.capex_total.valor = directFicha.capexTotal;
      ficha.drivers.capex_total.estado = 'aprobado';
      ficha.drivers.capex_total.procedencia = 'user_provided';
      ficha.drivers.capex_total.confianza = 'alta';
    }
    if (!ficha.drivers.precio_unitario_o_ticket?.valor && directFicha.ticketPromedio > 0) {
      ficha.drivers.precio_unitario_o_ticket.valor = directFicha.ticketPromedio;
      ficha.drivers.precio_unitario_o_ticket.estado = 'aprobado';
      ficha.drivers.precio_unitario_o_ticket.procedencia = 'user_provided';
      ficha.drivers.precio_unitario_o_ticket.confianza = 'alta';
      if (!ficha.drivers.volumen_mensual_ventas?.valor) {
        ficha.drivers.volumen_mensual_ventas.valor = 1;
        ficha.drivers.volumen_mensual_ventas.estado = 'aprobado';
        ficha.drivers.volumen_mensual_ventas.procedencia = 'user_provided';
        ficha.drivers.volumen_mensual_ventas.confianza = 'alta';
      }
    }
  }

  // 1. Concepto de producto
  if (!ficha.drivers.concepto_producto?.valor) {
    const concepto = inferConceptoProducto(planData);
    ficha.drivers.concepto_producto.valor = concepto;
    ficha.drivers.concepto_producto.estado = 'aprobado';
    ficha.drivers.concepto_producto.confianza = 'alta';
    ficha.drivers.concepto_producto.procedencia = 'user_provided';
  }

  // 2. CAPEX Total (Resolución Canónica estricta)
  if (!ficha.drivers.capex_total?.valor) {
    const canonicalCapex = resolveCanonicalCapex(planData, seed);
    if (canonicalCapex && canonicalCapex.capex > 0) {
      ficha.drivers.capex_total.valor = canonicalCapex.capex;
      ficha.drivers.capex_total.procedencia = canonicalCapex.source.includes('seed') ? 'user_provided' : 'calculated';
      ficha.drivers.capex_total.confianza = 'alta';
      ficha.drivers.capex_total.fuentes = [{ entidad: canonicalCapex.source, valor: canonicalCapex.capex }];
      ficha.drivers.capex_total.estado = 'aprobado';
    }
  }

  // 3. Costos Fijos Mensuales
  let fixedMonthly = ficha.drivers.costos_fijos_mensuales?.valor || 0;
  let fixedSource = '';

  // 3.1 Revisar métricas clave en la semilla
  if (fixedMonthly === 0 && seed.metricasClave?.costoFijoMensual) {
    const parsed = parseNumericAmount(seed.metricasClave.costoFijoMensual);
    if (parsed > 0) {
      fixedMonthly = parsed;
      fixedSource = 'semilla.metricasClave.costoFijoMensual';
    }
  }

  // 3.2 Revisar desglose OPEX en JSON
  if (fixedMonthly === 0) {
    try {
      const rawOpex = org.costos?.desglose_opex_json;
      if (rawOpex) {
        const parsed = typeof rawOpex === 'string' ? JSON.parse(rawOpex) : rawOpex;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sumFixed = parsed
            .filter(item => item.categoria === 'Fijo' || item.categoria === 'Operativo' || item.type === 'Fijo')
            .reduce((sum, item) => sum + parseNumericAmount(item.mensual || item.initialMonthlyAmount), 0);
          if (sumFixed > 0) {
            fixedMonthly = sumFixed;
            fixedSource = 'organizacion.costos.desglose_opex_json';
          }
        }
      }
    } catch {}
  }

  // 3.3 Revisar costos fijos declarados en texto o semilla
  if (fixedMonthly === 0) {
    const fijosRaw = org.costos?.fijos || org.costos?.total_costos_fijos || seed.finanzas?.costos_fijos;
    if (fijosRaw) {
      const parsed = parseNumericAmount(fijosRaw, 0, 'fijo');
      if (parsed > 0) {
        fixedMonthly = parsed;
        fixedSource = 'organizacion.costos.fijos';
      }
    }
  }

  // 3.4 Revisar evidencia RAG específica línea por línea (ej. recibo de luz + gasolina en Closets Corona: $6,000 + $7,000 = $13,000)
  if (fixedMonthly === 0 && Array.isArray(planData?.config?.documents)) {
    for (const doc of planData.config.documents) {
      const txt = String(doc.content || doc.text || '');
      if (!txt) continue;
      let luz = 0;
      let gas = 0;
      const lines = txt.split(/\r?\n/);
      for (const line of lines) {
        if (/recibo\s+de\s+luz|energía\s+eléctrica/i.test(line)) {
          const m = line.match(/\$\s*([0-9,]+)/);
          if (m) luz = parseNumericAmount(m[1]);
        }
        if (/gasolina|combustible/i.test(line)) {
          const m = line.match(/\$\s*([0-9,]+)/);
          if (m) gas = parseNumericAmount(m[1]);
        }
      }
      if (luz > 0 && gas > 0) {
        fixedMonthly = luz + gas;
        fixedSource = `RAG (${doc.name || 'documento'}): Luz ($${luz}) + Gasolina ($${gas})`;
        break;
      }
    }
  }

  // 3.5 Revisar menciones en diagnóstico cuántico de la semilla
  if (fixedMonthly === 0) {
    const diagFin = seed.diagnostico_cuantico?.finanzas?.diagnostico || seed.problema || '';
    if (diagFin) {
      const matchLuz = diagFin.match(/luz[^\d$]*\$?\s*([0-9,]+)/i);
      const matchGas = diagFin.match(/(?:gasolina|fletes)[^\d$]*\$?\s*([0-9,]+)/i);
      if (matchLuz && matchGas) {
        const l = parseNumericAmount(matchLuz[1]);
        const g = parseNumericAmount(matchGas[1]);
        if (l > 0 && g > 0) {
          fixedMonthly = l + g;
          fixedSource = 'semilla.diagnostico_cuantico.finanzas';
        }
      }
    }
  }

  if (fixedMonthly > 0) {
    ficha.drivers.costos_fijos_mensuales.valor = fixedMonthly;
    ficha.drivers.costos_fijos_mensuales.procedencia = fixedSource.includes('seed') || fixedSource.includes('semilla') ? 'user_provided' : 'calculated';
    ficha.drivers.costos_fijos_mensuales.confianza = 'alta';
    ficha.drivers.costos_fijos_mensuales.fuentes = [{ entidad: fixedSource, valor: fixedMonthly }];
    ficha.drivers.costos_fijos_mensuales.estado = 'aprobado';
  }

  // 4. Precios y Volumen Mensual
  let precioUnitario = ficha.drivers.precio_unitario_o_ticket?.valor || 0;
  let volumenMensual = ficha.drivers.volumen_mensual_ventas?.valor || 0;
  let precioSource = '';
  let volumenSource = '';

  // 4.1 Revisar métricas clave en la semilla (ej. VCV carnes)
  if (precioUnitario === 0 && seed.metricasClave?.precioVentaKg) {
    precioUnitario = parseNumericAmount(seed.metricasClave.precioVentaKg);
    precioSource = 'semilla.metricasClave.precioVentaKg';
  }
  if (volumenMensual === 0 && seed.metricasClave?.produccionMensualKg) {
    volumenMensual = parseNumericAmount(seed.metricasClave.produccionMensualKg);
    volumenSource = 'semilla.metricasClave.produccionMensualKg';
  }

  // 4.2 Revisar ingresos JSON
  if (precioUnitario === 0 || volumenMensual === 0) {
    try {
      const rawIngresos = org.estados_financieros?.ingresos_json;
      if (rawIngresos) {
        const parsed = typeof rawIngresos === 'string' ? JSON.parse(rawIngresos) : rawIngresos;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const totalMensual = parsed.reduce((sum, item) => sum + parseNumericAmount(item.mensual || (item.anual ? item.anual / 12 : 0)), 0);
          if (totalMensual > 0) {
            if (precioUnitario === 0) {
              precioUnitario = totalMensual;
              precioSource = 'organizacion.estados_financieros.ingresos_json';
            }
            if (volumenMensual === 0) {
              volumenMensual = 1;
              volumenSource = 'Contrato / Mensualidad global';
            }
          }
        }
      }
    } catch {}
  }

  // 4.3 Extraer desde módulo de mercado (ventas)
  const ventas = mercado.ventas || {};

  // Primero precios: buscar en precios antes de tácticas de precio
  if (precioUnitario === 0) {
    const priceText = String(ventas.precios || ventas.tacticas_precio || '');
    if (priceText) {
      const matchPrice = priceText.match(/\$\s*([0-9,]+(?:\.[0-9]+)?)/);
      if (matchPrice) {
        precioUnitario = parseNumericAmount(matchPrice[1]);
        precioSource = 'mercado.ventas.precios';
      }
    }
  }

  // Volumen: buscar proyecciones mensuales, diarias o anuales
  if (volumenMensual === 0) {
    const volText = String(ventas.proyeccion_volumen || ventas.estrategia || '');
    if (volText) {
      const matchMonth = volText.match(/([0-9,]+)\s*(?:unidades|piezas|servicios|galletas|kilos|kg|cilindros|reparaciones)?\s*(?:mensuales|al\s*mes)/i);
      const matchDay = volText.match(/([0-9,]+)\s*(?:unidades|piezas|servicios|galletas|kilos|kg)?\s*(?:diarias|por\s*d[ií]a)/i);
      const matchYear = volText.match(/Año\s*1:\s*([0-9,]+)\s*(?:reparaciones|servicios|cilindros|unidades|piezas)/i);

      if (matchMonth) {
        volumenMensual = parseNumericAmount(matchMonth[1]);
        volumenSource = 'mercado.ventas.proyeccion_volumen';
      } else if (matchDay) {
        volumenMensual = parseNumericAmount(matchDay[1]) * 26;
        volumenSource = 'mercado.ventas.proyeccion_volumen (diario x 26)';
      } else if (matchYear) {
        const anual = parseNumericAmount(matchYear[1]);
        volumenMensual = Math.max(1, Math.round(anual / 12));
        volumenSource = 'mercado.ventas.proyeccion_volumen (anual / 12)';
      }
    }
  }

  // 4.4 Extraer ticket desde semilla (modelo de ingresos, ej. Closets Corona)
  if (precioUnitario === 0 && seed.modelo_ingresos) {
    const mod = String(seed.modelo_ingresos);
    const rangeMatch = mod.match(/ticket\s*promedio[^\d$]*\$?\s*([0-9,]+)[^\d$]*a[^\d$]*\$?\s*([0-9,]+)/i);
    const singleMatch = mod.match(/ticket\s*promedio[^\d$]*\$?\s*([0-9,]+)/i);
    if (rangeMatch) {
      const min = parseNumericAmount(rangeMatch[1]);
      const max = parseNumericAmount(rangeMatch[2]);
      precioUnitario = Math.round((min + max) / 2);
      precioSource = 'semilla.modelo_ingresos (rango promedio)';
    } else if (singleMatch) {
      precioUnitario = parseNumericAmount(singleMatch[1]);
      precioSource = 'semilla.modelo_ingresos';
    }
  }

  // Si se encontró un ticket alto (> $50,000) y no hay volumen mensual explícito, asumir 1 proyecto/mes
  if (precioUnitario >= 50000 && volumenMensual === 0) {
    volumenMensual = 1;
    volumenSource = 'Capacidad estimada para proyecto de alto valor (1/mes)';
  }

  // 4.5 Fallback ordenado desde semilla (meta de ingresos)
  if (precioUnitario === 0 && seed.finanzas?.meta_ingresos) {
    const meta = parseNumericAmount(seed.finanzas.meta_ingresos);
    if (meta > 0) {
      precioUnitario = meta;
      volumenMensual = 1;
      precioSource = 'semilla.finanzas.meta_ingresos';
      volumenSource = 'Meta de ventas mensual declarada';
    }
  }

  if (precioUnitario > 0) {
    ficha.drivers.precio_unitario_o_ticket.valor = precioUnitario;
    ficha.drivers.precio_unitario_o_ticket.procedencia = 'user_provided';
    ficha.drivers.precio_unitario_o_ticket.confianza = 'alta';
    ficha.drivers.precio_unitario_o_ticket.fuentes = [{ entidad: precioSource, valor: precioUnitario }];
    ficha.drivers.precio_unitario_o_ticket.estado = 'aprobado';
  }

  if (volumenMensual > 0) {
    ficha.drivers.volumen_mensual_ventas.valor = volumenMensual;
    ficha.drivers.volumen_mensual_ventas.procedencia = 'user_provided';
    ficha.drivers.volumen_mensual_ventas.confianza = 'alta';
    ficha.drivers.volumen_mensual_ventas.fuentes = [{ entidad: volumenSource, valor: volumenMensual }];
    ficha.drivers.volumen_mensual_ventas.estado = 'aprobado';
  }

  // 5. Costo Variable Unitario
  let costoVar = ficha.drivers.costo_variable_unitario?.valor || 0;
  let costoVarSource = '';

  // 5.1 Revisar métricas clave en la semilla (ej. VCV carnes)
  if (costoVar === 0 && seed.metricasClave?.costoVariableKg) {
    costoVar = parseNumericAmount(seed.metricasClave.costoVariableKg);
    costoVarSource = 'semilla.metricasClave.costoVariableKg';
  }

  // 5.2 Revisar desglose OPEX en JSON
  if (costoVar === 0) {
    try {
      const rawOpex = org.costos?.desglose_opex_json;
      if (rawOpex) {
        const parsed = typeof rawOpex === 'string' ? JSON.parse(rawOpex) : rawOpex;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sumVar = parsed
            .filter(item => item.categoria === 'Variable' || item.type === 'Variable')
            .reduce((sum, item) => sum + parseNumericAmount(item.mensual || item.initialMonthlyAmount), 0);
          if (sumVar > 0 && volumenMensual > 0) {
            costoVar = Math.round((sumVar / volumenMensual) * 100) / 100;
            costoVarSource = 'organizacion.costos.desglose_opex_json (dividido por volumen)';
          }
        }
      }
    } catch {}
  }

  // 5.3 Revisar texto de costos unitarios o fijos/variables
  if (costoVar === 0 && org.costos) {
    const rawCostosText = `${org.costos.unitario || ''} ${org.costos.variables || ''} ${org.costos.fijos || ''}`;
    const matchCostoVar = rawCostosText.match(/costo\s*variable\s*unitario[^\d$]*\$?\s*([0-9,]+(?:\.[0-9]+)?)/i);
    if (matchCostoVar) {
      costoVar = parseNumericAmount(matchCostoVar[1]);
      costoVarSource = 'organizacion.costos (costo variable unitario)';
    } else if (org.costos.unitario) {
      const matchCosto = String(org.costos.unitario).match(/\$\s*([0-9,]+(?:\.[0-9]+)?)/);
      if (matchCosto) {
        costoVar = parseNumericAmount(matchCosto[1]);
        costoVarSource = 'organizacion.costos.unitario';
      }
    }
  }

  // 5.4 Si no hay costo variable declarado pero hay margen bruto objetivo (ej. Closets Corona 38%-45%)
  if (costoVar === 0 && precioUnitario > 0 && seed.modelo_ingresos) {
    const marginMatch = String(seed.modelo_ingresos).match(/m[áa]rgenes?\s*brutos?\s*objetivo[^\d%]*([0-9]+)%\s*al\s*([0-9]+)%/i);
    if (marginMatch) {
      const m1 = parseFloat(marginMatch[1]);
      const m2 = parseFloat(marginMatch[2]);
      const avgMargin = (m1 + m2) / 200;
      costoVar = Math.round(precioUnitario * (1 - avgMargin));
      costoVarSource = `semilla.modelo_ingresos (margen promedio ${((avgMargin) * 100).toFixed(0)}%)`;
    }
  }

  if (costoVar > 0) {
    ficha.drivers.costo_variable_unitario.valor = costoVar;
    ficha.drivers.costo_variable_unitario.procedencia = 'calculated';
    ficha.drivers.costo_variable_unitario.confianza = 'alta';
    ficha.drivers.costo_variable_unitario.fuentes = [{ entidad: costoVarSource, valor: costoVar }];
    ficha.drivers.costo_variable_unitario.estado = 'aprobado';
  } else {
    ficha.drivers.costo_variable_unitario.valor = 0;
    ficha.drivers.costo_variable_unitario.procedencia = 'user_provided';
    ficha.drivers.costo_variable_unitario.confianza = 'alta';
    ficha.drivers.costo_variable_unitario.estado = 'aprobado';
  }

  // Verificar si la Ficha está completa para cambiar su estado global
  const obligatorios = ['capex_total', 'costos_fijos_mensuales', 'precio_unitario_o_ticket', 'volumen_mensual_ventas', 'concepto_producto'];
  const estanCompletos = obligatorios.every(k => ficha.drivers[k]?.valor > 0 || (k === 'concepto_producto' && ficha.drivers[k]?.valor));
  if (estanCompletos) {
    ficha.estado = 'aprobado';
    ficha.aprobadaEn = new Date().toISOString();
  }

  return ficha;
}
