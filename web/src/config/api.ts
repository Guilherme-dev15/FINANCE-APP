import axios from 'axios';
import { useAuthStore } from '../features/auth/store/useAuthStore'; // 👈 Ajuste este caminho se necessário

// Cria a instância base do Axios apontando para o nosso NestJS
export const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição: Injeta o JWT antes da chamada sair
api.interceptors.request.use(
  (config) => {
    // Pegamos o token direto do estado global do Zustand (Cofre que testamos hoje)
    const token = useAuthStore.getState().token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Resposta: Trata erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('🔒 Token expirado ou inválido. Acionando protocolo de Logout...');
      // Dispara a função do Zustand. Ele limpa o estado, o localStorage e o React redireciona o usuário.
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);