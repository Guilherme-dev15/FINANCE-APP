import { useAuthStore } from "../../auth/store/useAuthStore"; // Ajuste o caminho!
import { NavLink } from "react-router-dom"; // 🚀 IMPORTANTE: O motor da fluidez

export const Header = () => {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    if (window.confirm("Tem certeza que deseja encerrar a sessão?")) {
      logout();
    }
  };

  // 🎨 Estilo dinâmico: Fica escuro quando a rota está ativa, e cinza claro quando inativo.
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-bold transition-colors ${
      isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-700"
    }`;

  return (
    <header className="w-full bg-white border-b border-slate-200 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Lado Esquerdo: Marca & Menu de Navegação */}
        <div className="flex items-center gap-8">
          {/* Logo / Marca */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">NX</span>
            </div>
            <span className="font-bold text-slate-800 tracking-tight">
              FinanceApp
            </span>
          </div>

          {/* 🧭 Navegação Fluida (Oculta em telas muito pequenas, visível em tablets/desktop) */}
          <nav className="hidden md:flex items-center gap-6 border-l border-slate-200 pl-6">
            <NavLink to="/dashboard" className={navLinkClass}>
              Visão Macro
            </NavLink>
            <NavLink to="/estrategia" className={navLinkClass}>
              Estratégia Nexus
            </NavLink>
          </nav>
        </div>

        {/* Lado Direito: Área do Usuário & Logout */}
        <div className="flex items-center gap-6">
          {/* Avatar Fake */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
              <span className="text-slate-500 font-bold text-xs">OP</span>
            </div>
          </div>

          {/* Botão de Sair */}
          <button
            onClick={handleLogout}
            className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};
