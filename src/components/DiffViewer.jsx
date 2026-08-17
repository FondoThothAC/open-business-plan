import * as diff from 'diff';

export default function DiffViewer({ oldText, newText }) {
  if (oldText == null) oldText = '';
  if (newText == null) newText = '';

  const differences = diff.diffWordsWithSpace(oldText, newText);

  return (
    <div style={{
      whiteSpace: 'pre-wrap',
      fontFamily: 'var(--font-main)',
      fontSize: '0.9rem',
      lineHeight: '1.6',
      background: 'rgba(0,0,0,0.1)',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      color: 'var(--text-primary)'
    }}>
      {differences.map((part, index) => {
        if (part.added) {
          return (
            <ins key={index} style={{
              backgroundColor: 'rgba(34, 197, 94, 0.2)', // green-500 with opacity
              color: '#4ade80', // green-400
              textDecoration: 'underline',
              borderRadius: '2px',
              padding: '0 2px'
            }}>
              {part.value}
            </ins>
          );
        }
        if (part.removed) {
          return (
            <del key={index} style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)', // red-500 with opacity
              color: '#f87171', // red-400
              textDecoration: 'line-through',
              borderRadius: '2px',
              padding: '0 2px'
            }}>
              {part.value}
            </del>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </div>
  );
}
