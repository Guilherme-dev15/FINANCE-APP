import { useState } from 'react';
import { useGetPrioritizedDebts, useDeleteDebt } from '../api/useDebts'; // 👈 Hook de Delete adicionado
import type { PrioritizedDebt } from '../types';
import { CreateDebtForm } from './CreateDebtForm';

// --- Helpers de Formatação ---
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatPercent = (value: number) => 
  `${(Number(value) * 100).toFixed(2)}% a.m.`;

// --- Sub-componente: Card de Alvo Principal ---
const PrimaryTargetCard = ({ debt, onDelete, isDeleting }: { debt: PrioritizedDebt, onDelete: (id: string) => void, isDeleting: boolean }) => (
  <div className="group relative bg-linear-to-br from-slate-900 via-red-950 to-red-900 rounded-3xl p-8 shadow-2xl shadow-red-950/40 text-white overflow-hidden border border-white/10">
    <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-500/20 blur-3xl rounded-full group-hover:bg-red-500/30 transition-all duration-700" />
    
    {/* 🚀 Botão de Excluir do Card Principal */}
    <button 
      onClick={() => onDelete(debt._id || debt.id as string)}
      disabled={isDeleting}
      className="absolute top-6 right-6 text-red-400/50 hover:text-red-200 transition-colors disabled:opacity-50 z-10"
      title="Eliminar Alvo"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
    </button>

    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-100">Alvo Principal #1</span>
        </div>
        <h3 className="text-3xl font-black tracking-tight pr-8">{debt.title}</h3>
        <p className="text-red-200/70 text-sm mt-1 font-medium">{debt.recommendation || 'Liquidação imediata recomendada'}</p>
      </div>

      <div className="flex gap-8 border-l border-white/10 pl-0 md:pl-8">
        <div>
          <p className="text-red-200/50 text-xs font-bold uppercase mb-1">Saldo Total</p>
          <p className="text-3xl font-black leading-none">{formatCurrency(debt.currentBalance)}</p>
        </div>
        <div>
          <p className="text-red-200/50 text-xs font-bold uppercase mb-1">Juros</p>
          <p className="text-3xl font-light leading-none">{formatPercent(debt.interestRate)}</p>
        </div>
      </div>
    </div>
  </div>
);

// --- Componente Principal ---
export const PrioritizedDebtsDashboard = () => {
  const { data, isLoading, isError } = useGetPrioritizedDebts();
  // 🚀 Instanciando a mutação de Deleção
  const { mutate: deleteDebt, isPending: isDeleting } = useDeleteDebt();
  
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const prioritizedDebts = data || [];

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 bg-slate-200 rounded-3xl" />
      <div className="space-y-3">
        <div className="h-16 bg-slate-100 rounded-xl" />
        <div className="h-16 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );

  if (isError) return (
    <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl text-orange-700 text-sm font-medium">
      ⚠️ Motor Nexus offline. Não foi possível calcular a estratégia.
    </div>
  );

  const [primaryTarget, ...otherDebts] = prioritizedDebts;

  // Função para confirmar e deletar
  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta dívida do radar?')) {
      deleteDebt(id);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Estratégia Nexus
              <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded uppercase tracking-tighter">v4.0</span>
            </h2>
            <p className="text-slate-500 text-sm">Algoritmo de risco baseado em juros compostos e tempo de liquidação.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            + Nova Dívida
          </button>
        </header>

        {prioritizedDebts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center mt-8">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-xs">
              <span className="text-2xl" aria-hidden="true">🎯</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Nenhum Alvo Encontrado</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              Seu radar está limpo. Não há dívidas cadastradas para o motor da Estratégia Nexus analisar no momento.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
            >
              Adicionar Primeira Dívida
            </button>
          </div>
        ) : (
          <>
            {/* Alvo #1 */}
            <PrimaryTargetCard debt={primaryTarget} onDelete={handleDelete} isDeleting={isDeleting} />

            {/* Lista de Próximos Alvos */}
            {otherDebts.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Próximos passos da fila</h4>
                <div className="grid gap-3">
                  {otherDebts.map((debt, index) => (
                    <div 
                      key={debt._id || debt.id || `priority-${index}`} 
                      className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 font-black text-xs group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          {index + 2}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{debt.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{formatPercent(debt.interestRate)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-bold text-slate-900 text-sm">{formatCurrency(debt.currentBalance)}</p>
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-orange-400" />
                            <p className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">
                              Risco: {debt.priorityScore || '8.5'}
                            </p>
                          </div>
                        </div>
                        
                        {/* 🚀 Botão de Excluir da Lista */}
                        <button
                          onClick={() => handleDelete(debt._id || debt.id as string)}
                          disabled={isDeleting}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Excluir dívida"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors z-10"
            >
              ✕
            </button>
            <div className="p-8">
              <CreateDebtForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
};