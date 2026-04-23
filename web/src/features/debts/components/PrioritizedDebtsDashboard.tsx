import { useGetPrioritizedDebts } from '../api/useDebts';
import type { PrioritizedDebt } from '../types';

// --- Helpers de Formatação ---
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatPercent = (value: number) => 
  `${(Number(value) * 100).toFixed(2)}% a.m.`;

// --- Sub-componente: Card de Alvo Principal ---
const PrimaryTargetCard = ({ debt }: { debt: PrioritizedDebt }) => (
  <div className="group relative bg-linear-to-br from-slate-900 via-red-950 to-red-900 rounded-3xl p-8 shadow-2xl shadow-red-950/40 text-white overflow-hidden border border-white/10">
    {/* Efeito de brilho no fundo */}
    <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-500/20 blur-3xl rounded-full group-hover:bg-red-500/30 transition-all duration-700" />
    
    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-100">Alvo Principal #1</span>
        </div>
        <h3 className="text-3xl font-black tracking-tight">{debt.title}</h3>
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
  const prioritizedDebts = data || [];

  // 1. Estado de Carregamento (Skeleton)
  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 bg-slate-200 rounded-3xl" />
      <div className="space-y-3">
        <div className="h-16 bg-slate-100 rounded-xl" />
        <div className="h-16 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );

  // 2. Erro
  if (isError) return (
    <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl text-orange-700 text-sm font-medium">
      ⚠️ Motor Nexus offline. Não foi possível calcular a estratégia.
    </div>
  );

  // 3. Sem dados
  if (prioritizedDebts.length === 0) return null;

  const [primaryTarget, ...otherDebts] = prioritizedDebts;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Estratégia Nexus
          <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded uppercase tracking-tighter">v4.0</span>
        </h2>
        <p className="text-slate-500 text-sm">Algoritmo de risco baseado em juros compostos e tempo de liquidação.</p>
      </header>

      {/* Alvo #1 */}
      <PrimaryTargetCard debt={primaryTarget} />

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
                
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-sm">{formatCurrency(debt.currentBalance)}</p>
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-orange-400" />
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">
                      Risco: {debt.priorityScore || '8.5'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};