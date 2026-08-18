import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Funciones puras de cálculo y normalización para widgets especializados
 */
export function parseProblemTree(rawContent) {
  if (typeof rawContent === 'object' && rawContent !== null) {
    return {
      problemaCentral: rawContent.problema_central || rawContent.problemaCentral || 'Sin definir',
      causas: Array.isArray(rawContent.causas) ? rawContent.causas : [],
      efectos: Array.isArray(rawContent.efectos) ? rawContent.efectos : []
    };
  }

  // Parseo fallback desde texto markdown
  const text = String(rawContent || '');
  const causas = [];
  const efectos = [];
  let problemaCentral = 'Problema Principal Identificado';

  const lines = text.split('\n');
  let currentSection = '';

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().includes('problema central') || trimmed.toLowerCase().includes('problema principal')) {
      currentSection = 'problema';
    } else if (trimmed.toLowerCase().includes('causa')) {
      currentSection = 'causa';
    } else if (trimmed.toLowerCase().includes('efecto') || trimmed.toLowerCase().includes('consecuencia')) {
      currentSection = 'efecto';
    } else if (trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
      const item = trimmed.replace(/^[-*\d.]+\s*/, '').trim();
      if (item) {
        if (currentSection === 'causa') causas.push(item);
        else if (currentSection === 'efecto') efectos.push(item);
        else if (currentSection === 'problema') problemaCentral = item;
      }
    }
  });

  return {
    problemaCentral,
    causas: causas.length > 0 ? causas : ['Falta de optimización de procesos', 'Altos costos operativos'],
    efectos: efectos.length > 0 ? efectos : ['Pérdida de competitividad', 'Baja rentabilidad']
  };
}

export function generateProblemTreeMermaid(treeData) {
  const { problemaCentral, causas, efectos } = treeData;
  let diagram = 'graph TD\n';
  diagram += `  PC["🎯 Problema Central: ${problemaCentral.replace(/"/g, "'")}"]\n`;

  causas.forEach((c, idx) => {
    diagram += `  C${idx}["⚠️ Causa: ${c.replace(/"/g, "'")}"] --> PC\n`;
  });

  efectos.forEach((e, idx) => {
    diagram += `  PC --> E${idx}["💥 Efecto: ${e.replace(/"/g, "'")}"]\n`;
  });

  return diagram;
}

export function calculateAmoebaValueAdded(amoeba) {
  const ingresos = Number(amoeba.ingresos || 0);
  const gastosExternos = Number(amoeba.gastosExternos || 0);
  const horasTotales = Number(amoeba.horasHombre || 1);

  const valorAnadidoNeto = Math.max(0, ingresos - gastosExternos);
  const valorAnadidoPorHora = horasTotales > 0 ? valorAnadidoNeto / horasTotales : 0;

  return {
    valorAnadidoNeto,
    valorAnadidoPorHora: Number(valorAnadidoPorHora.toFixed(2)),
    esRentable: valorAnadidoNeto > 0
  };
}

test('Specialized Framework Widgets - TDD Test Suite', async (t) => {
  await t.test('Debe estructurar correctamente el Árbol de Problemas y generar Mermaid', () => {
    const rawData = {
      problema_central: 'Baja tasa de retención de clientes',
      causas: ['Atención al cliente deficiente', 'Tiempos de entrega lentos'],
      efectos: ['Disminución de ingresos', 'Deterioro de reputación de marca']
    };

    const tree = parseProblemTree(rawData);
    assert.equal(tree.problemaCentral, 'Baja tasa de retención de clientes');
    assert.equal(tree.causas.length, 2);
    assert.equal(tree.efectos.length, 2);

    const mermaidCode = generateProblemTreeMermaid(tree);
    assert.ok(mermaidCode.includes('graph TD'));
    assert.ok(mermaidCode.includes('Problema Central: Baja tasa de retención de clientes'));
    assert.ok(mermaidCode.includes('--> PC'));
  });

  await t.test('Debe calcular con precisión el valor añadido por hora en Amoeba Management', () => {
    const amoebaProduccion = {
      nombre: 'Célula de Ensamble y Calidad',
      ingresos: 150000,         // Ingreso por ventas / transferencias
      gastosExternos: 60000,    // Compras a proveedores externos
      horasHombre: 800          // Horas trabajadas por el equipo en el mes
    };

    const result = calculateAmoebaValueAdded(amoebaProduccion);
    assert.equal(result.valorAnadidoNeto, 90000);
    assert.equal(result.valorAnadidoPorHora, 112.5); // 90,000 / 800
    assert.equal(result.esRentable, true);
  });
});
