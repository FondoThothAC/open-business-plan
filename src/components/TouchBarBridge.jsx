import React, { useEffect, useRef, useState } from 'react';
import { usePlan } from '../context/PlanContext';
import { touchBarManager, createTouchBarStatusPayload } from '../lib/touchbar/touchBarManager';
import { getApiBase } from '../config/apiConfig';

/**
 * TouchBarBridge
 * Componente puente montado en la raíz de la app.
 * Escucha el estado global del plan, logs del monitor y eventos de MediaSession en macOS.
 */
export default function TouchBarBridge({ activeModuleKey = 'introduccion', activeModuleTitle = 'Introducción' }) {
  const { planData, globalProgress, navigateToModule } = usePlan();
  const [lastLog, setLastLog] = useState('Monitor conectado');
  const [aiState, setAiState] = useState('listo');
  const activeModel = planData?.config?.ai?.model || 'minimax-m3:cloud';

  // Sincronizar logs del EventSource
  useEffect(() => {
    const handleLogEvent = (e) => {
      if (e.detail) {
        const msg = e.detail.message || '';
        const level = e.detail.level || '';
        if (msg) setLastLog(msg);
        
        if (level === 'thinking' || level === 'start') setAiState('pensando');
        else if (level === 'success') setAiState('listo');
        else if (level === 'warning' || level === 'error') setAiState('error');
      }
    };

    window.addEventListener('openplan_log_event', handleLogEvent);
    return () => window.removeEventListener('openplan_log_event', handleLogEvent);
  }, []);

  // Inicializar TouchBarManager
  useEffect(() => {
    touchBarManager.init();

    const unsubscribe = touchBarManager.onAction((action) => {
      if (action === 'next_module') {
        // Evento de siguiente módulo en Touch Bar
        console.log('[TouchBar] Acción recibida: Siguiente módulo');
      } else if (action === 'prev_module') {
        console.log('[TouchBar] Acción recibida: Módulo anterior');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Actualizar MediaSession y Backend de Telemetría cuando cambien los datos
  useEffect(() => {
    const payload = createTouchBarStatusPayload({
      planData,
      currentModule: activeModuleKey,
      currentModuleTitle: activeModuleTitle,
      progressPercent: globalProgress,
      aiState,
      lastLog,
      activeModel
    });

    // 1. Actualizar MediaSession en Chrome / Safari
    touchBarManager.update({
      progressPercent: globalProgress,
      aiState,
      currentModuleTitle: activeModuleTitle,
      lastLog,
      activeModel,
      projectName: payload.projectName
    });

    // 2. Notificar al backend para BetterTouchTool (throttled)
    const apiBase = getApiBase();
    fetch(`${apiBase}/api/touchbar/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  }, [planData, globalProgress, activeModuleKey, activeModuleTitle, lastLog, aiState, activeModel]);

  return null; // Componente lógico / puente sin UI visual invasiva
}
