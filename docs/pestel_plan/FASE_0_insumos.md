# FASE 0 — Preparación de insumos (Local / OBP)

## Objetivo
Concentrar en un solo archivo los datos de la empresa y las fuentes legales/económicas ya recolectadas en el repositorio OBP, para alimentar las fases 1–4.

## Contexto base
- Empresa: **VCV Cortes Finos SA de CV** — carnicería de cortes finos, Hermosillo, Sonora, México. Microempresa del sector cárnico premium (venta al público y a restaurantes). Horizonte de análisis: **2027–2028**.
- Datos internos disponibles en: `vcv/`, `Carnes/`, y en los proyectos guardados de OBP (capacidad, precios, nómina, estructura de costos calibrados en commits de octubre 2026).
- Fuentes RAG disponibles en: `Leyes/`, `leyes_md/`, `mercado.md`, `finanzas_ext.md`, `produccion.md`.
- La actividad exige fuentes publicadas en los **últimos 24 meses** (octubre 2024 – octubre 2026).

## Instrucciones (pasos)
1. Extraer de `vcv/` y `Carnes/`: actividad económica exacta, mercado atendido (B2C premium / restaurantes/hoteles), ubicación, antigüedad, capacidad instalada (kg/mes), rango de precios de productos clave. Redactar el perfil en 5 líneas máximo.
2. Recorrer `Leyes/` y `leyes_md/` y listar todo documento con fecha de publicación o vigencia ≤ 24 meses. Para cada uno anotar: tema (laboral, fiscal, sanitario, económico), fuente emisora (DOF, INEGI, Banxico, SIAP, SENASICA…), año, y a qué dimensión PESTEL apunta (P/E/S/T/E/L).
3. Añadir de `mercado.md` y `produccion.md`: datos de mercado cárnico mexicano (consumo per cápita, precios, competencia) con su fuente.
4. Generar una lista de **15–18 factores candidatos** distribuidos en las 6 dimensiones (2–3 por dimensión), cada uno con: dimensión, enunciado de una línea, fuente con año, y marca O (oportunidad) / A (amenaza).
5. Si un factor es plausible pero no tiene fuente verificable dentro del repo, marcarlo `FUENTE-PENDIENTE` (no eliminarlo; la Fase 1 decide).

## Entregable
Archivo `insumos_vcv.md` con tres secciones: (1) Perfil de la empresa, (2) Inventario de fuentes con fecha, (3) Tabla de factores candidatos.

## Criterio de aceptación (goal completado cuando…)
- [ ] Perfil de empresa ≤ 6 líneas con actividad, mercado, ubicación y horizonte.
- [ ] ≥ 15 factores candidatos, todas las dimensiones P/E/S/T/E/L con ≥ 2 candidatos.
- [ ] Cada factor tiene fuente o marca FUENTE-PENDIENTE.
- [ ] ≥ 8 factores con fuente verificada dentro de los 24 meses (mínimo para cubrir los 12 finales).
