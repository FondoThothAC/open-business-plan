# Índice Maestro de Leyes Mexicanas (RAG)

> Generado: 2026-08-30T06:53:27.132Z | Total: 23 leyes | Fuente: `Leyes/`

| # | Ley (Archivo) | Slug | Páginas | Tamaño | Artículos | Capítulos |
|---|---------------|------|---------|--------|-----------|-----------|
| 1 | 023stps2012.pdf | `023stps2012` | - | 610 KB | 5 | 14 |
| 2 | 1044_Ley_Federal_del_Trabajo.pdf | `1044_Ley_Federal_del_Trabajo` | - | 1699 KB | 1462 | 24 |
| 3 | CCom.pdf | `CCom` | - | 2569 KB | 2065 | 39 |
| 4 | CFF.pdf | `CFF` | - | 3061 KB | 1255 | 56 |
| 5 | Decreto_Subcontratacion_2021_23Abril2021.pdf | `Decreto_Subcontratacion_2021_23Abril2021` | - | 7 KB | 0 | 0 |
| 6 | Decreto_Subcontratacion_2021_DOF.pdf | `Decreto_Subcontratacion_2021_DOF` | - | 42 KB | 0 | 0 |
| 7 | Decreto_Subcontratacion_2021_completo.pdf | `Decreto_Subcontratacion_2021_completo` | - | 6001 KB | 1 | 0 |
| 8 | LFDA.pdf | `LFDA` | - | 946 KB | 379 | 41 |
| 9 | LFPPI.pdf | `LFPPI` | - | 1234 KB | 579 | 44 |
| 10 | LGEEPA.pdf | `LGEEPA` | - | 1326 KB | 518 | 58 |
| 11 | LGSM.pdf | `LGSM` | - | 816 KB | 413 | 3 |
| 12 | LIGIE_2022.pdf | `LIGIE_2022` | - | 18705 KB | 17 | 416 |
| 13 | LISR.pdf | `LISR` | - | 2951 KB | 1144 | 170 |
| 14 | LIVA.pdf | `LIVA` | - | 1220 KB | 381 | 12 |
| 15 | LMV.pdf | `LMV` | - | 1888 KB | 891 | 37 |
| 16 | LSS.pdf | `LSS` | - | 1939 KB | 756 | 50 |
| 17 | Ley_General_para_la_Prevencion_y_Gestion_Integral_de_los_Residuos.pdf | `Ley_General_para_la_Prevencion_y_Gestion_Integral_de_los_Residuos` | - | 507 KB | 145 | 16 |
| 18 | Ley_de_Mineria.pdf | `Ley_de_Mineria` | - | 469 KB | 122 | 0 |
| 19 | Nom-004.pdf | `Nom_004` | - | 39 KB | 3 | 6 |
| 20 | Nom-017.pdf | `Nom_017` | - | 80 KB | 3 | 0 |
| 21 | R103.pdf | `R103` | - | 517 KB | 224 | 20 |
| 22 | Reforma_Subcontratacion_2021_DOF.pdf | `Reforma_Subcontratacion_2021_DOF` | - | 4020 KB | 5 | 14 |
| 23 | Reforma_Subcontratacion_2021_STPS.pdf | `Reforma_Subcontratacion_2021_STPS` | - | 56 KB | 2 | 0 |

---

## Categorización Temática

| Área | Leyes |
|------|-------|
| **Fiscal** | LISR, LIVA, LFPPI, CFF |
| **Laboral** | LFT (1044), LSS, R103, NOM-004, NOM-017, 023stps2012 |
| **Mercantil** | CCom, LMV |
| **Ambiental** | LGEEPA, LGSM, Ley_Residuos, NOM-004 |
| **Minero** | Ley_Mineria |
| **Fideicomisos** | LFPPI |
| **Aduanero/Comercio** | LIGIE_2022 |
| **Residuos** | Ley_Residuos |
| **Protección Civil** | NOM-004, NOM-017 |

---

## Uso en RAG

```js
// Cargar ley específica
const ley = await fs.promises.readFile('docs/rag/leyes/LISR.md', 'utf8');

// Buscar artículos
const articulos = contenido.match(/Artículos+d+/gi);

// Filtrar por tema
const leyesFiscales = ['LISR', 'LIVA', 'LFPPI', 'CFF'];
```

---

*Generado automáticamente por `scripts/extract-leyes.js`*
