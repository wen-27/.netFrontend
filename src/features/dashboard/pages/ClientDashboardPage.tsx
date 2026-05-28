import { CalendarClock, Car, ClipboardList, CreditCard, History, MessageSquare, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "../../../shared/components/ui/Badge";
import { Card } from "../../../shared/components/ui/Card";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { MetricCard } from "../../../shared/components/layout/MetricCard";
import { invoicesService } from "../../invoices/services/invoicesService";
import { operationsService } from "../../operations/services/operationsService";
import { getPaymentStatusLabel, getPaymentStatusTone } from "../../../shared/utils/statusLabels";

export function ClientDashboardPage() {
  const params = { pageNumber: 1, pageSize: 50 };
  const { data: orders = [] } = useQuery({ queryKey: ["dashboard-client-orders"], queryFn: operationsService.getClientOrders });
  const { data: approvals = [] } = useQuery({ queryKey: ["dashboard-client-approvals"], queryFn: operationsService.getClientPendingApprovals });
  const { data: messages = [] } = useQuery({ queryKey: ["dashboard-client-messages"], queryFn: operationsService.getClientMessages });
  const { data: invoices } = useQuery({ queryKey: ["dashboard-client-invoices"], queryFn: () => invoicesService.listClient(params) });
  const invoiceItems = invoices?.data ?? [];
  const activeOrders = orders.filter((order) => !["Delivered", "Cancelled"].includes(String(order.status)));
  const pendingOrders = orders.filter((order) => ["WaitingForPayment", "PaymentUnderReview", "PendingClientApproval"].includes(String(order.status)));
  const pendingInvoices = invoiceItems.filter((invoice) => ["PendingPayment", "PendingReceptionVerification", "Pending"].includes(String(invoice.paymentStatus)));
  return (
    <>
      <PageHeader title="Mi dashboard" description="Órdenes activas, aprobaciones, facturas pendientes, pagos y mensajes del taller." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Órdenes activas" value={String(activeOrders.length)} tone="blue" icon={Car} />
        <MetricCard label="Órdenes pendientes" value={String(pendingOrders.length)} tone="amber" icon={CalendarClock} />
        <MetricCard label="Servicios por aprobar" value={String(approvals.length)} tone="indigo" icon={Wrench} />
        <MetricCard label="Facturas pendientes" value={String(pendingInvoices.length)} tone="red" icon={CreditCard} />
        <MetricCard label="Historial de órdenes" value={String(orders.length)} tone="green" icon={History} />
        <MetricCard label="Mensajes del Jefe de Taller" value={String(messages.length)} tone="blue" icon={MessageSquare} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-bold text-slate-900">Mis órdenes activas</h2>
          <div className="mt-4 space-y-3">
            {activeOrders.map((order) => (
              <div key={order.id} className="rounded-md border border-slate-200 p-3">
                <p className="font-semibold text-slate-900">{order.vehicle}</p>
                <p className="text-sm text-slate-500">{order.code} · {order.status}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold text-slate-900">Facturas pendientes</h2>
          <div className="mt-4 space-y-3">
            {pendingInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                <span className="font-semibold text-slate-900">{invoice.number}</span>
                <Badge tone={getPaymentStatusTone(invoice.paymentStatus)}>{getPaymentStatusLabel(invoice.paymentStatus)}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
