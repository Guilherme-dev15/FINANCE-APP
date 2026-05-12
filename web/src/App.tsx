import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage'; // Ajuste o caminho se precisar
import { PrioritizedDebtsDashboard } from './features/debts/components/PrioritizedDebtsDashboard'; // Ajuste o caminho
import { useAuthStore } from './features/auth/store/useAuthStore'; // Ajuste o caminho
import type { JSX } from 'react';

// 🛡️ Guardião de Rota: Só deixa passar se tiver o token no Zustand
function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = useAuthStore((state) => state.token);
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* 🛡️ Redireciona a raiz para o dashboard automaticamente */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 🚀 A Rota Protegida (O Painel Principal) */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-4xl mx-auto">
                  <PrioritizedDebtsDashboard />
                </div>
              </div>
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}