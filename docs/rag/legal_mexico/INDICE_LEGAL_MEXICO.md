# 🇲🇽 Índice Maestro de Legislación y Normativa Aplicable a Planes de Negocio en México

Este compendio estructurado consolida el marco legal, fiscal, laboral, corporativo y ambiental de los Estados Unidos Mexicanos que rige los modelos de negocio, corridas financieras y esquemas societarios en **Open Business Plan**.

---

## 📚 Mapa de Documentos y Articulado

| # | Archivo | Materia / Ley | Artículos Clave | Impacto en el Plan de Negocio |
|---|---|---|---|---|
| 1 | [`01_LISR_Impuesto_Sobre_la_Renta.md`](./01_LISR_Impuesto_Sobre_la_Renta.md) | Fiscal (LISR) | Art. 9 (Tasa 30%), Art. 25, 27 (Deducciones), Art. 34-35 (Depreciación CAPEX), Art. 140 (Dividendos 10%) | Cálculo de Utilidad Neta, FCFF, Escudo Fiscal y Pagos Provisionales. |
| 2 | [`02_LIVA_CFF_Fiscal.md`](./02_LIVA_CFF_Fiscal.md) | Fiscal (LIVA / CFF) | LIVA Art. 1 (Tasa 16%), CFF Art. 29 (CFDI 4.0), Art. 32-D (Opinión Positiva) | Flujo de efectivo mensual de IVA, facturación y homologación de proveedores. |
| 3 | [`03_LFT_LSS_Laboral_Seguridad_Social.md`](./03_LFT_LSS_Laboral_Seguridad_Social.md) | Laboral (LFT / LSS) | LFT Art. 76 (Vacaciones 12d+), Art. 87 (Aguinaldo 15d), Art. 117 (PTU 10%), Art. 15 (REPSE), LSS Art. 27 (SBC) | Presupuesto de nómina, factor de sobrecosto patronal (FSR 25-30%) y REPSE. |
| 4 | [`04_LMV_LGSM_Corporativo_SAPI.md`](./04_LMV_LGSM_Corporativo_SAPI.md) | Societario (LMV / LGSM) | LMV Art. 12-19 (S.A.P.I. de C.V.), Art. 13 (Tag/Drag-Along), Art. 16 (Pactos de socios) | Constitución formal, rondas de capital, gobierno corporativo y derechos de minorías. |
| 5 | [`05_NOMs_Seguridad_Mineria_Industrial.md`](./05_NOMs_Seguridad_Mineria_Industrial.md) | Seguridad (STPS / Ley Minera) | NOM-023-STPS (Minas), NOM-004-STPS (Maquinaria/Presión 40k PSI), NOM-017-STPS (EPP) | Protocolos de seguridad operativa, certificación de banco de pruebas y EPP. |
| 6 | [`06_LFPPI_LFDA_Propiedad_Intelectual.md`](./06_LFPPI_LFDA_Propiedad_Intelectual.md) | Propiedad Intelectual | LFPPI Art. 170 (Marcas Clases 37/42), Art. 45 (Modelos de Utilidad), LFDA Art. 101 (Software IoT) | Registro de marcas, patentes, secreto industrial y derechos de autor de software. |
| 7 | [`07_LGPGIR_LGEEPA_Ambiental_Residuos.md`](./07_LGPGIR_LGEEPA_Ambiental_Residuos.md) | Ambiental (SEMARNAT) | LGPGIR Art. 42 (Residuos Peligrosos / Aceites), LGEEPA Art. 28 (MIA), Principio DNSH | Manifiestos de recolección de aceite usado, licencias ambientales y criterios ESG. |

---

## 🔢 Parámetros Cuantitativos Maestros para Corridas Financieras en México

```json
{
  "tasas_fiscales": {
    "isr_corporativo": 0.30,
    "iva_general": 0.16,
    "iva_frontera_norte": 0.08,
    "retencion_dividendos": 0.10,
    "ptu_utilidades": 0.10
  },
  "cargas_laborales_patronales": {
    "imss_rcv_promedio": 0.22,
    "infonavit": 0.05,
    "impuesto_sobre_nomina_estatal": 0.03,
    "factor_salario_real_minimo": 1.30
  },
  "prestaciones_minimas_lft": {
    "aguinaldo_dias": 15,
    "prima_vacacional": 0.25,
    "vacaciones_año_1": 12
  }
}
```
