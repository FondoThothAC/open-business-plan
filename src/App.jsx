import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PlanProvider, usePlan } from './context/PlanContext';
import Layout from './components/Layout';
import SetupWizard from './components/SetupWizard';

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
  const { planData, updateConfig } = usePlan();
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    const theme = planData.config?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, [planData.config?.theme]);

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

function App() {
  return (
    <ErrorBoundary>
      <PlanProvider>
        <AppContent />
      </PlanProvider>
    </ErrorBoundary>
  );
}

export default App;

