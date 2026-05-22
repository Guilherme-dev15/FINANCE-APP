/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FormEvent, useState } from "react";
import { useCreateGoal } from "../hooks/useGoals";

interface CreateGoalFormProps {
  onSuccessAction: () => void;
}

export function CreateGoalForm({ onSuccessAction }: CreateGoalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createGoal = useCreateGoal();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Tratamento pragmático: previne erros de vírgula do usuário
      const parseNumber = (val: FormDataEntryValue | null) => {
        if (!val) return 0;
        return Number(String(val).replace(",", "."));
      };

      const payload = {
        title: formData.get("title") as string,
        targetAmount: parseNumber(formData.get("targetAmount")),
        currentAmount: parseNumber(formData.get("currentAmount")) || 0,
        deadline: formData.get("deadline")
          ? new Date(formData.get("deadline") as string).toISOString()
          : undefined,
      };

      await createGoal.mutateAsync(payload);
      onSuccessAction(); // Fecha o modal após o sucesso
    } catch (error: any) {
      alert("Erro ao registrar o cofre. Verifique o console.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      <div>
        <h2 className="text-2xl font-black tracking-tight">Novo Cofre</h2>
        <p className="text-slate-500 text-sm mt-1">
          Defina sua meta e comece a construir patrimônio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Nome do Objetivo
          </label>
          <input
            required
            type="text"
            name="title"
            placeholder="Ex: Reserva de Emergência, Viagem..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Valor Alvo (R$)
            </label>
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              name="targetAmount"
              placeholder="10000.00"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Saldo Inicial (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="currentAmount"
              defaultValue={0}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Prazo Limite (Opcional)
          </label>
          <input
            type="date"
            name="deadline"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-500"
          />
        </div>

        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full py-4 mt-2 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
        >
          {isSubmitting ? "Processando..." : "Criar Cofre"}
        </button>
      </form>
    </div>
  );
}
