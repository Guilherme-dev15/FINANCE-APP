/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDebt, useEditDebt } from '../api/useDebts';

// --- Schema de Validação ---
const debtSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  originalAmount: z.number({ message: 'Informe um valor' }).positive('O valor não pode ser zero ou negativo'),
  interestRate: z.number({ message: 'Informe uma taxa' }).min(0, 'A taxa não pode ser negativa'),
  remainingInstallments: z.number({ message: 'Informe as parcelas' }).min(1, 'Mínimo de 1 parcela'),
  dueDate: z.string().min(1, 'A data de vencimento é obrigatória'),
  debtType: z.enum(['CREDIT_CARD', 'LOAN']),
  status: z.enum(['pendente', 'em negociação', 'pago']),
});

type DebtFormData = z.infer<typeof debtSchema>;

// 🚀 Adicionamos initialData para saber se é Edição
interface CreateDebtFormProps {
  onSuccessAction?: () => void;
  initialData?: any | null; 
}

export const CreateDebtForm = ({ onSuccessAction, initialData }: CreateDebtFormProps) => {
  const { mutateAsync: createDebt, isPending: isCreating } = useCreateDebt();
  const { mutateAsync: editDebt, isPending: isEditing } = useEditDebt();
  
  const isPending = isCreating || isEditing;
  const isEditMode = !!initialData;

  // 🚀 Mágica do React Hook Form: Se initialData existir, ele preenche tudo sozinho
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    values: initialData ? {
      title: initialData.title || initialData.description || '',
      originalAmount: initialData.originalAmount || initialData.currentBalance || 0,
      interestRate: (initialData.interestRate || 0) * 100, // Converte 0.05 de volta para 5% na tela
      remainingInstallments: initialData.remainingInstallments || 1,
      dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
      debtType: initialData.debtType || 'CREDIT_CARD',
      status: initialData.status || 'pendente',
    } : undefined,
    defaultValues: {
      debtType: 'CREDIT_CARD',
      status: 'pendente' 
    }
  });

  const onSubmit = async (data: DebtFormData) => {
    try {
      const payload = {
        description: data.title,
        originalAmount: data.originalAmount,
        currentAmount: data.originalAmount,
        interestRate: data.interestRate / 100,
        remainingInstallments: data.remainingInstallments,
        dueDate: new Date(data.dueDate).toISOString(),
        debtType: data.debtType,
        status: data.status 
      };

      if (isEditMode) {
        // Fluxo de Atualização
        const debtId = initialData._id || initialData.id;
        await editDebt({ debtId, data: payload });
      } else {
        // Fluxo de Criação
        await createDebt(payload as any);
      }
      
      reset(); 
      if (onSuccessAction) onSuccessAction();
      
    } catch (error: any) {
      const backendError = error.response?.data?.message;
      const errorMessage = Array.isArray(backendError) ? backendError.join('\n- ') : backendError;
      alert(`⚠️ Falha na operação:\n\n- ${errorMessage || 'Erro de conexão com a API'}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
          {isEditMode ? 'Editar Título' : 'Novo Título'}
        </h3>
        <p className="text-zinc-500 text-sm mt-1">
          {isEditMode ? 'Ajuste as informações da dívida selecionada.' : 'Cadastre a dívida com detalhes completos para a análise do motor Nexus.'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Título / Credor</label>
          <input type="text" {...register('title')} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Ex: Cartão Nubank" />
          {errors.title && <span className="text-rose-500 text-xs mt-1.5 font-medium">{errors.title.message}</span>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Tipo de Dívida</label>
            <select {...register('debtType')} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
              <option value="CREDIT_CARD">Cartão de Crédito</option>
              <option value="LOAN">Empréstimo</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Status</label>
            <select {...register('status')} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
              <option value="pendente">Pendente</option>
              <option value="em negociação">Em Negociação</option>
              <option value="pago">Pago</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Valor Original (R$)</label>
            <input type="number" step="0.01" {...register('originalAmount', { valueAsNumber: true })} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="5000.00" />
            {errors.originalAmount && <span className="text-rose-500 text-xs mt-1.5 font-medium">{errors.originalAmount.message}</span>}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Juros (% am)</label>
            <input type="number" step="0.01" {...register('interestRate', { valueAsNumber: true })} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="5.5" />
            {errors.interestRate && <span className="text-rose-500 text-xs mt-1.5 font-medium">{errors.interestRate.message}</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Parcelas Restantes</label>
            <input type="number" {...register('remainingInstallments', { valueAsNumber: true })} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Ex: 12" />
            {errors.remainingInstallments && <span className="text-rose-500 text-xs mt-1.5 font-medium">{errors.remainingInstallments.message}</span>}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Vencimento</label>
            <input type="date" {...register('dueDate')} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            {errors.dueDate && <span className="text-rose-500 text-xs mt-1.5 font-medium">{errors.dueDate.message}</span>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2 active:scale-95 cursor-pointer"
        >
          {isPending ? 'Sincronizando...' : isEditMode ? 'Salvar Alterações' : 'Cadastrar Título'}
        </button>
      </form>
    </div>
  );
};