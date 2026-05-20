import { api } from "../../../config/api";
import type { CashflowResponse } from "../types/analytics.types";

export const AnalyticsService = {
  /**
   * Busca o Fluxo de Caixa Livre e a Viabilidade Financeira do usuário.
   */
  async getCashflow(): Promise<CashflowResponse> {
    const response = await api.get<CashflowResponse>("/analytics/cashflow");
    return response.data;
  },
};
