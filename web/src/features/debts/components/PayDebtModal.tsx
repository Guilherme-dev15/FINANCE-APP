import { useState } from 'react';
import { usePayDebt } from '../api/useDebts';

interface PayDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtId: string;
  debtTitle: string;
  currentBalance: number;
}

export const PayDebtModal = ({ isOpen, onClose, debtId, debtTitle, currentBalance }: PayDebtModalProps) => {
  const [amount, setAmount] = useState('');
  const { mutate: payDebt, isPending } = usePayDebt();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Converte o valor digitado para número
    const paymentAmount = Number(amount.replace(',', '.'));
    
    if (paymentAmount <= 0 || isNaN(paymentAmount)) {
      alert('Por favor, insira um valor válido maior que zero.');
      return;
    }

    if (paymentAmount > currentBalance) {
      alert('O valor do pagamento não pode ser maior que o saldo devedor atual.');
      return;
    }

    payDebt(
      { debtId, amount: paymentAmount },
      {
        onSuccess: () => {
          setAmount(''); // Limpa o input
          onClose(); // Fecha o modal
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 p-6">
        
        <button 
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          ✕
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Amortizar Dívida</h3>
          <p className="text-slate-500 text-sm mt-1">
            Lançar pagamento para <strong className="text-slate-700">{debtTitle}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Valor do Pagamento (R$)
            </label>
            <input
              type="number"
              step="0.01"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-lg"
              required
            />
            <p className="text-xs text-slate-400 mt-2 text-right">
              Saldo atual: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentBalance)}
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending || !amount}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? 'Processando...' : 'Confirmar Pagamento'}
          </button>
        </form>

      </div>
    </div>
  );
};