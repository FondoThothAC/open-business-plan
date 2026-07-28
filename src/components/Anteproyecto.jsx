import React, { useState, useEffect, useRef } from 'react';
import { usePlan } from '../context/PlanContext';
import { FRAMEWORKS } from '../config/frameworks';
import { extractSeedFromText, askFieldDoubt } from '../lib/ai';
import { classifyProject } from '../lib/classifyProject';
import { matchIndustry } from '../lib/benchmarkMatcher';
import { evaluateQuantumProfile } from '../lib/quantumDiagnostic';
import QuantumProfileCard from './QuantumProfileCard';
import AdaptiveSeedForm from './AdaptiveSeedForm';
import { Mic, MicOff, BrainCircuit, CheckCircle, ChevronRight, Loader2, MessageSquare, AlertCircle, ArrowRight, Sparkles, Cpu, Building2, HelpCircle } from 'lucide-react';
import { PixelSwarmViewer } from './swarm/PixelSwarmViewer';
import { SwarmInterviewModal } from './swarm/SwarmInterviewModal';

export default function Anteproyecto() {
  const { planData, updateSemilla, updateConfig, setPlanData } = usePlan();

  // Si la semilla ya tiene datos cargados en el plan, mostramos el paso de revisión (3)
  const [step, setStep] = useState(() => {
    if (planData?.semilla && Object.keys(planData.semilla).some(k => planData.semilla[k] && String(planData.semilla[k]).trim().length > 3)) {
      return 3;
    }
    return 1;
  });

  const [rawText, setRawText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');

  // Estados de Inferencia, Benchmarks y Diagnóstico Cuántico
  const [frameworkInference, setFrameworkInference] = useState(null);
  const [benchmarkMatch, setBenchmarkMatch] = useState(null);
  const [quantumDiagnostic, setQuantumDiagnostic] = useState(null);

  // Asistencia IA por campo
  const [activeDoubtField, setActiveDoubtField] = useState(null);
  const [doubtText, setDoubtText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // Estados del Swarm Engine & Pixel Swarm Office
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [isSwarmRunning, setIsSwarmRunning] = useState(false);
  const [activeAgents, setActiveAgents] = useState([]);
  const [agentLogs, setAgentLogs] = useState([]);
  const [globalProgress, setGlobalProgress] = useState(0);

  const recognitionRef = useRef(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    // Inicializar Web Speech API si está disponible en el navegador
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
        if (isRecording && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) { }
        }
      };
    } else {
      setError("Tu navegador no soporta el reconocimiento de voz. Por favor escribe tu idea.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
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

  // Procesamiento Inteligente Adaptativo
  const processText = async () => {
    if (!rawText.trim() || rawText.length < 15) {
      setError("Por favor cuéntanos un poco más sobre tu idea (mínimo 15 caracteres).");
      return;
    }

    setStep(2);
    setError('');

    try {
      const aiConfig = planData?.config?.ai;

      // Ejecutar extracción, inferencia, match de industria y diagnóstico cuántico en paralelo
      const [seedData, inferenceRes, benchmarkRes] = await Promise.all([
        extractSeedFromText(aiConfig, rawText),
        classifyProject(aiConfig, rawText),
        matchIndustry(rawText, planData?.semilla, aiConfig)
      ]);

      // Evaluar perfil cuántico del fundador
      const quantumRes = await evaluateQuantumProfile(aiConfig, seedData, rawText);

      // Actualizar estado global del plan
      updateSemilla('nombre_proyecto', seedData.nombre_proyecto || '');
      updateSemilla('cobertura', seedData.cobertura || '');
      updateSemilla('problema', seedData.problema || '');
      updateSemilla('solucion', seedData.solucion || '');
      updateSemilla('mercado_objetivo', seedData.mercado_objetivo || '');
      updateSemilla('modelo_ingresos', seedData.modelo_ingresos || '');
      updateSemilla('ventaja_injusta', seedData.ventaja_injusta || '');

      setFrameworkInference(inferenceRes);
      setBenchmarkMatch(benchmarkRes);
      setQuantumDiagnostic(quantumRes);

      // Configurar el framework inferido como activo
      if (inferenceRes?.frameworkId && FRAMEWORKS[inferenceRes.frameworkId]) {
        updateConfig('projectType', null, inferenceRes.frameworkId);
      }

      setStep(3);
    } catch (err) {
      console.error("Error al procesar el anteproyecto:", err);
      setError(err.message || 'Error al analizar la idea.');
      setStep(1);
    }
  };

  // Actualizar un campo individual de la semilla
  const handleUpdateSeedField = (key, value) => {
    updateSemilla(key, value);
  };

  // Lanzar la industrialización con el Swarm Engine y SSE
  const handleLaunchSwarmSession = async ({ frameworkId, answers, ideaText }) => {
    setIsSwarmRunning(true);
    setGlobalProgress(10);
    setAgentLogs([{ agentId: 'system', message: 'Iniciando conexión con Swarm Engine...', timestamp: new Date().toISOString() }]);

    const sessionId = `swarm_${Date.now()}`;

    // Suscripción SSE a los eventos del enjambre
    const es = new EventSource(`http://localhost:3001/api/swarm/stream/${sessionId}`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'swarm_started') {
          setActiveAgents(data.agentsMeta ? data.agentsMeta.map(a => a.id) : []);
          setGlobalProgress(15);
        } else if (data.type === 'agent_progress') {
          setAgentLogs(prev => [...prev, { agentId: data.agentId, message: data.message, timestamp: data.timestamp }]);
          setGlobalProgress(prev => Math.min(prev + 10, 90));
        } else if (data.type === 'agent_completed') {
          setAgentLogs(prev => [...prev, { agentId: data.agentId, message: `✅ Tareas de ${data.name} completadas exitosamente.`, timestamp: new Date().toISOString() }]);
        } else if (data.type === 'swarm_completed') {
          setGlobalProgress(100);
          setIsSwarmRunning(false);
          setAgentLogs(prev => [...prev, { agentId: 'system', message: '🎉 Enjambre Multi-Agente finalizado. Documento compilado.', timestamp: new Date().toISOString() }]);

          if (data.finalDoc) {
            updateConfig('projectType', null, frameworkId);
          }
          es.close();
        }
      } catch (err) {
        console.error("Error al procesar mensaje SSE:", err);
      }
    };

    // Disparar la ejecución en el backend Express
    try {
      await fetch('http://localhost:3001/api/swarm/industrialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          context: {
            ideaText,
            answers,
            frameworkId: frameworkId || frameworkInference?.frameworkId || 'business',
            aiConfig: planData?.config?.ai,
            sector: planData.semilla?.cobertura || 'General',
            ubicacion: planData.semilla?.cobertura || 'Nacional'
          }
        })
      });
    } catch (err) {
      console.error("Error al activar industrialización Swarm:", err);
      setIsSwarmRunning(false);
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

  return (
    <div className="module-container" style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 2rem 6rem 2rem' }}>

      {/* Header Central */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <BrainCircuit style={{ color: 'var(--accent-color)' }} size={36} />
          Anteproyecto & Semilla Adaptativa v2.0
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '700px', margin: '0 auto' }}>
          Cuéntanos tu idea por voz o texto. La IA clasificará automáticamente la metodología, cargará los benchmarks de tu industria y evaluará tu perfil cuántico.
        </p>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
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

      {/* Visualizador Pixel Swarm Office en vivo si el enjambre está activo */}
      {(isSwarmRunning || agentLogs.length > 0) && (
        <PixelSwarmViewer
          activeAgents={activeAgents}
          agentLogs={agentLogs}
          globalProgress={globalProgress}
          isRunning={isSwarmRunning}
        />
      )}

      {/* STEP 1: Vaciado de Cerebro (Brain Dump) */}
      {step === 1 && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{
            background: 'var(--bg-panel)', padding: '2rem', borderRadius: '16px',
            border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Paso 1: Explica tu Idea (Audio o Texto)
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Presiona el micrófono o escribe libremente. Ejemplo: <em>"Tengo la idea de abrir una tortillería de maíz en mi colonia con servicio a domicilio..."</em> o <em>"Quiero hacer un proyecto social para..."</em>
            </p>

            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <textarea
                className="form-control"
                style={{
                  height: '220px', fontSize: '1.1rem', lineHeight: '1.6',
                  padding: '1.5rem', borderRadius: '12px', resize: 'vertical',
                  borderColor: isRecording ? 'var(--accent-color)' : 'var(--border-color)',
                  boxShadow: isRecording ? '0 0 0 4px rgba(99, 102, 241, 0.1)' : 'none'
                }}
                placeholder="Hola, mi idea es..."
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

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={processText}
                disabled={rawText.length < 10 || isRecording}
                style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
              >
                <BrainCircuit size={18} /> Procesar con Inferencia e IA
              </button>

              <button
                className="btn"
                onClick={() => setIsInterviewOpen(true)}
                disabled={rawText.length < 10 || isRecording}
                style={{
                  padding: '0.75rem 2rem', fontSize: '1rem',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  color: 'white', border: 'none', borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold'
                }}
              >
                <Cpu size={20} /> Entrevistar e Industrializar con Swarm IA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Procesamiento e Inferencia */}
      {step === 2 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', animation: 'fadeIn 0.3s ease' }}>
          <Loader2 size={64} style={{ color: 'var(--accent-color)', animation: 'spin 1.5s linear infinite', margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Analizando tu anteproyecto...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Clasificando la metodología óptima, consultando la base de benchmarks de industria y diagnosticando tu perfil cuántico...
          </p>
        </div>
      )}

      {/* STEP 3: Semilla Adaptativa & Diagnóstico Cuántico */}
      {step === 3 && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>

          {/* Recomendación de Framework Inferido */}
          {frameworkInference && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={20} style={{ color: 'var(--accent-color)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-color)', textTransform: 'uppercase' }}>
                    Metodología Inferred por IA ({Math.round(frameworkInference.confidence * 100)}% Confianza)
                  </span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.3rem 0', color: 'var(--text-primary)' }}>
                  {FRAMEWORKS[frameworkInference.frameworkId]?.name || frameworkInference.frameworkId}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {frameworkInference.reasoning}
                </p>
              </div>

              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                onClick={() => setStep(4)}
              >
                Cambiar Metodología
              </button>
            </div>
          )}

          {/* Diagnóstico Cuántico del Fundador */}
          {quantumDiagnostic && (
            <QuantumProfileCard diagnosticData={quantumDiagnostic} />
          )}

          {/* Formulario Adaptativo (Check Rápido o Entrevista) */}
          <AdaptiveSeedForm
            seedData={planData.semilla}
            benchmarkMatch={benchmarkMatch}
            frameworkInference={frameworkInference}
            onUpdateField={handleUpdateSeedField}
            onConfirmSeed={() => setStep(4)}
          />

        </div>
      )}

      {/* STEP 4: Confirmación y Elección de Framework */}
      {step === 4 && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Paso 3: Confirma la Metodología Estratégica</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Selecciona el marco con el que la Oficina Virtual de Consultores (Swarm) industrializará tu proyecto.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {Object.entries(FRAMEWORKS).map(([key, framework]) => {
              const isRecommended = frameworkInference?.frameworkId === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    updateConfig('projectType', null, key);
                    const firstPillar = framework.pillars?.[0];
                    const firstModule = firstPillar?.modules?.[0];
                    if (firstPillar && firstModule) {
                      window.location.href = `/modulo/${firstPillar.key}/${firstModule.key}`;
                    } else {
                      window.location.href = '/';
                    }
                  }}
                  style={{
                    background: isRecommended ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)' : 'var(--bg-panel)',
                    border: isRecommended ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    position: 'relative',
                    boxShadow: isRecommended ? '0 10px 25px -5px rgba(99, 102, 241, 0.2)' : '0 4px 6px -1px rgba(0,0,0,0.05)'
                  }}
                >
                  {isRecommended && (
                    <span style={{
                      position: 'absolute', top: '-10px', right: '12px',
                      background: 'var(--accent-color)', color: 'white',
                      fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem',
                      borderRadius: '10px', textTransform: 'uppercase'
                    }}>
                      Recomendado ({Math.round(frameworkInference.confidence * 100)}%)
                    </span>
                  )}
                  <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)' }}>{framework.name || key}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    {framework.pillars?.length || 0} pilares académicos con {framework.pillars?.reduce((acc, p) => acc + (p.modules?.length || 0), 0) || 0} módulos especializados.
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Entrevista Contextual y Selección de Documento */}
      <SwarmInterviewModal
        isOpen={isInterviewOpen}
        onClose={() => setIsInterviewOpen(false)}
        ideaText={rawText}
        onConfirmSwarm={handleLaunchSwarmSession}
      />
    </div>
  );
}
