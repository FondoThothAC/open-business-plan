import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import {
  findProjectContamination,
  isVcvProject,
  sanitizeProjectContamination
} from '../src/lib/projectIsolation.js';

describe('Aislamiento de proyectos y saneamiento VCV', () => {
  const contaminatedPlan = {
    config: { projectId: 'proyecto_ajeno', brandKit: { companyName: 'Taller Norte' } },
    resumen_ejecutivo: {
      conclusion: 'La planta TIF requiere 16.8M MXN y un horno ASADHOR.',
      competidores_multinivel: [{ nombre: 'VCV Cortes Finos', actividad: 'Cortes cárnicos' }]
    },
    mercado: { analisis: { producto: 'Refacciones industriales' } }
  };

  it('detecta contenido VCV sin modificar el proyecto', () => {
    const before = JSON.stringify(contaminatedPlan);
    const findings = findProjectContamination(contaminatedPlan);

    assert.ok(findings.length >= 2);
    assert.equal(JSON.stringify(contaminatedPlan), before);
    assert.ok(findings.some((finding) => finding.path.includes('conclusion')));
  });

  it('el saneamiento remueve solo campos contaminados de proyectos ajenos', () => {
    const cleaned = sanitizeProjectContamination(contaminatedPlan);

    assert.equal(cleaned.resumen_ejecutivo.conclusion, '');
    assert.deepEqual(cleaned.resumen_ejecutivo.competidores_multinivel, []);
    assert.equal(cleaned.mercado.analisis.producto, 'Refacciones industriales');
  });

  it('preserva datos VCV legítimos', () => {
    const vcvPlan = {
      ...contaminatedPlan,
      config: { projectId: 'vcv_cortes_finos_sa_de_cv', brandKit: { companyName: 'VCV Cortes Finos' } }
    };

    assert.equal(isVcvProject(vcvPlan), true);
    assert.deepEqual(sanitizeProjectContamination(vcvPlan), vcvPlan);
  });

  it('la Vista Previa ofrece saneamiento confirmado y no inyecta el resumen VCV', () => {
    const preview = fs.readFileSync(path.resolve('src/modules/VistaPrevia.jsx'), 'utf8');
    const executiveSummary = fs.readFileSync(path.resolve('src/components/ExecutiveSummarySection.jsx'), 'utf8');

    assert.ok(preview.includes('Revisar mezcla de datos'));
    assert.ok(preview.includes('sanitizeCurrentProject'));
    assert.ok(executiveSummary.includes('Todavía no hay datos ejecutivos'));
    assert.ok(!executiveSummary.includes("'VCV Cortes Finos'"));
    assert.ok(!executiveSummary.includes('$16,800,000 MXN'));
  });

  it('descarta respuestas de carga obsoletas al cambiar de proyecto', () => {
    const context = fs.readFileSync(path.resolve('src/context/PlanContext.jsx'), 'utf8');

    assert.ok(context.includes('projectLoadRef'));
    assert.ok(context.includes('requestId !== projectLoadRef.current'));
    assert.ok(context.includes('generationSessionRef'));
    assert.ok(context.includes('generationSession === generationSessionRef.current'));
  });
});
