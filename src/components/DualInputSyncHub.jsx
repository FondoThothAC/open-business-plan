/**
 * DualInputSyncHub.jsx — Centro de Entrada Dual y Sincronización Swarm en Tiempo Real
 * 
 * Permite al usuario interactuar mediante Onboarding Express (60s), Chat Conversacional con la Mesa
 * de Expertos (Swarm), o el Wizard Estructurado Paso a Paso, manteniendo sincronizado el estado
 * de la Semilla y del plan en tiempo real.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, MessageSquare, ListChecks, Zap, Bot, Send, 
  CheckCircle2, ArrowRight, User, DollarSign, Wrench, Megaphone, 
  ShieldAlert, Mic, Upload, RefreshCw, Cpu
} from 'lucide-react';
import { usePlan } from '../context/PlanContext';

export default function DualInputSyncHub({ onCompleteSeed, onSwitchToStudio }) {
  const { planData, updateField } = usePlan();

  // Modos de Vista: 'express' | 'chat' | 'wizard'
  const [activeMode, setActiveMode] = useState('express');
  
  // Estado local sincronizado con planData.semilla
  const semilla = planData?.semilla || {};

  // Estado del Chat Swarm
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'Coordinador Swarm',
      role: 'coordinator',
      avatar: '🤖',
      text: '¡Hola! Soy el Coordinador de la Mesa de Expertos de Fondo Thoth AC. Puedes describir tu idea libremente aquí, usar el Wizard por pasos o el Onboarding Express de 60 segundos. Todo se sincroniza automáticamente.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const chatEndRef = useRef(null);

  // Estado del Onboarding Express
  const [expressForm, setExpressForm] = useState({
    nombre_emprendedor: semilla.nombre_emprendedor || '',
    nombre_marca: semilla.nombre_marca || '',
    que_es: semilla.que_es || '',
    inversion_total: semilla.inversion_total || '',
    cliente_ubicacion: semilla.cliente_ubicacion || ''
  });

  // Estado del Wizard Paso a Paso
  const [wizardStep, setWizardStep] = useState(0);

  // Estados visuales de la Mesa de Expertos (Swarm)
  const swarmAgents = [
    { id: 'cfo', name: 'CFO Financiero', icon: DollarSign, color: '#10b981', status: 'Listo para evaluar CAPEX y VAN' },
    { id: 'coo', name: 'COO de Operaciones', icon: Wrench, color: '#3b82f6', status: 'Mapeando procesos e insumos' },
    { id: 'cmo', name: 'Estratega de Mercado', icon: Megaphone, color: '#f59e0b', status: 'Analizando competencia y TAM/SAM' },
    { id: 'risk', name: 'Oficial de Riesgo', icon: ShieldAlert, color: '#ef4444', status: 'Vigilando viabilidad y PESTEL' }
  ];

  // Auto-scroll en el chat
  useEffect(() => {
    if (activeMode === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeMode]);

  // Actualizar sincronización con el contexto global
  const handleSyncField = (key, value) => {
    updateField('semilla', key, value);
    setExpressForm(prev => ({ ...prev, [key]: value }));
  };

  // Enviar mensaje en el Chat Swarm
  const handleSendMessage = () => {
    if (!inputMessage.trim() || isAiResponding) return;

    const userText = inputMessage.trim();
    const newMsg = {
      id: `user-${Date.now()}`,
      sender: 'Tú (Fundador)',
      role: 'user',
      avatar: '👤',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setInputMessage('');
    setIsAiResponding(true);

    // Detección heurística de datos clave para auto-llenado inteligente
    setTimeout(() => {
      let agentReply = '';
      let agentName = 'Estratega de Mercado';
      let agentRole = 'cmo';
      let agentAvatar = '📊';

      if (userText.toLowerCase().includes('inversión') || userText.toLowerCase().includes('$') || userText.toLowerCase().includes('peso') || userText.toLowerCase().includes('costo')) {
        agentName = 'CFO Financiero';
        agentRole = 'cfo';
        agentAvatar = '⚡';
        agentReply = `He detectado variables financieras en tu mensaje. Estoy sincronizando el módulo de inversión y preparando la corrida de flujo de caja con tasas actualizadas.`;
        handleSyncField('inversion_total', userText);
      } else if (userText.toLowerCase().includes('proceso') || userText.toLowerCase().includes('maquinaria') || userText.toLowerCase().includes('equipo') || userText.toLowerCase().includes('planta')) {
        agentName = 'COO de Operaciones';
        agentRole = 'coo';
        agentAvatar = '⚙️';
        agentReply = `Entendido. Mapeando requerimientos técnicos, capacidad de producción y posibles necesidades de cotización de maquinaria especializada (RFQ).`;
        handleSyncField('producto_servicio', userText);
      } else {
        agentReply = `Excelente punto. He integrado esta definición en el núcleo de la Semilla para alimentar las 12 metodologías del plan.`;
        if (!semilla.que_es) {
          handleSyncField('que_es', userText);
        }
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: agentName,
          role: agentRole,
          avatar: agentAvatar,
          text: agentReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsAiResponding(false);
    }, 900);
  };

  // Finalizar Express Onboarding y pasar al plan
  const handleFinishExpress = () => {
    Object.entries(expressForm).forEach(([k, v]) => {
      updateField('semilla', k, v);
    });
    if (onCompleteSeed) onCompleteSeed();
    if (onSwitchToStudio) onSwitchToStudio();
  };

  return (
    <div style={{
      borderRadius: '20px',
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '1.5rem',
      color: '#f8fafc',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
      marginBottom: '2rem'
    }}>
      {/* Selector de Modo Superior */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-flex',
              padding: '0.4rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#fff'
            }}>
              <Sparkles size={18} />
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Centro de Entrada Ágil & Swarm Multimodal
            </h2>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '20px',
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              v3.1 Sincronizado
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Elige la forma más cómoda de ingresar tu proyecto. Todo se sincroniza bidireccionalmente.
          </p>
        </div>

        {/* Pestañas de Modo */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={() => setActiveMode('express')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
              transition: 'all 0.2s',
              background: activeMode === 'express' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
              color: activeMode === 'express' ? '#fff' : '#94a3b8'
            }}
          >
            <Zap size={14} /> Express 60s
          </button>
          
          <button
            onClick={() => setActiveMode('chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
              transition: 'all 0.2s',
              background: activeMode === 'chat' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
              color: activeMode === 'chat' ? '#fff' : '#94a3b8'
            }}
          >
            <MessageSquare size={14} /> Chat Swarm
          </button>

          <button
            onClick={() => setActiveMode('wizard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
              transition: 'all 0.2s',
              background: activeMode === 'wizard' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: activeMode === 'wizard' ? '#fff' : '#94a3b8'
            }}
          >
            <ListChecks size={14} /> Wizard Detallado
          </button>
        </div>
      </div>

      {/* Grid Principal: Contenido del Modo + Monitor Lateral de Agentes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '1.5rem' }}>
        
        {/* LADO IZQUIERDO: Modo Activo */}
        <div>
          {/* MODO 1: ONBOARDING EXPRESS (60 SEGUNDOS) */}
          {activeMode === 'express' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '0.85rem',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                fontSize: '0.8rem',
                color: '#fcd34d'
              }}>
                ⚡ <strong>Onboarding Express:</strong> Responde solo 4 datos esenciales. La Mesa de Expertos completará el resto y podrás refinarlo en cualquier momento.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Tu Nombre o Empresa:
                  </label>
                  <input
                    type="text"
                    value={expressForm.nombre_emprendedor}
                    onChange={(e) => handleSyncField('nombre_emprendedor', e.target.value)}
                    placeholder="Ej. Roberto Celis / CCI Minería"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Nombre de la Marca / Proyecto:
                  </label>
                  <input
                    type="text"
                    value={expressForm.nombre_marca}
                    onChange={(e) => handleSyncField('nombre_marca', e.target.value)}
                    placeholder="Ej. Taller Mecanizado Avanzado"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  ¿Qué es tu negocio y qué problema resuelve? (En una o dos oraciones):
                </label>
                <textarea
                  rows={3}
                  value={expressForm.que_es}
                  onChange={(e) => handleSyncField('que_es', e.target.value)}
                  placeholder="Ej. Servicios de manufactura, maquinado CNC y rectificado de cilindros hidráulicos para la industria minera en el noroeste de México."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Inversión Inicial Estimada:
                  </label>
                  <input
                    type="text"
                    value={expressForm.inversion_total}
                    onChange={(e) => handleSyncField('inversion_total', e.target.value)}
                    placeholder="Ej. $20,000,000 MXN"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Ubicación / Ciudad Sede:
                  </label>
                  <input
                    type="text"
                    value={expressForm.cliente_ubicacion}
                    onChange={(e) => handleSyncField('cliente_ubicacion', e.target.value)}
                    placeholder="Ej. Hermosillo, Sonora"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  onClick={handleFinishExpress}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <CheckCircle2 size={16} /> Confirmar Semilla y Entrar al Studio
                </button>
              </div>
            </div>
          )}

          {/* MODO 2: CHAT SWARM INTERACTIVO */}
          {activeMode === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '360px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
              {/* Feed de Mensajes */}
              <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {chatMessages.map(msg => (
                  <div 
                    key={msg.id}
                    style={{
                      display: 'flex',
                      gap: '0.65rem',
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%'
                    }}
                  >
                    {msg.role !== 'user' && (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.2)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        flexShrink: 0
                      }}>
                        {msg.avatar}
                      </div>
                    )}
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      background: msg.role === 'user' ? 'linear-gradient(135deg, #4f46e5, #4338ca)' : 'rgba(30, 41, 59, 0.8)',
                      border: msg.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#f8fafc',
                      fontSize: '0.8rem',
                      lineHeight: '1.4'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px', fontSize: '0.68rem', color: msg.role === 'user' ? '#c7d2fe' : '#94a3b8', fontWeight: 600 }}>
                        <span>{msg.sender}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div>{msg.text}</div>
                    </div>
                  </div>
                ))}
                {isAiResponding && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8', fontSize: '0.75rem', paddingLeft: '40px' }}>
                    <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>La Mesa de Expertos está procesando y sincronizando campos...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Bar del Chat */}
              <div style={{ padding: '0.65rem 0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(15, 23, 42, 0.7)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Escribe detalles de tu idea (ej. 'Requerimos 2 tornos CNC Haas y 5 operadores en Hermosillo')..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '0.8rem'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isAiResponding}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    border: 'none',
                    color: '#fff',
                    cursor: inputMessage.trim() && !isAiResponding ? 'pointer' : 'not-allowed',
                    opacity: inputMessage.trim() && !isAiResponding ? 1 : 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 700,
                    fontSize: '0.8rem'
                  }}
                >
                  <Send size={14} /> Enviar
                </button>
              </div>
            </div>
          )}

          {/* MODO 3: WIZARD DETALLADO */}
          {activeMode === 'wizard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
                <span>Paso {wizardStep + 1} de 4: {wizardStep === 0 ? 'Fundador' : wizardStep === 1 ? 'Modelo' : wizardStep === 2 ? 'Mercado' : 'Finanzas'}</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>{((wizardStep + 1) / 4 * 100)}% Completado</span>
              </div>

              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${((wizardStep + 1) / 4 * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)', transition: 'width 0.3s' }} />
              </div>

              {wizardStep === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>¿Cuál es tu experiencia profesional y perfil técnico?</label>
                    <textarea
                      rows={3}
                      value={semilla.experiencia || ''}
                      onChange={(e) => handleSyncField('experiencia', e.target.value)}
                      placeholder="Ej. 15 años como Jefe de Taller y Mecanizado en proyectos mineros de Grupo México."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              )}

              {wizardStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Propuesta de Valor y Ventaja Competitiva:</label>
                    <textarea
                      rows={3}
                      value={semilla.diferenciador || ''}
                      onChange={(e) => handleSyncField('diferenciador', e.target.value)}
                      placeholder="Ej. Tiempos de entrega de 48 horas con telemetría IoT y certificación ISO 9001."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Perfil del Cliente Objetivo / Nicho:</label>
                    <textarea
                      rows={3}
                      value={semilla.cliente_dolor || ''}
                      onChange={(e) => handleSyncField('cliente_dolor', e.target.value)}
                      placeholder="Ej. Minas y contratistas que sufren por retrasos de 3 semanas en importación de repuestos de USA."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Estructura de Capital y Fuentes de Financiamiento:</label>
                    <textarea
                      rows={3}
                      value={semilla.fuentes_capital || ''}
                      onChange={(e) => handleSyncField('fuentes_capital', e.target.value)}
                      placeholder="Ej. $8M capital propio + $12M crédito de habilitación de Bancomext/Nafin."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button
                  disabled={wizardStep === 0}
                  onClick={() => setWizardStep(prev => Math.max(0, prev - 1))}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    color: '#cbd5e1',
                    cursor: wizardStep === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '0.78rem'
                  }}
                >
                  Anterior
                </button>

                {wizardStep < 3 ? (
                  <button
                    onClick={() => setWizardStep(prev => Math.min(3, prev + 1))}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.78rem'
                    }}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={handleFinishExpress}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.78rem'
                    }}
                  >
                    Completar y Entrar al Studio
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* LADO DERECHO: MONITOR DE AGENTES SWARM EN VIVO */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
            <Cpu size={16} color="#818cf8" />
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, margin: 0 }}>Mesa Swarm Activa</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {swarmAgents.map(ag => {
              const Icon = ag.icon;
              return (
                <div 
                  key={ag.id}
                  style={{
                    padding: '0.65rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ padding: '4px', borderRadius: '6px', background: `${ag.color}22`, color: ag.color }}>
                        <Icon size={13} />
                      </span>
                      <strong style={{ fontSize: '0.75rem', color: '#f1f5f9' }}>{ag.name}</strong>
                    </div>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: ag.color,
                      boxShadow: `0 0 8px ${ag.color}`
                    }} />
                  </div>
                  <p style={{ fontSize: '0.66rem', color: '#94a3b8', margin: 0, lineHeight: '1.25' }}>
                    {ag.status}
                  </p>
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: 'auto',
            padding: '0.6rem',
            borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            fontSize: '0.68rem',
            color: '#a5b4fc',
            textAlign: 'center'
          }}>
            Consenso activo en tiempo real
          </div>
        </div>

      </div>
    </div>
  );
}
