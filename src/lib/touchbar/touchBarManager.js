/**
 * TouchBarManager.js
 * Módulo de integración para MacBook Pro Touch Bar mediante Web MediaSession API y Telemetría.
 * Permite proyectar en la pantalla OLED de macOS el estado del enjambre IA, progreso y módulo activo en Google Chrome.
 */

// Mapa de emojis descriptivos según el estado de la IA
const AI_STATE_ICONS = {
  pensando: '🧠',
  web_search: '🌐',
  simulando: '📊',
  cuantico: '⚛️',
  redactando: '✍️',
  error: '⚠️',
  listo: '✅',
  esperando: '⏸️'
};

/**
 * Formatea el título principal que se proyectará en la Touch Bar de macOS.
 */
export function formatTouchBarTitle({ progressPercent = 0, aiState = 'listo', currentModuleTitle = 'Plan de Negocios' }) {
  const icon = AI_STATE_ICONS[aiState] || '🚀';
  const pct = Math.round(Number(progressPercent) || 0);
  return `[${pct}%] ${icon} ${currentModuleTitle}`;
}

/**
 * Formatea el texto secundario (Artista / Subtítulo) con el modelo activo y el último log del monitor.
 */
export function formatTouchBarArtist({ lastLog = '', activeModel = 'minimax-m3:cloud', projectName = 'Open Plan' }) {
  const cleanModel = String(activeModel || 'minimax-m3:cloud');
  const safeProject = projectName ? ` • ${projectName}` : '';
  const prefix = `[${cleanModel}${safeProject}] `;
  
  if (!lastLog) {
    return prefix.trim();
  }

  const maxLogLen = 45;
  const safeLog = String(lastLog).replace(/[\r\n\t]+/g, ' ').trim();
  const truncatedLog = safeLog.length > maxLogLen ? `${safeLog.substring(0, maxLogLen)}...` : safeLog;

  const result = `${prefix}${truncatedLog}`;
  return result.length > 105 ? `${result.substring(0, 102)}...` : result;
}

/**
 * Genera un SVG como string con fondo OLED de alto contraste y tipografía nítida para la carátula de MediaSession.
 */
export function createTouchBarCoverSvg({
  progressPercent = 0,
  aiState = 'listo',
  currentModuleTitle = 'Open Business Plan',
  lastLog = 'Monitoreando en tiempo real...',
  activeModel = 'minimax-m3:cloud'
}) {
  const icon = AI_STATE_ICONS[aiState] || '🚀';
  const pct = Math.round(Number(progressPercent) || 0);
  const safeTitle = String(currentModuleTitle).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeLog = String(lastLog).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 60);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="progGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="64" fill="url(#bg)" stroke="#312e81" stroke-width="8"/>
  
  <!-- Header / Badge -->
  <rect x="40" y="40" width="432" height="60" rx="16" fill="#1e1b4b" stroke="#4338ca" stroke-width="2"/>
  <text x="60" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#a5b4fc">FONDO THOTH • TOUCH BAR</text>
  <text x="440" y="80" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" font-weight="700" fill="#38bdf8">${icon} ${activeModel}</text>
  
  <!-- Central Icon & Progress -->
  <circle cx="256" cy="220" r="90" fill="#18181b" stroke="#374151" stroke-width="6"/>
  <circle cx="256" cy="220" r="90" fill="none" stroke="url(#progGrad)" stroke-width="12" stroke-dasharray="565" stroke-dashoffset="${565 - (565 * pct / 100)}" stroke-linecap="round" transform="rotate(-90 256 220)"/>
  <text x="256" y="235" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="52" font-weight="900" fill="#ffffff">${pct}%</text>

  <!-- Module Title -->
  <text x="256" y="360" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="32" font-weight="800" fill="#f8fafc">${safeTitle}</text>
  
  <!-- Last Log / Activity -->
  <rect x="40" y="395" width="432" height="75" rx="16" fill="#0f172a" stroke="#1e293b" stroke-width="2"/>
  <text x="256" y="440" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="500" fill="#94a3b8">${safeLog}...</text>
</svg>`;
}

/**
 * Convierte un SVG en un Data URL (base64) para asignar como carátula a navigator.mediaSession.
 */
export function svgToDataUrl(svgString) {
  if (typeof btoa === 'function') {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

/**
 * Crea el objeto JSON de estado estructurado para BetterTouchTool y scripts locales.
 */
export function createTouchBarStatusPayload({
  planData = {},
  currentModule = 'introduccion',
  currentModuleTitle = 'Introducción',
  progressPercent = 0,
  aiState = 'listo',
  lastLog = '',
  activeModel = 'minimax-m3:cloud'
}) {
  const seed = planData?.semilla || {};
  const projectName = seed.nombre_proyecto || seed.nombre || 'Open Business Plan';
  const location = seed.cobertura || seed.ubicacion || seed.cliente_ubicacion || 'Cananea, Sonora';

  return {
    projectName,
    location,
    currentModule,
    currentModuleTitle,
    progressPercent: Math.round(Number(progressPercent) || 0),
    aiState,
    activeModel,
    lastLog: lastLog || 'Monitoreo de agentes activo',
    quantumStatus: 'Óptimo (2 Áreas)',
    updatedAt: new Date().toISOString()
  };
}

/**
 * Clase Singleton para gestionar la MediaSession en Google Chrome / Safari.
 */
class TouchBarBridgeManager {
  constructor() {
    this.audioElement = null;
    this.isEnabled = false;
    this.listeners = new Set();
    this.currentStatus = {
      progressPercent: 0,
      aiState: 'listo',
      currentModuleTitle: 'Open Business Plan',
      lastLog: '',
      activeModel: 'minimax-m3:cloud',
      projectName: 'Open Business Plan'
    };
  }

  init() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return false;
    }

    if (!this.audioElement) {
      // Audio silencioso loop para mantener el enlace de MediaSession activo en Chrome
      this.audioElement = document.createElement('audio');
      // Generador de tono silencioso en base64 (WAV 1 segundo vacío)
      this.audioElement.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      this.audioElement.loop = true;
      this.audioElement.volume = 0.001; // Casi inaudible
    }

    this.setupMediaSessionHandlers();
    this.isEnabled = true;
    return true;
  }

  setupMediaSessionHandlers() {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        this.emitAction('resume');
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        this.emitAction('pause');
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.emitAction('next_module');
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.emitAction('prev_module');
      });
    } catch (e) {
      console.warn('[TouchBarBridge] Error configurando MediaSession handlers:', e);
    }
  }

  emitAction(actionName) {
    this.listeners.forEach((fn) => {
      try {
        fn(actionName);
      } catch (err) {
        console.error(err);
      }
    });
  }

  onAction(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  update(statusUpdates = {}) {
    this.currentStatus = { ...this.currentStatus, ...statusUpdates };

    if (!this.isEnabled || typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    try {
      // Intentar iniciar audio silencioso si el usuario ya interactuó
      if (this.audioElement && this.audioElement.paused) {
        this.audioElement.play().catch(() => {});
      }

      const title = formatTouchBarTitle(this.currentStatus);
      const artist = formatTouchBarArtist(this.currentStatus);
      const svg = createTouchBarCoverSvg(this.currentStatus);
      const artworkUrl = svgToDataUrl(svg);

      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: artist,
        album: this.currentStatus.projectName || 'Open Business Plan',
        artwork: [
          { src: artworkUrl, sizes: '512x512', type: 'image/svg+xml' }
        ]
      });
    } catch (err) {
      console.warn('[TouchBarBridge] Error actualizando MediaSession:', err);
    }
  }

  destroy() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.isEnabled = false;
  }
}

export const touchBarManager = new TouchBarBridgeManager();
