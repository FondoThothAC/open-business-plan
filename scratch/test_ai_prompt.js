import { generateModuleContent } from '../src/lib/ai.js';

// Mock global fetch to intercept and log the prompt sent to the AI, and return a mock response
global.fetch = async (url, options) => {
  if (url.includes('/api/log')) {
    // Silently consume logs
    return { ok: true, json: async () => ({}) };
  }
  
  if (url.includes('/api/tags')) {
    // Return mock Ollama models list
    return {
      ok: true,
      json: async () => ({ models: [{ name: 'nemotron-3-nano:4b' }] })
    };
  }

  // Intercept the LLM request
  if (url.includes('/api/generate') || url.includes('/v1/chat/completions') || url.includes('googleapis.com')) {
    const body = JSON.parse(options.body);
    console.log('\n======================================================================');
    console.log('🧪 INTERCEPTADO: PROMPT ENVIADO A LA IA');
    console.log('======================================================================');
    console.log(body.prompt || body.messages?.[0]?.content || JSON.stringify(body, null, 2));
    console.log('======================================================================\n');
    
    // Return mock JSON matching the requested keys
    return {
      ok: true,
      json: async () => ({
        response: JSON.stringify({
          true_north: "Cero emisiones de carbono y cero colisiones para 2040 en todas nuestras líneas de vehículos."
        })
      })
    };
  }
  
  return { ok: true, json: async () => ({}) };
};

// Mock planData for Hoshin Kanri framework
const mockPlanData = {
  config: {
    projectType: 'hoshin_kanri',
    ai: {
      primaryProvider: 'ollama',
      model: 'nemotron',
      depth: 1, // fast
      endpoint: 'http://localhost:11434'
    }
  },
  semilla: {
    negocio: {
      nombre_marca: 'EcoAuto',
      giro: 'Vehículos eléctricos'
    }
  }
};

const mockModule = {
  title: 'True North',
  description: 'Establecimiento de la visión de largo plazo (10-100 años) alineada con la ejecución diaria.',
  fields: [
    { key: 'true_north', label: 'True North (Visión a 10 años)' }
  ]
};

console.log('🚀 Iniciando prueba del orquestador de IA con Metodología Hoshin Kanri...');
try {
  const result = await generateModuleContent(mockPlanData.config.ai, mockModule, mockPlanData);
  console.log('✅ Resultado obtenido y parseado de forma segura por el orquestador:');
  console.log(result);
} catch (error) {
  console.error('❌ La prueba falló:', error);
}
