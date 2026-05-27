import { LogOut, Menu, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const navigate = useNavigate();
  const { role, userName, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/auth/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="h-9 w-9 px-0 lg:hidden" onClick={onOpenSidebar} icon={<Menu className="h-5 w-5" />} aria-label="Abrir menú" />
        <div>
          <p className="text-sm font-bold text-slate-900">{userName}</p>
          <p className="text-xs font-medium text-slate-500">{role ?? "Sin rol"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <UserCircle className="hidden h-6 w-6 text-slate-400 sm:block" />
        <Button variant="secondary" onClick={handleLogout} icon={<LogOut className="h-4 w-4" />}>Salir</Button>
      </div>
    </header>
  );
}
