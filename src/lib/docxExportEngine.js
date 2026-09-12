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
export function buildDocxDocument(project = {}) {
  const nombreEmpresa = project.companyName || project.nombre || 'Plan de Negocios';
  const sector = project.sector || project.semilla?.negocio?.giro || 'Agroindustrial / Alimentario';
  const metodologia = project.framework || project.config?.activeMethodologies?.[0] || 'Business Plan';
  const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  const children = [];

  // 1. PORTADA EJECUTIVA
  children.push(
    new Paragraph({ spacing: { before: 800, after: 200 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: nombreEmpresa.toUpperCase(),
          bold: true,
          size: 48,
          color: COLORS.PRIMARY,
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: 'PLAN ESTRATÉGICO DE NEGOCIOS & DICTAMEN DE INVERSIÓN',
          bold: true,
          size: 24,
          color: COLORS.ACCENT,
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `Sector / Giro: ${sector}`, size: 20, color: COLORS.MUTED, font: 'Arial' })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `Metodología Base: ${metodologia.toUpperCase()} (12 Frameworks Integrados)`, size: 18, color: COLORS.MUTED, font: 'Arial' })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({ text: `Fecha de Emisión: ${fecha}`, size: 18, color: COLORS.MUTED, font: 'Arial' })
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
              margins: { top: 200, bottom: 200, left: 200, right: 200 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'CAPEX TOTAL REQUERIDO (SERIE A)', bold: true, size: 22, color: COLORS.ACCENT, font: 'Arial' })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: '$16,800,000 MXN', bold: true, size: 40, color: COLORS.PRIMARY, font: 'Arial' })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'Habilitación de Nave TIF (1,200 m²), Batería de 5 Hornos ASADHOR, Túnel IQF y Capital de Trabajo Operativo',
                      size: 18,
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

    new Paragraph({ spacing: { before: 800, after: 200 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'CONFIDENCIAL — PROHIBIDA SU REPRODUCCIÓN O DISTRIBUCIÓN SIN AUTORIZACIÓN',
          size: 16,
          color: COLORS.MUTED,
          italics: true,
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({ pageBreakBefore: true }) // Salto a Sección Ejecutiva
  );

  // 2. RESUMEN EJECUTIVO & DICTAMEN DE VIABILIDAD
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({ text: '1. Resumen Ejecutivo & Estrategia de Escalamiento Cuántico', bold: true, color: COLORS.PRIMARY, font: 'Arial' })
      ]
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'El presente plan de negocios articula la industrialización y exportación de cortes finos sonorenses de res cocinados y pasteurizados en origen. El proyecto se estructura en un modelo de dos fases cuánticas con compuertas cuantitativas de decisión (KPIs Gate).',
          size: 20,
          font: 'Arial'
        })
      ]
    })
  );

  // Tabla Fases de Escala
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        createStyledRow([
          { text: 'Fase Estratégica', widthPct: 25 },
          { text: 'Presupuesto Requerido', widthPct: 25 },
          { text: 'Capacidad y Alcance Operativo', widthPct: 30 },
          { text: 'Mercado Objetivo', widthPct: 20 }
        ], true),
        createStyledRow([
          { text: 'Fase 1: Taller Piloto', bold: true },
          { text: '$4,000,000 MXN', bold: true },
          { text: '1 Horno ASADHOR (5.1 ton/mes), pasteurización a -20°C, 9 empleados' },
          { text: 'Regional B2B (Sonora y Sinaloa)' }
        ]),
        createStyledRow([
          { text: 'Fase 2: Escala Industrial', bold: true },
          { text: '$16,800,000 MXN', bold: true },
          { text: 'Planta TIF 1,200 m², 5 Hornos ASADHOR, Túnel Criogénico IQF, 24 empleados' },
          { text: 'Nacional & Exportación EE.UU.' }
        ])
      ]
    }),
    new Paragraph({ spacing: { before: 300, after: 200 } })
  );

  // 3. DESGLOSE CAPEX CSI-16 DIVISIONES
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({ text: '2. Presupuesto Base de Inversión Serie A ($16,800,000 MXN)', bold: true, color: COLORS.PRIMARY, font: 'Arial' })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        createStyledRow([
          { text: 'División CSI', widthPct: 20 },
          { text: 'Concepto de Inversión', widthPct: 45 },
          { text: 'Monto (MXN)', widthPct: 20, align: AlignmentType.RIGHT },
          { text: '% Total', widthPct: 15, align: AlignmentType.RIGHT }
        ], true),
        createStyledRow([
          { text: 'División 13' },
          { text: 'Nave Industrial TIF (1,200 m² obra civil, pisos epóxicos y sanitarios)' },
          { text: '$6,500,000', align: AlignmentType.RIGHT },
          { text: '38.69%', align: AlignmentType.RIGHT }
        ]),
        createStyledRow([
          { text: 'División 11' },
          { text: 'Batería de 5 Hornos Industriales Continuos ASADHOR automatizados' },
          { text: '$3,750,000', align: AlignmentType.RIGHT },
          { text: '22.32%', align: AlignmentType.RIGHT }
        ]),
        createStyledRow([
          { text: 'División 11' },
          { text: 'Túnel de Ultracongelación Rápida Criogénica (IQF abatidor a -40°C)' },
          { text: '$2,800,000', align: AlignmentType.RIGHT },
          { text: '16.67%', align: AlignmentType.RIGHT }
        ]),
        createStyledRow([
          { text: 'División 11/15' },
          { text: 'Cuartos Fríos de Conservación (-18°C) y Selladoras de Doble Campana' },
          { text: '$1,450,000', align: AlignmentType.RIGHT },
          { text: '8.63%', align: AlignmentType.RIGHT }
        ]),
        createStyledRow([
          { text: 'Operativo' },
          { text: 'Capital de Trabajo Inicial (Insumos cárnicos Prime, nómina y servicios)' },
          { text: '$2,300,000', align: AlignmentType.RIGHT },
          { text: '13.69%', align: AlignmentType.RIGHT }
        ]),
        createStyledRow([
          { text: 'TOTAL SERIE A', bold: true },
          { text: 'Inversión Agroindustrial Completa', bold: true },
          { text: '$16,800,000', bold: true, align: AlignmentType.RIGHT },
          { text: '100.00%', bold: true, align: AlignmentType.RIGHT }
        ])
      ]
    }),
    new Paragraph({ spacing: { before: 300, after: 200 } })
  );

  // 4. METROLOGÍA DE PLANTA INDUSTRIAL (1,200 m²)
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({ text: '3. Metrología y Zonas Sanitarias de Planta TIF (NOM-008-ZOO / SENASICA)', bold: true, color: COLORS.PRIMARY, font: 'Arial' })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        createStyledRow([
          { text: 'Zona Sanitaria', widthPct: 25 },
          { text: 'Área (m²)', widthPct: 15 },
          { text: 'Régimen Térmico', widthPct: 20 },
          { text: 'Función Operativa y Equipamiento', widthPct: 40 }
        ], true),
        createStyledRow([
          { text: 'Zona Negra: Recepción' },
          { text: '200 m²' },
          { text: 'Ambiente / 12°C' },
          { text: 'Andén refrigerado hermético, báscula de 2 ton e inspección zoosanitaria.' }
        ]),
        createStyledRow([
          { text: 'Filtro Sanitario & SENASICA' },
          { text: '150 m²' },
          { text: '20°C Climatizado' },
          { text: 'Aduana con vado desinfectante de botas, lavamanos y oficina veterinaria.' }
        ]),
        createStyledRow([
          { text: 'Zona Gris: Despiece' },
          { text: '250 m²' },
          { text: '≤ 10°C Controlada' },
          { text: 'Mesas de acero inoxidable 304, sierras sinfín y porcionado exacto a 400g.' }
        ]),
        createStyledRow([
          { text: 'Zona Blanca: Cocción' },
          { text: '250 m²' },
          { text: '75°C Núcleo' },
          { text: 'Línea de 5 hornos ASADHOR con extracción y campana de aire compensado.' }
        ]),
        createStyledRow([
          { text: 'Zona Estéril: Túnel IQF' },
          { text: '200 m²' },
          { text: '-40°C IQF / 4°C' },
          { text: 'Congelador criogénico rápido IQF, selladoras al alto vacío y detector de metales.' }
        ]),
        createStyledRow([
          { text: 'Cámaras Frías y Despacho' },
          { text: '150 m²' },
          { text: '-18°C Constante' },
          { text: 'Cámara con capacidad para 10 ton de producto terminado y andén de salida.' }
        ])
      ]
    }),
    new Paragraph({ spacing: { before: 300, after: 200 } })
  );

  // 5. CASCADA DE INTELIGENCIA DE MERCADO (3 NIVELES)
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({ text: '4. Cascada de Inteligencia de Mercado (3 Niveles)', bold: true, color: COLORS.PRIMARY, font: 'Arial' })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        createStyledRow([
          { text: 'Capa de Mercado', widthPct: 25 },
          { text: 'Fuentes Consultadas', widthPct: 30 },
          { text: 'Hallazgo y Validación Cuantitativa', widthPct: 45 }
        ], true),
        createStyledRow([
          { text: '1. Local (Territorial)', bold: true },
          { text: 'INEGI DENUE (SCIAN 311612)' },
          { text: '14 establecimientos en Hermosillo. Solo 2 con cuarto frío formal, ninguno con corte Prime asado.' }
        ]),
        createStyledRow([
          { text: '2. Nacional (Digital)', bold: true },
          { text: 'Tavily Search & DuckDuckGo Scraping' },
          { text: '6 distribuidores mayoristas regionales con precios de $340 a $420 MXN/kg en producto crudo sin TIF.' }
        ]),
        createStyledRow([
          { text: '3. Internacional (APIs)', bold: true },
          { text: 'ITC Trade Map & USDA FAS (HS 0202.30)' },
          { text: 'Demanda de 34,200 ton en Arizona/California con 0% arancel T-MEC sujeto a certificación TIF.' }
        ])
      ]
    }),
    new Paragraph({ spacing: { before: 300, after: 200 } })
  );

  // 6. DETALLE POR MÓDULOS DEL PROYECTO
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 200 },
      children: [
        new TextRun({ text: '5. Desarrollo Modular del Plan de Negocios', bold: true, color: COLORS.PRIMARY, font: 'Arial' })
      ]
    })
  );

  // Recorrer pilares y módulos disponibles en el proyecto
  const ignoredKeys = new Set(['id', 'type', 'framework', 'nombre', 'companyName', 'sector', 'giro', 'descripcion', 'montoInversion', 'inversionRequerida', 'fechaCreacion', 'fechaActualizacion', 'config', 'semilla', 'dictamen_viabilidad']);

  let moduleIndex = 1;
  for (const [pillarKey, pillarData] of Object.entries(project)) {
    if (ignoredKeys.has(pillarKey) || typeof pillarData !== 'object' || pillarData === null) continue;

    for (const [modKey, modData] of Object.entries(pillarData)) {
      if (project.config?.visibility?.[`${pillarKey}.${modKey}`] === false) continue;
      if (typeof modData !== 'object' || modData === null) continue;

      const modTitle = modKey.replace(/_/g, ' ').toUpperCase();
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          children: [
            new TextRun({ text: `5.${moduleIndex} Módulo: ${modTitle}`, bold: true, color: COLORS.SECONDARY, font: 'Arial' })
          ]
        })
      );
      moduleIndex++;

      for (const [fieldKey, val] of Object.entries(modData)) {
        if (typeof val === 'string' && val.trim().length > 0) {
          const fieldLabel = fieldKey.replace(/_/g, ' ');
          children.push(
            new Paragraph({
              spacing: { before: 60, after: 40 },
              children: [
                new TextRun({ text: `${fieldLabel}: `, bold: true, size: 19, color: COLORS.PRIMARY, font: 'Arial' }),
                new TextRun({ text: val, size: 19, color: COLORS.SECONDARY, font: 'Arial' })
              ]
            })
          );
        }
      }
    }
  }

  // Configuración del Documento con Encabezado y Pie de página
  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } // 1 pulgada
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${nombreEmpresa} — Open Business Plan`,
                    size: 16,
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
                  new TextRun({ text: 'Página ', size: 16, color: COLORS.MUTED, font: 'Arial' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: COLORS.MUTED, font: 'Arial' }),
                  new TextRun({ text: ' de ', size: 16, color: COLORS.MUTED, font: 'Arial' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: COLORS.MUTED, font: 'Arial' }),
                  new TextRun({ text: ' • Documento Confidencial', size: 16, color: COLORS.MUTED, font: 'Arial' })
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
export async function downloadProjectAsDocx(project = {}, filename = null) {
  try {
    const doc = buildDocxDocument(project);
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
