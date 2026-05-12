# SDD: Operative Metrics Integration (Open Plan)

## 1. Overview
The goal is to migrate the operational KPI logic from the legacy `AI-Toolkit` (`operations.html`) into the new `Open Plan Business` architecture. This enables users to analyze and plan delivery performance, inventory turnover, and cash cycles within their business plans.

## 2. Technical Architecture

### 2.1 Data Model
The `proyectos_negocio` table will be extended with:
- `i4_operaciones_json`: Stores raw inputs (orders on time, inventory levels, accounts receivable/payable).

### 2.2 Calculation Engine (`OperationalEngine.js`)
A new singleton class to handle the standard formulas:
- **OTD (On-Time Delivery)**: `(OnTimeOrders / TotalOrders) * 100`
- **Inventory Turnover**: `COGS / AvgInventory`
- **DSO (Days Sales Outstanding)**: `(AR / AnnualSales) * 365`
- **DPO (Days Payable Outstanding)**: `(AP / COGS) * 365`
- **CCC (Cash Conversion Cycle)**: `DIO + DSO - DPO`

### 2.3 User Interface
- **Wizard Step 11**: A new dedicated section for "Eficiencia Operativa".
- **Dynamic KPIs**: Visual cards showing health indicators (Positive/Warning/Negative) based on industry benchmarks.

## 3. AI Integration (BoB Agent)
The agent prompt will be updated to include the `OPERATIONAL_ARCHITECT` persona.
- **Input**: Business description and industry.
- **Output**: Estimated operational metrics in a structured JSON format to pre-populate the module.

## 4. Integration Roadmap
1. **DB Migration**: Add the JSON column.
2. **Logic Porting**: Create `operational_engine.js`.
3. **UI Implementation**: Update the Wizard template and styles.
4. **Agent Training**: Inject operative context into BoB's system prompts.
