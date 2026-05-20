import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { PrioritizedDebtsDashboard } from "./features/debts/components/PrioritizedDebtsDashboard";
import { CashflowDashboard } from "./features/analytics/components/CashflowDashboard"; // 🚀 NOVO: Import do motor de viabilidade
import { useAuthStore } from "./features/auth/store/useAuthStore";
import { Header } from "./features/debts/components/Header";
import type { JSX } from "react";

// 🛡️ Guardião Autenticado (Mantido intacto - Excelente arquitetura)
function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="p-8">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Redirecionamento base: O usuário entra direto no termômetro financeiro */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 📊 NOVA ROTA: O Painel de Fluxo de Caixa Livre (Macro) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <CashflowDashboard />
            </PrivateRoute>
          }
        />

        {/* 🎯 ROTA DE AÇÃO: A "Estratégia Nexus" para renegociação e projeção (Micro) */}
        <Route
          path="/estrategia"
          element={
            <PrivateRoute>
              <PrioritizedDebtsDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
