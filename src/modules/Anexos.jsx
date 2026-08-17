import { usePlan } from '../context/PlanContext';
import { Trash2, Upload } from 'lucide-react';

export default function Anexos() {
  const { planData, addAnexo, removeAnexo, updateAnexo } = usePlan();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addAnexo({
          id: Date.now().toString(),
          name: file.name,
          url: reader.result,
          type: file.type,
          caption: ''
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="module-view">
      <div className="view-header">
        <div>
          <h1 className="view-title">Anexos y Evidencia</h1>
          <p className="text-secondary mt-1">Gestión de imágenes, diagramas y documentos adjuntos al plan.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {/* Upload Button */}
          <label className="anexo-card upload-card" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '150px', border: '2px dashed var(--border-color)', borderRadius: '12px', gap: '0.5rem' }}>
              <Upload className="w-8 h-8 text-secondary" />
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Subir Imagen</span>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
            </div>
          </label>

          {/* List Anexos */}
          {planData.config.anexos?.map((anexo) => (
            <div key={anexo.id} className="anexo-card glass-panel" style={{ 
              position: 'relative', 
              overflow: 'hidden', 
              padding: '0.75rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default'
            }}>
              <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.75rem', background: 'var(--input-bg)', position: 'relative', cursor: 'zoom-in' }}>
                <img src={anexo.url} alt={anexo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block', fontWeight: 'bold' }}>Pie de Foto / Título</label>
                <input 
                  type="text" 
                  placeholder="Ej. Logotipo oficial..." 
                  className="form-control" 
                  style={{ fontSize: '0.8rem', padding: '0.5rem', height: 'auto', background: 'rgba(255,255,255,0.05)' }}
                  value={anexo.caption || ''}
                  onChange={(e) => updateAnexo(anexo.id, { caption: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>ARCHIVO</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                    {anexo.name}
                  </span>
                </div>
                <button 
                  onClick={() => removeAnexo(anexo.id)}
                  className="btn-icon"
                  style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}
                  title="Eliminar anexo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
