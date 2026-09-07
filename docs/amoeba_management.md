# Metodología 10: Gestión Celular Amoeba Management (`amoeba_management`)

## 1. Identidad del Método
- **Nombre Oficial:** Sistema de Gestión Celular por Células Amoeba (Amoeba Management System - 京セラ アメーバ経営).
- **Origen Bibliográfico Principal:**
  - *Amoeba Management: The Dynamic Management System for Rapid Market Response* (Kazuo Inamori).
  - *A Compass to Fulfillment: Passion and Spirituality in Life and Business* (Kazuo Inamori).
  - *The Nature of Value: Achieving High Performance and Sustainability* (Ch. 4: El caso de creación de valor de Kyocera y Japan Airlines).
- **Propósito:** Descentralizar una gran organización en pequeñas unidades operativas autónomas (células de 5 a 50 miembros llamadas "Amoebas"), facultando a cada líder celular para operar como un microempresario con su propia cuenta de pérdidas y ganancias, maximizando los ingresos, minimizando los costos y midiendo el valor agregado generado por persona-hora de trabajo en tiempo real.
- **Público Objetivo:** Empresas de manufactura avanzada, corporativos diversificados, empresas de servicios intensivas en mano de obra y organizaciones que buscan eliminar la burocracia centralizada.

---

## 2. Estructura de Pilares y Módulos
El framework `amoeba_management` consta de **4 Pilares Celulares** y **8 Módulos**:

### Pilar 1: Estructura Celular y Filosofía Corporativa
1. `celulas`: Delimitación funcional de las células Amoeba (Amoeba de Compras, Amoebas de Fabricación por línea de producto, Amoebas de Ventas por canal) con independencia operativa y contable.
2. `filosofia_corp`: Fundamento ético de Kazuo Inamori ("Hacer lo correcto como ser humano", honestidad sin trampas contables, transparencia absoluta de cifras y altruismo corporativo).
3. `principios_inamori_12`: Auditoría de cumplimiento de los 12 Principios de Gestión de Kazuo Inamori (Establecer metas claras, tener un deseo apasionado, fijar precios óptimos, optimismo ilimitado para concebir y cautela para ejecutar).

### Pilar 2: Precios de Transferencia y Contabilidad por Hora
4. `precios`: Mecanismo de fijación de precios de transferencia interna entre Amoebas (fabricación a ventas) basado en precios de mercado externo, evitando subsidios artificiales entre departamentos.
5. `horenso_reportar_contactar_consultar`: Protocolo riguroso de comunicación organizacional Ho-Ren-So (Houkoku: reportar hechos sin ocultar errores; Renraku: comunicar oportunamente a las células afectadas; Soudan: consultar a líderes experimentados antes de tomar decisiones de alto riesgo).

### Pilar 3: Medición de Productividad y Rentabilidad Horaria
6. `time_based_management`: Gestión basada en el tiempo y valor agregado por hora, registrando con exactitud las horas directas de trabajo, horas de apoyo indirecto y horas extraordinarias trabajadas por cada miembro de la célula.
7. `rentabilidad`: Cálculo diario y mensual de la métrica sagrada de Inamori: **Valor Agregado por Hora (Rentabilidad Horaria Celular)**.

### Pilar 4: Simulación Celular y Resiliencia Financiera
8. `simulador`: Simulador interactivo de balance de transferencias entre Amoebas, elasticidad de costos variables y generación de flujo de efectivo operativo para resistir caídas abruptas de demanda sin despidos.

---

## 3. Fórmulas y Modelos Cuantitativos Obligatorios

### A. Rentabilidad Horaria Celular (Fórmula Inamori de Kyocera)
$$\text{Rentabilidad por Hora} = \frac{\text{Ingresos Totales de la Célula} - \text{Costos Totales (sin incluir mano de obra)}}{\text{Total de Horas Trabajadas por los Miembros de la Célula}}$$
- **Ingresos Totales de la Célula:** Ventas a clientes externos + Ventas por transferencia interna a otras células Amoeba.
- **Costos Totales (sin mano de obra):** Materias primas, insumos, energía, depreciación de maquinaria de la célula, comisiones bancarias, gastos administrativos distribuidos.
  - *Nota crucial de Inamori:* Los salarios de los colaboradores **NO** se restan como gasto para no considerar a las personas como un costo a minimizar, sino como los creadores directos de valor que maximizan este indicador.
- **Total de Horas:** Suma de todas las horas reales trabajadas por los integrantes de la célula en el periodo (horas ordinarias + horas extra).
- **Benchmark:** La rentabilidad horaria de la célula debe ser sustancialmente superior al costo medio por hora laboral de la industria (típicamente $\ge 2.5\text{x}$ a $4.0\text{x}$ el salario horario medio para garantizar reinversión y estabilidad).

### B. Los 12 Principios de Gestión de Kazuo Inamori
1. Clarificar el propósito y significado del negocio.
2. Establecer metas concretas y transparentes.
3. Mantener un deseo ardiente y apasionado en el corazón.
4. Esforzarse más que cualquier otra persona (trabajo incansable).
5. Maximizar las ventas y minimizar los gastos (el beneficio es el remanente).
6. La fijación de precios es la gestión misma (encontrar el punto más alto que el cliente pagará feliz).
7. El éxito está determinado por una fuerza de voluntad indomable.
8. Encender el espíritu de lucha y perseverancia.
9. Afrontar los problemas con valor y sin engaños.
10. Ser creativo de manera constante e incremental cada día.
11. Tratar a los demás con bondad, honestidad y consideración sincera.
12. Mantener siempre un estado de ánimo positivo, alegre y esperanzador.

---

## 4. Boxes Visuales e Interactivos Asociados
1. `box_rentabilidad_hora_amoeba` (BENCHMARK): Panel de cálculo en tiempo real de valor agregado por persona-hora.
2. `box_12_principios_inamori` (CHECKLIST): Auditoría ética y de liderazgo basada en los 12 mandamientos de Inamori.
3. `box_horenso_protocolo_3pasos` (CHECKLIST): Protocolo de comunicación transparente Houkoku-Renraku-Soudan.
4. `box_time_based_amoeba` (BENCHMARK): Monitoreo de horas trabajadas y productividad por puesto celular.

---

## 5. Bibliografía y Citas Clave
- **Inamori, Kazuo.** *Amoeba Management: The Dynamic Management System for Rapid Market Response*. Productivity Press, 2012.
- **Inamori, Kazuo.** *A Compass to Fulfillment: Passion and Spirituality in Life and Business*. McGraw-Hill, 2010.
- **Gogerty, N., & Rocha, L.** *The Nature of Value: Achieving High Performance and Sustainability*. Columbia University Press, 2014 (Capítulo 4: Kyocera Value System).
