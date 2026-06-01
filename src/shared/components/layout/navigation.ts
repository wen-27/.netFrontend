import {
  BarChart3,
  Boxes,
  Car,
  ClipboardList,
  CreditCard,
  FileText,
  Gauge,
  History,
  MessageSquare,
  Package,
  PackageCheck,
  PackageSearch,
  Plus,
  Receipt,
  Settings,
  ShoppingCart,
  Send,
  Store,
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
  WorkshopChief: "/dashboard/workshop-chief",
  WarehouseChief: "/dashboard/warehouse-chief",
  InventoryManager: "/dashboard/inventory-manager",
};

export const navByRole: Record<Role, NavItem[]> = {
  Admin: [
    { label: "Dashboard", path: "/dashboard/admin", icon: Gauge },
    { label: "Clientes", path: "/persons", icon: Users },
    { label: "Vehículos", path: "/vehicles", icon: Car },
    { label: "Órdenes", path: "/service-orders", icon: ClipboardList },
    { label: "Inventario", path: "/parts", icon: Package },
    { label: "Bodega", path: "/warehouse/products", icon: Store },
    { label: "Almacén", path: "/inventory/products", icon: Boxes },
    { label: "Servicios del taller", path: "/workshop/services", icon: Wrench },
    { label: "Facturación", path: "/invoices", icon: Receipt },
    { label: "Pagos", path: "/payments", icon: CreditCard },
    { label: "Usuarios y roles", path: "/users", icon: UserCog },
    { label: "Auditoría", path: "/audits", icon: History },
    { label: "Catálogos", path: "/catalogs", icon: Settings },
  ],
  Receptionist: [
    { label: "Dashboard", path: "/dashboard/reception", icon: Gauge },
    { label: "Facturas", path: "/invoices", icon: FileText },
    { label: "Entregas", path: "/reception/deliveries", icon: PackageCheck },
  ],
  Mechanic: [
    { label: "Mi dashboard", path: "/dashboard/mechanic", icon: Gauge },
    { label: "Crear orden diagnóstico", path: "/mechanic/orders/new-diagnostic", icon: Plus },
    { label: "Mis diagnósticos", path: "/mechanic/diagnostics", icon: FileText },
    { label: "Órdenes del jefe", path: "/mechanic/chief-orders", icon: ClipboardList },
    { label: "Mis solicitudes", path: "/mechanic/requests", icon: FileText },
  ],
  Client: [
    { label: "Mi dashboard", path: "/dashboard/client", icon: Gauge },
    { label: "Mis órdenes", path: "/client/orders", icon: ClipboardList },
    { label: "Órdenes por aprobar", path: "/client/approvals", icon: FileText },
    { label: "Solicitudes de órdenes", path: "/client/order-requests", icon: MessageSquare },
    { label: "Facturas", path: "/invoices", icon: Receipt },
    { label: "Pagos", path: "/client/payments", icon: CreditCard },
    { label: "Mensajes", path: "/client/messages", icon: MessageSquare },
    { label: "Historial", path: "/client/history", icon: History },
  ],
  WorkshopChief: [
    { label: "Dashboard", path: "/dashboard/workshop-chief", icon: Gauge },
    { label: "Solicitudes de mecánicos", path: "/workshop-chief/requests", icon: FileText },
    { label: "Diagnósticos por aprobar", path: "/workshop-chief/diagnostics", icon: ClipboardList },
    { label: "Historial diagnósticos", path: "/workshop-chief/diagnostics/history", icon: History },
    { label: "Servicios del taller", path: "/workshop/services", icon: Wrench },
    { label: "Órdenes activas", path: "/service-orders", icon: ClipboardList },
    { label: "Pendientes de aprobación", path: "/service-orders/pending-approval", icon: Send },
  ],
  WarehouseChief: [
    { label: "Dashboard stock", path: "/dashboard/warehouse-chief", icon: Gauge },
    { label: "Stock operativo", path: "/warehouse/products", icon: Package },
    { label: "Solicitar reposición", path: "/warehouse/products/new", icon: ShoppingCart },
    { label: "Reposiciones enviadas", path: "/warehouse/stock-submissions", icon: Send },
    { label: "Bajo stock", path: "/parts/low-stock", icon: BarChart3 },
  ],
  InventoryManager: [
    { label: "Dashboard inventario", path: "/dashboard/inventory-manager", icon: Gauge },
    { label: "Revisión de stock", path: "/inventory/review", icon: PackageSearch },
    { label: "Catálogo maestro", path: "/inventory/products", icon: PackageCheck },
    { label: "Historial de inventario", path: "/inventory/history", icon: History },
  ],
};

export const moduleRoles = {
  persons: ["Admin", "Receptionist"] as Role[],
  vehicles: ["Admin", "Receptionist"] as Role[],
  serviceOrders: ["Admin", "Mechanic", "WorkshopChief"] as Role[],
  parts: ["Admin", "InventoryManager"] as Role[],
  purchases: ["Admin", "WarehouseChief"] as Role[],
  invoices: ["Admin", "Receptionist", "Client"] as Role[],
  payments: ["Admin", "Receptionist", "Client"] as Role[],
  users: ["Admin"] as Role[],
  audits: ["Admin"] as Role[],
  catalogs: ["Admin"] as Role[],
  mechanic: ["Admin", "Mechanic"] as Role[],
  workshopChief: ["Admin", "WorkshopChief"] as Role[],
  workshopServices: ["Admin", "WorkshopChief"] as Role[],
  client: ["Admin", "Client"] as Role[],
  warehouse: ["Admin", "WarehouseChief"] as Role[],
  inventory: ["Admin", "InventoryManager"] as Role[],
  reception: ["Admin", "Receptionist"] as Role[],
};
