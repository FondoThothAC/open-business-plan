/**
 * SwarmInterviewModal.jsx - Modal de Entrevista Contextual y Recomendación (Fase 1)
 * 
 * Permite al usuario interactuar con el "Asesor de Inicio", responder preguntas
 * de precisión para su idea de negocio y confirmar el framework idóneo.
 */

import React, { useState } from 'react';
import { Sparkles, ArrowRight, HelpCircle, FileText, X } from 'lucide-react';
import { FRAMEWORKS } from '../../config/frameworks.js';

export function SwarmInterviewModal({ isOpen, onClose, ideaText, onConfirmSwarm }) {
  const [loading, setLoading] = useState(false);
  const [interviewResult, setInterviewResult] = useState(null);
  const [answers, setAnswers] = useState({});
  const [selectedFramework, setSelectedFramework] = useState('business');

  // Solicitar entrevista inicial al servidor Express
  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/swarm/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaText })
      });
      const data = await res.json();
      if (data.success) {
        setInterviewResult(data);
        setSelectedFramework(data.recommendedFramework || 'business');
      }
    } catch (err) {
      console.error('Error al iniciar entrevista con Swarm:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && ideaText) {
      handleStartInterview();
    }
  }, [isOpen, ideaText]);

  if (!isOpen) return null;

  const handleAnswerChange = (idx, value) => {
    setAnswers(prev => ({ ...prev, [idx]: value }));
  };

  const handleLaunchSwarm = () => {
    onConfirmSwarm({
      frameworkId: selectedFramework,
      answers,
      ideaText
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera del Asesor */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl shadow-inner">
            💬
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Asesor de Inicio — Diagnóstico de Idea
              <span className="bg-purple-500/20 text-purple-300 text-xs px-2.5 py-0.5 rounded-full border border-purple-500/30">
                Fase 1
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Analizando tu idea para seleccionar el subconjunto de expertos e indicadores del proyecto.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-sm font-medium text-slate-300">El Asesor de Inicio está analizando tu idea...</p>
          </div>
        ) : interviewResult ? (
          <div className="space-y-6">
            {/* Recomendación de Documento */}
            <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <FileText className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-purple-200">
                    Documento Recomendado: {interviewResult.frameworkName}
                  </h4>
                  <p className="text-xs text-purple-300/80 mt-1">
                    {interviewResult.reasoning}
                  </p>

                  {/* Selector de Frameworks (11 Disponibles) */}
                  <div className="mt-3">
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      Cambiar tipo de documento si lo deseas:
                    </label>
                    <select
                      value={selectedFramework}
                      onChange={(e) => setSelectedFramework(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      {Object.entries(FRAMEWORKS).map(([id, fw]) => (
                        <option key={id} value={id}>
                          {fw.name} ({id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Preguntas de Precisión Contextual */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                Preguntas de Precisión (Mejoran el resultado del Enjambre):
              </h4>

              {interviewResult.questions.map((q, idx) => (
                <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                  <label className="text-xs font-medium text-slate-200 block mb-1.5">
                    {idx + 1}. {q}
                  </label>
                  <input
                    type="text"
                    placeholder="Escribe tu respuesta aquí (opcional)..."
                    value={answers[idx] || ''}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Botón para iniciar la Fase 2 */}
            <div className="pt-2 flex justify-end space-x-3 border-t border-slate-800">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleLaunchSwarm}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition"
              >
                Activar Enjambre Multi-Agente
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
