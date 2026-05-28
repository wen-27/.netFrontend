import { Activity, AlertTriangle, ClipboardList, CreditCard, Package, Receipt, ShieldCheck, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "../../../shared/components/ui/Badge";
import { Card } from "../../../shared/components/ui/Card";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { MetricCard } from "../../../shared/components/layout/MetricCard";
import { formatCurrency } from "../../../shared/utils/formatters";
import { auditsService } from "../../audits/services/auditsService";
import { invoicesService } from "../../invoices/services/invoicesService";
import { partsService } from "../../parts/services/partsService";
import { serviceOrdersService } from "../../service-orders/services/serviceOrdersService";
import { usersService } from "../../users/services/usersService";

export function AdminDashboardPage() {
  const params = { pageNumber: 1, pageSize: 50 };
  const { data: orders } = useQuery({ queryKey: ["dashboard-admin-orders"], queryFn: () => serviceOrdersService.list(params) });
  const { data: parts } = useQuery({ queryKey: ["dashboard-admin-parts"], queryFn: () => partsService.list(params) });
  const { data: invoices } = useQuery({ queryKey: ["dashboard-admin-invoices"], queryFn: () => invoicesService.list(params) });
  const { data: users } = useQuery({ queryKey: ["dashboard-admin-users"], queryFn: () => usersService.list(params) });
  const { data: audits } = useQuery({ queryKey: ["dashboard-admin-audits"], queryFn: () => auditsService.list(params) });
  const orderItems = orders?.data ?? [];
  const partItems = parts?.data ?? [];
  const auditItems = audits?.data ?? [];
  const invoiceItems = invoices?.data ?? [];
  const lowStockParts = partItems.filter((part) => part.currentStock <= part.minimumStock);
  const openOrders = orderItems.filter((order) => !["Delivered", "Cancelled", "Completed"].includes(String(order.status)));
  const completedOrders = orderItems.filter((order) => ["Delivered", "Completed", "ReadyForDelivery"].includes(String(order.status)));
  const pendingPayments = invoiceItems.filter((invoice) => ["PendingPayment", "PendingReceptionVerification", "Pending"].includes(String(invoice.paymentStatus)));
  const totalBilling = invoiceItems.reduce((total, invoice) => total + Number(invoice.total ?? 0), 0);
  return (
    <>
      <PageHeader title="Dashboard administrativo" description="Vista global de taller, inventario, bodega, almacén, facturación, pagos y auditoría." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Órdenes abiertas" value={String(openOrders.length)} tone="blue" icon={ClipboardList} />
        <MetricCard label="Completadas" value={String(completedOrders.length)} tone="green" icon={ShieldCheck} />
        <MetricCard label="Facturación registrada" value={formatCurrency(totalBilling)} tone="indigo" icon={Receipt} />
        <MetricCard label="Pagos pendientes" value={String(pendingPayments.length)} tone="amber" icon={CreditCard} />
        <MetricCard label="Repuestos bajo stock" value={String(lowStockParts.length)} tone="red" icon={Package} />
        <MetricCard label="Usuarios cargados" value={String(users?.totalCount ?? 0)} tone="blue" icon={Users} />
        <MetricCard label="Eventos auditados" value={String(audits?.totalCount ?? 0)} tone="indigo" icon={Activity} />
        <MetricCard label="Alertas críticas" value={String(lowStockParts.length)} tone="red" icon={AlertTriangle} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <h2 className="font-bold text-slate-900">Órdenes recientes</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {orderItems.slice(0, 8).map((order) => (
              <div key={order.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{order.code}</p>
                  <p className="text-sm text-slate-500">{order.customer} · {order.vehicle}</p>
                </div>
                <Badge tone={order.status === "Completada" ? "green" : String(order.status).includes("repuestos") ? "amber" : "blue"}>{order.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold text-slate-900">Inventario crítico</h2>
          <div className="mt-4 space-y-3">
            {lowStockParts.map((part) => (
              <div key={part.id} className="rounded-md border border-amber-100 bg-amber-50 p-3">
                <p className="font-semibold text-amber-900">{part.description}</p>
                <p className="text-sm text-amber-700">Disponible: {part.currentStock} · Mínimo: {part.minimumStock}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 xl:col-span-3">
          <h2 className="font-bold text-slate-900">Auditoría reciente</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {auditItems.slice(0, 6).map((event) => (
              <div key={event.id} className="rounded-md border border-indigo-100 bg-indigo-50 p-3">
                <p className="font-semibold text-indigo-900">{event.action} · {event.entity}</p>
                <p className="text-sm text-indigo-700">{event.user} desde {event.origin}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
