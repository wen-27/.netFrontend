import {
  BarChart3,
  Car,
  ClipboardList,
  CreditCard,
  FileText,
  Gauge,
  History,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";
import { Role } from "../../types/common";

export type NavItem = {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const dashboardByRole: Record<Role, string> = {
  Admin: "/dashboard/admin",
  Receptionist: "/dashboard/reception",
  Mechanic: "/dashboard/mechanic",
  Client: "/dashboard/client",
};

export const navByRole: Record<Role, NavItem[]> = {
  Admin: [
    { label: "Dashboard", path: "/dashboard/admin", icon: Gauge },
    { label: "Clientes", path: "/persons", icon: Users },
    { label: "Vehículos", path: "/vehicles", icon: Car },
    { label: "Órdenes", path: "/service-orders", icon: ClipboardList },
    { label: "Inventario", path: "/parts", icon: Package },
    { label: "Compras", path: "/part-purchases", icon: ShoppingCart },
    { label: "Facturación", path: "/invoices", icon: Receipt },
    { label: "Pagos", path: "/payments", icon: CreditCard },
    { label: "Usuarios y roles", path: "/users", icon: UserCog },
    { label: "Auditoría", path: "/audits", icon: History },
    { label: "Catálogos", path: "/catalogs", icon: Settings },
  ],
  Receptionist: [
    { label: "Dashboard", path: "/dashboard/reception", icon: Gauge },
    { label: "Clientes", path: "/persons", icon: Users },
    { label: "Vehículos", path: "/vehicles", icon: Car },
    { label: "Órdenes", path: "/service-orders", icon: ClipboardList },
    { label: "Asignaciones", path: "/service-orders", icon: Wrench },
    { label: "Facturas", path: "/invoices", icon: FileText },
  ],
  Mechanic: [
    { label: "Mi dashboard", path: "/dashboard/mechanic", icon: Gauge },
    { label: "Mis órdenes", path: "/service-orders", icon: ClipboardList },
    { label: "Trabajo", path: "/service-orders", icon: Wrench },
    { label: "Repuestos usados", path: "/service-orders", icon: Package },
    { label: "Facturas", path: "/invoices", icon: Receipt },
  ],
  Client: [
    { label: "Mi dashboard", path: "/dashboard/client", icon: Gauge },
  ],
};

export const moduleRoles = {
  persons: ["Admin", "Receptionist"] as Role[],
  vehicles: ["Admin", "Receptionist"] as Role[],
  serviceOrders: ["Admin", "Receptionist", "Mechanic"] as Role[],
  parts: ["Admin", "Mechanic"] as Role[],
  purchases: ["Admin"] as Role[],
  invoices: ["Admin", "Receptionist", "Mechanic"] as Role[],
  payments: ["Admin"] as Role[],
  users: ["Admin"] as Role[],
  audits: ["Admin"] as Role[],
  catalogs: ["Admin"] as Role[],
};
