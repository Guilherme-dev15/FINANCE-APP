import { useEffect, useState, type FormEvent } from "react";
import { AnalyticsService } from "../services/analytics.service";
import { TransactionsService } from "../services/transactions.service";
import type { CashflowResponse } from "../types/analytics.types";
import {
  type CreateIncomeData,
  type CreateExpenseData,
} from "../types/transactions.types";
import { Modal } from "../../../ui/Modal";

export function CashflowDashboard() {
  const [data, setData] = useState<CashflowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Controle dos Modais
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Isolamos a busca para podermos chamá-la após salvar um novo dado
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const result = await AnalyticsService.getCashflow();
      setData(result);
    } catch (err) {
      setError("Falha ao carregar os dados financeiros.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // 🚀 The Akita Way: FormData nativo para máxima performance
  const handleIncomeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload: CreateIncomeData = {
      description: formData.get("description") as string,
      amount: Number(formData.get("amount")),
      type: formData.get("type") as "FIXED" | "VARIABLE",
      date: formData.get("date") as string,
    };

    try {
      await TransactionsService.createIncome(payload);
      setIsIncomeModalOpen(false); // Fecha o modal
      await fetchAnalytics(); // 🔄 Atualiza o painel em tempo real
    } catch (error) {
      alert("Erro ao salvar renda. Verifique o console.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExpenseSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload: CreateExpenseData = {
      description: formData.get("description") as string,
      amount: Number(formData.get("amount")),
      type: formData.get("type") as "FIXED" | "VARIABLE",
      category: formData.get("category") as "ESSENTIAL" | "LIFESTYLE" | "WASTE",
      date: formData.get("date") as string,
    };

    try {
      await TransactionsService.createExpense(payload);
      setIsExpenseModalOpen(false); // Fecha o modal
      await fetchAnalytics(); // 🔄 Atualiza o painel em tempo real
    } catch (error) {
      alert("Erro ao salvar despesa. Verifique o console.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-slate-500 font-semibold animate-pulse">
          Calculando viabilidade...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md border border-red-300">
        <p>{error}</p>
      </div>
    );
  }

  const { metrics, analysis } = data;
  const isCritical = analysis.alertLevel === "CRITICAL";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 🎯 Cabeçalho e Botões de Ação */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Motor de Viabilidade Nexus
          </h1>
          <p className="text-slate-500">
            Análise em tempo real do seu fluxo de caixa livre.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            - Nova Despesa
          </button>
          <button
            onClick={() => setIsIncomeModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            + Nova Renda
          </button>
        </div>
      </header>

      {/* Painel Principal: O Veredito */}
      <section
        className={`p-6 rounded-xl border shadow-sm transition-colors ${isCritical ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2
              className={`text-lg font-bold ${isCritical ? "text-red-900" : "text-emerald-900"}`}
            >
              Fluxo de Caixa Livre (FCF)
            </h2>
            <p
              className={`text-sm ${isCritical ? "text-red-700" : "text-emerald-700"}`}
            >
              O que sobra após o essencial e as dívidas ativas.
            </p>
          </div>
          <div className="text-right">
            <span
              className={`text-4xl font-black tracking-tight ${isCritical ? "text-red-600" : "text-emerald-600"}`}
            >
              R$ {analysis.freeCashFlow.toFixed(2)}
            </span>
          </div>
        </div>

        {isCritical && (
          <div className="mt-4 p-4 bg-red-100 rounded-lg border border-red-200">
            <p className="text-red-800 font-bold flex items-center gap-2">
              ⚠️ ALERTA CRÍTICO: Risco de Falência Pessoal
            </p>
            <p className="text-red-700 text-sm mt-1">
              Seu custo de vida ultrapassou sua renda. Você precisa de{" "}
              <strong className="font-black text-red-900">
                R$ {analysis.targetExtraIncome.toFixed(2)}
              </strong>{" "}
              em renda extra urgente para não criar novas dívidas.
            </p>
          </div>
        )}
      </section>

      {/* Métricas Detalhadas */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 font-semibold text-sm mb-1">
            Renda Total
          </h3>
          <p className="text-2xl font-bold text-slate-800">
            R$ {metrics.totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 font-semibold text-sm mb-1">
            Custo de Sobrevivência (Essencial)
          </h3>
          <p className="text-2xl font-bold text-slate-800">
            R$ {metrics.essentialExpenses.toFixed(2)}
          </p>
        </div>
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 font-semibold text-sm mb-1">
            Vazamentos (Estilo de Vida + Desperdício)
          </h3>
          <p className="text-2xl font-bold text-amber-600">
            R$ {(metrics.lifestyleExpenses + metrics.wasteExpenses).toFixed(2)}
          </p>
        </div>
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 font-semibold text-sm mb-1">
            Parcelas de Dívidas (Sangramento)
          </h3>
          <p className="text-2xl font-bold text-red-600">
            R$ {metrics.totalDebtInstallments.toFixed(2)}
          </p>
        </div>
      </section>

      {/* 🛡️ MODAIS INJETADOS NO DOM */}

      {/* Modal de Renda */}
      <Modal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        title="Adicionar Renda"
      >
        <form onSubmit={handleIncomeSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Descrição
            </label>
            <input
              required
              type="text"
              name="description"
              placeholder="Ex: Salário Base"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Valor (R$)
            </label>
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              name="amount"
              placeholder="3500.00"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Tipo
              </label>
              <select
                name="type"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="FIXED">Fixo (Salário)</option>
                <option value="VARIABLE">Variável (Bico/Freela)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Data
              </label>
              <input
                required
                type="date"
                name="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full py-3 mt-4 bg-emerald-600 text-white font-bold rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Salvando..." : "Salvar Renda"}
          </button>
        </form>
      </Modal>

      {/* Modal de Despesa */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Adicionar Despesa"
      >
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Descrição
            </label>
            <input
              required
              type="text"
              name="description"
              placeholder="Ex: Aluguel"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Valor (R$)
            </label>
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              name="amount"
              placeholder="1500.00"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Categoria
              </label>
              <select
                name="category"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 outline-none"
              >
                <option value="ESSENTIAL">Essencial (Sobrevivência)</option>
                <option value="LIFESTYLE">Estilo de Vida (Lazer/Ifood)</option>
                <option value="WASTE">Desperdício (Juros/Multas)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Recorrência
              </label>
              <select
                name="type"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 outline-none"
              >
                <option value="FIXED">Fixo (Mensal)</option>
                <option value="VARIABLE">Variável (Avulso)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Data
            </label>
            <input
              required
              type="date"
              name="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>
          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full py-3 mt-4 bg-slate-900 text-white font-bold rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Salvando..." : "Salvar Despesa"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
