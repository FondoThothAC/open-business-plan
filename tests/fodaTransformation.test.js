/**
 * @file fodaTransformation.test.js
 * @description Suite de pruebas TDD para el motor de parseo, serialización,
 * detección de fronteras PESTEL y ley de conversión a fortalezas del módulo FODA.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseFodaText,
  serializeFodaItems,
  detectLegalInFoda,
  transformToFortaleza,
  PESTEL_LEGAL_TERMS
} from '../src/lib/fodaParser.js';

describe('TDD: Motor FODA Dinámico y Desacoplamiento PESTEL (fodaParser)', () => {
  describe('Parseo y Serialización de Cuadrantes FODA', () => {
    it('parseFodaText descompone texto en viñetas Markdown en elementos individuales limpios', () => {
      const textoMarkdown = `- Equipo con certificación AMIB y experiencia financiera
- Plataforma digital propia con arquitectura web modular
* Alianzas comerciales exclusivas con 3 distribuidores mayoristas`;

      const items = parseFodaText(textoMarkdown, 'fortalezas');
      assert.equal(Array.isArray(items), true);
      assert.equal(items.length, 3);
      assert.equal(items[0].text, 'Equipo con certificación AMIB y experiencia financiera');
      assert.equal(items[1].text, 'Plataforma digital propia con arquitectura web modular');
      assert.equal(items[2].text, 'Alianzas comerciales exclusivas con 3 distribuidores mayoristas');
      assert.equal(items[0].category, 'fortalezas');
    });

    it('parseFodaText tolera texto sin viñetas (saltos de línea simples o párrafos)', () => {
      const textoPlano = `Marca nueva sin presencia en Sonora
Falta de capital de trabajo para inventario inicial
Solo 2 operadores en taller`;

      const items = parseFodaText(textoPlano, 'debilidades');
      assert.equal(items.length, 3);
      assert.equal(items[0].text, 'Marca nueva sin presencia en Sonora');
      assert.equal(items[1].text, 'Falta de capital de trabajo para inventario inicial');
    });

    it('serializeFodaItems reconstruye formato Markdown canónico sin pérdida de contenido', () => {
      const items = [
        { text: 'Equipo técnico calificado' },
        { text: 'Patente de proceso registrada' }
      ];

      const serialized = serializeFodaItems(items);
      assert.equal(
        serialized,
        '- Equipo técnico calificado\n- Patente de proceso registrada'
      );
    });

    it('round-trip: parsear y luego serializar produce texto idéntico y estable', () => {
      const input = '- Capacidad de congelación rápida\n- Red de frío certificada TIF';
      const items = parseFodaText(input, 'fortalezas');
      const output = serializeFodaItems(items);
      assert.equal(output, input);
    });
  });

  describe('Detección Pedagógica de Contaminación PESTEL (Marco Legal)', () => {
    it('identifica normativas, reformas fiscales y leyes gubernamentales como factores de PESTEL Legal', () => {
      const textoConLeyes = 'Reforma fiscal 2026 de la LISR y nueva normativa NOM-035 obligatoria';
      const analisis = detectLegalInFoda(textoConLeyes);

      assert.equal(analisis.isLegal, true);
      assert.ok(analisis.matchedTerm.length > 0);
      assert.ok(analisis.advice.includes('PESTEL'));
    });

    it('no genera falsos positivos con términos operativos legítimos de negocio', () => {
      const textoOperativo = 'Alta eficiencia en cocina y contratos de suministro con ganaderos de Sonora';
      const analisis = detectLegalInFoda(textoOperativo);

      assert.equal(analisis.isLegal, false);
      assert.equal(analisis.matchedTerm, null);
    });

    it('detecta menciones a COFEPRIS, SAT, LFT y permisos sanitarios gubernamentales', () => {
      const casos = [
        'Inspección sanitaria y trámites ante COFEPRIS para empaque cárnico',
        'Cambios regulatorios en la LFT respecto a jornadas laborales',
        'Retenciones obligatorias del SAT que impactan liquidez'
      ];

      for (const caso of casos) {
        const resultado = detectLegalInFoda(caso);
        assert.equal(resultado.isLegal, true, `Debe detectar patrón legal en: "${caso}"`);
      }
    });
  });

  describe('Ley de Conversión a Fortalezas (Estrategia TOWS / Quantum Delegation)', () => {
    it('transformToFortaleza convierte una Debilidad en Fortaleza mediante plan de superación/delegación', () => {
      const debilidad = {
        text: 'El fundador carece de experiencia contable y control de costos'
      };
      const planSuperacion = 'Contratación de un CFO externo y adopción de ERP en la nube';

      const nuevaFortaleza = transformToFortaleza(debilidad, 'debilidades', planSuperacion);
      assert.ok(nuevaFortaleza.includes('Fortaleza construida'));
      assert.ok(nuevaFortaleza.includes(planSuperacion));
      assert.ok(nuevaFortaleza.includes('experiencia contable'));
    });

    it('transformToFortaleza convierte una Oportunidad en Fortaleza mediante adquisición de capacidad instalada', () => {
      const oportunidad = {
        text: 'Creciente demanda de cortes empacados al vacío en Hermosillo'
      };
      const capacidadAdquirida = 'Inversión en cámara de sellado al vacío industrial y certificación de inocuidad';

      const nuevaFortaleza = transformToFortaleza(oportunidad, 'oportunidades', capacidadAdquirida);
      assert.ok(nuevaFortaleza.includes('Capacidad instalada'));
      assert.ok(nuevaFortaleza.includes(capacidadAdquirida));
    });

    it('transformToFortaleza convierte una Amenaza en Fortaleza mediante estrategia de blindaje resiliente', () => {
      const amenaza = {
        text: 'Incremento sostenido del precio del alimento para ganado por sequía'
      };
      const blindaje = 'Contratos a futuros con cobertura de granos y ensilaje forrajero propio';

      const nuevaFortaleza = transformToFortaleza(amenaza, 'amenazas', blindaje);
      assert.ok(nuevaFortaleza.includes('Blindaje operativo'));
      assert.ok(nuevaFortaleza.includes(blindaje));
    });
  });
});
