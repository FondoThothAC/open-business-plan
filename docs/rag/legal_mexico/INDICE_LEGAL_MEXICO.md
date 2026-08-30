# 🇲🇽 Índice Maestro de Legislación y Normativa Aplicable a Planes de Negocio en México

Este compendio estructurado consolida las **18 leyes, códigos, reglamentos y Normas Oficiales Mexicanas (NOMs)** provistos en `/Leyes`, así como los decretos del DOF y la STPS que rigen los modelos de negocio, corridas financieras, despacho aduanero y blindaje legal en **Open Business Plan**.

---

## 📚 Mapa de Documentos RAG y Articulado Maestro

| # | Archivo RAG | PDF Fuente en `/Leyes` | Materia / Ley | Artículos y Normativa Clave | Impacto en el Plan de Negocio |
|---|---|---|---|---|---|
| 1 | [`01_LISR_Impuesto_Sobre_la_Renta.md`](./01_LISR_Impuesto_Sobre_la_Renta.md) | `LISR.pdf` | Fiscal (LISR) | Art. 9 (Tasa 30%), Art. 25, 27 (Deducciones), Art. 34-35 (Depreciación CAPEX), Art. 140 (Dividendos 10%) | Cálculo de Utilidad Neta, FCFF, Escudo Fiscal y Pagos Provisionales. |
| 2 | [`02_LIVA_CFF_Fiscal.md`](./02_LIVA_CFF_Fiscal.md) | `LIVA.pdf` & `CFF.pdf` | Fiscal (LIVA / CFF) | LIVA Art. 1 (Tasa 16%), CFF Art. 29 (CFDI 4.0), Art. 32-D (Opinión Positiva) | Flujo de efectivo mensual de IVA, facturación y homologación de proveedores. |
| 3 | [`03_LFT_LSS_Laboral_Seguridad_Social.md`](./03_LFT_LSS_Laboral_Seguridad_Social.md) | `1044_Ley_Federal_del_Trabajo.pdf` & `LSS.pdf` | Laboral (LFT / LSS) | LFT Art. 76 (Vacaciones 12d+), Art. 87 (Aguinaldo 15d), Art. 117 (PTU 10%), LSS Art. 27 (SBC) | Presupuesto de nómina, factor de sobrecosto patronal (FSR 25-30%) y pasivos laborales. |
| 4 | [`04_LMV_LGSM_Corporativo_SAPI.md`](./04_LMV_LGSM_Corporativo_SAPI.md) | `LMV.pdf` & `LGSM.pdf` | Societario (LMV / LGSM) | LMV Art. 12-19 (S.A.P.I. de C.V.), Art. 13 (Tag/Drag-Along), Art. 16 (Pactos de socios) | Constitución formal, rondas de capital, gobierno corporativo y derechos de minorías. |
| 5 | [`05_NOMs_Seguridad_Mineria_Industrial.md`](./05_NOMs_Seguridad_Mineria_Industrial.md) | `023stps2012.pdf`, `Nom-004.pdf`, `Nom-017.pdf` | Seguridad (STPS) | NOM-023-STPS (Minas), NOM-004-STPS (Maquinaria/Presión 40k PSI), NOM-017-STPS (EPP) | Protocolos de seguridad operativa, certificación de banco de pruebas y EPP. |
| 6 | [`06_LFPPI_LFDA_Propiedad_Intelectual.md`](./06_LFPPI_LFDA_Propiedad_Intelectual.md) | `LFPPI.pdf` & `LFDA.pdf` | Propiedad Intelectual | LFPPI Art. 170 (Marcas Clases 37/42), Art. 45 (Modelos Utilidad), LFDA Art. 101 (Software IoT) | Registro de marcas, patentes, secreto industrial y derechos de autor de software. |
| 7 | [`07_LGPGIR_LGEEPA_Ambiental_Residuos.md`](./07_LGPGIR_LGEEPA_Ambiental_Residuos.md) | `Ley_General_para_la_Prevencion_y_Gestion_Integral_de_los_Residuos.pdf` & `LGEEPA.pdf` | Ambiental (SEMARNAT) | LGPGIR Art. 42 (Residuos Peligrosos / Aceites usados), LGEEPA Art. 28 (MIA), Principio DNSH | Manifiestos de recolección de aceite usado, licencias ambientales y criterios ESG. |
| 8 | [`08_LIGIE_Comercio_Exterior_Aduanas.md`](./08_LIGIE_Comercio_Exterior_Aduanas.md) | `LIGIE_2022.pdf` | Comercio Exterior | Cap. 40 (Mangueras 4009.22.01), Cap. 84/90 (Bancos de prueba, Sensores IoT), DTA, T-MEC | Despacho aduanero, aranceles de importación de maquinaria y componentes. |
| 9 | [`09_CCom_Codigo_de_Comercio_Contratos.md`](./09_CCom_Codigo_de_Comercio_Contratos.md) | `CCom.pdf` | Mercantil / Contratos | Art. 75, 78 (Libertad contractual), Art. 362 (Mora comercial), Art. 89 (Firma electrónica) | Términos de crédito B2B, contratos de suministro y validez de firmas electrónicas. |
| 10 | [`10_Ley_Mineria_Reglamento_R103.md`](./10_Ley_Mineria_Reglamento_R103.md) | `Ley_de_Mineria.pdf` & `R103.pdf` | Minería | Ley Minera Art. 6-19, R103 (Control de bocaminas, talleres móviles en tajos) | Homologación de proveedores mineros en concesiones y auditorías de seguridad. |
| 11 | [`11_STPS_REPSE_Subcontratacion_DOF.md`](./11_STPS_REPSE_Subcontratacion_DOF.md) | Acuerdo DOF 24/05/2021 | Laboral / STPS | Art. 15 LFT, Padrón REPSE, Requisitos de Acreditación Técnica, Multas de 2k a 50k UMA | Registro obligatorio de servicios especializados para cuadrillas de campo MaaS. |

---

## 🔢 Parámetros Cuantitativos Maestros para Corridas Financieras en México

```json
{
  "tasas_fiscales": {
    "isr_corporativo": 0.30,
    "iva_general": 0.16,
    "iva_frontera_norte": 0.08,
    "retencion_dividendos": 0.10,
    "ptu_utilidades": 0.10,
    "dta_aduanas": 0.008
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
