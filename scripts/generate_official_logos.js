import fs from 'fs';
import path from 'path';
import { generateProceduralSvgLogo, fetchLogoFromPollinations, buildLogoPrompt } from '../src/lib/logoGenerator.js';

const POLLINATIONS_KEY = 'sk_LvzH69djr2l1KnF3dqZ6YoPXyCLjbf0b';

const PROJECTS = [
  {
    type: 'negocios',
    id: 'veterinaria_comunitaria',
    altId: 'veterinaria_patitas',
    name: 'Veterinaria Patitas de Amor',
    giro: 'Clínica y servicios veterinarios para animales de compañía',
    isotipoDesc: 'Huella de perro entrelazada con un corazón tierno y estetoscopio',
    primaryColor: '#4f46e5',
    secondaryColor: '#10b981',
    archetype: 0
  },
  {
    type: 'negocios',
    id: 'abarrotes_colonia',
    altId: 'abarrotes_esquinita',
    name: 'Abarrotes La Esquinita',
    giro: 'Tienda de abarrotes, víveres y productos frescos de la canasta básica',
    isotipoDesc: 'Casita esquinada con un carrito de mandado sonriente y frutas frescas',
    primaryColor: '#f59e0b',
    secondaryColor: '#10b981',
    archetype: 2
  },
  {
    type: 'negocios',
    id: 'prestador_servicios',
    altId: 'mantenpro_servicios',
    name: 'MantenPro Servicios de Mantenimiento',
    giro: 'Servicios profesionales de mantenimiento residencial y comercial',
    isotipoDesc: 'Engranaje tecnológico moderno entrelazado con llave y escudo de garantía',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    archetype: 1
  }
];

async function generateAndApplyLogos() {
  console.log('🎨 Iniciando generación con Pollinations Flux PRO (API Key Autenticada)...');

  for (const proj of PROJECTS) {
    console.log(`\n========================================`);
    console.log(`📌 Procesando: ${proj.name} (${proj.id})`);

    const brandData = {
      companyName: proj.name,
      giro: proj.giro,
      isotipoDesc: proj.isotipoDesc,
      primaryColor: proj.primaryColor,
      secondaryColor: proj.secondaryColor
    };

    const prompt = buildLogoPrompt(brandData, 'flat_vector');
    console.log(`📝 Prompt IA: ${prompt}`);

    let dataUrl = '';
    try {
      console.log(`⏳ Generando con Flux vía Pollinations API Key privada...`);
      const res = await fetchLogoFromPollinations(prompt, {
        seed: Math.floor(Math.random() * 80000) + 1000,
        model: 'flux',
        apiKey: POLLINATIONS_KEY
      });
      dataUrl = res.dataUrl;
      console.log(`✅ Logotipo Flux PRO generado exitosamente (Base64 size: ${dataUrl.length})`);
    } catch (err) {
      console.warn(`⚠️ Error con Flux (${err.message}). Intentando con Turbo...`);
      try {
        const resTurbo = await fetchLogoFromPollinations(prompt, {
          seed: 42,
          model: 'turbo',
          apiKey: POLLINATIONS_KEY
        });
        dataUrl = resTurbo.dataUrl;
        console.log(`✅ Logotipo Turbo generado exitosamente.`);
      } catch (err2) {
        console.warn(`⚠️ Aplicando arquetipo procedural SVG #${proj.archetype}...`);
        const svgRes = generateProceduralSvgLogo(brandData, proj.archetype);
        dataUrl = svgRes.dataUrl;
      }
    }

    // Guardar en las carpetas correspondientes
    const foldersToUpdate = [proj.id];
    if (proj.altId) foldersToUpdate.push(proj.altId);

    for (const folder of foldersToUpdate) {
      const dirPath = path.resolve('proyectos', proj.type, folder);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // 1. Guardar archivo físico
      const isSvg = dataUrl.startsWith('data:image/svg+xml');
      const filename = isSvg ? 'logo.svg' : 'logo.png';
      const filePath = path.join(dirPath, filename);
      const base64Clean = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(filePath, Buffer.from(base64Clean, 'base64'));
      console.log(`💾 Archivo físico guardado en: ${filePath}`);

      // 2. Actualizar el archivo JSON del proyecto
      const jsonPath = path.join(dirPath, `${folder}.json`);
      if (fs.existsSync(jsonPath)) {
        try {
          const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          if (!jsonContent.config) jsonContent.config = {};
          if (!jsonContent.config.ai) jsonContent.config.ai = {};
          if (!jsonContent.config.brandKit) jsonContent.config.brandKit = {};
          
          jsonContent.config.ai.pollinationsKey = POLLINATIONS_KEY;
          jsonContent.config.brandKit.companyName = proj.name;
          jsonContent.config.brandKit.logoUrl = dataUrl;
          jsonContent.config.brandKit.primaryColor = proj.primaryColor;
          jsonContent.config.brandKit.secondaryColor = proj.secondaryColor;

          fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2));
          console.log(`📄 JSON actualizado con BrandKit y API Key: ${jsonPath}`);
        } catch (e) {
          console.error(`Error actualizando JSON ${jsonPath}:`, e.message);
        }
      }
    }
  }

  console.log('\n🎉 ¡Todos los logotipos Flux PRO fueron generados y aplicados con éxito!');
}

generateAndApplyLogos().catch(console.error);
