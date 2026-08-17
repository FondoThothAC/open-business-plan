# Software Design Document (SDD): Generador de Logotipos e Identidad de Marca con IA

**Proyecto:** Open Business Plan v2.6 (Fondo Thoth AC)  
**Autor:** Antigravity AI  
**Fecha:** Agosto 2026  
**Estado:** Propuesto / Aprobado  

---

## 1. Visión y Objetivos

El objetivo de este módulo es proporcionar una suite integrada de generación automática de identidad visual (logotipos, isotipos y paletas cromáticas) para emprendedores y creadores de planes de negocio en Open Business Plan.

### Metas Principales:
1. **Costo Cero & Sin Fricción**: Proveer generación de logotipos 100% gratuita sin requerir API keys obligatorias mediante **Pollinations.ai (Flux.1 / SDXL)**.
2. **Fallback Robusto & Multi-Nivel**:
   - Nivel 1: Pollinations.ai (Flux/Turbo).
   - Nivel 2: Google Gemini Imagen 3 (si el usuario tiene API key).
   - Nivel 3: Sintetizador Vectorial SVG Offline (renderizado procedural determinista).
3. **Calidad de Diseño y Separación de Capas**: La IA genera exclusivamente el **isotipo / icono estilizado** sin texto defectuoso; la tipografía corporativa se renderiza mediante el motor de diseño tipográfico en CSS y SVG en la portada del PDF.
4. **Almacenamiento Dual**: Los logos se guardan en el sistema de archivos del servidor (`proyectos/<tipo>/<id>/logo.png`) y se embeben como Data URL Base64 en `planData.config.brandKit.logoUrl` para garantizar portabilidad en exports y PDFs.

---

## 2. Diagrama de Flujo y Secuencia

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant UI as Semilla / BrandKit UI
    participant Gen as logoGenerator.js
    participant Server as Express Server (/api/logo)
    participant Poll as Pollinations.ai
    participant Local as Storage (proyectos/.../logo.png)

    Usuario->>UI: Define nombre ("Abarrotes La Esquinita"), giro y colores
    UI->>Gen: buildLogoPrompt(planData, style='flat_vector')
    Gen-->>UI: Prompt generado en inglés optimizado
    Usuario->>UI: Clic en "Generar Variantes con IA"
    UI->>Server: POST /api/logo/generate (prompt, seed, style)
    Server->>Poll: GET /prompt/{prompt}?model=flux&seed=...
    Poll-->>Server: PNG Image Buffer
    Server->>Local: Guardar en proyectos/negocios/abarrotes_colonia/logo.png
    Server-->>UI: { success: true, base64: "data:image/png;base64,...", url: "/api/projects/negocios/.../logo.png" }
    UI->>Usuario: Galería de 4 variantes generadas
    Usuario->>UI: Selecciona variante favorita
    UI->>UI: Actualiza planData.config.brandKit.logoUrl
```

---

## 3. Especificación de la API

### `POST /api/logo/generate`
- **Body**:
  ```json
  {
    "companyName": "Veterinaria Patitas de Amor",
    "giro": "Servicios veterinarios y cuidado de mascotas",
    "isotipoDesc": "Huella de perro entrelazada con un corazón",
    "primaryColor": "#4f46e5",
    "secondaryColor": "#10b981",
    "style": "flat_vector", // "flat_vector" | "mascot_icon" | "emblem" | "3d_modern"
    "customPrompt": "",
    "variantsCount": 4
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "variants": [
      { "id": "var-1", "dataUrl": "data:image/png;base64,...", "prompt": "..." },
      { "id": "var-2", "dataUrl": "data:image/png;base64,...", "prompt": "..." },
      { "id": "var-3", "dataUrl": "data:image/png;base64,...", "prompt": "..." },
      { "id": "var-4", "dataUrl": "data:image/png;base64,...", "prompt": "..." }
    ]
  }
  ```

---

## 4. Estructura de Datos (Model-Driven Development)

En `planData.config.brandKit`:
```json
{
  "brandKit": {
    "companyName": "Abarrotes La Esquinita",
    "primaryColor": "#f59e0b",
    "secondaryColor": "#10b981",
    "logoUrl": "data:image/png;base64,...",
    "logoStyle": "flat_vector",
    "logoPrompt": "Minimalist vector logo of a cozy grocery store house with a friendly shopping cart, modern flat design, pure white background, no text"
  }
}
```

---

## 5. Metodología TDD

1. **Test 1**: Construcción adecuada de prompts para cada uno de los estilos predefinidos.
2. **Test 2**: Manejo de timeouts y fallback fluido a SVG procedural cuando la red no está disponible.
3. **Test 3**: Conversión de buffers a data URLs válidas.
4. **Test 4**: Persistencia en disco y carga adecuada en `VistaPrevia.jsx`.
