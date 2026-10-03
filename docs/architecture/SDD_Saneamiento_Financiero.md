# SDD — Saneamiento Financiero: Ficha de Drivers, Fuentes Cruzadas y Plan de Reajuste

**Estado:** aprobado · **Versión:** 1.0 · **Fecha:** 2026-10-03

## 1. Problema
El flujo financiero inventaba datos (fallback de "galletas", tope de CAPEX en \$1,000,000, ventas por defecto de \$50,000) cuando faltaban entradas, produciendo VPN de millones y flujos negativos en proyectos pequeños e ignorando la Semilla y el RAG.

## 2. Decisiones de diseño
| # | Decisión |
|---|---|
| D1 | Cero cifras inventadas. Las estimaciones provienen de fuentes reales y se listan en el anexo de fuentes. |
| D2 | Una estimación externa exige ≥ 2 fuentes que coincidan (±30%). Si no, queda `Pendiente de dato`. |
| D3 | La calculadora consume únicamente la **Ficha de Drivers Financieros**. Un driver estimado requiere aprobación; uno aportado por el emprendedor se acepta como `user_provided`. |
| D4 | Resultados honestos: sin topes cosméticos de TIR/ROI/payback. Semáforo de viabilidad. |
| D5 | **Plan de Reajuste**: valores mínimos de precio, volumen y costo fijo para alcanzar la meta (meses configurables). |
| D6 | Casos de oro: CCI, VCV, Closets Corona, Galletas, Cibercafé FAPPA + 2 sintéticos. |

## 3. Modelo de dominio (DDD)
- **FichaDrivers**: `{ version, estado: 'pendiente'|'aprobada', drivers, aprobadaEn }`.
- **Driver**: `{ valor, unidad, fuentes[], procedencia, confianza, estado }`.
- **Fuente**: `{ tipo, nombre, url, fecha, valor }`.
- Procedencia reutiliza `FIELD_PROVENANCE` de `planContracts.js`.
- Lógica en `src/lib/finanzas/` desacoplada de React.

## 4. Módulos
| Archivo | Responsabilidad |
|---|---|
| `driversSchema.js` | Esquema, constantes y validación de la Ficha. |
| `crossValidation.js` | Normalización mensual/anual y cruce de ≥ 2 fuentes (±30%). |
| `driversExtractor.js` | Construye la Ficha desde Semilla/Organización/RAG sin inventar. |
| `calculadoraFinanciera.js` | Motor único: consume la Ficha; devuelve `No calculable` si falta algo. |
| `reajusteSolver.js` | Bisección sobre el VPN para precio/volumen/costo fijo mínimos. |

## 5. Escenarios BDD
- **Dado** un proyecto sin ingresos capturados **Cuando** se generan las finanzas **Entonces** el resultado es `No calculable` y lista los drivers faltantes (nunca galletas).
- **Dado** una Semilla con inversión de \$20,000,000 **Cuando** se calcula **Entonces** el CAPEX es \$20,000,000 (sin tope).
- **Dado** una estimación con una sola fuente **Cuando** se cruza **Entonces** queda `pendiente`.
- **Dado** dos fuentes con diferencia ≤ 30% **Cuando** se cruza **Entonces** el valor es la mediana y la confianza `media/alta`.
- **Dado** un negocio con VPN negativo **Cuando** se calcula **Entonces** se reporta el VPN real y el Plan de Reajuste muestra el precio mínimo que lo lleva a VPN ≈ 0.
- **Dado** que el flujo nunca recupera la inversión **Cuando** se calcula el payback **Entonces** dice `No recuperable en el horizonte`, no un número absurdo.

## 6. Criterios ATDD
1. Ningún texto de "galletas" aparece en proyectos distintos al de galletas.
2. CAPEX resultante = CAPEX de la Ficha (sin recortes).
3. TIR/ROI no se recortan artificialmente.
4. Al reinyectar los valores del Plan de Reajuste, VPN ≈ 0 (tolerancia 1%).
5. Los 5 casos de oro pasan sus pruebas.

## 7. SLI / SLO / SLA
| SLI | SLO | SLA (compromiso al usuario) |
|---|---|---|
| Cifras con ≥ 2 fuentes o aprobación manual | 100% | Ninguna cifra sin procedencia en el documento |
| Datos de otro proyecto en una salida | 0 | Aislamiento por proyecto |
| Diferencia VPN entre motores | < 0.5% | Un solo motor |
| Tiempo de cálculo por corrida | < 500 ms | Respuesta fluida |
| Tests de casos de oro | 100% verde | Sin regresiones |

## 8. Riesgos
- Sin Tavily/INEGI muchas Fichas quedarán `pendiente` (comportamiento correcto).
- Proyectos guardados con cifras contaminadas: auditoría de solo lectura (`scripts/auditFinancialContamination.js`).

## 9. Metodologías aplicadas
TDD (tests antes del código), BDD (§5), ATDD (§6), DDD (§3), MDD (esquema único), IDD (contratos de funciones puras), ADD (motor único), EDD (progreso de investigación por eventos), UXDD (semáforo y estados claros), SLI/SLO/SLA (§7).
