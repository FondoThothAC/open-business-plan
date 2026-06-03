const fs = require('fs');
let content = fs.readFileSync('src/lib/ai.js', 'utf8');

// Replace gemma4:e4b with gemma4:e2b-mlx
content = content.replace(/gemma4:e4b/g, 'gemma4:e2b-mlx');

// Ensure functions are appended if they are missing
if (!content.includes('generateExpertSuggestion')) {
  const toAppend = `
// ─────────────────────────────────────────────────────────────────────────
// Sugerencia tipo "Mesa de Expertos" para mejorar texto (UI ExpertPanel)
// ─────────────────────────────────────────────────────────────────────────
export async function generateExpertSuggestion(config, { expertRole, fieldLabel, currentValue, planData }) {
  const { apiKey, groqKey, endpoint, model } = config || {};

  const companyName = planData?.config?.brandKit?.companyName
    ? \`Proyecto/Empresa: \${planData.config.brandKit.companyName}\\n\`
    : '';

  const semillaContext = planData?.semilla
    ? \`Contexto del emprendedor (semilla):\\n\${JSON.stringify(planData.semilla, null, 2)}\\n\`
    : '';

  const prompt = \`
Eres un miembro de una "Mesa de Expertos" en planes de negocio.
Rol: \${expertRole}
\${companyName}
\${semillaContext}

Campo a mejorar: "\${fieldLabel}"

Texto actual:
"""\${currentValue || ''}"""

TAREA:
1) Reescribe el texto para que quede profesional, claro y accionable.
2) Mantén el mismo idioma (español).
3) Evita relleno; usa frases concretas y métricas cuando aplique.

Responde SOLO con la versión mejorada, sin introducciones.
\`;

  const providers = [
    { provider: 'ollama', endpoint, model: model || 'gemma4:e2b-mlx' },
    { provider: 'groq', apiKey: groqKey, model: 'llama-3.3-70b-versatile' },
    { provider: 'gemini', apiKey, model: 'gemini-1.5-flash' },
  ];

  let lastError = null;
  for (const pConfig of providers) {
    try {
      const text = await callAiProvider(pConfig, prompt, false);
      return (text || '').trim();
    } catch (error) {
      lastError = error;
      console.warn(\`generateExpertSuggestion falla en \${pConfig.provider}: \${error.message}\`);
    }
  }

  throw new Error(lastError?.message || 'No se pudo generar sugerencia.');
}

// ─────────────────────────────────────────────────────────────────────────
// Resumen de texto para UI (ModuleField)
// ─────────────────────────────────────────────────────────────────────────
export async function summarizeText(config, text) {
  const { apiKey, groqKey, endpoint, model } = config || {};

  const prompt = \`
Eres un editor profesional de planes de negocio.
TAREA: Resume el texto manteniendo la idea central, datos clave y tono ejecutivo.
Reglas:
- Responde SOLO con el resumen (sin prefacios).
- Máximo 3–4 oraciones.
- Conserva números, porcentajes y supuestos importantes.

Texto:
"""\${text || ''}"""
\`;

  const providers = [
    { provider: 'ollama', endpoint, model: model || 'gemma4:e2b-mlx' },
    { provider: 'groq', apiKey: groqKey, model: 'llama-3.3-70b-versatile' },
    { provider: 'gemini', apiKey, model: 'gemini-1.5-flash' },
  ];

  let lastError = null;
  for (const pConfig of providers) {
    try {
      const out = await callAiProvider(pConfig, prompt, false);
      return (out || '').trim();
    } catch (error) {
      lastError = error;
      console.warn(\`summarizeText falla en \${pConfig.provider}: \${error.message}\`);
    }
  }

  throw new Error(lastError?.message || 'No se pudo resumir el texto.');
}
`;
  content += '\n' + toAppend;
}

fs.writeFileSync('src/lib/ai.js', content, 'utf8');
