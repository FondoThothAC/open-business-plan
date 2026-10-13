#!/usr/bin/env node
/**
 * Inyecta la matriz PESTEL calificada de VCV en el proyecto guardado, para que el
 * módulo `naturaleza.pestel` deje de ser prosa sin fuente y muestre factores con
 * IP / T / Ir / p(x) / impacto, semáforo, top-3, conclusión y fuentes APA.
 *
 *   node scripts/injectVcvPestelMatrix.js            → dry-run (no escribe, muestra el diff)
 *   node scripts/injectVcvPestelMatrix.js --write    → respalda y escribe
 *
 * Fuente de verdad: docs/pestel_plan/pestel_vcv_matrix.json
 * Los seis textos legacy se regeneran desde la matriz (una sola fuente de verdad), y
 * cualquier otra clave del objeto pestel (p. ej. indicadores_banxico) se conserva intacta.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveDimensionTexts, validateMatriz, summarize } from '../src/lib/pestelMatrix.js';
import { enriquecerMatriz } from '../src/lib/pestelResearch.js';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARCHIVO_FUENTE = path.join(RAIZ, 'docs/pestel_plan/pestel_vcv_matrix.json');
const ARCHIVO_PROYECTO = path.join(RAIZ, 'proyectos/negocios/vcv_cortes_finos_sa_de_cv/vcv_cortes_finos_sa_de_cv.json');
const CARPETA_VERSIONES = path.join(path.dirname(ARCHIVO_PROYECTO), '.versions');

const escribir = process.argv.includes('--write');
const fuente = JSON.parse(fs.readFileSync(ARCHIVO_FUENTE, 'utf8'));
const proyecto = JSON.parse(fs.readFileSync(ARCHIVO_PROYECTO, 'utf8'));

const problemas = validateMatriz(fuente.matriz, { ventana: fuente.ventana_fuentes });
if (problemas.length) {
  console.error('La matriz de origen no pasa su propia auditoría:');
  for (const p of problemas) console.error(`  - ${p}`);
  process.exit(1);
}

const previo = proyecto.naturaleza?.pestel || {};
// Cada factor sale con el sello de procedencia de la app (provenance/provider/sourceUrl/confianza).
const { matriz: matrizSellada, pendientes } = enriquecerMatriz(fuente.matriz);
if (pendientes.length) {
  console.error(`Hay factores sin URL o sin fecha de publicación (n.º ${pendientes.join(', ')}). Resuélvelos antes de sembrar.`);
  process.exit(1);
}
const textos = deriveDimensionTexts(matrizSellada);
const nuevo = {
  ...previo,
  ...textos,
  matriz: matrizSellada,
  priorizacion: fuente.priorizacion,
  conclusion: fuente.conclusion,
  conclusion_palabras: fuente.conclusion_palabras,
  horizonte: fuente.horizonte,
  formula: fuente.formula,
  umbrales: fuente.umbrales,
  ventanaFuentes: fuente.ventana_fuentes,
  fuentes: fuente.fuentes,
  pestelOrigen: fuente.origen,
  pestelVersion: fuente.version
};

const resumen = summarize(fuente.matriz);
console.log(`Factores: ${resumen.factores} · amenazas ${resumen.amenazas} (${resumen.impactoAmenazas}) · oportunidades ${resumen.oportunidades} (${resumen.impactoOportunidades}) · total ${resumen.total}`);
console.log(`Clasificación: ${resumen.alto ?? resumen.altos} altos · ${resumen.medios} medios · ${resumen.bajos} bajos`);
console.log('\nCambios por campo legacy:');
for (const clave of Object.keys(textos)) {
  const antes = previo[clave] ? `${previo[clave].split('\n').length} líneas` : '(vacío)';
  const despues = `${textos[clave].split('\n').length} líneas`;
  console.log(`  ${clave}: ${antes} → ${despues}${previo[clave] ? ' [SUSTITUIDO]' : ' [NUEVO]'}`);
}
const conservadas = Object.keys(previo).filter((k) => !(k in textos) && !['matriz', 'priorizacion', 'conclusion', 'horizonte', 'formula', 'fuentes'].includes(k));
if (conservadas.length) console.log('\nClaves preexistentes que se conservan:', conservadas.join(', '));

if (!escribir) {
  console.log('\nDRY-RUN: no se escribió nada. Repite con --write para aplicar.');
  process.exit(0);
}

const sello = new Date().toISOString().replace(/[:.]/g, '-');
const respaldo = path.join(CARPETA_VERSIONES, `${sello}-pestel-previo.json`);
fs.mkdirSync(CARPETA_VERSIONES, { recursive: true });
fs.writeFileSync(respaldo, JSON.stringify(previo, null, 2));

proyecto.naturaleza.pestel = nuevo;
proyecto.fechaActualizacion = new Date().toISOString();
fs.writeFileSync(ARCHIVO_PROYECTO, JSON.stringify(proyecto, null, 2));

console.log(`\nEscrito en ${path.relative(RAIZ, ARCHIVO_PROYECTO)}`);
console.log(`Respaldo del pestel previo en ${path.relative(RAIZ, respaldo)}`);
