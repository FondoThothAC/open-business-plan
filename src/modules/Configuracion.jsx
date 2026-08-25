import { useState, useEffect } from 'react';
import { usePlan } from '../context/PlanContext';
import { Cpu, Palette, Save, Globe, Database, Upload, Image as ImageIcon, RefreshCw, Settings, Sliders, Activity, DollarSign, Zap, AlertTriangle, Info, Plus, Trash2, BookOpen, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import DocumentUploader from '../components/DocumentUploader';
import LogoGeneratorModal from '../components/LogoGeneratorModal';
import TokenTelemetryDashboard from '../components/TokenTelemetryDashboard';
import AiTraceabilityPanel from '../components/AiTraceabilityPanel';
import DigitalTwinDashboard from '../components/DigitalTwinDashboard';
import ApiQuotaMeter from '../components/ApiQuotaMeter';
import GlobalTokenMonitor from '../components/GlobalTokenMonitor';
import { FRAMEWORKS } from '../config/frameworks';

import { API_COSTS } from '../config/pricing';
const CTX_PRESETS = [
  { label: '8k',   value: 8192   },
  { label: '16k',  value: 16384  },
  { label: '32k',  value: 32768  },
  { label: '64k',  value: 65536  },
  { label: '128k', value: 131072 },
  { label: '256k', value: 262144 },
];

const PROVIDER_PRESETS = {
  ollama: [
    { value: 'minimax-m3:cloud', label: 'minimax-m3:cloud (Nube - Prioridad Recomendada)' },
    { value: 'qwen3.5:4b-mlx', label: 'qwen3.5:4b-mlx (Local)' },
    { value: 'nemotron-3-nano:4b', label: 'nemotron-3-nano:4b' },
    { value: 'qwen3.5:2b-mlx', label: 'qwen3.5:2b-mlx' },
    { value: 'gemma4:e2b-mlx', label: 'gemma4:e2b-mlx' },
    { value: 'kimi-k2.6:cloud', label: 'kimi-k2.6:cloud (Nube - Gratuito)' },
    { value: 'glm-5.1:cloud', label: 'glm-5.1:cloud (Nube - Gratuito)' },
    { value: 'qwen3.5:cloud', label: 'qwen3.5:cloud (Nube - Gratuito)' },
    { value: 'nemotron-3-super:cloud', label: 'nemotron-3-super:cloud (Nube - Gratuito)' },
    { value: 'gemma4:31b-cloud', label: 'gemma4:31b-cloud (Nube - Gratuito)' },
  ],
  minimax: [
    { value: 'minimax-m3:cloud', label: 'MiniMax M3 (Cloud 1M Tokens)' },
    { value: 'abab6.5-chat', label: 'MiniMax abab 6.5' },
  ],
  lmstudio: [
    { value: 'local-model', label: 'Local Model (Predeterminado)' },
  ],
  nvidia: [
    { value: 'nvidia/llama-3.1-nemotron-70b-instruct', label: 'NVIDIA NIM: Nemotron 70B' },
    { value: 'google/gemma-2-27b-it', label: 'NVIDIA NIM: Gemma 2 27B' },
  ],
  groq: [
    { value: 'openai/gpt-oss-120b', label: 'Groq: GPT-OSS 120B (Ultra Potente)' },
    { value: 'qwen/qwen3.6-27b', label: 'Groq: Qwen 3.6 27B' },
    { value: 'groq/compound-mini', label: 'Groq: Compound Mini (Rápido)' },
    { value: 'llama-3.3-70b-versatile', label: 'Groq: Llama 3.3 70B' },
    { value: 'llama-3.1-8b-instant', label: 'Groq: Llama 3.1 8B' },
  ],
  openrouter: [
    { value: 'nvidia/nemotron-3.5-lightning:free', label: 'OpenRouter: Nemotron 3.5 Lightning (1M ctx)' },
    { value: 'openai/gpt-oss-20b:free', label: 'OpenRouter: GPT-OSS 20B (131k ctx)' },
    { value: 'nvidia/nemotron-3-nano-30b-a3b:free', label: 'OpenRouter: Nemotron Nano 30B (256k ctx)' },
    { value: 'z-ai/glm-5.2:free', label: 'OpenRouter: GLM 5.2 (256k ctx)' },
  ],
  gemini: [
    { value: 'gemini-3.6-flash', label: 'Google: Gemini 3.6 Flash ★ Activo' },
    { value: 'gemini-3.5-flash-lite', label: 'Google: Gemini 3.5 Flash Lite' },
    { value: 'gemini-3.7-flash', label: 'Google: Gemini 3.7 Flash' },
    { value: 'gemini-1.5-flash', label: 'Google: Gemini 1.5 Flash (Legacy)' },
  ],
  openai: [
    { value: 'gpt-5.6-sol', label: 'OpenAI: GPT-5.6 Sol (Flagship)' },
    { value: 'gpt-5.6-terra', label: 'OpenAI: GPT-5.6 Terra (Balanced)' },
    { value: 'gpt-5.6-luna', label: 'OpenAI: GPT-5.6 Luna (Fast)' },
    { value: 'gpt-5', label: 'OpenAI: GPT-5' },
    { value: 'gpt-4.5', label: 'OpenAI: GPT-4.5' },
    { value: 'gpt-4o', label: 'OpenAI: GPT-4o' },
  ],
  claude: [
    { value: 'claude-fable-5', label: 'Anthropic: Claude Fable 5' },
    { value: 'claude-5-sonnet', label: 'Anthropic: Claude 5 Sonnet' },
    { value: 'claude-5-opus', label: 'Anthropic: Claude 5 Opus' },
  ],
  mistral: [
    { value: 'mistral-large-latest', label: 'Mistral Large' },
    { value: 'open-mixtral-8x22b', label: 'Mixtral 8x22B' },
  ]
};

// [DDD] Modelos por defecto activos para cada proveedor de nube
const CLOUD_PROVIDER_DEFAULTS = {
  groq:        'qwen/qwen3.6-27b',
  nvidia:      'nvidia/llama-3.1-nemotron-70b-instruct',
  mistral:     'mistral-large-latest',
  gemini:      'gemini-3.6-flash',
  openai:      'gpt-4o',
  openrouter:  'nvidia/nemotron-3.5-lightning:free',
  ollama:      'minimax-m3:cloud',
};

const getModelLabel = (p) => {
  if (p === 'ollama') return 'Modelo Local (Ollama)';
  if (p === 'lmstudio') return 'Modelo Local (LM Studio)';
  if (p === 'nvidia') return 'Modelo Cloud (NVIDIA NIM)';
  if (p === 'groq') return 'Modelo Cloud (Groq)';
  if (p === 'gemini') return 'Modelo Cloud (Gemini)';
  if (p === 'openai') return 'Modelo Cloud (OpenAI)';
  if (p === 'mistral') return 'Modelo Cloud (Mistral)';
  return 'Modelo de IA';
};

// [TDD] Función pura: estima costo de una generación de módulo completa (3 fases Mesa de Expertos)
function estimateMesaCost(contextTokens, model) {
  const pricing = API_COSTS[model];
  if (!pricing) return null;
  const avgInput  = contextTokens * 2.5; // promedio de tokens entrada entre 3 fases
  const avgOutput = 2400;
  const costUSD = (avgInput / 1e6 * pricing.input) + (avgOutput / 1e6 * pricing.output);
  return { costUSD, tokensIn: Math.round(avgInput), tokensOut: avgOutput };
}

import { getApiBase } from '../config/apiConfig';

// ─────────────────────────────────────────────────────────
//  Hook & Component to test API Connections
// ─────────────────────────────────────────────────────────
function useApiStatus(planData) {
  const [tavilyStatus, setTavilyStatus] = useState({ state: 'idle', message: '' });
  const [inegiStatus, setInegiStatus] = useState({ state: 'idle', message: '' });
  const [banxicoStatus, setBanxicoStatus] = useState({ state: 'idle', message: '' });
  const [groqStatus, setGroqStatus] = useState({ state: 'idle', message: '' });
  const [mistralStatus, setMistralStatus] = useState({ state: 'idle', message: '' });
  const [nvidiaStatus, setNvidiaStatus] = useState({ state: 'idle', message: '' });
  const [geminiStatus, setGeminiStatus] = useState({ state: 'idle', message: '' });
  const [openaiStatus, setOpenaiStatus] = useState({ state: 'idle', message: '' });
  const [claudeStatus, setClaudeStatus] = useState({ state: 'idle', message: '' });
  const [deepseekStatus, setDeepseekStatus] = useState({ state: 'idle', message: '' });
  const [grokStatus, setGrokStatus] = useState({ state: 'idle', message: '' });
  const [ollamaCloudStatus, setOllamaCloudStatus] = useState({ state: 'idle', message: '' });
  const [openrouterStatus, setOpenrouterStatus] = useState({ state: 'idle', message: '' });
  const [opencodeStatus, setOpencodeStatus] = useState({ state: 'idle', message: '' });
  const [tokenrouterStatus, setTokenrouterStatus] = useState({ state: 'idle', message: '' });

  const safeJsonParse = async (res) => {
    if (!res) return { success: false, error: 'Sin respuesta del servidor' };
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      if (res.status === 502 || text.includes('502 Bad Gateway')) {
        return { 
          success: false, 
          error: 'Servidor backend no disponible (502 Bad Gateway). Ejecuta "pm2 restart obp-backend" en tu servidor VPS.',
          isServerDown: true
        };
      }
      if (res.status === 504 || text.includes('504 Gateway Time-out')) {
        return { success: false, error: 'Tiempo de espera agotado en servidor (504 Gateway Timeout).' };
      }
      if (res.status === 404) {
        return { success: false, error: 'Ruta no encontrada en el backend (404 Not Found).' };
      }
      const cleanText = text.replace(/<[^>]*>/g, '').trim().slice(0, 100);
      return { success: false, error: cleanText || `Error de conexión (HTTP ${res.status})` };
    }
  };

  const testLlmProvider = async (provider, apiKey, setStatus) => {
    if (!apiKey) {
      setStatus({ state: 'idle', message: 'No configurado' });
      return;
    }
    setStatus({ state: 'checking', message: 'Probando...' });
    try {
      const backendBase = getApiBase();
      const res = await fetch(`${backendBase}/api/test/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      const data = await safeJsonParse(res);
      if (data.success) {
        setStatus({ state: 'online', message: 'En línea ✓' });
      } else {
        setStatus({ state: 'offline', message: data.error || 'Error de conexión' });
      }
    } catch (err) {
      setStatus({ state: 'offline', message: err.message });
    }
  };

  const testTavily = async (forcedKey = null) => {
    const key = forcedKey !== null ? forcedKey : (planData.config?.search?.apiKey || '');
    if (!key) {
      setTavilyStatus({ state: 'idle', message: 'No configurado' });
      return;
    }
    setTavilyStatus({ state: 'checking', message: 'Probando...' });
    try {
      const backendBase = getApiBase();
      const res = await fetch(`${backendBase}/api/test/tavily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key })
      });
      const data = await safeJsonParse(res);
      if (data.success) {
        setTavilyStatus({ state: 'online', message: 'En línea ✓' });
      } else {
        setTavilyStatus({ state: 'offline', message: data.error || 'API Key inválida' });
      }
    } catch (err) {
      setTavilyStatus({ state: 'offline', message: err.message });
    }
  };

  const testInegi = async (forcedToken = null) => {
    const token = forcedToken !== null ? forcedToken : (planData.config?.externalApis?.inegiToken || '');
    if (!token) {
      setInegiStatus({ state: 'idle', message: 'No configurado' });
      return;
    }
    setInegiStatus({ state: 'checking', message: 'Probando...' });
    try {
      const backendBase = getApiBase();
      const res = await fetch(`${backendBase}/api/test/inegi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await safeJsonParse(res);
      if (data.success) {
        setInegiStatus({ state: 'online', message: 'En línea ✓' });
      } else {
        setInegiStatus({ state: 'offline', message: data.error || 'Token inválido' });
      }
    } catch (err) {
      setInegiStatus({ state: 'offline', message: err.message });
    }
  };

  const testBanxico = async (forcedToken = null) => {
    const token = forcedToken !== null ? forcedToken : (planData.config?.externalApis?.banxicoToken || '');
    if (!token) {
      setBanxicoStatus({ state: 'idle', message: 'No configurado' });
      return;
    }
    setBanxicoStatus({ state: 'checking', message: 'Probando...' });
    try {
      const backendBase = getApiBase();
      const res = await fetch(`${backendBase}/api/test/banxico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await safeJsonParse(res);
      if (data.success) {
        setBanxicoStatus({ state: 'online', message: 'En línea ✓' });
      } else {
        setBanxicoStatus({ state: 'offline', message: data.error || 'Token inválido' });
      }
    } catch (err) {
      setBanxicoStatus({ state: 'offline', message: err.message });
    }
  };

  useEffect(() => {
    if (planData?.config?.search?.apiKey) testTavily(planData.config.search.apiKey);
    if (planData?.config?.externalApis?.inegiToken) testInegi(planData.config.externalApis.inegiToken);
    if (planData?.config?.externalApis?.banxicoToken) testBanxico(planData.config.externalApis.banxicoToken);
    if (planData?.config?.ai?.groqKey) testLlmProvider('groq', planData.config.ai.groqKey, setGroqStatus);
    if (planData?.config?.ai?.nvidiaKey) testLlmProvider('nvidia', planData.config.ai.nvidiaKey, setNvidiaStatus);
    if (planData?.config?.ai?.mistralKey || (planData?.config?.ai?.primaryProvider === 'mistral' && planData?.config?.ai?.apiKey)) {
      testLlmProvider('mistral', planData.config.ai.mistralKey || planData.config.ai.apiKey, setMistralStatus);
    }
    if (planData?.config?.ai?.apiKey && planData?.config?.ai?.primaryProvider === 'gemini') {
      testLlmProvider('gemini', planData.config.ai.apiKey, setGeminiStatus);
    }
    if (planData?.config?.ai?.openaiKey || (planData?.config?.ai?.primaryProvider === 'openai' && planData?.config?.ai?.apiKey)) {
      testLlmProvider('openai', planData.config.ai.openaiKey || planData.config.ai.apiKey, setOpenaiStatus);
    }
    if (planData?.config?.ai?.claudeKey) testLlmProvider('claude', planData.config.ai.claudeKey, setClaudeStatus);
    if (planData?.config?.ai?.deepseekKey) testLlmProvider('deepseek', planData.config.ai.deepseekKey, setDeepseekStatus);
    if (planData?.config?.ai?.grokKey) testLlmProvider('grok', planData.config.ai.grokKey, setGrokStatus);
    if (planData?.config?.ai?.ollamaKey) testLlmProvider('ollama_cloud', planData.config.ai.ollamaKey, setOllamaCloudStatus);
    if (planData?.config?.ai?.openrouterKey) testLlmProvider('openrouter', planData.config.ai.openrouterKey, setOpenrouterStatus);
    if (planData?.config?.ai?.opencodeKey) testLlmProvider('openrouter', planData.config.ai.opencodeKey, setOpencodeStatus);
    if (planData?.config?.ai?.tokenrouterKey) testLlmProvider('tokenrouter', planData.config.ai.tokenrouterKey, setTokenrouterStatus);
  }, []);

  return {
    tavilyStatus, setTavilyStatus, testTavily,
    inegiStatus, setInegiStatus, testInegi,
    banxicoStatus, setBanxicoStatus, testBanxico,
    groqStatus, setGroqStatus, testGroq: (k) => testLlmProvider('groq', k || planData.config?.ai?.groqKey, setGroqStatus),
    mistralStatus, setMistralStatus, testMistral: (k) => testLlmProvider('mistral', k || planData.config?.ai?.mistralKey || planData.config?.ai?.apiKey, setMistralStatus),
    nvidiaStatus, setNvidiaStatus, testNvidia: (k) => testLlmProvider('nvidia', k || planData.config?.ai?.nvidiaKey, setNvidiaStatus),
    geminiStatus, setGeminiStatus, testGemini: (k) => testLlmProvider('gemini', k || planData.config?.ai?.apiKey, setGeminiStatus),
    openaiStatus, setOpenaiStatus, testOpenai: (k) => testLlmProvider('openai', k || planData.config?.ai?.openaiKey || planData.config?.ai?.apiKey, setOpenaiStatus),
    claudeStatus, setClaudeStatus, testClaude: (k) => testLlmProvider('claude', k || planData.config?.ai?.claudeKey, setClaudeStatus),
    deepseekStatus, setDeepseekStatus, testDeepseek: (k) => testLlmProvider('deepseek', k || planData.config?.ai?.deepseekKey, setDeepseekStatus),
    grokStatus, setGrokStatus, testGrok: (k) => testLlmProvider('grok', k || planData.config?.ai?.grokKey, setGrokStatus),
    ollamaCloudStatus, setOllamaCloudStatus, testOllamaCloud: (k) => testLlmProvider('ollama_cloud', k || planData.config?.ai?.ollamaKey, setOllamaCloudStatus),
    openrouterStatus, setOpenrouterStatus, testOpenRouter: (k) => testLlmProvider('openrouter', k || planData.config?.ai?.openrouterKey, setOpenrouterStatus),
    opencodeStatus, setOpencodeStatus, testOpenCode: (k) => testLlmProvider('openrouter', k || planData.config?.ai?.opencodeKey, setOpencodeStatus),
    tokenrouterStatus, setTokenrouterStatus, testTokenRouter: (k) => testLlmProvider('tokenrouter', k || planData.config?.ai?.tokenrouterKey, setTokenrouterStatus),
  };
}

function ApiStatusBadge({ status, onTest, disabled }) {
  let badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    padding: '2px 8px',
    borderRadius: '12px',
    fontWeight: 700,
    border: '1px solid',
    transition: 'all 0.2s ease-in-out'
  };
  
  if (status.state === 'checking') {
    badgeStyle = {
      ...badgeStyle,
      background: 'rgba(245, 158, 11, 0.1)',
      color: '#f59e0b',
      borderColor: '#f59e0b'
    };
  } else if (status.state === 'online') {
    badgeStyle = {
      ...badgeStyle,
      background: 'rgba(16, 185, 129, 0.1)',
      color: '#10b981',
      borderColor: '#10b981',
      boxShadow: '0 0 8px rgba(16, 185, 129, 0.2)'
    };
  } else if (status.state === 'offline') {
    badgeStyle = {
      ...badgeStyle,
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      borderColor: '#ef4444'
    };
  } else {
    badgeStyle = {
      ...badgeStyle,
      background: 'rgba(156, 163, 175, 0.1)',
      color: '#9ca3af',
      borderColor: '#9ca3af'
    };
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
      <span style={badgeStyle}>
        {status.state === 'checking' && <RefreshCw size={12} className="animate-spin" />}
        {status.state === 'online' && <CheckCircle size={12} />}
        {status.state === 'offline' && <XCircle size={12} />}
        {status.message || 'Sin verificar'}
      </span>
      <button
        type="button"
        onClick={onTest}
        disabled={disabled || status.state === 'checking'}
        className="btn btn-secondary"
        style={{ padding: '2px 8px', fontSize: '0.7rem', height: 'auto', border: '1px solid var(--border-color)', background: 'var(--bg-panel-hover)' }}
      >
        Probar Conexión
      </button>
      {status.state === 'offline' && (
        <span style={{ fontSize: '0.65rem', color: '#ef4444', marginLeft: '0.25rem' }} title={status.message}>
          ({status.message.slice(0, 60)})
        </span>
      )}
    </div>
  );
}

export default function Configuracion() {
  const { planData, updateConfig } = usePlan();
  const apiStatus = useApiStatus(planData);
  const {
    groqStatus,
    testGroq,
    nvidiaStatus,
    testNvidia,
    mistralStatus,
    testMistral,
    geminiStatus,
    testGemini,
    openaiStatus,
    testOpenai,
    claudeStatus,
    testClaude,
    deepseekStatus,
    testDeepseek,
    grokStatus,
    testGrok,
    ollamaCloudStatus,
    testOllamaCloud,
    openrouterStatus,
    testOpenRouter,
    opencodeStatus,
    testOpenCode,
    tokenrouterStatus,
    testTokenRouter,
  } = apiStatus;

  const [ollamaModels, setOllamaModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [ollamaOnline, setOllamaOnline] = useState(false);
  // [EDD] Rastreo local de sesión de tokens (estimado)
  const [_sessionTokens, _setSessionTokens] = useState(() => {
    return parseInt(localStorage.getItem('op_session_tokens') || '0');
  });

  const [telemetryData, setTelemetryData] = useState({});
  const [activeHotProvider, setActiveHotProvider] = useState(null);

  useEffect(() => {
    const handleHot = (e) => {
      const detail = e.detail || {};
      const prov = detail.provider || detail.providerUsed;
      if (prov) {
        setActiveHotProvider(prov);
        setTimeout(() => setActiveHotProvider(null), 5000);
      }
    };
    window.addEventListener('openplan_trajectory_updated', handleHot);
    return () => window.removeEventListener('openplan_trajectory_updated', handleHot);
  }, []);

  const [openRouterFreeModels, setOpenRouterFreeModels] = useState([]);
  const [isOpenRouterFetching, setIsOpenRouterFetching] = useState(false);

  useEffect(() => {
    const fetchOpenRouterFreeModels = async () => {
      setIsOpenRouterFetching(true);
      try {
        const response = await fetch('https://openrouter.ai/api/v1/models');
        if (response.ok) {
          const data = await response.json();
          const freeModels = data.data.filter(modelo => 
            modelo.pricing.prompt === "0" && 
            modelo.pricing.completion === "0"
          ).map(m => m.id);
          setOpenRouterFreeModels(freeModels);
        }
      } catch (error) {
        console.error("Fallo al obtener modelos gratuitos de OpenRouter:", error);
      } finally {
        setIsOpenRouterFetching(false);
      }
    };
    fetchOpenRouterFreeModels();
  }, []);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const backendBase = getApiBase();
        const res = await safeFetchJson(`${backendBase}/api/telemetry/tokens`);
        if (res.ok && res.data) {
          setTelemetryData(res.data || {});
        }
      } catch {
        // Fallback silencioso
      }
    };
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 4000);
    return () => clearInterval(interval);
  }, []);

  const [cloudUserId, setCloudUserId] = useState(() => {
    return localStorage.getItem('openplan_user_id') || '';
  });

  const [showSshGuide, setShowSshGuide] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  // [UXDD] Toast de confirmación no-bloqueante (reemplaza window.alert)
  const [saveToast, setSaveToast] = useState(false);
  const showSaveToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleCloudUserIdChange = (val) => {
    setCloudUserId(val);
    if (val.trim()) {
      localStorage.setItem('openplan_user_id', val.trim());
    } else {
      localStorage.removeItem('openplan_user_id');
    }
  };

  const fetchOllamaModels = async () => {
    setIsFetchingModels(true);
    try {
      const endpoint = planData.config.ai.endpoint || 'http://localhost:11434';
      const response = await fetch(`${endpoint}/api/tags`);
      const data = await response.json();
      
      if (data.models) {
        setOllamaModels(data.models.map(m => ({
          name: m.name,
          details: m.details
        })));
        setOllamaOnline(true);
      }
    } catch {
      setOllamaOnline(false);
      setOllamaModels([
        { name: 'gemma4:pro' },
        { name: 'gemma4:e4b' },
        { name: 'qwen2.5:1.5b' },
      ]);
    } finally {
      setIsFetchingModels(false);
    }
  };

  useEffect(() => {
    fetchOllamaModels();
  }, [planData.config.ai.endpoint]);

  const handleAiChange = (field, value) => {
    updateConfig('ai', field, value);
  };

  const handleBrandChange = (field, value) => {
    updateConfig('brandKit', field, value);
  };

  const handleExternalChange = (field, value) => {
    updateConfig('externalApis', field, value);
  };

  const handleCoverChange = (field, value) => {
    updateConfig('coverDesign', field, value);
  };

  const handleSearchConfigChange = (field, value) => {
    updateConfig('search', field, value);
  };

  // [DDD] DuckDuckGo y Puppeteer habilitados por defecto (alternativa gratuita)
  const searchConfig = planData.config?.search || { provider: 'tavily', duckDuckGoEnabled: true, apiKey: '' };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleBrandChange('logoUrl', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInstitutionLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const current = planData.config?.coverDesign?.institutionLogos || [];
      if (current.length >= 4) {
        alert('Máximo 4 logos institucionales permitidos.');
        return;
      }
      const newLogo = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: reader.result
      };
      handleCoverChange('institutionLogos', [...current, newLogo]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeInstitutionLogo = (logoId) => {
    const current = planData.config?.coverDesign?.institutionLogos || [];
    handleCoverChange('institutionLogos', current.filter(l => l.id !== logoId));
  };

  const updateInstitutionLogoName = (logoId, newName) => {
    const current = planData.config?.coverDesign?.institutionLogos || [];
    handleCoverChange('institutionLogos', current.map(l => l.id === logoId ? { ...l, name: newName } : l));
  };

  const dataSources = planData.config?.dataSources || [];

  const addDataSource = () => {
    const newSource = {
      id: Date.now().toString(),
      type: 'manual',
      title: '',
      url: '',
      description: ''
    };
    updateConfig('dataSources', null, [...dataSources, newSource]);
  };

  const updateDataSource = (sourceId, field, value) => {
    const updated = dataSources.map(s => s.id === sourceId ? { ...s, [field]: value } : s);
    updateConfig('dataSources', null, updated);
  };

  const removeDataSource = (sourceId) => {
    updateConfig('dataSources', null, dataSources.filter(s => s.id !== sourceId));
  };

  const ctxSize = planData.config?.ai?.contextSize || 32768;
  const currentModelValue = planData.config?.ai?.model || '';
  const provider = planData.config?.ai?.primaryProvider || 'ollama';

  const isLocal = ollamaOnline && currentModelValue.includes(':');
  const mesaEstimate = estimateMesaCost(ctxSize, 'gemini-1.5-flash');
  const ctxLabel = CTX_PRESETS.find(p => p.value === ctxSize)?.label || `${Math.round(ctxSize/1024)}k`;

  const coverDesign = planData.config?.coverDesign || {
    layout: 'classic',
    logoSize: 'medium',
    logoAlign: 'center',
    titleSize: 'medium',
    creatorName: '',
    subtitle: 'Plan Estratégico Maestro',
    institution: 'Formulación y Evaluación Académica 2026',
    showDate: true,
    customDate: '',
    institutionLogos: []
  };

  const institutionLogos = coverDesign.institutionLogos || [];

  // Calcular opciones basadas en el proveedor
  let providerOptions = [];
  if (provider === 'ollama') {
    const fetchedNames = ollamaModels.map(m => m.name);
    providerOptions = ollamaModels.map(m => ({
      value: m.name,
      label: `${m.name} ${m.details?.parameter_size ? `(${m.details.parameter_size})` : ''}`
    }));
    PROVIDER_PRESETS.ollama.forEach(d => {
      if (!fetchedNames.includes(d.value)) {
        providerOptions.push(d);
      }
    });
  } else {
    providerOptions = [...(PROVIDER_PRESETS[provider] || [])];
  }

  const isCustomModel = currentModelValue !== '' && !providerOptions.some(opt => opt.value === currentModelValue);

  return (
    <div className="module-view">
      <div className="view-header">
        <div>
          <h1 className="view-title">Configuración Maestro</h1>
          <p className="text-secondary mt-1">Industrialización: IA con Fallback, APIs y Kit de Marca.</p>
        </div>
        <button className="btn btn-ia" onClick={() => { localStorage.removeItem('openplan_setup'); window.location.reload(); }} style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
          <RefreshCw size={14} /> Re-ejecutar Wizard
        </button>
      </div>

      {/* Monitor de Uso y Costos */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Activity style={{ color: 'var(--accent-color)' }} size={18} />
          <h2 style={{ fontSize: '1.1rem' }}>Monitor de IA — Uso y Costos</h2>
          <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: isLocal ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: isLocal ? '#10b981' : '#ef4444', border: `1px solid ${isLocal ? '#10b981' : '#ef4444'}`, borderRadius: '20px', padding: '2px 10px', fontWeight: 800 }}>
            {isLocal ? '⚡ LOCAL — Sin Costo' : '☁️ NUBE'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          {[
            { icon: Sliders, label: 'Contexto activo', value: ctxLabel, color: '#8b5cf6' },
            { icon: Zap, label: 'Mesa de Expertos', value: '3 fases / módulo', color: '#f59e0b' },
            { icon: Activity, label: 'Tokens/módulo est.', value: mesaEstimate ? `~${(mesaEstimate.tokensIn/1000).toFixed(0)}k` : '--', color: '#6366f1' },
            { icon: DollarSign, label: 'Costo nube/módulo', value: mesaEstimate ? `$${mesaEstimate.costUSD.toFixed(4)} USD` : 'Local ✓', color: '#10b981' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{ padding: '0.875rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <Icon size={16} style={{ color, margin: '0 auto 0.4rem' }} />
              <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color }}>{value}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabla de precios de API */}
        <div style={{ fontSize: '0.75rem' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Info size={12} /> Costo estimado por módulo con Mesa de Expertos (3 llamadas × contexto {ctxLabel})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.4rem' }}>
            {Object.entries(API_COSTS).map(([key, val]) => {
              const est = estimateMesaCost(ctxSize, key);
              return (
                <div key={key} style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-panel-hover)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.7rem', marginBottom: '0.25rem' }}>{val.name}</div>
                  <div style={{ color: est && est.costUSD > 0.05 ? '#f59e0b' : '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
                    {est ? `$${est.costUSD.toFixed(4)}` : '--'}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.6rem' }}>por módulo</div>
                </div>
              );
            })}
          </div>
          {!isLocal && (
            <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.875rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', color: '#f59e0b', fontSize: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertTriangle size={14} /> La Mesa de Expertos hace 3 llamadas por módulo. Con contexto {ctxLabel} el costo se multiplica. Activa Ollama local para generación sin costo.
            </div>
          )}
        </div>

        <TokenTelemetryDashboard />
        <AiTraceabilityPanel />
      </div>

      {/* Control de Contexto */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sliders style={{ color: 'var(--accent-color)' }} size={18} />
          <h2 style={{ fontSize: '1.1rem' }}>Tamaño de Contexto</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          {CTX_PRESETS.map(p => (
            <button key={p.value}
              onClick={() => handleAiChange('contextSize', p.value)}
              style={{
                padding: '0.4rem 0.875rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800,
                border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                borderColor: ctxSize === p.value ? 'var(--accent-color)' : 'var(--border-color)',
                background: ctxSize === p.value ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: ctxSize === p.value ? 'var(--accent-color)' : 'var(--text-secondary)',
              }}>
              {p.label}
            </button>
          ))}
        </div>
        <input type="range" min={8192} max={262144} step={8192}
          value={ctxSize}
          onChange={e => handleAiChange('contextSize', parseInt(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-color)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          <span>8k — Rápido (GPU 4GB)</span>
          <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{ctxLabel} seleccionado</span>
          <span>256k — Máx (RAM 64GB+)</span>
        </div>
      </div>

      {/* Control de Nivel de Detalle */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.1rem' }}>📝</span>
          <h2 style={{ fontSize: '1.1rem' }}>Nivel de Detalle (Extensión)</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { value: 'conciso', label: 'Conciso (Viñetas / Resumen)' },
            { value: 'normal', label: 'Normal (Equilibrado)' },
            { value: 'detallado', label: 'Extenso (Académico / Detallado)' }
          ].map(p => {
            const isActive = (planData.config?.ai?.verbosity || 'normal') === p.value;
            return (
              <button key={p.value}
                onClick={() => handleAiChange('verbosity', p.value)}
                style={{
                  padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700,
                  border: '1px solid', cursor: 'pointer', transition: 'all 0.2s', flex: 1,
                  borderColor: isActive ? 'var(--accent-color)' : 'var(--border-color)',
                  background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                }}>
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Mesa de Expertos ─────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🧠</span>
          <h2 style={{ fontSize: '1.1rem' }}>Mesa de Expertos — Agentes y Modelos</h2>
          <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: 'var(--bg-panel-hover)', color: 'var(--accent-color)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2px 10px', fontWeight: 800 }}>
            ⚡ Nivel 1 Activo por defecto
          </span>
        </div>

        {/* Asignación de modelos por rol */}
        {[
          { rol: 'analista',      emoji: '📊', label: 'Analista Estratégico',  hint: 'Genera el borrador. Usa modelos rápidos.' },
          { rol: 'critico',       emoji: '🔍', label: 'Crítico Financiero',     hint: 'Evalúa debilidades. Nivel 2+.' },
          { rol: 'redactor',      emoji: '✍️', label: 'Redactor Ejecutivo',     hint: 'Síntesis final. Usa el mejor modelo disponible.' },
          { rol: 'estratega',     emoji: '🗺️', label: 'Estratega',              hint: 'Define el marco. Solo nivel 3 (Profundo).' },
          { rol: 'abogadoDiablo', emoji: '😈', label: "Devil's Advocate",       hint: 'Contraargumenta. Solo nivel 3 (Profundo).' },
        ].map(({ rol, emoji, label, hint }) => {
          // Determinar el modelo por defecto del agente según el proveedor activo
          const activeProvider = planData.config?.ai?.primaryProvider || 'ollama';
          const isCloudProvider = ['groq','nvidia','mistral','gemini','openai','openrouter'].includes(activeProvider);
          const defaultAgentModel = isCloudProvider
            ? (CLOUD_PROVIDER_DEFAULTS[activeProvider] || 'qwen/qwen3.6-27b')
            : 'qwen3.5:4b-mlx';
          const current = planData.config?.ai?.agentModels?.[rol]?.model || defaultAgentModel;
          const isDeepOnly = rol === 'estratega' || rol === 'abogadoDiablo';
          return (
            <div key={rol} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 160px', gap: '0.75rem', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{emoji}</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{label}</div>
                  {isDeepOnly && <div style={{ fontSize: '0.6rem', color: 'var(--accent-color)' }}>🔬 Solo nivel Profundo</div>}
                </div>
              </div>
              <select
                className="form-control"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', opacity: isDeepOnly ? 0.6 : 1 }}
                value={current}
                onChange={e => {
                  const newModels = { ...(planData.config?.ai?.agentModels || {}) };
                  newModels[rol] = { ...newModels[rol], model: e.target.value };
                  handleAiChange('agentModels', newModels);
                }}
              >
                <optgroup label="📍 Locales (Ollama / LM Studio)">
                  <option value="qwen3.5:4b-mlx">qwen3.5:4b-mlx (~4GB VRAM) ★ Recomendado</option>
                  <option value="nemotron">nemotron-3-nano:4b (~4GB VRAM)</option>
                  <option value="gemma4:e4b">gemma4:e4b (~4.5-8GB VRAM)</option>
                  <option value="gemma4:pro">gemma4:pro (~8GB VRAM)</option>
                  <option value="qwen2.5:7b">qwen2.5:7b (~4.5GB) — Numérico</option>
                  <option value="llama3.1:8b">llama3.1:8b (~5GB) — Estructura</option>
                </optgroup>
                <optgroup label="☁️ Ollama Cloud / Híbridos (Capa Gratuita)">
                  <option value="kimi-k2.6:cloud">kimi-k2.6:cloud (Nube - Gratuito)</option>
                  <option value="glm-5.1:cloud">glm-5.1:cloud (Nube - Gratuito)</option>
                  <option value="qwen3.5:cloud">qwen3.5:cloud (Nube - Gratuito)</option>
                  <option value="nemotron-3-super:cloud">nemotron-3-super:cloud (Nube - Gratuito)</option>
                  <option value="gemma4:31b-cloud">gemma4:31b-cloud (Nube - Gratuito)</option>
                  <option value="minimax-m3:cloud">minimax-m3:cloud (Nube - Gratuito)</option>
                </optgroup>
                <optgroup label="☁️ Nube Gratuita — Groq & OpenRouter">
                  <option value="qwen/qwen3.6-27b">Groq: Qwen 3.6 27B ★ (Ultra-Rápido 200k TPD)</option>
                  <option value="openai/gpt-oss-120b">Groq: GPT-OSS 120B (Gran Capacidad 200k TPD)</option>
                  <option value="openai/gpt-oss-20b">Groq: GPT-OSS 20B (Rápido)</option>
                  <option value="nvidia/nemotron-3.5-lightning:free">OpenRouter: Nemotron 3.5 (1M ctx gratis) 🥇</option>
                  <option value="openai/gpt-oss-20b:free">OpenRouter: GPT-OSS 20B (131k ctx gratis)</option>
                  <option value="z-ai/glm-5.2:free">OpenRouter: GLM 5.2 (256k ctx gratis)</option>
                  <option value="nvidia/llama-3.1-nemotron-70b-instruct">NVIDIA NIM: Nemotron 70B</option>
                  <option value="google/gemma-2-27b-it">NVIDIA NIM: Gemma 2 27B</option>
                  <option value="gemini-3.6-flash">Google: Gemini 3.6 Flash ★ Activo</option>
                  <option value="gemini-3.5-flash-lite">Google: Gemini 3.5 Flash Lite</option>
                </optgroup>
                <optgroup label="💎 Nube (Premium / De Pago)">
                  <option value="gpt-4o">OpenAI: GPT-4o</option>
                  <option value="gemini-1.5-pro">Google: Gemini 1.5 Pro</option>
                  <option value="mistral-large-latest">Mistral Large</option>
                </optgroup>
                {ollamaModels.filter(m => !['nemotron','gemma4:e4b','gemma4:pro','gemma4:e2b','qwen2.5:7b','phi4:14b','llama3.1:8b','mistral:7b', 'qwen3.5:2b-mlx', 'qwen3.5:4b-mlx', 'kimi-k2.6:cloud', 'glm-5.1:cloud', 'qwen3.5:cloud', 'nemotron-3-super:cloud', 'gemma4:31b-cloud', 'minimax-m3:cloud'].includes(m.name)).length > 0 && (
                  <optgroup label="— Detectados en tu Ollama —">
                    {ollamaModels
                      .filter(m => !['nemotron','gemma4:e4b','gemma4:pro','gemma4:e2b','qwen2.5:7b','phi4:14b','llama3.1:8b','mistral:7b', 'qwen3.5:2b-mlx', 'qwen3.5:4b-mlx', 'kimi-k2.6:cloud', 'glm-5.1:cloud', 'qwen3.5:cloud', 'nemotron-3-super:cloud', 'gemma4:31b-cloud', 'minimax-m3:cloud'].includes(m.name))
                      .map(m => <option key={m.name} value={m.name}>{m.name}</option>)
                    }
                  </optgroup>
                )}
              </select>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{hint}</div>
            </div>
          );
        })}

        {/* Profundidad global — Feature avanzada desbloqueada */}
        <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '8px', background: 'var(--bg-panel-hover)', border: '1px dashed var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>🔓 Profundidad Global (Avanzado)</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Cuando está activo, aparece el selector ⚡/🧠/🔬 en cada módulo. Por defecto usa nivel 1 (Rápido).
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {planData.config?.ai?.advancedDepth ? 'Activado' : 'Desactivado'}
              </span>
              <div
                onClick={() => handleAiChange('advancedDepth', !planData.config?.ai?.advancedDepth)}
                style={{
                  width: 40, height: 22, borderRadius: 11, cursor: 'pointer', transition: 'all 0.3s',
                  background: planData.config?.ai?.advancedDepth ? 'var(--accent-color)' : 'var(--border-color)',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, transition: 'all 0.3s',
                  left: planData.config?.ai?.advancedDepth ? 20 : 3,
                  width: 16, height: 16, borderRadius: '50%', background: 'white'
                }} />
              </div>
            </label>
          </div>
          {planData.config?.ai?.advancedDepth && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { level: 1, icon: '⚡', label: 'Rápido',    time: '~1 min',  desc: '2 agentes' },
                { level: 2, icon: '🧠', label: 'Pro',       time: '~3 min',  desc: '3 agentes' },
                { level: 3, icon: '🔬', label: 'Profundo',  time: '~10 min', desc: '5 agentes' },
                { level: 4, icon: '🏭', label: 'Industrial', time: '~25 min', desc: '9 agentes' },
              ].map(({ level, icon, label, time, desc }) => (
                <button key={level}
                  onClick={() => handleAiChange('depth', level)}
                  style={{
                    flex: 1, padding: '0.75rem 0.5rem', borderRadius: '10px', border: '1px solid',
                    borderColor: (planData.config?.ai?.depth || 1) === level ? 'var(--accent-color)' : 'var(--border-color)',
                    background: (planData.config?.ai?.depth || 1) === level ? 'rgba(99,102,241,0.15)' : 'transparent',
                    cursor: 'pointer', color: 'var(--text-primary)', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{icon}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{label}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{desc} · {time}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Metodología del Proyecto */}
        <div className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Settings style={{ color: 'var(--accent-color)' }} />
            <h2 style={{ fontSize: '1.25rem' }}>Metodología del Proyecto</h2>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.75rem' }}>Metodologías Activas para el Proyecto</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {Object.entries(FRAMEWORKS).map(([key, fw]) => {
                const activeList = planData.config?.activeMethodologies || [planData.config?.projectType || 'business'];
                const isActive = activeList.includes(key);
                return (
                  <label key={key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-panel-hover)',
                    border: `1.5px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      style={{ accentColor: 'var(--accent-color)', width: '16px', height: '16px' }}
                      onChange={(e) => {
                        let newList = [...activeList];
                        if (e.target.checked) {
                          if (!newList.includes(key)) newList.push(key);
                        } else {
                          if (newList.length > 1) {
                            newList = newList.filter(k => k !== key);
                          } else {
                            alert("Debes tener al menos una metodología activa.");
                            return;
                          }
                        }
                        updateConfig('activeMethodologies', null, newList);
                        
                        // Si la metodología desmarcada era la actual, cambiamos a otra activa
                        if (!e.target.checked && planData.config?.projectType === key) {
                          const fallback = newList[0];
                          updateConfig('projectType', null, fallback);
                        }
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{fw.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{fw.pillars?.length || 0} pilares académicos</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="form-group" style={{ maxWidth: '400px' }}>
              <label className="form-label">Metodología Principal (Vista Activa)</label>
              <select
                className="form-control"
                value={planData.config?.projectType || 'business'}
                onChange={(e) => {
                  updateConfig('projectType', null, e.target.value);
                }}
              >
                {(planData.config?.activeMethodologies || [planData.config?.projectType || 'business']).map(key => (
                  <option key={key} value={key}>{FRAMEWORKS[key]?.name || key}</option>
                ))}
              </select>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Establece cuál de las metodologías activas se muestra actualmente en la barra lateral del editor.
              </p>
            </div>
          </div>
        </div>

        {/* IA Config con Fallback y Medidores */}
        <div className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Cpu style={{ color: 'var(--accent-color)' }} />
              <div>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Motor de IA, LLM Providers & Medidores en Tiempo Real</h2>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Configura tus API Keys con fallback automático inteligente. Si un proveedor se satura, el sistema pasa al siguiente automáticamente.
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>PROVEEDOR ACTIVO:</span>
                <select 
                  className="form-control" 
                  value={planData.config.ai.primaryProvider}
                  onChange={(e) => {
                    const newProv = e.target.value;
                    handleAiChange('primaryProvider', newProv);

                    // Sincronizar modelo activo por defecto con los modelos más recientes y activos
                    const targetModel = CLOUD_PROVIDER_DEFAULTS[newProv] || 'qwen3.5:4b-mlx';
                    handleAiChange('model', targetModel);

                    // Actualizar todos los agentes de la Mesa de Expertos al nuevo modelo por defecto
                    const agentRoles = ['analista', 'critico', 'redactor', 'estratega', 'abogadoDiablo'];
                    const currentAgents = planData.config?.ai?.agentModels || {};
                    const updatedAgents = {};
                    agentRoles.forEach(roleKey => {
                      updatedAgents[roleKey] = {
                        ...currentAgents[roleKey],
                        model: targetModel
                      };
                    });
                    handleAiChange('agentModels', updatedAgents);
                  }}
                  style={{ minWidth: '220px', fontWeight: 700, color: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
                >
                  <optgroup label="⚡ Nube Ultra-Velocidad & Open Models — 🆓 GRATIS">
                    <option value="groq">⚡ Groq (Qwen 3.6 27B / GPT-OSS 120B)</option>
                    <option value="nvidia">🟢 NVIDIA NIM (Nemotron / Llama 70B)</option>
                    <option value="openrouter">🌐 OpenRouter (Nemotron 1M ctx) 🥇</option>
                    <option value="mistral">🔥 Mistral AI (Mistral Large)</option>
                  </optgroup>
                  <optgroup label="💎 Modelos Comerciales Cloud">
                    <option value="gemini">🌐 Google Gemini (3.6 Flash)</option>
                    <option value="openai">🟢 OpenAI (GPT-4o / Mini)</option>
                  </optgroup>
                  <optgroup label="💻 Local Offline">
                    <option value="ollama">💻 Ollama Local (Offline)</option>
                  </optgroup>
                </select>
              </div>

              {/* Selector dinámico de modelo activo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>MODELO:</span>
                <select
                  className="form-control"
                  value={planData.config.ai.model || ''}
                  onChange={(e) => {
                    const newModel = e.target.value;
                    handleAiChange('model', newModel);
                    
                    // Auto-sync primaryProvider if we can guess it from the unified list
                    if (newModel.includes('gpt')) handleAiChange('primaryProvider', 'openai');
                    else if (newModel.includes('gemini')) handleAiChange('primaryProvider', 'gemini');
                    else if (newModel.includes('claude')) handleAiChange('primaryProvider', 'claude');
                    else if (newModel.includes('mistral') || newModel.includes('mixtral')) handleAiChange('primaryProvider', 'mistral');
                    else if (newModel.includes('nvidia') || newModel.includes('nemotron-70b')) handleAiChange('primaryProvider', 'nvidia');
                    else if (PROVIDER_PRESETS.groq.some(o => o.value === newModel)) handleAiChange('primaryProvider', 'groq');
                    else if (PROVIDER_PRESETS.openrouter.some(o => o.value === newModel) || openRouterFreeModels.includes(newModel) || newModel === 'openrouter/free') handleAiChange('primaryProvider', 'openrouter');
                    else if (ollamaModels.some(m => m.name === newModel) || PROVIDER_PRESETS.ollama.some(o => o.value === newModel)) handleAiChange('primaryProvider', 'ollama');
                  }}
                  style={{ minWidth: '200px', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  <optgroup label="☁️ Ollama Cloud (Gratis por Defecto)">
                    {PROVIDER_PRESETS.ollama.filter(d => d.value.includes('cloud') && !ollamaModels.some(m => m.name === d.value)).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="💻 Local (Ollama Offline)">
                    {ollamaModels.map(m => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                    {PROVIDER_PRESETS.ollama.filter(d => !d.value.includes('cloud') && !ollamaModels.some(m => m.name === d.value)).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="⚡ Fila 1 (Ultra Velocidad)">
                    {PROVIDER_PRESETS.groq.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    {PROVIDER_PRESETS.mistral.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    {PROVIDER_PRESETS.nvidia.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </optgroup>
                  <optgroup label="💎 Fila 2 (Modelos Comerciales Premium)">
                    {PROVIDER_PRESETS.openai.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    {PROVIDER_PRESETS.gemini.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    {PROVIDER_PRESETS.claude.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </optgroup>
                  <optgroup label="🎁 Ofertas Gratis (OpenRouter en Vivo)">
                    <option value="openrouter/free">openrouter/free (Auto Best Free)</option>
                    {openRouterFreeModels.map(m => (
                      <option key={m} value={m}>{m} (Gratis)</option>
                    ))}
                    {!isOpenRouterFetching && openRouterFreeModels.length === 0 && (
                      <option disabled>Sin ofertas actualmente</option>
                    )}
                    {isOpenRouterFetching && <option disabled>Buscando ofertas...</option>}
                  </optgroup>
                  {isCustomModel && <option value={currentModelValue}>{currentModelValue}</option>}
                </select>
                
                {/* Blinking indicator for OpenRouter Free Models */}
                {openRouterFreeModels.length > 0 && (
                  <span className="animate-pulse" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Sparkles size={14} /> ¡{openRouterFreeModels.length} ofertas en OpenRouter!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* FILA 1: Modelos de Ultra-Velocidad & Cloud Gratuito */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚡ FILA 1: Ultra-Alta Velocidad & Modelos Online Gratis</span>
              <span style={{ fontSize: '0.65rem', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '10px', color: 'var(--accent-color)' }}>Recomendado para Industrialización</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              
              {/* GROQ CARD */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: `1.5px solid ${planData.config.ai.primaryProvider === 'groq' ? 'var(--accent-color)' : 'var(--border-color)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f59e0b' }}>⚡ Groq (Llama 3.3 70B & 8B)</div>
                  <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 700 }}>
                    Obtener Key ↗
                  </a>
                </div>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="gsk_..."
                  value={planData.config.ai.groqKey || ''}
                  onChange={(e) => handleAiChange('groqKey', e.target.value)}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <ApiStatusBadge status={groqStatus} onTest={() => testGroq(planData.config.ai.groqKey)} disabled={!planData.config.ai.groqKey} />
                <ApiQuotaMeter providerKey="groq" tokens={telemetryData.groq || 0} isConfigured={!!planData.config.ai.groqKey} statusState={groqStatus.state} isHot={activeHotProvider === 'groq'} />
              </div>

              {/* NVIDIA NIM CARD */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: `1.5px solid ${planData.config.ai.primaryProvider === 'nvidia' ? 'var(--accent-color)' : 'var(--border-color)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#10b981' }}>🟢 NVIDIA NIM (Nemotron 70B)</div>
                  <a href="https://build.nvidia.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 700 }}>
                    Obtener Key ↗
                  </a>
                </div>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="nvapi-..."
                  value={planData.config.ai.nvidiaKey || ''}
                  onChange={(e) => handleAiChange('nvidiaKey', e.target.value)}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <ApiStatusBadge status={nvidiaStatus} onTest={() => testNvidia(planData.config.ai.nvidiaKey)} disabled={!planData.config.ai.nvidiaKey} />
                <ApiQuotaMeter providerKey="nvidia" tokens={telemetryData.nvidia || 0} isConfigured={!!planData.config.ai.nvidiaKey} statusState={nvidiaStatus.state} isHot={activeHotProvider === 'nvidia'} />
              </div>

              {/* MISTRAL CARD */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: `1.5px solid ${planData.config.ai.primaryProvider === 'mistral' ? 'var(--accent-color)' : 'var(--border-color)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ec4899' }}>🔥 Mistral AI (Large)</div>
                  <a href="https://console.mistral.ai/api-keys" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 700 }}>
                    Obtener Key ↗
                  </a>
                </div>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Mistral API Key..."
                  value={planData.config.ai.mistralKey || planData.config.ai.apiKey || ''}
                  onChange={(e) => {
                    handleAiChange('mistralKey', e.target.value);
                    if (planData.config.ai.primaryProvider === 'mistral') handleAiChange('apiKey', e.target.value);
                  }}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <ApiStatusBadge status={mistralStatus} onTest={() => testMistral(planData.config.ai.mistralKey || planData.config.ai.apiKey)} disabled={!planData.config.ai.mistralKey && !planData.config.ai.apiKey} />
                <ApiQuotaMeter providerKey="mistral" tokens={telemetryData.mistral || 0} isConfigured={!!planData.config.ai.mistralKey || (planData.config.ai.primaryProvider === 'mistral' && !!planData.config.ai.apiKey)} statusState={mistralStatus.state} isHot={activeHotProvider === 'mistral'} />
              </div>

              {/* OLLAMA CLOUD FREE (Kimi k2.6, MiniMax, Nemotron, Qwen) */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1.5px solid rgba(99,102,241,0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#6366f1' }}>☁️ Ollama Cloud <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 6px', borderRadius: '8px', marginLeft: '4px' }}>GRATIS</span></div>
                  <a href="https://ollama.com/settings/keys" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#6366f1', textDecoration: 'none', fontWeight: 700 }}>Obtener Key ↗</a>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Kimi k2.6 · MiniMax M3 · Nemotron Super · Gemma4 · Qwen3.5</div>
                
                {/* Key principal — Generación de Planes (Mesa de Expertos) */}
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🏭 Key Principal (Generación de Planes)</div>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="65b426... (Ollama Cloud Key)"
                  value={planData.config.ai.ollamaKey || ''}
                  onChange={(e) => handleAiChange('ollamaKey', e.target.value)}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <ApiStatusBadge status={ollamaCloudStatus} onTest={() => testOllamaCloud(planData.config.ai.ollamaKey)} disabled={!planData.config.ai.ollamaKey} />
                <ApiQuotaMeter providerKey="ollama_cloud" tokens={telemetryData.ollama_cloud || 0} isConfigured={!!planData.config.ai.ollamaKey} statusState={ollamaCloudStatus.state} />

                {/* Key dedicada para BOB Chat — Cuenta separada */}
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed rgba(99,102,241,0.2)' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🤖 Key de BOB Chat (Exclusiva)
                    <span style={{ fontSize: '0.55rem', fontWeight: 400, color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>— Separa la cuota del copiloto de la generación de planes</span>
                  </div>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Segunda key de Ollama Cloud para BOB..."
                    value={planData.config.ai.bobOllamaKey || ''}
                    onChange={(e) => handleAiChange('bobOllamaKey', e.target.value)}
                    style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}
                  />
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    {planData.config.ai.bobOllamaKey 
                      ? '✅ BOB usará esta key exclusiva para conversaciones (minimax-m3:cloud)'
                      : '💡 Sin key dedicada, BOB usará la key principal compartida. Recomendamos crear una segunda cuenta.'
                    }
                  </div>
                </div>
              </div>

              {/* OPENROUTER CARD — Nemotron 1M ctx, GPT-OSS, GLM 5.2 (capa gratuita) */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: `1.5px solid ${planData.config.ai.primaryProvider === 'openrouter' ? '#f59e0b' : 'rgba(245,158,11,0.3)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f59e0b' }}>🌐 OpenRouter <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 6px', borderRadius: '8px', marginLeft: '4px' }}>GRATIS</span></div>
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#f59e0b', textDecoration: 'none', fontWeight: 700 }}>Obtener Key ↗</a>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Nemotron 3.5 (1M ctx) · GPT-OSS 20B · GLM 5.2 · Nano 30B — Regenera sin límite diario</div>
                <input
                  type="password"
                  className="form-control"
                  placeholder="sk-or-v1-..."
                  value={planData.config.ai.openrouterKey || ''}
                  onChange={(e) => handleAiChange('openrouterKey', e.target.value)}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <ApiStatusBadge status={openrouterStatus} onTest={() => testOpenRouter(planData.config.ai.openrouterKey)} disabled={!planData.config.ai.openrouterKey} />
                <ApiQuotaMeter providerKey="openrouter" tokens={telemetryData.openrouter || 0} isConfigured={!!planData.config.ai.openrouterKey} statusState={openrouterStatus.state} isHot={activeHotProvider === 'openrouter'} />
              </div>

              {/* OPENCODE CARD — Modelos de código grandes, regenera cada 5h */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: `1.5px solid ${planData.config.ai.primaryProvider === 'opencode' ? '#a78bfa' : 'rgba(167,139,250,0.3)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#a78bfa' }}>🖥️ OpenCode <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 6px', borderRadius: '8px', marginLeft: '4px' }}>GRATIS c/5h</span></div>
                  <a href="https://opencode.ai" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#a78bfa', textDecoration: 'none', fontWeight: 700 }}>Obtener Key ↗</a>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>GPT-4.1 · Claude Sonnet · Gemini Pro · Modelos grandes de código — Tokens se regeneran cada 5 horas</div>
                <input
                  type="password"
                  className="form-control"
                  placeholder="sk-..."
                  value={planData.config.ai.opencodeKey || ''}
                  onChange={(e) => handleAiChange('opencodeKey', e.target.value)}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <ApiStatusBadge status={opencodeStatus} onTest={() => testOpenCode(planData.config.ai.opencodeKey)} disabled={!planData.config.ai.opencodeKey} />
                <ApiQuotaMeter providerKey="opencode" tokens={telemetryData.opencode || 0} isConfigured={!!planData.config.ai.opencodeKey} statusState={opencodeStatus.state} isHot={activeHotProvider === 'opencode'} />
              </div>

              {/* ORCA ROUTER CARD */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: `1.5px solid ${planData.config.ai.primaryProvider === 'orcarouter' ? '#38bdf8' : 'rgba(56,189,248,0.3)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#38bdf8' }}>🐬 Orca Router <span style={{ fontSize: '0.65rem', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '1px 6px', borderRadius: '8px', marginLeft: '4px' }}>ROUTER</span></div>
                  <a href="https://orcarouter.ai" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#38bdf8', textDecoration: 'none', fontWeight: 700 }}>Obtener Key ↗</a>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Enrutador inteligente multi-modelo · Requiere recarga inicial para activar saldo</div>
                <input
                  type="password"
                  className="form-control"
                  placeholder="sk-orca-..."
                  value={planData.config.ai.orcarouterKey || ''}
                  onChange={(e) => handleAiChange('orcarouterKey', e.target.value)}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <ApiStatusBadge status={{ state: planData.config.ai.orcarouterKey ? 'online' : 'idle', message: planData.config.ai.orcarouterKey ? 'Configurado' : 'Sin verificar' }} onTest={() => {}} disabled={!planData.config.ai.orcarouterKey} />
                <ApiQuotaMeter providerKey="orcarouter" tokens={telemetryData.orcarouter || 0} isConfigured={!!planData.config.ai.orcarouterKey} statusState={planData.config.ai.orcarouterKey ? 'online' : 'idle'} isHot={activeHotProvider === 'orcarouter'} />
              </div>

              {/* TOKENROUTER CARD */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: `1.5px solid ${planData.config.ai.primaryProvider === 'tokenrouter' ? '#10b981' : 'rgba(16,185,129,0.3)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#10b981' }}>⚡ TokenRouter <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 6px', borderRadius: '8px', marginLeft: '4px' }}>GRATIS / OFERTAS</span></div>
                  <a href="https://tokenrouter.net" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#10b981', textDecoration: 'none', fontWeight: 700 }}>Obtener Key ↗</a>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>DeepSeek R1/V3 · Qwen 2.5 72B — Acceso gratis y rotación inteligente de modelos</div>
                <input
                  type="password"
                  className="form-control"
                  placeholder="sk-..."
                  value={planData.config.ai.tokenrouterKey || ''}
                  onChange={(e) => handleAiChange('tokenrouterKey', e.target.value)}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <ApiStatusBadge status={tokenrouterStatus} onTest={() => testTokenRouter(planData.config.ai.tokenrouterKey)} disabled={!planData.config.ai.tokenrouterKey} />
                <ApiQuotaMeter providerKey="tokenrouter" tokens={telemetryData.tokenrouter || 0} isConfigured={!!planData.config.ai.tokenrouterKey} statusState={tokenrouterStatus.state} isHot={activeHotProvider === 'tokenrouter'} />
              </div>

            </div>
          </div>

          {/* FILA 2: Modelos Comerciales, Cloud Global & Local Offline */}
          <div style={{ marginBottom: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💎 FILA 2: Modelos Comerciales, Premium & Local Offline</span>
              <span style={{ fontSize: '0.65rem', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '10px', color: '#38bdf8' }}>
                {['Gemini', planData.config.ai.claudeKey ? 'Claude' : null, planData.config.ai.openaiKey ? 'GPT' : null, 'DeepSeek', 'Grok', ollamaOnline ? 'Ollama Local' : null].filter(Boolean).join(', ') || 'Proveedores Premium'}
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              
              {/* GOOGLE GEMINI */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: `1.5px solid ${planData.config.ai.primaryProvider === 'gemini' ? '#38bdf8' : 'var(--border-color)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#38bdf8' }}>🌐 Google Gemini <span style={{ fontSize: '0.6rem', fontWeight: 400, color: 'var(--text-muted)' }}>(Flash 3.6 · 3.5 Lite · 3.7 · 1.5 Pro)</span></div>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#38bdf8', textDecoration: 'none', fontWeight: 700 }}>
                    Obtener Key ↗
                  </a>
                </div>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="AIzaSy..."
                  value={planData.config.ai.primaryProvider === 'gemini' ? (planData.config.ai.apiKey || '') : (planData.config.ai.geminiKey || '')}
                  onChange={(e) => {
                    handleAiChange('geminiKey', e.target.value);
                    if (planData.config.ai.primaryProvider === 'gemini') handleAiChange('apiKey', e.target.value);
                  }}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <ApiStatusBadge status={geminiStatus} onTest={() => testGemini(planData.config.ai.geminiKey || planData.config.ai.apiKey)} disabled={!planData.config.ai.geminiKey && !planData.config.ai.apiKey} />
                <ApiQuotaMeter providerKey="gemini" tokens={telemetryData.gemini || 0} isConfigured={!!planData.config.ai.geminiKey || !!planData.config.ai.apiKey} statusState={geminiStatus.state} isHot={activeHotProvider === 'gemini'} />
              </div>

              {/* ANTHROPIC CLAUDE */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: `1.5px solid ${planData.config.ai.primaryProvider === 'claude' ? '#d97706' : 'var(--border-color)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#d97706' }}>🧠 Anthropic Claude <span style={{ fontSize: '0.6rem', fontWeight: 400, color: 'var(--text-muted)' }}>(Fable 5 · Sonnet 5 · Opus 5)</span></div>
                  <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#d97706', textDecoration: 'none', fontWeight: 700 }}>
                    Obtener Key ↗
                  </a>
                </div>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="sk-ant-..."
                  value={planData.config.ai.claudeKey || ''}
                  onChange={(e) => handleAiChange('claudeKey', e.target.value)}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <ApiStatusBadge status={claudeStatus} onTest={() => testClaude(planData.config.ai.claudeKey)} disabled={!planData.config.ai.claudeKey} />
                <ApiQuotaMeter providerKey="claude" tokens={telemetryData.claude || 0} isConfigured={!!planData.config.ai.claudeKey} statusState={claudeStatus.state} isHot={activeHotProvider === 'claude'} />
              </div>

              {/* OPENAI GPT */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: `1.5px solid ${planData.config.ai.primaryProvider === 'openai' ? '#10b981' : 'var(--border-color)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#10b981' }}>🟢 OpenAI <span style={{ fontSize: '0.6rem', fontWeight: 400, color: 'var(--text-muted)' }}>(GPT-5.6 Sol/Terra/Luna · 5 · 4.5 · 4o)</span></div>
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#10b981', textDecoration: 'none', fontWeight: 700 }}>
                    Obtener Key ↗
                  </a>
                </div>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="sk-proj-..."
                  value={planData.config.ai.openaiKey || (planData.config.ai.primaryProvider === 'openai' ? planData.config.ai.apiKey : '')}
                  onChange={(e) => {
                    handleAiChange('openaiKey', e.target.value);
                    if (planData.config.ai.primaryProvider === 'openai') handleAiChange('apiKey', e.target.value);
                  }}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <ApiStatusBadge status={openaiStatus} onTest={() => testOpenai(planData.config.ai.openaiKey || planData.config.ai.apiKey)} disabled={!planData.config.ai.openaiKey && !planData.config.ai.apiKey} />
                <ApiQuotaMeter providerKey="openai" tokens={telemetryData.openai || 0} isConfigured={!!planData.config.ai.openaiKey || !!planData.config.ai.apiKey} statusState={openaiStatus.state} isHot={activeHotProvider === 'openai'} />
              </div>

              {/* OLLAMA LOCAL CARD */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: `1.5px solid ${planData.config.ai.primaryProvider === 'ollama' ? 'var(--accent-color)' : 'var(--border-color)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#818cf8' }}>💻 Ollama Local (Offline)</div>
                  <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 700 }}>
                    Descargar ↗
                  </a>
                </div>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="http://localhost:11434"
                  value={planData.config.ai.endpoint || 'http://localhost:11434'}
                  onChange={(e) => handleAiChange('endpoint', e.target.value)}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: ollamaOnline ? '#10b981' : '#9ca3af' }}>
                    {ollamaOnline ? `En línea (${ollamaModels.length} modelos) ✓` : 'Sin servidor local (Opcional)'}
                  </span>
                  <button type="button" onClick={fetchOllamaModels} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                    Refrescar
                  </button>
                </div>
                <ApiQuotaMeter providerKey="ollama" tokens={telemetryData.ollama || 0} isConfigured={ollamaOnline} statusState={ollamaOnline ? 'online' : 'offline'} isHot={activeHotProvider === 'ollama'} />
              </div>

              {/* OLLAMA CLOUD PREMIUM (GLM 5.1, Qwen3.5 72B) */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1.5px solid rgba(168,85,247,0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#a855f7' }}>💎 Ollama Cloud <span style={{ fontSize: '0.65rem', background: 'rgba(168,85,247,0.15)', color: '#a855f7', padding: '1px 6px', borderRadius: '8px', marginLeft: '4px' }}>PREMIUM</span></div>
                  <a href="https://ollama.com/settings/keys" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#a855f7', textDecoration: 'none', fontWeight: 700 }}>Obtener Key ↗</a>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>GLM 5.1 · Qwen3.5 72B · DeepSeek R2 Pro (misma key Ollama)</div>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Misma key de Ollama Cloud"
                  value={planData.config.ai.ollamaKey || ''}
                  onChange={(e) => handleAiChange('ollamaKey', e.target.value)}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <ApiStatusBadge status={ollamaCloudStatus} onTest={() => testOllamaCloud(planData.config.ai.ollamaKey)} disabled={!planData.config.ai.ollamaKey} />
                <ApiQuotaMeter providerKey="ollama_cloud" tokens={telemetryData.ollama_cloud || 0} isConfigured={!!planData.config.ai.ollamaKey} statusState={ollamaCloudStatus.state} isHot={activeHotProvider === 'ollama_cloud'} />
              </div>

              {/* GLM / ZhipuAI Directo */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1.5px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#06b6d4' }}>🔷 GLM / ZhipuAI (GLM-4-Plus)</div>
                  <a href="https://open.bigmodel.cn/usercenter/apikeys" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#06b6d4', textDecoration: 'none', fontWeight: 700 }}>Obtener Key ↗</a>
                </div>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="GLM API Key..."
                  value={planData.config.ai.glmKey || ''}
                  onChange={(e) => handleAiChange('glmKey', e.target.value)}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <ApiStatusBadge status={{ state: planData.config.ai.glmKey ? 'idle' : 'idle', message: planData.config.ai.glmKey ? 'Configurado' : 'No configurado' }} onTest={() => {}} disabled={!planData.config.ai.glmKey} />
              </div>

              {/* MINIMAX Directo */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1.5px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f59e0b' }}>🟡 MiniMax (abab 6.5)</div>
                  <a href="https://www.minimaxi.com/user-center/basic-information/interface-key" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#f59e0b', textDecoration: 'none', fontWeight: 700 }}>Obtener Key ↗</a>
                </div>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="MiniMax API Key..."
                  value={planData.config.ai.minimaxKey || ''}
                  onChange={(e) => handleAiChange('minimaxKey', e.target.value)}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <ApiStatusBadge status={{ state: planData.config.ai.minimaxKey ? 'idle' : 'idle', message: planData.config.ai.minimaxKey ? 'Configurado' : 'No configurado' }} onTest={() => {}} disabled={!planData.config.ai.minimaxKey} />
              </div>

              {/* DEEPSEEK V3 */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1.5px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#3b82f6' }}>🐋 DeepSeek V3 / R1</div>
                  <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 700 }}>
                    Obtener Key ↗
                  </a>
                </div>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="sk-..."
                  value={planData.config.ai.deepseekKey || ''}
                  onChange={(e) => handleAiChange('deepseekKey', e.target.value)}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <ApiStatusBadge status={deepseekStatus} onTest={() => testDeepseek(planData.config.ai.deepseekKey)} disabled={!planData.config.ai.deepseekKey} />
              </div>

              {/* xAI GROK */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1.5px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#a855f7' }}>⚡ xAI Grok</div>
                  <a href="https://console.x.ai" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#a855f7', textDecoration: 'none', fontWeight: 700 }}>
                    Obtener Key ↗
                  </a>
                </div>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="xai-..."
                  value={planData.config.ai.grokKey || ''}
                  onChange={(e) => handleAiChange('grokKey', e.target.value)}
                  style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <ApiStatusBadge status={grokStatus} onTest={() => testGrok(planData.config.ai.grokKey)} disabled={!planData.config.ai.grokKey} />
              </div>

            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Pollinations.ai API Key (Imágenes de Logos y Cola Prioritaria)</span>
              <a 
                href="https://enter.pollinations.ai/keys" 
                target="_blank" 
                rel="noreferrer" 
                style={{ fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600 }}
              >
                Obtener Key en Pollinations ↗
              </a>
            </label>
            <input 
              type="password" 
              className="form-control" 
              value={planData.config.ai.pollinationsKey || ''}
              onChange={(e) => handleAiChange('pollinationsKey', e.target.value)}
              placeholder="Pega aquí tu API Key de enter.pollinations.ai"
            />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Palette className="text-[#8b5cf6]" />
            <h2 style={{ fontSize: '1.25rem' }}>Kit de Marca e Identidad</h2>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre del Proyecto</label>
            <input 
              type="text" 
              className="form-control" 
              value={planData.config.brandKit.companyName}
              onChange={(e) => handleBrandChange('companyName', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Logotipo de Empresa</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                border: '1px solid var(--border-color)', 
                borderRadius: '12px', 
                display: 'flex',
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#ffffff',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                padding: '4px'
              }}>
                {planData.config.brandKit.logoUrl ? (
                  <img src={planData.config.brandKit.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(true)}
                className="btn btn-primary"
                style={{
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  fontWeight: 700
                }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Generar con IA</span>
              </button>
              <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '0.8rem', padding: '0.5rem 0.9rem', borderRadius: '8px' }}>
                <Upload className="w-4 h-4" />
                <span>Subir PNG</span>
                <input type="file" accept="image/png, image/jpeg, image/svg+xml" style={{ display: 'none' }} onChange={handleLogoUpload} />
              </label>
            </div>
          </div>

          <LogoGeneratorModal
            isOpen={isLogoModalOpen}
            onClose={() => setIsLogoModalOpen(false)}
            projectId={planData.config?.projectId}
            projectType={planData.config?.projectType === 'social_bid' ? 'social' : 'negocios'}
            pollinationsKey={planData.config?.ai?.pollinationsKey || ''}
            initialBrandData={{
              companyName: planData.config.brandKit.companyName || planData.semilla?.negocio?.nombre_marca,
              giro: planData.semilla?.negocio?.giro || planData.semilla?.negocio?.propuesta_valor,
              isotipoDesc: planData.semilla?.negocio?.isotipo || '',
              primaryColor: planData.config.brandKit.primaryColor || '#6366f1',
              secondaryColor: planData.config.brandKit.secondaryColor || '#10b981'
            }}
            onSelectLogo={(dataUrl, meta) => {
              handleBrandChange('logoUrl', dataUrl);
              if (meta?.primaryColor) handleBrandChange('primaryColor', meta.primaryColor);
              if (meta?.secondaryColor) handleBrandChange('secondaryColor', meta.secondaryColor);
            }}
          />

          <div className="form-group">
            <label className="form-label">Color de Acento</label>
            <input 
              type="color" 
              className="form-control" 
              style={{ height: '42px', padding: '2px' }}
              value={planData.config.brandKit.primaryColor}
              onChange={(e) => handleBrandChange('primaryColor', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tema de Interfaz</label>
            <select 
              className="form-control" 
              value={planData.config.theme || 'dark'}
              onChange={(e) => updateConfig('theme', '', e.target.value)}
            >
              <option value="dark">Modo Oscuro (Industrial)</option>
              <option value="light">Modo Claro (Académico)</option>
              <option value="midnight">Noche Profunda (Contraste)</option>
              <option value="forest">Sostenible (Bosque)</option>
              <option value="clean">Ejecutivo (Limpio)</option>
              <option value="oceanic">Creativo (Océano)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lienzo de Diseño de Portada */}
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Palette className="text-[#8b5cf6]" />
          <h2 style={{ fontSize: '1.25rem' }}>Lienzo de Diseño de Portada (Diseñador General)</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem' }}>
          {/* Controles de Diseño */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div className="form-group">
              <label className="form-label">Estilo de Diseño (Layout)</label>
              <select 
                className="form-control" 
                value={coverDesign.layout}
                onChange={(e) => handleCoverChange('layout', e.target.value)}
              >
                <option value="classic">Clásico (Centrado Académico)</option>
                <option value="modern">Moderno (Franja y Acento)</option>
                <option value="minimalist">Minimalista (Limpio y Elegante)</option>
                <option value="sidebar">Borde Lateral (Izquierdo Corporativo)</option>
                <option value="dark_executive">Obsidian / Dark Executive (Fondo Oscuro Premium)</option>
                <option value="academic_frame">Marco Formal Institucional (Doble Borde)</option>
                <option value="gradient_wave">Gradient Wave / Tech Dynamic (Innovación)</option>
                <option value="split_grid">Split Grid 50/50 (Editorial Suizo)</option>
                <option value="nordic_line">Elegancia Nórdica (Línea Tipográfica)</option>
                <option value="editorial_vogue">Editorial High-Fashion / Vogue (Tipografía Grande Serif)</option>
                <option value="blueprint_tech">Blueprint Técnico / Ingeniería (Cuadrícula Blueprint)</option>
                <option value="geometric_mosaic">Mosaico Geométrico / Polígonos Modernos</option>
                <option value="golden_prestige">Golden Prestige / Banca Privada (Negro y Oro)</option>
                <option value="brutalist_bold">Neobrutalismo / Bold Poster (Bordes Gruesos y Sombra 3D)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Alineación del Logo</label>
              <select 
                className="form-control" 
                value={coverDesign.logoAlign}
                onChange={(e) => handleCoverChange('logoAlign', e.target.value)}
              >
                <option value="left">Izquierda</option>
                <option value="center">Centro</option>
                <option value="right">Derecha</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tamaño del Logo</label>
              <select 
                className="form-control" 
                value={coverDesign.logoSize}
                onChange={(e) => handleCoverChange('logoSize', e.target.value)}
              >
                <option value="small">Chico</option>
                <option value="medium">Mediano</option>
                <option value="large">Grande</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tamaño del Título</label>
              <select 
                className="form-control" 
                value={coverDesign.titleSize}
                onChange={(e) => handleCoverChange('titleSize', e.target.value)}
              >
                <option value="small">Chico</option>
                <option value="medium">Mediano</option>
                <option value="large">Grande</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Subtítulo de la Portada</label>
              <input 
                type="text" 
                className="form-control" 
                value={coverDesign.subtitle}
                onChange={(e) => handleCoverChange('subtitle', e.target.value)}
                placeholder="Ej. Plan Estratégico Maestro"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Institución / Organización</label>
              <input 
                type="text" 
                className="form-control" 
                value={coverDesign.institution}
                onChange={(e) => handleCoverChange('institution', e.target.value)}
                placeholder="Ej. Formulación y Evaluación Académica 2026"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Creador (Nombre de quien crea)</label>
              <input 
                type="text" 
                className="form-control" 
                value={coverDesign.creatorName}
                onChange={(e) => handleCoverChange('creatorName', e.target.value)}
                placeholder="Ej. Roberto Eduardo Celis Robles"
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={coverDesign.showDate !== false}
                  onChange={(e) => handleCoverChange('showDate', e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                />
                <span style={{ fontSize: '0.85rem' }}>Mostrar Fecha en Portada</span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Fecha Personalizada (Opcional)</label>
              <input 
                type="text" 
                className="form-control" 
                value={coverDesign.customDate}
                onChange={(e) => handleCoverChange('customDate', e.target.value)}
                placeholder="Vacío para fecha actual"
                disabled={coverDesign.showDate === false}
              />
            </div>

            {/* Logos Institucionales */}
            <div className="form-group" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem', marginTop: '0.5rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🏛️ Logos de Instituciones Participantes
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 400 }}>(Máx. 4)</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {institutionLogos.map((logo) => (
                  <div key={logo.id} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                    padding: '0.5rem', background: 'var(--bg-dark)', borderRadius: '8px',
                    border: '1px solid var(--border-color)', width: '110px'
                  }}>
                    <img src={logo.url} alt={logo.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px' }} />
                    <input
                      type="text"
                      value={logo.name}
                      onChange={(e) => updateInstitutionLogoName(logo.id, e.target.value)}
                      style={{
                        width: '100%', fontSize: '0.65rem', textAlign: 'center',
                        background: 'transparent', border: 'none', color: 'var(--text-primary)',
                        borderBottom: '1px solid var(--border-color)', padding: '2px 0', outline: 'none'
                      }}
                      placeholder="Nombre"
                    />
                    <button
                      onClick={() => removeInstitutionLogo(logo.id)}
                      style={{
                        fontSize: '0.65rem', color: '#ef4444', background: 'transparent',
                        border: 'none', cursor: 'pointer', padding: '2px'
                      }}
                      title="Eliminar logo"
                    >
                      <Trash2 style={{ width: '12px', height: '12px' }} />
                    </button>
                  </div>
                ))}
                {institutionLogos.length < 4 && (
                  <label style={{
                    width: '110px', height: '90px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                    border: '2px dashed var(--border-color)', borderRadius: '8px',
                    cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.7rem',
                    transition: 'border-color 0.2s'
                  }}>
                    <Plus style={{ width: '20px', height: '20px' }} />
                    <span>Agregar</span>
                    <input type="file" accept="image/*" onChange={handleInstitutionLogoUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Miniatura en Vivo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vista Previa Portada</span>
            <div style={{
              width: '220px',
              height: '310px',
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.25rem',
              textAlign: coverDesign.layout === 'classic' ? 'center' : 'left',
              justifyContent: 'space-between',
              fontFamily: 'Inter, sans-serif'
            }}>
              {/* Sidebar border style */}
              {coverDesign.layout === 'sidebar' && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '12px',
                  height: '100%',
                  background: planData.config.brandKit.primaryColor || '#6366f1'
                }} />
              )}

              {/* Modern banner layout */}
              {coverDesign.layout === 'modern' && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '15%',
                  width: '100%',
                  height: '40px',
                  background: planData.config.brandKit.primaryColor || '#6366f1',
                  opacity: 0.15
                }} />
              )}

              {/* Obsidian Dark Executive */}
              {coverDesign.layout === 'dark_executive' && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, #090d16 0%, #0f172a 100%)',
                  zIndex: 0
                }} />
              )}

              {/* Academic Frame (Doble Marco) */}
              {coverDesign.layout === 'academic_frame' && (
                <div style={{
                  position: 'absolute',
                  inset: '8px',
                  border: '2px solid #334155',
                  borderRadius: '4px',
                  outline: '1px solid #cbd5e1',
                  outlineOffset: '-4px',
                  pointerEvents: 'none',
                  zIndex: 0
                }} />
              )}

              {/* Gradient Wave */}
              {coverDesign.layout === 'gradient_wave' && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '70px',
                  background: `linear-gradient(135deg, ${planData.config.brandKit.primaryColor || '#6366f1'} 0%, #a855f7 50%, #ec4899 100%)`,
                  borderRadius: '0 0 50% 50% / 0 0 20px 20px',
                  zIndex: 0
                }} />
              )}

              {/* Split Grid 50/50 */}
              {coverDesign.layout === 'split_grid' && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '40%',
                  height: '100%',
                  background: planData.config.brandKit.primaryColor || '#6366f1',
                  zIndex: 0
                }} />
              )}

              {/* Nordic Line */}
              {coverDesign.layout === 'nordic_line' && (
                <div style={{
                  position: 'absolute',
                  left: '20px',
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  background: '#cbd5e1',
                  zIndex: 0
                }} />
              )}

              {/* Editorial Vogue */}
              {coverDesign.layout === 'editorial_vogue' && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  border: '1px solid #000000',
                  margin: '6px',
                  pointerEvents: 'none',
                  zIndex: 0
                }} />
              )}

              {/* Blueprint Tech */}
              {coverDesign.layout === 'blueprint_tech' && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#0a192f',
                  backgroundImage: 'radial-gradient(rgba(56,189,248,0.2) 1px, transparent 0)',
                  backgroundSize: '10px 10px',
                  zIndex: 0
                }} />
              )}

              {/* Geometric Mosaic */}
              {coverDesign.layout === 'geometric_mosaic' && (
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '120px',
                  height: '120px',
                  background: `linear-gradient(135deg, ${planData.config.brandKit.primaryColor || '#6366f1'} 0%, #3b82f6 100%)`,
                  clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                  opacity: 0.2,
                  zIndex: 0
                }} />
              )}

              {/* Golden Prestige */}
              {coverDesign.layout === 'golden_prestige' && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#0b0f19',
                  border: '1.5px solid #d97706',
                  margin: '6px',
                  zIndex: 0
                }} />
              )}

              {/* Brutalist Bold */}
              {coverDesign.layout === 'brutalist_bold' && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#fef08a',
                  border: '3px solid #000000',
                  boxShadow: '4px 4px 0px #000000',
                  zIndex: 0
                }} />
              )}

              {/* Top part: Logo */}
              <div style={{
                display: 'flex',
                justifyContent: coverDesign.logoAlign === 'left' ? 'flex-start' : coverDesign.logoAlign === 'right' ? 'flex-end' : 'center',
                width: '100%',
                paddingLeft: coverDesign.layout === 'sidebar' ? '10px' : coverDesign.layout === 'split_grid' ? '45%' : '0',
                zIndex: 1
              }}>
                {planData.config.brandKit.logoUrl ? (
                  <img 
                    src={planData.config.brandKit.logoUrl} 
                    alt="Logo preview" 
                    style={{
                      width: coverDesign.logoSize === 'small' ? '30px' : coverDesign.logoSize === 'large' ? '70px' : '50px',
                      height: 'auto',
                      maxHeight: '40px',
                      objectFit: 'contain',
                      background: ['dark_executive', 'blueprint_tech', 'golden_prestige'].includes(coverDesign.layout) ? '#ffffff' : 'transparent',
                      padding: ['dark_executive', 'blueprint_tech', 'golden_prestige'].includes(coverDesign.layout) ? '2px' : '0',
                      borderRadius: '4px'
                    }}
                  />
                ) : (
                  <div style={{
                    width: coverDesign.logoSize === 'small' ? '30px' : coverDesign.logoSize === 'large' ? '70px' : '50px',
                    height: '25px',
                    borderRadius: '4px',
                    border: ['dark_executive', 'blueprint_tech', 'golden_prestige'].includes(coverDesign.layout) ? '1px dashed #475569' : coverDesign.layout === 'brutalist_bold' ? '2px solid #000000' : '1px dashed #cbd5e1',
                    background: ['dark_executive', 'blueprint_tech', 'golden_prestige'].includes(coverDesign.layout) ? '#1e293b' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    fontWeight: coverDesign.layout === 'brutalist_bold' ? 900 : 400,
                    color: ['dark_executive', 'blueprint_tech', 'golden_prestige'].includes(coverDesign.layout) ? '#94a3b8' : coverDesign.layout === 'brutalist_bold' ? '#000000' : '#94a3b8'
                  }}>Logo</div>
                )}
              </div>

              {/* Center part: Title and Subtitle */}
              <div style={{
                paddingLeft: coverDesign.layout === 'sidebar' ? '10px' : coverDesign.layout === 'split_grid' ? '45%' : coverDesign.layout === 'nordic_line' ? '15px' : '0',
                margin: 'auto 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                zIndex: 1
              }}>
                {coverDesign.layout === 'modern' && (
                  <div style={{ width: '30px', height: '3px', background: planData.config.brandKit.primaryColor || '#6366f1', marginBottom: '0.25rem', alignSelf: coverDesign.layout === 'classic' ? 'center' : 'flex-start' }} />
                )}
                {coverDesign.layout === 'nordic_line' && (
                  <div style={{ width: '15px', height: '2px', background: '#0f172a', marginBottom: '0.2rem' }} />
                )}
                {coverDesign.layout === 'golden_prestige' && (
                  <div style={{ width: '25px', height: '1.5px', background: '#f59e0b', margin: '0 auto 0.3rem auto' }} />
                )}
                <h3 style={{
                  margin: 0,
                  fontSize: coverDesign.titleSize === 'small' ? '10px' : coverDesign.titleSize === 'large' ? '16px' : '13px',
                  fontWeight: coverDesign.layout === 'editorial_vogue' ? 400 : 800,
                  fontFamily: coverDesign.layout === 'editorial_vogue' ? 'Playfair Display, Georgia, serif' : coverDesign.layout === 'blueprint_tech' ? 'Courier New, monospace' : 'inherit',
                  letterSpacing: coverDesign.layout === 'editorial_vogue' ? '0.08em' : coverDesign.layout === 'blueprint_tech' ? '0.05em' : 'normal',
                  lineHeight: '1.2',
                  textTransform: coverDesign.layout === 'brutalist_bold' || coverDesign.layout === 'editorial_vogue' ? 'uppercase' : 'none',
                  color: ['dark_executive', 'golden_prestige'].includes(coverDesign.layout) ? '#f8fafc' : coverDesign.layout === 'blueprint_tech' ? '#38bdf8' : coverDesign.layout === 'brutalist_bold' ? '#000000' : '#0f172a'
                }}>
                  {planData.config.brandKit.companyName || 'Nombre del Proyecto'}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '7px',
                  color: coverDesign.layout === 'dark_executive' ? '#94a3b8' : coverDesign.layout === 'blueprint_tech' ? '#7dd3fc' : coverDesign.layout === 'golden_prestige' ? '#f59e0b' : coverDesign.layout === 'brutalist_bold' ? '#000000' : planData.config.brandKit.primaryColor || '#64748b',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {coverDesign.subtitle || 'Plan Estratégico Maestro'}
                </p>
                {coverDesign.institution && (
                  <p style={{
                    margin: '3px 0 0 0',
                    fontSize: '6px',
                    color: ['dark_executive', 'blueprint_tech', 'golden_prestige'].includes(coverDesign.layout) ? '#64748b' : coverDesign.layout === 'brutalist_bold' ? '#44403c' : '#94a3b8'
                  }}>
                    {coverDesign.institution}
                  </p>
                )}
              </div>

              {/* Bottom part: Creator and Date */}
              <div style={{
                paddingLeft: coverDesign.layout === 'sidebar' ? '10px' : coverDesign.layout === 'split_grid' ? '45%' : coverDesign.layout === 'nordic_line' ? '15px' : '0',
                borderTop: ['dark_executive', 'blueprint_tech', 'golden_prestige'].includes(coverDesign.layout) ? '1px solid #1e293b' : coverDesign.layout === 'brutalist_bold' ? '2px solid #000000' : '1px solid #f1f5f9',
                paddingTop: '8px',
                fontSize: '6.5px',
                color: ['dark_executive', 'golden_prestige'].includes(coverDesign.layout) ? '#cbd5e1' : coverDesign.layout === 'blueprint_tech' ? '#94a3b8' : coverDesign.layout === 'brutalist_bold' ? '#000000' : '#475569',
                zIndex: 1
              }}>
                <div style={{ fontWeight: 600 }}>
                  {coverDesign.creatorName ? `Creado por: ${coverDesign.creatorName}` : 'Elaborado por: [Tu Nombre]'}
                </div>
                {coverDesign.showDate !== false && (
                  <div style={{ color: coverDesign.layout === 'dark_executive' ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
                    {coverDesign.customDate || new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                )}
                {/* Institution logos in miniature */}
                {institutionLogos.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '5px', paddingTop: '4px', borderTop: coverDesign.layout === 'dark_executive' ? '1px solid #1e293b' : '1px solid #f1f5f9' }}>
                    {institutionLogos.map(logo => (
                      <img key={logo.id} src={logo.url} alt={logo.name} style={{ width: '16px', height: '16px', objectFit: 'contain', borderRadius: '2px' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Globe className="text-blue-400" />
          <h2 style={{ fontSize: '1.25rem' }}>Investigación Web e Internet</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-panel-hover)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
               <input 
                 type="checkbox" 
                 checked={searchConfig.duckDuckGoEnabled !== false}
                 onChange={(e) => {
                   handleSearchConfigChange('duckDuckGoEnabled', e.target.checked);
                   if (!e.target.checked && searchConfig.provider === 'duckduckgo') {
                     handleSearchConfigChange('provider', 'tavily');
                   }
                 }}
                 style={{ width: '1.2rem', height: '1.2rem' }}
               />
               <span>✅ Habilitar DuckDuckGo Scraper (Alternativa local sin costo — <strong>Activo por defecto</strong>)</span>
             </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-group">
              <label className="form-label">Proveedor de Búsqueda Principal</label>
              <select 
                className="form-control"
                value={searchConfig.provider}
                onChange={(e) => handleSearchConfigChange('provider', e.target.value)}
              >
                <option value="tavily">Tavily AI (Recomendado)</option>
                {searchConfig.duckDuckGoEnabled && (
                  <option value="duckduckgo">DuckDuckGo Scraper</option>
                )}
              </select>
              <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
                Tavily ofrece mejores resultados orientados a LLMs. DuckDuckGo es gratuito pero puede ser bloqueado.
              </small>
            </div>

            {searchConfig.provider === 'tavily' && (
              <div className="form-group">
                <label className="form-label">API Key de Tavily AI</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="tvly-..."
                  value={searchConfig.apiKey}
                  onChange={(e) => {
                    handleSearchConfigChange('apiKey', e.target.value);
                    apiStatus.setTavilyStatus({ state: 'idle', message: '' });
                  }}
                />
                <ApiStatusBadge 
                  status={apiStatus.tavilyStatus} 
                  onTest={() => apiStatus.testTavily(searchConfig.apiKey)} 
                  disabled={!searchConfig.apiKey} 
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Database className="text-emerald-400" />
          <h2 style={{ fontSize: '1.25rem' }}>Investigación Estratégica (INEGI / DENUE)</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="form-group">
            <label className="form-label">Token INEGI / DENUE</label>
            <input 
              type="password" 
              className="form-control" 
              value={planData.config.externalApis.inegiToken}
              onChange={(e) => {
                handleExternalChange('inegiToken', e.target.value);
                apiStatus.setInegiStatus({ state: 'idle', message: '' });
              }}
            />
            <ApiStatusBadge 
              status={apiStatus.inegiStatus} 
              onTest={() => apiStatus.testInegi(planData.config.externalApis.inegiToken)} 
              disabled={!planData.config.externalApis.inegiToken} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Token BANXICO</label>
            <input 
              type="password" 
              className="form-control" 
              value={planData.config.externalApis.banxicoToken}
              onChange={(e) => {
                handleExternalChange('banxicoToken', e.target.value);
                apiStatus.setBanxicoStatus({ state: 'idle', message: '' });
              }}
            />
            <ApiStatusBadge 
              status={apiStatus.banxicoStatus} 
              onTest={() => apiStatus.testBanxico(planData.config.externalApis.banxicoToken)} 
              disabled={!planData.config.externalApis.banxicoToken} 
            />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div className="form-group">
            <label className="form-label">API Key: Google (Places & Custom Search)</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Opcional. Para análisis de competencia."
              value={planData.config.externalApis?.googleApiKey || ''}
              onChange={(e) => handleExternalChange('googleApiKey', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Google Custom Search ID (CX)</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Opcional. Para escanear redes sociales."
              value={planData.config.externalApis?.googleCx || ''}
              onChange={(e) => handleExternalChange('googleCx', e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px dashed var(--border-color)' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Motor de Web Scraping Avanzado</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Habilita la extracción profunda de datos (precios de E-commerce, seguidores en RRSS y evasión de bots).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-group">
              <label className="form-label">Proveedor de Scraping</label>
              <select 
                className="form-control"
                value={planData.config.externalApis?.scraperEngine || 'local'}
                onChange={(e) => handleExternalChange('scraperEngine', e.target.value)}
              >
                <option value="local">✅ Local Headless (Gratis - Puppeteer Stealth) — Activo por defecto</option>
                <option value="apify">Apify Cloud ($5/mes o Capa Gratis)</option>
                <option value="gridpanel">GridPanel Cloud</option>
              </select>
            </div>
            
            {planData.config.externalApis?.scraperEngine === 'apify' && (
              <div className="form-group">
                <label className="form-label">Apify API Token</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="apify_api_..."
                  value={planData.config.externalApis?.apifyToken || ''}
                  onChange={(e) => handleExternalChange('apifyToken', e.target.value)}
                />
              </div>
            )}

            {planData.config.externalApis?.scraperEngine === 'gridpanel' && (
              <div className="form-group">
                <label className="form-label">GridPanel API Key</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="sk_..."
                  value={planData.config.externalApis?.gridPanelKey || ''}
                  onChange={(e) => handleExternalChange('gridPanelKey', e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard de Gemelos Digitales */}
      <div style={{ marginTop: '2rem' }}>
        <DigitalTwinDashboard />
      </div>

      {/* Conexiones Gemelo Digital */}
      <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity className="text-[#f59e0b]" />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Conexiones de Datos en Tiempo Real (Gemelo Digital)</h2>
          </div>
          <span style={{ fontSize: '0.7rem', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '3px 8px', borderRadius: '10px', fontWeight: 700 }}>
            9 Fuentes de Datos Integradas
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Conecta APIs financieras, macroeconómicas y sectoriales para alimentar automáticamente los cálculos matemáticos (WACC, CAPM, Montecarlo), el análisis PESTEL y la validación de mercado con evidencia del mundo real.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          
          {/* ALPHA VANTAGE (JSON Financiero) */}
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1.5px solid rgba(59,130,246,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#3b82f6' }}>📈 Alpha Vantage <span style={{ fontSize: '0.6rem', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '1px 6px', borderRadius: '8px' }}>5 req/min</span></div>
              <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 700 }}>Obtener Key ↗</a>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Alimenta: <strong>Finanzas (WACC, Beta)</strong> · <strong>Mercado (Volatilidad)</strong> · <strong>PESTEL (Económico)</strong></div>
            <input 
              type="password" 
              className="form-control" 
              placeholder="38CEHMYW5CGOHUX1..."
              value={planData.config.externalApis?.alphaVantageKey || ''}
              onChange={(e) => handleExternalChange('alphaVantageKey', e.target.value)}
              style={{ fontSize: '0.8rem' }}
            />
          </div>

          {/* FRED (Federal Reserve Economic Data) */}
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1.5px solid rgba(16,185,129,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#10b981' }}>🏛️ FRED (Reserva Federal) <span style={{ fontSize: '0.6rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 6px', borderRadius: '8px' }}>Gratis</span></div>
              <a href="https://fred.stlouisfed.org/docs/api/api_key.html" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#10b981', textDecoration: 'none', fontWeight: 700 }}>Obtener Key ↗</a>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Alimenta: <strong>Tasa Libre de Riesgo (10Y)</strong> · <strong>Inflación USA</strong> · <strong>WACC</strong></div>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Opcional. Para series temporales de bonos del tesoro..."
              value={planData.config.externalApis?.fredKey || ''}
              onChange={(e) => handleExternalChange('fredKey', e.target.value)}
              style={{ fontSize: '0.8rem' }}
            />
          </div>

          {/* BANXICO SieAPI (CETES y Tipo de Cambio) */}
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1.5px solid rgba(245,158,11,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#f59e0b' }}>🇲🇽 BANXICO SieAPI <span style={{ fontSize: '0.6rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '1px 6px', borderRadius: '8px' }}>Oficial</span></div>
              <a href="https://www.banxico.org.mx/SieAPIRest/service/v1/token" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#f59e0b', textDecoration: 'none', fontWeight: 700 }}>Obtener Token ↗</a>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Alimenta: <strong>CETES 28d</strong> · <strong>Tipo de Cambio FIX</strong> · <strong>TIIE</strong></div>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Token de BANXICO SieAPI..."
              value={planData.config.externalApis?.banxicoToken || ''}
              onChange={(e) => handleExternalChange('banxicoToken', e.target.value)}
              style={{ fontSize: '0.8rem' }}
            />
          </div>

          {/* INEGI / DENUE (Censo y Directorio de Empresas) */}
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1.5px solid rgba(99,102,241,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#6366f1' }}>🗺️ INEGI DENUE <span style={{ fontSize: '0.6rem', background: 'rgba(99,102,241,0.15)', color: '#6366f1', padding: '1px 6px', borderRadius: '8px' }}>Geolocalizado</span></div>
              <a href="https://www.inegi.org.mx/servicios/api_denue.html" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#6366f1', textDecoration: 'none', fontWeight: 700 }}>Obtener Token ↗</a>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Alimenta: <strong>TAM/SAM/SOM</strong> · <strong>Competencia Regional</strong> · <strong>Ubicación Operativa</strong></div>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Token de INEGI DENUE..."
              value={planData.config.externalApis?.inegiToken || ''}
              onChange={(e) => handleExternalChange('inegiToken', e.target.value)}
              style={{ fontSize: '0.8rem' }}
            />
          </div>

          {/* COINGECKO (Criptoactivos & DeFi) */}
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1.5px solid rgba(139,92,246,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#8b5cf6' }}>🪙 CoinGecko <span style={{ fontSize: '0.6rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 6px', borderRadius: '8px' }}>Público Sin Key</span></div>
              <a href="https://www.coingecko.com/en/api" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#8b5cf6', textDecoration: 'none', fontWeight: 700 }}>API Docs ↗</a>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Alimenta: <strong>Finanzas (Activos Digitales)</strong> · <strong>PESTEL (Tecnológico)</strong></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                id="toggleCoinGecko"
                checked={planData.config.externalApis?.coinGeckoEnabled !== false}
                onChange={(e) => handleExternalChange('coinGeckoEnabled', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="toggleCoinGecko" style={{ fontSize: '0.78rem', cursor: 'pointer', margin: 0 }}>
                {planData.config.externalApis?.coinGeckoEnabled !== false ? '✅ Habilitado (BTC, ETH, Stablecoins)' : '❌ Deshabilitado'}
              </label>
            </div>
          </div>

          {/* WORLD BANK (Banco Mundial) */}
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1.5px solid rgba(14,165,233,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0ea5e9' }}>🌐 Banco Mundial <span style={{ fontSize: '0.6rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 6px', borderRadius: '8px' }}>Open Data Sin Key</span></div>
              <a href="https://datahelpdesk.worldbank.org/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#0ea5e9', textDecoration: 'none', fontWeight: 700 }}>Portal ↗</a>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Alimenta: <strong>PIB Nacional</strong> · <strong>PESTEL (Económico/Social)</strong> · <strong>Comercio Exterior</strong></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                id="toggleWorldBank"
                checked={planData.config.externalApis?.worldBankEnabled !== false}
                onChange={(e) => handleExternalChange('worldBankEnabled', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="toggleWorldBank" style={{ fontSize: '0.78rem', cursor: 'pointer', margin: 0 }}>
                {planData.config.externalApis?.worldBankEnabled !== false ? '✅ Habilitado (Indicadores Macro Mundiales)' : '❌ Deshabilitado'}
              </label>
            </div>
          </div>

          {/* NEWS API (Radar de Noticias Sectoriales) */}
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1.5px solid rgba(236,72,153,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ec4899' }}>📰 NewsAPI <span style={{ fontSize: '0.6rem', background: 'rgba(236,72,153,0.15)', color: '#ec4899', padding: '1px 6px', borderRadius: '8px' }}>100 req/día Free</span></div>
              <a href="https://newsapi.org/register" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#ec4899', textDecoration: 'none', fontWeight: 700 }}>Obtener Key ↗</a>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Alimenta: <strong>Radar de Tendencias</strong> · <strong>PESTEL (Político/Social)</strong> · <strong>Mercado</strong></div>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Opcional. API Key de newsapi.org..."
              value={planData.config.externalApis?.newsApiKey || ''}
              onChange={(e) => handleExternalChange('newsApiKey', e.target.value)}
              style={{ fontSize: '0.8rem' }}
            />
          </div>

          {/* EXCHANGERATE (Tipos de Cambio Internacionales) */}
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1.5px solid rgba(20,184,166,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#14b8a6' }}>💱 ExchangeRate API <span style={{ fontSize: '0.6rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 6px', borderRadius: '8px' }}>Público Sin Key</span></div>
              <a href="https://open.er-api.com/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#14b8a6', textDecoration: 'none', fontWeight: 700 }}>API Docs ↗</a>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Alimenta: <strong>Paridad USD, EUR, CAD, GBP, JPY</strong> · <strong>Costos de Importación</strong></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                id="toggleExchangeRate"
                checked={planData.config.externalApis?.exchangeRateEnabled !== false}
                onChange={(e) => handleExternalChange('exchangeRateEnabled', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="toggleExchangeRate" style={{ fontSize: '0.78rem', cursor: 'pointer', margin: 0 }}>
                {planData.config.externalApis?.exchangeRateEnabled !== false ? '✅ Habilitado (Actualizaciones diarias de FX)' : '❌ Deshabilitado'}
              </label>
            </div>
          </div>

          {/* SEC EDGAR (Reportes Corporativos Oficiales) */}
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1.5px solid rgba(168,85,247,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#a855f7' }}>📑 SEC EDGAR <span style={{ fontSize: '0.6rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 6px', borderRadius: '8px' }}>Público Sin Key</span></div>
              <a href="https://www.sec.gov/edgar/searchedgar/companysearch" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#a855f7', textDecoration: 'none', fontWeight: 700 }}>Buscador CIK ↗</a>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Alimenta: <strong>Benchmarks 10-K / 10-Q</strong> · <strong>Márgenes de Industria</strong> · <strong>Gobierno Corporativo</strong></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                id="toggleSecEdgar"
                checked={planData.config.externalApis?.secEdgarEnabled !== false}
                onChange={(e) => handleExternalChange('secEdgarEnabled', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="toggleSecEdgar" style={{ fontSize: '0.78rem', cursor: 'pointer', margin: 0 }}>
                {planData.config.externalApis?.secEdgarEnabled !== false ? '✅ Habilitado (Reportes Públicos XBRL)' : '❌ Deshabilitado'}
              </label>
            </div>
          </div>

        </div>
      </div>
      
      {/* Créditos y Metodologías */}
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Database style={{ color: 'var(--accent-color)' }} />
          <h2 style={{ fontSize: '1.25rem' }}>Créditos y Metodologías Aplicadas</h2>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '1rem' }}>
            El motor financiero y estratégico de esta plataforma ha sido calibrado usando estándares de clase mundial y metodologías oficiales para garantizar validez institucional y viabilidad bancaria:
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>NAFIN (Nacional Financiera):</strong> Estructuras de Flujo de Caja y evaluación crediticia para MiPyMEs en México.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>BID (Banco Interamericano de Desarrollo):</strong> Implementación de la Metodología de Marco Lógico (MML) para el diseño, ejecución y evaluación de proyectos sociales.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>CFI (Corporate Finance Institute):</strong> Fórmulas estandarizadas globales para Valor Actual Neto (VAN), Tasa Interna de Retorno (TIR) y Retorno sobre Inversión (ROI).</li>
            <li><strong>INEGI y Banxico:</strong> Datos macroeconómicos integrados a través de DENUE y SieAPI para el análisis del entorno regional.</li>
          </ul>
        </div>
      </div>

      {/* Fuentes de Información */}
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <BookOpen style={{ color: '#f59e0b' }} />
          <h2 style={{ fontSize: '1.25rem' }}>Fuentes de Información</h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Agrega las fuentes de información consultadas para la elaboración de este plan. Se incluirán automáticamente las APIs utilizadas (DENUE, Banxico) y puedes agregar fuentes manuales (leyes, precios, estudios, etc.).
        </p>

        {/* Auto-detected sources */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fuentes Automáticas Detectadas</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {planData.config?.externalApis?.inegiToken && (
              <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 600 }}>
                ✓ INEGI / DENUE — Directorio Estadístico Nacional de Unidades Económicas
              </span>
            )}
            {planData.config?.externalApis?.banxicoToken && (
              <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)', fontWeight: 600 }}>
                ✓ Banxico SieAPI — Indicadores Macroeconómicos
              </span>
            )}
            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', fontWeight: 600 }}>
              ✓ INEGI WMS — Cartografía y Límites Territoriales
            </span>
            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)', fontWeight: 600 }}>
              ✓ OpenStreetMap — Base Cartográfica
            </span>
          </div>
        </div>

        {/* Manual sources */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fuentes Manuales</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
            {dataSources.map((source) => (
              <div key={source.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto',
                gap: '0.5rem', alignItems: 'start',
                padding: '0.75rem', background: 'var(--bg-dark)',
                borderRadius: '8px', border: '1px solid var(--border-color)'
              }}>
                <input
                  type="text"
                  className="form-control"
                  value={source.title}
                  onChange={(e) => updateDataSource(source.id, 'title', e.target.value)}
                  placeholder="Título de la fuente"
                  style={{ fontSize: '0.8rem' }}
                />
                <input
                  type="text"
                  className="form-control"
                  value={source.url}
                  onChange={(e) => updateDataSource(source.id, 'url', e.target.value)}
                  placeholder="URL (opcional)"
                  style={{ fontSize: '0.8rem' }}
                />
                <input
                  type="text"
                  className="form-control"
                  value={source.description}
                  onChange={(e) => updateDataSource(source.id, 'description', e.target.value)}
                  placeholder="Descripción breve (ej: Consulta de precios de materiales)"
                  style={{ fontSize: '0.8rem' }}
                />
                <button
                  onClick={() => removeDataSource(source.id)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', color: '#ef4444', fontSize: '0.75rem', height: '2.5rem' }}
                  title="Eliminar fuente"
                >
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addDataSource}
            className="btn btn-secondary"
            style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
          >
            <Plus style={{ width: '14px', height: '14px' }} />
            <span>Agregar Fuente Manual</span>
          </button>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <DocumentUploader />
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Globe style={{ color: 'var(--accent-color)' }} size={20} />
          <h2 style={{ fontSize: '1.25rem' }}>Fondo Thoth Cloud (Integración Externa)</h2>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Configura tus credenciales del entorno web de Fondo Thoth para sincronizar y aislar tus proyectos en el servidor local.
        </p>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className="form-group" style={{ flex: '1 1 300px', maxWidth: '450px' }}>
            <label className="form-label" style={{ fontWeight: 'bold' }}>ID / Token de Usuario</label>
            <input 
              type="text" 
              className="form-control" 
              value={cloudUserId}
              onChange={(e) => handleCloudUserIdChange(e.target.value)}
              placeholder="Ej: roberto, usuario_123, etc."
            />
            <small style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', display: 'block' }}>
              {cloudUserId ? `Sincronizando proyectos en carpeta aislada: user_${cloudUserId.replace(/[^a-z0-9]/gi, '_').toLowerCase()}` : 'Usando espacio de almacenamiento local compartido por defecto.'}
            </small>
          </div>

          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowSshGuide(!showSshGuide)}
              style={{ fontSize: '0.8rem', alignSelf: 'flex-start' }}
            >
              {showSshGuide ? 'Ocultar Guía de Túnel SSH' : 'Mostrar Guía de Túnel SSH para Ollama (VPS)'}
            </button>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Permite conectar tu servidor VPS con tu máquina local de IA con RTX mediante SSH.
            </span>
          </div>
        </div>

        {showSshGuide && (
          <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--bg-panel-hover)', borderRadius: '8px', border: '1px solid var(--border-color)', animation: 'fadeIn 0.2s ease-out' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 800, marginBottom: '0.75rem' }}>
              🔑 Guía para crear el Túnel Seguro SSH (Ollama Local ⇆ VPS)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Sigue estos comandos en tu máquina local para conectar el puerto local de Ollama (11434) con el servidor VPS remoto de Fondo Thoth de forma directa, encriptada y omitiendo bloqueos de red universitarios:
            </p>
            <ol style={{ fontSize: '0.8rem', color: 'var(--text-primary)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <strong>Generar llaves SSH locales (si no tienes una):</strong>
                <pre style={{ background: '#09090b', color: '#10b981', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', marginTop: '0.25rem', overflowX: 'auto' }}>
                  ssh-keygen -t ed25519
                </pre>
              </li>
              <li>
                <strong>Copiar la llave al VPS (autorizar conexión sin contraseña):</strong>
                <pre style={{ background: '#09090b', color: '#10b981', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', marginTop: '0.25rem', overflowX: 'auto' }}>
                  ssh-copy-id usuario@ip_del_vps
                </pre>
              </li>
              <li>
                <strong>Crear el túnel reverso del puerto 11434:</strong>
                <pre style={{ background: '#09090b', color: '#10b981', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', marginTop: '0.25rem', overflowX: 'auto' }}>
                  ssh -N -R 11434:localhost:11434 usuario@ip_del_vps
                </pre>
              </li>
            </ol>
            <div style={{ marginTop: '1rem', padding: '0.5rem 0.75rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px', color: '#10b981', fontSize: '0.75rem' }}>
              💡 <strong>Tip:</strong> El flag <code>-N</code> mantiene la conexión de puertos sin abrir una terminal interactiva y <code>-R</code> redirige de forma segura las peticiones del VPS a tu máquina local con GPU RTX.
            </div>
          </div>
        )}
      </div>

      {/* [TOUCH BAR] Panel de Integración MacBook Pro (Chrome & BTT) */}
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', border: '1px solid rgba(99, 102, 241, 0.3)', background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.04) 0%, rgba(15, 23, 42, 0.4) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              ⌨️
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 800, margin: 0 }}>
                MacBook Pro Touch Bar & Chrome MediaSession
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                Proyección en tiempo real de agentes IA, progreso % y monitor en la barra OLED física.
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', background: '#10b98120', color: '#10b981', padding: '0.25rem 0.6rem', borderRadius: '12px', fontWeight: 700 }}>
            ● Activo en Chrome & Safari
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: 'var(--bg-panel)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
              🌐 Modo Web Zero-Install (Chrome / Safari)
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
              La barra OLED de tu MacBook Pro muestra automáticamente el modelo activo (<strong>minimax-m3:cloud</strong>), el porcentaje de avance y el último log mediante la API MediaSession nativa.
            </p>
          </div>

          <div style={{ background: 'var(--bg-panel)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
              🎛️ BetterTouchTool / Raycast Widget
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 0.75rem 0' }}>
              Endpoint de telemetría local activo en <code>/api/touchbar/status</code>. Permite crear botones táctiles para saltar a Vista Previa o Simulador.
            </p>
            <button
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', width: '100%' }}
              onClick={() => {
                const bttScript = `curl -s http://localhost:3001/api/touchbar/status`;
                navigator.clipboard.writeText(bttScript);
                alert("✓ Comando BTT copiado al portapapeles:\\n" + bttScript);
              }}
            >
              📋 Copiar Script JSON para BetterTouchTool
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <RefreshCw style={{ color: '#ef4444' }} />
          <h2 style={{ fontSize: '1.25rem', color: '#ef4444' }}>Herramientas de Emergencia</h2>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Si experimentas problemas con datos mezclados de otros proyectos o la vista previa no se actualiza, usa el botón de abajo para limpiar completamente el motor.
        </p>
        <button 
          className="btn" 
          style={{ background: '#ef4444', color: 'white', border: 'none' }}
          onClick={() => {
            if (window.confirm('⚠️ ¿LIMPIAR TODO? Esto borrará el caché del navegador y reiniciará el proyecto desde cero. Úsalo si ves datos mezclados.')) {
              localStorage.clear();
              const basePath = import.meta.env.BASE_URL || '/';
              window.location.href = `${basePath.endsWith('/') ? basePath.slice(0, -1) : basePath}/semilla`;
            }
          }}
        >
          <Database className="w-4 h-4" />
          <span>Limpiar Todo y Reiniciar Master</span>
        </button>
      </div>

      {/* [UXDD] Toast de guardado — reemplaza window.alert() doble */}
      {saveToast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontWeight: 700, fontSize: '0.95rem',
          animation: 'slideInUp 0.3s ease-out'
        }}>
          <CheckCircle style={{ width: '1.1rem', height: '1.1rem' }} />
          ✅ Configuración guardada correctamente
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'right' }}>
        <button className="btn btn-primary" onClick={showSaveToast}>
          <Save className="w-4 h-4" />
          <span>Guardar Configuración</span>
        </button>
      </div>
    </div>
  );
}
