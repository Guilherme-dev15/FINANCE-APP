import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateDebtForm } from './CreateDebtForm';
import { vi } from 'vitest';

// 1. Criamos um "espião" (mock function) para vigiar se o formulário tenta enviar os dados
const mockCreateDebt = vi.fn();

// 2. Interceptamos o hook do React Query! 
// Quando o formulário pedir o 'useCreateDebt', o Vitest vai entregar essa versão falsa.
vi.mock('../api/useDebts', () => ({
    useCreateDebt: () => ({
        mutateAsync: mockCreateDebt,
        isPending: false,
    }),
}));

describe('CreateDebtForm', () => {
    beforeEach(() => {
        // Limpamos o espião antes de cada teste
        vi.clearAllMocks();
    });

    it('deve bloquear o envio e mostrar erros do Zod se o formulário estiver vazio', async () => {
        // Inicializamos o simulador de usuário
        const user = userEvent.setup();

        // Renderizamos o componente isolado
        render(<CreateDebtForm />);

        // Encontramos o botão de submit (buscando pelo tipo 'submit')
        const submitButton = screen.getByRole('button');

        // Simulamos um clique real do usuário
        await user.click(submitButton);

        // waitFor é necessário porque a validação do react-hook-form é assíncrona
        await waitFor(() => {
            // Afirmamos que a mensagem de erro do Zod apareceu na tela
            expect(screen.getByText('O título deve ter pelo menos 3 caracteres')).toBeInTheDocument();
            expect(screen.getByText('Informe um valor')).toBeInTheDocument();
        });

        // Garantimos que a API falsa NÃO foi chamada, protegendo o backend de lixo
        expect(mockCreateDebt).not.toHaveBeenCalled();
    });
});