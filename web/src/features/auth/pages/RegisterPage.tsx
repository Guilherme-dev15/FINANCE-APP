import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '../api/useAuth'; 
import { useNavigate, Link } from 'react-router-dom';

const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"], 
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const { mutateAsync: registerUser, isPending } = useRegister();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({ email: data.email, password: data.password });
      alert('Conta criada com sucesso! Faça login para entrar.');
      navigate('/login'); 
    } catch {
      alert('Erro ao criar conta. Verifique os dados.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-black text-white tracking-tighter">Novo <span className="text-blue-500">Agente</span></h1>
          <p className="text-slate-400 mt-2">Crie sua conta no Nexus</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">E-mail</label>
            <input
              type="email"
              {...register('email')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="seu@email.com"
            />
            {errors.email && <span className="text-red-400 text-xs">{errors.email.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Senha</label>
            <input
              type="password"
              {...register('password')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && <span className="text-red-400 text-xs">{errors.password.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Confirmar Senha</label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Repita a senha"
            />
            {errors.confirmPassword && <span className="text-red-400 text-xs">{errors.confirmPassword.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? 'CRIANDO ACESSO...' : 'CRIAR MINHA CONTA'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm">
          Já tem uma conta? <Link to="/login" className="text-blue-400 hover:underline">Faça login agora</Link>
        </p>
      </div>
    </div>
  );
};