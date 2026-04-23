/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../config/api';
import type { Debt, PrioritizedDebt, CreateDebtDTO } from '../types';

export const DEBTS_KEYS = {
  all: ['debts'] as const,
  prioritized: ['debts', 'prioritized'] as const,
};

export const useGetDebts = () => {
  return useQuery<Debt[], Error>({
    queryKey: DEBTS_KEYS.all,
    queryFn: async () => {
      const { data } = await api.get<Debt[]>('/debts');
      return data;
    },
  });
};

export const useGetPrioritizedDebts = () => {
  return useQuery<PrioritizedDebt[], Error>({
    queryKey: DEBTS_KEYS.prioritized,
    queryFn: async () => {
      const { data } = await api.get<PrioritizedDebt[]>('/debts/prioritized');
      return data;
    },
  });
};

export const useCreateDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDebt: CreateDebtDTO) => {
      const { data } = await api.post('/debts', newDebt);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DEBTS_KEYS.all });
      await queryClient.invalidateQueries({ queryKey: DEBTS_KEYS.prioritized });
    },
  });
};
// 🔥 1. Hook para DELETAR dívida
export const useDeleteDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (debtId: string) => {
      const response = await api.delete(`/debts/${debtId}`);
      return response.data;
    },
    onSuccess: () => {
      // Atualiza a tela automaticamente
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['prioritized-debts'] });
    },
  });
};

//  2. Hook para PAGAR dívida
export const usePayDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Recebe o ID da dívida e o valor pago
    mutationFn: async ({ debtId, amount }: { debtId: string; amount: number }) => {
      const response = await api.patch(`/debts/${debtId}/pay`, { paymentAmount: amount });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['prioritized-debts'] });
    },
  });
};

//  3. Hook para EDITAR dívida
export const useEditDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ debtId, data }: { debtId: string; data: any }) => {
      const response = await api.put(`/debts/${debtId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['prioritized-debts'] });
    },
  });
};
//  Hook para buscar os dados do Gráfico de Evolução
export const useGetDebtEvolution = (debtId: string | null) => {
  return useQuery({
    queryKey: ['debt-evolution', debtId],
    queryFn: async () => {
      const response = await api.get(`/debts/${debtId}/evolution`);
      return response.data;
    },
    enabled: !!debtId, // A requisição só dispara se tivermos um ID válido
  });
};

// Hook para simular o pagamento e ver a evolução projetada
export const useSimulatePayment = () => {
  return useMutation({
    mutationFn: async ({ debtId, newPaymentAmount, newInterestRate }: { debtId: string; newPaymentAmount: number; newInterestRate: number }) => {
      // Usando a rota do seu NestJS que criamos lá no começo
      const response = await api.patch(`/debts/${debtId}/project-payment`, { 
        newPaymentAmount, 
        newInterestRate 
      });
      return response.data;
    },
  });
};