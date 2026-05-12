/**
 * Operational Engine: Business Efficiency & KPI Logic
 * Ported from legacy PlanIA (operations.html)
 * Project: Open Plan Business
 */

class OperationalEngine {
    constructor() {
        this.benchmarks = {
            otd_target: 95, // 95% on-time delivery target
            dso_target: 30,  // 30 days collection target
            ccc_target: 45   // 45 days cash cycle target
        };
    }

    /**
     * Calculates On-Time Delivery (OTD)
     */
    calculateOTD(onTimeOrders, totalOrders) {
        if (!totalOrders || totalOrders <= 0) return 0;
        return (onTimeOrders / totalOrders) * 100;
    }

    /**
     * Calculates Inventory Turnover
     */
    calculateTurnover(cogs, avgInventory) {
        if (!avgInventory || avgInventory <= 0) return 0;
        return cogs / avgInventory;
    }

    /**
     * Calculates Days Sales Outstanding (DSO)
     */
    calculateDSO(accountsReceivable, annualSales) {
        if (!annualSales || annualSales <= 0) return 0;
        return (accountsReceivable / annualSales) * 365;
    }

    /**
     * Calculates Days Payable Outstanding (DPO)
     */
    calculateDPO(accountsPayable, cogs) {
        if (!cogs || cogs <= 0) return 0;
        return (accountsPayable / cogs) * 365;
    }

    /**
     * Calculates Days Inventory Outstanding (DIO)
     */
    calculateDIO(currentInventory, cogs) {
        if (!cogs || cogs <= 0) return 0;
        return (currentInventory / cogs) * 365;
    }

    /**
     * Calculates Cash Conversion Cycle (CCC)
     */
    calculateCCC(dio, dso, dpo) {
        return dio + dso - dpo;
    }

    /**
     * Gets Health Status for a KPI
     */
    getHealth(type, value) {
        switch(type) {
            case 'OTD':
                return value >= 95 ? 'positive' : (value >= 90 ? 'warning' : 'negative');
            case 'DSO':
                return value <= 30 ? 'positive' : (value <= 45 ? 'warning' : 'negative');
            case 'CCC':
                return value <= 30 ? 'positive' : (value <= 60 ? 'warning' : 'negative');
            default:
                return 'neutral';
        }
    }
}

// Global Singleton
const operations = new OperationalEngine();
if (typeof window !== 'undefined') {
    window.OperationalEngine = operations;
}
