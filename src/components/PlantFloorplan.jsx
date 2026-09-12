import React, { useState } from 'react';
import { Layers, ShieldCheck, Maximize2, Info, Compass, Box, Thermometer, Wind } from 'lucide-react';

/**
 * Componente de Plano Arquitectónico y Metrología de Planta Industrial (SVG Nativo + CSS Grid)
 * Basado en especificaciones NOM-008-ZOO-1994, SENASICA y lineamientos USDA/FSIS.
 * Superficie total: 1,200 m² (40m ancho × 30m fondo).
 */
export default function PlantFloorplan({
  plantName = 'Plano de planta industrial',
  totalAreaM2 = 1200,
  dimensions = "40.0 m × 30.0 m"
}) {
  const [activeZone, setActiveZone] = useState(null);

  const zones = [
    {
      id: "recepcion",
      name: "Zona Negra: Recepción y Andén",
      area: "200 m² (10m × 20m)",
      color: "#94a3b8",
      bgFill: "#f1f5f9",
      temp: "Ambiente / 12°C",
      desc: "Andén de descarga refrigerado con sello hermético, báscula de piso de 2 toneladas e inspección zoosanitaria inicial."
    },
    {
      id: "aduana",
      name: "Filtro Sanitario y Oficinas SENASICA",
      area: "150 m² (10m × 15m)",
      color: "#64748b",
      bgFill: "#e2e8f0",
      temp: "20°C Climatizado",
      desc: "Aduana sanitaria con vado desinfectante de botas, lavamanos automáticos, vestidores y oficina de inspector veterinario."
    },
    {
      id: "porcionado",
      name: "Zona Gris: Despiece y Porcionado",
      area: "250 m² (15m × 16.6m)",
      color: "#0284c7",
      bgFill: "#e0f2fe",
      temp: "≤ 10°C Controlada",
      desc: "Salas de despiece con mesas de acero inoxidable 304, sierras sinfín sanitarias y porcionado exacto de cortes Rib-Eye (400g)."
    },
    {
      id: "coccion",
      name: "Zona Blanca: Cocción ASADHOR",
      area: "250 m² (15m × 16.6m)",
      color: "#ea580c",
      bgFill: "#ffedd5",
      temp: "75°C Térmica Interna",
      desc: "Línea continua de 5 hornos industriales ASADHOR automatizados con extracción de humos y campana de aire compensado."
    },
    {
      id: "empaque",
      name: "Zona Estéril: Túnel IQF y Empaque",
      area: "200 m² (15m × 13.3m)",
      color: "#16a34a",
      bgFill: "#dcfce7",
      temp: "≤ 4°C Sala / -40°C IQF",
      desc: "Túnel de congelación criogénico rápido IQF, selladoras de doble campana al alto vacío y detector de metales."
    },
    {
      id: "camara_fria",
      name: "Almacén de Congelación (-20°C)",
      area: "150 m² (10m × 15m)",
      color: "#2563eb",
      bgFill: "#dbeafe",
      temp: "-20°C Congelación",
      desc: "Cámara frigorífica con capacidad de 25 toneladas para producto terminado en pallets con temperatura trazable para exportación."
    }
  ];

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1.25rem',
      color: '#1e293b',
      fontFamily: 'var(--font-body, system-ui, sans-serif)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
    }}>
      {/* HEADER METROLÓGICO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={20} color="var(--accent-color, #6366f1)" />
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              {plantName}
            </h4>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Distribución Sanitaria de Flujo Unidireccional (Evita Contaminación Cruzada) • Escala Real 1:100
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
            Área Total: {totalAreaM2} m²
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
            Cotas: {dimensions}
          </span>
        </div>
      </div>

      {/* PLANO SVG NATIVO INTERACTIVO */}
      <div style={{ width: '100%', overflowX: 'auto', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0.75rem' }}>
        <svg 
          viewBox="0 0 880 540" 
          style={{ width: '100%', height: 'auto', display: 'block', minWidth: '650px' }}
        >
          {/* CUADRÍCULA DE FONDO (METROLOGÍA 2m x 2m) */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            </pattern>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
            </marker>
          </defs>
          <rect width="880" height="540" fill="#f8fafc" />
          <rect x="40" y="40" width="800" height="460" fill="url(#grid)" stroke="#94a3b8" strokeWidth="2.5" />

          {/* COTAS EXTERIORES */}
          <text x="440" y="26" textAnchor="middle" fontSize="11" fontWeight="700" fill="#475569">40.00 METROS (FRENTE)</text>
          <line x1="40" y1="30" x2="840" y2="30" stroke="#94a3b8" strokeWidth="1" />
          <text x="18" y="275" textAnchor="middle" fontSize="11" fontWeight="700" fill="#475569" transform="rotate(-90, 18, 275)">30.00 METROS (FONDO)</text>
          <line x1="26" y1="40" x2="26" y2="500" stroke="#94a3b8" strokeWidth="1" />

          {/* 1. ZONA NEGRA: RECEPCIÓN Y ANDÉN (X:40, Y:40, W:260, H:260) */}
          <g 
            onMouseEnter={() => setActiveZone('recepcion')} 
            onMouseLeave={() => setActiveZone(null)}
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <rect x="40" y="40" width="260" height="260" fill={activeZone === 'recepcion' ? '#e2e8f0' : '#f1f5f9'} stroke="#94a3b8" strokeWidth="2" />
            <text x="50" y="65" fontSize="12" fontWeight="800" fill="#334155">ZONA NEGRA: RECEPCIÓN</text>
            <text x="50" y="82" fontSize="10" fontWeight="600" fill="#64748b">Andén Carga/Descarga (200 m²)</text>
            
            {/* Equipamiento: Andenes */}
            <rect x="50" y="100" width="100" height="45" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
            <text x="100" y="127" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1e293b">Rampa 1 (Descarga)</text>
            
            <rect x="50" y="160" width="100" height="45" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
            <text x="100" y="187" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1e293b">Rampa 2 (Embarque)</text>

            <rect x="170" y="100" width="110" height="105" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
            <text x="225" y="145" textAnchor="middle" fontSize="9" fontWeight="700" fill="#475569">Báscula 2 Ton</text>
            <text x="225" y="165" textAnchor="middle" fontSize="8" fill="#64748b">Inspección Sanitaria</text>
          </g>

          {/* 2. ADUANA SANITARIA Y OFICINAS (X:40, Y:300, W:260, H:200) */}
          <g 
            onMouseEnter={() => setActiveZone('aduana')} 
            onMouseLeave={() => setActiveZone(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect x="40" y="300" width="260" height="200" fill={activeZone === 'aduana' ? '#cbd5e1' : '#e2e8f0'} stroke="#64748b" strokeWidth="2" />
            <text x="50" y="325" fontSize="12" fontWeight="800" fill="#1e293b">ADUANA SANITARIA</text>
            <text x="50" y="342" fontSize="10" fontWeight="600" fill="#64748b">Filtros & Oficinas (150 m²)</text>
            
            <rect x="50" y="360" width="115" height="60" rx="4" fill="#f8fafc" stroke="#94a3b8" />
            <text x="107" y="395" textAnchor="middle" fontSize="9" fontWeight="700" fill="#334155">Oficina SENASICA</text>

            <rect x="50" y="430" width="115" height="55" rx="4" fill="#f8fafc" stroke="#94a3b8" />
            <text x="107" y="462" textAnchor="middle" fontSize="9" fontWeight="700" fill="#334155">Vestidores & Baños</text>

            <rect x="180" y="360" width="105" height="125" rx="4" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="232" y="415" textAnchor="middle" fontSize="9" fontWeight="800" fill="#1d4ed8">Aduana Limpia</text>
            <text x="232" y="435" textAnchor="middle" fontSize="8" fill="#1e40af">Vado + Lavamanos</text>
          </g>

          {/* 3. ZONA GRIS: DESPIECE Y PORCIONADO (X:300, Y:40, W:270, H:260) */}
          <g 
            onMouseEnter={() => setActiveZone('porcionado')} 
            onMouseLeave={() => setActiveZone(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect x="300" y="40" width="270" height="260" fill={activeZone === 'porcionado' ? '#bae6fd' : '#e0f2fe'} stroke="#0284c7" strokeWidth="2" />
            <text x="310" y="65" fontSize="12" fontWeight="800" fill="#0369a1">ZONA GRIS: PORCIONADO</text>
            <text x="310" y="82" fontSize="10" fontWeight="600" fill="#0284c7">Sala de Despiece (250 m²) • ≤10°C</text>

            {/* Mesas de trabajo Acero Inox */}
            <rect x="320" y="110" width="105" height="40" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
            <text x="372" y="134" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0369a1">Mesa Despiece A</text>

            <rect x="320" y="170" width="105" height="40" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
            <text x="372" y="194" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0369a1">Mesa Despiece B</text>

            <rect x="445" y="110" width="110" height="100" rx="4" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
            <text x="500" y="155" textAnchor="middle" fontSize="9" fontWeight="800" fill="#0284c7">Porcionadora</text>
            <text x="500" y="175" textAnchor="middle" fontSize="8" fill="#0369a1">Rib-Eye 400g</text>
          </g>

          {/* 4. ZONA BLANCA: COCCIÓN INDUSTRIAL ASADHOR (X:570, Y:40, W:270, H:260) */}
          <g 
            onMouseEnter={() => setActiveZone('coccion')} 
            onMouseLeave={() => setActiveZone(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect x="570" y="40" width="270" height="260" fill={activeZone === 'coccion' ? '#fed7aa' : '#ffedd5'} stroke="#ea580c" strokeWidth="2" />
            <text x="580" y="65" fontSize="12" fontWeight="800" fill="#c2410c">ZONA BLANCA: ASADHOR</text>
            <text x="580" y="82" fontSize="10" fontWeight="600" fill="#ea580c">Línea de Asado Térmico (250 m²)</text>

            {/* Batería de 5 Hornos ASADHOR */}
            <rect x="585" y="105" width="45" height="65" rx="3" fill="#ffffff" stroke="#ea580c" strokeWidth="1.5" />
            <text x="607" y="142" textAnchor="middle" fontSize="8" fontWeight="800" fill="#c2410c">H-1</text>

            <rect x="635" y="105" width="45" height="65" rx="3" fill="#ffffff" stroke="#ea580c" strokeWidth="1.5" />
            <text x="657" y="142" textAnchor="middle" fontSize="8" fontWeight="800" fill="#c2410c">H-2</text>

            <rect x="685" y="105" width="45" height="65" rx="3" fill="#ffffff" stroke="#ea580c" strokeWidth="1.5" />
            <text x="707" y="142" textAnchor="middle" fontSize="8" fontWeight="800" fill="#c2410c">H-3</text>

            <rect x="735" y="105" width="45" height="65" rx="3" fill="#ffffff" stroke="#ea580c" strokeWidth="1.5" />
            <text x="757" y="142" textAnchor="middle" fontSize="8" fontWeight="800" fill="#c2410c">H-4</text>

            <rect x="785" y="105" width="45" height="65" rx="3" fill="#ffffff" stroke="#ea580c" strokeWidth="1.5" />
            <text x="807" y="142" textAnchor="middle" fontSize="8" fontWeight="800" fill="#c2410c">H-5</text>

            <rect x="585" y="185" width="245" height="35" rx="4" fill="#fed7aa" stroke="#c2410c" strokeWidth="1" strokeDasharray="4,2" />
            <text x="707" y="207" textAnchor="middle" fontSize="9" fontWeight="700" fill="#9a3412">Campana Extracción con Filtros Electrostáticos</text>
          </g>

          {/* 5. ZONA ESTÉRIL: IQF Y EMPAQUE ALTO VACÍO (X:570, Y:300, W:270, H:200) */}
          <g 
            onMouseEnter={() => setActiveZone('empaque')} 
            onMouseLeave={() => setActiveZone(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect x="570" y="300" width="270" height="200" fill={activeZone === 'empaque' ? '#bbf7d0' : '#dcfce7'} stroke="#16a34a" strokeWidth="2" />
            <text x="580" y="325" fontSize="12" fontWeight="800" fill="#15803d">ZONA ESTÉRIL: IQF & EMPAQUE</text>
            <text x="580" y="342" fontSize="10" fontWeight="600" fill="#16a34a">Pasteurización & Alto Vacío (200 m²)</text>

            {/* Túnel Criogénico IQF */}
            <rect x="585" y="360" width="130" height="55" rx="4" fill="#ffffff" stroke="#16a34a" strokeWidth="1.5" />
            <text x="650" y="388" textAnchor="middle" fontSize="9" fontWeight="800" fill="#166534">Túnel IQF (-40°C)</text>
            <text x="650" y="403" textAnchor="middle" fontSize="8" fill="#15803d">Choque Térmico 12 min</text>

            {/* Empacadoras Doble Campana */}
            <rect x="730" y="360" width="100" height="55" rx="4" fill="#ffffff" stroke="#16a34a" strokeWidth="1.5" />
            <text x="780" y="388" textAnchor="middle" fontSize="9" fontWeight="800" fill="#166534">Doble Campana</text>
            <text x="780" y="403" textAnchor="middle" fontSize="8" fill="#15803d">Alto Vacío Cryovac</text>

            <rect x="585" y="430" width="245" height="55" rx="4" fill="#ffffff" stroke="#16a34a" />
            <text x="707" y="460" textAnchor="middle" fontSize="9" fontWeight="700" fill="#14532d">Detector de Metales & Empaque Secundario en Cajas</text>
          </g>

          {/* 6. CÁMARA FRÍA DE CONSERVACIÓN (X:300, Y:300, W:270, H:200) */}
          <g 
            onMouseEnter={() => setActiveZone('camara_fria')} 
            onMouseLeave={() => setActiveZone(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect x="300" y="300" width="270" height="200" fill={activeZone === 'camara_fria' ? '#bfdbfe' : '#dbeafe'} stroke="#2563eb" strokeWidth="2" />
            <text x="310" y="325" fontSize="12" fontWeight="800" fill="#1e40af">CÁMARA FRÍA (-20°C)</text>
            <text x="310" y="342" fontSize="10" fontWeight="600" fill="#2563eb">Almacén de Exportación (150 m²)</text>

            {/* Racks de Almacenamiento */}
            <rect x="320" y="365" width="230" height="40" rx="3" fill="#ffffff" stroke="#2563eb" strokeWidth="1" />
            <text x="435" y="390" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1e40af">Racks Palletizados (Capacidad: 25 Ton)</text>

            <rect x="320" y="420" width="230" height="40" rx="3" fill="#ffffff" stroke="#2563eb" strokeWidth="1" />
            <text x="435" y="445" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1e40af">Esclusa Fría hacia Andén de Embarque</text>
          </g>

          {/* FLECHAS DE FLUJO UNIDIRECCIONAL */}
          <path d="M 240 90 L 320 90" stroke="#6366f1" strokeWidth="2.5" markerEnd="url(#arrow)" />
          <path d="M 450 90 L 580 90" stroke="#6366f1" strokeWidth="2.5" markerEnd="url(#arrow)" />
          <path d="M 700 240 L 700 350" stroke="#6366f1" strokeWidth="2.5" markerEnd="url(#arrow)" />
          <path d="M 580 430 L 460 430" stroke="#6366f1" strokeWidth="2.5" markerEnd="url(#arrow)" />
        </svg>
      </div>

      {/* DETALLE DE LA ZONA ACTIVA Y LEYENDA SANITARIA */}
      <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.6rem' }}>
        {zones.map((z) => {
          const isSelected = activeZone === z.id;
          return (
            <div
              key={z.id}
              onClick={() => setActiveZone(isSelected ? null : z.id)}
              style={{
                padding: '0.6rem 0.75rem',
                borderRadius: '8px',
                background: isSelected ? z.bgFill : '#f8fafc',
                border: `1.5px solid ${isSelected ? z.color : '#e2e8f0'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: z.color }}>
                  {z.name.split(':')[0]}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                  {z.temp}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>
                {z.name.split(':')[1] || z.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.3 }}>
                {z.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
