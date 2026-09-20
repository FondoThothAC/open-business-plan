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

---

## 5. Esquema de Entidades de Seguridad & RBAC

### 5.1 Entidad Usuario (`User`)
```json
{
  "id": "String (uuid / u_prefix)",
  "username": "String (alphanumeric safe)",
  "email": "String (RFC 5322)",
  "role": "superadmin | revisor | user",
  "status": "active | pending | disabled",
  "displayName": "String",
  "passwordHash": "String (bcrypt, cost 12)",
  "apiKeys": {
    "gemini": "Encrypted String (AES-256-GCM)",
    "groq": "Encrypted String",
    "openrouter": "Encrypted String"
  },
  "sessionVersion": "Number (entero autoincremental para revocación inmediata)",
  "createdAt": "ISO8601 String",
  "lastLogin": "ISO8601 String"
}
```

### 5.2 Entidad Invitación de Revisión Externa (`ReviewInvite`)
Ubicación: `server/data/review_invites.json`
```json
{
  "id": "String (rev_...)",
  "tokenHash": "String (SHA-256 digest del token crudo)",
  "projectType": "negocios | social",
  "projectId": "String",
  "projectPath": "String",
  "ownerId": "String",
  "email": "String (correo del revisor externo)",
  "scope": "executive | full",
  "createdAt": "ISO8601 String",
  "expiresAt": "ISO8601 String",
  "revokedAt": "ISO8601 String | null",
  "comments": [
    {
      "id": "String (c_...)",
      "createdAt": "ISO8601 String",
      "status": "open | resolved",
      "authorEmail": "String",
      "text": "String",
      "anchor": {
        "moduleId": "String",
        "fieldKey": "String | null",
        "blockText": "String | null"
      },
      "revision": "String | null"
    }
  ]
}
```

### 5.3 Ciclo de Vida Editorial de Proyectos (`ProjectWorkflow`)
```json
{
  "avance": "Number (0..100) [Cálculo cuantitativo de campos completados]",
  "workflowStatus": "Borrador | En revisión | Aprobado | Archivado",
  "userOwner": "String (user.id o username estable)",
  "reviewerNotes": [
    {
      "id": "String",
      "authorId": "String",
      "authorName": "String",
      "role": "revisor | superadmin",
      "comment": "String",
      "createdAt": "ISO8601 String"
    }
  ],
  "lastEditedBy": "String",
  "lastEditedAt": "ISO8601 String"
}
```

### 5.4 Bitácora de Auditoría Inmutable (`AuditEntry`)
Ubicación: `server/data/audit_log.json`
```json
{
  "id": "String (UUID)",
  "timestamp": "ISO8601 String",
  "actorId": "String (User ID)",
  "actorUsername": "String",
  "role": "superadmin | revisor | user",
  "action": "LOGIN | LOGOUT | ROLE_CHANGE | USER_ACTIVATE | USER_DEACTIVATE | PASSWORD_RESET | PROJECT_STATUS_CHANGE | PROJECT_ARCHIVE | EXPORT",
  "target": "String (User ID / Project ID)",
  "ip": "String",
  "details": "Object (metadata contextual)"
}
```

---

## 6. Modelo de Inversión y Escenarios VCV Cortes Finos
* **Fase 1 (Taller Piloto Regional B2B):** `$4,000,000 MXN` (Arranque con 1 módulo continuo ASADHOR, túnel de enfriamiento y selladora al vacío).
* **Fase 2 (Escalamiento Cuántico a Exportación Binacional):** `$16,800,000 MXN` (Ronda Serie A para certificación TIF SENASICA, auditoría bilateral USDA/FSIS, túnel IQF criogénico y registro FDA).


