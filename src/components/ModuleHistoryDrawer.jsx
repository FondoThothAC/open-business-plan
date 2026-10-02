import { useState, useEffect } from 'react';
import { 
  History, X, Clock, RefreshCw, Sparkles, RotateCcw
} from 'lucide-react';
import { getApiBase } from '../config/apiConfig';
import { useAuth } from '../contexts/AuthContext';

/**
 * @file ModuleHistoryDrawer.jsx
 * @description Gaveta lateral para consultar el historial de versiones, motivos de ajuste,
 * notas del equipo y feedback de calibración para el harness de IA por módulo.
 * 
 * [UXDD] Panel deslizable interactivo con listado cronológico de instantáneas.
 * [SDD] Trazabilidad completa de iteraciones del equipo y retroalimentación docente.
 */
export default function ModuleHistoryDrawer({
  isOpen,
  onClose,
  projectId,
  projectType = 'negocios',
  moduleKey,
  moduleName = 'Módulo',
  onRestoreSnapshot
}) {
  const { authFetch } = useAuth();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restoring, setRestoring] = useState(false);

  const apiBase = getApiBase();

  const fetchVersions = async () => {
    if (!projectId || !moduleKey) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${apiBase}/api/projects/${projectType}/${projectId}/modules/${moduleKey}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions || []);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'No se pudo cargar el historial de versiones.');
      }
    } catch (err) {
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && projectId && moduleKey) {
      fetchVersions();
      setSelectedVersion(null);
    }
  }, [isOpen, projectId, moduleKey]);

  if (!isOpen) return null;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const handleRestore = (ver) => {
    if (!ver?.snapshot) return;
    if (window.confirm(`¿Estás seguro de restaurar la versión archivada el ${formatDate(ver.timestamp)} por @${ver.author}? Los cambios actuales se sobrescribirán.`)) {
      setRestoring(true);
      try {
        if (onRestoreSnapshot) {
          onRestoreSnapshot(moduleKey, ver.snapshot);
        }
        onClose();
      } finally {
        setRestoring(false);
      }
    }
  };

  const TAG_NAMES = {
    cac_incorrecto: { label: 'CAC incorrecto', color: '#f59e0b' },
    poblacion_mal_definida: { label: 'Población mal definida', color: '#ef4444' },
    texto_extenso: { label: 'Texto extenso', color: '#3b82f6' },
    finanzas_irreales: { label: 'Finanzas irreales', color: '#10b981' },
    falta_detalle_tecnico: { label: 'Faltó detalle técnico', color: '#8b5cf6' },
    competencia_incompleta: { label: 'Competencia incompleta', color: '#ec4899' },
    ajuste_manual: { label: 'Ajuste manual', color: '#06b6d4' },
    modificacion_manual: { label: 'Modificación', color: '#94a3b8' }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99990,
        background: 'rgba(5, 10, 20, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          background: '#0f172a',
          borderLeft: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: 'column',
          color: '#f8fafc',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <History size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Historial y Notas
              </h3>
              <p style={{ margin: '1px 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>
                Módulo: <strong style={{ color: '#38bdf8' }}>{moduleName}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={fetchVersions}
              title="Refrescar versiones"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Banner de calibración de IA */}
        <div style={{
          padding: '0.75rem 1.25rem',
          background: 'rgba(129, 140, 248, 0.08)',
          borderBottom: '1px solid rgba(129, 140, 248, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.76rem',
          color: '#c7d2fe'
        }}>
          <Sparkles size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
          <span>
            Cada versión archiva los motivos de cambio del equipo para retroalimentar y afinar el harness de IA.
          </span>
        </div>

        {/* Contenido principal */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '0.85rem' }}>Consultando versiones archivadas...</div>
            </div>
          ) : error ? (
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              fontSize: '0.82rem'
            }}>
              {error}
            </div>
          ) : versions.length === 0 ? (
            <div style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              color: '#64748b',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '1px dashed rgba(255, 255, 255, 0.08)'
            }}>
              <History size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#94a3b8' }}>
                Sin versiones archivadas todavía
              </div>
              <p style={{ fontSize: '0.78rem', margin: '0.5rem 0 0', color: '#64748b' }}>
                Al regenerar con IA, bloquear o modificar el módulo documentando la razón, se guardará aquí una instantánea restaurable.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {versions.map((ver, idx) => {
                const tagInfo = TAG_NAMES[ver.reasonTag] || { label: ver.reasonTag, color: '#94a3b8' };
                return (
                  <div 
                    key={ver.versionId || idx}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: `${tagInfo.color}20`,
                        border: `1px solid ${tagInfo.color}40`,
                        color: tagInfo.color
                      }}>
                        {tagInfo.label}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {formatDate(ver.timestamp)}
                      </span>
                    </div>

                    {ver.userComment && (
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#cbd5e1',
                        background: 'rgba(0, 0, 0, 0.25)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        borderLeft: `3px solid ${tagInfo.color}`,
                        marginTop: '2px'
                      }}>
                        "{ver.userComment}"
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Autor: <strong style={{ color: '#94a3b8' }}>@{ver.author}</strong> ({ver.authorRole || 'alumno'})
                      </span>

                      {ver.snapshot && (
                        <button
                          onClick={() => handleRestore(ver)}
                          disabled={restoring}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            color: '#38bdf8',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <RotateCcw size={12} />
                          Restaurar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
