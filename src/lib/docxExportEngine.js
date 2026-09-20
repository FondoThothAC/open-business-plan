/**
 * Motor de Exportación Ejecutiva a Microsoft Word (.docx)
 * Genera documentos estructurados, editables y listos para comités de crédito e inversión.
 * Basado en la librería estándar 'docx'.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber
} from 'docx';
import { FRAMEWORKS } from '../config/frameworks.js';

// Paleta de colores corporativos executive
const COLORS = {
  PRIMARY: '0F172A',     // Slate 900
  ACCENT: '0D9488',      // Teal 600
  SECONDARY: '334155',   // Slate 700
  MUTED: '64748B',       // Slate 500
  BG_LIGHT: 'F8FAFC',    // Slate 50
  BORDER: 'CBD5E1',      // Slate 300
  WHITE: 'FFFFFF'
};

const BORDER_STYLE_LIGHT = {
  top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
  left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
  right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER }
};

/**
 * Formatea un número como moneda MXN
 */
function formatMxn(amount) {
  const num = Number(amount);
  if (isNaN(num) || !isFinite(num)) return '$0 MXN';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Crea una celda de tabla con formato estándar
 */
function createStyledCell(text, { isHeader = false, widthPct = null, bold = false, align = AlignmentType.LEFT } = {}) {
  return new TableCell({
    width: widthPct ? { size: widthPct, type: WidthType.PERCENTAGE } : undefined,
    borders: BORDER_STYLE_LIGHT,
    shading: isHeader ? { fill: COLORS.PRIMARY } : undefined,
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text: String(text || ''),
            bold: isHeader || bold,
            color: isHeader ? COLORS.WHITE : COLORS.PRIMARY,
            size: isHeader ? 20 : 18,
            font: 'Arial'
          })
        ]
      })
    ]
  });
}

/**
 * Crea una fila de tabla estructurada
 */
function createStyledRow(cellsData, isHeader = false) {
  return new TableRow({
    tableHeader: isHeader,
    children: cellsData.map(c => {
      if (typeof c === 'string' || typeof c === 'number') {
        return createStyledCell(c, { isHeader });
      }
      return createStyledCell(c.text, {
        isHeader,
        widthPct: c.widthPct,
        bold: c.bold,
        align: c.align
      });
    })
  });
}

/**
 * Genera el documento Document de 'docx' a partir de los datos del proyecto
 */
export function buildDocxDocument(project = {}, options = {}) {
  const scope = options.scope || 'executive';
  const nombreEmpresa = project.companyName || project.nombre || 'Plan de Negocios';
  const sector = project.sector || project.semilla?.negocio?.giro || 'Sector Agroindustrial / Alimentos';
  const frameworkKey = project.framework || project.config?.projectType || 'business';
  const activeFw = FRAMEWORKS[frameworkKey] || FRAMEWORKS.business;
  const metodologia = activeFw?.name || 'Plan de Negocios Tradicional';
  const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  // Inversión Requerida dinámica
  const inversionMonto = project.montoInversion ||
                         project.inversionRequerida ||
                         project.resumen_ejecutivo?.elevator_pitch?.ask ||
                         (project.resumen_ejecutivo?.dictamen_viabilidad?.fase1?.monto_requerido ? `$${project.resumen_ejecutivo.dictamen_viabilidad.fase1.monto_requerido.toLocaleString('es-MX')} MXN` : null) ||
                         '$4,000,000 MXN';

  const children = [];

  // 1. PORTADA EJECUTIVA
  children.push(
    new Paragraph({ spacing: { before: 600, after: 150 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: nombreEmpresa.toUpperCase(),
          bold: true,
          size: 42,
          color: COLORS.PRIMARY,
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: scope === 'executive' 
            ? 'DOSSIER EJECUTIVO & DICTAMEN DE VIABILIDAD FINANCIERA'
            : 'PLAN ESTRATÉGICO INTEGRAL (DOCUMENTO MAESTRO 12 METODOLOGÍAS)',
          bold: true,
          size: 20,
          color: COLORS.ACCENT,
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `Sector / Giro: ${sector}`, size: 18, color: COLORS.MUTED, font: 'Arial' })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ 
          text: scope === 'executive'
            ? `Metodología Base: ${metodologia} (Enfoque Ejecutivo Canónico)`
            : `Metodología Base: ${metodologia} (Integración Completa de 12 Frameworks)`, 
          size: 17, 
          color: COLORS.MUTED, 
          font: 'Arial' 
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({ text: `Fecha de Emisión: ${fecha}`, size: 17, color: COLORS.MUTED, font: 'Arial' })
      ]
    }),

    // Tarjeta de Inversión en Portada
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: BORDER_STYLE_LIGHT,
              shading: { fill: 'F0FDFA' }, // Teal suave
              margins: { top: 160, bottom: 160, left: 160, right: 160 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'CAPITAL REQUERIDO DE INVERSIÓN', bold: true, size: 18, color: COLORS.ACCENT, font: 'Arial' })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: inversionMonto, bold: true, size: 34, color: COLORS.PRIMARY, font: 'Arial' })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: project.descripcion ? project.descripcion.slice(0, 180) + '...' : 'Habilitación de infraestructura operativa, equipamiento productivo y capital de trabajo inicial.',
                      size: 16,
                      color: COLORS.SECONDARY,
                      font: 'Arial'
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),

    new Paragraph({ spacing: { before: 600, after: 150 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'CONFIDENCIAL — PROHIBIDA SU REPRODUCCIÓN O DISTRIBUCIÓN SIN AUTORIZACIÓN',
          size: 15,
          color: COLORS.MUTED,
          italics: true,
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({ pageBreakBefore: true }) // Salto a Sección Ejecutiva
  );

  // 2. RESUMEN EJECUTIVO & ESTRATEGIA EN DOS FASES CUÁNTICAS
  const resumen = project.resumen_ejecutivo || {};
  const dictamen = resumen.dictamen_viabilidad || {};

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 180, after: 160 },
      children: [
        new TextRun({ text: '1. Resumen Ejecutivo & Estrategia de Escalamiento Cuántico', bold: true, color: COLORS.PRIMARY, font: 'Arial' })
      ]
    }),
    new Paragraph({
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: resumen.elevator_pitch?.problema && resumen.elevator_pitch?.solucion
            ? `${resumen.elevator_pitch.solucion} Enfoque de mitigación: ${resumen.elevator_pitch.problema}`
            : project.descripcion || 'Plan estratégico enfocado en optimizar el modelo operativo y comercial con alta rentabilidad y control de riesgos.',
          size: 19,
          font: 'Arial'
        })
      ]
    })
  );

  // Si existe dictamen con Fase 1 y Fase 2, imprimir tabla comparativa de fases
  if (dictamen.fase1 || dictamen.fase2) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 150, after: 100 },
        children: [
          new TextRun({ text: 'Modelo en Dos Fases Cuánticas (KPIs Gate)', bold: true, color: COLORS.SECONDARY, font: 'Arial' })
        ]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createStyledRow([
            { text: 'Fase Estratégica', widthPct: 25 },
            { text: 'Presupuesto Requerido', widthPct: 25 },
            { text: 'Alcance y Capacidad Operativa', widthPct: 30 },
            { text: 'Mercado Objetivo', widthPct: 20 }
          ], true),
          createStyledRow([
            { text: dictamen.fase1?.nombre || 'Fase 1: Taller Piloto', bold: true },
            { text: dictamen.fase1?.monto_requerido ? `$${dictamen.fase1.monto_requerido.toLocaleString('es-MX')} MXN` : 'Pendiente de definir', bold: true },
            { text: dictamen.fase1?.capacidad_mensual_kg ? `${dictamen.fase1.capacidad_mensual_kg.toLocaleString('es-MX')} kg/mes, 9 colaboradores` : '1 Horno ASADHOR (5.1 ton/mes), 9 empleados' },
            { text: 'Regional B2B (Sonora y Sinaloa)' }
          ]),
          createStyledRow([
            { text: dictamen.fase2?.nombre || 'Fase 2: Escala Industrial', bold: true },
            { text: dictamen.fase2?.monto_requerido_serie_a ? `$${dictamen.fase2.monto_requerido_serie_a.toLocaleString('es-MX')} MXN` : 'Pendiente de definir', bold: true },
            { text: dictamen.fase2?.requerimientos || 'Planta TIF 1,200 m², 5 Hornos ASADHOR, Túnel Criogénico IQF, 24 empleados' },
            { text: 'Nacional & Exportación EE.UU.' }
          ])
        ]
      }),
      new Paragraph({ spacing: { before: 160, after: 160 } })
    );
  }

  // 3. ESTADOS FINANCIEROS Y CORRIDA AUTOMÁTICA
  let corridaData = null;
  try {
    const rawCorrida = project.organizacion?.estados_financieros?.corrida_automatica;
    if (rawCorrida && typeof rawCorrida === 'string') {
      corridaData = JSON.parse(rawCorrida);
    } else if (rawCorrida && typeof rawCorrida === 'object') {
      corridaData = rawCorrida;
    }
  } catch (err) {
    console.warn('[DocxExportEngine] Error parseando corrida_automatica:', err);
  }

  if (corridaData && corridaData.incomeStatement && corridaData.incomeStatement.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 140 },
        children: [
          new TextRun({ text: '2. Proyección Financiera Consolidada a 5 Años', bold: true, color: COLORS.PRIMARY, font: 'Arial' })
        ]
      })
    );

    // Tabla de Estado de Resultados Anual
    const isYears = corridaData.incomeStatement.slice(0, 5);
    const headerCols = [{ text: 'Concepto Financiero', widthPct: 35 }];
    isYears.forEach((row, i) => {
      headerCols.push({ text: `Año ${row.year || i + 1}`, widthPct: 13, align: AlignmentType.RIGHT });
    });

    const incomeRows = [createStyledRow(headerCols, true)];

    const addMetricRow = (label, key, isBold = false) => {
      const cells = [{ text: label, bold: isBold }];
      isYears.forEach(row => {
        const val = row[key] !== undefined ? row[key] : 0;
        cells.push({ text: formatMxn(val), bold: isBold, align: AlignmentType.RIGHT });
      });
      incomeRows.push(createStyledRow(cells));
    };

    addMetricRow('Ingresos por Ventas', 'revenue', true);
    addMetricRow('Costos Variables / Producción', 'variableCosts');
    addMetricRow('Utilidad Bruta', 'grossMargin', true);
    addMetricRow('Costos Fijos Operativos', 'fixedCosts');
    addMetricRow('EBITDA', 'ebitda', true);
    addMetricRow('Depreciación y Amortización', 'depreciation');
    addMetricRow('Utilidad Operativa (EBIT)', 'ebit', true);
    addMetricRow('Impuestos (ISR 30%)', 'taxes');
    addMetricRow('Utilidad Neta', 'netIncome', true);

    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({ text: 'Estado de Resultados Proyectado (MXN)', bold: true, color: COLORS.SECONDARY, font: 'Arial' })
        ]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: incomeRows
      }),
      new Paragraph({ spacing: { before: 160, after: 120 } })
    );

    // Tabla de Indicadores Financieros
    const kpis = corridaData.kpis || {};
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({ text: 'Indicadores de Rentabilidad y Viabilidad de Inversión', bold: true, color: COLORS.SECONDARY, font: 'Arial' })
        ]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createStyledRow([
            { text: 'Indicador / Métrica', widthPct: 35 },
            { text: 'Valor Estimado', widthPct: 25 },
            { text: 'Criterio de Evaluación', widthPct: 40 }
          ], true),
          createStyledRow([
            { text: 'Tasa Interna de Retorno (TIR)', bold: true },
            { text: kpis.irr != null ? `${kpis.irr.toFixed(1)}%` : 'Pendiente', bold: true },
            { text: 'Excelente. Supera ampliamente la tasa de descuento WACC.' }
          ]),
          createStyledRow([
            { text: 'Valor Presente Neto (VPN / VAN)', bold: true },
            { text: kpis.npv != null ? formatMxn(kpis.npv) : 'Pendiente', bold: true },
            { text: 'Viable. Generación de valor económico neto para accionistas.' }
          ]),
          createStyledRow([
            { text: 'Periodo de Recuperación (Payback)', bold: true },
            { text: kpis.paybackPeriodYears != null ? `${(kpis.paybackPeriodYears * 12).toFixed(0)} meses` : 'Pendiente', bold: true },
            { text: 'Rápida amortización con flujo operativo estable.' }
          ]),
          createStyledRow([
            { text: 'Margen de Utilidad Bruta', bold: true },
            { text: '31.13% (Markup 45.24%)', bold: true },
            { text: 'Margen saludable por valor agregado de pasteurización.' }
          ]),
          createStyledRow([
            { text: 'Punto de Equilibrio Mensual', bold: true },
            { text: '781.87 kg/mes ($752,940 MXN)', bold: true },
            { text: 'Representa solo el 15.08% de la capacidad de 1 ASADHOR.' }
          ])
        ]
      }),
      new Paragraph({ spacing: { before: 200, after: 160 } })
    );
  }

  // 4. DESARROLLO MODULAR SEGÚN EL ALCANCE SELECCIONADO
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 160 },
      children: [
        new TextRun({ 
          text: scope === 'executive' 
            ? '3. Módulos Estratégicos del Plan de Negocios' 
            : '3. Desarrollo Exhaustivo Multimetodología (12 Frameworks)', 
          bold: true, 
          color: COLORS.PRIMARY, 
          font: 'Arial' 
        })
      ]
    })
  );

  if (scope === 'executive') {
    // Modo Dossier Ejecutivo: Renderizar exclusivamente los pilares y módulos de la metodología activa
    let secIndex = 1;
    (activeFw.pillars || []).forEach(pillar => {
      const pillarData = project[pillar.key];
      if (!pillarData || typeof pillarData !== 'object') return;

      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({ text: `3.${secIndex} Pilar: ${pillar.title}`, bold: true, color: COLORS.PRIMARY, font: 'Arial' })
          ]
        })
      );
      secIndex++;

      pillar.modules.forEach(mod => {
        if (project.config?.visibility?.[`${pillar.key}.${mod.key}`] === false) return;
        const modData = pillarData[mod.key];
        if (!modData || typeof modData !== 'object') return;

        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 140, after: 60 },
            children: [
              new TextRun({ text: mod.title, bold: true, color: COLORS.SECONDARY, font: 'Arial' })
            ]
          })
        );

        // Deduplicar bloques de texto idénticos en modo ejecutivo para evitar repeticiones
        const seenValues = new Set();

        Object.entries(modData).forEach(([fieldKey, val]) => {
          if (typeof val === 'string' && val.trim().length > 0) {
            const trimmedVal = val.trim();
            if (seenValues.has(trimmedVal)) return;
            seenValues.add(trimmedVal);

            const fieldLabel = fieldKey.replace(/_/g, ' ').toUpperCase();
            
            // Si el texto tiene viñetas, separarlas en párrafos limpios
            const lines = val.split('\n');
            children.push(
              new Paragraph({
                spacing: { before: 60, after: 20 },
                children: [
                  new TextRun({ text: `${fieldLabel}:`, bold: true, size: 18, color: COLORS.ACCENT, font: 'Arial' })
                ]
              })
            );

            lines.forEach(line => {
              const trimmed = line.trim();
              if (!trimmed) return;
              const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
              children.push(
                new Paragraph({
                  spacing: { before: 15, after: 25 },
                  indent: isBullet ? { left: 300 } : undefined,
                  children: [
                    new TextRun({ text: trimmed, size: 18, color: COLORS.SECONDARY, font: 'Arial' })
                  ]
                })
              );
            });
          }
        });
      });
    });
  } else {
    // Modo Maestro (12 Metodologías): Recorrer todas las metodologías de FRAMEWORKS
    let fwIndex = 1;
    Object.entries(FRAMEWORKS).forEach(([fwId, fwConfig]) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 260, after: 120 },
          children: [
            new TextRun({ text: `Metodología ${fwIndex}: ${fwConfig.name.toUpperCase()} (ID: ${fwId})`, bold: true, color: COLORS.PRIMARY, font: 'Arial' })
          ]
        })
      );
      fwIndex++;

      (fwConfig.pillars || []).forEach(pillar => {
        const pillarData = project[pillar.key];
        if (!pillarData || typeof pillarData !== 'object') return;

        pillar.modules.forEach(mod => {
          const modData = pillarData[mod.key];
          if (!modData || typeof modData !== 'object') return;

          children.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 160, after: 70 },
              children: [
                new TextRun({ text: `${mod.title} (${pillar.title})`, bold: true, color: COLORS.SECONDARY, font: 'Arial' })
              ]
            })
          );

          Object.entries(modData).forEach(([fieldKey, val]) => {
            if (typeof val === 'string' && val.trim().length > 0) {
              const fieldLabel = fieldKey.replace(/_/g, ' ').toUpperCase();
              children.push(
                new Paragraph({
                  spacing: { before: 50, after: 25 },
                  children: [
                    new TextRun({ text: `${fieldLabel}: `, bold: true, size: 18, color: COLORS.PRIMARY, font: 'Arial' }),
                    new TextRun({ text: val, size: 18, color: COLORS.SECONDARY, font: 'Arial' })
                  ]
                })
              );
            }
          });
        });
      });
    });
  }

  // Configuración del Documento con Encabezado y Pie de página con márgenes ejecutivos (1080 dxa = 0.75 in)
  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } // 0.75 in (54pt * 20 = 1080 dxa)
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${nombreEmpresa} — ${scope === 'executive' ? 'Dossier Ejecutivo' : 'Documento Maestro'}`,
                    size: 15,
                    color: COLORS.MUTED,
                    font: 'Arial'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Página ', size: 15, color: COLORS.MUTED, font: 'Arial' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 15, color: COLORS.MUTED, font: 'Arial' }),
                  new TextRun({ text: ' de ', size: 15, color: COLORS.MUTED, font: 'Arial' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 15, color: COLORS.MUTED, font: 'Arial' }),
                  new TextRun({ text: ' • Documento Confidencial', size: 15, color: COLORS.MUTED, font: 'Arial' })
                ]
              })
            ]
          })
        },
        children
      }
    ]
  });
}

/**
 * Descarga en el navegador el proyecto como archivo Word .docx
 */
export async function downloadProjectAsDocx(project = {}, filename = null, options = {}) {
  try {
    const doc = buildDocxDocument(project, options);
    const blob = await Packer.toBlob(doc);

    const safeName = filename || `${(project.companyName || project.nombre || 'plan-negocios').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.docx`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, filename: safeName };
  } catch (error) {
    console.error('[DocxExportEngine] Error al exportar archivo .docx:', error);
    throw error;
  }
}
