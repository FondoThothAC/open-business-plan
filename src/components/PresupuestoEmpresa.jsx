import { useMemo } from 'react';
import { DollarSign, PieChart, TrendingUp, AlertCircle } from 'lucide-react';
import LiquidationReserveWidget from './LiquidationReserveWidget';

export default function PresupuestoEmpresa({ projections, staff = [], planData }) {
  const budget = useMemo(() => {
    const summaries = projections?.annualSummaries || [];
    const firstYear = summaries.find(s => Number(s.year) === 1) || {};
    
    // Ingresos Año 1
    const ingresosAnuales = firstYear.incomeStatement?.sales || 1020000;
    const ingresosMensuales = ingresosAnuales / 12;

    // Costos Fijos Año 1
    const nominaMensual = staff.reduce((acc, curr) => acc + (curr.salary || 0), 0);
    const costosFijosSimulador = firstYear.incomeStatement?.fixedCosts || 240000;
    const costosFijosMensuales = Math.max(nominaMensual, costosFijosSimulador / 12);

    // Costos Variables Año 1
    const costosVariablesSimulador = firstYear.incomeStatement?.variableCosts || 126000;
    const costosVariablesMensuales = costosVariablesSimulador / 12;

    // Inversión CAPEX
    const capex = projections?.netInitialInvestment || 450000;

    const totalGastosMensuales = costosFijosMensuales + costosVariablesMensuales;
    const saldoPresupuesto = ingresosMensuales - totalGastosMensuales;
    const porcentajeGastos = isFinite((totalGastosMensuales / Math.max(1, ingresosMensuales)) * 100) ? (totalGastosMensuales / Math.max(1, ingresosMensuales)) * 100 : 50;
    const porcentajeFijos = isFinite((costosFijosMensuales / Math.max(1, totalGastosMensuales)) * 100) ? (costosFijosMensuales / Math.max(1, totalGastosMensuales)) * 100 : 50;
    const porcentajeVariables = isFinite((costosVariablesMensuales / Math.max(1, totalGastosMensuales)) * 100) ? (costosVariablesMensuales / Math.max(1, totalGastosMensuales)) * 100 : 50;

    return {
      ingresosMensuales,
      costosFijosMensuales,
      costosVariablesMensuales,
      totalGastosMensuales,
      saldoPresupuesto,
      capex,
      porcentajeGastos,
      porcentajeFijos,
      porcentajeVariables
    };
  }, [projections, staff, planData]);

  const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Number(val || 0));

  return (
    <div style={{ marginTop: '1.5rem', marginBottom: '2.5rem' }}>
      <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Presupuesto Operativo y Estructura Financiera (Mensual · Año 1)
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Presupuesto Ingresos */}
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            <DollarSign size={14} />
            <span>Presupuesto de Ingresos</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--success-color)', marginTop: '0.5rem' }}>
            {formatCurrency(budget.ingresosMensuales)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>Pronóstico de ventas promedio mensual</span>
        </div>

        {/* Presupuesto Egresos */}
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-color)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            <PieChart size={14} />
            <span>Gastos y Costos Totales</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--danger-color)', marginTop: '0.5rem' }}>
            {formatCurrency(budget.totalGastosMensuales)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
            Fijos: {formatCurrency(budget.costosFijosMensuales)} | Var: {formatCurrency(budget.costosVariablesMensuales)}
          </span>
        </div>

        {/* Flujo Neto */}
        <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            <TrendingUp size={14} />
            <span>Holgura / Saldo Neto</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#3b82f6', marginTop: '0.5rem' }}>
            {formatCurrency(budget.saldoPresupuesto)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
            Margen de seguridad: {Number(Math.max(0, 100 - (budget.porcentajeGastos || 0))).toFixed(1)}% de ingresos libres
          </span>
        </div>
      </div>

      {/* Gráfico de Barra Acumulada de Distribución de Egresos */}
      <div style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Distribución de Egresos y Relación de Gastos
        </h5>

        <div style={{ display: 'flex', height: '24px', borderRadius: '6px', overflow: 'hidden', background: 'rgba(128, 128, 128, 0.15)', marginBottom: '1.25rem' }}>
          <div 
            style={{ width: `${Number(budget.porcentajeFijos || 50)}%`, background: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '0.72rem', fontWeight: 'bold' }}
            title={`Costos Fijos: ${Number(budget.porcentajeFijos || 0).toFixed(1)}%`}
          >
            {(budget.porcentajeFijos || 0) > 15 ? `Fijos (${Number(budget.porcentajeFijos || 0).toFixed(0)}%)` : ''}
          </div>
          <div 
            style={{ width: `${Number(budget.porcentajeVariables || 50)}%`, background: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '0.72rem', fontWeight: 'bold' }}
            title={`Costos Variables: ${Number(budget.porcentajeVariables || 0).toFixed(1)}%`}
          >
            {(budget.porcentajeVariables || 0) > 15 ? `Variables (${Number(budget.porcentajeVariables || 0).toFixed(0)}%)` : ''}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <div style={{ width: '10px', height: '10px', background: '#64748b', borderRadius: '2px' }}></div>
              <span><strong>Costos Fijos Operativos:</strong> Cubren la nómina, renta de local, servicios y gastos fijos indispensables.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', background: '#f43f5e', borderRadius: '2px' }}></div>
              <span><strong>Costos Variables:</strong> Directamente vinculados a la adquisición de mercancía/materiales o comisiones.</span>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: budget.porcentajeGastos > 85 ? '#f59e0b' : 'var(--success-color)', fontWeight: 'bold' }}>
              <AlertCircle size={15} />
              <span>Eficiencia del Presupuesto</span>
            </div>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', opacity: 0.8, fontSize: '0.76rem', lineHeight: '1.4' }}>
              {budget.porcentajeGastos > 85 
                ? '¡Advertencia! Tus costos representan más del 85% de tus ingresos presupuestados. Vigila el punto de equilibrio.' 
                : 'Favorable: La estructura de egresos se mantiene por debajo del 85% de facturación, dejando un margen operativo sano.'}
            </p>
          </div>
        </div>
      </div>

      {/* Widget Cuántico de Fondo de Reserva de Liquidación Intocable y Kill Switch */}
      <LiquidationReserveWidget planData={planData} projections={projections} staff={staff} />
    </div>
  );
}
