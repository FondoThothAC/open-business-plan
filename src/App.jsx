import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PlanProvider, usePlan } from './context/PlanContext';
import Layout from './components/Layout';

// Modules
import VistaPrevia from './modules/VistaPrevia';
import Configuracion from './modules/Configuracion';
import Anexos from './modules/Anexos';
import LeanCanvas from './modules/LeanCanvas';
import PitchDeck from './modules/PitchDeck';
import Semilla from './modules/Semilla';
import DynamicModule from './components/DynamicModule';

function AppContent() {
  const { planData } = usePlan();
  
  useEffect(() => {
    const theme = planData.config?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, [planData.config?.theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/semilla" replace />} />
          <Route path="modulo/:pillarId/:moduleId" element={<DynamicModule />} />
          <Route path="vista-previa" element={<VistaPrevia />} />
          <Route path="preview" element={<Navigate to="/vista-previa" replace />} />
          <Route path="lean-canvas" element={<LeanCanvas />} />
          <Route path="pitch-deck" element={<PitchDeck />} />
          <Route path="semilla" element={<Semilla />} />
          <Route path="anexos" element={<Anexos />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <PlanProvider>
      <AppContent />
    </PlanProvider>
  );
}

export default App;
