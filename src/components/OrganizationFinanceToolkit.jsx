import React, { useEffect, useMemo, useState } from 'react';
import { usePlan } from '../context/PlanContext';
import { Wallet, Users, Briefcase, Plus, Trash2, ExternalLink } from 'lucide-react';
import { CIBERCAFE_CORRIDA, applyCorridaToPlan, getActiveCorrida } from '../lib/finanzas/corrida-cibercafe';
import { CorridaTemplatePanel } from './ModuloFinanciero';
import SimuladorModal from './SimuladorModal';

const formatCurrency = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Number(n || 0));

function readJson(raw, fallback) {
  if (!raw || typeof raw !== 'string') return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(fallback) ? (Array.isArray(parsed) ? parsed : fallback) : (parsed || fallback);
  } catch {
    return fallback;
  }
}

function isVariableOpex(row) {
  const label = `${row.categoria || ''} ${row.tipo || ''}`.toLowerCase();
  return label.includes('variable') || label.includes('comercial') || label.includes('venta');
}

function SummaryCard({ title, value, subtitle }) {
  return (
    <div className="glass-panel" style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)' }}>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</div>
      <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.2rem' }}>{value}</div>
      {subtitle && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{subtitle}</div>}
    </div>
  );
}

export default function OrganizationFinanceToolkit({ moduleKey }) {
  const { planData, updateSection } = usePlan();
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const activeCorridaRaw = planData?.organizacion?.estados_financieros?.corrida_importada || '';
  const activeCorrida = useMemo(() => getActiveCorrida(planData), [activeCorridaRaw, planData]);

  const handleLoadTemplate = () => {
    applyCorridaToPlan(updateSection, CIBERCAFE_CORRIDA);
  };

  const handleClearTemplate = () => {
    updateSection('organizacion', 'estados_financieros', 'corrida_importada', '');
  };

  const handleSimulatorExport = (payload) => {
    const indicators = `Resultados Simulador Avanzado FAPPA (${payload.scenarioName}):\n- TIR: ${(payload.tir*100).toFixed(2)}%\n- VAN: ${formatCurrency(payload.van)}\n- Relación B/C: ${payload.benefitCostRatio.toFixed(2)}\n- Payback: ${payload.payback.toFixed(1)} años.`;
    
    // 1. Rentabilidad Indicators
    updateSection('organizacion', 'rentabilidad', 'indicadores', indicators);
    
    // 2. CAPEX Total Investment
    updateSection('organizacion', 'inversion', 'capex', `Inversión total requerida (calculada por simulador): ${formatCurrency(payload.totalInvestment)}.`);
    
    // 3. Financing Structure
    if (payload.programInvestment !== undefined && payload.partnersInvestment !== undefined) {
      const financiamientoText = `Estructura de financiamiento recomendada:\n- Subsidio Gubernamental (FAPPA): ${formatCurrency(payload.programInvestment)} (${(payload.programInvestment / payload.totalInvestment * 100).toFixed(1)}%)\n- Aportación de Socios: ${formatCurrency(payload.partnersInvestment)} (${(payload.partnersInvestment / payload.totalInvestment * 100).toFixed(1)}%)`;
      updateSection('organizacion', 'inversion', 'financiamiento', financiamientoText);
    }
    
    // 4. Point of Equilibrium (Año 1)
    if (payload.breakevenAmount !== undefined && payload.breakevenPercentage !== undefined) {
      const ptoEquilibrioText = `Punto de equilibrio operativo (Año 1): Facturación anual mínima requerida de ${formatCurrency(payload.breakevenAmount)} (equivalente al ${(payload.breakevenPercentage * 100).toFixed(1)}% de la capacidad operativa estimada) para cubrir los gastos fijos y evitar pérdidas.`;
      updateSection('organizacion', 'rentabilidad', 'punto_equilibrio', ptoEquilibrioText);
    }
    
    alert('¡Datos exportados con éxito al Plan de Negocios!');
  };

  const TopPanel = () => (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button 
          onClick={() => setIsSimulatorOpen(true)}
          className="btn btn-primary"
          style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          <ExternalLink size={16} /> Abrir Simulador Avanzado (FAPPA)
        </button>
        <button 
          onClick={() => handleSimulatorExport({
            tir: 0.3842,
            van: 154300,
            benefitCostRatio: 1.34,
            payback: 2.8,
            totalInvestment: 245000,
            programInvestment: 180000,
            partnersInvestment: 65000,
            breakevenAmount: 165000,
            breakevenPercentage: 0.673,
            scenarioName: 'Cibercafé Optimista (Test Llenado)'
          })}
          className="btn btn-secondary"
          style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          Test de Llenado (Simulado)
        </button>
      </div>
      <CorridaTemplatePanel
        activeCorrida={activeCorrida}
        onLoad={handleLoadTemplate}
        onClear={handleClearTemplate}
      />
      <SimuladorModal 
        isOpen={isSimulatorOpen} 
        onClose={() => setIsSimulatorOpen(false)} 
        onExport={handleSimulatorExport}
      />
    </div>
  );

  if (moduleKey === 'inversion') return <><TopPanel /><CapexPanel planData={planData} updateSection={updateSection} /></>;
  if (moduleKey === 'costos') return <><TopPanel /><OpexPanel planData={planData} updateSection={updateSection} /></>;
  if (moduleKey === 'recursos_humanos') return <><TopPanel /><HrPanel planData={planData} updateSection={updateSection} /></>;

  return null;
}

function CapexPanel({ planData, updateSection }) {
  const moduleData = planData?.organizacion?.inversion || {};
  const defaultRows = [
    { id: 1, concepto: 'Equipo de cómputo', tipo: 'Tecnología', monto: 120000 },
    { id: 2, concepto: 'Mobiliario y oficina', tipo: 'Infraestructura', monto: 80000 },
    { id: 3, concepto: 'Licencias y software', tipo: 'Tecnología', monto: 50000 },
  ];
  const [rows, setRows] = useState(readJson(moduleData?.desglose_capex_json, defaultRows));

  useEffect(() => {
    setRows(readJson(moduleData?.desglose_capex_json, defaultRows));
  }, [moduleData?.desglose_capex_json]);

  const totals = useMemo(() => {
    const total = rows.reduce((acc, row) => acc + Number(row.monto || 0), 0);
    const byType = rows.reduce((acc, row) => {
      const key = row.tipo || 'Otros';
      acc[key] = (acc[key] || 0) + Number(row.monto || 0);
      return acc;
    }, {});
    return { total, byType };
  }, [rows]);

  const persist = (nextRows) => {
    setRows(nextRows);
    const total = nextRows.reduce((acc, row) => acc + Number(row.monto || 0), 0);
    updateSection('organizacion', 'inversion', 'desglose_capex_json', JSON.stringify(nextRows));
    updateSection('organizacion', 'inversion', 'capex', `Total estimado CAPEX: ${formatCurrency(total)}.`);
    updateSection('organizacion', 'inversion', 'opex_inicial', 'Capital de trabajo sugerido (3 meses de costos fijos) y arranque comercial inicial.');
    updateSection('organizacion', 'inversion', 'financiamiento', `Estructura sugerida: 60% capital propio y 40% financiamiento externo para ${formatCurrency(total)}.`);
  };

  const onRow = (id, field, value) => persist(rows.map((row) => row.id === id ? { ...row, [field]: field === 'monto' ? Number(value || 0) : value } : row));
  const addRow = () => persist([...rows, { id: Date.now(), concepto: '', tipo: 'Otros', monto: 0 }]);
  const removeRow = (id) => persist(rows.filter((row) => row.id !== id));

  return (
    <div className="glass-panel" style={{ padding: '1rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '0.85rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Briefcase size={16} /> Desglose CAPEX</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
        <SummaryCard title="Inversión total" value={formatCurrency(totals.total)} />
        <SummaryCard title="Partidas" value={String(rows.length)} />
        <SummaryCard title="Promedio por partida" value={formatCurrency(rows.length ? totals.total / rows.length : 0)} />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.3)' }}>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Concepto</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Tipo</th>
            <th style={{ textAlign: 'right', padding: '0.5rem' }}>Monto</th>
            <th style={{ width: 42 }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
              <td style={{ padding: '0.4rem' }}><input className="form-control" value={row.concepto} onChange={(e) => onRow(row.id, 'concepto', e.target.value)} /></td>
              <td style={{ padding: '0.4rem' }}><input className="form-control" value={row.tipo} onChange={(e) => onRow(row.id, 'tipo', e.target.value)} /></td>
              <td style={{ padding: '0.4rem' }}><input type="number" className="form-control" value={row.monto} onChange={(e) => onRow(row.id, 'monto', e.target.value)} /></td>
              <td style={{ textAlign: 'right', padding: '0.4rem' }}><button className="btn-icon" onClick={() => removeRow(row.id)} title="Eliminar"><Trash2 size={14} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem' }}>
        <button className="btn btn-secondary" onClick={addRow}><Plus size={14} /> <span>Agregar partida</span></button>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          {Object.entries(totals.byType).map(([k, v]) => `${k}: ${formatCurrency(v)}`).join(' · ')}
        </div>
      </div>
    </div>
  );
}

function OpexPanel({ planData, updateSection }) {
  const moduleData = planData?.organizacion?.costos || {};
  const defaultRows = [
    { id: 1, categoria: 'Operativo', concepto: 'Renta', mensual: 18000 },
    { id: 2, categoria: 'Administrativo', concepto: 'Nómina base', mensual: 40000 },
    { id: 3, categoria: 'Comercial', concepto: 'Marketing digital', mensual: 12000 },
  ];
  const [rows, setRows] = useState(readJson(moduleData?.desglose_opex_json, defaultRows));

  useEffect(() => {
    setRows(readJson(moduleData?.desglose_opex_json, defaultRows));
  }, [moduleData?.desglose_opex_json]);

  const totals = useMemo(() => {
    const totalMensual = rows.reduce((acc, row) => acc + Number(row.mensual || 0), 0);
    const totalAnual = totalMensual * 12;
    const byCat = rows.reduce((acc, row) => {
      const key = row.categoria || 'Otros';
      acc[key] = (acc[key] || 0) + Number(row.mensual || 0);
      return acc;
    }, {});
    return { totalMensual, totalAnual, byCat };
  }, [rows]);

  const persist = (nextRows) => {
    setRows(nextRows);
    const totalMensual = nextRows.reduce((acc, row) => acc + Number(row.mensual || 0), 0);
    const fijo = nextRows.filter((row) => !isVariableOpex(row)).reduce((acc, row) => acc + Number(row.mensual || 0), 0);
    const variable = Math.max(0, totalMensual - fijo);

    updateSection('organizacion', 'costos', 'desglose_opex_json', JSON.stringify(nextRows));
    updateSection('organizacion', 'costos', 'fijos', `${formatCurrency(fijo)} mensuales (fijos administrativos + operativos).`);
    updateSection('organizacion', 'costos', 'variables', `${formatCurrency(variable)} mensuales estimados variables/comerciales.`);
    updateSection('organizacion', 'costos', 'unitario', `Costo promedio unitario referencial: ${formatCurrency((totalMensual || 0) / Math.max(1, (planData?.semilla?.mercado?.clientes_estimados || 100)))} por cliente.`);
  };

  const onRow = (id, field, value) => persist(rows.map((row) => row.id === id ? { ...row, [field]: field === 'mensual' ? Number(value || 0) : value } : row));
  const addRow = () => persist([...rows, { id: Date.now(), categoria: 'Operativo', concepto: '', mensual: 0 }]);
  const removeRow = (id) => persist(rows.filter((row) => row.id !== id));

  return (
    <div className="glass-panel" style={{ padding: '1rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '0.85rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Wallet size={16} /> Desglose OPEX</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
        <SummaryCard title="Costo mensual" value={formatCurrency(totals.totalMensual)} />
        <SummaryCard title="Costo anual" value={formatCurrency(totals.totalAnual)} />
        <SummaryCard title="Partidas" value={String(rows.length)} />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.3)' }}>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Categoría</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Concepto</th>
            <th style={{ textAlign: 'right', padding: '0.5rem' }}>Mensual</th>
            <th style={{ width: 42 }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
              <td style={{ padding: '0.4rem' }}><input className="form-control" value={row.categoria} onChange={(e) => onRow(row.id, 'categoria', e.target.value)} /></td>
              <td style={{ padding: '0.4rem' }}><input className="form-control" value={row.concepto} onChange={(e) => onRow(row.id, 'concepto', e.target.value)} /></td>
              <td style={{ padding: '0.4rem' }}><input type="number" className="form-control" value={row.mensual} onChange={(e) => onRow(row.id, 'mensual', e.target.value)} /></td>
              <td style={{ textAlign: 'right', padding: '0.4rem' }}><button className="btn-icon" onClick={() => removeRow(row.id)} title="Eliminar"><Trash2 size={14} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem' }}>
        <button className="btn btn-secondary" onClick={addRow}><Plus size={14} /> <span>Agregar gasto</span></button>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          {Object.entries(totals.byCat).map(([k, v]) => `${k}: ${formatCurrency(v)}`).join(' · ')}
        </div>
      </div>
    </div>
  );
}

function HrPanel({ planData, updateSection }) {
  const staff = planData?.organizacion?.staff || [];
  const monthlyPayroll = staff.reduce((acc, row) => acc + Number(row.salary || 0), 0);

  const riskRates = {
    1: 0.0054355,
    2: 0.0113065,
    3: 0.0259840,
    4: 0.0465325,
    5: 0.0758875
  };

  const getIntegratedForEmployee = (row) => {
    const base = Number(row.salary || 0);
    const rate = riskRates[row.riskClass || 1] || riskRates[1];
    // Aportación Social IMSS General (15%), INFONAVIT (5%), ISN (3%), Provisiones (Aguinaldo, Prima vacacional)
    const socialCharges = 0.23 + rate;
    return base * (1 + socialCharges);
  };

  const integratedPayrollOnly = staff.reduce((acc, row) => acc + getIntegratedForEmployee(row), 0);

  const [payload, setPayload] = useState(readJson(planData?.organizacion?.recursos_humanos?.rh_metricas_json, {
    capacitacionMensual: 6000,
    rotacionPct: 8,
  }));

  const totalMensualNomina = integratedPayrollOnly + Number(payload.capacitacionMensual || 0);
  const totalAnualNomina = totalMensualNomina * 12;

  const persist = (next) => {
    setPayload(next);
    updateSection('organizacion', 'recursos_humanos', 'rh_metricas_json', JSON.stringify(next));
    updateSection('organizacion', 'recursos_humanos', 'sueldos', `Nómina mensual integrada (con IMSS, INFONAVIT, ISN y prestaciones): ${formatCurrency(totalMensualNomina)}. Nómina anual: ${formatCurrency(totalAnualNomina)}.`);
    updateSection('organizacion', 'recursos_humanos', 'contratacion', `Rotación meta anual: ${Number(next.rotacionPct || 0)}%. Enfoque: estabilidad y reclutamiento por perfil.`);
    updateSection('organizacion', 'recursos_humanos', 'reclutamiento', 'Estrategia mixta: referidos + bolsas de empleo especializadas + evaluaciones por competencias.');
  };

  const onField = (field, value) => persist({ ...payload, [field]: Number(value || 0) });

  const getRiskClassLabel = (val) => {
    switch(Number(val)) {
      case 1: return 'Clase I (0.54%)';
      case 2: return 'Clase II (1.13%)';
      case 3: return 'Clase III (2.60%)';
      case 4: return 'Clase IV (4.65%)';
      case 5: return 'Clase V (7.59%)';
      default: return 'Clase I (0.54%)';
    }
  };

  const getTypeLabel = (val) => {
    switch(val) {
      case 'temporal': return 'Temporal';
      case 'proyecto': return 'Proyecto';
      default: return 'Permanente';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1rem', marginTop: '1rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}><Users size={16} /> Tablero Recursos Humanos</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
        <SummaryCard title="Nómina Base Mensual" value={formatCurrency(monthlyPayroll)} />
        <SummaryCard title="Nómina Integrada Mensual" value={formatCurrency(totalMensualNomina)} subtitle="Con IMSS, INFONAVIT, ISN y Capacitación" />
        <SummaryCard title="Costo Anual RRHH" value={formatCurrency(totalAnualNomina)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Capacitación mensual ($)</label>
          <input type="number" className="form-control" value={payload.capacitacionMensual} onChange={(e) => onField('capacitacionMensual', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Rotación objetivo (%)</label>
          <input type="number" className="form-control" value={payload.rotacionPct} onChange={(e) => onField('rotacionPct', e.target.value)} />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.3)' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Puesto</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Tipo</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Riesgo IMSS</th>
              <th style={{ textAlign: 'right', padding: '0.5rem' }}>Salario Base</th>
              <th style={{ textAlign: 'right', padding: '0.5rem' }}>Carga Social</th>
              <th style={{ textAlign: 'right', padding: '0.5rem' }}>Salario Integrado</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((row) => {
              const base = Number(row.salary || 0);
              const integrated = getIntegratedSalaryForTable(row);
              const carga = integrated - base;
              function getIntegratedSalaryForTable(r) {
                const b = Number(r.salary || 0);
                const rate = riskRates[r.riskClass || 1] || riskRates[1];
                return b * (1 + 0.23 + rate);
              }
              return (
                <tr key={row.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                  <td style={{ padding: '0.45rem' }}>{row.role}</td>
                  <td style={{ padding: '0.45rem' }}>{getTypeLabel(row.type)}</td>
                  <td style={{ padding: '0.45rem' }}>{getRiskClassLabel(row.riskClass)}</td>
                  <td style={{ textAlign: 'right', padding: '0.45rem' }}>{formatCurrency(base)}</td>
                  <td style={{ textAlign: 'right', padding: '0.45rem', color: '#64748b' }}>{formatCurrency(carga)}</td>
                  <td style={{ textAlign: 'right', padding: '0.45rem', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(integrated)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
