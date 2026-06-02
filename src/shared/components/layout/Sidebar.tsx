import { Link, useLocation } from "react-router-dom";
import { ClipboardList, FileText, Gauge, Plus, ShieldCheck, Wrench, X, Zap } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";
import { NavItem, navByRole } from "./navigation";

type SidebarProps = {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
};

export function Sidebar({ open, collapsed, onClose }: SidebarProps) {
  const role = useAuth((state) => state.role) ?? "Client";
  const userName = useAuth((state) => state.userName).toLowerCase();
  const items = getNavItems(role, userName);
  const groupedItems = groupNavItems(items);
  const { pathname, search } = useLocation();
  const currentPath = `${pathname}${search}`;
  const activePath = items
    .filter((item) => {
      const [itemPathname, itemSearch] = item.path.split("?");
      if (itemSearch) return currentPath === item.path;
      return pathname === itemPathname || pathname.startsWith(`${itemPathname}/`);
    })
    .sort((a, b) => b.path.length - a.path.length)[0]?.path;

  return (
    <>
      <div className={cn("fixed inset-0 z-30 bg-slate-950/40 lg:hidden", open ? "block" : "hidden")} onClick={onClose} />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white text-slate-900 transition-[transform,width] duration-200 lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-72",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className={cn("flex h-20 items-center justify-between border-b border-slate-200 px-4", collapsed ? "lg:justify-center lg:px-3" : "")}>
          <div className={cn("flex min-w-0 items-center gap-3", collapsed ? "lg:justify-center" : "")}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-400 text-slate-950 shadow-sm">
              <Wrench className="h-5 w-5" />
            </span>
            <div className={cn("min-w-0", collapsed ? "lg:hidden" : "")}>
              <p className="truncate text-base font-black leading-5 text-slate-950">Bahía Digital</p>
              <p className="text-xs font-black uppercase tracking-wide text-blue-600">Taller inteligente</p>
            </div>
          </div>
          <Button variant="ghost" className="h-9 w-9 px-0 lg:hidden" onClick={onClose} icon={<X className="h-4 w-4" />} aria-label="Cerrar menú" />
        </div>
        <div className={cn("border-b border-slate-200 px-4 py-3", collapsed ? "lg:hidden" : "")}>
          <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-wide text-slate-500">Panel activo</p>
              <p className="truncate text-sm font-black text-slate-950">{role}</p>
            </div>
          </div>
        </div>
        <div className="h-1 bg-amber-400" />
        <nav className={cn("flex-1 space-y-4 overflow-y-auto px-3 py-4", collapsed ? "lg:px-2" : "")}>
          {groupedItems.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className={cn("px-3 text-[11px] font-black uppercase tracking-wide text-slate-400", collapsed ? "lg:sr-only" : "")}>{group.label}</p>
              {group.items.map((item) => {
                const isActive = activePath === item.path;
                return (
                  <Link
                    key={`${item.path}-${item.label}`}
                    to={item.path}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-colors",
                      collapsed ? "lg:justify-center lg:px-0" : "",
                      isActive
                        ? "bg-amber-50 text-slate-950 shadow-sm ring-1 ring-amber-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-600" : "text-slate-500 group-hover:text-amber-600")} />
                    <span className={cn("min-w-0 flex-1", collapsed ? "lg:sr-only" : "")}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

function groupNavItems(items: NavItem[]) {
  const groups = [
    { label: "Inicio", match: ["Dashboard", "Mi dashboard", "Dashboard stock", "Dashboard inventario"], items: [] as NavItem[] },
    { label: "Operación", match: ["Órdenes", "Mis órdenes", "Órdenes activas", "Pendientes de aprobación", "Solicitudes", "Diagnósticos", "Mantenimiento", "Electricidad", "Frenos", "Servicios"], items: [] as NavItem[] },
    { label: "Clientes y vehículos", match: ["Clientes", "Vehículos", "Historial"], items: [] as NavItem[] },
    { label: "Inventario", match: ["Inventario", "Bodega", "Almacén", "Stock", "Reposiciones", "Bajo stock", "Catálogo maestro", "Revisión"], items: [] as NavItem[] },
    { label: "Finanzas", match: ["Facturación", "Facturas", "Pagos", "Entregas"], items: [] as NavItem[] },
    { label: "Administración", match: ["Usuarios", "Auditoría", "Catálogos"], items: [] as NavItem[] },
  ];

  for (const item of items) {
    const group = groups.find((candidate) => candidate.match.some((label) => item.label.includes(label)));
    (group ?? groups[1]).items.push(item);
  }

  return groups.filter((group) => group.items.length > 0);
}

function getNavItems(role: keyof typeof navByRole, userName: string): NavItem[] {
  if (role !== "Mechanic") return navByRole[role];

  if (userName.includes("diagnostico") || userName.includes("diagnostic")) {
    return [
      { label: "Mi dashboard", path: "/dashboard/mechanic", icon: Gauge },
      { label: "Crear orden diagnóstico", path: "/mechanic/orders/new-diagnostic", icon: Plus },
      { label: "Mis diagnósticos", path: "/mechanic/diagnostics", icon: FileText },
      { label: "Órdenes del jefe", path: "/mechanic/chief-orders", icon: ClipboardList },
      { label: "Mis solicitudes", path: "/mechanic/requests", icon: FileText },
    ];
  }

  if (userName.includes("electricista") || userName.includes("electric")) {
    return [
      { label: "Mi dashboard", path: "/dashboard/mechanic", icon: Gauge },
      { label: "Electricidad", path: "/mechanic/electricity", icon: Zap },
      { label: "Mis solicitudes", path: "/mechanic/requests", icon: FileText },
    ];
  }

  if (userName.includes("frenos") || userName.includes("brakes")) {
    return [
      { label: "Mi dashboard", path: "/dashboard/mechanic", icon: Gauge },
      { label: "Frenos", path: "/mechanic/brakes", icon: ClipboardList },
      { label: "Mis solicitudes", path: "/mechanic/requests", icon: FileText },
    ];
  }

  return [
    { label: "Mi dashboard", path: "/dashboard/mechanic", icon: Gauge },
    { label: "Mantenimiento", path: "/mechanic/maintenance", icon: Wrench },
    { label: "Mis solicitudes", path: "/mechanic/requests", icon: FileText },
  ];
}
