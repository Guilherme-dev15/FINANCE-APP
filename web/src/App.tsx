import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage'; 
import { PrioritizedDebtsDashboard } from './features/debts/components/PrioritizedDebtsDashboard'; 
import { useAuthStore } from './features/auth/store/useAuthStore'; 
import { Header } from './features/debts/components/Header'; 
import type { JSX } from 'react';

// 🛡️ Guardião atualizado
function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = useAuthStore((state) => state.token);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Se tem token, renderiza o Header no topo e o conteúdo (children) embaixo
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              {/* Repare que limpamos as divs de layout daqui, pois foram para dentro do PrivateRoute */}
              <PrioritizedDebtsDashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}