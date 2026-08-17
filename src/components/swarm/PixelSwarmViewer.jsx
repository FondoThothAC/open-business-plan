/**
 * PixelSwarmViewer.jsx - Visualizador 2D Gamificado de Oficina en Pixel-Art
 * 
 * Renderiza en un lienzo HTML5 Canvas la oficina de consultoría virtual
 * donde sprites pixel-art representando a los agentes activos trabajan en vivo.
 * Incluye soporte para agentes auto-generados, badges de ahorro de tokens y efectos cuánticos.
 */

import { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX, Terminal, Cpu, BookOpen } from 'lucide-react';
import { SwarmIntelligenceHub } from './SwarmIntelligenceHub';

export function PixelSwarmViewer({ activeAgents = [], agentLogs = [], _globalProgress = 0, isRunning = false, _onComplete, matchingReport = [] }) {
  const canvasRef = useRef(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [activeSpeechBubble, setActiveSpeechBubble] = useState(null);
  const [isHubOpen, setIsHubOpen] = useState(false);

  // Mapeo base de sprites y estados visuales
  const spriteMeta = {
    interviewer: { name: 'Asesor Principal', color: '#8b5cf6', icon: '💬' },
    market: { name: 'Investigador', color: '#06b6d4', icon: '🕵️' },
    financial: { name: 'Financiero', color: '#10b981', icon: '📊' },
    capex_wacc: { name: 'Ingeniero CAPEX', color: '#f59e0b', icon: '🏗️' },
    tech_id: { name: 'Especialista TRL', color: '#ec4899', icon: '💡' },
    social_mml: { name: 'Consultor Social', color: '#3b82f6', icon: '🤝' },
    lean_mvp: { name: 'Coach Lean', color: '#f97316', icon: '🚀' },
    strategy: { name: 'Estratega', color: '#6366f1', icon: '🧭' },
    quantum_diagnostic: { name: 'Diag. Cuántico', color: '#a855f7', icon: '⚛️' },
    quantum_diagnostician: { name: 'Diag. Cuántico', color: '#a855f7', icon: '⚛️' },
    synthesizer: { name: 'Redactor Jefe', color: '#eab308', icon: '📝' }
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
      ctx.fillRect(canvas.width / 2 - 110, 10, 220, 30);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.strokeRect(canvas.width / 2 - 110, 10, 220, 30);
      ctx.fillStyle = '#a5b4fc';
      ctx.font = '10px monospace';
      ctx.fillText('OPEN BUSINESS PLAN SWARM EVO v3.0', canvas.width / 2 - 100, 28);

      // 2. Renderizar Escritorios y Agentes
      const displayAgents = activeAgents.length > 0 
        ? activeAgents 
        : ['market', 'financial', 'strategy', 'quantum_diagnostic', 'synthesizer'];

      const deskSpacing = Math.min(130, (canvas.width - 60) / Math.max(1, displayAgents.length));

      displayAgents.forEach((agentItem, index) => {
        const agentId = typeof agentItem === 'string' ? agentItem : (agentItem.id || `agent_${index}`);
        const customName = typeof agentItem === 'object' ? agentItem.name : null;
        const customAvatar = typeof agentItem === 'object' ? agentItem.avatar : null;
        
        const meta = spriteMeta[agentId] || { 
          name: customName || 'Especialista', 
          color: '#06b6d4', 
          icon: customAvatar || '✨' 
        };

        const x = 50 + index * deskSpacing + deskSpacing / 2;
        const y = 90;

        // Escritorio Pixel
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x - 26, y + 25, 52, 25);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(x - 24, y + 23, 48, 4);

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
        
        // Efecto cuántico si es diagnosticador cuántico
        if (agentId.includes('quantum') && isRunning) {
          const auraRadius = 18 + Math.sin(tick * 0.15) * 4;
          const gradient = ctx.createRadialGradient(x, y + 12 + bounce, 4, x, y + 12 + bounce, auraRadius);
          gradient.addColorStop(0, 'rgba(168, 85, 247, 0.6)');
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y + 12 + bounce, auraRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Cuerpo / Silla
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - 12, y + 15 + bounce, 24, 20);

        // Cabeza / Icono
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(meta.icon, x, y + 12 + bounce);

        // Etiqueta con Nombre del Agente
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(meta.name.slice(0, 15), x, y + 60);

        // Badge de Reutilización / Token Saver flotante sobre el escritorio
        const matchInfo = matchingReport.find(r => r.agentId === agentId);
        if (matchInfo && matchInfo.badgeText) {
          ctx.fillStyle = matchInfo.status === 'reused' ? '#10b981' : matchInfo.status === 'specialized' ? '#f59e0b' : '#6366f1';
          ctx.font = '8px sans-serif';
          ctx.fillText(matchInfo.badgeText.slice(0, 18), x, y - 10);
        }

        // Globo de Diálogo Emergente (Speech Bubble)
        if (activeSpeechBubble && (activeSpeechBubble.agentId === agentId || activeSpeechBubble.agentId === meta.name)) {
          const bubbleWidth = 110;
          const bubbleHeight = 32;
          const bx = x - bubbleWidth / 2;
          const by = y - 45;

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(bx, by, bubbleWidth, bubbleHeight, 6);
          ctx.fill();
          ctx.strokeStyle = meta.color;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#0f172a';
          ctx.font = '8px sans-serif';
          ctx.textAlign = 'left';
          const msg = activeSpeechBubble.message.length > 28 
            ? activeSpeechBubble.message.slice(0, 26) + '...' 
            : activeSpeechBubble.message;
          ctx.fillText(msg, bx + 6, by + 18);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeAgents, isRunning, activeSpeechBubble, matchingReport]);

  return (
    <div className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl mb-6">
      
      {/* Barra de Control de la Oficina */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <Cpu size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Pixel Swarm Office — Oficina Virtual de Consultores IA
              {isRunning && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </h3>
            <span className="text-[10px] text-slate-400">
              {isRunning ? 'Enjambre multi-agente ejecutando en paralelo...' : 'En espera de industrialización'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHubOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-medium transition"
          >
            <BookOpen size={14} />
            Biblioteca de Agentes (Hub)
          </button>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-1.5 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800"
            title={audioEnabled ? "Desactivar audio" : "Activar audio"}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Canvas Pixel-Art */}
      <div className="relative w-full bg-slate-950 flex items-center justify-center p-2 overflow-x-auto">
        <canvas
          ref={canvasRef}
          width={700}
          height={180}
          className="border border-slate-800 rounded-xl shadow-inner max-w-full"
        />
      </div>

      {/* Consola de Eventos en Vivo */}
      <div className="bg-slate-950/90 p-4 border-t border-slate-800 max-h-40 overflow-y-auto font-mono text-xs text-slate-300">
        <div className="flex items-center gap-2 text-slate-500 mb-2 font-bold uppercase text-[10px]">
          <Terminal size={12} />
          Feed de Razonamiento del Enjambre (SSE Stream):
        </div>
        {agentLogs.length === 0 ? (
          <div className="text-slate-500 italic">Inicia el enjambre para visualizar los logs concurrentes...</div>
        ) : (
          agentLogs.slice(-6).map((log, index) => (
            <div key={index} className="py-0.5 flex items-start gap-2">
              <span className="text-slate-500 text-[10px]">[{new Date(log.timestamp || Date.now()).toLocaleTimeString()}]</span>
              <span className="font-bold text-indigo-400">[{log.agentId || 'Swarm'}]:</span>
              <span className="text-slate-200">{log.message}</span>
            </div>
          ))
        )}
      </div>

      {/* Modal del Swarm Intelligence Hub */}
      <SwarmIntelligenceHub isOpen={isHubOpen} onClose={() => setIsHubOpen(false)} />
    </div>
  );
}
