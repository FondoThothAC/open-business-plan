import React from 'react';
import { Shield, TrendingUp, AlertTriangle, AlertOctagon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function FodaMatrix({ data }) {
  if (!data) return null;

  const fodaItems = [
    {
      key: 'fortalezas',
      label: 'Fortalezas',
      icon: Shield,
      color: '#3b82f6', // Blue
      bgColor: 'rgba(59, 130, 246, 0.06)',
      borderColor: 'rgba(59, 130, 246, 0.25)',
      printBg: '#eff6ff',
      content: typeof data.fortalezas === 'string' ? data.fortalezas : (data.fortalezas ? JSON.stringify(data.fortalezas, null, 2) : '*Sin fortalezas redactadas aún.*')
    },
    {
      key: 'debilidades',
      label: 'Debilidades',
      icon: AlertTriangle,
      color: '#f59e0b', // Amber/Orange
      bgColor: 'rgba(245, 158, 11, 0.06)',
      borderColor: 'rgba(245, 158, 11, 0.25)',
      printBg: '#fffbeb',
      content: typeof data.debilidades === 'string' ? data.debilidades : (data.debilidades ? JSON.stringify(data.debilidades, null, 2) : '*Sin debilidades redactadas aún.*')
    },
    {
      key: 'oportunidades',
      label: 'Oportunidades',
      icon: TrendingUp,
      color: '#10b981', // Green
      bgColor: 'rgba(16, 185, 129, 0.06)',
      borderColor: 'rgba(16, 185, 129, 0.25)',
      printBg: '#ecfdf5',
      content: typeof data.oportunidades === 'string' ? data.oportunidades : (data.oportunidades ? JSON.stringify(data.oportunidades, null, 2) : '*Sin oportunidades redactadas aún.*')
    },
    {
      key: 'amenazas',
      label: 'Amenazas',
      icon: AlertOctagon,
      color: '#ef4444', // Red
      bgColor: 'rgba(239, 68, 68, 0.06)',
      borderColor: 'rgba(239, 68, 68, 0.25)',
      printBg: '#fef2f2',
      content: typeof data.amenazas === 'string' ? data.amenazas : (data.amenazas ? JSON.stringify(data.amenazas, null, 2) : '*Sin amenazas redactadas aún.*')
    }
  ];

  return (
    <div 
      className="foda-grid-container"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.5rem',
        marginTop: '1.5rem',
        marginBottom: '1.5rem',
        width: '100%'
      }}
    >
      {fodaItems.map((item) => {
        const Icon = item.icon;
        return (
          <div 
            key={item.key}
            className="foda-card glass-panel"
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              border: `1.5px solid ${item.borderColor}`,
              background: item.bgColor,
              boxShadow: `0 8px 30px ${item.bgColor.replace('0.06', '0.04')}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Soft decorative background circles */}
            <div 
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${item.color}15 0%, transparent 70%)`,
                pointerEvents: 'none'
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: `1px solid ${item.borderColor}`, paddingBottom: '0.75rem' }}>
              <div 
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  background: `${item.color}15`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: `1px solid ${item.color}25`
                }}
              >
                <Icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: item.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.label}
              </h4>
            </div>

            <div 
              className="markdown-content foda-text-container" 
              style={{ 
                fontSize: '0.9rem', 
                lineHeight: '1.6'
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.content}
              </ReactMarkdown>
            </div>
          </div>
        );
      })}

      {/* Styled overrides for print media */}
      <style>{`
        @media print {
          .foda-grid-container {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.5cm !important;
            display: grid !important;
          }
          .foda-card {
            background: white !important;
            color: #1e293b !important;
            border: 2px solid #cbd5e1 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            border-radius: 8px !important;
            padding: 1.25rem !important;
          }
          .foda-text-container {
            color: #334155 !important;
          }
          .foda-card h4 {
            color: #0f172a !important;
          }
        }
      `}</style>
    </div>
  );
}
