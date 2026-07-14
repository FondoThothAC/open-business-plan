import React, { useState } from 'react';
import { Send, Trash2, MessageSquare, Clock } from 'lucide-react';

export default function FieldComments({ comments = [], onAddComment, onDeleteComment }) {
  const [newText, setNewText] = useState('');

  const handleAdd = () => {
    if (!newText.trim()) return;
    onAddComment(newText);
    setNewText('');
  };

  return (
    <div style={{
      marginTop: '1rem',
      padding: '1rem',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      animation: 'slideDown 0.2s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <MessageSquare className="w-4 h-4 text-secondary" />
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Comentarios y Notas ({comments.length})
        </h4>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', maxHeight: '250px', overflowY: 'auto' }}>
        {comments.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
            No hay comentarios aún. Escribe una nota para el equipo o para ti mismo.
          </p>
        ) : (
          comments.map(c => (
            <div key={c.id} style={{ 
              background: 'rgba(0,0,0,0.2)', 
              padding: '0.75rem', 
              borderRadius: '8px',
              borderLeft: '2px solid var(--accent-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                <strong style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>{c.author}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Clock className="w-3 h-3" />
                    {new Date(c.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  <button 
                    onClick={() => onDeleteComment(c.id)}
                    className="btn-icon" 
                    style={{ padding: '2px', color: '#ef4444' }}
                    title="Eliminar comentario"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                {c.text}
              </p>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Escribe un comentario..." 
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
        />
        <button className="btn btn-primary" onClick={handleAdd} style={{ padding: '0.5rem' }}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
