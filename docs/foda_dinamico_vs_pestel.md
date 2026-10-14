# Matriz FODA Dinámica, Ley de Conversión a Fortalezas y Desacoplamiento PESTEL

Este documento establece la especificación metodológica, de diseño y de arquitectura de software para el Análisis FODA y su relación con el Entorno PESTEL en Open Business Plan (OBP), integrando las metodologías de Fondo Thoth AC.

---

## 1. Fundamento Metodológico y Pedagógico

### 1.1 El Error Común: Contaminación Legal en el FODA
En la enseñanza y práctica de la formulación estratégica, un antipatrón recurrente es incluir factores legales, regulatorios, reformas fiscales o normativas gubernamentales dentro de las debilidades o amenazas del FODA.
- **PESTEL (Macroentorno Exógeno):** Es el espacio donde habitan las leyes, normativas, reformas, jurisprudencia y regulaciones. La empresa **no puede cambiar una ley federal**, solo puede monitorearla, adaptarse o cumplirla.
- **FODA (Microentorno y Capacidades Operables):** Es el espacio de las capacidades internas y las relaciones directas con clientes, proveedores y competidores cercanos. Las debilidades deben ser **operativamente corregibles** por el equipo fundador.

### 1.2 La Ley de Conversión a Fortalezas (Fondo Thoth AC)
El FODA no es un inventario estático para archivar en un PDF; es un **motor dinámico de evolución de capacidades**:
1. **Debilidades $\rightarrow$ Fortalezas:** Toda debilidad (ej. falta de control contable, ausencia de manual de ventas) debe superarse mediante capacitación, procesos o **Delegación Cuántica** (contratación de un perfil complementario), convirtiéndose en una fortaleza institucional.
2. **Oportunidades $\rightarrow$ Fortalezas:** Una oportunidad de mercado aprovechada con éxito deja de ser una posibilidad externa y se internaliza como una competencia central (*core competency*) o fortaleza de la empresa.
3. **Amenazas $\rightarrow$ Blindaje / Fortalezas:** Una amenaza externa neutralizada mediante contratos, pólizas, diversificación o redundancia operativa genera un blindaje que fortalece la resiliencia del negocio.

---

## 2. SDD (Software Design Document)

### 2.1 Componentes del Sistema
```
┌────────────────────────────────────────────────────────┐
│                   FodaMatrix.jsx                       │
│  (Tablero interactivo 4 cuadrantes en React 19)        │
└───────────────┬─────────────────────────┬──────────────┘
                │                         │
     onMoveToPestel(factorText)      onChange(field, val)
                │                         │
                ▼                         ▼
┌───────────────────────────────┐ ┌──────────────────────┐
│       ModuleWrapper.jsx       │ │   fodaParser.js      │
│  (Inyección a PESTEL Legal)   │ │  - parseFodaText     │
│  updateSection(pillar,        │ │  - serializeFodaItems│
│    'pestel', 'legal', text)   │ │  - detectLegalInFoda │
└───────────────────────────────┘ │  - transformToFort.. │
                                  └──────────────────────┘
```

### 2.2 Motor de Detección Anti-Contaminación (`fodaParser.js`)
El motor evalúa cada ítem redactado o sugerido en FODA mediante expresiones regulares calibradas contra términos de macroentorno legal:
- Leyes, reformas, decretos, reglamentos, normativas oficiales (NOM, STPS, SAT).
- Aranceles, licitaciones públicas, marco regulatorio, patentes gubernamentales.

Cuando se detecta un término legal, la interfaz despliega un aviso pedagógico inmediato y un botón de un solo clic para transferir el factor directamente al campo `legal` del módulo PESTEL, limpiándolo del FODA.

---

## 3. BDD (Behavior-Driven Development) & Criterios de Aceptación

### Escenario 1: Conversión de Debilidad en Fortaleza
- **Dado:** El usuario tiene registrada la debilidad: *"Falta de control de inventarios en sucursal"*.
- **Cuando:** Presiona el botón *"⚡ Convertir en Fortaleza"*.
- **Entonces:** El sistema genera una acción de transformación: *"Superación de debilidad: Implementación de sistema de gestión y control para resolver 'Falta de control de inventarios en sucursal'"*, la añade a la lista de Fortalezas y elimina la debilidad original.

### Escenario 2: Conversión de Oportunidad en Fortaleza
- **Dado:** El usuario tiene la oportunidad: *"Alta demanda de entregas el mismo día en la zona norte"*.
- **Cuando:** Presiona el botón *"⚡ Convertir en Fortaleza"*.
- **Entonces:** El sistema genera: *"Capacidad consolidada: Explotación exitosa de la oportunidad 'Alta demanda de entregas el mismo día en la zona norte'"*, integrándola al cuadrante de Fortalezas.

### Escenario 3: Transferencia de Factor Legal a PESTEL
- **Dado:** El usuario o una sugerencia introduce en Amenazas: *"Nueva reforma fiscal y aranceles a la importación"*.
- **Cuando:** El sistema detecta el término legal y el usuario hace clic en *"⚖️ Mover a PESTEL (Legal)"*.
- **Entonces:** El factor se retira del FODA y se concatena automáticamente al campo `legal` de `pestel` en `planData`, mostrando confirmación visual.

---

## 4. TDD (Test-Driven Development)
Suite de pruebas implementada en `tests/fodaTransformation.test.js`:
1. `parseFodaText`: Parsea viñetas Markdown con guiones, asteriscos, números y texto plano.
2. `serializeFodaItems`: Genera Markdown canónico limpio (`- ítem`).
3. `detectLegalInFoda`: Identifica con precisión factores legales y descarta falsos positivos cotidianos.
4. `transformToFortaleza`: Aplica la lógica de conversión diferenciada según el cuadrante origen (`debilidades`, `oportunidades`, `amenazas`).
5. Estado inmutable: La conversión respeta la inmutabilidad de los arreglos y objetos originales.

---

## 5. Arquitectura DDD (Domain-Driven Design)
- **Entidades de Dominio:** `FodaFactor` `{ id, text, category, origin, hasLegalWarning }`.
- **Servicio de Dominio:** `FodaDomainService` (`fodaParser.js`) desacoplado completamente de componentes visuales de React.
- **Eventos de Dominio:** `FactorTransformedToFortaleza`, `FactorMovedToPestelLegal`.

---

## 6. SRE: SLI, SLO y SLA
- **SLI (Service Level Indicator):** Latencia de parseo y serialización de factores FODA en cliente (< 5 ms para matrices de hasta 100 factores).
- **SLO (Service Level Objective):** 99.9% de ejecuciones de conversión a fortalezas sin pérdida de datos en el árbol `planData`.
- **SLA (Service Level Agreement):** Cero discrepancia entre el estado visual interactivo y la serialización Markdown guardada en base de datos.
