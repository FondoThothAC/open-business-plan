import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import TurndownService from 'turndown';

// Carpetas de origen y destino
const SOURCE_DIR = path.resolve('../PLAN MICROFINA');
const DEST_DIR = path.resolve('./ejemplos_historicos');

if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-'
});

async function convertFile(filePath, fileName) {
  try {
    const ext = path.extname(fileName).toLowerCase();
    
    if (ext === '.docx') {
      console.log(`Convirtiendo: ${fileName}...`);
      
      // 1. DOCX to HTML
      const result = await mammoth.convertToHtml({ path: filePath });
      const html = result.value;
      
      // 2. HTML to Markdown
      const markdown = turndownService.turndown(html);
      
      // 3. Save
      const newFileName = fileName.replace('.docx', '.md').replace(/[^a-z0-9.]/gi, '_');
      const outPath = path.join(DEST_DIR, newFileName);
      
      fs.writeFileSync(outPath, markdown);
      console.log(`✅ Guardado como: ${newFileName}`);
    } else {
      console.log(`⚠️ Ignorando ${fileName} (Formato no soportado por este script automático, solo .docx)`);
    }
  } catch (err) {
    console.error(`❌ Error convirtiendo ${fileName}:`, err.message);
  }
}

async function run() {
  console.log("=========================================");
  console.log("Iniciando conversión de DOCX a Markdown...");
  console.log("=========================================\n");

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`La carpeta origen no existe: ${SOURCE_DIR}`);
    return;
  }

  const files = fs.readdirSync(SOURCE_DIR);
  
  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    if (fs.statSync(filePath).isFile()) {
      await convertFile(filePath, file);
    }
  }

  console.log("\n¡Conversión terminada! Los archivos están en ./ejemplos_historicos/");
}

run();
