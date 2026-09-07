import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

describe('Resumen Ejecutivo, Dictamen de Viabilidad Real y Conexión INEGI DENUE', () => {
  const jsonPath = path.resolve('proyectos/negocios/vcv_cortes_finos_sa_de_cv/vcv_cortes_finos_sa_de_cv.json');

  it('el proyecto debe contener el bloque de resumen ejecutivo estructurado', () => {
    assert.ok(fs.existsSync(jsonPath), 'El archivo JSON de VCV debe existir');
    const project = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    assert.ok(project.resumen_ejecutivo, 'Debe existir la propiedad resumen_ejecutivo en el proyecto');
    assert.ok(project.resumen_ejecutivo.elevator_pitch, 'Debe incluir elevator pitch');
    assert.ok(project.resumen_ejecutivo.dictamen_viabilidad, 'Debe incluir dictamen de viabilidad');
    assert.ok(project.resumen_ejecutivo.desglose_fases_inversion, 'Debe incluir desglose en dos fases');
    assert.ok(project.resumen_ejecutivo.permisos_regulatorios, 'Debe incluir matriz de permisos');
    assert.ok(Array.isArray(project.resumen_ejecutivo.muestra_competencia_inegi), 'Debe incluir muestra de competidores INEGI');
  });

  it('el dictamen de viabilidad debe ser honesto con la brecha de exportación (2 Fases)', () => {
    const project = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const dictamen = project.resumen_ejecutivo.dictamen_viabilidad;

    assert.equal(dictamen.veredicto, 'VIABLE CONDICIONADO A ESTRATEGIA EN DOS FASES');
    assert.equal(dictamen.fase1.viable, true);
    assert.ok(dictamen.fase1.monto_requerido <= 4000000, 'Fase 1 debe ajustarse al capital semilla de $4,000,000 MXN');
    assert.equal(dictamen.fase2.viable_con_capital_semilla, false, 'Fase 2 de exportación NO es viable únicamente con $4M MXN');
    assert.equal(dictamen.fase2.monto_requerido_serie_a, 16800000, 'Fase 2 requiere Serie A calibrada exactamente a $16,800,000 MXN para planta TIF');
  });

  it('debe incluir competidores reales con folio y coordenadas de INEGI DENUE en Hermosillo', () => {
    const project = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const competidores = project.resumen_ejecutivo.muestra_competencia_inegi;

    assert.ok(competidores.length >= 5, 'Debe incluir al menos 5 competidores reales de INEGI');
    const primerComp = competidores[0];
    assert.ok(primerComp.id_denue, 'Debe contener ID oficial de DENUE');
    assert.ok(primerComp.nombre, 'Debe contener nombre comercial');
    assert.ok(primerComp.actividad_scian, 'Debe contener clase de actividad SCIAN');
    assert.ok(primerComp.direccion.includes('Hermosillo') || primerComp.municipio.includes('Hermosillo'), 'Debe estar ubicado en Hermosillo');
  });
});
