import React, { useState } from 'react';
import { Search, Loader, ShieldAlert } from 'lucide-react';
import { construirConsultas, normalizarCandidatos, clasificarCandidatos, candidatoAFactor } from '../lib/pestelResearch';
import { validateMatriz } from '../lib/pestelMatrix';
import { normalizeSearchConfig, buildSearchApiKeys } from '../lib/tools/provenance';

/**
 * Panel de investigación de factores PESTEL sobre la cascada de búsqueda de la app
 * (Tavily / Brave / Serper / DuckDuckGo vía /api/search).
 *
 * Regla de diseño: el buscador propone, la persona dispone. Una fila solo entra a la
 * matriz si trae URL y fecha de publicación dentro de la ventana, y si alguien escribió
 * IP, Ir y p(x). Los candidatos sin fecha se listan como tales en vez de rellenarlos.
 */
export default function PestelResearchPanel({
  matriz = [],
  ventana,
  empresa = '',
  giro = '',
  horizonte = '',
  config = {},
  onAprobar
}) {
  const [cargando, setCargando] = useState(false);
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState('');
  const [calificaciones, setCalificaciones] = useState({});
  const [rechazos, setRechazos] = useState({});

  const setCal = (url, campo, valor) => setCalificaciones((prev) => ({ ...prev, [url]: { ...(prev[url] || {}), [campo]: valor } }));

  const investigar = async () => {
    setCargando(true);
    setError('');
    const search = normalizeSearchConfig(config?.search || {});
    const keys = buildSearchApiKeys(config || {});
    const apiBase = config?.apiBase || '';
    const consultas = construirConsultas({ empresa, giro });
    const todos = [];
    const avisos = [];
    try {
      for (const c of consultas) {
        const res = await fetch(`${apiBase}/api/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: c.query,
            provider: search.provider || 'tavily',
            apiKey: keys.tavilyKey || search.apiKey,
            braveApiKey: keys.braveKey || search.braveApiKey,
            serperApiKey: keys.serperKey || search.serperApiKey,
            limit: 4
          }),
          signal: AbortSignal.timeout(20000)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || `Búsqueda falló para ${c.label}`);
        if (data.quotaWarning) avisos.push(`${c.label}: ${data.quotaWarning}`);
        todos.push(...normalizarCandidatos(data.results || [], c.dim));
      }
      const cajones = clasificarCandidatos(todos, { ventana, matrizActual: matriz });
      setEstado({ ...cajones, proveedores: [...new Set(todos.map((t) => t.provider))], avisos });
    } catch (e) {
      setError(e.message === 'Failed to fetch' ? 'No se pudo contactar al servidor de búsqueda.' : e.message);
    } finally {
      setCargando(false);
    }
  };

  const aprobar = (candidato) => {
    const cal = calificaciones[candidato.url] || {};
    const siguienteN = Math.max(0, ...matriz.map((f) => Number(f.n) || 0)) + 1;
    const { factor, error: err, sello } = candidatoAFactor(candidato, { ...cal, n: siguienteN });
    if (err) {
      setRechazos((prev) => ({ ...prev, [candidato.url]: err }));
      return;
    }
    const nueva = [...matriz, { ...factor, ...sello }];
    const objeciones = validateMatriz(nueva, { ventana });
    if (objeciones.length) {
      setRechazos((prev) => ({ ...prev, [candidato.url]: objeciones.join(' · ') }));
      return;
    }
    setRechazos((prev) => ({ ...prev, [candidato.url]: null }));
    onAprobar?.(nueva);
  };

  const campo = (valor, onChange, props = {}) => (
    <input
      type="number"
      value={valor ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      style={{ width: '58px', padding: '0.2rem 0.35rem', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary, #fff)', color: 'var(--text-primary)' }}
      {...props}
    />
  );

  // Se renderiza como función, no como componente anidado: una flecha definida aquí
  // cambiaría de identidad en cada render, React desmontaría las filas y el usuario
  // perdería el foco a media escritura.
  const renderFila = (c, bloqueada = false, motivo = '') => {
    const cal = calificaciones[c.url] || {};
    return (
      <div key={c.url} className="pestel-candidato" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', opacity: bloqueada ? 0.62 : 1 }}>
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <a href={c.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>{c.titulo}</a>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            {c.fecha ? String(c.fecha).slice(0, 10) : 'sin fecha verificable'} · {c.provider} · {c.dim}
          </div>
        </div>
        {bloqueada ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#b45309' }}>
            <ShieldAlert style={{ width: 13, height: 13 }} />{motivo}
          </span>
        ) : (
          <>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>IP{campo(cal.ip, (v) => setCal(c.url, 'ip', v), { min: 1, max: 3 })}</label>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Ir{campo(cal.ir, (v) => setCal(c.url, 'ir', v), { min: 1, max: 3 })}</label>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>p(x){campo(cal.px, (v) => setCal(c.url, 'px', v), { min: 0, max: 1, step: 0.05 })}</label>
            <select value={cal.oa || ''} onChange={(e) => setCal(c.url, 'oa', e.target.value)} style={{ fontSize: '0.74rem', padding: '0.25rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary, #fff)', color: 'var(--text-primary)' }}>
              <option value="">O/A</option>
              <option value="O">Oportunidad</option>
              <option value="A">Amenaza</option>
            </select>
            <button type="button" onClick={() => aprobar(c)} style={{ fontSize: '0.74rem', fontWeight: 800, padding: '0.3rem 0.7rem', borderRadius: '8px', border: 'none', background: '#16324f', color: '#fff', cursor: 'pointer' }}>Añadir</button>
            {rechazos[c.url] ? <span style={{ fontSize: '0.72rem', color: '#b91c1c', flexBasis: '100%' }}>{rechazos[c.url]}</span> : null}
          </>
        )}
      </div>
    );
  };

  return (
    <section className="pestel-investigacion" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '1rem 1.15rem', borderRadius: '14px', border: '1px dashed var(--border-color)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', flex: 1 }}>
          Investigar factores nuevos
        </h4>
        <button type="button" onClick={investigar} disabled={cargando} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 800, padding: '0.4rem 0.85rem', borderRadius: '9px', border: 'none', background: cargando ? '#64748b' : '#16324f', color: '#fff', cursor: cargando ? 'wait' : 'pointer' }}>
          {cargando ? <Loader style={{ width: 14, height: 14 }} className="animate-spin" /> : <Search style={{ width: 14, height: 14 }} />}
          {cargando ? 'Buscando…' : 'Buscar con Tavily'}
        </button>
      </div>
      <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
        {horizonte ? `Horizonte ${horizonte}. ` : ''}Una consulta por dimensión, ventana {ventana?.desde} → {ventana?.hasta}. Ninguna fila entra a la matriz sin URL, fecha y calificación escrita por ti.
      </p>

      {error ? <p style={{ margin: 0, fontSize: '0.78rem', color: '#b91c1c' }}>{error}</p> : null}

      {estado ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            {estado.aptos.length} aptos · {estado.sinFecha.length} sin fecha o sin ventana · {estado.fueraDeVentana.length} fuera de ventana · {estado.duplicados.length} repetidos o ya en la matriz
            {estado.proveedores.length ? ` · proveedores: ${estado.proveedores.join(', ')}` : ''}
            {estado.avisos.length ? ` · ${estado.avisos[0]}` : ''}
          </div>

          {estado.aptos.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {estado.aptos.map((c) => renderFila(c))}
            </div>
          ) : null}

          {estado.sinFecha.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {estado.sinFecha.map((c) => renderFila(c, true, c.fecha ? 'ventana de fuentes no configurada' : 'sin fecha de publicación: no admisible'))}
            </div>
          ) : null}

          {estado.fueraDeVentana.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {estado.fueraDeVentana.map((c) => renderFila(c, true, `fuera de la ventana (${String(c.fecha).slice(0, 10)})`))}
            </div>
          ) : null}

          {!estado.aptos.length && !estado.sinFecha.length && !estado.fueraDeVentana.length ? (
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Sin candidatos utilizables en esta pasada. Es un resultado válido: se declara la limitación, no se rellena.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
