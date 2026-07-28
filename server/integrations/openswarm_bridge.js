/**
 * Bridge de Integración con OpenSwarm (VRSEN)
 * 
 * Se conecta con la API local de OpenSwarm (http://localhost:8080) para ejecutar
 * la Fase 2 de formateo editorial premium (PDF, DOCX, Pitch Decks PPTX) a partir
 * del contenido compilado por nuestro Swarm Engine.
 */

import fetch from 'node-fetch';

export class OpenSwarmBridge {
  constructor(endpoint = 'http://localhost:8080') {
    this.endpoint = endpoint;
  }

  /**
   * Verifica si el servidor local de OpenSwarm está activo en localhost:8080
   * @returns {Promise<boolean>}
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.endpoint}/health`, { method: 'GET', timeout: 2000 });
      return response.ok;
    } catch (_) {
      return false;
    }
  }

  /**
   * Envía el documento crudo a OpenSwarm para su formateo y compilación bonita.
   * @param {Object} projectDoc - Documento JSON compilado por nuestro Swarm
   * @param {string} formatType - 'pdf' | 'docx' | 'slides'
   * @returns {Promise<Object>} Resultado con URLs o buffers del documento formateado
   */
  async formatDocument(projectDoc, formatType = 'pdf') {
    const isOnline = await this.checkHealth();

    if (!isOnline) {
      console.warn("OpenSwarm API no está activa en localhost:8080. Se utilizará el motor de exportación integrado.");
      return {
        success: false,
        source: 'internal_fallback',
        message: 'OpenSwarm no detectado localmente. Usando motor interno de renderizado.',
        docContent: projectDoc
      };
    }

    try {
      const response = await fetch(`${this.endpoint}/api/format`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc: projectDoc,
          targetFormat: formatType,
          template: 'investor_pitch_deck'
        })
      });

      if (!response.ok) {
        throw new Error(`OpenSwarm API respondió con estatus: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        source: 'openswarm',
        formattedUrl: result.url || result.filePath,
        data: result
      };
    } catch (error) {
      console.error("Error al comunicarse con OpenSwarm:", error);
      return {
        success: false,
        source: 'internal_fallback',
        error: error.message,
        docContent: projectDoc
      };
    }
  }
}

export const openswarmBridge = new OpenSwarmBridge();
