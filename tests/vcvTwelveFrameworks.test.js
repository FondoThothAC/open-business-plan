import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { FRAMEWORKS } from '../src/config/frameworks.js';

describe('VCV Cortes Finos SA de CV - Consolidación 12 Metodologías', () => {
  const jsonPath = path.resolve('proyectos/negocios/vcv_cortes_finos_sa_de_cv/vcv_cortes_finos_sa_de_cv.json');
  const mdPath = path.resolve('proyectos/negocios/vcv_cortes_finos_sa_de_cv/vcv_cortes_finos_sa_de_cv.md');

  it('debe existir el archivo JSON canónico de VCV y el Markdown maestro', () => {
    assert.ok(fs.existsSync(jsonPath), 'El archivo JSON de VCV debe existir');
    assert.ok(fs.existsSync(mdPath), 'El archivo MD maestro de VCV debe existir');
  });

  it('debe tener poblados los campos para todas las 12 metodologías canónicas', () => {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const project = JSON.parse(raw);

    assert.equal(project.companyName, 'VCV Cortes Finos, S.A. de C.V.');
    assert.equal(project.config.activeMethodologies.length, 12);

    for (const [fwId, fwConfig] of Object.entries(FRAMEWORKS)) {
      if (!fwConfig.pillars) continue;
      for (const pillar of fwConfig.pillars) {
        assert.ok(project[pillar.key], `Pilar ${pillar.key} debe existir en el proyecto`);
        for (const mod of pillar.modules) {
          assert.ok(project[pillar.key][mod.key], `Módulo ${pillar.key}.${mod.key} debe existir`);
          for (const field of mod.fields) {
            const val = project[pillar.key][mod.key][field];
            assert.ok(val && val.length > 5, `El campo ${pillar.key}.${mod.key}.${field} debe contener información sustantiva`);
          }
        }
      }
    }
  });

  it('debe contener los datos financieros exactos de VCV Cortes Finos', () => {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const project = JSON.parse(raw);

    const inversionStr = project.organizacion?.inversion?.inversion_fija || '';
    assert.ok(inversionStr.includes('4,000,000') || inversionStr.includes('3,438,240'), 'Debe incluir capital de trabajo de $4,000,000 o costos mensuales');

    const resultadosStr = project.organizacion?.estados_financieros?.resultados || '';
    assert.ok(resultadosStr.includes('4,992,192'), 'Debe reflejar ventas mensuales de $4,992,192 MXN');
    assert.ok(resultadosStr.includes('45.24%'), 'Debe reflejar margen bruto de 45.24%');

    const operacionStr = project.tecnico?.operacion?.proceso || '';
    assert.ok(operacionStr.includes('ASADHOR'), 'Debe referenciar el equipo ASADHOR');
    assert.ok(operacionStr.includes('-20°C') || operacionStr.includes('pasteuriz'), 'Debe referenciar pasteurización a -20°C');
  });
});
