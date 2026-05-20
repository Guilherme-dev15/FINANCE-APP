/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { TransactionsService } from "../services/transactions.service";
import type { TransactionRecord } from "../types/transactions.types";

interface TransactionHistoryProps {
  onUpdate: () => void;
}

export function TransactionHistory({ onUpdate }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<
    (TransactionRecord & { isIncome: boolean })[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [incomes, expenses] = await Promise.all([
        TransactionsService.getIncomes(),
        TransactionsService.getExpenses(),
      ]);

      // Mapeia e une os dois arrays
      const mappedIncomes = incomes.map((i) => ({ ...i, isIncome: true }));
      const mappedExpenses = expenses.map((e) => ({ ...e, isIncome: false }));

      const merged = [...mappedIncomes, ...mappedExpenses];

      // Ordena pelas mais recentes
      merged.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setTransactions(merged);
    } catch (error) {
      console.error("Erro ao buscar histórico", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [onUpdate]); // 🔄 Recarrega sempre que o onUpdate (pai) for disparado

  const handleDelete = async (id: string, isIncome: boolean) => {
    if (!window.confirm("Tem certeza que deseja apagar este registro?")) return;

    try {
      if (isIncome) {
        await TransactionsService.deleteIncome(id);
      } else {
        await TransactionsService.deleteExpense(id);
      }
      onUpdate(); // Avisa o Dashboard para atualizar as cores
    } catch (error) {
      alert("Erro ao excluir transação.");
    }
  };

  if (loading)
    return (
      <div className="p-4 text-center text-slate-500">
        Carregando histórico...
      </div>
    );

  if (transactions.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Últimas Transações
        </h3>
      </div>
      <div className="divide-y divide-slate-100">
        {transactions.map((t) => (
          <div
            key={t.id}
            className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div>
              <p className="text-sm font-bold text-slate-800">
                {t.description}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(t.date).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-sm font-bold ${t.isIncome ? "text-emerald-600" : "text-slate-800"}`}
              >
                {t.isIncome ? "+" : "-"} R$ {Number(t.amount).toFixed(2)}
              </span>
              <button
                onClick={() => handleDelete(t.id, t.isIncome)}
                className="text-slate-400 hover:text-red-500 transition-colors p-2"
                title="Excluir"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
