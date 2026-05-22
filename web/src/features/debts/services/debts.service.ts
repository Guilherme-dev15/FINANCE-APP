import { api } from "../../../config/api";
import type { DebtRecord, CreateDebtData } from "../types/debts.types";

export const DebtsService = {
  // Busca todas as dívidas ativas
  async getDebts(): Promise<DebtRecord[]> {
    const response = await api.get("/debts");
    return response.data;
  },

  // Cria uma nova dívida (Usaremos no botão "Adicionar Título")
  async createDebt(data: CreateDebtData): Promise<DebtRecord> {
    const response = await api.post("/debts", data);
    return response.data;
  },

  // Exclui uma dívida
  async deleteDebt(id: string): Promise<void> {
    await api.delete(`/debts/${id}`);
  },
};
