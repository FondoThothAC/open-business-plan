import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { GenerationJobStore } from '../server/generationJobStore.js';

test('los trabajos de generación sobreviven una nueva instancia del servidor', () => {
  const file = path.resolve('tests', 'scratch_generation_jobs.json');
  try {
    const first = new GenerationJobStore(file);
    const job = first.create({ projectId: 'project-a', items: [{ pillar: 'mercado', module: 'analisis' }] });
    first.update(job.id, { status: 'paused' });
    const second = new GenerationJobStore(file);
    assert.equal(second.get(job.id).status, 'paused');
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
});
