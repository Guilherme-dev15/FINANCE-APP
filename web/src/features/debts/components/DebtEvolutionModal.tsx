/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetDebtEvolution } from '../api/useDebts';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DebtEvolutionModalProps {
  debt: any;
  onClose: () => void;
}

// 🔥 1. O Tooltip Customizado (Design Padrão SaaS Premium)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-200">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
          Projeção: Mês {label}
        </p>
        <p className="text-3xl font-black text-white tracking-tighter">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
        </p>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-xs text-slate-400 font-medium">Saldo devedor estimado</p>
        </div>
      </div>
    );
  }
  return null;
};

export const DebtEvolutionModal = ({ debt, onClose }: DebtEvolutionModalProps) => {
  const { data: evolutionData, isLoading, isError } = useGetDebtEvolution(debt.id || debt._id);

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-4xl p-8 w-full max-w-4xl shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/20">
        
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              Laboratório Nexus
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Evolução da Dívida</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Trajetória de juros para: <span className="font-bold text-slate-800">{debt.title || debt.description}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <span className="text-xl font-bold">&times;</span>
          </button>
        </div>

        {/* Área do Gráfico */}
        <div className="h-112.5 w-full flex items-center justify-center bg-slate-50/50 rounded-3xl border border-slate-100 p-6">
          {isLoading && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Processando Matemática...</p>
            </div>
          )}
          
          {isError && (
            <div className="text-center">
              <p className="text-red-500 font-bold text-lg mb-2">Motor Nexus offline</p>
              <p className="text-slate-500 text-sm">Não foi possível calcular a projeção neste momento.</p>
            </div>
          )}
          
          {!isLoading && !isError && evolutionData && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                {/* 🔥 2. O Gradiente de Cor (O segredo da beleza) */}
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                
                {/* Linhas de grade mais sutis */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                
                {/* Eixos minimalistas */}
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(val) => `Mês ${val}`} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                  axisLine={false} 
                  tickLine={false}
                  dy={15}
                />
                <YAxis 
                  tickFormatter={(val) => `R$ ${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                  axisLine={false} 
                  tickLine={false}
                  dx={-10}
                />
                
                {/* Tooltip moderno */}
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }} />
                
                {/* A Linha e a Área */}
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#2563eb" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                  activeDot={{ r: 8, fill: '#2563eb', strokeWidth: 4, stroke: '#ffffff', className: "shadow-xl" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};