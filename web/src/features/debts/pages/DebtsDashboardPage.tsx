// web/src/features/debts/pages/DebtsDashboardPage.tsx
import { CreateDebtForm } from '../components/CreateDebtForm';
import { DebtList } from '../components/DebtList';
import { PrioritizedDebtsDashboard } from '../components/PrioritizedDebtsDashboard';

export const DebtsDashboardPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho da Página */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            FinanceApp <span className="text-blue-600">|</span> Nexus
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Sua central de inteligência para liquidação de dívidas.
          </p>
        </header>

        {/* Grid Principal de Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          <section className="xl:col-span-4 flex flex-col gap-6">
            <CreateDebtForm />
            
            <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-900/20">
              <h3 className="font-bold text-lg">Modo Big Player</h3>
              <p className="text-blue-100 text-sm mt-2">
                Lembre-se: O objetivo não é apenas pagar dívidas, é limpar o caixa para focar na escala do seu SaaS.
              </p>
            </div>
          </section>

          <section className="xl:col-span-8 flex flex-col gap-8">
            <PrioritizedDebtsDashboard />
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <DebtList />
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};