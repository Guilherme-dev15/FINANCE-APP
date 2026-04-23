/* eslint-disable @typescript-eslint/no-unused-vars */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../../config/api';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    try {
      const response = await api.post('/auth/login', data);
      setAuth(response.data.access_token, response.data.user);
      navigate('/dashboard');
    } catch (error) {
      alert('Falha no login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-black text-white tracking-tighter">Nexus <span className="text-blue-500">Auth</span></h1>
          <p className="text-slate-400 mt-2">Entre na sua central estratégica</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">E-mail</label>
            <input 
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
              placeholder="••••••••"
            />
            {errors.password && <span className="text-red-400 text-xs">{errors.password.message}</span>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm">
          Não tem conta? <Link to="/register" className="text-blue-400 hover:underline">Crie uma agora</Link>
        </p>
      </div>
    </div>
  );
};