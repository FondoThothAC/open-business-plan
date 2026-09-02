import { useState } from "react";
import { Table, CheckCircle2, Shield, Info, HelpCircle } from "lucide-react";

export default function RACIMatrix({ planData }) {
  const [filterArea, setFilterArea] = useState("all");

  const roles = [
    { id: "DG", title: "Director General (CEO)", area: "Dirección" },
    { id: "COO", title: "Gerente de Operaciones (COO)", area: "Operaciones" },
    { id: "COM", title: "Gerente Comercial B2B", area: "Ventas" },
    { id: "CFO", title: "Gerente de Finanzas (CFO)", area: "Finanzas" },
    { id: "GIoT", title: "Gerente de Calidad e IoT", area: "Calidad" },
    { id: "SUP", title: "Supervisor Metrología Láser", area: "Operaciones" },
    { id: "LCAMP", title: "Líder Servicio Campo y Grúas", area: "Campo" },
    { id: "TOR6", title: "Tornero Industrial 6m (A)", area: "Operaciones" },
    { id: "CNC", title: "Operador Fresadora CNC", area: "Operaciones" },
    { id: "TCR", title: "Técnico Clean Room ISO 4406", area: "Calidad" },
    { id: "TBAN", title: "Técnico Banco Pruebas 5k PSI", area: "Operaciones" },
    { id: "TIoT", title: "Técnico Telemetría SensoNODE", area: "Campo" },
    { id: "EJEC", title: "Ejecutivo Cuentas Mineras", area: "Ventas" },
    { id: "CXC", title: "Jefe de Nómina y Cartera 90d", area: "Finanzas" }
  ];

  const tasks = [
    { id: "t1", name: "Negociación de Contratos Marco Mineros Tier-1", RACI: { DG: "A", COM: "R", CFO: "C", EJEC: "R" } },
    { id: "t2", name: "Cobranza y Factoraje del Ciclo Minero a 90 Días", RACI: { DG: "I", CFO: "A", CXC: "R", COM: "C" } },
    { id: "t3", name: "Recepción, Desarme y Metrología Láser", RACI: { COO: "A", SUP: "R", LCAMP: "C" } },
    { id: "t4", name: "Maquinado en Torno 6m y Fresado CNC", RACI: { COO: "A", SUP: "C", TOR6: "R", CNC: "R" } },
    { id: "t5", name: "Ensamble en Clean Room y Conteo ISO 4406", RACI: { GIoT: "A", TCR: "R", COO: "I" } },
    { id: "t6", name: "Prueba Hidrostática a 5,000 PSI y Certificación", RACI: { COO: "A", TBAN: "R", GIoT: "C" } },
    { id: "t7", name: "Instalación de Sensores IoT Parker SensoNODE", RACI: { GIoT: "A", LCAMP: "R", TIoT: "R" } },
    { id: "t8", name: "Monitoreo en Nube VOM y Despacho Predictivo", RACI: { GIoT: "R", LCAMP: "C", EJEC: "I" } }
  ];

  const renderBadge = (type) => {
    switch(type) {
      case "R": return <span style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "2px 8px", borderRadius: "6px", fontWeight: 800, fontSize: "0.75rem" }} title="Responsable de ejecutar">R</span>;
      case "A": return <span style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: "6px", fontWeight: 800, fontSize: "0.75rem" }} title="Aprueba / Rinde cuentas">A</span>;
      case "C": return <span style={{ background: "#fefce8", color: "#ca8a04", border: "1px solid #fef08a", padding: "2px 8px", borderRadius: "6px", fontWeight: 800, fontSize: "0.75rem" }} title="Consultado">C</span>;
      case "I": return <span style={{ background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", padding: "2px 8px", borderRadius: "6px", fontWeight: 800, fontSize: "0.75rem" }} title="Informado">I</span>;
      default: return <span style={{ color: "#cbd5e1" }}>-</span>;
    }
  };

  return (
    <div style={{
      marginTop: "1.5rem",
      marginBottom: "2rem",
      background: "#ffffff",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      padding: "1.5rem",
      boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem" }}>
        <div>
          <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: 0, fontFamily: "var(--font-display)" }}>
            📋 Matriz de Asignación de Responsabilidades y Funciones (RACI Matrix)
          </h4>
          <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "3px 0 0 0" }}>
            Distribución operativa de los 14 puestos clave frente a los procesos críticos del modelo MaaS
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><strong style={{ color: "#2563eb" }}>R:</strong> Responsable</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><strong style={{ color: "#16a34a" }}>A:</strong> Aprueba</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><strong style={{ color: "#ca8a04" }}>C:</strong> Consulta</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><strong style={{ color: "#64748b" }}>I:</strong> Informa</span>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "center" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ textAlign: "left", padding: "0.75rem 1rem", minWidth: "240px", color: "#334155", fontWeight: 800 }}>Proceso / Función Clave</th>
              {roles.map(r => (
                <th key={r.id} style={{ padding: "0.6rem 0.4rem", color: "#475569", fontWeight: 700, minWidth: "55px" }} title={r.title}>
                  <div>{r.id}</div>
                  <div style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 500 }}>{r.area.slice(0, 4)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((t, idx) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#ffffff" : "#fafafa" }}>
                <td style={{ textAlign: "left", padding: "0.75rem 1rem", fontWeight: 600, color: "#1e293b" }}>
                  {t.name}
                </td>
                {roles.map(r => (
                  <td key={r.id} style={{ padding: "0.6rem 0.4rem" }}>
                    {renderBadge(t.RACI[r.id])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
