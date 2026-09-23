import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '../context/PlanContext';
import { FRAMEWORKS } from '../config/frameworks';
import { getApiBase } from '../config/apiConfig';
import { extractSeedFromText, askFieldDoubt } from '../lib/ai';
import { classifyProject } from '../lib/classifyProject';
import { matchIndustry } from '../lib/benchmarkMatcher';
import { evaluateQuantumProfile } from '../lib/quantumDiagnostic';
import QuantumProfileCard from './QuantumProfileCard';
import AdaptiveSeedForm from './AdaptiveSeedForm';
import { Mic, MicOff, BrainCircuit, CheckCircle, Loader2, AlertCircle, Sparkles, Cpu, Zap, Play, X, Check } from 'lucide-react';
import { PixelSwarmViewer } from './swarm/PixelSwarmViewer';
import { SwarmInterviewModal } from './swarm/SwarmInterviewModal';
import DocumentUploader from './DocumentUploader';

export default function Anteproyecto() {
  const navigate = useNavigate();
  const { planData, updateSemilla, updateConfig, initNewProjectFromSeed, startIndustrialization, _setPlanData } = usePlan();

  // Si la semilla ya tiene datos cargados en el plan, mostramos el paso de revisión (3)
  const [step, setStep] = useState(() => {
    if (planData?.semilla && Object.keys(planData.semilla).some(k => planData.semilla[k] && String(planData.semilla[k]).trim().length > 3)) {
      return 3;
    }
    return 1;
  });

  const [rawText, setRawText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Estados de Inferencia, Benchmarks y Diagnóstico Cuántico
  const [frameworkInference, setFrameworkInference] = useState(null);
  const [benchmarkMatch, setBenchmarkMatch] = useState(null);
  const [quantumDiagnostic, setQuantumDiagnostic] = useState(null);

  // Selector dinámico de ritmo para Copiloto Autónomo
  const [selectedFrameworkForLaunch, setSelectedFrameworkForLaunch] = useState(null);
  const [launchMode, setLaunchMode] = useState('agil'); // 'agil' | 'profundo'

  // Asistencia IA por campo
  const [_activeDoubtField, _setActiveDoubtField] = useState(null);
  const [doubtText, _setDoubtText] = useState('');
  const [_aiResponse, _setAiResponse] = useState('');
  const [_isAsking, _setIsAsking] = useState(false);

  // Estados del Swarm Engine & Pixel Swarm Office
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [isSwarmRunning, setIsSwarmRunning] = useState(false);
  const [activeAgents, setActiveAgents] = useState([]);
  const [agentLogs, setAgentLogs] = useState([]);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [matchingReport, setMatchingReport] = useState([]);

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
          } catch { }
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

  // Procesamiento Inteligente Adaptativo con Timeout y Fallback Resiliente
  const processText = async () => {
    if (!rawText.trim() || rawText.length < 15) {
      setError("Por favor cuéntanos un poco más sobre tu idea (mínimo 15 caracteres).");
      return;
    }

    setStep(2);
    setIsProcessing(true);
    setError('');

    // Función auxiliar con timeout
    const withTimeout = (promise, ms, fallbackValue) => {
      return Promise.race([
        promise,
        new Promise(resolve => setTimeout(() => resolve(fallbackValue), ms))
      ]);
    };

    try {
      const aiConfig = planData?.config?.ai;

      // Timeout preventivo de 25 segundos para cada tarea asíncrona
      const [seedDataRes, inferenceRes, benchmarkRes] = await Promise.all([
        withTimeout(
          extractSeedFromText(aiConfig, rawText).catch(e => {
            console.warn("Fallo extracción semilla con IA:", e);
            return null;
          }),
          25000,
          null
        ),
        withTimeout(
          classifyProject(aiConfig, rawText).catch(e => {
            console.warn("Fallo clasificación proyecto con IA:", e);
            return null;
          }),
          25000,
          null
        ),
        withTimeout(
          matchIndustry(rawText, planData?.semilla, aiConfig).catch(e => {
            console.warn("Fallo match industria con IA:", e);
            return null;
          }),
          25000,
          null
        )
      ]);

      const seedData = seedDataRes || {
        nombre_proyecto: rawText.split('\n')[0].slice(0, 45).replace(/[#*]/g, '').trim() || 'Proyecto Empresarial',
        cobertura: 'Local / Regional',
        problema: 'Necesidad detectada en el mercado objetivo.',
        solucion: rawText.slice(0, 300),
        mercado_objetivo: 'Consumidores y clientes potenciales del sector.',
        modelo_ingresos: 'Venta directa de productos o prestación de servicios.',
        ventaja_injusta: 'Atención personalizada y propuesta de valor adaptada.'
      };

      const finalInference = inferenceRes || {
        frameworkId: 'business',
        frameworkName: 'Plan de Negocios Estándar',
        confidence: 0.85,
        reasoning: 'Metodología general de negocios asignada como marco idóneo.'
      };

      const finalBenchmark = benchmarkRes || {
        matched: false,
        source: 'none',
        benchmark: null
      };

      // Evaluar perfil cuántico del fundador con fallback heurístico garantizado
      let quantumRes = null;
      try {
        quantumRes = await withTimeout(
          evaluateQuantumProfile(aiConfig, seedData, rawText).catch(e => {
            console.warn("Fallo evaluación cuántica con IA:", e);
            return null;
          }),
          15000,
          null
        );
      } catch {
        quantumRes = null;
      }

      if (!quantumRes) {
        quantumRes = await evaluateQuantumProfile(null, seedData, rawText);
      }

      // Actualizar estado global del plan
      updateSemilla('nombre_proyecto', seedData.nombre_proyecto || '');
      updateSemilla('cobertura', seedData.cobertura || '');
      updateSemilla('problema', seedData.problema || '');
      updateSemilla('solucion', seedData.solucion || '');
      updateSemilla('mercado_objetivo', seedData.mercado_objetivo || '');
      updateSemilla('modelo_ingresos', seedData.modelo_ingresos || '');
      updateSemilla('ventaja_injusta', seedData.ventaja_injusta || '');

      setFrameworkInference(finalInference);
      setBenchmarkMatch(finalBenchmark);
      setQuantumDiagnostic(quantumRes);

      // Configurar el framework inferido como activo
      if (finalInference?.frameworkId && FRAMEWORKS[finalInference.frameworkId]) {
        updateConfig('projectType', null, finalInference.frameworkId);
      }

      setStep(3);
    } catch (err) {
      console.error("Error al procesar el anteproyecto:", err);
      // Avanzar al paso 3 con la semilla capturada y registrar aviso
      setError(`Se avanzó con parámetros adaptativos base: ${err.message || 'Tiempo de espera agotado'}`);
      setStep(3);
    } finally {
      setIsProcessing(false);
    }
  };

  const goToStep = (targetStep) => {
    if (isProcessing || isSwarmRunning) return;
    setError('');
    setStep(Math.min(4, Math.max(1, targetStep)));
  };

  // Actualizar un campo individual de la semilla
  const handleUpdateSeedField = (key, value) => {
    updateSemilla(key, value);
  };

  // Lanzar la industrialización con el Swarm Engine y SSE
  const handleLaunchSwarmSession = async ({ frameworkId, answers, ideaText }) => {
    setIsSwarmRunning(true);
    setGlobalProgress(10);
    setAgentLogs([{ agentId: 'system', message: 'Iniciando conexión con Swarm Evolution Engine...', timestamp: new Date().toISOString() }]);

    const sessionId = `swarm_${Date.now()}`;
    const apiBase = getApiBase();

    // Suscripción SSE a los eventos del enjambre con credenciales
    const es = new EventSource(`${apiBase}/api/swarm/stream/${sessionId}`, { withCredentials: true });
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'swarm_started') {
          setActiveAgents(data.agentsMeta ? data.agentsMeta.map(a => ({ id: a.id, name: a.name, avatar: a.avatar })) : []);
          if (data.matchingReport) {
            setMatchingReport(data.matchingReport);
          }
          setGlobalProgress(15);
        } else if (data.type === 'agent_progress') {
          setAgentLogs(prev => [...prev, { agentId: data.agentId, message: data.message, timestamp: data.timestamp }]);
          setGlobalProgress(prev => Math.min(prev + 10, 90));
        } else if (data.type === 'quantum_diagnostic_alert') {
          setAgentLogs(prev => [...prev, {
            agentId: 'quantum_diagnostic',
            message: `⚛️ [DIAGNÓSTICO CUÁNTICO]: ${data.quantumResult?.alertaFusion || 'Áreas atómicas evaluadas.'}`,
            timestamp: new Date().toISOString()
          }]);
        } else if (data.type === 'agent_completed') {
          setAgentLogs(prev => [...prev, { agentId: data.agentId, message: `✅ ${data.name || data.agentId} finalizó su análisis.`, timestamp: new Date().toISOString() }]);
        } else if (data.type === 'swarm_completed') {
          setGlobalProgress(100);
          setIsSwarmRunning(false);
          setAgentLogs(prev => [...prev, {
            agentId: 'system',
            message: `🎉 Enjambre Swarm Evolution finalizado. Total Tokens Ahorrados: ${(data.totalTokensSaved || 0).toLocaleString()} tks.`,
            timestamp: new Date().toISOString()
          }]);

          if (data.finalDoc) {
            updateConfig('projectType', null, frameworkId);
          }
          es.close();
        }
      } catch (err) {
        console.error("Error al procesar mensaje SSE:", err);
      }
    };

    es.onerror = () => {
      setError('Se perdió la conexión con Swarm. Puedes volver a intentarlo sin perder la información capturada.');
      setIsSwarmRunning(false);
      es.close();
    };

    // Disparar la ejecución en el backend Express con credenciales y formato flexible
    try {
      const effectiveFrameworkId = frameworkId || frameworkInference?.frameworkId || 'business';
      const response = await fetch(`${apiBase}/api/swarm/industrialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          frameworkId: effectiveFrameworkId,
          answers,
          ideaText,
          aiConfig: planData?.config?.ai,
          context: {
            ideaText,
            answers,
            frameworkId: effectiveFrameworkId,
            aiConfig: planData?.config?.ai,
            sector: planData.semilla?.cobertura || 'General',
            ubicacion: planData.semilla?.cobertura || 'Nacional'
          }
        })
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        throw new Error(failure.error || `Swarm respondió con error ${response.status}`);
      }
    } catch (err) {
      console.error("Error al activar industrialización Swarm:", err);
      setError(`No se pudo iniciar Swarm: ${err.message}`);
      setIsSwarmRunning(false);
      es.close();
    }
  };

  // Lanzador autónomo tipo Puppet con navegación visual módulo a módulo
  const handleLaunchAutonomous = () => {
    if (!selectedFrameworkForLaunch) return;
    const { key, framework } = selectedFrameworkForLaunch;
    const seed = planData?.semilla || {};
    const projName = seed.nombre_proyecto || seed.negocio?.nombre_marca || 'Proyecto Nuevo';
    
    // Configurar contexto y profundidad según el modo seleccionado
    const isAgil = launchMode === 'agil';
    updateConfig('ai', 'contextSize', isAgil ? 16384 : 65536);
    updateConfig('ai', 'depth', isAgil ? 1 : 3);
    
    // Crear el nuevo proyecto aislado con la semilla y autoría asignada
    if (initNewProjectFromSeed) {
      initNewProjectFromSeed(key, seed, projName);
    } else {
      updateConfig('projectType', null, key);
    }

    // Iniciar la industrialización automática inmediata
    if (startIndustrialization) {
      startIndustrialization();
    }

    const firstPillar = framework.pillars?.[0];
    const firstModule = firstPillar?.modules?.[0];
    setSelectedFrameworkForLaunch(null);

    // Navegar al primer módulo del proyecto
    if (firstPillar && firstModule) {
      navigate(`/modulo/${firstPillar.key}/${firstModule.key}`);
    } else {
      navigate('/semilla');
    }
  };

  // Creación manual sin activar el generador automático
  const handleCreateManual = () => {
    if (!selectedFrameworkForLaunch) return;
    const { key, framework } = selectedFrameworkForLaunch;
    const seed = planData?.semilla || {};
    const projName = seed.nombre_proyecto || seed.negocio?.nombre_marca || 'Proyecto Nuevo';
    if (initNewProjectFromSeed) {
      initNewProjectFromSeed(key, seed, projName);
    } else {
      updateConfig('projectType', null, key);
    }
    setSelectedFrameworkForLaunch(null);
    const firstPillar = framework.pillars?.[0];
    const firstModule = firstPillar?.modules?.[0];
    if (firstPillar && firstModule) {
      navigate(`/modulo/${firstPillar.key}/${firstModule.key}`);
    } else {
      navigate('/semilla');
    }
  };

  const _askAi = async (fieldName) => {
    if (!doubtText.trim()) return;
    _setIsAsking(true);
    _setAiResponse('');

    try {
      const response = await askFieldDoubt(planData.config.ai, fieldName, doubtText, planData.semilla);
      _setAiResponse(response);
    } catch {
      _setAiResponse("Hubo un error al consultar a la IA. Intenta nuevamente.");
    } finally {
      _setIsAsking(false);
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

      {/* [RAG] Cargador de Documentos — siempre visible */}
      <div style={{ marginBottom: '2rem' }}>
        <DocumentUploader />
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        {[1, 2, 3, 4].map(i => (
          <button key={i} type="button" onClick={() => goToStep(i)} disabled={isProcessing || isSwarmRunning} aria-label={`Ir al paso ${i}`} title={`Ir al paso ${i}`} style={{
            width: 40, height: 40, borderRadius: '50%',
            background: step >= i ? 'var(--accent-color)' : 'var(--bg-panel-hover)',
            color: step >= i ? 'white' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, border: step === i ? '2px solid white' : 'none',
            boxShadow: step === i ? '0 0 0 4px var(--accent-color)' : 'none',
            transition: 'all 0.3s', cursor: isProcessing || isSwarmRunning ? 'wait' : 'pointer', padding: 0
          }}>
            {step > i ? <CheckCircle size={20} /> : i}
          </button>
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
          matchingReport={matchingReport}
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
          {isProcessing ? (
            <>
              <Loader2 size={64} style={{ color: 'var(--accent-color)', animation: 'spin 1.5s linear infinite', margin: '0 auto 1.5rem' }} />
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Analizando tu anteproyecto...</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Clasificando la metodología, consultando benchmarks y preparando el diagnóstico cuántico.</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsProcessing(false);
                  setStep(3);
                }}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem', borderRadius: '8px' }}
              >
                Omitir espera y continuar al Paso 3
              </button>
            </>
          ) : (
            <>
              <BrainCircuit size={56} style={{ color: 'var(--accent-color)', margin: '0 auto 1.5rem' }} />
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Paso 2: Procesar y analizar</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Puedes ejecutar nuevamente el análisis o moverte a otro paso sin perder tus datos.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button className="btn btn-primary" onClick={processText} disabled={rawText.trim().length < 15}>Procesar nuevamente</button>
                <button className="btn btn-secondary" onClick={() => setStep(3)}>Continuar al Paso 3</button>
              </div>
            </>
          )}
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

          <button type="button" className="btn btn-secondary" onClick={() => goToStep(1)} style={{ marginTop: '1rem' }}>
            Volver al Paso 1
          </button>

        </div>
      )}

      {/* STEP 4: Confirmación y Elección de Framework */}
      {step === 4 && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Paso 4: Confirma la Metodología Estratégica</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Selecciona el marco con el que la Oficina Virtual de Consultores (Swarm) industrializará tu proyecto.
            </p>
          </div>

          <button type="button" className="btn btn-secondary" onClick={() => goToStep(3)} style={{ marginBottom: '1.5rem' }}>
            Volver al Paso 3
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {Object.entries(FRAMEWORKS).map(([key, framework]) => {
              const isRecommended = frameworkInference?.frameworkId === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedFrameworkForLaunch({ key, framework });
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

      {/* Modal de Despegue Autónomo (Modo Ágil vs Exhaustivo) */}
      {selectedFrameworkForLaunch && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem', animation: 'fadeIn 0.25s ease'
          }}
          onClick={() => setSelectedFrameworkForLaunch(null)}
        >
          <div 
            className="glass-panel"
            style={{
              width: '100%', maxWidth: '580px', background: 'var(--bg-panel)',
              border: '1px solid var(--border-color)', borderRadius: '16px',
              padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              display: 'flex', flexDirection: 'column', gap: '1.5rem',
              animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Sparkles size={16} /> Copiloto Autónomo
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.25rem 0 0 0', color: 'var(--text-primary)' }}>
                  {selectedFrameworkForLaunch.framework?.name || 'Metodología Seleccionada'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                  Define el ritmo y profundidad con que la IA redactará módulo por módulo tu plan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFrameworkForLaunch(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Selector de Ritmo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Tarjeta Modo Ágil */}
              <div
                onClick={() => setLaunchMode('agil')}
                style={{
                  padding: '1.2rem', borderRadius: '12px', cursor: 'pointer',
                  border: launchMode === 'agil' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                  background: launchMode === 'agil' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6366f1', fontWeight: 800, fontSize: '0.85rem' }}>
                    <Zap size={16} /> Ágil Visual
                  </div>
                  {launchMode === 'agil' && (
                    <span style={{ background: '#6366f1', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Ventana 16K. Redacción rápida (3-5 seg/módulo) con navegación continua campo por campo.
                </div>
                <span style={{ alignSelf: 'flex-start', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', fontWeight: 700 }}>
                  Recomendado para inicio
                </span>
              </div>

              {/* Tarjeta Modo Exhaustivo */}
              <div
                onClick={() => setLaunchMode('profundo')}
                style={{
                  padding: '1.2rem', borderRadius: '12px', cursor: 'pointer',
                  border: launchMode === 'profundo' ? '2px solid #8b5cf6' : '1px solid var(--border-color)',
                  background: launchMode === 'profundo' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8b5cf6', fontWeight: 800, fontSize: '0.85rem' }}>
                    <Cpu size={16} /> Exhaustivo
                  </div>
                  {launchMode === 'profundo' && (
                    <span style={{ background: '#8b5cf6', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Ventana 64K. Análisis profundo (15-20 seg/módulo) con investigación web y finanzas detalladas.
                </div>
                <span style={{ alignSelf: 'flex-start', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', fontWeight: 700 }}>
                  Máxima profundidad
                </span>
              </div>
            </div>

            {/* Banner explicativo del efecto Puppet */}
            <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px dashed var(--accent-color)', borderRadius: '10px', padding: '0.85rem 1rem', fontSize: '0.78rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={20} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
              <span>
                <strong>Modo Puppet Activo:</strong> El sistema navegará automáticamente por cada área (Naturaleza, Mercado, Técnico, Organización y Finanzas) mostrando en vivo cómo se redacta cada módulo.
              </span>
            </div>

            {/* Acciones del Modal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleLaunchAutonomous}
                style={{
                  padding: '0.85rem', fontSize: '0.95rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)', border: 'none', borderRadius: '10px'
                }}
              >
                <Play size={18} fill="white" />
                <span>Iniciar Copiloto Autónomo (Llenado Secuencial)</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCreateManual}
                style={{
                  padding: '0.7rem', fontSize: '0.82rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  borderRadius: '10px'
                }}
              >
                <span>Crear Proyecto y Editar Manualmente (Sin IA automática)</span>
              </button>
            </div>
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
