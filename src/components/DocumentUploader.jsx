import { useRef, useState, useMemo } from 'react';
import { usePlan } from '../context/PlanContext';
import { 
  Upload, FileText, X, File, Loader2, Sparkles, Image, Mic, 
  FileSpreadsheet, Folder, FolderPlus, FolderOpen, MapPin, 
  Paperclip, Eye, Search, Filter 
} from 'lucide-react';
import { parseDocumentFile } from '../lib/documentParser';

// Definición de carpetas temáticas canónicas de CAFES y OBP
const CANONICAL_FOLDERS = [
  { id: 'all', name: 'Todas las Carpetas', icon: Folder, color: '#6366f1' },
  { id: 'entrevistas', name: 'Entrevistas & Diagnóstico', icon: Mic, color: '#c084fc' },
  { id: 'calculos', name: 'Cálculos & Finanzas', icon: FileSpreadsheet, color: '#34d399' },
  { id: 'inegi', name: 'INEGI & Mercado', icon: MapPin, color: '#38bdf8' },
  { id: 'anexos', name: 'Anexos & Evidencias', icon: Paperclip, color: '#fbbf24' },
  { id: 'general', name: 'General / Otros', icon: File, color: '#94a3b8' }
];

export default function DocumentUploader({ compact = false, onClose = null }) {
  const { planData, updateConfig } = usePlan();
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  
  const [activeFolder, setActiveFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const documents = planData.config?.documents || [];
  const groqKey = planData.config?.ai?.groqKey || '';

  // Obtener todas las carpetas disponibles (canónicas + personalizadas detectadas en documentos)
  const availableFolders = useMemo(() => {
    const customFolderIds = new Set();
    documents.forEach((d) => {
      const f = d.folder ? String(d.folder).trim().toLowerCase() : 'general';
      if (!CANONICAL_FOLDERS.some((cf) => cf.id === f)) {
        customFolderIds.add(f);
      }
    });

    const list = [...CANONICAL_FOLDERS];
    customFolderIds.forEach((id) => {
      list.push({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' '),
        icon: FolderOpen,
        color: '#e2e8f0'
      });
    });
    return list;
  }, [documents]);

  // Conteo de documentos por carpeta
  const folderCounts = useMemo(() => {
    const counts = { all: documents.length };
    availableFolders.forEach((f) => {
      if (f.id !== 'all') counts[f.id] = 0;
    });

    documents.forEach((d) => {
      const f = d.folder ? String(d.folder).trim().toLowerCase() : 'general';
      counts[f] = (counts[f] || 0) + 1;
    });
    return counts;
  }, [documents, availableFolders]);

  // Documentos filtrados por carpeta activa y búsqueda
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const docFolder = doc.folder ? String(doc.folder).trim().toLowerCase() : 'general';
      const matchFolder = activeFolder === 'all' || docFolder === activeFolder;
      const matchSearch = !searchQuery.trim() || 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.text && doc.text.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchFolder && matchSearch;
    });
  }, [documents, activeFolder, searchQuery]);

  // Procesamiento de carga de archivos (individuales, múltiples o por carpeta completa)
  const handleProcessFiles = async (filesList, overrideFolder = null) => {
    const files = Array.from(filesList || []);
    if (!files.length) return;

    setIsProcessing(true);
    const newDocs = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImg = /\.(png|jpe?g|webp|bmp)$/i.test(file.name);
      const isAud = /\.(mp3|wav|m4a|ogg|webm|aac)$/i.test(file.name);

      // Detección automática de carpeta por ruta relativa (subida de carpeta completa)
      let detectedFolder = overrideFolder || (activeFolder !== 'all' ? activeFolder : 'general');
      if (file.webkitRelativePath) {
        const pathParts = file.webkitRelativePath.split('/');
        if (pathParts.length > 1) {
          const rootFolder = pathParts[0].toLowerCase().trim().replace(/\s+/g, '_');
          // Mapear carpetas de nombre común a las canónicas
          if (rootFolder.includes('entrevista') || rootFolder.includes('audio')) {
            detectedFolder = 'entrevistas';
          } else if (rootFolder.includes('calculo') || rootFolder.includes('excel') || rootFolder.includes('financier')) {
            detectedFolder = 'calculos';
          } else if (rootFolder.includes('inegi') || rootFolder.includes('censo') || rootFolder.includes('denue')) {
            detectedFolder = 'inegi';
          } else if (rootFolder.includes('anexo') || rootFolder.includes('evidencia') || rootFolder.includes('foto')) {
            detectedFolder = 'anexos';
          } else {
            detectedFolder = rootFolder;
          }
        }
      }

      if (isImg) {
        setStatusMessage(`Analizando imagen con OCR (${i + 1}/${files.length}): ${file.name}...`);
      } else if (isAud) {
        setStatusMessage(`Transcribiendo audio con Whisper (${i + 1}/${files.length}): ${file.name}...`);
      } else {
        setStatusMessage(`Convirtiendo ${file.name} a Markdown (${i + 1}/${files.length})...`);
      }

      try {
        const parsedDoc = await parseDocumentFile(file, {
          groqKey,
          onProgress: (pct) => {
            if (isAud) {
              setStatusMessage(`Transcribiendo ${file.name}: ${pct}% (Whisper)`);
            } else {
              setStatusMessage(`OCR ${file.name}: ${pct}%`);
            }
          }
        });
        
        newDocs.push({
          ...parsedDoc,
          folder: detectedFolder,
          classification: 'project_evidence',
          ownerProjectId: planData.config?.projectId || '',
          retrievedAt: new Date().toISOString()
        });
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
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const removeDocument = (docId) => {
    const currentDocs = planData.config?.documents || [];
    updateConfig('documents', '', currentDocs.filter((d) => d.id !== docId));
  };

  const setDocumentFolder = (docId, newFolder) => {
    const currentDocs = planData.config?.documents || [];
    updateConfig('documents', '', currentDocs.map((doc) => doc.id === docId ? { ...doc, folder: newFolder } : doc));
  };

  const setClassification = (docId, classification) => {
    updateConfig('documents', '', documents.map((doc) => doc.id === docId ? { ...doc, classification } : doc));
  };

  const handleCreateFolder = (e) => {
    e.preventDefault();
    const clean = newFolderName.trim().toLowerCase().replace(/\s+/g, '_');
    if (!clean) return;
    setActiveFolder(clean);
    setIsCreatingFolder(false);
    setNewFolderName('');
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
        return <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 600 }}>MARKDOWN</span>;
      case 'csv':
        return <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 600 }}>CSV / EXCEL</span>;
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
    <div className="glass-panel" style={{ padding: compact ? '1.25rem' : '1.75rem', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'var(--bg-panel)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderOpen style={{ color: 'var(--accent-color)' }} size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: compact ? '1.15rem' : '1.3rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
              Gestor de Documentos & Carpetas RAG
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Organización documental por carpetas de evidencia para los agentes de IA
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--accent-color)', background: 'rgba(99, 102, 241, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
            <Sparkles className="w-3.5 h-3.5" /> RAG Multi-Carpeta
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
              title="Cerrar modal"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Carpetas Tabs Selector */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Carpetas del Proyecto
          </span>
          <button
            onClick={() => setIsCreatingFolder(!isCreatingFolder)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: isCreatingFolder ? 'var(--accent-color)' : 'var(--input-bg)',
              color: isCreatingFolder ? '#fff' : 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <FolderPlus size={13} />
            <span>Nueva Carpeta</span>
          </button>
        </div>

        {/* Formulario de nueva carpeta */}
        {isCreatingFolder && (
          <form onSubmit={handleCreateFolder} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem', background: 'var(--input-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <input
              type="text"
              placeholder="Nombre de la carpeta (ej. cotizaciones_maquinaria)..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-primary)' }}
              autoFocus
            />
            <button
              type="submit"
              style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Crear
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingFolder(false)}
              style={{ padding: '6px 10px', fontSize: '0.8rem', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
            >
              Cancelar
            </button>
          </form>
        )}

        {/* Píldoras de Carpetas */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
          {availableFolders.map((folder) => {
            const Icon = folder.icon;
            const count = folderCounts[folder.id] || 0;
            const isActive = activeFolder === folder.id;

            return (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: isActive ? `1.5px solid ${folder.color}` : '1px solid var(--border-color)',
                  background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'var(--input-bg)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} style={{ color: folder.color }} />
                <span>{folder.name}</span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '1px 6px', 
                  borderRadius: '10px', 
                  background: isActive ? folder.color : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 600
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Zona de Carga con Doble Botón: Archivos individuales o Carpeta Completa */}
      <div 
        style={{
          border: '2px dashed var(--border-color)',
          borderRadius: '14px',
          padding: '1.5rem',
          textAlign: 'center',
          background: 'var(--input-bg)',
          marginBottom: '1.25rem',
          position: 'relative'
        }}
        onDragOver={(e) => { e.preventDefault(); if (!isProcessing) e.currentTarget.style.borderColor = 'var(--accent-color)'; }}
        onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = 'var(--border-color)';
          if (isProcessing) return;
          const dt = e.dataTransfer;
          if (dt.files.length) {
            handleProcessFiles(dt.files);
          }
        }}
      >
        {isProcessing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-color)', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
              {statusMessage || 'Procesando documentos y convirtiendo a Markdown...'}
            </p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
              </div>
            </div>

            <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.4rem 0' }}>
              Arrastra tus archivos aquí o utiliza las opciones de carga directa
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0 0 1rem 0' }}>
              Destino activo: <strong style={{ color: 'var(--accent-color)' }}>
                {availableFolders.find((f) => f.id === activeFolder)?.name || activeFolder}
              </strong>
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Botón 1: Subir Archivos */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'var(--accent-color)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)'
                }}
              >
                <Upload size={15} />
                <span>Subir Archivos Sueltos</span>
              </button>

              {/* Botón 2: Subir Carpeta Completa */}
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <FolderOpen size={15} style={{ color: '#38bdf8' }} />
                <span>Subir Carpeta Completa</span>
              </button>
            </div>

            {/* Inputs Ocultos */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".docx,.doc,.pdf,.txt,.md,.csv,.text,.png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a,.ogg,.webm" 
              multiple 
              style={{ display: 'none' }}
              onChange={(e) => handleProcessFiles(e.target.files)}
              disabled={isProcessing}
            />

            <input 
              ref={folderInputRef}
              type="file" 
              webkitdirectory=""
              directory=""
              multiple 
              style={{ display: 'none' }}
              onChange={(e) => handleProcessFiles(e.target.files)}
              disabled={isProcessing}
            />
          </div>
        )}
      </div>

      {/* Buscador y Filtros */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o contenido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              fontSize: '0.78rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--input-bg)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          Mostrando {filteredDocuments.length} de {documents.length} documento{documents.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Lista de Documentos en la Carpeta */}
      {filteredDocuments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
          {filteredDocuments.map((doc) => {
            const currentFolder = doc.folder || 'general';
            const folderObj = availableFolders.find((f) => f.id === currentFolder) || { name: currentFolder, color: '#94a3b8' };

            return (
              <div 
                key={doc.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'var(--input-bg)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                  {getDocIcon(doc.format)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }} title={doc.name}>
                        {doc.name}
                      </span>
                      {getFormatBadge(doc.format)}
                      <span style={{ 
                        fontSize: '0.65rem', 
                        padding: '1px 6px', 
                        borderRadius: '4px', 
                        background: 'rgba(255,255,255,0.06)', 
                        color: folderObj.color,
                        border: `1px solid ${folderObj.color}40`,
                        fontWeight: 600
                      }}>
                        📁 {folderObj.name}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span>{formatSize(doc.size)}</span>
                      <span>•</span>
                      <span>{doc.text?.length?.toLocaleString() || 0} caracteres extraídos</span>
                      <span>•</span>
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--accent-color)',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          padding: 0,
                          textDecoration: 'underline'
                        }}
                      >
                        <Eye size={12} /> Ver texto
                      </button>
                    </div>

                    {/* Controles de Clasificación y Carpeta */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>Carpeta:</span>
                        <select
                          value={currentFolder}
                          onChange={(e) => setDocumentFolder(doc.id, e.target.value)}
                          style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-primary)' }}
                          aria-label={`Cambiar carpeta de ${doc.name}`}
                        >
                          {availableFolders.filter((f) => f.id !== 'all').map((f) => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      </label>

                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>Tipo:</span>
                        <select
                          value={doc.classification || 'method_reference'}
                          onChange={(e) => setClassification(doc.id, e.target.value)}
                          style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-primary)' }}
                          aria-label={`Clasificación de ${doc.name}`}
                        >
                          <option value="project_evidence">Evidencia de este proyecto</option>
                          <option value="method_reference">Referencia metodológica</option>
                          <option value="other_project_example">Ejemplo de otro proyecto</option>
                        </select>
                      </label>
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
                    padding: '6px',
                    borderRadius: '6px'
                  }}
                  title="Eliminar documento"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--input-bg)', borderRadius: '10px', color: 'var(--text-secondary)' }}>
          <Folder size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            {searchQuery 
              ? `No se encontraron documentos que coincidan con "${searchQuery}".` 
              : `La carpeta "${availableFolders.find((f) => f.id === activeFolder)?.name || activeFolder}" está vacía.`}
          </p>
        </div>
      )}

      {/* Modal de Previsualización de Texto Markdown */}
      {previewDoc && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setPreviewDoc(null); }}
        >
          <div style={{ width: '100%', maxWidth: '750px', maxHeight: '85vh', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {previewDoc.name}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {previewDoc.folder ? `Carpeta: ${previewDoc.folder} • ` : ''}{previewDoc.text?.length?.toLocaleString() || 0} caracteres
                </span>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {previewDoc.text || 'Sin texto extraído.'}
            </div>
          </div>
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
        <div style={{ width: '100%', maxWidth: '850px', maxHeight: '92vh', overflowY: 'auto' }}>
          {content}
        </div>
      </div>
    );
  }

  return content;
}
