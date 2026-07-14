import React, { useState, useEffect, useRef } from 'react';
import { usePlan } from '../context/PlanContext';
import { FRAMEWORKS } from '../config/frameworks';
import { extractSeedFromText, askFieldDoubt } from '../lib/ai';
import { Mic, MicOff, BrainCircuit, CheckCircle, ChevronRight, Loader2, MessageSquare, AlertCircle, ArrowRight } from 'lucide-react';

export default function Anteproyecto() {
  const { planData, updateSemilla, updateConfig } = usePlan();
  
  // Si la semilla ya tiene datos cargados en el plan, mostramos directamente el paso de revisión (3)
  const [step, setStep] = useState(() => {
    if (planData?.semilla && Object.keys(planData.semilla).some(k => planData.semilla[k] && String(planData.semilla[k]).trim().length > 3)) {
      return 3;
    }
    return 1;
  });
  
  const [rawText, setRawText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  
  // Asistencia IA
  const [activeDoubtField, setActiveDoubtField] = useState(null);
  const [doubtText, setDoubtText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Inicializar Web Speech API
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-MX';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setRawText(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== 'no-speech') {
          setIsRecording(false);
          setError(`Error de micrófono: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        // Reiniciar si sigue grabando (continuous sometimes stops)
        if (isRecording && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      };
    } else {
      setError("Tu navegador no soporta el reconocimiento de voz. Por favor escribe tu idea.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Reconocimiento de voz no soportado en este navegador.");
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setRawText(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' '));
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setError('');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const processText = async () => {
    if (!rawText.trim() || rawText.length < 20) {
      setError("Por favor cuéntanos un poco más sobre tu idea (mínimo 20 caracteres).");
      return;
    }
    
    setStep(2);
    setError('');
    
    try {
      const seedData = await extractSeedFromText(planData.config.ai, rawText);
      // Guardar en el contexto global
      updateSemilla('nombre_proyecto', seedData.nombre_proyecto || '');
      updateSemilla('cobertura', seedData.cobertura || '');
      updateSemilla('problema', seedData.problema || '');
      updateSemilla('solucion', seedData.solucion || '');
      updateSemilla('mercado_objetivo', seedData.mercado_objetivo || '');
      updateSemilla('modelo_ingresos', seedData.modelo_ingresos || '');
      updateSemilla('ventaja_injusta', seedData.ventaja_injusta || '');
      setStep(3);
    } catch (err) {
      setError(err.message);
      setStep(1);
    }
  };

  const askAi = async (fieldName) => {
    if (!doubtText.trim()) return;
    setIsAsking(true);
    setAiResponse('');
    
    try {
      const response = await askFieldDoubt(planData.config.ai, fieldName, doubtText, planData.semilla);
      setAiResponse(response);
    } catch (e) {
      setAiResponse("Hubo un error al consultar a la IA. Intenta nuevamente.");
    } finally {
      setIsAsking(false);
    }
  };

  const SEED_FIELDS = [
    { id: 'nombre_proyecto', label: 'Nombre del Proyecto', desc: '¿Cómo se llama tu idea o negocio?' },
    { id: 'cobertura', label: 'Ubicación o Alcance Geográfico', desc: '¿Dónde operará físicamente (ej. Hermosillo, Sonora) o es un servicio digital / en la nube?' },
    { id: 'problema', label: 'El Problema', desc: '¿Qué problema, dolor o necesidad estás resolviendo?' },
    { id: 'solucion', label: 'La Solución', desc: '¿Cuál es tu producto o servicio y cómo resuelve el problema?' },
    { id: 'mercado_objetivo', label: 'Mercado Objetivo', desc: '¿Quiénes son tus clientes o usuarios? (Demografía, perfil)' },
    { id: 'modelo_ingresos', label: 'Modelo de Ingresos', desc: '¿Cómo planeas ganar dinero? (Suscripción, venta directa, freemium...)' },
    { id: 'ventaja_injusta', label: 'Ventaja Injusta', desc: '¿Qué tienes tú que no puede ser copiado o comprado fácilmente?' },
  ];

  return (
    <div className="module-container" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 2rem 6rem 2rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <BrainCircuit style={{ color: 'var(--accent-color)' }} size={36} />
          Anteproyecto (Semilla)
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Cuéntale tu idea a la IA y nosotros la estructuraremos por ti.
        </p>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            width: 40, height: 40, borderRadius: '50%',
            background: step >= i ? 'var(--accent-color)' : 'var(--bg-panel-hover)',
            color: step >= i ? 'white' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, border: step === i ? '2px solid white' : 'none',
            boxShadow: step === i ? '0 0 0 4px var(--accent-color)' : 'none',
            transition: 'all 0.3s'
          }}>
            {step > i ? <CheckCircle size={20} /> : i}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: 'var(--danger-color)', borderRadius: '8px', marginBottom: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* STEP 1: Brain Dump */}
      {step === 1 && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ 
            background: 'var(--bg-panel)', padding: '2rem', borderRadius: '16px', 
            border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Paso 1: Vaciado de Cerebro
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Usa el micrófono o escribe libremente. No te preocupes por el formato, la gramática o el orden. Simplemente cuéntanos: <strong>¿Qué quieres hacer?, ¿Para quién? y ¿Cómo vas a ganar dinero?</strong>
            </p>

            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <textarea
                className="form-control"
                style={{ 
                  height: '250px', fontSize: '1.1rem', lineHeight: '1.6', 
                  padding: '1.5rem', borderRadius: '12px', resize: 'vertical',
                  borderColor: isRecording ? 'var(--accent-color)' : 'var(--border-color)',
                  boxShadow: isRecording ? '0 0 0 4px rgba(99, 102, 241, 0.1)' : 'none'
                }}
                placeholder="Hola, mi idea es hacer una aplicación que..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
              
              <button
                onClick={toggleRecording}
                title={isRecording ? "Detener grabación" : "Iniciar dictado por voz"}
                style={{
                  position: 'absolute', bottom: '1.5rem', right: '1.5rem',
                  width: 50, height: 50, borderRadius: '50%',
                  background: isRecording ? 'var(--danger-color)' : 'var(--accent-color)',
                  color: 'white', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  animation: isRecording ? 'pulse 1.5s infinite' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-ia" 
                onClick={processText}
                disabled={rawText.length < 10 || isRecording}
                style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
              >
                <BrainCircuit size={20} /> Extraer Semilla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Processing */}
      {step === 2 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', animation: 'fadeIn 0.3s ease' }}>
          <Loader2 size={64} style={{ color: 'var(--accent-color)', animation: 'spin 1.5s linear infinite', margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Estructurando tu idea...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>La Mesa de Expertos está analizando tu proyecto para extraer los pilares fundamentales.</p>
        </div>
      )}

      {/* STEP 3: Review */}
      {step === 3 && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Paso 2: Revisa tu Semilla Universal</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Esta es la información que la IA extrajo. Modifica lo que creas necesario. 
              Si tienes dudas sobre qué poner en algún campo, ¡pídele ayuda a la IA!
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {SEED_FIELDS.map(field => (
              <div key={field.id} style={{ 
                background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: activeDoubtField === field.id ? '0 0 0 2px var(--accent-color)' : 'none',
                transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                      {field.label}
                    </label>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{field.desc}</span>
                  </div>
                  <button 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    onClick={() => {
                      setActiveDoubtField(activeDoubtField === field.id ? null : field.id);
                      setDoubtText('');
                      setAiResponse('');
                    }}
                  >
                    <MessageSquare size={14} /> Asistente IA
                  </button>
                </div>

                <textarea
                  className="form-control"
                  style={{ minHeight: '80px', marginTop: '1rem', resize: 'vertical' }}
                  value={planData.semilla[field.id] || ''}
                  onChange={(e) => updateSemilla(field.id, e.target.value)}
                />

                {/* AI Assistant per field */}
                {activeDoubtField === field.id && (
                  <div style={{ 
                    marginTop: '1rem', background: 'var(--bg-panel-hover)', 
                    padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--accent-color)' 
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Ej. No estoy seguro de la diferencia entre cliente y consumidor..."
                        value={doubtText}
                        onChange={(e) => setDoubtText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && askAi(field.label)}
                      />
                      <button 
                        className="btn btn-ia" 
                        onClick={() => askAi(field.label)}
                        disabled={isAsking || !doubtText.trim()}
                      >
                        {isAsking ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Preguntar'}
                      </button>
                    </div>
                    
                    {aiResponse && (
                      <div style={{ 
                        background: 'var(--bg-panel)', padding: '1rem', borderRadius: '8px',
                        fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <strong style={{ color: 'var(--accent-color)', display: 'block', marginBottom: '0.5rem' }}>Respuesta de IA:</strong>
                        {aiResponse}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--bg-panel-hover)', borderRadius: '12px', border: '1px dashed var(--accent-color)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>¡Semilla Lista!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Con esta información base, la IA podrá estructurar tu idea en cualquiera de los frameworks profesionales (Canvas, Lean, Y Combinator, etc).
            </p>
            <button 
              className="btn btn-ia" 
              style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '30px' }}
              onClick={() => setStep(4)}
            >
              Siguiente: Elegir Metodología <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Choose Framework */}
      {step === 4 && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Paso 3: Elige la Metodología</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Selecciona el marco de trabajo estratégico con el que quieres industrializar tu Semilla.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {Object.entries(FRAMEWORKS).map(([key, framework]) => (
              <button
                key={key}
                onClick={() => {
                  updateConfig('projectType', null, key);
                  
                  // Redireccionar al primer módulo de la metodología seleccionada
                  const firstPillar = framework.pillars?.[0];
                  const firstModule = firstPillar?.modules?.[0];
                  if (firstPillar && firstModule) {
                    window.location.href = `/modulo/${firstPillar.key}/${firstModule.key}`;
                  } else {
                    window.location.href = '/';
                  }
                }}
                style={{
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-color)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)' }}>{framework.name || key}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {framework.pillars?.length || 0} pilares académicos con {framework.pillars?.reduce((acc, p) => acc + (p.modules?.length || 0), 0) || 0} módulos especializados.
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
