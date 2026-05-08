import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from './useAuthStore';

describe('useAuthStore (Zustand)', () => {
  // Limpamos a "sujeira" antes de cada teste para garantir isolamento
  beforeEach(() => {
    localStorage.clear();
    const store = useAuthStore.getState();
    store.logout(); 
  });

  it('deve inicializar com token e user nulos (Estado Limpo)', () => {
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('deve salvar o token/user no estado e persistir no localStorage (Login)', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockToken = 'jwt-akita-token-123';
    const mockUser = { id: 'user-777', email: 'guilherme@buildtoearn.com' };

    // Usamos o act() sempre que vamos disparar uma função que altera o estado do React/Zustand
    act(() => {
      result.current.setAuth(mockToken, mockUser);
    });

    // Verifica se o estado interno atualizou
    expect(result.current.token).toBe(mockToken);
    expect(result.current.user).toEqual(mockUser);
    
    // Verifica se o interceptor do Axios vai conseguir achar esse token na vida real
    expect(localStorage.getItem('@FinanceApp:token')).toBe(mockToken);
  });

  it('deve limpar o estado e varrer o localStorage (Logout)', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setAuth('token-temporario', { id: '1' });
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('@FinanceApp:token')).toBeNull();
  });
});