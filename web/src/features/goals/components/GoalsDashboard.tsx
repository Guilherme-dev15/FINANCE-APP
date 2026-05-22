import { useState } from 'react';
import { useGetGoals, useDeleteGoal, useUpdateGoal } from '../hooks/useGoals';
import { CreateGoalForm } from './CreateGoalForm';

export function GoalsDashboard() {
  const { data: goals = [], isLoading, isError } = useGetGoals();
  const deleteGoal = useDeleteGoal();
  const updateGoal = useUpdateGoal();
  
  // Estados para controle dos Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState<{id: string, currentAmount: number, title: string} | null>(null);

  if (isLoading) return <div className="p-8 text-slate-500 font-medium animate-pulse">Carregando cofres...</div>;
  if (isError) return <div className="p-8 text-rose-500 font-medium">Erro ao carregar os dados. Verifique a API.</div>;

  const totalTarget = goals.reduce((acc, goal) => acc + Number(goal.targetAmount), 0);
  const totalSaved = goals.reduce((acc, goal) => acc + Number(goal.currentAmount), 0);
  const globalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  // 🚀 Ação que apenas abre o modal e guarda qual meta será alterada
  const openDepositModal = (id: string, currentAmount: number, title: string) => {
    setDepositModalGoal({ id, currentAmount, title });
  };

  // 🚀 O manipulador real do envio do formulário de depósito
  const handleDepositSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!depositModalGoal) return;

    const formData = new FormData(e.currentTarget);
    const amountStr = formData.get('depositAmount') as string;
    const depositValue = Number(amountStr.replace(',', '.'));

    if (isNaN(depositValue) || depositValue <= 0) {
      alert('Por favor, insira um valor numérico válido e maior que zero.');
      return;
    }

    const newTotal = depositModalGoal.currentAmount + depositValue;
    updateGoal.mutate({
      id: depositModalGoal.id,
      payload: { currentAmount: newTotal },
    });
    
    setDepositModalGoal(null); // Fecha o modal após enviar
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER & METRICS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Metas & Cofres</h1>
          <p className="text-slate-500 mt-1">Alocação de fluxo de caixa para geração de patrimônio.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg cursor-pointer"
        >
          + Novo Cofre
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Patrimônio Acumulado</p>
          <p className="text-4xl font-black text-emerald-600 mt-1">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSaved)}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Objetivo Total</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalTarget)}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Progresso Global</p>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div 
              className="bg-emerald-500 h-3 rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min(globalProgress, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* GRID DE COFRES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = Math.min((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 100);
          
          return (
            <div key={goal.id} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all relative group flex flex-col justify-between">
              <div>
                <button 
                  onClick={() => {
                    if(window.confirm('Excluir este cofre?')) deleteGoal.mutate(goal.id);
                  }}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white cursor-pointer"
                  title="Excluir Cofre"
                >
                  ✕
                </button>
                
                <h3 className="text-xl font-bold text-slate-800 pr-8">{goal.title}</h3>
                <p className="text-sm font-medium text-slate-400 mt-1">
                  {goal.deadline ? `Até ${new Date(goal.deadline).toLocaleDateString('pt-BR')}` : 'Sem prazo definido'}
                </p>
                
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-emerald-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(goal.currentAmount))}
                    </span>
                    <span className="text-slate-400">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(goal.targetAmount))}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Aciona o nosso modal customizado em vez do window.prompt */}
              <button
                onClick={() => openDepositModal(goal.id, Number(goal.currentAmount), goal.title)}
                className="mt-6 w-full py-2.5 bg-slate-50 text-slate-700 hover:bg-emerald-600 hover:text-white text-sm font-bold rounded-xl transition-all active:scale-95 cursor-pointer border border-slate-100 hover:border-emerald-600"
              >
                ➕ Depositar
              </button>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
            <p className="text-slate-500 font-medium">Nenhum cofre criado. Comece seu planejamento!</p>
          </div>
        )}
      </div>

      {/* MODAL DE CRIAÇÃO DE COFRE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <button 
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
            >
              ✕
            </button>
            <CreateGoalForm onSuccessAction={() => setIsCreateModalOpen(false)} />
          </div>
        </div>
      )}

      {/* 🚀 NOVO MODAL DE DEPÓSITO */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <button 
              onClick={() => setDepositModalGoal(null)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
            >
              ✕
            </button>
            
            <div className="mb-6">
              <h2 className="text-xl font-black tracking-tight text-slate-800">Novo Aporte</h2>
              <p className="text-slate-500 text-sm mt-1">Destino: <span className="font-bold">{depositModalGoal.title}</span></p>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Valor (R$)
                </label>
                <input 
                  required 
                  autoFocus
                  type="number" 
                  step="0.01"
                  min="0.01"
                  name="depositAmount" 
                  placeholder="Ex: 150.00"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-emerald-600" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-3 mt-2 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                Confirmar Depósito
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}