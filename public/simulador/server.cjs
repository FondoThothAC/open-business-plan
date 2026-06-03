var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  const aiAnalyzeHandler = async (req, res) => {
    try {
      const { prompt, provider = "gemini", ollamaUrl, model = "gemma2:2b" } = req.body;
      if (provider === "ollama") {
        const targetOllamaHost = ollamaUrl || process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
        const cleanHost = targetOllamaHost.replace(/\/$/, "");
        const modelToUse = model || process.env.OLLAMA_MODEL || "gemma2:2b";
        console.log(`[AI-LOCAL] Requesting Ollama generation. Host: ${cleanHost}, Model: ${modelToUse}`);
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6e4);
          const response2 = await fetch(`${cleanHost}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: modelToUse,
              prompt,
              stream: false
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (!response2.ok) {
            throw new Error(`Servidor Ollama respondi\xF3 con c\xF3digo ${response2.status}`);
          }
          const data = await response2.json();
          return res.json({
            text: data.response || `No se recibi\xF3 respuesta v\xE1lida del modelo ${modelToUse}.`,
            provider: "ollama",
            model: modelToUse,
            host: cleanHost
          });
        } catch (ollamaErr) {
          console.error("Local Ollama Error:", ollamaErr);
          let alertMsg = `\u274C **Error de conexi\xF3n con IA Local (Ollama)**

`;
          alertMsg += `No pudimos establecer comunicaci\xF3n con el servidor Ollama en: \`${cleanHost}\`.

`;
          alertMsg += `**Siga estos sencillos pasos para habilitarlo en su entorno o cl\xFAster Antigravity:**
`;
          alertMsg += `1. Aseg\xFArese de que Ollama est\xE9 corriendo en su m\xE1quina (\`ollama serve\` o la aplicaci\xF3n de escritorio).
`;
          alertMsg += `2. **Importante (CORS):** Para habilitar peticiones desde el navegador o contenedores proxy, configure la variable de entorno de Ollama: \`OLLAMA_ORIGINS=* o OLLAMA_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"\`.
`;
          alertMsg += `3. Descargue el modelo liviano recomendado ejecutando en su terminal:
   \`ollama pull ${modelToUse}\`
`;
          alertMsg += `4. Alternativamente, intente usar la direcci\xF3n IP de su m\xE1quina en lugar de \`localhost\` si est\xE1 corriendo este servidor en un contenedor virtualizado (ej. \`http://host.docker.internal:11434\` o una IP de red local).

`;
          alertMsg += `*Detalle t\xE9cnico:* ${ollamaErr.message || "Timeout / Connection Refused"}`;
          return res.json({ text: alertMsg, isConfigureInstructions: true });
        }
      }
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          text: "\u26A0\uFE0F **Llave de API (GEMINI_API_KEY) no configurada.**\n\nPor favor, en AI Studio configure su API Key de Gemini de manera segura en **Settings > Secrets**, o cambie al **Motor de IA Local (Ollama)** en las opciones superiores de este panel para usar modelos fuera de l\xEDnea compatibles con Antigravity (estilo Gemma, Llama o Qwen)."
        });
      }
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      res.json({ text: response.text || "", provider: "gemini" });
    } catch (err) {
      console.error("Gemini Error:", err);
      res.status(500).json({ error: err.message || "Error al procesar la solicitud con Gemini" });
    }
  };
  app.post("/api/analyze", aiAnalyzeHandler);
  app.post("/api/gemini", aiAnalyzeHandler);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
