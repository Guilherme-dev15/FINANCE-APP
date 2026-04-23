/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useGetDebts, useDeleteDebt, usePayDebt } from '../api/useDebts';
import { EditDebtModal } from './EditDebtModal'; 
import { DebtEvolutionModal } from './DebtEvolutionModal';
import { DebtSimulatorModal } from './DebtSimulatorModal'; // 🔥 Nova Importação do Simulador

// 1. O Card Refatorado (Agora com todas as 4 ações)
const DebtCard = ({ 
  debt, 
  onDelete, 
  onPay,
  onEdit,
  onViewEvolution,
  onSimulate // 🔥 Nova prop
}: { 
  debt: any; 
  onDelete: (id: string) => void; 
  onPay: (id: string, amount: number) => void; 
  onEdit: (debt: any) => void;
  onViewEvolution: (debt: any) => void;
  onSimulate: (debt: any) => void;
}) => {
  const debtId = debt.id || debt._id;
  const debtName = debt.description || debt.title || 'Dívida sem nome';

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleDelete = () => {
    if (window.confirm(`⚠️ Tem certeza que deseja excluir o registro de: ${debtName}?`)) {
      onDelete(debtId);
    }
  };

  const handlePay = () => {
    const amountStr = window.prompt(`💸 Informe o valor do pagamento para [${debtName}]:\n(Ex: 150.50)`);
    if (!amountStr) return; 
    
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      alert('❌ Valor inválido. Digite um número maior que zero.');
      return;
    }
    
    onPay(debtId, amount);
  };

  return (
    <div className="group p-5 border border-slate-200 rounded-2xl bg-white hover:border-blue-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
            {debtName}
          </h4>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
            debt.status === 'pago' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {debt.status || 'Ativo'}
          </span>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Saldo Devedor:</span>
            <span className="font-bold text-slate-900">{formatCurrency(Number(debt.currentBalance))}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Taxa de Juros:</span>
            <span className="font-medium text-orange-600">{(Number(debt.interestRate) * 100).toFixed(2)}% a.m.</span>
          </div>
        </div>
      </div>

      {/* 🔥 Botões de Ação: Excluir e Grupo de Opções */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-3">
        <button 
          onClick={handleDelete}
          className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors w-full xl:w-auto text-left"
        >
          Excluir
        </button>
        
        <div className="flex flex-wrap justify-end gap-2 w-full xl:w-auto">
          {/* Botão Novo: Simulador Interativo */}
          <button 
            onClick={() => onSimulate(debt)}
            className="text-xs font-bold text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors border border-purple-100 flex-1 xl:flex-none text-center"
          >
            🧪 Simular
          </button>

          <button 
            onClick={() => onViewEvolution(debt)}
            className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors border border-blue-100 flex-1 xl:flex-none text-center"
          >
            📈 Evolução
          </button>

          <button 
            onClick={() => onEdit(debt)}
            className="text-xs font-bold text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors border border-slate-200 flex-1 xl:flex-none text-center"
          >
            Editar
          </button>

          <button 
            onClick={handlePay}
            disabled={debt.status === 'pago' || debt.currentBalance <= 0}
            className="text-xs font-black text-white bg-slate-900 hover:bg-blue-600 px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1 xl:flex-none text-center"
          >
            {debt.status === 'pago' ? 'Quitado' : 'Abater'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Componente Principal
export const DebtList = () => {
  const { data: debts, isLoading, isError } = useGetDebts();
  const { mutate: deleteDebt } = useDeleteDebt();
  const { mutate: payDebt } = usePayDebt();
  
  // 🔥 Estados para controlar os Modais
  const [editingDebt, setEditingDebt] = useState<any | null>(null);
  const [viewingEvolution, setViewingEvolution] = useState<any | null>(null);
  const [simulatingDebt, setSimulatingDebt] = useState<any | null>(null); // Novo estado

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
        <p className="text-red-600 font-bold">Falha na sincronização</p>
      </div>
    );
  }

  if (!debts?.length) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
        <p className="text-slate-400 font-medium">Nenhum registro encontrado no Nexus.</p>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-slate-800 tracking-tight">
          Portfólio de Dívidas
        </h3>
        <span className="bg-blue-100 text-blue-700 text-xs font-black px-2.5 py-0.5 rounded-full">
          {debts.length} ITENS
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {debts.map((debt) => (
          <DebtCard 
            key={debt._id || debt.id} 
            debt={debt} 
            onDelete={(id) => deleteDebt(id)}
            onPay={(id, amount) => payDebt({ debtId: id, amount })}
            onEdit={(debtData) => setEditingDebt(debtData)} 
            onViewEvolution={(debtData) => setViewingEvolution(debtData)} 
            onSimulate={(debtData) => setSimulatingDebt(debtData)} // 👈 Ação do botão de Simulação
          />
        ))}
      </div>

      {/* Renderiza o Modal de Edição */}
      {editingDebt && (
        <EditDebtModal 
          debt={editingDebt} 
          onClose={() => setEditingDebt(null)} 
        />
      )}

      {/* Renderiza o Modal do Gráfico de Evolução */}
      {viewingEvolution && (
        <DebtEvolutionModal 
          debt={viewingEvolution} 
          onClose={() => setViewingEvolution(null)} 
        />
      )}

      {/* 🔥 Renderiza o Modal do Simulador Interativo */}
      {simulatingDebt && (
        <DebtSimulatorModal 
          debt={simulatingDebt} 
          onClose={() => setSimulatingDebt(null)} 
        />
      )}
    </section>
  );
};