/**
 * Service for INEGI / DENUE API Integration
 */

export async function searchCompetenciaDENUE(token, lat, lng, radius = 2000, keywords = 'todos') {
  if (!token) return { success: false, error: 'Token DENUE no configurado' };

  try {
    const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/${encodeURIComponent(keywords)}/${lat},${lng}/${radius}/${token}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      return { success: false, error: 'Respuesta inválida de INEGI' };
    }

    return {
      success: true,
      total: data.length,
      businesses: data.map(item => ({
        nombre: item.Nombre,
        actividad: item.Clase_actividad,
        estrato: item.Estrato,
        direccion: `${item.Tipo_vialidad} ${item.Calle} ${item.Num_Exterior}`,
        ubicacion: `${item.Latitud}, ${item.Longitud}`
      }))
    };
  } catch (error) {
    console.error("DENUE Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getInflacionBanxico(token) {
  if (!token) return { success: false, error: 'Token Banxico no configurado' };
  
  // Serie SP74625 = Inflación anual
  const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/SP74625/datos/oportuno`;
  
  try {
    const response = await fetch(url, {
      headers: { 'Bmx-Token': token }
    });
    const data = await response.json();
    const dato = data.bmx.series[0].datos[0];
    
    return {
      success: true,
      valor: dato.dato,
      fecha: dato.fecha
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
