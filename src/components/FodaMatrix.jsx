/**
 * @file FodaMatrix.jsx
 * @description Matriz FODA Dinámica, Ley de Conversión a Fortalezas y Desacoplamiento PESTEL.
 * Fondo Thoth AC — Open Business Plan.
 *
 * Transforma el FODA en un tablero interactivo con:
 * 1. Acciones pedagógicas de conversión hacia Fortalezas (TOWS / Delegación Cuántica).
 * 2. Detección pedagógica de factores legales para redirigir a PESTEL (Dimensión Legal).
 * 3. Selector rápido para mover factores entre cuadrantes en caso de mala clasificación.
 * 4. Soporte completo de impresión y modo lectura en Vista Previa.
 */

import React, { useState } from 'react';
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  AlertOctagon, 
  Sparkles, 
  Scale, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ArrowRight,
  MoveRight,
  HelpCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  parseFodaText, 
  serializeFodaItems, 
  detectLegalInFoda, 
  transformToFortaleza 
} from '../lib/fodaParser.js';

export default function FodaMatrix({ data, onChange, onMoveToPestel }) {
  if (!data) return null;

  // Estado para el modal o formulario en línea de conversión a Fortaleza
  const [conversionTarget, setConversionTarget] = useState(null); // { item, fromCategory }
  const [conversionPlan, setConversionPlan] = useState('');
  const [removeOriginOnConvert, setRemoveOriginOnConvert] = useState(false);

  // Estado para edición en línea de un ítem individual
  const [editingItemId, setEditingItemId] = useState(null);
  const [editText, setEditText] = useState('');

  // Estado para añadir un nuevo ítem en un cuadrante específico
  const [addingToCategory, setAddingToCategory] = useState(null);
  const [newItemText, setNewItemText] = useState('');

  // Notificación pedagógica temporal
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const isEditable = typeof onChange === 'function';

  // Configuración visual y semántica de los 4 cuadrantes
  const QUADRANTS = [
    {
      key: 'fortalezas',
      label: 'Fortalezas',
      subtitle: 'Capacidades internas y ventajas competitivas tangibles',
      icon: Shield,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.06)',
      borderColor: 'rgba(59, 130, 246, 0.28)',
      actionLabel: null
    },
    {
      key: 'debilidades',
      label: 'Debilidades',
      subtitle: 'Brechas internas a superar vía mitigación o delegación',
      icon: AlertTriangle,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.06)',
      borderColor: 'rgba(245, 158, 11, 0.28)',
      actionLabel: 'Convertir en Fortaleza',
      actionIcon: Sparkles,
      actionPrompt: '¿Qué plan de superación o perfil de delegación cuántica resolverá esta debilidad interna?'
    },
    {
      key: 'oportunidades',
      label: 'Oportunidades',
      subtitle: 'Tendencias y vacíos de mercado para capturar como activos propios',
      icon: TrendingUp,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.06)',
      borderColor: 'rgba(16, 185, 129, 0.28)',
      actionLabel: 'Capturar como Fortaleza',
      actionIcon: ArrowRight,
      actionPrompt: '¿Qué capacidad instalada, inversión o activo interno debe crear la empresa para adueñarse de esta oportunidad?'
    },
    {
      key: 'amenazas',
      label: 'Amenazas',
      subtitle: 'Riesgos del entorno competitivo inmediato para blindar o pivotar',
      icon: AlertOctagon,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.06)',
      borderColor: 'rgba(239, 68, 68, 0.28)',
      actionLabel: 'Blindar como Fortaleza',
      actionIcon: Shield,
      actionPrompt: '¿Qué estrategia defensiva o innovación protegerá a la empresa convirtiéndola en una ventaja resiliente?'
    }
  ];

  // Helper para actualizar un cuadrante serializando sus ítems
  const updateQuadrant = (categoryKey, newItems) => {
    if (!onChange) return;
    const serialized = serializeFodaItems(newItems);
    onChange(categoryKey, serialized);
  };

  // Manejar eliminación de un factor
  const handleDeleteItem = (categoryKey, itemId) => {
    const currentItems = parseFodaText(data[categoryKey], categoryKey);
    const updated = currentItems.filter((it) => it.id !== itemId);
    updateQuadrant(categoryKey, updated);
  };

  // Iniciar edición de un factor
  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setEditText(item.text);
  };

  // Guardar edición de un factor
  const handleSaveEdit = (categoryKey, itemId) => {
    if (!editText.trim()) return;
    const currentItems = parseFodaText(data[categoryKey], categoryKey);
    const updated = currentItems.map((it) => (it.id === itemId ? { ...it, text: editText.trim() } : it));
    updateQuadrant(categoryKey, updated);
    setEditingItemId(null);
    setEditText('');
  };

  // Mover un factor a otro cuadrante
  const handleMoveToCategory = (sourceCategory, targetCategory, item) => {
    if (sourceCategory === targetCategory) return;
    const sourceItems = parseFodaText(data[sourceCategory], sourceCategory).filter((it) => it.id !== item.id);
    const targetItems = parseFodaText(data[targetCategory], targetCategory);
    targetItems.push({ text: item.text });

    updateQuadrant(sourceCategory, sourceItems);
    updateQuadrant(targetCategory, targetItems);

    setFeedbackMsg(`Factor movido a ${targetCategory.toUpperCase()}`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Transferir un factor a PESTEL (Legal)
  const handleTransferToPestel = (categoryKey, item) => {
    if (typeof onMoveToPestel === 'function') {
      onMoveToPestel(item.text);
      handleDeleteItem(categoryKey, item.id);
      setFeedbackMsg(`✓ Factor transferido a PESTEL (Dimensión Legal).`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  // Ejecutar conversión hacia Fortaleza
  const handleExecuteConversion = () => {
    if (!conversionTarget || !conversionPlan.trim()) return;

    const { item, fromCategory } = conversionTarget;
    const nuevaFortalezaTexto = transformToFortaleza(item, fromCategory, conversionPlan.trim());

    // Añadir a fortalezas
    const currentFortalezas = parseFodaText(data.fortalezas, 'fortalezas');
    currentFortalezas.push({ text: nuevaFortalezaTexto });
    updateQuadrant('fortalezas', currentFortalezas);

    // Si se marcó eliminar del origen
    if (removeOriginOnConvert) {
      handleDeleteItem(fromCategory, item.id);
    }

    setFeedbackMsg(`⚡ ¡Fortaleza construida exitosamente a partir de ${fromCategory.slice(0, -1)}!`);
    setTimeout(() => setFeedbackMsg(null), 4000);

    setConversionTarget(null);
    setConversionPlan('');
    setRemoveOriginOnConvert(false);
  };

  // Añadir un nuevo ítem a un cuadrante
  const handleAddNewItem = (categoryKey) => {
    if (!newItemText.trim()) return;
    const currentItems = parseFodaText(data[categoryKey], categoryKey);
    currentItems.push({ text: newItemText.trim() });
    updateQuadrant(categoryKey, currentItems);
    setAddingToCategory(null);
    setNewItemText('');
  };

  return (
    <div className="foda-interactive-matrix" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Banner Pedagógico de Principio Metodológico */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1rem 1.25rem', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)', 
          background: 'rgba(99, 102, 241, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Ley de Conversión a Fortalezas & Frontera PESTEL
            </h4>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', opacity: 0.8 }}>
              El FODA es operativo: las debilidades y oportunidades deben evolucionar hacia <strong>Fortalezas</strong>. Factores legales y reformas macro pertenecen a <strong>PESTEL (Legal)</strong>.
            </p>
          </div>
        </div>

        {feedbackMsg && (
          <div style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>
            {feedbackMsg}
          </div>
        )}
      </div>

      {/* Grid de los 4 Cuadrantes */}
      <div 
        className="foda-grid-container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem',
          width: '100%'
        }}
      >
        {QUADRANTS.map((quad) => {
          const Icon = quad.icon;
          const rawContent = data[quad.key] || '';
          const items = parseFodaText(rawContent, quad.key);

          return (
            <div 
              key={quad.key}
              className="foda-card glass-panel"
              style={{
                padding: '1.5rem',
                borderRadius: '16px',
                border: `1.5px solid ${quad.borderColor}`,
                background: quad.bgColor,
                boxShadow: `0 8px 30px ${quad.bgColor.replace('0.06', '0.04')}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                minHeight: '280px',
                position: 'relative'
              }}
            >
              {/* Encabezado del Cuadrante */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${quad.borderColor}`, paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div 
                    style={{ 
                      width: '34px', 
                      height: '34px', 
                      borderRadius: '8px', 
                      background: `${quad.color}15`, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: `1px solid ${quad.color}30`
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: quad.color }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: quad.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {quad.label} ({items.length})
                    </h4>
                    <span style={{ fontSize: '0.72rem', opacity: 0.7, display: 'block' }}>{quad.subtitle}</span>
                  </div>
                </div>

                {isEditable && (
                  <button
                    type="button"
                    onClick={() => {
                      setAddingToCategory(quad.key);
                      setNewItemText('');
                    }}
                    className="btn btn-outline"
                    title={`Agregar nuevo factor a ${quad.label}`}
                    style={{
                      padding: '0.25rem 0.55rem',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border-color)',
                      color: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={13} />
                    <span>Agregar</span>
                  </button>
                )}
              </div>

              {/* Formulario rápido para agregar factor */}
              {addingToCategory === quad.key && (
                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder={`Escribe nueva ${quad.label.slice(0, -1)}...`}
                    className="form-control"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddNewItem(quad.key);
                      if (e.key === 'Escape') setAddingToCategory(null);
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setAddingToCategory(null)} 
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleAddNewItem(quad.key)} 
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', background: quad.color, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de Fichas de Factores */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                {items.length > 0 ? (
                  items.map((item) => (
                    <div 
                      key={item.id}
                      className="foda-item-card glass-panel"
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Cuerpo del Texto o Modo Edición */}
                      {editingItemId === item.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={2}
                            className="form-control"
                            style={{ fontSize: '0.85rem' }}
                            autoFocus
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => setEditingItemId(null)}
                              style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
                            >
                              <X size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(quad.key, item.id)}
                              style={{ padding: '2px 8px', fontSize: '0.7rem', background: quad.color, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              <Check size={13} /> Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, flex: 1 }}>
                            {item.text}
                          </p>

                          {isEditable && (
                            <div className="foda-item-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: 0.7 }}>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(item)}
                                title="Editar texto"
                                style={{ background: 'none', border: 'none', color: 'inherit', padding: '2px', cursor: 'pointer' }}
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(quad.key, item.id)}
                                title="Eliminar factor"
                                style={{ background: 'none', border: 'none', color: '#ef4444', padding: '2px', cursor: 'pointer' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Aviso Pedagógico Anti-Contaminación PESTEL */}
                      {item.isLegalWarning && (
                        <div 
                          style={{
                            padding: '0.45rem 0.65rem',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem',
                            fontSize: '0.75rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171' }}>
                            <Scale size={14} style={{ flexShrink: 0 }} />
                            <span>
                              <strong>Factor Legal detectado ({item.matchedTerm}):</strong> Corresponde a PESTEL (Legal).
                            </span>
                          </div>

                          {isEditable && typeof onMoveToPestel === 'function' && (
                            <button
                              type="button"
                              onClick={() => handleTransferToPestel(quad.key, item)}
                              style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                background: '#ef4444',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Mover a PESTEL
                            </button>
                          )}
                        </div>
                      )}

                      {/* Barra de Acciones de Transformación (Ley de Conversión a Fortalezas) */}
                      {isEditable && quad.key !== 'fortalezas' && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.45rem', marginTop: '0.2rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setConversionTarget({ item, fromCategory: quad.key });
                              setConversionPlan('');
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '6px',
                              background: 'rgba(59, 130, 246, 0.12)',
                              color: '#60a5fa',
                              border: '1px solid rgba(59, 130, 246, 0.25)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title={`Plan de acción para convertir esta ${quad.label.slice(0, -1)} en Fortaleza`}
                          >
                            <Sparkles size={12} />
                            <span>{quad.actionLabel}</span>
                          </button>

                          {/* Selector rápido para corregir clasificación */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.68rem', opacity: 0.5 }}>Reclasificar:</span>
                            {QUADRANTS.filter((q) => q.key !== quad.key).map((targetQ) => (
                              <button
                                key={targetQ.key}
                                type="button"
                                onClick={() => handleMoveToCategory(quad.key, targetQ.key, item)}
                                title={`Mover a ${targetQ.label}`}
                                style={{
                                  padding: '1px 5px',
                                  fontSize: '0.68rem',
                                  borderRadius: '3px',
                                  background: 'rgba(255,255,255,0.06)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  color: targetQ.color,
                                  cursor: 'pointer'
                                }}
                              >
                                {targetQ.label.slice(0, 1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', opacity: 0.5, fontStyle: 'italic', fontSize: '0.85rem' }}>
                    Sin {quad.label.toLowerCase()} redactadas aún.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal / Diálogo de Conversión hacia Fortaleza */}
      {conversionTarget && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setConversionTarget(null)}
        >
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '1.75rem',
              borderRadius: '16px',
              border: '1px solid var(--accent-color, #6366f1)',
              background: 'var(--bg-panel, #0f172a)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                Ley de Conversión: Transformar en Fortaleza
              </h3>
            </div>

            <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700 }}>
                {conversionTarget.fromCategory.toUpperCase()} ORIGINAL:
              </span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                "{conversionTarget.item.text}"
              </p>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>
                {conversionTarget.fromCategory === 'debilidades'
                  ? 'Plan de Superación / Perfil de Delegación Cuántica:'
                  : conversionTarget.fromCategory === 'oportunidades'
                  ? 'Capacidad instalada o inversión para adueñarse de la oportunidad:'
                  : 'Blindaje defensivo o innovación resiliente:'}
              </label>
              <textarea
                value={conversionPlan}
                onChange={(e) => setConversionPlan(e.target.value)}
                rows={3}
                className="form-control"
                placeholder={
                  conversionTarget.fromCategory === 'debilidades'
                    ? 'Ej: Reclutar un CFO complementario y adoptar software contable automatizado en la nube...'
                    : conversionTarget.fromCategory === 'oportunidades'
                    ? 'Ej: Compra de cámara de refrigeración con capacidad de 2 toneladas y contrato exclusivo...'
                    : 'Ej: Contratos a futuro con productores de granos para congelar costo por 12 meses...'
                }
                style={{ fontSize: '0.88rem' }}
                autoFocus
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', opacity: 0.85 }}>
              <input
                type="checkbox"
                checked={removeOriginOnConvert}
                onChange={(e) => setRemoveOriginOnConvert(e.target.checked)}
              />
              <span>Remover la {conversionTarget.fromCategory.slice(0, -1)} original (marcarla como completamente superada)</span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setConversionTarget(null)}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteConversion}
                className="btn btn-primary"
                disabled={!conversionPlan.trim()}
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Sparkles size={14} />
                <span>Crear Fortaleza</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overrides de impresión limpia para documentos PDF/Word */}
      <style>{`
        @media print {
          .foda-grid-container {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.8cm !important;
            display: grid !important;
            width: 100% !important;
            max-width: 100% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .foda-card {
            background: #ffffff !important;
            color: #1e293b !important;
            border: 1.5px solid #cbd5e1 !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border-radius: 10px !important;
            padding: 1.25rem !important;
            min-height: 140px !important;
          }
          .foda-item-card {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            color: #1e293b !important;
          }
          .foda-item-actions, .foda-item-actions-bar, .btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
