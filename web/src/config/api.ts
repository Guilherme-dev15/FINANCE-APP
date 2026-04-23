import axios from 'axios';

// Cria a instância base do Axios
export const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição: Injeta o JWT antes da chamada sair
api.interceptors.request.use(
  (config) => {
    // Pegamos o token de onde estivermos armazenando (Zustand, LocalStorage ou Cookies)
    const token = localStorage.getItem('@FinanceApp:token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Resposta: Trata erros globais (ex: Token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Aqui você pode disparar um evento para deslogar o usuário e mandar pro /login
      console.error('Token expirado ou inválido. Deslogando...');
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);