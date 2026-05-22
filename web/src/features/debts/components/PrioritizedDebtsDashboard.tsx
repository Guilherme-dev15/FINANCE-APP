/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { useGetPrioritizedDebts, useDeleteDebt } from "../api/useDebts";
import { PayDebtModal } from "./PayDebtModal";
import type { PrioritizedDebt } from "../types/debts.types";
import { CreateDebtForm } from "./CreateDebtForm";
import { DebtEvolutionModal } from "./DebtEvolutionModal";
import { AnalyticsService } from "../../analytics/services/analytics.service"; // 🚀 Import do Motor de FCF

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

const formatPercent = (value: number) =>
  `${(Number(value) * 100).toFixed(2)}% a.m.`;

const getDebtId = (debt: PrioritizedDebt): string => {
  return (debt._id || debt.id) as string;
};

const DashboardMetrics = ({ debts }: { debts: PrioritizedDebt[] }) => {
  const metrics = useMemo(() => {
    const totalBalance = debts.reduce(
      (acc, curr) => acc + curr.currentBalance,
      0,
    );
    const activeCount = debts.length;

    const weightedInterest =
      totalBalance > 0
        ? debts.reduce(
            (acc, curr) => acc + curr.interestRate * curr.currentBalance,
            0,
          ) / totalBalance
        : 0;

    return { totalBalance, activeCount, weightedInterest };
  }, [debts]);

  if (metrics.activeCount === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col gap-1">
        <div className="flex items-center gap-2 text-zinc-500 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M7 15h0M2 9.5h20" />
          </svg>
          <h4 className="text-[11px] font-bold uppercase tracking-widest">
            Exposição Total
          </h4>
        </div>
        <p className="text-3xl font-black text-zinc-900 tracking-tight">
          {formatCurrency(metrics.totalBalance)}
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col gap-1 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-rose-500"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div className="flex items-center gap-2 text-zinc-500 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 20h.01" />
            <path d="M7 20v-4" />
            <path d="M12 20v-8" />
            <path d="M17 20V8" />
            <path d="M22 4v16" />
          </svg>
          <h4 className="text-[11px] font-bold uppercase tracking-widest">
            Taxa Média
          </h4>
        </div>
        <p className="text-3xl font-black text-rose-600 tracking-tight">
          {formatPercent(metrics.weightedInterest)}
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col gap-1">
        <div className="flex items-center gap-2 text-zinc-500 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
            <path d="M10 9H8" />
          </svg>
          <h4 className="text-[11px] font-bold uppercase tracking-widest">
            Títulos Ativos
          </h4>
        </div>
        <p className="text-3xl font-black text-zinc-900 tracking-tight">
          {metrics.activeCount}{" "}
          <span className="text-sm font-medium text-zinc-400 tracking-normal">
            registrados
          </span>
        </p>
      </div>
    </div>
  );
};

const PrimaryTargetCard = ({
  debt,
  onDelete,
  onPay,
  onProject,
  onEdit,
  isDeleting,
  freeCashFlow, // 🚀 Prop nova de FCF recebida aqui
}: {
  debt: PrioritizedDebt;
  onDelete: (id: string) => void;
  onPay: (debt: PrioritizedDebt) => void;
  onProject: (debt: PrioritizedDebt) => void;
  onEdit: (debt: PrioritizedDebt) => void;
  isDeleting: boolean;
  freeCashFlow: number;
}) => {
  // 🚀 Regra de Ouro: Botão só ativa se sobrar dinheiro
  const canAmortize = freeCashFlow > 0;

  return (
    <div className="group relative overflow-hidden rounded-4xl bg-zinc-950 p-8 md:p-10 text-white shadow-2xl shadow-zinc-900/50 border border-zinc-800 transition-all">
      <div className="absolute -top-24 -right-24 h-120 w-120 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-rose-500/10 blur-[60px] pointer-events-none" />

      <div className="absolute top-8 right-8 flex items-center gap-2 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(debt);
          }}
          className="p-2.5 text-zinc-400 hover:text-indigo-400 rounded-full hover:bg-zinc-900/80 transition-colors cursor-pointer"
          title="Editar Dívida"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            const id = getDebtId(debt);
            if (id) onDelete(id);
          }}
          disabled={isDeleting}
          className="p-2.5 text-zinc-500 hover:text-rose-400 rounded-full hover:bg-zinc-900/80 transition-colors disabled:opacity-50 cursor-pointer"
          title="Excluir do radar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
          </svg>
        </button>
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between gap-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700/50 bg-zinc-800/50 px-3 py-1.5 backdrop-blur-md mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">
              Prioridade Máxima
            </span>
          </div>
          <h3 className="text-3xl md:text-4xl font-black tracking-tight text-white pr-24">
            {debt.title}
          </h3>
          <p className="text-zinc-400 text-sm mt-2 font-medium max-w-md leading-relaxed">
            {debt.recommendation || "Liquidação imediata recomendada."}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pt-6 border-t border-zinc-800/50">
          <div className="flex gap-8 md:gap-12">
            <div>
              <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                Saldo Devedor
              </p>
              <p className="text-4xl font-black tracking-tighter text-white">
                {formatCurrency(debt.currentBalance)}
              </p>
            </div>
            <div>
              <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                Taxa / Mês
              </p>
              <p className="text-2xl font-medium tracking-tight text-zinc-300 mt-2">
                {formatPercent(debt.interestRate)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onProject(debt);
              }}
              className="w-full md:w-auto bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
              Ver Projeção
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPay(debt);
              }}
              disabled={!canAmortize}
              className={`w-full md:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-2 ${
                canAmortize
                  ? "bg-white hover:bg-zinc-100 text-zinc-950 active:scale-95 cursor-pointer"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
              }`}
            >
              {canAmortize ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  Amortizar Dívida
                </>
              ) : (
                "Saldo FCF Insuficiente"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrioritizedDebtsDashboard = () => {
  const { data, isLoading, isError, refetch } = useGetPrioritizedDebts();
  const { mutate: deleteDebt, isPending: isDeleting } = useDeleteDebt();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [debtToEdit, setDebtToEdit] = useState<PrioritizedDebt | null>(null);
  const [debtToPay, setDebtToPay] = useState<PrioritizedDebt | null>(null);
  const [debtToProject, setDebtToProject] = useState<PrioritizedDebt | null>(
    null,
  );

  // 🚀 Integrando o estado do FCF (Fluxo de Caixa Livre)
  const [fcf, setFcf] = useState<number>(0);

  useEffect(() => {
    AnalyticsService.getCashflow()
      .then((res) => setFcf(res.analysis.freeCashFlow))
      .catch((err) => console.error("Erro ao carregar motor de FCF", err));
  }, []);

  const prioritizedDebts = data || [];

  if (isLoading)
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-zinc-200/50 rounded-2xl" />
          <div className="h-32 bg-zinc-200/50 rounded-2xl" />
          <div className="h-32 bg-zinc-200/50 rounded-2xl" />
        </div>
        <div className="h-64 bg-zinc-200/50 rounded-4xl" />
      </div>
    );

  if (isError)
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-medium flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        Conexão perdida com o motor Nexus. Verifique se o servidor backend está
        online.
      </div>
    );

  const [primaryTarget, ...otherDebts] = prioritizedDebts;

  const handleDelete = (id: string) => {
    if (!id) return;
    if (
      window.confirm(
        "Ação irreversível. Confirma a exclusão definitiva deste título?",
      )
    ) {
      deleteDebt(id);
    }
  };

  const openEditModal = (debt: PrioritizedDebt) => {
    setDebtToEdit(debt);
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    setDebtToEdit(null);
    setIsModalOpen(false);

    // 🚀 O Gatilho Mágico: Manda o React Query buscar as novidades no banco
    if (refetch) refetch();

    // Bônus: Atualiza o Fluxo de Caixa (FCF) também para garantir
    AnalyticsService.getCashflow()
      .then((res) => setFcf(res.analysis.freeCashFlow))
      .catch((err) => console.error("Erro ao recarregar FCF", err));
  };

  return (
    <>
      <div className="space-y-8 pb-20">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
              Estratégia Nexus
              <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-md uppercase tracking-wider font-bold">
                v4.0
              </span>
            </h2>
            <p className="text-zinc-500 text-sm font-medium">
              Motor algorítmico de liquidação de juros compostos.
            </p>
          </div>

          <button
            onClick={() => {
              setDebtToEdit(null);
              setIsModalOpen(true);
            }}
            className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md shadow-zinc-900/10 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Adicionar Título
          </button>
        </header>

        {prioritizedDebts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-transparent border-2 border-dashed border-zinc-300 rounded-4xl text-center">
            <div className="w-20 h-20 bg-white border border-zinc-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-zinc-400"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-zinc-800 tracking-tight mb-2">
              Radar Limpo
            </h3>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              Não existem pendências financeiras registradas. Seu perfil está
              protegido.
            </p>
            <button
              onClick={() => {
                setDebtToEdit(null);
                setIsModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              Iniciar Análise de Dívida
            </button>
          </div>
        ) : (
          <>
            <DashboardMetrics debts={prioritizedDebts} />

            <div className="space-y-8">
              <PrimaryTargetCard
                debt={primaryTarget}
                onDelete={handleDelete}
                onPay={setDebtToPay}
                onProject={setDebtToProject}
                onEdit={openEditModal}
                isDeleting={isDeleting}
                freeCashFlow={fcf}
              />

              {otherDebts.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-2">
                    Na Fila de Amortização
                  </h4>
                  <div className="grid gap-3">
                    {otherDebts.map((debt, index) => (
                      <div
                        key={getDebtId(debt) || `priority-${index}`}
                        className="group flex items-center justify-between p-5 bg-white border border-zinc-200/80 rounded-2xl hover:shadow-md hover:border-zinc-300 transition-all duration-300"
                      >
                        <div className="flex items-center gap-5">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-400 font-black text-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                            {index + 2}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-800 text-base">
                              {debt.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-semibold text-zinc-500">
                                Taxa: {formatPercent(debt.interestRate)}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-zinc-300" />
                              <span className="text-[11px] font-semibold text-indigo-500">
                                Score: {debt.priorityScore || "8.5"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                              Saldo
                            </p>
                            <p className="font-black text-zinc-900 text-lg tracking-tight">
                              {formatCurrency(debt.currentBalance)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 border-l border-zinc-100 pl-6">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDebtToPay(debt);
                              }}
                              disabled={fcf <= 0}
                              className={`flex items-center justify-center px-4 py-2 rounded-xl font-bold text-sm transition-colors border cursor-pointer ${
                                fcf > 0
                                  ? "bg-zinc-50 text-zinc-700 hover:bg-indigo-50 hover:text-indigo-600 border-zinc-100 hover:border-indigo-100"
                                  : "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed opacity-50"
                              }`}
                              title={fcf > 0 ? "Pagar" : "FCF Insuficiente"}
                            >
                              Pagar
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(debt);
                              }}
                              className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-indigo-500 transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                <path d="m15 5 4 4" />
                              </svg>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const id = getDebtId(debt);
                                if (id) handleDelete(id);
                              }}
                              disabled={isDeleting}
                              className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-rose-50 hover:text-rose-500 transition-colors disabled:opacity-50 cursor-pointer"
                              title="Excluir"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="10" x2="10" y1="11" y2="17" />
                                <line x1="14" x2="14" y1="11" y2="17" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-4xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <button
              onClick={closeFormModal}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-colors z-10 cursor-pointer"
            >
              ✕
            </button>
            <div className="p-8">
              <CreateDebtForm
                onSuccessAction={closeFormModal}
                initialData={debtToEdit}
              />
            </div>
          </div>
        </div>
      )}

      {debtToPay && (
        <PayDebtModal
          isOpen={!!debtToPay}
          onClose={() => setDebtToPay(null)}
          debtId={getDebtId(debtToPay)}
          debtTitle={debtToPay.title}
          currentBalance={debtToPay.currentBalance}
        />
      )}
      {debtToProject && (
        <DebtEvolutionModal
          isOpen={!!debtToProject}
          onClose={() => setDebtToProject(null)}
          debtId={getDebtId(debtToProject)}
          debtTitle={
            debtToProject.title ||
            (debtToProject as any).description ||
            "Título"
          }
        />
      )}
    </>
  );
};
