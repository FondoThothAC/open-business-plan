# Metodología 5: Micronegocio Local y Autoempleo (`micro_business`)

## 1. Identidad del Método
- **Nombre Oficial:** Plan de Apertura Rápida para Micronegocios Locales y Autoempleo Formal.
- **Origen Bibliográfico Principal:**
  - *Starting a Business QuickStart Guide* (Ken Colwell, PhD, MBA - Ch. 3 & 13).
  - *Plan de Negocios VF: Metodología de Microemprendimiento Práctico* (PlanVF, p. 15-45).
  - *Manual de Microempresas y Trámites Municipales de Panamá* (Cap. 9 - Croquis y Distribución Comercial).
- **Propósito:** Ofrecer un esquema ágil, altamente visual y desburocratizado para abrir establecimientos de proximidad (talleres, carnicerías, restaurantes, panaderías, tiendas especializadas, servicios locales) en menos de 30 días, garantizando viabilidad económica y cumplimiento normativo inmediato.
- **Público Objetivo:** Emprendedores de microempresas familiares, personas físicas con actividad empresarial (RESICO en México), autoempleados y pequeños comerciantes locales.

---

## 2. Estructura de Pilares y Módulos
El framework `micro_business` consta de **4 Pilares Simples** y **11 Módulos**:

### Pilar 1: Perfil y Propuesta Local
1. `introduccion`: Descripción breve del negocio, propuesta de valor de proximidad y horario comercial.
2. `identidad`: Nombre comercial, lema de barrio, valores de servicio al cliente y diferenciador frente a cadenas de conveniencia.

### Pilar 2: Clientes y Competencia de Barrio
3. `clientes`: Perfil del vecino consumidor en un radio de 1 a 3 km (hábitos de compra física, frecuencia de visita, ticket promedio).
4. `competencia`: Negocios cercanos competidores (precios de referencia, surtido de productos, debilidades en servicio).
5. `comercializacion`: Promoción de apertura (volanteo local, grupos de WhatsApp comunitarios, Google Maps / Business Profile, fachadas llamativas).

### Pilar 3: Operaciones y Espacio Físico (Croquis 2D)
6. `operacion`: Rutina diaria de apertura, atención al cliente, manejo higiénico y cierre de caja.
7. `recursos`: Equipamiento básico de trabajo (mostrador, básculas, terminal punto de venta, refrigeradores, estantes).
8. `croquis`: Diseñador de croquis 2D y distribución física con inteligencia artificial para maximizar el flujo peatonal y la visibilidad de exhibidores.

### Pilar 4: Finanzas de Bolsillo y Trámites de Apertura
9. `inversion`: Presupuesto de arranque de bajo costo (depósito de renta, pintura y adecuación, inventario inicial, terminal TPV).
10. `costos`: Estimación de costos fijos mensuales (renta, luz comercial, agua, internet, sueldo propio mínimo) y costos variables de mercadería.
11. `punto_equilibrio_micro`: Fórmulas directas de cálculo de punto de equilibrio en pesos diarios y unidades mínimas de venta por jornada, con estimación de ganancia neta en efectivo.

---

## 3. Fórmulas y Modelos Cuantitativos Obligatorios

### A. Punto de Equilibrio Diario para Micronegocios
$$PE_{\text{mensual}} = \frac{\text{Costos Fijos Mensuales (CF)}}{1 - \left(\frac{\text{Costo de Mercadería}}{\text{Precio de Venta Promedio}}\right)} = \frac{CF}{\text{Margen de Contribución \%}}$$
$$PE_{\text{diario}} = \frac{PE_{\text{mensual}}}{\text{Días de Operación al Mes (ej. 26 o 30 días)}}$$
- **Regla Práctica:** Si un comerciante tiene \$18,000 MXN de costos fijos mensuales y un margen de contribución del $40\%$, sus ventas mínimas de supervivencia son:
  $$PE_{\text{mensual}} = \frac{18,000}{0.40} = \$45,000 \text{ MXN/mes} \implies PE_{\text{diario}} = \frac{45,000}{26} = \$1,731 \text{ MXN/día}$$

### B. Salario Digno del Fundador (Regla Anti-Autoexplotación)
- El costo fijo **DEBE** incluir obligatoriamente el salario de subsistencia del fundador dentro de los costos operativos, evitando la trampa común de considerar "utilidad" lo que en realidad es la compensación de sus propias horas trabajadas.

---

## 4. Boxes Visuales e Interactivos Asociados
1. `box_apertura_30dias` (CHECKLIST): Hoja de ruta legal en 4 semanas (RFC en SAT/RESICO, uso de suelo, aviso de funcionamiento sanitario ante COFEPRIS/Salud, licencia municipal y terminal de cobro).
2. `box_micro_canvas_3b` (CANVAS): Lienzo ultra-simplificado de 3 columnas (Clientes y Vecinos, Oferta y Servicio, Bolsillo y Finanzas).
3. `box_micro_croquis_2d` (CANVAS): Visualizador interactivo de planos 2D con cuadrícula de distribución y zonas de tráfico.
4. `box_punto_equilibrio_micro` (FORMULA): Calculadora directa de tickets mínimos diarios y margen de contribución.

---

## 5. Bibliografía y Citas Clave
- **Colwell, Ken.** *Starting a Business QuickStart Guide: The Simplified Beginner's Guide to Launching a Successful Small Business*. ClydeBank Media LLC, 2019.
- **Plan de Negocios VF.** *Guía Práctica para la Formulación de Microproyectos Comerciales*. pp. 15-45.
- **Ministerio de Comercio e Industrias de Panamá.** *Manual de Organización y Apertura Rápida de Microempresas*. 2017.
