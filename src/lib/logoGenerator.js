/**
 * Generador Inteligente de Logotipos e Isotipos (Open Business Plan v2.6)
 * Fondo Thoth AC — Metodología de Empresas Cuánticas
 * 
 * Multi-proveedor:
 * 1. Pollinations.ai (Turbo / Flux) - 100% Gratis, sin API Key
 * 2. Google Gemini Imagen / Flash - Fallback Cloud con API Key
 * 3. Generador Procedural SVG Vectorial - Fallback Offline Inmediato
 */

export const LOGO_STYLES = {
  flat_vector: {
    id: 'flat_vector',
    name: 'Minimalista Flat Vector',
    emoji: '🎨',
    desc: 'Líneas limpias, moderno, 2D plano, sin degradados complejos',
    promptSuffix: 'minimalist modern flat vector logo icon, clean solid lines, graphic design, vector art, 2d flat, pure white background, corporate branding, high resolution, no text, no typography, no words, no letters'
  },
  mascot_icon: {
    id: 'mascot_icon',
    name: 'Isotipo / Mascota Geométrica',
    emoji: '🦊',
    desc: 'Símbolo distintivo o mascota estilizada geométrica del giro',
    promptSuffix: 'modern stylized mascot logo icon, geometric character emblem, bold shapes, sleek silhouette, vector mascot symbol, clean white background, high contrast, no text, no typography, no letters'
  },
  emblem: {
    id: 'emblem',
    name: 'Emblema / Badge Corporativo',
    emoji: '🛡️',
    desc: 'Insignia o escudo corporativo moderno y profesional',
    promptSuffix: 'modern circular corporate emblem badge icon, elegant crest symbol, luxury minimal insignia, premium graphic branding, pure white background, no text, no typography'
  },
  modern_3d: {
    id: 'modern_3d',
    name: '3D Moderno / Glassmorphism',
    emoji: '✨',
    desc: 'Gradientes vibrantes, sensación táctil y profundidad sutil',
    promptSuffix: 'modern 3D app icon logo, smooth gradients, subtle depth, glossy aesthetic, clay render style, clean isolated white background, elegant lighting, no text, no typography'
  }
};

/**
 * Traduce conceptos clave en español a descriptores visuales en inglés
 */
const KEYWORD_TRANSLATIONS = {
  veterinaria: 'veterinary animal care clinic, pet paw, heart',
  mascota: 'friendly pet, dog or cat silhouette',
  perro: 'friendly dog icon',
  gato: 'sleek cat icon',
  abarrotes: 'cozy local grocery store, fresh food basket, shopping cart',
  tienda: 'storefront boutique icon',
  comercio: 'commerce marketplace symbol',
  mantenimiento: 'maintenance tools, gear and wrench, handyman service',
  servicios: 'professional service symbol, handshake or gears',
  ferreteria: 'hardware tools, hammer, wrench and gear',
  taller: 'workshop mechanical gear and wrench',
  restaurante: 'culinary fork and chef hat, gourmet food',
  comida: 'fresh gourmet food symbol',
  cafeteria: 'coffee bean, steaming cup icon',
  cafe: 'minimalist coffee cup icon',
  salud: 'health cross, wellness leaf, medical symbol',
  farmacia: 'pharmacy cross, medical mortar or capsule',
  tecnologia: 'modern tech circuit node, digital geometric symbol',
  software: 'digital cloud code brackets, technology node',
  educacion: 'education book, graduation cap, lightbulb',
  escuela: 'academic open book, torch of wisdom',
  belleza: 'beauty cosmetic flower, elegant salon scissors',
  estetica: 'hair salon shears and comb, beauty profile',
  construccion: 'architecture building blueprint, crane, hardhat',
  inmobiliaria: 'modern real estate house silhouette, skyline',
  transporte: 'logistics delivery truck, speed arrow',
  consultoria: 'strategic business growth chart, chess knight, vision'
};

function extractEnglishKeywords(text = '') {
  if (!text) return '';
  const clean = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const terms = [];

  for (const [esKey, enDesc] of Object.entries(KEYWORD_TRANSLATIONS)) {
    if (clean.includes(esKey)) {
      terms.push(enDesc);
    }
  }

  return terms.length > 0 ? terms.join(', ') : clean;
}

/**
 * Construye un prompt profesional en inglés optimizado para generadores de imagen
 */
export function buildLogoPrompt(brandData = {}, style = 'flat_vector', userCustomPrompt = '') {
  if (userCustomPrompt && userCustomPrompt.trim()) {
    const styleInfo = LOGO_STYLES[style] || LOGO_STYLES.flat_vector;
    return `${userCustomPrompt.trim()}, ${styleInfo.promptSuffix}`;
  }

  const {
    companyName = '',
    giro = '',
    isotipoDesc = '',
    primaryColor = '#4f46e5',
    secondaryColor = '#10b981'
  } = brandData;

  const styleInfo = LOGO_STYLES[style] || LOGO_STYLES.flat_vector;

  // Extraer términos visuales del isotipo o del giro
  let visualSubject;
  if (isotipoDesc) {
    visualSubject = extractEnglishKeywords(isotipoDesc) || isotipoDesc;
  } else if (giro) {
    visualSubject = extractEnglishKeywords(giro) || giro;
  } else if (companyName) {
    visualSubject = extractEnglishKeywords(companyName) || `${companyName} brand icon`;
  } else {
    visualSubject = 'abstract geometric business icon';
  }

  const colorPaletteDesc = `with ${primaryColor} and ${secondaryColor} color accents`;

  return `Professional logo icon of ${visualSubject}, ${colorPaletteDesc}, ${styleInfo.promptSuffix}`;
}

/**
 * Construye la URL para Pollinations.ai con soporte de API Key privada
 */
export function buildPollinationsUrl(prompt, options = {}) {
  const {
    width = 512,
    height = 512,
    seed = Math.floor(Math.random() * 100000),
    model = 'turbo',
    nologo = true,
    apiKey = ''
  } = options;

  const encodedPrompt = encodeURIComponent(prompt);
  let url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=${nologo ? 'true' : 'false'}&enhance=false`;
  if (apiKey && apiKey.trim()) {
    url += `&key=${encodeURIComponent(apiKey.trim())}`;
  }
  return url;
}

/**
 * Genera un SVG procedural vectorial nativo como fallback 100% offline
 * Soporta 4 arquetipos de diseño geométrico corporativo
 */
export function generateProceduralSvgLogo(brandData = {}, archetypeIndex = 0) {
  const {
    companyName = 'Open Plan',
    primaryColor = '#4f46e5',
    secondaryColor = '#10b981'
  } = brandData;

  // Extraer 1-2 iniciales
  const words = companyName.trim().split(/\s+/).filter(Boolean);
  let initials = 'OP';
  if (words.length === 1) {
    initials = words[0].substring(0, 2).toUpperCase();
  } else if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  }

  const archetype = Math.abs(Number(archetypeIndex) || 0) % 4;
  let innerElements;

  if (archetype === 0) {
    // Squircle Moderno
    innerElements = `
      <rect width="512" height="512" rx="128" fill="url(#brandGrad)" filter="url(#subtleGlow)" />
      <rect x="28" y="28" width="456" height="456" rx="108" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="4" />
      <circle cx="256" cy="256" r="150" fill="rgba(255,255,255,0.12)" />
      <text x="256" y="298" font-family="system-ui, -apple-system, sans-serif" font-size="140" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">
        ${initials}
      </text>
    `;
  } else if (archetype === 1) {
    // Escudo Hexagonal
    innerElements = `
      <polygon points="256,30 460,130 460,370 256,480 52,370 52,130" fill="url(#brandGrad)" filter="url(#subtleGlow)" />
      <polygon points="256,54 436,144 436,356 256,456 76,356 76,144" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="4" />
      <circle cx="256" cy="256" r="120" fill="rgba(0,0,0,0.15)" />
      <text x="256" y="296" font-family="system-ui, -apple-system, sans-serif" font-size="130" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">
        ${initials}
      </text>
    `;
  } else if (archetype === 2) {
    // Cresta Circular Doble
    innerElements = `
      <circle cx="256" cy="256" r="236" fill="url(#brandGrad)" filter="url(#subtleGlow)" />
      <circle cx="256" cy="256" r="212" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-dasharray="8,6" />
      <circle cx="256" cy="256" r="180" fill="rgba(255,255,255,0.15)" />
      <polygon points="256,90 266,114 290,114 270,128 278,152 256,138 234,152 242,128 222,114 246,114" fill="#ffffff" opacity="0.9" />
      <text x="256" y="306" font-family="system-ui, -apple-system, sans-serif" font-size="136" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">
        ${initials}
      </text>
    `;
  } else {
    // Diamante Tecnológico
    innerElements = `
      <rect x="76" y="76" width="360" height="360" rx="48" transform="rotate(45 256 256)" fill="url(#brandGrad)" filter="url(#subtleGlow)" />
      <rect x="96" y="96" width="320" height="320" rx="36" transform="rotate(45 256 256)" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="4" />
      <circle cx="256" cy="256" r="130" fill="rgba(255,255,255,0.12)" />
      <text x="256" y="298" font-family="system-ui, -apple-system, sans-serif" font-size="130" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">
        ${initials}
      </text>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="${secondaryColor}" />
    </linearGradient>
    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="${primaryColor}" flood-opacity="0.35" />
    </filter>
  </defs>
  ${innerElements}
</svg>`;

  const base64 = typeof btoa !== 'undefined'
    ? btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg).toString('base64');

  return {
    svg,
    dataUrl: `data:image/svg+xml;base64,${base64}`
  };
}

/**
 * Descarga una imagen desde Pollinations.ai y la convierte a Data URL Base64
 */
export async function fetchLogoFromPollinations(prompt, options = {}) {
  const url = buildPollinationsUrl(prompt, options);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const headers = {};
    if (options.apiKey) {
      headers['Authorization'] = `Bearer ${options.apiKey.trim()}`;
    }

    const response = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Pollinations HTTP Error ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    let base64 = '';
    if (typeof Buffer !== 'undefined') {
      base64 = Buffer.from(arrayBuffer).toString('base64');
    } else {
      let binary = '';
      const bytes = new Uint8Array(arrayBuffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64 = btoa(binary);
    }

    return {
      url,
      dataUrl: `data:image/png;base64,${base64}`,
      seed: options.seed
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Genera N variantes simultáneas con diferentes seeds
 */
export async function generateLogoVariants(brandData = {}, options = {}) {
  const {
    style = 'flat_vector',
    variantsCount = 4,
    customPrompt = '',
    apiKey = '',
    pollinationsKey = ''
  } = options;

  const keyToUse = apiKey || pollinationsKey;
  const basePrompt = buildLogoPrompt(brandData, style, customPrompt);
  const variants = [];

  const seeds = [
    Math.floor(Math.random() * 90000) + 10000,
    Math.floor(Math.random() * 90000) + 10000,
    Math.floor(Math.random() * 90000) + 10000,
    Math.floor(Math.random() * 90000) + 10000
  ].slice(0, variantsCount);

  // Intentar generar vía Pollinations secuencialmente o en paralelo
  for (let idx = 0; idx < seeds.length; idx++) {
    const seed = seeds[idx];
    try {
      // Usar flux si hay API Key privada, o turbo para modo gratuito
      const modelToUse = keyToUse ? 'flux' : 'turbo';
      const res = await fetchLogoFromPollinations(basePrompt, { seed, model: modelToUse, apiKey: keyToUse });
      variants.push({
        id: `variant-${idx + 1}`,
        dataUrl: res.dataUrl,
        prompt: basePrompt,
        seed,
        provider: keyToUse ? 'pollinations_flux_pro' : 'pollinations_turbo'
      });
    } catch (err) {
      console.warn(`[LogoGenerator] Fallback a SVG para variante ${idx + 1}:`, err.message);
      const svgRes = generateProceduralSvgLogo(brandData, idx);
      variants.push({
        id: `variant-${idx + 1}`,
        dataUrl: svgRes.dataUrl,
        prompt: basePrompt,
        seed,
        provider: 'procedural_svg'
      });
    }
  }

  return {
    success: true,
    prompt: basePrompt,
    style,
    variants
  };
}
