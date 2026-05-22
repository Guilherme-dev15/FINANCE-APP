import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../auth/store/useAuthStore";

export function Header() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  // Auxiliar para pintar a tab ativa no menu
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 text-white font-black px-2.5 py-1.5 rounded-lg text-sm tracking-tight">
            NX
          </div>
          <span className="font-black text-slate-800 tracking-tight text-lg">
            FinanceApp
          </span>
        </div>

        {/* Links de Navegação do Ecossistema */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold">
          <Link
            to="/dashboard"
            className={`transition-colors ${isActive("/dashboard") ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
          >
            Visão Macro
          </Link>
          <Link
            to="/estrategia"
            className={`transition-colors ${isActive("/estrategia") ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
          >
            Estratégia Nexus
          </Link>
          {/* 🚀 O Novo Link Conectado */}
          <Link
            to="/cofres"
            className={`transition-colors ${isActive("/cofres") ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
          >
            Metas & Cofres
          </Link>
        </nav>
      </div>

      {/* Ações de Usuário */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-600">
          OP
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
        >
          <span>→]</span> Sair
        </button>
      </div>
    </header>
  );
}
