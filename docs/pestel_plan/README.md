# Plan PESTEL VCV — índice de goals por fase

Un archivo por fase, autocontenido: cada uno puede pegarse como **goal independiente** en Qoder (Qwen) o Antigravity, sin necesidad de las demás fases en contexto. Ejecutar en orden.

| Orden | Goal | Herramienta | Entregable | Estado |
|---|---|---|---|---|
| 0 | `FASE_0_insumos.md` | Local / OBP | `insumos_vcv.md` | ✔ entregado |
| 1 | `FASE_1_delimitacion_candidatos.md` | Qoder (Qwen) | `fase1_delimitacion_y_candidatos.md` | ✔ entregado |
| 2 | `FASE_2_matriz_pestel.md` | Qoder (Qwen) | `fase2_matriz_pestel.md` | ✔ entregado |
| 3 | `FASE_3_priorizacion_conclusion.md` | Qoder (Qwen) | `fase3_priorizacion_conclusion.md` | ✔ entregado |
| 4 | `FASE_4_documento_final.md` | Qoder (Qwen) | `Actividad_Individual_PESTEL_VCV.docx` | ✔ entregado (+ `.pdf`) |
| 5 | `FASE_5_presentacion.md` | Antigravity | `PESTEL_VCV.pptx` + `.pdf` | ✔ entregado (hecho en Qoder con python-pptx) |
| ✔ | `CHECKLIST_ENTREGA.md` | Manual | Validación final | ✔ revisado 2026-10-13 |

Regla de oro: no pasar a la fase siguiente sin validar el criterio de aceptación de la anterior. La Fase 0 alimenta a todas; las fases 1–4 consumen los entregables previos (indicado en cada archivo).

## Cómo se reprodujo la Fase 5 sin Antigravity

La Fase 5 estaba asignada a Antigravity, pero se resolvió aquí con `build_pptx_pestel.py` (python-pptx → `PESTEL_VCV.pptx`) y `soffice --headless --convert-to pdf` (→ `PESTEL_VCV.pdf`). Los scripts `build_docx_pestel.py` y `build_pptx_pestel.py` regeneran ambos entregables desde cero; `recalibrar_factor3.py` deja constancia del cambio que evitó que una fila coincidiera con el ejemplo de la rúbrica.
