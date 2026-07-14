import fs from 'fs';
import path from 'path';

const filePath = '/Users/robertoeduardocelisrobles/Documents/FT Apps/open-business-plan-v2.5.12.3/src/modules/Configuracion.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the imports
const targetImport = "import DocumentUploader from '../components/DocumentUploader';";
const replacementImport = "import DocumentUploader from '../components/DocumentUploader';\nimport { FRAMEWORKS } from '../config/frameworks';";

if (content.includes(targetImport)) {
  content = content.replace(targetImport, replacementImport);
} else {
  console.error("Target import not found!");
  process.exit(1);
}

// Replace the select dropdown
const targetSelect = `            <select 
              className="form-control" 
              value={planData.config?.projectType || 'business'}
              onChange={(e) => {
                updateConfig('projectType', null, e.target.value);
              }}
            >
              <option value="business">Plan de Negocios Comercial (Tradicional)</option>
              <option value="social_bid">Proyecto Social (Metodología BID)</option>
              <option value="agile_startup">Agile Startup (Lean MVP)</option>
              <option value="technology_id">Plan de Negocios de Base Tecnológica e Innovación (I+D)</option>
              <option value="micro_business">Plan para Microempresa y Autoempleo (Simplificado)</option>
            </select>`;

const replacementSelect = `            <select 
              className="form-control" 
              value={planData.config?.projectType || 'business'}
              onChange={(e) => {
                updateConfig('projectType', null, e.target.value);
              }}
            >
              {Object.entries(FRAMEWORKS).map(([key, fw]) => (
                <option key={key} value={key}>{fw.name}</option>
              ))}
            </select>`;

// Normalize whitespace for comparison/replacement
const normalize = str => str.replace(/\r\n/g, '\n').trim();

if (normalize(content).includes(normalize(targetSelect))) {
  // Let's replace the actual substring
  content = content.replace(targetSelect, replacementSelect);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully patched Configuracion.jsx with dynamic frameworks selector!");
} else {
  console.error("Target select dropdown not found exactly in file!");
  process.exit(1);
}
