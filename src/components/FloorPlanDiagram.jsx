import { useMemo } from "react";
import MermaidViewer from "./MermaidViewer";
import { LayoutGrid, ShieldCheck } from "lucide-react";

export default function FloorPlanDiagram({ data, planData }) {
  const localText = typeof data === "string" ? data : (data?.local || planData?.tecnico?.ubicacion?.local || "");
  
  const isIndustrial = Boolean(
    localText.toLowerCase().includes("taller") || 
    localText.toLowerCase().includes("bahía") || 
    localText.toLowerCase().includes("clean room") ||
    localText.toLowerCase().includes("torno") ||
    localText.toLowerCase().includes("maquinado") ||
    planData?.semilla?.proyecto?.toLowerCase().includes("cuantico")
  );

  const mermaidChart = useMemo(() => {
    if (isIndustrial) {
      return "flowchart LR\n" +
        "  subgraph ACCESO [\"🚪 Acceso y Logística (150 m²)\"]\n" +
        "    A1[\"🚛 Patio de Maniobras\"] --> A2[\"📦 Recepción / Telemetría QR\"]\n" +
        "  end\n" +
        "  subgraph BAHIA1 [\"🧼 Bahía 1: Desarme y Lavado (150 m²)\"]\n" +
        "    B1[\"🛠️ Mesa Desarme 10T\"] --> B2[\"🚿 Tina Lavado Ultrasónico\"]\n" +
        "  end\n" +
        "  subgraph BAHIA2 [\"⚙️ Bahía 2: Maquinado y Metrología (250 m²)\"]\n" +
        "    C1[\"📐 Metrología Láser\"] --> C2[\"🔩 Torno Paralelo 6m\"]\n" +
        "    C2 --> C3[\"⚙️ Fresadora CNC\"]\n" +
        "  end\n" +
        "  subgraph BAHIA3 [\"✨ Bahía 3: Clean Room ISO 4406 (120 m²)\"]\n" +
        "    D1[\"🚪 Esclusa Presurizada\"] --> D2[\"🔬 Ensamble Sellos Parker\"]\n" +
        "  end\n" +
        "  subgraph BAHIA4 [\"🧪 Bahía 4: Pruebas 5,000 PSI (130 m²)\"]\n" +
        "    E1[\"⚡ Banco Pruebas 5,000 PSI\"] --> E2[\"📈 Reporte Estanqueidad\"]\n" +
        "  end\n" +
        "  A2 --> B1\n" +
        "  B2 --> C1\n" +
        "  C3 --> D1\n" +
        "  D2 --> E1\n";
    }

    return "flowchart TD\n" +
      "  A[\"🚪 Recepción (15 m²)\"] --> B[\"💼 Consultoría (24 m²)\"]\n" +
      "  B --> C[\"📊 Sala de Juntas (20 m²)\"]\n";
  }, [localText, isIndustrial]);

  return (
    <div style={{
      marginTop: "1.25rem",
      marginBottom: "1.5rem",
      background: "#ffffff",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      padding: "1.5rem",
      boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ padding: "8px", background: "#eff6ff", borderRadius: "10px", color: "#3b82f6" }}>
            <LayoutGrid size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: 0, fontFamily: "var(--font-display)" }}>
              Croquis y Layout de Distribución Física del Taller (800 m² Techados)
            </h4>
            <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "2px 0 0 0" }}>
              Flujo lineal certificado bajo norma ISO 9001:2015 con 4 bahías técnicas independientes
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#f0fdf4", padding: "4px 10px", borderRadius: "20px", border: "1px solid #bbf7d0" }}>
          <ShieldCheck size={14} color="#16a34a" />
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#15803d" }}>Clean Room ISO 4406 Integrado</span>
        </div>
      </div>

      <div style={{ minHeight: "220px" }}>
        <MermaidViewer chart={mermaidChart} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9", fontSize: "0.75rem" }}>
        <div style={{ background: "#f8fafc", padding: "0.6rem 0.85rem", borderRadius: "8px", borderLeft: "3px solid #3b82f6" }}>
          <strong style={{ color: "#1e293b" }}>Bahía 1:</strong> Desensamble & Lavado Ultrasónico
        </div>
        <div style={{ background: "#f8fafc", padding: "0.6rem 0.85rem", borderRadius: "8px", borderLeft: "3px solid #64748b" }}>
          <strong style={{ color: "#1e293b" }}>Bahía 2:</strong> Torno 6m & Centro CNC
        </div>
        <div style={{ background: "#f8fafc", padding: "0.6rem 0.85rem", borderRadius: "8px", borderLeft: "3px solid #10b981" }}>
          <strong style={{ color: "#1e293b" }}>Bahía 3:</strong> Clean Room Presurizado
        </div>
        <div style={{ background: "#f8fafc", padding: "0.6rem 0.85rem", borderRadius: "8px", borderLeft: "3px solid #ef4444" }}>
          <strong style={{ color: "#1e293b" }}>Bahía 4:</strong> Banco de Pruebas 5,000 PSI
        </div>
      </div>
    </div>
  );
}
