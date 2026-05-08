import { render, screen } from '@testing-library/react';
import { PrioritizedDebtsDashboard } from './PrioritizedDebtsDashboard';
import { vi } from 'vitest';

// 1. Criamos os dados falsos que simulam o retorno do nosso Backend (NestJS)
const mockPrioritizedDebts = [
    {
        id: '1',
        title: 'Cartão Black Infinity',
        interestRate: 0.15, // 15%
        currentBalance: 15000,
        priorityScore: 9.8,
        recommendation: 'Liquidação Urgente',
    },
    {
        id: '2',
        title: 'Financiamento do Carro',
        interestRate: 0.02, // 2%
        currentBalance: 45000,
        priorityScore: 4.2,
        recommendation: 'Manter parcelas em dia',
    }
];

// 2. Interceptamos o hook de GET (useQuery do React Query)
vi.mock('../api/useDebts', () => ({
    useGetPrioritizedDebts: () => ({
        data: mockPrioritizedDebts,
        isLoading: false,
        isError: false,
    }),
}));

describe('PrioritizedDebtsDashboard', () => {
    it('deve renderizar a dívida mais crítica como Alvo Principal', () => {
        // Renderizamos o componente
        render(<PrioritizedDebtsDashboard />);

        // 3. Verificamos se o Título da dívida pior (Cartão Black) apareceu na tela
        expect(screen.getByText('Cartão Black Infinity')).toBeInTheDocument();

        // 4. Verificamos se o Score de Risco foi formatado e renderizado corretamente
        // Usamos uma Regex /9\.8/ para encontrar o número no meio de outros textos
        expect(screen.getByText(/Liquidação Urgente/i)).toBeInTheDocument();

        // 5. Verificamos se a segunda dívida (Carro) também apareceu na lista secundária
        expect(screen.getByText('Financiamento do Carro')).toBeInTheDocument();
    });

    // Opcional: Aqui poderíamos testar o estado de "Loading", mas vamos focar no caminho feliz por enquanto.
});