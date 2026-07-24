/**
 * PixelSwarmViewer.jsx - Visualizador 2D Gamificado de Oficina en Pixel-Art
 * 
 * Renderiza en un lienzo HTML5 Canvas la oficina de consultoría virtual
 * donde sprites pixel-art representando a los agentes activos trabajan en vivo.
 * Inspirado en la estética y UX de Pixel Agents.
 */

import React, { useRef, useEffect, useState } from 'react';
import { Play, CheckCircle2, AlertCircle, Volume2, VolumeX, Terminal, Cpu } from 'lucide-react';

export function PixelSwarmViewer({ activeAgents = [], agentLogs = [], globalProgress = 0, isRunning = false, onComplete }) {
  const canvasRef = useRef(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [activeSpeechBubble, setActiveSpeechBubble] = useState(null);

  // Mapeo de sprites y estados visuales
  const spriteMeta = {
    interviewer: { name: 'Asesor Principal', color: '#8b5cf6', icon: '💬', deskX: 60 },
    market: { name: 'Investigador', color: '#06b6d4', icon: '🕵️', deskX: 180 },
    financial: { name: 'Financiero', color: '#10b981', icon: '📊', deskX: 300 },
    capex_wacc: { name: 'Ingeniero CAPEX', color: '#f59e0b', icon: '🏗️', deskX: 420 },
    tech_id: { name: 'Especialista TRL', color: '#ec4899', icon: '💡', deskX: 180 },
    social_mml: { name: 'Consultor Social', color: '#3b82f6', icon: '🤝', deskX: 300 },
    lean_mvp: { name: 'Coach Lean', color: '#f97316', icon: '🚀', deskX: 420 },
    strategy: { name: 'Estratega', color: '#6366f1', icon: '⚙️', deskX: 420 },
    synthesizer: { name: 'Redactor Jefe', color: '#eab308', icon: '📝', deskX: 540 }
  };

  useEffect(() => {
    if (agentLogs.length > 0) {
      const lastLog = agentLogs[agentLogs.length - 1];
      setActiveSpeechBubble({
        agentId: lastLog.agentId,
        message: lastLog.message,
        timestamp: Date.now()
      });
    }
  }, [agentLogs]);

  // Loop de renderizado Canvas 2D a 60 FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Fondo de Oficina (Suelo de losetas Pixel Art)
      const tileSize = 30;
      for (let x = 0; x < canvas.width; x += tileSize) {
        for (let y = 0; y < canvas.height; y += tileSize) {
          const isEven = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
          ctx.fillStyle = isEven ? '#1e293b' : '#0f172a';
          ctx.fillRect(x, y, tileSize, tileSize);
        }
      }

      // Pared posterior
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, canvas.width, 50);
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 46, canvas.width, 4);

      // Cuadro en la pared / Ventana
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect( canvas.width / 2 - 80, 10, 160, 30 );
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.strokeRect( canvas.width / 2 - 80, 10, 160, 30 );
      ctx.fillStyle = '#a5b4fc';
      ctx.font = '10px monospace';
      ctx.fillText('OPEN BUSINESS PLAN SWARM', canvas.width / 2 - 70, 28);

      // 2. Renderizar Escritorios y Agentes
      const displayAgents = activeAgents.length > 0 
        ? activeAgents 
        : ['market', 'financial', 'strategy', 'synthesizer'];

      displayAgents.forEach((agentId, index) => {
        const meta = spriteMeta[agentId] || { name: 'Consultor', color: '#94a3b8', icon: '👤', deskX: 80 + index * 120 };
        const x = 80 + index * 130;
        const y = 90;

        // Escritorio Pixel
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x - 30, y + 25, 60, 25);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(x - 28, y + 23, 56, 4);

        // Monitor de computadora
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 12, y + 5, 24, 18);
        ctx.fillStyle = isRunning ? meta.color : '#334155';
        ctx.fillRect(x - 10, y + 7, 20, 14);

        // Brillo de pantalla si trabaja
        if (isRunning) {
          const pulse = Math.sin(tick * 0.1) * 0.3 + 0.7;
          ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.3})`;
          ctx.fillRect(x - 10, y + 7, 20, 14);
        }

        // Base del monitor
        ctx.fillStyle = '#475569';
        ctx.fillRect(x - 3, y + 23, 6, 4);

        // Avatar de Agente (Sprite Pixel animado)
        const bounce = isRunning ? Math.sin(tick * 0.2 + index) * 2 : 0;
        
        // Cuerpo / Silla
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - 14, y + 15 + bounce, 28, 22);

        // Cabeza / Icono
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(meta.icon, x, y + 12 + bounce);

        // Etiqueta con Nombre del Agente
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(meta.name, x, y + 62);

        // Globo de Diálogo Emergente (Speech Bubble)
        if (activeSpeechBubble && activeSpeechBubble.agentId === agentId) {
          const bubbleWidth = 120;
          const bubbleHeight = 34;
          const bx = x - bubbleWidth / 2;
          const by = y - 35;

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(bx, by, bubbleWidth, bubbleHeight, 6);
          ctx.fill();
          ctx.strokeStyle = meta.color;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Triángulo del globo
          ctx.beginPath();
          ctx.moveTo(x - 5, by + bubbleHeight);
          ctx.lineTo(x, by + bubbleHeight + 6);
          ctx.lineTo(x + 5, by + bubbleHeight);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          // Texto de estado truncado
          ctx.fillStyle = '#0f172a';
          ctx.font = '9px sans-serif';
          ctx.textAlign = 'left';
          const msg = activeSpeechBubble.message || 'Procesando...';
          const line1 = msg.substring(0, 22);
          const line2 = msg.length > 22 ? msg.substring(22, 42) + '...' : '';
          ctx.fillText(line1, bx + 6, by + 14);
          if (line2) ctx.fillText(line2, bx + 6, by + 26);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeAgents, isRunning, activeSpeechBubble]);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl my-4">
      {/* Cabecera del Lienzo */}
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
            PIXEL SWARM OFFICE — OFICINA VIRTUAL DE CONSULTORES IA
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
            title={audioEnabled ? 'Silenciar Efectos' : 'Activar Efectos'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 ${
            isRunning ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
            {isRunning ? 'Enjambre Trabajando' : 'Oficina en Espera'}
          </span>
        </div>
      </div>

      {/* Lienzo Canvas 2D */}
      <div className="relative bg-slate-950 flex justify-center p-4">
        <canvas
          ref={canvasRef}
          width={640}
          height={180}
          className="rounded-lg border border-slate-800 shadow-inner max-w-full"
        />
      </div>

      {/* Barra de Progreso Global */}
      <div className="w-full bg-slate-950 px-4 py-2 border-t border-slate-800">
        <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
          <span>Avance del Enjambre Multi-Agente</span>
          <span className="font-mono text-indigo-400 font-bold">{globalProgress}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${globalProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Consola Terminal de Actividad SSE */}
      <div className="bg-slate-950 p-4 border-t border-slate-800 max-h-40 overflow-y-auto font-mono text-xs text-slate-300">
        <div className="flex items-center gap-2 text-slate-500 border-b border-slate-800 pb-1 mb-2">
          <Terminal className="w-3.5 h-3.5" />
          <span>Feed de Eventos en Tiempo Real (SSE EventStream)</span>
        </div>

        {agentLogs.length === 0 ? (
          <p className="text-slate-600 italic">Esperando inicio de tareas del enjambre...</p>
        ) : (
          agentLogs.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-2 py-0.5 hover:bg-slate-900 px-1 rounded">
              <span className="text-slate-500">[{new Date(log.timestamp || Date.now()).toLocaleTimeString()}]</span>
              <span className="font-bold text-indigo-400">[{log.agentId || 'Swarm'}]:</span>
              <span className="text-slate-200">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
