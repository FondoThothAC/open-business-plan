export const DEFAULT_CENTER = {
  label: 'Hermosillo, Sonora',
  lat: 29.072967,
  lng: -110.955919,
};

export function parseCoordinate(value) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function geocodedCenter(geo, query) {
  const lat = parseCoordinate(geo?.lat);
  const lng = parseCoordinate(geo?.lng);
  if (!geo?.success || lat === null || lng === null || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return {
    lat, lng,
    label: typeof geo.displayName === 'string' && geo.displayName.trim() ? geo.displayName.trim() : query,
  };
}

export function formatCenter(center, decimals = null) {
  if (typeof center?.label === 'string' && center.label.trim()) return center.label;
  const lat = parseCoordinate(center?.lat) ?? DEFAULT_CENTER.lat;
  const lng = parseCoordinate(center?.lng) ?? DEFAULT_CENTER.lng;
  return decimals === null ? `${lat}, ${lng}` : `${lat.toFixed(decimals)}, ${lng.toFixed(decimals)}`;
}

export async function resolveMapCenter(geocode, requestedLocation, fallbackLocation) {
  const query = requestedLocation || DEFAULT_CENTER.label;
  const lookup = async (location) => {
    try { return geocodedCenter(await geocode(location), location); }
    catch { return null; }
  };
  const resolved = await lookup(query);
  if (resolved) return { center: resolved, verified: true, warning: '' };
  const fallback = fallbackLocation && fallbackLocation !== query ? await lookup(fallbackLocation) : null;
  const center = fallback || DEFAULT_CENTER;
  return {
    center, verified: false,
    warning: `No se pudo localizar «${query}». Se muestra ${center.label} como referencia; el análisis no se puede guardar.`,
  };
}
