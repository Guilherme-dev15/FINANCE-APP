import { api } from "../../../config/api";
import type {
  CreateIncomeData,
  CreateExpenseData,
} from "../types/transactions.types";

export const TransactionsService = {
  async createIncome(data: CreateIncomeData) {
    const response = await api.post("/incomes", data);
    return response.data;
  },

  async createExpense(data: CreateExpenseData) {
    const response = await api.post("/expenses", data);
    return response.data;
  },
};
