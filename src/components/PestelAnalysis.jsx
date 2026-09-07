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
      bgColor: 'rgba(79, 70, 229, 0.05)',
      borderColor: 'rgba(79, 70, 229, 0.25)',
      content: data.politico ? safeStr(data.politico) : '*Sin factores políticos redactados.*'
    },
    {
      key: 'economico',
      label: 'Económico',
      icon: DollarSign,
      color: '#10b981', // Emerald
      bgColor: 'rgba(16, 185, 129, 0.05)',
      borderColor: 'rgba(16, 185, 129, 0.25)',
      content: data.economico ? safeStr(data.economico) : '*Sin factores económicos redactados.*'
    },
    {
      key: 'social',
      label: 'Social',
      icon: Users,
      color: '#8b5cf6', // Purple
      bgColor: 'rgba(139, 92, 246, 0.05)',
      borderColor: 'rgba(139, 92, 246, 0.25)',
      content: data.social ? safeStr(data.social) : '*Sin factores sociales redactados.*'
    },
    {
      key: 'tecnologico',
      label: 'Tecnológico',
      icon: Cpu,
      color: '#06b6d4', // Cyan
      bgColor: 'rgba(6, 182, 212, 0.05)',
      borderColor: 'rgba(6, 182, 212, 0.25)',
      content: data.tecnologico ? safeStr(data.tecnologico) : '*Sin factores tecnológicos redactados.*'
    },
    {
      key: 'ecologico',
      label: 'Ecológico',
      icon: Leaf,
      color: '#84cc16', // Lime
      bgColor: 'rgba(132, 204, 22, 0.05)',
      borderColor: 'rgba(132, 204, 22, 0.25)',
      content: data.ecologico ? safeStr(data.ecologico) : '*Sin factores ecológicos redactados.*'
    },
    {
      key: 'legal',
      label: 'Legal',
      icon: Scale,
      color: '#ef4444', // Red
      bgColor: 'rgba(239, 68, 68, 0.05)',
      borderColor: 'rgba(239, 68, 68, 0.25)',
      content: data.legal ? safeStr(data.legal) : '*Sin factores legales redactados.*'
    }
  ];

  return (
    <div 
      className="pestel-grid-container"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.25rem',
        marginTop: '1.25rem',
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
              padding: '1.25rem 1.5rem',
              borderRadius: '14px',
              border: `1.5px solid ${item.borderColor}`,
              background: item.bgColor,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              transition: 'all 0.25s ease',
              textAlign: 'left',
              position: 'relative',
              minWidth: 0,
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            {/* Header de dimensión PESTEL */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: `1px solid ${item.borderColor}`, paddingBottom: '0.65rem' }}>
              <div 
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  background: `${item.color}15`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: `1px solid ${item.color}30`,
                  flexShrink: 0
                }}
              >
                <Icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: item.color, lineHeight: 1 }}>
                  {item.label[0]}
                </span>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {item.label}
                </h4>
              </div>
            </div>

            {/* Contenido formateado limpio */}
            <div 
              className="markdown-content pestel-text-container" 
              style={{ 
                fontSize: '0.88rem', 
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
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

      {/* Overrides de responsividad y medios impresos */}
      <style>{`
        @media (max-width: 900px) {
          .pestel-grid-container {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }
        @media print {
          .pestel-grid-container {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.5cm !important;
            display: grid !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0.5rem 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .pestel-card {
            background: #ffffff !important;
            color: #1e293b !important;
            border: 1.5px solid #cbd5e1 !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border-radius: 8px !important;
            padding: 0.8rem 1rem !important;
            min-height: auto !important;
            gap: 0.4rem !important;
          }
          .pestel-card svg {
            width: 15px !important;
            height: 15px !important;
          }
          .pestel-card .markdown-content {
            font-size: 0.8rem !important;
            line-height: 1.45 !important;
            color: #334155 !important;
          }
          .pestel-card h4 {
            color: #0f172a !important;
            font-size: 0.88rem !important;
          }
        }
      `}</style>
    </div>
  );
}
