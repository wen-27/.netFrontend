import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";
import { navByRole } from "./navigation";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const role = useAuth((state) => state.role) ?? "Client";
  const items = navByRole[role];

  return (
    <>
      <div className={cn("fixed inset-0 z-30 bg-slate-950/40 lg:hidden", open ? "block" : "hidden")} onClick={onClose} />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <div>
            <p className="text-sm font-black text-slate-950">AutoTaller</p>
            <p className="text-xs font-semibold text-blue-600">Manager</p>
          </div>
          <Button variant="ghost" className="h-9 w-9 px-0 lg:hidden" onClick={onClose} icon={<X className="h-4 w-4" />} aria-label="Cerrar menú" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => (
            <NavLink
              key={`${item.path}-${item.label}`}
              to={item.path}
              end={item.path === "/service-orders"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition",
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
