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
    },
    "search": {
      "provider": "duckduckgo | brave | tavily | exa | perplexity",
      "apiKey": "String (Tavily API Key)",
      "braveApiKey": "String (Brave Search API Key)",
      "enableDdg": "Boolean",
      "scraperEngine": "local | cheerio | puppeteer",
      "allowPaidTier": "Boolean",
      "failover": "Boolean"
    }
  },
  "provenance_contract": {
    "provenance": "real | local_offline | synthetic | none",
    "provider": "String | null",
    "sourceUrl": "String | null",
    "retrievedAt": "ISO8601 String",
    "confidenceScore": "Number (0.0 a 1.0)",
    "warning": "String | undefined"
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

---

## 3. Esquema de Corrida Financiera Automática (`corrida_automatica`)

Ubicación canónica: `planData.organizacion.estados_financieros.corrida_automatica`

```json
{
  "incomeStatement": [
    {
      "year": "Number (1..5)",
      "revenue": "Number (MXN)",
      "variableCosts": "Number (MXN)",
      "grossMargin": "Number (MXN)",
      "fixedCosts": "Number (MXN)",
      "ebitda": "Number (MXN)",
      "depreciation": "Number (MXN)",
      "ebit": "Number (MXN)",
      "taxes": "Number (ISR 30%)",
      "netIncome": "Number (MXN)"
    }
  ],
  "cashFlow": [
    {
      "year": "Number (1..5)",
      "initialCash": "Number (MXN)",
      "operatingInflow": "Number (MXN)",
      "operatingOutflow": "Number (MXN)",
      "netOperatingCash": "Number (MXN)",
      "finalCash": "Number (MXN)"
    }
  ],
  "kpis": {
    "irr": "Number (TIR en %)",
    "npv": "Number (VPN en MXN)",
    "paybackPeriodYears": "Number (Años)",
    "grossMarginPct": "Number (Margen Bruto Real %)",
    "markupPct": "Number (Markup sobre Costo %)",
    "breakEvenKgMonthly": "Number (Punto de Equilibrio en Unidades/Kg)",
    "breakEvenRevenueMonthly": "Number (Punto de Equilibrio en Facturación MXN)"
  }
}
```

---

## 4. Esquema de Exportación Documental & Alcance

* **`exportScope`**: `'executive' | 'full'`.
  * `'executive'`: Filtra exclusivamente la metodología activa en `FRAMEWORKS[projectType]`, omitiendo frameworks auxiliares y desplegando tablas financieras anuales compactas a 5 años (~20-25 páginas).
  * `'full'`: Exporta los 12 frameworks canónicos completos con taxonomía multinivel de pilares y módulos.

