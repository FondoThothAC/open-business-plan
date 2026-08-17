import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  buildLogoPrompt,
  generateProceduralSvgLogo,
  buildPollinationsUrl,
  LOGO_STYLES
} from '../../src/lib/logoGenerator.js';

describe('AI Logo Generator - TDD Test Suite', () => {
  it('should define supported logo styles', () => {
    assert.ok(LOGO_STYLES.flat_vector, 'flat_vector style must be defined');
    assert.ok(LOGO_STYLES.mascot_icon, 'mascot_icon style must be defined');
    assert.ok(LOGO_STYLES.emblem, 'emblem style must be defined');
    assert.ok(LOGO_STYLES.modern_3d, 'modern_3d style must be defined');
  });

  it('should generate an optimized prompt for flat_vector style', () => {
    const brandData = {
      companyName: 'Abarrotes La Esquinita',
      giro: 'Tienda de abarrotes y autoservicio',
      isotipoDesc: 'Casita esquinada con carrito de mandado sonriente',
      primaryColor: '#f59e0b',
      secondaryColor: '#10b981'
    };

    const prompt = buildLogoPrompt(brandData, 'flat_vector');
    assert.ok(typeof prompt === 'string', 'Prompt must be a string');
    assert.ok(prompt.includes('flat vector'), 'Prompt should include style flat vector');
    assert.ok(prompt.includes('white background'), 'Prompt must enforce clean white background');
    assert.ok(prompt.includes('no text') || prompt.includes('no typography'), 'Prompt must exclude bad typography');
  });

  it('should generate an optimized prompt for mascot_icon style', () => {
    const brandData = {
      companyName: 'Veterinaria Patitas de Amor',
      giro: 'Servicios de salud animal y veterinaria',
      isotipoDesc: 'Huella de perro con un corazón tierno',
      primaryColor: '#4f46e5',
      secondaryColor: '#ec4899'
    };

    const prompt = buildLogoPrompt(brandData, 'mascot_icon');
    assert.ok(prompt.includes('mascot') || prompt.includes('icon'), 'Prompt should focus on mascot/icon');
    assert.ok(prompt.includes('white background'), 'Prompt should enforce white background');
  });

  it('should construct a valid Pollinations.ai URL with parameters', () => {
    const prompt = 'Minimalist vector logo of a wrench and gear, blue accents, white background, no text';
    const seed = 42;
    const url = buildPollinationsUrl(prompt, { seed, width: 512, height: 512, model: 'flux' });

    assert.ok(url.startsWith('https://image.pollinations.ai/prompt/'), 'Must point to Pollinations endpoint');
    assert.ok(url.includes('width=512'), 'Must specify width 512');
    assert.ok(url.includes('height=512'), 'Must specify height 512');
    assert.ok(url.includes('nologo=true'), 'Must request nologo parameter');
    assert.ok(url.includes('seed=42'), 'Must include seed');
    assert.ok(url.includes('model=flux'), 'Must specify flux model');
  });

  it('should generate a valid procedural SVG logo as offline fallback', () => {
    const brandData = {
      companyName: 'MantenPro Servicios',
      giro: 'Mantenimiento preventivo',
      primaryColor: '#2563eb',
      secondaryColor: '#64748b'
    };

    const result = generateProceduralSvgLogo(brandData);
    assert.ok(result.svg.startsWith('<svg'), 'Generated SVG must start with <svg tag');
    assert.ok(result.svg.includes('</svg>'), 'Generated SVG must close with </svg>');
    assert.ok(result.dataUrl.startsWith('data:image/svg+xml;base64,'), 'Result must provide valid base64 dataUrl');
    assert.ok(result.svg.includes('#2563eb') || result.svg.includes('2563eb'), 'SVG should contain the primary brand color');
  });
});
