# Software Design Document (SDD) - Open Plan React v7.0

## 1. Introducción
Open Plan React es una evolución moderna del Arquitecto de Negocios, enfocada en la rapidez (Vite) y la modularidad de componentes React. Permite la creación ágil de Lean Canvas, Pitch Decks y Planes de Negocio completos.

## 2. Arquitectura del Sistema
- **Framework**: React 18+ con Vite para el bundling.
- **Enrutamiento**: React Router DOM v6.
- **Estado Global**: React Context API (`PlanContext`).
- **Diseño**: Sistema de diseño basado en CSS puro con variables dinámicas para temas (Light/Dark).
- **Integración IA**: Preparado para conexión con OpenClaw Gateway (BoB Agent).

## 3. Estructura de Datos
El proyecto utiliza un objeto central `planData` que se persiste localmente y se sincroniza con el backend:
- `naturaleza`: Introducción, Identidad, Objetivos, FODA, PESTEL.
- `mercado`: Análisis, Segmentación, Competencia, Comercialización.
- `tecnico`: Ubicación, Operación, Recursos.
- `organizacion`: Staff, Estructura, Inversión, Rentabilidad.

## 4. Componentes de UI
- **Layout**: Sidebar persistente con navegación dinámica.
- **DynamicModule**: Renderizador dinámico de secciones basado en el ID de la ruta.
- **Preview System**: Motor de renderizado optimizado para visualización y exportación.

---
*Generado automáticamente siguiendo la regla de inicio de proyecto v1.0*
