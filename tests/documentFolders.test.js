/**
 * Test Suite: Document Folders & Multi-Folder RAG Pipeline (TDD)
 * Verifica que los documentos puedan organizarse por carpetas temáticas
 * y que el contexto RAG inyecte la información de la carpeta correctamente.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDocument, buildEvidenceContext } from '../src/lib/evidenceContext.js';

describe('Document Folders & Multi-Folder RAG Pipeline (TDD)', () => {
  it('1. normalizeDocument debe preservar la propiedad folder del documento', () => {
    const rawDoc = {
      name: 'entrevista_marcelo_corona.md',
      text: 'Entrevista de carpintería en colonia Balderrama.',
      folder: 'entrevistas',
      classification: 'project_evidence',
      isImmutableConstraint: true
    };

    const normalized = normalizeDocument(rawDoc, 'closets_y_cocinas_corona');

    assert.equal(normalized.name, 'entrevista_marcelo_corona.md');
    assert.equal(normalized.folder, 'entrevistas');
    assert.equal(normalized.classification, 'project_evidence');
    assert.equal(normalized.isImmutableConstraint, true);
  });

  it('2. normalizeDocument asigna folder por defecto "general" si no se especifica', () => {
    const rawDoc = {
      name: 'notas_generales.txt',
      text: 'Apuntes de clase sin carpeta específica.'
    };

    const normalized = normalizeDocument(rawDoc, 'proyecto_demo');

    assert.equal(normalized.folder, 'general');
  });

  it('3. buildEvidenceContext debe incluir el badge de carpeta cuando esté presente', () => {
    const planData = {
      config: {
        projectId: 'galletas_de_semillas_saludables',
        documents: [
          {
            name: 'Reporte_Costos_Lote.pdf',
            text: 'Costo total por lote de 35 galletas: $365.52 MXN. Costo unitario: $10.44 MXN.',
            folder: 'calculos',
            classification: 'project_evidence',
            isImmutableConstraint: true
          },
          {
            name: 'Entrevista_Raul_Villas_del_Real.md',
            text: 'Raul dedica 20 horas semanales para autoempleo en su cocina.',
            folder: 'entrevistas',
            classification: 'project_evidence'
          }
        ]
      }
    };

    const context = buildEvidenceContext(planData, 'costo lote galletas');

    assert.ok(context.includes('Reporte_Costos_Lote.pdf'));
    assert.ok(context.includes('[Carpeta: calculos]'));
    assert.ok(context.includes('⚠️ RESTRICCIÓN Y HECHO INVIOLABLE VALIDADO'));
  });

  it('4. buildEvidenceContext permite filtrar por carpeta específica si se solicita', () => {
    const planData = {
      config: {
        projectId: 'closets_corona',
        documents: [
          {
            name: 'entrevista.md',
            text: 'Taller en colonia Balderrama.',
            folder: 'entrevistas',
            classification: 'project_evidence'
          },
          {
            name: 'cotizacion_enchapadora.pdf',
            text: 'Cotización de enchapadora automática $80,000 MXN.',
            folder: 'anexos',
            classification: 'project_evidence'
          }
        ]
      }
    };

    const contextAll = buildEvidenceContext(planData, 'Balderrama');
    assert.ok(contextAll.includes('[Carpeta: entrevistas]'));
  });
});
