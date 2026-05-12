import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
// import * as pdfjsLib from 'pdfjs-dist';
// import Tesseract from 'tesseract.js';

export default function PdfOcrReader({ onTextExtracted }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const processPDF = async (file) => {
    setIsProcessing(true);
    setProgress(0);
    setStatus('Cargando motor OCR y PDF...');
    setError('');

    try {
      // Lazy load to prevent Vite crashes if user hasn't installed them yet
      const pdfjsLib = await import('pdfjs-dist');
      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      
      const Tesseract = (await import('tesseract.js')).default;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const totalPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setStatus(`Procesando página ${pageNum} de ${totalPages}...`);
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Scale up for better OCR
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        // Perform OCR on canvas
        setStatus(`Escaneando página ${pageNum} con Inteligencia Artificial...`);
        const { data: { text } } = await Tesseract.recognize(
          canvas,
          'spa', // Spanish language model
          {
            logger: m => {
              if (m.status === 'recognizing text') {
                const baseProgress = ((pageNum - 1) / totalPages) * 100;
                const pageProgress = m.progress * (100 / totalPages);
                setProgress(Math.round(baseProgress + pageProgress));
              }
            }
          }
        );

        fullText += `--- Página ${pageNum} ---\n${text}\n\n`;
      }

      setStatus('Extracción completada con éxito.');
      setProgress(100);
      if (onTextExtracted) {
        onTextExtracted(fullText);
      }
      
      setTimeout(() => {
        setIsProcessing(false);
        setStatus('');
      }, 3000);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al procesar el PDF. Asegúrate de haber ejecutado: npm install pdfjs-dist tesseract.js');
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      processPDF(file);
    } else if (file) {
      setError('Por favor sube un archivo PDF válido.');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', border: '1px dashed var(--accent-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
          <FileText style={{ color: 'var(--accent-color)' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Carga de Contexto Externo (PDF OCR)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Sube documentos (como archivos del BID con imágenes). El sistema "leerá" el contenido visual y lo agregará como contexto.
          </p>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {!isProcessing ? (
        <button 
          className="btn btn-primary" 
          onClick={() => fileInputRef.current?.click()}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Upload className="w-4 h-4" />
          <span>Seleccionar archivo PDF</span>
        </button>
      ) : (
        <div style={{ background: 'var(--bg-panel)', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Loader2 className="w-4 h-4 animate-spin" /> {status}
            </span>
            <span style={{ fontWeight: '600' }}>{progress}%</span>
          </div>
          <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-color)', transition: 'width 0.2s ease' }} />
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <AlertCircle className="w-4 h-4" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}
      
      {progress === 100 && !error && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 className="w-4 h-4" />
          <span>Texto extraído e inyectado exitosamente al contexto.</span>
        </div>
      )}
    </div>
  );
}
