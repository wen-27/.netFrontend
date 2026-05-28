import { Activity, AlertTriangle, ClipboardList, CreditCard, Package, Receipt, ShieldCheck, Users } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge";
import { Card } from "../../../shared/components/ui/Card";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { MetricCard } from "../../../shared/components/layout/MetricCard";
import { formatCurrency } from "../../../shared/utils/formatters";
import { mockAudits, mockParts, mockServiceOrders } from "../../../shared/utils/mockData";

export function AdminDashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard administrativo" description="Vista global de taller, inventario, bodega, almacén, facturación, pagos y auditoría." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Órdenes abiertas" value="18" hint="6 con entrega próxima" tone="blue" icon={ClipboardList} />
        <MetricCard label="Completadas del mes" value="42" tone="green" icon={ShieldCheck} />
        <MetricCard label="Facturación del mes" value={formatCurrency(48200000)} tone="indigo" icon={Receipt} />
        <MetricCard label="Pagos pendientes" value="9" tone="amber" icon={CreditCard} />
        <MetricCard label="Repuestos bajo stock" value="7" tone="red" icon={Package} />
        <MetricCard label="Usuarios activos" value="14" tone="blue" icon={Users} />
        <MetricCard label="Eventos auditados" value="128" tone="indigo" icon={Activity} />
        <MetricCard label="Alertas críticas" value="3" tone="red" icon={AlertTriangle} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <h2 className="font-bold text-slate-900">Órdenes recientes</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {mockServiceOrders.map((order) => (
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
            {mockParts.filter((part) => part.currentStock <= part.minimumStock).map((part) => (
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
            {mockAudits.map((event) => (
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
