import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../config/api";
import type { Goal, CreateGoalDTO } from "../types/goals.types";

// Hook para buscar todas as metas
export const useGetGoals = () => {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data } = await api.get<Goal[]>("/goals");
      return data;
    },
  });
};

// Hook para criar uma nova meta
export const useCreateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateGoalDTO) => {
      const { data } = await api.post("/goals", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

// 🚀 NOVO: Hook para atualizar dados ou aportar saldo no cofre
export const useUpdateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateGoalDTO>;
    }) => {
      const { data } = await api.put(`/goals/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

// Hook para deletar uma meta
export const useDeleteGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};
