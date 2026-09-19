import fetch from 'node-fetch';

/** DENUE describes establishments. It must never be used to infer household income. */
export class InegiAgebEngine {
  constructor(token = process.env.DENUE_KEY || '') { this.token = token; }

  async extractDemographicProfile(lat, lng, radius = 3000, { scian = 'todos' } = {}) {
    const profile = {
      territory: { lat, lng, radiusMeters: radius, verified: false },
      establishments: [],
      census: { status: 'pending', message: 'Carga el conjunto Censo 2020 por AGEB/manzana para obtener población, edades, escolaridad y viviendas.' },
      indicators: [],
      provenance: [{ source: 'INEGI DENUE', status: 'pending', message: 'No hay token DENUE configurado.' }]
    };
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180 || !Number.isFinite(radius) || radius <= 0 || radius > 5000) {
      profile.provenance[0] = { source: 'INEGI DENUE', status: 'invalid_context', message: 'Coordenadas o radio inválidos. DENUE admite radios de 1 a 5,000 metros.' };
      return profile;
    }
    profile.territory.verified = true;
    if (!this.token) return profile;
    try {
      const query = String(scian || 'todos').replace(/[^a-zA-Z0-9,]/g, '') || 'todos';
      const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/${query}/${lat},${lng}/${radius}/${this.token}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = await res.json();
      profile.establishments = (Array.isArray(rows) ? rows : []).map(row => ({
        officialId: String(row.Id || row.id || ''), name: row.Nombre || '', activity: row.Clase_actividad || '', scian: row.Codigo_actividad || '', size: row.Estrato || '', address: [row.Calle, row.Numero_exterior, row.Colonia].filter(Boolean).join(' '), lat: Number(row.Latitud), lng: Number(row.Longitud), source: 'INEGI DENUE', observedAt: new Date().toISOString()
      }));
      profile.provenance[0] = { source: 'INEGI DENUE', status: 'observed', retrievedAt: new Date().toISOString(), coverage: `${radius} m alrededor de las coordenadas` };
    } catch (error) {
      profile.provenance[0] = { source: 'INEGI DENUE', status: 'unavailable', message: error.message };
    }
    return profile;
  }
}
