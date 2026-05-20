import { api } from "../../../config/api";
import type {
  CreateIncomeData,
  CreateExpenseData,
  TransactionRecord,
} from "../types/transactions.types";

export const TransactionsService = {
  // Inserção (Mantém o que você já tem)
  async createIncome(data: CreateIncomeData) {
    const response = await api.post("/incomes", data);
    return response.data;
  },
  async createExpense(data: CreateExpenseData) {
    const response = await api.post("/expenses", data);
    return response.data;
  },

  // Buscas
  async getIncomes(): Promise<TransactionRecord[]> {
    const response = await api.get("/incomes");
    return response.data;
  },
  async getExpenses(): Promise<TransactionRecord[]> {
    const response = await api.get("/expenses");
    return response.data;
  },

  // Exclusão
  async deleteIncome(id: string) {
    await api.delete(`/incomes/${id}`);
  },
  async deleteExpense(id: string) {
    await api.delete(`/expenses/${id}`);
  },
};
