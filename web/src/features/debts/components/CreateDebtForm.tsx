/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FormEvent, useState } from "react";
import type { PrioritizedDebt } from "../types/debts.types";
import { api } from "../../../config/api";

interface CreateDebtFormProps {
  onSuccessAction: () => void;
  initialData?: PrioritizedDebt | null;
}

export function CreateDebtForm({
  onSuccessAction,
  initialData,
}: CreateDebtFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const titleValue = formData.get("title") as string;

      const parseNumber = (val: FormDataEntryValue | null) =>
        Number(String(val).replace(",", "."));

      const originalAmount = parseNumber(formData.get("originalAmount"));
      const interestRate = parseNumber(formData.get("interestRate"));

      // 🚀 Payload Supremo: Serve tanto para Criar quanto para Editar
      const payload = {
        description: titleValue, // O backend exige description
        originalAmount: originalAmount,
        // Se for edição, mantém o saldo atual. Se for novo, copia o valor original.
        currentAmount: initialData
          ? initialData.currentBalance
          : originalAmount,
        interestRate: interestRate,
        remainingInstallments: parseNumber(
          formData.get("remainingInstallments"),
        ),
        debtType: formData.get("debtType") as string,
        dueDate: new Date(formData.get("dueDate") as string).toISOString(),
      };

      if (initialData) {
        // 🚀 O Desbloqueio: Dispara a edição via PUT/PATCH pegando o ID correto
        const debtId = initialData.id || (initialData as any)._id;
        await api.put(`/debts/${debtId}`, payload);
      } else {
        // Fluxo normal de Criação
        await api.post("/debts", payload);
      }

      onSuccessAction();
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        const mensagensDeErro = Array.isArray(error.response.data.message)
          ? error.response.data.message.join("\n- ")
          : error.response.data.message;

        alert(`O Backend rejeitou os dados:\n- ${mensagensDeErro}`);
        console.error("DETALHES DO DTO REJEITADO:", error.response.data);
      } else {
        alert("Erro do servidor. Verifique o console ou a aba Network.");
        console.error(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🛡️ O Resgate do Título: Se o frontend não achar o 'title', ele busca o 'description'
  const displayTitle =
    initialData?.title || (initialData as any)?.description || "";

  return (
    <div className="space-y-6 text-slate-800">
      <div>
        <h2 className="text-2xl font-black tracking-tight">
          {initialData ? "Editar Título da Dívida" : "Novo Título de Dívida"}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Insira os dados exatos do contrato.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo: Título */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Título / Credor
          </label>
          <input
            required
            type="text"
            name="title"
            defaultValue={displayTitle}
            placeholder="Ex: Cartão Nubank"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
          />
        </div>

        {/* Linha dupla: Valor e Taxa */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Valor (R$)
            </label>
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              name="originalAmount"
              defaultValue={initialData?.originalAmount}
              placeholder="3500.00"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Taxa (% a.m.)
            </label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              name="interestRate"
              defaultValue={initialData?.interestRate}
              placeholder="4.99"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-rose-600"
            />
          </div>
        </div>

        {/* Linha dupla: Tipo da Dívida e Parcelas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Tipo de Dívida
            </label>
            <select
              name="debtType"
              defaultValue={(initialData as any)?.debtType || "LOAN"}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            >
              <option value="LOAN">Empréstimo</option>
              <option value="CREDIT_CARD">Cartão de Crédito</option>
              <option value="FINANCING">Financiamento</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Parcelas Restantes
            </label>
            <input
              required
              type="number"
              step="1"
              min="1"
              name="remainingInstallments"
              defaultValue={(initialData as any)?.remainingInstallments || 12}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            />
          </div>
        </div>

        {/* Campo: Data de Vencimento */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Vencimento Inicial
          </label>
          <input
            required
            type="date"
            name="dueDate"
            defaultValue={
              initialData?.dueDate?.split("T")[0] ||
              new Date().toISOString().split("T")[0]
            }
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
          />
        </div>

        {/* Botão de Envio Dinâmico */}
        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full py-4 mt-2 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer"
        >
          {isSubmitting
            ? "Processando..."
            : initialData
              ? "Salvar Alterações"
              : "Registrar no Radar"}
        </button>
      </form>
    </div>
  );
}
