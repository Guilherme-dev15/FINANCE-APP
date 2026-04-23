/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDebt } from '../api/useDebts';

// 1. Zod Schema: Adicionamos o Status com os valores exatos que o seu NestJS espera
const createDebtSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  originalAmount: z.number({ message: 'Informe um valor' }).positive('O valor não pode ser zero ou negativo'),
  interestRate: z.number({ message: 'Informe uma taxa' }).min(0, 'A taxa não pode ser negativa'),
  remainingInstallments: z.number({ message: 'Informe as parcelas' }).min(1, 'Mínimo de 1 parcela'),
  dueDate: z.string().min(1, 'A data de vencimento é obrigatória'),
  debtType: z.enum(['CREDIT_CARD', 'LOAN']),
  status: z.enum(['pendente', 'em negociação', 'pago']), // 👈 Trava de segurança do Status
});

type CreateDebtFormData = z.infer<typeof createDebtSchema>;

export const CreateDebtForm = () => {
  const { mutateAsync: createDebt, isPending } = useCreateDebt();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateDebtFormData>({
    resolver: zodResolver(createDebtSchema),
    defaultValues: {
      debtType: 'CREDIT_CARD',
      status: 'pendente' 
    }
  });

  const onSubmit = async (data: CreateDebtFormData) => {
    try {
      const payload = {
        description: data.title,
        originalAmount: data.originalAmount,
        currentAmount: data.originalAmount,
        interestRate: data.interestRate,
        remainingInstallments: data.remainingInstallments,
        dueDate: new Date(data.dueDate).toISOString(),
        debtType: data.debtType,
        status: data.status // 👈 Agora enviamos 'pendente', 'em negociação' ou 'pago' dinamicamente
      };

      await createDebt(payload as any);
      
      reset(); 
      alert('✅ Dívida cadastrada com sucesso! O Nexus já está recalculando sua estratégia.'); 
      
    } catch (error: any) {
      const backendError = error.response?.data?.message;
      const errorMessage = Array.isArray(backendError) ? backendError.join('\n- ') : backendError;
      alert(`⚠️ O Back-end recusou os dados:\n\n- ${errorMessage || 'Erro de conexão com a API'}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-black text-slate-800 mb-4">Nova Dívida</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Título / Descrição */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Título / Credor</label>
          <input
            type="text"
            {...register('title')}
            className="block w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-slate-50 transition-colors"
            placeholder="Ex: Cartão Nubank"
          />
          {errors.title && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.title.message}</span>}
        </div>

        {/* Tipo de Dívida & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo de Dívida</label>
            <select
              {...register('debtType')}
              className="block w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-slate-50 transition-colors"
            >
              <option value="CREDIT_CARD">Cartão de Crédito</option>
              <option value="LOAN">Empréstimo Pessoal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
            <select
              {...register('status')}
              className="block w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-slate-50 transition-colors"
            >
              <option value="pendente">Pendente</option>
              <option value="em negociação">Em Negociação</option>
              <option value="pago">Pago</option>
            </select>
            {errors.status && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.status.message}</span>}
          </div>
        </div>

        {/* Valores e Juros */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              {...register('originalAmount', { valueAsNumber: true })}
              className="block w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-slate-50 transition-colors"
              placeholder="5000.00"
            />
            {errors.originalAmount && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.originalAmount.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Juros (% am)</label>
            <input
              type="number"
              step="0.01"
              {...register('interestRate', { valueAsNumber: true })}
              className="block w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-slate-50 transition-colors"
              placeholder="5.5"
            />
            {errors.interestRate && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.interestRate.message}</span>}
          </div>
        </div>

        {/* Parcelas e Vencimento */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Parcelas</label>
            <input
              type="number"
              {...register('remainingInstallments', { valueAsNumber: true })}
              className="block w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-slate-50 transition-colors"
              placeholder="Ex: 12"
            />
            {errors.remainingInstallments && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.remainingInstallments.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vencimento</label>
            <input
              type="date"
              {...register('dueDate')}
              className="block w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-slate-50 transition-colors"
            />
            {errors.dueDate && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.dueDate.message}</span>}
          </div>
        </div>

        {/* Botão de Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="mt-6 w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {isPending ? 'Sincronizando...' : 'Cadastrar Nova Dívida'}
        </button>
      </form>
    </div>
  );
};