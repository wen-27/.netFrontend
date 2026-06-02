import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";

type TopbarProps = {
  sidebarCollapsed: boolean;
  onOpenSidebar: () => void;
  onToggleSidebar: () => void;
};

export function Topbar({ sidebarCollapsed, onOpenSidebar, onToggleSidebar }: TopbarProps) {
  const navigate = useNavigate();
  const { role, userName, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/auth/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-300 bg-white/95 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="h-9 w-9 px-0 lg:hidden" onClick={onOpenSidebar} icon={<Menu className="h-5 w-5" />} aria-label="Abrir menú" />
        <Button
          variant="ghost"
          className="hidden h-9 w-9 px-0 lg:inline-flex"
          onClick={onToggleSidebar}
          icon={sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          aria-label={sidebarCollapsed ? "Mostrar barra de navegación" : "Ocultar barra de navegación"}
          title={sidebarCollapsed ? "Mostrar barra de navegación" : "Ocultar barra de navegación"}
        />
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">{userName}</p>
          <p className="text-xs font-bold text-slate-500">Turno operativo · {role ?? "Sin rol"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 sm:flex">
          <UserCircle className="h-5 w-5" />
        </span>
        <Button variant="secondary" onClick={handleLogout} icon={<LogOut className="h-4 w-4" />}>Salir</Button>
      </div>
    </header>
  );
}
