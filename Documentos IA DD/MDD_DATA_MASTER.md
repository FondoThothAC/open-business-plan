# MDD & DATA MASTER — Model-Driven & Data-Driven Development
**Proyecto:** Open Business Plan  

---

## 1. Esquema Canónico del Plan de Negocios

```json
{
  "semilla": {
    "negocio": {
      "nombre_marca": "String",
      "cobertura": "String",
      "problema": "String",
      "solucion": "String",
      "mercado_objetivo": "String",
      "modelo_ingresos": "String",
      "ventaja_injusta": "String"
    },
    "fundador": {
      "area_fuerte": "finanzas | operaciones | administracion",
      "horas_semanales": "Number",
      "disposicion_delegar": "Boolean"
    },
    "diagnostico_cuantico": {
      "es_fusion_atomica": "Boolean",
      "score_salud": "Number",
      "recomendaciones_delegacion": "Array"
    }
  },
  "config": {
    "projectType": "business | social_bid | tech_startup",
    "theme": "light | dark",
    "ai": {
      "primaryProvider": "groq | gemini | openrouter | nvidia | ollama | lmstudio | bai",
      "apiKey": "String (Single or Comma-separated Pool)",
      "baiKey": "String (sk-ot... B.AI Key)",
      "groqKey": "String (Pool)",
      "openrouterKey": "String (Pool)",
      "depth": 1,
      "model": "String"
    }
  },
  "modulos": {
    "demanda": {
      "demanda_historica": "String",
      "elasticidad": "String"
    },
    "capacidad_instalada": {
      "capacidad_diseno": "String",
      "cuellos_botella": "String"
    }
  }
}
```

---

## 2. Persistencia y Sanitización

* **Almacenamiento Local:** Los planes se guardan en el `localStorage` del navegador y se sincronizan opcionalmente con el backend local en formato JSON comprimido.
* **Sanitización de Contexto (`cleanPlanDataForAi`):** Antes de enviar el estado a los LLMs, se eliminan matrices numéricas gigantes, imágenes base64 y datos binarios para optimizar tokens y costos de contexto.
