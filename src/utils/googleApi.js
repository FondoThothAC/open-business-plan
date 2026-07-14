export const fetchPlaces = async (query, apiKey) => {
  if (!apiKey) throw new Error('Se requiere una API Key de Google.');
  
  const url = `https://places.googleapis.com/v1/places:searchText`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.userRatingCount,places.websiteUri'
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: 'es'
    })
  });
  
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'Error en Google Places API');
  return data.places || [];
};

export const fetchSocialMedia = async (companyName, apiKey, cx) => {
  if (!apiKey || !cx) throw new Error('Falta API Key o Search Engine ID (CX) para Custom Search.');
  const query = `${companyName} "facebook" OR "instagram" OR "linkedin" OR "x.com"`;
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=3`;
  
  const response = await fetch(url);
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'Error en Google Custom Search API');
  
  return data.items || [];
};
