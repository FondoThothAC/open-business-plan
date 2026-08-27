import { useState, useEffect, useRef } from 'react';
import { Bot, Mic, MicOff, Send, X, Sparkles, MessageSquare, ArrowRight, Zap, RefreshCw, Compass, CheckCircle, HelpCircle } from 'lucide-react';
import { CelisVoiceEngine } from '../lib/voiceEngine';
import { sendBobMessage } from '../lib/bobAgent';
import { usePlan } from '../context/PlanContext';

export default function BobChatModal({ isOpen, onClose, planData, onExecuteCommand }) {
  if (!isOpen) return null;

  const { navigateToModule, activeModuleKey } = usePlan();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bob',
      text: '¡Hola! Soy BOB, tu copiloto ejecutivo en CELIS ENGINE (minimax-m3:cloud). Puedo responder dudas, navegar entre secciones, auditar el equilibrio cuántico del fundador o entrevistarte con /grill-me para completar el plan.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolsExecuted: []
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const voiceEngineRef = useRef(null);
  const messagesEndRef = useRef(null);

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

  // Handler de ejecución de herramientas MCP
  const handleToolExecution = async (toolName, params) => {
    console.log('[BobChat] Ejecutando herramienta MCP:', toolName, params);

    if (toolName === 'navigate_to_module') {
      const mod = params.moduleKey;
      if (typeof navigateToModule === 'function') {
        navigateToModule(mod);
      } else if (onExecuteCommand) {
        onExecuteCommand({ action: 'NAVIGATE', module: mod });
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
        const match = query.match(/(?:inversi[oó]n|capex|capital).*?(\d[\d,\.]*)/i);
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

      setMessages(prev => [...prev, {
        id: `bob_${Date.now()}`,
        sender: 'bob',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolsExecuted: (result.toolCalls || []).map(t => t.tool)
      }]);
    } catch (err) {
      console.error('[BobChatModal] Error:', err);
      setMessages(prev => [...prev, {
        id: `bob_${Date.now()}`,
        sender: 'bob',
        text: `⚠️ ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolsExecuted: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: '🎯 Grill-Me', prompt: '/grill-me Entrevístame para completar la propuesta de valor y modelo de ingresos' },
    { label: '🏢 Multi-Sucursales', prompt: 'Queremos expandir el proyecto abriendo sucursales en varias ciudades. ¿Qué opciones de despliegue y estructura cuántica me recomiendas?' },
    { label: '⚛️ Diagnóstico Cuántico', prompt: 'Evalúa el balance atómico del fundador en las 3 áreas: Finanzas, Operativo, Administrativo' },
    { label: '📊 Ver Finanzas', prompt: 'Llévanos al módulo de finanzas y dime qué métricas clave necesitamos' },
    { label: '🔍 Auditoría General', prompt: 'Revisa qué secciones tienen menos información y cuál es el siguiente paso prioritario' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',
      right: '24px',
      width: '400px',
      height: '560px',
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
              <span>Copiloto MCP</span>
              <span style={{ background: 'rgba(255,255,255,0.25)', padding: '1px 6px', borderRadius: '6px', fontSize: '0.55rem', fontWeight: 800 }}>minimax-m3:cloud</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Quick Action Chips */}
      <div style={{ padding: '0.5rem 0.75rem', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.4rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {quickActions.map((qa, i) => (
          <button
            key={i}
            onClick={() => handleSend(qa.prompt)}
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
