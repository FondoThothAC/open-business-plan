import React, { useMemo } from 'react';
import { DollarSign, PieChart, TrendingUp, AlertCircle } from 'lucide-react';

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
    const porcentajeGastos = (totalGastosMensuales / Math.max(1, ingresosMensuales)) * 100;
    const porcentajeFijos = (costosFijosMensuales / Math.max(1, totalGastosMensuales)) * 100;
    const porcentajeVariables = (costosVariablesMensuales / Math.max(1, totalGastosMensuales)) * 100;

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

  const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ marginTop: '1.5rem', marginBottom: '2.5rem' }}>
      <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 'bold', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Presupuesto Operativo y Estructura Financiera (Mensual · Año 1)
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Presupuesto Ingresos */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            <DollarSign size={14} />
            <span>Presupuesto de Ingresos</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#16a34a', marginTop: '0.5rem' }}>
            {formatCurrency(budget.ingresosMensuales)}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#15803d', display: 'block', marginTop: '2px' }}>Pronóstico de ventas promedio mensual</span>
        </div>

        {/* Presupuesto Egresos */}
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            <PieChart size={14} />
            <span>Gastos y Costos Totales</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#dc2626', marginTop: '0.5rem' }}>
            {formatCurrency(budget.totalGastosMensuales)}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#b91c1c', display: 'block', marginTop: '2px' }}>
            Fijos: {formatCurrency(budget.costosFijosMensuales)} | Var: {formatCurrency(budget.costosVariablesMensuales)}
          </span>
        </div>

        {/* Flujo Neto */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            <TrendingUp size={14} />
            <span>Holgura / Saldo Neto</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#2563eb', marginTop: '0.5rem' }}>
            {formatCurrency(budget.saldoPresupuesto)}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#1d4ed8', display: 'block', marginTop: '2px' }}>
            Margen de seguridad: {Math.max(0, 100 - budget.porcentajeGastos).toFixed(1)}% de ingresos libres
          </span>
        </div>
      </div>

      {/* Gráfico de Barra Acumulada de Distribución de Egresos */}
      <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Distribución de Egresos y Relación de Gastos
        </h5>

        <div style={{ display: 'flex', height: '24px', borderRadius: '6px', overflow: 'hidden', background: '#e2e8f0', marginBottom: '1.25rem' }}>
          <div 
            style={{ width: `${budget.porcentajeFijos}%`, background: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '0.72rem', fontWeight: 'bold' }}
            title={`Costos Fijos: ${budget.porcentajeFijos.toFixed(1)}%`}
          >
            {budget.porcentajeFijos > 15 ? `Fijos (${budget.porcentajeFijos.toFixed(0)}%)` : ''}
          </div>
          <div 
            style={{ width: `${budget.porcentajeVariables}%`, background: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '0.72rem', fontWeight: 'bold' }}
            title={`Costos Variables: ${budget.porcentajeVariables.toFixed(1)}%`}
          >
            {budget.porcentajeVariables > 15 ? `Variables (${budget.porcentajeVariables.toFixed(0)}%)` : ''}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <div style={{ width: '10px', height: '10px', background: '#64748b', borderRadius: '2px' }}></div>
              <span><strong>Costos Fijos Operativos:</strong> Cubren la nómina, renta de local, servicios y gastos fijos indispensables.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', background: '#f43f5e', borderRadius: '2px' }}></div>
              <span><strong>Costos Variables:</strong> Directamente vinculados a la adquisición de mercancía/materiales o comisiones.</span>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: budget.porcentajeGastos > 85 ? '#d97706' : '#16a34a', fontWeight: 'bold' }}>
              <AlertCircle size={15} />
              <span>Eficiencia del Presupuesto</span>
            </div>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.76rem', lineHeight: '1.4' }}>
              {budget.porcentajeGastos > 85 
                ? '¡Advertencia! Tus costos representan más del 85% de tus ingresos presupuestados. Vigila el punto de equilibrio.' 
                : 'Favorable: La estructura de egresos se mantiene por debajo del 85% de facturación, dejando un margen operativo sano.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
