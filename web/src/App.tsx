import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './features/auth/pages/LoginPage';
import { DebtsDashboardPage } from './features/debts/pages/DebtsDashboardPage';
import { useAuthStore } from './features/auth/store/useAuthStore';
import { RegisterPage } from './features/auth/pages/RegisterPage';

const queryClient = new QueryClient();

// Componente para proteger rotas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  return token ? <>{children}</> : <Navigate to="/login" />;
};

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DebtsDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rota padrão redireciona para login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};