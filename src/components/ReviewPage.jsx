import { useEffect, useState } from 'react';
import { getApiBase } from '../config/apiConfig.js';

export default function ReviewPage({ token }) {
  const [state, setState] = useState({ loading: true });
  const [text, setText] = useState('');
  const [anchor, setAnchor] = useState('');
  const [enviando, setEnviando] = useState(false);
  useEffect(() => { fetch(`${getApiBase()}/api/review/${encodeURIComponent(token)}`).then(async r => {
    const body = await r.json(); setState(r.ok ? { ...body.review, loading: false } : { error: body.error, loading: false });
  }).catch(() => setState({ error: 'No se pudo conectar al servidor.', loading: false })); }, [token]);
  if (state.loading) return <main className="review-page">Cargando documento…</main>;
  if (state.error) return <main className="review-page"><h1>Enlace no disponible</h1><p>{state.error}</p></main>;
  // [B4] El submit no tenia try/catch: un fallo de red quedaba como rejection sin manejar y
  // el boton "Enviar comentario" parecia no hacer nada. El re-fetch tampoco miraba x.ok.
  const submit = async () => {
    setEnviando(true);
    try {
      const r = await fetch(`${getApiBase()}/api/review/${encodeURIComponent(token)}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, anchor }) });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || `No se pudo enviar el comentario (HTTP ${r.status})`);
      }
      setText(''); setAnchor('');
      const x = await fetch(`${getApiBase()}/api/review/${encodeURIComponent(token)}`);
      if (!x.ok) throw new Error('El comentario se envió, pero no se pudo actualizar la vista.');
      const body = await x.json();
      setState(s => ({ ...s, ...(body.review || {}) }));
    } catch (e) {
      setState(s => ({ ...s, errorEnvio: e.message }));
    } finally {
      setEnviando(false);
    }
  };
  return <main className="review-page" style={{ maxWidth: 1100, margin: '2rem auto', padding: '1rem' }}><h1>{state.project?.name}</h1><p>Revisión compartida · vence {state.expiresAt ? new Date(state.expiresAt).toLocaleDateString('es-MX') : 'no especificado'}</p><article style={{ whiteSpace: 'pre-wrap', background: '#151827', padding: '1.5rem', borderRadius: 12 }}>{JSON.stringify(state.document, null, 2)}</article><section style={{ marginTop: 20 }}><h2>Comentarios</h2>{(state.comments || []).map(c => <div key={c.id} style={{ padding: 10, borderBottom: '1px solid #333' }}><small>{c.createdAt}</small><div>{c.text}</div></div>)}<textarea value={text} onChange={e => setText(e.target.value)} placeholder="Solicita un cambio…" rows={4} style={{ width: '100%' }} /><input value={anchor} onChange={e => setAnchor(e.target.value)} placeholder="Texto o bloque seleccionado (opcional)" style={{ width: '100%', margin: '8px 0' }} /><button disabled={!text.trim() || enviando} onClick={submit}>{enviando ? 'Enviando…' : 'Enviar comentario'}</button>{state.errorEnvio ? <p role="alert" style={{ color: '#f87171', marginTop: 8 }}>{state.errorEnvio}</p> : null}</section></main>;
}
