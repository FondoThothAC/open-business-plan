# Diagrama de Flujo: Embudo de Industrialización (12 Metodologías)

Este diagrama ilustra cómo el sistema transforma la idea pura del usuario (Vaciado de cerebro) en la **Semilla Universal**, y cómo esta a su vez es utilizada por el motor de IA para autocompletar e "industrializar" los campos específicos de cualquiera de los 12 métodos estratégicos disponibles.

```mermaid
graph TD
    %% Estilos de los nodos
    classDef userAction fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    classDef aiProcess fill:#fdf4ff,stroke:#c026d6,stroke-width:2px;
    classDef dataState fill:#f0fdf4,stroke:#16a34a,stroke-width:2px;
    classDef frameworks fill:#ffedd5,stroke:#ea580c,stroke-width:2px;

    %% Paso 0: Vaciado
    A[Vaciado de Cerebro<br/>Audio / Texto]:::userAction --> B

    %% Extracción
    B{Mesa de Expertos<br/>Procesamiento NLP}:::aiProcess --> C

    %% Semilla Universal
    C[(Semilla Universal<br/>JSON Estructurado)]:::dataState
    
    %% Revisión de Semilla
    C --> D[Usuario Revisa la Semilla]:::userAction
    D -- "Dudas por campo" --> E((Asistente IA<br/>Contextual)):::aiProcess
    E -. "Respuestas claras" .-> D
    D -- "Confirmar" --> F

    %% Motor de Industrialización
    F{Motor de Industrialización<br/>Selección de Framework}:::aiProcess

    %% Los 12 métodos
    F --> G1[1. Business Plan Clásico]:::frameworks
    F --> G2[2. Lean Canvas]:::frameworks
    F --> G3[3. Business Model Canvas]:::frameworks
    F --> G4[4. Pitch Deck Y Combinator]:::frameworks
    F --> G5[5. Design Thinking]:::frameworks
    F --> G6[6. Disciplined Entrepreneurship]:::frameworks
    F --> G7[7. Scaling Up]:::frameworks
    F --> G8[8. OKRs]:::frameworks
    F --> G9[9. Blue Ocean Strategy]:::frameworks
    F --> G10[10. Teoría de Restricciones]:::frameworks
    F --> G11[11. Cuadro de Mando Integral]:::frameworks
    F --> G12[12. Social BID]:::frameworks

    %% Conexión de guías a la industrialización
    H[(Librería de Prompts<br/>FIELD_GUIDES_MAP)]:::dataState -. "Provee reglas técnicas" .-> F

    %% Refinamiento Final
    G1 & G2 & G3 & G4 & G5 & G6 & G7 & G8 & G9 & G10 & G11 & G12 --> I[Módulos Llenos]:::dataState
    
    I --> J[Usuario Revisa Resultados]:::userAction
    J -- "Refactorizar Campo" --> K((IA Redactora<br/>Contextual)):::aiProcess
    K -. "Texto Corregido" .-> J
```

### Explicación del Flujo paso a paso:

1. **Vaciado de Cerebro (Entrada):** El flujo siempre arranca desde el `Anteproyecto.jsx` donde el usuario narra de forma desestructurada su idea.
2. **Procesamiento NLP (IA):** El agente extrae los 6 pilares de la idea y forma la `Semilla Universal`.
3. **Revisión Asistida:** El usuario confirma la semilla, pidiendo ayuda a un sub-agente IA por campo si no entiende un concepto.
4. **Motor de Industrialización:** Cuando el usuario decide iniciar la generación, el motor toma:
   - Los datos de la **Semilla Universal** (De qué trata el negocio).
   - Las reglas técnicas de la **Metodología Seleccionada** (Desde `FIELD_GUIDES_MAP`).
5. **Generación Específica (Los 12 Métodos):** La Mesa de Expertos (formada por el Analista, Crítico y Redactor) usa esos dos insumos para redactar todos los campos del método seleccionado utilizando la jerga correcta (ej. "early adopters" para Lean Canvas, "actividades clave" para Business Model Canvas, etc.).
6. **Revisión y Refactorización Final:** El usuario entra al módulo renderizado y revisa el texto extenso. Si algo no le gusta, usa el botón "Re-escribir con instrucciones" y el texto se actualiza de forma automática.
