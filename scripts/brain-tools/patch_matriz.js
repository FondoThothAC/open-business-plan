import fs from 'fs';

const mdPath = '/Users/robertoeduardocelisrobles/.gemini/antigravity-ide/brain/ff826763-aada-4db4-9b15-69c269d162a1/matriz_modulos.md';
const newTablePath = 'output_matriz.md';

let mdContent = fs.readFileSync(mdPath, 'utf8');
const newTable = fs.readFileSync(newTablePath, 'utf8');

const regex = /## Desglose Exacto 1 a 1 de Módulos[\s\S]*?(?=---)/;
mdContent = mdContent.replace(regex, newTable + '\n\n');

fs.writeFileSync(mdPath, mdContent);
console.log('Patched!');
