export function httpProviderStatus(code) {
  if (code === 401 || code === 403) return 'credential_rejected';
  if ([429, 432, 433].includes(code)) return 'rate_limited';
  return 'unavailable';
}
export const providerLabels = {
  missing_key: 'Sin clave configurada', credential_rejected: 'Credencial rechazada',
  rate_limited: 'Límite de consumo o solicitudes', unavailable: 'Proveedor no disponible',
  no_results: 'Consulta sin resultados', observed: 'Consulta con resultados',
  disabled: 'Respaldo desactivado', invalid_context: 'Territorio inválido'
};
