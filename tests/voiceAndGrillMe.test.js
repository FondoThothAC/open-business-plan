import test from 'node:test';
import assert from 'node:assert/strict';

// Helper para simular comandos de voz del usuario a acciones del plan
function parseVoiceCommand(transcript) {
  if (!transcript || typeof transcript !== 'string') return { action: 'UNKNOWN', confidence: 0 };
  const text = transcript.toLowerCase().trim();

  // Comandos de inversión / capex
  const capexMatch = text.match(/(?:inversi[oó]n|capex|capital inicial).*?(\d[\d,.]*)/i);
  if (capexMatch) {
    const rawVal = capexMatch[1].replace(/,/g, '');
    const amount = parseFloat(rawVal);
    if (!isNaN(amount)) {
      return { action: 'UPDATE_CAPEX', amount, raw: text, confidence: 0.95 };
    }
  }

  // Comandos de navegación
  if (text.includes('vista previa') || text.includes('imprimir') || text.includes('reporte')) {
    return { action: 'NAVIGATE', route: '/vista-previa', confidence: 0.9 };
  }
  if (text.includes('configuraci[oó]n') || text.includes('api') || text.includes('llaves')) {
    return { action: 'NAVIGATE', route: '/configuracion', confidence: 0.9 };
  }
  if (text.includes('semilla') || text.includes('anteproyecto')) {
    return { action: 'NAVIGATE', route: '/semilla', confidence: 0.9 };
  }

  // Comandos de industrialización
  if (text.includes('industrializar') || text.includes('generar plan') || text.includes('iniciar agentes')) {
    return { action: 'START_INDUSTRIALIZATION', confidence: 0.92 };
  }

  return { action: 'CHAT_QUERY', query: text, confidence: 0.8 };
}

// Helper para validar preguntas Grill-Me de desambiguación
function generateGrillMeOptions(question, context = {}) {
  return {
    id: `grill_${Date.now()}`,
    question: question || '¿Cuál es el modelo principal de monetización?',
    options: [
      { key: 'A', text: 'B2B Corporativo (Ventas directas y contratos anuales)' },
      { key: 'B', text: 'B2C Suscripción (Recurrente mensual para usuario final)' },
      { key: 'C', text: 'Marketplace / Comisión transaccional por intermediación' }
    ],
    allowCustom: true,
    pillar: context.pillar || 'mercado',
    module: context.module || 'modelo_ingresos'
  };
}

test('Voice Engine & Grill-Me Human-in-the-Loop - TDD Test Suite', async (t) => {
  await t.test('Debe reconocer comandos de ajuste de inversión por voz', () => {
    const cmd1 = parseVoiceCommand('Ajusta la inversión inicial a 500,000 pesos');
    assert.equal(cmd1.action, 'UPDATE_CAPEX');
    assert.equal(cmd1.amount, 500000);

    const cmd2 = parseVoiceCommand('Cambiar el capex a 1250000');
    assert.equal(cmd2.action, 'UPDATE_CAPEX');
    assert.equal(cmd2.amount, 1250000);
  });

  await t.test('Debe reconocer comandos de navegación por voz', () => {
    const nav1 = parseVoiceCommand('Llévame a la vista previa');
    assert.equal(nav1.action, 'NAVIGATE');
    assert.equal(nav1.route, '/vista-previa');

    const nav2 = parseVoiceCommand('Abrir configuración de apis');
    assert.equal(nav2.action, 'NAVIGATE');
    assert.equal(nav2.route, '/configuracion');
  });

  await t.test('Debe generar opciones interactivas para el modal Grill-Me', () => {
    const grill = generateGrillMeOptions('¿Cuál es tu canal de distribución primario?', { pillar: 'mercado', module: 'canales' });
    assert.ok(grill.id.startsWith('grill_'));
    assert.equal(grill.options.length, 3);
    assert.equal(grill.allowCustom, true);
    assert.equal(grill.pillar, 'mercado');
  });
});
