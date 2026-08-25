/**
 * Adaptador para SEC EDGAR API (Balances públicos y reportes 10-K / 10-Q de empresas).
 * Acceso público gratuito de la SEC (Securities and Exchange Commission).
 */

export async function fetchSecCompanyFacts(cik = '0000320193') {
  try {
    // Normalizar CIK a 10 dígitos con ceros iniciales
    const paddedCik = String(cik).padStart(10, '0');
    const url = `https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCik}.json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'OpenBusinessPlan research@openplan.ai' },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return adaptSecEdgar(data, paddedCik);
  } catch (err) {
    console.warn('[SEC EDGAR] Error:', err.message);
    return adaptSecEdgar(null, cik, err.message);
  }
}

export function adaptSecEdgar(rawData, cik = '', error = null) {
  const now = new Date().toISOString();
  if (error || !rawData || !rawData.facts) {
    return {
      indicator: `Datos Corporativos SEC EDGAR (CIK: ${cik})`,
      value: error ? 'Sin conexión' : 'Sin datos',
      unit: 'USD',
      timeseries: [],
      source: 'SEC EDGAR',
      timestamp: now,
      rawType: 'json',
      metadata: { cik, error: error || 'Datos no disponibles' }
    };
  }

  const entityName = rawData.entityName || `Empresa (CIK: ${cik})`;
  const usGaap = rawData.facts?.['us-gaap'] || {};
  
  // Extraer ingresos si están disponibles
  const revenuesObj = usGaap['Revenues'] || usGaap['SalesRevenueNet'] || usGaap['RevenueFromContractWithCustomerExcludingAssessedTax'];
  let latestRevenue = 0;
  let revenueYear = '';
  
  if (revenuesObj?.units?.USD) {
    const usdList = revenuesObj.units.USD.filter(u => u.form === '10-K');
    if (usdList.length > 0) {
      const latest = usdList[usdList.length - 1];
      latestRevenue = latest.val;
      revenueYear = latest.fy || latest.end;
    }
  }

  return {
    indicator: `Benchmark Financiero SEC (${entityName})`,
    value: latestRevenue,
    unit: 'USD',
    timeseries: [],
    source: 'SEC EDGAR',
    timestamp: now,
    rawType: 'json',
    metadata: {
      entityName,
      cik,
      annualRevenue: latestRevenue,
      fiscalYear: revenueYear
    }
  };
}
