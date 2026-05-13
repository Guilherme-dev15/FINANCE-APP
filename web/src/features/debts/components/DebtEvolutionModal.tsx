/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetDebtEvolution } from '../api/useDebts';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DebtEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtId: string;
  debtTitle: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

export const DebtEvolutionModal = ({ isOpen, onClose, debtId, debtTitle }: DebtEvolutionModalProps) => {
  const { data: evolutionData, isLoading, isError } = useGetDebtEvolution(isOpen ? debtId : null);

  if (!isOpen) return null;

  // 🚀 INTERCEPTADOR: Vamos descobrir o que o NestJS está enviando
  if (evolutionData) {
    console.log("🔥 DADOS DO BACKEND (EVOLUÇÃO):", evolutionData);
  }

  // Garante que chartData seja sempre um array
  const chartData = Array.isArray(evolutionData) ? evolutionData : evolutionData?.data || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-4xl w-full max-w-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 p-8">

        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-colors z-10 cursor-pointer"
        >
          ✕
        </button>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">Projeção Nexus</span>
          </div>
          <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Evolução do Saldo Devedor</h3>
          <p className="text-zinc-500 text-sm mt-1">
            Cenário projetado para a liquidação de <strong className="text-zinc-700">{debtTitle || 'Dívida Selecionada'}</strong>
          </p>
        </div>

        {/* Estilo inline de altura estrita para corrigir o bug de -1px do Recharts */}
        <div style={{ width: '100%', height: 350 }} className="bg-zinc-50/50 rounded-2xl border border-zinc-100 p-4">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-zinc-400">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm font-bold animate-pulse">Calculando juros compostos...</p>
            </div>
          ) : isError || chartData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-rose-500 text-sm font-bold">
              Não foi possível gerar a projeção no momento. Verifique o console.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />

                <YAxis hide={true} domain={['auto', 'auto']} />

                { }
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                  itemStyle={{ color: '#6366f1' }}
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Saldo Restante']}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                />

                {/* 🚀 CORREÇÃO AQUI: Trocamos 'balance' por 'amount' */}
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorBalance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};