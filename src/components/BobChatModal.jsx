import { useState, useEffect, useRef } from 'react';
import { Bot, Mic, MicOff, Send, X, Sparkles, MessageSquare, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { CelisVoiceEngine } from '../lib/voiceEngine';
import { callAiProvider } from '../lib/ai';

export default function BobChatModal({ isOpen, onClose, planData, onExecuteCommand }) {
  if (!isOpen) return null;

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bob',
      text: '¡Hola! Soy BOB, tu copiloto de negocios en CELIS ENGINE. Puedes dictarme comandos por voz ("Ajusta la inversión inicial a 500 mil") o preguntarme sobre cualquier sección del plan.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
      // 1. Intentar resolver como comando directo si aplica
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
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          setIsLoading(false);
          return;
        }
      }

      // 2. Consulta de IA conversacional con el contexto del plan
      const rawAi = planData?.config?.ai || {};
      const aiConfig = {
        provider: rawAi.primaryProvider || rawAi.provider || (rawAi.nvidiaKey ? 'nvidia' : rawAi.mistralKey ? 'mistral' : rawAi.apiKey ? 'gemini' : 'groq'),
        model: rawAi.model || 'meta/llama-3.1-70b-instruct',
        apiKey: rawAi.mistralKey || rawAi.apiKey,
        nvidiaKey: rawAi.nvidiaKey,
        groqKey: rawAi.groqKey,
        endpoint: rawAi.endpoint
      };
      
      const systemPrompt = `Eres BOB, el asistente de negocios ejecutivo de CELIS ENGINE para el proyecto "${planData?.config?.brandKit?.companyName || 'Plan de Negocios'}".
Responde en español de forma concisa, profesional y directa en 2-3 párrafos máximo.`;

      const response = await callAiProvider(aiConfig, `${systemPrompt}\n\nPregunta del usuario: "${query}"`, false);
      
      setMessages(prev => [...prev, {
        id: `bob_${Date.now()}`,
        sender: 'bob',
        text: typeof response === 'string' ? response : JSON.stringify(response),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `bob_${Date.now()}`,
        sender: 'bob',
        text: `Lo siento, ocurrió un detalle al procesar la consulta: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',
      right: '24px',
      width: '380px',
      height: '520px',
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
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>BOB · CELIS Engine</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.85 }}>Copiloto por Voz e IA</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Feed */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc' }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: msg.sender === 'user' ? '#4f46e5' : '#ffffff',
              color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
              padding: '0.75rem 1rem',
              borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              fontSize: '0.82rem',
              lineHeight: 1.4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0'
            }}
          >
            {msg.text}
            <div style={{ fontSize: '0.6rem', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
              {msg.timestamp}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', background: '#ffffff', padding: '0.6rem 1rem', borderRadius: '16px', fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e2e8f0' }}>
            <RefreshCw size={14} className="animate-spin" />
            <span>BOB está pensando...</span>
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
          placeholder={isListening ? "Escuchando tu voz..." : "Escribe un comando o duda..."}
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
