import test from 'node:test';
import assert from 'node:assert';
import { parseDocumentFile, cleanExtractedText } from '../src/lib/documentParser.js';

test('DocumentParser - Conversión y extracción multiformato (TDD)', async (t) => {
  await t.test('Debe limpiar y normalizar texto extraído eliminando saltos excesivos y espacios', () => {
    const raw = '   # Resumen Ejecutivo \n\n\n\n  Contenido del plan de negocios...   \r\n\r\n';
    const cleaned = cleanExtractedText(raw);
    assert.strictEqual(cleaned.includes('\n\n\n\n'), false);
    assert.strictEqual(cleaned.startsWith('# Resumen Ejecutivo'), true);
  });

  await t.test('Debe procesar archivos de texto plano (.txt, .md, .csv)', async () => {
    const mockFile = {
      name: 'plan_financiero.md',
      type: 'text/markdown',
      size: 150
    };
    const content = '# Plan Financiero\n- VAN: $120,000\n- TIR: 35%';
    const result = await parseDocumentFile(mockFile, {
      readAsText: async () => content
    });

    assert.strictEqual(result.name, 'plan_financiero.md');
    assert.strictEqual(result.format, 'markdown');
    assert.strictEqual(result.text.includes('VAN: $120,000'), true);
  });

  await t.test('Debe convertir DOCX a Markdown preservando títulos y estructura', async () => {
    const mockFile = {
      name: 'plan_negocio_v1.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 2048
    };
    const mockArrayBuffer = new ArrayBuffer(8);
    const result = await parseDocumentFile(mockFile, {
      readAsArrayBuffer: async () => mockArrayBuffer,
      mammothExtractor: async (_buffer) => {
        return { value: '<h1>Modelo de Negocio</h1><p>Venta de suscripciones SaaS B2B.</p>' };
      }
    });

    assert.strictEqual(result.name, 'plan_negocio_v1.docx');
    assert.strictEqual(result.format, 'docx');
    assert.strictEqual(result.text.includes('# Modelo de Negocio'), true);
    assert.strictEqual(result.text.includes('Venta de suscripciones SaaS B2B.'), true);
  });

  await t.test('Debe procesar imágenes (.png, .jpg) con OCR y generar Markdown estructurado', async () => {
    const mockFile = {
      name: 'esquema_servilleta.png',
      type: 'image/png',
      size: 4096
    };
    const result = await parseDocumentFile(mockFile, {
      ocrExtractor: async () => 'Presupuesto Inicial: $50,000 USD\nRetorno estimado: 18 meses'
    });

    assert.strictEqual(result.name, 'esquema_servilleta.png');
    assert.strictEqual(result.format, 'image');
    assert.strictEqual(result.text.includes('### Texto Extraído de Imagen (OCR): esquema_servilleta.png'), true);
    assert.strictEqual(result.text.includes('Presupuesto Inicial: $50,000 USD'), true);
  });

  await t.test('Debe procesar audios (.mp3, .m4a, .wav) con transcripción Whisper y generar Markdown', async () => {
    const mockFile = {
      name: 'entrevista_socio.mp3',
      type: 'audio/mpeg',
      size: 8192
    };
    const result = await parseDocumentFile(mockFile, {
      audioTranscriber: async () => 'El cliente busca una solución rápida para automatizar sus cobros mensuales.'
    });

    assert.strictEqual(result.name, 'entrevista_socio.mp3');
    assert.strictEqual(result.format, 'audio');
    assert.strictEqual(result.text.includes('### Transcripción de Audio: entrevista_socio.mp3'), true);
    assert.strictEqual(result.text.includes('automatizar sus cobros mensuales'), true);
  });
});
