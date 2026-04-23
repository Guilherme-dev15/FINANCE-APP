/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEditDebt } from '../api/useDebts';

// O mesmo escudo de segurança que usamos na criação
const editDebtSchema = z.object({
  title: z.string().min(3, 'Mínimo de 3 caracteres'),
  interestRate: z.number().min(0, 'A taxa não pode ser negativa'),
  remainingInstallments: z.number().min(1, 'Mínimo de 1 parcela'),
});

type EditDebtFormData = z.infer<typeof editDebtSchema>;

interface EditDebtModalProps {
  debt: any;
  onClose: () => void;
}

export const EditDebtModal = ({ debt, onClose }: EditDebtModalProps) => {
  const { mutateAsync: editDebt, isPending } = useEditDebt();

  // Preenchemos o formulário com os dados atuais da dívida
  const { register, handleSubmit, formState: { errors } } = useForm<EditDebtFormData>({
    resolver: zodResolver(editDebtSchema),
    defaultValues: {
      title: debt.description || debt.title || '',
      interestRate: debt.interestRate ? Number(debt.interestRate) * 100 : 0, // Converte 0.02 de volta para 2%
      remainingInstallments: debt.remainingInstallments || 12,
    }
  });

const onSubmit = async (data: EditDebtFormData) => {
    try {
      // 🛠️ Enviamos a dívida COMPLETA para o NestJS não reclamar (Erro 400 resolvido)
      const payload = {
        description: data.title,
        originalAmount: debt.originalAmount, // Mantemos o valor que já estava no banco
        currentAmount: debt.currentBalance,  // Mantemos o saldo atual
        interestRate: data.interestRate,     // Enviamos a nova taxa
        remainingInstallments: data.remainingInstallments, // Enviamos as novas parcelas
        dueDate: debt.dueDate,               // Mantemos a data original
        debtType: debt.debtType || 'CREDIT_CARD', // Mantemos o tipo
        status: debt.status || 'pendente'
      };

      await editDebt({ debtId: debt.id || debt._id, data: payload });
      onClose(); 
    } catch (error: any) {
      const backendError = error.response?.data?.message;
      const errorMessage = Array.isArray(backendError) ? backendError.join('\n') : backendError;
      alert(`Erro do Back-end:\n${errorMessage}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800">Ajustar Estratégia</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Novo Título / Credor</label>
            <input
              {...register('title')}
              className="w-full rounded-xl border-slate-200 focus:border-blue-500 p-2.5 border bg-slate-50"
            />
            {errors.title && <span className="text-red-500 text-xs mt-1 block">{errors.title.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nova Taxa (% am)</label>
              <input
                type="number"
                step="0.01"
                {...register('interestRate', { valueAsNumber: true })}
                className="w-full rounded-xl border-slate-200 focus:border-blue-500 p-2.5 border bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parcelas Restantes</label>
              <input
                type="number"
                {...register('remainingInstallments', { valueAsNumber: true })}
                className="w-full rounded-xl border-slate-200 focus:border-blue-500 p-2.5 border bg-slate-50"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="flex-1 py-3 px-4 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};