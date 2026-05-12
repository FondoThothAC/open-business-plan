import React from 'react';

export default function PitchDeck() {
  return (
    <div className="module-view">
      <div className="view-header">
        <div>
          <h1 className="view-title">Pitch Deck Inversionista</h1>
          <p className="text-secondary mt-1">Estructura ganadora para levantar capital.</p>
        </div>
      </div>
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', marginTop: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📽️</div>
        <h2>Próximamente: Presentador de Diapositivas</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '1rem auto' }}>
          Estamos diseñando un motor de generación de diapositivas exportables a PowerPoint y PDF 
          basado en el contenido de tu Plan Maestro.
        </p>
      </div>
    </div>
  );
}
