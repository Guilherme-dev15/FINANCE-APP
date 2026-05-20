import { useEffect, useState } from "react";
import { AnalyticsService } from "../services/analytics.service";
import type { CashflowResponse } from "../types/analytics.types";

export function CashflowDashboard() {
  const [data, setData] = useState<CashflowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const result = await AnalyticsService.getCashflow();
        setData(result);
      } catch (err) {
        setError("Falha ao carregar os dados financeiros. Tente novamente.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 font-semibold animate-pulse">
          Calculando viabilidade financeira...
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">
          Motor de Viabilidade Nexus
        </h1>
        <p className="text-gray-500">
          Análise em tempo real do seu fluxo de caixa livre.
        </p>
      </header>

      {/* Painel Principal: O Veredito */}
      <section
        className={`p-6 rounded-xl border-2 shadow-sm ${isCritical ? "bg-red-50 border-red-500" : "bg-emerald-50 border-emerald-500"}`}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Fluxo de Caixa Livre (FCF)
            </h2>
            <p className="text-sm text-gray-500">
              O que sobra após o essencial e as dívidas ativas.
            </p>
          </div>
          <div className="text-right">
            <span
              className={`text-4xl font-black ${isCritical ? "text-red-600" : "text-emerald-600"}`}
            >
              R$ {analysis.freeCashFlow.toFixed(2)}
            </span>
          </div>
        </div>

        {isCritical && (
          <div className="mt-4 p-4 bg-red-100 rounded-md">
            <p className="text-red-800 font-bold">
              ⚠️ ALERTA CRÍTICO: Risco de Falência Pessoal
            </p>
            <p className="text-red-700 text-sm mt-1">
              Seu custo de vida ultrapassou sua renda. Você precisa de{" "}
              <strong>R$ {analysis.targetExtraIncome.toFixed(2)}</strong> em
              renda extra urgente para não criar novas dívidas neste mês.
            </p>
          </div>
        )}
      </section>

      {/* Métricas Detalhadas */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 font-medium text-sm">Renda Total</h3>
          <p className="text-2xl font-bold text-gray-800">
            R$ {metrics.totalIncome.toFixed(2)}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 font-medium text-sm">
            Custo de Sobrevivência (Essencial)
          </h3>
          <p className="text-2xl font-bold text-gray-800">
            R$ {metrics.essentialExpenses.toFixed(2)}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 font-medium text-sm">
            Vazamentos (Estilo de Vida + Desperdício)
          </h3>
          <p className="text-2xl font-bold text-amber-600">
            R$ {(metrics.lifestyleExpenses + metrics.wasteExpenses).toFixed(2)}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 font-medium text-sm">
            Parcelas de Dívidas (Sangramento)
          </h3>
          <p className="text-2xl font-bold text-red-600">
            R$ {metrics.totalDebtInstallments.toFixed(2)}
          </p>
        </div>
      </section>
    </div>
  );
}
