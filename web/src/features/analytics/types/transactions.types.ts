// 🛡️ Espelho exato dos Enums do Prisma no Backend
export type TransactionType = "FIXED" | "VARIABLE";
export type ExpenseCategory = "ESSENTIAL" | "LIFESTYLE" | "WASTE";

export interface CreateIncomeData {
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  date: string;
}

export interface TransactionRecord {
  id: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
  type?: "FIXED" | "VARIABLE";
  category?: "ESSENTIAL" | "LIFESTYLE" | "WASTE";
}
