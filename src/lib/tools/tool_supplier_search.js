/**
 * Herramienta Agéntica de Búsqueda de Proveedores Reales (DENUE + OSM + DDG)
 * Consulta endpoints multi-fuente factuales y erradica proveedores prefabricados
 */
import { getApiBase } from '../../config/apiConfig.js';

export async function searchRealSuppliers(category, location = 'Hermosillo, Sonora') {
  if (!category) {
    return {
      success: true,
      category: '',
      location,
      suppliers: [],
      totalFound: 0,
      provenance: 'none',
      warning: 'No se proporcionó categoría o insumo de proveedor.'
    };
  }

  const apiBase = getApiBase();
  const query = encodeURIComponent(category);
  const loc = encodeURIComponent(location);

  try {
    const res = await fetch(`${apiBase}/api/market/suppliers?category=${query}&location=${loc}`, {
      signal: AbortSignal.timeout(6000)
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json();
      const suppliers = data.suppliers || [];
      if (suppliers.length > 0) {
        return {
          success: true,
          category,
          location,
          suppliers,
          totalFound: suppliers.length,
          provenance: 'real'
        };
      }
    }
  } catch (e) {
    console.warn('[SupplierSearch] Error consultando backend de proveedores:', e.message);
  }

  // Estado honesto vacío: CERO fabricación de proveedores fijos
  return {
    success: true,
    category,
    location,
    suppliers: [],
    totalFound: 0,
    provenance: 'none',
    warning: `Sin proveedores verificados para "${category}" en ${location}. No se fabricaron proveedores sintéticos.`
  };
}
