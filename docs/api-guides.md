# Guías de proveedores de investigación

La interfaz debe mostrar estas fichas junto a cada campo de credencial. Las claves se guardan cifradas en el perfil del usuario; nunca se almacenan en el navegador ni se incluyen en un reporte.

| Proveedor | Uso en OBP | Registro/documentación | Estado honesto |
|---|---|---|---|
| Tavily | Búsqueda y extracción orientada a investigación | https://tavily.com · https://docs.tavily.com/ | Requiere clave personal y cuota disponible |
| Brave Search | Búsqueda alternativa | https://brave.com/search/api/ · https://api.search.brave.com/app/documentation | Requiere clave personal y cuota disponible |
| INEGI DENUE | Establecimientos, SCIAN y ubicación | https://www.inegi.org.mx/servicios/api_denue.html | No mide ingreso ni población residencial |
| INEGI Censo/AGEB | Población, edades, escolaridad y viviendas | https://www.inegi.org.mx/app/descarga/ficha.html?ag=0&f=csv&tit=326086 | Datos por año y territorio, no población actual automática |
| ENIGH | Ingreso y gasto en dominios publicados | https://inegi.org.mx/programas/enigh/nc/2024/ | No representa una colonia individual sin supuestos |
| Google Places (opcional) | Contraste de dirección y estado operativo | https://developers.google.com/maps/documentation/places/web-service/place-details | Requiere facturación y respeta atribución/licencia |
| UN Comtrade | Comercio internacional por producto y país | https://uncomtrade.org/docs/un-comtrade-api/ | Solo expansión; no prueba demanda local |

Cada consulta registra proveedor, fecha, parámetros, respuesta resumida, fuente y motivo de fallo. Los estados posibles son `missing_key`, `rejected`, `quota_exceeded`, `unavailable`, `no_results` y `ok`.
