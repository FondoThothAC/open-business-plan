import React from 'react';
import { Building, DollarSign, Users, Cpu, Leaf, Scale } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { safeStr } from '../utils/formatters';

export default function PestelAnalysis({ data }) {
  if (!data) return null;

  const pestelItems = [
    {
      key: 'politico',
      label: 'Político',
      icon: Building,
      color: '#4f46e5', // Indigo
      bgColor: 'rgba(79, 70, 229, 0.06)',
      borderColor: 'rgba(79, 70, 229, 0.2)',
      content: data.politico ? safeStr(data.politico) : '*Sin factores políticos redactados.*'
    },
    {
      key: 'economico',
      label: 'Económico',
      icon: DollarSign,
      color: '#10b981', // Emerald
      bgColor: 'rgba(16, 185, 129, 0.06)',
      borderColor: 'rgba(16, 185, 129, 0.2)',
      content: data.economico ? safeStr(data.economico) : '*Sin factores económicos redactados.*'
    },
    {
      key: 'social',
      label: 'Social',
      icon: Users,
      color: '#8b5cf6', // Purple
      bgColor: 'rgba(139, 92, 246, 0.06)',
      borderColor: 'rgba(139, 92, 246, 0.2)',
      content: data.social ? safeStr(data.social) : '*Sin factores sociales redactados.*'
    },
    {
      key: 'tecnologico',
      label: 'Tecnológico',
      icon: Cpu,
      color: '#06b6d4', // Cyan
      bgColor: 'rgba(6, 182, 212, 0.06)',
      borderColor: 'rgba(6, 182, 212, 0.2)',
      content: data.tecnologico ? safeStr(data.tecnologico) : '*Sin factores tecnológicos redactados.*'
    },
    {
      key: 'ecologico',
      label: 'Ecológico',
      icon: Leaf,
      color: '#84cc16', // Lime
      bgColor: 'rgba(132, 204, 22, 0.06)',
      borderColor: 'rgba(132, 204, 22, 0.2)',
      content: data.ecologico ? safeStr(data.ecologico) : '*Sin factores ecológicos redactados.*'
    },
    {
      key: 'legal',
      label: 'Legal',
      icon: Scale,
      color: '#ef4444', // Red
      bgColor: 'rgba(239, 68, 68, 0.06)',
      borderColor: 'rgba(239, 68, 68, 0.2)',
      content: data.legal ? safeStr(data.legal) : '*Sin factores legales redactados.*'
    }
  ];

  return (
    <div 
      className="pestel-grid-container"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
        marginTop: '1.5rem',
        marginBottom: '1.5rem',
        width: '100%',
        alignItems: 'stretch'
      }}
    >
      {pestelItems.map((item) => {
        const Icon = item.icon;
        return (
          <div 
            key={item.key}
            className="pestel-card glass-panel"
            style={{
              padding: '1.25rem 1rem',
              borderRadius: '16px',
              border: `1.5px solid ${item.borderColor}`,
              background: item.bgColor,
              boxShadow: `0 8px 30px ${item.bgColor.replace('0.06', '0.03')}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              transition: 'all 0.3s ease',
              textAlign: 'center',
              position: 'relative',
              minWidth: 0,
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            {/* Top Icon Circle */}
            <div 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: `${item.color}15`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto',
                border: `1px solid ${item.color}25`
              }}
            >
              <Icon className="w-5 h-5" style={{ color: item.color }} />
            </div>

            {/* Title / Dimension Letter */}
            <div style={{ borderBottom: `1px solid ${item.borderColor}`, paddingBottom: '0.5rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: item.color, opacity: 0.85, lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                {item.label[0]}
              </div>
              <h4 style={{ margin: '4px 0 0 0', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.label}
              </h4>
            </div>

            {/* Markdown Text Area */}
            <div 
              className="markdown-content pestel-text-container" 
              style={{ 
                fontSize: '0.8rem', 
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                textAlign: 'left',
                flex: 1
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.content}
              </ReactMarkdown>
            </div>
          </div>
        );
      })}

      {/* Styled overrides for responsiveness and print media */}
      <style>{`
        @media (max-width: 1400px) {
          .pestel-grid-container {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 1rem !important;
          }
        }
        @media (max-width: 768px) {
          .pestel-grid-container {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
        }
        @media print {
          .pestel-grid-container {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 0.5cm !important;
            display: grid !important;
          }
          .pestel-card {
            background: white !important;
            color: #1e293b !important;
            border: 2px solid #cbd5e1 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            border-radius: 8px !important;
            padding: 1rem 0.5rem !important;
          }
          .pestel-text-container {
            color: #475569 !important;
          }
          .pestel-card h4 {
            color: #0f172a !important;
          }
        }
      `}</style>
    </div>
  );
}
