import { useRef, useState } from 'react';
import { usePlan } from '../context/PlanContext';
import { Upload, FileText, X, File, Loader2, Sparkles } from 'lucide-react';
import { parseDocumentFile } from '../lib/documentParser';

export default function DocumentUploader() {
  const { planData, updateConfig } = usePlan();
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const documents = planData.config?.documents || [];

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsProcessing(true);
    const newDocs = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setStatusMessage(`Convirtiendo ${file.name} a Markdown (${i + 1}/${files.length})...`);
      try {
        const parsedDoc = await parseDocumentFile(file);
        newDocs.push(parsedDoc);
      } catch (err) {
        console.error(`Error procesando ${file.name}:`, err);
        alert(`No se pudo procesar "${file.name}": ${err.message || 'Error desconocido'}`);
      }
    }

    if (newDocs.length > 0) {
      const currentDocs = planData.config?.documents || [];
      updateConfig('documents', '', [...currentDocs, ...newDocs]);
    }

    setIsProcessing(false);
    setStatusMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeDocument = (docId) => {
    const currentDocs = planData.config?.documents || [];
    updateConfig('documents', '', currentDocs.filter(d => d.id !== docId));
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFormatBadge = (format) => {
    switch (format) {
      case 'docx':
        return <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontWeight: 600 }}>DOCX ➔ MD</span>;
      case 'pdf':
        return <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 600 }}>PDF ➔ MD</span>;
      case 'markdown':
        return <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 600 }}>MARKDOWN</span>;
      default:
        return <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(148, 163, 184, 0.2)', color: '#cbd5e1', fontWeight: 600 }}>TEXTO</span>;
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText style={{ color: 'var(--accent-color)' }} />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Documentos de Contexto (RAG)</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--accent-color)' }}>
            <Sparkles className="w-3.5 h-3.5" /> Auto-Conversión a Markdown
          </div>
        </div>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Sube tus archivos de referencia (<strong>.docx, .pdf, .md, .txt, .csv</strong>). El sistema los convertirá automáticamente a formato <strong>Markdown (.md)</strong> estructurado preservando títulos y tablas para asistir al motor de IA en la generación de módulos.
        </p>

        {/* Upload Zone */}
        <div 
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--border-color)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            cursor: isProcessing ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
            background: 'var(--input-bg)',
            opacity: isProcessing ? 0.7 : 1
          }}
          onDragOver={(e) => { e.preventDefault(); if (!isProcessing) e.currentTarget.style.borderColor = 'var(--accent-color)'; }}
          onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = 'var(--border-color)';
            if (isProcessing) return;
            const dt = e.dataTransfer;
            if (dt.files.length) {
              handleFileUpload({ target: { files: dt.files } });
            }
          }}
        >
          {isProcessing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-color)', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: '600' }}>
                {statusMessage || 'Convirtiendo y procesando documentos...'}
              </p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8" style={{ margin: '0 auto 0.75rem', color: 'var(--text-secondary)' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>
                Arrastra aquí tus archivos Word (.docx), PDF (.pdf) o Markdown (.md, .txt)
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.7 }}>
                Formatos soportados: <strong>.docx, .pdf, .md, .txt, .csv</strong> — Conversión instantánea
              </p>
            </>
          )}

          <input 
            ref={fileInputRef}
            type="file" 
            accept=".docx,.doc,.pdf,.txt,.md,.csv,.text" 
            multiple 
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
        </div>

        {/* Document List */}
        {documents.length > 0 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {documents.length} documento{documents.length > 1 ? 's' : ''} cargado{documents.length > 1 ? 's' : ''} en memoria RAG
            </div>
            {documents.map(doc => (
              <div 
                key={doc.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'var(--input-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <File className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{doc.name}</span>
                      {getFormatBadge(doc.format)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {formatSize(doc.size)} — {doc.text?.length?.toLocaleString() || 0} caracteres extraídos a Markdown
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => removeDocument(doc.id)}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: 'var(--danger-color)',
                    padding: '4px'
                  }}
                  title="Eliminar documento"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
