import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExternalPrompt } from '../src/lib/promptExporter.js';

test('TDD-29: External Prompt Exporter with Semilla, RAG and Verbosity Context', async (t) => {
  const mockPlanData = {
    naturaleza: {
      semilla: {
        nombre_proyecto: 'Galletas de Semillas Saludables',
        industria: 'Alimentos Funcionales',
        ubicacion: 'Hermosillo, Sonora',
        problema: 'Escasez de snacks sin azúcar aptos para diabéticos',
        solucion: 'Línea de galletas artesanales con harina de almendra',
        monto_inversion: 150000
      }
    },
    config: {
      ai: { verbosity: 'conciso' }
    }
  };

  await t.test('debe ensamblar prompt completo para módulo FODA con viñetas cortas', () => {
    const prompt = buildExternalPrompt({
      pillar: 'estrategia',
      moduleKey: 'foda',
      moduleTitle: 'Análisis FODA',
      field: { key: 'fortalezas', label: 'Fortalezas' },
      fieldGuide: {
        instruccion: 'Enumera las capacidades distintivas internas.',
        ejemplo: 'Alianzas con productores locales.',
        benchmark: 'Mínimo 3 factores diferenciadores'
      },
      planData: mockPlanData
    });

    assert.ok(prompt.includes('Galletas de Semillas Saludables'));
    assert.ok(prompt.includes('Hermosillo, Sonora'));
    assert.ok(prompt.includes('Escasez de snacks sin azúcar'));
    assert.ok(prompt.includes('Formato Ultra-Conciso Obligatorio'));
    assert.ok(prompt.includes('3 a 5 viñetas'));
    assert.ok(prompt.includes('oración corta'));
    assert.ok(prompt.includes('PROHIBIDO redactar párrafos extensos'));
  });

  await t.test('debe ensamblar prompt con documentos RAG si están presentes', () => {
    const planWithDocs = {
      ...mockPlanData,
      config: {
        ...mockPlanData.config,
        uploadedDocuments: [
          { name: 'Estudio_Mercado_Sonora.pdf', text: 'El 12% de la población busca alternativas bajas en carbohidratos.' }
        ]
      }
    };

    const prompt = buildExternalPrompt({
      pillar: 'mercado',
      moduleKey: 'canvas',
      moduleTitle: 'Business Model Canvas',
      field: { key: 'propuesta_valor', label: 'Propuesta de Valor' },
      fieldGuide: { instruccion: 'Describe la propuesta de valor.' },
      planData: planWithDocs
    });

    assert.ok(prompt.includes('Estudio_Mercado_Sonora.pdf'));
    assert.ok(prompt.includes('12% de la población'));
    assert.ok(prompt.includes('Formato Ultra-Conciso Obligatorio'));
  });
});
