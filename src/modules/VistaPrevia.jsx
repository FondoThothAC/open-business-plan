import React, { useEffect, useMemo, useState } from 'react';
import { usePlan } from '../context/PlanContext';
import { Printer, MessageSquare, Sparkles, Wand2, Bot, BrainCircuit, RefreshCw, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { refactorFieldWithComments } from '../lib/ai';
import FinancialCharts, { PrintableFinancialReports } from '../components/FinancialCharts';
import MermaidViewer from '../components/MermaidViewer';
import FodaMatrix from '../components/FodaMatrix';
import PestelAnalysis from '../components/PestelAnalysis';
import TamSamSom from '../components/TamSamSom';
import BusinessModelCanvas from '../components/BusinessModelCanvas';
import HubspotBuyerPersona from '../components/HubspotBuyerPersona';
import PresupuestoEmpresa from '../components/PresupuestoEmpresa';
import InegiMap from '../components/InegiMap';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { safeStr } from '../utils/formatters';
import { FRAMEWORKS } from '../config/frameworks';
import { calculateFinancialProjections } from '../lib/finanzas/financial-calculations';
import DiffReviewModal from '../components/DiffReviewModal';
import ArbolProblemasObjetivos from '../components/ArbolProblemasObjetivos';
import XMatrixHoshinKanri from '../components/XMatrixHoshinKanri';
import AmoebaStructureViewer from '../components/AmoebaStructureViewer';

function readJson(raw, fallback) {
  if (!raw || typeof raw !== 'string') return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(fallback) ? (Array.isArray(parsed) ? parsed : fallback) : (parsed || fallback);
  } catch {
    return fallback;
  }
}

function isVariableOpex(row) {
  if (!row || typeof row !== 'object') return false;
  const label = `${row.categoria || ''} ${row.tipo || ''} ${row.concepto || ''}`.toLowerCase();
  return label.includes('variable') || label.includes('comercial') || label.includes('venta') || label.includes('comisión');
}

export function parseNumericAmount(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const str = String(val).trim();
  
  const millonMatch = str.match(/(\d+(?:\.\d+)?)\s*millon(?:es)?/i);
  if (millonMatch) {
    const num = parseFloat(millonMatch[1]);
    if (!isNaN(num)) return num * 1000000;
  }
  
  const currencyMatch = str.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+)/);
  if (currencyMatch) {
    const num = parseFloat(currencyMatch[1].replace(/,/g, ''));
    if (!isNaN(num)) return num;
  }

  const clean = str.replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? fallback : parsed;
}

// --- SUBCOMPONENTE: BENCHMARKING TABLE ---
function BenchmarkingTable({ data }) {
  const comparativaData = data?.comparativa || '';
  const matrizData = data?.matriz || '';

  // Parse comparativa into readable text
  let comparativa = '';
  if (typeof comparativaData === 'string') {
    comparativa = comparativaData;
  } else if (typeof comparativaData === 'object' && comparativaData !== null) {
    comparativa = Object.entries(comparativaData).map(([k, v]) => {
      const valStr = Array.isArray(v) ? v.join(' ') : (typeof v === 'object' && v !== null ? Object.values(v).join(' ') : String(v));
      return `${k.replace(/_/g, ' ').toUpperCase()}: ${valStr}`;
    }).join(' | ');
  }

  // Parse matriz
  let finalMatrix = [];
  if (matrizData?.metricas_operativas && Array.isArray(matrizData.metricas_operativas)) {
    finalMatrix = matrizData.metricas_operativas.map(m => ({
      criterio: m.metrica || m.criterio || m.factor || '',
      nosotros: m.nuestro_modelo || m.nosotros || m.propuesta || '',
      tradicional: m.comparador || m.ferreterias_tradicionales || m.tradicional || 'Estándar',
      cadenas: m.grandes_cadenas || m.cadenas || 'Generalizado'
    })).filter(m => m.criterio);
  } else if (typeof matrizData === 'string') {
    const items = (matrizData || '').split(',').map(s => s.trim()).filter(Boolean);
    finalMatrix = items.map(item => {
      const parts = item.split(':');
      return {
        criterio: parts[0]?.trim() || '',
        nosotros: parts.slice(1).join(':')?.trim() || '',
        tradicional: 'Estándar',
        cadenas: 'Stock generalizado'
      };
    }).filter(d => d.criterio);
  }

  if (finalMatrix.length === 0) {
    finalMatrix = [
      { criterio: 'Diferenciación Técnica', nosotros: 'Especialización técnica y rápida respuesta', tradicional: 'Estándar, reactivo', cadenas: 'Estandarizado, sin personalización' },
      { criterio: 'Velocidad de Entrega', nosotros: 'Inmediata en zona/costa', tradicional: 'Variable', cadenas: 'Con demora logística' }
    ];
  }

  return (
    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem', pageBreakInside: 'avoid' }}>
      <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, fontStyle: 'italic' }}>
        "{comparativa || 'Estudio comparativo detallado de posicionamiento frente a la competencia tradicional y grandes cadenas.'}"
      </p>

      <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Matriz de Benchmarking y Posicionamiento</h5>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', background: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Criterio / Factor</th>
            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--accent-color)' }}>Nuestra Propuesta</th>
            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 'bold', color: '#64748b' }}>Ferreterías Tradicionales</th>
            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 'bold', color: '#64748b' }}>Grandes Cadenas</th>
          </tr>
        </thead>
        <tbody>
          {finalMatrix.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.6rem 0.8rem', fontWeight: 'bold', color: '#1e293b' }}>{row.criterio}</td>
              <td style={{ padding: '0.6rem 0.8rem', color: 'var(--accent-color)', fontWeight: '600' }}>⭐ {row.nosotros}</td>
              <td style={{ padding: '0.6rem 0.8rem', color: '#64748b' }}>{row.tradicional || 'Estándar'}</td>
              <td style={{ padding: '0.6rem 0.8rem', color: '#64748b' }}>{row.cadenas || 'Generalizado'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- SUBCOMPONENTE: BRAND BOARD ---
function BrandBoard({ data }) {
  const rawLogo = data?.imagen || '';
  const logoText = typeof rawLogo === 'string' ? rawLogo : (rawLogo && typeof rawLogo === 'object' ? safeStr(rawLogo) : String(rawLogo || ''));
  const textLower = logoText.toLowerCase();

  const colorMap = {
    'azul marino': '#1e3a8a',
    'azul acero': '#4682b4',
    'azul': '#3b82f6',
    'dorado': '#d97706',
    'oro': '#eab308',
    'amarillo': '#eab308',
    'verde': '#10b981',
    'naranja': '#f97316',
    'rojo': '#ef4444',
    'gris': '#64748b',
    'plata': '#cbd5e1',
    'negro': '#0f172a',
    'blanco': '#ffffff',
    'morado': '#8b5cf6',
    'púrpura': '#8b5cf6',
    'celeste': '#06b6d4',
    'turquesa': '#14b8a6',
    'rosa': '#ec4899'
  };

  const detectedColors = [];
  Object.entries(colorMap).forEach(([name, hex]) => {
    if (textLower.includes(name)) {
      detectedColors.push({ name, hex });
    }
  });

  const colors = detectedColors.length > 0 ? detectedColors : [
    { name: 'Azul Acero', hex: '#4682b4' },
    { name: 'Amarillo Industrial', hex: '#eab308' },
    { name: 'Gris Carbón', hex: '#334155' }
  ];

  return (
    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem', pageBreakInside: 'avoid' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paleta Cromática Corporativa</h5>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {colors.map((c, idx) => (
              <div key={idx} style={{ textAlign: 'center', minWidth: '70px' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: c.hex, margin: '0 auto 0.4rem', border: '2px solid #ffffff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 'bold', display: 'block', textTransform: 'capitalize', color: '#1e293b' }}>{c.name}</span>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{c.hex}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identidad Tipográfica</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Tipografía de Título</span>
              <span style={{ fontSize: '1rem', fontWeight: '800', fontFamily: 'Montserrat, sans-serif', color: '#0f172a' }}>Montserrat / Outfit</span>
              <span style={{ fontSize: '0.75rem', display: 'block', color: '#64748b' }}>Aa Bb Cc Dd Ee Ff 12345</span>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Tipografía de Cuerpo</span>
              <span style={{ fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', color: '#334155' }}>Inter / Roboto (Regular, Light)</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '1.25rem', paddingTop: '1rem' }}>
        <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Isotipo y Significado</h5>
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
          {logoText || 'Símbolo geométrico moderno que representa solidez, resistencia marina y precisión técnica industrial.'}
        </p>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTE: CAPACIDAD E INVENTARIOS WIDGET ---
function CapacidadInventarioWidget({ data }) {
  const rawCap = data?.instalada || '';
  const rawInv = data?.inventarios || '';
  const capText = typeof rawCap === 'string' ? rawCap : (rawCap && typeof rawCap === 'object' ? safeStr(rawCap) : String(rawCap || ''));
  const invText = typeof rawInv === 'string' ? rawInv : (rawInv && typeof rawInv === 'object' ? safeStr(rawInv) : String(rawInv || ''));

  const pctMatch = capText.match(/(\d+)%/);
  const percent = pctMatch ? Math.min(100, Math.max(10, Number(pctMatch[1]))) : 85;

  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', pageBreakInside: 'avoid' }}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Gauge de Capacidad */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            <svg width="80" height="80" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth={strokeWidth} />
              <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--accent-color)" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a' }}>{percent}%</span>
            </div>
          </div>
          <div>
            <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capacidad Operativa Máxima</h5>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: 1.4 }}>{capText || 'Capacidad física y de personal calibrada al 85% de la carga instalada total.'}</p>
          </div>
        </div>
      </div>

      {/* Flujo PEPS/FIFO */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
        <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estructura de Rotación (Método PEPS / FIFO)</h5>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0' }}>{invText || 'Valuación e inventario rotado mediante el método de Primeras Entradas, Primeras Salidas (PEPS).'}</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ flex: 1, minWidth: '150px', textAlign: 'center', padding: '0.5rem', background: 'rgba(99, 102, 241, 0.04)', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 'bold', textTransform: 'uppercase' }}>1. Recepción de Stock</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#0f172a', margin: '0.2rem 0' }}>Etiquetado con Fecha</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Se asigna lote y orden cronológico</div>
          </div>
          <div style={{ color: '#94a3b8', fontWeight: 'bold' }}>➜</div>
          <div style={{ flex: 1, minWidth: '150px', textAlign: 'center', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.04)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase' }}>2. Almacenamiento</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#0f172a', margin: '0.2rem 0' }}>Acomodo Cronológico</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Productos antiguos al frente del lineal</div>
          </div>
          <div style={{ color: '#94a3b8', fontWeight: 'bold' }}>➜</div>
          <div style={{ flex: 1, minWidth: '150px', textAlign: 'center', padding: '0.5rem', background: 'rgba(245, 158, 11, 0.04)', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
            <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 'bold', textTransform: 'uppercase' }}>3. Salida y Despacho</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#0f172a', margin: '0.2rem 0' }}>Suministro Primero</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Garantiza rotación sana libre de obsolescencia</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTE: IMPACTO AMBIENTAL WIDGET ---
function ImpactoAmbientalWidget({ data }) {
  const _impText = data?.impacto || '';
  const _mitText = data?.mitigacion || '';
  const normText = data?.normatividad || '';

  const environmentalItems = [
    {
      tipo: 'Consumo Eléctrico',
      mitigacion: 'Iluminación LED de alta eficiencia y sensores de apagado inteligente en bodegas y oficinas.',
      estatus: 'Implementado',
      color: '#10b981'
    },
    {
      tipo: 'Residuos de Metales y Plásticos',
      mitigacion: 'Contenedores específicos y entrega quincenal a recicladores autorizados (reduciendo merma en taller).',
      estatus: 'En Proceso',
      color: '#f59e0b'
    },
    {
      tipo: 'Papel y Facturación',
      mitigacion: 'Digitalización 100% (cero papel) mediante cotizaciones online, catálogos en PDF y firma biométrica.',
      estatus: 'Implementado',
      color: '#10b981'
    }
  ];

  const parsedRegulations = [];
  if (normText && typeof normText === 'string') {
    const normLines = normText.split(/[\n;•·]/).map(s => s.trim()).filter(s => s.length > 5);
    normLines.forEach(line => {
      const yearMatch = line.match(/\b(19\d\d|20\d\d)\b/);
      const year = yearMatch ? yearMatch[1] : '2026';

      const keyMatch = line.match(/(NOM-\d{3}-[A-Z0-9-]+|Art\.\s*\d+|Ley\s+[A-Za-z0-9\s]+)/i);
      const key = keyMatch ? keyMatch[1] : 'Reglamento';

      let name = line.split(/[:(-]/)[0].trim();
      if (name.length > 45) name = name.substring(0, 45) + '...';

      parsedRegulations.push({
        norma: name,
        clave: key,
        ambito: line.toLowerCase().includes('seguridad') ? 'Seguridad Industrial' : 
                line.toLowerCase().includes('residuo') ? 'Manejo de Residuos' : 
                line.toLowerCase().includes('emisiones') ? 'Control de Emisiones' : 'Operación General',
        anio: year,
        medida: line.length > 80 ? line : 'Cumplimiento normativo y control operativo en planta.'
      });
    });
  }

  const defaultRegulations = [
    {
      norma: 'NOM-002-STPS-2010',
      clave: 'STPS-2010',
      ambito: 'Seguridad contra Incendios',
      anio: '2010',
      medida: 'Instalación de extintores recargados, rutas de evacuación señalizadas y capacitación de brigadas de seguridad.'
    },
    {
      norma: 'LGPGIR (Reglamento de Residuos)',
      clave: 'LGPGIR Art. 4',
      ambito: 'Manejo Especial de Residuos',
      anio: '2003',
      medida: 'Clasificación de metales y plásticos en contenedores con entrega documentada y controlada a centros de reciclaje.'
    },
    {
      norma: 'Reglamento de Protección Ambiental y Minera',
      clave: 'Reglamento Ambiental',
      ambito: 'Disposición Ecológica y Residuos',
      anio: '2023',
      medida: 'Disposición controlada de residuos, protocolo de contención de fluidos/lubricantes y monitoreo ambiental en operaciones.'
    }
  ];

  const finalRegulations = parsedRegulations.length > 0 ? parsedRegulations.slice(0, 6) : defaultRegulations;

  return (
    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', pageBreakInside: 'avoid' }}>
      <div>
        <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Matriz de Mitigación y Cumplimiento Ecológico</h5>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', background: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Impacto / Aspecto</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Medida de Mitigación / Acción</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', fontWeight: 'bold', color: '#475569', width: '120px' }}>Estatus</th>
            </tr>
          </thead>
          <tbody>
            {environmentalItems.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.6rem 0.8rem', fontWeight: 'bold', color: '#1e293b' }}>{item.tipo}</td>
                <td style={{ padding: '0.6rem 0.8rem', color: '#334155', lineHeight: 1.4 }}>{item.mitigacion}</td>
                <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>
                  <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 'bold', background: `${item.color}15`, color: item.color }}>
                    {item.estatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
        <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Marco de Normatividad y Leyes Reguladoras</h5>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', background: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Normativa / Reglamento</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 'bold', color: '#475569', width: '90px' }}>Ley / Clave</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Ámbito</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', fontWeight: 'bold', color: '#475569', width: '60px' }}>Año</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Medida Concreta Adoptada</th>
            </tr>
          </thead>
          <tbody>
            {finalRegulations.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.6rem 0.8rem', fontWeight: 'bold', color: '#1e293b' }}>{item.norma}</td>
                <td style={{ padding: '0.6rem 0.8rem', color: '#334155' }}>{item.clave}</td>
                <td style={{ padding: '0.6rem 0.8rem', color: '#64748b' }}>{item.ambito}</td>
                <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center', color: '#334155' }}>{item.anio}</td>
                <td style={{ padding: '0.6rem 0.8rem', color: '#334155', lineHeight: 1.4 }}>{item.medida}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {normText && (
          <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.76rem', color: '#64748b', fontStyle: 'italic', paddingLeft: '0.5rem' }}>
            * Descripción adicional de normatividad: "{typeof normText === 'string' ? normText : safeStr(normText)}"
          </p>
        )}
      </div>
    </div>
  );
}

// --- SUBCOMPONENTE: MAQUINARIA Y TECNOLOGIA TABLE ---
function MaquinariaTable({ data, planData }) {
  const maquinaria = data?.maquinaria || '';
  const equipo = data?.equipo || '';
  const herramientas = data?.herramientas || '';

  const items = [];
  
  const parseText = (text, type) => {
    if (!text || typeof text !== 'string') return;
    
    let rawLines = text
      .split(/(?:\r?\n)+|(?:\s*[•·]\s*)|(?:\s*;\s*(?=[A-Z0-9]))|(?:\s*\.\s+(?=[0-9]+\.|\d+\)|\b[A-Z]))/)
      .map(s => s.trim())
      .filter(s => s.length > 5);

    if (rawLines.length === 1 && rawLines[0].includes(').')) {
      rawLines = rawLines[0].split(/\)\.\s*/).map((s, idx, arr) => idx < arr.length - 1 ? s + ')' : s).map(s => s.trim()).filter(s => s.length > 5);
    }

    rawLines.forEach(line => {
      const priceMatch = line.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+)/) || line.match(/(\d{1,3}(?:,\d{3})+(?:\.\d+)?)\s*(?:MXN|USD|pesos)/i);
      let price = null;
      if (priceMatch) {
        price = Number(priceMatch[1].replace(/,/g, ''));
      }
      
      const yearsMatch = line.match(/(\d+)\s*(?:años?|year)/i);
      const years = yearsMatch ? Number(yearsMatch[1]) : (type === 'Maquinaria' ? 10 : type === 'Equipo' ? 5 : 3);

      let name = line
        .replace(/^\d+[\.\)]\s*/, '')
        .replace(/\([^)]*?(?:\$|\baños\b|MXN)[^)]*?\)/gi, '')
        .replace(/:\s*\$[\d,]+.*/, '')
        .replace(/\$[\d,]+(\s*MXN)?/gi, '')
        .replace(/,\s*\d+\s*años.*/i, '')
        .trim();

      name = name.replace(/^[-–—:\s]+|[-–—:\s,\.]+$/g, '').trim();

      if (name.length > 70) name = name.substring(0, 70) + '...';

      if (name && name.length > 2 && !/^\d+$/.test(name)) {
        items.push({
          nombre: name,
          tipo: type,
          costo: price || (type === 'Maquinaria' ? 180000 : type === 'Equipo' ? 45000 : 15000),
          vidaUtil: years,
        });
      }
    });
  };

  parseText(maquinaria, 'Maquinaria');
  parseText(equipo, 'Equipo');
  parseText(herramientas, 'Herramienta');

  const defaultItems = [
    { nombre: 'Banco de Pruebas Dinámico e Hidráulico de Alta Presión', tipo: 'Maquinaria', costo: 1850000, vidaUtil: 15 },
    { nombre: 'Puente Grúa Monorriel de 10 Toneladas', tipo: 'Maquinaria', costo: 450000, vidaUtil: 20 },
    { nombre: 'Unidad Móvil de Microfiltración y Deshidratación de Aceite', tipo: 'Maquinaria', costo: 320000, vidaUtil: 10 },
    { nombre: 'Máquina de Lavado y Ultrasonido Industrial para Válvulas', tipo: 'Equipo', costo: 280000, vidaUtil: 12 },
    { nombre: 'Unidad Móvil Pick-up 4x4 equipada con módulo hidráulico', tipo: 'Vehículo / Logística', costo: 650000, vidaUtil: 5 },
    { nombre: 'Estación de Telemetría IoT y Diagnóstico Preventivo', tipo: 'Equipo', costo: 85000, vidaUtil: 5 }
  ];

  const finalItems = items.length > 0 ? items.slice(0, 8) : defaultItems;
  const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem', pageBreakInside: 'avoid' }}>
      <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Depreciación y Costo de Maquinaria y Equipos</h5>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', background: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Activo / Concepto</th>
            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Clasificación</th>
            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: 'bold', color: '#475569' }}>Inversión Estimada</th>
            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', fontWeight: 'bold', color: '#475569', width: '90px' }}>Vida Útil</th>
            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: 'bold', color: '#475569' }}>Depreciación Anual</th>
          </tr>
        </thead>
        <tbody>
          {finalItems.map((item, idx) => {
            const depAnual = item.costo / item.vidaUtil;
            return (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.6rem 0.8rem', fontWeight: 'bold', color: '#1e293b' }}>{item.nombre}</td>
                <td style={{ padding: '0.6rem 0.8rem', color: '#64748b' }}>{item.tipo}</td>
                <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', color: '#334155' }}>{formatCurrency(item.costo)}</td>
                <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center', color: '#334155' }}>{item.vidaUtil} años</td>
                <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: 'bold', color: '#ef4444' }}>{formatCurrency(depAnual)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {(maquinaria || equipo || herramientas) && (
        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.76rem', color: '#64748b', fontStyle: 'italic', paddingLeft: '0.5rem' }}>
          * Detalle adicional del plan: {maquinaria && typeof maquinaria === 'string' ? `Maquinaria: ${maquinaria}. ` : ''}{equipo && typeof equipo === 'string' ? `Equipos: ${equipo}.` : ''}
        </p>
      )}
    </div>
  );
}

// --- SUBCOMPONENTE: INSUMOS Y PROVEEDORES TABLE ---
function InsumosTable({ data, planData }) {
  const materia = data?.materia_prima || '';
  const prov = data?.proveedores || '';
  
  const planLocation = 
    planData?.semilla?.cobertura ||
    planData?.semilla?.ubicacion ||
    planData?.semilla?.cliente_ubicacion ||
    planData?.semilla?.negocio?.ubicacion ||
    planData?.tecnico?.ubicacion?.micro ||
    planData?.tecnico?.ubicacion?.macro ||
    'Cananea / Sonora (Base Operativa)';

  const parsedItems = [];
  if (materia && typeof materia === 'string') {
    let rawMateria = materia
      .split(/(?:\r?\n)+|(?:\s*[•·]\s*)|(?:\s*;\s*(?=[A-Z0-9]))|(?:\s*\.\s+(?=[0-9]+\.|\d+\)|\b[A-Z]))/)
      .map(s => s.trim())
      .filter(s => s.length > 3);

    if (rawMateria.length === 1 && rawMateria[0].includes(').')) {
      rawMateria = rawMateria[0].split(/\)\.\s*/).map((s, idx, arr) => idx < arr.length - 1 ? s + ')' : s).map(s => s.trim()).filter(s => s.length > 3);
    }

    const rawProv = (prov && typeof prov === 'string') 
      ? prov.split(/(?:\r?\n)+|(?:\s*[•·]\s*)|(?:\s*;\s*(?=[A-Z0-9]))|(?:\s*\.\s+(?=[0-9]+\.|\d+\)|\b[A-Z]))/).map(s => s.trim()).filter(s => s.length > 3) 
      : [];
    
    rawMateria.forEach((m, idx) => {
      const priceMatch = m.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+)(?:\s*MXN)?(?:\/[a-zA-Záéíóú]+)?/i);
      const price = priceMatch ? priceMatch[0] : '$8,500 / lote';
      
      const qtyMatch = m.match(/(\d+[\d,]*\s*(?:kg|sacos|unidades|tramos|lotes|l|litros|piezas|kits|mangueras)(?:\/[a-zA-Záéíóú]+)?)/i);
      const qty = qtyMatch ? qtyMatch[1] : 'Según demanda';
      
      const freqMatch = m.match(/(semanal|quincenal|mensual|bimestral|anual|por evento)/i);
      const freq = freqMatch ? freqMatch[0] : 'Mensual';

      let cleanName = m
        .replace(/^\d+[\.\)]\s*/, '')
        .replace(/\([^)]*?(?:\$|MXN|\/mes|\/lote)[^)]*?\)/gi, '')
        .replace(/:\s*\$[\d,]+.*/, '')
        .replace(/\$[\d,]+.*/, '')
        .trim();

      cleanName = cleanName.replace(/^[-–—:\s]+|[-–—:\s,\.]+$/g, '').trim();
      if (cleanName.length > 65) cleanName = cleanName.substring(0, 65) + '...';

      const p = rawProv[idx] || rawProv[0] || 'Proveedor Certificado / Fabricante OEM';

      if (cleanName && cleanName.length > 2 && !/^\d+$/.test(cleanName)) {
        parsedItems.push({
          insumo: cleanName,
          proveedor: p.replace(/^\d+[\.\)]\s*/, '').replace(/Proveedor\s*\d+:\s*/i, '').trim(),
          direccion: planLocation,
          precio: price,
          cantidad: qty,
          frecuencia: freq.charAt(0).toUpperCase() + freq.slice(1)
        });
      }
    });
  }

  const defaultItems = [
    { insumo: 'Fluidos hidráulicos sintéticos de alta estabilidad ISO VG 46/68', proveedor: 'Mobil / Shell / Castrol Industrial', direccion: planLocation, precio: '$180,000 / mes', cantidad: '3,000 L/mes', frecuencia: 'Mensual' },
    { insumo: 'Elementos filtrantes absolutos Beta 1000 de 1 a 3 micras', proveedor: 'Parker Hannifin / HYDAC International', direccion: planLocation, precio: '$95,000 / mes', cantidad: '120 piezas/mes', frecuencia: 'Mensual' },
    { insumo: 'Kits de estanqueidad y sellado de alta resistencia térmica (Viton/PTFE)', proveedor: 'SKF / Hallite Seals', direccion: planLocation, precio: '$65,000 / mes', cantidad: '80 kits/mes', frecuencia: 'Mensual' },
    { insumo: 'Mangueras hidráulicas trenzadas de alta presión (4,000 a 6,000 PSI)', proveedor: 'Gates Corporation / Eaton Aeroquip', direccion: planLocation, precio: '$110,000 / mes', cantidad: '150 tramos/mes', frecuencia: 'Mensual' }
  ];

  const finalItems = parsedItems.length > 0 ? parsedItems.slice(0, 6) : defaultItems;

  return (
    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem', pageBreakInside: 'avoid' }}>
      <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ficha de Materias Primas, Proveedores y Suministros</h5>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', background: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Materia Prima / Insumo</th>
            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Proveedor Clave</th>
            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Ubicación / Cobertura</th>
            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', fontWeight: 'bold', color: '#475569' }}>Costo Estimado</th>
            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', fontWeight: 'bold', color: '#475569' }}>Volumen</th>
            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', fontWeight: 'bold', color: '#475569' }}>Frecuencia</th>
          </tr>
        </thead>
        <tbody>
          {finalItems.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.6rem 0.8rem', fontWeight: 'bold', color: '#1e293b' }}>{item.insumo}</td>
              <td style={{ padding: '0.6rem 0.8rem', color: '#334155' }}>{item.proveedor}</td>
              <td style={{ padding: '0.6rem 0.8rem', color: '#64748b' }}>{item.direccion}</td>
              <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center', color: '#334155' }}>{item.precio}</td>
              <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center', color: '#334155' }}>{item.cantidad}</td>
              <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center', fontWeight: '600', color: 'var(--accent-color)' }}>{item.frecuencia}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {(materia || prov) && (
        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.76rem', color: '#64748b', fontStyle: 'italic', paddingLeft: '0.5rem' }}>
          * Detalle adicional de insumos/proveedores: {materia && typeof materia === 'string' ? `Insumos: ${materia}. ` : ''}{prov && typeof prov === 'string' ? `Proveedores: ${prov}.` : ''}
        </p>
      )}
    </div>
  );
}

// --- SUBCOMPONENTE: PUNTO DE EQUILIBRIO (BREAK-EVEN) SVG ---
function BreakEvenChart({ planData }) {
  const opexData = planData?.organizacion?.costos || {};
  const opexRows = useMemo(() => readJson(opexData?.desglose_opex_json, []), [opexData?.desglose_opex_json]);

  // Costo Fijo Mensual
  const fixedCosts = useMemo(() => {
    const sum = opexRows
      .filter(r => r && typeof r === 'object' && !isVariableOpex(r))
      .reduce((acc, row) => acc + Number(row.mensual || 0), 0);
    return sum > 0 ? sum : 35000;
  }, [opexRows]);

  // Parámetros de venta (Ferretería / Suministro)
  const pricePerOrder = 550; // Ticket promedio
  const variableCostPerOrder = 330; // Costo de adquisición de mercancía + flete (60%)
  const contributionMargin = pricePerOrder - variableCostPerOrder; // 220 MXN
  
  const breakevenUnits = Math.round(fixedCosts / contributionMargin);
  const breakevenSales = breakevenUnits * pricePerOrder;

  // Parámetros para dibujar el gráfico SVG
  const width = 500;
  const height = 280;
  const paddingX = 55;
  const paddingY = 40;

  // Rangos de visualización (X: unidades de 0 a 2.5 * breakevenUnits, Y: pesos de 0 a 2.5 * breakevenSales)
  const maxUnits = breakevenUnits * 2.2;
  const maxAmount = breakevenSales * 2.2;

  const getX = (units) => paddingX + (units / maxUnits) * (width - paddingX - 20);
  const getY = (amount) => (height - paddingY) - (amount / maxAmount) * (height - paddingY - 20);

  const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1.5rem', pageBreakInside: 'avoid' }}>
      <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cruce Financiero y Gráfico de Punto de Equilibrio</h5>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>Costos Fijos</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.2rem' }}>{formatCurrency(fixedCosts)}<span style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>/mes</span></div>
        </div>
        <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>Ticket Promedio</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#4f46e5', marginTop: '0.2rem' }}>{formatCurrency(pricePerOrder)}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>Pto. Equilibrio (Pedidos)</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.2rem' }}>{breakevenUnits} <span style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>ventas</span></div>
        </div>
        <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>Ventas Mínimas</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.2rem' }}>{formatCurrency(breakevenSales)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Ejes */}
          <line x1={paddingX} y1={height - paddingY} x2={width - 10} y2={height - paddingY} stroke="#94a3b8" strokeWidth="2" />
          <line x1={paddingX} y1={10} x2={paddingX} y2={height - paddingY} stroke="#94a3b8" strokeWidth="2" />
          
          {/* Gridlines */}
          <line x1={paddingX} y1={getY(fixedCosts)} x2={width - 15} y2={getY(fixedCosts)} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />

          {/* Línea Costo Fijo */}
          <line x1={paddingX} y1={getY(fixedCosts)} x2={width - 20} y2={getY(fixedCosts)} stroke="#ef4444" strokeWidth="2" />
          
          {/* Línea Costos Totales */}
          <line x1={paddingX} y1={getY(fixedCosts)} x2={getX(maxUnits)} y2={getY(fixedCosts + maxUnits * variableCostPerOrder)} stroke="#f59e0b" strokeWidth="2" />
          
          {/* Línea de Ingresos Totales */}
          <line x1={paddingX} y1={getY(0)} x2={getX(maxUnits)} y2={getY(maxUnits * pricePerOrder)} stroke="#10b981" strokeWidth="2" />

          {/* Dotted lines to Punto de Equilibrio */}
          <line x1={getX(breakevenUnits)} y1={getY(breakevenSales)} x2={getX(breakevenUnits)} y2={height - paddingY} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,4" />
          <line x1={paddingX} y1={getY(breakevenSales)} x2={getX(breakevenUnits)} y2={getY(breakevenSales)} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,4" />

          {/* Nodo Intersección */}
          <circle cx={getX(breakevenUnits)} cy={getY(breakevenSales)} r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />

          {/* Textos y Etiquetas */}
          <text x={getX(maxUnits) - 10} y={getY(fixedCosts) - 6} fill="#ef4444" fontSize="10" fontWeight="bold">Costos Fijos</text>
          <text x={getX(maxUnits) - 10} y={getY(fixedCosts + maxUnits * variableCostPerOrder) - 6} fill="#f59e0b" fontSize="10" fontWeight="bold">Costo Total</text>
          <text x={getX(maxUnits) - 10} y={getY(maxUnits * pricePerOrder) - 6} fill="#10b981" fontSize="10" fontWeight="bold">Ingresos</text>

          {/* Eje X Etiquetas */}
          <text x={getX(0)} y={height - paddingY + 16} fill="#64748b" fontSize="9" textAnchor="middle">0</text>
          <text x={getX(breakevenUnits)} y={height - paddingY + 16} fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">{breakevenUnits}</text>
          <text x={getX(maxUnits)} y={height - paddingY + 16} fill="#64748b" fontSize="9" textAnchor="middle">{Math.round(maxUnits)}</text>
          <text x={width / 2 + 20} y={height - 8} fill="#475569" fontSize="10" fontWeight="bold" textAnchor="middle">Pedidos / Ventas Mensuales</text>

          {/* Eje Y Etiquetas */}
          <text x={paddingX - 8} y={getY(fixedCosts) + 3} fill="#ef4444" fontSize="9" textAnchor="end">{formatCurrency(fixedCosts)}</text>
          <text x={paddingX - 8} y={getY(breakevenSales) + 3} fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="end">{formatCurrency(breakevenSales)}</text>
          <text x={paddingX - 8} y={height - paddingY + 3} fill="#64748b" fontSize="9" textAnchor="end">$0</text>
          <text x={20} y={20} fill="#475569" fontSize="10" fontWeight="bold" transform={`rotate(-90 10,60)`}>Monto ($ MXN)</text>
          
          {/* Anotación Punto de Equilibrio */}
          <text x={getX(breakevenUnits) + 10} y={getY(breakevenSales) - 10} fill="#1e293b" fontSize="10" fontWeight="bold">Punto de Equilibrio</text>
        </svg>
      </div>
      <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
        💡 El gráfico cruza la línea de <strong>Ingresos Totales</strong> (verde) con el <strong>Costo Total</strong> (naranja, que arranca sobre los Costos Fijos). En la intersección ({breakevenUnits} pedidos, facturando {formatCurrency(breakevenSales)}), la utilidad operativa es exactamente cero. A partir de esa unidad, el proyecto genera ganancias netas.
      </p>
    </div>
  );
}

function BalanceGeneralEstandar({ projections, planData }) {
  const data = useMemo(() => {
    const years = [1, 2, 3, 4, 5];
    const summaries = projections?.annualSummaries || [];
    const cashFlows = projections?.annualCashFlowData || [];
    const investment = projections?.netInitialInvestment || 450000;
    const fixedAssets = investment * 0.7; // 70% fijo

    return years.map((y) => {
      const summary = summaries.find(s => Number(s.year) === y) || {};
      const cashFlow = cashFlows.find(c => Number(c.year) === y) || {};
      
      const netIncome = summary.incomeStatement?.netIncome || (summary.incomeStatement?.sales * 0.15) || 100000 * y;
      const sales = summary.incomeStatement?.sales || 500000;
      
      const caja = Math.max(20000, cashFlow.cumulativeCashFlow || (investment + netIncome * y));
      const inventario = sales * 0.08;
      const cuentasPorCobrar = sales * 0.05;
      const totalCirculante = caja + inventario + cuentasPorCobrar;
      
      const depAcumulada = (fixedAssets * 0.1) * y;
      const netoFijo = Math.max(0, fixedAssets - depAcumulada);
      
      const totalActivos = totalCirculante + netoFijo;
      
      const capitalSocial = investment;
      let utilidadesAcumuladas = 0;
      for (let prevY = 1; prevY < y; prevY++) {
        const prevSummary = summaries.find(s => Number(s.year) === prevY) || {};
        utilidadesAcumuladas += prevSummary.incomeStatement?.netIncome || (sales * 0.15);
      }
      const totalPatrimonio = capitalSocial + utilidadesAcumuladas + netIncome;
      
      const totalPasivo = Math.max(0, totalActivos - totalPatrimonio);
      const proveedores = totalPasivo * 0.4;
      const acreedores = totalPasivo * 0.6;
      
      return {
        year: y,
        caja,
        inventario,
        cuentasPorCobrar,
        totalCirculante,
        fixedAssets,
        depAcumulada,
        netoFijo,
        totalActivos,
        proveedores,
        acreedores,
        totalPasivo,
        capitalSocial,
        utilidadesAcumuladas,
        netIncome,
        totalPatrimonio,
        totalPasivoPatrimonio: totalActivos
      };
    });
  }, [projections, planData]);

  const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ marginTop: '1.5rem', marginBottom: '2rem', pageBreakInside: 'avoid' }}>
      <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 'bold', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Balance General Pro-Forma (Formato NIF / Estándar)
      </h4>
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#ffffff', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '800', color: '#475569' }}>CONCEPTO / CUENTA</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '800', color: '#475569' }}>AÑO 1</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '800', color: '#475569' }}>AÑO 2</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '800', color: '#475569' }}>AÑO 3</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '800', color: '#475569' }}>AÑO 4</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '800', color: '#475569' }}>AÑO 5</th>
            </tr>
          </thead>
          <tbody>
            {/* ACTIVOS */}
            <tr style={{ background: '#ffffff', fontWeight: '700' }}>
              <td colSpan="6" style={{ padding: '0.5rem 1rem', color: '#16a34a' }}>1. ACTIVOS</td>
            </tr>
            <tr style={{ fontWeight: '600' }}>
              <td colSpan="6" style={{ padding: '0.4rem 1.5rem', color: '#475569', fontSize: '0.8rem' }}>Activos Circulantes (Corto Plazo)</td>
            </tr>
            <tr>
              <td style={{ padding: '0.4rem 2rem', color: '#64748b' }}>Efectivo en Caja y Bancos</td>
              {data.map(d => <td key={d.year} style={{ padding: '0.4rem 1rem', textAlign: 'right' }}>{formatCurrency(d.caja)}</td>)}
            </tr>
            <tr>
              <td style={{ padding: '0.4rem 2rem', color: '#64748b' }}>Inventarios (Materias Primas / Mercancía)</td>
              {data.map(d => <td key={d.year} style={{ padding: '0.4rem 1rem', textAlign: 'right' }}>{formatCurrency(d.inventario)}</td>)}
            </tr>
            <tr>
              <td style={{ padding: '0.4rem 2rem', color: '#64748b' }}>Clientes y Cuentas por Cobrar</td>
              {data.map(d => <td key={d.year} style={{ padding: '0.4rem 1rem', textAlign: 'right' }}>{formatCurrency(d.cuentasPorCobrar)}</td>)}
            </tr>
            <tr style={{ fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.4rem 1.5rem', color: '#334155' }}>Total Activos Circulantes</td>
              {data.map(d => <td key={d.year} style={{ padding: '0.4rem 1rem', textAlign: 'right', color: '#334155' }}>{formatCurrency(d.totalCirculante)}</td>)}
            </tr>

            {/* Fijos */}
            <tr style={{ fontWeight: '600' }}>
              <td colSpan="6" style={{ padding: '0.4rem 1.5rem', color: '#475569', fontSize: '0.8rem', paddingTop: '0.75rem' }}>Activos No Circulantes (Fijos y Diferidos)</td>
            </tr>
            <tr>
              <td style={{ padding: '0.4rem 2rem', color: '#64748b' }}>Maquinaria, Mobiliario y Equipamiento</td>
              {data.map(d => <td key={d.year} style={{ padding: '0.4rem 1rem', textAlign: 'right' }}>{formatCurrency(d.fixedAssets)}</td>)}
            </tr>
            <tr>
              <td style={{ padding: '0.4rem 2rem', color: '#ef4444' }}>(-) Depreciación Acumulada</td>
              {data.map(d => <td key={d.year} style={{ padding: '0.4rem 1rem', textAlign: 'right', color: '#ef4444' }}>{formatCurrency(-d.depAcumulada)}</td>)}
            </tr>
            <tr style={{ fontWeight: '700', borderBottom: '1.5px solid #cbd5e1' }}>
              <td style={{ padding: '0.4rem 1.5rem', color: '#334155' }}>Total Activos Fijos Netos</td>
              {data.map(d => <td key={d.year} style={{ padding: '0.4rem 1rem', textAlign: 'right', color: '#334155' }}>{formatCurrency(d.netoFijo)}</td>)}
            </tr>
            <tr style={{ background: '#f8fafc', fontWeight: '800', borderBottom: '2.5px double #94a3b8' }}>
              <td style={{ padding: '0.6rem 1rem', color: '#0f172a' }}>TOTAL ACTIVOS</td>
              {data.map(d => <td key={d.year} style={{ padding: '0.6rem 1rem', textAlign: 'right', color: '#0f172a' }}>{formatCurrency(d.totalActivos)}</td>)}
            </tr>

            {/* PASIVOS */}
            {/* PASIVOS */}
            <tr style={{ background: '#ffffff', fontWeight: '700', borderTop: '2px solid #e2e8f0' }}>
              <td colSpan="6" style={{ padding: '0.5rem 1rem', color: '#dc2626' }}>2. PASIVOS</td>
            </tr>
            <tr>
              <td style={{ padding: '0.4rem 2rem', color: '#64748b' }}>Proveedores y Cuentas por Pagar</td>
              {data.map(d => <td key={d.year} style={{ padding: '0.4rem 1rem', textAlign: 'right' }}>{formatCurrency(d.proveedores)}</td>)}
            </tr>
            <tr>
              <td style={{ padding: '0.4rem 2rem', color: '#64748b' }}>Créditos Bancarios y Otras Obligaciones</td>
              {data.map(d => <td key={d.year} style={{ padding: '0.4rem 1rem', textAlign: 'right' }}>{formatCurrency(d.acreedores)}</td>)}
            </tr>
            <tr style={{ fontWeight: '700', borderBottom: '1.5px solid #cbd5e1' }}>
              <td style={{ padding: '0.4rem 1.5rem', color: '#334155' }}>TOTAL PASIVOS</td>
              {data.map(d => <td key={d.year} style={{ padding: '0.4rem 1rem', textAlign: 'right', color: '#334155' }}>{formatCurrency(d.totalPasivo)}</td>)}
            </tr>

            {/* PATRIMONIO */}
            {/* PATRIMONIO */}
            <tr style={{ background: '#ffffff', fontWeight: '700', borderTop: '2px solid #e2e8f0' }}>
              <td colSpan="6" style={{ padding: '0.5rem 1rem', color: '#2563eb' }}>3. PATRIMONIO (CAPITAL CONTABLE)</td>
            </tr>
            <tr>
              <td style={{ padding: '0.4rem 2rem', color: '#64748b' }}>Capital Social (Aportación Inicial)</td>
              {data.map(d => <td key={d.year} style={{ padding: '0.4rem 1rem', textAlign: 'right' }}>{formatCurrency(d.capitalSocial)}</td>)}
            </tr>
            <tr>
              <td style={{ padding: '0.4rem 2rem', color: '#64748b' }}>Utilidades Acumuladas (Ejercicios Ant.)</td>
              {data.map(d => <td key={d.year} style={{ padding: '0.4rem 1rem', textAlign: 'right' }}>{formatCurrency(d.utilidadesAcumuladas)}</td>)}
            </tr>
            <tr>
              <td style={{ padding: '0.4rem 2rem', color: '#10b981', fontWeight: '600' }}>Utilidad Neta del Ejercicio (Actual)</td>
              {data.map(d => <td key={d.year} style={{ padding: '0.4rem 1rem', textAlign: 'right', color: '#10b981', fontWeight: '600' }}>{formatCurrency(d.netIncome)}</td>)}
            </tr>
            <tr style={{ fontWeight: '700', borderBottom: '1.5px solid #cbd5e1' }}>
              <td style={{ padding: '0.4rem 1.5rem', color: '#334155' }}>TOTAL PATRIMONIO</td>
              {data.map(d => <td key={d.year} style={{ padding: '0.4rem 1rem', textAlign: 'right', color: '#334155' }}>{formatCurrency(d.totalPatrimonio)}</td>)}
            </tr>
            <tr style={{ background: '#ffffff', fontWeight: '800', borderBottom: '2.5px double #94a3b8' }}>
              <td style={{ padding: '0.6rem 1rem', color: '#0f172a' }}>TOTAL PASIVO + PATRIMONIO</td>
              {data.map(d => <td key={d.year} style={{ padding: '0.6rem 1rem', textAlign: 'right', color: '#0f172a' }}>{formatCurrency(d.totalPasivoPatrimonio)}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const FieldCommentSection = ({ pillarKey, moduleKey, fieldKey, planData, addComment, deleteComment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  const commentKey = `${pillarKey}.${moduleKey}.${fieldKey}`;
  const comments = planData?.config?.comments?.[commentKey] || [];

  const handleAdd = () => {
    if (!newCommentText.trim()) return;
    addComment(pillarKey, moduleKey, fieldKey, newCommentText.trim());
    setNewCommentText('');
  };

  return (
    <div className="no-print" style={{ marginTop: '0.5rem', marginBottom: '0.8rem' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: comments.length > 0 ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
          border: `1px solid ${comments.length > 0 ? 'rgba(99, 102, 241, 0.3)' : 'var(--border-color)'}`,
          color: comments.length > 0 ? 'var(--accent-color)' : 'var(--text-secondary)',
          borderRadius: '20px',
          padding: '4px 12px',
          fontSize: '0.72rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <MessageSquare size={12} />
        <span>
          {comments.length > 0 ? `Correcciones (${comments.length})` : 'Agregar Nota de Corrección'}
        </span>
      </button>

      {isOpen && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.75rem',
          background: 'var(--bg-panel-hover)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxWidth: '500px'
        }}>
          {comments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto', marginBottom: '0.25rem' }}>
              {comments.map(c => (
                <div key={c.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  padding: '6px 10px',
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '0.75rem'
                }}>
                  <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', gap: '0.5rem', fontSize: '0.65rem', marginBottom: '2px' }}>
                      <span>{c.author}</span>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
                        {c.date ? new Date(c.date).toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{c.text}</div>
                  </div>
                  <button
                    onClick={() => deleteComment(pillarKey, moduleKey, fieldKey, c.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      padding: '2px',
                      fontWeight: 'bold',
                      lineHeight: 1
                    }}
                    title="Eliminar corrección"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Indica qué corregir (ej. Cambiar precios a MXN)..."
              style={{
                flex: 1,
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                outline: 'none'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
            />
            <button
              onClick={handleAdd}
              className="btn btn-primary"
              style={{ padding: '4px 10px', fontSize: '0.7rem', height: '28px', whiteSpace: 'nowrap' }}
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const cleanMarkdownResponse = (text) => {
  if (!text) return '';
  let cleaned = text.trim();
  
  // Quitar bloques de código triple ```markdown y ``` si el LLM envolvió toda la respuesta
  cleaned = cleaned.replace(/^```markdown\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/```$/, '');
  
  // Quitar sangrías de 4 o más espacios al inicio de las líneas si no corresponden a listas markdown,
  // previniendo bloques preformateados <pre> no deseados
  cleaned = cleaned.split('\n').map(line => {
    if (/^\s{4,}/.test(line) && !/^\s*[*+-]\s+/.test(line) && !/^\s*\d+\.\s+/.test(line)) {
      return line.trimStart();
    }
    return line;
  }).join('\n');

  return cleaned.trim();
};

const getModuleFields = (pillarKey, moduleKey) => {
  for (const fw of Object.values(FRAMEWORKS)) {
    const p = fw.pillars?.find(pil => pil.key === pillarKey);
    if (p) {
      const m = p.modules?.find(mod => mod.key === moduleKey);
      if (m && m.fields) return m.fields;
    }
  }
  return [];
};

const ModuleRefinementPanel = ({ pillarKey, moduleKey, fields, planData, updateSection, manualSaveProject, addComment, deleteComment }) => {
  const [selectedField, setSelectedField] = useState(fields && fields[0] ? fields[0] : '');
  const [feedback, setFeedback] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [diffModalData, setDiffModalData] = useState(null);
  const [isIterating, setIsIterating] = useState(false);

  useEffect(() => {
    if (fields && fields.length > 0) {
      setSelectedField(fields[0]);
    }
  }, [fields]);

  if (!fields || fields.length === 0) return null;

  const handleRefine = async () => {
    if (!feedback.trim()) {
      alert('Por favor introduce un comentario o instrucción de retroalimentación.');
      return;
    }
    setIsGenerating(true);
    try {
      const currentValue = planData[pillarKey]?.[moduleKey]?.[selectedField] || '';
      const fieldLabel = selectedField.charAt(0).toUpperCase() + selectedField.slice(1).replace(/_/g, ' ');
      const config = planData.config || {};
      const comments = [{ author: 'Usuario', text: feedback }];
      
      const newValue = await refactorFieldWithComments(config.ai || {}, {
        fieldLabel,
        currentValue,
        comments,
        planData
      });

      if (!newValue) {
        throw new Error('La IA no devolvió ningún contenido.');
      }

      const cleanedVal = cleanMarkdownResponse(newValue);

      // Desplegamos el modal de revisión de diferencias en lugar de aplicar a ciegas
      setDiffModalData({
        isOpen: true,
        fieldKey: selectedField,
        fieldLabel,
        oldText: currentValue,
        newText: cleanedVal,
        cleanedVal,
        comments
      });
    } catch (err) {
      console.error(err);
      alert('Error al refinar con IA: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptDiff = async () => {
    if (!diffModalData) return;
    try {
      updateSection(pillarKey, moduleKey, diffModalData.fieldKey, diffModalData.cleanedVal);
      if (manualSaveProject) {
        await manualSaveProject();
      }
      setFeedback('');
      setDiffModalData(null);
      alert('Sección refinada con éxito por la IA y guardada en el plan.');
    } catch (err) {
      alert('Error al guardar cambio: ' + err.message);
    }
  };

  const handleIterateDiff = async (additionalFeedback) => {
    if (!diffModalData) return;
    setIsIterating(true);
    try {
      const config = planData.config || {};
      const updatedComments = [
        ...diffModalData.comments,
        { author: 'Usuario (Ajuste)', text: additionalFeedback }
      ];
      
      const newValue = await refactorFieldWithComments(config.ai || {}, {
        fieldLabel: diffModalData.fieldLabel,
        currentValue: diffModalData.oldText,
        comments: updatedComments,
        planData
      });

      if (newValue) {
        const cleanedVal = cleanMarkdownResponse(newValue);
        setDiffModalData(prev => ({
          ...prev,
          newText: cleanedVal,
          cleanedVal,
          comments: updatedComments
        }));
      }
    } catch (err) {
      alert('Error al re-generar con ajuste: ' + err.message);
    } finally {
      setIsIterating(false);
    }
  };

  return (
    <div className="no-print" style={{
      marginTop: '2rem',
      padding: '1.25rem',
      background: 'var(--bg-panel-hover)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      fontSize: '0.85rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      {diffModalData && (
        <DiffReviewModal
          isOpen={diffModalData.isOpen}
          onClose={() => setDiffModalData(null)}
          fieldLabel={diffModalData.fieldLabel}
          oldText={diffModalData.oldText}
          newText={diffModalData.newText}
          comments={diffModalData.comments}
          onAccept={handleAcceptDiff}
          onIterate={handleIterateDiff}
          isIterating={isIterating}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Bot size={16} style={{ color: 'var(--accent-color)' }} />
        <strong style={{ color: 'var(--text-primary)' }}>Refinar Sección / Campo con IA (con Diff Visual)</strong>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Campo a corregir:</span>
          <select 
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {fields.map(f => (
              <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {selectedField && (
          <div style={{ borderLeft: '3px solid var(--accent-color)', paddingLeft: '0.75rem', margin: '0.25rem 0' }}>
            <FieldCommentSection 
              pillarKey={pillarKey}
              moduleKey={moduleKey}
              fieldKey={selectedField}
              planData={planData}
              addComment={addComment}
              deleteComment={deleteComment}
            />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Retroalimentación / Instrucciones para corregir este campo:</span>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Ej: Agrega el aspecto tecnológico mencionando la integración de servidores locales y base de datos relacional..."
            disabled={isGenerating}
            rows={2}
            style={{
              width: '100%',
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '8px',
              padding: '0.5rem 0.75rem',
              fontSize: '0.85rem',
              resize: 'vertical',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleRefine}
            disabled={isGenerating}
            className="btn btn-ia"
            style={{
              padding: '0.4rem 1rem',
              fontSize: '0.75rem',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                <span>Generando Diff...</span>
              </>
            ) : (
              <>
                <BrainCircuit size={12} />
                <span>Revisar Cambios (Diff)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function VistaPrevia() {
  const { planData, updateConfig, manualSaveProject, updateSection, addComment, deleteComment } = usePlan();
  const [printMargin, setPrintMargin] = React.useState(0.8); // Margen en cm
  const [zoomLevel, setZoomLevel] = React.useState(100); // Nivel de Zoom en % (50% a 150%)
  const [fitToWidth, setFitToWidth] = React.useState(false); // Modo de ajuste automático al ancho de ventana
  const [refactorStatus, setRefactorStatus] = React.useState({ active: false, total: 0, completed: 0, currentField: '' });

  const commentedFieldsCount = useMemo(() => {
    const commentsObj = planData.config?.comments || {};
    return Object.values(commentsObj).filter(arr => Array.isArray(arr) && arr.length > 0).length;
  }, [planData.config?.comments]);

  const handleRefactorWithComments = async () => {
    const commentsObj = planData.config?.comments || {};
    const activeCommentedFields = [];

    Object.entries(commentsObj).forEach(([key, comments]) => {
      if (Array.isArray(comments) && comments.length > 0) {
        activeCommentedFields.push({ key, comments });
      }
    });

    if (activeCommentedFields.length === 0) return;

    const confirmMsg = `Se guardará la versión actual y se creará una NUEVA versión con las correcciones sugeridas en los ${activeCommentedFields.length} campos comentados.\n\n¿Deseas continuar?`;
    if (!window.confirm(confirmMsg)) return;

    setRefactorStatus({
      active: true,
      total: activeCommentedFields.length,
      completed: 0,
      currentField: 'Guardando versión actual...'
    });

    try {
      await manualSaveProject(planData);

      const currentName = planData.config?.brandKit?.companyName || 'Proyecto';
      let newName = '';
      const match = currentName.match(/(.+?)\s+v(\d+)$/i);
      if (match) {
        const baseName = match[1];
        const version = parseInt(match[2], 10) + 1;
        newName = `${baseName} v${version}`;
      } else {
        newName = `${currentName} v2`;
      }

      const newPlanData = JSON.parse(JSON.stringify(planData));
      newPlanData.config.brandKit.companyName = newName;
      newPlanData.config.projectId = undefined; // Forzar creación de nuevo archivo en backend

      const { refactorFieldWithComments } = await import('../lib/ai');

      let count = 0;
      for (const item of activeCommentedFields) {
        const parts = item.key.split('.');
        if (parts.length === 3) {
          const [pillar, moduleKey, fieldKey] = parts;
          const currentValue = planData[pillar]?.[moduleKey]?.[fieldKey] || '';
          
          const framework = FRAMEWORKS[planData.config?.projectType || 'business'] || FRAMEWORKS.business;
          let fieldLabel = fieldKey;
          const p = framework.pillars.find(pil => pil.key === pillar);
          if (p) {
            const m = p.modules.find(mod => mod.key === moduleKey);
            if (m) {
              fieldLabel = `${m.title} - ${fieldKey.replace(/_/g, ' ')}`;
            }
          }

          setRefactorStatus(prev => ({
            ...prev,
            currentField: `Refactorizando: ${fieldLabel}...`
          }));

          try {
            const correctedText = await refactorFieldWithComments(planData.config.ai, {
              fieldLabel,
              currentValue,
              comments: item.comments,
              planData
            });

            if (correctedText) {
              const cleanedText = cleanMarkdownResponse(correctedText);
              if (newPlanData[pillar] && newPlanData[pillar][moduleKey]) {
                newPlanData[pillar][moduleKey][fieldKey] = cleanedText;
              }
              if (newPlanData.config?.comments?.[item.key]) {
                delete newPlanData.config.comments[item.key];
              }
            }
          } catch (err) {
            console.error(`Error refactorizando campo ${item.key}:`, err);
            alert(`Fallo en el campo "${fieldLabel}": ${err.message}. Se conservará el texto original.`);
          }
        }
        count++;
        setRefactorStatus(prev => ({
          ...prev,
          completed: count
        }));
      }

      setRefactorStatus(prev => ({
        ...prev,
        currentField: 'Guardando nueva versión...'
      }));

      const newFileId = await manualSaveProject(newPlanData);
      
      setRefactorStatus({ active: false, total: 0, completed: 0, currentField: '' });
      
      if (newFileId) {
        alert(`¡Corrección completada con éxito!\nSe ha creado y guardado la nueva versión: "${newName}"`);
      } else {
        alert('Se procesaron las correcciones en memoria, pero hubo un error al guardarlas en disco.');
      }
    } catch (error) {
      console.error('Error general en el proceso de refactorización:', error);
      alert(`Ocurrió un error inesperado: ${error.message}`);
      setRefactorStatus({ active: false, total: 0, completed: 0, currentField: '' });
    }
  };

  // Orientación global y modo de paginación desde config (persistente)
  const globalOrientation = planData.config?.globalOrientation || 'portrait';
  const setGlobalOrientation = (val) => updateConfig('globalOrientation', null, val);

  const paginationMode = planData.config?.paginationMode || 'module-per-page';
  const setPaginationMode = (val) => updateConfig('paginationMode', null, val);

  const CorporatePrintHeader = ({ sectionTitle, pillarTitle }) => {
    const brandKit = planData?.config?.brandKit || {};
    const companyName = brandKit.companyName || 'Plan Estratégico';
    const logoUrl = brandKit.logoUrl;
    const primaryColor = brandKit.primaryColor || '#6366f1';

    return (
      <div className="print-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo" 
              style={{ height: '22px', width: 'auto', maxHeight: '22px', objectFit: 'contain' }} 
            />
          ) : (
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              background: primaryColor,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 800
            }}>
              {companyName.charAt(0).toUpperCase()}
            </div>
          )}
          <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.78rem' }}>
            {companyName}
          </span>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
          <span>
            {pillarTitle ? `${pillarTitle} · ` : ''}{sectionTitle || ''}
          </span>
        </div>
      </div>
    );
  };

  const CorporatePrintFooter = ({ pageNum, sectionName }) => {
    const brandKit = planData?.config?.brandKit || {};
    const companyName = brandKit.companyName || 'Plan de Negocios';
    const currentDate = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
      <div className="print-page-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <strong style={{ color: '#334155' }}>{companyName}</strong>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Documento Confidencial</span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ color: '#94a3b8' }}>{currentDate}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {sectionName && <span style={{ color: '#94a3b8' }}>{sectionName}</span>}
          <strong style={{ color: '#1e293b' }}>Pág. {pageNum}</strong>
        </div>
      </div>
    );
  };

  const previewFinancialData = useMemo(() => {
    try {
      const raw = planData?.organizacion?.estados_financieros?.corrida_automatica;
      if (raw && typeof raw === 'string') {
        return JSON.parse(raw);
      }
    } catch {}

    // Fallback: calcular corrida financiera al vuelo si no existe
    try {
      const banxicoData = planData.naturaleza?.pestel?.indicadores_banxico || {};
      const currentInflation = banxicoData.inflacion ? parseFloat(banxicoData.inflacion) : 4.5;
      const currentTIIE = banxicoData.tiie ? parseFloat(banxicoData.tiie) : 10;
      const estimatedWACC = currentTIIE + 2.0;

      const capexRows = readJson(planData.organizacion?.inversion?.desglose_capex_json, []);
      const opexRows = readJson(planData.organizacion?.costos?.desglose_opex_json, []);
      const revenueRows = readJson(planData.organizacion?.estados_financieros?.ingresos_json, []);

      // Intentar extraer cifras de los textos descriptivos
      let initialInvestmentVal = 120000;
      let annualSalesGoalVal = 500000;
      let monthlyFixedCostsVal = 15000;
      let monthlyVariableCostsVal = 8000;

      // Buscar si hay números en el texto de inversión
      const inversionTexto = planData.organizacion?.inversion?.monto_total || planData.organizacion?.inversion?.capex || planData.semilla?.finanzas?.inversion_total || '';
      if (inversionTexto) {
        initialInvestmentVal = parseNumericAmount(inversionTexto, 120000);
      }

      // Buscar si hay números en costos fijos
      const fijosTexto = planData.organizacion?.costos?.fijos || planData.semilla?.finanzas?.costos_fijos || '';
      if (fijosTexto) {
        const rawFijos = parseNumericAmount(fijosTexto, 180000);
        monthlyFixedCostsVal = rawFijos > 1000000 ? Math.round(rawFijos / 12) : rawFijos;
      }

      // Buscar si hay números en costos variables
      const variablesTexto = planData.organizacion?.costos?.variables || '';
      if (variablesTexto) {
        const rawVars = parseNumericAmount(variablesTexto, 96000);
        monthlyVariableCostsVal = rawVars > 1000000 ? Math.round(rawVars / 12) : rawVars;
      }

      // Buscar si hay números en resultados de ventas
      const resultadosTexto = planData.organizacion?.estados_financieros?.resultados || planData.semilla?.finanzas?.meta_ingresos || '';
      if (resultadosTexto) {
        annualSalesGoalVal = parseNumericAmount(resultadosTexto, 500000);
      }

      const financeData = {
        projectDuration: 5,
        taxRate: 30,
        discountRate: estimatedWACC,
        inflationRate: currentInflation,
        annualSalesGoal: annualSalesGoalVal,
        annualSalesGrowth: 5,
        monthlyFixedCosts: monthlyFixedCostsVal,
        monthlyVariableCosts: monthlyVariableCostsVal,
        annualCostGrowth: 3,
        initialInvestment: initialInvestmentVal,
      };

      const investmentItems = capexRows.length > 0
        ? capexRows.map((row, index) => ({
            id: index + 1,
            name: row.concepto || row.name || `Inversión ${index + 1}`,
            amount: parseNumericAmount(row.monto || row.amount),
            type: ['Activo Fijo', 'Activo Diferido', 'Capital de Trabajo'].includes(row.tipo) ? row.tipo : 'Activo Fijo',
            acquisitionSource: row.fuente || 'Aportación (Nuevo)',
          })).filter((row) => row.amount > 0)
        : [{ id: 1, name: 'Inversión Inicial Base', amount: financeData.initialInvestment, type: 'Activo Fijo', acquisitionSource: 'Aportación (Nuevo)' }];

      const recurringRevenues = revenueRows.length > 0
        ? revenueRows.map((row, index) => ({
            id: index + 1,
            name: row.concepto || row.name || `Ingreso ${index + 1}`,
            initialMonthlyAmount: parseNumericAmount(row.mensual || (parseNumericAmount(row.anual) / 12) || 0),
            annualGrowthRates: Array(financeData.projectDuration).fill(parseNumericAmount(row.crecimiento || financeData.annualSalesGrowth || 0)),
          })).filter((row) => row.initialMonthlyAmount > 0)
        : [{ id: 1, name: 'Ventas Proyectadas', initialMonthlyAmount: financeData.annualSalesGoal / 12, annualGrowthRates: Array(financeData.projectDuration).fill(financeData.annualSalesGrowth) }];

      const recurringExpenses = opexRows.length > 0
        ? opexRows.map((row, index) => ({
            id: index + 1,
            name: row.concepto || row.name || `Gasto ${index + 1}`,
            type: isVariableOpex(row) ? 'Variable' : 'Fijo',
            initialMonthlyAmount: parseNumericAmount(row.mensual || 0),
            growthType: 'annual',
            monthlyGrowthRate: 0,
            annualGrowthRates: Array(financeData.projectDuration).fill(financeData.annualCostGrowth),
          })).filter((row) => row.initialMonthlyAmount > 0)
        : [
            { id: 1, name: 'Costos Fijos Operativos', type: 'Fijo', initialMonthlyAmount: financeData.monthlyFixedCosts, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: Array(financeData.projectDuration).fill(financeData.annualCostGrowth) },
            { id: 2, name: 'Costos Variables Estimados', type: 'Variable', initialMonthlyAmount: financeData.monthlyVariableCosts, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: Array(financeData.projectDuration).fill(financeData.annualCostGrowth) },
          ];

      const projData = {
        projectDuration: financeData.projectDuration,
        taxRate: financeData.taxRate,
        discountRate: financeData.discountRate,
        inflationRate: financeData.inflationRate,
        minimumAcceptableIRR: financeData.discountRate,
        investmentItems,
        depreciableAssets: [],
        recurringRevenues,
        recurringExpenses,
        loans: [],
        payrollConfig: {
          positions: [],
          temporaryEmployees: 0,
          temporaryEmployeeSalary: 0,
          dailyMinimumWage: 250,
          vacationDaysPerYear: 12,
          vacationBonusRate: 25,
          socialChargesRate: 30,
          annualSalaryGrowthRate: 5,
        },
        workingCapitalConfig: { requiredMonthsOfFixedCosts: 3 },
        advancedConfig: { products: [] },
      };

      const result = calculateFinancialProjections(projData, 'years');
      return result;
    } catch (e) {
      console.error("Error calculating fallback projections in VistaPrevia: ", e);
      return null;
    }
  }, [planData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const mermaid = window.mermaid;
      if (mermaid) {
        mermaid.initialize({ 
          startOnLoad: false, 
          theme: 'neutral',
          securityLevel: 'loose',
        });
        mermaid.run();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [planData]);

  // Verifica si un módulo tiene contenido real
  const hasContent = (data) => {
    if (!data) return false;
    return Object.values(data).some(v => v && typeof v === 'string' && v.trim().length > 0);
  };

  // Mostrar siempre en vista previa si existe el módulo
  const shouldShow = (_pillar, _module) => {
    return true; 
  };

  // Resolver Framework y Módulos Activos
  const projectType = planData?.config?.projectType || 'business';
  const currentFramework = FRAMEWORKS[projectType] || FRAMEWORKS.business;

  const allFrameworkModules = useMemo(() => {
    const list = [];
    currentFramework.pillars.forEach(pillar => {
      if (pillar.key === 'simulador_financiero') return;
      pillar.modules.forEach(mod => {
        list.push({
          pillarKey: pillar.key,
          pillarTitle: pillar.title,
          key: mod.key,
          title: mod.title
        });
      });
    });
    return list;
  }, [currentFramework]);

  // Ordenar módulos basado en planData.config.moduleOrder
  const orderedModules = useMemo(() => {
    const order = planData.config?.moduleOrder || [];
    if (order.length === 0) return allFrameworkModules;
    const sorted = [...allFrameworkModules].sort((a, b) => {
      const indexA = order.indexOf(a.key);
      const indexB = order.indexOf(b.key);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    return sorted;
  }, [allFrameworkModules, planData.config?.moduleOrder]);

  // Calcular números de página estimados para el índice y los pies de página
  const { modulePageNumbers, financialReportsPage, anexosPage, sourcesPage } = useMemo(() => {
    const pageNumbers = {};
    let currentPage = 3; // Portada es 1, Índice es 2. Primer módulo inicia en 3.

    if (paginationMode === 'continuous') {
      let accumPages = 0;
      orderedModules.forEach((mod) => {
        if (!shouldShow(mod.pillarKey, mod.key)) return;
        pageNumbers[mod.key] = currentPage;
        
        let density = 0.45;
        if (mod.key === 'estados_financieros' || mod.key === 'pestel' || mod.key === 'foda' || mod.key === 'segmentacion') {
          density = 0.9;
        }
        accumPages += density;
        if (accumPages >= 1) {
          const fullPages = Math.floor(accumPages);
          currentPage += fullPages;
          accumPages = accumPages - fullPages;
        }
      });
      if (accumPages > 0.2) {
        currentPage += 1;
      }
    } else {
      orderedModules.forEach(mod => {
        if (!shouldShow(mod.pillarKey, mod.key)) return;
        pageNumbers[mod.key] = currentPage;
        
        let estimatedPages = 1;
        if (mod.key === 'estados_financieros') {
          estimatedPages = 2; // Presupuesto + Balance General
        } else if (mod.key === 'segmentacion') {
          estimatedPages = 2; // TAM/SAM/SOM + Buyer Persona
        }
        currentPage += estimatedPages;
      });
    }

    const reportsPage = currentPage;
    if (previewFinancialData) {
      currentPage += 3; // Estimación de páginas para reportes financieros pro-forma
    }

    const aPage = currentPage;
    if (planData?.config?.anexos?.length > 0) {
      currentPage += 1;
    }

    const sPage = currentPage; // Fuentes de Información siempre al final
    return {
      modulePageNumbers: pageNumbers,
      financialReportsPage: reportsPage,
      anexosPage: aPage,
      sourcesPage: sPage
    };
  }, [orderedModules, previewFinancialData, planData?.config?.anexos, paginationMode]);

  // Manejadores de ordenamiento y orientación
  const handleOrientationChange = (modKey, value) => {
    updateConfig('pageOrientations', modKey, value);
  };

  const moveModuleUp = (modKey) => {
    const currentOrder = orderedModules.map(m => m.key);
    const index = currentOrder.indexOf(modKey);
    if (index > 0) {
      const newOrder = [...currentOrder];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      updateConfig('moduleOrder', null, newOrder);
    }
  };

  const moveModuleDown = (modKey) => {
    const currentOrder = orderedModules.map(m => m.key);
    const index = currentOrder.indexOf(modKey);
    if (index >= 0 && index < currentOrder.length - 1) {
      const newOrder = [...currentOrder];
      [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
      updateConfig('moduleOrder', null, newOrder);
    }
  };

  // Componente de Sección con numeración recibida dinámicamente
  const Section = ({ number, title, data, pillarKey, moduleKey }) => {
    if (!data) return null;
    
    // Filtrar solo campos con contenido y excluir estructuras JSON internas
    const filledFields = Object.entries(data).filter(([key, value]) => {
      if (key === 'heatmap_data' || key === 'corrida_automatica' || key.endsWith('_json')) return false;
      if (!value) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return true;
    });

    return (
      <div className={`preview-section ${filledFields.length === 0 ? 'empty-section' : ''}`} style={{ 
        marginBottom: '1.5rem',
        opacity: filledFields.length === 0 ? 0.4 : 1,
        border: filledFields.length === 0 ? '1px dashed #e2e8f0' : 'none',
        padding: filledFields.length === 0 ? '1rem' : '0',
        pageBreakInside: 'avoid'
      }}>
        <h3 style={{ color: '#1e293b', fontSize: '1.25rem', borderLeft: '4px solid var(--accent-color)', paddingLeft: '1rem', marginBottom: '1rem', fontWeight: 800 }}>
          {number} {title} {filledFields.length === 0 && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>(Sin contenido)</span>}
        </h3>
        {filledFields.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', paddingLeft: '1.25rem' }}>
            Este módulo aún no ha sido redactado por la IA o manualmente.
          </p>
        ) : (
          <div style={{ paddingLeft: '1.25rem' }}>
            {filledFields.map(([key, value]) => {
              let displayValue = value;
              if (typeof value !== 'string') {
                displayValue = safeStr(value);
              }

              if (typeof displayValue === 'string') {
                displayValue = displayValue.replace(/\\n/g, '\n');
              }

              const looksLikeMermaid = typeof displayValue === 'string' && /^(graph|flowchart)\s+/i.test(displayValue.trim());
              if (key.includes('visual') || key === 'diagrama' || looksLikeMermaid) {
                return (
                  <div key={key} style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
                     <MermaidViewer chart={displayValue} theme="light" />
                  </div>
                );
              }
              
              return (
                <div key={key} style={{ marginBottom: '1rem' }}>
                  <strong style={{ display: 'block', color: '#64748b', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {key.replace(/_/g, ' ')}
                  </strong>
                  <div style={{ marginTop: '0.25rem', color: '#334155', lineHeight: '1.6' }} className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {displayValue}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Comentarios de corrección para este aspecto específico */}
                  <FieldCommentSection 
                    pillarKey={pillarKey}
                    moduleKey={moduleKey}
                    fieldKey={key}
                    planData={planData}
                    addComment={addComment}
                    deleteComment={deleteComment}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const PayrollTable = () => {
    const staff = planData?.organizacion?.staff || [];
    if (staff.length === 0) return null;

    const riskRates = {
      1: 0.0054355,
      2: 0.0113065,
      3: 0.0259840,
      4: 0.0465325,
      5: 0.0758875
    };

    const getIntegratedSalary = (salary, riskClassVal = 1) => {
      const base = Number(salary || 0);
      const rate = riskRates[riskClassVal || 1] || riskRates[1];
      const socialCharges = 0.23 + rate;
      return base * (1 + socialCharges);
    };

    const getRiskClassLabel = (val) => {
      switch(Number(val)) {
        case 1: return 'I (0.54%)';
        case 2: return 'II (1.13%)';
        case 3: return 'III (2.60%)';
        case 4: return 'IV (4.65%)';
        case 5: return 'V (7.59%)';
        default: return 'I (0.54%)';
      }
    };

    const getTypeLabel = (val) => {
      switch(val) {
        case 'temporal': return 'Temporal';
        case 'proyecto': return 'Proyecto';
        default: return 'Permanente';
      }
    };

    const totalBase = staff.reduce((acc, curr) => acc + (curr.salary || 0), 0);
    const totalIntegrated = staff.reduce((acc, curr) => acc + getIntegratedSalary(curr.salary, curr.riskClass), 0);

    return (
      <div style={{ marginBottom: '1.5rem', pageBreakInside: 'avoid', marginTop: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', color: '#475569', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
          Estructura de Plantilla, Carga Social y Nómina (NIF/IMSS)
        </h4>
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Puesto</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Contrato</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Riesgo IMSS</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#475569' }}>Sueldo Base</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#475569' }}>Carga Social</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#475569' }}>Sueldo Integrado</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(emp => {
                const base = emp.salary || 0;
                const integrated = getIntegratedSalary(emp.salary, emp.riskClass);
                const social = integrated - base;
                return (
                  <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{emp.role}</td>
                    <td style={{ padding: '0.75rem' }}>{getTypeLabel(emp.type)}</td>
                    <td style={{ padding: '0.75rem' }}>{getRiskClassLabel(emp.riskClass)}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>${base.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b' }}>${Math.round(social).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>${Math.round(integrated).toLocaleString()}</td>
                  </tr>
                );
              })}
              <tr style={{ fontWeight: '700', background: '#f8fafc', borderTop: '2px solid #cbd5e1' }}>
                <td colSpan="3" style={{ padding: '0.75rem' }}>TOTAL MENSUAL</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>${totalBase.toLocaleString()}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b' }}>${Math.round(totalIntegrated - totalBase).toLocaleString()}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#10b981' }}>${Math.round(totalIntegrated).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Renderizar la Portada Personalizada
  const renderCoverPage = () => {
    const cover = planData.config?.coverDesign || {
      layout: 'classic',
      logoSize: 'medium',
      logoAlign: 'center',
      titleSize: 'medium',
      creatorName: '',
      subtitle: 'Plan Estratégico Maestro',
      institution: 'Formulación y Evaluación Académica 2026',
      showDate: true,
      customDate: ''
    };

    const isSidebar = cover.layout === 'sidebar';
    const isModern = cover.layout === 'modern';
    const isMinimalist = cover.layout === 'minimalist';
    
    const logoWidth = cover.logoSize === 'small' ? '80px' : cover.logoSize === 'large' ? '180px' : '130px';
    const logoAlignment = cover.logoAlign === 'left' ? 'flex-start' : cover.logoAlign === 'right' ? 'flex-end' : 'center';
    const titleFontSize = cover.titleSize === 'small' ? '2.2rem' : cover.titleSize === 'large' ? '4.2rem' : '3.2rem';
    
    return (
      <div 
        id="portada"
        className="print-page cover-page" 
        style={{ 
          position: 'relative',
          minHeight: '85vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          padding: '4rem 3rem',
          textAlign: isSidebar || isMinimalist ? 'left' : 'center',
          background: '#ffffff',
          color: '#0f172a',
          fontFamily: 'Inter, sans-serif',
          pageBreakAfter: 'always',
          maxWidth: '760px',
          margin: '0 auto 2.5rem auto',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0'
        }}
      >
        {isSidebar && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '24px',
            background: planData.config?.brandKit?.primaryColor || '#6366f1'
          }} />
        )}

        {isModern && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: '20%',
            width: '100%',
            height: '140px',
            background: planData.config?.brandKit?.primaryColor || '#6366f1',
            opacity: 0.08,
            zIndex: 0
          }} />
        )}

        <div style={{ 
          display: 'flex', 
          justifyContent: logoAlignment, 
          width: '100%',
          paddingLeft: isSidebar ? '20px' : '0',
          zIndex: 1
        }}>
          {planData?.config?.brandKit?.logoUrl ? (
            <img 
              src={planData.config.brandKit.logoUrl} 
              alt="Logo" 
              style={{ width: logoWidth, height: 'auto', maxHeight: '140px', objectFit: 'contain' }} 
            />
          ) : (
            <div style={{ height: '50px' }} />
          )}
        </div>

        <div style={{ 
          paddingLeft: isSidebar ? '20px' : '0',
          zIndex: 1,
          margin: 'auto 0'
        }}>
          {isModern && (
            <div style={{ 
              width: '100px', 
              height: '6px', 
              background: planData.config?.brandKit?.primaryColor || '#6366f1', 
              marginBottom: '2rem',
              margin: cover.logoAlign === 'center' ? '0 auto 2rem auto' : '0 0 2rem 0'
            }} />
          )}
          <h1 style={{ 
            fontSize: titleFontSize, 
            fontWeight: '900', 
            marginBottom: '1rem', 
            color: '#0f172a',
            lineHeight: 1.15
          }}>
            {planData?.config?.brandKit?.companyName || 'Plan de Negocios'}
          </h1>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: planData.config?.brandKit?.primaryColor || '#6366f1',
            letterSpacing: '0.05em', 
            textTransform: 'uppercase',
            margin: '0.5rem 0'
          }}>
            {cover.subtitle || 'Plan Estratégico Maestro'}
          </h2>
          {cover.institution && (
            <p style={{ fontSize: '1.1rem', color: '#64748b', marginTop: '1rem' }}>
              {cover.institution}
            </p>
          )}
        </div>

        <div style={{ 
          paddingLeft: isSidebar ? '20px' : '0',
          borderTop: '2px solid #f1f5f9',
          paddingTop: '2rem',
          zIndex: 1
        }}>
          <div style={{ fontSize: '1.2rem', color: '#1e293b', fontWeight: '700' }}>
            {cover.creatorName ? `Creado por: ${cover.creatorName}` : 'Elaborado por: Roberto Eduardo Celis Robles'}
          </div>
          {cover.showDate !== false && (
            <div style={{ fontSize: '1rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              {cover.customDate || new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          )}
          {/* Logos Institucionales */}
          {(cover.institutionLogos?.length > 0) && (
            <div style={{ 
              display: 'flex', 
              justifyContent: isSidebar ? 'flex-start' : 'center', 
              gap: '1.5rem', 
              marginTop: '1.5rem', 
              paddingTop: '1rem', 
              borderTop: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              {cover.institutionLogos.map(logo => (
                <div key={logo.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <img src={logo.url} alt={logo.name} style={{ height: '45px', width: 'auto', maxWidth: '100px', objectFit: 'contain' }} />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>{logo.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="module-view">
      <style>{`
        @media print {
          @page {
            size: ${globalOrientation};
            margin: ${printMargin}cm;
          }
          ${paginationMode === 'continuous' ? `
          .portrait-print-page,
          .landscape-print-page,
          .toc-page,
          .financial-reports-page,
          .anexos-page {
            page: auto !important;
            break-before: auto !important;
            page-break-before: auto !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .cover-page {
            break-before: avoid !important;
            page-break-before: avoid !important;
            break-after: page !important;
            page-break-after: always !important;
          }
          ` : `
          @page portraitPage {
            size: portrait;
            margin: ${printMargin}cm;
          }
          @page landscapePage {
            size: landscape;
            margin: ${printMargin}cm;
          }
          .portrait-print-page {
            page: portraitPage;
            break-before: page;
            page-break-before: always;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .landscape-print-page {
            page: landscapePage;
            break-before: page;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .cover-page {
            page: portraitPage;
            break-before: avoid;
          }
          .toc-page {
            page: portraitPage;
            break-before: page;
            break-inside: avoid !important;
          }
          .financial-reports-page {
            page: landscapePage;
            break-before: page;
          }
          .anexos-page {
            page: portraitPage;
            break-before: page;
          }
          `}
          .no-print {
            display: none !important;
          }
          .print-page-header {
            display: flex !important;
          }
          .print-page-footer {
            display: flex !important;
          }
        }
        .print-page-header {
          display: none;
        }
        .print-page-footer {
          display: none;
        }
      `}</style>
      
      <div className="view-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="view-title">Vista Previa Maestro</h1>
          <p className="text-secondary mt-1">Arrastra u ordena secciones, define orientaciones individuales por página e imprime el reporte final.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Selector de Orientación Global */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'var(--bg-panel)', 
            backdropFilter: 'var(--glass-blur)',
            padding: '0.5rem 0.8rem', 
            borderRadius: '10px', 
            border: '1px solid var(--border-color)' 
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Global:</span>
            <select
              value={globalOrientation}
              onChange={(e) => setGlobalOrientation(e.target.value)}
              style={{
                background: 'var(--bg-dark)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                borderRadius: '6px',
                padding: '3px 8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <option value="portrait">Vertical 📄</option>
              <option value="landscape">Horizontal 📑</option>
            </select>
          </div>

          {/* Selector de Modo de Paginación */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'var(--bg-panel)', 
            backdropFilter: 'var(--glass-blur)',
            padding: '0.5rem 0.8rem', 
            borderRadius: '10px', 
            border: '1px solid var(--border-color)' 
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paginación:</span>
            <select
              value={paginationMode}
              onChange={(e) => setPaginationMode(e.target.value)}
              style={{
                background: 'var(--bg-dark)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                borderRadius: '6px',
                padding: '3px 8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <option value="module-per-page">Hoja por Módulo 📄</option>
              <option value="continuous">Flujo Continuo 📜</option>
            </select>
          </div>

          {/* Selector de Margen */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            background: 'var(--bg-panel)', 
            backdropFilter: 'var(--glass-blur)',
            padding: '0.5rem 0.8rem', 
            borderRadius: '10px', 
            border: '1px solid var(--border-color)' 
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Margen: <strong style={{ color: 'var(--accent-color)' }}>{printMargin}cm</strong></span>
            <input 
              type="range" 
              min="0.3" 
              max="3.0" 
              step="0.1" 
              value={printMargin} 
              onChange={(e) => setPrintMargin(parseFloat(e.target.value))}
              style={{ 
                width: '80px', 
                accentColor: 'var(--accent-color)', 
                cursor: 'pointer',
                height: '4px',
                borderRadius: '2px',
                background: 'var(--border-color)',
                outline: 'none'
              }}
            />
          </div>

          {/* Controles de Zoom y Ajuste de Ancho (Estilo Visor PDF) */}
          <div className="zoom-controls" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            background: 'var(--bg-panel)', 
            backdropFilter: 'var(--glass-blur)',
            padding: '0.4rem 0.6rem', 
            borderRadius: '10px', 
            border: '1px solid var(--border-color)' 
          }}>
            <button 
              type="button"
              title="Alejar Zoom (Ctrl/Cmd -)" 
              onClick={() => { setFitToWidth(false); setZoomLevel(prev => Math.max(50, prev - 10)); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                padding: '4px 6px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              className="hover:bg-[var(--bg-panel-hover)]"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span style={{ fontSize: '0.78rem', fontWeight: 700, minWidth: '42px', textAlign: 'center', color: fitToWidth ? 'var(--accent-color)' : 'var(--text-primary)' }}>
              {fitToWidth ? 'Auto' : `${zoomLevel}%`}
            </span>

            <button 
              type="button"
              title="Acercar Zoom (Ctrl/Cmd +)" 
              onClick={() => { setFitToWidth(false); setZoomLevel(prev => Math.min(160, prev + 10)); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                padding: '4px 6px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              className="hover:bg-[var(--bg-panel-hover)]"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div style={{ width: '1px', height: '18px', background: 'var(--border-color)', margin: '0 2px' }} />

            <button 
              type="button"
              title={fitToWidth ? 'Restablecer a vista normal' : 'Ajustar al ancho de la ventana'} 
              onClick={() => { setFitToWidth(!fitToWidth); if (!fitToWidth) setZoomLevel(100); }}
              style={{
                background: fitToWidth ? 'var(--accent-color)' : 'transparent',
                border: 'none',
                color: fitToWidth ? '#ffffff' : 'var(--text-primary)',
                padding: '4px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Ajustar Ancho</span>
            </button>

            {zoomLevel !== 100 && !fitToWidth && (
              <button 
                type="button"
                title="Restablecer al 100%" 
                onClick={() => { setZoomLevel(100); setFitToWidth(false); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {commentedFieldsCount > 0 && (
            <button 
              className="btn btn-primary" 
              onClick={handleRefactorWithComments} 
              disabled={refactorStatus.active}
              style={{ 
                height: '42px', 
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 
                border: 'none',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Wand2 className="w-4 h-4" />
              <span>Corregir con IA ({commentedFieldsCount})</span>
            </button>
          )}

          <button className="btn btn-primary" onClick={() => window.print()} style={{ height: '42px' }}>
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      <div 
        className="preview-viewport-wrapper"
        style={{
          width: '100%',
          overflowX: 'auto',
          display: 'flex',
          justifyContent: 'center',
          paddingBottom: '3rem'
        }}
      >
        <div className="preview-document print-preview-mode" style={{ 
          background: 'transparent', 
          color: '#1e293b', 
          width: fitToWidth ? '100%' : `${zoomLevel}%`,
          maxWidth: fitToWidth ? '100%' : (zoomLevel > 100 ? `${(zoomLevel / 100) * 1100}px` : '100%'),
          transform: (!fitToWidth && zoomLevel !== 100) ? `scale(${zoomLevel / 100})` : 'none',
          transformOrigin: 'top center',
          margin: '0 auto',
          transition: 'all 0.25s ease'
        }}>
        
        {/* Render de la Portada Personalizada */}
        {renderCoverPage()}

        {/* Índice / Tabla de Contenidos */}
        <div id="indice" className="print-page toc-page" style={{ 
          minHeight: paginationMode === 'continuous' ? 'auto' : '70vh', 
          padding: '3rem 2.5rem', 
          pageBreakBefore: 'always', 
          fontFamily: 'Inter, sans-serif',
          background: '#ffffff',
          maxWidth: '760px',
          margin: '0 auto 2.5rem auto',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <CorporatePrintHeader sectionTitle="Índice de Contenido" pillarTitle="Estructura General" />
            
            <h2 style={{ fontSize: '1.75rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Índice de Contenido
            </h2>
            <div className="toc-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', maxWidth: '100%' }}>
              <a href="#portada" className="toc-item-link">
                <span style={{ fontWeight: 600, color: '#1e293b' }}>Portada Institucional</span>
                <span className="toc-dot-leader" />
                <span className="toc-page-badge">1</span>
              </a>
              <div className="toc-item-link" style={{ pointerEvents: 'none' }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>Índice General</span>
                <span className="toc-dot-leader" />
                <span className="toc-page-badge">2</span>
              </div>
              
              {orderedModules.map((mod, idx) => {
                const pageNum = modulePageNumbers[mod.key];
                if (!pageNum) return null;
                return (
                  <a key={mod.key} href={`#seccion-${mod.key}`} className="toc-item-link" style={{ paddingLeft: '0.5rem' }}>
                    <span style={{ color: '#334155', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ color: 'var(--accent-color, #6366f1)', fontWeight: 700, marginRight: '0.35rem' }}>{idx + 1}.</span>
                      {mod.title}
                    </span>
                    <span className="toc-dot-leader" />
                    <span className="toc-page-badge">{pageNum}</span>
                  </a>
                );
              })}

              {previewFinancialData && (
                <a href="#seccion-reportes-financieros" className="toc-item-link">
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>Reportes Financieros (5 Años)</span>
                  <span className="toc-dot-leader" />
                  <span className="toc-page-badge">{financialReportsPage}</span>
                </a>
              )}

              {planData?.config?.anexos?.length > 0 && (
                <a href="#seccion-anexos" className="toc-item-link">
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>Anexos Documentales</span>
                  <span className="toc-dot-leader" />
                  <span className="toc-page-badge">{anexosPage}</span>
                </a>
              )}

              <a href="#seccion-fuentes" className="toc-item-link">
                <span style={{ fontWeight: 600, color: '#1e293b' }}>Fuentes y APIs</span>
                <span className="toc-dot-leader" />
                <span className="toc-page-badge">{sourcesPage}</span>
              </a>
            </div>
          </div>

          <CorporatePrintFooter pageNum={2} sectionName="Índice" />
        </div>

        {/* Renderizar cada pilar/módulo en su orden seleccionado */}
        {orderedModules.map((mod, idx) => {
          if (!shouldShow(mod.pillarKey, mod.key)) return null;

          const sectionNumber = `${idx + 1}.`;
          const individualOrientation = planData.config?.pageOrientations?.[mod.key];
          const orientation = individualOrientation || globalOrientation;
          const isLandscape = orientation === 'landscape';
          const pageClass = isLandscape ? 'landscape-print-page' : 'portrait-print-page';
          const pageNum = modulePageNumbers[mod.key];

          const isFirst = idx === 0;
          const isLast = idx === orderedModules.length - 1;

          return (
            <React.Fragment key={mod.key}>
              <div 
                id={`seccion-${mod.key}`}
                className={`print-page ${pageClass}`} 
                style={{ 
                  marginTop: paginationMode === 'continuous' ? '1rem' : '2.5rem',
                  width: '100%',
                  maxWidth: isLandscape ? '1080px' : '760px',
                  margin: paginationMode === 'continuous' ? '0 auto 1rem auto' : '0 auto 2.5rem auto',
                  background: '#ffffff',
                  padding: `${printMargin}cm`,
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease',
                  pageBreakBefore: paginationMode === 'continuous' ? 'auto' : 'always',
                  pageBreakInside: 'avoid',
                  scrollMarginTop: '2rem'
                }}
              >
                
                {/* Control bar for screen view */}
                <div className="no-print" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '0.5rem 1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.8rem',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Sección {idx + 1}:</span>
                    <strong style={{ color: 'var(--accent-color)' }}>{mod.title}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Orientación:</span>
                      <select 
                        value={orientation}
                        onChange={(e) => handleOrientationChange(mod.key, e.target.value)}
                        style={{
                          background: 'var(--bg-dark)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        <option value="portrait">Vertical 📄</option>
                        <option value="landscape">Horizontal 📑</option>
                      </select>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button 
                        onClick={() => moveModuleUp(mod.key)} 
                        disabled={isFirst}
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '0.75rem', opacity: isFirst ? 0.3 : 1, minWidth: '32px' }}
                        title="Subir"
                      >
                        🔼
                      </button>
                      <button 
                        onClick={() => moveModuleDown(mod.key)} 
                        disabled={isLast}
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '0.75rem', opacity: isLast ? 0.3 : 1, minWidth: '32px' }}
                        title="Bajar"
                      >
                        🔽
                      </button>
                    </div>
                  </div>
                </div>

                {/* Encabezado Corporativo de Impresión */}
                <CorporatePrintHeader sectionTitle={mod.title} pillarTitle={mod.pillarTitle} />

                {/* Content rendering matching the original module key checks */}
                {mod.key === 'foda' ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#0f172a', fontSize: '1.25rem', borderLeft: '4px solid var(--accent-color)', paddingLeft: '1rem', marginBottom: '1.5rem', fontWeight: 800 }}>
                      {sectionNumber} {mod.title}
                    </h3>
                    <FodaMatrix data={planData?.naturaleza?.foda} />
                  </div>
                ) : mod.key === 'pestel' ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#0f172a', fontSize: '1.25rem', borderLeft: '4px solid var(--accent-color)', paddingLeft: '1rem', marginBottom: '1.5rem', fontWeight: 800 }}>
                      {sectionNumber} {mod.title}
                    </h3>
                    <PestelAnalysis data={planData?.naturaleza?.pestel} />
                  </div>
                ) : mod.key === 'identidad' ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Section 
                      number={sectionNumber}
                      title={mod.title} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                    />
                    <BrandBoard data={planData?.naturaleza?.identidad} />
                  </div>
                ) : mod.key === 'benchmarking' ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#0f172a', fontSize: '1.25rem', borderLeft: '4px solid var(--accent-color)', paddingLeft: '1rem', marginBottom: '1.5rem', fontWeight: 800 }}>
                      {sectionNumber} {mod.title}
                    </h3>
                    <BenchmarkingTable data={planData?.mercado?.benchmarking} />
                  </div>
                ) : mod.key === 'recursos' ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Section 
                      number={sectionNumber}
                      title={mod.title} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                    />
                    <MaquinariaTable data={planData?.tecnico?.recursos} planData={planData} />
                  </div>
                ) : mod.key === 'insumos' ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Section 
                      number={sectionNumber}
                      title={mod.title} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                    />
                    <InsumosTable data={planData?.tecnico?.insumos} planData={planData} />
                  </div>
                ) : mod.key === 'capacidad' ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Section 
                      number={sectionNumber}
                      title={mod.title} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                    />
                    <CapacidadInventarioWidget data={planData?.tecnico?.capacidad} />
                  </div>
                ) : mod.key === 'ambiental' ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Section 
                      number={sectionNumber}
                      title={mod.title} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                    />
                    <ImpactoAmbientalWidget data={planData?.tecnico?.ambiental} />
                  </div>
                ) : mod.key === 'costos' ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Section 
                      number={sectionNumber}
                      title={mod.title} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                    />
                    <BreakEvenChart planData={planData} />
                  </div>
                ) : mod.key === 'segmentacion' ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Section 
                      number={sectionNumber}
                      title={mod.title} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                    />
                    {hasContent(planData?.[mod.pillarKey]?.[mod.key]) && (
                      <>
                        <TamSamSom data={planData?.[mod.pillarKey]?.[mod.key]} />
                        <HubspotBuyerPersona value={planData?.[mod.pillarKey]?.[mod.key]?.perfil} />
                      </>
                    )}
                  </div>
                ) : (mod.key === 'arbol_problemas' || mod.key === 'arbol_objetivos') ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.5rem', fontWeight: 800 }}>
                      {sectionNumber} {mod.title}
                    </h3>
                    <ArbolProblemasObjetivos />
                    <Section 
                      number=""
                      title={`Detalle de ${mod.title}`} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                    />
                  </div>
                ) : mod.key === 'matriz_x' ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.5rem', fontWeight: 800 }}>
                      {sectionNumber} {mod.title}
                    </h3>
                    <XMatrixHoshinKanri />
                    <Section 
                      number=""
                      title={`Detalle de ${mod.title}`} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                    />
                  </div>
                ) : (mod.key === 'celulas_autonomas' || mod.key === 'estructura_amebas') ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.5rem', fontWeight: 800 }}>
                      {sectionNumber} {mod.title}
                    </h3>
                    <AmoebaStructureViewer />
                    <Section 
                      number=""
                      title={`Detalle de ${mod.title}`} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                    />
                  </div>
                ) : mod.key === 'canvas' ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.5rem', fontWeight: 800 }}>
                      {sectionNumber} {mod.title}
                    </h3>
                    <BusinessModelCanvas readOnly={true} />
                  </div>
                ) : mod.key === 'estados_financieros' && previewFinancialData ? (
                  <div key={mod.key} style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem', fontWeight: 800 }}>
                      {sectionNumber} {mod.title}
                    </h3>
                    <PresupuestoEmpresa projections={previewFinancialData} staff={planData.organizacion?.staff} planData={planData} />
                    <BalanceGeneralEstandar projections={previewFinancialData} planData={planData} />
                  </div>
                ) : mod.key === 'rentabilidad' && previewFinancialData ? (
                  <div key={mod.key} style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem', fontWeight: 800 }}>
                      {sectionNumber} {mod.title}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>TIR</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.25rem' }}>
                          {Number(previewFinancialData.financialMetrics?.irr || 0).toFixed(2)}%
                        </div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>VAN</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: (previewFinancialData.financialMetrics?.npv || 0) > 0 ? '#10b981' : '#ef4444', marginTop: '0.25rem' }}>
                          {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(previewFinancialData.financialMetrics?.npv || 0)}
                        </div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>ROI</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4f46e5', marginTop: '0.25rem' }}>
                          {Number(previewFinancialData.financialMetrics?.roi || 0).toFixed(1)}%
                        </div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>PAYBACK</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginTop: '0.5rem', lineHeight: 1.1 }}>
                          {(previewFinancialData.financialMetrics?.paybackPeriod || '').replace(/\|/g, ' ')}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : mod.key === 'mapa' ? (
                  <div style={{ marginBottom: '2rem', pageBreakInside: 'avoid' }}>
                    <Section 
                      number={sectionNumber}
                      title={mod.title} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                    />
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        🔥 Mapa de Calor y Densidad de Mercado
                      </h4>
                      <InegiMap
                        token={planData.config?.externalApis?.inegiToken}
                        location={
                          planData?.semilla?.cobertura ||
                          planData?.semilla?.ubicacion ||
                          planData?.semilla?.cliente_ubicacion ||
                          planData?.semilla?.negocio?.ubicacion ||
                          planData?.tecnico?.ubicacion?.micro ||
                          planData?.tecnico?.ubicacion?.macro ||
                          'Cananea, Sonora'
                        }
                        mode="competition"
                        readOnly={true}
                        defaultHeatmap={true}
                        title="Mapa de Calor (Densidad y Concentración)"
                        initialKeywords={planData?.semilla?.negocio?.giro || 'comercial'}
                      />
                    </div>
                  </div>
                ) : mod.key === 'ubicacion' ? (
                  <div style={{ marginBottom: '2rem', pageBreakInside: 'avoid' }}>
                    <Section 
                      number={sectionNumber}
                      title={mod.title} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                    />
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        📍 Localización y Ubicación Estratégica
                      </h4>
                      <InegiMap
                        token={planData.config?.externalApis?.inegiToken}
                        location={
                          planData?.semilla?.cobertura ||
                          planData?.semilla?.ubicacion ||
                          planData?.semilla?.cliente_ubicacion ||
                          planData?.semilla?.negocio?.ubicacion ||
                          planData?.tecnico?.ubicacion?.micro ||
                          planData?.tecnico?.ubicacion?.macro ||
                          'Cananea, Sonora'
                        }
                        mode="location"
                        readOnly={true}
                        title="Mapa de Localización Estratégica"
                      />
                    </div>
                  </div>
                ) : mod.key === 'competencia' ? (
                  <div style={{ marginBottom: '2rem', pageBreakInside: 'avoid' }}>
                    <Section 
                      number={sectionNumber}
                      title={mod.title} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                    />
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        🗺️ Competencia y Saturación Comercial (DENUE)
                      </h4>
                      <InegiMap
                        token={planData.config?.externalApis?.inegiToken}
                        location={
                          planData?.semilla?.cobertura ||
                          planData?.semilla?.ubicacion ||
                          planData?.semilla?.cliente_ubicacion ||
                          planData?.semilla?.negocio?.ubicacion ||
                          planData?.tecnico?.ubicacion?.micro ||
                          planData?.tecnico?.ubicacion?.macro ||
                          'Cananea, Sonora'
                        }
                        mode="competition"
                        readOnly={true}
                        title="Mapa de Competencia y Zonas de Influencia"
                        initialKeywords={planData?.semilla?.negocio?.giro || 'servicios'}
                      />
                    </div>
                  </div>
                ) : (
                  <Section 
                    number={sectionNumber}
                    title={mod.title} 
                    data={planData?.[mod.pillarKey]?.[mod.key]} 
                    pillarKey={mod.pillarKey}
                    moduleKey={mod.key}
                  />
                )}

                {/* Inclusiones condicionales de tablas y gráficos */}
                {mod.pillarKey === 'organizacion' && mod.key === 'estructura' && <PayrollTable />}
                
                {mod.pillarKey === 'organizacion' && mod.key === 'rentabilidad' && previewFinancialData && (
                  <div style={{ marginTop: '2rem' }}>
                    <FinancialCharts staff={planData?.organizacion?.staff} projections={previewFinancialData} showTables={false} />
                  </div>
                )}

                {/* Pie de página con numeración de página calculada */}
                <CorporatePrintFooter pageNum={pageNum} sectionName={mod.title} />
              </div>

              {/* Panel de Refinamiento de IA por módulo individual (oculto al imprimir y fuera de la página) */}
              <div className="no-print" style={{ 
                maxWidth: isLandscape ? '1080px' : '760px', 
                margin: '1.5rem auto 3rem auto',
                padding: '0 0.5rem' 
              }}>
                <ModuleRefinementPanel 
                  pillarKey={mod.pillarKey}
                  moduleKey={mod.key}
                  fields={getModuleFields(mod.pillarKey, mod.key)}
                  planData={planData}
                  updateSection={updateSection}
                  manualSaveProject={manualSaveProject}
                  addComment={addComment}
                  deleteComment={deleteComment}
                />
              </div>
            </React.Fragment>
          );
        })}

        {/* Reportes Financieros Pro-Forma */}
        {previewFinancialData && (
          <div 
            id="seccion-reportes-financieros"
            className="print-page financial-reports-page" 
            style={{ 
              marginTop: '3rem', 
              pageBreakBefore: 'always', 
              pageBreakInside: 'avoid',
              scrollMarginTop: '2rem'
            }}
          >
            <CorporatePrintHeader sectionTitle="Reportes Financieros Pro-Forma" pillarTitle="Finanzas y Organización" />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2.5rem',
              paddingBottom: '1rem',
              borderBottom: '3px solid #0f172a',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0,
              }}>
                📋
              </div>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.1 }}>
                  Reportes Financieros Pro-Forma
                </h2>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                  Proyecciones a 5 años · Estado de Resultados · Flujo de Efectivo · Punto de Equilibrio · Costo-Beneficio
                </p>
              </div>
            </div>

            <PrintableFinancialReports
              projections={previewFinancialData}
              staff={planData?.organizacion?.staff}
            />

            <CorporatePrintFooter pageNum={financialReportsPage} sectionName="Reportes Financieros" />
          </div>
        )}

        {/* Anexos */}
        {planData?.config?.anexos?.length > 0 && (
          <div 
            id="seccion-anexos"
            className="print-page anexos-page" 
            style={{ 
              marginTop: '4rem', 
              pageBreakBefore: 'always', 
              pageBreakInside: 'avoid',
              scrollMarginTop: '2rem'
            }}
          >
            <CorporatePrintHeader sectionTitle="Anexos y Evidencia Documental" pillarTitle="Documentación" />

            <h2 style={{ fontSize: '2rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '3rem', fontWeight: 800 }}>
              Anexos y Evidencia
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {planData?.config?.anexos?.map((anexo) => (
                <div key={anexo.id} style={{ marginBottom: '2rem' }}>
                  <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '0.5rem' }}>
                    <img src={anexo.url} alt={anexo.name} style={{ width: '100%', display: 'block' }} />
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#1e293b', textAlign: 'center', fontWeight: '500' }}>
                    {anexo.caption || anexo.name}
                  </p>
                </div>
              ))}
            </div>

            <CorporatePrintFooter pageNum={anexosPage} sectionName="Anexos" />
          </div>
        )}

        {/* Fuentes de Información */}
        {(() => {
          const manualSources = planData.config?.dataSources || [];
          const autoSources = [];
          if (planData.config?.externalApis?.inegiToken) {
            autoSources.push({
              title: 'Instituto Nacional de Estadística y Geografía (INEGI)',
              description: 'Directorio Estadístico Nacional de Unidades Económicas (DENUE) — Consulta de establecimientos económicos por geolocalización y sector SCIAN.',
              url: 'https://www.inegi.org.mx/servicios/api_denue.html'
            });
            autoSources.push({
              title: 'INEGI — Servicio de Mapas Web (WMS)',
              description: 'Cartografía digital de límites estatales, municipales y localidades del territorio mexicano.',
              url: 'https://www.inegi.org.mx/servicios/api_openLayers.html'
            });
          }
          if (planData.config?.externalApis?.banxicoToken) {
            autoSources.push({
              title: 'Banco de México (Banxico) — SieAPI',
              description: 'Sistema de Información Económica. Indicadores macroeconómicos: inflación, tipo de cambio, tasas de interés.',
              url: 'https://www.banxico.org.mx/SieAPIRest/service/v1'
            });
          }
          autoSources.push({
            title: 'OpenStreetMap Contributors',
            description: 'Base cartográfica abierta utilizada para la visualización de mapas de ubicación y competencia.',
            url: 'https://www.openstreetmap.org'
          });

          const hasSources = autoSources.length > 0 || manualSources.length > 0;

          if (!hasSources) return null;

          return (
            <div 
              id="seccion-fuentes"
              className="print-page portrait-print-page" 
              style={{ 
                marginTop: '3rem', 
                pageBreakBefore: 'always',
                fontFamily: 'Inter, sans-serif',
                background: '#ffffff',
                scrollMarginTop: '2rem'
              }}
            >
              <CorporatePrintHeader sectionTitle="Fuentes de Información" pillarTitle="Investigación y APIs" />

              <h2 style={{ 
                fontSize: '1.75rem', 
                fontWeight: 900, 
                color: '#0f172a', 
                borderBottom: '3px solid #0f172a', 
                paddingBottom: '0.75rem', 
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <span style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', flexShrink: 0
                }}>📚</span>
                Fuentes de Información
              </h2>

              {/* Fuentes Automáticas */}
              {autoSources.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                    Bases de Datos y APIs Consultadas
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {autoSources.map((src, idx) => (
                      <div key={idx} style={{ 
                        padding: '1rem 1.25rem', 
                        background: '#f8fafc', 
                        borderRadius: '10px', 
                        borderLeft: '4px solid #6366f1' 
                      }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                          {src.title}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
                          {src.description}
                        </div>
                        {src.url && (
                          <div style={{ color: '#6366f1', fontSize: '0.8rem', marginTop: '0.25rem', wordBreak: 'break-all' }}>
                            {src.url}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fuentes Manuales */}
              {manualSources.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                    Fuentes Adicionales Consultadas
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {manualSources.map((src, idx) => (
                      <div key={src.id || idx} style={{ 
                        padding: '0.75rem 1.25rem', 
                        background: '#fefce8', 
                        borderRadius: '10px', 
                        borderLeft: '4px solid #f59e0b' 
                      }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                          {src.title || 'Fuente sin título'}
                        </div>
                        {src.description && (
                          <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.15rem' }}>
                            {src.description}
                          </div>
                        )}
                        {src.url && (
                          <div style={{ color: '#d97706', fontSize: '0.8rem', marginTop: '0.15rem', wordBreak: 'break-all' }}>
                            {src.url}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <CorporatePrintFooter pageNum={sourcesPage} sectionName="Fuentes" />
            </div>
          );
        })()}

        <footer style={{ marginTop: '5rem', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>
          <p>Documento generado por OpenPlan V2 - Sistema de Inteligencia Empresarial</p>
          <p>© 2026 {planData?.config?.brandKit?.companyName}</p>
        </footer>
        </div>
      </div>

      {/* Refactor/Correction Progress Overlay */}
      {refactorStatus.active && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          color: '#ffffff',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '2.5rem',
            borderRadius: '16px',
            maxWidth: '450px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
              animation: 'pulse 2s infinite'
            }}>
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Refactorizando Proyecto
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Corrigiendo campos comentados y creando una nueva versión...
            </p>

            {/* Progress Bar */}
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ 
                background: 'linear-gradient(90deg, #6366f1, #a855f7)', 
                height: '100%', 
                width: `${refactorStatus.total > 0 ? (refactorStatus.completed / refactorStatus.total) * 100 : 0}%`,
                transition: 'width 0.4s ease'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              <span>Progreso: ${refactorStatus.completed} de ${refactorStatus.total}</span>
              <span>${Math.round(refactorStatus.total > 0 ? (refactorStatus.completed / refactorStatus.total) * 100 : 0)}%</span>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                ${refactorStatus.currentField || 'Preparando...'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
