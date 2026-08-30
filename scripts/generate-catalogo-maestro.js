#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const { FRAMEWORKS } = await import(path.join(ROOT,'src/config/frameworks.js'));
const { FIELD_GUIDES_MAP } = await import(path.join(ROOT,'src/lib/field_guides.js'));
let MODULE_BOX_MAP={};
try{ MODULE_BOX_MAP=(await import(path.join(ROOT,'src/config/moduleBoxMap.js'))).MODULE_BOX_MAP||{} }catch{}

// Fallback prompts for missing keys — curated from 13 libros (see libros/INDICE_PROMPTS_BOXES.md)
const FALLBACK = {
  necesidad: { instruccion:'Define con precisión el dolor, carencia o necesidad no resuelta del cliente objetivo. Detalla por qué las soluciones actuales son insuficientes.', ejemplo:'"Las empresas pierden 12h/mes por paros de bombas hidráulicas..."', benchmark:'Dolor cuantificable en tiempo/dinero/riesgo.', cita:'The Lean Startup (Ries, p.45)' },
  modelo_negocio: { instruccion:'Explica cómo la empresa genera ingresos, entrega valor y captura beneficios. Describe flujos de monetización y transacción.', ejemplo:'"Modelo híbrido B2B: venta directa sensores IoT + suscripción MaaS mensual..."', benchmark:'Margen bruto objetivo >40%.', cita:'Business Model Generation (Osterwalder, p.14)' },
  propuesta_valor: { instruccion:'Redacta la promesa única de valor que diferencia a la empresa de cualquier competidor. Debe ser concisa, atractiva y medible.', ejemplo:'"Garantizamos 99.2% disponibilidad con -35% costos correctivos..."', benchmark:'1 frase + 3 beneficios medibles.', cita:'Value Proposition Design (Osterwalder, p.28)' },
  imagen: { instruccion:'Define la personalidad de marca, tono de comunicación, elementos visuales clave y percepción deseada en el cliente.', ejemplo:'"Marca corporativo-industrial: robusta, tecnológica, confiable..."', benchmark:'Coherencia B2B/B2C.', cita:'Brand Positioning (Keller, p.95)' },
  tam: { instruccion:'Mercado Total Direccionable. Todo el mercado posible si no tuvieras límites.', ejemplo:'"3.2M profesionistas sin asesor = $9.6B anuales."', benchmark:'Fuente INEGI/AMPROFEC.', cita:'Anatomy of a Business Plan (Pinson, p.78)' },
  sam: { instruccion:'Mercado Alcanzable. La porción del TAM que podrías servir con tu modelo actual.', ejemplo:'"185k profesionistas en Sonora >$20k/mes = $370M."', benchmark:'SAM 10-30% TAM.', cita:'Anatomy (Pinson, p.78)' },
  som: { instruccion:'Mercado Obtenible. Rebanada realista que planeas capturar en 1-3 años.', ejemplo:'"0.5% SAM = 925 clientes $5.5M año 3."', benchmark:'SOM 1-5% SAM.', cita:'Anatomy (Pinson, p.78)' },
  perfil: { instruccion:'Características psicográficas: estilo de vida, valores, motivaciones y hábitos de compra.', ejemplo:'"Valora seguridad > riesgo. Investiga YouTube. Prefiere apps."', benchmark:'Persona validada con entrevistas.', cita:'Lean Customer Development' },
  sensibilidad_demanda: { instruccion:'Sensibilidad de la demanda ante precio, ingreso o variables macro. Elasticidad.', ejemplo:'"Elasticidad -0.28: priorizan SLA sobre precio."', benchmark:'|e|<1 inelástica.', cita:'Mankiw, Principios de Economía' },
  macro: { instruccion:'Análisis de la región, estado o ciudad elegida. Justifica con datos económicos y logísticos.', ejemplo:'"Hermosillo, Sonora: PIB $430B, hub financiero noroeste."', benchmark:'Datos INEGI/BANXICO.', cita:'Anatomy Ch.5' },
  micro: { instruccion:'Ubicación exacta dentro de la ciudad. Colonia, calle, accesibilidad, competencia cercana.', ejemplo:'"Col. Villa de Seris, Blvd. Rosales #245. Renta $12k/mes."', benchmark:'Accesibilidad y costo.', cita:'Anatomy Ch.5' },
  local: { instruccion:'Distribución física del espacio de trabajo. m², zonas y mobiliario.', ejemplo:'"Oficina 80m²: Recepción 15m², 2 oficinas 12m²..."', benchmark:'Eficiencia m²/persona.', cita:'QuickStart Ch.7' },
  diagrama: { instruccion:'Flujograma del proceso principal en Mermaid.js. Debe mostrar inicio, etapas y fin.', ejemplo:'"graph TD → A[Prospecto] → B[Diagnóstico] → C[Propuesta]"', benchmark:'5-7 nodos clave.', cita:'BPMN 2.0' },
  proceso: { instruccion:'Explicación paso a paso de cómo se entrega el servicio o se fabrica el producto.', ejemplo:'"1. Agenda cita (app). 2. Diagnóstico 1h. 3. Diseño portafolio 48h..."', benchmark:'SLA por etapa.', cita:'Operations Management' },
  tecnologia: { instruccion:'Tecnología específica usada y su ventaja.', ejemplo:'"Telemetría IoT Parker SensoNODE + banco 5,000 PSI."', benchmark:'TRL ≥6.', cita:'The Nature of Value' },
  economias_escala: { instruccion:'Economías de escala y alcance que reducen costo unitario al crecer.', ejemplo:'"Costo sensor baja 18% al pasar de 100 a 1,000 unidades."', benchmark:'Curva experiencia 80%.', cita:'Porter' },
  tipo_proceso: { instruccion:'Tipo de proceso productivo: continuo, intermitente, por proyecto.', ejemplo:'"Taller job-shop para overhaul + línea para refacciones."', benchmark:'Coherencia con volumen.', cita:'Hayes & Wheelwright' },
  maquinaria: { instruccion:'Listado de equipo especializado con marca, modelo, costo y vida útil estimada.', ejemplo:'"2 MacBook Pro M3 ($45k c/u). Servidor NAS $18k. Total $120k."', benchmark:'Vida útil 3-5 años.', cita:'Anatomy Ch.6' },
  equipo: { instruccion:'Mobiliario de oficina, vehículos y equipo de cómputo general.', ejemplo:'"4 escritorios $8k, 6 sillas $5k, Proyector $15k. Total $77k."', benchmark:'CAPEX mueble.', cita:'Anatomy Ch.6' },
  herramientas: { instruccion:'Software, licencias, suscripciones y herramientas digitales necesarias.', ejemplo:'"HubSpot $0, Adobe $600/mes, Zoom $250/mes, Bloomberg $24k/año."', benchmark:'OPEX digital.', cita:'Burn p.67' },
  materia_prima: { instruccion:'Insumos principales para operar. En servicios: materiales de soporte, plataformas, data.', ejemplo:'"Datos Reuters $5k/mes, Papelería $2k/mes, CNBV gratuito."', benchmark:'Stock seguridad 15 días.', cita:'SCM' },
  proveedores: { instruccion:'Lista de proveedores clave con nombre, ubicación, condiciones de pago y alternativas.', ejemplo:'"AWS (hosting $1k crédito), GraficSon 30d, DigitalOcean alt."', benchmark:'≥2 proveedores críticos.', cita:'Fisher' },
  compras: { instruccion:'Política de adquisiciones: frecuencia, volumen mínimo, control de calidad, inventario de seguridad.', ejemplo:'"Papelería mensual, software anual -3 cotizaciones, pago 30d."', benchmark:'EOQ.', cita:'SCM' },
  instalada: { instruccion:'Capacidad instalada teórica vs efectiva y % utilización.', ejemplo:'"Torno 6m: 1,800 hrs/año teóricas, 1,350 efectivas (75%)."', benchmark:'OEE >80%.', cita:'TPM' },
  inventarios: { instruccion:'Método de control de existencias (PEPS, UEPS, ABC) y software utilizado.', ejemplo:'"PEPS en Excel con alerta stock mínimo."', benchmark:'Rotación >6x.', cita:'SCM' },
  mano_obra: { instruccion:'Personal necesario por área con perfil, cantidad, turno y tipo de contratación.', ejemplo:'"2 asesores planta, 1 community medio tiempo, 1 contador outsourcing."', benchmark:'Productividad p/empleado.', cita:'Human Capital' },
  punto_reorden: { instruccion:'Nivel mínimo de existencias que dispara orden de compra.', ejemplo:'"Mangueras: ROP 15u (lead 5d). Sellos 50 sets."', benchmark:'ROP = d·L + SS.', cita:'SCM' },
  otd: { instruccion:'On-Time Delivery: % entregas a tiempo vs compromiso.', ejemplo:'"Meta OTD 98.5% Tier1, monitoreo ERP semanal."', benchmark:'OTD ≥95%.', cita:'QuickStart Ch.8' },
  rotacion: { instruccion:'Rotación de Inventarios: veces que se renueva stock/año.', ejemplo:'"Rotación objetivo 6.0x/año (60d permanencia)."', benchmark:'>4x.', cita:'SCM' },
  dso: { instruccion:'Days Sales Outstanding: días promedio de cobro.', ejemplo:'"DSO objetivo 45d mineras, 30d contratistas."', benchmark:'<45d.', cita:'QuickStart' },
  dpo: { instruccion:'Days Payable Outstanding: días promedio de pago a proveedores.', ejemplo:'"DPO 60d con OEM mangueras."', benchmark:'>45d.', cita:'SCM' },
  ccc: { instruccion:'Cash Conversion Cycle: días que toma convertir inventario en flujo de caja.', ejemplo:'"CCC = DIO 60 + DSO 45 - DPO 60 = 45d."', benchmark:'<60d.', cita:'Brealey & Myers' },
  impacto: { instruccion:'Efectos de tu operación en medio ambiente. Consumo, residuos, emisiones.', ejemplo:'"Oficina 450 kWh/mes, 2.3 ton CO₂/año."', benchmark:'Huella <2 ton/empleado.', cita:'SEMARNAT NOM-161' },
  mitigacion: { instruccion:'Acciones concretas para reducir impacto ambiental. Metas y plazos.', ejemplo:'"2025 firmas digitales 100%, 2026 solar -60%."', benchmark:'Science Based Targets.', cita:'GRI' },
  normatividad: { instruccion:'Leyes ambientales aplicables y nivel de cumplimiento actual.', ejemplo:'"Cumplimos NOM-161, exentos LAU bajo impacto."', benchmark:'100% cumplimiento.', cita:'LGEEPA' },
  organigrama_visual: { instruccion:'Código Mermaid.js que genera el organigrama jerárquicamente.', ejemplo:'"graph TD → CEO → Dir. Financiero + Dir. Comercial"', benchmark:'5-7 niveles máx.', cita:'Mintzberg' },
  puestos: { instruccion:'Listado de puestos clave y su justificación.', ejemplo:'"14 puestos clave en 4 áreas: Dirección (1), Operaciones (7)..."', benchmark:'Span control 5-7.', cita:'Greiner' },
  funciones: { instruccion:'Tabla de responsabilidades de cada puesto clave. Qué hace, a quién reporta, KPIs.', ejemplo:'"Director Comercial: Captación, embudo, reporta CEO. KPI 50 clientes/mes."', benchmark:'RACI.', cita:'Human Capital' },
  reclutamiento: { instruccion:'Proceso de atracción y selección de talento. Fuentes, filtros y tiempos.', ejemplo:'"LinkedIn + OCC. Filtro CV → Entrevista → Caso → Contratación 3 sem."', benchmark:'Time-to-hire <30d.', cita:'SHRM' },
  contratacion: { instruccion:'Tipo de contrato, período de prueba, prestaciones y obligaciones patronales.', ejemplo:'"Indeterminado 3m prueba, prestaciones ley + SGMM 6º mes."', benchmark:'Rotación <15%.', cita:'LFT' },
  sueldos: { instruccion:'Tabla salarial por puesto incluyendo sueldo bruto, neto, prestaciones y costo total.', ejemplo:'"Asesor Jr $15k + comisiones, Sr $25k + bono, Dir $40k +2% ventas."', benchmark:'Compensación mercado +10%.', cita:'Mercer' },
  inversion_fija: { instruccion:'Activos tangibles no corrientes indispensables (bancos prueba, vehículos, maquinaria).', ejemplo:'"Taller Hermosillo $4.5M, banco pruebas $2.5M, IoT $1.8M."', benchmark:'CAPEX tangible >60% inversión.', cita:'Anatomy Ch.7' },
  inversion_diferida: { instruccion:'Activos intangibles y gastos pre-operativos (constitución, ISO, ERP).', ejemplo:'"ISO 9001/4406 $350k, constitución $150k, ERP $250k."', benchmark:'<15% inversión.', cita:'Anatomy Ch.7' },
  amortizacion_creditos: { instruccion:'Tabla y estrategia de servicio de deuda: capital, tasa, amortización y saldo insoluto.', ejemplo:'"Crédito $5M 48m TIIE+3.5%, amort $135k/mes."', benchmark:'DSCR >1.3x.', cita:'Brealey & Myers' },
  memorias_calculo: { instruccion:'Bases cuantitativas, supuestos de costos unitarios, tarifas y fórmulas de proyección.', ejemplo:'"Tarifa MaaS $68k/mes por camión, costo marginal $18.5k."', benchmark:'Supuestos trazables.', cita:'ONUDI' },
  relacion_bc: { instruccion:'Relación Beneficio-Costo (B/C): VP beneficios / VP costos.', ejemplo:'"B/C 1.38 a 12%: por $1 se generan $1.38 VP."', benchmark:'B/C >1.2.', cita:'ONUDI' },
  corrida_automatica: { instruccion:'Proyección financiera automatizada (FCF, ER y balances 5 años).', ejemplo:'"WACC 12%, TIR 15.11%, VAN $1.83M, payback 4.1a."', benchmark:'Modelo maestro.', cita:'Nature of Value Ch.5' },
  // Genérico para cualquier otro faltante
  generico: { instruccion:'Describe con rigor académico, ejecutivo y alineado a la propuesta de valor y ubicación del proyecto.', ejemplo:'"Redacción con enfoque analítico, sin relleno, con datos de INEGI/Banxico."', benchmark:'500-800 caracteres.', cita:'Field Guides Map' }
};

function guideFor(type, key){
  const map = FIELD_GUIDES_MAP[type] || {};
  const g = map[key];
  if(g) return {
    instruccion: g.instruccion || g.desc || FALLBACK[key]?.instruccion || FALLBACK.generico.instruccion,
    ejemplo: g.ejemplo || g.example || FALLBACK[key]?.ejemplo || '',
    benchmark: g.benchmark || FALLBACK[key]?.benchmark || '',
    cita: g.cita || (g.source ? `${g.source.book||''} ${g.source.page||''}`.trim() : '') || FALLBACK[key]?.cita || FALLBACK.generico.cita,
    placeholder: g.placeholder || ''
  };
  const fb = FALLBACK[key] || FALLBACK.generico;
  return { instruccion: fb.instruccion, ejemplo: fb.ejemplo, benchmark: fb.benchmark, cita: fb.cita, placeholder: '' };
}

let totalFields=0;
let md = `# 📋 Catálogo Maestro de Módulos, Textboxes y Prompts por Modelo

Este documento contiene la matriz completa de todos los **12 Modelos / Frameworks Documentales**, sus Pilares, Módulos, Campos de Entrada (Textboxes) y la estructura de Prompts e Instrucciones que utiliza la IA para cada uno.

> [!NOTE]
> Cada campo cuenta con una **Instrucción Principal**, **Ejemplo de Redacción**, **Benchmark / Criterio** y **Cita Metodológica**, los cuales ahora son 100% editables y personalizables desde el nuevo **PromptEditor Drawer** y persistentes en el \`PlanContext\`.

---

## 📑 Resumen General de Modelos y Cobertura

| ID Framework | Nombre del Modelo | Campos (Textboxes) | Enfoque Metodológico Principal |
|--------------|-------------------|--------------------|--------------------------------|
`;
Object.entries(FRAMEWORKS).forEach(([type, fw])=>{
  const fields = fw.pillars.reduce((a,p)=>a+p.modules.reduce((aa,m)=>aa+(m.fields?.length||0),0),0);
  totalFields+=fields;
  const enfoque = {
    business:'Tradicional integral, finanzas completas, estudio de mercado y técnico.',
    social_bid:'Matriz de Marco Lógico (MML), árbol de problemas/objetivos, gobernanza.',
    agile_startup:'Lean Startup, hipótesis críticas, validación de experimentos, runway/burn rate.',
    technology_id:'TRL (Technology Readiness Level), patentes IPC, transferencia tecnológica.',
    micro_business:'Plan ágil de 30 días, micro-canvas de 3 bloques, costos simplificados.',
    investment_project:'CAPEX CSI, WACC/VAN/TIR estocástico, análisis Tornado y Monte Carlo.',
    zopp:'Matriz de Planificación de Proyectos (MPP 4x4), análisis de involucrados.',
    horizon_europe:'Principio DNSH (Do No Significant Harm), ciencia abierta, consorcios I+D.',
    hoshin_kanri:'Matriz X, despliegue de políticas, Norte Verdadero.',
    amoeba_management:'Células autónomas, rentabilidad por hora por empleado, micro-P&L.',
    guanxi_plan:'Mianzi (prestigio/reputación), favores recíprocos, alineación estatal.',
    onudi_project:'FCFF, costo de capital ponderado, viabilidad técnica-industrial.'
  }[type]||'';
  md+=`| \`${type}\` | ${fw.name} | ${fields} campos | ${enfoque} |\n`;
});
md+=`\n---\n`;

let idx=0;
for(const [type, fw] of Object.entries(FRAMEWORKS)){
  idx++;
  const icono = ['🏢','🚀','🌐','🔬','🏪','🏗️','🎯','🧬','🤝','🏭','⚖️','🇪🇺'][idx-1]||'📦';
  md+=`\n## ${idx}. ${icono} Modelo: ${fw.name} (\`${type}\`)\n\n`;
  for(const pillar of fw.pillars){
    md+=`### 🏛️ Pilar: ${pillar.title} (\`${pillar.key}\`)\n\n`;
    for(const mod of pillar.modules){
      const boxes = MODULE_BOX_MAP[`${type}:${mod.key}`] || MODULE_BOX_MAP[mod.key] || [];
      const boxStr = boxes.length ? boxes.map(b=>`\`${b}\``).join(', ') : '—';
      md+=`#### 📦 Módulo: **${mod.title}** (\`${mod.key}\`)\n`;
      if(mod.description) md+=`_${esc(mod.description)}_\n\n`;
      md+=`**Boxes asociados:** ${boxStr}\n\n`;
      md+=`| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |\n|---|---|---|---|---|\n`;
      for(const fieldKey of (mod.fields||[])){
        const g = guideFor(type, fieldKey);
        // label bonito: clave con mayúscula y espacios
        const label = fieldKey.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase());
        md+=`| **${esc(label)}** | \`${fieldKey}\` | ${esc(g.instruccion)} | ${esc(g.ejemplo)} | **Bench:** ${esc(g.benchmark)}<br/>**Cita:** *${esc(g.cita)}* |\n`;
      }
      if((mod.fields||[]).length===0) md+=`| *(sin campos — solo visual/box)* | — | — | — | — |\n`;
      md+=`\n`;
    }
  }
}

md+=`---\n\n*Generado: ${new Date().toISOString()} — ${totalFields} textboxes en ${Object.keys(FRAMEWORKS).length} modelos — Fuente: \`FRAMEWORKS\` + \`FIELD_GUIDES_MAP\` + \`MODULE_BOX_MAP\` (${Object.keys(MODULE_BOX_MAP).length} entradas) — **279 textboxes, ~27 boxes**. Cada prompt es editable en 5 campos (Instrucción/Ejemplo/Benchmark/Cita/Placeholder) vía PromptEditor Drawer.*\n`;

function esc(s){ if(!s) return '—'; return String(s).replace(/\|/g,'\\|').replace(/\n/g,'<br>').replace(/\r/g,'').slice(0,1200); }

const out = path.join(ROOT,'docs/tabla_modulo_prompt.md');
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out, md, 'utf8');
console.log(`✅ ${out} — ${totalFields} textboxes, ${md.length} chars, ${md.split('\n').length} líneas`);
