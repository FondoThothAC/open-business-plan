import { useRef } from 'react';
import { usePlan } from '../context/PlanContext';
import { Upload, FileText, X, File } from 'lucide-react';

export default function DocumentUploader() {
  const { planData, updateConfig } = usePlan();
  const fileInputRef = useRef(null);
  const documents = planData.config?.documents || [];

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      try {
        const text = await readFileAsText(file);
        const newDoc = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          text: text.substring(0, 10000), // Limitar a 10K caracteres por doc
          addedAt: new Date().toISOString()
        };
        
        const currentDocs = planData.config?.documents || [];
        updateConfig('documents', '', [...currentDocs, newDoc]);
      } catch (err) {
        console.error(`Error leyendo ${file.name}:`, err);
        alert(`No se pudo leer "${file.name}". Solo se soportan archivos de texto (.txt, .md, .csv).`);
      }
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const removeDocument = (docId) => {
    const currentDocs = planData.config?.documents || [];
    updateConfig('documents', '', currentDocs.filter(d => d.id !== docId));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <FileText style={{ color: 'var(--accent-color)' }} />
          <h2 style={{ fontSize: '1.25rem' }}>Documentos de Contexto</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Sube documentos (.txt, .md, .csv) que la IA usará como referencia adicional al generar contenido. 
          Ideal para investigaciones de mercado, datos financieros o notas del emprendedor.
        </p>

        {/* Upload Zone */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--border-color)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: 'var(--input-bg)'
          }}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-color)'; }}
          onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = 'var(--border-color)';
            const dt = e.dataTransfer;
            if (dt.files.length) {
              handleFileUpload({ target: { files: dt.files } });
            }
          }}
        >
          <Upload className="w-8 h-8" style={{ margin: '0 auto 0.75rem', color: 'var(--text-secondary)' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.7 }}>
            .txt, .md, .csv — Máximo 10,000 caracteres por documento
          </p>
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".txt,.md,.csv,.text" 
            multiple 
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </div>

        {/* Document List */}
        {documents.length > 0 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {documents.length} documento{documents.length > 1 ? 's' : ''} cargado{documents.length > 1 ? 's' : ''}
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
                    <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{doc.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {formatSize(doc.size)} — {doc.text.length.toLocaleString()} caracteres extraídos
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
