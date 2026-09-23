import { useState, useEffect, useRef } from 'react';
import { Bot, Mic, MicOff, Send, X, Zap, RefreshCw, RotateCcw, Key, ExternalLink, ShieldCheck } from 'lucide-react';
import { CelisVoiceEngine } from '../lib/voiceEngine';
import { sendBobMessage } from '../lib/bobAgent';
import { usePlan } from '../context/PlanContext';
import { useAuth } from '../contexts/AuthContext';
import { getApiBase } from '../config/apiConfig';

const API_GUIDES = {
  ollamaCloud: { label: 'Ollama Cloud', url: 'https://ollama.com/settings/keys', steps: 'Inicia sesión → Settings → Keys → crea y copia una clave.' },
  groq: { label: 'Groq Cloud', url: 'https://console.groq.com/keys', steps: 'Crea una cuenta → API Keys → Create API Key.' },
  openrouter: { label: 'OpenRouter', url: 'https://openrouter.ai/settings/keys', steps: 'Inicia sesión → Keys → Create Key. Hay modelos gratuitos.' },
  openai: { label: 'OpenAI', url: 'https://platform.openai.com/api-keys', steps: 'Abre API Keys → Create new secret key. Requiere facturación API separada.' }
};

export default function BobChatModal({ isOpen, onClose, planData, onExecuteCommand }) {
  if (!isOpen) return null;

  const { activeModuleKey } = usePlan();
  const { user, updateKeys, authFetch } = useAuth();

  // Clave de persistencia por proyecto
  const projectName = planData?.semilla?.nombre_proyecto || planData?.id || 'default_project';
  const storageKey = `bob_chat_history_${projectName.replace(/\s+/g, '_').toLowerCase()}`;

  const defaultWelcomeMessage = {
    id: 'welcome',
    sender: 'bob',
    text: '¡Hola! Soy BOB, tu copiloto ejecutivo en CELIS ENGINE. Las consultas de nube usan exclusivamente la API cifrada de tu cuenta; en cada respuesta verás el proveedor y modelo que contestaron.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    toolsExecuted: []
  };

  // Inicializar mensajes desde localStorage si existen
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[BobChat] Error cargando historial de chat:', e);
    }
    return [defaultWelcomeMessage];
  });

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [apiProvider, setApiProvider] = useState('ollamaCloud');
  const [apiSecret, setApiSecret] = useState('');
  const [apiSetupState, setApiSetupState] = useState({ state: 'idle', message: '' });
  const voiceEngineRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Guardar mensajes en localStorage cada vez que cambien
  useEffect(() => {
    try {
      if (messages && messages.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      }
    } catch (e) {
      console.warn('[BobChat] Error guardando historial:', e);
    }
  }, [messages, storageKey]);

  // Recargar historial si cambia de proyecto
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {}
    setMessages([defaultWelcomeMessage]);
  }, [storageKey]);

  useEffect(() => {
    voiceEngineRef.current = new CelisVoiceEngine({
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onResult: ({ transcript }) => {
        if (transcript) {
          setInputText(transcript);
          handleSend(transcript);
        }
      },
      onError: (err) => {
        console.warn('Error de voz:', err);
        setIsListening(false);
      }
    });

    return () => {
      voiceEngineRef.current?.stopListening();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (isListening) {
      voiceEngineRef.current?.stopListening();
    } else {
      const groqKey = planData?.config?.ai?.groqKey;
      voiceEngineRef.current?.startListening(groqKey);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('¿Deseas reiniciar la conversación con BOB? Se limpiará el historial de este proyecto.')) {
      try {
        localStorage.removeItem(storageKey);
      } catch {}
      setMessages([{
        ...defaultWelcomeMessage,
        id: `welcome_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const saveAndTestApiKey = async (event) => {
    event.preventDefault();
    if (!apiSecret.trim()) return;
    setApiSetupState({ state: 'loading', message: 'Guardando cifrada y verificando…' });
    const saved = await updateKeys({ [apiProvider]: apiSecret.trim() });
    setApiSecret(''); // se elimina inmediatamente de memoria visual y nunca entra al chat
    if (!saved.success) {
      setApiSetupState({ state: 'error', message: saved.error || 'No se pudo guardar la clave.' });
      return;
    }
    try {
      const response = await authFetch(`${getApiBase()}/api/auth/me/keys/${apiProvider}/test`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'La clave no pasó la verificación.');
      setApiSetupState({ state: 'success', message: `${API_GUIDES[apiProvider].label} quedó conectado a BOB.` });
    } catch (error) {
      setApiSetupState({ state: 'error', message: `La clave se guardó, pero no pudo verificarse: ${error.message}` });
    }
  };

  // Handler de ejecución de herramientas MCP
  const handleToolExecution = async (toolName, params) => {
    console.log('[BobChat] Ejecutando herramienta MCP:', toolName, params);

    if (toolName === 'navigate_to_module') {
      const mod = params.moduleKey;
      if (onExecuteCommand) {
        onExecuteCommand({ action: 'NAVIGATE', module: mod });
      } else {
        window.dispatchEvent(new CustomEvent('openplan_navigate', { detail: `/modulo/${mod}` }));
      }
      return `Navegación realizada al módulo: ${mod}`;
    }

    if (toolName === 'update_plan_field') {
      if (onExecuteCommand) {
        onExecuteCommand({
          action: 'UPDATE_FIELD',
          moduleKey: params.moduleKey,
          fieldKey: params.fieldKey,
          value: params.value
        });
      }
      return `Campo ${params.fieldKey} actualizado en ${params.moduleKey}`;
    }

    if (toolName === 'trigger_expert_panel') {
      if (onExecuteCommand) {
        onExecuteCommand({
          action: 'TRIGGER_EXPERT_PANEL',
          moduleKey: params.moduleKey,
          depth: params.depth || 2
        });
      }
      return `Mesa de Expertos disparada para el módulo: ${params.moduleKey}`;
    }

    if (toolName === 'configure_multibranch_expansion') {
      if (onExecuteCommand) {
        onExecuteCommand({
          action: 'CONFIGURE_MULTIBRANCH',
          tool: 'configure_multibranch_expansion',
          parameters: params
        });
      }
      return `Red multi-sucursal configurada: Hub en ${params.hubCity} con ${params.branches?.length || 0} sucursales (${params.rolloutStrategy})`;
    }

    if (toolName === 'analyze_liquidation_runway') {
      if (onExecuteCommand) {
        onExecuteCommand({
          action: 'ANALYZE_LIQUIDATION',
          tool: 'analyze_liquidation_runway',
          parameters: params
        });
      }
      return `Análisis de FRLI y contingencia ejecutado: Cálculo de pasivo laboral LFT y semáforo de crisis activado.`;
    }

    if (toolName === 'trigger_industrialization') {
      if (onExecuteCommand) {
        onExecuteCommand({
          action: 'TRIGGER_INDUSTRIALIZE',
          tool: 'trigger_industrialization',
          parameters: params
        });
      }
      return `Industrialización global de módulos disparada automáticamente con el motor agéntico.`;
    }

    return null;
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    setInputText('');
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 1. Detección rápida de comando local de inversión
      const lower = query.toLowerCase();
      if (lower.includes('inversión') || lower.includes('capex')) {
        const match = query.match(/(?:inversi[oó]n|capex|capital).*?(\d[\d,.]*)/i);
        if (match && onExecuteCommand) {
          const amount = parseFloat(match[1].replace(/,/g, ''));
          onExecuteCommand({ action: 'UPDATE_CAPEX', amount });
          setMessages(prev => [...prev, {
            id: `bob_${Date.now()}`,
            sender: 'bob',
            text: `He detectado tu indicación. Se actualizó la inversión inicial estimada a $${amount.toLocaleString()} MXN.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            toolsExecuted: ['update_capex']
          }]);
          setIsLoading(false);
          return;
        }
      }

      // 2. Ejecución a través del motor de agente BOB MCP
      const result = await sendBobMessage({
        userMessage: query,
        history: messages,
        planData,
        currentModule: activeModuleKey || 'semilla',
        onToolExecute: handleToolExecution
      });

      const bobMsg = {
        id: `bob_${Date.now()}`,
        sender: 'bob',
        text: result.cleanText || result.reply || 'Análisis completado.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolsExecuted: (result.toolCalls || []).map(t => t.tool),
        provider: result.provider,
        model: result.model
      };
      setMessages(prev => [...prev, bobMsg]);

    } catch (err) {
      console.error('Error al consultar a BOB:', err);
      const friendlyError = err?.message && !err.message.includes('fetch')
        ? `Lo siento: ${err.message}`
        : 'Lo siento, ocurrió un error de conexión con el motor cognitivo. Por favor verifica que tu API key de Ollama Cloud esté activa en Configuración o en tu perfil.';
      setMessages(prev => [...prev, {
        id: `bob_err_${Date.now()}`,
        sender: 'bob',
        text: friendlyError,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolsExecuted: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: '🔑 Configurar API', action: () => setShowApiSetup(true) },
    { label: '🛡️ Reserva Cierre (FRLI)', prompt: '¿Cuál es mi Fondo de Reserva de Liquidación Intocable (FRLI) recomendado y cuándo debo activar el protocolo de cierre si hay pérdidas?' },
    { label: '🎯 Grill-Me', prompt: '/grill-me Entrevístame para completar la propuesta de valor y modelo de ingresos' },
    { label: '🏢 Multi-Sucursales', prompt: 'Queremos expandir el proyecto abriendo sucursales en varias ciudades. ¿Qué opciones de despliegue y estructura cuántica me recomiendas?' },
    { label: '⚛️ Diagnóstico Cuántico', prompt: 'Evalúa el balance atómico del fundador en las 3 áreas: Finanzas, Operativo, Administrativo' },
    { label: '📊 Ver Finanzas', prompt: 'Llévanos al módulo de finanzas y dime qué métricas clave necesitamos' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',
      right: '24px',
      width: '420px',
      height: '580px',
      background: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3)',
      border: '1px solid rgba(99, 102, 241, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9990,
      overflow: 'hidden',
      animation: 'slideUp 0.25s ease-out'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        padding: '1rem 1.25rem',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>BOB · CELIS Engine</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>Historial Activo</span>
              <span style={{ background: 'rgba(255,255,255,0.25)', padding: '1px 6px', borderRadius: '6px', fontSize: '0.55rem', fontWeight: 800 }}>API personal</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={handleClearHistory}
            title="Reiniciar conversación y limpiar historial"
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={onClose}
            title="Cerrar ventana (el historial se conservará)"
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div style={{ padding: '0.5rem 0.75rem', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.4rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {quickActions.map((qa, i) => (
          <button
            key={i}
            onClick={() => qa.action ? qa.action() : handleSend(qa.prompt)}
            disabled={isLoading}
            style={{
              padding: '3px 8px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {qa.label}
          </button>
        ))}
      </div>

      {showApiSetup && (
        <form onSubmit={saveAndTestApiKey} style={{ padding: '0.75rem', background: '#eef2ff', borderBottom: '1px solid #c7d2fe', color: '#1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center', marginBottom: '0.55rem' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}><ShieldCheck size={15} color="#4f46e5" /> Conexión segura de BOB</strong>
            <button type="button" onClick={() => { setShowApiSetup(false); setApiSecret(''); }} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}><X size={15} /></button>
          </div>
          <select value={apiProvider} onChange={e => { setApiProvider(e.target.value); setApiSetupState({ state: 'idle', message: '' }); }} style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.45rem' }}>
            {Object.entries(API_GUIDES).map(([key, guide]) => <option key={key} value={key}>{guide.label}{user?.apiKeys?.[key]?.configured ? ' ✓ configurada' : ''}</option>)}
          </select>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '0.4rem' }}>{API_GUIDES[apiProvider].steps} <a href={API_GUIDES[apiProvider].url} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', fontWeight: 700 }}>Abrir manual <ExternalLink size={10} style={{ verticalAlign: 'middle' }} /></a></div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <input type="password" autoComplete="new-password" value={apiSecret} onChange={e => setApiSecret(e.target.value)} placeholder="Pega aquí la clave; no se enviará como mensaje" style={{ flex: 1, minWidth: 0, padding: '0.48rem 0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.72rem' }} />
            <button type="submit" disabled={!apiSecret.trim() || apiSetupState.state === 'loading'} style={{ border: 0, borderRadius: '8px', padding: '0 0.7rem', background: '#4f46e5', color: 'white', fontWeight: 700, cursor: 'pointer' }}><Key size={14} /></button>
          </div>
          <div style={{ fontSize: '0.64rem', marginTop: '0.4rem', color: apiSetupState.state === 'error' ? '#dc2626' : apiSetupState.state === 'success' ? '#059669' : '#64748b' }}>
            {apiSetupState.message || 'Se almacena cifrada en tu cuenta. BOB sólo recibe permiso para usarla.'}
          </div>
        </form>
      )}

      {/* Messages Feed */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc' }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
              background: msg.sender === 'user' ? '#4f46e5' : '#ffffff',
              color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
              padding: '0.75rem 1rem',
              borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              fontSize: '0.82rem',
              lineHeight: 1.45,
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0'
            }}
          >
            {msg.toolsExecuted && msg.toolsExecuted.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                {msg.toolsExecuted.map((t, ti) => (
                  <span key={ti} style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: '6px', background: 'rgba(16,185,129,0.15)', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Zap size={10} /> Herramienta MCP: {t}
                  </span>
                ))}
              </div>
            )}
            {msg.sender === 'bob' && msg.provider && (
              <div style={{ fontSize: '0.6rem', marginBottom: '5px', color: '#4f46e5', fontWeight: 700 }}>
                🔐 {msg.provider} · {msg.model || 'modelo confirmado por el proveedor'}
              </div>
            )}
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
            <div style={{ fontSize: '0.6rem', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
              {msg.timestamp}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', background: '#ffffff', padding: '0.6rem 1rem', borderRadius: '16px', fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e2e8f0' }}>
            <RefreshCw size={14} className="animate-spin" />
            <span>BOB ejecutando análisis...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div style={{ padding: '0.75rem', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={toggleListening}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isListening ? '#ef4444' : 'rgba(99, 102, 241, 0.1)',
            color: isListening ? '#ffffff' : '#4f46e5',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s'
          }}
          title={isListening ? "Escuchando... clic para detener" : "Hablar por micrófono (CELIS Voice Engine)"}
        >
          {isListening ? <MicOff size={18} className="animate-pulse" /> : <Mic size={18} />}
        </button>

        <input
          type="text"
          placeholder={isListening ? "Escuchando tu voz..." : "Pregunta, pide ir a una sección o /grill-me..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            borderRadius: '20px',
            border: '1px solid #cbd5e1',
            fontSize: '0.8rem',
            outline: 'none'
          }}
        />

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isLoading}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
