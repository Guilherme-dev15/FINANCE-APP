/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../config/api";
import type {
  Debt,
  PrioritizedDebt,
  CreateDebtDTO,
} from "../types/debts.types";

// 🛡️ Dicionário de Chaves Oficial (Evita erros de digitação e garante que o cache seja invalidado na mosca)
export const DEBTS_KEYS = {
  all: ["debts"] as const,
  prioritized: ["debts", "prioritized"] as const,
};

// ==========================================
// 📥 HOOKS DE BUSCA (GET) - Trazem os dados
// ==========================================

export const useGetDebts = () => {
  return useQuery<Debt[], Error>({
    queryKey: DEBTS_KEYS.all,
    queryFn: async () => {
      const { data } = await api.get<Debt[]>("/debts");
      return data;
    },
  });
};

export const useGetPrioritizedDebts = () => {
  return useQuery<PrioritizedDebt[], Error>({
    queryKey: DEBTS_KEYS.prioritized,
    queryFn: async () => {
      const { data } = await api.get<PrioritizedDebt[]>("/debts/prioritized");
      return data;
    },
  });
};

// ==========================================
// 🚀 HOOKS DE MUTAÇÃO (POST/PUT/DELETE) - Alteram os dados
// ==========================================

export const useCreateDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDebt: CreateDebtDTO) => {
      const { data } = await api.post("/debts", newDebt);
      return data;
    },
    onSuccess: async () => {
      // Magia da Reatividade: Atualiza o painel automaticamente após o POST
      await queryClient.invalidateQueries({ queryKey: DEBTS_KEYS.all });
      await queryClient.invalidateQueries({ queryKey: DEBTS_KEYS.prioritized });
    },
  });
};

export const useDeleteDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (debtId: string) => {
      const response = await api.delete(`/debts/${debtId}`);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DEBTS_KEYS.all });
      await queryClient.invalidateQueries({ queryKey: DEBTS_KEYS.prioritized });
    },
  });
};

export const usePayDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      debtId,
      amount,
    }: {
      debtId: string;
      amount: number;
    }) => {
      const response = await api.patch(`/debts/${debtId}/pay`, {
        paymentAmount: amount,
      });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DEBTS_KEYS.all });
      await queryClient.invalidateQueries({ queryKey: DEBTS_KEYS.prioritized });
    },
  });
};

export const useEditDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ debtId, data }: { debtId: string; data: any }) => {
      const response = await api.put(`/debts/${debtId}`, data);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DEBTS_KEYS.all });
      await queryClient.invalidateQueries({ queryKey: DEBTS_KEYS.prioritized });
    },
  });
};

// ==========================================
// 📊 HOOKS DE ANÁLISE E SIMULAÇÃO
// ==========================================

export const useGetDebtEvolution = (debtId: string | null) => {
  return useQuery({
    queryKey: ["debt-evolution", debtId], // Esta chave é específica e atrelada ao ID
    queryFn: async () => {
      const response = await api.get(`/debts/${debtId}/evolution`);
      return response.data;
    },
    enabled: !!debtId, // A trava de segurança: só dispara a requisição se tivermos um ID válido
  });
};

export const useSimulatePayment = () => {
  return useMutation({
    mutationFn: async ({
      debtId,
      newPaymentAmount,
      newInterestRate,
    }: {
      debtId: string;
      newPaymentAmount: number;
      newInterestRate: number;
    }) => {
      const response = await api.patch(`/debts/${debtId}/project-payment`, {
        newPaymentAmount,
        newInterestRate,
      });
      return response.data;
    },
  });
};
