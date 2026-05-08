import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { describe, expect, it, vi } from 'vitest';

// 1. Mockamos o React Router para isolar o componente (o teste não precisa navegar de verdade)
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('LoginPage', () => {
  it('deve renderizar os campos de email, senha e o botão de login', () => {
    // 2. Renderizamos a página dentro de um Router falso em memória
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // 3. Afirmamos (Assert) que os elementos vitais estão na tela
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ENTRAR/i })).toBeInTheDocument();
  });
});