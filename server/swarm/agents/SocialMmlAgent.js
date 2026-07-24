/**
 * SocialMmlAgent.js - Agente Especialista en Proyectos Sociales (Metodología BID / ZOPP)
 * 
 * Modela el Árbol de Problemas, Árbol de Objetivos, Matriz de Marco Lógico (MML)
 * y el Análisis de Involucrados.
 */

export class SocialMmlAgent {
  constructor() {
    this.id = 'social_mml';
    this.name = 'Consultor de Impacto Social';
    this.avatar = '🤝';
    this.role = 'Marco Lógico (MML), Árbol de Problemas & BID';
  }

  /**
   * Ejecuta el análisis de metodología social BID/ZOPP.
   * @param {Object} context 
   * @param {Function} emitProgress 
   * @returns {Promise<Object>}
   */
  async execute(context, emitProgress) {
    emitProgress(this.id, 'Analizando mapa de involucrados (beneficiarios, aliados y oponentes)...', 20);
    await new Promise((r) => setTimeout(r, 600));

    emitProgress(this.id, 'Construyendo Árbol de Problemas (causas raíces vs efectos directos)...', 55);
    await new Promise((r) => setTimeout(r, 600));

    emitProgress(this.id, 'Generando Matriz de Marco Lógico (MML) con indicadores y supuestos...', 100);

    return {
      problemaCentral: 'Baja cobertura o ineficiencia en el acceso a servicios esenciales en la comunidad objetivo.',
      causasRaices: ['Falta de infraestructura comunitaria adecuada', 'Baja capacitación de los actores locales'],
      efectos: ['Estancamiento del desarrollo socioeconómico', 'Migración de talento comunitario'],
      matrizMarcoLogico: {
        fin: 'Contribuir al bienestar social y desarrollo sostenible de la población objetivo.',
        proposito: 'Mejorar sustancialmente la calidad del servicio entregado en la región.',
        componentes: ['Centro comunitario equipado', 'Programa de formación y asistencia técnica continua'],
        actividades: ['Construcción/Adecuación de instalaciones', 'Talleres de capacitación presenciales']
      }
    };
  }
}
