/**
 * Mapeo de Clasificaciones Industriales para Radios de Búsqueda de Mapas.
 * Soporta SCIAN (México), y está estructurado para soportar NAICS (USA/Canadá) y NACE (Europa).
 */

// Retorna el radio de búsqueda (en metros) según la clave y el sistema
export function getAutoRadius(code, system = 'SCIAN') {
  const c = String(code);
  
  if (system === 'SCIAN' || system === 'NAICS') {
    // Abarrotes y alimentos (2.5 km)
    if (c.startsWith('461') || c === '461110' || c === '445') return 2500; 
    
    // Tiendas especializadas, farmacias, ropa (3 km)
    if (c.startsWith('463') || c.startsWith('464') || c.startsWith('465') || c.startsWith('466') || c.startsWith('446') || c.startsWith('448')) return 3000; 
    
    // Ferreterías, tlapalerías, materiales de construcción (5 km)
    if (c.startsWith('467') || c.startsWith('444')) return 5000; 
    
    // Supermercados, autoservicio, departamentales (10 km)
    if (c.startsWith('462') || c.startsWith('452')) return 10000; 
    
    // Refaccionarias, vehículos, gasolineras (5 km)
    if (c.startsWith('468') || c.startsWith('441') || c.startsWith('447')) return 5000; 
    
    // Restaurantes, cafeterías y comida rápida (3 km)
    if (c.startsWith('722')) return 3000; 
    
    // Hoteles (10 km)
    if (c.startsWith('721')) return 10000; 
    
    // Reparaciones, estéticas, lavanderías (3 km)
    if (c.startsWith('811') || c.startsWith('812')) return 3000; 
    
    // Escuelas (5 km)
    if (c.startsWith('61')) return 5000; 
    
    // Consultorios médicos/dentales (3 km)
    if (c.startsWith('621')) return 3000; 
    
    // Hospitales (15 km)
    if (c.startsWith('622')) return 15000; 
    
    // Bancos, seguros (5 km)
    if (c.startsWith('52')) return 5000; 
    
    // Inmobiliarias, servicios corporativos, legales (10 km)
    if (c.startsWith('53') || c.startsWith('54') || c.startsWith('56')) return 10000; 
  }

  // Fallback si no está mapeado
  return 5000; 
}
