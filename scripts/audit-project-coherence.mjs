import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('proyectos/negocios');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(root, '.archive', `coherence-backup-${stamp}`);
const reportDir = path.resolve('reports');
fs.mkdirSync(backupDir, { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.json')) files.push(full);
  }
}
walk(root);

const signatures = {
  vcv: /vcv|cortes\s+finos|asadhor|5[,.]?184|31[,.]13|4[,.]?000[,.]?000/i,
  comercio: /comercio\s+cu[aá]ntico|mhi|mantenimiento\s+hidr[aá]ulico|minero|15[,.]11|20[,.]?000[,.]?000/i,
  generic: /proyecto\s+nuevo|proyecto[_ -]?\d+/i
};
const report = { generatedAt: new Date().toISOString(), backupDir, scanned: 0, repaired: [], conflicts: [], files: [] };

for (const file of files) {
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
  report.scanned++;
  const text = JSON.stringify(data);
  const identity = `${data?.config?.projectId || ''} ${data?.config?.projectSlug || ''} ${data?.name || ''} ${data?.semilla?.nombre_proyecto || ''} ${data?.semilla?.negocio?.nombre || ''}`;
  const detected = Object.entries(signatures).filter(([, re]) => re.test(text)).map(([name]) => name);
  const identityDetected = Object.entries(signatures).filter(([, re]) => re.test(identity)).map(([name]) => name);
  const conflicts = detected.filter(kind => identityDetected.length && !identityDetected.includes(kind));
  const rel = path.relative(root, file);
  const item = { file: rel, projectId: data?.config?.projectId || null, detected, identityDetected, conflicts };
  report.files.push(item);
  if (conflicts.length) {
    const backupFile = path.join(backupDir, rel);
    fs.mkdirSync(path.dirname(backupFile), { recursive: true });
    fs.copyFileSync(file, backupFile);
    report.conflicts.push({ ...item, reason: 'Firmas de otro proyecto; no se inventaron datos ni se sobrescribió el contenido.' });
  }
}

const jsonPath = path.join(reportDir, `coherence-audit-${stamp}.json`);
const mdPath = path.join(reportDir, `coherence-audit-${stamp}.md`);
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
fs.writeFileSync(mdPath, `# Auditoría de coherencia\n\n- Fecha: ${report.generatedAt}\n- Proyectos inspeccionados: ${report.scanned}\n- Respaldos: ${backupDir}\n- Conflictos que requieren revisión: ${report.conflicts.length}\n\n${report.conflicts.map(c => `- ${c.file}: ${c.conflicts.join(', ')} — ${c.reason}`).join('\n') || 'No se detectaron conflictos.'}\n`);
console.log(JSON.stringify({ scanned: report.scanned, conflicts: report.conflicts.length, backupDir, jsonPath, mdPath }));
