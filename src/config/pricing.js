// [MDD] Modelo de precios de API (USD por 1M tokens) — actualizado para 2026
export const API_COSTS = {
  'gemini-1.5-flash':       { input: 0.075, output: 0.30,  name: 'Gemini 1.5 Flash' },
  'gemini-1.5-pro':         { input: 1.25,  output: 5.00,  name: 'Gemini 1.5 Pro' },
  'gemini-3.6-flash':       { input: 0.10,  output: 0.40,  name: 'Gemini 3.6 Flash' },
  'llama-3.3-70b-versatile':{ input: 0.59,  output: 0.79,  name: 'Groq Llama 3.3 70B' },
  'mistral-large-latest':   { input: 2.00,  output: 6.00,  name: 'Mistral Large' },
  'gpt-4o':                 { input: 2.50,  output: 10.00, name: 'GPT-4o' },
  'gpt-4o-mini':            { input: 0.15,  output: 0.60,  name: 'GPT-4o Mini' },
  'gpt-4.5':                { input: 5.00,  output: 15.00, name: 'GPT-4.5' },
  'gpt-5':                  { input: 10.00, output: 30.00, name: 'GPT-5' },
  'gpt-5.6-luna':           { input: 1.00,  output: 3.00,  name: 'GPT-5.6 Luna' },
  'gpt-5.6-terra':          { input: 5.00,  output: 15.00, name: 'GPT-5.6 Terra' },
  'gpt-5.6-sol':            { input: 15.00, output: 45.00, name: 'GPT-5.6 Sol' },
  'claude-3.5-sonnet':      { input: 3.00,  output: 15.00, name: 'Claude 3.5 Sonnet' },
  'claude-5-sonnet':        { input: 4.00,  output: 18.00, name: 'Claude 5 Sonnet' },
  'claude-5-opus':          { input: 15.00, output: 75.00, name: 'Claude 5 Opus' },
  'claude-fable-5':         { input: 12.00, output: 60.00, name: 'Claude Fable 5' },
};

/**
 * Calcula el costo estimado en base al uso de tokens
 * @param {string} model El modelo utilizado
 * @param {number} promptTokens Cantidad de tokens de entrada
 * @param {number} completionTokens Cantidad de tokens de salida
 * @returns {number} Costo en USD
 */
export function calculateCost(model, promptTokens, completionTokens) {
  if (!model) return 0;
  
  // Buscar coincidencia exacta o parcial
  const pricingKey = Object.keys(API_COSTS).find(k => model.includes(k)) || 
                     Object.keys(API_COSTS).find(k => k.includes(model));
                     
  if (!pricingKey || !API_COSTS[pricingKey]) return 0;

  const cost = API_COSTS[pricingKey];
  const inputCost = (promptTokens / 1_000_000) * cost.input;
  const outputCost = (completionTokens / 1_000_000) * cost.output;

  return inputCost + outputCost;
}
