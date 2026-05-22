export type DebtStatus = "ACTIVE" | "PAID" | "PENDENTE";

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
  title: string; // O que o seu frontend usa
  description?: string; // O que o backend exige
  originalAmount: number;
  interestRate: number;
  dueDate: string;
  remainingInstallments?: number; // O salvador da Pátria (Evita o erro 500)
  debtType?: string; // Evita o erro 400
}

export interface DebtRecord {
  id: string;
  name: string;
  amount: number;
  interestRate: number;
  installments: number;
  status: DebtStatus;
  createdAt: string;
  updatedAt: string;
}

// Opcional, mas pragmático: Tipo para quando formos criar uma nova dívida
export interface CreateDebtData {
  name: string;
  amount: number;
  interestRate: number;
  installments: number;
  status?: DebtStatus;
}
