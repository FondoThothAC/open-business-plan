import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/** Persistencia ligera de trabajos. Se puede migrar a SQLite sin cambiar las rutas HTTP. */
export class GenerationJobStore {
  constructor(filePath = path.resolve(process.env.OBP_DATA_DIR || 'server/data', 'generation_jobs.json')) {
    this.filePath = filePath;
    this.jobs = this.read();
  }

  read() {
    try { return JSON.parse(fs.readFileSync(this.filePath, 'utf8')); } catch { return {}; }
  }

  persist() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const temporary = `${this.filePath}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(this.jobs, null, 2));
    fs.renameSync(temporary, this.filePath);
  }

  create({ projectId, ownerId = 'local-admin', items = [], baseRevision = 0 }) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const job = { id, projectId, ownerId, baseRevision, status: 'queued', createdAt: now, updatedAt: now, items: items.map((item) => ({ ...item, status: 'queued', attempts: 0 })), events: [{ at: now, type: 'queued' }] };
    this.jobs[id] = job;
    this.persist();
    return job;
  }

  get(id) { return this.jobs[id] || null; }

  update(id, patch) {
    const job = this.get(id);
    if (!job) return null;
    Object.assign(job, patch, { updatedAt: new Date().toISOString() });
    job.events.push({ at: job.updatedAt, type: patch.status || 'updated' });
    this.persist();
    return job;
  }

  list(projectId) { return Object.values(this.jobs).filter((job) => !projectId || job.projectId === projectId); }
}
