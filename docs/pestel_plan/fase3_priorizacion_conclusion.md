# FASE 3 — Priorización, decisiones y conclusión

Insumo: `fase2_matriz_pestel.md` (cifras tomadas sin recalcular).

## 1. Orden completo por impacto (trazabilidad)

| Orden | # | Dimensión | Factor | Impacto | O/A | Clasificación |
|---|---|---|---|---|---|---|
| 1 | 11 | Legal | Jornada máxima de 46 h en 2027 y 44 h en 2028 (DOF 01-may-2026) | 2.76 | A | alto |
| 2 | 3 | Económica | Res de $139 a $167/kg y carne +16.5 % en enero-2026 | 2.64 | A | alto |
| 3 | 9 | Ecológica | Presas de Sonora al 13.2 %; Abelardo L. Rodríguez vacía | 2.25 | A | medio |
| 4 | 10 | Ecológica | Gusano barrenador: 14,321 casos y 1.2 millones de cabezas varadas | 2.13 | A | medio |
| 5 | 2 | Política | Extorsión récord en 1S-2026 (6,562 denuncias) y seguro de transporte | 2.10 | A | medio |
| 6 | 5 | Social | Consumo de carne en 85.3 kg per cápita, 6º mundial | 2.00 | O | medio |
| 7 | 6 | Social | Hermosillo: 962,020 habitantes, edad mediana 30→32 años | 1.70 | O | medio |
| 8 | 4 | Económica | Inflación 3.69 % y peso en ~17.2 ¢/USD | 1.63 | O | medio |
| 9 | 7 | Tecnológica | E-commerce de 941 mil mdp (+19.2 %) con despensa en línea | 1.50 | O | medio |
| 10 | 8 | Tecnológica | CoDi/SPEI sin comisiones, $135,000 sin alta (dic-2026) | 1.13 | O | bajo |
| 11 | 1 | Política | Revisión conjunta del T-MEC (1-jul-2026) | 0.90 | O | bajo |
| 12 | 12 | Legal | NOM-051 Fase III desde el 1-ene-2026 | 0.83 | A | bajo |

Sin empates en el corte de los tres primeros lugares, por lo que no se aplicó el desempate por cercanía del horizonte.

## 2. Top-3 y decisión concreta

| N.º | Factor | Impacto | Decisión propuesta (qué / cómo / cuándo) |
|---|---|---|---|
| 1 | Jornada de 46 horas semanales en 2027 (reforma LFT, DOF 01-may-2026) | 2.76 (alto, A) | **Qué:** reprogramar la planta del ASADHOR para producir los 5,184 kg/mes dentro del nuevo tope legal. **Cómo:** sustituir los actuales turnos que suman 48 h por cuatro jornadas de 8 h de lunes a viernes más un medio turno de 6 h el sábado (46 h exactas), incorporar un operario de medio tiempo ($11,000/mes) en lugar de pagar horas extra, y firmar el anexo de horario y el nuevo contrato colectivo-individual antes de que la obligación sea exigible. **Cuándo:** pilotos de calendario en el cuarto trimestre de 2026 y operación plena a partir del 1-febrero-2027. |
| 2 | Alza del precio de la res: de $139 a $167/kg y +16.5 % en enero-2026 | 2.64 (alto, A) | **Qué:** blindar el costo del insumo que representa ~75 % del producto y pasar a precios indexados. **Cómo:** acuerdo de precio fijo trimestral con Núñez Carnes por 3,000 kg/mes con tope de variación de 8 %, homologar a Premium Carnes como segunda fuente con 1,500 kg/mes, y cambiar la lista anual de precios por una tarifa semestral atada al precio medio nacional de COMECARNE (revisión en enero y julio) con 60 % de anticipo para clientes de restaurantes. **Cuándo:** negociar y firmar entre noviembre y diciembre de 2026, para que la primera tarifa indexada entre en vigor el 1-enero-2027. |
| 3 | Estrés hídrico de Sonora: presas al 13.2 % y presa de Hermosillo vacía | 2.25 (medio, A) | **Qué:** quitarle al clima sonorense el control exclusivo del abasto y de la mezcla de producto. **Cómo:** calificar a un segundo origen de canales fuera de la cuenca del Yaqui (Sinaloa o Chihuahua) por 800 kg/mes y mover 25 % de la mezcla desde el corte ancla Rib-Eye hacia la línea económica (diezmillo y asado de paleta) en paquetes familiares de 400 g, para sostener volumen cuando el ganado en pie se encarezca por sequía. **Cuándo:** decidir la compra del segundo origen antes del 30-junio-2027 y relanzar la línea económica en el tercer trimestre de 2027. |

Las tres decisiones son ejecutables con la estructura real de la empresa (un solo ASADHOR, 5–7 puestos y dos proveedores identificados en el plan de negocios) y no implican abrir sucursales ni endeudamiento mayor.

## 3. Conclusión

El entorno 2027-2028 es desfavorable para VCV Cortes Finos, con ventanas de oportunidad reales. De los doce factores, seis son amenazas y seis oportunidades, pero el peso se concentra en las amenazas: los dos únicos impactos altos, la jornada de 46 horas desde 2027 (2.76) y el encarecimiento de la res de 139 a 167 pesos por kilo (2.64), junto con los medios de sequía (2.25), gusano barrenador (2.13) y extorsión (2.10), suman 12.71 puntos frente a 8.86 de las oportunidades, ninguna de las cuales supera 2.00. La presión recae de forma simultánea sobre el costo, que es 75 por ciento del producto, sobre la capacidad de 5,184 kilos mensuales y sobre la logística de frío. La implicación estratégica principal es que VCV no debe crecer por volumen: necesita proteger margen y asegurar suministro antes de escalar el canal digital.

**Conteo de palabras: 140** (medido con `python3`, separadores por espacio).

## 4. Reglas de control verificadas

- [x] Top-3 obtenido por orden descendente de la matriz de la Fase 2, sin alterar impactos (verificado con `Decimal` a dos decimales: 2.76 · 2.64 · 2.25).
- [x] Decisiones sin verbos de monitoreo pasivo: todas contienen acción, mecanismo y fecha.
- [x] Escala coherente con microempresa: medio turno sabatino, un operario de medio tiempo, dos proveedores existentes, 800 kg/mes adicionales.
- [x] Conclusión ≤ 150 palabras (140) con conteo explícito.
- [x] Veredicto consistente con el balance numérico: 6 amenazas concentran 12.71 de 21.57 puntos (59 %) y los dos únicos "altos" son amenazas, por lo que se concluye "desfavorable con ventanas de oportunidad" y no "favorable".
