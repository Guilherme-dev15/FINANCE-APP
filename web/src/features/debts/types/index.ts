export interface Debt {
  _id: string;
  id: string;
  title: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  dueDate: string;
  status: string;
}

export interface PrioritizedDebt extends Debt {
  priorityScore: number;
  recommendation: string;
}

export interface CreateDebtDTO {
  title: string;
  originalAmount: number;
  interestRate: number;
  dueDate: string;
}