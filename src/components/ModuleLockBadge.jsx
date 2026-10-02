import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import ChangeReasonModal from './ChangeReasonModal';

/**
 * @file ModuleLockBadge.jsx
 * @description Indicador y conmutador visual de bloqueo para módulos de plan de negocio.
 * Evita que miembros del equipo o procesos automáticos de IA sobreescriban o regeneren
 * un módulo que ya fue terminado y verificado por los alumnos.
 * 
 * [UXDD] Diseño glassmorphism con estados activo/bloqueado claros y feedback inmediato.
 * [SDD] Protección de módulos en trabajo colaborativo multi-alumno.
 */
export default function ModuleLockBadge({
  lockState = { locked: false },
  moduleKey,
  moduleName = 'Módulo',
  onToggleLock,
  readOnly = false
}) {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingAction, setPendingAction] = useState('bloquear'); // 'bloquear' | 'desbloquear'

  const isLocked = Boolean(lockState?.locked);

  const handleClick = () => {
    if (readOnly) return;
    if (isLocked) {
      setPendingAction('desbloquear');
      setShowReasonModal(true);
    } else {
      setPendingAction('bloquear');
      setShowReasonModal(true);
    }
  };

  const handleConfirmAction = ({ reasonTag, userComment }) => {
    if (onToggleLock) {
      const willLock = pendingAction === 'bloquear';
      onToggleLock(moduleKey, willLock, userComment || reasonTag);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          onClick={handleClick}
          disabled={readOnly}
          title={
            isLocked
              ? `Módulo bloqueado por @${lockState.lockedBy || 'usuario'} (${formatTime(lockState.lockedAt)}). Clic para desbloquear.`
              : 'Módulo desbloqueado. Clic para bloquear y proteger contra cambios accidentales.'
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: readOnly ? 'default' : 'pointer',
            border: isLocked
              ? '1px solid rgba(245, 158, 11, 0.4)'
              : '1px solid rgba(255, 255, 255, 0.12)',
            background: isLocked
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(217, 119, 6, 0.08))'
              : 'rgba(255, 255, 255, 0.04)',
            color: isLocked ? '#fbbf24' : '#94a3b8',
            transition: 'all 0.2s ease',
            boxShadow: isLocked ? '0 0 12px rgba(245, 158, 11, 0.2)' : 'none'
          }}
        >
          {isLocked ? (
            <>
              <Lock size={13} style={{ color: '#fbbf24' }} />
              <span>Bloqueado</span>
              {lockState.lockedBy && (
                <span style={{ opacity: 0.8, fontSize: '0.68rem', fontWeight: 500 }}>
                  (@{lockState.lockedBy})
                </span>
              )}
            </>
          ) : (
            <>
              <Unlock size={13} />
              <span>Abierto</span>
            </>
          )}
        </button>
      </div>

      <ChangeReasonModal
        isOpen={showReasonModal}
        onClose={() => setShowReasonModal(false)}
        onConfirm={handleConfirmAction}
        moduleName={moduleName}
        actionType={pendingAction === 'bloquear' ? 'modificacion' : 'desbloquear'}
      />
    </>
  );
}
