import fs from 'fs';
import path from 'path';

const source = path.resolve(process.env.OBP_PROJECTS_DIR || 'proyectos');
const outputDir = path.resolve(process.env.OBP_BACKUP_DIR || 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const target = path.join(outputDir, `projects-${timestamp}`);

if (!fs.existsSync(source)) {
  console.error(`No existe el directorio de proyectos: ${source}`);
  process.exitCode = 1;
} else {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.cpSync(source, target, { recursive: true, errorOnExist: true });
  console.log(JSON.stringify({ source, target, createdAt: new Date().toISOString() }));
}
