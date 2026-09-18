import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PlanProvider, usePlan } from './context/PlanContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import SetupWizard from './components/SetupWizard';
import LoginScreen from './components/LoginScreen';

// Modules
import VistaPrevia from './modules/VistaPrevia';
import Configuracion from './modules/Configuracion';
import Anexos from './modules/Anexos';
import LeanCanvas from './modules/LeanCanvas';
import PitchDeck from './modules/PitchDeck';
import Anteproyecto from './components/Anteproyecto';
import DynamicModule from './components/DynamicModule';
import ErrorBoundary from './components/ErrorBoundary';

// [HDD] Primer arranque: si no hay setup en localStorage, mostramos el wizard
function AppContent() {
  const { planData = {}, updateConfig = () => {} } = usePlan() || {};
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    const theme = planData?.config?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, [planData?.config?.theme]);

  useEffect(() => {
    // [TDD] Solo mostrar wizard si no hay configuración previa
    const setup = localStorage.getItem('openplan_setup');
    if (!setup) setShowWizard(true);
  }, []);

  // [EDD] Evento de completion: aplica la config detectada al plan
  const handleWizardComplete = (config) => {
    if (config.model) updateConfig('ai', 'model', config.model);
    if (config.contextSize) updateConfig('ai', 'contextSize', config.contextSize);
    if (config.endpoint) updateConfig('ai', 'endpoint', config.endpoint);
    setShowWizard(false);
  };

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {showWizard && <SetupWizard onComplete={handleWizardComplete} />}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/semilla" replace />} />

          {/* Rutas Semánticas de Secciones Globales (con y sin slug) */}
          <Route path=":tipoDoc/semilla/:slug" element={<Anteproyecto />} />
          <Route path=":tipoDoc/semilla" element={<Anteproyecto />} />
          <Route path=":tipoDoc/vista-previa/:slug" element={<ErrorBoundary><VistaPrevia /></ErrorBoundary>} />
          <Route path=":tipoDoc/vista-previa" element={<ErrorBoundary><VistaPrevia /></ErrorBoundary>} />
          <Route path=":tipoDoc/lean-canvas/:slug" element={<LeanCanvas />} />
          <Route path=":tipoDoc/lean-canvas" element={<LeanCanvas />} />
          <Route path=":tipoDoc/pitch-deck/:slug" element={<PitchDeck />} />
          <Route path=":tipoDoc/pitch-deck" element={<PitchDeck />} />
          <Route path=":tipoDoc/anexos/:slug" element={<Anexos />} />
          <Route path=":tipoDoc/anexos" element={<Anexos />} />
          <Route path=":tipoDoc/configuracion/:slug" element={<Configuracion />} />
          <Route path=":tipoDoc/configuracion" element={<Configuracion />} />

          {/* Rutas Semánticas de Módulos (Opción A: /:tipoDoc/:modulo/:slug) */}
          <Route path=":tipoDoc/:pillarId/:moduleId/:slug" element={<ErrorBoundary><DynamicModule /></ErrorBoundary>} />
          <Route path=":tipoDoc/:moduleId/:slug" element={<ErrorBoundary><DynamicModule /></ErrorBoundary>} />
          <Route path=":tipoDoc/:moduleId" element={<ErrorBoundary><DynamicModule /></ErrorBoundary>} />

          {/* Rutas Clásicas Retrocompatibles */}
          <Route path="modulo/:pillarId/:moduleId" element={<ErrorBoundary><DynamicModule /></ErrorBoundary>} />
          <Route path="vista-previa" element={<ErrorBoundary><VistaPrevia /></ErrorBoundary>} />
          <Route path="preview" element={<Navigate to="/vista-previa" replace />} />
          <Route path="lean-canvas" element={<LeanCanvas />} />
          <Route path="pitch-deck" element={<PitchDeck />} />
          <Route path="semilla" element={<Anteproyecto />} />
          <Route path="anexos" element={<Anexos />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Guard de autenticación.
 * Muestra LoginScreen si no hay sesión activa.
 * Muestra spinner mientras se verifica el token almacenado.
 */
function AuthGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Mientras se verifica el JWT almacenado, mostrar spinner
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0e1a 0%, #141b2d 100%)',
        color: 'rgba(255,255,255,0.4)',
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.9rem',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '1.5rem',
          height: '1.5rem',
          border: '2px solid rgba(56, 189, 248, 0.3)',
          borderTop: '2px solid #38bdf8',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        Verificando sesión...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Sin sesión → mostrar login
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthGuard>
          <PlanProvider>
            <AppContent />
          </PlanProvider>
        </AuthGuard>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

