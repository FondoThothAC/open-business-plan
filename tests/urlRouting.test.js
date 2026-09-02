import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  slugify,
  FRAMEWORK_SLUG_MAP,
  REVERSE_FRAMEWORK_SLUG_MAP,
  KNOWN_PROJECT_SLUGS,
  resolvePillarFromModule,
  buildSemanticUrl
} from '../src/config/urlRouting.js';

describe('URL Routing & Semantic URLs - Test Suite (TDD)', () => {
  it('slugify debe convertir cadenas con acentos y caracteres especiales en slugs seguros', () => {
    assert.equal(
      slugify('Comercio Cuántico Internacional TR SAPI de CV'),
      'comercio-cuantico-internacional-tr-sapi-de-cv'
    );
    assert.equal(
      slugify('Brújula Financiera MX'),
      'brujula-financiera-mx'
    );
    assert.equal(
      slugify('   ¡Hola Mundo 2026!  '),
      'hola-mundo-2026'
    );
    assert.equal(slugify(''), 'proyecto');
    assert.equal(slugify(null), 'proyecto');
  });

  it('debe mapear bidireccionalmente frameworks y slugs de URL', () => {
    assert.equal(FRAMEWORK_SLUG_MAP['plan-negocios'], 'business');
    assert.equal(FRAMEWORK_SLUG_MAP['proyecto-inversion'], 'investment_project');
    assert.equal(FRAMEWORK_SLUG_MAP['lean-startup'], 'agile_startup');
    assert.equal(FRAMEWORK_SLUG_MAP['social-bid'], 'social_bid');

    assert.equal(REVERSE_FRAMEWORK_SLUG_MAP['business'], 'plan-negocios');
    assert.equal(REVERSE_FRAMEWORK_SLUG_MAP['investment_project'], 'proyecto-inversion');
    assert.equal(REVERSE_FRAMEWORK_SLUG_MAP['agile_startup'], 'lean-startup');
    assert.equal(REVERSE_FRAMEWORK_SLUG_MAP['social_bid'], 'social-bid');
  });

  it('KNOWN_PROJECT_SLUGS debe resolver alias de proyectos demo clave', () => {
    assert.equal(KNOWN_PROJECT_SLUGS['comercio-cuantico'], 'hidraulica_minera');
    assert.equal(KNOWN_PROJECT_SLUGS['brujula'], 'brujula');
    assert.equal(KNOWN_PROJECT_SLUGS['ferreteria'], 'ferreteria');
  });

  it('resolvePillarFromModule debe inferir correctamente el pilar a partir del marco y módulo', () => {
    // investment_project / demanda -> mercado_cuantitativo
    const pillarInv = resolvePillarFromModule('investment_project', 'demanda');
    assert.equal(pillarInv, 'mercado_cuantitativo');

    // business / analisis -> mercado
    const pillarBiz = resolvePillarFromModule('business', 'analisis');
    assert.equal(pillarBiz, 'mercado');

    // Mapeo usando slug de URL
    const pillarBySlug = resolvePillarFromModule('proyecto-inversion', 'oferta');
    assert.equal(pillarBySlug, 'mercado_cuantitativo');
  });

  it('buildSemanticUrl debe generar URLs semánticas con el formato canónico Opción A', () => {
    // Módulo específico
    const urlModulo = buildSemanticUrl({
      projectType: 'investment_project',
      moduleId: 'demanda',
      slug: 'comercio-cuantico'
    });
    assert.equal(urlModulo, '/proyecto-inversion/demanda/comercio-cuantico');

    // Sección global (semilla)
    const urlSemilla = buildSemanticUrl({
      projectType: 'business',
      section: 'semilla',
      slug: 'brujula-financiera-mx'
    });
    assert.equal(urlSemilla, '/plan-negocios/semilla/brujula-financiera-mx');

    // Vista previa
    const urlPreview = buildSemanticUrl({
      projectType: 'investment_project',
      section: 'vista-previa',
      slug: 'comercio-cuantico'
    });
    assert.equal(urlPreview, '/proyecto-inversion/vista-previa/comercio-cuantico');
  });
});
