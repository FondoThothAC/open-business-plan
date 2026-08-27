import { useRef, useState } from 'react';
import { usePlan } from '../context/PlanContext';
import { Upload, FileText, X, File, Loader2, Sparkles, Image, Mic, FileSpreadsheet } from 'lucide-react';
import { parseDocumentFile } from '../lib/documentParser';

export default function DocumentUploader({ compact = false, onClose = null }) {
  const { planData, updateConfig } = usePlan();
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const documents = planData.config?.documents || [];
  const groqKey = planData.config?.ai?.groqKey || '';

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsProcessing(true);
    const newDocs = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImg = /\.(png|jpe?g|webp|bmp)$/i.test(file.name);
      const isAud = /\.(mp3|wav|m4a|ogg|webm|aac)$/i.test(file.name);

      if (isImg) {
        setStatusMessage(`Analizando imagen con OCR: ${file.name}...`);
      } else if (isAud) {
        setStatusMessage(`Transcribiendo audio con Whisper: ${file.name}...`);
      } else {
        setStatusMessage(`Convirtiendo ${file.name} a Markdown (${i + 1}/${files.length})...`);
      }

      try {
        const parsedDoc = await parseDocumentFile(file, {
          groqKey,
          onProgress: (pct) => {
            setStatusMessage(`OCR ${file.name}: ${pct}%`);
          }
        });
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
      case 'image':
        return <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontWeight: 600 }}>🖼️ OCR ➔ MD</span>;
      case 'audio':
        return <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', fontWeight: 600 }}>🎙️ WHISPER ➔ MD</span>;
      case 'markdown':
        return <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.2)', color: '#34d399', fontWeight: 600 }}>MARKDOWN</span>;
      default:
        return <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(148, 163, 184, 0.2)', color: '#cbd5e1', fontWeight: 600 }}>TEXTO</span>;
    }
  };

  const getDocIcon = (format) => {
    switch (format) {
      case 'image':
        return <Image className="w-4 h-4" style={{ color: '#fbbf24' }} />;
      case 'audio':
        return <Mic className="w-4 h-4" style={{ color: '#c084fc' }} />;
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4" style={{ color: '#34d399' }} />;
      default:
        return <File className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />;
    }
  };

  const content = (
    <div className="glass-panel" style={{ padding: compact ? '1.5rem' : '2rem', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'var(--bg-panel)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText style={{ color: 'var(--accent-color)' }} size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: compact ? '1.1rem' : '1.25rem', margin: 0, fontWeight: 700 }}>Documentos & Contexto RAG</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Alimentación de memoria documental para los agentes de IA</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--accent-color)', background: 'rgba(99, 102, 241, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
            <Sparkles className="w-3.5 h-3.5" /> Markdown Universal
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
        Sube tus archivos de referencia (<strong>Word .docx, PDF, TXT, CSV, Imágenes OCR o Audios</strong>). El motor extraerá todo su contenido a <strong>Markdown</strong> y lo inyectará directamente al contexto de generación de todos los módulos.
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
              {statusMessage || 'Procesando y convirtiendo contenido...'}
            </p>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8" style={{ margin: '0 auto 0.75rem', color: 'var(--text-secondary)' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>
              Arrastra o haz clic para subir Documentos, Imágenes o Audios
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.7 }}>
              <strong>Documentos:</strong> .docx, .pdf, .txt, .md, .csv | <strong>Imágenes:</strong> .png, .jpg | <strong>Audios:</strong> .mp3, .m4a, .wav
            </p>
          </>
        )}

        <input 
          ref={fileInputRef}
          type="file" 
          accept=".docx,.doc,.pdf,.txt,.md,.csv,.text,.png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a,.ogg,.webm" 
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
            {documents.length} recurso{documents.length > 1 ? 's' : ''} cargado{documents.length > 1 ? 's' : ''} en memoria RAG
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
                {getDocIcon(doc.format)}
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
  );

  if (onClose) {
    return (
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
          {content}
        </div>
      </div>
    );
  }

  return content;
}
