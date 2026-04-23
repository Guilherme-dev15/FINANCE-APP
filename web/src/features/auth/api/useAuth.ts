import { useMutation } from '@tanstack/react-query';
import { api } from '../../../config/api'; // Confira se o caminho da sua API está certo

interface RegisterData {
  email: string;
  password: string;
}

// Este é o mensageiro que vai levar o e-mail e senha para o NestJS
export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      // Dispara um POST para a rota de registro do seu Back-end
      const response = await api.post('/auth/register', data);
      return response.data;
    },
  });
};