/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: any | null;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem('@FinanceApp:token', token); // Sincroniza com o nosso Axios
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem('@FinanceApp:token');
        set({ token: null, user: null });
      },
    }),
    { name: 'auth-storage' }
  )
);