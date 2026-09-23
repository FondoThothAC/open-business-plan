import React, { useEffect, useMemo, useState } from 'react';
import { usePlan } from '../context/PlanContext';
import { Printer, MessageSquare, Sparkles, Wand2, Bot, BrainCircuit, RefreshCw, ZoomIn, ZoomOut, Maximize2, RotateCcw, Layout, FileDown, ShieldAlert } from 'lucide-react';
import { downloadProjectAsDocx } from '../lib/docxExportEngine';
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
import FloorPlanDiagram from '../components/FloorPlanDiagram';
import RACIMatrix from '../components/RACIMatrix';
import ExecutiveFinancialDashboard from '../components/ExecutiveFinancialDashboard';
import ExecutiveSummarySection from '../components/ExecutiveSummarySection';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { safeStr } from '../utils/formatters';
import { FRAMEWORKS } from '../config/frameworks';
import { calculateFinancialProjections } from '../lib/finanzas/financial-calculations';
import DiffReviewModal from '../components/DiffReviewModal';
import ArbolProblemasObjetivos from '../components/ArbolProblemasObjetivos';
import XMatrixHoshinKanri from '../components/XMatrixHoshinKanri';
import AmoebaStructureViewer from '../components/AmoebaStructureViewer';
import HumanCapitalMatrix from '../components/HumanCapitalMatrix';
import MultiScenarioFinancialSection from '../components/MultiScenarioFinancialSection';
import { BOX_REGISTRY } from '../config/boxRegistry';
import { getBoxIdsForModule } from '../config/moduleBoxMap';
import { RenderBox } from '../components/boxes';
import { BoxBenchmark } from '../components/boxes/BoxBenchmark';
import { CroquisPreviewWidget } from '../components/MicroCroquisEditor';
import { useAuth } from '../contexts/AuthContext';
import { getApiBase } from '../config/apiConfig';

function readJson(raw, fallback) {
  if (!raw || typeof raw !== 'string') return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(fallback) ? (Array.isArray(parsed) ? parsed : fallback) : (parsed || fallback);
  } catch (err) {
    console.warn('[VistaPrevia:readJson] JSON inválido:', err);
    return fallback;
  }
}

function isVariableOpex(row) {
  if (!row || typeof row !== 'object') return false;
  const label = `${row.categoria || ''} ${row.tipo || ''} ${row.concepto || ''}`.toLowerCase();
  return label.includes('variable') || label.includes('comercial') || label.includes('venta') || label.includes('comisión');
}

export function parseNumericAmount(val, fallback = 0, preferredKeyword = null) {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const rawStr = String(val).trim();
  if (!rawStr) return fallback;

  // Detección directa de millones en frases simples cortas (ej. "16.8 millones", "$4M")
  if (!rawStr.includes('\n') && !rawStr.includes(';')) {
    const singleMillion = rawStr.match(/^[^0-9]*(\d+(?:[.,]\d+)?)\s*(?:millones?|millón|m\b)/i);
    if (singleMillion) {
      const num = parseFloat(singleMillion[1].replace(',', '.'));
      if (!isNaN(num)) return num * 1000000;
    }
    const singleCurrency = rawStr.match(/\$\s*([\d,]+(?:\.\d+)?)/);
    if (singleCurrency) {
      const num = parseFloat(singleCurrency[1].replace(/,/g, ''));
      if (!isNaN(num)) return num;
    }
  }

  // Análisis línea por línea para textos multilínea con viñetas o tablas
  const lines = rawStr.split(/\r?\n/).map(l => l.trim().replace(/^[-*•\s]+/, ''));
  const entries = [];

  for (const line of lines) {
    const regex = /\$\s*([\d,]+(?:\.\d+)?)(?:\s*(?:MXN|pesos|USD))?((?:\s*\/\s*(?:kg|pza|mes|hr|evento|año))?)/gi;
    let match;
    while ((match = regex.exec(line)) !== null) {
      const num = parseFloat(match[1].replace(/,/g, ''));
      const isPerUnit = Boolean(match[2] && /\/\s*(?:kg|pza|hr|evento)/i.test(match[2]));
      if (!isNaN(num) && num > 0) {
        entries.push({ num, line, isPerUnit });
      }
    }
  }

  if (entries.length > 0) {
    if (preferredKeyword) {
      const kwRegex = new RegExp(preferredKeyword, 'i');
      const kwMatch = entries.find(e => kwRegex.test(e.line) && !e.isPerUnit);
      if (kwMatch) return kwMatch.num;
    }

    const nonUnitary = entries.filter(e => !e.isPerUnit);
    const candidates = nonUnitary.length > 0 ? nonUnitary : entries;

    const totalMatch = candidates.find(e => /total/i.test(e.line));
    if (totalMatch) return totalMatch.num;

    return candidates[0].num;
  }

  // Fallback seguro sin guiones ni concatenación multilínea
  const cleanStr = rawStr.replace(/^[-*•\s]+/, '').replace(/[^0-9.,]/g, '');
  if (!cleanStr) return fallback;
  const parsed = parseFloat(cleanStr.replace(/,/g, ''));
  return isNaN(parsed) ? fallback : Math.abs(parsed);
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
function MaquinariaTable({ data, planData, exportScope }) {
  const maquinaria = data?.maquinaria || '';
  const equipo = data?.equipo || '';
  const herramientas = data?.herramientas || '';

  const items = [];

  // 1. Prioridad: Desglose estructurado de inversión en el módulo de organización
  try {
    const rawCapex = planData?.organizacion?.inversion?.desglose_capex_json;
    if (rawCapex) {
      const parsed = typeof rawCapex === 'string' ? JSON.parse(rawCapex) : rawCapex;
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach(item => {
          const monto = Number(item.monto || item.amount || 0);
          if (monto > 0) {
            const nombre = item.concepto || item.name || 'Activo Fijo';
            const tipo = item.tipo || (/tecnolog|software|comput/i.test(nombre) ? 'Tecnología' : (/licencia|permiso|marca/i.test(nombre) ? 'Intangible / Legal' : 'Maquinaria y Equipo'));
            const vidaUtil = /tecnolog|comput|selladora/i.test(nombre) ? 3 : (/licencia|adecuac/i.test(nombre) ? 5 : 10);
            items.push({
              nombre,
              tipo,
              costo: monto,
              vidaUtil,
            });
          }
        });
      }
    }
  } catch {}

  // 2. Fallback: Parsear texto narrativo si no existe desglose estructurado
  if (items.length === 0) {
    const seedCapex = Number(planData?.semilla?.inversion_esperada || planData?.semilla?.finanzas?.inversion_total || 50000);
    const isMicro = seedCapex < 150000;
    const defaultFallbackCost = (type) => {
      if (isMicro) {
        return type === 'Maquinaria' ? Math.round(seedCapex * 0.35) : type === 'Equipo' ? Math.round(seedCapex * 0.18) : Math.round(seedCapex * 0.08);
      }
      return type === 'Maquinaria' ? 180000 : type === 'Equipo' ? 45000 : 15000;
    };

    const parseText = (text, type) => {
      if (!text || typeof text !== 'string') return;
      
      let rawLines = text
        .split(/(?:\r?\n)+|(?:\s*[•·]\s*)|(?:\s*;\s*(?=[A-Z0-9]))|(?:\s*\.\s+(?=[0-9]+\.|\d+\)|\b[A-Z]))/)
        .map(s => s.trim())
        .filter(s => s.length > 3);

      if (rawLines.length === 1 && rawLines[0].includes(').')) {
        rawLines = rawLines[0].split(/\)\.\s*/).map((s, idx, arr) => idx < arr.length - 1 ? s + ')' : s).map(s => s.trim()).filter(s => s.length > 3);
      }

      rawLines.forEach(line => {
        // Filtrar oraciones explicativas largas que no son nombres de equipos
        if (/^(?:para\s+la|la\s+l[ií]nea|adem[aá]s|el\s+proceso|se\s+requiere|el\s+objetivo|los\s+equipos|cabe\s+destacar|asimismo)/i.test(line)) {
          return;
        }

        const priceMatch = line.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+)/) || line.match(/(\d{1,3}(?:,\d{3})+(?:\.\d+)?)\s*(?:MXN|USD|pesos)/i);
        let price = null;
        if (priceMatch) {
          price = Number(priceMatch[1].replace(/,/g, ''));
        }
        
        const yearsMatch = line.match(/(\d+)\s*(?:años?|year)/i);
        const years = yearsMatch ? Number(yearsMatch[1]) : (type === 'Maquinaria' ? 10 : type === 'Equipo' ? 5 : 3);

        let name = line
          .replace(/^\d+[.)]\s*/, '')
          .replace(/\([^)]*?(?:\$|\baños\b|MXN)[^)]*?\)/gi, '')
          .replace(/:\s*\$[\d,]+.*/, '')
          .replace(/\$[\d,]+(\s*MXN)?/gi, '')
          .replace(/,\s*\d+\s*años.*/i, '')
          .trim();

        name = name.replace(/^[-–—:\s]+|[-–—:\s,.]+$/g, '').trim();

        if (name.length > 60) name = name.substring(0, 60) + '...';

        if (name && name.length >= 3 && !/^\d+$/.test(name) && !/^(?:en|de|con|por|un|una|el|la)\s/i.test(name)) {
          items.push({
            nombre: name,
            tipo: type,
            costo: price || defaultFallbackCost(type),
            vidaUtil: years,
          });
        }
      });
    };

    parseText(maquinaria, 'Maquinaria');
    parseText(equipo, 'Equipo');
    parseText(herramientas, 'Herramienta');
  }

  // Fallbacks por sector si no se detectó ningún elemento
  const isIndustrial = Boolean(planData?.semilla?.proyecto?.includes('Cuantico') || planData?.semilla?.proyecto?.includes('MHI'));
  const defaultItems = isIndustrial ? [
    { nombre: 'Banco de Pruebas Dinámico e Hidráulico de Alta Presión', tipo: 'Maquinaria', costo: 1850000, vidaUtil: 15 },
    { nombre: 'Puente Grúa Monorriel de 10 Toneladas', tipo: 'Maquinaria', costo: 450000, vidaUtil: 20 },
    { nombre: 'Unidad Móvil de Microfiltración y Deshidratación de Aceite', tipo: 'Maquinaria', costo: 320000, vidaUtil: 10 },
    { nombre: 'Máquina de Lavado y Ultrasonido Industrial para Válvulas', tipo: 'Equipo', costo: 280000, vidaUtil: 12 },
    { nombre: 'Unidad Móvil Pick-up 4x4 equipada con módulo hidráulico', tipo: 'Vehículo / Logística', costo: 650000, vidaUtil: 5 },
    { nombre: 'Estación de Telemetría IoT y Diagnóstico Preventivo', tipo: 'Equipo', costo: 85000, vidaUtil: 5 }
  ] : [
    { nombre: 'Horno de convección y horneado', tipo: 'Maquinaria', costo: 14000, vidaUtil: 10 },
    { nombre: 'Batidora industrial de pedestal', tipo: 'Maquinaria', costo: 8000, vidaUtil: 10 },
    { nombre: 'Mesa de trabajo de acero inoxidable y charolas', tipo: 'Equipo', costo: 4500, vidaUtil: 10 },
    { nombre: 'Selladora manual de bolsas y utensilios', tipo: 'Equipo', costo: 1500, vidaUtil: 5 }
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
      {exportScope !== 'executive' && (maquinaria || equipo || herramientas) && (
        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.76rem', color: '#64748b', fontStyle: 'italic', paddingLeft: '0.5rem' }}>
          * Detalle adicional del plan: {maquinaria && typeof maquinaria === 'string' ? `Maquinaria: ${maquinaria}. ` : ''}{equipo && typeof equipo === 'string' ? `Equipos: ${equipo}.` : ''}
        </p>
      )}
    </div>
  );
}

// --- SUBCOMPONENTE: INSUMOS Y PROVEEDORES TABLE ---
function InsumosTable({ data, planData, exportScope }) {
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
        .replace(/^\d+[.)]\s*/, '')
        .replace(/\([^)]*?(?:\$|MXN|\/mes|\/lote)[^)]*?\)/gi, '')
        .replace(/:\s*\$[\d,]+.*/, '')
        .replace(/\$[\d,]+.*/, '')
        .trim();

      cleanName = cleanName.replace(/^[-–—:\s]+|[-–—:\s,.]+$/g, '').trim();
      if (cleanName.length > 65) cleanName = cleanName.substring(0, 65) + '...';

      const p = rawProv[idx] || rawProv[0] || 'Proveedor Certificado / Fabricante OEM';

      if (cleanName && cleanName.length > 2 && !/^\d+$/.test(cleanName)) {
        parsedItems.push({
          insumo: cleanName,
          proveedor: p.replace(/^\d+[.)]\s*/, '').replace(/Proveedor\s*\d+:\s*/i, '').trim(),
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
      {exportScope !== 'executive' && (materia || prov) && (
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

export function DocxExportButton({ planData, scope = 'executive' }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!planData) return;
    try {
      setIsExporting(true);
      const suffix = scope === 'full' ? 'maestro-12-frameworks' : 'ejecutivo';
      const filename = `${(planData.companyName || planData.nombre || 'plan-negocios').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${suffix}.docx`;
      await downloadProjectAsDocx(planData, filename, { scope });
    } catch (err) {
      console.error('[DocxExportButton] Error al exportar Word:', err);
      alert('Ocurrió un error al generar el documento Word editable. Verifique la consola.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className="btn"
      onClick={handleExport}
      disabled={isExporting || !planData}
      style={{
        height: '42px',
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '0 1rem',
        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 600,
        cursor: isExporting ? 'wait' : 'pointer'
      }}
      title={scope === 'full' ? 'Descargar Documento Maestro Completo (12 Metodologías) en Word (.docx)' : 'Descargar Dossier Ejecutivo Canónico en Word (.docx)'}
    >
      <FileDown className="w-4 h-4" />
      <span>{isExporting ? 'Generando Word...' : `Exportar Word (${scope === 'full' ? 'Maestro' : 'Ejecutivo'})`}</span>
    </button>
  );
}

export function ExportScopeToggle({ exportScope, onScopeChange }) {
  return (
    <div
      className="no-print"
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-panel, #1e293b)',
        border: '1px solid var(--border-color, #334155)',
        borderRadius: '8px',
        padding: '3px',
        gap: '3px',
        height: '42px'
      }}
    >
      <button
        type="button"
        onClick={() => onScopeChange('executive')}
        style={{
          padding: '6px 12px',
          fontSize: '0.8rem',
          fontWeight: exportScope === 'executive' ? 700 : 500,
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          background: exportScope === 'executive' ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' : 'transparent',
          color: exportScope === 'executive' ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
          boxShadow: exportScope === 'executive' ? '0 2px 8px rgba(13, 148, 136, 0.3)' : 'none',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        title="Dossier Ejecutivo Canónico (~20-25 págs con metodología activa y finanzas consolidadas a 5 años)"
      >
        <span>📄</span>
        <span>Dossier Ejecutivo</span>
      </button>
      <button
        type="button"
        onClick={() => onScopeChange('full')}
        style={{
          padding: '6px 12px',
          fontSize: '0.8rem',
          fontWeight: exportScope === 'full' ? 700 : 500,
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          background: exportScope === 'full' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
          color: exportScope === 'full' ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
          boxShadow: exportScope === 'full' ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        title="Documento Maestro Integral (12 Metodologías y Frameworks Integrados)"
      >
        <span>📚</span>
        <span>Maestro (12 Metodologías)</span>
      </button>
    </div>
  );
}

export function computePreviewFinancialData(planData) {
  try {
    let raw = planData?.organizacion?.estados_financieros?.corrida_automatica;
    if (raw && typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch {}
    }
    if (raw && typeof raw === 'object') {
      // Si tiene estructura con incomeStatement y cashFlow estructurados (como VCV canónico)
      if (Array.isArray(raw.incomeStatement) && !Array.isArray(raw.annualSummaries)) {
        const annualSummaries = raw.incomeStatement.map(row => ({
          year: row.year,
          incomeStatement: {
            sales: row.revenue || row.sales || 0,
            variableCosts: row.variableCosts || 0,
            grossMargin: row.grossMargin || 0,
            fixedCosts: row.fixedCosts || 0,
            ebitda: row.ebitda || 0,
            depreciation: row.depreciation || 0,
            ebit: row.ebit || 0,
            taxes: row.taxes || 0,
            netIncome: row.netIncome || 0
          }
        }));
        const annualCashFlowData = (raw.cashFlow || []).map(row => ({
          year: row.year,
          initialCash: row.initialCash || 0,
          operatingCashFlow: row.operatingInflow || row.operatingCashFlow || 0,
          netCashFlow: row.netOperatingCash || row.netCashFlow || 0,
          cumulativeCashFlow: row.finalCash || row.cumulativeCashFlow || 0
        }));
        const kpis = raw.kpis || {};
        const rawInv = planData?.organizacion?.costos?.inversion_total || planData?.semilla?.monto_inversion || '$4,000,000';
        const invNum = parseNumericAmount(rawInv, 4000000);
        return {
          ...raw,
          annualSummaries,
          annualCashFlowData,
          financialMetrics: {
            irr: kpis.irr || 38.4,
            npv: kpis.npv || 6850000,
            paybackPeriod: kpis.paybackPeriodYears ? `${(kpis.paybackPeriodYears * 12).toFixed(0)} meses` : '18 meses',
            initialInvestment: invNum,
            roi: kpis.grossMarginPct || 78.5
          }
        };
      }
      return raw;
    }
  } catch (err) {
    console.warn('[VistaPrevia] Error parseando corrida_automatica:', err);
  }

  // Fallback: calcular corrida financiera al vuelo si no existe
  try {
    const banxicoData = planData?.naturaleza?.pestel?.indicadores_banxico || {};
    const currentInflation = banxicoData.inflacion ? parseFloat(banxicoData.inflacion) : 4.5;
    const currentTIIE = banxicoData.tiie ? parseFloat(banxicoData.tiie) : 10;
    const estimatedWACC = currentTIIE + 2.0;

    const capexRows = readJson(planData?.organizacion?.inversion?.desglose_capex_json, []);
    const opexRows = readJson(planData?.organizacion?.costos?.desglose_opex_json, []);
    const revenueRows = readJson(planData?.organizacion?.estados_financieros?.ingresos_json, []);

    let initialInvestmentVal = 20000000;
    let annualSalesGoalVal = 16000000;
    let monthlyFixedCostsVal = 285000;
    let monthlyVariableCostsVal = 8000;

    // 1. Inversión Total con soporte para capital, arranque, capex
    const inversionTexto = planData?.organizacion?.inversion?.financiamiento ||
                           planData?.organizacion?.inversion?.inversion_fija ||
                           planData?.organizacion?.inversion?.monto_total ||
                           planData?.organizacion?.inversion?.capex ||
                           planData?.semilla?.inversion_esperada ||
                           planData?.semilla?.finanzas?.inversion_total || '';
    if (inversionTexto) {
      initialInvestmentVal = parseNumericAmount(inversionTexto, 20000000, 'arranque|inversión|capital|total|capex');
    }

    // 2. Costos Fijos Mensuales
    const fijosTexto = planData?.organizacion?.costos?.fijos || planData?.semilla?.finanzas?.costos_fijos || '';
    if (fijosTexto) {
      const rawFijos = parseNumericAmount(fijosTexto, 285000, 'fijo|mensual');
      monthlyFixedCostsVal = rawFijos > 2000000 ? Math.round(rawFijos / 12) : rawFijos;
    }

    // 3. Ventas Anuales Año 1
    const resultadosTexto = planData?.organizacion?.estados_financieros?.resultados || 
                            planData?.organizacion?.objetivos?.metas ||
                            planData?.semilla?.finanzas?.meta_ingresos || '';
    if (resultadosTexto) {
      annualSalesGoalVal = parseNumericAmount(resultadosTexto, 16000000, 'ventas|ingreso|anual');
    }

    // 4. Costos Variables Mensuales
    const variablesTexto = planData?.organizacion?.costos?.variables || '';
    if (variablesTexto) {
      const rawVars = parseNumericAmount(variablesTexto, 0, 'variable');
      if (rawVars > 0 && rawVars < 100) {
        monthlyVariableCostsVal = Math.round((annualSalesGoalVal / 12) * (rawVars / 100));
      } else if (rawVars > 0) {
        monthlyVariableCostsVal = rawVars > 2000000 ? Math.round(rawVars / 12) : rawVars;
      } else {
        monthlyVariableCostsVal = Math.round((annualSalesGoalVal / 12) * 0.65);
      }
    } else {
      monthlyVariableCostsVal = Math.round((annualSalesGoalVal / 12) * 0.65);
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

    return calculateFinancialProjections(projData, 'years');
  } catch (e) {
    console.error('[computePreviewFinancialData] Error calculando proyecciones de respaldo:', e);
    return null;
  }
}

export function computeOrderedModules(planData, currentFramework, exportScope = 'executive') {
  let list = [];
  if (exportScope === 'executive') {
    // En Dossier Ejecutivo se incluyen exclusivamente los módulos sustantivos centrales de la metodología activa
    // Los módulos de investigación de nicho, scraping avanzado o anexos quedan reservados para el Documento Maestro
    const auxiliaryModules = new Set([
      'metricas_aarrr',
      'mapa',
      'benchmarking',
      'inteligencia_mercado_cascada',
      'pestel',
      'operativa',
      'recursos_humanos',
      'simulador'
    ]);

    // Módulos que tienen componentes visuales dedicados que siempre deben evaluarse
    const visualModuleKeys = new Set([
      'foda', 'canvas', 'tam_sam_som', 'competencia', 'maquinaria_equipos',
      'insumos_proveedores', 'capacidad_inventarios', 'sueldos_salarios',
      'inversion', 'costos_gastos', 'precio_venta', 'punto_equilibrio',
      'estados_financieros', 'viabilidad'
    ]);

    (currentFramework?.pillars || []).forEach(pillar => {
      (pillar.modules || []).forEach(mod => {
        if (!auxiliaryModules.has(mod.key)) {
          const modData = planData?.[pillar.key]?.[mod.key];
          const hasVisual = visualModuleKeys.has(mod.key);
          const hasContent = hasVisual || (modData && Object.values(modData).some(v => {
            if (!v) return false;
            if (typeof v === 'string') {
              const t = v.trim();
              return t.length > 0 && !t.includes('integra en su dimensión de');
            }
            if (typeof v === 'object') return Object.keys(v).length > 0;
            return true;
          }));

          if (hasContent) {
            list.push({
              pillarKey: pillar.key,
              pillarTitle: pillar.title,
              key: mod.key,
              title: mod.title
            });
          }
        }
      });
    });
  } else {
    // Modo Maestro: incluir todos los frameworks y metodologías canónicas completas
    Object.entries(FRAMEWORKS).forEach(([fwKey, fwConfig]) => {
      (fwConfig.pillars || []).forEach(pillar => {
        (pillar.modules || []).forEach(mod => {
          if (!list.some(item => item.pillarKey === pillar.key && item.key === mod.key)) {
            list.push({
              pillarKey: pillar.key,
              pillarTitle: `${fwConfig.name || fwKey}: ${pillar.title}`,
              key: mod.key,
              title: mod.title,
              frameworkKey: fwKey
            });
          }
        });
      });
    });
  }

  const order = planData?.config?.moduleOrder || [];
  if (order.length === 0) return list;

  return [...list].sort((a, b) => {
    const indexA = order.indexOf(a.key);
    const indexB = order.indexOf(b.key);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

export default function VistaPrevia() {
  const { planData, updateConfig, manualSaveProject, updateSection, addComment, deleteComment, getProjectContamination, sanitizeCurrentProject } = usePlan();
  const { authFetch, user } = useAuth();
  const [reviewLink, setReviewLink] = React.useState(null);
  const [printMargin, setPrintMargin] = React.useState(0.8); // Margen en cm
  const [zoomLevel, setZoomLevel] = React.useState(100); // Nivel de Zoom en % (50% a 150%)
  const [fitToWidth, setFitToWidth] = React.useState(false); // Modo de ajuste automático al ancho de ventana
  const [refactorStatus, setRefactorStatus] = React.useState({ active: false, total: 0, completed: 0, currentField: '' });
  const [exportScope, setExportScope] = React.useState('executive'); // 'executive' (Dossier canónico ~20-25 págs) | 'full' (Maestro 12 Metodologías)

  const handleProjectCleanup = () => {
    const findings = getProjectContamination?.() || [];
    if (findings.length === 0) {
      window.alert('No se detectó contenido de otro proyecto en el plan activo.');
      return;
    }
    const preview = findings.slice(0, 4).map((finding) => `• ${finding.path}`).join('\n');
    if (window.confirm(`Se detectaron ${findings.length} campos con contenido especializado de otro proyecto:\n\n${preview}\n\n¿Deseas limpiarlos? Esta acción se guardará como cambio del proyecto actual.`)) {
      sanitizeCurrentProject?.();
      window.alert('Contenido contaminado eliminado. Revisa la Vista Previa antes de guardar.');
    }
  };

  const createReviewLink = async () => {
    const type = planData?.config?.projectType === 'social_bid' ? 'social' : 'negocios';
    const id = planData?.config?.projectId;
    if (!id) return window.alert('Guarda el proyecto antes de compartirlo.');
    const response = await authFetch(`${getApiBase()}/api/projects/${type}/${encodeURIComponent(id)}/review-invites`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scope: exportScope, days: 7 })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return window.alert(body.error || 'No se pudo crear el enlace.');
    const link = `${window.location.origin}${import.meta.env.BASE_URL}review/${body.token}`;
    setReviewLink(link); await navigator.clipboard?.writeText(link); window.alert('Enlace creado y copiado al portapapeles.');
  };

  // Guard de seguridad DESPUÉS de todos los hooks (regla: hooks no pueden ser condicionales)
  // El useMemo y useState ya se ejecutaron — ahora sí podemos salir si planData es null

  const commentedFieldsCount = useMemo(() => {
    const commentsObj = planData?.config?.comments || {};
    return Object.values(commentsObj).filter(arr => Array.isArray(arr) && arr.length > 0).length;
  }, [planData?.config?.comments]);

  const handleRefactorWithComments = async () => {
    const commentsObj = planData.config?.comments || {};
    const activeCommentedFields = [];

    Object.entries(commentsObj).forEach(([key, comments]) => {
      if (Array.isArray(comments) && comments.length > 0) {
        activeCommentedFields.push({ key, comments });
      }
    });

    if (activeCommentedFields.length === 0) return;

    // Guard de carga tardía post-hooks
    if (!planData) return;

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

  const paginationMode = planData.config?.paginationMode || 'continuous';
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
      <div className="print-page-footer" style={{ pageBreakBefore: 'avoid', breakBefore: 'avoid' }}>
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
    return computePreviewFinancialData(planData);
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

  // Esta selección afecta únicamente vista previa y exportación, nunca borra datos.
  const shouldShow = (pillar, module) => {
    if (planData?.config?.visibility?.[`${pillar}.${module}`] === false) return false;
    // En Dossier Ejecutivo, excluir módulos que no tengan contenido real para evitar páginas vacías
    if (exportScope === 'executive') {
      const modData = planData?.[pillar]?.[module];
      return hasContent(modData);
    }
    return true;
  };

  // Resolver Framework y Módulos Activos
  const projectType = planData?.config?.projectType || 'business';
  const currentFramework = FRAMEWORKS[projectType] || FRAMEWORKS.business;

  // Conteo de módulos pendientes de contenido en la metodología activa
  const missingModulesCount = useMemo(() => {
    let count = 0;
    (currentFramework?.pillars || []).forEach(pillar => {
      (pillar.modules || []).forEach(mod => {
        const modData = planData?.[pillar.key]?.[mod.key];
        if (!hasContent(modData)) count++;
      });
    });
    return count;
  }, [planData, currentFramework]);

  // Auditoría de consistencia entre montos capturados y proyectados
  const financialConsistency = useMemo(() => {
    const rawInv = planData?.organizacion?.costos?.inversion_total || planData?.semilla?.monto_inversion;
    const invNum = parseNumericAmount(rawInv, 0);
    const metricInv = previewFinancialData?.financialMetrics?.initialInvestment || 0;
    if (invNum > 0 && metricInv > 0 && Math.abs(invNum - metricInv) > 1000) {
      return { 
        consistent: false, 
        message: `Discrepancia: Inversión capturada (${parseNumericAmount(rawInv)}) vs Proyectada (${metricInv})` 
      };
    }
    return { consistent: true, message: 'Cifras financieras consistentes' };
  }, [planData, previewFinancialData]);

  // Ordenar módulos basado en planData.config.moduleOrder y exportScope
  const orderedModules = useMemo(() => {
    return computeOrderedModules(planData, currentFramework, exportScope);
  }, [planData, currentFramework, exportScope]);

  // Calcular números de página estimados para el índice y los pies de página
  const { executiveSummaryPage, executiveDashboardPage, modulePageNumbers, financialReportsPage, anexosPage, sourcesPage } = useMemo(() => {
    const pageNumbers = {};
    const execSummaryPage = 3; // Portada es 1, Índice es 2, Resumen Ejecutivo & Viabilidad es 3.
    const execDashPage = 4; // Tablero Ejecutivo de Dirección es 4.
    let currentPage = 5; // Primer módulo temático inicia en 5.

    if (paginationMode === 'continuous' || exportScope === 'executive') {
      let accumPages = 0;
      orderedModules.forEach((mod) => {
        if (!shouldShow(mod.pillarKey, mod.key)) return;
        pageNumbers[mod.key] = currentPage;
        
        let density = 0.45;
        if (mod.key === 'estados_financieros' || mod.key === 'pestel' || mod.key === 'foda' || mod.key === 'segmentacion') {
          density = 0.8;
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
      executiveSummaryPage: execSummaryPage,
      executiveDashboardPage: execDashPage,
      modulePageNumbers: pageNumbers,
      financialReportsPage: reportsPage,
      anexosPage: aPage,
      sourcesPage: sPage
    };
  }, [orderedModules, previewFinancialData, planData?.config?.anexos, paginationMode, exportScope]);

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
  const Section = ({ number, title, data, pillarKey, moduleKey, hideTitle }) => {
    if (!data) return null;
    
    // Filtrar solo campos con contenido y excluir estructuras JSON internas y textos de relleno duplicados
    const seenValues = new Set();
    const filledFields = Object.entries(data).filter(([key, value]) => {
      if (key === 'heatmap_data' || key === 'corrida_automatica' || key.endsWith('_json')) return false;
      if (!value) return false;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return false;
        if (exportScope === 'executive' && trimmed.includes('integra en su dimensión de') && trimmed.includes('una política agroindustrial integral')) {
          return false;
        }
        if (exportScope === 'executive') {
          if (seenValues.has(trimmed)) return false;
          seenValues.add(trimmed);
        }
        return true;
      }
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return true;
    });

    // En modo Dossier Ejecutivo se excluyen de raíz los módulos sin contenido sustantivo
    if (exportScope === 'executive' && filledFields.length === 0) {
      return null;
    }

    return (
      <div className={`preview-section ${filledFields.length === 0 ? 'empty-section' : ''}`} style={{ 
        marginBottom: '1.5rem',
        opacity: filledFields.length === 0 ? 0.4 : 1,
        border: filledFields.length === 0 ? '1px dashed #e2e8f0' : 'none',
        padding: filledFields.length === 0 ? '1rem' : '0',
        pageBreakInside: exportScope === 'executive' ? 'auto' : 'avoid',
        breakInside: exportScope === 'executive' ? 'auto' : 'avoid'
      }}>
        {!hideTitle && (
          <h3 style={{ color: '#1e293b', fontSize: '1.25rem', borderLeft: '4px solid var(--accent-color)', paddingLeft: '1rem', marginBottom: '1rem', fontWeight: 800 }}>
            {number} {title} {filledFields.length === 0 && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>(Sin contenido)</span>}
          </h3>
        )}
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
                // Limpiar separadores ASCII crudos (=== o ---) y transformarlos en títulos limpios
                displayValue = displayValue.replace(/={5,}\s*([^\n]+)?/g, (_match, title) => {
                  return title && title.trim() ? `\n\n### ${title.trim()}\n` : '\n\n---\n';
                });
                displayValue = displayValue.replace(/-{5,}\s*([^\n]+)?/g, (_match, title) => {
                  return title && title.trim() ? `\n\n#### ${title.trim()}\n` : '\n\n---\n';
                });
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
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ _node, ...props }) => (
                          <div className="wide-table-wrapper" style={{ overflowX: 'auto', margin: '1.25rem 0', pageBreakInside: 'avoid', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                            <table className="report-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }} {...props} />
                          </div>
                        ),
                        th: ({ _node, ...props }) => (
                          <th style={{ background: '#f8fafc', padding: '0.65rem 0.75rem', fontWeight: 700, color: '#0f172a', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }} {...props} />
                        ),
                        td: ({ _node, ...props }) => (
                          <td style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid #f1f5f9', color: '#334155' }} {...props} />
                        )
                      }}
                    >
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
    const isDarkExecutive = cover.layout === 'dark_executive';
    const isAcademicFrame = cover.layout === 'academic_frame';
    const isGradientWave = cover.layout === 'gradient_wave';
    const isSplitGrid = cover.layout === 'split_grid';
    const isNordicLine = cover.layout === 'nordic_line';
    const isEditorialVogue = cover.layout === 'editorial_vogue';
    const isBlueprintTech = cover.layout === 'blueprint_tech';
    const isGeometricMosaic = cover.layout === 'geometric_mosaic';
    const isGoldenPrestige = cover.layout === 'golden_prestige';
    const isBrutalistBold = cover.layout === 'brutalist_bold';
    
    const logoWidth = cover.logoSize === 'small' ? '80px' : cover.logoSize === 'extra_large' ? '280px' : cover.logoSize === 'large' ? '180px' : '130px';
    const logoAlignment = cover.logoAlign === 'left' ? 'flex-start' : cover.logoAlign === 'right' ? 'flex-end' : 'center';
    const titleFontSize = cover.titleSize === 'small' ? '2.2rem' : cover.titleSize === 'large' ? '4.2rem' : '3.2rem';
    const primaryColor = planData.config?.brandKit?.primaryColor || '#6366f1';
    
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
          padding: isAcademicFrame ? '5rem 4rem' : isEditorialVogue ? '5rem 3.5rem' : '4.5rem 3.5rem',
          textAlign: isSidebar || isMinimalist || isSplitGrid || isNordicLine || isBrutalistBold ? 'left' : 'center',
          background: isDarkExecutive 
            ? 'linear-gradient(135deg, #090d16 0%, #0f172a 100%)' 
            : isBlueprintTech
            ? '#0a192f'
            : isGoldenPrestige
            ? '#0b0f19'
            : isBrutalistBold
            ? '#fef08a'
            : '#ffffff',
          color: isDarkExecutive || isGoldenPrestige
            ? '#f8fafc' 
            : isBlueprintTech
            ? '#38bdf8'
            : isBrutalistBold
            ? '#000000'
            : '#0f172a',
          fontFamily: isEditorialVogue 
            ? 'Playfair Display, Georgia, serif' 
            : isBlueprintTech 
            ? 'Courier New, monospace' 
            : 'Inter, sans-serif',
          pageBreakAfter: 'always',
          maxWidth: '760px',
          margin: '0 auto 2.5rem auto',
          borderRadius: '12px',
          boxShadow: isBrutalistBold ? '8px 8px 0px #000000' : '0 10px 30px rgba(0, 0, 0, 0.04)',
          border: isDarkExecutive || isGoldenPrestige 
            ? '1px solid #1e293b' 
            : isBlueprintTech
            ? '1px solid #1e3a8a'
            : isBrutalistBold
            ? '4px solid #000000'
            : '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        {/* Layout: Sidebar Borde Lateral */}
        {isSidebar && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '24px',
            background: primaryColor
          }} />
        )}

        {/* Layout: Modern Franja Horizontal */}
        {isModern && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: '20%',
            width: '100%',
            height: '140px',
            background: primaryColor,
            opacity: 0.08,
            zIndex: 0
          }} />
        )}

        {/* Layout: Academic Frame (Doble Marco Perimetral) */}
        {isAcademicFrame && (
          <div style={{
            position: 'absolute',
            inset: '1.25rem',
            border: `3px double ${primaryColor}`,
            borderRadius: '8px',
            outline: '1px solid #cbd5e1',
            outlineOffset: '-8px',
            pointerEvents: 'none',
            zIndex: 0
          }} />
        )}

        {/* Layout: Editorial Vogue (Borde Fino Clásico) */}
        {isEditorialVogue && (
          <div style={{
            position: 'absolute',
            inset: '1.5rem',
            border: '1px solid #0f172a',
            pointerEvents: 'none',
            zIndex: 0
          }} />
        )}

        {/* Layout: Blueprint Grid Pattern */}
        {isBlueprintTech && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(56,189,248,0.18) 1.5px, transparent 0)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
            zIndex: 0
          }} />
        )}

        {/* Layout: Geometric Mosaic */}
        {isGeometricMosaic && (
          <div style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '320px',
            height: '320px',
            background: `linear-gradient(135deg, ${primaryColor} 0%, #3b82f6 100%)`,
            clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
            opacity: 0.15,
            pointerEvents: 'none',
            zIndex: 0
          }} />
        )}

        {/* Layout: Golden Prestige Border */}
        {isGoldenPrestige && (
          <div style={{
            position: 'absolute',
            inset: '1.5rem',
            border: '2px solid #d97706',
            boxShadow: 'inset 0 0 15px rgba(217, 119, 6, 0.15)',
            pointerEvents: 'none',
            zIndex: 0
          }} />
        )}

        {/* Layout: Gradient Wave (Tech Dynamic) */}
        {isGradientWave && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '180px',
            background: `linear-gradient(135deg, ${primaryColor} 0%, #8b5cf6 50%, #ec4899 100%)`,
            borderRadius: '0 0 50% 50% / 0 0 40px 40px',
            opacity: 0.95,
            zIndex: 0
          }} />
        )}

        {/* Layout: Split Grid 50/50 */}
        {isSplitGrid && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '38%',
            background: `linear-gradient(180deg, ${primaryColor} 0%, #4338ca 100%)`,
            zIndex: 0
          }} />
        )}

        {/* Layout: Nordic Line (Línea Tipográfica Vertical) */}
        {isNordicLine && (
          <div style={{
            position: 'absolute',
            left: '3rem',
            top: 0,
            bottom: 0,
            width: '2px',
            background: '#e2e8f0',
            zIndex: 0
          }} />
        )}

        {/* Top: Logotipo */}
        <div style={{ 
          display: 'flex', 
          justifyContent: logoAlignment, 
          width: '100%',
          paddingLeft: isSidebar ? '25px' : isSplitGrid ? '42%' : isNordicLine ? '2.5rem' : '0',
          zIndex: 1
        }}>
          {planData?.config?.brandKit?.logoUrl ? (
            <img 
              src={planData.config.brandKit.logoUrl} 
              alt="Logo" 
              style={{ 
                width: logoWidth, 
                height: 'auto', 
                maxHeight: cover.logoSize === 'extra_large' ? '220px' : '140px', 
                objectFit: 'contain',
                background: isDarkExecutive || isBlueprintTech || isGoldenPrestige ? '#ffffff' : 'transparent',
                padding: isDarkExecutive || isBlueprintTech || isGoldenPrestige ? '8px' : '0',
                borderRadius: isDarkExecutive || isBlueprintTech || isGoldenPrestige ? '12px' : '0',
                border: isBrutalistBold ? '2px solid #000000' : 'none'
              }} 
            />
          ) : (
            <div style={{ height: '50px' }} />
          )}
        </div>

        {/* Centro: Título, Subtítulo y Organización */}
        <div style={{ 
          paddingLeft: isSidebar ? '25px' : isSplitGrid ? '42%' : isNordicLine ? '2.5rem' : '0',
          zIndex: 1,
          margin: 'auto 0'
        }}>
          {isModern && (
            <div style={{ 
              width: '100px', 
              height: '6px', 
              background: primaryColor, 
              marginBottom: '2rem',
              margin: cover.logoAlign === 'center' ? '0 auto 2rem auto' : '0 0 2rem 0'
            }} />
          )}
          {isNordicLine && (
            <div style={{ width: '40px', height: '4px', background: primaryColor, marginBottom: '1.25rem' }} />
          )}
          {isGoldenPrestige && (
            <div style={{ width: '60px', height: '3px', background: '#d97706', margin: '0 auto 1.5rem auto' }} />
          )}
          <h1 style={{ 
            fontSize: titleFontSize, 
            fontWeight: isEditorialVogue ? '400' : '900', 
            marginBottom: '1rem', 
            color: isDarkExecutive || isGoldenPrestige 
              ? '#ffffff' 
              : isBlueprintTech
              ? '#38bdf8'
              : isBrutalistBold
              ? '#000000'
              : '#0f172a',
            lineHeight: 1.15,
            letterSpacing: isEditorialVogue ? '0.04em' : '-0.02em',
            textTransform: isBrutalistBold || isEditorialVogue ? 'uppercase' : 'none'
          }}>
            {planData?.config?.brandKit?.companyName || 'Plan de Negocios'}
          </h1>
          <h2 style={{ 
            fontSize: '1.4rem', 
            fontWeight: '700', 
            color: isDarkExecutive ? '#38bdf8' : isGoldenPrestige ? '#f59e0b' : isBlueprintTech ? '#7dd3fc' : isBrutalistBold ? '#000000' : primaryColor,
            letterSpacing: '0.06em', 
            textTransform: 'uppercase',
            margin: '0.5rem 0'
          }}>
            {cover.subtitle || 'Plan Estratégico Maestro'}
          </h2>
          {cover.institution && (
            <p style={{ 
              fontSize: '1.1rem', 
              color: isDarkExecutive || isGoldenPrestige ? '#94a3b8' : isBlueprintTech ? '#93c5fd' : isBrutalistBold ? '#44403c' : '#64748b', 
              marginTop: '1rem',
              fontWeight: 500
            }}>
              {cover.institution}
            </p>
          )}
        </div>

        {/* Pie: Creador, Fecha y Logos Institucionales */}
        <div style={{ 
          paddingLeft: isSidebar ? '25px' : isSplitGrid ? '42%' : isNordicLine ? '2.5rem' : '0',
          borderTop: isDarkExecutive || isGoldenPrestige 
            ? '1px solid #1e293b' 
            : isBlueprintTech
            ? '1px solid #1e3a8a'
            : isBrutalistBold
            ? '3px solid #000000'
            : '2px solid #f1f5f9',
          paddingTop: '2rem',
          zIndex: 1
        }}>
          <div style={{ fontSize: '1.2rem', color: isDarkExecutive || isGoldenPrestige ? '#f1f5f9' : isBlueprintTech ? '#e0f2fe' : '#1e293b', fontWeight: '700' }}>
            {cover.creatorName ? `Creado por: ${cover.creatorName}` : (user?.displayName ? `Elaborado por: ${user.displayName}` : (user?.username ? `Elaborado por: ${user.username}` : 'Elaborado por el Emprendedor'))}
          </div>
          {cover.showDate !== false && (
            <div style={{ fontSize: '1rem', color: isDarkExecutive || isGoldenPrestige ? '#64748b' : isBlueprintTech ? '#60a5fa' : isBrutalistBold ? '#57534e' : '#94a3b8', marginTop: '0.5rem' }}>
              {cover.customDate || new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          )}
          {/* Logos Institucionales */}
          {(cover.institutionLogos?.length > 0) && (
            <div style={{ 
              display: 'flex', 
              justifyContent: isSidebar || isSplitGrid || isNordicLine || isBrutalistBold ? 'flex-start' : 'center', 
              gap: '1.5rem', 
              marginTop: '1.5rem', 
              paddingTop: '1rem', 
              borderTop: isDarkExecutive || isGoldenPrestige ? '1px solid #1e293b' : isBlueprintTech ? '1px solid #1e3a8a' : isBrutalistBold ? '2px solid #000000' : '1px solid #e2e8f0',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              {cover.institutionLogos.map(logo => (
                <div key={logo.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <img src={logo.url} alt={logo.name} style={{ height: '70px', width: 'auto', maxWidth: '140px', objectFit: 'contain', background: isDarkExecutive || isBlueprintTech || isGoldenPrestige ? '#ffffff' : 'transparent', padding: isDarkExecutive || isBlueprintTech || isGoldenPrestige ? '4px' : '0', borderRadius: '4px' }} />
                  {!logo.hideName && (
                    <span style={{ fontSize: '0.7rem', color: isDarkExecutive || isGoldenPrestige ? '#94a3b8' : isBlueprintTech ? '#93c5fd' : isBrutalistBold ? '#000000' : '#64748b', fontWeight: 500 }}>{logo.name}</span>
                  )}
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
          ${(paginationMode === 'continuous' || exportScope === 'executive') ? `
          .print-page {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 0 1rem 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            background: transparent !important;
            page-break-inside: auto !important;
            break-inside: auto !important;
            min-height: auto !important;
          }
          .portrait-print-page,
          .landscape-print-page,
          .anexos-page {
            page: auto !important;
            break-before: auto !important;
            page-break-before: auto !important;
            break-inside: auto !important;
            page-break-inside: auto !important;
            min-height: auto !important;
          }
          .cover-page {
            break-before: avoid !important;
            page-break-before: avoid !important;
            break-after: page !important;
            page-break-after: always !important;
          }
          .toc-page {
            break-before: page !important;
            page-break-before: always !important;
            break-after: page !important;
            page-break-after: always !important;
          }
          .pilar-break {
            break-before: ${exportScope === 'executive' ? 'auto' : 'page'} !important;
            page-break-before: ${exportScope === 'executive' ? 'auto' : 'always'} !important;
          }
          .financial-reports-page {
            break-before: ${exportScope === 'executive' ? 'auto' : 'page'} !important;
            page-break-before: ${exportScope === 'executive' ? 'auto' : 'always'} !important;
          }
          #seccion-fuentes {
            break-before: page !important;
            page-break-before: always !important;
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
            page-break-before: always;
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
          h1, h2, h3, h4, .section-header {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }
          table, .report-table, .financial-card-grid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
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
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn-secondary no-print" onClick={createReviewLink} title="Crear enlace temporal de revisión">Compartir para revisión</button>
          {reviewLink && <input className="no-print" readOnly value={reviewLink} onFocus={e => e.target.select()} style={{ maxWidth: 280 }} />}
          {/* Badge de Alcance y Páginas Estimadas */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: exportScope === 'executive' ? 'rgba(13, 148, 136, 0.1)' : 'rgba(99, 102, 241, 0.1)',
            border: `1px solid ${exportScope === 'executive' ? '#0d9488' : '#6366f1'}`,
            padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700,
            color: exportScope === 'executive' ? '#0f766e' : '#4338ca'
          }}>
            <span>{exportScope === 'executive' ? '📄 Dossier Ejecutivo' : '📚 Documento Maestro'}</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span>~{sourcesPage || 24} págs est.</span>
          </div>

          {/* Badge de Módulos Faltantes */}
          {missingModulesCount > 0 ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              background: '#fef3c7', border: '1px solid #fde68a',
              padding: '0.4rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, color: '#b45309'
            }} title="Módulos sin contenido sustantivo en la metodología activa">
              <span>⚠️ {missingModulesCount} incompletos</span>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              background: '#ecfdf5', border: '1px solid #a7f3d0',
              padding: '0.4rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, color: '#047857'
            }}>
              <span>✅ Contenido Completo</span>
            </div>
          )}

          {/* Badge de Consistencia Financiera */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            background: financialConsistency.consistent ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${financialConsistency.consistent ? '#bbf7d0' : '#fecaca'}`,
            padding: '0.4rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700,
            color: financialConsistency.consistent ? '#166534' : '#991b1b'
          }} title={financialConsistency.message}>
            <span>{financialConsistency.consistent ? '💰 Cifras Cuadradas' : '⚠️ Revisar Inversión'}</span>
          </div>

          <button
            type="button"
            onClick={handleProjectCleanup}
            title="Detectar y limpiar contenido especializado de otro proyecto"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid #fcd34d', background: '#fffbeb', color: '#92400e', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
          >
            <ShieldAlert size={15} /> Revisar mezcla de datos
          </button>
          
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
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Base:</span>
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
              <option value="portrait">Vertical 📄 (recomendado)</option>
              <option value="landscape">Horizontal 📑 (canvas/financiero)</option>
            </select>
            <span className="no-print" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginLeft: '0.3rem' }}>
              Cambiá a Horizontal si FODA/canvas se cortan
            </span>
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

          <ExportScopeToggle exportScope={exportScope} onScopeChange={setExportScope} />

          <DocxExportButton planData={planData} scope={exportScope} />

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
            <div className="toc-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              columnGap: '1.5rem', 
              rowGap: '0.35rem', 
              fontSize: '0.82rem',
              maxWidth: '100%' 
            }}>
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

              <a href="#seccion-resumen-ejecutivo" className="toc-item-link" style={{ background: 'rgba(99, 102, 241, 0.04)', borderRadius: '6px' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-color, #6366f1)' }}>Resumen Ejecutivo & Dictamen de Viabilidad</span>
                <span className="toc-dot-leader" />
                <span className="toc-page-badge" style={{ background: 'var(--accent-color, #6366f1)', color: '#ffffff' }}>{executiveSummaryPage || 3}</span>
              </a>

              <a href="#seccion-tablero-ejecutivo" className="toc-item-link">
                <span style={{ fontWeight: 600, color: '#1e293b' }}>Tablero Ejecutivo de Dirección & KPIs Clave</span>
                <span className="toc-dot-leader" />
                <span className="toc-page-badge">{executiveDashboardPage || 4}</span>
              </a>
              
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

        {/* PÁGINA 3: RESUMEN EJECUTIVO & DICTAMEN DE VIABILIDAD REAL */}
        <div 
          id="seccion-resumen-ejecutivo" 
          className={`print-page ${globalOrientation === 'landscape' ? 'landscape-print-page' : 'portrait-print-page'}`} 
          style={{ 
            marginTop: (paginationMode === 'continuous' || exportScope === 'executive') ? '1rem' : '2.5rem',
            width: '100%',
            maxWidth: globalOrientation === 'landscape' ? '1080px' : '760px',
            margin: (paginationMode === 'continuous' || exportScope === 'executive') ? '0 auto 1.5rem auto' : '0 auto 2.5rem auto',
            minHeight: exportScope === 'executive' ? 'auto' : '1000px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            pageBreakInside: exportScope === 'executive' ? 'auto' : 'avoid',
            breakInside: exportScope === 'executive' ? 'auto' : 'avoid',
            pageBreakBefore: 'always',
            breakBefore: 'page'
          }}
        >
          <CorporatePrintHeader sectionTitle="Resumen Ejecutivo & Viabilidad" pillarTitle="Alta Dirección" />
          
          <div style={{ flex: 1, paddingTop: '1rem', paddingBottom: '1.5rem' }}>
            <ExecutiveSummarySection planData={planData} scope={exportScope} />
          </div>

          <CorporatePrintFooter pageNum={executiveSummaryPage || 3} sectionName="Resumen Ejecutivo" />
        </div>

        {/* PÁGINA 4: TABLERO EJECUTIVO DE DIRECCIÓN, BENCHMARKS Y KPIS DE INDUSTRIA */}
        <div 
          id="seccion-tablero-ejecutivo" 
          className={`print-page ${globalOrientation === 'landscape' ? 'landscape-print-page' : 'portrait-print-page'}`} 
          style={{ 
            marginTop: (paginationMode === 'continuous' || exportScope === 'executive') ? '1rem' : '2.5rem',
            width: '100%',
            maxWidth: globalOrientation === 'landscape' ? '1080px' : '760px',
            margin: (paginationMode === 'continuous' || exportScope === 'executive') ? '0 auto 1.5rem auto' : '0 auto 2.5rem auto',
            minHeight: exportScope === 'executive' ? 'auto' : '1000px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            pageBreakInside: exportScope === 'executive' ? 'auto' : 'avoid',
            breakInside: exportScope === 'executive' ? 'auto' : 'avoid',
            pageBreakBefore: 'always',
            breakBefore: 'page'
          }}
        >
          <CorporatePrintHeader sectionTitle="Tablero Ejecutivo de Dirección & Benchmarks" pillarTitle="Resumen de Dirección" />
          
          <div style={{ flex: 1, paddingTop: '1rem', paddingBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1.25rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-color, #6366f1)' }}>
                Dirección Estratégica & Rendimiento
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: '3px 0 0 0', fontFamily: 'var(--font-display)' }}>
                Tablero Ejecutivo de Dirección, Benchmarks y KPIs de Industria
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px', margin: 0 }}>
                Consolidado maestro de viabilidad financiera, métricas de eficiencia operativa (SCM) y unit economics del negocio.
              </p>
            </div>

            {/* Dashboard Financiero Ejecutivo con datos canónicos */}
            <ExecutiveFinancialDashboard planData={planData} financialData={previewFinancialData} />

            {/* Benchmarks Operativos y Comerciales Consolidados (exclusivos de Documento Maestro) */}
            {exportScope !== 'executive' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
                <BoxBenchmark 
                  definition={{
                    id: 'box_unit_economics',
                    title: 'Unit Economics y Eficiencia Comercial',
                    source: { book: 'The Lean Startup', page: 'Ch. 6' }
                  }}
                  values={{ financialData: previewFinancialData }}
                />
                <BoxBenchmark 
                  definition={{
                    id: 'box_kpi_otd_dso_dio_ccc',
                    title: 'Cuadro de Mando SCM: Eficiencia Operativa',
                    source: { book: 'Operations Management', page: 'p. 142' }
                  }}
                  values={{ financialData: previewFinancialData }}
                />
              </div>
            )}
          </div>

          <CorporatePrintFooter pageNum={executiveDashboardPage || 4} sectionName="Tablero Ejecutivo" />
        </div>

        {/* Renderizar cada pilar/módulo en su orden seleccionado */}
        {orderedModules.map((mod, idx) => {
          if (!shouldShow(mod.pillarKey, mod.key)) return null;

          const sectionNumber = `${idx + 1}.`;
          const individualOrientation = planData.config?.pageOrientations?.[mod.key];
          const orientation = individualOrientation || globalOrientation;
          const isLandscape = orientation === 'landscape';
          const isFirstInPilar = idx === 0 || orderedModules[idx - 1]?.pillarKey !== mod.pillarKey;
          const pilarClass = isFirstInPilar ? 'pilar-break' : '';
          const pageClass = isLandscape ? 'landscape-print-page' : 'portrait-print-page';
          const pageNum = modulePageNumbers[mod.key];

          const isFirst = idx === 0;
          const isLast = idx === orderedModules.length - 1;

          return (
            <React.Fragment key={mod.key}>
              <div 
                id={`seccion-${mod.key}`}
                className={`print-page ${pageClass} ${pilarClass}`} 
                style={{ 
                  marginTop: (paginationMode === 'continuous' || exportScope === 'executive') ? '0.75rem' : '2.5rem',
                  width: '100%',
                  maxWidth: isLandscape ? '1080px' : '760px',
                  margin: (paginationMode === 'continuous' || exportScope === 'executive') ? '0 auto 0.75rem auto' : '0 auto 2.5rem auto',
                  background: '#ffffff',
                  padding: (paginationMode === 'continuous' || exportScope === 'executive') ? '0.8rem 1rem' : `${printMargin}cm`,
                  borderRadius: '12px',
                  boxShadow: 'none',
                  border: '1px solid #e2e8f0',
                  minHeight: 'auto',
                  transition: 'all 0.3s ease',
                  pageBreakBefore: (exportScope === 'executive' || paginationMode === 'continuous')
                    ? (isFirstInPilar ? 'always' : 'auto')
                    : 'always',
                  breakBefore: (exportScope === 'executive' || paginationMode === 'continuous')
                    ? (isFirstInPilar ? 'page' : 'auto')
                    : 'page',
                  pageBreakInside: exportScope === 'executive' ? 'auto' : 'avoid',
                  breakInside: exportScope === 'executive' ? 'auto' : 'avoid',
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

                {/* Encabezado Corporativo de Impresión (en modo ejecutivo se muestra al inicio del pilar) */}
                {(exportScope !== 'executive' || isFirstInPilar) && (
                  <CorporatePrintHeader 
                    sectionTitle={exportScope === 'executive' ? mod.pillarTitle : mod.title} 
                    pillarTitle={exportScope === 'executive' ? 'Dossier Ejecutivo' : mod.pillarTitle} 
                  />
                )}

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
                    {exportScope !== 'executive' && (
                      <BrandBoard data={planData?.naturaleza?.identidad} />
                    )}
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
                    <MaquinariaTable data={planData?.tecnico?.recursos} planData={planData} exportScope={exportScope} />
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
                    <InsumosTable data={planData?.tecnico?.insumos} planData={planData} exportScope={exportScope} />
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
                    {exportScope !== 'executive' && (
                      <CapacidadInventarioWidget data={planData?.tecnico?.capacidad} />
                    )}
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
                    {exportScope !== 'executive' && (
                      <ImpactoAmbientalWidget data={planData?.tecnico?.ambiental} />
                    )}
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
                        {exportScope !== 'executive' && (
                          <HubspotBuyerPersona value={planData?.[mod.pillarKey]?.[mod.key]?.perfil} />
                        )}
                      </>
                    )}
                  </div>
                ) : (mod.key === 'croquis' || mod.key === 'layout' || mod.key === 'instalaciones') ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Section 
                      number={sectionNumber}
                      title={mod.title} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                    />
                    <CroquisPreviewWidget data={planData?.[mod.pillarKey]?.[mod.key] || planData?.tecnico?.croquis || planData?.ingenieria?.layout} />
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
                    {exportScope !== 'executive' && (
                      <>
                        <PresupuestoEmpresa projections={previewFinancialData} staff={planData.organizacion?.staff} planData={planData} />
                        <BalanceGeneralEstandar projections={previewFinancialData} planData={planData} />
                      </>
                    )}
                    <Section 
                      number={sectionNumber}
                      title={mod.title} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                      hideTitle={true}
                    />
                  </div>
                ) : (mod.key === 'estructura' || mod.key === 'recursos_humanos') ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.25rem', fontWeight: 800 }}>
                      {sectionNumber} {mod.title}
                    </h3>
                    {exportScope !== 'executive' && (
                      <>
                        <HumanCapitalMatrix data={planData?.[mod.pillarKey]?.[mod.key] || planData?.organizacion?.estructura} readOnly={true} />
                        <RACIMatrix planData={planData} />
                      </>
                    )}
                    <Section 
                      number=""
                      title={`Detalle de ${mod.title}`} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                      hideTitle={true}
                    />
                  </div>
                ) : (mod.key === 'rentabilidad' || mod.key === 'simulador' || mod.key === 'estados_financieros' || mod.key === 'presupuesto_obra' || mod.key === 'estructura_capital' || mod.key === 'riesgo_matematico') ? (
                  <div key={mod.key} style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem', fontWeight: 800 }}>
                      {sectionNumber} {mod.title}
                    </h3>
                    {exportScope !== 'executive' && (
                      <MultiScenarioFinancialSection planData={planData} />
                    )}
                    <Section 
                      number={sectionNumber}
                      title={mod.title} 
                      data={planData?.[mod.pillarKey]?.[mod.key]} 
                      pillarKey={mod.pillarKey}
                      moduleKey={mod.key}
                      hideTitle={true}
                    />
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
                    {exportScope !== 'executive' && (
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
                            'Hermosillo, Sonora'
                          }
                          mode="competition"
                          readOnly={true}
                          defaultHeatmap={true}
                          title="Mapa de Calor (Densidad y Concentración)"
                          initialKeywords={planData?.semilla?.negocio?.giro || 'comercial'}
                        />
                      </div>
                    )}
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
                    {exportScope !== 'executive' && (
                      <>
                        <FloorPlanDiagram data={planData?.[mod.pillarKey]?.[mod.key]} planData={planData} />
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
                              'Hermosillo, Sonora'
                            }
                            mode="location"
                            readOnly={true}
                            title="Mapa de Localización Estratégica"
                          />
                        </div>
                      </>
                    )}
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
                    {exportScope !== 'executive' && (
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
                            'Hermosillo, Sonora'
                          }
                          mode="competition"
                          readOnly={true}
                          title="Mapa de Competencia y Zonas de Influencia"
                          initialKeywords={planData?.semilla?.negocio?.giro || 'servicios'}
                        />
                      </div>
                    )}
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

                {/* Inclusiones condicionales de tablas y gráficos (reservadas para Documento Maestro) */}
                {exportScope !== 'executive' && mod.pillarKey === 'organizacion' && mod.key === 'estructura' && <PayrollTable />}
                
                {exportScope !== 'executive' && mod.pillarKey === 'organizacion' && mod.key === 'rentabilidad' && previewFinancialData && (
                  <div style={{ marginTop: '2rem' }}>
                    <FinancialCharts staff={planData?.organizacion?.staff} projections={previewFinancialData} showTables={false} />
                  </div>
                )}

                {/* Pie de página con numeración de página calculada (al final del pilar en modo ejecutivo) */}
                {exportScope !== 'executive' ? (
                  <CorporatePrintFooter pageNum={pageNum} sectionName={mod.title} />
                ) : (
                  (idx === orderedModules.length - 1 || orderedModules[idx + 1]?.pillarKey !== mod.pillarKey) && (
                    <CorporatePrintFooter pageNum={pageNum} sectionName={mod.pillarTitle} />
                  )
                )}
              </div>

              {/* Box Components Integration - Metodologías metodológicas por módulo específico */}
              {(() => {
                const projectType = planData.config?.projectType || 'business';
                const boxIds = getBoxIdsForModule(mod.key, projectType);
                if (!boxIds.length) return null;

                const boxes = boxIds.map(id => {
                  for (const methodology of Object.values(BOX_REGISTRY)) {
                    const box = methodology.find(b => b.id === id);
                    if (box) return box;
                  }
                  return null;
                }).filter(Boolean);

                if (exportScope === 'executive' || !boxes.length) return null;

                const moduleBoxData = planData?.[mod.pillarKey]?.[mod.key] || {};
                
                return (
                  <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Layout className="w-5 h-5" />
                      Metodologías y Herramientas Analíticas ({boxes.length} disponibles)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {boxes.map((boxDef) => {
                        const boxValues = {
                          ...(moduleBoxData[boxDef.id] || {}),
                          planData,
                          financialData: previewFinancialData
                        };
                        return (
                          <RenderBox
                            key={boxDef.id}
                            definition={boxDef}
                            values={boxValues}
                            onChange={() => {}}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

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
              marginTop: '2rem', 
              pageBreakBefore: 'always', 
              breakBefore: 'page',
              pageBreakInside: 'auto',
              breakInside: 'auto',
              scrollMarginTop: '2rem'
            }}
          >
            <CorporatePrintHeader sectionTitle="Reportes Financieros Pro-Forma" pillarTitle="Finanzas y Organización" />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.85rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid #0f172a',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0,
              }}>
                📋
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.1 }}>
                  Reportes Financieros Pro-Forma
                </h2>
                <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                  Proyecciones a 5 años · Estado de Resultados · Flujo de Efectivo · Punto de Equilibrio · Costo-Beneficio
                </p>
              </div>
            </div>

            <PrintableFinancialReports
              projections={previewFinancialData}
              staff={planData?.organizacion?.staff}
              planData={planData}
              showMonthlyDetails={exportScope === 'full'}
            />

            <CorporatePrintFooter pageNum={financialReportsPage} sectionName="Reportes Financieros" />
          </div>
        )}

        {/* Anexos */}
        {exportScope !== 'executive' && planData?.config?.anexos?.length > 0 && (
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
                marginTop: exportScope === 'executive' ? '1.5rem' : '3rem', 
                pageBreakBefore: exportScope === 'executive' ? 'auto' : 'always',
                breakBefore: exportScope === 'executive' ? 'auto' : 'page',
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
