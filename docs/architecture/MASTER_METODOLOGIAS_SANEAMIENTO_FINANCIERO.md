# 📘 Marco Integral de Desarrollo (SDD, TDD, ATDD, DDD, FDD, EDD, XP, RAD, DevOps, UXDD, BDD, SLI, SLO, SLA)
## Saneamiento y Calibración Financiera — Open Business Plan v2.5

**Proyecto:** Open Business Plan (Fondo Thoth AC)  
**Módulo:** Motor Financiero, Ficha de Drivers y Plan de Reajuste  
**Versión:** 2.5.0  
**Fecha:** 2026-10-03  
**Estado:** En Implementación Activa  

---

## 1. 📐 SDD (Software Design Document)

### 1.1. Arquitectura General del Flujo Financiero
El sistema desacopla la captura y enriquecimiento de datos del motor matemático puro.
1. **Entrada de Datos:** `Semilla` + Documentos adjuntos (`project_evidence` RAG) + `INDUSTRY_BENCHMARKS` + Búsqueda Web/APIs (Tavily, INEGI).
2. **Capa Intermedia (Normalización):** `Ficha de Drivers Financieros` estructurada. Cero fallbacks sintéticos inventados.
3. **Capa de Validación:** Cruce de $\ge 2$ fuentes independientes con dispersión $\le 30\%$ o aprobación explícita del usuario (`user_provided`).
4. **Motor Matemático:** Motor determinista pro-forma a 5 años (WACC, VPN, TIR, Payback, CBR, Break-Even, Estados Financieros).
5. **Capa de Resiliencia / Diagnóstico:** Semáforo de Viabilidad + `Plan de Reajuste` (solver de bisección para precios/volumen de equilibrio).
6. **Capa de Auditoría y Salida:** Anexo de Fuentes y Procedencia de Datos al final del informe ejecutivo.

---

## 2. 🧪 TDD (Test-Driven Development)

### 2.1. Estrategia de Pruebas
1. Primero se escriben las suites de prueba en `tests/` con casos en rojo (*Red*).
2. Se implementan los módulos de dominio y cálculo hasta que pasen en verde (*Green*).
3. Se refactoriza para eliminar redundancias y fallbacks obsoletos (*Refactor*).

### 2.2. Suites TDD Planificadas
- `tests/driversSchemaAndExtraction.test.js`: Validación de la Ficha de Drivers, detección de giros y extracción sin contaminación.
- `tests/crossValidationAndResearch.test.js`: Cruce de $\ge 2$ fuentes, rango $\pm 30\%$, manejo de `Pendiente de dato`.
- `tests/triProjectFinancialSanity.test.js`: Certificación de los casos de oro (CCI, VCV, Closets Corona, Galletas, Cibercafé, Sintéticos).
- `tests/reajusteSolver.test.js`: Verificación de que el solver de reajuste converge a $VPN \ge 0$ y payback dentro de la meta en meses.

---

## 3. 🎯 ATDD (Acceptance Test-Driven Development)

### Criterios de Aceptación para Despliegue
- **AC-1 (Aislamiento de Proyecto):** Ningún plan de negocio que no sea de galletas debe contener referencias a "galletas", "horno de convección" o insumos de repostería.
- **AC-2 (Integridad del CAPEX):** Proyectos industriales (CCI de \$20M, VCV de \$4M) deben proyectar su CAPEX íntegro sin topes ciegos de \$1,000,000.
- **AC-3 (Honestidad de Rentabilidad):** Si un negocio genera flujos deficitarios crónicos, el sistema no maquilla la TIR ni muestra paybacks absurdos como `80,000 años`; debe reportar `No recuperable en el horizonte evaluado` y activar el Plan de Reajuste.
- **AC-4 (Trazabilidad Total):** El 100% de las cifras en estados financieros debe rastrearse a un driver de la Ficha con su fuente verificada o declaración de aportación del emprendedor.

---

## 4. 🏛️ DDD (Domain-Driven Design)

### 4.1. Lenguaje Ubicuo (Ubiquitous Language)
- **Ficha de Drivers Financieros:** Entidad agregada central que contiene todos los supuestos económicos verificados.
- **Driver Financiero:** Objeto de valor que representa una variable operativa (`precio`, `volumen_mensual`, `costo_variable_unitario`, `costos_fijos_mensuales`, `capex_total`, etc.).
- **Fuente de Procedencia:** Registro inmutable del origen de un dato (URL, nombre de entidad, fecha, extracto).
- **Plan de Reajuste:** Servicio del dominio que calcula la frontera de eficiencia y viabilidad mínima.
- **Átomo de 3 Áreas (Empresas Cuánticas):** Finanzas, Operativo, Administrativo.

### 4.2. Modelo de Entidades y Objetos de Valor
```typescript
interface DriverFinanciero {
  clave: string;
  nombre: string;
  valor: number;
  unidad: 'MXN' | 'MXN/mes' | 'MXN/año' | 'unidades/mes' | 'porcentaje';
  procedencia: 'user_provided' | 'verified_source' | 'calculated' | 'approved_estimate' | 'not_found';
  confianza: 'alta' | 'media' | 'baja' | 'pendiente';
  fuentes: FuenteProcedencia[];
  estado: 'aprobado' | 'pendiente' | 'estimado';
}
```

---

## 5. 🚀 FDD (Feature-Driven Development)

### Lista de Funcionalidades Principales
1. **F1:** Generador y validador de Ficha de Drivers (`driversSchema.js`).
2. **F2:** Extractor semántico desde Semilla y Evidencia RAG (`driversExtractor.js`).
3. **F3:** Motor de cruce estadístico de fuentes múltiples (`crossValidation.js`).
4. **F4:** Calculadora Financiera Unificada de Proyección Pro-Forma (`calculadoraFinanciera.js`).
5. **F5:** Solver de Bisección para Plan de Reajuste y Metas en Meses (`reajusteSolver.js`).
6. **F6:** Interfaz de Aprobación de Ficha y Semáforo de Viabilidad en Frontend.
7. **F7:** Exportador de Anexo de Fuentes y Trazabilidad en Markdown y Word.

---

## 6. ⚡ EDD (Event-Driven Development)

### Flujo de Eventos
- Evento `FINANCIAL_DRIVERS_REQUESTED`: La UI solicita los drivers necesarios para el giro.
- Evento `RESEARCH_PROGRESS_STEP`: El motor de investigación emite logs asíncronos de búsqueda y cruce en DENUE/Tavily.
- Evento `FINANCIAL_DRIVERS_READY`: Se presenta la Ficha consolidada al usuario.
- Evento `FINANCIAL_DRIVERS_APPROVED`: El usuario confirma los valores; se desbloquea el cálculo.
- Evento `FINANCIAL_PROJECTION_CALCULATED`: Se emiten los estados financieros consolidados y el semáforo.

---

## 7. 🥋 XP (Extreme Programming)

- **Diseño Simple (Simple Design):** Eliminar ramas muertas, código duplicado entre `tool_financial_engine` y `calculadoraFinanciera`.
- **Refactorización Continua:** Sustituir regex frágiles multilínea por deserialización estricta de la Ficha.
- **Integración Continua:** Ejecución de suite de pruebas automáticas en cada commit local.
- **Pruebas Automatizadas Unitarias y de Regresión:** Cobertura de casos extremos (microempresas sin inventario, proyectos de capital intensivo).

---

## 8. 🔄 RAD (Rapid Application Development)

- Desarrollo iterativo mediante prototipado rápido y validación directa con los proyectos reales del usuario (`CCI`, `VCV`, `Closets y Cocinas Corona`, `Galletas`, `Cibercafé`).
- Ciclo de feedback interactivo con el usuario para ajustar tolerancias y mensajes de negocio.

---

## 9. 🛠️ DevOps (Development & Operations)

- **Compilación de Validación:** `npm run build` ejecutado localmente previo a cualquier confirmación.
- **Pruebas Automatizadas:** `npm test` verificando los 353+ tests existentes sin regresión.
- **Sincronización Git Proactiva:** Ejecución de `./git_sync.sh` con commits descriptivos en español tras validar build.
- **Telemetría y Registro:** Registro de llamadas y auditoría de aislamiento de proyectos en `reports/`.

---

## 10. 🎨 UXDD (UX-Driven Development)

- **Semáforo de Viabilidad Visual:** Indicador claro (Verde: Viable, Amarillo: Ajuste requerido, Rojo: Inviable con parámetros actuales).
- **Explicación sin Jerga Abrupta:** Diagnóstico comprensible de por qué un proyecto tiene déficit (ej. "Los costos fijos de \$35,000 superan tus ventas estimadas de \$21,600").
- **Herramienta Interactiva de Reajuste:** Deslizadores o metas en meses que muestran en tiempo real cuánto debe vender o cobrar el emprendedor para equilibrar la empresa.

---

## 11. 📋 BDD (Behavior-Driven Development)

### Escenario 1: Proyecto sin datos capturados no inventa galletas
- **Dado** que un usuario crea un proyecto nuevo ("Carpintería Residencial") sin registrar cotizaciones ni ventas.
- **Cuando** se solicita la generación del módulo financiero.
- **Entonces** el sistema devuelve estado `No calculable: faltan drivers esenciales (inversión, ingresos, costos fijos)`.
- **Y** no inyecta productos de repostería ni números inventados.

### Escenario 2: Proyecto industrial de $20M respeta su escala
- **Dado** el proyecto "Comercio Cuántico Internacional" con inversión declarada de \$20,000,000 MXN.
- **Cuando** corre la proyección financiera pro-forma.
- **Entonces** el CAPEX inicial registrado en el Balance General es exactamente \$20,000,000 MXN sin recortes a \$1,000,000.
- **Y** la TIR estimada se sitúa en el rango del 15% conforme al modelo de MaaS.

### Escenario 3: Proyecto con déficit activa Plan de Reajuste
- **Dado** un negocio con costos fijos mayores que su margen de contribución.
- **Cuando** el VPN proyectado resulta negativo.
- **Entonces** el semáforo se marca en rojo.
- **Y** el módulo Plan de Reajuste calcula el precio y volumen requeridos para recuperar la inversión en el horizonte meta.

---

## 12. 📊 SLI, SLO y SLA

### 12.1. SLI (Service Level Indicators)
- $SLI_1$: Porcentaje de variables financieras con $\ge 2$ fuentes verificadas o aprobación manual explícita.
- $SLI_2$: Tasa de aislamiento de proyectos (incidencias de datos cruzados entre proyectos).
- $SLI_3$: Tiempo de cálculo de la corrida pro-forma completa a 5 años.
- $SLI_4$: Tasa de éxito de pruebas de casos de oro (CCI, VCV, Closets, Galletas, Cibercafé).

### 12.2. SLO (Service Level Objectives)
- $SLO_1$: $\ge 99.5\%$ de los supuestos financieros trazables a fuentes o entrada del usuario.
- $SLO_2$: $0\%$ de contaminación cruzada (cero galletas en proyectos no alimentarios).
- $SLO_3$: Latencia de cálculo $< 350\text{ ms}$ por iteración.
- $SLO_4$: $100\%$ de los casos de oro pasando las pruebas unitarias.

### 12.3. SLA (Service Level Agreements)
- **Compromiso de Integridad:** Ningún plan de negocios emitido por Open Business Plan contendrá cifras de inversión o ventas fabricadas sin advertencia explícita y consentimiento del usuario.
- **Compromiso de Exactitud:** Las proyecciones matemáticas mantendrán cuadre contable exacto entre Estado de Resultados, Balance General y Flujo de Efectivo en todos los escenarios.
