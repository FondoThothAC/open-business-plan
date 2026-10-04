import React, { useState } from 'react';
import { Presentation } from 'lucide-react';
import { downloadPitchDeck } from '../lib/pptxExportEngine';

/**
 * Botón para descargar el Pitch Deck del plan de negocios en formato PowerPoint (.pptx 16:9).
 * Diseñado conforme a los estándares institucionales de Fondos de Inversión.
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.planData - Datos completos del plan de negocios
 * @param {string} [props.filename] - Nombre de archivo personalizado
 */
export default function PptxExportButton({ planData = null, filename = null }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!planData) return;
    try {
      setIsExporting(true);
      await downloadPitchDeck(planData, filename);
    } catch (err) {
      console.error('[PptxExportButton] Error al exportar PowerPoint:', err);
      alert('Ocurrió un error al generar el Pitch Deck PPTX. Revise la consola del navegador.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className="btn"
      onClick={handleExport}
      disabled={isExporting || !planData}
      style={{
        height: '42px',
        background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '0 1rem',
        boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 600,
        cursor: isExporting ? 'wait' : 'pointer',
        transition: 'all 0.2s ease'
      }}
      title="Descargar presentación institucional (Pitch Deck) en formato PowerPoint (.pptx 16:9)"
    >
      <Presentation className="w-4 h-4" />
      <span>{isExporting ? 'Generando PPTX...' : 'Pitch Deck (.pptx)'}</span>
    </button>
  );
}
