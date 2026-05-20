export interface CashflowMetrics {
  totalIncome: number;
  essentialExpenses: number;
  lifestyleExpenses: number;
  wasteExpenses: number;
  totalDebtInstallments: number;
}

export interface CashflowAnalysis {
  freeCashFlow: number;
  realCashFlow: number;
  isViable: boolean;
  alertLevel: "SAFE" | "CRITICAL";
  targetExtraIncome: number;
}

export interface CashflowResponse {
  metrics: CashflowMetrics;
  analysis: CashflowAnalysis;
}
