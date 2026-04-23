/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useSimulatePayment } from '../api/useDebts';

export const DebtSimulatorModal = ({ debt, onClose }: { debt: any; onClose: () => void }) => {
  const { mutateAsync: simulate, isPending } = useSimulatePayment();
  
  // Estados para os controles deslizantes (Sliders)
  const [paymentAmount, setPaymentAmount] = useState<number>(debt.currentBalance * 0.1); // Começa sugerindo 10% do saldo
  const [interestRate, setInterestRate] = useState<number>(Number(debt.interestRate) * 100);
  
  // Estado para guardar o resultado do backend
  const [simulationResult, setSimulationResult] = useState<{ monthsToPay: number; remainingAmount: number } | null>(null);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Dispara a simulação sempre que o usuário soltar o slider
  const handleSimulate = async () => {
    try {
      const result = await simulate({
        debtId: debt.id || debt._id,
        newPaymentAmount: paymentAmount,
        newInterestRate: interestRate,
      });
      setSimulationResult(result);
    } catch (error) {
      console.error("Erro ao simular", error);
    }
  };

  // Roda uma simulação inicial assim que abre o modal
  useEffect(() => {
    (async () => {
      try {
        const result = await simulate({
          debtId: debt.id || debt._id,
          newPaymentAmount: paymentAmount,
          newInterestRate: interestRate,
        });
        setSimulationResult(result);
      } catch (error) {
        console.error("Erro ao simular", error);
      }
    })();
  }, [debt._id, debt.id, interestRate, paymentAmount, simulate]);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-4xl p-8 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
        
        <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Laboratório de Quitação</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Simulando cenários para: <span className="font-bold text-blue-600">{debt.title || debt.description}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 font-bold text-2xl">&times;</button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Coluna Esquerda: Controles */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aporte Mensal</label>
                <span className="text-lg font-black text-slate-800">{formatCurrency(paymentAmount)}</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max={debt.currentBalance} 
                step="10"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                onMouseUp={handleSimulate} // Simula ao soltar o clique
                onTouchEnd={handleSimulate}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taxa Renegociada</label>
                <span className="text-lg font-black text-orange-600">{interestRate.toFixed(2)}% am</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="20" 
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                onMouseUp={handleSimulate}
                onTouchEnd={handleSimulate}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Coluna Direita: O Resultado (A Mágica) */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 flex flex-col justify-center items-center text-center relative overflow-hidden">
            {isPending && (
              <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}
            
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tempo até a quitação</p>
            
            {simulationResult?.monthsToPay === 0 ? (
              <p className="text-4xl font-black text-green-500">Quitação Imediata!</p>
            ) : simulationResult?.monthsToPay && simulationResult.monthsToPay > 600 ? (
              <p className="text-2xl font-black text-red-500 leading-tight">Pagamento menor que os juros!<br/><span className="text-sm font-medium text-red-400">A dívida nunca será paga.</span></p>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-slate-900 tracking-tighter">{simulationResult?.monthsToPay || '-'}</span>
                <span className="text-lg font-bold text-slate-400">meses</span>
              </div>
            )}

            {simulationResult && simulationResult.remainingAmount > 0 && simulationResult.monthsToPay < 600 && (
               <p className="mt-4 text-xs font-medium text-slate-400">
                 Última parcela será de aprox. <span className="font-bold text-slate-600">{formatCurrency(simulationResult.remainingAmount)}</span>
               </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};